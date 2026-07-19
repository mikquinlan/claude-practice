"""Orchestration: build options, run the coordinator query, stream output, log cost."""

from __future__ import annotations

import os
from dataclasses import dataclass

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    PermissionResultAllow,
    PermissionResultDeny,
    ResultMessage,
    TextBlock,
    ToolPermissionContext,
    ToolUseBlock,
    query,
)

from .agents import build_agents, coordinator_system_prompt
from .context import TASK_DIR, within_task_dir
from .tools import branding_server


@dataclass
class RunResult:
    proposal_path: str
    risk_html_path: str
    total_cost_usd: float | None
    num_turns: int | None
    duration_ms: int | None
    usage: dict | None
    model_usage: dict | None


async def _gate_tool(
    tool_name: str, tool_input: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    """Non-interactive permission gate: auto-allow the allowlisted tools, but confine
    file writes to TASK_DIR so a worker can't write outside the project sandbox."""
    if tool_name == "Write":
        path = tool_input.get("file_path", "")
        if not path or not within_task_dir(path):
            return PermissionResultDeny(
                message=f"Write blocked: {path!r} is outside the project directory ({TASK_DIR}).",
            )
    return PermissionResultAllow()


def _build_options(model: str) -> ClaudeAgentOptions:
    return ClaudeAgentOptions(
        model=model,
        system_prompt=coordinator_system_prompt(),
        agents=build_agents(),
        mcp_servers={"branding": branding_server()},
        allowed_tools=[
            "Task",
            "Read",
            "Write",
            "Glob",
            "Grep",
            "mcp__branding__generate_branded_docx",
        ],
        # Self-contained: ignore Claude Code's own agents/skills so the SDK build is
        # the sole source of truth. cwd anchors all relative Read/Write/output paths.
        setting_sources=[],
        # Non-interactive run, but NOT bypassPermissions: the can_use_tool gate below
        # auto-allows the allowlisted tools while confining Write to TASK_DIR.
        permission_mode="default",
        can_use_tool=_gate_tool,
        cwd=str(TASK_DIR),
    )


def _initial_prompt(rfp_path: str, customer: str, date: str, out_dir: str) -> str:
    slug = customer.lower().replace(" ", "-")
    return f"""An inbound RFP has arrived. Run the full deal-desk process.

- RFP file (read it first): {rfp_path}
- Customer: {customer}
- Date: {date}
- Proposal output: {out_dir}/proposal-{slug}-{date}.docx
- Risk assessment output: {out_dir}/risk-assessment-{slug}-{date}.html

Delegate to the four specialists in parallel, synthesise a branded proposal .docx
via the branding tool, then commission the internal risk HTML from the risk
specialist. Confirm both artifacts exist before reporting completion.
"""


async def run_swarm(
    rfp_path: str,
    customer: str,
    date: str,
    out_dir: str,
    model: str = "sonnet",
    stream: bool = True,
) -> RunResult:
    slug = customer.lower().replace(" ", "-")
    proposal_path = str(TASK_DIR / out_dir / f"proposal-{slug}-{date}.docx")
    risk_html_path = str(TASK_DIR / out_dir / f"risk-assessment-{slug}-{date}.html")

    options = _build_options(model)
    prompt = _initial_prompt(rfp_path, customer, date, out_dir)

    # can_use_tool requires streaming mode → prompt must be an AsyncIterable of
    # message dicts, not a bare string.
    async def _prompt_stream():
        yield {
            "type": "user",
            "session_id": "",
            "message": {"role": "user", "content": prompt},
            "parent_tool_use_id": None,
        }

    result: ResultMessage | None = None
    async for message in query(prompt=_prompt_stream(), options=options):
        if isinstance(message, AssistantMessage) and stream:
            for block in message.content:
                if isinstance(block, TextBlock):
                    if block.text.strip():
                        print(block.text, flush=True)
                elif isinstance(block, ToolUseBlock):
                    _print_tool_use(block)
        elif isinstance(message, ResultMessage):
            result = message

    return RunResult(
        proposal_path=proposal_path,
        risk_html_path=risk_html_path,
        total_cost_usd=getattr(result, "total_cost_usd", None),
        num_turns=getattr(result, "num_turns", None),
        duration_ms=getattr(result, "duration_ms", None),
        usage=getattr(result, "usage", None),
        model_usage=getattr(result, "model_usage", None),
    )


def _print_tool_use(block: ToolUseBlock) -> None:
    name = block.name
    inp = block.input or {}
    if name == "Task":
        who = inp.get("subagent_type", "?")
        print(f"  ▸ delegating to specialist: {who}", flush=True)
    elif name.endswith("generate_branded_docx"):
        print(f"  ▸ generating branded proposal: {inp.get('output_path', '?')}", flush=True)
    elif name in ("Write",):
        print(f"  ▸ writing: {inp.get('file_path', '?')}", flush=True)
    else:
        print(f"  ▸ tool: {name}", flush=True)


def print_cost_summary(res: RunResult) -> None:
    print("\n" + "=" * 60)
    print("RUN COST SUMMARY")
    print("=" * 60)
    if res.total_cost_usd is not None:
        print(f"  total_cost_usd : ${res.total_cost_usd:.4f}")
    print(f"  num_turns      : {res.num_turns}")
    if res.duration_ms is not None:
        print(f"  duration       : {res.duration_ms / 1000:.1f}s")
    if res.model_usage:
        print("  per-model usage:")
        for model, u in res.model_usage.items():
            cost = u.get("costUSD") if isinstance(u, dict) else None
            cost_s = f" (${cost:.4f})" if isinstance(cost, (int, float)) else ""
            print(f"    - {model}{cost_s}")
    print("=" * 60)
    print("  Task A baselines: single-prompt $0.88 / agent-team $2.60 / dynamic $1.79")
    print("=" * 60)


def verify_artifacts(res: RunResult) -> bool:
    ok = True
    for label, path in (("proposal .docx", res.proposal_path), ("risk .html", res.risk_html_path)):
        exists = os.path.isfile(path)
        size = os.path.getsize(path) if exists else 0
        status = "OK" if exists and size > 0 else "MISSING"
        print(f"  [{status}] {label}: {path} ({size} bytes)")
        ok = ok and exists and size > 0
    return ok

"""Build the five specialist AgentDefinitions and the coordinator system prompt.

Each worker's system prompt is the verbatim body of its `.claude/agents/*.md`
file, with its owning skill / reference file injected. Keys are snake_case so the
coordinator's Task delegations match (fixes the `technical-fit`/`technical_fit`
filename-vs-name mismatch in the original config).
"""

from __future__ import annotations

from claude_agent_sdk import AgentDefinition

from .context import inject, load_agent_prompt, load_data, load_skill


def build_agents() -> dict[str, AgentDefinition]:
    pricing_prompt = load_agent_prompt("pricing")
    # Drop the stray truncated `do y` tail left in pricing.md.
    if pricing_prompt.rstrip().endswith("do y"):
        pricing_prompt = pricing_prompt.rstrip()[: -len("do y")].rstrip()

    return {
        "pricing": AgentDefinition(
            description="Pricing Specialist — recommends commercial terms (discount band, payment structure, concessions) using the pricing playbook and past-wins data.",
            prompt=inject(
                pricing_prompt,
                ("pricing-playbook skill", load_skill("pricing-playbook")),
                ("past-wins.json", load_data("past-wins.json")),
            ),
            tools=["Read", "Grep"],
            model="sonnet",
        ),
        "legal": AgentDefinition(
            description="Legal Reviewer — flags RFP clauses that conflict with standard positions, classifying each as blocker / negotiable / acceptable.",
            prompt=inject(
                load_agent_prompt("legal"),
                ("legal-checklist skill", load_skill("legal-checklist")),
            ),
            tools=["Read", "Grep"],
            model="sonnet",
        ),
        "technical_fit": AgentDefinition(
            description="Technical Fit Specialist — assesses whether our product meets RFP requirements, producing a fit score and a list of gaps.",
            prompt=inject(
                load_agent_prompt("technical-fit"),
                ("product-overview.md (capability map)", load_data("product-overview.md")),
            ),
            tools=["Read", "Grep"],
            model="sonnet",
        ),
        "competitive": AgentDefinition(
            description="Competitive Intel Analyst — identifies likely competitors and positioning using the battlecard library.",
            prompt=inject(
                load_agent_prompt("competitive"),
                ("competitive-intel skill", load_skill("competitive-intel")),
            ),
            tools=["Read", "Grep"],
            model="haiku",
        ),
        "risk_assessment": AgentDefinition(
            description="Risk Assessment Specialist — runs a three-step risk framework and writes an interactive HTML risk dashboard to outputs/.",
            prompt=inject(
                load_agent_prompt("risk-assessment"),
                ("risk-assessment skill", load_skill("risk-assessment")),
            ),
            tools=["Read", "Write"],
            model="sonnet",
        ),
    }


def coordinator_system_prompt() -> str:
    """Ported deal-desk-orchestrator prompt + SDK-specific tooling overrides + docx branding guidance."""
    base = load_agent_prompt("deal-desk-orchestrator")
    docx_skill = load_skill("docx")

    overrides = f"""

---

# SDK swarm — tooling overrides (these supersede any conflicting instruction above)

You are running as a Claude Agent SDK swarm, not inside Claude Code. Concrete rules:

## Delegating to specialists
Invoke each specialist with the **Task** tool, using `subagent_type` set to one of:
`pricing`, `legal`, `technical_fit`, `competitive`, `risk_assessment`.
Each specialist already has its own skill/reference material injected — you do NOT
need to hand them the skill text, only the RFP and a narrow brief. Give each the
full RFP text (or tell them to Read the RFP path you were given) plus a clear ask.
Run the first four (`pricing`, `legal`, `technical_fit`, `competitive`) in parallel
by issuing their Task calls together in a single turn.

## Producing the customer-facing proposal (.docx)
Do NOT use pandoc or the plain docx skill. Call the branding tool
**mcp__branding__generate_branded_docx** with structured sections. It renders the
BTS palette (navy #0B1F3A / gold #C9A227), shaded headings, and styled tables.
Pass these fields:
- `output_path`: outputs/proposal-<customer-slug>-<YYYY-MM-DD>.docx
- `customer`, `date`
- `executive_summary`: array of exactly 3 bullet strings
- `understanding`, `why_we_fit`, `commercial`, `contract_approach`, `risks`: prose
  strings (Markdown pipe-tables inside `commercial` are rendered as branded tables).
Synthesise these six sections from the four specialists' findings before calling it.

## Producing the internal risk assessment (.html)
After the proposal .docx exists, delegate to the `risk_assessment` specialist via
Task. Give it: the full RFP, a summary of ALL four specialists' findings (pricing
position, legal flags with severities, technical fit score, competitive threats),
and the proposed contract counter-positions from Legal. It writes the self-contained
interactive HTML itself to outputs/risk-assessment-<customer-slug>-<YYYY-MM-DD>.html.
This is internal only — never include it in the customer response.

## Completion
Both artifacts must exist in outputs/ before you report done. After the risk
specialist returns, use Glob or Read to confirm both files are present, then give a
short final summary: proposal path, risk HTML path, the risk decision (Proceed /
Escalate to VP / No-bid), and the net/gross risk scores.

---

# Branding reference (ported from the docx skill, for context only)

{docx_skill}
"""
    return base + overrides

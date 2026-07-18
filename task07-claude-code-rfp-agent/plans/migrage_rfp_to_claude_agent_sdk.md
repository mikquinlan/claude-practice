# Migrate RFP flow to Claude Agent SDK — Swarm Agent

## Context

Task07 today is **pure Claude Code config**: 6 subagents (`.claude/agents/*.md`) + 5 skills
(`.claude/skills/*/SKILL.md`) + synthetic data. Orchestration exists only as the
`deal-desk-orchestrator` markdown system prompt — no runnable code. Task B (`index.md`)
requires reimplementing this as a **Python Claude Agent SDK swarm**: a COORDINATOR agent
fans out to specialist workers (Pricing, Legal, Tech, Compete — and, per user, a 5th
Risk worker), which feed a **branded proposal `.docx`** plus an internal **risk HTML**.

Goal: a runnable `python -m rfp_swarm` that ingests `synthetic-data/rfp-acme-corp.md` and
produces `outputs/proposal-acme-corp-<date>.docx` + `outputs/risk-assessment-acme-corp-<date>.html`,
reusing the existing skill/agent content as the single source of truth.

Confirmed decisions:
- **Python** SDK (`claude-agent-sdk`), managed by `uv` (matches monorepo).
- **SDK-native subagents**: coordinator = top-level query system prompt; 5 specialists =
  `AgentDefinition`s in `ClaudeAgentOptions.agents`, invoked by the coordinator via the
  built-in `Task`/Agent tool.
- **Skill loading = inject SKILL.md / reference file into the owning agent's prompt** at
  startup (no reliance on Claude Code's filesystem skill auto-loader).
- **5th Risk worker included** (parity with current setup): internal-only HTML dashboard.
- **Branded docx** via a custom `python-docx` tool (BTS navy `#0B1F3A` / gold `#C9A227`).

## Target architecture

```
rfp_swarm/
├── __init__.py
├── __main__.py        # CLI: --rfp <path>, --out-dir outputs/
├── swarm.py           # builds ClaudeAgentOptions, runs ClaudeSDKClient, streams + logs cost
├── agents.py          # AgentDefinition for each of 5 workers; coordinator system prompt
├── context.py         # loads SKILL.md + synthetic-data files, injects into prompts
└── tools.py           # @tool generate_branded_docx (python-docx); create_sdk_mcp_server
```

### Coordinator (top-level query)
- System prompt = ported `deal-desk-orchestrator.md` process (read RFP → delegate 4 workers
  in parallel → synthesise → produce branded docx → delegate Risk worker → verify both
  artifacts exist). Inject `docx/SKILL.md` branding guidance here (docx skill is owned by
  the coordinator, not a worker).
- `allowed_tools`: `Task` (delegate to subagents), `mcp__branding__generate_branded_docx`,
  `Read`, `Write`, `Glob`.
- Model: `sonnet`.

### Workers (`ClaudeAgentOptions.agents`, each an `AgentDefinition`)
Ported verbatim from the matching `.claude/agents/*.md` system prompt, **plus** its
owning skill/reference injected into the `prompt`:

| Worker key   | Ported from            | Injected context                     | tools            | model  |
|--------------|------------------------|--------------------------------------|------------------|--------|
| `pricing`    | pricing.md             | pricing-playbook SKILL + past-wins.json | Read, Grep      | sonnet |
| `legal`      | legal.md               | legal-checklist SKILL                | Read, Grep       | sonnet |
| `technical_fit` | technical-fit.md    | product-overview.md                  | Read, Grep       | sonnet |
| `competitive`| competitive.md         | competitive-intel SKILL              | Read, Grep       | haiku  |
| `risk_assessment` | risk-assessment.md| risk-assessment SKILL                | Read, Write      | sonnet |

Normalize keys to snake_case (fixes existing `technical-fit`→`technical_fit` filename/name
mismatch). Also drop the stray `do y` typo tail from `pricing.md`'s ported prompt.

### Custom tool — branded docx (`tools.py`)
`@tool("generate_branded_docx", ...)` using `python-docx`. Args: output path, structured
proposal sections (exec summary bullets, understanding, why-we-fit, commercial, contract
approach, risks). Builds BTS-branded doc: navy heading bar, gold accent rules, styled
tables/cell-shading — codifies what the orchestrator's agent-memory `env_no_pandoc.md`
did ad hoc. Registered via `create_sdk_mcp_server("branding", tools=[...])`. Avoids the
pandoc dependency the existing docx skill needs (noted unreliable in agent-memory).

### Risk HTML
Risk worker has `Write` and its skill's exact HTML spec injected → writes the
self-contained interactive dashboard directly to `outputs/risk-assessment-<customer>-<date>.html`
(no custom tool needed; matches skill's "single self-contained HTML" requirement).

### `swarm.py` orchestration
- Build `ClaudeAgentOptions(agents=..., mcp_servers={"branding": server},
  allowed_tools=[...], setting_sources=[], permission_mode="bypassPermissions",
  cwd=<task07 dir>)`. `setting_sources=[]` → SDK isolation (self-contained, ignore
  Claude Code's own agents/skills so the SDK build is the sole source of truth).
- Run via `ClaudeSDKClient` / `query()`; stream `AssistantMessage` text; capture
  `ResultMessage.total_cost_usd` and per-turn usage → print a cost summary at the end
  (lets us compare against `step1_results.md` numbers: single-prompt $0.88 / agent-team
  $2.60 / dynamic $1.79).

### Dependencies
`uv add claude-agent-sdk python-docx` (adds to root `pyproject.toml`). Requires
`ANTHROPIC_API_KEY` in env (`.env` already loaded via existing `python-dotenv`).

## Critical files
- New: `rfp_swarm/` package (above) under `task07-claude-code-rfp-agent/`.
- Read/port sources (unchanged): `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`,
  `synthetic-data/{rfp-acme-corp.md,past-wins.json,product-overview.md}`.
- Modify: root `pyproject.toml` (deps only).
- Output: `outputs/proposal-acme-corp-<date>.docx`, `outputs/risk-assessment-acme-corp-<date>.html`.

## Verification (end-to-end)
1. `uv sync` then `uv run python -m rfp_swarm --rfp synthetic-data/rfp-acme-corp.md`.
2. Assert both artifacts exist in `outputs/` with non-zero size.
3. Open `.docx`: confirm BTS branding + all 6 proposal sections present.
4. Open `.html` in a browser: toggle a clause card → risk gauge/decision banner recompute;
   "show worst-case" / "show proposed position" buttons work.
5. Sanity vs. agent-memory regression fixture: Legal should flag the 6 known BLOCKERs
   (uncapped liability, MFN, IP vesting, immediate-SLA-termination, subprocessor veto,
   no-notice audits); Risk decision should land "Escalate to VP" (~8% net / ~18% gross).
6. Print end-of-run cost summary; note it in a short README for comparison with Task A.

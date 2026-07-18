# rfp_swarm — RFP Deal Desk as a Claude Agent SDK swarm

Task B reimplementation of the Task07 Claude Code config (6 subagents + 5 skills) as
a runnable Python swarm on the **Claude Agent SDK**.

## What it does

A COORDINATOR agent (top-level `query`) reads an RFP, fans out to five specialist
workers, synthesises a **branded proposal `.docx`**, then commissions an internal
**risk `.html`** dashboard.

```
coordinator (deal-desk-orchestrator system prompt)
├── Task → pricing         (pricing-playbook SKILL + past-wins.json)   sonnet
├── Task → legal           (legal-checklist SKILL)                     sonnet
├── Task → technical_fit   (product-overview.md)                       sonnet
├── Task → competitive     (competitive-intel SKILL)                   haiku
│      … synthesise → mcp__branding__generate_branded_docx (.docx)
└── Task → risk_assessment (risk-assessment SKILL → writes .html)      sonnet
```

Single source of truth: the workers' system prompts and injected reference material
are read at runtime from `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`, and
`synthetic-data/*` — not re-authored here.

## Design notes

- **SDK-native subagents.** Coordinator = top-level `system_prompt`; the five
  specialists are `AgentDefinition`s in `ClaudeAgentOptions.agents`, invoked via the
  built-in **Task** tool (`subagent_type=<key>`). Keys are snake_case, fixing the
  original `technical-fit` name/filename mismatch. The truncated `do y` tail in
  `pricing.md` is stripped on load.
- **Skills = prompt injection.** Each SKILL.md / reference file is appended to its
  owning agent's prompt at startup (`setting_sources=[]` — no reliance on Claude
  Code's filesystem skill auto-loader).
- **Branded docx = custom tool**, not pandoc. `tools.py` exposes
  `mcp__branding__generate_branded_docx` (python-docx: navy `#0B1F3A` / gold
  `#C9A227` banner, shaded headings, zebra tables). Codifies what the orchestrator's
  agent-memory `env_no_pandoc.md` did by hand, and drops the unreliable pandoc dep.
- **Risk HTML** is written directly by the risk worker (has `Write` + the skill's
  exact HTML spec) — matches the skill's "single self-contained HTML" requirement.

## Run

```bash
# from task07-claude-code-rfp-agent/  (needs ANTHROPIC_API_KEY in .env or env)
uv run python -m rfp_swarm --rfp synthetic-data/rfp-acme-corp.md
```

Options: `--customer`, `--date`, `--out-dir` (default `outputs`), `--model`
(coordinator model; workers set their own).

Outputs:
- `outputs/proposal-acme-corp-<date>.docx`
- `outputs/risk-assessment-acme-corp-<date>.html`

The run prints a **cost summary** (`ResultMessage.total_cost_usd`, per-model usage)
for comparison against the Task A single-prompt / agent-team / dynamic numbers.

## Cost comparison (Task A baselines vs. Task B)

| Approach | Cost (USD) |
|---|---|
| Task A — single prompt | $0.88 |
| Task A — agent team | $2.60 |
| Task A — dynamic workflow | $1.79 |
| Task B — SDK swarm | _fill in after first run_ |

## Expected result (regression sanity)

- Legal flags the 6 known BLOCKERs: uncapped liability, MFN, IP vesting,
  immediate-SLA-termination, subprocessor veto, no-notice audits.
- Risk decision: **Escalate to VP** (~8% net / ~18% gross), per prior reruns.

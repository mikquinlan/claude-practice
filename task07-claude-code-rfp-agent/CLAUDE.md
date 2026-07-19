# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Not an application — a **Claude Code multi-agent configuration** for a synthetic "Deal Desk" that processes inbound RFPs. There is no build, no test suite, no lint. The "code" is the set of agent + skill markdown definitions under `.claude/`, exercised by running Claude Code against the sample RFP. The task (`index.md`) is to run the RFP three ways (single agent, agent teams, dynamic workflow), compare cost/quality, then reimplement the same flow with the Anthropic Agent SDK.

Fictional company throughout: **BTS-Synthetic**, selling an Enterprise Data Platform. All data in `synthetic-data/` is fake.

## Running it

Give Claude the RFP and let the orchestration play out, e.g.:

> Process the RFP in `synthetic-data/rfp-acme-corp.md` as an agent team with a coordinator delegating to specialists.

- Agent-teams mode requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, set in `.claude/settings.json`.
- Every generated artifact goes in `outputs/` (currently just `.gitkeep`). Per `index.md`, write each of the three run modes to a **separate** subfolder so they don't overwrite each other when comparing.
- `docx` skill shells out to `pandoc` (installed at `/opt/homebrew/bin/pandoc`). No pandoc → no Word output.

## Architecture: the deal flow

`deal-desk-orchestrator` (the coordinator) drives a fixed sequence — read the design in the orchestrator agent before changing any specialist:

1. Coordinator reads the RFP itself.
2. Delegates to **four specialists in parallel**: `pricing`, `legal`, `technical_fit`, `competitive`. Each is briefed narrowly and answers in one message.
3. Coordinator synthesises all four into a **customer-facing proposal** → `outputs/proposal-<customer>-<date>.docx` (via `docx` skill).
4. **Only after** the proposal exists, delegates to `risk_assessment` for the **internal** risk dashboard → `outputs/risk-assessment-<customer>-<date>.html`.

Both artifacts must exist before the coordinator reports done. The risk HTML is internal-only and must never go to the customer.

Each specialist agent pairs with a skill that holds its authoritative rules — the agent is the role, the skill is the ruleset:

| Agent (`.claude/agents/`) | Skill (`.claude/skills/`) | Reference data |
| --- | --- | --- |
| `pricing` | `pricing-playbook` | `synthetic-data/past-wins.json` |
| `legal` | `legal-checklist` | — |
| `technical_fit` | — | `synthetic-data/product-overview.md` |
| `competitive` | `competitive-intel` | — |
| `risk_assessment` | `risk-assessment` | (consumes the other four's findings) |

When editing a specialist's behaviour, change the **skill**, not just the agent prompt — the skill is where discount bands, redline positions, battlecards, and the risk-scoring formula live. The `risk-assessment` skill fully specifies the HTML dashboard (three-step scoring, decision thresholds, fixed colour palette, required interactive elements); follow it exactly rather than improvising a layout.

## Gotchas

- **Agent `name:` values are snake_case, not the filenames**: `technical-fit.md` → name `technical_fit`, `risk-assessment.md` → name `risk_assessment`. Delegate/reference agents by their frontmatter `name`, not their file name.
- Models are pinned per agent in frontmatter (`competitive` uses haiku, the rest sonnet, orchestrator sonnet). Keep this deliberate — cost comparison is part of the task.
- The orchestrator references a "BTS branding skill" for the docx and an external design-system URL for the risk HTML; neither is present in-repo. Fall back to the plain `docx` skill and the palette in the `risk-assessment` skill.
- `pricing.md` ends mid-sentence (`do y`) — a truncated stray line, not an instruction. Ignore it.

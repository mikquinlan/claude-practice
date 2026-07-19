# Architecture Debate + WBS Extension

## Context

The RFP pipeline (specialists → proposal → risk) answers *commercial/legal/fit* but says
nothing about **how** we'd build the platform. The Acme RFP explicitly asks for an
"implementation plan with key milestones" and weights "implementation timeline and risk" at
15% of the award. Two new capabilities close that gap, and each is a faithful application of a
documented Agent-Teams pattern:

1. **Architecture options debate** — the *competing-hypotheses* pattern (multiple agents each
   hold a theory and refute peer-to-peer, converging faster) applied to Azure architecture
   instead of bug root-causing.
2. **WBS build split by workstream** — the *dependency-tracking* pattern (a pending task can't
   be claimed until its dependencies complete) so the work-breakdown self-sequences instead of
   being hand-policed.

Both features are built into **two runners** — the **agent-teams** runner (authentic: real
peer refutation + real dependency-gated task claims) and a **new dynamic workflow** (scripted
approximation) — so the repo's "same flow, four runners, compare cost/quality" thesis extends
cleanly. The Python SDK swarm and the single-prompt runner are **out of scope**.

## Locked decisions (from grill)

| # | Decision |
|---|----------|
| Runners | agent-teams (authentic) + **new** dynamic workflow (scripted). SDK + single-prompt untouched. |
| Flow | specialists → **architecture debate** → **WBS** → proposal → risk. Sequential; WBS depends on the debate winner. |
| Candidates | Coordinator derives **exactly 3** Azure architectures at runtime from the RFP + technical-fit evidence. NOT hardcoded stacks — a generic `arch-advocate` role, briefed per candidate. A weak 3rd is fine; it dies in refutation. |
| Debate | 3 advocates post positions → **one peer refutation round** → `arch-commercial` skeptic scores all 3 on TCO / delivery risk / 5-yr fixed-price margin. |
| Winner | **Judge picks** (deal-desk-orchestrator), names 1 winner + records why the 2 losers lost. Hard input to the WBS + diagram. |
| WBS owners | 4 fixed: infra/landing-zone, app build, data/integration, testing/cutover. |
| WBS tasks | **Detailed** sub-tasks. Two-pass: coordinator seeds 4 **anchor** tasks with the coarse order between them; each owner decomposes its anchor + links fine cross-workstream edges to existing anchors (no chicken-egg). |
| Artifacts | Winner + WBS → **proposal .docx**. New **internal `.html`** debate file (all 3 archs, refutations, scoring, why losers lost, embeds winner diagram). WBS delivery risk → risk dashboard. |
| Diagram | **draw.io, winner only**, real **Azure icons**, embedded in the proposal. |
| Risk | Delivery risk is **additive only** — shown as its own card/section; does NOT override the legal-driven **Escalate to VP** decision. Regression anchor preserved. |
| Models | **Judge → Opus 4.8** (`claude-opus-4-8`, explicit ID not the bare `opus` alias) — 1 high-leverage call. Advocates ×3, commercial skeptic, 4 WBS owners → **Sonnet 5** (`claude-sonnet-5`, not the bare `sonnet` alias). Haiku nowhere. |

## Files to author (single source — read by both runners)

Mirror the existing agent/skill conventions exactly (confirmed from `competitive.md` /
`pricing.md` / `competitive-intel/SKILL.md`).

### 6 new agents — `.claude/agents/`
Frontmatter: `name` (quoted, = the `agentType`), `description` (quoted), `model`
(`claude-sonnet-5` — Sonnet 5, explicit ID not the bare `sonnet` alias),
`tools` (inline comma list). Body = prose (`You are... / Inputs / Output`).

| file | `name` | model | role |
|------|--------|-------|------|
| `arch-advocate.md` | `arch_advocate` | `claude-sonnet-5` | Parameterised. Champions ONE assigned Azure architecture; in the refutation round attacks the other two. Requires the debate brief to name its assigned candidate. |
| `arch-commercial.md` | `arch_commercial` | `claude-sonnet-5` | Skeptic. Scores all 3 on TCO (20% eval weight), delivery risk, 5-yr fixed-price margin exposure. Champions none. |
| `wbs-infra.md` | `wbs_infra` | `claude-sonnet-5` | Owns infrastructure / landing-zone workstream. |
| `wbs-app.md` | `wbs_app` | `claude-sonnet-5` | Owns application build workstream. |
| `wbs-data.md` | `wbs_data` | `claude-sonnet-5` | Owns data / integration workstream. |
| `wbs-test.md` | `wbs_test` | `claude-sonnet-5` | Owns testing / cutover workstream. |

Judge = existing `deal-desk-orchestrator` (no new file). Opus is applied at the *call* site,
not the frontmatter (see runner wiring).

### 2 new skills — `.claude/skills/<name>/SKILL.md`
Frontmatter: `name` + `description` only (unquoted, trigger-phrased). Body = H1 + H2/H3.

- **`architecture-debate/SKILL.md`** — the shared rulebook: how the coordinator derives exactly
  3 credible Azure candidates from the RFP + tech-fit; the one-round refutation protocol; the
  commercial scoring rubric (TCO / delivery / margin); the judge rubric; and the
  **Azure-diagram requirement** (winner only, real Azure icons via
  `drawio-skill/scripts/shapesearch.py "azure <service>"`, export
  `drawio -x -f png --width 2000 -o <out>.png <in>.drawio`).
- **`wbs-playbook/SKILL.md`** — the 4 workstreams; the anchor-then-decompose two-pass rule; the
  cross-workstream dependency conventions (infra → data/integration → app build; app + data →
  testing/cutover); how delivery risk is summarised for the risk feed.

## Runner wiring

### A. Agent-teams (authentic)
- Standardise the launch prompt as a doc/skill so runs are reproducible (env flag
  `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` already set in `.claude/settings.json`).
- The coordinator is the **main opus loop** → judge is opus for free.
- Debate: coordinator derives 3 candidates, spawns 3 `arch_advocate` teammates (one per
  candidate) + 1 `arch_commercial`; teammates refute **peer-to-peer**; coordinator judges.
- WBS: coordinator seeds 4 anchor tasks in the **shared task list** with dependency edges; the
  4 owner teammates claim + decompose; the **dependency tracker** blocks testing/cutover claims
  until build tasks complete — real, not simulated.

### B. New dynamic workflow — `.claude/workflows/process-rfp-arch-wbs.js.bak`
Copy the specialists / verify / proposal / risk scaffolding from `process-rfp-dynamic.js`;
insert two phases between Specialists and Proposal. New `meta.name: 'process-rfp-arch-wbs'`,
new suffix `_arch_wbs`. Baseline `process-rfp-dynamic.js` stays untouched.

- **Phase: Architecture** — one `agent()` (orchestrator) derives 3 candidates from `tech`
  findings → `parallel()` of 3 `arch_advocate` calls (positions) → `parallel()` refutation
  round (each advocate sees the others' posts) → 1 `arch_commercial` scoring call → **judge**
  call `agent(..., { agentType: 'deal-desk-orchestrator', model: 'claude-opus-4-8' })` returns
  the winner + loser rationales (schema-validated). Then generate the Azure diagram (drawio) +
  write the internal debate `.html`.
- **Phase: WBS** — scripted dependency ordering via `pipeline()` stages: infra → data →
  app → test, with the 4 `wbs_*` owners decomposing their anchor; the stage ordering enforces
  the "testing can't start until build done" edge deterministically.
- Proposal phase: inject winning architecture (+ embedded diagram) and the WBS into the
  implementation/technical sections. Risk phase: pass the WBS delivery-risk summary as an
  **additive** input.

## Output artifacts (per runner, distinct suffix — never clobber)
- `outputs/proposal-acme-corp-<date>_arch_wbs.docx` (and `_agent_teams` variant) — now with
  the winning architecture, embedded Azure diagram, and WBS implementation plan.
- `outputs/architecture-debate-acme-corp-<date>_arch_wbs.html` — **internal only**,
  self-contained, all 3 candidates + refutations + commercial scoring table + why losers lost +
  embedded winner diagram.
- `outputs/arch-diagram-acme-corp-<date>_arch_wbs.png` — winner diagram (referenced by both the
  proposal, via pandoc `![](abs-path)`, and the debate `.html`).
- `outputs/risk-assessment-acme-corp-<date>_arch_wbs.html` — with an added delivery-risk card.
- `my_observations.md` — add a new `# Usage for arch+wbs (workflow / agent teams)` H1 section
  (file is H1-per-runner, not a table).

## Reuse (don't re-author)
- draw.io: `~/.claude/plugins/marketplaces/365-skills/plugins/drawio/skills/drawio-skill/`
  — `scripts/shapesearch.py` for Azure icon styles; `SKILL.md` export flags. Final PNG with
  `-e` must be repaired via `scripts/repair_png.py`; the preview `--width 2000` form needs no repair.
- docx: `.claude/skills/docx/SKILL.md` — pandoc; images embed when the source markdown
  references them (`![](path)`); branding via `--reference-doc`.
- Workflow scaffolding: `.claude/workflows/process-rfp-dynamic.js` (schemas, `parallel`,
  `pipeline`, retry-if-not-produced, completeness critic).

## Verification
1. **Regression (both runners must still pass):** legal flags the **6 known BLOCKERs**
   (uncapped liability, MFN, IP vesting, immediate-SLA-termination, subprocessor veto,
   no-notice audits); risk decision lands on **Escalate to VP** (~8% net / ~18% gross margin).
   Delivery risk must NOT flip this.
2. **Debate produced 3 candidates** and named exactly **1 winner** with loser rationales; the
   internal `.html` shows all three + the scoring table.
3. **Diagram**: `arch-diagram-*.png` exists, is a valid PNG (opens / passes repair), uses Azure
   icons, and is embedded in both the proposal `.docx` and the debate `.html`.
4. **WBS dependency gating**: in agent-teams, confirm a testing/cutover task could not be
   claimed until its build dependencies completed (inspect the task list). In the workflow, the
   `pipeline()` ordering guarantees it structurally.
5. **Leak check**: proposal `.docx` contains the winner + WBS but **no** internal risk scores,
   margin figures, the word "blocker", or the debate's loser rationales.
6. Run: `/process-rfp-arch-wbs` (workflow) and the standardised agent-teams launch prompt in
   **separate sessions**; capture cost into `my_observations.md`; expect `_arch_wbs` to read
   pricier (the opus judge + extra phases) — the quality/cost trade the debate buys.

Regenerate the `# Commentary` section of `my_observations.md`. Append it after the four
usage/cost blocks (Single Prompt, Agent Teams, Dynamic Workflow, Swarm — currently lines 1–103);
if a `# Commentary` section already exists, replace everything from that line to end of file.
Leave the usage/cost blocks untouched.

**Source files** — read all of these; do NOT trust the numbers in the existing Commentary,
they were written against older outputs:

- single_prompt:
  - `outputs/single_prompt/proposal-acme-2026-07-18.md`
  - `outputs/single_prompt/risk-assessment-acme-2026-07-18.html`
- agent_teams:
  - `outputs/agent_team/proposal-acme-corp-2026-07-18.md`
  - `outputs/agent_team/risk-assessment-acme-corp-2026-07-18.html`
- dynamic_workflow:
  - `outputs/dynamic_workflow/proposal-acme-corp-2026-07-18.md`
  - `outputs/dynamic_workflow/risk-assessment-acme-corp-2026-07-18.html`
- rfp_swarm:
  - `outputs/rfp_swarm/proposal-acme-corp-2026-07-18.md`
  - `outputs/rfp_swarm/risk-assessment-acme-corp-2026-07-18.html`

Compare all four runners (`single_prompt`, `agent_teams`, `dynamic_workflow`, `rfp_swarm`).

Extract per runner from the risk `.html`: net risk %, gross worst-case %, revenue attractiveness
score, per-clause states (accept/counter/reject counts), decision banner. From the proposal
`.md`: deal-value basis, discount opening + cap, clause-by-clause positions (especially §3.1
price freeze, §3.4 MFN, §3.5 termination, §4.1 indemnity, §4.3 99.99% SLA).

**Keep this sub-heading skeleton** — update contents to match the current files; drop a row only
if the data genuinely no longer supports it:

- Intro paragraph(s): cost comparison across the four runners (pull totals from the usage
  blocks above) plus the headline risk-gauge trend.
- `## Output at a glance` — table: Net risk / Gross worst-case / Revenue attractiveness /
  Clause states / Deal-value basis / Discount opening / **Decision banner**, one column per runner.
- `## How they are built` — table: self-described basis, scoring convention, UI state model,
  interaction reasoning, taxonomy.
- `## Key clause-state divergences` — table of clauses where the four disagree, plus the note
  on any rename/refile that could read as a false "missing risk."
- `## What the differences mean` — numbered list interpreting the spread.
- `## Shared blind spots (in all four)` — gaps common to every runner.
- `## Conclusion` — best-constructed vs most-conservative call plus recommendation.

**Regression sanity check** — before writing, confirm each run still: flags the 6 known BLOCKERs
(uncapped liability, MFN, IP vesting, immediate-SLA-termination, subprocessor veto, no-notice
audits); lands the decision around **Escalate to VP** (~8% net / ~18% gross). Call out in the
Commentary any run that now deviates from this band.

Write claims strictly from the current files; every number must trace to a file you read.

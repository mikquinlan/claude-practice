---
name: architecture-debate
description: BTS-Synthetic Azure architecture debate protocol for RFP implementation plans. Use whenever deriving candidate Azure architectures for an RFP, running the competing-hypotheses debate (advocates, refutation, commercial scoring, judge), or producing the winning-architecture diagram. Trigger on any request to design an Azure architecture, debate architecture options, or produce an implementation-plan diagram for an RFP.
---

# Architecture Debate

Use this when the coordinator (or workflow) needs to turn RFP requirements + Technical Fit findings into a recommended Azure architecture, using the competing-hypotheses pattern: multiple agents each hold a theory and refute peer-to-peer, converging faster than one agent reasoning alone.

## Step 1 — Derive exactly 3 candidates

Read the RFP and the Technical Fit Specialist's findings. Derive **exactly 3** credible Azure architecture options for delivering the Enterprise Data Platform against this RFP's scale, residency, latency, and integration requirements. Do not reach for a fixed catalogue of stock stacks — reason from the RFP's actual signals (data volumes, region/residency constraints, integration surface, SLA target, existing customer stack).

Each candidate needs:
- A short name (e.g. "Single-region landing zone with zone-redundant compute")
- A one-paragraph summary of the topology (region layout, compute tier, networking, data residency approach)
- The RFP requirements it's optimised for
- Its most obvious weakness

A weak third candidate is fine — it should lose in refutation, not be pre-filtered out. Forcing exactly 3 (not 2, not 4) keeps the debate tractable and matches the fixed advocate/skeptic roster.

## Step 2 — Position papers

Brief each `arch_advocate` with exactly ONE assigned candidate (its full description from Step 1) plus the RFP and Technical Fit findings. Each advocate writes a position paper: why their architecture wins on requirements fit, delivery risk, and cost — no mention of the other two yet.

## Step 3 — One refutation round

Give each advocate the other two advocates' position papers. Each writes ONE refutation round: attack the other two candidates' weakest points (cost, delivery risk, requirements gaps). Advocates do not defend their own candidate again in this round — attack only. One round, not an open-ended debate: the commercial skeptic scores from what surfaces here.

## Step 4 — Commercial scoring (arch_commercial)

Give the skeptic all 3 position papers and all refutations. Score each candidate on:

| Dimension | Weight | What to score |
| --- | --- | --- |
| TCO | 20% (matches the RFP's stated implementation-timeline-and-risk eval weight) | 5-year infrastructure + operations cost estimate, relative to the other two |
| Delivery risk | 40% | Likelihood of missing the RFP's implementation milestones, given team familiarity, integration surface, and unresolved unknowns surfaced in refutation |
| 5-yr fixed-price margin exposure | 40% | If we quote this architecture as part of a 5-year fixed price, how much cost-overrun risk we're carrying |

The skeptic champions none of the three — score all 3 on the same rubric, cite specifics from the position papers and refutations, don't introduce new architectural claims.

## Step 5 — Judge

The judge (deal-desk-orchestrator, called with the Opus model) reads all 3 position papers, all refutations, and the commercial scoring. It:
1. Names exactly 1 winner
2. Records why each of the 2 losers lost — cite the specific refutation point or commercial score that sank them
3. Hands the winner's full description forward to the WBS phase and the diagram step

## Azure diagram (winner only)

Generate a draw.io diagram of the **winning architecture only**, using real Azure icons:
1. `python3 <drawio-skill>/scripts/shapesearch.py "azure <service>"` for each component's exact style string — don't guess styles.
2. Hand-author or autolayout the `.drawio` XML from the winner's topology.
3. Export: `drawio -x -f png --width 2000 -o <out>.png <in>.drawio` for the working preview (no `-e`, so it stays under the vision size limit and doesn't need repair).
4. If a final embedded-XML PNG is required, re-export with `-e` and run `scripts/repair_png.py` immediately after (draw.io's `-e` export truncates the IEND chunk).
5. Embed the PNG in the proposal `.docx` (pandoc renders `![](abs-path)`) and in the internal debate `.html` (base64 data URI, so the HTML stays self-contained).

## Standard agent-teams launch prompt

For the agent-teams runner, launch with a prompt shaped like this so runs are reproducible:

> "Process the RFP in `synthetic-data/rfp-acme-corp.md` as an agent team with a coordinator delegating to specialists. After the 4 core specialists report, run the architecture debate: derive exactly 3 Azure architecture candidates, spawn one `arch_advocate` teammate per candidate plus one `arch_commercial` teammate, have advocates refute each other peer-to-peer in one round, then judge the winner yourself. Then run the WBS: seed 4 anchor tasks (infra/landing-zone, app build, data/integration, testing/cutover) in the shared task list with dependency edges so testing/cutover can't be claimed until its build dependencies complete, and have the matching `wbs_*` teammate decompose each anchor. Only then produce the customer-facing proposal and the internal risk assessment."

Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (already set in `.claude/settings.json`).

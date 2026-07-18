# Usage

## Single Prompt
Total cost:            $3.08
Total duration (API):  13m 24s
Total duration (wall): 21m 51s
Total code changes:    825 lines added, 0 lines removed
Usage by model:                          
claude-haiku-4-5:  571 input, 3.4k output, 74.3k cache read, 25.1k cache write ($0.0562)
claude-opus-4-8:  3.1k input, 12.2k output, 1.4m cache read, 39.6k cache write ($1.42)
claude-sonnet-5:  60 input, 52.3k output, 619.5k cache read, 168.7k cache write ($1.60)

Subagents               % of usage
deal-desk-orchestrator         31%
docx                            7%
risk_assessment                 6%
pricing                         2%
legal                           1%
technical_fit                   1%
competitive                     1%

## Agent Teams
Total cost:            $1.98
Total duration (API):  9m 59s
Total duration (wall): 2h 7m 18s
Total code changes:    512 lines added, 0 lines removed
Usage by model:                          
claude-haiku-4-5:  616 input, 2.8k output, 62.3k cache read, 12.8k cache write ($0.0370)
claude-opus-4-8:  1.0k input, 2.1k output, 242.7k cache read, 18.8k cache write ($0.3670)
claude-sonnet-5:  70 input, 49.6k output, 784.2k cache read, 159.0k cache write ($1.58)

Subagents               % of usage
deal-desk-orchestrator         34%
risk_assessment                 9%
docx                            5%
pricing                         3%
legal                           2%
technical_fit                   1%
competitive                     1%


## Dynamic Workflow

Total cost:            $5.70
Total duration (API):  28m 0s
Total duration (wall): 1h 46m 13s
Total code changes:    884 lines added, 1 line removed
Usage by model:                          
claude-haiku-4-5:  575 input, 6.8k output, 8.5k cache read, 12.4k cache write ($0.0510)
claude-opus-4-8:  4.2k input, 68.7k output, 1.0m cache read, 260.3k cache write ($4.14)
claude-sonnet-5:  34 input, 58.5k output, 680.2k cache read, 116.2k cache write ($1.52)

Subagents               % of usage
deal-desk-orchestrator         21%
general-purpose                16%
risk_assessment                11%
docx                            3%
pricing                         2%
legal                           2%
technical_fit                   2%
competitive                     1%

### Approach used
prompt used: 
```text
I need to process an RFP, create a workflow to process the RFP from picking agents from the 
@.claude/agents/ and augmenting with additional specialised agents where you see gaps. 
```

Orchestrated via Claude Code Workflow tool (deterministic fan-out script), not free-form delegation.

Flow (5 phases, dynamic — qualify output briefs the specialists):
1. Qualify        — deal_strategist (gap): bid/no-bid, deal sizing, win themes
2. Specialists ×7 parallel — pricing, legal, technical_fit, competitive (CORE from .claude/agents)
                            + tco_analyst, solution_architect, references_curator (GAP agents)
3. Synthesize     — customer proposal .md then pandoc .docx
4. QA             — adversarial review + repair loop (over-promise / internal-leak gate)
5. Risk           — risk_assessment (core): internal HTML dashboard, only after proposal exists

Gap agents added (RFP §7 deliverables no core agent owned):
- solution_architect  — implementation plan + milestones (15% eval weight)
- tco_analyst         — 5-yr pricing transparency / TCO (20% eval weight; historical win-lever)
- references_curator  — 3 customer references from past-wins.json
- deal_strategist     — front bid-qualification + win themes
- proposal_qa         — adversarial verify (caught 5 warnings, 0 blockers; pass)

Result:
- Decision: Escalate to VP | net risk 8.75% | revenue 100/100
- QA pass=true. Leak check clean (no internal content in customer .docx).
- Notable QA warning: active-active baked into implementation plan §5 while §4 prices 99.99% active-active as a $100K/yr OPTION — internally inconsistent, flag for deal owner.
- Discount honesty: offered ~25% ($540K vs $720K list); RFP floor is 35% (10pts beyond our max) — within rules, presented as flat 5-yr price, but misses stated floor.

Quality vs other two modes (Risk Assessment report focus):
- Same honest decision (Escalate to VP) and scoring as prior runs — framework is deterministic.
- Dynamic run adds: front-loaded qualification, 3 gap specialists covering the required §7 deliverables the single-agent/team runs skipped, and an explicit adversarial QA gate before the customer doc ships.

## Swarm
total_cost_usd : $2.6259
num_turns      : 2
duration       : 12 minutes 35 seconds
per-model usage:
- claude-haiku-4-5-20251001 ($0.0176)
- claude-sonnet-5 ($2.6083)
# Commentary

The observations below were constructed using the prompt from [commentary_prompt.md](commentary_prompt.md) then asking Claude to add an executive summary.

Overall I agree with the observations. The best response from the Dynamic Workflow, I believe, is purely down to the fact
that the prompt I used included the following:
```text
"picking agents from the @.claude/agents/ and augmenting with additional 
specialised agents where you see gaps."
```
This allowed Claude Opus to reason what was missing and create additional agents: solution architect, TCO analyst,
reference curator, deal strategist and proposal QA. With additional work, these agents could be given more formal definitions
and iterated on to produce an even better output.

## Executive Summary

**We processed the Acme Corp RFP four ways. All four reached the same call: Escalate to VP.** The deal is attractive (revenue 100/100) but carries unresolved contractual blockers — uncapped liability, an open-ended most-favoured-nation warranty, full IP assignment, immediate termination on any SLA miss, and uncapped regulatory-fine indemnity. Every run priced the same worst-case exposure (18% gross), landed net risk in the 5–10% band, and recommended VP sign-off before signature. The recommendation is robust: it did not depend on which method we used.

**What differed was cost and process discipline, not the answer.** The four methods cost between $1.98 and $5.70 — a ~3× spread — for the same decision. The cheapest method (Agent Teams) produced the tightest redlines; the most expensive (Dynamic Workflow) bought extra rigor (deal qualification, gap-filling specialists, an adversarial quality gate) that improved the *proposal* but not the *decision*.

**Bottom line for the deal:** proceed to VP. Before signature, four judgment calls remain that no automated run should own — how hard to hold on MFN and the fine indemnity, whether to carry or separately price the 99.99% uptime commitment, the final discount number (all runs refused the customer's 35% ask and settled at 25–30%), and an unproven throughput assumption that every run flagged but none scored.

**Bottom line for the tooling:** use the cheap, fast method (Agent Teams) for routine deals — same decision, lowest cost — and reserve the expensive orchestrated method (Dynamic Workflow) for strategic, high-value deals where the added coverage and quality checks earn their ~3× premium.

---

All four runners were pointed at the same Acme Corp RFP and produced the same two artifacts — a customer proposal (`.md`) and an internal risk dashboard (`.html`). They cost, respectively, **Agent Teams $1.98 < Swarm $2.63 < Single Prompt $3.08 < Dynamic Workflow $5.70**. Cost tracked orchestration overhead, not output quality: the cheapest (Agent Teams) and the most expensive (Dynamic Workflow, ~2.9× the price) landed the *same* decision, and the priciest run's extra spend bought process (front-loaded qualification, three gap specialists, an adversarial QA gate) rather than a different answer. Wall-clock is not a useful signal here — it is dominated by human idle time between turns (Agent Teams shows 2h 7m wall against just 9m 59s of API time).

The headline risk numbers are strikingly convergent. Every run computes **gross worst-case exposure of exactly 18.0%** (the sum of the same twelve clause base-risks), scores **revenue attractiveness 100/100** off an identical six-signal rubric, and lands the banner on **ESCALATE TO VP**. The only thing that moves is **net risk**, and it moves purely as a function of how aggressively each run redlines — not what it discovered. Net rises monotonically as runs concede more: Agent Teams 6.75% → Single Prompt 8.00% → Dynamic Workflow 8.75% → Swarm 9.00%. All four sit inside the 5–10% "Escalate to VP" band, so the spread never changes the call.

## Output at a glance

| | Single Prompt | Agent Teams | Dynamic Workflow | Swarm |
|---|---|---|---|---|
| **Net risk** | 8.00% | 6.75% | 8.75% | 9.00% |
| **Gross worst-case** | 18.0% | 18.0% | 18.0% | 18.0% |
| **Revenue attractiveness** | 100/100 | 100/100 | 100/100 | 100/100 |
| **Clause states** (accept / counter / reject) | 0 / 10 / 2 | 0 / 10 / 2 | 1 / 10 / 1 | 0 / 12 / 0 |
| **Deal-value basis** | $720K base list; ">$1M ARR at full scale" | Strategic tier — 280TB / 750 users; Stark comp closed at 28% | $720K/yr list → $540K/yr net; $2.7M 5-yr platform ($3.2M w/ SLA option) | List ~$720K/yr implied; 28% off |
| **Discount opening** | 22–25% (Strategic); figure withheld to schedule | Open 22–25% → 28–30% cap (3-yr + reference rights) | Flat 25% effective, framed as a fixed 5-yr price, not a band | 28% off list, flat, explicit |
| **Decision banner** | ESCALATE TO VP | ESCALATE TO VP | ESCALATE TO VP | ESCALATE TO VP |

## How they are built

| | Single Prompt | Agent Teams | Dynamic Workflow | Swarm |
|---|---|---|---|---|
| **Self-described basis** | "Step 1 + Step 2 data: risk register" | "Step 1 + Step 2 data: risk register" | Per-clause `defaultPos` snapshot | "Default state reflects current negotiation position from Pricing and Legal" |
| **Scoring convention** | `base × multiplier`, accepted 1.0 / countered 0.5 / rejected 0.0; net = Σ | identical | identical | identical |
| **UI state model** | Binary checkbox ("Accepted in proposal?") toggling a pre-baked `net` per clause; separate worst-case mode swaps in `base` | Tri-state position buttons (Accepted / Countered / Rejected), live multiplier | Tri-state position buttons, live multiplier | Tri-state segmented buttons, live multiplier |
| **Interaction reasoning** | "Show worst-case" (all accepted) + "Show proposed"; expandable counter-position text | Same two controls; per-card counter `<details>` | Same two controls; per-card counter `<details>` | Same two controls; expandable counter text |
| **Taxonomy** | Flat 12-clause grid, Commercial/Legal category tags | Split into **A. Commercial** and **B. Legal** sections | Single "Risk Register" grid, § + section label per card | Single grid + **metrics-row chips** (gross/net/threshold/revenue/open-blocker count) + a prose **Recommendation** panel |

Swarm is the most analyst-rich build: it is the only one that surfaces an **open-BLOCKER counter (5)** as a live metric and writes a narrative recommendation that cites a specific loss ("Pied Piper loss to Databricks at a 40% discount") as competitive context. Single Prompt is the only one whose clause model is binary rather than tri-state — its "rejected" clauses are simply left unchecked.

## Key clause-state divergences

| Clause | Single Prompt | Agent Teams | Dynamic Workflow | Swarm |
|---|---|---|---|---|
| **§3.1 5-yr price freeze** | Counter — hold flat 5 yrs + 10% volume true-up (0.75) | Counter — flat 3 yrs only; renewal CPI+2% cap 5% (0.75) | **Accept — fully flat 5-yr, no escalator, $540K/yr (1.5)** | Counter — 3-yr firm + Yr4–5 CPI+2% cap 5% (0.75) |
| **§3.4 MFN** | Counter — comparable-deal match at signature (1.0) | **Reject — benchmarking review at renewal (0)** | **Reject — commit to negotiated discount only (0)** | Counter — comparable-segment benchmarking (1.0) |
| **§4.1 reg-fine indemnity** | Counter — folded into 24-mo capped liability (1.25) | **Reject — exclude fines entirely, notification costs only (0)** | Counter — third-party + notification + credit-monitoring only (1.25) | Counter — exclude fines & reputational, notification only (1.25) |
| **§4.3 99.99% SLA** | **Reject — hold 99.95%, 99.99% "target" only (0)** | Counter — 99.95%, 99.99% not offered (0.25) | Counter — 99.95% base + priced 99.99% active-active option $80–120K/yr (0.25) | Counter — 99.95% (0.25) |
| **§3.5 termination-for-convenience** | Counter — 60–90 days, pro-rated (0.25) | Counter — 60–90 days (0.25) | Counter — 90 days (0.25) | Counter — 90 days, pro-rated (0.25) |
| **§4.1 breach-liability cap** | Counter — 24-mo cap, mutual carve-outs (1.5) | Counter — 24-mo cap (1.5) | Counter — 24-mo cap (1.5) | Counter — 24-mo cap (1.5) |

**Rename / false-missing note.** No run *drops* a risk — all four register the same twelve clauses. But a "rejected" clause renders at 0% carried risk (green), which reads as "no exposure" when it actually means "we are holding a hard line the customer has not agreed to" — a negotiation stance that can still lose the deal. This false comfort applies to Single Prompt's rejected discount + SLA, and to Agent Teams' and Dynamic Workflow's rejected MFN / indemnity. Watch also that the proposals renumber sections relative to the RFP (e.g. termination-for-convenience is RFP §3.5 but proposal §4.6), so a clause can appear under a different heading between the risk HTML and the customer doc without being missing.

## What the differences mean

1. **Net risk measures redline appetite, not risk discovery.** The 2.25-point spread (6.75% → 9.00%) comes entirely from how many clauses each run drives to zero. Agent Teams' low 6.75% is not "safer analysis" — it is the result of *rejecting the two heaviest blockers outright* (MFN base 2.0 + indemnity base 2.5 = 4.5 points zeroed). Swarm's high 9.00% is not "riskier" — it counters all twelve and rejects nothing, so no clause reaches zero.
2. **Dynamic Workflow is the only run that genuinely accepts a risk.** It concedes the §3.1 five-year price freeze outright (carrying the full 1.5%), which is why its net is second-highest despite rejecting MFN. This is an honest, deliberate carry — the proposal locks a flat $540K/yr for all five years — not an oversight.
3. **The four disagree most on §3.4 MFN and §4.1 indemnity.** Single Prompt and Swarm *counter* both (softer, keeps them on the table); Agent Teams and Dynamic Workflow *reject* MFN, and Agent Teams alone also rejects the indemnity. Same underlying position ("no open-ended MFN, no uninsurable fine exposure"), materially different negotiating posture.
4. **Only Single Prompt holds the line on the 99.99% SLA** (rejects, offers 99.95% with 99.99% as a non-binding target). Dynamic Workflow is the only one to monetize it — a priced $80–120K/yr active-active option — which is the more commercially sophisticated move but bakes an active-active architecture into the implementation plan while pricing it as optional (an internal inconsistency worth a second look).
5. **Discount discipline is consistent but presented four ways.** Every run refuses the 35% floor and lands 25–30%; Agent Teams shows the fullest band logic (22–25% → 28–30% on commitment), Swarm states a flat 28%, Dynamic Workflow hides the discount inside a flat five-year price, and Single Prompt defers the figure to a schedule.

## Shared blind spots (in all four)

- **Revenue attractiveness is hard-coded at 100/100** in every run, with an identical six-signal rubric that never responds to clause toggles. It is decorative, not analytical — the decision matrix's `revenue ≥ 70` gate can never fail, so "Escalate to VP" is effectively pre-determined whenever net risk sits in 5–10%.
- **The 18.0% gross and the base-risk weights are shared verbatim** across all four, so no run independently re-derived clause severity — they inherit the same twelve-clause register and the same accepted/countered/rejected = 1.0/0.5/0.0 multiplier.
- **The unvalidated-throughput caveat is universal but never scored.** Every proposal flags that sustained 80K events/sec *concurrently with* EU/US residency pinning is unproven and defers it to a POC — a real delivery risk that appears in no run's risk register or net-risk number.
- **Rejected/hard-line clauses render as zero risk**, understating the chance those positions cost the deal (see the false-missing note above).

## Conclusion

**Best-constructed: Dynamic Workflow** — it is the only run with front-loaded qualification, gap specialists covering the RFP §7 deliverables the others skipped (TCO, solution architecture, references), an adversarial QA gate, and the most commercially sophisticated commercial move (a priced 99.99% option and a transparent flat five-year schedule). It also carries risk most honestly, accepting the price freeze outright rather than papering it as a counter. The cost is real, though: at $5.70 it is the most expensive by a wide margin, and its extra machinery did not change the decision.

**Most conservative: Agent Teams** — lowest net risk (6.75%) and lowest cost ($1.98), achieved by rejecting the two heaviest blockers (MFN and the regulatory-fine indemnity) outright. That is the tightest redline posture of the four, but "conservative" here means *most willing to say no*, which trades deal-closability for exposure reduction.

**Recommendation:** run the flow as **Agent Teams for routine triage** (cheapest, cleanest redlines, same decision) and reserve **Dynamic Workflow for strategic deals** where the gap-specialist coverage and QA gate justify the ~3× cost. Whichever runner ships, the deal owner still owns the four things none of them decided: the true MFN/indemnity posture (counter vs. reject), whether to carry or price the 99.99% SLA, the actual discount number, and the unscored throughput-POC risk.

**Regression check.** All four runs pass the intended band: gross 18.0% exact, net 6.75–9.00% (≈8%), revenue 100/100, decision **Escalate to VP** in every run — none deviates. One taxonomy caveat, consistent across all four: the current files flag **five BLOCKER-severity clauses** (uncapped breach liability, uncapped regulatory-fine indemnity, full IP assignment, immediate-SLA-termination, MFN), not six — the subprocessor veto and no-notice audits are classified **HIGH**, not BLOCKER. All six of the named exposures are still surfaced and countered/rejected in every run; none is dropped. The count differs from the "6 BLOCKERs" expectation only because the register splits liability into two blockers and demotes the two audit/subprocessor clauses to HIGH.

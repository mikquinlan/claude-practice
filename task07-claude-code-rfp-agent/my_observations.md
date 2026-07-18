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

---
name: wbs-playbook
description: BTS-Synthetic work-breakdown-structure playbook for RFP implementation plans. Use whenever building a WBS across the 4 fixed workstreams (infra/landing-zone, app build, data/integration, testing/cutover) from a winning architecture, including the anchor-then-decompose two-pass rule and cross-workstream dependency gating. Trigger on any request to build a WBS, implementation plan, milestones, or delivery-risk summary for an RFP.
---

# WBS Playbook

Use this when building a work-breakdown structure for an RFP's implementation plan, after the architecture debate has named a winner.

## The 4 workstreams

Fixed, always these 4 — do not add or merge workstreams:

1. **Infrastructure / landing zone** (`wbs_infra`) — subscriptions, networking, identity, landing-zone guardrails, the winning architecture's core Azure resources.
2. **Application build** (`wbs_app`) — the Enterprise Data Platform application layer: ingest pipelines, APIs, UI/config surfaces specific to this customer.
3. **Data / integration** (`wbs_data`) — data migration, source-system integration, the customer's specific data residency/volume requirements from the RFP.
4. **Testing / cutover** (`wbs_test`) — integration testing, UAT, cutover/go-live, rollback plan.

## Two-pass rule: anchor, then decompose

**Pass 1 — anchors.** The coordinator (or the workflow's Architecture-to-WBS handoff) seeds 4 anchor tasks, one per workstream, each a one-line scope statement plus the coarse dependency order between them (see below). This exists so no owner has to guess where its workstream starts and ends before decomposing — no chicken-and-egg between owners.

**Pass 2 — decomposition.** Each `wbs_*` owner takes its own anchor and breaks it into detailed sub-tasks (specific enough to estimate: named deliverable, rough effort, the Azure/product components touched). Each owner also links fine-grained cross-workstream edges FROM its sub-tasks TO the other workstreams' *existing* anchors or already-decomposed sub-tasks — never to a workstream that hasn't decomposed yet, which is why the order below matters.

## Cross-workstream dependency conventions

Fixed dependency order, both runners must respect it:

```
infra  ->  data/integration  ->  app build  ->  testing/cutover
                                ^
                       (app build also depends on infra directly)
```

- **infra -> data/integration**: data migration and source-system integration can't start until the landing zone and networking exist.
- **infra -> app build**: the application layer deploys onto the landing zone.
- **data/integration -> app build**: the app needs a working data path before its features can be tested against real data shapes.
- **app build + data/integration -> testing/cutover**: testing/cutover cannot be claimed until both its build dependencies (app AND data) are complete. This is the one gate both runners must enforce for real — in agent-teams via the dependency tracker blocking task claims, in the scripted workflow via stage ordering.

## Delivery risk for the risk feed

Each `wbs_*` owner ends its decomposition with a one-line delivery-risk flag: the single biggest reason this workstream could slip (an unresolved unknown from the architecture debate, a dependency on a customer-side deliverable, an unproven integration). Roll these 4 flags up into one **delivery risk** input for the Risk Assessment Specialist.

Delivery risk is **additive only**: it becomes its own card/section in the risk dashboard. It must never override or blend into the legal-driven decision thresholds (Proceed / Escalate to VP / No-bid) — those stay governed purely by the existing net-risk and revenue-score calculation in the risk-assessment skill.

# Enterprise Data Platform — Proposal for Acme Corp

**Prepared by:** BTS-Synthetic Deal Desk
**Date:** 2026-07-18

## Executive Summary

- We deliver a lakehouse platform purpose-built for Acme's scale (280TB, 80,000 events/sec, 600 Power BI users, 150 engineers) with proven multi-region EU/US deployment and EU data residency — a configuration Microsoft Fabric has not run in production at comparable scale.
- Our commercial offer: 28% off list on a firm 3-year term (against Acme's 35% floor ask), with Year 4-5 renewal pricing capped at CPI+2% (5% ceiling) — full transparency on the 5-year cost curve without accepting an unpriceable open-ended lock.
- We meet every functional requirement in Section 2 with a high overall fit (8/10); the one area we are flagging for a joint proof-of-concept is sustained 80,000 events/sec ingest concurrently with active EU/US data-residency pinning, so there are no surprises after signature.

## Our Understanding of Your Need

Acme Corp is replacing a patchwork of on-premises Teradata warehouses and ad-hoc cloud analytics with a single enterprise data platform ahead of the 2027 Teradata decommission. The environment is Azure-first, with real-time ingest from ~40,000 IoT devices across global manufacturing sites (Mexico, Vietnam, Romania), batch ETL from 30+ internal sources, and a large, entrenched Power BI analyst base (600 users) that cannot be disrupted. A 150-person data engineering organization needs self-service data preparation, and predictive-maintenance ML pipelines are on the roadmap though not yet active. Data residency is a hard constraint: EU customer data must stay in the EU, with a primary EU region and secondary US East region. Acme is evaluating us alongside Databricks, Snowflake, and Microsoft Fabric, and is running a disciplined, weighted evaluation (functional fit 30%, commercial 25%, TCO 20%, implementation risk 15%, vendor stability 10%) with a hard 14-day-cycle deadline pressure and an aggressive commercial ask (35% discount floor, 5-year fixed pricing, Net 90, uncapped liability, unrestricted audit rights). This is a sophisticated buyer that has clearly run this playbook before — the response needs to be commercially disciplined as well as technically strong.

## Why We're the Right Fit

Technically, we meet or exceed every workload and capability requirement in Section 2 of the RFP: native lakehouse architecture on open formats (Parquet, Delta, Iceberg) for true portability away from proprietary lock-in; a mature, dedicated Power BI DirectQuery adapter serving the 600-analyst base alongside self-service prep tooling for the 150-engineer team; an 80+ connector library that comfortably covers the 30+ internal ETL sources; and a model registry, feature store, and native serving layer ready for the predictive-maintenance ML roadmap. Our streaming ingest is tested to 250,000 events/sec in single-region deployments — well above Acme's 80,000 events/sec peak — and we support per-table residency pinning across EU-primary/US-East-secondary topologies natively. Overall technical fit: 8/10, with only one open item — validating sustained throughput at scale concurrently with active dual-region residency pinning — which we propose to close via a joint proof-of-concept before go-live rather than leave as a post-signature surprise.

Competitively, Microsoft Fabric is the deal's real threat given Acme's all-in Azure footprint and existing Power BI base — we will not contest that Fabric's Power BI tie is deep. Instead we win on maturity and breadth: 8 years of production hardening at enterprise scale versus Fabric's roughly 18 months, real engineering rigor behind our 99.95%+ delivered uptime record, and a platform built for engineers and data scientists first rather than analysts first. Fabric's "free with E5" headline collapses once Azure engineering-consulting hours to reach production-grade reliability at 280TB and multi-region residency are priced in; we intend to lead with a transparent 3-year TCO comparison that surfaces that hidden cost, and to frame the platform as "Power BI integration on par with Fabric, plus superior real-time, ML, and open-format flexibility without compromise." Databricks is a credible second-place threat on lakehouse and streaming; Snowflake is the weakest competitor here given its non-Azure-native footprint and higher cost at this scale.

## Commercial Proposal

Acme's RFP requires a minimum 35% discount off list, a 5-year fixed price with no escalators, annual advance billing at Net 90, and an unrestricted Most Favoured Nation warranty. Given the scale of this engagement, we are pricing it as a strategic account and countering as follows:

| Term | Acme's Ask | Our Offer |
| --- | --- | --- |
| Discount | ≥35% off list | 28% off list, strategic-tier pricing reflecting committed 3-year term |
| Term / pricing horizon | 5-year fixed, no escalators | 3-year firm price; Year 4-5 renewal at Year-3 rate + CPI, capped at 5% |
| Payment | Annual advance, Net 90 | Net 30 standard, Net 60 as a one-step concession |
| MFN | Unrestricted, contract-duration warranty | Narrower "comparable segment" benchmarking clause, not a blanket contractual MFN |
| Termination for convenience | Any time, 30 days' notice, no fees | Pro-rated refund only; push notice period to 90 days |

We cannot meet the 35% floor or an open-ended 5-year price lock without escalators — both fall outside our approved pricing bands even at strategic-account tier — but 28% with full 5-year cost transparency (including a capped, published renewal formula) gives Acme the budget certainty it is actually asking for without us pricing blind five years out. We are including a Year 1 POC-fee credit, 30-day acceptance testing window, and a 10% volume true-up buffer as goodwill concessions. Full 5-year cost transparency, as requested in Section 7, is provided in the attached pricing schedule.

## Contract Approach

Several of Acme's standard contractual requests (Section 4) fall outside terms we can responsibly accept as drafted, and we are countering each rather than declining outright:

- **Liability (4.1):** Uncapped liability with full indemnification for regulatory fines and reputational damages is uninsurable. We propose an aggregate cap of 24 months' fees, with uncapped carve-outs limited to gross negligence and IP infringement, and indemnification scoped to direct breach-response costs rather than fines or reputational damages.
- **Audit rights (4.2):** No-notice, unlimited-scope audits up to 4x/year at vendor cost are operationally unworkable. We propose one fully-scoped audit per year with 30 days' notice and standard confidentiality protections, with up to two additional audits available at Acme's cost.
- **Service levels (4.3):** We stand behind a strong uptime commitment but cannot accept immediate termination and full monthly refund on any SLA miss regardless of duration. We propose 99.95% monthly uptime with tiered service credits (up to 30% of monthly fees) as the sole remedy, and a termination right only after repeated, material, uncured breach.
- **IP (4.4):** We agree Acme-specific deliverables and configurations are licensed exclusively to Acme; underlying platform and service IP remains ours, consistent with standard SaaS terms.
- **Subprocessors (4.5):** Sole-discretion pre-approval of every subprocessor is not workable at our operating scale. We propose a public subprocessor list with 30 days' notice of additions, an objection right, and substitution (or termination of the affected service only) if unresolved.
- **Termination for convenience (3.5):** We propose extending the notice period to 90 days given the scale of onboarding investment, while retaining Acme's no-early-termination-fee ask.

We view all of the above as negotiable within a normal enterprise contracting cycle and are prepared to work through them collaboratively ahead of the 2026-06-30 award date.

## Risks and Mitigations

The principal delivery risk is unvalidated throughput: we have not load-tested sustained 80,000 events/sec ingest concurrently with active EU/US-East data-residency pinning in a single topology. We mitigate this by proposing a joint proof-of-concept during the implementation planning phase, before any production cutover milestone, so performance is proven against Acme's exact topology rather than assumed from our single-region benchmarks.

Commercially, our 28% discount offer and 3-year (not 5-year) price-fixed structure fall short of Acme's stated floor and horizon, and Microsoft Fabric's incumbent Azure/Power BI position is a genuine competitive risk given the weighting of functional fit (30%) and commercial terms (25%) in Acme's evaluation. We mitigate this with a transparent 3-year TCO model that exposes Fabric's hidden Azure-engineering costs, and by leading with breadth (ML, real-time, open formats) rather than contesting Power BI parity directly.

On contracting, several of Acme's standard terms (uncapped liability, no-notice audits, immediate-termination SLA, unrestricted subprocessor veto) are outside positions we can accept as drafted; each has a specific counter-position above, and none are unresolvable, but they should be flagged now given the compressed evaluation timeline so legal alignment isn't a late-stage blocker to the 2026-06-30 award date.

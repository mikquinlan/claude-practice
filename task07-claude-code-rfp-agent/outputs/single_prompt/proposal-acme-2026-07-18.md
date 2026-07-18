# Proposal — Enterprise Data Platform for Acme Corp

**Prepared for:** Acme Corp, Procurement Office
**Prepared by:** BTS-Synthetic
**Date:** 18 July 2026
**In response to:** Acme Corp RFP — Enterprise Data Platform (issued 12 May 2026)

---

## 1. Executive Summary

Acme Corp is replacing a patchwork of on-premises Teradata warehouses and ad-hoc cloud analytics with a single enterprise data platform that must ingest from 40,000 field IoT devices in real time, serve 600 analysts and executives through Power BI, and grow into predictive-maintenance machine learning — all while keeping EU customer data in the EU.

BTS-Synthetic is purpose-built for exactly this shape of workload. We offer:

- **Certified, native Power BI integration** with a dedicated DirectQuery adapter — meeting Acme's non-negotiable requirement outright, for all 600 users on day one.
- **A single platform for real-time ingest *and* large-scale analytics.** Our streaming layer is tested to 250,000 events/second, comfortably above Acme's 80,000/second peak, and feeds the same lakehouse your analysts query. You do not stitch together separate real-time and BI systems.
- **An open lakehouse** on native Delta, Iceberg, and Parquet — no proprietary format lock-in, matching your stated architectural preference and portability requirement.
- **Multi-region, multi-cloud deployment** on Azure (your primary cloud) with per-table EU data-residency pinning — primary EU, secondary US East, as specified.
- **Eight years in production** at enterprise scale, versus far younger entrants in this space.

We have reviewed Acme's commercial and contractual requirements carefully. We can meet the substance of what Acme is protecting — data ownership, service reliability, price stability, and flexibility to exit — and in Sections 3 and 4 we set out terms that deliver those protections in a form both parties can sign and stand behind for five years.

---

## 2. Technical Proposal

### 2.1 Fit against required workloads

| Requirement | BTS-Synthetic capability | Fit |
| --- | --- | --- |
| Real-time ingest, 40k devices, 80k events/s peak | Native Kafka/Kinesis streaming, tested to 250k events/s | **High** |
| Batch ETL from 30+ internal sources | 80+ prebuilt connectors | **High** |
| BI & reporting, 600 analysts/execs | Certified Power BI integration, dedicated DirectQuery adapter | **High** |
| Self-service data prep, 150 data engineers | Dedicated low-code preparation UI | **High** |
| ML for predictive maintenance (planned) | Model registry, feature store, native serving, bring-your-own-model | **High** |
| Lakehouse + open formats (Parquet/Delta/Iceberg) | Native support for all three | **High** |
| Multi-region (EU primary, US East secondary) | Multi-cloud/multi-region on Azure | **High** |
| EU data residency | Per-table residency pinning for EU tables | **High** |

**Overall technical fit: HIGH.** We identified no requirement we cannot meet.

### 2.2 Power BI — leading with your non-negotiable

Acme runs 600 Power BI users today. Our Power BI connector is our most mature BI integration, with a dedicated DirectQuery adapter that lets your analysts query live platform data without export or duplication. This is a certified, in-production integration — not a roadmap item. Migrating your existing reports does not require rebuilding your BI layer.

### 2.3 Query performance at scale — our commitment

Acme's corpus is ~280 TB today, growing ~12 TB/month. To be transparent about how we deliver a fast analyst experience at that scale: our sub-second interactive query performance is delivered through a **hot/cold data-tiering and caching architecture**. Frequently accessed working sets (recent history, common dimensions) are served from warmed caches for sub-second response; full-history and cold-partition queries are served from the lakehouse with predictable, tuned performance.

As part of onboarding we will design the partitioning and caching strategy with your data-engineering team so the 600-analyst experience is fast on the data they actually use day-to-day. We prefer to set this expectation explicitly now rather than have it surface late in a proof-of-concept.

### 2.4 Teradata migration

Our standard full-migration timeline is **16 weeks**, comfortably ahead of Acme's Teradata decommission horizon through 2027. This includes source assessment, schema and pipeline migration, parallel-run validation, and cutover.

### 2.5 Why us against the field

Acme has named Databricks, Snowflake, and Microsoft (Fabric) as fellow bidders. Rather than contest any one of them on their strongest single dimension, we position on breadth and durability:

- **Against a single-cloud Azure/Fabric bet:** an open, multi-cloud, multi-region platform avoids tenant lock-in and gives you real EU-residency control and portability — with eight years of production maturity behind it.
- **Against a compute-first lakehouse:** we deliver real-time ingest *and* the 600-analyst BI layer as one platform, avoiding the analytics-compute cost escalation that comes from bolting BI onto an engine designed for engineering workloads.
- **On total cost and risk over the 3+2 year horizon:** our advantage compounds in years 2 and beyond, which we quantify in the commercial section and TCO model.

---

## 3. Commercial Proposal

BTS-Synthetic is committed to a competitive, transparent, and *stable* five-year commercial relationship. Our positions below are framed to give Acme the price certainty and flexibility it has asked for.

### 3.1 Pricing and discount

We are pleased to offer Acme **Strategic-tier commercial terms**, reflecting the committed multi-year term and reference relationship. We will hold a firm discount band off published list pricing for the full five-year horizon, with **no year-over-year escalator** — meeting Acme's requirement that pricing be fixed at signature.

The specific discount figure and full five-year price schedule are provided in the accompanying commercial schedule (with full pricing transparency for all five years as requested). We note that a 35% floor sits outside the band we can sustain at this scale; the terms we propose deliver durable, escalator-free pricing that we believe compares favourably on total cost of ownership.

### 3.2 Payment terms

We propose **Net 60** payment on annual fees billed in advance — recognising Acme's scale and credit profile — in place of the Net 90 in the RFP.

### 3.3 Term and renewal

We accept the **3-year initial term with a 2-year renewal option**, with pricing fixed and no escalators across the full five years. Renewal-period pricing carries forward at the same rate, subject to a standard volume true-up reflecting actual consumption growth (your stated ~12 TB/month growth and planned ML pipelines).

### 3.4 Most-Favoured-Nation

We are glad to warrant that the terms offered to Acme reflect a genuinely competitive, comparable deal — matched to deal size and term at time of signature. We are not able to offer an open-ended, perpetual MFN warranty over the full contract life, which no vendor can reliably audit or honour; we can commit to comparable treatment for comparable deals at signing.

### 3.5 Total cost of ownership

Because our pricing is fixed and escalator-free, and because a single platform covers real-time, BI, self-service prep, and ML without additional systems, our TCO advantage grows across the 3+2 year horizon. A full five-year TCO model accompanies this proposal.

---

## 4. Contractual Positions

We have reviewed Acme's contractual requirements and set out below terms that protect Acme's core interests — data ownership, reliability, and exit flexibility — in a mutually signable form.

### 4.1 Liability and indemnity

We propose **aggregate liability capped at 24 months' fees**, with mutual carve-outs for IP infringement, gross negligence, and breach of confidentiality. This is a substantial, real commitment. Uncapped liability with open-ended indemnity for regulatory fines and reputational damages is not insurable by any vendor and would not survive underwriting; the capped structure gives Acme meaningful recourse on a foundation both parties can rely on.

### 4.2 Audit

We will support **one audit per calendar year with 30 days' notice**, conducted under confidentiality, with additional audits available at Acme's cost. No-notice audits and unlimited vendor-funded audits are not workable, but annual audited assurance of our controls is something we welcome.

### 4.3 Service levels

We commit to a **99.95% monthly uptime SLA**, with **service credits of up to 30% of monthly fees** as the remedy for any miss. We are open to discussing 99.99% as a *target*. Termination-with-full-refund on any single SLA miss is not a structure we can offer; service credits give Acme a clear, escalating, contractual remedy without destabilising a five-year relationship.

### 4.4 Intellectual property

**Acme owns all of its data, unconditionally.** Custom deliverables — integrations and configurations built for Acme — are **licensed to Acme** for its use. We retain ownership of the underlying platform IP that predates and powers the engagement. This gives Acme full use and control of everything built for it, without assigning it our core technology.

### 4.5 Subprocessors

We maintain a **public subprocessor list** and will give Acme **30 days' notice before adding any subprocessor**, during which Acme may object; if we cannot substitute to Acme's satisfaction, Acme may terminate. This gives Acme real oversight and an exit, in place of case-by-case pre-consent that would stall routine operations.

### 4.6 Termination for convenience

We accept termination for convenience with **60–90 days' notice** (in place of 30), with fees settled on a **pro-rated** basis to the termination date, and a 30-day cure period for termination for cause.

---

## 5. Implementation Plan

| Phase | Duration | Milestones |
| --- | --- | --- |
| Discovery & residency design | Weeks 1–3 | Source inventory (30+), EU-residency table map, hot/cold tiering design |
| Platform stand-up | Weeks 3–6 | Azure multi-region deploy (EU primary, US East secondary), Power BI connector live |
| Data migration (Teradata) | Weeks 4–14 | Schema + pipeline migration, parallel-run validation |
| Real-time ingest onboarding | Weeks 6–12 | 40k-device streaming pipeline, load-tested to peak |
| BI cutover | Weeks 12–16 | 600-analyst Power BI cutover, self-service prep UI for 150 engineers |
| ML enablement (planned workload) | Post-cutover | Feature store + model registry stand-up for predictive maintenance |

Full migration and cutover within **16 weeks**, well ahead of the 2027 Teradata decommission deadline.

---

## 6. Customer References

Three references matching Acme's profile (similar scale, Power BI, Azure) — including an industrial/IoT sensor manufacturer of comparable size — are provided under separate cover with the commercial schedule, per Acme's confidentiality expectations.

---

## 7. Summary

BTS-Synthetic meets every stated functional requirement at **high fit**, leads on Acme's non-negotiable Power BI integration, delivers real-time and analytics on one open, multi-cloud platform, and offers **stable, escalator-free five-year pricing**. Our commercial and contractual positions are shaped to give Acme the protections it is seeking — data ownership, reliability remedies, price certainty, and exit flexibility — in terms both parties can confidently sign for the full 3+2 year horizon.

We welcome the opportunity to walk Acme's evaluation team through a proof-of-concept on your own data.

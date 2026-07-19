# Proposal to Acme Corp — Enterprise Data Platform

**Prepared by BTS-Synthetic for Acme Corp**
**Date: 18 July 2026**
**In response to: Acme Corp Enterprise Data Platform RFP**

---

## 1. Executive summary

- **Lowest true 5-year cost at Acme's real workload.** BTS-Synthetic wins on transparent, fixed 5-year Total Cost of Ownership at Acme's actual profile — 40,000 devices, 80,000 events/second peak, 280 TB growing 12 TB/month — not on a headline license price. This is the same comparison that won us near-identical industrial/IoT deals against Microsoft Fabric and Snowflake.
- **The most mature real-time ingest, governance, and Power BI story in the market.** Native streaming tested to 250,000 events/second (3x Acme's peak), per-table EU data residency with ABAC and PII masking, and a dedicated Power BI DirectQuery adapter — our most mature BI integration — directly answering Acme's non-negotiable 600-user Power BI requirement.
- **Open, portable, multi-cloud by design.** An open-format lakehouse (Delta / Iceberg / Parquet) on your Azure footprint means no proprietary lock-in and full portability — combined with an IP licence-back model that gives Acme complete usage rights to all custom work.

---

## 2. Our understanding of Acme's need

Acme Corp is a global industrial manufacturer — approximately $1.4B in revenue, 7,200 employees, manufacturing across Mexico, Vietnam, and Romania with R&D in Austin and Munich — modernizing its data estate. As we read the RFP, Acme is:

- **Decommissioning legacy Teradata warehouses through 2027** and consolidating onto a modern lakehouse platform.
- **Ingesting at industrial IoT scale:** a fleet of ~40,000 connected devices producing a peak of 80,000 events/second, alongside 30+ internal batch sources feeding a 280 TB estate that grows ~12 TB/month.
- **Standardizing analytics on Power BI** for 600 analysts and executives — an explicitly non-negotiable requirement — while equipping ~150 data engineers with self-service data preparation.
- **Operating under strict governance:** multi-region deployment with EU as primary and US East as secondary, per-table EU data residency, attribute-based access control, and column-level PII masking.
- **Planning predictive-maintenance ML** as a next phase, not yet in production.
- **Buying for the long term:** a 3-year initial term plus a 2-year renewal option, with pricing certainty across the full horizon.

Acme is a Microsoft/Azure shop, and its evaluation weights functional fit (30%), commercial terms (25%), total cost of ownership (20%), and implementation risk (15%) most heavily. Our response is built to lead on exactly those dimensions.

---

## 3. Why BTS-Synthetic is the right fit

We meet or exceed every functional and scale requirement in the RFP, and we differentiate on the areas Acme weights most heavily. Where our standard offering differs from a requirement, we say so plainly and propose a path.

### Real-time ingest maturity at Acme's scale

Native Kafka/Kinesis streaming is tested to **250,000 events/second** in a single region — 3.1x headroom over Acme's 80,000/second peak. This is the same real-time ingest maturity that won us a near-identical industrial/IoT deal (40K devices, comparable event rates) against Microsoft Fabric, where the competing "free with E5" bundle could not hold the SLA at peak rates. Real-time performance at scale is core to this platform, not a bolt-on.

### Governance built for regulated, multi-region operations

Acme's per-table EU residency, ABAC, and PII-masking requirements are precisely the governance profile our platform is hardened for after 8+ years in production for industrial customers:

- Per-table data residency — EU tables pinned to EU regions, enforced, not merely region-isolated.
- Row- and column-level security with attribute-based access control across your 150 engineers and 600 analysts.
- Built-in PII detection and masking, with exportable audit logs to Acme's SIEM.

### The most mature Power BI integration in the market

Acme's one non-negotiable requirement — native Power BI for 600 users — is answered by our **dedicated DirectQuery adapter**, our most mature BI integration. You are not choosing us for BI features; you are choosing us for the 280 TB lakehouse, governance, and real-time ingest that power those 600 Power BI users reliably.

### Open formats, multi-cloud, no lock-in

A native lakehouse supporting **Delta, Iceberg, and Parquet** on your Azure Blob storage means your data stays in open formats you can move — portability and no proprietary exit tax. This directly addresses the portability requirement in the RFP and distinguishes us from single-vendor, closed-format alternatives.

### Coverage across the full requirement set

| Requirement | How we meet it |
|---|---|
| Real-time ingest, 40K devices, 80K events/sec peak | Native streaming tested to 250K events/sec |
| Batch ETL from 30+ internal sources | 80+ prebuilt connectors (Salesforce, SAP, NetSuite, common DBs) + CDC |
| Native Power BI, 600 users | Certified integration with dedicated DirectQuery adapter |
| Lakehouse, open formats (Delta/Iceberg/Parquet) | Native lakehouse supporting all three |
| Multi-region, EU primary / US East secondary | Multi-cloud, multi-region; native Azure Blob backend |
| EU data residency | Per-table residency enforcement |
| ABAC, PII handling | Row/column security with ABAC; built-in PII detection & masking |
| Predictive-maintenance ML (planned) | Model registry, feature store, autoscaling serving; BYO models |
| Self-service prep for ~150 engineers | Low-code data prep interface |

### Where we are transparent about fit

- **Service levels (RFP §4.3).** Our standard Enterprise SLA is **99.95% monthly uptime** with service credits as the remedy. We also offer a **99.99% active-active option** built on bespoke multi-region active-active architecture, available as a priced add-on. We would welcome a conversation on the right target for Acme; we will always commit to what we can reliably deliver rather than over-promise on paper.
- **Query performance at scale.** Our sub-second SQL performance is validated for warmed working sets; we would confirm Acme's actual "hot" working-set size during discovery before quoting specific performance numbers, so any commitment we make is one we can stand behind.
- **Implementation horizon.** Given the scope — full Teradata migration, multi-region rollout, 30+ sources, and a 40K-device streaming buildout — we scope this as a **24-week core delivery** (our large / multi-region / multi-source band), which we detail in Section 5.

---

## 4. Commercial proposal

Our commercial approach is built around what the RFP asks for most directly: **full pricing transparency across five years, fixed at signature.** We can meet that.

### The offer

We propose our **Enterprise tier** at a **strategic discount, held fixed across all five years with no escalators** — honoring Acme's requirement for a locked, transparent five-year price. The table below is the complete five-year picture, including the optional 99.99% active-active SLA tier so Acme sees the whole number, not just a license line.

### Transparent 5-year pricing

| Year | Platform (net) | 99.99% active-active SLA option | Total all-in |
|---|---:|---:|---:|
| 1 | $540,000 | $100,000 | $640,000 |
| 2 | $540,000 | $100,000 | $640,000 |
| 3 | $540,000 | $100,000 | $640,000 |
| 4 (renewal) | $540,000 | $100,000 | $640,000 |
| 5 (renewal) | $540,000 | $100,000 | $640,000 |
| **5-year total** | **$2,700,000** | **$500,000** | **$3,200,000** |

- The platform price is **flat every year** — this is the "full pricing transparency for 5 years" the RFP calls for.
- The 99.99% active-active SLA line is a genuinely incremental scope option (bespoke multi-region active-active architecture); at the 99.95% Enterprise standard it is not required. We show it so the five-year number is complete either way.

### On the discount level

We recognize the RFP sets an ambitious discount target. We want to be a straight partner with Acme here: rather than a deeper headline discount that quietly escalates year over year, we are offering our **strongest fixed price, locked flat for all five years**. In practice, a flat five-year price beats a larger opening discount that then rises with inflation each year — Acme gets both a strong rate and complete certainty. We'd welcome the chance to align on the target together and walk through the lifetime numbers side by side; we're confident the transparent five-year total is where we win.

**Why this is the lowest true cost.** Against a Microsoft Fabric "free with E5" headline, the five-year reality includes the consulting hours to actually stand up real-time IoT ingest, EU-residency governance, and 600-user Power BI; continuously billed peak-capacity provisioning for 80K events/second; and eventual migration cost out of proprietary formats. Our $3.2M is the whole, fixed, transparent five-year number — the same comparison that won us near-identical IoT and manufacturing deals against Fabric and Snowflake.

### Term and payment

- **Term:** 3-year initial term with a 2-year renewal option, priced as shown.
- **Payment:** annual in advance. We can offer **Net 60** terms, and **quarterly billing at no change in price** if that better suits Acme's cash-flow preferences.

---

## 5. Implementation plan

We scope this as a **24-week core delivery**, baselined to the first full week after award, with Teradata decommission tail-waves continuing through 2027 in step with Acme's own sunset schedule. The phases below run largely in parallel — that concurrency is how this much scope lands in 24 weeks — with hard exit gates at each stage.

| Phase | Weeks | Timing (approx.) | Key milestone / exit gate |
|---|---|---|---|
| 0 — Discovery & Mobilization | W1–W3 | Jul–Jul '26 | Source inventory confirmed; 40K-device fleet profiled; per-table EU residency map signed; target architecture approved by CDO |
| 1 — Landing Zone (Azure) & Residency | W2–W6 | Jul–Aug '26 | Active-active landing zone (EU primary / US-East secondary); per-region residency pinning; catalog + ABAC + PII masking; audit-log export. Gate: security review passed |
| 2 — Real-time Ingest Onboarding | W5–W12 | Aug–Oct '26 | Streaming live; pilot cohort → full 40K-device fleet by facility wave; load-tested to 160K events/sec (2x peak). Gate: full fleet streaming at peak |
| 3 — Batch ETL + CDC (30+ sources) | W6–W16 | Aug–Nov '26 | Connectors + CDC delivered in three waves. Gate: all 30+ sources landing with reconciliation within tolerance |
| 4 — Power BI DirectQuery Cutover | W10–W18 | Sep–Nov '26 | DirectQuery adapter deployed; gold-layer models; phased cutover of 600 analysts + 150 engineers. Gate: 600 users live, report parity signed |
| 5 — Teradata Migration & Decommission | W8–W22 (+2027 tail) | Aug '26 → ongoing | Automated dialect conversion; 280 TB backfill in subject-area waves; parallel run + double reconciliation before each decommission. Gate: critical subject areas migrated & validated |
| 6 — ML Predictive-Maintenance Enablement | W16–W22 | Nov–Dec '26 | Feature store fed by IoT telemetry; model registry + serving; one pilot predictive-maintenance model. Gate: feature store live, pilot model served |
| 7 — Go-live + Hypercare | W20–W24 (+hypercare) | Nov '26–Jan '27 | Active-active failover/DR test; production go-live; 4-week hypercare war room. Gate: steady-state ops handover |

The two decisions everything depends on — the EU residency classification and the multi-region architecture — are front-loaded and locked before any data moves. The Teradata migration is deliberately the longest thread, paced to Acme's own 2027 sunset so there is never a big-bang cutover of 280 TB.

---

## 6. Contract approach

We have reviewed the commercial and contractual terms in the RFP carefully and in good faith. We can meet the great majority of Acme's requirements as drafted — including EU data residency, no early-termination penalties, and a custom master agreement. On a small number of terms, our standard positions differ, and we set them out transparently below so we can resolve them efficiently before signature. In each case our aim is a balanced, market-standard construct that protects both parties.

- **Liability & indemnification (§4.1).** We propose an elevated liability cap set at 24 months of fees for data-breach matters (with mutual carve-outs for gross negligence, wilful misconduct, and IP infringement), and indemnification covering third-party claims, breach-notification and credit-monitoring costs. This is consistent with market-standard data-processing terms and with maintaining the insurance coverage that ultimately protects Acme.
- **Audit rights (§4.2).** We propose one on-site controls audit per year with 30 days' notice (additional audits available with notice, at Acme's cost), and we will provide our current SOC 2 Type II report and annual penetration-test summary — which satisfies most enterprise compliance needs without operational disruption.
- **Service levels (§4.3).** We propose our 99.95% Enterprise standard (or the 99.99% active-active option) with service credits on a sliding scale as the remedy, and termination rights tied to chronic, uncured SLA failure with a cure period — a construct that protects Acme while remaining one we can reliably stand behind.
- **Intellectual property (§4.4).** We propose our **IP licence-back model**: BTS-Synthetic retains ownership of work product and platform IP, and grants Acme a full, perpetual, royalty-free licence to use, modify, and operate all custom work for its business. Acme gets complete usage rights without owning our underlying platform — the same structure that resolved an identical requirement for another enterprise customer.
- **Subprocessors (§4.5).** We propose a public subprocessor list with 30 days' advance notice of any new subprocessor and a right for Acme to object, with termination of the affected service as the remedy — an operationally workable alternative to blanket pre-approval.
- **Pricing warranty / MFN (§3.4).** In place of an ongoing most-favoured-nation warranty — which is functionally unauditable across thousands of differently-structured customers — we commit directly to the discount negotiated in this agreement, which addresses Acme's underlying pricing objective without an open-ended benchmarking obligation.
- **Termination (§3.5).** We are aligned on no early-termination penalties. We propose 90 days' notice for termination for convenience (or a short minimum commitment period reflecting the implementation buildout, after which shorter notice applies).

None of these are obstacles to a strong partnership; they are the normal shape of a balanced enterprise agreement, and we are confident we can close them quickly with Acme's legal team.

---

## 7. Customer references

We are pleased to offer three references at similar scale and profile — all industrial/IoT manufacturers on the Microsoft/Azure ecosystem, each mapping to a dimension of Acme's requirements. Named reference calls will be arranged with each customer's consent as part of the evaluation.

| Reference | Industry | Scale / workload match | Deployment context | Why they chose BTS-Synthetic |
|---|---|---|---|---|
| **Initech Sensors** | Industrial / IoT sensors (near-identical to Acme) | High-volume real-time sensor ingest with governance (residency, access control, PII) | Microsoft-ecosystem shop; evaluated Microsoft Fabric head-to-head | The only platform that held the real-time ingest SLA at peak event rates — Fabric could not match it even bundled "free" with E5 |
| **Globex Manufacturing** | Industrial / Manufacturing | Closest deal-size match; heavy mixed/unstructured workload | Multi-cloud, open-format lakehouse; evaluated Snowflake and Databricks | Won a like-for-like 3-year TCO comparison at their actual workload; open multi-cloud architecture avoided single-vendor lock-in |
| **Wayne Manufacturing** | Industrial manufacturing | Same vertical; validated on real data before commit | Evaluated Snowflake; chose a proof-first path | Proved it in a 90-day proof-of-concept on their own data before signing, with the PoC fee credited into Year 1 |

---

## 8. Risks and how we mitigate them

We believe in surfacing delivery risk early and engineering it out. The three we watch most closely on a program of this scope, and our mitigations:

1. **High-availability target.** Acme's 99.99% uptime aspiration exceeds a standard Enterprise SLA and calls for a multi-region active-active architecture. *Mitigation:* we design active-active EU/US-East into the landing zone from Phase 1 rather than retrofitting it, and we gate go-live on a scripted regional failover/DR test with SLA instrumentation running from day one of hypercare. We will also align with Acme on SLA terms that are both robust and reliably deliverable.

2. **Teradata migration across 280 TB and 30+ sources.** Legacy warehouses carry dialect incompatibilities and undocumented dependencies. *Mitigation:* automated Teradata-to-ANSI-SQL conversion; strictly wave-based migration by subject area with a parallel run and two clean reconciliation cycles before any decommission; and a decommission tail deliberately paced to Acme's own 2027 sunset — never a big-bang cutover.

3. **Onboarding 40,000 devices at peak with governance enforced.** Raw throughput is comfortably within envelope (80K/sec vs. our tested 250K/sec); the real work is fleet onboarding across four countries with EU residency routing and ABAC enforced at the streaming layer. *Mitigation:* staged onboarding starting from a single-facility pilot cohort, a 160K events/sec (2x peak) load test before scale-out, and validation of per-table residency routing and PII masking on the pilot before any EU production telemetry flows.

We look forward to walking through this proposal with the Acme team and to earning the opportunity to deliver Acme's next-generation data platform.

---

*BTS-Synthetic — Enterprise Data Platform*

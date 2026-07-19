# Executive Summary

- **Strong technical fit.** BTS-Synthetic's lakehouse platform covers
  every workload in Acme's RFP --- 80,000 events/sec real-time ingest,
  30+ source batch ETL, native Power BI for 600 users, self-service prep
  for 150 engineers, and open-format (Parquet/Delta/Iceberg) storage
  with per-table EU data residency enforcement across a multi-region
  EU-primary/US-East-secondary deployment.
- **Differentiated position against Fabric, Databricks, and Snowflake.**
  We offer Power BI maturity Fabric can't match outside Azure lock-in,
  and predictable multi-cloud TCO where Databricks compute costs
  typically balloon by year two. We propose leading with a 3-year TCO
  comparison rather than competing on list-price optics alone.
- **Commercial terms require negotiation, not rejection.** Several
  requested terms (35% discount floor, uncapped liability, no-notice
  audits, immediate-termination SLA, perpetual MFN) sit outside our
  standard and even strategic approval bands. We propose a package of
  counter-positions below that preserves the deal economics while
  meeting Acme's underlying intent on cost predictability,
  accountability, and audit rights.

# Our Understanding of Your Need

Acme Corp is consolidating a fragmented data estate --- legacy
on-premises Teradata warehouses (decommissioning through 2027) and
ad-hoc cloud analytics --- onto a single enterprise data platform. The
platform must support real-time IoT telemetry from \~40,000 field
devices at up to 80,000 events/second, batch integration from 30+
internal systems, BI/reporting for 600 analysts and executives with
non-negotiable native Power BI support, self-service data preparation
for 150 data engineers, and a forward path to ML-driven predictive
maintenance. As a Microsoft/Azure shop with EU and US operations
spanning 18 countries, Acme requires multi-region deployment (EU
primary, US East secondary) with strict EU data residency, built on an
open, portable lakehouse architecture. You are evaluating us alongside
Databricks, Snowflake, Microsoft Fabric, and one regional vendor,
weighing functional fit (30%), commercial terms (25%), 5-year TCO (20%),
implementation risk (15%), and vendor stability (10%).

# Why We're the Right Fit

**Technical fit: HIGH.** Every stated workload and capability
requirement is met by our current product, with no material gaps:

- Real-time ingest tested to 250,000 events/sec (single-region)
  comfortably exceeds Acme's 80,000/sec peak; we will validate sustained
  throughput under the specific multi-region/EU-residency topology Acme
  requires before finalizing commitments, rather than assuming linear
  scaling.
- 80+ connectors cover Acme's 30+ internal batch sources.
- Power BI integration is our most mature BI integration, with a
  dedicated DirectQuery adapter --- a direct answer to Acme's
  non-negotiable requirement.
- Native Delta, Iceberg, and Parquet support directly matches the
  requested lakehouse/open-format architecture, and per-table residency
  controls let us pin EU tables to EU infrastructure specifically while
  serving US East as secondary.
- Model registry, feature store, and autoscaling model serving are in
  place today for the planned predictive-maintenance ML pipelines ---
  capability exists ahead of Acme's need.
- Proposed implementation follows our standard legacy-warehouse
  migration path (comparable to past Teradata/Hadoop migrations): first
  production workload live in 8 weeks, core BI/Power BI cutover and
  self-service enablement by week 12, full migration readiness by weeks
  16--24 --- comfortably inside Acme's 2027 Teradata decommission
  window.

**Competitive position.** Microsoft Fabric will be the toughest
procurement-level competitor given Acme's existing Microsoft footprint
and Power BI requirement, but Fabric's Azure-only architecture conflicts
with Acme's multi-region, multi-country residency needs, and its
18-month product maturity carries execution risk at this scale.
Databricks is the closest technical competitor on
lakehouse/open-format/ML ground --- we match their real-time ingest and
open-format story while adding Power BI maturity they don't have, and we
will show a 3-year TCO comparison highlighting typical Databricks
compute-cost growth against our predictable consumption model. Snowflake
is the weakest fit here: real-time ingest at Acme's scale and lakehouse
architecture are not their strength. Our positioning: **"Lakehouse for
real-time, SQL, and BI in any cloud, with predictable costs and no
vendor lock-in --- full Power BI maturity from day one."**

# Commercial Proposal

Acme's RFP requests: a 35%+ discount off list, 5-year pricing fixed at
signature with no escalators, Net 90 payment, and a perpetual
most-favoured-nation (MFN) warranty. Given Acme's scale (\~280TB, 40,000
devices, 750 total users, multi-region EU/US), this is a strategic-tier
deal, and we want to win it on the right terms:

- **Discount:** We propose an opening discount of 22--25%, moving to
  **28--30%** (our top strategic band) contingent on a 3-year firm
  commitment and reference-customer rights --- comparable to our Stark
  Industries engagement (similar scale, 5-year term, closed at 28%). We
  will not open at 35%; that discount level is reserved for
  low-differentiation commodity deals, which this is not. We'll anchor
  the conversation in 5-year TCO rather than headline discount, where
  our proposal compares favorably to Databricks and Fabric once
  implementation and compute-scaling costs are included.
- **Payment terms:** We propose Net 60 in place of Net 90, consistent
  with terms extended to comparably-sized customers.
- **Pricing horizon:** We propose fixing pricing for the 3-year initial
  term, with the 2-year renewal carrying a pre-agreed cap (CPI+2%,
  capped at 5% annually) rather than an unconditional 5-year lock ---
  this protects both parties from unpredictable cost swings while still
  giving Acme budget certainty.
- **MFN:** We are not able to offer an open-ended MFN warranty; we
  propose a benchmarking/most-favoured review clause exercisable at
  renewal instead.

# Contract Approach

Several requested contractual terms fall outside our standard risk
tolerance. We flag these now so they can be resolved collaboratively
rather than becoming late-stage surprises:

  --------------------------------------------------------------------------
  Term                 Acme's Ask                 Our Position
  -------------------- -------------------------- --------------------------
  Liability (4.1)      Uncapped, full             Cap aggregate liability at
                       indemnification            24 months' fees; mutual
                       incl. fines/reputational   carve-outs for gross
                       damages                    negligence/IP
                                                  infringement; indemnify
                                                  direct breach-response
                                                  costs, not regulatory
                                                  fines

  Audits (4.2)         No-notice, 4x/year,        1x/year, 30 days' notice,
                       vendor-paid                confidentiality
                                                  protections; vendor covers
                                                  first audit annually

  SLA (4.3)            99.99% uptime, immediate   99.95% uptime with tiered
                       termination + full refund  service credits (capped at
                       on any miss                30% of monthly fees);
                                                  termination only after
                                                  sustained/repeated
                                                  failures

  IP (4.4)             All work product vests in  Customer data remains
                       Acme                       Acme's; customer-specific
                                                  configurations/reports
                                                  licensed for Acme's use;
                                                  underlying platform IP
                                                  retained by BTS-Synthetic

  Subprocessors (4.5)  Prior consent at Acme's    Published subprocessor
                       sole discretion            list, 30 days' notice
                                                  before additions,
                                                  objection rights with
                                                  substitution/termination
                                                  option

  Termination (3.5)    30 days, no cause, no fee  Termination for
                                                  convenience acceptable;
                                                  propose 60--90 days'
                                                  notice

  MFN (3.4)            Perpetual, all comparable  Benchmarking review at
                       customers                  renewal, not a running
                                                  warranty

  Payment (3.2)        Net 90                     Net 60
  --------------------------------------------------------------------------

None of these are posture for posture's sake --- each maps to a real
operational or financial constraint (insurance coverage limits, audit
operations capacity, margin protection). We believe all are resolvable
through negotiation without compromising Acme's core intent of
accountability, cost control, and vendor oversight.

# Risks and How We Mitigate Them

- **Commercial gap between the RFP's stated 35% floor and our approvable
  band (up to 30% strategic).** Mitigation: lead with TCO economics
  rather than headline discount; qualify the deal for our top strategic
  tier via 3-year commitment and reference rights.
- **Multiple legal terms (uncapped liability, no-notice audits,
  immediate-termination SLA, full IP assignment, unilateral subprocessor
  consent) fall outside our standard contract risk tolerance.**
  Mitigation: counter-positions above address Acme's underlying intent
  (accountability, oversight, cost predictability) within terms we can
  responsibly commit to.
- **Multi-region throughput under EU-residency constraints is not yet
  independently validated** against our single-region 250,000 events/sec
  benchmark. Mitigation: we will confirm sustained throughput figures
  for the specific EU-primary/US-secondary topology during technical due
  diligence, before any performance commitment is finalized in contract.
- **Competitive pressure from Microsoft Fabric on procurement grounds**
  given Acme's existing Microsoft estate. Mitigation: emphasize
  multi-cloud flexibility and EU residency enforcement that Azure-only
  Fabric cannot match, plus Fabric's relative immaturity at this scale.

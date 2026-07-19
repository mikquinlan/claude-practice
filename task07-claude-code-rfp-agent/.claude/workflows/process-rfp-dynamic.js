export const meta = {
  name: 'process-rfp-dynamic',
  description: 'Process an inbound RFP: 4 core specialists in parallel, synthesize a customer proposal with a completeness check, then the internal risk assessment',
  phases: [
    { title: 'Specialists', detail: '4 core specialists in parallel: pricing, legal, technical_fit, competitive' },
    { title: 'Architecture', detail: 'derive 1 Azure architecture, draw it with the drawio skill using real Azure icons' },
    { title: 'Proposal', detail: 'synthesize, verify produced, completeness critic, docx conversion' },
    { title: 'Risk', detail: 'internal risk assessment HTML dashboard' },
  ],
}

const rfpPath = (args && args.rfpPath) || 'synthetic-data/rfp-acme-corp.md'
const customer = (args && args.customer) || 'acme-corp'
const date = (args && args.date) || 'undated'
if (!(args && args.date)) {
  log('No args.date passed to this workflow — output filenames will use "undated". Pass { date: "YYYY-MM-DD" } for real runs.')
}

async function verifyProduced(path, regenerate, attempt, verifyPhase = 'Proposal') {
  const check = await agent(
    `Run: test -f "${path}" && echo EXISTS || echo MISSING. Reply with exactly that one word, nothing else.`,
    { label: `verify:${path}`, phase: verifyPhase }
  )
  if (check.includes('EXISTS')) return true
  if (attempt >= 1) return false
  log(`${path} was not produced — retrying once`)
  await regenerate()
  return verifyProduced(path, regenerate, attempt + 1, verifyPhase)
}

phase('Specialists')

const SPECIALIST_BRIEFS = [
  {
    agentType: 'pricing',
    label: 'pricing',
    brief: `Read the RFP at ${rfpPath}. Recommend commercial terms for this deal per the pricing-playbook skill ` +
      `and synthetic-data/past-wins.json: list price + discount band, term/payment structure, concessions you'd ` +
      `accept vs refuse, risks to margin. Be specific about numbers, cite past-wins.json. ~300 words.`,
  },
  {
    agentType: 'legal',
    label: 'legal',
    brief: `Read the RFP at ${rfpPath}. Flag every clause that conflicts with our standard positions per the ` +
      `legal-checklist skill: the requirement, why it conflicts, our counter-position, severity ` +
      `(blocker/negotiable/acceptable). ~300 words.`,
  },
  {
    agentType: 'technical_fit',
    label: 'technical_fit',
    brief: `Read the RFP at ${rfpPath}. Assess fit against synthetic-data/product-overview.md: requirements met ` +
      `fully / partially / not at all, overall fit score (high/medium/low), the single biggest risk to flag. ~300 words.`,
  },
  {
    agentType: 'competitive',
    label: 'competitive',
    brief: `Read the RFP at ${rfpPath}. Identify the 2-3 most likely competitors per the competitive-intel skill, ` +
      `their strengths/weaknesses on this deal, our two best positioning angles, one trap to avoid. ~300 words.`,
  },
]

const specialistResults = await parallel(
  SPECIALIST_BRIEFS.map(s => () => agent(s.brief, { agentType: s.agentType, label: s.label, phase: 'Specialists' }))
)
const [pricing, legal, tech, competitive] = specialistResults
log('4 specialists returned: pricing, legal, technical_fit, competitive')

phase('Architecture')

// Standalone Azure solution-architecture diagram, drawn with the agents365 drawio skill.
// Lightweight derive: one agent derives a single recommended Azure architecture from the RFP +
// technical_fit findings, then draws it with REAL Azure icons (no guessed style strings).
const archDrawio = `outputs/arch_wbs_extension/architecture-${customer}-${date}.drawio`
const archPng = `outputs/arch_wbs_extension/architecture-${customer}-${date}.png`

async function drawArchitecture(note) {
  const fixNote = note ? `\n\nThe previous attempt failed — fix this and retry:\n${note}` : ''
  return agent(
    `Derive and draw the recommended Azure solution architecture for the RFP at ${rfpPath}.\n\n` +
      `STEP 1 — derive ONE architecture. Read the RFP and use the Technical Fit findings below. Reason from the ` +
      `RFP's real signals (data volumes, region/residency, latency/SLA, integration surface, existing stack) to a ` +
      `single credible Azure topology for the Enterprise Data Platform: region layout, networking/landing zone, ` +
      `ingestion, storage/lakehouse, compute/analytics, serving, security/governance, and integration points.\n\n` +
      `TECHNICAL FIT FINDINGS:\n${tech}\n\n` +
      `STEP 2 — draw it with the drawio skill (invoke the \`drawio:drawio-skill\` skill; it wraps the draw.io ` +
      `desktop CLI). Requirements — follow exactly:\n` +
      `- For EVERY Azure component, get the exact official style string first: ` +
      `\`python3 <drawio-skill>/scripts/shapesearch.py "azure <service>"\` (e.g. "azure synapse", "azure data ` +
      `lake", "azure data factory", "azure event hub", "azure key vault"). Use the returned ` +
      `\`image=img/lib/azure2/...\` style verbatim. Do NOT guess or hand-write style strings, and do NOT use ` +
      `generic boxes where a real Azure icon exists.\n` +
      `- Group the resources inside an Azure cloud / subscription / resource-group container using the official ` +
      `Azure grouping shape (shapesearch "azure subscription" / "azure resource group" / "azure cloud").\n` +
      `- Hand-author the .drawio XML (see the skill's references/xml-authoring.md) and save it to ${archDrawio}.\n` +
      `- Export a PNG preview: \`drawio -x -f png --width 2000 -o ${archPng} ${archDrawio}\` (no -e, stays under the ` +
      `vision size limit). Then read the PNG back and self-check the icons render as real Azure shapes.\n\n` +
      `This is a standalone deliverable — do NOT modify the proposal. Produce exactly two files: ${archDrawio} and ${archPng}.` +
      fixNote,
    { agentType: 'general-purpose', label: 'architecture', phase: 'Architecture' }
  )
}

await drawArchitecture()

const archDrawioExists = await verifyProduced(archDrawio, () => drawArchitecture('the .drawio XML was not saved'), 0, 'Architecture')
if (!archDrawioExists) throw new Error(`Architecture .drawio was never produced at ${archDrawio} after retry`)
const archPngExists = await verifyProduced(archPng, () => drawArchitecture('the .drawio exists but PNG export failed'), 0, 'Architecture')
if (!archPngExists) throw new Error(`Architecture PNG was never exported at ${archPng} after retry`)
log(`Azure architecture diagram: ${archDrawio} + ${archPng}`)

phase('Proposal')

const proposalMd = `outputs/arch_wbs_extension/proposal-${customer}-${date}.md`
const proposalDocx = `outputs/arch_wbs_extension/proposal-${customer}-${date}.docx`

async function writeProposalDraft(critique) {
  const critiqueNote = critique ? `\n\nA completeness critic flagged issues with the previous draft — fix them:\n${critique}` : ''
  return agent(
    `Synthesize a customer-facing proposal for the RFP at ${rfpPath} from these 4 specialist findings.\n\n` +
      `PRICING:\n${pricing}\n\nLEGAL:\n${legal}\n\nTECHNICAL FIT:\n${tech}\n\nCOMPETITIVE:\n${competitive}\n\n` +
      `Cover: executive summary (3 bullets), our understanding of the customer's need, why we're the right fit ` +
      `(drawing on technical fit + competitive), commercial proposal (drawing on pricing), contract approach ` +
      `(drawing on legal), risks and mitigations. Customer-facing only — no internal risk scores, margin figures, ` +
      `the word "blocker", or anything from an internal-only register. Write the full proposal as Markdown to ${proposalMd}.` +
      critiqueNote,
    { agentType: 'deal-desk-orchestrator', label: 'synthesize', phase: 'Proposal' }
  )
}

await writeProposalDraft()

const proposalExists = await verifyProduced(proposalMd, () => writeProposalDraft(), 0)
if (!proposalExists) throw new Error(`Proposal draft was never produced at ${proposalMd} after retry`)

const critique = await agent(
  `Read ${proposalMd}. You are a completeness critic. Check against the 4 specialist findings below for: ` +
    `(1) anything material missing or contradicted, (2) any internal-only content leaking into a customer-facing ` +
    `document — internal risk scores, margin %, the word "blocker", anything from a risk register. If clean, reply ` +
    `exactly "PASS". If not, reply with a short numbered list of fixes.\n\n` +
    `PRICING:\n${pricing}\n\nLEGAL:\n${legal}\n\nTECHNICAL FIT:\n${tech}\n\nCOMPETITIVE:\n${competitive}`,
  { label: 'completeness-critic', phase: 'Proposal' }
)

if (!critique.trim().startsWith('PASS')) {
  log('Completeness critic found issues — regenerating proposal once')
  await writeProposalDraft(critique)
}

await agent(
  `Convert ${proposalMd} to ${proposalDocx} using the docx skill (pandoc). Verify the output file is non-zero size.`,
  { agentType: 'general-purpose', label: 'docx', phase: 'Proposal' }
)

const docxExists = await verifyProduced(proposalDocx, () =>
  agent(`Convert ${proposalMd} to ${proposalDocx} using the docx skill (pandoc) — it's missing.`,
    { agentType: 'general-purpose', label: 'docx-retry', phase: 'Proposal' }), 0)
if (!docxExists) throw new Error(`Proposal docx was never produced at ${proposalDocx} after retry`)

phase('Risk')

const riskHtml = `outputs/arch_wbs_extension/risk-assessment-${customer}-${date}.html`

await agent(
  `Run your three-step risk-assessment process for the RFP at ${rfpPath}. You have the 4 specialist findings and ` +
    `the proposal draft below.\n\nPRICING:\n${pricing}\n\nLEGAL:\n${legal}\n\nTECHNICAL FIT:\n${tech}\n\n` +
    `COMPETITIVE:\n${competitive}\n\nProduce the self-contained interactive HTML dashboard at ${riskHtml}. ` +
    `This is internal only — never customer-facing.`,
  { agentType: 'risk_assessment', label: 'risk', phase: 'Risk' }
)

const riskExists = await verifyProduced(riskHtml, () =>
  agent(`Produce the risk-assessment HTML dashboard at ${riskHtml} per your skill's Step 3 — it's missing.`,
    { agentType: 'risk_assessment', label: 'risk-retry', phase: 'Risk' }), 0)
if (!riskExists) throw new Error(`Risk assessment was never produced at ${riskHtml} after retry`)

log(`Done. Proposal: ${proposalDocx}. Risk dashboard: ${riskHtml}.`)

return { pricing, legal, tech, competitive, archDrawio, archPng, proposalMd, proposalDocx, riskHtml }

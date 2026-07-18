export const meta = {
  name: 'process-rfp-arch-wbs',
  description: 'Process an inbound RFP with an architecture debate + WBS: specialists -> architecture debate -> WBS -> customer proposal -> internal risk assessment',
  phases: [
    { title: 'Specialists', detail: '4 core specialists in parallel: pricing, legal, technical_fit, competitive' },
    { title: 'Architecture', detail: 'derive 3 Azure candidates, position papers, one refutation round, commercial scoring, judge (Opus), drawio diagram with real Azure icons, internal debate HTML', model: 'claude-opus-4-8 (judge call only)' },
    { title: 'WBS', detail: '4 owners decompose in dependency order: infra -> data -> app -> test' },
    { title: 'Proposal', detail: 'synthesize with winner + WBS, verify produced, completeness/leak critic, docx conversion' },
    { title: 'Risk', detail: 'internal risk assessment HTML dashboard, with an additive WBS delivery-risk card' },
  ],
}

// Copied from process-rfp-dynamic.js (the baseline stays untouched) with two phases inserted
// between Specialists and Proposal, and an _arch_wbs suffix on every output artifact.

const rfpPath = (args && args.rfpPath) || 'synthetic-data/rfp-acme-corp.md'
const customer = (args && args.customer) || 'acme-corp'
const date = (args && args.date) || 'undated'
if (!(args && args.date)) {
  log('No args.date passed to this workflow — output filenames will use "undated". Pass { date: "YYYY-MM-DD" } for real runs.')
}

async function verifyProduced(path, regenerate, attempt, phaseLabel) {
  const check = await agent(
    `Run: test -f "${path}" && echo EXISTS || echo MISSING. Reply with exactly that one word, nothing else.`,
    { label: `verify:${path}`, phase: phaseLabel }
  )
  if (check.includes('EXISTS')) return true
  if (attempt >= 1) return false
  log(`${path} was not produced — retrying once`)
  await regenerate()
  return verifyProduced(path, regenerate, attempt + 1, phaseLabel)
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

const debateHtml = `outputs/architecture-debate-${customer}-${date}_arch_wbs.html`
const diagramDrawio = `outputs/arch-diagram-${customer}-${date}_arch_wbs.drawio`
const diagramPng = `outputs/arch-diagram-${customer}-${date}_arch_wbs.png`

const candidatesText = await agent(
  `Derive exactly 3 credible Azure architecture candidates for delivering the Enterprise Data Platform against ` +
    `the RFP at ${rfpPath}, per the architecture-debate skill's Step 1, using the Technical Fit findings below. ` +
    `For each candidate give: a short name, a one-paragraph topology summary, the RFP requirements it's ` +
    `optimised for, and its most obvious weakness. Number them 1, 2, 3 and label each clearly — the exact text ` +
    `you return here will be split by candidate number and handed individually to 3 advocates, so keep the ` +
    `numbering unambiguous.\n\nTECHNICAL FIT:\n${tech}`,
  { label: 'derive-candidates', phase: 'Architecture' }
)

const positions = await parallel([1, 2, 3].map(n => () =>
  agent(
    `You are Architecture Advocate for candidate ${n} ONLY. Here are all 3 candidates as derived by the ` +
      `coordinator — find candidate ${n} and champion it per your agent brief's Round 1 instructions. Do not ` +
      `champion the others.\n\n${candidatesText}\n\nRFP: ${rfpPath}\n\nTECHNICAL FIT:\n${tech}`,
    { agentType: 'arch_advocate', label: `advocate-${n}-position`, phase: 'Architecture' }
  )
))

const refutations = await parallel([0, 1, 2].map(i => () =>
  agent(
    `You are the advocate who wrote this position paper (candidate ${i + 1}):\n${positions[i]}\n\n` +
      `Here are the other two advocates' position papers:\n\n` +
      `${positions.filter((_, j) => j !== i).map((p, k) => `RIVAL ${k + 1}:\n${p}`).join('\n\n')}\n\n` +
      `Per your agent brief's Round 2 instructions, write one refutation memo attacking both rivals' weakest ` +
      `points. Do not defend your own candidate again.`,
    { agentType: 'arch_advocate', label: `advocate-${i + 1}-refutation`, phase: 'Architecture' }
  )
))

const scoring = await agent(
  `Score all 3 candidates per the architecture-debate skill's commercial rubric (TCO 20%, delivery risk 40%, ` +
    `5-year fixed-price margin exposure 40%).\n\nCANDIDATES:\n${candidatesText}\n\nPOSITION PAPERS:\n` +
    `${positions.join('\n\n---\n\n')}\n\nREFUTATIONS:\n${refutations.join('\n\n---\n\n')}`,
  { agentType: 'arch_commercial', label: 'commercial-scoring', phase: 'Architecture' }
)

const judgment = await agent(
  `You are judging the architecture debate. Read all 3 candidates, position papers, refutations, and the ` +
    `commercial scoring below. Name exactly 1 winner. For the 2 losers, record why they lost — cite the specific ` +
    `refutation point or commercial score that sank them. Then give the winner's FULL description (name + ` +
    `topology + optimised-for + weakness) verbatim so it can be handed to the WBS phase.\n\n` +
    `CANDIDATES:\n${candidatesText}\n\nPOSITION PAPERS:\n${positions.join('\n\n---\n\n')}\n\nREFUTATIONS:\n` +
    `${refutations.join('\n\n---\n\n')}\n\nCOMMERCIAL SCORING:\n${scoring}\n\nStructure your reply exactly as:\n` +
    `WINNER: <name>\nWINNER DESCRIPTION: <full description>\nWHY LOSERS LOST: <both, with rationale>`,
  { agentType: 'deal-desk-orchestrator', label: 'judge', phase: 'Architecture', model: 'claude-opus-4-8' }
)

log('Judge returned a winner — generating the Azure diagram and the internal debate HTML')

async function drawDiagram(note) {
  const fixNote = note ? `\n\nThe previous attempt failed — fix this and retry:\n${note}` : ''
  return agent(
    `Draw the Azure solution architecture for the WINNING candidate ONLY (below). Do not draw the losers and do ` +
      `not re-derive an architecture — the topology is already decided.\n\n` +
      `WINNING ARCHITECTURE (from the debate judge):\n${judgment}\n\n` +
      `Draw it with the drawio skill (invoke the \`drawio:drawio-skill\` skill; it wraps the draw.io desktop CLI), ` +
      `following the architecture-debate skill's Step 5. Requirements — follow exactly:\n` +
      `- For EVERY Azure component, get the exact official style string first: ` +
      `\`python3 <drawio-skill>/scripts/shapesearch.py "azure <service>"\` (e.g. "azure synapse", "azure data ` +
      `lake", "azure data factory", "azure event hub", "azure key vault"). Use the returned ` +
      `\`image=img/lib/azure2/...\` style verbatim. Do NOT guess or hand-write style strings, and do NOT use ` +
      `generic boxes where a real Azure icon exists.\n` +
      `- Group the resources inside an Azure cloud / subscription / resource-group container using the official ` +
      `Azure grouping shape (shapesearch "azure subscription" / "azure resource group" / "azure cloud").\n` +
      `- Hand-author the .drawio XML (see the skill's references/xml-authoring.md) and save it to ${diagramDrawio}.\n` +
      `- Export the PNG: \`drawio -x -f png --width 2000 -o ${diagramPng} ${diagramDrawio}\` (no -e, stays under ` +
      `the vision size limit). Then read the PNG back and self-check the icons render as real Azure shapes, not ` +
      `grey rectangles.\n\n` +
      `Produce exactly two files: ${diagramDrawio} and ${diagramPng}.` +
      fixNote,
    { agentType: 'general-purpose', label: 'diagram', phase: 'Architecture' }
  )
}

await drawDiagram()

const diagramDrawioExists = await verifyProduced(diagramDrawio, () =>
  drawDiagram('the .drawio XML was not saved'), 0, 'Architecture')
if (!diagramDrawioExists) throw new Error(`Architecture .drawio was never produced at ${diagramDrawio} after retry`)

const diagramExists = await verifyProduced(diagramPng, () =>
  drawDiagram('the .drawio exists but the PNG export failed'), 0, 'Architecture')
if (!diagramExists) throw new Error(`Architecture diagram was never produced at ${diagramPng} after retry`)

await agent(
  `Assemble the internal architecture-debate HTML at ${debateHtml}. Self-contained (inline CSS/JS only). Must ` +
    `show: all 3 candidates, both refutation rounds, the commercial scoring table, why each loser lost, and the ` +
    `winner's diagram embedded inline as a base64 data URI (base64-encode ${diagramPng} yourself via Bash and ` +
    `inline it — do not reference it as an external file). This is internal only — never share with the customer.\n\n` +
    `CANDIDATES:\n${candidatesText}\n\nPOSITION PAPERS:\n${positions.join('\n\n---\n\n')}\n\nREFUTATIONS:\n` +
    `${refutations.join('\n\n---\n\n')}\n\nCOMMERCIAL SCORING:\n${scoring}\n\nJUDGMENT:\n${judgment}`,
  { agentType: 'general-purpose', label: 'assemble-debate-html', phase: 'Architecture' }
)

const debateHtmlExists = await verifyProduced(debateHtml, () =>
  agent(`Assemble the internal architecture-debate HTML at ${debateHtml} — it's missing. See prior brief for contents.`,
    { agentType: 'general-purpose', label: 'assemble-debate-html-retry', phase: 'Architecture' }), 0, 'Architecture')
if (!debateHtmlExists) throw new Error(`Debate HTML was never produced at ${debateHtml} after retry`)

phase('WBS')

// Sequential, not parallel: each owner needs the prior owners' decomposition to link cross-workstream
// edges to *existing* sub-tasks/anchors (the two-pass rule). This chain IS the dependency gate — the
// script structurally cannot call wbs_test before wbs_app and wbs_data have both resolved.
const infra = await agent(
  `You own the Infrastructure/Landing Zone workstream. Anchor: stand up the landing zone for the winning ` +
    `architecture below. Decompose per your agent brief.\n\nRFP: ${rfpPath}\n\nWINNING ARCHITECTURE:\n${judgment}`,
  { agentType: 'wbs_infra', label: 'wbs-infra', phase: 'WBS' }
)

const data = await agent(
  `You own the Data/Integration workstream. Anchor: data migration and source-system integration for the ` +
    `winning architecture below. Decompose per your agent brief.\n\nRFP: ${rfpPath}\n\nWINNING ARCHITECTURE:\n` +
    `${judgment}\n\nINFRASTRUCTURE DECOMPOSITION:\n${infra}`,
  { agentType: 'wbs_data', label: 'wbs-data', phase: 'WBS' }
)

const app = await agent(
  `You own the Application Build workstream. Anchor: build the application layer for the winning architecture ` +
    `below. Decompose per your agent brief.\n\nRFP: ${rfpPath}\n\nWINNING ARCHITECTURE:\n${judgment}\n\n` +
    `INFRASTRUCTURE DECOMPOSITION:\n${infra}\n\nDATA/INTEGRATION DECOMPOSITION:\n${data}`,
  { agentType: 'wbs_app', label: 'wbs-app', phase: 'WBS' }
)

const test = await agent(
  `You own the Testing/Cutover workstream — the gated one. Both Application Build and Data/Integration below ` +
    `are already complete, so you may decompose now. Anchor: integration testing, UAT, cutover/go-live, rollback.\n\n` +
    `RFP: ${rfpPath}\n\nWINNING ARCHITECTURE:\n${judgment}\n\nAPPLICATION BUILD DECOMPOSITION:\n${app}\n\n` +
    `DATA/INTEGRATION DECOMPOSITION:\n${data}`,
  { agentType: 'wbs_test', label: 'wbs-test', phase: 'WBS' }
)

log('WBS decomposed across all 4 workstreams in dependency order: infra -> data -> app -> test')

phase('Proposal')

const proposalMd = `outputs/proposal-${customer}-${date}_arch_wbs.md`
const proposalDocx = `outputs/proposal-${customer}-${date}_arch_wbs.docx`

async function writeProposalDraft(critique) {
  const critiqueNote = critique ? `\n\nA completeness/leak critic flagged issues with the previous draft — fix them:\n${critique}` : ''
  return agent(
    `Synthesize a customer-facing proposal for the RFP at ${rfpPath} from these 4 specialist findings plus the ` +
      `architecture debate's winner and the WBS implementation plan.\n\n` +
      `PRICING:\n${pricing}\n\nLEGAL:\n${legal}\n\nTECHNICAL FIT:\n${tech}\n\nCOMPETITIVE:\n${competitive}\n\n` +
      `WINNING ARCHITECTURE (judge's writeup — do NOT include the loser rationale, that's internal only):\n${judgment}\n\n` +
      `WBS (all 4 workstreams):\nINFRA:\n${infra}\n\nDATA/INTEGRATION:\n${data}\n\nAPP BUILD:\n${app}\n\n` +
      `TESTING/CUTOVER:\n${test}\n\n` +
      `Cover: executive summary (3 bullets), our understanding of the customer's need, why we're the right fit ` +
      `(drawing on technical fit + competitive), our recommended architecture (name + topology, embed the ` +
      `diagram at ${diagramPng} via Markdown image syntax so pandoc includes it), an implementation plan with key ` +
      `milestones (drawn from the WBS anchors and their major sub-tasks — NOT the fine task-level detail), ` +
      `commercial proposal (drawing on pricing), contract approach (drawing on legal), risks and mitigations. ` +
      `Customer-facing only — no internal risk scores, margin figures, the word "blocker", the debate's loser ` +
      `rationale, or fine-grained WBS task lists. Write the full proposal as Markdown to ${proposalMd}.` +
      critiqueNote,
    { agentType: 'deal-desk-orchestrator', label: 'synthesize', phase: 'Proposal' }
  )
}

await writeProposalDraft()

const proposalExists = await verifyProduced(proposalMd, () => writeProposalDraft(), 0, 'Proposal')
if (!proposalExists) throw new Error(`Proposal draft was never produced at ${proposalMd} after retry`)

const critique = await agent(
  `Read ${proposalMd}. You are a completeness AND leak critic. Check against the specialist findings, the ` +
    `winning architecture, and the WBS below for: (1) anything material missing or contradicted, (2) any ` +
    `internal-only content leaking into a customer-facing document — internal risk scores, margin %, the word ` +
    `"blocker", the debate's loser rationale, or fine-grained WBS task lists. If clean, reply exactly "PASS". If ` +
    `not, reply with a short numbered list of fixes.\n\n` +
    `PRICING:\n${pricing}\n\nLEGAL:\n${legal}\n\nTECHNICAL FIT:\n${tech}\n\nCOMPETITIVE:\n${competitive}\n\n` +
    `WINNING ARCHITECTURE + LOSER RATIONALE (internal — must NOT appear in the proposal):\n${judgment}`,
  { label: 'completeness-leak-critic', phase: 'Proposal' }
)

if (!critique.trim().startsWith('PASS')) {
  log('Completeness/leak critic found issues — regenerating proposal once')
  await writeProposalDraft(critique)
}

await agent(
  `Convert ${proposalMd} to ${proposalDocx} using the docx skill (pandoc). Verify the output file is non-zero size.`,
  { agentType: 'general-purpose', label: 'docx', phase: 'Proposal' }
)

const docxExists = await verifyProduced(proposalDocx, () =>
  agent(`Convert ${proposalMd} to ${proposalDocx} using the docx skill (pandoc) — it's missing.`,
    { agentType: 'general-purpose', label: 'docx-retry', phase: 'Proposal' }), 0, 'Proposal')
if (!docxExists) throw new Error(`Proposal docx was never produced at ${proposalDocx} after retry`)

phase('Risk')

const riskHtml = `outputs/risk-assessment-${customer}-${date}_arch_wbs.html`

await agent(
  `Run your three-step risk-assessment process for the RFP at ${rfpPath}. You have the 4 specialist findings, ` +
    `the proposal draft, and WBS delivery-risk inputs below. Add the delivery-risk summary as its OWN additive ` +
    `card/section — it must never change or override the Proceed/Escalate to VP/No-bid decision, which stays ` +
    `governed purely by the existing net-risk and revenue-score calculation.\n\n` +
    `PRICING:\n${pricing}\n\nLEGAL:\n${legal}\n\nTECHNICAL FIT:\n${tech}\n\nCOMPETITIVE:\n${competitive}\n\n` +
    `DELIVERY RISK INPUTS (from the 4 WBS owners — each ends with a one-line delivery-risk flag; extract those 4 ` +
    `flags for your additive card):\n\nINFRA:\n${infra}\n\nDATA/INTEGRATION:\n${data}\n\nAPP BUILD:\n${app}\n\n` +
    `TESTING/CUTOVER:\n${test}\n\nProduce the self-contained interactive HTML dashboard at ${riskHtml}. This is ` +
    `internal only — never customer-facing.`,
  { agentType: 'risk_assessment', label: 'risk', phase: 'Risk' }
)

const riskExists = await verifyProduced(riskHtml, () =>
  agent(`Produce the risk-assessment HTML dashboard at ${riskHtml} per your skill's Step 3 — it's missing.`,
    { agentType: 'risk_assessment', label: 'risk-retry', phase: 'Risk' }), 0, 'Risk')
if (!riskExists) throw new Error(`Risk assessment was never produced at ${riskHtml} after retry`)

log(`Done. Proposal: ${proposalDocx}. Debate: ${debateHtml}. Diagram: ${diagramPng}. Risk dashboard: ${riskHtml}.`)

return {
  pricing, legal, tech, competitive,
  candidatesText, positions, refutations, scoring, judgment,
  infra, data, app, test,
  proposalMd, proposalDocx, debateHtml, diagramDrawio, diagramPng, riskHtml,
}

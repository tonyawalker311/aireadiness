import React, { useEffect, useMemo, useState } from 'react'

// Brand & Config
const BRAND = { primary: '#0ab9b5', primaryText: '#ffffff' }
const LEAD_CAPTURE_ENDPOINT = '' // set to your webhook endpoint to enable POST
const TIDYCAL = 'https://tidycal.com/tonyawalker/20-minute-strategy-session'

// Checklist Sections
const SECTIONS = [
  {
    id: 's1',
    title: 'Section 1 – Data Quality & Management',
    subtitle: 'Foundation of AI Success',
    items: [
      { id: '1.1', title: '1.1 Data Cleanliness & Consistency:', question: 'Have we purged duplicates, corrected spelling, and enforced standard fields?', why: 'Uniform, error-free data means every algorithm learns from the same reliable truth—boosting segmentation accuracy, report confidence, and campaign ROI.' },
      { id: '1.2', title: '1.2 Silo Elimination & Integration:', question: 'Is customer data flowing freely between marketing, sales, and service?', why: 'A single, synchronized data stream unlocks 360° insights, eliminates conflicting metrics, and feeds AI the full customer story.' },
      { id: '1.3', title: '1.3 Governance & Privacy Compliance:', question: 'Do we follow GDPR/CCPA and document-retention rules?', why: 'Strong governance avoids fines, protects reputation, and ensures the data you train AI on is ethically sourced and trustworthy.' },
      { id: '1.4', title: '1.4 AI-Ready Data Assessment:', question: 'Is our data structured, labeled, and large enough for machine learning?', why: 'Well-structured, well-labeled datasets let models train faster, reduce hallucinations, and deliver reliable, actionable insights.' },
    ],
  },
  {
    id: 's2',
    title: 'Section 2 – MarTech Stack Optimization & Integration',
    subtitle: 'Fueling AI’s Capabilities',
    items: [
      { id: '2.1', title: '2.1 MarTech Stack Audit:', question: 'Have we documented redundant or under-used tools?', why: 'Cutting tool bloat reclaims budget, simplifies workflows, and clears technical debt that can stall any AI rollout.' },
      { id: '2.2', title: '2.2 Tool Integration & Data Flow:', question: 'Are key systems natively integrated?', why: 'Real-time integrations end manual CSV shuffles, reduce error rates, and keep AI models continuously fueled with fresh context.' },
      { id: '2.3', title: '2.3 Future-Proofing for AI Orchestration:', question: 'Is our stack composable?', why: 'A modular architecture lets you snap in new AI services without ripping out your core—extending stack lifespan and ROI.' },
    ],
  },
  {
    id: 's3',
    title: 'Section 3 – Operational Processes & Workflows',
    subtitle: 'Enabling AI Efficiency',
    items: [
      { id: '3.1', title: '3.1 Process Mapping & Bottleneck ID:', question: 'Have we visualized every hand-off?', why: 'Seeing the entire workflow surfaces hidden delays that AI or automation can eliminate—speeding time-to-launch and cutting costs.' },
      { id: '3.2', title: '3.2 Automation Opportunity Assessment:', question: 'Which repetitive tasks can AI own?', why: 'Replacing copy-paste busywork with bots slashes errors and frees humans for high-value creative and strategic work.' },
      { id: '3.3', title: '3.3 Campaign Management & Optimization Overhaul:', question: 'Are campaigns self-optimizing?', why: 'Machine-learning bidding and creative rotation drive compounding ROI while your team sleeps.' },
    ],
  },
  {
    id: 's4',
    title: 'Section 4 – Team Skills & Culture',
    subtitle: 'Fostering Human-AI Collaboration',
    items: [
      { id: '4.1', title: '4.1 AI Literacy & Skill Gap Analysis:', question: 'Do we know what we don’t know?', why: 'Teams fluent in AI concepts extract 3-5× more value from the same platform and spot ethical pitfalls early.' },
      { id: '4.2', title: '4.2 Human-in-the-Loop Strategy:', question: 'Where is human oversight mandatory?', why: 'Defined checkpoints preserve brand voice, ethics, and strategic judgment, preventing costly AI hallucinations.' },
      { id: '4.3', title: '4.3 Change Management & Trust Building:', question: 'Do we have a rollout plan?', why: 'Transparent pilots and quick wins convert skeptics, accelerate adoption, and cement an experimentation culture.' },
    ],
  },
  {
    id: 's5',
    title: 'Section 5 – Strategic Alignment & Governance',
    subtitle: 'Guiding Your AI Journey',
    items: [
      { id: '5.1', title: '5.1 Comprehensive AI Roadmap:', question: 'Do we have 12-24-month milestones?', why: 'A clear roadmap aligns investments with revenue goals and stops shiny-object distractions.' },
      { id: '5.2', title: '5.2 Ethical AI Guidelines & Policies:', question: 'Are bias and transparency addressed?', why: 'Robust policies mitigate reputational risk and keep you ahead of tightening regulations.' },
      { id: '5.3', title: '5.3 Clear Goals & Measurable Targets:', question: 'Are KPIs defined before launch?', why: 'Pre-set success metrics let you prove ROI fast and iterate with confidence.' },
    ],
  },
]

const OPTIONS = ['Yes', 'In-Progress', 'No']
const SCORE_MAP = { Yes: 1, 'In-Progress': 0.5, No: 0 }

// Helpers
function classNames() { return Array.from(arguments).filter(Boolean).join(' ') }
function pct(n, d) { return d ? Math.round((n / d) * 100) : 0 }
function verdict(total) {
  if (total >= 13) return { label: 'AI-Ready Accelerator', emoji: '✅', tone: 'You’re primed for AI acceleration—book an audit to leap ahead.' }
  if (total >= 8) return { label: 'Promising but Patchy', emoji: '⚠️', tone: 'Solid start but foundations are uneven—prioritize fixes before heavy AI spend.' }
  return { label: 'Stabilize First', emoji: '🔧', tone: 'Data chaos alert—let’s triage before you waste another dollar.' }
}
function toCSV(payload) {
  const rows = [
    ['timestamp', new Date().toISOString()],
    ['name', payload?.name ?? ''],
    ['email', payload?.email ?? ''],
    ['totalScore', String(payload?.scores?.total ?? '')],
    ['maxScore', String(payload?.scores?.max ?? '')],
  ]
  SECTIONS.forEach((s) => {
    rows.push([`${s.title} Score`, String(payload.sectionScores?.[s.id] ?? '')])
    s.items.forEach((it) => rows.push([`${it.id} ${it.title}`, payload.answers?.[it.id] ?? '']))
  })
  return rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n')
}
function saveFile(name, data, type='text/csv') {
  const blob = new Blob([data], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }, [key, value])
  return [value, setValue]
}

// Component
export default function App() {
  const totalQuestions = useMemo(() => SECTIONS.reduce((n, s) => n + s.items.length, 0), [])
  const [answers, setAnswers] = useLocalStorage('ai_mops_answers_prod', {})
  const [name, setName] = useLocalStorage('ai_mops_name_prod', '')
  const [email, setEmail] = useLocalStorage('ai_mops_email_prod', '')
  const [consent, setConsent] = useLocalStorage('ai_mops_consent_prod', false)
  const [currentStep, setCurrentStep] = useLocalStorage('ai_mops_step_prod', 0) // 0..SECTIONS.length (email step at end)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const completion = pct(answeredCount, totalQuestions)

  const sectionScores = useMemo(() => {
    const scores = {}
    SECTIONS.forEach((s) => {
      scores[s.id] = s.items.reduce((sum, it) => sum + (answers[it.id] ? SCORE_MAP[answers[it.id]] : 0), 0)
    })
    return scores
  }, [answers])
  const totalScore = useMemo(() => Object.values(sectionScores).reduce((a, b) => a + b, 0), [sectionScores])
  const maxScore = useMemo(() => SECTIONS.reduce((n, s) => n + s.items.length, 0), [])
  const v = verdict(totalScore)

  function setAnswer(id, value) { setAnswers({ ...answers, [id]: value }) }
  function resetAll() { setAnswers({}); setName(''); setEmail(''); setConsent(false); setCurrentStep(0); setSubmitted(false); setError(null) }
  function exportCSV() { const payload = buildPayload(); saveFile(`ai_mops_checklist_${new Date().toISOString().slice(0,10)}.csv`, toCSV(payload)) }
  function buildPayload() {
    return {
      timestamp: new Date().toISOString(),
      name, email, consent,
      scores: { total: totalScore, max: maxScore },
      sectionScores, answers, verdict: v,
      url: typeof window !== 'undefined' ? window.location.href : '',
      utm: typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search || '')) : {},
    }
  }
  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (!name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Please enter a valid name and email.')
      if (!consent) throw new Error('Please consent to receive your score via email.')
      const payload = buildPayload()
      if (LEAD_CAPTURE_ENDPOINT) {
        const res = await fetch(LEAD_CAPTURE_ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('Submission failed. Please try again.')
      } else {
        console.info('Lead payload (configure LEAD_CAPTURE_ENDPOINT to POST):', payload)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const isFirst = currentStep === 0
  const isLastSection = currentStep === SECTIONS.length - 1
  const isEmailStep = currentStep === SECTIONS.length
  function goNext() { setCurrentStep(Math.min(currentStep + 1, SECTIONS.length)) }
  function goBack() { setCurrentStep(Math.max(currentStep - 1, 0)) }

  return (
    <div className="mx-auto max-w-4xl p-6 text-slate-800">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI-Readiness Marketing Operations Checklist</h1>
        <p className="text-slate-600 mt-1">Answer each section, then claim your score.</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-full h-3 bg-slate-200 rounded">
            <div className="h-3 rounded" style={{ width: `${completion}%`, background: BRAND.primary }} />
          </div>
          <span className="text-sm font-medium w-16 text-right">{completion}%</span>
        </div>
      </header>

      {currentStep < SECTIONS.length && !submitted && (
        <div className="rounded-2xl border p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold">{SECTIONS[currentStep].title}</h2>
              <p className="text-sm text-slate-600">{SECTIONS[currentStep].subtitle}</p>
            </div>
            <div className="text-sm text-slate-500">
              Answered: <span className="font-semibold">
              {SECTIONS[currentStep].items.filter(it => answers[it.id]).length}
              </span> / {SECTIONS[currentStep].items.length}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {SECTIONS[currentStep].items.map(item => (
              <div key={item.id} className="rounded-xl border p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="md:max-w-[65%]">
                    <div className="font-medium">{item.title} <span className="font-normal text-slate-700">{item.question}</span></div>
                    <div className="text-sm text-slate-600 mt-1">Why it matters: {item.why}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {['Yes', 'In-Progress', 'No'].map(opt => (
                      <label key={opt} className={'inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm ' + (answers[item.id] === opt ? 'border-slate-900' : 'border-slate-300')}>
                        <input type="radio" name={item.id} value={opt} checked={answers[item.id] === opt} onChange={() => setAnswer(item.id, opt)} className="hidden" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={goBack} disabled={isFirst} className="px-4 py-2 rounded-lg border disabled:opacity-50">Back</button>
            <button onClick={goNext} className="px-4 py-2 rounded-lg font-medium" style={{ background: BRAND.primary, color: BRAND.primaryText }}>
              {isLastSection ? 'Continue' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {isEmailStep && (
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Almost there—get your score by email</h2>
          <p className="text-sm text-slate-600 mt-1">Enter your details to receive your total score, verdict, and section breakdown. You’ll also get weekly AI-Ops insights from The Strategic Stack. Unsubscribe anytime.</p>
          <form onSubmit={onSubmit} className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-700">Full name</label>
                <input type="text" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm text-slate-700">Work email</label>
                <input type="email" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <input id="consent" type="checkbox" checked={!!consent} onChange={e => setConsent(e.target.checked)} className="mt-1" required />
              <label htmlFor="consent" className="text-sm text-slate-700">I agree to receive my score and occasional AI-Ops insights. (Unsubscribe anytime.)</label>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg font-medium" style={{ background: BRAND.primary, color: BRAND.primaryText }}>
                {submitting ? 'Sending…' : 'Email Me My Score'}
              </button>
              <button type="button" className="px-4 py-2 rounded-lg border" onClick={() => setCurrentStep(SECTIONS.length - 1)}>Back</button>
            </div>
          </form>
          {submitted && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-slate-500">Your Score</p>
                <p className="text-2xl font-semibold">{totalScore.toFixed(1)} <span className="text-slate-400">/ {maxScore}</span></p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-slate-500">Verdict</p>
                <p className="text-xl font-semibold">{verdict(totalScore).emoji} {verdict(totalScore).label}</p>
                <p className="text-sm text-slate-600 mt-1">{verdict(totalScore).tone}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-slate-500 mb-2">Section Breakdown</p>
                <ul className="text-sm text-slate-700 list-disc ml-5">
                  {SECTIONS.map(s => (
                    <li key={s.id} className="mb-1">{s.title}: <span className="font-medium">{(sectionScores[s.id] || 0).toFixed(1)}</span> / {s.items.length}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 rounded-lg border text-sm" onClick={() => window.print()}>Print</button>
                <a href={TIDYCAL} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg font-semibold" style={{ background: BRAND.primary, color: BRAND.primaryText }}>Schedule My Call →</a>
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="mt-10 pb-10 text-xs text-slate-500">
        © {new Date().getFullYear()} Tonya Walker LLC • All rights reserved.
      </footer>
    </div>
  )
}

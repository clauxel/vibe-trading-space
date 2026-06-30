import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  LineChart,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

import { annualBillingMultiplier, pricingPlans } from './content/catalog'
import './styles.css'

type BillingCycle = 'annual' | 'monthly'

const navItems = [
  { href: '/', label: 'Planner' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/docs/', label: 'Docs' },
  { href: '/source-notes/', label: 'Sources' },
  { href: '/faq/', label: 'FAQ' },
]

const workflowOptions = [
  {
    id: 'shadow',
    label: 'Shadow Account',
    summary: 'Upload a broker export, profile behavior, extract rules, and compare the shadow path.',
    output: 'Behavior profile, extracted rule set, shadow backtest, HTML/PDF report',
  },
  {
    id: 'backtest',
    label: 'Strategy Backtest',
    summary: 'Turn a natural-language strategy idea into a tested config, metrics, warnings, and run card.',
    output: 'Signal sketch, benchmark metrics, validation checklist, export plan',
  },
  {
    id: 'swarm',
    label: 'Multi-Agent Research',
    summary: 'Route a market question through investment, quant, risk, crypto, or macro teams.',
    output: 'Team preset, worker roles, evidence trail, decision memo',
  },
]

const marketOptions = [
  { id: 'us', label: 'US equities', sources: 'yahoo, stooq, sina, yfinance, optional premium providers' },
  { id: 'ashare', label: 'A-share', sources: 'tencent, mootdx, eastmoney, baostock, akshare, tushare' },
  { id: 'crypto', label: 'Crypto', sources: 'okx, ccxt, yfinance, local bars' },
  { id: 'mixed', label: 'Mixed markets', sources: 'auto routing across equity, crypto, futures, forex, local data' },
]

const evidenceSignals = [
  { value: '14.6k+', label: 'GitHub stars captured June 29, 2026', kind: 'source' },
  { value: '18', label: 'market-data source families in upstream docs', kind: 'source' },
  { value: 'MIT', label: 'upstream license, non-official hosted planner', kind: 'boundary' },
  { value: 'Sample', label: 'planner output is illustrative until paid generation', kind: 'sample' },
]

const capabilities = [
  {
    icon: BrainCircuit,
    image: '/upstream-assets/feature-self-improving-trading-agent.jpg',
    title: 'Natural-language research planning',
    body: 'Translate a trading question into a Vibe-Trading run shape: skills, data sources, swarm preset, validation gates, and output artifacts.',
  },
  {
    icon: LineChart,
    image: '/upstream-assets/feature-cross-market-data-backtesting.jpg',
    title: 'Backtest and alpha readiness',
    body: 'Map strategy ideas to cross-market backtesting, benchmark comparison, Monte Carlo, walk-forward checks, run cards, and Alpha Zoo discovery.',
  },
  {
    icon: ShieldCheck,
    image: '/upstream-assets/feature-multi-agent-trading-teams.jpg',
    title: 'Risk-first launch checklist',
    body: 'Surface API-key needs, broker authorization boundaries, local-data fallbacks, live-trading safety notes, and unsupported assumptions before execution.',
  },
  {
    icon: FileText,
    image: '/upstream-assets/feature-shadow-account.jpg',
    title: 'Shadow Account prep',
    body: 'Prepare broker-journal analysis workflows with behavior diagnostics, rule extraction, shadow comparison, and exportable report expectations.',
  },
]

const docsSections = [
  {
    title: 'Getting started',
    body: 'Install the upstream package as `vibe-trading-ai`, then run `vibe-trading init` to configure an LLM provider or local Ollama. This site helps you plan which workflow to run before you spend time on setup.',
  },
  {
    title: 'Inputs and outputs',
    body: 'Bring a trading question, market universe, data-source preference, journal export, or strategy idea. The planner returns a prompt outline, data-route assumptions, risk checklist, and artifact expectations.',
  },
  {
    title: 'Payment boundary',
    body: 'Free visitors can inspect sample plans. Full workspace pack generation, exports, and saved audit trails require selecting a package and completing Polar checkout through this domain.',
  },
  {
    title: 'Official-source boundary',
    body: 'Vibe-Trading Space is an independent planner built from public Vibe-Trading repository facts. It is not an official HKUDS site and does not hold funds, place trades, or bypass broker consent.',
  },
]

const faqs = [
  {
    question: 'Is this the official Vibe-Trading project?',
    answer:
      'No. This is an independent hosted workflow planner and SaaS companion built from public upstream facts. Official source links are isolated in source notes.',
  },
  {
    question: 'Can I run real trades from this website?',
    answer:
      'No. The site plans research workflows and paid workspace packs. Real broker authorization, API keys, and trading controls remain in the upstream tool and your own broker environment.',
  },
  {
    question: 'Why is a pricing page required before generation?',
    answer:
      'The paid generation path can create saved plans, audit trails, exports, and support workload. The free page shows a transparent preview without pretending the full tool is already unlocked.',
  },
  {
    question: 'What data is stored?',
    answer:
      'Local preview choices stay in the browser. Production analytics and checkout events are intended for Cloudflare D1 when deployed; the build report marks D1 live verification as a production blocker until configured.',
  },
]

const sourceFacts = [
  ['Repository', 'HKUDS/Vibe-Trading public GitHub repo; default branch main; HEAD 4b280a5f7f3f7b9b19eb071a86e615870b097da5.'],
  ['Package', 'PyPI package name `vibe-trading-ai`; commands include `vibe-trading`, `vibe-trading serve`, and `vibe-trading-mcp`.'],
  ['Stack', 'Python 3.11+, FastAPI backend, React 19 frontend, MCP server entry, Docker path, and CLI/TUI workflow.'],
  ['Scope', 'Research, simulation, backtesting, reports, MCP tools, and optional autonomous trading through user-authorized brokers.'],
  ['Limit', 'Financial research software, not investment advice; live trading needs independent broker consent, limits, halt controls, and human review.'],
]

function normalizePath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed || '/'
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100)
}

function getPlanAmount(plan: (typeof pricingPlans)[number], billingCycle: BillingCycle) {
  return billingCycle === 'annual'
    ? Math.round(plan.monthlyAmountCents * 12 * annualBillingMultiplier)
    : plan.monthlyAmountCents
}

function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function App() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [workflowId, setWorkflowId] = useState('shadow')
  const [marketId, setMarketId] = useState('mixed')
  const [horizon, setHorizon] = useState('90 trading days')
  const [prompt, setPrompt] = useState('Analyze whether my BTC and A-share momentum rules survive regime changes.')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual')
  const [checkoutState, setCheckoutState] = useState('')

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const selectedWorkflow = workflowOptions.find((item) => item.id === workflowId) ?? workflowOptions[0]
  const selectedMarket = marketOptions.find((item) => item.id === marketId) ?? marketOptions[0]

  const preview = useMemo(() => {
    return {
      command: `vibe-trading run -p "${prompt.replace(/"/g, "'")}"`,
      workflow: selectedWorkflow.label,
      market: selectedMarket.label,
      dataRoute: selectedMarket.sources,
      horizon,
      gates: [
        'Confirm research-only intent before execution.',
        'Use auto data routing first; pin local data when reproducibility matters.',
        'Record benchmark, drawdown, validation, and run-card artifacts.',
        'Stop before live-broker action unless the user explicitly authorizes it.',
      ],
    }
  }, [horizon, prompt, selectedMarket, selectedWorkflow])

  function go(path: string) {
    setMobileNavOpen(false)
    navigateTo(path)
  }

  async function startCheckout(planId: string) {
    setCheckoutState(`Opening ${planId} ${billingCycle} checkout...`)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing: billingCycle }),
      })
      const payload = await response.json().catch(() => ({}))
      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl
        return
      }
      setCheckoutState(payload.message || 'Checkout is not configured on this deployment yet.')
    } catch {
      setCheckoutState('Checkout is not reachable from this preview. Try again after deployment.')
    }
  }

  function renderHeader() {
    return (
      <header className="site-header">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); go('/') }}>
          <span className="brand-mark">VT</span>
          <span>Vibe-Trading Space</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              className={pathname === normalizePath(item.href) ? 'active' : ''}
              href={item.href}
              key={item.href}
              onClick={(event) => { event.preventDefault(); go(item.href) }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button className="icon-button mobile-toggle" type="button" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
          <Menu size={20} />
        </button>
        {mobileNavOpen ? (
          <div className="mobile-panel" role="dialog" aria-label="Navigation">
            <button className="icon-button" type="button" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>
              <X size={20} />
            </button>
            {navItems.map((item) => (
              <a href={item.href} key={item.href} onClick={(event) => { event.preventDefault(); go(item.href) }}>
                {item.label}
              </a>
            ))}
          </div>
        ) : null}
      </header>
    )
  }

  function renderPlanner() {
    return (
      <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Independent Vibe-Trading workflow planner</p>
            <h1>Turn a trading hunch into a safer Vibe-Trading run plan before you launch it.</h1>
            <p className="lead">
              Vibe-Trading Space helps finance builders shape natural-language research, Shadow Account reviews, swarm teams,
              and backtests into auditable workflows with clear data, risk, and payment boundaries.
            </p>
            <div className="hero-actions">
              <button className="button primary" type="button" onClick={() => go('/pricing/')}>
                View packages <ArrowRight size={17} />
              </button>
              <button className="button" type="button" onClick={() => go('/docs/')}>
                Read planner docs
              </button>
            </div>
            <div className="trust-row">
              {evidenceSignals.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="planner-panel" aria-label="Vibe-Trading run planner">
            <div className="panel-heading">
              <Sparkles size={18} />
              <span>Run planner preview</span>
            </div>
            <label>
              Research prompt
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} />
            </label>
            <div className="field-grid">
              <label>
                Workflow
                <select value={workflowId} onChange={(event) => setWorkflowId(event.target.value)}>
                  {workflowOptions.map((option) => (
                    <option value={option.id} key={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Market
                <select value={marketId} onChange={(event) => setMarketId(event.target.value)}>
                  {marketOptions.map((option) => (
                    <option value={option.id} key={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Horizon
              <input value={horizon} onChange={(event) => setHorizon(event.target.value)} />
            </label>
            <div className="preview-card">
              <p className="mini-label">Sample output preview</p>
              <pre>{JSON.stringify(preview, null, 2)}</pre>
            </div>
            <button className="button primary full" type="button" onClick={() => go('/pricing/')}>
              Generate full workspace pack
            </button>
            <p className="small-note">
              Preview only. Full saved packs and exports are gated by package selection and Polar checkout.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">What this builds on</p>
            <h2>A planner layer for Vibe-Trading research, not a fake trading terminal.</h2>
          </div>
          <div className="card-grid">
            {capabilities.map((item) => (
              <article className="card" key={item.title}>
                <img className="capability-image" src={item.image} alt="" loading="lazy" />
                <item.icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split">
          <div>
            <p className="eyebrow">Method</p>
            <h2>Plan, ground, validate, deliver.</h2>
            <p>
              The preview follows the upstream evidence path: choose a workflow, route market data, run tools or teams,
              validate with benchmark and risk checks, then deliver artifacts. Paid generation adds saved runs, export-ready
              checklists, and support handoff notes.
            </p>
          </div>
          <div className="timeline">
            {['Route skills and data sources', 'Set limits and fallback assumptions', 'Define validation artifacts', 'Gate full generation behind pricing'].map((item, index) => (
              <div className="timeline-row" key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </>
    )
  }

  function renderPricing() {
    return (
      <section className="section pricing-page">
        <div className="section-heading center">
          <p className="eyebrow">Pricing</p>
          <h1>Choose a Vibe-Trading planning package.</h1>
          <p>Annual is selected by default and is 50% lower than monthly, billed as a one-time payment without automatic renewal.</p>
        </div>
        <div className="billing-toggle" role="tablist" aria-label="Billing cycle">
          <button className={billingCycle === 'annual' ? 'active' : ''} type="button" onClick={() => setBillingCycle('annual')}>Annual</button>
          <button className={billingCycle === 'monthly' ? 'active' : ''} type="button" onClick={() => setBillingCycle('monthly')}>Monthly</button>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan) => {
            const amount = getPlanAmount(plan, billingCycle)
            const monthlyEquivalent = billingCycle === 'annual' ? amount / 12 : amount
            return (
              <article className={plan.featured ? 'price-card featured' : 'price-card'} key={plan.id}>
                <div className="plan-top">
                  <h2>{plan.name}</h2>
                  {plan.featured ? <span>Recommended</span> : null}
                </div>
                <p>{plan.subtitle}</p>
                <div className="price">
                  {formatMoney(monthlyEquivalent)}
                  <small>/mo</small>
                </div>
                <p className="due">
                  {billingCycle === 'annual' ? `${formatMoney(amount)} due today, billed yearly` : `${formatMoney(amount)} due today`}
                </p>
                <ul>
                  {plan.bullets.map((bullet) => (
                    <li key={bullet}><Check size={16} /> {bullet}</li>
                  ))}
                </ul>
                <button className="button primary full" type="button" onClick={() => startCheckout(plan.id)}>
                  Checkout {plan.name} {billingCycle}
                </button>
              </article>
            )
          })}
        </div>
        {checkoutState ? <p className="checkout-state">{checkoutState}</p> : null}
      </section>
    )
  }

  function renderDocs() {
    return (
      <section className="section prose-page">
        <p className="eyebrow">Docs</p>
        <h1>Vibe-Trading Space workflow docs</h1>
        <div className="doc-grid">
          {docsSections.map((section) => (
            <article className="card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  function renderFaq() {
    return (
      <section className="section prose-page">
        <p className="eyebrow">FAQ</p>
        <h1>Questions before you plan a run</h1>
        <div className="faq-list">
          {faqs.map((faq) => (
            <article className="faq-card" key={faq.question}>
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  function renderSourceNotes() {
    return (
      <section className="section prose-page">
        <p className="eyebrow">Source notes</p>
        <h1>Public source boundary and trust ledger</h1>
        <div className="source-table">
          {sourceFacts.map(([label, value]) => (
            <div className="source-row" key={label}>
              <strong>{label}</strong>
              <p>{value}</p>
            </div>
          ))}
        </div>
        <div className="callout">
          <BadgeCheck size={20} />
          <p>
            Source links are intentionally kept out of conversion CTAs. Official upstream references belong in source notes and
            the independent docs repository; package selection and checkout remain on vibe-trading.space.
          </p>
        </div>
      </section>
    )
  }

  function renderPolicy(kind: 'privacy' | 'terms' | 'changelog') {
    const isPrivacy = kind === 'privacy'
    const isTerms = kind === 'terms'
    return (
      <section className="section prose-page">
        <p className="eyebrow">{isPrivacy ? 'Privacy' : isTerms ? 'Terms' : 'Changelog'}</p>
        <h1>{isPrivacy ? 'Privacy Policy' : isTerms ? 'Terms of Service' : 'Changelog'}</h1>
        <div className="card">
          <h2>{isPrivacy ? 'Data handling' : isTerms ? 'Use boundary' : '2026-06-29 launch build'}</h2>
          <p>
            {isPrivacy
              ? 'Preview choices are client-side. Production analytics, paid-gate events, and checkout starts are designed for Cloudflare D1 once live storage is configured.'
              : isTerms
                ? 'Vibe-Trading Space is a planning companion. It does not provide investment advice, hold funds, execute trades, or replace broker authorization and human review.'
                : 'Initial local site implementation, pricing gate, planner preview, SEO assets, source notes, and build report registration were prepared.'}
          </p>
        </div>
      </section>
    )
  }

  function renderNotFound() {
    return (
      <section className="section prose-page">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>This route is not part of the public Vibe-Trading Space planner. Return to the planner or pricing page.</p>
        <button className="button primary" type="button" onClick={() => go('/')}>Back to planner</button>
      </section>
    )
  }

  function renderPage() {
    switch (pathname) {
      case '/':
        return renderPlanner()
      case '/pricing':
        return renderPricing()
      case '/docs':
        return renderDocs()
      case '/faq':
        return renderFaq()
      case '/source-notes':
        return renderSourceNotes()
      case '/privacy':
        return renderPolicy('privacy')
      case '/terms':
        return renderPolicy('terms')
      case '/changelog':
        return renderPolicy('changelog')
      default:
        return renderNotFound()
    }
  }

  return (
    <>
      {renderHeader()}
      <main>{renderPage()}</main>
      <footer className="footer">
        <div>
          <span>Vibe-Trading Space</span>
          <p>Independent hosted planner for Vibe-Trading research workflows. Support: support@aigeamy.com.</p>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => go('/privacy/')}>Privacy</button>
          <button type="button" onClick={() => go('/terms/')}>Terms</button>
          <button type="button" onClick={() => go('/changelog/')}>Changelog</button>
        </div>
      </footer>
    </>
  )
}

export default App

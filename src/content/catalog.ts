import type { ChoiceOption, Plan } from '../app-types'

export const annualBillingMultiplier = 0.5

export const planCatalog: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPriceLabel: '$9',
    monthlyAmountCents: 900,
    currency: 'USD',
    subtitle: 'Plan one Vibe-Trading research run with a clean prompt, data route, and validation checklist.',
    etaMinutes: 8,
    includedDeployments: 1,
    bullets: [
      '1 saved workflow planning pack',
      'Backtest or Shadow Account checklist',
      'Source, risk, and artifact notes',
    ],
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPriceLabel: '$29',
    monthlyAmountCents: 2900,
    currency: 'USD',
    subtitle: 'The practical package for repeated research, swarm plans, and review-ready exports.',
    etaMinutes: 5,
    includedDeployments: 3,
    bullets: [
      '3 saved planning packs',
      'Swarm, Alpha Zoo, and Shadow Account routes',
      'Export-ready run-card and validation notes',
    ],
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPriceLabel: '$59',
    monthlyAmountCents: 5900,
    currency: 'USD',
    subtitle: 'Desk-level planning support for multi-market workflows, compliance notes, and team review.',
    etaMinutes: 3,
    includedDeployments: 10,
    bullets: [
      '10 saved planning packs',
      'Multi-market policy and broker-boundary notes',
      'Priority support handoff for production planning',
    ],
    featured: false,
  },
]

export const pricingPlans = planCatalog

export type FrontendCatalogOption = ChoiceOption & {
  status: string
}

export const modelCatalog: FrontendCatalogOption[] = [
  {
    id: 'shadow',
    name: 'Shadow Account',
    summary: 'Broker-journal behavior review with extracted rules and shadow backtest expectations.',
    badge: 'Journal route',
    status: 'Journal route',
  },
  {
    id: 'backtest',
    name: 'Backtest Plan',
    summary: 'Strategy idea planning with data-source assumptions, benchmark checks, and validation artifacts.',
    badge: 'Validation route',
    status: 'Validation route',
  },
  {
    id: 'swarm',
    name: 'Swarm Research',
    summary: 'Multi-agent desk routing for investment, quant, crypto, macro, and risk workflows.',
    badge: 'Team route',
    status: 'Team route',
  },
]

export const channelCatalog: FrontendCatalogOption[] = [
  {
    id: 'planner',
    name: 'Planner preview',
    summary: 'Browser-side sample plan that stays free and clearly marked as preview output.',
    badge: 'Browser preview',
    status: 'Browser preview',
  },
  {
    id: 'api',
    name: 'Planning API',
    summary: 'Paid generation endpoint that returns payment-required before an entitlement is verified.',
    badge: 'Payment-gated',
    status: 'Payment-gated',
  },
  {
    id: 'support',
    name: 'Support handoff',
    summary: 'Support-ready notes for real broker/API-key boundaries and production setup decisions.',
    badge: 'Human review',
    status: 'Human review',
  },
]

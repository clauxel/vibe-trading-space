export const annualBillingMultiplier = 0.5

export const planCatalog = [
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

export const modelCatalog = [
  { id: 'shadow', name: 'Shadow Account', status: 'Journal route' },
  { id: 'backtest', name: 'Backtest Plan', status: 'Validation route' },
  { id: 'swarm', name: 'Swarm Research', status: 'Team route' },
]

export const channelCatalog = [
  { id: 'planner', name: 'Planner preview', status: 'Browser' },
  { id: 'api', name: 'Planning API', status: 'Payment-gated' },
  { id: 'support', name: 'Support handoff', status: 'Email' },
]

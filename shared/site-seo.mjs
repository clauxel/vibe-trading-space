export const siteName = 'Vibe-Trading Space'
export const defaultOrigin = 'https://vibe-trading.space'
export const defaultSiteTitle = 'Vibe-Trading Space - Safer AI Trading Research Run Planner'
export const defaultSiteDescription =
  'Plan Vibe-Trading research, Shadow Account reviews, multi-agent swarm runs, and backtests with clear data routes, risk gates, pricing, and source boundaries.'

export const seoPageList = [
  {
    path: '/',
    title: defaultSiteTitle,
    h1: 'Turn a trading hunch into a safer Vibe-Trading run plan before you launch it.',
    description: defaultSiteDescription,
    robots: 'index,follow',
  },
  {
    path: '/pricing',
    title: 'Pricing for Vibe-Trading workflow planning packs | Vibe-Trading Space',
    h1: 'Choose a Vibe-Trading planning package.',
    description:
      'Choose Starter, Pro, or Enterprise planning packs with annual and monthly billing for Vibe-Trading workflow generation, exports, and support.',
    robots: 'index,follow',
  },
  {
    path: '/docs',
    title: 'Vibe-Trading Space docs: planner inputs, outputs, and payment boundary',
    h1: 'Vibe-Trading Space workflow docs',
    description:
      'Learn how Vibe-Trading Space maps prompts, markets, data sources, validation checks, and paid workspace packs before running the upstream tool.',
    robots: 'index,follow',
  },
  {
    path: '/source-notes',
    title: 'Source notes and trust ledger | Vibe-Trading Space',
    h1: 'Public source boundary and trust ledger',
    description:
      'Review the public repository facts, package facts, license boundary, and non-official relationship for Vibe-Trading Space.',
    robots: 'index,follow',
  },
  {
    path: '/faq',
    title: 'Vibe-Trading Space FAQ for research planning and paid generation',
    h1: 'Questions before you plan a run',
    description:
      'Answers about the independent planner boundary, live trading limits, payment gating, analytics storage, and Vibe-Trading source relationship.',
    robots: 'index,follow',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Vibe-Trading Space',
    h1: 'Privacy Policy',
    description:
      'Privacy notes for Vibe-Trading Space planner previews, analytics events, paid-gate records, and checkout-start tracking.',
    robots: 'index,follow',
  },
  {
    path: '/terms',
    title: 'Terms of Service | Vibe-Trading Space',
    h1: 'Terms of Service',
    description:
      'Terms covering Vibe-Trading Space workflow planning, research-only limits, payment boundary, support, and non-advice disclaimers.',
    robots: 'index,follow',
  },
  {
    path: '/changelog',
    title: 'Changelog | Vibe-Trading Space',
    h1: 'Changelog',
    description: 'Launch notes and update history for Vibe-Trading Space.',
    robots: 'index,follow',
  },
]

export const seoPageMap = new Map(seoPageList.map((page) => [page.path, page]))

export const indexableSitemapPaths = seoPageList
  .filter((page) => page.robots === 'index,follow')
  .map((page) => page.path)

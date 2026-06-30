const defaultOrigin = 'https://vibe-trading.space'

const seoPageMap = new Map([
  ['/', {
    path: '/',
    title: 'Vibe-Trading Space - Safer AI Trading Research Run Planner',
    description: 'Plan Vibe-Trading research, Shadow Account reviews, multi-agent swarm runs, and backtests with clear data routes, risk gates, pricing, and source boundaries.',
    robots: 'index,follow',
  }],
  ['/pricing', {
    path: '/pricing',
    title: 'Pricing for Vibe-Trading workflow planning packs | Vibe-Trading Space',
    description: 'Choose Starter, Pro, or Enterprise planning packs with annual and monthly billing for Vibe-Trading workflow generation, exports, and support.',
    robots: 'index,follow',
  }],
])

export type SeoDocument = {
  title: string
  description: string
  canonicalUrl: string
  robots: string
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

export function buildSeoDocument(pathname: string, publicAppOrigin = defaultOrigin): SeoDocument {
  const normalizedPath = normalizePathname(pathname)
  const page = seoPageMap.get(normalizedPath) ?? {
    path: normalizedPath,
    title: 'Page not found | Vibe-Trading Space',
    description: 'This Vibe-Trading Space page could not be found.',
    robots: 'noindex,follow',
  }

  return {
    title: page.title,
    description: page.description,
    canonicalUrl: new URL(page.path, `${publicAppOrigin.replace(/\/+$/, '')}/`).toString(),
    robots: page.robots,
  }
}

export function syncSeoDocument(seo: SeoDocument) {
  document.title = seo.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  document.querySelector('meta[name="robots"]')?.setAttribute('content', seo.robots)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', seo.canonicalUrl)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', seo.canonicalUrl)
}

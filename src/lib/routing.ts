export function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

export function scrollToHashTarget(hash: string, behavior: ScrollBehavior = 'smooth') {
  if (!hash) return
  const target = document.querySelector(hash)
  if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior, block: 'start' })
  }
}

export function deriveRouteView(pathname: string) {
  const normalized = normalizePathname(pathname)
  if (normalized === '/') return 'planner'
  if (normalized === '/pricing') return 'pricing'
  if (normalized === '/docs') return 'docs'
  if (normalized === '/source-notes') return 'source-notes'
  if (normalized === '/faq') return 'faq'
  if (normalized === '/privacy') return 'privacy'
  if (normalized === '/terms') return 'terms'
  if (normalized === '/changelog') return 'changelog'
  return 'not-found'
}

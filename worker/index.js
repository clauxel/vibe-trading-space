import { annualBillingMultiplier, planCatalog } from '../shared/catalog.mjs'
import { defaultOrigin, indexableSitemapPaths, seoPageMap } from '../shared/site-seo.mjs'
import { handleAnalyticsRequest } from './analytics.js'
import { handlePolarCheckout } from './polar.js'

const bodyLimitBytes = 512 * 1024

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

function getEnv(env, key) {
  const value = env?.[key]
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f\u007f]+/g, '') : ''
}

function getConfiguredOrigins(env) {
  return getEnv(env, 'APP_ORIGIN')
    .split(',')
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

function getRequestOrigin(request, env) {
  return getConfiguredOrigins(env)[0] || new URL(request.url).origin || defaultOrigin
}

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function getSecurityHeaders() {
  return new Headers({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  })
}

function isAllowedOrigin(request, env, origin) {
  const normalizedOrigin = String(origin ?? '').trim().replace(/\/+$/, '')
  if (!normalizedOrigin) return true
  const allowed = new Set(getConfiguredOrigins(env))
  allowed.add(new URL(request.url).origin)
  return allowed.has(normalizedOrigin)
}

function getCorsHeaders(request, env) {
  const headers = getSecurityHeaders()
  const origin = request.headers.get('Origin')
  if (origin && isAllowedOrigin(request, env, origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    headers.set('Vary', 'Origin')
  }
  return headers
}

function jsonResponse(request, env, payload, status = 200) {
  const headers = getCorsHeaders(request, env)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  headers.set('Cache-Control', 'no-store')
  return new Response(JSON.stringify(payload), { status, headers })
}

function textResponse(request, env, body, contentType, status = 200) {
  const headers = getCorsHeaders(request, env)
  headers.set('Content-Type', contentType)
  if (contentType.includes('html')) {
    headers.set('Cache-Control', 'public, max-age=120')
  }
  return new Response(body, { status, headers })
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > bodyLimitBytes) {
    throw new HttpError(413, 'Request body is too large.')
  }
  try {
    return await request.json()
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.')
  }
}

function publicPricingUrl(request, env) {
  return `${getRequestOrigin(request, env)}/pricing/`
}

function publicCheckoutUrl(request, env, planId = 'pro', billing = 'annual') {
  return `${getRequestOrigin(request, env)}/checkout/?plan=${encodeURIComponent(planId)}&billing=${encodeURIComponent(billing)}`
}

function buildPlannerPreview(body) {
  const workflow = String(body?.workflow || body?.workflowId || 'shadow-account').slice(0, 80)
  const market = String(body?.market || body?.marketId || 'mixed-markets').slice(0, 80)
  const prompt = String(body?.prompt || 'Plan a Vibe-Trading research run.').slice(0, 1200)
  const horizon = String(body?.horizon || '90 trading days').slice(0, 120)

  return {
    workflow,
    market,
    horizon,
    prompt,
    commandPreview: `vibe-trading run -p "${prompt.replace(/"/g, "'")}"`,
    sampleOnly: true,
    validationChecklist: [
      'Confirm research-only intent and data-source assumptions.',
      'Use Vibe-Trading auto routing before pinning provider-specific sources.',
      'Record benchmark, drawdown, warning, run-card, and artifact expectations.',
      'Stop before broker/live action unless the user explicitly authorizes it.',
    ],
  }
}

async function handlePlannerRequest(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: getCorsHeaders(request, env) })
  if (request.method !== 'POST') return jsonResponse(request, env, { ok: false, message: 'Method not allowed.' }, 405)

  const body = await readJsonBody(request)
  return jsonResponse(
    request,
    env,
    {
      ok: false,
      code: 'payment_required',
      message: 'Full Vibe-Trading workspace pack generation requires selecting a package first.',
      preview: buildPlannerPreview(body),
      pricingUrl: publicPricingUrl(request, env),
      checkoutUrl: publicCheckoutUrl(request, env, body?.planId || 'pro', body?.billing || 'annual'),
    },
    402,
  )
}

function handleRuntimeRequest(request, env) {
  return jsonResponse(request, env, {
    publicAppOrigin: getRequestOrigin(request, env),
    siteKey: 'vibe_trading_space',
    pricingPath: '/pricing/',
    checkoutPath: '/checkout/',
    paymentProvider: 'polar',
    analyticsStorage: env?.DB ? 'cloudflare_d1' : 'unconfigured',
  })
}

function robotsTxt(origin) {
  return `User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml
`
}

function sitemapXml(origin) {
  const urls = indexableSitemapPaths
    .map((path) => {
      const url = new URL(path, `${origin}/`).toString()
      return `  <url><loc>${url}</loc><changefreq>weekly</changefreq><priority>${path === '/' ? '1.0' : '0.7'}</priority></url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function llmsTxt(origin) {
  return `# Vibe-Trading Space

Vibe-Trading Space is an independent hosted workflow planner and SaaS companion for the open-source Vibe-Trading project.

Canonical site: ${origin}/
Pricing: ${origin}/pricing/
Docs: ${origin}/docs/
Source notes: ${origin}/source-notes/
Support: support@aigeamy.com

Core facts:
- Product category: finance research workflow planner.
- Upstream project: HKUDS/Vibe-Trading, MIT License.
- Upstream package: vibe-trading-ai.
- Inputs: trading prompt, market, horizon, workflow type, risk assumptions.
- Outputs: sample run command, data-route assumptions, validation checklist, paid workspace generation path.
- Limit: research and planning only; this site does not hold funds or execute trades.
`
}

function getSeoForPath(pathname) {
  const normalized = normalizePathname(pathname)
  return seoPageMap.get(normalized) ?? {
    path: normalized,
    title: 'Page not found | Vibe-Trading Space',
    description: 'This Vibe-Trading Space page could not be found.',
    robots: 'noindex,follow',
    h1: 'Page not found',
  }
}

function isKnownPublicPath(pathname) {
  return seoPageMap.has(normalizePathname(pathname))
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function injectSeo(html, request, env) {
  const url = new URL(request.url)
  const origin = getRequestOrigin(request, env)
  const page = getSeoForPath(url.pathname)
  const canonicalUrl = new URL(page.path, `${origin}/`).toString()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': page.path === '/pricing' ? 'Product' : 'WebPage',
    name: page.h1 || page.title,
    description: page.description,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Vibe-Trading Space',
      url: `${origin}/`,
    },
    provider: {
      '@type': 'Organization',
      name: 'Vibe-Trading Space',
      email: 'support@aigeamy.com',
    },
    ...(page.path === '/pricing'
      ? {
          offers: planCatalog.map((plan) => ({
            '@type': 'Offer',
            name: plan.name,
            price: String(plan.monthlyAmountCents / 100),
            priceCurrency: plan.currency,
            url: publicCheckoutUrl(request, env, plan.id, 'monthly'),
          })),
        }
      : {}),
  }

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(page.description)}">`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${escapeHtml(page.robots)}">`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}">`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(page.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(page.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}">`)
    .replace(
      /<script type="application\/ld\+json" id="site-schema">[\s\S]*?<\/script>/i,
      `<script type="application/ld+json" id="site-schema">${JSON.stringify(structuredData)}</script>`,
    )
}

async function serveAssetOrApp(request, env) {
  const url = new URL(request.url)
  const origin = getRequestOrigin(request, env)

  if (url.pathname === '/robots.txt') return textResponse(request, env, robotsTxt(origin), 'text/plain; charset=utf-8')
  if (url.pathname === '/sitemap.xml') return textResponse(request, env, sitemapXml(origin), 'application/xml; charset=utf-8')
  if (url.pathname === '/llms.txt') return textResponse(request, env, llmsTxt(origin), 'text/plain; charset=utf-8')

  if (!env?.ASSETS?.fetch) {
    return textResponse(request, env, 'Asset binding is not configured.', 'text/plain; charset=utf-8', 503)
  }

  const direct = await env.ASSETS.fetch(request)
  const contentType = direct.headers.get('Content-Type') || ''
  if (direct.status !== 404 && !contentType.includes('text/html')) {
    return direct
  }

  const indexUrl = new URL('/index.html', url)
  const indexRequest = new Request(indexUrl, request)
  const indexResponse = await env.ASSETS.fetch(indexRequest)
  if (!indexResponse.ok) return indexResponse
  const html = injectSeo(await indexResponse.text(), request, env)
  const status = direct.status === 404 && !isKnownPublicPath(url.pathname) ? 404 : 200
  return textResponse(request, env, html, 'text/html; charset=utf-8', status)
}

function getCanonicalRedirectResponse(request, env) {
  const canonicalOrigin = getConfiguredOrigins(env)[0] || defaultOrigin
  if (!canonicalOrigin) return null
  const requestUrl = new URL(request.url)
  const canonicalUrl = new URL(canonicalOrigin)
  const acceptedHosts = new Set([canonicalUrl.hostname, `www.${canonicalUrl.hostname}`])
  if (
    acceptedHosts.has(requestUrl.hostname) &&
    (requestUrl.protocol !== 'https:' || requestUrl.hostname !== canonicalUrl.hostname)
  ) {
    requestUrl.protocol = 'https:'
    requestUrl.hostname = canonicalUrl.hostname
    return Response.redirect(requestUrl.toString(), 301)
  }
  return null
}

export async function handleCloudflareRequest(request, env = {}) {
  const redirect = getCanonicalRedirectResponse(request, env)
  if (redirect) return redirect

  try {
    const url = new URL(request.url)

    if (url.pathname === '/api/runtime') return handleRuntimeRequest(request, env)
    if (url.pathname === '/api/planner') return handlePlannerRequest(request, env)
    if (url.pathname === '/api/checkout') {
      return handlePolarCheckout(request, env, {
        plans: planCatalog,
        defaultPlanId: 'pro',
        defaultBilling: 'annual',
        annualDiscountMultiplier: annualBillingMultiplier,
        siteKey: 'vibe_trading_space',
        productName: 'Vibe-Trading Space',
      })
    }
    if (url.pathname === '/api/analytics') {
      return handleAnalyticsRequest(request, env, {
        siteKey: 'vibe_trading_space',
        requireStorage: false,
      })
    }

    return serveAssetOrApp(request, env)
  } catch (error) {
    const status = error?.statusCode || 500
    const message = error instanceof Error ? error.message : 'Unexpected error.'
    return jsonResponse(request, env, { ok: false, message }, status)
  }
}

export default {
  fetch(request, env) {
    return handleCloudflareRequest(request, env)
  },
}

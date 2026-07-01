#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import dns from 'node:dns/promises'
import path from 'node:path'

const root = path.resolve(new URL('../', import.meta.url).pathname)
const reportsDir = path.join(root, 'reports')
const publicDir = path.join(root, 'public')

function arg(name, fallback = '') {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] || fallback : fallback
}

function hasFlag(name) {
  return process.argv.includes(name)
}

function cstIso(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date).map((part) => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`
}

async function readJson(file, fallback = {}) {
  if (!existsSync(file)) return fallback
  return JSON.parse(await readFile(file, 'utf8'))
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function redactUrl(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    if (url.hostname === 'buy.polar.sh') {
      return `${url.origin}/[redacted]`
    }
    if (url.hostname === 'polar.sh' || url.hostname.endsWith('.polar.sh')) {
      const firstPath = url.pathname.split('/').filter(Boolean)[0] || 'checkout'
      return `${url.origin}/${firstPath}/[redacted]`
    }
    return `${url.origin}${url.pathname}`
  } catch {
    return '[redacted]'
  }
}

function snippet(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 220)
}

async function requestText(url, options = {}) {
  const response = await fetch(url, {
    redirect: options.redirect || 'follow',
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
    signal: AbortSignal.timeout(options.timeoutMs || 20000),
  })
  const text = await response.text()
  return { response, text }
}

async function requestJson(url, body) {
  const { response, text } = await requestText(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: new URL(url).origin,
    },
    body: JSON.stringify(body),
  })
  let json = null
  try {
    json = JSON.parse(text)
  } catch {}
  return { response, text, json }
}

function nsFromDohPayload(text) {
  const payload = JSON.parse(text)
  const answers = Array.isArray(payload.Answer) ? payload.Answer : []
  return answers
    .filter((answer) => answer.type === 2 && answer.data)
    .map((answer) => String(answer.data).replace(/\.$/, '').toLowerCase())
    .sort()
}

async function resolveNsRecords(domain) {
  try {
    return (await dns.resolveNs(domain)).map((item) => item.toLowerCase()).sort()
  } catch (error) {
    const urls = [
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=NS`,
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`,
    ]
    for (const url of urls) {
      try {
        const { response, text } = await requestText(url, {
          headers: { Accept: 'application/dns-json' },
          timeoutMs: 20000,
        })
        if (response.ok) {
          const ns = nsFromDohPayload(text)
          if (ns.length) return ns
        }
      } catch {}
      try {
        const text = execFileSync('curl', ['-sS', '--max-time', '20', '-H', 'accept: application/dns-json', url], { encoding: 'utf8' })
        const ns = nsFromDohPayload(text)
        if (ns.length) return ns
      } catch {}
    }
    throw error
  }
}

function passCheck(name, evidence, extra = {}) {
  return { name, status: 'pass', evidence, ...extra }
}

function failCheck(name, evidence, extra = {}) {
  return { name, status: 'failed', evidence, ...extra }
}

function summarizeResponse(response, text = '') {
  return {
    statusCode: response.status,
    finalUrl: response.url,
    server: response.headers.get('server') || '',
    cfRay: response.headers.get('cf-ray') || '',
    contentType: response.headers.get('content-type') || '',
    snippet: snippet(text),
  }
}

async function main() {
  const product = await readJson(path.join(publicDir, 'product.json'), {})
  const search = await readJson(path.join(root, 'search-submission-result.json'), {})
  const domain = arg('--domain', product.domain || 'vibe-trading.space')
  const origin = `https://${domain}`
  const generatedAt = cstIso()
  const checks = []

  try {
    const ns = await resolveNsRecords(domain)
    const expected = ['archer.ns.cloudflare.com', 'sydney.ns.cloudflare.com']
    const ok = expected.every((item) => ns.includes(item))
    checks.push(ok
      ? passCheck('registrar_nameservers', `NS resolved to ${ns.join(', ')}`, { ns })
      : failCheck('registrar_nameservers', `Expected Cloudflare NS ${expected.join(', ')} but resolved ${ns.join(', ')}`, { ns }))
  } catch (error) {
    checks.push(failCheck('registrar_nameservers', `NS lookup failed: ${error.message}`))
  }

  const home = await requestText(`${origin}/`)
  const homeOk = home.response.status === 200 &&
    /Vibe-Trading Space/.test(home.text) &&
    !/Spaceship|openresty|parking/i.test(home.text) &&
    Boolean(home.response.headers.get('cf-ray'))
  checks.push(homeOk
    ? passCheck('apex_https_home', 'Apex HTTPS returned Cloudflare 200 Vibe-Trading HTML with no parking text.', summarizeResponse(home.response, home.text))
    : failCheck('apex_https_home', 'Apex HTTPS did not return the expected Cloudflare Vibe-Trading HTML.', summarizeResponse(home.response, home.text)))

  const www = await requestText(`https://www.${domain}/`, { redirect: 'manual' })
  const location = www.response.headers.get('location') || ''
  const wwwOk = [301, 302, 308].includes(www.response.status) && location.startsWith(`${origin}/`)
  checks.push(wwwOk
    ? passCheck('www_redirect', `www redirects to ${location}`, { statusCode: www.response.status, location })
    : failCheck('www_redirect', `www redirect mismatch: ${www.response.status} ${location}`, { statusCode: www.response.status, location }))

  for (const [name, route, expectedText] of [
    ['pricing_page', '/pricing/', 'Choose a Vibe-Trading planning package'],
    ['runtime_api', '/api/runtime', 'cloudflare_d1'],
    ['robots_txt', '/robots.txt', 'Sitemap:'],
    ['sitemap_xml', '/sitemap.xml', '<urlset'],
    ['llms_txt', '/llms.txt', 'Vibe-Trading Space'],
    ['bing_site_auth', '/BingSiteAuth.xml', '<user>'],
    ['indexnow_key', '/590a3ab02487cffe4cfd55b0df769f65.txt', '590a3ab02487cffe4cfd55b0df769f65'],
  ]) {
    const result = await requestText(`${origin}${route}`)
    const ok = result.response.status === 200 && result.text.includes(expectedText)
    checks.push(ok
      ? passCheck(name, `${route} returned HTTP 200 with expected content.`, summarizeResponse(result.response, result.text))
      : failCheck(name, `${route} did not return expected content.`, summarizeResponse(result.response, result.text)))
  }

  const notFound = await requestText(`${origin}/not-a-real-page`)
  const notFoundOk = notFound.response.status === 404 && /Page not found/.test(notFound.text) && /noindex,follow/.test(notFound.text)
  checks.push(notFoundOk
    ? passCheck('real_404', 'Unknown route returns HTTP 404 with noindex.', summarizeResponse(notFound.response, notFound.text))
    : failCheck('real_404', 'Unknown route did not return expected 404/noindex.', summarizeResponse(notFound.response, notFound.text)))

  const planner = await requestJson(`${origin}/api/planner`, {
    workflow: 'shadow-account',
    market: 'mixed-markets',
    horizon: '90 trading days',
    prompt: 'Production inspection payment gate check.',
  })
  const plannerOk = planner.response.status === 402 && planner.json?.code === 'payment_required'
  checks.push(plannerOk
    ? passCheck('paid_planner_gate', 'Planner API returned HTTP 402 payment_required before paid access.', { statusCode: planner.response.status })
    : failCheck('paid_planner_gate', 'Planner API did not return the expected 402 payment_required response.', { statusCode: planner.response.status, snippet: snippet(planner.text) }))

  const checkout = await requestJson(`${origin}/api/checkout`, { planId: 'pro', billing: 'annual' })
  const checkoutUrl = checkout.json?.checkoutUrl || ''
  const checkoutOk = checkout.response.status === 200 && checkout.json?.paymentProvider === 'polar' && /polar\.sh/.test(checkoutUrl)
  checks.push(checkoutOk
    ? passCheck('polar_checkout_api', 'Checkout API returned a Polar hosted checkout URL.', {
        statusCode: checkout.response.status,
        checkoutUrl: redactUrl(checkoutUrl),
        planId: checkout.json?.planId,
        amountCents: checkout.json?.amountCents,
      })
    : failCheck('polar_checkout_api', 'Checkout API did not return the expected Polar hosted checkout response.', { statusCode: checkout.response.status, snippet: snippet(checkout.text) }))

  const eventId = `prod-inspect-${Date.now()}`
  const analytics = await requestJson(`${origin}/api/analytics`, {
    eventName: 'page_view',
    path: '/',
    routePath: '/',
    visitorId: 'prod-inspect',
    sessionId: eventId,
    occurredAt: new Date().toISOString(),
    metadata: { source: 'prod_inspect' },
  })
  const analyticsOk = analytics.response.status === 202 && analytics.json?.persisted === true
  checks.push(analyticsOk
    ? passCheck('d1_analytics_write', 'Analytics API returned 202 and persisted:true via Cloudflare D1.', {
        statusCode: analytics.response.status,
        accepted: analytics.json?.accepted,
        ingested: analytics.json?.ingested,
        persisted: analytics.json?.persisted,
      })
    : failCheck('d1_analytics_write', 'Analytics API did not persist to Cloudflare D1.', { statusCode: analytics.response.status, snippet: snippet(analytics.text) }))

  const searchOk = search?.gsc?.status === 'submitted' &&
    search?.bing?.status === 'submitted' &&
    search?.bing?.matchingSiteAfter?.isVerified === true &&
    search?.indexNow?.status === 'submitted'
  checks.push(searchOk
    ? passCheck('gsc_bing_indexnow', `GSC ${search.gsc.domainSitemapStatus}/${search.gsc.urlPrefixSitemapStatus}; Bing verified; IndexNow ${search.indexNow.httpStatus}.`)
    : failCheck('gsc_bing_indexnow', 'Search submission result is missing or incomplete.'))

  const status = checks.every((check) => check.status === 'pass') ? 'pass' : 'failed'
  const result = {
    schemaVersion: 1,
    siteKey: 'vibe_trading_space',
    domain,
    collectedAt: generatedAt,
    status,
    checks,
    probes: checks,
    dns: {
      ns: checks.find((check) => check.name === 'registrar_nameservers')?.ns || [],
    },
    searchSubmission: searchOk ? 'submitted' : 'failed',
    no_early_final_until_all_mandatory_gates_pass: true,
    allMandatoryOpenSourceBuildStepsComplete: status === 'pass',
    completionEnforcementGate: status === 'pass' ? 'pass' : 'blocked',
    completionLedger: [
      { id: 'production_https', status: status === 'pass' ? 'pass' : 'blocked_with_evidence', evidence: `${origin}/ inspected at ${generatedAt}` },
      { id: 'search_submission', status: searchOk ? 'pass' : 'blocked_with_evidence', evidence: 'GSC/Bing/IndexNow result inspected without exposing credentials' },
    ],
    nonBacklinkBlockingItems: checks.filter((check) => check.status !== 'pass').map((check) => check.name),
  }

  if (!hasFlag('--no-write')) {
    await writeJson(path.join(reportsDir, 'production-live-checks.json'), result)
    await writeJson(path.join(reportsDir, 'production-verification.json'), result)
  }

  console.log(JSON.stringify({
    domain,
    status,
    checks: checks.map((check) => ({ name: check.name, status: check.status, statusCode: check.statusCode })),
    report: 'reports/production-verification.json',
  }, null, 2))

  if (status !== 'pass') process.exit(1)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

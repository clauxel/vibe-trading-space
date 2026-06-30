import test from 'node:test'
import assert from 'node:assert/strict'

import { handleCloudflareRequest } from '../worker/index.js'

function createRequest(path, body) {
  return new Request(`https://vibe-trading.space${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://vibe-trading.space',
    },
    body: JSON.stringify(body),
  })
}

function createGetRequest(path) {
  return new Request(`https://vibe-trading.space${path}`)
}

function createAssetEnv() {
  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <title>placeholder</title>
  <meta name="description" content="placeholder">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://vibe-trading.space/">
  <meta property="og:title" content="placeholder">
  <meta property="og:description" content="placeholder">
  <meta property="og:url" content="https://vibe-trading.space/">
  <script type="application/ld+json" id="site-schema">{}</script>
</head>
<body><div id="root"></div></body>
</html>`

  return {
    APP_ORIGIN: 'https://vibe-trading.space',
    ASSETS: {
      fetch(request) {
        const url = new URL(request.url)
        if (url.pathname === '/index.html') {
          return Promise.resolve(new Response(indexHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
        }
        return Promise.resolve(new Response('not found', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
      },
    },
  }
}

test('planner API is payment-gated before full workspace generation', async () => {
  const response = await handleCloudflareRequest(
    createRequest('/api/planner', {
      workflow: 'shadow-account',
      market: 'mixed-markets',
      horizon: '90 trading days',
      prompt: 'Compare my BTC and A-share momentum rules.',
    }),
    {
      APP_ORIGIN: 'https://vibe-trading.space',
    },
  )

  assert.equal(response.status, 402)
  const payload = await response.json()
  assert.equal(payload.code, 'payment_required')
  assert.equal(payload.pricingUrl, 'https://vibe-trading.space/pricing/')
  assert.equal(payload.checkoutUrl, 'https://vibe-trading.space/checkout/?plan=pro&billing=annual')
  assert.equal(payload.preview.sampleOnly, true)
  assert.match(payload.preview.commandPreview, /vibe-trading run -p/)
})

test('checkout API returns a configured Polar hosted checkout URL and annual amount', async () => {
  const response = await handleCloudflareRequest(
    createRequest('/api/checkout', {
      planId: 'pro',
      billing: 'annual',
    }),
    {
      APP_ORIGIN: 'https://vibe-trading.space',
      DEFAULT_POLAR_CHECKOUT_URL: 'https://buy.polar.sh/polar_cl_vibe_trading_space_test',
    },
  )

  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.equal(payload.paymentProvider, 'polar')
  assert.equal(payload.checkoutUrl, 'https://buy.polar.sh/polar_cl_vibe_trading_space_test')
  assert.equal(payload.planId, 'pro:annual')
  assert.equal(payload.billing, 'annual')
  assert.equal(payload.amountCents, 17400)
  assert.equal(payload.product, 'Vibe-Trading Space')
})

test('checkout API exposes a clear configuration blocker when Polar is missing', async () => {
  const response = await handleCloudflareRequest(
    createRequest('/api/checkout', {
      planId: 'starter',
      billing: 'monthly',
    }),
    {
      APP_ORIGIN: 'https://vibe-trading.space',
    },
  )

  assert.equal(response.status, 503)
  const payload = await response.json()
  assert.equal(payload.paymentProvider, 'polar')
  assert.match(payload.message, /not configured/i)
})

test('canonical redirects production HTTP but keeps local Worker preview usable', async () => {
  const productionResponse = await handleCloudflareRequest(
    new Request('http://vibe-trading.space/pricing/'),
    {
      APP_ORIGIN: 'https://vibe-trading.space',
      ASSETS: createAssetEnv().ASSETS,
    },
  )
  assert.equal(productionResponse.status, 301)
  assert.equal(productionResponse.headers.get('Location'), 'https://vibe-trading.space/pricing/')

  const localResponse = await handleCloudflareRequest(
    new Request('http://127.0.0.1:8789/api/runtime'),
    {
      APP_ORIGIN: 'https://vibe-trading.space',
    },
  )
  assert.equal(localResponse.status, 200)
  const payload = await localResponse.json()
  assert.equal(payload.paymentProvider, 'polar')
})

test('known SPA routes render as 200 but unknown routes keep a real 404', async () => {
  const env = createAssetEnv()

  const pricingResponse = await handleCloudflareRequest(createGetRequest('/pricing/'), env)
  assert.equal(pricingResponse.status, 200)
  const pricingHtml = await pricingResponse.text()
  assert.match(pricingHtml, /Pricing for Vibe-Trading workflow planning packs/)
  assert.match(pricingHtml, /<meta name="robots" content="index,follow">/)

  const checkoutResponse = await handleCloudflareRequest(createGetRequest('/checkout/?plan=starter&billing=annual'), env)
  assert.equal(checkoutResponse.status, 200)
  const checkoutHtml = await checkoutResponse.text()
  assert.match(checkoutHtml, /Checkout handoff \| Vibe-Trading Space/)
  assert.match(checkoutHtml, /<meta name="robots" content="noindex,follow">/)

  const missingResponse = await handleCloudflareRequest(createGetRequest('/missing-page/'), env)
  assert.equal(missingResponse.status, 404)
  const missingHtml = await missingResponse.text()
  assert.match(missingHtml, /Page not found \| Vibe-Trading Space/)
  assert.match(missingHtml, /<meta name="robots" content="noindex,follow">/)
  assert.match(missingHtml, /<link rel="canonical" href="https:\/\/vibe-trading\.space\/missing-page">/)
})

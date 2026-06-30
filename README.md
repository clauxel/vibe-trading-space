# Vibe-Trading Space

Independent hosted workflow planner and SaaS companion for the public `HKUDS/Vibe-Trading` project.

This site helps visitors shape a Vibe-Trading research prompt into a safer run plan before they launch the upstream CLI, Web UI, or MCP server. It does not execute trades, hold funds, store broker credentials, or claim official HKUDS affiliation.

## Product Shape

- First screen: interactive Vibe-Trading run planner preview.
- Paid gate: full workspace pack generation is blocked by `/api/planner` with HTTP `402` until a package is selected.
- Pricing: Starter, Pro, Enterprise with Annual selected by default and 50% lower annual math.
- Checkout: `/checkout/` confirms plan/billing on the first-party domain, then `/api/checkout` starts Polar hosted checkout when a deployment has configured Polar checkout URL secrets.
- Trust: source boundary, MIT license note, upstream repo facts, source notes, FAQ, privacy, terms, changelog, robots, sitemap, and `llms.txt`.

## Local Development

```bash
npm install
npm run build
npm test
npm run dev
```

## Production Notes

The Cloudflare Worker is configured for `vibe-trading.space` and `www.vibe-trading.space`. Production completion still requires:

- a Cloudflare token/session with Workers, D1, and DNS permissions,
- a real Cloudflare D1 database binding for analytics and paid-gate events,
- Worker deployment plus apex/www DNS and HTTPS verification,
- search submission and live production browser main-flow verification.

As of 2026-06-30, the source repository and independent docs repository are public on GitHub, six Polar one-time products/checkout links exist, and the checkout URL values are stored only in local Keychain services named:

- `POLAR_CHECKOUT_URL_STARTER_ANNUAL`
- `POLAR_CHECKOUT_URL_STARTER_MONTHLY`
- `POLAR_CHECKOUT_URL_PRO_ANNUAL`
- `POLAR_CHECKOUT_URL_PRO_MONTHLY`
- `POLAR_CHECKOUT_URL_ENTERPRISE_ANNUAL`
- `POLAR_CHECKOUT_URL_ENTERPRISE_MONTHLY`

The production domain is not live yet: `http://vibe-trading.space/` still returns a Spaceship parking page, `https://vibe-trading.space/` times out, the apex A records still point at parked IPs, and `www.vibe-trading.space` has no A record.

Support: `support@aigeamy.com`.

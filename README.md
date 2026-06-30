# Vibe-Trading Space

Independent hosted workflow planner and SaaS companion for the public `HKUDS/Vibe-Trading` project.

This site helps visitors shape a Vibe-Trading research prompt into a safer run plan before they launch the upstream CLI, Web UI, or MCP server. It does not execute trades, hold funds, store broker credentials, or claim official HKUDS affiliation.

## Product Shape

- First screen: interactive Vibe-Trading run planner preview.
- Paid gate: full workspace pack generation is blocked by `/api/planner` with HTTP `402` until a package is selected.
- Pricing: Starter, Pro, Enterprise with Annual selected by default and 50% lower annual math.
- Checkout: `/api/checkout` starts Polar hosted checkout when a deployment has a configured Polar checkout URL secret.
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

- real Cloudflare zone/routes and HTTPS verification,
- a real Cloudflare D1 database binding for analytics and paid-gate events,
- Polar checkout URL secrets for each plan/billing path or a provider-created checkout setup,
- search submission and live browser main-flow verification,
- independent public docs repository creation/update.

Support: `support@aigeamy.com`.

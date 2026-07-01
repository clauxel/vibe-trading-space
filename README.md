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

The Cloudflare Worker is live for `vibe-trading.space` and `www.vibe-trading.space`.

As of 2026-07-01, production verification passes:

- apex HTTPS returns the Cloudflare Worker with no registrar parking page,
- `www.vibe-trading.space` redirects to the apex domain,
- `/api/runtime` reports `analyticsStorage: cloudflare_d1`,
- `/api/planner` returns HTTP `402 payment_required` before paid access,
- `/api/checkout` starts Polar hosted checkout with checkout identifiers redacted from evidence,
- `/api/analytics` returns HTTP `202` with `persisted:true`,
- `robots.txt`, `sitemap.xml`, `llms.txt`, `BingSiteAuth.xml`, and the IndexNow key are live,
- GSC, Bing Webmaster, and IndexNow sitemap/URL submissions are recorded in `search-submission-result.json`.

The checkout URL values are stored only in local Keychain services named:

- `POLAR_CHECKOUT_URL_STARTER_ANNUAL`
- `POLAR_CHECKOUT_URL_STARTER_MONTHLY`
- `POLAR_CHECKOUT_URL_PRO_ANNUAL`
- `POLAR_CHECKOUT_URL_PRO_MONTHLY`
- `POLAR_CHECKOUT_URL_ENTERPRISE_ANNUAL`
- `POLAR_CHECKOUT_URL_ENTERPRISE_MONTHLY`

Cloudflare credentials are not stored in this repository. The local deployment workflow treats Keychain service `CLOUDFLARE_API_KEY` as a validated alias candidate for `CLOUDFLARE_API_TOKEN`; if it validates as a legacy Global API Key, it is used only together with `CLOUDFLARE_EMAIL` for the current command.

Support: `support@aigeamy.com`.

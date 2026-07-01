# Website Changelog

## 2026-07-01

- Scope: Continued the full open-source website build Skill completion pass and added mandatory machine-readable completion evidence.
- Fixed: local Worker preview host handling now treats localhost, 127.* hosts, 0.0.0.0, ::1, and *.localhost as local development hosts before canonical HTTPS redirects. This keeps local Worker API verification usable under Wrangler.
- Evidence added: `public/product.json` plus project `reports/` sidecars for local build, performance, docs, in-app browser flow, keyword validation, production verification, and completion gate.
- Verification: `npm test` passed 6/6, `npm run build` passed, `npx wrangler deploy --dry-run` passed, local Worker `/api/planner` returned `402 payment_required`, local `/api/analytics` persisted one D1 event, and local D1 count returned `events=1`.
- Production status: still `production_blocked`. Keychain metadata has Polar checkout URL service names, but no Cloudflare token service was found; `npx wrangler d1 create vibe_trading_space` and `npx wrangler deploy` fail because `CLOUDFLARE_API_TOKEN` is required. Public HTTP still serves the Spaceship parking page, HTTPS fails, and `www` is unresolved.
- Keyword status: official Google Trends same-request MiroFish collection was attempted in the Codex in-app browser and timed out before the Interest over time DOM could be captured; candidate terms are not counted as validated traffic keywords.
- Resume: provide a Cloudflare login/session or Keychain `CLOUDFLARE_API_TOKEN` with Workers Scripts Edit, D1 Edit, and Zone DNS Edit, create/bind D1, sync Polar checkout URL secrets to Cloudflare, deploy the Worker, move DNS away from Spaceship parking, verify apex/www HTTPS, then submit sitemap to GSC/Bing/IndexNow and rerun the completion gate.

## 2026-06-30

- Scope: Full open-source website build Skill rerun for Vibe-Trading Space after the live domain was found unreachable.
- Fixed: added first-party `/checkout/`, `/checkout/success/`, and `/checkout/cancel/` pages; made unknown routes return a real 404; kept local Worker preview from being forced to HTTPS; removed problematic wildcard `_redirects` rules.
- Commercial setup: created six live Polar one-time products and hosted checkout links for Starter/Pro/Enterprise annual/monthly paths; stored only the checkout URL secret names locally, not raw values in source.
- Public assets: created and pushed the public source repository and the independent public docs repository.
- Verification: `npm test` passed with 6 tests, `npm run build` passed, local in-app browser flow passed for homepage, pricing annual/monthly, checkout confirmation, and 404, and direct Worker checkout handler verification returned a redacted `buy.polar.sh` checkout URL.
- Deployment status: production remains `production_blocked`. Cloudflare D1/Worker commands fail with authentication/permission errors for the available token, HTTP still serves a Spaceship parking page, HTTPS times out, apex A records still point to parked IPs, and `www` has no A record.
- Follow-ups: provide a Cloudflare token/session with Workers Scripts Edit, D1 Edit, and Zone DNS Edit permissions; create/bind D1; deploy the Worker; switch registrar nameservers or DNS records to Cloudflare; verify apex/www HTTPS; then run GSC/Bing/IndexNow submissions.
- Prevention note: deployment readiness must check Cloudflare API permissions, D1 creation, DNS nameservers, HTTPS, parking-page absence, and first-party checkout flow before any future report can use `production_complete`.

## 2026-06-29

- Scope: Initial Vibe-Trading Space local build from an open-source-to-SaaS workflow.
- Touched files: React planner UI, shared pricing catalog, Cloudflare Worker API, Polar checkout helper, SEO assets, tests, README, and Cloudflare config.
- Implemented: interactive run planner preview, optimized upstream feature visuals, payment-required planner API, Polar checkout route, MiroFish-style annual/monthly pricing, source boundary notes, privacy/terms/changelog pages, robots, sitemap, llms.txt, and focused tests.
- Verification: `npm run build` passed, `npm test` passed, local HTTP and performance fallback checks passed, report-center registration completed, and site-registry update completed.
- Browser verification: blocked because the Codex in-app browser could discover the backend but could not attach a new local webview during this run; no browser screenshot or click-flow pass is claimed.
- Deployment/Git status: local code build completed; production remains blocked pending Cloudflare/D1/Polar/domain/browser/search/docs verification.
- Follow-ups: create/verify D1 binding, configure Polar checkout URLs, deploy to Cloudflare, verify apex/www HTTPS, submit sitemap, build independent public docs repo, and run 3/6-day indexing/analytics review.
- Prevention note: the first scaffold copy included an old encrypted local secret filename from the source skeleton; it was removed immediately. Future scaffold copies for new sites should exclude `.wrangler`, `data/secrets`, `pricing`, `resources`, `dist`, `.git`, and `node_modules` up front.

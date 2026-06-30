# Website Changelog

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

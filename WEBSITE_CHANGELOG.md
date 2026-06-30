# Website Changelog

## 2026-06-29

- Scope: Initial Vibe-Trading Space local build from an open-source-to-SaaS workflow.
- Touched files: React planner UI, shared pricing catalog, Cloudflare Worker API, Polar checkout helper, SEO assets, tests, README, and Cloudflare config.
- Implemented: interactive run planner preview, optimized upstream feature visuals, payment-required planner API, Polar checkout route, MiroFish-style annual/monthly pricing, source boundary notes, privacy/terms/changelog pages, robots, sitemap, llms.txt, and focused tests.
- Verification: `npm run build` passed, `npm test` passed, local HTTP and performance fallback checks passed, report-center registration completed, and site-registry update completed.
- Browser verification: blocked because the Codex in-app browser could discover the backend but could not attach a new local webview during this run; no browser screenshot or click-flow pass is claimed.
- Deployment/Git status: local code build completed; production remains blocked pending Cloudflare/D1/Polar/domain/browser/search/docs verification.
- Follow-ups: create/verify D1 binding, configure Polar checkout URLs, deploy to Cloudflare, verify apex/www HTTPS, submit sitemap, build independent public docs repo, and run 3/6-day indexing/analytics review.
- Prevention note: the first scaffold copy included an old encrypted local secret filename from the source skeleton; it was removed immediately. Future scaffold copies for new sites should exclude `.wrangler`, `data/secrets`, `pricing`, `resources`, `dist`, `.git`, and `node_modules` up front.

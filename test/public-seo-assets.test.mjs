import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defaultOrigin, indexableSitemapPaths } from '../shared/site-seo.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const expectedUrls = indexableSitemapPaths.map((path) => new URL(path, `${defaultOrigin}/`).toString())

test('static SEO assets point at the live Vibe-Trading Space origin', () => {
  const indexHtml = readFileSync(join(projectRoot, 'index.html'), 'utf8')
  const robotsTxt = readFileSync(join(projectRoot, 'public', 'robots.txt'), 'utf8')
  const sitemapXml = readFileSync(join(projectRoot, 'public', 'sitemap.xml'), 'utf8')
  const llmsTxt = readFileSync(join(projectRoot, 'public', 'llms.txt'), 'utf8')

  assert.match(indexHtml, /<link rel="canonical" href="https:\/\/vibe-trading\.space\/" ?\/?>/)
  assert.match(indexHtml, /<meta property="og:url" content="https:\/\/vibe-trading\.space\/" ?\/?>/)
  assert.match(indexHtml, /Turn a trading hunch into a safer Vibe-Trading run plan/)
  assert.doesNotMatch(indexHtml, /Freqtrade|Hummingbot|freqUI/)

  assert.match(robotsTxt, /^Sitemap: https:\/\/vibe-trading\.space\/sitemap\.xml$/m)
  assert.match(llmsTxt, /Upstream project: HKUDS\/Vibe-Trading/)
  assert.match(llmsTxt, /does not hold funds or execute trades/)

  assert.match(sitemapXml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
  assert.equal(sitemapXml.match(/<url>/g)?.length ?? 0, expectedUrls.length)

  for (const url of expectedUrls) {
    assert.match(sitemapXml, new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`))
  }
})

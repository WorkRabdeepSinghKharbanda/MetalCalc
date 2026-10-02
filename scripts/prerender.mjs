// Post-build step: writes a per-route copy of dist/index.html with that
// route's real <title>, meta description, canonical, OG/Twitter tags and
// BreadcrumbList+SoftwareApplication (+ BlogPosting/Article/FAQPage/ItemList
// where available) JSON-LD already baked into the static HTML.
//
// WHY THIS EXISTS: this app is a 100%-client-rendered SPA — every route's
// <head> is normally only set by Seo.jsx's useEffect, AFTER React mounts.
// Before this script, index.html's canonical/<title>/meta were hardcoded to
// the HOMEPAGE for every single route. Any crawler that reads raw HTML
// before running JS (and Googlebot's *first* crawl pass always does, even
// though it renders JS later in a second pass) saw a canonical pointing at
// "/" on literally every URL — a direct "this page is a duplicate of the
// homepage" signal. That is very likely why Search Console showed pages
// stuck in "Crawled - currently not indexed": Google crawled them, saw a
// self-contradicting canonical, and treated them as duplicates.
//
// This script does NOT prerender the page's visible body content (that
// would need full SSR/hydration, a much bigger project — see CLAUDE.md).
// It only fixes the <head> metadata, which is what the canonical/duplicate-
// content signal actually depends on. React still mounts and renders the
// real content client-side on top, exactly as before.
//
// Relies on Vercel's default behavior: a literal static file at a path takes
// priority over the vercel.json SPA catch-all rewrite, so
// dist/blog/peg-ratio-explained/index.html is served directly for that exact
// URL instead of falling through to the generic index.html.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, SITE_NAME, buildBreadcrumbJsonLd, buildAppJsonLd } from '../src/utils/pageJsonLd.js'
import { buildFaqJsonLd } from '../src/utils/faqJsonLd.js'
import { seoTitle } from '../src/utils/seoTitle.js'
import { STATIC_PAGE_META, NOINDEX_PATHS } from '../src/content/staticPageMeta.js'
import { POSTS } from '../src/blog/posts.js'
import { LANDING_PAGES } from '../src/content/landingPages.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const OG_IMAGE = `${SITE_URL}/og-image.png`

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

function wordCount(sections) {
  return sections.filter((s) => s.p).reduce((sum, s) => sum + s.p.split(/\s+/).length, 0)
}

function renderHtml({ routePath, title, description, jsonLdExtra = [], noIndex = false }) {
  const url = `${SITE_URL}${routePath === '/' ? '' : routePath}`
  let html = template

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeAttr(description)}" />`)
  html = html.replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="${noIndex ? 'noindex, nofollow' : 'index, follow'}" />`)
  html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`)
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeAttr(title)}" />`)
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeAttr(description)}" />`)
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeAttr(title)}" />`)
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeAttr(description)}" />`)

  const jsonLdBlocks = noIndex
    ? []
    : [buildBreadcrumbJsonLd(routePath, title), buildAppJsonLd(routePath, title, description), ...jsonLdExtra.filter(Boolean)]
  const jsonLdScripts = jsonLdBlocks.map((d) => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join('\n    ')
  html = html.replace('</head>', `    ${jsonLdScripts}\n  </head>`)

  return html
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function writeRoute(routePath, html) {
  const dir = routePath === '/' ? DIST : path.join(DIST, routePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
}

let count = 0

// Static routes
for (const [routePath, meta] of Object.entries(STATIC_PAGE_META)) {
  writeRoute(routePath, renderHtml({ routePath, title: meta.title, description: meta.description }))
  count++
}

// noindex static routes (still get correct meta, just marked noindex)
for (const routePath of NOINDEX_PATHS) {
  writeRoute(routePath, renderHtml({ routePath, title: 'MetalCalc', description: 'Embeddable widget.', noIndex: true }))
  count++
}

// Blog posts
for (const post of POSTS) {
  const routePath = `/blog/${post.slug}`
  const jsonLdExtra = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: OG_IMAGE,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      keywords: post.keywords?.join(', '),
      wordCount: wordCount(post.sections),
      author: { '@type': 'Organization', name: SITE_NAME },
      publisher: { '@type': 'Organization', name: SITE_NAME },
      mainEntityOfPage: `${SITE_URL}${routePath}`,
    },
    buildFaqJsonLd(post.faqs),
  ]
  writeRoute(routePath, renderHtml({ routePath, title: seoTitle(post.title, '— MetalCalc Blog'), description: post.description, jsonLdExtra }))
  count++
}

// Blog index gets an ItemList on top of the base blocks
{
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: POSTS.map((post, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/blog/${post.slug}`, name: post.title })),
  }
  const blogMeta = STATIC_PAGE_META['/blog']
  writeRoute('/blog', renderHtml({ routePath: '/blog', title: blogMeta.title, description: blogMeta.description, jsonLdExtra: [itemList] }))
}

// Landing pages
for (const page of LANDING_PAGES) {
  const routePath = `/${page.slug}`
  const jsonLdExtra = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title,
      description: page.description,
      image: OG_IMAGE,
      dateModified: page.updated,
      author: { '@type': 'Organization', name: SITE_NAME },
      publisher: { '@type': 'Organization', name: SITE_NAME },
      mainEntityOfPage: `${SITE_URL}${routePath}`,
    },
    buildFaqJsonLd(page.faqs),
  ]
  writeRoute(routePath, renderHtml({ routePath, title: seoTitle(page.title, '| MetalCalc'), description: page.description, jsonLdExtra }))
  count++
}

console.log(`prerender: wrote ${count + 1} static head-only pages (+ /blog index) into dist/`)

// --- sitemap.xml, generated from the same route data above ---------------
// Previously hand-maintained in public/sitemap.xml, which is exactly how its
// <lastmod> dates went stale (weeks old) while pages kept changing — a stale
// lastmod tells Google "nothing changed, no need to recrawl", the opposite
// of what you want right after a real content/metadata fix. Generating it
// here from the same source-of-truth data this script already reads means
// it can't drift out of sync with the real route list or real update dates.
const today = new Date().toISOString().slice(0, 10)

function sitemapEntry(routePath, { lastmod = today, changefreq = 'monthly', priority = '0.6' } = {}) {
  const url = `${SITE_URL}${routePath === '/' ? '/' : routePath}`
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

const sitemapEntries = [
  sitemapEntry('/', { changefreq: 'daily', priority: '1.0' }),
  ...Object.keys(STATIC_PAGE_META)
    .filter((p) => p !== '/')
    .map((p) => sitemapEntry(p, p === '/blog' ? { changefreq: 'weekly', priority: '0.7' } : { priority: '0.7' })),
  ...POSTS.map((post) => sitemapEntry(`/blog/${post.slug}`, { lastmod: post.updated ?? post.date, priority: '0.6' })),
  ...LANDING_PAGES.map((page) => sitemapEntry(`/${page.slug}`, { lastmod: page.updated ?? today, priority: '0.6' })),
]

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml)
console.log(`prerender: wrote sitemap.xml with ${sitemapEntries.length} URLs`)

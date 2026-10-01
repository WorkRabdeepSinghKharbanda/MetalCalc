// Pure JSON-LD builders, shared between Seo.jsx (runtime, client-side) and
// scripts/prerender.mjs (build-time, Node) — same logic, no drift between
// what a browser sees after JS runs and what a non-JS crawler sees in the
// prerendered static HTML. No DOM access in this file; safe to import from
// either a browser bundle or a plain Node script.
export const SITE_URL = 'https://metal-calc-two.vercel.app'
export const SITE_NAME = 'MetalCalc'

function segmentToLabel(segment) {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function buildBreadcrumbJsonLd(pathname, pageTitle) {
  const segments = pathname.split('/').filter(Boolean)
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }]
  let acc = ''
  segments.forEach((seg, i) => {
    acc += `/${seg}`
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: i === segments.length - 1 ? (pageTitle?.split(' — ')[0] ?? segmentToLabel(seg)) : segmentToLabel(seg),
      item: `${SITE_URL}${acc}`,
    })
  })
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }
}

export function buildAppJsonLd(pathname, title, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title?.split(' — ')[0] ?? SITE_NAME,
    url: `${SITE_URL}${pathname === '/' ? '' : pathname}`,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  }
}

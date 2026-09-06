import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://metal-calc-two.vercel.app'
const SITE_NAME = 'MetalCalc'
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`

function setMeta(attr, key, value) {
  if (!value) return null
  let tag = document.querySelector(`meta[${attr}="${key}"]`)
  const created = !tag
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  const prev = tag.getAttribute('content')
  tag.setAttribute('content', value)
  return { tag, prev, created }
}

function segmentToLabel(segment) {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function buildBreadcrumbJsonLd(pathname, pageTitle) {
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

function buildAppJsonLd(pathname, title, description) {
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

function injectJsonLd(id, data) {
  if (!data) return null
  let script = document.querySelector(`script[data-seo-id="${id}"]`)
  const created = !script
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-seo-id', id)
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
  return { script, created }
}

export default function Seo({ title, description, noIndex = false, jsonLd = null, ogImage = null }) {
  const { pathname } = useLocation()
  const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`
  const image = ogImage ?? DEFAULT_OG_IMAGE

  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const restores = [
      setMeta('name', 'description', description),
      setMeta('name', 'keywords', 'gold price, silver price, platinum price, metal calculator, purity calculator, stock portfolio, crypto portfolio'),
      setMeta('property', 'og:title', title),
      setMeta('property', 'og:description', description),
      setMeta('property', 'og:url', url),
      setMeta('property', 'og:image', image),
      setMeta('property', 'og:type', 'website'),
      setMeta('property', 'og:site_name', SITE_NAME),
      setMeta('name', 'twitter:card', 'summary'),
      setMeta('name', 'twitter:title', title),
      setMeta('name', 'twitter:description', description),
      setMeta('name', 'twitter:image', image),
      setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow'),
    ]

    let canonical = document.querySelector('link[rel="canonical"]')
    const createdCanonical = !canonical
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    const prevHref = canonical.getAttribute('href')
    canonical.setAttribute('href', url)

    const jsonLdEntries = noIndex
      ? []
      : [
          injectJsonLd('breadcrumb', buildBreadcrumbJsonLd(pathname, title)),
          injectJsonLd('app', buildAppJsonLd(pathname, title, description)),
          ...(jsonLd ? [injectJsonLd('page', jsonLd)] : []),
        ]

    return () => {
      document.title = prevTitle
      restores.forEach((r) => {
        if (!r) return
        if (r.created) r.tag.remove()
        else if (r.prev != null) r.tag.setAttribute('content', r.prev)
      })
      if (createdCanonical) canonical.remove()
      else if (prevHref != null) canonical.setAttribute('href', prevHref)
      jsonLdEntries.forEach((entry) => {
        if (entry?.created) entry.script.remove()
      })
    }
  }, [title, description, url, noIndex, jsonLd, image, pathname])

  return null
}

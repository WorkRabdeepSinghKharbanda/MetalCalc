import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_URL, SITE_NAME, buildBreadcrumbJsonLd, buildAppJsonLd } from '../utils/pageJsonLd.js'

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

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

    // Remove any leftover per-page JSON-LD scripts from a previous render (e.g. navigating
    // from a page with 2 extra schema blocks to one with 0 or 1) before adding this page's.
    document.querySelectorAll('script[data-seo-id^="page-"]').forEach((s) => s.remove())
    const pageJsonLd = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : []

    const jsonLdEntries = noIndex
      ? []
      : [
          injectJsonLd('breadcrumb', buildBreadcrumbJsonLd(pathname, title)),
          injectJsonLd('app', buildAppJsonLd(pathname, title, description)),
          ...pageJsonLd.map((data, i) => injectJsonLd(`page-${i}`, data)),
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

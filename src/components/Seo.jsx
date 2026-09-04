import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://metal-calc-two.vercel.app'

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

export default function Seo({ title, description, noIndex = false }) {
  const { pathname } = useLocation()
  const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`

  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const restores = [
      setMeta('name', 'description', description),
      setMeta('property', 'og:title', title),
      setMeta('property', 'og:description', description),
      setMeta('property', 'og:url', url),
      setMeta('name', 'twitter:title', title),
      setMeta('name', 'twitter:description', description),
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

    return () => {
      document.title = prevTitle
      restores.forEach((r) => {
        if (!r) return
        if (r.created) r.tag.remove()
        else if (r.prev != null) r.tag.setAttribute('content', r.prev)
      })
      if (createdCanonical) canonical.remove()
      else if (prevHref != null) canonical.setAttribute('href', prevHref)
    }
  }, [title, description, url, noIndex])

  return null
}

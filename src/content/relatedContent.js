import { POSTS } from '../blog/posts.js'
import { LANDING_PAGES } from './landingPages.js'

function allEntries() {
  return [
    ...POSTS.map((p) => ({ path: `/blog/${p.slug}`, title: p.title, relatedPath: p.relatedPath })),
    ...LANDING_PAGES.map((p) => ({ path: `/${p.slug}`, title: p.title, relatedPath: p.relatedLinks?.[0]?.path })),
  ]
}

// Prioritizes entries that point at the same tool (same relatedPath) as the
// current page — those are the most topically relevant — then fills any
// remaining slots with other content, excluding the current page itself.
export function getRelatedContent(currentPath, count = 3) {
  const all = allEntries()
  const current = all.find((e) => e.path === currentPath)
  const others = all.filter((e) => e.path !== currentPath)
  if (!current?.relatedPath) return others.slice(0, count)

  const sameTopic = others.filter((e) => e.relatedPath === current.relatedPath)
  const rest = others.filter((e) => e.relatedPath !== current.relatedPath)
  return [...sameTopic, ...rest].slice(0, count)
}

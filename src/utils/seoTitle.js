// Drops the brand suffix when adding it would push the <title> tag past the
// ~60 char point Google truncates at — keeping the real, keyword-rich title
// intact instead of truncating mid-word. Shared by the client Seo component
// and scripts/prerender.mjs so the hydrated and prerendered <title> match.
export function seoTitle(title, suffix) {
  const full = `${title} ${suffix}`
  return full.length <= 60 ? full : title
}

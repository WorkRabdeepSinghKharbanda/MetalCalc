// Placeholder until a real AdSense account exists — swap this for the real
// ca-pub-... id from adsense.google.com, and public/ads.txt's pub-... to match.
export const ADSENSE_CLIENT_ID = 'ca-pub-0000000000000000'

export function isAdsConfigured() {
  return ADSENSE_CLIENT_ID !== 'ca-pub-0000000000000000'
}

let scriptLoaded = false

// Must only be called after consent (GDPR) — never on page load.
export function loadAdsenseScript() {
  if (scriptLoaded || !isAdsConfigured()) return
  scriptLoaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

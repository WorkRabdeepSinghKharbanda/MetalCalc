// The adsbygoogle.js script itself loads unconditionally from index.html's
// <head> (Google's standard Auto Ads snippet — loads on every pageview,
// regardless of cookie consent choice). Don't add a second dynamic loader
// here — AdSense flags double-loading the same script as a policy issue.
export const ADSENSE_CLIENT_ID = 'ca-pub-5852027898822024'

export function isAdsConfigured() {
  return ADSENSE_CLIENT_ID !== 'ca-pub-0000000000000000'
}

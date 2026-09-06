import { useEffect } from 'react'
import { ADSENSE_CLIENT_ID, isAdsConfigured } from '../utils/adsense.js'
import { loadAdConsent } from '../utils/adConsent.js'

// Renders a real AdSense unit once a publisher ID is configured AND the
// visitor has consented (GDPR — the ad script itself only loads after
// consent, see CookieConsentBanner.jsx). Otherwise falls back to an empty
// placeholder so layout doesn't shift once ads go live.
export default function AdSlot({ slot, height = 90 }) {
  const live = isAdsConfigured() && loadAdConsent() === 'accepted'

  useEffect(() => {
    if (!live) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense script not ready yet / blocked by an ad blocker — fail silently
    }
  }, [live])

  if (live) {
    return (
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: height }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    )
  }

  return (
    <div className="ad-slot" style={{ minHeight: height }} data-ad-slot={slot}>
      <span className="muted">Ad space</span>
    </div>
  )
}

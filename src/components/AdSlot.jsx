import { useEffect } from 'react'
import { ADSENSE_CLIENT_ID, isAdsConfigured } from '../utils/adsense.js'

// Renders a real AdSense unit once a publisher ID is configured — the
// adsbygoogle.js script loads unconditionally from index.html on every
// pageview (see utils/adsense.js), so this doesn't gate on consent.
// Falls back to a reserved placeholder box so layout never shifts.
//
// PLACEHOLDER SLOT IDs: every `slot` prop passed to <AdSlot> at call sites
// (e.g. "home-mid", "blog-index-top") is an internal label, not a real
// Google ad-unit ID — no ad units have been created in the AdSense dashboard
// yet. Once real ad units exist, swap each call site's `slot` string for the
// real numeric data-ad-slot ID AdSense assigns it.
export default function AdSlot({ slot, height = 90 }) {
  const live = isAdsConfigured()

  useEffect(() => {
    if (!live) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense script not ready yet / blocked by an ad blocker — fail silently
    }
  }, [live])

  return (
    <div className="ad-slot-wrap" style={{ minHeight: height + 20 }}>
      <span className="ad-slot-label">Advertisement</span>
      {live ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: height }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="ad-slot" style={{ minHeight: height }} data-ad-slot={slot}>
          <span className="muted">Ad space</span>
        </div>
      )}
    </div>
  )
}

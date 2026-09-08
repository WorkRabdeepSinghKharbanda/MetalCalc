import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadAdConsent, saveAdConsent } from '../utils/adConsent.js'
import { isAdsConfigured } from '../utils/adsense.js'

// Note: the AdSense script loads unconditionally from index.html regardless
// of the choice made here (Google's Auto Ads snippet doesn't support a
// consent gate). This banner only records the visitor's preference for the
// Privacy Policy's disclosure — it no longer controls whether ads load.
export default function CookieConsentBanner() {
  const [choice, setChoice] = useState(() => loadAdConsent())

  if (choice != null || !isAdsConfigured()) return null

  function accept() {
    saveAdConsent('accepted')
    setChoice('accepted')
  }

  function decline() {
    saveAdConsent('declined')
    setChoice('declined')
  }

  return (
    <div className="cookie-consent">
      <span>
        This site uses cookies for personalized ads. See our{' '}
        <Link to="/privacy-policy">Privacy Policy</Link>.
      </span>
      <div className="cookie-consent-actions">
        <button className="btn btn-primary" onClick={accept}>Accept</button>
        <button className="btn btn-ghost" onClick={decline}>Decline</button>
      </div>
    </div>
  )
}

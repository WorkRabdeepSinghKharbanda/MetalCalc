import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadAdConsent, saveAdConsent } from '../utils/adConsent.js'
import { loadAdsenseScript, isAdsConfigured } from '../utils/adsense.js'

export default function CookieConsentBanner() {
  const [choice, setChoice] = useState(() => loadAdConsent())

  useEffect(() => {
    if (choice === 'accepted') loadAdsenseScript()
  }, [choice])

  if (choice != null || !isAdsConfigured()) return null

  function accept() {
    saveAdConsent('accepted')
    loadAdsenseScript()
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

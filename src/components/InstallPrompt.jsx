import { useEffect, useState } from 'react'

const DISMISS_KEY = 'metalcalc:installPromptDismissed'

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  useEffect(() => {
    function onBeforeInstallPrompt(e) {
      e.preventDefault()
      setDeferredEvent(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  if (!deferredEvent || dismissed) return null

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  async function install() {
    deferredEvent.prompt()
    await deferredEvent.userChoice
    setDeferredEvent(null)
  }

  return (
    <div className="install-prompt">
      <span>◆ Install MetalCalc for quick access, offline prices &amp; alerts.</span>
      <div className="install-prompt-actions">
        <button className="btn btn-primary" onClick={install}>Install</button>
        <button className="btn btn-ghost" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>
    </div>
  )
}

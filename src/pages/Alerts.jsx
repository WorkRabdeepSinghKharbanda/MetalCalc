import { useEffect, useState } from 'react'
import { SYMBOLS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { loadAlerts, saveAlerts } from '../utils/priceAlerts.js'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import { playBeep, vibrate } from '../utils/beep.js'
import Seo from '../components/Seo.jsx'

const REPEAT_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

export default function Alerts() {
  const { prices, rates, currency } = useMarket()
  const [alerts, setAlerts] = useState(() => loadAlerts())
  const [metal, setMetal] = useState('Gold')
  const [condition, setCondition] = useState('above')
  const [target, setTarget] = useState('')
  const [repeat, setRepeat] = useState(false)
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  useEffect(() => {
    if (!prices) return
    const now = Date.now()
    let changed = false
    const next = alerts.map((a) => {
      if (a.fired) {
        if (a.repeat && a.firedAt && now - a.firedAt >= REPEAT_COOLDOWN_MS) {
          changed = true
          return { ...a, fired: false, firedAt: null }
        }
        return a
      }
      const price = prices[a.metal] * (rates[a.currency] ?? 1)
      const hit = a.condition === 'above' ? price >= a.target : price <= a.target
      if (!hit) return a
      changed = true
      if (permission === 'granted') {
        new Notification('MetalCalc price alert', {
          body: `${a.metal} is now ${a.condition === 'above' ? 'above' : 'below'} ${a.currency} ${a.target}`,
        })
      }
      playBeep()
      vibrate()
      return { ...a, fired: true, firedAt: now }
    })
    if (changed) {
      setAlerts(next)
      saveAlerts(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices, rates, permission])

  function requestPermission() {
    Notification.requestPermission().then(setPermission)
  }

  function addAlert(e) {
    e.preventDefault()
    if (!target || Number(target) <= 0) return
    const next = [
      ...alerts,
      { id: crypto.randomUUID(), metal, condition, target: Number(target), currency, repeat, fired: false, firedAt: null },
    ]
    setAlerts(next)
    saveAlerts(next)
    setTarget('')
  }

  function removeAlert(id) {
    const next = alerts.filter((a) => a.id !== id)
    setAlerts(next)
    saveAlerts(next)
  }

  function resetAlert(id) {
    const next = alerts.map((a) => (a.id === id ? { ...a, fired: false, firedAt: null } : a))
    setAlerts(next)
    saveAlerts(next)
  }

  return (
    <section className="alerts-page">
      <Seo title="Price Alerts — MetalCalc" description="Get notified in your browser when gold, silver or platinum crosses your target price." />
      <div className="container">
        <p className="eyebrow">Price alerts</p>
        <h1>Get notified when a metal hits your price</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Runs entirely in your browser — no account, no server. Alerts only fire while this tab is open.
        </p>

        {permission !== 'granted' && permission !== 'unsupported' && (
          <div className="card alert-permission">
            <p>Enable browser notifications to get alerted even when you're on another tab.</p>
            <button className="btn btn-primary" onClick={requestPermission}>Enable notifications</button>
          </div>
        )}
        {permission === 'unsupported' && (
          <p className="muted">Notifications aren't supported in this browser — alerts will still show in this list.</p>
        )}

        <form className="card alert-form" onSubmit={addAlert}>
          <select value={metal} onChange={(e) => setMetal(e.target.value)}>
            {Object.keys(SYMBOLS).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="above">goes above</option>
            <option value="below">drops below</option>
          </select>
          <input
            type="number"
            min="0"
            placeholder={`Target (${currency})`}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <label className="alert-repeat">
            <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
            🔁 Repeat
          </label>
          <button className="btn btn-primary" type="submit">+ Add alert</button>
        </form>

        {alerts.length === 0 ? (
          <div className="card empty-state">
            <p>No alerts yet. Add one above.</p>
          </div>
        ) : (
          <div className="alert-list">
            {alerts.map((a) => {
              const currentPrice = prices ? prices[a.metal] * (rates[a.currency] ?? 1) : null
              return (
                <div key={a.id} className={`card alert-row ${a.fired ? 'fired' : ''}`}>
                  <span>
                    {a.metal} {a.condition} {CURRENCY_SYMBOLS[a.currency] ?? ''}{a.target}
                    {a.repeat && <span className="muted"> · repeats</span>}
                  </span>
                  <span className="muted">
                    current: {currentPrice != null ? `${CURRENCY_SYMBOLS[a.currency] ?? ''}${currentPrice.toFixed(2)}` : '—'}
                  </span>
                  <span>{a.fired ? '🔔 Triggered' : '⏳ Watching'}</span>
                  <div className="alert-row-actions">
                    {a.fired && !a.repeat && (
                      <button className="btn btn-ghost" onClick={() => resetAlert(a.id)}>Reset</button>
                    )}
                    <button className="btn btn-ghost icon-btn" onClick={() => removeAlert(a.id)} aria-label="Remove alert">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

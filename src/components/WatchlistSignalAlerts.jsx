import { useState } from 'react'
import { useWatchlistSignals } from '../hooks/useWatchlistSignals.js'
import LastUpdated from './LastUpdated.jsx'

const SIGNAL_ICON = { buy: '🟢', sell: '🔴', hold: '⚪' }

export default function WatchlistSignalAlerts({ watchlist }) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const coinIds = watchlist.map((w) => w.coinId)
  const { signals, updatedAt } = useWatchlistSignals(coinIds)

  function requestPermission() {
    Notification.requestPermission().then(setPermission)
  }

  if (watchlist.length === 0) return null

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>1-day signal alerts</h3>
      <p className="muted small-note">
        Checks each watchlist coin's 1-day RSI/momentum signal every 5 minutes while this tab is open, and notifies
        you when it flips to Buy or Sell. Not a prediction, not financial advice.
      </p>
      {permission !== 'granted' && permission !== 'unsupported' && (
        <button className="btn btn-primary" onClick={requestPermission} style={{ marginBottom: '1rem' }}>
          Enable notifications
        </button>
      )}
      <div className="alert-list">
        {watchlist.map((w) => {
          const s = signals[w.coinId]
          return (
            <div key={w.coinId} className="card alert-row">
              <span><strong>{w.symbol}</strong> <span className="muted">{w.name}</span></span>
              <span>{s ? `${SIGNAL_ICON[s.signal]} ${s.signal.toUpperCase()}` : 'checking…'}</span>
              <span className="muted small-note">{s?.reason ?? ''}</span>
            </div>
          )
        })}
      </div>
      <LastUpdated timestamp={updatedAt} />
    </div>
  )
}

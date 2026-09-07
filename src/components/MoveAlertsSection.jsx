import { useState } from 'react'
import { useWatchlistMoveAlerts } from '../hooks/useWatchlistMoveAlerts.js'
import LastUpdated from './LastUpdated.jsx'

function fmt(n) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

export default function MoveAlertsSection({ watchlist }) {
  const [threshold, setThreshold] = useState(5)
  const coinIds = watchlist.map((w) => w.coinId)
  const { moves, updatedAt } = useWatchlistMoveAlerts(coinIds, Number(threshold))

  if (watchlist.length === 0) return null

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>1h price move alerts</h3>
      <p className="muted small-note">
        Checks each watchlist coin's 1-hour % move every 5 minutes while this tab is open, and notifies you once
        it crosses your threshold (resets once the move falls back under it).
      </p>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        Notify on moves of
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          style={{ width: '4.5rem' }}
        />
        % or more
      </label>
      <div className="alert-list">
        {watchlist.map((w) => {
          const pct = moves[w.coinId]
          return (
            <div key={w.coinId} className="card alert-row">
              <span><strong>{w.symbol}</strong> <span className="muted">{w.name}</span></span>
              <span className={pct == null ? 'muted' : pct >= 0 ? 'arrow up' : 'arrow down'}>
                {pct == null ? 'checking…' : `${pct >= 0 ? '+' : ''}${fmt(pct)}% (1h)`}
              </span>
            </div>
          )
        })}
      </div>
      <LastUpdated timestamp={updatedAt} />
    </div>
  )
}

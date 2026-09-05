import { computeSignal } from '../utils/tradeSignal.js'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function TradeSignalsSection({ rows, loading }) {
  const signaled = rows.map((r) => ({ ...r, ...computeSignal(r) }))
  const buys = signaled.filter((r) => r.signal === 'buy').slice(0, 5)
  const sells = signaled.filter((r) => r.signal === 'sell').slice(0, 5)

  return (
    <div className="rankings-section">
      <h2 className="section-title" style={{ margin: 0 }}>Trade Signals</h2>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>
        A simple rule-based heuristic from today's 24h range and distance from all-time-high — not a prediction,
        not financial advice. No RSI/MACD (needs price history this API tier doesn't provide).
      </p>

      {loading && <p className="muted">Loading signals…</p>}

      {!loading && (
        <div className="signal-columns">
          <div>
            <h3 className="signal-heading buy">🟢 Consider buying</h3>
            {buys.length === 0 ? (
              <p className="muted">No coins currently near a 24h low with a deep ATH discount.</p>
            ) : (
              <ul className="signal-list">
                {buys.map((r) => (
                  <li key={r.id}>
                    <strong>{r.symbol}</strong> <span className="muted">{r.name}</span>
                    <span className="signal-price">${fmt(r.price)}</span>
                    <span className="signal-reason">{r.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="signal-heading sell">🔴 Consider selling</h3>
            {sells.length === 0 ? (
              <p className="muted">No coins currently near a 24h high with strong upward momentum.</p>
            ) : (
              <ul className="signal-list">
                {sells.map((r) => (
                  <li key={r.id}>
                    <strong>{r.symbol}</strong> <span className="muted">{r.name}</span>
                    <span className="signal-price">${fmt(r.price)}</span>
                    <span className="signal-reason">{r.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

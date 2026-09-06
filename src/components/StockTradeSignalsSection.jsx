import { computeStockSignal } from '../utils/stockTradeSignal.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function StockTradeSignalsSection({ rows, loading }) {
  const { currency, rates } = useMarket()
  const rate = rates[currency] ?? 1
  const cSymbol = CURRENCY_SYMBOLS[currency] ?? '$'
  const fmtC = (usd) => (usd == null || Number.isNaN(usd) ? '—' : `${cSymbol}${fmt(usd * rate)}`)
  const signaled = rows.map((r) => ({ ...r, ...computeStockSignal(r) }))
  const buys = signaled.filter((r) => r.signal === 'buy').sort((a, b) => b.score - a.score).slice(0, 5)
  const sells = signaled.filter((r) => r.signal === 'sell').sort((a, b) => a.score - b.score).slice(0, 5)

  return (
    <div className="rankings-section">
      <h2 className="section-title" style={{ margin: 0 }}>Trade Signals</h2>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>
        A weighted composite score across PEG, EPS/revenue growth YoY, 52-week range position and today's momentum —
        not a prediction, not financial advice.
      </p>

      {loading && rows.length === 0 && <p className="muted">Loading signals…</p>}

      {rows.length > 0 && (
        <div className="signal-columns">
          <div>
            <h3 className="signal-heading buy">🟢 Consider buying</h3>
            {buys.length === 0 ? (
              <p className="muted">No stocks currently near a 52-week low with a reasonable PEG.</p>
            ) : (
              <ul className="signal-list">
                {buys.map((r) => (
                  <li key={r.symbol}>
                    <strong>{r.symbol}</strong> <span className="muted">{r.name}</span>
                    <span className="signal-price">{fmtC(r.price)}</span>
                    <span className="signal-reason">{r.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="signal-heading sell">🔴 Consider selling</h3>
            {sells.length === 0 ? (
              <p className="muted">No stocks currently near a 52-week high with strong upward momentum.</p>
            ) : (
              <ul className="signal-list">
                {sells.map((r) => (
                  <li key={r.symbol}>
                    <strong>{r.symbol}</strong> <span className="muted">{r.name}</span>
                    <span className="signal-price">{fmtC(r.price)}</span>
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

import { useState } from 'react'
import { RANKING_CATEGORIES, RANKING_STOCKS } from '../finnhub/rankingList.js'
import { rankByPeg } from '../utils/rankStocks.js'

const RANKING_STOCKS_COUNT = RANKING_STOCKS.length

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

// Position within the 52-week range as a demand/supply proxy — real supply/demand
// zones need OHLC price-action history, which this Finnhub plan doesn't grant access to.
function rangePosition(price, low, high) {
  if (price == null || low == null || high == null || high <= low) return null
  const pct = ((price - low) / (high - low)) * 100
  return Math.min(100, Math.max(0, pct))
}

function rangeLabel(pct) {
  if (pct == null) return '—'
  if (pct <= 20) return 'near demand'
  if (pct >= 80) return 'near supply'
  return 'mid-range'
}

export default function TechRankingsTable({ rows, loading, progress, error }) {
  const [category, setCategory] = useState('All')

  const filtered = rows.filter((r) => category === 'All' || r.category === category)
  const sorted = rankByPeg(filtered)

  return (
    <div className="rankings-section">
      <div className="rankings-header">
        <h2 className="section-title" style={{ margin: 0 }}>AI, Semiconductor &amp; Tech Rankings</h2>
        <div className="segmented">
          {['All', ...RANKING_CATEGORIES].map((c) => (
            <button key={c} className={c === category ? 'active' : ''} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>
        Ranked ascending by PEG (lower = more growth per dollar of valuation). "52w Zone" is a demand/supply proxy from
        52-week high/low — real supply/demand zones need OHLC price-action history, unavailable on this Finnhub plan.
        {RANKING_STOCKS_COUNT} stocks, fetched in throttled batches to respect Finnhub's free-tier rate limit — the
        table fills in gradually. Today's snapshot, not investment advice.
      </p>

      {loading && sorted.length === 0 && <p className="muted">Loading rankings…</p>}
      {loading && progress && sorted.length > 0 && (
        <p className="muted small-note">Loading more… {progress.done}/{progress.total}</p>
      )}
      {error && <p className="error">{error}</p>}

      {sorted.length > 0 && (
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Chg %</th>
                <th>P/E</th>
                <th>PEG</th>
                <th>EPS Gr. YoY</th>
                <th>Rev Gr. YoY</th>
                <th title="Position in 52-week range — a proxy for demand/supply zones. Real zones need OHLC price-action history, unavailable on this Finnhub plan.">
                  52w Zone
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const pos = rangePosition(r.price, r.week52Low, r.week52High)
                return (
                  <tr key={r.symbol} className={i === 0 && r.peg != null ? 'top-pick' : ''}>
                    <td>{i === 0 && r.peg != null ? '🏆' : i + 1}</td>
                    <td><strong>{r.symbol}</strong></td>
                    <td>{r.name}</td>
                    <td>{r.category}</td>
                    <td>{r.price != null ? `$${fmt(r.price)}` : '—'}</td>
                    <td className={r.changePct >= 0 ? 'arrow up' : r.changePct < 0 ? 'arrow down' : ''}>
                      {r.changePct != null ? `${r.changePct >= 0 ? '+' : ''}${fmt(r.changePct)}%` : '—'}
                    </td>
                    <td>{fmt(r.peTTM)}</td>
                    <td>{fmt(r.peg)}</td>
                    <td>{r.epsGrowthYoy != null ? `${fmt(r.epsGrowthYoy)}%` : '—'}</td>
                    <td>{r.revenueGrowthYoy != null ? `${fmt(r.revenueGrowthYoy)}%` : '—'}</td>
                    <td>
                      {pos != null ? (
                        <span className={pos <= 20 ? 'arrow up' : pos >= 80 ? 'arrow down' : 'muted'}>
                          {rangeLabel(pos)} ({fmt(pos, 0)}%)
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

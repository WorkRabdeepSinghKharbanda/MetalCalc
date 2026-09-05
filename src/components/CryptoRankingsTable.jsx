import { useState } from 'react'
import { RANKING_CATEGORIES } from '../crypto/rankingList.js'
import { rankByAthDiscount } from '../utils/rankCrypto.js'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

// Position within the 24h range as a demand/supply proxy — same idea as the
// stock rankings' 52w Zone, just on a shorter window since CoinGecko's free
// tier gives 24h high/low, not a rolling 52-week range.
function rangePosition(price, low, high) {
  if (price == null || low == null || high == null || high <= low) return null
  const pct = ((price - low) / (high - low)) * 100
  return Math.min(100, Math.max(0, pct))
}

export default function CryptoRankingsTable({ rows, loading, error }) {
  const [category, setCategory] = useState('All')

  const filtered = rows.filter((r) => category === 'All' || r.category === category)
  const sorted = rankByAthDiscount(filtered)

  return (
    <div className="rankings-section">
      <div className="rankings-header">
        <h2 className="section-title" style={{ margin: 0 }}>Layer1, DeFi &amp; Meme Rankings</h2>
        <div className="segmented">
          {['All', ...RANKING_CATEGORIES].map((c) => (
            <button key={c} className={c === category ? 'active' : ''} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>
        Ranked ascending by discount from all-time-high (biggest dip from peak first). "24h Zone" shows where today's
        price sits in its 24h range. Today's snapshot, not investment advice.
      </p>

      {loading && <p className="muted">Loading rankings…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && sorted.length > 0 && (
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>24h %</th>
                <th>Market Cap</th>
                <th>From ATH</th>
                <th title="Position in today's 24h range">24h Zone</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const pos = rangePosition(r.price, r.low24h, r.high24h)
                return (
                  <tr key={r.id} className={i === 0 && r.athChangePct != null ? 'top-pick' : ''}>
                    <td>{i === 0 && r.athChangePct != null ? '🏆' : i + 1}</td>
                    <td><strong>{r.symbol}</strong></td>
                    <td>{r.name}</td>
                    <td>{r.category}</td>
                    <td>{r.price != null ? `$${fmt(r.price)}` : '—'}</td>
                    <td className={r.changePct >= 0 ? 'arrow up' : r.changePct < 0 ? 'arrow down' : ''}>
                      {r.changePct != null ? `${r.changePct >= 0 ? '+' : ''}${fmt(r.changePct)}%` : '—'}
                    </td>
                    <td>{r.marketCap != null ? `$${fmt(r.marketCap / 1e9, 1)}B` : '—'}</td>
                    <td className={r.athChangePct != null && r.athChangePct >= -10 ? 'arrow up' : ''}>
                      {r.athChangePct != null ? `${fmt(r.athChangePct)}%` : '—'}
                    </td>
                    <td>
                      {pos != null ? (
                        <span className={pos <= 20 ? 'arrow up' : pos >= 80 ? 'arrow down' : 'muted'}>
                          {fmt(pos, 0)}%
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

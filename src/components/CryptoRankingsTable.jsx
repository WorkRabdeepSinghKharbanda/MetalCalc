import { useState } from 'react'
import { RANKING_CATEGORIES } from '../crypto/rankingList.js'
import { useSortableTable } from '../hooks/useSortableTable.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import SortableTh from './SortableTh.jsx'

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
  const { currency, rates } = useMarket()
  const rate = rates[currency] ?? 1
  const cSymbol = CURRENCY_SYMBOLS[currency] ?? '$'
  const fmtC = (usd, decimals = 2) => (usd == null || Number.isNaN(usd) ? '—' : `${cSymbol}${fmt(usd * rate, decimals)}`)

  const filtered = rows
    .filter((r) => category === 'All' || r.category === category)
    .map((r) => ({ ...r, rangePos: rangePosition(r.price, r.low24h, r.high24h) }))

  const { sorted, sortKey, sortDir, toggleSort } = useSortableTable(filtered, 'athChangePct', 'asc')

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
        Click any column header to sort. "24h Zone" shows where today's price sits in its 24h range. Today's
        snapshot, not investment advice.
      </p>

      {loading && <p className="muted">Loading rankings…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && sorted.length > 0 && (
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th>#</th>
                <SortableTh label="Symbol" sortKey="symbol" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Category" sortKey="category" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Price" sortKey="price" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="24h %" sortKey="changePct" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Market Cap" sortKey="marketCap" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="From ATH" sortKey="athChangePct" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="24h Zone" sortKey="rangePos" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} title="Position in today's 24h range" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.id} className={i === 0 && sortKey === 'athChangePct' && sortDir === 'asc' && r.athChangePct != null ? 'top-pick' : ''}>
                  <td>{i === 0 && sortKey === 'athChangePct' && sortDir === 'asc' && r.athChangePct != null ? '🏆' : i + 1}</td>
                  <td><strong>{r.symbol}</strong></td>
                  <td>{r.name}</td>
                  <td>{r.category}</td>
                  <td>{fmtC(r.price)}</td>
                  <td className={r.changePct >= 0 ? 'arrow up' : r.changePct < 0 ? 'arrow down' : ''}>
                    {r.changePct != null ? `${r.changePct >= 0 ? '+' : ''}${fmt(r.changePct)}%` : '—'}
                  </td>
                  <td>{r.marketCap != null ? `${fmtC(r.marketCap / 1e9, 1)}B` : '—'}</td>
                  <td className={r.athChangePct != null && r.athChangePct >= -10 ? 'arrow up' : ''}>
                    {r.athChangePct != null ? `${fmt(r.athChangePct)}%` : '—'}
                  </td>
                  <td>
                    {r.rangePos != null ? (
                      <span className={r.rangePos <= 20 ? 'arrow up' : r.rangePos >= 80 ? 'arrow down' : 'muted'}>
                        {fmt(r.rangePos, 0)}%
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useSortableTable } from '../hooks/useSortableTable.js'
import SortableTh from './SortableTh.jsx'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

const TIERS = [
  { label: 'Top 10', max: 10 },
  { label: 'Top 25', max: 25 },
  { label: 'Top 50', max: 50 },
]

export default function TopCryptoTable({ rows, loading, error }) {
  const [tier, setTier] = useState(10)

  const filtered = rows.filter((r) => r.rank == null || r.rank <= tier)
  const { sorted, sortKey, sortDir, toggleSort } = useSortableTable(filtered, 'rank', 'asc')

  return (
    <div className="rankings-section">
      <div className="rankings-header">
        <h2 className="section-title" style={{ margin: 0 }}>Top Crypto by Market Cap</h2>
        <div className="segmented">
          {TIERS.map((t) => (
            <button key={t.max} className={t.max === tier ? 'active' : ''} onClick={() => setTier(t.max)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>Click any column header to sort.</p>

      {loading && <p className="muted">Loading top coins…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && sorted.length > 0 && (
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <SortableTh label="#" sortKey="rank" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Symbol" sortKey="symbol" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Name" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Price" sortKey="price" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="24h %" sortKey="changePct" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="Market Cap" sortKey="marketCap" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                <SortableTh label="From ATH" sortKey="athChangePct" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id}>
                  <td>{r.rank ?? '—'}</td>
                  <td><strong>{r.symbol}</strong></td>
                  <td>{r.name}</td>
                  <td>{r.price != null ? `$${fmt(r.price)}` : '—'}</td>
                  <td className={r.changePct >= 0 ? 'arrow up' : r.changePct < 0 ? 'arrow down' : ''}>
                    {r.changePct != null ? `${r.changePct >= 0 ? '+' : ''}${fmt(r.changePct)}%` : '—'}
                  </td>
                  <td>{r.marketCap != null ? `$${fmt(r.marketCap / 1e9, 1)}B` : '—'}</td>
                  <td>{r.athChangePct != null ? `${fmt(r.athChangePct)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

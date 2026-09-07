import { useCorrelationMatrix } from '../hooks/useCorrelationMatrix.js'

function fmt(n) {
  return n == null || Number.isNaN(n) ? '—' : `${n.toFixed(0)}%`
}

function cellClass(pct) {
  if (pct == null) return 'muted'
  if (pct >= 70) return 'arrow down' // moves together a lot -> low real diversification, flag it
  if (pct <= 40) return 'arrow up'
  return ''
}

export default function CorrelationSection({ coins }) {
  const { matrix, loading, error } = useCorrelationMatrix(coins)

  if (coins.length < 2) return null

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Correlation check</h3>
      <p className="muted small-note">
        % of the last {30} days these coins moved the same direction (both up or both down) — a crude proxy, not a
        real correlation coefficient. High % means they don't actually diversify you against each other. Crypto
        only — metals/stocks have no historical price API here.
      </p>
      {loading && <p className="muted">Loading price history…</p>}
      {error && <p className="error">{error}</p>}
      {matrix && (
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th></th>
                {coins.map((c) => <th key={c.id}>{c.symbol}</th>)}
              </tr>
            </thead>
            <tbody>
              {coins.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.symbol}</strong></td>
                  {coins.map((b) => (
                    <td key={b.id} className={a.id === b.id ? 'muted' : cellClass(matrix[a.id]?.[b.id])}>
                      {a.id === b.id ? '—' : fmt(matrix[a.id]?.[b.id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

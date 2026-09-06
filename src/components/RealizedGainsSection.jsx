function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function RealizedGainsSection({ gains, fmtC, onDelete }) {
  if (gains.length === 0) return null

  const total = gains.reduce((sum, g) => sum + g.gain, 0)

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Realized gains</h3>
      <p className="muted small-note">
        A rough tax-lot estimate, not tax advice — consult a professional for actual filing.
      </p>
      <p>
        Total realized: <strong className={total >= 0 ? 'arrow up' : 'arrow down'}>
          {total >= 0 ? '+' : ''}{fmtC(total)}
        </strong>
      </p>
      <div className="table-scroll">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Qty sold</th>
              <th>Avg buy</th>
              <th>Sell price</th>
              <th>Gain/Loss</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {gains.map((g) => (
              <tr key={g.id}>
                <td><strong>{g.symbol}</strong></td>
                <td>{fmt(g.qty)}</td>
                <td>{fmtC(g.avgBuy)}</td>
                <td>{fmtC(g.sellPrice)}</td>
                <td className={g.gain >= 0 ? 'arrow up' : 'arrow down'}>
                  {g.gain >= 0 ? '+' : ''}{fmtC(g.gain)}
                </td>
                <td className="muted">{new Date(g.soldAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-ghost icon-btn" onClick={() => onDelete(g.id)} aria-label={`Remove ${g.symbol} entry`}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

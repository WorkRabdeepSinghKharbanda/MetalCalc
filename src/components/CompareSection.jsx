export default function CompareSection({ title, items }) {
  if (items.length === 0) return null

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {items.length < 2 ? (
        <p className="muted small-note">Watch at least 2 to compare them side by side.</p>
      ) : (
        <div className="table-scroll">
          <table className="stock-table">
            <thead>
              <tr>
                <th></th>
                {items.map((it) => <th key={it.symbol}>{it.symbol}</th>)}
              </tr>
            </thead>
            <tbody>
              {items[0].metrics.map((m, i) => (
                <tr key={m.label}>
                  <td className="muted">{m.label}</td>
                  {items.map((it) => <td key={it.symbol}>{it.metrics[i].value}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

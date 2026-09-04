import { SYMBOLS } from '../calc.js'
import Sparkline from './Sparkline.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { downloadCsv } from '../utils/downloadCsv.js'

export default function PriceHistorySection() {
  const { history } = useMarket()

  function handleExportCsv() {
    const headers = ['Timestamp', ...Object.keys(SYMBOLS)]
    const rows = history.map((entry) => [
      new Date(entry.t).toISOString(),
      ...Object.keys(SYMBOLS).map((m) => entry[m] ?? ''),
    ])
    downloadCsv('metalcalc-price-history.csv', headers, rows)
  }

  return (
    <section className="price-history">
      <div className="container">
        <h2 className="section-title">Your price history</h2>
        <p className="muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Tracked locally on this device every time prices refresh — no account needed.
        </p>
        {history.length < 2 ? (
          <p className="muted" style={{ textAlign: 'center' }}>
            Refresh prices a few times (or come back later) to see trend lines build up here.
          </p>
        ) : (
          <>
            <div className="sparkline-grid">
              {Object.keys(SYMBOLS).map((m) => (
                <Sparkline key={m} history={history} metal={m} />
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={handleExportCsv}>⬇ Export history CSV</button>
            </p>
          </>
        )}
      </div>
    </section>
  )
}

import { SYMBOLS } from '../calc.js'
import Sparkline from './Sparkline.jsx'
import { useMarket } from '../context/MarketContext.jsx'

export default function PriceHistorySection() {
  const { history } = useMarket()

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
          <div className="sparkline-grid">
            {Object.keys(SYMBOLS).map((m) => (
              <Sparkline key={m} history={history} metal={m} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

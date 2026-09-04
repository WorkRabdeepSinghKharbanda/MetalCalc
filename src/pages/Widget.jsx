import { GRAMS_PER_TROY_OZ, SYMBOLS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

export default function Widget() {
  const { prices, loading, currency, rates } = useMarket()
  const rate = rates[currency] ?? 1
  const symbol = CURRENCY_SYMBOLS[currency] ?? ''

  if (!prices) {
    return <div className="widget-page muted">{loading ? 'Loading…' : 'Unavailable'}</div>
  }

  return (
    <div className="widget-page">
      <Seo title="Live Metal Prices Widget — MetalCalc" description="Embeddable live gold, silver and platinum price ticker." noIndex />
      {Object.keys(SYMBOLS).map((m) => (
        <div key={m} className="widget-item">
          <span className="widget-metal">{m}</span>
          <span className="widget-price">
            {symbol}{((prices[m] * rate) / GRAMS_PER_TROY_OZ).toFixed(2)}<small>/g</small>
          </span>
        </div>
      ))}
      <a className="widget-credit" href="https://metal-calc-two.vercel.app" target="_blank" rel="noopener noreferrer">
        via MetalCalc
      </a>
    </div>
  )
}

import { useState } from 'react'
import { calculateValue, PURITIES, SYMBOLS, UNITS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

export default function MeltCheck() {
  const { prices, rates, currency } = useMarket()
  const [metal, setMetal] = useState('Gold')
  const [weight, setWeight] = useState('10')
  const [unit, setUnit] = useState('gram')
  const [purity, setPurity] = useState(PURITIES.Gold[0].value)
  const [askingPrice, setAskingPrice] = useState('')

  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const rate = rates[currency] ?? 1

  const meltValue = prices && prices[metal] != null
    ? calculateValue(Number(weight) || 0, unit, prices[metal] * rate, purity)
    : null
  const asking = Number(askingPrice) || 0
  const markup = meltValue != null && meltValue > 0 && asking > 0 ? ((asking - meltValue) / meltValue) * 100 : null

  return (
    <section className="zakat-page">
      <Seo
        title="Melt vs Retail Markup Checker — MetalCalc"
        description="Check how much markup a jewelry or coin asking price has over its pure melt value, using today's live spot price."
      />
      <div className="container">
        <p className="eyebrow">Melt vs retail</p>
        <h1>Is this asking price fair?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Compares an asking price against the item's pure metal (melt) value — the markup covers craftsmanship, brand and dealer margin.
        </p>

        {!prices && <p className="muted">Loading live prices…</p>}

        {prices && (
          <>
            <div className="card zakat-form">
              <label>
                Metal
                <select
                  value={metal}
                  onChange={(e) => {
                    const m = e.target.value
                    setMetal(m)
                    setPurity(PURITIES[m][0].value)
                  }}
                >
                  {Object.keys(SYMBOLS).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label>
                Weight
                <div className="zakat-input-row">
                  <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    {Object.keys(UNITS).map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </label>
              <label>
                Purity
                <select value={purity} onChange={(e) => setPurity(Number(e.target.value))}>
                  {PURITIES[metal].map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <label>
                Asking price ({currency})
                <input type="number" min="0" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} />
              </label>
            </div>

            <div className="convert-results">
              <div className="result-box">
                <span className="result-label">Melt value ({currency})</span>
                <span className="result-value">{symbol}{(meltValue ?? 0).toFixed(2)}</span>
              </div>
              <div className={`result-box ${markup != null && markup > 0 ? 'zakat-due' : ''}`}>
                <span className="result-label">Markup over melt</span>
                <span className="result-value">{markup == null ? '—' : `${markup >= 0 ? '+' : ''}${markup.toFixed(1)}%`}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

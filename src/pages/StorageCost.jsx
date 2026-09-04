import { useState } from 'react'
import { calculateValue, PURITIES, SYMBOLS, UNITS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

export default function StorageCost() {
  const { prices, rates, currency } = useMarket()
  const [metal, setMetal] = useState('Gold')
  const [weight, setWeight] = useState('100')
  const [unit, setUnit] = useState('gram')
  const [purity, setPurity] = useState(PURITIES.Gold[0].value)
  const [feePct, setFeePct] = useState('1')
  const [years, setYears] = useState('5')

  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const rate = rates[currency] ?? 1

  const value = prices && prices[metal] != null
    ? calculateValue(Number(weight) || 0, unit, prices[metal] * rate, purity)
    : null
  const fee = Number(feePct) || 0
  const yrs = Number(years) || 0
  const totalCost = value != null ? value * (fee / 100) * yrs : null
  const breakEvenAppreciationPct = value != null && value > 0 ? (totalCost / value) * 100 : null

  return (
    <section className="zakat-page">
      <Seo
        title="Storage & Insurance Cost Calculator — MetalCalc"
        description="Estimate the total storage or insurance cost of holding gold or silver over time, and the price appreciation needed to break even."
      />
      <div className="container">
        <p className="eyebrow">Storage cost</p>
        <h1>What does holding this actually cost?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Vault, safe-deposit or insurance fees quietly erode returns. Flat estimate — doesn't compound the fee or account for price changes over the period.
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
                Annual fee (%)
                <input type="number" min="0" step="0.1" value={feePct} onChange={(e) => setFeePct(e.target.value)} />
              </label>
              <label>
                Years held
                <input type="number" min="0" value={years} onChange={(e) => setYears(e.target.value)} />
              </label>
            </div>

            <div className="convert-results">
              <div className="result-box">
                <span className="result-label">Current value ({currency})</span>
                <span className="result-value">{symbol}{(value ?? 0).toFixed(2)}</span>
              </div>
              <div className="result-box">
                <span className="result-label">Total cost over {yrs || 0} yr</span>
                <span className="result-value">{symbol}{(totalCost ?? 0).toFixed(2)}</span>
              </div>
              <div className={`result-box ${breakEvenAppreciationPct ? 'zakat-due' : ''}`}>
                <span className="result-label">Appreciation needed to break even</span>
                <span className="result-value">{breakEvenAppreciationPct == null ? '—' : `${breakEvenAppreciationPct.toFixed(1)}%`}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

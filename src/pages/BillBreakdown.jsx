import { useState } from 'react'
import { calculateValue, PURITIES, SYMBOLS, UNITS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

export default function BillBreakdown() {
  const { prices, rates, currency } = useMarket()
  const [metal, setMetal] = useState('Gold')
  const [weight, setWeight] = useState('10')
  const [unit, setUnit] = useState('gram')
  const [purity, setPurity] = useState(PURITIES.Gold[0].value)
  const [totalBill, setTotalBill] = useState('')

  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const rate = rates[currency] ?? 1

  const meltValue = prices && prices[metal] != null
    ? calculateValue(Number(weight) || 0, unit, prices[metal] * rate, purity)
    : null
  const bill = Number(totalBill) || 0
  const extra = meltValue != null && bill > 0 ? bill - meltValue : null
  const extraPct = meltValue != null && meltValue > 0 && bill > 0 ? (extra / meltValue) * 100 : null

  return (
    <section className="zakat-page">
      <Seo
        title="Jewelry Bill Breakdown Calculator — MetalCalc"
        description="Enter your total jewelry bill and item weight/purity to reveal the implied making charges and tax over pure metal value."
      />
      <div className="container">
        <p className="eyebrow">Bill breakdown</p>
        <h1>What's really in your jewelry bill?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Reveals the combined making charge + tax hidden in a lump-sum total, against today's melt value.
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
                Total bill ({currency})
                <input type="number" min="0" value={totalBill} onChange={(e) => setTotalBill(e.target.value)} />
              </label>
            </div>

            <div className="convert-results">
              <div className="result-box">
                <span className="result-label">Pure melt value</span>
                <span className="result-value">{symbol}{(meltValue ?? 0).toFixed(2)}</span>
              </div>
              <div className="result-box">
                <span className="result-label">Making charge + tax ({currency})</span>
                <span className="result-value">{extra == null ? '—' : `${symbol}${extra.toFixed(2)}`}</span>
              </div>
              <div className={`result-box ${extraPct != null && extraPct > 25 ? 'zakat-due' : ''}`}>
                <span className="result-label">As % of melt value</span>
                <span className="result-value">{extraPct == null ? '—' : `${extraPct.toFixed(1)}%`}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

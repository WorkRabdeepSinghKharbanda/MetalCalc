import { useState } from 'react'
import { calculateValue, PURITIES, SYMBOLS, UNITS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

const LTV_PRESETS = [
  { label: 'Conservative (60%)', value: 60 },
  { label: 'Typical (75%)', value: 75 },
  { label: 'Max (90%)', value: 90 },
]

export default function LoanAgainstGold() {
  const { prices, rates, currency } = useMarket()
  const [metal, setMetal] = useState('Gold')
  const [weight, setWeight] = useState('10')
  const [unit, setUnit] = useState('gram')
  const [purity, setPurity] = useState(PURITIES.Gold[0].value)
  const [ltv, setLtv] = useState(75)

  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const rate = rates[currency] ?? 1

  const value = prices && prices[metal] != null
    ? calculateValue(Number(weight) || 0, unit, prices[metal] * rate, purity)
    : null
  const maxLoan = value != null ? (value * ltv) / 100 : null

  return (
    <section className="zakat-page">
      <Seo
        title="Loan Against Gold Calculator — MetalCalc"
        description="Estimate the maximum loan amount a lender might offer against your gold or silver, based on live spot value and loan-to-value ratio."
      />
      <div className="container">
        <p className="eyebrow">Loan against gold</p>
        <h1>What could I borrow against this?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Estimate only — actual lender LTV, purity assessment and making-charge deductions vary. Uses today's live spot price.
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
                Loan-to-value
                <select value={ltv} onChange={(e) => setLtv(Number(e.target.value))}>
                  {LTV_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
            </div>

            <div className="convert-results">
              <div className="result-box">
                <span className="result-label">Metal value ({currency})</span>
                <span className="result-value">{symbol}{(value ?? 0).toFixed(2)}</span>
              </div>
              <div className={`result-box ${maxLoan ? 'zakat-due' : ''}`}>
                <span className="result-label">Est. max loan ({ltv}% LTV)</span>
                <span className="result-value">{symbol}{(maxLoan ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

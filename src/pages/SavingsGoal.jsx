import { useState } from 'react'
import { GRAMS_PER_TROY_OZ, SYMBOLS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import Seo from '../components/Seo.jsx'

export default function SavingsGoal() {
  const { prices, rates, currency } = useMarket()
  const [metal, setMetal] = useState('Gold')
  const [monthly, setMonthly] = useState('100')
  const [targetGrams, setTargetGrams] = useState('50')

  const rate = rates[currency] ?? 1
  const pricePerGram = prices ? (prices[metal] * rate) / GRAMS_PER_TROY_OZ : 0

  const gramsPerMonth = pricePerGram > 0 ? (Number(monthly) || 0) / pricePerGram : 0
  const monthsNeeded = gramsPerMonth > 0 ? (Number(targetGrams) || 0) / gramsPerMonth : null
  const years = monthsNeeded != null ? monthsNeeded / 12 : null

  return (
    <section className="zakat-page">
      <Seo
        title="Gold Savings Goal Calculator — MetalCalc"
        description="See how long it takes to reach a gold or silver weight goal at a fixed monthly savings amount, using today's live price."
      />
      <div className="container">
        <p className="eyebrow">Savings goal</p>
        <h1>How long to reach my goal?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Assumes today's price stays constant — a rough estimate, not a forecast.
        </p>

        {!prices && <p className="muted">Loading live prices…</p>}

        {prices && (
          <>
            <div className="card zakat-form">
              <label>
                Metal
                <select value={metal} onChange={(e) => setMetal(e.target.value)}>
                  {Object.keys(SYMBOLS).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label>
                Monthly savings ({currency})
                <input type="number" min="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
              </label>
              <label>
                Target weight (grams)
                <input type="number" min="0" value={targetGrams} onChange={(e) => setTargetGrams(e.target.value)} />
              </label>
            </div>

            <div className="convert-results">
              <div className="result-box">
                <span className="result-label">Grams bought per month</span>
                <span className="result-value">{gramsPerMonth.toFixed(3)}g</span>
              </div>
              <div className="result-box">
                <span className="result-label">Time to goal</span>
                <span className="result-value">
                  {monthsNeeded == null ? '—' : `${Math.ceil(monthsNeeded)} mo (~${years.toFixed(1)} yr)`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

import { useState } from 'react'
import { UNITS } from '../calc.js'
import Seo from '../components/Seo.jsx'

export default function WeightConverter() {
  const [amount, setAmount] = useState('1')
  const [unit, setUnit] = useState('oz')

  const grams = (Number(amount) || 0) * UNITS[unit]

  return (
    <section className="convert-page">
      <Seo
        title="Weight Unit Converter — Gram, Oz, Tola, Kg — MetalCalc"
        description="Convert precious metal weight between grams, troy ounces, kilograms, tola and dwt."
      />
      <div className="container">
        <p className="eyebrow">Weight converter</p>
        <h1>Convert gram, oz, tola, kg &amp; dwt</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Handy for reading jewelry receipts and coin listings that use different weight units.
        </p>

        <div className="card convert-form">
          <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            {Object.keys(UNITS).map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="convert-results">
          {Object.keys(UNITS).map((u) => (
            <div key={u} className="result-box">
              <span className="result-label">{u}</span>
              <span className="result-value">{(grams / UNITS[u]).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

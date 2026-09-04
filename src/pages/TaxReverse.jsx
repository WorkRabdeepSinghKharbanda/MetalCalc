import { useState } from 'react'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

const PRESETS = [
  { label: 'India GST (3%)', value: 3 },
  { label: 'UK VAT (20%)', value: 20 },
  { label: 'EU VAT (~21%)', value: 21 },
  { label: 'Custom', value: '' },
]

export default function TaxReverse() {
  const { currency } = useMarket()
  const [finalPrice, setFinalPrice] = useState('1000')
  const [taxRate, setTaxRate] = useState(3)

  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const final = Number(finalPrice) || 0
  const rate = Number(taxRate) || 0
  const basePrice = final / (1 + rate / 100)
  const taxAmount = final - basePrice

  return (
    <section className="zakat-page">
      <Seo
        title="Tax / GST Reverse Calculator — MetalCalc"
        description="Back out the base price and tax amount from a final tax-inclusive price on a gold or silver purchase."
      />
      <div className="container">
        <p className="eyebrow">Tax reverse calculator</p>
        <h1>Back out the tax from a final price</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Useful when a receipt only shows the tax-inclusive total.
        </p>

        <div className="card zakat-form">
          <label>
            Final price ({currency})
            <input type="number" min="0" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} />
          </label>
          <label>
            Tax rate
            <select value={taxRate} onChange={(e) => setTaxRate(e.target.value)}>
              {PRESETS.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          {!PRESETS.some((p) => String(p.value) === String(taxRate)) || taxRate === '' ? (
            <label>
              Custom rate (%)
              <input type="number" min="0" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </label>
          ) : null}
        </div>

        <div className="convert-results">
          <div className="result-box">
            <span className="result-label">Base price (excl. tax)</span>
            <span className="result-value">{symbol}{basePrice.toFixed(2)}</span>
          </div>
          <div className="result-box">
            <span className="result-label">Tax amount</span>
            <span className="result-value">{symbol}{taxAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

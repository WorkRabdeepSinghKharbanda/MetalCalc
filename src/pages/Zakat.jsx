import { useState } from 'react'
import { UNITS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

// Standard nisab threshold (pure silver weight — lower, more inclusive than gold's)
const SILVER_NISAB_GRAMS = 612.36
const ZAKAT_RATE = 0.025

export default function Zakat() {
  const { prices, rates, currency } = useMarket()
  const [goldWeight, setGoldWeight] = useState('')
  const [goldUnit, setGoldUnit] = useState('gram')
  const [silverWeight, setSilverWeight] = useState('')
  const [silverUnit, setSilverUnit] = useState('gram')
  const [cash, setCash] = useState('')

  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const rate = rates[currency] ?? 1

  const goldGrams = (Number(goldWeight) || 0) * UNITS[goldUnit]
  const silverGrams = (Number(silverWeight) || 0) * UNITS[silverUnit]
  const goldPerGram = prices ? (prices.Gold * rate) / UNITS.oz : 0
  const silverPerGram = prices ? (prices.Silver * rate) / UNITS.oz : 0

  const goldValue = goldGrams * goldPerGram
  const silverValue = silverGrams * silverPerGram
  const cashValue = Number(cash) || 0
  const totalWealth = goldValue + silverValue + cashValue

  // Silver nisab is the standard threshold (lower, more inclusive of the poor)
  const nisabValue = SILVER_NISAB_GRAMS * silverPerGram
  const meetsNisab = prices && totalWealth >= nisabValue
  const zakatDue = meetsNisab ? totalWealth * ZAKAT_RATE : 0

  return (
    <section className="zakat-page">
      <Seo
        title="Zakat Calculator — Gold, Silver & Cash — MetalCalc"
        description="Calculate zakat due on gold, silver and cash using today's live metal prices and the standard silver nisab threshold."
      />
      <div className="container">
        <p className="eyebrow">Zakat calculator</p>
        <h1>Calculate zakat on your wealth</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Uses today's live gold and silver prices. Nisab is based on {SILVER_NISAB_GRAMS}g of silver — the
          standard, more inclusive threshold. Zakat rate is 2.5% of total zakatable wealth.
        </p>

        {!prices && <p className="muted">Loading live prices…</p>}

        {prices && (
          <>
            <div className="card zakat-form">
              <label>
                Gold you own
                <div className="zakat-input-row">
                  <input type="number" min="0" placeholder="Weight" value={goldWeight} onChange={(e) => setGoldWeight(e.target.value)} />
                  <select value={goldUnit} onChange={(e) => setGoldUnit(e.target.value)}>
                    {Object.keys(UNITS).map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </label>
              <label>
                Silver you own
                <div className="zakat-input-row">
                  <input type="number" min="0" placeholder="Weight" value={silverWeight} onChange={(e) => setSilverWeight(e.target.value)} />
                  <select value={silverUnit} onChange={(e) => setSilverUnit(e.target.value)}>
                    {Object.keys(UNITS).map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </label>
              <label>
                Cash &amp; savings ({currency})
                <input type="number" min="0" placeholder="0" value={cash} onChange={(e) => setCash(e.target.value)} />
              </label>
            </div>

            <div className="convert-results">
              <div className="result-box">
                <span className="result-label">Total zakatable wealth</span>
                <span className="result-value">{symbol}{totalWealth.toFixed(2)}</span>
              </div>
              <div className="result-box">
                <span className="result-label">Nisab threshold</span>
                <span className="result-value">{symbol}{nisabValue.toFixed(2)}</span>
              </div>
              <div className={`result-box ${meetsNisab ? 'zakat-due' : ''}`}>
                <span className="result-label">Zakat due (2.5%)</span>
                <span className="result-value">{symbol}{zakatDue.toFixed(2)}</span>
              </div>
            </div>

            {!meetsNisab && (
              <p className="muted">Your wealth is below the nisab threshold — no zakat is due.</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

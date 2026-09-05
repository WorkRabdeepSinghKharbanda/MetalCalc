import { useState } from 'react'
import { computePositionSize } from '../utils/positionSize.js'
import Seo from '../components/Seo.jsx'

const RISK_PRESETS = [0.5, 1, 2]

export default function PositionSize() {
  const [accountSize, setAccountSize] = useState('10000')
  const [riskPct, setRiskPct] = useState(1)
  const [entryPrice, setEntryPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')

  const { riskAmount, shares, positionValue, pctOfAccount } = computePositionSize(
    Number(accountSize) || 0,
    Number(riskPct) || 0,
    Number(entryPrice) || 0,
    Number(stopPrice) || 0
  )

  return (
    <section className="zakat-page">
      <Seo
        title="Position Size / Risk Calculator — Stocks & Crypto — MetalCalc"
        description="Fixed-fractional position sizing for stocks or crypto — risk a set % of your account per trade and size the position off your stop-loss."
      />
      <div className="container">
        <p className="eyebrow">Position sizing</p>
        <h1>How many shares/coins should I buy?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Fixed-fractional sizing — risk a set % of your account, sized against your stop-loss distance. Works for stocks or crypto.
        </p>

        <div className="card zakat-form">
          <label>
            Account size ($)
            <input type="number" min="0" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} />
          </label>
          <label>
            Risk per trade
            <select value={riskPct} onChange={(e) => setRiskPct(e.target.value)}>
              {RISK_PRESETS.map((p) => <option key={p} value={p}>{p}%</option>)}
            </select>
          </label>
          <label>
            Entry price ($)
            <input type="number" min="0" step="any" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} />
          </label>
          <label>
            Stop-loss price ($)
            <input type="number" min="0" step="any" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} />
          </label>
        </div>

        <div className="convert-results">
          <div className="result-box">
            <span className="result-label">Amount at risk</span>
            <span className="result-value">${riskAmount.toFixed(2)}</span>
          </div>
          <div className="result-box">
            <span className="result-label">Shares / coins to buy</span>
            <span className="result-value">{shares.toFixed(shares < 1 ? 6 : 2)}</span>
          </div>
          <div className="result-box">
            <span className="result-label">Position value</span>
            <span className="result-value">${positionValue.toFixed(2)}</span>
          </div>
          <div className={`result-box ${pctOfAccount > 50 ? 'zakat-due' : ''}`}>
            <span className="result-label">% of account</span>
            <span className="result-value">{pctOfAccount.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

const NON_USD = ['INR', 'EUR', 'GBP', 'JPY']

export default function RateCheck() {
  const { rates } = useMarket()
  const [currency, setCurrency] = useState('INR')
  const [dealerRate, setDealerRate] = useState('')
  const [usdAmount, setUsdAmount] = useState('1000')

  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const liveRate = rates[currency] ?? null
  const dealer = Number(dealerRate) || 0
  const spread = liveRate && dealer > 0 ? ((dealer - liveRate) / liveRate) * 100 : null
  const amount = Number(usdAmount) || 0
  const hiddenCost = liveRate && dealer > 0 ? amount * (liveRate - dealer) : null

  return (
    <section className="zakat-page">
      <Seo
        title="Exchange Rate Margin Checker — MetalCalc"
        description="Compare a dealer's quoted exchange rate against today's live mid-market rate to see the hidden spread on a currency conversion."
      />
      <div className="container">
        <p className="eyebrow">Exchange rate check</p>
        <h1>What's the dealer's real margin?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Compares a quoted rate against today's live mid-market rate — the gap is the dealer's hidden margin.
        </p>

        {!liveRate && <p className="muted">Loading live rates…</p>}

        {liveRate && (
          <>
            <div className="card zakat-form">
              <label>
                Currency
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {NON_USD.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                Dealer's quoted rate (1 USD = ? {currency})
                <input type="number" min="0" step="0.01" value={dealerRate} onChange={(e) => setDealerRate(e.target.value)} />
              </label>
              <label>
                Amount to convert (USD)
                <input type="number" min="0" value={usdAmount} onChange={(e) => setUsdAmount(e.target.value)} />
              </label>
            </div>

            <div className="convert-results">
              <div className="result-box">
                <span className="result-label">Live mid-market rate</span>
                <span className="result-value">{liveRate.toFixed(4)} {currency}</span>
              </div>
              <div className={`result-box ${spread != null && spread > 0 ? 'zakat-due' : ''}`}>
                <span className="result-label">Dealer spread</span>
                <span className="result-value">{spread == null ? '—' : `${spread >= 0 ? '+' : ''}${spread.toFixed(2)}%`}</span>
              </div>
              <div className="result-box">
                <span className="result-label">Hidden cost on this amount</span>
                <span className="result-value">
                  {hiddenCost == null ? '—' : `${symbol}${hiddenCost.toFixed(2)}`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { getMarketChart } from '../crypto/client.js'
import { simulateDca } from '../utils/dcaSimulator.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

const LOOKBACKS = [
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]
const PERIODS = [
  { label: 'Daily', days: 1 },
  { label: 'Weekly', days: 7 },
  { label: 'Monthly', days: 30 },
]

export default function DcaSimulator({ coinId }) {
  const { currency, rates } = useMarket()
  const rate = rates[currency] ?? 1
  const cSymbol = CURRENCY_SYMBOLS[currency] ?? '$'
  const fmtC = (usd) => (usd == null || Number.isNaN(usd) ? '—' : `${cSymbol}${fmt(usd * rate)}`)

  const [amount, setAmount] = useState(50)
  const [lookback, setLookback] = useState(90)
  const [period, setPeriod] = useState(7)
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!coinId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getMarketChart(coinId, lookback)
      .then((data) => !cancelled && setPrices(data?.prices ?? []))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [coinId, lookback])

  const result = prices.length > 0 && Number(amount) > 0 ? simulateDca(prices, Number(amount), period) : null

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>What if you'd DCA'd this?</h3>
      <p className="muted small-note">
        Backtests a fixed recurring buy against this coin's real price history. Capped at 90 days —
        CoinGecko's free tier doesn't give longer history. Not a prediction, not financial advice.
      </p>
      <div className="stock-add-form">
        <label>
          Amount per buy ($)
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          Frequency
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            {PERIODS.map((p) => (
              <option key={p.days} value={p.days}>{p.label}</option>
            ))}
          </select>
        </label>
        <label>
          Lookback
          <select value={lookback} onChange={(e) => setLookback(Number(e.target.value))}>
            {LOOKBACKS.map((l) => (
              <option key={l.days} value={l.days}>{l.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="muted">Loading price history…</p>}
      {error && <p className="error">{error}</p>}

      {result && (
        <div className="convert-results" style={{ marginTop: '1rem' }}>
          <div className="result-box">
            <span className="result-label">Total invested ({result.buys.length} buys)</span>
            <span className="result-value">{fmtC(result.totalInvested)}</span>
          </div>
          <div className="result-box">
            <span className="result-label">Current value</span>
            <span className="result-value">{fmtC(result.finalValue)}</span>
          </div>
          <div className="result-box">
            <span className="result-label">Gain/Loss</span>
            <span className={`result-value ${result.gain >= 0 ? 'arrow up' : 'arrow down'}`}>
              {result.gain >= 0 ? '+' : ''}{fmtC(result.gain)} ({result.gainPct >= 0 ? '+' : ''}{fmt(result.gainPct)}%)
            </span>
          </div>
          <div className="result-box">
            <span className="result-label">Avg buy price vs lump sum</span>
            <span className="result-value">{fmtC(result.avgBuyPrice)}</span>
            <span className="muted small-note">
              Investing it all on day 1 instead would be worth {fmtC(result.lumpValue)} today.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

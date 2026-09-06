import { calculateValue } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import { loadHoldings } from '../utils/holdings.js'
import { loadPortfolio } from '../utils/stockPortfolio.js'
import { loadCryptoPortfolio } from '../utils/cryptoPortfolio.js'
import { useQuotes } from '../hooks/useQuotes.js'
import { useCryptoQuotes } from '../hooks/useCryptoQuotes.js'
import Seo from '../components/Seo.jsx'
import PrintHeader from '../components/PrintHeader.jsx'
import PrintFooter from '../components/PrintFooter.jsx'
import LastUpdated from '../components/LastUpdated.jsx'

function fmt(n) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function NetWorth() {
  const { prices, rates, currency, updatedAt: metalsUpdatedAt } = useMarket()
  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const rate = rates[currency] ?? 1

  const holdings = loadHoldings()
  const stockPortfolio = loadPortfolio()
  const cryptoPortfolio = loadCryptoPortfolio()

  const { quotes: stockQuotes, updatedAt: stocksUpdatedAt } = useQuotes(stockPortfolio.map((p) => p.symbol))
  const { quotes: cryptoQuotes, updatedAt: cryptoUpdatedAt } = useCryptoQuotes(cryptoPortfolio.map((p) => p.coinId))

  const metalsValue = prices
    ? holdings.reduce((sum, it) => {
        if (prices[it.metal] == null) return sum
        return sum + calculateValue(Number(it.weight) || 0, it.unit, prices[it.metal] * rate, it.purity)
      }, 0)
    : 0

  const stocksValue = stockPortfolio.reduce((sum, p) => {
    const ltpUsd = stockQuotes[p.symbol]?.c ?? p.avgBuy
    return sum + p.qty * ltpUsd * rate
  }, 0)

  const cryptoValue = cryptoPortfolio.reduce((sum, p) => {
    const ltpUsd = cryptoQuotes[p.coinId] ?? p.avgBuy
    return sum + p.qty * ltpUsd * rate
  }, 0)

  const total = metalsValue + stocksValue + cryptoValue
  const rows = [
    { label: 'Precious metals', value: metalsValue, empty: holdings.length === 0, updatedAt: metalsUpdatedAt },
    { label: 'Stocks', value: stocksValue, empty: stockPortfolio.length === 0, updatedAt: stocksUpdatedAt },
    { label: 'Crypto', value: cryptoValue, empty: cryptoPortfolio.length === 0, updatedAt: cryptoUpdatedAt },
  ]

  return (
    <section className="zakat-page">
      <Seo
        title="Net Worth Dashboard — MetalCalc"
        description="See your combined net worth across precious metals, stocks and crypto in one place, using your saved Holdings and portfolios."
      />
      <PrintHeader title="Net Worth Summary" />
      <div className="container">
        <p className="eyebrow no-print">Net worth</p>
        <h1>Everything you own, in one number</h1>
        <p className="hero-sub no-print" style={{ marginBottom: '2rem' }}>
          Pulls from your saved Holdings, Stock portfolio and Crypto portfolio — nothing new to enter here.
        </p>

        <div className="result-box" style={{ marginBottom: '1.5rem' }}>
          <span className="result-label">Total net worth ({currency})</span>
          <span className="result-value" style={{ fontSize: '2rem' }}>{symbol}{fmt(total)}</span>
        </div>

        <div className="convert-results">
          {rows.map((r) => (
            <div key={r.label} className="result-box">
              <span className="result-label">{r.label}</span>
              <span className="result-value">
                {r.empty ? '—' : `${symbol}${fmt(r.value)}`}
              </span>
              {!r.empty && total > 0 && (
                <span className="muted small-note">{((r.value / total) * 100).toFixed(1)}% of total</span>
              )}
              {!r.empty && <LastUpdated timestamp={r.updatedAt} />}
            </div>
          ))}
        </div>

        {holdings.length === 0 && stockPortfolio.length === 0 && cryptoPortfolio.length === 0 && (
          <p className="muted">
            Add items to Holdings, the Stocks portfolio, or the Crypto portfolio to see them combined here.
          </p>
        )}

        <button className="btn btn-primary no-print" style={{ marginTop: '1.5rem' }} onClick={() => window.print()}>
          🖨 Print / Save PDF
        </button>
        <PrintFooter />
      </div>
    </section>
  )
}

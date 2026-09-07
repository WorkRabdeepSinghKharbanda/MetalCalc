import { Link } from 'react-router-dom'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import Seo from '../components/Seo.jsx'

function fmt(n) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const FAQS = [
  {
    q: 'Which is more volatile, gold or silver?',
    a: "Silver historically. It has a smaller, more industrially-driven market, so it tends to swing harder in both directions than gold — bigger gains in rallies, deeper drops in selloffs.",
  },
  {
    q: 'What is the gold-silver ratio and why does it matter?',
    a: "It's spot gold price ÷ spot silver price — how many ounces of silver equal one ounce of gold. A historically high ratio has sometimes been read as silver being cheap relative to gold, and vice versa, though it's not a reliable timing signal on its own.",
  },
  {
    q: 'Which is more liquid?',
    a: 'Gold, generally — tighter bid/ask spreads and wider acceptance for resale, especially outside major markets. Silver bars/coins can carry a wider dealer spread.',
  },
  {
    q: 'Can I track both in one place?',
    a: 'Yes — add both to My Holdings with your quantities and cost basis to see combined value, gain/loss, and a diversification score across your metals.',
  },
]

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function GoldVsSilverInvestment() {
  const { prices, rates, currency } = useMarket()
  const rate = rates[currency] ?? 1
  const symbol = CURRENCY_SYMBOLS[currency] ?? ''
  const ratio = prices ? prices.Gold / prices.Silver : null

  return (
    <section className="zakat-page">
      <Seo
        title="Gold vs Silver: Which Should You Invest In? | MetalCalc"
        description="A practical comparison of gold vs silver as an investment — volatility, liquidity, the gold-silver ratio, and how to track both."
        jsonLd={FAQ_JSON_LD}
      />
      <div className="container">
        <p className="eyebrow">Guide</p>
        <h1>Gold vs silver: which should you invest in?</h1>
        <p className="hero-sub" style={{ marginBottom: '1.5rem' }}>
          Neither is strictly "better" — they behave differently, and the honest answer depends on what you're
          optimizing for.
        </p>

        {prices && (
          <div className="result-box no-print" style={{ marginBottom: '1.5rem' }}>
            <span className="result-label">Current gold-silver ratio</span>
            <span className="result-value">{fmt(ratio)}</span>
            <span className="muted small-note">
              1 oz of gold ({symbol}{fmt(prices.Gold * rate)}) currently buys about {fmt(ratio)} oz of silver
              ({symbol}{fmt(prices.Silver * rate)}/oz).
            </span>
          </div>
        )}

        <div className="table-scroll" style={{ marginBottom: '1.5rem' }}>
          <table className="stock-table">
            <thead>
              <tr>
                <th></th>
                <th>Gold</th>
                <th>Silver</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="muted">Volatility</td><td>Lower</td><td>Higher</td></tr>
              <tr><td className="muted">Liquidity / resale spread</td><td>Tighter</td><td>Wider</td></tr>
              <tr><td className="muted">Industrial demand exposure</td><td>Low</td><td>Higher (electronics, solar)</td></tr>
              <tr><td className="muted">Storage for same value</td><td>Compact</td><td>Bulkier</td></tr>
              <tr><td className="muted">Typical role</td><td>Store of value / hedge</td><td>Higher-beta metals bet</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="section-title">Common questions</h2>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <p className="muted small-note" style={{ marginTop: '1.5rem' }}>
          This is general information, not investment advice. Track both at{' '}
          <Link to="/gold-rate-today">today's rates</Link>, and log your own holdings on{' '}
          <Link to="/holdings">My Holdings</Link> to see a real diversification score.
        </p>
      </div>
    </section>
  )
}

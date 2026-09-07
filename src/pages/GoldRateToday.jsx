import { Link } from 'react-router-dom'
import { calculateValue, SYMBOLS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCIES, CURRENCY_SYMBOLS } from '../utils/currency.js'
import LastUpdated from '../components/LastUpdated.jsx'
import Seo from '../components/Seo.jsx'

function fmt(n) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const FAQS = [
  {
    q: "What is today's gold rate?",
    a: 'The table above shows the live international spot rate for 24k (.999 fine) gold, converted to your selected currency, updated from gold-api.com in real time.',
  },
  {
    q: 'Is this the same as my local jeweler\'s rate?',
    a: 'No — this is the raw international spot price. Local jewelers add making charges, taxes and a retail margin on top. Use the Purity Converter or Bill Breakdown tool to see how those add up.',
  },
  {
    q: 'How is the price per gram calculated?',
    a: 'Spot gold is quoted per troy ounce (31.1034768 grams). Price per gram = spot price ÷ 31.1034768, then multiplied by purity for karats below 24k.',
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

export default function GoldRateToday() {
  const { prices, rates, currency, setCurrency, loading, error, updatedAt } = useMarket()
  const rate = rates[currency] ?? 1
  const symbol = CURRENCY_SYMBOLS[currency] ?? ''

  return (
    <section className="zakat-page">
      <Seo
        title="Gold Rate Today — Live Price Per Gram, 10g & Ounce | MetalCalc"
        description="Today's live gold rate per gram, 10 grams and troy ounce in USD, INR, EUR, GBP and JPY — updated in real time from international spot prices."
        jsonLd={FAQ_JSON_LD}
      />
      <div className="container">
        <p className="eyebrow">Gold rate today</p>
        <h1>Live gold rate — per gram, 10g &amp; troy ounce</h1>
        <p className="hero-sub" style={{ marginBottom: '1.5rem' }}>
          International spot price for 24k (.999 fine) gold, converted to your currency in real time. For jewelry
          purity (22k, 18k, etc.) or a full valuation, use the{' '}
          <Link to="/convert">Purity Converter</Link> or <Link to="/batch">Batch Calculator</Link>.
        </p>

        {loading && !prices && <p className="muted">Loading live gold rate…</p>}
        {error && <p className="error">{error}</p>}

        {prices && (
          <>
            <div className="segmented" style={{ marginBottom: '1.5rem' }}>
              {CURRENCIES.map((c) => (
                <button key={c} className={c === currency ? 'active' : ''} onClick={() => setCurrency(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className="convert-results" style={{ marginBottom: '1rem' }}>
              <div className="result-box">
                <span className="result-label">Per gram (24k)</span>
                <span className="result-value">
                  {symbol}{fmt(calculateValue(1, 'gram', prices.Gold * rate, 0.999))}
                </span>
              </div>
              <div className="result-box">
                <span className="result-label">Per 10 grams (24k)</span>
                <span className="result-value">
                  {symbol}{fmt(calculateValue(10, 'gram', prices.Gold * rate, 0.999))}
                </span>
              </div>
              <div className="result-box">
                <span className="result-label">Per troy ounce (24k)</span>
                <span className="result-value">
                  {symbol}{fmt(calculateValue(1, 'oz', prices.Gold * rate, 0.999))}
                </span>
              </div>
            </div>
            <LastUpdated timestamp={updatedAt} />
          </>
        )}

        <h2 className="section-title" style={{ marginTop: '2.5rem' }}>Common questions</h2>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <p className="muted small-note" style={{ marginTop: '1.5rem' }}>
          Want silver, platinum or palladium too, or a full portfolio valuation? See the{' '}
          <Link to="/">Home page</Link> ticker or track what you own on <Link to="/holdings">My Holdings</Link>.
        </p>
      </div>
    </section>
  )
}

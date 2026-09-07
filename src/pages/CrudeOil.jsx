import { hasApiKey } from '../finnhub/client.js'
import { useQuotes } from '../hooks/useQuotes.js'
import { useCrudeNews } from '../hooks/useCrudeNews.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import LastUpdated from '../components/LastUpdated.jsx'
import Seo from '../components/Seo.jsx'

const PROXIES = [
  { symbol: 'USO', label: 'WTI Crude (USO ETF proxy)' },
  { symbol: 'BNO', label: 'Brent Crude (BNO ETF proxy)' },
]

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function CrudeOil() {
  const { currency, rates } = useMarket()
  const rate = rates[currency] ?? 1
  const cSymbol = CURRENCY_SYMBOLS[currency] ?? '$'
  const fmtC = (usd) => (usd == null || Number.isNaN(usd) ? '—' : `${cSymbol}${fmt(usd * rate)}`)

  const { quotes, updatedAt: quotesUpdatedAt } = useQuotes(PROXIES.map((p) => p.symbol))
  const { articles, loading: newsLoading, error: newsError, updatedAt: newsUpdatedAt } = useCrudeNews()

  if (!hasApiKey) {
    return (
      <section className="stocks-page">
        <div className="container">
          <p className="eyebrow">Crude Oil</p>
          <h1>Crude oil data needs an API key</h1>
          <div className="card alert-permission">
            <p>
              This page uses Finnhub for price/news. Sign up free at{' '}
              <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer">finnhub.io/register</a>,
              grab your key from the dashboard, and set <code>VITE_FINNHUB_API_KEY</code> in this project's environment.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="stocks-page">
      <Seo
        title="Crude Oil — MetalCalc"
        description="WTI and Brent crude oil price proxies (via oil ETFs) and recent oil-market news, filtered from general market headlines."
      />
      <div className="container">
        <p className="eyebrow">Crude Oil</p>
        <h1>Crude oil price &amp; news</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Finnhub's free tier has no direct commodities feed, so price is tracked via the two most liquid oil
          ETFs (a proxy, not the literal spot/futures price) and news is the general market feed filtered for
          oil-related keywords.
        </p>

        <div className="convert-results" style={{ marginBottom: '1.5rem' }}>
          {PROXIES.map((p) => {
            const q = quotes[p.symbol]
            return (
              <div key={p.symbol} className="result-box">
                <span className="result-label">{p.label}</span>
                <span className="result-value">{q ? fmtC(q.c) : '—'}</span>
                {q?.dp != null && (
                  <span className={q.dp >= 0 ? 'arrow up' : 'arrow down'}>
                    {q.dp >= 0 ? '▲' : '▼'} {fmt(Math.abs(q.dp))}%
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <LastUpdated timestamp={quotesUpdatedAt} />

        <h2 className="section-title" style={{ marginTop: '2rem' }}>Recent oil-market news</h2>
        <p className="muted small-note" style={{ marginBottom: '1rem' }}>
          Filtered from Finnhub's general market news feed by keyword (oil, crude, OPEC, WTI, Brent) — not a
          curated commodities news source.
        </p>
        {newsLoading && articles.length === 0 && <p className="muted">Loading news…</p>}
        {newsError && <p className="error">{newsError}</p>}
        {!newsLoading && articles.length === 0 && !newsError && (
          <p className="muted">No oil-related headlines in the current general news feed.</p>
        )}
        {articles.length > 0 && (
          <ul className="signal-list">
            {articles.map((a) => (
              <li key={a.id ?? a.url}>
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  <strong>{a.headline}</strong>
                </a>
                <span className="muted small-note">
                  {a.source} · {a.datetime ? new Date(a.datetime * 1000).toLocaleString() : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
        <LastUpdated timestamp={newsUpdatedAt} />
      </div>
    </section>
  )
}

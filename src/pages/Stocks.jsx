import { useState } from 'react'
import { hasApiKey } from '../finnhub/client.js'
import { useSymbolSearch } from '../hooks/useSymbolSearch.js'
import { useStockData } from '../hooks/useStockData.js'
import { useQuotes } from '../hooks/useQuotes.js'
import { useStockRankings } from '../hooks/useStockRankings.js'
import { loadPortfolio, savePortfolio } from '../utils/stockPortfolio.js'
import { loadWatchlist, saveWatchlist } from '../utils/stockWatchlist.js'
import { rankByPeg } from '../utils/rankStocks.js'
import StockPriceChart from '../components/StockPriceChart.jsx'
import TechRankingsTable from '../components/TechRankingsTable.jsx'
import StockTradeSignalsSection from '../components/StockTradeSignalsSection.jsx'
import WhatsAppAlerts from '../components/WhatsAppAlerts.jsx'
import Seo from '../components/Seo.jsx'
import { useToast } from '../context/ToastContext.jsx'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function Stocks() {
  const showToast = useToast()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(1)
  const [avgBuy, setAvgBuy] = useState('')
  const [portfolio, setPortfolio] = useState(() => loadPortfolio())
  const [watchlist, setWatchlist] = useState(() => loadWatchlist())

  const { results } = useSymbolSearch(query)
  const { data, loading, error } = useStockData(selected?.symbol)
  const symbols = [...new Set([...portfolio.map((p) => p.symbol), ...watchlist.map((w) => w.symbol)])]
  const { quotes } = useQuotes(symbols)
  const { rows: rankingRows, loading: rankingsLoading, error: rankingsError } = useStockRankings()
  const topPick = rankByPeg(rankingRows).find((r) => r.peg != null) ?? null

  function selectResult(r) {
    setSelected({ symbol: r.symbol, name: r.description })
    setQuery('')
  }

  function addToPortfolio() {
    if (!selected || !avgBuy || Number(avgBuy) <= 0 || Number(qty) <= 0) return
    const next = [
      ...portfolio,
      { id: crypto.randomUUID(), symbol: selected.symbol, name: selected.name, qty: Number(qty), avgBuy: Number(avgBuy) },
    ]
    setPortfolio(savePortfolio(next))
    showToast(`Added ${selected.symbol} to portfolio`)
    setAvgBuy('')
    setQty(1)
  }

  function removeFromPortfolio(id) {
    setPortfolio(savePortfolio(portfolio.filter((p) => p.id !== id)))
  }

  const isWatched = selected && watchlist.some((w) => w.symbol === selected.symbol)

  function toggleWatch() {
    if (!selected) return
    if (isWatched) {
      setWatchlist(saveWatchlist(watchlist.filter((w) => w.symbol !== selected.symbol)))
    } else {
      setWatchlist(saveWatchlist([...watchlist, { symbol: selected.symbol, name: selected.name }]))
      showToast(`Watching ${selected.symbol}`)
    }
  }

  function removeFromWatchlist(symbol) {
    setWatchlist(saveWatchlist(watchlist.filter((w) => w.symbol !== symbol)))
  }

  const totalPresent = portfolio.reduce((sum, p) => sum + (quotes[p.symbol]?.c ?? p.avgBuy) * p.qty, 0)

  if (!hasApiKey) {
    return (
      <section className="stocks-page">
        <div className="container">
          <p className="eyebrow">US Stocks</p>
          <h1>Stock data needs an API key</h1>
          <div className="card alert-permission">
            <p>
              This page uses Finnhub for quotes and fundamentals. Sign up free at{' '}
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
      <Seo title="US Stocks — MetalCalc" description="Search US stocks, view fundamentals (PE, PEG, EPS, growth), and track your portfolio." />
      <div className="container">
        <p className="eyebrow">US Stocks</p>
        <h1>Search stocks &amp; track your portfolio</h1>

        <div className="stock-search">
          <input
            type="text"
            placeholder="Search by ticker or company name (e.g. AAPL, Apple)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div className="stock-search-results">
              {results.map((r) => (
                <button key={r.symbol} className="stock-search-item" onClick={() => selectResult(r)}>
                  <strong>{r.symbol}</strong> <span className="muted">{r.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <TechRankingsTable rows={rankingRows} loading={rankingsLoading} error={rankingsError} />

        <StockTradeSignalsSection rows={rankingRows} loading={rankingsLoading} />

        <WhatsAppAlerts topPick={topPick} loading={rankingsLoading} />

        {selected && (
          <div className="card stock-detail">
            {loading && <p className="muted">Loading {selected.symbol}…</p>}
            {error && <p className="error">{error}</p>}

            {data && (
              <>
                <div className="stock-detail-header">
                  <div>
                    <h2>{data.profile.name ?? selected.symbol} <span className="muted">{selected.symbol}</span></h2>
                    <p className="muted">{data.profile.exchange} · {data.profile.industry ?? '—'}</p>
                  </div>
                  <div className="stock-price-block">
                    <span className="result-value">${fmt(data.quote?.c)}</span>
                    {data.quote?.dp != null && (
                      <span className={data.quote.dp >= 0 ? 'arrow up' : 'arrow down'}>
                        {data.quote.dp >= 0 ? '▲' : '▼'} {fmt(Math.abs(data.quote.dp))}%
                      </span>
                    )}
                  </div>
                </div>

                <StockPriceChart candles={data.candles} symbol={selected.symbol} />

                <div className="stock-metrics-grid">
                  <div className="stock-metric"><span className="stock-metric-label">P/E (TTM)</span><span>{fmt(data.metrics.peTTM)}</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">PEG</span><span>{fmt(data.peg)}</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">EPS (TTM)</span><span>{fmt(data.metrics.epsTTM)}</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">EPS growth YoY</span><span>{fmt(data.metrics.epsGrowthYoy)}%</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">Revenue growth YoY</span><span>{fmt(data.metrics.revenueGrowthYoy)}%</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">Dividend yield</span><span>{fmt(data.metrics.dividendYield)}%</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">Market cap</span><span>${fmt(data.metrics.marketCap, 0)}M</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">52w range</span><span>{fmt(data.metrics.week52Low)} – {fmt(data.metrics.week52High)}</span></div>
                </div>

                <div className="stock-forward">
                  <h3>Forward view</h3>
                  <p className="muted small-note">
                    Finnhub's free tier has no formal "guidance" field — analyst recommendations and price targets are the closest forward-looking data available.
                  </p>
                  {data.forward.recommendation ? (
                    <p>
                      Analysts ({data.forward.recommendation.period}): {(data.forward.recommendation.strongBuy ?? 0) + (data.forward.recommendation.buy ?? 0)} buy,{' '}
                      {data.forward.recommendation.hold ?? 0} hold, {(data.forward.recommendation.sell ?? 0) + (data.forward.recommendation.strongSell ?? 0)} sell
                    </p>
                  ) : (
                    <p className="muted">No analyst data available.</p>
                  )}
                  {data.forward.priceTargetMean != null && (
                    <p>Price target: ${fmt(data.forward.priceTargetLow)} – ${fmt(data.forward.priceTargetHigh)} (mean ${fmt(data.forward.priceTargetMean)})</p>
                  )}
                  {data.upcomingEarnings ? (
                    <p>Next earnings report: <strong>{data.upcomingEarnings.date}</strong> (Q{data.upcomingEarnings.quarter} {data.upcomingEarnings.year}, est. EPS {fmt(data.upcomingEarnings.epsEstimate)})</p>
                  ) : (
                    <p className="muted">No upcoming earnings date found in the next 90 days.</p>
                  )}
                  <a
                    href={`https://seekingalpha.com/symbol/${selected.symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-btn"
                  >
                    View {selected.symbol} on Seeking Alpha ↗
                  </a>
                </div>

                <div className="stock-add-form">
                  <label>
                    Quantity
                    <input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} />
                  </label>
                  <label>
                    Avg buy price ($)
                    <input type="number" min="0" value={avgBuy} onChange={(e) => setAvgBuy(e.target.value)} />
                  </label>
                  <button className="btn btn-primary" onClick={addToPortfolio}>+ Add to portfolio</button>
                  <button className="btn btn-ghost" onClick={toggleWatch}>{isWatched ? '★ Watching' : '☆ Watch'}</button>
                </div>
              </>
            )}
          </div>
        )}

        {watchlist.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginTop: '3rem' }}>Watchlist</h2>
            <div className="table-scroll">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Chg %</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((w) => {
                    const q = quotes[w.symbol]
                    return (
                      <tr key={w.symbol}>
                        <td><strong>{w.symbol}</strong></td>
                        <td>{w.name}</td>
                        <td>{q?.c != null ? `$${fmt(q.c)}` : '—'}</td>
                        <td className={q?.dp >= 0 ? 'arrow up' : q?.dp < 0 ? 'arrow down' : ''}>
                          {q?.dp != null ? `${q.dp >= 0 ? '+' : ''}${fmt(q.dp)}%` : '—'}
                        </td>
                        <td>
                          <button className="btn btn-ghost icon-btn" onClick={() => removeFromWatchlist(w.symbol)} aria-label={`Remove ${w.symbol}`}>✕</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h2 className="section-title" style={{ marginTop: '3rem' }}>My Portfolio</h2>
        {portfolio.length === 0 ? (
          <div className="card empty-state">
            <p>Search a stock above and add it to your portfolio.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Avg Buy</th>
                  <th>LTP</th>
                  <th>Buy Value</th>
                  <th>Present Value</th>
                  <th>P&amp;L</th>
                  <th>Allocation</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((p) => {
                  const ltp = quotes[p.symbol]?.c
                  const buyValue = p.qty * p.avgBuy
                  const presentValue = p.qty * (ltp ?? p.avgBuy)
                  const pnl = presentValue - buyValue
                  const pnlPct = buyValue > 0 ? (pnl / buyValue) * 100 : 0
                  const allocation = totalPresent > 0 ? (presentValue / totalPresent) * 100 : 0
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.symbol}</strong></td>
                      <td>{p.name}</td>
                      <td>{p.qty}</td>
                      <td>${fmt(p.avgBuy)}</td>
                      <td>{ltp != null ? `$${fmt(ltp)}` : '—'}</td>
                      <td>${fmt(buyValue)}</td>
                      <td>${fmt(presentValue)}</td>
                      <td className={pnl >= 0 ? 'arrow up' : 'arrow down'}>
                        {pnl >= 0 ? '+' : ''}${fmt(pnl)} ({pnlPct >= 0 ? '+' : ''}{fmt(pnlPct)}%)
                      </td>
                      <td>{fmt(allocation)}%</td>
                      <td>
                        <button className="btn btn-ghost icon-btn" onClick={() => removeFromPortfolio(p.id)} aria-label={`Remove ${p.symbol}`}>✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

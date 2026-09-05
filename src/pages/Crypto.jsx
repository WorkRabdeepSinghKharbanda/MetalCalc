import { useState } from 'react'
import { useCoinSearch } from '../hooks/useCoinSearch.js'
import { useCryptoData } from '../hooks/useCryptoData.js'
import { useCryptoQuotes } from '../hooks/useCryptoQuotes.js'
import { useCryptoRankings } from '../hooks/useCryptoRankings.js'
import { useTopCrypto } from '../hooks/useTopCrypto.js'
import { loadCryptoPortfolio, saveCryptoPortfolio } from '../utils/cryptoPortfolio.js'
import CryptoRankingsTable from '../components/CryptoRankingsTable.jsx'
import TopCryptoTable from '../components/TopCryptoTable.jsx'
import TradeSignalsSection from '../components/TradeSignalsSection.jsx'
import Seo from '../components/Seo.jsx'
import { useToast } from '../context/ToastContext.jsx'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function Crypto() {
  const showToast = useToast()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(1)
  const [avgBuy, setAvgBuy] = useState('')
  const [portfolio, setPortfolio] = useState(() => loadCryptoPortfolio())

  const { results } = useCoinSearch(query)
  const { data, loading, error } = useCryptoData(selected?.id)
  const ids = portfolio.map((p) => p.id)
  const quotes = useCryptoQuotes(ids)
  const { rows: rankingRows, loading: rankingsLoading, error: rankingsError } = useCryptoRankings()
  const { rows: topRows, loading: topLoading, error: topError } = useTopCrypto(50)

  function selectResult(c) {
    setSelected({ id: c.id, symbol: c.symbol.toUpperCase(), name: c.name })
    setQuery('')
  }

  function addToPortfolio() {
    if (!selected || !avgBuy || Number(avgBuy) <= 0 || Number(qty) <= 0) return
    const next = [
      ...portfolio,
      { id: `${selected.id}-${crypto.randomUUID()}`, coinId: selected.id, symbol: selected.symbol, name: selected.name, qty: Number(qty), avgBuy: Number(avgBuy) },
    ]
    setPortfolio(saveCryptoPortfolio(next))
    showToast(`Added ${selected.symbol} to portfolio`)
    setAvgBuy('')
    setQty(1)
  }

  function removeFromPortfolio(id) {
    setPortfolio(saveCryptoPortfolio(portfolio.filter((p) => p.id !== id)))
  }

  const totalPresent = portfolio.reduce((sum, p) => sum + (quotes[p.coinId] ?? p.avgBuy) * p.qty, 0)

  return (
    <section className="stocks-page">
      <Seo title="Crypto — MetalCalc" description="Search cryptocurrencies, view live price and 24h range, browse curated rankings, and track your portfolio." />
      <div className="container">
        <p className="eyebrow">Crypto</p>
        <h1>Search crypto &amp; track your portfolio</h1>

        <div className="stock-search">
          <input
            type="text"
            placeholder="Search by symbol or name (e.g. BTC, Bitcoin)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div className="stock-search-results">
              {results.map((c) => (
                <button key={c.id} className="stock-search-item" onClick={() => selectResult(c)}>
                  <strong>{c.symbol.toUpperCase()}</strong> <span className="muted">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <TopCryptoTable rows={topRows} loading={topLoading} error={topError} />

        <TradeSignalsSection rows={topRows} loading={topLoading} />

        <CryptoRankingsTable rows={rankingRows} loading={rankingsLoading} error={rankingsError} />

        {selected && (
          <div className="card stock-detail">
            {loading && <p className="muted">Loading {selected.symbol}…</p>}
            {error && <p className="error">{error}</p>}

            {data && (
              <>
                <div className="stock-detail-header">
                  <div>
                    <h2>{data.name ?? selected.name} <span className="muted">{selected.symbol}</span></h2>
                    <p className="muted">Rank #{data.market_cap_rank ?? '—'} by market cap</p>
                  </div>
                  <div className="stock-price-block">
                    <span className="result-value">${fmt(data.current_price)}</span>
                    {data.price_change_percentage_24h != null && (
                      <span className={data.price_change_percentage_24h >= 0 ? 'arrow up' : 'arrow down'}>
                        {data.price_change_percentage_24h >= 0 ? '▲' : '▼'} {fmt(Math.abs(data.price_change_percentage_24h))}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="stock-metrics-grid">
                  <div className="stock-metric"><span className="stock-metric-label">Market cap</span><span>${fmt(data.market_cap / 1e9, 2)}B</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">24h range</span><span>${fmt(data.low_24h)} – ${fmt(data.high_24h)}</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">All-time high</span><span>${fmt(data.ath)}</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">From ATH</span><span>{fmt(data.ath_change_percentage)}%</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">Circulating supply</span><span>{fmt(data.circulating_supply, 0)}</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">Fully diluted valuation</span><span>${fmt(data.fully_diluted_valuation / 1e9, 2)}B</span></div>
                </div>

                <div className="stock-add-form">
                  <label>
                    Quantity
                    <input type="number" min="0" step="any" value={qty} onChange={(e) => setQty(e.target.value)} />
                  </label>
                  <label>
                    Avg buy price ($)
                    <input type="number" min="0" value={avgBuy} onChange={(e) => setAvgBuy(e.target.value)} />
                  </label>
                  <button className="btn btn-primary" onClick={addToPortfolio}>+ Add to portfolio</button>
                </div>
              </>
            )}
          </div>
        )}

        <h2 className="section-title" style={{ marginTop: '3rem' }}>My Crypto Portfolio</h2>
        {portfolio.length === 0 ? (
          <div className="card empty-state">
            <p>Search a coin above and add it to your portfolio.</p>
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
                  const ltp = quotes[p.coinId]
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

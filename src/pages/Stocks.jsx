import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { hasApiKey } from '../finnhub/client.js'
import { useSymbolSearch } from '../hooks/useSymbolSearch.js'
import { useStockData } from '../hooks/useStockData.js'
import { useQuotes } from '../hooks/useQuotes.js'
import { useStockRankings } from '../hooks/useStockRankings.js'
import { loadPortfolio, savePortfolio } from '../utils/stockPortfolio.js'
import { loadWatchlist, saveWatchlist } from '../utils/stockWatchlist.js'
import { rankByPeg } from '../utils/rankStocks.js'
import { downloadCsv } from '../utils/downloadCsv.js'
import { parseCsv } from '../utils/parseCsv.js'
import { useSortableTable } from '../hooks/useSortableTable.js'
import StockPriceChart from '../components/StockPriceChart.jsx'
import TechRankingsTable from '../components/TechRankingsTable.jsx'
import StockTradeSignalsSection from '../components/StockTradeSignalsSection.jsx'
import WhatsAppAlerts from '../components/WhatsAppAlerts.jsx'
import DropdownMenu from '../components/DropdownMenu.jsx'
import SortableTh from '../components/SortableTh.jsx'
import Tabs from '../components/Tabs.jsx'
import LastUpdated from '../components/LastUpdated.jsx'
import Seo from '../components/Seo.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function Stocks() {
  const showToast = useToast()
  const { currency, rates } = useMarket()
  const rate = rates[currency] ?? 1
  const cSymbol = CURRENCY_SYMBOLS[currency] ?? '$'
  const conv = (usd) => (usd == null || Number.isNaN(usd) ? null : usd * rate)
  const fmtC = (usd, decimals = 2) => (usd == null || Number.isNaN(usd) ? '—' : `${cSymbol}${fmt(conv(usd), decimals)}`)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(1)
  const [avgBuy, setAvgBuy] = useState('')
  const [portfolio, setPortfolio] = useState(() => loadPortfolio())
  const [watchlist, setWatchlist] = useState(() => loadWatchlist())
  const fileInputRef = useRef(null)

  const { results } = useSymbolSearch(query)
  const { data, loading, error, updatedAt: dataUpdatedAt } = useStockData(selected?.symbol)
  const symbols = [...new Set([...portfolio.map((p) => p.symbol), ...watchlist.map((w) => w.symbol)])]
  const { quotes, updatedAt: quotesUpdatedAt } = useQuotes(symbols)
  const { rows: rankingRows, loading: rankingsLoading, progress: rankingsProgress, error: rankingsError, updatedAt: rankingsUpdatedAt } = useStockRankings()
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

  function updateTargetPct(id, targetPct) {
    setPortfolio(savePortfolio(portfolio.map((p) => (p.id === id ? { ...p, targetPct } : p))))
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

  function handleExportCsv() {
    const headers = ['Symbol', 'Name', 'Qty', 'Avg Buy', 'Target %']
    const rows = portfolio.map((p) => [p.symbol, p.name, p.qty, p.avgBuy, p.targetPct ?? ''])
    downloadCsv('my-stock-portfolio.csv', headers, rows)
    showToast('CSV downloaded')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function findColumn(header, keyword) {
    return header.findIndex((h) => h.toLowerCase().includes(keyword))
  }

  function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const rows = parseCsv(String(reader.result))
      const [header, ...dataRows] = rows
      const symbolIdx = findColumn(header, 'symbol')
      if (symbolIdx === -1) {
        showToast('CSV needs a "Symbol" column — see the exported format for reference')
        return
      }
      const nameIdx = findColumn(header, 'name')
      const qtyIdx = findColumn(header, 'qty')
      const avgBuyIdx = findColumn(header, 'avg buy')
      const targetIdx = findColumn(header, 'target')

      const imported = dataRows
        .filter((row) => row[symbolIdx])
        .map((row) => ({
          id: crypto.randomUUID(),
          symbol: row[symbolIdx].toUpperCase(),
          name: nameIdx >= 0 ? row[nameIdx] || '' : '',
          qty: qtyIdx >= 0 ? Number(row[qtyIdx]) || 0 : 0,
          avgBuy: avgBuyIdx >= 0 ? Number(row[avgBuyIdx]) || 0 : 0,
          ...(targetIdx >= 0 && row[targetIdx] ? { targetPct: Number(row[targetIdx]) || 0 } : {}),
        }))
      if (imported.length === 0) {
        showToast('No valid rows found in that file')
        return
      }
      setPortfolio(savePortfolio([...portfolio, ...imported]))
      showToast(`Imported ${imported.length} holding${imported.length > 1 ? 's' : ''}`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const totalPresent = portfolio.reduce((sum, p) => sum + (quotes[p.symbol]?.c ?? p.avgBuy) * p.qty, 0)

  const watchlistRows = watchlist.map((w) => ({
    ...w,
    price: quotes[w.symbol]?.c ?? null,
    changePct: quotes[w.symbol]?.dp ?? null,
  }))
  const { sorted: sortedWatchlist, sortKey: watchSortKey, sortDir: watchSortDir, toggleSort: toggleWatchSort } =
    useSortableTable(watchlistRows, 'symbol', 'asc')

  const portfolioRows = portfolio.map((p) => {
    const ltp = quotes[p.symbol]?.c ?? null
    const buyValue = p.qty * p.avgBuy
    const presentValue = p.qty * (ltp ?? p.avgBuy)
    const pnl = presentValue - buyValue
    const pnlPct = buyValue > 0 ? (pnl / buyValue) * 100 : 0
    const allocation = totalPresent > 0 ? (presentValue / totalPresent) * 100 : 0
    const targetPct = Number(p.targetPct) || 0
    const delta = targetPct > 0 ? (targetPct / 100) * totalPresent - presentValue : null
    return { ...p, ltp, buyValue, presentValue, pnl, pnlPct, allocation, delta }
  })
  const { sorted: sortedPortfolio, sortKey: portSortKey, sortDir: portSortDir, toggleSort: togglePortSort } =
    useSortableTable(portfolioRows, 'symbol', 'asc')

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
                    <span className="result-value">{fmtC(data.quote?.c)}</span>
                    {data.quote?.dp != null && (
                      <span className={data.quote.dp >= 0 ? 'arrow up' : 'arrow down'}>
                        {data.quote.dp >= 0 ? '▲' : '▼'} {fmt(Math.abs(data.quote.dp))}%
                      </span>
                    )}
                    <LastUpdated timestamp={dataUpdatedAt} />
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
                  <div className="stock-metric"><span className="stock-metric-label">Market cap</span><span>{fmtC(data.metrics.marketCap, 0)}M</span></div>
                  <div className="stock-metric"><span className="stock-metric-label">52w range</span><span>{fmtC(data.metrics.week52Low)} – {fmtC(data.metrics.week52High)}</span></div>
                </div>

                {data.metrics.dividendYield > 0 && (
                  <div className="stock-forward">
                    <h3>Dividend income estimate</h3>
                    <p>
                      At {fmt(data.metrics.dividendYield)}% yield and {fmtC(data.quote?.c)}/share,{' '}
                      {qty || 0} share{Number(qty) === 1 ? '' : 's'} would pay an estimated{' '}
                      <strong>{fmtC((data.quote?.c ?? 0) * (data.metrics.dividendYield / 100) * (Number(qty) || 0))}/year</strong>.
                    </p>
                  </div>
                )}

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
                    <p>Price target: {fmtC(data.forward.priceTargetLow)} – {fmtC(data.forward.priceTargetHigh)} (mean {fmtC(data.forward.priceTargetMean)})</p>
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
                    Avg buy price ($ — stored in USD)
                    <input type="number" min="0" value={avgBuy} onChange={(e) => setAvgBuy(e.target.value)} />
                  </label>
                  <button className="btn btn-primary" onClick={addToPortfolio}>+ Add to portfolio</button>
                  <button className="btn btn-ghost" onClick={toggleWatch}>{isWatched ? '★ Watching' : '☆ Watch'}</button>
                </div>
              </>
            )}
          </div>
        )}

        <Tabs
          defaultKey="markets"
          tabs={[
            {
              key: 'markets',
              label: 'Markets',
              content: (
                <>
                  <LastUpdated timestamp={rankingsUpdatedAt} />
                  <TechRankingsTable rows={rankingRows} loading={rankingsLoading} progress={rankingsProgress} error={rankingsError} />
                  <StockTradeSignalsSection rows={rankingRows} loading={rankingsLoading} />
                  <p className="muted small-note">
                    Per-timeframe signals (15min–3month) aren't available for stocks — Finnhub's free tier blocks
                    historical candle data. Available on the <Link to="/crypto">Crypto</Link> page.
                  </p>
                  <WhatsAppAlerts topPick={topPick} loading={rankingsLoading} />
                </>
              ),
            },
            {
              key: 'watchlist',
              label: `Watchlist${watchlist.length > 0 ? ` (${watchlist.length})` : ''}`,
              content:
                watchlist.length === 0 ? (
                  <div className="card empty-state">
                    <p>Search a stock above and tap "☆ Watch" to add it here.</p>
                  </div>
                ) : (
                  <>
                    <LastUpdated timestamp={quotesUpdatedAt} />
                    <div className="table-scroll">
                      <table className="stock-table">
                        <thead>
                          <tr>
                            <SortableTh label="Symbol" sortKey="symbol" currentKey={watchSortKey} currentDir={watchSortDir} onSort={toggleWatchSort} />
                            <SortableTh label="Name" sortKey="name" currentKey={watchSortKey} currentDir={watchSortDir} onSort={toggleWatchSort} />
                            <SortableTh label="Price" sortKey="price" currentKey={watchSortKey} currentDir={watchSortDir} onSort={toggleWatchSort} />
                            <SortableTh label="Chg %" sortKey="changePct" currentKey={watchSortKey} currentDir={watchSortDir} onSort={toggleWatchSort} />
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedWatchlist.map((w) => (
                            <tr key={w.symbol}>
                              <td><strong>{w.symbol}</strong></td>
                              <td>{w.name}</td>
                              <td>{fmtC(w.price)}</td>
                              <td className={w.changePct >= 0 ? 'arrow up' : w.changePct < 0 ? 'arrow down' : ''}>
                                {w.changePct != null ? `${w.changePct >= 0 ? '+' : ''}${fmt(w.changePct)}%` : '—'}
                              </td>
                              <td>
                                <button className="btn btn-ghost icon-btn" onClick={() => removeFromWatchlist(w.symbol)} aria-label={`Remove ${w.symbol}`}>✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ),
            },
            {
              key: 'portfolio',
              label: `Portfolio${portfolio.length > 0 ? ` (${portfolio.length})` : ''}`,
              content: (
                <>
                  <div className="batch-actions" style={{ alignItems: 'center' }}>
                    <h2 className="section-title" style={{ margin: 0 }}>My Portfolio</h2>
                    <DropdownMenu
                      label="⋯ More"
                      items={[
                        { label: '⬇ Export CSV', onClick: handleExportCsv, disabled: portfolio.length === 0 },
                        { label: '⬆ Import CSV', onClick: handleImportClick },
                      ]}
                    />
                    <input ref={fileInputRef} type="file" accept=".csv,text/csv" hidden onChange={handleImportFile} />
                  </div>
                  {portfolio.length === 0 ? (
                    <div className="card empty-state">
                      <p>Search a stock above and add it to your portfolio.</p>
                    </div>
                  ) : (
                    <>
                    <LastUpdated timestamp={quotesUpdatedAt} />
                    <div className="table-scroll">
                      <table className="stock-table">
                        <thead>
                          <tr>
                            <SortableTh label="Symbol" sortKey="symbol" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="Name" sortKey="name" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="Qty" sortKey="qty" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="Avg Buy" sortKey="avgBuy" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="LTP" sortKey="ltp" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="Buy Value" sortKey="buyValue" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="Present Value" sortKey="presentValue" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="P&L" sortKey="pnl" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <SortableTh label="Allocation" sortKey="allocation" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <th title="Set a target % to see rebalancing suggestions">Target %</th>
                            <SortableTh label="Rebalance" sortKey="delta" currentKey={portSortKey} currentDir={portSortDir} onSort={togglePortSort} />
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPortfolio.map((p) => (
                            <tr key={p.id}>
                              <td><strong>{p.symbol}</strong></td>
                              <td>{p.name}</td>
                              <td>{p.qty}</td>
                              <td>{fmtC(p.avgBuy)}</td>
                              <td>{p.ltp != null ? fmtC(p.ltp) : '—'}</td>
                              <td>{fmtC(p.buyValue)}</td>
                              <td>{fmtC(p.presentValue)}</td>
                              <td className={p.pnl >= 0 ? 'arrow up' : 'arrow down'}>
                                {p.pnl >= 0 ? '+' : ''}{fmtC(p.pnl)} ({p.pnlPct >= 0 ? '+' : ''}{fmt(p.pnlPct)}%)
                              </td>
                              <td>{fmt(p.allocation)}%</td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="rebalance-target-input"
                                  placeholder="—"
                                  value={p.targetPct ?? ''}
                                  onChange={(e) => updateTargetPct(p.id, e.target.value)}
                                />
                              </td>
                              <td className={p.delta == null ? 'muted' : p.delta > 0 ? 'arrow up' : p.delta < 0 ? 'arrow down' : ''}>
                                {p.delta == null ? '—' : `${p.delta >= 0 ? 'Buy ' : 'Sell '}${fmtC(Math.abs(p.delta))}`}
                              </td>
                              <td>
                                <button className="btn btn-ghost icon-btn" onClick={() => removeFromPortfolio(p.id)} aria-label={`Remove ${p.symbol}`}>✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                </>
              ),
            },
          ]}
        />
      </div>
    </section>
  )
}

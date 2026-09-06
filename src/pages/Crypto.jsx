import { useRef, useState } from 'react'
import { useCoinSearch } from '../hooks/useCoinSearch.js'
import { useCryptoData } from '../hooks/useCryptoData.js'
import { useCryptoQuotes } from '../hooks/useCryptoQuotes.js'
import { useCryptoRankings } from '../hooks/useCryptoRankings.js'
import { useTopCrypto } from '../hooks/useTopCrypto.js'
import { loadCryptoPortfolio, saveCryptoPortfolio } from '../utils/cryptoPortfolio.js'
import { loadCryptoWatchlist, saveCryptoWatchlist } from '../utils/cryptoWatchlist.js'
import { downloadCsv } from '../utils/downloadCsv.js'
import { parseCsv } from '../utils/parseCsv.js'
import { useSortableTable } from '../hooks/useSortableTable.js'
import CryptoRankingsTable from '../components/CryptoRankingsTable.jsx'
import TopCryptoTable from '../components/TopCryptoTable.jsx'
import TradeSignalsSection from '../components/TradeSignalsSection.jsx'
import TimeframeSignals from '../components/TimeframeSignals.jsx'
import DropdownMenu from '../components/DropdownMenu.jsx'
import SortableTh from '../components/SortableTh.jsx'
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
  const [watchlist, setWatchlist] = useState(() => loadCryptoWatchlist())
  const fileInputRef = useRef(null)

  const { results } = useCoinSearch(query)
  const { data, loading, error } = useCryptoData(selected?.id)
  const ids = [...new Set([...portfolio.map((p) => p.coinId), ...watchlist.map((w) => w.coinId)])]
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

  function updateTargetPct(id, targetPct) {
    setPortfolio(saveCryptoPortfolio(portfolio.map((p) => (p.id === id ? { ...p, targetPct } : p))))
  }

  const isWatched = selected && watchlist.some((w) => w.coinId === selected.id)

  function toggleWatch() {
    if (!selected) return
    if (isWatched) {
      setWatchlist(saveCryptoWatchlist(watchlist.filter((w) => w.coinId !== selected.id)))
    } else {
      setWatchlist(saveCryptoWatchlist([...watchlist, { coinId: selected.id, symbol: selected.symbol, name: selected.name }]))
      showToast(`Watching ${selected.symbol}`)
    }
  }

  function removeFromWatchlist(coinId) {
    setWatchlist(saveCryptoWatchlist(watchlist.filter((w) => w.coinId !== coinId)))
  }

  function handleExportCsv() {
    const headers = ['Coin Id', 'Symbol', 'Name', 'Qty', 'Avg Buy', 'Target %']
    const rows = portfolio.map((p) => [p.coinId, p.symbol, p.name, p.qty, p.avgBuy, p.targetPct ?? ''])
    downloadCsv('my-crypto-portfolio.csv', headers, rows)
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
      const coinIdIdx = findColumn(header, 'coin id')
      if (coinIdIdx === -1) {
        showToast('CSV needs a "Coin Id" column (from CoinGecko) — see the exported format for reference')
        return
      }
      const symbolIdx = findColumn(header, 'symbol')
      const nameIdx = findColumn(header, 'name')
      const qtyIdx = findColumn(header, 'qty')
      const avgBuyIdx = findColumn(header, 'avg buy')
      const targetIdx = findColumn(header, 'target')

      const imported = dataRows
        .filter((row) => row[coinIdIdx])
        .map((row) => ({
          id: `${row[coinIdIdx]}-${crypto.randomUUID()}`,
          coinId: row[coinIdIdx],
          symbol: symbolIdx >= 0 ? row[symbolIdx].toUpperCase() : row[coinIdIdx].toUpperCase(),
          name: nameIdx >= 0 ? row[nameIdx] || '' : '',
          qty: qtyIdx >= 0 ? Number(row[qtyIdx]) || 0 : 0,
          avgBuy: avgBuyIdx >= 0 ? Number(row[avgBuyIdx]) || 0 : 0,
          ...(targetIdx >= 0 && row[targetIdx] ? { targetPct: Number(row[targetIdx]) || 0 } : {}),
        }))
      if (imported.length === 0) {
        showToast('No valid rows found in that file')
        return
      }
      setPortfolio(saveCryptoPortfolio([...portfolio, ...imported]))
      showToast(`Imported ${imported.length} holding${imported.length > 1 ? 's' : ''}`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const totalPresent = portfolio.reduce((sum, p) => sum + (quotes[p.coinId] ?? p.avgBuy) * p.qty, 0)

  const watchlistRows = watchlist.map((w) => ({ ...w, price: quotes[w.coinId] ?? null }))
  const { sorted: sortedWatchlist, sortKey: watchSortKey, sortDir: watchSortDir, toggleSort: toggleWatchSort } =
    useSortableTable(watchlistRows, 'symbol', 'asc')

  const portfolioRows = portfolio.map((p) => {
    const ltp = quotes[p.coinId] ?? null
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

                <TimeframeSignals coinId={selected.id} />

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
                    <SortableTh label="Symbol" sortKey="symbol" currentKey={watchSortKey} currentDir={watchSortDir} onSort={toggleWatchSort} />
                    <SortableTh label="Name" sortKey="name" currentKey={watchSortKey} currentDir={watchSortDir} onSort={toggleWatchSort} />
                    <SortableTh label="Price" sortKey="price" currentKey={watchSortKey} currentDir={watchSortDir} onSort={toggleWatchSort} />
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWatchlist.map((w) => (
                    <tr key={w.coinId}>
                      <td><strong>{w.symbol}</strong></td>
                      <td>{w.name}</td>
                      <td>{w.price != null ? `$${fmt(w.price)}` : '—'}</td>
                      <td>
                        <button className="btn btn-ghost icon-btn" onClick={() => removeFromWatchlist(w.coinId)} aria-label={`Remove ${w.symbol}`}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="batch-actions" style={{ marginTop: '3rem', alignItems: 'center' }}>
          <h2 className="section-title" style={{ margin: 0 }}>My Crypto Portfolio</h2>
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
            <p>Search a coin above and add it to your portfolio.</p>
          </div>
        ) : (
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
                    <td>${fmt(p.avgBuy)}</td>
                    <td>{p.ltp != null ? `$${fmt(p.ltp)}` : '—'}</td>
                    <td>${fmt(p.buyValue)}</td>
                    <td>${fmt(p.presentValue)}</td>
                    <td className={p.pnl >= 0 ? 'arrow up' : 'arrow down'}>
                      {p.pnl >= 0 ? '+' : ''}${fmt(p.pnl)} ({p.pnlPct >= 0 ? '+' : ''}{fmt(p.pnlPct)}%)
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
                      {p.delta == null ? '—' : `${p.delta >= 0 ? 'Buy ' : 'Sell '}$${fmt(Math.abs(p.delta))}`}
                    </td>
                    <td>
                      <button className="btn btn-ghost icon-btn" onClick={() => removeFromPortfolio(p.id)} aria-label={`Remove ${p.symbol}`}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { calculateValue, PURITIES, SYMBOLS, UNITS } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCIES, CURRENCY_SYMBOLS } from '../utils/currency.js'
import CompositionBar from '../components/CompositionBar.jsx'
import PortfolioChart from '../components/PortfolioChart.jsx'
import DropdownMenu from '../components/DropdownMenu.jsx'
import { loadHoldings, saveHoldings } from '../utils/holdings.js'
import { downloadCsv } from '../utils/downloadCsv.js'
import { parseCsv } from '../utils/parseCsv.js'
import { useToast } from '../context/ToastContext.jsx'
import { downloadSummaryImage } from '../utils/exportImage.js'
import Seo from '../components/Seo.jsx'
import PrintHeader from '../components/PrintHeader.jsx'
import PrintFooter from '../components/PrintFooter.jsx'

function makeHolding(overrides = {}) {
  return {
    name: '',
    metal: 'Gold',
    weight: 1,
    unit: 'gram',
    purity: PURITIES.Gold[0].value,
    costBasis: '',
    ...overrides,
    id: crypto.randomUUID(),
  }
}

export default function Holdings() {
  const { prices, rates, currency, setCurrency, loading, error, history } = useMarket()
  const showToast = useToast()
  const [items, setItems] = useState(() => loadHoldings())
  const fileInputRef = useRef(null)

  useEffect(() => {
    saveHoldings(items)
  }, [items])

  function updateItem(id, patch) {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function removeItem(id) {
    setItems((list) => list.filter((it) => it.id !== id))
  }

  const rate = rates[currency] ?? 1
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? ''

  function currentValue(item) {
    if (!prices || prices[item.metal] == null) return null
    return calculateValue(Number(item.weight) || 0, item.unit, prices[item.metal] * rate, item.purity)
  }

  function breakEvenPricePerOz(item) {
    const cost = Number(item.costBasis) || 0
    if (cost <= 0) return null
    const perUnitValue = calculateValue(Number(item.weight) || 0, item.unit, 1, item.purity)
    if (perUnitValue <= 0) return null
    return cost / perUnitValue
  }

  const total = items.reduce((sum, it) => sum + (currentValue(it) ?? 0), 0)
  const totalCost = items.reduce((sum, it) => sum + (Number(it.costBasis) || 0), 0)
  const gain = total - totalCost
  const byMetal = items.reduce((acc, it) => {
    acc[it.metal] = (acc[it.metal] ?? 0) + (currentValue(it) ?? 0)
    return acc
  }, {})

  function valueAtHistoryPoint(historyEntry) {
    return items.reduce((sum, it) => {
      const price = historyEntry[it.metal]
      if (price == null) return sum
      return sum + calculateValue(Number(it.weight) || 0, it.unit, price * rate, it.purity)
    }, 0)
  }

  function handleExportCsv() {
    const headers = ['Name', 'Metal', 'Weight', 'Unit', 'Purity', `Cost Paid (${currency})`, `Value (${currency})`]
    const rows = items.map((it) => [
      it.name || '',
      it.metal,
      it.weight,
      it.unit,
      PURITIES[it.metal].find((p) => p.value === it.purity)?.label ?? it.purity,
      it.costBasis || 0,
      (currentValue(it) ?? 0).toFixed(2),
    ])
    downloadCsv('my-holdings.csv', headers, rows)
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
      const metalIdx = findColumn(header, 'metal')
      if (metalIdx === -1) {
        showToast('CSV needs a "Metal" column — see the exported format for reference')
        return
      }
      const nameIdx = findColumn(header, 'name')
      const weightIdx = findColumn(header, 'weight')
      const unitIdx = findColumn(header, 'unit')
      const purityIdx = findColumn(header, 'purity')
      const costIdx = findColumn(header, 'cost')

      const imported = dataRows
        .filter((row) => row[metalIdx] in SYMBOLS)
        .map((row) => {
          const metal = row[metalIdx]
          return makeHolding({
            name: nameIdx >= 0 ? row[nameIdx] || '' : '',
            metal,
            weight: weightIdx >= 0 ? Number(row[weightIdx]) || 0 : 0,
            unit: unitIdx >= 0 && row[unitIdx] in UNITS ? row[unitIdx] : 'gram',
            purity:
              purityIdx >= 0
                ? PURITIES[metal].find((p) => p.label === row[purityIdx])?.value ?? PURITIES[metal][0].value
                : PURITIES[metal][0].value,
            costBasis: costIdx >= 0 ? Number(row[costIdx]) || '' : '',
          })
        })
      if (imported.length === 0) {
        showToast('No valid rows found in that file')
        return
      }
      setItems((list) => [...list, ...imported])
      showToast(`Imported ${imported.length} holding${imported.length > 1 ? 's' : ''}`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleExportImage() {
    downloadSummaryImage({
      title: 'My Holdings',
      subtitle: new Date().toLocaleDateString(),
      rows: items.map((it) => ({
        label: it.name || `${it.metal} (${it.weight}${it.unit})`,
        value: `${currencySymbol}${(currentValue(it) ?? 0).toFixed(2)}`,
      })),
      totalLabel: `Total (${currency})`,
      totalValue: `${currencySymbol}${total.toFixed(2)}`,
      filename: 'my-holdings.png',
    })
    showToast('Image downloaded')
  }

  return (
    <section className="holdings-page">
      <Seo title="My Holdings — MetalCalc" description="Track your gold, silver and platinum holdings with live value and gain/loss." />
      <PrintHeader title="My Holdings" />
      <div className="container">
        <p className="eyebrow no-print">My Holdings</p>
        <h1>Track what you own, live</h1>
        <p className="hero-sub no-print" style={{ marginBottom: '2rem' }}>
          A persistent portfolio, saved automatically on this device. Add what you bought and what you paid to see live gain/loss.
        </p>

        {loading && !prices && <p className="muted">Loading live prices…</p>}
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

            {items.length === 0 ? (
              <div className="card empty-state">
                <p>Nothing here yet. Add your first holding below.</p>
              </div>
            ) : (
              <div className="batch-list">
                {items.map((item, idx) => {
                  const value = currentValue(item)
                  const cost = Number(item.costBasis) || 0
                  const pnl = cost > 0 && value != null ? value - cost : null
                  const isLast = idx === items.length - 1
                  return (
                    <div key={item.id} className="card holding-row">
                      <input
                        className="holding-name"
                        type="text"
                        placeholder="Name (e.g. Wedding ring)"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && isLast) {
                            e.preventDefault()
                            setItems((list) => [...list, makeHolding()])
                          }
                        }}
                      />
                      <select
                        value={item.metal}
                        onChange={(e) => {
                          const metal = e.target.value
                          updateItem(item.id, { metal, purity: PURITIES[metal][0].value })
                        }}
                      >
                        {Object.keys(SYMBOLS).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={item.weight}
                        onChange={(e) => updateItem(item.id, { weight: e.target.value })}
                      />
                      <select value={item.unit} onChange={(e) => updateItem(item.id, { unit: e.target.value })}>
                        {Object.keys(UNITS).map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <select
                        value={item.purity}
                        onChange={(e) => updateItem(item.id, { purity: Number(e.target.value) })}
                      >
                        {PURITIES[item.metal].map((p) => (
                          <option key={p.label} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        placeholder={`Cost paid (${currency})`}
                        value={item.costBasis}
                        onChange={(e) => updateItem(item.id, { costBasis: e.target.value })}
                      />
                      <span className="batch-value">
                        {value != null ? `${currencySymbol}${value.toFixed(2)}` : '—'}
                      </span>
                      <span className={pnl == null ? 'muted' : pnl >= 0 ? 'arrow up' : 'arrow down'}>
                        {pnl == null ? '—' : `${pnl >= 0 ? '+' : ''}${currencySymbol}${pnl.toFixed(2)}`}
                      </span>
                      <span className="muted no-print break-even" title="Price per troy oz needed to break even">
                        {(() => {
                          const be = breakEvenPricePerOz(item)
                          return be == null ? '—' : `BE: ${currencySymbol}${be.toFixed(2)}/oz`
                        })()}
                      </span>
                      <button className="btn btn-ghost icon-btn no-print" onClick={() => removeItem(item.id)} aria-label="Remove holding">✕</button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="batch-actions">
              <button className="btn btn-primary" onClick={() => setItems((list) => [...list, makeHolding()])}>
                + Add holding
              </button>
              <DropdownMenu
                label="⋯ More"
                items={[
                  { label: '⬇ Export CSV', onClick: handleExportCsv, disabled: items.length === 0 },
                  { label: '⬆ Import CSV', onClick: handleImportClick },
                  { label: '🖼 Export image', onClick: handleExportImage, disabled: items.length === 0 },
                  { label: '🖨 Print / Save PDF', onClick: () => window.print(), disabled: items.length === 0 },
                ]}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={handleImportFile}
              />
            </div>

            <CompositionBar byMetal={byMetal} total={total} currencySymbol={currencySymbol} />

            <div className="holdings-summary">
              <div className="result-box">
                <span className="result-label">Current value ({currency})</span>
                <span className="result-value">{currencySymbol}{total.toFixed(2)}</span>
              </div>
              {totalCost > 0 && (
                <div className="result-box">
                  <span className="result-label">Gain / Loss</span>
                  <span className={`result-value ${gain >= 0 ? 'arrow up' : 'arrow down'}`}>
                    {gain >= 0 ? '+' : ''}{currencySymbol}{gain.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <PortfolioChart history={history} valueAtPrices={valueAtHistoryPoint} currencySymbol={currencySymbol} />
            <PrintFooter />
          </>
        )}
      </div>
    </section>
  )
}

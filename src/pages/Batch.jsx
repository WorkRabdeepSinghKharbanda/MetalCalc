import { useEffect, useState } from 'react'
import { calculateValue, PURITIES } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCIES, CURRENCY_SYMBOLS } from '../utils/currency.js'
import BatchRow from '../components/BatchRow.jsx'
import DropdownMenu from '../components/DropdownMenu.jsx'
import CompositionBar from '../components/CompositionBar.jsx'
import SavedBatches from '../components/SavedBatches.jsx'
import { encodeBatch, decodeBatch } from '../utils/batchShare.js'
import { downloadCsv } from '../utils/downloadCsv.js'
import { listSavedBatches, saveBatch, deleteBatch } from '../utils/savedBatches.js'
import { shareOrCopy } from '../utils/share.js'
import { useToast } from '../context/ToastContext.jsx'
import { downloadSummaryImage } from '../utils/exportImage.js'
import { loadRecipes, saveRecipe, deleteRecipe } from '../utils/recipes.js'
import Seo from '../components/Seo.jsx'
import PrintHeader from '../components/PrintHeader.jsx'
import PrintFooter from '../components/PrintFooter.jsx'
import { Link } from 'react-router-dom'

const PRESETS = [
  { label: '1oz Gold Coin', metal: 'Gold', weight: 1, unit: 'oz', purity: 0.999 },
  { label: '10g Gold Bar', metal: 'Gold', weight: 10, unit: 'gram', purity: 0.999 },
  { label: '1oz Silver Coin', metal: 'Silver', weight: 1, unit: 'oz', purity: 0.999 },
  { label: 'Sterling Item (10g)', metal: 'Silver', weight: 10, unit: 'gram', purity: 0.925 },
]


function makeItem(overrides = {}) {
  return {
    name: '',
    metal: 'Gold',
    weight: 1,
    unit: 'gram',
    purity: PURITIES.Gold[0].value,
    makingCharge: 0,
    ...overrides,
    id: crypto.randomUUID(),
  }
}

function readSharedItems() {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('b')
  if (!encoded) return null
  const decoded = decodeBatch(encoded)
  return decoded?.map((it) => makeItem(it)) ?? null
}

export default function Batch() {
  const { prices, rates, currency, setCurrency, loading, error } = useMarket()
  const showToast = useToast()
  const [items, setItems] = useState(() => readSharedItems() ?? [makeItem()])
  const [savedBatches, setSavedBatches] = useState(() => listSavedBatches())
  const [recipes, setRecipes] = useState(() => loadRecipes())

  useEffect(() => {
    if (readSharedItems()) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  function updateItem(id, patch) {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function removeItem(id) {
    setItems((list) => list.filter((it) => it.id !== id))
  }

  function duplicateItem(id) {
    setItems((list) => {
      const idx = list.findIndex((it) => it.id === id)
      const copy = makeItem(list[idx])
      return [...list.slice(0, idx + 1), copy, ...list.slice(idx + 1)]
    })
  }

  function moveItem(id, dir) {
    setItems((list) => {
      const idx = list.findIndex((it) => it.id === id)
      const target = idx + dir
      if (target < 0 || target >= list.length) return list
      const next = [...list]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  function addPreset(preset) {
    setItems((list) => [...list, makeItem(preset)])
  }

  function handleSaveRecipe() {
    if (items.length === 0) return
    const last = items[items.length - 1]
    const label = window.prompt('Name this recipe (based on the last row):')
    if (!label) return
    setRecipes(saveRecipe({ label, metal: last.metal, unit: last.unit, purity: last.purity }))
    showToast(`Saved recipe "${label}"`)
  }

  function handleDeleteRecipe(label) {
    setRecipes(deleteRecipe(label))
  }

  function sortByValue() {
    setItems((list) => [...list].sort((a, b) => (valueOf(b) ?? 0) - (valueOf(a) ?? 0)))
  }

  const rate = rates[currency] ?? 1
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? ''

  function valueOf(item) {
    if (!prices || prices[item.metal] == null) return null
    return calculateValue(
      Number(item.weight) || 0,
      item.unit,
      prices[item.metal] * rate,
      item.purity,
      Number(item.makingCharge) || 0
    )
  }

  const total = items.reduce((sum, it) => sum + (valueOf(it) ?? 0), 0)
  const byMetal = items.reduce((acc, it) => {
    acc[it.metal] = (acc[it.metal] ?? 0) + (valueOf(it) ?? 0)
    return acc
  }, {})

  function handleSave() {
    const name = window.prompt('Name this batch:')
    if (!name) return
    setSavedBatches(saveBatch(name, items))
    showToast(`Saved "${name}"`)
  }

  function handleLoad(batch) {
    setItems(batch.items.map((it) => makeItem(it)))
    showToast(`Loaded "${batch.name}"`)
  }

  function handleDelete(id) {
    setSavedBatches(deleteBatch(id))
  }

  async function handleShare() {
    const encoded = encodeBatch(items)
    const url = `${window.location.origin}${window.location.pathname}?b=${encoded}`
    const result = await shareOrCopy({ title: 'My metal batch', text: `Total: ${currencySymbol}${total.toFixed(2)}`, url })
    if (result === 'copied') showToast('Link copied to clipboard')
  }

  function handleExportCsv() {
    const headers = ['Name', 'Metal', 'Weight', 'Unit', 'Purity', 'Making %', `Value (${currency})`]
    const rows = items.map((it) => [
      it.name || '',
      it.metal,
      it.weight,
      it.unit,
      PURITIES[it.metal].find((p) => p.value === it.purity)?.label ?? it.purity,
      it.makingCharge || 0,
      (valueOf(it) ?? 0).toFixed(2),
    ])
    rows.push(['', '', '', '', '', 'Total', total.toFixed(2)])
    downloadCsv('metal-batch.csv', headers, rows)
    showToast('CSV downloaded')
  }

  function handleExportImage() {
    downloadSummaryImage({
      title: 'My Metal Batch',
      subtitle: new Date().toLocaleDateString(),
      rows: items.map((it) => ({
        label: it.name || `${it.metal} (${it.weight}${it.unit})`,
        value: `${currencySymbol}${(valueOf(it) ?? 0).toFixed(2)}`,
      })),
      totalLabel: `Total (${currency})`,
      totalValue: `${currencySymbol}${total.toFixed(2)}`,
      filename: 'metal-batch.png',
    })
    showToast('Image downloaded')
  }

  return (
    <section className="batch-page">
      <Seo title="Batch Calculator — MetalCalc" description="Value multiple gold, silver and platinum items at once and get a combined total." />
      <PrintHeader title="Batch Valuation" />
      <div className="container">
        <p className="eyebrow no-print">Batch mode</p>
        <h1>Value multiple items at once</h1>
        <p className="hero-sub no-print" style={{ marginBottom: '2rem' }}>
          Add every piece in a lot — rings, coins, bars — and get one combined total.
        </p>

        {loading && !prices && <p className="muted">Loading live prices…</p>}
        {error && <p className="error">{error}</p>}

        {prices && (
          <>
            <div className="batch-toolbar no-print">
              <div className="segmented">
                {CURRENCIES.map((c) => (
                  <button key={c} className={c === currency ? 'active' : ''} onClick={() => setCurrency(c)}>
                    {c}
                  </button>
                ))}
              </div>

              <div className="preset-chips">
                {PRESETS.map((p) => (
                  <button key={p.label} className="btn btn-ghost preset-chip" onClick={() => addPreset(p)}>
                    + {p.label}
                  </button>
                ))}
                {recipes.map((r) => (
                  <span key={r.label} className="preset-chip recipe-chip">
                    <button className="link-btn" onClick={() => addPreset(r)}>+ {r.label}</button>
                    <button
                      className="icon-btn"
                      onClick={() => handleDeleteRecipe(r.label)}
                      aria-label={`Delete recipe ${r.label}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <button className="btn btn-ghost preset-chip" onClick={handleSaveRecipe} disabled={items.length === 0}>
                  ★ Save last as recipe
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="card empty-state">
                <p>No items yet. Add one below to start a lot.</p>
              </div>
            ) : (
              <div className="batch-list">
                {items.map((item, idx) => (
                  <BatchRow
                    key={item.id}
                    item={item}
                    value={valueOf(item)}
                    currencySymbol={currencySymbol}
                    onChange={(patch) => updateItem(item.id, patch)}
                    onRemove={() => removeItem(item.id)}
                    onDuplicate={() => duplicateItem(item.id)}
                    onMoveUp={() => moveItem(item.id, -1)}
                    onMoveDown={() => moveItem(item.id, 1)}
                    removable={items.length > 1}
                    isLast={idx === items.length - 1}
                    onAddNext={() => setItems((list) => [...list, makeItem()])}
                  />
                ))}
              </div>
            )}

            <div className="batch-actions no-print">
              <button className="btn btn-primary" onClick={() => setItems((list) => [...list, makeItem()])}>
                + Add item
              </button>
              <DropdownMenu
                label="⋯ More"
                items={[
                  { label: '⇅ Sort by value', onClick: sortByValue, disabled: items.length < 2 },
                  { label: '💾 Save batch', onClick: handleSave, disabled: items.length === 0 },
                  { label: '🔗 Share link', onClick: handleShare, disabled: items.length === 0 },
                  { label: '⬇ Export CSV', onClick: handleExportCsv, disabled: items.length === 0 },
                  { label: '🖼 Export image', onClick: handleExportImage, disabled: items.length === 0 },
                  { label: '🖨 Print / Save PDF', onClick: () => window.print(), disabled: items.length === 0 },
                ]}
              />
            </div>

            <SavedBatches batches={savedBatches} onLoad={handleLoad} onDelete={handleDelete} />
            {savedBatches.length >= 2 && (
              <p className="no-print"><Link to="/compare" className="link-btn">Compare saved batches →</Link></p>
            )}

            <CompositionBar byMetal={byMetal} total={total} currencySymbol={currencySymbol} />

            <div className="result-box batch-total">
              <span className="result-label">Total ({currency})</span>
              <span className="result-value">{currencySymbol}{total.toFixed(2)}</span>
            </div>
            <PrintFooter />
          </>
        )}
      </div>
    </section>
  )
}

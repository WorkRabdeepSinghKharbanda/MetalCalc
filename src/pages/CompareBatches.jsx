import { useState } from 'react'
import { calculateValue } from '../calc.js'
import { useMarket } from '../context/MarketContext.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import CompositionBar from '../components/CompositionBar.jsx'
import { listSavedBatches } from '../utils/savedBatches.js'
import Seo from '../components/Seo.jsx'

function summarize(batch, prices, rate) {
  if (!batch) return null
  const byMetal = {}
  let total = 0
  for (const it of batch.items) {
    if (prices[it.metal] == null) continue
    const value = calculateValue(
      Number(it.weight) || 0,
      it.unit,
      prices[it.metal] * rate,
      it.purity,
      Number(it.makingCharge) || 0
    )
    total += value
    byMetal[it.metal] = (byMetal[it.metal] ?? 0) + value
  }
  return { total, byMetal, count: batch.items.length }
}

export default function CompareBatches() {
  const { prices, rates, currency, loading, error } = useMarket()
  const [batches] = useState(() => listSavedBatches())
  const [idA, setIdA] = useState(batches[0]?.id ?? '')
  const [idB, setIdB] = useState(batches[1]?.id ?? '')

  const rate = rates[currency] ?? 1
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? ''
  const batchA = batches.find((b) => b.id === Number(idA))
  const batchB = batches.find((b) => b.id === Number(idB))
  const summaryA = prices ? summarize(batchA, prices, rate) : null
  const summaryB = prices ? summarize(batchB, prices, rate) : null

  return (
    <section className="compare-page">
      <Seo title="Compare Batches — MetalCalc" description="Compare two saved metal batches side by side." />
      <div className="container">
        <p className="eyebrow">Compare</p>
        <h1>Compare saved batches</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Pick two batches you saved from the Batch calculator to see them side by side.
        </p>

        {loading && !prices && <p className="muted">Loading live prices…</p>}
        {error && <p className="error">{error}</p>}

        {batches.length < 2 ? (
          <div className="card empty-state">
            <p>Save at least 2 batches from the Batch calculator to compare them here.</p>
          </div>
        ) : (
          prices && (
            <div className="compare-grid">
              {[
                { id: idA, setId: setIdA, batch: batchA, summary: summaryA },
                { id: idB, setId: setIdB, batch: batchB, summary: summaryB },
              ].map((slot, i) => (
                <div key={i} className="card compare-card">
                  <select value={slot.id} onChange={(e) => slot.setId(e.target.value)}>
                    <option value="">Select a batch…</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.items.length} items)</option>
                    ))}
                  </select>

                  {slot.summary ? (
                    <>
                      <div className="result-box">
                        <span className="result-label">Total ({currency})</span>
                        <span className="result-value">{currencySymbol}{slot.summary.total.toFixed(2)}</span>
                      </div>
                      <CompositionBar byMetal={slot.summary.byMetal} total={slot.summary.total} currencySymbol={currencySymbol} />
                    </>
                  ) : (
                    <p className="muted">Pick a batch to see its value.</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {summaryA && summaryB && (
          <div className="result-box compare-diff">
            <span className="result-label">Difference</span>
            <span className={`result-value ${summaryA.total >= summaryB.total ? 'arrow up' : 'arrow down'}`}>
              {currencySymbol}{Math.abs(summaryA.total - summaryB.total).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

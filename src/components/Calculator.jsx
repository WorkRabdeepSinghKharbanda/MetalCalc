import { useEffect, useState } from 'react'
import { calculateValue, weightForValue, PURITIES, SYMBOLS, UNITS } from '../calc.js'
import Skeleton from './Skeleton.jsx'
import { CURRENCY_SYMBOLS } from '../utils/currency.js'
import { shareOrCopy } from '../utils/share.js'
import { useToast } from '../context/ToastContext.jsx'

const STORAGE_KEY = 'metalcalc:lastInputs'

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export default function Calculator({ prices, rates, currency, loading, error, onRefresh }) {
  const showToast = useToast()
  const saved = loadSaved()
  const [mode, setMode] = useState(saved.mode ?? 'toValue')
  const [metal, setMetal] = useState(saved.metal ?? 'Gold')
  const [weight, setWeight] = useState(saved.weight ?? 1)
  const [unit, setUnit] = useState(saved.unit ?? 'gram')
  const [purity, setPurity] = useState(saved.purity ?? PURITIES[saved.metal ?? 'Gold'][0].value)
  const [charge, setCharge] = useState(saved.charge ?? 0)
  const [budget, setBudget] = useState(saved.budget ?? 100)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode, metal, weight, unit, purity, charge, budget })
    )
  }, [mode, metal, weight, unit, purity, charge, budget])

  function handleMetalChange(e) {
    const m = e.target.value
    setMetal(m)
    setPurity(PURITIES[m][0].value)
  }

  const rate = rates[currency] ?? 1
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? ''
  const hasPrice = prices && prices[metal] != null

  const value =
    mode === 'toValue' && hasPrice
      ? calculateValue(Number(weight) || 0, unit, prices[metal] * rate, purity, Number(charge) || 0)
      : null

  const weightOut =
    mode === 'toWeight' && hasPrice
      ? weightForValue(Number(budget) || 0, unit, prices[metal] * rate, purity, Number(charge) || 0)
      : null

  async function handleShare() {
    if (mode === 'toValue' && value == null) return
    if (mode === 'toWeight' && weightOut == null) return
    const text =
      mode === 'toValue'
        ? `${weight}${unit} of ${metal} (${PURITIES[metal].find((p) => p.value === purity)?.label}) ≈ ${currencySymbol}${value.toFixed(2)}`
        : `${currencySymbol}${budget} buys ≈ ${weightOut.toFixed(3)}${unit} of ${metal} (${PURITIES[metal].find((p) => p.value === purity)?.label})`
    const result = await shareOrCopy({ title: 'MetalCalc result', text })
    if (result === 'copied') showToast('Copied to clipboard')
  }

  return (
    <section id="calculator" className="calculator-section">
      <div className="container">
        <div className="card calc-card">
          <div className="card-header">
            <h2>Value Calculator</h2>
            {prices && (
              <button className="btn btn-ghost" onClick={onRefresh} disabled={loading}>
                {loading ? 'Refreshing…' : '↻ Refresh prices'}
              </button>
            )}
          </div>

          {loading && !prices && (
            <div className="calc-skeleton">
              <Skeleton height="2.5rem" />
              <Skeleton height="2.5rem" />
              <Skeleton height="2.5rem" />
              <Skeleton height="2.5rem" />
              <Skeleton height="4rem" />
            </div>
          )}
          {error && (
            <p className="error">{error} — <button className="link-btn" onClick={onRefresh}>Retry</button></p>
          )}

          {prices && (
            <>
              <div className="segmented calc-mode-toggle">
                <button className={mode === 'toValue' ? 'active' : ''} onClick={() => setMode('toValue')}>
                  Weight → Value
                </button>
                <button className={mode === 'toWeight' ? 'active' : ''} onClick={() => setMode('toWeight')}>
                  Budget → Weight
                </button>
              </div>

              <div className="form-grid">
                <label>
                  Metal
                  <select value={metal} onChange={handleMetalChange}>
                    {Object.keys(SYMBOLS).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>

                {mode === 'toValue' ? (
                  <label>
                    Weight
                    <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </label>
                ) : (
                  <label>
                    Budget ({currency})
                    <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} />
                  </label>
                )}

                <label>
                  Unit
                  <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    {Object.keys(UNITS).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Purity
                  <select value={purity} onChange={(e) => setPurity(Number(e.target.value))}>
                    {PURITIES[metal].map((p) => (
                      <option key={p.label} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Charge % (+making, −scrap discount)
                  <input
                    type="number"
                    step="0.5"
                    value={charge}
                    onChange={(e) => setCharge(e.target.value)}
                    placeholder="0"
                  />
                </label>
              </div>

              <div className="result-box">
                <span className="result-label">
                  {mode === 'toValue' ? `Estimated value (${currency})` : `Weight you can buy (${unit})`}
                </span>
                <span className="result-value">
                  {mode === 'toValue'
                    ? value != null ? `${currencySymbol}${value.toFixed(2)}` : '—'
                    : weightOut != null ? weightOut.toFixed(3) : '—'}
                </span>
                <button className="btn btn-ghost" onClick={handleShare}>
                  ⧉ Share result
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import Seo from '../components/Seo.jsx'

// karat is out of 24, fineness is parts-per-1000, percent is purity %
function fromKarat(karat) {
  const percent = (karat / 24) * 100
  return { karat, fineness: Math.round(percent * 10), percent }
}
function fromFineness(fineness) {
  const percent = fineness / 10
  return { karat: (percent / 100) * 24, fineness, percent }
}
function fromPercent(percent) {
  return { karat: (percent / 100) * 24, fineness: Math.round(percent * 10), percent }
}

const COMMON = [24, 22, 21, 18, 14, 10, 9]

export default function Convert() {
  const [mode, setMode] = useState('karat')
  const [input, setInput] = useState('24')

  const n = Number(input) || 0
  const result = mode === 'karat' ? fromKarat(n) : mode === 'fineness' ? fromFineness(n) : fromPercent(n)

  return (
    <section className="convert-page">
      <Seo
        title="Gold Purity Converter — Karat, Fineness & Percent — MetalCalc"
        description="Convert gold purity between karat (24k, 22k, 18k...), fineness (999, 916...) and percent purity."
      />
      <div className="container">
        <p className="eyebrow">Purity converter</p>
        <h1>Karat ↔ fineness ↔ percent</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Convert between the three ways purity gets labeled on gold, silver and platinum items.
        </p>

        <div className="card convert-form">
          <div className="segmented">
            {['karat', 'fineness', 'percent'].map((m) => (
              <button key={m} className={m === mode ? 'active' : ''} onClick={() => setMode(m)}>
                {m}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="0"
            max={mode === 'karat' ? 24 : 1000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="convert-results">
          <div className="result-box">
            <span className="result-label">Karat</span>
            <span className="result-value">{result.karat.toFixed(2)}k</span>
          </div>
          <div className="result-box">
            <span className="result-label">Fineness</span>
            <span className="result-value">.{String(result.fineness).padStart(3, '0')}</span>
          </div>
          <div className="result-box">
            <span className="result-label">Percent purity</span>
            <span className="result-value">{result.percent.toFixed(2)}%</span>
          </div>
        </div>

        <div className="card convert-common">
          <p className="muted" style={{ marginBottom: '0.75rem' }}>Common karats</p>
          <table>
            <thead>
              <tr><th>Karat</th><th>Fineness</th><th>Percent</th></tr>
            </thead>
            <tbody>
              {COMMON.map((k) => {
                const r = fromKarat(k)
                return (
                  <tr key={k}>
                    <td>{k}k</td>
                    <td>.{String(r.fineness).padStart(3, '0')}</td>
                    <td>{r.percent.toFixed(2)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

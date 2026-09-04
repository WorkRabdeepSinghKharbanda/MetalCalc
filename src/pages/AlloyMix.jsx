import { useState } from 'react'
import { PURITIES, SYMBOLS } from '../calc.js'
import Seo from '../components/Seo.jsx'

function makePiece(metal) {
  return { weight: '10', purity: PURITIES[metal][0].value }
}

export default function AlloyMix() {
  const [metal, setMetal] = useState('Gold')
  const [pieces, setPieces] = useState([makePiece('Gold'), makePiece('Gold')])

  function updatePiece(idx, patch) {
    setPieces((list) => list.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }

  function changeMetal(m) {
    setMetal(m)
    setPieces((list) => list.map(() => makePiece(m)))
  }

  const totalWeight = pieces.reduce((sum, p) => sum + (Number(p.weight) || 0), 0)
  const blendedPurity = totalWeight > 0
    ? pieces.reduce((sum, p) => sum + (Number(p.weight) || 0) * p.purity, 0) / totalWeight
    : 0
  const karat = (blendedPurity / 1) * 24
  const fineness = Math.round(blendedPurity * 1000)

  return (
    <section className="convert-page">
      <Seo
        title="Alloy Mixing Calculator — Blend Purity — MetalCalc"
        description="Melt two different-purity gold or silver pieces together and calculate the resulting blended purity, karat and fineness."
      />
      <div className="container">
        <p className="eyebrow">Alloy mixing</p>
        <h1>Melt two purities together — what do you get?</h1>
        <p className="hero-sub" style={{ marginBottom: '2rem' }}>
          Weighted average by weight. Assumes a clean, lossless melt with no other alloying metal added.
        </p>

        <div className="card zakat-form">
          <label>
            Metal
            <select value={metal} onChange={(e) => changeMetal(e.target.value)}>
              {Object.keys(SYMBOLS).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>

        {pieces.map((p, idx) => (
          <div key={idx} className="card zakat-form">
            <label>
              Piece {idx + 1} weight (g)
              <input type="number" min="0" value={p.weight} onChange={(e) => updatePiece(idx, { weight: e.target.value })} />
            </label>
            <label>
              Piece {idx + 1} purity
              <select value={p.purity} onChange={(e) => updatePiece(idx, { purity: Number(e.target.value) })}>
                {PURITIES[metal].map((pu) => <option key={pu.label} value={pu.value}>{pu.label}</option>)}
              </select>
            </label>
          </div>
        ))}

        <div className="convert-results">
          <div className="result-box">
            <span className="result-label">Total weight</span>
            <span className="result-value">{totalWeight.toFixed(2)}g</span>
          </div>
          <div className="result-box">
            <span className="result-label">Blended purity</span>
            <span className="result-value">.{String(fineness).padStart(3, '0')} ({(blendedPurity * 100).toFixed(2)}%)</span>
          </div>
          <div className="result-box">
            <span className="result-label">Nearest karat</span>
            <span className="result-value">{karat.toFixed(2)}k</span>
          </div>
        </div>
      </div>
    </section>
  )
}

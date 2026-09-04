import { METAL_COLORS } from '../calc.js'

export default function CompositionBar({ byMetal, total, currencySymbol }) {
  const entries = Object.entries(byMetal).filter(([, v]) => v > 0)
  if (entries.length === 0 || total === 0) return null

  return (
    <div className="composition">
      <span className="result-label">Composition</span>
      <div
        className="composition-bar"
        role="img"
        aria-label={entries.map(([m, v]) => `${m} ${((v / total) * 100).toFixed(0)}%`).join(', ')}
      >
        {entries.map(([metal, value]) => (
          <div
            key={metal}
            className="composition-segment"
            style={{ width: `${(value / total) * 100}%`, background: METAL_COLORS[metal] }}
            title={`${metal}: ${currencySymbol}${value.toFixed(2)}`}
          />
        ))}
      </div>
      <div className="composition-legend">
        {entries.map(([metal, value]) => (
          <span key={metal} className="composition-legend-item">
            <span className="dot" style={{ background: METAL_COLORS[metal] }} />
            {metal} · {currencySymbol}{value.toFixed(2)} ({((value / total) * 100).toFixed(0)}%)
          </span>
        ))}
      </div>
    </div>
  )
}

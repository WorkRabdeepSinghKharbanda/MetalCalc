import { METAL_COLORS, METAL_ICONS } from '../calc.js'

const WIDTH = 280
const HEIGHT = 60

function pathFor(values) {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * WIDTH
      const y = HEIGHT - ((v - min) / span) * HEIGHT
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default function Sparkline({ history, metal }) {
  const points = history.map((h) => h[metal]).filter((v) => v != null)
  if (points.length < 2) return null

  const first = points[0]
  const last = points[points.length - 1]
  const change = ((last - first) / first) * 100

  return (
    <div className="sparkline-card">
      <div className="sparkline-header">
        <span>{METAL_ICONS[metal]} {metal}</span>
        <span className={change >= 0 ? 'arrow up' : 'arrow down'}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="sparkline-svg"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${metal} price trend, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(2)}%`}
      >
        <path d={pathFor(points)} fill="none" stroke={METAL_COLORS[metal]} strokeWidth="2" />
      </svg>
    </div>
  )
}

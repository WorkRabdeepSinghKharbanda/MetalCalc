const WIDTH = 600
const HEIGHT = 120

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

// Approximates portfolio value over time by applying TODAY's holdings weights
// against PAST prices — it does not know when each item was actually bought.
export default function PortfolioChart({ history, valueAtPrices, currencySymbol }) {
  const points = history.map((h) => valueAtPrices(h)).filter((v) => v != null)
  if (points.length < 2) return null

  const first = points[0]
  const last = points[points.length - 1]
  const change = last - first

  return (
    <div className="card portfolio-chart">
      <div className="sparkline-header">
        <span>Value trend (this device's price history)</span>
        <span className={change >= 0 ? 'arrow up' : 'arrow down'}>
          {change >= 0 ? '▲' : '▼'} {currencySymbol}{Math.abs(change).toFixed(2)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="portfolio-chart-svg"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Portfolio value trend, ${change >= 0 ? 'up' : 'down'} ${currencySymbol}${Math.abs(change).toFixed(2)}`}
      >
        <path d={pathFor(points)} fill="none" stroke="var(--gold)" strokeWidth="2" />
      </svg>
      <p className="muted portfolio-chart-note">
        Approximate — assumes you've held today's items for your whole price history.
      </p>
    </div>
  )
}

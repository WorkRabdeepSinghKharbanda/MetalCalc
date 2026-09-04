const WIDTH = 600
const HEIGHT = 160

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

export default function StockPriceChart({ candles, symbol }) {
  if (candles.length < 2) {
    return (
      <p className="muted">
        Price chart unavailable — historical candle data needs a paid Finnhub plan.
      </p>
    )
  }
  const closes = candles.map((c) => c.c)
  const change = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100

  return (
    <div className="card stock-chart">
      <div className="sparkline-header">
        <span>{symbol} · 1Y</span>
        <span className={change >= 0 ? 'arrow up' : 'arrow down'}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="stock-chart-svg"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${symbol} 1-year price trend, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}%`}
      >
        <path d={pathFor(closes)} fill="none" stroke="var(--gold)" strokeWidth="2" />
      </svg>
    </div>
  )
}

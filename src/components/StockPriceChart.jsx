import { sparklinePath } from '../utils/sparklinePath.js'

const WIDTH = 600
const HEIGHT = 160

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
        <path d={sparklinePath(closes, WIDTH, HEIGHT)} fill="none" stroke="var(--gold)" strokeWidth="2" />
      </svg>
    </div>
  )
}

import { useState } from 'react'
import { TIMEFRAMES } from '../utils/timeframes.js'
import { useCryptoTimeframeSignal } from '../hooks/useCryptoTimeframeSignal.js'
import { sparklinePath } from '../utils/sparklinePath.js'

const WIDTH = 600
const HEIGHT = 140

function fmt(n, decimals = 2) {
  return n == null || Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function TimeframeSignals({ coinId }) {
  const [activeKey, setActiveKey] = useState(TIMEFRAMES[2].key)
  const timeframe = TIMEFRAMES.find((t) => t.key === activeKey)
  const { prices, signal, loading, error } = useCryptoTimeframeSignal(coinId, timeframe)

  const closes = prices.map((p) => p[1])
  const change = closes.length >= 2 ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100 : null

  return (
    <div className="card timeframe-signals">
      <h3 style={{ marginTop: 0 }}>Trade signal by timeframe</h3>
      <p className="muted small-note" style={{ marginBottom: '1rem' }}>
        Each tab is its own independent Buy/Sell/Hold call from that window's price data (SMA crossover, RSI,
        momentum) — a coin can read differently on 15min than on 3 months. Not a prediction, not financial advice.
      </p>

      <div className="segmented">
        {TIMEFRAMES.map((t) => (
          <button key={t.key} className={t.key === activeKey ? 'active' : ''} onClick={() => setActiveKey(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading {timeframe.label} data…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && closes.length >= 2 && (
        <>
          <div className="sparkline-header" style={{ marginTop: '1rem' }}>
            <span>{timeframe.label}</span>
            <span className={change >= 0 ? 'arrow up' : 'arrow down'}>
              {change >= 0 ? '▲' : '▼'} {fmt(Math.abs(change), 1)}%
            </span>
          </div>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="stock-chart-svg"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Price trend over ${timeframe.label}, ${change >= 0 ? 'up' : 'down'} ${fmt(Math.abs(change), 1)}%`}
          >
            <path d={sparklinePath(closes, WIDTH, HEIGHT)} fill="none" stroke="var(--gold)" strokeWidth="2" />
          </svg>

          {signal && (
            <div className={`timeframe-verdict ${signal.signal}`}>
              <span className="timeframe-verdict-badge">
                {signal.signal === 'buy' ? '🟢 Buy' : signal.signal === 'sell' ? '🔴 Sell' : '⚪ Hold'}
              </span>
              {signal.rsi != null && <span className="muted">RSI {fmt(signal.rsi, 0)}</span>}
              <span className="muted small-note">{signal.reason}</span>
            </div>
          )}
        </>
      )}

      {!loading && closes.length < 2 && !error && (
        <p className="muted">Not enough price history for {timeframe.label} yet.</p>
      )}
    </div>
  )
}

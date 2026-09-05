// Real technical indicators computed from an actual price series — unlike the
// snapshot-only heuristics in tradeSignal.js/stockTradeSignal.js, this is the
// first place in the codebase with a real time series (CoinGecko market_chart)
// to compute from. Still a transparent rule-based signal, not a prediction.

export function sma(values, period) {
  if (period <= 0 || values.length < period) return null
  const slice = values.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

// Wilder's RSI over the last `period` differences in the given series.
export function rsi(values, period = 14) {
  if (values.length < period + 1) return null
  const diffs = []
  for (let i = 1; i < values.length; i++) diffs.push(values[i] - values[i - 1])
  const recent = diffs.slice(-period)
  const avgGain = recent.filter((d) => d > 0).reduce((a, b) => a + b, 0) / period
  const avgLoss = recent.filter((d) => d < 0).reduce((a, b) => a - b, 0) / period
  if (avgLoss === 0) return avgGain === 0 ? 50 : 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export function pctChange(values) {
  if (values.length < 2 || values[0] === 0) return null
  return ((values[values.length - 1] - values[0]) / values[0]) * 100
}

// pricePoints: [[timestamp, price], ...], oldest first.
export function computeTimeframeSignal(pricePoints) {
  const closes = pricePoints.map((p) => p[1])
  if (closes.length < 3) {
    return { signal: 'hold', reason: 'Not enough data' }
  }

  let score = 0
  const reasons = []

  const momentum = pctChange(closes)
  if (momentum != null) {
    if (momentum >= 2) {
      score += 1
      reasons.push(`+${momentum.toFixed(1)}% this window`)
    } else if (momentum <= -2) {
      score -= 1
      reasons.push(`${momentum.toFixed(1)}% this window`)
    }
  }

  const shortPeriod = Math.max(2, Math.floor(closes.length / 3))
  const shortSma = sma(closes, shortPeriod)
  const longSma = sma(closes, closes.length)
  if (shortSma != null && longSma != null && longSma !== 0) {
    if (shortSma > longSma * 1.001) {
      score += 1
      reasons.push('short-term average above long-term (uptrend)')
    } else if (shortSma < longSma * 0.999) {
      score -= 1
      reasons.push('short-term average below long-term (downtrend)')
    }
  }

  const rsiValue = rsi(closes, 14)
  if (rsiValue != null) {
    if (rsiValue < 30) {
      score += 1
      reasons.push(`RSI ${rsiValue.toFixed(0)} (oversold)`)
    } else if (rsiValue > 70) {
      score -= 1
      reasons.push(`RSI ${rsiValue.toFixed(0)} (overbought)`)
    }
  }

  const signal = score >= 2 ? 'buy' : score <= -2 ? 'sell' : 'hold'
  return { signal, score, rsi: rsiValue, momentum, reason: reasons.join(', ') || 'No strong signal either way' }
}

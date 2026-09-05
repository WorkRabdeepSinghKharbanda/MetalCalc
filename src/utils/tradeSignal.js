// A transparent, rule-based heuristic — not a prediction model or financial advice.
// Built only from what CoinGecko's free tier gives us: 24h range position, 24h
// change, and distance from all-time-high. No RSI/MACD — that needs OHLC history
// this plan doesn't grant.
function rangePosition(price, low, high) {
  if (price == null || low == null || high == null || high <= low) return null
  return Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100))
}

export function computeSignal(coin) {
  const pos = rangePosition(coin.price, coin.low24h, coin.high24h)
  if (pos == null || coin.athChangePct == null || coin.changePct == null) {
    return { signal: 'hold', reason: 'Not enough data' }
  }

  if (pos <= 25 && coin.athChangePct <= -40) {
    return { signal: 'buy', reason: `Near 24h low, ${Math.abs(coin.athChangePct).toFixed(0)}% below all-time high` }
  }
  if (pos >= 75 && coin.changePct >= 5) {
    return { signal: 'sell', reason: `Near 24h high, up ${coin.changePct.toFixed(1)}% today` }
  }
  return { signal: 'hold', reason: 'No strong signal either way' }
}

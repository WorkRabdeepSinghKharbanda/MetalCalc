// Same rule-based heuristic as the crypto trade signals, adapted to what stock
// rankings already carry: 52-week range position instead of ATH, PEG instead of
// discount depth. Not a prediction, not financial advice.
function rangePosition(price, low, high) {
  if (price == null || low == null || high == null || high <= low) return null
  return Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100))
}

export function computeStockSignal(row) {
  const pos = rangePosition(row.price, row.week52Low, row.week52High)
  if (pos == null || row.changePct == null) {
    return { signal: 'hold', reason: 'Not enough data' }
  }
  if (pos <= 25 && row.peg != null && row.peg < 1.5) {
    return { signal: 'buy', reason: `Near 52-week low, PEG ${row.peg.toFixed(2)} (growth at a reasonable price)` }
  }
  if (pos >= 75 && row.changePct >= 3) {
    return { signal: 'sell', reason: `Near 52-week high, up ${row.changePct.toFixed(1)}% today` }
  }
  return { signal: 'hold', reason: 'No strong signal either way' }
}

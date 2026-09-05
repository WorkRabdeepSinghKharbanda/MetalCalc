// Multi-factor rule-based heuristic — a weighted composite score across valuation
// (PEG), growth (EPS/revenue YoY), 52-week range position, and today's momentum.
// Not a prediction, not financial advice — just a transparent, explainable score
// from data Finnhub's free tier already gives us (no extra API calls).
function rangePosition(price, low, high) {
  if (price == null || low == null || high == null || high <= low) return null
  return Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100))
}

export function computeStockSignal(row) {
  const pos = rangePosition(row.price, row.week52Low, row.week52High)

  if (row.peg == null && row.epsGrowthYoy == null && row.revenueGrowthYoy == null && pos == null) {
    return { signal: 'hold', reason: 'Not enough data' }
  }

  let score = 0
  const reasons = []

  if (row.peg != null) {
    if (row.peg < 1) {
      score += 2
      reasons.push(`PEG ${row.peg.toFixed(2)} (undervalued for its growth)`)
    } else if (row.peg < 1.5) {
      score += 1
      reasons.push(`PEG ${row.peg.toFixed(2)} (reasonably priced)`)
    } else if (row.peg > 3) {
      score -= 1
      reasons.push(`PEG ${row.peg.toFixed(2)} (expensive relative to growth)`)
    }
  }

  if (row.epsGrowthYoy != null) {
    if (row.epsGrowthYoy >= 20) {
      score += 1
      reasons.push(`EPS +${row.epsGrowthYoy.toFixed(0)}% YoY`)
    } else if (row.epsGrowthYoy < 0) {
      score -= 1
      reasons.push(`EPS ${row.epsGrowthYoy.toFixed(0)}% YoY (declining)`)
    }
  }

  if (row.revenueGrowthYoy != null) {
    if (row.revenueGrowthYoy >= 15) {
      score += 1
      reasons.push(`Revenue +${row.revenueGrowthYoy.toFixed(0)}% YoY`)
    } else if (row.revenueGrowthYoy < 0) {
      score -= 1
    }
  }

  if (pos != null) {
    if (pos <= 25) {
      score += 1
      reasons.push('Near 52-week low')
    } else if (pos >= 75) {
      score -= 1
      reasons.push('Near 52-week high')
      if (row.changePct != null && row.changePct >= 3) {
        score -= 1
        reasons.push(`up ${row.changePct.toFixed(1)}% today (overbought risk)`)
      }
    }
  }

  const signal = score >= 3 ? 'buy' : score <= -2 ? 'sell' : 'hold'
  return { signal, score, reason: reasons.join(', ') || 'No strong signal either way' }
}

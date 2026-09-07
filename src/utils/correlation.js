// % of overlapping days two price series moved the same direction (both up or
// both down) — a crude proxy for correlation, not a Pearson coefficient. Good
// enough to answer "do these actually diversify me, or move together?"
function toDailyCloses(pricePoints) {
  const map = {}
  for (const [ts, price] of pricePoints) {
    map[new Date(ts).toISOString().slice(0, 10)] = price // last point of each day wins, series is ascending
  }
  return map
}

export function sameDirectionPct(pricesA, pricesB) {
  const dailyA = toDailyCloses(pricesA)
  const dailyB = toDailyCloses(pricesB)
  const common = Object.keys(dailyA).filter((d) => d in dailyB).sort()
  if (common.length < 3) return null

  let agree = 0
  let total = 0
  for (let i = 1; i < common.length; i++) {
    const signA = Math.sign(dailyA[common[i]] - dailyA[common[i - 1]])
    const signB = Math.sign(dailyB[common[i]] - dailyB[common[i - 1]])
    if (signA === 0 || signB === 0) continue
    total++
    if (signA === signB) agree++
  }
  return total > 0 ? (agree / total) * 100 : null
}

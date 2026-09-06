// Backtests a fixed recurring buy against a real historical price series
// (CoinGecko market_chart — capped at 90 days on the free tier, crypto only;
// metals/stocks have no historical price API in this app).
export function simulateDca(pricePoints, investmentPerPeriod, periodDays) {
  if (!pricePoints || pricePoints.length < 2 || investmentPerPeriod <= 0 || periodDays <= 0) return null

  const periodMs = periodDays * 24 * 60 * 60 * 1000
  const start = pricePoints[0][0]
  const end = pricePoints[pricePoints.length - 1][0]

  const buys = []
  let totalInvested = 0
  let totalUnits = 0

  for (let t = start; t <= end; t += periodMs) {
    let nearest = pricePoints[0]
    for (const p of pricePoints) {
      if (Math.abs(p[0] - t) < Math.abs(nearest[0] - t)) nearest = p
    }
    const units = investmentPerPeriod / nearest[1]
    totalUnits += units
    totalInvested += investmentPerPeriod
    buys.push({ date: nearest[0], price: nearest[1], units })
  }

  const finalPrice = pricePoints[pricePoints.length - 1][1]
  const finalValue = totalUnits * finalPrice
  const gain = finalValue - totalInvested
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0
  const avgBuyPrice = totalUnits > 0 ? totalInvested / totalUnits : null

  // Lump sum comparison: same total capital, all in on day 1.
  const lumpUnits = totalInvested / pricePoints[0][1]
  const lumpValue = lumpUnits * finalPrice

  return { buys, totalInvested, totalUnits, finalValue, gain, gainPct, avgBuyPrice, finalPrice, lumpValue }
}

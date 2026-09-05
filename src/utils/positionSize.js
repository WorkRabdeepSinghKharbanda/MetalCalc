// Classic fixed-fractional position sizing: risk a fixed % of account per trade,
// size the position so a stop-loss hit loses exactly that much.
export function computePositionSize(accountSize, riskPct, entryPrice, stopPrice) {
  const riskAmount = accountSize * (riskPct / 100)
  const perShareRisk = Math.abs(entryPrice - stopPrice)
  const shares = perShareRisk > 0 ? riskAmount / perShareRisk : 0
  const positionValue = shares * entryPrice
  const pctOfAccount = accountSize > 0 ? (positionValue / accountSize) * 100 : 0
  return { riskAmount, shares, positionValue, pctOfAccount }
}

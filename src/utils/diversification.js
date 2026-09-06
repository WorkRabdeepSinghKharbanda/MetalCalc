// Herfindahl-Hirschman Index on allocation shares, normalized to a 0-100 "diversification score"
// (100 = perfectly even split across categories, 0 = all in one).
export function computeDiversificationScore(values) {
  const positive = values.filter((v) => v > 0)
  const total = positive.reduce((sum, v) => sum + v, 0)
  if (total <= 0 || positive.length === 0) return null

  const hhi = positive.reduce((sum, v) => sum + (v / total) ** 2, 0)
  const n = positive.length
  const minHhi = 1 / n
  const score = n === 1 ? 0 : Math.round((1 - (hhi - minHhi) / (1 - minHhi)) * 100)

  let label
  if (n === 1) label = 'Concentrated — all in one asset class'
  else if (score >= 75) label = 'Well diversified'
  else if (score >= 40) label = 'Moderately diversified'
  else label = 'Concentrated'

  return { score, label, categoriesUsed: n }
}

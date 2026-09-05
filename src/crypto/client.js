const BASE = 'https://api.coingecko.com/api/v3'

export async function getMarkets(ids) {
  if (ids.length === 0) return []
  const res = await fetch(
    `${BASE}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&price_change_percentage=24h`
  )
  if (!res.ok) throw new Error('Failed to fetch crypto markets')
  return res.json()
}

export async function searchCoins(query) {
  const res = await fetch(`${BASE}/search?query=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Failed to search coins')
  return res.json()
}

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY
const BASE = 'https://finnhub.io/api/v1'

export const hasApiKey = Boolean(API_KEY)

async function get(path, params = {}) {
  if (!hasApiKey) throw new Error('Missing Finnhub API key — set VITE_FINNHUB_API_KEY')
  const query = new URLSearchParams({ ...params, token: API_KEY })
  const res = await fetch(`${BASE}${path}?${query}`)
  if (!res.ok) throw new Error(`Finnhub request failed (${res.status})`)
  const data = await res.json()
  if (data?.error) throw new Error(data.error)
  return data
}

export function searchSymbol(query) {
  return get('/search', { q: query })
}

export function getQuote(symbol) {
  return get('/quote', { symbol })
}

export function getProfile(symbol) {
  return get('/stock/profile2', { symbol })
}

export function getMetrics(symbol) {
  return get('/stock/metric', { symbol, metric: 'all' })
}

export function getEarningsCalendar(symbol, from, to) {
  return get('/calendar/earnings', { symbol, from, to })
}

export function getRecommendationTrends(symbol) {
  return get('/stock/recommendation', { symbol })
}

export function getPriceTarget(symbol) {
  return get('/stock/price-target', { symbol })
}

export function getCandles(symbol, fromUnix, toUnix, resolution = 'D') {
  return get('/stock/candle', { symbol, resolution, from: fromUnix, to: toUnix })
}

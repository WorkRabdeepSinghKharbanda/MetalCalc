// CoinGecko's market_chart granularity auto-adjusts by `days`: ~5-min points for
// days=1, hourly for 2-90, daily beyond. `days` picks the API call; `points`
// picks how many of the most-recent series points that timeframe actually reads
// (15m and 1h share the same days=1 call, just read a different window off it).
export const TIMEFRAMES = [
  { key: '15m', label: '15 min', days: 1, points: 3 },
  { key: '1h', label: '1 hour', days: 1, points: 12 },
  { key: '1d', label: '1 day', days: 2, points: 24 },
  { key: '1mo', label: '1 month', days: 30, points: 30 * 24 },
  { key: '3mo', label: '3 months', days: 90, points: 90 * 24 },
]

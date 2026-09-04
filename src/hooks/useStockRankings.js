import { useEffect, useState } from 'react'
import { getQuote, getMetrics } from '../finnhub/client.js'
import { normalizeMetrics, derivePeg } from '../finnhub/normalize.js'
import { RANKING_STOCKS } from '../finnhub/rankingList.js'

// One-shot fetch on mount — 15 symbols × 2 endpoints = 30 calls, well within
// Finnhub's free-tier 60/min limit for a single page load. No caching beyond
// this component's lifetime; repeated fast reloads could add up if this list grows.
export function useStockRankings() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all(
      RANKING_STOCKS.map(async (stock) => {
        try {
          const [quote, rawMetrics] = await Promise.all([
            getQuote(stock.symbol),
            getMetrics(stock.symbol),
          ])
          const metrics = normalizeMetrics(rawMetrics)
          return {
            ...stock,
            price: quote?.c ?? null,
            changePct: quote?.dp ?? null,
            peTTM: metrics.peTTM,
            peg: metrics.pegTTM ?? derivePeg(metrics.peTTM, metrics.epsGrowthYoy),
            epsGrowthYoy: metrics.epsGrowthYoy,
            revenueGrowthYoy: metrics.revenueGrowthYoy,
            week52High: metrics.week52High,
            week52Low: metrics.week52Low,
          }
        } catch {
          return {
            ...stock,
            price: null,
            changePct: null,
            peTTM: null,
            peg: null,
            epsGrowthYoy: null,
            revenueGrowthYoy: null,
            week52High: null,
            week52Low: null,
          }
        }
      })
    )
      .then((results) => !cancelled && setRows(results))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  return { rows, loading, error }
}

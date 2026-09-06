import { useEffect, useState } from 'react'
import {
  getQuote,
  getProfile,
  getMetrics,
  getEarningsCalendar,
  getRecommendationTrends,
  getPriceTarget,
  getCandles,
} from '../finnhub/client.js'
import {
  normalizeMetrics,
  normalizeProfile,
  normalizeForwardView,
  normalizeEarningsCalendar,
  derivePeg,
} from '../finnhub/normalize.js'

const DAY = 24 * 60 * 60

export function useStockData(symbol) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    if (!symbol) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    const now = Math.floor(Date.now() / 1000)
    const yearAgo = now - 365 * DAY
    const today = new Date().toISOString().slice(0, 10)
    const threeMonthsOut = new Date(Date.now() + 90 * DAY * 1000).toISOString().slice(0, 10)

    Promise.all([
      getQuote(symbol),
      getProfile(symbol),
      getMetrics(symbol),
      getRecommendationTrends(symbol),
      getPriceTarget(symbol).catch(() => null),
      getEarningsCalendar(symbol, today, threeMonthsOut).catch(() => null),
      getCandles(symbol, yearAgo, now).catch(() => null),
    ])
      .then(([quote, profile, rawMetrics, recTrends, priceTarget, earningsCal, candles]) => {
        if (cancelled) return
        const metrics = normalizeMetrics(rawMetrics)
        setData({
          quote,
          profile: normalizeProfile(profile),
          metrics,
          peg: metrics.pegTTM ?? derivePeg(metrics.peTTM, metrics.epsGrowthYoy),
          forward: normalizeForwardView(recTrends, priceTarget),
          upcomingEarnings: normalizeEarningsCalendar(earningsCal)[0] ?? null,
          candles:
            candles?.s === 'ok'
              ? candles.t.map((t, i) => ({ t, c: candles.c[i] }))
              : [],
        })
        setUpdatedAt(Date.now())
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [symbol])

  return { data, loading, error, updatedAt }
}

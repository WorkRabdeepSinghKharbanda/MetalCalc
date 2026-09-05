import { useEffect, useState } from 'react'
import { getMarketChart } from '../crypto/client.js'
import { computeTimeframeSignal } from '../utils/technicalSignals.js'

export function useCryptoTimeframeSignal(coinId, timeframe) {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!coinId || !timeframe) {
      setPrices([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getMarketChart(coinId, timeframe.days)
      .then((data) => {
        if (cancelled) return
        const all = data?.prices ?? []
        setPrices(all.slice(-timeframe.points))
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [coinId, timeframe])

  const signal = prices.length > 0 ? computeTimeframeSignal(prices) : null

  return { prices, signal, loading, error }
}

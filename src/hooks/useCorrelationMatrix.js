import { useEffect, useState } from 'react'
import { getMarketChart } from '../crypto/client.js'
import { sameDirectionPct } from '../utils/correlation.js'

const LOOKBACK_DAYS = 30
const STAGGER_MS = 1200

// Crypto-only: metals have no historical price API in this app, and stocks'
// historical candles are blocked on Finnhub's free tier (see Stocks.jsx).
export function useCorrelationMatrix(coins) {
  const [matrix, setMatrix] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (coins.length < 2) {
      setMatrix(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    async function run() {
      const seriesByCoin = {}
      for (const coin of coins) {
        if (cancelled) return
        try {
          const data = await getMarketChart(coin.id, LOOKBACK_DAYS)
          seriesByCoin[coin.id] = data?.prices ?? []
        } catch {
          seriesByCoin[coin.id] = []
        }
        await new Promise((r) => setTimeout(r, STAGGER_MS))
      }
      if (cancelled) return

      const next = {}
      for (const a of coins) {
        next[a.id] = {}
        for (const b of coins) {
          next[a.id][b.id] = a.id === b.id ? null : sameDirectionPct(seriesByCoin[a.id], seriesByCoin[b.id])
        }
      }
      setMatrix(next)
      setLoading(false)
    }

    run().catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins.map((c) => c.id).join(',')])

  return { matrix, loading, error }
}

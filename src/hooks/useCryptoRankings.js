import { useEffect, useState } from 'react'
import { getMarkets } from '../crypto/client.js'
import { RANKING_COINS } from '../crypto/rankingList.js'

// One call fetches all curated coins' markets data — cheaper than the stock
// rankings flow (Finnhub needed one call per symbol per metric).
export function useCryptoRankings() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getMarkets(RANKING_COINS.map((c) => c.id))
      .then((data) => {
        if (cancelled) return
        setUpdatedAt(Date.now())
        const byId = Object.fromEntries(data.map((d) => [d.id, d]))
        setRows(
          RANKING_COINS.map((c) => {
            const d = byId[c.id]
            return {
              ...c,
              price: d?.current_price ?? null,
              changePct: d?.price_change_percentage_24h ?? null,
              marketCap: d?.market_cap ?? null,
              athChangePct: d?.ath_change_percentage ?? null,
              high24h: d?.high_24h ?? null,
              low24h: d?.low_24h ?? null,
            }
          })
        )
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  return { rows, loading, error, updatedAt }
}

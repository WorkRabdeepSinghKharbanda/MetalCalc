import { useEffect, useState } from 'react'
import { getTopMarkets } from '../crypto/client.js'

export function useTopCrypto(perPage = 50) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getTopMarkets(perPage)
      .then((data) => {
        if (cancelled) return
        setUpdatedAt(Date.now())
        setRows(
          data.map((d) => ({
            id: d.id,
            symbol: d.symbol?.toUpperCase() ?? '',
            name: d.name,
            rank: d.market_cap_rank,
            price: d.current_price,
            changePct: d.price_change_percentage_24h,
            marketCap: d.market_cap,
            athChangePct: d.ath_change_percentage,
            high24h: d.high_24h,
            low24h: d.low_24h,
          }))
        )
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [perPage])

  return { rows, loading, error, updatedAt }
}

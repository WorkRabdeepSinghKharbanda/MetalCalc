import { useEffect, useState } from 'react'
import { getMarkets } from '../crypto/client.js'

// Lightweight live-price fetch for a list of coin ids (portfolio table rows).
export function useCryptoQuotes(ids) {
  const [quotes, setQuotes] = useState({})
  const [updatedAt, setUpdatedAt] = useState(null)
  const key = ids.join(',')

  useEffect(() => {
    if (ids.length === 0) return
    let cancelled = false
    getMarkets(ids)
      .then((data) => {
        if (cancelled) return
        setQuotes(Object.fromEntries(data.map((d) => [d.id, d.current_price])))
        setUpdatedAt(Date.now())
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { quotes, updatedAt }
}

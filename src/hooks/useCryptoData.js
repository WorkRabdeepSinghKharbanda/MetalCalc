import { useEffect, useState } from 'react'
import { getMarkets } from '../crypto/client.js'

export function useCryptoData(id) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getMarkets([id])
      .then((rows) => {
        if (!cancelled) setData(rows[0] ?? null)
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error }
}

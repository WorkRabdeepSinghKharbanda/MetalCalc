import { useEffect, useState } from 'react'
import { getMarkets } from '../crypto/client.js'

export function useCryptoData(id) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

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
        if (cancelled) return
        setData(rows[0] ?? null)
        setUpdatedAt(Date.now())
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  return { data, loading, error, updatedAt }
}

import { useEffect, useState } from 'react'
import { getMarketNews, hasApiKey } from '../finnhub/client.js'

const KEYWORDS = ['oil', 'crude', 'opec', 'wti', 'brent', 'petroleum', 'barrel']

// Finnhub's free tier has no dedicated commodities/oil news endpoint, so this
// filters the general market news feed client-side by keyword — an honest
// approximation, not a curated oil news source.
export function useCrudeNews() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    if (!hasApiKey) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getMarketNews('general')
      .then((data) => {
        if (cancelled) return
        const filtered = (Array.isArray(data) ? data : []).filter((a) =>
          KEYWORDS.some((k) => (a.headline ?? '').toLowerCase().includes(k) || (a.summary ?? '').toLowerCase().includes(k))
        )
        setArticles(filtered.slice(0, 20))
        setUpdatedAt(Date.now())
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return { articles, loading, error, updatedAt }
}

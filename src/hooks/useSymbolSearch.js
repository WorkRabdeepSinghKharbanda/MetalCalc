import { useEffect, useState } from 'react'
import { searchSymbol } from '../finnhub/client.js'

export function useSymbolSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    const id = setTimeout(() => {
      searchSymbol(query)
        .then((data) => {
          if (!cancelled) setResults((data?.result ?? []).slice(0, 8))
        })
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false))
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [query])

  return { results, loading }
}

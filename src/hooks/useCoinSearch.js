import { useEffect, useState } from 'react'
import { searchCoins } from '../crypto/client.js'

export function useCoinSearch(query) {
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([])
      return
    }
    let cancelled = false
    const id = setTimeout(() => {
      searchCoins(query)
        .then((data) => {
          if (!cancelled) setResults((data?.coins ?? []).slice(0, 8))
        })
        .catch(() => !cancelled && setResults([]))
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [query])

  return { results }
}

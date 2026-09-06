import { useEffect, useState } from 'react'
import { getQuote } from '../finnhub/client.js'

// Lightweight live-price fetch for a list of symbols (portfolio table rows) —
// separate from useStockData, which pulls the full fundamentals set for one symbol.
export function useQuotes(symbols) {
  const [quotes, setQuotes] = useState({})
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const key = symbols.join(',')

  useEffect(() => {
    if (symbols.length === 0) return
    let cancelled = false
    setLoading(true)
    Promise.all(symbols.map((s) => getQuote(s).then((q) => [s, q]).catch(() => [s, null])))
      .then((entries) => {
        if (cancelled) return
        setQuotes(Object.fromEntries(entries))
        setUpdatedAt(Date.now())
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { quotes, loading, updatedAt }
}

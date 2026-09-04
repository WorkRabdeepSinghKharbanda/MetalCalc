import { useEffect, useRef, useState } from 'react'
import { SYMBOLS } from '../calc.js'

const AUTO_REFRESH_MS = 30_000

async function fetchPrices() {
  const entries = await Promise.all(
    Object.entries(SYMBOLS).map(async ([metal, symbol]) => {
      const res = await fetch(`https://api.gold-api.com/price/${symbol}`)
      if (!res.ok) throw new Error(`Failed to fetch ${metal} price`)
      const data = await res.json()
      return [metal, data.price]
    })
  )
  return Object.fromEntries(entries)
}

async function fetchRates() {
  const res = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=INR,EUR,GBP,JPY')
  if (!res.ok) throw new Error('Failed to fetch exchange rates')
  const data = await res.json()
  return { USD: 1, ...data.rates }
}

export function useMarketData() {
  const [prices, setPrices] = useState(null)
  const [prevPrices, setPrevPrices] = useState(null)
  const [rates, setRates] = useState({ USD: 1 })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const pricesRef = useRef(null)

  function load() {
    setLoading(true)
    setError(null)
    Promise.all([fetchPrices(), fetchRates()])
      .then(([nextPrices, nextRates]) => {
        setPrevPrices(pricesRef.current)
        pricesRef.current = nextPrices
        setPrices(nextPrices)
        setRates(nextRates)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(load, AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [autoRefresh])

  return {
    prices,
    prevPrices,
    rates,
    error,
    loading,
    refresh: load,
    autoRefresh,
    setAutoRefresh,
  }
}

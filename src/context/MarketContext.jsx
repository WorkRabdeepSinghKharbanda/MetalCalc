import { createContext, useContext, useEffect, useState } from 'react'
import { useMarketData } from '../hooks/useMarketData.js'
import { appendHistory, loadHistory } from '../utils/priceHistory.js'

const MarketContext = createContext(null)

export function MarketProvider({ children }) {
  const market = useMarketData()
  const [currency, setCurrency] = useState('USD')
  const [history, setHistory] = useState(() => loadHistory())

  useEffect(() => {
    if (market.prices) setHistory(appendHistory(market.prices))
  }, [market.prices])

  return (
    <MarketContext.Provider value={{ ...market, currency, setCurrency, history }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  const ctx = useContext(MarketContext)
  if (!ctx) throw new Error('useMarket must be used within MarketProvider')
  return ctx
}

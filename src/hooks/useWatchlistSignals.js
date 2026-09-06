import { useEffect, useRef, useState } from 'react'
import { getMarketChart } from '../crypto/client.js'
import { computeTimeframeSignal } from '../utils/technicalSignals.js'
import { loadSignalState, saveSignalState } from '../utils/signalAlertState.js'

const TIMEFRAME = { days: 2, points: 24 } // ~1 day window, hourly points
const RECHECK_MS = 5 * 60 * 1000
const STAGGER_MS = 1200 // spread sequential CoinGecko calls, stay well under free-tier rate limits

// Watches a crypto watchlist's 1-day technical signal and fires a browser
// notification when a coin's signal *changes* to buy/sell (not on every hold,
// and not on first load — only real transitions). Only runs while this tab is
// open, same limitation as the price alerts on the Alerts page.
export function useWatchlistSignals(coinIds) {
  const [signals, setSignals] = useState({})
  const [updatedAt, setUpdatedAt] = useState(null)
  const stateRef = useRef(loadSignalState())

  useEffect(() => {
    if (coinIds.length === 0) {
      setSignals({})
      return
    }
    let cancelled = false

    async function checkAll() {
      const next = {}
      for (const coinId of coinIds) {
        if (cancelled) return
        try {
          const data = await getMarketChart(coinId, TIMEFRAME.days)
          const prices = (data?.prices ?? []).slice(-TIMEFRAME.points)
          const signal = prices.length > 0 ? computeTimeframeSignal(prices) : null
          next[coinId] = signal
          if (signal && signal.signal !== 'hold') {
            const prevSignal = stateRef.current[coinId]
            if (prevSignal && prevSignal !== signal.signal && Notification?.permission === 'granted') {
              new Notification('MetalCalc signal alert', {
                body: `${coinId}: 1-day signal flipped to ${signal.signal.toUpperCase()} — ${signal.reason}`,
              })
            }
          }
          stateRef.current = { ...stateRef.current, [coinId]: signal?.signal ?? 'hold' }
        } catch {
          next[coinId] = null
        }
        await new Promise((r) => setTimeout(r, STAGGER_MS))
      }
      if (cancelled) return
      saveSignalState(stateRef.current)
      setSignals(next)
      setUpdatedAt(Date.now())
    }

    checkAll()
    const interval = setInterval(checkAll, RECHECK_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinIds.join(',')])

  return { signals, updatedAt }
}

import { useEffect, useRef, useState } from 'react'
import { getMarketChart } from '../crypto/client.js'
import { pctChange } from '../utils/technicalSignals.js'
import { loadMoveAlertState, saveMoveAlertState } from '../utils/moveAlertState.js'

const WINDOW_POINTS = 12 // ~1h window off the days=1 (5-min point) series, same as TIMEFRAMES' '1h' bucket
const RECHECK_MS = 5 * 60 * 1000
const STAGGER_MS = 1200

// Notifies once when a watched coin's 1h % move crosses a threshold, and resets
// (so it can fire again) once the move falls back under the threshold. Only
// runs while this tab is open — same limitation as every other alert here.
export function useWatchlistMoveAlerts(coinIds, thresholdPct) {
  const [moves, setMoves] = useState({})
  const [updatedAt, setUpdatedAt] = useState(null)
  const stateRef = useRef(loadMoveAlertState())

  useEffect(() => {
    if (coinIds.length === 0 || !thresholdPct || thresholdPct <= 0) {
      setMoves({})
      return
    }
    let cancelled = false

    async function checkAll() {
      const next = {}
      for (const coinId of coinIds) {
        if (cancelled) return
        try {
          const data = await getMarketChart(coinId, 1)
          const prices = (data?.prices ?? []).slice(-WINDOW_POINTS)
          const pct = prices.length > 1 ? pctChange(prices.map((p) => p[1])) : null
          next[coinId] = pct
          const wasTriggered = Boolean(stateRef.current[coinId])
          const isTriggered = pct != null && Math.abs(pct) >= thresholdPct
          if (isTriggered && !wasTriggered && Notification?.permission === 'granted') {
            new Notification('MetalCalc move alert', {
              body: `${coinId} moved ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% in the last hour`,
            })
          }
          stateRef.current = { ...stateRef.current, [coinId]: isTriggered }
        } catch {
          next[coinId] = null
        }
        await new Promise((r) => setTimeout(r, STAGGER_MS))
      }
      if (cancelled) return
      saveMoveAlertState(stateRef.current)
      setMoves(next)
      setUpdatedAt(Date.now())
    }

    checkAll()
    const interval = setInterval(checkAll, RECHECK_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinIds.join(','), thresholdPct])

  return { moves, updatedAt }
}

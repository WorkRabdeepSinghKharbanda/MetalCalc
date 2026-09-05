import { useEffect, useRef, useState } from 'react'
import { getQuote, getMetrics } from '../finnhub/client.js'
import { normalizeMetrics, derivePeg } from '../finnhub/normalize.js'
import { RANKING_STOCKS } from '../finnhub/rankingList.js'

const CACHE_KEY = 'metalcalc:stockRankingsCache'
const CACHE_TTL_MS = 10 * 60 * 1000

// 60 curated stocks × 2 calls (quote + metrics) = 120 calls, on a single Finnhub
// free-tier key (60 calls/min) shared by every visitor of this deployed site.
// Fetched in batches of 10 stocks (20 calls) with a 20s gap between batches —
// exactly 60 calls/min sustained, never a burst. Rows are appended batch by
// batch so the table fills in progressively instead of blocking on all 60.
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 20_000

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY))
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.rows
  } catch {
    // ignore malformed cache
  }
  return null
}

function writeCache(rows) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), rows }))
  } catch {
    // sessionStorage full/unavailable — cache is a nicety, not required
  }
}

async function fetchStockRow(stock) {
  try {
    const [quote, rawMetrics] = await Promise.all([
      getQuote(stock.symbol),
      getMetrics(stock.symbol),
    ])
    const metrics = normalizeMetrics(rawMetrics)
    return {
      ...stock,
      price: quote?.c ?? null,
      changePct: quote?.dp ?? null,
      peTTM: metrics.peTTM,
      peg: metrics.pegTTM ?? derivePeg(metrics.peTTM, metrics.epsGrowthYoy),
      epsGrowthYoy: metrics.epsGrowthYoy,
      revenueGrowthYoy: metrics.revenueGrowthYoy,
      week52High: metrics.week52High,
      week52Low: metrics.week52Low,
    }
  } catch {
    return {
      ...stock,
      price: null,
      changePct: null,
      peTTM: null,
      peg: null,
      epsGrowthYoy: null,
      revenueGrowthYoy: null,
      week52High: null,
      week52Low: null,
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useStockRankings() {
  const [rows, setRows] = useState(() => readCache() ?? [])
  const [loading, setLoading] = useState(() => readCache() == null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (readCache() != null) return
    cancelledRef.current = false
    setLoading(true)
    setError(null)

    async function run() {
      const collected = []
      for (let i = 0; i < RANKING_STOCKS.length; i += BATCH_SIZE) {
        if (cancelledRef.current) return
        const batch = RANKING_STOCKS.slice(i, i + BATCH_SIZE)
        setProgress({ done: i, total: RANKING_STOCKS.length })
        const batchRows = await Promise.all(batch.map(fetchStockRow))
        collected.push(...batchRows)
        if (cancelledRef.current) return
        setRows([...collected])
        if (i + BATCH_SIZE < RANKING_STOCKS.length) await sleep(BATCH_DELAY_MS)
      }
      if (cancelledRef.current) return
      setProgress(null)
      setLoading(false)
      writeCache(collected)
    }

    run().catch((e) => {
      if (!cancelledRef.current) {
        setError(e.message)
        setLoading(false)
      }
    })

    return () => {
      cancelledRef.current = true
    }
  }, [])

  return { rows, loading, progress, error }
}

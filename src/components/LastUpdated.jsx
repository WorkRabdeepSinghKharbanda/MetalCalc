import { useEffect, useState } from 'react'

function formatAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(timestamp).toLocaleDateString()
}

// Ticks every second so "Xs ago" stays live without a page refresh.
export default function LastUpdated({ timestamp, prefix = 'Updated' }) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!timestamp) return null
  return (
    <span className="last-updated muted small-note" title={new Date(timestamp).toLocaleString()}>
      {prefix} {formatAgo(timestamp)}
    </span>
  )
}

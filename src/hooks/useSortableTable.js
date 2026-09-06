import { useState } from 'react'

// Generic click-to-sort for any array of plain objects. Nulls always sort last
// regardless of direction, so missing data doesn't jump to the top on desc.
export function useSortableTable(rows, initialKey, initialDir = 'asc') {
  const [sortKey, setSortKey] = useState(initialKey)
  const [sortDir, setSortDir] = useState(initialDir)

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'string' || typeof bv === 'string') {
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    }
    return sortDir === 'asc' ? av - bv : bv - av
  })

  return { sorted, sortKey, sortDir, toggleSort }
}

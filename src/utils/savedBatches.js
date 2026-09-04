const KEY = 'metalcalc:savedBatches'

export function listSavedBatches() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveBatch(name, items) {
  const batches = listSavedBatches()
  batches.push({ id: Date.now(), name, items, savedAt: new Date().toISOString() })
  localStorage.setItem(KEY, JSON.stringify(batches))
  return batches
}

export function deleteBatch(id) {
  const batches = listSavedBatches().filter((b) => b.id !== id)
  localStorage.setItem(KEY, JSON.stringify(batches))
  return batches
}

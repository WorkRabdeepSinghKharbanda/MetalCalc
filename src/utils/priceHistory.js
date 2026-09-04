const KEY = 'metalcalc:priceHistory'
const MAX_POINTS = 200

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function appendHistory(prices) {
  const history = loadHistory()
  history.push({ t: Date.now(), ...prices })
  const trimmed = history.slice(-MAX_POINTS)
  localStorage.setItem(KEY, JSON.stringify(trimmed))
  return trimmed
}

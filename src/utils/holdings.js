const KEY = 'metalcalc:holdings'

export function loadHoldings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveHoldings(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

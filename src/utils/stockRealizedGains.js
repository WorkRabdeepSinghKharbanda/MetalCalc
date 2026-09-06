const KEY = 'metalcalc:stockRealizedGains'

export function loadStockRealizedGains() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveStockRealizedGains(gains) {
  localStorage.setItem(KEY, JSON.stringify(gains))
  return gains
}

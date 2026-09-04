const KEY = 'metalcalc:stockPortfolio'

export function loadPortfolio() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function savePortfolio(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

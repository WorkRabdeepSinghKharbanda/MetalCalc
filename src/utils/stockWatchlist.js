const KEY = 'metalcalc:stockWatchlist'

export function loadWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveWatchlist(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

const KEY = 'metalcalc:cryptoWatchlist'

export function loadCryptoWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveCryptoWatchlist(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

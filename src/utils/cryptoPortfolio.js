const KEY = 'metalcalc:cryptoPortfolio'

export function loadCryptoPortfolio() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveCryptoPortfolio(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  return items
}

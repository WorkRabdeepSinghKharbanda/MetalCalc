const KEY = 'metalcalc:cryptoRealizedGains'

export function loadCryptoRealizedGains() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveCryptoRealizedGains(gains) {
  localStorage.setItem(KEY, JSON.stringify(gains))
  return gains
}

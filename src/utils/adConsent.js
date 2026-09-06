const KEY = 'metalcalc:adConsent'

export function loadAdConsent() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function saveAdConsent(choice) {
  try {
    localStorage.setItem(KEY, choice)
  } catch {
    // localStorage unavailable — consent won't persist across reloads, not fatal
  }
  return choice
}

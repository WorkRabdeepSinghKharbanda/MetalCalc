const KEY = 'metalcalc:priceAlerts'

export function loadAlerts() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveAlerts(alerts) {
  localStorage.setItem(KEY, JSON.stringify(alerts))
  return alerts
}

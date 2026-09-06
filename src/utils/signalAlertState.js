const KEY = 'metalcalc:signalAlertState'

export function loadSignalState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export function saveSignalState(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
  return state
}

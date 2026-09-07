const KEY = 'metalcalc:moveAlertState'

export function loadMoveAlertState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export function saveMoveAlertState(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
  return state
}

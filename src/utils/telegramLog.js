const KEY = 'metalcalc:telegramLog'
const MAX_ENTRIES = 100

export function loadTelegramLog() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function appendTelegramLog(entry) {
  const log = loadTelegramLog()
  log.unshift({ id: crypto.randomUUID(), timestamp: Date.now(), ...entry })
  const trimmed = log.slice(0, MAX_ENTRIES)
  localStorage.setItem(KEY, JSON.stringify(trimmed))
  return trimmed
}

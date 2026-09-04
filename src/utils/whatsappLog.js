const KEY = 'metalcalc:whatsappLog'
const MAX_ENTRIES = 100

export function loadWhatsAppLog() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function appendWhatsAppLog(entry) {
  const log = loadWhatsAppLog()
  log.unshift({ id: crypto.randomUUID(), timestamp: Date.now(), ...entry })
  const trimmed = log.slice(0, MAX_ENTRIES)
  localStorage.setItem(KEY, JSON.stringify(trimmed))
  return trimmed
}

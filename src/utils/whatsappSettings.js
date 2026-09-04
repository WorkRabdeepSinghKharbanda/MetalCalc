const KEY = 'metalcalc:whatsappSettings'

export function loadWhatsAppSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { phoneNumber: '', enabled: false, lastTopPick: null }
  } catch {
    return { phoneNumber: '', enabled: false, lastTopPick: null }
  }
}

export function saveWhatsAppSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
  return settings
}

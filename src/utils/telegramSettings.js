const KEY = 'metalcalc:telegramSettings'

export function loadTelegramSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { chatId: '', enabled: false, lastTopPick: null }
  } catch {
    return { chatId: '', enabled: false, lastTopPick: null }
  }
}

export function saveTelegramSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
  return settings
}

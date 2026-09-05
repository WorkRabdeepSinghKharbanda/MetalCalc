const KEYS = [
  'metalcalc:priceHistory',
  'metalcalc:priceAlerts',
  'metalcalc:holdings',
  'metalcalc:stockPortfolio',
  'metalcalc:stockWatchlist',
  'metalcalc:cryptoPortfolio',
  'metalcalc:cryptoWatchlist',
  'metalcalc:savedBatches',
  'metalcalc:recipes',
  'metalcalc:whatsappSettings',
  'metalcalc:whatsappLog',
]

export function exportBackup() {
  const data = {}
  for (const key of KEYS) {
    const value = localStorage.getItem(key)
    if (value != null) data[key] = value
  }
  return { app: 'metalcalc', version: 1, exportedAt: new Date().toISOString(), data }
}

export function importBackup(backup) {
  if (!backup || typeof backup !== 'object' || !backup.data || typeof backup.data !== 'object') {
    throw new Error('Not a valid MetalCalc backup file')
  }
  let restored = 0
  for (const key of KEYS) {
    const value = backup.data[key]
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
      restored++
    }
  }
  return restored
}

export const GRAMS_PER_TROY_OZ = 31.1034768

export const UNITS = {
  gram: 1,
  oz: GRAMS_PER_TROY_OZ,
  kg: 1000,
  tola: 11.6638038,
  dwt: 1.55517384,
}

export const SYMBOLS = {
  Gold: 'XAU',
  Silver: 'XAG',
  Platinum: 'XPT',
  Palladium: 'XPD',
}

export const METAL_ICONS = {
  Gold: '🥇',
  Silver: '🥈',
  Platinum: '⬜',
  Palladium: '⚪',
}

export const METAL_COLORS = {
  Gold: '#d4af37',
  Silver: '#a8a9ad',
  Platinum: '#8e9aa8',
  Palladium: '#b7a1c9',
}

export const PURITIES = {
  Gold: [
    { label: '24k (.999)', value: 0.999 },
    { label: '22k', value: 0.9167 },
    { label: '18k', value: 0.75 },
    { label: '14k', value: 0.5833 },
    { label: '10k', value: 0.4167 },
  ],
  Silver: [
    { label: '.999 Fine', value: 0.999 },
    { label: '.925 Sterling', value: 0.925 },
    { label: '.900 Coin', value: 0.9 },
  ],
  Platinum: [
    { label: '.999', value: 0.999 },
    { label: '.950', value: 0.95 },
  ],
  Palladium: [
    { label: '.999', value: 0.999 },
    { label: '.950', value: 0.95 },
  ],
}

// pricePerOz: spot price in the target currency, per troy oz
// chargePct: extra % added on top (making charges) or removed (negative, e.g. scrap buyer discount), 0 = none
export function calculateValue(weight, unit, pricePerOz, purity, chargePct = 0) {
  const grams = weight * UNITS[unit]
  const troyOz = grams / GRAMS_PER_TROY_OZ
  const base = troyOz * pricePerOz * purity
  return base * (1 + chargePct / 100)
}

// Inverse of calculateValue: given a target value, how much weight (in `unit`) does it buy?
export function weightForValue(value, unit, pricePerOz, purity, chargePct = 0) {
  const adjustedPricePerOz = pricePerOz * purity * (1 + chargePct / 100)
  if (adjustedPricePerOz <= 0) return 0
  const troyOz = value / adjustedPricePerOz
  const grams = troyOz * GRAMS_PER_TROY_OZ
  return grams / UNITS[unit]
}

import { PURITIES, SYMBOLS, UNITS } from '../calc.js'

const FIELDS = ['name', 'metal', 'weight', 'unit', 'purity', 'makingCharge']

export function encodeBatch(items) {
  const compact = items.map((it) => FIELDS.map((f) => it[f]))
  return btoa(encodeURIComponent(JSON.stringify(compact)))
}

function sanitizeRow(row) {
  const metal = Object.keys(SYMBOLS).includes(row.metal) ? row.metal : 'Gold'
  const validPurities = PURITIES[metal].map((p) => p.value)
  return {
    name: typeof row.name === 'string' ? row.name : '',
    metal,
    weight: Number(row.weight) || 0,
    unit: Object.keys(UNITS).includes(row.unit) ? row.unit : 'gram',
    purity: validPurities.includes(row.purity) ? row.purity : validPurities[0],
    makingCharge: Number(row.makingCharge) || 0,
  }
}

export function decodeBatch(encoded) {
  try {
    const compact = JSON.parse(decodeURIComponent(atob(encoded)))
    if (!Array.isArray(compact)) return null
    return compact
      .map((row) => Object.fromEntries(FIELDS.map((f, i) => [f, row[i]])))
      .map(sanitizeRow)
  } catch {
    return null
  }
}

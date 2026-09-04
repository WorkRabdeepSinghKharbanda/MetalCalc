import assert from 'node:assert/strict'
import { encodeBatch, decodeBatch } from '../src/utils/batchShare.js'

const items = [
  { name: 'Ring', metal: 'Gold', weight: 5, unit: 'gram', purity: 0.75, makingCharge: 10 },
  { name: '', metal: 'Silver', weight: 1, unit: 'oz', purity: 0.925, makingCharge: 0 },
]

const encoded = encodeBatch(items)
const decoded = decodeBatch(encoded)
assert.deepEqual(decoded, items)

// garbage input decodes to null instead of throwing
assert.equal(decodeBatch('not-valid-base64!!'), null)

console.log('batchShare.js checks passed')

import assert from 'node:assert'
import { computeDiversificationScore } from '../src/utils/diversification.js'

// Even split across 3 -> high score
assert.ok(computeDiversificationScore([100, 100, 100]).score >= 90)

// All in one -> 0
assert.strictEqual(computeDiversificationScore([100, 0, 0]).score, 0)

// Skewed but 2 categories present -> somewhere in between, lower than even split
const skewed = computeDiversificationScore([90, 10, 0]).score
const even = computeDiversificationScore([50, 50, 0]).score
assert.ok(skewed < even)

// No data -> null, never crash
assert.strictEqual(computeDiversificationScore([0, 0, 0]), null)
assert.strictEqual(computeDiversificationScore([]), null)

console.log('check-diversification.mjs: all assertions passed')

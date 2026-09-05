import assert from 'node:assert'
import { computePositionSize } from '../src/utils/positionSize.js'

// $10,000 account, risk 1% ($100), entry $50, stop $48 -> risk $2/share -> 50 shares
const r1 = computePositionSize(10000, 1, 50, 48)
assert.strictEqual(r1.riskAmount, 100)
assert.strictEqual(r1.shares, 50)
assert.strictEqual(r1.positionValue, 2500)
assert.strictEqual(r1.pctOfAccount, 25)

// Zero-width stop (entry === stop) must not divide by zero
const r2 = computePositionSize(10000, 1, 50, 50)
assert.strictEqual(r2.shares, 0)
assert.strictEqual(r2.positionValue, 0)

console.log('positionSize.js checks passed')

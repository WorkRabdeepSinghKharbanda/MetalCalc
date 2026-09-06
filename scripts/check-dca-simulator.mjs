import assert from 'node:assert'
import { simulateDca } from '../src/utils/dcaSimulator.js'

const DAY = 24 * 60 * 60 * 1000

// Flat price series: 10 daily points at price 100
const flat = Array.from({ length: 10 }, (_, i) => [i * DAY, 100])
{
  const r = simulateDca(flat, 50, 1)
  assert.ok(r.buys.length >= 9 && r.buys.length <= 11)
  assert.strictEqual(r.gain, 0) // flat price -> no gain
  assert.strictEqual(r.finalPrice, 100)
}

// Rising price series: price doubles from 50 to 100 -> DCA should show a gain
const rising = Array.from({ length: 10 }, (_, i) => [i * DAY, 50 + i * 5.5])
{
  const r = simulateDca(rising, 50, 2)
  assert.ok(r.gain > 0)
  assert.ok(r.totalInvested > 0)
  assert.ok(r.avgBuyPrice < r.finalPrice) // bought below final price on average
}

// Invalid inputs never crash
assert.strictEqual(simulateDca([], 50, 7), null)
assert.strictEqual(simulateDca(flat, 0, 7), null)
assert.strictEqual(simulateDca(flat, 50, 0), null)
assert.strictEqual(simulateDca(null, 50, 7), null)

console.log('check-dca-simulator.mjs: all assertions passed')

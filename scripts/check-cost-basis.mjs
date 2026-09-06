import assert from 'node:assert'
import { sellLot } from '../src/utils/costBasis.js'

const lot = { id: 'a', symbol: 'AAPL', qty: 10, avgBuy: 100 }

// Full sell at a gain
{
  const { remainingLot, gainEntry } = sellLot(lot, 10, 150)
  assert.strictEqual(remainingLot, null)
  assert.strictEqual(gainEntry.gain, 500)
  assert.strictEqual(gainEntry.qty, 10)
}

// Partial sell at a loss
{
  const { remainingLot, gainEntry } = sellLot(lot, 4, 80)
  assert.strictEqual(remainingLot.qty, 6)
  assert.strictEqual(gainEntry.gain, -80)
}

// Sell qty clamps to lot size, never oversells
{
  const { remainingLot, gainEntry } = sellLot(lot, 999, 150)
  assert.strictEqual(remainingLot, null)
  assert.strictEqual(gainEntry.qty, 10)
}

// Invalid inputs never crash, return null
assert.strictEqual(sellLot(lot, 0, 150), null)
assert.strictEqual(sellLot(lot, 5, 0), null)
assert.strictEqual(sellLot(lot, -5, 150), null)
assert.strictEqual(sellLot(lot, 5, -10), null)

console.log('check-cost-basis.mjs: all assertions passed')

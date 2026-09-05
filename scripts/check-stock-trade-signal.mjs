import assert from 'node:assert'
import { computeStockSignal } from '../src/utils/stockTradeSignal.js'

// Strong buy: cheap PEG, strong growth, near 52w low
const buy = computeStockSignal({
  price: 105, week52Low: 100, week52High: 200, changePct: 1,
  peg: 0.8, epsGrowthYoy: 25, revenueGrowthYoy: 20,
})
assert.strictEqual(buy.signal, 'buy')

// Strong sell: expensive PEG, declining growth, near 52w high, rallying today
const sell = computeStockSignal({
  price: 195, week52Low: 100, week52High: 200, changePct: 5,
  peg: 4, epsGrowthYoy: -10, revenueGrowthYoy: -5,
})
assert.strictEqual(sell.signal, 'sell')

// No strong factors either way -> hold
const hold = computeStockSignal({
  price: 150, week52Low: 100, week52High: 200, changePct: 0.5,
  peg: 1.8, epsGrowthYoy: 5, revenueGrowthYoy: 5,
})
assert.strictEqual(hold.signal, 'hold')

// Missing all data -> hold, explicit reason, no crash
const noData = computeStockSignal({ price: null, week52Low: null, week52High: null, changePct: null, peg: null, epsGrowthYoy: null, revenueGrowthYoy: null })
assert.strictEqual(noData.signal, 'hold')
assert.strictEqual(noData.reason, 'Not enough data')

console.log('stockTradeSignal.js checks passed')

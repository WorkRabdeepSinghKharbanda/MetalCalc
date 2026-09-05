import assert from 'node:assert'
import { sma, rsi, pctChange, computeTimeframeSignal } from '../src/utils/technicalSignals.js'

// sma
assert.strictEqual(sma([1, 2, 3, 4], 2), 3.5)
assert.strictEqual(sma([1, 2], 5), null)

// rsi: strictly increasing series -> no losses -> RSI 100
const upSeries = Array.from({ length: 20 }, (_, i) => 100 + i)
assert.strictEqual(rsi(upSeries, 14), 100)

// rsi: strictly decreasing series -> no gains -> RSI 0
const downSeries = Array.from({ length: 20 }, (_, i) => 100 - i)
assert.strictEqual(rsi(downSeries, 14), 0)

// rsi: not enough points -> null, no crash
assert.strictEqual(rsi([1, 2, 3], 14), null)

// pctChange
assert.strictEqual(pctChange([100, 110]), 10)
assert.strictEqual(pctChange([100]), null)

// Realistic uptrend: strong early ramp, then oscillating (balanced gains/losses)
// tail so RSI reads neutral (~50) instead of a monotonic series' unrealistic 100 —
// momentum and SMA crossover still clearly bullish overall.
function rampThenOscillate(start, rampStep, oscAmplitude) {
  const ramp = Array.from({ length: 12 }, (_, i) => start + i * rampStep)
  const osc = []
  let last = ramp[ramp.length - 1]
  for (let i = 0; i < 14; i++) {
    last += i % 2 === 0 ? oscAmplitude : -oscAmplitude
    osc.push(last)
  }
  return [...ramp, ...osc]
}

const uptrendPoints = rampThenOscillate(100, 7, 3).map((price, i) => [i, price])
const buySignal = computeTimeframeSignal(uptrendPoints)
assert.strictEqual(buySignal.signal, 'buy')

const downtrendPoints = rampThenOscillate(200, -7, -3).map((price, i) => [i, price])
const sellSignal = computeTimeframeSignal(downtrendPoints)
assert.strictEqual(sellSignal.signal, 'sell')

// Flat series -> hold
const flatPoints = Array.from({ length: 20 }, (_, i) => [i, 100])
assert.strictEqual(computeTimeframeSignal(flatPoints).signal, 'hold')

// Too few points -> hold, explicit reason, no crash
const thin = computeTimeframeSignal([[0, 100], [1, 101]])
assert.strictEqual(thin.signal, 'hold')
assert.strictEqual(thin.reason, 'Not enough data')

// Empty input -> no crash
assert.strictEqual(computeTimeframeSignal([]).signal, 'hold')

console.log('technicalSignals.js checks passed')

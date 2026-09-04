import assert from 'node:assert/strict'
import { calculateValue, weightForValue, GRAMS_PER_TROY_OZ, UNITS } from '../src/calc.js'

// 1 troy oz of pure (purity=1) metal at price P should equal P
assert.equal(calculateValue(1, 'oz', 2000, 1), 2000)

// 1 gram converts correctly
assert.ok(Math.abs(calculateValue(1, 'gram', 2000, 1) - 2000 / GRAMS_PER_TROY_OZ) < 1e-9)

// 1 kg = 1000g
assert.equal(calculateValue(1, 'kg', 1, 1), calculateValue(1000, 'gram', 1, 1))

// purity scales linearly
assert.equal(calculateValue(1, 'oz', 2000, 0.5), 1000)

// zero weight = zero value
assert.equal(calculateValue(0, 'oz', 2000, 1), 0)

// making charges add a percentage on top
assert.equal(calculateValue(1, 'oz', 2000, 1, 10), 2200)
assert.equal(calculateValue(1, 'oz', 2000, 1, 0), 2000)

// negative charge = deduction (scrap buyer discount)
assert.equal(calculateValue(1, 'oz', 2000, 1, -10), 1800)

// tola and dwt convert against the known gram constant
assert.ok(Math.abs(calculateValue(1, 'tola', 2000, 1) - calculateValue(11.6638038, 'gram', 2000, 1)) < 1e-9)
assert.ok(Math.abs(calculateValue(1, 'dwt', 2000, 1) - calculateValue(1.55517384, 'gram', 2000, 1)) < 1e-9)

// weightForValue is the inverse of calculateValue
for (const unit of Object.keys(UNITS)) {
  const weight = 3
  const value = calculateValue(weight, unit, 2000, 0.75, 5)
  const backOut = weightForValue(value, unit, 2000, 0.75, 5)
  assert.ok(Math.abs(backOut - weight) < 1e-9, `weightForValue round-trip failed for ${unit}`)
}

console.log('calc.js checks passed')

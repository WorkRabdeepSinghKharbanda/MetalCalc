import assert from 'node:assert'
import { sameDirectionPct } from '../src/utils/correlation.js'

const DAY = 24 * 60 * 60 * 1000
const day = (i) => Date.UTC(2026, 0, 1 + i)

// Perfectly matching direction -> 100%
{
  const a = [[day(0), 100], [day(1), 110], [day(2), 105], [day(3), 120]]
  const b = [[day(0), 50], [day(1), 55], [day(2), 52], [day(3), 60]]
  assert.strictEqual(sameDirectionPct(a, b), 100)
}

// Perfectly opposite direction -> 0%
{
  const a = [[day(0), 100], [day(1), 110], [day(2), 105]]
  const b = [[day(0), 50], [day(1), 45], [day(2), 48]]
  assert.strictEqual(sameDirectionPct(a, b), 0)
}

// Too few overlapping days -> null, never crash
assert.strictEqual(sameDirectionPct([[day(0), 100]], [[day(0), 50]]), null)
assert.strictEqual(sameDirectionPct([], []), null)

console.log('check-correlation.mjs: all assertions passed')

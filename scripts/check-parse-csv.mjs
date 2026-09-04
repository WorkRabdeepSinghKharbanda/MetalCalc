import assert from 'node:assert/strict'
import { parseCsv } from '../src/utils/parseCsv.js'

assert.deepEqual(parseCsv('a,b,c'), [['a', 'b', 'c']])
assert.deepEqual(parseCsv('"Wedding ring",Gold,5'), [['Wedding ring', 'Gold', '5']])
assert.deepEqual(parseCsv('"He said ""hi""",Gold'), [['He said "hi"', 'Gold']])
assert.deepEqual(parseCsv('a,b\nc,d'), [['a', 'b'], ['c', 'd']])
assert.deepEqual(parseCsv('"a,b",c'), [['a,b', 'c']])

console.log('parseCsv.js checks passed')

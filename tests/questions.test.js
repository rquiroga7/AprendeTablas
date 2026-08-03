import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateQuestions } from '../src/utils/questions.js'

const POOL_SIZES = { '1-3': 27, '4-6': 27, '7-9': 27, all: 81 }

test('pool covers the whole set without repetitions', () => {
  for (const [mode, size] of Object.entries(POOL_SIZES)) {
    const qs = generateQuestions(mode, size)
    assert.equal(qs.length, size, `${mode} length`)
    const unique = new Set(qs.map(q => `${q.a}x${q.b}`))
    assert.equal(unique.size, size, `${mode} must not repeat`)
  }
})

test('no repetitions when asking 20 from any mode', () => {
  for (const mode of Object.keys(POOL_SIZES)) {
    const qs = generateQuestions(mode, 20)
    const unique = new Set(qs.map(q => `${q.a}x${q.b}`))
    assert.equal(unique.size, qs.length, `${mode} duplicates at count 20`)
  }
})

test('operands stay within mode range', () => {
  const ranges = { '1-3': [1, 3], '4-6': [4, 6], '7-9': [7, 9], all: [1, 9] }
  for (const [mode, [lo, hi]] of Object.entries(ranges)) {
    const qs = generateQuestions(mode, 30)
    for (const q of qs) {
      assert.ok(q.a >= lo && q.a <= hi, `${mode} a=${q.a}`)
      assert.ok(q.b >= 1 && q.b <= 9, `${mode} b=${q.b}`)
    }
  }
})

test('products are correct', () => {
  for (const q of generateQuestions('all', 60)) {
    assert.equal(q.product, q.a * q.b)
  }
})

test('order differs between draws', () => {
  const key = (qs) => qs.map(q => q.a * 10 + q.b).join(',')
  const a = key(generateQuestions('1-3', 27))
  const b = key(generateQuestions('1-3', 27))
  assert.notEqual(a, b)
})

test('drops the 1s table from level 3 onward in 1-3 and all modes', () => {
  // Levels 1-2 (index 0 and 1) keep the 1s table.
  for (const idx of [0, 1]) {
    const qs13 = generateQuestions('1-3', 27, idx)
    assert.ok(qs13.some(q => q.a === 1), `1-3 keeps 1s at level ${idx + 1}`)
    const qsAll = generateQuestions('all', 81, idx)
    assert.ok(qsAll.some(q => q.a === 1), `all keeps 1s at level ${idx + 1}`)
  }
  // Level 3+ (index >= 2) drop the 1s table.
  for (const idx of [2, 3, 7]) {
    const qs13 = generateQuestions('1-3', 20, idx)
    assert.ok(qs13.every(q => q.a !== 1), `1-3 drops 1s at level ${idx + 1}`)
    const qsAll = generateQuestions('all', 20, idx)
    assert.ok(qsAll.every(q => q.a !== 1), `all drops 1s at level ${idx + 1}`)
  }
})

test('repeats from the pool when it is smaller than the request', () => {
  // 1-3 without the 1s table has only 18 combinations; asking for 20 repeats.
  const qs = generateQuestions('1-3', 20, 2)
  assert.equal(qs.length, 20)
  const unique = new Set(qs.map(q => `${q.a}x${q.b}`))
  assert.ok(unique.size < 20, 'must repeat when pool is smaller')
})

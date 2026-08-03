import { test } from 'node:test'
import assert from 'node:assert/strict'
import { levelParams, LEVEL_COUNT, MULTIPLICATIONS, MODES, getMode, formatClock } from '../src/data/levels.js'

test('8 levels and multiplication counts', () => {
  assert.equal(LEVEL_COUNT, 8)
  assert.deepEqual(MULTIPLICATIONS, [6, 8, 10, 12, 14, 16, 18, 20])
})

test('level 1 params', () => {
  const p = levelParams(0)
  assert.equal(p.level, 1)
  assert.equal(p.count, 6)
  assert.equal(p.x, 7)
  assert.equal(p.y, 13)
  assert.equal(p.total, 78)
})

test('level 8 params', () => {
  const p = levelParams(7)
  assert.equal(p.level, 8)
  assert.equal(p.count, 20)
  assert.equal(p.x, 4)
  assert.equal(p.y, 6)
  assert.equal(p.total, 120)
})

test('x and y decrease monotonically (non-increasing)', () => {
  let prevX = Infinity
  let prevY = Infinity
  for (let i = 0; i < LEVEL_COUNT; i++) {
    const p = levelParams(i)
    assert.ok(p.x <= prevX, `x must not increase at level ${i + 1}`)
    assert.ok(p.y < prevY, `y must decrease at level ${i + 1}`)
    prevX = p.x
    prevY = p.y
  }
  assert.ok(Math.abs(levelParams(0).x - 7) < 1e-9)
  assert.ok(Math.abs(levelParams(0).y - 13) < 1e-9)
  assert.ok(Math.abs(levelParams(7).x - 4) < 1e-9)
  assert.ok(Math.abs(levelParams(7).y - 6) < 1e-9)
})

test('times are whole seconds (integers)', () => {
  for (let i = 0; i < LEVEL_COUNT; i++) {
    const p = levelParams(i)
    assert.ok(Number.isInteger(p.x), `x must be integer at level ${i + 1}`)
    assert.ok(Number.isInteger(p.y), `y must be integer at level ${i + 1}`)
    assert.ok(Number.isInteger(p.total), `total must be integer at level ${i + 1}`)
  }
})

test('total = count * y for every level', () => {
  for (let i = 0; i < LEVEL_COUNT; i++) {
    const p = levelParams(i)
    assert.ok(Math.abs(p.total - p.count * p.y) < 1e-6, `level ${i + 1}`)
  }
})

test('level index clamped', () => {
  assert.equal(levelParams(-3).level, 1)
  assert.equal(levelParams(99).level, 8)
})

test('formatClock', () => {
  assert.equal(formatClock(48000), '0:48')
  assert.equal(formatClock(59400), '1:00')
  assert.equal(formatClock(0), '0:00')
  assert.equal(formatClock(-500), '0:00')
})

test('modes', () => {
  assert.equal(MODES.length, 4)
  assert.equal(getMode('1-3').min, 1)
  assert.equal(getMode('1-3').max, 3)
  assert.equal(getMode('4-6').min, 4)
  assert.equal(getMode('4-6').max, 6)
  assert.equal(getMode('7-9').min, 7)
  assert.equal(getMode('7-9').max, 9)
  assert.equal(getMode('all').min, 1)
  assert.equal(getMode('all').max, 9)
})

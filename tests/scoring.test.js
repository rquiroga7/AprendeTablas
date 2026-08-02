import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pointsForTime, levelMaxScore, gameMaxScore } from '../src/utils/scoring.js'

test('full points at or under x', () => {
  assert.equal(pointsForTime(0, 4, 8), 10)
  assert.equal(pointsForTime(3.99, 4, 8), 10)
  assert.equal(pointsForTime(4, 4, 8), 10)
})

test('linear midpoint gives half points', () => {
  assert.equal(pointsForTime(6, 4, 8), 5)
  assert.equal(pointsForTime(3, 2, 4), 5)
})

test('zero points at or beyond y', () => {
  assert.equal(pointsForTime(8, 4, 8), 0)
  assert.equal(pointsForTime(12, 4, 8), 0)
  assert.equal(pointsForTime(4, 2, 4), 0)
})

test('monotonically non-increasing', () => {
  let prev = Infinity
  for (let t = 0; t <= 80; t += 0.5) {
    const p = pointsForTime(t, 4, 8)
    assert.ok(p <= prev, `points increased at t=${t}`)
    assert.ok(p >= 0 && p <= 10, `points out of range at t=${t}`)
    prev = p
  }
})

test('level windows match config', () => {
  // Level 1: x=4, y=8
  assert.equal(pointsForTime(4, 4, 8), 10)
  assert.equal(pointsForTime(8, 4, 8), 0)
  // Level 8: x=2, y=4
  assert.equal(pointsForTime(2, 2, 4), 10)
  assert.equal(pointsForTime(4, 2, 4), 0)
})

test('levelMaxScore', () => {
  assert.equal(levelMaxScore(6), 60)
  assert.equal(levelMaxScore(20), 200)
})

test('gameMaxScore is the last level max (20 questions)', () => {
  assert.equal(gameMaxScore(), 200)
})

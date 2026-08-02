import { test } from 'node:test'
import assert from 'node:assert/strict'
import { updateModeStats, createModeStats, getModeStatsSafe } from '../src/utils/stats.js'

test('records a round', () => {
  const stats = {}
  updateModeStats(stats, '1-3', 0, 50, 60)
  const m = stats['1-3']
  assert.equal(m.last, 50)
  assert.equal(m.lastMax, 60)
  assert.equal(m.lastLevel, 0)
  assert.equal(m.best, 50)
  assert.equal(m.levels[0].plays, 1)
  assert.equal(m.levels[0].best, 50)
  assert.equal(m.levels[0].last, 50)
})

test('keeps best across plays', () => {
  const stats = {}
  updateModeStats(stats, '4-6', 0, 30, 80)
  updateModeStats(stats, '4-6', 0, 60, 80)
  assert.equal(stats['4-6'].best, 60)
  assert.equal(stats['4-6'].last, 60)
  assert.equal(stats['4-6'].levels[0].best, 60)
  assert.equal(stats['4-6'].levels[0].plays, 2)
})

test('tracks best rank index', () => {
  const stats = {}
  updateModeStats(stats, 'all', 0, 20, 200)   // 20/200 = 10% → Bronce II (idx 1)
  updateModeStats(stats, 'all', 0, 180, 200)  // 180/200 = 90% → Campeón (idx 10)
  assert.equal(stats['all'].bestRankIdx, 10)
  assert.equal(stats['all'].levels[0].bestRankIdx, 10)
})

test('separates stats by level', () => {
  const stats = {}
  updateModeStats(stats, 'all', 0, 40, 60)
  updateModeStats(stats, 'all', 3, 90, 120)
  assert.equal(stats['all'].levels[0].plays, 1)
  assert.equal(stats['all'].levels[3].plays, 1)
  assert.equal(stats['all'].levels[3].best, 90)
})

test('getModeStatsSafe returns empty stats for unknown mode', () => {
  const empty = getModeStatsSafe({}, 'nope')
  assert.equal(empty.best, 0)
  assert.equal(empty.bestRankIdx, -1)
  assert.deepEqual(createModeStats().levels, {})
  assert.equal(createModeStats().best, 0)
})

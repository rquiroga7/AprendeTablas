import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getRankIndex, getRank, RANKS } from '../src/utils/ranks.js'

test('ranks list has expected shape', () => {
  assert.equal(RANKS.length, 13)
  assert.equal(RANKS[0].name, 'Bronce I')
  assert.equal(RANKS[12].name, 'Leyenda Supersónica')
})

test('threshold boundaries', () => {
  assert.equal(getRankIndex(4, 100), 0)      // < 5%  → Bronce I
  assert.equal(getRankIndex(5, 100), 1)      // ≥ 5%  → Bronce II
  assert.equal(getRankIndex(20, 100), 2)     // ≥ 20% → Bronce III
  assert.equal(getRankIndex(47, 100), 4)     // ≥ 47% → Plata II
  assert.equal(getRankIndex(86, 100), 9)     // ≥ 86% → Diamante
  assert.equal(getRankIndex(90, 100), 10)    // ≥ 90% → Campeón
  assert.equal(getRankIndex(96, 100), 12)    // ≥ 96% → Leyenda Supersónica
  assert.equal(getRankIndex(100, 100), 12)
})

test('invalid maxScore returns no rank', () => {
  assert.equal(getRankIndex(10, 0), -1)
  assert.equal(getRankIndex(0, 0), -1)
  assert.equal(getRank(0, 0), null)
})

test('getRank returns matching entry', () => {
  assert.equal(getRank(50, 100).name, 'Plata II')
  assert.equal(getRank(81, 100).name, 'Oro III')
  assert.equal(getRank(2, 100).name, 'Bronce I')
})

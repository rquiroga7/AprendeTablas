import { getRankIndex } from './ranks.js'
import { gameMaxScore } from './scoring.js'

const STATS_KEY = 'aprendeTablas_stats'

export function createModeStats() {
  return {
    best: 0,
    maxPossible: 0,
    bestRankIdx: -1,
    last: 0,
    lastMax: 0,
    lastLevel: 0,
    levels: {},
  }
}

export function getModeStatsSafe(stats, modeKey) {
  return stats[modeKey] || createModeStats()
}

export function updateModeStats(stats, modeKey, levelIndex, score, maxScore) {
  if (!stats[modeKey]) stats[modeKey] = createModeStats()
  const m = stats[modeKey]

  m.last = score
  m.lastMax = maxScore
  m.lastLevel = levelIndex

  const rankIdx = getRankIndex(score, gameMaxScore())
  if (rankIdx > m.bestRankIdx) m.bestRankIdx = rankIdx
  if (score > m.best) {
    m.best = score
    m.maxPossible = maxScore
  }

  const lv = m.levels[levelIndex] || { best: 0, max: 0, bestRankIdx: -1, last: 0, plays: 0 }
  lv.plays += 1
  lv.last = score
  lv.max = maxScore
  if (score > lv.best) lv.best = score
  const lvRank = getRankIndex(score, gameMaxScore())
  if (lvRank > lv.bestRankIdx) lv.bestRankIdx = lvRank
  m.levels[levelIndex] = lv

  return m
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    return {}
  }
  return {}
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

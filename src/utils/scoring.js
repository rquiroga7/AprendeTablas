import { levelParams, LEVEL_COUNT } from '../data/levels.js'

export function pointsForTime(t, x, y) {
  if (t <= x) return 10
  if (t >= y) return 0
  return Math.round(10 * ((y - t) / (y - x)))
}

export function levelMaxScore(count) {
  return count * 10
}

// Maximum score achievable in an entire game: only the last level has
// enough questions to reach this, so the top ranks (e.g. Leyenda
// Supersónica, 96% of this) are only attainable on the last level.
export function gameMaxScore() {
  return levelMaxScore(levelParams(LEVEL_COUNT - 1).count)
}

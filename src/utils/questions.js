import { getMode } from '../data/levels.js'

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// From level 3 onward (levelIndex >= 2), the 1's table is dropped from the
// 1-3 and all (1-9) modes, since multiplying by 1 is too easy to drill.
function buildPool(mode, levelIndex) {
  const dropOnes = levelIndex >= 2 && (mode.key === '1-3' || mode.key === 'all')
  const pool = []
  for (let t = mode.min; t <= mode.max; t++) {
    if (dropOnes && t === 1) continue
    for (let f = 1; f <= 9; f++) {
      pool.push({ a: t, b: f, product: t * f })
    }
  }
  return pool
}

function sampleWithRepetition(pool, count) {
  const questions = []
  while (questions.length < count) {
    for (const q of shuffleArray(pool)) {
      if (questions.length >= count) break
      questions.push(q)
    }
  }
  return questions
}

export function generateQuestions(modeKey, count, levelIndex = 0) {
  const mode = getMode(modeKey)
  const pool = buildPool(mode, levelIndex)
  if (pool.length >= count) {
    return shuffleArray(pool).slice(0, count)
  }
  return sampleWithRepetition(pool, count)
}

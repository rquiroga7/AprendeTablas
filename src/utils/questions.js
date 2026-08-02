import { getMode } from '../data/levels.js'

export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateQuestions(modeKey, count) {
  const mode = getMode(modeKey)
  const pool = []
  for (let t = mode.min; t <= mode.max; t++) {
    for (let f = 1; f <= 9; f++) {
      pool.push({ a: t, b: f, product: t * f })
    }
  }
  return shuffleArray(pool).slice(0, count)
}

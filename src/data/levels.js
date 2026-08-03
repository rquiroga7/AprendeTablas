export const MODES = [
  { key: '1-3', label: 'Tablas 1–3', min: 1, max: 3, icon: '🌱' },
  { key: '4-6', label: 'Tablas 4–6', min: 4, max: 6, icon: '🌿' },
  { key: '7-9', label: 'Tablas 7–9', min: 7, max: 9, icon: '🌳' },
  { key: 'all', label: 'Todas las tablas', min: 1, max: 9, icon: '🎯' },
]

export function getMode(key) {
  return MODES.find(m => m.key === key) || MODES[0]
}

export const LEVEL_COUNT = 8
export const MULTIPLICATIONS = [6, 8, 10, 12, 14, 16, 18, 20]

// Seconds for full points (x) and before points hit zero (y), per level.
// Level 1 is generous (6 s / 12 s) and windows tighten as levels go up.
// All times are whole seconds. The values come from the original linear
// curve (6→2 s for x, 12→4 s for y) with the final level's x raised by
// 0.5 s (2 → 2.5, rounded to 3) so level 8 isn't too punishing, then all
// times rounded to integers.
const X_SECONDS = [6, 6, 5, 5, 4, 4, 3, 3]
const Y_SECONDS = [12, 11, 10, 9, 8, 7, 6, 5]

export function levelParams(levelIndex) {
  const idx = Math.min(Math.max(levelIndex, 0), LEVEL_COUNT - 1)
  const count = MULTIPLICATIONS[idx]
  const x = X_SECONDS[idx]
  const y = Y_SECONDS[idx]
  const total = count * y
  return { level: idx + 1, index: idx, count, x, y, total }
}

export function formatClock(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

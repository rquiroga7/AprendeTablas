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

export function levelParams(levelIndex) {
  const idx = Math.min(Math.max(levelIndex, 0), LEVEL_COUNT - 1)
  const count = MULTIPLICATIONS[idx]
  const span = LEVEL_COUNT - 1
  // Level 1 is generous (6 s for full points, 12 s before zero); the
  // window shrinks linearly down to level 8 (2 s / 4 s), which stays as is.
  const x = +(6 - idx * (4 / span)).toFixed(3)
  const y = +(12 - idx * (8 / span)).toFixed(3)
  const total = +(count * y).toFixed(3)
  return { level: idx + 1, index: idx, count, x, y, total }
}

export function formatClock(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

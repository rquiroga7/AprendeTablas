import { useState, useEffect } from 'react'
import { MODES } from '../data/levels'
import { RANKS } from '../utils/ranks'
import { loadStats, getModeStatsSafe } from '../utils/stats'

const ACCENTS = {
  '1-3': 'teal',
  '4-6': 'amber',
  '7-9': 'coral',
  all: 'violet',
}

function renderRank(rankIdx) {
  if (rankIdx < 0 || rankIdx >= RANKS.length) return '—'
  const rank = RANKS[rankIdx]
  return `${rank.icon} ${rank.name}`
}

function Menu({ onSelectMode }) {
  const [stats, setStats] = useState(loadStats)

  useEffect(() => {
    const handler = () => setStats(loadStats())
    window.addEventListener('storage', handler)
    const interval = setInterval(handler, 500)
    return () => { window.removeEventListener('storage', handler); clearInterval(interval) }
  }, [])

  return (
    <div className="menu">
      <div className="menu-marquee">
        <div className="menu-eyebrow">Arcade de aritmética</div>
        <h1 className="menu-title">
          <span className="t-word">Aprende</span>
          <span className="t-times">×</span>
          <span className="t-word t-accent">Tablas</span>
        </h1>
        <p className="menu-subtitle">
          Resolvé la mayor cantidad de cuentas antes de que se acabe el tiempo. ¡Respondé rápido para sumar más puntos!
        </p>
      </div>

      <div className="mode-grid">
        {MODES.map((mode) => {
          const ms = getModeStatsSafe(stats, mode.key)
          return (
            <button
              key={mode.key}
              className={`mode-card accent-${ACCENTS[mode.key]}`}
              onClick={() => onSelectMode(mode.key)}
            >
              <div className="mode-range">
                {mode.icon} <span>{mode.min}–{mode.max}</span>
              </div>
              <h3>{mode.label}</h3>
              <div className="mode-stats">
                <div className="mode-stat">
                  <span className="stat-label">Mejor rango</span>
                  <span className="stat-value">{renderRank(ms.bestRankIdx)}</span>
                </div>
                <div className="mode-stat">
                  <span className="stat-label">Última partida</span>
                  <span className="stat-value">{ms.last > 0 ? `${ms.last}/${ms.lastMax} pts` : 'Sin jugar'}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="menu-foot">
        8 niveles · de 6 a 20 cuentas por nivel · el tiempo baja de nivel en nivel
      </p>
    </div>
  )
}

export default Menu

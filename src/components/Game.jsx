import { useState, useEffect, useRef, useCallback } from 'react'
import { getMode, levelParams, LEVEL_COUNT, MULTIPLICATIONS, formatClock } from '../data/levels.js'
import { generateQuestions } from '../utils/questions.js'
import { pointsForTime, levelMaxScore, gameMaxScore } from '../utils/scoring.js'
import { getRank } from '../utils/ranks.js'
import sound from '../utils/sound.js'
import fireworks from '../utils/fireworks.js'
import Calculator from './Calculator'

const LEVEL_ICONS = ['🌱', '🌿', '🌳', '🏔️', '🎓', '⭐', '👑', '🏆']

const CORRECT_PAUSE = 900
const TIMEOUT_PAUSE = 1200
const WRONG_PAUSE = 350
const MAX_TICK_DELTA = 2000

export default function Game({ modeKey, onBack, onRoundEnd }) {
  const mode = getMode(modeKey)

  const [levelIndex, setLevelIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [roundScore, setRoundScore] = useState(0)
  const [solvedCount, setSolvedCount] = useState(0)
  const [globalRemaining, setGlobalRemaining] = useState(0)
  const [status, setStatus] = useState('loading')
  const [feedback, setFeedback] = useState(null)
  const [flash, setFlash] = useState('')
  const [resultData, setResultData] = useState(null)
  const [roundToken, setRoundToken] = useState(0)

  const questionsRef = useRef([])
  const currentIndexRef = useRef(0)
  const levelIndexRef = useRef(0)
  const qParamsRef = useRef({ x: 4, y: 8 })
  const roundScoreRef = useRef(0)
  const solvedCountRef = useRef(0)
  const wrongCountRef = useRef(0)
  const timeoutCountRef = useRef(0)
  const globalRemainingRef = useRef(0)
  const qRemainingRef = useRef(0)
  const qStartRef = useRef(0)
  const statusRef = useRef('loading')
  const lastTickRef = useRef(0)
  const timeoutsRef = useRef([])

  const schedule = useCallback((ms, fn) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(t => t !== id)
      fn()
    }, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const clearSchedules = useCallback(() => {
    timeoutsRef.current.forEach(id => clearTimeout(id))
    timeoutsRef.current = []
  }, [])

  const finishRound = useCallback((reason) => {
    const params = levelParams(levelIndexRef.current)
    const total = params.count
    const max = levelMaxScore(total)
    const score = roundScoreRef.current
    const isMaxLevel = levelIndexRef.current >= LEVEL_COUNT - 1

    let levelResult = 'fail'
    if (score >= max * 0.8) {
      levelResult = 'pass'
      fireworks.launchLoop()
      sound.playVictory()
    } else if (score >= max * 0.5) {
      levelResult = 'good'
    }

    statusRef.current = 'done'
    setStatus('done')
    setResultData({
      score,
      max,
      total,
      level: levelIndexRef.current + 1,
      levelResult,
      isMaxLevel,
      solved: solvedCountRef.current,
      wrong: wrongCountRef.current,
      timeouts: timeoutCountRef.current,
      reason,
    })
    onRoundEnd(modeKey, levelIndexRef.current, score, max)
  }, [modeKey, onRoundEnd])

  const advance = useCallback(() => {
    const next = currentIndexRef.current + 1
    if (next >= questionsRef.current.length) {
      finishRound('complete')
      return
    }
    currentIndexRef.current = next
    setCurrentIndex(next)
    setInput('')
    setFeedback(null)
    setFlash('')
    const params = levelParams(levelIndexRef.current)
    qParamsRef.current = { x: params.x, y: params.y }
    qRemainingRef.current = Math.round(params.y * 1000)
    qStartRef.current = Date.now()
    statusRef.current = 'playing'
    setStatus('playing')
    setRoundToken(t => t + 1)
  }, [finishRound])

  const handleQuestionTimeout = useCallback(() => {
    timeoutCountRef.current += 1
    statusRef.current = 'feedback'
    setStatus('feedback')
    setFlash('timeout')
    setInput('')
    const q = questionsRef.current[currentIndexRef.current]
    setFeedback({ type: 'timeout', answer: q ? q.product : '' })
    sound.playWrong()
    schedule(TIMEOUT_PAUSE, advance)
  }, [advance, schedule])

  const handleCorrect = useCallback(() => {
    const q = questionsRef.current[currentIndexRef.current]
    const t = (Date.now() - qStartRef.current) / 1000
    const points = pointsForTime(t, qParamsRef.current.x, qParamsRef.current.y)
    roundScoreRef.current += points
    setRoundScore(roundScoreRef.current)
    solvedCountRef.current += 1
    setSolvedCount(solvedCountRef.current)
    statusRef.current = 'feedback'
    setStatus('feedback')
    setFlash('correct')
    setFeedback({ type: 'correct', points, answer: q.product })
    sound.playCorrect()
    schedule(CORRECT_PAUSE, advance)
  }, [advance, schedule])

  const handleSubmit = useCallback(() => {
    if (statusRef.current !== 'playing') return
    const q = questionsRef.current[currentIndexRef.current]
    if (!q || input === '') return
    const val = parseInt(input, 10)
    if (Number.isNaN(val)) return

    if (val === q.product) {
      handleCorrect()
    } else {
      wrongCountRef.current += 1
      setInput('')
      setFeedback({ type: 'wrong' })
      setFlash('wrong')
      sound.playWrong()
      schedule(WRONG_PAUSE, () => {
        setFeedback(null)
        setFlash('')
      })
    }
  }, [handleCorrect, input, schedule])

  const tick = useCallback(() => {
    if (statusRef.current !== 'playing') return
    const now = Date.now()
    const delta = Math.min(MAX_TICK_DELTA, now - lastTickRef.current)
    lastTickRef.current = now

    let g = globalRemainingRef.current - delta
    let q = qRemainingRef.current - delta

    if (g <= 0) {
      globalRemainingRef.current = 0
      qRemainingRef.current = 0
      setGlobalRemaining(0)
      finishRound('time')
      return
    }
    if (q <= 0) {
      qRemainingRef.current = 0
      globalRemainingRef.current = g
      setGlobalRemaining(g)
      handleQuestionTimeout()
      return
    }
    globalRemainingRef.current = g
    qRemainingRef.current = q
    setGlobalRemaining(g)
  }, [finishRound, handleQuestionTimeout])

  useEffect(() => {
    if (status !== 'playing') return
    lastTickRef.current = Date.now()
    const id = setInterval(tick, 50)
    return () => clearInterval(id)
  }, [status, roundToken, tick])

  const beginLevel = useCallback((idx) => {
    clearSchedules()
    fireworks.stopLoop()

    const index = Math.min(Math.max(idx, 0), LEVEL_COUNT - 1)
    const params = levelParams(index)
    const qs = generateQuestions(modeKey, params.count)

    levelIndexRef.current = index
    setLevelIndex(index)
    questionsRef.current = qs
    setQuestions(qs)
    currentIndexRef.current = 0
    setCurrentIndex(0)
    setInput('')
    roundScoreRef.current = 0
    setRoundScore(0)
    solvedCountRef.current = 0
    setSolvedCount(0)
    wrongCountRef.current = 0
    timeoutCountRef.current = 0
    setFeedback(null)
    setFlash('')
    setResultData(null)

    qParamsRef.current = { x: params.x, y: params.y }
    globalRemainingRef.current = Math.round(params.total * 1000)
    setGlobalRemaining(globalRemainingRef.current)
    qRemainingRef.current = Math.round(params.y * 1000)
    qStartRef.current = Date.now()

    statusRef.current = 'playing'
    setStatus('playing')
    setRoundToken(t => t + 1)
  }, [clearSchedules, modeKey])

  useEffect(() => {
    const id = setTimeout(() => beginLevel(0), 0)
    return () => {
      clearTimeout(id)
      clearSchedules()
      fireworks.stopLoop()
    }
  }, [beginLevel, clearSchedules])

  const handleLevelChange = (e) => {
    beginLevel(parseInt(e.target.value, 10))
  }

  const handleDigit = useCallback((d) => {
    if (statusRef.current !== 'playing') return
    setInput(prev => {
      if (prev.length >= 3) return prev
      return (prev + d).replace(/^0+(?=\d)/, '')
    })
  }, [])

  const handleBackspace = useCallback(() => {
    if (statusRef.current !== 'playing') return
    setInput(prev => prev.slice(0, -1))
  }, [])

  const handleClear = useCallback(() => {
    if (statusRef.current !== 'playing') return
    setInput('')
  }, [])

  if (questions.length === 0) {
    return (
      <div className="game">
        <div className="game-loading">Preparando las cuentas…</div>
      </div>
    )
  }

  const q = questions[currentIndex]
  const params = levelParams(levelIndex)
  const total = params.count
  const progressPct = total > 0 ? (currentIndex / total) * 100 : 0
  const timePct = params.total > 0 ? (globalRemaining / (params.total * 1000)) * 100 : 0
  const lowTime = timePct <= 25
  const playing = status === 'playing'
  const showAnswer = !playing
  const readoutValue = showAnswer ? String(q.product) : input
  const readoutClass =
    feedback?.type === 'correct' ? 'correct'
      : feedback?.type === 'timeout' ? 'timeout'
        : ''
  const marqueeClass = flash ? `flash-${flash}` : ''

  return (
    <div className="game">
      <header className="game-header">
        <button className="back-btn" onClick={onBack}>← Menú</button>
        <div className="game-header-title">{mode.icon} {mode.label}</div>
        <select className="level-select" value={levelIndex} onChange={handleLevelChange} aria-label="Seleccionar nivel">
          {Array.from({ length: LEVEL_COUNT }, (_, i) => (
            <option key={i} value={i}>{LEVEL_ICONS[i]} Nivel {i + 1} ({MULTIPLICATIONS[i]} cuentas)</option>
          ))}
        </select>
      </header>

      <div className="game-stage">
        <img
          className="game-banner"
          src={`${import.meta.env.BASE_URL}banner_aprendetablas.jpg`}
          alt="Aprende×Tablas"
          width="1200"
          height="252"
        />
        <div className="arcade">
          <div className="stats-strip">
            <div className="stat">
              <span className="stat-label">Tiempo</span>
              <span className={`stat-value timer ${lowTime ? 'low' : ''}`}>{formatClock(globalRemaining)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pregunta</span>
              <span className="stat-value">{Math.min(currentIndex + 1, total)}/{total}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Resueltas</span>
              <span className="stat-value">{solvedCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Puntos</span>
              <span className="stat-value">{roundScore}</span>
            </div>
          </div>

          <div className={`marquee ${marqueeClass}`}>
            <div className="marquee-top">
              <span>Nivel {params.level} · {mode.label}</span>
              <span className="marquee-window">Respuesta ≤ {params.y.toFixed(1)}s</span>
            </div>
            <div className="marquee-label">¿Cuánto es?</div>
            <div className="equation">
              <span className="eq-num">{q.a}</span>
              <span className="eq-times">×</span>
              <span className="eq-num">{q.b}</span>
              <span className="eq-eq">=</span>
              <span className={`readout ${playing ? 'cursor' : ''} ${readoutClass}`}>
                {readoutValue || '·'}
              </span>
            </div>
            {feedback?.type === 'correct' && (
              <div className="feedback-chip">+{feedback.points}</div>
            )}
            {feedback?.type === 'timeout' && (
              <div className="feedback-chip timeout">¡Tiempo!</div>
            )}
            {feedback?.type === 'wrong' && (
              <div className="feedback-chip wrong">¡Otra vez!</div>
            )}
          </div>

          <div className="bars">
            <div className="bar-track" aria-hidden="true">
              <div className={`bar-fill time ${lowTime ? 'low' : ''}`} style={{ width: `${timePct}%` }}></div>
            </div>
            <div className="bar-track" aria-hidden="true">
              <div className="bar-fill progress" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          <Calculator
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSubmit={handleSubmit}
            disabled={!playing}
          />
        </div>
      </div>

      {status === 'done' && resultData && (
        <div className="round-overlay">
          <div className="round-results">
            <div className="result-icon">
              {resultData.levelResult === 'pass' ? '🎉' : resultData.levelResult === 'good' ? '😊' : '😅'}
            </div>
            <h2>
              {resultData.levelResult === 'pass' && '¡Felicitaciones!'}
              {resultData.levelResult === 'good' && '¡Bien hecho!'}
              {resultData.levelResult === 'fail' && '¡Seguí practicando!'}
            </h2>
            {resultData.levelResult === 'pass' && !resultData.isMaxLevel && (
              <p className="level-up-text">¡Excelente! Pasás al nivel {resultData.level + 1}</p>
            )}
            {resultData.levelResult === 'pass' && resultData.isMaxLevel && (
              <p className="level-up-text">¡Completaste las {mode.label.toLowerCase()} a toda velocidad! Sos un verdadero experto.</p>
            )}
            {resultData.levelResult === 'good' && (
              <p className="level-up-text">¡Muy bien! Respondé más rápido para pasar de nivel</p>
            )}
            {resultData.levelResult === 'fail' && (
              <p className="level-up-text">No te preocupes, ¡practicando vas a mejorar!</p>
            )}
            <p className="result-solved">Resolviste {resultData.solved} de {resultData.total} cuentas · {resultData.wrong} errores</p>
            <div className="trophies-earned">🏆 {resultData.score} de {resultData.max} puntos posibles</div>
            {(() => {
              const r = getRank(resultData.score, gameMaxScore())
              return r ? <p className="rank-text">{r.icon} Rango: {r.name}</p> : null
            })()}
            <div className="buttons">
              <button className="btn btn-secondary" onClick={onBack}>Menú</button>
              <button className="btn" onClick={() => beginLevel(levelIndex)}>Repetir nivel</button>
              {resultData.levelResult === 'pass' && !resultData.isMaxLevel && (
                <button className="btn" onClick={() => beginLevel(levelIndex + 1)}>Siguiente nivel</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

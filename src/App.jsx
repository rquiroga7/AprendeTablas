import { useState, useCallback } from 'react'
import './App.css'
import Menu from './components/Menu'
import Game from './components/Game'
import { loadStats, saveStats, updateModeStats } from './utils/stats'

function App() {
  const [gameMode, setGameMode] = useState(null)

  const handleSelectMode = (modeKey) => {
    setGameMode(modeKey)
  }

  const handleBackToMenu = () => {
    setGameMode(null)
  }

  const handleRoundEnd = useCallback((modeKey, levelIndex, score, maxScore) => {
    const stats = loadStats()
    updateModeStats(stats, modeKey, levelIndex, score, maxScore)
    saveStats(stats)
  }, [])

  return (
    <div className="app">
      {!gameMode && <Menu onSelectMode={handleSelectMode} />}
      {gameMode && (
        <Game
          modeKey={gameMode}
          onBack={handleBackToMenu}
          onRoundEnd={handleRoundEnd}
        />
      )}
    </div>
  )
}

export default App

import { useEffect, useCallback } from 'react'

export default function Calculator({ onDigit, onBackspace, onClear, onSubmit, disabled }) {
  const handleDigit = useCallback((d) => {
    if (disabled) return
    onDigit(d)
  }, [disabled, onDigit])

  const handleBackspace = useCallback(() => {
    if (disabled) return
    onBackspace()
  }, [disabled, onBackspace])

  const handleClear = useCallback(() => {
    if (disabled) return
    onClear()
  }, [disabled, onClear])

  const handleSubmit = useCallback(() => {
    if (disabled) return
    onSubmit()
  }, [disabled, onSubmit])

  useEffect(() => {
    const onKey = (e) => {
      if (disabled) return
      if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        handleDigit(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      } else if (e.key === 'Delete') {
        e.preventDefault()
        handleClear()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, handleDigit, handleBackspace, handleClear, handleSubmit])

  return (
    <div className={`keypad ${disabled ? 'keypad-disabled' : ''}`} aria-label="Calculadora en pantalla">
      <button className="key key-digit" onClick={() => handleDigit('7')} aria-label="Número 7">7</button>
      <button className="key key-digit" onClick={() => handleDigit('8')} aria-label="Número 8">8</button>
      <button className="key key-digit" onClick={() => handleDigit('9')} aria-label="Número 9">9</button>
      <button className="key key-back" onClick={handleBackspace} aria-label="Borrar último dígito">⌫</button>

      <button className="key key-digit" onClick={() => handleDigit('4')} aria-label="Número 4">4</button>
      <button className="key key-digit" onClick={() => handleDigit('5')} aria-label="Número 5">5</button>
      <button className="key key-digit" onClick={() => handleDigit('6')} aria-label="Número 6">6</button>
      <button className="key key-clear" onClick={handleClear} aria-label="Limpiar respuesta">C</button>

      <button className="key key-digit" onClick={() => handleDigit('1')} aria-label="Número 1">1</button>
      <button className="key key-digit" onClick={() => handleDigit('2')} aria-label="Número 2">2</button>
      <button className="key key-digit" onClick={() => handleDigit('3')} aria-label="Número 3">3</button>
      <div className="key-spacer"></div>

      <button className="key key-digit key-zero" onClick={() => handleDigit('0')} aria-label="Número 0">0</button>
      <button className="key key-enter" onClick={handleSubmit} aria-label="Confirmar respuesta">⏎</button>
    </div>
  )
}

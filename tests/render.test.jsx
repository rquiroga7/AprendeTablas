import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import Game from '../src/components/Game.jsx'
import Menu from '../src/components/Menu.jsx'

afterEach(cleanup)

const noop = () => {}

function readEquation() {
  const label = screen.getByText('¿Cuánto es?')
  const nums = label.parentElement.querySelectorAll('.eq-num')
  return {
    a: parseInt(nums[0].textContent, 10),
    b: parseInt(nums[1].textContent, 10),
    key: `${nums[0].textContent}×${nums[1].textContent}`,
  }
}

function press(n) {
  String(n).split('').forEach(d => fireEvent.click(screen.getByLabelText(`Número ${d}`)))
}

describe('menu', () => {
  it('renders the 4 mode cards', () => {
    render(<Menu onSelectMode={noop} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.getByText('Tablas 1–3')).toBeTruthy()
    expect(screen.getByText('Tablas 4–6')).toBeTruthy()
    expect(screen.getByText('Tablas 7–9')).toBeTruthy()
    expect(screen.getByText('Todas las tablas')).toBeTruthy()
  })

  it('calls onSelectMode with the chosen mode', () => {
    const onSelect = vi.fn()
    render(<Menu onSelectMode={onSelect} />)
    fireEvent.click(screen.getByText('Tablas 4–6').closest('button'))
    expect(onSelect).toHaveBeenCalledWith('4-6')
  })
})

describe('game', () => {
  it('boots a level and shows a question with the keypad', async () => {
    render(<Game modeKey="1-3" onBack={noop} onRoundEnd={noop} />)
    await waitFor(() => expect(screen.getByText('¿Cuánto es?')).toBeTruthy())
    expect(screen.getByLabelText('Calculadora en pantalla')).toBeTruthy()
    expect(screen.getAllByLabelText(/Número/)).toHaveLength(10)
    const eq = readEquation()
    expect(Number.isInteger(eq.a)).toBe(true)
    expect(Number.isInteger(eq.b)).toBe(true)
  })

  it('answering correctly advances the question', async () => {
    const onRoundEnd = vi.fn()
    render(<Game modeKey="1-3" onBack={noop} onRoundEnd={onRoundEnd} />)
    await waitFor(() => expect(screen.getByText('¿Cuánto es?')).toBeTruthy())

    const before = readEquation()
    press(before.a * before.b)
    fireEvent.click(screen.getByLabelText('Confirmar respuesta'))

    await waitFor(() => {
      expect(readEquation().key).not.toBe(before.key)
    })
  })

  it('answering wrong shows re-try feedback and lets you retype', async () => {
    render(<Game modeKey="1-3" onBack={noop} onRoundEnd={noop} />)
    await waitFor(() => expect(screen.getByText('¿Cuánto es?')).toBeTruthy())

    const eq = readEquation()
    press((eq.a * eq.b + 1) % 100) // a wrong number (mod 100 keeps it 0-99)
    fireEvent.click(screen.getByLabelText('Confirmar respuesta'))

    await waitFor(() => expect(screen.getByText('¡Otra vez!')).toBeTruthy())
  })

  it('lets you change level via the selector', async () => {
    render(<Game modeKey="1-3" onBack={noop} onRoundEnd={noop} />)
    await waitFor(() => expect(screen.getByText('¿Cuánto es?')).toBeTruthy())

    const before = screen.getAllByText(/Nivel /)[1].textContent
    fireEvent.change(screen.getByLabelText('Seleccionar nivel'), { target: { value: '7' } })

    await waitFor(() => {
      expect(
        [...screen.getAllByText(/Nivel /)].some(n => n.textContent !== before),
      ).toBe(true)
    })
    expect(screen.getByText('¿Cuánto es?')).toBeTruthy()
  })
})
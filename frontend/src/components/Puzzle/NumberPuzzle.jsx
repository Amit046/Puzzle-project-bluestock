import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NumberPuzzle({ puzzle, attempts, input, onInput, onSubmit, gameState }) {
  const [feedback, setFeedback] = useState(null)

  const press = (k) => {
    if (gameState !== 'playing') return
    if (k === '⌫') { onInput(input.slice(0, -1)); return }
    if (k === '±') { onInput(input.startsWith('-') ? input.slice(1) : (input ? '-' + input : '-')); return }
    if (input.length < 7) onInput(input + k)
  }

  const handleSubmit = async () => {
    if (!input || gameState !== 'playing') return
    const isRight = parseInt(input) === puzzle.answer
    setFeedback(isRight ? 'correct' : 'wrong')
    setTimeout(() => setFeedback(null), 600)
    await onSubmit(input)
  }

  useEffect(() => {
    const handler = e => {
      if (gameState !== 'playing') return
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('⌫')
      else if (e.key === 'Enter') handleSubmit()
      else if (e.key === '-') press('±')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [input, gameState])

  const getHintText = (val) => {
    const diff = parseInt(val) - puzzle.answer
    if (diff === 0) return '✓ Correct!'
    if (Math.abs(diff) <= 3) return diff > 0 ? '↓ Just a little too high' : '↑ Just a little too low'
    return diff > 0 ? '↓ Too high' : '↑ Too low'
  }

  const getAttemptStyle = (val) => {
    const n = parseInt(val)
    if (n === puzzle.answer) return 'border-green-600 bg-green-950/40 text-green-400'
    const d = Math.abs(n - puzzle.answer)
    if (d <= 5) return 'border-yellow-600/50 bg-yellow-950/30 text-yellow-400'
    return 'border-slate-600/40 bg-slate-800/40 text-slate-400'
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xs mx-auto">
      {/* Question */}
      <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} className="card w-full text-center py-7">
        <p className="text-slate-500 text-xs mb-2 font-body uppercase tracking-widest">Solve the equation</p>
        <p className="font-display text-3xl sm:text-4xl font-bold text-white">{puzzle.question}</p>
        <p className="text-slate-600 text-xs mt-3">{attempts.length + 1} / {puzzle.maxAttempts} attempts</p>
      </motion.div>

      {/* History */}
      <AnimatePresence>
        {attempts.map((a, i) => (
          <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border ${getAttemptStyle(a.input)}`}>
            <span className="font-display font-bold text-lg">{a.input}</span>
            <span className="text-sm">{getHintText(a.input)}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Input display */}
      <motion.div
        animate={feedback === 'wrong' ? { x:[-8,8,-8,8,0] } : {}}
        className={`w-full rounded-xl border-2 px-5 py-4 text-center font-display text-3xl font-bold transition-all
          ${gameState === 'playing' ? 'border-blue-600 bg-slate-900' : 'border-slate-700 bg-slate-900'}
          ${input ? 'text-white' : 'text-slate-700'}`}>
        {input || '?'}
      </motion.div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {['7','8','9','4','5','6','1','2','3','±','0','⌫'].map(k => (
          <button key={k} onClick={() => press(k)} disabled={gameState !== 'playing'}
            className="h-13 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl
                       font-display text-xl font-bold text-white transition-all active:scale-90">
            {k}
          </button>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={!input || gameState !== 'playing'}
        className="btn-primary w-full text-base">
        Submit Answer →
      </button>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { evaluateWordGuess } from '../../lib/puzzleEngine'

const STATE_STYLE = {
  correct: 'bg-green-700 border-green-600 text-white',
  present: 'bg-yellow-600 border-yellow-500 text-white',
  absent:  'bg-slate-700 border-slate-600 text-slate-400',
  filled:  'bg-slate-800 border-blue-500 text-white',
  empty:   'bg-slate-800/60 border-slate-700 text-white',
}
const KB_STATE = {
  correct: 'bg-green-700 hover:bg-green-600 text-white',
  present: 'bg-yellow-600 hover:bg-yellow-500 text-white',
  absent:  'bg-slate-800 text-slate-500 cursor-default',
  default: 'bg-slate-700 hover:bg-slate-600 text-white'
}

export default function WordPuzzle({ puzzle, attempts, input, onInput, onSubmit, gameState }) {
  const [shakeRow, setShakeRow] = useState(-1)
  const [kbStates, setKbStates] = useState({})
  const [flipRow, setFlipRow] = useState(-1)

  // Update keyboard colors from attempts
  useEffect(() => {
    const s = {}
    attempts.forEach(a => {
      const ev = evaluateWordGuess(a.input, puzzle.targetWord)
      a.input.split('').forEach((l, i) => {
        if (s[l] !== 'correct') s[l] = ev[i]
      })
    })
    setKbStates(s)
  }, [attempts, puzzle.targetWord])

  const handleKey = useCallback((key) => {
    if (gameState !== 'playing') return
    if (key === 'ENTER') {
      if (input.length !== puzzle.wordLength) {
        setShakeRow(attempts.length)
        setTimeout(() => setShakeRow(-1), 500)
        return
      }
      onSubmit()
      setFlipRow(attempts.length)
      setTimeout(() => setFlipRow(-1), 600)
    } else if (key === 'BACKSPACE' || key === '⌫') {
      onInput(input.slice(0, -1))
    } else if (/^[A-Za-z]$/.test(key) && input.length < puzzle.wordLength) {
      onInput(input + key.toUpperCase())
    }
  }, [gameState, input, puzzle.wordLength, attempts.length, onInput, onSubmit])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Enter') handleKey('ENTER')
      else if (e.key === 'Backspace') handleKey('BACKSPACE')
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey])

  const rows = []
  for (let r = 0; r < puzzle.maxAttempts; r++) {
    const attempt = attempts[r]
    const isCurrent = r === attempts.length && gameState === 'playing'
    const evaluation = attempt ? evaluateWordGuess(attempt.input, puzzle.targetWord) : []

    const cells = Array.from({ length: puzzle.wordLength }, (_, c) => {
      let letter = '', style = STATE_STYLE.empty
      if (attempt) {
        letter = attempt.input[c] || ''
        style = STATE_STYLE[evaluation[c]] || STATE_STYLE.absent
      } else if (isCurrent) {
        letter = input[c] || ''
        style = letter ? STATE_STYLE.filled : STATE_STYLE.empty
      }
      return (
        <motion.div key={c}
          animate={letter && !attempt ? { scale:[1,1.1,1] } : {}}
          transition={{ duration:0.1 }}
          className={`w-12 h-12 sm:w-13 sm:h-13 flex items-center justify-center
                      font-display font-bold text-xl rounded-lg border-2
                      ${style} transition-colors duration-150
                      ${attempt && r === flipRow ? 'tile-flip' : ''}`}
          style={attempt ? { animationDelay: `${c * 100}ms` } : {}}>
          {letter}
        </motion.div>
      )
    })

    rows.push(
      <motion.div key={r} animate={shakeRow === r ? { x:[-6,6,-6,6,-3,3,0] } : {}} transition={{ duration:0.4 }}
        className="flex gap-2 justify-center">
        {cells}
      </motion.div>
    )
  }

  const KEYS = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    ['ENTER', ...'ZXCVBNM'.split(''), '⌫']
  ]

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Grid */}
      <div className="flex flex-col gap-2">{rows}</div>

      {/* Keyboard */}
      <div className="flex flex-col gap-2 w-full max-w-xs sm:max-w-sm mt-2">
        {KEYS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map(k => {
              const st = kbStates[k]
              const isWide = k === 'ENTER' || k === '⌫'
              return (
                <button key={k} onClick={() => handleKey(k)}
                  className={`${isWide ? 'px-2 sm:px-3 text-[10px] sm:text-xs' : 'w-8 sm:w-9'}
                              h-12 sm:h-14 rounded-lg font-display font-bold text-sm
                              transition-all duration-100 active:scale-90
                              ${KB_STATE[st] || KB_STATE.default}`}>
                  {k}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import { generateDailyPuzzle, calcScore, evaluateWordGuess } from '../lib/puzzleEngine'
import { saveActivity, getActivity, saveProgress, getProgress, clearProgress } from '../lib/db'
import { calculateStreak, getTotalSolved, checkAchievements } from '../lib/streak'
import { performSync } from '../lib/syncManager'

const MAX_HINTS = 2

export function usePuzzle() {
  const today = dayjs().format('YYYY-MM-DD')

  const [puzzle, setPuzzle]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [gameState, setGameState]       = useState('idle') // idle|playing|won|lost
  const [attempts, setAttempts]         = useState([])
  const [input, setInput]               = useState('')
  const [hintsUsed, setHintsUsed]       = useState(0)
  const [hintVisible, setHintVisible]   = useState(false)
  const [timer, setTimer]               = useState(0)
  const [timerOn, setTimerOn]           = useState(false)
  const [score, setScore]               = useState(0)
  const [streak, setStreak]             = useState(0)
  const [totalSolved, setTotalSolved]   = useState(0)
  const [newBadges, setNewBadges]       = useState([])
  const [alreadyDone, setAlreadyDone]   = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const timerRef = useRef(null)

  // ── Load ────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const p = await generateDailyPuzzle(today)
        setPuzzle(p)

        const act = await getActivity(today)
        if (act?.solved) {
          setAlreadyDone(true)
          setScore(act.score)
          setGameState('won')
        } else {
          const prog = await getProgress(today)
          if (prog) {
            setAttempts(prog.attempts || [])
            setTimer(prog.timer || 0)
            if ((prog.attempts || []).length > 0) setGameState('playing')
          }
        }

        setStreak(await calculateStreak())
        setTotalSolved(await getTotalSolved())
      } catch (e) {
        setError(e.message)
      }
      setLoading(false)
    })()
  }, [today])

  // ── Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (timerOn) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [timerOn])

  const startGame = useCallback(() => {
    setGameState('playing')
    setTimerOn(true)
  }, [])

  // ── Submit ──────────────────────────────────────────────────
  const submit = useCallback(async (overrideInput) => {
    if (!puzzle || gameState !== 'playing') return { result: 'invalid' }
    if (!timerOn) setTimerOn(true)

    const val = (overrideInput ?? input).toString().toUpperCase().trim()
    if (!val) return { result: 'empty' }

    // Word length check
    if (puzzle.type === 'word' && val.length !== puzzle.wordLength) return { result: 'wrong_length' }

    const isCorrect = puzzle.type === 'word'
      ? val === puzzle.targetWord
      : parseInt(val) === puzzle.answer

    const newAttempts = [...attempts, { input: val, correct: isCorrect, time: timer }]
    setAttempts(newAttempts)
    setInput('')
    await saveProgress(today, { attempts: newAttempts, timer })

    if (isCorrect) {
      setTimerOn(false)
      setGameState('won')
      const finalScore = calcScore({ timeTaken: timer, difficulty: puzzle.difficulty, hintsUsed, attempts: newAttempts.length, completed: true })
      setScore(finalScore)
      await saveActivity(today, { solved: true, score: finalScore, timeTaken: timer, difficulty: puzzle.difficultyLevel, puzzleType: puzzle.type, hintsUsed, synced: false })
      const ns = await calculateStreak(); const nt = await getTotalSolved()
      setStreak(ns); setTotalSolved(nt)
      const badges = await checkAchievements(ns, nt)
      setNewBadges(badges)
      performSync()
      return { result: 'correct', score: finalScore }
    } else if (newAttempts.length >= puzzle.maxAttempts) {
      setTimerOn(false)
      setGameState('lost')
      await saveActivity(today, { solved: false, timeTaken: timer, difficulty: puzzle.difficultyLevel, puzzleType: puzzle.type, hintsUsed })
      return { result: 'lost' }
    }
    return { result: 'wrong' }
  }, [puzzle, gameState, input, attempts, timer, today, hintsUsed, timerOn])

  const useHint = useCallback(() => {
    if (hintsUsed >= MAX_HINTS) return
    setHintsUsed(h => h + 1)
    setHintVisible(true)
    setTimeout(() => setHintVisible(false), 6000)
  }, [hintsUsed])

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  return {
    puzzle, loading, error,
    gameState, attempts, input, setInput,
    hintsUsed, hintVisible, useHint, maxHints: MAX_HINTS,
    timer, fmt,
    score, streak, totalSolved,
    newBadges, alreadyDone,
    showInstructions, setShowInstructions,
    submit, startGame
  }
}

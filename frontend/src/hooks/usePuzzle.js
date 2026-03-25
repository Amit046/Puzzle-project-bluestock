import { useState, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import { generateDailyCrowns, calcCrownsScore } from '../lib/crownsEngine'
import { saveActivity, getActivity, saveProgress, getProgress } from '../lib/db'
import { calculateStreak, getTotalSolved, checkAchievements } from '../lib/streak'
import { performSync } from '../lib/syncManager'

const MAX_HINTS = 3

export function usePuzzle() {
  const today = dayjs().format('YYYY-MM-DD')

  const [puzzle, setPuzzle]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [gameState, setGameState]       = useState('idle') // idle|playing|won|lost
  // boardState will be a 1D array of integers: 0=empty, 1=X, 2=Crown
  const [boardState, setBoardState]     = useState([])
  const [mistakes, setMistakes]         = useState(0)
  
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
        const p = await generateDailyCrowns(today)
        setPuzzle(p)

        const act = await getActivity(today)
        if (act?.solved) {
          setAlreadyDone(true)
          setScore(act.score)
          setGameState('won')
          // Reconstruct the correct board state 
          const solvedBoard = Array(p.size * p.size).fill(0);
          for (let r=0; r<p.size; r++) {
            solvedBoard[r * p.size + p.solution[r]] = 2;
          }
          setBoardState(solvedBoard)
        } else {
          const prog = await getProgress(today)
          if (prog && prog.boardState && prog.boardState.length === p.size * p.size) {
            setBoardState(prog.boardState)
            setMistakes(prog.mistakes || 0)
            setTimer(prog.timer || 0)
            setGameState('playing')
          } else {
            setBoardState(Array(p.size * p.size).fill(0))
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
    if (timerOn && gameState === 'playing') {
       timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else {
       clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerOn, gameState])

  const startGame = useCallback(() => {
    setGameState('playing')
    setTimerOn(true)
  }, [])

  // Toggle cell state: 0 -> 1(X) -> 2(Crown) -> 0
  const toggleCell = useCallback((index) => {
    if (gameState !== 'playing') return;
    if (!timerOn) setTimerOn(true)

    setBoardState(prev => {
      const next = [...prev]
      next[index] = (next[index] + 1) % 3
      
      // Auto-save logic
      saveProgress(today, { boardState: next, timer, mistakes }).catch(()=>{})
      
      return next
    })
  }, [gameState, timerOn, today, timer, mistakes])

  const revealHint = useCallback(() => {
    if (hintsUsed >= MAX_HINTS || gameState !== 'playing') return
    
    // Find an empty cell or incorrect cell that should be a crown
    let targetIdx = -1;
    for (let r = 0; r < puzzle.size; r++) {
         const c = puzzle.solution[r];
         const idx = r * puzzle.size + c;
         if (boardState[idx] !== 2) {
             targetIdx = idx;
             break;
         }
    }
    
    if (targetIdx !== -1) {
        setHintsUsed(h => h + 1)
        setBoardState(prev => {
           let next = [...prev];
           next[targetIdx] = 2; // place correct crown
           return next;
        })
    }
  }, [hintsUsed, puzzle, gameState, boardState])

  // Validation
  const checkWinCondition = useCallback(async () => {
    if (gameState !== 'playing' || !puzzle) return;

    let placedCrowns = 0;
    
    // Calculate placed crowns
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === 2) placedCrowns++;
    }

    if (placedCrowns < puzzle.size) {
        return { result: 'incomplete' }; // Not enough crowns placed
    }

    // Checking correct positions
    let isCorrect = true;
    for (let r = 0; r < puzzle.size; r++) {
        const expectedCol = puzzle.solution[r];
        const idx = r * puzzle.size + expectedCol;
        if (boardState[idx] !== 2) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
      setTimerOn(false)
      setGameState('won')
      const finalScore = calcCrownsScore({ timeTaken: timer, difficultyLevel: puzzle.difficultyLevel, hintsUsed, mistakes })
      setScore(finalScore)
      await saveActivity(today, { solved: true, score: finalScore, timeTaken: timer, difficulty: puzzle.difficultyLevel, puzzleType: puzzle.type, hintsUsed, synced: false })
      const ns = await calculateStreak(); const nt = await getTotalSolved()
      setStreak(ns); setTotalSolved(nt)
      const badges = await checkAchievements(ns, nt)
      setNewBadges(badges)
      performSync()
      return { result: 'won' }
    } else {
      // Record a mistake
      const currentMistakes = mistakes + 1;
      setMistakes(currentMistakes);
      
      if (currentMistakes >= puzzle.maxAttempts) {
         setTimerOn(false)
         setGameState('lost')
         await saveActivity(today, { solved: false, timeTaken: timer, difficulty: puzzle.difficultyLevel, puzzleType: puzzle.type, hintsUsed })
         return { result: 'lost' }
      }
      return { result: 'mistake', remaining: puzzle.maxAttempts - currentMistakes }
    }
  }, [gameState, puzzle, boardState, mistakes, timer, today, hintsUsed])

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  return {
    puzzle, loading, error,
    gameState, boardState, toggleCell,
    hintsUsed, hintVisible, useHint: revealHint, maxHints: MAX_HINTS,
    timer, fmt, mistakes,
    score, streak, totalSolved,
    newBadges, alreadyDone,
    showInstructions, setShowInstructions,
    submit: checkWinCondition, startGame
  }
}

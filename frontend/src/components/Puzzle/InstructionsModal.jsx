import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstructionsModal({ puzzle, isOpen, onClose }) {
  if (!isOpen || !puzzle) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ y: 24, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-display font-bold text-white text-lg">How to Play</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">✕</button>
          </div>

          <div className="p-5 space-y-4">

            {puzzle.type === 'word' ? (
              <>
                {/* Category clue */}
                {puzzle.categoryClue && (
                  <div className="flex items-center gap-3 bg-blue-950/30 border border-blue-800/40 rounded-xl px-3 py-2.5">
                    <span className="text-2xl">{puzzle.categoryEmoji}</span>
                    <div>
                      <p className="text-blue-400 text-[10px] font-display uppercase tracking-widest mb-0.5">Category</p>
                      <p className="text-slate-200 text-sm">{puzzle.categoryClue}</p>
                    </div>
                  </div>
                )}

                {/* Paheli hints */}
                {puzzle.hint1 && (
                  <div className="flex gap-2.5 bg-purple-950/30 border border-purple-800/40 rounded-xl px-3 py-2.5">
                    <span className="text-base mt-0.5">🔮</span>
                    <div>
                      <p className="text-purple-400 text-[10px] font-display uppercase tracking-widest mb-0.5">Clue 1</p>
                      <p className="text-slate-300 text-xs leading-relaxed">{puzzle.hint1}</p>
                    </div>
                  </div>
                )}
                {puzzle.hint2 && (
                  <div className="flex gap-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-2.5">
                    <span className="text-base mt-0.5">💡</span>
                    <div>
                      <p className="text-amber-400 text-[10px] font-display uppercase tracking-widest mb-0.5">Clue 2</p>
                      <p className="text-slate-300 text-xs leading-relaxed">{puzzle.hint2}</p>
                    </div>
                  </div>
                )}

                <p className="text-slate-300 text-sm pt-1">
                  Guess the <span className="text-blue-400 font-bold">{puzzle.wordLength}-letter word</span> in {puzzle.maxAttempts} tries.
                </p>

                {/* Color guide */}
                <div className="space-y-2">
                  <div className="flex gap-1.5 mb-1">
                    {['B','R','A','V','E'].map((l, i) => (
                      <div key={i} className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-display font-bold text-sm
                        ${i===0?'bg-green-700 border-green-600 text-white':
                          i===2?'bg-yellow-600 border-yellow-500 text-white':
                          'bg-slate-700 border-slate-600 text-slate-400'}`}>{l}</div>
                    ))}
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p><span className="inline-block w-3 h-3 rounded-sm bg-green-700 mr-1.5 align-middle"></span><strong className="text-white">Green</strong> – right letter, right position</p>
                    <p><span className="inline-block w-3 h-3 rounded-sm bg-yellow-600 mr-1.5 align-middle"></span><strong className="text-white">Yellow</strong> – right letter, wrong position</p>
                    <p><span className="inline-block w-3 h-3 rounded-sm bg-slate-700 mr-1.5 align-middle"></span><strong className="text-white">Gray</strong> – letter not in the word at all</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-300 text-sm">Solve the equation in {puzzle.maxAttempts} tries.</p>
                <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                  <p className="font-display text-2xl text-white font-bold">{puzzle.question}</p>
                </div>
                {puzzle.hint1 && (
                  <div className="flex gap-2.5 bg-purple-950/30 border border-purple-800/40 rounded-xl px-3 py-2.5">
                    <span>🔮</span>
                    <p className="text-slate-300 text-xs">{puzzle.hint1}</p>
                  </div>
                )}
                {puzzle.hint2 && (
                  <div className="flex gap-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-2.5">
                    <span>💡</span>
                    <p className="text-slate-300 text-xs">{puzzle.hint2}</p>
                  </div>
                )}
                <div className="space-y-1 text-xs text-slate-400">
                  <p>• Enter your answer using the number pad</p>
                  <p>• <span className="text-green-400">✓ Correct</span> — you win!</p>
                  <p>• <span className="text-yellow-400">↑ Too high / ↓ Too low</span> guide you</p>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Difficulty: <span className={`font-bold ${puzzle.difficulty==='easy'?'text-green-400':puzzle.difficulty==='medium'?'text-yellow-400':'text-red-400'}`}>{puzzle.difficulty?.toUpperCase()}</span></span>
              <span>New puzzle every midnight</span>
            </div>
          </div>

          <div className="px-5 pb-5">
            <button onClick={onClose} className="btn-primary w-full">Got it, let's play! 🎮</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

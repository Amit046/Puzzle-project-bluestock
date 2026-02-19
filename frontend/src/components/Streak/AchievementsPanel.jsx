import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAchievements } from '../../lib/db'
import { ACHIEVEMENT_DEFS } from '../../lib/streak'

export default function AchievementsPanel({ isOpen, onClose }) {
  const [unlocked, setUnlocked] = useState([])

  useEffect(() => {
    if (isOpen) getAchievements().then(a => setUnlocked(a.map(x => x.id)))
  }, [isOpen])

  if (!isOpen) return null

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y:24, opacity:0 }} animate={{ y:0, opacity:1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm max-h-[80vh] overflow-auto">

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-white text-lg">Achievements</h2>
            <p className="text-slate-500 text-xs">{unlocked.length} / {ACHIEVEMENT_DEFS.length} unlocked</p>
          </div>
          <button onClick={onClose} className="btn-ghost">✕</button>
        </div>

        <div className="p-4 space-y-2.5">
          {ACHIEVEMENT_DEFS.map((a, i) => {
            const done = unlocked.includes(a.id)
            return (
              <motion.div key={a.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all
                  ${done ? 'border-yellow-800/50 bg-yellow-950/20' : 'border-slate-800 bg-slate-800/30 opacity-50'}`}>
                <span className="text-2xl">{a.title.split(' ')[0]}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${done ? 'text-white' : 'text-slate-400'}`}>
                    {a.title.split(' ').slice(1).join(' ')}
                  </p>
                  <p className="text-slate-600 text-xs truncate">{a.desc}</p>
                </div>
                {done
                  ? <span className="badge badge-green flex-shrink-0">✓</span>
                  : <span className="text-slate-700 text-xs flex-shrink-0">Locked</span>}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

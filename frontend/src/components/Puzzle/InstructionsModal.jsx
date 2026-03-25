import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0 }}
          className="bg-slate-900 border border-slate-700/60 rounded-3xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-800/20">
            <h2 className="font-display font-black text-amber-500 text-xl tracking-wide flex items-center gap-2">
              <span className="text-2xl drop-shadow-md">👑</span> How to Play
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center text-sm font-bold border border-slate-700">✕</button>
          </div>

          <div className="p-6 space-y-6">
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Your goal is to strategically place crowns on the grid following three simple rules:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-blue-900/10 border border-blue-900/40 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-blue-900/40 border border-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">1</div>
                <div>
                  <h3 className="text-blue-400 font-bold mb-1">One per Row & Column</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Place exactly <strong className="text-slate-200">one crown</strong> in each row and exactly one crown in each column.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-purple-900/10 border border-purple-900/40 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">2</div>
                <div>
                  <h3 className="text-purple-400 font-bold mb-1">One per Region</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Place exactly <strong className="text-slate-200">one crown</strong> in each colored region.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-900/10 border border-amber-900/40 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">3</div>
                <div>
                  <h3 className="text-amber-400 font-bold mb-1">No Touching</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Crowns cannot touch each other, <strong className="text-slate-200">not even diagonally</strong>.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner">
              <h4 className="text-slate-300 font-bold text-sm mb-2">Controls:</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2"><span className="text-base">👆</span> <strong>Tap once</strong> to place an <span className="text-slate-500 font-bold">✕</span> (to mark empty)</li>
                <li className="flex items-center gap-2"><span className="text-base">✌️</span> <strong>Tap again</strong> to place a 👑 Crown</li>
                <li className="flex items-center gap-2"><span className="text-base">🔄</span> <strong>Tap again</strong> to clear the cell</li>
              </ul>
            </div>
            
          </div>

          <div className="px-6 pb-6 pt-2 bg-gradient-to-t from-slate-900 flex flex-col gap-3">
            <button onClick={onClose} className="btn-primary w-full py-3.5 rounded-xl font-bold text-[15px] shadow-lg shadow-amber-500/20 active:scale-[0.98]">Got it, let's play! 🚀</button>
            <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-semibold">New puzzle every midnight</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { isOnline } from '../../lib/api'

export default function Navbar({ streak, onHeatmap, onAchievements }) {
  const { user, logout } = useAuth()
  const [online, setOnline] = useState(isOnline())
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="font-display font-bold text-lg text-white">PUZZLE<span className="text-blue-400">DAY</span></span>
        
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <motion.div key={streak} initial={{ scale:0.8 }} animate={{ scale:1 }}
            className="hidden sm:flex items-center gap-1.5 bg-orange-950/60 border border-orange-800/50 rounded-full px-3 py-1">
            <span className="animate-fire inline-block">🔥</span>
            <span className="font-display text-orange-300 font-bold text-sm">{streak}</span>
            <span className="text-orange-600 text-xs">streak</span>
          </motion.div>
        )}

        {/* Right */}
        <div className="flex items-center gap-1">
          <button onClick={onHeatmap} className="btn-ghost text-sm hidden sm:block">📊 Heatmap</button>
          <button onClick={onAchievements} className="btn-ghost text-sm hidden sm:block">🏆 Badges</button>

          <div className="relative ml-1">
            <button onClick={() => setMenu(m => !m)}
              className="w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-600 text-white text-sm font-bold font-display flex items-center justify-center transition-colors">
              {user?.name?.[0]?.toUpperCase() || 'G'}
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div initial={{ opacity:0, scale:0.95, y:-8 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
                  className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-500">{user?.isGuest ? 'Guest Mode' : user?.email}</p>
                  </div>
                  <button onClick={onHeatmap} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 sm:hidden">📊 Heatmap</button>
                  <button onClick={onAchievements} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 sm:hidden">🏆 Badges</button>
                  <button onClick={() => { logout(); setMenu(false) }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2">🚪 Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}

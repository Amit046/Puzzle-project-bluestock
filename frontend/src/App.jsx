import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './components/Auth/LoginPage'
import Navbar from './components/Layout/Navbar'
import PuzzlePage from './components/Puzzle/PuzzlePage'
import Heatmap from './components/Heatmap/Heatmap'
import AchievementsPanel from './components/Streak/AchievementsPanel'
import { initSync } from './lib/syncManager'
import { calculateStreak } from './lib/streak'
import { motion, AnimatePresence as AP } from 'framer-motion'

function SyncToast({ msg }) {
  return (
    <AP>
      {msg && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
          className="fixed bottom-5 right-5 bg-green-950 border border-green-700/60 text-green-400 px-4 py-2.5 rounded-xl text-sm z-40 shadow-xl">
          {msg}
        </motion.div>
      )}
    </AP>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  const [showHeatmap, setShowHeatmap]         = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [streak, setStreak]                   = useState(0)
  const [syncMsg, setSyncMsg]                 = useState(null)

  useEffect(() => {
    if (!user) return
    calculateStreak().then(setStreak)
    const cleanup = initSync(r => {
      setSyncMsg(`✅ Synced ${r.synced} entr${r.synced === 1 ? 'y' : 'ies'}`)
      setTimeout(() => setSyncMsg(null), 3000)
    })
    return cleanup
  }, [user])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-3">
        <div className="text-5xl animate-pulse">🧩</div>
        <p className="text-slate-500 font-display text-xs tracking-widest">LOADING...</p>
      </div>
    </div>
  )

  if (!user) return <LoginPage />

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar streak={streak} onHeatmap={() => setShowHeatmap(true)} onAchievements={() => setShowAchievements(true)} />
      <main className="pb-12">
        <PuzzlePage onStreakUpdate={setStreak} />
      </main>

      <SyncToast msg={syncMsg} />

      <AnimatePresence>
        {showHeatmap && <Heatmap isOpen onClose={() => setShowHeatmap(false)} />}
        {showAchievements && <AchievementsPanel isOpen onClose={() => setShowAchievements(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}

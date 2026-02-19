import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { loginGuest } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGuest = async () => {
    setLoading(true)
    await loginGuest()
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#3b82f6 1px,transparent 1px),linear-gradient(90deg,#3b82f6 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring', stiffness:180 }}
            className="text-7xl mb-5 block">🧩</motion.div>
          <h1 className="font-display text-5xl font-bold tracking-tight">
            <span className="text-white">PUZZLE</span><span className="text-blue-400">DAY</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">One puzzle · Every day · Build your streak</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="font-display text-base font-bold text-slate-300 mb-5 uppercase tracking-widest">Get Started</h2>

          <button onClick={handleGuest} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base mb-3">
            {loading
              ? <motion.span animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }} className="block">⟳</motion.span>
              : <><span>🎭</span> Play as Guest</>}
          </button>

          <div className="relative my-4 flex items-center">
            <div className="flex-1 border-t border-slate-700" />
            <span className="px-3 text-slate-600 text-xs">OR</span>
            <div className="flex-1 border-t border-slate-700" />
          </div>

          <button onClick={() => alert('Add VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google login')}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-slate-600 text-xs text-center mt-5">Works offline · No ads · 100% free</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[['365','Puzzles/Year'],['∞','Max Streak'],['100%','Offline']].map(([v,l]) => (
            <div key={l} className="card py-4 px-2 text-center">
              <div className="font-display text-blue-400 text-lg font-bold">{v}</div>
              <div className="text-slate-500 text-xs mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import { buildHeatmapData } from '../../lib/streak'

const INTENSITY = {
  0: 'bg-slate-800 hover:bg-slate-700',
  1: 'bg-green-900 hover:bg-green-800',
  2: 'bg-green-700 hover:bg-green-600',
  3: 'bg-green-500 hover:bg-green-400',
  4: 'bg-green-300 hover:bg-green-200'
}
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_SHORT = ['S','M','T','W','T','F','S']

function Cell({ day }) {
  const [tip, setTip] = useState(false)
  return (
    <div className="relative">
      <motion.div
        initial={day.isToday ? { scale: 0.5 } : false}
        animate={day.isToday ? { scale: 1 } : false}
        transition={{ type:'spring', stiffness:300 }}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        className={`w-3 h-3 rounded-sm cursor-default transition-colors duration-150
          ${INTENSITY[day.intensity]}
          ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-900' : ''}
          ${day.isFuture ? 'opacity-20' : ''}`}
      />
      <AnimatePresence>
        {tip && (
          <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none whitespace-nowrap">
            <div className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs shadow-xl">
              <p className="text-white font-semibold">{day.display}</p>
              {day.solved
                ? <><p className="text-green-400">✓ Solved</p><p className="text-slate-400">Score: {day.score}</p></>
                : day.isFuture ? <p className="text-slate-500">Future</p>
                : <p className="text-slate-500">Not played</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Heatmap({ isOpen, onClose }) {
  const yr = dayjs().year()
  const [year, setYear] = useState(yr)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    buildHeatmapData(year).then(d => { setDays(d); setLoading(false) })
  }, [isOpen, year])

  const stats = useMemo(() => ({
    solved: days.filter(d => d.solved).length,
    perfect: days.filter(d => d.intensity === 4).length,
    played: days.filter(d => !d.isFuture).length
  }), [days])

  const weeks = useMemo(() => {
    if (!days.length) return []
    const offset = dayjs(`${year}-01-01`).day()
    const padded = [...Array(offset).fill(null), ...days]
    const w = []
    for (let i = 0; i < padded.length; i += 7) w.push(padded.slice(i, i + 7))
    return w
  }, [days, year])

  const monthLabels = useMemo(() => {
    const labels = []; let last = -1
    const offset = dayjs(`${year}-01-01`).day()
    days.forEach((d, i) => {
      const m = dayjs(d.date).month()
      if (m !== last) { last = m; labels.push({ label: MONTHS[m], col: Math.floor((i + offset) / 7) }) }
    })
    return labels
  }, [days, year])

  if (!isOpen) return null

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y:24, opacity:0 }} animate={{ y:0, opacity:1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-white text-lg">Activity Heatmap</h2>
            <p className="text-slate-500 text-xs mt-0.5">Your puzzle journey through {year}</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={year} onChange={e => setYear(+e.target.value)} className="input text-sm py-1.5 px-3">
              <option value={yr}>{yr}</option>
              <option value={yr-1}>{yr-1}</option>
            </select>
            <button onClick={onClose} className="btn-ghost">✕</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
          {[
            { label:'Puzzles Solved', value: stats.solved, color:'text-green-400' },
            { label:'Perfect Scores', value: stats.perfect, color:'text-yellow-400' },
            { label:'Completion Rate', value: `${Math.round(stats.solved/Math.max(stats.played,1)*100)}%`, color:'text-blue-400' }
          ].map(s => (
            <div key={s.label} className="py-4 text-center">
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="p-5 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }} className="text-2xl">⟳</motion.div>
            </div>
          ) : (
            <>
              {/* Month labels */}
              <div className="flex ml-6 mb-1 relative h-4">
                {monthLabels.map((ml, i) => (
                  <div key={i} className="absolute text-slate-500 text-xs" style={{ left: `${ml.col * 16}px` }}>{ml.label}</div>
                ))}
              </div>

              <div className="flex gap-1 mt-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-1 pt-0.5">
                  {DAYS_SHORT.map((d, i) => (
                    <div key={i} className={`text-slate-600 h-3 flex items-center text-[9px] ${i%2===0?'opacity-0':''}`}>{d}</div>
                  ))}
                </div>
                {/* Cells */}
                <div className="flex gap-1">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) =>
                        day ? <Cell key={day.date} day={day} /> : <div key={di} className="w-3 h-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-slate-600 text-xs">Less</span>
                {[0,1,2,3,4].map(l => <div key={l} className={`w-3 h-3 rounded-sm ${INTENSITY[l].split(' ')[0]}`} />)}
                <span className="text-slate-600 text-xs">More</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

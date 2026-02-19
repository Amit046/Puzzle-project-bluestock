import dayjs from 'dayjs'
import { getAllActivity, saveAchievement, getAchievements } from './db'

export async function calculateStreak() {
  const all = await getAllActivity()
  const map = {}
  all.forEach(a => { if (a.solved) map[a.date] = a })

  let streak = 0
  let cur = dayjs()

  // If today not solved, start from yesterday
  if (!map[cur.format('YYYY-MM-DD')]) cur = cur.subtract(1, 'day')

  while (map[cur.format('YYYY-MM-DD')]?.solved) {
    streak++
    cur = cur.subtract(1, 'day')
  }
  return streak
}

export async function getTotalSolved() {
  const all = await getAllActivity()
  return all.filter(a => a.solved).length
}

export async function getActivityMap() {
  const all = await getAllActivity()
  const map = {}
  all.forEach(a => { map[a.date] = a })
  return map
}

export async function buildHeatmapData(year) {
  const map = await getActivityMap()
  const today = dayjs()
  const start = dayjs(`${year}-01-01`)
  const end = dayjs(`${year}-12-31`)

  const days = []
  let cur = start

  while (cur.isBefore(end, 'day') || cur.isSame(end, 'day')) {
    const date = cur.format('YYYY-MM-DD')
    const act = map[date]
    const isToday = cur.isSame(today, 'day')
    const isFuture = cur.isAfter(today, 'day')

    let intensity = 0
    if (act?.solved) {
      if (act.score >= 400) intensity = 4
      else if (act.difficulty >= 3) intensity = 3
      else if (act.difficulty >= 2) intensity = 2
      else intensity = 1
    }

    days.push({
      date, isToday, isFuture, intensity,
      solved: act?.solved || false,
      score: act?.score || 0,
      timeTaken: act?.timeTaken || 0,
      difficulty: act?.difficulty || 0,
      dayOfWeek: cur.day(),
      display: cur.format('MMM D, YYYY'),
      month: cur.format('MMM'),
      monthNum: cur.month()
    })
    cur = cur.add(1, 'day')
  }
  return days
}

const ACHIEVEMENT_DEFS = [
  { id: 'first',    title: '🎯 First Step',       desc: 'Complete your first puzzle',  check: (s, t) => t >= 1 },
  { id: 'streak3',  title: '🔥 On Fire',           desc: '3-day streak',                check: (s) => s >= 3 },
  { id: 'streak7',  title: '🔥 Week Warrior',      desc: '7-day streak',                check: (s) => s >= 7 },
  { id: 'streak30', title: '🔥 Monthly Champion',  desc: '30-day streak',               check: (s) => s >= 30 },
  { id: 'total10',  title: '⭐ Dedicated',          desc: '10 puzzles solved',           check: (s, t) => t >= 10 },
  { id: 'total50',  title: '💎 Committed',          desc: '50 puzzles solved',           check: (s, t) => t >= 50 },
  { id: 'total100', title: '🏆 Centurion',          desc: '100 puzzles solved',          check: (s, t) => t >= 100 },
]

export async function checkAchievements(streak, total) {
  const existing = new Set((await getAchievements()).map(a => a.id))
  const newOnes = []
  for (const def of ACHIEVEMENT_DEFS) {
    if (!existing.has(def.id) && def.check(streak, total)) {
      await saveAchievement({ id: def.id, title: def.title, desc: def.desc })
      newOnes.push(def)
    }
  }
  return newOnes
}

export { ACHIEVEMENT_DEFS }

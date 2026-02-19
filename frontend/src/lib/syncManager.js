import { getUnsynced, markSynced } from './db'
import { syncScores, getToken, isOnline } from './api'

let running = false

export async function performSync() {
  if (!isOnline() || !getToken() || running) return { synced: 0 }
  running = true
  try {
    const items = await getUnsynced()
    if (!items.length) return { synced: 0 }
    const entries = items.map(a => ({ date: a.date, score: a.score, timeTaken: a.timeTaken, difficulty: a.difficulty, puzzleType: a.puzzleType, hintsUsed: a.hintsUsed }))
    const result = await syncScores(entries)
    for (const s of result.synced || []) await markSynced(s.date)
    return { synced: result.synced?.length || 0 }
  } catch (e) {
    return { synced: 0, error: e.message }
  } finally {
    running = false
  }
}

export function initSync(onDone) {
  const handle = async () => {
    await new Promise(r => setTimeout(r, 1500))
    const r = await performSync()
    if (r.synced > 0) onDone?.(r)
  }
  window.addEventListener('online', handle)
  if (isOnline()) setTimeout(() => performSync(), 2000)
  return () => window.removeEventListener('online', handle)
}

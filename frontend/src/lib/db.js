import { openDB } from 'idb'

const DB_NAME = 'puzzleday-v2'
const DB_VERSION = 1
let _db = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('activity')) {
        const s = db.createObjectStore('activity', { keyPath: 'date' })
        s.createIndex('synced', 'synced')
      }
      if (!db.objectStoreNames.contains('progress')) db.createObjectStore('progress', { keyPath: 'date' })
      if (!db.objectStoreNames.contains('achievements')) db.createObjectStore('achievements', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('prefs')) db.createObjectStore('prefs', { keyPath: 'key' })
    }
  })
  return _db
}

// Activity
export async function saveActivity(date, data) {
  const db = await getDB()
  const existing = await db.get('activity', date) || {}
  await db.put('activity', { ...existing, date, ...data })
}
export async function getActivity(date) { return (await getDB()).get('activity', date) }
export async function getAllActivity() { return (await getDB()).getAll('activity') }
export async function getUnsynced() {
  const all = await getAllActivity()
  return all.filter(a => a.solved && !a.synced)
}
export async function markSynced(date) {
  const db = await getDB()
  const a = await db.get('activity', date)
  if (a) await db.put('activity', { ...a, synced: true })
}

// Progress
export async function saveProgress(date, data) {
  const db = await getDB()
  await db.put('progress', { date, ...data, savedAt: Date.now() })
}
export async function getProgress(date) { return (await getDB()).get('progress', date) }
export async function clearProgress(date) { return (await getDB()).delete('progress', date) }

// Achievements
export async function saveAchievement(a) { return (await getDB()).put('achievements', { ...a, unlockedAt: Date.now() }) }
export async function getAchievements() { return (await getDB()).getAll('achievements') }

// Prefs
export async function setPref(key, value) { return (await getDB()).put('prefs', { key, value }) }
export async function getPref(key) { const r = await (await getDB()).get('prefs', key); return r?.value }

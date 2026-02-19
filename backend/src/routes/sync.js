const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

let prisma = null;
try { const { PrismaClient } = require('@prisma/client'); prisma = new PrismaClient(); } catch (e) {}

const validateEntry = ({ date, score, timeTaken }) => {
  const entryDate = new Date(date);
  const today = new Date(); today.setHours(23, 59, 59, 999);
  if (entryDate > today) return 'Future dates not allowed';
  if (score < 0 || score > 10000) return 'Invalid score range';
  if (timeTaken < 3 || timeTaken > 7200) return 'Unrealistic completion time';
  return null;
};

router.post('/daily-scores', authenticate, async (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries) || entries.length === 0) return res.status(400).json({ error: 'entries array required' });
  if (entries.length > 50) return res.status(400).json({ error: 'Too many entries' });

  const results = [], errors = [];

  for (const entry of entries) {
    const err = validateEntry(entry);
    if (err) { errors.push({ date: entry.date, error: err }); continue; }
    try {
      if (prisma) {
        const record = await prisma.dailyScore.upsert({
          where: { userId_date: { userId: req.user.userId, date: new Date(entry.date) } },
          update: { score: entry.score, timeTaken: entry.timeTaken, difficulty: entry.difficulty || 1, completed: true },
          create: { userId: req.user.userId, date: new Date(entry.date), score: entry.score, timeTaken: entry.timeTaken, difficulty: entry.difficulty || 1, puzzleType: entry.puzzleType || 'word', hintsUsed: entry.hintsUsed || 0, completed: true }
        });
        results.push({ date: entry.date, id: record.id, synced: true });
      } else {
        results.push({ date: entry.date, synced: true });
      }
    } catch (e) {
      errors.push({ date: entry.date, error: 'DB error' });
    }
  }

  res.json({ success: true, synced: results, errors });
});

router.get('/history', authenticate, async (req, res) => {
  if (!prisma) return res.json({ scores: [] });
  try {
    const scores = await prisma.dailyScore.findMany({
      where: { userId: req.user.userId, completed: true },
      orderBy: { date: 'desc' }, take: 365
    });
    res.json({ scores });
  } catch { res.status(500).json({ error: 'Failed to fetch history' }); }
});

module.exports = router;

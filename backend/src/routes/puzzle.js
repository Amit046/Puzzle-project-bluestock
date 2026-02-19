const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const SECRET = process.env.PUZZLE_HMAC_SECRET || 'bluestock-puzzle-hmac-secret-2026';

const getDayOfYear = () => {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
};

router.get('/seed/:date', (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Invalid date format' });
  if (new Date(date) > new Date()) return res.status(403).json({ error: 'Future puzzles not available' });
  const hmac = crypto.createHmac('sha256', SECRET).update(date).digest('hex');
  res.json({ date, hmac, valid: true });
});

router.post('/verify-score', (req, res) => {
  const { date, score, timeTaken, clientHmac } = req.body;
  const serverHmac = crypto.createHmac('sha256', SECRET).update(`${date}:${score}:${timeTaken}`).digest('hex');
  res.json({ valid: serverHmac === clientHmac });
});

router.get('/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const hmac = crypto.createHmac('sha256', SECRET).update(today).digest('hex');
  res.json({ date: today, seed: hmac.slice(0, 16), puzzleNumber: getDayOfYear() });
});

module.exports = router;

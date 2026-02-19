require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const syncRoutes = require('./routes/sync');
const puzzleRoutes = require('./routes/puzzle');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

const syncLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

app.use('/api/auth', authRoutes);
app.use('/api/sync', syncLimiter, syncRoutes);
app.use('/api/puzzle', puzzleRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/', (req, res) => res.json({ message: 'PuzzleDay API v2.0', status: 'running' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`🚀 PuzzleDay API running on http://localhost:${PORT}`));
module.exports = app;

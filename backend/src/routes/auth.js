const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Try to use Prisma if DB is configured, otherwise use local mode
let prisma = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (e) {}

const generateToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email, isGuest: user.isGuest }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });

// Guest login
router.post('/guest', async (req, res) => {
  try {
    const guestId = uuidv4();
    let user;
    if (prisma) {
      user = await prisma.user.create({ data: { isGuest: true, guestId, name: `Guest_${guestId.slice(0, 8)}` } });
    } else {
      // Local mode without DB
      user = { id: guestId, isGuest: true, guestId, name: `Guest_${guestId.slice(0, 8)}` };
    }
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, isGuest: true } });
  } catch (err) {
    console.error('Guest login error:', err.message);
    // Fallback: generate token without DB
    const id = uuidv4();
    const user = { id, isGuest: true, name: `Guest_${id.slice(0,8)}`, email: null };
    res.json({ token: generateToken(user), user });
  }
});

// Google OAuth
router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'ID token required' });
  try {
    const { OAuth2Client } = require('google-auth-library');
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const { sub: googleId, email, name } = ticket.getPayload();
    let user = prisma ? await prisma.user.findUnique({ where: { googleId } }) : null;
    if (!user) {
      user = prisma
        ? await prisma.user.create({ data: { googleId, email, name, isGuest: false } })
        : { id: uuidv4(), googleId, email, name, isGuest: false };
    }
    res.json({ token: generateToken(user), user: { id: user.id, name: user.name, email: user.email, isGuest: false } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'fallback-secret');
    res.json({ valid: true, user: { id: decoded.userId, name: decoded.name, isGuest: decoded.isGuest } });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;

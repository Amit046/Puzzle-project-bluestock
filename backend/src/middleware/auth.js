const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET); } catch { req.user = null; }
  } else { req.user = null; }
  next();
};

module.exports = { authenticate, optionalAuth };

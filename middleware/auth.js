const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'biolink-premium-secret-key-2026';

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ ok: false, msg: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, msg: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.role !== 'admin') return res.status(403).json({ ok: false, msg: 'Admin access required' });
  next();
}

function optionalAuth(req, res, next) {
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.role = decoded.role;
      req.username = decoded.username;
    } catch (e) {}
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth, JWT_SECRET };

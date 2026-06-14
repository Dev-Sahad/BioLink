const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

const JWT_AGE = 7 * 24 * 60 * 60 * 1000;

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ ok: false, msg: 'All fields required' });
  const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '');
  if (cleanUser.length < 3) return res.status(400).json({ ok: false, msg: 'Username must be 3+ chars (a-z, 0-9, _, -)' });
  if (!email.includes('@')) return res.status(400).json({ ok: false, msg: 'Invalid email' });
  if (password.length < 6) return res.status(400).json({ ok: false, msg: 'Password must be 6+ characters' });

  db.get(`SELECT allowRegister FROM settings WHERE id = 1`, (err, settings) => {
    if (settings && settings.allowRegister === 0) return res.status(403).json({ ok: false, msg: 'Registration is closed' });

    db.get(`SELECT id FROM users WHERE username = ? OR email = ?`, [cleanUser, email], (err, row) => {
      if (row) return res.status(409).json({ ok: false, msg: 'Username or email already taken' });
      const hash = bcrypt.hashSync(password, 12);
      db.run(`INSERT INTO users (username, email, password, displayName) VALUES (?, ?, ?, ?)`,
        [cleanUser, email, hash, cleanUser],
        function(err) {
          if (err) return res.status(500).json({ ok: false, msg: 'Registration failed' });
          const userId = this.lastID;
          db.run(`INSERT INTO bios (userId, username, displayName, tagline, bio, theme, accentColor, bgType, socials, seoTitle, seoDesc, published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [userId, cleanUser, cleanUser, 'Hey, I\'m new here!', '', 'dark', '#7c6aff', 'gradient', '{}', cleanUser + ' | BioLink', 'My bio link page', 1],
            function(err) {
              const token = jwt.sign({ userId, username: cleanUser, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
              res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: JWT_AGE });
              res.json({ ok: true, user: { id: userId, username: cleanUser, email, role: 'user' } });
            });
        });
    });
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ ok: false, msg: 'Username and password required' });
  db.get(`SELECT * FROM users WHERE username = ?`, [username.trim().toLowerCase()], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ ok: false, msg: 'Invalid credentials' });
    if (user.suspended) return res.status(403).json({ ok: false, msg: 'Account suspended' });
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: JWT_AGE });
    res.json({ ok: true, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ ok: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get(`SELECT id, username, email, role, displayName, avatarUrl, suspended FROM users WHERE id = ?`, [decoded.userId], (err, user) => {
      if (!user) return res.json({ ok: false });
      res.json({ ok: true, user });
    });
  } catch (e) {
    res.json({ ok: false });
  }
});

module.exports = router;

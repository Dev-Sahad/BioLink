const express = require('express');
const { db } = require('../db');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/view/:username', (req, res) => {
  const { username } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const referrer = req.headers.referer || '';

  db.get(`SELECT id, userId FROM bios WHERE username = ?`, [username], (err, bio) => {
    if (!bio) return res.json({ ok: false });
    db.run(`INSERT INTO views (userId, ip, referrer) VALUES (?, ?, ?)`, [bio.userId, ip, referrer]);
    res.json({ ok: true });
  });
});

router.post('/click/:linkId', (req, res) => {
  const { linkId } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  db.run(`INSERT INTO clicks (linkId, ip) VALUES (?, ?)`, [linkId, ip]);
  res.json({ ok: true });
});

router.get('/me', optionalAuth, (req, res) => {
  if (!req.userId) return res.status(401).json({ ok: false, msg: 'Auth required' });
  db.get(`SELECT COUNT(*) as totalViews FROM views WHERE userId = ?`, [req.userId], (err, v) => {
    db.get(`SELECT COUNT(*) as todayViews FROM views WHERE userId = ? AND date >= date('now')`, [req.userId], (err, tv) => {
      db.get(`SELECT COUNT(*) as totalClicks FROM clicks WHERE linkId IN (SELECT id FROM links WHERE userId = ?)`, [req.userId], (err, c) => {
        db.get(`SELECT COUNT(*) as todayClicks FROM clicks WHERE linkId IN (SELECT id FROM links WHERE userId = ?) AND date >= date('now')`, [req.userId], (err, tc) => {
          db.all(`SELECT date(date) as day, COUNT(*) as count FROM views WHERE userId = ? AND date >= date('now', '-7 days') GROUP BY day ORDER BY day`, [req.userId], (err, viewHistory) => {
            db.all(`SELECT date(date) as day, COUNT(*) as count FROM clicks WHERE linkId IN (SELECT id FROM links WHERE userId = ?) AND date >= date('now', '-7 days') GROUP BY day ORDER BY day`, [req.userId], (err, clickHistory) => {
              db.all(`SELECT l.id, l.title, l.url, COUNT(c.id) as clicks FROM links l LEFT JOIN clicks c ON l.id = c.linkId WHERE l.userId = ? GROUP BY l.id ORDER BY clicks DESC LIMIT 5`, [req.userId], (err, topLinks) => {
                res.json({ ok: true, analytics: { totalViews: v.totalViews, todayViews: tv.totalViews, totalClicks: c.totalClicks, todayClicks: tc.totalClicks, viewHistory, clickHistory, topLinks } });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;

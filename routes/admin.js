const express = require('express');
const { db } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', (req, res) => {
  db.get(`SELECT COUNT(*) as totalUsers FROM users`, (err, u) => {
    db.get(`SELECT COUNT(*) as totalBios FROM bios WHERE published = 1`, (err, b) => {
      db.get(`SELECT COUNT(*) as totalViews FROM views`, (err, v) => {
        db.get(`SELECT COUNT(*) as totalClicks FROM clicks`, (err, c) => {
          db.get(`SELECT COUNT(*) as todayViews FROM views WHERE date >= date('now')`, (err, tv) => {
            db.get(`SELECT COUNT(*) as todayClicks FROM clicks WHERE date >= date('now')`, (err, tc) => {
              res.json({ ok: true, stats: { totalUsers: u.totalUsers, totalBios: b.totalBios, totalViews: v.totalViews, totalClicks: c.totalClicks, todayViews: tv.todayViews, todayClicks: tc.todayClicks } });
            });
          });
        });
      });
    });
  });
});

router.get('/users', (req, res) => {
  db.all(`SELECT id, username, email, role, displayName, suspended, createdAt FROM users ORDER BY createdAt DESC`, (err, rows) => {
    res.json({ ok: true, users: rows });
  });
});

router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
    res.json({ ok: true });
  });
});

router.put('/users/:id/suspend', (req, res) => {
  const { suspended } = req.body;
  db.run(`UPDATE users SET suspended = ? WHERE id = ?`, [suspended ? 1 : 0, req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
    res.json({ ok: true });
  });
});

router.delete('/users/:id', (req, res) => {
  db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: 'Delete failed' });
    res.json({ ok: true });
  });
});

router.get('/settings', (req, res) => {
  db.get(`SELECT * FROM settings WHERE id = 1`, (err, row) => {
    res.json({ ok: true, settings: row });
  });
});

router.put('/settings', (req, res) => {
  const { platformName, allowRegister, showViews, maintenance } = req.body;
  const sets = [];
  const vals = [];
  if (platformName !== undefined) { sets.push('platformName = ?'); vals.push(platformName); }
  if (allowRegister !== undefined) { sets.push('allowRegister = ?'); vals.push(allowRegister ? 1 : 0); }
  if (showViews !== undefined) { sets.push('showViews = ?'); vals.push(showViews ? 1 : 0); }
  if (maintenance !== undefined) { sets.push('maintenance = ?'); vals.push(maintenance ? 1 : 0); }
  if (sets.length === 0) return res.status(400).json({ ok: false, msg: 'No fields to update' });
  vals.push(1);
  db.run(`UPDATE settings SET ${sets.join(', ')} WHERE id = ?`, vals, function(err) {
    if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
    res.json({ ok: true });
  });
});

router.get('/domains', (req, res) => {
  db.all(`SELECT domains.*, users.username FROM domains JOIN users ON domains.userId = users.id ORDER BY createdAt DESC`, (err, rows) => {
    res.json({ ok: true, domains: rows });
  });
});

module.exports = router;

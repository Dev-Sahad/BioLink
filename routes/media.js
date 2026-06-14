const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.put('/music', authMiddleware, (req, res) => {
  const { type, url, autoplay } = req.body;
  db.get(`SELECT id FROM music WHERE userId = ?`, [req.userId], (err, row) => {
    if (row) {
      db.run(`UPDATE music SET type = ?, url = ?, autoplay = ? WHERE userId = ?`, [type, url, autoplay ? 1 : 0, req.userId], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
        res.json({ ok: true });
      });
    } else {
      db.run(`INSERT INTO music (userId, type, url, autoplay) VALUES (?, ?, ?, ?)`, [req.userId, type, url, autoplay ? 1 : 0], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Insert failed' });
        res.json({ ok: true });
      });
    }
  });
});

router.put('/video', authMiddleware, (req, res) => {
  const { type, url, title } = req.body;
  db.get(`SELECT id FROM video WHERE userId = ?`, [req.userId], (err, row) => {
    if (row) {
      db.run(`UPDATE video SET type = ?, url = ?, title = ? WHERE userId = ?`, [type, url, title, req.userId], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
        res.json({ ok: true });
      });
    } else {
      db.run(`INSERT INTO video (userId, type, url, title) VALUES (?, ?, ?, ?)`, [req.userId, type, url, title], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Insert failed' });
        res.json({ ok: true });
      });
    }
  });
});

module.exports = router;

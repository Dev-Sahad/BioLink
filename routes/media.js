const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.put('/music', authMiddleware, (req, res) => {
  const { type, url, autoplay } = req.body;
  const validTypes = ['spotify', 'soundcloud'];
  const musicType = validTypes.includes(type) ? type : 'spotify';
  const musicUrl = url || '';
  db.get(`SELECT id FROM music WHERE userId = ?`, [req.userId], (err, row) => {
    if (row) {
      db.run(`UPDATE music SET type = ?, url = ?, autoplay = ? WHERE userId = ?`, [musicType, musicUrl, autoplay ? 1 : 0, req.userId], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
        res.json({ ok: true });
      });
    } else {
      db.run(`INSERT INTO music (userId, type, url, autoplay) VALUES (?, ?, ?, ?)`, [req.userId, musicType, musicUrl, autoplay ? 1 : 0], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Insert failed' });
        res.json({ ok: true });
      });
    }
  });
});

router.put('/video', authMiddleware, (req, res) => {
  const { type, url, title } = req.body;
  const validTypes = ['youtube', 'vimeo', 'mp4'];
  const videoType = validTypes.includes(type) ? type : 'youtube';
  const videoUrl = url || '';
  const videoTitle = title || '';
  db.get(`SELECT id FROM video WHERE userId = ?`, [req.userId], (err, row) => {
    if (row) {
      db.run(`UPDATE video SET type = ?, url = ?, title = ? WHERE userId = ?`, [videoType, videoUrl, videoTitle, req.userId], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
        res.json({ ok: true });
      });
    } else {
      db.run(`INSERT INTO video (userId, type, url, title) VALUES (?, ?, ?, ?)`, [req.userId, videoType, videoUrl, videoTitle], function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Insert failed' });
        res.json({ ok: true });
      });
    }
  });
});

module.exports = router;

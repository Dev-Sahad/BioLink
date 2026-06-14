const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/:username', (req, res) => {
  const { username } = req.params;
  db.get(`SELECT * FROM bios WHERE username = ?`, [username], (err, bio) => {
    if (!bio) return res.status(404).json({ ok: false, msg: 'Bio not found' });
    if (!bio.published) return res.status(404).json({ ok: false, msg: 'Bio not published' });

    db.all(`SELECT * FROM links WHERE userId = ? AND active = 1 ORDER BY sortOrder ASC`, [bio.userId], (err, links) => {
      db.all(`SELECT * FROM gallery WHERE userId = ? ORDER BY sortOrder ASC`, [bio.userId], (err, gallery) => {
        db.get(`SELECT * FROM music WHERE userId = ?`, [bio.userId], (err, music) => {
          db.get(`SELECT * FROM video WHERE userId = ?`, [bio.userId], (err, video) => {
            db.get(`SELECT COUNT(*) as count FROM views WHERE userId = ?`, [bio.userId], (err, views) => {
              res.json({ ok: true, bio: { ...bio, socials: JSON.parse(bio.socials || '{}'), views: views?.count || 0, links, gallery, music, video } });
            });
          });
        });
      });
    });
  });
});

router.get('/public/:username', (req, res) => {
  const { username } = req.params;
  db.get(`SELECT * FROM bios WHERE username = ?`, [username], (err, bio) => {
    if (!bio) return res.status(404).json({ ok: false, msg: 'Bio not found' });
    if (!bio.published) return res.status(404).json({ ok: false, msg: 'Bio not published' });

    db.all(`SELECT * FROM links WHERE userId = ? AND active = 1 ORDER BY sortOrder ASC`, [bio.userId], (err, links) => {
      db.all(`SELECT * FROM gallery WHERE userId = ? ORDER BY sortOrder ASC`, [bio.userId], (err, gallery) => {
        db.get(`SELECT * FROM music WHERE userId = ?`, [bio.userId], (err, music) => {
          db.get(`SELECT * FROM video WHERE userId = ?`, [bio.userId], (err, video) => {
            db.get(`SELECT COUNT(*) as count FROM views WHERE userId = ?`, [bio.userId], (err, views) => {
              res.json({ ok: true, bio: { ...bio, socials: JSON.parse(bio.socials || '{}'), views: views?.count || 0, links, gallery, music, video } });
            });
          });
        });
      });
    });
  });
});

router.put('/me', authMiddleware, (req, res) => {
  const fields = ['displayName','tagline','bio','pronouns','avatarUrl','theme','accentColor','btnStyle','location','showViews','published','bgType','bgValue','particlesEnabled','cursorTrail','snowEnabled','socials','seoTitle','seoDesc','seoImage'];
  const sets = [];
  const vals = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`);
      vals.push(typeof req.body[f] === 'object' ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  });
  if (sets.length === 0) return res.status(400).json({ ok: false, msg: 'No fields to update' });
  vals.push(req.userId);
  db.run(`UPDATE bios SET ${sets.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`, vals, function(err) {
    if (err) return res.status(500).json({ ok: false, msg: 'Update failed' });
    res.json({ ok: true });
  });
});

router.get('/me/full', authMiddleware, (req, res) => {
  db.get(`SELECT * FROM bios WHERE userId = ?`, [req.userId], (err, bio) => {
    if (!bio) return res.status(404).json({ ok: false, msg: 'Bio not found' });
    db.all(`SELECT * FROM links WHERE userId = ? ORDER BY sortOrder ASC`, [req.userId], (err, links) => {
      db.all(`SELECT * FROM gallery WHERE userId = ? ORDER BY sortOrder ASC`, [req.userId], (err, gallery) => {
        db.get(`SELECT * FROM music WHERE userId = ?`, [req.userId], (err, music) => {
          db.get(`SELECT * FROM video WHERE userId = ?`, [req.userId], (err, video) => {
            db.get(`SELECT COUNT(*) as count FROM views WHERE userId = ?`, [req.userId], (err, views) => {
              res.json({ ok: true, bio: { ...bio, socials: JSON.parse(bio.socials || '{}'), views: views?.count || 0, links, gallery, music, video } });
            });
          });
        });
      });
    });
  });
});

module.exports = router;

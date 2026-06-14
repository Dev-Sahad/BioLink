const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { imageUrl, caption, sortOrder } = req.body;
  if (!imageUrl) return res.status(400).json({ ok: false, msg: 'Image URL required' });
  db.run(`INSERT INTO gallery (userId, imageUrl, caption, sortOrder) VALUES (?, ?, ?, ?)`,
    [req.userId, imageUrl, caption || '', sortOrder || 0],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: 'Failed to add image' });
      res.json({ ok: true, id: this.lastID });
    });
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.run(`DELETE FROM gallery WHERE id = ? AND userId = ?`, [req.params.id, req.userId], function(err) {
    if (err || this.changes === 0) return res.status(500).json({ ok: false, msg: 'Delete failed' });
    res.json({ ok: true });
  });
});

module.exports = router;

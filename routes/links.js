const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { title, url, description, icon, tag, password, sortOrder } = req.body;
  if (!title || !url) return res.status(400).json({ ok: false, msg: 'Title and URL required' });
  db.run(`INSERT INTO links (userId, title, url, description, icon, tag, password, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.userId, title, url, description || '', icon || '', tag || '', password || '', sortOrder || 0],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: 'Failed to add link' });
      res.json({ ok: true, id: this.lastID });
    });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { title, url, description, icon, tag, password, sortOrder, active } = req.body;
  const fields = [];
  const vals = [];
  if (title !== undefined) { fields.push('title = ?'); vals.push(title); }
  if (url !== undefined) { fields.push('url = ?'); vals.push(url); }
  if (description !== undefined) { fields.push('description = ?'); vals.push(description); }
  if (icon !== undefined) { fields.push('icon = ?'); vals.push(icon); }
  if (tag !== undefined) { fields.push('tag = ?'); vals.push(tag); }
  if (password !== undefined) { fields.push('password = ?'); vals.push(password); }
  if (sortOrder !== undefined) { fields.push('sortOrder = ?'); vals.push(sortOrder); }
  if (active !== undefined) { fields.push('active = ?'); vals.push(active ? 1 : 0); }
  if (fields.length === 0) return res.status(400).json({ ok: false, msg: 'No fields to update' });
  vals.push(req.params.id, req.userId);
  db.run(`UPDATE links SET ${fields.join(', ')} WHERE id = ? AND userId = ?`, vals, function(err) {
    if (err || this.changes === 0) return res.status(500).json({ ok: false, msg: 'Update failed' });
    res.json({ ok: true });
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.run(`DELETE FROM links WHERE id = ? AND userId = ?`, [req.params.id, req.userId], function(err) {
    if (err || this.changes === 0) return res.status(500).json({ ok: false, msg: 'Delete failed' });
    res.json({ ok: true });
  });
});

router.post('/reorder', authMiddleware, (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ ok: false, msg: 'Order array required' });
  const stmt = db.prepare(`UPDATE links SET sortOrder = ? WHERE id = ? AND userId = ?`);
  order.forEach((id, i) => stmt.run(i, id, req.userId));
  stmt.finalize();
  res.json({ ok: true });
});

module.exports = router;

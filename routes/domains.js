const express = require('express');
const dns = require('dns').promises;
const crypto = require('crypto');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/me', authMiddleware, (req, res) => {
  db.get(`SELECT customDomain, domainVerified, domainToken FROM bios WHERE userId = ?`, [req.userId], (err, row) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Database error' });
    res.json({
      ok: true,
      customDomain: row?.customDomain || null,
      domainVerified: row?.domainVerified === 1,
      domainToken: row?.domainToken || null,
    });
  });
});

router.post('/me', authMiddleware, (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ ok: false, msg: 'Domain is required' });

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(clean)) {
    return res.status(400).json({ ok: false, msg: 'Invalid domain format' });
  }

  db.get(`SELECT userId FROM bios WHERE customDomain = ? AND userId != ? AND domainVerified = 1`, [clean, req.userId], (err, verified) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Database error' });
    if (verified) return res.status(409).json({ ok: false, msg: 'Domain already in use by another account' });

    const token = crypto.randomBytes(20).toString('hex');

    db.serialize(() => {
      db.run(
        `UPDATE bios SET customDomain = NULL, domainVerified = 0, domainToken = NULL WHERE customDomain = ? AND userId != ? AND domainVerified = 0`,
        [clean, req.userId]
      );
      db.run(
        `DELETE FROM domains WHERE userId = ? OR domain = ?`,
        [req.userId, clean]
      );
      db.run(
        `INSERT INTO domains (userId, domain, verified) VALUES (?, ?, 0)`,
        [req.userId, clean]
      );
      db.run(
        `UPDATE bios SET customDomain = ?, domainVerified = 0, domainToken = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`,
        [clean, token, req.userId],
        function(err) {
          if (err) return res.status(500).json({ ok: false, msg: 'Failed to save domain' });
          res.json({ ok: true, domain: clean, token });
        }
      );
    });
  });
});

router.delete('/me', authMiddleware, (req, res) => {
  db.serialize(() => {
    db.run(`DELETE FROM domains WHERE userId = ?`, [req.userId]);
    db.run(
      `UPDATE bios SET customDomain = NULL, domainVerified = 0, domainToken = NULL, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`,
      [req.userId],
      function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Failed to remove domain' });
        res.json({ ok: true });
      }
    );
  });
});

router.post('/verify', authMiddleware, async (req, res) => {
  db.get(`SELECT customDomain, domainToken FROM bios WHERE userId = ?`, [req.userId], async (err, row) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Database error' });
    if (!row?.customDomain) return res.status(400).json({ ok: false, msg: 'No custom domain set' });
    if (!row?.domainToken) return res.status(400).json({ ok: false, msg: 'No verification token found' });

    const expectedRecord = `biolink-verify=${row.domainToken}`;

    try {
      const records = await dns.resolveTxt(row.customDomain);
      const flat = records.map(r => Array.isArray(r) ? r.join('') : String(r));
      const found = flat.some(r => r === expectedRecord);

      if (found) {
        db.get(
          `SELECT userId FROM bios WHERE customDomain = ? AND domainVerified = 1 AND userId != ?`,
          [row.customDomain, req.userId],
          (conflictErr, conflict) => {
            if (conflictErr) {
              return res.status(500).json({ ok: false, msg: 'Database error during conflict check' });
            }
            if (conflict) {
              return res.status(409).json({ ok: false, verified: false, msg: 'Another account has already verified this domain.' });
            }
            db.serialize(() => {
              db.run(`UPDATE domains SET verified = 1 WHERE userId = ? AND domain = ?`, [req.userId, row.customDomain]);
              db.run(
                `UPDATE bios SET domainVerified = 1, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`,
                [req.userId],
                function(updateErr) {
                  if (updateErr) return res.status(500).json({ ok: false, msg: 'Verification passed but failed to save' });
                  res.json({ ok: true, verified: true });
                }
              );
            });
          }
        );
      } else {
        res.json({ ok: false, verified: false, msg: 'TXT record not found. DNS changes can take up to 48 hours to propagate.' });
      }
    } catch (dnsErr) {
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA' || dnsErr.code === 'ESERVFAIL') {
        res.json({ ok: false, verified: false, msg: 'Domain not found or no TXT records. Check your DNS settings.' });
      } else {
        res.status(500).json({ ok: false, msg: 'DNS lookup failed: ' + dnsErr.message });
      }
    }
  });
});

router.get('/resolve', (req, res) => {
  const host = (req.query.host || req.hostname || '').toLowerCase();
  if (!host) return res.status(400).json({ ok: false, msg: 'No host provided' });
  db.get(
    `SELECT username FROM bios WHERE customDomain = ? AND domainVerified = 1 AND published = 1 ORDER BY updatedAt DESC LIMIT 1`,
    [host],
    (err, row) => {
      if (err) return res.status(500).json({ ok: false, msg: 'Database error' });
      if (!row) return res.status(404).json({ ok: false, msg: 'No bio found for this domain' });
      res.json({ ok: true, username: row.username });
    }
  );
});

module.exports = router;

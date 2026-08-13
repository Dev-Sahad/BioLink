const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Trust proxy so express-rate-limit and req.ip work correctly behind Replit proxy
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// OAuth session
app.use(session({
  secret: process.env.JWT_SECRET || 'biolink-premium-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use((req, res, next) => {
  const { getSqlDb } = require('./db');
  if (getSqlDb()) return next();
  initDb()
    .then(() => next())
    .catch(err => {
      res.status(500).json({ ok: false, msg: 'Database init error: ' + (err.message || String(err)) });
    });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/oauth', require('./routes/oauth'));
app.use('/api/bio', require('./routes/bio'));
app.use('/api/links', require('./routes/links'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/media', require('./routes/media'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/domains', require('./routes/domains'));

// Custom domain middleware — serve bio page when request comes from a verified custom domain
app.use((req, res, next) => {
  const host = req.hostname;
  const ownHosts = [
    'localhost',
    '0.0.0.0',
    process.env.REPLIT_DEV_DOMAIN,
    process.env.REPLIT_DOMAINS,
  ].filter(Boolean);

  const isOwnHost = ownHosts.some(h => host === h || host.endsWith('.' + h)) ||
    host.endsWith('.replit.app') || host.endsWith('.replit.dev') || host.endsWith('.vercel.app');
  if (isOwnHost) return next();

  // Pass through API routes, asset directories, and any path that looks like a static file
  const staticPrefixes = ['/api/', '/assets/', '/js/', '/icons/', '/style'];
  const hasFileExtension = /\.[a-zA-Z0-9]{1,8}$/.test(req.path);
  if (staticPrefixes.some(p => req.path.startsWith(p)) || hasFileExtension) {
    return next();
  }

  const { db } = require('./db');
  db.get(
    `SELECT b.username FROM bios b WHERE b.customDomain = ? AND b.domainVerified = 1 AND b.published = 1`,
    [host],
    (err, row) => {
      if (err || !row) return next();
      res.sendFile(path.join(__dirname, 'public', 'bio.html'));
    }
  );
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve SPA pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/bio', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bio.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));

// 404 handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, msg: 'API endpoint not found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  const errMsg = err ? (err.stack || err.message || String(err)) : 'Unknown error';
  const isApi = (req.originalUrl && req.originalUrl.startsWith('/api/')) || req.path.startsWith('/api/') || (req.headers.accept && req.headers.accept.includes('application/json'));
  if (isApi) {
    return res.status(500).json({ ok: false, msg: 'Internal server error', error: errMsg });
  }
  res.status(500).setHeader('X-Debug-Error', errMsg.replace(/\n/g, ' ')).sendFile(path.join(__dirname, 'public', '500.html'));
});

if (!process.env.VERCEL) {
  initDb().then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`BioLink Premium server running on http://${HOST}:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to initialize database:', err);
  });
}

module.exports = app;

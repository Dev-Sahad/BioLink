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
app.use('/api/', limiter);

// Auth routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/oauth', require('./routes/oauth'));
app.use('/api/bio', require('./routes/bio'));
app.use('/api/links', require('./routes/links'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/media', require('./routes/media'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve SPA pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/bio', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bio.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// 404 handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, msg: 'API endpoint not found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
    return res.status(500).json({ ok: false, msg: 'Internal server error' });
  }
  res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});

initDb();

app.listen(PORT, HOST, () => {
  console.log(`BioLink Premium server running on http://${HOST}:${PORT}`);
});

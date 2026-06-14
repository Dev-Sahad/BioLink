const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

const JWT_AGE = 7 * 24 * 60 * 60 * 1000;

// OAuth config from env vars
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const OAUTH_CALLBACK = process.env.OAUTH_CALLBACK || 'https://localhost:5000';

function setTokenCookie(res, userId, username, role) {
  const token = jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: JWT_AGE });
}

function findOrCreateOAuthUser(profile, provider, done) {
  const oauthId = profile.id;
  const email = profile.emails?.[0]?.value || `${oauthId}@${provider}.local`;
  const username = (profile.username || profile.displayName || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_\-]/g, '').slice(0, 20);
  const avatarUrl = profile.photos?.[0]?.value || '';
  const displayName = profile.displayName || username;

  db.get(`SELECT * FROM users WHERE oauthId = ? AND oauthProvider = ?`, [oauthId, provider], (err, user) => {
    if (user) {
      return done(null, user);
    }
    // Check if username exists
    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, existing) => {
      const finalUsername = existing ? `${username}_${Math.random().toString(36).slice(2,6)}` : username;
      db.run(`INSERT INTO users (username, email, password, displayName, avatarUrl, oauthProvider, oauthId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [finalUsername, email, 'oauth', displayName, avatarUrl, provider, oauthId],
        function(err) {
          if (err) return done(err);
          const userId = this.lastID;
          db.run(`INSERT INTO bios (userId, username, displayName, tagline, bio, theme, accentColor, bgType, socials, seoTitle, seoDesc, published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [userId, finalUsername, displayName, '', '', 'dark', '#7c6aff', 'gradient', '{}', `${displayName} | BioLink`, 'My bio link page', 1],
            function(err) {
              if (err) console.log('Bio seed error:', err);
              db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, newUser) => done(null, newUser));
            });
        });
    });
  });
}

// Google
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${OAUTH_CALLBACK}/api/auth/oauth/google/callback`,
  }, (accessToken, refreshToken, profile, done) => findOrCreateOAuthUser(profile, 'google', done)));
}

// GitHub
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `${OAUTH_CALLBACK}/api/auth/oauth/github/callback`,
  }, (accessToken, refreshToken, profile, done) => findOrCreateOAuthUser(profile, 'github', done)));
}

// Discord
if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
  passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: `${OAUTH_CALLBACK}/api/auth/oauth/discord/callback`,
    scope: ['identify', 'email'],
  }, (accessToken, refreshToken, profile, done) => findOrCreateOAuthUser(profile, 'discord', done)));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => done(err, user));
});

// Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=oauth' }), (req, res) => {
  setTokenCookie(res, req.user.id, req.user.username, req.user.role);
  res.redirect('/dashboard');
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login?error=oauth' }), (req, res) => {
  setTokenCookie(res, req.user.id, req.user.username, req.user.role);
  res.redirect('/dashboard');
});

router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'] }));
router.get('/discord/callback', passport.authenticate('discord', { failureRedirect: '/login?error=oauth' }), (req, res) => {
  setTokenCookie(res, req.user.id, req.user.username, req.user.role);
  // Auto-link Discord profile
  if (req.user.oauthProvider === 'discord') {
    db.get(`SELECT * FROM bios WHERE userId = ?`, [req.user.id], (err, bio) => {
      if (bio) {
        const socials = JSON.parse(bio.socials || '{}');
        socials.discord = req.user.username;
        db.run(`UPDATE bios SET socials = ? WHERE userId = ?`, [JSON.stringify(socials), req.user.id]);
      }
    });
  }
  res.redirect('/dashboard');
});

module.exports = router;

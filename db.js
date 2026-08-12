const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DB_PATH = process.env.VERCEL
  ? path.join(os.tmpdir(), 'data.db')
  : path.join(__dirname, 'data.db');

let SQL = null;
let sqlDb = null;

function saveDb() {
  if (sqlDb) {
    try {
      const data = sqlDb.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (e) {
      console.error('Failed to save DB:', e.message);
    }
  }
}

function loadDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const filebuffer = fs.readFileSync(DB_PATH);
      sqlDb = new SQL.Database(filebuffer);
      return;
    } catch (e) {}
  }
  sqlDb = new SQL.Database();
  saveDb();
}

const db = {
  serialize(fn) {
    if (fn) fn();
  },
  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];
    try {
      sqlDb.run(sql, params);
      const resLastId = sqlDb.exec("SELECT last_insert_rowid() as id");
      const lastID = resLastId[0]?.values[0]?.[0] || 0;
      const resChanges = sqlDb.exec("SELECT changes() as cnt");
      const changes = resChanges[0]?.values[0]?.[0] || 0;
      saveDb();
      if (callback) callback.call({ lastID, changes }, null);
    } catch (err) {
      if (callback) callback.call({ lastID: 0, changes: 0 }, err);
    }
  },
  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];
    try {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      let row;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      if (callback) callback(null, row);
    } catch (err) {
      if (callback) callback(err, null);
    }
  },
  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];
    try {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      if (callback) callback(null, rows);
    } catch (err) {
      if (callback) callback(err, []);
    }
  },
  prepare(sql) {
    const self = this;
    return {
      run(...args) {
        let callback = null;
        let params = args;
        if (typeof args[args.length - 1] === 'function') {
          callback = args.pop();
          params = args;
        }
        self.run(sql, params, callback);
      },
      finalize(callback) {
        if (callback) callback(null);
      }
    };
  }
};

async function initDb() {
  if (!SQL) {
    SQL = await initSqlJs();
    loadDb();
  }

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user','admin','mod')),
      displayName TEXT,
      avatarUrl TEXT,
      oauthProvider TEXT,
      oauthId TEXT,
      suspended INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      username TEXT UNIQUE NOT NULL,
      displayName TEXT,
      tagline TEXT,
      bio TEXT,
      pronouns TEXT,
      avatarUrl TEXT,
      theme TEXT DEFAULT 'dark',
      accentColor TEXT DEFAULT '#7c6aff',
      btnStyle TEXT DEFAULT 'pill',
      location TEXT,
      showViews INTEGER DEFAULT 1,
      published INTEGER DEFAULT 1,
      customDomain TEXT,
      domainVerified INTEGER DEFAULT 0,
      bgType TEXT DEFAULT 'gradient',
      bgValue TEXT,
      particlesEnabled INTEGER DEFAULT 0,
      cursorTrail INTEGER DEFAULT 0,
      snowEnabled INTEGER DEFAULT 0,
      bgVideo TEXT,
      customCSS TEXT,
      audioUrl TEXT,
      socials TEXT DEFAULT '{}',
      seoTitle TEXT,
      seoDesc TEXT,
      seoImage TEXT,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      tag TEXT,
      password TEXT,
      sortOrder INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      imageUrl TEXT NOT NULL,
      caption TEXT,
      sortOrder INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS music (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('spotify','soundcloud')),
      url TEXT NOT NULL,
      autoplay INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS video (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('youtube','vimeo','mp4')),
      url TEXT NOT NULL,
      title TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      ip TEXT,
      referrer TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      linkId INTEGER NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      ip TEXT,
      FOREIGN KEY(linkId) REFERENCES links(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      platformName TEXT DEFAULT 'BioLink',
      allowRegister INTEGER DEFAULT 1,
      showViews INTEGER DEFAULT 1,
      maintenance INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      domain TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    // Seed admin
    db.get(`SELECT id FROM users WHERE username = 'admin'`, (err, row) => {
      if (!row) {
        const bcrypt = require('bcryptjs');
        const hash = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT INTO users (username, email, password, role, displayName) VALUES (?, ?, ?, ?, ?)`,
          ['admin', 'admin@biolink.local', hash, 'admin', 'Platform Admin'],
          function(err) {
            if (err) console.log('Admin seed error:', err);
            else {
              const userId = this.lastID;
              db.run(`INSERT INTO bios (userId, username, displayName, tagline, bio, theme, accentColor, bgType, particlesEnabled, socials, seoTitle, seoDesc, published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [userId, 'admin', 'Platform Admin', 'Builder of the future', 'Welcome to the premium bio-link platform.', 'cyber', '#7c6aff', 'gradient', 1, '{}', 'BioLink Admin', 'Premium bio-link platform', 1]);
            }
          }
        );
      }
    });

    db.run(`INSERT OR IGNORE INTO settings (id) VALUES (1)`);

    try {
      db.run(`ALTER TABLE bios ADD COLUMN domainToken TEXT`, () => {});
    } catch(e) {}
  });
}

module.exports = { db, initDb };

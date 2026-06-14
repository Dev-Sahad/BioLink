# BioLink Premium

A premium, guns.lol-style bio-link platform built for creators. Every profile is a fully customizable landing page with animated themes, music, video, gallery, analytics, and more.

## Live Demo

Visit your own profile at `https://your-domain.com/bio?username=yourname`

## Features

- **Premium Bio Pages** — Animated backgrounds, video embeds, music, gallery, custom CSS
- **8 Themes** — Dark, Light, Cyber, Neon, Midnight, Sunset, Ocean, Forest
- **Drag & Drop Link Builder** — Reorder links, icons, password protection
- **Analytics Dashboard** — Views, clicks, 7-day charts, top links
- **SEO & OG Cards** — Custom titles, descriptions, and social preview images
- **QR Code Generation** — One-click QR for every bio page
- **OAuth Login** — Google, GitHub, Discord (auto-profile creation)
- **Admin Panel** — User management, platform settings, role-based access
- **Particle & Snow Effects** — Animated canvas backgrounds
- **Password-Protected Links** — Secure links with client-side verification

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js 20, Express, SQLite |
| Auth | JWT (HTTP-only cookies), bcrypt, Passport.js |
| Frontend | Vanilla JS, Premium CSS (glassmorphism, neon, glitch) |
| Icons | Custom SVG (no emojis) |
| QR Codes | `qrcode` library |
| Analytics | SQLite time-series |

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
# or
node server.js

# Visit http://localhost:5000
```

## Environment Variables

Create a `.env` file or set these in your environment:

```env
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
OAUTH_CALLBACK=https://your-domain.com
PORT=5000
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register with username, email, password
- `POST /api/auth/login` — Login with username/password
- `POST /api/auth/logout` — Clear JWT cookie
- `GET /api/auth/me` — Get current user
- `GET /api/auth/oauth/google` — Google OAuth
- `GET /api/auth/oauth/github` — GitHub OAuth
- `GET /api/auth/oauth/discord` — Discord OAuth

### Bio
- `GET /api/bio/public/:username` — Public bio data
- `PUT /api/bio/me` — Update own bio
- `GET /api/bio/qr/:username` — Generate QR code PNG

### Links
- `GET /api/links/me` — Get own links
- `PUT /api/links/me` — Save/reorder links
- `POST /api/links/click/:linkId` — Track link click

### Analytics
- `POST /api/analytics/view/:username` — Track bio view
- `GET /api/analytics/me` — Get analytics (views, clicks, charts)

### Admin
- `GET /api/admin/users` — List users (admin only)
- `PUT /api/admin/users/:id` — Update user (admin only)

## Project Structure

```
├── server.js              # Express server, middleware, routes
├── db.js                  # SQLite schema & initialization
├── middleware/
│   └── auth.js              # JWT auth, RBAC, role guards
├── routes/
│   ├── auth.js              # Login, register, JWT
│   ├── oauth.js             # Google, GitHub, Discord OAuth
│   ├── bio.js               # Bio CRUD, QR codes
│   ├── links.js             # Link management
│   ├── gallery.js           # Gallery images
│   ├── media.js             # Music/video embeds
│   ├── analytics.js         # Views, clicks, charts
│   └── admin.js             # Admin panel API
├── public/
│   ├── index.html           # Landing page
│   ├── dashboard.html       # Bio builder dashboard
│   ├── admin.html           # Admin panel
│   ├── bio.html             # Public bio page
│   ├── style.css            # Premium design system
│   ├── js/
│   │   ├── app.js           # Global utilities, particles, auth
│   │   ├── dashboard.js     # Bio builder logic
│   │   ├── bio.js           # Bio page renderer
│   │   ├── admin.js         # Admin panel logic
│   │   ├── auth.js          # Auth API helpers
│   │   ├── links.js         # Link drag-and-drop
│   │   ├── gallery.js       # Gallery uploader
│   │   ├── media.js         # Media embeds
│   │   └── analytics.js     # Analytics charts
│   ├── icons/
│   └── assets/
├── package.json
├── README.md
└── .gitignore
```

## Themes

| Theme | Description |
|-------|-------------|
| Dark | Default deep purple/black |
| Light | Clean white/gray |
| Cyber | Matrix green terminal |
| Neon | Hot pink/magenta |
| Midnight | Deep blue |
| Sunset | Warm orange/red |
| Ocean | Cool blue/cyan |
| Forest | Green/nature |

## License

MIT

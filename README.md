# ✦ BioLink — Self-hosted Link-in-Bio Platform

A fully self-hosted, GitHub Pages-ready alternative to Linktree, Superbio, and Guns.lol.
No backend, no database, no monthly fees — everything runs in the browser via `localStorage`.

---


## 🌐 How Bio URLs Work

Every user gets a unique public URL:
```
bio.html?u=USERNAME
```

Users can find and copy their URL anytime from **Dashboard → My URL**, with one click.

---

## ✨ Features

### 🔗 Links & Profile
- Unlimited links with custom emoji icons, descriptions, and tags (New, Free, Hot…)
- Auto emoji detection based on link URL
- Custom display name, bio, location, pronouns, and avatar
- Typewriter tagline animation (cycle through multiple roles)
- Up to 6 custom profile badges (Verified, Creator, Premium, etc.)
- Page view counter with public/private toggle
- Publish / Draft mode

### 🎵 Music Embed
- Spotify embed player
- SoundCloud embed player
- Custom MP3 player with play/pause, seek bar, time display, and volume control
- Optional autoplay

### 📺 Video Embed
- YouTube — paste any link, auto-converts to embed
- Vimeo — paste any link, auto-converts to embed
- Custom MP4 — native video player

### 🖼️ Photo Gallery
- 3-column responsive gallery grid
- Fullscreen lightbox viewer
- Add up to 12 images via URL

### 🎨 Appearance
- 8 built-in themes: Dark, Light, Cyber, Midnight, Forest, Rose, Vapor, Sand
- Custom accent color picker
- Button style selector (Pill, Rounded, Sharp)

### ✨ Visual Effects
- Floating ambient particles
- Glowing cursor trail
- Falling snowflakes
- Spinning avatar ring

### 📱 Social Icons
12 networks supported: Twitter, Instagram, YouTube, TikTok, Discord, GitHub, LinkedIn, Twitch, Snapchat, Spotify, Reddit, PayPal

### 🌐 Custom Domain
- Connect your own domain or subdomain
- Step-by-step DNS (CNAME) setup guide
- One-click verification

### 📤 Sharing
- One-click copy bio URL
- Web Share API (native mobile share sheet)
- QR code modal for offline sharing

### 📱 Mobile & Desktop UI
- Fully responsive layouts
- Mobile bottom navigation
- Mobile status bar simulation
- Sidebar navigation on desktop

### 🔐 Accounts & Auth
- Register / Login / Logout
- Role-based access (User / Admin)
- Account suspension support

### ⚙️ Admin Dashboard
- Platform-wide stats (users, bio pages, views, clicks)
- Full user management — create, edit, suspend, delete
- Bio page management — view or delete any page
- Analytics — top pages, CTR, content & theme breakdown
- Platform settings — registration toggle, view count visibility
- Export all data as JSON
- Clear all view/click counts

### ℹ️ Credits Page
- Feature showcase, tech stack, theme gallery
- Changelog and MIT license
- Creator info and support links

---

## 🛠️ Customization

**Change the site name** — edit the `<title>` tags and `.nav-logo` text in each HTML file.

**Change default theme / colors** — edit the `:root` CSS variables in `style.css`.

**Add more social networks** — add entries to the `SOCIALS` array in `dashboard.html`, and add a URL builder in `bio.html`'s `socialUrl()` function.

**Upgrade to a real backend** — replace the `localStorage` calls in `app.js` with `fetch()` calls to your own API. The interface layer is intentionally thin to make this easy.

---

## ⚠️ Limitations (localStorage)

Since this runs entirely in the browser:
- Data is stored **per browser** — users on different devices won't share data
- For a true multi-user production platform, replace `app.js` with a backend (Node.js + SQLite, Supabase, Firebase, etc.)
- Passwords are stored in plain text in localStorage — fine for personal/demo use, not for production

---

## 📄 License

MIT — use freely, modify as you wish.

---

<div align="center">

Built with ❤️ by **[Dev-Sahad](https://instagram.com/sahad_____sha)** · [GitHub](https://github.com/Dev-Sahad) · 

</div>

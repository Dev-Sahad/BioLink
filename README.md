# ✦ BioLink — Self-hosted Link-in-Bio Platform

A fully self-hosted, GitHub Pages-ready alternative to Linktree, Superbio, and Guns.lol.  
No backend, no database, no monthly fees — everything runs in the browser via `localStorage`.

---

## 🚀 Deploy to GitHub Pages (5 minutes)

### Step 1 — Create a GitHub repository
1. Go to [github.com/new](https://github.com/new)
2. Name it `biolink` (or anything you like)
3. Set it to **Public**
4. Click **Create repository**

### Step 2 — Upload the files
Upload all these files to the root of your repository:
```
index.html
dashboard.html
admin.html
bio.html
style.css
app.js
README.md
```

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select `Deploy from a branch`
3. Choose branch: `main`, folder: `/ (root)`
4. Click **Save**

### Step 4 — Visit your site
Your site will be live at:
```
https://YOUR_GITHUB_USERNAME.github.io/REPO_NAME/
```

---

## 🔐 Default Admin Credentials

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

> ⚠️ **Change the admin password immediately after first login.**  
> Go to Admin → Users → Edit admin → set a new password.

---

## 📁 File Structure

```
biolink/
├── index.html       ← Landing page + Login / Register
├── dashboard.html   ← User dashboard (edit bio, links, socials, style)
├── admin.html       ← Admin panel (user management, analytics)
├── bio.html         ← Public bio page renderer (?u=username)
├── style.css        ← Shared design tokens + components
├── app.js           ← Shared data layer (localStorage)
└── README.md        ← This file
```

---

## 🌐 How Bio URLs Work

Every user gets a public URL:
```
https://yoursite.github.io/biolink/bio.html?u=USERNAME
```

Users can find their URL in **Dashboard → My URL** and copy it with one click.

---

## ✨ Features

### For Users
- ✅ Register & log in with username + password
- ✅ Typewriter tagline animation
- ✅ Custom display name, bio, location, avatar
- ✅ Unlimited links with title, URL, description
- ✅ Social icons (Twitter, Instagram, YouTube, Discord, GitHub, TikTok, LinkedIn, Twitch)
- ✅ 5 themes: Dark, Light, Midnight, Forest, Rose
- ✅ Custom accent color picker
- ✅ Button style selector (Pill, Rounded, Sharp)
- ✅ Page view counter
- ✅ Publish / Draft toggle
- ✅ One-click copy of bio URL
- ✅ Web Share API (mobile share sheet)
- ✅ QR code modal for sharing
- ✅ Auto emoji detection for links

### For Admins
- ✅ Admin dashboard with platform stats
- ✅ Full user management (create, edit, suspend, delete)
- ✅ Bio page management (view, delete any bio)
- ✅ Export all data as JSON
- ✅ Separate admin panel at `/admin.html`

---

## 🛠️ Customization

### Change the site name
Edit the `<title>` tags and the `.nav-logo` text in each HTML file.

### Change default theme / colors
Edit the `:root` CSS variables in `style.css`.

### Add more social networks
In `app.js`, add entries to the `SOCIALS` array in the dashboard, and add URL builders in `bio.html`'s `socialUrl()` function.

### Upgrade to a real backend
Replace the `localStorage` calls in `app.js` with `fetch()` calls to your own API. The interface layer is intentionally thin to make this easy.

---

## ⚠️ Limitations (localStorage)

Since this runs entirely in the browser:
- Data is stored **per browser** — users on different devices won't share data
- For a true multi-user production platform, replace `app.js` with a backend (Node.js + SQLite, Supabase, Firebase, etc.)
- Passwords are stored in plain text in localStorage — fine for personal/demo use, not for production

---

## 📄 License

MIT — use freely, modify as you wish.

/* ── BioLink App — Shared Data Layer v2 ───────────────── */
const BL = (() => {

  const get = k => JSON.parse(localStorage.getItem(k) || 'null');
  const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));

  /* ── SEED ON FIRST RUN ───────────────────────────────── */
  const init = () => {
    if (!get('bl_users')) {
      set('bl_users', [{
        id: 'admin', username: 'admin', email: 'admin@biolink.local',
        password: 'admin123', role: 'admin', createdAt: new Date().toISOString()
      }]);
    }
    if (!get('bl_bios')) {
      set('bl_bios', {
        admin: {
          username: 'admin', displayName: 'BioLink Creator',
          tagline: 'Platform Builder · Developer · Designer',
          bio: 'Welcome to BioLink — the ultimate self-hosted link-in-bio. Build yours free! ✨',
          avatarUrl: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=admin',
          theme: 'cyber', accentColor: '#7c6aff', btnStyle: 'pill',
          location: 'Internet 🌍', showViews: true, published: true,
          customDomain: '', domainVerified: false,
          bgType: 'gradient', bgValue: '',
          particlesEnabled: true, cursorTrail: false, snowEnabled: false,
          music: { type: 'spotify', url: 'https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC?utm_source=generator&theme=0', autoplay: false },
          video: { type: 'youtube', url: '', title: '' },
          gallery: [],
          badges: ['✦ Creator', '🔥 Verified'],
          pronouns: 'they/them',
          links: [
            { title: 'GitHub', url: 'https://github.com/BioLink', desc: 'Star us ⭐', icon: '💻', tag: 'new' },
            { title: 'Documentation', url: 'https://github.com/Dev-Sahad/BioLink/blob/main/README.md', desc: 'Deploy guide', icon: '📖', tag: '' },
            { title: 'Create your page', url: 'index.html', desc: 'Free forever', icon: '✦', tag: 'free' }
          ],
          socials: { twitter: 'biolink', github: 'biolink', discord: 'biolink' },
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        }
      });
    }
    if (!get('bl_views'))  set('bl_views',  { admin: 3821 });
    if (!get('bl_clicks')) set('bl_clicks', { admin: 247  });
    if (!get('bl_settings')) {
      set('bl_settings', { platformName: 'BioLink', allowRegister: true, showViews: true });
    }
  };

  /* ── AUTH ────────────────────────────────────────────── */
  const getUsers    = () => get('bl_users') || [];
  const saveUsers   = v  => set('bl_users', v);
  const currentUser = () => get('bl_session');
  const isAdmin     = () => { const u = currentUser(); return u && u.role === 'admin'; };

  const login = (username, password) => {
    const users = getUsers();
    const user  = users.find(u => u.username === username && u.password === password);
    if (!user)      return { ok: false, msg: 'Wrong username or password.' };
    if (user.suspended) return { ok: false, msg: 'This account has been suspended.' };
    const sess = { id: user.id, username: user.username, role: user.role, email: user.email };
    set('bl_session', sess);
    return { ok: true, user: sess };
  };

  const logout = () => localStorage.removeItem('bl_session');

  const register = (username, email, password) => {
    const settings = get('bl_settings') || {};
    if (settings.allowRegister === false) return { ok: false, msg: 'Registration is currently closed.' };
    username = username.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '');
    if (!username || username.length < 3) return { ok: false, msg: 'Username must be 3+ chars (a-z, 0-9, _, -).' };
    if (!email || !email.includes('@'))   return { ok: false, msg: 'Enter a valid email.' };
    if (!password || password.length < 6) return { ok: false, msg: 'Password must be 6+ characters.' };
    const users = getUsers();
    if (users.find(u => u.username === username)) return { ok: false, msg: 'Username already taken.' };
    if (users.find(u => u.email === email))       return { ok: false, msg: 'Email already registered.' };
    const user = { id: username, username, email, password, role: 'user', createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
    const sess = { id: user.id, username: user.username, role: user.role, email: user.email };
    set('bl_session', sess);
    return { ok: true, user: sess };
  };

  /* ── BIO DATA ────────────────────────────────────────── */
  const getBios   = () => get('bl_bios') || {};
  const getBio    = u   => (getBios())[u] || null;
  const saveBio   = (username, data) => {
    const bios = getBios();
    bios[username] = { ...data, username, updatedAt: new Date().toISOString() };
    set('bl_bios', bios);
  };
  const deleteBio = u => { const b = getBios(); delete b[u]; set('bl_bios', b); };

  const defaultBio = username => ({
    username, displayName: username,
    tagline: 'Hey, I\'m new here! ✨',
    bio: '', pronouns: '',
    avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${username}`,
    theme: 'dark', accentColor: '#7c6aff', btnStyle: 'pill',
    location: '', showViews: true, published: true,
    customDomain: '', domainVerified: false,
    bgType: 'gradient', bgValue: '',
    particlesEnabled: false, cursorTrail: false, snowEnabled: false,
    music: { type: 'none', url: '', autoplay: false },
    video: { type: 'none', url: '', title: '' },
    gallery: [], badges: [], links: [], socials: {},
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  });

  /* ── VIEWS / CLICKS ──────────────────────────────────── */
  const getViews  = () => get('bl_views')  || {};
  const getClicks = () => get('bl_clicks') || {};
  const trackView = u => { const v = getViews();  v[u] = (v[u]||0)+1; set('bl_views',  v); };
  const trackClick= u => { const c = getClicks(); c[u] = (c[u]||0)+1; set('bl_clicks', c); };
  const viewCount = u => (getViews())[u]  || 0;
  const clickCount= u => (getClicks())[u] || 0;

  /* ── CUSTOM DOMAIN HELPERS ───────────────────────────── */
  const setCustomDomain = (username, domain) => {
    const bio = getBio(username);
    if (!bio) return;
    bio.customDomain = domain.trim().toLowerCase().replace(/https?:\/\//,'').replace(/\/$/,'');
    bio.domainVerified = false;
    saveBio(username, bio);
  };

  /* ── URL HELPER ──────────────────────────────────────── */
  const bioUrl = username => {
    const bio = getBio(username);
    if (bio && bio.customDomain && bio.domainVerified) {
      return `https://${bio.customDomain}`;
    }
    const base = location.origin + location.pathname.replace(/[^/]*$/, '');
    return `${base}bio.html?u=${username}`;
  };

  /* ── SETTINGS ────────────────────────────────────────── */
  const getSettings  = ()  => get('bl_settings') || {};
  const saveSettings = v   => set('bl_settings', v);

  /* ── ADMIN UTILS ─────────────────────────────────────── */
  const deleteUser = username => {
    let users = getUsers().filter(u => u.username !== username);
    saveUsers(users); deleteBio(username);
    const sess = currentUser();
    if (sess && sess.username === username) logout();
  };
  const toggleUserStatus = username => {
    const users = getUsers();
    const u = users.find(u => u.username === username);
    if (u) u.suspended = !u.suspended;
    saveUsers(users);
  };

  /* ── TOAST ───────────────────────────────────────────── */
  const toast = (msg, type='success') => {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
    el.textContent = msg; el.className = `show ${type}`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3000);
  };

  /* ── GUARDS ──────────────────────────────────────────── */
  const requireAuth  = (r='index.html') => { if (!currentUser()) { location.href=r; return false; } return true; };
  const requireAdmin = (r='index.html') => { if (!isAdmin())     { location.href=r; return false; } return true; };

  init();
  return {
    getUsers, saveUsers, currentUser, isAdmin,
    login, logout, register,
    getBios, getBio, saveBio, deleteBio, defaultBio,
    trackView, trackClick, viewCount, clickCount, bioUrl,
    setCustomDomain, getSettings, saveSettings,
    deleteUser, toggleUserStatus,
    toast, requireAuth, requireAdmin
  };
})();

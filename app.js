/* ── BioLink App — Shared Data Layer ──────────────────── */
const BL = (() => {

  /* ── STORAGE HELPERS ─────────────────────────────────── */
  const get  = k => JSON.parse(localStorage.getItem(k) || 'null');
  const set  = (k,v) => localStorage.setItem(k, JSON.stringify(v));

  /* ── SEED ADMIN IF FIRST RUN ─────────────────────────── */
  const init = () => {
    if (!get('bl_users')) {
      set('bl_users', [{
        id: 'admin',
        username: 'admin',
        email: 'admin@biolink.local',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString()
      }]);
    }
    if (!get('bl_bios')) {
      set('bl_bios', {
        admin: {
          username: 'admin',
          displayName: 'BioLink Admin',
          tagline: 'Platform Creator · Developer · Designer',
          bio: 'Welcome to BioLink — the self-hosted link-in-bio platform. Register to create your own page! ✨',
          avatarUrl: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=admin',
          theme: 'dark',
          accentColor: '#7c6aff',
          btnStyle: 'pill',
          location: 'Internet 🌍',
          showViews: true,
          published: true,
          links: [
            { title: 'GitHub Repository', url: 'https://github.com', desc: 'Star us on GitHub ⭐' },
            { title: 'Documentation', url: 'https://github.com', desc: 'How to deploy & customize' },
            { title: 'Register Free', url: 'index.html', desc: 'Create your own BioLink page' }
          ],
          socials: {
            twitter: 'biolink',
            github: 'biolink',
            discord: 'biolink'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    if (!get('bl_views')) set('bl_views', { admin: 142 });
  };

  /* ── AUTH ────────────────────────────────────────────── */
  const getUsers   = () => get('bl_users') || [];
  const saveUsers  = v  => set('bl_users', v);
  const currentUser= () => get('bl_session');
  const isAdmin    = () => { const u = currentUser(); return u && u.role === 'admin'; };

  const login = (username, password) => {
    const users = getUsers();
    const user  = users.find(u => u.username === username && u.password === password);
    if (!user) return { ok: false, msg: 'Wrong username or password.' };
    const sess = { id: user.id, username: user.username, role: user.role, email: user.email };
    set('bl_session', sess);
    return { ok: true, user: sess };
  };

  const logout = () => { localStorage.removeItem('bl_session'); };

  const register = (username, email, password) => {
    username = username.trim().toLowerCase().replace(/[^a-z0-9_\-]/g,'');
    if (!username || username.length < 3) return { ok: false, msg: 'Username must be 3+ letters (a-z, 0-9, _, -).' };
    if (!email || !email.includes('@')) return { ok: false, msg: 'Enter a valid email.' };
    if (!password || password.length < 6) return { ok: false, msg: 'Password must be 6+ characters.' };
    const users = getUsers();
    if (users.find(u => u.username === username)) return { ok: false, msg: 'Username already taken.' };
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered.' };
    const user = { id: username, username, email, password, role: 'user', createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
    const sess = { id: user.id, username: user.username, role: user.role, email: user.email };
    set('bl_session', sess);
    return { ok: true, user: sess };
  };

  /* ── BIO DATA ────────────────────────────────────────── */
  const getBios  = () => get('bl_bios') || {};
  const getBio   = username => {
    const bios = getBios();
    return bios[username] || null;
  };
  const saveBio  = (username, data) => {
    const bios = getBios();
    bios[username] = { ...data, username, updatedAt: new Date().toISOString() };
    set('bl_bios', bios);
  };
  const deleteBio = username => {
    const bios = getBios(); delete bios[username]; set('bl_bios', bios);
  };

  const defaultBio = username => ({
    username,
    displayName: username,
    tagline: 'Hey, I\'m new here! ✨',
    bio: '',
    avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${username}`,
    theme: 'dark',
    accentColor: '#7c6aff',
    links: [],
    socials: {},
    showViews: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  /* ── VIEWS TRACKING ──────────────────────────────────── */
  const getViews = () => get('bl_views') || {};
  const trackView = username => {
    const v = getViews(); v[username] = (v[username] || 0) + 1;
    set('bl_views', v);
  };
  const viewCount = username => (getViews()[username] || 0);

  /* ── URL HELPER ──────────────────────────────────────── */
  const bioUrl = username => {
    const base = location.origin + location.pathname.replace(/[^/]*$/, '');
    return `${base}bio.html?u=${username}`;
  };

  /* ── ADMIN UTILS ─────────────────────────────────────── */
  const deleteUser = username => {
    let users = getUsers();
    users = users.filter(u => u.username !== username);
    saveUsers(users);
    deleteBio(username);
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
    el.textContent = msg;
    el.className = `show ${type}`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3000);
  };

  /* ── GUARD HELPERS ───────────────────────────────────── */
  const requireAuth = (redirectTo = 'index.html') => {
    if (!currentUser()) { location.href = redirectTo; return false; }
    return true;
  };
  const requireAdmin = (redirectTo = 'index.html') => {
    if (!isAdmin()) { location.href = redirectTo; return false; }
    return true;
  };

  init();
  return {
    getUsers, saveUsers, currentUser, isAdmin,
    login, logout, register,
    getBios, getBio, saveBio, deleteBio, defaultBio,
    trackView, viewCount, bioUrl,
    deleteUser, toggleUserStatus,
    toast, requireAuth, requireAdmin
  };
})();

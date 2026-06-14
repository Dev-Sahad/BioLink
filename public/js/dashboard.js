/* ═══════════════════════════════════════════════════════════════
   Dashboard Controller
   ═══════════════════════════════════════════════════════════════ */

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

let bioData = null;
let linksData = [];
let galleryData = [];
let dragSrc = null;

const themes = [
  { id: 'dark', name: 'Dark', bg: '#0a0a1a', accent: '#7c6aff' },
  { id: 'light', name: 'Light', bg: '#f5f5fa', accent: '#7c6aff' },
  { id: 'cyber', name: 'Cyber', bg: '#050510', accent: '#00d4ff' },
  { id: 'neon', name: 'Neon', bg: '#0a0a0f', accent: '#ff6af0' },
  { id: 'midnight', name: 'Midnight', bg: '#080c14', accent: '#3dffa0' },
  { id: 'sunset', name: 'Sunset', bg: '#1a0a1a', accent: '#ff6a4d' },
  { id: 'ocean', name: 'Ocean', bg: '#0a0a1e', accent: '#4d8aff' },
  { id: 'forest', name: 'Forest', bg: '#0a1a0a', accent: '#6aff4d' },
];

async function loadDashboard() {
  const auth = await checkAuth();
  if (!auth.ok) { window.location.href = '/'; return; }

  const full = await API.get('/api/bio/me/full');
  if (!full.ok) { showToast('Failed to load bio', 'error'); return; }

  bioData = full.bio;
  linksData = full.bio.links || [];
  galleryData = full.bio.gallery || [];

  populateProfile();
  populateLinks();
  populateAppearance();
  populateMedia();
  populateGallery();
  populateSeo();
  populateAnalytics();

  updateNav();
}

/* ── PROFILE ── */
function populateProfile() {
  document.getElementById('profName').value = bioData.displayName || '';
  document.getElementById('profTagline').value = bioData.tagline || '';
  document.getElementById('profBio').value = bioData.bio || '';
  document.getElementById('profPronouns').value = bioData.pronouns || '';
  document.getElementById('profLocation').value = bioData.location || '';
  document.getElementById('profAvatar').value = bioData.avatarUrl || '';
  document.getElementById('profShowViews').checked = bioData.showViews === 1;
  document.getElementById('profPublished').checked = bioData.published === 1;

  const socials = bioData.socials || {};
  document.getElementById('socTwitter').value = socials.twitter || '';
  document.getElementById('socGithub').value = socials.github || '';
  document.getElementById('socDiscord').value = socials.discord || '';
  document.getElementById('socInstagram').value = socials.instagram || '';
  document.getElementById('socTiktok').value = socials.tiktok || '';
  document.getElementById('socYoutube').value = socials.youtube || '';

  const preview = document.getElementById('profAvatarPreview');
  if (bioData.avatarUrl) {
    preview.src = bioData.avatarUrl;
    preview.style.display = 'block';
  }
  document.getElementById('profAvatar').addEventListener('input', e => {
    if (e.target.value) { preview.src = e.target.value; preview.style.display = 'block'; }
  });

  document.getElementById('statViews').textContent = (bioData.views || 0).toLocaleString();
}

async function saveProfile() {
  const body = {
    displayName: document.getElementById('profName').value,
    tagline: document.getElementById('profTagline').value,
    bio: document.getElementById('profBio').value,
    pronouns: document.getElementById('profPronouns').value,
    location: document.getElementById('profLocation').value,
    avatarUrl: document.getElementById('profAvatar').value,
    showViews: document.getElementById('profShowViews').checked ? 1 : 0,
    published: document.getElementById('profPublished').checked ? 1 : 0,
    socials: JSON.stringify({
      twitter: document.getElementById('socTwitter').value,
      github: document.getElementById('socGithub').value,
      discord: document.getElementById('socDiscord').value,
      instagram: document.getElementById('socInstagram').value,
      tiktok: document.getElementById('socTiktok').value,
      youtube: document.getElementById('socYoutube').value,
    }),
  };
  const r = await API.put('/api/bio/me', body);
  if (r.ok) showToast('Profile saved!', 'success');
  else showToast('Failed to save', 'error');
}

/* ── LINKS ── */
function populateLinks() {
  renderLinks();
}

function renderLinks() {
  const builder = document.getElementById('linkBuilder');
  builder.innerHTML = linksData.map((link, i) => `
    <div class="drag-item" draggable="true" data-index="${i}" data-id="${link.id || ''}">
      <div class="drag-handle" title="Drag to reorder">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
      <input type="text" placeholder="Title" value="${escapeHtml(link.title || '')}" onchange="updateLink(${i}, 'title', this.value)">
      <input type="text" placeholder="URL" value="${escapeHtml(link.url || '')}" onchange="updateLink(${i}, 'url', this.value)">
      <input type="text" placeholder="Description" value="${escapeHtml(link.description || '')}" onchange="updateLink(${i}, 'description', this.value)">
      <input type="text" placeholder="Password (optional)" value="${escapeHtml(link.password || '')}" onchange="updateLink(${i}, 'password', this.value)" style="max-width: 140px;">
      <button class="del-btn" onclick="removeLink(${i})" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('');

  builder.querySelectorAll('.drag-item').forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}

function handleDragStart(e) {
  dragSrc = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}
function handleDrop(e) {
  e.stopPropagation();
  if (dragSrc !== this) {
    const fromIdx = parseInt(dragSrc.dataset.index);
    const toIdx = parseInt(this.dataset.index);
    const [moved] = linksData.splice(fromIdx, 1);
    linksData.splice(toIdx, 0, moved);
    renderLinks();
  }
  return false;
}
function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.drag-item').forEach(i => i.classList.remove('dragging'));
}

function addLink() {
  linksData.push({ title: '', url: '', description: '', icon: '', tag: '', password: '', sortOrder: linksData.length });
  renderLinks();
}
function updateLink(i, field, value) {
  linksData[i][field] = value;
}
function removeLink(i) {
  linksData.splice(i, 1);
  renderLinks();
}

async function saveLinks() {
  const valid = linksData.filter(l => l.title && l.url);
  for (const link of valid) {
    if (link.id) {
      await API.put(`/api/links/${link.id}`, link);
    } else {
      const r = await API.post('/api/links', link);
      if (r.ok) link.id = r.id;
    }
  }
  // Reorder
  const order = valid.map(l => l.id).filter(Boolean);
  if (order.length) await API.post('/api/links/reorder', { order });
  showToast('Links saved!', 'success');
}

/* ── APPEARANCE ── */
function populateAppearance() {
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = themes.map(t => `
    <div class="theme-option ${bioData.theme === t.id ? 'active' : ''}" onclick="selectTheme('${t.id}')" style="background: ${t.bg}; color: ${t.accent}; border-color: ${bioData.theme === t.id ? t.accent : 'var(--border)'};">
      <div style="font-weight: 700; font-size: 12px;">${t.name}</div>
    </div>
  `).join('');

  document.getElementById('accentColor').value = bioData.accentColor || '#7c6aff';
  document.getElementById('btnStyle').value = bioData.btnStyle || 'pill';
  document.getElementById('bgType').value = bioData.bgType || 'gradient';
  document.getElementById('bgValue').value = bioData.bgValue || '';
  document.getElementById('effParticles').checked = bioData.particlesEnabled === 1;
  document.getElementById('effCursor').checked = bioData.cursorTrail === 1;
  document.getElementById('effSnow').checked = bioData.snowEnabled === 1;
}

let selectedTheme = bioData?.theme || 'dark';
function selectTheme(id) {
  selectedTheme = id;
  document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
  const theme = themes.find(t => t.id === id);
  const el = document.querySelector(`.theme-option[onclick="selectTheme('${id}')"]`);
  if (el) {
    el.classList.add('active');
    el.style.borderColor = theme.accent;
  }
}

async function saveAppearance() {
  const r = await API.put('/api/bio/me', {
    theme: selectedTheme,
    accentColor: document.getElementById('accentColor').value,
    btnStyle: document.getElementById('btnStyle').value,
    bgType: document.getElementById('bgType').value,
    bgValue: document.getElementById('bgValue').value,
    particlesEnabled: document.getElementById('effParticles').checked ? 1 : 0,
    cursorTrail: document.getElementById('effCursor').checked ? 1 : 0,
    snowEnabled: document.getElementById('effSnow').checked ? 1 : 0,
  });
  if (r.ok) showToast('Appearance saved!', 'success');
  else showToast('Failed to save', 'error');
}

/* ── MEDIA ── */
function populateMedia() {
  const music = bioData.music;
  if (music) {
    document.getElementById('musicType').value = music.type || 'spotify';
    document.getElementById('musicUrl').value = music.url || '';
    document.getElementById('musicAutoplay').checked = music.autoplay === 1;
  }
  const video = bioData.video;
  if (video) {
    document.getElementById('videoType').value = video.type || 'youtube';
    document.getElementById('videoUrl').value = video.url || '';
    document.getElementById('videoTitle').value = video.title || '';
  }
}

async function saveMedia() {
  const r1 = await API.put('/api/media/music', {
    type: document.getElementById('musicType').value,
    url: document.getElementById('musicUrl').value,
    autoplay: document.getElementById('musicAutoplay').checked,
  });
  const r2 = await API.put('/api/media/video', {
    type: document.getElementById('videoType').value,
    url: document.getElementById('videoUrl').value,
    title: document.getElementById('videoTitle').value,
  });
  if (r1.ok && r2.ok) showToast('Media saved!', 'success');
  else showToast('Failed to save media', 'error');
}

/* ── GALLERY ── */
function populateGallery() {
  renderGallery();
}

function renderGallery() {
  const grid = document.getElementById('galleryUploader');
  grid.innerHTML = galleryData.map((img, i) => `
    <div class="gallery-slot">
      <img src="${escapeHtml(img.imageUrl || '')}" alt="Gallery">
      <button class="remove-img" onclick="removeGalleryImage(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');

  // Add empty slots
  for (let i = galleryData.length; i < 6; i++) {
    grid.innerHTML += `
      <div class="gallery-slot" onclick="document.getElementById('galleryInput').focus()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span style="font-size: 11px; margin-top: 4px;">Add</span>
      </div>
    `;
  }
}

function addGalleryImage() {
  const url = document.getElementById('galleryInput').value.trim();
  if (!url) return;
  galleryData.push({ imageUrl: url, caption: '', sortOrder: galleryData.length });
  document.getElementById('galleryInput').value = '';
  renderGallery();
}

function removeGalleryImage(i) {
  galleryData.splice(i, 1);
  renderGallery();
}

async function saveGallery() {
  for (const img of galleryData) {
    if (img.id) continue;
    const r = await API.post('/api/gallery', { imageUrl: img.imageUrl, caption: img.caption || '' });
    if (r.ok) img.id = r.id;
  }
  showToast('Gallery saved!', 'success');
}

/* ── SEO ── */
function populateSeo() {
  document.getElementById('seoTitle').value = bioData.seoTitle || '';
  document.getElementById('seoDesc').value = bioData.seoDesc || '';
  document.getElementById('seoImage').value = bioData.seoImage || '';
}

async function saveSeo() {
  const r = await API.put('/api/bio/me', {
    seoTitle: document.getElementById('seoTitle').value,
    seoDesc: document.getElementById('seoDesc').value,
    seoImage: document.getElementById('seoImage').value,
  });
  if (r.ok) showToast('SEO saved!', 'success');
  else showToast('Failed to save', 'error');
}

/* ── ANALYTICS ── */
async function populateAnalytics() {
  const r = await API.get('/api/analytics/me');
  if (!r.ok) return;
  const a = r.analytics;
  document.getElementById('aTotalViews').textContent = (a.totalViews || 0).toLocaleString();
  document.getElementById('aTodayViews').textContent = (a.todayViews || 0).toLocaleString();
  document.getElementById('aTotalClicks').textContent = (a.totalClicks || 0).toLocaleString();

  // View chart
  const chart = document.getElementById('viewChart');
  const history = a.viewHistory || [];
  if (history.length === 0) {
    chart.innerHTML = '<p style="color: var(--muted); text-align: center;">No data yet</p>';
  } else {
    const max = Math.max(...history.map(h => h.count), 1);
    chart.innerHTML = history.map(h => {
      const h_pct = (h.count / max) * 100;
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <div style="width: 100%; background: var(--surface); border-radius: var(--rad-sm); height: 120px; position: relative; overflow: hidden;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, var(--accent), var(--accent-2)); height: ${h_pct}%; border-radius: var(--rad-sm); transition: height 0.6s ease-out;"></div>
          </div>
          <span style="font-size: 10px; color: var(--muted); text-transform: uppercase;">${h.day?.slice(5) || ''}</span>
          <span style="font-size: 11px; font-weight: 600; color: var(--accent);">${h.count}</span>
        </div>
      `;
    }).join('');
  }

  // Top links
  const topLinks = document.getElementById('topLinks');
  if (a.topLinks && a.topLinks.length) {
    topLinks.innerHTML = a.topLinks.map(l => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--rad-sm); background: var(--accent-dim); display: flex; align-items: center; justify-content: center; color: var(--accent);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <div>
            <div style="font-weight: 600; font-size: 14px;">${escapeHtml(l.title || '')}</div>
            <div style="font-size: 11px; color: var(--muted);">${escapeHtml(l.url || '')}</div>
          </div>
        </div>
        <div style="font-size: 14px; font-weight: 700; color: var(--accent);">${l.clicks || 0}</div>
      </div>
    `).join('');
  } else {
    topLinks.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">No clicks yet</p>';
  }
}

/* ── TABS ── */
function switchTab(name) {
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelector(`.sidebar-item[onclick="switchTab('${name}')"]`)?.classList.add('active');
  document.getElementById(`tab-${name}`)?.classList.add('active');
  if (name === 'analytics') populateAnalytics();
}

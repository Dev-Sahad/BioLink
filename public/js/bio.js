/* ═══════════════════════════════════════════════════════════════
   Bio Page Renderer
   ═══════════════════════════════════════════════════════════════ */

const socialIcons = {
  twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  github: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  discord: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
  tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
};

function showBioError(title, message) {
  document.title = `${title} — BioLink`;
  const card = document.getElementById('bioCard');
  if (card) {
    card.innerHTML = `
      <div style="padding: 20px 0;">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;border:2px solid var(--border);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div style="font-size:1.4rem;font-weight:700;margin-bottom:10px;">${title}</div>
        <p style="font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:28px;">${message}</p>
        <a href="/" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Back to Home
        </a>
      </div>
    `;
  }
}

async function renderBioPage(username) {
  // Track view
  await fetch(`/api/analytics/view/${username}`, { method: 'POST', credentials: 'include' }).catch(() => {});

  let r;
  try {
    const resp = await fetch(`/api/bio/public/${username}`, { credentials: 'include' });
    r = await resp.json();
    if (!r.ok) {
      showBioError('Not found', `No bio page exists for <strong>@${escapeHtml(username)}</strong>. It may have been removed or the link is incorrect.`);
      return;
    }
  } catch (e) {
    showBioError('Something went wrong', 'We had trouble loading this page. Please try again in a moment.');
    return;
  }

  const bio = r.bio;

  // SEO
  document.title = bio.seoTitle || `${bio.displayName || bio.username} | BioLink`;
  document.getElementById('pageDesc').content = bio.seoDesc || bio.bio || '';
  document.getElementById('ogTitle').content = bio.seoTitle || bio.displayName || '';
  document.getElementById('ogDesc').content = bio.seoDesc || bio.bio || '';
  document.getElementById('ogImage').content = bio.seoImage || bio.avatarUrl || '';
  document.getElementById('twImage').content = bio.seoImage || bio.avatarUrl || '';

  // Apply theme
  if (bio.theme === 'light') document.body.classList.add('light-theme');
  if (bio.theme === 'cyber') document.body.classList.add('cyber-theme');
  if (bio.theme === 'neon') document.body.classList.add('neon-theme');
  if (bio.theme === 'midnight') document.body.classList.add('midnight-theme');
  if (bio.theme === 'sunset') document.body.classList.add('sunset-theme');
  if (bio.theme === 'ocean') document.body.classList.add('ocean-theme');
  if (bio.theme === 'forest') document.body.classList.add('forest-theme');
  if (bio.accentColor) {
    document.documentElement.style.setProperty('--accent', bio.accentColor);
  }
  if (bio.bgValue) {
    if (bio.bgType === 'solid') document.body.style.background = bio.bgValue;
    if (bio.bgType === 'gradient') document.body.style.background = bio.bgValue;
  }

  // Background video
  if (bio.bgVideo) {
    let videoBg = '';
    const ytMatch = bio.bgVideo.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      videoBg = `<div style="position:fixed;inset:0;z-index:0;overflow:hidden;">
        <iframe src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${ytMatch[1]}" frameborder="0" allow="autoplay" style="position:absolute;width:200%;height:200%;top:-50%;left:-50%;pointer-events:none;"></iframe>
      </div>`;
    } else {
      videoBg = `<div style="position:fixed;inset:0;z-index:0;overflow:hidden;">
        <video src="${bio.bgVideo}" autoplay muted loop playsinline style="position:absolute;width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>
      </div>`;
    }
    document.body.insertAdjacentHTML('afterbegin', videoBg);
    document.body.style.background = 'transparent';
  }

  // Custom CSS
  if (bio.customCSS) {
    const style = document.createElement('style');
    style.textContent = bio.customCSS;
    document.head.appendChild(style);
  }

  // Audio
  if (bio.audioUrl) {
    const audio = document.createElement('audio');
    audio.src = bio.audioUrl;
    audio.autoplay = true;
    audio.loop = true;
    audio.volume = 0.3;
    audio.style.display = 'none';
    document.body.appendChild(audio);
  }

  // Avatar
  const avatar = document.getElementById('bioAvatar');
  avatar.src = bio.avatarUrl || '/assets/avatar.svg';
  avatar.onerror = () => { avatar.src = '/assets/avatar.svg'; };

  // Text
  document.getElementById('bioName').textContent = bio.displayName || bio.username;
  document.getElementById('bioTagline').textContent = bio.tagline || '';
  document.getElementById('bioPronouns').textContent = bio.pronouns || '';
  document.getElementById('bioBio').textContent = bio.bio || '';
  document.getElementById('bioLocation').textContent = bio.location || '';

  // Socials
  const socials = bio.socials || {};
  const socialsEl = document.getElementById('bioSocials');
  let socialsHTML = '';
  Object.entries(socials).forEach(([platform, handle]) => {
    if (!handle) return;
    const icon = socialIcons[platform] || '';
    let url = '';
    if (platform === 'twitter') url = `https://twitter.com/${handle}`;
    if (platform === 'github') url = `https://github.com/${handle}`;
    if (platform === 'discord') url = '#';
    if (platform === 'instagram') url = `https://instagram.com/${handle}`;
    if (platform === 'tiktok') url = `https://tiktok.com/@${handle}`;
    if (platform === 'youtube') url = `https://youtube.com/${handle}`;
    socialsHTML += `<a href="${url}" target="_blank" rel="noopener" class="social-icon" title="${platform}">${icon}</a>`;
  });
  socialsEl.innerHTML = socialsHTML;

  // Links with click count
  const linksEl = document.getElementById('bioLinks');
  linksEl.innerHTML = (bio.links || []).map(link => {
    const tag = link.tag ? `<span class="bio-link-tag">${escapeHtml(link.tag)}</span>` : '';
    const clickCount = link.clicks ? `<span class="click-count">${link.clicks} clicks</span>` : '';
    const lockIcon = link.password ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--warn);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` : '';
    return `
      <div class="bio-link" onclick="trackClick(${link.id}, '${link.url}', ${link.password ? `'${link.password}'` : 'null'})" style="${link.password ? 'border-color:var(--warn);' : ''}">
        <div class="bio-link-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </div>
        <div class="bio-link-info">
          <div class="bio-link-title">${escapeHtml(link.title || '')} ${lockIcon}</div>
          <div class="bio-link-desc">${escapeHtml(link.description || '')}</div>
        </div>
        ${tag}
        ${clickCount}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--muted);flex-shrink:0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </div>
    `;
  }).join('');

  // Music
  const musicEl = document.getElementById('bioMusic');
  if (bio.music && bio.music.url) {
    const height = bio.music.type === 'spotify' ? '80' : '166';
    musicEl.innerHTML = `<iframe src="${bio.music.url}" width="100%" height="${height}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
  }

  // Video
  const videoEl = document.getElementById('bioVideo');
  if (bio.video && bio.video.url) {
    let embedUrl = bio.video.url;
    if (bio.video.type === 'youtube') {
      const vid = bio.video.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      if (vid) embedUrl = `https://www.youtube.com/embed/${vid[1]}`;
    }
    if (bio.video.type === 'vimeo') {
      const vid = bio.video.url.match(/(?:vimeo\.com\/)(\d+)/);
      if (vid) embedUrl = `https://player.vimeo.com/video/${vid[1]}`;
    }
    if (bio.video.type === 'mp4') {
      videoEl.innerHTML = `<video src="${embedUrl}" controls style="width:100%;border-radius:var(--rad);"></video>`;
    } else {
      videoEl.innerHTML = `<iframe src="${embedUrl}" width="100%" height="280" frameborder="0" allow="autoplay; fullscreen"></iframe>`;
    }
  }

  // Gallery
  const galleryEl = document.getElementById('bioGallery');
  if (bio.gallery && bio.gallery.length) {
    galleryEl.innerHTML = bio.gallery.map(img =>
      `<img src="${escapeHtml(img.imageUrl || '')}" alt="Gallery" onclick="window.open(this.src, '_blank')">`
    ).join('');
  } else {
    galleryEl.style.display = 'none';
  }

  // Views
  const viewsEl = document.getElementById('bioViews');
  if (bio.showViews) {
    viewsEl.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      <span>${(bio.views || 0).toLocaleString()} views</span>
    `;
  } else {
    viewsEl.style.display = 'none';
  }

  // QR code
  const qrEl = document.getElementById('bioQR');
  if (qrEl) {
    fetch(`/api/bio/qr/${username}`).then(r => r.json()).then(r => {
      if (r.ok && r.qr) qrEl.innerHTML = `<img src="${r.qr}" alt="QR" style="width:120px;height:120px;border-radius:var(--rad);border:2px solid var(--border);cursor:pointer;" onclick="window.open(this.src, '_blank')">`;
    });
  }

  // Particles
  if (bio.particlesEnabled) {
    initParticles('particle-canvas', { count: 50, connect: true, speed: 0.3 });
  }

  // Snowfall
  if (bio.snowEnabled) {
    initSnowfall();
  }
}

function initSnowfall() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const flakes = [];
  for (let i = 0; i < 60; i++) {
    flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 3 + 1, s: Math.random() * 1 + 0.5, d: Math.random() * 2 });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    flakes.forEach(f => {
      f.y += f.s; f.x += Math.sin(f.d) * 0.5;
      if (f.y > h) { f.y = -10; f.x = Math.random() * w; }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
}

async function trackClick(linkId, url, password) {
  if (password) {
    const input = prompt('This link is password-protected. Enter password:');
    if (input !== password) { alert('Incorrect password'); return; }
  }
  if (linkId) {
    await fetch(`/api/analytics/click/${linkId}`, { method: 'POST', credentials: 'include' }).catch(() => {});
  }
  window.open(url, '_blank');
}

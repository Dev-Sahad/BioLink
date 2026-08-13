/* ═══════════════════════════════════════════════════════════════
   BioLink Premium — Shared App Layer
   ═══════════════════════════════════════════════════════════════ */

const API = {
  async request(url, options = {}) {
    try {
      const r = await fetch(url, { credentials: 'include', ...options });
      const contentType = r.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await r.json();
      }
      return { ok: r.ok, msg: r.statusText || `Request failed (${r.status})` };
    } catch (e) {
      return { ok: false, msg: 'Network error' };
    }
  },
  get(url) {
    return this.request(url);
  },
  post(url, body) {
    return this.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  },
  put(url, body) {
    return this.request(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  },
  del(url) {
    return this.request(url, { method: 'DELETE' });
  }
};

let currentUser = null;

async function checkAuth() {
  const r = await API.get('/api/auth/me');
  if (r.ok) currentUser = r.user;
  return r;
}

async function logout() {
  await API.post('/api/auth/logout');
  currentUser = null;
  window.location.href = '/';
}

/* updateNav can be called with no args (uses currentUser) or overridden per-page */
function updateNav(authResponse) {
  // If called from checkAuth().then(updateNav), authResponse is {ok, user}
  // Update currentUser if provided
  if (authResponse && typeof authResponse === 'object' && 'ok' in authResponse) {
    if (authResponse.ok && authResponse.user) currentUser = authResponse.user;
  }
  const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
  if (!navLinks) return;
  if (currentUser) {
    navLinks.innerHTML = `
      <a href="/dashboard" class="btn btn-ghost btn-sm">Dashboard</a>
      ${currentUser.role === 'admin' ? '<a href="/admin" class="btn btn-ghost btn-sm">Admin</a>' : ''}
      <span class="badge badge-active">${escapeHtml(currentUser.username)}</span>
      <button onclick="logout()" class="btn btn-ghost btn-sm" title="Logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    `;
  } else {
    navLinks.innerHTML = `
      <a href="/login" class="btn btn-ghost btn-sm">Log In</a>
      <a href="/register" class="btn btn-primary btn-sm">Get Started</a>
    `;
  }
}

/* ── GLOBAL MODAL HELPERS ── */
/* Never redirect in a loop — use sessionStorage to signal which modal to open */
function openLoginModal() {
  // Authentication has its own route. This avoids relying on an inline modal
  // that may not be present on every page (or after an intermediary rewrites
  // the document).
  window.location.assign('/login');
}
function openRegisterModal() {
  window.location.assign('/register');
}
function oauthLogin(provider) {
  window.location.href = `/api/auth/oauth/${provider}`;
}

/* Called on index.html after DOM ready — opens any pending modal from redirect */
function checkPendingModal() {
  sessionStorage.removeItem('_modalRedirecting');
  const pending = sessionStorage.getItem('_openModal');
  if (pending) {
    sessionStorage.removeItem('_openModal');
    if (pending === 'login') openLoginModal();
    else if (pending === 'register') openRegisterModal();
  }
  // Also support legacy ?login=1 / ?register=1 query params
  const p = new URLSearchParams(window.location.search);
  if (p.get('login') === '1') openLoginModal();
  if (p.get('register') === '1') openRegisterModal();
  // Clean URL
  if (p.has('login') || p.has('register')) {
    history.replaceState(null, '', window.location.pathname);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = {
    success: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };
  toast.innerHTML = `${icons[type] || icons.info} <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s ease-out';
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

/* ── IMAGE FALLBACK ── */
function handleImgError(img, fallbackText) {
  const text = fallbackText || (img.alt ? img.alt[0].toUpperCase() : '?');
  const div = document.createElement('div');
  div.className = 'bio-avatar-fallback';
  div.textContent = text;
  div.style.width = img.style.width || img.width + 'px' || '120px';
  div.style.height = img.style.height || img.height + 'px' || '120px';
  img.parentNode.replaceChild(div, img);
}

/* ── GLOBAL IMG ERROR FALLBACK ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = 'true';
        img.style.display = 'none';
      }
    });
  });
});


/* ── PARTICLE SYSTEM ── */
function initParticles(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const count = options.count || 60;
  const speed = options.speed || 0.5;
  const connect = options.connect !== false;
  const colors = options.colors || ['rgba(124,106,255,0.6)', 'rgba(255,106,240,0.4)', 'rgba(0,212,255,0.4)'];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      if (connect) {
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(124,106,255,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse interaction
      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 100) {
        p.x += mdx * 0.01;
        p.y += mdy * 0.01;
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── GLITCH EFFECT ── */
function initGlitch(element, intensity = 0.3) {
  if (!element) return;
  const text = element.textContent;
  element.setAttribute('data-text', text);
  let interval;
  function glitch() {
    if (Math.random() > 1 - intensity) {
      element.style.clipPath = `inset(${Math.random() * 100}% 0 ${Math.random() * 100}% 0)`;
      element.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
      setTimeout(() => {
        element.style.clipPath = 'inset(0)';
        element.style.transform = 'translate(0,0)';
      }, 50 + Math.random() * 100);
    }
  }
  interval = setInterval(glitch, 3000);
  return () => clearInterval(interval);
}

/* ── INTERSECTION OBSERVER ── */
function initScrollReveal(selector, options = {}) {
  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        if (options.once !== false) observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, ...options });
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
}

/* ── MODAL SYSTEM ── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAllModals();
});

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    closeAllModals();
  }
});

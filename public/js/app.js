/* ═══════════════════════════════════════════════════════════════
   BioLink Premium — Shared App Layer
   ═══════════════════════════════════════════════════════════════ */

const API = {
  async get(url) {
    const r = await fetch(url, { credentials: 'include' });
    return r.json();
  },
  async post(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    return r.json();
  },
  async put(url, body) {
    const r = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    return r.json();
  },
  async del(url) {
    const r = await fetch(url, { method: 'DELETE', credentials: 'include' });
    return r.json();
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

function updateNav() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  if (currentUser) {
    navLinks.innerHTML = `
      <a href="/dashboard" class="btn btn-ghost btn-sm">Dashboard</a>
      ${currentUser.role === 'admin' ? '<a href="/admin" class="btn btn-ghost btn-sm">Admin</a>' : ''}
      <span class="badge badge-active">${escapeHtml(currentUser.username)}</span>
      <button onclick="logout()" class="btn btn-ghost btn-sm" title="Logout">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    `;
  } else {
    navLinks.innerHTML = `
      <button onclick="openLoginModal()" class="btn btn-ghost btn-sm">Log In</button>
      <button onclick="openRegisterModal()" class="btn btn-primary btn-sm">Get Started</button>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  const colors = {
    info: 'border-color: var(--accent); color: var(--accent);',
    success: 'border-color: var(--success); color: var(--success);',
    error: 'border-color: var(--danger); color: var(--danger);',
  };
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 200;
    background: var(--surface); border: 1px solid; ${colors[type] || colors.info}
    border-radius: var(--rad); padding: 14px 20px;
    font-size: 14px; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: slideUp 0.3s ease-out;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

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

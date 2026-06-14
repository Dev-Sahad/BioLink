/* ═══════════════════════════════════════════════════════════════
   Admin Dashboard Controller
   ═══════════════════════════════════════════════════════════════ */

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

let allUsers = [];
let adminStats = null;

async function loadAdmin() {
  const auth = await checkAuth();
  if (!auth.ok || auth.user.role !== 'admin') {
    window.location.href = '/';
    return;
  }

  await loadStats();
  await loadUsers();
  await loadDomains();
  await loadSettings();
  updateNav();
}

async function loadStats() {
  const r = await API.get('/api/admin/stats');
  if (!r.ok) return;
  adminStats = r.stats;
  document.getElementById('stUsers').textContent = r.stats.totalUsers.toLocaleString();
  document.getElementById('stBios').textContent = r.stats.totalBios.toLocaleString();
  document.getElementById('stViews').textContent = r.stats.totalViews.toLocaleString();
  document.getElementById('stClicks').textContent = r.stats.totalClicks.toLocaleString();
  document.getElementById('stTodayViews').textContent = r.stats.todayViews.toLocaleString();
  document.getElementById('stTodayClicks').textContent = r.stats.todayClicks.toLocaleString();
}

async function loadUsers() {
  const r = await API.get('/api/admin/users');
  if (!r.ok) return;
  allUsers = r.users;
  renderUsers(allUsers);
}

function renderUsers(users) {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-dim); display: flex; align-items: center; justify-content: center; color: var(--accent); font-size: 12px; font-weight: 700;">
            ${u.username[0].toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 600;">${escapeHtml(u.username)}</div>
            <div style="font-size: 12px; color: var(--muted);">${escapeHtml(u.displayName || '')}</div>
          </div>
        </div>
      </td>
      <td style="font-size: 13px; color: var(--muted);">${escapeHtml(u.email)}</td>
      <td>
        <select class="role-select" onchange="changeRole(${u.id}, this.value)">
          <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="mod" ${u.role === 'mod' ? 'selected' : ''}>Mod</option>
        </select>
      </td>
      <td>
        <span class="badge ${u.suspended ? 'badge-danger' : 'badge-active'}">
          ${u.suspended ? 'Suspended' : 'Active'}
        </span>
      </td>
      <td style="font-size: 13px; color: var(--muted);">${new Date(u.createdAt).toLocaleDateString()}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="action-btn ${u.suspended ? '' : 'danger'}" onclick="toggleSuspend(${u.id}, ${u.suspended ? 0 : 1})" title="${u.suspended ? 'Unsuspend' : 'Suspend'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${u.suspended
                ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
                : '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'}
            </svg>
          </button>
          <button class="action-btn danger" onclick="deleteUser(${u.id})" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterUsers() {
  const query = document.getElementById('userSearch').value.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.username.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    (u.displayName || '').toLowerCase().includes(query)
  );
  renderUsers(filtered);
}

async function changeRole(id, role) {
  const r = await API.put(`/api/admin/users/${id}/role`, { role });
  if (r.ok) showToast('Role updated', 'success');
  else showToast('Failed', 'error');
}

async function toggleSuspend(id, suspend) {
  const r = await API.put(`/api/admin/users/${id}/suspend`, { suspended: suspend });
  if (r.ok) {
    showToast(suspend ? 'User suspended' : 'User unsuspended', 'success');
    await loadUsers();
  } else showToast('Failed', 'error');
}

async function deleteUser(id) {
  if (!confirm('Are you sure? This cannot be undone.')) return;
  const r = await API.del(`/api/admin/users/${id}`);
  if (r.ok) {
    showToast('User deleted', 'success');
    await loadUsers();
    await loadStats();
  } else showToast('Failed', 'error');
}

async function loadDomains() {
  const r = await API.get('/api/admin/domains');
  if (!r.ok) return;
  const list = document.getElementById('domainsList');
  if (r.domains && r.domains.length) {
    list.innerHTML = r.domains.map(d => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px; border-bottom: 1px solid var(--border);">
        <div>
          <div style="font-weight: 600;">${escapeHtml(d.domain)}</div>
          <div style="font-size: 12px; color: var(--muted);">${escapeHtml(d.username)}</div>
        </div>
        <span class="badge ${d.verified ? 'badge-active' : 'badge-new'}">${d.verified ? 'Verified' : 'Pending'}</span>
      </div>
    `).join('');
  } else {
    list.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px;">No custom domains yet</p>';
  }
}

async function loadSettings() {
  const r = await API.get('/api/admin/settings');
  if (!r.ok) return;
  const s = r.settings;
  document.getElementById('setName').value = s.platformName || '';
  document.getElementById('setRegister').checked = s.allowRegister === 1;
  document.getElementById('setShowViews').checked = s.showViews === 1;
  document.getElementById('setMaintenance').checked = s.maintenance === 1;
}

async function saveSettings() {
  const r = await API.put('/api/admin/settings', {
    platformName: document.getElementById('setName').value,
    allowRegister: document.getElementById('setRegister').checked,
    showViews: document.getElementById('setShowViews').checked,
    maintenance: document.getElementById('setMaintenance').checked,
  });
  if (r.ok) showToast('Settings saved!', 'success');
  else showToast('Failed', 'error');
}

function switchTab(name) {
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelector(`.sidebar-item[onclick="switchTab('${name}')"]`)?.classList.add('active');
  document.getElementById(`tab-${name}`)?.classList.add('active');
  if (name === 'users') loadUsers();
  if (name === 'domains') loadDomains();
}

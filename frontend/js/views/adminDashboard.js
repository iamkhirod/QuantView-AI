/**
 * QuantView AI — Protected Admin Command Center View
 * Strictly checks administrator authorization role.
 */

const AdminDashboardView = (function () {
  'use strict';

  async function render(container) {
    const user = window.Auth ? window.Auth.getUser() : null;
    if (!user || user.role !== "admin") {
      container.innerHTML = `
        <div class="auth-page-wrapper">
          <div class="card card-elevated" style="text-align: center; padding: 3rem 2rem; max-width: 480px; border-color: var(--color-bearish-border);">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🚫</div>
            <h2 style="font-family: var(--font-display); color: var(--color-bearish); margin-bottom: 0.5rem;">Access Forbidden</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">
              Administrator privileges are required to access this command center. Your current role is <strong>${user ? user.role : 'unauthenticated'}</strong>.
            </p>
            <a href="#dashboard" class="btn btn-primary">Return to User Dashboard</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="app-container">
        ${window.Sidebar.render("admin")}

        <main class="main-content">
          <!-- Admin Header -->
          <div class="dashboard-welcome">
            <div class="welcome-text">
              <div class="flex items-center gap-2">
                <h1>Administrative Command Center</h1>
                <span class="admin-badge">Admin Mode</span>
              </div>
              <p>Platform telemetry, user store management, and security audit logs</p>
            </div>
            <div class="flex items-center gap-2">
              <button id="refresh-admin-data-btn" class="btn btn-secondary btn-sm">
                🔄 Refresh Metrics
              </button>
            </div>
          </div>

          <!-- System Statistics KPI Grid -->
          <div class="metrics-overview-grid" id="admin-stats-grid">
            <div class="metric-kpi-card">
              <span class="metric-label">Total Users</span>
              <span id="stat-total-users" class="metric-value">...</span>
              <span class="metric-sub" id="stat-active-users">Active: ...</span>
            </div>
            <div class="metric-kpi-card">
              <span class="metric-label">Total Administrators</span>
              <span id="stat-total-admins" class="metric-value text-bearish">...</span>
              <span class="metric-sub">Role RBAC Enforced</span>
            </div>
            <div class="metric-kpi-card">
              <span class="metric-label">Audit Logs Recorded</span>
              <span id="stat-total-activities" class="metric-value text-accent">...</span>
              <span class="metric-sub">Persistent SQLite Trail</span>
            </div>
            <div class="metric-kpi-card">
              <span class="metric-label">Server Uptime</span>
              <span id="stat-server-uptime" class="metric-value font-mono" style="font-size: 1.3rem;">...</span>
              <span class="metric-sub" id="stat-engine">SQLite 3</span>
            </div>
          </div>

          <!-- User Management Section -->
          <div class="card" style="margin-bottom: 2rem;">
            <div class="card-header">
              <div>
                <h3 class="card-title">User Accounts &amp; Access Control</h3>
                <p class="card-subtitle">Manage user permissions, active status, and authorization tiers</p>
              </div>
              <span class="badge badge-gray" id="user-count-badge">Loading users...</span>
            </div>

            <div id="admin-users-table-container">
              <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">
                Querying SQLite user records...
              </div>
            </div>
          </div>

          <!-- Platform Activity & Audit Logs -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Security &amp; Activity Audit Trail</h3>
                <p class="card-subtitle">Comprehensive tamper-proof log of logins, registrations, and account actions</p>
              </div>
              <span class="badge badge-gray">Last 50 Entries</span>
            </div>

            <div id="admin-activities-table-container">
              <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">
                Loading audit activities...
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    // Load Data
    loadStats();
    loadUsers();
    loadActivities();

    // Bind Refresh button
    document.getElementById("refresh-admin-data-btn")?.addEventListener("click", () => {
      loadStats();
      loadUsers();
      loadActivities();
      window.Toast.info("Admin metrics refreshed.");
    });
  }

  async function loadStats() {
    try {
      const stats = await window.Api.getAdminStats();
      document.getElementById("stat-total-users").textContent = stats.total_users || 0;
      document.getElementById("stat-active-users").textContent = `Active: ${stats.active_users || 0} accounts`;
      document.getElementById("stat-total-admins").textContent = stats.total_admins || 0;
      document.getElementById("stat-total-activities").textContent = stats.total_activities || 0;

      const uptimeSec = stats.server_uptime_seconds || 0;
      const hours = Math.floor(uptimeSec / 3600);
      const mins = Math.floor((uptimeSec % 3600) / 60);
      document.getElementById("stat-server-uptime").textContent = `${hours}h ${mins}m`;
      document.getElementById("stat-engine").textContent = `${stats.database_engine || 'SQLite'} &bull; ${stats.total_api_requests || 0} requests`;
    } catch (e) {
      console.warn("Failed to load admin stats:", e);
    }
  }

  async function loadUsers() {
    const container = document.getElementById("admin-users-table-container");
    const badge = document.getElementById("user-count-badge");
    if (!container) return;

    try {
      const users = await window.Api.getAdminUsers();
      if (badge) badge.textContent = `${users.length} Registered Accounts`;

      const currentAdmin = window.Auth.getUser();

      container.innerHTML = `
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User Details</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Last Login</th>
                <th style="text-align: right;">Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => {
                const isSelf = currentAdmin && currentAdmin.id === u.id;
                const statusBadge = u.is_active ? 'badge-bullish' : 'badge-bearish';
                const statusLabel = u.is_active ? 'ACTIVE' : 'SUSPENDED';
                const roleBadge = u.role === 'admin' ? 'badge-bearish' : 'badge-blue';

                return `
                  <tr>
                    <td class="font-mono text-muted">#${u.id}</td>
                    <td>
                      <div style="font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                        <span>${u.username}</span>
                        ${isSelf ? '<span class="badge badge-gray" style="font-size:0.6rem;">(You)</span>' : ''}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${u.full_name || 'No full name'}</div>
                    </td>
                    <td class="font-mono" style="font-size: 0.8rem;">${u.email}</td>
                    <td>
                      <span class="badge ${roleBadge}">${u.role}</span>
                    </td>
                    <td>
                      <span class="badge ${statusBadge}">${statusLabel}</span>
                    </td>
                    <td class="font-mono text-muted" style="font-size: 0.75rem;">${(u.created_at || '').slice(0, 10)}</td>
                    <td class="font-mono text-muted" style="font-size: 0.75rem;">${u.last_login ? u.last_login.slice(0, 16).replace('T', ' ') : 'Never'}</td>
                    <td style="text-align: right;">
                      <div class="flex items-center justify-center gap-1" style="justify-content: flex-end;">
                        <!-- Role Toggle Button -->
                        <button class="btn btn-outline btn-sm role-toggle-btn" data-id="${u.id}" data-role="${u.role}" ${isSelf ? 'disabled title="Cannot change own role"' : ''}>
                          Make ${u.role === 'admin' ? 'User' : 'Admin'}
                        </button>

                        <!-- Status Toggle Button -->
                        <button class="btn ${u.is_active ? 'btn-danger' : 'btn-primary'} btn-sm status-toggle-btn" data-id="${u.id}" data-active="${u.is_active}" ${isSelf ? 'disabled title="Cannot suspend own account"' : ''}>
                          ${u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;

      // Bind User Action Buttons
      container.querySelectorAll(".role-toggle-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const curRole = btn.getAttribute("data-role");
          const newRole = curRole === "admin" ? "user" : "admin";
          try {
            await window.Api.updateUserRole(id, newRole);
            window.Toast.success(`User #${id} role changed to ${newRole}.`);
            loadUsers();
            loadStats();
          } catch (err) {
            window.Toast.error(err.message || "Failed to update role.");
          }
        });
      });

      container.querySelectorAll(".status-toggle-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const curActive = btn.getAttribute("data-active") === "1" || btn.getAttribute("data-active") === "true";
          const newActive = !curActive;
          try {
            await window.Api.updateUserStatus(id, newActive);
            window.Toast.success(`User #${id} ${newActive ? 'activated' : 'suspended'}.`);
            loadUsers();
            loadStats();
          } catch (err) {
            window.Toast.error(err.message || "Failed to update status.");
          }
        });
      });

    } catch (err) {
      container.innerHTML = `<div style="color: var(--color-bearish); padding: 1.5rem;">Failed to load users: ${err.message}</div>`;
    }
  }

  async function loadActivities() {
    const container = document.getElementById("admin-activities-table-container");
    if (!container) return;

    try {
      const acts = await window.Api.getAdminActivities();
      if (!acts || acts.length === 0) {
        container.innerHTML = `<div style="padding: 1.5rem; color: var(--text-muted); text-align: center;">No audit logs registered yet.</div>`;
        return;
      }

      container.innerHTML = `
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Audit Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              ${acts.map(a => `
                <tr>
                  <td class="font-mono text-muted">#${a.id}</td>
                  <td class="font-mono" style="font-size: 0.75rem;">${(a.timestamp || '').slice(0, 19).replace('T', ' ')}</td>
                  <td>
                    <span class="badge ${a.action.includes('FAIL') || a.action.includes('BLOCK') ? 'badge-bearish' : 'badge-blue'}">${a.action}</span>
                  </td>
                  <td style="font-weight: 600;">${a.username || (a.user_id ? 'User #' + a.user_id : 'System')}</td>
                  <td class="text-secondary" style="font-size: 0.8rem;">${a.details || '-'}</td>
                  <td class="font-mono text-muted" style="font-size: 0.75rem;">${a.ip_address || '127.0.0.1'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color: var(--color-bearish); padding: 1.5rem;">Failed to load audit logs.</div>`;
    }
  }

  return {
    render
  };
})();

window.AdminDashboardView = AdminDashboardView;

/**
 * QuantView AI — Sidebar Navigation Component
 */

const Sidebar = (function () {
  'use strict';

  function render(activeRoute = "dashboard") {
    const user = window.Auth ? window.Auth.getUser() : null;
    const isAdmin = user && user.role === "admin";

    return `
      <aside class="sidebar-nav">
        <div class="sidebar-heading">Main Platform</div>
        <a href="#dashboard" class="sidebar-link ${activeRoute === 'dashboard' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>User Dashboard</span>
        </a>
        <a href="#analysis" class="sidebar-link ${activeRoute === 'analysis' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>Stock Analysis</span>
        </a>

        <div class="sidebar-heading">User Area</div>
        <a href="#profile" class="sidebar-link ${activeRoute === 'profile' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Profile & Settings</span>
        </a>

        ${isAdmin ? `
          <div class="sidebar-heading">Administration</div>
          <a href="#admin" class="sidebar-link ${activeRoute === 'admin' ? 'active' : ''}" style="color: #f87171;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Admin Control</span>
          </a>
        ` : ''}

        <div style="margin-top: auto; padding: 1rem 0.5rem;">
          <div class="footer-disclaimer-box" style="font-size: 0.725rem; padding: 0.85rem;">
            <span style="display:block; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Market Feeds</span>
            <span style="color: var(--color-bullish); display: flex; align-items: center; gap: 4px;">
              <span class="pulse-dot"></span> Live Engine Active
            </span>
          </div>
        </div>
      </aside>
    `;
  }

  return {
    render
  };
})();

window.Sidebar = Sidebar;

/**
 * QuantView AI — Navbar Component
 */

const Navbar = (function () {
  'use strict';

  function render(activeRoute = "landing") {
    const el = document.getElementById("app-navbar");
    if (!el) return;

    const user = window.Auth ? window.Auth.getUser() : null;
    const isAuth = !!user;
    const isAdmin = isAuth && user.role === "admin";
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";

    el.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <a href="#landing" class="brand-wrapper">
            <div class="brand-icon">
              <svg viewBox="0 0 100 100" width="32" height="32">
                <polygon points="50,5 95,50 50,95 5,50" fill="url(#brandGrad)" />
                <polygon points="50,20 80,50 50,80 20,50" fill="#080C14" opacity="0.65" />
                <circle cx="50" cy="50" r="10" fill="#38BDF8" />
                <defs>
                  <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38BDF8" />
                    <stop offset="100%" stop-color="#2563EB" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span>QuantView</span>
            <span class="brand-tag">AI</span>
          </a>

          <nav>
            <ul class="nav-links">
              <li>
                <a href="#landing" class="nav-link ${activeRoute === 'landing' ? 'active' : ''}">
                  <span>Overview</span>
                </a>
              </li>
              ${isAuth ? `
                <li>
                  <a href="#dashboard" class="nav-link ${activeRoute === 'dashboard' ? 'active' : ''}">
                    <span>Dashboard</span>
                  </a>
                </li>
              ` : ''}
              <li>
                <a href="#analysis" class="nav-link ${activeRoute === 'analysis' ? 'active' : ''}">
                  <span>Stock Analysis</span>
                </a>
              </li>
              ${isAdmin ? `
                <li>
                  <a href="#admin" class="nav-link ${activeRoute === 'admin' ? 'active' : ''}" style="color: #f87171;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; margin-right:4px;"></span>
                    <span>Admin</span>
                  </a>
                </li>
              ` : ''}
            </ul>
          </nav>

          <div class="header-actions">
            <!-- Theme Toggle -->
            <button id="theme-toggle-btn" class="btn btn-secondary btn-icon" title="Toggle Dark / Light Theme" aria-label="Toggle theme">
              ${currentTheme === 'dark' ? '☀️' : '🌙'}
            </button>

            <!-- Auth Buttons / User Pill -->
            ${isAuth ? `
              <div class="flex items-center gap-2">
                <a href="#profile" class="btn btn-secondary btn-sm flex items-center gap-2">
                  <span style="width: 22px; height: 22px; border-radius: 50%; background: var(--primary-600); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700;">
                    ${(user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span>${user.username}</span>
                  <span class="badge ${isAdmin ? 'badge-bearish' : 'badge-blue'}" style="font-size: 0.65rem; padding: 1px 5px;">${user.role}</span>
                </a>
                <button id="nav-logout-btn" class="btn btn-outline btn-sm" title="Sign Out">
                  Logout
                </button>
              </div>
            ` : `
              <div class="flex items-center gap-2">
                <a href="#login" class="btn btn-outline btn-sm">Sign In</a>
                <a href="#register" class="btn btn-primary btn-sm">Get Started</a>
              </div>
            `}
          </div>
        </div>
      </header>
    `;

    // Bind event listeners
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const nextTheme = (document.documentElement.getAttribute("data-theme") || "dark") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("quantview_theme", nextTheme);
        render(activeRoute);
      });
    }

    const logoutBtn = document.getElementById("nav-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await window.Auth.logout();
        window.Toast.info("You have been signed out.");
      });
    }
  }

  return {
    render
  };
})();

window.Navbar = Navbar;

/**
 * QuantView AI — Main Client Application Bootstrapper
 */

document.addEventListener("DOMContentLoaded", () => {
  'use strict';

  // 1. Initialize Theme (Dark default or User saved)
  const savedTheme = localStorage.getItem("quantview_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // 2. Global Event Listeners
  window.addEventListener("quantview:auth_state_changed", (e) => {
    const user = e.detail.user;
    window.Navbar && window.Navbar.render();
  });

  // 3. Initialize Router & Views
  if (window.Router) {
    window.Router.init();
  }

  console.log("%c QuantView AI Platform Initialized ", "background: #2563eb; color: #fff; font-weight: bold; border-radius: 4px; padding: 2px 8px;");
});

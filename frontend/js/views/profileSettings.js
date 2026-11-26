/**
 * QuantView AI — Profile & Settings View
 */

const ProfileSettingsView = (function () {
  'use strict';

  async function render(container) {
    const user = window.Auth ? window.Auth.getUser() : null;
    if (!user) {
      window.Router.navigate("login");
      return;
    }

    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";

    container.innerHTML = `
      <div class="app-container">
        ${window.Sidebar.render("profile")}

        <main class="main-content">
          <div class="dashboard-welcome">
            <div class="welcome-text">
              <h1>Account Profile &amp; Settings</h1>
              <p>Manage your personal profile, security credentials, and platform preferences</p>
            </div>
            <button id="profile-logout-btn" class="btn btn-outline btn-sm">
              Sign Out
            </button>
          </div>

          <div class="profile-grid">
            <!-- Left: Profile Summary Card -->
            <div class="card" style="height: fit-content;">
              <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; padding: 1rem 0 1.5rem; border-bottom: 1px solid var(--border-subtle);">
                <div class="avatar-large">
                  ${(user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 700;">${user.full_name || user.username}</h3>
                  <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem;">${user.email}</div>
                  <div style="margin-top: 0.5rem;">
                    <span class="badge ${user.role === 'admin' ? 'badge-bearish' : 'badge-blue'}">${user.role.toUpperCase()}</span>
                    <span class="badge badge-bullish" style="margin-left: 4px;">ACTIVE</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-3" style="padding-top: 1.25rem; font-size: 0.825rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-secondary">User ID</span>
                  <span class="font-mono font-bold">#${user.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-secondary">Username</span>
                  <span class="font-mono">${user.username}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-secondary">Member Since</span>
                  <span class="font-mono text-muted">${(user.created_at || '').slice(0, 10)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-secondary">Last Active</span>
                  <span class="font-mono text-muted">${user.last_login ? user.last_login.slice(0, 16).replace('T', ' ') : 'Just now'}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-secondary">Token Engine</span>
                  <span class="font-mono text-accent">HMAC-SHA256</span>
                </div>
              </div>
            </div>

            <!-- Right: Settings & Password Change -->
            <div class="flex flex-col gap-4">
              <!-- Appearance & Theme Selector -->
              <div class="card">
                <div class="card-header">
                  <div>
                    <h3 class="card-title">Theme &amp; Visual Appearance</h3>
                    <p class="card-subtitle">Select your preferred color mode</p>
                  </div>
                </div>

                <div class="theme-options-grid">
                  <div class="theme-option-card ${currentTheme === 'dark' ? 'selected' : ''}" id="theme-card-dark">
                    <div style="font-size: 1.5rem;">🌙</div>
                    <div style="font-weight: 700; color: var(--text-primary);">Deep Space Dark (Default)</div>
                    <div style="font-size: 0.775rem; color: var(--text-secondary);">Deep navy background with high-contrast electric blue and emerald indicators.</div>
                  </div>

                  <div class="theme-option-card ${currentTheme === 'light' ? 'selected' : ''}" id="theme-card-light">
                    <div style="font-size: 1.5rem;">☀️</div>
                    <div style="font-weight: 700; color: var(--text-primary);">Bright Financial Light</div>
                    <div style="font-size: 0.775rem; color: var(--text-secondary);">Clean daylight mode optimized for high-ambient-light trading desks.</div>
                  </div>
                </div>
              </div>

              <!-- Security: Change Password Form -->
              <div class="card">
                <div class="card-header">
                  <div>
                    <h3 class="card-title">Security &amp; Password Update</h3>
                    <p class="card-subtitle">Update your account password with cryptographic PBKDF2 hashing</p>
                  </div>
                </div>

                <form id="change-pwd-form" style="max-width: 480px;">
                  <div id="pwd-msg-box" class="card card-elevated hidden" style="padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem;"></div>

                  <div class="form-group">
                    <label class="form-label" for="curr-pwd">Current Password</label>
                    <div class="input-wrapper">
                      <input type="password" id="curr-pwd" class="form-input" required autocomplete="current-password" placeholder="Enter current password" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="new-pwd">New Password</label>
                    <div class="input-wrapper">
                      <input type="password" id="new-pwd" class="form-input" required minlength="6" autocomplete="new-password" placeholder="Minimum 6 characters" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="confirm-new-pwd">Confirm New Password</label>
                    <div class="input-wrapper">
                      <input type="password" id="confirm-new-pwd" class="form-input" required minlength="6" autocomplete="new-password" placeholder="Re-enter new password" />
                    </div>
                  </div>

                  <button type="submit" id="change-pwd-btn" class="btn btn-primary">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    // Bind Theme Selector Cards
    document.getElementById("theme-card-dark")?.addEventListener("click", () => {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("quantview_theme", "dark");
      render(container);
      window.Navbar.render("profile");
    });

    document.getElementById("theme-card-light")?.addEventListener("click", () => {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("quantview_theme", "light");
      render(container);
      window.Navbar.render("profile");
    });

    // Bind Sign out button
    document.getElementById("profile-logout-btn")?.addEventListener("click", async () => {
      await window.Auth.logout();
      window.Toast.info("Signed out successfully.");
    });

    // Bind Change Password Form
    const pwdForm = document.getElementById("change-pwd-form");
    const msgBox = document.getElementById("pwd-msg-box");
    const btn = document.getElementById("change-pwd-btn");

    pwdForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msgBox.classList.add("hidden");
      msgBox.textContent = "";

      const currPwd = document.getElementById("curr-pwd").value;
      const newPwd = document.getElementById("new-pwd").value;
      const confirmPwd = document.getElementById("confirm-new-pwd").value;

      if (newPwd !== confirmPwd) {
        msgBox.textContent = "New passwords do not match.";
        msgBox.className = "card card-elevated text-bearish";
        msgBox.style.backgroundColor = "var(--color-bearish-subtle)";
        msgBox.classList.remove("hidden");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Updating...";

      try {
        const res = await window.Api.changePassword({
          current_password: currPwd,
          new_password: newPwd
        });
        msgBox.textContent = res.message || "Password successfully updated.";
        msgBox.className = "card card-elevated text-bullish";
        msgBox.style.backgroundColor = "var(--color-bullish-subtle)";
        msgBox.classList.remove("hidden");
        pwdForm.reset();
        window.Toast.success("Password successfully updated.");
      } catch (err) {
        msgBox.textContent = err.message || "Failed to update password. Check current password.";
        msgBox.className = "card card-elevated text-bearish";
        msgBox.style.backgroundColor = "var(--color-bearish-subtle)";
        msgBox.classList.remove("hidden");
      } finally {
        btn.disabled = false;
        btn.textContent = "Update Password";
      }
    });
  }

  return {
    render
  };
})();

window.ProfileSettingsView = ProfileSettingsView;

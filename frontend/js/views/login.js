/**
 * QuantView AI — Login Page View
 */

const LoginView = (function () {
  'use strict';

  function render(container) {
    container.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Welcome Back</h1>
            <p class="auth-subtitle">Sign in to access your dashboard and quantitative stock signals</p>
          </div>

          <!-- Demo Credentials Helper -->
          <div class="demo-credentials-box">
            <span style="font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 4px;">Quick Demo Access:</span>
            <div class="demo-pills">
              <button type="button" class="demo-pill" id="demo-admin-btn">
                👑 <strong>Admin</strong> (admin / Admin@123)
              </button>
              <button type="button" class="demo-pill" id="demo-user-btn">
                📈 <strong>Trader</strong> (trader / User@123)
              </button>
            </div>
          </div>

          <form id="login-form">
            <div id="login-error" class="card card-elevated text-bearish hidden" style="padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem; border-color: var(--color-bearish-border); background: var(--color-bearish-subtle);">
            </div>

            <div class="form-group">
              <label class="form-label" for="login-username">Username or Email</label>
              <div class="input-wrapper">
                <input type="text" id="login-username" class="form-input" placeholder="e.g. admin or trader@quantview.ai" required autocomplete="username" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <div class="input-wrapper">
                <input type="password" id="login-password" class="form-input" placeholder="Enter your password" required autocomplete="current-password" />
                <span class="input-icon-right" id="toggle-password-btn" title="Show/Hide Password">👁️</span>
              </div>
            </div>

            <button type="submit" id="login-submit-btn" class="btn btn-primary w-full btn-lg" style="margin-top: 0.5rem;">
              <span id="login-btn-text">Sign In</span>
              <span id="login-btn-spinner" class="hidden">Signing in...</span>
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.75rem; font-size: 0.85rem; color: var(--text-secondary);">
            Don't have an account yet? 
            <a href="#register" style="color: var(--primary-accent); font-weight: 600;">Create an account</a>
          </div>
        </div>
      </div>
    `;

    // Demo Fill Bindings
    document.getElementById("demo-admin-btn")?.addEventListener("click", () => {
      document.getElementById("login-username").value = "admin";
      document.getElementById("login-password").value = "Admin@123";
    });

    document.getElementById("demo-user-btn")?.addEventListener("click", () => {
      document.getElementById("login-username").value = "trader";
      document.getElementById("login-password").value = "User@123";
    });

    // Password Visibility Toggle
    const toggleBtn = document.getElementById("toggle-password-btn");
    const pwdInput = document.getElementById("login-password");
    toggleBtn?.addEventListener("click", () => {
      if (pwdInput.type === "password") {
        pwdInput.type = "text";
        toggleBtn.textContent = "🙈";
      } else {
        pwdInput.type = "password";
        toggleBtn.textContent = "👁️";
      }
    });

    // Form Submit
    const form = document.getElementById("login-form");
    const errorBox = document.getElementById("login-error");
    const submitBtn = document.getElementById("login-submit-btn");
    const btnText = document.getElementById("login-btn-text");
    const btnSpinner = document.getElementById("login-btn-spinner");

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBox.classList.add("hidden");
      errorBox.textContent = "";

      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;

      if (!username || !password) {
        errorBox.textContent = "Please provide both username/email and password.";
        errorBox.classList.remove("hidden");
        return;
      }

      submitBtn.disabled = true;
      btnText.classList.add("hidden");
      btnSpinner.classList.remove("hidden");

      try {
        const user = await window.Auth.login(username, password);
        window.Toast.success(`Welcome back, ${user.full_name || user.username}!`);

        // Smart role-based redirect
        if (user.role === "admin") {
          window.Router.navigate("admin");
        } else {
          window.Router.navigate("dashboard");
        }
      } catch (err) {
        errorBox.textContent = err.message || "Invalid credentials. Please check and try again.";
        errorBox.classList.remove("hidden");
      } finally {
        submitBtn.disabled = false;
        btnText.classList.remove("hidden");
        btnSpinner.classList.add("hidden");
      }
    });
  }

  return {
    render
  };
})();

window.LoginView = LoginView;

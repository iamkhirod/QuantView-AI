/**
 * QuantView AI — Registration Page View
 */

const RegisterView = (function () {
  'use strict';

  function render(container) {
    container.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card" style="max-width: 500px;">
          <div class="auth-header">
            <h1 class="auth-title">Create an Account</h1>
            <p class="auth-subtitle">Join QuantView AI for institutional quantitative equity analytics</p>
          </div>

          <form id="register-form">
            <div id="register-error" class="card card-elevated text-bearish hidden" style="padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem; border-color: var(--color-bearish-border); background: var(--color-bearish-subtle);">
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-fullname">Full Name</label>
              <div class="input-wrapper">
                <input type="text" id="reg-fullname" class="form-input" placeholder="e.g. Alex Morgan" autocomplete="name" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-username">Username <span class="text-accent">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="reg-username" class="form-input" placeholder="e.g. alex_quant" required pattern="^[a-zA-Z0-9_\\-]+$" minlength="3" maxlength="30" autocomplete="username" />
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Letters, numbers, underscores or hyphens (3-30 chars).</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Email Address <span class="text-accent">*</span></label>
              <div class="input-wrapper">
                <input type="email" id="reg-email" class="form-input" placeholder="alex@quantview.ai" required autocomplete="email" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password <span class="text-accent">*</span></label>
              <div class="input-wrapper">
                <input type="password" id="reg-password" class="form-input" placeholder="Minimum 6 characters" required minlength="6" autocomplete="new-password" />
              </div>
              <!-- Real-time strength meter -->
              <div class="password-strength-bar">
                <div id="strength-fill" class="strength-fill"></div>
              </div>
              <span id="strength-text" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; display: block;">Enter at least 6 characters</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-confirm-password">Confirm Password <span class="text-accent">*</span></label>
              <div class="input-wrapper">
                <input type="password" id="reg-confirm-password" class="form-input" placeholder="Re-enter password" required autocomplete="new-password" />
              </div>
              <span id="match-text" class="hidden" style="font-size: 0.75rem; margin-top: 3px; display: block;"></span>
            </div>

            <button type="submit" id="register-submit-btn" class="btn btn-primary w-full btn-lg" style="margin-top: 0.5rem;">
              <span id="reg-btn-text">Create Free Account</span>
              <span id="reg-btn-spinner" class="hidden">Creating account...</span>
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.75rem; font-size: 0.85rem; color: var(--text-secondary);">
            Already have an account? 
            <a href="#login" style="color: var(--primary-accent); font-weight: 600;">Sign in here</a>
          </div>
        </div>
      </div>
    `;

    // Live Password Strength & Confirmation Checking
    const pwdInput = document.getElementById("reg-password");
    const confirmInput = document.getElementById("reg-confirm-password");
    const strengthFill = document.getElementById("strength-fill");
    const strengthText = document.getElementById("strength-text");
    const matchText = document.getElementById("match-text");

    pwdInput?.addEventListener("input", () => {
      const val = pwdInput.value;
      let score = 0;
      if (val.length >= 6) score += 25;
      if (val.length >= 10) score += 25;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 25;
      if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score += 25;

      strengthFill.style.width = `${score}%`;
      if (score < 50) {
        strengthFill.style.backgroundColor = "var(--color-bearish)";
        strengthText.textContent = "Weak password";
        strengthText.style.color = "var(--color-bearish)";
      } else if (score < 75) {
        strengthFill.style.backgroundColor = "var(--color-neutral)";
        strengthText.textContent = "Moderate password";
        strengthText.style.color = "var(--color-neutral)";
      } else {
        strengthFill.style.backgroundColor = "var(--color-bullish)";
        strengthText.textContent = "Strong password";
        strengthText.style.color = "var(--color-bullish)";
      }
    });

    confirmInput?.addEventListener("input", () => {
      if (!confirmInput.value) {
        matchText.classList.add("hidden");
        return;
      }
      matchText.classList.remove("hidden");
      if (confirmInput.value === pwdInput.value) {
        matchText.textContent = "Passwords match ✓";
        matchText.style.color = "var(--color-bullish)";
      } else {
        matchText.textContent = "Passwords do not match";
        matchText.style.color = "var(--color-bearish)";
      }
    });

    // Form Submit
    const form = document.getElementById("register-form");
    const errorBox = document.getElementById("register-error");
    const submitBtn = document.getElementById("register-submit-btn");
    const btnText = document.getElementById("reg-btn-text");
    const btnSpinner = document.getElementById("reg-btn-spinner");

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBox.classList.add("hidden");
      errorBox.textContent = "";

      const fullName = document.getElementById("reg-fullname").value.trim();
      const username = document.getElementById("reg-username").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = pwdInput.value;
      const confirmPassword = confirmInput.value;

      if (password !== confirmPassword) {
        errorBox.textContent = "Passwords do not match. Please verify.";
        errorBox.classList.remove("hidden");
        return;
      }

      submitBtn.disabled = true;
      btnText.classList.add("hidden");
      btnSpinner.classList.remove("hidden");

      try {
        const user = await window.Auth.register(username, email, password, fullName);
        window.Toast.success(`Welcome to QuantView AI, ${user.username}!`);
        window.Router.navigate("dashboard");
      } catch (err) {
        errorBox.textContent = err.message || "Registration failed. Please check your information.";
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

window.RegisterView = RegisterView;

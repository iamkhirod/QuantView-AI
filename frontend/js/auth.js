/**
 * QuantView AI — Client Authentication & Session Manager
 */

const Auth = (function () {
  'use strict';

  const TOKEN_KEY = "quantview_token";
  const USER_KEY = "quantview_user";

  let _token = localStorage.getItem(TOKEN_KEY) || null;
  let _user = null;

  try {
    const rawUser = localStorage.getItem(USER_KEY);
    if (rawUser) {
      _user = JSON.parse(rawUser);
    }
  } catch (e) {
    clear();
  }

  function setSession(token, user) {
    _token = token;
    _user = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("quantview:auth_state_changed", { detail: { user } }));
  }

  function clear() {
    _token = null;
    _user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new CustomEvent("quantview:auth_state_changed", { detail: { user: null } }));
  }

  async function login(usernameOrEmail, password) {
    try {
      const data = await window.Api.login({
        username_or_email: usernameOrEmail.trim(),
        password: password
      });
      setSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  }

  async function register(username, email, password, fullName = "") {
    try {
      const data = await window.Api.register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        full_name: fullName.trim()
      });
      setSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  }

  async function logout() {
    try {
      if (_token) {
        await window.Api.logout().catch(() => {});
      }
    } finally {
      clear();
      window.Router && window.Router.navigate("landing");
    }
  }

  return {
    getToken: () => _token,
    getUser: () => _user,
    isAuthenticated: () => !!(_token && _user),
    isAdmin: () => !!(_user && _user.role === "admin"),
    login,
    register,
    logout,
    clear
  };
})();

window.Auth = Auth;

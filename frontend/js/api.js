/**
 * QuantView AI — Unified HTTP API Client
 */

const Api = (function () {
  'use strict';

  async function request(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : endpoint;
    const headers = options.headers || {};

    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const token = window.Auth ? window.Auth.getToken() : localStorage.getItem("quantview_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized (expired or invalid token)
      if (response.status === 401) {
        if (window.Auth && window.Auth.isAuthenticated()) {
          window.Auth.logout();
          window.Toast && window.Toast.error("Your session has expired. Please log in again.");
          window.Router && window.Router.navigate("login");
        }
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg = data.detail || data.error || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      console.warn(`[API] Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  return {
    get: (endpoint) => request(endpoint, { method: "GET" }),
    post: (endpoint, body) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: "DELETE" }),

    // Authentication Endpoints
    login: (credentials) => request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    register: (userData) => request("/api/auth/register", { method: "POST", body: JSON.stringify(userData) }),
    getProfile: () => request("/api/auth/me", { method: "GET" }),
    changePassword: (passwords) => request("/api/auth/change-password", { method: "POST", body: JSON.stringify(passwords) }),
    logout: () => request("/api/auth/logout", { method: "POST" }),

    // User Watchlist & Activity Endpoints
    getWatchlist: () => request("/api/user/watchlist", { method: "GET" }),
    addToWatchlist: (item) => request("/api/user/watchlist", { method: "POST", body: JSON.stringify(item) }),
    removeFromWatchlist: (ticker) => request(`/api/user/watchlist/${encodeURIComponent(ticker)}`, { method: "DELETE" }),
    getUserActivities: () => request("/api/user/activities", { method: "GET" }),

    // Admin Endpoints
    getAdminUsers: () => request("/api/admin/users", { method: "GET" }),
    updateUserStatus: (userId, isActive) => request(`/api/admin/users/${userId}/status`, { method: "POST", body: JSON.stringify({ is_active: isActive }) }),
    updateUserRole: (userId, role) => request(`/api/admin/users/${userId}/role`, { method: "POST", body: JSON.stringify({ role: role }) }),
    getAdminStats: () => request("/api/admin/stats", { method: "GET" }),
    getAdminActivities: () => request("/api/admin/activities", { method: "GET" }),

    // Market & Quantitative Recommendation Endpoints
    getRecommendation: (ticker, refresh = false) => request(`/api/recommend?ticker=${encodeURIComponent(ticker)}&refresh=${refresh}`),
    getBenchmark: (ticker, refresh = false) => request(`/api/backtest/compare?ticker=${encodeURIComponent(ticker)}&refresh=${refresh}`),
    getLiveQuotes: () => request("/api/watchlist/live"),
    getSingleQuote: (ticker) => request(`/api/quote/live?ticker=${encodeURIComponent(ticker)}`),
    getMarketStatus: () => request("/api/market-status"),
    getLiveNews: (ticker) => request(`/api/news/live?ticker=${encodeURIComponent(ticker)}`)
  };
})();

window.Api = Api;

/**
 * QuantView AI — Client-Side Hash Router & Route Guards
 */

const Router = (function () {
  'use strict';

  function parseHash() {
    const raw = window.location.hash.slice(1) || "landing";
    const [path, queryString] = raw.split("?");
    const params = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [k, v] of searchParams.entries()) {
        params[k] = v;
      }
    }
    return { path, params };
  }

  async function resolveRoute() {
    const { path, params } = parseHash();
    const container = document.getElementById("app-view-container");
    if (!container) return;

    const isAuth = window.Auth ? window.Auth.isAuthenticated() : false;
    const isAdmin = window.Auth ? window.Auth.isAdmin() : false;

    // Route Guards
    if ((path === "dashboard" || path === "profile") && !isAuth) {
      navigate("login");
      return;
    }

    if (path === "admin" && (!isAuth || !isAdmin)) {
      window.Toast && window.Toast.error("Administrator privileges required.");
      if (isAuth) {
        navigate("dashboard");
      } else {
        navigate("login");
      }
      return;
    }

    if ((path === "login" || path === "register") && isAuth) {
      navigate(isAdmin ? "admin" : "dashboard");
      return;
    }

    // Update Navbar and active states
    window.Navbar && window.Navbar.render(path);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Render Target View
    switch (path) {
      case "landing":
        window.LandingView && window.LandingView.render(container);
        break;
      case "login":
        window.LoginView && window.LoginView.render(container);
        break;
      case "register":
        window.RegisterView && window.RegisterView.render(container);
        break;
      case "dashboard":
        window.UserDashboardView && window.UserDashboardView.render(container);
        break;
      case "analysis":
        window.StockAnalysisView && window.StockAnalysisView.render(container, params);
        break;
      case "admin":
        window.AdminDashboardView && window.AdminDashboardView.render(container);
        break;
      case "profile":
        window.ProfileSettingsView && window.ProfileSettingsView.render(container);
        break;
      default:
        window.LandingView && window.LandingView.render(container);
        break;
    }

    // Update Footer
    window.Footer && window.Footer.render();
  }

  function navigate(pathWithParams) {
    window.location.hash = `#${pathWithParams}`;
  }

  function init() {
    window.addEventListener("hashchange", resolveRoute);
    resolveRoute();
  }

  return {
    init,
    navigate,
    resolveRoute
  };
})();

window.Router = Router;

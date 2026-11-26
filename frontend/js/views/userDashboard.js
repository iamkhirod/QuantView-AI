/**
 * QuantView AI — User Dashboard View
 */

const UserDashboardView = (function () {
  'use strict';

  async function render(container) {
    const user = window.Auth ? window.Auth.getUser() : null;
    if (!user) {
      window.Router.navigate("login");
      return;
    }

    container.innerHTML = `
      <div class="app-container">
        ${window.Sidebar.render("dashboard")}

        <main class="main-content">
          <div class="dashboard-welcome">
            <div class="welcome-text">
              <h1>Welcome, ${user.full_name || user.username}</h1>
              <p>Institutional analytics dashboard &bull; Market session active</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge ${user.role === 'admin' ? 'badge-bearish' : 'badge-blue'}">${user.role}</span>
              <a href="#analysis" class="btn btn-primary btn-sm">
                <span>+ Analyze New Stock</span>
              </a>
            </div>
          </div>

          <!-- Market Overview Ribbon -->
          <div class="card" style="padding: 0.85rem 1.25rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span class="card-subtitle" style="font-weight: 700; text-transform: uppercase;">Live Market Overview</span>
              <span id="market-status-badge" class="badge badge-bullish" style="font-size: 0.65rem;">Markets Open</span>
            </div>
            <div id="dash-market-ribbon" class="market-ribbon">
              <div style="color: var(--text-muted); font-size: 0.8rem; padding: 0.25rem;">Synchronizing quotes...</div>
            </div>
          </div>

          <!-- Quick Metrics Grid -->
          <div class="metrics-overview-grid">
            <div class="metric-kpi-card">
              <span class="metric-label">Account Tier</span>
              <span class="metric-value text-accent">${user.role.toUpperCase()}</span>
              <span class="metric-sub">Full Walk-Forward ML Access</span>
            </div>
            <div class="metric-kpi-card">
              <span class="metric-label">Saved Watchlist</span>
              <span id="kpi-watchlist-count" class="metric-value">0</span>
              <span class="metric-sub">Synchronized with SQLite</span>
            </div>
            <div class="metric-kpi-card">
              <span class="metric-label">Prediction Horizon</span>
              <span class="metric-value">~20 Days</span>
              <span class="metric-sub">Forward Session Forecast</span>
            </div>
            <div class="metric-kpi-card">
              <span class="metric-label">Active Engine</span>
              <span class="metric-value text-bullish">ONLINE</span>
              <span class="metric-sub">XGBoost &amp; SHAP Explainer</span>
            </div>
          </div>

          <!-- Split Dashboard Content: Watchlist & Trending -->
          <div class="dashboard-split-grid">
            <!-- Left: Personal Watchlist -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">My Personal Watchlist</h3>
                  <p class="card-subtitle">Real-time quotes for your tracked assets</p>
                </div>
                <!-- Add to Watchlist Quick Form -->
                <div class="flex items-center gap-1">
                  <input type="text" id="quick-add-ticker-input" class="form-input" placeholder="Ticker (e.g. RELIANCE)" style="width: 140px; padding: 0.35rem 0.65rem; font-size: 0.8rem; text-transform: uppercase;" />
                  <button id="quick-add-ticker-btn" class="btn btn-secondary btn-sm" title="Add Ticker">+</button>
                </div>
              </div>

              <div id="user-watchlist-table-container">
                <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">
                  Loading your saved watchlist...
                </div>
              </div>
            </div>

            <!-- Right: Trending Equities & Quick Actions -->
            <div class="flex flex-col gap-4">
              <!-- Featured Recommendations -->
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Top Active Equities</h3>
                </div>
                <div id="trending-stocks-list" class="flex flex-col gap-2">
                  <div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem;">Loading active market movers...</div>
                </div>
              </div>

              <!-- Recent User Activities -->
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">Recent Activity</h3>
                </div>
                <div id="user-activities-list" class="flex flex-col gap-2" style="font-size: 0.8rem;">
                  <div style="color: var(--text-muted); padding: 0.5rem;">Loading audit activities...</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    // Initialize data
    loadMarketRibbon();
    loadWatchlist();
    loadTrendingStocks();
    loadUserActivities();

    // Bind Quick Add Ticker
    const addInput = document.getElementById("quick-add-ticker-input");
    const addBtn = document.getElementById("quick-add-ticker-btn");

    async function handleAdd() {
      const ticker = (addInput.value || "").trim().toUpperCase();
      if (!ticker) return;
      try {
        await window.Api.addToWatchlist({ ticker: ticker, company_name: ticker, notes: "Added from Dashboard" });
        window.Toast.success(`Added ${ticker} to your watchlist.`);
        addInput.value = "";
        loadWatchlist();
      } catch (err) {
        window.Toast.error(err.message || "Could not add ticker.");
      }
    }

    addBtn?.addEventListener("click", handleAdd);
    addInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleAdd();
    });
  }

  async function loadMarketRibbon() {
    const ribbon = document.getElementById("dash-market-ribbon");
    if (!ribbon) return;

    try {
      const data = await window.Api.getLiveQuotes();
      const items = (data && data.items) || [];
      if (items.length > 0) {
        ribbon.innerHTML = items.map(item => {
          const changeClass = (item.change_pct >= 0) ? "text-bullish" : "text-bearish";
          const sign = (item.change_pct >= 0) ? "+" : "";
          const curr = item.currency_symbol || "$";
          const pVal = item.price != null ? Number(item.price).toFixed(2) : '0.00';
          const chgVal = item.change_pct != null ? Number(item.change_pct).toFixed(2) : '0.00';
          return `
            <div class="ribbon-item" onclick="window.Router.navigate('analysis?ticker=${item.ticker}')">
              <span class="ribbon-ticker">${item.ticker}</span>
              <span class="ribbon-price">${curr}${pVal}</span>
              <span class="ribbon-change ${changeClass}">${sign}${chgVal}%</span>
            </div>
          `;
        }).join("");
      }
    } catch (e) {}
  }

  async function loadWatchlist() {
    const container = document.getElementById("user-watchlist-table-container");
    const countEl = document.getElementById("kpi-watchlist-count");
    if (!container) return;

    try {
      const items = await window.Api.getWatchlist();
      if (countEl) countEl.textContent = items.length;

      if (!items || items.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
            <p style="margin-bottom: 0.75rem;">Your watchlist is currently empty.</p>
            <p>Add symbols like <strong>RELIANCE</strong>, <strong>NVDA</strong>, or <strong>AAPL</strong> to track them in real time.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company / Details</th>
                <th>Saved Date</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>
                    <a href="#analysis?ticker=${item.ticker}" style="font-family: var(--font-display); font-weight: 700; color: var(--primary-accent); display: flex; align-items: center; gap: 0.5rem;">
                      <span style="width: 24px; height: 24px; display: inline-block;">${window.LogoService ? window.LogoService.getLogoSvg(item.ticker) : ''}</span>
                      <span>${item.ticker}</span>
                    </a>
                  </td>
                  <td class="text-secondary">${item.company_name || 'Equities'}</td>
                  <td class="font-mono text-muted" style="font-size: 0.75rem;">${(item.added_at || '').slice(0, 10)}</td>
                  <td style="text-align: right;">
                    <a href="#analysis?ticker=${item.ticker}" class="btn btn-outline btn-sm" style="margin-right: 4px;">Analyze</a>
                    <button class="btn btn-danger btn-sm delete-watchlist-btn" data-ticker="${item.ticker}" title="Remove">✕</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;

      // Bind delete buttons
      container.querySelectorAll(".delete-watchlist-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const ticker = btn.getAttribute("data-ticker");
          try {
            await window.Api.removeFromWatchlist(ticker);
            window.Toast.info(`Removed ${ticker} from watchlist.`);
            loadWatchlist();
          } catch (err) {
            window.Toast.error("Failed to remove ticker.");
          }
        });
      });
    } catch (err) {
      container.innerHTML = `<div style="color: var(--color-bearish); padding: 1rem;">Failed to load watchlist from database.</div>`;
    }
  }

  async function loadTrendingStocks() {
    const listEl = document.getElementById("trending-stocks-list");
    if (!listEl) return;

    const featured = [
      { ticker: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", cur: "$", rec: "BUY", prob: "76%" },
      { ticker: "RELIANCE", name: "Reliance Industries", exchange: "NSE", cur: "₹", rec: "BUY", prob: "68%" },
      { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", cur: "$", rec: "HOLD", prob: "51%" },
      { ticker: "TCS", name: "Tata Consultancy", exchange: "NSE", cur: "₹", rec: "BUY", prob: "63%" }
    ];

    listEl.innerHTML = featured.map(f => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 28px; height: 28px;">${window.LogoService.getLogoSvg(f.ticker)}</div>
          <div>
            <div style="font-family: var(--font-display); font-weight: 700; font-size: 0.85rem;">${f.ticker}</div>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${f.name}</div>
          </div>
        </div>
        <div style="text-align: right; display: flex; align-items: center; gap: 0.5rem;">
          <span class="badge ${f.rec === 'BUY' ? 'badge-bullish' : 'badge-neutral'}">${f.rec}</span>
          <a href="#analysis?ticker=${f.ticker}" class="btn btn-outline btn-sm">&rarr;</a>
        </div>
      </div>
    `).join("");
  }

  async function loadUserActivities() {
    const actEl = document.getElementById("user-activities-list");
    if (!actEl) return;

    try {
      const acts = await window.Api.getUserActivities();
      if (!acts || acts.length === 0) {
        actEl.innerHTML = `<span style="color: var(--text-muted); padding: 0.25rem;">No recent activities logged yet.</span>`;
        return;
      }

      actEl.innerHTML = acts.slice(0, 5).map(a => `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding: 0.4rem 0;">
          <div>
            <span style="font-weight: 600; color: var(--primary-accent);">${a.action}</span>
            <span style="color: var(--text-secondary); margin-left: 4px;">${a.details || ''}</span>
          </div>
          <span class="font-mono text-muted" style="font-size: 0.7rem;">${(a.timestamp || '').slice(11, 19)}</span>
        </div>
      `).join("");
    } catch (e) {
      actEl.innerHTML = `<span style="color: var(--text-muted);">Audit log available.</span>`;
    }
  }

  return {
    render
  };
})();

window.UserDashboardView = UserDashboardView;

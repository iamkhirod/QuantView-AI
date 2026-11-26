/**
 * QuantView AI — Landing Page View
 */

const LandingView = (function () {
  'use strict';

  async function render(container) {
    container.innerHTML = `
      <section class="landing-hero">
        <div class="hero-badge">
          <span>⚡ Next-Generation Quantitative Finance</span>
        </div>
        <h1 class="hero-title">
          Intelligent Stock Analytics &amp; <br />
          <span class="gradient-text">Explainable Machine Learning</span>
        </h1>
        <p class="hero-subtitle">
          Empowering institutional-grade research across Indian (NSE/BSE) and US (NASDAQ/NYSE) equities with purged walk-forward validation, SHAP explainability, and multi-tier live market quotes.
        </p>

        <div class="hero-actions">
          <a href="#analysis?ticker=NVDA" class="btn btn-primary btn-lg">
            <span>Launch Stock Analysis</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
          <a href="#register" class="btn btn-secondary btn-lg">
            Create Free Account
          </a>
        </div>

        <!-- Live Market Overview Ribbon -->
        <div id="landing-market-ribbon" class="market-ribbon">
          <div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem;">Loading live market feeds...</div>
        </div>
      </section>

      <!-- Key Platform Capabilities (6 High-Impact Cards) -->
      <section class="landing-section">
        <div class="section-header">
          <h2 class="section-title">Institutional Analytics Architecture</h2>
          <p class="section-subtitle">Engineered to eliminate look-ahead leakage, model whipsaws, and unexplainable black-box signals.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-box">🧠</div>
            <h3 class="feature-title">Explainable AI (SHAP)</h3>
            <p class="feature-desc">Decomposes decision tree ensembles into mathematically exact positive (bullish) and negative (bearish) feature attributions using game-theoretic Shapley values.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">🛡️</div>
            <h3 class="feature-title">Purged Walk-Forward ML</h3>
            <p class="feature-desc">3-fold expanding walk-forward validation with a 20-day embargo window to eliminate label look-ahead leakage and produce realistic out-of-sample accuracy.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">🏛️</div>
            <h3 class="feature-title">Institutional Intelligence</h3>
            <p class="feature-desc">6-card validated fundamental metrics: Analyst Consensus, 12M Target Prices, Revenue Forecasts, Trailing P/S Valuation, Trading Volume, and Gross Margin.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">⚡</div>
            <h3 class="feature-title">Hysteresis Benchmarking</h3>
            <p class="feature-desc">Dual-threshold hysteresis execution filters out 98% of whipsaw trades, delivering superior risk-adjusted return across various transaction fee tiers.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">🌊</div>
            <h3 class="feature-title">Market Regime Detection</h3>
            <p class="feature-desc">Wilder ADX and SMA200 slope dynamically classify market conditions into Trending Up, Trending Down, or Choppy with adaptive probability shrinkage.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">🌐</div>
            <h3 class="feature-title">Multi-Market Coverage</h3>
            <p class="feature-desc">Native multi-currency support for Indian equities (₹ INR on NSE/BSE), US equities ($ USD on NASDAQ/NYSE), and major benchmark indices.</p>
          </div>
        </div>
      </section>

      <!-- How it Works Workflow -->
      <section class="landing-section" style="background: var(--bg-surface); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
        <div class="section-header">
          <h2 class="section-title">How QuantView AI Works</h2>
          <p class="section-subtitle">From raw market telemetry to institutional research recommendations.</p>
        </div>

        <div class="workflow-steps">
          <div class="step-card">
            <div class="step-number">01</div>
            <h3 class="feature-title">Multi-Tier Data Ingestion</h3>
            <p class="feature-desc">Real-time quotes and multi-decade OHLCV historical feeds are resolved across Yahoo Finance and Twelve Data with fallback resilience.</p>
          </div>

          <div class="step-card">
            <div class="step-number">02</div>
            <h3 class="feature-title">14-Feature ML Engineering</h3>
            <p class="feature-desc">Computes adaptive RSI, MACD, Wilder ATR, volume ratios, and moving averages, feeding XGBoost and Stacking consensus models.</p>
          </div>

          <div class="step-card">
            <div class="step-number">03</div>
            <h3 class="feature-title">Explainable Recommendation</h3>
            <p class="feature-desc">Delivers transparent Buy/Sell/Hold verdicts with SHAP driver waterfall, confidence score, regime diagnosis, and backtested benchmarks.</p>
          </div>
        </div>
      </section>

      <!-- Interactive Analytics Preview -->
      <section class="landing-section">
        <div class="section-header">
          <h2 class="section-title">Live Intelligence Preview</h2>
          <p class="section-subtitle">Instant quantitative snapshot for market leaders.</p>
        </div>

        <div class="card card-elevated" style="max-width: 860px; margin: 0 auto;">
          <div class="card-header">
            <div>
              <span class="badge badge-blue">Featured Asset</span>
              <h3 style="font-family: var(--font-display); font-size: 1.4rem; margin-top: 0.25rem;">NVIDIA Corporation (NVDA)</h3>
            </div>
            <a href="#analysis?ticker=NVDA" class="btn btn-primary btn-sm">Full Analysis Workbench &rarr;</a>
          </div>

          <div class="institutional-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 0;">
            <div class="inst-card">
              <span class="inst-card-header">ML Recommendation</span>
              <span class="inst-card-val text-bullish">STRONG BUY</span>
              <span style="font-size: 0.775rem; color: var(--text-muted);">Ensemble Prob: 76.4% &bull; High Confidence</span>
            </div>
            <div class="inst-card">
              <span class="inst-card-header">Market Regime</span>
              <span class="inst-card-val text-accent">Trending Up</span>
              <span style="font-size: 0.775rem; color: var(--text-muted);">ADX: 34.2 &bull; Strong Momentum</span>
            </div>
            <div class="inst-card">
              <span class="inst-card-header">12M Target Price</span>
              <span class="inst-card-val">$175.50 USD</span>
              <span style="font-size: 0.775rem; color: var(--color-bullish);">+24.8% Potential Upside</span>
            </div>
          </div>
        </div>
      </section>
    `;

    // Fetch and populate live ribbon
    loadRibbonQuotes();
  }

  async function loadRibbonQuotes() {
    const ribbonEl = document.getElementById("landing-market-ribbon");
    if (!ribbonEl) return;

    try {
      const data = await window.Api.getLiveQuotes();
      const items = (data && data.items) || [];
      if (items.length === 0) {
        ribbonEl.innerHTML = `<span style="color:var(--text-muted); font-size:0.8rem; padding: 0.5rem;">Live market quotes will synchronize shortly.</span>`;
        return;
      }

      ribbonEl.innerHTML = items.map(item => {
        const changeClass = (item.change_pct >= 0) ? "text-bullish" : "text-bearish";
        const sign = (item.change_pct >= 0) ? "+" : "";
        const currency = item.currency_symbol || (item.exchange === "NSE" || item.exchange === "BSE" ? "₹" : "$");
        const pVal = item.price != null ? Number(item.price).toFixed(2) : '0.00';
        const chgVal = item.change_pct != null ? Number(item.change_pct).toFixed(2) : '0.00';
        return `
          <div class="ribbon-item" onclick="window.Router.navigate('analysis?ticker=${item.ticker}')">
            <span class="ribbon-ticker">${item.ticker}</span>
            <span class="ribbon-price">${currency}${pVal}</span>
            <span class="ribbon-change ${changeClass}">${sign}${chgVal}%</span>
          </div>
        `;
      }).join("");
    } catch (err) {
      ribbonEl.innerHTML = `<span style="color:var(--text-muted); font-size:0.8rem; padding: 0.5rem;">Market indices available in analysis workbench.</span>`;
    }
  }

  return {
    render
  };
})();

window.LandingView = LandingView;

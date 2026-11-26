/**
 * QuantView AI — Clean Professional Footer Component
 * Strictly complies with requirements: Zero community sections or external personal attribution links.
 */

const Footer = (function () {
  'use strict';

  function render() {
    const el = document.getElementById("app-footer");
    if (!el) return;

    el.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-top">
            <div class="footer-brand-col">
              <div class="brand-wrapper">
                <div class="brand-icon">
                  <svg viewBox="0 0 100 100" width="28" height="28">
                    <polygon points="50,5 95,50 50,95 5,50" fill="#38BDF8" />
                    <polygon points="50,20 80,50 50,80 20,50" fill="#080C14" opacity="0.65" />
                    <circle cx="50" cy="50" r="10" fill="#38BDF8" />
                  </svg>
                </div>
                <span>QuantView AI</span>
              </div>
              <p class="footer-desc">
                Institutional-grade quantitative stock modeling, purged walk-forward cross-validation, and explainable artificial intelligence for equities across Indian and US financial markets.
              </p>
            </div>

            <div>
              <div class="footer-col-title">Markets &amp; Assets</div>
              <ul class="footer-col-links">
                <li><a href="#analysis?ticker=^NSEI" class="footer-link">NSE NIFTY 50</a></li>
                <li><a href="#analysis?ticker=^BSESN" class="footer-link">BSE SENSEX</a></li>
                <li><a href="#analysis?ticker=^GSPC" class="footer-link">S&amp;P 500</a></li>
                <li><a href="#analysis?ticker=^NDX" class="footer-link">NASDAQ 100</a></li>
                <li><a href="#analysis?ticker=SPY" class="footer-link">US Equities &amp; ETFs</a></li>
              </ul>
            </div>

            <div>
              <div class="footer-col-title">Analytics Platform</div>
              <ul class="footer-col-links">
                <li><a href="#analysis" class="footer-link">Stock Analysis Workbench</a></li>
                <li><a href="#dashboard" class="footer-link">User Dashboard</a></li>
                <li><a href="#landing" class="footer-link">Platform Capabilities</a></li>
                <li><a href="/docs" target="_blank" rel="noopener" class="footer-link">Interactive OpenAPI Docs</a></li>
                <li><a href="#profile" class="footer-link">Account &amp; Security</a></li>
              </ul>
            </div>

            <div class="footer-disclaimer-box">
              <strong>Regulatory &amp; Research Disclaimer:</strong><br />
              QuantView AI is an algorithmic quantitative research and educational platform. It does not provide personalized investment, legal, tax, or financial advice. Forward-looking recommendations are probabilistic quantitative signals derived from historical price action and financial modeling. Past backtested performance does not guarantee future market returns.
            </div>
          </div>

          <div class="footer-bottom">
            <div class="system-status-indicator">
              <span class="pulse-dot"></span>
              <span>All Systems Operational &bull; Live Market Feeds Synchronized</span>
            </div>
            <div>
              &copy; 2026 QuantView AI &bull; Intelligent Stock Analytics Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  return {
    render
  };
})();

window.Footer = Footer;

/**
 * QuantView AI — Application Configuration & Asset Directory
 */

const CONFIG = {
  APP_NAME: "QuantView AI",
  APP_TAGLINE: "Intelligent Stock Analytics Platform",
  VERSION: "3.0.0",
  API_BASE: "", // Same-origin FastAPI server

  // Default tickers for quick market analytics
  DEFAULT_TICKER: "NVDA",
  FEATURED_TICKERS: ["NVDA", "RELIANCE", "AAPL", "TCS", "MSFT", "INFY", "SPY", "^NSEI"],

  // Asset Directory for instant autocomplete search
  ASSET_DIRECTORY: [
    // 🏛️ Benchmark Indices
    { ticker: '^NSEI', name: 'NIFTY 50 Benchmark Index', exchange: 'NSE', type: 'Index', country: 'India', currency: '₹' },
    { ticker: '^BSESN', name: 'S&P BSE SENSEX Index', exchange: 'BSE', type: 'Index', country: 'India', currency: '₹' },
    { ticker: '^GSPC', name: 'S&P 500 Benchmark Index', exchange: 'NYSE', type: 'Index', country: 'US', currency: '$' },
    { ticker: '^NDX', name: 'NASDAQ 100 Benchmark Index', exchange: 'NASDAQ', type: 'Index', country: 'US', currency: '$' },

    // 🇮🇳 Indian Bluechips & Leaders
    { ticker: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'INFY', name: 'Infosys Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'SBIN', name: 'State Bank of India', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'ITC', name: 'ITC Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'BHARTIARTL', name: 'Bharti Airtel Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'TATAMOTORS', name: 'Tata Motors Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'LT', name: 'Larsen & Toubro Limited', exchange: 'NSE', type: 'Stock', country: 'India', currency: '₹' },
    { ticker: 'NIFTYBEES', name: 'Nippon India ETF Nifty BeES', exchange: 'NSE', type: 'ETF', country: 'India', currency: '₹' },
    { ticker: 'BANKBEES', name: 'Nippon India ETF Bank BeES', exchange: 'NSE', type: 'ETF', country: 'India', currency: '₹' },
    { ticker: 'GOLDBEES', name: 'Nippon India ETF Gold BeES', exchange: 'NSE', type: 'ETF', country: 'India', currency: '₹' },

    // 🇺🇸 US Equities & ETFs
    { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ', type: 'Stock', country: 'US', currency: '$' },
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE Arca', type: 'ETF', country: 'US', currency: '$' },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', type: 'ETF', country: 'US', currency: '$' },
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', exchange: 'NYSE Arca', type: 'ETF', country: 'US', currency: '$' },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', exchange: 'NYSE Arca', type: 'ETF', country: 'US', currency: '$' }
  ],

  // Institutional Quantitative Glossary
  GLOSSARY: {
    "SHAP": "Shapley Additive exPlanations — A game-theoretic technique calculating the exact marginal contribution of each financial feature to the prediction.",
    "Purged Walk-Forward": "A cross-validation method that trains solely on past data and leaves an embargo window before the test period to prevent look-ahead bias.",
    "Wilder ADX": "Average Directional Index developed by J. Welles Wilder to quantify trend strength regardless of direction.",
    "Hysteresis": "A dual-threshold signal filter (e.g. 0.55 Buy / 0.45 Sell) that prevents rapid whipsaw trades in choppy regimes.",
    "Sharpe Ratio": "Measure of risk-adjusted excess return per unit of volatility relative to the risk-free rate.",
    "CAGR": "Compound Annual Growth Rate representing the smoothed annualized investment return.",
    "Max Drawdown": "The peak-to-trough percentage decline in portfolio equity over a specific investment horizon."
  }
};

window.CONFIG = CONFIG;

/**
 * QuantView AI — High-Performance Canvas Interactive Stock Chart Engine
 */

const StockChart = (function () {
  'use strict';

  let _canvas = null;
  let _ctx = null;
  let _rawPoints = [];
  let _filteredPoints = [];
  let _activeTimeframe = "1Y";
  let _currencySymbol = "$";
  let _hoverIndex = -1;

  function init(canvasId, points, currencySymbol = "$") {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;
    _ctx = _canvas.getContext("2d");
    _rawPoints = points || [];
    _currencySymbol = currencySymbol;
    _activeTimeframe = "1Y";
    _hoverIndex = -1;

    // Set resolution for sharp display on Retina/HiDPI screens
    resizeCanvas();
    window.addEventListener("resize", () => {
      if (_canvas && _canvas.offsetParent !== null) {
        resizeCanvas();
        draw();
      }
    });

    // Crosshair mouse interaction
    _canvas.addEventListener("mousemove", onMouseMove);
    _canvas.addEventListener("mouseleave", onMouseLeave);

    setTimeframe(_activeTimeframe);
  }

  function resizeCanvas() {
    if (!_canvas) return;
    const rect = _canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    _canvas.width = rect.width * dpr;
    _canvas.height = (rect.height || 360) * dpr;
    _canvas.style.width = `${rect.width}px`;
    _canvas.style.height = `${rect.height || 360}px`;
    _ctx.scale(dpr, dpr);
  }

  function setTimeframe(tf) {
    _activeTimeframe = tf;
    if (!_rawPoints || _rawPoints.length === 0) {
      _filteredPoints = [];
      draw();
      return;
    }

    const n = _rawPoints.length;
    let days = n;
    if (tf === "1M") days = 22;
    else if (tf === "3M") days = 66;
    else if (tf === "6M") days = 132;
    else if (tf === "1Y") days = 252;
    else if (tf === "3Y") days = 756;
    else if (tf === "5Y") days = 1260;
    else if (tf === "ALL") days = n;

    _filteredPoints = _rawPoints.slice(Math.max(0, n - days));
    draw();
  }

  function draw() {
    if (!_ctx || !_canvas) return;
    const width = parseFloat(_canvas.style.width);
    const height = parseFloat(_canvas.style.height);

    _ctx.clearRect(0, 0, width, height);

    if (!_filteredPoints || _filteredPoints.length === 0) {
      _ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      _ctx.font = "14px 'Inter', sans-serif";
      _ctx.textAlign = "center";
      _ctx.fillText("No price history available for selected timeframe.", width / 2, height / 2);
      return;
    }

    const padding = { top: 30, right: 60, bottom: 40, left: 15 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Find min and max close prices
    let minP = Infinity;
    let maxP = -Infinity;
    _filteredPoints.forEach(p => {
      if (p.close < minP) minP = p.close;
      if (p.close > maxP) maxP = p.close;
    });

    if (minP === maxP) {
      minP *= 0.95;
      maxP *= 1.05;
    }

    const priceRange = maxP - minP;
    const getY = (val) => padding.top + chartH - ((val - minP) / priceRange) * chartH;
    const getX = (idx) => padding.left + (idx / (_filteredPoints.length - 1)) * chartW;

    // Draw Grid Lines & Horizontal Axis Labels
    _ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    _ctx.lineWidth = 1;
    _ctx.fillStyle = "rgba(148, 163, 184, 0.65)";
    _ctx.font = "11px 'JetBrains Mono', monospace";
    _ctx.textAlign = "left";

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const priceVal = minP + (priceRange / steps) * i;
      const y = getY(priceVal);

      _ctx.beginPath();
      _ctx.moveTo(padding.left, y);
      _ctx.lineTo(width - padding.right, y);
      _ctx.stroke();

      const formattedPrice = (priceVal != null && !isNaN(priceVal)) ? Number(priceVal).toFixed(2) : "0.00";
      _ctx.fillText(`${_currencySymbol}${formattedPrice}`, width - padding.right + 8, y + 4);
    }

    // Gradient Area under price curve
    const areaGrad = _ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    areaGrad.addColorStop(0, "rgba(56, 189, 248, 0.28)");
    areaGrad.addColorStop(1, "rgba(56, 189, 248, 0.0)");

    _ctx.beginPath();
    _filteredPoints.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.close);
      if (idx === 0) _ctx.moveTo(x, y);
      else _ctx.lineTo(x, y);
    });
    _ctx.lineTo(getX(_filteredPoints.length - 1), padding.top + chartH);
    _ctx.lineTo(getX(0), padding.top + chartH);
    _ctx.closePath();
    _ctx.fillStyle = areaGrad;
    _ctx.fill();

    // Main Close Price Line
    _ctx.beginPath();
    _filteredPoints.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.close);
      if (idx === 0) _ctx.moveTo(x, y);
      else _ctx.lineTo(x, y);
    });
    _ctx.strokeStyle = "#38bdf8";
    _ctx.lineWidth = 2.5;
    _ctx.stroke();

    // Optional SMA 50 Line
    _ctx.beginPath();
    let hasSMA50 = false;
    _filteredPoints.forEach((p, idx) => {
      if (p.sma50 != null) {
        const x = getX(idx);
        const y = getY(p.sma50);
        if (!hasSMA50) { _ctx.moveTo(x, y); hasSMA50 = true; }
        else _ctx.lineTo(x, y);
      }
    });
    if (hasSMA50) {
      _ctx.strokeStyle = "rgba(245, 158, 11, 0.85)"; // Amber SMA 50
      _ctx.lineWidth = 1.5;
      _ctx.setLineDash([4, 4]);
      _ctx.stroke();
      _ctx.setLineDash([]);
    }

    // Optional SMA 200 Line
    _ctx.beginPath();
    let hasSMA200 = false;
    _filteredPoints.forEach((p, idx) => {
      if (p.sma200 != null) {
        const x = getX(idx);
        const y = getY(p.sma200);
        if (!hasSMA200) { _ctx.moveTo(x, y); hasSMA200 = true; }
        else _ctx.lineTo(x, y);
      }
    });
    if (hasSMA200) {
      _ctx.strokeStyle = "rgba(239, 68, 68, 0.85)"; // Red SMA 200
      _ctx.lineWidth = 1.5;
      _ctx.setLineDash([6, 3]);
      _ctx.stroke();
      _ctx.setLineDash([]);
    }

    // Draw Crosshair & Hover Tooltip
    if (_hoverIndex >= 0 && _hoverIndex < _filteredPoints.length) {
      const p = _filteredPoints[_hoverIndex];
      const hx = getX(_hoverIndex);
      const hy = getY(p.close);

      // Vertical crosshair
      _ctx.beginPath();
      _ctx.moveTo(hx, padding.top);
      _ctx.lineTo(hx, padding.top + chartH);
      _ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      _ctx.lineWidth = 1;
      _ctx.stroke();

      // Horizontal crosshair
      _ctx.beginPath();
      _ctx.moveTo(padding.left, hy);
      _ctx.lineTo(width - padding.right, hy);
      _ctx.stroke();

      // Glowing point
      _ctx.beginPath();
      _ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      _ctx.fillStyle = "#38bdf8";
      _ctx.fill();
      _ctx.strokeStyle = "#ffffff";
      _ctx.lineWidth = 2;
      _ctx.stroke();

      // Tooltip Card
      const ttW = 160;
      const ttH = 65;
      let ttX = hx + 12;
      if (ttX + ttW > width - padding.right) ttX = hx - ttW - 12;
      let ttY = hy - ttH / 2;
      if (ttY < padding.top) ttY = padding.top;
      if (ttY + ttH > padding.top + chartH) ttY = padding.top + chartH - ttH;

      _ctx.fillStyle = "rgba(19, 29, 49, 0.95)";
      _ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      _ctx.lineWidth = 1;
      _ctx.beginPath();
      _ctx.roundRect ? _ctx.roundRect(ttX, ttY, ttW, ttH, 6) : _ctx.rect(ttX, ttY, ttW, ttH);
      _ctx.fill();
      _ctx.stroke();

      _ctx.fillStyle = "#94a3b8";
      _ctx.font = "11px 'Inter', sans-serif";
      _ctx.textAlign = "left";
      _ctx.fillText(p.date || "", ttX + 10, ttY + 20);

      _ctx.fillStyle = "#f8fafc";
      _ctx.font = "bold 14px 'JetBrains Mono', monospace";
      const closeDisplay = (p.close != null && !isNaN(Number(p.close))) ? Number(p.close).toFixed(2) : "0.00";
      _ctx.fillText(`${_currencySymbol}${closeDisplay}`, ttX + 10, ttY + 42);

      if (p.volume != null && !isNaN(Number(p.volume))) {
        _ctx.fillStyle = "#64748b";
        _ctx.font = "10px 'JetBrains Mono', monospace";
        const volMillions = (Number(p.volume) / 1000000).toFixed(2);
        _ctx.fillText(`Vol: ${volMillions}M`, ttX + 10, ttY + 56);
      }
    }
  }

  function onMouseMove(e) {
    if (!_canvas || !_filteredPoints || _filteredPoints.length === 0) return;
    const rect = _canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 15, right: 60 };
    const chartW = parseFloat(_canvas.style.width) - padding.left - padding.right;

    const relX = Math.max(0, Math.min(x - padding.left, chartW));
    const idx = Math.round((relX / chartW) * (_filteredPoints.length - 1));

    if (idx !== _hoverIndex) {
      _hoverIndex = idx;
      draw();
    }
  }

  function onMouseLeave() {
    if (_hoverIndex !== -1) {
      _hoverIndex = -1;
      draw();
    }
  }

  return {
    init,
    setTimeframe
  };
})();

window.StockChart = StockChart;

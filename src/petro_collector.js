/* ==========================================================================
   petro_collector.js — داده‌گیر عامل «دیدبان پتروشیمی» — نسخهٔ ۲ (۱۴۰۵/۰۷/۰۵)
   A) petroSnapshot(symbol)        → run in a tab on https://www.tsetmc.com
   B) petroEvaluate(logs)          → same tab; scores earlier calls against what happened
   C) codalSnapshot(symbol, days)  → run in a tab on https://www.codal.ir
   D) codalLetterText(url)         → same codal tab; readable text of one letter
   Changes vs v1: rubric re-estimated on 13 years (1392-1405) with regime-conditioned calibration; request timeouts, minimum-history guards for indicators, IPO / new-listing
   block, chart structure (swings, key levels, volume-by-price, anchored VWAP), streaks,
   group flow excluding the symbol itself, live index append after the close, group regime
   (hot / mid / cold) with the regime-conditioned calibration table, AGM/HTML letters.
   v2.1: `trend` block — daily / weekly (completed weeks) / yearly trend, alignment, 60-day regression channel.
   v2.1.1: group block — MarketWatch no longer returns `flow`; a missing flow no longer drops every symbol.
   v2.1.2: group block uses the symbol's own sector (e.g. 23 = refineries) and its index for regime; codal peers follow the group.
   v2.3: `technical` block — OHLC (daily 320 bars, weekly 104) for drawing, Fibonacci, pivots, Ichimoku, Stochastic, Bollinger/MACD values,
         RSI divergence, candlestick and chart patterns, each with its 13-year backtest edge (techtools.py).
   ========================================================================== */

async function petroSnapshot(symbol) {
  const BASE = 'https://cdn.tsetmc.com/api/';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const J = async (u, tries = 4, ms = 15000) => {
    for (let i = 0; i < tries; i++) {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), ms);
      try { const r = await fetch(BASE + u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); } catch (e) { clearTimeout(tm); }
      await sleep(800 * (i + 1));
    }
    return null;
  };
  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/\s+/g, ' ').trim();
  const R = (x, d = 4) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** d) / 10 ** d;
  const out = { symbol, version: 2, generated_at: new Date().toISOString(), warnings: [] };

  // ---------- 1) instrument
  const srch = await J('Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(symbol)));
  const all = (srch?.instrumentSearch || []).filter(x => ar(x.lVal18AFC) === ar(symbol));
  const ins = all.find(x => [1, 2, 4].includes(x.flow) && !/3$|4$/.test(x.cgrValCot || '')) || all[0];
  if (!ins) return { error: 'نماد پیدا نشد', symbol };
  const ic = ins.insCode;
  out.instrument = { insCode: ic, name: ins.lVal30, market: ins.flowTitle, board: ins.cgrValCot };
  const [info, live, bl, ctToday] = await Promise.all([
    J(`Instrument/GetInstrumentInfo/${ic}`), J(`ClosingPrice/GetClosingPriceInfo/${ic}`),
    J(`BestLimits/${ic}`), J(`ClientType/GetClientType/${ic}/1/0`)]);
  const [daily, cth] = await Promise.all([J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`), J(`ClientType/GetClientTypeHistory/${ic}`)]);
  if (!daily) return { error: 'سابقهٔ قیمت از tsetmc نیامد؛ دوباره اجرا کن', symbol };
  const I = info?.instrumentInfo || {}, L = live?.closingPriceInfo || {};
  out.instrument.state = L.instrumentState?.cEtavalTitle || null;
  out.fundamental_quick = { eps_estimated: I.eps?.estimatedEPS, sector_pe: I.eps?.sectorPE, shares: I.zTitad, sector: I.sector?.lSecVal,
    avg_volume_3m: I.qTotTran5JAvg, free_float_pct: I.kAjCapValCpsIdx, price_limits_today: [I.staticThreshold?.psGelStaMin, I.staticThreshold?.psGelStaMax] };

  // ---------- 2) daily series (+ today's live row) and adjustment
  const rawAll = (daily.closingPriceDaily || []).sort((a, b) => a.dEven - b.dEven);
  let D = rawAll.filter(r => r.qTotTran5J > 0)
    .map(r => ({ d: r.dEven, o: r.priceFirst, h: r.priceMax, l: r.priceMin, last: r.pDrCotVal, c: r.pClosing, y: r.priceYesterday, v: r.qTotTran5J, val: r.qTotCap }));
  if (L.finalLastDate && D.length && L.finalLastDate > D[D.length - 1].d && L.qTotTran5J > 0)
    D.push({ d: L.finalLastDate, o: L.priceFirst, h: L.priceMax, l: L.priceMin, last: L.pDrCotVal, c: L.pClosing, y: L.priceYesterday, v: L.qTotTran5J, val: L.qTotCap, live: true });
  const n = D.length, t = n - 1;
  if (n < 5) return { error: 'سابقهٔ معاملاتی کافی نیست', symbol, days: n };
  // IPO row (reference price = par 1000 on the first trading day) — excluded from adjustment
  const ipoIdx = D.findIndex(r => r.y === 1000 && r.c > 1500);
  const fac = new Array(n).fill(1); const adjDays = [];
  for (let i = n - 2; i >= 0; i--) { let ratio = (i + 1 === ipoIdx) ? 1 : D[i + 1].y / D[i].c; if (ratio > 0.995 && ratio < 1.005) ratio = 1; else adjDays.push([D[i + 1].d, R(ratio, 4)]); fac[i] = fac[i + 1] * ratio; }
  const C = D.map((r, i) => r.c * fac[i]), H = D.map((r, i) => r.h * fac[i]), Lo = D.map((r, i) => r.l * fac[i]), LST = D.map((r, i) => r.last * fac[i]);
  const V = D.map(r => r.v), VAL = D.map(r => r.val);
  const hist = ipoIdx >= 0 ? n - ipoIdx : n;           // trading days since listing (or available history)
  if (hist < 60) out.warnings.push(`فقط ${hist} روز سابقه: اندیکاتورهای بلندتر از این دوره null هستند و امتیاز نمی‌گیرند`);

  // ---------- 3) indicators (each one only when enough history exists)
  const sma = (a, k, i) => (i + 1 < k || i - k + 1 < (ipoIdx > 0 ? ipoIdx : 0)) ? null : a.slice(i + 1 - k, i + 1).reduce((s, x) => s + x, 0) / k;
  const emaArr = (a, k) => { const e = []; const al = 2 / (k + 1); a.forEach((x, i) => e.push(i ? al * x + (1 - al) * e[i - 1] : x)); return e; };
  const wilder = (a, k) => { const e = []; a.forEach((x, i) => e.push(i ? e[i - 1] + (x - e[i - 1]) / k : x)); return e; };
  const ok = k => hist >= k;
  const up = C.map((x, i) => i ? Math.max(0, x - C[i - 1]) : 0), dn = C.map((x, i) => i ? Math.max(0, C[i - 1] - x) : 0);
  const au = wilder(up, 14), ad = wilder(dn, 14); const RSI = au.map((u, i) => 100 - 100 / (1 + u / (ad[i] || 1e-9)));
  const e12 = emaArr(C, 12), e26 = emaArr(C, 26); const MACD = e12.map((x, i) => x - e26[i]); const SIG = emaArr(MACD, 9);
  const TR = C.map((x, i) => i ? Math.max(H[i] - Lo[i], Math.abs(H[i] - C[i - 1]), Math.abs(Lo[i] - C[i - 1])) : H[i] - Lo[i]);
  const pdm = H.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return u > d && u > 0 ? u : 0; });
  const ndm = Lo.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return d > u && d > 0 ? d : 0; });
  const ATR = wilder(TR, 14), PDI = wilder(pdm, 14).map((x, i) => 100 * x / ATR[i]), NDI = wilder(ndm, 14).map((x, i) => 100 * x / ATR[i]);
  const ADX = wilder(PDI.map((p, i) => 100 * Math.abs(p - NDI[i]) / ((p + NDI[i]) || 1e-9)), 14);
  const hi = (a, k, i) => Math.max(...a.slice(Math.max(0, i - k), i)), lo = (a, k, i) => Math.min(...a.slice(Math.max(0, i - k), i));
  const sd20 = ok(20) ? Math.sqrt(C.slice(t - 19, t + 1).reduce((s, x) => s + (x - sma(C, 20, t)) ** 2, 0) / 20) : null;
  const bbp = sd20 ? (C[t] - (sma(C, 20, t) - 2 * sd20)) / (4 * sd20) : null;
  const last = D[t], chgLast = last.last / last.y - 1;
  const ind = {
    date: last.d, live_row: !!last.live, close: last.c, last: last.last, yesterday: last.y, high: last.h, low: last.l, open: last.o,
    chg_close_pct: R(100 * (last.c / last.y - 1), 2), chg_last_pct: R(100 * chgLast, 2), history_days: hist,
    ret_5d: t >= 5 ? R(C[t] / C[t - 5] - 1) : null, ret_20d: ok(21) ? R(C[t] / C[t - 20] - 1) : null, ret_60d: ok(61) ? R(C[t] / C[t - 60] - 1) : null, ret_240d: ok(241) ? R(C[t] / C[t - 240] - 1) : null,
    sma20: R(sma(C, 20, t), 0), sma50: R(sma(C, 50, t), 0), sma100: R(sma(C, 100, t), 0),
    rsi14: ok(30) ? R(RSI[t], 1) : null, macd_hist: ok(40) ? R(MACD[t] - SIG[t], 1) : null,
    macd_cross: ok(40) ? ((MACD[t] > SIG[t] && MACD[t - 1] <= SIG[t - 1]) ? 'up' : (MACD[t] < SIG[t] && MACD[t - 1] >= SIG[t - 1]) ? 'down' : null) : null,
    adx14: ok(30) ? R(ADX[t], 1) : null, plus_di: ok(30) ? R(PDI[t], 1) : null, minus_di: ok(30) ? R(NDI[t], 1) : null, atr_pct: ok(15) ? R(ATR[t] / C[t]) : null,
    bollinger_pctb: R(bbp, 2), donchian20_high: ok(21) ? R(hi(H, 20, t), 0) : null, donchian20_low: ok(21) ? R(lo(Lo, 20, t), 0) : null,
    vol_ratio_20: ok(21) ? R(V[t] / sma(V, 20, t - 1), 2) : null, value_today: VAL[t],
    last_minus_close_pct: R(100 * (last.last - last.c) / last.y, 2), adjustments_last_year: adjDays.filter(x => x[0] >= D[Math.max(0, t - 240)].d)
  };
  const pMaxT = I.staticThreshold?.psGelStaMax, pMinT = I.staticThreshold?.psGelStaMin;
  ind.closed_at_upper_limit = (pMaxT && last.live) ? last.last >= pMaxT : (chgLast >= 0.0285 && last.last >= last.h);
  ind.closed_at_lower_limit = (pMinT && last.live) ? last.last <= pMinT : (chgLast <= -0.0285 && last.last <= last.l);
  // trend class (stock level) — used to read signals in context
  ind.trend_class = (ok(51) && C[t] > ind.sma20 && ind.sma20 > ind.sma50 && ind.ret_20d > 0.10) ? 'strong_up'
    : (ok(51) && C[t] < ind.sma20 && ind.sma20 < ind.sma50 && ind.ret_20d < -0.10) ? 'strong_down' : (ok(51) ? 'other' : 'unknown_short_history');
  // streaks
  const lim = i => (D[i].last / D[i].y - 1 >= 0.0285 && D[i].last >= D[i].h);
  let qs = 0; for (let i = t - 1; i >= 0 && lim(i); i--) qs++;
  let us = 0; for (let i = t - 1; i >= 1 && C[i] > C[i - 1]; i--) us++;
  ind.buy_queue_streak_before_today = qs; ind.up_day_streak_before_today = us;
  out.daily = ind;

  // ---------- 4) chart structure: swings, key levels, volume-by-price, anchored VWAP
  const sw = { highs: [], lows: [] };
  for (let i = Math.max(2, t - 120); i <= t - 2; i++) {
    const wH = H.slice(i - 2, i + 3), wL = Lo.slice(i - 2, i + 3);
    if (H[i] === Math.max(...wH)) sw.highs.push([D[i].d, R(H[i], 0)]);
    if (Lo[i] === Math.min(...wL)) sw.lows.push([D[i].d, R(Lo[i], 0)]);
  }
  const lh = sw.highs.slice(-3), ll = sw.lows.slice(-3);
  let structure = 'نامشخص';
  if (lh.length >= 2 && ll.length >= 2) {
    const hhS = lh[lh.length - 1][1] > lh[lh.length - 2][1], hlS = ll[ll.length - 1][1] > ll[ll.length - 2][1];
    structure = hhS && hlS ? 'صعودی (HH/HL)' : (!hhS && !hlS) ? 'نزولی (LH/LL)' : 'رنج/در حال تغییر';
  }
  const lastSH = lh.length ? lh[lh.length - 1][1] : null, lastSL = ll.length ? ll[ll.length - 1][1] : null;
  const win = Math.min(60, hist), vb = {}; let vmin = Infinity, vmax = -Infinity;
  for (let i = t - win + 1; i <= t; i++) { vmin = Math.min(vmin, Lo[i]); vmax = Math.max(vmax, H[i]); }
  const step = (vmax - vmin) / 20 || 1;
  for (let i = t - win + 1; i <= t; i++) { const px = (H[i] + Lo[i] + C[i]) / 3; const b = Math.min(19, Math.floor((px - vmin) / step)); vb[b] = (vb[b] || 0) + V[i]; }
  const nodes = Object.entries(vb).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => R(vmin + (+b + 0.5) * step, 0));
  const anchor = ipoIdx >= 0 ? ipoIdx : Math.max(0, t - 60);
  let avN = 0, avD = 0; for (let i = anchor; i <= t; i++) { avN += (H[i] + Lo[i] + C[i]) / 3 * V[i]; avD += V[i]; }
  const levels = [];
  const add = (nm, v) => { if (v && isFinite(v)) levels.push([nm, R(v, 0), R(100 * (v / C[t] - 1), 1)]); };
  add('سقف دیروز', D[t - 1]?.h * fac[t - 1]); add('کف دیروز', D[t - 1]?.l * fac[t - 1]); add('آخرین سقف چرخشی', lastSH); add('آخرین کف چرخشی', lastSL);
  add('سقف ۲۰ روزه', ind.donchian20_high); add('کف ۲۰ روزه', ind.donchian20_low); add('SMA20', ind.sma20); add('SMA50', ind.sma50);
  add(ipoIdx >= 0 ? 'VWAP از عرضهٔ اولیه' : 'VWAP لنگر ۶۰ روزه', avN / avD); nodes.forEach((x, k) => add(`گره حجمی ${k + 1}`, x));
  if (ipoIdx >= 0) add('قیمت عرضهٔ اولیه', D[ipoIdx].c * fac[ipoIdx]);
  levels.sort((a, b) => b[1] - a[1]);
  const res = levels.filter(x => x[1] > C[t] * 1.002), sup = levels.filter(x => x[1] < C[t] * 0.998);
  out.chart = { structure, swing_highs: lh, swing_lows: ll, levels_sorted_high_to_low: levels,
    nearest_resistance: res.length ? res[res.length - 1] : null, nearest_support: sup.length ? sup[0] : null,
    close_above_last_swing_high: lastSH ? C[t] > lastSH * 1.01 : null, close_below_last_swing_low: lastSL ? C[t] < lastSL * 0.99 : null,
    tested_last_swing_low_and_held: lastSL ? (Lo[t] <= lastSL * 1.01 && C[t] > lastSL) : null,
    note: 'levels: [نام، قیمت تعدیل‌شده، فاصله از قیمت پایانی ٪]' };

  // ---------- 4b) multi-timeframe trend (same definitions as the 13-year backtest, trend.py / trend2.py)
  {
    const s0 = ipoIdx > 0 ? ipoIdx : 0;
    const tr = { note: 'زمینه است، امتیاز ندارد؛ قاعدهٔ استفاده در بخش «روند چندافقی» پرامپت' };
    // daily: moving-average alignment
    const s20 = sma(C, 20, t), s50 = sma(C, 50, t), s100 = sma(C, 100, t);
    tr.daily = (s20 === null || s50 === null || s100 === null) ? 'unknown_short_history'
      : (C[t] > s20 && s20 > s50 && s50 > s100) ? 'up' : (C[t] < s20 && s20 < s50 && s50 < s100) ? 'down' : 'mixed';
    // weekly: completed weeks only (Iran week Sat-Wed; key = the Friday that ends it); the current week is excluded
    const wkKey = dEv => { const s = String(dEv); const dt = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); dt.setUTCDate(dt.getUTCDate() + (5 - dt.getUTCDay() + 7) % 7); return dt.toISOString().slice(0, 10); };
    const wk = []; // [key, close, high, low]
    for (let i = s0; i <= t; i++) { const k = wkKey(D[i].d); const w = wk[wk.length - 1];
      if (!w || w[0] !== k) wk.push([k, C[i], H[i], Lo[i]]); else { w[1] = C[i]; w[2] = Math.max(w[2], H[i]); w[3] = Math.min(w[3], Lo[i]); } }
    const done = wk.slice(0, -1), m = done.length, wc = done.map(w => w[1]);
    const wsma = (k, j) => j + 1 < k ? null : wc.slice(j + 1 - k, j + 1).reduce((a, b) => a + b, 0) / k;
    if (m >= 32) {
      const j = m - 1, w10 = wsma(10, j), w30 = wsma(30, j), w10p = wsma(10, j - 2);
      tr.weekly = (wc[j] > w10 && w10 > w30 && w10 > w10p) ? 'up' : (wc[j] < w10 && w10 < w30 && w10 < w10p) ? 'down' : 'mixed';
      tr.weekly_sma10 = R(w10, 0); tr.weekly_sma30 = R(w30, 0);
    } else tr.weekly = 'unknown_short_history';
    if (m >= 8) {
      const hh = a => Math.max(...a.map(w => w[2])), llw = a => Math.min(...a.map(w => w[3]));
      const cur = done.slice(-4), prv = done.slice(-8, -4);
      tr.weekly_structure = (hh(cur) > hh(prv) && llw(cur) > llw(prv)) ? 'HH/HL' : (hh(cur) < hh(prv) && llw(cur) < llw(prv)) ? 'LH/LL' : 'mixed';
    } else tr.weekly_structure = 'unknown_short_history';
    // yearly: 200-day average and its 20-day slope, 52-week range position
    const s200 = sma(C, 200, t), s200p = sma(C, 200, t - 20);
    tr.yearly = (s200 === null || s200p === null) ? 'unknown_short_history' : (C[t] > s200 && s200 > s200p) ? 'up' : (C[t] < s200 && s200 <= s200p) ? 'down' : 'mixed';
    tr.sma200 = R(s200, 0);
    if (hist >= 241) { const h52 = Math.max(...H.slice(t - 239, t + 1)), l52 = Math.min(...Lo.slice(t - 239, t + 1)); tr.position_in_52w_range = R((C[t] - l52) / (h52 - l52), 2); }
    const known = [tr.daily, tr.weekly, tr.yearly].filter(x => !String(x).startsWith('unknown'));
    tr.alignment = known.length < 3 ? 'incomplete' : known.every(x => x === 'up') ? 'all_up' : known.every(x => x === 'down') ? 'all_down' : 'mixed';
    // 60-day regression channel of log price (trendline proxy); today's close vs YESTERDAY's channel
    if (t - s0 >= 61) {
      const fitAt = end => { let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0; const nn = 60;
        for (let i = end - 59, x = 0; i <= end; i++, x++) { const y = Math.log(C[i]); sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }
        const vx = sxx / nn - (sx / nn) ** 2, vy = syy / nn - (sy / nn) ** 2, cv = sxy / nn - (sx / nn) * (sy / nn), b = cv / vx, a = sy / nn - b * sx / nn;
        return { a, b, r2: cv * cv / (vx * vy), sd: Math.sqrt(Math.max(vy - b * b * vx, 0)) }; };
      const f = fitAt(t), fp = fitAt(t - 1), z = (Math.log(C[t]) - (fp.a + fp.b * 60)) / (fp.sd || 1e-9);
      const kind = (f.b * 60 > 0.10 && f.r2 > 0.6) ? 'clean_up' : (f.b * 60 < -0.10 && f.r2 > 0.6) ? 'clean_down' : 'none';
      tr.channel60 = { kind, slope_60d_pct: R(100 * f.b * 60, 1), r2: R(f.r2, 2), z_vs_yesterdays_channel: R(z, 2),
        lower_line_today: R(Math.exp(f.a + f.b * 59 - 2 * f.sd), 0), upper_line_today: R(Math.exp(f.a + f.b * 59 + 2 * f.sd), 0) };
    }
    out.trend = tr;
  }

  // ---------- 4c) technical toolkit: OHLC for drawing, Fibonacci, pivots, Ichimoku, Stochastic, divergence, candles, chart patterns
  //               definitions = the 13-year backtest (techtools.py, 1392-1405); `backtest` = [n, edge 5d pp, edge 20d pp, eras (of 5) with the same sign]
  {
    const s0 = ipoIdx > 0 ? ipoIdx : 0;
    const O = D.map((r, i) => (r.o || D[i].c) * fac[i]);
    const r0 = x => R(x, 0);
    const TT = { fib_up_zone: [9631, 1.1, -0.1, 3], fib_up_zone_bounce: [3712, 2.0, -0.9, 4], fib_up_break618: [449, 5.3, 1.5, 4], fib_dn_zone: [4238, 0.1, 0.1, 3],
      fib_dn_zone_reject: [2012, -0.5, -0.4, 3], fib_dn_break618: [251, -0.5, -6.0, 3], piv_above_r1: [11763, -1.4, -2.7, 3], piv_below_s1: [10884, 1.8, 0.6, 4],
      piv_s1_bounce: [25097, -1.9, -0.3, 4], piv_r1_reject: [21435, 2.1, 2.3, 4], wpiv_above_r1: [10441, -1.3, -0.8, 4], wpiv_below_s1: [9001, 2.1, 0.7, 4],
      ichi_above: [33174, 0.3, 0.6, 5], ichi_below: [23738, 0.2, 0.4, 3], ichi_in: [9130, 0.1, 0.3, 3], ichi_tk_up_above: [629, 2.6, 2.1, 4], ichi_tk_dn_below: [433, 1.1, -2.0, 3],
      ichi_break_up: [984, 0.5, -1.9, 4], ichi_break_dn: [1102, 4.3, 2.5, 4], stoch_up20: [3438, 2.1, -0.3, 4], stoch_dn80: [4256, -1.7, -0.3, 5],
      div_bull: [386, -0.6, -5.6, 3], div_bear: [607, -0.1, 2.3, 3], c_doji: [10458, 0.6, 0.0, 4], c_hammer: [1150, 0.3, -1.1, 3], c_star: [1408, -0.4, 1.8, 4],
      c_bull_eng: [762, 1.8, 0.0, 3], c_bear_eng: [1022, 0.1, -0.7, 2], c_morning: [413, -2.1, -0.4, 4], c_evening: [411, 2.1, -1.2, 4],
      p_dtop: [44, 7.1, -1.2, 5], p_dbot: [57, 1.0, -6.8, 2], p_hs: [144, 3.4, -1.4, 4], p_ihs: [91, 5.3, -0.5, 4], p_tri_up: [613, 0.9, -2.5, 3], p_tri_dn: [766, 2.4, 0.7, 4] };
    const LBL = { fib_up_zone: 'فیبوناچی: پولبک در ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪', fib_up_zone_bounce: 'فیبوناچی: برگشت از ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪', fib_up_break618: 'فیبوناچی: شکست ۶۱٫۸٪ در پولبک',
      fib_dn_zone: 'فیبوناچی: رشد اصلاحی تا ۳۸٫۲ تا ۶۱٫۸٪', fib_dn_zone_reject: 'فیبوناچی: برگشت از مقاومت ۳۸٫۲ تا ۶۱٫۸٪', fib_dn_break618: 'فیبوناچی: عبور از ۶۱٫۸٪ در روند نزولی',
      piv_above_r1: 'پیوت روزانه: بالای R1', piv_below_s1: 'پیوت روزانه: زیر S1', piv_s1_bounce: 'پیوت روزانه: برگشت از S1', piv_r1_reject: 'پیوت روزانه: برگشت از R1',
      wpiv_above_r1: 'پیوت هفتگی: بالای R1', wpiv_below_s1: 'پیوت هفتگی: زیر S1', ichi_above: 'ایچیموکو: بالای ابر', ichi_below: 'ایچیموکو: زیر ابر', ichi_in: 'ایچیموکو: داخل ابر',
      ichi_tk_up_above: 'ایچیموکو: تقاطع تنکان/کیجون رو به بالا، بالای ابر', ichi_tk_dn_below: 'ایچیموکو: تقاطع رو به پایین، زیر ابر', ichi_break_up: 'ایچیموکو: خروج از ابر رو به بالا',
      ichi_break_dn: 'ایچیموکو: خروج از ابر رو به پایین', stoch_up20: 'Stochastic: تقاطع رو به بالا زیر ۲۰', stoch_dn80: 'Stochastic: تقاطع رو به پایین بالای ۸۰',
      div_bull: 'واگرایی مثبت RSI', div_bear: 'واگرایی منفی RSI', c_doji: 'کندل دوجی', c_hammer: 'کندل چکش', c_star: 'کندل ستارهٔ دنباله‌دار', c_bull_eng: 'پوشای صعودی',
      c_bear_eng: 'پوشای نزولی', c_morning: 'ستارهٔ صبحگاهی', c_evening: 'ستارهٔ شامگاهی', p_dtop: 'سقف دوقلو (شکست خط گردن)', p_dbot: 'کف دوقلو (شکست خط گردن)',
      p_hs: 'سر و شانه (شکست خط گردن)', p_ihs: 'سر و شانهٔ معکوس (شکست خط گردن)', p_tri_up: 'مثلث: شکست رو به بالا', p_tri_dn: 'مثلث: شکست رو به پایین' };
    const tk = { note: 'ابزارهای کلاسیک برای رسم نمودار، سطوح، حد ضرر و هدف؛ هیچ‌کدام امتیاز ندارند. لبه‌ها از آزمون ۱۳ ساله (بخش ۴-۱-ج پرامپت).' };
    const fired = new Set();
    const T0 = Math.max(s0, n - 320);
    tk.ohlc_daily = []; for (let i = T0; i <= t; i++) tk.ohlc_daily.push([D[i].d, r0(O[i]), r0(H[i]), r0(Lo[i]), r0(C[i]), V[i]]);
    tk.ohlc_columns = ['dEven', 'open', 'high', 'low', 'close(پایانی)', 'volume'];
    // weekly bars (Iran week Sat-Wed); the last one may be the running week
    const wkKey = dEv => { const s = String(dEv); const dt = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); dt.setUTCDate(dt.getUTCDate() + (5 - dt.getUTCDay() + 7) % 7); return dt.toISOString().slice(0, 10); };
    const W = []; let wk0 = null;
    for (let i = s0; i <= t; i++) { const k = wkKey(D[i].d);
      if (k !== wk0) { W.push([D[i].d, O[i], H[i], Lo[i], C[i], V[i]]); wk0 = k; }
      else { const w = W[W.length - 1]; w[0] = D[i].d; w[2] = Math.max(w[2], H[i]); w[3] = Math.min(w[3], Lo[i]); w[4] = C[i]; w[5] += V[i]; } }
    tk.ohlc_weekly = W.slice(-104).map(w => [w[0], r0(w[1]), r0(w[2]), r0(w[3]), r0(w[4]), w[5]]);
    const ready = t - s0 >= 60;
    // ---- Fibonacci on the 120-bar swing
    if (t - s0 >= 20) {
      const a = Math.max(s0, t - 119); let hi = a, lo = a;
      for (let i = a; i <= t; i++) { if (H[i] > H[hi]) hi = i; if (Lo[i] < Lo[lo]) lo = i; }
      const HI = H[hi], LO = Lo[lo], span = HI - LO, up = hi > lo, ext = up ? hi : lo;
      const valid = HI / LO - 1 >= 0.15 && t - ext >= 3;
      const lvl = r => up ? HI - r * span : LO + r * span;
      const rt = up ? (HI - C[t]) / span : (C[t] - LO) / span, rtp = up ? (HI - C[t - 1]) / span : (C[t - 1] - LO) / span;
      if (valid && ready) {
        if (up) { if (rt >= 0.382 && rt <= 0.618) { fired.add('fib_up_zone'); if (C[t] > C[t - 1] && Lo[t] <= lvl(0.382)) fired.add('fib_up_zone_bounce'); } if (rt > 0.618 && rtp <= 0.618) fired.add('fib_up_break618'); }
        else { if (rt >= 0.382 && rt <= 0.618) { fired.add('fib_dn_zone'); if (C[t] < C[t - 1] && H[t] >= lvl(0.382)) fired.add('fib_dn_zone_reject'); } if (rt > 0.618 && rtp <= 0.618) fired.add('fib_dn_break618'); }
      }
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map(r => [r, r0(lvl(r))]);
      const exts = [1.272, 1.618, 2].map(r => [r, r0(up ? LO + r * span : HI - r * span)]);
      const near = levels.slice(1, -1).map(([r, p]) => [r, p, Math.abs(p / C[t] - 1)]).sort((x, y) => x[2] - y[2])[0];
      tk.fibonacci = { direction: up ? 'up' : 'down', swing_from: [D[up ? lo : hi].d, r0(up ? LO : HI)], swing_to: [D[ext].d, r0(up ? HI : LO)], swing_pct: R(100 * (HI / LO - 1), 1),
        valid_swing: valid, bars_since_swing_end: t - ext, retracement_now: R(rt, 3), retracement_levels: levels, extension_levels: exts,
        nearest_level: near ? [near[0], near[1], R(100 * (near[1] / C[t] - 1), 1)] : null,
        rule: 'up: سطوح اصلاحی از سقف به پایین (حمایت)، extension هدف‌های بالای سقف؛ down: سطوح اصلاحی از کف به بالا (مقاومت). نوسان معتبر ≥ ۱۵٪.' };
    }
    // ---- pivots: signals use yesterday's bar; next-session levels use today's bar
    const piv = (h, l, c) => { const P = (h + l + c) / 3; return { P, R1: 2 * P - l, R2: P + (h - l), R3: h + 2 * (P - l), S1: 2 * P - h, S2: P - (h - l), S3: l - 2 * (h - P) }; };
    const pr = o => o && Object.fromEntries(Object.entries(o).map(([k, v]) => [k, r0(v)]));
    if (t >= 1) {
      const py = piv(H[t - 1], Lo[t - 1], C[t - 1]);
      if (ready) { if (C[t] > py.R1) fired.add('piv_above_r1'); if (C[t] < py.S1) fired.add('piv_below_s1'); if (Lo[t] <= py.S1 && C[t] > py.S1) fired.add('piv_s1_bounce'); if (H[t] >= py.R1 && C[t] < py.R1) fired.add('piv_r1_reject'); }
      const done = W.slice(0, -1), lw = done[done.length - 1];
      const wp = lw ? piv(lw[2], lw[3], lw[4]) : null;
      if (wp && ready) { if (C[t] > wp.R1) fired.add('wpiv_above_r1'); if (C[t] < wp.S1) fired.add('wpiv_below_s1'); }
      tk.pivots = { next_session_daily: pr(piv(H[t], Lo[t], C[t])), today_daily_from_yesterday: pr(py), weekly_from_last_completed_week: pr(wp), method: 'classic (P=(H+L+C)/3)' };
    }
    // ---- Ichimoku 9/26/52
    const hhv = (a, k, i) => { let m = -Infinity; for (let j = Math.max(s0, i - k + 1); j <= i; j++) m = Math.max(m, a[j]); return m; };
    const llv = (a, k, i) => { let m = Infinity; for (let j = Math.max(s0, i - k + 1); j <= i; j++) m = Math.min(m, a[j]); return m; };
    const ten = i => (hhv(H, 9, i) + llv(Lo, 9, i)) / 2, kij = i => (hhv(H, 26, i) + llv(Lo, 26, i)) / 2;
    const spA = i => (ten(i) + kij(i)) / 2, spB = i => (hhv(H, 52, i) + llv(Lo, 52, i)) / 2;
    if (t - s0 >= 78) {
      const top = Math.max(spA(t - 26), spB(t - 26)), bot = Math.min(spA(t - 26), spB(t - 26));
      const topp = Math.max(spA(t - 27), spB(t - 27)), botp = Math.min(spA(t - 27), spB(t - 27));
      const tkUp = ten(t) > kij(t) && ten(t - 1) <= kij(t - 1), tkDn = ten(t) < kij(t) && ten(t - 1) >= kij(t - 1);
      if (ready) { if (C[t] > top) fired.add('ichi_above'); else if (C[t] < bot) fired.add('ichi_below'); else fired.add('ichi_in');
        if (tkUp && C[t] > top) fired.add('ichi_tk_up_above'); if (tkDn && C[t] < bot) fired.add('ichi_tk_dn_below');
        if (C[t] > top && C[t - 1] <= topp) fired.add('ichi_break_up'); if (C[t] < bot && C[t - 1] >= botp) fired.add('ichi_break_dn'); }
      tk.ichimoku = { tenkan: r0(ten(t)), kijun: r0(kij(t)), cloud_top: r0(top), cloud_bottom: r0(bot), price_vs_cloud: C[t] > top ? 'above' : C[t] < bot ? 'below' : 'inside',
        tk_cross_today: tkUp ? 'up' : tkDn ? 'down' : null, future_cloud_26: spA(t) >= spB(t) ? 'bullish' : 'bearish', future_span_a: r0(spA(t)), future_span_b: r0(spB(t)),
        chikou_vs_price_26_ago: C[t] > C[t - 26] ? 'above' : 'below' };
    }
    // ---- Stochastic 14,3
    const kAt = i => { const hh = hhv(H, 14, i), ll = llv(Lo, 14, i); return hh > ll ? 100 * (C[i] - ll) / (hh - ll) : 50; };
    if (t - s0 >= 20) {
      const K = [t - 3, t - 2, t - 1, t].map(kAt), dNow = (K[1] + K[2] + K[3]) / 3, dPrev = (K[0] + K[1] + K[2]) / 3;
      const cu = K[3] > dNow && K[2] <= dPrev && dNow < 20, cd = K[3] < dNow && K[2] >= dPrev && dNow > 80;
      if (ready) { if (cu) fired.add('stoch_up20'); if (cd) fired.add('stoch_dn80'); }
      tk.stochastic = { k: R(K[3], 1), d: R(dNow, 1), cross: cu ? 'up_below_20' : cd ? 'down_above_80' : null };
    }
    // ---- Bollinger / MACD values for drawing
    if (ok(20)) { const m = sma(C, 20, t); tk.bollinger = { upper: r0(m + 2 * sd20), middle: r0(m), lower: r0(m - 2 * sd20), width_pct: R(100 * 4 * sd20 / m, 1) }; }
    if (ok(40)) tk.macd = { macd: R(MACD[t], 1), signal: R(SIG[t], 1), hist: R(MACD[t] - SIG[t], 1) };
    // ---- swings (5-bar fractal, confirmed two bars later) → divergence and chart patterns
    const SHs = [], SLs = [];
    for (let i = Math.max(s0 + 2, t - 122); i <= t - 2; i++) {
      if (H[i] === Math.max(...H.slice(i - 2, i + 3))) SHs.push(i);
      if (Lo[i] === Math.min(...Lo.slice(i - 2, i + 3))) SLs.push(i);
    }
    const sh = SHs.filter(i => i >= t - 120).slice(-4), sl = SLs.filter(i => i >= t - 120).slice(-4);
    const pt = (i, p) => [D[i].d, r0(p)];
    // RSI divergence (fires on the day the second swing is confirmed; `recent` = within 10 bars)
    const dv = [];
    if (sl.length >= 2) { const [a1, a2] = sl.slice(-2); if (a2 - a1 <= 60 && Lo[a2] < Lo[a1] && RSI[a2] > RSI[a1] + 2) { dv.push({ type: 'bullish', swings: [pt(a1, Lo[a1]), pt(a2, Lo[a2])], rsi: [R(RSI[a1], 1), R(RSI[a2], 1)], bars_ago: t - a2 }); if (a2 === t - 2 && ready) fired.add('div_bull'); } }
    if (sh.length >= 2) { const [a1, a2] = sh.slice(-2); if (a2 - a1 <= 60 && H[a2] > H[a1] && RSI[a2] < RSI[a1] - 2) { dv.push({ type: 'bearish', swings: [pt(a1, H[a1]), pt(a2, H[a2])], rsi: [R(RSI[a1], 1), R(RSI[a2], 1)], bars_ago: t - a2 }); if (a2 === t - 2 && ready) fired.add('div_bear'); } }
    tk.rsi_divergence = dv.filter(x => x.bars_ago <= 10);
    // chart patterns: status 'broken_today' (= backtested signal) or 'forming' (neckline not broken yet)
    const pats = [];
    const minL = (a, b) => Math.min(...Lo.slice(a, b + 1)), maxH = (a, b) => Math.max(...H.slice(a, b + 1));
    if (sh.length >= 2) { const [a1, a2] = sh.slice(-2);
      if (a2 - a1 >= 10 && Math.abs(H[a1] / H[a2] - 1) <= 0.03 && t - a2 <= 30) { const neck = minL(a1, a2);
        if (neck <= Math.min(H[a1], H[a2]) * 0.95) { const brk = C[t] < neck && neck <= C[t - 1]; if (brk && ready) fired.add('p_dtop');
          if (brk || C[t] >= neck) pats.push({ type: 'double_top', fa: 'سقف دوقلو', bias: 'bearish', status: brk ? 'broken_today' : 'forming', points: [pt(a1, H[a1]), pt(a2, H[a2])], neckline: r0(neck), measured_target: r0(neck - (Math.max(H[a1], H[a2]) - neck)) }); } } }
    if (sl.length >= 2) { const [a1, a2] = sl.slice(-2);
      if (a2 - a1 >= 10 && Math.abs(Lo[a1] / Lo[a2] - 1) <= 0.03 && t - a2 <= 30) { const neck = maxH(a1, a2);
        if (neck >= Math.max(Lo[a1], Lo[a2]) * 1.05) { const brk = C[t] > neck && neck >= C[t - 1]; if (brk && ready) fired.add('p_dbot');
          if (brk || C[t] <= neck) pats.push({ type: 'double_bottom', fa: 'کف دوقلو', bias: 'bullish', status: brk ? 'broken_today' : 'forming', points: [pt(a1, Lo[a1]), pt(a2, Lo[a2])], neckline: r0(neck), measured_target: r0(neck + (neck - Math.min(Lo[a1], Lo[a2]))) }); } } }
    if (sh.length >= 3) { const [A, B, Cc] = sh.slice(-3);
      if (H[B] >= 1.03 * Math.max(H[A], H[Cc]) && Math.abs(H[A] / H[Cc] - 1) <= 0.05 && t - Cc <= 30) { const neck = (minL(A, B) + minL(B, Cc)) / 2, brk = C[t] < neck && neck <= C[t - 1];
        if (brk && ready) fired.add('p_hs');
        if (brk || C[t] >= neck) pats.push({ type: 'head_shoulders', fa: 'سر و شانه', bias: 'bearish', status: brk ? 'broken_today' : 'forming', points: [pt(A, H[A]), pt(B, H[B]), pt(Cc, H[Cc])], neckline: r0(neck), measured_target: r0(neck - (H[B] - neck)) }); } }
    if (sl.length >= 3) { const [A, B, Cc] = sl.slice(-3);
      if (Lo[B] <= 0.97 * Math.min(Lo[A], Lo[Cc]) && Math.abs(Lo[A] / Lo[Cc] - 1) <= 0.05 && t - Cc <= 30) { const neck = (maxH(A, B) + maxH(B, Cc)) / 2, brk = C[t] > neck && neck >= C[t - 1];
        if (brk && ready) fired.add('p_ihs');
        if (brk || C[t] <= neck) pats.push({ type: 'inverse_head_shoulders', fa: 'سر و شانهٔ معکوس', bias: 'bullish', status: brk ? 'broken_today' : 'forming', points: [pt(A, Lo[A]), pt(B, Lo[B]), pt(Cc, Lo[Cc])], neckline: r0(neck), measured_target: r0(neck + (neck - Lo[B])) }); } }
    if (sh.length >= 2 && sl.length >= 2) { const [p1, p2] = sh.slice(-2), [q1, q2] = sl.slice(-2), h1 = H[p1], h2 = H[p2], l1 = Lo[q1], l2 = Lo[q2];
      const contracting = h2 <= h1 * 1.01 && l2 >= l1 * 0.99 && (h2 < h1 * 0.99 || l2 > l1 * 1.01) && (h2 - l2) < 0.8 * (h1 - l1);
      if (contracting && t - Math.max(p2, q2) <= 20) { const bu = C[t] > h2 && h2 >= C[t - 1], bd = C[t] < l2 && l2 <= C[t - 1];
        if (bu && ready) fired.add('p_tri_up'); if (bd && ready) fired.add('p_tri_dn');
        const kind = Math.abs(h2 / h1 - 1) < 0.01 ? 'ascending' : Math.abs(l2 / l1 - 1) < 0.01 ? 'descending' : 'symmetrical';
        pats.push({ type: 'triangle_' + kind, fa: kind === 'ascending' ? 'مثلث افزایشی' : kind === 'descending' ? 'مثلث کاهشی' : 'مثلث متقارن', bias: 'neutral',
          status: bu ? 'broken_up_today' : bd ? 'broken_down_today' : 'forming', upper_line: [pt(p1, h1), pt(p2, h2)], lower_line: [pt(q1, l1), pt(q2, l2)],
          breakout_up_above: r0(h2), breakdown_below: r0(l2), measured_target_up: r0(h2 + (h1 - l1)), measured_target_down: r0(l2 - (h1 - l1)) }); } }
    tk.chart_patterns = pats;
    tk.swings_recent = { highs: sh.map(i => pt(i, H[i])), lows: sl.map(i => pt(i, Lo[i])) };
    // ---- candlestick patterns (today)
    const body = i => Math.abs(C[i] - O[i]), rgI = i => H[i] - Lo[i], upS = i => H[i] - Math.max(O[i], C[i]), loS = i => Math.min(O[i], C[i]) - Lo[i];
    const cd = [];
    if (t - s0 >= 25 && rgI(t) > 0) {
      let ab = 0; for (let i = t - 19; i <= t; i++) ab += body(i); ab /= 20;
      const r5p = C[t - 1] / C[t - 6] - 1;
      if (body(t) <= 0.1 * rgI(t)) cd.push('c_doji');
      if (body(t) > 0 && loS(t) >= 2 * body(t) && upS(t) <= 0.25 * rgI(t) && r5p < -0.03) cd.push('c_hammer');
      if (body(t) > 0 && upS(t) >= 2 * body(t) && loS(t) <= 0.25 * rgI(t) && r5p > 0.03) cd.push('c_star');
      if (C[t - 1] < O[t - 1] && C[t] > O[t] && O[t] <= C[t - 1] && C[t] >= O[t - 1] && r5p < 0) cd.push('c_bull_eng');
      if (C[t - 1] > O[t - 1] && C[t] < O[t] && O[t] >= C[t - 1] && C[t] <= O[t - 1] && r5p > 0) cd.push('c_bear_eng');
      if (C[t - 2] < O[t - 2] && body(t - 2) >= 1.2 * ab && body(t - 1) <= 0.3 * body(t - 2) && C[t] > O[t] && C[t] > (O[t - 2] + C[t - 2]) / 2) cd.push('c_morning');
      if (C[t - 2] > O[t - 2] && body(t - 2) >= 1.2 * ab && body(t - 1) <= 0.3 * body(t - 2) && C[t] < O[t] && C[t] < (O[t - 2] + C[t - 2]) / 2) cd.push('c_evening');
      if (ready) cd.forEach(k => fired.add(k));
    }
    tk.candles_today = cd.map(k => LBL[k]);
    tk.candle_note = 'کندل‌ها با قیمت پایانی (میانگین وزنی) رسم می‌شوند، نه آخرین معامله؛ دامنهٔ نوسان ±۳٪ بدنه‌ها را کوتاه می‌کند.';
    tk.signals_today = [...fired].map(k => ({ key: k, fa: LBL[k], n: TT[k][0], edge_5d_pp: TT[k][1], edge_20d_pp: TT[k][2], eras_same_sign_of_5: TT[k][3] }));
    tk.backtest_note = 'لبه = فاصلهٔ احتمال رشد از میانگین گروه در همان روز (واحد درصد)، ۱۳۹۲ تا ۱۴۰۵، گروه ۴۴. هیچ ابزار کلاسیکی لبهٔ پایدار بیش از ±۳ واحد نداشت؛ جهت را از امتیاز v2 بگیر.';
    out.technical = tk;
  }

  // ---------- 5) order book
  const Bk = bl?.bestLimits || [], top = Bk[0] || {};
  const pMax = I.staticThreshold?.psGelStaMax, pMin = I.staticThreshold?.psGelStaMin;
  let queue = 'none';
  if (top.qTitMeDem > 0 && !top.qTitMeOf && pMax && top.pMeDem >= pMax) queue = 'buy_queue';
  if (top.qTitMeOf > 0 && !top.qTitMeDem && pMin && top.pMeOf <= pMin) queue = 'sell_queue';
  out.order_book = { queue, top5: Bk.slice(0, 5).map(b => [b.zOrdMeDem, b.qTitMeDem, b.pMeDem, b.pMeOf, b.qTitMeOf, b.zOrdMeOf]),
    queue_value_billion_toman: R((queue === 'buy_queue' ? top.qTitMeDem * top.pMeDem : queue === 'sell_queue' ? top.qTitMeOf * top.pMeOf : 0) / 1e10, 1),
    note: 'ستون‌ها: تعداد خریدار، حجم خرید، قیمت خرید، قیمت فروش، حجم فروش، تعداد فروشنده' };

  // ---------- 6) flows (individual / institutional)
  const CT = {}; (cth?.clientType || []).forEach(r => CT[r.recDate] = r);
  if (ctToday?.clientType && (last.live || !CT[last.d])) { const q = ctToday.clientType, px = last.c; CT[last.d] = { buy_I_Value: q.buy_I_Volume * px, sell_I_Value: q.sell_I_Volume * px, buy_N_Value: q.buy_N_Volume * px, sell_N_Value: q.sell_N_Volume * px, buy_I_Count: q.buy_CountI, sell_I_Count: q.sell_CountI }; }
  const F = D.map(r => { const x = CT[r.d]; if (!x) return null; const bpc = x.buy_I_Value / Math.max(1, x.buy_I_Count), spc = x.sell_I_Value / Math.max(1, x.sell_I_Count);
    return { d: r.d, val: r.val, bpc, spc, power: bpc / spc, netI: x.buy_I_Value - x.sell_I_Value, nbuy: x.buy_N_Value, nsell: x.sell_N_Value, bc: x.buy_I_Count, sc: x.sell_I_Count }; });
  const fw = F.slice(-60).filter(Boolean), fl = F[t];
  const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const sumK = (k, f) => F.slice(-k).filter(Boolean).reduce((s, x) => s + f(x), 0);
  const newListing = ipoIdx >= 0 && hist <= 60;
  out.flows = fl ? {
    buyer_power_today: R(fl.power, 2), buyer_power_5d: R(sumK(5, x => x.bpc) / sumK(5, x => x.spc), 2),
    buyer_power_reliable: !newListing, per_capita_buy_toman: R(fl.bpc / 10, 0), per_capita_sell_toman: R(fl.spc / 10, 0),
    per_capita_buy_vs_60d_median: fw.length >= 20 ? R(fl.bpc / med(fw.map(x => x.bpc)), 2) : null,
    indiv_buyers: fl.bc, indiv_sellers: fl.sc,
    indiv_net_today_pct_of_value: R(fl.netI / fl.val, 3), indiv_net_5d_pct: R(sumK(5, x => x.netI) / sumK(5, x => x.val), 3), indiv_net_20d_pct: R(sumK(20, x => x.netI) / sumK(20, x => x.val), 3),
    indiv_net_today_billion_toman: R(fl.netI / 1e10, 1), inst_net_today_billion_toman: R((fl.nbuy - fl.nsell) / 1e10, 1), inst_buy_share: R(fl.nbuy / fl.val, 2), inst_sell_share: R(fl.nsell / fl.val, 2),
    last10: F.slice(-10).filter(Boolean).map(x => [x.d, R(x.power, 2), R(x.netI / 1e10, 1), R((x.nbuy - x.nsell) / 1e10, 1)]),
    note: newListing ? 'سهم تازه‌عرضه است: قدرت خریدار و سرانه‌ها به‌خاطر سهمیهٔ کوچک عرضهٔ اولیه گمراه‌کننده‌اند' : ''
  } : null;

  // ---------- 7) IPO / new listing block
  if (ipoIdx >= 0 && hist <= 120) {
    let k = ipoIdx + 1; while (k < n && lim(k)) k++;
    const streak = k - ipoIdx - 1, openIdx = k < n ? k : null;
    let fdIdx = null; if (openIdx !== null) for (let i = openIdx; i < n; i++) if (D[i].c < D[i].y) { fdIdx = i; break; }
    const phase = openIdx === null ? 'in_initial_queue_streak' : (fdIdx !== null && t - fdIdx <= 10) ? 'after_first_down_day' : (t - openIdx <= 5 ? 'first_open_days' : 'post_ipo');
    out.ipo = { ipo_date: D[ipoIdx].d, ipo_price: D[ipoIdx].c, trading_days_since_ipo: hist - 1, initial_queue_streak: streak,
      first_open_day: openIdx !== null ? D[openIdx].d : null, first_open_day_low: openIdx !== null ? R(Lo[openIdx], 0) : null, first_open_day_high: openIdx !== null ? R(H[openIdx], 0) : null,
      first_down_day: fdIdx !== null ? D[fdIdx].d : null, days_since_first_down: fdIdx !== null ? t - fdIdx : null,
      return_since_ipo: R(C[t] / (D[ipoIdx].c * fac[ipoIdx]) - 1, 3), phase,
      base_rates_192_ipos_1396_1405: {
        after_first_open_day: { up_1d: 0.29, up_5d: 0.38, up_20d: 0.44, median_5d_pct: -3.3, median_20d_pct: -3.8 },
        after_first_down_day: { up_1d: 0.23, up_3d: 0.26, up_5d: 0.33, up_20d: 0.42, median_5d_pct: -3.8, median_20d_pct: -6.1 },
        after_first_down_day_if_streak_ge_8: { n: 103, up_1d: 0.20, up_5d: 0.31, up_20d: 0.39, median_20d_pct: -10.2 },
        first_down_day_with_institutional_net_buy_gt_20pct: { n: 59, up_1d: 0.24, up_5d: 0.31, up_20d: 0.47 },
        by_era_after_first_down_up_1d: { '1396-98': 0.23, '1399-1400': 0.10, '1401-02': 0.31, '1403-05': 0.30 },
        sixty_days_after_first_open: { share_positive: 0.53, median_pct: 3.4 } } };
  }

  // ---------- 8) major holders (>1%)
  const cls = nm => /^شخص حقيقي/.test(nm) ? 'individual' : /BFM|بازارگرداني/.test(nm) ? 'market_maker' : /^PRX|سبد/.test(nm) ? 'portfolio' : /صندوق.*(بازنشستگي|بيمه اجتماعي)/.test(nm) ? 'pension' : /صندوق/.test(nm) ? 'fund' : /بيمه/.test(nm) ? 'insurance' : /بانك/.test(nm) ? 'bank' : /واسط مالي/.test(nm) ? 'sukuk_spv' : /تامين|شستا|صبا|آتيه/.test(nm) ? 'strategic_social_security' : /پتروشيمي|نفت|گاز|پالايش/.test(nm) ? 'strategic_parent_or_peer' : /سرمايه گذاري|گروه|توسعه/.test(nm) ? 'investment_co' : 'other';
  const hd = [];
  for (const r of D.slice(-6)) { const j = await J(`Shareholder/${ic}/${r.d}`, 2, 10000); const rows = j?.shareShareholder || []; const des = [...new Set(rows.map(x => x.dEven))].sort(); if (des.length < 2) continue;
    const cur = {}, prev = {}; rows.forEach(x => { const T = x.dEven === des[des.length - 1] ? cur : prev; T[x.shareHolderName] = (T[x.shareHolderName] || 0) + x.numberOfShares; });
    for (const nm of new Set([...Object.keys(cur), ...Object.keys(prev)])) { const dsh = (cur[nm] || 0) - (prev[nm] || 0); if (Math.abs(dsh) < 1) continue;
      hd.push({ date: r.d, holder: nm, type: cls(nm), delta_shares: dsh, value_billion_toman: R(dsh * r.c / 1e10, 2), now_pct: I.zTitad ? R(100 * (cur[nm] || 0) / I.zTitad, 3) : null, new_above_1pct: !(nm in prev), dropped_below_1pct: !(nm in cur) }); } }
  const lastHold = await J(`Shareholder/GetInstrumentShareHolderLast/${ic}`, 2);
  out.holders = { top: (lastHold?.shareHolder || []).slice(0, 8).map(x => [x.shareHolderName, R(x.perOfShares, 2), cls(x.shareHolderName)]), changes_6d: hd };

  // ---------- 9) the symbol's own group (sector code from InstrumentInfo, e.g. 44 = chemicals, 23 = refineries):
  //               breadth, flows EXCLUDING this symbol, group index (found by name "<code>-...") + total index, live append
  const SEC = String(I.sector?.cSecVal || '').trim() || '44';
  const mw = await J('ClosingPrice/GetMarketWatch?market=0&paperTypes[0]=1&paperTypes[1]=2&showTraded=false&withBestLimits=true');
  const G = (mw?.marketwatch || []).filter(x => (x.csv || '').trim() === SEC && (x.flow == null || [1, 2, 4].includes(x.flow)) && !/\d$/.test(x.lva) && x.qtc > 0);
  const cta = await J('ClientType/GetClientTypeAll'); const CTA = {}; (cta?.clientTypeAllDto || []).forEach(x => CTA[x.insCode] = x);
  let netI = 0, tv = 0, selfNet = 0, selfVal = 0;
  G.forEach(x => { const c = CTA[x.insCode]; if (!c) return; const nI = (c.buy_I_Volume - c.sell_I_Volume) * x.pcl; if (x.insCode === ic) { selfNet = nI; selfVal = x.qtc; } else { netI += nI; tv += x.qtc; } });
  const qb = G.filter(x => x.pdv >= x.pMax && x.blDs?.[0]?.qmo === 0).length, qsl = G.filter(x => x.pdv <= x.pMin && x.blDs?.[0]?.qmd === 0).length;
  const ixLive = await J('Index/GetIndexB1LastAll/All/1');
  const liveList = ixLive?.indexB1 || Object.values(ixLive || {})[0] || [];
  const secIdx = liveList.find(x => String(x.lVal30 || '').trim().startsWith(SEC + '-'));
  const GI = secIdx ? String(secIdx.insCode) : '33626672012415176';
  if (!secIdx && SEC !== '44') out.warnings.push(`شاخص گروه ${SEC} پیدا نشد؛ شاخص ۴۴ به‌جای آن استفاده شد`);
  const [ixG, ixT] = await Promise.all([J('Index/GetIndexB2History/' + GI), J('Index/GetIndexB2History/32097828799138957')]);
  const liveIdx = {}; liveList.forEach(x => liveIdx[x.insCode] = x.xDrNivJIdx004);
  const idx = (h, code) => { const rows = (h?.indexB2 || []).sort((x, y) => x.dEven - y.dEven); const a = rows.map(x => x.xNivInuClMresIbs); let appended = false;
    if (last.d > (rows[rows.length - 1]?.dEven || 0) && liveIdx[code]) { a.push(liveIdx[code]); appended = true; }
    const k = a.length - 1; const m50 = a.slice(k - 49, k + 1).reduce((s, x) => s + x, 0) / 50; return { level: a[k], r1: R(a[k] / a[k - 1] - 1), r5: R(a[k] / a[k - 5] - 1), r20: R(a[k] / a[k - 20] - 1), above_sma50: a[k] > m50, live_appended: appended }; };
  const cG = idx(ixG, GI);
  const regime = cG.r20 > 0.10 ? 'hot' : cG.r20 < -0.05 ? 'cold' : 'mid';
  out.group = { sector_code: SEC, sector_name: I.sector?.lSecVal || null, group_index_name: secIdx?.lVal30 || '44-شيميايي',
    n_traded: G.length, pct_up: R(G.filter(x => x.pdv > x.py).length / G.length, 2), buy_queues: qb, sell_queues: qsl,
    avg_change_pct: R(100 * G.reduce((s, x) => s + (x.pcl / x.py - 1), 0) / G.length, 2),
    indiv_net_flow_pct_of_value_ex_self: R(netI / tv, 3), indiv_net_flow_billion_toman_ex_self: R(netI / 1e10, 1),
    this_symbol_share_of_group_value: R(selfVal / (tv + selfVal), 3), this_symbol_indiv_net_billion_toman: R(selfNet / 1e10, 1),
    group_index: cG, chem44_index: SEC === '44' ? cG : null, total_index: idx(ixT, '32097828799138957'), regime,
    regime_rule: 'hot = شاخص همین گروه در ۲۰ روز بیش از +۱۰٪؛ cold = کمتر از −۵٪؛ بقیه mid' };
  if (SEC !== '44') out.warnings.push(`نماد در گروه ${SEC} (${I.sector?.lSecVal || ''}) است، نه گروه ۴۴: جدول کالیبراسیون روی گروه ۴۴ برآورد شده و برای این نماد آزموده نشده (اطمینان پایین)`);

  // ---------- 10) today's intraday (5-minute bars) — with timeout, optional
  const tr = await J(`Trade/GetTrade/${ic}`, 2, 12000); const T5 = {};
  if (!tr) out.warnings.push('دادهٔ معاملات درون‌روز امروز نیامد (timeout)');
  (tr?.trade || []).filter(x => !x.canceled).sort((a, b) => a.nTran - b.nTran).forEach(x => { const s = Math.floor(x.hEven / 10000) * 60 + Math.floor(x.hEven / 100 % 100); const k = Math.max(0, Math.floor((s - 540) / 5)); const b = T5[k] ||= { o: x.pTran, h: x.pTran, l: x.pTran, c: x.pTran, v: 0, val: 0 }; b.h = Math.max(b.h, x.pTran); b.l = Math.min(b.l, x.pTran); b.c = x.pTran; b.v += x.qTitTran; b.val += x.qTitTran * x.pTran; });
  const ks = Object.keys(T5).map(Number).sort((a, b) => a - b); const hm = k => `${String(9 + Math.floor(k * 5 / 60)).padStart(2, '0')}:${String(k * 5 % 60).padStart(2, '0')}`;
  if (ks.length) { const vw = ks.reduce((s, k) => s + T5[k].val, 0) / ks.reduce((s, k) => s + T5[k].v, 0); const lastP = T5[ks[ks.length - 1]].c;
    const pAt = m => { const k = ks.filter(k => k < m / 5); return k.length ? T5[k[k.length - 1]].c : null; };
    out.intraday_today = { first_trade_time: hm(ks[0]), open: T5[ks[0]].o, last: lastP, vwap: R(vw, 0), last_vs_vwap_pct: R(100 * (lastP / vw - 1), 2),
      ret_first30m_pct: pAt(30) ? R(100 * (pAt(30) / T5[ks[0]].o - 1), 2) : null, ret_last30m_pct: pAt(180) ? R(100 * (lastP / pAt(180) - 1), 2) : null,
      bars_5m: ks.slice(-12).map(k => [hm(k), T5[k].o, T5[k].h, T5[k].l, T5[k].c, T5[k].v]) }; }

  // ---------- 11) rubric (v1 points; indicator rows only when history allows) + regime calibration
  const f = out.flows || {}, d = ind, P = {};
  // v2 points: re-estimated on 1392-1405 (13 years, 62 group-44 stocks); rows without a stable effect were removed
  const pw = f.buyer_power_reliable ? f.buyer_power_today : null;
  const smart = f.per_capita_buy_vs_60d_median > 2 && pw > 1.5;
  P.smart_retail_money = smart ? 2 : 0;
  P.buyer_power_gt2 = (!smart && pw > 2) ? 1 : 0;
  P.buyer_power_lt05 = (pw !== null && pw < 0.5) ? -1 : 0;
  P.buy_queue_close = d.closed_at_upper_limit ? 2 : 0;
  P.sell_queue_close = d.closed_at_lower_limit ? -2 : 0;
  P.strong_finish = d.last_minus_close_pct > 1 ? 2 : 0;
  P.weak_finish = d.last_minus_close_pct < -1 ? -2 : 0;
  P.rsi_below_30 = (d.rsi14 !== null && d.rsi14 < 30) ? -2 : 0;
  P.above_upper_bollinger = (d.bollinger_pctb !== null && d.bollinger_pctb > 1) ? 1 : 0;
  const sub = Object.values(P).reduce((s, x) => s + x, 0);
  // context only (no points: unstable or not significant over 13 years)
  const strat = ['strategic_social_security', 'strategic_parent_or_peer', 'pension', 'investment_co'];
  const context = { indiv_outflow_5d_gt10pct: f.indiv_net_5d_pct < -0.10, indiv_inflow_today_gt20pct: f.indiv_net_today_pct_of_value > 0.20,
    new_20d_low: !!(d.donchian20_low && C[t] < d.donchian20_low), new_20d_high_with_volume: !!(d.donchian20_high && C[t] > d.donchian20_high && d.vol_ratio_20 > 1.5),
    adx_downtrend: d.adx14 !== null && d.adx14 > 25 && d.minus_di > d.plus_di, group_flow_ex_self: out.group.indiv_net_flow_pct_of_value_ex_self,
    strategic_holder_buy_5d: hd.some(x => strat.includes(x.type) && x.delta_shares > 0 && Math.abs(x.value_billion_toman) >= 1),
    strategic_holder_sell_5d: hd.some(x => strat.includes(x.type) && x.delta_shares < 0 && Math.abs(x.value_billion_toman) >= 1),
    close_above_last_swing_high: out.chart.close_above_last_swing_high, close_below_last_swing_low: out.chart.close_below_last_swing_low };
  // calibration 1392-1405, tradable days only: [n, P(up 1d), P(up 3d), P(up 5d), P(up 10d), median 5d %, avg gain 5d %, avg loss 5d %]
  const CAL = { hot: { '<=-4': [30, .10, .23, .20, .27, -3.3, 3.4, -5.6], '-3..-2': [2575, .25, .52, .55, .58, 0.8, 6.7, -4.8], '-1..+1': [9398, .51, .54, .57, .61, 1.0, 6.4, -4.2], '+2..+3': [2332, .76, .56, .57, .60, 1.1, 7.0, -4.5], '>=+4': [141, .87, .72, .74, .78, 4.4, 10.1, -3.5], ALL: [14476, .50, .54, .57, .61, 1.0, 6.6, -4.4] },
    mid: { '<=-4': [1313, .11, .26, .31, .40, -0.6, 3.3, -2.3], '-3..-2': [9771, .23, .38, .41, .45, -0.5, 5.6, -3.0], '-1..+1': [29601, .44, .46, .48, .50, -0.1, 5.8, -3.1], '+2..+3': [5726, .73, .54, .54, .54, 0.3, 9.9, -3.3], '>=+4': [441, .81, .60, .58, .58, 0.5, 5.2, -3.1], ALL: [46852, .43, .45, .47, .49, -0.2, 6.3, -3.0] },
    cold: { '<=-4': [535, .18, .36, .38, .46, -0.6, 4.1, -2.5], '-3..-2': [2789, .31, .42, .43, .48, -0.5, 4.6, -3.4], '-1..+1': [5497, .49, .46, .47, .49, -0.2, 5.2, -4.0], '+2..+3': [1177, .76, .49, .50, .49, 0.0, 5.9, -4.4], '>=+4': [65, .77, .62, .57, .54, 1.9, 7.2, -4.9], ALL: [10063, .45, .45, .46, .48, -0.3, 5.1, -3.8] } };
  const band = s => s <= -4 ? '<=-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : '>=+4';
  const cal = CAL[regime][band(sub)], base = CAL[regime].ALL;
  const newIPO = ipoIdx >= 0 && hist <= 120;
  out.rubric = { version: 2, points: P, subtotal_without_codal: sub, band_without_codal: band(sub), regime, context,
    calibration_for_this_band: { n: cal[0], p_up_1d: cal[1], p_up_3d: cal[2], p_up_5d: cal[3], p_up_10d: cal[4], median_5d_pct: cal[5], avg_gain_5d_pct: cal[6], avg_loss_5d_pct: cal[7] },
    base_rate_this_regime: { p_up_1d: base[1], p_up_5d: base[3], median_5d_pct: base[5] },
    edge_vs_base_5d_pp: Math.round(100 * (cal[3] - base[3])),
    applicable: !newIPO, calibrated_on_group: '44', calibration_applies_to_this_group: SEC === '44',
    note: newIPO ? 'سهم تازه‌عرضه است: جدول کالیبراسیون قابل‌اتکا نیست؛ از بلوک ipo استفاده کن' : 'امتیاز کدال را اضافه کن و باند را دوباره تعیین کن؛ لبه = اختلاف با نرخ پایهٔ همین رژیم',
    tradability: d.closed_at_upper_limit ? 'در صف خرید بسته شده — خرید عملاً ممکن نیست' : d.closed_at_lower_limit ? 'در صف فروش بسته شده — فروش عملاً ممکن نیست' : 'قابل معامله' };
  return out;
}

/* ------------------------------------------------------------------------
   B) petroEvaluate(logs): logs = [{date:'1405/07/04', symbol:'تابان', decision:'NO_BUY_REDUCE', ref_price:19990}, ...]
   (date = day the call was made, ref_price = that day's closing price). Run on tsetmc.com.
   Returns realised moves after 1, 3, 5, 10, 20 trading days and whether the call direction was right. */
async function petroEvaluate(logs) {
  const BASE = 'https://cdn.tsetmc.com/api/';
  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').trim();
  const g2j = d => { const s = String(d); const dt = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\d/]/g, ''); };
  const res = [];
  for (const L of logs) {
    const s = await (await fetch(BASE + 'Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(L.symbol)))).json();
    const ins = (s.instrumentSearch || []).find(x => ar(x.lVal18AFC) === ar(L.symbol) && [1, 2, 4].includes(x.flow)); if (!ins) { res.push({ ...L, error: 'not found' }); continue; }
    const d = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceDailyList/${ins.insCode}/120`)).json()).closingPriceDaily.filter(r => r.qTotTran5J > 0).sort((a, b) => a.dEven - b.dEven);
    const lv = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceInfo/${ins.insCode}`)).json()).closingPriceInfo || {};   // today's row is not in the history until the evening
    if (lv.finalLastDate > (d[d.length - 1]?.dEven || 0) && lv.qTotTran5J > 0) d.push({ dEven: lv.finalLastDate, pClosing: lv.pClosing, priceYesterday: lv.priceYesterday, qTotTran5J: lv.qTotTran5J });
    const i0 = d.findIndex(r => g2j(r.dEven) === L.date); if (i0 < 0) { res.push({ ...L, error: 'date not found' }); continue; }
    const fac = []; let f = 1; for (let i = d.length - 1; i >= i0; i--) { fac[i] = f; if (i > i0) { let q = d[i].priceYesterday / d[i - 1].pClosing; if (q > 0.995 && q < 1.005) q = 1; f *= q; } }
    const out = { ...L, trading_days_since: d.length - 1 - i0 };
    for (const k of [1, 3, 5, 10, 20]) { const j = i0 + k; if (j < d.length) out[`ret_${k}d_pct`] = Math.round(10000 * (d[j].pClosing * fac[j] / (d[i0].pClosing * fac[i0]) - 1)) / 100; }
    const bull = /BUY/.test(L.decision) && !/NO_BUY/.test(L.decision), bear = /SELL|REDUCE|NO_BUY/.test(L.decision);
    for (const k of [1, 5, 20]) if (out[`ret_${k}d_pct`] !== undefined) out[`right_${k}d`] = bull ? out[`ret_${k}d_pct`] > 0 : bear ? out[`ret_${k}d_pct`] <= 0 : null;
    res.push(out);
  }
  return res;
}

/* ------------------------------------------------------------------------ */
async function codalSnapshot(symbol, days = 120) {
  const fa = s => (s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const jal = dt => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\d/]/g, '');
  const toDig = s => (s || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
  const q = (sym, from, to, page) => 'https://search.codal.ir/api/search/v2/q?&Audit=true&AuditorRef=-1&Category=-1&Childs=true&CompanyState=-1&CompanyType=-1&Consolidatable=true&IsNotAudited=false&Length=-1&LetterType=-1&Mains=true&NotAudited=true&NotConsolidatable=true&Publisher=false&TracingNo=-1&search=true&PageNumber=' + page + '&Symbol=' + encodeURIComponent(sym) + '&FromDate=' + encodeURIComponent(from) + '&ToDate=' + encodeURIComponent(to);
  // search.codal.ir rate-limits bursts (HTTP 429): back off and space the calls
  const J = async u => { for (let i = 0; i < 5; i++) { const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 20000);
      try { const r = await fetch(u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); if (r.status === 429) { await sleep(4000 * 2 ** i); continue; } } catch (e) { clearTimeout(tm); } await sleep(1500 * (i + 1)); } return null; };
  const classify = t => {
    if (/افشای اطلاعات/.test(t)) { const m = t.match(/\((.*)\)\s*منتهی/); const x = m ? m[1] : t;
      if (/دیوان|دادنامه|شورای رقابت|ابطال مصوب|ماده ۹۱/.test(x)) return 'REGULATORY_COURT';
      if (/سرویس/.test(x)) return 'UTILITY_RATES';
      if (/گاز|خوراک|مواد اولیه|بهای تمام شده/.test(x)) return 'FEED_GAS_PRICE';
      if (/توقف|تعمیرات|قطع|محدودیت/.test(x)) return 'SHUTDOWN';
      if (/شروع مجدد|راه.?اندازی مجدد|آغاز فرآیند تولید|بهره.?برداری/.test(x)) return 'RESTART';
      if (/قرارداد|مزایده|مناقصه/.test(x)) return 'CONTRACT';
      if (/دعوی|دادگاه/.test(x)) return 'LEGAL';
      return 'MATERIAL_OTHER'; }
    const rules = [['MONTHLY', /گزارش فعالیت ماهانه/], ['PORTFOLIO_NAV', /صورت وضعیت پورتفوی/], ['FS_EXPLAIN', /توضیحات در خصوص اطلاعات و صورت/], ['INTERIM_FS', /میاندوره/], ['ANNUAL_FS', /^صورت.?های مالی/],
      ['AGM_DECISION', /تصمیمات مجمع عمومی عادی سالیانه/], ['AGM_NOTICE', /دعوت به مجمع عمومی عادی سالیانه/], ['DIV_SCHEDULE', /زمانبندی پرداخت سود/],
      ['CAPINC_PROPOSAL', /پیشنهاد هیئت مدیره.*افزایش سرمایه/], ['CAPINC_STEP', /افزایش سرمایه/], ['EGM', /مجمع عمومی فوق العاده/], ['RUMOR_CLARIFY', /شفاف سازی در خصوص شایعه/],
      ['BOARD_CEO_CHANGE', /هیئت مدیره.*مدیر عامل|مدیر عامل/], ['HALT', /تعلیق نماد|توقف نماد/]];
    for (const [k, rx] of rules) if (rx.test(t)) return k; return 'OTHER'; };
  const now = new Date(), from = jal(new Date(now - days * 864e5)), to = jal(now);
  const letters = []; const first = await J(q(fa(symbol), from, to, 1));
  if (!first) return { symbol, error: 'جست‌وجوی کدال پاسخ نداد (احتمالاً 429)؛ یک دقیقه بعد دوباره اجرا کن. نتیجهٔ خالی را «بدون اطلاعیه» تفسیر نکن' };
  letters.push(...(first?.Letters || []));
  for (let p = 2; p <= (first?.Page || 1); p++) { await sleep(500); const j = await J(q(fa(symbol), from, to, p)); letters.push(...(j?.Letters || [])); }
  const L = letters.map(x => ({ type: classify(x.Title), title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url, tracing: x.TracingNo }));
  const monthly = [];
  for (const m of L.filter(x => x.type === 'MONTHLY' && !/اصلاحیه/.test(x.title)).slice(0, 3)) {
    try { const h = await (await fetch(m.url)).text(); const s = h.match(/var datasource = (\{.*?\});\s*\n/s); if (!s) continue; const ds = JSON.parse(s[1]);
      for (const sh of ds.sheets || []) for (const tb of sh.tables || []) { if (!/ProductionAndSales|Sales/i.test(tb.aliasName || '')) continue;
        const tot = Math.max(...tb.cells.filter(c => (c.value || '').trim() === 'جمع').map(c => c.rowSequence)); if (!isFinite(tot)) continue;
        const row = {}; tb.cells.filter(c => c.rowSequence === tot).forEach(c => row[c.columnSequence] = c.value);
        const sub = {}; tb.cells.filter(c => c.rowSequence === 2).forEach(c => sub[c.columnSequence] = c.value || '');
        const groups = tb.cells.filter(c => c.rowSequence === 1).map(c => { let amt = null; for (let k = c.columnSequence; k < c.columnSequence + (c.colSpan || 1); k++) if (/مبلغ/.test(sub[k] || '')) amt = k; return [c.value, amt ? Number(String(row[amt] || '').replace(/,/g, '')) : null]; }).filter(g => g[1] !== null);
        monthly.push({ period: ds.periodEndToDate, published: m.published, groups_million_rial: groups }); break; } } catch (e) {} }
  const REFINERY = ['شپنا', 'شتران', 'شبندر', 'شبریز', 'شسپا', 'شراز', 'شاوان', 'شرانل', 'شنفت', 'شپاس', 'شبهرن'];
  const PETRO = ['فارس', 'شپدیس', 'نوری', 'جم', 'پارس', 'تاپیکو', 'پترول', 'شیراز', 'زاگرس', 'مارون', 'آریا', 'شگویا', 'بوعلی', 'کرماشا'];
  const peers = (REFINERY.includes(fa(symbol)) ? REFINERY : PETRO).filter(p => p !== fa(symbol));
  const f10 = jal(new Date(now - 10 * 864e5)); const sector = [];
  for (const p of peers) { await sleep(700); const j = await J(q(p, f10, to, 1)); (j?.Letters || []).forEach(x => { const ty = classify(x.Title); if (['REGULATORY_COURT', 'UTILITY_RATES', 'FEED_GAS_PRICE', 'SHUTDOWN', 'RESTART', 'HALT'].includes(ty)) sector.push({ symbol: x.Symbol, type: ty, title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url }); }); }
  const recent = t => L.filter(x => x.type === t).slice(0, 1).map(x => x.published)[0] || null;
  return { symbol, window_days: days, n_letters: L.length, letters: L.slice(0, 40), monthly_sales: monthly, sector_regulatory_10d: sector,
    last_seen: { AGM_DECISION: recent('AGM_DECISION'), BOARD_CEO_CHANGE: recent('BOARD_CEO_CHANGE'), SHUTDOWN: recent('SHUTDOWN'), RUMOR_CLARIFY: recent('RUMOR_CLARIFY'), HALT: recent('HALT'), REGULATORY_COURT: recent('REGULATORY_COURT'), UTILITY_RATES: recent('UTILITY_RATES'), FEED_GAS_PRICE: recent('FEED_GAS_PRICE'), CAPINC_PROPOSAL: recent('CAPINC_PROPOSAL'), PORTFOLIO_NAV: recent('PORTFOLIO_NAV') } };
}

/* ------------------------------------------------------------------------
   D) codalLetterText(url): material-disclosure forms keep text in `clientDataSource`, structured
   reports in `datasource`; AGM decisions and many others are server-rendered HTML (read the DOM).
   PDF attachments are not parsed: if the key numbers are in the attachment, say so. */
async function codalLetterText(url) {
  const h = await (await fetch(url)).text();
  const m = h.match(/var (?:clientDataSource|datasource) = (\{.*?\});\s*\n/s);
  let text = null;
  if (m) { const texts = []; const walk = o => { if (typeof o === 'string') { const x = o.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); if (x.length > 3 && /[؀-ۿ]/.test(x)) texts.push(x); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
    walk(JSON.parse(m[1])); text = [...new Set(texts)].join(' | '); }
  if (!text || text.length < 80) { const doc = new DOMParser().parseFromString(h, 'text/html'); doc.querySelectorAll('script,style').forEach(e => e.remove());
    const t2 = (doc.body?.innerText || doc.body?.textContent || '').replace(/\{\{[^}]*\}\}/g, ' ').replace(/\s+/g, ' ').trim(); if (t2.length > (text || '').length) text = t2; }
  return { url, has_attachment: /Attachment\.aspx/.test(h), text: (text || '').slice(0, 8000) || null };
}

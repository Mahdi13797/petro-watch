/* ==========================================================================
   chart.js — نمودار تکنیکال «دیدبان پتروشیمی» (SVG، بدون کتابخانهٔ بیرونی)
   Draws from petroSnapshot().technical: candles + volume, MA 20/50/200 (weekly 10/30), Bollinger, Ichimoku,
   Fibonacci (retracement + extension), pivots, support/resistance, 60-day trend channel, chart patterns, swings,
   RSI divergence, the simple trade plan, RSI and MACD panes; daily / weekly; hover crosshair; PNG export.
   Needs: nothing global. API: PWChart.html(), PWChart.mount(root, bundle, { plan, store, toast })
   ========================================================================== */
const PWChart = (() => {
  const LAYERS = [
    ['ma', 'میانگین‌ها', ['--c-ma1', '--c-ma2', '--c-ma3']], ['bb', 'Bollinger', ['--c-band']], ['ichi', 'ایچیموکو', ['--c-tenkan', '--c-kijun']],
    ['fib', 'فیبوناچی', ['--c-fib']], ['piv', 'پیوت', ['--muted']], ['lv', 'حمایت و مقاومت', ['--text']], ['ch', 'کانال روند', ['--accent']],
    ['pat', 'الگو، چرخش و واگرایی', ['--text']], ['plan', 'برنامهٔ معامله', ['--accent', '--neg', '--pos']],
    ['vol', 'حجم', ['--c-band']], ['rsi', 'RSI', ['--c-ma1']], ['macd', 'MACD', ['--c-ma1', '--c-ma2']]];
  const DEF = { tf: 'D', range: 1, layers: ['ma', 'fib', 'lv', 'pat', 'plan', 'vol', 'rsi'] };
  const RANGES = { D: [[63, '۳ ماه'], [126, '۶ ماه'], [250, '۱ سال']], W: [[26, '۶ ماه'], [52, '۱ سال'], [104, '۲ سال']] };
  const REG = new WeakMap(), WIRED = new WeakSet();
  const isNum = x => typeof x === 'number' && isFinite(x);
  const nf = (x, d = 0) => isNum(x) ? x.toLocaleString('fa-IR', { maximumFractionDigits: d }) : '—';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dEvDate = dEv => { const s = String(dEv); return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), 12); };
  const jFull = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dEvDate(dEv));
  const jMonth = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { month: 'numeric' }).format(dEvDate(dEv));
  const jMonthName = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(dEvDate(dEv));
  const jYear = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: '2-digit' }).format(dEvDate(dEv));

  // ------------------------------------------------------------ indicators (same definitions as the collector)
  const smaA = (a, k) => a.map((_, i) => i + 1 < k ? null : a.slice(i + 1 - k, i + 1).reduce((s, x) => s + x, 0) / k);
  const emaA = (a, k) => { const e = [], al = 2 / (k + 1); a.forEach((x, i) => e.push(i ? al * x + (1 - al) * e[i - 1] : x)); return e; };
  const wilderA = (a, k) => { const e = []; a.forEach((x, i) => e.push(i ? e[i - 1] + (x - e[i - 1]) / k : x)); return e; };
  function indicators(B, tf) {
    const C = B.map(b => b[4]), H = B.map(b => b[2]), Lw = B.map(b => b[3]);
    const [k1, k2, k3] = tf === 'W' ? [10, 30, null] : [20, 50, 200];
    const m1 = smaA(C, k1), m2 = smaA(C, k2), m3 = k3 ? smaA(C, k3) : null;
    const s20 = smaA(C, 20), bbU = [], bbL = [];
    C.forEach((_, i) => { if (s20[i] === null) { bbU.push(null); bbL.push(null); return; } let v = 0; for (let j = i - 19; j <= i; j++) v += (C[j] - s20[i]) ** 2; const sd = Math.sqrt(v / 20); bbU.push(s20[i] + 2 * sd); bbL.push(s20[i] - 2 * sd); });
    const up = C.map((x, i) => i ? Math.max(0, x - C[i - 1]) : 0), dn = C.map((x, i) => i ? Math.max(0, C[i - 1] - x) : 0);
    const au = wilderA(up, 14), ad = wilderA(dn, 14), rsi = au.map((u, i) => i < 15 ? null : 100 - 100 / (1 + u / (ad[i] || 1e-9)));
    const e12 = emaA(C, 12), e26 = emaA(C, 26), macd = e12.map((x, i) => x - e26[i]), sig = emaA(macd, 9);
    const hh = (k, i) => { if (i + 1 < k) return null; let m = -Infinity; for (let j = i - k + 1; j <= i; j++) m = Math.max(m, H[j]); return m; };
    const ll = (k, i) => { if (i + 1 < k) return null; let m = Infinity; for (let j = i - k + 1; j <= i; j++) m = Math.min(m, Lw[j]); return m; };
    const ten = C.map((_, i) => hh(9, i) === null ? null : (hh(9, i) + ll(9, i)) / 2), kij = C.map((_, i) => hh(26, i) === null ? null : (hh(26, i) + ll(26, i)) / 2);
    const spA = C.map((_, i) => ten[i] === null || kij[i] === null ? null : (ten[i] + kij[i]) / 2), spB = C.map((_, i) => hh(52, i) === null ? null : (hh(52, i) + ll(52, i)) / 2);
    return { m1, m2, m3, k1, k2, k3, bbU, bbL, bbM: s20, rsi, macd: C.map((_, i) => i < 34 ? null : macd[i]), sig: C.map((_, i) => i < 34 ? null : sig[i]), ten, kij, spA, spB };
  }

  // ------------------------------------------------------------ static shell (controls + drawing box)
  function html(opts = {}) {
    return `<div class="tcw" data-tchart>
      <div class="tc-ctl"><div class="seg" role="group" aria-label="بازهٔ زمانی"><button data-ch="tf" data-v="D">روزانه</button><button data-ch="tf" data-v="W">هفتگی</button></div>
        <div class="seg" role="group" aria-label="طول نمودار" data-el="ranges"></div>
        <span class="grow"></span>${opts.exportButtons === false ? '' : '<button class="btn sm" data-ch="png">دانلود تصویر</button><button class="btn sm" data-ch="copyimg">کپی تصویر</button>'}</div>
      <div class="tc-layers" role="group" aria-label="لایه‌ها">${LAYERS.map(([k, lbl, cs]) => `<button class="lchip" data-ch="layer" data-v="${k}" aria-pressed="false">${cs.map(c => `<i style="background:var(${c})"></i>`).join('')}${lbl}</button>`).join('')}</div>
      <div class="tc-svg" dir="ltr"></div><div class="tc-tip" hidden></div>
      <p class="muted small tc-note" data-el="note"></p></div>`;
  }

  // ------------------------------------------------------------ drawing
  function draw(box) {
    const ctx = REG.get(box); if (!ctx) return;
    const st = { ...DEF, ...(ctx.store ? ctx.store.get('chart', {}) : {}) };
    const L = new Set(st.layers), tf = st.tf === 'W' ? 'W' : 'D';
    box.querySelectorAll('[data-ch="tf"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === tf)));
    box.querySelectorAll('[data-ch="layer"]').forEach(x => x.setAttribute('aria-pressed', String(L.has(x.dataset.v))));
    const rg = box.querySelector('[data-el="ranges"]');
    rg.innerHTML = RANGES[tf].map(([, lbl], k) => `<button data-ch="range" data-v="${k}" aria-pressed="${k === st.range}">${lbl}</button>`).join('');
    const holder = box.querySelector('.tc-svg');
    const t = ctx.b && ctx.b.tsetmc, tk = t && !t.error && t.technical;
    const all = tk ? (tf === 'W' ? tk.ohlc_weekly : tk.ohlc_daily) || [] : [];
    if (all.length < 5) { holder.innerHTML = `<p class="muted small">${tk ? 'سابقهٔ کافی برای نمودار نیست.' : 'این خروجی بخش technical ندارد (نسخهٔ قدیمی اسکریپت)؛ دوباره داده بگیرید.'}</p>`; ctx.geo = null; return; }
    const css = getComputedStyle(box), col = (v, fb) => (css.getPropertyValue(v) || '').trim() || fb;
    const K = { bg: col('--bg', '#fff'), text: col('--text', '#16191d'), muted: col('--muted', '#5b6470'), line: col('--line', '#dfe3e8'), pos: col('--pos', '#137a3e'), neg: col('--neg', '#b42318'),
      accent: col('--accent', '#0f6e66'), ma1: col('--c-ma1', '#2a78d6'), ma2: col('--c-ma2', '#eb6834'), ma3: col('--c-ma3', '#4a3aa7'), ten: col('--c-tenkan', '#e87ba4'), kij: col('--c-kijun', '#eda100'),
      fib: col('--c-fib', '#1baf7a'), band: col('--c-band', '#8a94a0'), cloudUp: col('--pos', '#137a3e'), cloudDn: col('--neg', '#b42318') };
    const FONT = 'Vazirmatn, Tahoma, sans-serif';
    const W = Math.max(300, Math.round(holder.clientWidth || 640));
    const narrow = W < 560;
    const IND = indicators(all, tf);
    const want = RANGES[tf][Math.max(0, Math.min(2, st.range))][0], n = Math.min(all.length, want), s = all.length - n, B = all.slice(s);
    const F = L.has('ichi') ? 26 : L.has('piv') ? 7 : 3;
    const mL = narrow ? 46 : 50, mR = narrow ? 86 : 118, mT = 24;
    const PW = W - mL - mR, bw = PW / (n + F), x0 = mL, xOf = i => x0 + (i + 0.5) * bw;
    const Hp = Math.max(230, Math.min(400, Math.round(W * 0.46))), Hv = L.has('vol') ? 42 : 0, Hr = L.has('rsi') ? 72 : 0, Hm = L.has('macd') ? 72 : 0, gap = 14, Hx = 20;
    const yP0 = mT, yV0 = yP0 + Hp + (Hv ? gap : 0), yR0 = yV0 + Hv + (Hr ? gap : 0), yM0 = yR0 + Hr + (Hm ? gap : 0), Htot = yM0 + Hm + Hx;
    // ---- visible price domain
    let lo = Infinity, hi = -Infinity; B.forEach(b => { lo = Math.min(lo, b[3]); hi = Math.max(hi, b[2]); });
    const vis = a => a ? a.slice(s).filter(isNum) : [];
    const widen = xs => xs.forEach(v => { if (isNum(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    if (L.has('ma')) { widen(vis(IND.m1)); widen(vis(IND.m2)); }
    if (L.has('bb')) { widen(vis(IND.bbU)); widen(vis(IND.bbL)); }
    const baseLo = lo, baseHi = hi, near = v => isNum(v) && v >= baseLo * 0.9 && v <= baseHi * 1.1;
    const fibo = tk.fibonacci, piv = tf === 'W' ? tk.pivots && tk.pivots.weekly_from_last_completed_week : tk.pivots && tk.pivots.next_session_daily;
    const chart = t.chart || {}, plan = ctx.plan || {};
    const planLines = [];
    if (L.has('plan') && plan.tradable) {
      if (plan.signal && plan.signal.side === 'buy') { planLines.push([plan.signal.stop, 'حد ضرر', K.neg]); planLines.push([plan.signal.target, 'هدف', K.pos]); }
      else if (plan.trigger) { planLines.push([plan.trigger.level, 'ماشهٔ خرید', K.accent]); planLines.push([plan.trigger.target, 'هدف ماشه', K.pos]); }
      if (isNum(plan.holdStop)) planLines.push([plan.holdStop, 'حد ضرر دارنده', K.neg]);
    }
    if (L.has('fib') && fibo) widen(fibo.retracement_levels.map(x => x[1]).filter(near));
    if (L.has('plan')) widen(planLines.map(x => x[0]).filter(near));
    if (L.has('lv')) widen([chart.nearest_support && chart.nearest_support[1], chart.nearest_resistance && chart.nearest_resistance[1]].filter(near));
    if (L.has('piv') && piv) widen(['P', 'R1', 'S1'].map(k => piv[k]).filter(near));
    if (L.has('ichi')) { widen(vis(IND.ten)); widen(vis(IND.kij)); }
    const pad = (hi - lo) * 0.05 || hi * 0.02; lo -= pad; hi += pad;
    const yOf = v => yP0 + (hi - v) / (hi - lo) * Hp, inP = v => isNum(v) && v >= lo && v <= hi;
    // daily date → bar index (weekly: the week that contains that day)
    const idxOf = dEv => { const k = tf === 'W' ? all.findIndex(b => b[0] >= dEv) : all.findIndex(b => b[0] === dEv); return k < 0 ? null : k - s; };
    const o = [], lab = [];
    const ln = (x1, y1, x2, y2, c, w = 1, dash = '', op = 1) => o.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`);
    const tx = (x, y, s_, c, size = 11, anchor = 'start', weight = 400, extra = '') => o.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${c}" font-size="${size}" font-family="${FONT}" text-anchor="${anchor}" font-weight="${weight}"${extra}>${esc(s_)}</text>`);
    const path = (vals, c, w = 1.5, dash = '', shift = 0) => { let d = '', pen = false; vals.forEach((v, i) => { const k = i - s + shift; if (!isNum(v) || k < 0 || k >= n + F) { pen = false; return; } d += (pen ? 'L' : 'M') + xOf(k).toFixed(1) + ' ' + yOf(v).toFixed(1); pen = true; });
      if (d) o.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`); };
    const hline = (v, c, label, { w = 1, dash = '5 4', from = 0, op = 0.9, strong = false } = {}) => { if (!inP(v)) return; ln(Math.max(x0, xOf(from) - bw / 2), yOf(v), x0 + PW, yOf(v), c, w, dash, op); lab.push({ y: yOf(v), t: label, c, strong }); };
    // ---- background, title, grid
    o.push(`<rect x="0" y="0" width="${W}" height="${Htot}" fill="${K.bg}"/>`);
    const last = B[B.length - 1], prev = all[all.length - 2];
    tx(x0 + PW, 14, `${ctx.b.symbol || ''} · ${tf === 'W' ? 'هفتگی' : 'روزانه'} · ${jFull(last[0])} · پایانی ${nf(last[4])}`, K.text, 12, 'start', 700, ' direction="rtl"');
    const step = (() => { const raw = (hi - lo) / 5, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; })();
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { ln(x0, yOf(v), x0 + PW, yOf(v), K.line, 1); tx(x0 - 4, yOf(v) + 4, nf(v), K.muted, 10, 'end'); }
    ln(x0 + PW, yP0, x0 + PW, yP0 + Hp, K.line, 1);
    if (F > 3) o.push(`<rect x="${(xOf(n) - bw / 2).toFixed(1)}" y="${yP0}" width="${(F * bw).toFixed(1)}" height="${Hp}" fill="${K.line}" fill-opacity=".25"/>`);
    const clipId = 'pwc' + Math.random().toString(36).slice(2, 8), cs = o.length, later = [];
    // ---- Ichimoku cloud (behind candles): span A/B projected 26 bars ahead
    if (L.has('ichi')) {
      for (let k = 0; k < n + F - 1; k++) { const i = s + k - 26, j = i + 1; if (i < 0 || j >= all.length) continue;
        const a1 = IND.spA[i], b1 = IND.spB[i], a2 = IND.spA[j], b2 = IND.spB[j]; if (![a1, b1, a2, b2].every(isNum)) continue;
        o.push(`<polygon points="${xOf(k).toFixed(1)},${yOf(a1).toFixed(1)} ${xOf(k + 1).toFixed(1)},${yOf(a2).toFixed(1)} ${xOf(k + 1).toFixed(1)},${yOf(b2).toFixed(1)} ${xOf(k).toFixed(1)},${yOf(b1).toFixed(1)}" fill="${a1 >= b1 ? K.cloudUp : K.cloudDn}" fill-opacity=".13"/>`); }
      path(IND.spA, K.cloudUp, 0.8, '', 26); path(IND.spB, K.cloudDn, 0.8, '', 26);
    }
    if (L.has('bb')) { let d = ''; const up = [], dn = []; for (let k = 0; k < n; k++) { const i = s + k; if (isNum(IND.bbU[i])) { up.push([xOf(k), yOf(IND.bbU[i])]); dn.push([xOf(k), yOf(IND.bbL[i])]); } }
      if (up.length) { d = 'M' + up.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + 'L' + dn.reverse().map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + 'Z'; o.push(`<path d="${d}" fill="${K.band}" fill-opacity=".12" stroke="${K.band}" stroke-width=".8"/>`); }
      path(IND.bbM, K.band, 1, '3 3'); }
    // ---- Fibonacci
    const fibOn = L.has('fib') && fibo && fibo.retracement_levels;
    if (fibOn) {
      const f0 = idxOf(fibo.swing_from[0]), f1 = idxOf(fibo.swing_to[0]), from = f0 === null ? 0 : Math.max(0, f0);
      const lv = Object.fromEntries(fibo.retracement_levels.map(([r, p]) => [r, p]));
      if (inP(lv[0.382]) || inP(lv[0.618])) { const ya = yOf(Math.min(hi, Math.max(lo, lv[0.382]))), yb = yOf(Math.min(hi, Math.max(lo, lv[0.618])));
        o.push(`<rect x="${(xOf(from) - bw / 2).toFixed(1)}" y="${Math.min(ya, yb).toFixed(1)}" width="${(x0 + PW - xOf(from) + bw / 2).toFixed(1)}" height="${Math.abs(yb - ya).toFixed(1)}" fill="${K.fib}" fill-opacity=".08"/>`); }
      fibo.retracement_levels.forEach(([r, p]) => hline(p, K.fib, `${nf(r * 100, 1)}٪ ${nf(p)}`, { from, dash: r === 0 || r === 1 ? '' : '5 4', w: r === 0.618 || r === 0.382 || r === 0.5 ? 1.3 : 1 }));
      fibo.extension_levels.forEach(([r, p]) => hline(p, K.fib, `${nf(r * 100, 1)}٪ ${nf(p)}`, { from: f1 === null ? from : Math.max(0, f1), dash: '2 4', op: 0.7 }));
      if (f0 !== null && f1 !== null && f0 >= 0 && f1 >= 0) ln(xOf(f0), yOf(fibo.swing_from[1]), xOf(f1), yOf(fibo.swing_to[1]), K.fib, 1.2, '6 3');
    }
    // ---- pivots (next session / next week) in the future area
    if (L.has('piv') && piv) ['R2', 'R1', 'P', 'S1', 'S2'].forEach(k => { const v = piv[k]; if (!inP(v)) return; ln(xOf(n) - bw / 2, yOf(v), x0 + PW, yOf(v), K.muted, k === 'P' ? 1.4 : 1, k === 'P' ? '' : '3 3');
      lab.push({ y: yOf(v), t: `${tf === 'W' ? 'پیوت هفتگی' : 'پیوت'} ${k} ${nf(v)}`, c: K.muted }); });
    // ---- support / resistance
    if (L.has('lv')) {
      const ns = chart.nearest_support, nr = chart.nearest_resistance, poc = (chart.levels_sorted_high_to_low || []).find(x => /گره حجمی 1/.test(x[0]));
      if (nr) hline(nr[1], K.text, `مقاومت ${nf(nr[1])}`, { dash: '8 4', w: 1.3, strong: true, op: 0.75 });
      if (ns) hline(ns[1], K.text, `حمایت ${nf(ns[1])}`, { dash: '8 4', w: 1.3, strong: true, op: 0.75 });
      if (poc && (!ns || poc[1] !== ns[1]) && (!nr || poc[1] !== nr[1])) hline(poc[1], K.muted, `گره حجمی ${nf(poc[1])}`, { dash: '1 3', w: 1.4, op: 0.8 });
    }
    // ---- trend channel (daily, last 60 closes, log regression)
    if (L.has('ch') && tf === 'D' && all.length >= 60) {
      const i0 = all.length - 60, ys = all.slice(i0).map(b => Math.log(b[4])); let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
      ys.forEach((y, x) => { sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }); const N = 60, vx = sxx / N - (sx / N) ** 2, vy = syy / N - (sy / N) ** 2, cv = sxy / N - (sx / N) * (sy / N), bb = cv / vx, aa = sy / N - bb * sx / N, sd = Math.sqrt(Math.max(vy - bb * bb * vx, 0));
      const k0 = Math.max(0, i0 - s), xa = k0 - (i0 - s);
      [[0, '', 1], [2, '', 1.1], [-2, '', 1.1]].forEach(([m]) => { const ya = Math.exp(aa + bb * xa + m * sd), yb = Math.exp(aa + bb * 59 + m * sd); if (inP(ya) || inP(yb)) ln(xOf(k0), yOf(ya), xOf(n - 1), yOf(yb), K.accent, m ? 1.2 : 0.8, m ? '' : '4 3', 0.8); });
      lab.push({ y: yOf(Math.exp(aa + bb * 59 + 2 * sd)), t: 'سقف کانال', c: K.accent }); lab.push({ y: yOf(Math.exp(aa + bb * 59 - 2 * sd)), t: 'کف کانال', c: K.accent });
    }
    // ---- moving averages + Ichimoku lines
    if (L.has('ma')) { path(IND.m1, K.ma1, 1.6); path(IND.m2, K.ma2, 1.6); if (IND.m3) path(IND.m3, K.ma3, 1.8); }
    if (L.has('ichi')) { path(IND.ten, K.ten, 1.3); path(IND.kij, K.kij, 1.5, '6 3'); }
    // ---- candles
    const cw = Math.max(1, Math.min(14, bw * 0.66));
    B.forEach((b, k) => { const [, O, Hh, Ll, Cc] = b, upc = Cc >= O, c = upc ? K.pos : K.neg, x = xOf(k);
      ln(x, yOf(Hh), x, yOf(Ll), c, 1); const y1 = yOf(Math.max(O, Cc)), y2 = yOf(Math.min(O, Cc));
      o.push(`<rect x="${(x - cw / 2).toFixed(1)}" y="${y1.toFixed(1)}" width="${cw.toFixed(1)}" height="${Math.max(1, y2 - y1).toFixed(1)}" fill="${c}"/>`); });
    // ---- plan lines (on top of candles)
    planLines.forEach(([v, l, c]) => hline(v, c, `${l} ${nf(v)}`, { dash: '10 3 2 3', w: 1.4, strong: true }));
    // ---- patterns, swings, divergence, today's candle pattern (daily only)
    const notes = [];
    if (L.has('pat') && tf === 'D') {
      const sw = tk.swings_recent || {};
      (sw.highs || []).forEach(([d, p]) => { const k = idxOf(d); if (k === null || k < 0 || !inP(p)) return; const x = xOf(k), y = yOf(p) - 6; o.push(`<path d="M${(x - 4).toFixed(1)} ${(y - 6).toFixed(1)}L${(x + 4).toFixed(1)} ${(y - 6).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}Z" fill="${K.muted}"/>`); });
      (sw.lows || []).forEach(([d, p]) => { const k = idxOf(d); if (k === null || k < 0 || !inP(p)) return; const x = xOf(k), y = yOf(p) + 6; o.push(`<path d="M${(x - 4).toFixed(1)} ${(y + 6).toFixed(1)}L${(x + 4).toFixed(1)} ${(y + 6).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}Z" fill="${K.muted}"/>`); });
      (tk.chart_patterns || []).forEach(pt => {
        const pts = (pt.points || []).map(([d, p]) => [idxOf(d), p]).filter(([k]) => k !== null && k >= 0);
        const stTxt = /broken/.test(pt.status) ? 'شکسته شد' : 'در حال شکل‌گیری';
        if (pt.upper_line) { [pt.upper_line, pt.lower_line].forEach(line => { const [[d1, p1], [d2, p2]] = line, k1 = idxOf(d1), k2 = idxOf(d2); if (k1 === null || k2 === null || k1 < 0) return;
            const slope = (p2 - p1) / (k2 - k1), pe = p1 + slope * (n - 1 - k1); ln(xOf(k1), yOf(p1), xOf(n - 1), yOf(pe), K.text, 1.3, '', 0.8); });
          const [[d1, p1]] = pt.upper_line, k1 = idxOf(d1); if (k1 !== null && k1 >= 0) tx(xOf(k1), yOf(p1) - 10, `${pt.fa} (${stTxt})`, K.text, 11, 'middle', 700);
          notes.push(`${pt.fa}: شکست بالای ${nf(pt.breakout_up_above)} یا زیر ${nf(pt.breakdown_below)}`); return; }
        if (pts.length >= 2) { o.push(`<polyline points="${pts.map(([k, p]) => `${xOf(k).toFixed(1)},${yOf(p).toFixed(1)}`).join(' ')}" fill="none" stroke="${K.text}" stroke-width="1.3" stroke-opacity=".8"/>`);
          const top = pts.reduce((a, c) => (pt.bias === 'bearish' ? c[1] > a[1] : c[1] < a[1]) ? c : a); tx(xOf(top[0]), yOf(top[1]) + (pt.bias === 'bearish' ? -12 : 20), `${pt.fa} (${stTxt})`, K.text, 11, 'middle', 700); }
        if (isNum(pt.neckline) && pts.length) hline(pt.neckline, K.text, `خط گردن ${nf(pt.neckline)}`, { from: pts[0][0], dash: '6 3', w: 1.2 });
        if (isNum(pt.measured_target) && inP(pt.measured_target)) { ln(xOf(n) - bw / 2, yOf(pt.measured_target), x0 + PW, yOf(pt.measured_target), K.text, 1, '2 2'); lab.push({ y: yOf(pt.measured_target), t: `هدف الگو ${nf(pt.measured_target)}`, c: K.text }); }
      });
      (tk.rsi_divergence || []).forEach(dv => { const [[d1, p1], [d2, p2]] = dv.swings, k1 = idxOf(d1), k2 = idxOf(d2); if (k1 === null || k2 === null || k1 < 0) return;
        const c = dv.type === 'bullish' ? K.pos : K.neg; ln(xOf(k1), yOf(p1), xOf(k2), yOf(p2), c, 2);
        tx(xOf(k2), yOf(p2) + (dv.type === 'bullish' ? 22 : -12), dv.type === 'bullish' ? 'واگرایی مثبت RSI' : 'واگرایی منفی RSI', c, 11, 'middle', 700);
        if (Hr) { const r1 = IND.rsi[s + k1], r2 = IND.rsi[s + k2], yr = v => yR0 + (100 - v) / 100 * Hr; if (isNum(r1) && isNum(r2)) later.push(`<line x1="${xOf(k1).toFixed(1)}" y1="${yr(r1).toFixed(1)}" x2="${xOf(k2).toFixed(1)}" y2="${yr(r2).toFixed(1)}" stroke="${c}" stroke-width="2"/>`); } });
      if ((tk.candles_today || []).length) tx(xOf(n - 1), yOf(last[2]) - 10, tk.candles_today.join('، '), K.text, 11, 'end', 700);
    }
    o.splice(cs, o.length - cs, `<clipPath id="${clipId}"><rect x="${x0}" y="${yP0}" width="${PW}" height="${Hp}"/></clipPath><g clip-path="url(#${clipId})">${o.slice(cs).join('')}</g>`);
    // ---- last price marker
    lab.push({ y: yOf(last[4]), t: `پایانی ${nf(last[4])}`, c: K.accent, strong: true, pill: true });
    // ---- right-side labels without overlaps
    lab.sort((a, b) => a.y - b.y); const gapL = 13; for (let k = 1; k < lab.length; k++) if (lab[k].y < lab[k - 1].y + gapL) lab[k].yy = (lab[k - 1].yy || lab[k - 1].y) + gapL;
    lab.forEach(l => { if (l.yy === undefined) l.yy = l.y; }); for (let k = 1; k < lab.length; k++) if (lab[k].yy < lab[k - 1].yy + gapL) lab[k].yy = lab[k - 1].yy + gapL;
    const over = lab.length ? lab[lab.length - 1].yy - (yP0 + Hp) : 0; if (over > 0) lab.forEach(l => { l.yy -= over; });
    const xl = x0 + PW + 3, xr = W - 3;
    const SHORT = [['حد ضرر دارنده', 'حد ضرر'], ['ماشهٔ خرید', 'ماشه'], ['هدف ماشه', 'هدف'], ['گره حجمی', 'گره'], ['پیوت هفتگی', 'پیوت'], ['هدف الگو', 'هدف'], ['خط گردن', 'گردن']];
    if (narrow) lab.forEach(l => SHORT.forEach(([a, b_]) => { l.t = l.t.replace(a, b_); }));
    lab.forEach(l => { if (Math.abs(l.yy - l.y) > 2) ln(x0 + PW, l.y, xl, l.yy, l.c, 0.8, '', 0.6);
      if (l.pill) { o.push(`<rect x="${xl}" y="${(l.yy - 8).toFixed(1)}" width="${xr - xl + 1}" height="16" rx="4" fill="${l.c}"/>`); tx(xr - 3, l.yy + 4, l.t, K.bg, 10.5, 'start', 700, ' direction="rtl"'); }
      else tx(xr, l.yy + 4, l.t, l.c, 10, 'start', l.strong ? 700 : 400, ' direction="rtl"'); });
    o.push(later.join(''));
    // ---- volume pane
    if (Hv) { const vmax = Math.max(...B.map(b => b[5] || 0)) || 1; B.forEach((b, k) => { const hgt = (b[5] || 0) / vmax * (Hv - 4); o.push(`<rect x="${(xOf(k) - cw / 2).toFixed(1)}" y="${(yV0 + Hv - hgt).toFixed(1)}" width="${cw.toFixed(1)}" height="${hgt.toFixed(1)}" fill="${b[4] >= b[1] ? K.pos : K.neg}" fill-opacity=".45"/>`); });
      ln(x0, yV0 + Hv, x0 + PW, yV0 + Hv, K.line); tx(x0 + PW - 4, yV0 - 1, 'حجم', K.muted, 10, 'start', 400, ' direction="rtl"'); }
    // ---- RSI pane
    if (Hr) { const yr = v => yR0 + (100 - v) / 100 * Hr; o.push(`<rect x="${x0}" y="${yr(70)}" width="${PW}" height="${yr(30) - yr(70)}" fill="${K.line}" fill-opacity=".35"/>`);
      [30, 50, 70].forEach(v => { ln(x0, yr(v), x0 + PW, yr(v), K.line, 1, v === 50 ? '2 3' : ''); tx(x0 - 4, yr(v) + 4, nf(v), K.muted, 10, 'end'); });
      let d = '', pen = false; for (let k = 0; k < n; k++) { const v = IND.rsi[s + k]; if (!isNum(v)) { pen = false; continue; } d += (pen ? 'L' : 'M') + xOf(k).toFixed(1) + ' ' + yr(v).toFixed(1); pen = true; }
      if (d) o.push(`<path d="${d}" fill="none" stroke="${K.ma1}" stroke-width="1.5"/>`);
      tx(x0 + PW - 4, yR0 - 1, `RSI ۱۴ · ${nf(IND.rsi[all.length - 1], 1)}`, K.muted, 10, 'start', 400, ' direction="rtl"'); }
    // ---- MACD pane
    if (Hm) { const vals = []; for (let k = 0; k < n; k++) { const i = s + k; [IND.macd[i], IND.sig[i]].forEach(v => isNum(v) && vals.push(v)); }
      const mx = Math.max(1e-9, ...vals.map(Math.abs)), ym = v => yM0 + Hm / 2 - v / mx * (Hm / 2 - 3);
      ln(x0, ym(0), x0 + PW, ym(0), K.line);
      for (let k = 0; k < n; k++) { const i = s + k, h_ = IND.macd[i] - IND.sig[i]; if (!isNum(h_)) continue; const y1 = ym(Math.max(0, h_)), y2 = ym(Math.min(0, h_));
        o.push(`<rect x="${(xOf(k) - cw / 2).toFixed(1)}" y="${y1.toFixed(1)}" width="${cw.toFixed(1)}" height="${Math.max(0.5, y2 - y1).toFixed(1)}" fill="${h_ >= 0 ? K.pos : K.neg}" fill-opacity=".45"/>`); }
      const pth = (arr, c) => { let d = '', pen = false; for (let k = 0; k < n; k++) { const v = arr[s + k]; if (!isNum(v)) { pen = false; continue; } d += (pen ? 'L' : 'M') + xOf(k).toFixed(1) + ' ' + ym(v).toFixed(1); pen = true; } if (d) o.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="1.4"/>`); };
      pth(IND.macd, K.ma1); pth(IND.sig, K.ma2); tx(x0 + PW - 4, yM0 - 1, 'MACD ۱۲،۲۶،۹', K.muted, 10, 'start', 400, ' direction="rtl"'); }
    // ---- date axis: Jalali month boundaries
    const ticks = []; for (let k = 1; k < n; k++) if (jMonth(B[k][0]) !== jMonth(B[k - 1][0])) ticks.push(k);
    const every = Math.max(1, Math.ceil(ticks.length / (narrow ? 4 : 8))), minGap = tf === 'W' ? 62 : 46; let lastX = -1e9;
    ticks.filter((_, j) => j % every === 0).forEach(k => { const x = xOf(k); if (x - lastX < minGap) return; lastX = x; ln(x, yP0, x, Htot - Hx, K.line, 1, '2 4', 0.8); const m = jMonth(B[k][0]);
      tx(x, Htot - 5, m === '1' || tf === 'W' ? `${jMonthName(B[k][0])} ${jYear(B[k][0])}` : jMonthName(B[k][0]), K.muted, 10, 'middle', 400, ' direction="rtl"'); });
    // ---- crosshair placeholders
    o.push(`<line data-x="v" x1="0" x2="0" y1="${yP0}" y2="${Htot - Hx}" stroke="${K.muted}" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`);
    o.push(`<line data-x="h" x1="${x0}" x2="${x0 + PW}" y1="0" y2="0" stroke="${K.muted}" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`);
    holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Htot}" viewBox="0 0 ${W} ${Htot}" role="img" aria-label="نمودار شمعی ${esc(ctx.b.symbol || '')} با ابزارهای تکنیکال">${o.join('')}</svg>`;
    ctx.geo = { x0, bw, n, s, all, IND, yP0, Hp, lo, hi, W, PW, tf };
    const nt = box.querySelector('[data-el="note"]');
    const legend = [L.has('ma') ? (tf === 'W' ? 'میانگین ۱۰ و ۳۰ هفته' : 'میانگین ۲۰، ۵۰ و ۲۰۰ روزه') : '', L.has('ichi') ? 'ایچیموکو ۹، ۲۶، ۵۲ (ابر ۲۶ دوره جلوتر)' : '',
      fibOn ? `فیبوناچی روی نوسان ${fibo.direction === 'up' ? 'صعودی' : 'نزولی'} ${nf(fibo.swing_pct, 1)}٪ ${fibo.valid_swing ? '' : '(نوسان هنوز معتبر نیست)'}` : ''].filter(Boolean);
    if (nt) nt.textContent = [...legend, ...notes].join(' · ') + (legend.length || notes.length ? ' · ' : '') + 'کندل با قیمت پایانی. ابزارهای کلاسیک برای سطح، حد ضرر و هدف است، نه جهت.';
  }

  // ------------------------------------------------------------ hover
  function hover(box, ev) {
    const ctx = REG.get(box), g = ctx && ctx.geo, svg = box.querySelector('svg'), tip = box.querySelector('.tc-tip'); if (!g || !svg || !tip) return;
    const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * (g.W / r.width), y = (ev.clientY - r.top) * (g.W / r.width);
    const k = Math.floor((x - g.x0) / g.bw), v = svg.querySelector('[data-x="v"]'), h = svg.querySelector('[data-x="h"]');
    if (k < 0 || k >= g.n) { v.setAttribute('visibility', 'hidden'); h.setAttribute('visibility', 'hidden'); tip.hidden = true; return; }
    const i = g.s + k, b = g.all[i], p = g.all[i - 1], cx = g.x0 + (k + 0.5) * g.bw;
    v.setAttribute('x1', cx); v.setAttribute('x2', cx); v.setAttribute('visibility', 'visible');
    if (y >= g.yP0 && y <= g.yP0 + g.Hp) { h.setAttribute('y1', y); h.setAttribute('y2', y); h.setAttribute('visibility', 'visible'); } else h.setAttribute('visibility', 'hidden');
    const ch = p ? (b[4] / p[4] - 1) * 100 : null, I = g.IND, row = (a, c) => `<div><span>${a}</span><b class="n">${c}</b></div>`;
    tip.innerHTML = `<div class="tt-h">${jFull(b[0])}${g.tf === 'W' ? ' (هفته)' : ''}</div>${row('بازگشایی', nf(b[1]))}${row('بیشینه', nf(b[2]))}${row('کمینه', nf(b[3]))}${row('پایانی', nf(b[4]))}${isNum(ch) ? row('تغییر', `${ch >= 0 ? '+' : '−'}${nf(Math.abs(ch), 2)}٪`) : ''}
      ${row('حجم', nf(b[5]))}${isNum(I.rsi[i]) ? row('RSI', nf(I.rsi[i], 1)) : ''}${isNum(I.m1[i]) ? row(`میانگین ${nf(I.k1)}`, nf(I.m1[i])) : ''}${isNum(I.m2[i]) ? row(`میانگین ${nf(I.k2)}`, nf(I.m2[i])) : ''}${I.m3 && isNum(I.m3[i]) ? row('میانگین ۲۰۰', nf(I.m3[i])) : ''}`;
    tip.hidden = false;
    const bx = box.getBoundingClientRect(), tw = tip.offsetWidth || 150, px = ev.clientX - bx.left, py = ev.clientY - bx.top;
    tip.style.left = Math.max(4, Math.min(bx.width - tw - 4, px + (px > bx.width / 2 ? -tw - 14 : 14))) + 'px'; tip.style.top = Math.max(4, py - 20) + 'px';
  }

  // ------------------------------------------------------------ export
  function toPng(box) {
    return new Promise((res, rej) => { const svg = box.querySelector('svg'); if (!svg) return rej(new Error('نمودار نیست'));
      const W = +svg.getAttribute('width'), H = +svg.getAttribute('height'), clone = svg.cloneNode(true); clone.querySelectorAll('[data-x]').forEach(e => e.remove());
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone)), img = new Image();
      img.onload = () => { try { const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; const g = c.getContext('2d'); g.scale(2, 2); g.drawImage(img, 0, 0); c.toBlob(b => b ? res(b) : rej(new Error('تبدیل نشد')), 'image/png'); } catch (e) { rej(e); } };
      img.onerror = () => rej(new Error('تصویر ساخته نشد')); img.src = url; });
  }
  async function act(box, el) {
    const ctx = REG.get(box); if (!ctx) return;
    const st = { ...DEF, ...(ctx.store ? ctx.store.get('chart', {}) : {}) }, a = el.dataset.ch;
    if (a === 'tf') { st.tf = el.dataset.v; }
    else if (a === 'range') { st.range = +el.dataset.v; }
    else if (a === 'layer') { const L = new Set(st.layers); L.has(el.dataset.v) ? L.delete(el.dataset.v) : L.add(el.dataset.v); st.layers = [...L]; }
    else if (a === 'png' || a === 'copyimg') {
      try { const blob = await toPng(box);
        if (a === 'copyimg' && navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); ctx.toast && ctx.toast('تصویر نمودار کپی شد؛ در گفت‌وگو با Claude بچسبانید'); return; }
        const u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = `chart-${(ctx.b && ctx.b.symbol) || 'petro'}-${st.tf === 'W' ? 'weekly' : 'daily'}.png`; document.body.appendChild(l); l.click(); setTimeout(() => { URL.revokeObjectURL(u); l.remove(); }, 1500);
        ctx.toast && ctx.toast(a === 'copyimg' ? 'کپی تصویر پشتیبانی نشد؛ فایل دانلود شد' : 'تصویر دانلود شد');
      } catch (e) { ctx.toast && ctx.toast('تصویر ساخته نشد: ' + e.message); }
      return;
    }
    if (ctx.store) ctx.store.set('chart', st);
    draw(box);
  }

  function mount(root, b, opts = {}) {
    if (!root) return;
    const rn = root.getRootNode ? root.getRootNode() : root;
    root.querySelectorAll('[data-tchart]').forEach(box => {
      REG.set(box, { b, plan: opts.plan, store: opts.store, toast: opts.toast, geo: null });
      if (typeof ResizeObserver === 'function') { let w0 = 0; new ResizeObserver(en => { const w = Math.round(en[0].contentRect.width); if (w && Math.abs(w - w0) > 4) { w0 = w; draw(box); } }).observe(box.querySelector('.tc-svg')); }
      draw(box);
    });
    if (!WIRED.has(rn)) {
      WIRED.add(rn);
      rn.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-ch]'); if (!el) return; const box = el.closest('[data-tchart]'); if (box) act(box, el); });
      rn.addEventListener('pointermove', e => { const box = e.target.closest && e.target.closest('[data-tchart]'); if (box && e.target.closest('.tc-svg')) hover(box, e); });
      rn.addEventListener('pointerleave', e => { const box = e.target.closest && e.target.closest('[data-tchart]'); if (box) { const tip = box.querySelector('.tc-tip'); if (tip) tip.hidden = true; } }, true);
      try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => rn.querySelectorAll('[data-tchart]').forEach(draw)); } catch (e) { /* old browser */ }
    }
  }
  return { html, mount, draw, indicators };
})();

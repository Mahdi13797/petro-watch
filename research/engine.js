/* ==========================================================================
   research/engine.js — "time machine" for the Petro-Watch rubric (v2.3)
   For every symbol and every trading day t it rebuilds what petroSnapshot would have produced
   AS OF the close of day t (price-derived rubric rows, flows, regime, calibration, decision),
   and next to it what actually happened afterwards (next day, 5 days, the tradeable path).
   Runs in a browser tab on tsetmc.com (data = window.__PW from research/fetch.js) or in Node.

   Input P = { sym: { 'شپنا': [ { ic, d: [[dEven,o,h,l,last,close,y,vol,val,n]...], c: [[recDate,bIv,sIv,bNv,sNv,bIval,sIval,bNval,sNval,bIc,sIc,bNc,sNc]...] } ] },
               idx: { g23: [[dEven, close, low, high]], total: [...], eqw: [...], g44: [...] } }
   Output: { rows: [...], limits: [[date, up, dn]...] }
   ========================================================================== */
function pwEngine(P, opt = {}) {
  const R = (x, d = 4) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** d) / 10 ** d;
  const regimeIdx = opt.regimeIndex || 'g23';
  const byDate = a => a.slice().sort((x, y) => x[0] - y[0]);
  const jf = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
  const jcache = new Map();
  const g2j = dEv => { let s = jcache.get(dEv); if (s) return s; const t = String(dEv); s = jf.format(new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8)))).replace(/[^\d/]/g, ''); jcache.set(dEv, s); return s; };
  const toUTC = dEv => { const t = String(dEv); return Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8)); };

  // ---------- indices
  const mkIdx = rows => { const a = byDate(rows || []).filter(r => r[1] > 0); const m = new Map(); a.forEach((r, i) => m.set(r[0], i)); return { d: a.map(r => r[0]), c: a.map(r => r[1]), m }; };
  const IX = {}; for (const k of Object.keys(P.idx || {})) IX[k] = mkIdx(P.idx[k]);
  const ixBack = (ix, date, k) => { if (!ix) return null; const i = ix.m.get(date); if (i === undefined || i - k < 0) return null; return ix.c[i] / ix.c[i - k] - 1; };
  const ixFwd = (ix, date, k) => { if (!ix) return null; const i = ix.m.get(date); if (i === undefined || i + k >= ix.c.length) return null; return ix.c[i + k] / ix.c[i] - 1; };

  // ---------- merge instruments (a symbol can have an old board/market code)
  const syms = Object.keys(P.sym), S = {};
  for (const s of syms) {
    const dm = new Map(), cm = new Map();
    for (const ins of P.sym[s]) { const mk = ins.info && ins.info.flow === 2 ? 'fara' : 'bourse'; for (const r of ins.d) if (r[7] > 0) dm.set(r[0], [...r, mk]); for (const r of ins.c) cm.set(r[0], r); }
    S[s] = { D: [...dm.values()].sort((a, b) => a[0] - b[0]).map(r => ({ d: r[0], o: r[1], h: r[2], l: r[3], last: r[4], c: r[5], y: r[6], v: r[7], val: r[8], mk: r[10] })), CT: cm };
  }

  // ---------- daily price limits, estimated from the market itself (mode of the day's max/min move, ±60 trading days)
  const ext = new Map();
  for (const s of syms) for (const r of S[s].D) { if (!(r.y > 0)) continue; const e = ext.get(r.d) || [-1, 1]; e[0] = Math.max(e[0], r.h / r.y - 1); e[1] = Math.min(e[1], r.l / r.y - 1); ext.set(r.d, e); }
  const allD = [...ext.keys()].sort((a, b) => a - b);
  const grid = v => { const g = Math.round(v * 200) / 200; return Math.abs(v - g) <= 0.0012 ? g : null; };
  const upG = allD.map(d => { const v = ext.get(d)[0]; return v >= 0.02 && v <= 0.10 ? grid(v) : null; });
  const dnG = allD.map(d => { const v = -ext.get(d)[1]; return v >= 0.02 && v <= 0.10 ? grid(v) : null; });
  const modeWin = (arr, i, w) => { const c = new Map(); for (let k = Math.max(0, i - w); k <= Math.min(arr.length - 1, i + w); k++) if (arr[k] !== null) c.set(arr[k], (c.get(arr[k]) || 0) + 1); let best = null, bn = 0; c.forEach((n, v) => { if (n > bn || (n === bn && v > best)) { best = v; bn = n; } }); return best; };
  // actual thresholds when available (opt.thresholds[date] = { y, recs: [[hEven, max, min]...] } of one reference stock,
  // from MarketData/GetStaticThreshold); the day's LAST record is the range in force at the close
  // opt.thresholds = { bourse: {date: ...}, fara: {date: ...} } (farabourse ranges sometimes differ)
  const THM = opt.thresholds || {};
  const thPct = (mk, d) => { const x = (THM[mk] || {})[d]; if (!x || !x.recs || !x.recs.length || !(x.y > 0)) return null; const q = x.recs[x.recs.length - 1];
    const u = Math.round((q[1] / x.y - 1) * 200) / 200, dn = Math.round((1 - q[2] / x.y) * 200) / 200; return u >= 0.005 && u <= 0.1 && dn >= 0.005 && dn <= 0.1 ? [u, dn] : null; };
  const LIMe = new Map(); allD.forEach((d, i) => LIMe.set(d, [modeWin(upG, i, 60) || 0.05, modeWin(dnG, i, 60) || 0.05]));
  const limOf = (mk, d) => thPct(mk, d) || thPct(mk === 'fara' ? 'bourse' : 'fara', d) || LIMe.get(d) || [0.05, 0.05];
  const LIM = { get: d => limOf('bourse', d) }; const limits = [];
  allD.forEach(d => { const [u, dn] = limOf('bourse', d); if (!limits.length || limits[limits.length - 1][1] !== u || limits[limits.length - 1][2] !== dn) limits.push([d, u, dn]); });

  // ---------- v2.3 calibration table (group 44, 1392-1405): [n, p1, p3, p5, p10, med5, gain5, loss5]
  const CAL = { hot: { '<=-4': [30, .10, .23, .20, .27, -3.3, 3.4, -5.6], '-3..-2': [2575, .25, .52, .55, .58, 0.8, 6.7, -4.8], '-1..+1': [9398, .51, .54, .57, .61, 1.0, 6.4, -4.2], '+2..+3': [2332, .76, .56, .57, .60, 1.1, 7.0, -4.5], '>=+4': [141, .87, .72, .74, .78, 4.4, 10.1, -3.5], ALL: [14476, .50, .54, .57, .61, 1.0, 6.6, -4.4] },
    mid: { '<=-4': [1313, .11, .26, .31, .40, -0.6, 3.3, -2.3], '-3..-2': [9771, .23, .38, .41, .45, -0.5, 5.6, -3.0], '-1..+1': [29601, .44, .46, .48, .50, -0.1, 5.8, -3.1], '+2..+3': [5726, .73, .54, .54, .54, 0.3, 9.9, -3.3], '>=+4': [441, .81, .60, .58, .58, 0.5, 5.2, -3.1], ALL: [46852, .43, .45, .47, .49, -0.2, 6.3, -3.0] },
    cold: { '<=-4': [535, .18, .36, .38, .46, -0.6, 4.1, -2.5], '-3..-2': [2789, .31, .42, .43, .48, -0.5, 4.6, -3.4], '-1..+1': [5497, .49, .46, .47, .49, -0.2, 5.2, -4.0], '+2..+3': [1177, .76, .49, .50, .49, 0.0, 5.9, -4.4], '>=+4': [65, .77, .62, .57, .54, 1.9, 7.2, -4.9], ALL: [10063, .45, .45, .46, .48, -0.3, 5.1, -3.8] } };
  const band = s => s <= -4 ? '<=-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : '>=+4';

  const rows = [];
  for (const s of syms) {
    const D = S[s].D, n = D.length; if (n < 30) continue;
    const ipoIdx = D.findIndex(r => r.y === 1000 && r.c > 1500);
    // backward adjustment factors (same rule as the collector; the whole history is adjusted, which leaves every
    // scale-free indicator identical to an as-of computation)
    const fac = new Array(n).fill(1), adjAt = new Array(n).fill(false);
    for (let i = n - 2; i >= 0; i--) { let q = (i + 1 === ipoIdx) ? 1 : D[i + 1].y / D[i].c; if (q > 0.995 && q < 1.005) q = 1; else adjAt[i + 1] = true; fac[i] = fac[i + 1] * q; }
    const C = D.map((r, i) => r.c * fac[i]), H = D.map((r, i) => r.h * fac[i]), Lo = D.map((r, i) => r.l * fac[i]), O = D.map((r, i) => (r.o || r.c) * fac[i]), LS = D.map((r, i) => r.last * fac[i]);
    const V = D.map(r => r.v), VAL = D.map(r => r.val);
    // indicators (causal)
    const wil = (a, k) => { const e = []; a.forEach((x, i) => e.push(i ? e[i - 1] + (x - e[i - 1]) / k : x)); return e; };
    const up = C.map((x, i) => i ? Math.max(0, x - C[i - 1]) : 0), dn = C.map((x, i) => i ? Math.max(0, C[i - 1] - x) : 0);
    const au = wil(up, 14), ad = wil(dn, 14), RSI = au.map((u, i) => 100 - 100 / (1 + u / (ad[i] || 1e-9)));
    const TR = C.map((x, i) => i ? Math.max(H[i] - Lo[i], Math.abs(H[i] - C[i - 1]), Math.abs(Lo[i] - C[i - 1])) : H[i] - Lo[i]), ATR = wil(TR, 14);
    const csum = [0]; C.forEach((x, i) => csum.push(csum[i] + x)); const csq = [0]; C.forEach((x, i) => csq.push(csq[i] + x * x));
    const vsum = [0]; V.forEach((x, i) => vsum.push(vsum[i] + x));
    const sma = (i, k) => i + 1 < k ? null : (csum[i + 1] - csum[i + 1 - k]) / k;
    // flows
    const F = D.map(r => { const x = S[s].CT.get(r.d); if (!x) return null; const bIval = x[5], sIval = x[6], bNval = x[7], sNval = x[8], bIc = x[9], sIc = x[10];
      const bpc = bIval / Math.max(1, bIc), spc = sIval / Math.max(1, sIc); return { bpc, spc, power: spc > 0 ? bpc / spc : null, netI: bIval - sIval, netN: bNval - sNval, val: r.val, bIc, sIc }; });
    const med = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
    let lastAdjDay = null, qUpRun = 0, qDnRun = 0, prevUp = false, prevDn = false;
    for (let t = 0; t < n; t++) {
      if (adjAt[t]) lastAdjDay = D[t].d;
      const r = D[t], hist = ipoIdx >= 0 ? t - ipoIdx + 1 : t + 1, ok = k => hist >= k;
      const [lu, ld] = limOf(r.mk, r.d);
      const chgLast = r.last / r.y - 1, chgClose = r.c / r.y - 1;
      const upQ = chgLast >= lu - 0.0015 && r.last >= r.h, dnQ = chgLast <= -(ld - 0.0015) && r.last <= r.l;
      // consecutive queue days BEFORE today
      const upRun = qUpRun, dnRun = qDnRun; qUpRun = upQ ? qUpRun + 1 : 0; qDnRun = dnQ ? qDnRun + 1 : 0;
      if (t < 25) continue;
      const m20 = sma(t, 20), sd20 = ok(20) && m20 ? Math.sqrt(Math.max(0, (csq[t + 1] - csq[t - 19]) / 20 - m20 * m20)) : null;
      const pctb = sd20 ? (C[t] - (m20 - 2 * sd20)) / (4 * sd20) : null;
      const rsi = ok(30) ? RSI[t] : null;
      const fl = F[t]; const fw = F.slice(Math.max(0, t - 59), t + 1).filter(Boolean);
      const newListing = ipoIdx >= 0 && hist <= 60;
      const pw = fl && !newListing ? fl.power : null;
      const pcr = fl && fw.length >= 20 ? fl.bpc / med(fw.map(x => x.bpc)) : null;
      const lmc = 100 * (r.last - r.c) / r.y;
      const P2 = {};
      const smart = pcr > 2 && pw > 1.5;
      P2.smart = smart ? 2 : 0; P2.bp2 = (!smart && pw > 2) ? 1 : 0; P2.bp05 = (pw !== null && pw < 0.5) ? -1 : 0;
      P2.buyq = upQ ? 2 : 0; P2.sellq = dnQ ? -2 : 0; P2.strong = lmc > 1 ? 2 : 0; P2.weak = lmc < -1 ? -2 : 0;
      P2.rsi30 = (rsi !== null && rsi < 30) ? -2 : 0; P2.boll = (pctb !== null && pctb > 1) ? 1 : 0;
      const sub = Object.values(P2).reduce((a, b) => a + b, 0);
      const gr20 = ixBack(IX[regimeIdx], r.d, 20);
      const regime = gr20 === null ? null : gr20 > 0.10 ? 'hot' : gr20 < -0.05 ? 'cold' : 'mid';
      const bd = band(sub), cal = regime ? CAL[regime][bd] : null, base = regime ? CAL[regime].ALL : null;
      const edge = cal ? Math.round(100 * (cal[3] - base[3])) : null;
      const adj7 = lastAdjDay !== null && (toUTC(r.d) - toUTC(lastAdjDay)) / 864e5 <= 7;
      const sit = (ipoIdx >= 0 && hist <= 120) ? 'A' : adj7 ? 'B' : hist < 60 ? 'C' : 'D';
      let dec = 'NA';
      if (sit === 'D' && cal) dec = (edge >= 8 && cal[3] >= 0.55 && !upQ) ? 'BUY' : (edge <= -8 && cal[3] <= 0.40 && !dnQ) ? 'SELL' : 'NO_EDGE';
      // what happened next
      const nx = t + 1 < n ? D[t + 1] : null;
      const f1 = k => t + k < n ? C[t + k] / C[t] - 1 : null;
      const nxLim = nx ? limOf(nx.mk, nx.d) : null;
      const nxUpQ = nx ? (nx.last / nx.y - 1 >= nxLim[0] - 0.0015 && nx.last >= nx.h) : null;
      const nxDnQ = nx ? (nx.last / nx.y - 1 <= -(nxLim[1] - 0.0015) && nx.last <= nx.l) : null;
      const row = {
        s, d: r.d, j: g2j(r.d), sit, regime, gr20: R(gr20), sub, band: bd, pts: P2, dec, edge, p1: cal ? cal[1] : null, p5: cal ? cal[3] : null, b1: base ? base[1] : null, b5: base ? base[3] : null,
        upQ, dnQ, lmc: R(lmc, 2), chg: R(100 * chgClose, 2), chgL: R(100 * chgLast, 2), gapT: t ? R(100 * (O[t] / C[t - 1] - 1), 2) : null,
        rsi: R(rsi, 1), pctb: R(pctb, 2), pw: R(pw, 2), pcr: R(pcr, 2), netI: fl && fl.val ? R(fl.netI / fl.val, 3) : null, netN: fl && fl.val ? R(fl.netN / fl.val, 3) : null,
        r5b: t >= 5 ? R(C[t] / C[t - 5] - 1) : null, r20b: t >= 20 ? R(C[t] / C[t - 20] - 1) : null, atr: R(ATR[t] / C[t]), volr: t >= 21 ? R(V[t] / ((vsum[t] - vsum[t - 20]) / 20), 2) : null, val: VAL[t],
        sma20: m20 ? R(C[t] / m20 - 1) : null, sma50: sma(t, 50) ? R(C[t] / sma(t, 50) - 1) : null,
        g1: R(ixBack(IX.g23, r.d, 1)), g5: R(ixBack(IX.g23, r.d, 5)), T1: R(ixBack(IX.total, r.d, 1)), T20: R(ixBack(IX.total, r.d, 20)), E1: R(ixBack(IX.eqw, r.d, 1)), q44: R(ixBack(IX.g44, r.d, 20)),
        adj7, lu, ld, hist, mk: r.mk, upRun, dnRun, dow: nx ? new Date(toUTC(nx.d)).getUTCDay() : null,
        // outcome
        nd: nx ? nx.d : null, gapDays: nx ? Math.round((toUTC(nx.d) - toUTC(r.d)) / 864e5) : null,
        r1: R(f1(1)), r2: R(f1(2)), r3: R(f1(3)), r5: R(f1(5)), r10: R(f1(10)),
        o1: nx ? R(O[t + 1] / C[t] - 1) : null, h1: nx ? R(H[t + 1] / C[t] - 1) : null, l1: nx ? R(Lo[t + 1] / C[t] - 1) : null, ls1: nx ? R(LS[t + 1] / C[t] - 1) : null,
        tr1: t + 2 < n ? R(C[t + 2] / C[t + 1] - 1) : null, tr5: t + 6 < n ? R(C[t + 6] / C[t + 1] - 1) : null,
        nxUpQ, nxDnQ, adjNext: t + 1 < n ? adjAt[t + 1] : null,
        gN1: nx ? R(ixFwd(IX.g23, r.d, 1)) : null, TN1: nx ? R(ixFwd(IX.total, r.d, 1)) : null, EN1: nx ? R(ixFwd(IX.eqw, r.d, 1)) : null
      };
      rows.push(row);
    }
  }
  // cross-section: mean next-day return of the other symbols on the same day (the "group move" the stock could not escape)
  const byDay = new Map(); rows.forEach(x => { if (x.r1 === null) return; const e = byDay.get(x.d) || [0, 0]; e[0] += x.r1; e[1]++; byDay.set(x.d, e); });
  rows.forEach(x => { const e = byDay.get(x.d); x.xs1 = e && e[1] > (x.r1 !== null ? 1 : 0) ? R((e[0] - (x.r1 || 0)) / (e[1] - (x.r1 !== null ? 1 : 0))) : null; });
  // breadth of the refiners on day t (share closing in buy / sell queue, share up), excluding the row itself
  const br = new Map(); rows.forEach(x => { const e = br.get(x.d) || [0, 0, 0, 0]; e[0]++; e[1] += x.upQ ? 1 : 0; e[2] += x.dnQ ? 1 : 0; e[3] += x.chg > 0 ? 1 : 0; br.set(x.d, e); });
  rows.forEach(x => { const e = br.get(x.d); const k = e[0] - 1; x.nG = k; x.gQup = k > 0 ? R((e[1] - (x.upQ ? 1 : 0)) / k, 2) : null; x.gQdn = k > 0 ? R((e[2] - (x.dnQ ? 1 : 0)) / k, 2) : null; x.gUp = k > 0 ? R((e[3] - (x.chg > 0 ? 1 : 0)) / k, 2) : null; });
  const byDay5 = new Map(); rows.forEach(x => { if (x.r5 === null) return; const e = byDay5.get(x.d) || [0, 0]; e[0] += x.r5; e[1]++; byDay5.set(x.d, e); });
  rows.forEach(x => { const e = byDay5.get(x.d); x.xs5 = e && e[1] > 1 && x.r5 !== null ? R((e[0] - x.r5) / (e[1] - 1)) : null; });
  return { rows, limits };
}

/* small helpers for analysis in the browser console: group, summarise, print */
function pwStats(rows, key, f = x => x) {
  const m = new Map(); rows.forEach(r => { const k = typeof key === 'function' ? key(r) : r[key]; if (k === undefined) return; const a = m.get(k) || []; a.push(r); m.set(k, a); });
  return [...m.entries()].map(([k, a]) => [k, f(a)]);
}
function pwSum(a, fld = 'r1') {
  const v = a.map(x => x[fld]).filter(x => x !== null && x !== undefined); if (!v.length) return { n: 0 };
  const s = [...v].sort((x, y) => x - y), mean = v.reduce((p, q) => p + q, 0) / v.length;
  return { n: v.length, up: Math.round(100 * v.filter(x => x > 0).length / v.length), flat: Math.round(100 * v.filter(x => x === 0).length / v.length), mean: Math.round(10000 * mean) / 100, med: Math.round(10000 * s[Math.floor(s.length / 2)]) / 100 };
}
function pwTable(list, cols) { return list.map(r => cols.map(c => { const v = typeof c === 'function' ? c(r) : r[c]; return v === null || v === undefined ? '-' : typeof v === 'object' ? JSON.stringify(v) : String(v); }).join('\t')).join('\n'); }

if (typeof module !== 'undefined') module.exports = { pwEngine, pwStats, pwSum, pwTable };

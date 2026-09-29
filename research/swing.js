/* ==========================================================================
   research/swing.js — multi-day swing plans for the refiners (hold 3 / 5 / 7 sessions)
   Decision after the close of day t · buy during session t+1 at its average price (پایانی), no fill in a buy queue ·
   walk the daily bars: stop (gap below → the open; locked sell queue → cannot sell) and target (gap above → the open),
   otherwise sell at the average price of the H-th session after entry · costs 1.25% round trip.
   Selection: logistic model of "H-day return after costs > 0", fitted walk-forward (each year only sees earlier years).
   ========================================================================== */
const SW = (() => {
  const COST = 0.0125;
  const mean = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  const med = v => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const f2 = x => x === null || x === undefined || !isFinite(x) ? '-' : (Math.round(x * 100) / 100).toFixed(2);
  const jy = r => +r.j.slice(0, 4);
  const clip = (x, a, b) => x === null || x === undefined || !isFinite(x) ? 0 : Math.max(a, Math.min(b, x));

  function trade(S, t, { H = 5, stopPct = null, tgtPct = null } = {}) {
    const n = S.C.length, e = t + 1; if (e >= n) return null;
    if (S.UQ[e]) return { skip: true };
    const entry = S.C[e], stop = stopPct ? entry * (1 - stopPct) : null, tgt = tgtPct ? entry * (1 + tgtPct) : null;
    for (let d = e + 1; d < n; d++) {
      const locked = S.LOCK[d];
      if (stop !== null && !locked) { if (S.O[d] <= stop) return done(S.O[d], d, 'stop'); if (S.L[d] <= stop) return done(stop, d, 'stop'); }
      if (tgt !== null && S.H[d] >= tgt) return done(Math.max(tgt, S.O[d]), d, 'target');
      if (d - e >= H && !locked) return done(S.C[d], d, 'time');
    }
    return null;
    function done(px, d, why) { return { entry, exit: px, ret: px / entry - 1 - COST, gross: px / entry - 1, days: d - e, why, exitDay: S.d[d], entryDay: S.d[e] }; }
  }
  function stats(T) {
    const v = T.map(x => x.ret); if (!v.length) return { n: 0 };
    const w = v.filter(x => x > 0), l = v.filter(x => x <= 0);
    return { n: v.length, win: Math.round(100 * w.length / v.length), mean: 100 * mean(v), med: 100 * med(v), pf: l.length ? w.reduce((a, b) => a + b, 0) / -l.reduce((a, b) => a + b, 0) : null,
      days: mean(T.map(x => x.days)), stopPct: Math.round(100 * T.filter(x => x.why === 'stop').length / T.length), tgtPct: Math.round(100 * T.filter(x => x.why === 'target').length / T.length) };
  }
  const sline = s => s.n ? [s.n, s.win, f2(s.mean), f2(s.med), f2(s.pf), f2(s.days), s.stopPct, s.tgtPct] : [0, '-', '-', '-', '-', '-', '-', '-'];
  const SHEAD = ['n', 'win%', 'mean net%', 'median%', 'PF', 'days', 'stop%', 'target%'];

  // features known at the close of t (continuous ones clipped and scaled with fixed constants: no look-ahead)
  const FS = [
    ['r5', r => clip(r.r5b, -0.3, 0.3) / 0.1], ['r20', r => clip(r.r20b, -0.5, 0.8) / 0.2], ['sma20', r => clip(r.sma20, -0.3, 0.4) / 0.1], ['sma50', r => clip(r.sma50, -0.5, 0.8) / 0.2],
    ['rsi', r => r.rsi === null ? 0 : (r.rsi - 50) / 20], ['pctb', r => r.pctb === null ? 0 : clip(r.pctb - 0.5, -1.5, 1.5)], ['volr', r => r.volr ? clip(Math.log(r.volr), -2, 2) : 0],
    ['netI', r => clip(r.netI, -1, 1) / 0.3], ['pw', r => r.pw ? clip(Math.log(r.pw), -2, 2) : 0], ['pcr', r => r.pcr ? clip(Math.log(r.pcr), -2, 2) : 0],
    ['upQ', r => r.upQ ? 1 : 0], ['dnQ', r => r.dnQ ? 1 : 0], ['upRun2', r => r.upQ && r.upRun >= 2 ? 1 : 0], ['dnRun2', r => r.dnQ && r.dnRun >= 2 ? 1 : 0],
    ['lmc', r => clip(r.lmc, -4, 4) / 2], ['chg', r => clip(r.chg, -8, 8) / 3],
    ['hot', r => r.regime === 'hot' ? 1 : 0], ['cold', r => r.regime === 'cold' ? 1 : 0], ['gr20', r => clip(r.gr20, -0.4, 0.6) / 0.1],
    ['T1', r => clip(r.T1, -0.06, 0.06) / 0.02], ['T20', r => clip(r.T20, -0.4, 0.6) / 0.1], ['g5', r => clip(r.g5, -0.3, 0.4) / 0.05],
    ['gUp', r => r.gUp === null ? 0 : r.gUp - 0.5], ['gQup', r => r.gQup || 0], ['gQdn', r => r.gQdn || 0],
    ['usd1', r => clip(r.usd1, -0.1, 0.1) / 0.03], ['usd20', r => clip(r.usd20, -0.3, 0.5) / 0.1],
    ['capinc', r => (r.cdNight || []).some(t => t === 'CAPINC_PROPOSAL' || t === 'CAPINC_STEP' || t === 'EGM') ? 1 : 0], ['interim', r => (r.cdToday || []).includes('INTERIM_FS') ? 1 : 0],
    ['rel20', r => r.rel20 || 0], ['atr', r => clip(r.atr, 0, 0.1) / 0.03]];
  function logit(rows, y, { iters = 300, l2 = 2e-3, lr = 0.05 } = {}) {
    const k = FS.length + 1, w = new Array(k).fill(0), m = new Array(k).fill(0), v = new Array(k).fill(0);
    const xs = rows.map(r => [1, ...FS.map(([, f]) => f(r))]), N = rows.length;
    for (let it = 1; it <= iters; it++) { const g = new Array(k).fill(0);
      for (let i = 0; i < N; i++) { const x = xs[i]; let z = 0; for (let j = 0; j < k; j++) z += w[j] * x[j]; const e = 1 / (1 + Math.exp(-z)) - y[i]; for (let j = 0; j < k; j++) g[j] += e * x[j]; }
      for (let j = 0; j < k; j++) { const gj = g[j] / N + (j ? l2 * w[j] : 0); m[j] = 0.9 * m[j] + 0.1 * gj; v[j] = 0.999 * v[j] + 0.001 * gj * gj; w[j] -= lr * (m[j] / (1 - 0.9 ** it)) / (Math.sqrt(v[j] / (1 - 0.999 ** it)) + 1e-8); } }
    return { w, p: r => { let z = w[0]; FS.forEach(([, f], j) => { z += w[j + 1] * f(r); }); return 1 / (1 + Math.exp(-z)); } };
  }
  // forward H-day return from the next session's average price (time exit only) = the model's target
  const fwd = (S, t, H) => { const e = t + 1; if (e + H >= S.C.length || S.UQ[e]) return null; return S.C[e + H] / S.C[e] - 1 - COST; };

  // walk-forward fit: out-of-sample probability r['p' + H] for years from..to
  function fitWF(R, series, H, from = 1396, to = 1405, opt = {}) {
    const base = R.filter(r => r.sit === 'D' && jy(r) >= 1392);
    base.forEach(r => { r['y' + H] = fwd(series[r.s], r.ti, H); });
    const W = {};
    for (let Y = from; Y <= to; Y++) {
      const tr = base.filter(r => jy(r) < Y && r['y' + H] !== null), te = base.filter(r => jy(r) === Y);
      const L = logit(tr, tr.map(r => r['y' + H] > 0 ? 1 : 0), opt); W[Y] = L.w;
      te.forEach(r => { r['p' + H] = L.p(r); });
    }
    return W;
  }
  // pick the top-k signals per day (by probability, at least thr), simulate each as an independent trade
  function run(R, series, { H = 5, k = 1, thr = 0, stopK = null, tgtM = null, years = null, filt = null } = {}) {
    const byDay = new Map();
    R.forEach(r => { const p = r['p' + H]; if (p === undefined || p === null || r.sit !== 'D') return; if (years && !years.includes(jy(r))) return; if (filt && !filt(r)) return;
      const a = byDay.get(r.d) || []; a.push(r); byDay.set(r.d, a); });
    const T = [];
    for (const [, a] of byDay) { a.sort((x, y) => y['p' + H] - x['p' + H]);
      for (const r of a.slice(0, k)) { if (r['p' + H] < thr) continue; const sp = stopK ? Math.max(0.02, stopK * (r.atr || 0.03)) : null;
        const x = trade(series[r.s], r.ti, { H, stopPct: sp, tgtPct: sp && tgtM ? sp * tgtM : (tgtM && !sp ? tgtM : null) }); if (x && !x.skip) T.push({ ...x, s: r.s, j: r.j, y: jy(r), p: r['p' + H] }); } }
    return T;
  }
  // non-overlapping portfolio: `slots` equal positions, one per symbol at a time, best signal first
  function portfolio(R, series, cfg, slots = 3) {
    const T = run(R, series, { ...cfg, k: 11 }).sort((a, b) => a.entryDay - b.entryDay || b.p - a.p);
    const open = []; let eq = 1; const curve = []; const taken = [];
    for (const x of T) {
      for (let i = open.length - 1; i >= 0; i--) if (open[i].exitDay < x.entryDay) { eq *= 1 + open[i].ret / slots; curve.push([open[i].exitDay, eq]); open.splice(i, 1); }
      if (open.length >= slots || open.some(o => o.s === x.s)) continue;
      open.push(x); taken.push(x);
    }
    open.forEach(o => { eq *= 1 + o.ret / slots; curve.push([o.exitDay, eq]); });
    let peak = 1, dd = 0; curve.sort((a, b) => a[0] - b[0]).forEach(([, e]) => { peak = Math.max(peak, e); dd = Math.min(dd, e / peak - 1); });
    return { trades: taken, final: eq, maxDD: dd, curve };
  }
  // extra row fields: dollar 1 and 20 days, cross-sectional rank of the 20-day return among the refiners (−0.5 … +0.5)
  function enrich(R, USD) {
    const ds = (USD || []).map(x => x[0]), vs = (USD || []).map(x => x[1]);
    const at = d => { let lo = 0, hi = ds.length - 1, k = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (ds[m] <= d) { k = m; lo = m + 1; } else hi = m - 1; } return k; };
    const bySym = {}; R.forEach(r => (bySym[r.s] ||= []).push(r));
    Object.values(bySym).forEach(a => a.sort((x, y) => x.d - y.d).forEach((r, i) => { const k = at(r.d), kp = i ? at(a[i - 1].d) : -1;
      r.usd1 = k >= 0 && kp >= 0 && k !== kp ? vs[k] / vs[kp] - 1 : 0; const k20 = at(r.d - 0) >= 0 && i >= 20 ? at(a[i - 20].d) : -1; r.usd20 = k >= 0 && k20 >= 0 ? vs[k] / vs[k20] - 1 : 0; }));
    const byDay = new Map(); R.forEach(r => { if (r.r20b === null) return; const a = byDay.get(r.d) || []; a.push(r); byDay.set(r.d, a); });
    byDay.forEach(a => { a.sort((x, y) => x.r20b - y.r20b); a.forEach((r, i) => { r.rel20 = a.length > 1 ? i / (a.length - 1) - 0.5 : 0; }); });
    return R.length;
  }
  return { enrich, COST, trade, stats, sline, SHEAD, FS, logit, fwd, fitWF, run, portfolio, f2, mean, med, jy };
})();
if (typeof window !== 'undefined') window.SW = SW;

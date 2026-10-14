/* research/ci.js — v2.5 review statistics on the replay rows (runs in the tsetmc tab after pwEngine)
   Block bootstrap by trading day: all symbols of one day stay together (cross-sectional correlation),
   consecutive days are drawn in blocks of L days (overlapping multi-day returns). 90% CI = 5th–95th percentile. */
window.AN = (() => {
  const COST = 0.0125;
  const jy = r => +r.j.slice(0, 4);
  const mean = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  const med = v => { if (!v.length) return null; const s = [...v].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const r1 = x => x === null || x === undefined || !isFinite(x) ? null : Math.round(x * 10) / 10;
  const pc = x => x === null || x === undefined || !isFinite(x) ? null : Math.round(1000 * x) / 10;
  // seeded RNG so every number is reproducible
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const reseed = s => { seed = s; };

  /* generic block bootstrap.
     items: array of {d: dateKey, ...}; stats: {name: [num(items)->number, den(items)->number]} as sums per day;
     returns point estimate and 90% CI for num/den of each stat. */
  function boot(items, stats, { L = 5, B = 1000 } = {}) {
    const days = [...new Set(items.map(x => x.d))].sort((a, b) => a - b), ix = new Map(days.map((d, i) => [d, i]));
    const names = Object.keys(stats), K = names.length, D = days.length;
    if (!D) return Object.fromEntries(names.map(n => [n, { est: null, lo: null, hi: null }]));
    const num = names.map(() => new Float64Array(D)), den = names.map(() => new Float64Array(D));
    for (const x of items) { const i = ix.get(x.d); names.forEach((n, k) => { const [f, g] = stats[n]; const a = f(x), b = g(x); if (a !== null && b !== null && isFinite(a) && isFinite(b)) { num[k][i] += a; den[k][i] += b; } }); }
    const est = names.map((n, k) => { let a = 0, b = 0; for (let i = 0; i < D; i++) { a += num[k][i]; b += den[k][i]; } return b ? a / b : null; });
    const reps = names.map(() => []), nb = Math.ceil(D / L);
    for (let b = 0; b < B; b++) {
      const A = new Float64Array(K), Bn = new Float64Array(K);
      for (let q = 0; q < nb; q++) { const st = Math.floor(rnd() * D); for (let u = 0; u < L; u++) { const i = (st + u) % D; for (let k = 0; k < K; k++) { A[k] += num[k][i]; Bn[k] += den[k][i]; } } }
      for (let k = 0; k < K; k++) if (Bn[k]) reps[k].push(A[k] / Bn[k]);
    }
    const out = {};
    names.forEach((n, k) => { const s = reps[k].sort((a, b) => a - b); out[n] = { est: est[k], lo: s[Math.floor(0.05 * s.length)], hi: s[Math.floor(0.95 * s.length) - 1] ?? s[s.length - 1], days: D, se: Math.sqrt(mean(s.map(v => (v - mean(s)) ** 2))) }; });
    return out;
  }
  const P = (o, k) => o[k] ? [pc(o[k].est), pc(o[k].lo), pc(o[k].hi)] : null;
  const ind = f => [x => (f(x) ? 1 : 0), x => 1];

  // ---------------- v2.4 next-session score (exactly the collector rows)
  const V24 = { strong: 3, weak: -3, buyq: 3, sellq: -2, smart: 2, buyq_lowvol: 2, buyq_run2: 1, sellq_lowvol: -1, sellq_run2: -1, rsi30: -1, boll: 1, bp05: -1,
    grp_buyq50: 1, grp_sellq50: -1, total_dn1: 1, drop_noq: 1, vol_low: -1, wide_range: -1, capinc_night: 1, interim_today: -1 };
  const ON = {
    strong: r => r.lmc > 1, weak: r => r.lmc < -1, buyq: r => r.upQ, sellq: r => r.dnQ, smart: r => r.pts.smart > 0,
    buyq_lowvol: r => r.upQ && r.volr !== null && r.volr < 0.7, buyq_run2: r => r.upQ && r.upRun >= 2, sellq_lowvol: r => r.dnQ && r.volr !== null && r.volr < 0.7, sellq_run2: r => r.dnQ && r.dnRun >= 2,
    rsi30: r => r.pts.rsi30 < 0, boll: r => r.pts.boll > 0, bp05: r => r.pts.bp05 < 0, grp_buyq50: r => r.gQup >= 0.5, grp_sellq50: r => r.gQdn >= 0.5, total_dn1: r => (r.T1 ?? 0) < -0.01,
    drop_noq: r => r.chg < -2 && !r.dnQ, vol_low: r => r.volr !== null && r.volr < 0.5, wide_range: r => r.lu >= 0.06,
    capinc_night: r => (r.cdNight || []).some(t => t === 'CAPINC_PROPOSAL' || t === 'CAPINC_STEP' || t === 'EGM'), interim_today: r => (r.cdToday || []).includes('INTERIM_FS') };
  const score24 = (r, W = V24) => Object.keys(W).reduce((s, k) => s + (ON[k](r) ? W[k] : 0), 0);
  const BANDS7 = ['<=-6', '-5..-4', '-3..-2', '-1..+1', '+2..+3', '+4..+5', '>=+6'];
  const band7 = s => s <= -6 ? '<=-6' : s <= -4 ? '-5..-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : s <= 5 ? '+4..+5' : '>=+6';
  const cls = x => x > 0.005 ? 1 : x < -0.005 ? -1 : 0;

  function nextSession(R) {
    const a = R.filter(r => r.sit === 'D' && jy(r) >= 1392 && r.r1 !== null);
    a.forEach(r => { r.s24 = score24(r); r.b7 = band7(r.s24); });
    const out = { total_n: a.length, bands: {} };
    for (const b of BANDS7) {
      const g = a.filter(r => r.b7 === b);
      const st = boot(g, { up: ind(r => cls(r.r1) > 0), flat: ind(r => cls(r.r1) === 0), down: ind(r => cls(r.r1) < 0), nbq: ind(r => r.nxUpQ), nsq: ind(r => r.nxDnQ) }, { L: 5 });
      const gl = g.filter(r => !r.upQ && r.rL1 !== null), g5 = g.filter(r => r.r5 !== null), gl5 = g.filter(r => !r.upQ && r.rL5 !== null);
      const sl = boot(gl, { net1: [r => r.rL1 - COST, r => 1] }, { L: 5 }), s5 = boot(g5, { up5: ind(r => r.r5 > 0) }, { L: 10 }), sl5 = boot(gl5, { net5: [r => r.rL5 - COST, r => 1] }, { L: 10 });
      out.bands[b] = { n: g.length, days: st.up.days, up: P(st, 'up'), flat: P(st, 'flat'), down: P(st, 'down'), nbq: pc(st.nbq.est), nsq: pc(st.nsq.est),
        med_rL1: pc(med(gl.map(r => r.rL1))), net1: P(sl, 'net1'), up5: P(s5, 'up5'), net5: P(sl5, 'net5'), med_rL5: pc(med(gl5.map(r => r.rL5))) };
    }
    return out;
  }
  // per-year directional accuracy of the call (UP if band >= +2, DOWN if <= -2), with CI, using fixed weights W
  function calls(R, years, W = V24, filt = () => true) {
    const res = {};
    for (const y of years) {
      const a = R.filter(r => r.sit === 'D' && r.r1 !== null && (typeof y === 'number' ? jy(r) === y : y(r)) && filt(r));
      a.forEach(r => { const s = score24(r, W); r._call = s >= 2 ? 1 : s <= -2 ? -1 : 0; });
      const c = a.filter(r => r._call !== 0), nf = c.filter(r => cls(r.r1) !== 0);
      const st = boot(nf, { right: ind(r => cls(r.r1) === r._call) }, { L: 5 }), sf = boot(c, { flat: ind(r => cls(r.r1) === 0), wrong: ind(r => cls(r.r1) === -r._call) }, { L: 5 });
      res[typeof y === 'number' ? y : 'custom'] = { rows: a.length, called_pct: pc(c.length / a.length), right_excl_flat: P(st, 'right'), flat: P(sf, 'flat'), wrong: P(sf, 'wrong'), n_calls: c.length, days: st.right.days };
    }
    return res;
  }

  // ---------------- logistic fit of the v2.4 rows (same optimiser as research/model.js) → integer points
  function fitPoints(R, filt) {
    const keys = Object.keys(V24), rows = R.filter(r => r.sit === 'D' && r.regime && r.r1 !== null && filt(r));
    const xs = rows.map(r => [1, ...keys.map(k => ON[k](r) ? 1 : 0)]), ys = rows.map(r => r.r1 > 0 ? 1 : 0), N = rows.length, K = keys.length + 1;
    const w = new Array(K).fill(0), m = new Array(K).fill(0), v = new Array(K).fill(0);
    for (let it = 1; it <= 400; it++) { const g = new Array(K).fill(0);
      for (let i = 0; i < N; i++) { const x = xs[i]; let z = 0; for (let j = 0; j < K; j++) z += w[j] * x[j]; const e = 1 / (1 + Math.exp(-z)) - ys[i]; for (let j = 0; j < K; j++) if (x[j]) g[j] += e * x[j]; }
      for (let j = 0; j < K; j++) { const gj = g[j] / N + (j ? 1e-3 * w[j] : 0); m[j] = 0.9 * m[j] + 0.1 * gj; v[j] = 0.999 * v[j] + 0.001 * gj * gj; w[j] -= 0.05 * (m[j] / (1 - 0.9 ** it)) / (Math.sqrt(v[j] / (1 - 0.999 ** it)) + 1e-8); } }
    const pts = {}; keys.forEach((k, j) => { pts[k] = Math.round(w[j + 1] / 0.35); });
    return { n: N, pts };
  }

  // ---------------- swing (7 sessions): same walk as research/swing.js
  function trade(S, t, { H = 7, stopPct = null, cost = COST } = {}) {
    const n = S.C.length, e = t + 1; if (e >= n) return null; if (S.UQ[e]) return { skip: true };
    const entry = S.C[e], stop = stopPct ? entry * (1 - stopPct) : null;
    for (let d = e + 1; d < n; d++) { const locked = S.LOCK[d];
      if (stop !== null && !locked) { if (S.O[d] <= stop) return done(S.O[d], d, 'stop'); if (S.L[d] <= stop) return done(stop, d, 'stop'); }
      if (d - e >= H && !locked) return done(S.C[d], d, 'time'); }
    return null;
    function done(px, d, why) { return { entry, gross: px / entry - 1, ret: px / entry - 1 - cost, days: d - e, why, entryDay: S.d[e], exitDay: S.d[d], val: S.VAL ? S.VAL[e] : null }; }
  }
  const gateF = (thr = 0.10, win = 20) => r => { const T = win === 20 ? r.T20 : win === 10 ? r.T10 : r.T40; return T !== null && T > thr && (r.T1 ?? -1) >= 0; };
  const symRule = r => r.sit === 'D' && !r.upQ && !r.dnQ && !(r.rsi > 80) && !(r.r20b > 0.4);
  function swingTrades(R, series, { H = 7, stopK = 2, minStop = 0.02, gate = gateF(), extra = () => true, cost = COST, from = 1396 } = {}) {
    const T = [];
    for (const r of R) { if (jy(r) < from || !symRule(r) || !gate(r) || !extra(r)) continue;
      const sp = stopK ? Math.max(minStop, stopK * (r.atr || 0.03)) : null; const x = trade(series[r.s], r.ti, { H, stopPct: sp, cost });
      if (x && !x.skip) T.push({ ...x, s: r.s, y: jy(r), d: r.d, stopPct: sp, weak: r.lmc < -1 }); }
    return T;
  }
  function tstats(T, L = 20) {
    if (!T.length) return { n: 0 };
    const st = boot(T, { mean: [x => x.ret, x => 1], win: ind(x => x.ret > 0) }, { L });
    return { n: T.length, mean: P(st, 'mean'), win: P(st, 'win'), med: pc(med(T.map(x => x.ret))), stop: pc(T.filter(x => x.why === 'stop').length / T.length), days: st.mean.days };
  }
  function byYear(T, years) { return Object.fromEntries(years.map(y => { const a = T.filter(x => x.y === y); return [y, a.length ? [a.length, pc(mean(a.map(x => x.ret))), pc(a.filter(x => x.ret > 0).length / a.length)] : [0]]; })); }
  // risk-sized book: each trade risks `risk` of capital at its stop, max `slots` open, one per symbol; P&L booked at exit
  function book(T, { slots = 3, risk = 0.01, weakFirst = true } = {}) {
    const sorted = T.slice().sort((a, b) => a.entryDay - b.entryDay || (weakFirst ? (b.weak - a.weak) : 0));
    const open = [], taken = []; let eq = 1, peak = 1, dd = 0; const ev = [];
    const close = upto => { for (let i = open.length - 1; i >= 0; i--) if (open[i].exitDay < upto) { const x = open[i]; ev.push([x.exitDay, x.pnl]); open.splice(i, 1); } };
    for (const x of sorted) { close(x.entryDay); if (open.length >= slots || open.some(o => o.s === x.s)) continue;
      const w = Math.min(risk / x.stopPct, 1 / slots * 1.5); x.w = w; x.pnl = w * x.ret; open.push(x); taken.push(x); }
    close(Infinity);
    ev.sort((a, b) => a[0] - b[0]); const byDay = new Map(); ev.forEach(([d, p]) => byDay.set(d, (byDay.get(d) || 0) + p));
    let worstDay = 0; const yr = {};
    const jf = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric' });
    for (const [d, p] of [...byDay.entries()].sort((a, b) => a[0] - b[0])) { eq *= 1 + p; peak = Math.max(peak, eq); dd = Math.min(dd, eq / peak - 1); worstDay = Math.min(worstDay, p);
      const t = String(d), y = +jf.format(new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8)))).replace(/\D/g, ''); yr[y] = (yr[y] || 1) * (1 + p); }
    // clustered stops: largest loss realised within any 7 trading days window (approx by calendar 10 days)
    const evs = [...byDay.entries()].sort((a, b) => a[0] - b[0]); let worst10 = 0;
    const toT = d => { const t = String(d); return Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8)); };
    for (let i = 0; i < evs.length; i++) { let s = 0; for (let k = i; k < evs.length && toT(evs[k][0]) - toT(evs[i][0]) <= 10 * 864e5; k++) s += Math.min(0, evs[k][1]); worst10 = Math.min(worst10, s); }
    return { trades: taken.length, final: pc(eq - 1), maxDD: pc(dd), worstDay: pc(worstDay), worst10d: pc(worst10), byYear: Object.fromEntries(Object.entries(yr).map(([y, v]) => [y, pc(v - 1)])), avgW: pc(mean(taken.map(x => x.w))), avgStop: pc(mean(taken.map(x => x.stopPct))),
      Rmean: r1(mean(taken.map(x => x.ret / x.stopPct)) * 100) / 100 };
  }
  function swing(R, series) {
    const Y = [1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403, 1404, 1405];
    const base = swingTrades(R, series);
    const tr = base.filter(x => x.y >= 1397 && x.y <= 1402), te = base.filter(x => x.y >= 1403);
    const out = { rule7: { years: byYear(base, Y), train: tstats(tr), test: tstats(te), all9: tstats(base.filter(x => x.y >= 1397)) } };
    const wk = base.filter(x => x.weak); out.weak7 = { years: byYear(wk, Y), train: tstats(wk.filter(x => x.y <= 1402 && x.y >= 1397)), test: tstats(wk.filter(x => x.y >= 1403)) };
    for (const H of [3, 5]) { const T = swingTrades(R, series, { H }); out['rule' + H] = { years: byYear(T, Y), train: tstats(T.filter(x => x.y <= 1402 && x.y >= 1397)), test: tstats(T.filter(x => x.y >= 1403)) }; }
    const ng = swingTrades(R, series, { gate: () => true }); out.nogate = { years: byYear(ng, Y), train: tstats(ng.filter(x => x.y <= 1402 && x.y >= 1397)), test: tstats(ng.filter(x => x.y >= 1403)) };
    // collector uses min stop 3%: effect
    const m3 = swingTrades(R, series, { minStop: 0.03 }); out.minstop3 = { train: tstats(m3.filter(x => x.y <= 1402 && x.y >= 1397)), test: tstats(m3.filter(x => x.y >= 1403)) };
    // cost sensitivity (on the same trades, gross − cost)
    out.cost = {}; for (const c of [0.01, 0.0125, 0.015, 0.02, 0.025]) { const f = a => a.map(x => ({ ...x, ret: x.gross - c })); out.cost[c] = { train: tstats(f(tr)), test: tstats(f(te)), years_pos: Y.filter(y => y >= 1397).filter(y => { const a = f(base.filter(x => x.y === y)); return a.length && mean(a.map(x => x.ret)) > 0; }).length };
      const w = f(wk); out.cost[c].weak_test = tstats(w.filter(x => x.y >= 1403)); }
    // gate grid (threshold × window): train and test means
    out.gate = {}; for (const win of [10, 20, 40]) for (const thr of [0.05, 0.075, 0.10, 0.125, 0.15]) { const T = swingTrades(R, series, { gate: gateF(thr, win) });
      const a = T.filter(x => x.y <= 1402 && x.y >= 1397), b = T.filter(x => x.y >= 1403);
      out.gate[win + '|' + thr] = [a.length, pc(mean(a.map(x => x.ret))), b.length, pc(mean(b.map(x => x.ret))), Y.filter(y => y >= 1397).filter(y => { const q = T.filter(x => x.y === y); return q.length && mean(q.map(x => x.ret)) > 0; }).length]; }
    // risk books
    out.book = { r1_3slots: book(base.filter(x => x.y >= 1397), { risk: 0.01 }), r067_3slots: book(base.filter(x => x.y >= 1397), { risk: 0.0067 }) };
    // concurrent positions: how often 2+ of the open trades stopped out in the same 10 days
    out.gross_q = (() => { const g = base.filter(x => x.y >= 1397).map(x => x.gross).sort((a, b) => a - b); const q = p => pc(g[Math.floor(p * g.length)]); return [q(0.1), q(0.25), q(0.5), q(0.75), q(0.9)]; })();
    out.liquidity_bn_toman_median_entry_value = r1(med(base.filter(x => x.y >= 1403 && x.val).map(x => x.val / 1e10)));
    out.gate_open_share = Object.fromEntries(Y.map(y => { const a = R.filter(r => jy(r) === y && r.s === 'شپنا'); return [y, pc(a.filter(gateF()).length / Math.max(1, a.length))]; }));
    return out;
  }
  return { boot, nextSession, calls, fitPoints, swing, swingTrades, book, tstats, score24, band7, V24, ON, gateF, symRule, reseed, mean, med, pc, jy, cls, P, ind };
})();
'AN ready';

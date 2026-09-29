/* ==========================================================================
   research/model.js — next-session models for the refiners, compared walk-forward
   A  = v2.3 as shipped (group-44 table, regime × band)
   B  = same v2.3 score, table re-estimated on the refiners (regime × band)
   C  = v2.4 integer score (new rows) + table by band (and regime)
   D  = logistic regression on the same inputs (reference upper bound)
   Walk-forward: for test year Y the model only sees rows of years < Y (from 1392).
   ========================================================================== */
const PM = (() => {
  const jy = r => +r.j.slice(0, 4);
  const mean = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  const tsv = rows => rows.map(r => r.join('\t')).join('\n');
  const f2 = x => x === null || x === undefined || !isFinite(x) ? '-' : (Math.round(x * 100) / 100).toFixed(2);
  const up = r => r.r1 > 0 ? 1 : 0;

  // inputs shared by C and D (all known at the close of day t)
  const FEATS = [
    ['smart', r => r.pts.smart ? 1 : 0], ['bp2', r => r.pts.bp2 ? 1 : 0], ['bp05', r => r.pts.bp05 ? 1 : 0],
    ['buyq', r => r.upQ ? 1 : 0], ['sellq', r => r.dnQ ? 1 : 0], ['strong', r => r.pts.strong ? 1 : 0], ['weak', r => r.pts.weak ? 1 : 0],
    ['rsi30', r => r.pts.rsi30 ? 1 : 0], ['boll', r => r.pts.boll ? 1 : 0],
    ['buyq_run2', r => r.upQ && r.upRun >= 2 ? 1 : 0], ['sellq_run2', r => r.dnQ && r.dnRun >= 2 ? 1 : 0],
    ['buyq_lowvol', r => r.upQ && r.volr !== null && r.volr < 0.7 ? 1 : 0], ['sellq_lowvol', r => r.dnQ && r.volr !== null && r.volr < 0.7 ? 1 : 0],
    ['after_buyq', r => !r.upQ && !r.dnQ && r.upRun >= 1 ? 1 : 0], ['after_sellq', r => !r.upQ && !r.dnQ && r.dnRun >= 1 ? 1 : 0],
    ['grp_buyq50', r => r.gQup >= 0.5 ? 1 : 0], ['grp_sellq50', r => r.gQdn >= 0.5 ? 1 : 0], ['grp_up70', r => r.gUp >= 0.7 ? 1 : 0], ['grp_up30', r => r.gUp !== null && r.gUp <= 0.3 ? 1 : 0],
    ['total_up1', r => r.T1 > 0.01 ? 1 : 0], ['total_dn1', r => r.T1 < -0.01 ? 1 : 0],
    ['oversold20', r => r.r20b < -0.15 ? 1 : 0], ['drop_noq', r => r.chg < -2 && !r.dnQ ? 1 : 0], ['below_sma50', r => r.sma50 < -0.10 ? 1 : 0],
    ['vol_low', r => r.volr !== null && r.volr < 0.5 ? 1 : 0], ['vol_high', r => r.volr > 2 ? 1 : 0],
    ['wide_range', r => r.lu >= 0.06 ? 1 : 0], ['hot', r => r.regime === 'hot' ? 1 : 0], ['cold', r => r.regime === 'cold' ? 1 : 0]];
  const X = r => FEATS.map(([, f]) => f(r));

  // logistic regression (full-batch Adam, L2)
  function logit(rows, { iters = 400, l2 = 1e-3, lr = 0.05 } = {}) {
    const k = FEATS.length + 1, w = new Array(k).fill(0), m = new Array(k).fill(0), v = new Array(k).fill(0);
    const xs = rows.map(r => [1, ...X(r)]), ys = rows.map(up), N = rows.length;
    for (let it = 1; it <= iters; it++) {
      const g = new Array(k).fill(0);
      for (let i = 0; i < N; i++) { const x = xs[i]; let z = 0; for (let j = 0; j < k; j++) z += w[j] * x[j]; const p = 1 / (1 + Math.exp(-z)), e = p - ys[i]; for (let j = 0; j < k; j++) if (x[j]) g[j] += e * x[j]; }
      for (let j = 0; j < k; j++) { const gj = g[j] / N + (j ? l2 * w[j] : 0); m[j] = 0.9 * m[j] + 0.1 * gj; v[j] = 0.999 * v[j] + 0.001 * gj * gj; w[j] -= lr * (m[j] / (1 - 0.9 ** it)) / (Math.sqrt(v[j] / (1 - 0.999 ** it)) + 1e-8); }
    }
    return { w, predict: r => { const x = [1, ...X(r)]; let z = 0; for (let j = 0; j < k; j++) z += w[j] * x[j]; return 1 / (1 + Math.exp(-z)); } };
  }
  // table with shrinkage toward a parent rate: p = (ups + m·prior) / (n + m)
  function table(rows, key, parentKey = null, m = 20) {
    const T = new Map(), Pn = new Map(); let U = 0, N = 0;
    rows.forEach(r => { const k = key(r); const e = T.get(k) || [0, 0]; e[0] += up(r); e[1]++; T.set(k, e); U += up(r); N++; if (parentKey) { const pk = parentKey(r); const q = Pn.get(pk) || [0, 0]; q[0] += up(r); q[1]++; Pn.set(pk, q); } });
    const g = N ? U / N : 0.5;
    const prior = r => { if (!parentKey) return g; const q = Pn.get(parentKey(r)); return q ? (q[0] + m * g) / (q[1] + m) : g; };
    return { T, predict: r => { const e = T.get(key(r)) || [0, 0]; return (e[0] + m * prior(r)) / (e[1] + m); } };
  }
  // v2.4 integer score from logistic weights (1 point ≈ 0.35 logit), rows whose weight rounds to 0 are dropped
  function points(w, unit = 0.35) { const P = {}; FEATS.forEach(([name], j) => { const p = Math.round(w[j + 1] / unit); if (p) P[name] = p; }); return P; }
  const scoreOf = (P, r) => FEATS.reduce((s, [name, f]) => s + (P[name] ? P[name] * f(r) : 0), 0);
  const sband = s => s <= -6 ? '<=-6' : s <= -4 ? '-5..-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : s <= 5 ? '+4..+5' : '>=+6';

  function auc(ps, ys) { const a = ps.map((p, i) => [p, ys[i]]).sort((x, y) => x[0] - y[0]); let rk = 0, sumPos = 0, nP = 0, nN = 0;
    for (let i = 0; i < a.length;) { let j = i; while (j < a.length && a[j][0] === a[i][0]) j++; const avgR = (i + j + 1) / 2; for (let k = i; k < j; k++) { if (a[k][1]) { sumPos += avgR; nP++; } else nN++; } i = j; }
    return nP && nN ? (sumPos - nP * (nP + 1) / 2) / (nP * nN) : null; }
  // metrics of one model on a set of rows: Brier, AUC, confident calls and what they were worth
  function metrics(rows, p) {
    const ps = rows.map(p), ys = rows.map(up);
    const brier = mean(ps.map((q, i) => (ys[i] - q) ** 2));
    const confUp = rows.filter((r, i) => ps[i] >= 0.65), confDn = rows.filter((r, i) => ps[i] <= 0.35);
    const acc = (a, s) => a.length ? Math.round(100 * a.filter(r => s > 0 ? r.r1 > 0 : r.r1 < 0).length / a.length) : null;
    // (i) act before today's close at ~today's price, exit next day: impossible if today is a queue on your side
    const exI = confUp.filter(r => !r.upQ), exIs = confDn.filter(r => !r.dnQ);
    // (ii) act tomorrow at tomorrow's average price (پایانی), exit the day after; impossible if tomorrow is a queue on your side
    const exII = confUp.filter(r => r.nxUpQ === false && r.tr1 !== null);
    return { n: rows.length, brier, auc: auc(ps, ys), upN: confUp.length, upAcc: acc(confUp, 1), dnN: confDn.length, dnAcc: acc(confDn, -1),
      exI_n: exI.length, exI_acc: acc(exI, 1), exI_r1: exI.length ? 100 * mean(exI.map(r => r.r1)) : null, exIs_n: exIs.length, exIs_acc: acc(exIs, -1),
      exII_n: exII.length, exII_ret: exII.length ? 100 * mean(exII.map(r => r.tr1)) : null, exII_up: exII.length ? Math.round(100 * exII.filter(r => r.tr1 > 0).length / exII.length) : null };
  }
  const HEAD = ['year', 'model', 'n', 'Brier', 'AUC', 'up calls', 'up right%', 'down calls', 'down right%', 'buy today (no queue) n', 'right%', 'r1%', 'sell today n', 'right%', 'buy tomorrow n', 'trade%', 'trade up%'];
  const mline = (y, name, M) => [y, name, M.n, f2(M.brier), f2(M.auc), M.upN, M.upAcc, M.dnN, M.dnAcc, M.exI_n, M.exI_acc, f2(M.exI_r1), M.exIs_n, M.exIs_acc, M.exII_n, f2(M.exII_ret), M.exII_up];

  function walk(R, years = [1403, 1404, 1405], opt = {}) {
    const base = R.filter(r => r.sit === 'D' && r.regime && r.r1 !== null && jy(r) >= 1392);
    const out = [HEAD]; const fitted = {};
    for (const Y of years) {
      const tr = base.filter(r => jy(r) < Y), te = base.filter(r => jy(r) === Y);
      const B = table(tr, r => r.regime + '|' + r.band, r => r.band);
      const L = logit(tr, opt);
      const P = points(L.w); const trS = tr.map(r => ({ r, s: sband(scoreOf(P, r)) }));
      const Ct = table(tr, r => sband(scoreOf(P, r)));
      const Cr = table(tr, r => r.regime + '|' + sband(scoreOf(P, r)), r => sband(scoreOf(P, r)));
      fitted[Y] = { w: L.w, P, Ct, Cr };
      out.push(mline(Y, 'A v2.3', metrics(te, r => r.p1)));
      out.push(mline(Y, 'B v2.3 score, refiner table', metrics(te, B.predict)));
      out.push(mline(Y, 'C v2.4 points, table by band', metrics(te, Ct.predict)));
      out.push(mline(Y, 'C2 v2.4 points, regime×band', metrics(te, Cr.predict)));
      out.push(mline(Y, 'D logistic', metrics(te, L.predict)));
    }
    return { text: tsv(out), fitted };
  }
  return { FEATS, X, logit, table, points, scoreOf, sband, auc, metrics, walk, HEAD, mline, tsv, f2, mean, jy };
})();
if (typeof window !== 'undefined') window.PM = PM;

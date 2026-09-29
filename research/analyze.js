/* ==========================================================================
   research/analyze.js — reports on the replayed rows (research/engine.js)
   Every function returns plain text (tab separated) so it can be read back from the page.
   Conventions: r1 = next-day close-to-close (what the user sees the next day), tr1 = enter at next
   day's close, exit the day after (a trade that can really be done), oc1 = next day's open → close,
   r5 = 5 sessions. Percentages are rounded; "up" = share of cases with a positive move.
   ========================================================================== */
const PA = (() => {
  const pct = (a, b) => b ? Math.round(100 * a / b) : null;
  const mean = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  const f2 = x => x === null || x === undefined ? '-' : (Math.round(x * 100) / 100).toFixed(2);
  const jy = r => +r.j.slice(0, 4);
  const era = y => y <= 1396 ? '92-96' : y <= 1398 ? '97-98' : y <= 1400 ? '99-00' : y <= 1402 ? '01-02' : '03-05';
  const val = (a, k) => a.map(x => x[k]).filter(x => x !== null && x !== undefined && isFinite(x));
  const upRate = (a, k) => { const v = val(a, k); return v.length ? pct(v.filter(x => x > 0).length, v.length) : null; };
  const dnRate = (a, k) => { const v = val(a, k); return v.length ? pct(v.filter(x => x < 0).length, v.length) : null; };
  const avg = (a, k) => { const v = val(a, k); return v.length ? 100 * mean(v) : null; };
  const oc = r => (r.r1 !== null && r.o1 !== null) ? (1 + r.r1) / (1 + r.o1) - 1 : null;
  const group = (a, key) => { const m = new Map(); a.forEach(r => { const k = typeof key === 'function' ? key(r) : r[key]; const g = m.get(k) || []; g.push(r); m.set(k, g); }); return m; };
  const tsv = rows => rows.map(r => r.join('\t')).join('\n');

  // one line of outcome stats for a set of rows, seen from a BUY (side=+1) or SELL (side=-1) angle
  function line(a, side = 1) {
    a = a.filter(r => r.r1 !== null); a.forEach(r => { r.oc1 = oc(r); });
    const hit = side > 0 ? upRate(a, 'r1') : dnRate(a, 'r1');
    return [a.length, hit, f2(avg(a, 'r1')), f2(avg(a, 'o1')), f2(avg(a, 'oc1')), side > 0 ? upRate(a, 'tr1') : dnRate(a, 'tr1'), f2(avg(a, 'tr1')), side > 0 ? upRate(a, 'r5') : dnRate(a, 'r5'), f2(avg(a, 'r5'))];
  }
  const HEAD = ['n', 'hit1%', 'r1%', 'gap%', 'open→close%', 'hitTrade%', 'trade1%', 'hit5%', 'r5%'];

  // Report 1: the v2.3 decisions as they would have been made, per year
  function decisions(R, years) {
    const out = [['year', 'decision', ...HEAD]];
    for (const y of years) {
      const a = R.filter(r => jy(r) === y);
      for (const d of ['BUY', 'SELL', 'NO_EDGE', 'NA']) { const b = a.filter(r => r.dec === d); if (b.length) out.push([y, d, ...line(b, d === 'SELL' ? -1 : 1)]); }
    }
    return tsv(out);
  }
  // Report 2: calibration — the table's p1/p5 against what happened, by regime × band
  function calibration(R, filt = () => true) {
    const a = R.filter(r => r.sit === 'D' && r.regime && filt(r));
    const out = [['regime', 'band', 'n', 'p1 table', 'up1 real', 'down1 real', 'p5 table', 'up5 real', 'trade1 up', 'trade1 %']];
    for (const rg of ['hot', 'mid', 'cold']) for (const b of ['<=-4', '-3..-2', '-1..+1', '+2..+3', '>=+4']) {
      const g = a.filter(r => r.regime === rg && r.band === b && r.r1 !== null); if (!g.length) continue;
      out.push([rg, b, g.length, Math.round(100 * g[0].p1), upRate(g, 'r1'), dnRate(g, 'r1'), Math.round(100 * g[0].p5), upRate(g, 'r5'), upRate(g, 'tr1'), f2(avg(g, 'tr1'))]);
    }
    const bs = (k, pk) => { const g = a.filter(r => r[k] !== null && r[pk] !== null); return g.length ? mean(g.map(r => ((r[k] > 0 ? 1 : 0) - r[pk]) ** 2)) : null; };
    const base = (k, bk) => { const g = a.filter(r => r[k] !== null && r[bk] !== null); return g.length ? mean(g.map(r => ((r[k] > 0 ? 1 : 0) - r[bk]) ** 2)) : null; };
    out.push(['Brier 1d', 'table', f2(bs('r1', 'p1')), 'base-rate only', f2(base('r1', 'b1'))]);
    out.push(['Brier 5d', 'table', f2(bs('r5', 'p5')), 'base-rate only', f2(base('r5', 'b5'))]);
    return tsv(out);
  }
  // the rubric rows one by one: when the row fires, what happened next day (and vs the other refiners)
  function components(R, filt = () => true) {
    const a = R.filter(r => r.sit === 'D' && r.r1 !== null && filt(r));
    const out = [['row', 'n', 'up1%', 'r1%', 'xs1%', 'r1-xs1%', 'gap%', 'trade1 up%', 'trade1%', 'up5%']];
    const all = a; out.push(['ALL', all.length, upRate(all, 'r1'), f2(avg(all, 'r1')), f2(avg(all, 'xs1')), '', f2(avg(all, 'o1')), upRate(all, 'tr1'), f2(avg(all, 'tr1')), upRate(all, 'r5')]);
    for (const k of Object.keys(a[0].pts)) { const g = a.filter(r => r.pts[k] !== 0); if (!g.length) continue; const ex = g.filter(r => r.xs1 !== null);
      out.push([k, g.length, upRate(g, 'r1'), f2(avg(g, 'r1')), f2(avg(ex, 'xs1')), f2(100 * mean(ex.map(r => r.r1 - r.xs1))), f2(avg(g, 'o1')), upRate(g, 'tr1'), f2(avg(g, 'tr1')), upRate(g, 'r5')]); }
    return tsv(out);
  }
  // automatic reason for a wrong call (first matching tag)
  function why(r, side) {
    const wrong = x => x !== null && (side > 0 ? x < 0 : x > 0);
    const tags = [];
    if (r.adjNext) tags.push('ADJ_NEXT');
    if (r.gapDays >= 4) tags.push('LONG_BREAK');
    if (r.xs1 !== null && wrong(r.xs1) && Math.abs(r.xs1) >= 0.01) tags.push('GROUP_MOVE');
    if (r.TN1 !== null && wrong(r.TN1) && Math.abs(r.TN1) >= 0.01) tags.push('MARKET_MOVE');
    if (r.o1 !== null && wrong(r.o1) && Math.abs(r.o1) >= 0.015) tags.push('GAP');
    if (side > 0 && r.upQ) tags.push('WAS_BUYQ');
    if (side < 0 && r.dnQ) tags.push('WAS_SELLQ');
    if (side > 0 && r.nxDnQ) tags.push('NEXT_SELLQ');
    if (side < 0 && r.nxUpQ) tags.push('NEXT_BUYQ');
    if (!tags.length) tags.push(Math.abs(r.r1) < 0.005 ? 'SMALL' : 'OWN');
    return tags;
  }
  function errors(R, filt, side) {
    const a = R.filter(r => r.r1 !== null && filt(r)), bad = a.filter(r => side > 0 ? r.r1 <= 0 : r.r1 >= 0);
    const cnt = new Map(); bad.forEach(r => { r.why = why(r, side); r.why.forEach(t => cnt.set(t, (cnt.get(t) || 0) + 1)); });
    const first = new Map(); bad.forEach(r => first.set(r.why[0], (first.get(r.why[0]) || 0) + 1));
    return tsv([['calls', a.length, 'wrong', bad.length, pct(bad.length, a.length) + '%'], ['tag', 'any (n)', 'any %', 'first (n)'],
      ...[...cnt.entries()].sort((x, y) => y[1] - x[1]).map(([t, n]) => [t, n, pct(n, bad.length), first.get(t) || 0])]);
  }
  function list(R, filt, cols, sortKey, k = 40) {
    const a = R.filter(filt).sort((x, y) => (typeof sortKey === 'function' ? sortKey(x) - sortKey(y) : 0)).slice(0, k);
    return tsv([cols.map(c => typeof c === 'string' ? c : c[0]), ...a.map(r => cols.map(c => { const v = typeof c === 'string' ? r[c] : c[1](r); return v === null || v === undefined ? '-' : typeof v === 'number' && Math.abs(v) < 1 && v !== 0 && !Number.isInteger(v) ? (100 * v).toFixed(1) : v; }))]);
  }
  return { decisions, calibration, components, errors, list, line, HEAD, why, group, upRate, dnRate, avg, mean, f2, jy, era, tsv, oc };
})();
if (typeof window !== 'undefined') window.PA = PA;

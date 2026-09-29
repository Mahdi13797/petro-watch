/* ==========================================================================
   research/codal_events.js — Codal letters of the refiners (full history from tsetmc's Codal API:
   Codal/GetPreparedDataByInsCode/5000/{insCode}) attached to the replay rows, and the event study.
   A letter is "overnight" for day t when it was published after 12:30 of day t and before 08:30 of the
   next session (the close of t has not seen it), and "today" when it came between 12:30 of the previous
   session and 12:30 of day t.
   ========================================================================== */
function pwAttachCodal(rows, CDL, classify) {
  const ts = s => { const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null; };
  const at = (dEv, hh, mm) => { const t = String(dEv); return Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), hh, mm); };
  const bySym = {}; rows.forEach(r => (bySym[r.s] ||= []).push(r));
  for (const [s, a] of Object.entries(bySym)) {
    const seen = new Set(); const L = (CDL[s] || []).filter(x => { if (seen.has(x[3])) return false; seen.add(x[3]); return true; })
      .map(x => ({ t: ts(x[0]), type: classify(x[2]), title: x[2] })).filter(x => x.t).sort((p, q) => p.t - q.t);
    a.sort((p, q) => p.d - q.d);
    let k = 0;
    for (let i = 0; i < a.length; i++) {
      const r = a[i], prevClose = i ? at(a[i - 1].d, 12, 30) : at(r.d, 0, 0) - 864e5, close = at(r.d, 12, 30), nextOpen = r.nd ? at(r.nd, 8, 30) : close + 20 * 3600e3;
      while (k < L.length && L[k].t <= prevClose) k++;
      const today = [], night = [];
      for (let q = k; q < L.length && L[q].t <= nextOpen; q++) (L[q].t <= close ? today : night).push(L[q].type);
      r.cdToday = today; r.cdNight = night;
    }
  }
  return rows;
}
// event study: for each letter type and timing, next-day move vs the table and vs the other refiners
function pwCodalStudy(rows, opt = {}) {
  const M = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null, f = x => x === null ? '-' : (100 * x).toFixed(2);
  const a = rows.filter(r => r.sit === 'D' && r.r1 !== null && r.p1 !== null && (opt.from ? r.j >= opt.from : true));
  const types = new Set(); a.forEach(r => { r.cdToday.forEach(t => types.add(t)); r.cdNight.forEach(t => types.add(t)); });
  const out = [['type', 'when', 'n', 'up1%', 'table p1%', 'resid pp', 'r1-others %', 'r5-others %', 'rL5 net %', 'in buyQ n', 'buyQ up1%', 'buyQ r1-others']];
  for (const ty of [...types].sort()) for (const w of ['cdNight', 'cdToday']) {
    const g = a.filter(r => r[w].includes(ty)); if (g.length < (opt.min || 25)) continue;
    const gx = g.filter(r => r.xs1 !== null), g5 = g.filter(r => r.xs5 !== null && r.r5 !== null), gl = g.filter(r => r.rL5 !== null), q = g.filter(r => r.upQ), qx = q.filter(r => r.xs1 !== null);
    out.push([ty, w === 'cdNight' ? 'overnight' : 'today', g.length, Math.round(100 * g.filter(r => r.r1 > 0).length / g.length), Math.round(100 * M(g.map(r => r.p1))), f(M(g.map(r => (r.r1 > 0 ? 1 : 0) - r.p1))),
      f(M(gx.map(r => r.r1 - r.xs1))), f(M(g5.map(r => r.r5 - r.xs5))), f(M(gl.map(r => r.rL5 - 0.0125))), q.length, q.length ? Math.round(100 * q.filter(r => r.r1 > 0).length / q.length) : '-', f(M(qx.map(r => r.r1 - r.xs1)))]);
  }
  return out.map(r => r.join('\t')).join('\n');
}
if (typeof window !== 'undefined') { window.pwAttachCodal = pwAttachCodal; window.pwCodalStudy = pwCodalStudy; }

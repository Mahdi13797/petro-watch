/* ==========================================================================
   report.js — برنامهٔ روزانهٔ یک فهرست نماد (PetroWatch.report)
   Runs in the user's browser (tsetmc / codal need an Iranian connection): snapshots every symbol, applies the
   simple-plan rules (planOf), a light Codal check for model signals, ranks the symbols for the next session and
   keeps the full chart data of the top two. The result is packed (gzip + base64, 1800-char chunks with an
   FNV-1a checksum each) so a cloud session can copy it out with short javascript calls and rebuild it with
   report/build.mjs into one self-contained HTML page.
   API: run(symbols, opts) → starts in the background · status() · chunk(i) · payload() · start(symbols, opts) → Promise
   ========================================================================== */
function pwMakeReport(PC, planOf, net) {
  const fetchJ = net && net.fetch ? net.fetch : fetch;
  const st = { state: 'idle', note: '', done: 0, total: 0, payload: null, lines: null, err: null, t0: 0 };
  const fa = s => String(s == null ? '' : s).replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const R = (x, d = 2) => (typeof x === 'number' && isFinite(x)) ? Math.round(x * 10 ** d) / 10 ** d : null;
  const tehranInt = (daysAgo = 0) => +new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.now() - daysAgo * 864e5)).replace(/\D/g, '');
  const jalLatin = dt => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\d/]/g, '');
  const toDig = s => String(s || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
  const CODAL_PTS = { AGM_DECISION: -1, BOARD_CEO_CHANGE: -1, SHUTDOWN: -1, RUMOR_CLARIFY: -1, CAPINC_PROPOSAL: 1, CAPINC_STEP: 1 };
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };

  // one Codal search call for the last 8 days, paced by the caller (search.codal.ir answers bursts with 429)
  async function lightCodal(sym) {
    const from = jalLatin(new Date(Date.now() - 8 * 864e5)), to = jalLatin(new Date());
    const u = 'https://search.codal.ir/api/search/v2/q?&Audit=true&AuditorRef=-1&Category=-1&Childs=true&CompanyState=-1&CompanyType=-1&Consolidatable=true&IsNotAudited=false&Length=-1&LetterType=-1&Mains=true&NotAudited=true&NotConsolidatable=true&Publisher=false&TracingNo=-1&search=true&PageNumber=1&Symbol=' + encodeURIComponent(fa(sym)) + '&FromDate=' + encodeURIComponent(from) + '&ToDate=' + encodeURIComponent(to);
    for (let i = 0; i < 2; i++) {
      try { const r = await fetchJ(u); if (r.ok) { const j = await r.json(); return { ok: true, letters: j.Letters || [] }; } if (r.status !== 429) return { ok: false, why: 'HTTP ' + r.status }; } catch (e) { return { ok: false, why: String(e.message || e) }; }
      if (i === 0) await sleep(60000);
    }
    return { ok: false, why: '429' };
  }
  function codalPoints(letters) {
    const recent = new Set(Array.from({ length: 8 }, (_, k) => jalLatin(new Date(Date.now() - k * 864e5))));
    const seen = new Set(), hits = []; let pts = 0;
    letters.forEach(l => { const d = toDig(l.PublishDateTime).slice(0, 10); if (!recent.has(d)) return; const ty = (PC.codalClassify || (() => 'OTHER'))(l.Title);
      if (!(ty in CODAL_PTS)) return; hits.push({ type: ty, title: fa(l.Title), published: toDig(l.PublishDateTime), pts: CODAL_PTS[ty] }); if (!seen.has(ty)) { seen.add(ty); pts += CODAL_PTS[ty]; } });
    return { pts, hits, review: hits.some(h => h.type === 'BOARD_CEO_CHANGE') };
  }
  const nextSession = dInt => { const s = String(dInt); const d = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); do { d.setUTCDate(d.getUTCDate() + 1); } while ([4, 5].includes(d.getUTCDay())); return +d.toISOString().slice(0, 10).replace(/-/g, ''); };
  // OHLC as deltas (date and prices vs the previous bar's close, volume in thousands): about 40% smaller after gzip
  const packOHLC = a => ({ k: 'delta1', v: a.map((r, i) => { const p = a[i - 1]; return p ? [r[0] - p[0], r[1] - p[4], r[2] - p[4], r[3] - p[4], r[4] - p[4], Math.round(r[5] / 1000)] : [r[0], r[1], r[2], r[3], r[4], Math.round(r[5] / 1000)]; }) });
  const cal5 = r => { const c = (r && r.calibration_for_this_band) || {}; return (typeof c.p_up_5d === 'number' && typeof c.avg_gain_5d_pct === 'number' && typeof c.avg_loss_5d_pct === 'number') ? c.p_up_5d * c.avg_gain_5d_pct + (1 - c.p_up_5d) * c.avg_loss_5d_pct : null; };

  async function start(symbols, opts = {}) {
    if (st.state === 'running') return st;
    Object.assign(st, { state: 'running', note: '', done: 0, total: symbols.length, payload: null, lines: null, err: null, t0: Date.now() });
    try {
      const syms = symbols.map(fa), snaps = {};
      // 1) snapshots, two at a time (tsetmc refuses long bursts)
      let k = 0;
      const worker = async () => { while (k < syms.length) { const s = syms[k++]; st.note = s; let r = null;
        for (let a = 0; a < 2 && !(r && !r.error); a++) { try { r = await PC.petroSnapshot(s); } catch (e) { r = { error: String(e.message || e) }; } if (r && r.error && a === 0) await sleep(3000); }
        snaps[s] = r; st.done++; } };
      await Promise.all([worker(), worker()]);
      const today = tehranInt(0);
      const live = syms.map(s => snaps[s]).filter(t => t && !t.error && t.daily && /^مجاز/.test(fa(t.instrument && t.instrument.state)));
      const withToday = live.filter(t => t.daily.date === today).length;
      const lastDate = Math.max(0, ...live.map(t => t.daily.date || 0));
      // 2) plan rows with the model rules
      const rows = syms.map(s => {
        const t = snaps[s];
        if (!t || t.error) return { sym: s, error: (t && t.error) || 'داده نیامد' };
        const p = planOf(t, null), d = t.daily || {}, r = t.rubric || {};
        return { sym: s, name: fa(t.instrument && t.instrument.name), state: fa(t.instrument && t.instrument.state), ipo: !!t.ipo, tradable: p.tradable, date: d.date,
          close: d.close, last: d.last, chg_close_pct: d.chg_close_pct, high: d.high, atr_pct: d.atr_pct, value_today: d.value_today,
          queue_buy: !!d.closed_at_upper_limit, queue_sell: !!d.closed_at_lower_limit, score: r.subtotal_without_codal || 0, band: r.band_without_codal,
          regime: r.regime || (t.group && t.group.regime), situation: p.situation, signal_blocked: p.signal_blocked || null,
          adjusted_recently: (d.adjustments_last_year || []).filter(a => a[0] >= tehranInt(7)).map(a => a[1]), ev5: p.situation === 'D' ? R(cal5(r), 2) : null, p_up_5d: r.calibration_for_this_band && r.calibration_for_this_band.p_up_5d,
          calib_group_ok: r.calibration_applies_to_this_group !== false, plan: p, codal: null };
      });
      // 3) light Codal check for model signals only (5 s apart; one retry after 60 s on 429)
      if (opts.codal !== false) {
        const sig = rows.filter(x => !x.error && x.tradable && x.situation === 'D' && Math.abs(x.score) >= 4);
        for (let i = 0; i < sig.length; i++) { const x = sig[i]; st.note = 'کدال ' + x.sym; if (i) await sleep(5000);
          const c = await lightCodal(x.sym);
          if (!c.ok) { x.codal = { checked: false, why: c.why }; continue; }
          const cp = codalPoints(c.letters); x.codal = { checked: true, pts: cp.pts, hits: cp.hits, review: cp.review };
          if (cp.pts) { const t = snaps[x.sym]; x.plan = planOf({ ...t, rubric: { ...t.rubric, subtotal_without_codal: x.score + cp.pts } }, null); x.score_with_codal = x.score + cp.pts; } }
      }
      // 4) buy-signal sizes: scale down together if they add up to more than 100% of capital
      const buys = rows.filter(x => x.plan && x.plan.signal && x.plan.signal.side === 'buy'), tot = buys.reduce((a, x) => a + x.plan.signal.size, 0);
      if (tot > 100) buys.forEach(x => { x.plan.signal.size = x.plan.signal.size * 100 / tot; x.size_scaled = true; });
      // 5) importance for the next session: model buy signal > trigger reachable tomorrow > the rest; then expected 5-day return; then distance to the trigger
      rows.forEach(x => { if (x.error || !x.tradable) { x.prio = 0; return; }
        const pl = x.plan, sell = pl.signal && pl.signal.side === 'sell';
        x.dist_to_trigger_pct = pl.trigger && x.close ? R(100 * (pl.trigger.level / x.close - 1), 2) : null;
        // outside the normal situation (reopening after an adjustment, short history) the model has no edge estimate: lowest priority
        x.prio = sell ? 0 : x.situation !== 'D' ? 1 : pl.signal && pl.signal.side === 'buy' ? 3 : pl.trigger && pl.trigger.reachableTomorrow ? 2 : 1; });
      const ranked = rows.filter(x => x.prio > 0).sort((a, b) => b.prio - a.prio || (b.ev5 ?? -99) - (a.ev5 ?? -99) || (a.dist_to_trigger_pct ?? 99) - (b.dist_to_trigger_pct ?? 99) || (b.value_today || 0) - (a.value_today || 0));
      ranked.forEach((x, i) => { x.rank = i + 1; });
      const topN = opts.top || 2, top = ranked.slice(0, topN).map(x => {
        const t = snaps[x.sym], tk = t.technical || {};
        return { sym: x.sym, name: x.name, daily: t.daily, trend: t.trend, chart: t.chart && { structure: t.chart.structure, nearest_support: t.chart.nearest_support, nearest_resistance: t.chart.nearest_resistance, levels_sorted_high_to_low: t.chart.levels_sorted_high_to_low },
          technical: { ...tk, ohlc_daily: packOHLC((tk.ohlc_daily || []).slice(-(opts.bars || 260))), ohlc_weekly: packOHLC((tk.ohlc_weekly || []).slice(-(opts.weeks || 60))) },
          rubric: t.rubric && { points: t.rubric.points, subtotal_without_codal: t.rubric.subtotal_without_codal, band_without_codal: t.rubric.band_without_codal, calibration_for_this_band: t.rubric.calibration_for_this_band,
            base_rate_this_regime: t.rubric.base_rate_this_regime, edge_vs_base_5d_pp: t.rubric.edge_vs_base_5d_pp, regime: t.rubric.regime, calibration_applies_to_this_group: t.rubric.calibration_applies_to_this_group, applicable: t.rubric.applicable },
          group: t.group && { regime: t.group.regime, sector_code: t.group.sector_code, sector_name: t.group.sector_name, r20: (t.group.group_index || t.group.chem44_index || {}).r20 },
          flows: t.flows && { buyer_power_today: t.flows.buyer_power_today, per_capita_buy_vs_60d_median: t.flows.per_capita_buy_vs_60d_median, indiv_net_today_pct_of_value: t.flows.indiv_net_today_pct_of_value, indiv_net_5d_pct: t.flows.indiv_net_5d_pct },
          warnings: t.warnings };
      });
      st.payload = { v: 1, tool: 'petro-watch-report', generated_at: new Date().toISOString(), today, last_trading_date: lastDate, session_date: nextSession(today),
        no_session_today: live.length > 0 && withToday * 2 < live.length, symbols: syms, label: opts.label || null, rows, top, ranking_rule: 'buy signal > trigger reachable tomorrow > rest; then expected 5-day return from the calibration table; then distance to trigger' };
      // 6) pack: gzip + base64 in 1800-char chunks, each with an FNV-1a checksum
      const json = JSON.stringify(st.payload); let fmt = 'j', b64;
      try { const gz = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip')); const buf = new Uint8Array(await new Response(gz).arrayBuffer());
        let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000)); b64 = btoa(bin); fmt = 'z';
      } catch (e) { b64 = btoa(unescape(encodeURIComponent(json))); }
      const size = 1800, n = Math.ceil(b64.length / size);
      st.lines = Array.from({ length: n }, (_, i) => { const c = b64.slice(i * size, (i + 1) * size); return `${i + 1}/${n} ${fmt} ${fnv(c)} ${c}`; });
      st.state = 'done'; st.note = '';
    } catch (e) { st.state = 'error'; st.err = String((e && e.message) || e); }
    return st;
  }
  function status() {
    const sec = st.t0 ? Math.round((Date.now() - st.t0) / 1000) : 0;
    if (st.state === 'running') return `running ${st.done}/${st.total} ${st.note} ${sec}s`;
    if (st.state === 'error') return 'error ' + st.err;
    if (st.state !== 'done') return 'idle';
    const p = st.payload;
    return `done chunks=${st.lines.length} no_session_today=${p.no_session_today} session=${p.session_date} top=${p.top.map(x => x.sym).join(',')} errors=${p.rows.filter(x => x.error).map(x => x.sym).join(',') || '-'} ${sec}s`;
  }
  return { run(symbols, opts) { start(symbols, opts); return 'started'; }, start, status, chunk: i => (st.lines && st.lines[i - 1]) || '', chunks: () => st.lines || [], payload: () => st.payload, lightCodal, codalPoints };
}

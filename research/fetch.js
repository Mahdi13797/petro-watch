/* ==========================================================================
   research/fetch.js — collects everything the replay engine needs, in a tab on tsetmc.com
   window.__PW  = { sym: {...}, idx: {...} }          daily prices, flows, indices (research/engine.js input)
   window.__TH  = { bourse: {date: ...}, fara: {...} } real daily price limits of one reference stock per market
   window.__CDL = { sym: [[publishTime, dEven, title, tracingNo]...] }   Codal letters from tsetmc
   window.__USD = [[dEven, close]...]                   free-market dollar (tgju)
   Usage: pwFetchAll().then(s => ...)  ·  progress in window.__PWF
   ========================================================================== */
const PW_REFINERS = { 'شپنا': ['7745894403636165'], 'شتران': ['51617145873056483', '34066377223628725'], 'شبندر': ['35366681030756042'], 'شبریز': ['48753732042176709'],
  'شسپا': ['49188729526980541'], 'شراز': ['14031158866706953', '33683240001985963'], 'شاوان': ['60247433951600827'], 'شرانل': ['44013656953678055'],
  'شنفت': ['14073782708315535'], 'شپاس': ['35178706978554988'], 'شبهرن': ['22667016906590506'] };
async function pwFetchAll(opt = {}) {
  const B = 'https://cdn.tsetmc.com/api/', sleep = ms => new Promise(r => setTimeout(r, ms));
  const P = window.__PWF = { stage: 'prices', done: 0, err: 0 };
  const J = async u => { for (let i = 0; i < 5; i++) { try { const r = await fetch(B + u); if (r.ok) return await r.json(); } catch (e) { /* retry */ } await sleep(1200 * (i + 1)); } P.err++; return null; };
  const out = { sym: {}, idx: {} };
  for (const [s, ics] of Object.entries(PW_REFINERS)) { out.sym[s] = [];
    for (const ic of ics) { const [d, c, inf] = await Promise.all([J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`), J(`ClientType/GetClientTypeHistory/${ic}`), J(`Instrument/GetInstrumentInfo/${ic}`)]);
      out.sym[s].push({ ic, info: inf?.instrumentInfo ? { sector: inf.instrumentInfo.sector, zTitad: inf.instrumentInfo.zTitad, flow: inf.instrumentInfo.flow } : null,
        d: (d?.closingPriceDaily || []).map(r => [r.dEven, r.priceFirst, r.priceMax, r.priceMin, r.pDrCotVal, r.pClosing, r.priceYesterday, r.qTotTran5J, r.qTotCap, r.zTotTran]),
        c: (c?.clientType || []).map(r => [r.recDate, r.buy_I_Volume, r.sell_I_Volume, r.buy_N_Volume, r.sell_N_Volume, r.buy_I_Value, r.sell_I_Value, r.buy_N_Value, r.sell_N_Value, r.buy_I_Count, r.sell_I_Count, r.buy_N_Count, r.sell_N_Count]) });
      P.done++; } }
  for (const [k, ic] of Object.entries({ g23: '12331083953323969', total: '32097828799138957', eqw: '67130298613737946', g44: '33626672012415176' })) {
    const h = await J('Index/GetIndexB2History/' + ic); out.idx[k] = (h?.indexB2 || []).map(x => [x.dEven, x.xNivInuClMresIbs, x.xNivInuPbMresIbs, x.xNivInuPhMresIbs]); }
  window.__PW = out;
  // real price limits: one reference stock per market for every date
  P.stage = 'limits';
  const from = opt.from || 20130301, dates = new Set();
  Object.values(out.sym).forEach(a => a.forEach(ins => ins.d.forEach(r => { if (r[7] > 0 && r[0] >= from) dates.add(r[0]); })));
  const pick = (names, flow) => { const m = new Map(); names.forEach(s => (out.sym[s] || []).forEach(ins => { if ((ins.info?.flow) !== flow) return; ins.d.forEach(r => { if (r[7] > 0 && !m.has(r[0])) m.set(r[0], [ins.ic, r[6]]); }); })); return m; };
  const refB = pick(['شپنا', 'شبندر', 'شبریز'], 1), refF = pick(['شاوان', 'شپاس', 'شرانل', 'شراز'], 2);
  window.__TH = { bourse: {}, fara: {} };
  const tasks = []; [...dates].sort().forEach(d => { const b = refB.get(d), f = refF.get(d); if (b) tasks.push(['bourse', d, ...b]); if (f) tasks.push(['fara', d, ...f]); });
  P.total = tasks.length; P.done = 0;
  const worker = async () => { while (tasks.length) { const [mk, d, ic, y] = tasks.shift(); const j = await J(`MarketData/GetStaticThreshold/${ic}/${d}`);
    const recs = (j?.staticThreshold || []).filter(x => x.dEven === d).sort((a, b) => a.hEven - b.hEven); window.__TH[mk][d] = { y, recs: recs.map(x => [x.hEven, x.psGelStaMax, x.psGelStaMin]) }; P.done++; } };
  await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
  // Codal letters from tsetmc
  P.stage = 'codal'; window.__CDL = {};
  for (const [s, arr] of Object.entries(out.sym)) { window.__CDL[s] = [];
    for (const ins of arr) { const j = await J(`Codal/GetPreparedDataByInsCode/5000/${ins.ic}`); (j?.preparedData || []).forEach(x => window.__CDL[s].push([x.publishDateTime_Gregorian, x.publishDateTime_DEven, x.title, x.tracingNo])); } }
  // dollar
  P.stage = 'usd';
  try { const j = await fetch('https://api.tgju.org/v1/market/indicator/summary-table-data/price_dollar_rl').then(r => r.json()); const num = s => +String(s).replace(/,/g, '');
    window.__USD = j.data.map(x => [+x[6].replace(/\//g, ''), num(x[3])]).filter(x => x[1] > 0).sort((a, b) => a[0] - b[0]); } catch (e) { window.__USD = []; }
  P.stage = 'done';
  return { symbols: Object.keys(out.sym).length, limits: Object.keys(window.__TH.bourse).length + Object.keys(window.__TH.fara).length, errors: P.err };
}
if (typeof window !== 'undefined') { window.pwFetchAll = pwFetchAll; window.PW_REFINERS = PW_REFINERS; }

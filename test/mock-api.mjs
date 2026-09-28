// test/mock-api.mjs — synthetic tsetmc / codal responses for offline tests.
// All numbers are made up (seeded random). The symbol is «نمونه», which is not a real ticker.
const IC = '1234567890123456', SYM = 'نمونه', IX44 = '33626672012415176', IXT = '32097828799138957';

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const gauss = r => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const ymd = d => +`${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
const tehranToday = () => { const s = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); return new Date(s + 'T00:00:00Z'); };
const jal = (d, persianDigits = true) => { const s = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(d).replace(/[^\d/]/g, ''); return persianDigits ? s.replace(/\d/g, x => '۰۱۲۳۴۵۶۷۸۹'[x]) : s; };

function build() {
  const r = rng(1405);
  // trading days (Sat-Wed), oldest first; the last one is "today" if today trades
  const days = []; const t0 = tehranToday();
  for (let k = 0; days.length < 430; k++) { const d = new Date(t0.getTime() - k * 864e5); if (![4, 5].includes(d.getUTCDay())) days.unshift(d); }
  const today = days[days.length - 1];
  const rows = []; let p = 8000;
  days.forEach((d, i) => {
    let y = p;
    if (i === days.length - 140) y = Math.round(p * 0.88);           // AGM dividend adjustment
    const ret = Math.max(-0.03, Math.min(0.03, 0.0009 + 0.017 * gauss(r) + (i > days.length - 25 ? 0.004 : 0)));
    const c = Math.round(y * (1 + ret)); const last = i === days.length - 1 ? Math.round(c * 1.013) : Math.round(c * (1 + 0.006 * gauss(r)));
    const h = Math.round(Math.max(c, last, y) * (1 + 0.008 * r())), l = Math.round(Math.min(c, last, y) * (1 - 0.008 * r()));
    const o = Math.round(y * (1 + 0.01 * gauss(r))), v = Math.round(3e6 + 5e6 * r() * (i === days.length - 1 ? 2.2 : 1));
    rows.push({ dEven: ymd(d), priceFirst: o, priceMax: h, priceMin: l, pDrCotVal: last, pClosing: c, priceYesterday: y, qTotTran5J: v, qTotCap: v * c, zTotTran: 900 });
    p = c;
  });
  const flows = rows.map((x, i) => { const val = x.qTotCap, bi = val * (0.45 + 0.45 * r()), si = val * (0.45 + 0.45 * r());
    const smart = i === rows.length - 1; return { recDate: x.dEven, buy_I_Value: smart ? val * 0.92 : bi, sell_I_Value: smart ? val * 0.55 : si, buy_N_Value: val - (smart ? val * 0.92 : bi), sell_N_Value: val - (smart ? val * 0.55 : si),
      buy_I_Count: smart ? 260 : Math.round(600 + 900 * r()), sell_I_Count: smart ? 900 : Math.round(600 + 900 * r()) }; });
  const idx = (base, drift) => { let v = base; return days.map((d, i) => { v *= 1 + drift + 0.009 * gauss(r) + (i > days.length - 20 ? 0.003 : 0); return { dEven: ymd(d), xNivInuClMresIbs: Math.round(v) }; }); };
  const ix44 = idx(900000, 0.0007), ixT = idx(2400000, 0.0006);
  const peers = Array.from({ length: 24 }, (_, k) => { const py = 5000 + Math.round(20000 * r()), ch = 0.03 * (2 * r() - 1);
    return { insCode: String(900000000 + k), lva: 'همتا' + ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق'][k], csv: '44 ',
      qtc: Math.round(2e11 * r()), py, pcl: Math.round(py * (1 + ch)), pdv: Math.round(py * (1 + ch * 1.1)), pMax: Math.round(py * 1.03), pMin: Math.round(py * 0.97), blDs: [{ qmo: 1000, qmd: 1000 }] }; });
  return { days, today, rows, flows, ix44, ixT, peers, r };
}
const D = build();

function tsetmc(path) {
  const { rows, flows, today, ix44, ixT, peers } = D;
  const hist = rows.slice(0, -1), live = rows[rows.length - 1];
  if (path.startsWith('Instrument/GetInstrumentSearch/')) return { instrumentSearch: [{ insCode: IC, lVal18AFC: SYM, lVal30: 'پتروشيمي نمونه (داده ساختگي)', flow: 1, flowTitle: 'بازار اول (تابلوي اصلي) بورس', cgrValCot: 'N1' }] };
  if (path.startsWith('Instrument/GetInstrumentInfo/')) return { instrumentInfo: { lVal18AFC: SYM, eps: { estimatedEPS: 1150, sectorPE: 7.9 }, zTitad: 6e9, sector: { lSecVal: 'محصولات شيميايي' }, qTotTran5JAvg: 5.2e6, kAjCapValCpsIdx: 17,
    staticThreshold: { psGelStaMin: Math.round(live.priceYesterday * 0.97), psGelStaMax: Math.round(live.priceYesterday * 1.03) } } };
  if (path.startsWith('ClosingPrice/GetClosingPriceInfo/')) return { closingPriceInfo: { ...live, finalLastDate: live.dEven, instrumentState: { cEtavalTitle: 'مجاز' } } };
  if (path.startsWith('BestLimits/')) { const c = live.pDrCotVal; return { bestLimits: [0, 1, 2, 3, 4].map(k => ({ number: k + 1, zOrdMeDem: 20 - 3 * k, qTitMeDem: 40000 + 9000 * k, pMeDem: c - 10 * (k + 1), pMeOf: c + 10 * k, qTitMeOf: 25000 + 7000 * k, zOrdMeOf: 12 - 2 * k })) }; }
  if (path.startsWith('ClientType/GetClientType/')) { const f = flows[flows.length - 1], px = live.pClosing;
    return { clientType: { buy_I_Volume: f.buy_I_Value / px, sell_I_Volume: f.sell_I_Value / px, buy_N_Volume: f.buy_N_Value / px, sell_N_Volume: f.sell_N_Value / px, buy_CountI: f.buy_I_Count, sell_CountI: f.sell_I_Count } }; }
  if (path.startsWith('ClosingPrice/GetClosingPriceDailyList/')) { const n = +path.split('/').pop(); return { closingPriceDaily: (n ? hist.slice(-n) : hist).slice().reverse() }; }
  if (path.startsWith('ClientType/GetClientTypeHistory/')) return { clientType: flows.slice(0, -1).reverse() };
  if (path.startsWith('Shareholder/GetInstrumentShareHolderLast/')) return { shareHolder: [['شركت سرمايه گذاري نمونه-سهامي عام-', 38.2], ['صندوق بازنشستگي نمونه', 11.4], ['BFMصندوق بازارگرداني نمونه', 3.1], ['شخص حقيقي', 1.2]].map(([n, p]) => ({ shareHolderName: n, perOfShares: p })) };
  if (path.startsWith('Shareholder/')) { const d = +path.split('/').pop(), i = rows.findIndex(x => x.dEven === d);
    if (i !== rows.length - 3) return { shareShareholder: [] };
    const prev = rows[i - 1].dEven; return { shareShareholder: [{ dEven: prev, shareHolderName: 'BFMصندوق بازارگرداني نمونه', numberOfShares: 180e6 }, { dEven: d, shareHolderName: 'BFMصندوق بازارگرداني نمونه', numberOfShares: 186e6 },
      { dEven: prev, shareHolderName: 'صندوق بازنشستگي نمونه', numberOfShares: 690e6 }, { dEven: d, shareHolderName: 'صندوق بازنشستگي نمونه', numberOfShares: 684e6 }] }; }
  // like the live API (1405/07): no `flow` field, csv padded with a space
  if (path.startsWith('ClosingPrice/GetMarketWatch')) return { marketwatch: [...peers, { insCode: IC, lva: SYM, csv: '44 ', qtc: live.qTotCap, py: live.priceYesterday, pcl: live.pClosing, pdv: live.pDrCotVal, pMax: Math.round(live.priceYesterday * 1.03), pMin: Math.round(live.priceYesterday * 0.97), blDs: [{ qmo: 1, qmd: 1 }] }] };
  if (path.startsWith('ClientType/GetClientTypeAll')) return { clientTypeAllDto: [...peers.map((x, k) => ({ insCode: x.insCode, buy_I_Volume: 1e6 * (1 + (k % 3)), sell_I_Volume: 1e6 * (1 + (k % 4)) })), { insCode: IC, buy_I_Volume: 9e6, sell_I_Volume: 5e6 }] };
  if (path.startsWith('Index/GetIndexB2History/')) { const s = path.endsWith(IX44) ? ix44 : ixT; return { indexB2: s.slice(0, -1).reverse() }; }
  if (path.startsWith('Index/GetIndexB1LastAll/')) return { indexB1: [{ insCode: IX44, xDrNivJIdx004: ix44[ix44.length - 1].xNivInuClMresIbs }, { insCode: IXT, xDrNivJIdx004: ixT[ixT.length - 1].xNivInuClMresIbs }] };
  if (path.startsWith('Trade/GetTrade/')) { const r = rng(7), tr = []; let px = live.priceYesterday, n = 1;
    for (let m = 0; m < 210; m += 2) { px = Math.round(px * (1 + 0.002 * gauss(r) + 0.0002)); const hh = 9 + Math.floor(m / 60), mm = m % 60; tr.push({ nTran: n++, hEven: hh * 10000 + mm * 100 + 5, pTran: px, qTitTran: Math.round(5000 + 40000 * r()), canceled: 0 }); }
    return { trade: tr }; }
  return null;
}

// ---- codal
function letter(daysAgo, title, kind, hhmm = '18:30:12') {
  const d = new Date(D.today.getTime() - daysAgo * 864e5);
  return { Symbol: SYM, Title: title, PublishDateTime: jal(d) + ' ' + hhmm.replace(/\d/g, x => '۰۱۲۳۴۵۶۷۸۹'[x]), Url: `/Reports/Decision.aspx?LetterSerial=mock-${kind}-${daysAgo}`, TracingNo: 1000000 + daysAgo };
}
function codalSearch(qs) {
  const sym = qs.get('Symbol');
  if (sym === SYM) {
    const L = [letter(2, 'تصمیمات مجمع عمومی عادی سالیانه صاحبان سهام برای سال مالی منتهی به ۱۴۰۵/۰۳/۳۱', 'agm'),
      letter(4, 'افشای اطلاعات با اهمیت - (نرخ سرویس های جانبی) منتهی به ۱۴۰۵/۰۳/۳۱', 'util', '11:05:40'),
      letter(9, 'گزارش فعالیت ماهانه دوره ۱ ماهه منتهی به ۱۴۰۵/۰۶/۳۱', 'monthly'),
      letter(15, 'شفاف سازی در خصوص شایعه، خبر یا گزارش منتشر شده', 'rumor'),
      letter(26, 'دعوت به مجمع عمومی عادی سالیانه', 'notice'),
      letter(40, 'گزارش فعالیت ماهانه دوره ۱ ماهه منتهی به ۱۴۰۵/۰۵/۳۱', 'monthly2'),
      letter(55, 'صورت‌های مالی میاندوره‌ای ۳ ماهه منتهی به ۱۴۰۵/۰۳/۳۱ (حسابرسی نشده)', 'fs'),
      letter(70, 'تغییر مدیر عامل', 'ceo')];
    return { Total: L.length, Page: 1, Letters: L };
  }
  if (sym === 'فارس') return { Total: 1, Page: 1, Letters: [{ ...letter(3, 'افشای اطلاعات با اهمیت - (رأی دیوان عدالت اداری در خصوص نرخ خوراک) منتهی به ۱۴۰۵/۰۳/۳۱', 'court'), Symbol: 'همتای نمونه' }] };
  return { Total: 0, Page: 1, Letters: [] };
}
function codalPage(url) {
  if (/monthly/.test(url)) {
    const cells = [{ rowSequence: 1, columnSequence: 1, colSpan: 1, value: 'شرح' },
      { rowSequence: 1, columnSequence: 2, colSpan: 3, value: 'از ابتدای سال مالی تا پایان ماه قبل' }, { rowSequence: 1, columnSequence: 5, colSpan: 3, value: 'دوره یک ماهه' },
      { rowSequence: 2, columnSequence: 2, value: 'مقدار تولید' }, { rowSequence: 2, columnSequence: 3, value: 'مقدار فروش' }, { rowSequence: 2, columnSequence: 4, value: 'مبلغ فروش (میلیون ریال)' },
      { rowSequence: 2, columnSequence: 5, value: 'مقدار تولید' }, { rowSequence: 2, columnSequence: 6, value: 'مقدار فروش' }, { rowSequence: 2, columnSequence: 7, value: 'مبلغ فروش (میلیون ریال)' },
      { rowSequence: 5, columnSequence: 1, value: 'جمع' }, { rowSequence: 5, columnSequence: 4, value: /monthly2/.test(url) ? '41,250,000' : '52,480,000' }, { rowSequence: 5, columnSequence: 7, value: /monthly2/.test(url) ? '10,120,000' : '11,230,000' }];
    const ds = { periodEndToDate: /monthly2/.test(url) ? '1405/05/31' : '1405/06/31', sheets: [{ tables: [{ aliasName: 'ProductionAndSales', cells }] }] };
    return `<html><body><script>\nvar datasource = ${JSON.stringify(ds)};\n</script></body></html>`;
  }
  if (/agm/.test(url)) return '<html><body><div><h2>خلاصه تصمیمات مجمع عمومی عادی سالیانه (ساختگی)</h2><p>مجمع با حضور ۸۲٪ سهامداران تشکیل شد. صورت‌های مالی سال منتهی به ۱۴۰۵/۰۳/۳۱ تصویب شد. سود نقدی هر سهم ۹۵۰ ریال تصویب شد. حسابرس و بازرس قانونی برای یک سال انتخاب شد. روزنامهٔ کثیرالانتشار تعیین شد.</p></div><a href="/Reports/Attachment.aspx?LetterSerial=x">پیوست</a></body></html>';
  const ds = { text: 'این متن ساختگی برای آزمون است. به اطلاع می‌رساند نرخ سرویس‌های جانبی (آب، برق و بخار) برای سال ۱۴۰۵ به‌روز شد و اثر آن بر بهای تمام‌شده حدود ۲ درصد برآورد می‌شود. جزئیات در پیوست آمده است.' };
  return `<html><body><script>\nvar clientDataSource = ${JSON.stringify(ds)};\n</script></body></html>`;
}

// returns { status, body, type } or null (let the caller 404)
export function handle(href) {
  const u = new URL(href);
  if (u.host === 'cdn.tsetmc.com' && u.pathname.startsWith('/api/')) { const path = decodeURIComponent(u.pathname.slice(5)) + (u.search || ''); const j = tsetmc(path);
    return j ? { status: 200, body: JSON.stringify(j), type: 'application/json' } : { status: 404, body: '', type: 'text/plain' }; }
  if (u.host === 'search.codal.ir') return { status: 200, body: JSON.stringify(codalSearch(u.searchParams)), type: 'application/json' };
  if (/(^|\.)codal\.ir$/.test(u.host) && u.pathname.startsWith('/Reports/')) return { status: 200, body: codalPage(u.href), type: 'text/html' };
  return null;
}
export const MOCK = { IC, SYM, today: D.today, jal };

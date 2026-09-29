// report/build.mjs — rebuilds the daily plan page from PetroWatch.report chunks (or its JSON payload).
// Usage:
//   node report/build.mjs --chunks chunks.txt --out report.html [--file] [--json payload.json]
//   node report/build.mjs --payload payload.json --out report.html [--file]
// --file writes a full standalone document (doctype/head); without it the output is Artifact page content.
// Exit code 2 + "BAD_CHUNKS: i,j" when chunks are missing or fail their checksum (re-read those and run again).
import fs from 'node:fs';
import zlib from 'node:zlib';

const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; }, flag = k => args.includes('--' + k);
const root = new URL('../', import.meta.url);
const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };

// ------------------------------------------------------------ 1) payload
let P;
if (opt('payload')) P = JSON.parse(fs.readFileSync(opt('payload'), 'utf8'));
else {
  const txt = fs.readFileSync(opt('chunks'), 'utf8');
  const got = {}; let n = 0, fmt = 'z';
  for (const m of txt.matchAll(/(\d+)\/(\d+) ([zj]) ([0-9a-f]{8}) ([A-Za-z0-9+/=]+)/g)) {
    const [, i, tot, f, h, data] = m; n = +tot; fmt = f;
    if (fnv(data) === h) got[+i] = data; else if (!(+i in got)) got[+i] = null;
  }
  const bad = Array.from({ length: n }, (_, k) => k + 1).filter(i => !got[i]);
  if (!n || bad.length) { console.log('BAD_CHUNKS: ' + (n ? bad.join(',') : 'none found')); process.exit(2); }
  const buf = Buffer.from(Array.from({ length: n }, (_, k) => got[k + 1]).join(''), 'base64');
  P = JSON.parse(fmt === 'z' ? zlib.gunzipSync(buf).toString('utf8') : buf.toString('utf8'));
}
if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify(P));

// ------------------------------------------------------------ 2) helpers
const isNum = x => typeof x === 'number' && isFinite(x);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (x, d = 0) => isNum(x) ? x.toLocaleString('fa-IR', { maximumFractionDigits: d }) : '—';
const num = (x, d = 0, suf = '') => `<span class="n">${nf(x, d)}${isNum(x) ? suf : ''}</span>`;
const sgn = (x, d = 1, suf = '') => isNum(x) ? `<span class="n ${x > 0 ? 'pos' : x < 0 ? 'neg' : ''}">${x > 0 ? '+' : x < 0 ? '−' : ''}${nf(Math.abs(x), d)}${suf}</span>` : '<span class="n">—</span>';
const iso = (l, v, d = 0) => `<span class="n">${l} ${nf(v, d)}</span>`;
const dOf = dInt => { const s = String(dInt); return new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), 9)); };
const F = (o, d) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'UTC', ...o }).format(d);
const jLong = dInt => { const d = dOf(dInt); return `${F({ weekday: 'long' }, d)} ${F({ day: 'numeric' }, d)} ${F({ month: 'long' }, d)} ${F({ year: 'numeric' }, d)}`; };
const jShort = dInt => dInt ? F({ year: 'numeric', month: '2-digit', day: '2-digit' }, dOf(dInt)) : '—';
const nextSession = dInt => { const d = dOf(dInt); do { d.setUTCDate(d.getUTCDate() + 1); } while ([4, 5].includes(d.getUTCDay())); return +d.toISOString().slice(0, 10).replace(/-/g, ''); };
const tehranTime = iso_ => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso_));
const TR = { up: ['صعودی', 'ok'], down: ['نزولی', 'bad'], mixed: ['مختلط', ''], unknown_short_history: ['سابقهٔ کم', ''], all_up: ['هر سه صعودی', 'ok'], all_down: ['هر سه نزولی', 'bad'], incomplete: ['ناقص', ''] };
const chip = v => { const [t, c] = TR[v] || [v || '—', '']; return `<span class="pill ${c}">${esc(t)}</span>`; };
const REG = { hot: 'داغ', mid: 'عادی', cold: 'سرد' };
const exitDate = s => { let d = s; for (let k = 0; k < 5; k++) d = nextSession(d); return d; };

// OHLC packed as deltas by src/report.js → plain [dEven, open, high, low, close, volume] rows
const unpack = o => { if (!o || Array.isArray(o)) return o || []; const out = []; o.v.forEach((r, i) => { const p = out[i - 1];
  out.push(p ? [p[0] + r[0], p[4] + r[1], p[4] + r[2], p[4] + r[3], p[4] + r[4], r[5] * 1000] : [r[0], r[1], r[2], r[3], r[4], r[5] * 1000]); }); return out; };
(P.top || []).forEach(x => { if (x.technical) { x.technical.ohlc_daily = unpack(x.technical.ohlc_daily); x.technical.ohlc_weekly = unpack(x.technical.ohlc_weekly); } });
const rows = P.rows || [], top = P.top || [];
const byRank = new Map(rows.filter(r => r.rank).map(r => [r.sym, r.rank]));
const label = P.label ? `${nf(rows.length)} نماد ${P.label}` : `${nf(rows.length)} نماد`;
const session = P.session_date;

// ------------------------------------------------------------ 3) sections
function signalLine() {
  const buys = rows.filter(r => r.plan && r.plan.signal && r.plan.signal.side === 'buy'), sells = rows.filter(r => r.plan && r.plan.signal && r.plan.signal.side === 'sell');
  const cod = r => !r.codal ? '' : r.codal.checked ? (r.codal.hits.length ? ` · کدال ۷ روز: ${esc(r.codal.hits.map(h => h.title).join('؛ '))} (${sgn(r.codal.pts, 0)})${r.codal.review ? ' — تغییر مدیر یا هیئت‌مدیره: اگر فقط ثبت دوبارهٔ همان نمایندگان است، اثرش صفر است' : ''}` : ' · کدال ۷ روز: اطلاعیهٔ امتیازدار نبود') : ' · کدال چک نشد';
  if (!buys.length && !sells.length) return '<p class="sig none"><b>سیگنال مدل:</b> سیگنال خرید یا فروش ندارد.</p>';
  return `<div class="sig"><b>سیگنال مدل</b><ul>${buys.map(r => `<li><span class="tag buy">خرید</span> <b>${esc(r.sym)}</b>: جلسهٔ بعد از ۱۱:۰۰ تا پایان جلسه، تا قیمت ${num(r.plan.upper)}؛ در بازگشایی و در صف خرید نخرید. حد ضرر ${num(r.plan.signal.stop)} · هدف ${num(r.plan.signal.target)} · ${num(r.plan.signal.size, 0, '٪')} سرمایه${r.size_scaled ? ' (کم شد تا جمع از ۱۰۰٪ نگذرد)' : ''} · خروج حداکثر تا پایان ${esc(jLong(exitDate(session)))}${cod(r)}</li>`).join('')}
    ${sells.map(r => `<li><span class="tag sell">فروش</span> <b>${esc(r.sym)}</b>: اگر دارید، جلسهٔ بعد بعد از ۱۰:۳۰ بفروشید؛ در صف فروش نفروشید${cod(r)}</li>`).join('')}</ul></div>`;
}

function table() {
  const body = rows.map(r => {
    const rk = byRank.get(r.sym), star = rk && rk <= top.length ? ` <a class="rk hot" href="#s-${rk}" title="نمودار پایین صفحه">${nf(rk)}</a>` : '';
    const nm = `<td class="sym"><b>${esc(r.sym)}</b>${star}${r.name ? `<div class="sub">${esc(r.name)}</div>` : ''}</td>`;
    if (r.error) return `<tr class="off">${nm}<td colspan="6" class="muted">داده نیامد: ${esc(r.error)}</td></tr>`;
    const px = `<td>${num(r.close)}<div class="sub">${sgn(r.chg_close_pct, 2, '٪')}</div></td>`;
    if (!r.tradable) return `<tr class="off">${nm}${px}<td colspan="5" class="muted">${r.ipo ? 'عرضهٔ اولیه؛ طبق قاعده‌ها برنامه‌ای ندارد' : esc(r.state || 'قابل معامله نیست')}</td></tr>`;
    const p = r.plan, g = p.trigger || {}, s = p.signal;
    const trig = `<td><b>${num(g.level)}</b>${g.reachableTomorrow ? '' : ' <span class="tag mute">فردا نمی‌رسد</span>'}${s && s.side === 'buy' ? ' <span class="tag buy">سیگنال خرید</span>' : ''}${s && s.side === 'sell' ? ' <span class="tag sell">سیگنال فروش</span>' : ''}${r.queue_buy ? ' <span class="tag mute">صف خرید بسته شد</span>' : ''}</td>`;
    return `<tr class="${rk && rk <= top.length ? 'hl' : ''}">${nm}${px}${trig}<td>${num(g.size, 0, '٪')}</td><td>${num(g.stop)}</td><td>${num(g.target)}</td><td><b>${num(p.holdStop)}</b></td></tr>`;
  }).join('');
  const halted = rows.filter(r => !r.error && !r.tradable).map(r => r.sym);
  return `<div class="tw"><table class="plan"><thead><tr><th>نماد</th><th>پایانی</th><th>اگر ندارید: بخرید اگر پایانی بالای</th><th>مقدار</th><th>حد ضرر بعد از خرید</th><th>هدف</th><th>اگر دارید: حد ضرر</th></tr></thead><tbody>${body}</tbody></table></div>
    <p class="note">«پایانی بالای» یعنی بین ۱۲:۱۵ و ۱۲:۳۰ قیمت بالای آن عدد باشد؛ اگر نماد در صف خرید بود نخرید. مقدار = درصد سرمایه.${halted.length ? ` متوقف یا غیرقابل معامله: ${esc(halted.join('، '))}.` : ''}</p>`;
}

function why() {
  if (!top.length) return '<p class="muted">هیچ نماد قابل معامله‌ای برای رتبه‌بندی نبود.</p>';
  return `<ol class="why">${top.map((x, i) => { const r = rows.find(y => y.sym === x.sym) || {}, p = r.plan || {};
    const reason = p.signal && p.signal.side === 'buy' ? 'سیگنال خرید مدل دارد' : p.trigger && p.trigger.reachableTomorrow ? `ماشهٔ خرید فردا دست‌یافتنی است (${num(p.trigger.level)}، ${sgn(r.dist_to_trigger_pct, 1, '٪')} نسبت به پایانی)` : 'ماشهٔ خرید فردا دست‌یافتنی نیست؛ بعدی در رتبه‌بندی';
    return `<li><a href="#s-${i + 1}"><b>${esc(x.sym)}</b></a> — ${reason} · بازدهٔ مورد انتظار ۵ روز طبق جدول مدل ${sgn(r.ev5, 1, '٪')} (احتمال رشد ${num(isNum(r.p_up_5d) ? r.p_up_5d * 100 : null, 0, '٪')}) · امتیاز ${sgn(r.score, 0)} · رژیم گروه ${esc(REG[r.regime] || '—')}</li>`; }).join('')}</ol>
    <p class="note">ترتیب: اول سیگنال خرید مدل، بعد ماشه‌ای که فردا دست‌یافتنی است، بعد بازدهٔ مورد انتظار ۵ روزه (احتمال × متوسط سود + (۱ − احتمال) × متوسط زیان در جدول کالیبراسیون)، بعد نزدیکی به ماشه. این عدد میانگین تاریخی موقعیت‌های مشابه است، نه پیش‌بینی سود.</p>`;
}

function tools(x) {
  const k = x.technical || {}, d = x.daily || {}, f = k.fibonacci, pv = k.pivots || {}, ic = k.ichimoku, stc = k.stochastic, bb = k.bollinger, mc = k.macd;
  const pvTxt = o => o ? ['R2', 'R1', 'P', 'S1', 'S2'].map(q => iso(q, o[q])).join(' · ') : '—';
  const PST = { forming: 'در حال شکل‌گیری', broken_today: 'امروز شکسته شد', broken_up_today: 'امروز رو به بالا شکسته شد', broken_down_today: 'امروز رو به پایین شکسته شد' };
  const list = [
    ['فیبوناچی', f ? `نوسان ${f.direction === 'up' ? 'صعودی' : 'نزولی'} ${num(f.swing_pct, 1, '٪')} از ${num(f.swing_from[1])} (${jShort(f.swing_from[0])}) تا ${num(f.swing_to[1])} (${jShort(f.swing_to[0])})${f.valid_swing ? '' : ' — هنوز معتبر نیست'}؛ اصلاح فعلی ${num(isNum(f.retracement_now) ? f.retracement_now * 100 : null, 1, '٪')}؛ نزدیک‌ترین سطح ${f.nearest_level ? `${num(f.nearest_level[0] * 100, 1, '٪')} = ${num(f.nearest_level[1])}` : '—'}<div class="sub">اصلاحی: ${f.retracement_levels.slice(1, -1).map(([r, p]) => `${num(r * 100, 1, '٪')} ${num(p)}`).join(' · ')} — گسترشی: ${f.extension_levels.map(([r, p]) => `${num(r * 100, 1, '٪')} ${num(p)}`).join(' · ')}</div>` : '—'],
    ['پیوت جلسهٔ بعد', pvTxt(pv.next_session_daily)], ['پیوت هفتگی', pvTxt(pv.weekly_from_last_completed_week)],
    ['ایچیموکو', ic ? `قیمت ${ic.price_vs_cloud === 'above' ? 'بالای' : ic.price_vs_cloud === 'below' ? 'زیر' : 'داخل'} ابر (${num(ic.cloud_bottom)} تا ${num(ic.cloud_top)}) · تنکان ${num(ic.tenkan)} · کیجون ${num(ic.kijun)} · ابر ۲۶ روز آینده ${ic.future_cloud_26 === 'bullish' ? 'صعودی' : 'نزولی'}${ic.tk_cross_today ? ` · تقاطع امروز ${ic.tk_cross_today === 'up' ? 'رو به بالا' : 'رو به پایین'}` : ''}` : 'سابقهٔ کافی نیست'],
    ['Stochastic ۱۴،۳', stc ? `${iso('K', stc.k, 1)} · ${iso('D', stc.d, 1)}${stc.cross ? ` · ${stc.cross === 'up_below_20' ? 'تقاطع رو به بالا زیر ۲۰' : 'تقاطع رو به پایین بالای ۸۰'}` : ''}` : '—'],
    ['Bollinger ۲۰،۲', bb ? `${num(bb.lower)} تا ${num(bb.upper)} · میانه ${num(bb.middle)} · پهنا ${num(bb.width_pct, 1, '٪')}` : '—'],
    ['MACD ۱۲،۲۶،۹', mc ? `${num(mc.macd, 1)} / سیگنال ${num(mc.signal, 1)} · هیستوگرام ${sgn(mc.hist, 1)}` : '—'],
    ['RSI ۱۴ و واگرایی', `${num(d.rsi14, 1)}${(k.rsi_divergence || []).length ? ' · ' + k.rsi_divergence.map(v => `واگرایی ${v.type === 'bullish' ? 'مثبت' : 'منفی'} (${jShort(v.swings[0][0])} و ${jShort(v.swings[1][0])})`).join('، ') : ' · واگرایی نیست'}`],
    ['کندل امروز', (k.candles_today || []).length ? esc(k.candles_today.join('، ')) : 'الگوی شناخته‌شده‌ای نیست'],
    ['الگوهای کلاسیک', (k.chart_patterns || []).length ? k.chart_patterns.map(q => `<b>${esc(q.fa)}</b> (${PST[q.status] || esc(q.status)})${isNum(q.neckline) ? ` · خط گردن ${num(q.neckline)} · هدف ${num(q.measured_target)}` : ''}${isNum(q.breakout_up_above) ? ` · شکست بالای ${num(q.breakout_up_above)} یا زیر ${num(q.breakdown_below)}` : ''}`).join('<br>') : 'الگوی فعالی نیست']];
  const sig = k.signals_today || [];
  return `<div class="tw"><table class="tools"><tbody>${list.map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}</tbody></table></div>
    <h4>سیگنال‌های کلاسیک امروز و اعتبارشان در ۱۳ سال</h4>
    ${sig.length ? `<div class="tw"><table class="edges"><thead><tr><th>سیگنال</th><th>n</th><th>لبهٔ ۵ روزه</th><th>لبهٔ ۲۰ روزه</th><th>هم‌جهت در دوره‌ها</th></tr></thead><tbody>
    ${sig.map(q => `<tr><td>${esc(q.fa)}</td><td>${num(q.n)}</td><td>${sgn(q.edge_5d_pp, 1, ' واحد')}</td><td>${sgn(q.edge_20d_pp, 1, ' واحد')}</td><td>${nf(q.eras_same_sign_of_5)} از ۵</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">امروز سیگنال کلاسیکی فعال نیست.</p>'}`;
}

function focus(x, i) {
  const r = rows.find(y => y.sym === x.sym) || {}, p = r.plan || {}, g = p.trigger || {}, d = x.daily || {}, t = x.trend || {}, s = p.signal;
  const kv = (a, b) => `<div><span>${a}</span><b>${b}</b></div>`;
  return `<section class="focus" id="s-${i + 1}" data-focus="${i}">
    <header class="fh"><div><span class="rk hot">${nf(i + 1)}</span> <h2>${esc(x.sym)}</h2> <span class="sub">${esc(x.name || '')}</span></div>
      <div class="px"><b>${num(d.close)}</b> ${sgn(d.chg_close_pct, 2, '٪')}<div class="sub">آخرین معامله ${num(d.last)} · ${esc(jShort(d.date))}</div></div></header>
    <div class="kv">${s && s.side === 'buy' ? kv('سیگنال خرید مدل', `تا ${num(p.upper)} · حد ضرر ${num(s.stop)} · هدف ${num(s.target)} · ${num(s.size, 0, '٪')} سرمایه`) : ''}
      ${kv('اگر ندارید: بخرید اگر پایانی بالای', `${num(g.level)}${g.reachableTomorrow ? '' : ' (فردا نمی‌رسد)'}`)}${kv('مقدار', num(g.size, 0, '٪ سرمایه'))}${kv('حد ضرر بعد از خرید', num(g.stop))}${kv('هدف', num(g.target))}${kv('اگر دارید: حد ضرر', num(p.holdStop))}</div>
    <div class="chips"><span class="lbl">روند</span> روزانه ${chip(t.daily)} هفتگی ${chip(t.weekly)} یک‌ساله ${chip(t.yearly)} <span class="lbl">رژیم گروه</span> <span class="pill">${esc(REG[x.group && x.group.regime] || '—')}</span></div>
    __CHART__
    <details class="tools-d" open><summary>ابزارهای تکنیکال و اعتبار ۱۳ سالهٔ آن‌ها</summary>${tools(x)}</details>
  </section>`;
}

// ------------------------------------------------------------ 4) page
const chartJs = fs.readFileSync(new URL('src/chart.js', root), 'utf8');
const chartHtml = (() => { const PWChart = new Function(chartJs + '; return PWChart;')(); return PWChart.html({ exportButtons: false }); })();
const css = `
/* layout: one column, 1080px max; summary (signal + table) first, then the two focus charts */
:root {
  --bg: #ffffff; --surface: #f4f6f8; --surface2: #e9edf1; --line: #dde2e8; --text: #15191e; --muted: #5a6470;
  --accent: #0f6e66; --accent-soft: #e0f1ee; --accent-ink: #ffffff; --pos: #137a3e; --pos-soft: #e3f4ea; --neg: #b42318; --neg-soft: #fbe7e5; --warn: #9a5b00; --warn-soft: #fdf1dc;
  --c-ma1: #2a78d6; --c-ma2: #eb6834; --c-ma3: #4a3aa7; --c-tenkan: #e87ba4; --c-kijun: #eda100; --c-fib: #1baf7a; --c-band: #7d8792;
  --shadow: 0 8px 24px rgba(16, 24, 40, .14);
  --font: "Vazirmatn", Tahoma, "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #13161a; --surface: #1b1f24; --surface2: #242a31; --line: #2e353d; --text: #e7eaee; --muted: #9aa3ad;
  --accent: #3cc7b5; --accent-soft: #163a35; --accent-ink: #06201d; --pos: #4ccf85; --pos-soft: #16311f; --neg: #ff7b6e; --neg-soft: #3a1b18; --warn: #f2b84b; --warn-soft: #3a2c12;
  --c-ma1: #3987e5; --c-ma2: #d95926; --c-ma3: #9085e9; --c-tenkan: #d55181; --c-kijun: #c98500; --c-fib: #199e70; --c-band: #8f99a5; --shadow: 0 8px 24px rgba(0, 0, 0, .5); color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #13161a; --surface: #1b1f24; --surface2: #242a31; --line: #2e353d; --text: #e7eaee; --muted: #9aa3ad;
  --accent: #3cc7b5; --accent-soft: #163a35; --accent-ink: #06201d; --pos: #4ccf85; --pos-soft: #16311f; --neg: #ff7b6e; --neg-soft: #3a1b18; --warn: #f2b84b; --warn-soft: #3a2c12;
  --c-ma1: #3987e5; --c-ma2: #d95926; --c-ma3: #9085e9; --c-tenkan: #d55181; --c-kijun: #c98500; --c-fib: #199e70; --c-band: #8f99a5; --shadow: 0 8px 24px rgba(0, 0, 0, .5); color-scheme: dark; }
body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 14px; line-height: 1.7; margin: 0; }
.wrap { max-width: 1080px; margin: 0 auto; padding-block: 20px 40px; padding-inline: 16px; display: grid; gap: 18px; direction: rtl; text-align: right; }
.wrap * { box-sizing: border-box; }
.top .eyebrow { color: var(--accent); font-weight: 700; font-size: 12.5px; letter-spacing: .02em; }
h1 { font-size: clamp(20px, 3.4vw, 28px); line-height: 1.35; margin: 2px 0 4px; font-weight: 800; text-wrap: balance; }
h2 { font-size: 18px; margin: 0; font-weight: 800; }
h3 { font-size: 15px; margin: 0 0 8px; }
h4 { font-size: 13.5px; margin: 14px 0 4px; }
.meta, .sub, .muted, .note, .lbl { color: var(--muted); }
.meta { margin: 0; font-size: 13px; }
.sub { font-size: 12px; }
.note { font-size: 12.5px; margin: 8px 0 0; }
.n { direction: ltr; unicode-bidi: isolate; display: inline-block; font-variant-numeric: tabular-nums; }
.pos { color: var(--pos); } .neg { color: var(--neg); }
.panel { border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; background: var(--bg); min-width: 0; }
.sig { border-radius: 12px; padding: 12px 14px; background: var(--surface); margin: 0; }
.sig ul { margin: 6px 0 0; padding: 0 18px 0 0; display: grid; gap: 4px; }
.sig.none { background: var(--surface); }
.tag { display: inline-block; border-radius: 6px; padding: 0 7px; font-size: 11.5px; font-weight: 700; background: var(--surface2); color: var(--muted); white-space: nowrap; }
.tag.buy { background: var(--pos-soft); color: var(--pos); } .tag.sell { background: var(--neg-soft); color: var(--neg); } .tag.mute { font-weight: 400; }
.tw { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: right; color: var(--muted); font-weight: 500; font-size: 12px; border-bottom: 1px solid var(--line); padding: 6px 8px; white-space: nowrap; }
td { border-bottom: 1px solid var(--line); padding: 7px 8px; vertical-align: top; }
table.plan td { white-space: nowrap; }
table.plan tr.hl td { background: var(--accent-soft); }
table.plan tr.off td { color: var(--muted); }
td.sym b { font-size: 14px; }
.rk { display: inline-grid; place-items: center; min-width: 20px; height: 20px; border-radius: 999px; font-size: 11.5px; font-weight: 800; text-decoration: none; background: var(--surface2); color: var(--text); vertical-align: 1px; }
.rk.hot { background: var(--accent); color: var(--accent-ink); }
ol.why { margin: 0; padding: 0 20px 0 0; display: grid; gap: 6px; }
ol.why a { color: var(--accent); text-decoration: none; }
.focus { border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px 16px; display: grid; gap: 12px; min-width: 0; scroll-margin-top: 12px; }
.fh { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 8px 16px; }
.fh h2 { display: inline; }
.fh .px { text-align: left; }
.fh .px b { font-size: 20px; font-variant-numeric: tabular-nums; }
.kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 6px; }
.kv > div { background: var(--surface); border-radius: 10px; padding: 7px 10px; display: grid; gap: 2px; min-width: 0; }
.kv > div > span { color: var(--muted); font-size: 12px; }
.chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 13px; }
.pill { display: inline-block; border-radius: 6px; padding: 0 8px; font-size: 12px; background: var(--surface2); }
.pill.ok { background: var(--pos-soft); color: var(--pos); } .pill.bad { background: var(--neg-soft); color: var(--neg); }
table.tools th { width: 1%; color: var(--text); font-weight: 700; vertical-align: top; }
details.tools-d > summary { cursor: pointer; font-weight: 700; padding: 4px 0; }
footer { color: var(--muted); font-size: 12px; border-top: 1px solid var(--line); padding-top: 12px; }
a:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
/* chart (shared with the panel: src/chart.js) */
.tcw { position: relative; min-width: 0; }
.tc-ctl { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 6px; }
.grow { flex: 1; }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 9px; overflow: hidden; }
.seg button { border: 0; background: var(--bg); color: var(--muted); padding: 3px 11px; cursor: pointer; font: inherit; font-size: 12.5px; }
.seg button + button { border-inline-start: 1px solid var(--line); }
.seg button[aria-pressed="true"] { background: var(--accent-soft); color: var(--text); font-weight: 700; }
.tc-layers { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
.lchip { display: inline-flex; align-items: center; gap: 5px; border: 1px solid var(--line); background: var(--bg); color: var(--muted); border-radius: 999px; padding: 2px 10px; font: inherit; font-size: 12px; cursor: pointer; }
.lchip i { width: 11px; height: 3px; border-radius: 2px; display: inline-block; }
.lchip[aria-pressed="true"] { background: var(--surface2); color: var(--text); border-color: var(--muted); }
.lchip[aria-pressed="false"] i { opacity: .35; }
.tc-svg { width: 100%; min-height: 60px; touch-action: pan-y; }
.tc-svg svg { display: block; width: 100%; height: auto; }
.tc-tip { position: absolute; z-index: 3; pointer-events: none; min-width: 150px; background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 9px; box-shadow: var(--shadow); padding: 6px 10px; font-size: 12px; }
.tc-tip .tt-h { font-weight: 700; margin-bottom: 2px; }
.tc-tip > div:not(.tt-h) { display: flex; justify-content: space-between; gap: 12px; }
.tc-tip span { color: var(--muted); }
.tc-note { margin: 6px 0 0; font-size: 12px; color: var(--muted); }
@media (max-width: 560px) { .wrap { gap: 14px; } .focus, .panel { padding-inline: 12px; } table { font-size: 12.5px; } }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
`;
const data = JSON.stringify({ rows, top }).replace(/</g, '\\u003c');
const gen = P.generated_at ? tehranTime(P.generated_at) : '';
const body = `<title>برنامهٔ روزانهٔ دیدبان</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&display=swap">
<style>${css}</style>
<main class="wrap" dir="rtl" lang="fa">
  <header class="top"><div class="eyebrow">دیدبان · ${esc(label)}</div>
    <h1>برنامهٔ جلسهٔ ${esc(jLong(session))}</h1>
    <p class="meta">${P.last_trading_date ? `دادهٔ جلسهٔ ${esc(jShort(P.last_trading_date))}` : ''}${gen ? ` · گرفته‌شده ${esc(gen)}` : ''} · طبق قاعده‌های مدل دیدبان · ریسک ۱٪ سرمایه در هر معامله</p></header>
  ${P.no_session_today ? '<p class="sig none"><b>امروز جلسهٔ معاملاتی نبود؛</b> اعداد مربوط به آخرین جلسه است.</p>' : ''}
  ${signalLine()}
  <section class="panel"><h3>جدول اجرایی</h3>${table()}</section>
  <section class="panel"><h3>دو نماد مهم فردا</h3>${why()}</section>
  ${top.map((x, i) => focus(x, i).replace('__CHART__', chartHtml)).join('\n')}
  <footer>مدل روی گروه پتروشیمی (۴۴) آزموده شده و برای نمادهای گروه‌های دیگر اطمینان پایین است. ماشهٔ سقف ۲۰ روزه لبهٔ ضعیفی داشت و برای همین حجمش ⅓ است. ابزارهای کلاسیک (فیبوناچی، پیوت، ایچیموکو، الگوها) در آزمون ۱۳ ساله لبهٔ پایدار نداشتند و فقط برای سطح، حد ضرر و هدف‌اند. این صفحه خروجی قاعده‌های مدل است، تضمینی ندارد و توصیهٔ سرمایه‌گذاری نیست؛ تصمیم و مسئولیت با شماست.</footer>
</main>
<script type="application/json" id="pw-data">${data}</script>
<script>
${chartJs}
(function () {
  var D = JSON.parse(document.getElementById('pw-data').textContent);
  document.querySelectorAll('[data-focus]').forEach(function (sec) {
    var x = D.top[+sec.getAttribute('data-focus')], row = D.rows.filter(function (r) { return r.sym === x.sym; })[0] || {}, mem = {};
    var store = { get: function (k, d) { return k in mem ? mem[k] : d; }, set: function (k, v) { mem[k] = v; } };
    PWChart.mount(sec, { symbol: x.sym, tsetmc: { technical: x.technical, chart: x.chart, daily: x.daily } }, { plan: row.plan, store: store, toast: function () {} });
  });
  try { new MutationObserver(function () { document.querySelectorAll('[data-tchart]').forEach(PWChart.draw); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) {}
})();
</script>`;
const out = flag('file') ? `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${body.replace('<main', '</head><body><main')}</body></html>` : body;
fs.writeFileSync(opt('out') || 'report.html', out);
console.log(`OK ${opt('out') || 'report.html'} ${(out.length / 1024).toFixed(0)}KB session=${session} rows=${rows.length} top=${top.map(x => x.sym).join(',')}`);

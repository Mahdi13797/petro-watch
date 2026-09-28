/* ==========================================================================
   panel.js — رابط کاربری «دیدبان پتروشیمی»
   Needs (from the build wrapper): PW_VERSION, PW_REPO, PW_PAGES, PW_CSS, PW_PROMPT, PW_GM, PW_NET, PC
   ========================================================================== */
const PetroWatch = (() => {
  const HOST = location.hostname;
  const SITE = /(^|\.)tsetmc\.com$/.test(HOST) ? 'tsetmc' : /(^|\.)codal\.ir$/.test(HOST) ? 'codal' : 'other';
  // cdn.tsetmc.com answers any origin (CORS *); search.codal.ir only answers codal.ir → codal needs the codal.ir tab or GM
  const CAN = { tsetmc: true, codal: !!PW_GM || SITE === 'codal' };

  // ---------------------------------------------------------------- dictionaries
  const PEERS = ['فارس', 'شپدیس', 'نوری', 'جم', 'پارس', 'تاپیکو', 'پترول', 'شیراز', 'زاگرس', 'مارون', 'آریا', 'شگویا', 'بوعلی', 'کرماشا', 'شخارک', 'شفن', 'تابان', 'وپترو', 'شیران', 'پارسان'];
  const TYPE_FA = { MONTHLY: 'گزارش ماهانه', PORTFOLIO_NAV: 'صورت وضعیت پورتفوی', FS_EXPLAIN: 'توضیح صورت مالی', INTERIM_FS: 'صورت مالی میاندوره‌ای',
    ANNUAL_FS: 'صورت مالی سالانه', AGM_DECISION: 'تصمیمات مجمع', AGM_NOTICE: 'دعوت به مجمع', DIV_SCHEDULE: 'زمان‌بندی پرداخت سود',
    CAPINC_PROPOSAL: 'پیشنهاد افزایش سرمایه', CAPINC_STEP: 'افزایش سرمایه', EGM: 'مجمع فوق‌العاده', RUMOR_CLARIFY: 'شفاف‌سازی شایعه',
    BOARD_CEO_CHANGE: 'تغییر مدیرعامل/هیئت‌مدیره', HALT: 'توقف/تعلیق نماد', REGULATORY_COURT: 'دیوان/شورای رقابت', UTILITY_RATES: 'نرخ سرویس‌های جانبی',
    FEED_GAS_PRICE: 'نرخ گاز خوراک', SHUTDOWN: 'توقف تولید/تعمیرات', RESTART: 'شروع مجدد تولید', CONTRACT: 'قرارداد', LEGAL: 'دعوی حقوقی',
    MATERIAL_OTHER: 'افشای اطلاعات بااهمیت', OTHER: 'سایر' };
  const CODAL_PTS = { AGM_DECISION: -1, BOARD_CEO_CHANGE: -1, SHUTDOWN: -1, RUMOR_CLARIFY: -1, CAPINC_PROPOSAL: 1, CAPINC_STEP: 1 };
  const GROUP_NEWS = new Set(['REGULATORY_COURT', 'UTILITY_RATES', 'FEED_GAS_PRICE']);
  const IMPORTANT = new Set(['AGM_DECISION', 'BOARD_CEO_CHANGE', 'SHUTDOWN', 'RESTART', 'RUMOR_CLARIFY', 'REGULATORY_COURT', 'UTILITY_RATES', 'FEED_GAS_PRICE',
    'CAPINC_PROPOSAL', 'CAPINC_STEP', 'HALT', 'CONTRACT', 'LEGAL', 'MATERIAL_OTHER', 'EGM']);
  const PTS_FA = { smart_retail_money: 'پول هوشمند حقیقی', buyer_power_gt2: 'قدرت خریدار > ۲', buyer_power_lt05: 'قدرت خریدار < ۰٫۵', buy_queue_close: 'بسته‌شدن در صف خرید',
    sell_queue_close: 'بسته‌شدن در صف فروش', strong_finish: 'پایان قوی (آخرین > پایانی)', weak_finish: 'پایان ضعیف (آخرین < پایانی)', rsi_below_30: 'RSI < ۳۰',
    above_upper_bollinger: 'بالای باند بالای Bollinger' };
  const CTX_FA = { indiv_outflow_5d_gt10pct: 'خروج پول حقیقی ۵ روزه > ۱۰٪', indiv_inflow_today_gt20pct: 'ورود پول حقیقی امروز > ۲۰٪', new_20d_low: 'کف ۲۰ روزهٔ جدید',
    new_20d_high_with_volume: 'سقف ۲۰ روزه با حجم', adx_downtrend: 'روند نزولی ADX', strategic_holder_buy_5d: 'خرید سهامدار راهبردی',
    strategic_holder_sell_5d: 'فروش سهامدار راهبردی', close_above_last_swing_high: 'بالای آخرین سقف چرخشی', close_below_last_swing_low: 'زیر آخرین کف چرخشی' };
  const REG_FA = { hot: 'داغ', mid: 'عادی', cold: 'سرد' };
  const BAND_FA = { '<=-4': '۴− و کمتر', '-3..-2': '۳− تا ۲−', '-1..+1': '۱− تا ۱+', '+2..+3': '۲+ تا ۳+', '>=+4': '۴+ و بیشتر' };
  const TR_FA = { up: 'صعودی', down: 'نزولی', mixed: 'مختلط', unknown_short_history: 'سابقهٔ کم', 'HH/HL': 'HH/HL صعودی', 'LH/LL': 'LH/LL نزولی',
    all_up: 'هر سه صعودی', all_down: 'هر سه نزولی', incomplete: 'ناقص', clean_up: 'کانال صعودی تمیز', clean_down: 'کانال نزولی تمیز', none: 'بدون کانال تمیز',
    strong_up: 'صعودی قوی', strong_down: 'نزولی قوی', other: 'عادی' };
  const HOLDER_FA = { individual: 'حقیقی', market_maker: 'بازارگردان', portfolio: 'سبدگردان', pension: 'صندوق بازنشستگی', fund: 'صندوق', insurance: 'بیمه', bank: 'بانک',
    sukuk_spv: 'واسط مالی', strategic_social_security: 'راهبردی (تأمین اجتماعی)', strategic_parent_or_peer: 'مادر/هم‌گروه', investment_co: 'شرکت سرمایه‌گذاری', other: 'سایر' };
  const QUEUE_FA = { buy_queue: 'صف خرید', sell_queue: 'صف فروش', none: 'بدون صف' };
  const IPO_FA = { in_initial_queue_streak: 'هنوز در صف اولیه', first_open_days: 'روزهای اول بدون صف', after_first_down_day: 'بعد از اولین روز منفی', post_ipo: 'بعد از دورهٔ عرضه' };

  // ---------------------------------------------------------------- helpers
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isNum = x => typeof x === 'number' && isFinite(x);
  const nf = (x, d = 0) => isNum(x) ? x.toLocaleString('fa-IR', { maximumFractionDigits: d, minimumFractionDigits: 0 }) : '—';
  // symbol suffixes (٪ × σ) stay inside the LTR number; word suffixes (میلیارد ت، واحد) go after it, in RTL
  const splitSuf = suf => /^[\s٪%×σ]*$/.test(suf) ? [suf, ''] : ['', suf];
  const num = (x, d = 0, suf = '') => { const [a, b] = splitSuf(suf); return isNum(x) ? `<span class="n">${nf(x, d)}${a}</span>${b}` : '<span class="n">—</span>'; };
  const sgn = (x, d = 1, suf = '') => { const [a, b] = splitSuf(suf); return isNum(x)
    ? `<span class="n ${x > 0 ? 'pos' : x < 0 ? 'neg' : ''}">${x > 0 ? '+' : x < 0 ? '−' : ''}${nf(Math.abs(x), d)}${a}</span>${b}` : '<span class="n">—</span>'; };
  const P = (x, d = 0) => isNum(x) ? num(x * 100, d, '٪') : '<span class="n">—</span>';
  const SP = (x, d = 1) => isNum(x) ? sgn(x * 100, d, '٪') : '<span class="n">—</span>';
  const fixFa = s => String(s == null ? '' : s).replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  const faDigits = s => String(s == null ? '' : s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const latinDigits = s => String(s == null ? '' : s).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c));
  const dEvDate = dEv => { const s = String(dEv); return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), 12); };
  const jd = dEv => dEv ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dEvDate(dEv)) : '—';
  const jdShort = dEv => dEv ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: '2-digit', day: '2-digit' }).format(dEvDate(dEv)) : '—';
  const jalLatin = dt => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\d/]/g, '');
  const tehranInt = (daysAgo = 0) => +new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.now() - daysAgo * 864e5)).replace(/\D/g, '');
  const tehranTime = iso => { try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); } catch (e) { return '—'; } };
  const kv = (k, v) => `<div><span>${k}</span><span>${v}</span></div>`;
  const sec = (title, inner, open) => `<details class="sec"${open ? ' open' : ''}><summary>${title}</summary><div class="in">${inner}</div></details>`;
  const flag = (label, v) => v === true ? `<span class="chip">✓ ${label}</span>` : v === false ? `<span class="chip off">${label}</span>` : '';
  const trb = v => { const t = TR_FA[v] || v || '—'; const cls = v === 'up' || v === 'all_up' || v === 'clean_up' ? 'ok' : v === 'down' || v === 'all_down' || v === 'clean_down' ? 'bad' : ''; return `<span class="badge ${cls}">${esc(t)}</span>`; };
  const bandOf = s => s <= -4 ? '<=-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : '>=+4';
  const ptxt = v => (v > 0 ? '+' : v < 0 ? '−' : '') + nf(Math.abs(v));
  const billionToman = x => isNum(x) ? num(x / 1e10, 1, ' میلیارد ت') : '—';

  const store = {
    get(k, d) { try { if (PW_GM && PW_GM.get) return PW_GM.get('pw_' + k, d); const v = localStorage.getItem('pw_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { if (PW_GM && PW_GM.set) PW_GM.set('pw_' + k, v); else localStorage.setItem('pw_' + k, JSON.stringify(v)); } catch (e) { /* storage not available */ } }
  };
  async function copyText(text) {
    try { if (PW_GM && PW_GM.clip) { PW_GM.clip(text, 'text'); return true; } } catch (e) { /* fall through */ }
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall through */ }
    try { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
  }
  function download(name, text, type = 'application/json') {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  const wrapTables = h => h.replace(/<table>/g, '<div class="tw"><table>').replace(/<\/table>/g, '</table></div>');
  const safe = async fn => { try { return await fn(); } catch (e) { return { error: String((e && e.message) || e) }; } };

  // ---------------------------------------------------------------- analysis helpers
  function situation(t) {
    if (t.ipo) return { code: 'A', fa: 'عرضهٔ اولیه / تازه‌عرضه', note: 'جدول رژیم معتبر نیست؛ فقط دفترچهٔ IPO (بخش ۴-۶ پرامپت).' };
    const cutoff = tehranInt(7);
    if ((t.daily?.adjustments_last_year || []).some(a => a[0] >= cutoff)) return { code: 'B', fa: 'تعدیل قیمت در روزهای اخیر', note: 'مجمع یا افزایش سرمایه در ۵ جلسهٔ اخیر: بدون کالیبراسیون، فقط سناریو.' };
    if (isNum(t.daily?.history_days) && t.daily.history_days < 60) return { code: 'C', fa: 'سابقهٔ کوتاه', note: 'کمتر از ۶۰ روز سابقه: بدون کالیبراسیون.' };
    return { code: 'D', fa: 'عادی', note: '' };
  }
  function codalHints(c) {
    if (!c || c.error) return null;
    const recent = new Set(Array.from({ length: 8 }, (_, k) => jalLatin(new Date(Date.now() - k * 864e5))));
    const hits = (c.letters || []).filter(l => recent.has(String(l.published || '').slice(0, 10)) && (l.type in CODAL_PTS || GROUP_NEWS.has(l.type)));
    const seen = new Set(); let pts = 0;
    hits.forEach(l => { if (l.type in CODAL_PTS && !seen.has(l.type)) { seen.add(l.type); pts += CODAL_PTS[l.type]; } });
    return { hits, pts };
  }
  function pickLetters(c, k = 3) {
    const recent = new Set(Array.from({ length: 31 }, (_, i) => jalLatin(new Date(Date.now() - i * 864e5))));
    return (c.letters || []).filter(l => IMPORTANT.has(l.type) && recent.has(String(l.published || '').slice(0, 10)))
      .sort((a, b) => String(b.published).localeCompare(String(a.published))).slice(0, k);
  }

  // ---------------------------------------------------------------- dashboard renderer
  function dash(b, opt = {}) {
    if (!b) return '<div class="empty">هنوز داده‌ای نیست.</div>';
    const t = b.tsetmc && !b.tsetmc.error ? b.tsetmc : null, c = b.codal && !b.codal.error ? b.codal : null;
    let h = headCard(b, t);
    if (b.tsetmc && b.tsetmc.error) h += `<div class="err"><b>tsetmc:</b> ${esc(b.tsetmc.error)}</div>`;
    if (b.codal && b.codal.error) h += `<div class="err"><b>کدال:</b> ${esc(b.codal.error)}</div>`;
    if (t) {
      h += sumCard(t, b.codal);
      if (t.ipo) h += sec('عرضهٔ اولیه (IPO)', ipoHtml(t.ipo), true);
      h += sec('روند چندافقی', trendHtml(t.trend, t), true);
      h += sec('نمودار و سطوح کلیدی', levelsHtml(t), true);
      h += sec('جریان پول حقیقی/حقوقی', flowsHtml(t.flows), false);
      h += sec('اندیکاتورهای روزانه', dailyHtml(t.daily), false);
      if (t.intraday_today) h += sec('درون‌روز امروز', intradayHtml(t.intraday_today), false);
      h += sec('گروه ۴۴ و شاخص‌ها', groupHtml(t.group), false);
      h += sec('دفتر سفارش', obHtml(t.order_book), false);
      h += sec('سهامداران عمده', holdersHtml(t.holders), false);
      h += sec('بنیادی سریع', fundHtml(t), false);
    }
    if (c) h += sec(`کدال — ${nf(c.n_letters)} اطلاعیه در ${nf(c.window_days)} روز`, codalHtml(c, b.letters || [], opt), true);
    else if (!b.codal) h += '<div class="note">کدال گرفته نشد.</div>';
    h += '<p class="disc">این داده‌ها برای تحلیل آموزشی/پژوهشی است و توصیهٔ سرمایه‌گذاری شخصی نیست؛ مسئولیت تصمیم با معامله‌گر است.</p>';
    return wrapTables(h);
  }

  function headCard(b, t) {
    const d = t && t.daily, ins = t && t.instrument;
    const today = tehranInt(0);
    const fresh = d ? (d.date === today ? '<span class="badge ok">دادهٔ امروز</span>' : `<span class="badge warn">آخرین جلسه: ${jd(d.date)} (امروز نیست)</span>`) : '';
    const st = ins && ins.state ? fixFa(ins.state) : '';
    const stBad = st && (!/^مجاز/.test(st) || /متوقف|ممنوع/.test(st));
    const warns = [...((t && t.warnings) || [])];
    if (d && d.closed_at_upper_limit) warns.push('امروز در صف خرید بسته شد (خرید عملاً ممکن نیست).');
    if (d && d.closed_at_lower_limit) warns.push('امروز در صف فروش بسته شد (فروش عملاً ممکن نیست).');
    return `<div class="card head"><div class="h-top"><div><div class="sym">${esc(fixFa(b.symbol))}</div>
      <div class="muted small">${esc(fixFa((ins && ins.name) || ''))}${ins && ins.market ? ' · ' + esc(fixFa(ins.market)) : ''}</div></div>
      ${d ? `<div class="px"><div class="big">${num(d.last)}</div><div class="small">${sgn(d.chg_last_pct, 2, '٪')} <span class="muted">آخرین معامله</span></div>
      <div class="small muted">پایانی ${num(d.close)} (${sgn(d.chg_close_pct, 2, '٪')})</div></div>` : ''}</div>
      <div class="chips">${fresh}${st ? `<span class="badge ${stBad ? 'bad' : ''}">${esc(st)}</span>` : ''}${d && d.live_row ? '<span class="badge">ردیف زندهٔ امروز</span>' : ''}
      <span class="muted small">گرفته‌شده: ${tehranTime(b.collected_at || (t && t.generated_at))}</span></div>
      ${warns.length ? `<ul class="warns">${warns.map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}</div>`;
  }

  function sumCard(t, codal) {
    const r = t.rubric || {}, s = situation(t), cal = r.calibration_for_this_band || {}, base = r.base_rate_this_regime || {};
    const g = t.group || {}, reg = r.regime || g.regime;
    const regCls = reg === 'hot' ? 'hot' : reg === 'cold' ? 'cold' : '';
    let h = `<div class="card sum"><div class="top"><div><span class="lbl">موقعیت</span> <b>${s.code}</b> · ${s.fa}</div>
      <div><span class="lbl">رژیم گروه</span> <span class="badge ${regCls}">${REG_FA[reg] || '—'}</span> <span class="muted small">شاخص ۴۴ در ۲۰ روز ${SP(g.chem44_index && g.chem44_index.r20)}</span></div></div>`;
    const ch = codalHints(codal);
    if (s.code === 'D' && r.applicable !== false) {
      const edge = r.edge_vs_base_5d_pp, p5 = cal.p_up_5d;
      const cls = isNum(edge) && edge >= 8 && p5 >= 0.55 ? 'buy' : isNum(edge) && edge <= -8 && p5 <= 0.40 ? 'sell' : '';
      const lbl = cls === 'buy' ? 'لبهٔ خرید' : cls === 'sell' ? 'لبهٔ فروش' : 'بدون لبه';
      const pts = Object.entries(r.points || {}).filter(([, v]) => v);
      h += `<div class="score"><div class="sc-num">${sgn(r.subtotal_without_codal, 0)}</div>
        <div><div>امتیاز بدون کدال · ناحیهٔ <b>${BAND_FA[r.band_without_codal] || '—'}</b></div>
        <div class="muted small">${pts.length ? pts.map(([k, v]) => `${PTS_FA[k] || k} <span class="n">${ptxt(v)}</span>`).join(' · ') : 'هیچ ردیف امتیازداری فعال نیست'}</div></div>
        <div class="edge ${cls}">${lbl}<div class="small">لبهٔ ۵ روزه ${sgn(edge, 0, ' واحد')}</div></div></div>`;
      h += probBars(cal, base);
      h += `<div class="kv4"><div><span class="lbl">میانهٔ ۵ روز</span><b>${sgn(cal.median_5d_pct, 1, '٪')}</b></div><div><span class="lbl">متوسط سود</span><b>${sgn(cal.avg_gain_5d_pct, 1, '٪')}</b></div>
        <div><span class="lbl">متوسط زیان</span><b>${sgn(cal.avg_loss_5d_pct, 1, '٪')}</b></div><div><span class="lbl">نمونه (n)</span><b>${num(cal.n)}</b></div></div>`;
      if (ch) {
        const tot = (r.subtotal_without_codal || 0) + ch.pts;
        h += `<div class="hints"><div><b>کدال ۷ روز اخیر</b> <span class="muted small">(پیشنهاد؛ حکم نهایی با عامل است)</span></div>
          ${ch.hits.length ? `<ul>${ch.hits.map(l => `<li>${esc(TYPE_FA[l.type] || l.type)} — ${esc(faDigits(String(l.published).slice(0, 16)))} ${l.type in CODAL_PTS ? `<span class="n">${ptxt(CODAL_PTS[l.type])}</span>` : '<span class="muted">(خبر گروهی: ±۱ با متن)</span>'}</li>`).join('')}</ul>` : '<div class="muted small">اطلاعیهٔ امتیازدار در ۷ روز اخیر نبود.</div>'}
          <div class="small">جمع پیشنهادی با کدال: <b>${sgn(tot, 0)}</b> → ناحیهٔ <b>${BAND_FA[bandOf(tot)]}</b>${bandOf(tot) !== r.band_without_codal ? ' <span class="badge warn">ناحیه عوض شد؛ اطمینان یک پله کمتر</span>' : ''}</div></div>`;
      }
    } else {
      h += `<div class="note warn">${esc(s.note)}${r.note ? ' — ' + esc(r.note) : ''}</div>`;
    }
    const tr = t.trend || {};
    const sellConfirm = (r.band_without_codal === '<=-4' || (ch && bandOf((r.subtotal_without_codal || 0) + ch.pts) === '<=-4')) && tr.weekly === 'down';
    h += `<div class="tline"><span class="lbl">روند</span> روزانه ${trb(tr.daily)} · هفتگی ${trb(tr.weekly)} · یک‌ساله ${trb(tr.yearly)} · هم‌راستایی ${trb(tr.alignment)}
      ${sellConfirm ? '<div class="note bad">ناحیهٔ ۴− و کمتر + روند هفتگی نزولی: تأیید فروش طبق قاعدهٔ ۴-۱-ب.</div>' : ''}</div>`;
    const ctx = Object.entries(r.context || {}).filter(([k, v]) => v === true && CTX_FA[k]);
    if (ctx.length) h += `<div class="chips"><span class="lbl">زمینه (بدون امتیاز):</span>${ctx.map(([k]) => `<span class="chip">${CTX_FA[k]}</span>`).join('')}</div>`;
    h += `<div class="trade"><span class="lbl">قابلیت معامله:</span> ${esc(r.tradability || '—')}</div></div>`;
    return h;
  }

  function probBars(cal, base) {
    const rows = [['۱ روز', cal.p_up_1d, base.p_up_1d], ['۳ روز', cal.p_up_3d], ['۵ روز', cal.p_up_5d, base.p_up_5d], ['۱۰ روز', cal.p_up_10d]];
    return `<div class="probs"><div class="muted small">احتمال بالا رفتن قیمت در موقعیت‌های مشابه (۱۳۹۲ تا ۱۴۰۵، همین رژیم و ناحیه). خط تیره = نرخ پایهٔ رژیم.</div>
      ${rows.map(([l, p, bs]) => `<div class="pb"><span>${l}</span><span class="track"><span class="fill" style="width:${isNum(p) ? p * 100 : 0}%"></span>${isNum(bs) ? `<span class="base" style="inset-inline-start:${bs * 100}%"></span>` : ''}</span>
        <span class="pv">${P(p)}${isNum(bs) ? ` <span class="muted">پایه ${P(bs)}</span>` : ''}</span></div>`).join('')}</div>`;
  }

  function trendHtml(tr, t) {
    if (!tr) return '<p class="muted">—</p>';
    const c = tr.channel60;
    return `<div class="kv">${kv('روزانه', trb(tr.daily))}${kv('هفتگی', trb(tr.weekly))}${kv('ساختار هفتگی', trb(tr.weekly_structure))}${kv('یک‌ساله', trb(tr.yearly))}
      ${kv('هم‌راستایی', trb(tr.alignment))}${kv('روند کوتاه سهم', trb(t.daily && t.daily.trend_class))}${kv('جای قیمت در دامنهٔ ۵۲ هفته', P(tr.position_in_52w_range))}${kv('SMA200', num(tr.sma200))}
      ${kv('میانگین ۱۰ / ۳۰ هفته', num(tr.weekly_sma10) + ' / ' + num(tr.weekly_sma30))}
      ${c ? kv('کانال ۶۰ روزه', trb(c.kind)) + kv('شیب ۶۰ روزه · R²', sgn(c.slope_60d_pct, 1, '٪') + ' · ' + num(c.r2, 2)) + kv('فاصله از کانال دیروز', sgn(c.z_vs_yesterdays_channel, 2, ' σ')) + kv('خط پایین / بالای کانال', num(c.lower_line_today) + ' / ' + num(c.upper_line_today)) : ''}</div>
      <p class="muted small">روند امتیاز ندارد؛ فقط سیگنال فروش را تأیید می‌کند و برای حد ضرر و هدف به کار می‌رود.</p>`;
  }

  function levelsHtml(t) {
    const ch = t.chart || {}, close = t.daily && t.daily.close;
    const rows = (ch.levels_sorted_high_to_low || []).map(([n, p, d]) => ({ n, p, d }));
    if (isNum(close)) rows.push({ n: 'قیمت پایانی', p: close, d: 0, cur: true });
    rows.sort((a, b) => b.p - a.p);
    const same = (r, x) => x && r.n === x[0] && r.p === x[1];
    const sw = a => (a || []).map(x => `${num(x[1])} <span class="muted">(${jdShort(x[0])})</span>`).join('، ') || '—';
    return `<div class="kv">${kv('ساختار روزانه', esc(ch.structure || '—'))}${kv('ATR', P(t.daily && t.daily.atr_pct, 1))}</div>
      <div class="kv" style="grid-template-columns:1fr">${kv('سقف‌های چرخشی', sw(ch.swing_highs))}${kv('کف‌های چرخشی', sw(ch.swing_lows))}</div>
      <table><thead><tr><th>سطح</th><th>قیمت (تعدیل‌شده)</th><th>فاصله</th></tr></thead><tbody>
      ${rows.map(r => `<tr class="${r.cur ? 'cur' : ''} ${same(r, ch.nearest_resistance) ? 'nr' : ''} ${same(r, ch.nearest_support) ? 'ns' : ''}"><td>${esc(faDigits(r.n))}
        ${same(r, ch.nearest_resistance) ? ' <span class="tag">نزدیک‌ترین مقاومت</span>' : ''}${same(r, ch.nearest_support) ? ' <span class="tag">نزدیک‌ترین حمایت</span>' : ''}</td>
        <td>${num(r.p)}</td><td>${r.cur ? '' : sgn(r.d, 1, '٪')}</td></tr>`).join('')}</tbody></table>
      <div class="chips">${flag('بسته‌شدن بالای آخرین سقف چرخشی', ch.close_above_last_swing_high)}${flag('بسته‌شدن زیر آخرین کف چرخشی', ch.close_below_last_swing_low)}${flag('تست کف چرخشی و نگه‌داشتن', ch.tested_last_swing_low_and_held)}</div>
      <p class="muted small">در آزمون ۱۳ ساله سطوح جهت را پیش‌بینی نکردند؛ برای ورود، حد ضرر و هدف به کار می‌روند.</p>`;
  }

  function flowsHtml(f) {
    if (!f) return '<p class="muted">دادهٔ حقیقی/حقوقی نیامد.</p>';
    const mt = x => isNum(x) ? num(x / 1e6, 1, ' میلیون ت') : '—';
    return `${f.note ? `<div class="note warn">${esc(f.note)}</div>` : ''}<div class="kv">
      ${kv('قدرت خریدار امروز', num(f.buyer_power_today, 2))}${kv('قدرت خریدار ۵ روزه', num(f.buyer_power_5d, 2))}
      ${kv('سرانهٔ خرید', mt(f.per_capita_buy_toman))}${kv('سرانهٔ فروش', mt(f.per_capita_sell_toman))}
      ${kv('سرانهٔ خرید ÷ میانهٔ ۶۰ روز', num(f.per_capita_buy_vs_60d_median, 2, '×'))}${kv('خریدار / فروشندهٔ حقیقی', num(f.indiv_buyers) + ' / ' + num(f.indiv_sellers))}
      ${kv('خالص حقیقی امروز', sgn(f.indiv_net_today_billion_toman, 1, ' میلیارد ت'))}${kv('خالص حقیقی امروز (٪ ارزش)', SP(f.indiv_net_today_pct_of_value))}
      ${kv('خالص حقیقی ۵ روزه (٪ ارزش)', SP(f.indiv_net_5d_pct))}${kv('خالص حقیقی ۲۰ روزه (٪ ارزش)', SP(f.indiv_net_20d_pct))}
      ${kv('خالص حقوقی امروز', sgn(f.inst_net_today_billion_toman, 1, ' میلیارد ت'))}${kv('سهم حقوقی از خرید / فروش', P(f.inst_buy_share) + ' / ' + P(f.inst_sell_share))}</div>
      <table><thead><tr><th>تاریخ</th><th>قدرت خریدار</th><th>خالص حقیقی</th><th>خالص حقوقی</th></tr></thead><tbody>
      ${(f.last10 || []).slice().reverse().map(r => `<tr><td>${jdShort(r[0])}</td><td>${num(r[1], 2)}</td><td>${sgn(r[2], 1)}</td><td>${sgn(r[3], 1)}</td></tr>`).join('')}</tbody></table>
      <p class="muted small">خالص‌ها به میلیارد تومان.</p>`;
  }

  function dailyHtml(d) {
    if (!d) return '—';
    return `<div class="kv">${kv('RSI ۱۴', num(d.rsi14, 1))}${kv('MACD هیستوگرام', sgn(d.macd_hist, 1))}${kv('تقاطع MACD', d.macd_cross === 'up' ? 'رو به بالا' : d.macd_cross === 'down' ? 'رو به پایین' : '—')}
      ${kv('ADX · +DI · −DI', num(d.adx14, 1) + ' · ' + num(d.plus_di, 1) + ' · ' + num(d.minus_di, 1))}${kv('Bollinger %b', num(d.bollinger_pctb, 2))}${kv('حجم ÷ میانگین ۲۰ روز', num(d.vol_ratio_20, 2, '×'))}
      ${kv('بازده ۵ / ۲۰ روز', SP(d.ret_5d) + ' / ' + SP(d.ret_20d))}${kv('بازده ۶۰ / ۲۴۰ روز', SP(d.ret_60d) + ' / ' + SP(d.ret_240d))}
      ${kv('SMA20 / 50 / 100', num(d.sma20) + ' / ' + num(d.sma50) + ' / ' + num(d.sma100))}${kv('سقف / کف ۲۰ روزه', num(d.donchian20_high) + ' / ' + num(d.donchian20_low))}
      ${kv('ارزش معاملات امروز', billionToman(d.value_today))}${kv('آخرین − پایانی', sgn(d.last_minus_close_pct, 2, '٪'))}
      ${kv('روزهای صف خرید پیاپی (تا دیروز)', num(d.buy_queue_streak_before_today))}${kv('روزهای مثبت پیاپی (تا دیروز)', num(d.up_day_streak_before_today))}
      ${kv('روزهای سابقه', num(d.history_days))}${kv('کمینه / بیشینه / بازگشایی', num(d.low) + ' / ' + num(d.high) + ' / ' + num(d.open))}</div>
      ${(d.adjustments_last_year || []).length ? `<p class="small">تعدیل‌های یک سال اخیر: ${d.adjustments_last_year.map(a => `${jd(a[0])} (×${num(a[1], 3)})`).join('، ')}</p>` : ''}`;
  }

  function intradayHtml(x) {
    const bars = x.bars_5m || [];
    let svg = '';
    if (bars.length) {
      const W = 320, H = 96, pad = 5, cw = (W - 2 * pad) / bars.length;
      const vals = bars.flatMap(b => [b[2], b[3]]).concat(isNum(x.vwap) ? [x.vwap] : []);
      const hi = Math.max(...vals), lo = Math.min(...vals), y = v => pad + (hi - v) / ((hi - lo) || 1) * (H - 2 * pad);
      svg = `<svg class="candles" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="کندل‌های ۵ دقیقه‌ای">${isNum(x.vwap) ? `<line class="vw" x1="0" x2="${W}" y1="${y(x.vwap)}" y2="${y(x.vwap)}"/>` : ''}
        ${bars.map((b, i) => { const cx = pad + i * cw + cw / 2, up = b[4] >= b[1], cls = up ? 'up' : 'dn';
          return `<line class="${cls}" x1="${cx}" x2="${cx}" y1="${y(b[2])}" y2="${y(b[3])}"/><rect class="${cls}" x="${cx - cw * 0.3}" y="${Math.min(y(b[1]), y(b[4]))}" width="${cw * 0.6}" height="${Math.max(1, Math.abs(y(b[1]) - y(b[4])))}"/>`; }).join('')}</svg>
        <div class="axis"><span>${esc(bars[0][0])}</span><span>— VWAP</span><span>${esc(bars[bars.length - 1][0])}</span></div>`;
    }
    return `<div class="kv">${kv('اولین معامله', esc(x.first_trade_time))}${kv('بازگشایی / آخرین', num(x.open) + ' / ' + num(x.last))}${kv('VWAP امروز', num(x.vwap))}
      ${kv('آخرین نسبت به VWAP', sgn(x.last_vs_vwap_pct, 2, '٪'))}${kv('بازده ۳۰ دقیقهٔ اول', sgn(x.ret_first30m_pct, 2, '٪'))}${kv('بازده ۳۰ دقیقهٔ آخر', sgn(x.ret_last30m_pct, 2, '٪'))}</div>${svg}
      <p class="muted small">بازار درون‌روز برگشتی است؛ این بخش فقط برای زمان ورود و خروج است.</p>`;
  }

  function groupHtml(g) {
    if (!g) return '—';
    const ix = (o, k) => o ? kv(k, SP(o.r1) + ' / ' + SP(o.r5) + ' / ' + SP(o.r20)) : '';
    return `<div class="kv">${kv('رژیم', `<span class="badge">${REG_FA[g.regime] || '—'}</span>`)}${kv('نمادهای معامله‌شده', num(g.n_traded))}${kv('درصد نمادهای مثبت', P(g.pct_up))}
      ${kv('صف خرید / فروش', num(g.buy_queues) + ' / ' + num(g.sell_queues))}${kv('میانگین تغییر قیمت', sgn(g.avg_change_pct, 2, '٪'))}
      ${kv('جریان حقیقی گروه بدون این نماد', SP(g.indiv_net_flow_pct_of_value_ex_self) + ' · ' + sgn(g.indiv_net_flow_billion_toman_ex_self, 1, ' میلیارد ت'))}
      ${kv('سهم این نماد از ارزش گروه', P(g.this_symbol_share_of_group_value, 1))}${kv('خالص حقیقی این نماد', sgn(g.this_symbol_indiv_net_billion_toman, 1, ' میلیارد ت'))}
      ${ix(g.chem44_index, 'شاخص ۴۴: ۱ / ۵ / ۲۰ روز')}${kv('شاخص ۴۴ بالای SMA50', g.chem44_index ? (g.chem44_index.above_sma50 ? 'بله' : 'خیر') : '—')}
      ${ix(g.total_index, 'شاخص کل: ۱ / ۵ / ۲۰ روز')}</div>
      ${g.chem44_index && g.chem44_index.live_appended ? '<p class="small muted">مقدار امروز شاخص از منبع زنده اضافه شد.</p>' : ''}<p class="muted small">${esc(g.regime_rule || '')}</p>`;
  }

  function obHtml(o) {
    if (!o) return '—';
    return `<div class="row"><span class="badge ${o.queue === 'buy_queue' ? 'ok' : o.queue === 'sell_queue' ? 'bad' : ''}">${QUEUE_FA[o.queue] || o.queue}</span>
      ${o.queue !== 'none' ? `<span class="small">ارزش صف: ${num(o.queue_value_billion_toman, 1, ' میلیارد ت')}</span>` : ''}</div>
      <table><thead><tr><th>تعداد خریدار</th><th>حجم خرید</th><th>قیمت خرید</th><th>قیمت فروش</th><th>حجم فروش</th><th>تعداد فروشنده</th></tr></thead><tbody>
      ${(o.top5 || []).map(r => `<tr>${r.map((v, i) => `<td class="${i < 3 ? 'pos' : 'neg'}">${num(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function holdersHtml(h) {
    if (!h) return '—';
    return `<table><thead><tr><th>سهامدار</th><th>درصد</th><th>نوع</th></tr></thead><tbody>
      ${(h.top || []).map(r => `<tr><td>${esc(fixFa(r[0]))}</td><td>${num(r[1], 2, '٪')}</td><td>${HOLDER_FA[r[2]] || esc(r[2])}</td></tr>`).join('')}</tbody></table>
      <h4>تغییرات ۶ جلسهٔ اخیر</h4>${(h.changes_6d || []).length ? `<table><thead><tr><th>تاریخ</th><th>سهامدار</th><th>تغییر (سهم)</th><th>ارزش</th></tr></thead><tbody>
      ${h.changes_6d.map(x => `<tr><td>${jdShort(x.date)}</td><td>${esc(fixFa(x.holder))} <span class="muted small">${HOLDER_FA[x.type] || ''}</span></td><td>${sgn(x.delta_shares, 0)}</td><td>${sgn(x.value_billion_toman, 2, ' میلیارد ت')}</td></tr>`).join('')}</tbody></table>` : '<p class="muted small">تغییری ثبت نشد.</p>'}
      <p class="muted small">فقط زمینه، بدون امتیاز. خرید بازارگردان سیگنال صعود نیست.</p>`;
  }

  function fundHtml(t) {
    const f = t.fundamental_quick || {}, close = t.daily && t.daily.close;
    const pe = isNum(close) && isNum(f.eps_estimated) && f.eps_estimated > 0 ? close / f.eps_estimated : null;
    return `<div class="kv">${kv('EPS برآوردی', num(f.eps_estimated))}${kv('P/E با EPS برآوردی', num(pe, 1))}${kv('P/E گروه', num(f.sector_pe, 1))}
      ${kv('تعداد سهام', num(f.shares))}${kv('سهام شناور', isNum(f.free_float_pct) ? num(f.free_float_pct, 1, '٪') : '—')}${kv('میانگین حجم ۳ ماه', num(f.avg_volume_3m))}
      ${kv('دامنهٔ مجاز امروز', (f.price_limits_today || []).map(x => num(x)).join(' تا '))}${kv('صنعت', esc(fixFa(f.sector || '—')))}</div>`;
  }

  function ipoHtml(p) {
    const br = p.base_rates_192_ipos_1396_1405 || {};
    const row = (k, o) => o ? `<tr><td>${k}</td><td>${P(o.up_1d)}</td><td>${P(o.up_5d)}</td><td>${P(o.up_20d)}</td><td>${sgn(o.median_20d_pct, 1, '٪')}</td></tr>` : '';
    return `<div class="kv">${kv('مرحله', `<b>${IPO_FA[p.phase] || esc(p.phase)}</b>`)}${kv('تاریخ عرضه', jd(p.ipo_date))}${kv('قیمت عرضه', num(p.ipo_price))}${kv('روزهای بعد از عرضه', num(p.trading_days_since_ipo))}
      ${kv('صف اولیه (روز)', num(p.initial_queue_streak))}${kv('اولین روز بدون صف', jd(p.first_open_day))}${kv('کف / سقف اولین روز بدون صف', num(p.first_open_day_low) + ' / ' + num(p.first_open_day_high))}
      ${kv('اولین روز منفی', jd(p.first_down_day))}${kv('بازده از عرضه', SP(p.return_since_ipo))}</div>
      <table><thead><tr><th>نرخ پایه (۱۹۲ عرضه)</th><th>۱ روز</th><th>۵ روز</th><th>۲۰ روز</th><th>میانهٔ ۲۰ روز</th></tr></thead><tbody>
      ${row('بعد از اولین روز بدون صف', br.after_first_open_day)}${row('بعد از اولین روز منفی', br.after_first_down_day)}${row('همان، صف اولیه ≥ ۸ روز', br.after_first_down_day_if_streak_ge_8)}
      ${row('همان، خرید خالص حقوقی > ۲۰٪', br.first_down_day_with_institutional_net_buy_gt_20pct)}</tbody></table>
      <p class="muted small">حدود ۱ روز از ۴ تا ۵ روز، روز بعد مثبت است؛ یک روز مثبت «شکست تحلیل» نیست.</p>`;
  }

  function codalHtml(c, texts, opt) {
    const tmap = {}; texts.forEach(x => { if (x && x.url) tmap[x.url] = x; });
    const tone = t => t in CODAL_PTS ? (CODAL_PTS[t] < 0 ? 'tone-neg' : 'tone-pos') : GROUP_NEWS.has(t) ? 'tone-grp' : '';
    const seen = Object.entries(c.last_seen || {}).filter(([, v]) => v).map(([k, v]) => `<span class="chip">${TYPE_FA[k] || k}: ${esc(faDigits(String(v).slice(0, 10)))}</span>`).join('');
    const canText = CAN.codal && !opt.readonly;
    let h = seen ? `<div class="chips"><span class="lbl">آخرین مورد از هر نوع:</span>${seen}</div>` : '';
    h += `<h4>اطلاعیه‌ها</h4>${(c.letters || []).map(l => { const tx = tmap[l.url];
      return `<div class="letter"><div class="lt"><div class="ttl"><span class="badge ${tone(l.type)}">${TYPE_FA[l.type] || esc(l.type)}</span> ${esc(fixFa(l.title))}
        <div class="muted small">${esc(faDigits(l.published))}</div></div><div class="acts"><a class="btn sm" href="${esc(l.url)}" target="_blank" rel="noopener">باز کردن</a>
        ${canText && !tx ? `<button class="btn sm" data-act="letter" data-url="${esc(l.url)}">متن</button>` : ''}</div></div>
        ${tx ? `<details open><summary class="small muted">متن اطلاعیه${tx.has_attachment ? ' — پیوست PDF دارد و خوانده نشد' : ''}</summary>${tx.error ? `<div class="err">${esc(tx.error)}</div>` : `<div class="txt">${esc(tx.text || '(متنی پیدا نشد)')}</div>`}</details>` : ''}</div>`; }).join('') || '<p class="muted">اطلاعیه‌ای نیامد.</p>'}`;
    if ((c.monthly_sales || []).length) h += `<h4>فروش ماهانه (جمع، میلیون ریال)</h4>${c.monthly_sales.map(m => `<div class="small"><b>${esc(faDigits(m.period))}</b> <span class="muted">(انتشار ${esc(faDigits(m.published))})</span></div>
      <table><tbody>${(m.groups_million_rial || []).map(g => `<tr><td>${esc(fixFa(g[0]))}</td><td>${num(g[1])}</td></tr>`).join('')}</tbody></table>`).join('')}`;
    h += `<h4>اخبار گروهی ۱۰ روز اخیر (همتایان)</h4>${(c.sector_regulatory_10d || []).length ? c.sector_regulatory_10d.map(x => `<div class="letter"><span class="badge ${tone(x.type)}">${TYPE_FA[x.type] || x.type}</span>
      <b>${esc(fixFa(x.symbol))}</b> — <a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(fixFa(x.title))}</a> <span class="muted small">${esc(faDigits(x.published))}</span></div>`).join('') : '<p class="muted small">خبری نبود.</p>'}`;
    return h;
  }

  // ---------------------------------------------------------------- text for Claude
  function claudeText(b, withPrompt) {
    const m = b.meta || {}, L = [`نماد: ${fixFa(b.symbol)}`];
    const extra = [m.horizon && `افق: ${m.horizon} روز`, m.position && `وضعیت: ${m.position}`, m.risk && `ریسک هر معامله: ${m.risk}٪ سرمایه`].filter(Boolean);
    if (extra.length) L.push(extra.join(' · '));
    L.push('', `داده‌ها با پنل «دیدبان پتروشیمی» (نسخهٔ ${PW_VERSION}) در ${tehranTime(b.collected_at)} به وقت تهران جمع شد. برای گام ۱ از همین خروجی‌ها استفاده کن؛ فقط بخشی را که خطا دارد یا نیامده دوباره بگیر.`);
    L.push('', '### petroSnapshot', b.tsetmc ? '```json\n' + JSON.stringify(b.tsetmc) + '\n```' : '(گرفته نشد)');
    L.push('', `### codalSnapshot (${b.codal_days || 120} روز)`, b.codal ? '```json\n' + JSON.stringify(b.codal) + '\n```' : '(گرفته نشد)');
    (b.letters || []).forEach(x => L.push('', `### codalLetterText — ${fixFa(x.title || x.url)}`, '```json\n' + JSON.stringify(x) + '\n```'));
    const s = L.join('\n');
    return withPrompt ? PW_PROMPT + '\n\n---\n\n' + s : s;
  }

  // ---------------------------------------------------------------- evaluation book
  function parseLogs(text) {
    const out = [], objs = String(text || '').match(/\{[^{}]*\}/g) || [];
    objs.forEach(s => { try { const o = JSON.parse(s); if (o && o.date && o.symbol && o.decision) {
      const p = latinDigits(o.date).split(/[/-]/).map(x => x.trim());
      if (p.length === 3) o.date = `${p[0]}/${p[1].padStart(2, '0')}/${p[2].padStart(2, '0')}`;
      o.symbol = fixFa(o.symbol); out.push(o); } } catch (e) { /* not a log line */ } });
    return out;
  }
  const keyOf = o => `${o.date}|${o.symbol}|${o.decision}`;

  // ---------------------------------------------------------------- panel UI
  const ICON = {
    logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>',
    wide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  const state = { open: false, running: false, tab: 'run', result: store.get('last', null), book: store.get('book', []), evalRes: store.get('evalRes', {}), steps: [] };
  let host = null, sh = null, $ = null, inline = false;

  function ensureFont() {
    try { if (document.getElementById('pw-vazirmatn')) return; const l = document.createElement('link'); l.id = 'pw-vazirmatn'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&display=swap'; (document.head || document.documentElement).appendChild(l); } catch (e) { /* CSP */ }
  }

  function modeText() {
    if (PW_GM) return 'حالت Tampermonkey: tsetmc و کدال هر دو از همین تب خوانده می‌شوند.';
    if (SITE === 'codal') return 'حالت بدون افزونه روی codal.ir: tsetmc و کدال هر دو از همین تب خوانده می‌شوند.';
    if (SITE === 'tsetmc') return 'حالت بدون افزونه روی tsetmc: فقط tsetmc خوانده می‌شود. برای کدال هم، پنل را روی codal.ir باز کنید یا نسخهٔ Tampermonkey را نصب کنید.';
    return 'در این صفحه فقط tsetmc خوانده می‌شود. کدال فقط روی codal.ir (Bookmarklet) یا با Tampermonkey.';
  }

  function shell() {
    const recent = store.get('recent', []);
    const opts = { days: 120, letters: true, prompt: false, ...store.get('opts', {}), t: true, c: CAN.codal };
    return `<style>${PW_CSS}</style><div class="pw${inline ? ' inline' : ''}" dir="rtl" lang="fa">
      ${inline ? '' : `<button class="fab" data-act="toggle" title="دیدبان پتروشیمی (Alt+P)">${ICON.logo}<span>دیدبان</span></button>`}
      <section class="panel${store.get('wide', false) ? ' wide' : ''}" role="dialog" aria-label="دیدبان پتروشیمی" ${inline ? '' : 'hidden'}>
        <header class="ph"><div class="brand">${ICON.logo}<b>دیدبان پتروشیمی</b><span class="ver">${esc(PW_VERSION)}</span></div>
          <div class="hbtns"><button class="icon" data-act="wide" title="پهن / باریک">${ICON.wide}</button>${inline ? '' : `<button class="icon" data-act="close" title="بستن (Esc)">${ICON.close}</button>`}</div></header>
        <nav class="tabs"><button data-tab="run" class="on">تحلیل نماد</button><button data-tab="book">کارنامه</button><button data-tab="help">راهنما و پرامپت</button></nav>
        <div class="body">
          <div data-pane="run">
            <form class="row symrow" data-form="run" autocomplete="off"><input class="inp" name="sym" list="pw-peers" placeholder="نماد، مثلاً شپدیس" value="${esc(store.get('sym', ''))}" required>
              <datalist id="pw-peers">${[...new Set([...recent, ...PEERS])].map(p => `<option value="${esc(p)}">`).join('')}</datalist>
              <button class="btn primary" type="submit" data-el="go">گرفتن داده</button></form>
            <div class="opts"><label><input type="checkbox" name="t" ${opts.t ? 'checked' : ''}> tsetmc</label><label><input type="checkbox" name="c" ${opts.c ? 'checked' : ''} ${CAN.codal ? '' : 'disabled'}> کدال</label>
              <label>روزهای کدال <input class="inp" type="number" name="days" min="10" max="365" value="${esc(opts.days)}"></label>
              <label><input type="checkbox" name="letters" ${opts.letters ? 'checked' : ''}> متن ۳ اطلاعیهٔ مهم</label></div>
            <details class="more"><summary>جزئیات برای Claude (اختیاری)</summary><div class="opts">
              <label>وضعیت <select class="inp" name="position" style="width:auto"><option value="">—</option><option>ندارم</option><option>دارم</option></select></label>
              <label>افق (روز) <input class="inp" type="number" name="horizon" min="1" max="60"></label><label>ریسک هر معامله (٪) <input class="inp" type="number" name="risk" step="0.5" min="0.1" max="10"></label></div></details>
            ${recent.length ? `<div class="recent">${recent.map(s => `<button class="chip" data-act="pick" data-sym="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}
            <div class="mode">${esc(modeText())}</div>
            <div class="steps" data-el="steps" hidden></div>
            <div data-el="result"></div>
          </div>
          <div data-pane="book" hidden></div>
          <div data-pane="help" hidden class="help"></div>
        </div>
        <div class="toast" data-el="toast" hidden></div>
      </section></div>`;
  }

  function toast(msg) { const el = $('[data-el="toast"]'); if (!el) return; el.textContent = msg; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2600); }

  function renderResult() {
    const box = $('[data-el="result"]'); if (!box) return;
    const b = state.result;
    if (!b) { box.innerHTML = '<div class="empty">نماد را بنویسید و «گرفتن داده» را بزنید.<br><span class="small">خروجی را با «کپی برای Claude» به عامل بدهید.</span></div>'; return; }
    const withPrompt = store.get('opts', {}).prompt;
    box.innerHTML = `<div class="toolbar"><button class="btn primary" data-act="copy-claude">کپی برای Claude</button>
      <label class="small muted"><input type="checkbox" data-el="with-prompt" ${withPrompt ? 'checked' : ''}> با پرامپت</label>
      <button class="btn" data-act="dl-json">دانلود JSON</button><button class="btn" data-act="merge-toggle">ادغام</button></div>
      <div class="merge" data-el="merge" hidden><textarea class="ta" data-el="merge-ta" placeholder="خروجی JSON پنل در تب دیگر (tsetmc یا کدال) را اینجا بچسبانید"></textarea>
      <div class="row" style="margin-top:6px"><button class="btn" data-act="merge">ادغام با نتیجهٔ فعلی</button></div></div>${dash(b)}`;
  }

  function renderSteps() {
    const el = $('[data-el="steps"]'); if (!el) return;
    el.hidden = !state.steps.length;
    const s = PW_NET.stats;
    el.innerHTML = state.steps.map(x => { const sec = x.st === 'run' ? Math.round((Date.now() - x.t) / 1000) : x.sec;
      return `<div class="step ${x.st}"><span class="dot"></span><span class="grow">${esc(x.label)}</span><span class="muted">${sec != null ? nf(sec) + ' ث' : ''}</span></div>`; }).join('')
      + `<div class="small muted" style="margin-top:4px">درخواست‌ها: ${nf(s.done)} از ${nf(s.total)}${s.failed ? ' · ناموفق ' + nf(s.failed) : ''}</div>${state.running ? `<div class="netline">${esc(s.last)}</div>` : ''}`;
  }

  function renderBook() {
    const pane = $('[data-pane="book"]'); if (!pane) return;
    const book = state.book, ev = state.evalRes || {};
    const rows = book.map(o => ({ o, r: ev[keyOf(o)] }));
    const stat = k => { const xs = rows.filter(x => x.r && x.r['right_' + k + 'd'] !== undefined && x.r['right_' + k + 'd'] !== null); const ok = xs.filter(x => x.r['right_' + k + 'd']).length; return { n: xs.length, ok }; };
    const s1 = stat(1), s5 = stat(5), s20 = stat(20);
    const box = (lbl, s) => `<div><span class="lbl">${lbl}</span><b>${s.n ? nf(s.ok) + ' از ' + nf(s.n) : '—'}</b><span class="small muted">${s.n ? nf(100 * s.ok / s.n) + '٪ درست' : ''}</span></div>`;
    pane.innerHTML = wrapTables(`<p class="small muted">خط ثبت JSON که Claude در پایان هر برگه می‌دهد را اینجا بچسبانید (یک یا چند خط). ارزیابی در افق ۵ روز معنا دارد؛ یک روز مخالف، شکست روش نیست.</p>
      <textarea class="ta" data-el="book-ta" placeholder='{"date":"1405/07/05","symbol":"شپدیس","decision":"NO_EDGE","ref_price":12345}'></textarea>
      <div class="row" style="margin-top:6px"><button class="btn primary" data-act="book-add">افزودن به دفتر</button><button class="btn" data-act="book-eval" ${book.length ? '' : 'disabled'}>ارزیابی همه</button>
        <button class="btn" data-act="book-copy" ${book.length ? '' : 'disabled'}>کپی کارنامه برای Claude</button><button class="btn" data-act="book-dl" ${book.length ? '' : 'disabled'}>دانلود</button>
        <button class="btn danger" data-act="book-clear" ${book.length ? '' : 'disabled'}>پاک کردن دفتر</button></div>
      <div class="book-sum">${box('درستی ۱ روزه', s1)}${box('درستی ۵ روزه', s5)}${box('درستی ۲۰ روزه', s20)}</div>
      ${book.length ? `<table><thead><tr><th>تاریخ</th><th>نماد</th><th>تصمیم</th><th>قیمت مرجع</th><th>۱ روز</th><th>۵ روز</th><th>۲۰ روز</th><th>درست (۵ روز)</th><th></th></tr></thead><tbody>
      ${rows.map(({ o, r }, i) => `<tr><td>${esc(faDigits(o.date))}</td><td>${esc(o.symbol)}</td><td class="small">${esc(o.decision)}</td><td>${num(o.ref_price)}</td>
        <td>${r ? sgn(r.ret_1d_pct, 1, '٪') : '—'}</td><td>${r ? sgn(r.ret_5d_pct, 1, '٪') : '—'}</td><td>${r ? sgn(r.ret_20d_pct, 1, '٪') : '—'}</td>
        <td>${r && r.error ? `<span class="neg small">${esc(r.error)}</span>` : r && r.right_5d === true ? '<span class="pos">✓</span>' : r && r.right_5d === false ? '<span class="neg">✗</span>' : '—'}</td>
        <td><button class="icon" data-act="book-del" data-i="${i}" title="حذف">${ICON.close}</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">دفتر خالی است.</div>'}`);
  }

  function renderHelp() {
    const pane = $('[data-pane="help"]'); if (!pane) return;
    pane.innerHTML = `<h4>روش کار</h4><ol>
      <li>نماد را بنویسید و «گرفتن داده» را بزنید (حدود ۳۰ تا ۶۰ ثانیه).</li>
      <li>«کپی برای Claude» را بزنید و در گفت‌وگو با Claude بچسبانید. اگر پرامپت عامل را در Project یا System Prompt نگذاشته‌اید، گزینهٔ «با پرامپت» را روشن کنید.</li>
      <li>خط JSON پایان برگه را در تب «کارنامه» ذخیره کنید و هر هفته «ارزیابی همه» را بزنید.</li></ol>
      <div class="row"><button class="btn primary" data-act="copy-prompt">کپی پرامپت عامل</button><button class="btn" data-act="dl-prompt">دانلود پرامپت (.md)</button></div>
      <h4>برای عامل مرورگری</h4><p class="small">اگر Claude خودش مرورگر دارد، در حالت بدون افزونه تابع‌های اصلی در همین صفحه هم در دسترس‌اند: <code>petroSnapshot('نماد')</code>، <code>codalSnapshot('نماد', 120)</code>، <code>codalLetterText(url)</code>، <code>petroEvaluate([...])</code>. روی codal.ir هر چهار تابع کار می‌کنند.</p>
      <h4>حالت اجرا</h4><p class="small">${esc(modeText())}</p>
      <p class="small">میان‌بر: <code>Alt+P</code> باز و بسته کردن پنل.</p>
      <p class="small"><a href="${esc(PW_REPO)}" target="_blank" rel="noopener">مخزن GitHub</a> · <a href="${esc(PW_PAGES)}" target="_blank" rel="noopener">صفحهٔ نصب و نمایشگر</a></p>
      <p class="disc">این ابزار داده جمع می‌کند و تحلیل آموزشی/پژوهشی است؛ توصیهٔ سرمایه‌گذاری شخصی نیست.</p>`;
  }

  function setTab(tab) {
    state.tab = tab;
    sh.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    sh.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== tab; });
    if (tab === 'book') renderBook(); if (tab === 'help') renderHelp();
  }

  function readOpts() {
    const f = $('[data-pane="run"]');
    const g = n => f.querySelector(`[name="${n}"]`);
    const o = { days: Math.max(10, Math.min(365, +g('days').value || 120)), letters: g('letters').checked, prompt: store.get('opts', {}).prompt || false };
    store.set('opts', o);
    return { ...o, t: g('t').checked, c: g('c').checked && CAN.codal, position: g('position').value, horizon: g('horizon').value, risk: g('risk').value };
  }

  async function run(symRaw) {
    if (state.running) return;
    const sym = fixFa(String(symRaw || '').trim()); if (!sym) return;
    const o = readOpts();
    if (!o.t && !o.c) { toast('دست‌کم یکی از tsetmc یا کدال را انتخاب کنید.'); return; }
    state.running = true; store.set('sym', sym);
    const recent = [sym, ...store.get('recent', []).filter(x => x !== sym)].slice(0, 8); store.set('recent', recent);
    const go = $('[data-el="go"]'); go.disabled = true; go.textContent = 'در حال گرفتن…';
    PW_NET.reset(); state.steps = [];
    const t0 = Date.now();
    const step = label => { const x = { label, st: 'run', sec: null, t: Date.now() }; state.steps.push(x); renderSteps(); return (ok, extra) => { x.st = ok ? 'ok' : 'err'; x.sec = Math.round((Date.now() - x.t) / 1000); if (extra) x.label += ' — ' + extra; renderSteps(); }; };
    const tick = setInterval(renderSteps, 1000);
    const b = { tool: 'petro-watch', version: PW_VERSION, symbol: sym, collected_at: new Date().toISOString(), codal_days: o.days, tsetmc: null, codal: null, letters: [],
      meta: { position: o.position || null, horizon: o.horizon || null, risk: o.risk || null } };
    const jobs = [];
    if (o.t) { const end = step('قیمت، جریان پول، گروه و شاخص از tsetmc'); jobs.push(safe(() => PC.petroSnapshot(sym)).then(r => { b.tsetmc = r; end(!r.error, r.error); })); }
    if (o.c) { const end = step(`اطلاعیه‌های کدال (${nf(o.days)} روز) و اخبار گروه`); jobs.push(safe(() => PC.codalSnapshot(sym, o.days)).then(r => { b.codal = r; end(!r.error, r.error ? 'خطا' : nf(r.n_letters) + ' اطلاعیه'); })); }
    await Promise.all(jobs);
    if (o.letters && b.codal && !b.codal.error) {
      const pick = pickLetters(b.codal);
      if (pick.length) {
        const end = step(`متن ${nf(pick.length)} اطلاعیهٔ مهم`);
        for (const l of pick) { const r = await safe(() => PC.codalLetterText(l.url)); b.letters.push({ ...r, url: l.url, title: l.title, type: l.type, published: l.published }); }
        end(b.letters.every(x => !x.error));
      }
    }
    clearInterval(tick);
    state.running = false;
    step(`تمام شد در ${nf(Math.round((Date.now() - t0) / 1000))} ثانیه`)(true);
    state.result = b; store.set('last', b);
    go.disabled = false; go.textContent = 'گرفتن داده';
    renderResult();
  }

  async function fetchLetter(url, btn) {
    const b = state.result; if (!b || !b.codal) return;
    btn.disabled = true; btn.textContent = '…';
    const l = (b.codal.letters || []).find(x => x.url === url) || {};
    const r = await safe(() => PC.codalLetterText(url));
    b.letters = (b.letters || []).filter(x => x.url !== url); b.letters.push({ ...r, url, title: l.title, type: l.type, published: l.published });
    store.set('last', b);
    const body = sh.querySelector('.body'), y = body.scrollTop; renderResult(); body.scrollTop = y;
  }

  function mergeInto(b, text) {
    let x; try { x = JSON.parse(text); } catch (e) { const m = String(text).match(/\{[\s\S]*\}/); if (!m) throw new Error('JSON پیدا نشد'); x = JSON.parse(m[0]); }
    if (x.tool === 'petro-watch') { if (x.tsetmc && !b.tsetmc) b.tsetmc = x.tsetmc; if (x.codal && !b.codal) { b.codal = x.codal; b.codal_days = x.codal_days; } if (x.letters) b.letters = [...(b.letters || []), ...x.letters]; }
    else if (x.rubric && x.daily) b.tsetmc = x; else if (x.window_days && x.letters) b.codal = x; else throw new Error('قالب JSON شناخته نشد');
    return b;
  }

  async function onClick(e) {
    const el = e.target.closest('[data-act],[data-tab]'); if (!el) return;
    if (el.dataset.tab) return setTab(el.dataset.tab);
    const act = el.dataset.act, b = state.result;
    if (act === 'toggle') return toggle();
    if (act === 'close') return toggle(false);
    if (act === 'wide') { const p = sh.querySelector('.panel'); p.classList.toggle('wide'); store.set('wide', p.classList.contains('wide')); return; }
    if (act === 'pick') { const i = $('[name="sym"]'); i.value = el.dataset.sym; return run(i.value); }
    if (act === 'copy-claude' && b) { const wp = !!($('[data-el="with-prompt"]') || {}).checked; store.set('opts', { ...store.get('opts', {}), prompt: wp }); const txt = claudeText(b, wp); return toast(await copyText(txt) ? `کپی شد (${nf(Math.round(txt.length / 1000))} هزار نویسه)` : 'کپی نشد؛ از «دانلود JSON» استفاده کنید'); }
    if (act === 'dl-json' && b) return download(`petro-${b.symbol}-${jalLatin(new Date(b.collected_at)).replace(/\//g, '')}.json`, JSON.stringify(b, null, 2));
    if (act === 'merge-toggle') { const m = $('[data-el="merge"]'); m.hidden = !m.hidden; return; }
    if (act === 'merge' && b) { try { mergeInto(b, $('[data-el="merge-ta"]').value); store.set('last', b); renderResult(); toast('ادغام شد'); } catch (err) { toast('ادغام نشد: ' + err.message); } return; }
    if (act === 'letter') return fetchLetter(el.dataset.url, el);
    if (act === 'copy-prompt') return toast(await copyText(PW_PROMPT) ? 'پرامپت کپی شد' : 'کپی نشد');
    if (act === 'dl-prompt') return download('Petro_Agent_Prompt_FA.md', PW_PROMPT, 'text/markdown');
    if (act === 'book-add') {
      const add = parseLogs($('[data-el="book-ta"]').value);
      if (!add.length) return toast('خط ثبت معتبری پیدا نشد (date، symbol و decision لازم است)');
      const have = new Set(state.book.map(keyOf)); let n = 0; add.forEach(o => { if (!have.has(keyOf(o))) { state.book.push(o); have.add(keyOf(o)); n++; } });
      store.set('book', state.book); renderBook(); return toast(`${nf(n)} خط اضافه شد`);
    }
    if (act === 'book-del') { state.book.splice(+el.dataset.i, 1); store.set('book', state.book); return renderBook(); }
    if (act === 'book-clear') {
      if (el.dataset.armed !== '1') { el.dataset.armed = '1'; el.textContent = 'مطمئنید؟ دوباره بزنید'; setTimeout(() => { if (el.isConnected) { el.dataset.armed = ''; el.textContent = 'پاک کردن دفتر'; } }, 3000); return; }
      state.book = []; state.evalRes = {}; store.set('book', []); store.set('evalRes', {}); return renderBook();
    }
    if (act === 'book-eval') {
      el.disabled = true; el.textContent = 'در حال ارزیابی…';
      const res = await safe(() => PC.petroEvaluate(state.book.map(o => ({ ...o }))));
      if (res && res.error) { toast('خطا: ' + res.error); } else { res.forEach(r => { state.evalRes[keyOf(r)] = r; }); store.set('evalRes', state.evalRes); toast('ارزیابی شد'); }
      return renderBook();
    }
    if (act === 'book-copy') { const res = state.book.map(o => state.evalRes[keyOf(o)] || o); return toast(await copyText('ارزیابی:\n```json\n' + JSON.stringify(res) + '\n```') ? 'کارنامه کپی شد' : 'کپی نشد'); }
    if (act === 'book-dl') return download('petro-book.json', JSON.stringify(state.book.map(o => state.evalRes[keyOf(o)] || o), null, 2));
  }

  function wire() {
    sh.addEventListener('click', onClick);
    sh.addEventListener('submit', e => { e.preventDefault(); const f = e.target; if (f.dataset.form === 'run') run(f.querySelector('[name="sym"]').value); });
    sh.addEventListener('change', e => { if (e.target.matches('[data-el="with-prompt"]')) store.set('opts', { ...store.get('opts', {}), prompt: e.target.checked }); });
    if (!inline) {
      document.addEventListener('keydown', e => {
        if (e.altKey && (e.code === 'KeyP')) { e.preventDefault(); toggle(); }
        else if (e.key === 'Escape' && state.open) toggle(false);
      });
    }
  }

  function toggle(force) {
    if (!sh) mount();
    const p = sh.querySelector('.panel'), open = force === undefined ? p.hidden : force;
    p.hidden = !open; state.open = open;
    if (open) { renderResult(); autoSymbol(); const i = $('[name="sym"]'); if (i && !i.value) i.focus(); }
  }

  async function autoSymbol() {
    // on a tsetmc instrument page (/instInfo/<insCode>) fill the symbol from the page's instrument
    try {
      const m = SITE === 'tsetmc' && location.pathname.match(/instInfo\/(\d+)/i); if (!m) return;
      const i = $('[name="sym"]'); if (!i || i.dataset.auto === m[1]) return;
      const r = await PW_NET.fetch(`https://cdn.tsetmc.com/api/Instrument/GetInstrumentInfo/${m[1]}`); const j = await r.json();
      const s = j && j.instrumentInfo && j.instrumentInfo.lVal18AFC; if (s) { i.value = fixFa(s).trim(); i.dataset.auto = m[1]; }
    } catch (e) { /* ignore */ }
  }

  function mount(container) {
    if (sh) return api;
    inline = !!container;
    host = container || document.createElement('div');
    if (!container) { host.id = 'petro-watch-root'; host.style.cssText = 'all:initial'; document.documentElement.appendChild(host); }
    sh = host.attachShadow({ mode: 'open' });
    $ = sel => sh.querySelector(sel);
    ensureFont();
    sh.innerHTML = shell();
    PW_NET.onEvent = () => { if (state.running) renderSteps(); };
    wire();
    if (inline) renderResult();
    return api;
  }

  // read-only dashboard (GitHub Pages viewer)
  function renderInto(el, data) {
    ensureFont();
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    let b = data;
    if (b && b.tool !== 'petro-watch') { b = { tool: 'petro-watch', symbol: (b.symbol || ''), collected_at: b.generated_at || new Date().toISOString(), tsetmc: null, codal: null, letters: [] }; mergeInto(b, JSON.stringify(data)); }
    root.innerHTML = `<style>${PW_CSS}</style><div class="pw inline${el.clientWidth > 700 ? ' wide' : ''}" dir="rtl" lang="fa"><div class="body" style="padding:0">${dash(b, { readonly: true })}</div></div>`;
    return b;
  }

  const api = { version: PW_VERSION, site: SITE, can: CAN, mount, open: () => toggle(true), close: () => toggle(false), toggle, renderInto, claudeText, prompt: PW_PROMPT, collectors: PC };
  return api;
})();

// expose for console / bookmarklet use (and for a browsing agent)
try {
  window.PetroWatch = PetroWatch;
  if (!PW_GM) ['petroSnapshot', 'petroEvaluate', 'codalSnapshot', 'codalLetterText'].forEach(k => { if (typeof window[k] !== 'function') window[k] = PC[k]; });
} catch (e) { /* sandbox */ }
if (PetroWatch.site !== 'other') { if (window.top === window.self) { PetroWatch.mount(); if (!PW_GM) PetroWatch.open(); } }

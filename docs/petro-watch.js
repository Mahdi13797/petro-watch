/* دیدبان پتروشیمی 2.1.0 — https://github.com/Mahdi13797/petro-watch */
(function () {
const PW_VERSION = "2.1.0";
const PW_REPO = "https://github.com/Mahdi13797/petro-watch";
const PW_PAGES = "https://mahdi13797.github.io/petro-watch/";
const PW_CSS = ":host { all: initial; }\n.pw {\n  --bg: #ffffff; --surface: #f5f6f8; --surface2: #eceff3; --line: #dfe3e8; --text: #16191d; --muted: #5b6470;\n  --accent: #0f6e66; --accent-soft: #e2f2f0; --accent-ink: #ffffff;\n  --pos: #137a3e; --pos-soft: #e3f4ea; --neg: #b42318; --neg-soft: #fbe7e5; --warn: #9a5b00; --warn-soft: #fdf1dc;\n  --shadow: 0 10px 30px rgba(16, 24, 40, .18), 0 2px 6px rgba(16, 24, 40, .08);\n  font-family: Vazirmatn, \"Vazirmatn\", Tahoma, \"Segoe UI\", sans-serif; font-size: 13px; line-height: 1.65; color: var(--text);\n  direction: rtl; text-align: right; -webkit-font-smoothing: antialiased;\n}\n@media (prefers-color-scheme: dark) {\n  .pw {\n    --bg: #14171b; --surface: #1c2025; --surface2: #242930; --line: #2e343c; --text: #e8ebef; --muted: #9aa3ae;\n    --accent: #3cc7b5; --accent-soft: #173a36; --accent-ink: #06201d;\n    --pos: #4ccf85; --pos-soft: #16311f; --neg: #ff7b6e; --neg-soft: #3a1b18; --warn: #f2b84b; --warn-soft: #3a2c12;\n    --shadow: 0 10px 30px rgba(0, 0, 0, .5);\n  }\n}\n.pw *, .pw *::before, .pw *::after { box-sizing: border-box; }\n.pw button, .pw input, .pw select, .pw textarea { font: inherit; color: inherit; }\n.pw [hidden] { display: none !important; }\n\n/* floating button + panel */\n.fab { position: fixed; left: 16px; bottom: 16px; z-index: 2147483646; display: flex; align-items: center; gap: 6px;\n  border: 0; border-radius: 999px; padding: 9px 14px; background: var(--accent); color: var(--accent-ink); font-weight: 700;\n  box-shadow: var(--shadow); cursor: pointer; }\n.fab svg { width: 18px; height: 18px; }\n.panel { position: fixed; left: 16px; top: 16px; bottom: 16px; z-index: 2147483647; width: min(480px, calc(100vw - 32px));\n  display: flex; flex-direction: column; background: var(--bg); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); overflow: hidden; }\n.panel.wide { width: min(860px, calc(100vw - 32px)); }\n.inline .panel { position: relative; left: auto; top: auto; bottom: auto; width: auto; box-shadow: none; max-height: none; }\n.ph { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--line); background: var(--surface); }\n.brand { display: flex; align-items: center; gap: 8px; font-size: 14px; }\n.brand svg { width: 20px; height: 20px; color: var(--accent); }\n.ver { font-size: 11px; color: var(--muted); border: 1px solid var(--line); border-radius: 6px; padding: 0 6px; }\n.hbtns { display: flex; gap: 4px; }\n.icon { border: 0; background: transparent; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; color: var(--muted); display: grid; place-items: center; }\n.icon:hover { background: var(--surface2); color: var(--text); }\n.icon svg { width: 16px; height: 16px; }\n.tabs { display: flex; gap: 2px; padding: 6px 10px 0; border-bottom: 1px solid var(--line); }\n.tabs button { border: 0; background: transparent; padding: 7px 12px; cursor: pointer; color: var(--muted); border-bottom: 2px solid transparent; }\n.tabs button.on { color: var(--text); border-bottom-color: var(--accent); font-weight: 700; }\n.body { flex: 1; overflow: auto; padding: 12px 14px 24px; }\n\n/* controls */\n.btn { border: 1px solid var(--line); background: var(--bg); border-radius: 9px; padding: 6px 12px; cursor: pointer; white-space: nowrap; }\n.btn:hover { background: var(--surface2); }\n.btn.primary { background: var(--accent); color: var(--accent-ink); border-color: transparent; font-weight: 700; }\n.btn.primary:hover { filter: brightness(1.07); }\n.btn.danger { color: var(--neg); }\n.btn.sm { padding: 2px 8px; font-size: 12px; border-radius: 7px; }\n.btn:disabled { opacity: .55; cursor: default; }\n.inp { border: 1px solid var(--line); background: var(--bg); border-radius: 9px; padding: 6px 10px; min-width: 0; }\n.inp:focus, .btn:focus-visible, .ta:focus { outline: 2px solid var(--accent); outline-offset: 1px; }\n.ta { width: 100%; min-height: 96px; border: 1px solid var(--line); border-radius: 9px; padding: 8px; background: var(--bg); direction: ltr; text-align: left; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; }\n.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\n.row.between { justify-content: space-between; }\n.grow { flex: 1; }\n.symrow .inp { flex: 1; font-size: 15px; font-weight: 700; }\n.opts { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 8px 0 2px; color: var(--muted); font-size: 12px; }\n.opts label { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }\n.opts .inp { width: 64px; padding: 2px 6px; }\n.recent { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }\n.chip { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 1px 9px; font-size: 12px; }\nbutton.chip { cursor: pointer; }\nbutton.chip:hover { border-color: var(--accent); }\n.chip.off { opacity: .5; }\n.mode { margin-top: 8px; font-size: 12px; color: var(--muted); }\ndetails.more { margin-top: 6px; }\ndetails.more > summary { cursor: pointer; color: var(--muted); font-size: 12px; }\n\n/* run steps */\n.steps { margin: 12px 0 0; padding: 10px 12px; background: var(--surface); border-radius: 10px; font-size: 12px; }\n.step { display: flex; gap: 8px; align-items: center; }\n.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; }\n.step.run .dot { background: var(--accent); animation: pulse 1s infinite; }\n.step.ok .dot { background: var(--pos); }\n.step.err .dot { background: var(--neg); }\n.netline { color: var(--muted); direction: ltr; text-align: left; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11px; margin-top: 4px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n@keyframes pulse { 50% { opacity: .35; } }\n@media (prefers-reduced-motion: reduce) { .step.run .dot { animation: none; } }\n\n/* result */\n.toolbar { position: sticky; top: -12px; z-index: 2; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 12px -14px 10px; padding: 8px 14px; background: var(--bg); border-bottom: 1px solid var(--line); }\n.card { border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 10px; background: var(--bg); }\n.head .h-top { display: flex; justify-content: space-between; gap: 12px; }\n.sym { font-size: 22px; font-weight: 800; line-height: 1.2; }\n.px { text-align: left; white-space: nowrap; }\n.big { font-size: 20px; font-weight: 800; }\n.chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }\n.badge { display: inline-block; border-radius: 6px; padding: 0 7px; font-size: 12px; background: var(--surface2); }\n.badge.ok { background: var(--pos-soft); color: var(--pos); }\n.badge.warn { background: var(--warn-soft); color: var(--warn); }\n.badge.bad { background: var(--neg-soft); color: var(--neg); }\n.badge.hot { background: var(--neg-soft); color: var(--neg); }\n.badge.cold { background: #e4ecfb; color: #2352a3; }\n@media (prefers-color-scheme: dark) { .badge.cold { background: #1a2740; color: #8fb1ff; } }\n.muted { color: var(--muted); }\n.small { font-size: 12px; }\n.lbl { color: var(--muted); font-size: 12px; }\n.n { direction: ltr; unicode-bidi: isolate; display: inline-block; font-variant-numeric: tabular-nums; }\n.pos { color: var(--pos); }\n.neg { color: var(--neg); }\n.note { background: var(--surface); border-radius: 9px; padding: 8px 10px; margin: 8px 0; font-size: 12px; }\n.note.warn { background: var(--warn-soft); color: var(--warn); }\n.note.bad { background: var(--neg-soft); color: var(--neg); }\nul.warns { margin: 8px 0 0; padding: 0 18px 0 0; color: var(--warn); font-size: 12px; }\n\n.sum .top { display: flex; flex-wrap: wrap; gap: 6px 16px; justify-content: space-between; }\n.score { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; margin: 12px 0 6px; }\n.sc-num { font-size: 28px; font-weight: 800; min-width: 44px; text-align: center; }\n.edge { border-radius: 10px; padding: 6px 10px; text-align: center; font-weight: 700; background: var(--surface2); }\n.edge.buy { background: var(--pos-soft); color: var(--pos); }\n.edge.sell { background: var(--neg-soft); color: var(--neg); }\n.edge .small { font-weight: 400; }\n.probs { margin: 8px 0; }\n.pb { display: grid; grid-template-columns: 52px 1fr 110px; gap: 8px; align-items: center; margin: 3px 0; }\n.track { position: relative; height: 10px; background: var(--surface2); border-radius: 5px; overflow: visible; }\n.fill { position: absolute; inset-inline-start: 0; top: 0; bottom: 0; background: var(--accent); border-radius: 5px; }\n.base { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--text); opacity: .7; }\n.pv { font-size: 12px; }\n.kv4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }\n.kv4 > div { background: var(--surface); border-radius: 8px; padding: 5px 8px; }\n.kv4 b { display: block; font-size: 14px; }\n.hints { margin-top: 10px; border-top: 1px dashed var(--line); padding-top: 8px; }\n.hints ul { margin: 4px 0; padding: 0 18px 0 0; }\n.trade { margin-top: 8px; font-size: 12px; }\n.tline { margin-top: 8px; font-size: 12px; }\n\ndetails.sec { border: 1px solid var(--line); border-radius: 12px; margin-bottom: 10px; background: var(--bg); }\ndetails.sec > summary { cursor: pointer; padding: 9px 12px; font-weight: 700; list-style: none; display: flex; justify-content: space-between; align-items: center; }\ndetails.sec > summary::-webkit-details-marker { display: none; }\ndetails.sec > summary::after { content: \"+\"; color: var(--muted); font-weight: 400; }\ndetails.sec[open] > summary::after { content: \"−\"; }\ndetails.sec > .in { padding: 0 12px 12px; }\n.kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 14px; }\n.wide .kv { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n.kv > div { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dotted var(--line); padding: 3px 0; }\n.kv > div > span:first-child { color: var(--muted); font-size: 12px; }\n.tw { overflow-x: auto; }\ntable { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }\nth { text-align: right; color: var(--muted); font-weight: 500; border-bottom: 1px solid var(--line); padding: 4px 6px; }\ntd { border-bottom: 1px solid var(--line); padding: 4px 6px; vertical-align: top; }\ntr.cur td { background: var(--accent-soft); font-weight: 700; }\ntr.nr td:first-child, tr.ns td:first-child { font-weight: 700; }\n.tag { font-size: 11px; border-radius: 5px; padding: 0 5px; background: var(--surface2); color: var(--muted); font-weight: 400; }\n.candles { width: 100%; height: 96px; direction: ltr; display: block; margin-top: 8px; }\n.candles .up { stroke: var(--pos); fill: var(--pos); }\n.candles .dn { stroke: var(--neg); fill: var(--neg); }\n.candles .vw { stroke: var(--accent); stroke-dasharray: 4 3; }\n.axis { display: flex; justify-content: space-between; direction: ltr; font-size: 11px; color: var(--muted); }\n\n.letter { border-bottom: 1px solid var(--line); padding: 7px 0; }\n.letter .lt { display: flex; gap: 6px; align-items: flex-start; justify-content: space-between; }\n.letter .ttl { flex: 1; }\n.letter .acts { display: flex; gap: 4px; flex: none; }\n.letter a { color: var(--accent); text-decoration: none; }\n.tone-neg { background: var(--neg-soft); color: var(--neg); }\n.tone-pos { background: var(--pos-soft); color: var(--pos); }\n.tone-grp { background: var(--warn-soft); color: var(--warn); }\n.txt { white-space: pre-wrap; background: var(--surface); border-radius: 8px; padding: 8px; margin-top: 6px; max-height: 260px; overflow: auto; font-size: 12px; }\nh4 { margin: 12px 0 4px; font-size: 13px; }\n.disc { color: var(--muted); font-size: 11px; margin-top: 14px; }\n.err { background: var(--neg-soft); color: var(--neg); border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; }\n.empty { color: var(--muted); text-align: center; padding: 28px 10px; }\n.merge { margin: 0 0 10px; }\n.book-sum { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }\n.book-sum > div { background: var(--surface); border-radius: 9px; padding: 6px 10px; }\n.book-sum b { display: block; font-size: 16px; }\n.help ol { padding: 0 18px 0 0; margin: 6px 0; }\n.help li { margin: 4px 0; }\n.help code { direction: ltr; unicode-bidi: isolate; background: var(--surface2); border-radius: 5px; padding: 0 4px; font-size: 12px; }\n.toast { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); background: var(--text); color: var(--bg); border-radius: 9px; padding: 6px 14px; font-size: 12px; box-shadow: var(--shadow); max-width: 90%; }\n@media (max-width: 560px) {\n  .panel { left: 8px; right: 8px; top: 8px; bottom: 8px; width: auto; }\n  .kv, .wide .kv { grid-template-columns: 1fr; }\n  .kv4 { grid-template-columns: repeat(2, 1fr); }\n}\n";
const PW_PROMPT = "# پرامپت عامل «دیدبان پتروشیمی» — نسخهٔ ۲٫۱\n\n> **روش استفاده:** کل این متن را به‌عنوان System Prompt (یا اولین پیام) به Claude بدهید و بعد بنویسید:\n> `نماد: شپدیس` — و در صورت تمایل: `افق: ۳ روز` · `وضعیت: دارم / ندارم` · `ریسک هر معامله: ۱٪ سرمایه`\n> برای سنجش کار عامل: `ارزیابی: [خطوط ثبت پیش‌بینی‌های قبلی]`\n>\n> عامل به مرورگری با دسترسی به tsetmc.com و codal.ir نیاز دارد (مرورگر داخل اپ Claude یا Claude in Chrome روی کامپیوتری در ایران). اگر مرورگر نبود، اسکریپت‌های پیوست را در Console مرورگر خودتان اجرا کنید و خروجی JSON را بفرستید.\n\n**تفاوت با نسخهٔ ۱** (بعد از اجرای واقعی روی «تابان» و آزمون ۱۳ ساله):\n1. کالیبراسیون از «فقط ۱۴۰۳» به **۱۳ سال (۱۳۹۲ تا ۱۴۰۵، ۶۲ سهم گروه ۴۴، حدود ۹۴ هزار روز-سهم)** گسترش یافت و با **walk-forward** آزمون شد (هر سال فقط با داده‌های سال‌های قبل پیش‌بینی شد).\n2. احتمال‌ها حالا **به رژیم گروه وابسته‌اند** (داغ / عادی / سرد). در نسخهٔ ۱ یک جدول واحد برای همهٔ بازارها بود و در بازار داغ سیگنال فروش بیش از حد می‌داد: در ۱۴۰۵ فقط ۲۶٪ سیگنال‌های فروش نسخهٔ ۱ درست درآمد.\n3. امتیازها با دادهٔ ۱۳ ساله دوباره برآورد شد؛ ردیف‌هایی که اثر پایدار نداشتند حذف شدند (شکست کف ۲۰ روزه، روند نزولی ADX، خروج/ورود پول ۵ روزه، جریان پول گروه، سهامداران عمده).\n4. **دفترچهٔ عرضهٔ اولیه (IPO)** با دادهٔ ۱۹۲ عرضهٔ اولیهٔ ۱۳۹۶ تا ۱۴۰۵ اضافه شد.\n5. **خوانش نمودار** به ماژول مستقل تبدیل شد: سطوح کلیدی، ساختار، گره‌های حجمی و VWAP لنگر؛ برای ورود، حد ضرر و هدف.\n6. خروجی حالا **سناریو و ماشهٔ «اگر… آن‌گاه…»** دارد، نه فقط یک حکم؛ و قضاوت تحلیلگر سقف ±۱ دارد.\n7. **ارزیابی خودکار** پیش‌بینی‌های قبلی با `petroEvaluate` و اصلاح چند خطای اسکریپت.\n8. (نسخهٔ ۲٫۱) **روند چندافقی** (روزانه، هفتگی، یک‌ساله، هم‌راستایی و کانال روند ۶۰ روزه) با دادهٔ ۱۳ ساله آزمون شد و بلوک `trend` به اسکریپت اضافه شد. فیلد `weekly` در نسخهٔ ۲ نام برده شده بود ولی اسکریپت آن را نمی‌ساخت؛ درست شد. قاعدهٔ استفاده: بخش ۴-۱-ب.\n\n---\n\n## ۱. نقش\nتو **تحلیلگر ارشد بازار سرمایهٔ ایران با تخصص صنعت پتروشیمی** و مدیر ریسک هستی. این‌ها را حرفه‌ای بلدی:\n- **خوانش نمودار چندافقی:** ساختار روند (HH/HL، LH/LL)، سطوح حمایت و مقاومت، گپ‌ها، گره‌های حجمی (volume-by-price)، VWAP روزانه و VWAP لنگر (anchored VWAP)، رفتار کندل در سطوح؛ در افق‌های ۵ و ۱۰ دقیقه، روزانه، هفتگی و یک‌ساله. اندیکاتورها (RSI، MACD، Bollinger، ADX، Ichimoku) را هم می‌شناسی.\n- **ریزساختار بازار ایران:** دامنهٔ نوسان و تغییرات تاریخی آن، صف خرید و فروش، قیمت پایانی (میانگین وزنی) در برابر آخرین معامله، تعدیل قیمت بعد از مجمع و افزایش سرمایه، بازگشایی نماد، بازارگردان‌ها، عرضهٔ اولیه.\n- **جریان پول حقیقی/حقوقی** و تغییرات سهامداران بالای ۱٪.\n- **کدال:** انواع اطلاعیه، زمان انتشار نسبت به ساعت بازار، و اثر تاریخی هر نوع.\n- **اقتصاد پتروشیمی:** نرخ گاز خوراک و سوخت، سرویس‌های جانبی، نرخ ارز صادراتی، قیمت جهانی متانول/اوره/پلیمرها، فروش در بورس کالا، قطعی گاز زمستان، تعمیرات اساسی، تحریم؛ و برای هلدینگ‌ها، NAV و P/NAV.\n- **آمار تصمیم:** نرخ پایه (base rate)، لبه (edge) نسبت به نرخ پایه، کالیبراسیون، ارزش مورد انتظار (EV)، و اینکه نتیجهٔ یک روز یا یک معامله دربارهٔ درستی روش چیزی نمی‌گوید.\n\n## ۲. خروجی مورد انتظار\nیک **برگهٔ تصمیم یک‌صفحه‌ای** که بگوید در جلسهٔ بعدی بازار چه کنیم: خرید، فروش، نگهداری یا «بدون لبه، کاری نکن». همراه با احتمال کالیبره‌شده، لبه نسبت به نرخ پایه، سه سناریوی جلسهٔ بعد با اقدام هر سناریو، ماشه‌های «اگر… آن‌گاه…»، حد ضرر، هدف، سطوح نمودار، دلایل مستند و شرط باطل‌شدن.\n\n## ۳. قواعد غیرقابل‌تخطی\n1. **عدد نساز.** هر عدد از دادهٔ جمع‌آوری‌شده (با تاریخ و ساعت) یا از جدول‌های این پرامپت می‌آید.\n2. **قطعیت ممنوع.** احتمال را مثل پیش‌بینی هوا بگو: «در موقعیت‌های مشابه، ۶ بار از ۱۰ بار قیمت در ۵ روز بالا رفت».\n3. **«بدون لبه» را با «منفی» قاطی نکن.** اگر احتمال بالا رفتن با نرخ پایهٔ همان رژیم کمتر از ۸ واحد درصد فاصله دارد، تصمیم «بدون لبه» است، نه «نخر» یا «بفروش». نسخهٔ ۱ در تابان همین خطا را کرد.\n4. **جدول را بیرون از دامنه‌اش به کار نبر.** سهم تازه‌عرضه (کمتر از ۱۲۰ روز)، نماد تازه بازگشایی‌شده، یا سهم با کمتر از ۶۰ روز سابقه جدول مخصوص خودش را دارد (بخش ۴-۶) یا بدون کالیبراسیون گزارش می‌شود.\n5. **قضاوت سقف دارد.** تعدیل قضاوتی حداکثر ±۱ است، باید دلیل داده‌ای مکتوب داشته باشد و به‌تنهایی حق ندارد تصمیم را از یک ناحیه به ناحیهٔ دیگر ببرد.\n6. **قابلیت اجرا:** سهم در صف خرید قابل خرید نیست و سهم در صف فروش قابل فروش نیست.\n7. **تازگی داده:** اگر قیمت یا شاخص مربوط به امروز نیست، یا نماد متوقف است، اول همین را بگو.\n8. **هشدار الزامی:** «این تحلیل آموزشی/پژوهشی است و توصیهٔ سرمایه‌گذاری شخصی نیست؛ مسئولیت تصمیم با معامله‌گر است.»\n9. از اطلاعات نهانی، شایعهٔ بی‌منبع یا توصیه به دستکاری بازار استفاده نکن.\n\n## ۴. روند کار\n\n### گام ۰ — زمان و وضعیت بازار\nساعت تهران؛ روزهای معاملاتی شنبه تا چهارشنبه، پیش‌گشایش حدود ۸:۴۵ و معاملات ۹:۰۰ تا ۱۲:۳۰ (اگر عوض شده از tsetmc بخوان). اگر بعد از بازار است، برنامه برای جلسهٔ بعد است؛ اگر حین بازار است، برای باقی جلسه و جلسهٔ بعد.\n\n### گام ۱ — جمع‌آوری داده\n1. تب `https://www.tsetmc.com`: `await petroSnapshot('نماد')` (پیوست ب).\n2. تب `https://www.codal.ir`: `codalSnapshot('نماد', 120).then(r => window.cs = r)` و بعد `window.cs` را بخوان. اگر `error` داشت (معمولاً خطای 429)، یک دقیقه صبر کن و دوباره اجرا کن. خروجی خطادار را «اطلاعیه‌ای نبود» تفسیر نکن.\n3. متن ۱ تا ۳ اطلاعیهٔ مهم را با `await codalLetterText(url)` بخوان. اگر عدد اصلی در پیوست PDF است، صریحاً بگو «عدد در پیوست است و خوانده نشد».\n4. با جست‌وجوی وب (اگر داری): نرخ دلار آزاد و نرخ مرکز مبادله، روند ۲ هفتهٔ قیمت جهانی محصول اصلی، اخبار کلان ۴۸ ساعت اخیر. منبع بده.\n5. اگر کاربر خطوط ثبت پیش‌بینی قبلی را داد: `await petroEvaluate([...])` و کارنامه را گزارش کن.\n\n### گام ۲ — کنترل کیفیت داده\n- `daily.live_row` و `daily.date`: قیمت مال امروز است؟ `instrument.state` مجاز است؟\n- `warnings`: سابقهٔ کوتاه، نیامدن دادهٔ درون‌روز، و غیره.\n- `group.chem44_index.live_appended`: اگر شاخص امروز از منبع زنده اضافه شده، بگو.\n- `adjustments_last_year`: مجمع یا افزایش سرمایه در ۵ روز اخیر → حالت ویژه (گام ۳).\n- نقدشوندگی: ارزش معاملات ۲۰ روزه کمتر از ۵۰ میلیارد ریال → یک پله اطمینان کمتر.\n\n### گام ۳ — تشخیص «موقعیت» قبل از هر تحلیل (جدید)\nدقیقاً یکی را انتخاب کن و در برگه بنویس:\n\n| موقعیت | نشانه در داده | جدول معتبر |\n|---|---|---|\n| A. عرضهٔ اولیه / تازه‌عرضه | بلوک `ipo` وجود دارد (≤۱۲۰ روز) | فقط دفترچهٔ IPO (بخش ۴-۶) |\n| B. بازگشایی بعد از توقف یا مجمع | اولین روز بعد از توقف طولانی یا تعدیل در ۵ روز اخیر | بدون کالیبراسیون؛ سناریو بده |\n| C. سابقهٔ کوتاه | `history_days` < ۶۰ | بدون کالیبراسیون |\n| D. عادی | هیچ‌کدام | جدول رژیم (گام ۶) |\n\nو **رژیم گروه** را از `group.regime` بخوان: **داغ** (شاخص ۴۴ در ۲۰ روز بیش از +۱۰٪)، **سرد** (کمتر از −۵٪)، **عادی** (بقیه). در ۱۳ سال، نرخ پایهٔ «بالا رفتن در ۵ روز» در بازار داغ ۵۷٪، در عادی ۴۷٪ و در سرد ۴۶٪ بود؛ پس یک امتیاز منفی در بازار داغ معنای متفاوتی با بازار عادی دارد.\n\n### گام ۴ — ماژول‌ها\n\n#### ۴-۱. خوانش نمودار (Chart reading)\nاز بلوک `chart` و `daily` استفاده کن و این‌ها را صریح بنویس:\n- **ساختار:** `chart.structure` (HH/HL صعودی، LH/LL نزولی، رنج).\n- **سطوح:** نزدیک‌ترین حمایت و مقاومت (`nearest_support`، `nearest_resistance`) و فهرست `levels_sorted_high_to_low` (سقف و کف دیروز، آخرین سقف و کف چرخشی، سقف و کف ۲۰ روزه، SMA20/50، VWAP لنگر، گره‌های حجمی، قیمت عرضهٔ اولیه).\n- **چندافقی:** درون‌روز (VWAP و کندل‌های ۵ دقیقه‌ای `intraday_today`)، و روند روزانه، هفتگی و یک‌ساله از بلوک `trend` (بخش ۴-۱-ب).\n\n**آنچه آزمون ۱۳ ساله دربارهٔ نمودار نشان داد (مهم):**\n- سطوح و الگوهای کلاسیک **جهت را پیش‌بینی نکردند**: بسته‌شدن بالای آخرین سقف چرخشی، لمس حمایت و برگشت، شکست کف چرخشی و ساختار HH/HL، نسبت به گروه کمتر از ۱٫۵ واحد درصد لبه داشتند. «حمایت نگه داشت پس بخر» در دادهٔ ما کار نکرد.\n- آنچه جهت را پیش‌بینی کرد **رفتار قیمت در انتهای جلسه و جریان پول** بود (جدول زیر).\n- پس از نمودار برای **اجرا** استفاده کن: ورود نزدیک حمایت یا VWAP، حد ضرر زیر ساختار، هدف در مقاومت بعدی؛ نه برای تعیین جهت.\n\nدرصد موقعیت‌هایی که سهم در ۵ روز از شاخص گروه جلو زد (۱۳۹۲ تا ۱۴۰۵؛ نرخ پایه ۴۷٪)، و پایداری در ۵ دورهٔ بازار:\n\n| سیگنال | موفقیت ۵ روزه | لبه | در چند دوره از ۵ دوره هم‌جهت بود |\n|---|---|---|---|\n| پول هوشمند حقیقی (سرانهٔ خرید > ۲ برابر معمول و قدرت خریدار > ۱٫۵) | ۶۱٪ | +۱۴ | ۵ از ۵ |\n| بسته‌شدن در صف خرید | ۶۰٪ | +۱۲ | ۵ از ۵ |\n| قدرت خریدار حقیقی > ۲ | ۵۹٪ | +۱۲ | ۵ از ۵ |\n| بالای باند بالای Bollinger | ۵۳٪ | +۵ | ۵ از ۵ |\n| شکست سقف ۲۰ روزه | ۵۲٪ | +۵ | ۵ از ۵ |\n| تقاطع MACD رو به بالا | ۵۱٪ | +۴ | ۴ از ۵ |\n| شکست کف ۲۰ روزه | ۴۶٪ | −۱ | ۲ از ۵ (ناپایدار؛ حذف شد) |\n| RSI < ۳۰ (سیگنال خرید نیست) | ۴۲٪ | −۵ | ۵ از ۵ |\n| قدرت خریدار < ۰٫۵ | ۴۲٪ | −۵ | ۵ از ۵ |\n| ضعف انتهای جلسه (آخرین ۱٪ زیر پایانی) | ۳۶٪ | −۱۲ | ۵ از ۵ |\n| بسته‌شدن در صف فروش | ۳۵٪ | −۱۳ | ۵ از ۵ |\n\n#### ۴-۱-ب. روند چندافقی (Trend)\nاز بلوک `trend` بخوان و در برگه **همیشه** بنویس:\n- `trend.daily`: روند روزانه؛ صعودی یعنی قیمت > SMA20 > SMA50 > SMA100.\n- `trend.weekly`: روند هفتگی از هفته‌های کامل‌شده؛ صعودی یعنی بستهٔ هفتگی > میانگین ۱۰ هفته > میانگین ۳۰ هفته، و میانگین ۱۰ هفته رو به بالا.\n- `trend.weekly_structure`: سقف و کف ۴ هفتهٔ اخیر در برابر ۴ هفتهٔ قبل (HH/HL یا LH/LL).\n- `trend.yearly`: روند یک‌ساله؛ صعودی یعنی قیمت بالای SMA200 و SMA200 رو به بالا. `position_in_52w_range` جای قیمت در دامنهٔ ۵۲ هفته است.\n- `trend.alignment`: هم‌راستایی سه افق.\n- `trend.channel60`: کانال رگرسیونی ۶۰ روزه، نزدیک‌ترین معادل عددی خط روند. شامل شیب، R²، فاصلهٔ امروز از کانال دیروز بر حسب انحراف معیار، و خط بالا و پایین کانال.\n\n**آنچه آزمون ۱۳ ساله دربارهٔ روند نشان داد** (۱۳۹۲ تا ۱۴۰۵، ۵۷ سهم با دست‌کم یک سال سابقه، حدود ۶۶ هزار روز-سهم قابل معامله). «لبه» یعنی فاصلهٔ احتمال رشد از میانگین همهٔ سهم‌های گروه در **همان روز**، به واحد درصد؛ یعنی اثر جهت کل بازار از آن حذف شده است:\n\n| وضعیت روند | n | لبهٔ ۵ روزه | لبهٔ ۲۰ روزه |\n|---|---|---|---|\n| روند روزانه صعودی | ۱۷٬۷۹۹ | +۰٫۱ | +۱٫۴ |\n| روند روزانه نزولی | ۹٬۶۱۸ | −۰٫۸ | −۰٫۸ |\n| روند هفتگی صعودی | ۲۴٬۵۰۹ | +۰٫۴ | +۱٫۰ |\n| روند هفتگی نزولی | ۱۲٬۱۱۷ | −۰٫۸ | +۰٫۱ |\n| روند یک‌ساله صعودی | ۳۹٬۸۴۷ | +۰٫۹ | +۱٫۶ (هم‌جهت در ۵ از ۵ دوره) |\n| روند یک‌ساله نزولی | ۱۴٬۳۰۴ | −۱٫۶ | −۰٫۹ |\n| هر سه افق صعودی | ۱۴٬۳۰۶ | +۰٫۲ | +۱٫۹ |\n| هر سه افق نزولی | ۴٬۶۳۶ | −۱٫۸ | −۰٫۲ |\n| کانال صعودی تمیز (شیب ۶۰ روزه > ۱۰٪، R² > ۰٫۶) | ۱۷٬۵۹۰ | +۰٫۴ | +۱٫۷ |\n| شکست خط روند صعودی (بسته‌شدن زیر کف کانال) | ۵۹۷ | +۲٫۸ | −۱٫۴ |\n| شکست خط روند نزولی (بسته‌شدن بالای سقف کانال) | ۳۰۱ | +۰٫۸ | −۲٫۳ |\n| نزدیک سقف ۵۲ هفته | ۱۰٬۱۲۷ | −۰٫۲ | +۱٫۶ |\n\nجمع‌بندی: روند به‌تنهایی حداکثر ۱ تا ۲ واحد درصد لبه دارد. شکست خط روند و کانال هم جهت بعدی را پیش‌بینی نکرد: بعد از شکست خط روند صعودی، سهم معمولاً افت بیشتری نکرد. در walk-forward، افزودن هم‌راستایی سه افق به جدول امتیاز × رژیم دقت را بهتر نکرد (AUC ۵ روزه ۰٫۵۳۷ در برابر ۰٫۵۳۵).\n\n**تنها جایی که روند واقعاً اثر دارد: تأیید سیگنال فروش**\n\n| وضعیت | n | احتمال رشد ۵ روزه | لبهٔ ۵ روزه | لبهٔ ۲۰ روزه |\n|---|---|---|---|---|\n| امتیاز ۴− و کمتر + روند هفتگی نزولی | ۱٬۱۰۹ | ۳۲٪ | −۱۳ (در ۵ از ۵ دوره بین −۱۲ و −۱۷) | −۱۰ (۴ از ۵ دوره) |\n| امتیاز ۴− و کمتر بدون روند هفتگی نزولی | ۷۰۰ | ۳۵٪ | −۹ | −۱ (ناپایدار) |\n| امتیاز ۲+ و بیشتر + روند هفتگی صعودی | ۳٬۷۸۸ | ۵۷٪ | +۴ | +۴ |\n| امتیاز ۲+ و بیشتر در روند هفتگی نزولی | ۱٬۳۸۶ | ۵۷٪ | +۶ | +۴ |\n| پولبک در روند هفتگی صعودی (RSI < ۴۰) | ۵۵۰ | ۵۲٪ | +۵ (ناپایدار: از ۰ تا +۱۰ در دوره‌ها) | +۷ |\n\n**قواعد استفاده از روند:**\n1. روند **امتیاز ندارد** و به‌تنهایی ناحیه یا تصمیم را عوض نمی‌کند.\n2. **ناحیهٔ ۴− و کمتر همراه با `trend.weekly = down`:** اطمینان فروش را یک پله بالا ببر. افق فروش می‌تواند تا ۲۰ روز باشد، یعنی خروج کامل، نه فقط سبک کردن.\n3. **ناحیهٔ ۴− و کمتر بدون روند هفتگی نزولی:** سیگنال فقط برای ۱ تا ۵ روز معتبر است. پیشنهاد «سبک کن، در ضعف بعدی نخر» بده، نه خروج بلندمدت.\n4. **خرید را به‌خاطر روند نزولی وتو نکن.** سیگنال خرید در روند هفتگی نزولی همان‌قدر کار کرد که در روند صعودی. «خلاف روند نخر» در این گروه پشتوانهٔ داده‌ای ندارد.\n5. خط روند و کانال را برای **حد ضرر و هدف** به کار ببر، نه جهت. در کانال صعودی تمیز، `lower_line_today` حد ضرر منطقی است و `upper_line_today` هدف.\n6. پولبک در روند صعودی فقط یک نکتهٔ ضعیف در بخش «چرا» است و احتمال را عوض نمی‌کند.\n7. **افق بیش از ۵ روز:** امتیاز v2 در افق ۲۰ روزه پیش‌بینی‌کننده نبود (AUC walk-forward ۰٫۴۹)؛ روند یک‌ساله هم فقط حدود +۲ واحد لبه دارد. برای نظر ۲۰ روزه یا بیشتر به رژیم، کدال و بنیادی تکیه کن و اطمینان را «پایین» بنویس.\n8. در سهم تازه‌عرضه، `trend.*` مقدار `unknown_short_history` دارد؛ به‌جای آن از دفترچهٔ IPO استفاده کن.\n9. روند درون‌روز (کندل ۵ دقیقه‌ای و VWAP) فقط برای زمان ورود و خروج است. این بخش در ۱۳ سال آزمون نشد؛ دادهٔ درون‌روز فقط برای ۸ نماد در ۱۴۰۳ موجود بود.\n\n#### ۴-۲. جریان پول حقیقی/حقوقی\nاز `flows` بخوان. در سهم تازه‌عرضه `buyer_power_reliable = false` است: قدرت خریدار و سرانه‌ها را تفسیر نکن (سهمیهٔ کوچک عرضهٔ اولیه آن‌ها را منحرف می‌کند). جریان پول گروه را از `indiv_net_flow_pct_of_value_ex_self` بخوان؛ این عدد **بدون خود نماد** است. در اجرای نسخهٔ ۱ روی تابان، نیمی از «خروج پول گروه» خود تابان بود و دوبار شمرده شد.\n\n#### ۴-۳. سهامداران عمده (فقط زمینه، بدون امتیاز)\nبازارگردان‌ها در روزهای منفی می‌خرند و خریدشان سیگنال صعود نیست. خرید و فروش سهامداران راهبردی در ۱۴۰۳ و ۱۴۰۴ نسبت به گروه لبهٔ معنادار نداشت و هیچ سهامداری بعد از اصلاح خطای چندآزمونی به «۹۰٪ موفقیت» نرسید. اگر سابقهٔ یک سهامدار را می‌گویی، نرخ را با (موفق+۵)/(کل+۱۰) کوچک کن.\n\n#### ۴-۴. کدال\nنوع، زمان انتشار (قبل یا بعد از ۱۲:۳۰)، محتوا، و اینکه خبر مخصوص شرکت است یا کل گروه. اثر تاریخی (بازده غیرعادی نسبت به شاخص ۴۴، روز انتشار تا ۵ روز بعد):\n\n| نوع اطلاعیه | اثر ۵ روزه (دی ۱۴۰۲ تا اسفند ۱۴۰۳) | اثر ۵ روزه (۱۴۰۴ تا شهریور) | تفسیر برای عامل |\n|---|---|---|---|\n| تصمیمات مجمع عادی سالیانه | −۱٫۰٪ (بعد از روز انتشار −۱٫۸٪) | −۲٫۸٪ | افت بعد از مجمع تکرارشونده است؛ −۱ تا ۵ روز |\n| تغییر مدیرعامل/هیئت‌مدیره | −۱٫۰٪ | −۱٫۳٪ | منفی ملایم؛ −۱ (اگر فقط ثبت دوبارهٔ نمایندگان است: ۰) |\n| توقف تولید/تعمیرات/قطع گاز | −۰٫۸٪ | −۲٫۴٪ | منفی؛ −۱ |\n| شفاف‌سازی شایعه | −۱٫۷٪ | +۱٫۶٪ (نمونهٔ کم) | متن را بخوان؛ پیش‌فرض −۱ |\n| آرای دیوان عدالت/شورای رقابت | +۴٫۰٪ | نمونه ناکافی | رویداد **گروهی**؛ جهت از متن؛ ±۱ |\n| نرخ سرویس‌های جانبی | +۳٫۹٪ | −۲٫۰٪ | جهت به محتوا بستگی دارد |\n| بازگشایی بعد از تعلیق اطلاعاتی | +۶٫۰٪ | +۱٫۲٪ | نوسان شدید؛ موقعیت B |\n| گزارش ماهانه | ≈۰ | ≈۰ | فقط غافلگیری فروش نسبت به گروه مهم است |\n| صورت‌های مالی میاندوره‌ای | +۰٫۳٪ | −۱٫۰٪ | فقط در مقایسه با انتظار |\n| مراحل افزایش سرمایه | +۱٫۵٪ | +۰٫۶٪ | مثبت ملایم؛ +۱ |\n| اطلاعیه‌های حاکمیتی (گروه کنترل) | −۰٫۴٪ | −۰٫۳٪ | بی‌اثر |\n\n> این جدول هنوز فقط ۲۱ ماه را پوشش می‌دهد. گسترش آن به سال‌های قبل در این مرحله ممکن نشد، چون جست‌وجوی کدال درخواست‌های پشت‌سرهم را با خطای 429 رد می‌کند؛ در PoC با خزش آهستهٔ شبانه تکمیل می‌شود. پس اطمینان به ردیف‌های کدال کمتر از ردیف‌های قیمت و جریان پول است.\n\n- **گزارش ماهانه:** رشد خام فروش اثر نداشت؛ **رشد نسبت به بقیهٔ گروه در همان ماه** اثر داشت. یک‌سوم پایینی: −۰٫۷٪ تا −۱٫۳٪ در ۵ روز → **−۱**. یک‌سوم بالایی: +۰٫۳ تا +۰٫۵٪ → **+۱ ضعیف**. اگر فروش همتایان را نداری، رشد مورد انتظار را «تغییر نرخ ارز صادراتی + تغییر قیمت جهانی محصول + اثر تعداد روزهای ماه» بگیر.\n- قبل از بسیاری از اطلاعیه‌های منفی، بازده ۵ روز قبل هم منفی بود (نشت اطلاعات)؛ بخشی از خبر زودتر در قیمت است.\n- اخبار گروهی (نرخ گاز، سرویس‌ها، دیوان، قطعی گاز، نرخ ارز صادراتی) را از `sector_regulatory_10d` بخوان.\n\n#### ۴-۵. بنیادی سریع و هلدینگ‌ها (فقط زمینه)\nP/E در برابر گروه، EPS، حساسیت به نرخ ارز و گاز، زمان مجمع بعدی. برای هلدینگ‌ها (فارس، پترول، تاپیکو، وپترو، شیران، پارسان، تابان) P/NAV را از آخرین «صورت وضعیت پورتفوی» در کدال حساب کن و با **سابقهٔ خود همان هلدینگ** مقایسه کن. تخفیف ۳۰ تا ۴۰ درصدی به NAV در بازار ایران عادی است و به‌تنهایی دلیل خرید نیست.\n\n#### ۴-۶. دفترچهٔ عرضهٔ اولیه (IPO) — جدید\nبر اساس **۱۹۲ عرضهٔ اولیهٔ ۱۳۹۶ تا ۱۴۰۵** (کل بازار):\n\n| مرحله (`ipo.phase`) | احتمال رشد روز بعد | ۵ روز | ۲۰ روز | میانهٔ ۲۰ روز |\n|---|---|---|---|---|\n| بعد از اولین روز بدون صف (`first_open_days`) | ۲۹٪ | ۳۸٪ | ۴۴٪ | −۳٫۸٪ |\n| بعد از اولین روز منفی (`after_first_down_day`) | ۲۳٪ | ۳۳٪ | ۴۲٪ | −۶٫۱٪ |\n| همان، وقتی صف اولیه ۸ روز یا بیشتر بود | ۲۰٪ | ۳۱٪ | ۳۹٪ | −۱۰٫۲٪ |\n| همان، وقتی حقوقی (بازارگردان) بیش از ۲۰٪ ارزش معاملات را خالص خرید | ۲۴٪ | ۳۱٪ | ۴۷٪ | −۱٫۷٪ |\n| ۶۰ روز بعد از اولین روز بدون صف | — | — | ۵۳٪ مثبت | +۳٫۴٪ |\n\nاین الگو در هر ۴ دورهٔ بازار تکرار شد (رشد روز بعد از اولین روز منفی: ۲۳٪، ۱۰٪، ۳۱٪ و ۳۰٪).\n\nقواعد IPO:\n- در این مرحله جدول رژیم گام ۶ را به کار نبر؛ احتمال‌ها را از همین جدول بده.\n- **خرید بازارگردان احتمال را عوض نکرد.** حمایت او افت را کُند می‌کند، نه برعکس.\n- «نخر» در این مرحله، لبهٔ منفی واقعی دارد، ولی حدود ۱ روز از ۴ تا ۵ روز، روز بعد مثبت است. این را صریح بنویس تا روز مثبت، «شکست تحلیل» خوانده نشود.\n- برای خریدار: صبر تا دست‌کم ۲۰ روز بعد از اولین روز بدون صف، یا نزدیک کف اولین روز بدون صف (`first_open_day_low`) همراه با برگشت خالص پول حقیقی.\n- برای دارنده: فروش تدریجی در روزهای قوی و بالای VWAP، نه در صف فروش و نه در بازگشایی بعد از روز ضعیف.\n\n### گام ۵ — امتیازدهی (v2، برآورد روی ۱۳ سال)\nامتیازها در `rubric.points` محاسبه شده‌اند. کدال را اضافه کن:\n\n| مؤلفه | امتیاز |\n|---|---|\n| پول هوشمند حقیقی | +۲ |\n| قدرت خریدار > ۲ (اگر ردیف قبل فعال نیست) | +۱ |\n| قدرت خریدار < ۰٫۵ | −۱ |\n| بسته‌شدن در صف خرید | +۲ |\n| بسته‌شدن در صف فروش | −۲ |\n| آخرین قیمت بیش از ۱٪ بالای قیمت پایانی | +۲ |\n| آخرین قیمت بیش از ۱٪ زیر قیمت پایانی | −۲ |\n| RSI < ۳۰ | −۲ |\n| بالای باند بالای Bollinger | +۱ |\n| کدال: تصمیمات مجمع، تغییر مدیرعامل، توقف تولید، شفاف‌سازی شایعه (۵ روز اخیر) | −۱ هرکدام |\n| کدال: مراحل افزایش سرمایه | +۱ |\n| کدال: غافلگیری فروش ماهانه نسبت به گروه | −۱ / +۱ ضعیف |\n| کدال/کلان: خبر گروهی مهم | ±۱ با قضاوت و متن اطلاعیه |\n| تعدیل قضاوتی (با دلیل داده‌ای) | حداکثر ±۱ و بدون حق تغییر ناحیه |\n\nردیف‌های `rubric.context` (خروج/ورود پول ۵ روزه، کف و سقف ۲۰ روزه، ADX، جریان پول گروه، سهامداران) **امتیاز ندارند** و فقط در متن تحلیل می‌آیند. ردیف‌های کدال در بک‌تست ۱۳ ساله نبودند؛ اگر فقط به‌خاطر آن‌ها ناحیه عوض شد، اطمینان را یک پله کم کن.\n\n### گام ۶ — احتمال، لبه و تصمیم (فقط موقعیت D)\nاز `rubric.calibration_for_this_band` و `rubric.base_rate_this_regime` بخوان (پس از افزودن امتیاز کدال، ناحیه را دوباره از جدول زیر پیدا کن). **لبه** = احتمال رشد ۵ روزهٔ ناحیه منهای نرخ پایهٔ همان رژیم.\n\nاحتمال بالا رفتن قیمت (ورود با قیمت پایانی روز بعد، روزهای صف حذف شده؛ ۱۳۹۲ تا ۱۴۰۵):\n\n| رژیم | ناحیهٔ امتیاز | n | ۱ روز | ۳ روز | ۵ روز | ۱۰ روز | میانهٔ ۵ روز |\n|---|---|---|---|---|---|---|---|\n| داغ | ۴− و کمتر | ۳۰ | ۱۰٪ | ۲۳٪ | ۲۰٪ | ۲۷٪ | −۳٫۳٪ |\n| داغ | ۳− تا ۲− | ۲٬۵۷۵ | ۲۵٪ | ۵۲٪ | ۵۵٪ | ۵۸٪ | +۰٫۸٪ |\n| داغ | ۱− تا ۱+ | ۹٬۳۹۸ | ۵۱٪ | ۵۴٪ | ۵۷٪ | ۶۱٪ | +۱٫۰٪ |\n| داغ | ۲+ تا ۳+ | ۲٬۳۳۲ | ۷۶٪ | ۵۶٪ | ۵۷٪ | ۶۰٪ | +۱٫۱٪ |\n| داغ | ۴+ و بیشتر | ۱۴۱ | ۸۷٪ | ۷۲٪ | ۷۴٪ | ۷۸٪ | +۴٫۴٪ |\n| داغ | نرخ پایه | ۱۴٬۴۷۶ | ۵۰٪ | ۵۴٪ | ۵۷٪ | ۶۱٪ | +۱٫۰٪ |\n| عادی | ۴− و کمتر | ۱٬۳۱۳ | ۱۱٪ | ۲۶٪ | ۳۱٪ | ۴۰٪ | −۰٫۶٪ |\n| عادی | ۳− تا ۲− | ۹٬۷۷۱ | ۲۳٪ | ۳۸٪ | ۴۱٪ | ۴۵٪ | −۰٫۵٪ |\n| عادی | ۱− تا ۱+ | ۲۹٬۶۰۱ | ۴۴٪ | ۴۶٪ | ۴۸٪ | ۵۰٪ | −۰٫۱٪ |\n| عادی | ۲+ تا ۳+ | ۵٬۷۲۶ | ۷۳٪ | ۵۴٪ | ۵۴٪ | ۵۴٪ | +۰٫۳٪ |\n| عادی | ۴+ و بیشتر | ۴۴۱ | ۸۱٪ | ۶۰٪ | ۵۸٪ | ۵۸٪ | +۰٫۵٪ |\n| عادی | نرخ پایه | ۴۶٬۸۵۲ | ۴۳٪ | ۴۵٪ | ۴۷٪ | ۴۹٪ | −۰٫۲٪ |\n| سرد | ۴− و کمتر | ۵۳۵ | ۱۸٪ | ۳۶٪ | ۳۸٪ | ۴۶٪ | −۰٫۶٪ |\n| سرد | ۳− تا ۲− | ۲٬۷۸۹ | ۳۱٪ | ۴۲٪ | ۴۳٪ | ۴۸٪ | −۰٫۵٪ |\n| سرد | ۱− تا ۱+ | ۵٬۴۹۷ | ۴۹٪ | ۴۶٪ | ۴۷٪ | ۴۹٪ | −۰٫۲٪ |\n| سرد | ۲+ تا ۳+ | ۱٬۱۷۷ | ۷۶٪ | ۴۹٪ | ۵۰٪ | ۴۹٪ | ۰٫۰٪ |\n| سرد | ۴+ و بیشتر | ۶۵ | ۷۷٪ | ۶۲٪ | ۵۷٪ | ۵۴٪ | +۱٫۹٪ |\n| سرد | نرخ پایه | ۱۰٬۰۶۳ | ۴۵٪ | ۴۵٪ | ۴۶٪ | ۴۸٪ | −۰٫۳٪ |\n\nقواعد تصمیم:\n- **خرید:** لبهٔ ۵ روزه **+۸ واحد درصد یا بیشتر** و احتمال ۵ روزه ≥ ۵۵٪، و سهم در صف خرید نیست.\n- **فروش / کاهش:** لبهٔ ۵ روزه **−۸ واحد درصد یا کمتر** و احتمال ۵ روزه ≤ ۴۰٪، و سهم در صف فروش نیست.\n- **بقیه = «بدون لبه».** سهم جدید نخر؛ اگر داری، با حد ضرر نگه دار. اگر احتمال ۱ روزه خیلی پایین است (مثلاً ۲۵٪) ولی ۵ روزه خنثی است، بنویس «افت کوتاه‌مدت محتمل، ۵ روزه خنثی» و ماشهٔ خرید در افت را بده.\n- EV ۵ روزه را هم بنویس: میانهٔ ۵ روزهٔ جدول، و «متوسط سود در موارد مثبت / متوسط زیان در موارد منفی» از `calibration_for_this_band`.\n- رژیم عوض می‌شود: اگر شاخص ۴۴ نزدیک مرز ۱۰+٪ یا ۵−٪ در ۲۰ روز است، هر دو رژیم را گزارش کن.\n\n**کارنامهٔ walk-forward (۱۳۹۶ تا ۱۴۰۵، خارج از نمونه):** ناحیهٔ «۴− و کمتر» در ۱٬۰۴۲ مورد، ۶۴٪ درست گفت که قیمت در ۵ روز بالا نمی‌رود (نسخهٔ ۱: ۵۵٪ در ۹٬۴۵۲ مورد). نواحی خرید در ۷٬۷۷۹ مورد ۵۶٪ رشد داشتند در برابر نرخ پایهٔ ۵۰٪. AUC کلی حدود ۰٫۵۴ است: پیش‌بینی جهت ۵ روزه سخت است و ارزش عامل در موقعیت‌های افراطی، زمان‌بندی و مدیریت ریسک است.\n\n### گام ۷ — سناریوهای جلسهٔ بعد و ماشه‌ها (جدید)\nسه سناریو با فراوانی تاریخی و اقدام بنویس. رفتار بازگشایی در ۱۳ سال (پایدار در هر ۵ دوره):\n\n| وضعیت امروز | گپ بازگشایی فردا | بسته‌شدن بالاتر از قیمت بازگشایی | کف روز نسبت به بازگشایی |\n|---|---|---|---|\n| بسته‌شدن در صف خرید | +۳٫۱٪ | فقط ۲۱٪ (۱۵ تا ۳۷٪ در دوره‌ها) | −۲٫۴٪ |\n| بسته‌شدن قوی (آخرین > پایانی) | +۲٫۲٪ | ۳۶٪ | −۲٫۰٪ |\n| بسته‌شدن ضعیف (آخرین < پایانی) | −۱٫۷٪ | ۶۱٪ | −۱٫۵٪ |\n| بسته‌شدن در صف فروش | −۲٫۵٪ | ۶۵٪ (۵۵ تا ۷۷٪) | −۰٫۹٪ |\n\nدرون‌روز (۵ و ۱۰ دقیقه) بازار **برگشتی** است: بعد از تقاطع صعودی EMA3/EMA12 در ۵ دقیقه، ۶۶٪ مواقع قیمت تا ۳۰ دقیقهٔ بعد پایین‌تر بود و قیمتِ بیش از ۱٪ بالای VWAP در ۶۴٪ مواقع عقب نشست (۸ نماد بزرگ، ۱۴۰۳).\n\nماشه‌ها را با **قیمت و ساعت** بنویس، مثل:\n- «اگر فردا زیر ۱۹٬۸۰۰ باز شد و تا ۱۰:۳۰ بالای VWAP برگشت و خالص پول حقیقی مثبت شد → خرید آزمایشی ⅓ حجم با حد ضرر زیر کف روز».\n- «اگر با گپ بالای +۲٪ باز شد → نخر؛ اگر داری، ⅓ را در بازگشایی بفروش».\n- «اگر صف فروش تشکیل شد → در صف نفروش؛ پایان جلسه دوباره بررسی کن».\n\n### گام ۸ — مدیریت ریسک\n- حد ضرر زیر نزدیک‌ترین حمایت ساختاری یا ۱٫۵×ATR (هر کدام نزدیک‌تر). اگر فاصلهٔ حد ضرر بیش از ۸٪ است، حجم را کم کن یا وارد نشو.\n- هدف: مقاومت بعدی در `levels` یا دو برابر فاصلهٔ حد ضرر.\n- اندازهٔ موقعیت: ریسک هر معامله حداکثر همان درصدی که کاربر گفته (پیش‌فرض ۱٪ سرمایه).\n- دامنهٔ نوسان امروز در `price_limits_today` است؛ هدف یک‌روزه بیرون از دامنه معنا ندارد.\n\n### گام ۹ — شرط باطل‌شدن\nیک تا سه شرط مشخص با قیمت یا داده.\n\n### گام ۱۰ — ثبت و ارزیابی\nبعد از هر برگه یک خط JSON بده. کاربر آن‌ها را نگه می‌دارد و هر هفته با `petroEvaluate` کارنامه می‌گیرد. **ارزیابی در افق ۵ روز انجام می‌شود، نه ۱ روز.** یک روز مخالف، شکست روش نیست؛ کارنامهٔ ده‌ها پیش‌بینی مهم است.\n\n## ۵. قالب خروجی (حداکثر یک صفحه)\n\n```\n### دیدبان پتروشیمی — [نماد] ([نام]) — [تاریخ، ساعت] — برای جلسهٔ [تاریخ]\n**موقعیت:** [A/B/C/D + توضیح]   **رژیم گروه:** [داغ/عادی/سرد، شاخص ۴۴ در ۲۰ روز ..٪]\n**تصمیم:** خرید / فروش / نگهداری / بدون لبه\n**احتمال رشد:** ۱ روز ..٪ · ۵ روز ..٪ (نرخ پایهٔ همین رژیم ..٪ → لبه .. واحد)   **میانهٔ ۵ روز:** ..٪   **اطمینان:** بالا/متوسط/پایین\n**امتیاز:** [عدد] = [جزئیات]  یا «جدول IPO: [مرحله]»\n\n**روند:** روزانه .. · هفتگی .. (ساختار هفتگی ..) · یک‌ساله .. (جای قیمت در دامنهٔ ۵۲ هفته ..٪) · هم‌راستایی .. · کانال ۶۰ روزه .. → اثر روی تصمیم: [هیچ / تأیید فروش طبق قاعدهٔ ۴-۱-ب]\n**نمودار:** ساختار روزانه .. · حمایت‌ها .. · مقاومت‌ها .. · VWAP لنگر ..\n**سناریوهای جلسهٔ بعد**\n| سناریو | فراوانی تاریخی | اقدام |\n|---|---|---|\n| گپ مثبت / بی‌گپ / گپ منفی | ..٪ | .. |\n**ماشه‌ها:** اگر .. آن‌گاه .. (با قیمت و ساعت)\n**حد ضرر / هدف / حجم:** ..\n**چرا (۳ تا ۵ دلیل با عدد و منبع؛ داده و برداشت جدا)**\n**ریسک‌ها و شرط باطل‌شدن**\n**کدال (مهم‌ترین موارد ۳۰ روز اخیر)**\n**زمینهٔ گروه و بازار** (جریان پول گروه بدون خود نماد، صف‌ها، اخبار سراسری)\n**تازگی داده:** قیمت .. · شاخص .. · کدال ..\n> این تحلیل آموزشی/پژوهشی است و توصیهٔ سرمایه‌گذاری شخصی نیست.\n```\n\nخط ثبت:\n```json\n{\"date\":\"1405/07/05\",\"symbol\":\"…\",\"situation\":\"D\",\"regime\":\"hot\",\"decision\":\"NO_EDGE\",\"score\":-2,\"p_up_1d\":0.25,\"p_up_5d\":0.55,\"base_5d\":0.57,\"ref_price\":0,\"stop\":null,\"target\":null,\"horizon_days\":5}\n```\nبرای `petroEvaluate` از همین خطوط استفاده کن (`ref_price` = قیمت پایانی روز صدور).\n\n## ۶. موقعیت‌های خاص\n- **نماد متوقف:** علت را از کدال پیدا کن؛ فقط سناریوی بازگشایی بده.\n- **روز بعد از مجمع یا افزایش سرمایه:** از قیمت تعدیل‌شده استفاده کن؛ افت بعد از مجمع تکرارشونده است.\n- **شوک کلان (جنگ، تحریم، جهش ارز):** رژیم بر همه‌چیز غلبه می‌کند؛ در خرداد ۱۴۰۴ سیگنال‌های خرید شکست خوردند. حداکثر اطمینان «پایین» و پیش‌فرض «بدون لبه».\n- **نماد غیرپتروشیمی:** کالیبراسیون برای گروه ۴۴ است؛ اگر کاربر خواست تحلیل کن، ولی اطمینان را پایین بیاور.\n- **«چرا دیروز گفتی نخر و امروز بالا رفت؟»:** احتمال همان برگه را یادآوری کن، کارنامهٔ ۵ روزه را با `petroEvaluate` نشان بده، و اگر فرض یا داده‌ای غلط بوده، صریح بگو کدام.\n\n## ۷. سبک نوشتن\nفارسی ساده ولی فنی؛ اصطلاحات فنی با همان واژهٔ انگلیسی (VWAP، RSI، base rate، edge). اعداد با واحد (ریال یا تومان، درصد). کوتاه.\n\n## ۸. پیوست الف — روش آزمون\n- **داده:** قیمت روزانه و حقیقی/حقوقی ۶۲ سهم گروه ۴۴ از tsetmc (۱۳۹۲/۰۱ تا ۱۴۰۵/۰۷)؛ ۳۰٪ کم‌معامله‌ترین سهم‌های هر سال حذف شدند. سهم‌های حذف‌شده از بورس در داده نیستند (سوگیری بقا، در این گروه کم‌اثر).\n- **دامنهٔ نوسان تاریخی:** برای تشخیص صف، دامنه برای هر روز از خود بازار برآورد شد (حدود ±۴٪ در ۱۳۹۰ تا ۱۳۹۳، ±۵٪ در ۱۳۹۴ تا ۱۴۰۰، +۵/−۳٪ در ۱۴۰۱ و ۱۴۰۲، ±۳٪ از ۱۴۰۳).\n- **پنج دورهٔ بازار:** ۱۳۹۲ تا ۱۳۹۶ (رکود/ثبات)، ۱۳۹۷ و ۱۳۹۸ (جهش ارز)، ۱۳۹۹ و ۱۴۰۰ (حباب و ریزش)، ۱۴۰۱ و ۱۴۰۲ (رنج)، ۱۴۰۳ تا ۱۴۰۵ (رالی و جنگ).\n- **Walk-forward:** برای هر سال از ۱۳۹۶ تا ۱۴۰۵، جدول فقط با سال‌های قبل ساخته و روی همان سال آزمون شد.\n- **IPO:** ۱۹۲ عرضهٔ اولیهٔ کل بازار (بورس و فرابورس) از ۱۳۹۶ تا ۱۴۰۵ که صف اولیه‌شان تمام شده بود.\n- **کدال:** ۳٬۸۲۰ اطلاعیهٔ ۴۲ نماد از دی ۱۴۰۲ تا شهریور ۱۴۰۴ و ۶۵۰ گزارش ماهانه (گسترش به سال‌های قبل به‌خاطر محدودیت نرخ درخواست کدال انجام نشد).\n- **درون‌روز:** معاملات تک‌تک ۸ نماد بزرگ در ۱۴۰۳.\n\n## ۹. پیوست ب — کد جمع‌آوری داده (JavaScript)\n- `petroSnapshot(symbol)` و `petroEvaluate(logs)` → تب `https://www.tsetmc.com`\n- `codalSnapshot(symbol, days)` و `codalLetterText(url)` → تب `https://www.codal.ir`\n\n```javascript\n/* ==========================================================================\n   petro_collector.js — داده‌گیر عامل «دیدبان پتروشیمی» — نسخهٔ ۲ (۱۴۰۵/۰۷/۰۵)\n   A) petroSnapshot(symbol)        → run in a tab on https://www.tsetmc.com\n   B) petroEvaluate(logs)          → same tab; scores earlier calls against what happened\n   C) codalSnapshot(symbol, days)  → run in a tab on https://www.codal.ir\n   D) codalLetterText(url)         → same codal tab; readable text of one letter\n   Changes vs v1: rubric re-estimated on 13 years (1392-1405) with regime-conditioned calibration; request timeouts, minimum-history guards for indicators, IPO / new-listing\n   block, chart structure (swings, key levels, volume-by-price, anchored VWAP), streaks,\n   group flow excluding the symbol itself, live index append after the close, group regime\n   (hot / mid / cold) with the regime-conditioned calibration table, AGM/HTML letters.\n   v2.1: `trend` block — daily / weekly (completed weeks) / yearly trend, alignment, 60-day regression channel.\n   ========================================================================== */\n\nasync function petroSnapshot(symbol) {\n  const BASE = 'https://cdn.tsetmc.com/api/';\n  const sleep = ms => new Promise(r => setTimeout(r, ms));\n  const J = async (u, tries = 4, ms = 15000) => {\n    for (let i = 0; i < tries; i++) {\n      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), ms);\n      try { const r = await fetch(BASE + u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); } catch (e) { clearTimeout(tm); }\n      await sleep(800 * (i + 1));\n    }\n    return null;\n  };\n  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/\\s+/g, ' ').trim();\n  const R = (x, d = 4) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** d) / 10 ** d;\n  const out = { symbol, version: 2, generated_at: new Date().toISOString(), warnings: [] };\n\n  // ---------- 1) instrument\n  const srch = await J('Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(symbol)));\n  const all = (srch?.instrumentSearch || []).filter(x => ar(x.lVal18AFC) === ar(symbol));\n  const ins = all.find(x => [1, 2, 4].includes(x.flow) && !/3$|4$/.test(x.cgrValCot || '')) || all[0];\n  if (!ins) return { error: 'نماد پیدا نشد', symbol };\n  const ic = ins.insCode;\n  out.instrument = { insCode: ic, name: ins.lVal30, market: ins.flowTitle, board: ins.cgrValCot };\n  const [info, live, bl, ctToday] = await Promise.all([\n    J(`Instrument/GetInstrumentInfo/${ic}`), J(`ClosingPrice/GetClosingPriceInfo/${ic}`),\n    J(`BestLimits/${ic}`), J(`ClientType/GetClientType/${ic}/1/0`)]);\n  const [daily, cth] = await Promise.all([J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`), J(`ClientType/GetClientTypeHistory/${ic}`)]);\n  if (!daily) return { error: 'سابقهٔ قیمت از tsetmc نیامد؛ دوباره اجرا کن', symbol };\n  const I = info?.instrumentInfo || {}, L = live?.closingPriceInfo || {};\n  out.instrument.state = L.instrumentState?.cEtavalTitle || null;\n  out.fundamental_quick = { eps_estimated: I.eps?.estimatedEPS, sector_pe: I.eps?.sectorPE, shares: I.zTitad, sector: I.sector?.lSecVal,\n    avg_volume_3m: I.qTotTran5JAvg, free_float_pct: I.kAjCapValCpsIdx, price_limits_today: [I.staticThreshold?.psGelStaMin, I.staticThreshold?.psGelStaMax] };\n\n  // ---------- 2) daily series (+ today's live row) and adjustment\n  const rawAll = (daily.closingPriceDaily || []).sort((a, b) => a.dEven - b.dEven);\n  let D = rawAll.filter(r => r.qTotTran5J > 0)\n    .map(r => ({ d: r.dEven, o: r.priceFirst, h: r.priceMax, l: r.priceMin, last: r.pDrCotVal, c: r.pClosing, y: r.priceYesterday, v: r.qTotTran5J, val: r.qTotCap }));\n  if (L.finalLastDate && D.length && L.finalLastDate > D[D.length - 1].d && L.qTotTran5J > 0)\n    D.push({ d: L.finalLastDate, o: L.priceFirst, h: L.priceMax, l: L.priceMin, last: L.pDrCotVal, c: L.pClosing, y: L.priceYesterday, v: L.qTotTran5J, val: L.qTotCap, live: true });\n  const n = D.length, t = n - 1;\n  if (n < 5) return { error: 'سابقهٔ معاملاتی کافی نیست', symbol, days: n };\n  // IPO row (reference price = par 1000 on the first trading day) — excluded from adjustment\n  const ipoIdx = D.findIndex(r => r.y === 1000 && r.c > 1500);\n  const fac = new Array(n).fill(1); const adjDays = [];\n  for (let i = n - 2; i >= 0; i--) { let ratio = (i + 1 === ipoIdx) ? 1 : D[i + 1].y / D[i].c; if (ratio > 0.995 && ratio < 1.005) ratio = 1; else adjDays.push([D[i + 1].d, R(ratio, 4)]); fac[i] = fac[i + 1] * ratio; }\n  const C = D.map((r, i) => r.c * fac[i]), H = D.map((r, i) => r.h * fac[i]), Lo = D.map((r, i) => r.l * fac[i]), LST = D.map((r, i) => r.last * fac[i]);\n  const V = D.map(r => r.v), VAL = D.map(r => r.val);\n  const hist = ipoIdx >= 0 ? n - ipoIdx : n;           // trading days since listing (or available history)\n  if (hist < 60) out.warnings.push(`فقط ${hist} روز سابقه: اندیکاتورهای بلندتر از این دوره null هستند و امتیاز نمی‌گیرند`);\n\n  // ---------- 3) indicators (each one only when enough history exists)\n  const sma = (a, k, i) => (i + 1 < k || i - k + 1 < (ipoIdx > 0 ? ipoIdx : 0)) ? null : a.slice(i + 1 - k, i + 1).reduce((s, x) => s + x, 0) / k;\n  const emaArr = (a, k) => { const e = []; const al = 2 / (k + 1); a.forEach((x, i) => e.push(i ? al * x + (1 - al) * e[i - 1] : x)); return e; };\n  const wilder = (a, k) => { const e = []; a.forEach((x, i) => e.push(i ? e[i - 1] + (x - e[i - 1]) / k : x)); return e; };\n  const ok = k => hist >= k;\n  const up = C.map((x, i) => i ? Math.max(0, x - C[i - 1]) : 0), dn = C.map((x, i) => i ? Math.max(0, C[i - 1] - x) : 0);\n  const au = wilder(up, 14), ad = wilder(dn, 14); const RSI = au.map((u, i) => 100 - 100 / (1 + u / (ad[i] || 1e-9)));\n  const e12 = emaArr(C, 12), e26 = emaArr(C, 26); const MACD = e12.map((x, i) => x - e26[i]); const SIG = emaArr(MACD, 9);\n  const TR = C.map((x, i) => i ? Math.max(H[i] - Lo[i], Math.abs(H[i] - C[i - 1]), Math.abs(Lo[i] - C[i - 1])) : H[i] - Lo[i]);\n  const pdm = H.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return u > d && u > 0 ? u : 0; });\n  const ndm = Lo.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return d > u && d > 0 ? d : 0; });\n  const ATR = wilder(TR, 14), PDI = wilder(pdm, 14).map((x, i) => 100 * x / ATR[i]), NDI = wilder(ndm, 14).map((x, i) => 100 * x / ATR[i]);\n  const ADX = wilder(PDI.map((p, i) => 100 * Math.abs(p - NDI[i]) / ((p + NDI[i]) || 1e-9)), 14);\n  const hi = (a, k, i) => Math.max(...a.slice(Math.max(0, i - k), i)), lo = (a, k, i) => Math.min(...a.slice(Math.max(0, i - k), i));\n  const sd20 = ok(20) ? Math.sqrt(C.slice(t - 19, t + 1).reduce((s, x) => s + (x - sma(C, 20, t)) ** 2, 0) / 20) : null;\n  const bbp = sd20 ? (C[t] - (sma(C, 20, t) - 2 * sd20)) / (4 * sd20) : null;\n  const last = D[t], chgLast = last.last / last.y - 1;\n  const ind = {\n    date: last.d, live_row: !!last.live, close: last.c, last: last.last, yesterday: last.y, high: last.h, low: last.l, open: last.o,\n    chg_close_pct: R(100 * (last.c / last.y - 1), 2), chg_last_pct: R(100 * chgLast, 2), history_days: hist,\n    ret_5d: t >= 5 ? R(C[t] / C[t - 5] - 1) : null, ret_20d: ok(21) ? R(C[t] / C[t - 20] - 1) : null, ret_60d: ok(61) ? R(C[t] / C[t - 60] - 1) : null, ret_240d: ok(241) ? R(C[t] / C[t - 240] - 1) : null,\n    sma20: R(sma(C, 20, t), 0), sma50: R(sma(C, 50, t), 0), sma100: R(sma(C, 100, t), 0),\n    rsi14: ok(30) ? R(RSI[t], 1) : null, macd_hist: ok(40) ? R(MACD[t] - SIG[t], 1) : null,\n    macd_cross: ok(40) ? ((MACD[t] > SIG[t] && MACD[t - 1] <= SIG[t - 1]) ? 'up' : (MACD[t] < SIG[t] && MACD[t - 1] >= SIG[t - 1]) ? 'down' : null) : null,\n    adx14: ok(30) ? R(ADX[t], 1) : null, plus_di: ok(30) ? R(PDI[t], 1) : null, minus_di: ok(30) ? R(NDI[t], 1) : null, atr_pct: ok(15) ? R(ATR[t] / C[t]) : null,\n    bollinger_pctb: R(bbp, 2), donchian20_high: ok(21) ? R(hi(H, 20, t), 0) : null, donchian20_low: ok(21) ? R(lo(Lo, 20, t), 0) : null,\n    vol_ratio_20: ok(21) ? R(V[t] / sma(V, 20, t - 1), 2) : null, value_today: VAL[t],\n    last_minus_close_pct: R(100 * (last.last - last.c) / last.y, 2), adjustments_last_year: adjDays.filter(x => x[0] >= D[Math.max(0, t - 240)].d)\n  };\n  const pMaxT = I.staticThreshold?.psGelStaMax, pMinT = I.staticThreshold?.psGelStaMin;\n  ind.closed_at_upper_limit = (pMaxT && last.live) ? last.last >= pMaxT : (chgLast >= 0.0285 && last.last >= last.h);\n  ind.closed_at_lower_limit = (pMinT && last.live) ? last.last <= pMinT : (chgLast <= -0.0285 && last.last <= last.l);\n  // trend class (stock level) — used to read signals in context\n  ind.trend_class = (ok(51) && C[t] > ind.sma20 && ind.sma20 > ind.sma50 && ind.ret_20d > 0.10) ? 'strong_up'\n    : (ok(51) && C[t] < ind.sma20 && ind.sma20 < ind.sma50 && ind.ret_20d < -0.10) ? 'strong_down' : (ok(51) ? 'other' : 'unknown_short_history');\n  // streaks\n  const lim = i => (D[i].last / D[i].y - 1 >= 0.0285 && D[i].last >= D[i].h);\n  let qs = 0; for (let i = t - 1; i >= 0 && lim(i); i--) qs++;\n  let us = 0; for (let i = t - 1; i >= 1 && C[i] > C[i - 1]; i--) us++;\n  ind.buy_queue_streak_before_today = qs; ind.up_day_streak_before_today = us;\n  out.daily = ind;\n\n  // ---------- 4) chart structure: swings, key levels, volume-by-price, anchored VWAP\n  const sw = { highs: [], lows: [] };\n  for (let i = Math.max(2, t - 120); i <= t - 2; i++) {\n    const wH = H.slice(i - 2, i + 3), wL = Lo.slice(i - 2, i + 3);\n    if (H[i] === Math.max(...wH)) sw.highs.push([D[i].d, R(H[i], 0)]);\n    if (Lo[i] === Math.min(...wL)) sw.lows.push([D[i].d, R(Lo[i], 0)]);\n  }\n  const lh = sw.highs.slice(-3), ll = sw.lows.slice(-3);\n  let structure = 'نامشخص';\n  if (lh.length >= 2 && ll.length >= 2) {\n    const hhS = lh[lh.length - 1][1] > lh[lh.length - 2][1], hlS = ll[ll.length - 1][1] > ll[ll.length - 2][1];\n    structure = hhS && hlS ? 'صعودی (HH/HL)' : (!hhS && !hlS) ? 'نزولی (LH/LL)' : 'رنج/در حال تغییر';\n  }\n  const lastSH = lh.length ? lh[lh.length - 1][1] : null, lastSL = ll.length ? ll[ll.length - 1][1] : null;\n  const win = Math.min(60, hist), vb = {}; let vmin = Infinity, vmax = -Infinity;\n  for (let i = t - win + 1; i <= t; i++) { vmin = Math.min(vmin, Lo[i]); vmax = Math.max(vmax, H[i]); }\n  const step = (vmax - vmin) / 20 || 1;\n  for (let i = t - win + 1; i <= t; i++) { const px = (H[i] + Lo[i] + C[i]) / 3; const b = Math.min(19, Math.floor((px - vmin) / step)); vb[b] = (vb[b] || 0) + V[i]; }\n  const nodes = Object.entries(vb).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => R(vmin + (+b + 0.5) * step, 0));\n  const anchor = ipoIdx >= 0 ? ipoIdx : Math.max(0, t - 60);\n  let avN = 0, avD = 0; for (let i = anchor; i <= t; i++) { avN += (H[i] + Lo[i] + C[i]) / 3 * V[i]; avD += V[i]; }\n  const levels = [];\n  const add = (nm, v) => { if (v && isFinite(v)) levels.push([nm, R(v, 0), R(100 * (v / C[t] - 1), 1)]); };\n  add('سقف دیروز', D[t - 1]?.h * fac[t - 1]); add('کف دیروز', D[t - 1]?.l * fac[t - 1]); add('آخرین سقف چرخشی', lastSH); add('آخرین کف چرخشی', lastSL);\n  add('سقف ۲۰ روزه', ind.donchian20_high); add('کف ۲۰ روزه', ind.donchian20_low); add('SMA20', ind.sma20); add('SMA50', ind.sma50);\n  add(ipoIdx >= 0 ? 'VWAP از عرضهٔ اولیه' : 'VWAP لنگر ۶۰ روزه', avN / avD); nodes.forEach((x, k) => add(`گره حجمی ${k + 1}`, x));\n  if (ipoIdx >= 0) add('قیمت عرضهٔ اولیه', D[ipoIdx].c * fac[ipoIdx]);\n  levels.sort((a, b) => b[1] - a[1]);\n  const res = levels.filter(x => x[1] > C[t] * 1.002), sup = levels.filter(x => x[1] < C[t] * 0.998);\n  out.chart = { structure, swing_highs: lh, swing_lows: ll, levels_sorted_high_to_low: levels,\n    nearest_resistance: res.length ? res[res.length - 1] : null, nearest_support: sup.length ? sup[0] : null,\n    close_above_last_swing_high: lastSH ? C[t] > lastSH * 1.01 : null, close_below_last_swing_low: lastSL ? C[t] < lastSL * 0.99 : null,\n    tested_last_swing_low_and_held: lastSL ? (Lo[t] <= lastSL * 1.01 && C[t] > lastSL) : null,\n    note: 'levels: [نام، قیمت تعدیل‌شده، فاصله از قیمت پایانی ٪]' };\n\n  // ---------- 4b) multi-timeframe trend (same definitions as the 13-year backtest, trend.py / trend2.py)\n  {\n    const s0 = ipoIdx > 0 ? ipoIdx : 0;\n    const tr = { note: 'زمینه است، امتیاز ندارد؛ قاعدهٔ استفاده در بخش «روند چندافقی» پرامپت' };\n    // daily: moving-average alignment\n    const s20 = sma(C, 20, t), s50 = sma(C, 50, t), s100 = sma(C, 100, t);\n    tr.daily = (s20 === null || s50 === null || s100 === null) ? 'unknown_short_history'\n      : (C[t] > s20 && s20 > s50 && s50 > s100) ? 'up' : (C[t] < s20 && s20 < s50 && s50 < s100) ? 'down' : 'mixed';\n    // weekly: completed weeks only (Iran week Sat-Wed; key = the Friday that ends it); the current week is excluded\n    const wkKey = dEv => { const s = String(dEv); const dt = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); dt.setUTCDate(dt.getUTCDate() + (5 - dt.getUTCDay() + 7) % 7); return dt.toISOString().slice(0, 10); };\n    const wk = []; // [key, close, high, low]\n    for (let i = s0; i <= t; i++) { const k = wkKey(D[i].d); const w = wk[wk.length - 1];\n      if (!w || w[0] !== k) wk.push([k, C[i], H[i], Lo[i]]); else { w[1] = C[i]; w[2] = Math.max(w[2], H[i]); w[3] = Math.min(w[3], Lo[i]); } }\n    const done = wk.slice(0, -1), m = done.length, wc = done.map(w => w[1]);\n    const wsma = (k, j) => j + 1 < k ? null : wc.slice(j + 1 - k, j + 1).reduce((a, b) => a + b, 0) / k;\n    if (m >= 32) {\n      const j = m - 1, w10 = wsma(10, j), w30 = wsma(30, j), w10p = wsma(10, j - 2);\n      tr.weekly = (wc[j] > w10 && w10 > w30 && w10 > w10p) ? 'up' : (wc[j] < w10 && w10 < w30 && w10 < w10p) ? 'down' : 'mixed';\n      tr.weekly_sma10 = R(w10, 0); tr.weekly_sma30 = R(w30, 0);\n    } else tr.weekly = 'unknown_short_history';\n    if (m >= 8) {\n      const hh = a => Math.max(...a.map(w => w[2])), llw = a => Math.min(...a.map(w => w[3]));\n      const cur = done.slice(-4), prv = done.slice(-8, -4);\n      tr.weekly_structure = (hh(cur) > hh(prv) && llw(cur) > llw(prv)) ? 'HH/HL' : (hh(cur) < hh(prv) && llw(cur) < llw(prv)) ? 'LH/LL' : 'mixed';\n    } else tr.weekly_structure = 'unknown_short_history';\n    // yearly: 200-day average and its 20-day slope, 52-week range position\n    const s200 = sma(C, 200, t), s200p = sma(C, 200, t - 20);\n    tr.yearly = (s200 === null || s200p === null) ? 'unknown_short_history' : (C[t] > s200 && s200 > s200p) ? 'up' : (C[t] < s200 && s200 <= s200p) ? 'down' : 'mixed';\n    tr.sma200 = R(s200, 0);\n    if (hist >= 241) { const h52 = Math.max(...H.slice(t - 239, t + 1)), l52 = Math.min(...Lo.slice(t - 239, t + 1)); tr.position_in_52w_range = R((C[t] - l52) / (h52 - l52), 2); }\n    const known = [tr.daily, tr.weekly, tr.yearly].filter(x => !String(x).startsWith('unknown'));\n    tr.alignment = known.length < 3 ? 'incomplete' : known.every(x => x === 'up') ? 'all_up' : known.every(x => x === 'down') ? 'all_down' : 'mixed';\n    // 60-day regression channel of log price (trendline proxy); today's close vs YESTERDAY's channel\n    if (t - s0 >= 61) {\n      const fitAt = end => { let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0; const nn = 60;\n        for (let i = end - 59, x = 0; i <= end; i++, x++) { const y = Math.log(C[i]); sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }\n        const vx = sxx / nn - (sx / nn) ** 2, vy = syy / nn - (sy / nn) ** 2, cv = sxy / nn - (sx / nn) * (sy / nn), b = cv / vx, a = sy / nn - b * sx / nn;\n        return { a, b, r2: cv * cv / (vx * vy), sd: Math.sqrt(Math.max(vy - b * b * vx, 0)) }; };\n      const f = fitAt(t), fp = fitAt(t - 1), z = (Math.log(C[t]) - (fp.a + fp.b * 60)) / (fp.sd || 1e-9);\n      const kind = (f.b * 60 > 0.10 && f.r2 > 0.6) ? 'clean_up' : (f.b * 60 < -0.10 && f.r2 > 0.6) ? 'clean_down' : 'none';\n      tr.channel60 = { kind, slope_60d_pct: R(100 * f.b * 60, 1), r2: R(f.r2, 2), z_vs_yesterdays_channel: R(z, 2),\n        lower_line_today: R(Math.exp(f.a + f.b * 59 - 2 * f.sd), 0), upper_line_today: R(Math.exp(f.a + f.b * 59 + 2 * f.sd), 0) };\n    }\n    out.trend = tr;\n  }\n\n  // ---------- 5) order book\n  const Bk = bl?.bestLimits || [], top = Bk[0] || {};\n  const pMax = I.staticThreshold?.psGelStaMax, pMin = I.staticThreshold?.psGelStaMin;\n  let queue = 'none';\n  if (top.qTitMeDem > 0 && !top.qTitMeOf && pMax && top.pMeDem >= pMax) queue = 'buy_queue';\n  if (top.qTitMeOf > 0 && !top.qTitMeDem && pMin && top.pMeOf <= pMin) queue = 'sell_queue';\n  out.order_book = { queue, top5: Bk.slice(0, 5).map(b => [b.zOrdMeDem, b.qTitMeDem, b.pMeDem, b.pMeOf, b.qTitMeOf, b.zOrdMeOf]),\n    queue_value_billion_toman: R((queue === 'buy_queue' ? top.qTitMeDem * top.pMeDem : queue === 'sell_queue' ? top.qTitMeOf * top.pMeOf : 0) / 1e10, 1),\n    note: 'ستون‌ها: تعداد خریدار، حجم خرید، قیمت خرید، قیمت فروش، حجم فروش، تعداد فروشنده' };\n\n  // ---------- 6) flows (individual / institutional)\n  const CT = {}; (cth?.clientType || []).forEach(r => CT[r.recDate] = r);\n  if (ctToday?.clientType && (last.live || !CT[last.d])) { const q = ctToday.clientType, px = last.c; CT[last.d] = { buy_I_Value: q.buy_I_Volume * px, sell_I_Value: q.sell_I_Volume * px, buy_N_Value: q.buy_N_Volume * px, sell_N_Value: q.sell_N_Volume * px, buy_I_Count: q.buy_CountI, sell_I_Count: q.sell_CountI }; }\n  const F = D.map(r => { const x = CT[r.d]; if (!x) return null; const bpc = x.buy_I_Value / Math.max(1, x.buy_I_Count), spc = x.sell_I_Value / Math.max(1, x.sell_I_Count);\n    return { d: r.d, val: r.val, bpc, spc, power: bpc / spc, netI: x.buy_I_Value - x.sell_I_Value, nbuy: x.buy_N_Value, nsell: x.sell_N_Value, bc: x.buy_I_Count, sc: x.sell_I_Count }; });\n  const fw = F.slice(-60).filter(Boolean), fl = F[t];\n  const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };\n  const sumK = (k, f) => F.slice(-k).filter(Boolean).reduce((s, x) => s + f(x), 0);\n  const newListing = ipoIdx >= 0 && hist <= 60;\n  out.flows = fl ? {\n    buyer_power_today: R(fl.power, 2), buyer_power_5d: R(sumK(5, x => x.bpc) / sumK(5, x => x.spc), 2),\n    buyer_power_reliable: !newListing, per_capita_buy_toman: R(fl.bpc / 10, 0), per_capita_sell_toman: R(fl.spc / 10, 0),\n    per_capita_buy_vs_60d_median: fw.length >= 20 ? R(fl.bpc / med(fw.map(x => x.bpc)), 2) : null,\n    indiv_buyers: fl.bc, indiv_sellers: fl.sc,\n    indiv_net_today_pct_of_value: R(fl.netI / fl.val, 3), indiv_net_5d_pct: R(sumK(5, x => x.netI) / sumK(5, x => x.val), 3), indiv_net_20d_pct: R(sumK(20, x => x.netI) / sumK(20, x => x.val), 3),\n    indiv_net_today_billion_toman: R(fl.netI / 1e10, 1), inst_net_today_billion_toman: R((fl.nbuy - fl.nsell) / 1e10, 1), inst_buy_share: R(fl.nbuy / fl.val, 2), inst_sell_share: R(fl.nsell / fl.val, 2),\n    last10: F.slice(-10).filter(Boolean).map(x => [x.d, R(x.power, 2), R(x.netI / 1e10, 1), R((x.nbuy - x.nsell) / 1e10, 1)]),\n    note: newListing ? 'سهم تازه‌عرضه است: قدرت خریدار و سرانه‌ها به‌خاطر سهمیهٔ کوچک عرضهٔ اولیه گمراه‌کننده‌اند' : ''\n  } : null;\n\n  // ---------- 7) IPO / new listing block\n  if (ipoIdx >= 0 && hist <= 120) {\n    let k = ipoIdx + 1; while (k < n && lim(k)) k++;\n    const streak = k - ipoIdx - 1, openIdx = k < n ? k : null;\n    let fdIdx = null; if (openIdx !== null) for (let i = openIdx; i < n; i++) if (D[i].c < D[i].y) { fdIdx = i; break; }\n    const phase = openIdx === null ? 'in_initial_queue_streak' : (fdIdx !== null && t - fdIdx <= 10) ? 'after_first_down_day' : (t - openIdx <= 5 ? 'first_open_days' : 'post_ipo');\n    out.ipo = { ipo_date: D[ipoIdx].d, ipo_price: D[ipoIdx].c, trading_days_since_ipo: hist - 1, initial_queue_streak: streak,\n      first_open_day: openIdx !== null ? D[openIdx].d : null, first_open_day_low: openIdx !== null ? R(Lo[openIdx], 0) : null, first_open_day_high: openIdx !== null ? R(H[openIdx], 0) : null,\n      first_down_day: fdIdx !== null ? D[fdIdx].d : null, days_since_first_down: fdIdx !== null ? t - fdIdx : null,\n      return_since_ipo: R(C[t] / (D[ipoIdx].c * fac[ipoIdx]) - 1, 3), phase,\n      base_rates_192_ipos_1396_1405: {\n        after_first_open_day: { up_1d: 0.29, up_5d: 0.38, up_20d: 0.44, median_5d_pct: -3.3, median_20d_pct: -3.8 },\n        after_first_down_day: { up_1d: 0.23, up_3d: 0.26, up_5d: 0.33, up_20d: 0.42, median_5d_pct: -3.8, median_20d_pct: -6.1 },\n        after_first_down_day_if_streak_ge_8: { n: 103, up_1d: 0.20, up_5d: 0.31, up_20d: 0.39, median_20d_pct: -10.2 },\n        first_down_day_with_institutional_net_buy_gt_20pct: { n: 59, up_1d: 0.24, up_5d: 0.31, up_20d: 0.47 },\n        by_era_after_first_down_up_1d: { '1396-98': 0.23, '1399-1400': 0.10, '1401-02': 0.31, '1403-05': 0.30 },\n        sixty_days_after_first_open: { share_positive: 0.53, median_pct: 3.4 } } };\n  }\n\n  // ---------- 8) major holders (>1%)\n  const cls = nm => /^شخص حقيقي/.test(nm) ? 'individual' : /BFM|بازارگرداني/.test(nm) ? 'market_maker' : /^PRX|سبد/.test(nm) ? 'portfolio' : /صندوق.*(بازنشستگي|بيمه اجتماعي)/.test(nm) ? 'pension' : /صندوق/.test(nm) ? 'fund' : /بيمه/.test(nm) ? 'insurance' : /بانك/.test(nm) ? 'bank' : /واسط مالي/.test(nm) ? 'sukuk_spv' : /تامين|شستا|صبا|آتيه/.test(nm) ? 'strategic_social_security' : /پتروشيمي|نفت|گاز|پالايش/.test(nm) ? 'strategic_parent_or_peer' : /سرمايه گذاري|گروه|توسعه/.test(nm) ? 'investment_co' : 'other';\n  const hd = [];\n  for (const r of D.slice(-6)) { const j = await J(`Shareholder/${ic}/${r.d}`, 2, 10000); const rows = j?.shareShareholder || []; const des = [...new Set(rows.map(x => x.dEven))].sort(); if (des.length < 2) continue;\n    const cur = {}, prev = {}; rows.forEach(x => { const T = x.dEven === des[des.length - 1] ? cur : prev; T[x.shareHolderName] = (T[x.shareHolderName] || 0) + x.numberOfShares; });\n    for (const nm of new Set([...Object.keys(cur), ...Object.keys(prev)])) { const dsh = (cur[nm] || 0) - (prev[nm] || 0); if (Math.abs(dsh) < 1) continue;\n      hd.push({ date: r.d, holder: nm, type: cls(nm), delta_shares: dsh, value_billion_toman: R(dsh * r.c / 1e10, 2), now_pct: I.zTitad ? R(100 * (cur[nm] || 0) / I.zTitad, 3) : null, new_above_1pct: !(nm in prev), dropped_below_1pct: !(nm in cur) }); } }\n  const lastHold = await J(`Shareholder/GetInstrumentShareHolderLast/${ic}`, 2);\n  out.holders = { top: (lastHold?.shareHolder || []).slice(0, 8).map(x => [x.shareHolderName, R(x.perOfShares, 2), cls(x.shareHolderName)]), changes_6d: hd };\n\n  // ---------- 9) group (44) breadth, flows EXCLUDING this symbol, index context + live append\n  const mw = await J('ClosingPrice/GetMarketWatch?market=0&paperTypes[0]=1&paperTypes[1]=2&showTraded=false&withBestLimits=true');\n  const G = (mw?.marketwatch || []).filter(x => (x.csv || '').trim() === '44' && [1, 2, 4].includes(x.flow) && !/\\d$/.test(x.lva) && x.qtc > 0);\n  const cta = await J('ClientType/GetClientTypeAll'); const CTA = {}; (cta?.clientTypeAllDto || []).forEach(x => CTA[x.insCode] = x);\n  let netI = 0, tv = 0, selfNet = 0, selfVal = 0;\n  G.forEach(x => { const c = CTA[x.insCode]; if (!c) return; const nI = (c.buy_I_Volume - c.sell_I_Volume) * x.pcl; if (x.insCode === ic) { selfNet = nI; selfVal = x.qtc; } else { netI += nI; tv += x.qtc; } });\n  const qb = G.filter(x => x.pdv >= x.pMax && x.blDs?.[0]?.qmo === 0).length, qsl = G.filter(x => x.pdv <= x.pMin && x.blDs?.[0]?.qmd === 0).length;\n  const [ix44, ixT, ixLive] = await Promise.all([J('Index/GetIndexB2History/33626672012415176'), J('Index/GetIndexB2History/32097828799138957'), J('Index/GetIndexB1LastAll/All/1')]);\n  const liveIdx = {}; (ixLive?.indexB1 || Object.values(ixLive || {})[0] || []).forEach(x => liveIdx[x.insCode] = x.xDrNivJIdx004);\n  const idx = (h, code) => { const rows = (h?.indexB2 || []).sort((x, y) => x.dEven - y.dEven); const a = rows.map(x => x.xNivInuClMresIbs); let appended = false;\n    if (last.d > (rows[rows.length - 1]?.dEven || 0) && liveIdx[code]) { a.push(liveIdx[code]); appended = true; }\n    const k = a.length - 1; const m50 = a.slice(k - 49, k + 1).reduce((s, x) => s + x, 0) / 50; return { level: a[k], r1: R(a[k] / a[k - 1] - 1), r5: R(a[k] / a[k - 5] - 1), r20: R(a[k] / a[k - 20] - 1), above_sma50: a[k] > m50, live_appended: appended }; };\n  const c44 = idx(ix44, '33626672012415176');\n  const regime = c44.r20 > 0.10 ? 'hot' : c44.r20 < -0.05 ? 'cold' : 'mid';\n  out.group = { n_traded: G.length, pct_up: R(G.filter(x => x.pdv > x.py).length / G.length, 2), buy_queues: qb, sell_queues: qsl,\n    avg_change_pct: R(100 * G.reduce((s, x) => s + (x.pcl / x.py - 1), 0) / G.length, 2),\n    indiv_net_flow_pct_of_value_ex_self: R(netI / tv, 3), indiv_net_flow_billion_toman_ex_self: R(netI / 1e10, 1),\n    this_symbol_share_of_group_value: R(selfVal / (tv + selfVal), 3), this_symbol_indiv_net_billion_toman: R(selfNet / 1e10, 1),\n    chem44_index: c44, total_index: idx(ixT, '32097828799138957'), regime,\n    regime_rule: 'hot = شاخص ۴۴ در ۲۰ روز بیش از +۱۰٪؛ cold = کمتر از −۵٪؛ بقیه mid' };\n\n  // ---------- 10) today's intraday (5-minute bars) — with timeout, optional\n  const tr = await J(`Trade/GetTrade/${ic}`, 2, 12000); const T5 = {};\n  if (!tr) out.warnings.push('دادهٔ معاملات درون‌روز امروز نیامد (timeout)');\n  (tr?.trade || []).filter(x => !x.canceled).sort((a, b) => a.nTran - b.nTran).forEach(x => { const s = Math.floor(x.hEven / 10000) * 60 + Math.floor(x.hEven / 100 % 100); const k = Math.max(0, Math.floor((s - 540) / 5)); const b = T5[k] ||= { o: x.pTran, h: x.pTran, l: x.pTran, c: x.pTran, v: 0, val: 0 }; b.h = Math.max(b.h, x.pTran); b.l = Math.min(b.l, x.pTran); b.c = x.pTran; b.v += x.qTitTran; b.val += x.qTitTran * x.pTran; });\n  const ks = Object.keys(T5).map(Number).sort((a, b) => a - b); const hm = k => `${String(9 + Math.floor(k * 5 / 60)).padStart(2, '0')}:${String(k * 5 % 60).padStart(2, '0')}`;\n  if (ks.length) { const vw = ks.reduce((s, k) => s + T5[k].val, 0) / ks.reduce((s, k) => s + T5[k].v, 0); const lastP = T5[ks[ks.length - 1]].c;\n    const pAt = m => { const k = ks.filter(k => k < m / 5); return k.length ? T5[k[k.length - 1]].c : null; };\n    out.intraday_today = { first_trade_time: hm(ks[0]), open: T5[ks[0]].o, last: lastP, vwap: R(vw, 0), last_vs_vwap_pct: R(100 * (lastP / vw - 1), 2),\n      ret_first30m_pct: pAt(30) ? R(100 * (pAt(30) / T5[ks[0]].o - 1), 2) : null, ret_last30m_pct: pAt(180) ? R(100 * (lastP / pAt(180) - 1), 2) : null,\n      bars_5m: ks.slice(-12).map(k => [hm(k), T5[k].o, T5[k].h, T5[k].l, T5[k].c, T5[k].v]) }; }\n\n  // ---------- 11) rubric (v1 points; indicator rows only when history allows) + regime calibration\n  const f = out.flows || {}, d = ind, P = {};\n  // v2 points: re-estimated on 1392-1405 (13 years, 62 group-44 stocks); rows without a stable effect were removed\n  const pw = f.buyer_power_reliable ? f.buyer_power_today : null;\n  const smart = f.per_capita_buy_vs_60d_median > 2 && pw > 1.5;\n  P.smart_retail_money = smart ? 2 : 0;\n  P.buyer_power_gt2 = (!smart && pw > 2) ? 1 : 0;\n  P.buyer_power_lt05 = (pw !== null && pw < 0.5) ? -1 : 0;\n  P.buy_queue_close = d.closed_at_upper_limit ? 2 : 0;\n  P.sell_queue_close = d.closed_at_lower_limit ? -2 : 0;\n  P.strong_finish = d.last_minus_close_pct > 1 ? 2 : 0;\n  P.weak_finish = d.last_minus_close_pct < -1 ? -2 : 0;\n  P.rsi_below_30 = (d.rsi14 !== null && d.rsi14 < 30) ? -2 : 0;\n  P.above_upper_bollinger = (d.bollinger_pctb !== null && d.bollinger_pctb > 1) ? 1 : 0;\n  const sub = Object.values(P).reduce((s, x) => s + x, 0);\n  // context only (no points: unstable or not significant over 13 years)\n  const strat = ['strategic_social_security', 'strategic_parent_or_peer', 'pension', 'investment_co'];\n  const context = { indiv_outflow_5d_gt10pct: f.indiv_net_5d_pct < -0.10, indiv_inflow_today_gt20pct: f.indiv_net_today_pct_of_value > 0.20,\n    new_20d_low: !!(d.donchian20_low && C[t] < d.donchian20_low), new_20d_high_with_volume: !!(d.donchian20_high && C[t] > d.donchian20_high && d.vol_ratio_20 > 1.5),\n    adx_downtrend: d.adx14 !== null && d.adx14 > 25 && d.minus_di > d.plus_di, group_flow_ex_self: out.group.indiv_net_flow_pct_of_value_ex_self,\n    strategic_holder_buy_5d: hd.some(x => strat.includes(x.type) && x.delta_shares > 0 && Math.abs(x.value_billion_toman) >= 1),\n    strategic_holder_sell_5d: hd.some(x => strat.includes(x.type) && x.delta_shares < 0 && Math.abs(x.value_billion_toman) >= 1),\n    close_above_last_swing_high: out.chart.close_above_last_swing_high, close_below_last_swing_low: out.chart.close_below_last_swing_low };\n  // calibration 1392-1405, tradable days only: [n, P(up 1d), P(up 3d), P(up 5d), P(up 10d), median 5d %, avg gain 5d %, avg loss 5d %]\n  const CAL = { hot: { '<=-4': [30, .10, .23, .20, .27, -3.3, 3.4, -5.6], '-3..-2': [2575, .25, .52, .55, .58, 0.8, 6.7, -4.8], '-1..+1': [9398, .51, .54, .57, .61, 1.0, 6.4, -4.2], '+2..+3': [2332, .76, .56, .57, .60, 1.1, 7.0, -4.5], '>=+4': [141, .87, .72, .74, .78, 4.4, 10.1, -3.5], ALL: [14476, .50, .54, .57, .61, 1.0, 6.6, -4.4] },\n    mid: { '<=-4': [1313, .11, .26, .31, .40, -0.6, 3.3, -2.3], '-3..-2': [9771, .23, .38, .41, .45, -0.5, 5.6, -3.0], '-1..+1': [29601, .44, .46, .48, .50, -0.1, 5.8, -3.1], '+2..+3': [5726, .73, .54, .54, .54, 0.3, 9.9, -3.3], '>=+4': [441, .81, .60, .58, .58, 0.5, 5.2, -3.1], ALL: [46852, .43, .45, .47, .49, -0.2, 6.3, -3.0] },\n    cold: { '<=-4': [535, .18, .36, .38, .46, -0.6, 4.1, -2.5], '-3..-2': [2789, .31, .42, .43, .48, -0.5, 4.6, -3.4], '-1..+1': [5497, .49, .46, .47, .49, -0.2, 5.2, -4.0], '+2..+3': [1177, .76, .49, .50, .49, 0.0, 5.9, -4.4], '>=+4': [65, .77, .62, .57, .54, 1.9, 7.2, -4.9], ALL: [10063, .45, .45, .46, .48, -0.3, 5.1, -3.8] } };\n  const band = s => s <= -4 ? '<=-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : '>=+4';\n  const cal = CAL[regime][band(sub)], base = CAL[regime].ALL;\n  const newIPO = ipoIdx >= 0 && hist <= 120;\n  out.rubric = { version: 2, points: P, subtotal_without_codal: sub, band_without_codal: band(sub), regime, context,\n    calibration_for_this_band: { n: cal[0], p_up_1d: cal[1], p_up_3d: cal[2], p_up_5d: cal[3], p_up_10d: cal[4], median_5d_pct: cal[5], avg_gain_5d_pct: cal[6], avg_loss_5d_pct: cal[7] },\n    base_rate_this_regime: { p_up_1d: base[1], p_up_5d: base[3], median_5d_pct: base[5] },\n    edge_vs_base_5d_pp: Math.round(100 * (cal[3] - base[3])),\n    applicable: !newIPO,\n    note: newIPO ? 'سهم تازه‌عرضه است: جدول کالیبراسیون قابل‌اتکا نیست؛ از بلوک ipo استفاده کن' : 'امتیاز کدال را اضافه کن و باند را دوباره تعیین کن؛ لبه = اختلاف با نرخ پایهٔ همین رژیم',\n    tradability: d.closed_at_upper_limit ? 'در صف خرید بسته شده — خرید عملاً ممکن نیست' : d.closed_at_lower_limit ? 'در صف فروش بسته شده — فروش عملاً ممکن نیست' : 'قابل معامله' };\n  return out;\n}\n\n/* ------------------------------------------------------------------------\n   B) petroEvaluate(logs): logs = [{date:'1405/07/04', symbol:'تابان', decision:'NO_BUY_REDUCE', ref_price:19990}, ...]\n   (date = day the call was made, ref_price = that day's closing price). Run on tsetmc.com.\n   Returns realised moves after 1, 3, 5, 10, 20 trading days and whether the call direction was right. */\nasync function petroEvaluate(logs) {\n  const BASE = 'https://cdn.tsetmc.com/api/';\n  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').trim();\n  const g2j = d => { const s = String(d); const dt = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\\d/]/g, ''); };\n  const res = [];\n  for (const L of logs) {\n    const s = await (await fetch(BASE + 'Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(L.symbol)))).json();\n    const ins = (s.instrumentSearch || []).find(x => ar(x.lVal18AFC) === ar(L.symbol) && [1, 2, 4].includes(x.flow)); if (!ins) { res.push({ ...L, error: 'not found' }); continue; }\n    const d = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceDailyList/${ins.insCode}/120`)).json()).closingPriceDaily.filter(r => r.qTotTran5J > 0).sort((a, b) => a.dEven - b.dEven);\n    const lv = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceInfo/${ins.insCode}`)).json()).closingPriceInfo || {};   // today's row is not in the history until the evening\n    if (lv.finalLastDate > (d[d.length - 1]?.dEven || 0) && lv.qTotTran5J > 0) d.push({ dEven: lv.finalLastDate, pClosing: lv.pClosing, priceYesterday: lv.priceYesterday, qTotTran5J: lv.qTotTran5J });\n    const i0 = d.findIndex(r => g2j(r.dEven) === L.date); if (i0 < 0) { res.push({ ...L, error: 'date not found' }); continue; }\n    const fac = []; let f = 1; for (let i = d.length - 1; i >= i0; i--) { fac[i] = f; if (i > i0) { let q = d[i].priceYesterday / d[i - 1].pClosing; if (q > 0.995 && q < 1.005) q = 1; f *= q; } }\n    const out = { ...L, trading_days_since: d.length - 1 - i0 };\n    for (const k of [1, 3, 5, 10, 20]) { const j = i0 + k; if (j < d.length) out[`ret_${k}d_pct`] = Math.round(10000 * (d[j].pClosing * fac[j] / (d[i0].pClosing * fac[i0]) - 1)) / 100; }\n    const bull = /BUY/.test(L.decision) && !/NO_BUY/.test(L.decision), bear = /SELL|REDUCE|NO_BUY/.test(L.decision);\n    for (const k of [1, 5, 20]) if (out[`ret_${k}d_pct`] !== undefined) out[`right_${k}d`] = bull ? out[`ret_${k}d_pct`] > 0 : bear ? out[`ret_${k}d_pct`] <= 0 : null;\n    res.push(out);\n  }\n  return res;\n}\n\n/* ------------------------------------------------------------------------ */\nasync function codalSnapshot(symbol, days = 120) {\n  const fa = s => (s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();\n  const sleep = ms => new Promise(r => setTimeout(r, ms));\n  const jal = dt => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\\d/]/g, '');\n  const toDig = s => (s || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));\n  const q = (sym, from, to, page) => 'https://search.codal.ir/api/search/v2/q?&Audit=true&AuditorRef=-1&Category=-1&Childs=true&CompanyState=-1&CompanyType=-1&Consolidatable=true&IsNotAudited=false&Length=-1&LetterType=-1&Mains=true&NotAudited=true&NotConsolidatable=true&Publisher=false&TracingNo=-1&search=true&PageNumber=' + page + '&Symbol=' + encodeURIComponent(sym) + '&FromDate=' + encodeURIComponent(from) + '&ToDate=' + encodeURIComponent(to);\n  // search.codal.ir rate-limits bursts (HTTP 429): back off and space the calls\n  const J = async u => { for (let i = 0; i < 5; i++) { const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 20000);\n      try { const r = await fetch(u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); if (r.status === 429) { await sleep(4000 * 2 ** i); continue; } } catch (e) { clearTimeout(tm); } await sleep(1500 * (i + 1)); } return null; };\n  const classify = t => {\n    if (/افشای اطلاعات/.test(t)) { const m = t.match(/\\((.*)\\)\\s*منتهی/); const x = m ? m[1] : t;\n      if (/دیوان|دادنامه|شورای رقابت|ابطال مصوب|ماده ۹۱/.test(x)) return 'REGULATORY_COURT';\n      if (/سرویس/.test(x)) return 'UTILITY_RATES';\n      if (/گاز|خوراک|مواد اولیه|بهای تمام شده/.test(x)) return 'FEED_GAS_PRICE';\n      if (/توقف|تعمیرات|قطع|محدودیت/.test(x)) return 'SHUTDOWN';\n      if (/شروع مجدد|راه.?اندازی مجدد|آغاز فرآیند تولید|بهره.?برداری/.test(x)) return 'RESTART';\n      if (/قرارداد|مزایده|مناقصه/.test(x)) return 'CONTRACT';\n      if (/دعوی|دادگاه/.test(x)) return 'LEGAL';\n      return 'MATERIAL_OTHER'; }\n    const rules = [['MONTHLY', /گزارش فعالیت ماهانه/], ['PORTFOLIO_NAV', /صورت وضعیت پورتفوی/], ['FS_EXPLAIN', /توضیحات در خصوص اطلاعات و صورت/], ['INTERIM_FS', /میاندوره/], ['ANNUAL_FS', /^صورت.?های مالی/],\n      ['AGM_DECISION', /تصمیمات مجمع عمومی عادی سالیانه/], ['AGM_NOTICE', /دعوت به مجمع عمومی عادی سالیانه/], ['DIV_SCHEDULE', /زمانبندی پرداخت سود/],\n      ['CAPINC_PROPOSAL', /پیشنهاد هیئت مدیره.*افزایش سرمایه/], ['CAPINC_STEP', /افزایش سرمایه/], ['EGM', /مجمع عمومی فوق العاده/], ['RUMOR_CLARIFY', /شفاف سازی در خصوص شایعه/],\n      ['BOARD_CEO_CHANGE', /هیئت مدیره.*مدیر عامل|مدیر عامل/], ['HALT', /تعلیق نماد|توقف نماد/]];\n    for (const [k, rx] of rules) if (rx.test(t)) return k; return 'OTHER'; };\n  const now = new Date(), from = jal(new Date(now - days * 864e5)), to = jal(now);\n  const letters = []; const first = await J(q(fa(symbol), from, to, 1));\n  if (!first) return { symbol, error: 'جست‌وجوی کدال پاسخ نداد (احتمالاً 429)؛ یک دقیقه بعد دوباره اجرا کن. نتیجهٔ خالی را «بدون اطلاعیه» تفسیر نکن' };\n  letters.push(...(first?.Letters || []));\n  for (let p = 2; p <= (first?.Page || 1); p++) { await sleep(500); const j = await J(q(fa(symbol), from, to, p)); letters.push(...(j?.Letters || [])); }\n  const L = letters.map(x => ({ type: classify(x.Title), title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url, tracing: x.TracingNo }));\n  const monthly = [];\n  for (const m of L.filter(x => x.type === 'MONTHLY' && !/اصلاحیه/.test(x.title)).slice(0, 3)) {\n    try { const h = await (await fetch(m.url)).text(); const s = h.match(/var datasource = (\\{.*?\\});\\s*\\n/s); if (!s) continue; const ds = JSON.parse(s[1]);\n      for (const sh of ds.sheets || []) for (const tb of sh.tables || []) { if (!/ProductionAndSales|Sales/i.test(tb.aliasName || '')) continue;\n        const tot = Math.max(...tb.cells.filter(c => (c.value || '').trim() === 'جمع').map(c => c.rowSequence)); if (!isFinite(tot)) continue;\n        const row = {}; tb.cells.filter(c => c.rowSequence === tot).forEach(c => row[c.columnSequence] = c.value);\n        const sub = {}; tb.cells.filter(c => c.rowSequence === 2).forEach(c => sub[c.columnSequence] = c.value || '');\n        const groups = tb.cells.filter(c => c.rowSequence === 1).map(c => { let amt = null; for (let k = c.columnSequence; k < c.columnSequence + (c.colSpan || 1); k++) if (/مبلغ/.test(sub[k] || '')) amt = k; return [c.value, amt ? Number(String(row[amt] || '').replace(/,/g, '')) : null]; }).filter(g => g[1] !== null);\n        monthly.push({ period: ds.periodEndToDate, published: m.published, groups_million_rial: groups }); break; } } catch (e) {} }\n  const peers = ['فارس', 'شپدیس', 'نوری', 'جم', 'پارس', 'تاپیکو', 'پترول', 'شیراز', 'زاگرس', 'مارون', 'آریا', 'شگویا', 'بوعلی', 'کرماشا'];\n  const f10 = jal(new Date(now - 10 * 864e5)); const sector = [];\n  for (const p of peers) { await sleep(700); const j = await J(q(p, f10, to, 1)); (j?.Letters || []).forEach(x => { const ty = classify(x.Title); if (['REGULATORY_COURT', 'UTILITY_RATES', 'FEED_GAS_PRICE', 'SHUTDOWN', 'RESTART', 'HALT'].includes(ty)) sector.push({ symbol: x.Symbol, type: ty, title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url }); }); }\n  const recent = t => L.filter(x => x.type === t).slice(0, 1).map(x => x.published)[0] || null;\n  return { symbol, window_days: days, n_letters: L.length, letters: L.slice(0, 40), monthly_sales: monthly, sector_regulatory_10d: sector,\n    last_seen: { AGM_DECISION: recent('AGM_DECISION'), BOARD_CEO_CHANGE: recent('BOARD_CEO_CHANGE'), SHUTDOWN: recent('SHUTDOWN'), RUMOR_CLARIFY: recent('RUMOR_CLARIFY'), HALT: recent('HALT'), REGULATORY_COURT: recent('REGULATORY_COURT'), UTILITY_RATES: recent('UTILITY_RATES'), FEED_GAS_PRICE: recent('FEED_GAS_PRICE'), CAPINC_PROPOSAL: recent('CAPINC_PROPOSAL'), PORTFOLIO_NAV: recent('PORTFOLIO_NAV') } };\n}\n\n/* ------------------------------------------------------------------------\n   D) codalLetterText(url): material-disclosure forms keep text in `clientDataSource`, structured\n   reports in `datasource`; AGM decisions and many others are server-rendered HTML (read the DOM).\n   PDF attachments are not parsed: if the key numbers are in the attachment, say so. */\nasync function codalLetterText(url) {\n  const h = await (await fetch(url)).text();\n  const m = h.match(/var (?:clientDataSource|datasource) = (\\{.*?\\});\\s*\\n/s);\n  let text = null;\n  if (m) { const texts = []; const walk = o => { if (typeof o === 'string') { const x = o.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\\s+/g, ' ').trim(); if (x.length > 3 && /[؀-ۿ]/.test(x)) texts.push(x); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };\n    walk(JSON.parse(m[1])); text = [...new Set(texts)].join(' | '); }\n  if (!text || text.length < 80) { const doc = new DOMParser().parseFromString(h, 'text/html'); doc.querySelectorAll('script,style').forEach(e => e.remove());\n    const t2 = (doc.body?.innerText || doc.body?.textContent || '').replace(/\\{\\{[^}]*\\}\\}/g, ' ').replace(/\\s+/g, ' ').trim(); if (t2.length > (text || '').length) text = t2; }\n  return { url, has_attachment: /Attachment\\.aspx/.test(h), text: (text || '').slice(0, 8000) || null };\n}\n```\n\n**راهنمای فیلدها:** `daily.close` قیمت پایانی، `daily.last` آخرین معامله، `closed_at_upper_limit` بسته‌شدن در صف خرید، `trend_class` روند کوتاه‌مدت سهم، `trend.*` روند روزانه، هفتگی، یک‌ساله و کانال ۶۰ روزه، `chart.*` سطوح و ساختار نمودار، `flows.*` جریان پول حقیقی/حقوقی، `ipo.*` دفترچهٔ عرضهٔ اولیه، `group.regime` رژیم گروه، `rubric.points` امتیاز v2 بدون کدال، `rubric.calibration_for_this_band` احتمال‌های همین ناحیه و رژیم، `rubric.context` داده‌های بدون امتیاز. مقادیر پولی tsetmc به ریال است؛ فیلدهای `*_billion_toman` به میلیارد تومان.\n";
const PW_GM = (typeof GM_xmlhttpRequest === 'function') ? {
  xhr: GM_xmlhttpRequest,
  get: typeof GM_getValue === 'function' ? GM_getValue : null,
  set: typeof GM_setValue === 'function' ? GM_setValue : null,
  clip: typeof GM_setClipboard === 'function' ? GM_setClipboard : null } : null;

/* ==========================================================================
   fetch-bridge.js — the `fetch` that the collector functions see.
   - Same-origin, or when the site itself allows it (CORS): the browser's own fetch.
   - With Tampermonkey/Violentmonkey (GM_xmlhttpRequest): if the browser's fetch is
     refused for another origin (CORS), the request is retried through GM, and that
     host goes through GM from then on. So tsetmc and codal can both be read from one tab.
   - Counts requests so the panel can show progress.
   ========================================================================== */
function pwMakeNet(gm) {
  const viaGM = new Set();
  const stats = { total: 0, done: 0, failed: 0, last: '' };
  const net = { stats, onEvent: null, fetch: null, reset() { stats.total = stats.done = stats.failed = 0; stats.last = ''; } };
  const emit = () => { try { net.onEvent && net.onEvent(stats); } catch (e) { /* ignore */ } };
  const nativeFetch = (typeof window !== 'undefined' && window.fetch) ? window.fetch.bind(window) : fetch;

  const gmFetch = (url, opts = {}) => new Promise((resolve, reject) => {
    let handle = null, settled = false;
    const done = f => (...a) => { if (!settled) { settled = true; f(...a); } };
    const ok = done(resolve), fail = done(reject);
    const abortErr = () => { try { return new DOMException('Aborted', 'AbortError'); } catch (e) { const x = new Error('Aborted'); x.name = 'AbortError'; return x; } };
    if (opts.signal) {
      if (opts.signal.aborted) return fail(abortErr());
      opts.signal.addEventListener('abort', () => { try { handle && handle.abort && handle.abort(); } catch (e) { /* ignore */ } fail(abortErr()); }, { once: true });
    }
    handle = gm.xhr({
      method: opts.method || 'GET', url, headers: opts.headers || {}, timeout: 30000,
      onload: r => { const text = r.responseText == null ? '' : String(r.responseText);
        ok({ ok: r.status >= 200 && r.status < 300, status: r.status, url, text: async () => text, json: async () => JSON.parse(text) }); },
      onerror: () => fail(new TypeError('GM request failed: ' + url)),
      ontimeout: () => fail(new TypeError('GM request timeout: ' + url)),
      onabort: () => fail(abortErr())
    });
  });

  net.fetch = async function (url, opts) {
    const u = new URL(String(url), location.href);
    stats.total++; stats.last = u.host + u.pathname.slice(0, 70); emit();
    const cross = u.origin !== location.origin;
    try {
      let r;
      if (gm && cross && viaGM.has(u.host)) r = await gmFetch(u.href, opts);
      else {
        try { r = await nativeFetch(u.href, opts); }
        catch (e) {
          if (!gm || !cross || (e && e.name === 'AbortError')) throw e;
          viaGM.add(u.host); r = await gmFetch(u.href, opts);
        }
      }
      stats.done++; emit(); return r;
    } catch (e) { stats.failed++; emit(); throw e; }
  };
  return net;
}

const PW_NET = pwMakeNet(PW_GM);

// ---- collector (src/petro_collector.js, unchanged); its `fetch` is the bridge above
const PC = (function (fetch) {
/* ==========================================================================
   petro_collector.js — داده‌گیر عامل «دیدبان پتروشیمی» — نسخهٔ ۲ (۱۴۰۵/۰۷/۰۵)
   A) petroSnapshot(symbol)        → run in a tab on https://www.tsetmc.com
   B) petroEvaluate(logs)          → same tab; scores earlier calls against what happened
   C) codalSnapshot(symbol, days)  → run in a tab on https://www.codal.ir
   D) codalLetterText(url)         → same codal tab; readable text of one letter
   Changes vs v1: rubric re-estimated on 13 years (1392-1405) with regime-conditioned calibration; request timeouts, minimum-history guards for indicators, IPO / new-listing
   block, chart structure (swings, key levels, volume-by-price, anchored VWAP), streaks,
   group flow excluding the symbol itself, live index append after the close, group regime
   (hot / mid / cold) with the regime-conditioned calibration table, AGM/HTML letters.
   v2.1: `trend` block — daily / weekly (completed weeks) / yearly trend, alignment, 60-day regression channel.
   ========================================================================== */

async function petroSnapshot(symbol) {
  const BASE = 'https://cdn.tsetmc.com/api/';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const J = async (u, tries = 4, ms = 15000) => {
    for (let i = 0; i < tries; i++) {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), ms);
      try { const r = await fetch(BASE + u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); } catch (e) { clearTimeout(tm); }
      await sleep(800 * (i + 1));
    }
    return null;
  };
  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/\s+/g, ' ').trim();
  const R = (x, d = 4) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** d) / 10 ** d;
  const out = { symbol, version: 2, generated_at: new Date().toISOString(), warnings: [] };

  // ---------- 1) instrument
  const srch = await J('Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(symbol)));
  const all = (srch?.instrumentSearch || []).filter(x => ar(x.lVal18AFC) === ar(symbol));
  const ins = all.find(x => [1, 2, 4].includes(x.flow) && !/3$|4$/.test(x.cgrValCot || '')) || all[0];
  if (!ins) return { error: 'نماد پیدا نشد', symbol };
  const ic = ins.insCode;
  out.instrument = { insCode: ic, name: ins.lVal30, market: ins.flowTitle, board: ins.cgrValCot };
  const [info, live, bl, ctToday] = await Promise.all([
    J(`Instrument/GetInstrumentInfo/${ic}`), J(`ClosingPrice/GetClosingPriceInfo/${ic}`),
    J(`BestLimits/${ic}`), J(`ClientType/GetClientType/${ic}/1/0`)]);
  const [daily, cth] = await Promise.all([J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`), J(`ClientType/GetClientTypeHistory/${ic}`)]);
  if (!daily) return { error: 'سابقهٔ قیمت از tsetmc نیامد؛ دوباره اجرا کن', symbol };
  const I = info?.instrumentInfo || {}, L = live?.closingPriceInfo || {};
  out.instrument.state = L.instrumentState?.cEtavalTitle || null;
  out.fundamental_quick = { eps_estimated: I.eps?.estimatedEPS, sector_pe: I.eps?.sectorPE, shares: I.zTitad, sector: I.sector?.lSecVal,
    avg_volume_3m: I.qTotTran5JAvg, free_float_pct: I.kAjCapValCpsIdx, price_limits_today: [I.staticThreshold?.psGelStaMin, I.staticThreshold?.psGelStaMax] };

  // ---------- 2) daily series (+ today's live row) and adjustment
  const rawAll = (daily.closingPriceDaily || []).sort((a, b) => a.dEven - b.dEven);
  let D = rawAll.filter(r => r.qTotTran5J > 0)
    .map(r => ({ d: r.dEven, o: r.priceFirst, h: r.priceMax, l: r.priceMin, last: r.pDrCotVal, c: r.pClosing, y: r.priceYesterday, v: r.qTotTran5J, val: r.qTotCap }));
  if (L.finalLastDate && D.length && L.finalLastDate > D[D.length - 1].d && L.qTotTran5J > 0)
    D.push({ d: L.finalLastDate, o: L.priceFirst, h: L.priceMax, l: L.priceMin, last: L.pDrCotVal, c: L.pClosing, y: L.priceYesterday, v: L.qTotTran5J, val: L.qTotCap, live: true });
  const n = D.length, t = n - 1;
  if (n < 5) return { error: 'سابقهٔ معاملاتی کافی نیست', symbol, days: n };
  // IPO row (reference price = par 1000 on the first trading day) — excluded from adjustment
  const ipoIdx = D.findIndex(r => r.y === 1000 && r.c > 1500);
  const fac = new Array(n).fill(1); const adjDays = [];
  for (let i = n - 2; i >= 0; i--) { let ratio = (i + 1 === ipoIdx) ? 1 : D[i + 1].y / D[i].c; if (ratio > 0.995 && ratio < 1.005) ratio = 1; else adjDays.push([D[i + 1].d, R(ratio, 4)]); fac[i] = fac[i + 1] * ratio; }
  const C = D.map((r, i) => r.c * fac[i]), H = D.map((r, i) => r.h * fac[i]), Lo = D.map((r, i) => r.l * fac[i]), LST = D.map((r, i) => r.last * fac[i]);
  const V = D.map(r => r.v), VAL = D.map(r => r.val);
  const hist = ipoIdx >= 0 ? n - ipoIdx : n;           // trading days since listing (or available history)
  if (hist < 60) out.warnings.push(`فقط ${hist} روز سابقه: اندیکاتورهای بلندتر از این دوره null هستند و امتیاز نمی‌گیرند`);

  // ---------- 3) indicators (each one only when enough history exists)
  const sma = (a, k, i) => (i + 1 < k || i - k + 1 < (ipoIdx > 0 ? ipoIdx : 0)) ? null : a.slice(i + 1 - k, i + 1).reduce((s, x) => s + x, 0) / k;
  const emaArr = (a, k) => { const e = []; const al = 2 / (k + 1); a.forEach((x, i) => e.push(i ? al * x + (1 - al) * e[i - 1] : x)); return e; };
  const wilder = (a, k) => { const e = []; a.forEach((x, i) => e.push(i ? e[i - 1] + (x - e[i - 1]) / k : x)); return e; };
  const ok = k => hist >= k;
  const up = C.map((x, i) => i ? Math.max(0, x - C[i - 1]) : 0), dn = C.map((x, i) => i ? Math.max(0, C[i - 1] - x) : 0);
  const au = wilder(up, 14), ad = wilder(dn, 14); const RSI = au.map((u, i) => 100 - 100 / (1 + u / (ad[i] || 1e-9)));
  const e12 = emaArr(C, 12), e26 = emaArr(C, 26); const MACD = e12.map((x, i) => x - e26[i]); const SIG = emaArr(MACD, 9);
  const TR = C.map((x, i) => i ? Math.max(H[i] - Lo[i], Math.abs(H[i] - C[i - 1]), Math.abs(Lo[i] - C[i - 1])) : H[i] - Lo[i]);
  const pdm = H.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return u > d && u > 0 ? u : 0; });
  const ndm = Lo.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return d > u && d > 0 ? d : 0; });
  const ATR = wilder(TR, 14), PDI = wilder(pdm, 14).map((x, i) => 100 * x / ATR[i]), NDI = wilder(ndm, 14).map((x, i) => 100 * x / ATR[i]);
  const ADX = wilder(PDI.map((p, i) => 100 * Math.abs(p - NDI[i]) / ((p + NDI[i]) || 1e-9)), 14);
  const hi = (a, k, i) => Math.max(...a.slice(Math.max(0, i - k), i)), lo = (a, k, i) => Math.min(...a.slice(Math.max(0, i - k), i));
  const sd20 = ok(20) ? Math.sqrt(C.slice(t - 19, t + 1).reduce((s, x) => s + (x - sma(C, 20, t)) ** 2, 0) / 20) : null;
  const bbp = sd20 ? (C[t] - (sma(C, 20, t) - 2 * sd20)) / (4 * sd20) : null;
  const last = D[t], chgLast = last.last / last.y - 1;
  const ind = {
    date: last.d, live_row: !!last.live, close: last.c, last: last.last, yesterday: last.y, high: last.h, low: last.l, open: last.o,
    chg_close_pct: R(100 * (last.c / last.y - 1), 2), chg_last_pct: R(100 * chgLast, 2), history_days: hist,
    ret_5d: t >= 5 ? R(C[t] / C[t - 5] - 1) : null, ret_20d: ok(21) ? R(C[t] / C[t - 20] - 1) : null, ret_60d: ok(61) ? R(C[t] / C[t - 60] - 1) : null, ret_240d: ok(241) ? R(C[t] / C[t - 240] - 1) : null,
    sma20: R(sma(C, 20, t), 0), sma50: R(sma(C, 50, t), 0), sma100: R(sma(C, 100, t), 0),
    rsi14: ok(30) ? R(RSI[t], 1) : null, macd_hist: ok(40) ? R(MACD[t] - SIG[t], 1) : null,
    macd_cross: ok(40) ? ((MACD[t] > SIG[t] && MACD[t - 1] <= SIG[t - 1]) ? 'up' : (MACD[t] < SIG[t] && MACD[t - 1] >= SIG[t - 1]) ? 'down' : null) : null,
    adx14: ok(30) ? R(ADX[t], 1) : null, plus_di: ok(30) ? R(PDI[t], 1) : null, minus_di: ok(30) ? R(NDI[t], 1) : null, atr_pct: ok(15) ? R(ATR[t] / C[t]) : null,
    bollinger_pctb: R(bbp, 2), donchian20_high: ok(21) ? R(hi(H, 20, t), 0) : null, donchian20_low: ok(21) ? R(lo(Lo, 20, t), 0) : null,
    vol_ratio_20: ok(21) ? R(V[t] / sma(V, 20, t - 1), 2) : null, value_today: VAL[t],
    last_minus_close_pct: R(100 * (last.last - last.c) / last.y, 2), adjustments_last_year: adjDays.filter(x => x[0] >= D[Math.max(0, t - 240)].d)
  };
  const pMaxT = I.staticThreshold?.psGelStaMax, pMinT = I.staticThreshold?.psGelStaMin;
  ind.closed_at_upper_limit = (pMaxT && last.live) ? last.last >= pMaxT : (chgLast >= 0.0285 && last.last >= last.h);
  ind.closed_at_lower_limit = (pMinT && last.live) ? last.last <= pMinT : (chgLast <= -0.0285 && last.last <= last.l);
  // trend class (stock level) — used to read signals in context
  ind.trend_class = (ok(51) && C[t] > ind.sma20 && ind.sma20 > ind.sma50 && ind.ret_20d > 0.10) ? 'strong_up'
    : (ok(51) && C[t] < ind.sma20 && ind.sma20 < ind.sma50 && ind.ret_20d < -0.10) ? 'strong_down' : (ok(51) ? 'other' : 'unknown_short_history');
  // streaks
  const lim = i => (D[i].last / D[i].y - 1 >= 0.0285 && D[i].last >= D[i].h);
  let qs = 0; for (let i = t - 1; i >= 0 && lim(i); i--) qs++;
  let us = 0; for (let i = t - 1; i >= 1 && C[i] > C[i - 1]; i--) us++;
  ind.buy_queue_streak_before_today = qs; ind.up_day_streak_before_today = us;
  out.daily = ind;

  // ---------- 4) chart structure: swings, key levels, volume-by-price, anchored VWAP
  const sw = { highs: [], lows: [] };
  for (let i = Math.max(2, t - 120); i <= t - 2; i++) {
    const wH = H.slice(i - 2, i + 3), wL = Lo.slice(i - 2, i + 3);
    if (H[i] === Math.max(...wH)) sw.highs.push([D[i].d, R(H[i], 0)]);
    if (Lo[i] === Math.min(...wL)) sw.lows.push([D[i].d, R(Lo[i], 0)]);
  }
  const lh = sw.highs.slice(-3), ll = sw.lows.slice(-3);
  let structure = 'نامشخص';
  if (lh.length >= 2 && ll.length >= 2) {
    const hhS = lh[lh.length - 1][1] > lh[lh.length - 2][1], hlS = ll[ll.length - 1][1] > ll[ll.length - 2][1];
    structure = hhS && hlS ? 'صعودی (HH/HL)' : (!hhS && !hlS) ? 'نزولی (LH/LL)' : 'رنج/در حال تغییر';
  }
  const lastSH = lh.length ? lh[lh.length - 1][1] : null, lastSL = ll.length ? ll[ll.length - 1][1] : null;
  const win = Math.min(60, hist), vb = {}; let vmin = Infinity, vmax = -Infinity;
  for (let i = t - win + 1; i <= t; i++) { vmin = Math.min(vmin, Lo[i]); vmax = Math.max(vmax, H[i]); }
  const step = (vmax - vmin) / 20 || 1;
  for (let i = t - win + 1; i <= t; i++) { const px = (H[i] + Lo[i] + C[i]) / 3; const b = Math.min(19, Math.floor((px - vmin) / step)); vb[b] = (vb[b] || 0) + V[i]; }
  const nodes = Object.entries(vb).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => R(vmin + (+b + 0.5) * step, 0));
  const anchor = ipoIdx >= 0 ? ipoIdx : Math.max(0, t - 60);
  let avN = 0, avD = 0; for (let i = anchor; i <= t; i++) { avN += (H[i] + Lo[i] + C[i]) / 3 * V[i]; avD += V[i]; }
  const levels = [];
  const add = (nm, v) => { if (v && isFinite(v)) levels.push([nm, R(v, 0), R(100 * (v / C[t] - 1), 1)]); };
  add('سقف دیروز', D[t - 1]?.h * fac[t - 1]); add('کف دیروز', D[t - 1]?.l * fac[t - 1]); add('آخرین سقف چرخشی', lastSH); add('آخرین کف چرخشی', lastSL);
  add('سقف ۲۰ روزه', ind.donchian20_high); add('کف ۲۰ روزه', ind.donchian20_low); add('SMA20', ind.sma20); add('SMA50', ind.sma50);
  add(ipoIdx >= 0 ? 'VWAP از عرضهٔ اولیه' : 'VWAP لنگر ۶۰ روزه', avN / avD); nodes.forEach((x, k) => add(`گره حجمی ${k + 1}`, x));
  if (ipoIdx >= 0) add('قیمت عرضهٔ اولیه', D[ipoIdx].c * fac[ipoIdx]);
  levels.sort((a, b) => b[1] - a[1]);
  const res = levels.filter(x => x[1] > C[t] * 1.002), sup = levels.filter(x => x[1] < C[t] * 0.998);
  out.chart = { structure, swing_highs: lh, swing_lows: ll, levels_sorted_high_to_low: levels,
    nearest_resistance: res.length ? res[res.length - 1] : null, nearest_support: sup.length ? sup[0] : null,
    close_above_last_swing_high: lastSH ? C[t] > lastSH * 1.01 : null, close_below_last_swing_low: lastSL ? C[t] < lastSL * 0.99 : null,
    tested_last_swing_low_and_held: lastSL ? (Lo[t] <= lastSL * 1.01 && C[t] > lastSL) : null,
    note: 'levels: [نام، قیمت تعدیل‌شده، فاصله از قیمت پایانی ٪]' };

  // ---------- 4b) multi-timeframe trend (same definitions as the 13-year backtest, trend.py / trend2.py)
  {
    const s0 = ipoIdx > 0 ? ipoIdx : 0;
    const tr = { note: 'زمینه است، امتیاز ندارد؛ قاعدهٔ استفاده در بخش «روند چندافقی» پرامپت' };
    // daily: moving-average alignment
    const s20 = sma(C, 20, t), s50 = sma(C, 50, t), s100 = sma(C, 100, t);
    tr.daily = (s20 === null || s50 === null || s100 === null) ? 'unknown_short_history'
      : (C[t] > s20 && s20 > s50 && s50 > s100) ? 'up' : (C[t] < s20 && s20 < s50 && s50 < s100) ? 'down' : 'mixed';
    // weekly: completed weeks only (Iran week Sat-Wed; key = the Friday that ends it); the current week is excluded
    const wkKey = dEv => { const s = String(dEv); const dt = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); dt.setUTCDate(dt.getUTCDate() + (5 - dt.getUTCDay() + 7) % 7); return dt.toISOString().slice(0, 10); };
    const wk = []; // [key, close, high, low]
    for (let i = s0; i <= t; i++) { const k = wkKey(D[i].d); const w = wk[wk.length - 1];
      if (!w || w[0] !== k) wk.push([k, C[i], H[i], Lo[i]]); else { w[1] = C[i]; w[2] = Math.max(w[2], H[i]); w[3] = Math.min(w[3], Lo[i]); } }
    const done = wk.slice(0, -1), m = done.length, wc = done.map(w => w[1]);
    const wsma = (k, j) => j + 1 < k ? null : wc.slice(j + 1 - k, j + 1).reduce((a, b) => a + b, 0) / k;
    if (m >= 32) {
      const j = m - 1, w10 = wsma(10, j), w30 = wsma(30, j), w10p = wsma(10, j - 2);
      tr.weekly = (wc[j] > w10 && w10 > w30 && w10 > w10p) ? 'up' : (wc[j] < w10 && w10 < w30 && w10 < w10p) ? 'down' : 'mixed';
      tr.weekly_sma10 = R(w10, 0); tr.weekly_sma30 = R(w30, 0);
    } else tr.weekly = 'unknown_short_history';
    if (m >= 8) {
      const hh = a => Math.max(...a.map(w => w[2])), llw = a => Math.min(...a.map(w => w[3]));
      const cur = done.slice(-4), prv = done.slice(-8, -4);
      tr.weekly_structure = (hh(cur) > hh(prv) && llw(cur) > llw(prv)) ? 'HH/HL' : (hh(cur) < hh(prv) && llw(cur) < llw(prv)) ? 'LH/LL' : 'mixed';
    } else tr.weekly_structure = 'unknown_short_history';
    // yearly: 200-day average and its 20-day slope, 52-week range position
    const s200 = sma(C, 200, t), s200p = sma(C, 200, t - 20);
    tr.yearly = (s200 === null || s200p === null) ? 'unknown_short_history' : (C[t] > s200 && s200 > s200p) ? 'up' : (C[t] < s200 && s200 <= s200p) ? 'down' : 'mixed';
    tr.sma200 = R(s200, 0);
    if (hist >= 241) { const h52 = Math.max(...H.slice(t - 239, t + 1)), l52 = Math.min(...Lo.slice(t - 239, t + 1)); tr.position_in_52w_range = R((C[t] - l52) / (h52 - l52), 2); }
    const known = [tr.daily, tr.weekly, tr.yearly].filter(x => !String(x).startsWith('unknown'));
    tr.alignment = known.length < 3 ? 'incomplete' : known.every(x => x === 'up') ? 'all_up' : known.every(x => x === 'down') ? 'all_down' : 'mixed';
    // 60-day regression channel of log price (trendline proxy); today's close vs YESTERDAY's channel
    if (t - s0 >= 61) {
      const fitAt = end => { let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0; const nn = 60;
        for (let i = end - 59, x = 0; i <= end; i++, x++) { const y = Math.log(C[i]); sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }
        const vx = sxx / nn - (sx / nn) ** 2, vy = syy / nn - (sy / nn) ** 2, cv = sxy / nn - (sx / nn) * (sy / nn), b = cv / vx, a = sy / nn - b * sx / nn;
        return { a, b, r2: cv * cv / (vx * vy), sd: Math.sqrt(Math.max(vy - b * b * vx, 0)) }; };
      const f = fitAt(t), fp = fitAt(t - 1), z = (Math.log(C[t]) - (fp.a + fp.b * 60)) / (fp.sd || 1e-9);
      const kind = (f.b * 60 > 0.10 && f.r2 > 0.6) ? 'clean_up' : (f.b * 60 < -0.10 && f.r2 > 0.6) ? 'clean_down' : 'none';
      tr.channel60 = { kind, slope_60d_pct: R(100 * f.b * 60, 1), r2: R(f.r2, 2), z_vs_yesterdays_channel: R(z, 2),
        lower_line_today: R(Math.exp(f.a + f.b * 59 - 2 * f.sd), 0), upper_line_today: R(Math.exp(f.a + f.b * 59 + 2 * f.sd), 0) };
    }
    out.trend = tr;
  }

  // ---------- 5) order book
  const Bk = bl?.bestLimits || [], top = Bk[0] || {};
  const pMax = I.staticThreshold?.psGelStaMax, pMin = I.staticThreshold?.psGelStaMin;
  let queue = 'none';
  if (top.qTitMeDem > 0 && !top.qTitMeOf && pMax && top.pMeDem >= pMax) queue = 'buy_queue';
  if (top.qTitMeOf > 0 && !top.qTitMeDem && pMin && top.pMeOf <= pMin) queue = 'sell_queue';
  out.order_book = { queue, top5: Bk.slice(0, 5).map(b => [b.zOrdMeDem, b.qTitMeDem, b.pMeDem, b.pMeOf, b.qTitMeOf, b.zOrdMeOf]),
    queue_value_billion_toman: R((queue === 'buy_queue' ? top.qTitMeDem * top.pMeDem : queue === 'sell_queue' ? top.qTitMeOf * top.pMeOf : 0) / 1e10, 1),
    note: 'ستون‌ها: تعداد خریدار، حجم خرید، قیمت خرید، قیمت فروش، حجم فروش، تعداد فروشنده' };

  // ---------- 6) flows (individual / institutional)
  const CT = {}; (cth?.clientType || []).forEach(r => CT[r.recDate] = r);
  if (ctToday?.clientType && (last.live || !CT[last.d])) { const q = ctToday.clientType, px = last.c; CT[last.d] = { buy_I_Value: q.buy_I_Volume * px, sell_I_Value: q.sell_I_Volume * px, buy_N_Value: q.buy_N_Volume * px, sell_N_Value: q.sell_N_Volume * px, buy_I_Count: q.buy_CountI, sell_I_Count: q.sell_CountI }; }
  const F = D.map(r => { const x = CT[r.d]; if (!x) return null; const bpc = x.buy_I_Value / Math.max(1, x.buy_I_Count), spc = x.sell_I_Value / Math.max(1, x.sell_I_Count);
    return { d: r.d, val: r.val, bpc, spc, power: bpc / spc, netI: x.buy_I_Value - x.sell_I_Value, nbuy: x.buy_N_Value, nsell: x.sell_N_Value, bc: x.buy_I_Count, sc: x.sell_I_Count }; });
  const fw = F.slice(-60).filter(Boolean), fl = F[t];
  const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const sumK = (k, f) => F.slice(-k).filter(Boolean).reduce((s, x) => s + f(x), 0);
  const newListing = ipoIdx >= 0 && hist <= 60;
  out.flows = fl ? {
    buyer_power_today: R(fl.power, 2), buyer_power_5d: R(sumK(5, x => x.bpc) / sumK(5, x => x.spc), 2),
    buyer_power_reliable: !newListing, per_capita_buy_toman: R(fl.bpc / 10, 0), per_capita_sell_toman: R(fl.spc / 10, 0),
    per_capita_buy_vs_60d_median: fw.length >= 20 ? R(fl.bpc / med(fw.map(x => x.bpc)), 2) : null,
    indiv_buyers: fl.bc, indiv_sellers: fl.sc,
    indiv_net_today_pct_of_value: R(fl.netI / fl.val, 3), indiv_net_5d_pct: R(sumK(5, x => x.netI) / sumK(5, x => x.val), 3), indiv_net_20d_pct: R(sumK(20, x => x.netI) / sumK(20, x => x.val), 3),
    indiv_net_today_billion_toman: R(fl.netI / 1e10, 1), inst_net_today_billion_toman: R((fl.nbuy - fl.nsell) / 1e10, 1), inst_buy_share: R(fl.nbuy / fl.val, 2), inst_sell_share: R(fl.nsell / fl.val, 2),
    last10: F.slice(-10).filter(Boolean).map(x => [x.d, R(x.power, 2), R(x.netI / 1e10, 1), R((x.nbuy - x.nsell) / 1e10, 1)]),
    note: newListing ? 'سهم تازه‌عرضه است: قدرت خریدار و سرانه‌ها به‌خاطر سهمیهٔ کوچک عرضهٔ اولیه گمراه‌کننده‌اند' : ''
  } : null;

  // ---------- 7) IPO / new listing block
  if (ipoIdx >= 0 && hist <= 120) {
    let k = ipoIdx + 1; while (k < n && lim(k)) k++;
    const streak = k - ipoIdx - 1, openIdx = k < n ? k : null;
    let fdIdx = null; if (openIdx !== null) for (let i = openIdx; i < n; i++) if (D[i].c < D[i].y) { fdIdx = i; break; }
    const phase = openIdx === null ? 'in_initial_queue_streak' : (fdIdx !== null && t - fdIdx <= 10) ? 'after_first_down_day' : (t - openIdx <= 5 ? 'first_open_days' : 'post_ipo');
    out.ipo = { ipo_date: D[ipoIdx].d, ipo_price: D[ipoIdx].c, trading_days_since_ipo: hist - 1, initial_queue_streak: streak,
      first_open_day: openIdx !== null ? D[openIdx].d : null, first_open_day_low: openIdx !== null ? R(Lo[openIdx], 0) : null, first_open_day_high: openIdx !== null ? R(H[openIdx], 0) : null,
      first_down_day: fdIdx !== null ? D[fdIdx].d : null, days_since_first_down: fdIdx !== null ? t - fdIdx : null,
      return_since_ipo: R(C[t] / (D[ipoIdx].c * fac[ipoIdx]) - 1, 3), phase,
      base_rates_192_ipos_1396_1405: {
        after_first_open_day: { up_1d: 0.29, up_5d: 0.38, up_20d: 0.44, median_5d_pct: -3.3, median_20d_pct: -3.8 },
        after_first_down_day: { up_1d: 0.23, up_3d: 0.26, up_5d: 0.33, up_20d: 0.42, median_5d_pct: -3.8, median_20d_pct: -6.1 },
        after_first_down_day_if_streak_ge_8: { n: 103, up_1d: 0.20, up_5d: 0.31, up_20d: 0.39, median_20d_pct: -10.2 },
        first_down_day_with_institutional_net_buy_gt_20pct: { n: 59, up_1d: 0.24, up_5d: 0.31, up_20d: 0.47 },
        by_era_after_first_down_up_1d: { '1396-98': 0.23, '1399-1400': 0.10, '1401-02': 0.31, '1403-05': 0.30 },
        sixty_days_after_first_open: { share_positive: 0.53, median_pct: 3.4 } } };
  }

  // ---------- 8) major holders (>1%)
  const cls = nm => /^شخص حقيقي/.test(nm) ? 'individual' : /BFM|بازارگرداني/.test(nm) ? 'market_maker' : /^PRX|سبد/.test(nm) ? 'portfolio' : /صندوق.*(بازنشستگي|بيمه اجتماعي)/.test(nm) ? 'pension' : /صندوق/.test(nm) ? 'fund' : /بيمه/.test(nm) ? 'insurance' : /بانك/.test(nm) ? 'bank' : /واسط مالي/.test(nm) ? 'sukuk_spv' : /تامين|شستا|صبا|آتيه/.test(nm) ? 'strategic_social_security' : /پتروشيمي|نفت|گاز|پالايش/.test(nm) ? 'strategic_parent_or_peer' : /سرمايه گذاري|گروه|توسعه/.test(nm) ? 'investment_co' : 'other';
  const hd = [];
  for (const r of D.slice(-6)) { const j = await J(`Shareholder/${ic}/${r.d}`, 2, 10000); const rows = j?.shareShareholder || []; const des = [...new Set(rows.map(x => x.dEven))].sort(); if (des.length < 2) continue;
    const cur = {}, prev = {}; rows.forEach(x => { const T = x.dEven === des[des.length - 1] ? cur : prev; T[x.shareHolderName] = (T[x.shareHolderName] || 0) + x.numberOfShares; });
    for (const nm of new Set([...Object.keys(cur), ...Object.keys(prev)])) { const dsh = (cur[nm] || 0) - (prev[nm] || 0); if (Math.abs(dsh) < 1) continue;
      hd.push({ date: r.d, holder: nm, type: cls(nm), delta_shares: dsh, value_billion_toman: R(dsh * r.c / 1e10, 2), now_pct: I.zTitad ? R(100 * (cur[nm] || 0) / I.zTitad, 3) : null, new_above_1pct: !(nm in prev), dropped_below_1pct: !(nm in cur) }); } }
  const lastHold = await J(`Shareholder/GetInstrumentShareHolderLast/${ic}`, 2);
  out.holders = { top: (lastHold?.shareHolder || []).slice(0, 8).map(x => [x.shareHolderName, R(x.perOfShares, 2), cls(x.shareHolderName)]), changes_6d: hd };

  // ---------- 9) group (44) breadth, flows EXCLUDING this symbol, index context + live append
  const mw = await J('ClosingPrice/GetMarketWatch?market=0&paperTypes[0]=1&paperTypes[1]=2&showTraded=false&withBestLimits=true');
  const G = (mw?.marketwatch || []).filter(x => (x.csv || '').trim() === '44' && [1, 2, 4].includes(x.flow) && !/\d$/.test(x.lva) && x.qtc > 0);
  const cta = await J('ClientType/GetClientTypeAll'); const CTA = {}; (cta?.clientTypeAllDto || []).forEach(x => CTA[x.insCode] = x);
  let netI = 0, tv = 0, selfNet = 0, selfVal = 0;
  G.forEach(x => { const c = CTA[x.insCode]; if (!c) return; const nI = (c.buy_I_Volume - c.sell_I_Volume) * x.pcl; if (x.insCode === ic) { selfNet = nI; selfVal = x.qtc; } else { netI += nI; tv += x.qtc; } });
  const qb = G.filter(x => x.pdv >= x.pMax && x.blDs?.[0]?.qmo === 0).length, qsl = G.filter(x => x.pdv <= x.pMin && x.blDs?.[0]?.qmd === 0).length;
  const [ix44, ixT, ixLive] = await Promise.all([J('Index/GetIndexB2History/33626672012415176'), J('Index/GetIndexB2History/32097828799138957'), J('Index/GetIndexB1LastAll/All/1')]);
  const liveIdx = {}; (ixLive?.indexB1 || Object.values(ixLive || {})[0] || []).forEach(x => liveIdx[x.insCode] = x.xDrNivJIdx004);
  const idx = (h, code) => { const rows = (h?.indexB2 || []).sort((x, y) => x.dEven - y.dEven); const a = rows.map(x => x.xNivInuClMresIbs); let appended = false;
    if (last.d > (rows[rows.length - 1]?.dEven || 0) && liveIdx[code]) { a.push(liveIdx[code]); appended = true; }
    const k = a.length - 1; const m50 = a.slice(k - 49, k + 1).reduce((s, x) => s + x, 0) / 50; return { level: a[k], r1: R(a[k] / a[k - 1] - 1), r5: R(a[k] / a[k - 5] - 1), r20: R(a[k] / a[k - 20] - 1), above_sma50: a[k] > m50, live_appended: appended }; };
  const c44 = idx(ix44, '33626672012415176');
  const regime = c44.r20 > 0.10 ? 'hot' : c44.r20 < -0.05 ? 'cold' : 'mid';
  out.group = { n_traded: G.length, pct_up: R(G.filter(x => x.pdv > x.py).length / G.length, 2), buy_queues: qb, sell_queues: qsl,
    avg_change_pct: R(100 * G.reduce((s, x) => s + (x.pcl / x.py - 1), 0) / G.length, 2),
    indiv_net_flow_pct_of_value_ex_self: R(netI / tv, 3), indiv_net_flow_billion_toman_ex_self: R(netI / 1e10, 1),
    this_symbol_share_of_group_value: R(selfVal / (tv + selfVal), 3), this_symbol_indiv_net_billion_toman: R(selfNet / 1e10, 1),
    chem44_index: c44, total_index: idx(ixT, '32097828799138957'), regime,
    regime_rule: 'hot = شاخص ۴۴ در ۲۰ روز بیش از +۱۰٪؛ cold = کمتر از −۵٪؛ بقیه mid' };

  // ---------- 10) today's intraday (5-minute bars) — with timeout, optional
  const tr = await J(`Trade/GetTrade/${ic}`, 2, 12000); const T5 = {};
  if (!tr) out.warnings.push('دادهٔ معاملات درون‌روز امروز نیامد (timeout)');
  (tr?.trade || []).filter(x => !x.canceled).sort((a, b) => a.nTran - b.nTran).forEach(x => { const s = Math.floor(x.hEven / 10000) * 60 + Math.floor(x.hEven / 100 % 100); const k = Math.max(0, Math.floor((s - 540) / 5)); const b = T5[k] ||= { o: x.pTran, h: x.pTran, l: x.pTran, c: x.pTran, v: 0, val: 0 }; b.h = Math.max(b.h, x.pTran); b.l = Math.min(b.l, x.pTran); b.c = x.pTran; b.v += x.qTitTran; b.val += x.qTitTran * x.pTran; });
  const ks = Object.keys(T5).map(Number).sort((a, b) => a - b); const hm = k => `${String(9 + Math.floor(k * 5 / 60)).padStart(2, '0')}:${String(k * 5 % 60).padStart(2, '0')}`;
  if (ks.length) { const vw = ks.reduce((s, k) => s + T5[k].val, 0) / ks.reduce((s, k) => s + T5[k].v, 0); const lastP = T5[ks[ks.length - 1]].c;
    const pAt = m => { const k = ks.filter(k => k < m / 5); return k.length ? T5[k[k.length - 1]].c : null; };
    out.intraday_today = { first_trade_time: hm(ks[0]), open: T5[ks[0]].o, last: lastP, vwap: R(vw, 0), last_vs_vwap_pct: R(100 * (lastP / vw - 1), 2),
      ret_first30m_pct: pAt(30) ? R(100 * (pAt(30) / T5[ks[0]].o - 1), 2) : null, ret_last30m_pct: pAt(180) ? R(100 * (lastP / pAt(180) - 1), 2) : null,
      bars_5m: ks.slice(-12).map(k => [hm(k), T5[k].o, T5[k].h, T5[k].l, T5[k].c, T5[k].v]) }; }

  // ---------- 11) rubric (v1 points; indicator rows only when history allows) + regime calibration
  const f = out.flows || {}, d = ind, P = {};
  // v2 points: re-estimated on 1392-1405 (13 years, 62 group-44 stocks); rows without a stable effect were removed
  const pw = f.buyer_power_reliable ? f.buyer_power_today : null;
  const smart = f.per_capita_buy_vs_60d_median > 2 && pw > 1.5;
  P.smart_retail_money = smart ? 2 : 0;
  P.buyer_power_gt2 = (!smart && pw > 2) ? 1 : 0;
  P.buyer_power_lt05 = (pw !== null && pw < 0.5) ? -1 : 0;
  P.buy_queue_close = d.closed_at_upper_limit ? 2 : 0;
  P.sell_queue_close = d.closed_at_lower_limit ? -2 : 0;
  P.strong_finish = d.last_minus_close_pct > 1 ? 2 : 0;
  P.weak_finish = d.last_minus_close_pct < -1 ? -2 : 0;
  P.rsi_below_30 = (d.rsi14 !== null && d.rsi14 < 30) ? -2 : 0;
  P.above_upper_bollinger = (d.bollinger_pctb !== null && d.bollinger_pctb > 1) ? 1 : 0;
  const sub = Object.values(P).reduce((s, x) => s + x, 0);
  // context only (no points: unstable or not significant over 13 years)
  const strat = ['strategic_social_security', 'strategic_parent_or_peer', 'pension', 'investment_co'];
  const context = { indiv_outflow_5d_gt10pct: f.indiv_net_5d_pct < -0.10, indiv_inflow_today_gt20pct: f.indiv_net_today_pct_of_value > 0.20,
    new_20d_low: !!(d.donchian20_low && C[t] < d.donchian20_low), new_20d_high_with_volume: !!(d.donchian20_high && C[t] > d.donchian20_high && d.vol_ratio_20 > 1.5),
    adx_downtrend: d.adx14 !== null && d.adx14 > 25 && d.minus_di > d.plus_di, group_flow_ex_self: out.group.indiv_net_flow_pct_of_value_ex_self,
    strategic_holder_buy_5d: hd.some(x => strat.includes(x.type) && x.delta_shares > 0 && Math.abs(x.value_billion_toman) >= 1),
    strategic_holder_sell_5d: hd.some(x => strat.includes(x.type) && x.delta_shares < 0 && Math.abs(x.value_billion_toman) >= 1),
    close_above_last_swing_high: out.chart.close_above_last_swing_high, close_below_last_swing_low: out.chart.close_below_last_swing_low };
  // calibration 1392-1405, tradable days only: [n, P(up 1d), P(up 3d), P(up 5d), P(up 10d), median 5d %, avg gain 5d %, avg loss 5d %]
  const CAL = { hot: { '<=-4': [30, .10, .23, .20, .27, -3.3, 3.4, -5.6], '-3..-2': [2575, .25, .52, .55, .58, 0.8, 6.7, -4.8], '-1..+1': [9398, .51, .54, .57, .61, 1.0, 6.4, -4.2], '+2..+3': [2332, .76, .56, .57, .60, 1.1, 7.0, -4.5], '>=+4': [141, .87, .72, .74, .78, 4.4, 10.1, -3.5], ALL: [14476, .50, .54, .57, .61, 1.0, 6.6, -4.4] },
    mid: { '<=-4': [1313, .11, .26, .31, .40, -0.6, 3.3, -2.3], '-3..-2': [9771, .23, .38, .41, .45, -0.5, 5.6, -3.0], '-1..+1': [29601, .44, .46, .48, .50, -0.1, 5.8, -3.1], '+2..+3': [5726, .73, .54, .54, .54, 0.3, 9.9, -3.3], '>=+4': [441, .81, .60, .58, .58, 0.5, 5.2, -3.1], ALL: [46852, .43, .45, .47, .49, -0.2, 6.3, -3.0] },
    cold: { '<=-4': [535, .18, .36, .38, .46, -0.6, 4.1, -2.5], '-3..-2': [2789, .31, .42, .43, .48, -0.5, 4.6, -3.4], '-1..+1': [5497, .49, .46, .47, .49, -0.2, 5.2, -4.0], '+2..+3': [1177, .76, .49, .50, .49, 0.0, 5.9, -4.4], '>=+4': [65, .77, .62, .57, .54, 1.9, 7.2, -4.9], ALL: [10063, .45, .45, .46, .48, -0.3, 5.1, -3.8] } };
  const band = s => s <= -4 ? '<=-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : '>=+4';
  const cal = CAL[regime][band(sub)], base = CAL[regime].ALL;
  const newIPO = ipoIdx >= 0 && hist <= 120;
  out.rubric = { version: 2, points: P, subtotal_without_codal: sub, band_without_codal: band(sub), regime, context,
    calibration_for_this_band: { n: cal[0], p_up_1d: cal[1], p_up_3d: cal[2], p_up_5d: cal[3], p_up_10d: cal[4], median_5d_pct: cal[5], avg_gain_5d_pct: cal[6], avg_loss_5d_pct: cal[7] },
    base_rate_this_regime: { p_up_1d: base[1], p_up_5d: base[3], median_5d_pct: base[5] },
    edge_vs_base_5d_pp: Math.round(100 * (cal[3] - base[3])),
    applicable: !newIPO,
    note: newIPO ? 'سهم تازه‌عرضه است: جدول کالیبراسیون قابل‌اتکا نیست؛ از بلوک ipo استفاده کن' : 'امتیاز کدال را اضافه کن و باند را دوباره تعیین کن؛ لبه = اختلاف با نرخ پایهٔ همین رژیم',
    tradability: d.closed_at_upper_limit ? 'در صف خرید بسته شده — خرید عملاً ممکن نیست' : d.closed_at_lower_limit ? 'در صف فروش بسته شده — فروش عملاً ممکن نیست' : 'قابل معامله' };
  return out;
}

/* ------------------------------------------------------------------------
   B) petroEvaluate(logs): logs = [{date:'1405/07/04', symbol:'تابان', decision:'NO_BUY_REDUCE', ref_price:19990}, ...]
   (date = day the call was made, ref_price = that day's closing price). Run on tsetmc.com.
   Returns realised moves after 1, 3, 5, 10, 20 trading days and whether the call direction was right. */
async function petroEvaluate(logs) {
  const BASE = 'https://cdn.tsetmc.com/api/';
  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').trim();
  const g2j = d => { const s = String(d); const dt = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\d/]/g, ''); };
  const res = [];
  for (const L of logs) {
    const s = await (await fetch(BASE + 'Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(L.symbol)))).json();
    const ins = (s.instrumentSearch || []).find(x => ar(x.lVal18AFC) === ar(L.symbol) && [1, 2, 4].includes(x.flow)); if (!ins) { res.push({ ...L, error: 'not found' }); continue; }
    const d = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceDailyList/${ins.insCode}/120`)).json()).closingPriceDaily.filter(r => r.qTotTran5J > 0).sort((a, b) => a.dEven - b.dEven);
    const lv = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceInfo/${ins.insCode}`)).json()).closingPriceInfo || {};   // today's row is not in the history until the evening
    if (lv.finalLastDate > (d[d.length - 1]?.dEven || 0) && lv.qTotTran5J > 0) d.push({ dEven: lv.finalLastDate, pClosing: lv.pClosing, priceYesterday: lv.priceYesterday, qTotTran5J: lv.qTotTran5J });
    const i0 = d.findIndex(r => g2j(r.dEven) === L.date); if (i0 < 0) { res.push({ ...L, error: 'date not found' }); continue; }
    const fac = []; let f = 1; for (let i = d.length - 1; i >= i0; i--) { fac[i] = f; if (i > i0) { let q = d[i].priceYesterday / d[i - 1].pClosing; if (q > 0.995 && q < 1.005) q = 1; f *= q; } }
    const out = { ...L, trading_days_since: d.length - 1 - i0 };
    for (const k of [1, 3, 5, 10, 20]) { const j = i0 + k; if (j < d.length) out[`ret_${k}d_pct`] = Math.round(10000 * (d[j].pClosing * fac[j] / (d[i0].pClosing * fac[i0]) - 1)) / 100; }
    const bull = /BUY/.test(L.decision) && !/NO_BUY/.test(L.decision), bear = /SELL|REDUCE|NO_BUY/.test(L.decision);
    for (const k of [1, 5, 20]) if (out[`ret_${k}d_pct`] !== undefined) out[`right_${k}d`] = bull ? out[`ret_${k}d_pct`] > 0 : bear ? out[`ret_${k}d_pct`] <= 0 : null;
    res.push(out);
  }
  return res;
}

/* ------------------------------------------------------------------------ */
async function codalSnapshot(symbol, days = 120) {
  const fa = s => (s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const jal = dt => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\d/]/g, '');
  const toDig = s => (s || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
  const q = (sym, from, to, page) => 'https://search.codal.ir/api/search/v2/q?&Audit=true&AuditorRef=-1&Category=-1&Childs=true&CompanyState=-1&CompanyType=-1&Consolidatable=true&IsNotAudited=false&Length=-1&LetterType=-1&Mains=true&NotAudited=true&NotConsolidatable=true&Publisher=false&TracingNo=-1&search=true&PageNumber=' + page + '&Symbol=' + encodeURIComponent(sym) + '&FromDate=' + encodeURIComponent(from) + '&ToDate=' + encodeURIComponent(to);
  // search.codal.ir rate-limits bursts (HTTP 429): back off and space the calls
  const J = async u => { for (let i = 0; i < 5; i++) { const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 20000);
      try { const r = await fetch(u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); if (r.status === 429) { await sleep(4000 * 2 ** i); continue; } } catch (e) { clearTimeout(tm); } await sleep(1500 * (i + 1)); } return null; };
  const classify = t => {
    if (/افشای اطلاعات/.test(t)) { const m = t.match(/\((.*)\)\s*منتهی/); const x = m ? m[1] : t;
      if (/دیوان|دادنامه|شورای رقابت|ابطال مصوب|ماده ۹۱/.test(x)) return 'REGULATORY_COURT';
      if (/سرویس/.test(x)) return 'UTILITY_RATES';
      if (/گاز|خوراک|مواد اولیه|بهای تمام شده/.test(x)) return 'FEED_GAS_PRICE';
      if (/توقف|تعمیرات|قطع|محدودیت/.test(x)) return 'SHUTDOWN';
      if (/شروع مجدد|راه.?اندازی مجدد|آغاز فرآیند تولید|بهره.?برداری/.test(x)) return 'RESTART';
      if (/قرارداد|مزایده|مناقصه/.test(x)) return 'CONTRACT';
      if (/دعوی|دادگاه/.test(x)) return 'LEGAL';
      return 'MATERIAL_OTHER'; }
    const rules = [['MONTHLY', /گزارش فعالیت ماهانه/], ['PORTFOLIO_NAV', /صورت وضعیت پورتفوی/], ['FS_EXPLAIN', /توضیحات در خصوص اطلاعات و صورت/], ['INTERIM_FS', /میاندوره/], ['ANNUAL_FS', /^صورت.?های مالی/],
      ['AGM_DECISION', /تصمیمات مجمع عمومی عادی سالیانه/], ['AGM_NOTICE', /دعوت به مجمع عمومی عادی سالیانه/], ['DIV_SCHEDULE', /زمانبندی پرداخت سود/],
      ['CAPINC_PROPOSAL', /پیشنهاد هیئت مدیره.*افزایش سرمایه/], ['CAPINC_STEP', /افزایش سرمایه/], ['EGM', /مجمع عمومی فوق العاده/], ['RUMOR_CLARIFY', /شفاف سازی در خصوص شایعه/],
      ['BOARD_CEO_CHANGE', /هیئت مدیره.*مدیر عامل|مدیر عامل/], ['HALT', /تعلیق نماد|توقف نماد/]];
    for (const [k, rx] of rules) if (rx.test(t)) return k; return 'OTHER'; };
  const now = new Date(), from = jal(new Date(now - days * 864e5)), to = jal(now);
  const letters = []; const first = await J(q(fa(symbol), from, to, 1));
  if (!first) return { symbol, error: 'جست‌وجوی کدال پاسخ نداد (احتمالاً 429)؛ یک دقیقه بعد دوباره اجرا کن. نتیجهٔ خالی را «بدون اطلاعیه» تفسیر نکن' };
  letters.push(...(first?.Letters || []));
  for (let p = 2; p <= (first?.Page || 1); p++) { await sleep(500); const j = await J(q(fa(symbol), from, to, p)); letters.push(...(j?.Letters || [])); }
  const L = letters.map(x => ({ type: classify(x.Title), title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url, tracing: x.TracingNo }));
  const monthly = [];
  for (const m of L.filter(x => x.type === 'MONTHLY' && !/اصلاحیه/.test(x.title)).slice(0, 3)) {
    try { const h = await (await fetch(m.url)).text(); const s = h.match(/var datasource = (\{.*?\});\s*\n/s); if (!s) continue; const ds = JSON.parse(s[1]);
      for (const sh of ds.sheets || []) for (const tb of sh.tables || []) { if (!/ProductionAndSales|Sales/i.test(tb.aliasName || '')) continue;
        const tot = Math.max(...tb.cells.filter(c => (c.value || '').trim() === 'جمع').map(c => c.rowSequence)); if (!isFinite(tot)) continue;
        const row = {}; tb.cells.filter(c => c.rowSequence === tot).forEach(c => row[c.columnSequence] = c.value);
        const sub = {}; tb.cells.filter(c => c.rowSequence === 2).forEach(c => sub[c.columnSequence] = c.value || '');
        const groups = tb.cells.filter(c => c.rowSequence === 1).map(c => { let amt = null; for (let k = c.columnSequence; k < c.columnSequence + (c.colSpan || 1); k++) if (/مبلغ/.test(sub[k] || '')) amt = k; return [c.value, amt ? Number(String(row[amt] || '').replace(/,/g, '')) : null]; }).filter(g => g[1] !== null);
        monthly.push({ period: ds.periodEndToDate, published: m.published, groups_million_rial: groups }); break; } } catch (e) {} }
  const peers = ['فارس', 'شپدیس', 'نوری', 'جم', 'پارس', 'تاپیکو', 'پترول', 'شیراز', 'زاگرس', 'مارون', 'آریا', 'شگویا', 'بوعلی', 'کرماشا'];
  const f10 = jal(new Date(now - 10 * 864e5)); const sector = [];
  for (const p of peers) { await sleep(700); const j = await J(q(p, f10, to, 1)); (j?.Letters || []).forEach(x => { const ty = classify(x.Title); if (['REGULATORY_COURT', 'UTILITY_RATES', 'FEED_GAS_PRICE', 'SHUTDOWN', 'RESTART', 'HALT'].includes(ty)) sector.push({ symbol: x.Symbol, type: ty, title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url }); }); }
  const recent = t => L.filter(x => x.type === t).slice(0, 1).map(x => x.published)[0] || null;
  return { symbol, window_days: days, n_letters: L.length, letters: L.slice(0, 40), monthly_sales: monthly, sector_regulatory_10d: sector,
    last_seen: { AGM_DECISION: recent('AGM_DECISION'), BOARD_CEO_CHANGE: recent('BOARD_CEO_CHANGE'), SHUTDOWN: recent('SHUTDOWN'), RUMOR_CLARIFY: recent('RUMOR_CLARIFY'), HALT: recent('HALT'), REGULATORY_COURT: recent('REGULATORY_COURT'), UTILITY_RATES: recent('UTILITY_RATES'), FEED_GAS_PRICE: recent('FEED_GAS_PRICE'), CAPINC_PROPOSAL: recent('CAPINC_PROPOSAL'), PORTFOLIO_NAV: recent('PORTFOLIO_NAV') } };
}

/* ------------------------------------------------------------------------
   D) codalLetterText(url): material-disclosure forms keep text in `clientDataSource`, structured
   reports in `datasource`; AGM decisions and many others are server-rendered HTML (read the DOM).
   PDF attachments are not parsed: if the key numbers are in the attachment, say so. */
async function codalLetterText(url) {
  const h = await (await fetch(url)).text();
  const m = h.match(/var (?:clientDataSource|datasource) = (\{.*?\});\s*\n/s);
  let text = null;
  if (m) { const texts = []; const walk = o => { if (typeof o === 'string') { const x = o.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); if (x.length > 3 && /[؀-ۿ]/.test(x)) texts.push(x); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
    walk(JSON.parse(m[1])); text = [...new Set(texts)].join(' | '); }
  if (!text || text.length < 80) { const doc = new DOMParser().parseFromString(h, 'text/html'); doc.querySelectorAll('script,style').forEach(e => e.remove());
    const t2 = (doc.body?.innerText || doc.body?.textContent || '').replace(/\{\{[^}]*\}\}/g, ' ').replace(/\s+/g, ' ').trim(); if (t2.length > (text || '').length) text = t2; }
  return { url, has_attachment: /Attachment\.aspx/.test(h), text: (text || '').slice(0, 8000) || null };
}

return { petroSnapshot, petroEvaluate, codalSnapshot, codalLetterText };
})(PW_NET.fetch);

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

})();

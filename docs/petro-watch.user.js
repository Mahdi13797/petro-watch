// ==UserScript==
// @name         دیدبان پتروشیمی — پنل داده
// @namespace    https://github.com/Mahdi13797/petro-watch
// @version      2.4.0
// @description  جمع‌آوری داده از tsetmc و کدال برای عامل تحلیل سهام پتروشیمی، با داشبورد و «کپی برای Claude»
// @match        https://www.tsetmc.com/*
// @match        https://tsetmc.com/*
// @match        https://www.codal.ir/*
// @match        https://codal.ir/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @connect      cdn.tsetmc.com
// @connect      www.tsetmc.com
// @connect      tsetmc.com
// @connect      search.codal.ir
// @connect      www.codal.ir
// @connect      codal.ir
// @run-at       document-idle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Mahdi13797/petro-watch/main/docs/petro-watch.user.js
// @downloadURL  https://raw.githubusercontent.com/Mahdi13797/petro-watch/main/docs/petro-watch.user.js
// @homepageURL  https://github.com/Mahdi13797/petro-watch
// ==/UserScript==
(function () {
const PW_VERSION = "2.4.0";
const PW_REPO = "https://github.com/Mahdi13797/petro-watch";
const PW_PAGES = "https://mahdi13797.github.io/petro-watch/";
const PW_CSS = ":host { all: initial; }\n.pw {\n  --bg: #ffffff; --surface: #f5f6f8; --surface2: #eceff3; --line: #dfe3e8; --text: #16191d; --muted: #5b6470;\n  --accent: #0f6e66; --accent-soft: #e2f2f0; --accent-ink: #ffffff;\n  --pos: #137a3e; --pos-soft: #e3f4ea; --neg: #b42318; --neg-soft: #fbe7e5; --warn: #9a5b00; --warn-soft: #fdf1dc;\n  --shadow: 0 10px 30px rgba(16, 24, 40, .18), 0 2px 6px rgba(16, 24, 40, .08);\n  /* chart lines (validated order: blue, orange, violet, magenta, yellow, aqua) */\n  --c-ma1: #2a78d6; --c-ma2: #eb6834; --c-ma3: #4a3aa7; --c-tenkan: #e87ba4; --c-kijun: #eda100; --c-fib: #1baf7a; --c-band: #7d8792;\n  font-family: Vazirmatn, \"Vazirmatn\", Tahoma, \"Segoe UI\", sans-serif; font-size: 13px; line-height: 1.65; color: var(--text);\n  direction: rtl; text-align: right; -webkit-font-smoothing: antialiased;\n}\n@media (prefers-color-scheme: dark) {\n  .pw {\n    --bg: #14171b; --surface: #1c2025; --surface2: #242930; --line: #2e343c; --text: #e8ebef; --muted: #9aa3ae;\n    --accent: #3cc7b5; --accent-soft: #173a36; --accent-ink: #06201d;\n    --pos: #4ccf85; --pos-soft: #16311f; --neg: #ff7b6e; --neg-soft: #3a1b18; --warn: #f2b84b; --warn-soft: #3a2c12;\n    --shadow: 0 10px 30px rgba(0, 0, 0, .5);\n    --c-ma1: #3987e5; --c-ma2: #d95926; --c-ma3: #9085e9; --c-tenkan: #d55181; --c-kijun: #c98500; --c-fib: #199e70; --c-band: #8f99a5;\n  }\n}\n.pw *, .pw *::before, .pw *::after { box-sizing: border-box; }\n.pw button, .pw input, .pw select, .pw textarea { font: inherit; color: inherit; }\n.pw [hidden] { display: none !important; }\n\n/* floating button + panel */\n.fab { position: fixed; left: 16px; bottom: 16px; z-index: 2147483646; display: flex; align-items: center; gap: 6px;\n  border: 0; border-radius: 999px; padding: 9px 14px; background: var(--accent); color: var(--accent-ink); font-weight: 700;\n  box-shadow: var(--shadow); cursor: pointer; }\n.fab svg { width: 18px; height: 18px; }\n.panel { position: fixed; left: 16px; top: 16px; bottom: 16px; z-index: 2147483647; width: min(480px, calc(100vw - 32px));\n  display: flex; flex-direction: column; background: var(--bg); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); overflow: hidden; }\n.panel.wide { width: min(860px, calc(100vw - 32px)); }\n.inline .panel { position: relative; left: auto; top: auto; bottom: auto; width: auto; box-shadow: none; max-height: none; }\n.ph { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--line); background: var(--surface); }\n.brand { display: flex; align-items: center; gap: 8px; font-size: 14px; }\n.brand svg { width: 20px; height: 20px; color: var(--accent); }\n.ver { font-size: 11px; color: var(--muted); border: 1px solid var(--line); border-radius: 6px; padding: 0 6px; }\n.hbtns { display: flex; gap: 4px; }\n.icon { border: 0; background: transparent; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; color: var(--muted); display: grid; place-items: center; }\n.icon:hover { background: var(--surface2); color: var(--text); }\n.icon svg { width: 16px; height: 16px; }\n.tabs { display: flex; gap: 2px; padding: 6px 10px 0; border-bottom: 1px solid var(--line); }\n.tabs button { border: 0; background: transparent; padding: 7px 12px; cursor: pointer; color: var(--muted); border-bottom: 2px solid transparent; }\n.tabs button.on { color: var(--text); border-bottom-color: var(--accent); font-weight: 700; }\n.body { flex: 1; overflow: auto; padding: 12px 14px 24px; }\n\n/* controls */\n.btn { border: 1px solid var(--line); background: var(--bg); border-radius: 9px; padding: 6px 12px; cursor: pointer; white-space: nowrap; }\n.btn:hover { background: var(--surface2); }\n.btn.primary { background: var(--accent); color: var(--accent-ink); border-color: transparent; font-weight: 700; }\n.btn.primary:hover { filter: brightness(1.07); }\n.btn.danger { color: var(--neg); }\n.btn.sm { padding: 2px 8px; font-size: 12px; border-radius: 7px; }\n.btn:disabled { opacity: .55; cursor: default; }\n.inp { border: 1px solid var(--line); background: var(--bg); border-radius: 9px; padding: 6px 10px; min-width: 0; }\n.inp:focus, .btn:focus-visible, .ta:focus { outline: 2px solid var(--accent); outline-offset: 1px; }\n.ta { width: 100%; min-height: 96px; border: 1px solid var(--line); border-radius: 9px; padding: 8px; background: var(--bg); direction: ltr; text-align: left; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; }\n.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\n.row.between { justify-content: space-between; }\n.grow { flex: 1; }\n.symrow .inp { flex: 1; font-size: 15px; font-weight: 700; }\n.opts { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 8px 0 2px; color: var(--muted); font-size: 12px; }\n.opts label { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }\n.opts .inp { width: 64px; padding: 2px 6px; }\n.recent { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }\n.chip { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line); background: var(--surface); border-radius: 999px; padding: 1px 9px; font-size: 12px; }\nbutton.chip { cursor: pointer; }\nbutton.chip:hover { border-color: var(--accent); }\n.chip.off { opacity: .5; }\n.mode { margin-top: 8px; font-size: 12px; color: var(--muted); }\ndetails.more { margin-top: 6px; }\ndetails.more > summary { cursor: pointer; color: var(--muted); font-size: 12px; }\n\n/* run steps */\n.steps { margin: 12px 0 0; padding: 10px 12px; background: var(--surface); border-radius: 10px; font-size: 12px; }\n.step { display: flex; gap: 8px; align-items: center; }\n.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; }\n.step.run .dot { background: var(--accent); animation: pulse 1s infinite; }\n.step.ok .dot { background: var(--pos); }\n.step.err .dot { background: var(--neg); }\n.netline { color: var(--muted); direction: ltr; text-align: left; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11px; margin-top: 4px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n@keyframes pulse { 50% { opacity: .35; } }\n@media (prefers-reduced-motion: reduce) { .step.run .dot { animation: none; } }\n\n/* result */\n.toolbar { position: sticky; top: -12px; z-index: 2; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 12px -14px 10px; padding: 8px 14px; background: var(--bg); border-bottom: 1px solid var(--line); }\n.card { border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 10px; background: var(--bg); }\n.head .h-top { display: flex; justify-content: space-between; gap: 12px; }\n.sym { font-size: 22px; font-weight: 800; line-height: 1.2; }\n.px { text-align: left; white-space: nowrap; }\n.big { font-size: 20px; font-weight: 800; }\n.chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }\n.badge { display: inline-block; border-radius: 6px; padding: 0 7px; font-size: 12px; background: var(--surface2); }\n.badge.ok { background: var(--pos-soft); color: var(--pos); }\n.badge.warn { background: var(--warn-soft); color: var(--warn); }\n.badge.bad { background: var(--neg-soft); color: var(--neg); }\n.badge.hot { background: var(--neg-soft); color: var(--neg); }\n.badge.cold { background: #e4ecfb; color: #2352a3; }\n@media (prefers-color-scheme: dark) { .badge.cold { background: #1a2740; color: #8fb1ff; } }\n.muted { color: var(--muted); }\n.small { font-size: 12px; }\n.lbl { color: var(--muted); font-size: 12px; }\n.n { direction: ltr; unicode-bidi: isolate; display: inline-block; font-variant-numeric: tabular-nums; }\n.pos { color: var(--pos); }\n.neg { color: var(--neg); }\n.note { background: var(--surface); border-radius: 9px; padding: 8px 10px; margin: 8px 0; font-size: 12px; }\n.note.warn { background: var(--warn-soft); color: var(--warn); }\n.note.bad { background: var(--neg-soft); color: var(--neg); }\nul.warns { margin: 8px 0 0; padding: 0 18px 0 0; color: var(--warn); font-size: 12px; }\n\n.sum .top { display: flex; flex-wrap: wrap; gap: 6px 16px; justify-content: space-between; }\n.score { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; margin: 12px 0 6px; }\n.sc-num { font-size: 28px; font-weight: 800; min-width: 44px; text-align: center; }\n.edge { border-radius: 10px; padding: 6px 10px; text-align: center; font-weight: 700; background: var(--surface2); }\n.edge.buy { background: var(--pos-soft); color: var(--pos); }\n.edge.sell { background: var(--neg-soft); color: var(--neg); }\n.edge .small { font-weight: 400; }\n.probs { margin: 8px 0; }\n.pb { display: grid; grid-template-columns: 52px 1fr 110px; gap: 8px; align-items: center; margin: 3px 0; }\n.track { position: relative; height: 10px; background: var(--surface2); border-radius: 5px; overflow: visible; }\n.fill { position: absolute; inset-inline-start: 0; top: 0; bottom: 0; background: var(--accent); border-radius: 5px; }\n.base { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--text); opacity: .7; }\n.pv { font-size: 12px; }\n.probs.ns .pb { grid-template-columns: 128px 1fr 44px; }\n.fill.flat { background: var(--muted); opacity: .6; }\n.fill.neg { background: var(--neg); }\n.kv4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }\n.kv4 > div { background: var(--surface); border-radius: 8px; padding: 5px 8px; }\n.kv4 b { display: block; font-size: 14px; }\n.hints { margin-top: 10px; border-top: 1px dashed var(--line); padding-top: 8px; }\n.hints ul { margin: 4px 0; padding: 0 18px 0 0; }\n.trade { margin-top: 8px; font-size: 12px; }\n.tline { margin-top: 8px; font-size: 12px; }\n\ndetails.sec { border: 1px solid var(--line); border-radius: 12px; margin-bottom: 10px; background: var(--bg); }\ndetails.sec > summary { cursor: pointer; padding: 9px 12px; font-weight: 700; list-style: none; display: flex; justify-content: space-between; align-items: center; }\ndetails.sec > summary::-webkit-details-marker { display: none; }\ndetails.sec > summary::after { content: \"+\"; color: var(--muted); font-weight: 400; }\ndetails.sec[open] > summary::after { content: \"−\"; }\ndetails.sec > .in { padding: 0 12px 12px; }\n.kv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 14px; }\n.wide .kv { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n.kv > div { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dotted var(--line); padding: 3px 0; }\n.kv > div > span:first-child { color: var(--muted); font-size: 12px; }\n.tw { overflow-x: auto; }\ntable { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }\nth { text-align: right; color: var(--muted); font-weight: 500; border-bottom: 1px solid var(--line); padding: 4px 6px; }\ntd { border-bottom: 1px solid var(--line); padding: 4px 6px; vertical-align: top; }\ntr.cur td { background: var(--accent-soft); font-weight: 700; }\ntr.nr td:first-child, tr.ns td:first-child { font-weight: 700; }\n.tag { font-size: 11px; border-radius: 5px; padding: 0 5px; background: var(--surface2); color: var(--muted); font-weight: 400; }\n.candles { width: 100%; height: 96px; direction: ltr; display: block; margin-top: 8px; }\n.candles .up { stroke: var(--pos); fill: var(--pos); }\n.candles .dn { stroke: var(--neg); fill: var(--neg); }\n.candles .vw { stroke: var(--accent); stroke-dasharray: 4 3; }\n.axis { display: flex; justify-content: space-between; direction: ltr; font-size: 11px; color: var(--muted); }\n\n/* technical chart */\n.tcw { position: relative; }\n.tc-ctl { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 6px; }\n.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 9px; overflow: hidden; }\n.seg button { border: 0; background: var(--bg); padding: 3px 10px; cursor: pointer; font-size: 12px; color: var(--muted); }\n.seg button + button { border-inline-start: 1px solid var(--line); }\n.seg button[aria-pressed=\"true\"] { background: var(--accent-soft); color: var(--text); font-weight: 700; }\n.tc-layers { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }\n.lchip { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line); background: var(--bg); border-radius: 999px; padding: 1px 9px; font-size: 11.5px; cursor: pointer; color: var(--muted); }\n.lchip i { width: 10px; height: 3px; border-radius: 2px; display: inline-block; }\n.lchip[aria-pressed=\"true\"] { background: var(--surface2); color: var(--text); border-color: var(--muted); }\n.lchip[aria-pressed=\"false\"] i { opacity: .35; }\n.lchip:focus-visible, .seg button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }\n.tc-svg { width: 100%; min-height: 60px; touch-action: pan-y; }\n.tc-svg svg { display: block; width: 100%; height: auto; }\n.tc-tip { position: absolute; z-index: 3; pointer-events: none; min-width: 140px; background: var(--bg); border: 1px solid var(--line); border-radius: 9px; box-shadow: var(--shadow); padding: 6px 9px; font-size: 12px; }\n.tc-tip .tt-h { font-weight: 700; margin-bottom: 2px; }\n.tc-tip > div:not(.tt-h) { display: flex; justify-content: space-between; gap: 12px; }\n.tc-tip span { color: var(--muted); }\n.tc-note { margin: 6px 0 0; }\n\n.letter { border-bottom: 1px solid var(--line); padding: 7px 0; }\n.letter .lt { display: flex; gap: 6px; align-items: flex-start; justify-content: space-between; }\n.letter .ttl { flex: 1; }\n.letter .acts { display: flex; gap: 4px; flex: none; }\n.letter a { color: var(--accent); text-decoration: none; }\n.tone-neg { background: var(--neg-soft); color: var(--neg); }\n.tone-pos { background: var(--pos-soft); color: var(--pos); }\n.tone-grp { background: var(--warn-soft); color: var(--warn); }\n.txt { white-space: pre-wrap; background: var(--surface); border-radius: 8px; padding: 8px; margin-top: 6px; max-height: 260px; overflow: auto; font-size: 12px; }\nh4 { margin: 12px 0 4px; font-size: 13px; }\n.disc { color: var(--muted); font-size: 11px; margin-top: 14px; }\n.err { background: var(--neg-soft); color: var(--neg); border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; }\n.empty { color: var(--muted); text-align: center; padding: 28px 10px; }\n.merge { margin: 0 0 10px; }\n.book-sum { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }\n.book-sum > div { background: var(--surface); border-radius: 9px; padding: 6px 10px; }\n.book-sum b { display: block; font-size: 16px; }\n.help ol { padding: 0 18px 0 0; margin: 6px 0; }\n.help li { margin: 4px 0; }\n.help code { direction: ltr; unicode-bidi: isolate; background: var(--surface2); border-radius: 5px; padding: 0 4px; font-size: 12px; }\n.toast { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); background: var(--text); color: var(--bg); border-radius: 9px; padding: 6px 14px; font-size: 12px; box-shadow: var(--shadow); max-width: 90%; }\n@media (max-width: 560px) {\n  .panel { left: 8px; right: 8px; top: 8px; bottom: 8px; width: auto; }\n  .kv, .wide .kv { grid-template-columns: 1fr; }\n  .kv4 { grid-template-columns: repeat(2, 1fr); }\n}\n";
const PW_PROMPT = "# پرامپت عامل «دیدبان پتروشیمی» — نسخهٔ ۲٫۴\n\n> **روش استفاده:** کل این متن را به‌عنوان System Prompt (یا اولین پیام) به Claude بدهید و بعد بنویسید:\n> `نماد: شپدیس` — و در صورت تمایل: `افق: ۳ روز` · `وضعیت: دارم / ندارم` · `ریسک هر معامله: ۱٪ سرمایه`\n> برای سنجش کار عامل: `ارزیابی: [خطوط ثبت پیش‌بینی‌های قبلی]`\n> برای آزمون روی گذشته: `آزمون: شپنا · تاریخ: ۱۴۰۳/۰۷/۰۷` (بخش ۷-ب)\n>\n> عامل به مرورگری با دسترسی به tsetmc.com و codal.ir نیاز دارد (مرورگر داخل اپ Claude یا Claude in Chrome روی کامپیوتری در ایران). اگر مرورگر نبود، اسکریپت‌های پیوست را در Console مرورگر خودتان اجرا کنید و خروجی JSON را بفرستید.\n\n**تفاوت با نسخهٔ ۱** (بعد از اجرای واقعی روی «تابان» و آزمون ۱۳ ساله):\n1. کالیبراسیون از «فقط ۱۴۰۳» به **۱۳ سال (۱۳۹۲ تا ۱۴۰۵، ۶۲ سهم گروه ۴۴، حدود ۹۴ هزار روز-سهم)** گسترش یافت و با **walk-forward** آزمون شد (هر سال فقط با داده‌های سال‌های قبل پیش‌بینی شد).\n2. احتمال‌ها حالا **به رژیم گروه وابسته‌اند** (داغ / عادی / سرد). در نسخهٔ ۱ یک جدول واحد برای همهٔ بازارها بود و در بازار داغ سیگنال فروش بیش از حد می‌داد: در ۱۴۰۵ فقط ۲۶٪ سیگنال‌های فروش نسخهٔ ۱ درست درآمد.\n3. امتیازها با دادهٔ ۱۳ ساله دوباره برآورد شد؛ ردیف‌هایی که اثر پایدار نداشتند حذف شدند (شکست کف ۲۰ روزه، روند نزولی ADX، خروج/ورود پول ۵ روزه، جریان پول گروه، سهامداران عمده).\n4. **دفترچهٔ عرضهٔ اولیه (IPO)** با دادهٔ ۱۹۲ عرضهٔ اولیهٔ ۱۳۹۶ تا ۱۴۰۵ اضافه شد.\n5. **خوانش نمودار** به ماژول مستقل تبدیل شد: سطوح کلیدی، ساختار، گره‌های حجمی و VWAP لنگر؛ برای ورود، حد ضرر و هدف.\n6. خروجی حالا **سناریو و ماشهٔ «اگر… آن‌گاه…»** دارد، نه فقط یک حکم؛ و قضاوت تحلیلگر سقف ±۱ دارد.\n7. **ارزیابی خودکار** پیش‌بینی‌های قبلی با `petroEvaluate` و اصلاح چند خطای اسکریپت.\n8. (نسخهٔ ۲٫۱) **روند چندافقی** (روزانه، هفتگی، یک‌ساله، هم‌راستایی و کانال روند ۶۰ روزه) با دادهٔ ۱۳ ساله آزمون شد و بلوک `trend` به اسکریپت اضافه شد. فیلد `weekly` در نسخهٔ ۲ نام برده شده بود ولی اسکریپت آن را نمی‌ساخت؛ درست شد. قاعدهٔ استفاده: بخش ۴-۱-ب.\n9. (نسخهٔ ۲٫۳) **جعبه‌ابزار تکنیکال و رسم نمودار:** فیبوناچی (اصلاحی و گسترشی)، پیوت روزانه و هفتگی، ایچیموکو، Stochastic، Bollinger، MACD، واگرایی RSI، الگوهای کندلی و الگوهای کلاسیک (سقف و کف دوقلو، سر و شانه، مثلث) به اسکریپت اضافه شد (بلوک `technical`، همراه با داده‌های OHLC روزانه و هفتگی برای رسم). همهٔ این ابزارها روی ۱۳ سال آزمون شدند. **برگهٔ خروجی حالا باید نمودار داشته باشد** (بخش ۴-۱-ج).\n10. (نسخهٔ ۲٫۴) **آزمون بازپخش (replay) روی ۱۱ پالایشی، ۱۳۹۲ تا ۱۴۰۵:** برای هر جلسه، داده دقیقاً تا پایان همان جلسه بریده شد و قاعده‌ها با جلسهٔ بعد سنجیده شدند (۲۹ هزار روز-نماد؛ ۱۴۰۳ تا ۱۴۰۵ خارج از نمونه). نتیجه‌ها و تغییرها:\n    - **پیش‌بینی جلسهٔ بعد** حالا بلوک جدا دارد (`next_session`، گام ۶-ب) با سه حالت: بالا، بی‌حرکت، پایین. جدول آن روی خود پالایشی‌ها برآورد شده است. جدول ۵ روزهٔ قبلی از گروه ۴۴ بود و برای پالایشی‌ها آزموده نشده بود.\n    - **«درست درآمدن» دقیق تعریف شد** (قاعدهٔ ۱۰). جهت جلسهٔ بعد، وقتی حرکت بی‌حرکت نبود، در ۸۱ تا ۸۵٪ موارد درست بود. ولی بخش بزرگ این جهت از فاصلهٔ آخرین قیمت با قیمت پایانی امروز می‌آید و قبل از فردا در قیمت هست. از قیمتی که واقعاً می‌شود معامله کرد، معاملهٔ یک‌روزه در همهٔ ناحیه‌ها بعد از کارمزد زیان‌ده بود.\n    - **علت خطاها:** بیشتر خطاهای جهت از حرکت کل بازار یا کل پالایشی‌ها (۳۵ تا ۵۹٪) و شکستن صف (۳۳ تا ۴۹٪) بود، نه از خود سهم.\n    - **دامنهٔ نوسان واقعی هر روز** از tsetmc خوانده می‌شود، نه قاعدهٔ ثابت ±۳٪. مثلاً از ۷ تا ۲۰ مهر ۱۴۰۳ دامنه ±۱٪ بود.\n    - **کدال از فهرست tsetmc** هم خوانده می‌شود (بدون محدودیت 429). اثر اطلاعیه‌ها روی پالایشی‌ها جدا آزموده شد (بخش ۴-۴).\n    - **`petroReplay` و `petroReplayRange`:** آزمون هر تاریخ گذشته با یک فراخوانی (بخش ۷-ب).\n\n---\n\n## ۱. نقش\nتو **تحلیلگر ارشد بازار سرمایهٔ ایران با تخصص صنعت پتروشیمی** و مدیر ریسک هستی. این‌ها را حرفه‌ای بلدی:\n- **خوانش نمودار چندافقی:** ساختار روند (HH/HL، LH/LL)، سطوح حمایت و مقاومت، گپ‌ها، گره‌های حجمی (volume-by-price)، VWAP روزانه و VWAP لنگر (anchored VWAP)، رفتار کندل در سطوح؛ در افق‌های ۵ و ۱۰ دقیقه، روزانه، هفتگی و یک‌ساله. اندیکاتورها و ابزارهای کلاسیک را حرفه‌ای بلدی و رسم می‌کنی: میانگین‌های متحرک، RSI و واگرایی، MACD، Stochastic، Bollinger، ADX، ایچیموکو (تنکان، کیجون، ابر، چیکو)، فیبوناچی اصلاحی و گسترشی، پیوت کلاسیک روزانه و هفتگی، کانال و خط روند، الگوهای کندلی (دوجی، چکش، پوشا، ستارهٔ صبحگاهی و شامگاهی) و الگوهای کلاسیک (سقف و کف دوقلو، سر و شانه، مثلث، پرچم). این را هم می‌دانی که کدام‌ها در بازار ایران لبهٔ آماری دارند و کدام فقط زبان مشترک برای سطح، حد ضرر و هدف‌اند (بخش ۴-۱-ج).\n- **ریزساختار بازار ایران:** دامنهٔ نوسان و تغییرات تاریخی آن، صف خرید و فروش، قیمت پایانی (میانگین وزنی) در برابر آخرین معامله، تعدیل قیمت بعد از مجمع و افزایش سرمایه، بازگشایی نماد، بازارگردان‌ها، عرضهٔ اولیه.\n- **جریان پول حقیقی/حقوقی** و تغییرات سهامداران بالای ۱٪.\n- **کدال:** انواع اطلاعیه، زمان انتشار نسبت به ساعت بازار، و اثر تاریخی هر نوع.\n- **اقتصاد پتروشیمی:** نرخ گاز خوراک و سوخت، سرویس‌های جانبی، نرخ ارز صادراتی، قیمت جهانی متانول/اوره/پلیمرها، فروش در بورس کالا، قطعی گاز زمستان، تعمیرات اساسی، تحریم؛ و برای هلدینگ‌ها، NAV و P/NAV.\n- **آمار تصمیم:** نرخ پایه (base rate)، لبه (edge) نسبت به نرخ پایه، کالیبراسیون، ارزش مورد انتظار (EV)، و اینکه نتیجهٔ یک روز یا یک معامله دربارهٔ درستی روش چیزی نمی‌گوید.\n\n## ۲. خروجی مورد انتظار\nیک **برگهٔ تصمیم یک‌صفحه‌ای** که بگوید در جلسهٔ بعدی بازار چه کنیم: خرید، فروش، نگهداری یا «بدون لبه، کاری نکن». همراه با **پیش‌بینی جلسهٔ بعد (بالا / بی‌حرکت / پایین) و هزینهٔ اجرای آن**، احتمال کالیبره‌شده، لبه نسبت به نرخ پایه، سه سناریوی جلسهٔ بعد با اقدام هر سناریو، ماشه‌های «اگر… آن‌گاه…»، حد ضرر، هدف، **نمودار تکنیکال رسم‌شده** با سطوح و ابزارها، دلایل مستند و شرط باطل‌شدن. بالای برگه یک **جدول اجرایی یک‌خطی** بیاید: چه اقدامی، در چه قیمتی، چه مقدار، چه ساعتی، حد ضرر و هدف.\n\n## ۳. قواعد غیرقابل‌تخطی\n1. **عدد نساز.** هر عدد از دادهٔ جمع‌آوری‌شده (با تاریخ و ساعت) یا از جدول‌های این پرامپت می‌آید.\n2. **قطعیت ممنوع.** احتمال را مثل پیش‌بینی هوا بگو: «در موقعیت‌های مشابه، ۶ بار از ۱۰ بار قیمت در ۵ روز بالا رفت».\n3. **«بدون لبه» را با «منفی» قاطی نکن.** اگر احتمال بالا رفتن با نرخ پایهٔ همان رژیم کمتر از ۸ واحد درصد فاصله دارد، تصمیم «بدون لبه» است، نه «نخر» یا «بفروش». نسخهٔ ۱ در تابان همین خطا را کرد.\n4. **جدول را بیرون از دامنه‌اش به کار نبر.** سهم تازه‌عرضه (کمتر از ۱۲۰ روز)، نماد تازه بازگشایی‌شده، یا سهم با کمتر از ۶۰ روز سابقه جدول مخصوص خودش را دارد (بخش ۴-۶) یا بدون کالیبراسیون گزارش می‌شود.\n5. **قضاوت سقف دارد.** تعدیل قضاوتی حداکثر ±۱ است، باید دلیل داده‌ای مکتوب داشته باشد و به‌تنهایی حق ندارد تصمیم را از یک ناحیه به ناحیهٔ دیگر ببرد.\n6. **قابلیت اجرا:** سهم در صف خرید قابل خرید نیست و سهم در صف فروش قابل فروش نیست.\n7. **تازگی داده:** اگر قیمت یا شاخص مربوط به امروز نیست، یا نماد متوقف است، اول همین را بگو.\n8. **هشدار الزامی:** «این تحلیل آموزشی/پژوهشی است و توصیهٔ سرمایه‌گذاری شخصی نیست؛ مسئولیت تصمیم با معامله‌گر است.»\n9. از اطلاعات نهانی، شایعهٔ بی‌منبع یا توصیه به دستکاری بازار استفاده نکن.\n10. **«درست درآمدن» را دقیق بگو (نسخهٔ ۲٫۴).**\n    - پیش‌بینی جلسهٔ بعد یعنی قیمت **پایانی** فردا نسبت به **پایانی** امروز.\n    - حرکت کمتر از ±۰٫۵٪ «بی‌حرکت» است، نه درست و نه غلط. در آزمون، ۶ تا ۳۸٪ جلسه‌ها این‌طور بودند.\n    - پایانی میانگین وزنی کل روز است. اگر آخرین قیمت امروز از پایانی بالاتر است، پایانی فردا معمولاً بالاتر می‌آید؛ این پیش‌بینی نیست، مکانیک قیمت است. پس سود واقعی را از **آخرین قیمت امروز** (یا پایانی فردا اگر فردا می‌خری) حساب کن.\n    - هزینهٔ خرید و فروش حدود ۱٫۲۵٪ است (خرید حدود ۰٫۳۷٪، فروش حدود ۰٫۸۸٪ با مالیات). هر پیشنهاد معامله باید بگوید بعد از این هزینه چه می‌ماند.\n\n## ۴. روند کار\n\n### گام ۰ — زمان و وضعیت بازار\nساعت تهران؛ روزهای معاملاتی شنبه تا چهارشنبه، پیش‌گشایش حدود ۸:۴۵ و معاملات ۹:۰۰ تا ۱۲:۳۰ (اگر عوض شده از tsetmc بخوان). اگر بعد از بازار است، برنامه برای جلسهٔ بعد است؛ اگر حین بازار است، برای باقی جلسه و جلسهٔ بعد.\n\n### گام ۱ — جمع‌آوری داده\n1. تب `https://www.tsetmc.com`: `await petroSnapshot('نماد')` (پیوست ب). فهرست ۱۵ اطلاعیهٔ آخر کدال هم از خود tsetmc در `codal_recent` می‌آید.\n2. تب `https://www.codal.ir`: `codalSnapshot('نماد', 120).then(r => window.cs = r)` و بعد `window.cs` را بخوان. اگر `error` داشت (معمولاً خطای 429)، یک دقیقه صبر کن و دوباره اجرا کن. خروجی خطادار را «اطلاعیه‌ای نبود» تفسیر نکن. اگر codal.ir در دسترس نبود، `codal_recent` حداقل عنوان و زمان اطلاعیه‌ها را دارد.\n3. متن ۱ تا ۳ اطلاعیهٔ مهم را با `await codalLetterText(url)` بخوان. اگر عدد اصلی در پیوست PDF است، صریحاً بگو «عدد در پیوست است و خوانده نشد».\n4. با جست‌وجوی وب (اگر داری): نرخ دلار آزاد و نرخ مرکز مبادله، روند ۲ هفتهٔ قیمت جهانی محصول اصلی، اخبار کلان ۴۸ ساعت اخیر. منبع بده. **تغییر دلار آزاد از پایان جلسه تا حالا** و **تعطیلی تا جلسهٔ بعد** را هم بنویس (گام ۶-ب، پرچم‌های اطمینان).\n5. اگر کاربر خطوط ثبت پیش‌بینی قبلی را داد: `await petroEvaluate([...])` و کارنامه را گزارش کن.\n\n### گام ۲ — کنترل کیفیت داده\n- `daily.live_row` و `daily.date`: قیمت مال امروز است؟ `instrument.state` مجاز است؟ اگر بلوک `replay` هست، این آزمون گذشته است (بخش ۷-ب).\n- `daily.price_limits_pct`: دامنهٔ نوسان واقعی امروز. اگر ±۲٪ یا کمتر است، بگو؛ «بی‌حرکت» فردا محتمل‌تر است.\n- `warnings`: سابقهٔ کوتاه، نیامدن دادهٔ درون‌روز، و غیره.\n- `group.chem44_index.live_appended`: اگر شاخص امروز از منبع زنده اضافه شده، بگو.\n- `adjustments_last_year`: مجمع یا افزایش سرمایه در ۵ روز اخیر → حالت ویژه (گام ۳).\n- نقدشوندگی: ارزش معاملات ۲۰ روزه کمتر از ۵۰ میلیارد ریال → یک پله اطمینان کمتر.\n\n### گام ۳ — تشخیص «موقعیت» قبل از هر تحلیل (جدید)\nدقیقاً یکی را انتخاب کن و در برگه بنویس:\n\n| موقعیت | نشانه در داده | جدول معتبر |\n|---|---|---|\n| A. عرضهٔ اولیه / تازه‌عرضه | بلوک `ipo` وجود دارد (≤۱۲۰ روز) | فقط دفترچهٔ IPO (بخش ۴-۶) |\n| B. بازگشایی بعد از توقف یا مجمع | اولین روز بعد از توقف طولانی یا تعدیل در ۵ روز اخیر | بدون کالیبراسیون؛ سناریو بده |\n| C. سابقهٔ کوتاه | `history_days` < ۶۰ | بدون کالیبراسیون |\n| D. عادی | هیچ‌کدام | جدول رژیم (گام ۶) |\n\nو **رژیم گروه** را از `group.regime` بخوان: **داغ** (شاخص ۴۴ در ۲۰ روز بیش از +۱۰٪)، **سرد** (کمتر از −۵٪)، **عادی** (بقیه). در ۱۳ سال، نرخ پایهٔ «بالا رفتن در ۵ روز» در بازار داغ ۵۷٪، در عادی ۴۷٪ و در سرد ۴۶٪ بود؛ پس یک امتیاز منفی در بازار داغ معنای متفاوتی با بازار عادی دارد.\n\n### گام ۴ — ماژول‌ها\n\n#### ۴-۱. خوانش نمودار (Chart reading)\nاز بلوک `chart` و `daily` استفاده کن و این‌ها را صریح بنویس:\n- **ساختار:** `chart.structure` (HH/HL صعودی، LH/LL نزولی، رنج).\n- **سطوح:** نزدیک‌ترین حمایت و مقاومت (`nearest_support`، `nearest_resistance`) و فهرست `levels_sorted_high_to_low` (سقف و کف دیروز، آخرین سقف و کف چرخشی، سقف و کف ۲۰ روزه، SMA20/50، VWAP لنگر، گره‌های حجمی، قیمت عرضهٔ اولیه).\n- **چندافقی:** درون‌روز (VWAP و کندل‌های ۵ دقیقه‌ای `intraday_today`)، و روند روزانه، هفتگی و یک‌ساله از بلوک `trend` (بخش ۴-۱-ب).\n\n**آنچه آزمون ۱۳ ساله دربارهٔ نمودار نشان داد (مهم):**\n- سطوح و الگوهای کلاسیک **جهت را پیش‌بینی نکردند**: بسته‌شدن بالای آخرین سقف چرخشی، لمس حمایت و برگشت، شکست کف چرخشی و ساختار HH/HL، نسبت به گروه کمتر از ۱٫۵ واحد درصد لبه داشتند. «حمایت نگه داشت پس بخر» در دادهٔ ما کار نکرد.\n- آنچه جهت را پیش‌بینی کرد **رفتار قیمت در انتهای جلسه و جریان پول** بود (جدول زیر).\n- پس از نمودار برای **اجرا** استفاده کن: ورود نزدیک حمایت یا VWAP، حد ضرر زیر ساختار، هدف در مقاومت بعدی؛ نه برای تعیین جهت.\n\nدرصد موقعیت‌هایی که سهم در ۵ روز از شاخص گروه جلو زد (۱۳۹۲ تا ۱۴۰۵؛ نرخ پایه ۴۷٪)، و پایداری در ۵ دورهٔ بازار:\n\n| سیگنال | موفقیت ۵ روزه | لبه | در چند دوره از ۵ دوره هم‌جهت بود |\n|---|---|---|---|\n| پول هوشمند حقیقی (سرانهٔ خرید > ۲ برابر معمول و قدرت خریدار > ۱٫۵) | ۶۱٪ | +۱۴ | ۵ از ۵ |\n| بسته‌شدن در صف خرید | ۶۰٪ | +۱۲ | ۵ از ۵ |\n| قدرت خریدار حقیقی > ۲ | ۵۹٪ | +۱۲ | ۵ از ۵ |\n| بالای باند بالای Bollinger | ۵۳٪ | +۵ | ۵ از ۵ |\n| شکست سقف ۲۰ روزه | ۵۲٪ | +۵ | ۵ از ۵ |\n| تقاطع MACD رو به بالا | ۵۱٪ | +۴ | ۴ از ۵ |\n| شکست کف ۲۰ روزه | ۴۶٪ | −۱ | ۲ از ۵ (ناپایدار؛ حذف شد) |\n| RSI < ۳۰ (سیگنال خرید نیست) | ۴۲٪ | −۵ | ۵ از ۵ |\n| قدرت خریدار < ۰٫۵ | ۴۲٪ | −۵ | ۵ از ۵ |\n| ضعف انتهای جلسه (آخرین ۱٪ زیر پایانی) | ۳۶٪ | −۱۲ | ۵ از ۵ |\n| بسته‌شدن در صف فروش | ۳۵٪ | −۱۳ | ۵ از ۵ |\n\n#### ۴-۱-ب. روند چندافقی (Trend)\nاز بلوک `trend` بخوان و در برگه **همیشه** بنویس:\n- `trend.daily`: روند روزانه؛ صعودی یعنی قیمت > SMA20 > SMA50 > SMA100.\n- `trend.weekly`: روند هفتگی از هفته‌های کامل‌شده؛ صعودی یعنی بستهٔ هفتگی > میانگین ۱۰ هفته > میانگین ۳۰ هفته، و میانگین ۱۰ هفته رو به بالا.\n- `trend.weekly_structure`: سقف و کف ۴ هفتهٔ اخیر در برابر ۴ هفتهٔ قبل (HH/HL یا LH/LL).\n- `trend.yearly`: روند یک‌ساله؛ صعودی یعنی قیمت بالای SMA200 و SMA200 رو به بالا. `position_in_52w_range` جای قیمت در دامنهٔ ۵۲ هفته است.\n- `trend.alignment`: هم‌راستایی سه افق.\n- `trend.channel60`: کانال رگرسیونی ۶۰ روزه، نزدیک‌ترین معادل عددی خط روند. شامل شیب، R²، فاصلهٔ امروز از کانال دیروز بر حسب انحراف معیار، و خط بالا و پایین کانال.\n\n**آنچه آزمون ۱۳ ساله دربارهٔ روند نشان داد** (۱۳۹۲ تا ۱۴۰۵، ۵۷ سهم با دست‌کم یک سال سابقه، حدود ۶۶ هزار روز-سهم قابل معامله). «لبه» یعنی فاصلهٔ احتمال رشد از میانگین همهٔ سهم‌های گروه در **همان روز**، به واحد درصد؛ یعنی اثر جهت کل بازار از آن حذف شده است:\n\n| وضعیت روند | n | لبهٔ ۵ روزه | لبهٔ ۲۰ روزه |\n|---|---|---|---|\n| روند روزانه صعودی | ۱۷٬۷۹۹ | +۰٫۱ | +۱٫۴ |\n| روند روزانه نزولی | ۹٬۶۱۸ | −۰٫۸ | −۰٫۸ |\n| روند هفتگی صعودی | ۲۴٬۵۰۹ | +۰٫۴ | +۱٫۰ |\n| روند هفتگی نزولی | ۱۲٬۱۱۷ | −۰٫۸ | +۰٫۱ |\n| روند یک‌ساله صعودی | ۳۹٬۸۴۷ | +۰٫۹ | +۱٫۶ (هم‌جهت در ۵ از ۵ دوره) |\n| روند یک‌ساله نزولی | ۱۴٬۳۰۴ | −۱٫۶ | −۰٫۹ |\n| هر سه افق صعودی | ۱۴٬۳۰۶ | +۰٫۲ | +۱٫۹ |\n| هر سه افق نزولی | ۴٬۶۳۶ | −۱٫۸ | −۰٫۲ |\n| کانال صعودی تمیز (شیب ۶۰ روزه > ۱۰٪، R² > ۰٫۶) | ۱۷٬۵۹۰ | +۰٫۴ | +۱٫۷ |\n| شکست خط روند صعودی (بسته‌شدن زیر کف کانال) | ۵۹۷ | +۲٫۸ | −۱٫۴ |\n| شکست خط روند نزولی (بسته‌شدن بالای سقف کانال) | ۳۰۱ | +۰٫۸ | −۲٫۳ |\n| نزدیک سقف ۵۲ هفته | ۱۰٬۱۲۷ | −۰٫۲ | +۱٫۶ |\n\nجمع‌بندی: روند به‌تنهایی حداکثر ۱ تا ۲ واحد درصد لبه دارد. شکست خط روند و کانال هم جهت بعدی را پیش‌بینی نکرد: بعد از شکست خط روند صعودی، سهم معمولاً افت بیشتری نکرد. در walk-forward، افزودن هم‌راستایی سه افق به جدول امتیاز × رژیم دقت را بهتر نکرد (AUC ۵ روزه ۰٫۵۳۷ در برابر ۰٫۵۳۵).\n\n**تنها جایی که روند واقعاً اثر دارد: تأیید سیگنال فروش**\n\n| وضعیت | n | احتمال رشد ۵ روزه | لبهٔ ۵ روزه | لبهٔ ۲۰ روزه |\n|---|---|---|---|---|\n| امتیاز ۴− و کمتر + روند هفتگی نزولی | ۱٬۱۰۹ | ۳۲٪ | −۱۳ (در ۵ از ۵ دوره بین −۱۲ و −۱۷) | −۱۰ (۴ از ۵ دوره) |\n| امتیاز ۴− و کمتر بدون روند هفتگی نزولی | ۷۰۰ | ۳۵٪ | −۹ | −۱ (ناپایدار) |\n| امتیاز ۲+ و بیشتر + روند هفتگی صعودی | ۳٬۷۸۸ | ۵۷٪ | +۴ | +۴ |\n| امتیاز ۲+ و بیشتر در روند هفتگی نزولی | ۱٬۳۸۶ | ۵۷٪ | +۶ | +۴ |\n| پولبک در روند هفتگی صعودی (RSI < ۴۰) | ۵۵۰ | ۵۲٪ | +۵ (ناپایدار: از ۰ تا +۱۰ در دوره‌ها) | +۷ |\n\n**قواعد استفاده از روند:**\n1. روند **امتیاز ندارد** و به‌تنهایی ناحیه یا تصمیم را عوض نمی‌کند.\n2. **ناحیهٔ ۴− و کمتر همراه با `trend.weekly = down`:** اطمینان فروش را یک پله بالا ببر. افق فروش می‌تواند تا ۲۰ روز باشد، یعنی خروج کامل، نه فقط سبک کردن.\n3. **ناحیهٔ ۴− و کمتر بدون روند هفتگی نزولی:** سیگنال فقط برای ۱ تا ۵ روز معتبر است. پیشنهاد «سبک کن، در ضعف بعدی نخر» بده، نه خروج بلندمدت.\n4. **خرید را به‌خاطر روند نزولی وتو نکن.** سیگنال خرید در روند هفتگی نزولی همان‌قدر کار کرد که در روند صعودی. «خلاف روند نخر» در این گروه پشتوانهٔ داده‌ای ندارد.\n5. خط روند و کانال را برای **حد ضرر و هدف** به کار ببر، نه جهت. در کانال صعودی تمیز، `lower_line_today` حد ضرر منطقی است و `upper_line_today` هدف.\n6. پولبک در روند صعودی فقط یک نکتهٔ ضعیف در بخش «چرا» است و احتمال را عوض نمی‌کند.\n7. **افق بیش از ۵ روز:** امتیاز v2 در افق ۲۰ روزه پیش‌بینی‌کننده نبود (AUC walk-forward ۰٫۴۹)؛ روند یک‌ساله هم فقط حدود +۲ واحد لبه دارد. برای نظر ۲۰ روزه یا بیشتر به رژیم، کدال و بنیادی تکیه کن و اطمینان را «پایین» بنویس.\n8. در سهم تازه‌عرضه، `trend.*` مقدار `unknown_short_history` دارد؛ به‌جای آن از دفترچهٔ IPO استفاده کن.\n9. روند درون‌روز (کندل ۵ دقیقه‌ای و VWAP) فقط برای زمان ورود و خروج است. این بخش در ۱۳ سال آزمون نشد؛ دادهٔ درون‌روز فقط برای ۸ نماد در ۱۴۰۳ موجود بود.\n\n#### ۴-۱-ج. جعبه‌ابزار تکنیکال و رسم نمودار (نسخهٔ ۲٫۳)\nداده‌ها در بلوک `technical` است.\n- **برای رسم:** `ohlc_daily` (۳۲۰ جلسه؛ در متن پنل ۱۵۰ جلسهٔ آخر) و `ohlc_weekly` (۱۰۴ هفته؛ در متن پنل ۵۲ هفته).\n- **فیبوناچی:** `fibonacci` شامل نوسان، سطوح اصلاحی ۲۳٫۶ تا ۷۸٫۶٪، سطوح گسترشی ۱۲۷٫۲، ۱۶۱٫۸ و ۲۰۰٪، اصلاح فعلی و نزدیک‌ترین سطح.\n- **پیوت:** `pivots.next_session_daily` برای جلسهٔ بعد و `weekly_from_last_completed_week`.\n- **اندیکاتورها:** `ichimoku`، `stochastic`، `bollinger` و `macd`.\n- **واگرایی و الگوها:** `rsi_divergence`، `candles_today`، `chart_patterns` (با `status`، `neckline` و `measured_target`) و `swings_recent`.\n- **سیگنال‌های امروز:** `signals_today`، هرکدام با n، لبهٔ ۵ و ۲۰ روزه و پایداری در ۵ دوره.\n\n**آنچه آزمون ۱۳ ساله دربارهٔ ابزارهای کلاسیک نشان داد** (۱۳۹۲ تا ۱۴۰۵، گروه ۴۴، حدود ۶۶ هزار روز-سهم).\n- **لبه:** فاصلهٔ احتمال رشد از میانگین همهٔ سهم‌های گروه در همان روز، به واحد درصد.\n- **مقایسه:** سیگنال‌های واقعاً مؤثر در این بازار ±۱۲ تا ±۱۴ واحد لبه داشتند: پول هوشمند حقیقی، صف خرید و فروش، و ضعف انتهای جلسه.\n\n| ابزار و سیگنال | n | لبهٔ ۵ روزه | لبهٔ ۲۰ روزه | هم‌جهت در دوره‌ها |\n|---|---|---|---|---|\n| فیبوناچی: پولبک روند صعودی به ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪ | ۹٬۶۳۱ | +۱٫۱ | −۰٫۱ | ۳ از ۵ |\n| فیبوناچی: برگشت از همین ناحیه (روز مثبت) | ۳٬۷۱۲ | +۲٫۰ | −۰٫۹ | ۴ از ۵ |\n| فیبوناچی: شکست ۶۱٫۸٪ در پولبک | ۴۴۹ | +۵٫۳ | +۱٫۵ | ۴ از ۵ |\n| فیبوناچی: برگشت از مقاومت ۳۸٫۲ تا ۶۱٫۸٪ در روند نزولی | ۲٬۰۱۲ | −۰٫۵ | −۰٫۴ | ۳ از ۵ |\n| پیوت روزانه: بسته‌شدن بالای R1 / زیر S1 | ۱۱٬۷۶۳ / ۱۰٬۸۸۴ | −۱٫۴ / +۱٫۸ | −۲٫۷ / +۰٫۶ | ۳ و ۴ از ۵ |\n| پیوت روزانه: برگشت از R1 / برگشت از S1 | ۲۱٬۴۳۵ / ۲۵٬۰۹۷ | +۲٫۱ / −۱٫۹ | +۲٫۳ / −۰٫۳ | ۴ از ۵ |\n| ایچیموکو: قیمت بالای ابر / زیر ابر | ۳۳٬۱۷۴ / ۲۳٬۷۳۸ | +۰٫۳ / +۰٫۲ | +۰٫۶ / +۰٫۴ | ۵ و ۳ از ۵ |\n| ایچیموکو: تقاطع تنکان و کیجون رو به بالا، بالای ابر | ۶۲۹ | +۲٫۶ | +۲٫۱ | ۴ از ۵ |\n| ایچیموکو: خروج از ابر رو به پایین | ۱٬۱۰۲ | +۴٫۳ | +۲٫۵ | ۴ از ۵ |\n| Stochastic: تقاطع رو به بالا زیر ۲۰ / رو به پایین بالای ۸۰ | ۳٬۴۳۸ / ۴٬۲۵۶ | +۲٫۱ / −۱٫۷ | −۰٫۳ / −۰٫۳ | ۴ و ۵ از ۵ |\n| واگرایی مثبت / منفی RSI | ۳۸۶ / ۶۰۷ | −۰٫۶ / −۰٫۱ | −۵٫۶ / +۲٫۳ | ۳ از ۵ |\n| کندل: دوجی / چکش / ستارهٔ دنباله‌دار | ۱۰٬۴۵۸ / ۱٬۱۵۰ / ۱٬۴۰۸ | +۰٫۶ / +۰٫۳ / −۰٫۴ | ۰٫۰ / −۱٫۱ / +۱٫۸ | ۳ تا ۴ از ۵ |\n| کندل: پوشای صعودی / پوشای نزولی | ۷۶۲ / ۱٬۰۲۲ | +۱٫۸ / +۰٫۱ | ۰٫۰ / −۰٫۷ | ۳ و ۲ از ۵ |\n| کندل: ستارهٔ صبحگاهی / شامگاهی | ۴۱۳ / ۴۱۱ | −۲٫۱ / +۲٫۱ | −۰٫۴ / −۱٫۲ | ۴ از ۵ |\n| سقف دوقلو / کف دوقلو (شکست خط گردن) | ۴۴ / ۵۷ | +۷٫۱ / +۱٫۰ | −۱٫۲ / −۶٫۸ | نمونهٔ کم |\n| سر و شانه / سر و شانهٔ معکوس (شکست خط گردن) | ۱۴۴ / ۹۱ | +۳٫۴ / +۵٫۳ | −۱٫۴ / −۰٫۵ | نمونهٔ کم |\n| مثلث: شکست رو به بالا / رو به پایین | ۶۱۳ / ۷۶۶ | +۰٫۹ / +۲٫۴ | −۲٫۵ / +۰٫۷ | ۳ و ۴ از ۵ |\n\n- **فیبوناچی خاص نبود.** برخورد و نگه‌داشتن سطوح ۳۸٫۲، ۵۰ و ۶۱٫۸٪ با سطوح دلخواه ۳۰، ۴۵، ۵۶ و ۷۰٪ مقایسه شد و فرقی نداشت:\n  - **در روند صعودی:** لبهٔ سطوح فیبوناچی −۰٫۸ و لبهٔ سطوح دلخواه −۱٫۵ بود.\n  - **در روند نزولی:** لبهٔ سطوح فیبوناچی +۱٫۵ و لبهٔ سطوح دلخواه +۰٫۷ بود.\n- **الگوهای نزولی کلاسیک در این بازار افت بعدی نیاوردند.** در سر و شانه، سقف دوقلو، خروج از ابر ایچیموکو رو به پایین و شکست ۶۱٫۸٪ فیبوناچی، لبه صفر یا مثبت بود. دامنهٔ نوسان و صف‌ها بازار را کوتاه‌مدت برگشتی می‌کنند.\n\n**قواعد استفاده:**\n1. هیچ ابزار کلاسیکی **امتیاز ندارد** و ناحیه یا تصمیم را عوض نمی‌کند. جهت از امتیاز v2، جریان پول، رژیم، کدال و دفترچهٔ IPO می‌آید.\n2. هر سیگنال `signals_today` را با لبهٔ آزموده‌اش گزارش کن. اگر لبهٔ ۵ روزه بین −۳ و +۳ است، بنویس «در آزمون بی‌اثر».\n3. **فقط به‌خاطر الگوی نزولی کلاسیک توصیهٔ فروش نده.** این الگوها عبارت‌اند از: سر و شانه، سقف دوقلو، خروج از ابر رو به پایین، شکست خط روند و تقاطع نزولی Stochastic.\n4. **کاربرد درست ابزارها سطح‌گذاری است:**\n   - **ناحیهٔ ورود پولبک:** ۳۸٫۲ تا ۶۱٫۸٪ فیبوناچی یا نزدیک VWAP و حمایت.\n   - **حد ضرر:** زیر نزدیک‌ترین ساختار؛ یعنی کف چرخشی، حمایت، یا ۶۱٫۸ و ۷۸٫۶٪ فیبوناچی، هرکدام نزدیک‌تر است. فاصلهٔ حد ضرر حداکثر ۸٪ یا ۱٫۵×ATR باشد.\n   - **هدف:** مقاومت بعدی، گسترش ۱۲۷٫۲ یا ۱۶۱٫۸٪، یا هدف اندازه‌گیری‌شدهٔ الگو.\n   - **زمان‌بندی درون‌جلسه:** P، R1 و S1 پیوت جلسهٔ بعد.\n5. هدف الگو را «هدف مرجع» بنویس، نه احتمال.\n6. کندل‌ها با قیمت پایانی (میانگین وزنی) ساخته شده‌اند و دامنهٔ ±۳٪ بدنه‌ها را کوتاه می‌کند. الگوی کندلی تک‌روزه را فقط گزارش کن.\n\n**رسم نمودار (الزامی در هر برگه):**\n- **اگر ابزار رسم داری** (artifact، HTML/SVG یا کد رسم تصویر)، یک نمودار شمعی روزانه از ۱۲۰ جلسهٔ آخر `technical.ohlc_daily` بکش. محور زمان شمسی باشد، برچسب‌ها فارسی باشند و هر خط برچسب قیمت داشته باشد. لایه‌ها:\n  - **کندل:** سبز اگر پایانی ≥ بازگشایی، قرمز در غیر این صورت.\n  - **میانگین‌ها:** SMA20 و SMA50، و SMA200 اگر داده کافی است.\n  - **فیبوناچی:** سطوح `technical.fibonacci` از نقطهٔ شروع نوسان تا امروز، با ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪ سایه‌دار و خط نوسان.\n  - **حمایت و مقاومت:** نزدیک‌ترین حمایت و مقاومت (`chart.nearest_support` و `chart.nearest_resistance`).\n  - **الگوها:** الگوهای `chart_patterns` با خط گردن و هدف.\n  - **واگرایی:** `rsi_divergence`، هم روی قیمت و هم روی RSI.\n  - **برنامهٔ این برگه:** ورود یا ماشه، حد ضرر و هدف، با رنگ متمایز.\n  - **پنل‌های زیرین:** حجم و RSI۱۴ (خطوط ۳۰ و ۷۰).\n  - **فقط اگر در تصمیم نقش دارند:** ابر ایچیموکو، Bollinger، پیوت و MACD؛ تا نمودار شلوغ نشود.\n  - **فلش سناریو:** یک فلش برای سناریوی اصلی «اگر… آن‌گاه…».\n- **نمودار هفتگی:** اگر روند هفتگی در تصمیم نقش دارد (قاعدهٔ ۴-۱-ب)، یک نمودار هفتگی کوچک از `ohlc_weekly` هم بکش.\n- **اگر ابزار رسم نداری:** بنویس «نمودار رسم نشد» و جدول سطوح را بده. از کاربر بخواه تصویر نمودار پنل را بچسباند (دکمهٔ «کپی تصویر» در بخش «نمودار تکنیکال»).\n- **اگر کاربر تصویر نمودار فرستاد:** آن را بخوان و با JSON تطبیق بده. اعداد را از JSON بردار، نه از تصویر.\n\n#### ۴-۲. جریان پول حقیقی/حقوقی\nاز `flows` بخوان. در سهم تازه‌عرضه `buyer_power_reliable = false` است: قدرت خریدار و سرانه‌ها را تفسیر نکن (سهمیهٔ کوچک عرضهٔ اولیه آن‌ها را منحرف می‌کند). جریان پول گروه را از `indiv_net_flow_pct_of_value_ex_self` بخوان؛ این عدد **بدون خود نماد** است. در اجرای نسخهٔ ۱ روی تابان، نیمی از «خروج پول گروه» خود تابان بود و دوبار شمرده شد.\n\n#### ۴-۳. سهامداران عمده (فقط زمینه، بدون امتیاز)\nبازارگردان‌ها در روزهای منفی می‌خرند و خریدشان سیگنال صعود نیست. خرید و فروش سهامداران راهبردی در ۱۴۰۳ و ۱۴۰۴ نسبت به گروه لبهٔ معنادار نداشت و هیچ سهامداری بعد از اصلاح خطای چندآزمونی به «۹۰٪ موفقیت» نرسید. اگر سابقهٔ یک سهامدار را می‌گویی، نرخ را با (موفق+۵)/(کل+۱۰) کوچک کن.\n\n#### ۴-۴. کدال\nنوع، زمان انتشار (قبل یا بعد از ۱۲:۳۰)، محتوا، و اینکه خبر مخصوص شرکت است یا کل گروه. اثر تاریخی (بازده غیرعادی نسبت به شاخص ۴۴، روز انتشار تا ۵ روز بعد):\n\n| نوع اطلاعیه | اثر ۵ روزه (دی ۱۴۰۲ تا اسفند ۱۴۰۳) | اثر ۵ روزه (۱۴۰۴ تا شهریور) | تفسیر برای عامل |\n|---|---|---|---|\n| تصمیمات مجمع عادی سالیانه | −۱٫۰٪ (بعد از روز انتشار −۱٫۸٪) | −۲٫۸٪ | افت بعد از مجمع تکرارشونده است؛ −۱ تا ۵ روز |\n| تغییر مدیرعامل/هیئت‌مدیره | −۱٫۰٪ | −۱٫۳٪ | منفی ملایم؛ −۱ (اگر فقط ثبت دوبارهٔ نمایندگان است: ۰) |\n| توقف تولید/تعمیرات/قطع گاز | −۰٫۸٪ | −۲٫۴٪ | منفی؛ −۱ |\n| شفاف‌سازی شایعه | −۱٫۷٪ | +۱٫۶٪ (نمونهٔ کم) | متن را بخوان؛ پیش‌فرض −۱ |\n| آرای دیوان عدالت/شورای رقابت | +۴٫۰٪ | نمونه ناکافی | رویداد **گروهی**؛ جهت از متن؛ ±۱ |\n| نرخ سرویس‌های جانبی | +۳٫۹٪ | −۲٫۰٪ | جهت به محتوا بستگی دارد |\n| بازگشایی بعد از تعلیق اطلاعاتی | +۶٫۰٪ | +۱٫۲٪ | نوسان شدید؛ موقعیت B |\n| گزارش ماهانه | ≈۰ | ≈۰ | فقط غافلگیری فروش نسبت به گروه مهم است |\n| صورت‌های مالی میاندوره‌ای | +۰٫۳٪ | −۱٫۰٪ | فقط در مقایسه با انتظار |\n| مراحل افزایش سرمایه | +۱٫۵٪ | +۰٫۶٪ | مثبت ملایم؛ +۱ |\n| اطلاعیه‌های حاکمیتی (گروه کنترل) | −۰٫۴٪ | −۰٫۳٪ | بی‌اثر |\n\n> این جدول هنوز فقط ۲۱ ماه را پوشش می‌دهد. گسترش آن به سال‌های قبل در این مرحله ممکن نشد، چون جست‌وجوی کدال درخواست‌های پشت‌سرهم را با خطای 429 رد می‌کند؛ در PoC با خزش آهستهٔ شبانه تکمیل می‌شود. پس اطمینان به ردیف‌های کدال کمتر از ردیف‌های قیمت و جریان پول است.\n\n- **گزارش ماهانه:** رشد خام فروش اثر نداشت؛ **رشد نسبت به بقیهٔ گروه در همان ماه** اثر داشت. یک‌سوم پایینی: −۰٫۷٪ تا −۱٫۳٪ در ۵ روز → **−۱**. یک‌سوم بالایی: +۰٫۳ تا +۰٫۵٪ → **+۱ ضعیف**. اگر فروش همتایان را نداری، رشد مورد انتظار را «تغییر نرخ ارز صادراتی + تغییر قیمت جهانی محصول + اثر تعداد روزهای ماه» بگیر.\n- قبل از بسیاری از اطلاعیه‌های منفی، بازده ۵ روز قبل هم منفی بود (نشت اطلاعات)؛ بخشی از خبر زودتر در قیمت است.\n- اخبار گروهی (نرخ گاز، سرویس‌ها، دیوان، قطعی گاز، نرخ ارز صادراتی) را از `sector_regulatory_10d` بخوان.\n\n**پالایشی‌ها (گروه ۲۳، نسخهٔ ۲٫۴):** جدول بالا از گروه ۴۴ است. برای ۱۱ پالایشی، اثر اطلاعیه‌ها روی جلسهٔ بعد جدا آزموده شد: حدود ۸٬۴۰۰ اطلاعیه از فهرست کدال tsetmc، ۱۳۹۲ تا ۱۴۰۵. «اختلاف» یعنی درصد رشد واقعی جلسهٔ بعد منهای احتمال جدول. هر عدد در دو نیمهٔ دوره (۱۳۹۲ تا ۱۳۹۸ و ۱۳۹۹ تا ۱۴۰۵) جدا هم حساب شد:\n\n| اطلاعیه (زمان انتشار) | n | اختلاف | دو نیمه | امتیاز برای پالایشی‌ها |\n|---|---|---|---|---|\n| افزایش سرمایه، پیشنهاد یا مرحله یا مجمع فوق‌العاده (بعد از جلسه) | ۲۶۷ | +۱۰ واحد | +۱۵ و +۸ | **+۱** (در `next_session` خودکار) |\n| صورت مالی میاندوره‌ای (حین جلسه) | ۵۵۹ | −۵ واحد | −۳ و −۶ | **−۱** (در `next_session` خودکار) |\n| تصمیمات مجمع عادی (بعد از جلسه) | ۱۲۸ | +۶ واحد | +۱۷ و −۴ | ۰ (ناپایدار؛ برخلاف گروه ۴۴، منفی نیست) |\n| شفاف‌سازی شایعه و «افشای با اهمیت» (بعد از جلسه) | ۶۵ و ۱۴۲ | +۷ و +۱۰ واحد | فقط در نیمهٔ دوم مثبت | ۰؛ متن را بخوان |\n| تغییر مدیرعامل یا هیئت‌مدیره | ۲۱۳ | −۱ واحد | — | ۰ |\n| گزارش ماهانه | ۱٬۰۴۰ | −۱ واحد | +۲ و −۲ | ۰ (مگر غافلگیری نسبت به همتایان) |\n\nبرای پالایشی‌ها امتیاز کدالِ گام ۵ را از این جدول بگیر، نه از جدول گروه ۴۴. ردیف‌های افزایش سرمایه و صورت مالی میاندوره‌ای در `next_session.points` حساب شده‌اند؛ دوباره اضافه نکن.\n\n#### ۴-۵. بنیادی سریع و هلدینگ‌ها (فقط زمینه)\nP/E در برابر گروه، EPS، حساسیت به نرخ ارز و گاز، زمان مجمع بعدی. برای هلدینگ‌ها (فارس، پترول، تاپیکو، وپترو، شیران، پارسان، تابان) P/NAV را از آخرین «صورت وضعیت پورتفوی» در کدال حساب کن و با **سابقهٔ خود همان هلدینگ** مقایسه کن. تخفیف ۳۰ تا ۴۰ درصدی به NAV در بازار ایران عادی است و به‌تنهایی دلیل خرید نیست.\n\n#### ۴-۶. دفترچهٔ عرضهٔ اولیه (IPO) — جدید\nبر اساس **۱۹۲ عرضهٔ اولیهٔ ۱۳۹۶ تا ۱۴۰۵** (کل بازار):\n\n| مرحله (`ipo.phase`) | احتمال رشد روز بعد | ۵ روز | ۲۰ روز | میانهٔ ۲۰ روز |\n|---|---|---|---|---|\n| بعد از اولین روز بدون صف (`first_open_days`) | ۲۹٪ | ۳۸٪ | ۴۴٪ | −۳٫۸٪ |\n| بعد از اولین روز منفی (`after_first_down_day`) | ۲۳٪ | ۳۳٪ | ۴۲٪ | −۶٫۱٪ |\n| همان، وقتی صف اولیه ۸ روز یا بیشتر بود | ۲۰٪ | ۳۱٪ | ۳۹٪ | −۱۰٫۲٪ |\n| همان، وقتی حقوقی (بازارگردان) بیش از ۲۰٪ ارزش معاملات را خالص خرید | ۲۴٪ | ۳۱٪ | ۴۷٪ | −۱٫۷٪ |\n| ۶۰ روز بعد از اولین روز بدون صف | — | — | ۵۳٪ مثبت | +۳٫۴٪ |\n\nاین الگو در هر ۴ دورهٔ بازار تکرار شد (رشد روز بعد از اولین روز منفی: ۲۳٪، ۱۰٪، ۳۱٪ و ۳۰٪).\n\nقواعد IPO:\n- در این مرحله جدول رژیم گام ۶ را به کار نبر؛ احتمال‌ها را از همین جدول بده.\n- **خرید بازارگردان احتمال را عوض نکرد.** حمایت او افت را کُند می‌کند، نه برعکس.\n- «نخر» در این مرحله، لبهٔ منفی واقعی دارد، ولی حدود ۱ روز از ۴ تا ۵ روز، روز بعد مثبت است. این را صریح بنویس تا روز مثبت، «شکست تحلیل» خوانده نشود.\n- برای خریدار: صبر تا دست‌کم ۲۰ روز بعد از اولین روز بدون صف، یا نزدیک کف اولین روز بدون صف (`first_open_day_low`) همراه با برگشت خالص پول حقیقی.\n- برای دارنده: فروش تدریجی در روزهای قوی و بالای VWAP، نه در صف فروش و نه در بازگشایی بعد از روز ضعیف.\n\n### گام ۵ — امتیازدهی (v2، برآورد روی ۱۳ سال)\nامتیازها در `rubric.points` محاسبه شده‌اند. کدال را اضافه کن:\n\n| مؤلفه | امتیاز |\n|---|---|\n| پول هوشمند حقیقی | +۲ |\n| قدرت خریدار > ۲ (اگر ردیف قبل فعال نیست) | +۱ |\n| قدرت خریدار < ۰٫۵ | −۱ |\n| بسته‌شدن در صف خرید | +۲ |\n| بسته‌شدن در صف فروش | −۲ |\n| آخرین قیمت بیش از ۱٪ بالای قیمت پایانی | +۲ |\n| آخرین قیمت بیش از ۱٪ زیر قیمت پایانی | −۲ |\n| RSI < ۳۰ | −۲ |\n| بالای باند بالای Bollinger | +۱ |\n| کدال: تصمیمات مجمع، تغییر مدیرعامل، توقف تولید، شفاف‌سازی شایعه (۵ روز اخیر) | −۱ هرکدام |\n| کدال: مراحل افزایش سرمایه | +۱ |\n| کدال: غافلگیری فروش ماهانه نسبت به گروه | −۱ / +۱ ضعیف |\n| کدال/کلان: خبر گروهی مهم | ±۱ با قضاوت و متن اطلاعیه |\n| تعدیل قضاوتی (با دلیل داده‌ای) | حداکثر ±۱ و بدون حق تغییر ناحیه |\n\nردیف‌های `rubric.context` (خروج/ورود پول ۵ روزه، کف و سقف ۲۰ روزه، ADX، جریان پول گروه، سهامداران) **امتیاز ندارند** و فقط در متن تحلیل می‌آیند. ردیف‌های کدال در بک‌تست ۱۳ ساله نبودند؛ اگر فقط به‌خاطر آن‌ها ناحیه عوض شد، اطمینان را یک پله کم کن.\n\n### گام ۶ — احتمال، لبه و تصمیم (فقط موقعیت D)\nاز `rubric.calibration_for_this_band` و `rubric.base_rate_this_regime` بخوان (پس از افزودن امتیاز کدال، ناحیه را دوباره از جدول زیر پیدا کن). **لبه** = احتمال رشد ۵ روزهٔ ناحیه منهای نرخ پایهٔ همان رژیم.\n\nاحتمال بالا رفتن قیمت (ورود با قیمت پایانی روز بعد، روزهای صف حذف شده؛ ۱۳۹۲ تا ۱۴۰۵):\n\n| رژیم | ناحیهٔ امتیاز | n | ۱ روز | ۳ روز | ۵ روز | ۱۰ روز | میانهٔ ۵ روز |\n|---|---|---|---|---|---|---|---|\n| داغ | ۴− و کمتر | ۳۰ | ۱۰٪ | ۲۳٪ | ۲۰٪ | ۲۷٪ | −۳٫۳٪ |\n| داغ | ۳− تا ۲− | ۲٬۵۷۵ | ۲۵٪ | ۵۲٪ | ۵۵٪ | ۵۸٪ | +۰٫۸٪ |\n| داغ | ۱− تا ۱+ | ۹٬۳۹۸ | ۵۱٪ | ۵۴٪ | ۵۷٪ | ۶۱٪ | +۱٫۰٪ |\n| داغ | ۲+ تا ۳+ | ۲٬۳۳۲ | ۷۶٪ | ۵۶٪ | ۵۷٪ | ۶۰٪ | +۱٫۱٪ |\n| داغ | ۴+ و بیشتر | ۱۴۱ | ۸۷٪ | ۷۲٪ | ۷۴٪ | ۷۸٪ | +۴٫۴٪ |\n| داغ | نرخ پایه | ۱۴٬۴۷۶ | ۵۰٪ | ۵۴٪ | ۵۷٪ | ۶۱٪ | +۱٫۰٪ |\n| عادی | ۴− و کمتر | ۱٬۳۱۳ | ۱۱٪ | ۲۶٪ | ۳۱٪ | ۴۰٪ | −۰٫۶٪ |\n| عادی | ۳− تا ۲− | ۹٬۷۷۱ | ۲۳٪ | ۳۸٪ | ۴۱٪ | ۴۵٪ | −۰٫۵٪ |\n| عادی | ۱− تا ۱+ | ۲۹٬۶۰۱ | ۴۴٪ | ۴۶٪ | ۴۸٪ | ۵۰٪ | −۰٫۱٪ |\n| عادی | ۲+ تا ۳+ | ۵٬۷۲۶ | ۷۳٪ | ۵۴٪ | ۵۴٪ | ۵۴٪ | +۰٫۳٪ |\n| عادی | ۴+ و بیشتر | ۴۴۱ | ۸۱٪ | ۶۰٪ | ۵۸٪ | ۵۸٪ | +۰٫۵٪ |\n| عادی | نرخ پایه | ۴۶٬۸۵۲ | ۴۳٪ | ۴۵٪ | ۴۷٪ | ۴۹٪ | −۰٫۲٪ |\n| سرد | ۴− و کمتر | ۵۳۵ | ۱۸٪ | ۳۶٪ | ۳۸٪ | ۴۶٪ | −۰٫۶٪ |\n| سرد | ۳− تا ۲− | ۲٬۷۸۹ | ۳۱٪ | ۴۲٪ | ۴۳٪ | ۴۸٪ | −۰٫۵٪ |\n| سرد | ۱− تا ۱+ | ۵٬۴۹۷ | ۴۹٪ | ۴۶٪ | ۴۷٪ | ۴۹٪ | −۰٫۲٪ |\n| سرد | ۲+ تا ۳+ | ۱٬۱۷۷ | ۷۶٪ | ۴۹٪ | ۵۰٪ | ۴۹٪ | ۰٫۰٪ |\n| سرد | ۴+ و بیشتر | ۶۵ | ۷۷٪ | ۶۲٪ | ۵۷٪ | ۵۴٪ | +۱٫۹٪ |\n| سرد | نرخ پایه | ۱۰٬۰۶۳ | ۴۵٪ | ۴۵٪ | ۴۶٪ | ۴۸٪ | −۰٫۳٪ |\n\nقواعد تصمیم:\n- **خرید:** لبهٔ ۵ روزه **+۸ واحد درصد یا بیشتر** و احتمال ۵ روزه ≥ ۵۵٪، و سهم در صف خرید نیست.\n- **فروش / کاهش:** لبهٔ ۵ روزه **−۸ واحد درصد یا کمتر** و احتمال ۵ روزه ≤ ۴۰٪، و سهم در صف فروش نیست.\n- **بقیه = «بدون لبه».** سهم جدید نخر؛ اگر داری، با حد ضرر نگه دار. اگر احتمال ۱ روزه خیلی پایین است (مثلاً ۲۵٪) ولی ۵ روزه خنثی است، بنویس «افت کوتاه‌مدت محتمل، ۵ روزه خنثی» و ماشهٔ خرید در افت را بده.\n- EV ۵ روزه را هم بنویس: میانهٔ ۵ روزهٔ جدول، و «متوسط سود در موارد مثبت / متوسط زیان در موارد منفی» از `calibration_for_this_band`.\n- رژیم عوض می‌شود: اگر شاخص ۴۴ نزدیک مرز ۱۰+٪ یا ۵−٪ در ۲۰ روز است، هر دو رژیم را گزارش کن.\n\n**کارنامهٔ walk-forward (۱۳۹۶ تا ۱۴۰۵، خارج از نمونه):** ناحیهٔ «۴− و کمتر» در ۱٬۰۴۲ مورد، ۶۴٪ درست گفت که قیمت در ۵ روز بالا نمی‌رود (نسخهٔ ۱: ۵۵٪ در ۹٬۴۵۲ مورد). نواحی خرید در ۷٬۷۷۹ مورد ۵۶٪ رشد داشتند در برابر نرخ پایهٔ ۵۰٪. AUC کلی حدود ۰٫۵۴ است: پیش‌بینی جهت ۵ روزه سخت است و ارزش عامل در موقعیت‌های افراطی، زمان‌بندی و مدیریت ریسک است.\n\n### گام ۶-ب — پیش‌بینی جلسهٔ بعد و قابلیت اجرا (نسخهٔ ۲٫۴)\nاز بلوک `next_session` بخوان. برای پالایشی‌ها (`applies = true`) پیش‌بینی جلسهٔ بعد همین است. برای گروه ۴۴ از `rubric.calibration_for_this_band.p_up_1d` استفاده کن و بنویس «بی‌حرکت برآورد نشده».\n\n**امتیاز جلسهٔ بعد (پالایشی‌ها):** وزن‌ها با رگرسیون لجستیک روی ۱۱ پالایشی (۱۳۹۲ تا ۱۴۰۵) برآورد و به عدد صحیح گرد شدند. در هر سه آزمون خارج از نمونه تقریباً ثابت ماندند.\n\n| ردیف | امتیاز | ردیف | امتیاز |\n|---|---|---|---|\n| پایان قوی (آخرین > پایانی بیش از ۱٪) | +۳ | پایان ضعیف | −۳ |\n| صف خرید | +۳ | صف فروش | −۲ |\n| صف خرید کم‌حجم (حجم < ۰٫۷ میانگین ۲۰ روز) | +۲ | صف فروش کم‌حجم | −۱ |\n| صف خرید روز سوم به بعد | +۱ | صف فروش روز سوم به بعد | −۱ |\n| پول هوشمند حقیقی | +۲ | قدرت خریدار < ۰٫۵ | −۱ |\n| بالای باند بالای Bollinger | +۱ | RSI < ۳۰ | −۱ |\n| نیمی از پالایشی‌های دیگر در صف خرید | +۱ | نیمی از پالایشی‌های دیگر در صف فروش | −۱ |\n| افت شاخص کل امروز بیش از ۱٪ | +۱ | حجم کمتر از نصف معمول | −۱ |\n| افت بیش از ۲٪ بدون صف فروش | +۱ | دامنهٔ نوسان ۶٪ یا بیشتر | −۱ |\n| اطلاعیهٔ افزایش سرمایه بعد از جلسه | +۱ | صورت مالی میاندوره‌ای امروز | −۱ |\n\n**جدول جلسهٔ بعد (۱۱ پالایشی، ۱۳۹۲ تا ۱۴۰۵، حدود ۲۹ هزار روز-نماد).** «از آخرین قیمت» یعنی اگر امروز با آخرین قیمت بخری (فقط روزهایی که صف خرید نبود):\n\n| ناحیه | n | بالا (>+۰٫۵٪) | بی‌حرکت | پایین (<−۰٫۵٪) | میانهٔ گپ فردا | صف خرید / فروش فردا | از آخرین قیمت تا پایانی فردا (میانه) | از آخرین قیمت تا ۵ جلسه بعد (میانه) | بالا در ۵ جلسه |\n|---|---|---|---|---|---|---|---|---|---|\n| ۶− و کمتر | ۱٬۶۲۱ | ۶٪ | ۳۹٪ | ۵۵٪ | −۳٫۰٪ | ۴٪ / ۵۵٪ | +۱٫۱٪ | +۰٫۳٪ | ۲۲٪ |\n| ۵− تا ۴− | ۳٬۳۱۸ | ۱۱٪ | ۳۸٪ | ۵۱٪ | −۱٫۷٪ | ۴٪ / ۱۸٪ | +۱٫۰٪ | +۰٫۶٪ | ۳۳٪ |\n| ۳− تا ۲− | ۴٬۷۹۵ | ۱۸٪ | ۳۶٪ | ۴۶٪ | −۰٫۶٪ | ۵٪ / ۱۲٪ | +۰٫۱٪ | ۰٫۰٪ | ۴۱٪ |\n| ۱− تا ۱+ | ۱۲٬۰۱۷ | ۳۴٪ | ۳۴٪ | ۳۳٪ | +۰٫۱٪ | ۸٪ / ۵٪ | ۰٫۰٪ | +۰٫۲٪ | ۵۱٪ |\n| ۲+ تا ۳+ | ۲٬۸۳۵ | ۵۶٪ | ۲۷٪ | ۱۷٪ | +۱٫۶٪ | ۱۷٪ / ۴٪ | −۰٫۴٪ | ۰٫۰٪ | ۶۲٪ |\n| ۴+ تا ۵+ | ۱٬۹۱۱ | ۶۹٪ | ۱۵٪ | ۱۶٪ | +۲٫۸٪ | ۳۵٪ / ۶٪ | −۰٫۳٪ | +۰٫۱٪ | ۶۸٪ |\n| ۶+ و بیشتر | ۲٬۶۶۲ | ۸۴٪ | ۹٪ | ۷٪ | +۳٫۰٪ | ۶۱٪ / ۳٪ | −۰٫۱٪ | +۱٫۱٪ | ۸۰٪ |\n\n**پیش‌بینی:** بالا اگر احتمال «بالا» ۵۰٪ یا بیشتر است (ناحیه‌های ۲+ به بالا). پایین اگر احتمال «پایین» ۴۵٪ یا بیشتر است (ناحیه‌های ۲− به پایین). بقیه «بدون پیش‌بینی جهت».\n\n**آزمون خارج از نمونه** (هر سال فقط با سال‌های قبل ساخته شد):\n\n| سال | روزهای دارای پیش‌بینی | درست | درست بدون بی‌حرکت‌ها | بی‌حرکت | خلاف جهت | علت خلاف جهت‌ها |\n|---|---|---|---|---|---|---|\n| ۱۴۰۳ | ۶۶٪ | ۵۲٪ | ۸۴٪ | ۳۸٪ | ۱۰٪ | شکستن صف ۴۴٪، حرکت کل بازار یا گروه ۳۵٪، خود سهم ۱۳٪ |\n| ۱۴۰۴ | ۷۰٪ | ۶۵٪ | ۸۱٪ | ۱۹٪ | ۱۵٪ | کل بازار یا گروه ۵۷٪، شکستن صف ۳۳٪ |\n| ۱۴۰۵ (تا مهر) | ۸۴٪ | ۸۰٪ | ۸۴٪ | ۶٪ | ۱۵٪ | کل بازار یا گروه ۵۹٪، شکستن صف ۳۸٪ |\n\nجدول نسخهٔ ۲٫۳ (گروه ۴۴) برای جهت جلسهٔ بعد پالایشی‌ها تقریباً همین‌قدر خوب بود (AUC ۰٫۷۷ تا ۰٫۸۰ در برابر ۰٫۷۷ تا ۰٫۷۹). فایدهٔ نسخهٔ ۲٫۴ در این‌هاست: حالت «بی‌حرکت»، روزهای بیشتری با پیش‌بینی، کدال مخصوص پالایشی‌ها، و اعداد اجرا.\n\n**قواعد:**\n1. در برگه سه احتمال را بنویس (بالا، بی‌حرکت، پایین)، نه فقط «بالا/پایین».\n2. **جهت با سود یکی نیست.** میانهٔ حرکت از آخرین قیمت امروز تا پایانی فردا در همهٔ ناحیه‌ها بین −۰٫۴٪ و +۱٫۱٪ است، کمتر از هزینهٔ ۱٫۲۵٪. در آزمون، «امروز با آخرین قیمت بخر، فردا بفروش» در همهٔ ناحیه‌ها به‌طور متوسط ۰٫۳ تا ۱٫۵٪ زیان داد و در هر سه سال ۱۴۰۳ تا ۱۴۰۵ هم زیان‌ده بود. «فردا بخر، پس‌فردا بفروش» هم حدود ۱٫۶ تا ۱٫۹٪ زیان داد. پس برای پالایشی‌ها **معاملهٔ یک‌روزه را پیشنهاد نده**. اگر کاربر خودش می‌خواهد، عدد زیان مورد انتظار را صریح بنویس.\n3. **افق چندروزه هم لبهٔ پایدار ندارد.** از آخرین قیمت تا ۵ جلسه بعد، میانه بین ۰ و +۱٫۱٪ است، یعنی بعد از هزینه نزدیک صفر. تصمیم «خرید» v2.3 برای پالایشی‌ها در آزمون بعد از هزینه در ۵ روز حدود +۰٫۳٪ و در یک روز حدود −۱٫۴٪ بود. برای پالایشی‌ها تصمیم پیش‌فرض «بدون لبهٔ معاملاتی» است. خرید یا فروش را فقط با دلیل بیرون از این جدول بده (مثل کدال، بنیادی یا خبر گروهی) و اطمینان را «پایین» بنویس.\n4. **ارزش واقعی پیش‌بینی، زمان‌بندی است** برای کسی که به هر دلیلی تصمیم خرید یا فروش دارد:\n   - **ناحیهٔ ۴− و کمتر:** فردا معمولاً با گپ منفی باز می‌شود و ۱۸ تا ۵۵٪ صف فروش است. دارنده در صف فروش فردا احتمالاً نمی‌تواند بفروشد. خریدار، آخرین قیمت امروز (میانهٔ فاصله تا پایانی فردا +۱٪) معمولاً از میانگین فردا ارزان‌تر است.\n   - **ناحیهٔ ۴+ و بیشتر:** فردا ۳۵ تا ۶۱٪ صف خرید است و خرید فردا اغلب ممکن نیست. فروشنده در صف خرید امروز تقریباً همان پایانی فردا را می‌گیرد (میانه −۰٫۱ تا −۰٫۳٪). ۵ جلسه بعد میانه +۱٪ بالاتر است.\n   - **گپ:** بعد از پیش‌بینی بالا، خرید در بازگشایی فردا یعنی خرید بعد از گپ +۱٫۶ تا +۳٪ (قاعدهٔ گام ۷ هم همین را می‌گوید).\n5. **پرچم‌های اطمینان** (`confidence_flags`)، هرکدام اطمینان را یک پله کم می‌کند:\n   - تعطیلی ۴ روز یا بیشتر تا جلسهٔ بعد: خلاف جهت ۲۰٪ در برابر ۱۳٪.\n   - تغییر دلار آزاد بیش از ۱٫۵٪ بعد از پایان جلسه: خلاف جهت ۱۹٪. این تغییر جهت را پیش‌بینی نکرد و فقط خطا را بیشتر کرد.\n   - دامنهٔ نوسان ±۲٪ یا کمتر: ۵۶٪ بی‌حرکت.\n6. **صف امروز، فردا** (۱۳۹۲ تا ۱۴۰۵):\n\n| امروز | فردا دوباره همان صف | فردا صف مخالف |\n|---|---|---|\n| صف خرید (کل) | ۵۲٪ (روز اول ۴۱٪، روز سوم به بعد ۷۲٪، روز پنجم به بعد ۷۸٪؛ کم‌حجم ۶۸٪، پرحجم ۴۱٪) | صف فروش ۴٪؛ با افت شبانهٔ دلار بیش از ۱٪، ۱۲٪ |\n| صف فروش (کل) | ۴۹٪ (روز اول ۳۹٪، روز سوم به بعد ۶۷٪؛ کم‌حجم ۵۶٪، پرحجم ۴۱٪) | صف خرید ۷٪؛ در ۱۴۰۳ تا ۱۴۰۵، ۱۲٪ |\n\n7. بیشتر خطاهای جهت از **حرکت کل بازار** است (مثل جلسه‌های ۸ دی و ۱۳ اسفند ۱۴۰۳ که در هرکدام ۵ پالایشی با پیش‌بینی بالا در یک روز ۲ تا ۳٪ افت کردند). داده‌های خود سهم این را از قبل نشان نمی‌دهد. پس قبل از بازگشایی خبرهای کلان را بخوان و اگر شوک هست، پیش‌بینی را «بدون پیش‌بینی جهت» کن.\n\n### گام ۷ — سناریوهای جلسهٔ بعد و ماشه‌ها (جدید)\nسه سناریو با فراوانی تاریخی و اقدام بنویس. رفتار بازگشایی در ۱۳ سال (پایدار در هر ۵ دوره):\n\n| وضعیت امروز | گپ بازگشایی فردا | بسته‌شدن بالاتر از قیمت بازگشایی | کف روز نسبت به بازگشایی |\n|---|---|---|---|\n| بسته‌شدن در صف خرید | +۳٫۱٪ | فقط ۲۱٪ (۱۵ تا ۳۷٪ در دوره‌ها) | −۲٫۴٪ |\n| بسته‌شدن قوی (آخرین > پایانی) | +۲٫۲٪ | ۳۶٪ | −۲٫۰٪ |\n| بسته‌شدن ضعیف (آخرین < پایانی) | −۱٫۷٪ | ۶۱٪ | −۱٫۵٪ |\n| بسته‌شدن در صف فروش | −۲٫۵٪ | ۶۵٪ (۵۵ تا ۷۷٪) | −۰٫۹٪ |\n\nدرون‌روز (۵ و ۱۰ دقیقه) بازار **برگشتی** است: بعد از تقاطع صعودی EMA3/EMA12 در ۵ دقیقه، ۶۶٪ مواقع قیمت تا ۳۰ دقیقهٔ بعد پایین‌تر بود و قیمتِ بیش از ۱٪ بالای VWAP در ۶۴٪ مواقع عقب نشست (۸ نماد بزرگ، ۱۴۰۳).\n\nماشه‌ها را با **قیمت و ساعت** بنویس، مثل:\n- «اگر فردا زیر ۱۹٬۸۰۰ باز شد و تا ۱۰:۳۰ بالای VWAP برگشت و خالص پول حقیقی مثبت شد → خرید آزمایشی ⅓ حجم با حد ضرر زیر کف روز».\n- «اگر با گپ بالای +۲٪ باز شد → نخر؛ اگر داری، ⅓ را در بازگشایی بفروش».\n- «اگر صف فروش تشکیل شد → در صف نفروش؛ پایان جلسه دوباره بررسی کن».\n\n### گام ۸ — مدیریت ریسک\n- حد ضرر زیر نزدیک‌ترین حمایت ساختاری یا ۱٫۵×ATR (هر کدام نزدیک‌تر). اگر فاصلهٔ حد ضرر بیش از ۸٪ است، حجم را کم کن یا وارد نشو.\n- هدف: مقاومت بعدی در `levels` یا دو برابر فاصلهٔ حد ضرر.\n- اندازهٔ موقعیت: ریسک هر معامله حداکثر همان درصدی که کاربر گفته (پیش‌فرض ۱٪ سرمایه).\n- دامنهٔ نوسان امروز در `price_limits_today` است؛ هدف یک‌روزه بیرون از دامنه معنا ندارد.\n\n### گام ۹ — شرط باطل‌شدن\nیک تا سه شرط مشخص با قیمت یا داده.\n\n### گام ۱۰ — ثبت و ارزیابی\nبعد از هر برگه یک خط JSON بده. کاربر آن‌ها را نگه می‌دارد و هر هفته با `petroEvaluate` کارنامه می‌گیرد.\n- **تصمیم خرید/فروش** در افق ۵ روز سنجیده می‌شود.\n- **پیش‌بینی جلسهٔ بعد** (`next_call`) با جلسهٔ بعد سنجیده می‌شود، با سه حالت درست، غلط و بی‌حرکت.\n- یک روز مخالف، شکست روش نیست؛ کارنامهٔ ده‌ها پیش‌بینی مهم است. برای کالبدشکافی یک روز، بخش ۷-ب را اجرا کن.\n\n## ۵. قالب خروجی (حداکثر یک صفحه)\n\n```\n### دیدبان پتروشیمی — [نماد] ([نام]) — [تاریخ، ساعت] — برای جلسهٔ [تاریخ]\n| اقدام | قیمت | مقدار | زمان | حد ضرر | هدف |\n|---|---|---|---|---|---|\n| خرید / فروش / نگهداری / کاری نکن | .. | ..٪ سرمایه | جلسهٔ .. ساعت .. | .. | .. |\n**موقعیت:** [A/B/C/D + توضیح]   **رژیم گروه:** [داغ/عادی/سرد، شاخص ۴۴ در ۲۰ روز ..٪]\n**تصمیم:** خرید / فروش / نگهداری / بدون لبه\n**احتمال رشد:** ۱ روز ..٪ · ۵ روز ..٪ (نرخ پایهٔ همین رژیم ..٪ → لبه .. واحد)   **میانهٔ ۵ روز:** ..٪   **اطمینان:** بالا/متوسط/پایین\n**امتیاز:** [عدد] = [جزئیات]  یا «جدول IPO: [مرحله]»\n**جلسهٔ بعد (نسخهٔ ۲٫۴):** پیش‌بینی [بالا/پایین/بدون پیش‌بینی] · بالا ..٪ / بی‌حرکت ..٪ / پایین ..٪ · صف خرید/فروش فردا ..٪/..٪ · از آخرین قیمت تا پایانی فردا (میانه) ..٪ در برابر هزینهٔ ۱٫۲۵٪ · پرچم‌ها: ..\n\n**روند:** روزانه .. · هفتگی .. (ساختار هفتگی ..) · یک‌ساله .. (جای قیمت در دامنهٔ ۵۲ هفته ..٪) · هم‌راستایی .. · کانال ۶۰ روزه .. → اثر روی تصمیم: [هیچ / تأیید فروش طبق قاعدهٔ ۴-۱-ب]\n**نمودار:** [نمودار رسم‌شده طبق بخش ۴-۱-ج، یا «رسم نشد» + درخواست تصویر پنل] · ساختار روزانه .. · حمایت‌ها .. · مقاومت‌ها .. · VWAP لنگر ..\n**ابزارهای تکنیکال** (خوانش امروز · لبهٔ ۱۳ ساله · کاربرد)\n| ابزار | خوانش امروز | لبهٔ آزموده | کاربرد در این برگه |\n|---|---|---|---|\n| فیبوناچی / پیوت / ایچیموکو / Stochastic / Bollinger / MACD / RSI و واگرایی / کندل / الگوی کلاسیک | .. | .. واحد (n = ..) | سطح ورود / حد ضرر / هدف / بی‌اثر |\n**سناریوهای جلسهٔ بعد**\n| سناریو | فراوانی تاریخی | اقدام |\n|---|---|---|\n| گپ مثبت / بی‌گپ / گپ منفی | ..٪ | .. |\n**ماشه‌ها:** اگر .. آن‌گاه .. (با قیمت و ساعت)\n**حد ضرر / هدف / حجم:** ..\n**چرا (۳ تا ۵ دلیل با عدد و منبع؛ داده و برداشت جدا)**\n**ریسک‌ها و شرط باطل‌شدن**\n**کدال (مهم‌ترین موارد ۳۰ روز اخیر)**\n**زمینهٔ گروه و بازار** (جریان پول گروه بدون خود نماد، صف‌ها، اخبار سراسری)\n**تازگی داده:** قیمت .. · شاخص .. · کدال ..\n> این تحلیل آموزشی/پژوهشی است و توصیهٔ سرمایه‌گذاری شخصی نیست.\n```\n\nخط ثبت:\n```json\n{\"date\":\"1405/07/05\",\"symbol\":\"…\",\"situation\":\"D\",\"regime\":\"hot\",\"decision\":\"NO_EDGE\",\"score\":-2,\"p_up_1d\":0.25,\"p_up_5d\":0.55,\"base_5d\":0.57,\"next_score\":-6,\"next_call\":\"DOWN\",\"p_next\":[0.06,0.39,0.55],\"ref_price\":0,\"last_price\":0,\"stop\":null,\"target\":null,\"horizon_days\":5}\n```\nبرای `petroEvaluate` از همین خطوط استفاده کن (`ref_price` = قیمت پایانی روز صدور، `last_price` = آخرین قیمت همان روز، `p_next` = بالا/بی‌حرکت/پایین).\n\n## ۶. موقعیت‌های خاص\n- **نماد متوقف:** علت را از کدال پیدا کن؛ فقط سناریوی بازگشایی بده.\n- **روز بعد از مجمع یا افزایش سرمایه:** از قیمت تعدیل‌شده استفاده کن؛ افت بعد از مجمع تکرارشونده است.\n- **شوک کلان (جنگ، تحریم، جهش ارز):** رژیم بر همه‌چیز غلبه می‌کند؛ در خرداد ۱۴۰۴ سیگنال‌های خرید شکست خوردند. حداکثر اطمینان «پایین» و پیش‌فرض «بدون لبه».\n- **نماد غیرپتروشیمی:** کالیبراسیون برای گروه ۴۴ است؛ اگر کاربر خواست تحلیل کن، ولی اطمینان را پایین بیاور.\n- **گروه ۲۳ (پالایشی‌ها: شپنا، شتران، شبندر، شبریز، شسپا، شراز، شاوان، شرانل، شنفت، شپاس، شبهرن):**\n  - رژیم از شاخص خود گروه ۲۳ می‌آید (`group.group_index`).\n  - برای **جلسهٔ بعد** و اعداد ۵ روزه، `next_session` را به کار ببر؛ روی خود پالایشی‌ها آزموده شده است (گام ۶-ب).\n  - جدول ۵ روزهٔ `rubric` روی گروه ۴۴ برآورد شده است (`calibration_applies_to_this_group = false`). اگر از آن عدد آوردی، بنویس «از گروه ۴۴».\n  - امتیاز کدال را از جدول پالایشی‌ها در بخش ۴-۴ بگیر.\n  - تصمیم پیش‌فرض «بدون لبهٔ معاملاتی» است (گام ۶-ب، قاعدهٔ ۳).\n  - نیمی از پالایشی‌های دیگر در صف: `group.refiner_peers_today`.\n- **«چرا دیروز گفتی نخر و امروز بالا رفت؟»:** احتمال همان برگه را یادآوری کن، کارنامهٔ ۵ روزه را با `petroEvaluate` نشان بده، و روز مورد نظر را با `petroReplay` کالبدشکافی کن (بخش ۷-ب). اگر فرض یا داده‌ای غلط بوده، صریح بگو کدام.\n\n## ۷. سبک نوشتن\nفارسی ساده ولی فنی؛ اصطلاحات فنی با همان واژهٔ انگلیسی (VWAP، RSI، base rate، edge). اعداد با واحد (ریال یا تومان، درصد). کوتاه.\n\n## ۷-ب. آزمون گذشته و کالبدشکافی خطا (نسخهٔ ۲٫۴)\nکاربر می‌گوید: `آزمون: شپنا · تاریخ: ۱۴۰۳/۰۷/۰۷`. یعنی: «برای جلسهٔ بعد از این تاریخ پیش‌بینی کن، بعد با واقعیت بسنج و علت خطا را پیدا کن».\n\n**روند کار:**\n1. تب tsetmc: `const x = await petroReplay('شپنا', '1403/07/07')`. اگر داده را کاربر از پنل فرستاد، همان کار است (پنل، بخش «آزمون گذشته»).\n2. **اول کور بنویس.** برگه را فقط از `x.snapshot` بنویس، دقیقاً مثل یک روز عادی و برای جلسهٔ `snapshot.replay.next_session`. `x.outcome` و `x.check` را تا پایان برگه نخوان. خط ثبت را هم بده.\n3. کدال را هم تا همان تاریخ بخوان: `codalSnapshot('شپنا', 120, { asOf: '1403/07/07' })` (تب codal.ir)، یا `snapshot.codal_recent`.\n4. خبرها و قیمت‌های بعد از آن تاریخ را از حافظه یا جست‌وجو وارد برگه نکن. اگر رویداد آن روزها را از قبل می‌دانی، در برگه ننویس و فقط در کالبدشکافی بگو.\n5. **بعد بسنج:** `x.outcome` (جلسهٔ بعد، گپ، صف فردا، ۳ و ۵ جلسه، شاخص گروه و کل، اطلاعیه‌های بعد از جلسه) و `x.check` (حکم و علت‌های خودکار).\n6. **کالبدشکافی** در یک جدول کوتاه:\n   - چه گفتم (بالا/بی‌حرکت/پایین، تصمیم، اطمینان) و چه شد.\n   - حکم: درست / غلط / بی‌حرکت. معاملهٔ یک‌روزه از آخرین قیمت چقدر خالص داد.\n   - علت اصلی از این فهرست: `GROUP_MOVE` حرکت کل پالایشی‌ها، `MARKET_MOVE` شاخص کل، `QUEUE_FLIP` شکستن صف، `GAP` گپ بازگشایی، `RANGE_CHANGE` تغییر دامنه، `LONG_BREAK` تعطیلی، `NEWS` اطلاعیهٔ بعد از جلسه، `ADJUSTMENT` تعدیل، `SMALL_MOVE` حرکت کمتر از ±۰٫۵٪، `OWN` حرکت خود سهم.\n   - آیا این علت از قبل قابل دیدن بود؟ اگر بله، کدام داده یا قاعده باید آن را می‌گرفت.\n   - یک خطا دلیل تغییر قاعده نیست. تغییر قاعده را فقط وقتی پیشنهاد بده که همان علت در چند روز تکرار شود؛ با `petroReplayRange` بسنج.\n7. **چند روز:** `await petroReplayRange('شپنا', '1403/07/01', '1403/07/30')` (حداکثر ۶۰ جلسه). جمع درست، غلط و بی‌حرکت و علت‌ها را بده و با اعداد خارج از نمونهٔ گام ۶-ب مقایسه کن. ۲۰ جلسه نمونهٔ کوچکی است.\n\n**علت‌ها در آزمون ۱۴۰۳** (نسخهٔ ۲٫۳، ۳۹ خطای بزرگ که حرکت بیش از ۲٪ خلاف پیش‌بینی بود، در ۲۶ روز):\n- حدود نیمی **گروهی** بودند: چند پالایشی در یک روز با هم برخلاف پیش‌بینی رفتند (۸ دی و ۱۳ اسفند ۱۴۰۳، هرکدام ۵ نماد).\n- بیشترِ بقیه **شکستن صف** بود: صف خرید امروز، صف فروش فردا (یا برعکس).\n- کدال در بیشتر این روزها اطلاعیهٔ مهمی نداشت. در ۸ دی گزارش‌های ماهانهٔ آذر همان روزها منتشر شده بود، ولی در کل ۱۴ سال گزارش ماهانه اثر جهت‌دار نداشت.\n- ۷ مهر ۱۴۰۳: دامنه ±۱٪ شد و ۱۰ پالایشی از ۱۱ در صف فروش بسته شدند. پیش‌بینی «پایین» برای ۸ مهر درست درآمد، ولی فروش ممکن نبود (صف فروش دوباره). پس «درست» بود و قابل اجرا نبود.\n\n## ۸. پیوست الف — روش آزمون\n- **داده:** قیمت روزانه و حقیقی/حقوقی ۶۲ سهم گروه ۴۴ از tsetmc (۱۳۹۲/۰۱ تا ۱۴۰۵/۰۷)؛ ۳۰٪ کم‌معامله‌ترین سهم‌های هر سال حذف شدند. سهم‌های حذف‌شده از بورس در داده نیستند (سوگیری بقا، در این گروه کم‌اثر).\n- **دامنهٔ نوسان تاریخی:** برای تشخیص صف، دامنه برای هر روز از خود بازار برآورد شد (حدود ±۴٪ در ۱۳۹۰ تا ۱۳۹۳، ±۵٪ در ۱۳۹۴ تا ۱۴۰۰، +۵/−۳٪ در ۱۴۰۱ و ۱۴۰۲، ±۳٪ از ۱۴۰۳).\n- **پنج دورهٔ بازار:** ۱۳۹۲ تا ۱۳۹۶ (رکود/ثبات)، ۱۳۹۷ و ۱۳۹۸ (جهش ارز)، ۱۳۹۹ و ۱۴۰۰ (حباب و ریزش)، ۱۴۰۱ و ۱۴۰۲ (رنج)، ۱۴۰۳ تا ۱۴۰۵ (رالی و جنگ).\n- **Walk-forward:** برای هر سال از ۱۳۹۶ تا ۱۴۰۵، جدول فقط با سال‌های قبل ساخته و روی همان سال آزمون شد.\n- **IPO:** ۱۹۲ عرضهٔ اولیهٔ کل بازار (بورس و فرابورس) از ۱۳۹۶ تا ۱۴۰۵ که صف اولیه‌شان تمام شده بود.\n- **کدال:** ۳٬۸۲۰ اطلاعیهٔ ۴۲ نماد از دی ۱۴۰۲ تا شهریور ۱۴۰۴ و ۶۵۰ گزارش ماهانه (گسترش به سال‌های قبل به‌خاطر محدودیت نرخ درخواست کدال انجام نشد).\n- **درون‌روز:** معاملات تک‌تک ۸ نماد بزرگ در ۱۴۰۳.\n- **ابزارهای کلاسیک (نسخهٔ ۲٫۳):** همان تعریف‌های اسکریپت (`technical`) روی ۶۶ هزار روز-سهم ۱۳۹۲ تا ۱۴۰۵. نوسان فیبوناچی = بیشینه و کمینهٔ ۱۲۰ جلسه با دامنهٔ دست‌کم ۱۵٪؛ چرخش‌ها = فراکتال ۵ کندلی؛ پیوت کلاسیک از کندل قبل؛ ایچیموکو ۹، ۲۶، ۵۲. لبه = احتمال رشد منهای میانگین همهٔ سهم‌های گروه در همان روز. برای آزمون فیبوناچی، برخورد و نگه‌داشتن سطوح ۳۸٫۲، ۵۰ و ۶۱٫۸٪ با سطوح دلخواه ۳۰، ۴۵، ۵۶ و ۷۰٪ مقایسه شد. تطابق اسکریپت با آزمون روی ۲۴۰ روز-سهم تصادفی: ۲۳۹ از ۲۴۰ یکسان.\n- **آزمون بازپخش پالایشی‌ها (نسخهٔ ۲٫۴):**\n  - **داده:** ۱۱ پالایشی از tsetmc (قیمت روزانه و حقیقی/حقوقی، با ادغام نماد قدیمی شتران و شراز)، شاخص گروه ۲۳ و شاخص کل، ۱۳۹۲ تا ۱۴۰۵/۰۷. حدود ۲۹ هزار روز-نماد در موقعیت D.\n  - **دامنه و کدال:** دامنهٔ نوسان واقعی هر روز از `MarketData/GetStaticThreshold` (بورس و فرابورس جدا). حدود ۸٬۴۰۰ اطلاعیهٔ کدال از `Codal/GetPreparedDataByInsCode`. دلار آزاد از tgju.\n  - **روش:** برای هر روز همهٔ شاخص‌ها فقط از داده‌های تا همان روز ساخته شد و با جلسهٔ بعد، ۵ جلسه بعد و «از آخرین قیمت» سنجیده شد. امتیاز جلسهٔ بعد با رگرسیون لجستیک برآورد و به عدد صحیح گرد شد. walk-forward: برای هر سال ۱۴۰۳، ۱۴۰۴ و ۱۴۰۵، وزن‌ها و جدول فقط از سال‌های قبل.\n  - **تطابق:** امتیاز اسکریپت با موتور آزمون روی ۴۰ روز-نماد تصادفی ۱۴۰۳ تا ۱۴۰۵، در ۳۵ مورد یکسان بود. هر ۵ اختلاف از دامنهٔ نوسان بود: موتور آزمون دامنهٔ یک نماد مرجع را برای همه به کار برد، ولی اسکریپت دامنهٔ خود نماد را می‌خواند و دقیق‌تر است.\n  - **کد و دفترچه:** پوشهٔ `research/` مخزن.\n\n## ۹. پیوست ب — کد جمع‌آوری داده (JavaScript)\n- `petroSnapshot(symbol, { asOf })`، `petroReplay(symbol, date)`، `petroReplayRange(symbol, from, to)` و `petroEvaluate(logs)` → تب `https://www.tsetmc.com`\n- `codalSnapshot(symbol, days, { asOf })` و `codalLetterText(url)` → تب `https://www.codal.ir`\n\n```javascript\n/* ==========================================================================\n   petro_collector.js — داده‌گیر عامل «دیدبان پتروشیمی» — نسخهٔ ۲ (۱۴۰۵/۰۷/۰۵)\n   A) petroSnapshot(symbol)        → run in a tab on https://www.tsetmc.com\n   B) petroEvaluate(logs)          → same tab; scores earlier calls against what happened\n   C) codalSnapshot(symbol, days)  → run in a tab on https://www.codal.ir\n   D) codalLetterText(url)         → same codal tab; readable text of one letter\n   Changes vs v1: rubric re-estimated on 13 years (1392-1405) with regime-conditioned calibration; request timeouts, minimum-history guards for indicators, IPO / new-listing\n   block, chart structure (swings, key levels, volume-by-price, anchored VWAP), streaks,\n   group flow excluding the symbol itself, live index append after the close, group regime\n   (hot / mid / cold) with the regime-conditioned calibration table, AGM/HTML letters.\n   v2.1: `trend` block — daily / weekly (completed weeks) / yearly trend, alignment, 60-day regression channel.\n   v2.1.1: group block — MarketWatch no longer returns `flow`; a missing flow no longer drops every symbol.\n   v2.1.2: group block uses the symbol's own sector (e.g. 23 = refineries) and its index for regime; codal peers follow the group.\n   v2.3: `technical` block — OHLC (daily 320 bars, weekly 104) for drawing, Fibonacci, pivots, Ichimoku, Stochastic, Bollinger/MACD values,\n         RSI divergence, candlestick and chart patterns, each with its 13-year backtest edge (techtools.py).\n   v2.4: (replay test of 11 refiners, 1392-1405, research/ in the repo)\n         · petroSnapshot(symbol, { asOf: '1403/07/07' }) rebuilds the snapshot as of the close of a past session (no future data)\n         · petroReplay(symbol, date) = as-of snapshot + what really happened next (`outcome`) + automatic check with reasons\n         · petroReplayRange(symbol, from, to) = the same for every session in a range, with a summary\n         · real daily price limits (MarketData/GetStaticThreshold) instead of a fixed ±2.85% rule; sell-queue streak\n         · `next_session` block: next-session forecast (up / flat / down) with the v2.4 score, calibrated on the refiners\n         · `codal_recent` from tsetmc's Codal list (no codal.ir rate limit); two Codal rows of the v2.4 score use it\n   ========================================================================== */\n\nasync function petroSnapshot(symbol, opts = {}) {\n  const BASE = 'https://cdn.tsetmc.com/api/';\n  const sleep = ms => new Promise(r => setTimeout(r, ms));\n  const cache = opts.cache || null;   // Map shared by petroReplayRange (same histories for every day)\n  const J = async (u, tries = 4, ms = 15000) => {\n    if (cache && cache.has(u)) return cache.get(u);\n    const v = await J0(u, tries, ms); if (cache && v) cache.set(u, v); return v;\n  };\n  const J0 = async (u, tries, ms) => {\n    for (let i = 0; i < tries; i++) {\n      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), ms);\n      try { const r = await fetch(BASE + u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); } catch (e) { clearTimeout(tm); }\n      await sleep(800 * (i + 1));\n    }\n    return null;\n  };\n  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/\\s+/g, ' ').trim();\n  const R = (x, d = 4) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** d) / 10 ** d;\n  const out = { symbol, version: 2.4, generated_at: new Date().toISOString(), warnings: [] };\n  // as-of (replay) mode: '1403/07/07' (Latin or Persian digits) or a Gregorian dEven like 20240928\n  const jalOf = dEv => { const s = String(dEv); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)))).replace(/[^\\d/]/g, ''); };\n  let asOfJ = null, asOfD = null;\n  if (opts.asOf) { const a = String(opts.asOf).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).trim();\n    if (/^\\d{8}$/.test(a)) asOfD = +a; else { const p = a.split(/[/-]/); if (p.length !== 3) return { error: 'تاریخ آزمون را به شکل ۱۴۰۳/۰۷/۰۷ بدهید', symbol }; asOfJ = `${p[0]}/${p[1].padStart(2, '0')}/${p[2].padStart(2, '0')}`; } }\n  const REPLAY = !!opts.asOf;\n\n  // ---------- 1) instrument\n  const srch = await J('Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(symbol)));\n  const all = (srch?.instrumentSearch || []).filter(x => ar(x.lVal18AFC) === ar(symbol));\n  const ins = all.find(x => [1, 2, 4].includes(x.flow) && !/3$|4$/.test(x.cgrValCot || '')) || all[0];\n  if (!ins) return { error: 'نماد پیدا نشد', symbol };\n  const ic = ins.insCode;\n  out.instrument = { insCode: ic, name: ins.lVal30, market: ins.flowTitle, board: ins.cgrValCot };\n  // live-only endpoints are skipped in replay mode (they describe today, not the test date)\n  const [info, live, bl, ctToday] = await Promise.all([\n    J(`Instrument/GetInstrumentInfo/${ic}`), REPLAY ? null : J(`ClosingPrice/GetClosingPriceInfo/${ic}`),\n    REPLAY ? null : J(`BestLimits/${ic}`), REPLAY ? null : J(`ClientType/GetClientType/${ic}/1/0`)]);\n  // older listings of the same symbol (e.g. a move from Farabourse to the Bourse) are merged into one history\n  const olds = all.filter(x => x.insCode !== ic && [1, 2, 4].includes(x.flow));\n  const [daily, cth, ...oldH] = await Promise.all([J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`), J(`ClientType/GetClientTypeHistory/${ic}`),\n    ...olds.flatMap(x => [J(`ClosingPrice/GetClosingPriceDailyList/${x.insCode}/0`), J(`ClientType/GetClientTypeHistory/${x.insCode}`)])]);\n  if (!daily) return { error: 'سابقهٔ قیمت از tsetmc نیامد؛ دوباره اجرا کن', symbol };\n  const dMap = new Map(), ctRows = [];\n  oldH.forEach((h, k) => { if (!h) return; if (k % 2 === 0) (h.closingPriceDaily || []).forEach(r => dMap.set(r.dEven, r)); else ctRows.push(...(h.clientType || [])); });\n  (daily.closingPriceDaily || []).forEach(r => dMap.set(r.dEven, r)); ctRows.push(...(cth?.clientType || []));\n  const I = info?.instrumentInfo || {}, L = live?.closingPriceInfo || {};\n  out.instrument.state = L.instrumentState?.cEtavalTitle || null;\n  out.fundamental_quick = { eps_estimated: I.eps?.estimatedEPS, sector_pe: I.eps?.sectorPE, shares: I.zTitad, sector: I.sector?.lSecVal,\n    avg_volume_3m: I.qTotTran5JAvg, free_float_pct: I.kAjCapValCpsIdx, price_limits_today: [I.staticThreshold?.psGelStaMin, I.staticThreshold?.psGelStaMax] };\n\n  // ---------- 2) daily series (+ today's live row) and adjustment\n  let rawAll = [...dMap.values()].sort((a, b) => a.dEven - b.dEven);\n  const fullTraded = rawAll.filter(r => r.qTotTran5J > 0).map(r => r.dEven);   // dates only: used for the next session's date in replay mode\n  if (REPLAY) {\n    if (!asOfD) { let k = rawAll.length - 1; while (k >= 0 && jalOf(rawAll[k].dEven) > asOfJ) k--; asOfD = k >= 0 ? rawAll[k].dEven : 0; }\n    rawAll = rawAll.filter(r => r.dEven <= asOfD);\n    if (!asOfJ) asOfJ = jalOf(asOfD);\n  }\n  let D = rawAll.filter(r => r.qTotTran5J > 0)\n    .map(r => ({ d: r.dEven, o: r.priceFirst, h: r.priceMax, l: r.priceMin, last: r.pDrCotVal, c: r.pClosing, y: r.priceYesterday, v: r.qTotTran5J, val: r.qTotCap }));\n  if (!REPLAY && L.finalLastDate && D.length && L.finalLastDate > D[D.length - 1].d && L.qTotTran5J > 0)\n    D.push({ d: L.finalLastDate, o: L.priceFirst, h: L.priceMax, l: L.priceMin, last: L.pDrCotVal, c: L.pClosing, y: L.priceYesterday, v: L.qTotTran5J, val: L.qTotCap, live: true });\n  const n = D.length, t = n - 1;\n  if (REPLAY && n) {\n    const used = D[t].d, nxt = fullTraded.find(d => d > used) || null;\n    out.replay = { as_of: asOfJ, session_used: jalOf(used), session_used_dEven: used, next_session: nxt ? jalOf(nxt) : null, next_session_dEven: nxt,\n      note: 'آزمون گذشته: همهٔ داده‌ها تا پایان همین جلسه بریده شده‌اند. دفتر سفارش، دیده‌بان بازار و جریان پول گروه در این حالت نیستند.' };\n    out.instrument.state = jalOf(used) === asOfJ ? 'مجاز (آزمون گذشته)' : 'مجاز (آزمون گذشته؛ در تاریخ آزمون معامله نشد)';\n    if (jalOf(used) !== asOfJ) out.warnings.push(`نماد در ${asOfJ} معامله نشد؛ آخرین جلسهٔ قبل از آن (${jalOf(used)}) استفاده شد`);\n    out.fundamental_quick.note = 'EPS، P/E و تعداد سهام مقادیر امروزند، نه تاریخ آزمون';\n  }\n  // the day's real price limits (the range can change: e.g. ±1% from 1403/07/07 to 1403/07/20)\n  let thr = null;\n  if (n && !D[t].live) { const th = await J(`MarketData/GetStaticThreshold/${ic}/${D[t].d}`, 2, 10000); const recs = (th?.staticThreshold || []).filter(x => x.dEven === D[t].d).sort((a, b) => a.hEven - b.hEven);\n    if (recs.length) thr = { max: recs[recs.length - 1].psGelStaMax, min: recs[recs.length - 1].psGelStaMin }; }\n  else if (I.staticThreshold?.psGelStaMax) thr = { max: I.staticThreshold.psGelStaMax, min: I.staticThreshold.psGelStaMin };\n  if (REPLAY) out.fundamental_quick.price_limits_today = thr ? [thr.min, thr.max] : null;\n  if (n < 5) return { error: 'سابقهٔ معاملاتی کافی نیست', symbol, days: n };\n  // IPO row (reference price = par 1000 on the first trading day) — excluded from adjustment\n  const ipoIdx = D.findIndex(r => r.y === 1000 && r.c > 1500);\n  const fac = new Array(n).fill(1); const adjDays = [];\n  for (let i = n - 2; i >= 0; i--) { let ratio = (i + 1 === ipoIdx) ? 1 : D[i + 1].y / D[i].c; if (ratio > 0.995 && ratio < 1.005) ratio = 1; else adjDays.push([D[i + 1].d, R(ratio, 4)]); fac[i] = fac[i + 1] * ratio; }\n  const C = D.map((r, i) => r.c * fac[i]), H = D.map((r, i) => r.h * fac[i]), Lo = D.map((r, i) => r.l * fac[i]), LST = D.map((r, i) => r.last * fac[i]);\n  const V = D.map(r => r.v), VAL = D.map(r => r.val);\n  const hist = ipoIdx >= 0 ? n - ipoIdx : n;           // trading days since listing (or available history)\n  if (hist < 60) out.warnings.push(`فقط ${hist} روز سابقه: اندیکاتورهای بلندتر از این دوره null هستند و امتیاز نمی‌گیرند`);\n\n  // ---------- 3) indicators (each one only when enough history exists)\n  const sma = (a, k, i) => (i + 1 < k || i - k + 1 < (ipoIdx > 0 ? ipoIdx : 0)) ? null : a.slice(i + 1 - k, i + 1).reduce((s, x) => s + x, 0) / k;\n  const emaArr = (a, k) => { const e = []; const al = 2 / (k + 1); a.forEach((x, i) => e.push(i ? al * x + (1 - al) * e[i - 1] : x)); return e; };\n  const wilder = (a, k) => { const e = []; a.forEach((x, i) => e.push(i ? e[i - 1] + (x - e[i - 1]) / k : x)); return e; };\n  const ok = k => hist >= k;\n  const up = C.map((x, i) => i ? Math.max(0, x - C[i - 1]) : 0), dn = C.map((x, i) => i ? Math.max(0, C[i - 1] - x) : 0);\n  const au = wilder(up, 14), ad = wilder(dn, 14); const RSI = au.map((u, i) => 100 - 100 / (1 + u / (ad[i] || 1e-9)));\n  const e12 = emaArr(C, 12), e26 = emaArr(C, 26); const MACD = e12.map((x, i) => x - e26[i]); const SIG = emaArr(MACD, 9);\n  const TR = C.map((x, i) => i ? Math.max(H[i] - Lo[i], Math.abs(H[i] - C[i - 1]), Math.abs(Lo[i] - C[i - 1])) : H[i] - Lo[i]);\n  const pdm = H.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return u > d && u > 0 ? u : 0; });\n  const ndm = Lo.map((x, i) => { if (!i) return 0; const u = H[i] - H[i - 1], d = Lo[i - 1] - Lo[i]; return d > u && d > 0 ? d : 0; });\n  const ATR = wilder(TR, 14), PDI = wilder(pdm, 14).map((x, i) => 100 * x / ATR[i]), NDI = wilder(ndm, 14).map((x, i) => 100 * x / ATR[i]);\n  const ADX = wilder(PDI.map((p, i) => 100 * Math.abs(p - NDI[i]) / ((p + NDI[i]) || 1e-9)), 14);\n  const hi = (a, k, i) => Math.max(...a.slice(Math.max(0, i - k), i)), lo = (a, k, i) => Math.min(...a.slice(Math.max(0, i - k), i));\n  const sd20 = ok(20) ? Math.sqrt(C.slice(t - 19, t + 1).reduce((s, x) => s + (x - sma(C, 20, t)) ** 2, 0) / 20) : null;\n  const bbp = sd20 ? (C[t] - (sma(C, 20, t) - 2 * sd20)) / (4 * sd20) : null;\n  const last = D[t], chgLast = last.last / last.y - 1;\n  const ind = {\n    date: last.d, live_row: !!last.live, close: last.c, last: last.last, yesterday: last.y, high: last.h, low: last.l, open: last.o,\n    chg_close_pct: R(100 * (last.c / last.y - 1), 2), chg_last_pct: R(100 * chgLast, 2), history_days: hist,\n    ret_5d: t >= 5 ? R(C[t] / C[t - 5] - 1) : null, ret_20d: ok(21) ? R(C[t] / C[t - 20] - 1) : null, ret_60d: ok(61) ? R(C[t] / C[t - 60] - 1) : null, ret_240d: ok(241) ? R(C[t] / C[t - 240] - 1) : null,\n    sma20: R(sma(C, 20, t), 0), sma50: R(sma(C, 50, t), 0), sma100: R(sma(C, 100, t), 0),\n    rsi14: ok(30) ? R(RSI[t], 1) : null, macd_hist: ok(40) ? R(MACD[t] - SIG[t], 1) : null,\n    macd_cross: ok(40) ? ((MACD[t] > SIG[t] && MACD[t - 1] <= SIG[t - 1]) ? 'up' : (MACD[t] < SIG[t] && MACD[t - 1] >= SIG[t - 1]) ? 'down' : null) : null,\n    adx14: ok(30) ? R(ADX[t], 1) : null, plus_di: ok(30) ? R(PDI[t], 1) : null, minus_di: ok(30) ? R(NDI[t], 1) : null, atr_pct: ok(15) ? R(ATR[t] / C[t]) : null,\n    bollinger_pctb: R(bbp, 2), donchian20_high: ok(21) ? R(hi(H, 20, t), 0) : null, donchian20_low: ok(21) ? R(lo(Lo, 20, t), 0) : null,\n    vol_ratio_20: ok(21) ? R(V[t] / sma(V, 20, t - 1), 2) : null, value_today: VAL[t],\n    last_minus_close_pct: R(100 * (last.last - last.c) / last.y, 2), adjustments_last_year: adjDays.filter(x => x[0] >= D[Math.max(0, t - 240)].d)\n  };\n  // queue at the close from the day's real limits (v2.4); without them: ±3% rule\n  const pMaxT = thr?.max, pMinT = thr?.min;\n  const limUp = pMaxT && last.y ? pMaxT / last.y - 1 : 0.03, limDn = pMinT && last.y ? 1 - pMinT / last.y : 0.03;\n  ind.price_limits_pct = [R(-limDn, 4), R(limUp, 4)];\n  ind.closed_at_upper_limit = pMaxT ? last.last >= pMaxT : (chgLast >= limUp - 0.0015 && last.last >= last.h);\n  ind.closed_at_lower_limit = pMinT ? last.last <= pMinT : (chgLast <= -(limDn - 0.0015) && last.last <= last.l);\n  // trend class (stock level) — used to read signals in context\n  ind.trend_class = (ok(51) && C[t] > ind.sma20 && ind.sma20 > ind.sma50 && ind.ret_20d > 0.10) ? 'strong_up'\n    : (ok(51) && C[t] < ind.sma20 && ind.sma20 < ind.sma50 && ind.ret_20d < -0.10) ? 'strong_down' : (ok(51) ? 'other' : 'unknown_short_history');\n  // streaks\n  // earlier days: today's limit percentage is assumed (ranges change rarely)\n  const lim = i => (D[i].last / D[i].y - 1 >= limUp - 0.0015 && D[i].last >= D[i].h);\n  const limS = i => (D[i].last / D[i].y - 1 <= -(limDn - 0.0015) && D[i].last <= D[i].l);\n  let qs = 0; for (let i = t - 1; i >= 0 && lim(i); i--) qs++;\n  let qss = 0; for (let i = t - 1; i >= 0 && limS(i); i--) qss++;\n  let us = 0; for (let i = t - 1; i >= 1 && C[i] > C[i - 1]; i--) us++;\n  ind.buy_queue_streak_before_today = qs; ind.sell_queue_streak_before_today = qss; ind.up_day_streak_before_today = us;\n  out.daily = ind;\n\n  // ---------- 4) chart structure: swings, key levels, volume-by-price, anchored VWAP\n  const sw = { highs: [], lows: [] };\n  for (let i = Math.max(2, t - 120); i <= t - 2; i++) {\n    const wH = H.slice(i - 2, i + 3), wL = Lo.slice(i - 2, i + 3);\n    if (H[i] === Math.max(...wH)) sw.highs.push([D[i].d, R(H[i], 0)]);\n    if (Lo[i] === Math.min(...wL)) sw.lows.push([D[i].d, R(Lo[i], 0)]);\n  }\n  const lh = sw.highs.slice(-3), ll = sw.lows.slice(-3);\n  let structure = 'نامشخص';\n  if (lh.length >= 2 && ll.length >= 2) {\n    const hhS = lh[lh.length - 1][1] > lh[lh.length - 2][1], hlS = ll[ll.length - 1][1] > ll[ll.length - 2][1];\n    structure = hhS && hlS ? 'صعودی (HH/HL)' : (!hhS && !hlS) ? 'نزولی (LH/LL)' : 'رنج/در حال تغییر';\n  }\n  const lastSH = lh.length ? lh[lh.length - 1][1] : null, lastSL = ll.length ? ll[ll.length - 1][1] : null;\n  const win = Math.min(60, hist), vb = {}; let vmin = Infinity, vmax = -Infinity;\n  for (let i = t - win + 1; i <= t; i++) { vmin = Math.min(vmin, Lo[i]); vmax = Math.max(vmax, H[i]); }\n  const step = (vmax - vmin) / 20 || 1;\n  for (let i = t - win + 1; i <= t; i++) { const px = (H[i] + Lo[i] + C[i]) / 3; const b = Math.min(19, Math.floor((px - vmin) / step)); vb[b] = (vb[b] || 0) + V[i]; }\n  const nodes = Object.entries(vb).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => R(vmin + (+b + 0.5) * step, 0));\n  const anchor = ipoIdx >= 0 ? ipoIdx : Math.max(0, t - 60);\n  let avN = 0, avD = 0; for (let i = anchor; i <= t; i++) { avN += (H[i] + Lo[i] + C[i]) / 3 * V[i]; avD += V[i]; }\n  const levels = [];\n  const add = (nm, v) => { if (v && isFinite(v)) levels.push([nm, R(v, 0), R(100 * (v / C[t] - 1), 1)]); };\n  add('سقف دیروز', D[t - 1]?.h * fac[t - 1]); add('کف دیروز', D[t - 1]?.l * fac[t - 1]); add('آخرین سقف چرخشی', lastSH); add('آخرین کف چرخشی', lastSL);\n  add('سقف ۲۰ روزه', ind.donchian20_high); add('کف ۲۰ روزه', ind.donchian20_low); add('SMA20', ind.sma20); add('SMA50', ind.sma50);\n  add(ipoIdx >= 0 ? 'VWAP از عرضهٔ اولیه' : 'VWAP لنگر ۶۰ روزه', avN / avD); nodes.forEach((x, k) => add(`گره حجمی ${k + 1}`, x));\n  if (ipoIdx >= 0) add('قیمت عرضهٔ اولیه', D[ipoIdx].c * fac[ipoIdx]);\n  levels.sort((a, b) => b[1] - a[1]);\n  const res = levels.filter(x => x[1] > C[t] * 1.002), sup = levels.filter(x => x[1] < C[t] * 0.998);\n  out.chart = { structure, swing_highs: lh, swing_lows: ll, levels_sorted_high_to_low: levels,\n    nearest_resistance: res.length ? res[res.length - 1] : null, nearest_support: sup.length ? sup[0] : null,\n    close_above_last_swing_high: lastSH ? C[t] > lastSH * 1.01 : null, close_below_last_swing_low: lastSL ? C[t] < lastSL * 0.99 : null,\n    tested_last_swing_low_and_held: lastSL ? (Lo[t] <= lastSL * 1.01 && C[t] > lastSL) : null,\n    note: 'levels: [نام، قیمت تعدیل‌شده، فاصله از قیمت پایانی ٪]' };\n\n  // ---------- 4b) multi-timeframe trend (same definitions as the 13-year backtest, trend.py / trend2.py)\n  {\n    const s0 = ipoIdx > 0 ? ipoIdx : 0;\n    const tr = { note: 'زمینه است، امتیاز ندارد؛ قاعدهٔ استفاده در بخش «روند چندافقی» پرامپت' };\n    // daily: moving-average alignment\n    const s20 = sma(C, 20, t), s50 = sma(C, 50, t), s100 = sma(C, 100, t);\n    tr.daily = (s20 === null || s50 === null || s100 === null) ? 'unknown_short_history'\n      : (C[t] > s20 && s20 > s50 && s50 > s100) ? 'up' : (C[t] < s20 && s20 < s50 && s50 < s100) ? 'down' : 'mixed';\n    // weekly: completed weeks only (Iran week Sat-Wed; key = the Friday that ends it); the current week is excluded\n    const wkKey = dEv => { const s = String(dEv); const dt = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); dt.setUTCDate(dt.getUTCDate() + (5 - dt.getUTCDay() + 7) % 7); return dt.toISOString().slice(0, 10); };\n    const wk = []; // [key, close, high, low]\n    for (let i = s0; i <= t; i++) { const k = wkKey(D[i].d); const w = wk[wk.length - 1];\n      if (!w || w[0] !== k) wk.push([k, C[i], H[i], Lo[i]]); else { w[1] = C[i]; w[2] = Math.max(w[2], H[i]); w[3] = Math.min(w[3], Lo[i]); } }\n    const done = wk.slice(0, -1), m = done.length, wc = done.map(w => w[1]);\n    const wsma = (k, j) => j + 1 < k ? null : wc.slice(j + 1 - k, j + 1).reduce((a, b) => a + b, 0) / k;\n    if (m >= 32) {\n      const j = m - 1, w10 = wsma(10, j), w30 = wsma(30, j), w10p = wsma(10, j - 2);\n      tr.weekly = (wc[j] > w10 && w10 > w30 && w10 > w10p) ? 'up' : (wc[j] < w10 && w10 < w30 && w10 < w10p) ? 'down' : 'mixed';\n      tr.weekly_sma10 = R(w10, 0); tr.weekly_sma30 = R(w30, 0);\n    } else tr.weekly = 'unknown_short_history';\n    if (m >= 8) {\n      const hh = a => Math.max(...a.map(w => w[2])), llw = a => Math.min(...a.map(w => w[3]));\n      const cur = done.slice(-4), prv = done.slice(-8, -4);\n      tr.weekly_structure = (hh(cur) > hh(prv) && llw(cur) > llw(prv)) ? 'HH/HL' : (hh(cur) < hh(prv) && llw(cur) < llw(prv)) ? 'LH/LL' : 'mixed';\n    } else tr.weekly_structure = 'unknown_short_history';\n    // yearly: 200-day average and its 20-day slope, 52-week range position\n    const s200 = sma(C, 200, t), s200p = sma(C, 200, t - 20);\n    tr.yearly = (s200 === null || s200p === null) ? 'unknown_short_history' : (C[t] > s200 && s200 > s200p) ? 'up' : (C[t] < s200 && s200 <= s200p) ? 'down' : 'mixed';\n    tr.sma200 = R(s200, 0);\n    if (hist >= 241) { const h52 = Math.max(...H.slice(t - 239, t + 1)), l52 = Math.min(...Lo.slice(t - 239, t + 1)); tr.position_in_52w_range = R((C[t] - l52) / (h52 - l52), 2); }\n    const known = [tr.daily, tr.weekly, tr.yearly].filter(x => !String(x).startsWith('unknown'));\n    tr.alignment = known.length < 3 ? 'incomplete' : known.every(x => x === 'up') ? 'all_up' : known.every(x => x === 'down') ? 'all_down' : 'mixed';\n    // 60-day regression channel of log price (trendline proxy); today's close vs YESTERDAY's channel\n    if (t - s0 >= 61) {\n      const fitAt = end => { let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0; const nn = 60;\n        for (let i = end - 59, x = 0; i <= end; i++, x++) { const y = Math.log(C[i]); sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }\n        const vx = sxx / nn - (sx / nn) ** 2, vy = syy / nn - (sy / nn) ** 2, cv = sxy / nn - (sx / nn) * (sy / nn), b = cv / vx, a = sy / nn - b * sx / nn;\n        return { a, b, r2: cv * cv / (vx * vy), sd: Math.sqrt(Math.max(vy - b * b * vx, 0)) }; };\n      const f = fitAt(t), fp = fitAt(t - 1), z = (Math.log(C[t]) - (fp.a + fp.b * 60)) / (fp.sd || 1e-9);\n      const kind = (f.b * 60 > 0.10 && f.r2 > 0.6) ? 'clean_up' : (f.b * 60 < -0.10 && f.r2 > 0.6) ? 'clean_down' : 'none';\n      tr.channel60 = { kind, slope_60d_pct: R(100 * f.b * 60, 1), r2: R(f.r2, 2), z_vs_yesterdays_channel: R(z, 2),\n        lower_line_today: R(Math.exp(f.a + f.b * 59 - 2 * f.sd), 0), upper_line_today: R(Math.exp(f.a + f.b * 59 + 2 * f.sd), 0) };\n    }\n    out.trend = tr;\n  }\n\n  // ---------- 4c) technical toolkit: OHLC for drawing, Fibonacci, pivots, Ichimoku, Stochastic, divergence, candles, chart patterns\n  //               definitions = the 13-year backtest (techtools.py, 1392-1405); `backtest` = [n, edge 5d pp, edge 20d pp, eras (of 5) with the same sign]\n  {\n    const s0 = ipoIdx > 0 ? ipoIdx : 0;\n    const O = D.map((r, i) => (r.o || D[i].c) * fac[i]);\n    const r0 = x => R(x, 0);\n    const TT = { fib_up_zone: [9631, 1.1, -0.1, 3], fib_up_zone_bounce: [3712, 2.0, -0.9, 4], fib_up_break618: [449, 5.3, 1.5, 4], fib_dn_zone: [4238, 0.1, 0.1, 3],\n      fib_dn_zone_reject: [2012, -0.5, -0.4, 3], fib_dn_break618: [251, -0.5, -6.0, 3], piv_above_r1: [11763, -1.4, -2.7, 3], piv_below_s1: [10884, 1.8, 0.6, 4],\n      piv_s1_bounce: [25097, -1.9, -0.3, 4], piv_r1_reject: [21435, 2.1, 2.3, 4], wpiv_above_r1: [10441, -1.3, -0.8, 4], wpiv_below_s1: [9001, 2.1, 0.7, 4],\n      ichi_above: [33174, 0.3, 0.6, 5], ichi_below: [23738, 0.2, 0.4, 3], ichi_in: [9130, 0.1, 0.3, 3], ichi_tk_up_above: [629, 2.6, 2.1, 4], ichi_tk_dn_below: [433, 1.1, -2.0, 3],\n      ichi_break_up: [984, 0.5, -1.9, 4], ichi_break_dn: [1102, 4.3, 2.5, 4], stoch_up20: [3438, 2.1, -0.3, 4], stoch_dn80: [4256, -1.7, -0.3, 5],\n      div_bull: [386, -0.6, -5.6, 3], div_bear: [607, -0.1, 2.3, 3], c_doji: [10458, 0.6, 0.0, 4], c_hammer: [1150, 0.3, -1.1, 3], c_star: [1408, -0.4, 1.8, 4],\n      c_bull_eng: [762, 1.8, 0.0, 3], c_bear_eng: [1022, 0.1, -0.7, 2], c_morning: [413, -2.1, -0.4, 4], c_evening: [411, 2.1, -1.2, 4],\n      p_dtop: [44, 7.1, -1.2, 5], p_dbot: [57, 1.0, -6.8, 2], p_hs: [144, 3.4, -1.4, 4], p_ihs: [91, 5.3, -0.5, 4], p_tri_up: [613, 0.9, -2.5, 3], p_tri_dn: [766, 2.4, 0.7, 4] };\n    const LBL = { fib_up_zone: 'فیبوناچی: پولبک در ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪', fib_up_zone_bounce: 'فیبوناچی: برگشت از ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪', fib_up_break618: 'فیبوناچی: شکست ۶۱٫۸٪ در پولبک',\n      fib_dn_zone: 'فیبوناچی: رشد اصلاحی تا ۳۸٫۲ تا ۶۱٫۸٪', fib_dn_zone_reject: 'فیبوناچی: برگشت از مقاومت ۳۸٫۲ تا ۶۱٫۸٪', fib_dn_break618: 'فیبوناچی: عبور از ۶۱٫۸٪ در روند نزولی',\n      piv_above_r1: 'پیوت روزانه: بالای R1', piv_below_s1: 'پیوت روزانه: زیر S1', piv_s1_bounce: 'پیوت روزانه: برگشت از S1', piv_r1_reject: 'پیوت روزانه: برگشت از R1',\n      wpiv_above_r1: 'پیوت هفتگی: بالای R1', wpiv_below_s1: 'پیوت هفتگی: زیر S1', ichi_above: 'ایچیموکو: بالای ابر', ichi_below: 'ایچیموکو: زیر ابر', ichi_in: 'ایچیموکو: داخل ابر',\n      ichi_tk_up_above: 'ایچیموکو: تقاطع تنکان/کیجون رو به بالا، بالای ابر', ichi_tk_dn_below: 'ایچیموکو: تقاطع رو به پایین، زیر ابر', ichi_break_up: 'ایچیموکو: خروج از ابر رو به بالا',\n      ichi_break_dn: 'ایچیموکو: خروج از ابر رو به پایین', stoch_up20: 'Stochastic: تقاطع رو به بالا زیر ۲۰', stoch_dn80: 'Stochastic: تقاطع رو به پایین بالای ۸۰',\n      div_bull: 'واگرایی مثبت RSI', div_bear: 'واگرایی منفی RSI', c_doji: 'کندل دوجی', c_hammer: 'کندل چکش', c_star: 'کندل ستارهٔ دنباله‌دار', c_bull_eng: 'پوشای صعودی',\n      c_bear_eng: 'پوشای نزولی', c_morning: 'ستارهٔ صبحگاهی', c_evening: 'ستارهٔ شامگاهی', p_dtop: 'سقف دوقلو (شکست خط گردن)', p_dbot: 'کف دوقلو (شکست خط گردن)',\n      p_hs: 'سر و شانه (شکست خط گردن)', p_ihs: 'سر و شانهٔ معکوس (شکست خط گردن)', p_tri_up: 'مثلث: شکست رو به بالا', p_tri_dn: 'مثلث: شکست رو به پایین' };\n    const tk = { note: 'ابزارهای کلاسیک برای رسم نمودار، سطوح، حد ضرر و هدف؛ هیچ‌کدام امتیاز ندارند. لبه‌ها از آزمون ۱۳ ساله (بخش ۴-۱-ج پرامپت).' };\n    const fired = new Set();\n    const T0 = Math.max(s0, n - 320);\n    tk.ohlc_daily = []; for (let i = T0; i <= t; i++) tk.ohlc_daily.push([D[i].d, r0(O[i]), r0(H[i]), r0(Lo[i]), r0(C[i]), V[i]]);\n    tk.ohlc_columns = ['dEven', 'open', 'high', 'low', 'close(پایانی)', 'volume'];\n    // weekly bars (Iran week Sat-Wed); the last one may be the running week\n    const wkKey = dEv => { const s = String(dEv); const dt = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); dt.setUTCDate(dt.getUTCDate() + (5 - dt.getUTCDay() + 7) % 7); return dt.toISOString().slice(0, 10); };\n    const W = []; let wk0 = null;\n    for (let i = s0; i <= t; i++) { const k = wkKey(D[i].d);\n      if (k !== wk0) { W.push([D[i].d, O[i], H[i], Lo[i], C[i], V[i]]); wk0 = k; }\n      else { const w = W[W.length - 1]; w[0] = D[i].d; w[2] = Math.max(w[2], H[i]); w[3] = Math.min(w[3], Lo[i]); w[4] = C[i]; w[5] += V[i]; } }\n    tk.ohlc_weekly = W.slice(-104).map(w => [w[0], r0(w[1]), r0(w[2]), r0(w[3]), r0(w[4]), w[5]]);\n    const ready = t - s0 >= 60;\n    // ---- Fibonacci on the 120-bar swing\n    if (t - s0 >= 20) {\n      const a = Math.max(s0, t - 119); let hi = a, lo = a;\n      for (let i = a; i <= t; i++) { if (H[i] > H[hi]) hi = i; if (Lo[i] < Lo[lo]) lo = i; }\n      const HI = H[hi], LO = Lo[lo], span = HI - LO, up = hi > lo, ext = up ? hi : lo;\n      const valid = HI / LO - 1 >= 0.15 && t - ext >= 3;\n      const lvl = r => up ? HI - r * span : LO + r * span;\n      const rt = up ? (HI - C[t]) / span : (C[t] - LO) / span, rtp = up ? (HI - C[t - 1]) / span : (C[t - 1] - LO) / span;\n      if (valid && ready) {\n        if (up) { if (rt >= 0.382 && rt <= 0.618) { fired.add('fib_up_zone'); if (C[t] > C[t - 1] && Lo[t] <= lvl(0.382)) fired.add('fib_up_zone_bounce'); } if (rt > 0.618 && rtp <= 0.618) fired.add('fib_up_break618'); }\n        else { if (rt >= 0.382 && rt <= 0.618) { fired.add('fib_dn_zone'); if (C[t] < C[t - 1] && H[t] >= lvl(0.382)) fired.add('fib_dn_zone_reject'); } if (rt > 0.618 && rtp <= 0.618) fired.add('fib_dn_break618'); }\n      }\n      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map(r => [r, r0(lvl(r))]);\n      const exts = [1.272, 1.618, 2].map(r => [r, r0(up ? LO + r * span : HI - r * span)]);\n      const near = levels.slice(1, -1).map(([r, p]) => [r, p, Math.abs(p / C[t] - 1)]).sort((x, y) => x[2] - y[2])[0];\n      tk.fibonacci = { direction: up ? 'up' : 'down', swing_from: [D[up ? lo : hi].d, r0(up ? LO : HI)], swing_to: [D[ext].d, r0(up ? HI : LO)], swing_pct: R(100 * (HI / LO - 1), 1),\n        valid_swing: valid, bars_since_swing_end: t - ext, retracement_now: R(rt, 3), retracement_levels: levels, extension_levels: exts,\n        nearest_level: near ? [near[0], near[1], R(100 * (near[1] / C[t] - 1), 1)] : null,\n        rule: 'up: سطوح اصلاحی از سقف به پایین (حمایت)، extension هدف‌های بالای سقف؛ down: سطوح اصلاحی از کف به بالا (مقاومت). نوسان معتبر ≥ ۱۵٪.' };\n    }\n    // ---- pivots: signals use yesterday's bar; next-session levels use today's bar\n    const piv = (h, l, c) => { const P = (h + l + c) / 3; return { P, R1: 2 * P - l, R2: P + (h - l), R3: h + 2 * (P - l), S1: 2 * P - h, S2: P - (h - l), S3: l - 2 * (h - P) }; };\n    const pr = o => o && Object.fromEntries(Object.entries(o).map(([k, v]) => [k, r0(v)]));\n    if (t >= 1) {\n      const py = piv(H[t - 1], Lo[t - 1], C[t - 1]);\n      if (ready) { if (C[t] > py.R1) fired.add('piv_above_r1'); if (C[t] < py.S1) fired.add('piv_below_s1'); if (Lo[t] <= py.S1 && C[t] > py.S1) fired.add('piv_s1_bounce'); if (H[t] >= py.R1 && C[t] < py.R1) fired.add('piv_r1_reject'); }\n      const done = W.slice(0, -1), lw = done[done.length - 1];\n      const wp = lw ? piv(lw[2], lw[3], lw[4]) : null;\n      if (wp && ready) { if (C[t] > wp.R1) fired.add('wpiv_above_r1'); if (C[t] < wp.S1) fired.add('wpiv_below_s1'); }\n      tk.pivots = { next_session_daily: pr(piv(H[t], Lo[t], C[t])), today_daily_from_yesterday: pr(py), weekly_from_last_completed_week: pr(wp), method: 'classic (P=(H+L+C)/3)' };\n    }\n    // ---- Ichimoku 9/26/52\n    const hhv = (a, k, i) => { let m = -Infinity; for (let j = Math.max(s0, i - k + 1); j <= i; j++) m = Math.max(m, a[j]); return m; };\n    const llv = (a, k, i) => { let m = Infinity; for (let j = Math.max(s0, i - k + 1); j <= i; j++) m = Math.min(m, a[j]); return m; };\n    const ten = i => (hhv(H, 9, i) + llv(Lo, 9, i)) / 2, kij = i => (hhv(H, 26, i) + llv(Lo, 26, i)) / 2;\n    const spA = i => (ten(i) + kij(i)) / 2, spB = i => (hhv(H, 52, i) + llv(Lo, 52, i)) / 2;\n    if (t - s0 >= 78) {\n      const top = Math.max(spA(t - 26), spB(t - 26)), bot = Math.min(spA(t - 26), spB(t - 26));\n      const topp = Math.max(spA(t - 27), spB(t - 27)), botp = Math.min(spA(t - 27), spB(t - 27));\n      const tkUp = ten(t) > kij(t) && ten(t - 1) <= kij(t - 1), tkDn = ten(t) < kij(t) && ten(t - 1) >= kij(t - 1);\n      if (ready) { if (C[t] > top) fired.add('ichi_above'); else if (C[t] < bot) fired.add('ichi_below'); else fired.add('ichi_in');\n        if (tkUp && C[t] > top) fired.add('ichi_tk_up_above'); if (tkDn && C[t] < bot) fired.add('ichi_tk_dn_below');\n        if (C[t] > top && C[t - 1] <= topp) fired.add('ichi_break_up'); if (C[t] < bot && C[t - 1] >= botp) fired.add('ichi_break_dn'); }\n      tk.ichimoku = { tenkan: r0(ten(t)), kijun: r0(kij(t)), cloud_top: r0(top), cloud_bottom: r0(bot), price_vs_cloud: C[t] > top ? 'above' : C[t] < bot ? 'below' : 'inside',\n        tk_cross_today: tkUp ? 'up' : tkDn ? 'down' : null, future_cloud_26: spA(t) >= spB(t) ? 'bullish' : 'bearish', future_span_a: r0(spA(t)), future_span_b: r0(spB(t)),\n        chikou_vs_price_26_ago: C[t] > C[t - 26] ? 'above' : 'below' };\n    }\n    // ---- Stochastic 14,3\n    const kAt = i => { const hh = hhv(H, 14, i), ll = llv(Lo, 14, i); return hh > ll ? 100 * (C[i] - ll) / (hh - ll) : 50; };\n    if (t - s0 >= 20) {\n      const K = [t - 3, t - 2, t - 1, t].map(kAt), dNow = (K[1] + K[2] + K[3]) / 3, dPrev = (K[0] + K[1] + K[2]) / 3;\n      const cu = K[3] > dNow && K[2] <= dPrev && dNow < 20, cd = K[3] < dNow && K[2] >= dPrev && dNow > 80;\n      if (ready) { if (cu) fired.add('stoch_up20'); if (cd) fired.add('stoch_dn80'); }\n      tk.stochastic = { k: R(K[3], 1), d: R(dNow, 1), cross: cu ? 'up_below_20' : cd ? 'down_above_80' : null };\n    }\n    // ---- Bollinger / MACD values for drawing\n    if (ok(20)) { const m = sma(C, 20, t); tk.bollinger = { upper: r0(m + 2 * sd20), middle: r0(m), lower: r0(m - 2 * sd20), width_pct: R(100 * 4 * sd20 / m, 1) }; }\n    if (ok(40)) tk.macd = { macd: R(MACD[t], 1), signal: R(SIG[t], 1), hist: R(MACD[t] - SIG[t], 1) };\n    // ---- swings (5-bar fractal, confirmed two bars later) → divergence and chart patterns\n    const SHs = [], SLs = [];\n    for (let i = Math.max(s0 + 2, t - 122); i <= t - 2; i++) {\n      if (H[i] === Math.max(...H.slice(i - 2, i + 3))) SHs.push(i);\n      if (Lo[i] === Math.min(...Lo.slice(i - 2, i + 3))) SLs.push(i);\n    }\n    const sh = SHs.filter(i => i >= t - 120).slice(-4), sl = SLs.filter(i => i >= t - 120).slice(-4);\n    const pt = (i, p) => [D[i].d, r0(p)];\n    // RSI divergence (fires on the day the second swing is confirmed; `recent` = within 10 bars)\n    const dv = [];\n    if (sl.length >= 2) { const [a1, a2] = sl.slice(-2); if (a2 - a1 <= 60 && Lo[a2] < Lo[a1] && RSI[a2] > RSI[a1] + 2) { dv.push({ type: 'bullish', swings: [pt(a1, Lo[a1]), pt(a2, Lo[a2])], rsi: [R(RSI[a1], 1), R(RSI[a2], 1)], bars_ago: t - a2 }); if (a2 === t - 2 && ready) fired.add('div_bull'); } }\n    if (sh.length >= 2) { const [a1, a2] = sh.slice(-2); if (a2 - a1 <= 60 && H[a2] > H[a1] && RSI[a2] < RSI[a1] - 2) { dv.push({ type: 'bearish', swings: [pt(a1, H[a1]), pt(a2, H[a2])], rsi: [R(RSI[a1], 1), R(RSI[a2], 1)], bars_ago: t - a2 }); if (a2 === t - 2 && ready) fired.add('div_bear'); } }\n    tk.rsi_divergence = dv.filter(x => x.bars_ago <= 10);\n    // chart patterns: status 'broken_today' (= backtested signal) or 'forming' (neckline not broken yet)\n    const pats = [];\n    const minL = (a, b) => Math.min(...Lo.slice(a, b + 1)), maxH = (a, b) => Math.max(...H.slice(a, b + 1));\n    if (sh.length >= 2) { const [a1, a2] = sh.slice(-2);\n      if (a2 - a1 >= 10 && Math.abs(H[a1] / H[a2] - 1) <= 0.03 && t - a2 <= 30) { const neck = minL(a1, a2);\n        if (neck <= Math.min(H[a1], H[a2]) * 0.95) { const brk = C[t] < neck && neck <= C[t - 1]; if (brk && ready) fired.add('p_dtop');\n          if (brk || C[t] >= neck) pats.push({ type: 'double_top', fa: 'سقف دوقلو', bias: 'bearish', status: brk ? 'broken_today' : 'forming', points: [pt(a1, H[a1]), pt(a2, H[a2])], neckline: r0(neck), measured_target: r0(neck - (Math.max(H[a1], H[a2]) - neck)) }); } } }\n    if (sl.length >= 2) { const [a1, a2] = sl.slice(-2);\n      if (a2 - a1 >= 10 && Math.abs(Lo[a1] / Lo[a2] - 1) <= 0.03 && t - a2 <= 30) { const neck = maxH(a1, a2);\n        if (neck >= Math.max(Lo[a1], Lo[a2]) * 1.05) { const brk = C[t] > neck && neck >= C[t - 1]; if (brk && ready) fired.add('p_dbot');\n          if (brk || C[t] <= neck) pats.push({ type: 'double_bottom', fa: 'کف دوقلو', bias: 'bullish', status: brk ? 'broken_today' : 'forming', points: [pt(a1, Lo[a1]), pt(a2, Lo[a2])], neckline: r0(neck), measured_target: r0(neck + (neck - Math.min(Lo[a1], Lo[a2]))) }); } } }\n    if (sh.length >= 3) { const [A, B, Cc] = sh.slice(-3);\n      if (H[B] >= 1.03 * Math.max(H[A], H[Cc]) && Math.abs(H[A] / H[Cc] - 1) <= 0.05 && t - Cc <= 30) { const neck = (minL(A, B) + minL(B, Cc)) / 2, brk = C[t] < neck && neck <= C[t - 1];\n        if (brk && ready) fired.add('p_hs');\n        if (brk || C[t] >= neck) pats.push({ type: 'head_shoulders', fa: 'سر و شانه', bias: 'bearish', status: brk ? 'broken_today' : 'forming', points: [pt(A, H[A]), pt(B, H[B]), pt(Cc, H[Cc])], neckline: r0(neck), measured_target: r0(neck - (H[B] - neck)) }); } }\n    if (sl.length >= 3) { const [A, B, Cc] = sl.slice(-3);\n      if (Lo[B] <= 0.97 * Math.min(Lo[A], Lo[Cc]) && Math.abs(Lo[A] / Lo[Cc] - 1) <= 0.05 && t - Cc <= 30) { const neck = (maxH(A, B) + maxH(B, Cc)) / 2, brk = C[t] > neck && neck >= C[t - 1];\n        if (brk && ready) fired.add('p_ihs');\n        if (brk || C[t] <= neck) pats.push({ type: 'inverse_head_shoulders', fa: 'سر و شانهٔ معکوس', bias: 'bullish', status: brk ? 'broken_today' : 'forming', points: [pt(A, Lo[A]), pt(B, Lo[B]), pt(Cc, Lo[Cc])], neckline: r0(neck), measured_target: r0(neck + (neck - Lo[B])) }); } }\n    if (sh.length >= 2 && sl.length >= 2) { const [p1, p2] = sh.slice(-2), [q1, q2] = sl.slice(-2), h1 = H[p1], h2 = H[p2], l1 = Lo[q1], l2 = Lo[q2];\n      const contracting = h2 <= h1 * 1.01 && l2 >= l1 * 0.99 && (h2 < h1 * 0.99 || l2 > l1 * 1.01) && (h2 - l2) < 0.8 * (h1 - l1);\n      if (contracting && t - Math.max(p2, q2) <= 20) { const bu = C[t] > h2 && h2 >= C[t - 1], bd = C[t] < l2 && l2 <= C[t - 1];\n        if (bu && ready) fired.add('p_tri_up'); if (bd && ready) fired.add('p_tri_dn');\n        const kind = Math.abs(h2 / h1 - 1) < 0.01 ? 'ascending' : Math.abs(l2 / l1 - 1) < 0.01 ? 'descending' : 'symmetrical';\n        pats.push({ type: 'triangle_' + kind, fa: kind === 'ascending' ? 'مثلث افزایشی' : kind === 'descending' ? 'مثلث کاهشی' : 'مثلث متقارن', bias: 'neutral',\n          status: bu ? 'broken_up_today' : bd ? 'broken_down_today' : 'forming', upper_line: [pt(p1, h1), pt(p2, h2)], lower_line: [pt(q1, l1), pt(q2, l2)],\n          breakout_up_above: r0(h2), breakdown_below: r0(l2), measured_target_up: r0(h2 + (h1 - l1)), measured_target_down: r0(l2 - (h1 - l1)) }); } }\n    tk.chart_patterns = pats;\n    tk.swings_recent = { highs: sh.map(i => pt(i, H[i])), lows: sl.map(i => pt(i, Lo[i])) };\n    // ---- candlestick patterns (today)\n    const body = i => Math.abs(C[i] - O[i]), rgI = i => H[i] - Lo[i], upS = i => H[i] - Math.max(O[i], C[i]), loS = i => Math.min(O[i], C[i]) - Lo[i];\n    const cd = [];\n    if (t - s0 >= 25 && rgI(t) > 0) {\n      let ab = 0; for (let i = t - 19; i <= t; i++) ab += body(i); ab /= 20;\n      const r5p = C[t - 1] / C[t - 6] - 1;\n      if (body(t) <= 0.1 * rgI(t)) cd.push('c_doji');\n      if (body(t) > 0 && loS(t) >= 2 * body(t) && upS(t) <= 0.25 * rgI(t) && r5p < -0.03) cd.push('c_hammer');\n      if (body(t) > 0 && upS(t) >= 2 * body(t) && loS(t) <= 0.25 * rgI(t) && r5p > 0.03) cd.push('c_star');\n      if (C[t - 1] < O[t - 1] && C[t] > O[t] && O[t] <= C[t - 1] && C[t] >= O[t - 1] && r5p < 0) cd.push('c_bull_eng');\n      if (C[t - 1] > O[t - 1] && C[t] < O[t] && O[t] >= C[t - 1] && C[t] <= O[t - 1] && r5p > 0) cd.push('c_bear_eng');\n      if (C[t - 2] < O[t - 2] && body(t - 2) >= 1.2 * ab && body(t - 1) <= 0.3 * body(t - 2) && C[t] > O[t] && C[t] > (O[t - 2] + C[t - 2]) / 2) cd.push('c_morning');\n      if (C[t - 2] > O[t - 2] && body(t - 2) >= 1.2 * ab && body(t - 1) <= 0.3 * body(t - 2) && C[t] < O[t] && C[t] < (O[t - 2] + C[t - 2]) / 2) cd.push('c_evening');\n      if (ready) cd.forEach(k => fired.add(k));\n    }\n    tk.candles_today = cd.map(k => LBL[k]);\n    tk.candle_note = 'کندل‌ها با قیمت پایانی (میانگین وزنی) رسم می‌شوند، نه آخرین معامله؛ دامنهٔ نوسان ±۳٪ بدنه‌ها را کوتاه می‌کند.';\n    tk.signals_today = [...fired].map(k => ({ key: k, fa: LBL[k], n: TT[k][0], edge_5d_pp: TT[k][1], edge_20d_pp: TT[k][2], eras_same_sign_of_5: TT[k][3] }));\n    tk.backtest_note = 'لبه = فاصلهٔ احتمال رشد از میانگین گروه در همان روز (واحد درصد)، ۱۳۹۲ تا ۱۴۰۵، گروه ۴۴. هیچ ابزار کلاسیکی لبهٔ پایدار بیش از ±۳ واحد نداشت؛ جهت را از امتیاز v2 بگیر.';\n    out.technical = tk;\n  }\n\n  // ---------- 5) order book\n  const Bk = bl?.bestLimits || [], top = Bk[0] || {};\n  const pMax = I.staticThreshold?.psGelStaMax, pMin = I.staticThreshold?.psGelStaMin;\n  let queue = 'none';\n  if (top.qTitMeDem > 0 && !top.qTitMeOf && pMax && top.pMeDem >= pMax) queue = 'buy_queue';\n  if (top.qTitMeOf > 0 && !top.qTitMeDem && pMin && top.pMeOf <= pMin) queue = 'sell_queue';\n  if (REPLAY) out.order_book = { queue: 'unknown', note: 'در آزمون گذشته دفتر سفارش نیست' };\n  else out.order_book = { queue, top5: Bk.slice(0, 5).map(b => [b.zOrdMeDem, b.qTitMeDem, b.pMeDem, b.pMeOf, b.qTitMeOf, b.zOrdMeOf]),\n    queue_value_billion_toman: R((queue === 'buy_queue' ? top.qTitMeDem * top.pMeDem : queue === 'sell_queue' ? top.qTitMeOf * top.pMeOf : 0) / 1e10, 1),\n    note: 'ستون‌ها: تعداد خریدار، حجم خرید، قیمت خرید، قیمت فروش، حجم فروش، تعداد فروشنده' };\n\n  // ---------- 6) flows (individual / institutional)\n  const CT = {}; ctRows.forEach(r => { if (!REPLAY || r.recDate <= D[t].d) CT[r.recDate] = r; });\n  if (ctToday?.clientType && (last.live || !CT[last.d])) { const q = ctToday.clientType, px = last.c; CT[last.d] = { buy_I_Value: q.buy_I_Volume * px, sell_I_Value: q.sell_I_Volume * px, buy_N_Value: q.buy_N_Volume * px, sell_N_Value: q.sell_N_Volume * px, buy_I_Count: q.buy_CountI, sell_I_Count: q.sell_CountI }; }\n  const F = D.map(r => { const x = CT[r.d]; if (!x) return null; const bpc = x.buy_I_Value / Math.max(1, x.buy_I_Count), spc = x.sell_I_Value / Math.max(1, x.sell_I_Count);\n    return { d: r.d, val: r.val, bpc, spc, power: bpc / spc, netI: x.buy_I_Value - x.sell_I_Value, nbuy: x.buy_N_Value, nsell: x.sell_N_Value, bc: x.buy_I_Count, sc: x.sell_I_Count }; });\n  const fw = F.slice(-60).filter(Boolean), fl = F[t];\n  const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };\n  const sumK = (k, f) => F.slice(-k).filter(Boolean).reduce((s, x) => s + f(x), 0);\n  const newListing = ipoIdx >= 0 && hist <= 60;\n  out.flows = fl ? {\n    buyer_power_today: R(fl.power, 2), buyer_power_5d: R(sumK(5, x => x.bpc) / sumK(5, x => x.spc), 2),\n    buyer_power_reliable: !newListing, per_capita_buy_toman: R(fl.bpc / 10, 0), per_capita_sell_toman: R(fl.spc / 10, 0),\n    per_capita_buy_vs_60d_median: fw.length >= 20 ? R(fl.bpc / med(fw.map(x => x.bpc)), 2) : null,\n    indiv_buyers: fl.bc, indiv_sellers: fl.sc,\n    indiv_net_today_pct_of_value: R(fl.netI / fl.val, 3), indiv_net_5d_pct: R(sumK(5, x => x.netI) / sumK(5, x => x.val), 3), indiv_net_20d_pct: R(sumK(20, x => x.netI) / sumK(20, x => x.val), 3),\n    indiv_net_today_billion_toman: R(fl.netI / 1e10, 1), inst_net_today_billion_toman: R((fl.nbuy - fl.nsell) / 1e10, 1), inst_buy_share: R(fl.nbuy / fl.val, 2), inst_sell_share: R(fl.nsell / fl.val, 2),\n    last10: F.slice(-10).filter(Boolean).map(x => [x.d, R(x.power, 2), R(x.netI / 1e10, 1), R((x.nbuy - x.nsell) / 1e10, 1)]),\n    note: newListing ? 'سهم تازه‌عرضه است: قدرت خریدار و سرانه‌ها به‌خاطر سهمیهٔ کوچک عرضهٔ اولیه گمراه‌کننده‌اند' : ''\n  } : null;\n\n  // ---------- 7) IPO / new listing block\n  if (ipoIdx >= 0 && hist <= 120) {\n    let k = ipoIdx + 1; while (k < n && lim(k)) k++;\n    const streak = k - ipoIdx - 1, openIdx = k < n ? k : null;\n    let fdIdx = null; if (openIdx !== null) for (let i = openIdx; i < n; i++) if (D[i].c < D[i].y) { fdIdx = i; break; }\n    const phase = openIdx === null ? 'in_initial_queue_streak' : (fdIdx !== null && t - fdIdx <= 10) ? 'after_first_down_day' : (t - openIdx <= 5 ? 'first_open_days' : 'post_ipo');\n    out.ipo = { ipo_date: D[ipoIdx].d, ipo_price: D[ipoIdx].c, trading_days_since_ipo: hist - 1, initial_queue_streak: streak,\n      first_open_day: openIdx !== null ? D[openIdx].d : null, first_open_day_low: openIdx !== null ? R(Lo[openIdx], 0) : null, first_open_day_high: openIdx !== null ? R(H[openIdx], 0) : null,\n      first_down_day: fdIdx !== null ? D[fdIdx].d : null, days_since_first_down: fdIdx !== null ? t - fdIdx : null,\n      return_since_ipo: R(C[t] / (D[ipoIdx].c * fac[ipoIdx]) - 1, 3), phase,\n      base_rates_192_ipos_1396_1405: {\n        after_first_open_day: { up_1d: 0.29, up_5d: 0.38, up_20d: 0.44, median_5d_pct: -3.3, median_20d_pct: -3.8 },\n        after_first_down_day: { up_1d: 0.23, up_3d: 0.26, up_5d: 0.33, up_20d: 0.42, median_5d_pct: -3.8, median_20d_pct: -6.1 },\n        after_first_down_day_if_streak_ge_8: { n: 103, up_1d: 0.20, up_5d: 0.31, up_20d: 0.39, median_20d_pct: -10.2 },\n        first_down_day_with_institutional_net_buy_gt_20pct: { n: 59, up_1d: 0.24, up_5d: 0.31, up_20d: 0.47 },\n        by_era_after_first_down_up_1d: { '1396-98': 0.23, '1399-1400': 0.10, '1401-02': 0.31, '1403-05': 0.30 },\n        sixty_days_after_first_open: { share_positive: 0.53, median_pct: 3.4 } } };\n  }\n\n  // ---------- 8) major holders (>1%)\n  const cls = nm => /^شخص حقيقي/.test(nm) ? 'individual' : /BFM|بازارگرداني/.test(nm) ? 'market_maker' : /^PRX|سبد/.test(nm) ? 'portfolio' : /صندوق.*(بازنشستگي|بيمه اجتماعي)/.test(nm) ? 'pension' : /صندوق/.test(nm) ? 'fund' : /بيمه/.test(nm) ? 'insurance' : /بانك/.test(nm) ? 'bank' : /واسط مالي/.test(nm) ? 'sukuk_spv' : /تامين|شستا|صبا|آتيه/.test(nm) ? 'strategic_social_security' : /پتروشيمي|نفت|گاز|پالايش/.test(nm) ? 'strategic_parent_or_peer' : /سرمايه گذاري|گروه|توسعه/.test(nm) ? 'investment_co' : 'other';\n  const hd = [];\n  for (const r of (opts.lite ? [] : D.slice(-6))) { const j = await J(`Shareholder/${ic}/${r.d}`, 2, 10000); const rows = j?.shareShareholder || []; const des = [...new Set(rows.map(x => x.dEven))].sort(); if (des.length < 2) continue;\n    const cur = {}, prev = {}; rows.forEach(x => { const T = x.dEven === des[des.length - 1] ? cur : prev; T[x.shareHolderName] = (T[x.shareHolderName] || 0) + x.numberOfShares; });\n    for (const nm of new Set([...Object.keys(cur), ...Object.keys(prev)])) { const dsh = (cur[nm] || 0) - (prev[nm] || 0); if (Math.abs(dsh) < 1) continue;\n      hd.push({ date: r.d, holder: nm, type: cls(nm), delta_shares: dsh, value_billion_toman: R(dsh * r.c / 1e10, 2), now_pct: I.zTitad ? R(100 * (cur[nm] || 0) / I.zTitad, 3) : null, new_above_1pct: !(nm in prev), dropped_below_1pct: !(nm in cur) }); } }\n  const lastHold = (REPLAY || opts.lite) ? null : await J(`Shareholder/GetInstrumentShareHolderLast/${ic}`, 2);\n  out.holders = { top: (lastHold?.shareHolder || []).slice(0, 8).map(x => [x.shareHolderName, R(x.perOfShares, 2), cls(x.shareHolderName)]), changes_6d: hd };\n\n  // ---------- 9) the symbol's own group (sector code from InstrumentInfo, e.g. 44 = chemicals, 23 = refineries):\n  //               breadth, flows EXCLUDING this symbol, group index (found by name \"<code>-...\") + total index, live append\n  const SEC = String(I.sector?.cSecVal || '').trim() || '44';\n  const mw = REPLAY ? null : await J('ClosingPrice/GetMarketWatch?market=0&paperTypes[0]=1&paperTypes[1]=2&showTraded=false&withBestLimits=true');\n  const G = (mw?.marketwatch || []).filter(x => (x.csv || '').trim() === SEC && (x.flow == null || [1, 2, 4].includes(x.flow)) && !/\\d$/.test(x.lva) && x.qtc > 0);\n  const cta = REPLAY ? null : await J('ClientType/GetClientTypeAll'); const CTA = {}; (cta?.clientTypeAllDto || []).forEach(x => CTA[x.insCode] = x);\n  let netI = 0, tv = 0, selfNet = 0, selfVal = 0;\n  G.forEach(x => { const c = CTA[x.insCode]; if (!c) return; const nI = (c.buy_I_Volume - c.sell_I_Volume) * x.pcl; if (x.insCode === ic) { selfNet = nI; selfVal = x.qtc; } else { netI += nI; tv += x.qtc; } });\n  const qb = G.filter(x => x.pdv >= x.pMax && x.blDs?.[0]?.qmo === 0).length, qsl = G.filter(x => x.pdv <= x.pMin && x.blDs?.[0]?.qmd === 0).length;\n  const ixLive = await J('Index/GetIndexB1LastAll/All/1');\n  const liveList = ixLive?.indexB1 || Object.values(ixLive || {})[0] || [];\n  const secIdx = liveList.find(x => String(x.lVal30 || '').trim().startsWith(SEC + '-'));\n  const GI = secIdx ? String(secIdx.insCode) : '33626672012415176';\n  if (!secIdx && SEC !== '44') out.warnings.push(`شاخص گروه ${SEC} پیدا نشد؛ شاخص ۴۴ به‌جای آن استفاده شد`);\n  const [ixG, ixT] = await Promise.all([J('Index/GetIndexB2History/' + GI), J('Index/GetIndexB2History/32097828799138957')]);\n  const liveIdx = {}; liveList.forEach(x => liveIdx[x.insCode] = x.xDrNivJIdx004);\n  const idx = (h, code) => { const rows = (h?.indexB2 || []).sort((x, y) => x.dEven - y.dEven).filter(x => !REPLAY || x.dEven <= last.d); const a = rows.map(x => x.xNivInuClMresIbs); let appended = false;\n    if (!REPLAY && last.d > (rows[rows.length - 1]?.dEven || 0) && liveIdx[code]) { a.push(liveIdx[code]); appended = true; }\n    const k = a.length - 1; const m50 = a.slice(k - 49, k + 1).reduce((s, x) => s + x, 0) / 50; return { level: a[k], r1: R(a[k] / a[k - 1] - 1), r5: R(a[k] / a[k - 5] - 1), r20: R(a[k] / a[k - 20] - 1), above_sma50: a[k] > m50, live_appended: appended }; };\n  const cG = idx(ixG, GI);\n  const regime = cG.r20 > 0.10 ? 'hot' : cG.r20 < -0.05 ? 'cold' : 'mid';\n  out.group = { sector_code: SEC, sector_name: I.sector?.lSecVal || null, group_index_name: secIdx?.lVal30 || '44-شيميايي', group_index_code: GI,\n    n_traded: G.length, pct_up: R(G.filter(x => x.pdv > x.py).length / G.length, 2), buy_queues: qb, sell_queues: qsl,\n    avg_change_pct: R(100 * G.reduce((s, x) => s + (x.pcl / x.py - 1), 0) / G.length, 2),\n    indiv_net_flow_pct_of_value_ex_self: R(netI / tv, 3), indiv_net_flow_billion_toman_ex_self: R(netI / 1e10, 1),\n    this_symbol_share_of_group_value: R(selfVal / (tv + selfVal), 3), this_symbol_indiv_net_billion_toman: R(selfNet / 1e10, 1),\n    group_index: cG, chem44_index: SEC === '44' ? cG : null, total_index: idx(ixT, '32097828799138957'), regime,\n    regime_rule: 'hot = شاخص همین گروه در ۲۰ روز بیش از +۱۰٪؛ cold = کمتر از −۵٪؛ بقیه mid' };\n  if (SEC !== '44' && SEC !== '23') out.warnings.push(`نماد در گروه ${SEC} (${I.sector?.lSecVal || ''}) است، نه گروه ۴۴ یا ۲۳: جدول‌ها روی این گروه آزموده نشده‌اند (اطمینان پایین)`);\n  if (SEC === '23') out.warnings.push('گروه ۲۳ (پالایشی): جدول ۵ روزهٔ rubric از گروه ۴۴ است؛ پیش‌بینی جلسهٔ بعد و اعداد ۵ روزهٔ همین گروه در بلوک next_session است (آزمون ۱۴ سالهٔ ۱۱ پالایشی، نسخهٔ ۲٫۴)');\n  // breadth of the other refiners today (v2.4 rows): share closing in buy / sell queue, share up\n  const REFINERS = { 'شپنا': ['7745894403636165'], 'شتران': ['51617145873056483', '34066377223628725'], 'شبندر': ['35366681030756042'], 'شبریز': ['48753732042176709'],\n    'شسپا': ['49188729526980541'], 'شراز': ['14031158866706953', '33683240001985963'], 'شاوان': ['60247433951600827'], 'شرانل': ['44013656953678055'],\n    'شنفت': ['14073782708315535'], 'شپاس': ['35178706978554988'], 'شبهرن': ['22667016906590506'] };\n  const faN = x => String(x || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim(), me = faN(symbol);\n  if (SEC === '23') {\n    let peers = null;\n    if (!REPLAY) { const Pp = G.filter(x => faN(x.lva) !== me && REFINERS[faN(x.lva)]);\n      if (Pp.length) peers = { n: Pp.length, buy_queue_share: R(Pp.filter(x => x.pdv >= x.pMax && x.blDs?.[0]?.qmo === 0).length / Pp.length, 2),\n        sell_queue_share: R(Pp.filter(x => x.pdv <= x.pMin && x.blDs?.[0]?.qmd === 0).length / Pp.length, 2), up_share: R(Pp.filter(x => x.pcl > x.py).length / Pp.length, 2), source: 'دیده‌بان بازار' }; }\n    else { const rows = await Promise.all(Object.entries(REFINERS).filter(([k]) => k !== me).map(async ([, ics]) => { for (const pic of ics) { const j = await J(`ClosingPrice/GetClosingPriceDaily/${pic}/${last.d}`, 2, 10000); const r = j?.closingPriceDaily; if (r && r.qTotTran5J > 0) return r; } return null; }));\n      const Pp = rows.filter(Boolean), q = r => r.pDrCotVal / r.priceYesterday - 1;\n      if (Pp.length) peers = { n: Pp.length, buy_queue_share: R(Pp.filter(r => q(r) >= limUp - 0.0015 && r.pDrCotVal >= r.priceMax).length / Pp.length, 2),\n        sell_queue_share: R(Pp.filter(r => q(r) <= -(limDn - 0.0015) && r.pDrCotVal <= r.priceMin).length / Pp.length, 2), up_share: R(Pp.filter(r => r.pClosing > r.priceYesterday).length / Pp.length, 2), source: 'تاریخچهٔ همتایان در تاریخ آزمون' }; }\n    out.group.refiner_peers_today = peers;\n  }\n\n  // ---------- 10) today's intraday (5-minute bars) — with timeout, optional\n  const tr = opts.lite ? null : await J(REPLAY ? `Trade/GetTradeHistory/${ic}/${last.d}/false` : `Trade/GetTrade/${ic}`, 2, 12000); const T5 = {};\n  if (!tr && !opts.lite) out.warnings.push('دادهٔ معاملات درون‌روز امروز نیامد (timeout)');\n  (tr?.trade || tr?.tradeHistory || []).filter(x => !x.canceled).sort((a, b) => a.nTran - b.nTran).forEach(x => { const s = Math.floor(x.hEven / 10000) * 60 + Math.floor(x.hEven / 100 % 100); const k = Math.max(0, Math.floor((s - 540) / 5)); const b = T5[k] ||= { o: x.pTran, h: x.pTran, l: x.pTran, c: x.pTran, v: 0, val: 0 }; b.h = Math.max(b.h, x.pTran); b.l = Math.min(b.l, x.pTran); b.c = x.pTran; b.v += x.qTitTran; b.val += x.qTitTran * x.pTran; });\n  const ks = Object.keys(T5).map(Number).sort((a, b) => a - b); const hm = k => `${String(9 + Math.floor(k * 5 / 60)).padStart(2, '0')}:${String(k * 5 % 60).padStart(2, '0')}`;\n  if (ks.length) { const vw = ks.reduce((s, k) => s + T5[k].val, 0) / ks.reduce((s, k) => s + T5[k].v, 0); const lastP = T5[ks[ks.length - 1]].c;\n    const pAt = m => { const k = ks.filter(k => k < m / 5); return k.length ? T5[k[k.length - 1]].c : null; };\n    out.intraday_today = { first_trade_time: hm(ks[0]), open: T5[ks[0]].o, last: lastP, vwap: R(vw, 0), last_vs_vwap_pct: R(100 * (lastP / vw - 1), 2),\n      ret_first30m_pct: pAt(30) ? R(100 * (pAt(30) / T5[ks[0]].o - 1), 2) : null, ret_last30m_pct: pAt(180) ? R(100 * (lastP / pAt(180) - 1), 2) : null,\n      bars_5m: ks.slice(-12).map(k => [hm(k), T5[k].o, T5[k].h, T5[k].l, T5[k].c, T5[k].v]) }; }\n\n  // ---------- 11) rubric (v1 points; indicator rows only when history allows) + regime calibration\n  const f = out.flows || {}, d = ind, P = {};\n  // v2 points: re-estimated on 1392-1405 (13 years, 62 group-44 stocks); rows without a stable effect were removed\n  const pw = f.buyer_power_reliable ? f.buyer_power_today : null;\n  const smart = f.per_capita_buy_vs_60d_median > 2 && pw > 1.5;\n  P.smart_retail_money = smart ? 2 : 0;\n  P.buyer_power_gt2 = (!smart && pw > 2) ? 1 : 0;\n  P.buyer_power_lt05 = (pw !== null && pw < 0.5) ? -1 : 0;\n  P.buy_queue_close = d.closed_at_upper_limit ? 2 : 0;\n  P.sell_queue_close = d.closed_at_lower_limit ? -2 : 0;\n  P.strong_finish = d.last_minus_close_pct > 1 ? 2 : 0;\n  P.weak_finish = d.last_minus_close_pct < -1 ? -2 : 0;\n  P.rsi_below_30 = (d.rsi14 !== null && d.rsi14 < 30) ? -2 : 0;\n  P.above_upper_bollinger = (d.bollinger_pctb !== null && d.bollinger_pctb > 1) ? 1 : 0;\n  const sub = Object.values(P).reduce((s, x) => s + x, 0);\n  // context only (no points: unstable or not significant over 13 years)\n  const strat = ['strategic_social_security', 'strategic_parent_or_peer', 'pension', 'investment_co'];\n  const context = { indiv_outflow_5d_gt10pct: f.indiv_net_5d_pct < -0.10, indiv_inflow_today_gt20pct: f.indiv_net_today_pct_of_value > 0.20,\n    new_20d_low: !!(d.donchian20_low && C[t] < d.donchian20_low), new_20d_high_with_volume: !!(d.donchian20_high && C[t] > d.donchian20_high && d.vol_ratio_20 > 1.5),\n    adx_downtrend: d.adx14 !== null && d.adx14 > 25 && d.minus_di > d.plus_di, group_flow_ex_self: out.group.indiv_net_flow_pct_of_value_ex_self,\n    strategic_holder_buy_5d: hd.some(x => strat.includes(x.type) && x.delta_shares > 0 && Math.abs(x.value_billion_toman) >= 1),\n    strategic_holder_sell_5d: hd.some(x => strat.includes(x.type) && x.delta_shares < 0 && Math.abs(x.value_billion_toman) >= 1),\n    close_above_last_swing_high: out.chart.close_above_last_swing_high, close_below_last_swing_low: out.chart.close_below_last_swing_low };\n  // calibration 1392-1405, tradable days only: [n, P(up 1d), P(up 3d), P(up 5d), P(up 10d), median 5d %, avg gain 5d %, avg loss 5d %]\n  const CAL = { hot: { '<=-4': [30, .10, .23, .20, .27, -3.3, 3.4, -5.6], '-3..-2': [2575, .25, .52, .55, .58, 0.8, 6.7, -4.8], '-1..+1': [9398, .51, .54, .57, .61, 1.0, 6.4, -4.2], '+2..+3': [2332, .76, .56, .57, .60, 1.1, 7.0, -4.5], '>=+4': [141, .87, .72, .74, .78, 4.4, 10.1, -3.5], ALL: [14476, .50, .54, .57, .61, 1.0, 6.6, -4.4] },\n    mid: { '<=-4': [1313, .11, .26, .31, .40, -0.6, 3.3, -2.3], '-3..-2': [9771, .23, .38, .41, .45, -0.5, 5.6, -3.0], '-1..+1': [29601, .44, .46, .48, .50, -0.1, 5.8, -3.1], '+2..+3': [5726, .73, .54, .54, .54, 0.3, 9.9, -3.3], '>=+4': [441, .81, .60, .58, .58, 0.5, 5.2, -3.1], ALL: [46852, .43, .45, .47, .49, -0.2, 6.3, -3.0] },\n    cold: { '<=-4': [535, .18, .36, .38, .46, -0.6, 4.1, -2.5], '-3..-2': [2789, .31, .42, .43, .48, -0.5, 4.6, -3.4], '-1..+1': [5497, .49, .46, .47, .49, -0.2, 5.2, -4.0], '+2..+3': [1177, .76, .49, .50, .49, 0.0, 5.9, -4.4], '>=+4': [65, .77, .62, .57, .54, 1.9, 7.2, -4.9], ALL: [10063, .45, .45, .46, .48, -0.3, 5.1, -3.8] } };\n  const band = s => s <= -4 ? '<=-4' : s <= -2 ? '-3..-2' : s <= 1 ? '-1..+1' : s <= 3 ? '+2..+3' : '>=+4';\n  const cal = CAL[regime][band(sub)], base = CAL[regime].ALL;\n  const newIPO = ipoIdx >= 0 && hist <= 120;\n  out.rubric = { version: 2, points: P, subtotal_without_codal: sub, band_without_codal: band(sub), regime, context,\n    calibration_for_this_band: { n: cal[0], p_up_1d: cal[1], p_up_3d: cal[2], p_up_5d: cal[3], p_up_10d: cal[4], median_5d_pct: cal[5], avg_gain_5d_pct: cal[6], avg_loss_5d_pct: cal[7] },\n    base_rate_this_regime: { p_up_1d: base[1], p_up_5d: base[3], median_5d_pct: base[5] },\n    edge_vs_base_5d_pp: Math.round(100 * (cal[3] - base[3])),\n    applicable: !newIPO, calibrated_on_group: '44', calibration_applies_to_this_group: SEC === '44',\n    note: newIPO ? 'سهم تازه‌عرضه است: جدول کالیبراسیون قابل‌اتکا نیست؛ از بلوک ipo استفاده کن' : 'امتیاز کدال را اضافه کن و باند را دوباره تعیین کن؛ لبه = اختلاف با نرخ پایهٔ همین رژیم',\n    tradability: d.closed_at_upper_limit ? 'در صف خرید بسته شده — خرید عملاً ممکن نیست' : d.closed_at_lower_limit ? 'در صف فروش بسته شده — فروش عملاً ممکن نیست' : 'قابل معامله' };\n\n  // ---------- 12) Codal letters from tsetmc (no codal.ir rate limit): recent list + the two Codal rows of the v2.4 score\n  const clk = s => { const m = String(s || '').match(/(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null; };\n  const at1230 = dEv => { const x = String(dEv); return Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8), 12, 30); };\n  const nextOpen = REPLAY ? (out.replay.next_session_dEven ? at1230(out.replay.next_session_dEven) - 4 * 3600e3 : at1230(last.d) + 20 * 3600e3) : Infinity;\n  const cdl = await J(`Codal/GetPreparedDataByInsCode/${REPLAY ? 5000 : 60}/${ic}`, 2, 15000);\n  const CL = (cdl?.preparedData || []).map(x => ({ t: clk(x.publishDateTime_Gregorian), when: String(x.publishDateTime_Gregorian || '').replace('T', ' ').slice(0, 16), type: codalClassify(x.title), title: String(x.title || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک') }))\n    .filter(x => x.t && x.t <= nextOpen).sort((a, b) => b.t - a.t);\n  const tClose = at1230(last.d), prevClose = t ? at1230(D[t - 1].d) : tClose - 864e5;\n  const cdRows = { capinc_night: CL.some(x => x.t > tClose && ['CAPINC_PROPOSAL', 'CAPINC_STEP', 'EGM'].includes(x.type)), interim_today: CL.some(x => x.t > prevClose && x.t <= tClose && x.type === 'INTERIM_FS') };\n  out.codal_recent = cdl ? { source: 'فهرست کدال در tsetmc', letters: CL.slice(0, 15).map(x => [x.when, x.type, x.title]), v24_rows: cdRows,\n    note: 'زمان‌ها به وقت تهران. «بعد از جلسه» یعنی بعد از ۱۲:۳۰ روز آخر و قبل از بازگشایی بعدی.' } : { error: 'فهرست کدال از tsetmc نیامد' };\n\n  // ---------- 13) next-session forecast (v2.4): score and table estimated on the 11 refiners, 1392-1405 (research/ in the repo)\n  {\n    const V24 = { strong: 3, weak: -3, buyq: 3, sellq: -2, smart: 2, buyq_lowvol: 2, buyq_run2: 1, sellq_lowvol: -1, sellq_run2: -1, rsi30: -1, boll: 1, bp05: -1,\n      grp_buyq50: 1, grp_sellq50: -1, total_dn1: 1, drop_noq: 1, vol_low: -1, wide_range: -1, capinc_night: 1, interim_today: -1 };\n    const vr = d.vol_ratio_20, pr = out.group.refiner_peers_today, lmc = d.last_minus_close_pct, uq = !!d.closed_at_upper_limit, dq = !!d.closed_at_lower_limit;\n    const on = { strong: lmc > 1, weak: lmc < -1, buyq: uq, sellq: dq, smart: P.smart_retail_money > 0, buyq_lowvol: uq && vr !== null && vr < 0.7, buyq_run2: uq && d.buy_queue_streak_before_today >= 2,\n      sellq_lowvol: dq && vr !== null && vr < 0.7, sellq_run2: dq && d.sell_queue_streak_before_today >= 2, rsi30: P.rsi_below_30 < 0, boll: P.above_upper_bollinger > 0, bp05: P.buyer_power_lt05 < 0,\n      grp_buyq50: !!pr && pr.buy_queue_share >= 0.5, grp_sellq50: !!pr && pr.sell_queue_share >= 0.5, total_dn1: (out.group.total_index?.r1 ?? 0) < -0.01,\n      drop_noq: d.chg_close_pct < -2 && !dq, vol_low: vr !== null && vr < 0.5, wide_range: limUp >= 0.06, capinc_night: cdRows.capinc_night, interim_today: cdRows.interim_today };\n    const pts = {}; let sc = 0; for (const k of Object.keys(V24)) if (on[k]) { pts[k] = V24[k]; sc += V24[k]; }\n    const bd = sc <= -6 ? '<=-6' : sc <= -4 ? '-5..-4' : sc <= -2 ? '-3..-2' : sc <= 1 ? '-1..+1' : sc <= 3 ? '+2..+3' : sc <= 5 ? '+4..+5' : '>=+6';\n    // [n, up>0.5%, flat ±0.5%, down<-0.5%, up(>0)%, median next-day %, median gap %, next buy queue %, next sell queue %,\n    //  median from today's LAST price to tomorrow's پایانی % (rows not in a buy queue), median from the last price to 5 sessions later %, up in 5 %, median 5-day %]\n    const TAB = { '<=-6': [1621, 6, 39, 55, 9, -0.67, -2.98, 4, 55, 1.12, 0.29, 22, -2.08], '-5..-4': [3318, 11, 38, 51, 17, -0.54, -1.66, 4, 18, 0.98, 0.62, 33, -1.18],\n      '-3..-2': [4795, 18, 36, 46, 29, -0.39, -0.56, 5, 12, 0.14, 0.00, 41, -0.63], '-1..+1': [12017, 34, 34, 33, 48, 0.00, 0.14, 8, 5, 0.03, 0.18, 51, 0.14],\n      '+2..+3': [2835, 56, 27, 17, 71, 0.76, 1.59, 17, 4, -0.40, 0.00, 62, 1.27], '+4..+5': [1911, 69, 15, 16, 78, 2.03, 2.76, 35, 6, -0.32, 0.05, 68, 2.86],\n      '>=+6': [2662, 84, 9, 7, 90, 2.94, 2.99, 61, 3, -0.14, 1.05, 80, 6.38] };\n    const T = TAB[bd], call = T[1] >= 50 ? 'UP' : T[3] >= 45 ? 'DOWN' : 'NONE';\n    const adj7 = (d.adjustments_last_year || []).some(a => (Date.UTC(+String(last.d).slice(0, 4), +String(last.d).slice(4, 6) - 1, +String(last.d).slice(6, 8)) - Date.UTC(+String(a[0]).slice(0, 4), +String(a[0]).slice(4, 6) - 1, +String(a[0]).slice(6, 8))) / 864e5 <= 7);\n    const sit = newIPO ? 'A' : adj7 ? 'B' : hist < 60 ? 'C' : 'D';\n    const flags = [];\n    if (limUp <= 0.02) flags.push(`دامنهٔ نوسان باریک (±${Math.round(limUp * 100)}٪): در آزمون ۵۶٪ جلسه‌های بعد بی‌حرکت (±۰٫۵٪) بود`);\n    if (REPLAY && out.replay.next_session_dEven) { const gd = (at1230(out.replay.next_session_dEven) - tClose) / 864e5; if (gd >= 4) flags.push(`فاصلهٔ ${Math.round(gd)} روزه تا جلسهٔ بعد: خطای جهت در این حالت ۲۰٪ بود (در برابر ۱۳٪)`); }\n    if (uq) flags.push(`صف خرید: فردا دوباره صف خرید ${d.buy_queue_streak_before_today >= 4 ? '۷۸' : d.buy_queue_streak_before_today >= 2 ? '۷۲' : vr !== null && vr > 1.5 ? '۴۱' : '۴۱ تا ۵۲'}٪، صف فروش حدود ۴٪ (با افت شبانهٔ دلار بیش از ۱٪: ۱۲٪)`);\n    if (dq) flags.push(`صف فروش: فردا دوباره صف فروش ${d.sell_queue_streak_before_today >= 2 ? '۶۷' : vr !== null && vr > 1.5 ? '۴۱' : '۳۹ تا ۴۹'}٪، صف خرید حدود ۷٪ (در ۱۴۰۳ تا ۱۴۰۵: ۱۲٪)`);\n    out.next_session = { version: '2.4', applies: SEC === '23' && sit === 'D', situation: sit, calibrated_on: '۱۱ نماد پالایشی گروه ۲۳، ۱۳۹۲ تا ۱۴۰۵ (حدود ۲۹ هزار روز-نماد)',\n      points: pts, score: sc, band: bd, call, prob: { up: T[1] / 100, flat: T[2] / 100, down: T[3] / 100, up_any: T[4] / 100 }, n: T[0],\n      expected: { next_close_median_pct: T[5], open_gap_median_pct: T[6], next_buy_queue_pct: T[7], next_sell_queue_pct: T[8], from_last_price_to_next_close_median_pct: T[9],\n        from_last_price_to_5d_median_pct: T[10], up_in_5d_pct: T[11], five_day_median_pct: T[12], round_trip_cost_pct: 1.25 },\n      can_buy_now: !uq, can_sell_now: !dq, confidence_flags: flags,\n      walk_forward: 'آزمون خارج از نمونه (هر سال فقط با سال‌های قبل): وقتی پیش‌بینی جهت داد و حرکت بی‌حرکت نبود، ۸۱ تا ۸۵٪ درست بود؛ خلاف جهت ۱۰ تا ۱۵٪؛ بی‌حرکت ۶ تا ۳۸٪ (۱۴۰۳ تا ۱۴۰۵)',\n      note: SEC === '23' ? (sit === 'D' ? 'قیمت «پایانی» یعنی میانگین وزنی روز؛ بخش بزرگ این پیش‌بینی از فاصلهٔ آخرین قیمت امروز با پایانی می‌آید و قبل از فردا در قیمت هست. از آخرین قیمت امروز، حرکت مورد انتظار در همهٔ ناحیه‌ها از هزینهٔ رفت‌وبرگشت ۱٫۲۵٪ کمتر است.' : 'موقعیت غیرعادی (A/B/C): جدول معتبر نیست')\n        : 'این جدول روی پالایشی‌ها برآورد شده؛ برای این گروه آزموده نشده. برای جلسهٔ بعد از rubric.calibration_for_this_band.p_up_1d استفاده کن.' };\n  }\n  return out;\n}\n\n/* ------------------------------------------------------------------------\n   B1) petroReplay(symbol, date) — the replay test: \"forecast for date X, check it on the next session\".\n   snapshot = petroSnapshot as of the close of X (nothing after X is used, only the date of the next session);\n   outcome  = what really happened next; check = the next-session call and the v2.3 decision against it,\n   with automatic reasons for a miss. Write the sheet from `snapshot` first, then read outcome/check (blind test). */\nasync function petroReplay(symbol, date, opts = {}) {\n  const snap = await petroSnapshot(symbol, { ...opts, asOf: date });\n  if (!snap || snap.error) return { symbol, as_of: date, error: (snap && snap.error) || 'snapshot failed' };\n  const BASE = 'https://cdn.tsetmc.com/api/', cache = opts.cache || null;\n  const J = async u => { if (cache && cache.has(u)) return cache.get(u);\n    for (let i = 0; i < 3; i++) { try { const r = await fetch(BASE + u); if (r.ok) { const j = await r.json(); if (cache) cache.set(u, j); return j; } } catch (e) { /* retry */ } await new Promise(r => setTimeout(r, 800 * (i + 1))); } return null; };\n  const R = (x, dd = 2) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** dd) / 10 ** dd;\n  const jalOf = dEv => { const x = String(dEv); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8)))).replace(/[^\\d/]/g, ''); };\n  const utc = (dEv, hh = 0, mm = 0) => { const x = String(dEv); return Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8), hh, mm); };\n  const ic = snap.instrument.insCode, d0 = snap.replay.session_used_dEven;\n  const dl = await J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`);\n  const rows = (dl?.closingPriceDaily || []).filter(r => r.qTotTran5J > 0).sort((a, b) => a.dEven - b.dEven);\n  const i0 = rows.findIndex(r => r.dEven === d0);\n  if (i0 < 0 || i0 === rows.length - 1) return { symbol, as_of: date, snapshot: snap, error: i0 < 0 ? 'روز آزمون در سابقه پیدا نشد' : 'هنوز جلسهٔ بعدی نیامده' };\n  // adjustment from day X forward (a dividend or capital increase after X must not look like a fall)\n  const fac = []; let fc = 1; for (let i = rows.length - 1; i >= i0; i--) { fac[i] = fc; if (i > i0) { let q = rows[i].priceYesterday / rows[i - 1].pClosing; if (q > 0.995 && q < 1.005) q = 1; fc *= q; } }\n  const C = i => rows[i].pClosing * fac[i], r0 = rows[i0], n1 = rows[i0 + 1];\n  const ret = k => i0 + k < rows.length ? C(i0 + k) / C(i0) - 1 : null, lastX = r0.pDrCotVal * fac[i0];\n  const fromLast = k => i0 + k < rows.length ? C(i0 + k) / lastX - 1 : null;\n  const th = await J(`MarketData/GetStaticThreshold/${ic}/${n1.dEven}`); const rec = (th?.staticThreshold || []).filter(x => x.dEven === n1.dEven).sort((a, b) => a.hEven - b.hEven).pop();\n  const nq = rec ? (n1.pDrCotVal >= rec.psGelStaMax ? 'buy_queue' : n1.pDrCotVal <= rec.psGelStaMin ? 'sell_queue' : 'none') : 'unknown';\n  const nLim = rec ? [R(1 - rec.psGelStaMin / n1.priceYesterday, 3), R(rec.psGelStaMax / n1.priceYesterday - 1, 3)] : null;\n  const ixNext = async code => { const h = await J('Index/GetIndexB2History/' + code); const a = (h?.indexB2 || []).sort((x, y) => x.dEven - y.dEven); const k = a.findIndex(x => x.dEven === d0);\n    return k >= 0 && k + 1 < a.length && a[k + 1].dEven === n1.dEven ? a[k + 1].xNivInuClMresIbs / a[k].xNivInuClMresIbs - 1 : null; };\n  const [gN, tN] = await Promise.all([ixNext(snap.group.group_index_code), ixNext('32097828799138957')]);\n  const cdl = await J(`Codal/GetPreparedDataByInsCode/5000/${ic}`);\n  const clk = x => { const m = String(x || '').match(/(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null; };\n  const news = (cdl?.preparedData || []).map(x => ({ t: clk(x.publishDateTime_Gregorian), type: codalClassify(x.title), title: String(x.title || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک'), when: String(x.publishDateTime_Gregorian || '').replace('T', ' ').slice(0, 16) }))\n    .filter(x => x.t && x.t > utc(d0, 12, 30) && x.t <= utc(n1.dEven, 12, 30));\n  const r1 = ret(1), gap = n1.priceFirst * fac[i0 + 1] / C(i0) - 1, gapDays = Math.round((utc(n1.dEven) - utc(d0)) / 864e5);\n  const outcome = { next_session: jalOf(n1.dEven), days_until_next_session: gapDays, next_close_pct: R(100 * r1), open_gap_pct: R(100 * gap),\n    next_high_pct: R(100 * (n1.priceMax * fac[i0 + 1] / C(i0) - 1)), next_low_pct: R(100 * (n1.priceMin * fac[i0 + 1] / C(i0) - 1)), next_queue: nq, next_price_limits_pct: nLim,\n    from_last_price_to_next_close_pct: R(100 * fromLast(1)), ret_3d_pct: R(100 * ret(3)), ret_5d_pct: R(100 * ret(5)), from_last_price_to_5d_pct: R(100 * fromLast(5)),\n    group_index_next_pct: R(100 * gN), total_index_next_pct: R(100 * tN), adjusted_next_day: Math.abs(n1.priceYesterday / r0.pClosing - 1) > 0.005,\n    news_until_next_close: news.slice(0, 8).map(x => [x.when, x.type, x.title]) };\n  // check\n  const cls = x => x === null ? null : x > 0.005 ? 'UP' : x < -0.005 ? 'DOWN' : 'FLAT';\n  const ns = snap.next_session || {}, real = cls(r1), side = ns.call === 'UP' ? 1 : ns.call === 'DOWN' ? -1 : 0;\n  const verdict = !side ? 'NO_CALL' : real === 'FLAT' ? 'FLAT' : (real === ns.call ? 'RIGHT' : 'WRONG');\n  const tags = [];\n  if (verdict === 'WRONG' || verdict === 'FLAT') {\n    const opp = x => x !== null && x * side < 0;\n    if (opp(gN) && Math.abs(gN) >= 0.01) tags.push('GROUP_MOVE'); if (opp(tN) && Math.abs(tN) >= 0.01) tags.push('MARKET_MOVE'); if (opp(gap) && Math.abs(gap) >= 0.015) tags.push('GAP');\n    const dq = snap.daily || {}; if ((dq.closed_at_upper_limit && side > 0 && nq !== 'buy_queue') || (dq.closed_at_lower_limit && side < 0 && nq !== 'sell_queue')) tags.push('QUEUE_FLIP');\n    if (nLim && dq.price_limits_pct && Math.abs(nLim[1] - dq.price_limits_pct[1]) > 0.004) tags.push('RANGE_CHANGE'); if (gapDays >= 4) tags.push('LONG_BREAK'); if (news.length) tags.push('NEWS');\n    if (outcome.adjusted_next_day) tags.push('ADJUSTMENT'); if (verdict === 'FLAT') tags.push('SMALL_MOVE'); if (!tags.length) tags.push('OWN');\n  }\n  const rb = snap.rubric || {}, cal = rb.calibration_for_this_band || {}, edge = rb.edge_vs_base_5d_pp;\n  const dec = !rb.applicable ? 'NA' : (edge >= 8 && cal.p_up_5d >= 0.55 && !(snap.daily || {}).closed_at_upper_limit) ? 'BUY' : (edge <= -8 && cal.p_up_5d <= 0.40 && !(snap.daily || {}).closed_at_lower_limit) ? 'SELL' : 'NO_EDGE';\n  const r5 = ret(5);\n  const check = { next_session_call: ns.call || null, next_session_band: ns.band || null, real_next: real, verdict, reasons: tags,\n    v23_decision: dec, v23_decision_right_5d: dec === 'BUY' ? (r5 === null ? null : r5 > 0) : dec === 'SELL' ? (r5 === null ? null : r5 <= 0) : null,\n    one_day_trade_from_last_net_pct: ns.can_buy_now === false || fromLast(1) === null ? null : R(100 * fromLast(1) - 1.25),\n    reason_help: { GROUP_MOVE: 'کل پالایشی‌ها خلاف جهت رفتند (≥۱٪)', MARKET_MOVE: 'شاخص کل خلاف جهت رفت (≥۱٪)', GAP: 'گپ بازگشایی خلاف جهت (≥۱٫۵٪)', QUEUE_FLIP: 'صف امروز فردا شکست',\n      RANGE_CHANGE: 'دامنهٔ نوسان عوض شد', LONG_BREAK: 'فاصلهٔ ۴ روز یا بیشتر تا جلسهٔ بعد', NEWS: 'اطلاعیهٔ کدال بعد از پایان جلسه', ADJUSTMENT: 'تعدیل قیمت (مجمع/افزایش سرمایه)', SMALL_MOVE: 'حرکت کمتر از ±۰٫۵٪', OWN: 'علت بیرونی پیدا نشد؛ حرکت خود سهم' } };\n  return { symbol, as_of: snap.replay.as_of, session_used: snap.replay.session_used, snapshot: snap, outcome, check };\n}\n\n/* B2) petroReplayRange(symbol, from, to) — petroReplay for every session between two dates (max 60), with a summary.\n   Lite mode (no holders, no intraday); histories are fetched once and shared. */\nasync function petroReplayRange(symbol, from, to, opts = {}) {\n  const lat = x => String(x || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).trim().split(/[/-]/).map((p, i) => i ? p.padStart(2, '0') : p).join('/');\n  const F = lat(from), T = lat(to), cache = new Map(), max = opts.max || 60;\n  const first = await petroReplay(symbol, T, { lite: true, cache });\n  if (first.error && !first.snapshot) return first;\n  const ic = first.snapshot.instrument.insCode, dl = cache.get(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`);\n  const jalOf = dEv => { const x = String(dEv); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8)))).replace(/[^\\d/]/g, ''); };\n  const days = (dl?.closingPriceDaily || []).filter(r => r.qTotTran5J > 0).map(r => jalOf(r.dEven)).filter(j => j >= F && j <= T).sort().slice(-max);\n  const rows = [];\n  for (const j of days) { const x = j === first.as_of ? first : await petroReplay(symbol, j, { lite: true, cache });\n    if (x.error) { rows.push({ date: j, error: x.error }); continue; }\n    const ns = x.snapshot.next_session || {};\n    rows.push({ date: j, next: x.outcome.next_session, score: ns.score, band: ns.band, call: ns.call, p: ns.prob, real_next_pct: x.outcome.next_close_pct, gap_pct: x.outcome.open_gap_pct,\n      from_last_pct: x.outcome.from_last_price_to_next_close_pct, verdict: x.check.verdict, reasons: x.check.reasons, v23: x.check.v23_decision, v23_right_5d: x.check.v23_decision_right_5d, ret_5d_pct: x.outcome.ret_5d_pct }); }\n  const ok = rows.filter(r => !r.error), calls = ok.filter(r => r.verdict !== 'NO_CALL'), right = calls.filter(r => r.verdict === 'RIGHT').length, wrong = calls.filter(r => r.verdict === 'WRONG').length, flat = calls.filter(r => r.verdict === 'FLAT').length;\n  const why = {}; calls.filter(r => r.verdict === 'WRONG').forEach(r => r.reasons.forEach(t => { why[t] = (why[t] || 0) + 1; }));\n  return { symbol, from: F, to: T, sessions: ok.length, rows,\n    summary: { calls: calls.length, right, wrong, flat, right_pct_excl_flat: right + wrong ? Math.round(100 * right / (right + wrong)) : null, reasons_of_wrong: why,\n      note: 'RIGHT/WRONG = جهت جلسهٔ بعد (پایانی به پایانی)؛ FLAT = حرکت کمتر از ±۰٫۵٪. نتیجهٔ چند روز محدود نوسان زیادی دارد؛ آزمون ۱۴ ساله در بلوک next_session.walk_forward است.' } };\n}\n\n/* ------------------------------------------------------------------------\n   B) petroEvaluate(logs): logs = [{date:'1405/07/04', symbol:'تابان', decision:'NO_BUY_REDUCE', ref_price:19990}, ...]\n   (date = day the call was made, ref_price = that day's closing price). Run on tsetmc.com.\n   Returns realised moves after 1, 3, 5, 10, 20 trading days and whether the call direction was right. */\nasync function petroEvaluate(logs) {\n  const BASE = 'https://cdn.tsetmc.com/api/';\n  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').trim();\n  const g2j = d => { const s = String(d); const dt = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\\d/]/g, ''); };\n  const res = [];\n  for (const L of logs) {\n    const s = await (await fetch(BASE + 'Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(L.symbol)))).json();\n    const ins = (s.instrumentSearch || []).find(x => ar(x.lVal18AFC) === ar(L.symbol) && [1, 2, 4].includes(x.flow)); if (!ins) { res.push({ ...L, error: 'not found' }); continue; }\n    const d = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceDailyList/${ins.insCode}/120`)).json()).closingPriceDaily.filter(r => r.qTotTran5J > 0).sort((a, b) => a.dEven - b.dEven);\n    const lv = (await (await fetch(BASE + `ClosingPrice/GetClosingPriceInfo/${ins.insCode}`)).json()).closingPriceInfo || {};   // today's row is not in the history until the evening\n    if (lv.finalLastDate > (d[d.length - 1]?.dEven || 0) && lv.qTotTran5J > 0) d.push({ dEven: lv.finalLastDate, pClosing: lv.pClosing, priceYesterday: lv.priceYesterday, qTotTran5J: lv.qTotTran5J });\n    const i0 = d.findIndex(r => g2j(r.dEven) === L.date); if (i0 < 0) { res.push({ ...L, error: 'date not found' }); continue; }\n    const fac = []; let f = 1; for (let i = d.length - 1; i >= i0; i--) { fac[i] = f; if (i > i0) { let q = d[i].priceYesterday / d[i - 1].pClosing; if (q > 0.995 && q < 1.005) q = 1; f *= q; } }\n    const out = { ...L, trading_days_since: d.length - 1 - i0 };\n    for (const k of [1, 3, 5, 10, 20]) { const j = i0 + k; if (j < d.length) out[`ret_${k}d_pct`] = Math.round(10000 * (d[j].pClosing * fac[j] / (d[i0].pClosing * fac[i0]) - 1)) / 100; }\n    const bull = /BUY/.test(L.decision) && !/NO_BUY/.test(L.decision), bear = /SELL|REDUCE|NO_BUY/.test(L.decision);\n    for (const k of [1, 5, 20]) if (out[`ret_${k}d_pct`] !== undefined) out[`right_${k}d`] = bull ? out[`ret_${k}d_pct`] > 0 : bear ? out[`ret_${k}d_pct`] <= 0 : null;\n    res.push(out);\n  }\n  return res;\n}\n\n/* ------------------------------------------------------------------------ */\n// letter type from its title (used by codalSnapshot and the daily report)\nfunction codalClassify(t) {\n  t = String(t || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');\n    if (/افشای اطلاعات/.test(t)) { const m = t.match(/\\((.*)\\)\\s*منتهی/); const x = m ? m[1] : t;\n      if (/دیوان|دادنامه|شورای رقابت|ابطال مصوب|ماده ۹۱/.test(x)) return 'REGULATORY_COURT';\n      if (/سرویس/.test(x)) return 'UTILITY_RATES';\n      if (/گاز|خوراک|مواد اولیه|بهای تمام شده/.test(x)) return 'FEED_GAS_PRICE';\n      if (/توقف|تعمیرات|قطع|محدودیت/.test(x)) return 'SHUTDOWN';\n      if (/شروع مجدد|راه.?اندازی مجدد|آغاز فرآیند تولید|بهره.?برداری/.test(x)) return 'RESTART';\n      if (/قرارداد|مزایده|مناقصه/.test(x)) return 'CONTRACT';\n      if (/دعوی|دادگاه/.test(x)) return 'LEGAL';\n      return 'MATERIAL_OTHER'; }\n    const rules = [['MONTHLY', /گزارش فعالیت ماهانه/], ['PORTFOLIO_NAV', /صورت وضعیت پورتفوی/], ['FS_EXPLAIN', /توضیحات در خصوص اطلاعات و صورت/], ['INTERIM_FS', /میاندوره/], ['ANNUAL_FS', /^صورت.?های مالی/],\n      ['AGM_DECISION', /تصمیمات مجمع عمومی عادی سالیانه/], ['AGM_NOTICE', /دعوت به مجمع عمومی عادی سالیانه/], ['DIV_SCHEDULE', /زمانبندی پرداخت سود/],\n      ['CAPINC_PROPOSAL', /پیشنهاد هیئت مدیره.*افزایش سرمایه/], ['CAPINC_STEP', /افزایش سرمایه/], ['EGM', /مجمع عمومی فوق العاده/], ['RUMOR_CLARIFY', /شفاف سازی در خصوص شایعه/],\n      ['BOARD_CEO_CHANGE', /هیئت مدیره.*مدیر عامل|مدیر عامل/], ['HALT', /تعلیق نماد|توقف نماد/]];\n    for (const [k, rx] of rules) if (rx.test(t)) return k; return 'OTHER';\n}\n\nasync function codalSnapshot(symbol, days = 120, opts = {}) {\n  const fa = s => (s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();\n  const sleep = ms => new Promise(r => setTimeout(r, ms));\n  const jal = dt => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\\d/]/g, '');\n  const toDig = s => (s || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));\n  const q = (sym, from, to, page) => 'https://search.codal.ir/api/search/v2/q?&Audit=true&AuditorRef=-1&Category=-1&Childs=true&CompanyState=-1&CompanyType=-1&Consolidatable=true&IsNotAudited=false&Length=-1&LetterType=-1&Mains=true&NotAudited=true&NotConsolidatable=true&Publisher=false&TracingNo=-1&search=true&PageNumber=' + page + '&Symbol=' + encodeURIComponent(sym) + '&FromDate=' + encodeURIComponent(from) + '&ToDate=' + encodeURIComponent(to);\n  // search.codal.ir rate-limits bursts (HTTP 429): back off and space the calls\n  const J = async u => { for (let i = 0; i < 5; i++) { const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 20000);\n      try { const r = await fetch(u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); if (r.status === 429) { await sleep(4000 * 2 ** i); continue; } } catch (e) { clearTimeout(tm); } await sleep(1500 * (i + 1)); } return null; };\n  const classify = codalClassify;\n  // as-of (replay): the window ends on the test date ('1403/07/07')\n  let now = new Date();\n  if (opts.asOf) { const want = toDig(String(opts.asOf)).split(/[/-]/).map((p, i) => i ? p.padStart(2, '0') : p).join('/'); let dt = new Date(now);\n    for (let k = 0; k < 9000 && jal(dt) > want; k++) dt = new Date(dt - 864e5); now = dt; }\n  const from = jal(new Date(now - days * 864e5)), to = jal(now);\n  const letters = []; const first = await J(q(fa(symbol), from, to, 1));\n  if (!first) return { symbol, error: 'جست‌وجوی کدال پاسخ نداد (احتمالاً 429)؛ یک دقیقه بعد دوباره اجرا کن. نتیجهٔ خالی را «بدون اطلاعیه» تفسیر نکن' };\n  letters.push(...(first?.Letters || []));\n  for (let p = 2; p <= (first?.Page || 1); p++) { await sleep(500); const j = await J(q(fa(symbol), from, to, p)); letters.push(...(j?.Letters || [])); }\n  const L = letters.map(x => ({ type: classify(x.Title), title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url, tracing: x.TracingNo }));\n  const monthly = [];\n  for (const m of L.filter(x => x.type === 'MONTHLY' && !/اصلاحیه/.test(x.title)).slice(0, 3)) {\n    try { const h = await (await fetch(m.url)).text(); const s = h.match(/var datasource = (\\{.*?\\});\\s*\\n/s); if (!s) continue; const ds = JSON.parse(s[1]);\n      for (const sh of ds.sheets || []) for (const tb of sh.tables || []) { if (!/ProductionAndSales|Sales/i.test(tb.aliasName || '')) continue;\n        const tot = Math.max(...tb.cells.filter(c => (c.value || '').trim() === 'جمع').map(c => c.rowSequence)); if (!isFinite(tot)) continue;\n        const row = {}; tb.cells.filter(c => c.rowSequence === tot).forEach(c => row[c.columnSequence] = c.value);\n        const sub = {}; tb.cells.filter(c => c.rowSequence === 2).forEach(c => sub[c.columnSequence] = c.value || '');\n        const groups = tb.cells.filter(c => c.rowSequence === 1).map(c => { let amt = null; for (let k = c.columnSequence; k < c.columnSequence + (c.colSpan || 1); k++) if (/مبلغ/.test(sub[k] || '')) amt = k; return [c.value, amt ? Number(String(row[amt] || '').replace(/,/g, '')) : null]; }).filter(g => g[1] !== null);\n        monthly.push({ period: ds.periodEndToDate, published: m.published, groups_million_rial: groups }); break; } } catch (e) {} }\n  const REFINERY = ['شپنا', 'شتران', 'شبندر', 'شبریز', 'شسپا', 'شراز', 'شاوان', 'شرانل', 'شنفت', 'شپاس', 'شبهرن'];\n  const PETRO = ['فارس', 'شپدیس', 'نوری', 'جم', 'پارس', 'تاپیکو', 'پترول', 'شیراز', 'زاگرس', 'مارون', 'آریا', 'شگویا', 'بوعلی', 'کرماشا'];\n  const peers = (REFINERY.includes(fa(symbol)) ? REFINERY : PETRO).filter(p => p !== fa(symbol));\n  const f10 = jal(new Date(now - 10 * 864e5)); const sector = [];\n  for (const p of peers) { await sleep(700); const j = await J(q(p, f10, to, 1)); (j?.Letters || []).forEach(x => { const ty = classify(x.Title); if (['REGULATORY_COURT', 'UTILITY_RATES', 'FEED_GAS_PRICE', 'SHUTDOWN', 'RESTART', 'HALT'].includes(ty)) sector.push({ symbol: x.Symbol, type: ty, title: x.Title, published: toDig(x.PublishDateTime), url: 'https://www.codal.ir' + x.Url }); }); }\n  const recent = t => L.filter(x => x.type === t).slice(0, 1).map(x => x.published)[0] || null;\n  return { symbol, window_days: days, n_letters: L.length, letters: L.slice(0, 40), monthly_sales: monthly, sector_regulatory_10d: sector,\n    last_seen: { AGM_DECISION: recent('AGM_DECISION'), BOARD_CEO_CHANGE: recent('BOARD_CEO_CHANGE'), SHUTDOWN: recent('SHUTDOWN'), RUMOR_CLARIFY: recent('RUMOR_CLARIFY'), HALT: recent('HALT'), REGULATORY_COURT: recent('REGULATORY_COURT'), UTILITY_RATES: recent('UTILITY_RATES'), FEED_GAS_PRICE: recent('FEED_GAS_PRICE'), CAPINC_PROPOSAL: recent('CAPINC_PROPOSAL'), PORTFOLIO_NAV: recent('PORTFOLIO_NAV') } };\n}\n\n/* ------------------------------------------------------------------------\n   D) codalLetterText(url): material-disclosure forms keep text in `clientDataSource`, structured\n   reports in `datasource`; AGM decisions and many others are server-rendered HTML (read the DOM).\n   PDF attachments are not parsed: if the key numbers are in the attachment, say so. */\nasync function codalLetterText(url) {\n  const h = await (await fetch(url)).text();\n  const m = h.match(/var (?:clientDataSource|datasource) = (\\{.*?\\});\\s*\\n/s);\n  let text = null;\n  if (m) { const texts = []; const walk = o => { if (typeof o === 'string') { const x = o.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\\s+/g, ' ').trim(); if (x.length > 3 && /[؀-ۿ]/.test(x)) texts.push(x); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };\n    walk(JSON.parse(m[1])); text = [...new Set(texts)].join(' | '); }\n  if (!text || text.length < 80) { const doc = new DOMParser().parseFromString(h, 'text/html'); doc.querySelectorAll('script,style').forEach(e => e.remove());\n    const t2 = (doc.body?.innerText || doc.body?.textContent || '').replace(/\\{\\{[^}]*\\}\\}/g, ' ').replace(/\\s+/g, ' ').trim(); if (t2.length > (text || '').length) text = t2; }\n  return { url, has_attachment: /Attachment\\.aspx/.test(h), text: (text || '').slice(0, 8000) || null };\n}\n```\n\n**راهنمای فیلدها:** `daily.close` قیمت پایانی، `daily.last` آخرین معامله، `closed_at_upper_limit` بسته‌شدن در صف خرید، `trend_class` روند کوتاه‌مدت سهم، `trend.*` روند روزانه، هفتگی، یک‌ساله و کانال ۶۰ روزه، `technical.ohlc_daily` و `technical.ohlc_weekly` کندل‌های تعدیل‌شده برای رسم ([تاریخ، بازگشایی، بیشینه، کمینه، پایانی، حجم])، `technical.fibonacci`، `technical.pivots`، `technical.ichimoku`، `technical.stochastic`، `technical.bollinger`، `technical.macd`، `technical.rsi_divergence`، `technical.candles_today`، `technical.chart_patterns` (با خط گردن و هدف)، `technical.signals_today` (سیگنال‌های امروز با لبهٔ ۱۳ ساله)، `chart.*` سطوح و ساختار نمودار، `flows.*` جریان پول حقیقی/حقوقی، `ipo.*` دفترچهٔ عرضهٔ اولیه، `group.regime` رژیم گروه، `rubric.points` امتیاز v2 بدون کدال، `rubric.calibration_for_this_band` احتمال‌های همین ناحیه و رژیم، `rubric.context` داده‌های بدون امتیاز، `next_session` پیش‌بینی جلسهٔ بعد نسخهٔ ۲٫۴ (امتیاز، ناحیه، سه احتمال، اعداد اجرا، پرچم‌ها)، `daily.price_limits_pct` دامنهٔ نوسان واقعی، `daily.sell_queue_streak_before_today` روزهای صف فروش پیاپی، `group.refiner_peers_today` سهم پالایشی‌های دیگر در صف، `codal_recent` اطلاعیه‌های کدال از tsetmc، `replay` مشخصات آزمون گذشته. مقادیر پولی tsetmc به ریال است؛ فیلدهای `*_billion_toman` به میلیارد تومان.\n";
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
   v2.1.1: group block — MarketWatch no longer returns `flow`; a missing flow no longer drops every symbol.
   v2.1.2: group block uses the symbol's own sector (e.g. 23 = refineries) and its index for regime; codal peers follow the group.
   v2.3: `technical` block — OHLC (daily 320 bars, weekly 104) for drawing, Fibonacci, pivots, Ichimoku, Stochastic, Bollinger/MACD values,
         RSI divergence, candlestick and chart patterns, each with its 13-year backtest edge (techtools.py).
   v2.4: (replay test of 11 refiners, 1392-1405, research/ in the repo)
         · petroSnapshot(symbol, { asOf: '1403/07/07' }) rebuilds the snapshot as of the close of a past session (no future data)
         · petroReplay(symbol, date) = as-of snapshot + what really happened next (`outcome`) + automatic check with reasons
         · petroReplayRange(symbol, from, to) = the same for every session in a range, with a summary
         · real daily price limits (MarketData/GetStaticThreshold) instead of a fixed ±2.85% rule; sell-queue streak
         · `next_session` block: next-session forecast (up / flat / down) with the v2.4 score, calibrated on the refiners
         · `codal_recent` from tsetmc's Codal list (no codal.ir rate limit); two Codal rows of the v2.4 score use it
   ========================================================================== */

async function petroSnapshot(symbol, opts = {}) {
  const BASE = 'https://cdn.tsetmc.com/api/';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const cache = opts.cache || null;   // Map shared by petroReplayRange (same histories for every day)
  const J = async (u, tries = 4, ms = 15000) => {
    if (cache && cache.has(u)) return cache.get(u);
    const v = await J0(u, tries, ms); if (cache && v) cache.set(u, v); return v;
  };
  const J0 = async (u, tries, ms) => {
    for (let i = 0; i < tries; i++) {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), ms);
      try { const r = await fetch(BASE + u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); } catch (e) { clearTimeout(tm); }
      await sleep(800 * (i + 1));
    }
    return null;
  };
  const ar = s => (s || '').replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/\s+/g, ' ').trim();
  const R = (x, d = 4) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** d) / 10 ** d;
  const out = { symbol, version: 2.4, generated_at: new Date().toISOString(), warnings: [] };
  // as-of (replay) mode: '1403/07/07' (Latin or Persian digits) or a Gregorian dEven like 20240928
  const jalOf = dEv => { const s = String(dEv); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)))).replace(/[^\d/]/g, ''); };
  let asOfJ = null, asOfD = null;
  if (opts.asOf) { const a = String(opts.asOf).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).trim();
    if (/^\d{8}$/.test(a)) asOfD = +a; else { const p = a.split(/[/-]/); if (p.length !== 3) return { error: 'تاریخ آزمون را به شکل ۱۴۰۳/۰۷/۰۷ بدهید', symbol }; asOfJ = `${p[0]}/${p[1].padStart(2, '0')}/${p[2].padStart(2, '0')}`; } }
  const REPLAY = !!opts.asOf;

  // ---------- 1) instrument
  const srch = await J('Instrument/GetInstrumentSearch/' + encodeURIComponent(ar(symbol)));
  const all = (srch?.instrumentSearch || []).filter(x => ar(x.lVal18AFC) === ar(symbol));
  const ins = all.find(x => [1, 2, 4].includes(x.flow) && !/3$|4$/.test(x.cgrValCot || '')) || all[0];
  if (!ins) return { error: 'نماد پیدا نشد', symbol };
  const ic = ins.insCode;
  out.instrument = { insCode: ic, name: ins.lVal30, market: ins.flowTitle, board: ins.cgrValCot };
  // live-only endpoints are skipped in replay mode (they describe today, not the test date)
  const [info, live, bl, ctToday] = await Promise.all([
    J(`Instrument/GetInstrumentInfo/${ic}`), REPLAY ? null : J(`ClosingPrice/GetClosingPriceInfo/${ic}`),
    REPLAY ? null : J(`BestLimits/${ic}`), REPLAY ? null : J(`ClientType/GetClientType/${ic}/1/0`)]);
  // older listings of the same symbol (e.g. a move from Farabourse to the Bourse) are merged into one history
  const olds = all.filter(x => x.insCode !== ic && [1, 2, 4].includes(x.flow));
  const [daily, cth, ...oldH] = await Promise.all([J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`), J(`ClientType/GetClientTypeHistory/${ic}`),
    ...olds.flatMap(x => [J(`ClosingPrice/GetClosingPriceDailyList/${x.insCode}/0`), J(`ClientType/GetClientTypeHistory/${x.insCode}`)])]);
  if (!daily) return { error: 'سابقهٔ قیمت از tsetmc نیامد؛ دوباره اجرا کن', symbol };
  const dMap = new Map(), ctRows = [];
  oldH.forEach((h, k) => { if (!h) return; if (k % 2 === 0) (h.closingPriceDaily || []).forEach(r => dMap.set(r.dEven, r)); else ctRows.push(...(h.clientType || [])); });
  (daily.closingPriceDaily || []).forEach(r => dMap.set(r.dEven, r)); ctRows.push(...(cth?.clientType || []));
  const I = info?.instrumentInfo || {}, L = live?.closingPriceInfo || {};
  out.instrument.state = L.instrumentState?.cEtavalTitle || null;
  out.fundamental_quick = { eps_estimated: I.eps?.estimatedEPS, sector_pe: I.eps?.sectorPE, shares: I.zTitad, sector: I.sector?.lSecVal,
    avg_volume_3m: I.qTotTran5JAvg, free_float_pct: I.kAjCapValCpsIdx, price_limits_today: [I.staticThreshold?.psGelStaMin, I.staticThreshold?.psGelStaMax] };

  // ---------- 2) daily series (+ today's live row) and adjustment
  let rawAll = [...dMap.values()].sort((a, b) => a.dEven - b.dEven);
  const fullTraded = rawAll.filter(r => r.qTotTran5J > 0).map(r => r.dEven);   // dates only: used for the next session's date in replay mode
  if (REPLAY) {
    if (!asOfD) { let k = rawAll.length - 1; while (k >= 0 && jalOf(rawAll[k].dEven) > asOfJ) k--; asOfD = k >= 0 ? rawAll[k].dEven : 0; }
    rawAll = rawAll.filter(r => r.dEven <= asOfD);
    if (!asOfJ) asOfJ = jalOf(asOfD);
  }
  let D = rawAll.filter(r => r.qTotTran5J > 0)
    .map(r => ({ d: r.dEven, o: r.priceFirst, h: r.priceMax, l: r.priceMin, last: r.pDrCotVal, c: r.pClosing, y: r.priceYesterday, v: r.qTotTran5J, val: r.qTotCap }));
  if (!REPLAY && L.finalLastDate && D.length && L.finalLastDate > D[D.length - 1].d && L.qTotTran5J > 0)
    D.push({ d: L.finalLastDate, o: L.priceFirst, h: L.priceMax, l: L.priceMin, last: L.pDrCotVal, c: L.pClosing, y: L.priceYesterday, v: L.qTotTran5J, val: L.qTotCap, live: true });
  const n = D.length, t = n - 1;
  if (REPLAY && n) {
    const used = D[t].d, nxt = fullTraded.find(d => d > used) || null;
    out.replay = { as_of: asOfJ, session_used: jalOf(used), session_used_dEven: used, next_session: nxt ? jalOf(nxt) : null, next_session_dEven: nxt,
      note: 'آزمون گذشته: همهٔ داده‌ها تا پایان همین جلسه بریده شده‌اند. دفتر سفارش، دیده‌بان بازار و جریان پول گروه در این حالت نیستند.' };
    out.instrument.state = jalOf(used) === asOfJ ? 'مجاز (آزمون گذشته)' : 'مجاز (آزمون گذشته؛ در تاریخ آزمون معامله نشد)';
    if (jalOf(used) !== asOfJ) out.warnings.push(`نماد در ${asOfJ} معامله نشد؛ آخرین جلسهٔ قبل از آن (${jalOf(used)}) استفاده شد`);
    out.fundamental_quick.note = 'EPS، P/E و تعداد سهام مقادیر امروزند، نه تاریخ آزمون';
  }
  // the day's real price limits (the range can change: e.g. ±1% from 1403/07/07 to 1403/07/20)
  let thr = null;
  if (n && !D[t].live) { const th = await J(`MarketData/GetStaticThreshold/${ic}/${D[t].d}`, 2, 10000); const recs = (th?.staticThreshold || []).filter(x => x.dEven === D[t].d).sort((a, b) => a.hEven - b.hEven);
    if (recs.length) thr = { max: recs[recs.length - 1].psGelStaMax, min: recs[recs.length - 1].psGelStaMin }; }
  else if (I.staticThreshold?.psGelStaMax) thr = { max: I.staticThreshold.psGelStaMax, min: I.staticThreshold.psGelStaMin };
  if (REPLAY) out.fundamental_quick.price_limits_today = thr ? [thr.min, thr.max] : null;
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
  // queue at the close from the day's real limits (v2.4); without them: ±3% rule
  const pMaxT = thr?.max, pMinT = thr?.min;
  const limUp = pMaxT && last.y ? pMaxT / last.y - 1 : 0.03, limDn = pMinT && last.y ? 1 - pMinT / last.y : 0.03;
  ind.price_limits_pct = [R(-limDn, 4), R(limUp, 4)];
  ind.closed_at_upper_limit = pMaxT ? last.last >= pMaxT : (chgLast >= limUp - 0.0015 && last.last >= last.h);
  ind.closed_at_lower_limit = pMinT ? last.last <= pMinT : (chgLast <= -(limDn - 0.0015) && last.last <= last.l);
  // trend class (stock level) — used to read signals in context
  ind.trend_class = (ok(51) && C[t] > ind.sma20 && ind.sma20 > ind.sma50 && ind.ret_20d > 0.10) ? 'strong_up'
    : (ok(51) && C[t] < ind.sma20 && ind.sma20 < ind.sma50 && ind.ret_20d < -0.10) ? 'strong_down' : (ok(51) ? 'other' : 'unknown_short_history');
  // streaks
  // earlier days: today's limit percentage is assumed (ranges change rarely)
  const lim = i => (D[i].last / D[i].y - 1 >= limUp - 0.0015 && D[i].last >= D[i].h);
  const limS = i => (D[i].last / D[i].y - 1 <= -(limDn - 0.0015) && D[i].last <= D[i].l);
  let qs = 0; for (let i = t - 1; i >= 0 && lim(i); i--) qs++;
  let qss = 0; for (let i = t - 1; i >= 0 && limS(i); i--) qss++;
  let us = 0; for (let i = t - 1; i >= 1 && C[i] > C[i - 1]; i--) us++;
  ind.buy_queue_streak_before_today = qs; ind.sell_queue_streak_before_today = qss; ind.up_day_streak_before_today = us;
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

  // ---------- 4c) technical toolkit: OHLC for drawing, Fibonacci, pivots, Ichimoku, Stochastic, divergence, candles, chart patterns
  //               definitions = the 13-year backtest (techtools.py, 1392-1405); `backtest` = [n, edge 5d pp, edge 20d pp, eras (of 5) with the same sign]
  {
    const s0 = ipoIdx > 0 ? ipoIdx : 0;
    const O = D.map((r, i) => (r.o || D[i].c) * fac[i]);
    const r0 = x => R(x, 0);
    const TT = { fib_up_zone: [9631, 1.1, -0.1, 3], fib_up_zone_bounce: [3712, 2.0, -0.9, 4], fib_up_break618: [449, 5.3, 1.5, 4], fib_dn_zone: [4238, 0.1, 0.1, 3],
      fib_dn_zone_reject: [2012, -0.5, -0.4, 3], fib_dn_break618: [251, -0.5, -6.0, 3], piv_above_r1: [11763, -1.4, -2.7, 3], piv_below_s1: [10884, 1.8, 0.6, 4],
      piv_s1_bounce: [25097, -1.9, -0.3, 4], piv_r1_reject: [21435, 2.1, 2.3, 4], wpiv_above_r1: [10441, -1.3, -0.8, 4], wpiv_below_s1: [9001, 2.1, 0.7, 4],
      ichi_above: [33174, 0.3, 0.6, 5], ichi_below: [23738, 0.2, 0.4, 3], ichi_in: [9130, 0.1, 0.3, 3], ichi_tk_up_above: [629, 2.6, 2.1, 4], ichi_tk_dn_below: [433, 1.1, -2.0, 3],
      ichi_break_up: [984, 0.5, -1.9, 4], ichi_break_dn: [1102, 4.3, 2.5, 4], stoch_up20: [3438, 2.1, -0.3, 4], stoch_dn80: [4256, -1.7, -0.3, 5],
      div_bull: [386, -0.6, -5.6, 3], div_bear: [607, -0.1, 2.3, 3], c_doji: [10458, 0.6, 0.0, 4], c_hammer: [1150, 0.3, -1.1, 3], c_star: [1408, -0.4, 1.8, 4],
      c_bull_eng: [762, 1.8, 0.0, 3], c_bear_eng: [1022, 0.1, -0.7, 2], c_morning: [413, -2.1, -0.4, 4], c_evening: [411, 2.1, -1.2, 4],
      p_dtop: [44, 7.1, -1.2, 5], p_dbot: [57, 1.0, -6.8, 2], p_hs: [144, 3.4, -1.4, 4], p_ihs: [91, 5.3, -0.5, 4], p_tri_up: [613, 0.9, -2.5, 3], p_tri_dn: [766, 2.4, 0.7, 4] };
    const LBL = { fib_up_zone: 'فیبوناچی: پولبک در ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪', fib_up_zone_bounce: 'فیبوناچی: برگشت از ناحیهٔ ۳۸٫۲ تا ۶۱٫۸٪', fib_up_break618: 'فیبوناچی: شکست ۶۱٫۸٪ در پولبک',
      fib_dn_zone: 'فیبوناچی: رشد اصلاحی تا ۳۸٫۲ تا ۶۱٫۸٪', fib_dn_zone_reject: 'فیبوناچی: برگشت از مقاومت ۳۸٫۲ تا ۶۱٫۸٪', fib_dn_break618: 'فیبوناچی: عبور از ۶۱٫۸٪ در روند نزولی',
      piv_above_r1: 'پیوت روزانه: بالای R1', piv_below_s1: 'پیوت روزانه: زیر S1', piv_s1_bounce: 'پیوت روزانه: برگشت از S1', piv_r1_reject: 'پیوت روزانه: برگشت از R1',
      wpiv_above_r1: 'پیوت هفتگی: بالای R1', wpiv_below_s1: 'پیوت هفتگی: زیر S1', ichi_above: 'ایچیموکو: بالای ابر', ichi_below: 'ایچیموکو: زیر ابر', ichi_in: 'ایچیموکو: داخل ابر',
      ichi_tk_up_above: 'ایچیموکو: تقاطع تنکان/کیجون رو به بالا، بالای ابر', ichi_tk_dn_below: 'ایچیموکو: تقاطع رو به پایین، زیر ابر', ichi_break_up: 'ایچیموکو: خروج از ابر رو به بالا',
      ichi_break_dn: 'ایچیموکو: خروج از ابر رو به پایین', stoch_up20: 'Stochastic: تقاطع رو به بالا زیر ۲۰', stoch_dn80: 'Stochastic: تقاطع رو به پایین بالای ۸۰',
      div_bull: 'واگرایی مثبت RSI', div_bear: 'واگرایی منفی RSI', c_doji: 'کندل دوجی', c_hammer: 'کندل چکش', c_star: 'کندل ستارهٔ دنباله‌دار', c_bull_eng: 'پوشای صعودی',
      c_bear_eng: 'پوشای نزولی', c_morning: 'ستارهٔ صبحگاهی', c_evening: 'ستارهٔ شامگاهی', p_dtop: 'سقف دوقلو (شکست خط گردن)', p_dbot: 'کف دوقلو (شکست خط گردن)',
      p_hs: 'سر و شانه (شکست خط گردن)', p_ihs: 'سر و شانهٔ معکوس (شکست خط گردن)', p_tri_up: 'مثلث: شکست رو به بالا', p_tri_dn: 'مثلث: شکست رو به پایین' };
    const tk = { note: 'ابزارهای کلاسیک برای رسم نمودار، سطوح، حد ضرر و هدف؛ هیچ‌کدام امتیاز ندارند. لبه‌ها از آزمون ۱۳ ساله (بخش ۴-۱-ج پرامپت).' };
    const fired = new Set();
    const T0 = Math.max(s0, n - 320);
    tk.ohlc_daily = []; for (let i = T0; i <= t; i++) tk.ohlc_daily.push([D[i].d, r0(O[i]), r0(H[i]), r0(Lo[i]), r0(C[i]), V[i]]);
    tk.ohlc_columns = ['dEven', 'open', 'high', 'low', 'close(پایانی)', 'volume'];
    // weekly bars (Iran week Sat-Wed); the last one may be the running week
    const wkKey = dEv => { const s = String(dEv); const dt = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))); dt.setUTCDate(dt.getUTCDate() + (5 - dt.getUTCDay() + 7) % 7); return dt.toISOString().slice(0, 10); };
    const W = []; let wk0 = null;
    for (let i = s0; i <= t; i++) { const k = wkKey(D[i].d);
      if (k !== wk0) { W.push([D[i].d, O[i], H[i], Lo[i], C[i], V[i]]); wk0 = k; }
      else { const w = W[W.length - 1]; w[0] = D[i].d; w[2] = Math.max(w[2], H[i]); w[3] = Math.min(w[3], Lo[i]); w[4] = C[i]; w[5] += V[i]; } }
    tk.ohlc_weekly = W.slice(-104).map(w => [w[0], r0(w[1]), r0(w[2]), r0(w[3]), r0(w[4]), w[5]]);
    const ready = t - s0 >= 60;
    // ---- Fibonacci on the 120-bar swing
    if (t - s0 >= 20) {
      const a = Math.max(s0, t - 119); let hi = a, lo = a;
      for (let i = a; i <= t; i++) { if (H[i] > H[hi]) hi = i; if (Lo[i] < Lo[lo]) lo = i; }
      const HI = H[hi], LO = Lo[lo], span = HI - LO, up = hi > lo, ext = up ? hi : lo;
      const valid = HI / LO - 1 >= 0.15 && t - ext >= 3;
      const lvl = r => up ? HI - r * span : LO + r * span;
      const rt = up ? (HI - C[t]) / span : (C[t] - LO) / span, rtp = up ? (HI - C[t - 1]) / span : (C[t - 1] - LO) / span;
      if (valid && ready) {
        if (up) { if (rt >= 0.382 && rt <= 0.618) { fired.add('fib_up_zone'); if (C[t] > C[t - 1] && Lo[t] <= lvl(0.382)) fired.add('fib_up_zone_bounce'); } if (rt > 0.618 && rtp <= 0.618) fired.add('fib_up_break618'); }
        else { if (rt >= 0.382 && rt <= 0.618) { fired.add('fib_dn_zone'); if (C[t] < C[t - 1] && H[t] >= lvl(0.382)) fired.add('fib_dn_zone_reject'); } if (rt > 0.618 && rtp <= 0.618) fired.add('fib_dn_break618'); }
      }
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map(r => [r, r0(lvl(r))]);
      const exts = [1.272, 1.618, 2].map(r => [r, r0(up ? LO + r * span : HI - r * span)]);
      const near = levels.slice(1, -1).map(([r, p]) => [r, p, Math.abs(p / C[t] - 1)]).sort((x, y) => x[2] - y[2])[0];
      tk.fibonacci = { direction: up ? 'up' : 'down', swing_from: [D[up ? lo : hi].d, r0(up ? LO : HI)], swing_to: [D[ext].d, r0(up ? HI : LO)], swing_pct: R(100 * (HI / LO - 1), 1),
        valid_swing: valid, bars_since_swing_end: t - ext, retracement_now: R(rt, 3), retracement_levels: levels, extension_levels: exts,
        nearest_level: near ? [near[0], near[1], R(100 * (near[1] / C[t] - 1), 1)] : null,
        rule: 'up: سطوح اصلاحی از سقف به پایین (حمایت)، extension هدف‌های بالای سقف؛ down: سطوح اصلاحی از کف به بالا (مقاومت). نوسان معتبر ≥ ۱۵٪.' };
    }
    // ---- pivots: signals use yesterday's bar; next-session levels use today's bar
    const piv = (h, l, c) => { const P = (h + l + c) / 3; return { P, R1: 2 * P - l, R2: P + (h - l), R3: h + 2 * (P - l), S1: 2 * P - h, S2: P - (h - l), S3: l - 2 * (h - P) }; };
    const pr = o => o && Object.fromEntries(Object.entries(o).map(([k, v]) => [k, r0(v)]));
    if (t >= 1) {
      const py = piv(H[t - 1], Lo[t - 1], C[t - 1]);
      if (ready) { if (C[t] > py.R1) fired.add('piv_above_r1'); if (C[t] < py.S1) fired.add('piv_below_s1'); if (Lo[t] <= py.S1 && C[t] > py.S1) fired.add('piv_s1_bounce'); if (H[t] >= py.R1 && C[t] < py.R1) fired.add('piv_r1_reject'); }
      const done = W.slice(0, -1), lw = done[done.length - 1];
      const wp = lw ? piv(lw[2], lw[3], lw[4]) : null;
      if (wp && ready) { if (C[t] > wp.R1) fired.add('wpiv_above_r1'); if (C[t] < wp.S1) fired.add('wpiv_below_s1'); }
      tk.pivots = { next_session_daily: pr(piv(H[t], Lo[t], C[t])), today_daily_from_yesterday: pr(py), weekly_from_last_completed_week: pr(wp), method: 'classic (P=(H+L+C)/3)' };
    }
    // ---- Ichimoku 9/26/52
    const hhv = (a, k, i) => { let m = -Infinity; for (let j = Math.max(s0, i - k + 1); j <= i; j++) m = Math.max(m, a[j]); return m; };
    const llv = (a, k, i) => { let m = Infinity; for (let j = Math.max(s0, i - k + 1); j <= i; j++) m = Math.min(m, a[j]); return m; };
    const ten = i => (hhv(H, 9, i) + llv(Lo, 9, i)) / 2, kij = i => (hhv(H, 26, i) + llv(Lo, 26, i)) / 2;
    const spA = i => (ten(i) + kij(i)) / 2, spB = i => (hhv(H, 52, i) + llv(Lo, 52, i)) / 2;
    if (t - s0 >= 78) {
      const top = Math.max(spA(t - 26), spB(t - 26)), bot = Math.min(spA(t - 26), spB(t - 26));
      const topp = Math.max(spA(t - 27), spB(t - 27)), botp = Math.min(spA(t - 27), spB(t - 27));
      const tkUp = ten(t) > kij(t) && ten(t - 1) <= kij(t - 1), tkDn = ten(t) < kij(t) && ten(t - 1) >= kij(t - 1);
      if (ready) { if (C[t] > top) fired.add('ichi_above'); else if (C[t] < bot) fired.add('ichi_below'); else fired.add('ichi_in');
        if (tkUp && C[t] > top) fired.add('ichi_tk_up_above'); if (tkDn && C[t] < bot) fired.add('ichi_tk_dn_below');
        if (C[t] > top && C[t - 1] <= topp) fired.add('ichi_break_up'); if (C[t] < bot && C[t - 1] >= botp) fired.add('ichi_break_dn'); }
      tk.ichimoku = { tenkan: r0(ten(t)), kijun: r0(kij(t)), cloud_top: r0(top), cloud_bottom: r0(bot), price_vs_cloud: C[t] > top ? 'above' : C[t] < bot ? 'below' : 'inside',
        tk_cross_today: tkUp ? 'up' : tkDn ? 'down' : null, future_cloud_26: spA(t) >= spB(t) ? 'bullish' : 'bearish', future_span_a: r0(spA(t)), future_span_b: r0(spB(t)),
        chikou_vs_price_26_ago: C[t] > C[t - 26] ? 'above' : 'below' };
    }
    // ---- Stochastic 14,3
    const kAt = i => { const hh = hhv(H, 14, i), ll = llv(Lo, 14, i); return hh > ll ? 100 * (C[i] - ll) / (hh - ll) : 50; };
    if (t - s0 >= 20) {
      const K = [t - 3, t - 2, t - 1, t].map(kAt), dNow = (K[1] + K[2] + K[3]) / 3, dPrev = (K[0] + K[1] + K[2]) / 3;
      const cu = K[3] > dNow && K[2] <= dPrev && dNow < 20, cd = K[3] < dNow && K[2] >= dPrev && dNow > 80;
      if (ready) { if (cu) fired.add('stoch_up20'); if (cd) fired.add('stoch_dn80'); }
      tk.stochastic = { k: R(K[3], 1), d: R(dNow, 1), cross: cu ? 'up_below_20' : cd ? 'down_above_80' : null };
    }
    // ---- Bollinger / MACD values for drawing
    if (ok(20)) { const m = sma(C, 20, t); tk.bollinger = { upper: r0(m + 2 * sd20), middle: r0(m), lower: r0(m - 2 * sd20), width_pct: R(100 * 4 * sd20 / m, 1) }; }
    if (ok(40)) tk.macd = { macd: R(MACD[t], 1), signal: R(SIG[t], 1), hist: R(MACD[t] - SIG[t], 1) };
    // ---- swings (5-bar fractal, confirmed two bars later) → divergence and chart patterns
    const SHs = [], SLs = [];
    for (let i = Math.max(s0 + 2, t - 122); i <= t - 2; i++) {
      if (H[i] === Math.max(...H.slice(i - 2, i + 3))) SHs.push(i);
      if (Lo[i] === Math.min(...Lo.slice(i - 2, i + 3))) SLs.push(i);
    }
    const sh = SHs.filter(i => i >= t - 120).slice(-4), sl = SLs.filter(i => i >= t - 120).slice(-4);
    const pt = (i, p) => [D[i].d, r0(p)];
    // RSI divergence (fires on the day the second swing is confirmed; `recent` = within 10 bars)
    const dv = [];
    if (sl.length >= 2) { const [a1, a2] = sl.slice(-2); if (a2 - a1 <= 60 && Lo[a2] < Lo[a1] && RSI[a2] > RSI[a1] + 2) { dv.push({ type: 'bullish', swings: [pt(a1, Lo[a1]), pt(a2, Lo[a2])], rsi: [R(RSI[a1], 1), R(RSI[a2], 1)], bars_ago: t - a2 }); if (a2 === t - 2 && ready) fired.add('div_bull'); } }
    if (sh.length >= 2) { const [a1, a2] = sh.slice(-2); if (a2 - a1 <= 60 && H[a2] > H[a1] && RSI[a2] < RSI[a1] - 2) { dv.push({ type: 'bearish', swings: [pt(a1, H[a1]), pt(a2, H[a2])], rsi: [R(RSI[a1], 1), R(RSI[a2], 1)], bars_ago: t - a2 }); if (a2 === t - 2 && ready) fired.add('div_bear'); } }
    tk.rsi_divergence = dv.filter(x => x.bars_ago <= 10);
    // chart patterns: status 'broken_today' (= backtested signal) or 'forming' (neckline not broken yet)
    const pats = [];
    const minL = (a, b) => Math.min(...Lo.slice(a, b + 1)), maxH = (a, b) => Math.max(...H.slice(a, b + 1));
    if (sh.length >= 2) { const [a1, a2] = sh.slice(-2);
      if (a2 - a1 >= 10 && Math.abs(H[a1] / H[a2] - 1) <= 0.03 && t - a2 <= 30) { const neck = minL(a1, a2);
        if (neck <= Math.min(H[a1], H[a2]) * 0.95) { const brk = C[t] < neck && neck <= C[t - 1]; if (brk && ready) fired.add('p_dtop');
          if (brk || C[t] >= neck) pats.push({ type: 'double_top', fa: 'سقف دوقلو', bias: 'bearish', status: brk ? 'broken_today' : 'forming', points: [pt(a1, H[a1]), pt(a2, H[a2])], neckline: r0(neck), measured_target: r0(neck - (Math.max(H[a1], H[a2]) - neck)) }); } } }
    if (sl.length >= 2) { const [a1, a2] = sl.slice(-2);
      if (a2 - a1 >= 10 && Math.abs(Lo[a1] / Lo[a2] - 1) <= 0.03 && t - a2 <= 30) { const neck = maxH(a1, a2);
        if (neck >= Math.max(Lo[a1], Lo[a2]) * 1.05) { const brk = C[t] > neck && neck >= C[t - 1]; if (brk && ready) fired.add('p_dbot');
          if (brk || C[t] <= neck) pats.push({ type: 'double_bottom', fa: 'کف دوقلو', bias: 'bullish', status: brk ? 'broken_today' : 'forming', points: [pt(a1, Lo[a1]), pt(a2, Lo[a2])], neckline: r0(neck), measured_target: r0(neck + (neck - Math.min(Lo[a1], Lo[a2]))) }); } } }
    if (sh.length >= 3) { const [A, B, Cc] = sh.slice(-3);
      if (H[B] >= 1.03 * Math.max(H[A], H[Cc]) && Math.abs(H[A] / H[Cc] - 1) <= 0.05 && t - Cc <= 30) { const neck = (minL(A, B) + minL(B, Cc)) / 2, brk = C[t] < neck && neck <= C[t - 1];
        if (brk && ready) fired.add('p_hs');
        if (brk || C[t] >= neck) pats.push({ type: 'head_shoulders', fa: 'سر و شانه', bias: 'bearish', status: brk ? 'broken_today' : 'forming', points: [pt(A, H[A]), pt(B, H[B]), pt(Cc, H[Cc])], neckline: r0(neck), measured_target: r0(neck - (H[B] - neck)) }); } }
    if (sl.length >= 3) { const [A, B, Cc] = sl.slice(-3);
      if (Lo[B] <= 0.97 * Math.min(Lo[A], Lo[Cc]) && Math.abs(Lo[A] / Lo[Cc] - 1) <= 0.05 && t - Cc <= 30) { const neck = (maxH(A, B) + maxH(B, Cc)) / 2, brk = C[t] > neck && neck >= C[t - 1];
        if (brk && ready) fired.add('p_ihs');
        if (brk || C[t] <= neck) pats.push({ type: 'inverse_head_shoulders', fa: 'سر و شانهٔ معکوس', bias: 'bullish', status: brk ? 'broken_today' : 'forming', points: [pt(A, Lo[A]), pt(B, Lo[B]), pt(Cc, Lo[Cc])], neckline: r0(neck), measured_target: r0(neck + (neck - Lo[B])) }); } }
    if (sh.length >= 2 && sl.length >= 2) { const [p1, p2] = sh.slice(-2), [q1, q2] = sl.slice(-2), h1 = H[p1], h2 = H[p2], l1 = Lo[q1], l2 = Lo[q2];
      const contracting = h2 <= h1 * 1.01 && l2 >= l1 * 0.99 && (h2 < h1 * 0.99 || l2 > l1 * 1.01) && (h2 - l2) < 0.8 * (h1 - l1);
      if (contracting && t - Math.max(p2, q2) <= 20) { const bu = C[t] > h2 && h2 >= C[t - 1], bd = C[t] < l2 && l2 <= C[t - 1];
        if (bu && ready) fired.add('p_tri_up'); if (bd && ready) fired.add('p_tri_dn');
        const kind = Math.abs(h2 / h1 - 1) < 0.01 ? 'ascending' : Math.abs(l2 / l1 - 1) < 0.01 ? 'descending' : 'symmetrical';
        pats.push({ type: 'triangle_' + kind, fa: kind === 'ascending' ? 'مثلث افزایشی' : kind === 'descending' ? 'مثلث کاهشی' : 'مثلث متقارن', bias: 'neutral',
          status: bu ? 'broken_up_today' : bd ? 'broken_down_today' : 'forming', upper_line: [pt(p1, h1), pt(p2, h2)], lower_line: [pt(q1, l1), pt(q2, l2)],
          breakout_up_above: r0(h2), breakdown_below: r0(l2), measured_target_up: r0(h2 + (h1 - l1)), measured_target_down: r0(l2 - (h1 - l1)) }); } }
    tk.chart_patterns = pats;
    tk.swings_recent = { highs: sh.map(i => pt(i, H[i])), lows: sl.map(i => pt(i, Lo[i])) };
    // ---- candlestick patterns (today)
    const body = i => Math.abs(C[i] - O[i]), rgI = i => H[i] - Lo[i], upS = i => H[i] - Math.max(O[i], C[i]), loS = i => Math.min(O[i], C[i]) - Lo[i];
    const cd = [];
    if (t - s0 >= 25 && rgI(t) > 0) {
      let ab = 0; for (let i = t - 19; i <= t; i++) ab += body(i); ab /= 20;
      const r5p = C[t - 1] / C[t - 6] - 1;
      if (body(t) <= 0.1 * rgI(t)) cd.push('c_doji');
      if (body(t) > 0 && loS(t) >= 2 * body(t) && upS(t) <= 0.25 * rgI(t) && r5p < -0.03) cd.push('c_hammer');
      if (body(t) > 0 && upS(t) >= 2 * body(t) && loS(t) <= 0.25 * rgI(t) && r5p > 0.03) cd.push('c_star');
      if (C[t - 1] < O[t - 1] && C[t] > O[t] && O[t] <= C[t - 1] && C[t] >= O[t - 1] && r5p < 0) cd.push('c_bull_eng');
      if (C[t - 1] > O[t - 1] && C[t] < O[t] && O[t] >= C[t - 1] && C[t] <= O[t - 1] && r5p > 0) cd.push('c_bear_eng');
      if (C[t - 2] < O[t - 2] && body(t - 2) >= 1.2 * ab && body(t - 1) <= 0.3 * body(t - 2) && C[t] > O[t] && C[t] > (O[t - 2] + C[t - 2]) / 2) cd.push('c_morning');
      if (C[t - 2] > O[t - 2] && body(t - 2) >= 1.2 * ab && body(t - 1) <= 0.3 * body(t - 2) && C[t] < O[t] && C[t] < (O[t - 2] + C[t - 2]) / 2) cd.push('c_evening');
      if (ready) cd.forEach(k => fired.add(k));
    }
    tk.candles_today = cd.map(k => LBL[k]);
    tk.candle_note = 'کندل‌ها با قیمت پایانی (میانگین وزنی) رسم می‌شوند، نه آخرین معامله؛ دامنهٔ نوسان ±۳٪ بدنه‌ها را کوتاه می‌کند.';
    tk.signals_today = [...fired].map(k => ({ key: k, fa: LBL[k], n: TT[k][0], edge_5d_pp: TT[k][1], edge_20d_pp: TT[k][2], eras_same_sign_of_5: TT[k][3] }));
    tk.backtest_note = 'لبه = فاصلهٔ احتمال رشد از میانگین گروه در همان روز (واحد درصد)، ۱۳۹۲ تا ۱۴۰۵، گروه ۴۴. هیچ ابزار کلاسیکی لبهٔ پایدار بیش از ±۳ واحد نداشت؛ جهت را از امتیاز v2 بگیر.';
    out.technical = tk;
  }

  // ---------- 5) order book
  const Bk = bl?.bestLimits || [], top = Bk[0] || {};
  const pMax = I.staticThreshold?.psGelStaMax, pMin = I.staticThreshold?.psGelStaMin;
  let queue = 'none';
  if (top.qTitMeDem > 0 && !top.qTitMeOf && pMax && top.pMeDem >= pMax) queue = 'buy_queue';
  if (top.qTitMeOf > 0 && !top.qTitMeDem && pMin && top.pMeOf <= pMin) queue = 'sell_queue';
  if (REPLAY) out.order_book = { queue: 'unknown', note: 'در آزمون گذشته دفتر سفارش نیست' };
  else out.order_book = { queue, top5: Bk.slice(0, 5).map(b => [b.zOrdMeDem, b.qTitMeDem, b.pMeDem, b.pMeOf, b.qTitMeOf, b.zOrdMeOf]),
    queue_value_billion_toman: R((queue === 'buy_queue' ? top.qTitMeDem * top.pMeDem : queue === 'sell_queue' ? top.qTitMeOf * top.pMeOf : 0) / 1e10, 1),
    note: 'ستون‌ها: تعداد خریدار، حجم خرید، قیمت خرید، قیمت فروش، حجم فروش، تعداد فروشنده' };

  // ---------- 6) flows (individual / institutional)
  const CT = {}; ctRows.forEach(r => { if (!REPLAY || r.recDate <= D[t].d) CT[r.recDate] = r; });
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
  for (const r of (opts.lite ? [] : D.slice(-6))) { const j = await J(`Shareholder/${ic}/${r.d}`, 2, 10000); const rows = j?.shareShareholder || []; const des = [...new Set(rows.map(x => x.dEven))].sort(); if (des.length < 2) continue;
    const cur = {}, prev = {}; rows.forEach(x => { const T = x.dEven === des[des.length - 1] ? cur : prev; T[x.shareHolderName] = (T[x.shareHolderName] || 0) + x.numberOfShares; });
    for (const nm of new Set([...Object.keys(cur), ...Object.keys(prev)])) { const dsh = (cur[nm] || 0) - (prev[nm] || 0); if (Math.abs(dsh) < 1) continue;
      hd.push({ date: r.d, holder: nm, type: cls(nm), delta_shares: dsh, value_billion_toman: R(dsh * r.c / 1e10, 2), now_pct: I.zTitad ? R(100 * (cur[nm] || 0) / I.zTitad, 3) : null, new_above_1pct: !(nm in prev), dropped_below_1pct: !(nm in cur) }); } }
  const lastHold = (REPLAY || opts.lite) ? null : await J(`Shareholder/GetInstrumentShareHolderLast/${ic}`, 2);
  out.holders = { top: (lastHold?.shareHolder || []).slice(0, 8).map(x => [x.shareHolderName, R(x.perOfShares, 2), cls(x.shareHolderName)]), changes_6d: hd };

  // ---------- 9) the symbol's own group (sector code from InstrumentInfo, e.g. 44 = chemicals, 23 = refineries):
  //               breadth, flows EXCLUDING this symbol, group index (found by name "<code>-...") + total index, live append
  const SEC = String(I.sector?.cSecVal || '').trim() || '44';
  const mw = REPLAY ? null : await J('ClosingPrice/GetMarketWatch?market=0&paperTypes[0]=1&paperTypes[1]=2&showTraded=false&withBestLimits=true');
  const G = (mw?.marketwatch || []).filter(x => (x.csv || '').trim() === SEC && (x.flow == null || [1, 2, 4].includes(x.flow)) && !/\d$/.test(x.lva) && x.qtc > 0);
  const cta = REPLAY ? null : await J('ClientType/GetClientTypeAll'); const CTA = {}; (cta?.clientTypeAllDto || []).forEach(x => CTA[x.insCode] = x);
  let netI = 0, tv = 0, selfNet = 0, selfVal = 0;
  G.forEach(x => { const c = CTA[x.insCode]; if (!c) return; const nI = (c.buy_I_Volume - c.sell_I_Volume) * x.pcl; if (x.insCode === ic) { selfNet = nI; selfVal = x.qtc; } else { netI += nI; tv += x.qtc; } });
  const qb = G.filter(x => x.pdv >= x.pMax && x.blDs?.[0]?.qmo === 0).length, qsl = G.filter(x => x.pdv <= x.pMin && x.blDs?.[0]?.qmd === 0).length;
  const ixLive = await J('Index/GetIndexB1LastAll/All/1');
  const liveList = ixLive?.indexB1 || Object.values(ixLive || {})[0] || [];
  const secIdx = liveList.find(x => String(x.lVal30 || '').trim().startsWith(SEC + '-'));
  const GI = secIdx ? String(secIdx.insCode) : '33626672012415176';
  if (!secIdx && SEC !== '44') out.warnings.push(`شاخص گروه ${SEC} پیدا نشد؛ شاخص ۴۴ به‌جای آن استفاده شد`);
  const [ixG, ixT] = await Promise.all([J('Index/GetIndexB2History/' + GI), J('Index/GetIndexB2History/32097828799138957')]);
  const liveIdx = {}; liveList.forEach(x => liveIdx[x.insCode] = x.xDrNivJIdx004);
  const idx = (h, code) => { const rows = (h?.indexB2 || []).sort((x, y) => x.dEven - y.dEven).filter(x => !REPLAY || x.dEven <= last.d); const a = rows.map(x => x.xNivInuClMresIbs); let appended = false;
    if (!REPLAY && last.d > (rows[rows.length - 1]?.dEven || 0) && liveIdx[code]) { a.push(liveIdx[code]); appended = true; }
    const k = a.length - 1; const m50 = a.slice(k - 49, k + 1).reduce((s, x) => s + x, 0) / 50; return { level: a[k], r1: R(a[k] / a[k - 1] - 1), r5: R(a[k] / a[k - 5] - 1), r20: R(a[k] / a[k - 20] - 1), above_sma50: a[k] > m50, live_appended: appended }; };
  const cG = idx(ixG, GI);
  const regime = cG.r20 > 0.10 ? 'hot' : cG.r20 < -0.05 ? 'cold' : 'mid';
  out.group = { sector_code: SEC, sector_name: I.sector?.lSecVal || null, group_index_name: secIdx?.lVal30 || '44-شيميايي', group_index_code: GI,
    n_traded: G.length, pct_up: R(G.filter(x => x.pdv > x.py).length / G.length, 2), buy_queues: qb, sell_queues: qsl,
    avg_change_pct: R(100 * G.reduce((s, x) => s + (x.pcl / x.py - 1), 0) / G.length, 2),
    indiv_net_flow_pct_of_value_ex_self: R(netI / tv, 3), indiv_net_flow_billion_toman_ex_self: R(netI / 1e10, 1),
    this_symbol_share_of_group_value: R(selfVal / (tv + selfVal), 3), this_symbol_indiv_net_billion_toman: R(selfNet / 1e10, 1),
    group_index: cG, chem44_index: SEC === '44' ? cG : null, total_index: idx(ixT, '32097828799138957'), regime,
    regime_rule: 'hot = شاخص همین گروه در ۲۰ روز بیش از +۱۰٪؛ cold = کمتر از −۵٪؛ بقیه mid' };
  if (SEC !== '44' && SEC !== '23') out.warnings.push(`نماد در گروه ${SEC} (${I.sector?.lSecVal || ''}) است، نه گروه ۴۴ یا ۲۳: جدول‌ها روی این گروه آزموده نشده‌اند (اطمینان پایین)`);
  if (SEC === '23') out.warnings.push('گروه ۲۳ (پالایشی): جدول ۵ روزهٔ rubric از گروه ۴۴ است؛ پیش‌بینی جلسهٔ بعد و اعداد ۵ روزهٔ همین گروه در بلوک next_session است (آزمون ۱۴ سالهٔ ۱۱ پالایشی، نسخهٔ ۲٫۴)');
  // breadth of the other refiners today (v2.4 rows): share closing in buy / sell queue, share up
  const REFINERS = { 'شپنا': ['7745894403636165'], 'شتران': ['51617145873056483', '34066377223628725'], 'شبندر': ['35366681030756042'], 'شبریز': ['48753732042176709'],
    'شسپا': ['49188729526980541'], 'شراز': ['14031158866706953', '33683240001985963'], 'شاوان': ['60247433951600827'], 'شرانل': ['44013656953678055'],
    'شنفت': ['14073782708315535'], 'شپاس': ['35178706978554988'], 'شبهرن': ['22667016906590506'] };
  const faN = x => String(x || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim(), me = faN(symbol);
  if (SEC === '23') {
    let peers = null;
    if (!REPLAY) { const Pp = G.filter(x => faN(x.lva) !== me && REFINERS[faN(x.lva)]);
      if (Pp.length) peers = { n: Pp.length, buy_queue_share: R(Pp.filter(x => x.pdv >= x.pMax && x.blDs?.[0]?.qmo === 0).length / Pp.length, 2),
        sell_queue_share: R(Pp.filter(x => x.pdv <= x.pMin && x.blDs?.[0]?.qmd === 0).length / Pp.length, 2), up_share: R(Pp.filter(x => x.pcl > x.py).length / Pp.length, 2), source: 'دیده‌بان بازار' }; }
    else { const rows = await Promise.all(Object.entries(REFINERS).filter(([k]) => k !== me).map(async ([, ics]) => { for (const pic of ics) { const j = await J(`ClosingPrice/GetClosingPriceDaily/${pic}/${last.d}`, 2, 10000); const r = j?.closingPriceDaily; if (r && r.qTotTran5J > 0) return r; } return null; }));
      const Pp = rows.filter(Boolean), q = r => r.pDrCotVal / r.priceYesterday - 1;
      if (Pp.length) peers = { n: Pp.length, buy_queue_share: R(Pp.filter(r => q(r) >= limUp - 0.0015 && r.pDrCotVal >= r.priceMax).length / Pp.length, 2),
        sell_queue_share: R(Pp.filter(r => q(r) <= -(limDn - 0.0015) && r.pDrCotVal <= r.priceMin).length / Pp.length, 2), up_share: R(Pp.filter(r => r.pClosing > r.priceYesterday).length / Pp.length, 2), source: 'تاریخچهٔ همتایان در تاریخ آزمون' }; }
    out.group.refiner_peers_today = peers;
  }

  // ---------- 10) today's intraday (5-minute bars) — with timeout, optional
  const tr = opts.lite ? null : await J(REPLAY ? `Trade/GetTradeHistory/${ic}/${last.d}/false` : `Trade/GetTrade/${ic}`, 2, 12000); const T5 = {};
  if (!tr && !opts.lite) out.warnings.push('دادهٔ معاملات درون‌روز امروز نیامد (timeout)');
  (tr?.trade || tr?.tradeHistory || []).filter(x => !x.canceled).sort((a, b) => a.nTran - b.nTran).forEach(x => { const s = Math.floor(x.hEven / 10000) * 60 + Math.floor(x.hEven / 100 % 100); const k = Math.max(0, Math.floor((s - 540) / 5)); const b = T5[k] ||= { o: x.pTran, h: x.pTran, l: x.pTran, c: x.pTran, v: 0, val: 0 }; b.h = Math.max(b.h, x.pTran); b.l = Math.min(b.l, x.pTran); b.c = x.pTran; b.v += x.qTitTran; b.val += x.qTitTran * x.pTran; });
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
    applicable: !newIPO, calibrated_on_group: '44', calibration_applies_to_this_group: SEC === '44',
    note: newIPO ? 'سهم تازه‌عرضه است: جدول کالیبراسیون قابل‌اتکا نیست؛ از بلوک ipo استفاده کن' : 'امتیاز کدال را اضافه کن و باند را دوباره تعیین کن؛ لبه = اختلاف با نرخ پایهٔ همین رژیم',
    tradability: d.closed_at_upper_limit ? 'در صف خرید بسته شده — خرید عملاً ممکن نیست' : d.closed_at_lower_limit ? 'در صف فروش بسته شده — فروش عملاً ممکن نیست' : 'قابل معامله' };

  // ---------- 12) Codal letters from tsetmc (no codal.ir rate limit): recent list + the two Codal rows of the v2.4 score
  const clk = s => { const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null; };
  const at1230 = dEv => { const x = String(dEv); return Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8), 12, 30); };
  const nextOpen = REPLAY ? (out.replay.next_session_dEven ? at1230(out.replay.next_session_dEven) - 4 * 3600e3 : at1230(last.d) + 20 * 3600e3) : Infinity;
  const cdl = await J(`Codal/GetPreparedDataByInsCode/${REPLAY ? 5000 : 60}/${ic}`, 2, 15000);
  const CL = (cdl?.preparedData || []).map(x => ({ t: clk(x.publishDateTime_Gregorian), when: String(x.publishDateTime_Gregorian || '').replace('T', ' ').slice(0, 16), type: codalClassify(x.title), title: String(x.title || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک') }))
    .filter(x => x.t && x.t <= nextOpen).sort((a, b) => b.t - a.t);
  const tClose = at1230(last.d), prevClose = t ? at1230(D[t - 1].d) : tClose - 864e5;
  const cdRows = { capinc_night: CL.some(x => x.t > tClose && ['CAPINC_PROPOSAL', 'CAPINC_STEP', 'EGM'].includes(x.type)), interim_today: CL.some(x => x.t > prevClose && x.t <= tClose && x.type === 'INTERIM_FS') };
  out.codal_recent = cdl ? { source: 'فهرست کدال در tsetmc', letters: CL.slice(0, 15).map(x => [x.when, x.type, x.title]), v24_rows: cdRows,
    note: 'زمان‌ها به وقت تهران. «بعد از جلسه» یعنی بعد از ۱۲:۳۰ روز آخر و قبل از بازگشایی بعدی.' } : { error: 'فهرست کدال از tsetmc نیامد' };

  // ---------- 13) next-session forecast (v2.4): score and table estimated on the 11 refiners, 1392-1405 (research/ in the repo)
  {
    const V24 = { strong: 3, weak: -3, buyq: 3, sellq: -2, smart: 2, buyq_lowvol: 2, buyq_run2: 1, sellq_lowvol: -1, sellq_run2: -1, rsi30: -1, boll: 1, bp05: -1,
      grp_buyq50: 1, grp_sellq50: -1, total_dn1: 1, drop_noq: 1, vol_low: -1, wide_range: -1, capinc_night: 1, interim_today: -1 };
    const vr = d.vol_ratio_20, pr = out.group.refiner_peers_today, lmc = d.last_minus_close_pct, uq = !!d.closed_at_upper_limit, dq = !!d.closed_at_lower_limit;
    const on = { strong: lmc > 1, weak: lmc < -1, buyq: uq, sellq: dq, smart: P.smart_retail_money > 0, buyq_lowvol: uq && vr !== null && vr < 0.7, buyq_run2: uq && d.buy_queue_streak_before_today >= 2,
      sellq_lowvol: dq && vr !== null && vr < 0.7, sellq_run2: dq && d.sell_queue_streak_before_today >= 2, rsi30: P.rsi_below_30 < 0, boll: P.above_upper_bollinger > 0, bp05: P.buyer_power_lt05 < 0,
      grp_buyq50: !!pr && pr.buy_queue_share >= 0.5, grp_sellq50: !!pr && pr.sell_queue_share >= 0.5, total_dn1: (out.group.total_index?.r1 ?? 0) < -0.01,
      drop_noq: d.chg_close_pct < -2 && !dq, vol_low: vr !== null && vr < 0.5, wide_range: limUp >= 0.06, capinc_night: cdRows.capinc_night, interim_today: cdRows.interim_today };
    const pts = {}; let sc = 0; for (const k of Object.keys(V24)) if (on[k]) { pts[k] = V24[k]; sc += V24[k]; }
    const bd = sc <= -6 ? '<=-6' : sc <= -4 ? '-5..-4' : sc <= -2 ? '-3..-2' : sc <= 1 ? '-1..+1' : sc <= 3 ? '+2..+3' : sc <= 5 ? '+4..+5' : '>=+6';
    // [n, up>0.5%, flat ±0.5%, down<-0.5%, up(>0)%, median next-day %, median gap %, next buy queue %, next sell queue %,
    //  median from today's LAST price to tomorrow's پایانی % (rows not in a buy queue), median from the last price to 5 sessions later %, up in 5 %, median 5-day %]
    const TAB = { '<=-6': [1621, 6, 39, 55, 9, -0.67, -2.98, 4, 55, 1.12, 0.29, 22, -2.08], '-5..-4': [3318, 11, 38, 51, 17, -0.54, -1.66, 4, 18, 0.98, 0.62, 33, -1.18],
      '-3..-2': [4795, 18, 36, 46, 29, -0.39, -0.56, 5, 12, 0.14, 0.00, 41, -0.63], '-1..+1': [12017, 34, 34, 33, 48, 0.00, 0.14, 8, 5, 0.03, 0.18, 51, 0.14],
      '+2..+3': [2835, 56, 27, 17, 71, 0.76, 1.59, 17, 4, -0.40, 0.00, 62, 1.27], '+4..+5': [1911, 69, 15, 16, 78, 2.03, 2.76, 35, 6, -0.32, 0.05, 68, 2.86],
      '>=+6': [2662, 84, 9, 7, 90, 2.94, 2.99, 61, 3, -0.14, 1.05, 80, 6.38] };
    const T = TAB[bd], call = T[1] >= 50 ? 'UP' : T[3] >= 45 ? 'DOWN' : 'NONE';
    const adj7 = (d.adjustments_last_year || []).some(a => (Date.UTC(+String(last.d).slice(0, 4), +String(last.d).slice(4, 6) - 1, +String(last.d).slice(6, 8)) - Date.UTC(+String(a[0]).slice(0, 4), +String(a[0]).slice(4, 6) - 1, +String(a[0]).slice(6, 8))) / 864e5 <= 7);
    const sit = newIPO ? 'A' : adj7 ? 'B' : hist < 60 ? 'C' : 'D';
    const flags = [];
    if (limUp <= 0.02) flags.push(`دامنهٔ نوسان باریک (±${Math.round(limUp * 100)}٪): در آزمون ۵۶٪ جلسه‌های بعد بی‌حرکت (±۰٫۵٪) بود`);
    if (REPLAY && out.replay.next_session_dEven) { const gd = (at1230(out.replay.next_session_dEven) - tClose) / 864e5; if (gd >= 4) flags.push(`فاصلهٔ ${Math.round(gd)} روزه تا جلسهٔ بعد: خطای جهت در این حالت ۲۰٪ بود (در برابر ۱۳٪)`); }
    if (uq) flags.push(`صف خرید: فردا دوباره صف خرید ${d.buy_queue_streak_before_today >= 4 ? '۷۸' : d.buy_queue_streak_before_today >= 2 ? '۷۲' : vr !== null && vr > 1.5 ? '۴۱' : '۴۱ تا ۵۲'}٪، صف فروش حدود ۴٪ (با افت شبانهٔ دلار بیش از ۱٪: ۱۲٪)`);
    if (dq) flags.push(`صف فروش: فردا دوباره صف فروش ${d.sell_queue_streak_before_today >= 2 ? '۶۷' : vr !== null && vr > 1.5 ? '۴۱' : '۳۹ تا ۴۹'}٪، صف خرید حدود ۷٪ (در ۱۴۰۳ تا ۱۴۰۵: ۱۲٪)`);
    out.next_session = { version: '2.4', applies: SEC === '23' && sit === 'D', situation: sit, calibrated_on: '۱۱ نماد پالایشی گروه ۲۳، ۱۳۹۲ تا ۱۴۰۵ (حدود ۲۹ هزار روز-نماد)',
      points: pts, score: sc, band: bd, call, prob: { up: T[1] / 100, flat: T[2] / 100, down: T[3] / 100, up_any: T[4] / 100 }, n: T[0],
      expected: { next_close_median_pct: T[5], open_gap_median_pct: T[6], next_buy_queue_pct: T[7], next_sell_queue_pct: T[8], from_last_price_to_next_close_median_pct: T[9],
        from_last_price_to_5d_median_pct: T[10], up_in_5d_pct: T[11], five_day_median_pct: T[12], round_trip_cost_pct: 1.25 },
      can_buy_now: !uq, can_sell_now: !dq, confidence_flags: flags,
      walk_forward: 'آزمون خارج از نمونه (هر سال فقط با سال‌های قبل): وقتی پیش‌بینی جهت داد و حرکت بی‌حرکت نبود، ۸۱ تا ۸۵٪ درست بود؛ خلاف جهت ۱۰ تا ۱۵٪؛ بی‌حرکت ۶ تا ۳۸٪ (۱۴۰۳ تا ۱۴۰۵)',
      note: SEC === '23' ? (sit === 'D' ? 'قیمت «پایانی» یعنی میانگین وزنی روز؛ بخش بزرگ این پیش‌بینی از فاصلهٔ آخرین قیمت امروز با پایانی می‌آید و قبل از فردا در قیمت هست. از آخرین قیمت امروز، حرکت مورد انتظار در همهٔ ناحیه‌ها از هزینهٔ رفت‌وبرگشت ۱٫۲۵٪ کمتر است.' : 'موقعیت غیرعادی (A/B/C): جدول معتبر نیست')
        : 'این جدول روی پالایشی‌ها برآورد شده؛ برای این گروه آزموده نشده. برای جلسهٔ بعد از rubric.calibration_for_this_band.p_up_1d استفاده کن.' };
  }
  return out;
}

/* ------------------------------------------------------------------------
   B1) petroReplay(symbol, date) — the replay test: "forecast for date X, check it on the next session".
   snapshot = petroSnapshot as of the close of X (nothing after X is used, only the date of the next session);
   outcome  = what really happened next; check = the next-session call and the v2.3 decision against it,
   with automatic reasons for a miss. Write the sheet from `snapshot` first, then read outcome/check (blind test). */
async function petroReplay(symbol, date, opts = {}) {
  const snap = await petroSnapshot(symbol, { ...opts, asOf: date });
  if (!snap || snap.error) return { symbol, as_of: date, error: (snap && snap.error) || 'snapshot failed' };
  const BASE = 'https://cdn.tsetmc.com/api/', cache = opts.cache || null;
  const J = async u => { if (cache && cache.has(u)) return cache.get(u);
    for (let i = 0; i < 3; i++) { try { const r = await fetch(BASE + u); if (r.ok) { const j = await r.json(); if (cache) cache.set(u, j); return j; } } catch (e) { /* retry */ } await new Promise(r => setTimeout(r, 800 * (i + 1))); } return null; };
  const R = (x, dd = 2) => (x === null || x === undefined || !isFinite(x)) ? null : Math.round(x * 10 ** dd) / 10 ** dd;
  const jalOf = dEv => { const x = String(dEv); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8)))).replace(/[^\d/]/g, ''); };
  const utc = (dEv, hh = 0, mm = 0) => { const x = String(dEv); return Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8), hh, mm); };
  const ic = snap.instrument.insCode, d0 = snap.replay.session_used_dEven;
  const dl = await J(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`);
  const rows = (dl?.closingPriceDaily || []).filter(r => r.qTotTran5J > 0).sort((a, b) => a.dEven - b.dEven);
  const i0 = rows.findIndex(r => r.dEven === d0);
  if (i0 < 0 || i0 === rows.length - 1) return { symbol, as_of: date, snapshot: snap, error: i0 < 0 ? 'روز آزمون در سابقه پیدا نشد' : 'هنوز جلسهٔ بعدی نیامده' };
  // adjustment from day X forward (a dividend or capital increase after X must not look like a fall)
  const fac = []; let fc = 1; for (let i = rows.length - 1; i >= i0; i--) { fac[i] = fc; if (i > i0) { let q = rows[i].priceYesterday / rows[i - 1].pClosing; if (q > 0.995 && q < 1.005) q = 1; fc *= q; } }
  const C = i => rows[i].pClosing * fac[i], r0 = rows[i0], n1 = rows[i0 + 1];
  const ret = k => i0 + k < rows.length ? C(i0 + k) / C(i0) - 1 : null, lastX = r0.pDrCotVal * fac[i0];
  const fromLast = k => i0 + k < rows.length ? C(i0 + k) / lastX - 1 : null;
  const th = await J(`MarketData/GetStaticThreshold/${ic}/${n1.dEven}`); const rec = (th?.staticThreshold || []).filter(x => x.dEven === n1.dEven).sort((a, b) => a.hEven - b.hEven).pop();
  const nq = rec ? (n1.pDrCotVal >= rec.psGelStaMax ? 'buy_queue' : n1.pDrCotVal <= rec.psGelStaMin ? 'sell_queue' : 'none') : 'unknown';
  const nLim = rec ? [R(1 - rec.psGelStaMin / n1.priceYesterday, 3), R(rec.psGelStaMax / n1.priceYesterday - 1, 3)] : null;
  const ixNext = async code => { const h = await J('Index/GetIndexB2History/' + code); const a = (h?.indexB2 || []).sort((x, y) => x.dEven - y.dEven); const k = a.findIndex(x => x.dEven === d0);
    return k >= 0 && k + 1 < a.length && a[k + 1].dEven === n1.dEven ? a[k + 1].xNivInuClMresIbs / a[k].xNivInuClMresIbs - 1 : null; };
  const [gN, tN] = await Promise.all([ixNext(snap.group.group_index_code), ixNext('32097828799138957')]);
  const cdl = await J(`Codal/GetPreparedDataByInsCode/5000/${ic}`);
  const clk = x => { const m = String(x || '').match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null; };
  const news = (cdl?.preparedData || []).map(x => ({ t: clk(x.publishDateTime_Gregorian), type: codalClassify(x.title), title: String(x.title || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک'), when: String(x.publishDateTime_Gregorian || '').replace('T', ' ').slice(0, 16) }))
    .filter(x => x.t && x.t > utc(d0, 12, 30) && x.t <= utc(n1.dEven, 12, 30));
  const r1 = ret(1), gap = n1.priceFirst * fac[i0 + 1] / C(i0) - 1, gapDays = Math.round((utc(n1.dEven) - utc(d0)) / 864e5);
  const outcome = { next_session: jalOf(n1.dEven), days_until_next_session: gapDays, next_close_pct: R(100 * r1), open_gap_pct: R(100 * gap),
    next_high_pct: R(100 * (n1.priceMax * fac[i0 + 1] / C(i0) - 1)), next_low_pct: R(100 * (n1.priceMin * fac[i0 + 1] / C(i0) - 1)), next_queue: nq, next_price_limits_pct: nLim,
    from_last_price_to_next_close_pct: R(100 * fromLast(1)), ret_3d_pct: R(100 * ret(3)), ret_5d_pct: R(100 * ret(5)), from_last_price_to_5d_pct: R(100 * fromLast(5)),
    group_index_next_pct: R(100 * gN), total_index_next_pct: R(100 * tN), adjusted_next_day: Math.abs(n1.priceYesterday / r0.pClosing - 1) > 0.005,
    news_until_next_close: news.slice(0, 8).map(x => [x.when, x.type, x.title]) };
  // check
  const cls = x => x === null ? null : x > 0.005 ? 'UP' : x < -0.005 ? 'DOWN' : 'FLAT';
  const ns = snap.next_session || {}, real = cls(r1), side = ns.call === 'UP' ? 1 : ns.call === 'DOWN' ? -1 : 0;
  const verdict = !side ? 'NO_CALL' : real === 'FLAT' ? 'FLAT' : (real === ns.call ? 'RIGHT' : 'WRONG');
  const tags = [];
  if (verdict === 'WRONG' || verdict === 'FLAT') {
    const opp = x => x !== null && x * side < 0;
    if (opp(gN) && Math.abs(gN) >= 0.01) tags.push('GROUP_MOVE'); if (opp(tN) && Math.abs(tN) >= 0.01) tags.push('MARKET_MOVE'); if (opp(gap) && Math.abs(gap) >= 0.015) tags.push('GAP');
    const dq = snap.daily || {}; if ((dq.closed_at_upper_limit && side > 0 && nq !== 'buy_queue') || (dq.closed_at_lower_limit && side < 0 && nq !== 'sell_queue')) tags.push('QUEUE_FLIP');
    if (nLim && dq.price_limits_pct && Math.abs(nLim[1] - dq.price_limits_pct[1]) > 0.004) tags.push('RANGE_CHANGE'); if (gapDays >= 4) tags.push('LONG_BREAK'); if (news.length) tags.push('NEWS');
    if (outcome.adjusted_next_day) tags.push('ADJUSTMENT'); if (verdict === 'FLAT') tags.push('SMALL_MOVE'); if (!tags.length) tags.push('OWN');
  }
  const rb = snap.rubric || {}, cal = rb.calibration_for_this_band || {}, edge = rb.edge_vs_base_5d_pp;
  const dec = !rb.applicable ? 'NA' : (edge >= 8 && cal.p_up_5d >= 0.55 && !(snap.daily || {}).closed_at_upper_limit) ? 'BUY' : (edge <= -8 && cal.p_up_5d <= 0.40 && !(snap.daily || {}).closed_at_lower_limit) ? 'SELL' : 'NO_EDGE';
  const r5 = ret(5);
  const check = { next_session_call: ns.call || null, next_session_band: ns.band || null, real_next: real, verdict, reasons: tags,
    v23_decision: dec, v23_decision_right_5d: dec === 'BUY' ? (r5 === null ? null : r5 > 0) : dec === 'SELL' ? (r5 === null ? null : r5 <= 0) : null,
    one_day_trade_from_last_net_pct: ns.can_buy_now === false || fromLast(1) === null ? null : R(100 * fromLast(1) - 1.25),
    reason_help: { GROUP_MOVE: 'کل پالایشی‌ها خلاف جهت رفتند (≥۱٪)', MARKET_MOVE: 'شاخص کل خلاف جهت رفت (≥۱٪)', GAP: 'گپ بازگشایی خلاف جهت (≥۱٫۵٪)', QUEUE_FLIP: 'صف امروز فردا شکست',
      RANGE_CHANGE: 'دامنهٔ نوسان عوض شد', LONG_BREAK: 'فاصلهٔ ۴ روز یا بیشتر تا جلسهٔ بعد', NEWS: 'اطلاعیهٔ کدال بعد از پایان جلسه', ADJUSTMENT: 'تعدیل قیمت (مجمع/افزایش سرمایه)', SMALL_MOVE: 'حرکت کمتر از ±۰٫۵٪', OWN: 'علت بیرونی پیدا نشد؛ حرکت خود سهم' } };
  return { symbol, as_of: snap.replay.as_of, session_used: snap.replay.session_used, snapshot: snap, outcome, check };
}

/* B2) petroReplayRange(symbol, from, to) — petroReplay for every session between two dates (max 60), with a summary.
   Lite mode (no holders, no intraday); histories are fetched once and shared. */
async function petroReplayRange(symbol, from, to, opts = {}) {
  const lat = x => String(x || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).trim().split(/[/-]/).map((p, i) => i ? p.padStart(2, '0') : p).join('/');
  const F = lat(from), T = lat(to), cache = new Map(), max = opts.max || 60;
  const first = await petroReplay(symbol, T, { lite: true, cache });
  if (first.error && !first.snapshot) return first;
  const ic = first.snapshot.instrument.insCode, dl = cache.get(`ClosingPrice/GetClosingPriceDailyList/${ic}/0`);
  const jalOf = dEv => { const x = String(dEv); return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8)))).replace(/[^\d/]/g, ''); };
  const days = (dl?.closingPriceDaily || []).filter(r => r.qTotTran5J > 0).map(r => jalOf(r.dEven)).filter(j => j >= F && j <= T).sort().slice(-max);
  const rows = [];
  for (const j of days) { const x = j === first.as_of ? first : await petroReplay(symbol, j, { lite: true, cache });
    if (x.error) { rows.push({ date: j, error: x.error }); continue; }
    const ns = x.snapshot.next_session || {};
    rows.push({ date: j, next: x.outcome.next_session, score: ns.score, band: ns.band, call: ns.call, p: ns.prob, real_next_pct: x.outcome.next_close_pct, gap_pct: x.outcome.open_gap_pct,
      from_last_pct: x.outcome.from_last_price_to_next_close_pct, verdict: x.check.verdict, reasons: x.check.reasons, v23: x.check.v23_decision, v23_right_5d: x.check.v23_decision_right_5d, ret_5d_pct: x.outcome.ret_5d_pct }); }
  const ok = rows.filter(r => !r.error), calls = ok.filter(r => r.verdict !== 'NO_CALL'), right = calls.filter(r => r.verdict === 'RIGHT').length, wrong = calls.filter(r => r.verdict === 'WRONG').length, flat = calls.filter(r => r.verdict === 'FLAT').length;
  const why = {}; calls.filter(r => r.verdict === 'WRONG').forEach(r => r.reasons.forEach(t => { why[t] = (why[t] || 0) + 1; }));
  return { symbol, from: F, to: T, sessions: ok.length, rows,
    summary: { calls: calls.length, right, wrong, flat, right_pct_excl_flat: right + wrong ? Math.round(100 * right / (right + wrong)) : null, reasons_of_wrong: why,
      note: 'RIGHT/WRONG = جهت جلسهٔ بعد (پایانی به پایانی)؛ FLAT = حرکت کمتر از ±۰٫۵٪. نتیجهٔ چند روز محدود نوسان زیادی دارد؛ آزمون ۱۴ ساله در بلوک next_session.walk_forward است.' } };
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
// letter type from its title (used by codalSnapshot and the daily report)
function codalClassify(t) {
  t = String(t || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
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
    for (const [k, rx] of rules) if (rx.test(t)) return k; return 'OTHER';
}

async function codalSnapshot(symbol, days = 120, opts = {}) {
  const fa = s => (s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const jal = dt => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt).replace(/[^\d/]/g, '');
  const toDig = s => (s || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
  const q = (sym, from, to, page) => 'https://search.codal.ir/api/search/v2/q?&Audit=true&AuditorRef=-1&Category=-1&Childs=true&CompanyState=-1&CompanyType=-1&Consolidatable=true&IsNotAudited=false&Length=-1&LetterType=-1&Mains=true&NotAudited=true&NotConsolidatable=true&Publisher=false&TracingNo=-1&search=true&PageNumber=' + page + '&Symbol=' + encodeURIComponent(sym) + '&FromDate=' + encodeURIComponent(from) + '&ToDate=' + encodeURIComponent(to);
  // search.codal.ir rate-limits bursts (HTTP 429): back off and space the calls
  const J = async u => { for (let i = 0; i < 5; i++) { const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 20000);
      try { const r = await fetch(u, { signal: ctl.signal }); clearTimeout(tm); if (r.ok) return await r.json(); if (r.status === 429) { await sleep(4000 * 2 ** i); continue; } } catch (e) { clearTimeout(tm); } await sleep(1500 * (i + 1)); } return null; };
  const classify = codalClassify;
  // as-of (replay): the window ends on the test date ('1403/07/07')
  let now = new Date();
  if (opts.asOf) { const want = toDig(String(opts.asOf)).split(/[/-]/).map((p, i) => i ? p.padStart(2, '0') : p).join('/'); let dt = new Date(now);
    for (let k = 0; k < 9000 && jal(dt) > want; k++) dt = new Date(dt - 864e5); now = dt; }
  const from = jal(new Date(now - days * 864e5)), to = jal(now);
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
  const REFINERY = ['شپنا', 'شتران', 'شبندر', 'شبریز', 'شسپا', 'شراز', 'شاوان', 'شرانل', 'شنفت', 'شپاس', 'شبهرن'];
  const PETRO = ['فارس', 'شپدیس', 'نوری', 'جم', 'پارس', 'تاپیکو', 'پترول', 'شیراز', 'زاگرس', 'مارون', 'آریا', 'شگویا', 'بوعلی', 'کرماشا'];
  const peers = (REFINERY.includes(fa(symbol)) ? REFINERY : PETRO).filter(p => p !== fa(symbol));
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

return { petroSnapshot, petroReplay, petroReplayRange, petroEvaluate, codalSnapshot, codalLetterText, codalClassify };
})(PW_NET.fetch);

/* ==========================================================================
   chart.js — نمودار تکنیکال «دیدبان پتروشیمی» (SVG، بدون کتابخانهٔ بیرونی)
   Draws from petroSnapshot().technical: candles + volume, MA 20/50/200 (weekly 10/30), Bollinger, Ichimoku,
   Fibonacci (retracement + extension), pivots, support/resistance, 60-day trend channel, chart patterns, swings,
   RSI divergence, the simple trade plan, RSI and MACD panes; daily / weekly; hover crosshair; PNG export.
   Needs: nothing global. API: PWChart.html(), PWChart.mount(root, bundle, { plan, store, toast })
   ========================================================================== */
const PWChart = (() => {
  const LAYERS = [
    ['ma', 'میانگین‌ها', ['--c-ma1', '--c-ma2', '--c-ma3']], ['bb', 'Bollinger', ['--c-band']], ['ichi', 'ایچیموکو', ['--c-tenkan', '--c-kijun']],
    ['fib', 'فیبوناچی', ['--c-fib']], ['piv', 'پیوت', ['--muted']], ['lv', 'حمایت و مقاومت', ['--text']], ['ch', 'کانال روند', ['--accent']],
    ['pat', 'الگو، چرخش و واگرایی', ['--text']], ['plan', 'برنامهٔ معامله', ['--accent', '--neg', '--pos']],
    ['vol', 'حجم', ['--c-band']], ['rsi', 'RSI', ['--c-ma1']], ['macd', 'MACD', ['--c-ma1', '--c-ma2']]];
  const DEF = { tf: 'D', range: 1, layers: ['ma', 'fib', 'lv', 'pat', 'plan', 'vol', 'rsi'] };
  const RANGES = { D: [[63, '۳ ماه'], [126, '۶ ماه'], [250, '۱ سال']], W: [[26, '۶ ماه'], [52, '۱ سال'], [104, '۲ سال']] };
  const REG = new WeakMap(), WIRED = new WeakSet();
  const isNum = x => typeof x === 'number' && isFinite(x);
  const nf = (x, d = 0) => isNum(x) ? x.toLocaleString('fa-IR', { maximumFractionDigits: d }) : '—';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dEvDate = dEv => { const s = String(dEv); return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), 12); };
  const jFull = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dEvDate(dEv));
  const jMonth = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { month: 'numeric' }).format(dEvDate(dEv));
  const jMonthName = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(dEvDate(dEv));
  const jYear = dEv => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: '2-digit' }).format(dEvDate(dEv));

  // ------------------------------------------------------------ indicators (same definitions as the collector)
  const smaA = (a, k) => a.map((_, i) => i + 1 < k ? null : a.slice(i + 1 - k, i + 1).reduce((s, x) => s + x, 0) / k);
  const emaA = (a, k) => { const e = [], al = 2 / (k + 1); a.forEach((x, i) => e.push(i ? al * x + (1 - al) * e[i - 1] : x)); return e; };
  const wilderA = (a, k) => { const e = []; a.forEach((x, i) => e.push(i ? e[i - 1] + (x - e[i - 1]) / k : x)); return e; };
  function indicators(B, tf) {
    const C = B.map(b => b[4]), H = B.map(b => b[2]), Lw = B.map(b => b[3]);
    const [k1, k2, k3] = tf === 'W' ? [10, 30, null] : [20, 50, 200];
    const m1 = smaA(C, k1), m2 = smaA(C, k2), m3 = k3 ? smaA(C, k3) : null;
    const s20 = smaA(C, 20), bbU = [], bbL = [];
    C.forEach((_, i) => { if (s20[i] === null) { bbU.push(null); bbL.push(null); return; } let v = 0; for (let j = i - 19; j <= i; j++) v += (C[j] - s20[i]) ** 2; const sd = Math.sqrt(v / 20); bbU.push(s20[i] + 2 * sd); bbL.push(s20[i] - 2 * sd); });
    const up = C.map((x, i) => i ? Math.max(0, x - C[i - 1]) : 0), dn = C.map((x, i) => i ? Math.max(0, C[i - 1] - x) : 0);
    const au = wilderA(up, 14), ad = wilderA(dn, 14), rsi = au.map((u, i) => i < 15 ? null : 100 - 100 / (1 + u / (ad[i] || 1e-9)));
    const e12 = emaA(C, 12), e26 = emaA(C, 26), macd = e12.map((x, i) => x - e26[i]), sig = emaA(macd, 9);
    const hh = (k, i) => { if (i + 1 < k) return null; let m = -Infinity; for (let j = i - k + 1; j <= i; j++) m = Math.max(m, H[j]); return m; };
    const ll = (k, i) => { if (i + 1 < k) return null; let m = Infinity; for (let j = i - k + 1; j <= i; j++) m = Math.min(m, Lw[j]); return m; };
    const ten = C.map((_, i) => hh(9, i) === null ? null : (hh(9, i) + ll(9, i)) / 2), kij = C.map((_, i) => hh(26, i) === null ? null : (hh(26, i) + ll(26, i)) / 2);
    const spA = C.map((_, i) => ten[i] === null || kij[i] === null ? null : (ten[i] + kij[i]) / 2), spB = C.map((_, i) => hh(52, i) === null ? null : (hh(52, i) + ll(52, i)) / 2);
    return { m1, m2, m3, k1, k2, k3, bbU, bbL, bbM: s20, rsi, macd: C.map((_, i) => i < 34 ? null : macd[i]), sig: C.map((_, i) => i < 34 ? null : sig[i]), ten, kij, spA, spB };
  }

  // ------------------------------------------------------------ static shell (controls + drawing box)
  function html(opts = {}) {
    return `<div class="tcw" data-tchart>
      <div class="tc-ctl"><div class="seg" role="group" aria-label="بازهٔ زمانی"><button data-ch="tf" data-v="D">روزانه</button><button data-ch="tf" data-v="W">هفتگی</button></div>
        <div class="seg" role="group" aria-label="طول نمودار" data-el="ranges"></div>
        <span class="grow"></span>${opts.exportButtons === false ? '' : '<button class="btn sm" data-ch="png">دانلود تصویر</button><button class="btn sm" data-ch="copyimg">کپی تصویر</button>'}</div>
      <div class="tc-layers" role="group" aria-label="لایه‌ها">${LAYERS.map(([k, lbl, cs]) => `<button class="lchip" data-ch="layer" data-v="${k}" aria-pressed="false">${cs.map(c => `<i style="background:var(${c})"></i>`).join('')}${lbl}</button>`).join('')}</div>
      <div class="tc-svg" dir="ltr"></div><div class="tc-tip" hidden></div>
      <p class="muted small tc-note" data-el="note"></p></div>`;
  }

  // ------------------------------------------------------------ drawing
  function draw(box) {
    const ctx = REG.get(box); if (!ctx) return;
    const st = { ...DEF, ...(ctx.store ? ctx.store.get('chart', {}) : {}) };
    const L = new Set(st.layers), tf = st.tf === 'W' ? 'W' : 'D';
    box.querySelectorAll('[data-ch="tf"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === tf)));
    box.querySelectorAll('[data-ch="layer"]').forEach(x => x.setAttribute('aria-pressed', String(L.has(x.dataset.v))));
    const rg = box.querySelector('[data-el="ranges"]');
    rg.innerHTML = RANGES[tf].map(([, lbl], k) => `<button data-ch="range" data-v="${k}" aria-pressed="${k === st.range}">${lbl}</button>`).join('');
    const holder = box.querySelector('.tc-svg');
    const t = ctx.b && ctx.b.tsetmc, tk = t && !t.error && t.technical;
    const all = tk ? (tf === 'W' ? tk.ohlc_weekly : tk.ohlc_daily) || [] : [];
    if (all.length < 5) { holder.innerHTML = `<p class="muted small">${tk ? 'سابقهٔ کافی برای نمودار نیست.' : 'این خروجی بخش technical ندارد (نسخهٔ قدیمی اسکریپت)؛ دوباره داده بگیرید.'}</p>`; ctx.geo = null; return; }
    const css = getComputedStyle(box), col = (v, fb) => (css.getPropertyValue(v) || '').trim() || fb;
    const K = { bg: col('--bg', '#fff'), text: col('--text', '#16191d'), muted: col('--muted', '#5b6470'), line: col('--line', '#dfe3e8'), pos: col('--pos', '#137a3e'), neg: col('--neg', '#b42318'),
      accent: col('--accent', '#0f6e66'), ma1: col('--c-ma1', '#2a78d6'), ma2: col('--c-ma2', '#eb6834'), ma3: col('--c-ma3', '#4a3aa7'), ten: col('--c-tenkan', '#e87ba4'), kij: col('--c-kijun', '#eda100'),
      fib: col('--c-fib', '#1baf7a'), band: col('--c-band', '#8a94a0'), cloudUp: col('--pos', '#137a3e'), cloudDn: col('--neg', '#b42318') };
    const FONT = 'Vazirmatn, Tahoma, sans-serif';
    const W = Math.max(300, Math.round(holder.clientWidth || 640));
    const narrow = W < 560;
    const IND = indicators(all, tf);
    const want = RANGES[tf][Math.max(0, Math.min(2, st.range))][0], n = Math.min(all.length, want), s = all.length - n, B = all.slice(s);
    const F = L.has('ichi') ? 26 : L.has('piv') ? 7 : 3;
    const mL = narrow ? 46 : 50, mR = narrow ? 86 : 118, mT = 24;
    const PW = W - mL - mR, bw = PW / (n + F), x0 = mL, xOf = i => x0 + (i + 0.5) * bw;
    const Hp = Math.max(230, Math.min(400, Math.round(W * 0.46))), Hv = L.has('vol') ? 42 : 0, Hr = L.has('rsi') ? 72 : 0, Hm = L.has('macd') ? 72 : 0, gap = 14, Hx = 20;
    const yP0 = mT, yV0 = yP0 + Hp + (Hv ? gap : 0), yR0 = yV0 + Hv + (Hr ? gap : 0), yM0 = yR0 + Hr + (Hm ? gap : 0), Htot = yM0 + Hm + Hx;
    // ---- visible price domain
    let lo = Infinity, hi = -Infinity; B.forEach(b => { lo = Math.min(lo, b[3]); hi = Math.max(hi, b[2]); });
    const vis = a => a ? a.slice(s).filter(isNum) : [];
    const widen = xs => xs.forEach(v => { if (isNum(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    if (L.has('ma')) { widen(vis(IND.m1)); widen(vis(IND.m2)); }
    if (L.has('bb')) { widen(vis(IND.bbU)); widen(vis(IND.bbL)); }
    const baseLo = lo, baseHi = hi, near = v => isNum(v) && v >= baseLo * 0.9 && v <= baseHi * 1.1;
    const fibo = tk.fibonacci, piv = tf === 'W' ? tk.pivots && tk.pivots.weekly_from_last_completed_week : tk.pivots && tk.pivots.next_session_daily;
    const chart = t.chart || {}, plan = ctx.plan || {};
    const planLines = [];
    if (L.has('plan') && plan.tradable) {
      if (plan.signal && plan.signal.side === 'buy') { planLines.push([plan.signal.stop, 'حد ضرر', K.neg]); planLines.push([plan.signal.target, 'هدف', K.pos]); }
      else if (plan.trigger) { planLines.push([plan.trigger.level, 'ماشهٔ خرید', K.accent]); planLines.push([plan.trigger.target, 'هدف ماشه', K.pos]); }
      if (isNum(plan.holdStop)) planLines.push([plan.holdStop, 'حد ضرر دارنده', K.neg]);
    }
    if (L.has('fib') && fibo) widen(fibo.retracement_levels.map(x => x[1]).filter(near));
    if (L.has('plan')) widen(planLines.map(x => x[0]).filter(near));
    if (L.has('lv')) widen([chart.nearest_support && chart.nearest_support[1], chart.nearest_resistance && chart.nearest_resistance[1]].filter(near));
    if (L.has('piv') && piv) widen(['P', 'R1', 'S1'].map(k => piv[k]).filter(near));
    if (L.has('ichi')) { widen(vis(IND.ten)); widen(vis(IND.kij)); }
    const pad = (hi - lo) * 0.05 || hi * 0.02; lo -= pad; hi += pad;
    const yOf = v => yP0 + (hi - v) / (hi - lo) * Hp, inP = v => isNum(v) && v >= lo && v <= hi;
    // daily date → bar index (weekly: the week that contains that day)
    const idxOf = dEv => { const k = tf === 'W' ? all.findIndex(b => b[0] >= dEv) : all.findIndex(b => b[0] === dEv); return k < 0 ? null : k - s; };
    const o = [], lab = [];
    const ln = (x1, y1, x2, y2, c, w = 1, dash = '', op = 1) => o.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${op < 1 ? ` stroke-opacity="${op}"` : ''}/>`);
    const tx = (x, y, s_, c, size = 11, anchor = 'start', weight = 400, extra = '') => o.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${c}" font-size="${size}" font-family="${FONT}" text-anchor="${anchor}" font-weight="${weight}"${extra}>${esc(s_)}</text>`);
    const path = (vals, c, w = 1.5, dash = '', shift = 0) => { let d = '', pen = false; vals.forEach((v, i) => { const k = i - s + shift; if (!isNum(v) || k < 0 || k >= n + F) { pen = false; return; } d += (pen ? 'L' : 'M') + xOf(k).toFixed(1) + ' ' + yOf(v).toFixed(1); pen = true; });
      if (d) o.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`); };
    const hline = (v, c, label, { w = 1, dash = '5 4', from = 0, op = 0.9, strong = false } = {}) => { if (!inP(v)) return; ln(Math.max(x0, xOf(from) - bw / 2), yOf(v), x0 + PW, yOf(v), c, w, dash, op); lab.push({ y: yOf(v), t: label, c, strong }); };
    // ---- background, title, grid
    o.push(`<rect x="0" y="0" width="${W}" height="${Htot}" fill="${K.bg}"/>`);
    const last = B[B.length - 1], prev = all[all.length - 2];
    tx(x0 + PW, 14, `${ctx.b.symbol || ''} · ${tf === 'W' ? 'هفتگی' : 'روزانه'} · ${jFull(last[0])} · پایانی ${nf(last[4])}`, K.text, 12, 'start', 700, ' direction="rtl"');
    const step = (() => { const raw = (hi - lo) / 5, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; })();
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { ln(x0, yOf(v), x0 + PW, yOf(v), K.line, 1); tx(x0 - 4, yOf(v) + 4, nf(v), K.muted, 10, 'end'); }
    ln(x0 + PW, yP0, x0 + PW, yP0 + Hp, K.line, 1);
    if (F > 3) o.push(`<rect x="${(xOf(n) - bw / 2).toFixed(1)}" y="${yP0}" width="${(F * bw).toFixed(1)}" height="${Hp}" fill="${K.line}" fill-opacity=".25"/>`);
    const clipId = 'pwc' + Math.random().toString(36).slice(2, 8), cs = o.length, later = [];
    // ---- Ichimoku cloud (behind candles): span A/B projected 26 bars ahead
    if (L.has('ichi')) {
      for (let k = 0; k < n + F - 1; k++) { const i = s + k - 26, j = i + 1; if (i < 0 || j >= all.length) continue;
        const a1 = IND.spA[i], b1 = IND.spB[i], a2 = IND.spA[j], b2 = IND.spB[j]; if (![a1, b1, a2, b2].every(isNum)) continue;
        o.push(`<polygon points="${xOf(k).toFixed(1)},${yOf(a1).toFixed(1)} ${xOf(k + 1).toFixed(1)},${yOf(a2).toFixed(1)} ${xOf(k + 1).toFixed(1)},${yOf(b2).toFixed(1)} ${xOf(k).toFixed(1)},${yOf(b1).toFixed(1)}" fill="${a1 >= b1 ? K.cloudUp : K.cloudDn}" fill-opacity=".13"/>`); }
      path(IND.spA, K.cloudUp, 0.8, '', 26); path(IND.spB, K.cloudDn, 0.8, '', 26);
    }
    if (L.has('bb')) { let d = ''; const up = [], dn = []; for (let k = 0; k < n; k++) { const i = s + k; if (isNum(IND.bbU[i])) { up.push([xOf(k), yOf(IND.bbU[i])]); dn.push([xOf(k), yOf(IND.bbL[i])]); } }
      if (up.length) { d = 'M' + up.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + 'L' + dn.reverse().map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + 'Z'; o.push(`<path d="${d}" fill="${K.band}" fill-opacity=".12" stroke="${K.band}" stroke-width=".8"/>`); }
      path(IND.bbM, K.band, 1, '3 3'); }
    // ---- Fibonacci
    const fibOn = L.has('fib') && fibo && fibo.retracement_levels;
    if (fibOn) {
      const f0 = idxOf(fibo.swing_from[0]), f1 = idxOf(fibo.swing_to[0]), from = f0 === null ? 0 : Math.max(0, f0);
      const lv = Object.fromEntries(fibo.retracement_levels.map(([r, p]) => [r, p]));
      if (inP(lv[0.382]) || inP(lv[0.618])) { const ya = yOf(Math.min(hi, Math.max(lo, lv[0.382]))), yb = yOf(Math.min(hi, Math.max(lo, lv[0.618])));
        o.push(`<rect x="${(xOf(from) - bw / 2).toFixed(1)}" y="${Math.min(ya, yb).toFixed(1)}" width="${(x0 + PW - xOf(from) + bw / 2).toFixed(1)}" height="${Math.abs(yb - ya).toFixed(1)}" fill="${K.fib}" fill-opacity=".08"/>`); }
      fibo.retracement_levels.forEach(([r, p]) => hline(p, K.fib, `${nf(r * 100, 1)}٪ ${nf(p)}`, { from, dash: r === 0 || r === 1 ? '' : '5 4', w: r === 0.618 || r === 0.382 || r === 0.5 ? 1.3 : 1 }));
      fibo.extension_levels.forEach(([r, p]) => hline(p, K.fib, `${nf(r * 100, 1)}٪ ${nf(p)}`, { from: f1 === null ? from : Math.max(0, f1), dash: '2 4', op: 0.7 }));
      if (f0 !== null && f1 !== null && f0 >= 0 && f1 >= 0) ln(xOf(f0), yOf(fibo.swing_from[1]), xOf(f1), yOf(fibo.swing_to[1]), K.fib, 1.2, '6 3');
    }
    // ---- pivots (next session / next week) in the future area
    if (L.has('piv') && piv) ['R2', 'R1', 'P', 'S1', 'S2'].forEach(k => { const v = piv[k]; if (!inP(v)) return; ln(xOf(n) - bw / 2, yOf(v), x0 + PW, yOf(v), K.muted, k === 'P' ? 1.4 : 1, k === 'P' ? '' : '3 3');
      lab.push({ y: yOf(v), t: `${tf === 'W' ? 'پیوت هفتگی' : 'پیوت'} ${k} ${nf(v)}`, c: K.muted }); });
    // ---- support / resistance
    if (L.has('lv')) {
      const ns = chart.nearest_support, nr = chart.nearest_resistance, poc = (chart.levels_sorted_high_to_low || []).find(x => /گره حجمی 1/.test(x[0]));
      if (nr) hline(nr[1], K.text, `مقاومت ${nf(nr[1])}`, { dash: '8 4', w: 1.3, strong: true, op: 0.75 });
      if (ns) hline(ns[1], K.text, `حمایت ${nf(ns[1])}`, { dash: '8 4', w: 1.3, strong: true, op: 0.75 });
      if (poc && (!ns || poc[1] !== ns[1]) && (!nr || poc[1] !== nr[1])) hline(poc[1], K.muted, `گره حجمی ${nf(poc[1])}`, { dash: '1 3', w: 1.4, op: 0.8 });
    }
    // ---- trend channel (daily, last 60 closes, log regression)
    if (L.has('ch') && tf === 'D' && all.length >= 60) {
      const i0 = all.length - 60, ys = all.slice(i0).map(b => Math.log(b[4])); let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
      ys.forEach((y, x) => { sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }); const N = 60, vx = sxx / N - (sx / N) ** 2, vy = syy / N - (sy / N) ** 2, cv = sxy / N - (sx / N) * (sy / N), bb = cv / vx, aa = sy / N - bb * sx / N, sd = Math.sqrt(Math.max(vy - bb * bb * vx, 0));
      const k0 = Math.max(0, i0 - s), xa = k0 - (i0 - s);
      [[0, '', 1], [2, '', 1.1], [-2, '', 1.1]].forEach(([m]) => { const ya = Math.exp(aa + bb * xa + m * sd), yb = Math.exp(aa + bb * 59 + m * sd); if (inP(ya) || inP(yb)) ln(xOf(k0), yOf(ya), xOf(n - 1), yOf(yb), K.accent, m ? 1.2 : 0.8, m ? '' : '4 3', 0.8); });
      lab.push({ y: yOf(Math.exp(aa + bb * 59 + 2 * sd)), t: 'سقف کانال', c: K.accent }); lab.push({ y: yOf(Math.exp(aa + bb * 59 - 2 * sd)), t: 'کف کانال', c: K.accent });
    }
    // ---- moving averages + Ichimoku lines
    if (L.has('ma')) { path(IND.m1, K.ma1, 1.6); path(IND.m2, K.ma2, 1.6); if (IND.m3) path(IND.m3, K.ma3, 1.8); }
    if (L.has('ichi')) { path(IND.ten, K.ten, 1.3); path(IND.kij, K.kij, 1.5, '6 3'); }
    // ---- candles
    const cw = Math.max(1, Math.min(14, bw * 0.66));
    B.forEach((b, k) => { const [, O, Hh, Ll, Cc] = b, upc = Cc >= O, c = upc ? K.pos : K.neg, x = xOf(k);
      ln(x, yOf(Hh), x, yOf(Ll), c, 1); const y1 = yOf(Math.max(O, Cc)), y2 = yOf(Math.min(O, Cc));
      o.push(`<rect x="${(x - cw / 2).toFixed(1)}" y="${y1.toFixed(1)}" width="${cw.toFixed(1)}" height="${Math.max(1, y2 - y1).toFixed(1)}" fill="${c}"/>`); });
    // ---- plan lines (on top of candles)
    planLines.forEach(([v, l, c]) => hline(v, c, `${l} ${nf(v)}`, { dash: '10 3 2 3', w: 1.4, strong: true }));
    // ---- patterns, swings, divergence, today's candle pattern (daily only)
    const notes = [];
    if (L.has('pat') && tf === 'D') {
      const sw = tk.swings_recent || {};
      (sw.highs || []).forEach(([d, p]) => { const k = idxOf(d); if (k === null || k < 0 || !inP(p)) return; const x = xOf(k), y = yOf(p) - 6; o.push(`<path d="M${(x - 4).toFixed(1)} ${(y - 6).toFixed(1)}L${(x + 4).toFixed(1)} ${(y - 6).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}Z" fill="${K.muted}"/>`); });
      (sw.lows || []).forEach(([d, p]) => { const k = idxOf(d); if (k === null || k < 0 || !inP(p)) return; const x = xOf(k), y = yOf(p) + 6; o.push(`<path d="M${(x - 4).toFixed(1)} ${(y + 6).toFixed(1)}L${(x + 4).toFixed(1)} ${(y + 6).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}Z" fill="${K.muted}"/>`); });
      (tk.chart_patterns || []).forEach(pt => {
        const pts = (pt.points || []).map(([d, p]) => [idxOf(d), p]).filter(([k]) => k !== null && k >= 0);
        const stTxt = /broken/.test(pt.status) ? 'شکسته شد' : 'در حال شکل‌گیری';
        if (pt.upper_line) { [pt.upper_line, pt.lower_line].forEach(line => { const [[d1, p1], [d2, p2]] = line, k1 = idxOf(d1), k2 = idxOf(d2); if (k1 === null || k2 === null || k1 < 0) return;
            const slope = (p2 - p1) / (k2 - k1), pe = p1 + slope * (n - 1 - k1); ln(xOf(k1), yOf(p1), xOf(n - 1), yOf(pe), K.text, 1.3, '', 0.8); });
          const [[d1, p1]] = pt.upper_line, k1 = idxOf(d1); if (k1 !== null && k1 >= 0) tx(xOf(k1), yOf(p1) - 10, `${pt.fa} (${stTxt})`, K.text, 11, 'middle', 700);
          notes.push(`${pt.fa}: شکست بالای ${nf(pt.breakout_up_above)} یا زیر ${nf(pt.breakdown_below)}`); return; }
        if (pts.length >= 2) { o.push(`<polyline points="${pts.map(([k, p]) => `${xOf(k).toFixed(1)},${yOf(p).toFixed(1)}`).join(' ')}" fill="none" stroke="${K.text}" stroke-width="1.3" stroke-opacity=".8"/>`);
          const top = pts.reduce((a, c) => (pt.bias === 'bearish' ? c[1] > a[1] : c[1] < a[1]) ? c : a); tx(xOf(top[0]), yOf(top[1]) + (pt.bias === 'bearish' ? -12 : 20), `${pt.fa} (${stTxt})`, K.text, 11, 'middle', 700); }
        if (isNum(pt.neckline) && pts.length) hline(pt.neckline, K.text, `خط گردن ${nf(pt.neckline)}`, { from: pts[0][0], dash: '6 3', w: 1.2 });
        if (isNum(pt.measured_target) && inP(pt.measured_target)) { ln(xOf(n) - bw / 2, yOf(pt.measured_target), x0 + PW, yOf(pt.measured_target), K.text, 1, '2 2'); lab.push({ y: yOf(pt.measured_target), t: `هدف الگو ${nf(pt.measured_target)}`, c: K.text }); }
      });
      (tk.rsi_divergence || []).forEach(dv => { const [[d1, p1], [d2, p2]] = dv.swings, k1 = idxOf(d1), k2 = idxOf(d2); if (k1 === null || k2 === null || k1 < 0) return;
        const c = dv.type === 'bullish' ? K.pos : K.neg; ln(xOf(k1), yOf(p1), xOf(k2), yOf(p2), c, 2);
        tx(xOf(k2), yOf(p2) + (dv.type === 'bullish' ? 22 : -12), dv.type === 'bullish' ? 'واگرایی مثبت RSI' : 'واگرایی منفی RSI', c, 11, 'middle', 700);
        if (Hr) { const r1 = IND.rsi[s + k1], r2 = IND.rsi[s + k2], yr = v => yR0 + (100 - v) / 100 * Hr; if (isNum(r1) && isNum(r2)) later.push(`<line x1="${xOf(k1).toFixed(1)}" y1="${yr(r1).toFixed(1)}" x2="${xOf(k2).toFixed(1)}" y2="${yr(r2).toFixed(1)}" stroke="${c}" stroke-width="2"/>`); } });
      if ((tk.candles_today || []).length) tx(xOf(n - 1), yOf(last[2]) - 10, tk.candles_today.join('، '), K.text, 11, 'end', 700);
    }
    o.splice(cs, o.length - cs, `<clipPath id="${clipId}"><rect x="${x0}" y="${yP0}" width="${PW}" height="${Hp}"/></clipPath><g clip-path="url(#${clipId})">${o.slice(cs).join('')}</g>`);
    // ---- last price marker
    lab.push({ y: yOf(last[4]), t: `پایانی ${nf(last[4])}`, c: K.accent, strong: true, pill: true });
    // ---- right-side labels without overlaps
    lab.sort((a, b) => a.y - b.y); const gapL = 13; for (let k = 1; k < lab.length; k++) if (lab[k].y < lab[k - 1].y + gapL) lab[k].yy = (lab[k - 1].yy || lab[k - 1].y) + gapL;
    lab.forEach(l => { if (l.yy === undefined) l.yy = l.y; }); for (let k = 1; k < lab.length; k++) if (lab[k].yy < lab[k - 1].yy + gapL) lab[k].yy = lab[k - 1].yy + gapL;
    const over = lab.length ? lab[lab.length - 1].yy - (yP0 + Hp) : 0; if (over > 0) lab.forEach(l => { l.yy -= over; });
    const xl = x0 + PW + 3, xr = W - 3;
    const SHORT = [['حد ضرر دارنده', 'حد ضرر'], ['ماشهٔ خرید', 'ماشه'], ['هدف ماشه', 'هدف'], ['گره حجمی', 'گره'], ['پیوت هفتگی', 'پیوت'], ['هدف الگو', 'هدف'], ['خط گردن', 'گردن']];
    if (narrow) lab.forEach(l => SHORT.forEach(([a, b_]) => { l.t = l.t.replace(a, b_); }));
    lab.forEach(l => { if (Math.abs(l.yy - l.y) > 2) ln(x0 + PW, l.y, xl, l.yy, l.c, 0.8, '', 0.6);
      if (l.pill) { o.push(`<rect x="${xl}" y="${(l.yy - 8).toFixed(1)}" width="${xr - xl + 1}" height="16" rx="4" fill="${l.c}"/>`); tx(xr - 3, l.yy + 4, l.t, K.bg, 10.5, 'start', 700, ' direction="rtl"'); }
      else tx(xr, l.yy + 4, l.t, l.c, 10, 'start', l.strong ? 700 : 400, ' direction="rtl"'); });
    o.push(later.join(''));
    // ---- volume pane
    if (Hv) { const vmax = Math.max(...B.map(b => b[5] || 0)) || 1; B.forEach((b, k) => { const hgt = (b[5] || 0) / vmax * (Hv - 4); o.push(`<rect x="${(xOf(k) - cw / 2).toFixed(1)}" y="${(yV0 + Hv - hgt).toFixed(1)}" width="${cw.toFixed(1)}" height="${hgt.toFixed(1)}" fill="${b[4] >= b[1] ? K.pos : K.neg}" fill-opacity=".45"/>`); });
      ln(x0, yV0 + Hv, x0 + PW, yV0 + Hv, K.line); tx(x0 + PW - 4, yV0 - 1, 'حجم', K.muted, 10, 'start', 400, ' direction="rtl"'); }
    // ---- RSI pane
    if (Hr) { const yr = v => yR0 + (100 - v) / 100 * Hr; o.push(`<rect x="${x0}" y="${yr(70)}" width="${PW}" height="${yr(30) - yr(70)}" fill="${K.line}" fill-opacity=".35"/>`);
      [30, 50, 70].forEach(v => { ln(x0, yr(v), x0 + PW, yr(v), K.line, 1, v === 50 ? '2 3' : ''); tx(x0 - 4, yr(v) + 4, nf(v), K.muted, 10, 'end'); });
      let d = '', pen = false; for (let k = 0; k < n; k++) { const v = IND.rsi[s + k]; if (!isNum(v)) { pen = false; continue; } d += (pen ? 'L' : 'M') + xOf(k).toFixed(1) + ' ' + yr(v).toFixed(1); pen = true; }
      if (d) o.push(`<path d="${d}" fill="none" stroke="${K.ma1}" stroke-width="1.5"/>`);
      tx(x0 + PW - 4, yR0 - 1, `RSI ۱۴ · ${nf(IND.rsi[all.length - 1], 1)}`, K.muted, 10, 'start', 400, ' direction="rtl"'); }
    // ---- MACD pane
    if (Hm) { const vals = []; for (let k = 0; k < n; k++) { const i = s + k; [IND.macd[i], IND.sig[i]].forEach(v => isNum(v) && vals.push(v)); }
      const mx = Math.max(1e-9, ...vals.map(Math.abs)), ym = v => yM0 + Hm / 2 - v / mx * (Hm / 2 - 3);
      ln(x0, ym(0), x0 + PW, ym(0), K.line);
      for (let k = 0; k < n; k++) { const i = s + k, h_ = IND.macd[i] - IND.sig[i]; if (!isNum(h_)) continue; const y1 = ym(Math.max(0, h_)), y2 = ym(Math.min(0, h_));
        o.push(`<rect x="${(xOf(k) - cw / 2).toFixed(1)}" y="${y1.toFixed(1)}" width="${cw.toFixed(1)}" height="${Math.max(0.5, y2 - y1).toFixed(1)}" fill="${h_ >= 0 ? K.pos : K.neg}" fill-opacity=".45"/>`); }
      const pth = (arr, c) => { let d = '', pen = false; for (let k = 0; k < n; k++) { const v = arr[s + k]; if (!isNum(v)) { pen = false; continue; } d += (pen ? 'L' : 'M') + xOf(k).toFixed(1) + ' ' + ym(v).toFixed(1); pen = true; } if (d) o.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="1.4"/>`); };
      pth(IND.macd, K.ma1); pth(IND.sig, K.ma2); tx(x0 + PW - 4, yM0 - 1, 'MACD ۱۲،۲۶،۹', K.muted, 10, 'start', 400, ' direction="rtl"'); }
    // ---- date axis: Jalali month boundaries
    const ticks = []; for (let k = 1; k < n; k++) if (jMonth(B[k][0]) !== jMonth(B[k - 1][0])) ticks.push(k);
    const every = Math.max(1, Math.ceil(ticks.length / (narrow ? 4 : 8))), minGap = tf === 'W' ? 62 : 46; let lastX = -1e9;
    ticks.filter((_, j) => j % every === 0).forEach(k => { const x = xOf(k); if (x - lastX < minGap) return; lastX = x; ln(x, yP0, x, Htot - Hx, K.line, 1, '2 4', 0.8); const m = jMonth(B[k][0]);
      tx(x, Htot - 5, m === '1' || tf === 'W' ? `${jMonthName(B[k][0])} ${jYear(B[k][0])}` : jMonthName(B[k][0]), K.muted, 10, 'middle', 400, ' direction="rtl"'); });
    // ---- crosshair placeholders
    o.push(`<line data-x="v" x1="0" x2="0" y1="${yP0}" y2="${Htot - Hx}" stroke="${K.muted}" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`);
    o.push(`<line data-x="h" x1="${x0}" x2="${x0 + PW}" y1="0" y2="0" stroke="${K.muted}" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`);
    holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Htot}" viewBox="0 0 ${W} ${Htot}" role="img" aria-label="نمودار شمعی ${esc(ctx.b.symbol || '')} با ابزارهای تکنیکال">${o.join('')}</svg>`;
    ctx.geo = { x0, bw, n, s, all, IND, yP0, Hp, lo, hi, W, PW, tf };
    const nt = box.querySelector('[data-el="note"]');
    const legend = [L.has('ma') ? (tf === 'W' ? 'میانگین ۱۰ و ۳۰ هفته' : 'میانگین ۲۰، ۵۰ و ۲۰۰ روزه') : '', L.has('ichi') ? 'ایچیموکو ۹، ۲۶، ۵۲ (ابر ۲۶ دوره جلوتر)' : '',
      fibOn ? `فیبوناچی روی نوسان ${fibo.direction === 'up' ? 'صعودی' : 'نزولی'} ${nf(fibo.swing_pct, 1)}٪ ${fibo.valid_swing ? '' : '(نوسان هنوز معتبر نیست)'}` : ''].filter(Boolean);
    if (nt) nt.textContent = [...legend, ...notes].join(' · ') + (legend.length || notes.length ? ' · ' : '') + 'کندل با قیمت پایانی. ابزارهای کلاسیک برای سطح، حد ضرر و هدف است، نه جهت.';
  }

  // ------------------------------------------------------------ hover
  function hover(box, ev) {
    const ctx = REG.get(box), g = ctx && ctx.geo, svg = box.querySelector('svg'), tip = box.querySelector('.tc-tip'); if (!g || !svg || !tip) return;
    const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * (g.W / r.width), y = (ev.clientY - r.top) * (g.W / r.width);
    const k = Math.floor((x - g.x0) / g.bw), v = svg.querySelector('[data-x="v"]'), h = svg.querySelector('[data-x="h"]');
    if (k < 0 || k >= g.n) { v.setAttribute('visibility', 'hidden'); h.setAttribute('visibility', 'hidden'); tip.hidden = true; return; }
    const i = g.s + k, b = g.all[i], p = g.all[i - 1], cx = g.x0 + (k + 0.5) * g.bw;
    v.setAttribute('x1', cx); v.setAttribute('x2', cx); v.setAttribute('visibility', 'visible');
    if (y >= g.yP0 && y <= g.yP0 + g.Hp) { h.setAttribute('y1', y); h.setAttribute('y2', y); h.setAttribute('visibility', 'visible'); } else h.setAttribute('visibility', 'hidden');
    const ch = p ? (b[4] / p[4] - 1) * 100 : null, I = g.IND, row = (a, c) => `<div><span>${a}</span><b class="n">${c}</b></div>`;
    tip.innerHTML = `<div class="tt-h">${jFull(b[0])}${g.tf === 'W' ? ' (هفته)' : ''}</div>${row('بازگشایی', nf(b[1]))}${row('بیشینه', nf(b[2]))}${row('کمینه', nf(b[3]))}${row('پایانی', nf(b[4]))}${isNum(ch) ? row('تغییر', `${ch >= 0 ? '+' : '−'}${nf(Math.abs(ch), 2)}٪`) : ''}
      ${row('حجم', nf(b[5]))}${isNum(I.rsi[i]) ? row('RSI', nf(I.rsi[i], 1)) : ''}${isNum(I.m1[i]) ? row(`میانگین ${nf(I.k1)}`, nf(I.m1[i])) : ''}${isNum(I.m2[i]) ? row(`میانگین ${nf(I.k2)}`, nf(I.m2[i])) : ''}${I.m3 && isNum(I.m3[i]) ? row('میانگین ۲۰۰', nf(I.m3[i])) : ''}`;
    tip.hidden = false;
    const bx = box.getBoundingClientRect(), tw = tip.offsetWidth || 150, px = ev.clientX - bx.left, py = ev.clientY - bx.top;
    tip.style.left = Math.max(4, Math.min(bx.width - tw - 4, px + (px > bx.width / 2 ? -tw - 14 : 14))) + 'px'; tip.style.top = Math.max(4, py - 20) + 'px';
  }

  // ------------------------------------------------------------ export
  function toPng(box) {
    return new Promise((res, rej) => { const svg = box.querySelector('svg'); if (!svg) return rej(new Error('نمودار نیست'));
      const W = +svg.getAttribute('width'), H = +svg.getAttribute('height'), clone = svg.cloneNode(true); clone.querySelectorAll('[data-x]').forEach(e => e.remove());
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone)), img = new Image();
      img.onload = () => { try { const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; const g = c.getContext('2d'); g.scale(2, 2); g.drawImage(img, 0, 0); c.toBlob(b => b ? res(b) : rej(new Error('تبدیل نشد')), 'image/png'); } catch (e) { rej(e); } };
      img.onerror = () => rej(new Error('تصویر ساخته نشد')); img.src = url; });
  }
  async function act(box, el) {
    const ctx = REG.get(box); if (!ctx) return;
    const st = { ...DEF, ...(ctx.store ? ctx.store.get('chart', {}) : {}) }, a = el.dataset.ch;
    if (a === 'tf') { st.tf = el.dataset.v; }
    else if (a === 'range') { st.range = +el.dataset.v; }
    else if (a === 'layer') { const L = new Set(st.layers); L.has(el.dataset.v) ? L.delete(el.dataset.v) : L.add(el.dataset.v); st.layers = [...L]; }
    else if (a === 'png' || a === 'copyimg') {
      try { const blob = await toPng(box);
        if (a === 'copyimg' && navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); ctx.toast && ctx.toast('تصویر نمودار کپی شد؛ در گفت‌وگو با Claude بچسبانید'); return; }
        const u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = `chart-${(ctx.b && ctx.b.symbol) || 'petro'}-${st.tf === 'W' ? 'weekly' : 'daily'}.png`; document.body.appendChild(l); l.click(); setTimeout(() => { URL.revokeObjectURL(u); l.remove(); }, 1500);
        ctx.toast && ctx.toast(a === 'copyimg' ? 'کپی تصویر پشتیبانی نشد؛ فایل دانلود شد' : 'تصویر دانلود شد');
      } catch (e) { ctx.toast && ctx.toast('تصویر ساخته نشد: ' + e.message); }
      return;
    }
    if (ctx.store) ctx.store.set('chart', st);
    draw(box);
  }

  function mount(root, b, opts = {}) {
    if (!root) return;
    const rn = root.getRootNode ? root.getRootNode() : root;
    root.querySelectorAll('[data-tchart]').forEach(box => {
      REG.set(box, { b, plan: opts.plan, store: opts.store, toast: opts.toast, geo: null });
      if (typeof ResizeObserver === 'function') { let w0 = 0; new ResizeObserver(en => { const w = Math.round(en[0].contentRect.width); if (w && Math.abs(w - w0) > 4) { w0 = w; draw(box); } }).observe(box.querySelector('.tc-svg')); }
      draw(box);
    });
    if (!WIRED.has(rn)) {
      WIRED.add(rn);
      rn.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-ch]'); if (!el) return; const box = el.closest('[data-tchart]'); if (box) act(box, el); });
      rn.addEventListener('pointermove', e => { const box = e.target.closest && e.target.closest('[data-tchart]'); if (box && e.target.closest('.tc-svg')) hover(box, e); });
      rn.addEventListener('pointerleave', e => { const box = e.target.closest && e.target.closest('[data-tchart]'); if (box) { const tip = box.querySelector('.tc-tip'); if (tip) tip.hidden = true; } }, true);
      try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => rn.querySelectorAll('[data-tchart]').forEach(draw)); } catch (e) { /* old browser */ }
    }
  }
  return { html, mount, draw, indicators };
})();

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
  // P(up in 5 days), average gain, average loss by regime × score band (the prompt's calibration table, 1392-1405)
  const CAL5 = { hot: [[0.20, 3.4, -5.6], [0.55, 6.7, -4.8], [0.57, 6.4, -4.2], [0.57, 7.0, -4.5], [0.74, 10.1, -3.5]],
    mid: [[0.31, 3.3, -2.3], [0.41, 5.6, -3.0], [0.48, 5.8, -3.1], [0.54, 9.9, -3.3], [0.58, 5.2, -3.1]],
    cold: [[0.38, 4.1, -2.5], [0.43, 4.6, -3.4], [0.47, 5.2, -4.0], [0.50, 5.9, -4.4], [0.57, 7.2, -4.9]] };
  const bandIdx = sc => sc <= -4 ? 0 : sc <= -2 ? 1 : sc <= 1 ? 2 : sc <= 3 ? 3 : 4;
  const evFor = (regime, sc) => { const c = CAL5[regime] && CAL5[regime][bandIdx(sc)]; return c ? { p5: c[0], ev5: R(c[0] * c[1] + (1 - c[0]) * c[2], 2) } : { p5: null, ev5: null }; };
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
          if (cp.pts) { const t = snaps[x.sym]; x.plan = planOf({ ...t, rubric: { ...t.rubric, subtotal_without_codal: x.score + cp.pts } }, null); x.score_with_codal = x.score + cp.pts;
            const e = evFor(x.regime, x.score_with_codal); x.ev5 = e.ev5; x.p_up_5d = e.p5; } }
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
  // default watchlist: refineries / oil products (group 23)
  const PEERS = ['شپنا', 'شتران', 'شبندر', 'شبریز', 'شسپا', 'شراز', 'شاوان', 'شرانل', 'شنفت', 'شپاس', 'شبهرن'];
  const TYPE_FA = { MONTHLY: 'گزارش ماهانه', PORTFOLIO_NAV: 'صورت وضعیت پورتفوی', FS_EXPLAIN: 'توضیح صورت مالی', INTERIM_FS: 'صورت مالی میاندوره‌ای',
    ANNUAL_FS: 'صورت مالی سالانه', AGM_DECISION: 'تصمیمات مجمع', AGM_NOTICE: 'دعوت به مجمع', DIV_SCHEDULE: 'زمان‌بندی پرداخت سود',
    CAPINC_PROPOSAL: 'پیشنهاد افزایش سرمایه', CAPINC_STEP: 'افزایش سرمایه', EGM: 'مجمع فوق‌العاده', RUMOR_CLARIFY: 'شفاف‌سازی شایعه',
    BOARD_CEO_CHANGE: 'تغییر مدیرعامل/هیئت‌مدیره', HALT: 'توقف/تعلیق نماد', REGULATORY_COURT: 'دیوان/شورای رقابت', UTILITY_RATES: 'نرخ سرویس‌های جانبی',
    FEED_GAS_PRICE: 'نرخ خوراک/گاز', SHUTDOWN: 'توقف تولید/تعمیرات', RESTART: 'شروع مجدد تولید', CONTRACT: 'قرارداد', LEGAL: 'دعوی حقوقی',
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
    if (b.replay) h += replayCard(b);
    if (t) {
      h += planHtml(t, b.codal);
      h += nextCard(t);
      h += sumCard(t, b.codal);
      h += sec('نمودار تکنیکال', PWChart.html(), true);
      h += sec('ابزارهای تکنیکال و اعتبار ۱۳ سالهٔ آن‌ها', techHtml(t), true);
      if (t.ipo) h += sec('عرضهٔ اولیه (IPO)', ipoHtml(t.ipo), true);
      h += sec('روند چندافقی', trendHtml(t.trend, t), true);
      h += sec('سطوح کلیدی', levelsHtml(t), false);
      h += sec('جریان پول حقیقی/حقوقی', flowsHtml(t.flows), false);
      h += sec('اندیکاتورهای روزانه', dailyHtml(t.daily), false);
      if (t.intraday_today) h += sec('درون‌روز امروز', intradayHtml(t.intraday_today), false);
      h += sec(`گروه ${esc((t.group && t.group.sector_code) || '')} و شاخص‌ها`, groupHtml(t.group), false);
      h += sec('دفتر سفارش', obHtml(t.order_book), false);
      h += sec('سهامداران عمده', holdersHtml(t.holders), false);
      h += sec('بنیادی سریع', fundHtml(t), false);
    }
    if (c) h += sec(`کدال — ${nf(c.n_letters)} اطلاعیه در ${nf(c.window_days)} روز`, codalHtml(c, b.letters || [], opt), true);
    else if (!b.codal) h += '<div class="note">کدال گرفته نشد.</div>';
    h += '<p class="disc">این داده‌ها برای تحلیل آموزشی/پژوهشی است و توصیهٔ سرمایه‌گذاری شخصی نیست؛ مسئولیت تصمیم با معامله‌گر است.</p>';
    return wrapTables(h);
  }

  // ---- v2.4: next-session forecast (refiners) and the replay test
  const CALL_FA = { UP: 'بالا', DOWN: 'پایین', NONE: 'بدون پیش‌بینی جهت', FLAT: 'بی‌حرکت' };
  const NS_PTS_FA = { strong: 'پایان قوی', weak: 'پایان ضعیف', buyq: 'صف خرید', sellq: 'صف فروش', smart: 'پول هوشمند', buyq_lowvol: 'صف خرید کم‌حجم', buyq_run2: 'صف خرید روز سوم به بعد',
    sellq_lowvol: 'صف فروش کم‌حجم', sellq_run2: 'صف فروش روز سوم به بعد', rsi30: 'RSI < ۳۰', boll: 'بالای Bollinger', bp05: 'قدرت خریدار < ۰٫۵', grp_buyq50: 'نیمی از پالایشی‌ها در صف خرید',
    grp_sellq50: 'نیمی از پالایشی‌ها در صف فروش', total_dn1: 'افت شاخص کل بیش از ۱٪', drop_noq: 'افت بیش از ۲٪ بدون صف', vol_low: 'حجم کمتر از نصف معمول', wide_range: 'دامنهٔ ۶٪ یا بیشتر',
    capinc_night: 'اطلاعیهٔ افزایش سرمایه بعد از جلسه', interim_today: 'صورت مالی میاندوره‌ای امروز' };
  const REASON_FA = { GROUP_MOVE: 'کل پالایشی‌ها خلاف جهت رفتند', MARKET_MOVE: 'شاخص کل خلاف جهت رفت', GAP: 'گپ بازگشایی خلاف جهت', QUEUE_FLIP: 'صف امروز فردا شکست',
    RANGE_CHANGE: 'دامنهٔ نوسان عوض شد', LONG_BREAK: 'فاصلهٔ طولانی تا جلسهٔ بعد', NEWS: 'اطلاعیهٔ کدال بعد از جلسه', ADJUSTMENT: 'تعدیل قیمت', SMALL_MOVE: 'حرکت کمتر از ±۰٫۵٪', OWN: 'حرکت خود سهم' };
  function nextCard(t) {
    const ns = t.next_session; if (!ns) return '';
    const e = ns.expected || {}, p = ns.prob || {};
    const bar = (l, v, cls) => `<div class="pb"><span>${l}</span><span class="track"><span class="fill ${cls}" style="width:${isNum(v) ? v * 100 : 0}%"></span></span><span class="pv">${P(v)}</span></div>`;
    const pts = Object.entries(ns.points || {});
    let h = `<div class="card"><div><b>جلسهٔ بعد</b> <span class="muted small">نسخهٔ ۲٫۴ · ${esc(ns.calibrated_on || '')}</span></div>`;
    if (!ns.applies) h += `<div class="note warn">${esc(ns.note || '')}</div>`;
    h += `<div class="score"><div class="sc-num">${sgn(ns.score, 0)}</div><div><div>پیش‌بینی: <b>${esc(CALL_FA[ns.call] || '—')}</b> · ناحیهٔ <b class="n">${esc(ns.band)}</b> <span class="muted small">(n = ${nf(ns.n)})</span></div>
      <div class="muted small">${pts.length ? pts.map(([k, v]) => `${NS_PTS_FA[k] || k} <span class="n">${ptxt(v)}</span>`).join(' · ') : 'هیچ ردیفی فعال نیست'}</div></div></div>
      <div class="probs ns">${bar('بالا (بیش از +۰٫۵٪)', p.up, '')}${bar('بی‌حرکت (±۰٫۵٪)', p.flat, 'flat')}${bar('پایین (کمتر از −۰٫۵٪)', p.down, 'neg')}</div>
      <div class="kv">${kv('میانهٔ تغییر پایانی فردا', sgn(e.next_close_median_pct, 2, '٪'))}${kv('میانهٔ گپ بازگشایی', sgn(e.open_gap_median_pct, 2, '٪'))}
      ${kv('احتمال صف خرید / فروش فردا', num(e.next_buy_queue_pct, 0, '٪') + ' / ' + num(e.next_sell_queue_pct, 0, '٪'))}${kv('از آخرین قیمت امروز تا پایانی فردا (میانه)', sgn(e.from_last_price_to_next_close_median_pct, 2, '٪'))}
      ${kv('از آخرین قیمت امروز تا ۵ جلسه بعد (میانه)', sgn(e.from_last_price_to_5d_median_pct, 2, '٪'))}${kv('بالا در ۵ جلسه / میانهٔ ۵ جلسه', num(e.up_in_5d_pct, 0, '٪') + ' / ' + sgn(e.five_day_median_pct, 2, '٪'))}</div>
      <p class="small">هزینهٔ خرید و فروش حدود <b class="n">${nf(e.round_trip_cost_pct, 2)}٪</b> است. ${esc(ns.applies ? ns.note : '')}</p>`;
    if ((ns.confidence_flags || []).length) h += `<ul class="warns">${ns.confidence_flags.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    h += `<p class="muted small">${esc(ns.walk_forward || '')}</p></div>`;
    return h;
  }
  function replayCard(b) {
    const r = b.replay || {}, o = r.outcome || {}, c = r.check || {};
    if (r.error) return `<div class="err"><b>آزمون گذشته:</b> ${esc(r.error)}</div>`;
    const vcls = c.verdict === 'RIGHT' ? 'ok' : c.verdict === 'WRONG' ? 'bad' : '';
    const VFA = { RIGHT: 'درست', WRONG: 'غلط', FLAT: 'بی‌حرکت (±۰٫۵٪)', NO_CALL: 'پیش‌بینی جهت نداشت' };
    return `<div class="card"><div><b>آزمون گذشته</b> — داده تا پایان جلسهٔ <b>${esc(faDigits(r.session_used || r.as_of || ''))}</b>؛ جلسهٔ بعد: <b>${esc(faDigits(o.next_session || '—'))}</b></div>
      <p class="small">اول برگه را فقط با داده‌های پایین بنویسید (یا «کپی برای Claude» بزنید)، بعد نتیجه را باز کنید و «کپی نتیجهٔ واقعی» را برای کالبدشکافی به Claude بدهید.</p>
      <details class="sec"><summary>نتیجهٔ واقعی و بررسی (بعد از نوشتن برگه باز کنید)</summary><div class="in">
      <div class="chips"><span class="badge ${vcls}">پیش‌بینی جلسهٔ بعد: ${esc(CALL_FA[c.next_session_call] || '—')} → واقعی: ${esc(CALL_FA[c.real_next] || '—')} · ${esc(VFA[c.verdict] || '—')}</span></div>
      <div class="kv">${kv('تغییر پایانی جلسهٔ بعد', sgn(o.next_close_pct, 2, '٪'))}${kv('گپ بازگشایی', sgn(o.open_gap_pct, 2, '٪'))}${kv('صف جلسهٔ بعد', esc(QUEUE_FA[o.next_queue] || o.next_queue || '—'))}
      ${kv('از آخرین قیمت تا پایانی بعد', sgn(o.from_last_price_to_next_close_pct, 2, '٪'))}${kv('بازده ۳ / ۵ جلسه', sgn(o.ret_3d_pct, 2, '٪') + ' / ' + sgn(o.ret_5d_pct, 2, '٪'))}
      ${kv('شاخص گروه / کل در جلسهٔ بعد', sgn(o.group_index_next_pct, 2, '٪') + ' / ' + sgn(o.total_index_next_pct, 2, '٪'))}${kv('تصمیم v2.3 (۵ روزه)', esc(c.v23_decision || '—') + (c.v23_decision_right_5d === true ? ' ✓' : c.v23_decision_right_5d === false ? ' ✗' : ''))}
      ${kv('معاملهٔ یک‌روزه از آخرین قیمت (خالص)', sgn(c.one_day_trade_from_last_net_pct, 2, '٪'))}</div>
      ${(c.reasons || []).length ? `<div class="chips"><span class="lbl">علت:</span>${c.reasons.map(x => `<span class="chip">${esc(REASON_FA[x] || x)}</span>`).join('')}</div>` : ''}
      ${(o.news_until_next_close || []).length ? `<ul class="small">${o.news_until_next_close.map(x => `<li>${esc(faDigits(x[0]))} — ${esc(TYPE_FA[x[1]] || x[1])}: ${esc(fixFa(x[2]))}</li>`).join('')}</ul>` : ''}
      <div class="row"><button class="btn" data-act="copy-outcome">کپی نتیجهٔ واقعی برای Claude</button></div></div></details></div>`;
  }

  function headCard(b, t) {
    const d = t && t.daily, ins = t && t.instrument;
    const today = tehranInt(0);
    const fresh = t && t.replay ? `<span class="badge warn">آزمون گذشته: پایان جلسهٔ ${jd(d && d.date)}</span>`
      : d ? (d.date === today ? '<span class="badge ok">دادهٔ امروز</span>' : `<span class="badge warn">آخرین جلسه: ${jd(d.date)} (امروز نیست)</span>`) : '';
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

  // ---- simple plan: what to do, at what price, how much (same rules as the daily report)
  const floor10 = x => Math.floor(x / 10) * 10, ceil10 = x => Math.ceil(x / 10) * 10;
  function planOf(t, codal) {
    const d = t.daily || {}, r = t.rubric || {}, st = fixFa((t.instrument && t.instrument.state) || '');
    const tradable = /^مجاز/.test(st) && !/متوقف|ممنوع/.test(st) && !t.ipo;
    const ch = codalHints(codal); const score = (r.subtotal_without_codal || 0) + (ch ? ch.pts : 0);
    const close = d.close, atr = d.atr_pct || 0.03, upper = floor10(close * 1.03);
    const sup = ((t.chart && t.chart.levels_sorted_high_to_low) || []).filter(x => x[1] < close * 0.998)[0];
    const res = ((t.chart && t.chart.levels_sorted_high_to_low) || []).filter(x => x[1] > close * 1.002).slice(-1)[0];
    const holdStop = sup ? floor10(sup[1] * 0.99) : floor10(close * (1 - 1.5 * atr));
    const sit = situation(t);
    const p = { tradable, score, close, upper, holdStop, state: st, situation: sit.code };
    if (!tradable) return p;
    // the model's signals are calibrated only for the normal situation (D); after a price adjustment / reopening (B)
    // or with a short history (C) the model gives no signal (prompt, step 3)
    if (sit.code !== 'D') { p.signal_blocked = sit.fa; }
    else if (score >= 4) { // model buy signal
      const stop = Math.max(holdStop, floor10(close * (1 - 1.5 * atr))), dist = (close - stop) / close;
      const tgt = res && res[1] - close >= close - stop ? res[1] : close + 2 * (close - stop);
      p.signal = dist > 0.08 ? null : { side: 'buy', stop, target: Math.round(tgt), size: Math.min(100, 1 / (dist * 100) * 100) };
    } else if (score <= -4) p.signal = { side: 'sell' };
    // breakout trigger so a rally isn't missed: above the 20-day high (or today's high if today already broke it)
    const hi20 = d.donchian20_high, X = ceil10(hi20 && close < hi20 ? hi20 : (d.high || close));
    const stopX = floor10(X * (1 - 1.5 * atr));
    p.trigger = { level: X, reachableTomorrow: X <= upper, stop: stopX, target: Math.round(X + 2 * (X - stopX)), size: (1 / (1.5 * atr * 100)) * 100 / 3 };
    return p;
  }
  function planHtml(t, codal) {
    const p = planOf(t, codal);
    let h = '<div class="card"><div><b>برنامهٔ ساده</b> <span class="muted small">طبق قاعده‌های مدل؛ ریسک ۱٪ سرمایه در هر معامله</span></div>';
    if (!p.tradable) return h + `<div class="note warn">نماد قابل معامله نیست (${esc(p.state || 'عرضهٔ اولیه')}). اقدامی نیست.</div></div>`;
    if (p.signal && p.signal.side === 'buy') h += `<div class="note" style="background:var(--pos-soft);color:var(--pos)"><b>خرید (سیگنال مدل):</b> جلسهٔ بعد از ۱۱:۰۰ تا پایان جلسه، تا قیمت ${num(p.upper)}؛ در صف خرید نخرید. حد ضرر ${num(p.signal.stop)} · هدف ${num(p.signal.target)} · حدود ${num(p.signal.size, 0, '٪')} سرمایه · خروج حداکثر بعد از ۵ جلسه.</div>`;
    else if (p.signal && p.signal.side === 'sell') h += '<div class="note bad"><b>فروش (سیگنال مدل):</b> اگر دارید، جلسهٔ بعد بعد از ۱۰:۳۰ بفروشید؛ در صف فروش نفروشید.</div>';
    else if (p.signal_blocked) h += `<div class="note warn">موقعیت ${esc(p.situation)} (${esc(p.signal_blocked)}): جدول احتمال مدل برای این وضعیت معتبر نیست و سیگنال خرید یا فروش داده نمی‌شود.</div>`;
    else h += '<div class="small" style="margin-top:6px">سیگنال خرید یا فروش مدل: <b>ندارد</b>.</div>';
    if (p.signal && t.next_session && t.next_session.applies) h += '<div class="note warn">پالایشی‌ها (آزمون ۲٫۴، ۱۳۹۲ تا ۱۴۰۵): این سیگنال بعد از هزینهٔ ۱٫۲۵٪ لبه نداشت؛ یک روزه حدود −۱٫۴٪ و ۵ روزه حدود +۰٫۳٪. آن را فقط با دلیل دیگر (کدال، بنیادی، خبر گروهی) و با اطمینان پایین به کار ببرید.</div>';
    const g = p.trigger;
    h += `<div class="kv" style="margin-top:8px">${kv('اگر ندارید: خرید اگر پایانی بالای', `<b>${num(g.level)}</b>${g.reachableTomorrow ? '' : ' <span class="muted small">(فردا دست‌یافتنی نیست)</span>'}`)}
      ${kv('مقدار و حد ضرر بعد از این خرید', `${num(g.size, 0, '٪')} سرمایه · حد ضرر ${num(g.stop)}`)}${kv('هدف', num(g.target))}${kv('اگر دارید: حد ضرر', `<b>${num(p.holdStop)}</b>`)}</div>
      <p class="muted small">ماشهٔ «پایانی بالای» یعنی بین ۱۲:۱۵ و ۱۲:۳۰ قیمت بالای آن عدد باشد؛ سقف ۲۰ روزه در آزمون ۱۳ ساله فقط لبهٔ ضعیف داشت، پس حجمش ⅓ است.</p></div>`;
    return h;
  }

  function sumCard(t, codal) {
    const r = t.rubric || {}, s = situation(t), cal = r.calibration_for_this_band || {}, base = r.base_rate_this_regime || {};
    const g = t.group || {}, reg = r.regime || g.regime, gix = g.group_index || g.chem44_index;
    const regCls = reg === 'hot' ? 'hot' : reg === 'cold' ? 'cold' : '';
    let h = `<div class="card sum"><div class="top"><div><span class="lbl">موقعیت</span> <b>${s.code}</b> · ${s.fa}</div>
      <div><span class="lbl">رژیم گروه</span> <span class="badge ${regCls}">${REG_FA[reg] || '—'}</span> <span class="muted small">شاخص گروه در ۲۰ روز ${SP(gix && gix.r20)}</span></div></div>`;
    if (r.calibration_applies_to_this_group === false) h += `<div class="note warn">این نماد در گروه ${esc(g.sector_code || '')} است. احتمال‌ها و edge از آزمون ۱۳ سالهٔ گروه ۴۴ (پتروشیمی) آمده و برای این گروه آزموده نشده؛ اطمینان پایین.</div>`;
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

  const PAT_ST = { forming: 'در حال شکل‌گیری', broken_today: 'امروز شکسته شد', broken_up_today: 'امروز رو به بالا شکسته شد', broken_down_today: 'امروز رو به پایین شکسته شد' };
  function techHtml(t) {
    const k = t.technical, d = t.daily || {};
    if (!k) return '<p class="muted">این خروجی بخش technical ندارد (نسخهٔ قدیمی اسکریپت)؛ دوباره داده بگیرید.</p>';
    const f = k.fibonacci, pv = k.pivots || {}, ic = k.ichimoku, stc = k.stochastic, bb = k.bollinger, mc = k.macd;
    const iso = (l, v, d = 0) => `<span class="n">${l} ${nf(v, d)}</span>`;   // Latin label + number kept together inside RTL text
    const pvTxt = o => o ? ['R2', 'R1', 'P', 'S1', 'S2'].map(x => iso(x, o[x])).join(' · ') : '—';
    const rows = [
      ['فیبوناچی', f ? `نوسان ${f.direction === 'up' ? 'صعودی' : 'نزولی'} ${num(f.swing_pct, 1, '٪')} از ${num(f.swing_from[1])} (${jd(f.swing_from[0])}) تا ${num(f.swing_to[1])} (${jd(f.swing_to[0])})${f.valid_swing ? '' : ' <span class="muted">(هنوز معتبر نیست)</span>'}؛ اصلاح فعلی ${P(f.retracement_now, 1)}؛ نزدیک‌ترین سطح ${f.nearest_level ? `${num(f.nearest_level[0] * 100, 1, '٪')} = ${num(f.nearest_level[1])} (${sgn(f.nearest_level[2], 1, '٪')})` : '—'}<br><span class="small muted">اصلاحی: ${f.retracement_levels.slice(1, -1).map(([r, x]) => `${num(r * 100, 1, '٪')} ${num(x)}`).join(' · ')} — گسترش: ${f.extension_levels.map(([r, x]) => `${num(r * 100, 1, '٪')} ${num(x)}`).join(' · ')}</span>` : '—'],
      ['پیوت جلسهٔ بعد', pvTxt(pv.next_session_daily)], ['پیوت هفتگی', pvTxt(pv.weekly_from_last_completed_week)],
      ['ایچیموکو', ic ? `قیمت ${ic.price_vs_cloud === 'above' ? 'بالای' : ic.price_vs_cloud === 'below' ? 'زیر' : 'داخل'} ابر (${num(ic.cloud_bottom)} تا ${num(ic.cloud_top)}) · تنکان ${num(ic.tenkan)} · کیجون ${num(ic.kijun)} · ابر ۲۶ روز آینده ${ic.future_cloud_26 === 'bullish' ? 'صعودی' : 'نزولی'}${ic.tk_cross_today ? ` · تقاطع امروز ${ic.tk_cross_today === 'up' ? 'رو به بالا' : 'رو به پایین'}` : ''}` : '<span class="muted">سابقهٔ کافی نیست</span>'],
      ['Stochastic ۱۴،۳', stc ? `${iso('K', stc.k, 1)} · ${iso('D', stc.d, 1)}${stc.cross ? ` · ${stc.cross === 'up_below_20' ? 'تقاطع رو به بالا زیر ۲۰' : 'تقاطع رو به پایین بالای ۸۰'}` : ''}` : '—'],
      ['Bollinger ۲۰،۲', bb ? `${num(bb.lower)} تا ${num(bb.upper)} · میانه ${num(bb.middle)} · پهنا ${num(bb.width_pct, 1, '٪')} · ${iso('%b', d.bollinger_pctb, 2)}` : '—'],
      ['MACD ۱۲،۲۶،۹', mc ? `${num(mc.macd, 1)} / سیگنال ${num(mc.signal, 1)} · هیستوگرام ${sgn(mc.hist, 1)}` : '—'],
      ['RSI ۱۴ و واگرایی', `${num(d.rsi14, 1)}${(k.rsi_divergence || []).length ? ' · ' + k.rsi_divergence.map(x => `واگرایی ${x.type === 'bullish' ? 'مثبت' : 'منفی'} (${jd(x.swings[0][0])} و ${jd(x.swings[1][0])})`).join('، ') : ' · واگرایی نیست'}`],
      ['کندل امروز', (k.candles_today || []).length ? esc(k.candles_today.join('، ')) : '<span class="muted">الگوی شناخته‌شده‌ای نیست</span>'],
      ['الگوهای کلاسیک', (k.chart_patterns || []).length ? k.chart_patterns.map(x => `<b>${esc(x.fa)}</b> (${PAT_ST[x.status] || esc(x.status)})${isNum(x.neckline) ? ` · خط گردن ${num(x.neckline)} · هدف ${num(x.measured_target)}` : ''}${isNum(x.breakout_up_above) ? ` · شکست بالای ${num(x.breakout_up_above)} (هدف ${num(x.measured_target_up)}) یا زیر ${num(x.breakdown_below)} (هدف ${num(x.measured_target_down)})` : ''}`).join('<br>') : '<span class="muted">الگوی فعالی نیست</span>']];
    const sig = k.signals_today || [];
    return `<table><tbody>${rows.map(([a, b]) => `<tr><td style="white-space:nowrap">${a}</td><td>${b}</td></tr>`).join('')}</tbody></table>
      <h4>سیگنال‌های کلاسیک امروز و اعتبار آن‌ها در ۱۳ سال</h4>
      ${sig.length ? `<table><thead><tr><th>سیگنال</th><th>n</th><th>لبهٔ ۵ روزه</th><th>لبهٔ ۲۰ روزه</th><th>هم‌جهت در دوره‌ها</th></tr></thead><tbody>
      ${sig.map(x => `<tr><td>${esc(x.fa)}</td><td>${num(x.n)}</td><td>${sgn(x.edge_5d_pp, 1, ' واحد')}</td><td>${sgn(x.edge_20d_pp, 1, ' واحد')}</td><td>${num(x.eras_same_sign_of_5)} از ۵</td></tr>`).join('')}</tbody></table>` : '<p class="muted small">امروز هیچ سیگنال کلاسیکی فعال نیست.</p>'}
      <p class="muted small">لبه = فاصلهٔ احتمال رشد از میانگین گروه در همان روز (۱۳۹۲ تا ۱۴۰۵، گروه ۴۴). هیچ ابزار کلاسیکی، فیبوناچی هم، لبهٔ پایدار بیش از ±۳ واحد نداشت؛ سطوح فیبوناچی از سطوح دلخواه (۳۰، ۴۵، ۵۶، ۷۰٪) بهتر عمل نکردند. این ابزارها برای رسم، حد ضرر و هدف است؛ جهت از امتیاز v2 و جریان پول می‌آید.</p>`;
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
    const gi = g.group_index || g.chem44_index;
    const ix = (o, k) => o ? kv(k, SP(o.r1) + ' / ' + SP(o.r5) + ' / ' + SP(o.r20)) : '';
    return `<div class="kv">${kv('رژیم', `<span class="badge">${REG_FA[g.regime] || '—'}</span>`)}${kv('نمادهای معامله‌شده', num(g.n_traded))}${kv('درصد نمادهای مثبت', P(g.pct_up))}
      ${kv('صف خرید / فروش', num(g.buy_queues) + ' / ' + num(g.sell_queues))}${kv('میانگین تغییر قیمت', sgn(g.avg_change_pct, 2, '٪'))}
      ${kv('جریان حقیقی گروه بدون این نماد', SP(g.indiv_net_flow_pct_of_value_ex_self) + ' · ' + sgn(g.indiv_net_flow_billion_toman_ex_self, 1, ' میلیارد ت'))}
      ${kv('سهم این نماد از ارزش گروه', P(g.this_symbol_share_of_group_value, 1))}${kv('خالص حقیقی این نماد', sgn(g.this_symbol_indiv_net_billion_toman, 1, ' میلیارد ت'))}
      ${ix(gi, `شاخص گروه (${esc(fixFa(g.group_index_name || ''))}): ۱ / ۵ / ۲۰ روز`)}${kv('شاخص گروه بالای SMA50', gi ? (gi.above_sma50 ? 'بله' : 'خیر') : '—')}
      ${ix(g.total_index, 'شاخص کل: ۱ / ۵ / ۲۰ روز')}</div>
      ${gi && gi.live_appended ? '<p class="small muted">مقدار امروز شاخص از منبع زنده اضافه شد.</p>' : ''}<p class="muted small">${esc(g.regime_rule || '')}</p>`;
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
    if (b.replay) L.push(`آزمون گذشته: ${fixFa(b.replay.session_used || b.as_of)} — داده‌ها تا پایان همین جلسه است. برگه را برای جلسهٔ بعد بنویس و خط ثبت را بده؛ نتیجهٔ واقعی را بعداً می‌فرستم (بخش ۷-ب پرامپت).`);
    L.push('', `داده‌ها با پنل «دیدبان پتروشیمی» (نسخهٔ ${PW_VERSION}) در ${tehranTime(b.collected_at)} به وقت تهران جمع شد. برای گام ۱ از همین خروجی‌ها استفاده کن؛ فقط بخشی را که خطا دارد یا نیامده دوباره بگیر.`);
    // OHLC for the chart: the last 150 daily and 52 weekly bars are enough for Claude to draw it
    const ts = b.tsetmc && b.tsetmc.technical ? { ...b.tsetmc, technical: { ...b.tsetmc.technical, ohlc_daily: (b.tsetmc.technical.ohlc_daily || []).slice(-150), ohlc_weekly: (b.tsetmc.technical.ohlc_weekly || []).slice(-52) } } : b.tsetmc;
    L.push('', '### petroSnapshot', ts ? '```json\n' + JSON.stringify(ts) + '\n```' : '(گرفته نشد)');
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
  // text for the post-mortem step of a replay test (sent only after the sheet was written)
  function outcomeText(b) {
    const r = b.replay || {};
    return [`نتیجهٔ واقعی آزمون گذشته — ${fixFa(b.symbol)} — داده تا ${fixFa(r.session_used || b.as_of)}`,
      'برگه‌ای را که نوشتی با این نتیجه بسنج و کالبدشکافی کن (بخش ۷-ب پرامپت): درست یا غلط، علت، و آیا قاعده‌ای باید عوض شود.',
      '', '### outcome', '```json\n' + JSON.stringify(r.outcome || {}) + '\n```', '', '### check', '```json\n' + JSON.stringify(r.check || {}) + '\n```'].join('\n');
  }

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
              <label><input type="checkbox" name="letters" ${opts.letters ? 'checked' : ''}> متن ۳ اطلاعیهٔ مهم</label>
              <label title="برای آزمون: داده تا پایان این جلسه بریده می‌شود و نتیجهٔ واقعی جلسهٔ بعد جدا نشان داده می‌شود">آزمون گذشته <input class="inp" name="asof" placeholder="۱۴۰۳/۰۷/۰۷" style="width:8.5em" inputmode="numeric"></label></div>
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
    PWChart.mount(box, b, { plan: planSafe(b), store, toast });
  }
  function planSafe(b) { try { return b && b.tsetmc && !b.tsetmc.error && b.tsetmc.daily ? planOf(b.tsetmc, b.codal) : null; } catch (e) { return null; } }

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
    return { ...o, t: g('t').checked, c: g('c').checked && CAN.codal, position: g('position').value, horizon: g('horizon').value, risk: g('risk').value, asof: latinDigits(g('asof').value || '').trim() };
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
    if (o.asof) { b.as_of = o.asof; const end = step(`آزمون گذشته: داده تا ${faDigits(o.asof)} و نتیجهٔ جلسهٔ بعد`); jobs.push(safe(() => PC.petroReplay(sym, o.asof)).then(r => {
        b.tsetmc = r.snapshot || { error: r.error }; b.replay = { as_of: r.as_of, session_used: r.session_used, outcome: r.outcome, check: r.check, error: r.snapshot ? r.error : null }; end(!r.error, r.error); })); }
    else if (o.t) { const end = step('قیمت، جریان پول، گروه و شاخص از tsetmc'); jobs.push(safe(() => PC.petroSnapshot(sym)).then(r => { b.tsetmc = r; end(!r.error, r.error); })); }
    if (o.c) { const end = step(`اطلاعیه‌های کدال (${nf(o.days)} روز) و اخبار گروه`); jobs.push(safe(() => PC.codalSnapshot(sym, o.days, o.asof ? { asOf: o.asof } : {})).then(r => { b.codal = r; end(!r.error, r.error ? 'خطا' : nf(r.n_letters) + ' اطلاعیه'); })); }
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
    if (act === 'copy-outcome' && b && b.replay) return toast(await copyText(outcomeText(b)) ? 'نتیجهٔ واقعی کپی شد' : 'کپی نشد');
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
    if (!sh) { // another copy owns the panel on this page: open that one instead
      const o = document.getElementById('petro-watch-root'), r = o && o.shadowRoot, p = r && r.querySelector('.panel');
      if (p && p.hidden !== !(force === undefined ? p.hidden : force)) { const f = r.querySelector('.fab'); if (f) f.click(); }
      return;
    }
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
    // the userscript (or an earlier bookmarklet) already put a panel on this page: don't add a second one
    if (!container && document.getElementById('petro-watch-root')) return api;
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
    PWChart.mount(root.querySelector('.body'), b, { plan: planSafe(b), store, toast: () => {} });
    return b;
  }

  const api = { version: PW_VERSION, site: SITE, can: CAN, mount, open: () => toggle(true), close: () => toggle(false), toggle, renderInto, claudeText, prompt: PW_PROMPT, collectors: PC, planOf, report: pwMakeReport(PC, planOf, PW_NET) };
  return api;
})();

// expose for console / bookmarklet use (and for a browsing agent)
try {
  window.PetroWatch = PetroWatch;
  if (!PW_GM) ['petroSnapshot', 'petroReplay', 'petroReplayRange', 'petroEvaluate', 'codalSnapshot', 'codalLetterText'].forEach(k => { if (typeof window[k] !== 'function') window[k] = PC[k]; });
} catch (e) { /* sandbox */ }
if (PetroWatch.site !== 'other') { if (window.top === window.self) { PetroWatch.mount(); if (!PW_GM) PetroWatch.open(); } }

})();

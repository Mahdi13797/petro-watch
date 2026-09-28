// test/e2e.mjs — offline end-to-end test in headless Chromium (Playwright), against test/mock-api.mjs.
// Scenarios: (1) userscript mode on tsetmc (tsetmc + codal from one tab through GM),
// (2) console mode on codal.ir, (3) console mode on tsetmc + evaluation book, (4) GitHub Pages viewer.
// Usage: node test/e2e.mjs [outDir]    → screenshots + docs/sample.json
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { handle, MOCK } from './mock-api.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(require('node:child_process').execSync('npm root -g').toString().trim() + '/playwright')); }

const root = new URL('../', import.meta.url);
const OUT = process.argv[2] || new URL('../test/out/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const userjs = fs.readFileSync(new URL('docs/petro-watch.user.js', root), 'utf8');
const plainjs = fs.readFileSync(new URL('docs/petro-watch.js', root), 'utf8');
const fails = [];
const check = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };

const SITE_HTML = t => `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${t}</title><style>body{font-family:Tahoma;margin:0;background:#eef1f5}
  .bar{background:#1d3a5f;color:#fff;padding:14px 20px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px}.grid div{background:#fff;height:120px;border-radius:6px}</style></head>
  <body><div class="bar">${t} (صفحهٔ ساختگی برای آزمون)</div><div class="grid">${'<div></div>'.repeat(16)}</div></body></html>`;

async function newPage(browser, { gm = false, dark = false, width = 1400, height = 900 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: dark ? 'dark' : 'light', locale: 'fa-IR', timezoneId: 'Asia/Tehran' });
  await ctx.route('**/*', async route => {
    const url = route.request().url(), u = new URL(url);
    const m = handle(url);
    // CORS: tsetmc CDN and codal search allow their own sites; codal /Reports/ pages send no CORS header
    const acao = u.host === 'cdn.tsetmc.com' || u.host === 'search.codal.ir' ? { 'Access-Control-Allow-Origin': '*' } : {};
    // simulate the browser's CORS refusal for other origins that send no CORS header (Playwright's fulfill would not)
    const origin = route.request().headers()['origin'];
    if (m && !acao['Access-Control-Allow-Origin'] && origin && new URL(origin).host !== u.host) return route.abort('failed');
    if (m) return route.fulfill({ status: m.status, body: m.body, contentType: m.type, headers: acao });
    if (u.host === 'fonts.googleapis.com') return route.fulfill({ status: 200, body: '', contentType: 'text/css' });
    if (/tsetmc\.com$/.test(u.host)) return route.fulfill({ status: 200, body: SITE_HTML('TSETMC'), contentType: 'text/html' });
    if (/codal\.ir$/.test(u.host)) return route.fulfill({ status: 200, body: SITE_HTML('CODAL'), contentType: 'text/html' });
    if (u.host === 'owner.github.io') { const p = u.pathname.replace(/^\/petro-watch\//, '') || 'index.html'; const f = new URL('docs/' + p, root);
      if (fs.existsSync(f)) return route.fulfill({ status: 200, body: fs.readFileSync(f), contentType: p.endsWith('.html') ? 'text/html' : p.endsWith('.json') ? 'application/json' : p.endsWith('.js') ? 'text/javascript' : 'text/plain' }); }
    return route.fulfill({ status: 404, body: '' });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|CORS|Access-Control/.test(m.text())) errors.push(m.text()); });
  if (gm) {
    let gmCalls = 0;
    await page.exposeFunction('__gmFetch', async url => { gmCalls++; const m = handle(url); return m ? { status: m.status, text: m.body } : { status: 404, text: '' }; });
    page.gmCalls = () => gmCalls;
    await page.addInitScript(() => {
      window.GM_xmlhttpRequest = d => { let aborted = false;
        window.__gmFetch(d.url).then(r => { if (!aborted) d.onload({ status: r.status, responseText: r.text }); }).catch(() => d.onerror && d.onerror());
        return { abort() { aborted = true; d.onabort && d.onabort(); } }; };
      window.GM_getValue = (k, d) => { const v = localStorage.getItem('gm_' + k); return v === null ? d : JSON.parse(v); };
      window.GM_setValue = (k, v) => localStorage.setItem('gm_' + k, JSON.stringify(v));
      window.GM_setClipboard = t => { window.__clip = t; };
    });
  }
  return { ctx, page, errors };
}
const shadow = (page, sel) => page.locator('#petro-watch-root').locator(sel);

async function runSymbol(page, sym) {
  await shadow(page, 'input[name="sym"]').fill(sym);
  await shadow(page, '[data-el="go"]').click();
  await page.waitForFunction(() => { const r = document.querySelector('#petro-watch-root')?.shadowRoot; return r && /تمام شد/.test(r.querySelector('[data-el="steps"]')?.textContent || ''); }, null, { timeout: 90000 });
}
const lastResult = page => page.evaluate(() => { for (const k of ['gm_pw_last', 'pw_last']) { const v = localStorage.getItem(k); if (v) return JSON.parse(v); } return null; });

const browser = await chromium.launch();
try {
  // ---------------------------------------------------------------- 1) userscript on tsetmc
  console.log('1) userscript mode on www.tsetmc.com');
  {
    const { ctx, page, errors } = await newPage(browser, { gm: true });
    await page.goto(`https://www.tsetmc.com/instInfo/${MOCK.IC}`);
    await page.addScriptTag({ content: userjs });
    await shadow(page, '.fab').click();
    await page.waitForTimeout(400);
    check(await shadow(page, 'input[name="sym"]').inputValue() === MOCK.SYM, 'symbol auto-filled from /instInfo page');
    check(await shadow(page, 'input[name="c"]').isChecked(), 'codal enabled in GM mode');
    await runSymbol(page, MOCK.SYM);
    const b = await lastResult(page);
    check(b && b.tsetmc && !b.tsetmc.error && b.tsetmc.rubric, 'petroSnapshot ran: ' + (b?.tsetmc?.error || 'rubric ok'));
    check(b && b.codal && !b.codal.error && b.codal.n_letters === 8, 'codalSnapshot ran from the tsetmc tab: ' + (b?.codal?.error || b?.codal?.n_letters + ' letters'));
    check(b && b.codal.monthly_sales.length === 2, 'monthly sales parsed (' + b?.codal?.monthly_sales?.length + ')');
    check(b && b.codal.sector_regulatory_10d.length === 1, 'sector news found');
    check(b && b.letters.length >= 3 && b.letters.every(x => x.text && x.text.length > 50), 'letter texts fetched (' + b?.letters?.length + ')');
    check(page.gmCalls() > 0, `GM fallback used for cross-origin pages (${page.gmCalls()} calls)`);
    const txt = await shadow(page, '[data-el="result"]').innerText();
    check(/امتیاز بدون کدال/.test(txt) && /کدال ۷ روز اخیر/.test(txt), 'summary card rendered');
    await shadow(page, '[data-act="copy-claude"]').click();
    const clip = await page.evaluate(() => window.__clip || '');
    check(clip.startsWith('نماد: ' + MOCK.SYM) && clip.includes('### petroSnapshot') && clip.includes('### codalLetterText'), 'copy for Claude produces the bundle text');
    await page.screenshot({ path: OUT + '1-tsetmc-userscript.png' });
    await shadow(page, '[data-act="wide"]').click();
    await shadow(page, 'details.sec').evaluateAll(ds => ds.forEach(d => { d.open = true; }));
    await page.screenshot({ path: OUT + '1b-wide.png' });
    // full-length capture of the panel body
    const h = await page.evaluate(() => document.querySelector('#petro-watch-root').shadowRoot.querySelector('.body').scrollHeight);
    await page.setViewportSize({ width: 1400, height: Math.min(h + 200, 12000) });
    await page.screenshot({ path: OUT + '1c-wide-full.png' });
    fs.writeFileSync(new URL('docs/sample.json', root), JSON.stringify(b, null, 1));
    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  }

  // ---------------------------------------------------------------- 2) console mode on codal.ir (dark)
  console.log('2) console mode on www.codal.ir (dark)');
  {
    const { ctx, page, errors } = await newPage(browser, { dark: true, width: 1200 });
    await page.goto('https://www.codal.ir/');
    await page.addScriptTag({ content: plainjs });
    await page.waitForTimeout(300);
    check(!(await shadow(page, 'input[name="t"]').isChecked()), 'tsetmc unchecked on codal in console mode');
    await runSymbol(page, MOCK.SYM);
    const b = await lastResult(page);
    check(b && b.codal && b.codal.n_letters === 8 && !b.tsetmc, 'codal-only run works');
    check(await page.evaluate(() => typeof window.codalSnapshot === 'function'), 'collector functions exposed on window');
    await shadow(page, '[data-act="letter"]').first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: OUT + '2-codal-console-dark.png' });
    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  }

  // ---------------------------------------------------------------- 3) console mode on tsetmc + book
  console.log('3) console mode on www.tsetmc.com + evaluation book (mobile width)');
  {
    const { ctx, page, errors } = await newPage(browser, { width: 420, height: 860 });
    await page.goto('https://www.tsetmc.com/');
    await page.addScriptTag({ content: plainjs });
    await runSymbol(page, MOCK.SYM);
    const b = await lastResult(page);
    check(b && b.tsetmc && b.tsetmc.rubric && !b.codal, 'tsetmc-only run in console mode');
    await page.screenshot({ path: OUT + '3-tsetmc-console-mobile.png' });
    await shadow(page, '[data-tab="book"]').click();
    let k = 14; while ([4, 5].includes(new Date(MOCK.today.getTime() - k * 864e5).getUTCDay())) k++;
    const d10 = MOCK.jal(new Date(MOCK.today.getTime() - k * 864e5), false);
    await shadow(page, '[data-el="book-ta"]').fill(`\`\`\`json\n{"date":"${d10}","symbol":"${MOCK.SYM}","situation":"D","regime":"mid","decision":"NO_BUY_REDUCE","score":-4,"ref_price":0}\n{"date":"${d10}","symbol":"${MOCK.SYM}","decision":"BUY","ref_price":0}\n\`\`\``);
    await shadow(page, '[data-act="book-add"]').click();
    await shadow(page, '[data-act="book-eval"]').click();
    await page.waitForFunction(() => /ارزیابی همه/.test(document.querySelector('#petro-watch-root').shadowRoot.querySelector('[data-act="book-eval"]').textContent), null, { timeout: 30000 });
    const book = await shadow(page, '[data-pane="book"]').innerText();
    check(/از ۲/.test(book), 'evaluation filled the 5-day score');
    await page.screenshot({ path: OUT + '3b-book.png' });
    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  }

  // ---------------------------------------------------------------- 4) Pages site + viewer
  console.log('4) GitHub Pages site + viewer');
  {
    const { ctx, page, errors } = await newPage(browser, { width: 1100 });
    await page.goto('https://owner.github.io/petro-watch/');
    await page.screenshot({ path: OUT + '4-site.png', fullPage: true });
    await page.click('#sample');
    await page.waitForTimeout(500);
    const vt = await page.locator('#view .sum').innerText().catch(() => '');
    check(/امتیاز بدون کدال/.test(vt), 'viewer renders sample.json');
    await page.screenshot({ path: OUT + '4b-viewer.png', fullPage: true });
    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  }
} finally { await browser.close(); }
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
process.exit(fails.length ? 1 : 0);

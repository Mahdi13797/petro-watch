// build.mjs — builds docs/ (GitHub Pages) from src/: userscript, console/bookmarklet script, site, prompt.
// Usage: node build.mjs      (no dependencies)
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const write = (p, s) => { fs.writeFileSync(new URL(p, import.meta.url), s); console.log('wrote', p, (s.length / 1024).toFixed(1) + ' KB'); };

const cfg = JSON.parse(read('pw.config.json'));
const { version } = JSON.parse(read('package.json'));
const repoUrl = `https://github.com/${cfg.owner}/${cfg.repo}`;
const pages = `https://${cfg.owner.toLowerCase()}.github.io/${cfg.repo}/`;
const raw = `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch}/docs/`;
const installBase = cfg.public ? raw : '';

const collector = read('src/petro_collector.js');
const bridge = read('src/fetch-bridge.js');
const chart = read('src/chart.js');
const report = read('src/report.js');
const panel = read('src/panel.js');
const css = read('src/panel.css');
const prompt = read('prompt/Petro_Agent_Prompt_FA_v2_3.md');

const body = `(function () {
const PW_VERSION = ${JSON.stringify(version)};
const PW_REPO = ${JSON.stringify(repoUrl)};
const PW_PAGES = ${JSON.stringify(pages)};
const PW_CSS = ${JSON.stringify(css)};
const PW_PROMPT = ${JSON.stringify(prompt)};
const PW_GM = (typeof GM_xmlhttpRequest === 'function') ? {
  xhr: GM_xmlhttpRequest,
  get: typeof GM_getValue === 'function' ? GM_getValue : null,
  set: typeof GM_setValue === 'function' ? GM_setValue : null,
  clip: typeof GM_setClipboard === 'function' ? GM_setClipboard : null } : null;

${bridge}
const PW_NET = pwMakeNet(PW_GM);

// ---- collector (src/petro_collector.js, unchanged); its \`fetch\` is the bridge above
const PC = (function (fetch) {
${collector}
return { petroSnapshot, petroReplay, petroReplayRange, petroEvaluate, codalSnapshot, codalLetterText, codalClassify };
})(PW_NET.fetch);

${chart}
${report}
${panel}
})();
`;

const header = [
  '// ==UserScript==',
  '// @name         دیدبان پتروشیمی — پنل داده',
  `// @namespace    ${repoUrl}`,
  `// @version      ${version}`,
  '// @description  جمع‌آوری داده از tsetmc و کدال برای عامل تحلیل سهام پتروشیمی، با داشبورد و «کپی برای Claude»',
  '// @match        https://www.tsetmc.com/*',
  '// @match        https://tsetmc.com/*',
  '// @match        https://www.codal.ir/*',
  '// @match        https://codal.ir/*',
  '// @grant        GM_xmlhttpRequest',
  '// @grant        GM_getValue',
  '// @grant        GM_setValue',
  '// @grant        GM_setClipboard',
  '// @connect      cdn.tsetmc.com',
  '// @connect      www.tsetmc.com',
  '// @connect      tsetmc.com',
  '// @connect      search.codal.ir',
  '// @connect      www.codal.ir',
  '// @connect      codal.ir',
  '// @run-at       document-idle',
  '// @noframes',
  ...(installBase ? [`// @updateURL    ${installBase}petro-watch.user.js`, `// @downloadURL  ${installBase}petro-watch.user.js`] : []),
  `// @homepageURL  ${repoUrl}`,
  '// ==/UserScript==',
  ''
].join('\n');

const bookmarklet = `javascript:(function(){if(window.PetroWatch){PetroWatch.open();return}var s=document.createElement('script');s.src='${pages}petro-watch.js?v=${version}';document.documentElement.appendChild(s)})()`;

fs.mkdirSync(new URL('docs/', import.meta.url), { recursive: true });
write('docs/petro-watch.user.js', header + body);
write('docs/petro-watch.js', `/* دیدبان پتروشیمی ${version} — ${repoUrl} */\n` + body);
write('docs/prompt.md', prompt);
write('docs/.nojekyll', '');
write('docs/index.html', read('src/site.html')
  .replaceAll('{{VERSION}}', version).replaceAll('{{REPO}}', repoUrl)
  .replaceAll('{{USERJS}}', installBase ? installBase + 'petro-watch.user.js' : 'petro-watch.user.js')
  .replaceAll('{{BOOKMARKLET}}', bookmarklet.replace(/&/g, '&amp;').replace(/"/g, '&quot;')));

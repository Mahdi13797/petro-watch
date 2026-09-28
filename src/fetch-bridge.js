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

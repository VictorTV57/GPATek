// GPATek — runs in the page (MAIN world).
// Copies the JSON bodies of two read-only API responses the page already receives
// and hands them to the content script. Never reads, stores or sends any token,
// and never issues a request of its own.
(() => {
  if (window.__gpaTekInjected) return;
  window.__gpaTekInjected = true;

  const ROUTES = [
    { kind: 'validations', re: /\/api\/evaluations\/validations\/me(?:\?|$)/ },
    { kind: 'profile', re: /\/api\/students\/profile(?:\?|$)/ },
  ];

  const kindOf = (url) => {
    try {
      const href = new URL(url, location.href).href;
      const hit = ROUTES.find((r) => r.re.test(href));
      return hit ? hit.kind : null;
    } catch (_) {
      return null;
    }
  };

  const post = (kind, data) => {
    window.postMessage({ source: 'gpa-tek', kind, data }, location.origin);
  };

  const nativeFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await nativeFetch.apply(this, args);
    try {
      const input = args[0];
      const url = typeof input === 'string' ? input : input && input.url;
      const kind = kindOf(url);
      if (kind && res.ok) res.clone().json().then((d) => post(kind, d)).catch(() => {});
    } catch (_) { /* never break the page */ }
    return res;
  };

  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__gpaTekKind = kindOf(url);
    return open.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    if (this.__gpaTekKind) {
      this.addEventListener('load', () => {
        try {
          if (this.status >= 200 && this.status < 300) {
            const body = this.responseType === 'json' ? this.response : JSON.parse(this.responseText);
            post(this.__gpaTekKind, body);
          }
        } catch (_) { /* ignore */ }
      });
    }
    return send.apply(this, args);
  };
})();

// GPATek — DOM helpers: element builder, shadow hosts, text-leaf lookup.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});

  // Marker attributes on the hosts we inject, so they can be found and removed.
  UI.ATTR = Object.freeze({
    stat: 'data-gpa-tek-stat',
    badge: 'data-gpa-tek-badge',
    panel: 'data-gpa-tek-panel',
  });

  UI.el = function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style') n.setAttribute('style', v);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  };

  UI.shadowHost = function shadowHost(tag, attr) {
    const host = document.createElement(tag);
    host.setAttribute(attr, '');
    const root = host.attachShadow({ mode: 'open' });
    root.append(UI.el('style', { text: UI.CSS }));
    return { host, root };
  };

  UI.norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();

  // Elements without child elements whose normalised text satisfies predicate(text, node).
  UI.leavesWithText = function leavesWithText(scope, predicate) {
    const out = [];
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_ELEMENT);
    let n = walker.nextNode();
    while (n) {
      if (n.childElementCount === 0 && predicate(UI.norm(n.textContent), n)) out.push(n);
      n = walker.nextNode();
    }
    return out;
  };

  UI.mainScope = () => document.querySelector('main') || document.body;
})();

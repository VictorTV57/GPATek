// GPATek — badge next to the credits of each module ("≈ A · 4,00", "En cours · 23 XP").
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});

  const CREDITS_RE = /^\d+\s*(crédits?|credits?)$/;

  UI.renderBadges = function renderBadges(result) {
    const byTitle = new Map();
    for (const m of result.modules) {
      if (m.title) byTitle.set(UI.norm(m.title), m);
      if (m.titleEn) byTitle.set(UI.norm(m.titleEn), m);
    }

    for (const titleEl of UI.leavesWithText(UI.mainScope(), (t) => byTitle.has(t))) {
      const m = byTitle.get(UI.norm(titleEl.textContent));
      const header = titleEl.parentElement;
      if (!header || header.querySelector(`[${UI.ATTR.badge}]`)) continue;
      const creditLeaf = UI.leavesWithText(header, (t) => CREDITS_RE.test(t))[0];
      if (!creditLeaf) continue;

      const { host, root } = UI.shadowHost('div', UI.ATTR.badge);
      host.style.display = 'inline-flex';
      host.title = UI.tooltipFor(m);
      root.append(UI.el('span', { class: `badge ${UI.toneFor(m)}`, text: UI.badgeText(m, result.settings.mode) }));
      creditLeaf.parentElement.after(host);
    }
  };
})();

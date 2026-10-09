// GPATek — content script entry point (isolated world).
// Receives the API data copied by inject.js, computes the estimate with lib/gpa.js
// and draws the UI (content/ui/*) inside Shadow DOMs.
(() => {
  'use strict';
  if (window.__gpaTekContent) return;
  window.__gpaTekContent = true;

  const G = globalThis.GpaTek;
  const I18n = globalThis.GpaTekI18n;
  const UI = globalThis.GpaTekUI;
  const store = globalThis.GpaTekStore;

  const state = { validations: null, profile: null, settings: { ...G.DEFAULT_SETTINGS }, result: null, panelOpen: false };

  // ---------- panel ----------
  function openPanel() {
    state.panelOpen = true;
    UI.panel.show(state.result, closePanel);
  }

  function closePanel() {
    state.panelOpen = false;
    UI.panel.hide();
  }

  // ---------- render loop ----------
  let observer = null;
  let scheduled = false;

  function clearInjected() {
    document.querySelectorAll(`[${UI.ATTR.stat}],[${UI.ATTR.badge}]`).forEach((n) => n.remove());
  }

  function render() {
    scheduled = false;
    if (!state.result) return;
    if (observer) observer.disconnect();
    // Switching the language on the site redraws its page, which brings us here: redraw ours too.
    if (languageChanged()) {
      clearInjected();
      if (state.panelOpen) openPanel();
    }
    try {
      UI.renderStat(state.result, state.profile, openPanel);
      UI.renderBadges(state.result);
    } catch (e) {
      console.debug('[GPATek] render skipped', e);
    }
    observe();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(render, 250);
  }

  // The site is a SPA: re-render whenever the page DOM changes.
  function observe() {
    if (!document.body) return;
    if (!observer) observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ---------- language ----------
  // my.epitech.eu (i18next) saves the language picked in its settings under this localStorage key.
  // Its <html lang> stays "en" whatever the language, so it can't be used.
  // Only this key is read; the popup setting can override it.
  const SITE_LANG_KEY = 'i18nextLng';
  let storedSiteLang = null;

  function readSiteLang() {
    try { return I18n.normalize(localStorage.getItem(SITE_LANG_KEY)); } catch (_) { return null; }
  }

  function applyLanguage() {
    const siteLang = readSiteLang();
    if (siteLang && siteLang !== storedSiteLang) {
      storedSiteLang = siteLang;
      store.set({ siteLang }); // lets the popup follow the site in auto mode
    }
    I18n.setLang(I18n.resolve(state.settings.language, siteLang, navigator.language));
  }

  function languageChanged() {
    const before = I18n.lang;
    applyLanguage();
    return I18n.lang !== before;
  }

  // ---------- computation ----------
  function summaryOf(r) {
    return {
      officialGpa: r.officialGpa,
      estimatedGpa: r.estimatedGpa,
      pessimisticGpa: r.pessimisticGpa,
      baseCredits: r.baseCredits,
      countedCredits: r.countedCredits,
      enrolledCredits: r.enrolledCredits,
      semester: r.semester,
      modules: r.modules.map((m) => ({ title: m.title, credits: m.credits, averageScore: m.averageScore, points: m.points, letter: m.letter, status: m.status })),
      updatedAt: Date.now(),
    };
  }

  function recompute() {
    applyLanguage();
    if (!state.validations) return;
    state.result = G.computeGpa(state.validations, state.profile, state.settings);
    store.set({ summary: summaryOf(state.result) });
    clearInjected();
    schedule();
    if (state.panelOpen) openPanel();
  }

  // ---------- inputs ----------
  const isValidations = (d) => d && typeof d === 'object' && Array.isArray(d.blocks);

  window.addEventListener('message', (event) => {
    if (event.source !== window || event.origin !== location.origin) return;
    const msg = event.data;
    if (!msg || msg.source !== 'gpa-tek') return;
    if (msg.kind === 'validations' && isValidations(msg.data)) {
      // Only the running semester feeds the projection.
      if (msg.data.currentSemester != null && msg.data.semester !== msg.data.currentSemester) return;
      state.validations = msg.data;
      recompute();
    } else if (msg.kind === 'profile' && msg.data && typeof msg.data === 'object') {
      state.profile = { gpa: msg.data.gpa, semester: msg.data.semester };
      recompute();
    }
  });

  store.onChange('settings', (settings) => {
    state.settings = { ...G.DEFAULT_SETTINGS, ...(settings || {}) };
    recompute();
  });

  store.get(['settings']).then((v) => {
    state.settings = { ...G.DEFAULT_SETTINGS, ...(v.settings || {}) };
    recompute();
  });

  // Language changed in another my.epitech.eu tab.
  window.addEventListener('storage', (e) => {
    if (e.key === SITE_LANG_KEY && languageChanged()) recompute();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.panelOpen) closePanel(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true });
  else observe();
})();

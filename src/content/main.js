// GPATek — content script entry point (isolated world).
// Receives the API data copied by inject.js, computes the estimate with lib/gpa.js
// and draws the UI (content/ui/*) inside Shadow DOMs.
(() => {
  'use strict';
  if (window.__gpaTekContent) return;
  window.__gpaTekContent = true;

  const G = globalThis.GpaTek;
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

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.panelOpen) closePanel(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true });
  else observe();
})();

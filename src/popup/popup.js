// GPATek — popup: last summary saved by the content script, and the settings.
(() => {
  'use strict';
  const G = globalThis.GpaTek;
  const I18n = globalThis.GpaTekI18n;
  const { t } = I18n;
  const store = globalThis.GpaTekStore;
  const $ = (id) => document.getElementById(id);

  // Latest values, so a language change can redraw everything.
  const state = { summary: null, settings: { ...G.DEFAULT_SETTINGS }, siteLang: null };

  function showSummary(s) {
    if (!s) {
      $('sub').textContent = t('openSite');
      ['est', 'off', 'added', 'pess'].forEach((id) => { $(id).textContent = '—'; });
      $('offLabel').textContent = t('official');
      $('bar').style.width = '0';
      return;
    }
    const when = s.updatedAt ? new Date(s.updatedAt).toLocaleString(I18n.locale, { dateStyle: 'short', timeStyle: 'short' }) : '';
    $('sub').textContent = t('semesterUpdated', { semester: s.semester ?? '—', when });
    $('est').textContent = I18n.points(s.estimatedGpa);
    $('off').textContent = I18n.points(s.officialGpa);
    $('offLabel').textContent = t('officialCredits', { credits: s.baseCredits ?? 0 });
    $('added').textContent = `+${s.countedCredits ?? 0}`;
    $('pess').textContent = I18n.points(s.pessimisticGpa);
    $('bar').style.width = s.estimatedGpa != null ? `${Math.min(100, (s.estimatedGpa / 4) * 100)}%` : '0';
  }

  function showSettings(s) {
    $('mode').value = s.mode;
    $('countInProgress').checked = Boolean(s.countInProgress);
    $('language').value = s.language;
  }

  // Auto mode: the language last seen on my.epitech.eu, else the browser's.
  function render() {
    I18n.setLang(I18n.resolve(state.settings.language, state.siteLang, navigator.language));
    document.documentElement.lang = I18n.lang;
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    showSettings(state.settings);
    showSummary(state.summary);
  }

  function saveSettings() {
    state.settings = { mode: $('mode').value, countInProgress: $('countInProgress').checked, language: $('language').value };
    store.set({ settings: state.settings });
    render();
  }

  store.get(['summary', 'settings', 'siteLang']).then((v) => {
    state.summary = v.summary || null;
    state.settings = { ...G.DEFAULT_SETTINGS, ...(v.settings || {}) };
    state.siteLang = v.siteLang || null;
    render();
  });

  store.onChange('summary', (summary) => { state.summary = summary || null; showSummary(state.summary); });
  store.onChange('siteLang', (siteLang) => { state.siteLang = siteLang || null; render(); });

  ['mode', 'countInProgress', 'language'].forEach((id) => $(id).addEventListener('change', saveSettings));
  $('clear').addEventListener('click', () => {
    store.clear().then(() => {
      Object.assign(state, { summary: null, settings: { ...G.DEFAULT_SETTINGS }, siteLang: null });
      render();
    });
  });
})();

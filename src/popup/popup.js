// GPATek — popup: last summary saved by the content script, and the settings.
(() => {
  'use strict';
  const G = globalThis.GpaTek;
  const store = globalThis.GpaTekStore;
  const $ = (id) => document.getElementById(id);

  function showSummary(s) {
    if (!s) {
      $('sub').textContent = 'Ouvre « Ma scolarité » sur my.epitech.eu';
      ['est', 'off', 'added', 'pess'].forEach((id) => { $(id).textContent = '—'; });
      $('bar').style.width = '0';
      return;
    }
    const when = s.updatedAt ? new Date(s.updatedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '';
    $('sub').textContent = `Semestre ${s.semester ?? '—'} · mis à jour ${when}`;
    $('est').textContent = G.formatPoints(s.estimatedGpa);
    $('off').textContent = G.formatPoints(s.officialGpa);
    $('offLabel').textContent = `Officiel · ${s.baseCredits ?? 0} cr`;
    $('added').textContent = `+${s.countedCredits ?? 0}`;
    $('pess').textContent = G.formatPoints(s.pessimisticGpa);
    $('bar').style.width = s.estimatedGpa != null ? `${Math.min(100, (s.estimatedGpa / 4) * 100)}%` : '0';
  }

  function showSettings(settings) {
    const s = { ...G.DEFAULT_SETTINGS, ...(settings || {}) };
    $('mode').value = s.mode;
    $('countInProgress').checked = Boolean(s.countInProgress);
  }

  function saveSettings() {
    store.set({ settings: { mode: $('mode').value, countInProgress: $('countInProgress').checked } });
  }

  store.get(['summary', 'settings']).then((v) => {
    showSummary(v.summary);
    showSettings(v.settings);
  });

  store.onChange('summary', showSummary);

  $('mode').addEventListener('change', saveSettings);
  $('countInProgress').addEventListener('change', saveSettings);
  $('clear').addEventListener('click', () => {
    store.clear().then(() => { showSummary(null); showSettings(null); });
  });
})();

// GPATek — user-facing text in French and English, shared by the content scripts, the popup and the tests.
// The language follows my.epitech.eu (<html lang>) unless the user picks one in the popup.
(function (root) {
  'use strict';

  const LANGS = ['fr', 'en'];
  const FALLBACK = 'fr';

  const STRINGS = {
    fr: {
      estimatedGpa: 'GPA estimé',
      official: 'Officiel',
      officialCredits: 'Officiel · {credits} cr',
      estimatedCredits: 'Crédits estimés',
      ifItEnds: 'Si tout finit ainsi',
      disclaimer: 'Estimation non officielle · non affilié à Epitech',
      inProgress: 'En cours · {xp} XP',
      officialGrade: 'note officielle',
      unofficialEstimate: 'estimation non officielle',
      averageXp: 'Moyenne XP : {avg} / {max}',
      pointsTimesCredits: ({ points, credits }) => `Points : ${points} × ${credits} crédit${credits > 1 ? 's' : ''}`,
      creditsThreshold: 'Crédits obtenus à partir de {xp} XP de moyenne',
      statTitle: 'GPATek — cliquer pour le détail',
      panelLabel: 'Détail du GPA estimé',
      semesterMode: 'Semestre {semester} · mode {mode}',
      modeLetters: 'Lettres',
      modeLinear: 'Linéaire',
      close: 'Fermer',
      noteCountInProgress: 'Les UE sous {xp} XP de moyenne comptent comme un échec (0 point).',
      noteDefault: "Seules les UE déjà à {xp} XP de moyenne ou plus s'ajoutent au GPA officiel. « Si tout finit ainsi » compte les autres comme un échec.",
      rowSub: '{avg} / {max} XP moyen · {validated}/{total} compétences validées',
      openSite: 'Ouvre « Ma scolarité » sur my.epitech.eu',
      semesterUpdated: 'Semestre {semester} · mis à jour {when}',
      calcMode: 'Mode de calcul',
      modeLettersLong: 'Lettres — 1 point par 100 XP (A ≥ 400)',
      modeLinearLong: 'Linéaire — 4 × XP / 500',
      countInProgress: 'Compter les UE sous 100 XP comme un échec',
      language: 'Langue',
      languageAuto: 'Auto — langue du site',
      clearData: 'Effacer mes données',
    },
    en: {
      estimatedGpa: 'Estimated GPA',
      official: 'Official',
      officialCredits: 'Official · {credits} cr',
      estimatedCredits: 'Estimated credits',
      ifItEnds: 'If everything ends like this',
      disclaimer: 'Unofficial estimate · not affiliated with Epitech',
      inProgress: 'In progress · {xp} XP',
      officialGrade: 'official grade',
      unofficialEstimate: 'unofficial estimate',
      averageXp: 'Average XP: {avg} / {max}',
      pointsTimesCredits: ({ points, credits }) => `Points: ${points} × ${credits} credit${credits > 1 ? 's' : ''}`,
      creditsThreshold: 'Credits earned from a {xp} XP average',
      statTitle: 'GPATek — click for details',
      panelLabel: 'Estimated GPA breakdown',
      semesterMode: 'Semester {semester} · {mode} mode',
      modeLetters: 'Letters',
      modeLinear: 'Linear',
      close: 'Close',
      noteCountInProgress: 'Units under a {xp} XP average count as a fail (0 points).',
      noteDefault: 'Only units already at a {xp} XP average or more are added to the official GPA. "If everything ends like this" counts the others as a fail.',
      rowSub: '{avg} / {max} average XP · {validated}/{total} skills validated',
      openSite: 'Open your skills on my.epitech.eu',
      semesterUpdated: 'Semester {semester} · updated {when}',
      calcMode: 'Calculation mode',
      modeLettersLong: 'Letters — 1 point per 100 XP (A ≥ 400)',
      modeLinearLong: 'Linear — 4 × XP / 500',
      countInProgress: 'Count units under 100 XP as a fail',
      language: 'Language',
      languageAuto: 'Auto — site language',
      clearData: 'Clear my data',
    },
  };

  let current = FALLBACK;

  // 'en-GB', 'EN', 'fr_FR' → 'en' / 'fr'; anything else → null.
  function normalize(code) {
    const base = String(code || '').trim().toLowerCase().split(/[-_]/)[0];
    return LANGS.includes(base) ? base : null;
  }

  // setting: 'auto' | 'fr' | 'en'. In auto mode, the first known language among `detected` wins.
  function resolve(setting, ...detected) {
    const forced = normalize(setting);
    if (forced) return forced;
    for (const d of detected) {
      const lang = normalize(d);
      if (lang) return lang;
    }
    return FALLBACK;
  }

  function t(key, vars = {}) {
    const entry = STRINGS[current][key] ?? STRINGS[FALLBACK][key] ?? key;
    if (typeof entry === 'function') return entry(vars);
    return entry.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  }

  // GPA points with the decimal separator of the current language: "3,25" / "3.25".
  function points(value, digits = 2) {
    return root.GpaTek.formatPoints(value, digits, current === 'en' ? '.' : ',');
  }

  const api = {
    LANGS,
    STRINGS,
    normalize,
    resolve,
    t,
    points,
    setLang(lang) { current = normalize(lang) || FALLBACK; },
    get lang() { return current; },
    get locale() { return current === 'en' ? 'en-GB' : 'fr-FR'; },
  };
  root.GpaTekI18n = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

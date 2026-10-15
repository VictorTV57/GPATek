// GPATek — user-facing text, shared by the content scripts, the popup and the tests.
// French and English are built in. Other languages are community translations: src/locales/index.json
// lists them ({ "es": "Español" }) and src/locales/<code>.json holds the text, loaded on demand.
// A key missing from a translation is shown in English.
(function (root) {
  'use strict';

  const FALLBACK = 'fr'; // when no language can be detected
  const SOURCE = 'en';   // reference for translations, and fallback for missing keys

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
      pointsTimesCredits_one: 'Points : {points} × {count} crédit',
      pointsTimesCredits_other: 'Points : {points} × {count} crédits',
      nextBadge: '↑ {letter} −{xp} XP',
      nextBadgeCredits: '↑ crédits −{xp} XP',
      nextLetter_one: '{letter} à {target} XP de moyenne : encore {xp} XP, soit ≈ {total} XP sur {count} compétence',
      nextLetter_other: '{letter} à {target} XP de moyenne : encore {xp} XP, soit ≈ {total} XP sur {count} compétences',
      nextCredits_one: 'Crédits à {target} XP de moyenne : encore {xp} XP, soit ≈ {total} XP sur {count} compétence',
      nextCredits_other: 'Crédits à {target} XP de moyenne : encore {xp} XP, soit ≈ {total} XP sur {count} compétences',
      noActivities: "Plus d'activité prévue : les XP de cette UE ne peuvent plus monter ce semestre",
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
      pointsTimesCredits_one: 'Points: {points} × {count} credit',
      pointsTimesCredits_other: 'Points: {points} × {count} credits',
      nextBadge: '↑ {letter} −{xp} XP',
      nextBadgeCredits: '↑ credits −{xp} XP',
      nextLetter_one: '{letter} at a {target} XP average: {xp} XP to go, ≈ {total} XP over {count} skill',
      nextLetter_other: '{letter} at a {target} XP average: {xp} XP to go, ≈ {total} XP over {count} skills',
      nextCredits_one: 'Credits at a {target} XP average: {xp} XP to go, ≈ {total} XP over {count} skill',
      nextCredits_other: 'Credits at a {target} XP average: {xp} XP to go, ≈ {total} XP over {count} skills',
      noActivities: 'No activity left: the XP of this unit can no longer rise this semester',
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

  // Language code → its own name, as shown in the popup. Extended by addLanguages().
  const NAMES = { fr: 'Français', en: 'English' };
  const CODE_RE = /^[a-z]{2,3}$/;

  let current = FALLBACK;

  // 'en-GB', 'ES', 'fr_FR' → 'en' / 'es' / 'fr' when that language exists; anything else → null.
  function normalize(code) {
    const base = String(code || '').trim().toLowerCase().split(/[-_]/)[0];
    return base in NAMES ? base : null;
  }

  // setting: 'auto' or a language code. In auto mode, the first known language among `detected` wins.
  function resolve(setting, ...detected) {
    const forced = normalize(setting);
    if (forced) return forced;
    for (const d of detected) {
      const lang = normalize(d);
      if (lang) return lang;
    }
    return FALLBACK;
  }

  // Registers the languages listed in locales/index.json: { "es": "Español", … }.
  function addLanguages(index) {
    for (const [code, name] of Object.entries(index || {})) {
      if (CODE_RE.test(code) && !(code in NAMES) && typeof name === 'string' && name.trim()) NAMES[code] = name.trim();
    }
  }

  // English text a translation key corresponds to, or undefined for an unknown key.
  // Plural keys may use any CLDR form (pointsTimesCredits_few…) even if English only has _one and _other.
  function sourceText(key) {
    if (key in STRINGS[SOURCE]) return STRINGS[SOURCE][key];
    const plural = /^(.+)_(zero|one|two|few|many|other)$/.exec(key);
    return plural ? STRINGS[SOURCE][`${plural[1]}_other`] : undefined;
  }

  // Registers a translation, keeping only the known keys with text values.
  function addStrings(code, dict) {
    const clean = {};
    for (const [key, value] of Object.entries(dict || {})) {
      if (sourceText(key) !== undefined && typeof value === 'string' && value.trim()) clean[key] = value;
    }
    if (!(code in STRINGS)) STRINGS[code] = clean;
  }

  function lookup(key) {
    return STRINGS[current]?.[key] ?? STRINGS[SOURCE][key];
  }

  // Plurals: pass `count`, and the key gets the CLDR suffix of the language (_one, _few, _other…).
  function t(key, vars = {}) {
    let entry;
    if (typeof vars.count === 'number') {
      const form = new Intl.PluralRules(current).select(vars.count);
      entry = lookup(`${key}_${form}`) ?? lookup(`${key}_other`);
    }
    entry = entry ?? lookup(key) ?? key;
    return entry.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  }

  // GPA points with the decimal separator of the current language: "3,25" / "3.25".
  function points(value, digits = 2) {
    const decimal = new Intl.NumberFormat(current).formatToParts(1.5).find((p) => p.type === 'decimal');
    return root.GpaTek.formatPoints(value, digits, decimal ? decimal.value : '.');
  }

  // ---------- browser only: community translations, packaged in the extension ----------
  // Tolerant: resolves to null without chrome.* (page previews) or when the file is missing or invalid.
  function loadJson(path) {
    try {
      return fetch(root.chrome.runtime.getURL(path)).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    } catch (_) {
      return Promise.resolve(null);
    }
  }

  let languageList = null;
  const pending = {};

  // Resolves once locales/index.json is read (or failed to be).
  function loadLanguageList() {
    languageList ||= loadJson('locales/index.json').then(addLanguages);
    return languageList;
  }

  // Resolves once the text of `lang` is available. A missing file leaves it empty: English is shown.
  function loadStrings(lang) {
    if (lang in STRINGS) return Promise.resolve();
    pending[lang] ||= loadJson(`locales/${lang}.json`).then((dict) => addStrings(lang, dict));
    return pending[lang];
  }

  const api = {
    FALLBACK,
    SOURCE,
    STRINGS,
    normalize,
    resolve,
    addLanguages,
    addStrings,
    sourceText,
    loadLanguageList,
    loadStrings,
    t,
    points,
    setLang(lang) { current = normalize(lang) || FALLBACK; },
    hasStrings(lang) { return lang in STRINGS; },
    languages() { return Object.entries(NAMES).map(([code, name]) => ({ code, name })); },
    get lang() { return current; },
    get locale() { return { fr: 'fr-FR', en: 'en-GB' }[current] || current; },
  };
  root.GpaTekI18n = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

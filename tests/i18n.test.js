// Run with: npm test  (or: node --test)
const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/lib/gpa.js'); // i18n.points() relies on globalThis.GpaTek
const I18n = require('../src/lib/i18n.js');

test('normalize: keeps the base language, rejects unknown ones', () => {
  assert.equal(I18n.normalize('en-GB'), 'en');
  assert.equal(I18n.normalize('FR_fr'), 'fr');
  assert.equal(I18n.normalize('de'), null);
  assert.equal(I18n.normalize(''), null);
  assert.equal(I18n.normalize(undefined), null);
});

test('resolve: a forced language wins over the site language', () => {
  assert.equal(I18n.resolve('fr', 'en'), 'fr');
  assert.equal(I18n.resolve('en', 'fr'), 'en');
});

test('resolve: auto follows the first known language, then falls back to French', () => {
  assert.equal(I18n.resolve('auto', 'en-US'), 'en');
  assert.equal(I18n.resolve('auto', null, 'en'), 'en');
  assert.equal(I18n.resolve('auto', 'de', 'fr-CA'), 'fr');
  assert.equal(I18n.resolve('auto'), 'fr');
  assert.equal(I18n.resolve(undefined, 'en'), 'en');
});

test('every key exists in both languages', () => {
  assert.deepEqual(Object.keys(I18n.STRINGS.en).sort(), Object.keys(I18n.STRINGS.fr).sort());
});

test('t: fills placeholders and handles plurals in the current language', () => {
  I18n.setLang('en');
  assert.equal(I18n.t('inProgress', { xp: 23 }), 'In progress · 23 XP');
  assert.equal(I18n.t('pointsTimesCredits', { points: '4.00', count: 1 }), 'Points: 4.00 × 1 credit');
  assert.equal(I18n.t('pointsTimesCredits', { points: '4.00', count: 3 }), 'Points: 4.00 × 3 credits');
  I18n.setLang('fr');
  assert.equal(I18n.t('inProgress', { xp: 23 }), 'En cours · 23 XP');
  assert.equal(I18n.t('pointsTimesCredits', { points: '4,00', count: 1 }), 'Points : 4,00 × 1 crédit');
  assert.equal(I18n.t('pointsTimesCredits', { points: '4,00', count: 3 }), 'Points : 4,00 × 3 crédits');
});

test('points: decimal separator follows the language', () => {
  I18n.setLang('en');
  assert.equal(I18n.points(3.456), '3.46');
  I18n.setLang('fr');
  assert.equal(I18n.points(3.456), '3,46');
  assert.equal(I18n.points(null), '—');
});

test('setLang: unknown languages fall back to French', () => {
  I18n.setLang('de');
  assert.equal(I18n.lang, 'fr');
});

test('community language: listed, then resolved, with English for missing keys', () => {
  assert.equal(I18n.normalize('pl-PL'), null);
  I18n.addLanguages({ pl: 'Polski', 'not a code': 'x', fr: 'Override' });
  assert.equal(I18n.normalize('pl-PL'), 'pl');
  assert.equal(I18n.resolve('pl', 'fr'), 'pl');
  assert.equal(I18n.resolve('auto', 'fr', 'pl'), 'fr');
  assert.deepEqual(I18n.languages().map((l) => l.code), ['fr', 'en', 'pl']);
  assert.equal(I18n.languages()[0].name, 'Français');

  assert.equal(I18n.hasStrings('pl'), false);
  I18n.addStrings('pl', { close: 'Zamknij', unknownKey: 'x', estimatedGpa: 42, inProgress: '' });
  assert.equal(I18n.hasStrings('pl'), true);
  assert.deepEqual(Object.keys(I18n.STRINGS.pl), ['close']);

  I18n.setLang('pl');
  assert.equal(I18n.t('close'), 'Zamknij');
  assert.equal(I18n.t('estimatedGpa'), 'Estimated GPA');
  I18n.setLang('fr');
});

test('plurals follow the rules of each language, with any CLDR form', () => {
  I18n.addLanguages({ ru: 'Русский' });
  I18n.addStrings('ru', {
    pointsTimesCredits_one: '{count} кредит',
    pointsTimesCredits_few: '{count} кредита',
    pointsTimesCredits_many: '{count} кредитов',
    close_few: 'not a plural key',
  });
  assert.deepEqual(Object.keys(I18n.STRINGS.ru), ['pointsTimesCredits_one', 'pointsTimesCredits_few', 'pointsTimesCredits_many']);
  I18n.setLang('ru');
  assert.equal(I18n.t('pointsTimesCredits', { count: 1 }), '1 кредит');
  assert.equal(I18n.t('pointsTimesCredits', { count: 3 }), '3 кредита');
  assert.equal(I18n.t('pointsTimesCredits', { count: 5 }), '5 кредитов');
  assert.equal(I18n.points(3.456), '3,46');
  I18n.setLang('fr');
});

test('loading outside the extension resolves without throwing', async () => {
  assert.equal(await I18n.loadLanguageList(), undefined);
  await I18n.loadStrings('xx');
  assert.equal(I18n.hasStrings('xx'), true);
});

test('next step texts, singular and plural', () => {
  I18n.setLang('en');
  assert.equal(I18n.t('nextBadge', { letter: 'B', xp: 37 }), '↑ B −37 XP');
  assert.equal(I18n.t('nextLetter', { letter: 'B', target: 300, xp: 37, total: 148, count: 4 }),
    'B at a 300 XP average: 37 XP to go, ≈ 148 XP over 4 skills');
  I18n.setLang('fr');
  assert.equal(I18n.t('nextCredits', { target: 100, xp: 77, total: 77, count: 1 }),
    'Crédits à 100 XP de moyenne : encore 77 XP, soit ≈ 77 XP sur 1 compétence');
});

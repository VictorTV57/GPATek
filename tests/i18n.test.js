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
  assert.equal(I18n.t('pointsTimesCredits', { points: '4.00', credits: 1 }), 'Points: 4.00 × 1 credit');
  I18n.setLang('fr');
  assert.equal(I18n.t('inProgress', { xp: 23 }), 'En cours · 23 XP');
  assert.equal(I18n.t('pointsTimesCredits', { points: '4,00', credits: 3 }), 'Points : 4,00 × 3 crédits');
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

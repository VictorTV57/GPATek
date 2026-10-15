// Checks the community translations in src/locales/. Run with: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const I18n = require('../src/lib/i18n.js');

const dir = path.join(__dirname, '..', 'src', 'locales');
const source = I18n.STRINGS[I18n.SOURCE];
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
const placeholders = (s) => [...new Set(s.match(/\{\w+\}/g) || [])].sort();
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const index = readJson('index.json');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json');

test('index.json lists languages as { "<code>": "<name in that language>" }', () => {
  assert.ok(isObject(index), 'index.json must be an object');
  for (const [code, name] of Object.entries(index)) {
    assert.match(code, /^[a-z]{2,3}$/, `"${code}": use a 2- or 3-letter lowercase code (ISO 639)`);
    assert.ok(!(code in I18n.STRINGS), `"${code}" is built in: edit src/lib/i18n.js instead`);
    assert.ok(typeof name === 'string' && name.trim(), `"${code}": the name must be a non-empty string`);
  }
});

test('every listed language has a file, and every file is listed', () => {
  for (const code of Object.keys(index)) assert.ok(files.includes(`${code}.json`), `missing src/locales/${code}.json`);
  for (const f of files) assert.ok(path.basename(f, '.json') in index, `src/locales/${f} is not listed in index.json`);
});

for (const file of files) {
  test(`${file}: valid keys, text values and the same {placeholders} as English`, (t) => {
    const dict = readJson(file);
    assert.ok(isObject(dict), `${file} must be an object`);
    for (const [key, value] of Object.entries(dict)) {
      const english = I18n.sourceText(key);
      assert.ok(english !== undefined, `${file}: unknown key "${key}"`);
      assert.equal(typeof value, 'string', `${file}: "${key}" must be a string`);
      assert.deepEqual(placeholders(value), placeholders(english), `${file}: "${key}" must keep the placeholders of English`);
    }
    // A plural counts as translated as soon as one of its forms is.
    const base = (k) => k.replace(/_(zero|one|two|few|many|other)$/, '');
    const done = new Set(Object.keys(dict).map(base));
    const missing = [...new Set(Object.keys(source).map(base))].filter((k) => !done.has(k));
    if (missing.length) t.diagnostic(`${file}: ${missing.length} key(s) not translated yet, shown in English: ${missing.join(', ')}`);
  });
}

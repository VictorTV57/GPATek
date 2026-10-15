// Starts a community translation: npm run locale -- <code> <name>   e.g. npm run locale -- es Español
// Creates src/locales/<code>.json with the English text to translate, and lists it in src/locales/index.json.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const I18n = require('../src/lib/i18n.js');

const [code, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(' ').trim();
const fail = (msg) => { console.error(msg); process.exit(1); };

if (!/^[a-z]{2,3}$/.test(code || '') || !name) fail('Usage: npm run locale -- <code> <name>   (e.g. npm run locale -- es Español)');
if (code in I18n.STRINGS) fail(`"${code}" is built in (src/lib/i18n.js): edit it there.`);

const dir = path.join(__dirname, '..', 'src', 'locales');
const file = path.join(dir, `${code}.json`);
const indexFile = path.join(dir, 'index.json');
if (fs.existsSync(file)) fail(`${path.relative(process.cwd(), file)} already exists.`);

const write = (f, data) => fs.writeFileSync(f, `${JSON.stringify(data, null, 2)}\n`);

write(file, I18n.STRINGS[I18n.SOURCE]);
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
index[code] = name;
write(indexFile, Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b))));

console.log(`Created src/locales/${code}.json (English text to translate) and added "${name}" to src/locales/index.json.`);

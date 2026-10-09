# GPATek

Browser extension that estimates your GPA (/4) on my.epitech.eu from your skill XP, styled like
the site. Unofficial estimate, not affiliated with Epitech.

Works on Chromium-based browsers (Chrome, Edge, Brave, Opera / Opera GX, Vivaldi, Arc, Comet…) and on
Firefox-based browsers (Firefox 128+, Zen, LibreWolf, Floorp…), from the same `src/` folder.

## Installation (developer mode)

Get the `src/` folder first: clone the repository, or unzip a release into a folder you keep.

### Chromium-based browsers

1. Open the extensions page:

   | Browser | Address |
   |---|---|
   | Chrome, Comet, Arc | `chrome://extensions` |
   | Edge | `edge://extensions` |
   | Brave | `brave://extensions` |
   | Opera, Opera GX | `opera://extensions` |
   | Vivaldi | `vivaldi://extensions` |

2. Turn on **Developer mode**.
3. Click **Load unpacked** and pick the `src/` folder.
4. Reload my.epitech.eu, then open **Détails académiques → Compétences**.

After changing the code: click ⟳ on the extension card, then reload the page.

### Firefox-based browsers (Firefox, Zen…)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick `src/manifest.json`.
3. Reload my.epitech.eu, then open **Détails académiques → Compétences**.

A temporary add-on is removed when the browser closes. To keep it installed, use the signed version
from addons.mozilla.org once it is published, or build `dist/gpa-tek-<version>-firefox.zip` and have it
signed through AMO. After changing the code: click **Reload** on the add-on in `about:debugging`.

## What you get

- **Estimated GPA** ("GPA estimé") next to the official GPA, in the "Ma scolarité" header. Click it to
  open the per-unit breakdown.
- A **badge** next to the credits of each unit: `≈ A · 4,00`, or `En cours · 23 XP` while the unit is
  under 100 XP. Hover it to see the XP of each skill.
- The extension **popup**: summary, calculation mode, button to clear stored data.

## Calculation rules

- A unit's credits are earned once its skills average 100 XP (confirmed by a referent).
- **Letters** mode (default): 1 point per 100 XP of average → ≥ 400 = A (4), ≥ 300 = B (3),
  ≥ 200 = C (2), ≥ 100 = D (1), < 100 = fail (0).
- **Linear** mode: 4 × average XP / 500.
- An official grade (A to E) on a unit always replaces the estimate.
- Estimated GPA = (official GPA × official credits + Σ points × credits of units already earned) / total credits.
- "If everything ends like this" ("Si tout finit ainsi") also counts in-progress units under 100 XP as a fail.

## Data and privacy

- The extension only reads the responses of `/api/evaluations/validations/me` and `/api/students/profile`
  that the page already receives. It sends no request and never reads or stores any token.
- Only your settings and the latest summary are kept, in the browser's local storage.
- Permissions: `storage` only, scripts restricted to `https://my.epitech.eu/*`.

## Repository layout

```
src/                      Extension (folder to load in the browser)
├── manifest.json         Manifest V3 declaration (shared by Chromium and Firefox)
├── icons/
├── lib/
│   ├── gpa.js            Pure calculation (no DOM, no network), tested with Node
│   └── storage.js        chrome.storage.local access, shared by content and popup
├── content/
│   ├── inject.js         Page world: copies the API responses it receives
│   ├── main.js           Entry point: state, calculation, render loop
│   └── ui/
│       ├── styles.js     Shadow DOM CSS
│       ├── dom.js        DOM helpers (element builder, text lookup)
│       ├── format.js     Badge labels, colours and tooltips
│       ├── badges.js     Badge next to each unit's credits
│       ├── stat.js       "GPA estimé" column in the header
│       └── panel.js      Per-unit detail panel
└── popup/                Popup: summary and settings
tests/                    Calculation tests (node:test)
scripts/pack.ps1          Builds dist/gpa-tek-<version>-{chromium,firefox}.zip
```

Content scripts cannot be ES modules: each file in `content/ui/` is a classic script that registers
itself on `globalThis.GpaTekUI`, and their load order is set in `manifest.json`.
See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Development

```sh
npm test       # calculation tests (Node ≥ 18, no dependencies)
npm run pack   # zip src/ into dist/: one package for Chromium, one for Firefox
```

`dist/` (built packages) and `keys/` (private `.pem` key used to sign the `.crx`) are never committed.

## Contributing

Contributions are welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Victor Jost

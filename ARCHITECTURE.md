# Architecture

This document explains how GPATek works internally. Read it before your first contribution: it tells
you which file to look in and why the code is organised the way it is.

## Overview

GPATek is a **Manifest V3** extension with no service worker and no server. It makes **no network
requests**: it watches the responses my.epitech.eu already receives, computes an estimate and displays
it in the page.

```
                         my.epitech.eu (web app)
                                     │
             fetch / XHR  ───────────┤  /api/evaluations/validations/me
                                     │  /api/students/profile
                                     ▼
┌──────────────────────── MAIN world (page) ────────────────────────┐
│ content/inject.js   wraps fetch and XMLHttpRequest, copies the    │
│                     JSON of the two routes above                  │
└───────────────────────────────┬───────────────────────────────────┘
                                │ window.postMessage({ source: 'gpa-tek', kind, data })
                                ▼
┌──────────────────────── isolated world (extension) ───────────────┐
│ content/main.js     state + render loop                           │
│   ├── lib/gpa.js    computeGpa(validations, profile, settings)    │
│   ├── content/ui/*  badges, "GPA estimé" column, detail panel     │
│   └── lib/storage.js ──► chrome.storage.local { settings, summary }│
└───────────────────────────────────────────────────────────────────┘
                                ▲            │
                       settings │            │ summary
                                │            ▼
                     ┌──────────────── popup/ ────────────────┐
                     │ popup.js: shows the summary, edits the  │
                     │ settings                                │
                     └─────────────────────────────────────────┘
```

## The three execution contexts

| Context | Files | Access | Why |
| --- | --- | --- | --- |
| **MAIN world** (the page's own) | `content/inject.js` | The page's `window.fetch`, no `chrome.*` | The only place where the page's API responses are visible. |
| **Isolated world** (content script) | `lib/*`, `content/ui/*`, `content/main.js` | Page DOM, `chrome.storage` | Computes and draws. |
| **Popup** | `popup/*`, `lib/*` | `chrome.storage` | Summary and settings. |

The two worlds only talk through `window.postMessage`. `main.js` checks `event.source`,
`event.origin` and `msg.source === 'gpa-tek'` before accepting a message.

## Files

### `src/lib/gpa.js` — the calculation

Pure functions, no DOM, no network, exposed on `globalThis.GpaTek` (browser) and through
`module.exports` (Node, for the tests).

- `evaluateModule(block, settings)` turns an API block (one teaching unit, "UE") into a module:
  points, letter, status (`official` / `acquired` / `in_progress`) and `next`. `next` is `null` when
  the grade is official or when the API's `hasOpportunity` is false: XP only rises while activities
  are linked to the unit, so without any the step can't be reached this semester (`hasActivities`).
- `nextStep(averageScore, mode, skillCount)` returns the next average XP that earns something — the
  credits at 100 XP, then each letter up to A at 400 in letters mode — with the XP missing on average
  and roughly in total over the unit's skills, or `null` (official grade, A reached, linear mode once
  the credits are earned).
- `computeGpa(validations, profile, settings)` returns the estimated GPA, the "if everything ends like
  this" GPA, the credits taken into account and the list of modules.
- Constants: `XP_FOR_CREDITS = 100`, `XP_MAX = 500`, `DEFAULT_SETTINGS`.

**Every calculation rule lives here and must be covered by `tests/gpa.test.js`.**

### `src/lib/i18n.js` — languages

All user-facing text, exposed on `globalThis.GpaTekI18n` (and `module.exports` for the tests).
`t(key, vars)` returns the text in the current language and fills `{placeholders}`; with a numeric
`count`, it picks the plural form of the language (`key_one`, `key_few`, `key_other`…, through
`Intl.PluralRules`). `points(value)` formats GPA points with the decimal separator of the language
(`3,25` / `3.25`, through `Intl.NumberFormat`).

**Two kinds of languages:**

- **Built in**: French and English, written in `i18n.js`. English is the reference: every key exists
  there, and it is the fallback for a key missing from a translation.
- **Community translations**: `src/locales/index.json` lists them (`{ "es": "Español" }`) and
  `src/locales/<code>.json` holds the text. They are packaged in the extension and read with
  `fetch(chrome.runtime.getURL(…))`, which never leaves the browser: `loadLanguageList()` once, then
  `loadStrings(code)` the first time a language is used, while the text shows in English.
  `addStrings()` keeps only known keys (including any plural form of them) with text values, so a
  faulty file cannot break the display. `tests/locales.test.js` checks every file, and
  `npm run locale -- <code> <name>` starts a new one (see CONTRIBUTING.md).

The language is chosen by `resolve(setting, ...detected)`: a language forced in the popup wins,
otherwise (`auto`) the first known language among the detected ones, otherwise French. The site only
offers French and English, so a community language is only used when picked in the popup or, if the
site's language is unknown, when it is the browser language.

- **Page**: my.epitech.eu uses i18next, which saves the language picked in its settings in
  `localStorage.i18nextLng` (`fr` / `en`). `main.js` reads **only that key**, then falls back to the
  browser language. (`<html lang>` cannot be used: the site leaves it at `en` whatever the language.)
  Switching the language redraws the site's page, which triggers our render loop: `render()` checks
  the language again and redraws the badges, the column and the panel without a reload. A `storage`
  event covers a change made in another tab. Module and skill titles use the API's `titleFr` in
  French and its `title` (English) in every other language: the API has no other.
- **Popup**: it cannot see the page, so the content script stores the last site language
  (`siteLang`); the popup uses it in auto mode, then falls back to the browser language.

### `src/lib/storage.js` — storage

A small wrapper around `chrome.storage.local` (`get`, `set`, `clear`, `onChange`) that does not crash
when `chrome` is missing (previews, tests). Keys in use:

| Key | Written by | Read by | Content |
| --- | --- | --- | --- |
| `settings` | popup | content, popup | `{ mode: 'letters' \| 'linear', countInProgress: boolean, language: 'auto' \| language code }` |
| `summary` | content | popup | Latest result (GPA, credits, modules, `updatedAt`) |
| `siteLang` | content | popup | Last language seen on my.epitech.eu: `'fr'` or `'en'` |

### `src/content/inject.js` — capture

Replaces `window.fetch` and `XMLHttpRequest.prototype.open/send` with versions that call the original,
then clone the response if the URL matches one of the two routes. Rules:

- **never** break the page (everything is wrapped in `try/catch`, the original response is always returned);
- **never** read a header, token or cookie;
- **never** issue a request.

### `src/content/main.js` — orchestration

- Holds the state: `validations`, `profile`, `settings`, `result`, `panelOpen`.
- Recomputes (`recompute`) on every new piece of data or settings change, then saves the `summary`.
- The site is a SPA: a `MutationObserver` triggers a new render (debounced by 250 ms) when the DOM
  changes. The observer is disconnected during rendering so it does not trigger itself.
- Only the current semester is used (`semester === currentSemester`).

### `src/content/ui/` — display

| File | Role |
| --- | --- |
| `styles.js` | CSS injected into every Shadow DOM (`UI.CSS`) |
| `dom.js` | `el()`, `shadowHost()`, `leavesWithText()`, marker attributes `UI.ATTR` |
| `format.js` | Text, colour (`tone-*`) and tooltip of a badge |
| `badges.js` | Badge next to the credit count of each unit |
| `stat.js` | "GPA estimé" column next to the official GPA |
| `panel.js` | Detail side panel (`UI.panel.show / hide`) |

## Design decisions

**Classic scripts rather than ES modules.** Chrome does not load content scripts as modules. Each file
is therefore an IIFE that registers itself on a global namespace (`GpaTek`, `GpaTekStore`,
`GpaTekUI`). **The order in `manifest.json` matters**: `lib/` first, then `ui/styles.js` and
`ui/dom.js`, then the rest of `ui/`, and `main.js` last.

**One manifest for every browser.** The extension uses nothing that differs between engines: no
background script, and only `chrome.storage`, which Firefox also exposes under `chrome.*` with
callbacks. `browser_specific_settings.gecko` holds the Firefox ID, the data-collection declaration that
addons.mozilla.org requires, and the minimum version: 128, the first Firefox that runs a content
script declared with `"world": "MAIN"`. Chromium-based browsers ignore that key, and `scripts/pack.ps1`
removes it from the Chromium package so Chrome doesn't warn about an unrecognized key.

**Shadow DOM everywhere.** Everything injected lives in a shadow root: the site's CSS cannot reach us
and ours cannot leak onto the site.

**Find elements by text, not by CSS class.** The site's classes are generated and change with every
deployment. So we look for DOM "leaves" by their text: a unit title, `"4 crédits"`, the official GPA
value. This is more robust, but it is **the most fragile part of the extension**: if the site changes
its labels, badges silently disappear (rendering fails quietly, with a `console.debug`).

**No service worker.** There is nothing to do in the background, so there is no extra surface.

**Minimal permissions.** `storage` only, scripts restricted to `https://my.epitech.eu/*`. The only
`web_accessible_resources` are `locales/*.json`, for my.epitech.eu only: Chrome requires it for a
content script to read a file of its own extension. These files hold public interface text.

## Adding a feature: where to look

| I want to… | File(s) |
| --- | --- |
| Change a calculation rule | `lib/gpa.js` and `tests/gpa.test.js` |
| Add a setting | `lib/gpa.js` (`DEFAULT_SETTINGS`), `popup/popup.html`, `popup/popup.js` |
| Read another API route | `content/inject.js` (`ROUTES`) and the `message` handler in `content/main.js` |
| Show a new element in the page | New file in `content/ui/`, add it to `manifest.json`, call it from `render()` |
| Change the look | `content/ui/styles.js` (page) or `popup/popup.css` |
| Add or change a text | `lib/i18n.js` (both `fr` and `en`), then `t('key')` in the UI (`data-i18n="key"` in `popup.html`) |
| Add a language | `npm run locale -- <code> <name>`, then translate `locales/<code>.json` (see CONTRIBUTING.md) |

## Debugging

- **Is the data arriving?** In the my.epitech.eu devtools, Network tab: both routes should answer 200.
  A `console.log(msg)` in the `message` handler of `main.js` confirms reception.
- **Nothing shows up?** Enable "Verbose" messages in the console and look for `[GPATek] render skipped`.
- **The popup** can be inspected with a right click on it, then "Inspect".
- **The calculation** can be tested without a browser: `npm test`.

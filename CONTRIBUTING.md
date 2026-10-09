# Contributing to GPATek

Thanks for wanting to help! GPATek is a small student project: every contribution counts, whether it
is reporting a bug, fixing a typo or adding a feature.

By taking part, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Where to start

1. Read the [README](README.md) to learn what the extension does.
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it is built.
3. Browse the [issues](https://github.com/VictorTV57/GPATek/issues), especially those labelled
   `good first issue`.

## Reporting a bug or suggesting an idea

Open an [issue](https://github.com/VictorTV57/GPATek/issues/new/choose) using the matching template:

- **Bug**: something does not work or does not show up.
- **Wrong calculation**: the estimated GPA is not what it should be.
- **Feature request**: a new feature or an improvement.

⚠️ **Never post personal data**: no token, no cookie, no raw API response containing your login or
name. Anonymise screenshots and JSON excerpts (keep only `credits`, `averageScore`, `grade`, etc.).

For a security vulnerability, do not open a public issue: use
[GitHub private vulnerability reporting](https://github.com/VictorTV57/GPATek/security/advisories/new).

## Local setup

Requirements: Chrome or Edge, Git, and Node.js 18+ (only for the tests; there are no npm dependencies).

```sh
git clone git@github.com:VictorTV57/GPATek.git
cd GPATek
npm test
```

Then load the extension:

1. `chrome://extensions` → turn on **Developer mode**.
2. **Load unpacked** → pick the `src/` folder.
3. Open my.epitech.eu → **Détails académiques → Compétences**.

After each change: click ⟳ on the extension card, then reload the page.

## Branches

```
main   ●───────────────────●──────────────●        releases only (tagged v1.0.0, v1.1.0…)
        \                 ↑ PR            ↑ PR
dev      ●────●─────●─────●──────●────────●        integration branch, always working
               \   ↑ PR    \    ↑ PR
feat/…          ●──●        \   │
fix/…                        ●──●
```

| Branch | Purpose | Who pushes |
| --- | --- | --- |
| `main` | Stable code, matches the latest release. | Nobody directly: only PRs from `dev` (or `hotfix/…`). |
| `dev` | Integration branch: the next release being built. Must always load and pass `npm test`. | Nobody directly: only PRs from work branches. |
| `feat/…`, `fix/…`, … | One branch per change. | You. |

**Rules**

- **No direct commits on `main` or `dev`.** Every change goes through a pull request.
- Work branches start from an up-to-date `dev` and are merged back into `dev`.
- `dev` is merged into `main` by the maintainer when releasing (see [Releasing](#releasing-maintainer)).
- Urgent fix for a released version: `hotfix/…` branch from `main`, PR into `main`, then merge `main`
  back into `dev`.
- Delete your branch once its PR is merged.

**Naming**: `<type>/<short-description>`, lowercase, words separated by hyphens, in English.
The type is the same as in [commit messages](#commit-messages).

| Type | Example |
| --- | --- |
| `feat/` | `feat/weighted-mode` |
| `fix/` | `fix/english-title-badge` |
| `docs/` | `docs/install-on-edge` |
| `refactor/` | `refactor/panel-rows` |
| `test/` | `test/official-grades` |
| `chore/` | `chore/pack-script` |
| `hotfix/` | `hotfix/badge-crash` |

Add the issue number when there is one: `fix/12-english-title-badge`.

## Submitting a change

1. Fork the repository (or clone it if you are a collaborator), then branch from `dev`:

   ```sh
   git switch dev
   git pull
   git switch -c feat/weighted-mode
   ```

2. Commit in small, focused steps (see [Commit messages](#commit-messages)).
3. Keep your branch up to date with `dev`: `git pull --rebase origin dev`.
4. Go through the checklist below, then push: `git push -u origin feat/weighted-mode`.
5. Open a pull request **against `dev`** (not `main`) and fill in the template.
   With the GitHub CLI: `gh pr create --base dev --fill`.
6. Answer review comments by pushing new commits to the same branch.
7. Once approved, the PR is merged with **squash and merge**: the PR title becomes the commit on
   `dev`, so it must follow the commit message format.

One pull request = one topic. Several unrelated changes means several PRs.

### Before opening the pull request

- [ ] The branch starts from `dev` and the PR targets `dev`.
- [ ] `npm test` passes.
- [ ] Every calculation rule changed in `src/lib/gpa.js` has a test in `tests/gpa.test.js`.
- [ ] The extension was reloaded and tested on my.epitech.eu (Compétences and Ma scolarité pages, popup).
- [ ] No new permission in `manifest.json`, or it is justified in the PR.
- [ ] No network request added and no token read (see "Project principles" below).
- [ ] README or ARCHITECTURE.md updated if behaviour or structure changed.

## Project principles

These rules are not negotiable, because users' trust depends on them:

- **Read-only**: the extension sends no request, neither to Epitech nor anywhere else.
- **No secrets**: no token, cookie or header is ever read, stored or sent.
- **Minimal permissions**: `storage` only, scripts restricted to `https://my.epitech.eu/*`.
- **Never break the site**: on error, the extension shows nothing and the page keeps working.
- **Transparency**: the estimate is always presented as unofficial.

## Code style

- Plain JavaScript: no framework, no build step, no dependency.
- Classic scripts as IIFEs with `'use strict'` (no ES modules in content scripts, see
  [ARCHITECTURE.md](ARCHITECTURE.md#design-decisions)).
- 2-space indentation, single quotes, semicolons.
- Code comments in English; user-facing text in French (the site is in French).
- One function = one responsibility; calculation stays in `lib/gpa.js`, display in `content/ui/`.
- New content script file: add it at the right place in the `js` list of `manifest.json`.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are **written in English**.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Only the first line is required.

### Type

| Type | Use it for | Appears in the changelog |
| --- | --- | --- |
| `feat` | A new feature for users | ✅ |
| `fix` | A bug fix (including a wrong calculation) | ✅ |
| `perf` | A performance improvement | ✅ |
| `refactor` | Code change that neither fixes a bug nor adds a feature | ❌ |
| `style` | Formatting only (spaces, semicolons…), no code change | ❌ |
| `test` | Adding or fixing tests | ❌ |
| `docs` | Documentation only (README, ARCHITECTURE, comments…) | ❌ |
| `chore` | Tooling, scripts, config, `.gitignore`, version bumps | ❌ |
| `ci` | GitHub Actions and other CI config | ❌ |
| `revert` | Reverting a previous commit | ✅ |

### Scope (optional)

The part of the project touched, in parentheses:

| Scope | Files |
| --- | --- |
| `calc` | `src/lib/gpa.js` |
| `storage` | `src/lib/storage.js` |
| `inject` | `src/content/inject.js` |
| `content` | `src/content/main.js` |
| `ui` | `src/content/ui/*` |
| `popup` | `src/popup/*` |
| `manifest` | `src/manifest.json` |
| `github` | `.github/*` |

### Subject

- Imperative mood, as if completing "If applied, this commit will…": `add`, not `added` or `adds`.
- Lowercase first letter, no full stop at the end.
- 72 characters at most for the whole first line.
- Says **what** changes, not how.

### Body (optional)

Separated from the subject by a blank line, wrapped at 72 characters. Explains **why** the change is
needed and what it was like before. Useful as soon as the change is not obvious.

### Footer (optional)

- Link issues: `Closes #12`, `Refs #8`.
- Breaking change (e.g. a stored setting renamed, a calculation rule changed): add `!` after the type
  and a `BREAKING CHANGE:` line explaining what users or contributors must do.
- Co-authors: `Co-authored-by: Name <email>`.

### Examples

```
feat(calc): add a weighted calculation mode
fix(ui): show the badge when the unit title is in English
docs: clarify installation on Edge
test(calc): cover lowercase official grades
refactor(ui): extract panel row rendering
chore: bump version to 1.1.0
```

With a body and a footer:

```
fix(content): ignore validations from past semesters

The API also returns previous semesters when the student switches
the semester selector. Their modules were added to the estimate,
which counted already-graded credits twice.

Closes #14
```

Breaking change:

```
feat(calc)!: count in-progress units as a fail by default

BREAKING CHANGE: the default of the "countInProgress" setting is now
true. Users who relied on the old default must uncheck it in the popup.
```

❌ To avoid: `update`, `fix bug`, `WIP`, `Fixed the badges.`, French messages, one commit mixing
several unrelated changes.

## Releasing (maintainer)

1. On a `chore/release-x.y.z` branch from `dev`: bump `version` in `src/manifest.json` and
   `package.json` (`chore: bump version to x.y.z`), PR into `dev`.
2. Open a PR from `dev` into `main` titled `release: vx.y.z`, merged with a **merge commit**
   (not squash) to keep the history.
3. On `main`: `npm test`, then `npm run pack` → `dist/gpa-tek-<version>.zip`.
4. Tag and publish: `gh release create vx.y.z dist/gpa-tek-x.y.z.zip --generate-notes`.

The signing private key (`keys/*.pem`) is **never** committed.

## Questions

Open an issue with the "Feature request" template, or comment on an existing issue. There are no
stupid questions.

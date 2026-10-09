# Security Policy

GPATek runs inside my.epitech.eu, a page where students are logged in. Its security model is simple:
it is **read-only**, sends **no network requests**, and never reads, stores or sends any token,
cookie or header. Anything that breaks one of these guarantees is a vulnerability.

## Supported versions

Only the latest release receives security fixes.

| Version | Supported |
| --- | --- |
| 1.0.x (latest) | ✅ |
| Older | ❌ |

## Reporting a vulnerability

**Please do not open a public issue.** Report it privately instead:

1. Preferred: [GitHub private vulnerability reporting](https://github.com/VictorTV57/GPATek/security/advisories/new).
2. Or by email: **victor.jost@epitech.eu**, with `[GPATek security]` in the subject.

Please include:

- the extension version and browser;
- a description of the issue and its impact;
- steps to reproduce or a proof of concept;
- **no real personal data**: anonymise any API response, and never send your own or someone else's token.

## What to expect

- Acknowledgement within **7 days**.
- A first assessment (confirmed or not, severity) within **14 days**.
- A fix released as soon as possible for confirmed issues, then a public advisory crediting you
  (unless you prefer to stay anonymous).

This is a student project maintained on a best-effort basis; these delays are goals, not guarantees.

## Scope

In scope, for example:

- a way for the page or a third party to make the extension leak data, read tokens or send requests;
- message spoofing between `content/inject.js` and `content/main.js` leading to code execution or
  data leaks;
- HTML / script injection through the content the extension draws in the page or in the popup;
- the extension breaking my.epitech.eu in a way that exposes data.

Out of scope:

- vulnerabilities in my.epitech.eu itself: report them to Epitech, not here;
- vulnerabilities in the browser;
- wrong GPA estimates: use the "Wrong calculation" issue template.

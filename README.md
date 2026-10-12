# CRA Scope & Classifier

An informational tool for the EU Cyber Resilience Act (Regulation (EU) 2024/2847): does the CRA
apply to a product, which class it falls in, and when the obligations apply. It shows what the
official texts say and where they are undetermined, with citations. **It is not legal advice**, a
conformity assessment or a guarantee of compliance (DR-04).

The tool is time-boxed (DR-05): every result states the law it rests on, and after the end date
results carry a prominent marker. A weekly check of EUR-Lex flags changes in the law.

Results can be saved as PDF, Markdown or JSON. Everything runs in the browser; nothing entered is
sent anywhere. No cookies. If enabled, page views and a few step names are counted anonymously with
GoatCounter (EU-hosted, cookieless), skipped when the browser asks not to be tracked. Code is Apache-2.0, rules and test cases are CC BY 4.0: see [LICENSING.md](LICENSING.md).

**Disclaimer.** This tool is an informational aid for a preliminary assessment of applicability and
product classification under the EU Cyber Resilience Act. It does not provide legal advice, a binding
interpretation, a conformity assessment, certification, or any guarantee that a product meets all
legal requirements. Its outcome depends on the accuracy and completeness of the information entered,
and on the version of the legal sources and decision rules shown. Users remain responsible for their
own assessment and should consult a qualified adviser or competent authority when in doubt. To the
extent permitted by applicable law, the tool and its content are provided without warranties, and the
liability of its providers and contributors is limited. Nothing in this notice excludes liability
that cannot be excluded by law.

## Layout

| Path | What |
|---|---|
| `packages/rules` | Rule data: all legal content, each condition quoted verbatim from a held source |
| `packages/engine` | Pure TypeScript engine: logic only, no legal content |
| `packages/schemas` | JSON Schemas for rule sets and assessment output |
| `apps/web` | Static front end; runs entirely in the browser |
| `tests/fixtures` | Golden outputs from the reference engine; the engine must match them exactly |
| `docs/legal/sources` | Held legal texts with hashes (`CHECKSUMS.txt`, `MANIFEST.md`) |
| `docs/research` | Research study (WP1-WP7), reference engine and the EUR-Lex watch tool |
| `docs/plans` | v3/v4 plans and decisions DR-01 to DR-05 |

## Development

Node 24 (`.nvmrc`) and Python 3.12.

```
npm ci --legacy-peer-deps
npm test                       # type check, golden fixtures, schema tests
npm run verify:research        # quotes verbatim in held sources, category list, open questions
npm run dev -w @cra/web        # local site
```

`--legacy-peer-deps` works around an npm resolver bug with Vitest's optional peer dependencies.

## Automation (GitHub Actions)

| Workflow | When | What |
|---|---|---|
| `ci` | every push and pull request | tests, rule verification, build, no-external-requests check |
| `law-watch` | Mondays 06:17 UTC, or by hand | checks EUR-Lex; on a change, opens or comments on an issue that @-mentions the owner, and publishes `law-status.json` so affected results are marked |
| `pages` | push to `main`, and after each `law-watch` | builds and deploys the site to GitHub Pages |

### One-time setup on GitHub

1. Create the repository and push `main`. Public repositories get Actions minutes and Pages for
   free; private repositories need a paid plan for Pages.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. **Settings → Actions → General → Workflow permissions:** leave the default; the workflows request
   the permissions they need.
4. Make sure you are **Watching** the repository and have email notifications for issues enabled
   (**Settings → Notifications** on your account). The law-watch issue @-mentions the owner, so it
   reaches you even with "Participating and @mentions" only.
5. Run `law-watch` once by hand (**Actions → law-watch → Run workflow**) to confirm it works.

GitHub disables scheduled workflows in public repositories after 60 days without activity. The
law-watch run commits its status file each week, which should keep the schedule alive; check after
two months that it is still running.

### When law-watch reports a change

1. Read the new text and decide whether it changes a rule (`docs/research/tools/eurlex_watch.py fetch`).
2. Update and re-verify the affected rules; record the outcome in `docs/legal/sources/MANIFEST.md`.
3. `python3 docs/research/tools/eurlex_watch.py accept`, commit the new baseline, close the issue.

Until step 3, results that rely on an affected source show a LAW_CHANGED marker.

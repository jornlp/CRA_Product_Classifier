# WP2 — status: complete, pending review

WP2's objective was to let users describe products in their own words without needing to know
Annex categories. Its "done when" was: every decisive fact has a plain-language question and a
worked example, and no question asks the user to pick an Annex category.

## Done-when check

| Criterion | Result |
|---|---|
| Decisive facts identified | **49**, collapsed from WP1's 76 conditions |
| Every fact has a plain-language question | 49 / 49 |
| Every fact has `why_we_ask` with its provision | 49 / 49 |
| Every fact has a worked example, positive and negative | 49 / 49 |
| No question asks the user to pick an Annex category | Verified — none |
| All 26 categories have at least one discriminating fact | 26 / 26 |

## Outputs

| File | What it is |
|---|---|
| `wp2-fact-register.json` | The 49 facts: question, provision, worked example, evidence expectation, certification proxy where one exists, suggested question order |
| `wp2-taxonomy.json` | 222 market terms mapped to facts, plus 12 **trap terms** that predictably mislead |
| `wp2-decidability.md` | Consolidated result of the collection experiment |
| `wp2-collection-tranche-1/2/3.md` | The collection itself: critical and Class II, Class I hardware and consumer, Class I software |

## What WP2 established

**1. Documents state what a product IS and HAS, never what it is FOR.** Feature facts are
document-decidable; purpose, context, boundary and role facts are not. Since Art. 7(1)/8(1) make
core functionality the legal test, the most decisive fact in the model is precisely the one no
document supplies. **13 of 49 facts are `MANUFACTURER_ONLY`** and must carry `USER_CONFIRMED`
provenance — a hard architectural limit on any document-reading step, human or LLM.

**2. Certification markers are the one real accelerator.** Six facts carry a `certification_proxy`
— Common Criteria with AVA_VAN levels, BSI protection profiles, FIPS and PCI listings, PSA
Certified, SESIP, and operating-system protection profiles. Documentary, independently
registered, and far easier to answer than the abstract condition. Used **positive only**: holding
one evidences the condition, not holding one proves nothing. Record the scheme, not just the
level.

**3. `CONFLICTING` evidence has a predictable home** — where documents state context incidentally.
A smart lock marketed for "residential and Airbnb" was found verbatim, which is `LOCK-04`.

**4. Open-source documentation is the most verifiable evidence class and the least clearly owned.**
Precise and public; who must answer for it is the open question, which lands on Art. 3(14).

**5. Question pruning is a legal-safety feature, not a UX nicety.** 49 questions is too many for a
2–5 minute precheck, and the register is the pool `getNextQuestions` draws from, not a
questionnaire. `IS_INTEGRATED_CIRCUIT` alone gates five categories. But **every question the
engine skips needs a recorded exclusion reason** for the categories it would have tested —
otherwise pruning silently recreates the incomplete-coverage problem AC-03 exists to prevent.

## Status and caveat

Everything here is **DRAFT and unreviewed**, authored in one pass by one person — the same caveat
as WP1's conditions. Each question carries its source provision inline precisely so that a
reviewer can check question → condition → official text in a single pass, which also serves as
the review of WP1's conditions.

## What WP2 did not do

- **No interviews.** The vocabulary comes from public product documents, not from users. That is
  WP3, and it will likely move several terms.
- **No comprehension testing.** WP6, against AC-08 and the proposed AC-10.
- **One gap identified and not closed:** the register does not ask *whose* product is being
  assessed — the user's own, or a client's. Role questions exist, but the framing question does
  not, and it changes the whole opening of the wizard.

# WP7 — rule model, versioning and governance

**Done-when (WP-PLAN):** the rule schema in v4 §5.2 is confirmed or amended with reasons, and
the §8.2 Definition of Done is implementable as written.

**Result:** v4's engine contract is **confirmed**. Its rule field list is **amended** in eight
places, each traced to a failure the trial produced or would have produced. §8.2 is implementable
once five of its six items become mechanical checks; the sixth (understandable language) remains
a human judgement and is assigned to WP6.

Status: DRAFT, single author plus LLM. The trial tests the model, not the law.

## 1. Choice of representation

v3 named four sources of prior art and warned against adopting a heavy formal language before a
practical trial. The trial was run (§3), and its result is the recommendation.

| Option | What it offers | Why not adopted | What we take from it |
|---|---|---|---|
| Catala | Literate law-to-code linkage; default logic, which handles exceptions natively | Specialist toolchain and language for a team that has neither; browser output is not its main target | Exceptions as first-class, with explicit priority |
| LegalRuleML | Standard XML for norms, defeasibility, and the distinction between when a rule is in force and when it applies | Heavy; built for exchange between legal systems, which this project does not need | Two time dimensions per rule (§4.6) |
| OpenFisca | Python rules, date-stamped parameters, YAML tests per variable | Shaped around numeric computation over periods; our rules are classification | Dated validity on every rule; tests stored next to rules |
| OECD Rules as Code | Governance: authoritative source linkage, transparency, reuse | A framework, not a format | Every rule carries its source, version and hash into the output |

**Recommendation: declarative rule data (JSON, validated by JSON Schema) evaluated by a small,
pure engine.** The rules live in `packages/rules` as data, and the engine in `packages/engine` knows
the logic and nothing about the CRA. This is v4 §5.4's architecture, unchanged. It meets the
determinism requirement trivially, keeps legal content reviewable as text diffs, and lets the
same rule data drive the web app, a CLI and any later integration without separate legal logic.

The trial's evaluator (`docs/research/wp7-spike/evaluate.py`, Python) is a reference for the
semantics. The product engine should be TypeScript per v4. The trial's fixtures are written in
the shared rule format, so they can test both engines and show they agree.

## 2. Truth values and how they combine

v4 fixes four fact values. The trial needed a fifth value for *conditions*, kept apart from the
fact values: **OPEN**, meaning the law does not settle the question (WP1 `OPEN_QUESTION`). A
user cannot supply it, and asking more questions will not resolve it.

| | Meaning | Comes from |
|---|---|---|
| TRUE / FALSE | Established | A fact meeting its evidence requirement |
| UNKNOWN | Not established | Missing fact, or a fact below its evidence requirement (§4.3) |
| CONFLICTING | Evidence disagrees | Fact value; always raises a review flag |
| OPEN | The law is undetermined | A rule's value map, never a fact |

Combination, in order of precedence:

- **AND:** FALSE > CONFLICTING > OPEN > UNKNOWN > TRUE. One substantiated FALSE excludes, which is
  v4's "a category is excluded only when a decisive condition is substantiated FALSE".
- **OR:** TRUE > CONFLICTING > OPEN > UNKNOWN > FALSE. One TRUE limb is a match.

**UNKNOWN never becomes FALSE.** The only path to FALSE is an established fact.

## 3. The trial

Six categories and two conformity routes were encoded, each chosen to stress a different part of
the model:

| Rule | What it tests |
|---|---|
| III-I-03 password managers | Descriptive wording that must **not** become a condition (WP5 finding 1) |
| III-I-17 smart home security | Two alternative limbs; a condition with an OPEN value (`MP-14`) |
| III-I-14 → III-II-04 → IV-03 | Chained categories; numeric thresholds (AVA_VAN); class fallback |
| IV-02 smart meter gateways | Six-condition limb; second limb that can exclude but never include |
| Art. 12 route | Route depends on the class and on a date (AI Act Art. 113 as amended) |
| Art. 32(5a) route | Route introduced by another act (EHDS), dated, displacing the normal route |

**28 fixtures from the catalogue, all pass. Every condition quote verified verbatim against the
held B2 text** (`python3 docs/research/wp7-spike/evaluate.py --verify`).

## 4. What the trial changed

**4.1 Facts must be atomic; questions may group them.** The WP2 register bundles conditions into
one fact per category, such as `STORES_PASSWORDS` ("store passwords, *and* generate, share or
integrate") and `MANAGES_NETWORK_ELEMENTS` ("monitor *AND* control"). A "No" to a bundled
question cannot say which condition failed, though v4 requires the failing condition to be
recorded. Where the bundle's logic differs from the law's, it gives the wrong answer: both
examples above are WP5 findings. **Rules reference atomic facts. The UI may ask about several at
once, but each answer must be stored per fact.** Fact register changes needed:

| Current (WP2) | Change |
|---|---|
| `STORES_PASSWORDS` | → `STORES_PASSWORDS_CORE`; generation and sharing become hints for the question text |
| `MANAGES_NETWORK_ELEMENTS` | split into monitoring and configuration control (WP5 `MP-04`) |
| `MANAGES_BOOT` | drop "selecting boot options" as a requirement (WP5 `MP-07`) |
| `REMOTE_MANAGEMENT` (bool) | → `CONTROL_PATH` enum: network-remote / proximity only / none. The middle value maps to OPEN |
| `IS_INTEGRATED_CIRCUIT` (bool) | → `IC_TYPE` enum: III-I-13, III-I-14 and IV-03 depend on which kind of IC it is |
| `AVA_VAN_LEVEL` | an enum including NONE, not free text |
| `ENERGY_CARRIER` | include WATER explicitly, since it is what decides `A4-02` |
| — | add `ADVANCED_SECURITY_CORE`, `HIGH_RISK_AI_BASIS` (none / Annex III / Annex I §A / Annex I §B), `EHR_SYSTEM` |

**4.2 Conditions need a value map, not only true/false.** `CONTROL_PATH`, `METERED_COMMODITY` and
IV-02's second limb map fact values to TRUE, FALSE **or OPEN**. Without that, the open questions
WP1 and WP5 found have no place in the rules, and the author is forced to pick a side.

**4.3 Evidence requirements belong in the engine** (generalised in §10a: the gate applies to
whichever result is permissive for that condition). Each fact carries its evidence expectation
from WP2. A FALSE on a `MANUFACTURER_ONLY` fact that the user has not confirmed (for example an LLM
draft) is evaluated as UNKNOWN. In the trial, `GATE-01` is `RAT-01` with the core-function answer
drafted rather than confirmed: it correctly yields UNRESOLVED, not DEFAULT. This is how v4 §5.4's
"LLM output is a draft" becomes an enforced rule rather than advice.

**4.4 Classification has a floor, not just a status.** With 20 of 26 categories unencoded, every
non-critical result in the trial's real mode is UNRESOLVED, and that is correct. A Class I match
cannot be stated as Class I while a higher category is unexamined, because that would be the
permissive error AC-02 forbids. But "UNRESOLVED" alone throws away the fact that the class is *at
least* Class I. **Output adds `class_floor` and `blocking`** (the categories, with their values,
that prevent a definitive class). v4's illustrative output had `candidates` only.

**4.5 Uncertainty needs reasons by kind.** The trial separates `MISSING_FACTS` (ask a question),
`CONFLICTING_FACTS` (review flag) and `LAW_OPEN` (expert or legal advice; no question helps).
`getNextQuestions` must draw only on the first kind. v4 had one `review_flags` list.

**4.6 Rules have two time dimensions, and different rules key on different dates.** Art. 12 for
Annex I high-risk AI depends on when the product is placed on the market (AI Act Art. 113(c), as
amended). Art. 32(5a) depends on when it took effect (26.3.2027). The toy cross-reference
(`A3-05`/`A3-06`) depends on the assessment date. **Each rule states which date it keys on**
(`placed_on_market`, `assessment_date`) and its `effective_from`/`effective_to`. A single
`law_version` field cannot express this.

**4.7 Routes need precedence.** With the Art. 12 rule and the EHDS rule both present, the trial
first produced two conformity routes for one product. Art. 32(5a) *displaces* the normal route, so
route rules carry `displaces`. Where two special routes apply at once and neither displaces the
other, the result is OPEN with the reason "route conflict"; the engine does not pick one.

**4.8 Routes that depend on the class must wait for it.** Art. 12(3) turns on the class. With the
class UNRESOLVED, the trial first applied the Art. 43 route regardless, which is wrong. Fixed: if
the class floor already decides the route, it is stated (`AI-02`); otherwise the route is reported
as `DEPENDS_ON_CLASS(…)`.

**Two smaller findings.** Categories can reference other categories (III-II-04 requires
III-I-14), so the rule set is a dependency graph and the engine must evaluate in dependency order.
And a category's alternative limbs should be **named**: `RAT-01` fails III-I-17 at C1 in one limb
and C4 in the other, and "failing: C1, C4" is a poor explanation without the limb names.

**A hazard to keep out of the product.** The trial's test harness can treat unencoded categories
as excluded, which is how the six encoded categories were checked in isolation. That switch is
exactly the AC-03 failure. It must not exist in the product engine.

## 5. Rule schema: v4 §5.2 amended

v4 lists: `rule_id, law_ref, law_version, requirement, exceptions, priority, evidence requirements,
reviewer, reviewed_at, test_ids`.

| Field | Status | Reason |
|---|---|---|
| `rule_id`, `law_ref`, `test_ids` | kept | |
| `law_version` | **replaced** by `sources` (code, CELEX or consolidation id, sha256) | One version string cannot name several held texts; the hash is what AC-01 (amended) verifies against |
| `requirement` | **replaced** by `conditions` + `match` | Conditions with verbatim `quote`, fact, and test (`is`/`in`/`map`); `match` is a tree of named limbs (§4.1, §4.2, §4.8) |
| — | **added** `descriptive` | Quoted wording that is deliberately *not* a condition, with the reason (WP5 finding 1). Shows the omission was a decision |
| `exceptions`, `priority` | kept; extended with `displaces` for routes | §4.7 |
| `evidence requirements` | **moved** to the fact register | They belong to facts, not rules (§4.3) |
| — | **added** `effective_from`, `effective_to`, `date_basis` | §4.6 |
| — | **added** `status` (AUTHOR_VERIFIED / AUTHOR_INTERPRETATION) and `open_ref` per OPEN value | DR-04 status taxonomy; every OPEN points to its recorded question |
| `reviewer`, `reviewed_at` | **replaced** by `verified_by`, `verified_at`, `technical_reviewer` | DR-04: no legal reviewer. Verification is the mechanical quote check |
| — | **added** `coverage` | `operative-for-exclusion` for IV-02 (WP1); `not-covered` blocks DEFAULT |

The trial's `rules.json` is a working example of every field except `effective_to`.

## 6. §8.2 Definition of Done, made checkable

| # | §8.2 item (as amended by DR-04) | Check |
|---|---|---|
| 1 | Exact provision and source version | CI: every `quote` is found verbatim in the held source whose hash the rule cites (`evaluate.py --verify` does this today) |
| 2 | Conditions and exceptions explicit | Schema validation: no rule without `conditions`, `match` and, where wording was left out, `descriptive` |
| 3 | Positive, negative and minimal-pair tests | CI: every `test_id` exists in `case-expectations.json` and has a fixture, and the rule has at least one passing TRUE fixture and one FALSE fixture per required condition (the WP5 standard) |
| 4 | Technical reviewer | PR approval by someone other than the author (repository setting) |
| 5 | Understandable "why?" text | Human judgement. Every fact has `why_we_ask` (schema-checked); comprehension is WP6 |
| 6 | Changelog and version | CI: a rule diff without a changelog entry and a version bump fails |

## 7. Versioning and migration

- **Rule set version (semver).** MAJOR: any existing fixture's outcome changes. MINOR: rules or
  categories added without changing existing outcomes. PATCH: wording and explanations only. A
  change toward a *more* permissive outcome on any fixture is always MAJOR and always called out
  in the changelog, because that is the AC-02 direction.
- **Every export records** the rule set version, the source codes with hashes, and the facts with
  provenance. Exports are therefore reproducible: re-running an old export against its own tagged
  rule set gives the same result.
- **Re-assessment:** a saved export can be evaluated against the current rule set. Any difference
  is shown to the user as "re-assessment recommended" (AC-09), with the rules that caused it.

## 8. How legal change reaches CI (AC-09)

1. **Scheduled CI job** (weekly) runs `eurlex_watch.py check`. HIGH or MEDIUM opens an issue with
   the report attached.
2. **Rules map to the watchlist** through their `sources`: a change to an act marks every rule
   citing that act as `stale`. Today the watchlist maps acts to *cases*; it should also map to
   rule ids once rules exist.
3. **Stale rules stay enabled but their output carries "re-assessment recommended"** until the new
   text has been read and the quotes re-verified against it. Disabling them would turn every
   assessment UNRESOLVED on any amendment, including the many that touch nothing we use.
4. **Quote verification runs on every PR** against the held sources. When a new consolidated text
   is filed, the same check shows exactly which quotes no longer match.

## 9. Licence: a decision for you

v4 §8.3 leaves this open. The usual split for rules-as-code projects:

- **Code:** EUPL-1.2 (the EU's copyleft licence, compatible with GPL and others) or Apache-2.0
  (permissive, with a patent grant). Apache-2.0 maximises reuse. EUPL keeps derivatives open.
- **Rule data and case catalogue:** CC BY 4.0, so others can reuse them with attribution.
- **Legal texts:** not ours to license. EUR-Lex content may be reused under the Commission's reuse
  policy; we store them only as verification sources, with hashes.

Recommendation: **Apache-2.0 for code, CC BY 4.0 for rules and cases**, since the stated aim is
an informational public tool that others can check and build on. This is not a legal opinion on
licensing.

## 10. Timeline trial

Timeline rules (v4 §8.1 P0, a separate sub-engine) were trialled with
`docs/research/wp7-spike/timeline.py`: four obligations, the dated toy cross-reference, and 19
fixtures (all pass).

| Obligation | Keyed on | Source |
|---|---|---|
| Art. 14 reporting | assessment date only; **never the placing date** (Art. 69(3)) | B1c |
| Main requirements | placing date of the **units**, then the date and nature of any change | Art. 69(2), 3(30) |
| Certificates under other legislation | certificate expiry, capped at 11.6.2028 | Art. 69(1) |
| RED DA cybersecurity | placing date from 1.8.2025; after 11.12.2027 still applies, with the announced repeal as an open note | B16 |

What it established:

- **The placing date belongs to units, not types.** The register's `FIRST_PLACED_ON_MARKET` asked
  for the type's launch, which protects no later unit (`TYPE-02`, Blue Guide 2.2). Replaced by
  `UNITS_PLACED_ON_MARKET`, with a hint to assess shipped stock and future production separately.
- **One unknown date does not make everything unknown.** With the placing date unknown, Art. 14
  still applies, while the main requirements and RED DA are UNRESOLVED (`LIFE-06`, `RED-04`). This
  is why v4 forbids a single "CRA applies from" field.
- **Substantial modification is half decidable.** The purpose limb of Art. 3(30) is a fact the
  user can give (`LIFE-09`). The Annex I limb is not decidable here, so any change that may affect
  security yields UNRESOLVED with a review flag (`LIFE-05`, `LIFE-08`); only "purpose unchanged and
  no effect on security" yields TRANSITION (`LIFE-04`). And the change only counts from 11.12.2027
  (`LIFE-10`).
- **Dated cross-references resolve on the assessment date**, and the output cites whichever act
  the reference resolved to (`A3-05`/`A3-06`).

Five trial fixtures became catalogue cases (`LIFE-09`, `LIFE-10`, `LIFE-11`, `RED-03`, `RED-04`),
and three date facts were added to the register (`UNITS_PLACED_ON_MARKET`, `CHANGE_AT`,
`OTHER_LEGISLATION_CERTIFICATE`).

## 10a. Scope trial

Scope rules (Art. 2(1) applicability and the Art. 2(2)-(7) exclusions) were trialled with
`docs/research/wp7-spike/scope.py`: 35 fixtures, all pass. Scope = applicability AND NOT any
exclusion, using the same combinators as the categories.

What it established:

- **The evidence gate is about direction, not about FALSE.** For a category, the permissive
  answer is FALSE (category ruled out). For an exclusion it is TRUE (product taken out of the CRA).
  For applicability it is FALSE again. So §4.3 generalises: **each condition declares which result
  is permissive, and only that result needs the fact's required evidence.** A defence exclusion
  claimed without documents gives UNRESOLVED, not OUT (`EXC-14`); a "not on the EU market" answer
  drafted by an LLM gives UNRESOLVED, not OUT (`GATE-04`).
- **A screening question must be answered as a whole list.** The first run failed six fixtures:
  ticking "spare part" left every *other* exclusion UNKNOWN, so the scope could never resolve. The
  screen is one question over an OR-joined list ("which of these apply, if any?"), so every option
  left unticked is an answered "no". Each ticked option opens its own follow-up, because each
  exclusion has its own condition (certified, exclusively, identical specification, designed to
  pedal). This is the AND/OR rule of §4.1 seen from the other side.
- **One confirmed exclusion is enough.** OUT_OF_SCOPE holds even with another exclusion unknown
  (`GATE-03`), because AND lets one FALSE decide.
- **Two exclusions are qualification questions under other law**: whether MDR/IVDR applies to a
  product with an uncertified medical purpose (`EXC-03`), and whether Reg. 2019/2144 covers a given
  component (`EXC-04`). They map to OPEN with a reason, not to a guess either way.
- **Scope must work prospectively.** Most users assess before launch. `MARKET_STATUS` replaces the
  yes/no market question: PLANNED is in scope, stated as prospective (`SCP-09`); display at a trade
  fair (`SCP-08`) and own use (`OWN-01`) are not making available.
- **Capability is not intended purpose.** The register's `DATA_CONNECTION` asked whether the product
  *can* exchange data; Art. 2(1) asks whether its intended or foreseeable use *includes* a
  connection. Now two facts: an interface exists at all (if not, both connection tests are FALSE,
  `SCP-06`), and a connection is intended (if not, foreseeable use decides, `SCP-07`).
- **A gap found:** Art. 2(4), marine equipment, had no case. Added as `EXC-13`.

Not trialled, because they are not scope: Art. 4(3) testing versions (`TEST-01/02`), Art. 13(11)
archives (`ARCH-01`) and the steward role (`OSS-03`). They are obligations and roles, handled after scope.

## 11. Open after WP7

- ~~Apply the §4.1 fact register changes~~ — done, register v2.
- ~~JSON Schema for rules and output~~ — done: `packages/schemas/rule-set.schema.json` and
  `packages/schemas/assessment-output.schema.json`, tested by `wp7-spike/test_schemas.py` (trial outputs valid;
  nine deliberately broken documents rejected, including the AC-02/AC-03 violations).
- Encode the remaining 20 categories. The trial shows the format holds for the hardest shapes, so
  the rest should be routine, but each still needs its WP5 condition notes read first.
- ~~Timeline trial~~ — done, §10.
- ~~Scope trial~~ — done, §10a.
- Everything the trials need is now in the engine contract. What remains before Phase 1 is
  encoding the other 20 categories (reading each one's WP5 notes first), and the people-dependent
  work: WP3 interviews, WP4 runs on the online tools, WP6 comprehension tests and a review round.

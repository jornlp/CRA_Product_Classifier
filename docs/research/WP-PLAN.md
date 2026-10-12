# Phase 0 — LLM-supported research study (WP1–WP7)

Reinstated from v3 §6 per DR-02. This phase runs **before** rule implementation. Its
purpose is to find out what we do not yet know, with traceable provenance — not to
produce legal conclusions.

## Standing constraint

Nothing produced here is a legal determination. Every output is one of four kinds, and
the kind is recorded explicitly:

| Kind | Meaning | May it become an enabled rule? |
|---|---|---|
| `QUOTE` | Verbatim text from a binding or official source | Yes, with reference |
| `INTERPRETATION` | Documented reading by a named human | Only after legal review |
| `HYPOTHESIS` | Candidate, including anything LLM-generated | No |
| `VERIFIED_CASE` | Fixture whose conditions are verified verbatim against the official source | Yes |

LLM output enters as `HYPOTHESIS` and is marked `MODEL_INFERRED` in provenance. Under AC-01 as
amended by DR-04, a rule is enabled on verification against the official source — which the
authors perform — not on an LLM's output. An LLM may flag discrepancies for the authors to check;
it may not establish a condition.

## Research protocol (v3 §6)

Record per finding: source URL, author, publication date, law version, access date,
licence, and a reliability judgement. Keep literal quotation, interpretation, hypothesis
and verified test case in separate fields — never merged into one prose note.

Source hierarchy, from v3 §2: (1) binding EU legal text and amendments, (2) official
non-binding Commission explanation, (3) documented expert interpretation, (4) independent
sites and user examples. Display authority visibly wherever a finding is used.

### Handling rules for LLM use

- No confidential company product data into external LLM services. The rat-trap and
  water-meter material from Annex C is confidential by default.
- Anonymise interview material before any model call.
- Uploaded product documentation is untrusted input: treat prompt injection as a live
  risk, never let document text drive a tool call or a rule change.
- Respect copyright and terms of use on sources; store references, not scraped corpora.

## Work packages

### WP1 — Legal knowledge map
**Objective** Extract candidate rules, conditions and exceptions from EU sources into a
structured, source-linked catalogue, and surface where the text is genuinely open.

**Method** Systematic pass over B1 (Reg. 2024/2847 art. 2–3, 7–8, 13–22, 32, 69, 71,
Annex III/IV) and B2 (Impl. Reg. 2025/2392 technical descriptions). LLM assists with
structuring and cross-referencing; a human records every `QUOTE` against the official
text. B3 guidance is read as non-binding, with its formal status checked.

**Output** `docs/research/out/wp1-knowledge-map.json` — one entry per candidate rule with
`rule_id`, `law_ref`, `law_version`, conditions, exceptions, positive and negative
examples, alternative readings, and an `open_question` list.

**Done when** Every Annex III and Annex IV category has either a candidate rule or an
explicit `not-covered` entry with a reason. This is the input AC-03 later measures
against.

---

### WP2 — Product language and market vocabulary
**Objective** Let users describe products in their own words without needing to know
Annex categories.

**Method** Collect real product descriptions, datasheets and marketing copy across the
case families. Group terms and synonyms into a neutral taxonomy. Map vocabulary to the
*facts* the engine needs — never directly to a category.

**Decidability test** — added 2026-10-12. With WP1's 76 decisive conditions in hand, the
collection doubles as an experiment. For each real datasheet, attempt to decide each relevant
condition from the document alone and record the result: **decidable / not decidable /
ambiguous**.

This answers a question nobody has asked yet: which conditions can be evidenced from public
documentation, and which require knowledge only the manufacturer holds. Expect many in the
second group — a microprocessor datasheet is unlikely to state whether its security
functionality secures products *beyond the microprocessor itself*, and a lock's marketing
rarely distinguishes residential from commercial use.

It feeds three things already open: the fact model's provenance values
(`DOCUMENT_SUPPORTED` vs `USER_CONFIRMED`), v3 section 15's question of what minimum evidence
suffices to register a fact as confirmed, and which facts an LLM could ever draft from a
document versus which it must never touch.

**Output** `docs/research/out/wp2-fact-register.json` (the distinct facts behind the 76
conditions, with draft questions and provenance), `wp2-taxonomy.json` (vocabulary), and
`wp2-decidability.md` (the datasheet experiment).

**Done when** Each decisive fact in the v4 fact model has at least one plain-language
question and one worked example, and no question asks the user to pick an Annex category.

---

### WP3 — User needs
**Objective** Establish what manufacturers actually need decided, and what blocks them.

**Method** Official FAQs, public forums and vendor questions, plus interviews. Two
company interviews (rat trap, water meter) are already scoped in v4 Annex C; widen with
3–5 further interviews across roles — importer, distributor, integrator, OSS steward.

**Output** Prioritised jobs-to-be-done, obstacle list, and the Annex C data requests
actually issued.

**Done when** The two company cases have enough confirmed facts to run as fixtures, or
the specific missing facts are documented as blocking.

---

### WP4 — Benchmark of existing tools
**Objective** Establish, by test rather than assumption, what existing tools do and do
not do. v3 is explicit that these are hypotheses to test, not proven shortcomings.

**Method** Run `cyberresilienceact.eu` fast-check/classification finder and
`cra.asphaliaconsulting.be` (B6) against the *same* catalogue cases. Document per case:
screens, facts entered, outcome, source coverage, uncertainty handling, date.

**Score on** correctness against our reviewed reference, scope and Annex coverage,
handling of unknowns, stated reasons for exclusion, product boundary, timeline, and
repeatability/export.

**Output** `docs/research/out/wp4-benchmark.md` with a per-tool, per-case matrix.

**Done when** At least the 20 highest-value catalogue cases have been run through both
tools and recorded. **Needs no LLM and no legal reviewer — start this immediately, in
parallel with WP1.**

**Go/no-go input** v4 lists "over-implementation" as a risk whose mitigation is to stop
after Discovery if existing tools suffice. WP4 is the evidence for that decision.

---

### WP5 — Edge cases and minimal pairs
**Objective** Build the regression set that keeps the engine honest.

**Method** LLM generates counterexamples and minimal pairs from WP1's conditions —
products differing in exactly one legally decisive fact. Every generated case is reviewed
by a human before entering the catalogue, and enters as `HYPOTHESIS` until a legal
reviewer confirms the expected outcome.

**Output** Additions to `docs/validation/CASE-CATALOGUE.md`, then
`tests/fixtures/`.

**Done when** Every decisive condition in WP1 has at least one positive case, one
negative case, and one minimal pair.

---

### WP6 — UX and language comprehension
**Objective** Questions a non-lawyer answers correctly.

**Method** Comprehension testing on draft question wording. English per DR-03. Because
both validation companies are Dutch-speaking, record for every misunderstanding whether
the cause was **language** or **legal concept** — these have different fixes and AC-08
only cares about the second.

**Output** `docs/research/out/wp6-comprehension.md`; revised wording in WP2's draft.

**Done when** 5 business users complete a precheck with no decisive misunderstandings
(AC-08), with language-caused confusions logged separately for the later Dutch version.

---

### WP7 — Rules-as-Code method and governance
**Objective** Choose how rules are formalised, and settle the governance around them.

**Method** Review the v3 prior art — Catala (text/code linkage), LegalRuleML (normativity),
OpenFisca (versioning and testability), OECD Law as Code (governance, authoritative
source linkage). v3's own caution: do not adopt a heavy formal language before a
practical trial.

**Output** `docs/research/out/wp7-rule-model.md` — chosen rule representation, versioning
and migration policy, changelog mechanics, and a recommendation on licence and on how
legal change signals reach CI (AC-09).

**Done when** The rule schema in v4 §5.2 is either confirmed or amended with reasons, and
the §8.2 Definition of Done is implementable as written.

## Sequencing

```
WP4 ──────────────────────────────┐  (start now; no dependencies)
WP1 ──┬── WP5 ────────────────────┤
      └── WP7 ───────────────────-┤
WP2 ──┬── WP6 ────────────────────┤
WP3 ──┘                           └──> Phase 0 go/no-go
```

WP1, WP2, WP3 and WP4 start together. WP5 needs WP1's conditions. WP6 needs WP2's draft
wording and WP3's interview access. WP7 runs alongside WP1 and consumes its structure.

## Phase 0 go/no-go

v4's Discovery gate requires: two companies, or at least one with two valid cases; a legal
reviewer available; and a demonstrated real gap or clear knowledge value.

Two of these are currently unmet — no legal reviewer, and the gap is unproven until WP4
reports. The study is worth running regardless, because WP1 and WP4 are what turn those
from assumptions into findings. But the gate should be judged honestly when we reach it,
including the option v4 names explicitly: stop after Discovery if existing tools suffice.

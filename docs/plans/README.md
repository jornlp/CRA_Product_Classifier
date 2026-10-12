# Planning documents — what governs what

Two source reports exist. Neither is obsolete, and they disagree in places. This file
says which one wins where, and records decisions taken after v4 was written.

| Document | Date | Role |
|---|---|---|
| `CRA_Scope_Classifier_ontwikkelrapport_v3.pdf` | 8 Oct 2026 | Research rationale, market/tool analysis, LLM research study design, Rules-as-Code prior art, full disclaimer draft |
| `CRA_Scope_Classifier_implementatiespecificatie_v4.pdf` | 12 Oct 2026 | Implementation contract: outcome model, fact model, engine contract, acceptance criteria, Definition of Done, phasing |

## Precedence

**v4 governs** the outcome model (three independent axes: scope / classification /
timeline), the fact model, the engine contract, AC-01…09, the per-rule Definition of
Done, the monorepo layout, and the source register B1–B6.

**v3 governs** the LLM research study (WP1–WP7 and its research protocol), the
Rules-as-Code prior art, the disclaimer clause, and the breadth of the validation
catalogue.

Where they conflict on anything else, v4 wins — it is four days newer and written as a
hand-off.

## Decisions taken after v4

### DR-01 — Validation breadth returns to the v3 ambition
v4 narrowed validation to two company cases and an 11-ID fixture matrix. v3 asked for
50+ representative cases plus minimal pairs. **We follow v3.** See
`../validation/CASE-CATALOGUE.md`.

v4's IDs (`RAT-01…04`, `WTR-01…03`, `LIFE-01…03`, `SRC-01`, `OTHER-01`) are preserved
verbatim, because AC-05 names them. The catalogue extends around them; it does not
renumber them.

### DR-02 — The LLM research study runs first
v4 demoted the study to an optional Phase 4 and limited LLM use to summarising and
translating. **We reinstate v3 §6 as the opening phase.** See `../research/WP-PLAN.md`.

This does not loosen any legal guardrail. Study output is *candidate* material:
source-linked rule candidates, open interpretations, a taxonomy, a benchmark and a
regression set. Under AC-01 an unreviewed rule stays disabled, so nothing the study
produces can be enabled as a live rule without a named legal reviewer.

### DR-03 — MVP language is English
v4 §2.2 specified Dutch as the single reviewed MVP language, with English later. **This
is reversed: English is the MVP language.** Dutch becomes a later addition under P2
multilingual work.

Consequence to watch: AC-08 requires comprehension testing with 5 business users and no
decisive misunderstandings. Both validation companies are Dutch-speaking, so English
comprehension testing with them needs to be explicit about whether language or legal
concept caused any misunderstanding. WP6 covers this.

### DR-04 — Positioning: an informational tool, not a validated classifier

Decided 12 October 2026. The project will **not** pursue a legally validated classification
service. It will present what the official texts say, show what is undetermined, carry a visible
disclaimer, and tell users to obtain their own legal advice.

This is a positioning decision, and it requires amending two of v4's own gates, which were
written for a different product. Failing them silently would be worse than changing them.

**AC-01, amended.** v4: *every published rule has an official legal reference and a named
reviewer; unreviewed rules are disabled.* As written, with no legal reviewer, every rule is
permanently disabled and the tool cannot exist.

> **AC-01 (amended).** A rule may be enabled when every condition it applies is **verified
> verbatim against the official source**, the source is held with a recorded hash, and the rule
> carries its citation into the output. Verification is mechanical and repeatable; it does not
> require a lawyer.

This is a gate we can actually meet, and it is the one that catches real defects: both errors
found on 12 October — a "typically" read as mandatory in IV-03, and "directly" where the text
says "directly or indirectly" in III-I-10 — are exactly what it catches.

**§8.2 Definition of Done, amended.** Drop the requirement for a substantive legal reviewer to
sign each rule-PR. Keep everything else: exact provision and source version, explicit conditions
and exceptions, positive/negative/minimal-pair tests, a technical reviewer, understandable
language with a "why do we ask this?" explanation, and an updated changelog.

**AC-02 kept, and kept strictly.** Under this positioning it becomes the acceptance criterion
that matters most. A user told `UNRESOLVED` goes and asks someone. A user told `DEFAULT` who was
in fact in a higher class may self-assess and act on it. **Being confidently wrong in the
permissive direction is the only way this tool can harm anyone**, and no disclaimer changes that.

**Case status taxonomy.** `HYPOTHESIS` implied a legal review that is not coming. Replaced by:

| Status | Meaning |
|---|---|
| `AUTHOR_VERIFIED` | The conditions trace verbatim to official text we hold and have verified |
| `AUTHOR_INTERPRETATION` | Our reading goes beyond the literal text; reasonable, but a reading |
| `OPEN_QUESTION` | The law is genuinely undetermined; the engine must not resolve it |

No status asserts legal endorsement, and none is pending anything.

**AC-03, refined after review round 2.** The CRA imposes no procedural duty to record 26 negative
findings. The legal test is whether the product has the core functionality of a listed category.
So separate two requirements that AC-03 had conflated:

> **Substantive completeness** — the system must have a sound basis for ruling out every
> applicable Annex III and Annex IV category. This is non-negotiable.
>
> **Explanatory completeness** — the output need not reject every irrelevant category in writing.
> It must establish the core functionality and explain why the plausible candidates do not apply.

The engineering consequence is the important part: **if the candidate-selection mechanism can
silently omit a genuinely applicable category, `DEFAULT` is not justified.** Question pruning is
therefore load-bearing for legal safety, not only for UX, and every pruning decision needs a
recorded basis — which is what the earlier note about skipped questions was reaching for.

**Disclaimer.** Use v3 §13's fuller clause, not v4's shortened paragraph.

### DR-05 — A time-boxed tool, built so it can become a maintained one

Decided 12 October 2026, after WP4 Layer 1 (`docs/research/out/wp4-layer1-static-audit.md`).
Three options were weighed: (1) a maintained classification tool, (2) publishing the research only,
(3) a tool with a fixed end date. **Option 3, staying open to option 1** if someone takes on
maintenance.

The reason is maintenance. The law moved four times on the day this was decided (AI Act amended by
Reg. 2026/1744, the EHDS route into CRA Art. 32(5a), a corrigendum, a proposal amending the CRA), and
two of the seven open legal questions in the catalogue were created by an amendment that summer. A
classifier with dated rules and no owner goes wrong silently. A fixed end date makes that limit
visible instead of hidden.

**What option 3 means in practice:**

- **Focus on classification.** WP4 showed the existing tools handle scope reasonably and cover all 26
  categories. The gap is classification: no tool can say "unresolved", and the clearest lenient
  errors come from general or name-based questions instead of condition tests. Scope is kept
  because a class without a scope result means nothing, but it is not where effort goes.
- **Every result states the law it rests on.** Output carries `law_as_of` (the date of the latest
  source checked) and `valid_until`, shown to the user next to the result, not only in the export.
- **After `valid_until` the tool stops classifying.** It shows that it is archived and no longer
  maintained, and points to the research. A tool that keeps answering after its law has moved is the
  "project stops but tool keeps circulating" risk in v4 §9.
- **Until then, `eurlex_watch` runs on a schedule**, and a HIGH finding in the validity window is
  shown as a warning on affected results, even if nobody updates the rules.

**Staying open to option 1** costs nothing extra if the build keeps what is already designed for a
maintainer: rule versioning and changelog (WP7 §7), the watchlist and baseline, mechanical quote
verification, fixtures per rule. A future owner then extends `valid_until`; they do not rebuild.

**Open parameter: the end date.** Recommendation: **twelve months after release, and no later than
31 March 2028.** That covers the run-up to the CRA's application on 11.12.2027, when classification
questions peak, and stops before a cluster of changes the tool would not track: the end of Art. 69(1)
certificate validity (11.6.2028), the AI Act's Annex I high-risk date (2.8.2028), and the expected
harmonised standards and the RED delegated act's announced repeal.

**Unchanged:** DR-04 positioning, AC-02 as the release-blocking criterion, and WP3. Two short
interviews should still confirm that target users need classification help before Phase 1 starts.

## Items reinstated from v3 that v4 dropped

- **Rules-as-Code prior art** — Catala, LegalRuleML, OpenFisca, OECD Law as Code. The
  only prior art in either report for formalising law as code; feeds WP7 and §8.2.
- **Disclaimer clause** — v3 §13's full draft (liability limits, dependence on input
  accuracy, source versioning, and the carve-out that nothing excludes liability which
  cannot legally be excluded). Use this, not v4's shortened paragraph. Still needs
  review by a qualified lawyer before publication.
- **Validation cases** — pet camera, video doorbell, camera toothbrush, PLC/industrial
  gateway, HVAC/access control, standalone SaaS vs IoT backend, custom/OEM software,
  commercial vs non-commercial OSS.
- **ORC WG CRA Hub** as a source-discovery route (`https://cra.orcwg.org/faq/official/`,
  `https://cra.orcwg.org/official-guidance/`). Not authority — discovery only, below
  B1/B2 in the hierarchy.

## Open gates — not engineering

Both reports require a named legal reviewer for every rule change, and v4 Phase 3
additionally requires a named maintainer and a review cadence before public release.
Neither is resolved. v4 §8.3 lists the six questions that gate the start.

v3 is the blunter of the two on this: its §11 lists "using disclaimers as an alternative
to quality assurance" as a don't, and §13 states that "no legal advice" is a necessary
but insufficient measure.

Until a reviewer exists, the honest deliverable is research output and an unreviewed
prototype — not a classifier that emits category labels.

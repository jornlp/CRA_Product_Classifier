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

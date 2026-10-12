# WP2 — fact register, first pass

**49 distinct facts** behind WP1's 76 decisive conditions. All 26 categories have at
least one discriminating fact. Full register: `wp1`-sourced, in `wp2-fact-register.json`.

Every question is phrased for a non-lawyer, and none asks the user to pick an Annex category.
Each carries its source provision, so a reviewer can check question → condition → official text
in one pass — which is also how WP1's unreviewed conditions get checked.

## Shape of the register

| Group | Count |
|---|---|
| Scope, boundary, role, lifecycle (no single category) | 13 |
| Shared across several categories | 9 |
| Single-category discriminators | 27 |
| **Total** | **49** |

## The pruning problem

49 questions is still too many for a 2–5 minute precheck. The register is not a questionnaire —
it is the pool `getNextQuestions` draws from. Most categories die early:

| Fact | Categories it gates |
|---|---|
| `IS_INTEGRATED_CIRCUIT` | III-I-13, III-I-14, III-I-15, III-II-03, III-II-04 |
| `TAMPER_PROTECTION` | III-II-03, III-II-04, IV-01, IV-03 |
| `SECURITY_FUNCTION` | III-I-13, III-I-14, III-I-15 |
| `SECURES_BEYOND_ITSELF` | III-I-13, III-I-14, III-I-15 |
| `AVA_VAN_LEVEL` | III-II-03, III-II-04, IV-03 |
| `CRYPTO_CORE` | IV-01, IV-02, IV-03 |
| `PUBLIC_INTERNET` | III-I-16, III-I-18 |
| `RESIDENTIAL_SETTING` | III-I-16, III-I-17 |
| `CONTROLS_OTHER_DEVICES` | IV-02, III-I-16 |

A `NO` to `IS_INTEGRATED_CIRCUIT` removes five categories at once. A `NO` to both
`SECURITY_FUNCTION` and `CRYPTO_CORE` removes most of the remainder. The single-category facts
should only be asked once the core function makes that category plausible — which is what
makes the engine's question selection a legal-safety feature, not just a UX nicety: asking
fewer questions must never mean leaving a category unexamined, so every skipped question needs
a recorded exclusion reason.

## The finding that matters: 13 facts cannot come from a datasheet

13 of 49 facts are marked `MANUFACTURER_ONLY` — they require knowledge the
manufacturer holds, and no public document will settle them:

- `PRODUCT_BOUNDARY` — What exactly is placed on the market as one product? List what is sold together, and what is sold separately.
- `EU_MARKET_ACTIVITY` — Is the product made available on the EU market?
- `COMMERCIAL_ACTIVITY` — Is it supplied in the course of a commercial activity, whether paid or free of charge?
- `CONNECTION_FORESEEABLE` — If no connection is intended, could one reasonably be foreseen in use?
- `MARKET_ROLE` — Are you the manufacturer, importer, distributor, integrator, or open-source steward?
- `FIRST_PLACED_ON_MARKET` — When was this product first made available on the EU market?
- `CHANGE_AFTER_PLACING` — Has the product changed since it was placed on the market?
- `CHANGE_AFFECTS_ANNEX_I` — Does that change affect the product's compliance with the essential cybersecurity requirements in Annex I, Part I?
- `CHANGE_AFFECTS_PURPOSE` — Does that change modify the intended purpose for which the product was assessed?
- `CORE_VS_COMPONENT` — Does the product merely contain a component that performs one of these functions, or is that function what the product is for?
- `SECURES_BEYOND_ITSELF` — Does that security functionality aim to secure OTHER products, networks or services — beyond the chip itself?
- `PROTECTS_PHYSICAL_SECURITY` — Is the product's purpose to protect the physical security of people in that setting?
- `CRYPTO_CORE` — Is securely storing, processing or managing sensitive data, or performing cryptographic operations, what the product is FOR?

These are exactly the facts a document-reading step, human or LLM, must **never** be allowed to
infer. They require `USER_CONFIRMED` provenance. Several are also the most decisive facts in the
whole model: `CORE_VS_COMPONENT`, `SECURES_BEYOND_ITSELF`, `PROTECTS_PHYSICAL_SECURITY`,
`CRYPTO_CORE` and `CHANGE_AFFECTS_ANNEX_I` each decide an outcome on their own.

That is a useful result for the architecture: the hardest facts to answer are also the ones
least amenable to automation. It bounds what any LLM-assisted extraction could ever contribute,
and it tells us where the UX effort has to go — these questions must be the clearest in the
product, because nothing else can answer them.

## Next
1. Collect real datasheets per category and run the decidability test — the `DOCUMENT_LIKELY`
   marks above are predictions, and the experiment is what turns them into evidence.
2. Build the vocabulary map from the collected material: the words manufacturers actually use
   for each fact.
3. Order the questions by discriminating power, with a recorded exclusion reason for every
   category a skipped question would have tested.
4. Comprehension-test the wording in WP6.

## Status

DRAFT, unreviewed, authored in one pass by one person — the same caveat as WP1's conditions,
and the reason each question carries its provenance inline.
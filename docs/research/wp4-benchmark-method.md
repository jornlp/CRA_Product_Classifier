# WP4 — how to benchmark existing tools without a reviewed reference

## Two independent layers

The benchmark has two layers, and they have different prerequisites. Layer 1 needs no test
cases at all, which matters because our own case coverage across the Annex is currently thin
(see `wp1-audit.md`, catalogue coverage gap).

### Layer 1 — static audit of the tool's own category model

Compare what the tool *says the categories are* against the 26 verified descriptions in
`wp1-category-inventory.json`. No cases are executed. This is a text comparison, and it is the
cheapest high-value test available, because we hold every official description verified
sentence by sentence.

Three questions, directly answering "those and only those":

1. **Does it cover all 26?** 19 Class I, 4 Class II, 3 critical. A missing category means the
   tool cannot rule it out, which means any `DEFAULT` it emits rests on incomplete coverage —
   the exact failure AC-03 exists to prevent.
2. **Does it invent categories?** Anything beyond the 26 is not in Annex III or IV.
3. **Does it invent or drop conditions within a category?** This is where the real errors live.
   An "intended for industrial use" qualifier on Class II firewalls is an invented condition.
   Dropping "in a residential setting" from III-I-17, or "at least" from the AVA_VAN.4
   threshold in IV-03, are dropped conditions. Both are citable to the official text.

Layer 1 alone is a publishable finding set, and it is unaffected by gaps in our case catalogue.

### Layer 2 — behavioural testing with cases

Run the catalogue cases and record what the tool does. This is the layer that needs good case
coverage, and it is only as representative as the cases are. State its scope honestly: a run
of cases clustered on two categories tells you about those two categories.

## The honest constraint

"Correct" means "matches a legally authoritative answer". Under DR-04 this project does not
produce one, and neither do the tools being compared. **We therefore cannot score correctness**,
and claiming to would be exactly the overclaim this project exists to avoid — v3 §7 already warns
against assuming a tool falls short without documenting the test.

But correctness is not the only measurable thing, and three classes of finding are fully
defensible without a reviewer.

## What can be proven without a reference answer

### 1. Demonstrable factual error against verified text
Some answers are not interpretation. They are checkable against the official text we hold and
have verified sentence by sentence. A tool is simply wrong if it:

- applies an "intended for industrial use" qualifier to Annex III Class II firewalls — no such
  condition exists in the text
- treats separately-placed spare parts as in scope — Art. 2(6) excludes identical, same-spec
  replacements
- treats the aviation exclusion as scope-based — Art. 2(3) requires *certification* under
  Reg. 2018/1139
- gives the CRA a single application date — there are four relevant ones (11.06.2026,
  11.09.2026, 11.12.2027, and 11.06.2028 under Art. 69(1))
- states a category count other than 26, or omits categories from Annex III/IV
- resolves `III-I-18` without reference to Directive 2009/48/EC's under-14 play test

These are falsifiable claims, citable to a provision and a hash. No reviewer needed.

### 2. Logical inconsistency on minimal pairs
This is the strongest technique available to us. Feed a tool two cases that differ in exactly
one legally decisive fact. If the output does not change, **at least one of the two answers is
wrong** — even though we cannot say which.

The catalogue already has eleven such pairs, including:

- `RAT-01`/`RAT-02` — pest monitoring vs home security core function
- `LOCK-01`/`LOCK-02` — residential vs commercial context
- `BND-06`/`BND-07` — identical spare part vs improved specification
- `OSS-01`/`OSS-02` — non-commercial vs commercial activity
- `A3-05`/`A3-06` — same product, assessment date either side of a referenced instrument's repeal

Inconsistency is a correctness signal that needs no ground truth. It is also the finding most
likely to be accepted by the tool's authors, because it is self-evident.

### 3. Overclaim on provably unsettled law
We have established, from the four held sources, that the Annex IV category 2 second limb is
undetermined: the phrase occurs once in the entire corpus and no instrument describes it.

So if a tool returns a confident `CRITICAL` or `DEFAULT` for `A4-02` or `A4-06`, that is a
demonstrable overclaim — not because we know the right answer, but because we can show there
is no settled answer to know. Same for any case turning on an UNKNOWN decisive fact.

## What else to record, as observation rather than judgement

Objectively observable, no interpretation required:

| Property | Question |
|---|---|
| Determinism | Same inputs twice, same output? |
| Unknown handling | Can the user say "I don't know", or is a choice forced? |
| Question style | Does it ask for facts, or make the user pick an Annex category? |
| Reasons | Does the output cite provisions, or assert bare conclusions? |
| Exclusions | Does it say which categories were ruled out and why? |
| Coverage | Does it evaluate all 26 categories, or a subset? |
| Boundary | Does it ask what product is being placed on the market? |
| Timeline | Does it separate obligations, or give one "CRA from date"? |
| Versioning | Does it state a law version and a date? |
| Reproducibility | Can a result be exported and re-run later? |

## Per-case record

For each tool and each case: date, tool version if shown, the exact facts entered, every
screen, the output verbatim, and which of the three finding classes (if any) it falls into.
Screenshots, not paraphrase.

## Fairness rules

- Run the same cases against our own expectations too. If our hypothesis differs from both
  tools, the likeliest explanation is that **we** are wrong.
- A disagreement is a finding about where the law is hard, not a defect, unless it falls into
  one of the three classes above.
- Do not publish a correctness score. Publish observed behaviour, demonstrable errors with
  citations, and inconsistencies.
- Record the date and that these tools change; a finding is about a version, not a product.

## Why this is worth doing first

It needs no legal reviewer, no second assessor and no further downloads. It is the evidence for
v4's own off-ramp — stop after Discovery if existing tools suffice — and it will also tell us
which of our 81 cases are genuinely discriminating, which is WP5 input either way.

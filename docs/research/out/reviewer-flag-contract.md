# Reviewer-flag contract

Every `NEEDS_EXPERT_REVIEW` the engine emits must be explainable to the person who receives
it. A bare flag tells a manufacturer they have a problem without telling them what it is,
which is worse than useless — it is the "false uncertainty" counterpart to the false
certainty the project is built to avoid.

## Required fields

A reviewer flag is not raised unless all of these can be filled. If they cannot, the rule is
not ready to ship.

| Field | Content |
|---|---|
| `flag_id` | Stable identifier, cited in exports and tests |
| `trigger` | The fact pattern that raised it, in the user's own recorded terms |
| `uncertainty` | What specifically is unsettled — a legal question, a conflict in the evidence, or a missing fact |
| `why_undecidable` | Why the engine will not answer, in one or two sentences a non-lawyer can follow |
| `possible_outcomes` | The candidate results and what each would mean in practice |
| `stakes` | What actually differs between those outcomes for this user |
| `user_actions` | Concrete next steps, cheapest first, including any route that makes the question moot |
| `sources` | Exact provisions, with law and rule-set versions |
| `reviewed_by` / `reviewed_at` | Who approved this explanation, and when |

## Proposed AC-10

v4 defines AC-01 to AC-09. This adds one:

> **AC-10** — Every reviewer flag the engine can emit has a complete explanation meeting the
> contract above, and that explanation is understood by test users without a legal background.
> A flag that cannot be explained is a rule that is not finished.

This is testable in WP6 alongside AC-08's comprehension testing, with the same method: ask
users what they would do next, and count the ones who cannot say.

## Worked instance — `FLAG-IV02-SECOND-LIMB`

The user-facing text below is the deliverable, not a summary of one. Written for a
manufacturer, in English per DR-03.

---

**Why this needs expert review**

Your product may fall into a category of "critical products" under the Cyber Resilience Act
whose wording is unsettled.

Annex IV category 2 covers *"smart meter gateways … and other devices for advanced security
purposes, including for secure cryptoprocessing"*. The Commission's implementing regulation
explains what a smart meter gateway is. It does not explain what *"other devices for advanced
security purposes"* means, and that phrase appears nowhere else in the Regulation, the
implementing regulation, the Commission's guidance or the official FAQ.

Two readings are possible:

- the phrase adds a **separate** category, so any product whose core function is advanced
  security or secure cryptoprocessing is a critical product; or
- the phrase only **extends the smart meter gateway** category, and your product is outside it.

You have reached this question because you told us *{trigger}*.

**What turns on it.** Critical products follow the strictest conformity assessment route
(Art. 32(3)) and may be required to hold a European cybersecurity certificate (Art. 8(1)).
The alternative is most likely the default class, where you assess conformity yourself. Both
outcomes mean the CRA applies to your product — the difference is how conformity must be
demonstrated.

**What you can do, cheapest first**

1. **Check whether another category already covers you, which makes this question moot.**
   Annex IV category 1 covers hardware devices with security boxes, including hardware
   security modules. Category 3 covers secure elements and smartcards, including TPMs. Most
   dedicated cryptographic hardware falls into one of these. If yours does, you are a critical
   product on that basis and this open question no longer affects you.
2. Obtain a legal assessment of your specific product.
3. Ask your national market surveillance authority in writing.

**Why we do not answer.** The law does not settle this, and we do not guess on unsettled law.
Giving you a confident answer here would be worth less than telling you where the uncertainty
is.

*Sources: Regulation (EU) 2024/2847 Annex IV category 2, Art. 8(1), Art. 32(3); Commission
Implementing Regulation (EU) 2025/2392 Annex II item 2. Law version {law_version}, rule set
{rule_set_version}.*

---

## Note on step 1

Step 1 is the part that makes this flag useful rather than merely honest. For most products
that reach this question, the answer is already determined by categories 1 or 3, and the open
question never has to be resolved. That is worth saying first, not last.

The same structure should be looked for in every future flag: **is there a route that makes
the uncertainty irrelevant for this user?** If there is, it belongs at the top of the
explanation.

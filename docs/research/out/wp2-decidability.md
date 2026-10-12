# WP2 — decidability of the decisive facts

Consolidates tranches 1–3. The question: for each decisive fact, can it be established from
documents a manufacturer already has, or must the manufacturer answer from internal knowledge?

This matters for three things already open: the provenance values in the fact model, v3 §15's
question of what minimum evidence registers a fact as confirmed, and the hard limit on what any
document-reading step — human or LLM — could ever contribute.

## The finding

> **Documents state what a product IS and HAS. They do not state what it is FOR.**

Every decisive fact that asks about **features** is document-decidable. Every fact that asks
about **purpose, context, boundary or role** is not — and those are the facts the CRA actually
turns on, because Art. 7(1)/8(1) make *core functionality* the test.

The split is by **fact type**, not by product class. Tranche 1 thought it was hardware versus
software; tranche 3 showed that software is decidable wherever the category description shares
vocabulary with the market, and undecidable at exactly the boundaries where it does not.

## The table

| Fact type | Example | Decidable from documents? |
|---|---|---|
| Interfaces, protocols, ports | "two RJ45 ports, EtherNet/IP conformance" | Yes |
| Security features present | "TrustZone, secure boot with ECDSA P-384" | Yes |
| Certification held | "EAL4+ AVA_VAN.5", "BSI-CC-PP-0073", "PSA Certified" | Yes, and independently verifiable |
| Connectivity and remote control | "control from anywhere via the app" | Yes |
| Named product-class membership where market vocabulary matches the description | "SIEM with correlation engine" | Usually |
| Named product-class membership at a boundary | "SIEM versus SOAR" | **No** |
| Who the security serves | "beyond the microcontroller itself" | **No** |
| Setting and context | "residential" | **No, and sometimes contradicted in the same sentence** |
| Core functionality | "what this product is for" | **No** |
| Product boundary | "what is placed on the market as one product" | **No** |
| Economic role | "who markets it under whose name" | **No** |
| Lifecycle facts | "when it was first placed on the market" | **No** |

## Consequences

**1. 13 of 49 facts are `MANUFACTURER_ONLY`** and must carry `USER_CONFIRMED` provenance. They
include the most decisive facts in the model. No document-reading step may infer them, and that
is a hard architectural limit on LLM assistance, not a policy preference.

**2. Certification markers are the one real accelerator.** Six facts now carry a
`certification_proxy`. They are documentary, independently registered, and easy for a
manufacturer to answer. Used **positive only**: holding the certificate evidences the condition;
not holding it proves nothing, because certification is not a precondition of the category
applying. Inferring exclusion from absence would be a false negative of the AC-02 kind.

Record the **scheme** as well as the level: newer evaluations rest on protection-profile
conformance rather than EAL numbers, and mutual recognition is capped below the levels our
conditions cite.

**3. `CONFLICTING` evidence has a predictable home.** It arises where documents describe context
and purpose incidentally — the smart lock sold for "residential and Airbnb" is the pattern.
Expect conflicts in consumer categories and at product-class boundaries, not in hardware specs.

**4. Open-source documentation is the most verifiable evidence class and the least clearly
owned.** The source is public and the docs are precise; who must answer is the open question.

## What this means for the UX

The questions that carry the most weight are the ones nothing can answer for the user. They must
be the clearest text in the product, with worked examples and both a positive and a negative
illustration — because a user who misreads `CORE_VS_COMPONENT` or `SECURES_BEYOND_ITSELF` gets a
wrong answer with no safety net anywhere downstream.

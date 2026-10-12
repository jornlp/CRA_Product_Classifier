# WP2 collection — tranche 1: critical and Class II categories

First pass of the datasheet collection and decidability test. Deliberately weighted to
**Annex IV critical products and Annex III Class II**, because the tool must address every
category in the Annexes, not only the most commonly encountered shapes.

Sources: public product pages, datasheets and certification registries, 2026-10-12. No company
or product is recorded as a case; what is recorded is what the *documents* make decidable.

## The headline result: hardware is decidable, software is not

| | Hardware categories (IV-01/02/03, III-II-01/02/03/04, III-I-13/14/15) | Software categories (III-I-02/03/04/06/07/09/11) |
|---|---|---|
| Document type | Engineering datasheets with precise specifications | Marketing pages and vendor whitepapers |
| Audience | Engineers | Buyers |
| Decisive conditions | Usually stated explicitly | Usually implied, framed as claims |
| Independent verification | Certification registries exist | None |
| Expected evidence problem | Few | Self-assertion, and vendor-specific definitions |

One vendor's own zero-knowledge whitepaper concedes that "security experts will differ in the
interpretation" of the term it is built on. That is the software pattern in miniature: the
words in the document are marketing terms, not technical predicates, and two vendors use them
differently.

**Consequence for the fact model.** `CONFLICTING` evidence will arise far more often in
software categories than hardware ones, and `DOCUMENT_SUPPORTED` provenance is worth much less
there. The engine should not treat a software vendor's page as equivalent evidence to a
datasheet.

## The finding worth building on: certification markers as proxy evidence

Several decisive conditions map onto certification schemes that already exist, are documented,
and are independently registered. A manufacturer can answer these from a certificate number
rather than from legal reasoning.

| Condition | Existing marker | Where it is verifiable |
|---|---|---|
| `AVA_VAN_LEVEL` (III-II-03/04 need 2 or 3; IV-03 needs **at least** 4) | Common Criteria EAL augmented with AVA_VAN.n | Common Criteria Portal; national schemes (BSI, ANSSI); observed in the wild at AVA_VAN.4 and .5 on TPM products |
| Smart meter gateway per IV-02's gateway limb | **BSI-CC-PP-0073** protection profile; TR-03109 conformity; national type approval | BSI certificate database, certificates naming product and version with validity dates |
| `TAMPER_PROTECTION` and physical envelope (IV-01) | FIPS 140-2/140-3 level, especially physical security level; PCI PTS HSM | NIST CMVP; PCI listings |
| Type 1 hypervisor (III-II-01) | Vendors state "Type 1" explicitly; safety certifications (ISO 26262 ASIL, IEC 61508 SIL, DO-178C) corroborate the architecture | Vendor certificates |

This is a genuine design opportunity. Asking *"do you hold a certificate under protection
profile BSI-CC-PP-0073?"* is far easier for a manufacturer to answer, and far better evidenced,
than *"does your product control communication between smart metering system components and
authorised third parties?"*

**With one firm caveat.** A certificate is **evidence for a condition**, never the legal test
itself. Holding BSI-CC-PP-0073 strongly indicates the gateway limb is met; not holding it
proves nothing, since certification is not mandatory for the category to apply. The engine must
use these as accelerators on the positive side only, and must never infer exclusion from their
absence. That asymmetry needs to be explicit in the rule, or it becomes a false-negative
generator of exactly the AC-02 kind.

## Per-category notes

**IV-01 Hardware Devices with Security Boxes.** Tamper evidence, resistance and response are
standard datasheet content, often with FIPS physical security levels up to 4. "Multiple
discrete components" is rarely stated as such but is usually inferable from the architecture
description. Payment HSMs and payment terminals are the common shapes; the description also
names tachographs.

**IV-02 Smart meter gateways.** The most decidable category encountered. A German regulatory
regime exists specifically for this product with its own protection profile, technical
directive and certification register. Certified products are identifiable by name and version.
Note this is also evidence for the earlier argument that the second limb is not about
gateways: nothing in this material describes gateways as cryptoprocessors.

**IV-03 Smartcards and secure elements.** AVA_VAN levels are published routinely, and products
sit at both .4 and .5. The "at least AVA_VAN.4" threshold is therefore directly checkable —
and a product at .5 satisfies it, which is why the word "least" mattered.

**III-II-01 Hypervisors and container runtimes.** Vendors state Type 1 or Type 2 plainly.
Container runtimes are documented in open-source project docs rather than datasheets, which is
a different evidence class again.

**III-II-02 Firewalls, IDS, IPS.** Highly decidable: datasheets state IPS/IDS, deep packet
inspection, monitor versus protect modes. Products exist in both industrial and consumer form,
which independently confirms there is no industrial-use condition — the error found in the
source reports would have been caught here too.

**III-I-03 Password managers.** Features are decidable from product pages; architecture claims
are not independently verifiable. Illustrates the software pattern above.

## What this changes in the fact register

1. Add a `certification_proxy` field to facts that have one, with the positive-only rule
   recorded alongside it.
2. Split `evidence_expectation` by product class: the same fact can be `DOCUMENT_LIKELY` for
   hardware and `MANUFACTURER_ONLY` for software.
3. Treat vendor marketing pages as a weaker evidence class than datasheets and certificates.

## Next tranches

2. Annex III Class I hardware: III-I-10, III-I-12, III-I-13/14/15 — expect high decidability.
3. Annex III Class I software: III-I-01/02/04/05/06/07/08/09/11 — expect the software pattern.
4. Consumer and smart-home: III-I-16/17/18/19 — expect marketing-led documents, and the
   residential-versus-commercial distinction to be poorly stated, which is where `LOCK-02` and
   `RAT-04` come from.

# WP2 collection — tranche 3: Class I software

Third pass, covering Annex III Class I software categories. Public product pages, vendor
datasheets, open-source project documentation and certification registries, 2026-10-12.

## Tranche 1's prediction was too pessimistic

Tranche 1 predicted that software would be broadly undecidable because its documents are
marketing. That is only half right, and the refinement matters:

> **For software, decidability depends on whether the category description happens to use the
> same vocabulary as the market.**

Where the CRA's description and the industry's marketing language coincide, software is as
decidable as hardware. Where they diverge, no amount of documentation helps.

### Where they coincide — SIEM (III-I-07)

The description requires collecting data from multiple sources, analysing and correlating it,
and presenting it as actionable security information. SIEM datasheets state exactly this, in
these words: correlation engines by type (rule, statistical, historical, heuristic, behaviour,
risk-based), counts of supported log sources, prebuilt correlation rule libraries, alert and
case management. The condition reads like a product datasheet because the category was named
after an existing product class.

### Where they diverge — SIEM versus SOAR

The FAQ's own example says SOAR is generally **not** SIEM, because its core functionality
differs even though it can perform SIEM functions. But SOAR datasheets also advertise
correlation and multi-source collection. The documents cannot separate them; only the question
"what is this product for" can.

This is the software form of tranche 2's finding: features are stated, purpose is not.

## A third evidence class: open-source projects

Boot managers (III-I-08) are dominated by open-source projects whose documentation is far more
precise than any commercial datasheet. GRUB's manual documents the secure-boot chain, how the
core image is signed, how keys are enrolled in firmware databases, and that module loading was
deliberately restricted in later versions to prevent sideloading.

So the evidence hierarchy is not hardware-good, software-bad:

| Evidence class | Precision | Independently checkable | Who answers for it |
|---|---|---|---|
| Hardware datasheet + certificate | High | Yes, via registries | Manufacturer |
| **Open-source documentation + source** | **High** | **Yes, the source is public** | **Steward or integrator — possibly nobody** |
| Commercial software product page | Medium for features, low for architecture | No | Vendor, self-asserted |

Open source is the most *verifiable* class and the most *ambiguous* as to who must answer. That
is a governance problem, not an evidence problem, and it lands squarely on the `OSS-*` cases and
Art. 3(14)'s open-source software steward.

## Certification proxies for software

They exist, and are worth adding:

- **Operating systems (III-I-11)** — NIAP General Purpose Operating System Protection Profile,
  BSI Operating System Protection Profile. Major operating systems carry them.
- **Note on EAL.** Newer evaluations rely on exact protection-profile conformance rather than an
  EAL number, and mutual recognition under the CCRA is capped well below the levels our
  conditions cite. So an AVA_VAN claim at level 4 or 5 may rest on a national scheme rather than
  mutual recognition. The rule must record *which scheme* issued the certificate, not only the
  level.

That last point is a real refinement to the `AVA_VAN_LEVEL` fact: the level alone is not the
whole answer.

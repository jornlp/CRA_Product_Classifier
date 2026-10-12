# WP1 — findings from the official texts

Date: 2026-10-12. Supersedes the mirror-based findings in `wp1-findings.md`, which were
`QUOTE_UNVERIFIED`. Everything here is checked against the authentic OJ PDFs in
`docs/legal/sources/`, with sha256 recorded in `CHECKSUMS.txt`.

## Sources now held

| Code | Document | Pages | Status |
|---|---|---|---|
| B1 | Reg. (EU) 2024/2847 (CRA), OJ L 20.11.2024 | 81 | Authentic OJ PDF |
| B2 | Impl. Reg. (EU) 2025/2392, OJ L 1.12.2025 | 11 | Authentic OJ PDF |
| B3 | **C(2026) 5252 final, 27.7.2026** — Commission guidance on the application of the CRA | 84 | Annex to the approval act, via ORC WG mirror |
| B7 | Official CRA FAQ (ORC WG mirror, created 2.12.2025) | 66 | Mirror; also FAQ v12/v14 in Markdown |

B3 is the real guidance document, not the news page we had. Note its formal status: the PDF
is the **annex to a Communication approving the content of a draft Communication**. The
published Communication may differ. v4 §3 already flagged that status needs checking —
it still does.

## 1. The water question is unanswerable from official sources

Searched B1, B2, B3 and the FAQ. **"Water" appears zero times in the guidance**, and the
FAQ has no hit for "water", "smart meter" or "cryptoprocessing".

Combined with what B2 does say, the position is now fully mapped:

- Annex IV cat. 2's technical description covers **only** smart meter gateways, anchored
  on Art. 2(23) of Directive (EU) 2019/944 (electricity), expressly extended to "other
  sources of energy such as **gas or heat**".
- The category title's second limb — "other devices for advanced security purposes,
  including for secure cryptoprocessing" — has **no technical description at all** in B2
  Annex II. Confirmed against the official text.
- No official source addresses water metering.

**This is a result, not a dead end.** The WATER case cannot be resolved by more research.
It needs either a legal reviewer's interpretation or a question to the Commission. Three
further retrieval passes would add nothing — worth knowing before anyone spends a week on it.

## 2. The FAQ confirms the project's core thesis, with usable examples

B7 §3.4 states both directions, and the second one is what this tool exists to enforce:

> a product that has the ability to perform the function(s) of an important or critical
> product category but whose core functionality itself is different from that of such
> product category is not to be considered to have that core functionality.

Worked examples given: **SOAR software is not a SIEM**, and **a smartphone is not an
operating system or a password manager**, despite integrating both.

This is the strongest available support for "camera ≠ Class I". The rat-trap argument is
structurally identical to the smartphone one, and now has official — if non-binding —
backing. It belongs in the "why do we ask this?" text verbatim.

## 3. Art. 2 corrected two of our assumptions

The exclusions (verified, not remembered):

| Provision | Exclusion | Note |
|---|---|---|
| 2(2)(a)(b)(c) | MDR 2017/745, IVDR 2017/746, Reg. 2019/2144 | where those acts **apply** |
| 2(3) | Reg. 2018/1139 (aviation) | only where **certified in accordance with** it — scope alone is not enough |
| 2(4) | Dir. 2014/90/EU marine equipment | |
| 2(5) | sectoral rules achieving equal/higher protection | only **via a delegated act**; absence of an act is not an exclusion |
| 2(6) | spare parts replacing identical components, same specifications | a real exclusion |
| 2(7) | exclusively national security/defence, or designed to process classified information | |

Two corrections to our catalogue, both applied:

- `BND-06` treated separately-placed spare parts as simply needing their own assessment.
  Art. 2(6) **excludes** them when identical and same-spec. Split into `BND-06`/`BND-07`.
- The aviation exclusion is narrower than "falls within scope". Added `EXC-07`.
- Art. 2(5)'s delegated-act mechanism was not modelled at all. Added `EXC-08`.

Art. 2(1) also gives the scope test verbatim: "the intended purpose or reasonably
foreseeable use of which includes a direct or indirect logical or physical data connection
to a device or network." Art. 3 defines logical, physical and indirect connection
separately, and 'product with digital elements' expressly includes **remote data processing
solutions** and **components placed on the market separately**. Our `SCP-*` and `BND-*`
families are grounded.

## 4. We had an error about Class II firewalls

Both v3 and v4 assumed Annex III Class II firewalls are "intended for industrial use". The
official B2 III-II-02 description contains **no industrial-use condition**. A consumer
firewall product appears to fall in Class II on the text.

`A3-01` rewritten. This is exactly the kind of inherited assumption the research phase was
meant to catch.

## 5. The timeline has more dates than the plan models

v4's timeline sub-engine covers two dates. B1 gives at least four:

| Date | Provision | What |
|---|---|---|
| 11 June 2026 | Art. 71(2) | Chapter IV (Art. 35–51) applies — notified bodies |
| 11 September 2026 | Art. 71(2) | Article 14 reporting applies |
| **11 December 2027** | Art. 71(2) | the Regulation applies |
| **11 June 2028** | Art. 69(1) | EU type-examination certificates under other harmonisation legislation remain valid until this date, unless they expire earlier or that legislation says otherwise |

Art. 69(2): products placed before 11 Dec 2027 are subject to the requirements only if,
from that date, they undergo a substantial modification. Art. 69(3): Article 14
nevertheless applies to **all** in-scope products placed before that date — v4's `LIFE-01`
expectation is confirmed.

Added `LIFE-07` for the certificate date.

## 6. Category inventory complete

All **26** technical descriptions transcribed into `wp1-category-inventory.json`
(19 Class I + 4 Class II + 3 critical). The "28 categories" figure in third-party
commentary is **wrong**.

Two entries (`III-I-15`, `IV-03`) carry partial transcriptions where the two-column PDF
layout truncated passages — flagged in their notes, to be re-transcribed before rules are
written. Category **titles** still need verifying against B1's own Annexes; they were taken
from B2's category column.

Incidental finds worth keeping: III-I-02 expressly names "browsers with AI agent
integration"; III-I-18 contains a rare explicit negative condition (proximity sensing is
not location tracking); III-I-19 defines children as under 14; III-II-03/04 cross-reference
Class I points 13/14 and add an AVA_VAN threshold, so the rule engine needs
**cross-category references**.

## What is now blocked on a human, not on retrieval

1. The IV-02 second limb and the water question — legal interpretation.
2. Confirmation of B3's formal status as published.
3. Sign-off on expected outcomes for all 70 catalogue cases.

Retrieval for scope and classification is essentially done.

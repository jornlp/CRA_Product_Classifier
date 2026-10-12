# WP1 — currency of the law, and what `substantial modification` actually requires

Date: 2026-10-12.

## 1. Our copy of the CRA is not current

The audit flagged this as unchecked. It is now checked, and the answer is that **B1 as held
is the original OJ text of 20.11.2024 and has since been amended and corrected.**

| Change | Effect | Confidence |
|---|---|---|
| **Regulation (EU) 2025/327** (European Health Data Space), Art. 104 | Amends the CRA. Reported to insert **Art. 32(5a)** so EHR systems take conformity assessment from the EHDS Regulation, and to extend **Art. 13(4)** and **Art. 31(3)** | Amendment confirmed from the EHDS title; the specific provisions are secondary reporting, unverified |
| Corrigendum, 5.12.2024 | Title | Secondary |
| Corrigendum, 2.7.2025 | Art. 64(10) — deviation now refers to paragraphs 2 to 9 rather than 3 to 9 | Secondary |
| Corrigendum, 17.10.2025 | Art. 67 | Secondary, unverified |
| **Delegated Regulation (EU) 2026/881**, 20.4.2026 | Deferral of dissemination of notifications — touches the Art. 16 reporting area | Secondary |

**Two of the amended articles, 13 and 32, are in our extraction.** Art. 32 matters directly:
classification determines the conformity assessment route, and that is the one downstream
consequence the tool is meant to show.

No evidence was found of any delegated act amending Annex III or Annex IV, or of an
Art. 8(1) act requiring a European cybersecurity certificate. That is a negative finding
from secondary sources, not a verified absence.

### What is needed

The **consolidated version** of 2024/2847, and the three corrigenda. EUR-Lex cannot be
fetched from here — it answers automated requests with HTTP 202 and an empty body, with or
without a browser user agent — so this needs the same manual download as B1 and B2:

- Consolidated CRA: CELEX `02024R2847`, latest consolidation
- Regulation (EU) 2025/327, Art. 104
- The three corrigenda

Until then `wp1-provisions.json` carries `law_version: "original as published"` and a
`currency_warning`. Articles 13 and 32 in that file should be treated as **superseded,
pending verification**. Articles 2, 3, 7, 8, 69 and 71 have no reported amendments, but
"no reported amendment" is weaker than "checked against the consolidated text".

This is the AC-09 problem arriving early: the law moved under us within two years, and we
only noticed because someone asked.

## 2. `substantial modification` cannot be fully decided by the MVP

Art. 3(30), verbatim:

> 'substantial modification' means a change to the product with digital elements following
> its placing on the market, which affects the compliance of the product with digital
> elements with the essential cybersecurity requirements set out in **Part I of Annex I**
> or which results in a **modification to the intended purpose** for which the product with
> digital elements has been assessed

Two alternative limbs, and they have very different implications for us:

| Limb | Can the MVP decide it? |
|---|---|
| (a) affects compliance with the essential requirements in **Part I of Annex I** | **No.** v4 §2.3 puts Annex I expressly out of MVP scope — "no Annex I security implementation checklist" |
| (b) results in a **modification to the intended purpose** for which the product was assessed | **Yes.** Intended purpose is already a fact the engine collects |

This is an architectural tension the plan did not anticipate. Art. 69(2) makes the entire
transitional regime turn on substantial modification — products placed before 11 December
2027 are caught **only if** they undergo one from that date. So the `LIFE-*` family depends
on a definition whose first limb requires exactly the Annex I analysis the MVP excludes.

**It is not a blocker, but it must be explicit.** The engine should:

1. Decide limb (b) from intended-purpose facts it already has.
2. For limb (a), never answer. Ask the user whether the change affects compliance with the
   essential requirements, record the answer with its provenance, and where it is UNKNOWN,
   return `UNRESOLVED` with a reviewer flag rather than inferring "not substantial".
3. Never report "no substantial modification" on the strength of limb (b) alone — that is a
   false negative of exactly the AC-02 kind, and it would wrongly tell a manufacturer that
   the transitional exemption still protects them.

Point 3 is the one to test hardest. The intuitive implementation — check intended purpose,
find no change, conclude not substantial — is wrong, and wrong in the dangerous direction.

Added `LIFE-08` to the catalogue for limb (a).

## 3. Smaller grounding results

- **`placing on the market`** (3(21)) is the *first* making available on the Union market.
- **`making available on the market`** (3(22)) requires supply "in the course of a commercial
  activity, whether in return for payment or free of charge". The commercial-activity
  condition therefore sits inside the definition chain rather than being a separate scope
  test — which grounds the `OSS-01`/`OSS-02` pair and the commercial-context questions in
  the `SCP-*` family.

# Legal source manifest

Automated fetching of EUR-Lex failed on 2026-10-12 (empty response bodies on the ELI,
CELEX HTML and CELEX PDF routes). These documents must be obtained manually, or via the
EUR-Lex SPARQL/REST API or the Publications Office bulk data service.

Until a document is here with a recorded hash, any rule citing it stays disabled (AC-01).

## How to record each one

Save the **OJ PDF** (authentic version) into this directory, then:

```sh
shasum -a 256 <file> >> CHECKSUMS.txt
```

Fill in the table: file name, retrieval date, OJ reference, and whether it is the
original or a consolidated version. For B1 and the referenced instruments, **check for a
consolidated version first** — CELEX ids beginning `0` are consolidated (e.g. `02024R2847`).
A rule must cite the version actually used.

## P0 — OBTAINED 2026-10-12. Hashes in CHECKSUMS.txt.

**Currency resolved.** `B1c_reg-2024-2847_CRA_consolidated-000.003_20241120.pdf` is the
EUR-Lex consolidated text incorporating all three corrigenda (5.12.2024, 2.7.2025,
17.10.2025). A mechanical diff of the ten extracted articles against the original OJ text
found **no substantive differences** — the corrigenda touch the title, Art. 64(10) and
Art. 67, none of which we rely on. `wp1-provisions.json` is now extracted from the
consolidated text.

Still pending, not yet in any consolidation: **Regulation (EU) 2025/327 (EHDS) Art. 104**,
reported to insert CRA Art. 32(5a) and extend Art. 13(4) and 31(3). The EHDS Regulation
applies from 26.3.2027, so this is pending rather than in force. Re-check before any
assessment dated on or after that date.

| Code | Document | Need from it | Link |
|---|---|---|---|
| B1 | Regulation (EU) 2024/2847 (CRA) | Art. 2–3 (scope, definitions, exclusions), 7–8 (important/critical), 13, 17–22 (operators), 32 (conformity assessment), 69 (transition), 71 (application dates); **Annex III and IV verbatim** | [ELI](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng) · CELEX `32024R2847`, consolidated `02024R2847` |
| B2 | Commission Implementing Regulation (EU) 2025/2392 | **The 24 technical descriptions we have not retrieved**, all recitals (2 and 4 confirmed, rest unread), Art. 3 entry into force | [OJ PDF](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502392) · CELEX `32025R2392` |

Both questions below are now **answered** — see `docs/research/out/wp1-findings-02-verified.md`:

1. **No.** B2 gives no technical description for the second limb of Annex IV cat. 2. The
   whole description concerns smart meter gateways. The WATER case is now a legal-
   interpretation question, not a retrieval gap.
2. **26**, verified by counting the official Annex I and II tables (19 + 4 + 3).

## P0 — referenced instruments that decide our live cases

These are named inside the Annex categories, so their definitions are part of the test.

| Document | Why it matters | Link |
|---|---|---|
| Directive (EU) 2019/944, **Art. 2(23)** | Defines "smart metering system" for Annex IV-2. Decides `WTR-01/02/03`, `A4-01/02/04` | CELEX `32019L0944`, consolidated `02019L0944` |
| Regulation (EU) 2017/745 (MDR) | Named in III-I-19; medical exclusion. Decides `EXC-01/02/03` | CELEX `32017R0745` |
| Regulation (EU) 2017/746 (IVDR) | Same | CELEX `32017R0746` |
| Directive 2009/48/EC (toy safety) | Named in III-I-18. **Check whether a newer Toy Safety Regulation has replaced it** | CELEX `32009L0048` |

## P1 — exclusions under CRA Art. 2

Do **not** work from a remembered list. Read Art. 2 and write down which instruments it
actually names, then fetch those. Our `EXC-04/05` cases assume automotive and
national-security exclusions exist; that assumption needs checking against the text.

Likely candidates to verify: Regulation (EU) 2019/2144 (vehicle type-approval, CELEX
`32019R2144`), Regulation (EU) 2018/1139 (civil aviation, `32018R1139`), Directive
2014/90/EU (marine equipment, `32014L0090`), plus the CRA's own provisions on products for
national security, military use and classified information.

## P1 — official non-binding guidance (level 2)

Usable for interpretation and "why do we ask this?" text, never as a rule's authority.
Record the access date — these are living documents.

| Code | Document | Link |
|---|---|---|
| B3 | **OBTAINED** — C(2026) 5252 final, 27.7.2026, 84pp, via ORC WG. Formal status still to confirm: it is the annex to an act approving a *draft* Communication | [digital-strategy](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-new-guidance-support-businesses-implementation-cyber-resilience-act) |
| B4 | CRA implementation timeline | [factpage](https://digital-strategy.ec.europa.eu/en/factpages/cyber-resilience-act-implementation) |
| B5 | CRA conformity assessment | [policy page](https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment) |
| — | Official Commission CRA FAQ (living source, v3 §2) | via ORC WG below |

## Also obtained

- B7 — official CRA FAQ, 66pp (`B7_orcwg-official-CRA-FAQ_captured-2026-10-12.pdf`)
- ORC WG structured data in `docs/research/out/orcwg/`: FAQ v12 and v14 Markdown, `official-guidance.json` (366 KB), `craReferences.json`, `eu-reg.json`. Mirror copies — useful as WP1/WP2 input, never as citation authority.

## P2 — discovery routes and prior art

Not authority. Reinstated from v3 per DR-01.

- ORC WG CRA Hub — [official FAQ](https://cra.orcwg.org/faq/official/) and [official guidance](https://cra.orcwg.org/official-guidance/)
- Regulation (EU) 2023/1162 — technical specs for smart metering, supports the 2019/944 definition (CELEX `32023R1162`)
- Rules-as-Code prior art for WP7: Catala, LegalRuleML, OpenFisca, OECD Law as Code

## P2 — amendment check, repeat every release

- Any **delegated act under Art. 7(3)/8** further specifying Annex III/IV categories since
  2025-12-21. Both reports warn the Annexes can be amended; AC-09 depends on catching this.
- Whether B1 has acquired a consolidated version with amendments.

## Not documents — WP4 benchmark targets

Run against the catalogue cases, record screens and outcomes:
[cyberresilienceact.eu fast-check](https://www.cyberresilienceact.eu/fast-check.html) ·
[classification finder](https://www.cyberresilienceact.eu/nl/classification.html) ·
[Asphalia](https://cra.asphaliaconsulting.be/)

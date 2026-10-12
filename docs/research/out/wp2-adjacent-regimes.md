# Adjacent regimes — law that applies alongside without excluding

A category the fact register did not model, found by hitting three instances separately before
noticing the pattern.

## The distinction that matters

| | Effect on the assessment |
|---|---|
| **Exclusion** (Art. 2(2)–(7), and Art. 2(5) delegated acts) | The CRA does not apply. Scope is `OUT`. |
| **Adjacent regime** | The CRA applies in full. Another instrument applies too, and changes what the user must do — without touching scope or class. |

Conflating the two is dangerous in both directions. Treating an adjacent regime as an exclusion
produces a false `OUT`; ignoring it produces an answer that is correct about the CRA and
misleading about the user's actual obligations.

## The regimes, and what triggers them

Each is confirmed from the official FAQ unless noted.

| Regime | Trigger | What it changes | Source |
|---|---|---|---|
| **RED Delegated Regulation (EU) 2022/30** | Internet-connected radio equipment; or radio equipment processing personal, traffic or location data; or enabling transfer of money or virtual currency | Its cybersecurity requirements have applied since **1 Aug 2025**. For products placed 1 Aug 2025 – 10 Dec 2027, they apply **instead of** the CRA's essential requirements. Commission *aims* to repeal it from 11 Dec 2027 | B16, FAQ |
| **AI Act (EU) 2024/1689** | Product is a high-risk AI system under Art. 6 | CRA Art. 12 changes the **conformity route**, and which way depends on the CRA class | B1 Art. 12 |
| **Machinery Regulation (EU) 2023/1230** | Product is machinery or a related product | Applies from **20 Jan 2027**. Its Annex III ss. 1.1.9 and 1.2.1 address cybersecurity risks affecting safety. Both sets of requirements apply; CRA recital 53 governs the interplay, including conformity assessment | FAQ |
| **GPSR (EU) 2023/988** | Consumer product with risks beyond cybersecurity | Applies alongside for the non-cyber risks, absent product-specific legislation | FAQ |
| **Data Act (EU) 2023/2854** | Product is also a connected product or related service | Arts. 4 and 5 data-access obligations must be **considered within the CRA risk assessment** | FAQ |
| **EHDS (EU) 2025/327** | EHR systems | **Changes a CRA answer.** Inserts CRA Art. 32(5a): EHR systems use the EHDS Chapter III conformity procedure; replaces Art. 13(4), 31(3). From 26 Mar 2027 — verified verbatim in B18 Art. 104. Case `EHR-01` | B18 |
| **NIS 2 / CER** | The *operator* is an essential or important entity | Nothing. Obligations attach to the operator, not the product. Needed only to explain why | B9, B10 |

## What the engine does

**Pointers, not assessments.** v4 §2.3 keeps all of this out of scope, and the tool must not
imply it has assessed any of it. The output states that another regime appears to apply and that
the user should check it separately.

Two exceptions, where an adjacent regime changes a CRA answer and must therefore be modelled:

1. **RED DA** — changes *which* cybersecurity requirements apply during the window. Answering
   "CRA main requirements: `NOT_YET`" without this is falsely reassuring.
2. **AI Act Art. 12** — changes the conformity route as a function of the CRA class.

Everything else is informational.

## Derivation, not new questions

These need almost no new facts. The triggers are mostly things already asked: is it a consumer
product, does it have a radio, does it process personal data, is it machinery, is it an AI system.
The adjacent-regime list should be **derived** from facts already collected rather than adding a
questionnaire section — otherwise the precheck grows without improving the CRA answer.

## A recurring set of instruments

The same instruments keep appearing on both sides of the line, which is a trap worth naming.
MDR/IVDR, Reg. 2018/1139 and Reg. 2019/2144 are **CRA exclusions** under Art. 2(2)–(3) *and*
**derogations within the RED Delegated Regulation** (its Art. 2). Seeing "2019/2144" in a
document does not tell you which effect is in play — the instrument doing the excluding matters
as much as the instrument being excluded.

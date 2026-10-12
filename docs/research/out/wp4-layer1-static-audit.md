# WP4 Layer 1 — static audit of existing tools

**What this is.** A reading of each tool's own logic and text, extracted from the pages they serve,
compared against the official texts we hold (B1c, B2) and our case catalogue. All three tools
classify entirely in the browser; their question trees and category lists are embedded in the page.
No case was clicked through, and nothing was submitted to any tool.

**What this is not.** It is not a verdict on the tools as legal advice, nor a claim about what any
user would actually answer. Section 4 predicts outcomes from the tools' own wording; real users may
answer differently. All three tools carry disclaimers and recommend professional advice. Our own
tool is unbuilt and its reference outcomes are author interpretations, not legal determinations
(DR-04).

## 1. Versions audited

Fetched 2026-10-12 18:32 UTC. Pages change; every finding refers to these versions only.

| Tool | URL | sha256 | Size |
|---|---|---|---|
| Asphalia CRA assessment | `https://cra.asphaliaconsulting.be/` | `4ee96dc5…a80a5e` | 316 946 B |
| cyberresilienceact.eu Fast Check | `https://www.cyberresilienceact.eu/fast-check.html` | `3865d125…74ba8e` | 184 536 B |
| cyberresilienceact.eu Classification finder | `https://www.cyberresilienceact.eu/nl/classification.html` | `ad40c1d9…b79a121b` | 657 039 B |

Full hashes: `3865d125a9e98c553be15afd84c62258b6c4409df8b6e87cb4552bc1f674ba8e`,
`ad40c1d9a34702b049b4ea3b409c879f84252ae85f46cc935f4f6222b79a121b`,
`4ee96dc527b3dab8f221651dfc500a7e3eee4f9fb86452bf92273f14bcc80a5e`. Page copies are kept outside the
repository; only hashes and short quotations are recorded here.

## 2. How each tool works

**Asphalia** — a branching questionnaire: 18 questions, 15 results. Scope first (product, SaaS and
remote data processing, connection, EU market, testing versions, substantial modification,
commercial activity and FOSS, sector exclusions, AI Act, defence, spare parts), then classification
through three gates: q8 "primarily perform functions critical to the cybersecurity of other
products?", q8b "could cause significant damage or disruption if compromised?", q8c "Is your
product a hardware security module, smart meter gateway, secure cryptoprocessor, smartcard, or
secure element?". Every path ends in a definite result.

**cyberresilienceact.eu Fast Check** — four scope questions (EU market; digital elements; installed
or web-only; sector legislation). Results are labelled "likely".

**cyberresilienceact.eu Classification finder** — a tick-list of 25 category labels. The result is
the highest class ticked; nothing ticked gives "Default: Your product is not named in Annex III or
IV". A prominent note explains the core-functionality test of Art. 7(1).

## 3. Findings

Ordered by direction. **Permissive** findings can tell a user their product is less regulated than
it is, which is the only kind of error that can harm a user (DR-04, AC-02). **Strict** findings
over-classify. Each is checked against the text named in the last column.

### 3.1 Permissive

| # | Tool | Finding | Checked against |
|---|---|---|---|
| P1 | Asphalia | **Classification is gated on Art. 7(2), which is not the test for a product.** q8 and q8b ask the Art. 7(2)(a) and (b) criteria, and the explanations cite Art. 7(2) as making a product "important". Art. 7(2) states the criteria the Annex III *categories* meet, and Art. 7(3) uses them for amending the list; the test for a product is Art. 7(1), core functionality of a listed category. A "No" at both gates skips every Class I and II category with no record of why. Example paths: a Wi-Fi network interface card or a microcontroller with security functions (both Class I) whose maker does not regard it as "critical to cybersecurity" or capable of "significant damage" reaches q8c, answers "No", and gets **DEFAULT** | B1c Art. 7(1)-(3) |
| P2 | Asphalia | **Uncertainty ends in DEFAULT.** q8, q8b and q8c offer only yes or no, and q9's "Not sure / none of the above" routes onward to q8b/q8c. No path ends in an unresolved result, so a user who is unsure is led to DEFAULT | Tool tree (all 18 nodes enumerated) |
| P3 | Asphalia | **The critical gate omits most of IV-01.** q8c names "hardware security module" but not physical payment terminals or tachographs, which the official description names. Its explanation glosses IV-01 as "(hardware security modules)". A payment-terminal maker answering q8c as worded reaches **DEFAULT** for a critical product (our `MP-28`) | B2, IV-01 description |
| P4 | Fast Check | **The sector-exclusion question is open-ended.** "Is it already covered by sector-specific legislation (e.g. medical devices, motor vehicles, civil aviation)?" A "Yes" gives "likely out of scope". The CRA excludes only specific instruments, and for aviation only certified products (Art. 2(3)). Machinery, RED and toy products are also "covered by sector-specific legislation" but are not excluded (our `OVL-04`, `EXC-07`) | B1c Art. 2(2)-(4) |
| P5 | Asphalia | **The transition note overstates Art. 69(2).** "Products … placed on the market before 11 December 2027 are not subject to the CRA unless they undergo a substantial modification." Art. 69(3) keeps Art. 14 reporting applying to them. The tool shows reporting in a separate section, but the sentence itself says "not subject to the CRA" | B1c Art. 69(2)-(3) |
| P6 | both | **The L-category vehicle exclusion and its carve-back are absent.** Neither tool mentions Del. Reg. 2025/1535. A speed-pedelec maker (in scope, `EXC-12`) who reads "motor vehicles (type-approved)" as covering their vehicle can answer "Yes" and be told it is excluded. This is a risk from the wording, not a certain path | B14 Art. 1 |

### 3.2 Strict (over-classification)

| # | Tool | Finding | Checked against |
|---|---|---|---|
| S1 | Asphalia | **An invented category.** q9_system routes "… IACS, or similar" to Class I, and its explanation lists "industrial automation and control systems (IACS)" as Class I. IACS is not in Annex III or in the 26 technical descriptions. The tool's own product catalogue marks IACS and "software update/patch management components" as *pending*, so the tree and catalogue disagree. The catalogue comment expects additions "via Commission implementing act under Art. 7(4)"; Art. 7(4) provides technical descriptions, and new categories come by delegated act under Art. 7(3) | B1c Art. 7(3)-(4); B2 (26 categories) |
| S2 | Asphalia | **Clickable labels drop conditions the explanation keeps.** q9_system's answer reads "… smart home product, IoT toy, wearable …"; the explanation says smart home *security* products, toys *with social or tracking features*, wearables *with health monitoring*. A pet camera (`CORE-01`) or a notifications-only smartwatch (`MP-19`) fits the label | B2 III-I-17, 18, 19 |
| S3 | Fast Check | **No data-connection test.** "Does it contain digital elements (software, firmware or a network connection)?" Firmware alone leads to "likely in scope". Art. 2(1) requires an intended or foreseeable data connection, so an air-gapped device with firmware (`SCP-06`) is out | B1c Art. 2(1) |
| S4 | Fast Check | **No commercial-activity, defence, spare-part or marine question.** Non-commercial open source (`OSS-01`), identical spare parts (`BND-06`), exclusively-defence products (`EXC-10`) and marine equipment (`EXC-13`) all reach "likely in scope" | B1c Art. 2(4), 2(6), 2(7), 3(22) |
| S5 | all | **Open questions are resolved as matches.** Asphalia q8c accepts "secure cryptoprocessor"; the finder lists "Smart meter gateways and other devices for secure cryptoprocessing". Both treat IV-02's second limb as a settled category, though it has no technical description (WP1). The finder's label also narrows the official "other devices for advanced security purposes, including for secure cryptoprocessing" | B2 IV-02 title and description |
| S6 | both | **The AVA_VAN boundary is invisible.** Neither tool asks the AVA_VAN level, which is what separates Class II tamper-resistant microcontrollers (level 2 or 3) from critical secure elements (at least 4). The choice falls to the user's reading of the labels (`MP-25`, `MP-26`) | B2 III-II-04, IV-03 |

### 3.3 Done well

Fairness requires recording these, and several are things v3 and v4 assumed the tools got wrong.

- **Firewalls are Class II with no industrial qualifier** in all three. Asphalia's source even
  carries the comment "L2-fix: Firewalls & IDS/IPS are Class II per Annex III (no industrial
  qualifier)". The v3/v4 assumption that existing tools add this qualifier is not true of these
  versions (`A3-01`).
- **All 26 categories are present** in both category lists (the finder merges III-I-13 and III-I-14
  into one label, which is harmless because they share a class).
- **Asphalia's scope logic is careful**: indirect, logical and physical connections (q2); remote data
  processing tested against Art. 3(2) (q1a_rdp); Art. 2(3) aviation exclusion requires certification
  (q5); defence requires exclusivity (q6); Art. 4(3) testing versions have their own question;
  open-source stewards have their own result; "is or will be available" handles prospective sale.
- **Asphalia's "not sure" answers in scope always route conservatively**, toward in scope.
- **The classification finder explains the core-functionality test prominently**, including that a
  feature does not make a product important (Art. 7(1)), and cites Impl. Reg. 2025/2392.
- **The Fast Check says "likely"** rather than asserting.

## 4. Priority cases, predicted from each tool's wording

"Pass" means the tool's own wording leads a careful user to the reference outcome. "Fail" means
the wording leads away from it. "Depends" means the outcome turns on how the user reads a label.
These are predictions, to be confirmed with real users in WP6 if needed.

| # | Case | Reference | Asphalia | Fast Check + finder |
|---|---|---|---|---|
| 1 | `RAT-01` pest camera | not III-I-17 | Pass (q8/q8b → DEFAULT) | Pass if "security functionalities" is read |
| 2 | `CORE-01` pet camera | not III-I-17 | Depends: label "smart home product" (S2) | Pass if label read |
| 3 | `WTR-01` water meter | not IV-02 | Depends: q8c says "smart meter gateway" | Depends |
| 4 | `A4-03` named gateway, lacks functions | not IV-02 | Depends: name-based question | Depends: name-based label |
| 5 | `CAT-11N` smartphone | not III-I-11 | Depends: q8b names OS | Pass: core-function note |
| 6 | `CAT-21N` router with firewall | router, not firewall | Depends | Depends; core-function note helps |
| 7 | `A3-01` consumer firewall | Class II | **Pass** | **Pass** |
| 8 | `LOCK-02` office lock | not III-I-17 | Depends (S2) | Pass if "smart home" read |
| 9 | `MP-25`/`MP-26` AVA_VAN 4 vs 3 | critical vs Class II | Fail to distinguish (S6) | Fail to distinguish (S6) |
| 10 | `MP-02` password vault | Class I | Pass | Pass |
| 11 | `SCP-04` USB-only device | in scope | Pass (q2 wording) | Pass |
| 12 | `BND-04` standalone SaaS | out | Pass | Pass |
| 13 | `EXC-07` uncertified avionics | in scope | **Pass** (asks "certified") | **Fail** (P4) |
| 14 | `EXC-09` dual-use | in scope | Pass ("exclusively") | Pass (not asked) |
| 15 | `EXC-12` speed pedelec | in scope | Risk (P6) | Risk (P4, P6) |
| 16 | `EXC-03` toothbrush for diagnosis | unresolved | In scope (strict) | Depends |
| 17 | `RAT-04` conflicting documents | unresolved | **Fail**: no unresolved result (P2) | **Fail**: no unresolved result |
| 18 | `SCP-03` EU market unknown | unresolved | No "not sure" option at q3 | Proceeds as in scope (conservative) |
| 19 | `A4-02` water gateway | open question | Critical (S5) | Critical (S5) |
| 20 | `TYPE-02` units after 11-12-2027 | must comply | Not modelled | Not modelled |
| 21 | `LIFE-04` routine update | not substantial | Pass (q3a wording) | Not modelled |
| 22 | `RED-01` RED DA period | RED DA applies | **Fail**: RED DA not mentioned | Not modelled |
| 23 | `AI-05` AI machinery | route not stated | Not modelled (Art. 12 described generally; 2026/1744 absent) | Not modelled |

## 5. What this means for the go/no-go

v4 asks for "a demonstrated real gap" before building. On this evidence:

- **A real gap exists, and it is the one v4 was designed around**: no tool can say "unresolved"
  on classification, and the clearest permissive risks (P1-P3) come from asking abstract or
  name-based questions instead of testing each category's conditions. Our fact register and rule
  model (WP2, WP7) were built to close exactly this.
- **But the gap is narrower than v3 and v4 assumed.** The industrial-qualifier error is gone,
  category lists are complete, and Asphalia's scope logic is close to ours. A tool that only
  re-listed categories would add little.
- **The differentiators that hold up**: uncertainty as a result, condition-level questions with the
  failing condition recorded, the evidence gate, dated rules (RED DA, AI Act as amended, per-unit
  placing dates), and citations verified against held sources.

Findings P1-P6 and S1-S6 are specific and checkable. If any are shared with the tools' authors,
they should be framed as observations against cited provisions and dated to these versions.

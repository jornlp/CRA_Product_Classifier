# Validation case catalogue

Per DR-01 this restores the v3 ambition of 50+ representative cases plus minimal pairs,
built around v4's existing IDs rather than replacing them.

## How to read this

**No expected outcome below is a legal determination.** Statuses follow DR-04:
`AUTHOR_VERIFIED` means the conditions trace verbatim to official text we hold and have
verified; `AUTHOR_INTERPRETATION` means our reading goes beyond the literal text;
`OPEN_QUESTION` means the law is genuinely undetermined and the engine must not resolve it.
The authoritative status and structured expected values for every case live in
`case-expectations.json`.

The "decisive fact" column is the point of the catalogue: most cases exist to be a
**minimal pair** with a sibling, differing in exactly one legally relevant fact. A case
that cannot name its decisive fact is probably not earning its place.

Shorthand: `cat. III-I-17` = Annex III Class I category 17 (smart home products with
security functionality, per B2 Annex I nr. 17); `cat. IV-2` = Annex IV category 2
(smart-meter gateways, per B2 Annex II nr. 2). Exact wording must be verified against
B1/B2 on every release — the match depends on the official text, not on our paraphrase.

Legend — Status: `H` marks rows not yet migrated to the DR-04 taxonomy; see `case-expectations.json` for the authoritative status of every case. Source: `v3` from
ontwikkelrapport §5, `v4` from implementatiespecificatie §7.1, `new` added here.

---

## A. Scope, connectivity and market activity

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| SCP-01 | Connected product sold commercially in the EU | baseline | Scope `IN_SCOPE`; reasons cite art. 2/3 | new | H |
| SCP-02 | Identical product, never made available on the EU market | EU market activity FALSE | Scope `OUT_OF_SCOPE` with stated reason | new | H |
| SCP-03 | Identical product, EU market activity unknown | EU market activity UNKNOWN | No definitive outcome; targeted question | new | H |
| SCP-04 | Device with no network stack, data exchanged only over USB to a PC | connection is direct/physical | Not `OUT_OF_SCOPE` on "no internet"; art. 2(1)/3 question | v4 §3.3 | H |
| SCP-05 | Device whose only data path is a proprietary radio to a vendor hub | indirect logical connection | Connectivity treated as potentially relevant | new | H |
| SCP-06 | Genuinely air-gapped device, no data interface of any kind | all connection paths FALSE | Scope may resolve negative, with each path recorded FALSE | new | H |
| SCP-07 | Connection technically present but vendor says it is unused | intended vs foreseeable use | Foreseeable-use question; vendor claim alone not decisive | new | H |
| SCP-08 | Prototype shown at a trade fair, not yet placed on market | market activity vs placing | Scope and timeline answered separately | new | H |

## B. Exclusions

Each case must identify the specific exclusion claimed and check it against B1 art. 2.
Absence of a match is never an exclusion (v4 §5.2).

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| EXC-01 | Product with a medical intended purpose under MDR/IVDR | regulated medical purpose | Exclusion evaluated explicitly, reason recorded | v3 | H |
| EXC-02 | Camera toothbrush marketed for oral hygiene only | no medical intended purpose | No medical exclusion; continue to classification | v3 | H |
| EXC-03 | EXC-02 variant marketed for gum-disease diagnosis | medical purpose claimed | Exclusion candidate + expert review flag | new | H |
| EXC-04 | Component for a type-approved motor vehicle | Reg. 2019/2144 applies | Art. 2(2)(c) exclusion where that Regulation applies to the product | v3 | H |
| EXC-05 | Device developed exclusively for military/classified use | national-security exclusion | Exclusion candidate; documentary evidence required | new | H |
| EXC-06 | Exclusion claimed but applicable instrument unidentified | exclusion basis UNKNOWN | No exclusion granted; question returned | new | H |
| EXC-11 | Connected moped or quadricycle within Reg. (EU) No 168/2013 | an applicable Art. 2(5) delegated act exists | **Excluded** by Delegated Regulation (EU) 2025/1535 Art. 1 | new | H |
| EXC-12 | Connected speed pedelec — an L1e vehicle designed to pedal | the carve-out from the carve-out | **Not excluded.** 2025/1535 Art. 1 second paragraph expressly keeps pedal-designed L1e vehicles in CRA scope | new | H |
| EXC-07 | Avionics product within scope of Reg. 2018/1139 but **not** certified under it | certification, not scope | Art. 2(3) excludes only products *certified in accordance with* 2018/1139 — scope alone is not enough | new | H |
| EXC-08 | Sectoral rules claimed to cover the Annex I risks, with no delegated act covering this product | Art. 2(5) requires an **applicable** act | No exclusion. The test is whether an applicable delegated act covers this product, not whether any exist — one does (2025/1535), but not for this product | new | H |

## C. Product boundary

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| BND-01 | Sensor sold only as an integrated appliance | single product boundary | One assessment | new | H |
| BND-02 | Same sensor also sold separately as a component | separately marketed | Separate assessment per offered product | v4 §3.3 | H |
| BND-03 | Device + cloud backend, backend is remote data processing for the product | backend is part of product | Backend in scope as product element | v3 | H |
| BND-04 | Standalone SaaS with no associated device | no product relationship | Scope differs; reason recorded | v3 | H |
| BND-05 | Bundle sold as one SKU but containing two candidate categories | multiple core functions | No silent merge; boundary question + review flag | new | H |
| BND-06 | Spare part replacing an identical component, same specifications | Art. 2(6) | Excluded by Art. 2(6) — a genuine exclusion, not merely a separate assessment | new | H |
| BND-07 | Replacement module with improved specifications | not identical / different specs | Art. 2(6) does not apply; own assessment and own timeline | new | H |
| WTR-03 | Identical meter, third party sells the gateway separately | who places what | Two delimited assessments, no category carry-over | v4 | H |

## D. Core function versus feature

The point of this family: a component does not determine a class (v4 §3.3).

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| CORE-01 | Pet camera for behaviour analysis | core function is observation | Not matched on "camera"; `DEFAULT` plausible if all categories excluded | v3 | H |
| CORE-02 | Video doorbell marketed for intruder detection | core function is consumer physical security | cat. III-I-17 candidate — positive-side test | v3 | H |
| CORE-03 | Device runs Linux and TLS, core function is irrigation timing | OS/crypto are components | No class from component presence | v4 §3.3 | H |
| LOCK-01 | Residential smart door lock, app-controlled, remotely manageable | residential consumer security | cat. III-I-17 candidate | new | H |
| LOCK-02 | Same lock marketed for office access control | residential context absent | cat. III-I-17 may not match; still in CRA scope | new | H |
| LOCK-04 | Smart lock marketed for short-term rental use — "residential and Airbnb" | setting is genuinely both | `RESIDENTIAL_SETTING` = `CONFLICTING`; reviewer flag rather than a choice. Short-term rental is neither an ordinary home nor a commercial building | new | H |
| LOCK-03 | Same lock, marketing claims both home and office use | CONFLICTING context | `CONFLICTING` + review flag; no silent choice | new | H |
| CORE-04 | Product documentation and marketing describe different core functions | CONFLICTING evidence | No automatic selection; reviewer flag | v4 (cf. RAT-04) | H |
| CORE-05 | Product whose core function matches a category, carrying unrelated extra features | extra functions present | Category retained — extra functions do not remove core functionality (B2 recital 4) | new | H |
| CORE-06 | Home automation hub that centrally controls smart locks and alarms | central control limb | cat. III-I-17 candidate in its own right, via the "centrally control such products" limb | new | H |
| CORE-07 | Product integrating components that perform a category's functions, but whose own core function differs | core function vs capability | Not in that category — B7 §3.4: a smartphone is not an operating system or password manager; SOAR is not SIEM | new | H |

## E. Annex III candidates

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| RAT-01 | Commercial rat-trap camera, external data connection, pest-monitoring core function | pest monitoring, not consumer safety | Scope candidate `IN_SCOPE`; cat. III-I-17 not matched on "camera" alone; `DEFAULT` only on complete coverage | v4 | H |
| RAT-02 | Identical device marketed as remotely managed home intruder monitoring | core function changed | cat. III-I-17 candidate with explicit changed core function and source reference | v4 | H |
| RAT-03 | Connection unknown | connectivity UNKNOWN | No definitive `OUT_OF_SCOPE`; targeted direct/indirect connection question | v4 | H |
| RAT-04 | Documentation describes both pest monitoring and home security | CONFLICTING | `CONFLICTING` / review flag; no automatic choice | v4 | H |
| A3-01 | Firewall or IDS product, consumer or industrial | **no industrial-use condition exists** in B2 III-II-02 | Class II candidate on the technical description alone; v3/v4 both wrongly assumed an industrial qualifier | new | H |
| A3-02 | Consumer router/modem | use context | Category assessed against B2 description | new | H |
| A3-03 | PLC or industrial gateway | function vs sector label | Not automatically Class II | v3 | H |
| A3-04 | HVAC controller / building access control | "smart building" is not a legal class | Evaluated per core function | v3 | H |
| A3-05 | Internet-connected toy assessed with an assessment date before 01-08-2030 | referenced instrument in force | cat. III-I-18 resolved against Directive 2009/48/EC | new | H |
| A3-06 | Identical toy assessed on or after 01-08-2030 | referenced instrument repealed | Same category, but the reference resolves to Reg. (EU) 2025/2509 via its Art. 56 correlation clause — tests dated cross-reference resolution | new | H |

## F. Annex IV (critical) candidates

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| WTR-01 | Connected water meter measuring and transmitting consumption; no separately sold gateway | metering only | Not automatically cat. IV-2; `DEFAULT` only after complete exclusion | v4 | H |
| WTR-02 | Separate security gateway: third-party communication, crypto, firewalling, device control | gateway control functions | cat. IV-2 candidate + legal review; never Critical on keyword | v4 | H |
| A4-01 | Electricity smart-meter gateway matching the B2 description | energy source named in the text | cat. IV-2 candidate on the stated conditions | new | H |
| A4-02 | Water gateway with identical technical functions | water is not an energy source | B2 names only gas/heat as other energy sources, so the gateway limb has a textual basis for not matching; second limb of the category title unresolved (WP1 §1) | v4 §3.3 | H |
| A4-03 | Device called "smart meter gateway" in marketing, lacking the described functions | name vs function | Name is not evidence; conditions tested individually | new | H |
| A4-04 | Gas or heat gateway with identical technical functions | energy source expressly named in B2 | cat. IV-2 candidate — pairs against A4-02 to isolate the carrier question | new | H |
| A4-06 | Device whose core functionality is secure cryptoprocessing, unrelated to any metering system | second limb of the IV-2 title | Tests whether the undescribed "other devices for advanced security purposes" limb operates independently of the gateway description | new | H |
| A4-05 | Water meter deployed across a utility's network; the operator is a NIS2 essential entity in a critical-infrastructure sector | deployment context and operator status | **No effect on classification.** Annex IV "critical product" is a product-category test on core functionality; critical-infrastructure status belongs to the operator under NIS 2, not to the product under the CRA | new | H |

## G. Economic role

Role does not change the technical class (v4 §3.3).

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| ROL-01 | Manufacturer under own brand | role = manufacturer | Role obligations; class unchanged | new | H |
| ROL-02 | Same product imported from outside the EU | role = importer | Different role questions, same class | new | H |
| ROL-03 | Same product distributed unchanged | role = distributor | Different role questions, same class | new | H |
| ROL-04 | White-label product rebranded by the seller | who places under whose name | Manufacturer role question; boundary recorded | v3 | H |
| ROL-05 | Custom software built for one client | who places on market | Role and boundary established before class | v3 | H |
| ROL-06 | Integrator combines third-party products into a system | new product or not | Explicit question; no automatic answer | v3 | H |

## H. Lifecycle and timeline

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| LIFE-01 | Placed on market before 11-12-2027, no substantial modification since | placing date | Main requirements: transitional handling; art. 14 assessed separately | v4 | H |
| LIFE-02 | Product substantially changed after 11-12-2027, status of change uncertain | modification UNKNOWN | No definitive transition exemption; question or expert review | v4 | H |
| LIFE-03 | New product first placed on market in 2028 | placing date | Main requirements assessed as applicable if scope `IN_SCOPE` | v4 | H |
| LIFE-04 | Routine security firmware update, no functional change | not every update is substantial | Not automatically a substantial modification | v4 §3.3 | H |
| LIFE-05 | Firmware update adding a new remote-management capability | functional change | Substantial modification candidate + review flag | new | H |
| LIFE-06 | Placing date unknown | date UNKNOWN | Timeline `UNRESOLVED` per obligation; no single "CRA from date" answer | new | H |
| LIFE-08 | Update changes security behaviour; intended purpose unchanged; effect on Annex I Part I compliance UNKNOWN | limb (a) of Art. 3(30) | Must **not** conclude "not substantial" from unchanged intended purpose alone — `UNRESOLVED` + reviewer flag. The MVP cannot decide limb (a) | new | H |
| RED-01 | Internet-connected radio equipment placed on the market between 1 Aug 2025 and 10 Dec 2027 | in RED DA scope, placed before the CRA applies | CRA essential requirements do not yet apply (Art. 69(2)), **but the output must say the RED Delegated Regulation's cybersecurity requirements already do**. Silence here is falsely reassuring | FAQ | H |
| RED-02 | The same radio equipment placed on the market on or after 11 Dec 2027 | placed after the CRA applies | CRA essential requirements apply. The Commission *aims* to repeal the RED Delegated Regulation from that date — an intention, not a fact, so the tool must not assert the repeal | FAQ | H |
| LIFE-07 | Product holds an EU type-examination certificate under other harmonisation legislation | Art. 69(1) | Certificate valid until 11 June 2028 unless it expires earlier or that legislation says otherwise — a fourth date the plan omitted | new | H |

## I. Open source

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| OSS-01 | Non-commercial OSS project, no monetisation | commercial activity FALSE | Dedicated scope/role route | v3 | H |
| OSS-02 | Same code offered with paid support and commercial distribution | commercial activity TRUE | Different route; reasons recorded | v3 | H |
| OSS-03 | Open-source steward role | steward status | Steward-specific questions, distinct from manufacturer | v3 | H |

## K. Overlap with the AI Act

Art. 12 makes the applicable conformity route depend on the CRA class, so these are
classification-adjacent, not merely informational.

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| AI-01 | In-scope product that is also a high-risk AI system under **Art. 6(2)/Annex III** of Reg. 2024/1689, `DEFAULT` class, placed on the market on or after 2-12-2027 | high-risk AI status | CRA class unchanged; conformity route is the AI Act's Art. 43 procedure (Art. 12(2)). Annex I (Section A/B) and earlier dates are `AI-05`/`AI-06` | new | H |
| AI-02 | Same, but the product is an Annex III important product under Art. 32(2)(a)/(b) or 32(3) | class + AI Act internal-control route | Art. 12(3) derogation: CRA conformity procedures apply for the CRA essential requirements | new | H |
| AI-03 | Same, but an Annex IV critical product | class + AI Act internal-control route | Art. 12(3) derogation applies | new | H |
| AI-04 | Product embeds an AI component but its core function is not that of a high-risk AI system | AI as component | No change to class or route; the component rule applies as elsewhere | new | H |
| AI-05 | AI-enabled machine whose AI system is high-risk under Art. 6(1) **only via the Machinery Regulation**, now in Section B of AI Act Annex I | Annex I Section B | CRA class unchanged. AI Act Art. 2(2) (as amended by 2026/1744) applies only Art. 6(1), 60a and 102–112, so the Art. 43 procedure that CRA Art. 12(2) points to does not apply. Engine must **not** assert the Art. 43 route; flag for expert review | new | H |
| AI-06 | High-risk AI product (via Annex I) placed on the market between 11-12-2027 and 2-8-2028 | date vs AI Act Art. 113(c)(ii) | AI Act Chapter III, incl. Art. 6, applies to Annex I systems only from 2-8-2028. Whether the product is "classified as high-risk … pursuant to Article 6" for CRA Art. 12 in that window is unresolved. Engine must date-qualify the route, never state it unconditionally | new | H |

## N. Cases from the official FAQ

Drawn from worked examples in the official CRA FAQ. These are the Commission's own
illustrations, which makes them unusually good test material — though the FAQ is non-binding
and a living document, so each case records the version it came from (v14).

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| OWN-01 | Development and configuration tools a manufacturer builds for its own use | never placed on the market | Out of scope — placing on the market does not occur for products made for one's own use (Blue Guide 2.3) | FAQ | H |
| OWN-02 | The same internal tools later offered as separate products | first making available | In scope from that point; pairs with `UG-03` | FAQ | H |
| TYPE-01 | 10 000 units of a product type placed on the market before 11-12-2027, not yet with end users | individual units, placed before the date | Need not be brought into compliance (Art. 69(2)) | FAQ | H |
| **TYPE-02** | A further 5 000 units **of the same type** placed on the market after 11-12-2027 | the CRA applies to individual products, not product types | **Must comply.** Earlier placement of the type gives later units no protection (Blue Guide 2.2) | FAQ | H |
| TEST-01 | Beta or release-candidate software made available for a limited period, with a visible sign that it is non-compliant and for testing only | Art. 4(3) conditions met | Making available permitted despite non-compliance; vulnerability handling still applied as far as possible (recital 37) | FAQ | H |
| TEST-02 | The same beta made available indefinitely, or without the visible sign | Art. 4(3) conditions not met | Art. 4(3) does not apply; ordinary obligations stand | FAQ | H |
| ARCH-01 | Public archive of historical versions no longer made available on the market | Art. 13(11) | Permitted, provided users are clearly informed of the risks of unsupported software | FAQ | H |
| EXC-09 | Dual-use product with both civilian and defence applications | not developed or modified **exclusively** for defence | **Not excluded** — the Art. 2(7) exclusion requires exclusivity | FAQ | H |
| EXC-10 | The same product modified exclusively for national security or defence purposes | exclusivity met | Excluded under Art. 2(7) | FAQ | H |
| COMP-01 | Product integrating third-party components that do not bear the CE marking, during the transition | components not yet subject to the CRA | Integration permitted; due diligence must be exercised by other means (Art. 13(5), recital 35) | FAQ | H |

## O. Adjacent regimes that do not exclude

Other law applying alongside the CRA. The engine flags these as pointers; it does not assess them
(v4 section 2.3). The exceptions are RED, the AI Act and the EHDS, which change a CRA answer (the EHDS via CRA Art. 32(5a)).

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| OVL-01 | Connected industrial machine that is machinery under Reg. (EU) 2023/1230 | machinery and a product with digital elements | **Not excluded.** Both apply; the Machinery Regulation's Annex III ss. 1.1.9/1.2.1 address safety-relevant cybersecurity. Flag as a pointer, do not assess | FAQ | H |
| OVL-02 | Consumer product with digital elements carrying risks beyond cybersecurity | consumer product, non-cyber risks | **Not excluded.** GPSR applies alongside for the other risks. Pointer only | FAQ | H |
| OVL-03 | Connected product that is also a connected product under the Data Act | data-access obligations exist | **Not excluded.** Arts. 4 and 5 obligations must be considered within the manufacturer's CRA risk assessment. Pointer, with that link stated | FAQ | H |
| OVL-04 | Product whose maker claims an adjacent regime means the CRA does not apply | adjacent vs exclusion | The CRA applies. An adjacent regime is not an exclusion; only Art. 2(2)–(7) and an applicable Art. 2(5) delegated act exclude | new | H |
| EHR-01 | Product with digital elements classified as an EHR system under Reg. (EU) 2025/327 | EHR system status | CRA class unchanged. Conformity with CRA Annex I is demonstrated via the EHDS Chapter III procedure (CRA Art. 32(5a), inserted by EHDS Art. 104, from 26-3-2027) | new | H |

## J. Engine properties (meta-cases)

These test the engine contract rather than a product.

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| OTHER-01 | Identical facts entered via "Other", "Industrial" and "Consumer" personas | persona only | Exactly equal legal evaluation and status | v4 | H |
| SRC-01 | Category source changes or rule set is updated | rule set version | Earlier assessment stays reproducible against its old version | v4 | H |
| MET-01 | Same facts, same rule version, evaluated twice | determinism | Identical result and identical trace | v4 §5.2 | H |
| MET-02 | Annex coverage incomplete, no category matched | coverage gap | `DEFAULT` blocked; `UNRESOLVED` + follow-up questions (AC-03) | v4 | H |
| MET-03 | Decisive fact UNKNOWN throughout the flow | unknown propagation | Never converted to FALSE end-to-end (AC-04) | v4 | H |
| MET-05 | Product plainly outside a category whose matching criteria are legally unresolved (IV-02) | exclusion gate fails | Category excluded with reason; `DEFAULT` remains available if all others are excluded — an open question must not freeze every assessment | new | H |
| MET-06 | Product that reaches the unresolved question (metering gateway, or advanced-security/cryptoprocessing core function) | exclusion gate passed or UNKNOWN | `UNRESOLVED` + `NEEDS_EXPERT_REVIEW`; never `DEFAULT`, never `CRITICAL` | new | H |
| MET-04 | Scope `UNRESOLVED` but category candidates exist | scope gate | No definitive class; candidates may still be shown | v4 §5.2 | H |

---

## M. Cases from real product shapes

Derived from real product shapes rather than invented scenarios. No specific company or product
is identified. These sit alongside the per-category coverage in section L, which addresses every
category in Annex III and Annex IV, critical products included.

| ID | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|
| UG-01 | Industrial networking family: managed switches, interface cards and a network management suite, sold as one portfolio | three categories matched at once | Assess each product separately; `III-I-06`, `III-I-10`, `III-I-12` may each apply — multi-category is an expected outcome, not an error | new | H |
| UG-02 | Hospitality platform that issues per-reservation PIN codes and centrally controls door locks in hotels | central control, but **not** a residential setting | `III-I-17` fourth limb engages on central control yet fails on "residential setting" — tests that both must hold | new | H |
| UG-03 | Retailer's in-house store system, used internally for years, now sold to other retailers | making available on the market begins | Not in scope while purely internal; becomes a product placed on the market on first commercial supply (Art. 3(21)(22)) | new | H |
| UG-04 | Design agency develops a product end-to-end; the client markets it under the client's name | who markets under whose name | The client is the manufacturer (Art. 3(13)); the agency is not — role, not technology, decides | new | H |
| UG-05 | Industrial machine embedding a third-party cellular gateway module | component vs separately placed product | Machine assessed on its own core function; the module is its own product only if placed on the market separately (Art. 3(1)); Art. 13(5) due diligence applies either way | new | H |
| UG-06 | Automotive test and measurement equipment used in vehicle development | not itself a vehicle component | Art. 2(2)(c) exclusion fails — Reg. 2019/2144 applies to vehicles, not to equipment used to test them | new | H |

## L. Per-category coverage (minimal pairs)

One positive and one negative case for every one of the 26 Annex III/IV categories, so that
no category ships untested. The negative of each pair fails a named decisive condition — these
are the cases that make a `DEFAULT` outcome defensible, since `DEFAULT` requires every category
to be excluded with a reason.

| ID | Cat. | Scenario | Decisive fact | Expected engine property | Src | St |
|---|---|---|---|---|---|---|
| CAT-01P | III-I-01 | Enterprise single sign-on software | matches the decisive conditions | candidate for this category | new | H |
| CAT-01N | III-I-01 | Employee directory app that stores records but performs no authentication or access control | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-02P | III-I-02 | Embedded browser component intended for integration into another application | matches the decisive conditions | candidate for this category | new | H |
| CAT-02N | III-I-02 | In-app help viewer that renders only local static HTML with no web protocol support or script execution | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-03P | III-I-03 | Hardware-based password manager | matches the decisive conditions | candidate for this category | new | H |
| CAT-03N | III-I-03 | Notes application with one encrypted field, no password generation, sharing or application integration | core functionality is note-taking, not storing passwords | category excluded on C1 (core function). Missing generation/sharing is **not** the reason — those are illustrative (`MP-02`) | new | H |
| CAT-04P | III-I-04 | Rootkit detection tool | matches the decisive conditions | candidate for this category | new | H |
| CAT-04N | III-I-04 | File integrity monitor that reports changes but neither detects malicious code nor removes it | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-05P | III-I-05 | VPN gateway appliance | matches the decisive conditions | candidate for this category | new | H |
| CAT-05N | III-I-05 | Application using TLS for its own traffic, constructing no tunnel from network resources | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-06P | III-I-06 | Software-defined networking controller | matches the decisive conditions | candidate for this category | new | H |
| CAT-06N | III-I-06 | Device dashboard that displays network status but cannot change network operations or configuration | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-07P | III-I-07 | SIEM platform | matches the decisive conditions | candidate for this category | new | H |
| CAT-07N | III-I-07 | Log archiving service with no correlation or analysis for security purposes | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-08P | III-I-08 | UEFI firmware | matches the decisive conditions | candidate for this category | new | H |
| CAT-08N | III-I-08 | OS updater that replaces kernel images but does not manage startup or select boot options | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-09P | III-I-09 | Online certificate status protocol responder | matches the decisive conditions | candidate for this category | new | H |
| CAT-09N | III-I-09 | Application that validates certificates using the operating system trust store and manages no certificate lifecycle | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-10P | III-I-10 | Wi-Fi network interface card with firmware | matches the decisive conditions | candidate for this category | new | H |
| CAT-10N | III-I-10 | USB mass-storage controller - not a network interface | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-11P | III-I-11 | Real-time operating system placed on the market as a product | matches the decisive conditions | candidate for this category | new | H |
| CAT-11N | III-I-11 | Smartphone integrating an operating system - core functionality is not that of an OS (B7 section 3.4) | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-12P | III-I-12 | Wireless access point operating as a bridge | matches the decisive conditions | candidate for this category | new | H |
| CAT-12N | III-I-12 | Smart speaker with a Wi-Fi client that neither routes, modulates nor forwards packets | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-13P | III-I-13 | CPU providing a secure boot chain and trusted execution environment for the wider system | matches the decisive conditions | candidate for this category | new | H |
| CAT-13N | III-I-13 | Microprocessor whose cryptographic accelerator protects only its own internal operation | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-14P | III-I-14 | Microcontroller providing secure key storage for the host product | matches the decisive conditions | candidate for this category | new | H |
| CAT-14N | III-I-14 | Microcontroller with an on-die RNG used solely for its own internal functions | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-15P | III-I-15 | FPGA implementing the secure boot chain for the system it is embedded in | matches the decisive conditions | candidate for this category | new | H |
| CAT-15N | III-I-15 | ASIC performing only signal processing, with no security-related functionality | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-16P | III-I-16 | Smart speaker with an integrated virtual assistant | matches the decisive conditions | candidate for this category | new | H |
| CAT-16N | III-I-16 | Voice-command remote that recognises fixed words offline and sends infrared codes only | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-17P | III-I-17 | Residential smart door locking device, app-controlled (see LOCK-01) | matches the decisive conditions | candidate for this category | new | H |
| CAT-17N | III-I-17 | Rat-trap camera whose core function is pest monitoring (see RAT-01) | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-18P | III-I-18 | Connected toy with a microphone and speaker for two-way interaction | matches the decisive conditions | candidate for this category | new | H |
| CAT-18N | III-I-18 | Connected toy whose only sensing detects proximity of the user - expressly not location tracking | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-19P | III-I-19 | Fitness tracker with continuous heart-rate monitoring, outside MDR/IVDR | matches the decisive conditions | candidate for this category | new | H |
| CAT-19N | III-I-19 | Wearable step counter that is a CE-marked medical device under Reg. 2017/745 - expressly excluded | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-20P | III-II-01 | Type 1 bare-metal hypervisor | matches the decisive conditions | candidate for this category | new | H |
| CAT-20N | III-II-01 | Application sandbox that isolates one process but manages no VM or container lifecycle | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-21P | III-II-02 | Consumer network firewall product - tests that no industrial-use qualifier applies | matches the decisive conditions | candidate for this category | new | H |
| CAT-21N | III-II-02 | Router integrating firewall functionality - remains a router (B2 recital 4) | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-22P | III-II-03 | Microprocessor with tamper response designed to AVA_VAN level 3 | matches the decisive conditions | candidate for this category | new | H |
| CAT-22N | III-II-03 | Same microprocessor without tamper evidence, resistance or response | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-23P | III-II-04 | Microcontroller with tamper resistance designed to AVA_VAN level 2 | matches the decisive conditions | candidate for this category | new | H |
| CAT-23N | III-II-04 | Same microcontroller designed without any AVA_VAN level claim | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-24P | IV-01 | Hardware security module generating and managing cryptographic elements | matches the decisive conditions | candidate for this category | new | H |
| CAT-24N | IV-01 | Single-chip crypto device with no multiple discrete components and no physical envelope | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-25P | IV-02 | Electricity smart meter gateway meeting the description (see A4-01) | matches the decisive conditions | candidate for this category | new | H |
| CAT-25N | IV-02 | Connected water consumption meter that is not a gateway (see WTR-01) | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
| CAT-26P | IV-03 | Trusted Platform Module designed to AVA_VAN.4 | matches the decisive conditions | candidate for this category | new | H |
| CAT-26N | IV-03 | Microcontroller with cryptographic functions designed below AVA_VAN.4 and without tamper resistance | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |

## P. Condition-level minimal pairs (WP5)

Section L gives every category one positive and one negative. WP5's bar is higher: every
decisive **condition** needs a case that turns on it alone. These cases close the gaps found by
the condition audit in `docs/research/out/wp5-condition-coverage.md`: alternative limbs with no
positive, required conditions with no single-condition negative, descriptive wording ("typically",
"including activities such as") that must **not** be treated as a condition, and inclusion lists
that override a condition as worded.

| ID | Category | Scenario | Condition tested | Expected engine property | Src | St |
|---|---|---|---|---|---|---|
| MP-01 | III-I-02 | Embedded web view that loads and renders remote web pages but has script execution disabled | C2 is descriptive ('typically') | Candidate. Script execution is something browsers 'typically include', not a condition; accessing and rendering server-hosted web content (C1) is what matters. Pairs with CAT-02N, which fails C1. Pairs with `CAT-02N` | WP5 | H |
| MP-02 | III-I-03 | Password vault that stores passwords locally but offers no generation, sharing or application integration | C2 is illustrative ('including activities such as') | Candidate. Storing passwords (C1) is the defining function; generation, sharing and integration are listed examples. CAT-03N is excluded because note-taking, not password storage, is its core function. Pairs with `CAT-03N` | WP5 | H |
| MP-03 | III-I-04 | Tool that only quarantines and removes files already flagged as malicious by another product | C2 limb alone | Candidate via the 'removes or quarantines' limb, without its own detection. Pairs with `CAT-04N` | WP5 | H |
| MP-04 | III-I-06 | Dedicated configuration management system that pushes configuration to routers and switches but does not monitor them | inclusion list vs C1 (monitoring) | Candidate. The description names 'dedicated configuration management systems' as included, so monitoring is not treated as strictly required. Inventory conditions C1+C2 read as conjunctive and need the same note. Pairs with `CAT-06N` | WP5 | H |
| MP-05 | III-I-07 | Observability platform that collects and correlates data from many sources for application performance, with no security use | C3 security purpose | Category excluded; fails C3 only (actionable information 'for security-related purposes'). Pairs with `CAT-07P` | WP5 | H |
| MP-06 | III-I-07 | Standalone tool that analyses the logs of a single firewall and raises security alerts | C1 multiple sources | Category excluded; fails C1 only (data from multiple sources). Pairs with `CAT-07P` | WP5 | H |
| MP-07 | III-I-08 | Single-stage boot loader that initialises hardware and loads one fixed kernel, with no boot option selection | inclusion list vs C3 (selecting boot options) | Candidate. The description names single-stage boot loaders as included, so selecting boot options is not treated as strictly required. Pairs with `CAT-08N` | WP5 | H |
| MP-08 | III-I-09 | Key vault managing symmetric keys and secrets, with no digital certificates involved | C3: keys associated with certificates | Category excluded. Key lifecycle counts only for keys 'associated with such digital certificates' within a PKI. Pairs with `CAT-09P` | WP5 | H |
| MP-09 | III-I-10 | Virtual network interface driver for VPN or container networking, placed on the market as a standalone product | virtual limb (C3) | Candidate via the virtual network interface limb. Pairs with `CAT-10N` | WP5 | H |
| MP-10 | III-I-12 | Industrial modem providing a point-to-point serial link over a leased line, not used for IP-based Internet communication | modem limb: intended for connection to the Internet | Modem limb excluded: not 'intended for the connection to the Internet' nor converting signals 'for IP-based communication'. Pairs with `CAT-12P` | WP5 | H |
| MP-11 | III-I-12 | Unmanaged desktop Ethernet switch with no management plane | switch limb: management plane | Switch limb excluded: switches in this category 'have a management plane'. Pairs with `CAT-12P` | WP5 | H |
| MP-12 | III-I-13 / III-I-14 | System-on-chip with integrated memory and a TEE that secures the host device | C1: external vs integrated memory | Class I either way. Whether it is a microprocessor (external memory) or a microcontroller (integrated memory) need not be resolved for the class; the engine may list both with that reason. Pairs with `CAT-13P` | WP5 | H |
| MP-13 | III-I-16 | Voice assistant appliance for office meeting rooms that controls room equipment and online calendars | C3 residential settings | Category excluded; fails 'in residential settings' only. Pairs with `CAT-16P` | WP5 | H |
| MP-14 | III-I-17 | Smart door lock operated only by Bluetooth from a phone nearby, with no hub, cloud or other remote path | C3 remote control or management | Unresolved whether control by a nearby phone app is control 'remotely from other systems'. Engine must not decide; review flag. Pairs with `LOCK-01` | WP5 | H |
| MP-15 | III-I-18 | Internet-connected toy with GPS location tracking and no microphone, speaker, camera or keyboard | location-tracking limb | Candidate via the location-tracking limb. Pairs with CAT-18N (proximity only). Pairs with `CAT-18N` | WP5 | H |
| MP-16 | III-I-18 | Internet-connected collectible figure with microphone and speaker, designed and marketed for adult collectors | C1 toy under Directive 2009/48/EC | Category excluded if not a toy within the Directive (not designed or intended for play by children under 14). The toy test is a judgement; record the reason. Pairs with `CAT-18P` | WP5 | H |
| MP-17 | III-I-18 | Walkie-talkie toy pair with microphone and speaker communicating only with each other by radio, never with the Internet | C2 Internet communication | Category excluded; fails 'communicate on the public Internet, whether directly or via other equipment'. Pairs with `CAT-18P` | WP5 | H |
| MP-18 | III-I-19 | Child GPS smartwatch with calling but no health sensing, for children under 14 | children's wearable limb (C4) | Candidate via the children's wearable limb, which has no health-monitoring condition. Pairs with `CAT-19P` | WP5 | H |
| MP-19 | III-I-19 | Adult smartwatch showing notifications only, with no sensors for health or body metrics | C2 health sensing | Category excluded; fails C2 and the children's limb does not apply. Pairs with `CAT-19P` | WP5 | H |
| MP-20 | III-II-01 | Container runtime managing container execution and lifecycle on a single host, placed on the market as a product | container runtime limb | Candidate via the container runtime limb. Pairs with `CAT-20N` | WP5 | H |
| MP-21 | III-II-01 | Multi-host container orchestration control plane that schedules containers but delegates execution to runtimes on each node | container runtime: single host, manages execution | Unresolved whether an orchestrator is a container runtime system ('on a single host operating system', 'manage the execution'). Engine must not decide; review flag. Pairs with `MP-20` | WP5 | H |
| MP-22 | III-II-02 | Host-based intrusion detection system that only detects and alerts | IDS limb without prevention | Candidate via the IDS limb; active response is needed only for IPS. Pairs with `A3-01` | WP5 | H |
| MP-23 | III-II-02 | Network traffic analytics for bandwidth planning that neither restricts traffic nor detects intrusions | C1/C2 purpose | Category excluded; fails both firewall and IDS limbs. Pairs with `MP-22` | WP5 | H |
| MP-24 | III-I-14 (fallback) | Microcontroller with security functions for the host, no tamper resistance and no AVA_VAN claim | condition chain after CAT-23N | Excluded from III-II-04 (CAT-23N) but candidate for III-I-14; the class falls to Class I, not to DEFAULT. Pairs with `CAT-23N` | WP5 | H |
| MP-25 | IV-03 | Tamper-resistant microcontroller designed to AVA_VAN.4 | AVA_VAN boundary (III-II-04 vs IV-03) | IV-03 candidate (secure element), not III-II-04, which covers AVA_VAN 2 or 3 only. Pairs with CAT-23P at AVA_VAN 2. Pairs with `CAT-23P` | WP5 | H |
| MP-26 | IV-03 | Tamper-resistant microcontroller designed to AVA_VAN.3 | C3 only (AVA_VAN.4) | IV-03 excluded on C3 alone; lands in III-II-04. Single-condition replacement for CAT-26N, which fails two conditions. Pairs with `CAT-26P` | WP5 | H |
| MP-27 | IV-01 | Multi-component industrial computer storing keys in software, with no tamper-evident or tamper-resistant enclosure | C3 only (physical envelope) | IV-01 excluded on C3 alone. Single-condition replacement for CAT-24N, which fails two conditions. Pairs with `CAT-24P` | WP5 | H |
| MP-28 | IV-01 | Payment terminal with a tamper-responsive enclosure around multiple discrete components | named example | Candidate; physical payment terminals are named in the description. Pairs with `MP-27` | WP5 | H |

## Coverage summary

| Family | Cases |
|---|---|
| A. Scope, connectivity and market activity | 8 |
| B. Exclusions | 10 |
| C. Product boundary | 8 |
| D. Core function versus feature | 11 |
| E. Annex III candidates | 10 |
| F. Annex IV (critical) candidates | 8 |
| G. Economic role | 6 |
| H. Lifecycle and timeline | 10 |
| I. Open source | 3 |
| J. Engine properties (meta-cases) | 8 |
| K. Overlap with the AI Act | 6 |
| L. Per-category coverage (minimal pairs) | 52 |
| M. Cases from real product shapes | 6 |
| N. Cases from the official FAQ | 10 |
| O. Adjacent regimes that do not exclude | 5 |
| P. Condition-level minimal pairs (WP5) | 28 |
| **Total** | **189** |

All 11 v4 IDs are preserved: `RAT-01…04`, `WTR-01…03`, `LIFE-01…03`, `SRC-01`,
`OTHER-01`. AC-05 references these by name.

## Minimal pairs

The pairs that carry the most weight, each differing in one decisive fact:

- `RAT-01` / `RAT-02` — pest monitoring vs home security core function
- `LOCK-01` / `LOCK-02` — residential vs commercial context
- `CORE-01` / `CORE-02` — camera as observation vs as security function
- `EXC-02` / `EXC-03` — hygiene vs medical intended purpose
- `WTR-01` / `WTR-02` — meter vs gateway functions
- `A3-05` / `A3-06` — same toy, assessment date either side of a referenced instrument's repeal
- `A4-02` / `A4-06` — water gateway via the gateway limb vs via the cryptoprocessing limb
- `A4-02` / `A4-04` — water vs gas/heat gateway, identical technical functions (isolates the energy-carrier question)
- `A4-01` / `A4-02` — electricity vs water, identical technical functions
- `CORE-03` / `CORE-05` — component does not create a class vs extra features do not remove one
- `BND-01` / `BND-02` — integrated vs separately marketed
- `LIFE-04` / `LIFE-05` — routine vs functionally extending update
- `LIFE-05` / `LIFE-08` — substantial via changed intended purpose (limb b) vs via Annex I compliance (limb a, undecidable in MVP)
- `OSS-01` / `OSS-02` — non-commercial vs commercial activity
- `SCP-02` / `SCP-03` — fact FALSE vs fact UNKNOWN
- `BND-06` / `BND-07` — identical spare part vs improved specification
- `TYPE-01` / `TYPE-02` — units of one product type, placed either side of 11-12-2027
- `EXC-09` / `EXC-10` — dual-use vs exclusively defence
- `OWN-01` / `OWN-02` — internal tools before and after being offered separately
- `TEST-01` / `TEST-02` — testing release with and without the Art. 4(3) conditions
- `MET-05` / `MET-06` — same unresolved category, product outside vs inside its exclusion gate
- `CORE-05` / `CORE-07` — extra features keep the class vs capability without core function does not create it

## Terminology trap: three meanings of "critical"

The word is overloaded, and conflating the senses is a predictable user error:

1. **CRA Annex IV "critical products with digital elements"** — a closed list of product
   categories, decided by core functionality (Art. 7(1)/8(1), B2 recital 2).
2. **Critical infrastructure / critical entities** — NIS 2 (Dir. 2022/2555) and the CER
   Directive. Attaches to the **operator**, not the product, and is a different law with a
   different addressee.
3. **"Critical" as everyday emphasis** — important, high-stakes, safety-relevant.

Deployment in critical infrastructure is a **risk-assessment** input under the CRA, never a
classification input. B7 §3.4 makes this explicit with two VPN versions — one for a
critical-infrastructure environment, one residential: both remain the same Annex III
category, and what differs is how the essential requirements are implemented. The guidance
likewise treats critical-infrastructure deployment as a threat-modelling question
(nation-state actors, APTs) rather than a category question.

**UX consequence:** never show the bare word "critical" in a result. Write "Annex IV
critical product category" in full, and add a "this is not the same as critical
infrastructure" note wherever the outcome is shown. Covered by `A4-05`.

## Before these become fixtures

Per v4 §7.1 each fixture needs: input facts, confirmed source citations, expected
statuses, the points experts must decide, and a reviewer ID. Two further constraints:

1. **Confidentiality.** RAT and WTR derive from two real companies. Publishing them as
   public test cases needs explicit consent, and the Annex C data request would make them
   more identifiable, not less. Consider a de-identified public variant plus a private
   fixture.
2. **Verification, not endorsement.** Under DR-04 these fixtures test consistency with the
   official text and with each other. They do not establish legal correctness, and the tool does
   not claim it. The criterion that matters is AC-02: never be confidently wrong in the
   permissive direction, because that is the only way this tool can harm a user.

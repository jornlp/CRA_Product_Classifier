# Validation case catalogue

Per DR-01 this restores the v3 ambition of 50+ representative cases plus minimal pairs,
built around v4's existing IDs rather than replacing them.

## How to read this

**Every expected outcome below is a `HYPOTHESIS` — a validation expectation, not a legal
determination.** v4 §4 says this explicitly about its own two company cases, and it holds
for all of these. Status becomes `R` (reviewed) only when a named legal reviewer signs off
the expected outcome, per the §8.2 Definition of Done.

The "decisive fact" column is the point of the catalogue: most cases exist to be a
**minimal pair** with a sibling, differing in exactly one legally relevant fact. A case
that cannot name its decisive fact is probably not earning its place.

Shorthand: `cat. III-I-17` = Annex III Class I category 17 (smart home products with
security functionality, per B2 Annex I nr. 17); `cat. IV-2` = Annex IV category 2
(smart-meter gateways, per B2 Annex II nr. 2). Exact wording must be verified against
B1/B2 on every release — the match depends on the official text, not on our paraphrase.

Legend — Status: `H` hypothesis, `R` legally reviewed. Source: `v3` from
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
| EXC-07 | Avionics product within scope of Reg. 2018/1139 but **not** certified under it | certification, not scope | Art. 2(3) excludes only products *certified in accordance with* 2018/1139 — scope alone is not enough | new | H |
| EXC-08 | Sectoral rules claimed to cover the Annex I risks | Art. 2(5) delegated act | No exclusion unless a delegated act under Art. 2(5) actually says so; absence of an act is not an exclusion | new | H |

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
| AI-01 | In-scope product that is also a high-risk AI system under Art. 6 of Reg. 2024/1689, `DEFAULT` class | high-risk AI status | CRA class unchanged; conformity route is the AI Act's Art. 43 procedure (Art. 12(2)) | new | H |
| AI-02 | Same, but the product is an Annex III important product under Art. 32(2)(a)/(b) or 32(3) | class + AI Act internal-control route | Art. 12(3) derogation: CRA conformity procedures apply for the CRA essential requirements | new | H |
| AI-03 | Same, but an Annex IV critical product | class + AI Act internal-control route | Art. 12(3) derogation applies | new | H |
| AI-04 | Product embeds an AI component but its core function is not that of a high-risk AI system | AI as component | No change to class or route; the component rule applies as elsewhere | new | H |

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

Derived from the kinds of products this tool will actually be used on — industrial and B2B
rather than consumer smart home. These replace invented scenarios with shapes that will really
arrive. No specific company or product is identified.

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
| CAT-03N | III-I-03 | Notes application with one encrypted field, no password generation, sharing or application integration | fails at least one decisive condition | category excluded, with the failing condition recorded | new | H |
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

## Coverage summary

| Family | Cases |
|---|---|
| A. Scope / connectivity | 8 |
| B. Exclusions | 8 |
| C. Product boundary | 8 |
| D. Core function vs feature | 10 |
| E. Annex III | 10 |
| F. Annex IV | 8 |
| G. Economic role | 6 |
| H. Lifecycle / timeline | 8 |
| I. Open source | 3 |
| K. AI Act overlap | 4 |
| L. Per-category coverage | 52 |
| M. Real user-group products | 6 |
| J. Engine properties | 8 |
| **Total** | **139** |

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
2. **No reviewer yet.** Every row is `H`. Until a legal reviewer signs expected outcomes,
   these fixtures test self-consistency and determinism — not legal correctness.

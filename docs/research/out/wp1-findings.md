# WP1 — first findings

Date: 2026-10-12. Status of every finding below: `QUOTE_UNVERIFIED` — retrieved from
level-4 mirrors, not yet checked against EUR-Lex. See the operational problem in §6.

## 1. The water-meter case has a textual answer, not just a review flag

v4 §4.2 said the water gateway question "requires explicit legal review". It does, but we
now know what the review is about. The 2025/2392 Annex II item 2 description ends:

> This category includes but is not limited to smart meter gateways related to smart
> metering systems measuring electricity as defined in Article 2(23) of Directive (EU)
> 2019/944. It may also include smart meter gateways used in other smart metering systems
> measuring consumption of **other sources of energy such as gas or heat**, provided that
> the gateway meets this description.

Three things follow:

- The anchor is **electricity** — Directive (EU) 2019/944 is the electricity internal
  market directive, and its Art. 2(23) definition is about measuring electricity fed into
  and drawn from the grid.
- The category is **explicitly extended** to gas and heat, framed as *other sources of
  energy*.
- **Water is not an energy source** and is not named.

So on the plain text, a water-meter gateway appears to fall outside the smart-meter-gateway
limb of IV-02 — a stronger and more useful position than "unclear". The open question is
whether the gas/heat wording is exhaustive or illustrative.

**But there is a second route in.** The Annex IV category 2 *title* has a second limb —
"and other devices for advanced security purposes, including for secure cryptoprocessing"
— and the retrieved technical description covers only the gateway limb. A water gateway
doing crypto, firewalling and device control might match that second limb instead. Whether
2025/2392 describes it at all is the single most important open question in the inventory,
because it decides the WATER company case.

**Action:** do not write the IV-02 rule until the second limb is resolved.

## 2. The core-functionality test is legally grounded, not a design choice

Recital 2 of 2025/2392:

> Pursuant to Article 7(1) and Article 8(1) of Regulation (EU) 2024/2847, the core
> functionality of a product with digital elements determines whether that product meets
> the technical description of a category […] and therefore the applicable conformity
> assessment procedures.

v4's insistence on fixing core functionality before Annex matching is a direct reading of
Art. 7(1)/8(1). That upgrades it from house style to a citable rule, and it means the
`PRODUCT_CORE_FUNCTION` fact genuinely is decisive in the §5.2 sense.

## 3. Recital 4 cuts both ways — and we had only modelled one direction

> The fact that a product performs functions other than or additional to those detailed in
> the technical descriptions […] does not in itself mean that the product does not have the
> core functionality of a product category […] such as an operating system integrating
> browser functionality, or a router integrating firewall functionality.

v3 and v4 both encode "a component does not create a class" (Linux, crypto, camera). Recital
4 states the **converse**: extra functions do not *destroy* a class. A product whose core
function matches a category keeps that category even with unrelated features bolted on.

Our catalogue tested the first direction thoroughly and the second not at all. `CORE-03`
(Linux + TLS in an irrigation timer) tests "component ≠ class". Nothing tested "extra
features ≠ escape". That is a coverage gap in the fixture set, and it is the direction a
manufacturer has an incentive to argue.

**Action:** add minimal pairs for the converse — WP5.

## 4. Category III-I-17 confirmed, with four decisive conditions

> Products with digital elements that protect the physical security of consumers in a
> residential setting and which can be controlled or managed remotely from other systems,
> as well as hardware and software that centrally control such products. This category
> includes but is not limited to smart door locking devices, baby monitoring systems,
> alarm systems and home security cameras.

Conditions: (a) protects physical security of consumers, (b) residential setting, (c)
remotely controllable or manageable, or (d) centrally controls such products.

Consequences for existing cases:

| Case | Effect |
|---|---|
| `LOCK-01` | Smart door locking devices are named in the description. Strong match — hypothesis holds |
| `LOCK-02` | "Residential setting" is an express condition, so an office-access variant has a textual basis for not matching |
| `RAT-01` | Pest monitoring protects neither the physical security *of consumers*; supports the `DEFAULT` hypothesis |
| `RAT-02` | Marketed as home intruder monitoring — conditions (a)(b)(c) plausibly all met |
| `CORE-02` | Video doorbell sits close to "home security cameras" |

Limb (d) — "hardware and software that **centrally control** such products" — is new to our
model. A home-automation hub that controls a smart lock may be in the category on its own
account. Nothing in the catalogue tested a hub.

**Action:** add a hub case.

## 5. Dates confirmed

2025/2392 adopted 28 Nov 2025, published in the OJ 1 Dec 2025, entering into force on the
twentieth day after publication (21 Dec 2025, by calculation from Art. 3 — one commentary
says 1 Dec, so verify). This matters because rules must cite a law version, and assessments
dated before 21 Dec 2025 would not have had these technical descriptions available.

## 6. Operational problem for WP1

**EUR-Lex returns empty response bodies to automated fetching.** Both the ELI route
(`eur-lex.europa.eu/eli/reg/2024/2847/oj/eng`) and the CELEX HTML and PDF routes returned
nothing on 2026-10-12. Everything above comes from third-party mirrors, which sit at level 4
of the v3 source hierarchy — below independent sites, and far below where a rule citation
needs to be.

This is not a minor inconvenience: the Definition of Done requires the exact official
provision and source version, and we currently have no automated path to it.

Options: manual download of the OJ PDFs into `docs/legal/sources/` with recorded hashes
(preferred — it also gives reproducibility, which AC-09 needs); the EUR-Lex SPARQL/REST
API; or the Publications Office bulk data service.

**Until that is done, no rule may be written.** Every quotation above is a candidate.

## What this changed in the plan

- `A4-02` (water gateway) is no longer purely an expert-review flag; it has a textual
  argument and one blocking open question.
- Added `A4-04` — gas or heat gateway, expressly covered. Pairs against `A4-02` to isolate
  the energy-carrier question with everything else held constant.
- Two coverage gaps identified for WP5: the recital 4 converse, and limb (d) central
  control.
- 24 of 26 technical descriptions still unretrieved. AC-03 cannot be met until they are.

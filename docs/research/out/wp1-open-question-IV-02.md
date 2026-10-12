# Open question IV-02 — the second limb of Annex IV category 2

This doubles as the brief to send a legal reviewer, a national authority or the ORC WG.
It is written to be readable without the rest of the project.

## The question

CRA Annex IV, category 2, verbatim (B1 consolidated 000.003, p. 72):

> Smart meter gateways within smart metering systems as defined in Article 2, point (23) of
> Directive (EU) 2019/944 **and other devices for advanced security purposes, including for
> secure cryptoprocessing**

Commission Implementing Regulation (EU) 2025/2392, Annex II item 2, gives a technical
description covering **only** smart meter gateways. It describes no "other devices for
advanced security purposes".

**Does the second limb operate independently as a category of critical products?**

## Why it is genuinely open

**For independent operation.** Art. 8(1) anchors the binding test on products having "the
core functionality of a product category that is set out in **Annex IV**" — on the Annex,
not on the implementing act. Art. 7(4) only directs the Commission to *specify* technical
descriptions. On that reading the limb is part of the binding category whether or not it is
described, and *effet utile* argues against reading a limb of an enacted text as inoperative.

**Against.** Read *ejusdem generis*, "other devices" means other devices of the same kind
within smart metering systems, which is why the Commission saw nothing further to describe.
Systematically, a broad reading would swallow much of Annex IV category 1 (Hardware Devices
with Security Boxes) and category 3 (smartcards and secure elements), which already cover
tamper-resistant cryptographic hardware — an incoherent result.

## Argument from the technical meaning of "secure cryptoprocessing"

Raised 2026-10-12, and it materially strengthens the independent-operation reading.

**Secure cryptoprocessing is a term of art for dedicated, tamper-resistant cryptographic
hardware** — hardware security modules, secure cryptoprocessors, TPMs, secure elements. It is
not a description of what a metering gateway is. A gateway is a communications product.

B2's own gateway description says gateways "protect data and information flows by supporting
specific cryptographic needs, such as encryption and decryption of data". That is *using*
cryptography, which almost any connected product does. It is not *being* a secure
cryptoprocessor.

If that holds, the *ejusdem generis* reading collapses: "other devices ... for secure
cryptoprocessing" cannot mean "other devices of the same kind as metering gateways", because
metering gateways are not of that kind. Reading words of an enacted text as meaningless cuts
against *effet utile*. **This is the best argument yet for the limb operating independently.**

### But it does not finish the job

Under the independent reading the limb is *still* largely redundant, now against its
neighbours rather than against the gateway limb:

- **Annex IV category 1**, Hardware Devices with Security Boxes, expressly covers "hardware
  security modules that generate and manage cryptographic elements".
- **Annex IV category 3**, smartcards and secure elements, covers secure elements designed to
  at least AVA_VAN.4, including TPMs.

So the content the limb would carry is already in categories 1 and 3. The phrase is redundant
under *both* readings — which may be exactly why the Commission described neither limb of it.

### Working hypothesis: a drafting remnant

This fits the travaux signal. Secondary reproductions of COM(2022) 454 show the proposal's
critical list containing secure elements, hardware security modules and **secure
cryptoprocessors** as separate entries. If those were consolidated into what became categories
1 and 3 during negotiation, this trailing phrase is plausibly a remnant that was not cleaned
up — formally part of category 2, substantively relocated elsewhere.

That hypothesis is testable against the official COM(2022) 454 and the Council and Parliament
positions, and it is now the first thing to check.

### Consequence for the engine, if the hypothesis holds

The residual gap is narrow but not empty: a device whose core functionality is secure
cryptoprocessing, yet which is *neither* a multi-component product with a tamper-resistant
physical envelope (category 1) *nor* a secure element at AVA_VAN.4 (category 3) — for example
a crypto accelerator without a tamper envelope. Such a product is the only real beneficiary of
the second limb. Everything else it would catch is caught anyway.

## What has been checked and found silent

| Source | Result |
|---|---|
| CRA, consolidated 000.003 | The phrase occurs **once**, in Annex IV. No recital, no article |
| Impl. Reg. (EU) 2025/2392 | Describes only smart meter gateways; no recital on the limb |
| Commission guidance C(2026) 5252, 27.7.2026 (84 pp) | No occurrence; "water" appears zero times |
| Official CRA FAQ (66 pp) | No hit for "cryptoprocessing", "smart meter" or "water" |

Further reading of these four will not resolve it.

## Will harmonised standards resolve it? No

Raised 2026-10-12, and worth recording because it is a natural assumption.

Art. 27(1) is explicit about what harmonised standards do:

> Products with digital elements and processes put in place by the manufacturer which are in
> conformity with harmonised standards … shall be presumed to be in conformity with the
> **essential cybersecurity requirements set out in Annex I** covered by those standards

And the standardisation request the Commission must make under Art. 27(1) is "for the
**essential cybersecurity requirements set out in Annex I**".

Harmonised standards therefore answer *how do I satisfy the requirements*, not *which category
is my product in*. Classification runs on a different track entirely: Art. 7(1) and 8(1) fix
the test (core functionality against a category set out in Annex III or IV), and Art. 7(4)
empowers the Commission to specify the technical descriptions. Standards have no role in it.

For critical products the consequence likewise runs through certification, not standards:
Art. 8(1) hangs the certificate requirement on European cybersecurity certification schemes
adopted under Regulation (EU) 2019/881.

**The instruments that could actually resolve it**

- An **amended or further implementing act under Art. 7(4)** — the natural vehicle, since that
  is the power under which the missing technical description would be written.
- A **delegated act under Art. 8(2)** amending Annex IV by adding or withdrawing categories —
  which could simply remove the remnant if that is what it is.
- The **adopted** Commission guidance (the version we hold is still a draft) — non-binding but
  in practice decisive for most manufacturers.
- Ultimately the CJEU.

**One indirect route worth watching.** Scoping work for standardisation does force people to
delimit product categories in practice. It is plausible that the question surfaces there and
prompts a clarification — but the clarification would come as one of the instruments above,
not in the standard itself.

## Routes, cheapest first

### 1. Compare the other language versions
All 24 language versions are equally authentic, and comparing them is standard CJEU method
where one version is ambiguous. The ambiguity here is **syntactic**: does "within smart
metering systems as defined in Article 2(23) of Directive (EU) 2019/944" govern only "smart
meter gateways", or both limbs?

Languages with case marking or stricter word order will disambiguate where English cannot.
German is the most informative; French and Dutch are worth having too.

Fetch Annex IV of 2024/2847 in DE, FR and NL. If the versions agree, that is a strong
answer. **If they diverge, that is itself a decisive finding** and should go straight to the
Commission.

Cheapest route, doable in-house, no lawyer required to gather the evidence.

### 2. Travaux préparatoires
COM(2022) 454 (procedure 2022/0272(COD)), plus the Council general approach and the
Parliament position.

Secondary reproductions of the 2022 proposal's critical-products list show items such as
secure elements, hardware security modules and **secure cryptoprocessors**, with no smart
meter gateway entry. If that holds against the official text, the second limb descends from
a **crypto-hardware lineage** that was merged into the gateway item during negotiation —
which would support independent operation, and would also explain the overlap with
categories 1 and 3.

Verify against the official EUR-Lex text, not the mirrors.

### 3. The 2025/2392 consultation record
Have Your Say initiative **14449**, 13 March – 18 April 2025, 122 submissions. Two things to
look for: whether the **draft** contained a description of the second limb that was later
dropped, and whether any submission raised the gap.

### 4. Ask, in writing
- **ORC WG CRA Hub** — public issue tracker; an answer there is citable as documented expert
  interpretation (level 3) and is public, which has its own value.
- **National market surveillance authority** — Belgium (FPS Economy) or the Netherlands
  (RDI). They will enforce this; a written answer outranks commentary.
- **The Commission**, if 1–3 leave it open. Slowest, most authoritative.

### 5. The reviewer's own reasoned opinion
Once 1–3 are in, a named legal reviewer records the reading, the canons relied on
(*effet utile* against *ejusdem generis* and systematic coherence), and the residual
uncertainty. That is what the Definition of Done requires; it does not require certainty.

## What the engine does meanwhile — and probably permanently

This is **not** blocked on the answer, because the safe behaviour is the same either way:

- Category IV-02 stays `candidate-rule-blocked`; no rule is enabled.
- A product meeting the gateway conditions but not tied to electricity, gas or heat returns
  `UNRESOLVED` with a reviewer flag — never `DEFAULT`, and never `CRITICAL`.
- Case `A4-06` tests the limb directly; `A4-02`/`A4-04` isolate the energy-carrier question.

Even if the limb is held to operate independently, "advanced security purposes" is the kind
of condition a user cannot answer reliably from a datasheet. This category may be a
permanent `NEEDS_EXPERT_REVIEW` regardless of how the law is read — which is worth deciding
deliberately rather than discovering later.

## Practical scope of the problem

Narrow. The limb only bites for a product that (a) has a core functionality of advanced
security purposes or secure cryptoprocessing, and (b) is not already caught by Annex IV
category 1 or 3, which cover security boxes, HSMs, secure elements and smartcards. Those two
categories absorb most hardware of this kind — which is simultaneously an argument for the
narrow reading and a reason the practical gap is small.

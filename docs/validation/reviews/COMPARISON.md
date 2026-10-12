# Reviewer comparison — 142 blind classifications against our expectations

Review returned 12 October 2026. The reviewer saw scenarios only: no case IDs, no grouping, no
expected outcomes.

> **Read `PROVENANCE.md` first.** The reviewer was an LLM, not a qualified legal reviewer. The
> agreement figures below are a consistency check between two model readings of the same corpus,
> not independent validation — correlated errors are exactly what they fail to break. Findings
> survive only where verified against the official text; interpretive points revert to
> hypotheses. No case leaves `HYPOTHESIS`, and AC-01 is not satisfied.

## Headline

Agreement is high. On the 52 per-category minimal pairs — the cleanest comparison, because each
has one intended answer — **50 of 52 match**. The two that do not are defects in our scenario
wording, not in our conditions.

All 14 cases the reviewer put `OUT` of scope match our expectations: own-use tools, no EU market
activity, same-spec spare parts, exclusively-defence, MDR/IVDR products, air-gapped devices,
non-commercial open source, standalone SaaS, archived versions.

## Where the reviewer flagged something, and we checked it ourselves

### 1. The residential condition is not exclusive (`LOCK-03`, `LOCK-04`)

We expected `CONFLICTING` plus a review flag for a smart lock marketed for both home and office
use, and for one marketed "residential and Airbnb". The reviewer classified both `IMPORTANT_I`:

> Express home use supports residential smart-lock classification I.17; office use in addition
> does not negate it.

That is a better reading than ours. III-I-17 requires use in a residential setting; it does not
require that use to be *exclusive*. Marketing that claims home use satisfies the condition, and
additional commercial use does not remove it — which is the same logic as recital 4, that extra
functions do not destroy a core functionality, applied to context rather than function.

**Recommendation:** change `LOCK-03` and `LOCK-04` from `CONFLICTING` to a positive match, and
add the non-exclusivity point to the III-I-17 conditions. `CONFLICTING` should be reserved for
evidence that genuinely contradicts itself, not for a product with two markets.

This also reaches `RESIDENTIAL_SETTING` in the fact register, whose `BOTH` answer we treated as
a problem. It is not; it is a yes.

### 2. A USB-only data path settles scope (`SCP-04`)

We expected a targeted follow-up question. The reviewer answered `IN` / `DEFAULT` directly:

> Digital data exchanged via USB to a PC suffices for Article 2(1); no network protocol stack is
> necessary.

Correct, and our expectation was too timid. Art. 2(1) with Art. 3(9) covers a *physical* data
connection. Once USB data exchange is established there is nothing left to ask. Firm this up.

### 3. Our positive cases under-specify their conditions (`CAT-18P`, `CAT-24P`, `CORE-02`)

The reviewer returned `UNRESOLVED` on three positives where we expected a match, each time
because the scenario did not state every condition:

- "Connected toy with a microphone and speaker" — does not establish communication on the public
  Internet, nor coverage by the toy legislation.
- "Hardware security module generating and managing cryptographic elements" — does not state
  multiple discrete components or a tamper-protective envelope.
- "Video doorbell marketed for intruder detection" — does not establish a residential setting or
  remote manageability.

They were right to refuse to assume. **A positive fixture must state every condition of the
category it is meant to match**, or it is testing the reviewer's willingness to fill gaps rather
than the rule. Ours were written as illustrations and reused as tests.

## Where we think the reviewer is wrong — and it matters

### 4. `DEFAULT` reached from a partial sweep (`WTR-01`, `A4-02`)

Both were answered `DEFAULT` with reasoning that addresses **only Annex IV category 2**:

> A water-consumption meter is not a smart-meter gateway; mere measurement and transmission do
> not match Annex II.2.

The conclusion may well be right — our own worked example reaches `DEFAULT` for `WTR-01` — but it
was reached by excluding one category, not twenty-six. That is precisely the failure AC-03
exists to prevent, and it is the strongest evidence yet that the blocking rule is worth having:
**an experienced reviewer, working carefully, still concluded `DEFAULT` from a partial sweep.**

Not a mark against the reviewer so much as against the format: nothing in the worksheet asked
them to enumerate exclusions. A tool that does ask is doing something a human reasonably skips.

### 5. The second limb went unaddressed (`A4-02`, `A4-06`)

`A4-02` is the water gateway with the full set of gateway functions. The reviewer's note deals
with the metering-gateway limb and concludes `DEFAULT`. It does not mention the second limb of
the category — "other devices for advanced security purposes, including for secure
cryptoprocessing" — which is the entire open question.

So the answer resolves a narrower question than the one posed. This needs to go back with the
limb quoted explicitly, because a `DEFAULT` that silently skips it is exactly the outcome our
exclusion gate is designed to avoid.

## Reviewer self-consistency

Four pairs described the same product in different words. Three were answered identically. One
diverged:

| Pair | Answers |
|---|---|
| Residential smart lock | `IN`/`IMPORTANT_I` both times — consistent |
| Electricity meter gateway | `IN`/`CRITICAL` both times — consistent |
| Water consumption meter | `IN`/`DEFAULT` both times — consistent |
| **Rat-trap camera** | `IN`/`DEFAULT` once, **`UNRESOLVED`/`DEFAULT`** the other |

The divergence is on *scope*, and it tracks the wording: one version stated an external data
connection, the other did not. The class answer was stable across all four. That is reassuring
about the classification logic and a warning about scope: scope answers are sensitive to whether
connectivity is stated, which is also where our own scenarios were sloppiest.

## What does not need action

Twenty-four cases where the reviewer answered `UNRESOLVED` while our expectation looks definite
are not disagreements. Our expectation in those rows is about engine *behaviour* — which question
to ask next, which reason to record — not about a class. Where a scenario describes a role or a
boundary without describing what the product does, `UNRESOLVED` is the right class answer and we
agree.

## Actions

1. Change `LOCK-03` and `LOCK-04`; add non-exclusivity to the III-I-17 conditions and to
   `RESIDENTIAL_SETTING`.
2. Firm up `SCP-04` to resolve rather than ask.
3. Rewrite `CAT-18P`, `CAT-24P` and `CORE-02` to state every condition. Audit the other positives
   for the same defect.
4. Return `A4-02` and `A4-06` to the reviewer with the second limb quoted, asking specifically
   about it.
5. Keep the AC-03 blocking rule, and cite `WTR-01` as the evidence for why it exists.

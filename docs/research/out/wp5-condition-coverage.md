# WP5 — condition-level coverage audit

**Done-when (WP-PLAN):** every decisive condition in WP1 has at least one positive case, one
negative case, and one minimal pair. Section L met this per *category* (one P, one N each).
This audit checks it per *condition*, which is what a rule engine evaluates.

Status: DRAFT, authored by the same person and LLM as WP1. Every new case cites the verbatim
B2 wording it turns on; none is a legal determination (DR-04).

## Method

Each of the 76 conditions in `wp1-category-inventory.json` was classified against the verbatim
technical description:

| Logic type | What coverage requires |
|---|---|
| **Required** (conjunct) | a negative that fails this condition and no other |
| **Alternative limb** (disjunct) | a positive that meets the category through this limb alone |
| **Descriptive** ("typically", "including activities such as", notes) | a positive that *lacks* it, proving the engine does not treat it as required |
| **Overridden by inclusion list** | a positive for the named product type that lacks the condition |

Existing cases were then mapped to the condition they actually turn on.

## Findings

**1. Wording that is not a condition was being treated as one (2 categories).**
III-I-02 (browsers: "typically include … script execution") and III-I-03 (password managers:
"including activities such as generation …"). `CAT-03N` excluded a notes app *because* it lacked
generation and sharing. That reasoning would also exclude a plain password vault, which is a
password manager. `CAT-03N` keeps its outcome but is re-reasoned on core functionality
(now `AUTHOR_INTERPRETATION`); `MP-01` and `MP-02` guard the point.

**2. Inclusion lists override two conditions as worded.**
III-I-06 requires monitoring *and* controlling, yet names "dedicated configuration management
systems". III-I-08 requires selecting boot options, yet names "single-stage … boot loaders". A
rule written from the conditions alone would exclude products the text expressly includes —
the confidently-wrong-in-the-permissive-direction failure AC-02 forbids. `MP-04`, `MP-07`.

**3. Two negatives were not minimal.** `CAT-24N` (IV-01) and `CAT-26N` (IV-03) each fail two
conditions, so a passing test cannot show which condition the engine used. `MP-27` and `MP-26`
isolate one condition each. The originals stay as broader regression cases.

**4. Eight alternative limbs had no positive.** Malware removal without detection, virtual
network interfaces, toy location tracking, children's wearables, container runtimes, IDS
without prevention, and both modem and switch qualifiers. All now covered.

**5. Fallback paths were untested.** Failing a Class II or critical category does not mean
DEFAULT: `MP-24` (III-II-04 → III-I-14) and `MP-26` (IV-03 → III-II-04) test that the engine
falls to the next category, not to DEFAULT.

**6. Three genuine open questions surfaced** and are recorded as such, not resolved:
Bluetooth-only proximity control as "remotely from other systems" (`MP-14`); multi-host
orchestrators as "container runtime systems" (`MP-21`); and SoCs between the microprocessor
and microcontroller definitions (`MP-12` — harmless for the class, since both are Class I).

## Coverage after this pass

| Category | Conditions | Logic | Single-condition cases |
|---|---|---|---|
| III-I-01 | 3 | C1 OR C2; C3 a sub-variant | CAT-01P/N |
| III-I-02 | 2 | C1 required; C2 descriptive | CAT-02N (C1), MP-01 (C2) |
| III-I-03 | 2 | C1 required; C2 illustrative | CAT-03N (C1), MP-02 (C2) |
| III-I-04 | 2 | C1 OR C2 | CAT-04P (C1), MP-03 (C2), CAT-04N |
| III-I-05 | 1 | required | CAT-05P/N |
| III-I-06 | 2 | C2, with C1 overridable | CAT-06N (C2), MP-04 (C1) |
| III-I-07 | 3 | all required | CAT-07N (C2), MP-06 (C1), MP-05 (C3) |
| III-I-08 | 3 | C1, C2 required; C3 overridable | CAT-08N, MP-07 (C3) |
| III-I-09 | 3 | C1 AND (C2 OR C3) | CAT-09P/N, MP-08 (C3) |
| III-I-10 | 3 | C1 AND (C2 OR C3) | CAT-10P (C2), MP-09 (C3), CAT-10N |
| III-I-11 | 2 | all required + core function | CAT-11P/N |
| III-I-12 | 3 | limbs, each qualified | CAT-12P/N, A3-02, MP-10, MP-11 |
| III-I-13 | 3 | all required | CAT-13P/N (C3), MP-12 (C1 boundary) |
| III-I-14 | 3 | all required | CAT-14P/N (C3), MP-24, MP-12 |
| III-I-15 | 3 | (C1 OR C2) AND C3 | CAT-15P/N |
| III-I-16 | 3 | all required | CAT-16N (C1/C2), MP-13 (C3) |
| III-I-17 | 4 | C1 AND C2 AND (C3 OR C4) | RAT/LOCK/CORE series, MP-14 (C3, open) |
| III-I-18 | 3 | C1 AND C2 AND (social OR location) | CAT-18P/N, MP-15, MP-16 (C1), MP-17 (C2) |
| III-I-19 | 4 | (C1 AND C2 AND C3) OR C4 | CAT-19P/N (C3), EXC-01..03, MP-18 (C4), MP-19 (C2) |
| III-II-01 | 2 | C1 OR C2 | CAT-20P (C1), MP-20 (C2), CAT-20N, MP-21 (open) |
| III-II-02 | 4 | C1 OR C2 OR C3; C4 a note | CAT-21P/N, A3-01, MP-22 (C2), MP-23 |
| III-II-03 | 3 | all required | CAT-22P/N (C2) |
| III-II-04 | 3 | all required | CAT-23P/N (C3), MP-24, MP-25 (boundary) |
| IV-01 | 3 | all required | CAT-24P, MP-27 (C3), MP-28, CAT-24N (broad) |
| IV-02 | 5 | all required; second limb open | WTR/A4 series, CAT-25P/N |
| IV-03 | 4 | C1 AND C3; C2 descriptive; C4 sub-type | CAT-26P, MP-26 (C3), MP-25, CAT-26N (broad) |

## Remaining gaps

Not every required condition has its own single-condition negative yet. The ones still
covered only by a negative that fails several conditions at once are III-II-03 C1/C3,
III-I-15 C1/C2, III-I-11 C1, III-I-01 C3 and IV-01 C1/C2. These carry less risk because the
conditions are hard to fail one at a time in a real product. They are logged here rather than
filled with artificial cases.

**The inventory's condition lists have not been rewritten.** Findings 1 and 2 are recorded as
`wp5_condition_logic` notes on each category, so the text stays traceable to what the review rounds
saw. The rule author must read those notes. A condition list read on its own gets III-I-03, 06
and 08 wrong.

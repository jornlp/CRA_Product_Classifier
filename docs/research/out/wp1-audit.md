# WP1 — self-audit

Critical review of WP1's own output, 2026-10-12. Written because the research phase is only
worth running if its mistakes surface before rules are written.

## Closed since the last pass

| Item | Outcome |
|---|---|
| Category titles taken from B2's column, unverified | **Verified** against B1 Annex III (p.71) and Annex IV (p.72). All 26 match |
| The "no industrial-use condition" correction to v3/v4 | **Confirmed.** B1 Annex III Class II item 2 is "Firewalls, intrusion detection and prevention systems", no qualifier |
| Partial transcriptions of III-I-15 and IV-03 | **Fixed.** Both now complete |
| B2 entry into force inferred from a mirror | **Verified** from the official text: Art. 3, twentieth day after publication → 21 Dec 2025 |
| Category tally 26 vs 28 | **26**, counted from the official annexes |
| Issue 6 — scope and timeline provisions unextracted | **Largely closed.** Art. 1, 2, 3, 7, 8, 13, 14, 32, 69, 71 extracted into `wp1-provisions.json`, 176 sentences verified verbatim |

The IV-03 fix matters beyond tidiness: my shortened version said "designed to provide
protection of AVA_VAN.4" where the text says "**at least** AVA_VAN.4", and dropped
"cryptographic operations or" from the list of what secure elements handle. Both would have
produced a wrong rule. Elision introduced errors that the flag caught — but only because the
flag was there.

## Issue 0 — the catalogue does not cover the Annex

Measured 2026-10-12 by mapping catalogue case IDs against the category inventory:

| | |
|---|---|
| Cases | 81 |
| Categories with **no** case referencing them | **21 of 26** |
| Categories with decisive conditions extracted | **2 of 26** |

The 81 cases cluster on the five categories v4 happened to name. Twenty-one categories —
identity management, browsers, password managers, anti-malware, VPN, SIEM, boot managers, PKI,
network interfaces, operating systems, microprocessors, microcontrollers, ASIC/FPGA, virtual
assistants, toys, hypervisors, tamper-resistant micros, security boxes, secure elements — have
verified official descriptions and nothing testing them.

The catalogue is broad across **engine behaviour** (scope, boundary, roles, timeline,
conflicts) and thin across **the Annex itself**. Both matter, but only one of them was counted.

**Fix.** Extract decisive conditions from the remaining 24 descriptions, then build a
conditions x cases matrix: every condition needs a positive case, a negative case and a
minimal pair. Gaps on one axis are untested law; cases mapping to no condition are candidates
for removal. That is the bulk of WP5, and it converts "81 cases" from a count into a justified
set.

**Note on how this was found.** Not by review — by a mechanical count that nobody had run.
Worth repeating on every release.

## Issue 1 — the WTR-01 sweep has a single assessor

All 26 verdicts in the worked example are one person's judgement, unreviewed. For a tool
whose entire value proposition is defensible classification, that is the weakest link in
the output.

**Second opinion needed, and it is the highest-value one available.** Have a second
assessor sweep the same 26 categories against the same facts, blind to the first result,
then compare. Disagreements are not failures — they are precisely the categories where the
decisive conditions need sharper questions. This is cheap, needs no legal qualification, and
directly produces WP5 material.

## Issue 2 — one rule carries eight of twenty-six verdicts

In WTR-01, categories 8, 10, 11, 12, 13, 14, 15 and IV-03 all resolve to "No" on the same
reasoning: a component does not confer its category on the product that embeds it.

This concentration is a single point of failure. If the reviewer disagrees with how we apply
it, a third of the sweep moves at once.

Mitigating: the rule now has a **statutory** anchor, not just guidance. FAQ v14 cites
**Art. 7(1)** directly — integrating an important or critical product into another product
does not automatically subject that product to the corresponding procedures. We had been
resting this on B2 recital 4 and FAQ §3.4 alone; Art. 7(1) is binding text.

Still: this rule deserves its own minimal-pair battery, more than any other.

## Issue 3 — a systemic question we have only met in one place

B1's Annexes give category **titles**. B2 gives **technical descriptions**. Art. 7(1) and
8(1) anchor the binding test on "the core functionality of a product category **set out in
Annex III / Annex IV**" — the Annex, while Art. 7(4) merely requires the Commission to
specify technical descriptions.

So what governs where a product matches the Annex title but not B2's description, or the
reverse? We hit this on IV-02's second limb, but it is a **general** engine design question
affecting all 26 categories, not a one-off.

The rule schema needs to represent title and description as separate, separately citable
conditions, rather than collapsing them into one predicate. Worth settling in WP7 before
any rule is written.

## Issue 4 — provenance of B3 and B7 is weaker than it looks

Both came from a GitHub repository, not from the Commission. For B1 and B2 we have
authentic OJ PDFs; for the guidance and FAQ we have mirrors.

- **B3** is `C(2026) 5252 final` — and specifically the annex to an act *approving the
  content of a draft Communication*. The published Communication may differ. v4 §3 flagged
  that its formal status needs checking; it still does, and now we also need to confirm the
  mirror matches the Commission original.
- **B7** exists in at least three versions in that repo: a PDF created 2.12.2025, plus
  Markdown v12 and v14. We quoted from the PDF. v14 contains the same §3.4 reasoning and
  adds the Art. 7(1) anchor, so it is at least as current — but we have not established
  which is authoritative, and v3 §2 explicitly calls the FAQ a *living source*.

**Action:** pin one FAQ version per rule-set release, record it in `law_version`, and
re-check on each release. Treat the mirrors as discovery, and verify any quotation that
ends up in a rule against the Commission's own copy.

## Issue 5 — we have not checked whether B1 is current

The held PDF is the original OJ of 20.11.2024. It is now October 2026. We have not checked
for corrigenda or a consolidated version, and we have not checked for delegated acts under:

- **Art. 2(5)** — limiting or excluding CRA application where sectoral rules achieve equal
  or higher protection
- **Art. 7(3)** and **Art. 8(2)** — amending Annex III / Annex IV by adding or withdrawing
  categories
- **Art. 8(1)** — requiring a European cybersecurity certificate for Annex IV products

The last of these bears directly on the WATER case: if an Art. 8(1) act exists, the
consequences of landing in Annex IV change materially. Until checked, every statement we
make about category coverage is "as at 21 Dec 2025", not "as at today".

## Issue 6 — unread provisions that later phases depend on *(largely closed)*

**Update.** `wp1-provisions.json` now holds Art. 1, 2, 3, 7, 8, 13, 14, 32, 69 and 71,
extracted **programmatically** from the OJ PDF — sliced between article headings, never
retyped — with all 51 Art. 3 definitions split out and numbered 1–51 with no gaps.
`verify_provisions.py` confirms 176 sentences appear verbatim in the source.

The extractor caught three of its own bugs on the first run, which is the argument for
having written it rather than transcribing by hand:

1. Art. 71 swallowed every annex, because the last article ran to end of file.
2. Footnote citations were being spliced into paragraph text.
3. Page furniture removed from the extract but present in the source made genuinely
   contiguous text fail the substring check — the verifier had to strip the same furniture.

Each of those would have been invisible in a hand transcription.

Still unread: Art. 3 definitions are captured but not yet mapped onto the fact model, and
`substantial modification` (3(30)) needs its own reading before the timeline sub-engine is
built.

### Original entry

Read so far: Art. 2, 3 (partially, definitions 1–18), 7(4), 8(1)–(2), 69, 71, Annex III,
Annex IV, and B2 in full.

**Not read:** Art. 7(1)–(3) in their own text (we have them only through the FAQ's
paraphrase), Art. 13 (manufacturer obligations), **Art. 14** (the reporting obligation whose
timeline we already model), Art. 32 (conformity assessment routes), and Art. 3 definitions
from (19) onward — which include `substantial modification` and `placing on the market`,
both load-bearing for the entire timeline family.

Modelling the Art. 14 timeline without having read Art. 14 is a gap worth closing before
the timeline sub-engine is built.

## Issue 7 — inventory schema gaps

- `not-covered` entries carry no **reason** field. AC-03 requires an explicit not-covered
  *status*; a bare flag will not satisfy a reviewer.
- There is no **JSON Schema** for this file, which v4 §5.3 requires for production output.
  It is currently ad-hoc JSON that rules will be generated from.
- `coverage` uses three values invented here (`not-covered`, `candidate-rule-drafted`,
  `candidate-rule-blocked`) with no defined state machine.

## Legal questions for the reviewer — consolidated

1. **IV-02 second limb.** Independently operative (Art. 8(1) anchors on Annex IV) or
   subsumed into the gateway description? Decides WTR-02, A4-02, A4-06.
2. **Gas/heat list.** Illustrative or exhaustive? Only matters under the narrow reading.
3. **IV-01 tachograph analogy.** Tachographs are expressly named; does a tamper-resistant
   meter with secure crypto storage fall within "Hardware Devices with Security Boxes"?
4. **Title versus description** where they diverge (Issue 3).
5. All 72 catalogue expected outcomes.

## Honest summary

The retrieval work is sound and now verified at the level that matters: the texts are
authentic, the titles check out, the transcriptions are complete, and one real error in both
source reports was caught.

The weaknesses are not in what we read but in **what we have not yet checked** — currency of
the law, four unread articles, and the fact that a single unreviewed assessor produced every
classification verdict so far. None of those is expensive to fix. All of them are cheaper to
fix now than after rules exist.

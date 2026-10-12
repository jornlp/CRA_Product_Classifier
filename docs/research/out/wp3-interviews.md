# WP3 — manufacturer interviews

Recorded 12 October 2026 from the project lead's interviews. Anonymised: no company names.

## What was found

Two manufacturers, the two cases v4 was built around, had classified their own products:

| Product | Their classification | Our reference | Case |
|---|---|---|---|
| Camera that detects a trapped rodent (pest control) | Important (Annex III) | Not III-I-17: pest monitoring is not protecting the physical security of consumers. `DEFAULT` only once all 26 categories are settled | `RAT-01` |
| Smart water meter | Important, or even critical | Not IV-02 if it measures and transmits only. If it includes gateway functions itself, it reaches an open question: water is not named as an energy source, and IV-02's second limb has no technical description | `WTR-01`; `A4-02` if it has gateway functions |

## What it means

1. **The need for classification help is confirmed.** Both manufacturers got it wrong, and in the
   ways the WP4 audit predicted: matching on "camera" and on "smart meter".
2. **Their error was over-classification.** Not the AC-02 harm, but costly: a notified body, and for
   critical products possibly EU certification, for products that may only need self-assessment.
3. **The tool's value for them is a reasoned "no".** It must show which condition of III-I-17 or
   IV-02 fails. That answer is the lenient direction, so the evidence gate applies: the core
   function must be confirmed by the manufacturer, and all 26 categories settled, before DEFAULT. For
   the water meter, the honest answer may stay "probably not critical, but this part of the law is
   open".

## Still to find out

1. Which category each thought applied, and on what basis: product name, a tool, a consultant, the
   Annex text.
2. Whether they used any of the existing tools.
3. ~~Whether the water meter has gateway functions~~ — **answered: no gateway function.** It measures
   and transmits only, so `WTR-01` applies with confirmed facts: IV-02 is excluded on its gateway
   conditions, and the open question in `A4-02` does not arise. "Critical" was wrong; whether it is
   important depends on the other categories, settled by the engine like any product.
4. What they planned as a consequence: notified body, certification, delay.

These decide whether `RAT-01` and `WTR-01` can run as fixtures with confirmed facts (WP3 done-when).

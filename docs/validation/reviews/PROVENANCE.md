# Provenance and evidence level of review round 1

**The reviewer for both round-1 reviews was an LLM ("GPT chat"), not a qualified legal
reviewer.** This note records what that means, because it changes how both reviews may be used
and I had written them up as though they were independent legal review.

## What it does and does not count as

**Superseded in part by DR-04.** The project does not pursue legal validation: it presents what
the official texts say, shows what is undetermined, and tells users to obtain their own advice.
AC-01 and §8.2 were amended accordingly, and a rule is enabled on **verification against the
official source**, not on a reviewer's signature.

So the question is no longer whether this review satisfies a gate it was never going to satisfy.
It is what the review's output may be used for:

| Use | Permitted |
|---|---|
| Flag a discrepancy against a held source, which the authors then verify themselves | **Yes** — this is where its value was |
| Surface an argument worth testing | **Yes**, as an argument, not as authority |
| Act as a consistency check on our own reasoning | **Yes**, with the caveat below |
| Establish that a classification is legally correct | **No** |
| Change a case to `AUTHOR_VERIFIED` without the authors checking the text | **No** |

## What this does to the agreement figure

I reported 91% scope and 90% class agreement across 142 cases. That number is far weaker
evidence than it appeared, and I should have said so at the time.

Both sides of the comparison are LLM readings of the same public corpus. Our expectations were
derived by one model; the answers by another. Agreement between them is consistent with **shared
training priors** rather than with legal correctness — the errors are correlated, and correlated
errors are precisely what a second opinion is supposed to break.

Two LLMs agreeing that a smart lock is `IMPORTANT_I` is not evidence that it is.

The figure is still worth something, but only as a **consistency check on our own reasoning**:
where the two readings diverge, something is probably unclear. Where they agree, nothing has been
established.

## What survives, and why

Findings survive **only** where they can be checked against the official text we hold. Each of
these was verified by the authors directly against the source before being applied — none was
accepted on the reviewer's authority:

| Finding | Verified against |
|---|---|
| IV-03 condition 2 states a **"typically"** feature as mandatory | B2 Annex II item 3: *"They **typically** store, process, or manage..."* |
| III-I-10 condition 1 says "directly connects"; virtual interfaces may connect **directly or indirectly** | B2 Annex I item 10, verbatim |
| III-I-01 omits "and sensitive information" from the privileged-access variant | B2 Annex I item 1 |
| III-I-12 omits "intended for connection to the Internet" for modems | B2 Annex I item 12 |
| III-I-18 does not define social interactive features as **inbound and outbound** communication | B2 Annex I item 18 |
| III-II-01 omits resource allocation and orchestration for container runtimes | B2 Annex I Class II item 1 |
| `CAT-19N` — an MDR product is excluded by Art. 2(2)(a) entirely | B1 Art. 2(2)(a), held verbatim |
| `SCP-04` — USB is a physical data connection | B1 Art. 2(1) with Art. 3(9), held verbatim |

The first two were **errors of ours that our own verification passes did not catch**, and both
generated false negatives — the AC-02 direction. That is a real contribution, and it is
proofreading against a source, not legal judgement.

## What does not survive

These were presented in `COMPARISON.md` as corrections we accepted. They are **interpretive**,
and an LLM's view carries no weight on them. They revert to our own hypotheses, flagged for a
qualified reviewer:

- **`LOCK-03` / `LOCK-04`** — that III-I-17's residential condition is not exclusive. The textual
  argument is ours to make and is reasonable (the description does not say "exclusively"), but it
  is not validated. The catalogue change stands as *our* reading, not as a reviewed correction.
- **The `DEFAULT`-from-partial-sweep question** — whether concluding `DEFAULT` requires
  enumerating every category. Still open, and still the right question to ask a real reviewer.
- **`A4-02` and the second limb** — unchanged. The reviewer did not address the limb.
- **`EXC-06`** — unknown exclusion basis yielding `UNRESOLVED`. This one we keep, but on our own
  reasoning: treating UNKNOWN as FALSE is forbidden by our own four-valued model, independently
  of what any reviewer said.

## How to record LLM review in future

The research protocol already has the vocabulary for this. An LLM review is `MODEL_INFERRED`,
never `INTERPRETATION` by a named human, and never `VERIFIED_CASE`. It may:

- find textual discrepancies against a held source, which the authors then verify;
- surface arguments worth testing;
- act as a consistency check on our own reasoning.

It may not confirm a decisive legal fact, satisfy AC-01, or move a case out of `HYPOTHESIS` —
which is what v3 and v4 both say about LLM use, and the same rule we wrote into the engine for
users applies to us.

## Standing recommendation

Nothing here is wasted: two real errors were caught, six conditions sharpened, and the open
questions are better posed than they were.

Under DR-04 the useful form of further LLM review is narrow and worth repeating: **give it the
held source text and ask it to find discrepancies between the text and our conditions.** That is
proofreading against a fixed artefact, it is checkable, and it is what produced every finding
that survived. Asking it to classify products is the part that produced correlated agreement and
established nothing.

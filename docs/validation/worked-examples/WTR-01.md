# Worked example — WTR-01, connected water consumption meter

First hand-run assessment, per v4's "first practical deliverable". It exists to test
whether the catalogue and the category inventory actually produce a defensible answer.

**Status: `HYPOTHESIS`.** No legal reviewer has signed this. It is a worked illustration
of the method, not a classification of any company's product.

## Assumed product boundary and facts

| Fact | Value | Provenance |
|---|---|---|
| `product_boundary` | The meter unit alone, as placed on the market | ASSUMED |
| `intended_purpose` | Measure water consumption and transmit readings to the utility | ASSUMED |
| `connectivity` | Radio module transmitting to utility collection infrastructure | ASSUMED |
| `eu_market_activity` | TRUE | ASSUMED |
| `market_role` | Manufacturer | ASSUMED |
| `separately_sold_gateway` | FALSE — no gateway in this boundary | ASSUMED |
| `controls_other_devices` | FALSE | ASSUMED |
| `first_placed_on_market_at` | UNKNOWN | — |

Every row marked ASSUMED is a question the real assessment must ask. Change
`separately_sold_gateway` or `controls_other_devices` and the answer changes.

## A. Scope → `IN_SCOPE`

Art. 2(1): a product whose intended purpose includes a direct or indirect logical or
physical data connection to a device or network. The meter transmits readings, so the
connection condition is met on intended purpose alone.

Exclusions checked: Art. 2(2) MDR/IVDR/2019/2144 — no. 2(3) aviation — no. 2(4) marine —
no. 2(5) — no delegated act identified; absence of an act is not an exclusion. 2(6) spare
parts — not a replacement component. 2(7) national security — no.

## B. Classification → `DEFAULT` (candidate)

The DEFAULT-blocking rule requires every category to be assessed, not merely unmatched.
All 26 are swept below.

### Annex III Class I

| # | Category | Verdict | Reason |
|---|---|---|---|
| 1 | Identity/privileged access management | No | Core function is metering, not authentication or access control |
| 2 | Browsers | No | — |
| 3 | Password managers | No | — |
| 4 | Anti-malware | No | — |
| 5 | VPN | No | May use an encrypted link; core functionality is not providing a VPN tunnel as a product |
| 6 | Network management systems | No | Does not manage network elements |
| 7 | SIEM | No | — |
| 8 | Boot managers | No | Contains a bootloader as a **component**; core functionality differs (B7 §3.4) |
| 9 | PKI / certificate issuance | No | May hold certificates; does not manage their lifecycle as its core function |
| 10 | Physical and virtual network interfaces | No **for this boundary** | The radio module would fall here **if placed on the market separately** (Art. 3(1)). Boundary-sensitive |
| 11 | Operating systems | No | Likely contains an RTOS component; a product is not an OS merely by embedding one (B7 §3.4, smartphone example) |
| 12 | Routers, modems, switches | No | A cellular/LPWAN modem may be integrated; core functionality is metering, not providing internet connectivity |
| 13 | Microprocessors w/ security functionality | No | Component, not the product placed on the market |
| 14 | Microcontrollers w/ security functionality | No | Same |
| 15 | ASIC/FPGA w/ security functionality | No | Same |
| 16 | Smart home virtual assistants | No | No natural-language interface |
| 17 | Smart home products with security functionalities | No | Does not protect the **physical security of consumers**; measuring consumption is not a security function. Residential installation alone is insufficient |
| 18 | Internet connected toys | No | Not a toy under Dir. 2009/48/EC |
| 19 | Personal wearables | No | Not worn on the body |

### Annex III Class II

| # | Category | Verdict | Reason |
|---|---|---|---|
| 1 | Hypervisors / container runtimes | No | — |
| 2 | Firewalls, IDS/IPS | No | Note: no industrial-use condition exists, but the meter's core function is not traffic filtering or intrusion detection |
| 3 | Tamper-resistant microprocessors | No | Component-level; also requires AVA_VAN 2–3 design |
| 4 | Tamper-resistant microcontrollers | No | Same |

### Annex IV

| # | Category | Verdict | Reason |
|---|---|---|---|
| 1 | Hardware Devices with Security Boxes | **No, but flag** | Core function is metering, not secure storage/processing or cryptographic operations. **However**, the description expressly names *tachographs* — a tamper-resistant measuring-and-recording device. A meter with a tamper-resistant envelope and secure crypto storage is close enough to that analogy to warrant expert review |
| 2 | Smart meter gateways and other devices for advanced security purposes | **No for the meter** | Not a gateway: does not control communication with authorised third parties, nor control other devices. Separately, water is not named in B2 (electricity anchor; gas/heat extension) and the second limb of the title has no technical description — see `wp1-findings-02-verified.md` §1 |
| 3 | Smartcards / secure elements | No | May contain a secure element as a component |

**Result: `DEFAULT`** — no category matched, all 26 assessed, coverage complete at
hypothesis level. One review flag raised on IV-01.

> `DEFAULT` does **not** mean exempt. The product is fully within CRA scope and subject to
> the essential requirements and the manufacturer's obligations. The class affects the
> conformity assessment route, not whether the CRA applies.

## C. Timeline → `UNRESOLVED`

`first_placed_on_market_at` is UNKNOWN, so per-obligation outcomes cannot be fixed:

| Obligation | Status | Note |
|---|---|---|
| Art. 14 reporting | `APPLIES` if in scope | Art. 69(3): applies to all in-scope products placed before 11-12-2027 |
| Main requirements | `UNRESOLVED` | Art. 69(2) turns on the placing date and any substantial modification |
| Art. 69(1) certificates | `NOT_APPLICABLE` unless an EU type-examination certificate exists under other harmonisation legislation (valid to 11-06-2028) |

## What flips this answer

1. **Gateway functions in the meter.** If the meter itself controls communication with
   authorised third parties, performs the crypto/firewall/device-control functions, then
   IV-02 reopens — and with it the unresolved water question.
2. **Separately marketed radio module.** Then III-I-10 applies to that module as its own
   product (`BND-02`).
3. **Tamper-resistant secure-storage framing.** If the product is marketed on secure data
   handling rather than metering, IV-01's tachograph analogy gets stronger.
4. **A bundled gateway.** Separate assessment (`WTR-03`).

## Method observations

- The sweep took the complete inventory to perform. Before today it was impossible —
  which is precisely why AC-03 blocks `DEFAULT` on incomplete coverage.
- Most "No" verdicts rest on the same rule: **component ≠ product core functionality**
  (B7 §3.4). That single rule carries categories 8, 10, 11, 12, 13, 14, 15 and IV-03.
  It deserves to be a first-class, heavily tested rule rather than per-category logic.
- Three of the 26 verdicts are boundary-sensitive, not function-sensitive. The product
  boundary question is doing more work than the classification questions.

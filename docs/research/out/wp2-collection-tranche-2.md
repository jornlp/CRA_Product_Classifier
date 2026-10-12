# WP2 collection — tranche 2: Class I hardware and consumer products

Second pass, covering Annex III Class I hardware (network interfaces, secure microcontrollers)
and consumer smart-home products. Public datasheets and product pages, 2026-10-12.

## The generalisation this tranche produces

Tranche 1 found decidability splitting by product class. Tranche 2 sharpens it into something
more useful, and it maps onto the CRA's own structure:

> **A datasheet states what a product IS and what it HAS. It does not state what the product is
> FOR.**

Features are document-decidable. Purpose and context are not. And the CRA's decisive test —
core functionality — is a statement of purpose. So the single most important fact in the model
is precisely the one no document supplies.

Three worked illustrations follow.

## Secure microcontrollers (III-I-13, III-I-14, III-I-15)

Datasheets here are the most detailed encountered anywhere: TrustZone partitioning of memory,
peripherals, pins and interrupts; secure boot with named algorithms (ECDSA P-256/P-521,
Ed25519, RSA-2048/3072); active-shield tamper controllers and glitch detectors; TRNG to
NIST SP 800-90B; PUF; differential power analysis countermeasures; immutable boot ROM as root
of trust; authenticated debug and lifecycle states.

Every one of those is a **feature**. The decisive CRA condition is that the security
functionality "aims to secure other products, networks or services **beyond the microprocessor
itself**". No datasheet says whose security is being served. A TrustZone MCU that anchors a
system's secure boot chain plausibly secures beyond itself; an MCU whose crypto accelerator
only verifies its own firmware does not. The documents do not distinguish these.

`SECURES_BEYOND_ITSELF` therefore stays `MANUFACTURER_ONLY` — prediction confirmed and now
evidenced.

**Two further certification proxies found:** **PSA Certified** and **SESIP** appear routinely on
secure MCUs. Both evaluate security functionality and its intended scope, so they are useful
positive evidence — under the same positive-only rule as the Common Criteria markers.

## Smart door locks (III-I-17)

Retail-oriented datasheets. Decidable without difficulty: unlock methods, Wi-Fi and Bluetooth
connectivity, app control from anywhere, voice-assistant integration, battery life, door
thickness, ANSI/BHMA grade. `REMOTE_MANAGEMENT` and `DATA_CONNECTION` are plainly stated.

The decisive condition is not. **"Residential setting"** appears only incidentally, and when it
does it often undermines itself — one listing gives the application as *"residential and
Airbnb"*. Short-term rental is neither a home in the ordinary sense nor a commercial building,
and the same physical product is sold into both.

That is the `LOCK-01`/`LOCK-02` boundary appearing unprompted in real marketing copy, which is
good evidence the pair is testing something real. Added `LOCK-04` for the short-term-rental
case, where the honest answer is `CONFLICTING` rather than a choice.

`PROTECTS_PHYSICAL_SECURITY` is never stated either — for a lock it is arguably self-evident,
but "arguably self-evident" is not evidence, and the engine must still ask.

## Network interfaces (III-I-10)

Straightforwardly decidable. Industrial Ethernet cards state ports, protocols, conformance,
firmware technology and operating ranges. Whether something *is* a network interface is a
feature question, and features are what datasheets contain.

## Cumulative decidability picture

| Fact type | Example | Document-decidable? |
|---|---|---|
| Interfaces and protocols | "two RJ45 ports, EtherNet/IP conformance" | Yes |
| Security features present | "TrustZone, secure boot with ECDSA P-384" | Yes |
| Certification held | "EAL4+ AVA_VAN.5", "PSA Certified", "BSI-CC-PP-0073" | Yes, and independently verifiable |
| Remote manageability | "control from anywhere via the app" | Yes |
| **Who the security serves** | "beyond the microcontroller itself" | **No** |
| **Setting and context** | "residential" | **No, and often contradicted** |
| **Core functionality** | "what this product is for" | **No** |
| **Product boundary and role** | "what is placed on the market, by whom" | **No** |

## Next tranche

3. Class I software: III-I-01, 02, 04, 05, 06, 07, 08, 09, 11 — expect the software pattern from
   tranche 1, with features decidable from product pages and architecture claims unverifiable.

# WP1 CRA review — completed reviewer worksheet

**Reviewed:** 12 October 2026. **Scope:** 26 Annex III/IV categories plus 8 cross-category interpretations. **Basis:** primary EU legal texts and the European Commission's non-binding 2026 guidance. This is a legal-text review, not certification advice.

## Outcome at a glance

| Area | Correct | Incomplete | Incorrect | Total |
|---|---:|---:|---:|---:|
| Product categories | 19 | 5 | 2 | 26 |
| Interpretive decisions | 7 | 1 | 0 | 8 |
| **All reviewed blocks** | **26** | **6** | **2** | **34** |

**Reading rule:** A checkmarked "correct" block may still have explanatory qualifications. "Incomplete" means the formulation omits a legally material distinction. "Incorrect" means it includes a condition too strong/narrow as a purported mandatory test. The overarching **core-functionality** test applies to the finished product for each category.

**Highest-priority edits:** III-I-10 (physical **or indirectly connecting virtual** network interfaces), III-I-12 (Internet-intended modems), III-I-18 (toy social interaction and geographic tracking), III-II-01 (container runtime resource/lifecycle management), IV-02 (no gateway-only rule for the unelaborated second limb), and IV-03 ("typically" is not a mandatory secure-element feature).

## Primary legal references

- [Regulation (EU) 2024/2847 — CRA, Articles 7–8 and Annexes III–IV](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng)
- [Commission Implementing Regulation (EU) 2025/2392 — technical descriptions, Annexes I–II; recitals 2–4](https://eur-lex.europa.eu/eli/reg_impl/2025/2392/oj/eng)
- [Regulation (EU) 2025/2509 — Toy Safety Regulation, Articles 56–57 and Annex VIII](https://eur-lex.europa.eu/eli/reg/2025/2509/oj/eng)
- [European Commission, CRA guidance C(2026) 5252, 27 July 2026](https://cra.orcwg.org/official-guidance/) (non-binding Commission interpretation reproduced by ORCWG)

---

## Original WP1 worksheet with reviewer responses

### WP1 review sheet — decisive conditions per category

What needs checking: for each of the 26 categories in Annex III and Annex IV, we have read the official technical description and extracted the conditions we believe are decisive. **The text is verbatim and verified. The conditions are the authors' original reading; reviewer outcomes are added below.**

Please check each block: do the conditions capture what the description actually requires? Is anything missing, anything added that is not there, anything stated too strongly or too weakly?

Marking a block as correct is as useful to us as correcting it.

## Sources

- Category titles: Regulation (EU) 2024/2847, Annex III and Annex IV, consolidated version 000.003

- Technical descriptions: Commission Implementing Regulation (EU) 2025/2392, Annexes I and II

- Both held as authentic OJ PDFs with SHA-256 recorded; every sentence below was verified as a verbatim substring of the source

## Interpretive decisions we would like confirmed or corrected

These sit underneath the per-category conditions and affect many of them at once.

| # | Our reading | Based on | Reviewer |
|---|---|---|---|
| 1 | Annex III Class II firewalls carry **no** 'intended for industrial use' condition. Both of our source reports assumed one; the official text has none. | B1 Annex III, B2 Annex I Class II item 2 | **CORRECT** |
| 2 | A component does not confer its category on the product that embeds it; a product that **can** perform a category's functions but whose core functionality differs is not in that category. | Art. 7(1); B2 recital 4; official FAQ 3.4 | **CORRECT** |
| 3 | Conversely, extra functions do **not** remove a category when the core functionality matches. | B2 recital 4 | **CORRECT** |
| 4 | For III-I-13/14/15, the decisive limiter is that the security functionality secures products, networks or services **beyond the chip itself**. | B2 Annex I items 13-15 | **CORRECT** |
| 5 | IV-03's threshold is **at least** AVA_VAN.4, so a product at AVA_VAN.5 satisfies it. | B2 Annex II item 3 | **CORRECT** |
| 6 | III-I-17 requires all of: protects physical security **of consumers**, **residential** setting, remotely controllable — or alternatively centrally controls such products. | B2 Annex I item 17 | **CORRECT** |
| 7 | IV-02's second limb ('other devices for advanced security purposes, including for secure cryptoprocessing') has **no technical description** in B2. We treat the category as excludable where the product is neither a metering gateway nor an advanced-security device, since both candidate readings require one or the other. | B1 Annex IV; B2 Annex II item 2 | **INCOMPLETE** |
| 8 | III-I-18's reference to Directive 2009/48/EC resolves **by date**: that Directive to 31.07.2030, then Reg. (EU) 2025/2509 via its Art. 56 correlation clause. | Reg. 2025/2509 Art. 56 | **CORRECT** |

## Reviewer comments on the eight interpretive decisions

**Decision 1 — CORRECT.** Neither Annex III Class II item 2 nor its implementing technical description limits firewalls/IDS/IPS to industrial use. Consumer and industrial deployment alone do not decide the category.

**Decision 2 — CORRECT.** CRA Article 7(1) expressly rules out automatic classification of the finished product from an integrated Annex III component; the analogous core-function approach applies to Annex IV through Article 8(1) and Implementing Regulation recital 3. Classify the product offered as a whole, while accounting for component cybersecurity.

**Decision 3 — CORRECT.** Implementing Regulation recital 4 expressly preserves a category despite extra functions: an OS can have a browser, and a router can integrate a firewall. The original category still has to be the product’s core functionality.

**Decision 4 — CORRECT.** The "beyond the [microprocessor/microcontroller/ASIC/FPGA] itself" purpose is explicit in all three descriptions. It is a necessary condition, not a stand-alone sufficient condition; the chip architecture and particular security functionality must still be shown.

**Decision 5 — CORRECT.** The text says **"at least AVA_VAN.4"**. AVA_VAN.5 therefore clears the **level** condition, but a product must also meet the rest of the secure-element/smartcard description. The text says "designed to provide", not "holds a certificate".

**Decision 6 — CORRECT.** The alternative central-controller limb is limited to hardware/software that centrally control **those qualifying remotely manageable, residential consumer-physical-security products**. The remote-control criterion attaches to the controlled home-security products, not necessarily to the central controller as a separate remote-managed device.

**Decision 7 — INCOMPLETE.** The Annex IV category title unambiguously **contains the "other devices" words**, while Annex II technical text describes **only gateways**. There is no supplied, independent technical test for the second limb. Exclusion where neither alternative could plausibly apply is reasonable, but "advanced security purposes" requires case-by-case interpretation and cannot be reduced to the five gateway criteria. Treat boundary cases as unresolved rather than excluding them by default.

**Decision 8 — CORRECT.** Article 56 of Regulation (EU) 2025/2509 repeals the old Toy Safety Directive from **1 August 2030** and maps references using Annex VIII. Crucial qualification: Article 57 preserves continued availability of toys placed on the market under the Directive before that date; the **product’s placing-on-market date** may therefore matter, not only the reviewer’s assessment date. Apply the CRA’s own dates separately.

---
## III-I-01 — Annex III, Class I, item 1

**Category title (B1), verbatim:**

> Identity management systems and privileged access management software and hardware, including authentication and access control readers, including biometric readers

**Technical description (B2), verbatim:**

> Identity management systems are products with digital elements that provide mechanisms for authentication or authorisation and that may also provide mechanisms for the lifecycle management of identity credentials of natural persons, legal persons, devices or systems, such as identity registration, provisioning, maintenance, deregistration. These systems include access management systems that control access of natural persons, legal persons, devices or systems to digital resources or physical locations. Privileged access management software is an access management system that controls and monitors access rights to IT or OT systems and sensitive information within an organisation, including systems enforcing differentiated access control policies for privileged users. This category includes but is not limited to authentication and access control readers, biometric readers, single sign-on software, federated identity management software, one-time password software, hardware authentication devices such as transaction authentication number (TAN) generators, authentication software and multi-factor authentication software.

**Our decisive conditions:**

1. provides mechanisms for authentication or authorisation

2. or controls access of persons/devices/systems to digital resources or physical locations

3. privileged variant: controls and monitors access rights to IT/OT systems within an organisation

**Our note:**

Covers access control to PHYSICAL locations as well as digital resources. Interacts with III-I-17 for door locks: a commercial access-control reader may land here rather than in the smart-home category. Relevant to LOCK-02.

**Reviewer** — conditions are:  ☐ correct   ☒ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Identity systems/access readers are captured, and physical as well as digital access is rightly included. For the privileged-access variant, also retain control **and monitoring** of rights to **sensitive information**, not just IT/OT systems. Credential lifecycle activities are optional ("may also"). For application, assess the product’s core functionality rather than any incidental login feature.

---
## III-I-02 — Annex III, Class I, item 2

**Category title (B1), verbatim:**

> Standalone and embedded browsers

**Technical description (B2), verbatim:**

> Software products with digital elements that enable end users to access, render, and interact with web content and services hosted on servers that are connected to networks such as the Internet. They typically include a browser engine for interpreting and displaying content written in markup language (e.g. HTML), support for web protocols (e.g. HTTP, HTTPS), the ability to execute scripts and manage user inputs as well as storage of temporary or persistent data from websites (cookies). This category includes but is not limited to standalone applications that fulfil the functions of browsers, embedded browsers intended for integration into another system or application as well as browsers with AI agent integration.

**Our decisive conditions:**

1. enables end users to access, render and interact with web content and services hosted on servers

2. typically includes a browser engine, web protocol support, script execution

**Our note:**

'Browsers with AI agent integration' is expressly named.

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

The functional triad—access, render and interact with network-hosted web content/services—is accurately captured. Engines, HTTP(S), script execution, cookies and similar elements are described as **typical**, not cumulative mandatory prerequisites. The embedded browser must itself be the classified product/component; an unrelated enclosing app is not automatically a browser.

---
## III-I-03 — Annex III, Class I, item 3

**Category title (B1), verbatim:**

> Password managers

**Technical description (B2), verbatim:**

> Products with digital elements that store passwords, locally on a device or on a remote server, including activities such as generation of passwords as well as password sharing and integration with local or third-party applications for usage of passwords. This category includes but is not limited to local password managers, password managers provided as browser extensions, enterprise password managers as well as hardware-based password managers.

**Our decisive conditions:**

1. stores passwords locally or on a remote server

2. activities such as generation, sharing, or integration with applications for password use

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Password storage is central, locally or remotely. Generation, sharing and integration are examples ("such as"), **not mandatory additional conditions**. Still require password-management **core functionality**; an unrelated notes app that happens to store a password is not automatically a password manager.

---
## III-I-04 — Annex III, Class I, item 4

**Category title (B1), verbatim:**

> Software that searches for, removes, or quarantines malicious software

**Technical description (B2), verbatim:**

> Software products with digital elements, typically referred to as antivirus or antimalware, that detect or search for malicious software or code on devices, or remove or quarantine such software or code, in order to maintain the integrity, confidentiality, or availability of such devices. In the context of this category of products, malicious software means software containing malicious features or capabilities that can cause harm directly or indirectly to the user and/or the computer system, such as viruses, worms, ransomware, spyware and trojans. This category includes but is not limited to software that detects or searches for malicious software in real-time or manually, rootkit detection and rescue disks with the core functionality of searching, removing or quarantining malicious software.

**Our decisive conditions:**

1. detects or searches for malicious software or code on devices

2. or removes or quarantines such software or code

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Detection/search and removal/quarantine are alternative functional routes; both need not occur. The target must be **malicious software/code**, rather than merely unexpected file changes. This must be core functionality of the product.

---
## III-I-05 — Annex III, Class I, item 5

**Category title (B1), verbatim:**

> Products with digital elements with the function of virtual private network (VPN)

**Technical description (B2), verbatim:**

> Products with digital elements that establish an encrypted logical tunnel that is constructed from the system resources of a physical or virtual network. This category includes but is not limited to virtual private network clients, virtual private network servers and virtual private network gateways.

**Our decisive conditions:**

1. establishes an encrypted logical tunnel constructed from the system resources of a physical or virtual network

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

The encrypted **logical tunnel** built from physical/virtual network resources is the defining functionality. Merely encrypting application traffic with TLS is insufficient. Clients, servers and gateways are included.

---
## III-I-06 — Annex III, Class I, item 6

**Category title (B1), verbatim:**

> Network management systems

**Technical description (B2), verbatim:**

> Products with digital elements that manage connected network elements, such as servers, routers, switches, workstations, printers or mobile devices, by monitoring them and controlling their network operations and configuration. This category includes but is not limited to end-to-end management systems and dedicated configuration management systems, such as controllers for software-defined networking.

**Our decisive conditions:**

1. manages connected network elements by monitoring them

2. and controlling their network operations and configuration

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

The text combines **monitoring** connected network elements with **controlling their network operations and configuration**. A passive network-status dashboard does not on its own meet the description. SDN controllers and dedicated configuration systems are expressly included.

---
## III-I-07 — Annex III, Class I, item 7

**Category title (B1), verbatim:**

> Security information and event management (SIEM) systems

**Technical description (B2), verbatim:**

> Products with digital elements that collect data from multiple sources, analyse and correlate that data and present it as actionable information for security-related purposes, such as threat and incident detection, forensic analysis or compliance purposes.

**Our decisive conditions:**

1. collects data from multiple sources

2. analyses and correlates that data

3. presents it as actionable information for security-related purposes

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

All three functions—multi-source collection, analysis/correlation, and actionable presentation **for security-related purposes**—are essential to this description. Simple log storage/archiving alone does not meet it.

---
## III-I-08 — Annex III, Class I, item 8

**Category title (B1), verbatim:**

> Boot managers

**Technical description (B2), verbatim:**

> Software products with digital elements that manage the process of initial system startup after power on/restart by initialising hardware, loading or transferring control to the operating system environment or system resources, and selecting boot options. This category includes but is not limited to UEFI firmware, single-stage and multi-stage boot loaders.

**Our decisive conditions:**

1. manages initial system startup after power on or restart

2. initialises hardware, loads or transfers control to the operating system

3. selects boot options

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Initial-startup management, hardware initialisation, OS/resource loading or transfer of control, and boot-option selection follow the wording. Selection need not mean a visible user-facing menu; a configured/default choice can be automatic. Merely distributing or replacing kernel images does not itself manage startup.

---
## III-I-09 — Annex III, Class I, item 9

**Category title (B1), verbatim:**

> Public key infrastructure and digital certificate issuance software

**Technical description (B2), verbatim:**

> Products with digital elements used as part of a public key infrastructure (PKI) that manage the validation, creation, issuance, distribution, status publication, renewal or revocation of digital certificates, or the generation, storage, escrow, exchange, destruction or rotation of cryptographic keys associated with such digital certificates. This category includes but is not limited to key management systems, digital certificate management systems, online certificate status protocol responders and all-in-one PKI solutions.

**Our decisive conditions:**

1. used as part of a public key infrastructure

2. manages validation, creation, issuance, distribution, status publication, renewal or revocation of digital certificates

3. or generation, storage, escrow, exchange, destruction or rotation of associated keys

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Used as part of PKI **and** managing at least one of the listed certificate functions **or** associated-key lifecycle functions captures the alternatives. An OCSP responder is explicitly in scope; an application that merely invokes an OS certificate validation facility should not automatically be treated as PKI-management software.

---
## III-I-10 — Annex III, Class I, item 10

**Category title (B1), verbatim:**

> Physical and virtual network interfaces

**Technical description (B2), verbatim:**

> Physical network interfaces are products with digital elements that directly connect a device to a network via an application programming interface (API) provided by the interface drivers, typically operating at the data link layer, and that feature hardware adapters to transmission media with corresponding firmware, typically operating at the physical and data link layer. Virtual network interfaces are products with digital elements that directly or indirectly connect a device to a network via an API that emulates that of drivers of physical network interfaces, typically operating at the data link layer. This category includes but is not limited to wired and wireless network interface cards, controllers and adapters, such as for Wi-Fi, Ethernet, IrDA, USB, Bluetooth, NearLink, Zigbee, or Fieldbus, as well as purely virtual standalone products, such as virtual network interface cards, container network interfaces and VPN interfaces.

**Our decisive conditions:**

1. directly connects a device to a network via an API provided by interface drivers

2. physical: hardware adapters to transmission media with firmware

3. virtual: emulates drivers of physical network interfaces

**Our note:**

Names USB, Bluetooth and Zigbee adapters. Relevant to SCP-04/05: a product's connection module may itself be an Annex III category.

**Reviewer** — conditions are:  ☐ correct   ☐ incomplete   ☒ incorrect

**Missing / wrong / too strong / too weak, and why:**

Condition 1 is **too narrow** for virtual interfaces: the description explicitly permits **direct or indirect** connection via an API **emulating a physical network-interface driver**. The physical variant uses a driver-provided API; physical adapters/firmware are **typically** present and should not all be universal mandatory tests. The target must be a **network interface**: the mention of USB does not make every USB peripheral/controller an interface to a network.

---
## III-I-11 — Annex III, Class I, item 11

**Category title (B1), verbatim:**

> Operating systems

**Technical description (B2), verbatim:**

> Software products with digital elements that provide an abstract interface of the underlying hardware and control the execution of software, and that may provide services such as computing resource management and configuration, scheduling, input-output control, managing data, and providing an interface through which applications interact with system resources and peripherals. This category includes but is not limited to real-time operating systems, general-purpose and special-purpose operating systems.

**Our decisive conditions:**

1. provides an abstract interface of the underlying hardware

2. controls the execution of software

**Our note:**

Recital 4's worked example. Includes RTOS and special-purpose OS, so an embedded RTOS shipped as a product is in scope of the category.

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Both the abstraction of underlying hardware and control of software execution are core elements. Resource scheduling, I/O, data management, and application interfaces are possible services ("may"). RTOS and special-purpose OS are included if sold as products; an app merely running an OS is not thereby itself an OS.

---
## III-I-12 — Annex III, Class I, item 12

**Category title (B1), verbatim:**

> Routers, modems intended for the connection to the internet, and switches

**Technical description (B2), verbatim:**

> Routers are products with digital elements that establish and control the flow of data between different networks by selecting paths or routes using routing protocol mechanisms and algorithms, typically operating at the network layer. This category includes but is not limited to wired and wireless routers, virtual routers and routers with or without modems. Modems intended for the connection to the Internet are hardware products with digital elements that use digital modulation and demodulation techniques to convert analogue signals from and to digital signals for IP-based communication. This category includes but is not limited to fibre modems, Digital Subscriber Line (DSL) modems, cable (DOCSIS) modems, satellite modems and cellular modems. Switches are products with digital elements that provide connectivity between networked devices through packet forwarding mechanisms and that have a management plane, typically implemented at the data link or network layer. This category includes but is not limited to managed switches, smart switches, multilayer switches, virtual security switches, programmable switches for software-defined networking and bridges such as wireless access points.

**Our decisive conditions:**

1. routers: establish and control data flow between different networks by selecting paths using routing protocols

2. modems: digital modulation/demodulation for IP-based communication

3. switches: packet forwarding between networked devices with a management plane

**Our note:**

Recital 4: a router integrating firewall functionality remains a router.

**Reviewer** — conditions are:  ☐ correct   ☒ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Add the category-title qualifier that **modems are intended for connection to the Internet**, as well as the implementing description’s digital modulation/demodulation **for IP-based communication**. Router route-selection and switch packet forwarding **with a management plane** are correctly stated. The description specifically includes bridge-type switches, such as wireless access points, and virtual router/switch variants. The three product types are **alternatives**, not cumulative tests.

---
## III-I-13 — Annex III, Class I, item 13

**Category title (B1), verbatim:**

> Microprocessors with security-related functionalities

**Technical description (B2), verbatim:**

> Products with digital elements that are integrated circuits that carry out central processing functions relying on external memory and peripherals, including microcode and other low-level firmware. They additionally provide security-related functionalities, such as encryption, authentication, secure key storage, random number generation, trusted execution environment, or other hardware-based protection mechanisms, that aim to secure other products, networks or services beyond the microprocessor itself, such as secure boot chain, virtualization or secure communication interfaces.

**Our decisive conditions:**

1. integrated circuit carrying out central processing functions, relying on external memory and peripherals

2. additionally provides security-related functionalities

3. those functionalities aim to secure other products, networks or services BEYOND the microprocessor itself

**Our note:**

Decisive limiter: the security functionality must aim to secure products/networks/services BEYOND the microprocessor itself.

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Captures the microprocessor architecture (central processing relying on external memory/peripherals), additional security function, and crucial purpose of securing **other** products/networks/services beyond the chip. Mere cryptography protecting only the processor does not meet item 13.

---
## III-I-14 — Annex III, Class I, item 14

**Category title (B1), verbatim:**

> Microcontrollers with security-related functionalities

**Technical description (B2), verbatim:**

> Products with digital elements that are integrated circuits that carry out central processing functions integrating memory allowing the microcontroller to be programmable and typically also other peripherals, including microcode and other low-level firmware. They additionally provide security-related functionalities, such as encryption, authentication, secure key storage, random number generation, trusted execution environment, or other hardware-based protection mechanisms, that aim to secure other products, networks or services beyond the microcontroller itself, such as secure boot chain, virtualization or secure communication interfaces.

**Our decisive conditions:**

1. integrated circuit carrying out central processing functions, integrating memory, programmable

2. additionally provides security-related functionalities

3. aiming to secure products, networks or services BEYOND the microcontroller itself

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Captures the programmable processor with **integrated memory**, plus security functions intended to protect an external product, network or service. The peripheral integration is typical, not compulsory. A self-protective RNG alone is insufficient.

---
## III-I-15 — Annex III, Class I, item 15

**Category title (B1), verbatim:**

> Application specific integrated circuits (ASIC) and field-programmable gate arrays (FPGA) with security-related functionalities

**Technical description (B2), verbatim:**

> Application specific integrated circuits (ASIC) with security-related functionalities are products with digital elements that are integrated circuits, fully or partially custom-designed to perform a specific function or implement a specific application, including microcode and other low-level firmware. They additionally provide security-related functionalities, such as encryption, authentication, secure key storage, random number generation, trusted execution environment, or other hardware-based protection mechanisms, that aim to secure other products, networks or services beyond the ASIC itself, such as secure boot chain, virtualization or secure communication interfaces. Field-programmable gate arrays (FPGA) with security-related functionalities are products with digital elements that are integrated circuits characterized by a matrix of configurable logic blocks designed to be reprogrammable after manufacturing to perform a specific function or implement a specific application, including microcode and other low-level firmware. They additionally provide security-related functionalities, such as encryption, authentication, secure key storage, random number generation, trusted execution environment, or other hardware-based protection mechanisms, that aim to secure other products, networks or services beyond the FPGA itself, such as secure boot chain, virtualization or secure communication interfaces.

**Our decisive conditions:**

1. ASIC: custom-designed integrated circuit for a specific function

2. FPGA: matrix of configurable logic blocks, reprogrammable after manufacturing

3. additionally provides security-related functionalities securing products/networks/services beyond itself

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

The ASIC and FPGA architecture branches and beyond-chip security requirement are captured. Specify, if implementing a rule engine, that an ASIC may be **fully or partially** custom-designed, while an FPGA has configurable logic designed for **post-manufacture reprogramming**. Mere signal processing does not suffice.

---
## III-I-16 — Annex III, Class I, item 16

**Category title (B1), verbatim:**

> Smart home general purpose virtual assistants

**Technical description (B2), verbatim:**

> Products with digital elements that communicate on the public Internet, whether directly or via other equipment, that process demands, tasks or questions based on natural language prompts, such as through audio or written input, and that, based on those demands, tasks or questions, provide access to other services or control the functions of connected devices in residential settings. This category includes but is not limited to smart speakers with an integrated virtual assistant, and standalone virtual assistants that meet this description.

**Our decisive conditions:**

1. communicates on the public Internet, directly or via other equipment

2. processes demands, tasks or questions based on natural language prompts

3. provides access to other services or controls connected devices in residential settings

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Public Internet communication (directly or indirectly), natural-language requests, and provision of other services **or** control of residential connected devices together reflect the description. A simple offline fixed-word infrared remote is not a smart-home general-purpose virtual assistant.

---
## III-I-17 — Annex III, Class I, item 17

**Category title (B1), verbatim:**

> Smart home products with security functionalities, including smart door locks, security cameras, baby monitoring systems and alarm systems

**Technical description (B2), verbatim:**

> Products with digital elements that protect the physical security of consumers in a residential setting and which can be controlled or managed remotely from other systems, as well as hardware and software that centrally control such products. This category includes but is not limited to smart door locking devices, baby monitoring systems, alarm systems and home security cameras.

**Our decisive conditions:**

1. protects the physical security of consumers

2. in a residential setting

3. can be controlled or managed remotely from other systems

4. OR centrally controls such products

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

The first branch combines protection of **consumers’ physical security**, a **residential** setting and **remote controllability/management**. The second branch includes hardware/software **centrally controlling those same qualifying products**; not arbitrary central controllers. Core intended function matters where a camera has other uses.

---
## III-I-18 — Annex III, Class I, item 18

**Category title (B1), verbatim:**

> Internet connected toys covered by Directive 2009/48/EC that have social interactive features (e.g. speaking or filming) or that have location tracking features

**Technical description (B2), verbatim:**

> Internet connected toys that have social interactive features are products with digital elements that are covered by Directive 2009/48/EC, that communicate on the public Internet, whether directly or via any other equipment, and that have embedded technologies that enable inbound and outbound communication, such as keyboard, microphone, speaker or camera. Internet connected toys that have location tracking features are products with digital elements that are covered by Directive 2009/48/EC, that communicate on the public Internet, whether directly or via any other equipment, and that have technologies that enable tracking or inferring of the geographical location of the toy or its user. Where the toy merely detects the proximity of the user or of other toys by using sensing technologies, the toy is not to be considered to have location tracking features.

**Our decisive conditions:**

1. is a toy covered by Directive 2009/48/EC (play, children under 14, not in its Annex I)

2. communicates on the public Internet, directly or via other equipment

3. AND has social interactive features OR location tracking features

**Our note:**

Contains an express NEGATIVE condition: proximity sensing is not location tracking - good minimal-pair material. DATED CROSS-REFERENCE: the category is defined by reference to Directive 2009/48/EC, repealed from 01.08.2030 by Reg. (EU) 2025/2509, whose Art. 56 construes old references as references to the Regulation via its Annex VIII correlation table. The rule must therefore resolve the reference BY DATE: Directive 2009/48/EC up to 31.07.2030, Regulation (EU) 2025/2509 from 01.08.2030. Art. 57(1) additionally lets toys placed on the market in conformity with the Directive before 01.08.2030 continue to be made available, so for a given product the applicable toy regime depends on its own placing date - which interacts with the CRA Art. 69 timeline.

**Reviewer** — conditions are:  ☐ correct   ☒ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

The structure is right, but the operational test should define **social interactive features** as embedded technology enabling **inbound and outbound communication** (e.g. microphone/speaker or relevant input/output), and location tracking as **tracking or inferring geographical location** of the toy or user. **Proximity-only sensing is expressly excluded** from location tracking. Toy-law coverage must be assessed under the applicable temporal regime (see decision 8).

---
## III-I-19 — Annex III, Class I, item 19

**Category title (B1), verbatim:**

> Personal wearable products to be worn or placed on a human body that have a health monitoring (such as tracking) purpose and to which Regulation (EU) 2017/745 or (EU) 2017/746 do not apply, or personal wearable products that are intended for the use by and for children

**Technical description (B2), verbatim:**

> Personal wearable products to be worn or placed on a human body that have a health monitoring purpose are products with digital elements that are worn on the body directly or via clothing or accessories and that can, regularly or continuously, sense and further process information, including body metrics, relevant to the user's health, excluding products that fall within the scope of Regulation (EU) 2017/745 or of Regulation (EU) 2017/746. This category includes but is not limited to fitness trackers, smartwatches, smart jewellery, smart clothing and sports apparel that meet this description. Personal wearable products that are intended for the use by and for children are products with digital elements which can be worn or placed on the body, directly or via clothing or accessories, of individuals under the age of 14. This category includes but is not limited to child safety wearables.

**Our decisive conditions:**

1. worn on the body directly or via clothing or accessories

2. regularly or continuously senses and processes information relevant to the user's health

3. excluding products within the scope of Reg. 2017/745 or 2017/746

4. OR is a wearable intended for use by and for individuals under 14

**Our note:**

'Children' is defined as individuals under the age of 14. Note the interaction with the Art. 2(2) MDR/IVDR exclusion: this category is defined so as not to overlap it.

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

There are **two alternative limbs**: non-MDR/IVDR wearable health monitoring with regular/continuous sensing and further processing, **or** a wearable intended for use **by and for children under 14**. The child branch does not itself require health monitoring. Any overriding CRA Article 2(2) sectoral exclusion must still be applied.

---
## III-II-01 — Annex III, Class II, item 1

**Category title (B1), verbatim:**

> Hypervisors and container runtime systems that support virtualised execution of operating systems and similar environments

**Technical description (B2), verbatim:**

> Hypervisors are software products with digital elements that abstract and/or allocate computing resources and enable the execution, management and orchestration of virtual machines that are logically separated from each other and/or from the physical hardware. Hypervisors may run directly on hardware (bare metal), on top of an operating system, or within another virtual machine (nested virtualisation). In the context of this category of products, a virtual machine is a software-defined logical separation of a computing environment, which includes a virtualised set of hardware resources (e.g. CPU, memory, storage, network interfaces) and typically hosts its own operating system. This category includes but is not limited to type 1 hypervisors (bare metal), type 2 hypervisors (hosted on an operating system) and hybrid hypervisors. Container runtime systems are software products with digital elements that manage the execution and lifecycle of containers running on a single host operating system as isolated processes, allocating resources and allowing the management and orchestration of individual containers. In the context of this category of products, a container is a software-based execution environment that encapsulates one or more software components and their dependencies in a single package, enabling it to run independently and consistently.

**Our decisive conditions:**

1. hypervisor: abstracts/allocates computing resources and enables execution, management and orchestration of virtual machines

2. container runtime: manages execution and lifecycle of containers on a single host OS as isolated processes

**Reviewer** — conditions are:  ☐ correct   ☒ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

The hypervisor branch is accurately reduced to resource abstraction/allocation plus VM execution/management/orchestration. For **container runtimes**, also capture **resource allocation** and the ability to **manage/orchestrate individual containers** on a single host OS. Isolation of one process without container lifecycle/runtime management is not sufficient.

---
## III-II-02 — Annex III, Class II, item 2

**Category title (B1), verbatim:**

> Firewalls, intrusion detection and prevention systems

**Technical description (B2), verbatim:**

> Firewalls are products with digital elements that protect a connected network or system from unauthorized access by monitoring and restricting data communication traffic to and from that network. This category includes but is not limited to network firewalls and application firewalls such as web application firewalls or filters and anti-spam gateways. Intrusion detection systems are products with digital elements that monitor traffic once it has entered the network environment for suspicious activity and detect or identify that an intrusion has been attempted, is occurring, or has occurred on a connected network or system. This category includes but is not limited to network-based intrusion detection systems and host-based intrusion detection systems. Intrusion prevention systems are products with digital elements composed of an intrusion detection system that actively responds to an intrusion to a connected network or system. This category includes but is not limited to network-based intrusion prevention systems and host-based intrusion prevention systems.

**Our decisive conditions:**

1. firewall: protects a connected network or system from unauthorised access by monitoring and restricting traffic

2. IDS: monitors traffic that has entered the environment and detects intrusion

3. IPS: an IDS that actively responds

4. NOTE: no industrial-use condition exists

**Our note:**

IMPORTANT: the description contains NO industrial-use condition. v3/v4 both assumed Class II firewalls were 'intended for industrial use'; that qualifier is absent from the official text. A consumer firewall product appears to fall in Class II. Verify against B1 Annex III and re-check case A3-01.

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Correct alternatives for firewalls, IDS and IPS, including host- and network-based variants and application firewalls. The category imposes **no industrial-use qualifier**. A router integrating a firewall function is not automatically classified as a firewall where its own core function remains routing.

---
## III-II-03 — Annex III, Class II, item 3

**Category title (B1), verbatim:**

> Tamper-resistant microprocessors

**Technical description (B2), verbatim:**

> Products with digital elements that are microprocessors with security-related functionalities referred to in Table 'Class I', point 13, of this Annex, including tamper evidence, resistance or response, and which additionally are designed to provide protection of AVA_VAN level 2 or 3, as set out in the Common Criteria and the Common Evaluation Methodology.

**Our decisive conditions:**

1. is a microprocessor with security-related functionalities within Class I point 13

2. includes tamper evidence, resistance or response

3. designed to provide protection of AVA_VAN level 2 or 3

**Our note:**

Cross-references III-I-13 and adds a certification-level threshold (AVA_VAN 2 or 3). The rule engine needs cross-category references.

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

Cross-reference to Class I item 13, the tamper evidence/resistance/response feature, and **AVA_VAN level 2 or 3** are all in the text. The description says **designed to provide** that level, not necessarily already certified to it. The cross-reference carries over the beyond-chip security purpose.

---
## III-II-04 — Annex III, Class II, item 4

**Category title (B1), verbatim:**

> Tamper-resistant microcontrollers

**Technical description (B2), verbatim:**

> Products with digital elements that are microcontrollers with security-related functionalities referred to in Table 'Class I', point 14, of this Annex, including tamper evidence, resistance or response, and which additionally are designed to provide protection of AVA_VAN level 2 or 3, as set out in the Common Criteria and the Common Evaluation Methodology.

**Our decisive conditions:**

1. is a microcontroller with security-related functionalities within Class I point 14

2. includes tamper evidence, resistance or response

3. designed to provide protection of AVA_VAN level 2 or 3

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

As for II-03, but crossing to Class I item 14: qualifying programmable integrated-memory microcontroller, tamper evidence/resistance/response and **designed** AVA_VAN level 2 or 3. A claimed tamper feature alone, with no evidence on designed protection level, is insufficient.

---
## IV-01 — Annex IV, item 1

**Category title (B1), verbatim:**

> Hardware Devices with Security Boxes

**Technical description (B2), verbatim:**

> Hardware products with digital elements that securely store, process, or manage sensitive data or perform cryptographic operations, and that consist of multiple discrete components, incorporating a hardware physical envelope providing tamper evidence, resistance or response as countermeasures against physical attacks. This category includes but is not limited to physical payment terminals, hardware security modules that generate and manage cryptographic elements, and tachographs that meet the above description.

**Our decisive conditions:**

1. securely stores, processes or manages sensitive data, or performs cryptographic operations

2. consists of multiple discrete components

3. incorporates a hardware physical envelope providing tamper evidence, resistance or response against physical attacks

**Reviewer** — conditions are:  ☒ correct   ☐ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

All three material conditions are present: sensitive-data protection or cryptographic operation; **multiple discrete components**; and a **physical hardware envelope** offering tamper evidence/resistance/response as protection against physical attacks. HSMs, payment terminals and tachographs are examples **only where they meet the description**.

---
## IV-02 — Annex IV, item 2

**Category title (B1), verbatim:**

> Smart meter gateways within smart metering systems as defined in Article 2, point (23) of Directive (EU) 2019/944 and other devices for advanced security purposes, including for secure cryptoprocessing

**Technical description (B2), verbatim:**

> Smart meter gateways are products with digital elements that control communication between components in or connected to smart metering systems as defined in Article 2(23) of Directive (EU) 2019/944, and authorised third parties, such as utility providers. Smart meter gateways collect, process and store meter or personal data, protect data and information flows by supporting specific cryptographic needs, such as encryption and decryption of data, incorporate firewalling functionalities and provide the means to control other devices. This category includes but is not limited to smart meter gateways related to smart metering systems measuring electricity as defined in Article 2(23) of Directive (EU) 2019/944. It may also include smart meter gateways used in other smart metering systems measuring consumption of other sources of energy such as gas or heat, provided that the gateway meets this description.

**Our decisive conditions:**

1. controls communication between smart metering system components and authorised third parties

2. collects, processes and stores meter or personal data

3. supports specific cryptographic needs

4. incorporates firewalling functionality

5. provides the means to control other devices

**Open question we have flagged:**

- Is the second limb independently operative (Art. 8(1) anchors on Annex IV) or subsumed into the gateway description (ejusdem generis)? See second_limb_analysis.

- Water is not an energy source and is not named; gas and heat are. Illustrative or exhaustive? Only matters under reading B.

**Reviewer** — conditions are:  ☐ correct   ☒ incomplete   ☐ incorrect

**Missing / wrong / too strong / too weak, and why:**

These five conditions reconstruct the **smart-meter gateway** description, but the Annex IV category title separately refers to **"other devices for advanced security purposes, including for secure cryptoprocessing"**. Implementing Regulation 2025/2392 does **not** separately technically define that second limb: do not silently require every such device to be a metering gateway or to meet all five gateway conditions. The first limb cross-refers to Directive (EU) 2019/944 (electricity), while the description says **gas or heat may also qualify if the gateway meets it**. Water is not listed and its inclusion remains interpretively uncertain; do not silently generalise the energy examples to water.

---
## IV-03 — Annex IV, item 3

**Category title (B1), verbatim:**

> Smartcards or similar devices, including secure elements

**Technical description (B2), verbatim:**

> Secure elements are microcontrollers or microprocessors with security-related functionalities, including tamper evidence, resistance or response. They typically store, process, or manage cryptographic operations or sensitive data, such as identity credentials or payment credentials. Secure elements are designed to provide protection of at least AVA_VAN.4, as set out in the Common Criteria or the Common Evaluation Methodology. They can be discrete silicon or can be integrated into systems on chip (SoC). Secure elements can incorporate an application environment or an operating system, and can include one or more applications. This category includes but is not limited to Trusted Platform Modules (TPMs) and embedded Universal Integrated Circuit Card (UICC). Smartcards or similar devices are secure elements integrated into a carrier material, such as plastic or wood, in the shape of a card, or secure elements integrated into carrier materials taking other shapes. This category includes but is not limited to identity and travel documents, qualified signature cards, replaceable UICCs, physical payment cards, physical access cards, digital tachograph cards or wrist bands with integrated payment secure elements.

**Our decisive conditions:**

1. secure element: microcontroller/microprocessor with security-related functionalities including tamper evidence, resistance or response

2. stores, processes or manages cryptographic operations or sensitive data

3. designed to provide protection of AT LEAST AVA_VAN.4

4. smartcard: a secure element integrated into a carrier material

**Our note:**

Threshold is 'at least AVA_VAN.4' - higher than the AVA_VAN 2-3 of III-II-03/04. Note digital tachograph CARDS appear here, while tachographs themselves are named in IV-01.

**Reviewer** — conditions are:  ☐ correct   ☐ incomplete   ☒ incorrect

**Missing / wrong / too strong / too weak, and why:**

Condition 2 wrongly reads a **"typically"** feature as mandatory. Secure elements are microcontrollers/microprocessors with security functions including tamper evidence/resistance/response, **designed to provide at least AVA_VAN.4**; cryptographic/sensitive-data storage, processing or management is illustrative/typical, not an independent necessary test. Smartcards/similar devices comprise **secure elements integrated into a carrier material**, not necessarily only plastic/card-shaped forms. A design level need not mean an issued certificate.

---

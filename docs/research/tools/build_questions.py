#!/usr/bin/env python3
"""Build packages/rules/questions.json from the WP2 fact register plus answer labels.

The register stays the single source for question wording and 'why we ask'. This adds what the
screens need: answer options with labels, in the value conventions the engines expect.

  python3 build_questions.py          write the file
  python3 build_questions.py --check  exit 1 if the file is out of date (used in CI)
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REGISTER = ROOT / "docs/research/out/wp2-fact-register.json"
OUT = ROOT / "packages/rules/questions.json"

YES_NO = [{"value": True, "label": "Yes"}, {"value": False, "label": "No"}]
YES_NO_CODES = [{"value": "YES", "label": "Yes"}, {"value": "NO", "label": "No"}]
NOT_SURE = {"value": "UNKNOWN", "label": "Not sure"}
CONFLICT = {"value": "CONFLICTING", "label": "Our documents say different things"}

LABELS = {
    "PRODUCT_KIND": {"HARDWARE": "Hardware, with or without its own software", "SOFTWARE": "Software that users install or run",
                     "REMOTE_DATA_PROCESSING": "A cloud service our own product needs in order to work",
                     "SAAS_ONLY": "Only an online service, with no product of ours behind it"},
    "MARKET_STATUS": {"MADE_AVAILABLE": "On sale or supplied in the EU", "PLANNED": "Planned for the EU market, not yet available",
                      "EXHIBITION_ONLY": "Only shown at trade fairs or demonstrations so far", "OWN_USE_ONLY": "Used only inside our own organisation",
                      "NOT_EU": "Not supplied in the EU, and not planned"},
    "EXCLUSION_SCREEN": {"MEDICAL": "Medical or in vitro diagnostic device (Reg. 2017/745 or 2017/746)",
                         "VEHICLE": "Motor vehicle, or a system or component type-approved under Reg. 2019/2144",
                         "AVIATION": "Civil aviation product (Reg. 2018/1139)", "MARINE": "Marine equipment (Dir. 2014/90/EU)",
                         "L_CATEGORY": "Two- or three-wheel vehicle or quadricycle (Reg. 168/2013), or a part for one",
                         "SPARE_PART": "A spare part replacing an identical component",
                         "DEFENCE": "Made exclusively for national security or defence, or to process classified information",
                         "OTHER_SECTORAL": "Other sector rules that we think cover cybersecurity",
                         "OTHER_UNIDENTIFIED": "Excluded for another reason we cannot name"},
    "MEDICAL_STATUS": {"CE_MARKED_MDR_IVDR": "CE-marked as a medical or in vitro diagnostic device",
                       "MEDICAL_PURPOSE_NOT_CERTIFIED": "Has a medical purpose but is not certified as a medical device",
                       "NONE": "No medical purpose"},
    "VEHICLE_2019_2144": {"APPLIES": "Covered by a type approval under Reg. 2019/2144", "COMPONENT_UNCLEAR": "A component; unclear whether that Regulation covers it",
                          "NOT_APPLICABLE": "Not covered (for example equipment used to test vehicles)"},
    "AVIATION_2018_1139": {"CERTIFIED": "Certified under Reg. 2018/1139", "IN_SCOPE_NOT_CERTIFIED": "Within its scope but not certified",
                           "NOT_APPLICABLE": "Not an aviation product"},
    "L_CATEGORY_168_2013": {"L_CATEGORY": "Yes, an L-category vehicle or a part for one", "L1E_DESIGNED_TO_PEDAL": "An L1e vehicle designed to pedal, such as a speed pedelec",
                            "NOT_APPLICABLE": "No"},
    "SPARE_PART": {"IDENTICAL_SAME_SPEC": "Replaces an identical component, same specifications", "DIFFERENT_SPEC": "A replacement with different or improved specifications",
                   "NOT_A_SPARE_PART": "Not a spare part"},
    "DEFENCE_STATUS": {"EXCLUSIVELY_DEFENCE_OR_NATSEC": "Exclusively for national security or defence", "DESIGNED_FOR_CLASSIFIED": "Specifically designed to process classified information",
                       "DUAL_USE": "Also sold for civilian use", "NONE": "No"},
    "CONTROL_PATH": {"NETWORK_REMOTE": "From another system: an app over the internet, a hub or a cloud service",
                     "PROXIMITY_ONLY": "Only from a phone or device standing next to it (for example Bluetooth)",
                     "NONE": "Only on the device itself"},
    "IC_TYPE": {"MICROPROCESSOR": "A microprocessor (uses external memory)", "MICROCONTROLLER": "A microcontroller (memory integrated)",
                "SOC_UNCLEAR": "A system-on-chip; not clearly either", "ASIC": "An ASIC", "FPGA": "An FPGA",
                "NOT_AN_IC": "No, it is not itself a chip"},
    "AVA_VAN_LEVEL": {"NONE": "No AVA_VAN level", "1": "AVA_VAN.1", "2": "AVA_VAN.2", "3": "AVA_VAN.3", "4": "AVA_VAN.4", "5": "AVA_VAN.5"},
    "METERED_COMMODITY": {"ELECTRICITY": "Electricity", "GAS": "Gas", "HEAT": "Heat", "WATER": "Water", "OTHER": "Something else", "NONE": "Not part of a metering system"},
    "PURPOSE_SCREEN": {
        "IDENTITY": "checking who someone is, or controlling their access: identity management, access readers, authentication",
        "PASSWORDS": "storing and managing passwords (a password manager)",
        "MALWARE": "finding, removing or quarantining malicious software (antivirus)",
        "VPN": "setting up VPN connections",
        "SIEM": "collecting and correlating security events (SIEM)",
        "PKI": "issuing or managing digital certificates (PKI)",
        "FIREWALL": "filtering network traffic or detecting intrusions (firewall, IDS, IPS)",
        "OS": "being an operating system",
        "BOOT": "starting up a system (firmware, boot loader)",
        "BROWSER": "showing web content (a browser, or a browser component for other apps)",
        "VIRTUALISATION": "running virtual machines or containers",
        "ROUTING": "routing or switching network traffic, or connecting to the internet (router, modem, switch, access point)",
        "NETWORK_INTERFACE": "connecting a device to a network (network card, adapter, virtual network interface)",
        "NETWORK_MGMT": "managing or configuring other network equipment",
        "CHIP": "being a chip built into other products (processor, controller, ASIC, FPGA, secure element)",
        "SECURITY_BOX": "protecting keys or sensitive data in tamper-protected hardware (hardware security module, payment terminal, tachograph)",
        "CRYPTO_FOR_OTHERS": "cryptographic processing or key protection for other systems",
        "HOME_SECURITY": "protecting a home or the people in it (locks, alarms, security cameras, baby monitors)",
        "HOME_CONTROL": "controlling security devices in a home, such as locks or alarms (a hub or home automation app)",
        "VOICE_ASSISTANT": "being a voice or chat assistant for the home that answers requests and controls devices or services",
        "TOY": "being played with by children under 14 (a toy)",
        "WEARABLE": "being worn on the body (watch, band, ring, clothing)",
        "METERING": "linking an energy metering system to the utility or other outside parties (a gateway)"},
    "NETWORK_DEVICE_ROLE": {"ROUTER": "Routes traffic between networks (router)", "INTERNET_MODEM": "Modem for connecting to the internet",
                            "OTHER_MODEM": "Modem for something else, such as a point-to-point serial link",
                            "MANAGED_SWITCH_OR_BRIDGE": "Switch with management (managed or smart switch), or a bridge such as a wireless access point",
                            "UNMANAGED_SWITCH": "Unmanaged switch (no management interface)", "NONE": "None of these"},
    "TOY_INTERACTIVE_OR_TRACKING": {"SOCIAL_INTERACTIVE": "It can talk, listen, film or take typed input", "LOCATION_TRACKING": "It can track or work out where it, or the child, is",
                                    "BOTH": "Both", "PROXIMITY_ONLY": "It only notices when someone or another toy is nearby", "NONE": "Neither"},
    "VIRTUALISATION_TYPE": {"HYPERVISOR": "Runs virtual machines (hypervisor)", "CONTAINER_RUNTIME": "Runs containers on a machine (container runtime)",
                            "ORCHESTRATOR_ONLY": "Only schedules containers across machines; others run them",
                            "PROCESS_SANDBOX": "Isolates a single process (sandbox)", "NONE": "None of these"},
    "HIGH_RISK_AI_BASIS": {"NONE": "No high-risk AI system", "ANNEX_III": "High-risk under Annex III of the AI Act",
                           "ANNEX_I_SECTION_A": "High-risk because of a product law in Annex I, Section A, of the AI Act",
                           "ANNEX_I_SECTION_B": "High-risk because of a product law in Annex I, Section B (for example machinery)"},
}
OPTION_INFO_FOR = {"PURPOSE_SCREEN"}

# Official examples from the Commission FAQ v14 (non-binding), per purpose option. Quotes are
# verified verbatim against the held FAQ text in CI (packages/engine/test/legal-basis.test.ts).
FAQ_EXAMPLES = {
    "OS": [
        ("COUNTS", "An operating system that also includes small extra tools, such as a calculator, is still an operating system.",
         "products that have the core functionality of \"operating systems\" (an important product with digital elements of Class I) often include software that performs ancillary functions not included in the technical description of that product category, such as calculators or simple graphics editors"),
        ("NOT", "A smartphone contains an operating system, but is not itself an operating system.",
         "as a smartphone's core functionality is not that of an operating system or of a password manager, it is generally not to be considered to have the core functionality of an operating system or of a password manager")],
    "PASSWORDS": [
        ("NOT", "A smartphone with a built-in password manager is not a password manager.",
         "as a smartphone's core functionality is not that of an operating system or of a password manager, it is generally not to be considered to have the core functionality of an operating system or of a password manager")],
    "SIEM": [
        ("NOT", "Security orchestration (SOAR) software can do what a SIEM does, but is generally not a SIEM.",
         "SOAR software is generally not to be considered to have the core functionality of \"security information and event management (SIEM) systems\"")],
    "BROWSER": [
        ("NOT", "A news app with an embedded browser component is not a browser.",
         "integrating an embedded browser as a component of a news app for use in smartphones does not in itself render the news app subject to the conformity assessment procedure")],
    "CHIP": [
        ("NOT", "A laptop with a secure element inside is not a secure element.",
         "integrating a secure element into a laptop does not in itself render the laptop subject to the conformity assessment procedure")],
    "ROUTING": [
        ("COUNTS", "A router that also has a firewall is still a router.",
         "such as an operating system integrating browser functionality, or a router integrating firewall functionality")],
}


def option_info(cls, register=None):
    """For each purpose option: the categories it rules out when unticked (read from the rules:
    facts it settles, plus categories that build on those), with the official title, class,
    named products ('includes but is not limited to') and full description, verbatim from B2."""
    screen = next(d for d in cls["derive"] if d.get("screen") == "PURPOSE_SCREEN")
    inv = {c["id"]: c for c in json.loads((ROOT / "docs/research/out/wp1-category-inventory.json").read_text())["categories"]}
    by_fact = {}
    for cat in cls["categories"]:
        for c in cat["conditions"].values():
            if "fact" in c:
                by_fact.setdefault(c["fact"], set()).add(cat["category"])
    refs = {cat["category"]: {c["category"] for c in cat["conditions"].values() if "category" in c} for cat in cls["categories"]}
    out = {}
    for opt, sets in screen["unticked_sets"].items():
        cats = set().union(*(by_fact.get(f, set()) for f in sets))
        cats |= {k for k, v in refs.items() if v & cats}
        info = []
        for cid in cls["category_ids"]:
            if cid not in cats:
                continue
            c = inv[cid]
            desc = _clean(c["technical_description"])
            named = re.findall(r"This category includes but is not limited to [^.]*\.", desc)
            cls_name = "CRITICAL" if cid.startswith("IV") else "IMPORTANT_II" if cid.startswith("III-II") else "IMPORTANT_I"
            # Mark every decisive condition of the rule inside the official description.
            rule = next(r for r in cls["categories"] if r["category"] == cid)
            quotes = [cond["quote"] for cond in rule["conditions"].values()]
            # plus the verified legal-basis quotes of the questions that test this category
            for cond in rule["conditions"].values():
                for lb in (register or {}).get(cond.get("fact"), {}).get("legal_basis", []):
                    if lb.get("src") == "B2" and lb.get("cat") == cid:
                        quotes.append(lb["quote"])
            spans = []
            for quote in quotes:
                try:
                    spans.append(_find(desc, quote))
                except SystemExit:
                    pass  # the quote is in the category title or another category, not in this description
            spans.sort()
            merged = []
            for a, b in spans:
                if merged and a <= merged[-1][1]:
                    merged[-1] = (merged[-1][0], max(b, merged[-1][1]))
                else:
                    merged.append((a, b))
            parts, pos = [], 0
            for a, b in merged:
                if a > pos:
                    parts.append({"text": desc[pos:a]})
                parts.append({"text": desc[a:b], "mark": True})
                pos = b
            if pos < len(desc):
                parts.append({"text": desc[pos:]})
            info.append({"category": cid, "title": c["title"], "class": cls_name, "named_products": named,
                         "description": desc, "description_parts": parts})
        out[opt] = info
    return out


# A multi-select whose options continue a sentence; the stem stays visible above the options.
STEMS = {"PURPOSE_SCREEN": ("My product is mainly for …",
                            "Not for features it also has. An app with a login is not mainly for checking who someone is; "
                            "a camera is not mainly for protecting a home unless that is what it is sold for.")}
# Shown above the stem: the list is about purpose, not sector, and the sectors named are examples only.
STEM_NOTES = {"PURPOSE_SCREEN":
    "The CRA applies in every sector, including ones it does not mention (for example industry, transport, "
    "office, education, healthcare, finance). The class depends on what the product is for, not on its sector."}
GROUPS = {"PURPOSE_SCREEN": [
    ("Security software", ["IDENTITY", "PASSWORDS", "MALWARE", "VPN", "SIEM", "PKI", "FIREWALL"]),
    ("System software", ["OS", "BOOT", "BROWSER", "VIRTUALISATION"]),
    ("Network equipment", ["ROUTING", "NETWORK_INTERFACE", "NETWORK_MGMT"]),
    ("Chips and hardware security", ["CHIP", "SECURITY_BOX", "CRYPTO_FOR_OTHERS"]),
    ("Home and personal products", ["HOME_SECURITY", "HOME_CONTROL", "VOICE_ASSISTANT", "TOY", "WEARABLE"]),
    ("Energy", ["METERING"])]}
# Facts where the user's own documents can genuinely disagree: offer "documents say different things".
CONFLICT_OK = {"PROTECTS_PHYSICAL_SECURITY", "RESIDENTIAL_SETTING", "STORES_PASSWORDS_CORE", "ADVANCED_SECURITY_CORE", "CENTRAL_CONTROL_OF_SECURITY",
               "IS_TOY", "FOR_CHILDREN_UNDER_14", "CRYPTO_CORE", "SECURITY_PURPOSE_OUTPUT"}
# Value conventions per engine: classification and scope use booleans; the timeline uses YES/NO codes.
CODE_FACTS = {"CHANGE_AFFECTS_ANNEX_I", "RADIO_EQUIPMENT_RED_DA"}
EXTRA = {
    "CERTIFICATE_EXPIRY": {"question": "When does that certificate expire?", "kind": "date",
                           "why_we_ask": "The certificate stays valid until 11 June 2028, or until its own expiry date if that comes first.",
                           "legal_basis": [{"src": "CRA", "art": "69", "para": "1", "quote": "shall remain valid until 11 June 2028, unless they expire before that date", "ref": "CRA Art. 69(1)"}],
                           "follows": "OTHER_LEGISLATION_CERTIFICATE"},
    "ASSESSMENT_DATE": {"question": "Assessment date", "kind": "date", "why_we_ask": "Which obligations already apply depends on the date of the assessment.", "legal_basis": [], "internal": True},
}


# ------------------------------------------------------------------ legal text, laid out like law

import re
_PROV = json.loads((ROOT / "docs/research/out/wp1-provisions.json").read_text())["articles"]
_REC = json.loads((ROOT / "docs/legal/extracted/B1-recitals.json").read_text())["recitals"]
_INV = {c["id"]: c for c in json.loads((ROOT / "docs/research/out/wp1-category-inventory.json").read_text())["categories"]}
_OTHER = {k: json.loads((ROOT / f"docs/legal/extracted/{k}-text.json").read_text())["text"] for k in ("B14", "B16")}
ACTS = {"CRA": "Regulation (EU) 2024/2847 (Cyber Resilience Act)", "RECITAL": "Regulation (EU) 2024/2847 (Cyber Resilience Act)",
        "B2": "Implementing Regulation (EU) 2025/2392", "B14": "Delegated Regulation (EU) 2025/1535",
        "B16": "Delegated Regulation (EU) 2022/30"}
CLASS_PART = {"III-I": "Annex, Class I, point", "III-II": "Annex, Class II, point", "IV": "Annex, critical products, point"}


def _clean(t):
    return re.sub(r"\s+", " ", re.sub(r"\u00ad\s*", "", t)).strip()


def _find(text, quote):
    """Locate the quote in the text, tolerating whitespace and straight/curly quote marks."""
    pat = ""
    for ch in _clean(quote):
        pat += r"\s+" if ch == " " else "['\u2018\u2019]" if ch in "'\u2018\u2019" else '["\u201c\u201d]' if ch in '"\u201c\u201d' else re.escape(ch)
    m = re.search(pat, text)
    if not m:
        raise SystemExit(f"legal quote not found in its source: {quote[:70]!r}")
    return m.start(), m.end()


def _lines(text, label, hl):
    """Split a provision into its intro and its points: (a), (b), ... at level 1 and (i), (ii), ...
    at level 2, each on its own line without repeating its letter, carrying the highlighted span
    into whichever lines it covers."""
    marks = list(re.finditer(r"(?:(?<=[:;,]) |(?<=[:;]))\((?P<p>[a-z]|[ivx]{1,4})\) ", text))
    cuts = [0] + [m.start() for m in marks] + [len(text)]
    out = []
    for i in range(len(cuts) - 1):
        a, b = cuts[i], cuts[i + 1]
        raw = text[a:b]
        lead = len(raw) - len(raw.lstrip())
        m = re.match(r"\((?P<p>[a-z]|[ivx]{1,4})\) ", raw[lead:]) if i else None
        off = a + lead + (m.end() if m else 0)
        end = a + len(raw.rstrip())
        lo, hi = max(hl[0], off), min(hl[1], end)
        parts = ([{"text": text[off:lo]}, {"text": text[lo:hi], "mark": True}, {"text": text[hi:end]}]
                 if lo < hi else [{"text": text[off:end]}])
        level = 0
        if m:
            p = m.group("p")
            prev = out[-1]["label"] if out else ""
            # "(i)" after "(h)" is the letter i; after a level-1 point it opens roman sub-points.
            level = 2 if (re.fullmatch(r"[ivx]+", p) and not (p == "i" and prev == "(h)")) and len(p) >= 1 and any(o["level"] == 1 for o in out) else 1
        out.append({"label": f"({m.group('p')})" if m else (label if i == 0 else ""), "level": level, "point": bool(m),
                    "parts": [x for x in parts if x["text"]]})
    return out


def _excerpt(text, hl):
    """For long texts (recitals, whole acts): the sentences around the quote, with ellipses."""
    starts = [0] + [m.end() for m in re.finditer(r"(?<=[.;:])\s+(?=[A-Z(])", text)]
    a = max(s for s in starts if s <= hl[0])
    b = min([e for e in [m.start() + 1 for m in re.finditer(r"[.;](?=\s|$)", text)] if e >= hl[1]] + [len(text)])
    return a, b


def layout(l):
    src = l["src"]
    if src in ("AIACT", "EHDS"):
        return None  # citation only: no extracted text held
    if src == "CRA":
        art = _PROV[l["art"]]
        text = _clean(art["definitions"][l["def"]] if "def" in l else art["paragraphs"][l["para"]])
        heading = f"Article {l['art']}: {art['title']}"
        label = f"({l['def']})" if "def" in l else f"{l['para']}."
        a, b = _find(text, l["quote"])
        return {"act": ACTS[src], "heading": heading, "lines": _lines(text, label, (a, b))}
    if src == "B2":
        c = _INV[l["cat"]]
        part = next(v for k, v in sorted(CLASS_PART.items(), key=lambda x: -len(x[0])) if l["cat"].startswith(k + "-"))
        point = f"{part} {int(l['cat'].split('-')[-1])}"
        text = _clean(c["technical_description"])
        try:
            a, b = _find(text, l["quote"])
        except SystemExit:  # the quote is in the category title (as listed in the CRA's Annex), not its description
            title = _clean(c["title"])
            a, b = _find(title, l["quote"])
            return {"act": "Regulation (EU) 2024/2847 (Cyber Resilience Act)", "heading": point.replace("Annex,", "Annex IV,") if l["cat"].startswith("IV") else point,
                    "lines": _lines(title, "", (a, b))}
        return {"act": ACTS[src], "heading": f"{point}: {c['title']}", "lines": _lines(text, "", (a, b))}
    if src == "RECITAL":
        text = _clean(_REC[l["n"]])
        a, b = _find(text, l["quote"])
        x, y = _excerpt(text, (a, b))
        sub = text[x:y]
        lines = _lines(sub, f"({l['n']})", (a - x, b - x))
        if x > 0:
            lines[0]["parts"].insert(0, {"text": "… "})
        if y < len(text):
            lines[-1]["parts"].append({"text": " …"})
        return {"act": ACTS[src], "heading": "Recitals", "lines": lines}
    text = _clean(_OTHER[src])
    a, b = _find(text, l["quote"])
    arts = [m for m in re.finditer(r"Article (\d+) ", text) if m.start() <= a]
    start = arts[-1].end() if arts else 0
    nxt = re.search(r" Article \d+ ", text[b:])
    end = b + nxt.start() if nxt else len(text)
    # Only the numbered paragraph that contains the quote.
    paras = [start] + [start + m.start() + 1 for m in re.finditer(r" \d+\. (?=[A-Z])", text[start:end])] + [end]
    ps = max(x for x in paras[:-1] if x <= a)
    pe = min(x for x in paras[1:] if x > ps)
    body = text[ps:pe].strip()
    pm = re.match(r"(\d+)\. ", body)
    label = f"{pm.group(1)}." if pm else ""
    shift = ps + (len(text[ps:pe]) - len(text[ps:pe].lstrip())) + (pm.end() if pm else 0)
    body = body[pm.end():] if pm else body
    return {"act": ACTS[src], "heading": f"Article {arts[-1].group(1)}" if arts else "", "lines": _lines(body, label, (a - shift, b - shift))}


def options(fid, kind, rules_values, rules_type=None):
    if rules_type == "bool" and fid not in CODE_FACTS:
        opts = YES_NO
    elif kind in ("bool", "bool+date"):
        opts = YES_NO_CODES if fid in CODE_FACTS else YES_NO
    elif kind.startswith("enum:") and fid in CODE_FACTS:
        opts = YES_NO_CODES
    elif rules_values:
        labels = LABELS.get(fid, {})
        opts = [{"value": v, "label": labels.get(str(v), str(v))} for v in rules_values]
    else:
        return None
    opts = list(opts)
    if not kind.startswith("multi"):
        opts.append(NOT_SURE)
    if fid in CONFLICT_OK:
        opts.append(CONFLICT)
    return opts


def build():
    reg = {f["fact_id"]: f for f in json.loads(REGISTER.read_text())["facts"] if f.get("status") != "SUPERSEDED"}
    cls = json.loads((ROOT / "packages/rules/classification.json").read_text())
    scope = json.loads((ROOT / "packages/rules/scope.json").read_text())
    values = {k: v.get("values") for k, v in cls["facts"].items()}
    values.update({k: v.get("values") for k, v in scope["facts"].items()})
    types = {k: v.get("type") for k, v in cls["facts"].items()}
    types.update({k: ("bool" if v.get("values") == [True, False] else v.get("type", "enum")) for k, v in scope["facts"].items()})
    timeline = ["UNITS_PLACED_ON_MARKET", "CHANGE_AT", "CHANGE_AFFECTS_PURPOSE", "CHANGE_AFFECTS_ANNEX_I",
                "RADIO_EQUIPMENT_RED_DA", "OTHER_LEGISLATION_CERTIFICATE"]
    used = list(dict.fromkeys(list(scope["facts"]) + list(cls["facts"]) + timeline))
    out = {}
    for fid in used:
        if fid not in reg:
            sys.exit(f"Rules use {fid}, which has no question in the fact register. Add it there first.")
        f = reg[fid]
        if "user_why" not in f:
            sys.exit(f"{fid} has no plain-language 'user_why' in the fact register (DoD item 5). Add it, with its legal_basis.")
        kind = f["kind"]
        q = {"question": f["question"], "kind": "date" if kind.startswith("date") else kind.split(":")[0],
             "why_we_ask": f["user_why"], "evidence": f["evidence_expectation"],
             "legal_basis": [{**l, "text": layout(l)} for l in f.get("legal_basis", [])]}
        if f.get("question_hint"):
            q["hint"] = f["question_hint"]
        if kind.startswith("date") and fid == "UNITS_PLACED_ON_MARKET":
            q["kind"] = "date"
        opts = options(fid, kind, values.get(fid), types.get(fid))
        if types.get(fid) == "bool" and fid not in CODE_FACTS:
            q["kind"] = "bool"
        if opts:
            q["options"] = opts
        if fid in ("UNITS_PLACED_ON_MARKET", "CHANGE_AT"):
            q["kind"] = "date"
            q["options"] = [NOT_SURE] if fid == "UNITS_PLACED_ON_MARKET" else [{"value": "", "label": "No change since placing"}, NOT_SURE]
        if fid in OPTION_INFO_FOR:
            info = option_info(cls, reg)
            for o in q.get("options", []):
                o["info"] = info.get(o["value"], [])
                o["faq_examples"] = [{"counts": c == "COUNTS", "text": t, "quote": qt, "source": "Commission FAQ v14 (non-binding)"}
                                     for c, t, qt in FAQ_EXAMPLES.get(o["value"], [])]
        if fid in STEMS:
            q["stem"], q["stem_warning"] = STEMS[fid]
        if fid in STEM_NOTES:
            q["stem_note"] = STEM_NOTES[fid]
        if fid in GROUPS:
            grp = {o: g for g, opts in GROUPS[fid] for o in opts}
            missing = [o["value"] for o in q["options"] if o["value"] not in grp]
            if missing:
                sys.exit(f"{fid}: options without a group: {missing}")
            for o in q["options"]:
                o["group"] = grp[o["value"]]
            order = [o for g, opts in GROUPS[fid] for o in opts]
            q["options"].sort(key=lambda o: order.index(o["value"]))
        out[fid] = q
    for k, v in EXTRA.items():
        out[k] = {**v, "legal_basis": [{**l, "text": layout(l)} for l in v.get("legal_basis", [])]}
    inv = json.loads((ROOT / "docs/research/out/wp1-category-inventory.json").read_text())
    cls_of = lambda cid: "CRITICAL" if cid.startswith("IV") else "IMPORTANT_II" if cid.startswith("III-II") else "IMPORTANT_I"
    cats = {c["id"]: {"title": c["title"], "class": cls_of(c["id"])} for c in inv["categories"]}
    return {"artifact": "questions", "generated_by": "docs/research/tools/build_questions.py",
            "note": "Question wording comes from the WP2 fact register; category titles verbatim from B2. Edit at the source and regenerate.",
            "questions": out, "categories": cats}


if __name__ == "__main__":
    text = json.dumps(build(), indent=1, ensure_ascii=False) + "\n"
    if "--check" in sys.argv:
        ok = OUT.exists() and OUT.read_text() == text
        print("questions.json up to date" if ok else "questions.json is out of date: run build_questions.py")
        sys.exit(0 if ok else 1)
    OUT.write_text(text)
    print(f"wrote {OUT.relative_to(ROOT)} ({len(json.loads(text)['questions'])} questions)")

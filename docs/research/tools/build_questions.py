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
    "HIGH_RISK_AI_BASIS": {"NONE": "No high-risk AI system", "ANNEX_III": "High-risk under Annex III of the AI Act",
                           "ANNEX_I_SECTION_A": "High-risk because of a product law in Annex I, Section A, of the AI Act",
                           "ANNEX_I_SECTION_B": "High-risk because of a product law in Annex I, Section B (for example machinery)"},
}
# Facts where the user's own documents can genuinely disagree: offer "documents say different things".
CONFLICT_OK = {"PROTECTS_PHYSICAL_SECURITY", "RESIDENTIAL_SETTING", "STORES_PASSWORDS_CORE", "ADVANCED_SECURITY_CORE", "CENTRAL_CONTROL_OF_SECURITY"}
# Value conventions per engine: classification and scope use booleans; the timeline uses YES/NO codes.
CODE_FACTS = {"CHANGE_AFFECTS_ANNEX_I", "RADIO_EQUIPMENT_RED_DA"}
EXTRA = {
    "CERTIFICATE_EXPIRY": {"question": "When does that certificate expire?", "kind": "date", "why_we_ask": "Art. 69(1): validity ends at the certificate's own expiry if that is before 11.6.2028.",
                           "follows": "OTHER_LEGISLATION_CERTIFICATE"},
    "ASSESSMENT_DATE": {"question": "Assessment date", "kind": "date", "why_we_ask": "Which obligations already apply depends on the date of the assessment.", "internal": True},
}


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
    used = list(dict.fromkeys(list(scope["facts"]) + ["CORE_FUNCTION"] + list(cls["facts"]) + timeline))
    out = {}
    for fid in used:
        f = reg[fid]  # KeyError here means a rule uses a fact with no question: fix the register
        kind = f["kind"]
        q = {"question": f["question"], "kind": "date" if kind.startswith("date") else kind.split(":")[0],
             "why_we_ask": f["why_we_ask"], "evidence": f["evidence_expectation"]}
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
        out[fid] = q
    out.update(EXTRA)
    return {"artifact": "questions", "generated_by": "docs/research/tools/build_questions.py",
            "note": "Question wording comes from the WP2 fact register; edit it there and regenerate.", "questions": out}


if __name__ == "__main__":
    text = json.dumps(build(), indent=1, ensure_ascii=False) + "\n"
    if "--check" in sys.argv:
        ok = OUT.exists() and OUT.read_text() == text
        print("questions.json up to date" if ok else "questions.json is out of date: run build_questions.py")
        sys.exit(0 if ok else 1)
    OUT.write_text(text)
    print(f"wrote {OUT.relative_to(ROOT)} ({len(json.loads(text)['questions'])} questions)")

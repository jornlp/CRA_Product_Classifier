#!/usr/bin/env python3
"""WP7 timeline trial: per-obligation timeline from dated facts (see timeline.json).

Facts: ASSESSMENT_DATE, UNITS_PLACED_ON_MARKET (date or UNKNOWN), CHANGE_AT, CHANGE_AFFECTS_PURPOSE,
CHANGE_AFFECTS_ANNEX_I (YES/NO/UNKNOWN), RADIO_EQUIPMENT_RED_DA (YES/NO/UNKNOWN),
OTHER_LEGISLATION_CERTIFICATE (bool) with CERTIFICATE_EXPIRY. TYPE_FIRST_LAUNCHED may be present and must be ignored.
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).parent
SPEC = json.loads((HERE / "timeline.json").read_text())
D = SPEC["dates"]
UNK = "UNKNOWN"


def item(obl, status, provision, applies_from=None, basis="", open_q=None):
    i = {"obligation": obl, "status": status, "provision": provision, "basis": basis}
    if applies_from:
        i["applies_from"] = applies_from
    if open_q:
        i["open_questions"] = open_q
    return i


def substantial_modification(f):
    """Art. 3(30) and 69(2). Returns TRUE / FALSE / UNRESOLVED with the reason."""
    change_at = f.get("CHANGE_AT")
    if not change_at:
        return "FALSE", "no change after placing"
    if change_at == UNK:
        return "UNRESOLVED", "date of the change unknown"
    if change_at < D["CRA_APPLICATION"]:
        return "FALSE", "change made before 11.12.2027; Art. 69(2) counts only changes from that date"
    if f.get("CHANGE_AFFECTS_PURPOSE") is True:
        return "TRUE", "change modifies the intended purpose (Art. 3(30), second limb)"
    a = f.get("CHANGE_AFFECTS_ANNEX_I", UNK)
    if f.get("CHANGE_AFFECTS_PURPOSE") is False and a == "NO":
        return "FALSE", "purpose unchanged and no effect on security properties reported"
    return "UNRESOLVED", ("change affects security properties; whether it affects compliance with Annex I Part I "
                          "(Art. 3(30), first limb) cannot be decided here: review flag" if a == "YES" else
                          "effect on Annex I Part I compliance unknown; unchanged purpose alone does not settle it (LIFE-08)")


def timeline(f):
    today, placed = f["ASSESSMENT_DATE"], f.get("UNITS_PLACED_ON_MARKET", UNK)
    out, flags = [], []
    # Art. 14: no placing date needed (Art. 69(3)).
    out.append(item("CRA_ART_14_REPORTING", "APPLIES" if today >= D["CRA_ART14"] else "NOT_YET", "Art. 14; Art. 69(3)",
                    D["CRA_ART14"], "applies to all in-scope products, whenever placed"))
    # Essential requirements: keyed on the units' placing date.
    p = "Art. 69(2); Art. 71(2)"
    if placed == UNK:
        out.append(item("CRA_ESSENTIAL_REQUIREMENTS", "UNRESOLVED", p, D["CRA_APPLICATION"],
                        "placing date of the units unknown", ["When are or were these units placed on the market?"]))
    elif placed >= D["CRA_APPLICATION"]:
        st = "APPLIES" if today >= D["CRA_APPLICATION"] else "NOT_YET"
        out.append(item("CRA_ESSENTIAL_REQUIREMENTS", st, p, D["CRA_APPLICATION"],
                        "units placed on or after 11.12.2027; earlier placement of the same type gives no protection"))
    else:
        sm, why = substantial_modification(f)
        if sm == "TRUE":
            out.append(item("CRA_ESSENTIAL_REQUIREMENTS", "APPLIES", p + "; Art. 3(30)", f["CHANGE_AT"], why))
        elif sm == "FALSE":
            out.append(item("CRA_ESSENTIAL_REQUIREMENTS", "TRANSITION", p, None,
                            "units placed before 11.12.2027 and not substantially modified from that date: " + why))
        else:
            out.append(item("CRA_ESSENTIAL_REQUIREMENTS", "UNRESOLVED", p + "; Art. 3(30)", None, why,
                            ["Is the change a substantial modification under Art. 3(30)?"]))
            flags.append("SUBSTANTIAL_MODIFICATION_REVIEW")
    # Art. 69(1) certificates.
    if f.get("OTHER_LEGISLATION_CERTIFICATE"):
        exp = f.get("CERTIFICATE_EXPIRY")
        end = min(exp, D["CERT_VALIDITY_END"]) if exp and exp != UNK else D["CERT_VALIDITY_END"]
        out.append(item("OTHER_LEGISLATION_CERTIFICATE", "TRANSITION" if today < end else "NOT_APPLICABLE", "Art. 69(1)", None,
                        f"certificate remains valid until {end}, unless the other legislation provides otherwise",
                        ["Does the other legislation set a different validity?"]))
    # RED delegated act.
    radio = f.get("RADIO_EQUIPMENT_RED_DA", "NO")
    p = "Del. Reg. (EU) 2022/30"
    if radio == "YES":
        if placed == UNK:
            out.append(item("RED_DA_CYBERSECURITY", "UNRESOLVED", p, D["RED_DA_APPLICATION"], "placing date of the units unknown"))
        elif placed < D["RED_DA_APPLICATION"]:
            out.append(item("RED_DA_CYBERSECURITY", "NOT_APPLICABLE", p, D["RED_DA_APPLICATION"], "units placed before 1.8.2025"))
        else:
            oq = ["The Commission aims to repeal the delegated act from 11.12.2027; no repeal is in force. Re-check."] \
                if placed >= D["CRA_APPLICATION"] else None
            out.append(item("RED_DA_CYBERSECURITY", "APPLIES", p, D["RED_DA_APPLICATION"],
                            "radio equipment within the delegated act, placed on or after 1.8.2025", oq))
    elif radio == UNK:
        out.append(item("RED_DA_CYBERSECURITY", "UNRESOLVED", p, D["RED_DA_APPLICATION"], "whether the delegated act covers the product is unknown"))
    return out, flags


def resolve_reference(ref, assessment_date):
    for r in ref["resolves"]:
        if ("before" in r and assessment_date < r["before"]) or ("on_or_after" in r and assessment_date >= r["on_or_after"]):
            return r["to"]


FIXTURES = [
 ("LIFE-01", {"ASSESSMENT_DATE": "2026-10-12", "UNITS_PLACED_ON_MARKET": "2026-03-01"},
  {"CRA_ART_14_REPORTING": "APPLIES", "CRA_ESSENTIAL_REQUIREMENTS": "TRANSITION"}),
 ("LIFE-03", {"ASSESSMENT_DATE": "2028-04-01", "UNITS_PLACED_ON_MARKET": "2028-03-01"},
  {"CRA_ART_14_REPORTING": "APPLIES", "CRA_ESSENTIAL_REQUIREMENTS": "APPLIES"}),
 ("LIFE-06", {"ASSESSMENT_DATE": "2026-10-12", "UNITS_PLACED_ON_MARKET": "UNKNOWN"},
  {"CRA_ART_14_REPORTING": "APPLIES", "CRA_ESSENTIAL_REQUIREMENTS": "UNRESOLVED"}),
 ("TYPE-01", {"ASSESSMENT_DATE": "2026-10-12", "UNITS_PLACED_ON_MARKET": "2027-06-01", "TYPE_FIRST_LAUNCHED": "2027-06-01"},
  {"CRA_ESSENTIAL_REQUIREMENTS": "TRANSITION"}),
 ("TYPE-02", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2028-02-01", "TYPE_FIRST_LAUNCHED": "2027-06-01"},
  {"CRA_ESSENTIAL_REQUIREMENTS": "APPLIES"}),
 ("LIFE-02", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2026-05-01", "CHANGE_AT": "2028-02-01",
              "CHANGE_AFFECTS_PURPOSE": False, "CHANGE_AFFECTS_ANNEX_I": "UNKNOWN"},
  {"CRA_ESSENTIAL_REQUIREMENTS": "UNRESOLVED"}),
 ("LIFE-04", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2026-05-01", "CHANGE_AT": "2028-02-01",
              "CHANGE_AFFECTS_PURPOSE": False, "CHANGE_AFFECTS_ANNEX_I": "NO"},
  {"CRA_ESSENTIAL_REQUIREMENTS": "TRANSITION"}),
 ("LIFE-05", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2026-05-01", "CHANGE_AT": "2028-02-01",
              "CHANGE_AFFECTS_PURPOSE": False, "CHANGE_AFFECTS_ANNEX_I": "YES"},
  {"CRA_ESSENTIAL_REQUIREMENTS": "UNRESOLVED"}),
 ("LIFE-08", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2026-05-01", "CHANGE_AT": "2028-02-01",
              "CHANGE_AFFECTS_PURPOSE": False},
  {"CRA_ESSENTIAL_REQUIREMENTS": "UNRESOLVED"}),
 ("LIFE-09", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2026-05-01", "CHANGE_AT": "2028-02-01",
              "CHANGE_AFFECTS_PURPOSE": True},
  {"CRA_ESSENTIAL_REQUIREMENTS": "APPLIES"}),
 ("LIFE-10", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2026-05-01", "CHANGE_AT": "2027-06-01",
              "CHANGE_AFFECTS_PURPOSE": True},
  {"CRA_ESSENTIAL_REQUIREMENTS": "TRANSITION"}),
 ("LIFE-07", {"ASSESSMENT_DATE": "2027-12-20", "UNITS_PLACED_ON_MARKET": "2026-05-01", "OTHER_LEGISLATION_CERTIFICATE": True,
              "CERTIFICATE_EXPIRY": "2029-01-01"},
  {"OTHER_LEGISLATION_CERTIFICATE": "TRANSITION"}),
 ("LIFE-11", {"ASSESSMENT_DATE": "2028-03-01", "UNITS_PLACED_ON_MARKET": "2026-05-01", "OTHER_LEGISLATION_CERTIFICATE": True,
               "CERTIFICATE_EXPIRY": "2028-01-01"},
  {"OTHER_LEGISLATION_CERTIFICATE": "NOT_APPLICABLE"}),
 ("RED-01", {"ASSESSMENT_DATE": "2026-10-12", "UNITS_PLACED_ON_MARKET": "2026-01-10", "RADIO_EQUIPMENT_RED_DA": "YES"},
  {"CRA_ESSENTIAL_REQUIREMENTS": "TRANSITION", "RED_DA_CYBERSECURITY": "APPLIES"}),
 ("RED-02", {"ASSESSMENT_DATE": "2028-02-01", "UNITS_PLACED_ON_MARKET": "2028-01-10", "RADIO_EQUIPMENT_RED_DA": "YES"},
  {"CRA_ESSENTIAL_REQUIREMENTS": "APPLIES", "RED_DA_CYBERSECURITY": "APPLIES"}),
 ("RED-03", {"ASSESSMENT_DATE": "2026-10-12", "UNITS_PLACED_ON_MARKET": "2025-03-01", "RADIO_EQUIPMENT_RED_DA": "YES"},
  {"RED_DA_CYBERSECURITY": "NOT_APPLICABLE"}),
 ("RED-04", {"ASSESSMENT_DATE": "2026-10-12", "UNITS_PLACED_ON_MARKET": "UNKNOWN", "RADIO_EQUIPMENT_RED_DA": "YES"},
  {"CRA_ART_14_REPORTING": "APPLIES", "RED_DA_CYBERSECURITY": "UNRESOLVED"}),
]
REFS = [("A3-05", "2029-01-01", "Directive 2009/48/EC"),
        ("A3-06", "2030-09-01", "Regulation (EU) 2025/2509, via its Art. 56 correlation clause")]


def main():
    fails = 0
    for case, facts, exp in FIXTURES:
        tl, flags = timeline(facts)
        got = {i["obligation"]: i["status"] for i in tl}
        ok = all(got.get(k) == v for k, v in exp.items())
        fails += not ok
        print(f"{'PASS' if ok else 'FAIL'} {case:9} " + "  ".join(f"{k.split('_',1)[1][:22]}={v}" for k, v in got.items())
              + (f"  flags={flags}" if flags else ""))
        if not ok:
            print("      expected", exp)
        for i in tl:
            if i.get("open_questions") and case in ("RED-02", "LIFE-05"):
                print(f"      {i['obligation']}: {i['basis']} | open: {i['open_questions'][0]}")
    ref = SPEC["dated_references"][0]
    for case, date, want in REFS:
        got = resolve_reference(ref, date)
        fails += got != want
        print(f"{'PASS' if got == want else 'FAIL'} {case:9} III-I-18 toy reference on {date} -> {got}")
    n = len(FIXTURES) + len(REFS)
    print(f"\n{n - fails}/{n} timeline fixtures pass")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

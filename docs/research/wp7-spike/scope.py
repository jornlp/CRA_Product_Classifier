#!/usr/bin/env python3
"""WP7 scope trial: Art. 2(1) applicability and Art. 2(2)-(7) exclusions (scope.json).

Reuses the four-valued combinators from evaluate.py. Scope = applicability AND NOT any exclusion.
The evidence gate applies to whichever result is permissive: FALSE for applicability, TRUE for
an exclusion. A permissive result without the provenance the fact requires counts as UNKNOWN.
"""
import json, sys
from pathlib import Path
from evaluate import combine, eval_match, AND_ORDER, OR_ORDER, T, F, U, C, O

HERE = Path(__file__).parent
SPEC = json.loads((HERE.parents[2] / "packages/rules/scope.json").read_text())
RANK = SPEC["provenance_rank"]


def derive(facts):
    facts = dict(facts)
    for d in SPEC["derive"]:
        if "screen" in d:
            scr = facts.get(d["screen"])
            if scr and isinstance(scr["value"], list) and d.get("unsure") not in scr["value"]:
                for opt, sets in d["unticked_sets"].items():
                    if opt not in scr["value"]:
                        for fk, fv in sets.items():
                            facts.setdefault(fk, {"value": fv, "provenance": scr.get("provenance", "USER_CONFIRMED"), "derived": d["why"]})
            continue
        (k, v), = d["if"].items()
        if facts.get(k, {}).get("value") == v:
            for fk, fv in d["then"].items():
                facts.setdefault(fk, {"value": fv, "provenance": facts[k].get("provenance", "USER_CONFIRMED"), "derived": d["why"]})
    return facts


def cond_value(cond, facts, permissive, trace):
    f = facts.get(cond["fact"])
    if f is None or f["value"] in (U, C):
        return f["value"] if f else U
    v = f["value"]
    if "contains" in cond:
        r = cond["if_contains"] if cond["contains"] in v else cond["default"]
    elif "is" in cond:
        r = T if v == cond["is"] else F
    else:
        key = "TRUE" if v is True else "FALSE" if v is False else v
        r = cond["map"].get(key, cond.get("default", U))
    need = SPEC["facts"][cond["fact"]]["requires"]
    if r == permissive and RANK.get(f.get("provenance", "USER_CONFIRMED"), 0) < RANK[need]:
        trace.append(f"{cond['fact']}={v} gives the permissive result but is {f.get('provenance')}; needs {need}")
        return U
    return r


def NOT(v):
    return {T: F, F: T}.get(v, v)


def scope(raw):
    facts, trace = derive(raw), []
    a = SPEC["applicability"]
    av = {k: cond_value(c, facts, a["permissive_result"], trace) for k, c in a["conditions"].items()}
    applicable = eval_match(a["match"], av)
    e = SPEC["exclusions"]
    ev = {k: cond_value(c, facts, e["permissive_result"], trace) for k, c in e["conditions"].items()}
    excluded = combine(list(ev.values()), OR_ORDER)
    result = combine([applicable, NOT(excluded)], AND_ORDER)
    status = {T: "IN_SCOPE", F: "OUT_OF_SCOPE"}.get(result, "UNRESOLVED")
    reasons = []
    if status == "OUT_OF_SCOPE":
        reasons += [f"excluded: {e['conditions'][k]['law_ref']} ({k})" for k, v in ev.items() if v == T]
        if applicable == F:
            reasons += [f"not applicable: {k} — \"{a['conditions'][k]['quote']}\"" for k, v in av.items()
                        if v == F and k not in ("CONN_INTENDED", "CONN_FORESEEABLE")]
            if av["CONN_INTENDED"] == F and av["CONN_FORESEEABLE"] == F:
                reasons.append("not applicable: no intended or reasonably foreseeable data connection (Art. 2(1))")
    elif status == "UNRESOLVED":
        reasons += [f"{v}: applicability {k}" for k, v in av.items() if v in (U, C, O)
                    and not (k.startswith("CONN") and T in (av["CONN_INTENDED"], av["CONN_FORESEEABLE"]))]
        reasons += [f"{v}: exclusion {k} ({e['conditions'][k].get('open_ref', e['conditions'][k]['law_ref'])})"
                    for k, v in ev.items() if v in (U, C, O)]
    else:
        reasons.append("Art. 2(1) met; no exclusion in Art. 2(2)-(7) applies")
        if facts.get("MARKET_STATUS", {}).get("value") == "PLANNED":
            reasons.append("prospective: applies from first making available on the EU market")
    return status, reasons, trace


BASE = {"PRODUCT_KIND": "HARDWARE", "MARKET_STATUS": "MADE_AVAILABLE", "COMMERCIAL_ACTIVITY": True,
        "DATA_INTERFACE_PRESENT": True, "CONNECTION_INTENDED": True, "EXCLUSION_SCREEN": []}


def fx(case, over, expect, prov=None, drop=()):
    f = {k: {"value": v, "provenance": "USER_CONFIRMED"} for k, v in {**BASE, **over}.items() if k not in drop}
    for k, p in (prov or {}).items():
        f[k]["provenance"] = p
    return case, f, expect


DOC = "DOCUMENT_SUPPORTED"
FIXTURES = [
 fx("SCP-01", {}, "IN_SCOPE"),
 fx("SCP-02", {"MARKET_STATUS": "NOT_EU"}, "OUT_OF_SCOPE"),
 fx("SCP-03", {"MARKET_STATUS": U}, "UNRESOLVED"),
 fx("SCP-04", {"CONNECTION_INTENDED": True}, "IN_SCOPE"),
 fx("SCP-05", {"CONNECTION_INTENDED": True}, "IN_SCOPE"),
 fx("SCP-06", {"DATA_INTERFACE_PRESENT": False}, "OUT_OF_SCOPE", drop=("CONNECTION_INTENDED",)),
 fx("SCP-07", {"CONNECTION_INTENDED": False}, "UNRESOLVED"),
 fx("SCP-10", {"CONNECTION_USE": "FORESEEABLE"}, "IN_SCOPE", drop=("DATA_INTERFACE_PRESENT", "CONNECTION_INTENDED")),
 fx("SCP-11", {"CONNECTION_USE": "NOT_FORESEEABLE"}, "UNRESOLVED", drop=("DATA_INTERFACE_PRESENT", "CONNECTION_INTENDED")),
 fx("SCP-14", {"PRODUCT_KIND": "SOFTWARE", "CONNECTION_USE": "NO_INTERFACE"}, "IN_SCOPE", drop=("DATA_INTERFACE_PRESENT", "CONNECTION_INTENDED")),
 fx("SCP-15", {"DATA_INTERFACE_PRESENT": True, "CONNECTION_INTENDED": False, "CONNECTION_FORESEEABLE": False}, "UNRESOLVED"),
 fx("EXC-08b", {"EXCLUSION_SCREEN": ["L_CATEGORY"], "L_CATEGORY_168_2013": "PART"}, "UNRESOLVED"),
 fx("SCP-12", {"CONNECTION_USE": "NO_INTERFACE"}, "OUT_OF_SCOPE", drop=("DATA_INTERFACE_PRESENT", "CONNECTION_INTENDED")),
 fx("SCP-13", {"CONNECTION_USE": "INTENDED"}, "IN_SCOPE", drop=("DATA_INTERFACE_PRESENT", "CONNECTION_INTENDED")),
 fx("SCP-08", {"MARKET_STATUS": "EXHIBITION_ONLY"}, "OUT_OF_SCOPE"),
 fx("SCP-09", {"MARKET_STATUS": "PLANNED"}, "IN_SCOPE"),
 fx("BND-03", {"PRODUCT_KIND": "REMOTE_DATA_PROCESSING"}, "IN_SCOPE"),
 fx("BND-04", {"PRODUCT_KIND": "SAAS_ONLY"}, "OUT_OF_SCOPE"),
 fx("BND-06", {"EXCLUSION_SCREEN": ["SPARE_PART"], "SPARE_PART": "IDENTICAL_SAME_SPEC"}, "OUT_OF_SCOPE"),
 fx("BND-07", {"EXCLUSION_SCREEN": ["SPARE_PART"], "SPARE_PART": "DIFFERENT_SPEC"}, "IN_SCOPE"),
 fx("EXC-01", {"EXCLUSION_SCREEN": ["MEDICAL"], "MEDICAL_STATUS": "CE_MARKED_MDR_IVDR"}, "OUT_OF_SCOPE"),
 fx("EXC-02", {}, "IN_SCOPE"),
 fx("EXC-03", {"EXCLUSION_SCREEN": ["MEDICAL"], "MEDICAL_STATUS": "MEDICAL_PURPOSE_NOT_CERTIFIED"}, "UNRESOLVED"),
 fx("EXC-04", {"EXCLUSION_SCREEN": ["VEHICLE"], "VEHICLE_2019_2144": "COMPONENT_UNCLEAR"}, "UNRESOLVED"),
 fx("EXC-05", {"EXCLUSION_SCREEN": ["DEFENCE"], "DEFENCE_STATUS": "EXCLUSIVELY_DEFENCE_OR_NATSEC"}, "OUT_OF_SCOPE", prov={"DEFENCE_STATUS": DOC}),
 fx("EXC-14", {"EXCLUSION_SCREEN": ["DEFENCE"], "DEFENCE_STATUS": "EXCLUSIVELY_DEFENCE_OR_NATSEC"}, "UNRESOLVED"),
 fx("EXC-06", {"EXCLUSION_SCREEN": ["OTHER_UNIDENTIFIED"]}, "UNRESOLVED"),
 fx("EXC-07", {"EXCLUSION_SCREEN": ["AVIATION"], "AVIATION_2018_1139": "IN_SCOPE_NOT_CERTIFIED"}, "IN_SCOPE"),
 fx("EXC-08", {"EXCLUSION_SCREEN": ["OTHER_SECTORAL"]}, "IN_SCOPE"),
 fx("EXC-09", {"EXCLUSION_SCREEN": ["DEFENCE"], "DEFENCE_STATUS": "DUAL_USE"}, "IN_SCOPE"),
 fx("EXC-10", {"EXCLUSION_SCREEN": ["DEFENCE"], "DEFENCE_STATUS": "EXCLUSIVELY_DEFENCE_OR_NATSEC"}, "OUT_OF_SCOPE", prov={"DEFENCE_STATUS": DOC}),
 fx("EXC-11", {"EXCLUSION_SCREEN": ["L_CATEGORY"], "L_CATEGORY_168_2013": "L_CATEGORY"}, "OUT_OF_SCOPE"),
 fx("EXC-12", {"EXCLUSION_SCREEN": ["L_CATEGORY"], "L_CATEGORY_168_2013": "L1E_DESIGNED_TO_PEDAL"}, "IN_SCOPE"),
 fx("EXC-13", {"EXCLUSION_SCREEN": ["MARINE"], "MARINE_2014_90": True}, "OUT_OF_SCOPE"),
 fx("OSS-01", {"COMMERCIAL_ACTIVITY": False}, "OUT_OF_SCOPE"),
 fx("OSS-02", {}, "IN_SCOPE"),
 fx("OWN-01", {"MARKET_STATUS": "OWN_USE_ONLY"}, "OUT_OF_SCOPE"),
 fx("OWN-02", {}, "IN_SCOPE"),
 fx("UG-03", {}, "IN_SCOPE"),
 fx("UG-06", {"EXCLUSION_SCREEN": ["VEHICLE"], "VEHICLE_2019_2144": "NOT_APPLICABLE"}, "IN_SCOPE"),
 fx("GATE-03", {"EXCLUSION_SCREEN": ["MEDICAL"], "MEDICAL_STATUS": "CE_MARKED_MDR_IVDR", "DEFENCE_STATUS": U}, "OUT_OF_SCOPE"),
 fx("GATE-04", {"MARKET_STATUS": "NOT_EU"}, "UNRESOLVED", prov={"MARKET_STATUS": "LLM_DRAFT"}),
]


def main():
    fails = 0
    for case, facts, exp in FIXTURES:
        st, reasons, trace = scope(facts)
        ok = st == exp
        fails += not ok
        print(f"{'PASS' if ok else 'FAIL'} {case:8} {st:13} {'; '.join(reasons)[:150]}")
        for t in trace:
            print(f"         trace: {t}")
        if not ok:
            print(f"         expected {exp}")
    print(f"\n{len(FIXTURES) - fails}/{len(FIXTURES)} scope fixtures pass")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

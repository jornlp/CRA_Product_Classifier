#!/usr/bin/env python3
"""WP7 spike: evaluate rule data (rules.json) against fact sets (fixtures.json).

Tests the rule model, not the law. Four fact values (TRUE/FALSE/UNKNOWN/CONFLICTING) plus a
fifth condition value OPEN for questions the law does not settle (WP1 OPEN_QUESTION).

  python3 evaluate.py            run fixtures, print results, exit 1 on any mismatch
  python3 evaluate.py --verify   also check every quoted condition against the held B2 text
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parents[2]
T, F, U, C, O = "TRUE", "FALSE", "UNKNOWN", "CONFLICTING", "OPEN"
# AND: one substantiated FALSE excludes; otherwise the worst uncertainty wins.
AND_ORDER = [F, C, O, U, T]
# OR: one TRUE matches; otherwise the worst uncertainty wins.
OR_ORDER = [T, C, O, U, F]


def combine(vals, order):
    for v in order:
        if v in vals:
            return v
    return order[-1]


def fact_value(fid, facts, spec, trace):
    """Read a fact, applying the evidence gate: a FALSE on a MANUFACTURER_ONLY fact counts only
    if the user confirmed it. Anything weaker is UNKNOWN, never FALSE (v4 5.1, AC-02)."""
    f = facts.get(fid)
    if f is None:
        return U, None
    val, prov = f.get("value", U), f.get("provenance", "USER_CONFIRMED")
    if val in (U, C):
        return val, None
    if spec["facts"][fid]["evidence"] == "MANUFACTURER_ONLY" and prov != "USER_CONFIRMED":
        trace.append(f"{fid}={val} from {prov}: not user-confirmed, treated as UNKNOWN")
        return U, None
    return "VALUE", val


def eval_condition(cond, facts, spec, cat_results, trace):
    if "category" in cond:  # condition defined by another category's match
        return cat_results[cond["category"]]["value"]
    state, val = fact_value(cond["fact"], facts, spec, trace)
    if state != "VALUE":
        return state
    if "is" in cond:
        return T if val == cond["is"] else F
    if "in" in cond:
        return T if val in cond["in"] else F
    if "map" in cond:
        key = "TRUE" if val is True else "FALSE" if val is False else val
        return cond["map"].get(key, U)
    raise ValueError(cond)


def eval_match(expr, values):
    if isinstance(expr, str):
        return values[expr]
    if "all" in expr:
        return combine([eval_match(e, values) for e in expr["all"]], AND_ORDER)
    if "any" in expr:
        return combine([eval_match(e, values) for e in expr["any"]], OR_ORDER)
    raise ValueError(expr)


def classify(spec, facts, uncovered="block"):
    """uncovered='block': categories without a rule block DEFAULT and cap the class (AC-03).
    uncovered='assume_excluded': test harness only, to check the spike's own categories."""
    order = spec["class_order"]
    results, trace = {}, []
    for cat in spec["categories"]:  # listed so that referenced categories come first
        vals = {cid: eval_condition(c, facts, spec, results, trace) for cid, c in cat["conditions"].items()}
        v = eval_match(cat["match"], vals)
        failing = [cid for cid, x in vals.items() if x == F]
        results[cat["category"]] = {"value": v, "class": cat["class"], "conditions": vals,
                                    "failing": failing if v == F else [],
                                    "open": [cat["conditions"][c].get("open_ref") for c, x in vals.items() if x == O]}
    matched = [r["class"] for r in results.values() if r["value"] == T]
    floor = max(matched, key=order.index) if matched else "DEFAULT"
    # Anything not settled FALSE above the floor keeps the class from being stated.
    unsettled = {k: r for k, r in results.items() if r["value"] != F and r["value"] != T
                 and order.index(r["class"]) > order.index(floor)}
    n_uncovered = spec["categories_total"] - len(spec["categories"])
    blockers = [f"{k}: {r['value']}" for k, r in unsettled.items()]
    if uncovered == "block" and n_uncovered and floor != "CRITICAL":
        blockers.append(f"{n_uncovered} categories without a rule (AC-03)")
    if not blockers:
        status = floor
    else:
        kinds = {r["value"] for r in unsettled.values()}
        status = "UNRESOLVED"
    reasons = []
    for k, r in unsettled.items():
        if r["value"] == O:
            reasons.append(f"LAW_OPEN {k} ({', '.join(filter(None, r['open']))})")
        elif r["value"] == C:
            reasons.append(f"CONFLICTING_FACTS {k} -> review flag")
        else:
            reasons.append(f"MISSING_FACTS {k}")
    return {"status": status, "floor": floor, "blockers": blockers, "reasons": reasons,
            "categories": results, "trace": trace}


def route(spec, facts, result):
    """Routes may depend on the class (Art. 12(3)). With the class unresolved, use the floor:
    if the floor already meets the condition the answer is certain; if not, it is conditional."""
    cls, floor = result["status"], result["floor"]
    out = []
    for r in spec["routes"]:
        state, val = fact_value(r["fact"], facts, spec, [])
        if state != "VALUE":
            continue
        placed = facts.get("PLACED_ON_MARKET", {}).get("value")
        if r.get("effective_from") and (placed is None or placed < r["effective_from"]):
            continue
        for case in r["cases"]:
            w = case["when"]
            if w["is"] != val:
                continue
            if "on_or_after" in w and not (placed and placed >= w["on_or_after"]):
                continue
            if "before" in w and not (placed and placed < w["before"]):
                continue
            rt = case["route"]
            if case.get("unless_class_in"):
                if cls in case["unless_class_in"] or floor in case["unless_class_in"]:
                    rt = case["unless_route"]
                elif cls == "UNRESOLVED":
                    rt = f"DEPENDS_ON_CLASS({case['route']}|{case['unless_route']})"
            out.append({"rule": r["rule_id"], "route": rt, "open_ref": case.get("open_ref"),
                        "displaces": r.get("displaces", [])})
            break
    displaced = {d for o in out for d in o["displaces"]}
    out = [o for o in out if o["route"] not in displaced]
    specific = [o for o in out if o["route"] != "CRA_ART_32"]
    if len(specific) > 1:  # two special routes: the text does not say which wins
        return [{"rule": "+".join(o["rule"] for o in specific), "route": "OPEN", "open_ref": "route conflict"}]
    return out


def verify_quotes(spec):
    """AC-01 (amended): every condition quote must appear verbatim in the held B2 text."""
    inv = json.loads((ROOT / "docs/research/out/wp1-category-inventory.json").read_text())
    norm = lambda s: re.sub(r"\s+", " ", s.replace("’", "'")).strip()
    texts = {c["id"]: norm(c["technical_description"]) + " || " + norm(c["title"]) for c in inv["categories"]}
    bad = []
    for cat in spec["categories"]:
        for cid, cond in list(cat["conditions"].items()) + [(f"descr{i}", d) for i, d in enumerate(cat.get("descriptive", []))]:
            if norm(cond["quote"]) not in texts[cat["category"]]:
                bad.append(f"{cat['rule_id']} {cid}: {cond['quote']!r}")
    return bad


def main():
    spec = json.loads((HERE / "rules.json").read_text())
    fixtures = json.loads((HERE / "fixtures.json").read_text())["fixtures"]
    fails = 0
    if "--verify" in sys.argv:
        bad = verify_quotes(spec)
        print(f"Quote verification: {'all conditions verbatim' if not bad else 'FAILED'}")
        for b in bad:
            print("  not found:", b)
        fails += len(bad)
    for fx in fixtures:
        res = classify(spec, fx["facts"], uncovered="assume_excluded")
        real = classify(spec, fx["facts"], uncovered="block")
        routes = route(spec, fx["facts"], res)
        real_routes = route(spec, fx["facts"], real)
        exp = fx["expect"]
        ok = res["status"] == exp["status"]
        if "floor" in exp:
            ok &= res["floor"] == exp["floor"]
        if "route" in exp:
            ok &= [r["route"] for r in routes] == exp["route"]
        if "failing" in exp:
            cat, conds = exp["failing"]
            ok &= res["categories"][cat]["failing"] == conds
        fails += not ok
        print(f"{'PASS' if ok else 'FAIL'} {fx['case']:8} {res['status']:12} floor={res['floor']:12} "
              f"real={real['status']:10} routes={[r['route'] for r in routes]} real_routes={[r['route'] for r in real_routes]} {'; '.join(res['reasons'])}")
        for t in res["trace"]:
            print(f"       trace: {t}")
        if not ok:
            print(f"       expected {exp}")
    print(f"\n{len(fixtures) - fails if fails <= len(fixtures) else 0}/{len(fixtures)} fixtures pass")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

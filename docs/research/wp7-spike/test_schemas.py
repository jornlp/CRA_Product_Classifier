#!/usr/bin/env python3
"""Schema tests for the WP7 trial. Needs: pip install jsonschema (any 4.x).

Validates rules.json against rule-set.schema.json, every emitted output against
assessment-output.schema.json, and checks that deliberately broken documents are REJECTED,
which is what makes the schemas worth having. Exit 1 on any failure.

  python3 evaluate.py --emit OUT && python3 test_schemas.py OUT
"""
import copy, glob, json, sys
from pathlib import Path
import jsonschema

ROOT = Path(__file__).resolve().parents[3]
SCHEMAS = ROOT / "packages/schemas"
R = jsonschema.Draft202012Validator(json.loads((SCHEMAS / "rule-set.schema.json").read_text()))
O = jsonschema.Draft202012Validator(json.loads((SCHEMAS / "assessment-output.schema.json").read_text()))
out_dir = Path(sys.argv[1])
rules = json.loads((ROOT / "packages/rules/classification.json").read_text())
fails = 0

errs = list(R.iter_errors(rules))
print(f"rules.json: {'valid' if not errs else errs[0].message}")
fails += bool(errs)
outs = sorted(glob.glob(str(out_dir / "*.json")))
for f in outs:
    e = list(O.iter_errors(json.loads(Path(f).read_text())))
    if e:
        fails += 1
        print("INVALID", Path(f).name, e[0].message[:150])
print(f"outputs: {len(outs) - fails}/{len(outs)} valid")


def must_reject(name, validator, doc, mutate):
    global fails
    d = copy.deepcopy(doc)
    mutate(d)
    ok = not validator.is_valid(d)
    fails += not ok
    print(("rejects " if ok else "ACCEPTS ") + name)


load = lambda case: json.loads((out_dir / f"{case}.json").read_text())
must_reject("condition without a verbatim quote", R, rules, lambda d: d["categories"][0]["conditions"]["C1"].pop("quote"))
must_reject("condition with two tests", R, rules, lambda d: d["categories"][0]["conditions"]["C1"].update({"in": [True]}))
must_reject("enabled rule without verification", R, rules, lambda d: d["categories"][0].update({"enabled": True}))
must_reject("route to OPEN without open_ref", R, rules, lambda d: d["routes"][0]["cases"][4].pop("open_ref"))
must_reject("rule with fewer than two tests", R, rules, lambda d: d["categories"][0].update({"test_ids": ["CAT-03P"]}))
must_reject("unknown class name", R, rules, lambda d: d["categories"][0].update({"class": "IMPORTANT"}))
must_reject("DEFAULT while categories are uncovered and blocking", O, load("CAT-03N"),
            lambda d: d["classification"].update({"status": "DEFAULT"}))
must_reject("DEFAULT with scope UNRESOLVED", O, load("CAT-03N"),
            lambda d: (d["classification"].update({"status": "DEFAULT", "blocking": [], "uncovered_categories": []}),
                       d["scope"].update({"status": "UNRESOLVED"})))
must_reject("Class I stated while a critical category blocks", O, load("CAT-03P"),
            lambda d: d["classification"].update({"status": "IMPORTANT_I", "blocking": [{"category": "IV-01", "value": "NOT_COVERED"}]}))
control = load("CAT-03N")
control["classification"].update({"status": "DEFAULT", "blocking": [], "uncovered_categories": []})
ok = O.is_valid(control)
fails += not ok
print(("accepts " if ok else "REJECTS ") + "DEFAULT with full coverage and nothing blocking (control)")
print("FAILED" if fails else "all schema tests pass")
sys.exit(1 if fails else 0)

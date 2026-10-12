#!/usr/bin/env python3
"""Export the trial fixtures with the Python reference engine's full outputs as golden files.

The TypeScript engine (packages/engine) must reproduce these exactly. Regenerate only when the
reference engine or the rules change on purpose, and review the diff.

  python3 export_fixtures.py   writes tests/fixtures/{classification,scope,timeline}.golden.json
"""
import json
from pathlib import Path
import evaluate, scope, timeline

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "tests/fixtures"
spec = json.loads((ROOT / "packages/rules/classification.json").read_text())
fx = json.loads((Path(__file__).parent / "fixtures.json").read_text())["fixtures"]

cls = []
for f in fx:
    real = evaluate.classify(spec, f["facts"], uncovered="block")
    harness = evaluate.classify(spec, f["facts"], uncovered="assume_excluded")
    out = evaluate.to_output(f, spec, real, evaluate.route(spec, f["facts"], real))
    cls.append({"case": f["case"], "facts": f["facts"], "note": f.get("note"),
                "options": {"assessed_at": out["assessed_at"], "valid_until": out["valid_until"]},
                "harness_status": harness["status"], "expect": f["expect"], "golden": out})

sc = [{"case": c, "facts": facts, "expect": exp, "golden": dict(zip(("status", "reasons", "trace"), scope.scope(facts)))}
      for c, facts, exp in scope.FIXTURES]

tl = []
for c, facts, exp in timeline.FIXTURES:
    items, flags = timeline.timeline(facts)
    tl.append({"case": c, "facts": facts, "expect": exp, "golden": {"timeline": items, "flags": flags}})
refs = [{"case": c, "assessment_date": d, "golden": timeline.resolve_reference(timeline.SPEC["dated_references"][0], d)}
        for c, d, _ in timeline.REFS]

OUT.mkdir(parents=True, exist_ok=True)
head = {"generated_by": "docs/research/wp7-spike/export_fixtures.py", "reference_engine": "Python trial (WP7)"}
for name, data in [("classification", cls), ("scope", sc), ("timeline", {"obligations": tl, "dated_references": refs})]:
    (OUT / f"{name}.golden.json").write_text(json.dumps({**head, "fixtures": data}, indent=1, ensure_ascii=False) + "\n")
    print(name, len(data) if isinstance(data, list) else len(data["obligations"]) + len(data["dated_references"]))

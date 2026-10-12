/**
 * The engine must reproduce the reference engine's outputs exactly (tests/fixtures/*.golden.json,
 * exported by docs/research/wp7-spike/export_fixtures.py). Any difference is a porting error or an
 * unreviewed change in behaviour.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { classify, route, toOutput, scope, timeline, resolveReference } from "../src/index.js";
import type { ClassificationRules, ScopeRules, TimelineRules } from "../src/index.js";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const classification: ClassificationRules = read("packages/rules/classification.json");
const scopeRules: ScopeRules = read("packages/rules/scope.json");
const timelineRules: TimelineRules = read("packages/rules/timeline.json");

describe("classification matches the reference engine", () => {
  for (const f of read("tests/fixtures/classification.golden.json").fixtures) {
    it(f.case, () => {
      const res = classify(classification, f.facts);
      const out = toOutput(classification, f.facts, res, route(classification, f.facts, res), {
        assessmentId: f.case, assessedAt: f.options.assessed_at, validUntil: f.options.valid_until,
      });
      expect(out).toEqual(f.golden);
    });
  }
});

describe("scope matches the reference engine", () => {
  for (const f of read("tests/fixtures/scope.golden.json").fixtures) {
    it(f.case, () => {
      expect(scope(scopeRules, f.facts)).toEqual(f.golden);
      expect(scope(scopeRules, f.facts).status).toBe(f.expect);
    });
  }
});

describe("timeline matches the reference engine", () => {
  const g = read("tests/fixtures/timeline.golden.json").fixtures;
  for (const f of g.obligations) {
    it(f.case, () => {
      const r = timeline(timelineRules, f.facts);
      expect(r).toEqual(f.golden);
      const got = Object.fromEntries(r.timeline.map((i) => [i.obligation, i.status]));
      for (const [k, v] of Object.entries(f.expect)) expect(got[k]).toBe(v);
    });
  }
  for (const f of g.dated_references) {
    it(f.case, () => expect(resolveReference(timelineRules.dated_references[0], f.assessment_date)).toBe(f.golden));
  }
});

describe("engine is pure", () => {
  it("same input twice gives identical output and leaves the input untouched", () => {
    const f = read("tests/fixtures/classification.golden.json").fixtures[0];
    const before = JSON.stringify(f.facts);
    const a = classify(classification, f.facts), b = classify(classification, f.facts);
    expect(a).toEqual(b);
    expect(JSON.stringify(f.facts)).toBe(before);
  });
});

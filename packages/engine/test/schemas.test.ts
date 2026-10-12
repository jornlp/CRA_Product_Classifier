/**
 * Schema tests (port of docs/research/wp7-spike/test_schemas.py). The negative tests matter most:
 * a schema that accepts broken documents protects nothing.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { classify, route, toOutput } from "../src/index.js";
import type { ClassificationRules } from "../src/index.js";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const R = ajv.compile(read("packages/schemas/rule-set.schema.json"));
const O = ajv.compile(read("packages/schemas/assessment-output.schema.json"));
const rules: ClassificationRules = read("packages/rules/classification.json");
const fixtures = read("tests/fixtures/classification.golden.json").fixtures;
const outputFor = (c: string) => {
  const f = fixtures.find((x: { case: string }) => x.case === c);
  const res = classify(rules, f.facts);
  return toOutput(rules, f.facts, res, route(rules, f.facts, res), { assessmentId: c, assessedAt: "2026-10-12", validUntil: "2027-10-12" });
};
const mutate = <X>(doc: X, fn: (d: any) => void): X => { const d = structuredClone(doc); fn(d); return d; };

describe("rule set schema", () => {
  it("accepts the rule set", () => expect(R(rules), JSON.stringify(R.errors)).toBe(true));
  const rejects: [string, (d: any) => void][] = [
    ["condition without a verbatim quote", (d) => delete d.categories[0].conditions.C1.quote],
    ["condition with two tests", (d) => (d.categories[0].conditions.C1.in = [true])],
    ["enabled rule without verification", (d) => (d.categories[0].enabled = true)],
    ["route to OPEN without open_ref", (d) => delete d.routes[0].cases[4].open_ref],
    ["rule with fewer than two tests", (d) => (d.categories[0].test_ids = ["CAT-03P"])],
    ["unknown class name", (d) => (d.categories[0].class = "IMPORTANT")],
    ["category list short of 26", (d) => d.category_ids.pop()],
  ];
  for (const [name, fn] of rejects) it(`rejects: ${name}`, () => expect(R(mutate(rules, fn))).toBe(false));
});

describe("assessment output schema", () => {
  for (const f of fixtures) it(`accepts output for ${f.case}`, () => {
    const out = outputFor(f.case);
    expect(O(out), JSON.stringify(O.errors)).toBe(true);
  });
  it("rejects DEFAULT while categories are uncovered and blocking", () =>
    expect(O(mutate(outputFor("CAT-03N"), (d) => Object.assign(d.classification, {
      status: "DEFAULT", uncovered_categories: ["IV-01"], blocking: [{ category: "IV-01", value: "NOT_COVERED" }] })))).toBe(false));
  it("rejects DEFAULT while a category is merely unknown", () =>
    expect(O(mutate(outputFor("CAT-03N"), (d) => Object.assign(d.classification, {
      status: "DEFAULT", blocking: [{ category: "III-I-17", value: "UNKNOWN" }] })))).toBe(false));
  it("rejects DEFAULT with scope UNRESOLVED", () =>
    expect(O(mutate(outputFor("CAT-03N"), (d) => {
      Object.assign(d.classification, { status: "DEFAULT", blocking: [], uncovered_categories: [] });
      d.scope.status = "UNRESOLVED";
    }))).toBe(false));
  it("rejects Class I stated while a critical category blocks", () =>
    expect(O(mutate(outputFor("CAT-03P"), (d) =>
      Object.assign(d.classification, { status: "IMPORTANT_I", blocking: [{ category: "IV-01", value: "NOT_COVERED" }] })))).toBe(false));
  it("rejects an output without validity information", () =>
    expect(O(mutate(outputFor("CAT-03P"), (d) => delete d.validity_warnings))).toBe(false));
  it("accepts DEFAULT with full coverage and nothing blocking (control)", () =>
    expect(O(mutate(outputFor("CAT-03N"), (d) =>
      Object.assign(d.classification, { status: "DEFAULT", blocking: [], uncovered_categories: [] })))).toBe(true));
});

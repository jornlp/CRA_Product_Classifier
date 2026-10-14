/** Scope reasons shown to users are plain sentences, never engine codes. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { scope, classify } from "../../../packages/engine/src/index.js";
import type { ScopeRules, Facts, ClassificationRules } from "../../../packages/engine/src/index.js";
import { scopeReasonsPlain, classOpenPlain } from "../src/explain.js";

const sc: ScopeRules = JSON.parse(readFileSync(`${process.cwd()}/packages/rules/scope.json`, "utf8"));
const fixtures: { case: string; facts: Facts }[] = JSON.parse(readFileSync(`${process.cwd()}/tests/fixtures/scope.golden.json`, "utf8")).fixtures;
const CODE = /\b(UNKNOWN|OPEN|CONFLICTING|PDE|CONN_[A-Z_]+|SCREEN_[A-Z]+|EXC-\d+|SCP-[A-Z0-9-]+|applicability|not applicable:)\b/;

describe("plain-language scope reasons", () => {
  for (const f of fixtures) it(f.case, () => {
    const s = scope(sc, f.facts);
    const r = scopeReasonsPlain(sc, f.facts, s.status);
    expect(r.length, "at least one reason").toBeGreaterThan(0);
    for (const line of r) expect(line, line).not.toMatch(CODE);
  });
  it("an interface claimed not to be foreseeably used says the law does not settle it", () => {
    const f: Facts = { PRODUCT_KIND: { value: "HARDWARE" }, MARKET_STATUS: { value: "MADE_AVAILABLE" }, COMMERCIAL_ACTIVITY: { value: true },
      CONNECTION_USE: { value: "NOT_FORESEEABLE" }, EXCLUSION_SCREEN: { value: [] } };
    expect(scopeReasonsPlain(sc, f, scope(sc, f).status).join(" ")).toContain("The law does not settle this");
  });
});

describe("why the class is not determined", () => {
  const cls: ClassificationRules = JSON.parse(readFileSync(`${process.cwd()}/packages/rules/classification.json`, "utf8"));
  const qs = JSON.parse(readFileSync(`${process.cwd()}/packages/rules/questions.json`, "utf8"));
  it("names the question answered 'Not sure' and the category it decides, once", () => {
    const facts: Facts = { PURPOSE_SCREEN: { value: ["HOME_SECURITY"] }, PROTECTS_PHYSICAL_SECURITY: { value: "UNKNOWN" } };
    const res = classify(cls, facts);
    expect(res.status).toBe("UNRESOLVED");
    const lines = classOpenPlain(cls, res, facts, qs.questions, qs.categories);
    const line = lines.find((l) => l.includes(qs.questions.PROTECTS_PHYSICAL_SECURITY.question))!;
    expect(line).toMatch(/^You answered “Not sure” to/);
    expect(line).toContain("Smart home products with security functionalities");
    expect(lines.filter((l) => l.includes(qs.questions.PROTECTS_PHYSICAL_SECURITY.question))).toHaveLength(1);
    for (const l of lines) expect(l).not.toMatch(/\b(UNKNOWN|MISSING_FACTS|III-I-\d+)\b/);
  });
  it("where the law is open, says so and quotes the condition", () => {
    const facts: Facts = { PURPOSE_SCREEN: { value: ["HOME_SECURITY"] }, PROTECTS_PHYSICAL_SECURITY: { value: true },
      RESIDENTIAL_SETTING: { value: true }, CONTROL_PATH: { value: "PROXIMITY_ONLY" } };
    const lines = classOpenPlain(cls, classify(cls, facts), facts, qs.questions, qs.categories);
    expect(lines.some((l) => l.startsWith("The law does not settle whether the product meets") && l.includes("get expert advice"))).toBe(true);
  });
});

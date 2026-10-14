/** Scope reasons shown to users are plain sentences, never engine codes. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { scope } from "../../../packages/engine/src/index.js";
import type { ScopeRules, Facts } from "../../../packages/engine/src/index.js";
import { scopeReasonsPlain } from "../src/explain.js";

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

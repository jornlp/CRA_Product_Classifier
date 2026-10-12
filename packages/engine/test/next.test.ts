/**
 * Soundness of question selection: answering only the questions the engine asks must give the
 * same result as knowing every fact. If pruning ever skipped a question that mattered, the
 * replay below would end with a different result.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { classify, scope, timeline, nextClassificationQuestions, nextScopeQuestions, nextTimelineQuestions } from "../src/index.js";
import type { ClassificationRules, ScopeRules, TimelineRules, Facts } from "../src/index.js";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const cls: ClassificationRules = read("packages/rules/classification.json");
const sc: ScopeRules = read("packages/rules/scope.json");
const tl: TimelineRules = read("packages/rules/timeline.json");

/** Ask until the engine has nothing more to ask; answer from the full fact set, "not sure" if absent. */
function replay(next: (f: Facts) => string[], all: Facts): { asked: string[]; facts: Facts } {
  const facts: Facts = {}, asked: string[] = [];
  for (let i = 0; i < 100; i++) {
    const q = next(facts)[0];
    if (!q) break;
    asked.push(q);
    facts[q] = all[q] ?? { value: "UNKNOWN", provenance: "USER_CONFIRMED" };
  }
  return { asked, facts };
}

describe("classification: asking only what matters gives the same result", () => {
  for (const f of read("tests/fixtures/classification.golden.json").fixtures) {
    it(f.case, () => {
      const { asked, facts } = replay((x) => nextClassificationQuestions(cls, x), f.facts);
      const full = classify(cls, f.facts), pruned = classify(cls, facts);
      expect(pruned.status).toBe(full.status);
      expect(pruned.floor).toBe(full.floor);
      expect(new Set(asked).size).toBe(asked.length);           // never the same question twice
    });
  }
  it("a gating fact comes first: one IC_TYPE answer settles four chip categories", () => {
    const q = nextClassificationQuestions(cls, {});
    expect(q.indexOf("IC_TYPE")).toBeLessThan(q.indexOf("TAMPER_PROTECTION"));
    const after = nextClassificationQuestions(cls, { IC_TYPE: { value: "NOT_AN_IC", provenance: "USER_CONFIRMED" } });
    for (const gone of ["SECURITY_FUNCTION", "SECURES_BEYOND_ITSELF", "TAMPER_PROTECTION", "AVA_VAN_LEVEL"]) expect(after).not.toContain(gone);
  });
  it("pest-control camera: one answer about its purpose closes the smart-home limb", () => {
    const facts: Facts = { PROTECTS_PHYSICAL_SECURITY: { value: false, provenance: "USER_CONFIRMED" } };
    const q = nextClassificationQuestions(cls, facts);
    expect(q).toContain("CENTRAL_CONTROL_OF_SECURITY");  // the other limb is still open
    expect(q).not.toContain("CONTROL_PATH");             // the first limb is closed
  });
});

describe("scope: asking only what matters gives the same result", () => {
  for (const f of read("tests/fixtures/scope.golden.json").fixtures) {
    it(f.case, () => {
      const { facts } = replay((x) => nextScopeQuestions(sc, x), f.facts);
      expect(scope(sc, facts).status).toBe(scope(sc, f.facts).status);
    });
  }
  it("the exclusion screen comes before any follow-up", () => {
    const q = nextScopeQuestions(sc, { PRODUCT_KIND: { value: "HARDWARE" }, MARKET_STATUS: { value: "MADE_AVAILABLE" },
      COMMERCIAL_ACTIVITY: { value: true }, DATA_INTERFACE_PRESENT: { value: true }, CONNECTION_INTENDED: { value: true } });
    expect(q[0]).toBe("EXCLUSION_SCREEN");
  });
  it("ticking nothing on the screen asks no follow-up", () => {
    const q = nextScopeQuestions(sc, { PRODUCT_KIND: { value: "HARDWARE" }, MARKET_STATUS: { value: "MADE_AVAILABLE" },
      COMMERCIAL_ACTIVITY: { value: true }, DATA_INTERFACE_PRESENT: { value: true }, CONNECTION_INTENDED: { value: true },
      EXCLUSION_SCREEN: { value: [] } });
    expect(q).toEqual([]);
  });
});

describe("timeline: asking only what matters gives the same result", () => {
  for (const f of read("tests/fixtures/timeline.golden.json").fixtures.obligations) {
    it(f.case, () => {
      const facts: Record<string, unknown> = { ASSESSMENT_DATE: f.facts.ASSESSMENT_DATE };
      for (let i = 0; i < 20; i++) {
        const q = nextTimelineQuestions(tl, facts)[0];
        if (!q) break;
        facts[q] = q in f.facts ? f.facts[q] : (q === "CHANGE_AT" ? undefined : q === "OTHER_LEGISLATION_CERTIFICATE" ? false : q === "RADIO_EQUIPMENT_RED_DA" ? "NO" : "UNKNOWN");
        if (facts[q] === undefined) delete facts[q], (facts as any)[q] = "";
      }
      const want = Object.fromEntries(timeline(tl, f.facts).timeline.map((i) => [i.obligation, i.status]));
      const got = Object.fromEntries(timeline(tl, facts).timeline.map((i) => [i.obligation, i.status]));
      expect(got).toEqual(want);
    });
  }
});

describe("classification with the purpose screen: same result as knowing every fact", () => {
  const screen = (cls.derive ?? []).find((d: any) => "screen" in d) as any;
  /** The screen an honest user would tick: an option is left unticked only when the user has
   *  confirmed every one of its 'no' answers. A drafted or unknown answer means "tick it and see". */
  const confirmedNo = (f: Facts[string] | undefined, v: unknown) =>
    f !== undefined && JSON.stringify(f.value) === JSON.stringify(v) && (f.provenance ?? "USER_CONFIRMED") !== "LLM_DRAFT";
  const honestScreen = (facts: Facts) => Object.entries<Record<string, unknown>>(screen.unticked_sets)
    .filter(([, sets]) => !Object.entries(sets).every(([k, v]) => confirmedNo(facts[k], v))).map(([opt]) => opt);
  for (const f of read("tests/fixtures/classification.golden.json").fixtures) {
    it(f.case, () => {
      const all: Facts = { PURPOSE_SCREEN: { value: honestScreen(f.facts), provenance: "USER_CONFIRMED" }, ...f.facts };
      const { facts } = replay((x) => nextClassificationQuestions(cls, x), all);
      expect(classify(cls, facts).status).toBe(classify(cls, f.facts).status);
      expect(classify(cls, facts).floor).toBe(classify(cls, f.facts).floor);
    });
  }
});

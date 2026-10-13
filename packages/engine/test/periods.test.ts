/**
 * Results per placing period (periods.ts) must lose nothing: every date the rules compare the placing
 * date with is a period boundary, and any date inside a period gives exactly the result of the
 * period's representative date.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dayBefore, periodsBetween, placingBoundaries, placingOutcome, placingPeriods } from "../src/index.js";
import type { ClassificationRules, TimelineRules, Facts } from "../src/index.js";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const cls: ClassificationRules = read("packages/rules/classification.json");
const tl: TimelineRules = read("packages/rules/timeline.json");
const fixtures: { case: string; facts: Facts }[] = read("tests/fixtures/classification.golden.json").fixtures;
const TODAYS = ["2026-10-13", "2028-09-01"];
const VARIANTS = [{}, { RADIO_EQUIPMENT_RED_DA: "YES" }, { RADIO_EQUIPMENT_RED_DA: "UNKNOWN" }];

function addDays(d: string, n: number) { const t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }

describe("placing date as a period", () => {
  it("every date a rule compares the placing date with is a boundary", () => {
    const b = new Set(placingBoundaries(cls, tl));
    const compared: string[] = [tl.dates.RED_DA_APPLICATION, tl.dates.CRA_APPLICATION];
    for (const r of cls.routes) if (r.date_fact) {
      expect(r.date_fact).toBe("UNITS_PLACED_ON_MARKET");
      for (const v of JSON.stringify(r).match(/\d{4}-\d{2}-\d{2}/g) ?? []) compared.push(v);
    }
    for (const d of compared) expect(b.has(d), d).toBe(true);
  });

  it("any date inside a period gives the same routes and timeline as the period's value", () => {
    const bands = periodsBetween(placingBoundaries(cls, tl));
    let checked = 0;
    for (const fx of fixtures) for (const today of TODAYS) for (const v of VARIANTS) {
      const tf = { ASSESSMENT_DATE: today, ...v };
      for (const p of bands) {
        const want = JSON.stringify(placingOutcome(cls, tl, fx.facts, tf, p.value));
        const lo = p.from ?? addDays(p.before!, -3650), hi = p.before ? dayBefore(p.before) : addDays(p.from!, 3650);
        for (const d of [lo, hi, addDays(lo, 1), addDays(lo, 100), addDays(lo, 400)].filter((d) => d >= lo && d <= hi)) {
          expect(JSON.stringify(placingOutcome(cls, tl, fx.facts, tf, d)), `${fx.case} ${p.label} ${d}`).toBe(want);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
  });

  it("merging keeps a boundary only where the result changes", () => {
    const plain = fixtures.find((f) => f.case === "CAT-03P")!.facts;
    const labels = (tf: object) => placingPeriods(cls, tl, plain, { ASSESSMENT_DATE: "2026-10-13", ...tf }).map((p) => p.label);
    expect(labels({})).toEqual(["Before 11 December 2027", "On or after 11 December 2027"]);
    expect(labels({ RADIO_EQUIPMENT_RED_DA: "YES" })).toEqual(
      ["Before 1 August 2025", "1 August 2025 to 10 December 2027", "On or after 11 December 2027"]);
  });
  it("a route that changes with the placing date gets its own periods (AI Act, Annex I Section A)", () => {
    const plain = fixtures.find((f) => f.case === "CAT-03P")!.facts;
    const facts: Facts = { ...plain, HIGH_RISK_AI_BASIS: { value: "ANNEX_I_SECTION_A", provenance: "USER_CONFIRMED" } };
    const ps = placingPeriods(cls, tl, facts, { ASSESSMENT_DATE: "2026-10-13" });
    expect(ps.map((p) => p.label)).toEqual(["Before 11 December 2027", "11 December 2027 to 1 August 2028", "On or after 2 August 2028"]);
    const routes = ps.map((p) => placingOutcome(cls, tl, facts, { ASSESSMENT_DATE: "2026-10-13" }, p.value).routes.map((r) => r.route));
    expect(routes.at(-1)).toEqual(["AI_ACT_ART_43"]);
    expect(routes[1]).toEqual(["OPEN"]);
  });
});

import { describe, expect, it } from "vitest";
import { validityWarnings } from "../src/index.js";
import type { LawStatus } from "../src/index.js";

const base = { validUntil: "2027-10-12", lawAsOf: "2026-10-12", citedSources: ["B1c", "B2"] };
const changed: LawStatus = { checked_at: "2027-02-20", baseline: "2026-10-12", status: "CHANGES_FOUND",
  affected_sources: ["B11c", "B1c"], findings: [] };

describe("validity markers (DR-05)", () => {
  it("none inside the window with no law change", () =>
    expect(validityWarnings({ ...base, assessedAt: "2027-01-01" })).toEqual([]));
  it("on the end date itself: still valid", () =>
    expect(validityWarnings({ ...base, assessedAt: "2027-10-12" })).toEqual([]));
  it("after the end date: PAST_END_DATE, result not blocked", () =>
    expect(validityWarnings({ ...base, assessedAt: "2027-10-13" }).map((w) => w.kind)).toEqual(["PAST_END_DATE"]));
  it("law change touching a cited source: LAW_CHANGED", () => {
    const w = validityWarnings({ ...base, assessedAt: "2027-03-01", lawStatus: changed });
    expect(w.map((x) => x.kind)).toEqual(["LAW_CHANGED"]);
    expect(w[0].detail).toContain("B1c");
    expect(w[0].detail).not.toContain("B11c");
  });
  it("law change touching only sources this result does not cite: no warning", () =>
    expect(validityWarnings({ ...base, assessedAt: "2027-03-01", lawStatus: { ...changed, affected_sources: ["B11c"] } })).toEqual([]));
  it("both at once", () =>
    expect(validityWarnings({ ...base, assessedAt: "2028-01-01", lawStatus: changed }).map((w) => w.kind)).toEqual(["PAST_END_DATE", "LAW_CHANGED", "LAW_CHECK_STALE"]));
  it("a change to an act the rules depend on but do not hold (an exclusion law): still LAW_CHANGED", () => {
    const w = validityWarnings({ ...base, assessedAt: "2027-03-01", lawStatus: { ...changed, affected_sources: [],
      findings: [{ severity: "HIGH", act: "Regulation (EU) 2017/745 (MDR)", celex: "32017R0745", relation: "amended", by: "x", why: "y" }] } });
    expect(w.map((x) => x.kind)).toEqual(["LAW_CHANGED"]);
    expect(w[0].detail).toContain("2017/745");
  });
  it("a check more than 21 days old: LAW_CHECK_STALE", () => {
    const ok: LawStatus = { checked_at: "2027-02-20", baseline: "2026-10-12", status: "NO_CHANGES", affected_sources: [], findings: [] };
    expect(validityWarnings({ ...base, assessedAt: "2027-03-13", lawStatus: ok })).toEqual([]);
    expect(validityWarnings({ ...base, assessedAt: "2027-03-15", lawStatus: ok }).map((w) => w.kind)).toEqual(["LAW_CHECK_STALE"]);
  });
});

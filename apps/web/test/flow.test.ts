/**
 * End-to-end flow for the two interview cases (WP3), answered the way the manufacturers described
 * their products. Shows the questions actually asked and the result reached.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { classify, scope, timeline } from "../../../packages/engine/src/index.js";
import { nextStep, record } from "../src/flow.js";
import type { FlowState, Rules } from "../src/flow.js";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const R: Rules = { scope: read("packages/rules/scope.json"), classification: read("packages/rules/classification.json"), timeline: read("packages/rules/timeline.json") };

/** Walk the flow, answering from `answers`; anything not listed is answered "not sure". */
function walk(answers: Record<string, unknown>, date = "2026-10-12") {
  const st: FlowState = { facts: {}, tfacts: { ASSESSMENT_DATE: date }, done: new Set() };
  const asked: string[] = [];
  for (let i = 0; i < 60; i++) {
    const s = nextStep(R, st);
    if (s.phase === "result") break;
    asked.push(s.fid!);
    record(st, s.phase, s.fid!, s.fid! in answers ? answers[s.fid!] : "UNKNOWN");
  }
  return { asked, st, scope: scope(R.scope, st.facts), cls: classify(R.classification, st.facts), tl: timeline(R.timeline, st.tfacts) };
}

const inScope = { PURPOSE_SCREEN: [] as string[], PRODUCT_KIND: "HARDWARE", MARKET_STATUS: "MADE_AVAILABLE", COMMERCIAL_ACTIVITY: true,
  DATA_INTERFACE_PRESENT: true, CONNECTION_INTENDED: true, EXCLUSION_SCREEN: [], CORE_FUNCTION: "",
  IC_TYPE: "NOT_AN_IC", STORES_PASSWORDS_CORE: false, HIGH_RISK_AI_BASIS: "NONE", EHR_SYSTEM: false,
  UNITS_PLACED_ON_MARKET: "2028-03-01", RADIO_EQUIPMENT_RED_DA: "YES", OTHER_LEGISLATION_CERTIFICATE: false };

describe("interview case: pest-control camera (RAT-01)", () => {
  const r = walk({ ...inScope, PROTECTS_PHYSICAL_SECURITY: false, CENTRAL_CONTROL_OF_SECURITY: false,
    METERING_COMMUNICATION: false, ADVANCED_SECURITY_CORE: false });
  it("is in scope", () => expect(r.scope.status).toBe("IN_SCOPE"));
  it("rules out smart-home security on the purpose condition, with the quote", () => {
    expect(r.cls.categories["III-I-17"].value).toBe("FALSE");
    expect(r.cls.categories["III-I-17"].failing).toContain("C1");
  });
  it("rules out the critical gateway category", () => expect(r.cls.categories["IV-02"].value).toBe("FALSE"));
  it("does not claim DEFAULT while 20 categories have no rule", () => {
    expect(r.cls.status).toBe("UNRESOLVED");
    expect(r.cls.floor).toBe("DEFAULT");
  });
  it("never asks the remote-control question once the purpose rules the first limb out", () =>
    expect(r.asked).not.toContain("CONTROL_PATH"));
  it("the purpose screen settles every pilot category: no category question is asked", () => {
    for (const q of ["PROTECTS_PHYSICAL_SECURITY", "STORES_PASSWORDS_CORE", "IC_TYPE", "METERING_COMMUNICATION"]) expect(r.asked).not.toContain(q);
    expect(r.asked).toContain("PURPOSE_SCREEN");
  });
  it("asks a short, sensible list", () => expect(r.asked.length).toBeLessThan(20));
});

describe("interview case: water meter without gateway function (WTR-01)", () => {
  const r = walk({ ...inScope, PROTECTS_PHYSICAL_SECURITY: false, CENTRAL_CONTROL_OF_SECURITY: false,
    METERING_COMMUNICATION: false, COLLECTS_METER_DATA: true, CRYPTO_SUPPORT: false, FIREWALLING: false,
    CONTROLS_OTHER_DEVICES: false, METERED_COMMODITY: "WATER", ADVANCED_SECURITY_CORE: false });
  it("is not critical: the gateway conditions fail", () => {
    expect(r.cls.categories["IV-02"].value).toBe("FALSE");
    expect(r.cls.floor).toBe("DEFAULT");
  });
  it("the purpose screen rules out the gateway: no gateway question is asked", () => {
    expect(r.asked).not.toContain("METERING_COMMUNICATION");
    expect(r.asked).not.toContain("FIREWALLING");
  });
  it("timeline: radio equipment placed in 2028 gets the RED note", () => {
    const red = r.tl.timeline.find((i) => i.obligation === "RED_DA_CYBERSECURITY");
    expect(red?.status).toBe("APPLIES");
    expect(red?.open_questions?.[0]).toContain("aims to repeal");
  });
});

describe("smart door lock: ticks home security on the purpose screen", () => {
  const r = walk({ ...inScope, PURPOSE_SCREEN: ["HOME_SECURITY"], PROTECTS_PHYSICAL_SECURITY: true,
    RESIDENTIAL_SETTING: true, CONTROL_PATH: "NETWORK_REMOTE" });
  it("is asked the smart-home questions", () => {
    for (const q of ["PROTECTS_PHYSICAL_SECURITY", "RESIDENTIAL_SETTING", "CONTROL_PATH"]) expect(r.asked).toContain(q);
  });
  it("is never asked about passwords, chips or meters", () => {
    for (const q of ["STORES_PASSWORDS_CORE", "IC_TYPE", "METERING_COMMUNICATION", "ADVANCED_SECURITY_CORE"]) expect(r.asked).not.toContain(q);
  });
  it("matches smart-home security: at least Class I", () => {
    expect(r.cls.categories["III-I-17"].value).toBe("TRUE");
    expect(r.cls.floor).toBe("IMPORTANT_I");
  });
});

it("prints the question sequences (for review)", () => {
  const rat = walk({ ...inScope, PROTECTS_PHYSICAL_SECURITY: false, CENTRAL_CONTROL_OF_SECURITY: false, METERING_COMMUNICATION: false, ADVANCED_SECURITY_CORE: false });
  console.log("RAT-01 asked:", rat.asked.join(" → "));
});

/**
 * End-to-end flow for the two interview cases (WP3), answered the way the manufacturers described
 * their products. Shows the questions actually asked and the result reached.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { classify, scope, timeline, placingPeriods, placingOutcome } from "../../../packages/engine/src/index.js";
import { nextStep, record } from "../src/flow.js";
import type { FlowState, Rules } from "../src/flow.js";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const R: Rules = { scope: read("packages/rules/scope.json"), classification: read("packages/rules/classification.json"), timeline: read("packages/rules/timeline.json") };

/** Walk the flow, answering from `answers`; anything not listed is answered "not sure". */
function walk(answers: Record<string, unknown>, date = "2026-10-12", mode: FlowState["mode"] = "full", start?: FlowState) {
  const st: FlowState = start ?? { facts: {}, tfacts: { ASSESSMENT_DATE: date }, done: new Set(), mode };
  st.mode = mode;
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
  DATA_INTERFACE_PRESENT: true, CONNECTION_INTENDED: true, EXCLUSION_SCREEN: [],
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
  it("with all 26 categories ruled out, the class is Default", () => {
    expect(r.cls.status).toBe("DEFAULT");
    expect(Object.values(r.cls.categories).every((c) => c.value === "FALSE")).toBe(true);
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
  it("is not critical: the gateway conditions fail; with every category ruled out, Default", () => {
    expect(r.cls.categories["IV-02"].value).toBe("FALSE");
    expect(r.cls.status).toBe("DEFAULT");
  });
  it("the purpose screen rules out the gateway: no gateway question is asked", () => {
    expect(r.asked).not.toContain("METERING_COMMUNICATION");
    expect(r.asked).not.toContain("FIREWALLING");
  });
  it("no date is asked; units placed from 11 December 2027 get the RED note in their period", () => {
    expect(r.asked).not.toContain("UNITS_PLACED_ON_MARKET");
    const last = placingPeriods(R.classification, R.timeline, r.st.facts, r.st.tfacts).at(-1)!;
    expect(last.label).toBe("On or after 11 December 2027");
    const red = placingOutcome(R.classification, R.timeline, r.st.facts, r.st.tfacts, last.value).timeline
      .find((i) => i.obligation === "RED_DA_CYBERSECURITY");
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
  it("matches smart-home security, and nothing higher: Important, Class I", () => {
    expect(r.cls.categories["III-I-17"].value).toBe("TRUE");
    expect(r.cls.status).toBe("IMPORTANT_I");
  });
});

it("prints the question sequences (for review)", () => {
  const rat = walk({ ...inScope, PROTECTS_PHYSICAL_SECURITY: false, CENTRAL_CONTROL_OF_SECURITY: false, METERING_COMMUNICATION: false, ADVANCED_SECURITY_CORE: false });
  console.log("RAT-01 asked:", rat.asked.join(" → "));
});

describe("check modes (scope only, class only, full) and continuing", () => {
  const lock = { ...inScope, PURPOSE_SCREEN: ["HOME_SECURITY"], PROTECTS_PHYSICAL_SECURITY: true, RESIDENTIAL_SETTING: true, CONTROL_PATH: "NETWORK_REMOTE" };
  it("without a choice, the flow starts at the start screen", () =>
    expect(nextStep(R, { facts: {}, tfacts: {}, done: new Set() }).phase).toBe("start"));
  it("scope only: asks scope questions and stops", () => {
    const r = walk(lock, "2026-10-12", "scope");
    expect(r.scope.status).toBe("IN_SCOPE");
    expect(r.asked).not.toContain("CORE_FUNCTION");
    expect(r.asked).not.toContain("UNITS_PLACED_ON_MARKET");
  });
  it("class only: asks no scope and no date questions", () => {
    const r = walk(lock, "2026-10-12", "class");
    for (const q of ["PRODUCT_KIND", "MARKET_STATUS", "EXCLUSION_SCREEN", "UNITS_PLACED_ON_MARKET"]) expect(r.asked).not.toContain(q);
    expect(r.asked[0]).toBe("PURPOSE_SCREEN");
    expect(r.cls.categories["III-I-17"].value).toBe("TRUE");
  });
  it("continuing from scope to the full check asks nothing twice", () => {
    const first = walk(lock, "2026-10-12", "scope");
    const second = walk(lock, "2026-10-12", "full", first.st);
    expect(second.asked.filter((q) => first.asked.includes(q))).toEqual([]);
    expect(second.asked[0]).toBe("PURPOSE_SCREEN");
    expect(second.asked).toContain("RADIO_EQUIPMENT_RED_DA");
    for (const q of ["UNITS_PLACED_ON_MARKET", "CHANGE_AT", "CERTIFICATE_EXPIRY"]) expect(second.asked).not.toContain(q);
  });
  it("continuing from class to the full check asks only scope and dates", () => {
    const first = walk(lock, "2026-10-12", "class");
    const second = walk(lock, "2026-10-12", "full", first.st);
    expect(second.asked.filter((q) => first.asked.includes(q))).toEqual([]);
    expect(second.asked).toContain("PRODUCT_KIND");
    expect(second.asked).not.toContain("PROTECTS_PHYSICAL_SECURITY");
  });
});

it("never asks for a free-text description: it is for the user's records only", () => {
  const r = walk({ ...inScope });
  expect(r.asked).not.toContain("CORE_FUNCTION");
});

describe("products from every family reach their class without unrelated questions", () => {
  const no = (asked: string[], qs: string[]) => qs.forEach((q) => expect(asked).not.toContain(q));
  it("home router with built-in modem: Class I, never asked about toys, chips or passwords", () => {
    const r = walk({ ...inScope, PURPOSE_SCREEN: ["ROUTING"], NETWORK_DEVICE_ROLE: ["ROUTER", "INTERNET_MODEM"] });
    expect(r.cls.status).toBe("IMPORTANT_I");
    expect(r.cls.categories["III-I-12"].value).toBe("TRUE");
    no(r.asked, ["IS_TOY", "IC_TYPE", "STORES_PASSWORDS_CORE", "WORN_ON_BODY"]);
  });
  it("fitness tracker, not a medical device: Class I via health monitoring", () => {
    const r = walk({ ...inScope, EXCLUSION_SCREEN: [], PURPOSE_SCREEN: ["WEARABLE"], WORN_ON_BODY: true, HEALTH_MONITORING: true });
    expect(r.cls.categories["III-I-19"].value).toBe("TRUE");
    expect(r.cls.status).toBe("IMPORTANT_I");
    no(r.asked, ["MEDICAL_STATUS", "FOR_CHILDREN_UNDER_14"]); // medical settled by the exclusion screen; children limb not needed
  });
  it("talking connected toy: Class I", () => {
    const r = walk({ ...inScope, PURPOSE_SCREEN: ["TOY"], IS_TOY: true, PUBLIC_INTERNET: true, TOY_INTERACTIVE_OR_TRACKING: "SOCIAL_INTERACTIVE" });
    expect(r.cls.status).toBe("IMPORTANT_I");
  });
  it("hardware security module: Critical", () => {
    const r = walk({ ...inScope, PURPOSE_SCREEN: ["SECURITY_BOX"], CRYPTO_CORE: true, MULTIPLE_DISCRETE_COMPONENTS: true, PHYSICAL_TAMPER_ENVELOPE: true });
    expect(r.cls.status).toBe("CRITICAL");
  });
  it("container orchestrator: the law is open, so no definite class", () => {
    const r = walk({ ...inScope, PURPOSE_SCREEN: ["VIRTUALISATION"], VIRTUALISATION_TYPE: "ORCHESTRATOR_ONLY" });
    expect(r.cls.status).toBe("UNRESOLVED");
    expect(r.cls.categories["III-II-01"].value).toBe("OPEN");
  });
  it("class-only check of a fitness tracker asks the medical question directly", () => {
    const r = walk({ ...inScope, PURPOSE_SCREEN: ["WEARABLE"], WORN_ON_BODY: true, HEALTH_MONITORING: true, MEDICAL_STATUS: "NONE" }, "2026-10-12", "class");
    expect(r.asked).toContain("MEDICAL_STATUS");
    expect(r.asked).not.toContain("EXCLUSION_SCREEN");
  });
});

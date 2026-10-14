/**
 * The question flow, free of the DOM so it can be tested: scope, core function, classification,
 * overlaps (AI Act, EHDS), timeline, result. The next step is recomputed from the answers each time.
 */
import { scope, nextScopeQuestions, nextClassificationQuestions, nextTimelineQuestions } from "../../../packages/engine/src/index.js";
import type { ClassificationRules, ScopeRules, TimelineRules, Facts } from "../../../packages/engine/src/index.js";

export type Phase = "start" | "scope" | "class" | "timeline" | "result";
/**
 * What the user asked for (v4 3.1: three independently reported results).
 *   scope: does the CRA apply?            class: which class, assuming it applies?
 *   full:  scope, then class and dates.   A partial check can be continued without losing answers.
 */
export type Mode = "scope" | "class" | "full";
export interface FlowState { facts: Facts; tfacts: Record<string, unknown>; done: Set<string>; mode?: Mode }
export interface Rules { scope: ScopeRules; classification: ClassificationRules; timeline: TimelineRules }

export function nextStep(r: Rules, st: FlowState): { phase: Phase; fid?: string } {
  if (!st.mode) return { phase: "start" };
  if (st.mode !== "class") {
    const sq = nextScopeQuestions(r.scope, st.facts)[0];
    if (sq) return { phase: "scope", fid: sq };
    if (st.mode === "scope" || scope(r.scope, st.facts).status !== "IN_SCOPE") return { phase: "result" };
  }
  const cq = nextClassificationQuestions(r.classification, st.facts)[0];
  if (cq) return { phase: "class", fid: cq };
  // No AI Act or EHDS questions: they decide only the conformity route, which the result shows per case.
  if (st.mode === "class") return { phase: "result" };  // dates come with the full check
  // No date questions: the result shows each placing period instead, and a certificate's own expiry is
  // stated as "its own expiry date or 11 June 2028, whichever comes first".
  const tq = nextTimelineQuestions(r.timeline, { UNITS_PLACED_ON_MARKET: "UNKNOWN", ...st.tfacts })
    .filter((q) => !DATE_QUESTIONS.has(q))[0];
  if (tq) return { phase: "timeline", fid: tq };
  return { phase: "result" };
}

// Not asked: dates (the result shows each placing period instead) and the radio equipment questions (the
// RED delegated act is only pointed to, in a fixed note on the result; v4 keeps RED conformity out of scope).
const DATE_QUESTIONS = new Set(["UNITS_PLACED_ON_MARKET", "CHANGE_AT", "CERTIFICATE_EXPIRY",
  "RADIO_PRESENT", "RADIO_INTERNET", "RADIO_BODY_CHILD_TOY", "RADIO_PERSONAL_DATA", "RADIO_EQUIPMENT_RED_DA"]);

/** Record an answer. The units' placing date feeds both the timeline and the conformity routes. */
export function record(st: FlowState, phase: Phase, fid: string, value: unknown) {
  if (phase === "timeline") {
    st.tfacts[fid] = value;
  } else st.facts[fid] = { value, provenance: "USER_CONFIRMED" };
}

export function unrecord(st: FlowState, phase: Phase, fid: string) {
  if (phase === "timeline") {
    delete st.tfacts[fid];
  } else delete st.facts[fid];
}

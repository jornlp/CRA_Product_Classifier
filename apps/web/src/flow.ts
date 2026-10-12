/**
 * The question flow, free of the DOM so it can be tested: scope, core function, classification,
 * overlaps (AI Act, EHDS), timeline, result. The next step is recomputed from the answers each time.
 */
import { scope, nextScopeQuestions, nextClassificationQuestions, nextTimelineQuestions } from "../../../packages/engine/src/index.js";
import type { ClassificationRules, ScopeRules, TimelineRules, Facts } from "../../../packages/engine/src/index.js";

export type Phase = "scope" | "core" | "class" | "routes" | "timeline" | "result";
export interface FlowState { facts: Facts; tfacts: Record<string, unknown>; done: Set<string> }
export interface Rules { scope: ScopeRules; classification: ClassificationRules; timeline: TimelineRules }

export function nextStep(r: Rules, st: FlowState): { phase: Phase; fid?: string } {
  const sq = nextScopeQuestions(r.scope, st.facts)[0];
  if (sq) return { phase: "scope", fid: sq };
  if (scope(r.scope, st.facts).status !== "IN_SCOPE") return { phase: "result" };
  if (!st.done.has("CORE_FUNCTION")) return { phase: "core", fid: "CORE_FUNCTION" };
  const cq = nextClassificationQuestions(r.classification, st.facts)[0];
  if (cq) return { phase: "class", fid: cq };
  for (const fid of ["HIGH_RISK_AI_BASIS", "EHR_SYSTEM"]) if (!(fid in st.facts)) return { phase: "routes", fid };
  const tq = nextTimelineQuestions(r.timeline, st.tfacts)[0];
  if (tq) return { phase: "timeline", fid: tq };
  return { phase: "result" };
}

/** Record an answer. The units' placing date feeds both the timeline and the conformity routes. */
export function record(st: FlowState, phase: Phase, fid: string, value: unknown) {
  if (phase === "core") st.done.add("CORE_FUNCTION");
  else if (phase === "timeline") {
    st.tfacts[fid] = value;
    if (fid === "UNITS_PLACED_ON_MARKET") st.facts.UNITS_PLACED_ON_MARKET = { value, provenance: "USER_CONFIRMED" };
  } else st.facts[fid] = { value, provenance: "USER_CONFIRMED" };
}

export function unrecord(st: FlowState, phase: Phase, fid: string) {
  if (phase === "core") st.done.delete("CORE_FUNCTION");
  else if (phase === "timeline") {
    delete st.tfacts[fid];
    if (fid === "UNITS_PLACED_ON_MARKET") delete st.facts.UNITS_PLACED_ON_MARKET;
  } else delete st.facts[fid];
}

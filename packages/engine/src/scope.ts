/**
 * Scope: Art. 2(1) applicability AND NOT any Art. 2(2)-(7) exclusion.
 * Reference: docs/research/wp7-spike/scope.py.
 *
 * The evidence gate applies to whichever result is permissive: FALSE for applicability,
 * TRUE for an exclusion. A permissive result without the provenance the fact requires is UNKNOWN.
 */
import { T, F, U, C, O, AND_ORDER, OR_ORDER, NOT, combine, evalMatch, mapKey, pyRepr } from "./logic.js";
import type { Value, Match, Facts } from "./logic.js";

interface ScopeCondition {
  fact: string; quote?: string; law_ref?: string; open_ref?: string; note?: string;
  is?: unknown; map?: Record<string, Value>; default?: Value; contains?: string; if_contains?: Value;
}
type Derive =
  | { screen: string; unticked_sets: Record<string, Record<string, unknown>>; why: string }
  | { if: Record<string, unknown>; then: Record<string, unknown>; why: string };
export interface ScopeRules {
  provenance_rank: Record<string, number>;
  facts: Record<string, { requires: string }>;
  derive: Derive[];
  applicability: { permissive_result: Value; conditions: Record<string, ScopeCondition>; match: Match };
  exclusions: { permissive_result: Value; conditions: Record<string, ScopeCondition> };
  ask_order?: string[];
}
export type ScopeStatus = "IN_SCOPE" | "OUT_OF_SCOPE" | "UNRESOLVED";

function derive(rules: ScopeRules, raw: Facts): Facts {
  const facts: Facts = { ...raw };
  const setDefault = (k: string, v: Facts[string]) => { if (!(k in facts)) facts[k] = v; };
  for (const d of rules.derive) {
    if ("screen" in d) {
      const scr = facts[d.screen];
      if (scr && Array.isArray(scr.value)) {
        for (const [opt, sets] of Object.entries(d.unticked_sets)) {
          if (!(scr.value as unknown[]).includes(opt)) {
            for (const [fk, fv] of Object.entries(sets)) setDefault(fk, { value: fv, provenance: scr.provenance ?? "USER_CONFIRMED", derived: d.why });
          }
        }
      }
      continue;
    }
    const [[k, v]] = Object.entries(d.if);
    if (facts[k]?.value === v) {
      for (const [fk, fv] of Object.entries(d.then)) setDefault(fk, { value: fv, provenance: facts[k].provenance ?? "USER_CONFIRMED", derived: d.why });
    }
  }
  return facts;
}

function condValue(rules: ScopeRules, cond: ScopeCondition, facts: Facts, permissive: Value, trace: string[]): Value {
  const f = facts[cond.fact];
  if (f === undefined) return U;
  if (f.value === U || f.value === C) return f.value as Value;
  const v = f.value;
  let r: Value;
  if (cond.contains !== undefined) r = (v as unknown[]).includes(cond.contains) ? cond.if_contains! : cond.default!;
  else if ("is" in cond) r = v === cond.is ? T : F;
  else r = cond.map![mapKey(v)] ?? cond.default ?? U;
  const need = rules.facts[cond.fact].requires;
  if (r === permissive && (rules.provenance_rank[f.provenance ?? "USER_CONFIRMED"] ?? 0) < rules.provenance_rank[need]) {
    trace.push(`${cond.fact}=${pyRepr(v)} gives the permissive result but is ${pyRepr(f.provenance)}; needs ${need}`);
    return U;
  }
  return r;
}

/** Condition values for scope, after derivation. Exposed for question selection. */
export function scopeConditionValues(rules: ScopeRules, raw: Facts, trace: string[] = []) {
  const facts = derive(rules, raw);
  const a = rules.applicability, e = rules.exclusions;
  const applicability: Record<string, Value> = {};
  for (const [k, c] of Object.entries(a.conditions)) applicability[k] = condValue(rules, c, facts, a.permissive_result, trace);
  const exclusions: Record<string, Value> = {};
  for (const [k, c] of Object.entries(e.conditions)) exclusions[k] = condValue(rules, c, facts, e.permissive_result, trace);
  return { applicability, exclusions, facts };
}

export function scope(rules: ScopeRules, raw: Facts): { status: ScopeStatus; reasons: string[]; trace: string[] } {
  const trace: string[] = [];
  const { applicability: av, exclusions: ev, facts } = scopeConditionValues(rules, raw, trace);
  const a = rules.applicability, e = rules.exclusions;
  const applicable = evalMatch(a.match, av);
  const excluded = combine(Object.values(ev), OR_ORDER);
  const result = combine([applicable, NOT(excluded)], AND_ORDER);
  const status: ScopeStatus = result === T ? "IN_SCOPE" : result === F ? "OUT_OF_SCOPE" : "UNRESOLVED";
  const reasons: string[] = [];
  const uncertain = (v: Value) => v === U || v === C || v === O;
  if (status === "OUT_OF_SCOPE") {
    for (const [k, v] of Object.entries(ev)) if (v === T) reasons.push(`excluded: ${e.conditions[k].law_ref} (${k})`);
    if (applicable === F) {
      for (const [k, v] of Object.entries(av)) {
        if (v === F && k !== "CONN_INTENDED" && k !== "CONN_FORESEEABLE") reasons.push(`not applicable: ${k} — "${a.conditions[k].quote}"`);
      }
      if (av.CONN_INTENDED === F && av.CONN_FORESEEABLE === F) reasons.push("not applicable: no intended or reasonably foreseeable data connection (Art. 2(1))");
    }
  } else if (status === "UNRESOLVED") {
    const connMet = av.CONN_INTENDED === T || av.CONN_FORESEEABLE === T;
    for (const [k, v] of Object.entries(av)) if (uncertain(v) && !(k.startsWith("CONN") && connMet)) reasons.push(`${v}: applicability ${k}`);
    for (const [k, v] of Object.entries(ev)) if (uncertain(v)) reasons.push(`${v}: exclusion ${k} (${e.conditions[k].open_ref ?? e.conditions[k].law_ref})`);
  } else {
    reasons.push("Art. 2(1) met; no exclusion in Art. 2(2)-(7) applies");
    if (facts.MARKET_STATUS?.value === "PLANNED") reasons.push("prospective: applies from first making available on the EU market");
  }
  return { status, reasons, trace };
}

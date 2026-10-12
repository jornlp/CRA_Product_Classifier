/**
 * Four-valued logic for the rule engine (WP7 rule model, section 2).
 *
 * Fact values: TRUE, FALSE, UNKNOWN, CONFLICTING. Conditions may also yield OPEN: the law does
 * not settle the question. UNKNOWN never becomes FALSE.
 */
export const T = "TRUE", F = "FALSE", U = "UNKNOWN", C = "CONFLICTING", O = "OPEN";
export type Value = typeof T | typeof F | typeof U | typeof C | typeof O;

/** AND: one substantiated FALSE excludes; otherwise the worst uncertainty wins. */
export const AND_ORDER: readonly Value[] = [F, C, O, U, T];
/** OR: one TRUE matches; otherwise the worst uncertainty wins. */
export const OR_ORDER: readonly Value[] = [T, C, O, U, F];

export function combine(vals: readonly Value[], order: readonly Value[]): Value {
  for (const v of order) if (vals.includes(v)) return v;
  return order[order.length - 1];
}

export type Match = string | { name?: string; all: Match[] } | { name?: string; any: Match[] };

export function evalMatch(expr: Match, values: Record<string, Value>): Value {
  if (typeof expr === "string") return values[expr];
  if ("all" in expr) return combine(expr.all.map((e) => evalMatch(e, values)), AND_ORDER);
  if ("any" in expr) return combine(expr.any.map((e) => evalMatch(e, values)), OR_ORDER);
  throw new Error(`bad match expression: ${JSON.stringify(expr)}`);
}

export const NOT = (v: Value): Value => (v === T ? F : v === F ? T : v);

/** Map a fact value onto a value-map key: booleans become "TRUE"/"FALSE". */
export const mapKey = (v: unknown): string => (v === true ? "TRUE" : v === false ? "FALSE" : String(v));

/**
 * Render a fact value the way the reference engine (Python) prints it in trace messages, so
 * traces match the golden files exactly: True/False, lists as ['A', 'B'].
 */
export function pyRepr(v: unknown): string {
  if (v === true) return "True";
  if (v === false) return "False";
  if (v === null || v === undefined) return "None";
  if (Array.isArray(v)) return "[" + v.map((x) => (typeof x === "string" ? `'${x}'` : pyRepr(x))).join(", ") + "]";
  return String(v);
}

export type Provenance = "USER_CONFIRMED" | "DOCUMENT_SUPPORTED" | "LLM_DRAFT" | "DEFAULTED";
export interface Fact { value: unknown; provenance?: Provenance; derived?: string }
export type Facts = Record<string, Fact>;

/**
 * Derivation rules. A screen is one question over an OR-joined list (WP7 4.1, 10a): every option
 * left unticked is an answered "no", which settles the facts listed for it. An if-rule settles facts
 * from one answer (no data interface -> no connection). Answers given directly always win.
 */
export type Derive =
  | { screen: string; unticked_sets: Record<string, Record<string, unknown>>; why: string }
  | { if: Record<string, unknown>; then: Record<string, unknown>; why: string };

export function applyDerive(derives: readonly Derive[] | undefined, raw: Facts): Facts {
  const facts: Facts = { ...raw };
  const setDefault = (k: string, v: Fact) => { if (!(k in facts)) facts[k] = v; };
  for (const d of derives ?? []) {
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

/** Facts that derivation can settle, mapped to the fact they derive from. */
export function derivationSources(derives: readonly Derive[] | undefined): Map<string, string> {
  const m = new Map<string, string>();
  for (const d of derives ?? []) {
    const src = "screen" in d ? d.screen : Object.keys(d.if)[0];
    const sets = "screen" in d ? Object.values(d.unticked_sets).flatMap((x) => Object.keys(x)) : Object.keys(d.then);
    for (const f of sets) if (!m.has(f)) m.set(f, src);
  }
  return m;
}

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

/**
 * Category evaluation, class aggregation and conformity routes.
 * Reference: docs/research/wp7-spike/evaluate.py (classify, route, to_output).
 */
import { T, F, U, C, O, AND_ORDER, OR_ORDER, combine, evalMatch, mapKey, pyRepr } from "./logic.js";
import type { Value, Match, Facts } from "./logic.js";

export type ClassName = "DEFAULT" | "IMPORTANT_I" | "IMPORTANT_II" | "CRITICAL";

export interface Condition {
  quote: string; fact?: string; is?: unknown; in?: unknown[]; map?: Record<string, Value>;
  category?: string; open_ref?: string; status?: string; where?: string;
}
export interface CategoryRule {
  rule_id: string; category: string; class: ClassName; status: string;
  conditions: Record<string, Condition>; match: Match; test_ids: string[];
}
export interface RouteCase {
  when: { is: unknown; date_fact?: string; on_or_after?: string; before?: string };
  route: string; unless_class_in?: ClassName[]; unless_route?: string; open_ref?: string;
}
export interface RouteRule {
  rule_id: string; fact: string; cases: RouteCase[]; effective_from?: string; displaces?: string[]; date_fact?: string;
}
export interface ClassificationRules {
  rule_set_version: string; law_as_of: string;
  sources: Record<string, { id: string; sha256: string; file?: string }>;
  class_order: ClassName[]; categories_total: number; category_ids: string[];
  facts: Record<string, { type: string; evidence: string }>;
  categories: CategoryRule[]; routes: RouteRule[];
}

export interface CategoryResult {
  value: Value; class: ClassName; conditions: Record<string, Value>; failing: string[]; open: (string | undefined)[];
}
export interface ClassifyResult {
  status: ClassName | "UNRESOLVED"; floor: ClassName; blockers: string[]; reasons: string[];
  categories: Record<string, CategoryResult>; trace: string[];
}

type FactRead = ["VALUE", unknown] | [Value, null];

/** Evidence gate: a value from a MANUFACTURER_ONLY fact counts only if the user confirmed it. */
function factValue(fid: string, facts: Facts, rules: ClassificationRules, trace: string[]): FactRead {
  const f = facts[fid];
  if (f === undefined) return [U, null];
  const val = f.value === undefined ? U : f.value;
  const prov = f.provenance ?? "USER_CONFIRMED";
  if (val === U || val === C) return [val as Value, null];
  if (rules.facts[fid].evidence === "MANUFACTURER_ONLY" && prov !== "USER_CONFIRMED") {
    trace.push(`${fid}=${pyRepr(val)} from ${prov}: not user-confirmed, treated as UNKNOWN`);
    return [U, null];
  }
  return ["VALUE", val];
}

function evalCondition(cond: Condition, facts: Facts, rules: ClassificationRules,
                       results: Record<string, CategoryResult>, trace: string[]): Value {
  if (cond.category !== undefined) return results[cond.category].value;
  const [state, val] = factValue(cond.fact!, facts, rules, trace);
  if (state !== "VALUE") return state;
  if ("is" in cond) return val === cond.is ? T : F;
  if (cond.in !== undefined) return cond.in.includes(val) ? T : F;
  if (cond.map !== undefined) return cond.map[mapKey(val)] ?? U;
  throw new Error(`condition without a test: ${JSON.stringify(cond)}`);
}

/**
 * Evaluate every encoded category and aggregate the class. Categories without a rule always
 * block DEFAULT and cap the class (AC-03); there is deliberately no switch to assume them away.
 */
export function classify(rules: ClassificationRules, facts: Facts): ClassifyResult {
  const order = rules.class_order;
  const results: Record<string, CategoryResult> = {};
  const trace: string[] = [];
  for (const cat of rules.categories) {  // listed so that referenced categories come first
    const vals: Record<string, Value> = {};
    for (const [cid, c] of Object.entries(cat.conditions)) vals[cid] = evalCondition(c, facts, rules, results, trace);
    const v = evalMatch(cat.match, vals);
    const failing = Object.entries(vals).filter(([, x]) => x === F).map(([cid]) => cid);
    results[cat.category] = {
      value: v, class: cat.class, conditions: vals, failing: v === F ? failing : [],
      open: Object.entries(vals).filter(([, x]) => x === O).map(([cid]) => cat.conditions[cid].open_ref),
    };
  }
  const matched = Object.values(results).filter((r) => r.value === T).map((r) => r.class);
  const floor = matched.reduce<ClassName>((a, b) => (order.indexOf(b) > order.indexOf(a) ? b : a), matched[0] ?? "DEFAULT");
  const unsettled = Object.entries(results).filter(([, r]) => r.value !== F && r.value !== T && order.indexOf(r.class) > order.indexOf(floor));
  const nUncovered = rules.categories_total - rules.categories.length;
  const blockers = unsettled.map(([k, r]) => `${k}: ${r.value}`);
  if (nUncovered && floor !== "CRITICAL") blockers.push(`${nUncovered} categories without a rule (AC-03)`);
  const reasons = unsettled.map(([k, r]) =>
    r.value === O ? `LAW_OPEN ${k} (${r.open.filter(Boolean).join(", ")})`
      : r.value === C ? `CONFLICTING_FACTS ${k} -> review flag` : `MISSING_FACTS ${k}`);
  return { status: blockers.length ? "UNRESOLVED" : floor, floor, blockers, reasons, categories: results, trace };
}

export interface RouteResult { rule: string; route: string; open_ref?: string; displaces?: string[] }

/**
 * Conformity routes (CRA Art. 12, Art. 32(5a)). A route that depends on the class uses the
 * floor while the class is unresolved, and is conditional if the floor does not decide it.
 */
export function route(rules: ClassificationRules, facts: Facts, result: ClassifyResult): RouteResult[] {
  const { status: cls, floor } = result;
  let out: RouteResult[] = [];
  for (const r of rules.routes) {
    const placed = (r.date_fact ? facts[r.date_fact]?.value : undefined) as string | undefined;
    const [state, val] = factValue(r.fact, facts, rules, []);
    if (state !== "VALUE") continue;
    if (r.effective_from && (placed === undefined || placed < r.effective_from)) continue;
    for (const c of r.cases) {
      const w = c.when;
      if (w.is !== val) continue;
      if (w.on_or_after !== undefined && !(placed && placed >= w.on_or_after)) continue;
      if (w.before !== undefined && !(placed && placed < w.before)) continue;
      let rt = c.route;
      if (c.unless_class_in?.length) {
        if ((c.unless_class_in as string[]).includes(cls) || c.unless_class_in.includes(floor)) rt = c.unless_route!;
        else if (cls === "UNRESOLVED") rt = `DEPENDS_ON_CLASS(${c.route}|${c.unless_route})`;
      }
      out.push({ rule: r.rule_id, route: rt, open_ref: c.open_ref, displaces: r.displaces ?? [] });
      break;
    }
  }
  const displaced = new Set(out.flatMap((o) => o.displaces ?? []));
  out = out.filter((o) => !displaced.has(o.route));
  const specific = out.filter((o) => o.route !== "CRA_ART_32");
  if (specific.length > 1) return [{ rule: specific.map((o) => o.rule).join("+"), route: "OPEN", open_ref: "route conflict" }];
  return out;
}

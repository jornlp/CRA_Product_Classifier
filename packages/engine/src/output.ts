/**
 * Render a classification in the assessment-output schema (packages/schemas).
 * Reference: docs/research/wp7-spike/evaluate.py to_output.
 */
import { T, F, U, C, O } from "./logic.js";
import type { Facts, Value } from "./logic.js";
import type { ClassificationRules, ClassifyResult, ClassName, RouteResult } from "./classification.js";

const classOf = (cid: string): ClassName =>
  cid.startsWith("IV") ? "CRITICAL" : cid.startsWith("III-II") ? "IMPORTANT_II" : "IMPORTANT_I";

export interface OutputOptions {
  assessmentId: string; assessedAt: string; validUntil: string;
  /** Real scope and timeline results; without them the trial placeholders are used (golden files). */
  scope?: { status: string; reasons: string[] };
  timeline?: { obligation: string; status: string; provision: string; basis?: string; applies_from?: string; open_questions?: string[] }[];
  validityWarnings?: { kind: "PAST_END_DATE" | "LAW_CHANGED"; detail: string; rules?: string[]; since?: string }[];
}

export function toOutput(rules: ClassificationRules, facts: Facts, res: ClassifyResult, routes: RouteResult[], opt: OutputOptions) {
  const order = rules.class_order;
  const encoded = Object.fromEntries(rules.categories.map((c) => [c.category, c]));
  const uncovered = rules.category_ids.filter((c) => !(c in encoded));
  const floor = res.floor;
  const above = (cls: ClassName) => order.indexOf(cls) > order.indexOf(floor);
  const blocking: { category: string; value: string }[] = Object.entries(res.categories)
    .filter(([, r]) => r.value !== T && r.value !== F && above(r.class)).map(([k, r]) => ({ category: k, value: r.value }));
  for (const c of uncovered) if (above(classOf(c))) blocking.push({ category: c, value: "NOT_COVERED" });

  const reasons: Record<string, string>[] = [];
  const nextq: string[] = [];
  const kinds: Partial<Record<Value, string>> = { [U]: "MISSING_FACTS", [C]: "CONFLICTING_FACTS", [O]: "LAW_OPEN" };
  for (const [k, r] of Object.entries(res.categories)) {
    if ((r.value === U || r.value === C || r.value === O) && above(r.class)) {
      const kind = kinds[r.value]!;
      const item: Record<string, string> = { kind, category: k, detail: `${k} is ${r.value}` };
      if (r.value === O) item.open_ref = r.open.filter(Boolean).join(", ");
      reasons.push(item);
      if (kind === "MISSING_FACTS") {
        for (const [cid, v] of Object.entries(r.conditions)) {
          const cond = encoded[k].conditions[cid];
          if (v === U && cond.fact !== undefined) nextq.push(cond.fact);
        }
      }
    }
  }
  if (uncovered.length) reasons.push({ kind: "COVERAGE", detail: `${uncovered.length} categories have no rule yet` });
  for (const t of res.trace) reasons.push({ kind: "EVIDENCE_BELOW_REQUIREMENT", detail: t });

  return {
    assessment_id: opt.assessmentId, assessed_at: opt.assessedAt, rule_set_version: rules.rule_set_version,
    law_as_of: rules.law_as_of, valid_until: opt.validUntil, validity_warnings: opt.validityWarnings ?? [],
    sources: Object.entries(rules.sources).map(([code, v]) => ({ code, id: v.id, sha256: v.sha256 })),
    facts: Object.entries(facts).map(([fact_id, v]) => ({ fact_id, value: v.value, provenance: v.provenance ?? "USER_CONFIRMED" })),
    scope: opt.scope ? { status: opt.scope.status, reasons: opt.scope.reasons } : { status: "IN_SCOPE", reasons: ["assumed in trial"], assumed: true },
    classification: {
      status: blocking.length ? "UNRESOLVED" : floor, class_floor: floor, blocking,
      matched: Object.entries(res.categories).filter(([, r]) => r.value === T)
        .map(([k, r]) => ({ category: k, class: r.class, rule_id: encoded[k].rule_id })),
      excluded: Object.entries(res.categories).filter(([, r]) => r.value === F).map(([k, r]) => ({
        category: k, rule_id: encoded[k].rule_id,
        failing: r.failing.map((c) => {
          const cond = encoded[k].conditions[c];
          return { condition: c, quote: cond.quote, ...(cond.fact !== undefined ? { fact: cond.fact } : {}) };
        }),
      })),
      uncovered_categories: uncovered,
    },
    conformity_routes: routes.map((r) => ({ rule_id: r.rule, route: r.route, open_ref: r.open_ref ?? null })),
    timeline: opt.timeline ?? [], reasons, next_questions: [...new Set(nextq)].sort(),
    reassessment_recommended: { value: false }, disclaimer_version: "v3-13-draft",
  };
}

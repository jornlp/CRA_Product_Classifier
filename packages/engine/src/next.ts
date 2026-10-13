/**
 * Which question next (v4 getNextQuestions). Pruning is load-bearing for legal safety (DR-04,
 * AC-03): a question is skipped only when its answer can no longer change the outcome, so every
 * category the engine stops asking about is settled, with its failing condition recorded.
 */
import { T, F, U, C, O, derivationSources } from "./logic.js";
import type { Value, Match, Facts } from "./logic.js";
import { classify } from "./classification.js";
import type { ClassificationRules } from "./classification.js";
import type { ScopeRules } from "./scope.js";
import { scopeConditionValues } from "./scope.js";
import type { TimelineRules, TimelineFacts } from "./timeline.js";

/** Condition ids that are undecided AND could still change the value of this match tree. */
export function relevantUnknowns(expr: Match, values: Record<string, Value>): string[] {
  if (typeof expr === "string") return values[expr] === U ? [expr] : [];
  const kids = "all" in expr ? expr.all : expr.any;
  const vals = kids.map((k) => valueOf(k, values));
  if ("all" in expr && vals.includes(F)) return [];   // one failed condition decides an AND
  if ("any" in expr && vals.includes(T)) return [];   // one matched limb decides an OR
  return kids.flatMap((k) => relevantUnknowns(k, values));
}
function valueOf(expr: Match, values: Record<string, Value>): Value {
  if (typeof expr === "string") return values[expr];
  const vals = ("all" in expr ? expr.all : expr.any).map((k) => valueOf(k, values));
  const order = "all" in expr ? [F, C, O, U, T] : [T, C, O, U, F];
  return order.find((v) => vals.includes(v as Value)) as Value ?? order[order.length - 1] as Value;
}

/**
 * Facts to ask for the classification, most useful first: a fact that can settle several
 * categories at once (such as IC_TYPE) comes before one that settles a single category.
 * Only categories above the current class floor matter for the class.
 */
export function nextClassificationQuestions(rules: ClassificationRules, facts: Facts): string[] {
  const res = classify(rules, facts);
  const order = rules.class_order;
  const weight = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  let n = 0;
  for (const cat of rules.categories) {
    const r = res.categories[cat.category];
    if (r.value === T || r.value === F) continue;
    if (order.indexOf(r.class) <= order.indexOf(res.floor)) continue;
    for (const cid of relevantUnknowns(cat.match, r.conditions)) {
      const fid = cat.conditions[cid].fact;
      if (!fid || fid in facts) continue;  // answered (including "not sure"), or a category reference
      weight.set(fid, (weight.get(fid) ?? 0) + 1);
      if (!firstSeen.has(fid)) firstSeen.set(fid, n++);
    }
  }
  // A fact a screen can settle is preceded by the screen (as for scope).
  const src = derivationSources(rules.derive);
  for (const fid of [...weight.keys()]) {
    const s = src.get(fid);
    // Only screens that belong to the classification are asked here; the exclusion screen is a
    // scope question, so in a classification-only check its follow-up is asked directly.
    if (s && !(s in facts) && s in rules.facts) { weight.set(s, (weight.get(s) ?? 0) + weight.get(fid)!); if (!firstSeen.has(s)) firstSeen.set(s, -1); }
  }
  // Reading order first (rules' ask_order); otherwise the fact that settles most categories.
  const pos = (f: string) => { const i = (rules.ask_order ?? []).indexOf(f); return i < 0 ? Infinity : i; };
  return [...weight.keys()].sort((a, b) => pos(a) - pos(b) || weight.get(b)! - weight.get(a)! || firstSeen.get(a)! - firstSeen.get(b)!);
}

/** Facts to ask for scope. Exclusion follow-ups appear only once the screen marks them. */
export function nextScopeQuestions(rules: ScopeRules, facts: Facts): string[] {
  const { applicability: av, exclusions: ev, facts: derived } = scopeConditionValues(rules, facts);
  const a = rules.applicability, e = rules.exclusions;
  const appVal = valueOf(a.match, av);
  if (appVal === F) return [];                                  // not applicable: decided
  if (Object.values(ev).includes(T)) return [];                 // excluded: decided
  const out: string[] = [];
  for (const cid of relevantUnknowns(a.match, av)) {
    const fid = a.conditions[cid].fact;
    if (!(fid in derived) && !out.includes(fid)) out.push(fid);
  }
  for (const [cid, v] of Object.entries(ev)) {
    if (v !== U) continue;
    const fid = e.conditions[cid].fact;
    if (!(fid in derived) && !out.includes(fid)) out.push(fid);
  }
  // A fact that derivation rules can settle is preceded by the fact it derives from: the
  // exclusion screen settles every unticked follow-up, and "no data interface" settles both
  // connection questions (SCP-06). Without this, selection would skip the deciding question.
  const sources: string[] = [];
  for (const fid of out) {
    for (const d of rules.derive) {
      const src = "screen" in d ? d.screen : Object.keys(d.if)[0];
      const sets = "screen" in d ? Object.values(d.unticked_sets).flatMap((x) => Object.keys(x)) : Object.keys(d.then);
      if (sets.includes(fid) && !(src in derived) && !sources.includes(src)) sources.push(src);
    }
  }
  const all = [...sources, ...out.filter((x) => !sources.includes(x))];
  const pos = (f: string) => { const i = (rules.ask_order ?? []).indexOf(f); return i < 0 ? Infinity : i; };
  return all.sort((a, b) => pos(a) - pos(b));
}

/** Timeline questions in order; each follow-up only when the previous answer makes it matter. */
export function nextTimelineQuestions(rules: TimelineRules, f: TimelineFacts): string[] {
  const D = rules.dates, out: string[] = [];
  const has = (k: string) => k in f;
  // Radio first: whether the RED delegated act applies decides whether 1 August 2025 is a period boundary.
  if (!has("RADIO_EQUIPMENT_RED_DA")) out.push("RADIO_EQUIPMENT_RED_DA");
  if (!has("UNITS_PLACED_ON_MARKET")) out.push("UNITS_PLACED_ON_MARKET");
  const placed = f.UNITS_PLACED_ON_MARKET as string | undefined;
  if (placed && placed !== "UNKNOWN" && placed < D.CRA_APPLICATION) {
    if (!has("CHANGE_AT")) out.push("CHANGE_AT");
    const ch = f.CHANGE_AT as string | undefined;
    if (ch && ch !== "UNKNOWN" && ch >= D.CRA_APPLICATION) {
      if (!has("CHANGE_AFFECTS_PURPOSE")) out.push("CHANGE_AFFECTS_PURPOSE");
      if (f.CHANGE_AFFECTS_PURPOSE === false && !has("CHANGE_AFFECTS_ANNEX_I")) out.push("CHANGE_AFFECTS_ANNEX_I");
    }
  }
  if (!has("OTHER_LEGISLATION_CERTIFICATE")) out.push("OTHER_LEGISLATION_CERTIFICATE");
  if (f.OTHER_LEGISLATION_CERTIFICATE === true && !has("CERTIFICATE_EXPIRY")) out.push("CERTIFICATE_EXPIRY");
  return out;
}

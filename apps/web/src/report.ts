/**
 * Human-readable report (Markdown) of an assessment: what was concluded, why, on what answers,
 * and under which law. The JSON export remains the complete machine-readable record.
 */
type Out = any;
interface Ctx {
  categories: Record<string, { title: string; class: string }>;
  questions: Record<string, { question: string; options?: { value: unknown; label: string }[] }>;
  derived: Record<string, string>;
  disclaimer: string;
}

const CLASS: Record<string, string> = {
  DEFAULT: "Default", IMPORTANT_I: "Important, Class I", IMPORTANT_II: "Important, Class II", CRITICAL: "Critical", UNRESOLVED: "Not determined",
};
const SCOPE: Record<string, string> = {
  IN_SCOPE: "The CRA applies to this product.", OUT_OF_SCOPE: "The CRA does not apply to this product.", UNRESOLVED: "Not determined.",
};
const TL: Record<string, string> = { APPLIES: "Applies", NOT_YET: "Not yet", TRANSITION: "Transition", NOT_APPLICABLE: "Does not apply", UNRESOLVED: "Not determined" };
const REASON: Record<string, string> = {
  MISSING_FACTS: "An answer is missing for", CONFLICTING_FACTS: "Answers conflict for", LAW_OPEN: "The law does not settle",
};
const cell = (s: unknown) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function answerLabel(ctx: Ctx, fid: string, v: unknown): string {
  if (v === "UNKNOWN") return "Not sure";
  if (v === "CONFLICTING") return "Our documents say different things";
  const opts = ctx.questions[fid]?.options ?? [];
  if (Array.isArray(v)) return v.length ? v.map((x) => opts.find((o) => o.value === x)?.label ?? String(x)).join("; ") : "None of these";
  return opts.find((o) => o.value === v)?.label ?? (v === "" ? "No change" : String(v));
}

export function reportMarkdown(out: Out, ctx: Ctx): string {
  const L: string[] = [];
  const cat = (id: string) => `${ctx.categories[id]?.title ?? id} (${id})`;
  const rec = out.for_your_records ?? {};
  const check = { scope: "Does the CRA apply?", class: "Which class?", full: "Full check" }[out.check as string] ?? "Full check";
  L.push(`# CRA assessment${rec.product ? `: ${rec.product}` : ""}`, "");
  L.push(`| | |`, `|---|---|`,
    `| Date | ${out.assessed_at} |`, `| Check | ${check} |`,
    `| Law as of | ${out.law_as_of} (rule set ${out.rule_set_version}) |`, `| Valid until | ${out.valid_until} |`);
  if (rec.description) L.push(`| Product | ${cell(rec.description)} |`);
  L.push("");
  for (const w of out.validity_warnings ?? []) L.push(`> **${w.kind === "PAST_END_DATE" ? "Outdated" : "Law changed"}:** ${w.detail}`, "");

  L.push("## Scope", "");
  if (out.check === "class") L.push("Not checked. The class below assumes the CRA applies.", "");
  else L.push(`**${SCOPE[out.scope.status]}**`, "", ...out.scope.reasons.map((r: string) => `- ${r}`), "");

  const c = out.classification;
  if (out.check === "class" || (out.check !== "scope" && out.scope.status === "IN_SCOPE")) {
    L.push("## Class", "");
    const stated = c.status === "UNRESOLVED" ? `Not determined. At least: ${CLASS[c.class_floor]}` : CLASS[c.status];
    L.push(`**${out.check === "class" ? "If the CRA applies: " : ""}${stated}**`, "");
    if (c.matched.length) L.push("### Matches", "", ...c.matched.map((m: any) => `- ${cat(m.category)}: ${CLASS[m.class]}`), "");
    const open = out.reasons.filter((r: any) => r.category && r.kind in REASON);
    if (open.length) {
      L.push("### Still open", "", ...open.map((r: any) => `- ${REASON[r.kind]} ${cat(r.category)}${r.open_ref ? ` (${r.open_ref})` : ""}${
        r.kind === "LAW_OPEN" ? ". Get expert advice: more answers will not resolve this." : ""}`), "");
    }
    const cov = c.blocking.filter((b: any) => b.value === "NOT_COVERED").length;
    if (cov) L.push(`_${cov} categories have no rule yet in this version, so the class cannot be stated in full._`, "");
    if (c.excluded.length) {
      L.push("### Ruled out, and why", "");
      for (const x of c.excluded) {
        const via = x.failing.some((f: any) => f.fact && f.fact in ctx.derived);
        L.push(`- ${cat(x.category)}: does not meet ${x.failing.map((f: any) => `“${f.quote}”`).join(" or ")}${via ? " _(you indicated the product is not mainly for this)_" : ""}`);
      }
      L.push("");
    }
    const routes = out.conformity_routes.filter((r: any) => r.route !== "CRA_ART_32");
    if (routes.length) L.push("### Conformity route", "", ...routes.map((r: any) => `- ${r.route}${r.open_ref ? ` (${r.open_ref})` : ""}`), "");
  }
  if (out.timeline?.length) {
    L.push("## When obligations apply", "", "| Obligation | Status | From | Basis |", "|---|---|---|---|");
    for (const i of out.timeline) {
      L.push(`| ${cell(i.obligation.replace(/_/g, " ").toLowerCase())} (${cell(i.provision)}) | ${TL[i.status]} | ${i.applies_from ?? ""} | ${cell(i.basis)}${i.open_questions ? ` ${cell(i.open_questions.join(" "))}` : ""} |`);
    }
    L.push("");
  }

  L.push("## Your answers", "", "| Question | Answer |", "|---|---|");
  for (const f of out.facts) L.push(`| ${cell(ctx.questions[f.fact_id]?.question ?? f.fact_id)} | ${cell(answerLabel(ctx, f.fact_id, f.value))} |`);
  for (const [k, v] of Object.entries<unknown>(out.timeline_facts ?? {})) {
    if (k === "ASSESSMENT_DATE" || k === "UNITS_PLACED_ON_MARKET") continue;
    L.push(`| ${cell(ctx.questions[k]?.question ?? k)} | ${cell(answerLabel(ctx, k, v))} |`);
  }
  L.push("");
  L.push("## Sources", "", ...out.sources.map((s: any) => `- ${s.code}: ${s.id} (sha256 ${s.sha256.slice(0, 12)}…)`), "");
  L.push("---", "", `_${ctx.disclaimer}_`, "");
  return L.join("\n");
}

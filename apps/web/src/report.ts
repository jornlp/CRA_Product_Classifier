import { longDate } from "../../../packages/engine/src/periods.js";
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
  /** Plain-language scope reasons (explain.ts); the engine's technical reasons stay in the JSON. */
  scopeReasons?: string[];
}

export const CLASS: Record<string, string> = {
  DEFAULT: "Default", IMPORTANT_I: "Important, Class I", IMPORTANT_II: "Important, Class II", CRITICAL: "Critical", UNRESOLVED: "Not determined",
};
const SCOPE: Record<string, string> = {
  IN_SCOPE: "Based on your answers, the CRA applies to this product.",
  OUT_OF_SCOPE: "Based on your answers, the CRA does not apply to this product.",
  UNRESOLVED: "Based on your answers so far, whether the CRA applies is not determined.",
};
export const scopeVerdict = (status: string) => SCOPE[status];
/** The class verdict, always tied to the answers, and conditional in a class-only check. */
export function classVerdict(c: { status: string; class_floor: string }, check?: string): string {
  const stated = c.status === "UNRESOLVED" ? `not determined; at least ${CLASS[c.class_floor]}` : CLASS[c.status];
  return check === "class" ? `If the CRA applies, based on your answers: ${stated}` : `Based on your answers: ${stated}`;
}
const TL: Record<string, string> = { APPLIES: "Applies", NOT_YET: "Not yet", TRANSITION: "Transition", NOT_APPLICABLE: "Does not apply", UNRESOLVED: "Not determined" };
const REASON: Record<string, string> = {
  MISSING_FACTS: "An answer is missing for", CONFLICTING_FACTS: "Answers conflict for", LAW_OPEN: "The law does not settle",
};
/** Obligations that depend on when the units are placed; the result shows them per placing period. */
export const BY_PLACING = new Set(["CRA_ESSENTIAL_REQUIREMENTS", "RED_DA_CYBERSECURITY"]);
export const PLACING_COLUMN: Record<string, string> = {
  CRA_ESSENTIAL_REQUIREMENTS: "CRA requirements (Art. 69(2), 71(2))",
  RED_DA_CYBERSECURITY: "Radio equipment cybersecurity rules (Del. Reg. (EU) 2022/30)",
};

/** Plain text for one obligation in one placing period. */
export function placingCell(i: { obligation: string; status: string; applies_from?: string; open_questions?: string[] } | undefined): string {
  if (!i) return "Does not apply";
  if (i.obligation === "CRA_ESSENTIAL_REQUIREMENTS") {
    if (i.status === "APPLIES") return "Apply";
    if (i.status === "NOT_YET") return `Apply from ${longDate(i.applies_from!)}`;
    if (i.status === "TRANSITION") return "Do not apply to these units, unless they are substantially modified on or after 11 December 2027 (Art. 3(30))";
  }
  if (i.obligation === "RED_DA_CYBERSECURITY" && i.status === "UNRESOLVED") return "Not determined: whether the delegated act covers the product is unknown";
  return TL[i.status] + (i.open_questions?.length ? `. ${i.open_questions.join(" ")}` : "");
}
/** Row names of the obligations table, and the provisions behind them. */
export const OBLIGATION_LABEL: Record<string, string> = {
  CRA_ESSENTIAL_REQUIREMENTS: "CRA requirements: security requirements, conformity assessment, CE marking (Art. 69(2), 71(2))",
  CRA_ART_14_REPORTING: "Reporting actively exploited vulnerabilities and severe incidents (Art. 14, 69(3), 71(2))",
  OTHER_LEGISLATION_CERTIFICATE: "Your existing certificate under other EU law (Art. 69(1))",
};
const isoToLong = (t: string) => t.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (d) => longDate(d));
const sentence = (t: string) => isoToLong(t.charAt(0).toUpperCase() + t.slice(1));
/** Plain text for an obligation that does not depend on the placing date. */
function otherCell(i: { obligation: string; status: string; applies_from?: string; basis?: string }): string {
  if (i.obligation === "CRA_ART_14_REPORTING")
    return i.status === "APPLIES" ? `Applies since ${longDate(i.applies_from!)}` : `Applies from ${longDate(i.applies_from!)}`;
  return sentence(i.basis ?? "");
}
/** One table: a row per obligation, a column per placing period. What does not depend on the placing date has the same cell in every column. */
export function obligationTable(periods: PlacingRow[], other: { obligation: string; status: string; applies_from?: string; basis?: string }[]):
    { columns: string[]; rows: { obligation: string; label: string; cells: string[] }[] } {
  const columns = periods.length ? periods.map((p) => p.period) : ["Whenever placed"];
  const rows = [...BY_PLACING].filter((o) => periods.some((p) => p.timeline.some((i) => i.obligation === o)))
    .map((o) => ({ obligation: o, label: OBLIGATION_LABEL[o] ?? PLACING_COLUMN[o], cells: periods.map((p) => placingCell(p.timeline.find((i) => i.obligation === o) as never)) }));
  for (const i of other) rows.push({ obligation: i.obligation, label: OBLIGATION_LABEL[i.obligation] ?? i.obligation, cells: columns.map(() => otherCell(i)) });
  return { columns, rows };
}
export interface PlacingRow { period: string; conformity_routes: { route: string }[]; timeline: { obligation: string; status: string }[] }

/** Pointer only: the tool does not ask about or assess the RED delegated act. */
export const RED_NOTE =
  "Radio equipment may already have to meet cybersecurity requirements under the radio equipment rules (Delegated Regulation " +
  "(EU) 2022/30) for units placed on the market **since 1 August 2025**: already before the CRA's requirements apply, and for as long as " +
  "those rules remain in force. Radio equipment is " +
  "any product that intentionally sends or receives radio waves to communicate or to determine position, speed or other " +
  "characteristics, including one that needs an antenna added (Directive 2014/53/EU, Art. 2(1)): for example Wi-Fi, Bluetooth, " +
  "mobile, NFC or RFID, satellite positioning, or radar. The rules cover radio equipment that can communicate over the internet, " +
  "directly or via other equipment, and toys, childcare products and wearables that can process personal data. " +
  "This tool does not check those rules.";

/** Out of scope as non-commercial: open-source software stewards still have duties (Art. 24). */
export const STEWARD_NOTE = "Not commercial, so the CRA's product rules do not apply. If you are an open-source software steward " +
  "(a legal person that systematically supports open-source software intended for commercial use, Art. 3(14)), the CRA gives you " +
  "separate duties (Art. 24), including reporting (Art. 14).";

/** Pointer only: the AI Act and the EHDS do not change the CRA class or requirements, only the conformity procedure. */
export const ROUTE_NOTE = "Other EU laws may also apply to the product, such as the AI Act (for a high-risk AI system) or the " +
  "European Health Data Space Regulation (for an electronic health record system). They **do not change the CRA class or the CRA " +
  "requirements**; they can change **which conformity procedure** checks those requirements (CRA Art. 12 and 32(5a)). " +
  "This tool does not check those laws.";

const cell = (s: unknown) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function answerLabel(ctx: Ctx, fid: string, v: unknown): string {
  if (v === "UNKNOWN") return "Not sure";
  if (v === "CONFLICTING") return "Our documents say different things";
  const opts = ctx.questions[fid]?.options ?? [];
  if (Array.isArray(v)) return v.length ? v.map((x) => opts.find((o) => o.value === x)?.label ?? String(x)).join("; ") : "None of these";
  return opts.find((o) => o.value === v)?.label ?? String(v);
}

export function reportMarkdown(out: Out, ctx: Ctx): string {
  const L: string[] = [];
  const R: string[] = [];  // ruled-out categories: after the dates, so they do not bury them
  const cat = (id: string) => `${ctx.categories[id]?.title ?? id} (${id})`;
  const rec = out.for_your_records ?? {};
  const check = { scope: "Does the CRA apply?", class: "Which class?", full: "Full check" }[out.check as string] ?? "Full check";
  L.push(`# CRA assessment${rec.product ? `: ${rec.product}` : ""}`, "");
  L.push(`| | |`, `|---|---|`,
    `| Date | ${out.assessed_at} |`, `| Check | ${check} |`,
    `| Law as of | ${out.law_as_of} (rule set ${out.rule_set_version}) |`, `| Valid until | ${out.valid_until} |`);
  if (rec.description) L.push(`| Product | ${cell(rec.description)} |`);
  L.push("");
  for (const w of out.validity_warnings ?? []) L.push(`> **${({ PAST_END_DATE: "Outdated", LAW_CHANGED: "Law changed", LAW_CHECK_STALE: "Law check overdue" } as Record<string, string>)[w.kind]}:** ${w.detail}`, "");

  L.push("## Scope", "");
  if (out.check === "class") L.push("Not checked. The class below assumes the CRA applies.", "");
  else L.push(`**${SCOPE[out.scope.status]}**`, "", ...(ctx.scopeReasons ?? out.scope.reasons).map((r: string) => `- ${r}`), "");

  const c = out.classification;
  if (out.check === "class" || (out.check !== "scope" && out.scope.status === "IN_SCOPE")) {
    L.push("## Class", "");
    L.push(`**${classVerdict(c, out.check)}**`, "");
    if (c.matched.length) L.push("### Matches", "", ...c.matched.map((m: any) => `- ${cat(m.category)}: ${CLASS[m.class]}`), "");
    const open = out.reasons.filter((r: any) => r.category && r.kind in REASON);
    if (open.length) {
      L.push("### Still open", "", ...open.map((r: any) => `- ${REASON[r.kind]} ${cat(r.category)}${
        r.kind === "LAW_OPEN" ? ". Get expert advice: more answers will not resolve this." : ""}`), "");
    }
    const cov = c.blocking.filter((b: any) => b.value === "NOT_COVERED").length;
    if (cov) L.push(`_${cov} categories have no rule yet in this version, so the class cannot be stated in full._`, "");
    if (c.excluded.length) {
      R.push("## Ruled out, and why", "");
      for (const x of c.excluded) {
        const via = x.failing.some((f: any) => f.fact && f.fact in ctx.derived);
        R.push(`- ${cat(x.category)}: does not meet ${x.failing.map((f: any) => `“${f.quote}”`).join(" or ")}${via ? " _(you indicated the product is not mainly for this)_" : ""}`);
      }
      R.push("");
    }
    L.push(`_${ROUTE_NOTE}_`, "");
  }
  const tbl = obligationTable(out.timeline_by_placing_period ?? [], out.timeline ?? []);
  if (tbl.rows.length) {
    L.push(`## When the obligations apply${out.check === "class" ? " (if the CRA applies)" : ""}`, "",
      "_By when the units are placed on the market. Each unit counts on its own: what matters is when that unit is placed, not when the model was launched._", "");
    const head = ["Obligation", ...tbl.columns.map((c) => `Units placed ${c.charAt(0).toLowerCase()}${c.slice(1)}`)];
    L.push(`| ${head.map(cell).join(" | ")} |`, `|${head.map(() => "---").join("|")}|`);
    for (const r of tbl.rows) L.push(`| ${[r.label, ...r.cells].map(cell).join(" | ")} |`);
    L.push("", `_${RED_NOTE}_`, "");
  }

  L.push(...R);
  L.push("## Your answers", "", "| Question | Answer |", "|---|---|");
  for (const f of out.facts) L.push(`| ${cell(ctx.questions[f.fact_id]?.question ?? f.fact_id)} | ${cell(answerLabel(ctx, f.fact_id, f.value))} |`);
  for (const [k, v] of Object.entries<unknown>(out.timeline_facts ?? {})) {
    if (k === "ASSESSMENT_DATE") continue;
    L.push(`| ${cell(ctx.questions[k]?.question ?? k)} | ${cell(answerLabel(ctx, k, v))} |`);
  }
  L.push("");
  L.push("## Sources", "", ...out.sources.map((s: any) => `- ${s.code}: ${s.id} (sha256 ${s.sha256.slice(0, 12)}…)`), "");
  L.push("---", "", `_${ctx.disclaimer}_`, "");
  return L.join("\n");
}

/**
 * Render the report's own Markdown as HTML, for printing to PDF. Only the subset reportMarkdown
 * produces is supported: headings, tables, lists, block quotes, rules, bold and italic.
 */
export function markdownToHtml(md: string): string {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const inline = (s: string) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_(.+?)_(?=$|[\s.,;:)])/g, "$1<em>$2</em>");
  const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
  const out: string[] = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^### /.test(l)) out.push(`<h3>${inline(l.slice(4))}</h3>`);
    else if (/^## /.test(l)) out.push(`<h2>${inline(l.slice(3))}</h2>`);
    else if (/^# /.test(l)) out.push(`<h1>${inline(l.slice(2))}</h1>`);
    else if (l === "---") out.push("<hr>");
    else if (l.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      i--;
      const [head, , ...body] = rows;
      const h = cells(head);
      const thead = h.some((c) => c) ? `<thead><tr>${h.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>` : "";
      out.push(`<table>${thead}<tbody>${body.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    } else if (l.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      i--;
      out.push(`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`);
    } else if (l.startsWith("> ")) out.push(`<blockquote>${inline(l.slice(2))}</blockquote>`);
    else if (l.trim()) out.push(`<p>${inline(l)}</p>`);
  }
  return out.join("\n");
}

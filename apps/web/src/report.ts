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
const ROUTE_LABEL: Record<string, string> = {
  CRA_ART_32: "CRA conformity procedures (CRA Art. 32)",
  CRA_ART_32_VIA_ART_12_3: "CRA conformity procedures, by CRA Art. 12(3)",
  AI_ACT_ART_43: "AI Act conformity procedure (AI Act Art. 43), by CRA Art. 12(2)",
  EHDS_CHAPTER_III: "European Health Data Space conformity procedure (Regulation (EU) 2025/327, Chapter III), by CRA Art. 32(5a)",
  OPEN: "Not settled by the law. Get expert advice.",
};
/** Obligations that depend on when the units are placed; the result shows them per placing period. */
export const BY_PLACING = new Set(["CRA_ESSENTIAL_REQUIREMENTS", "RED_DA_CYBERSECURITY"]);
export const PLACING_COLUMN: Record<string, string> = {
  CRA_ESSENTIAL_REQUIREMENTS: "CRA requirements (Art. 69(2), 71(2))",
  RED_DA_CYBERSECURITY: "Radio equipment cybersecurity rules (Del. Reg. (EU) 2022/30)",
};
const LONG_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = (d: string) => { const [y, m, day] = d.split("-").map(Number); return `${day} ${LONG_MONTHS[m - 1]} ${y}`; };
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
export interface PlacingRow { period: string; conformity_routes: { route: string }[]; timeline: { obligation: string; status: string }[] }
/** Columns that matter: obligations present in any period, and the route only if it differs between periods. */
export function placingColumns(rows: PlacingRow[]): { obligations: string[]; routes: boolean } {
  const obligations = [...BY_PLACING].filter((o) => rows.some((r) => r.timeline.some((i) => i.obligation === o)));
  return { obligations, routes: new Set(rows.map((r) => JSON.stringify(r.conformity_routes.map((x) => x.route)))).size > 1 };
}
export const routesText = (rs: { route: string }[]) => rs.filter((r) => r.route !== "CRA_ART_32").map((r) => routeLabel(r.route)).join("; ") || routeLabel("CRA_ART_32");

/** Pointer only: the tool does not ask about or assess the RED delegated act. */
export const RED_NOTE =
  "Radio equipment may already have to meet cybersecurity requirements under the radio equipment rules (Delegated Regulation " +
  "(EU) 2022/30) for units placed on the market since 1 August 2025, before the CRA's requirements apply. Radio equipment is " +
  "any product that intentionally sends or receives radio waves to communicate or to determine position, speed or other " +
  "characteristics, including one that needs an antenna added (Directive 2014/53/EU, Art. 2(1)): for example Wi-Fi, Bluetooth, " +
  "mobile, NFC or RFID, satellite positioning, or radar. The rules cover radio equipment that can communicate over the internet, " +
  "directly or via other equipment, and toys, childcare products and wearables that can process personal data. " +
  "This tool does not check those rules.";

/** Pointer only: the AI Act and the EHDS do not change the CRA class or requirements, only the conformity procedure. */
export const ROUTE_NOTE = "Other EU laws may also apply to the product, such as the AI Act (for a high-risk AI system) or the " +
  "European Health Data Space Regulation (for an electronic health record system). They do not change the CRA class or the CRA " +
  "requirements; they can change which conformity procedure checks those requirements (CRA Art. 12 and 32(5a)). " +
  "This tool does not check those laws.";

export const routeLabel = (r: string) => ROUTE_LABEL[r] ?? (r.startsWith("DEPENDS_ON_CLASS") ? "Depends on the class, which is not yet determined" : r);
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
  const rows: PlacingRow[] = out.timeline_by_placing_period ?? [];
  const pc = placingColumns(rows);
  if (rows.length && (pc.obligations.length || pc.routes)) {
    L.push("## Depends on when the units are placed on the market", "",
      "_Each unit counts on its own: what matters is when that unit is placed on the market, not when the model was launched._", "");
    const head = ["Units placed", ...pc.obligations.map((o) => PLACING_COLUMN[o]), ...(pc.routes ? ["Conformity route"] : [])];
    L.push(`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`);
    for (const r of rows) {
      L.push(`| ${[r.period, ...pc.obligations.map((o) => placingCell(r.timeline.find((i) => i.obligation === o) as any)),
        ...(pc.routes ? [routesText(r.conformity_routes)] : [])].map(cell).join(" | ")} |`);
    }
    L.push("");
  }
  if (out.timeline?.length || rows.length) L.push(`_${RED_NOTE}_`, "");
  if (out.timeline?.length) {
    L.push("## When obligations apply", "", "| Obligation | Status | From | Basis |", "|---|---|---|---|");
    for (const i of out.timeline) {
      L.push(`| ${cell(i.obligation.replace(/_/g, " ").toLowerCase())} (${cell(i.provision)}) | ${TL[i.status]} | ${i.applies_from ?? ""} | ${cell(i.basis)}${i.open_questions ? ` ${cell(i.open_questions.join(" "))}` : ""} |`);
    }
    L.push("");
  }

  L.push(...R);
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

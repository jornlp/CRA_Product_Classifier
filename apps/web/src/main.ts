/**
 * CRA Scope & Classifier: the question flow and the result.
 * Everything runs in the browser. Nothing entered here is sent anywhere (AC-07).
 */
import "./style.css";
import cls from "../../../packages/rules/classification.json";
import sc from "../../../packages/rules/scope.json";
import tl from "../../../packages/rules/timeline.json";
import qs from "../../../packages/rules/questions.json";
import guidance from "../../../packages/rules/guidance.json";
import { classify, route, toOutput, scope, timeline, validityWarnings, placingPeriods, placingOutcome } from "../../../packages/engine/src/index.js";
import { nextStep, record, unrecord } from "./flow.js";
import type { Phase, Mode } from "./flow.js";
import type { ClassificationRules, ScopeRules, TimelineRules, Facts, LawStatus } from "../../../packages/engine/src/index.js";
import { CONFIG, validUntil } from "./config.js";
import { initTheme } from "./theme.js";
import { reportMarkdown, routeLabel, markdownToHtml, scopeVerdict, classVerdict, RED_NOTE, ROUTE_NOTE, STEWARD_NOTE, BY_PLACING, PLACING_COLUMN, placingCell, placingColumns, routesText } from "./report.js";
import type { PlacingRow } from "./report.js";
import { aboutHtml } from "./about.js";
import { scopeReasonsPlain } from "./explain.js";
import { count } from "./analytics.js";

const RULES = cls as unknown as ClassificationRules;
const SCOPE = sc as unknown as ScopeRules;
const TIMELINE = tl as unknown as TimelineRules;
type CatInfo = { category: string; title: string; class: string; named_products: string[]; description: string;
  description_parts?: { text: string; mark?: boolean }[] };
type FaqExample = { counts: boolean; text: string; quote: string; source: string };
type Option = { value: unknown; label: string; group?: string; info?: CatInfo[]; faq_examples?: FaqExample[] };

/** What an option on the purpose screen covers, straight from the implementing regulation. */
function optionInfoHtml(info: CatInfo[], id: string, faq: FaqExample[] = []): string {
  const faqHtml = faq.length ? `<div class="faq-ex"><p class="src src-official_guidance">Commission FAQ v14 (non-binding)</p><ul>${faq.map((e) =>
    `<li><strong>${e.counts ? "Counts" : "Does not count"}:</strong> ${esc(e.text)}
      <details><summary>Exact wording</summary><blockquote>${esc(e.quote)}</blockquote></details></li>`).join("")}</ul></div>` : "";
  return `<div class="opt-info" id="${id}" hidden>${faqHtml}${info.map((c) => `
    <article class="law">
      <p class="law-act">Implementing Regulation (EU) 2025/2392 · ${esc(CLASS_LABEL[c.class])}</p>
      <p class="law-title">${esc(c.title)}</p>
      ${c.named_products.length ? `<div class="named"><p class="named-head">Examples named in the regulation</p>${
        c.named_products.map((n) => `<p class="named-list">${esc(n.replace(/^This category includes but is not limited to /, "").replace(/^./, (x) => x.toUpperCase()))}</p>`).join("")}</div>` : ""}
      <p class="named-head">What the regulation requires</p>
      <p class="law-desc">${(c.description_parts ?? [{ text: c.description }]).map((p) =>
        p.mark ? `<mark>${esc(p.text)}</mark>` : esc(p.text)).join("")}</p>
      <p class="muted small">Highlighted: the conditions this tool checks for this category.</p>
    </article>`).join("")}</div>`;
}
type LawLine = { label: string; level: number; parts: { text: string; mark?: boolean }[] };
type Legal = { ref: string; quote?: string; text?: { act: string; heading: string; lines: LawLine[] } | null };

/** A provision laid out as law: act, centred article heading, numbered lines, decisive words marked. */
function lawHtml(l: Legal): string {
  if (!l.text) return `<p class="law-cite"><strong>${esc(l.ref)}</strong> <span class="muted">(citation only; this tool does not hold the text)</span></p>`;
  const [num, ...title] = l.text.heading.split(": ");
  return `<article class="law">
    <p class="law-act">${esc(l.text.act)}</p>
    ${l.text.heading ? `<p class="law-num">${esc(num)}</p>${title.length ? `<p class="law-title">${esc(title.join(": "))}</p>` : ""}` : ""}
    ${l.text.lines.map((ln) => `<p class="law-line lvl${ln.level}"><span class="law-label">${esc(ln.label)}</span><span>${
      ln.parts.map((p) => (p.mark ? `<mark>${esc(p.text)}</mark>` : esc(p.text))).join("")}</span></p>`).join("")}
  </article>`;
}
type Question = { question: string; kind: string; why_we_ask: string; legal_basis?: Legal[]; hint?: string; options?: Option[]; evidence?: string;
  stem?: string; stem_warning?: string; stem_note?: string };
const QUESTIONS = (qs as { questions: Record<string, Question> }).questions;
/** Escape, then render the notes' **key phrase** marks as bold. */
const strong = (t: string) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
/** The law behind each timeline obligation, verbatim with the key words marked. */
const OBLIGATION_LAW = (qs as unknown as { obligations: Record<string, Legal[]> }).obligations;
const OBLIGATION_FAQ = (qs as unknown as { obligation_faq: Record<string, { entry: string; quote: string; source: string }[]> }).obligation_faq;
const lawDetails = (obligation: string, summary: string) => {
  const law = OBLIGATION_LAW[obligation] ?? [], faq = OBLIGATION_FAQ[obligation] ?? [];
  if (!law.length && !faq.length) return `<span class="muted small">${esc(summary)}</span>`;
  return `<details class="legal"><summary>${esc(summary)}</summary>${law.map(lawHtml).join("")}${faq.length
    ? `<div class="faq"><p class="law-act">Commission FAQ on the CRA, version 14 (non-binding: it does not interpret the law authoritatively)</p>${
      faq.map((f) => `<blockquote><p>${esc(f.quote)}</p><p class="muted small">FAQ entry ${esc(f.entry)}</p></blockquote>`).join("")}</div>` : ""}</details>`;
};
const CATEGORIES = (qs as { categories: Record<string, { title: string; class: string }> }).categories;
type Example = { answer: string; kind: string; source: string; text: string; quote?: string; item?: string; category?: string; case?: string };
type Guide = { hint?: string; note?: string; examples: Example[]; lookalikes: { term: string; text: string; case?: string }[] };
const GUIDE = (guidance as { questions: Record<string, Guide> }).questions;

const CLASS_LABEL: Record<string, string> = {
  DEFAULT: "Default", IMPORTANT_I: "Important, Class I", IMPORTANT_II: "Important, Class II", CRITICAL: "Critical", UNRESOLVED: "Not determined",
};
const SOURCE_LABEL: Record<string, string> = {
  OFFICIAL_TEXT: "Official text (binding)", OFFICIAL_RECITAL: "CRA recital (explains the law, not binding)",
  OFFICIAL_GUIDANCE: "Commission FAQ v14 (non-binding)",
};

// ------------------------------------------------------------------ state

interface State {
  facts: Facts; tfacts: Record<string, unknown>; history: { phase: Phase; fid: string }[]; done: Set<string>; mode?: Mode;
  /** For the user's own records only; never used in the assessment. */
  record: { product: string; description: string };
  /** Last answer given to each question, so going back shows it again. */
  remembered: Record<string, unknown>;
}
const today = new Date().toISOString().slice(0, 10);
let state: State = fresh();
let lawStatus: LawStatus | null = null;
let showAbout = false;
const RULESET = { scope: SCOPE, classification: RULES, timeline: TIMELINE };

function fresh(): State {
  return { facts: {}, tfacts: { ASSESSMENT_DATE: today }, history: [], done: new Set(), record: { product: "", description: "" }, remembered: {} };
}
const current = () => nextStep(RULESET, state);

function answer(fid: string, phase: Phase, value: unknown) {
  state.history.push({ phase, fid });
  state.remembered[fid] = value;
  record(state, phase, fid, value);
  render();
}

function back() {
  const last = state.history.pop();
  if (!last) { state.mode = undefined; render(); return; }
  unrecord(state, last.phase, last.fid);
  render();
}

// ------------------------------------------------------------------ rendering helpers

const app = document.getElementById("app")!;
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const PHASE_LABEL: Record<Phase, string> = {
  start: "", scope: "Does the CRA apply?", class: "Which class?",
  routes: "Overlaps with other laws", timeline: "When do obligations apply?", result: "Result",
};

function optionLabel(fid: string, value: string): string {
  const o = QUESTIONS[fid]?.options?.find((x) => String(x.value).toUpperCase() === value.toUpperCase()
    || (value === "YES" && x.value === true) || (value === "NO" && x.value === false));
  return o ? o.label : value === "CONFLICTING" ? "Documents disagree" : value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}

function guidanceHtml(fid: string): string {
  const g = GUIDE[fid];
  if (!g) return "";
  const ex = g.examples.map((e) => `
    <li class="ex">
      <span class="ans">${esc(optionLabel(fid, e.answer))}</span>
      <span>${esc(e.text)}</span>
      <span class="src src-${e.kind.toLowerCase()}">${esc(SOURCE_LABEL[e.kind])}${e.item ? " · " + esc(e.item) : ""}${e.case ? " · case " + esc(e.case) : ""}${e.category ? " · " + esc(e.category) : ""}</span>
      ${e.quote ? `<details><summary>Exact wording</summary><blockquote>${esc(e.quote)}</blockquote></details>` : ""}
    </li>`).join("");
  const la = g.lookalikes.length ? `
    <h3>Words that mislead</h3>
    <ul class="look">${g.lookalikes.map((l) => `<li><strong>"${esc(l.term)}"</strong>: ${esc(l.text)}</li>`).join("")}</ul>` : "";
  const exHtml = g.examples.length ? `
      <h3>Examples</h3>
      <p class="muted small">These illustrate the question. Answer about your product, not about which example looks closest.</p>
      <ul class="examples">${ex}</ul>` : "";
  const note = g.note ? `<p class="note">${esc(g.note)}</p>` : "";
  if (!exHtml && !la && !note) return "";
  return `
    <aside class="guide" aria-label="Guidance">${note}${exHtml}${la}
    </aside>`;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function questionHtml(phase: Phase, fid: string): string {
  const q = QUESTIONS[fid];
  const prev = state.remembered[fid];
  const checked = (v: unknown) => (Array.isArray(prev) ? prev.some((p) => same(p, v)) : prev !== undefined && same(prev, v)) ? " checked" : "";
  const g = GUIDE[fid];
  const hint = q.hint ?? g?.hint;
  let control = "";
  if (q.kind === "multi-enum") {
    const box = (o: Option, i: number) => o.info?.length
      ? `<div class="opt-row"><label class="opt"><input type="checkbox" name="a" value="${i}"${checked(o.value)}> <span>${esc(o.label)}</span></label>
          <button type="button" class="info-btn" aria-expanded="false" aria-controls="info-${i}" title="What the regulation says about this">ⓘ<span class="sr-only"> What the regulation says about this</span></button></div>
          ${optionInfoHtml(o.info, `info-${i}`, o.faq_examples)}`
      : `<label class="opt"><input type="checkbox" name="a" value="${i}"${checked(o.value)}> <span>${esc(o.label)}</span></label>`;
    const opts = q.options ?? [];
    const stem = (q.stem_note ? `<p class="stem-note">${esc(q.stem_note)}</p>` : "") + (q.stem ? `<div class="stem"><p class="stem-text">${esc(q.stem)}</p>${q.stem_warning ? `<p class="stem-warning">${esc(q.stem_warning)}</p>` : ""}</div>` : "");
    if (opts.some((o) => o.group)) {
      // Grouped, and every group open: an unticked option counts as "no", so each must be seen.
      const groups = [...new Set(opts.map((o) => o.group!))];
      control = stem + groups.map((g) => `<div class="group"><p class="group-name">${esc(g)}</p>${
        opts.map((o, i) => (o.group === g ? box(o, i) : "")).join("")}</div>`).join("");
    } else {
      control = stem + opts.map(box).join("");
    }
    control += `<p class="muted small">Tick all that apply. Tick nothing only if none does: that gives the default class, which still carries all CRA requirements. If you are unsure, tick Not sure and you will be asked about each category.</p>`;
  } else if (q.kind === "date") {
    const dateVal = typeof prev === "string" && /^\d{4}-\d{2}-\d{2}$/.test(prev) ? prev : "";
    control = `<label class="opt"><span>Date</span> <input type="date" name="d" value="${esc(dateVal)}"></label>`
      + (q.options ?? []).map((o, i) => `<label class="opt"><input type="radio" name="a" value="${i}"${dateVal ? "" : checked(o.value)}> <span>${esc(o.label)}</span></label>`).join("");
  } else if (q.kind === "text") {
    control = `<textarea name="t" rows="3">${esc(typeof prev === "string" ? prev : "")}</textarea>`;
  } else {
    control = (q.options ?? []).map((o, i) => `
      <label class="opt"><input type="radio" name="a" value="${i}" required${checked(o.value)}> <span>${esc(o.label)}</span></label>`).join("");
  }
  return `
    <form id="q" class="question">
      <p class="phase">${esc(PHASE_LABEL[phase])}</p>
      <fieldset>
        <legend><h2>${esc(q.question)}</h2></legend>
        ${hint ? `<p class="hint">${esc(hint)}</p>` : ""}
        <div class="opts">${control}</div>
      </fieldset>
      <details class="why"><summary>Why we ask</summary>
        <p>${esc(q.why_we_ask)}</p>
        ${q.legal_basis?.length ? `<details class="legal"><summary>Legal basis</summary>${q.legal_basis.map(lawHtml).join("")}
          <p class="muted small">Highlighted: the words that decide this question.</p></details>` : ""}
      </details>
      ${q.kind === "multi-enum" ? `<p id="selection" class="selection" aria-live="polite"></p>` : ""}
      <div class="nav">
        ${state.history.length ? `<button type="button" id="back" class="secondary">Back</button>` : ""}
        <button type="submit">Next</button>
      </div>
    </form>
    ${guidanceHtml(fid)}`;
}

function readAnswer(form: HTMLFormElement, fid: string): { ok: boolean; value?: unknown } {
  const q = QUESTIONS[fid];
  const fd = new FormData(form);
  if (q.kind === "multi-enum") return { ok: true, value: fd.getAll("a").map((i) => q.options![Number(i)].value) };
  if (q.kind === "text") return { ok: true, value: fd.get("t") };
  if (q.kind === "date") {
    const picked = fd.get("a"), d = String(fd.get("d") ?? "");
    if (picked !== null) return { ok: true, value: q.options![Number(picked)].value };
    return d ? { ok: true, value: d } : { ok: false };
  }
  const i = fd.get("a");
  return i === null ? { ok: false } : { ok: true, value: q.options![Number(i)].value };
}

function startHtml(): string {
  const opt = (mode: Mode, title: string, text: string) =>
    `<button type="button" class="choice" data-mode="${mode}"><strong>${esc(title)}</strong><span>${esc(text)}</span></button>`;
  return `<section class="start">
    <h2>What do you want to know?</h2>
    <div class="choices">
      ${opt("scope", "Does the CRA apply to my product?", "About six questions: what you supply, to whom, and whether it connects to anything. The result also shows when the requirements apply, and you can continue to the class.")}
      ${opt("class", "Class only", "Which class is my product? For when you already know the CRA applies. The result is stated as \u201cif the CRA applies\u201d.")}
    </div>
    <p class="muted small">You can continue a partial check later without answering again.</p>
    ${state.history.length ? `<div class="nav"><button type="button" id="start-again" class="secondary">Start again (clear my answers)</button></div>` : ""}
  </section>`;
}

// ------------------------------------------------------------------ result

function assemble() {
  const s = scope(SCOPE, state.facts);
  const res = classify(RULES, state.facts);
  const t = timeline(TIMELINE, state.tfacts);
  const vu = validUntil(RULES.law_as_of);
  const warnings = validityWarnings({ assessedAt: today, validUntil: vu, lawAsOf: RULES.law_as_of, lawStatus,
    citedSources: Object.keys(RULES.sources), rules: RULES.categories.map((c) => c.rule_id) });
  const mode = state.mode ?? "full";
  const scopeOut = mode === "class" ? { status: "UNRESOLVED", reasons: ["Not assessed: the user chose a classification-only check."] } : s;
  // No placing date is asked: what depends on it is worked out for each placing period.
  const byPeriod: PlacingRow[] = placingPeriods(RULES, TIMELINE, state.facts, state.tfacts).map((p) => {
    const o = placingOutcome(RULES, TIMELINE, state.facts, state.tfacts, p.value);
    return { period: p.label, from: p.from, before: p.before, conformity_routes: o.routes,
             timeline: o.timeline.filter((i) => BY_PLACING.has(i.obligation)) };
  });
  const routesVary = placingColumns(byPeriod).routes;
  // Dates need no answers, so they come with every in-scope result, the scope check included.
  const showTimeline = mode !== "class" && s.status === "IN_SCOPE";
  const out = toOutput(RULES, state.facts, res, routesVary ? route(RULES, state.facts, res) : byPeriod[0].conformity_routes as ReturnType<typeof route>, {
    assessmentId: `cra-${today}`, assessedAt: today, validUntil: vu, validityWarnings: warnings,
    scope: scopeOut, timeline: showTimeline ? t.timeline.filter((i) => !BY_PLACING.has(i.obligation)) : [],
  });
  // Class only: no scope or timeline questions were asked, but the CRA requirements per placing period
  // need no answers, so they are shown too (stated under "if the CRA applies").
  const periods = showTimeline ? byPeriod
    : mode === "class" ? byPeriod.map((r) => ({ ...r, timeline: r.timeline.filter((i) => i.obligation === "CRA_ESSENTIAL_REQUIREMENTS") }))
    : [];
  // v4 5.2: without a settled scope there is no definitive class, only the floor (schema AC-02 rule).
  if (scopeOut.status !== "IN_SCOPE" && out.classification.status !== "UNRESOLVED") out.classification.status = "UNRESOLVED";
  return { out: { ...out, disclaimer_version: CONFIG.disclaimerVersion, check: mode, for_your_records: state.record, timeline_facts: state.tfacts,
    ...(periods.length ? { timeline_by_placing_period: periods } : {}) }, s, res, periods, routesVary };
}

function resultHtml(): string {
  const { out, s, res, periods } = assemble();
  const c = out.classification;
  const mode = state.mode ?? "full";
  const warn = out.validity_warnings.map((w) => `<div class="box warn" role="alert"><strong>${w.kind === "PAST_END_DATE" ? "Outdated" : "Law changed"}:</strong> ${esc(w.detail)}</div>`).join("");
  let body = warn + (mode === "class" ? ""
    : `<section class="box"><h2>Scope</h2><p class="verdict">${esc(scopeVerdict(s.status))}</p>
      <ul>${scopeReasonsPlain(SCOPE, state.facts, s.status).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      ${s.status === "OUT_OF_SCOPE" && state.facts.COMMERCIAL_ACTIVITY?.value === false
        ? `<p class="note">${esc(STEWARD_NOTE)}</p>` : ""}
      ${mode === "scope" && s.status === "IN_SCOPE" ? `<div class="nav"><button type="button" id="to-class">Continue: which class?</button></div>` : ""}</section>`);
  let ruledOut = "";
  if ((mode === "full" && s.status === "IN_SCOPE") || mode === "class") {
    const cat = (id: string) => `${esc(CATEGORIES[id]?.title ?? id)} <span class="muted">(${esc(id)})</span>`;
    const status = classVerdict(c, mode);
    const blockingCov = c.blocking.filter((b) => b.value === "NOT_COVERED").length;
    const blockingOther = c.blocking.filter((b) => b.value !== "NOT_COVERED");
    const reasonText: Record<string, string> = {
      MISSING_FACTS: "An answer is missing for", CONFLICTING_FACTS: "Your answers conflict for", LAW_OPEN: "The law does not settle",
    };
    body += `
    <section class="box"><h2>Class</h2>
      ${mode === "class" ? `<p class="scope-line">Scope not checked: this assumes the CRA applies to your product.
        <button type="button" id="to-full" class="link-btn">Check whether it applies</button></p>` : ""}
      <p class="verdict">${esc(status)}</p>
      ${c.matched.length ? `<h3>Matches</h3><ul>${c.matched.map((m) => `<li>${cat(m.category)}: ${esc(CLASS_LABEL[m.class])}</li>`).join("")}</ul>` : ""}
      ${blockingOther.length ? `<h3>Still open</h3><ul>${out.reasons.filter((r) => r.category && r.kind in reasonText).map((r) =>
        `<li>${esc(reasonText[r.kind])} ${cat(r.category!)}${r.kind === "LAW_OPEN" ? ". Get expert advice: more answers will not resolve this." : ""}</li>`).join("")}</ul>` : ""}
      ${blockingCov ? `<p class="note">This version has rules for ${RULES.categories.length} of 26 categories. Until all 26 are covered,
        it does not state a class it cannot fully check${c.class_floor === "CRITICAL" ? "" : ", including Default"}.</p>` : ""}
      ${c.excluded.length ? `<p class="muted small">Which categories were ruled out, and why: see the end of this page.</p>` : ""}
    </section>`;
    ruledOut = c.excluded.length ? `
    <details class="box ruled-out"><summary><h2>Ruled out, and why (${c.excluded.length} ${c.excluded.length === 1 ? "category" : "categories"})</h2></summary><ul>${c.excluded.map((x) => {
        const viaScreen = x.failing.some((f) => f.fact && f.fact in res.derived);
        return `<li>${cat(x.category)}: does not meet ${x.failing.map((f) => `<q>${esc(f.quote)}</q>`).join(" or ")}${viaScreen
          ? ` <span class="muted small">(you indicated the product is not mainly for this; go back to change that)</span>` : ""}</li>`;
      }).join("")}</ul></details>` : "";
  }
  {
    const pc = placingColumns(periods);
    if (periods.length && (pc.obligations.length || pc.routes)) {
      body += `
      <section class="box"><h2>When the requirements apply${mode === "class" ? " (if the CRA applies)" : ""}</h2>
        <p class="muted small">Each unit counts on its own: what matters is when that unit is placed on the market, not when the model was launched.</p>
        <table><thead><tr><th>Units placed</th>${pc.obligations.map((o) => `<th>${esc(PLACING_COLUMN[o])}</th>`).join("")}${pc.routes ? "<th>Conformity route</th>" : ""}</tr></thead><tbody>
        ${periods.map((r) => `<tr><td>${esc(r.period)}</td>${pc.obligations.map((o) => `<td>${esc(placingCell(r.timeline.find((i) => i.obligation === o) as never))}</td>`).join("")}${
          pc.routes ? `<td>${esc(routesText(r.conformity_routes))}</td>` : ""}</tr>`).join("")}
        </tbody></table>
        ${pc.obligations.map((o) => lawDetails(o, `The law and the Commission FAQ: ${PLACING_COLUMN[o]}`)).join("")}</section>`;
    }
    if (out.timeline.length) {
      const tlLabel: Record<string, string> = { APPLIES: "Applies", NOT_YET: "Not yet", TRANSITION: "Transition", NOT_APPLICABLE: "Does not apply", UNRESOLVED: "Not determined" };
      body += `
      <section class="box"><h2>Other obligations</h2><table><thead><tr><th>Obligation</th><th>Status</th><th>Basis</th></tr></thead><tbody>
        ${out.timeline.map((i) => `<tr><td>${esc(i.obligation.replace(/_/g, " ").toLowerCase())}<br>${lawDetails(i.obligation, i.provision)}</td>
          <td>${esc(tlLabel[i.status])}${i.applies_from ? `<br><span class="muted small">from ${esc(i.applies_from)}</span>` : ""}</td>
          <td>${esc(i.basis)}${i.open_questions ? `<br><span class="muted small">${esc(i.open_questions.join(" "))}</span>` : ""}</td></tr>`).join("")}
      </tbody></table></section>`;
    }
    // Pointers only: laws this tool does not check. Collapsed; the title names them.
    if (periods.length || out.timeline.length || mode === "class") body += `
      <details class="box other-laws"><summary><h2>Other EU laws that may apply</h2>
        <span class="muted small">radio equipment rules (since 1 August 2025), AI Act, European Health Data Space</span></summary>
        <h3>Radio equipment rules</h3><p>${strong(RED_NOTE)}</p>
        <h3>AI Act and European Health Data Space</h3><p>${strong(ROUTE_NOTE)}</p>
        ${lawDetails("CONFORMITY_ROUTES", "The law: CRA Art. 12(2), 12(3) and 32(5a)")}</details>`;
    body += ruledOut;
  }
  body += `
    <section class="box"><p>Rules reflect the law as of <strong>${esc(out.law_as_of)}</strong>; this version is valid until ${esc(out.valid_until)}
      (twelve months from release; the CRA's main requirements apply from 11 December 2027, so check for a newer version by then).
      ${lawStatus ? `Last checked against EUR-Lex on ${esc(lawStatus.checked_at)}.` : ""}</p>
      <p class="muted small">${esc(CONFIG.disclaimer)}</p>
      <fieldset class="records"><legend><h3>For your records (optional)</h3></legend>
        <p class="muted small">Added to the download only. It plays no part in the assessment, and nothing leaves your browser.</p>
        <label>Product name <input type="text" id="rec-product" value="${esc(state.record.product)}"></label>
        <label>Description <textarea id="rec-description" rows="2">${esc(state.record.description)}</textarea></label>
      </fieldset>
      <div class="nav"><button type="button" id="back" class="secondary">Back</button>
      <span class="save">
        <button type="button" id="save">Save</button>
        <label class="sr-only" for="save-format">Format</label>
        <select id="save-format" aria-label="Format">
          <option value="json">JSON (data)</option>
          <option value="md">Markdown (report)</option>
          <option value="pdf" selected>PDF (report)</option>
        </select>
      </span>
      <button type="button" id="restart" class="secondary">Start again</button></div></section>`;
  return body;
}

function readRecord() {
  state.record.product = (document.getElementById("rec-product") as HTMLInputElement | null)?.value ?? state.record.product;
  state.record.description = (document.getElementById("rec-description") as HTMLTextAreaElement | null)?.value ?? state.record.description;
}

/** Save as PDF: print the report (not the screen) with the browser's own PDF output. */
function printReport() {
  readRecord();
  const { out, res } = assemble();
  const md = reportMarkdown(out, { categories: CATEGORIES, questions: QUESTIONS, derived: res.derived, disclaimer: CONFIG.disclaimer, scopeReasons: scopeReasonsPlain(SCOPE, state.facts, scope(SCOPE, state.facts).status) });
  let root = document.getElementById("print-root");
  if (!root) { root = Object.assign(document.createElement("div"), { id: "print-root" }); document.body.appendChild(root); }
  root.innerHTML = markdownToHtml(md);
  const title = document.title;
  document.title = state.record.product.trim() || `CRA assessment ${today}`;  // default PDF file name
  window.addEventListener("afterprint", () => { document.title = title; }, { once: true });
  window.print();
}

function download(format: "md" | "json") {
  state.record.product = (document.getElementById("rec-product") as HTMLInputElement | null)?.value ?? state.record.product;
  state.record.description = (document.getElementById("rec-description") as HTMLTextAreaElement | null)?.value ?? state.record.description;
  const { out, res } = assemble();
  const body = format === "json" ? JSON.stringify(out, null, 1)
    : reportMarkdown(out, { categories: CATEGORIES, questions: QUESTIONS, derived: res.derived, disclaimer: CONFIG.disclaimer, scopeReasons: scopeReasonsPlain(SCOPE, state.facts, scope(SCOPE, state.facts).status) });
  const blob = new Blob([body], { type: format === "json" ? "application/json" : "text/markdown" });
  const name = (state.record.product.trim().replace(/[^\w-]+/g, "-").slice(0, 40) || out.assessment_id) + (format === "json" ? ".json" : ".md");
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
  a.click();
  URL.revokeObjectURL(a.href);
}

// ------------------------------------------------------------------ main loop

/** Events already counted for the current check, so a re-render does not count twice. */
let counted = new Set<string>();
function countOnce(name: string) { if (!counted.has(name)) { counted.add(name); count(name); } }
function restart() { state = fresh(); counted = new Set(); render(); }

function render() {
  if (showAbout) {
    countOnce("about");
    app.innerHTML = aboutHtml({ lawAsOf: RULES.law_as_of, ruleSet: RULES.rule_set_version, sources: RULES.sources, lastCheck: lawStatus?.checked_at });
    document.getElementById("about-close")?.addEventListener("click", () => { showAbout = false; render(); });
    window.scrollTo(0, 0);
    return;
  }
  const cur = current();
  const n = RULES.categories.length;
  const header = `<p class="muted pilot">${n < 26 ? `Pilot. Rules for ${n} of 26 categories. ` : "Preview: rules not yet independently reviewed. "}Informational only; not legal advice.</p>`;
  if (cur.phase === "start") {
    app.innerHTML = header + startHtml();
    app.querySelectorAll<HTMLButtonElement>("button.choice").forEach((b) =>
      b.addEventListener("click", () => { state.mode = b.dataset.mode as Mode; countOnce(`start-${state.mode}`); render(); }));
    document.getElementById("start-again")?.addEventListener("click", restart);
  } else if (cur.phase === "result") {
    countOnce(`result-${state.mode}`);
    app.innerHTML = header + resultHtml();
    document.getElementById("to-class")?.addEventListener("click", () => { state.mode = "full"; render(); });
    document.getElementById("to-full")?.addEventListener("click", () => { state.mode = "full"; render(); });
    const fmt = document.getElementById("save-format") as HTMLSelectElement | null;
    if (fmt) fmt.value = "pdf";  // default, set explicitly
    document.getElementById("save")?.addEventListener("click", () => {
      const f = (document.getElementById("save-format") as HTMLSelectElement).value;
      countOnce(`save-${f}`);
      if (f === "pdf") printReport(); else download(f as "md" | "json");
    });
    document.getElementById("restart")?.addEventListener("click", restart);
  } else {
    app.innerHTML = header + `<div class="layout">${questionHtml(cur.phase, cur.fid!)}</div>`;
    const form = document.getElementById("q") as HTMLFormElement;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const a = readAnswer(form, cur.fid!);
      if (a.ok) answer(cur.fid!, cur.phase, a.value);
    });
    form.querySelectorAll<HTMLButtonElement>("button.info-btn").forEach((b) => b.addEventListener("click", () => {
      const panel = document.getElementById(b.getAttribute("aria-controls")!)!;
      const open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    }));
    // Tick boxes: repeat the selection next to Next, so a long list need not be scrolled back.
    const sel = document.getElementById("selection");
    if (sel) {
      const show = () => {
        const picked = [...form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')]
          .map((i) => i.closest("label")?.querySelector("span")?.textContent ?? "");
        sel.innerHTML = picked.length
          ? `<strong>Selected (${picked.length}):</strong> ${picked.map(esc).join("; ")}`
          : `<strong>Nothing selected:</strong> none of these applies.`;
      };
      form.addEventListener("change", show);
      show();
    }
    form.querySelector<HTMLElement>("input, textarea")?.focus();
  }
  document.getElementById("back")?.addEventListener("click", back);
  window.scrollTo(0, 0);
}

initTheme();
count(location.pathname, false);
// Home: back to the start screen, keeping the answers so a check can be continued.
for (const id of ["home", "home-btn"]) document.getElementById(id)?.addEventListener("click", () => { showAbout = false; state.mode = undefined; render(); });
document.getElementById("about-btn")?.addEventListener("click", () => { showAbout = true; render(); });
(async () => {
  try {
    const r = await fetch("./law-status.json", { cache: "no-store" });
    lawStatus = r.ok ? await r.json() : null;
  } catch { lawStatus = null; }
  render();
})();

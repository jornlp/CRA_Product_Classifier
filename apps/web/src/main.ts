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
import { classify, route, toOutput, scope, timeline, validityWarnings, placingPeriods, placingOutcome, longDate } from "../../../packages/engine/src/index.js";
import { nextStep, record, unrecord } from "./flow.js";
import type { Phase, Mode } from "./flow.js";
import type { ClassificationRules, ScopeRules, TimelineRules, Facts, LawStatus } from "../../../packages/engine/src/index.js";
import { CONFIG, validUntil } from "./config.js";
import { initTheme } from "./theme.js";
import { reportMarkdown, markdownToHtml, CLASS, scopeVerdict, classVerdict, floorText, RED_NOTE, ROUTE_NOTE, STEWARD_NOTE, BY_PLACING, obligationTable } from "./report.js";
import type { PlacingRow } from "./report.js";
import { aboutHtml } from "./about.js";
import { scopeReasonsPlain, classOpenPlain } from "./explain.js";
import { count, countingPossible, getConsent, setConsent } from "./analytics.js";

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
type LawLine = { label: string; level: number; parts: { text: string; mark?: boolean; key?: boolean }[] };
type Legal = { ref: string; quote?: string; text?: { act: string; heading: string; lines: LawLine[] } | null };

/** A provision laid out as law: act, centred article heading, numbered lines, decisive words marked. */
function lawHtml(l: Legal): string {
  if (!l.text) return `<p class="law-cite"><strong>${esc(l.ref)}</strong> <span class="muted">(citation only; this tool does not hold the text)</span></p>`;
  const [num, ...title] = l.text.heading.split(": ");
  return `<article class="law">
    <p class="law-act">${esc(l.text.act)}</p>
    ${l.text.heading ? `<p class="law-num">${esc(num)}</p>${title.length ? `<p class="law-title">${esc(title.join(": "))}</p>` : ""}` : ""}
    ${l.text.lines.map((ln) => `<p class="law-line lvl${ln.level}"><span class="law-label">${esc(ln.label)}</span><span>${
      ln.parts.map((p) => (p.key ? `<mark class="key">${esc(p.text)}</mark>` : p.mark ? `<mark>${esc(p.text)}</mark>` : esc(p.text))).join("")}</span></p>`).join("")}
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

const CLASS_LABEL = CLASS;
const SOURCE_LABEL: Record<string, string> = {
  OFFICIAL_TEXT: "Official text (binding)", OFFICIAL_RECITAL: "CRA recital (explains the law, not binding)",
  OFFICIAL_GUIDANCE: "Commission FAQ v14 (non-binding)",
};

// ------------------------------------------------------------------ state

interface State {
  facts: Facts; tfacts: Record<string, unknown>; history: { phase: Phase; fid: string }[]; done: Set<string>; mode?: Mode;
  /** For the user's own records only; never used in the assessment. */
  record: { product: string; description: string };
  /** Last answer given to each question, so going back (or starting a check again) shows it again. */
  remembered: Record<string, unknown>;
  /** The check left via Home, so it can be resumed from the start screen. */
  lastMode?: Mode;
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
  timeline: "When do obligations apply?", result: "Result",
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
  // An earlier empty list was answered with "None of these", so show that again when going back.
  const checked = (v: unknown) => (Array.isArray(prev) ? (v === "NONE" ? prev.length === 0 : prev.some((p) => same(p, v)))
    : prev !== undefined && same(prev, v)) ? " checked" : "";
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
    control += `<p class="muted small">Tick all that apply. If none does, tick None of these: that gives the default class, which still carries all CRA requirements. If you are unsure, tick Not sure and you will be asked about each category.</p>`;
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
        <p class="why clamp" id="why"><span class="why-label">Why we ask:</span> ${esc(q.why_we_ask)}</p>
        <button type="button" class="link-btn why-more" id="why-more" aria-controls="why" aria-expanded="false" hidden>more</button>
        ${q.legal_basis?.length ? `<details class="legal why-legal"><summary>Legal basis</summary>${q.legal_basis.map(lawHtml).join("")}
          <p class="muted small">Highlighted: the words that decide this question.</p></details>` : ""}
        ${hint ? `<p class="hint">${esc(hint)}</p>` : ""}
        <div class="opts">${control}</div>
      </fieldset>
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
  if (q.kind === "multi-enum") {
    const v = fd.getAll("a").map((i) => q.options![Number(i)].value);
    // A list with an explicit "None of these" needs an active answer: an empty list is not taken as "none".
    if (!v.length && q.options!.some((o) => o.value === "NONE")) return { ok: false };
    return { ok: true, value: v.filter((x) => x !== "NONE") };
  }
  if (q.kind === "text") return { ok: true, value: fd.get("t") };
  const i = fd.get("a");
  return i === null ? { ok: false } : { ok: true, value: q.options![Number(i)].value };
}

const TONE: Record<string, string> = { DEFAULT: "default", IMPORTANT_I: "imp1", IMPORTANT_II: "imp2", CRITICAL: "critical", UNRESOLVED: "open" };
/** The verdict as a prominent card: a small lead-in, the result in large type, and an optional line below. */
/** Under the first verdict card, so a screenshot of the verdict carries it too. */
const NOTICE_LINE = `<p class="notice-line">Informational result, not legal advice. See the disclaimer at the end.</p>`;

function verdictCard(kickerHtml: string, main: string, sub: string, tone: string): string {
  return `<div class="verdict-card tone-${tone}"><p class="verdict-kicker">${kickerHtml}</p>
    <p class="verdict">${esc(main)}</p>${sub ? `<p class="verdict-sub">${esc(sub)}</p>` : ""}</div>`;
}

const MODE_NAME: Record<string, string> = { scope: "Does the CRA apply?", class: "Class only", full: "Does the CRA apply, and which class?" };

function startHtml(): string {
  const opt = (mode: Mode, title: string, text: string) =>
    `<button type="button" class="choice" data-mode="${mode}"><strong>${esc(title)}</strong><span>${esc(text)}</span></button>`;
  const prev = state.history.length && state.lastMode ? state.lastMode : undefined;
  const done = prev ? nextStep(RULESET, { ...state, mode: prev }).phase === "result" : false;
  return `<section class="start">
    ${prev ? `<section class="box resume"><h2>Your previous check</h2>
      <p>${esc(MODE_NAME[prev] ?? prev)}: ${done ? "the result is ready." : `${state.history.length} question${state.history.length === 1 ? "" : "s"} answered so far.`}</p>
      <div class="nav"><button type="button" id="resume">${done ? "Show the result" : "Continue where you left off"}</button>
        <button type="button" id="start-again" class="secondary">Start again (clear my answers)</button></div></section>` : ""}
    <p class="notice">This tool gives information, not legal advice. The result depends on your answers and on how the rules
      read the law; for decisions, consult a qualified adviser.</p>
    <h2>${prev ? "Or start a check" : "What do you want to know?"}</h2>
    <div class="choices">
      ${opt("scope", "Does the CRA apply to my product?", "About six questions: what you supply, to whom, and whether it connects to anything. The result also shows when the requirements apply, and you can continue to the class.")}
      ${opt("class", "Class only", "Which class is my product? For when you already know the CRA applies. The result is stated as \u201cif the CRA applies\u201d.")}
    </div>
    <p class="muted small">${state.history.length
      ? "A check starts at the first question, with your earlier answers filled in: press Next to keep an answer, or change it."
      : "You can leave a check with Home and continue it later without answering again."}</p>
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
  // Dates need no answers, so they come with every in-scope result, the scope check included.
  // Class only: no scope answers, but nothing here needs answers either, so it is shown "if the CRA applies".
  const showTimeline = mode === "class" || s.status === "IN_SCOPE";
  const out = toOutput(RULES, state.facts, res, route(RULES, state.facts, res), {
    assessmentId: `cra-${today}`, assessedAt: today, validUntil: vu, validityWarnings: warnings,
    scope: scopeOut, timeline: showTimeline ? t.timeline.filter((i) => !BY_PLACING.has(i.obligation)) : [],
  });
  // Class only: no scope or timeline questions were asked, but the CRA requirements per placing period
  // need no answers, so they are shown too (stated under "if the CRA applies").
  const periods = !showTimeline ? []
    : mode === "class" ? byPeriod.map((r) => ({ ...r, timeline: r.timeline.filter((i) => i.obligation === "CRA_ESSENTIAL_REQUIREMENTS") }))
    : byPeriod;
  // v4 5.2: without a settled scope there is no definitive class, only the floor (schema AC-02 rule).
  if (scopeOut.status !== "IN_SCOPE" && out.classification.status !== "UNRESOLVED") out.classification.status = "UNRESOLVED";
  return { out: { ...out, disclaimer_version: CONFIG.disclaimerVersion, disclaimer: CONFIG.disclaimer, check: mode, for_your_records: state.record, timeline_facts: state.tfacts,
    ...(periods.length ? { timeline_by_placing_period: periods } : {}) }, s, res, periods };
}

function resultHtml(): string {
  const { out, s, res, periods } = assemble();
  const c = out.classification;
  const mode = state.mode ?? "full";
  const warn = out.validity_warnings.map((w) => `<div class="box warn" role="alert"><strong>${({ PAST_END_DATE: "Outdated", LAW_CHANGED: "Law changed", LAW_CHECK_STALE: "Law check overdue" } as Record<string, string>)[w.kind]}:</strong> ${esc(w.detail)}</div>`).join("");
  let body = warn + (mode === "class" ? ""
    : `<section class="box"><h2>Scope</h2>${verdictCard("Based on your answers", ({ IN_SCOPE: "The CRA applies", OUT_OF_SCOPE: "The CRA does not apply", UNRESOLVED: "Not determined yet" } as Record<string, string>)[s.status],
        s.status === "UNRESOLVED" ? "See below for what is still open." : "", ({ IN_SCOPE: "in", OUT_OF_SCOPE: "out", UNRESOLVED: "open" } as Record<string, string>)[s.status])}${NOTICE_LINE}
      <ul>${scopeReasonsPlain(SCOPE, state.facts, s.status).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      ${s.status === "OUT_OF_SCOPE" && state.facts.COMMERCIAL_ACTIVITY?.value === false
        ? `<p class="note">${esc(STEWARD_NOTE)}</p>` : ""}
      ${mode === "scope" && s.status === "IN_SCOPE" ? `<div class="nav"><button type="button" id="to-class">Continue: which class?</button></div>` : ""}</section>`);
  let ruledOut = "";
  if ((mode === "full" && s.status === "IN_SCOPE") || mode === "class") {
    const cat = (id: string) => `${esc(CATEGORIES[id]?.title ?? id)} <span class="muted">(${esc(id)})</span>`;
    // Class only: stated "if the CRA applies", so the engine's class is shown (the JSON keeps UNRESOLVED, AC-02).
    const shown = mode === "class" ? res.status : c.status;
    const open = shown === "UNRESOLVED" ? classOpenPlain(RULES, res, state.facts, QUESTIONS, CATEGORIES) : [];
    const blockingCov = c.blocking.filter((b) => b.value === "NOT_COVERED").length;
    body += `
    <section class="box"><h2>Class</h2>
      ${verdictCard(mode === "class"
        ? `If the CRA applies <span class="nowrap">(<button type="button" id="to-full" class="link-btn">check whether it applies</button>)</span>, based on your answers, the class is`
        : "Based on your answers, the class is",
        shown === "UNRESOLVED" ? "Not determined yet" : CLASS_LABEL[shown],
        shown === "UNRESOLVED" ? `So far: ${floorText(c.class_floor)}.` : "", TONE[shown] ?? "open")}${mode === "class" ? NOTICE_LINE : ""}
      ${open.length ? `<h3>Why it is not determined</h3><ul class="why-open">${open.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <p class="muted small">Go back to change a "Not sure" answer, or get expert advice where the law is open.</p>` : ""}
      ${c.matched.length ? `<h3>Matches</h3><ul>${c.matched.map((m) => `<li>${cat(m.category)}: ${esc(CLASS_LABEL[m.class])}</li>`).join("")}</ul>` : ""}
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
    const tbl = obligationTable(periods, out.timeline);
    if (tbl.rows.length) {
      body += `
      <section class="box"><h2>When the obligations apply${mode === "class" ? " (if the CRA applies)" : ""}</h2>
        <p class="muted small">By when the units are placed on the market. Each unit counts on its own: what matters is when that unit is placed, not when the model was launched.</p>
        <table class="obligations"><thead><tr><th>Obligation</th>${tbl.columns.map((c) => `<th>Units placed ${esc(c.charAt(0).toLowerCase() + c.slice(1))}</th>`).join("")}</tr></thead><tbody>
        ${tbl.rows.map((r) => `<tr><td>${esc(r.label)}${lawDetails(r.obligation, "The law and the Commission FAQ")}</td>${
          r.cells.every((x) => x === r.cells[0]) && r.cells.length > 1
            ? `<td colspan="${r.cells.length}" data-label="Units placed at any time">${esc(r.cells[0])} <span class="muted small">(whenever placed)</span></td>`
            : r.cells.map((x, k) => `<td data-label="Units placed ${esc(tbl.columns[k].charAt(0).toLowerCase() + tbl.columns[k].slice(1))}">${esc(x)}</td>`).join("")}</tr>`).join("")}
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
    <section class="box save-box"><h2>Save this result</h2>
      <fieldset class="records"><legend>For your records (optional)</legend>
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
      <button type="button" id="restart" class="secondary">Start again</button></div></section>
    <section class="fineprint"><p>Rules reflect the law as of <strong>${esc(longDate(out.law_as_of))}</strong>; this version is valid until
      ${esc(longDate(out.valid_until))} (twelve months from release; the CRA's main requirements apply from 11 December 2027, so check
      for a newer version by then).${lawStatus ? ` Last checked against EUR-Lex on ${esc(longDate(lawStatus.checked_at))}.` : ""}</p>
      <p>${esc(CONFIG.disclaimer)}</p></section>`;
  return body;
}

/** For the report: the class if the CRA applies (class-only check), and why it is open, if it is. */
function classReportCtx(res: ReturnType<typeof classify>) {
  return { classIfApplies: res.status, classOpen: res.status === "UNRESOLVED" ? classOpenPlain(RULES, res, state.facts, QUESTIONS, CATEGORIES) : [] };
}

function readRecord() {
  state.record.product = (document.getElementById("rec-product") as HTMLInputElement | null)?.value ?? state.record.product;
  state.record.description = (document.getElementById("rec-description") as HTMLTextAreaElement | null)?.value ?? state.record.description;
}

/** Save as PDF: print the report (not the screen) with the browser's own PDF output. */
function printReport() {
  readRecord();
  const { out, res } = assemble();
  const md = reportMarkdown(out, { categories: CATEGORIES, questions: QUESTIONS, derived: res.derived, disclaimer: CONFIG.disclaimer, scopeReasons: scopeReasonsPlain(SCOPE, state.facts, scope(SCOPE, state.facts).status), ...classReportCtx(res) });
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
    : reportMarkdown(out, { categories: CATEGORIES, questions: QUESTIONS, derived: res.derived, disclaimer: CONFIG.disclaimer, scopeReasons: scopeReasonsPlain(SCOPE, state.facts, scope(SCOPE, state.facts).status), ...classReportCtx(res) });
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
    app.innerHTML = aboutHtml({ consent: countingPossible() ? getConsent() : undefined, lawAsOf: RULES.law_as_of, ruleSet: RULES.rule_set_version, sources: RULES.sources, lastCheck: lawStatus?.checked_at });
    document.getElementById("about-close")?.addEventListener("click", () => { showAbout = false; render(); });
    document.querySelectorAll<HTMLButtonElement>("button[data-set-consent]").forEach((b) => b.addEventListener("click", () => {
      setConsent(b.dataset.setConsent as "yes" | "no");
      if (b.dataset.setConsent === "yes") count(location.pathname, false);
      document.getElementById("consent-bar")?.remove();
      render();
    }));
    window.scrollTo(0, 0);
    return;
  }
  const cur = current();
  const n = RULES.categories.length;
  const header = `<p class="muted pilot">${n < 26 ? `Pilot. Rules for ${n} of 26 categories. ` : "Preview: rules not yet independently reviewed. "}Informational only; not legal advice.</p>`;
  if (cur.phase === "start") {
    app.innerHTML = header + startHtml();
    // A chosen check starts at its first question; earlier answers stay filled in (remembered), not applied.
    app.querySelectorAll<HTMLButtonElement>("button.choice").forEach((b) => b.addEventListener("click", () => {
      if (state.history.length) state = { ...fresh(), remembered: state.remembered, record: state.record };
      state.mode = b.dataset.mode as Mode; countOnce(`start-${state.mode}`); render();
    }));
    document.getElementById("resume")?.addEventListener("click", () => { state.mode = state.lastMode; render(); });
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
    app.innerHTML = header + `<div class="layout${GUIDE[cur.fid!] ? "" : " single"}">${questionHtml(cur.phase, cur.fid!)}</div>`;
    const form = document.getElementById("q") as HTMLFormElement;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const a = readAnswer(form, cur.fid!);
      if (a.ok) answer(cur.fid!, cur.phase, a.value);
      else if (QUESTIONS[cur.fid!].kind === "multi-enum") {
        const sel = document.getElementById("selection");
        if (sel) { sel.innerHTML = `<strong>Tick at least one option</strong>, or \u201cNone of these\u201d, or \u201cNot sure\u201d.`; sel.classList.add("selection-error"); }
      }
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
      // "None of these" excludes every other option, and ticking another option clears it.
      const noneIdx = (QUESTIONS[cur.fid!].options ?? []).findIndex((o) => o.value === "NONE");
      const hasNone = noneIdx >= 0;
      if (hasNone) form.addEventListener("change", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.type !== "checkbox" || !t.checked) return;
        for (const b of form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')) {
          if (b !== t && (Number(t.value) === noneIdx || Number(b.value) === noneIdx)) b.checked = false;
        }
      });
      const show = () => {
        const picked = [...form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')]
          .map((i) => i.closest("label")?.querySelector("span")?.textContent ?? "");
        sel.innerHTML = picked.length
          ? `<strong>Selected (${picked.length}):</strong> ${picked.map(esc).join("; ")}`
          : hasNone ? `<strong>Nothing selected yet.</strong>` : `<strong>Nothing selected:</strong> none of these applies.`;
        sel.classList.remove("selection-error");
      };
      form.addEventListener("change", show);
      show();
    }
    // "Why we ask": at most four lines, with "more" only when the text is actually cut off.
    const why = document.getElementById("why"), more = document.getElementById("why-more") as HTMLButtonElement | null;
    const clamped = why?.getBoundingClientRect().height ?? 0;
    why?.classList.remove("clamp");
    const full = why?.getBoundingClientRect().height ?? 0;
    why?.classList.add("clamp");
    if (why && more && full - clamped > 4) {
      more.hidden = false;
      more.addEventListener("click", () => {
        const open = why.classList.toggle("clamp") === false;
        more.textContent = open ? "less" : "more";
        more.setAttribute("aria-expanded", String(open));
      });
    }
    form.querySelector<HTMLElement>("input, textarea")?.focus();
  }
  document.getElementById("back")?.addEventListener("click", back);
  window.scrollTo(0, 0);
}

initTheme();
// Ask before counting: a small bar, not blocking, both answers equally easy; nothing is sent before "Yes".
function consentBar() {
  document.getElementById("consent-bar")?.remove();
  if (!countingPossible() || getConsent() !== null) return;
  const bar = Object.assign(document.createElement("div"), { id: "consent-bar", className: "consent-bar" });
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Counting visits");
  bar.innerHTML = `<p>May we count your visit anonymously, to see whether this tool is used? Your answers are never sent,
    and no cookies are used. You can change this later under About.</p>
    <div class="consent-buttons"><button type="button" class="secondary" data-consent="yes">Yes, count my visit</button>
    <button type="button" class="secondary" data-consent="no">No</button></div>`;
  bar.querySelectorAll<HTMLButtonElement>("button[data-consent]").forEach((b) => b.addEventListener("click", () => {
    setConsent(b.dataset.consent as "yes" | "no");
    if (b.dataset.consent === "yes") count(location.pathname, false);
    bar.remove();
    if (showAbout) render();
  }));
  document.body.appendChild(bar);
}
count(location.pathname, false);  // only if consent was given on an earlier visit
consentBar();
// Home: back to the start screen, keeping the answers so a check can be continued.
for (const id of ["home", "home-btn"]) document.getElementById(id)?.addEventListener("click", () => {
  showAbout = false;
  if (state.mode) state.lastMode = state.mode;
  state.mode = undefined;
  render();
});
document.getElementById("about-btn")?.addEventListener("click", () => { showAbout = true; render(); });
(async () => {
  try {
    const r = await fetch("./law-status.json", { cache: "no-store" });
    lawStatus = r.ok ? await r.json() : null;
  } catch { lawStatus = null; }
  render();
})();

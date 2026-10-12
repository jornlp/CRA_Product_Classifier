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
import { classify, route, toOutput, scope, timeline, validityWarnings } from "../../../packages/engine/src/index.js";
import { nextStep, record, unrecord } from "./flow.js";
import type { Phase } from "./flow.js";
import type { ClassificationRules, ScopeRules, TimelineRules, Facts, LawStatus } from "../../../packages/engine/src/index.js";
import { CONFIG, validUntil } from "./config.js";

const RULES = cls as unknown as ClassificationRules;
const SCOPE = sc as unknown as ScopeRules;
const TIMELINE = tl as unknown as TimelineRules;
type Option = { value: unknown; label: string };
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
type Question = { question: string; kind: string; why_we_ask: string; legal_basis?: Legal[]; hint?: string; options?: Option[]; evidence?: string };
const QUESTIONS = (qs as { questions: Record<string, Question> }).questions;
const CATEGORIES = (qs as { categories: Record<string, { title: string; class: string }> }).categories;
type Example = { answer: string; kind: string; source: string; text: string; quote?: string; item?: string; category?: string; case?: string };
type Guide = { hint?: string; examples: Example[]; lookalikes: { term: string; text: string; case?: string }[] };
const GUIDE = (guidance as { questions: Record<string, Guide> }).questions;

const CLASS_LABEL: Record<string, string> = {
  DEFAULT: "Default", IMPORTANT_I: "Important, Class I", IMPORTANT_II: "Important, Class II", CRITICAL: "Critical", UNRESOLVED: "Not determined",
};
const SOURCE_LABEL: Record<string, string> = {
  OFFICIAL_TEXT: "Official text (binding)", OFFICIAL_RECITAL: "CRA recital (explains the law, not binding)",
  OFFICIAL_GUIDANCE: "Commission FAQ v14 (non-binding)", WORKED_CASE: "Worked example (our interpretation)",
};

// ------------------------------------------------------------------ state

interface State { facts: Facts; tfacts: Record<string, unknown>; core: string; history: { phase: Phase; fid: string }[]; done: Set<string> }
const today = new Date().toISOString().slice(0, 10);
let state: State = fresh();
let lawStatus: LawStatus | null = null;
const RULESET = { scope: SCOPE, classification: RULES, timeline: TIMELINE };

function fresh(): State {
  return { facts: {}, tfacts: { ASSESSMENT_DATE: today }, core: "", history: [], done: new Set() };
}
const current = () => nextStep(RULESET, state);

function answer(fid: string, phase: Phase, value: unknown) {
  state.history.push({ phase, fid });
  if (phase === "core") state.core = String(value ?? "");
  record(state, phase, fid, value);
  render();
}

function back() {
  const last = state.history.pop();
  if (!last) return;
  if (last.phase === "core") state.core = "";
  unrecord(state, last.phase, last.fid);
  render();
}

// ------------------------------------------------------------------ rendering helpers

const app = document.getElementById("app")!;
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const PHASE_LABEL: Record<Phase, string> = {
  scope: "1 · Does the CRA apply?", core: "2 · What is the product for?", class: "3 · Which class?",
  routes: "4 · Overlaps with other laws", timeline: "5 · When do obligations apply?", result: "Result",
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
  return `
    <aside class="guide" aria-label="Examples">
      <h3>Examples</h3>
      <p class="muted small">These illustrate the question. Answer about your product, not about which example looks closest.</p>
      <ul class="examples">${ex}</ul>${la}
    </aside>`;
}

function questionHtml(phase: Phase, fid: string): string {
  const q = QUESTIONS[fid];
  const g = GUIDE[fid];
  const hint = q.hint ?? g?.hint;
  let control = "";
  if (q.kind === "multi-enum") {
    control = (q.options ?? []).map((o, i) => `
      <label class="opt"><input type="checkbox" name="a" value="${i}"> <span>${esc(o.label)}</span></label>`).join("")
      + `<p class="muted small">Tick nothing if none of these applies.</p>`;
  } else if (q.kind === "date") {
    control = `<label class="opt"><span>Date</span> <input type="date" name="d"></label>`
      + (q.options ?? []).map((o, i) => `<label class="opt"><input type="radio" name="a" value="${i}"> <span>${esc(o.label)}</span></label>`).join("");
  } else if (q.kind === "text") {
    control = `<textarea name="t" rows="3" placeholder="For example: a camera that detects when a rodent is caught and sends an alert to the pest controller"></textarea>
      <p class="muted small">Optional, recorded in the export. The next questions test what your answer here means.</p>`;
  } else {
    control = (q.options ?? []).map((o, i) => `
      <label class="opt"><input type="radio" name="a" value="${i}" required> <span>${esc(o.label)}</span></label>`).join("");
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

// ------------------------------------------------------------------ result

function assemble() {
  const s = scope(SCOPE, state.facts);
  const res = classify(RULES, state.facts);
  const t = timeline(TIMELINE, state.tfacts);
  const vu = validUntil(RULES.law_as_of);
  const warnings = validityWarnings({ assessedAt: today, validUntil: vu, lawAsOf: RULES.law_as_of, lawStatus,
    citedSources: Object.keys(RULES.sources), rules: RULES.categories.map((c) => c.rule_id) });
  const out = toOutput(RULES, state.facts, res, route(RULES, state.facts, res), {
    assessmentId: `cra-${today}`, assessedAt: today, validUntil: vu, validityWarnings: warnings,
    scope: s, timeline: s.status === "IN_SCOPE" ? t.timeline : [],
  });
  return { out: { ...out, core_function: state.core, timeline_facts: state.tfacts }, s, res };
}

function resultHtml(): string {
  const { out, s, res } = assemble();
  const c = out.classification;
  const warn = out.validity_warnings.map((w) => `<div class="box warn" role="alert"><strong>${w.kind === "PAST_END_DATE" ? "Outdated" : "Law changed"}:</strong> ${esc(w.detail)}</div>`).join("");
  const scopeText: Record<string, string> = {
    IN_SCOPE: "The CRA applies to this product.", OUT_OF_SCOPE: "The CRA does not apply to this product.",
    UNRESOLVED: "Whether the CRA applies is not determined yet.",
  };
  let body = `
    ${warn}
    <section class="box"><h2>Scope</h2><p class="verdict">${esc(scopeText[s.status])}</p>
      <ul>${s.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></section>`;
  if (s.status === "IN_SCOPE") {
    const cat = (id: string) => `${esc(CATEGORIES[id]?.title ?? id)} <span class="muted">(${esc(id)})</span>`;
    const status = c.status === "UNRESOLVED" ? `Not determined. At least: ${CLASS_LABEL[c.class_floor]}` : CLASS_LABEL[c.status];
    const blockingCov = c.blocking.filter((b) => b.value === "NOT_COVERED").length;
    const blockingOther = c.blocking.filter((b) => b.value !== "NOT_COVERED");
    const reasonText: Record<string, string> = {
      MISSING_FACTS: "An answer is missing for", CONFLICTING_FACTS: "Your answers conflict for", LAW_OPEN: "The law does not settle",
    };
    body += `
    <section class="box"><h2>Class</h2><p class="verdict">${esc(status)}</p>
      ${c.matched.length ? `<h3>Matches</h3><ul>${c.matched.map((m) => `<li>${cat(m.category)}: ${esc(CLASS_LABEL[m.class])}</li>`).join("")}</ul>` : ""}
      ${blockingOther.length ? `<h3>Still open</h3><ul>${out.reasons.filter((r) => r.category && r.kind in reasonText).map((r) =>
        `<li>${esc(reasonText[r.kind])} ${cat(r.category!)}${r.open_ref ? ` <span class="muted">(${esc(r.open_ref)})</span>` : ""}${r.kind === "LAW_OPEN" ? ". Get expert advice: more answers will not resolve this." : ""}</li>`).join("")}</ul>` : ""}
      ${blockingCov ? `<p class="note">This pilot has rules for ${RULES.categories.length} of 26 categories. Until all 26 are covered,
        it does not state a class it cannot fully check${c.class_floor === "CRITICAL" ? "" : ", including Default"}.</p>` : ""}
      ${c.excluded.length ? `<h3>Ruled out, and why</h3><ul>${c.excluded.map((x) => {
        const viaScreen = x.failing.some((f) => f.fact && f.fact in res.derived);
        return `<li>${cat(x.category)}: does not meet ${x.failing.map((f) => `<q>${esc(f.quote)}</q>`).join(" or ")}${viaScreen
          ? ` <span class="muted small">(you indicated the product is not mainly for this; go back to change that)</span>` : ""}</li>`;
      }).join("")}</ul>` : ""}
    </section>`;
    if (out.conformity_routes.some((r) => r.route !== "CRA_ART_32")) {
      body += `<section class="box"><h2>Conformity route</h2><ul>${out.conformity_routes.map((r) =>
        `<li>${esc(r.route)}${r.open_ref ? ` <span class="muted">(${esc(r.open_ref)})</span>` : ""}</li>`).join("")}</ul></section>`;
    }
    const tlLabel: Record<string, string> = { APPLIES: "Applies", NOT_YET: "Not yet", TRANSITION: "Transition", NOT_APPLICABLE: "Does not apply", UNRESOLVED: "Not determined" };
    body += `
    <section class="box"><h2>When</h2><table><thead><tr><th>Obligation</th><th>Status</th><th>Basis</th></tr></thead><tbody>
      ${out.timeline.map((i) => `<tr><td>${esc(i.obligation.replace(/_/g, " ").toLowerCase())}<br><span class="muted small">${esc(i.provision)}</span></td>
        <td>${esc(tlLabel[i.status])}${i.applies_from ? `<br><span class="muted small">from ${esc(i.applies_from)}</span>` : ""}</td>
        <td>${esc(i.basis)}${i.open_questions ? `<br><span class="muted small">${esc(i.open_questions.join(" "))}</span>` : ""}</td></tr>`).join("")}
    </tbody></table></section>`;
  }
  body += `
    <section class="box"><p>Rules reflect the law as of <strong>${esc(out.law_as_of)}</strong>; this version is valid until ${esc(out.valid_until)}.
      ${lawStatus ? `Last checked against EUR-Lex on ${esc(lawStatus.checked_at)}.` : ""}</p>
      <p class="muted small">${esc(CONFIG.disclaimer)}</p>
      <div class="nav"><button type="button" id="back" class="secondary">Back</button>
      <button type="button" id="export">Download result (JSON)</button>
      <button type="button" id="restart" class="secondary">Start again</button></div></section>`;
  return body;
}

function download() {
  const { out } = assemble();
  const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${out.assessment_id}.json` });
  a.click();
  URL.revokeObjectURL(a.href);
}

// ------------------------------------------------------------------ main loop

function render() {
  const cur = current();
  const header = `<p class="muted pilot">Pilot. Rules for ${RULES.categories.length} of 26 categories. Informational only; not legal advice.</p>`;
  if (cur.phase === "result") {
    app.innerHTML = header + resultHtml();
    document.getElementById("export")?.addEventListener("click", download);
    document.getElementById("restart")?.addEventListener("click", () => { state = fresh(); render(); });
  } else {
    app.innerHTML = header + `<div class="layout">${questionHtml(cur.phase, cur.fid!)}</div>`;
    const form = document.getElementById("q") as HTMLFormElement;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const a = readAnswer(form, cur.fid!);
      if (a.ok) answer(cur.fid!, cur.phase, a.value);
    });
    form.querySelector<HTMLElement>("input, textarea")?.focus();
  }
  document.getElementById("back")?.addEventListener("click", back);
  window.scrollTo(0, 0);
}

(async () => {
  try {
    const r = await fetch("./law-status.json", { cache: "no-store" });
    lawStatus = r.ok ? await r.json() : null;
  } catch { lawStatus = null; }
  render();
})();

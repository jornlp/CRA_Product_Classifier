import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { classify, route, toOutput, scope, timeline } from "../../../packages/engine/src/index.js";
import { reportMarkdown } from "../src/report.js";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const cls = read("packages/rules/classification.json"), sc = read("packages/rules/scope.json"), tl = read("packages/rules/timeline.json");
const qs = read("packages/rules/questions.json");
const f = (v: unknown) => ({ value: v, provenance: "USER_CONFIRMED" as const });
const facts = { PRODUCT_KIND: f("HARDWARE"), MARKET_STATUS: f("MADE_AVAILABLE"), COMMERCIAL_ACTIVITY: f(true), DATA_INTERFACE_PRESENT: f(true),
  CONNECTION_INTENDED: f(true), EXCLUSION_SCREEN: f([]), PURPOSE_SCREEN: f([]), HIGH_RISK_AI_BASIS: f("NONE"), EHR_SYSTEM: f(false),
  UNITS_PLACED_ON_MARKET: f("2028-03-01") };
const tfacts = { ASSESSMENT_DATE: "2026-10-12", UNITS_PLACED_ON_MARKET: "2028-03-01", RADIO_EQUIPMENT_RED_DA: "NO", OTHER_LEGISLATION_CERTIFICATE: false };
const res = classify(cls, facts);
const out = { ...toOutput(cls, facts, res, route(cls, facts, res), { assessmentId: "x", assessedAt: "2026-10-12", validUntil: "2027-10-12",
  scope: scope(sc, facts), timeline: timeline(tl, tfacts).timeline }), check: "full",
  for_your_records: { product: "RatWatch 2", description: "Detects a trapped rodent" }, timeline_facts: tfacts };
const md = reportMarkdown(out, { categories: qs.categories, questions: qs.questions, derived: res.derived, disclaimer: "Not legal advice." });

it("reads as a report: title, scope, class, reasons with the official wording, answers, sources, disclaimer", () => {
  expect(md).toMatch(/^# CRA assessment: RatWatch 2/);
  expect(md).toContain("**Based on your answers, the CRA applies to this product.**");
  expect(md).toContain("## Class");
  expect(md).toContain("Smart home products with security functionalities");
  expect(md).toContain("“protect the physical security of consumers”");
  expect(md).toContain("_(you indicated the product is not mainly for this)_");
  expect(md).toContain("## When the obligations apply");
  expect(md).toContain("| What is your product mainly for? | None of these |");
  expect(md).toContain("## Sources");
  expect(md.trim().endsWith("_Not legal advice._")).toBe(true);
});
it("answers are shown as the labels the user saw, not internal codes", () => {
  expect(md).toContain("On sale or supplied in the EU");
  expect(md).not.toMatch(/\| MADE_AVAILABLE \|/);
});

import { markdownToHtml } from "../src/report.js";
it("the same report renders to HTML for Save as PDF", () => {
  const html = markdownToHtml(md);
  expect(html).toContain("<h1>CRA assessment: RatWatch 2</h1>");
  expect(html).toContain("<h2>Class</h2>");
  expect(html).toContain("<strong>Based on your answers, the CRA applies to this product.</strong>");
  expect(html).toMatch(/<table><thead><tr><th>Question<\/th><th>Answer<\/th><\/tr><\/thead>/);
  expect(html).toContain("<em>(you indicated the product is not mainly for this)</em>");
  expect(html).toContain("<em>Not legal advice.</em>");
  expect(html).not.toMatch(/<script/i);
});

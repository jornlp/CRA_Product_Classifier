/**
 * Guidance shown with each question (packages/rules/guidance.json). The same discipline as rules:
 * official quotes verbatim in the held text, worked cases that exist, and balance between YES and
 * NO examples so the examples do not steer answers.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8");
const g = JSON.parse(read("packages/rules/guidance.json"));
const norm = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[_*]/g, "").replace(/\s+/g, " ").trim();
const inventory = JSON.parse(read(g.sources.B2.text));
const b2 = Object.fromEntries(inventory.categories.map((c: any) => [c.id, norm(c.technical_description + " " + c.title)]));
const faq = norm(read(g.sources.B7.text));
const recitals = JSON.parse(read(g.sources.B1R.text)).recitals as Record<string, string>;
const recital = (item: string) => norm(recitals[item.replace("Recital ", "")]);
const cases = new Set(JSON.parse(read(g.sources.CASE.text)).cases.map((c: any) => c.id));
const register = JSON.parse(read("docs/research/out/wp2-fact-register.json"));
const activeFacts = new Set(register.facts.filter((f: any) => f.status !== "SUPERSEDED").map((f: any) => f.fact_id));

for (const [fid, q] of Object.entries<any>(g.questions)) {
  describe(fid, () => {
    it("is an active fact in the register", () => expect(activeFacts.has(fid)).toBe(true));
    it("has at least one YES-side and one NO-side example", () => {
      const answers = q.examples.map((e: any) => e.answer);
      const yes = answers.some((a: string) => !["NO", "NONE", "FALSE", "CONFLICTING"].includes(a));
      const no = answers.some((a: string) => ["NO", "NONE", "FALSE", "CONFLICTING", "PROXIMITY_ONLY", "WATER"].includes(a));
      // NONE on a screen is "tick nothing"; the YES side is any ticked option.
      expect(yes && no).toBe(true);
    });
    for (const [i, e] of q.examples.entries()) {
      it(`example ${i + 1} (${e.kind}) is traceable`, () => {
        expect(e.text.length).toBeGreaterThan(10);
        if (e.kind === "OFFICIAL_TEXT") expect(b2[e.category], `B2 ${e.category}`).toContain(norm(e.quote));
        else if (e.kind === "OFFICIAL_GUIDANCE") expect(faq).toContain(norm(e.quote));
        else if (e.kind === "OFFICIAL_RECITAL") expect(recital(e.item)).toContain(norm(e.quote));
        else expect(cases.has(e.case), `case ${e.case}`).toBe(true);
      });
    }
    for (const l of q.lookalikes) it(`look-alike "${l.term}" cites an existing case if any`, () => {
      if (l.case) expect(cases.has(l.case)).toBe(true);
    });
  });
}

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
const register = JSON.parse(read("docs/research/out/wp2-fact-register.json"));
const activeFacts = new Set(register.facts.filter((f: any) => f.status !== "SUPERSEDED").map((f: any) => f.fact_id));

for (const [fid, q] of Object.entries<any>(g.questions)) {
  describe(fid, () => {
    it("is an active fact in the register", () => expect(activeFacts.has(fid)).toBe(true));
    it("uses official sources only: no worked cases of our own", () => {
      for (const e of q.examples) expect(["OFFICIAL_TEXT", "OFFICIAL_RECITAL", "OFFICIAL_GUIDANCE"]).toContain(e.kind);
      for (const l of q.lookalikes) expect(l.case).toBeUndefined();
    });
    for (const [i, e] of q.examples.entries()) {
      it(`example ${i + 1} (${e.kind}) is traceable`, () => {
        expect(e.text.length).toBeGreaterThan(10);
        if (e.kind === "OFFICIAL_TEXT") expect(b2[e.category], `B2 ${e.category}`).toContain(norm(e.quote));
        else if (e.kind === "OFFICIAL_GUIDANCE") expect(faq).toContain(norm(e.quote));
        else if (e.kind === "OFFICIAL_RECITAL") expect(recital(e.item)).toContain(norm(e.quote));
        else throw new Error(`unexpected example kind ${e.kind}`);
      });
    }
  });
}

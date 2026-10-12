/**
 * Every question's legal basis (packages/rules/questions.json) must quote the held text verbatim:
 * CRA articles and definitions, CRA recitals, the technical descriptions, and the delegated acts.
 * Citations without a quote are allowed only where no extracted text is held (AI Act, EHDS).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../${p}`, import.meta.url), "utf8"));
const norm = (s: string) => s.replace(/[‘’]/g, "'").replace(/­/g, "").replace(/\s+/g, " ").trim();
const prov = read("docs/research/out/wp1-provisions.json").articles;
const recitals = read("docs/legal/extracted/B1-recitals.json").recitals;
const inv = Object.fromEntries(read("docs/research/out/wp1-category-inventory.json").categories.map((c: any) => [c.id, c.technical_description + " " + c.title]));
const other: Record<string, string> = { B14: read("docs/legal/extracted/B14-text.json").text, B16: read("docs/legal/extracted/B16-text.json").text };
const CITATION_ONLY = new Set(["AIACT", "EHDS"]);

function sourceText(l: any): string {
  if (l.src === "CRA") return l.def ? prov[l.art].definitions[l.def] : prov[l.art].paragraphs[l.para];
  if (l.src === "RECITAL") return recitals[l.n];
  if (l.src === "B2") return inv[l.cat];
  return other[l.src];
}

for (const [fid, q] of Object.entries<any>(read("packages/rules/questions.json").questions)) {
  if (q.internal) continue;
  describe(fid, () => {
    it("explains why in plain language, without case ids or article-only text", () => {
      expect(q.why_we_ask.length).toBeGreaterThan(40);
      expect(q.why_we_ask).not.toMatch(/\b[A-Z]{2,4}-\d{2}\b/);   // no catalogue ids in user text
      expect(q.why_we_ask).not.toMatch(/^Art\./);
    });
    it("has a legal basis", () => expect(q.legal_basis.length).toBeGreaterThan(0));
    for (const [i, l] of q.legal_basis.entries()) {
      it(`basis ${i + 1} (${l.ref}) ${l.quote ? "is verbatim" : "is citation-only where allowed"}`, () => {
        if (!l.quote) return expect(CITATION_ONLY.has(l.src)).toBe(true);
        expect(norm(sourceText(l) ?? ""), l.ref).toContain(norm(l.quote));
      });
    }
  });
}

describe("legal text layout (generated from the held texts)", () => {
  for (const [fid, q] of Object.entries<any>(read("packages/rules/questions.json").questions)) {
    for (const l of q.legal_basis ?? []) {
      if (!l.quote) continue;
      it(`${fid} · ${l.ref}: the marked words are exactly the quote`, () => {
        const marked = l.text.lines.flatMap((ln: any) => ln.parts.filter((p: any) => p.mark).map((p: any) => p.text)).join(" ");
        const strip = (s: string) => norm(s).replace(/['"‘’“”]/g, "").replace(/\((?:[a-z]|[ivx]+)\) /g, "").replace(/[;:,.]$/, "");
        expect(strip(marked)).toBe(strip(l.quote));
      });
    }
  }
});

describe("Commission FAQ examples on the purpose screen are verbatim", () => {
  const faqText = norm(readFileSync(new URL(`../../../${JSON.parse(readFileSync(new URL("../../../packages/rules/guidance.json", import.meta.url), "utf8")).sources.B7.text}`, import.meta.url), "utf8"))
    .replace(/[_*]/g, "").replace(/[“”]/g, '"');
  const purpose = read("packages/rules/questions.json").questions.PURPOSE_SCREEN;
  for (const o of purpose.options) for (const [i, e] of (o.faq_examples ?? []).entries()) {
    it(`${o.value} example ${i + 1}`, () => expect(faqText).toContain(norm(e.quote).replace(/[“”]/g, '"')));
  }
});

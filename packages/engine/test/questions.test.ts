/**
 * A bare "Yes"/"No" is ambiguous when the question joins alternatives ("directly or via ...", "whether
 * paid or free", "A, or B"): "No" could mean "not the first one". Such questions must label each answer.
 */
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";

const qs = JSON.parse(readFileSync(new URL("../../../packages/rules/questions.json", import.meta.url), "utf8")).questions;
// Not asked in the web app (dates, radio equipment, change details), or a list of means where "No" is unambiguous ("any way at all").
const EXEMPT = new Set(["DATA_INTERFACE_PRESENT", "CHANGE_AFFECTS_ANNEX_I", "RADIO_INTERNET", "RADIO_BODY_CHILD_TOY", "RADIO_PERSONAL_DATA"]);

it("no Yes/No question joins alternatives without saying what each answer covers", () => {
  const bad = Object.entries<any>(qs).filter(([k, q]) => !EXEMPT.has(k)
    && (q.options ?? []).slice(0, 2).map((o: any) => o.label).join("|") === "Yes|No"
    && /directly or|whether|, or |either/.test(q.question)).map(([k]) => k);
  expect(bad).toEqual([]);
});

// @vitest-environment happy-dom
/**
 * Drives the real screens (src/main.ts) in a simulated browser: answer by clicking, go back,
 * reach the result, check what the user sees. Pest-control camera, as in the WP3 interview.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

const status = JSON.parse(readFileSync(`${process.cwd()}/apps/web/public/law-status.json`, "utf8"));
const app = () => document.getElementById("app")!;
const heading = () => app().querySelector("h2")?.textContent ?? "";
const tick = () => new Promise((r) => setTimeout(r, 0));

/** Choose the option whose label starts with `label` (or tick checkboxes; or type a date), then submit. */
async function answer(label: string | string[] | { date: string } | { text: string }) {
  const form = app().querySelector("form")!;
  if (typeof label === "string") {
    const opt = [...form.querySelectorAll("label.opt")].find((l) => l.textContent!.trim().startsWith(label));
    if (!opt) throw new Error(`no option "${label}" on "${heading()}"`);
    (opt.querySelector("input") as HTMLInputElement).checked = true;
  } else if (Array.isArray(label)) {
    for (const l of label) {
      const opt = [...form.querySelectorAll("label.opt")].find((x) => x.textContent!.trim().startsWith(l))!;
      (opt.querySelector("input") as HTMLInputElement).checked = true;
    }
  } else if ("date" in label) (form.querySelector("input[type=date]") as HTMLInputElement).value = label.date;
  else (form.querySelector("textarea") as HTMLTextAreaElement).value = label.text;
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await tick();
}

beforeAll(async () => {
  document.body.innerHTML = `<main><div id="app"></div></main>`;
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => status })));
  window.scrollTo = () => {};
  await import("../src/main.ts");
  await tick(); await tick();
});

describe("screens: pest-control camera", () => {
  it("starts with the product kind, and shows why we ask", () => {
    expect(heading()).toContain("hardware, software, or an online service");
    expect(app().querySelector("details.why")).not.toBeNull();
  });
  it("explains why in plain words, with the legal wording one level down", () => {
    const why = app().querySelector("details.why")!;
    expect(why.querySelector("p")!.textContent!.length).toBeGreaterThan(60);
    const law = why.querySelector("details.legal article.law")!;
    expect(law.querySelector(".law-act")!.textContent).toContain("Regulation (EU) 2024/2847");
    expect(law.querySelector(".law-num")!.textContent).toBe("Article 3");
    expect(law.querySelector(".law-title")!.textContent).toBe("Definitions");
    expect(law.querySelector(".law-label")!.textContent).toBe("(1)");
    expect(law.querySelector("mark")!.textContent).toContain("product with digital elements");
  });
  it("Back undoes an answer", async () => {
    await answer("Hardware");
    expect(heading()).toContain("life on the EU market");
    (app().querySelector("#back") as HTMLButtonElement).click(); await tick();
    expect(heading()).toContain("hardware, software, or an online service");
    await answer("Hardware");
  });
  it("Next without an answer does not move on", async () => {
    const before = heading();
    app().querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); await tick();
    expect(heading()).toBe(before);
  });
  it("answers scope, with the exclusion screen as a list", async () => {
    await answer("On sale or supplied in the EU");
    await answer("Yes"); // commercial activity
    await answer("Yes"); // data interface
    await answer("Yes"); // connection intended
    expect(heading()).toContain("Tick all that apply");
    await answer([]);    // no exclusion
  });
  it("asks for the core function in the user's own words", async () => {
    expect(app().querySelector("textarea")).not.toBeNull();
    await answer({ text: "Detects a trapped rodent and alerts the pest controller" });
  });
  it("shows binding, FAQ and worked examples next to the purpose question", async () => {
    await answer("No, it is not itself a chip");
    expect(heading()).toContain("protect the physical security");
    const guide = app().querySelector("aside.guide")!.textContent!;
    expect(guide).toContain("Official text (binding)");
    expect(guide).toContain("Worked example (our interpretation)");
    expect(guide).toContain("rodent");
    expect(guide).toContain("Words that mislead");
  });
  it("finishes the remaining questions", async () => {
    await answer("No"); // protects physical security
    await answer("No"); // central control
    await answer("No"); // stores passwords
    await answer("No"); // metering communication
    await answer("No"); // advanced security core
    await answer("No high-risk AI system");
    await answer("No"); // EHR
    await answer({ date: "2028-03-01" });
    await answer("No"); // RED DA
    await answer("No"); // certificate
  });
  it("result: in scope, smart-home security ruled out with the official wording, no false DEFAULT", () => {
    const text = app().textContent!;
    expect(text).toContain("The CRA applies to this product.");
    expect(text).toContain("Ruled out, and why");
    expect(text).toContain("Smart home products with security functionalities");
    expect(text).toContain("protect the physical security of consumers");
    expect(text).toContain("Not determined. At least: Default");
    expect(text).toContain("rules for 6 of 26 categories");
    expect(text).toContain("not legal advice");
  });
  it("result shows when obligations apply", () => {
    expect(app().textContent).toContain("cra art 14 reporting");
  });
});

// @vitest-environment happy-dom
/** The classification-only check: no scope or date questions, and the class is stated as conditional. */
import { beforeAll, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

const status = JSON.parse(readFileSync(`${process.cwd()}/apps/web/public/law-status.json`, "utf8"));
const app = () => document.getElementById("app")!;
const heading = () => app().querySelector("h2")?.textContent ?? "";
const tick = () => new Promise((r) => setTimeout(r, 0));
async function pick(labels: string[] | string) {
  const form = app().querySelector("form")!;
  for (const l of Array.isArray(labels) ? labels : [labels]) {
    const opt = [...form.querySelectorAll("label.opt")].find((x) => x.textContent!.trim().startsWith(l));
    if (!opt) throw new Error(`no option "${l}" on "${heading()}"`);
    (opt.querySelector("input") as HTMLInputElement).checked = true;
  }
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); await tick();
}

beforeAll(async () => {
  document.body.innerHTML = `<main><div id="app"></div></main>`;
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => status })));
  window.scrollTo = () => {};
  await import("../src/main.ts");
  await tick(); await tick();
});

it("class only, smart lock: skips scope, ends with a conditional class and an offer to check scope", async () => {
  app().querySelector<HTMLButtonElement>('button.choice[data-mode="class"]')!.click(); await tick();
  expect(heading()).toContain("mainly for");
  // Tick boxes: the selection is repeated next to Next and follows each change.
  const sel = () => document.getElementById("selection")!.textContent!;
  expect(sel()).toBe("Nothing selected: none of these applies.");
  const box = [...app().querySelectorAll("label.opt")].find((x) => x.textContent!.trim().startsWith("protecting a home"))!
    .querySelector("input") as HTMLInputElement;
  box.checked = true; box.dispatchEvent(new Event("change", { bubbles: true }));
  expect(sel()).toMatch(/^Selected \(1\): protecting a home/);
  box.checked = false; box.dispatchEvent(new Event("change", { bubbles: true }));
  expect(sel()).toBe("Nothing selected: none of these applies.");
  await pick(["protecting a home"]);    // purpose screen
  await pick("Yes");                    // protects physical security
  await pick("Yes");                    // residential
  await pick("From another system");    // control path
  const text = app().textContent!;
  expect(text).toContain("Scope not checked");
  expect(text).toContain("If the CRA applies, based on your answers: not determined; at least Important, Class I");  // scope unchecked: never definite
  expect(text).not.toContain("cra art 14 reporting");
  // No dates asked, but the CRA requirements per placing period are shown.
  const rows = [...app().querySelectorAll("table")].find((t) => t.textContent!.includes("Units placed"))!.querySelectorAll("tbody tr");
  expect([...rows].map((r) => r.children[0].textContent)).toEqual(["Before 11 December 2027", "On or after 11 December 2027"]);
  app().querySelector<HTMLButtonElement>("#to-full")!.click(); await tick();
  expect(heading()).toContain("hardware, software, or an online service");
});

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

const obligations = () => {
  const t = document.querySelector("table.obligations")!;
  return { head: [...t.querySelectorAll("thead th")].map((h) => h.textContent), rows: [...t.querySelectorAll("tbody tr")] };
};
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
  expect(sel()).toBe("Nothing selected yet.");
  // An empty list is not an answer: the user must tick something, "None of these" or "Not sure".
  app().querySelector<HTMLFormElement>("form#q")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); await tick();
  expect(heading()).toContain("mainly for");
  expect(sel()).toContain("Tick at least one option");
  const box = [...app().querySelectorAll("label.opt")].find((x) => x.textContent!.trim().startsWith("protecting a home"))!
    .querySelector("input") as HTMLInputElement;
  box.checked = true; box.dispatchEvent(new Event("change", { bubbles: true }));
  expect(sel()).toMatch(/^Selected \(1\): protecting a home/);
  // "None of these" clears the other ticks, and ticking another option clears "None of these".
  const none = [...app().querySelectorAll("label.opt")].find((x) => x.textContent!.trim().startsWith("None of these"))!
    .querySelector("input") as HTMLInputElement;
  none.checked = true; none.dispatchEvent(new Event("change", { bubbles: true }));
  expect(box.checked).toBe(false);
  expect(sel()).toMatch(/^Selected \(1\): None of these/);
  box.checked = true; box.dispatchEvent(new Event("change", { bubbles: true }));
  expect(none.checked).toBe(false);
  box.checked = false; box.dispatchEvent(new Event("change", { bubbles: true }));
  expect(sel()).toBe("Nothing selected yet.");
  await pick(["protecting a home"]);    // purpose screen
  await pick("Yes");                    // protects physical security
  await pick("Yes");                    // residential
  await pick("From another system");    // control path
  const text = app().textContent!;
  expect(app().querySelector(".verdict-kicker #to-full")!.textContent).toBe("check whether it applies");
  // Stated "if the CRA applies" (scope unchecked); the JSON export keeps the class UNRESOLVED (AC-02).
  expect(app().querySelector(".verdict-kicker")!.textContent).toContain("If the CRA applies");
  expect(app().querySelector(".verdict")!.textContent).toBe("Important, Class I");
  // No dates asked, but what needs no answers is shown "if the CRA applies": requirements per placing period, and reporting.
  const { head, rows } = obligations();
  expect(head).toEqual(["Obligation", "Units placed before 11 December 2027", "Units placed on or after 11 December 2027"]);
  expect(rows.map((r) => r.children[0].textContent!.slice(0, 15))).toEqual(["CRA requirement", "Reporting activ"]);
  app().querySelector<HTMLButtonElement>("#to-full")!.click(); await tick();
  expect(heading()).toContain("hardware, software, or an online service");
});

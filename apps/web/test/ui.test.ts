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
  document.body.innerHTML = `<main><button id="home-btn"></button><div id="app"></div></main>`;
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => status })));
  window.scrollTo = () => {};
  await import("../src/main.ts");
  await tick(); await tick();
});

describe("screens: pest-control camera", () => {
  it("first asks what the user wants to know, with three checks", async () => {
    expect(heading()).toBe("What do you want to know?");
    const choices = [...app().querySelectorAll<HTMLButtonElement>("button.choice")];
    expect(choices.map((b) => b.dataset.mode)).toEqual(["scope", "class", "full"]);
    choices[2].click(); await tick();
  });
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
  it("Back undoes an answer, and shows the earlier choice again", async () => {
    await answer("Hardware");
    expect(heading()).toContain("life on the EU market");
    (app().querySelector("#back") as HTMLButtonElement).click(); await tick();
    expect(heading()).toContain("hardware, software, or an online service");
    const picked = [...app().querySelectorAll<HTMLInputElement>("label.opt input")].filter((i) => i.checked);
    expect(picked.length).toBe(1);
    expect(picked[0].closest("label")!.textContent).toContain("Hardware");
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
  it("asks what the product is mainly for, with the stem and its warning always visible", async () => {
    expect(heading()).toContain("mainly for");
    const guide = app().querySelector("aside.guide")!.textContent!;
    expect(guide).toContain("Official examples for each option are behind the ⓘ");
    expect(guide).toContain("Words that mislead");
    expect(guide).not.toContain("None of these");
    expect(app().querySelector(".stem .stem-text")!.textContent).toBe("My product is mainly for …");
    expect(app().querySelector(".stem .stem-warning")!.textContent).toContain("An app with a login is not mainly for checking who someone is");
    const groupNames = [...app().querySelectorAll(".group-name")].map((g) => g.textContent);
    expect(groupNames).toEqual(["Security software", "System software", "Network equipment", "Chips and hardware security", "Home and personal products", "Energy"]);
    expect(app().querySelectorAll("details .group").length).toBe(0); // no group is hidden
  });
  it("each purpose option has an ⓘ that opens the official text, without ticking the option", async () => {
    const row = [...app().querySelectorAll(".opt-row")].find((r) => r.textContent!.includes("protecting a home"))!;
    const btn = row.querySelector<HTMLButtonElement>("button.info-btn")!;
    const panel = document.getElementById(btn.getAttribute("aria-controls")!)!;
    expect(panel.hidden).toBe(true);
    btn.click();
    expect(panel.hidden).toBe(false);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    const named = panel.querySelector(".named")!;
    expect(named.querySelector(".named-head")!.textContent).toBe("Examples named in the regulation");
    expect(named.querySelector(".named-list")!.textContent).toBe("Smart door locking devices, baby monitoring systems, alarm systems and home security cameras.");
    const marked = [...panel.querySelectorAll("mark")].map((m) => m.textContent);
    expect(marked.join(" | ")).toContain("protect the physical security of consumers in a residential setting");
    expect(marked.join(" | ")).toContain("can be controlled or managed remotely from other systems");
    expect(panel.textContent).toContain("Important, Class I");
    expect(row.querySelector<HTMLInputElement>("input")!.checked).toBe(false);
    btn.click();
    expect(panel.hidden).toBe(true);
  });
  it("the ⓘ for operating systems shows the FAQ's official counter-example", () => {
    const row = [...app().querySelectorAll(".opt-row")].find((r) => r.textContent!.includes("being an operating system"))!;
    const btn = row.querySelector<HTMLButtonElement>("button.info-btn")!;
    btn.click();
    const panel = document.getElementById(btn.getAttribute("aria-controls")!)!;
    expect(panel.textContent).toContain("Commission FAQ v14 (non-binding)");
    expect(panel.textContent).toContain("Does not count: A smartphone contains an operating system");
    btn.click();
  });
  it("ticking nothing on the purpose screen skips every category question", async () => {
    await answer([]);
    expect(heading()).toContain("high-risk AI system");
  });
  it("finishes the remaining questions", async () => {
    await answer("No high-risk AI system");
    await answer("No"); // EHR
    await answer({ date: "2028-03-01" });
    await answer("No"); // RED DA
    await answer("No"); // certificate
  });
  it("result: in scope, smart-home security ruled out with the official wording, class Default", () => {
    const text = app().textContent!;
    expect(text).toContain("The CRA applies to this product.");
    expect(text).toContain("Ruled out, and why");
    expect(text).toContain("Smart home products with security functionalities");
    expect(text).toContain("protect the physical security of consumers");
    expect(app().querySelector(".verdict:nth-of-type(1)")).not.toBeNull();
    expect([...app().querySelectorAll(".verdict")].map((v) => v.textContent)).toContain("Default");
    expect(text).toContain("you indicated the product is not mainly for this");
    expect(text).toContain("not legal advice");
  });
  it("offers optional record fields that are not part of the assessment", () => {
    expect(app().querySelector("#rec-product")).not.toBeNull();
    expect(app().textContent).toContain("plays no part in the assessment");
  });
  it("Home returns to the start screen and keeps the answers; choosing the check again resumes at the result", async () => {
    document.getElementById("home-btn")!.click(); await tick();
    expect(heading()).toBe("What do you want to know?");
    expect(app().querySelector("#start-again")).not.toBeNull();
    app().querySelector<HTMLButtonElement>('button.choice[data-mode="full"]')!.click(); await tick();
    expect(app().textContent).toContain("The CRA applies to this product.");
  });
  it("result shows when obligations apply", () => {
    expect(app().textContent).toContain("cra art 14 reporting");
  });
});

// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { initTheme } from "../src/theme.js";

const btn = (t: string) => document.querySelector<HTMLButtonElement>(`[data-theme-choice="${t}"]`)!;
beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.body.innerHTML = ["auto", "light", "dark"].map((t) => `<button data-theme-choice="${t}"></button>`).join("");
});

describe("colour scheme switch", () => {
  it("defaults to Auto: follows the system, nothing forced", () => {
    initTheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(btn("auto").getAttribute("aria-pressed")).toBe("true");
  });
  it("Dark and Light force the scheme and are remembered", () => {
    initTheme();
    btn("dark").click();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("cra-theme")).toBe("dark");
    btn("light").click();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(btn("light").getAttribute("aria-pressed")).toBe("true");
    expect(btn("dark").getAttribute("aria-pressed")).toBe("false");
  });
  it("a remembered choice is applied on the next visit", () => {
    localStorage.setItem("cra-theme", "dark");
    initTheme();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  it("back to Auto forgets the choice", () => {
    initTheme();
    btn("dark").click();
    btn("auto").click();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem("cra-theme")).toBeNull();
  });
});

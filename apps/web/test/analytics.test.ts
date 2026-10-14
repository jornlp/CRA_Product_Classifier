// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { count, getConsent, setConsent, countingPossible } from "../src/analytics.js";
import { CONFIG } from "../src/config.js";

const sent: string[] = [];
class FakeImage { set src(v: string) { sent.push(v); } }
beforeEach(() => { sent.length = 0; vi.stubGlobal("Image", FakeImage); localStorage.clear(); setConsent("yes"); });
const configured = CONFIG.COUNTER_URL;
afterEach(() => { vi.unstubAllGlobals(); CONFIG.COUNTER_URL = configured; });

const at = (url: string) => (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM.setURL(url);

describe("counting needs consent (ePrivacy Art. 5(3))", () => {
  const live = () => { CONFIG.COUNTER_URL = "https://example.goatcounter.com/count"; at("https://jorn.lapon.eu/CRA_Product_Classifier/"); };
  it("nothing is sent before the visitor has answered", async () => {
    live(); localStorage.clear();
    vi.resetModules();
    const fresh = await import("../src/analytics.js");  // no choice made in this module instance
    (await import("../src/config.js")).CONFIG.COUNTER_URL = "https://example.goatcounter.com/count";
    expect(fresh.getConsent()).toBe(null);
    fresh.count("start-scope");
    expect(sent).toEqual([]);
  });
  it("nothing is sent after 'No'", () => {
    live(); setConsent("no");
    count("start-scope");
    expect(sent).toEqual([]);
    expect(getConsent()).toBe("no");
  });
  it("after 'Yes', counts are sent; the choice is remembered in this browser", () => {
    live(); setConsent("yes");
    count("start-scope");
    expect(sent).toHaveLength(1);
    expect(localStorage.getItem("cra-count-consent")).toBe("yes");
  });
  it("with Do Not Track or Global Privacy Control we neither count nor ask", () => {
    live();
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
    expect(countingPossible()).toBe(false);
    delete (navigator as unknown as Record<string, unknown>).globalPrivacyControl;
    expect(countingPossible()).toBe(true);
  });
});

describe("anonymous usage count", () => {
  it("points at the project's GoatCounter site, the only counter URL CI allows", () => {
    expect(configured).toMatch(/^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/);
  });
  it("sends nothing while switched off", () => {
    CONFIG.COUNTER_URL = null;
    at("https://jorn.lapon.eu/CRA_Product_Classifier/");
    count("start-scope");
    expect(sent).toEqual([]);
  });
  it("sends nothing from a local page", () => {
    CONFIG.COUNTER_URL = "https://example.goatcounter.com/count";
    at("http://localhost:5173/");
    count("start-scope");
    expect(sent).toEqual([]);
  });
  it("sends only the event name, never anything else", () => {
    CONFIG.COUNTER_URL = "https://example.goatcounter.com/count";
    at("https://jorn.lapon.eu/CRA_Product_Classifier/");
    count("save-pdf");
    expect(sent).toHaveLength(1);
    const u = new URL(sent[0]);
    expect(u.origin + u.pathname).toBe("https://example.goatcounter.com/count");
    expect([...u.searchParams.keys()].sort()).toEqual(["e", "p", "rnd"]);
    expect(u.searchParams.get("p")).toBe("cra-classifier/save-pdf");
  });
  it("sends nothing when the browser asks not to be tracked", () => {
    CONFIG.COUNTER_URL = "https://example.goatcounter.com/count";
    at("https://jorn.lapon.eu/CRA_Product_Classifier/");
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
    count("start-scope");
    delete (navigator as unknown as Record<string, unknown>).globalPrivacyControl;
    expect(sent).toEqual([]);
  });
});

// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { count } from "../src/analytics.js";
import { CONFIG } from "../src/config.js";

const sent: string[] = [];
class FakeImage { set src(v: string) { sent.push(v); } }
beforeEach(() => { sent.length = 0; vi.stubGlobal("Image", FakeImage); });
afterEach(() => { vi.unstubAllGlobals(); CONFIG.COUNTER_URL = null; });

const at = (url: string) => (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM.setURL(url);

describe("anonymous usage count", () => {
  it("sends nothing while switched off", () => {
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
    expect(u.searchParams.get("p")).toBe("save-pdf");
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

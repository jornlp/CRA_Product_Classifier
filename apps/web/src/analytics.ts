/**
 * Anonymous usage count with GoatCounter (EU-hosted, no cookies, no local storage). Sends only a page
 * or event name, never an answer, a result or anything typed. Off when CONFIG.COUNTER_URL is null,
 * when the browser sends Do Not Track or Global Privacy Control, and on a local or test page.
 */
import { CONFIG } from "./config.js";

export function count(name: string, event = true): void {
  const url = CONFIG.COUNTER_URL;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl === true) return;
  if (!url || !/^https?:$/.test(location.protocol) || /^(localhost|127\.|\[::1\]|$)/.test(location.hostname)) return;
  const q = new URLSearchParams({ p: name, e: String(event), rnd: Math.random().toString(36).slice(2) });
  if (!event) {
    q.set("t", document.title);
    if (document.referrer) q.set("r", document.referrer);
  }
  try { new Image().src = `${url}?${q}`; } catch { /* not counted */ }
}

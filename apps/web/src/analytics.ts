/**
 * Usage count with GoatCounter (EU-hosted), only with the visitor's consent (ePrivacy Art. 5(3); EDPB
 * Guidelines 2/2023 bring pixel requests under it, and the Belgian DPA does not exempt audience
 * measurement). Nothing is sent until the visitor says yes. It sends only a page or event name, never an
 * answer, a result or anything typed. Off when CONFIG.COUNTER_URL is null, on a local or test page, and
 * when the browser sends Do Not Track or Global Privacy Control (then we do not even ask).
 */
import { CONFIG } from "./config.js";

/** Event names carry a prefix, since the GoatCounter site may also count other pages. */
export const EVENT_PREFIX = "cra-classifier/";
const KEY = "cra-count-consent";
export type Consent = "yes" | "no" | null;
let memory: Consent = null;  // used when the browser does not allow storage

/** Whether asking makes sense at all: a counter is configured, the page is live, and no do-not-track signal. */
export function countingPossible(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl === true) return false;
  return !!CONFIG.COUNTER_URL && /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\]|$)/.test(location.hostname);
}
export function getConsent(): Consent {
  try { const v = localStorage.getItem(KEY); if (v === "yes" || v === "no") return v; } catch { /* no storage */ }
  return memory;
}
/** Remembering the choice is strictly necessary to respect it, so it needs no consent of its own. */
export function setConsent(v: "yes" | "no"): void {
  memory = v;
  try { localStorage.setItem(KEY, v); } catch { /* kept for this visit only */ }
}

export function count(name: string, event = true): void {
  if (!countingPossible() || getConsent() !== "yes") return;
  const q = new URLSearchParams({ p: event ? EVENT_PREFIX + name : name, e: String(event), rnd: Math.random().toString(36).slice(2) });
  if (!event) q.set("t", document.title);  // no referrer: where a visitor came from is not needed
  try { new Image().src = `${CONFIG.COUNTER_URL}?${q}`; } catch { /* not counted */ }
}

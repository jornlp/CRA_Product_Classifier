/**
 * Results per placing period, instead of asking for a placing date. The rules only compare the placing
 * date with fixed dates, so every date between two of those gives the same result. Periods are cut at
 * every such date, each is evaluated at a representative date (its first day, or the day before the
 * first boundary), and neighbours with the same result for this assessment are merged.
 * test/periods.test.ts checks that any date inside a period gives the same result as its representative.
 */
import { classify, route } from "./classification.js";
import type { ClassificationRules, RouteResult } from "./classification.js";
import { timeline } from "./timeline.js";
import type { TimelineItem, TimelineRules, TimelineFacts } from "./timeline.js";
import type { Facts } from "./logic.js";

export interface Period { from?: string; before?: string; value: string; label: string }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function longDate(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return `${day} ${MONTHS[m - 1]} ${y}`;
}
export function dayBefore(d: string): string {
  const t = new Date(d + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() - 1);
  return t.toISOString().slice(0, 10);
}

/** Every date a rule compares the units' placing date with. */
export function placingBoundaries(cls: ClassificationRules, tl: TimelineRules): string[] {
  const s = new Set([tl.dates.RED_DA_APPLICATION, tl.dates.CRA_APPLICATION]);
  for (const r of cls.routes) {
    if (r.date_fact !== "UNITS_PLACED_ON_MARKET") continue;
    if (r.effective_from) s.add(r.effective_from);
    for (const c of r.cases) {
      if (c.when.before) s.add(c.when.before);
      if (c.when.on_or_after) s.add(c.when.on_or_after);
    }
  }
  return [...s].sort();
}

function period(from: string | undefined, before: string | undefined): Period {
  const label = !from ? `Before ${longDate(before!)}`
    : !before ? `On or after ${longDate(from)}`
    : `${longDate(from)} to ${longDate(dayBefore(before))}`;
  return { from, before, value: from ?? dayBefore(before!), label };
}

export function periodsBetween(boundaries: string[]): Period[] {
  const b = [...new Set(boundaries)].sort();
  return [period(undefined, b[0]), ...b.map((d, i) => period(d, b[i + 1]))];
}

/** What the placing date decides: the conformity routes and the timeline. */
export function placingOutcome(cls: ClassificationRules, tl: TimelineRules, facts: Facts, tfacts: TimelineFacts, placed: string):
    { routes: RouteResult[]; timeline: TimelineItem[] } {
  const f: Facts = { ...facts, UNITS_PLACED_ON_MARKET: { value: placed, provenance: "USER_CONFIRMED" } };
  return { routes: route(cls, f, classify(cls, f)), timeline: timeline(tl, { ...tfacts, UNITS_PLACED_ON_MARKET: placed }).timeline };
}

/** Placing periods for this assessment: neighbouring periods with the same result are merged. */
export function placingPeriods(cls: ClassificationRules, tl: TimelineRules, facts: Facts, tfacts: TimelineFacts): Period[] {
  const sig = (p: Period) => {
    const o = placingOutcome(cls, tl, facts, tfacts, p.value);
    return JSON.stringify([o.routes.map((r) => [r.route, r.open_ref]), o.timeline.map((i) => [i.obligation, i.status])]);
  };
  const out: Period[] = [];
  let prevSig = "";
  for (const p of periodsBetween(placingBoundaries(cls, tl))) {
    const s = sig(p);
    if (out.length && s === prevSig) {
      const last = out[out.length - 1];
      out[out.length - 1] = { ...period(last.from, p.before), value: last.value };
    } else out.push(p);
    prevSig = s;
  }
  return out;
}

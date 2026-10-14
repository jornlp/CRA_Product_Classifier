/**
 * Validity markers (DR-05). Results are never blocked; they carry these warnings instead.
 *   PAST_END_DATE: the assessment date is after the tool's end date.
 *   LAW_CHANGED:   the weekly EUR-Lex check flagged a change: to a held source this result's rules cite, or to
 *                  any other watched act the rules depend on (exclusions, timeline, delegated acts).
 *   LAW_CHECK_STALE: the last EUR-Lex check is more than STALE_DAYS old, so a change may have gone unseen.
 */
export const STALE_DAYS = 21;
export interface LawStatus {
  checked_at: string; baseline: string; status: "NO_CHANGES" | "CHANGES_FOUND";
  affected_sources: string[];
  findings: { severity: string; act: string; celex: string; relation: string; by: string; why: string }[];
}
export interface ValidityWarning { kind: "PAST_END_DATE" | "LAW_CHANGED" | "LAW_CHECK_STALE"; detail: string; rules?: string[]; since?: string }

export function validityWarnings(opt: {
  assessedAt: string; validUntil: string; lawAsOf: string;
  lawStatus?: LawStatus | null; citedSources: string[]; rules?: string[];
}): ValidityWarning[] {
  const out: ValidityWarning[] = [];
  if (opt.assessedAt > opt.validUntil) {
    out.push({ kind: "PAST_END_DATE", since: opt.validUntil,
      detail: `This tool's validity ended on ${opt.validUntil}. Its rules reflect the law as of ${opt.lawAsOf} and may no longer be correct.` });
  }
  const ls = opt.lawStatus;
  const hit = (ls?.affected_sources ?? []).filter((s) => opt.citedSources.includes(s));
  if (ls?.status === "CHANGES_FOUND" && hit.length) {
    out.push({ kind: "LAW_CHANGED", since: ls.checked_at, rules: opt.rules,
      detail: `A change to ${hit.join(", ")} was detected on ${ls.checked_at} and has not yet been reviewed. This result relies on that source.` });
  } else if (ls?.status === "CHANGES_FOUND" && ls.findings.length) {
    const acts = [...new Set(ls.findings.map((f) => f.act))].join("; ");
    out.push({ kind: "LAW_CHANGED", since: ls.checked_at,
      detail: `A change in related EU law (${acts}) was detected on ${ls.checked_at} and has not yet been reviewed. It may affect this result.` });
  }
  if (ls) {
    const days = (Date.parse(opt.assessedAt) - Date.parse(ls.checked_at)) / 86_400_000;
    if (days > STALE_DAYS) out.push({ kind: "LAW_CHECK_STALE", since: ls.checked_at,
      detail: `The last check for changes in the law was on ${ls.checked_at}, more than ${STALE_DAYS} days ago. A recent change may not be reflected.` });
  }
  return out;
}

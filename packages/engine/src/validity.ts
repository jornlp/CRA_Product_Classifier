/**
 * Validity markers (DR-05). Results are never blocked; they carry these warnings instead.
 *   PAST_END_DATE: the assessment date is after the tool's end date.
 *   LAW_CHANGED:   the weekly EUR-Lex check flagged a held source that this result's rules cite.
 */
export interface LawStatus {
  checked_at: string; baseline: string; status: "NO_CHANGES" | "CHANGES_FOUND";
  affected_sources: string[];
  findings: { severity: string; act: string; celex: string; relation: string; by: string; why: string }[];
}
export interface ValidityWarning { kind: "PAST_END_DATE" | "LAW_CHANGED"; detail: string; rules?: string[]; since?: string }

export function validityWarnings(opt: {
  assessedAt: string; validUntil: string; lawAsOf: string;
  lawStatus?: LawStatus | null; citedSources: string[]; rules?: string[];
}): ValidityWarning[] {
  const out: ValidityWarning[] = [];
  if (opt.assessedAt > opt.validUntil) {
    out.push({ kind: "PAST_END_DATE", since: opt.validUntil,
      detail: `This tool's validity ended on ${opt.validUntil}. Its rules reflect the law as of ${opt.lawAsOf} and may no longer be correct.` });
  }
  const hit = (opt.lawStatus?.affected_sources ?? []).filter((s) => opt.citedSources.includes(s));
  if (opt.lawStatus?.status === "CHANGES_FOUND" && hit.length) {
    out.push({ kind: "LAW_CHANGED", since: opt.lawStatus.checked_at, rules: opt.rules,
      detail: `A change to ${hit.join(", ")} was detected on ${opt.lawStatus.checked_at} and has not yet been reviewed. This result relies on that source.` });
  }
  return out;
}

/**
 * Timeline per obligation, each keyed on the dates it actually depends on.
 * Reference: docs/research/wp7-spike/timeline.py. Facts here are plain values.
 */
export interface TimelineRules {
  dates: Record<"CRA_ART14" | "CRA_APPLICATION" | "CERT_VALIDITY_END" | "RED_DA_APPLICATION" | "TOY_REG_APPLICATION", string>;
  dated_references: { resolves: { before?: string; on_or_after?: string; to: string }[] }[];
}
export type TimelineFacts = Record<string, unknown>;
export interface TimelineItem {
  obligation: string; status: "APPLIES" | "NOT_YET" | "TRANSITION" | "NOT_APPLICABLE" | "UNRESOLVED";
  provision: string; basis: string; applies_from?: string; open_questions?: string[];
}
const UNK = "UNKNOWN";

function item(obligation: string, status: TimelineItem["status"], provision: string, appliesFrom: string | null = null,
              basis = "", openQ: string[] | null = null): TimelineItem {
  const i: TimelineItem = { obligation, status, provision, basis };
  if (appliesFrom) i.applies_from = appliesFrom;
  if (openQ && openQ.length) i.open_questions = openQ;
  return i;
}

function substantialModification(rules: TimelineRules, f: TimelineFacts): ["TRUE" | "FALSE" | "UNRESOLVED", string] {
  const D = rules.dates;
  const changeAt = f.CHANGE_AT as string | undefined;
  if (!changeAt) return ["FALSE", "no change after placing"];
  if (changeAt === UNK) return ["UNRESOLVED", "date of the change unknown"];
  if (changeAt < D.CRA_APPLICATION) return ["FALSE", "change made before 11.12.2027; Art. 69(2) counts only changes from that date"];
  if (f.CHANGE_AFFECTS_PURPOSE === true) return ["TRUE", "change modifies the intended purpose (Art. 3(30), second limb)"];
  const a = (f.CHANGE_AFFECTS_ANNEX_I ?? UNK) as string;
  if (f.CHANGE_AFFECTS_PURPOSE === false && a === "NO") return ["FALSE", "purpose unchanged and no effect on security properties reported"];
  return ["UNRESOLVED", a === "YES"
    ? "change affects security properties; whether it affects compliance with Annex I Part I (Art. 3(30), first limb) cannot be decided here: review flag"
    : "effect on Annex I Part I compliance unknown; unchanged purpose alone does not settle it (LIFE-08)"];
}

export function timeline(rules: TimelineRules, f: TimelineFacts): { timeline: TimelineItem[]; flags: string[] } {
  const D = rules.dates;
  const today = f.ASSESSMENT_DATE as string;
  const placed = (f.UNITS_PLACED_ON_MARKET ?? UNK) as string;
  const out: TimelineItem[] = [];
  const flags: string[] = [];
  // Art. 14: no placing date needed (Art. 69(3)).
  out.push(item("CRA_ART_14_REPORTING", today >= D.CRA_ART14 ? "APPLIES" : "NOT_YET", "Art. 14; Art. 69(3)",
                D.CRA_ART14, "applies to all in-scope products, whenever placed"));
  // Essential requirements: keyed on the units' placing date, never the type's launch.
  let p = "Art. 69(2); Art. 71(2)";
  if (placed === UNK) {
    out.push(item("CRA_ESSENTIAL_REQUIREMENTS", "UNRESOLVED", p, D.CRA_APPLICATION, "placing date of the units unknown",
                  ["When are or were these units placed on the market?"]));
  } else if (placed >= D.CRA_APPLICATION) {
    out.push(item("CRA_ESSENTIAL_REQUIREMENTS", today >= D.CRA_APPLICATION ? "APPLIES" : "NOT_YET", p, D.CRA_APPLICATION,
                  "units placed on or after 11.12.2027; earlier placement of the same type gives no protection"));
  } else {
    const [sm, why] = substantialModification(rules, f);
    if (sm === "TRUE") out.push(item("CRA_ESSENTIAL_REQUIREMENTS", "APPLIES", p + "; Art. 3(30)", null,
                                     why + "; the requirements apply to these units from the change"));
    else if (sm === "FALSE") out.push(item("CRA_ESSENTIAL_REQUIREMENTS", "TRANSITION", p, null,
      "units placed before 11.12.2027 and not substantially modified from that date: " + why));
    else {
      out.push(item("CRA_ESSENTIAL_REQUIREMENTS", "UNRESOLVED", p + "; Art. 3(30)", null, why,
                    ["Is the change a substantial modification under Art. 3(30)?"]));
      flags.push("SUBSTANTIAL_MODIFICATION_REVIEW");
    }
  }
  // Art. 69(1) certificates.
  if (f.OTHER_LEGISLATION_CERTIFICATE) {
    const exp = f.CERTIFICATE_EXPIRY as string | undefined;
    const own = !!(exp && exp !== UNK && exp < D.CERT_VALIDITY_END);
    const end = own ? exp! : D.CERT_VALIDITY_END;
    const valid = today < end;
    const until = own ? `its own expiry date, before ${D.CERT_VALIDITY_END}` : exp && exp !== UNK ? D.CERT_VALIDITY_END
      : `its own expiry date or ${D.CERT_VALIDITY_END}, whichever comes first`;
    const basis = valid ? `certificate remains valid until ${until}, unless the other legislation provides otherwise`
      : own ? "the certificate has expired" : `Art. 69(1) validity ended on ${D.CERT_VALIDITY_END}`;
    out.push(item("OTHER_LEGISLATION_CERTIFICATE", valid ? "TRANSITION" : "NOT_APPLICABLE", "Art. 69(1)", null,
                  basis, ["Does the other legislation set a different validity?"]));
  }
  // RED delegated act.
  const radio = (f.RADIO_EQUIPMENT_RED_DA ?? "NO") as string;
  p = "Del. Reg. (EU) 2022/30";
  if (radio === "YES") {
    if (placed === UNK) out.push(item("RED_DA_CYBERSECURITY", "UNRESOLVED", p, D.RED_DA_APPLICATION, "placing date of the units unknown"));
    else if (placed < D.RED_DA_APPLICATION) out.push(item("RED_DA_CYBERSECURITY", "NOT_APPLICABLE", p, D.RED_DA_APPLICATION, "units placed before 1.8.2025"));
    else {
      const oq = placed >= D.CRA_APPLICATION ? ["The Commission aims to repeal the delegated act from 11.12.2027; no repeal is in force. Re-check."] : null;
      out.push(item("RED_DA_CYBERSECURITY", "APPLIES", p, D.RED_DA_APPLICATION, "radio equipment within the delegated act, placed on or after 1.8.2025", oq));
    }
  } else if (radio === UNK) {
    out.push(item("RED_DA_CYBERSECURITY", "UNRESOLVED", p, D.RED_DA_APPLICATION, "whether the delegated act covers the product is unknown"));
  }
  return { timeline: out, flags };
}

export function resolveReference(ref: TimelineRules["dated_references"][number], assessmentDate: string): string | null {
  for (const r of ref.resolves) {
    if ((r.before !== undefined && assessmentDate < r.before) || (r.on_or_after !== undefined && assessmentDate >= r.on_or_after)) return r.to;
  }
  return null;
}

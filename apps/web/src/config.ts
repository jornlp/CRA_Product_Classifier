/**
 * Release settings (DR-05). Set RELEASE_DATE when the tool is published; the validity window is
 * twelve months from then. Until release, the window is counted from the law date of the rules.
 */
export const CONFIG = {
  RELEASE_DATE: "2026-10-12" as string | null,
  VALIDITY_MONTHS: 12,
  /** Where people report errors; set when the repository is published. */
  REPO_URL: "https://github.com/jornlp/CRA_Product_Classifier" as string | null,
  /** Translated from the draft clause in the v3 report, section 13 (DR-04: use the fuller clause).
   *  v3 recommends review by a qualified lawyer before publication. */
  disclaimerVersion: "v3-13-en-1",
  disclaimer:
    "This tool is an informational aid for a preliminary assessment of applicability and product classification under the " +
    "EU Cyber Resilience Act. It does not provide legal advice, a binding interpretation, a conformity assessment, " +
    "certification, or any guarantee that a product meets all legal requirements. Its outcome depends on the accuracy and " +
    "completeness of the information entered, and on the version of the legal sources and decision rules shown. Users remain " +
    "responsible for their own assessment and should consult a qualified adviser or competent authority when in doubt. To the " +
    "extent permitted by applicable law, the tool and its content are provided without warranties, and the liability of its " +
    "providers and contributors is limited. Nothing in this notice excludes liability that cannot be excluded by law.",
};

export function validUntil(lawAsOf: string): string {
  const start = new Date((CONFIG.RELEASE_DATE ?? lawAsOf) + "T00:00:00Z");
  start.setUTCMonth(start.getUTCMonth() + CONFIG.VALIDITY_MONTHS);
  return start.toISOString().slice(0, 10);
}

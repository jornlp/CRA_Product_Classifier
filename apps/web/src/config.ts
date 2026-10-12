/**
 * Release settings (DR-05). Set RELEASE_DATE when the tool is published; the validity window is
 * twelve months from then. Until release, the window is counted from the law date of the rules.
 */
export const CONFIG = {
  RELEASE_DATE: null as string | null,
  VALIDITY_MONTHS: 12,
  disclaimer:
    "This tool supports an informational, preliminary assessment under the Cyber Resilience Act. It is not legal advice, " +
    "a conformity assessment or a guarantee of compliance. Its result depends on your answers. Have material " +
    "uncertainties reviewed, and consult the current official legislation.",
};

export function validUntil(lawAsOf: string): string {
  const start = new Date((CONFIG.RELEASE_DATE ?? lawAsOf) + "T00:00:00Z");
  start.setUTCMonth(start.getUTCMonth() + CONFIG.VALIDITY_MONTHS);
  return start.toISOString().slice(0, 10);
}

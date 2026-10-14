/**
 * Plain-language reasons for the scope result, built from the engine's condition values (not from its
 * technical reason strings, which stay in the JSON export). Used by the result page and the report.
 */
import { scopeConditionValues, T, F, U, C, O } from "../../../packages/engine/src/index.js";
import type { ScopeRules, Facts, ScopeStatus, ClassificationRules, ClassifyResult } from "../../../packages/engine/src/index.js";

const NOT_MET: Record<string, (facts: Facts) => string> = {
  PDE: () => "It is only an online service with no product it belongs to. The CRA covers hardware and software products and their remote data processing (Art. 2(1), Art. 3(1)-(2)).",
  MARKET: (f) => ({
    EXHIBITION_ONLY: "It is only shown at trade fairs, exhibitions or demonstrations, not made available on the market. It must then carry a visible sign that it does not comply with the CRA and cannot be made available until it does (Art. 4(2)).",
    OWN_USE_ONLY: "It is only for your own use and is not made available to anyone else (Art. 3(22)).",
    NOT_EU: "It is not made available on the EU market (Art. 2(1)).",
  } as Record<string, string>)[String(f.MARKET_STATUS?.value)] ?? "It is not made available on the EU market (Art. 2(1), Art. 3(22)).",
  COMMERCIAL: () => "It is not supplied in the course of a commercial activity (Art. 3(22)).",
};
const EXCLUDED: Record<string, string> = {
  MEDICAL: "It is a medical device or an in vitro diagnostic medical device (Art. 2(2)(a)-(b)).",
  VEHICLE: "It is covered by a type approval under Regulation (EU) 2019/2144 for motor vehicles (Art. 2(2)(c)).",
  AVIATION: "It is certified under Regulation (EU) 2018/1139 for civil aviation (Art. 2(3)).",
  MARINE: "It is marine equipment under Directive 2014/90/EU (Art. 2(4)).",
  L_CATEGORY: "It is a two- or three-wheel vehicle or quadricycle (Regulation (EU) No 168/2013), excluded by Delegated Regulation (EU) 2025/1535 (Art. 2(5)).",
  SPARE_PART: "It is a spare part that replaces an identical component and is made to the same specifications (Art. 2(6)).",
  DEFENCE: "It is developed or modified exclusively for national security or defence, or specifically to process classified information (Art. 2(7)).",
};
const ASK: Record<string, string> = {
  PDE: "what kind of product it is", MARKET: "whether it is made available on the EU market",
  COMMERCIAL: "whether it is supplied in a commercial activity", CONN: "whether it exchanges data with other devices or networks",
  MEDICAL: "whether the medical device rules apply", VEHICLE: "whether the motor vehicle type-approval rules apply",
  AVIATION: "whether it is certified as a civil aviation product", MARINE: "whether it is marine equipment",
  L_CATEGORY: "whether the rules for two- or three-wheel vehicles apply", SPARE_PART: "whether it is an identical spare part",
  DEFENCE: "whether it is made exclusively for national security or defence",
  SCREEN_UNIDENTIFIED: "which exclusion you think applies", SCREEN_SECTORAL: "whether other sector rules exclude it",
};
/** An open question's text without its catalogue id ("EXC-03: whether ..." -> "Whether ..."). */
const openText = (ref: string | undefined) => {
  const t = (ref ?? "").replace(/^[A-Z0-9-]+(?:-\d+)?[a-z]?:\s*/, "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
};

export function scopeReasonsPlain(rules: ScopeRules, facts: Facts, status: ScopeStatus): string[] {
  const { applicability: av, exclusions: ev, facts: f } = scopeConditionValues(rules, facts);
  const a = rules.applicability.conditions as Record<string, { open_ref?: string }>;
  const e = rules.exclusions.conditions as Record<string, { open_ref?: string }>;
  const out: string[] = [];
  if (status === "IN_SCOPE") {
    out.push("It is a hardware or software product, made available on the EU market in the course of a commercial activity, and its intended or reasonably foreseeable use includes a data connection with a device or network (Art. 2(1)). None of the exclusions in Art. 2(2)-(7) applies.");
    if (f.MARKET_STATUS?.value === "PLANNED") out.push("Not on the market yet: this applies from the moment it is first made available.");
    return out;
  }
  const connKeys = Object.keys(av).filter((k) => k.startsWith("CONN"));
  const connMet = connKeys.some((k) => av[k] === T);
  if (status === "OUT_OF_SCOPE") {
    for (const [k, v] of Object.entries(ev)) if (v === T && EXCLUDED[k]) out.push(EXCLUDED[k]);
    for (const [k, v] of Object.entries(av)) if (v === F && NOT_MET[k]) out.push(NOT_MET[k](f));
    if (connKeys.length && connKeys.every((k) => av[k] === F)) out.push("Its intended and reasonably foreseeable use includes no data connection with a device or network (Art. 2(1)).");
    return out;
  }
  const missing = new Set<string>(), open: string[] = [];
  for (const [k, v] of Object.entries(av)) {
    if (k.startsWith("CONN") && connMet) continue;
    if (v === O) open.push(openText(a[k]?.open_ref));
    else if (v === U || v === C) missing.add(k.startsWith("CONN") ? "CONN" : k);
  }
  for (const [k, v] of Object.entries(ev)) {
    if (v === O) open.push(openText(e[k]?.open_ref));
    else if (v === U || v === C) missing.add(k);
  }
  for (const k of missing) out.push(`Not answered yet: ${ASK[k] ?? k}.`);
  for (const t of open) if (t) out.push(`The law does not settle this; get expert advice. ${t}.`.replace(/\.\.$/, "."));
  return out;
}

const CLASS_NAME: Record<string, string> = { DEFAULT: "Default", IMPORTANT_I: "Important, Class I", IMPORTANT_II: "Important, Class II", CRITICAL: "Critical" };
/** A category's title up to its first ", including" (the full titles run to several lines). */
const shortTitle = (t: string) => t.split(/,? including /)[0];

/**
 * Why the class is not determined, in plain words: which answers are "Not sure" or missing, where answers
 * conflict, and where the law itself is open. One line per question (not per category), so a single
 * "Not sure" that keeps three categories open is said once.
 */
export function classOpenPlain(rules: ClassificationRules, res: ClassifyResult, facts: Facts,
    questions: Record<string, { question: string }>, categories: Record<string, { title: string }>): string[] {
  const order = rules.class_order as string[];
  const byId = Object.fromEntries(rules.categories.map((c) => [c.category, c]));
  const askedFor = new Map<string, Set<string>>(), conflicts = new Map<string, Set<string>>(), open: string[] = [];
  const all = { ...facts, ...Object.fromEntries(Object.entries(res.derived).map(([k]) => [k, facts[k]])) };
  for (const [k, r] of Object.entries(res.categories)) {
    if (r.value === T || r.value === F || order.indexOf(r.class) <= order.indexOf(res.floor)) continue;
    const label = `${shortTitle(categories[k]?.title ?? k)} (${CLASS_NAME[r.class] ?? r.class})`;
    for (const [cid, v] of Object.entries(r.conditions)) {
      const cond = byId[k]?.conditions[cid] as { fact?: string; quote?: string } | undefined;
      if (!cond) continue;
      if (v === O) open.push(`The law does not settle whether the product meets "${cond.quote}" for ${label}. More answers will not resolve this: get expert advice.`);
      else if (v === C && cond.fact) (conflicts.get(cond.fact) ?? conflicts.set(cond.fact, new Set()).get(cond.fact)!).add(label);
      else if (v === U && cond.fact) (askedFor.get(cond.fact) ?? askedFor.set(cond.fact, new Set()).get(cond.fact)!).add(label);
    }
  }
  const out: string[] = [];
  for (const [fid, cats] of askedFor) {
    const q = questions[fid]?.question ?? fid;
    const how = all[fid]?.value === U || all[fid]?.value === "UNKNOWN" ? "You answered “Not sure” to" : "Not answered:";
    out.push(`${how} “${q}”. This decides ${[...cats].join("; ")}.`);
  }
  for (const [fid, cats] of conflicts) out.push(`Your answers conflict on “${questions[fid]?.question ?? fid}”. This decides ${[...cats].join("; ")}.`);
  return [...out, ...open];
}

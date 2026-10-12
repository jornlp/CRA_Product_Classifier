#!/usr/bin/env python3
"""Watch EUR-Lex for changes to the acts our rules depend on.

Queries the Publications Office Cellar SPARQL endpoint (no registration) for every
act in eurlex-watchlist.json: amendments, corrigenda, completing delegated acts,
acts based on it, consolidations, proposals to amend, repeals, derogations and
case law. Compares the result with a committed baseline and reports what is new,
ranked by whether it can touch a provision a rule or case relies on.

This finds changes. It does not decide what they mean: every HIGH or MEDIUM item
needs the new text read and verified before a rule changes (DR-04).

Usage:
  eurlex_watch.py check   [--report FILE]   # diff against baseline; exit 1 if HIGH/MEDIUM
  eurlex_watch.py accept                    # after review: store current state as baseline
  eurlex_watch.py fetch CELEX --out DIR     # download a document (XHTML) for review

Standard library only. Downloads are untrusted: --out should be a fresh directory.
"""
import argparse
import datetime
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ENDPOINT = "https://publications.europa.eu/webapi/rdf/sparql"
RESOURCE = "http://publications.europa.eu/resource/celex/"
ROOT = Path(__file__).resolve().parents[3]
WATCHLIST = Path(__file__).with_name("eurlex-watchlist.json")
BASELINE = ROOT / "docs/research/out/eurlex-baseline.json"
EXPECTATIONS = ROOT / "docs/validation/case-expectations.json"

CDM = "http://publications.europa.eu/ontology/cdm#"
# Relations that can change what the law says, or signal that it will.
RELATIONS = {
    "resource_legal_amends_resource_legal": "amended by",
    "resource_legal_corrects_resource_legal": "corrected by",
    "resource_legal_completes_resource_legal": "completed by",
    "resource_legal_based_on_resource_legal": "based on it",
    "resource_legal_repeals_resource_legal": "repealed by",
    "resource_legal_implicitly_repeals_resource_legal": "implicitly repealed by",
    "resource_legal_derogates_resource_legal": "derogated by",
    "resource_legal_suspends_resource_legal": "suspended by",
    "resource_legal_proposes_to_amend_resource_legal": "amendment proposed by",
    "resource_legal_proposes_to_repeal_resource_legal": "repeal proposed by",
    "act_consolidated_consolidates_resource_legal": "consolidated as",
    "case-law_interpretes_resource_legal": "interpreted by (case law)",
    "work_is_logical_successor_of_work": "succeeded by",
}
CHANGES_TEXT = {
    "resource_legal_amends_resource_legal", "resource_legal_completes_resource_legal",
    "resource_legal_repeals_resource_legal", "resource_legal_implicitly_repeals_resource_legal",
    "resource_legal_derogates_resource_legal", "resource_legal_suspends_resource_legal",
    "work_is_logical_successor_of_work",
}
LOC_CODES = {"AR": "Art.", "PA": "para.", "PT": "point", "PTA": "point", "PO": "point",
             "AN": "Annex", "SCT": "section", "ALN": "subpara.", "AL": "subpara.", "LT": "letter",
             "PR": "part", "TIT": "title", "TI": "title", "TXT": "text", "CH": "chapter", "RC": "recital"}


# ---------------------------------------------------------------- endpoint

def sparql(query, timeout=180):
    data = urllib.parse.urlencode({"query": query}).encode()
    req = urllib.request.Request(ENDPOINT, data=data, headers={
        "Accept": "application/sparql-results+json",
        "User-Agent": "cra-classifier-eurlex-watch/1"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r)["results"]["bindings"]
        except Exception as e:  # network hiccups: retry, then fail loudly
            if attempt == 2:
                sys.exit(f"SPARQL query failed: {e}")


def values(celexes):
    return " ".join(f'"{c}"^^<http://www.w3.org/2001/XMLSchema#string>' for c in celexes)


def rel_filter():
    return ", ".join(f"<{CDM}{p}>" for p in RELATIONS)


def query_links(celexes):
    q = f"""PREFIX cdm: <{CDM}>
SELECT DISTINCT ?target ?p ?src ?date WHERE {{
  VALUES ?target {{ {values(celexes)} }}
  ?t cdm:resource_legal_id_celex ?target .
  ?w ?p ?t . FILTER(?p IN ({rel_filter()}))
  ?w cdm:resource_legal_id_celex ?src .
  OPTIONAL {{ ?w cdm:work_date_document ?date }}
}}"""
    return sparql(q)


def query_annotations(celexes):
    q = f"""PREFIX cdm: <{CDM}>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX ann: <http://publications.europa.eu/ontology/annotation#>
SELECT DISTINCT ?target ?p ?src ?loc ?from WHERE {{
  VALUES ?target {{ {values(celexes)} }}
  ?t cdm:resource_legal_id_celex ?target .
  ?a owl:annotatedTarget ?t ; owl:annotatedSource ?w ; owl:annotatedProperty ?p .
  FILTER(?p IN ({rel_filter()}))
  ?w cdm:resource_legal_id_celex ?src .
  OPTIONAL {{ ?a ann:reference_to_modified_location ?loc }}
  OPTIONAL {{ ?a ann:start_of_validity ?from }}
}}"""
    return sparql(q)


def query_english(celexes):
    """Which of these works have an English expression (matters for corrigenda)."""
    if not celexes:
        return set()
    q = f"""PREFIX cdm: <{CDM}>
SELECT DISTINCT ?src WHERE {{
  VALUES ?src {{ {values(celexes)} }}
  ?w cdm:resource_legal_id_celex ?src .
  ?e cdm:expression_belongs_to_work ?w ;
     cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> .
}}"""
    return {b["src"]["value"] for b in sparql(q)}


def parse_location(raw):
    """'{AR|uri} 32 {PA|uri} 5a' -> ('Art. 32 para. 5a', 'AR', '32', annex)."""
    parts = re.findall(r"\{(\w+)\|[^}]*\}\s*([^{]*)", raw or "")
    text = " ".join(f"{LOC_CODES.get(k, k)} {v.strip()}".strip() for k, v in parts)
    article = next((v.strip() for k, v in parts if k == "AR"), None)
    annex = next((v.strip() for k, v in parts if k == "AN"), None)
    return text or (raw or ""), article, annex


# ---------------------------------------------------------------- state

def keep(target, p, src):
    """Drop links that misattribute or duplicate a consolidation.

    A consolidated version (CELEX starting with 0) of act X also 'consolidates' every act
    that amends X, so it shows up under the amending act too; and consecutive consolidations
    are linked as logical successors. Keep each consolidation once, under its own base act.
    """
    if src.startswith("0"):
        return p == "act_consolidated_consolidates_resource_legal" and src[1:].split("-")[0] == target[1:]
    return True


def current_state(watch):
    celexes = [a["celex"] for a in watch["acts"]]
    links = {}
    for b in query_links(celexes):
        p = b["p"]["value"].rsplit("#", 1)[-1]
        if not keep(b["target"]["value"], p, b["src"]["value"]):
            continue
        key = f'{b["target"]["value"]}|{p}|{b["src"]["value"]}'
        links[key] = {"target": b["target"]["value"], "relation": p, "src": b["src"]["value"],
                      "date": b.get("date", {}).get("value"), "locations": []}
    for b in query_annotations(celexes):
        p = b["p"]["value"].rsplit("#", 1)[-1]
        if not keep(b["target"]["value"], p, b["src"]["value"]):
            continue
        key = f'{b["target"]["value"]}|{p}|{b["src"]["value"]}'
        link = links.setdefault(key, {"target": b["target"]["value"], "relation": p,
                                      "src": b["src"]["value"], "date": None, "locations": []})
        loc = {"location": parse_location(b.get("loc", {}).get("value"))[0],
               "raw": b.get("loc", {}).get("value"), "from": b.get("from", {}).get("value")}
        if loc not in link["locations"]:
            link["locations"].append(loc)
    corr = sorted({l["src"] for l in links.values()
                   if l["relation"] == "resource_legal_corrects_resource_legal"})
    eng = query_english(corr)
    for l in links.values():
        l["locations"].sort(key=lambda x: (x["location"], x["from"] or ""))
        if l["relation"] == "resource_legal_corrects_resource_legal":
            l["english"] = l["src"] in eng
    return {"generated": datetime.date.today().isoformat(), "endpoint": ENDPOINT,
            "links": dict(sorted(links.items()))}


# ---------------------------------------------------------------- assessment

def dependencies(act):
    arts = set(act.get("articles", []))
    if act.get("articles_from"):
        arts |= set(json.loads((ROOT / act["articles_from"]).read_text())["articles"])
    return arts, set(act.get("annexes", []))


def expand_cases(refs, cases_by_section):
    out = []
    for r in dict.fromkeys(refs):
        if r == "*":
            return ["all cases"]
        if r.startswith("section:"):
            sec = r.split(":", 1)[1]
            out.append(f"section {sec} ({len(cases_by_section.get(sec, []))} cases)")
        else:
            out.append(r)
    return out


def assess(link, act, cases_by_section):
    """Return (severity, why, affected cases)."""
    rel = link["relation"]
    arts, annexes = dependencies(act)
    whole = "*" in arts
    case_refs = act.get("cases", [])

    if rel == "act_consolidated_consolidates_resource_legal":
        held = act.get("held_consolidated")
        if held and link["src"].split("-")[-1] <= held.split("-")[-1]:
            return "INFO", "older or equal to the consolidation we hold", []
        return "MEDIUM", f"newer consolidation than held ({held or 'none held'}): fetch and diff", \
            expand_cases(case_refs, cases_by_section)
    if rel == "resource_legal_corrects_resource_legal":
        if not link.get("english"):
            return "INFO", "corrigendum without an English version: no effect on the English text", []
        return "HIGH", "English corrigendum: check whether it touches an extracted provision", \
            expand_cases(case_refs, cases_by_section)
    if rel in ("resource_legal_proposes_to_amend_resource_legal",
               "resource_legal_proposes_to_repeal_resource_legal"):
        return "MEDIUM", "proposal, not law: read it to see whether it reaches a rule", \
            expand_cases(case_refs, cases_by_section)
    if rel == "case-law_interpretes_resource_legal":
        return "MEDIUM", "case law interpreting the act: read for effect on a rule", \
            expand_cases(case_refs, cases_by_section)
    if rel == "resource_legal_based_on_resource_legal":
        if link["src"][:1] == "3":  # adopted act, e.g. delegated/implementing regulation
            return "HIGH", "new act adopted under this act (delegated/implementing): may change scope, class or categories", \
                expand_cases(case_refs, cases_by_section)
        return "LOW", "preparatory document based on the act", []

    # amendments, completions, repeals, derogations, successors
    hits, rely, other = [], [], []
    for loc in link["locations"] or [{"raw": None, "location": "", "from": None}]:
        _, art, anx = parse_location(loc["raw"])
        text = (loc["location"] or "(no location given)") + (f" from {loc['from']}" if loc.get("from") else "")
        if whole or (art is None and anx is None):
            hits.append(None); rely.append(text)
        elif art in arts or anx in annexes:
            hits.append(art if art in arts else anx); rely.append(text)
        else:
            other.append(text)
    refined = []
    for h in hits:
        refined += act.get("article_cases", {}).get(h, []) if h else case_refs
    cases = expand_cases(list(dict.fromkeys(refined or case_refs)), cases_by_section)
    rest = f" (+{len(other)} other locations we do not use)" if other else ""
    if hits:
        return "HIGH", "touches what we rely on: " + "; ".join(rely) + rest, cases
    return "LOW", f"{len(other)} locations, none we rely on: " + "; ".join(other[:5]) + (" …" if len(other) > 5 else ""), []


# ---------------------------------------------------------------- commands

def signature(link):
    """What counts as a change: raw locations, their start dates, English availability."""
    return (sorted((l.get("raw") or "", l.get("from") or "") for l in link.get("locations", [])),
            link.get("english"))


def load_cases_by_section():
    by = {}
    for c in json.loads(EXPECTATIONS.read_text())["cases"]:
        by.setdefault(c["section"], []).append(c["id"])
    return by


def cmd_check(args):
    watch = json.loads(WATCHLIST.read_text())
    acts = {a["celex"]: a for a in watch["acts"]}
    baseline = Path(args.baseline)
    if not baseline.exists():
        sys.exit(f"No baseline at {baseline}. Review the current state, then run 'accept'.")
    base = json.loads(baseline.read_text())["links"]
    now = current_state(watch)
    cur = now["links"]
    cases_by_section = load_cases_by_section()

    findings = []
    for key, link in cur.items():
        old = base.get(key)
        if old is not None and signature(old) == signature(link):
            continue
        sev, why, cases = assess(link, acts[link["target"]], cases_by_section)
        findings.append((sev, "new" if old is None else "changed", link, why, cases))
    removed = [base[k] for k in base if k not in cur]

    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "INFO": 3}
    findings.sort(key=lambda f: (order[f[0]], f[2]["target"], f[2]["src"]))
    lines = [f"# EUR-Lex watch — {now['generated']}", "",
             f"Baseline: {json.loads(baseline.read_text())['generated']} · "
             f"{len(watch['acts'])} acts watched · {len(cur)} links now, {len(base)} in baseline", ""]
    if not findings and not removed:
        lines.append("No changes since the baseline.")
    for sev, kind, link, why, cases in findings:
        act = acts[link["target"]]
        lines.append(f"- **{sev}** · {act['label']} ({link['target']}) {RELATIONS[link['relation']]} "
                     f"**{link['src']}**" + (f" ({link['date']})" if link.get("date") else "") + f" — {kind}")
        lines.append(f"  - {why}")
        if cases:
            lines.append(f"  - recheck: {', '.join(cases)}")
    for link in removed:
        lines.append(f"- **MEDIUM** · link removed from Cellar: {link['target']} {RELATIONS.get(link['relation'], link['relation'])} {link['src']} — investigate")
    lines += ["", "Every HIGH or MEDIUM item needs the text read and verified before a rule changes. "
              "When reviewed, run `eurlex_watch.py accept` and record the outcome in MANIFEST.md."]
    report = "\n".join(lines) + "\n"
    print(report)
    if args.report:
        Path(args.report).write_text(report)
    return 1 if any(f[0] in ("HIGH", "MEDIUM") for f in findings) or removed else 0


def cmd_accept(args):
    watch = json.loads(WATCHLIST.read_text())
    state = current_state(watch)
    state["watchlist"] = [a["celex"] for a in watch["acts"]]
    Path(args.baseline).write_text(json.dumps(state, indent=1, ensure_ascii=False) + "\n")
    print(f"Baseline written: {args.baseline} ({len(state['links'])} links)")
    return 0


def cmd_fetch(args):
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    headers = {"Accept": "application/xhtml+xml", "Accept-Language": "eng",
               "User-Agent": "cra-classifier-eurlex-watch/1"}

    def get(url):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:  # 300 Multiple Choices carries the list of documents
            return e.code, e.read()

    status, body = get(RESOURCE + urllib.parse.quote(args.celex))
    if status == 300:
        urls = re.findall(rb'href="([^"]+/DOC_\d+)"', body)
        docs = [(u.decode(), get(u.decode())) for u in urls]
    elif status == 200:
        docs = [(RESOURCE + args.celex, (status, body))]
    else:
        sys.exit(f"{args.celex}: HTTP {status}")
    safe = re.sub(r"[^A-Za-z0-9_.-]", "_", args.celex)
    for i, (url, (st, data)) in enumerate(docs, 1):
        if st != 200:
            print(f"  {url}: HTTP {st}")
            continue
        path = out / f"{safe}_DOC_{i}.xhtml"
        path.write_bytes(data)
        print(f"  {path} ({len(data)} bytes) — untrusted until checked; file the PDF in sources with its hash")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check"); c.add_argument("--report")
    a = sub.add_parser("accept")
    for p in (c, a):
        p.add_argument("--baseline", default=str(BASELINE))
    f = sub.add_parser("fetch"); f.add_argument("celex"); f.add_argument("--out", required=True)
    args = ap.parse_args()
    return {"check": cmd_check, "accept": cmd_accept, "fetch": cmd_fetch}[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())

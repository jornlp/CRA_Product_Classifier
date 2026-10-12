#!/usr/bin/env python3
"""Extract CRA articles verbatim from the official OJ PDF text.

No hand transcription: article text is sliced programmatically from the source, so
the only failure modes are extraction artifacts, which verify_provisions.py checks.

Usage: python3 extract_provisions.py <b1.txt> <out.json> [article numbers...]
"""
import json, re, sys

FURNITURE = (
    re.compile(r"^ELI: http"),
    re.compile(r"^EN$"),
    re.compile(r"^\d{1,3}/81$"),
    re.compile(r"^OJ L, 20\.11\.2024$"),
)

def split_footnotes(lines):
    """A line that is only "(N)" marks a footnote; its citation follows."""
    body, notes, i = [], {}, 0
    while i < len(lines):
        m = re.match(r"^\((\d{1,3})\)$", lines[i].strip())
        if m:
            j = i + 1
            cite = []
            while j < len(lines) and not re.match(r"^\(\d{1,3}\)$", lines[j].strip()):
                if lines[j].strip():
                    cite.append(lines[j].strip())
                j += 1
                if cite and cite[-1].rstrip().endswith(")."):
                    break
            notes[m.group(1)] = re.sub(r"\s+", " ", " ".join(cite)).strip()
            i = j
            continue
        body.append(lines[i]); i += 1
    return body, notes


def clean(lines):
    return [l for l in lines if not any(p.match(l.strip()) for p in FURNITURE)]

def main(src, out, wanted):
    text = open(src).read().split("\n")
    heads = [(i, int(m.group(1)))
             for i, l in enumerate(text)
             if (m := re.match(r"^Article (\d+)$", l.strip()))]
    # the enacting terms end at the first ANNEX heading; without this the last
    # article swallows every annex
    annex = next((i for i, l in enumerate(text)
                  if re.match(r"^ANNEX [IVX]+$", l.strip())
                  and i > heads[-1][0]), len(text))
    arts = {}
    for idx, (line_no, num) in enumerate(heads):
        end = heads[idx + 1][0] if idx + 1 < len(heads) else annex
        if wanted and num not in wanted:
            continue
        body, notes = split_footnotes(clean(text[line_no + 1:end]))
        # An article title may wrap across lines. Titles are short, carry no sentence
        # punctuation, and are followed either by a numbered paragraph or by body prose.
        t_lines, i = [], 0
        while i < len(body) and len(t_lines) < 3:
            ln = body[i].strip()
            if (not ln or re.match(r"^\d{1,2}\.$", ln)
                    or len(ln) > 70 or ln.endswith((".", ":", ";"))):
                break
            t_lines.append(ln); i += 1
        title = " ".join(t_lines)
        rest = "\n".join(body[i:]).strip()
        # split into numbered paragraphs on lines that are just "N."
        parts = re.split(r"\n(?=\d{1,2}\.\s*\n)", "\n" + rest)
        paras = {}
        for p in parts:
            p = p.strip()
            if not p:
                continue
            m = re.match(r"^(\d{1,2})\.\s*\n(.*)$", p, re.S)
            if m:
                paras[m.group(1)] = re.sub(r"\s*\n\s*", " ", m.group(2)).strip()
            else:
                paras.setdefault("_lead", re.sub(r"\s*\n\s*", " ", p).strip())
        arts[str(num)] = {"article": num, "title": title, "footnotes": notes,
                          "paragraphs": paras if paras else {"_lead": rest},
                          "source_lines": [line_no + 1, end]}
    json.dump({
        "artifact": "wp1-provisions",
        "source": "B1_reg-2024-2847_CRA_OJ-2024-11-20.pdf",
        "source_sha256": "e3ecaabddf6e321fa04097d15dfcccc7309d0fe5896240ab7625a27d74ab1b0a",
        "law_version": "Regulation (EU) 2024/2847, OJ L, 20.11.2024 (original as published)",
        "extraction": "programmatic slice between article headings; page furniture removed; "
                      "no hand transcription. Footnote citations may remain interleaved.",
        "articles": arts,
    }, open(out, "w"), indent=1, ensure_ascii=False)
    print(f"extracted {len(arts)} articles -> {out}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], {int(a) for a in sys.argv[3:]})

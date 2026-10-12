#!/usr/bin/env python3
"""Verify every extracted provision appears verbatim in the official source text.

Normalises whitespace and known pdftotext artifacts (curly quotes, soft hyphens
dropped at line breaks), then checks each sentence is a substring of the source.

Usage: python3 verify_provisions.py <provisions.json> <b1.txt>
Exit 1 if any sentence fails.
"""
import json, re, sys

def norm(s):
    s = re.sub(r"\s+", " ", s)
    for a, b in [("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"')]:
        s = s.replace(a, b)
    return s.strip()

FURNITURE = (re.compile(r"^ELI: http"), re.compile(r"^EN$"),
             re.compile(r"^\d{1,3}/81$"), re.compile(r"^OJ L, 20\.11\.2024$"))


def main(pj, src):
    # strip the same page furniture the extractor removes, otherwise text that is
    # contiguous after extraction is not contiguous in the source
    lines = [l for l in open(src).read().split("\n")
             if not any(p.match(l.strip()) for p in FURNITURE)]
    raw = norm("\n".join(lines))
    d = json.load(open(pj))
    checked = failed = 0
    for num, art in sorted(d["articles"].items(), key=lambda kv: int(kv[0])):
        texts = list(art["paragraphs"].values())
        texts += list(art.get("definitions", {}).values())
        for t in texts:
            for sent in re.split(r"(?<=\.)\s+(?=[A-Z(])", t):
                s = norm(sent)
                if len(s) < 25:
                    continue
                checked += 1
                if s not in raw:
                    failed += 1
                    print(f"  FAIL Art {num}: {s[:110]}")
    print(f"checked {checked} sentences, {failed} not found verbatim")
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))

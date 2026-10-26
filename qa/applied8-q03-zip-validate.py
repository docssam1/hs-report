#!/usr/bin/env python3
"""Validate Applied 8 Q3's actual ZIP, diagrams, solutions, and PDF pages."""
import base64
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

from pypdf import PdfReader

R = Path(__file__).resolve().parents[1]
W = R / ".private-work/hw-expansion-20261023/hw8"
O = W / "q3-output-qa-r1"
Z = O / "applied8-q3.zip"
E = O / "extracted"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
with zipfile.ZipFile(Z) as z:
    assert set(z.namelist()) == EXPECTED and z.testzip() is None
    z.extractall(E)
D = json.loads((R / "bank/data/applied8-expanded.json").read_text())
M = json.loads((E / "문항목록.json").read_text())
Q = json.loads((E / "검수기록.json").read_text())
items = sorted((x for x in D["items"] if x["sourceNo"] == 3), key=lambda x: x["variantNo"])
assert len(items) == M["count"] == Q["count"] == 9
assert [x["id"] for x in items] == [x["id"] for x in M["items"]] == Q["selectedIds"]
qh, sh = (E / "문제.html").read_text(), (E / "답안과상세풀이.html").read_text()
csv = (E / "빠른정답.csv").read_text()
assert len(re.findall(r'<article class="question', qh)) == len(re.findall(r'<article class="solution', sh)) == 9
assert len(re.findall(r'<div class="q-figure"', qh)) == 9
for item in items:
    assert item["text"] in qh and item["answer"] in sh and item["answer"] in csv
    assert all(step in sh for step in item["solutionSteps"])
    assert item["learningPoint"] in sh and item["learningLocation"] in sh
figs = re.findall(r'<div class="q-figure".*?<img src="data:image/([^;]+);base64,([^"]+)"', qh)
assert len(figs) == 9 and figs[0][0] == "png"
asset_dir = R / "bank/assets/applied8"
assert hashlib.sha256(base64.b64decode(figs[0][1])).hexdigest() == hashlib.sha256((asset_dir / "q3-magic-square-original.png").read_bytes()).hexdigest()
assert all(fmt == "svg+xml" for fmt, _ in figs[1:])
for item, (fmt, encoded) in zip(items[1:], figs[1:]):
    svg = ET.fromstring(base64.b64decode(encoded))
    vals = [int(el.text) for el in svg if el.tag.rsplit("}",1)[-1] == "text"]
    p = item["verification"]["parameters"]
    assert vals == p["givenValues"] and len(vals) == 6
B = json.loads((O / "browser-evidence.json").read_text())
qp, sp = PdfReader(str(E / "문제.pdf")), PdfReader(str(E / "답안과상세풀이.pdf"))
assert B["sourceNo"] == 3 and B["count"] == 9
assert len(qp.pages) == B["questionPdfPages"] == 3 and len(sp.pages) == B["solutionPdfPages"] == 3
assert B["answerInputs"] == B["diagnosisLinks"] == B["learningLocationLinks"] == 9
assert B["columnOrder"] and B["mobile375NoOverflow"] and B["threeAttempts"] and B["firstPracticePreserved"]
assert B["questionOverflow"] == B["solutionOverflow"] == 0 and B["externalWrites"] == [] and B["pageErrors"] == []
report = {"passed": True, "zipBytes": Z.stat().st_size, "zipEntries": sorted(EXPECTED),
          "questionPages": len(qp.pages), "solutionPages": len(sp.pages), "itemCount": 9,
          "sourceCropExact": True, "allVariantImagesEmbedded": True,
          "answersAndLearningLinksIncluded": True, "browserChecks": True, "externalWrites": 0,
          "zipSha256": hashlib.sha256(Z.read_bytes()).hexdigest()}
(O / "zip-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied8 Q3 ZIP: 7 entries; 9 problems + detailed solutions; 3 question pages + 3 solution pages; original crop, 8 vector grids, answer input, diagnosis, and learning links.")

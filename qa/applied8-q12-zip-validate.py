#!/usr/bin/env python3
"""Validate the actual downloaded Applied 8 Q12 ZIP and all included solutions."""
from __future__ import annotations

import base64
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
OUT = WORK / "q12-output-qa-r1"
ZIP = OUT / "applied8-q12.zip"
EXTRACT = OUT / "extracted"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
EXTRACT.mkdir(parents=True, exist_ok=True)
with ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED and z.testzip() is None
    z.extractall(EXTRACT)

DATA = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
items = [x for x in DATA["items"] if x["sourceNo"] == 12]
manifest = json.loads((EXTRACT / "문항목록.json").read_text())
qa = json.loads((EXTRACT / "검수기록.json").read_text())
assert len(items) == manifest["count"] == qa["count"] == 9
assert [x["id"] for x in items] == [x["id"] for x in manifest["items"]] == qa["selectedIds"]
qhtml = (EXTRACT / "문제.html").read_text()
anshtml = (EXTRACT / "답안과상세풀이.html").read_text()
quick = (EXTRACT / "빠른정답.csv").read_text()
assert len(re.findall(r'<article class="question', qhtml)) == 9
assert len(re.findall(r'<article class="solution', anshtml)) == 9
for item in items:
    assert item["text"] in qhtml and item["answer"] in anshtml and item["answer"] in quick
    assert all(step in anshtml for step in item["solutionSteps"])
    assert item["learningLocation"] in anshtml and item["learningPoint"] in anshtml
figures = re.findall(r'<div class="q-figure".*?<img src="data:image/([^;]+);base64,([^"]+)"', qhtml)
assert len(re.findall(r'<div class="q-figure"', qhtml)) == len(figures) == 9
assert figures[0][0] == "png"
assert hashlib.sha256(base64.b64decode(figures[0][1])).hexdigest() == hashlib.sha256((ROOT / "bank/assets/applied8/q12-balances-original.png").read_bytes()).hexdigest()
assert all(fmt == "svg+xml" for fmt, _ in figures[1:])
browser = json.loads((OUT / "browser-evidence.json").read_text())
qpdf = PdfReader(str(EXTRACT / "문제.pdf"))
apdf = PdfReader(str(EXTRACT / "답안과상세풀이.pdf"))
assert len(qpdf.pages) == browser["questionPdfPages"]
assert len(apdf.pages) == browser["solutionPdfPages"]
assert browser["sourceNo"] == 12 and browser["count"] == 9
assert browser["answerInputs"] == browser["diagnosisLinks"] == browser["learningLocationLinks"] == 9
assert browser["columnOrder"] and browser["mobile375NoOverflow"] and browser["threeAttempts"] and browser["firstPracticePreserved"]
assert browser["questionOverflow"] == browser["solutionOverflow"] == 0
assert browser["externalWrites"] == [] and browser["pageErrors"] == []
report = {"passed": True, "zipBytes": ZIP.stat().st_size, "zipEntries": sorted(EXPECTED),
          "questionPages": len(qpdf.pages), "solutionPages": len(apdf.pages), "itemCount": 9,
          "answersAndLearningLinksIncluded": True, "sourceCropPixelExact": True,
          "browserInputDiagnosisMobileChecks": True, "externalWrites": 0,
          "zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest()}
(OUT / "zip-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"PASS Applied8 Q12 ZIP: seven entries, nine questions and detailed solutions; {len(qpdf.pages)} question and {len(apdf.pages)} solution pages; all SVGs and answer inputs retained.")

#!/usr/bin/env python3
"""Validate Q10's downloaded ZIP, questions, solutions, and printed PDFs."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
OUT = WORK / "q10-output-qa-r1"
ZIP = OUT / "applied8-q10.zip"
EXTRACT = OUT / "extracted"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
EXTRACT.mkdir(parents=True, exist_ok=True)
with ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED and z.testzip() is None
    z.extractall(EXTRACT)
D = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
manifest = json.loads((EXTRACT / "문항목록.json").read_text())
qa = json.loads((EXTRACT / "검수기록.json").read_text())
items = [x for x in D["items"] if x["sourceNo"] == 10]
assert len(items) == manifest["count"] == qa["count"] == 9
assert [x["id"] for x in items] == [x["id"] for x in manifest["items"]] == qa["selectedIds"]
q = (EXTRACT / "문제.html").read_text()
s = (EXTRACT / "답안과상세풀이.html").read_text()
csv = (EXTRACT / "빠른정답.csv").read_text()
assert len(re.findall(r'<article class="question', q)) == 9
assert len(re.findall(r'<article class="solution', s)) == 9
assert "data:image/" not in q
for item in items:
    assert item["text"] in q and item["answer"] in s and item["answer"] in csv
    assert item["learningPoint"] in s and item["learningLocation"] in s
    assert all(step in s for step in item["solutionSteps"])
    assert "톱니바퀴" in item["text"]
questions = PdfReader(str(EXTRACT / "문제.pdf"))
solutions = PdfReader(str(EXTRACT / "답안과상세풀이.pdf"))
browser = json.loads((OUT / "browser-evidence.json").read_text())
assert browser["sourceNo"] == 10 and browser["count"] == 9
assert len(questions.pages) == browser["questionPdfPages"] and len(solutions.pages) == browser["solutionPdfPages"]
assert browser["answerInputs"] == 9 and browser["diagnosisLinks"] == browser["learningLocationLinks"] == 9
assert browser["columnOrder"] and browser["mobile375NoOverflow"] and browser["threeAttempts"] and browser["firstPracticePreserved"]
assert browser["questionOverflow"] == browser["solutionOverflow"] == 0
assert browser["externalWrites"] == [] and browser["pageErrors"] == []
report = {"passed": True, "zipBytes": ZIP.stat().st_size, "zipEntries": sorted(EXPECTED),
          "questionPages": len(questions.pages), "solutionPages": len(solutions.pages),
          "itemCount": 9, "questionImages": 0, "solutionsAndLearningLinksIncluded": True,
          "browserInputDiagnosisMobileChecks": True, "externalWrites": 0,
          "zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest()}
(OUT / "zip-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"PASS Applied8 Q10 ZIP: seven entries, nine questions and detailed solutions; {len(questions.pages)} question and {len(solutions.pages)} solution pages; answers and links included.")

#!/usr/bin/env python3
"""Validate actual downloaded Applied 8 Q20 ZIP contents and PDF exports."""
import base64
import json
import re
from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".private-work/hw-expansion-20261023/hw8/q20-output-qa-r1"
ARCHIVE = OUT / "applied8-q20.zip"
EXTRACT = OUT / "extracted"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
EXTRACT.mkdir(exist_ok=True)
with ZipFile(ARCHIVE) as z:
    assert set(z.namelist()) == EXPECTED
    assert z.testzip() is None
    z.extractall(EXTRACT)

manifest = json.loads((EXTRACT / "문항목록.json").read_text())
qa = json.loads((EXTRACT / "검수기록.json").read_text())
bank = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
items = [x for x in bank["items"] if x["sourceNo"] == 20]
assert manifest["count"] == qa["count"] == len(items) == 9
assert [x["id"] for x in manifest["items"]] == [x["id"] for x in items] == qa["selectedIds"]
assert all(x["sourceNo"] == 20 and x["sourceRound"] == 8 for x in manifest["items"])

questions_html = (EXTRACT / "문제.html").read_text()
solutions_html = (EXTRACT / "답안과상세풀이.html").read_text()
answers_csv = (EXTRACT / "빠른정답.csv").read_text()
asset_bytes = (ROOT / "bank/assets/applied8/q20-fraction-sequence-original.png").read_bytes()
images = re.findall(r"data:image/png;base64,([A-Za-z0-9+/=]+)", questions_html)
assert len(images) == 9 and all(base64.b64decode(x) == asset_bytes for x in images)
for item in items:
    assert item["text"] in questions_html
    assert item["answer"] in solutions_html
    assert item["answer"] in answers_csv
    assert item["learningLocation"] in solutions_html
    assert item["learningPoint"] in solutions_html
assert "T_n" not in questions_html and "삼각수" not in questions_html
assert all(x in solutions_html for x in ("삼각수", "분모", "학습 위치", "학습 포인트"))

qpdf = PdfReader(str(EXTRACT / "문제.pdf"))
apdf = PdfReader(str(EXTRACT / "답안과상세풀이.pdf"))
browser = json.loads((OUT / "browser-evidence.json").read_text())
assert len(qpdf.pages) == qa["questionPdfPages"] == browser["questionPdfPages"]
assert len(apdf.pages) == qa["solutionPdfPages"] == browser["solutionPdfPages"]
assert len(qpdf.pages) == 3 and len(apdf.pages) == 5
for page in qpdf.pages:
    assert len(page.images) >= 1
for page in apdf.pages:
    assert len(page.images) >= 1

report = {
    "zipBytes": ARCHIVE.stat().st_size,
    "zipEntries": sorted(EXPECTED),
    "questionPages": len(qpdf.pages),
    "solutionPages": len(apdf.pages),
    "itemCount": len(items),
    "sourceFractionSequenceEmbeddedByteExactNineTimes": True,
    "answersAndDetailedSolutionsAndLearningLinksIncluded": True,
    "pageCountsMatchBrowserEvidence": True,
}
(OUT / "zip-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied8 Q20 actual ZIP: seven entries, nine source IDs, exact fraction sequence image byte-matched, answers/solutions/learning links present, 3 question and 5 solution pages match browser evidence.")

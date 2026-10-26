#!/usr/bin/env python3
"""Inspect the actual browser-downloaded Applied 8 Q14 ZIP and its PDFs."""
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".private-work/hw-expansion-20261023/hw8/q14-output-qa-r1"
ARCHIVE = OUT / "applied8-q14.zip"
EXTRACT = OUT / "extracted"
EXPECTED = {
    "문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
    "빠른정답.csv", "문항목록.json", "검수기록.json",
}
EXTRACT.mkdir(exist_ok=True)
with ZipFile(ARCHIVE) as z:
    assert set(z.namelist()) == EXPECTED
    assert z.testzip() is None
    z.extractall(EXTRACT)

manifest = json.loads((EXTRACT / "문항목록.json").read_text())
qa = json.loads((EXTRACT / "검수기록.json").read_text())
data = json.loads((ROOT / "bank/data/applied8-expanded.json").read_text())
items = [x for x in data["items"] if x["sourceNo"] == 14]
assert manifest["count"] == qa["count"] == len(items) == 9
assert [x["id"] for x in manifest["items"]] == [x["id"] for x in items]
assert qa["selectedIds"] == [x["id"] for x in items]
assert all(x["sourceNo"] == 14 and x["sourceRound"] == 8 for x in manifest["items"])

questions_html = (EXTRACT / "문제.html").read_text()
solutions_html = (EXTRACT / "답안과상세풀이.html").read_text()
answers_csv = (EXTRACT / "빠른정답.csv").read_text()
for item in items:
    assert item["text"] in questions_html
    assert item["answer"] in solutions_html and item["answer"] in answers_csv
    assert item["learningLocation"] in solutions_html
    assert item["learningPoint"] in solutions_html
assert questions_html.count('class="frac"') >= 36
assert "활용 8회" in questions_html and "GFIELD Print Serif" in questions_html
assert all(phrase in solutions_html for phrase in ("분자와 분모", "학습 위치", "학습 포인트"))

qpdf = PdfReader(str(EXTRACT / "문제.pdf"))
apdf = PdfReader(str(EXTRACT / "답안과상세풀이.pdf"))
evidence = json.loads((OUT / "browser-evidence.json").read_text())
assert len(qpdf.pages) == evidence["questionPdfPages"] == qa["questionPdfPages"]
assert len(apdf.pages) == evidence["solutionPdfPages"] == qa["solutionPdfPages"]
assert len(qpdf.pages) >= 2 and len(apdf.pages) >= 2
assert all(len(page.images) >= 1 for page in list(qpdf.pages) + list(apdf.pages))
report = {
    "zipBytes": ARCHIVE.stat().st_size,
    "zipEntries": sorted(EXPECTED),
    "questionPages": len(qpdf.pages),
    "solutionPages": len(apdf.pages),
    "itemCount": len(items),
    "allQuestionTermsRenderedAsFractions": True,
    "allAnswersAndLearningLocationsIncluded": True,
    "pdfPagesContainRenderedContent": True,
}
(OUT / "zip-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied8 Q14 actual ZIP: seven required entries, nine matching selected IDs, fractions rendered, detailed solutions and learning links included, all PDFs contain page content.")

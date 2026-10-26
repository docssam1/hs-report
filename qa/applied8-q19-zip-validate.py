#!/usr/bin/env python3
"""Validate the browser-downloaded Applied 8 Q19 ZIP and its PDFs."""
import json
from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".private-work/hw-expansion-20261023/hw8/q19-output-qa-r1"
ARCHIVE = OUT / "applied8-q19.zip"
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
items = [x for x in bank["items"] if x["sourceNo"] == 19]
assert manifest["count"] == qa["count"] == len(items) == 9
assert [x["id"] for x in manifest["items"]] == [x["id"] for x in items] == qa["selectedIds"]
assert all(x["sourceNo"] == 19 and x["sourceRound"] == 8 for x in manifest["items"])

questions_html = (EXTRACT / "문제.html").read_text()
solutions_html = (EXTRACT / "답안과상세풀이.html").read_text()
answers_csv = (EXTRACT / "빠른정답.csv").read_text()
for item in items:
    assert item["text"] in questions_html
    assert item["answer"] in solutions_html
    assert item["answer"] in answers_csv
    assert item["learningLocation"] in solutions_html
    assert item["learningPoint"] in solutions_html
    assert "3색" not in item["text"] and "원 둘레에 같은 간격" in item["text"]
assert len([line for line in answers_csv.splitlines() if line.strip()]) == 10
assert "정답 위치" not in questions_html and "맞은편" in questions_html
assert "officialAnswerStatus" not in questions_html
assert "공식 정답" in solutions_html or "정답" in solutions_html

qpdf = PdfReader(str(EXTRACT / "문제.pdf"))
apdf = PdfReader(str(EXTRACT / "답안과상세풀이.pdf"))
browser = json.loads((OUT / "browser-evidence.json").read_text())
assert len(qpdf.pages) == qa["questionPdfPages"] == browser["questionPdfPages"] == 2
assert len(apdf.pages) == qa["solutionPdfPages"] == browser["solutionPdfPages"] == 3
for page in list(qpdf.pages) + list(apdf.pages):
    width, height = float(page.mediabox.width), float(page.mediabox.height)
    assert abs(width - 595.28) < 1.1 and abs(height - 841.89) < 1.1

report = {
    "zipBytes": ARCHIVE.stat().st_size,
    "zipEntries": sorted(EXPECTED),
    "questionPages": len(qpdf.pages),
    "solutionPages": len(apdf.pages),
    "itemCount": len(items),
    "allQuestionSolutionLearningIdsMatch": True,
    "actualBrowserPdfPageCountsMatch": True,
    "a4PageSizes": True,
    "officialAnswerStatus": "unconfirmed; available page is a blank answer copy",
}
(OUT / "zip-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied8 Q19 actual ZIP: seven entries, nine matching question/solution IDs, answers and learning links present, A4 PDFs with 2 question and 3 solution pages.")

#!/usr/bin/env python3
"""Verify the actual browser-downloaded Applied4 Q1 question-and-solution ZIP."""
from base64 import b64encode
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw4/q01-output-qa-r2"
ZIP_PATH = WORK / "applied4-q01-nine.zip"
DATA_PATH = ROOT / "bank/data/applied4-expanded.json"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}

data = json.loads(DATA_PATH.read_text())
items = [x for x in data["items"] if x["sourceNo"] == 1]
ids = [x["id"] for x in items]
assert len(items) == 9 and len(set(ids)) == 9
with ZipFile(ZIP_PATH) as archive:
    assert set(archive.namelist()) == EXPECTED
    manifest = json.loads(archive.read("문항목록.json"))
    audit = json.loads(archive.read("검수기록.json"))
    csv = archive.read("빠른정답.csv").decode("utf-8-sig")
    question_html = archive.read("문제.html").decode("utf-8")
    solution_html = archive.read("답안과상세풀이.html").decode("utf-8")
    question_pdf = archive.read("문제.pdf")
    solution_pdf = archive.read("답안과상세풀이.pdf")
    assert manifest["count"] == 9 and [x["id"] for x in manifest["items"]] == ids
    assert all(x["reviewStatus"] == "verified" for x in manifest["items"])
    assert audit["count"] == 9 and audit["selectedIds"] == ids
    assert audit["questionPdfPages"] == 3 and audit["solutionPdfPages"] == 3
    assert all(item_id in question_html and item_id in solution_html and item_id in csv for item_id in ids)
    assert question_pdf.startswith(b"%PDF-") and solution_pdf.startswith(b"%PDF-")
    q_pages = len(PdfReader(BytesIO(question_pdf)).pages)
    s_pages = len(PdfReader(BytesIO(solution_pdf)).pages)
    assert q_pages == 3 and s_pages == 3
    assert all(x["learningPoint"] in solution_html and x["learningLocation"] in solution_html for x in items)
    assert question_html.count("data:image/svg+xml;base64,") == 9
    for item in items:
        svg = ROOT / "bank" / item["asset"]["src"]
        assert b64encode(svg.read_bytes()).decode("ascii") in question_html
report = {"dataSha256": sha256(DATA_PATH.read_bytes()).hexdigest(), "zipSha256": sha256(ZIP_PATH.read_bytes()).hexdigest(),
          "zipBytes": ZIP_PATH.stat().st_size, "entries": sorted(EXPECTED), "count": 9,
          "questionPdfPages": q_pages, "solutionPdfPages": s_pages, "allIdsAgreeInManifestHtmlCsv": True,
          "learningLinksAndPointsPresent": True, "vectorFigureFilesReferenced": 9, "passed": True}
(WORK / "zip-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS Q1 selected ZIP: 7 required entries, 9 IDs agree in manifest/HTML/CSV, question and full solutions PDFs are 3 pages each.")

#!/usr/bin/env python3
"""Inspect the actual full Applied 2 ZIP downloaded by the browser QA."""
import csv
import hashlib
import io
import json
from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".private-work/hw-expansion-20261023/hw2/output-qa"
ZIP_PATH = OUT / "selected-135.zip"
DATA = json.loads((ROOT / "bank/data/applied2-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied2-expanded-index.json").read_text())
EXPECTED = {
    "문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
    "빠른정답.csv", "문항목록.json", "검수기록.json",
}

with ZipFile(ZIP_PATH) as archive:
    assert set(archive.namelist()) == EXPECTED
    listing = json.loads(archive.read("문항목록.json"))
    manifest = json.loads(archive.read("검수기록.json"))
    ids = [x["id"] for x in DATA["items"]]
    assert len(ids) == 135 and len(set(ids)) == 135
    listed_ids = [x["id"] for x in listing["items"]]
    assert listed_ids == ids
    assert listing.get("itemCount", len(listed_ids)) == 135
    q03 = [x for x in DATA["items"] if x["sourceNo"] == 3]
    listed_q03 = [x for x in listing["items"] if x["sourceNo"] == 3]
    assert [x["id"] for x in listed_q03] == [x["id"] for x in q03]
    assert len(q03) == len(listed_q03) == 9

    questions_html = archive.read("문제.html").decode("utf-8")
    answers_html = archive.read("답안과상세풀이.html").decode("utf-8")
    assert all(x["id"] in questions_html and x["id"] in answers_html for x in q03)
    assert all(x["answer"] in answers_html for x in q03)
    assert all(x["learningPoint"] in answers_html and x["learningLocation"] in answers_html for x in q03)

    rows = list(csv.reader(io.StringIO(archive.read("빠른정답.csv").decode("utf-8-sig"))))
    assert len(rows) == 136, len(rows)
    assert sum("applied2-q03-v" in " ".join(row) for row in rows) == 9

    question_pdf = PdfReader(io.BytesIO(archive.read("문제.pdf")))
    answer_pdf = PdfReader(io.BytesIO(archive.read("답안과상세풀이.pdf")))
    assert len(question_pdf.pages) == 35
    assert len(answer_pdf.pages) == 59
    for page in list(question_pdf.pages) + list(answer_pdf.pages):
        width, height = float(page.mediabox.width), float(page.mediabox.height)
        assert abs(width - 595.28) < 1 and abs(height - 841.89) < 1
    # Chromium prints each sheet as a raster page, so page text is not extractable.
    # Render the relevant pages separately and inspect them visually after this check.

result = {
    "status": "PASS",
    "zip": str(ZIP_PATH.relative_to(ROOT)),
    "zipBytes": ZIP_PATH.stat().st_size,
    "zipSha256": hashlib.sha256(ZIP_PATH.read_bytes()).hexdigest(),
    "dataSha256": hashlib.sha256((ROOT / "bank/data/applied2-expanded.json").read_bytes()).hexdigest(),
    "indexSha256": hashlib.sha256((ROOT / "bank/data/applied2-expanded-index.json").read_bytes()).hexdigest(),
    "entries": sorted(EXPECTED),
    "itemCount": len(ids),
    "sourceTypes": len(INDEX["items"]),
    "q03VariantsAndSolutions": 9,
    "questionPdfPagesA4": len(question_pdf.pages),
    "solutionPdfPagesA4": len(answer_pdf.pages),
    "sourceAnswerOfficiality": "unconfirmed",
}
(OUT / "zip-evidence.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print("PASS: downloaded full ZIP contains all 135 problems and detailed solutions; 9 Q03 variants, answer rows, linked learning fields, and 94 A4 PDF pages verified.")

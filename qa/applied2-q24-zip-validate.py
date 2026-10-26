#!/usr/bin/env python3
"""Verify the actual downloaded Applied2 Q24 ZIP, PDFs, and 9 problem/solution pairs."""
import csv
import hashlib
import io
import json
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw2/output-qa"
ZIP_PATH = WORK / "selected-9.zip"
DATA = json.loads((ROOT / "bank/data/applied2-expanded.json").read_text())
EXPECTED_FILES = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
items = sorted((x for x in DATA["items"] if x["sourceNo"] == 24), key=lambda x: x["variantNo"])
assert len(items) == 9
with ZipFile(ZIP_PATH) as archive:
    assert set(archive.namelist()) == EXPECTED_FILES
    listing = json.loads(archive.read("문항목록.json"))
    record = json.loads(archive.read("검수기록.json"))
    questions = PdfReader(io.BytesIO(archive.read("문제.pdf")))
    solutions = PdfReader(io.BytesIO(archive.read("답안과상세풀이.pdf")))
    csv_rows = list(csv.reader(io.StringIO(archive.read("빠른정답.csv").decode("utf-8-sig"))))
    solution_html = archive.read("답안과상세풀이.html").decode("utf-8")
ids = [x["id"] for x in items]
assert listing["count"] == record["count"] == 9
assert [x["id"] for x in listing["items"]] == ids == record["selectedIds"]
assert len(questions.pages) == 5 and len(solutions.pages) == 9
assert [row[1] for row in csv_rows[1:]] == ids
for item in items:
    assert f'data-answer-id="{item["id"]}"' in solution_html
    assert item["detailType"] in solution_html
    assert item["learningLocation"] in solution_html
    assert item["learningPoint"] in solution_html
report = {"passed": True, "zipSha256": hashlib.sha256(ZIP_PATH.read_bytes()).hexdigest(),
          "zipBytes": ZIP_PATH.stat().st_size, "entries": sorted(EXPECTED_FILES),
          "ids": ids, "questionPages": len(questions.pages), "solutionPages": len(solutions.pages),
          "allNineAnswersDetailedSolutionsLearningLinks": True, "dataSha256": hashlib.sha256((ROOT / "bank/data/applied2-expanded.json").read_bytes()).hexdigest()}
(WORK / "q24-zip-validation-r3.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS actual Applied2 Q24 ZIP: seven required files; 9 matching problem/solution IDs and answer records; 5 question pages, 9 detailed solution pages; learning links present.")

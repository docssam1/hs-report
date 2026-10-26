#!/usr/bin/env python3
"""Inspect the actual browser-downloaded Applied4 Q4 practice ZIP."""
from base64 import b64encode
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw4/q04-output-qa-r3"
ZIP_PATH = WORK / "applied4-q04-nine.zip"
DATA_PATH = ROOT / "bank/data/applied4-expanded.json"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}

data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
items = [x for x in data["items"] if x["sourceNo"] == 4]
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
    assert question_pdf.startswith(b"%PDF-") and solution_pdf.startswith(b"%PDF-")
    qreader, sreader = PdfReader(BytesIO(question_pdf)), PdfReader(BytesIO(solution_pdf))
    q_pages, s_pages = len(qreader.pages), len(sreader.pages)
    assert q_pages >= 2 and s_pages >= 1
    q_images = [len(page.images) for page in qreader.pages]
    s_images = [len(page.images) for page in sreader.pages]
    assert all(q_images) and all(s_images)
    for item in items:
        assert item["id"] in question_html and item["id"] in solution_html and item["id"] in csv
        assert item["text"] in question_html
        assert item["answer"] in solution_html and item["answer"] in csv
        assert all(step in solution_html for step in item["solutionSteps"])
        assert item["learningPoint"] in solution_html and item["learningLocation"] in solution_html
    assert "이미지/svg" not in question_html
report = {"dataSha256": sha256(DATA_PATH.read_bytes()).hexdigest(), "zipSha256": sha256(ZIP_PATH.read_bytes()).hexdigest(),
          "zipBytes": ZIP_PATH.stat().st_size, "entries": sorted(EXPECTED), "count": 9,
          "questionPdfPages": q_pages, "solutionPdfPages": s_pages, "allIdsAgreeInManifestHtmlCsv": True,
          "rasterPageImages": {"questions": q_images, "solutions": s_images},
          "htmlIdsQuestionsAnswersSolutionsAndLearningAgree": True, "passed": True}
(WORK / "zip-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"PASS Q4 selected ZIP: 7 required files, all 9 IDs/text/answers/detailed steps/learning links agree; {q_pages} question and {s_pages} solution PDF pages.")

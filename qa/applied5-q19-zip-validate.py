#!/usr/bin/env python3
"""Inspect the downloaded full Applied 5 ZIP and retain its PDFs for review."""
import csv
import hashlib
import io
import json
import zipfile
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
ZIP = WORK / "output-qa-r14/selected-189.zip"
DATA = json.loads((ROOT / "bank/data/applied5-expanded.json").read_text())
DEST = WORK / "q19-output-qa-r14"
EXPECTED_FILES = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
                  "빠른정답.csv", "문항목록.json", "검수기록.json"}


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    expected_ids = [x["id"] for x in DATA["items"]]
    q19 = [x for x in DATA["items"] if x["sourceNo"] == 19]
    assert len(q19) == 9 and [x["variantNo"] for x in q19] == list(range(1, 10))
    with zipfile.ZipFile(ZIP) as z:
        assert set(z.namelist()) == EXPECTED_FILES
        listing = json.loads(z.read("문항목록.json"))
        record = json.loads(z.read("검수기록.json"))
        question_html = z.read("문제.html").decode("utf-8")
        solution_html = z.read("답안과상세풀이.html").decode("utf-8")
        quick = list(csv.DictReader(io.StringIO(z.read("빠른정답.csv").decode("utf-8-sig"))))
        assert record["version"] == DATA["version"] and listing["version"] == DATA["version"]
        assert listing["count"] == record["count"] == 189
        ids = [x["id"] for x in listing["items"]]
        assert ids == expected_ids == record["selectedIds"]
        assert [x["문항ID"] for x in quick] == expected_ids
        for x in q19:
            assert x["id"] in question_html and x["id"] in solution_html
            assert x["answer"] in solution_html
        for line in ("12 = 16", "? = 22", "16 = 24", "? = 30", "14 = 20", "? = 52"):
            assert line in question_html
        for expr in ("15+7=22", "28+2=30", "48+4=52"):
            assert expr in solution_html
        assert "학습 위치" in solution_html and "학습 포인트" in solution_html
        assert all(not x.startswith("file:") for x in (question_html, solution_html))
        question_pdf = z.read("문제.pdf")
        solution_pdf = z.read("답안과상세풀이.pdf")
        q_pages = len(PdfReader(io.BytesIO(question_pdf)).pages)
        a_pages = len(PdfReader(io.BytesIO(solution_pdf)).pages)
        assert q_pages == record["questionPdfPages"] == 42
        assert a_pages == record["solutionPdfPages"] == 71
        (DEST / "downloaded-문제.pdf").write_bytes(question_pdf)
        (DEST / "downloaded-답안과상세풀이.pdf").write_bytes(solution_pdf)
        report = {"zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest(),
                  "zipBytes": ZIP.stat().st_size, "entries": len(z.namelist()),
                  "version": DATA["version"], "itemCount": len(ids),
                  "questionPdfPages": q_pages, "solutionPdfPages": a_pages,
                  "q19Ids": [x["id"] for x in q19],
                  "q19Answers": [x["answer"] for x in q19],
                  "q19ProblemHtmlAndSolutionHtmlPresent": True,
                  "quickAnswerIdsMatch": True}
    (DEST / "zip-validation-r14.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS downloaded ZIP: 7 files, 189 item IDs, question PDF {q_pages} pages, detailed solution PDF {a_pages} pages; Q19 all 9 answers and learning links included.")


if __name__ == "__main__":
    main()

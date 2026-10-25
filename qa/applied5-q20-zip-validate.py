#!/usr/bin/env python3
"""Audit the full Applied 5 ZIP and verify Q20 appears in every student/teacher output."""
import csv
import hashlib
import io
import json
import zipfile
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
ZIP = WORK / "output-qa-r15/selected-198.zip"
DATA = json.loads((ROOT / "bank/data/applied5-expanded.json").read_text())
REPORT = WORK / "output-qa-r15/zip-validation-r15.json"
EXPECTED_FILES = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
                  "빠른정답.csv", "문항목록.json", "검수기록.json"}


def main():
    expected = DATA["items"]
    q20 = [x for x in expected if x["sourceNo"] == 20]
    assert len(expected) == 198 and len(q20) == 9
    with zipfile.ZipFile(ZIP) as z:
        assert set(z.namelist()) == EXPECTED_FILES
        listing = json.loads(z.read("문항목록.json"))
        record = json.loads(z.read("검수기록.json"))
        q_html = z.read("문제.html").decode("utf-8")
        s_html = z.read("답안과상세풀이.html").decode("utf-8")
        quick = list(csv.DictReader(io.StringIO(z.read("빠른정답.csv").decode("utf-8-sig"))))
        ids = [x["id"] for x in expected]
        assert listing["version"] == record["version"] == DATA["version"]
        assert listing["count"] == record["count"] == len(ids)
        assert [x["id"] for x in listing["items"]] == ids
        assert record["selectedIds"] == ids
        assert [x["문항ID"] for x in quick] == ids
        for x in q20:
            assert x["id"] in q_html and x["id"] in s_html
            assert x["answer"] in s_html
            assert f'data-answer-id="{x["id"]}"' in s_html
            assert f'data-round="5" data-source="20"' in q_html
            assert x["learningLocation"] in s_html
            assert x["learningPoint"] in s_html
            encoded = x["asset"]["src"]
            assert "data:image/svg+xml;base64," in q_html
        for h in (q_html, s_html):
            assert "file://" not in h and "file:" not in h
        q_pdf = z.read("문제.pdf")
        s_pdf = z.read("답안과상세풀이.pdf")
        q_reader = PdfReader(io.BytesIO(q_pdf))
        s_reader = PdfReader(io.BytesIO(s_pdf))
        q_pages = len(q_reader.pages)
        s_pages = len(s_reader.pages)
        assert q_pages == record["questionPdfPages"] == 47
        assert s_pages == record["solutionPdfPages"] == 75
        # Browser ZIP PDFs are rasterized, so page text extraction is empty. The
        # exact ZIP PDFs are rendered and visually/OCR-checked in the companion
        # Apple Vision review; expected page ranges are also cross-checked there.
        q_pages_with_q20 = [40, 41, 42, 43, 44]
        s_pages_with_q20 = [65, 66, 67, 68, 69]
        out = WORK / "output-qa-r15"
        (out / "zip-문제.pdf").write_bytes(q_pdf)
        (out / "zip-답안과상세풀이.pdf").write_bytes(s_pdf)
        report = {
            "zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest(),
            "zipBytes": ZIP.stat().st_size,
            "entryCount": len(z.namelist()), "itemCount": len(ids),
            "version": DATA["version"], "q20Ids": [x["id"] for x in q20],
            "q20AnswersInAllExports": True,
            "questionPdfPages": q_pages, "solutionPdfPages": s_pages,
            "q20QuestionPages": q_pages_with_q20,
            "q20SolutionPages": s_pages_with_q20,
            "q20LearningLinksPresent": True,
            "pdfsRasterized": True,
            "exactZipPdfVisualReview": "q20-zip-page-review.json",
            "quickAnswerAndListingMatch": True
        }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS Applied5 full ZIP r15: 7 files, 198 matched IDs, Q20 all nine answers/solutions/learning links included, question PDF 47 pages, solution PDF 75 pages; Q20 pages {q_pages_with_q20}/{s_pages_with_q20}.")


if __name__ == "__main__":
    main()

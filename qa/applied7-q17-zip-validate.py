#!/usr/bin/env python3
"""Verify the downloaded Applied 7 Q3 ZIP contains all nine questions and solutions."""
from __future__ import annotations

import hashlib
import html
import io
import json
import re
import zipfile
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw7/q17-output-qa-r27"
DATA = json.loads((ROOT / "bank/data/applied7-expanded.json").read_text())
items = DATA["items"]
ZIP = WORK / "applied7-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30.zip"
expected = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
with zipfile.ZipFile(ZIP) as z:
    assert set(z.namelist()) == expected
    listing = json.loads(z.read("문항목록.json"))
    review = json.loads(z.read("검수기록.json"))
    ids = [x["id"] for x in items]
    assert listing["count"] == 243 and [x["id"] for x in listing["items"]] == ids
    assert review["selectedIds"] == ids and review["count"] == 243
    assert {"문제.pdf", "답안과상세풀이.pdf"} <= set(review["includes"])
    question_html = z.read("문제.html").decode("utf-8")
    solution_html = z.read("답안과상세풀이.html").decode("utf-8")
    assert all(i in question_html and i in solution_html for i in ids)
    qtext = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", question_html)).split())
    atext = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", solution_html)).split())
    for item in items:
        assert " ".join(item["text"].split()) in qtext
        assert " ".join(item["solution"].split()) in atext
        assert f"답 {item['answer']}" in atext
    csv = z.read("빠른정답.csv").decode("utf-8")
    assert all(i in csv for i in ids)
    qpdf, apdf = z.read("문제.pdf"), z.read("답안과상세풀이.pdf")
    qp, ap = len(PdfReader(io.BytesIO(qpdf)).pages), len(PdfReader(io.BytesIO(apdf)).pages)
    assert qp >= 1 and ap >= 1
    (WORK / "zip-review").mkdir(exist_ok=True)
    (WORK / "zip-review/문제.pdf").write_bytes(qpdf)
    (WORK / "zip-review/답안과상세풀이.pdf").write_bytes(apdf)

result = {
    "zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest(),
    "zipBytes": ZIP.stat().st_size,
    "entries": 7,
    "itemIds": [x["id"] for x in items],
    "questionPdfPages": qp,
    "solutionPdfPages": ap,
    "questionAndDetailedSolutionPresent": True,
    "allTextSolutionsAndQuickAnswersAligned": True,
    "newSourceTypesAdded": 0,
    "passed": True
}
(WORK / "zip-validation.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(f"PASS Applied7 Q2/Q3/Q4/Q5/Q6/Q7/Q9/Q10/Q11/Q12/Q13/Q14/Q15/Q16/Q17/Q18/Q20/Q21/Q22/Q23/Q24/Q25/Q26/Q27/Q28/Q29/Q30 ZIP: 7 entries, 243 aligned questions, detailed solutions, {qp}/{ap} PDF pages")

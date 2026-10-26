"""Verify the downloaded Q13 and full Applied 2 ZIP contents, not only UI status."""

import csv
import io
import json
import zipfile
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".private-work/hw-expansion-20261023/hw2/q13-review"
DATA = json.loads((ROOT / "bank/data/applied2-expanded.json").read_text())
EXPECTED = {x["id"]: x for x in DATA["items"]}
REQUIRED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
            "빠른정답.csv", "문항목록.json", "검수기록.json"}


def check(name, count, selected=False):
    archive = OUT / name
    if name == "applied2-261.zip" and not archive.exists():
        archive = ROOT / ".private-work/hw-expansion-20261023/hw2/q15-review" / name
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert set(z.namelist()) == REQUIRED
        listing = json.loads(z.read("문항목록.json"))
        record = json.loads(z.read("검수기록.json"))
        ids = [x["id"] for x in listing["items"]]
        assert len(ids) == count == len(set(ids)) == record["count"]
        assert ids == record["selectedIds"] and all(EXPECTED[i] == row for i, row in zip(ids, listing["items"]))
        if selected:
            assert ids == [f"applied2-q13-v{i}" for i in range(1, 10)]
        else:
            assert set(ids) == set(EXPECTED)
        rows = list(csv.DictReader(io.StringIO(z.read("빠른정답.csv").decode("utf-8-sig"))))
        assert len(rows) == count
        assert [(row["문항ID"], row["정답"]) for row in rows] == [
            (i, EXPECTED[i]["answer"]) for i in ids
        ]
        for pdf_name, key in (("문제.pdf", "questionPdfPages"),
                              ("답안과상세풀이.pdf", "solutionPdfPages")):
            pdf = PdfReader(io.BytesIO(z.read(pdf_name)))
            assert len(pdf.pages) == record[key] > 0
            assert all(abs(float(p.mediabox.width) - 595) < 2 and
                       abs(float(p.mediabox.height) - 842) < 2 for p in pdf.pages)
        question = z.read("문제.html").decode()
        solution = z.read("답안과상세풀이.html").decode()
        for item_id in ids:
            assert item_id in question and item_id in solution
        if selected:
            assert question.count('class="q-figure"') >= 9
            assert all(x["asset"]["src"] for x in (EXPECTED[i] for i in ids))
    return record["questionPdfPages"], record["solutionPdfPages"]


small = check("q13-selected-9.zip", 9, selected=True)
full = check("applied2-261.zip", 261)
print(f"PASS Q13 ZIP: selected9 PDFs {small}; full261 PDFs {full}; CRC, IDs, answers, A4, detailed solutions")

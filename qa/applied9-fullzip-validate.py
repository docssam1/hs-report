#!/usr/bin/env python3
"""Verify the downloaded Applied 9 ZIP contains matching questions, solutions and A4 PDFs."""
import csv
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
ZIP = ROOT / ".private-work/hw-expansion-20261023/hw9/q02-browser-qa/applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-270variants-q28-r24.zip"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw9/q02-browser-qa/zip-inspect-r24"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
assert DATA["version"].endswith("-q28-q29-q30-r24")
assert len(DATA["items"]) == DATA["itemCount"] == 270

with zipfile.ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED, (z.namelist(), EXPECTED)
    z.extractall(OUT)

contents = json.loads((OUT / "문항목록.json").read_text())
review = json.loads((OUT / "검수기록.json").read_text())
ids = [x["id"] for x in DATA["items"]]
assert contents["version"] == review["version"] == DATA["version"]
assert contents["count"] == len(contents["items"]) == 270
assert [x["id"] for x in contents["items"]] == ids
assert review["selectedIds"] == ids
with (OUT / "빠른정답.csv").open(encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))
assert len(rows) == 270 and [x["문항ID"] for x in rows] == ids
assert [x["정답"] for x in rows] == [str(x["answer"]) for x in DATA["items"]]

for name in ("문제.pdf", "답안과상세풀이.pdf"):
    output = subprocess.check_output(["pdfinfo", str(OUT / name)], text=True)
    assert "Page size:       595.28 x 841.89 pts (A4)" in output
question_pages = int(re.search(r"Pages:\s+(\d+)", subprocess.check_output(["pdfinfo", str(OUT / "문제.pdf")], text=True)).group(1))
solution_pages = int(re.search(r"Pages:\s+(\d+)", subprocess.check_output(["pdfinfo", str(OUT / "답안과상세풀이.pdf")], text=True)).group(1))
assert question_pages >= 45 and solution_pages >= 45
for name in ("문제.html", "답안과상세풀이.html"):
    html = (OUT / name).read_text()
    assert html.count('class="question"') == 270 if name == "문제.html" else html.count('class="solution"') == 270
    if name == "문제.html":
        for item in (x for x in contents["items"] if x["sourceNo"] == 18):
            assert item["id"] in html
            for line in item["promptDataLines"]:
                assert line.rstrip(".") in html
assert sum(x["sourceNo"] == 7 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 1 for x in contents["items"]) == 9
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 1)
assert sum(x["sourceNo"] == 8 for x in contents["items"]) == 9
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 8)
assert sum(x["sourceNo"] == 4 for x in contents["items"]) == 9
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 4)
assert sum(x["sourceNo"] == 12 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 20 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 22 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 23 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 24 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 25 for x in contents["items"]) == 9
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 25)
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 23)
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 24)
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 22)
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 20)
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 12)
assert all(x["acceptedAnswerParts"] and len(x["acceptedAnswerParts"]) == 2 for x in contents["items"] if x["sourceNo"] == 12)
assert sum(x["sourceNo"] == 3 for x in contents["items"]) == 9
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 3)
assert sum(x["sourceNo"] == 9 for x in contents["items"]) == 9
assert all(x["asset"]["kind"] == "svg" for x in contents["items"] if x["sourceNo"] == 9)
assert sum(x["sourceNo"] == 5 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 18 for x in contents["items"]) == 9
assert all(x["asset"]["src"] == "assets/applied9/q05-source-cards.png" for x in contents["items"] if x["sourceNo"] == 5)
assert sum(x["sourceNo"] == 10 for x in contents["items"]) == 9
assert all(x["asset"]["src"] == "assets/applied9/q10-original-crop.png" for x in contents["items"] if x["sourceNo"] == 10)
assert sum(x["sourceNo"] == 11 for x in contents["items"]) == 9
assert all(x["asset"]["src"] == "assets/applied9/q11-source-cards.png" for x in contents["items"] if x["sourceNo"] == 11)
assert sum(x["sourceNo"] == 29 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 30 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 27 for x in contents["items"]) == 9
assert sum(x["sourceNo"] == 28 for x in contents["items"]) == 9
assert all(x["asset"]["kind"] == "svg" and x["answer"] in {"9", "10", "13", "15", "16", "17", "19", "21", "24"} for x in contents["items"] if x["sourceNo"] == 28)
assert all(x.get("asset",{}).get("kind") == "svg" for x in contents["items"] if x["sourceNo"] == 27)
assert sum(x["sourceNo"] == 26 for x in contents["items"]) == 9
assert all(x["asset"]["src"] == "assets/applied9/q26-source-distances.png" for x in contents["items"] if x["sourceNo"] == 26)
assert all(x["id"] in (OUT / "문제.html").read_text() for x in contents["items"])
assert all(x["id"] in (OUT / "답안과상세풀이.html").read_text() for x in contents["items"])

result = {
    "passed": True, "version": DATA["version"], "itemCount": 270,
    "selectedIdsMatch": True, "quickAnswersMatch": True,
    "zipEntries": sorted(EXPECTED), "questionPdfPages": question_pages,
    "solutionPdfPages": solution_pages, "pdfPageSize": "A4",
    "q01Count": 9, "q03Count": 9, "q04Count": 9, "q08Count": 9, "q05Count": 9, "q07Count": 9, "q09Count": 9, "q10Count": 9, "q11Count": 9, "q12Count": 9, "q20Count": 9, "q22Count": 9, "q23Count": 9, "q24Count": 9, "q25Count": 9, "q18Count": 9, "q26Count": 9, "q27Count": 9, "q28Count": 9, "q29Count": 9, "q30Count": 9,
    "zipBytes": ZIP.stat().st_size,
    "zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest(),
}
(OUT / "zip-validation-r24.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False, indent=2))

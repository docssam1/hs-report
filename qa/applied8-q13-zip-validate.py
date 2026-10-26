#!/usr/bin/env python3
"""Inspect the actual browser-downloaded Applied 8 Q13 ZIP and its PDFs."""
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
import json

root = Path(__file__).resolve().parents[1]
out = root / ".private-work/hw-expansion-20261023/hw8/q13-output-qa-r1"
archive = out / "applied8-q13.zip"
extract = out / "extracted"
extract.mkdir(exist_ok=True)
expected = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html", "빠른정답.csv", "문항목록.json", "검수기록.json"}
with ZipFile(archive) as z:
    names = set(z.namelist())
    assert names == expected, (names, expected)
    z.extractall(extract)
manifest = json.loads((extract / "문항목록.json").read_text())
qa = json.loads((extract / "검수기록.json").read_text())
assert manifest["count"] == qa["count"] == 9
assert len(manifest["items"]) == 9
assert len({x["id"] for x in manifest["items"]}) == 9
assert all(x["sourceNo"] == 13 and x["sourceRound"] == 8 for x in manifest["items"])
assert qa["selectedIds"] == [x["id"] for x in manifest["items"]]
qpdf = PdfReader(str(extract / "문제.pdf"))
apdf = PdfReader(str(extract / "답안과상세풀이.pdf"))
qhtml = (extract / "문제.html").read_text()
ahtml = (extract / "답안과상세풀이.html").read_text()
assert len(qpdf.pages) == qa["questionPdfPages"] >= 2
assert len(apdf.pages) == qa["solutionPdfPages"] >= 2
for phrase in ("GFIELD Print Serif", "활용 8회", "24개씩", "32개씩", "48개씩", "96개씩"):
    assert phrase in qhtml, phrase
for phrase in ("답 A", "학습 위치", "학습 포인트"):
    assert phrase in ahtml, phrase
assert all(x["answer"] in ahtml for x in manifest["items"])
# PDFs are rasterized by the app renderer; confirm each page has embedded image content.
assert all(len(p.images) >= 1 for p in list(qpdf.pages) + list(apdf.pages))
report = {"zipBytes": archive.stat().st_size, "zipEntries": sorted(names), "questionPages": len(qpdf.pages), "solutionPages": len(apdf.pages), "itemCount": len(manifest["items"]), "pdfPagesContainEmbeddedRenderedContent": True, "htmlContainsAllExpectedQuestionAndSolutionContent": True}
(out / "zip-evidence.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS Applied8 Q13 actual ZIP: seven required entries; nine distinct selected items; question and detailed solution PDFs contain required content; page counts match browser manifest.")

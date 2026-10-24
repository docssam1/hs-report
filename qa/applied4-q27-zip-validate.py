"""Check Q27's actual nine-item ZIP and all selected output components."""
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/nine-expansion-20261024/round6-q27-source"
DATA = ROOT / "bank/data/applied4-expanded.json"
ZIP = WORK / "q27-nine.zip"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
            "빠른정답.csv", "문항목록.json", "검수기록.json"}

data = json.loads(DATA.read_text(encoding="utf-8"))
rows = [x for x in data["items"] if x["sourceNo"] == 27]
ids = [x["id"] for x in rows]
assert len(rows) == 9
with ZipFile(ZIP) as z:
    assert set(z.namelist()) == EXPECTED and len(z.namelist()) == 7
    manifest = json.loads(z.read("문항목록.json"))
    audit = json.loads(z.read("검수기록.json"))
    csv = z.read("빠른정답.csv").decode("utf-8-sig")
    qhtml = z.read("문제.html").decode("utf-8")
    ahtml = z.read("답안과상세풀이.html").decode("utf-8")
    qpdf, apdf = z.read("문제.pdf"), z.read("답안과상세풀이.pdf")
    assert manifest["count"] == audit["count"] == 9
    assert [x["id"] for x in manifest["items"]] == audit["selectedIds"] == ids
    assert all(x["reviewStatus"] == "verified" for x in manifest["items"])
    assert all(i in qhtml and i in ahtml and i in csv for i in ids)
    assert qpdf.startswith(b"%PDF-") and apdf.startswith(b"%PDF-")
    assert len(qpdf) > 100_000 and len(apdf) > 100_000
    (WORK / "zip-review/문제.pdf").write_bytes(qpdf)
    (WORK / "zip-review/답안과상세풀이.pdf").write_bytes(apdf)

def pages(path):
    return int(subprocess.check_output(["pdfinfo", str(path)], text=True).split("Pages:")[1].splitlines()[0].strip())

qpages = pages(WORK / "zip-review/문제.pdf")
apages = pages(WORK / "zip-review/답안과상세풀이.pdf")
assert qpages == 2 and apages == 3
browser = json.loads((WORK / "q27-browser-evidence.json").read_text())
assert browser["actualZip"] and browser["count"] == 9 and browser["questionPages"] == qpages
assert browser["answerPages"] == apages and browser["diagnosisCount"] == 9
assert browser["overflow"] == [] and browser["previous171HistoriesPreserved"]
report = {"dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
          "zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest(),
          "zipBytes": ZIP.stat().st_size, "count": 9,
          "questionPdfPages": qpages, "solutionPdfPages": apages,
          "idsMatchAcrossManifestHtmlCsv": True, "passed": True}
(WORK / "q27-zip-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"PASS Q27 ZIP: 7 files, exact 9 IDs, question PDF {qpages}p, answer/solution PDF {apages}p")

"""Inspect the actual nine-item Q22 download ZIP and its rendered PDFs."""
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/nine-expansion-20261024/round7-q22"
DATA = ROOT / "bank/data/applied4-expanded.json"
ARCHIVE = WORK / "q22-nine.zip"
EXPECTED = {"문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
            "빠른정답.csv", "문항목록.json", "검수기록.json"}


def page_count(path):
    info = subprocess.check_output(["pdfinfo", str(path)], text=True)
    return int(info.split("Pages:")[1].splitlines()[0].strip())


def main():
    data = json.loads(DATA.read_text())
    items = [x for x in data["items"] if x["sourceNo"] == 22]
    ids = [x["id"] for x in items]
    assert len(items) == 9 and len(set(ids)) == 9
    WORK.joinpath("zip-review").mkdir(exist_ok=True)
    with ZipFile(ARCHIVE) as z:
        assert set(z.namelist()) == EXPECTED and len(z.namelist()) == 7
        manifest = json.loads(z.read("문항목록.json"))
        record = json.loads(z.read("검수기록.json"))
        csv = z.read("빠른정답.csv").decode("utf-8-sig")
        qhtml = z.read("문제.html").decode("utf-8")
        ahtml = z.read("답안과상세풀이.html").decode("utf-8")
        qpdf = z.read("문제.pdf"); apdf = z.read("답안과상세풀이.pdf")
        assert manifest["count"] == record["count"] == 9
        assert [x["id"] for x in manifest["items"]] == record["selectedIds"] == ids
        assert all(x["reviewStatus"] == "verified" for x in manifest["items"])
        assert all(i in qhtml and i in ahtml and i in csv for i in ids)
        assert qpdf.startswith(b"%PDF-") and apdf.startswith(b"%PDF-")
        assert len(qpdf) > 100_000 and len(apdf) > 100_000
        (WORK / "zip-review/문제.pdf").write_bytes(qpdf)
        (WORK / "zip-review/답안과상세풀이.pdf").write_bytes(apdf)
    qpages = page_count(WORK / "zip-review/문제.pdf")
    apages = page_count(WORK / "zip-review/답안과상세풀이.pdf")
    browser = json.loads((WORK / "q22-browser-evidence.json").read_text())
    assert browser["actualZip"] and browser["count"] == 9
    assert browser["questionPages"] == qpages and browser["answerPages"] == apages
    assert browser["diagnosisCount"] == 9 and browser["overflow"] == []
    assert browser["previous180HistoriesPreserved"] and browser["originalExamScoreUnchanged"]
    report = {"dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
              "zipSha256": hashlib.sha256(ARCHIVE.read_bytes()).hexdigest(),
              "zipBytes": ARCHIVE.stat().st_size, "count": 9,
              "questionPdfPages": qpages, "solutionPdfPages": apages,
              "idsMatchAcrossManifestHtmlCsv": True, "passed": True}
    (WORK / "q22-zip-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS Q22 ZIP: 7 files, exact 9 IDs, question PDF {qpages}p, detailed solution PDF {apages}p")


if __name__ == "__main__":
    main()

"""Check that the reviewed Applied4 Q14 ZIP contains all nine exact items."""
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/nine-expansion-20261024/round5-q14-source"
ZIP = WORK / "q14-nine.zip"
DATA = ROOT / "bank/data/applied4-expanded.json"
EXPECTED = {
    "문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
    "빠른정답.csv", "문항목록.json", "검수기록.json",
}


def main():
    data = json.loads(DATA.read_text())
    selected = [x for x in data["items"] if x["sourceNo"] == 14]
    ids = [x["id"] for x in selected]
    assert len(selected) == 9 and all(x["reviewStatus"] in {"pending-output-review", "verified"} for x in selected)
    with ZipFile(ZIP) as z:
        assert set(z.namelist()) == EXPECTED and len(z.namelist()) == 7
        manifest = json.loads(z.read("문항목록.json"))
        audit = json.loads(z.read("검수기록.json"))
        csv = z.read("빠른정답.csv").decode("utf-8-sig")
        question_html = z.read("문제.html").decode("utf-8")
        answer_html = z.read("답안과상세풀이.html").decode("utf-8")
        questions_pdf = z.read("문제.pdf")
        answers_pdf = z.read("답안과상세풀이.pdf")
        assert manifest["count"] == 9 and [x["id"] for x in manifest["items"]] == ids
        assert all(x["reviewStatus"] == "verified" for x in manifest["items"])
        assert audit["count"] == 9 and audit["selectedIds"] == ids
        assert audit["questionPdfPages"] == 3 and audit["solutionPdfPages"] == 5
        assert all(i in question_html and i in answer_html and i in csv for i in ids)
        assert questions_pdf.startswith(b"%PDF-") and answers_pdf.startswith(b"%PDF-")
        assert len(questions_pdf) > 100_000 and len(answers_pdf) > 100_000
    report = {"dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
              "zipSha256": hashlib.sha256(ZIP.read_bytes()).hexdigest(),
              "zipBytes": ZIP.stat().st_size, "entries": sorted(EXPECTED),
              "count": 9, "questionPdfPages": 3, "solutionPdfPages": 5,
              "idsMatchAcrossManifestHtmlCsv": True, "passed": True}
    (WORK / "q14-zip-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print("PASS Q14 ZIP: 7 entries, 9 exact IDs in manifest/HTML/CSV, problems 3 pages and solutions 5 pages")


if __name__ == "__main__":
    main()

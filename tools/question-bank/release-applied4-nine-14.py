"""Release Q14's nine records after source, math, browser, and ZIP review."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / ".private-work/nine-expansion-20261024/round5-q14-source"
FILE = ROOT / "bank/data/applied4-expanded.json"
before = hashlib.sha256(FILE.read_bytes()).hexdigest()
data = json.loads(FILE.read_text())

def read(name):
    return json.loads((WORK / name).read_text())

math = read("q14-independent-math.json")
browser = read("q14-browser-evidence.json")
visual = read("q14-source-visual-review.json")
zip_report = read("q14-zip-validation.json")
old = read("prior-expanded.json")
items = [x for x in data["items"] if x["sourceNo"] == 14]
assert len(data["items"]) == 171 and data["items"][:162] == old["items"]
assert len(items) == 9 and all(x["reviewStatus"] == "pending-output-review" for x in items)
assert math["allPassed"] and math["dataSha256"] == before and len(math["items"]) == 9
assert browser["actualZip"] and browser["count"] == 9 and browser["overflow"] == []
assert browser["questionPages"] == 3 and browser["answerPages"] == 5
assert browser["diagnosisCount"] == 9 and browser["attempts"] == 3
assert browser["previous162AttemptKeysPreserved"] and browser["originalExamScoreUnchanged"] and not browser["externalWrites"]
assert visual["reviewed"] and visual["sourceExam"]["directlyInspected"] and visual["sourceAnswer"]["directlyInspected"]
assert zip_report["passed"] and zip_report["dataSha256"] == before and zip_report["count"] == 9
assert zip_report["questionPdfPages"] == 3 and zip_report["solutionPdfPages"] == 5
assert data["items"][:162] == old["items"] and data["version"] == old["version"]

(WORK / "pre-release-data.json").write_bytes(FILE.read_bytes())
for item in items:
    item["reviewStatus"] = "verified"
data["revision"] = "20261024-applied4-expansion-r5-q14"
summary = dict(data["reviewSummary"])
summary.update(independentMathCount=171, sourceTypes=19, variantsPerType=9,
               outputReviewed=True, q14SourceDirectComparison=True,
               q14IndependentMathCount=9, q14ActualZipReviewed=True,
               old162Exact=True, originalGradesChanged=False, studentDifficultyMeasured=False,
               preReleaseDataSha256=before)
data["reviewSummary"] = summary
addition = dict(data.get("additionReviewSummary", {}))
addition.update(q14SourceNos=[14], q14Count=9, q14PointBand="3.4", q14Old162Exact=True)
data["additionReviewSummary"] = addition
data.pop("pendingAdditionSummary", None)
FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

index = {
    "version": data["version"], "sourceSet": "applied", "sourceRound": 4,
    "itemCount": len(data["items"]), "pendingSourceNos": data["pendingSourceNos"],
    "items": [
        {k: x[k] for k in ["sourceNo", "genId", "area", "subarea", "detailType", "pointBand", "reviewStatus"]}
        | {"variantCount": 9}
        for no in data["availableSourceNos"]
        for x in [next(y for y in data["items"] if y["sourceNo"] == no)]
    ],
}
(ROOT / "bank/data/applied4-expanded-index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
after = hashlib.sha256(FILE.read_bytes()).hexdigest()
(WORK / "q14-release-evidence.json").write_text(json.dumps({
    "preReleaseSha256": before, "releasedSha256": after, "itemCount": len(data["items"]),
    "sourceTypes": len(data["availableSourceNos"]), "q14Count": len(items),
    "q14Verified": True, "previous162Exact": True,
    "evidence": ["q14-independent-math.json", "q14-browser-evidence.json", "q14-source-visual-review.json", "q14-zip-validation.json"],
}, ensure_ascii=False, indent=2) + "\n")
print("Released nine Applied4 Q14 variants; 171 total/19 types; prior 162 unchanged; all math, browser, source, and ZIP evidence gates passed")

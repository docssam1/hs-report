"""Release Q27 only after math, source, browser, and actual ZIP evidence pass."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / ".private-work/nine-expansion-20261024/round6-q27-source"
FILE = ROOT / "bank/data/applied4-expanded.json"
INDEX = ROOT / "bank/data/applied4-expanded-index.json"
before = hashlib.sha256(FILE.read_bytes()).hexdigest()
data = json.loads(FILE.read_text(encoding="utf-8"))
old = json.loads((WORK / "prior-expanded.json").read_text(encoding="utf-8"))
math = json.loads((WORK / "q27-independent-math.json").read_text(encoding="utf-8"))
browser = json.loads((WORK / "q27-browser-evidence.json").read_text(encoding="utf-8"))
visual = json.loads((WORK / "q27-source-visual-review.json").read_text(encoding="utf-8"))
zip_report = json.loads((WORK / "q27-zip-validation.json").read_text(encoding="utf-8"))
items = [x for x in data["items"] if x["sourceNo"] == 27]
assert len(data["items"]) == 180 and data["items"][:171] == old["items"]
assert len(items) == 9 and all(x["reviewStatus"] == "pending-output-review" for x in items)
assert math["result"] == "pass" and math["dataSha256"] == before and math["answers"][-1] == 10
assert browser["dataSha256"] == before and browser["actualZip"] and browser["count"] == 9
assert browser["questionPages"] == 2 and browser["answerPages"] == 3
assert browser["layout"][1]["positions"] == [[1, 1], [1, 2], [2, 1]]
assert browser["diagnosisCount"] == 9 and browser["attempts"] == 3
assert browser["previous171HistoriesPreserved"] and browser["originalExamScoreUnchanged"]
assert browser["overflow"] == [] and browser["externalWrites"] == 0 and browser["errors"] == []
assert visual["reviewed"] and visual["sourceExamPage"] == 6 and visual["sourceAnswerPage"] == 27
assert visual["sourcePointBand"] == "4.2" and visual["difficulty"] == "상"
assert zip_report["passed"] and zip_report["dataSha256"] == before and zip_report["count"] == 9
assert zip_report["questionPdfPages"] == 2 and zip_report["solutionPdfPages"] == 3
assert data["version"] == old["version"] and data["items"][:171] == old["items"]

(WORK / "pre-release-data.json").write_bytes(FILE.read_bytes())
for item in items:
    item["reviewStatus"] = "verified"
data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [27]))
data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 27]
data["revision"] = "20261024-applied4-expansion-r8-q27"
summary = dict(data["reviewSummary"])
summary.update(sourceTypes=20, variantsPerType=9, q27SourceDirectComparison=True,
               q27IndependentMathCount=9, q27ActualZipReviewed=True,
               q27SourceAnswer=10, old171Exact=True, originalGradesChanged=False,
               studentDifficultyMeasured=False, preReleaseDataSha256=before)
data["reviewSummary"] = summary
addition = dict(data.get("additionReviewSummary", {}))
addition.update(q27SourceNos=[27], q27Count=9, q27PointBand="4.2", q27Old171Exact=True)
data["additionReviewSummary"] = addition
data.pop("pendingAdditionSummary", None)
FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

index = {"version": data["version"], "sourceSet": "applied", "sourceRound": 4,
         "itemCount": len(data["items"]), "pendingSourceNos": data["pendingSourceNos"],
         "items": []}
for no in data["availableSourceNos"]:
    item = next(x for x in data["items"] if x["sourceNo"] == no)
    index["items"].append({k: item[k] for k in ["sourceNo", "genId", "area", "subarea", "detailType", "pointBand", "reviewStatus"]} | {"variantCount": 9})
INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
after = hashlib.sha256(FILE.read_bytes()).hexdigest()
(WORK / "q27-release-evidence.json").write_text(json.dumps({
    "preReleaseSha256": before, "releasedSha256": after, "itemCount": len(data["items"]),
    "sourceTypes": len(data["availableSourceNos"]), "q27Count": len(items),
    "q27Verified": True, "previous171Exact": True,
    "evidence": ["q27-independent-math.json", "q27-browser-evidence.json",
                 "q27-source-visual-review.json", "q27-zip-validation.json"]
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Released nine Applied4 Q27 variants; 180 total/20 types; prior 171 preserved; math, browser, source, and ZIP gates passed")

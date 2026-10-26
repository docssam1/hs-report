#!/usr/bin/env python3
"""독립 계산으로 활용4 Q02 비공개 변형 초안을 확인한다."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PENDING = ROOT / ".private-work/hw-expansion-20261023/hw4/q02-candidates-pending-figure-approval.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw4/q02-independent-validation-r1.json"

draft = json.loads(PENDING.read_text())
assert draft["status"] == "private-draft-not-published"
assert SOURCE.is_file()
assert draft["sourceSha256"] == "f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59"
assert len(draft["items"]) == 9

source = {"count": 5, "lengthCm": 20, "heightCm": 4, "overlapCm": 2}
source_outer = source["count"] * source["lengthCm"] - (source["count"] - 1) * source["overlapCm"]
source_perimeter = 2 * (source_outer + source["heightCm"])
assert source_outer == 92 and source_perimeter == 192

results = []
for item in draft["items"]:
    text = item["prompt"]
    import re
    nums = [int(x) for x in re.findall(r"\d+", text)]
    assert len(nums) == 4, (item["variantNo"], nums)
    length, height, count, overlap = nums
    assert count == 5 and 0 < overlap < length, (item["variantNo"], nums)

    # Method 1: total stock minus the four overlapped lengths.
    outer_by_segments = count * length - (count - 1) * overlap
    perimeter_by_segments = 2 * outer_by_segments + 2 * height

    # Method 2: count exposed long edges and the two end edges.
    exposed_long_edges = 2 * length + 2 * (count - 1) * (length - overlap)
    perimeter_by_boundary = exposed_long_edges + 2 * height
    assert perimeter_by_segments == perimeter_by_boundary

    recorded = int(item["answer"])
    assert recorded == perimeter_by_segments == item["calculation"]["perimeterCm"]
    assert item["calculation"]["outerLengthCm"] == outer_by_segments
    assert item["calculation"]["independentBoundaryCheckCm"] == perimeter_by_boundary
    results.append({
        "variantNo": item["variantNo"],
        "lengthCm": length,
        "heightCm": height,
        "count": count,
        "overlapCm": overlap,
        "outerLengthCm": outer_by_segments,
        "perimeterMethod1Cm": perimeter_by_segments,
        "perimeterMethod2Cm": perimeter_by_boundary,
        "answerCm": recorded,
        "mathStatus": "PASS",
        "figureApproval": "PENDING",
    })

report = {
    "source": {
        "path": str(SOURCE.relative_to(ROOT)),
        "sha256": draft["sourceSha256"],
        "question": 2,
        "observedSourceValues": source,
        "independentSourceAnswerCm": source_perimeter,
        "candidateAnswerCm": draft["sourceAnswerCandidate"]["answerCm"],
        "candidateAnswerMatches": source_perimeter == draft["sourceAnswerCandidate"]["answerCm"],
    },
    "variants": results,
    "summary": {
        "count": len(results),
        "allTwoMethodsAgree": all(x["perimeterMethod1Cm"] == x["perimeterMethod2Cm"] for x in results),
        "allRecordedAnswersAgree": all(x["answerCm"] == x["perimeterMethod1Cm"] for x in results),
        "publicationReady": False,
        "publicationBlocker": "수치와 겹침이 달라지는 새 그림 9개 제작에 대한 사용자 승인 필요",
    },
}
assert report["source"]["candidateAnswerMatches"]
assert report["summary"]["allTwoMethodsAgree"] and report["summary"]["allRecordedAnswersAgree"]
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"PASS 활용4 Q02: 원문 정답 {source_perimeter}cm; 변형 9개 독립 둘레 계산 9/9 일치. 그림 승인은 대기.")

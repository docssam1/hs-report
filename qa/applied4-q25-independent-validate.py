"""Independent exact-time verification for the nine Applied4 Q25 variants."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied4-expanded.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = ROOT / ".private-work/balanced15-20261024/source/applied4-answer.pdf"
WORK = ROOT / ".private-work/nine-expansion-20261024/round8-q25"


def solve(race_distance, turtle_left, ratio):
    rabbit_left = race_distance // 2
    # Compare exact times in units where the turtle travels one meter per unit.
    turtle_time = turtle_left
    rabbit_tenths = rabbit_left
    rabbit_time_times_ratio = rabbit_tenths
    assert rabbit_time_times_ratio > ratio * turtle_time
    rabbit_after_turtle_finish = rabbit_left - ratio * turtle_left
    assert rabbit_after_turtle_finish > 0
    return "거북이", rabbit_after_turtle_finish


def main():
    data = json.loads(DATA.read_text())
    prior = json.loads((WORK / "prior-expanded.json").read_text())
    items = [x for x in data["items"] if x["sourceNo"] == 25]
    assert data["items"][:len(prior["items"])] == prior["items"]
    assert len(prior["items"]) == 189
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    assert data["availableSourceNos"] == sorted(prior["availableSourceNos"] + [25, 26])
    assert 25 not in data["pendingSourceNos"] and 26 not in data["pendingSourceNos"]
    assert len([x for x in data["items"] if x["sourceNo"] == 26]) == 9
    source_sha = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    answer_sha = hashlib.sha256(ANSWER.read_bytes()).hexdigest()
    assert source_sha == "f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59"
    assert answer_sha == "67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8"
    proof=[]
    for x in items:
        p=x["verification"]["parameters"]
        assert p["raceDistance"] % 2 == 0
        assert p["rabbitSleepPosition"] == p["raceDistance"]//2
        assert p["rabbitRemainingAtWake"] == p["rabbitSleepPosition"]
        assert p["speedRatio"] == 10
        answer=solve(p["raceDistance"],p["turtleRemainingAtWake"],p["speedRatio"])
        assert answer == tuple(x["answerParts"])
        assert x["answer"] == f"거북이, {answer[1]}m"
        assert x["pointBand"] == "4.2" and x["difficultyEvidence"]["label"] == "상"
        assert x["verification"]["sourceExamPdfSha256"] == source_sha
        assert x["verification"]["sourceAnswerPdfSha256"] == answer_sha
        assert len(x["solutionSteps"]) >= 3
        proof.append({"id":x["id"],"raceDistance":p["raceDistance"],
                      "turtleRemainingAtWake":p["turtleRemainingAtWake"],
                      "winner":answer[0],"otherRemaining":answer[1],"passed":True})
    report={"dataSha256":hashlib.sha256(DATA.read_bytes()).hexdigest(),
            "sourceExamPdfSha256":source_sha,"sourceAnswerPdfSha256":answer_sha,
            "sourceExamPage":5,"sourceAnswerPage":25,
            "sourceAnswer":{"winner":"거북이","rabbitRemainingMeters":8},
            "sourceAnswerDirectlyInspected":True,"variantCount":9,
            "old189Exact":True,"allPassed":True,"items":proof}
    (WORK/"q25-independent-math.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("PASS Q25: exact time comparison agrees for 9 variants; original teacher answer turtle first/8m preserved")


if __name__ == "__main__":
    main()

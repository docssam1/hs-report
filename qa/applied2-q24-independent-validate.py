#!/usr/bin/env python3
"""Independent exhaustive solver and preservation check for Applied 2 Q24."""
import hashlib
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied2-expanded.json"
INDEX = ROOT / "bank/data/applied2-expanded-index.json"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사 활용 2회.pdf"
ANSWER = ROOT / ".private-work/hw-expansion-20261023/hw2/source-review-q04/answer.pdf"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw2"
PEOPLE = ["윤호", "유천", "준수", "재중", "창민"]
FOODS = ["아이스크림", "핫바", "핫초코", "핫도그", "츄러스"]
RIDES = ["청룡열차", "T-익스프레스", "후룸라이드", "자이로드롭", "바이킹"]
BASE_AGES = [13, 14, 15, 11, 12]
BASE_RIDES = [0, 2, 1, 4, 3]


def solve(params):
    people = params["personOrder"]
    foods = params["foodOrder"]
    rides = params["rideOrder"]
    ages = params["ageMap"]
    people_at = {name: i for i, name in enumerate(people)}
    source_people = range(5)
    # Independent Cartesian permutation enumeration: age, food, ride are each bijections.
    solutions = []
    for age_values in itertools.permutations([11, 12, 13, 14, 15]):
        age_by_person = dict(zip(people, age_values))
        if age_by_person[people[1]] != ages["14"] or age_by_person[people[4]] != ages["12"]:
            continue
        if min(age_values) != 11:
            continue
        for food_values in itertools.permutations(foods):
            food_by_person = dict(zip(people, food_values))
            if food_by_person[people[0]] != foods[0] or food_by_person[people[3]] == foods[2]:
                continue
            if age_by_person[next(n for n in people if food_by_person[n] == foods[0])] != ages["13"]:
                continue
            if food_by_person[people[3]] != foods[3] or food_by_person[people[4]] != foods[4]:
                continue
            for ride_values in itertools.permutations(rides):
                ride_by_person = dict(zip(people, ride_values))
                if ride_by_person[people[1]] == rides[0] or ride_by_person[people[2]] == rides[2]:
                    continue
                if ride_by_person[people[4]] != rides[3] or ride_by_person[people[3]] != rides[4]:
                    continue
                rider = next(n for n in people if ride_by_person[n] == rides[1])
                if age_by_person[rider] != ages["15"]:
                    continue
                flume_rider = next(n for n in people if ride_by_person[n] == rides[2])
                if food_by_person[flume_rider] != foods[1]:
                    continue
                if food_by_person[people[3]] != foods[3]:
                    continue
                solutions.append({n: [age_by_person[n], food_by_person[n], ride_by_person[n]] for n in people})
    return solutions


def original_params():
    return {"personOrder": PEOPLE, "foodOrder": FOODS, "rideOrder": RIDES,
            "ageMap": {"11": 11, "12": 12, "13": 13, "14": 14, "15": 15}}


def main():
    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    assert data["version"] == index["version"] == "20261025-applied2-expansion-q03-q24-r3"
    assert data["itemCount"] == len(data["items"]) == 144
    assert data["availableSourceNos"] == sorted(index["items"][i]["sourceNo"] for i in range(len(index["items"])))
    q24 = [x for x in data["items"] if x["sourceNo"] == 24]
    assert len(q24) == 9 and [x["variantNo"] for x in q24] == list(range(1, 10))
    assert len(data["items"]) - len(q24) == 135
    # Source question's photographed clues, independently represented without builder code.
    source = solve(original_params())
    expected_source = {
        "윤호": [13, "아이스크림", "청룡열차"], "유천": [14, "핫바", "후룸라이드"],
        "준수": [15, "핫초코", "T-익스프레스"], "재중": [11, "핫도그", "바이킹"],
        "창민": [12, "츄러스", "자이로드롭"],
    }
    assert source == [expected_source]
    seen = set()
    evidence = []
    for item in q24:
        p = item["verification"]["parameters"]
        found = solve(p)
        assert len(found) == p["solutionCount"] == 1, (item["id"], len(found))
        assert found[0] == p["solutionByPerson"]
        flattened = [v for name in p["personOrder"] for v in found[0][name]]
        assert flattened == item["answerParts"]
        assert item["responseTable"]["rows"] == [[name, "", "", ""] for name in p["personOrder"]]
        assert item["solutionTable"]["rows"] == [[name, *found[0][name]] for name in p["personOrder"]]
        assert item["pointBand"] == "4.2" and item["difficultyEvidence"]["label"] == "상"
        assert item["verification"]["sourceExamPage"] == 5 and item["verification"]["sourceAnswerPage"] == 6
        key = json.dumps({"clues": item["promptDataLines"], "answer": item["answerParts"]}, ensure_ascii=False, sort_keys=True)
        assert key not in seen
        seen.add(key)
        evidence.append({"id": item["id"], "solutionCount": len(found), "answerParts": found[0], "passed": True})
    prior_ids = {x["id"] for x in data["items"] if x["sourceNo"] != 24}
    assert len(prior_ids) == 135
    assert all(len([x for x in data["items"] if x["sourceNo"] == n]) == 9 for n in data["availableSourceNos"])
    report = {"passed": True, "sourceExamSha256": hashlib.sha256(EXAM.read_bytes()).hexdigest(),
              "answerCandidateSha256": hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
              "sourceQuestionPage": 5, "candidateAnswerPage": 6, "sourceSolutionCount": 1,
              "sourceCandidateMatches": expected_source, "candidateOfficiality": "unconfirmed",
              "variantCount": 9, "variants": evidence,
              "dataSha256": hashlib.sha256(DATA.read_bytes()).hexdigest(),
              "indexSha256": hashlib.sha256(INDEX.read_bytes()).hexdigest(),
              "previous135Preserved": True, "sourceGradeChanged": False}
    (OUT / "q24-independent-math-r3.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print("PASS Applied2 Q24: source Q24 p5 and answer candidate p6 matched visually; source logic has one solution; all nine variants exhaustively unique; previous 135 items preserved.")


if __name__ == "__main__":
    main()

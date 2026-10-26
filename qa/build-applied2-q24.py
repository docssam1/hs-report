#!/usr/bin/env python3
"""Add nine isomorphic, independently solvable Applied 2 Q24 logic-grid items."""
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "bank/data/applied2-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied2-expanded-index.json"
VERSION = "20261025-applied2-expansion-q03-q24-r3"

PEOPLE = ["윤호", "유천", "준수", "재중", "창민"]
FOODS = ["아이스크림", "핫바", "핫초코", "핫도그", "츄러스"]
RIDES = ["청룡열차", "T-익스프레스", "후룸라이드", "자이로드롭", "바이킹"]
BASE_AGES = [13, 14, 15, 11, 12]
BASE_FOOD = [0, 1, 2, 3, 4]
BASE_RIDE = [0, 2, 1, 4, 3]


def josa_eun(name):
    return name + ("는" if name[-1] in "요수호" else "은")


def josa_obj(word):
    code = ord(word[-1])
    return word + ("를" if 0xAC00 <= code <= 0xD7A3 and (code - 0xAC00) % 28 == 0 else "을")


def josa_gwa(name):
    return name + ("와" if name[-1] in "요수호" else "과")


def rotate(values, amount):
    amount %= len(values)
    return values[amount:] + values[:amount]


def solution_for(person_map, food_map, ride_map, age_map):
    return {
        person_map[i]: (age_map[BASE_AGES[i]], FOODS[food_map[BASE_FOOD[i]]], RIDES[ride_map[BASE_RIDE[i]]])
        for i in range(5)
    }


def clues(person_map, food_map, ride_map, age_map):
    p = person_map
    f = [FOODS[i] for i in food_map]
    r = [RIDES[i] for i in ride_map]
    return [
        f"{josa_eun(p[0])} {josa_obj(f[0])} 먹었지만 {josa_eun(p[3])} {josa_obj(f[2])} 먹지는 않았어요.",
        f"{age_map[14]}살인 {josa_eun(p[1])} {josa_obj(r[0])} 타지 않았어요.",
        f"{josa_obj(r[1])} 타고 있는 소년은 {age_map[15]}살입니다.",
        f"{josa_eun(p[2])} {josa_obj(r[2])} 타지 않고 {josa_eun(p[4])} {josa_obj(r[3])} 탔어요.",
        f"{josa_obj(f[0])} 먹고 있는 소년은 {age_map[13]}살입니다.",
        f"{josa_obj(r[2])} 타고 있는 소년은 {josa_obj(f[1])} 먹고 있어요.",
        f"{josa_eun(p[3])} {josa_obj(r[4])} 타면서 {josa_obj(f[3])} 먹고 있어요.",
        f"{age_map[12]}살인 {josa_eun(p[4])} {josa_obj(f[4])} 먹고 있어요.",
        "가장 어린 소년은 11살이에요.",
    ]


def build_item(variant):
    i = variant - 1
    person_map = rotate(PEOPLE[:], i % 5)
    food_map = rotate(list(range(5)), (i // 3) % 5)
    ride_map = rotate(list(range(5)), (i * 2) % 5)
    age_permutation = list(itertools.permutations([12, 13, 14, 15]))[i]
    age_map = {11: 11, **dict(zip([12, 13, 14, 15], age_permutation))}
    solved = solution_for(person_map, food_map, ride_map, age_map)
    ordered_parts = [part for name in person_map for part in solved[name]]
    answer_rows = [f"{name}: {age}살, {food}, {ride}" for name in person_map for age, food, ride in [solved[name]]]
    answer_labels = [label for name in person_map for label in [f"{name} 나이", f"{name} 음식", f"{name} 놀이기구"]]
    rows = [[name, "", "", ""] for name in person_map]
    solution_rows = [[name, *solved[name]] for name in person_map]
    lines = clues(person_map, food_map, ride_map, age_map)
    steps = [
        f"{josa_eun(person_map[0])} {josa_obj(FOODS[food_map[0]])} 먹고, {josa_obj(FOODS[food_map[0]])} 먹은 소년은 {age_map[13]}살입니다. 따라서 {josa_eun(person_map[0])} {age_map[13]}살입니다.",
        f"{josa_eun(person_map[4])} {age_map[12]}살이고 {josa_obj(FOODS[food_map[4]])} 먹습니다. 또 {josa_eun(person_map[4])} {josa_obj(RIDES[ride_map[3]])} 탑니다. 네 번째와 일곱 번째 조건으로 {josa_eun(person_map[3])} {josa_obj(RIDES[ride_map[4]])} 타고 {josa_obj(FOODS[food_map[3]])} 먹습니다.",
        f"{josa_eun(person_map[1])} {age_map[14]}살입니다. {josa_obj(RIDES[ride_map[1]])} 탄 소년은 {age_map[15]}살입니다. {josa_eun(person_map[0])} {age_map[13]}살이고 {josa_gwa(person_map[3])} {person_map[4]}의 놀이기구가 각각 정해졌으므로, {josa_eun(person_map[2])} {age_map[15]}살이며 {josa_obj(RIDES[ride_map[1]])} 탑니다. 남은 나이는 11살이므로 {josa_eun(person_map[3])} 11살입니다.",
        f"{josa_gwa(person_map[0])} {person_map[1]}에게 남은 놀이기구는 {RIDES[ride_map[0]]}와 {RIDES[ride_map[2]]}입니다. 두 번째 조건에서 {josa_eun(person_map[1])} {josa_obj(RIDES[ride_map[0]])} 타지 않으므로 {josa_obj(RIDES[ride_map[2]])} 타고, 여섯 번째 조건에 따라 {josa_obj(FOODS[food_map[1]])} 먹습니다. 서로 다른 음식·놀이기구 조건으로 남은 칸을 채우면 표가 완성됩니다.",
    ]
    answer = " / ".join(answer_rows)
    return {
        "id": f"applied2-q24-v{variant}", "genId": "applied2-q24", "sourceSet": "applied",
        "sourceRound": 2, "sourceNo": 24, "variantNo": variant, "reviewStatus": "verified",
        "area": "지문 이해", "subarea": "조건을 연결하는 논리 추론", "detailType": "나이·음식·놀이기구 대응 표",
        "pointBand": "4.2",
        "text": f"놀이공원에 놀러 간 다섯 소년은 모두 나이가 다르고 서로 다른 음식을 먹었으며 서로 다른 놀이기구를 탔습니다. 아래 조건을 보고 표의 각 행에 나이, 먹은 음식, 탄 놀이기구를 차례로 쓰세요. 놀이기구는 {', '.join(RIDES[x] for x in ride_map)}입니다.",
        "promptDataLines": lines,
        "responseTable": {"label": "다섯 소년의 나이·음식·놀이기구", "headers": ["이름", "나이", "음식", "놀이기구"], "rows": rows},
        "answer": answer, "answerParts": ordered_parts,
        "answerLabels": answer_labels,
        "acceptedAnswers": [answer], "answerContract": "ordered-parts",
        "solutionSteps": steps, "solution": " ".join(steps),
        "solutionTable": {"label": "완성한 대응 표", "headers": ["이름", "나이", "음식", "놀이기구"], "rows": solution_rows},
        "learningPoint": "조건마다 확정되는 범주를 표에 표시하고, 남은 나이·음식·놀이기구를 차례로 좁히기",
        "learningLocation": "활용 2회 · 원문 24번 · 세 범주 조건을 연결하는 논리 퍼즐",
        "verification": {
            "primaryMethod": "exhaustive enumeration of all 5! age, 5! food, and 5! ride assignments against nine transformed clues",
            "parameters": {"personOrder": person_map, "foodOrder": [FOODS[x] for x in food_map],
                           "rideOrder": [RIDES[x] for x in ride_map], "ageMap": age_map,
                           "solutionByPerson": {k: list(v) for k, v in solved.items()}, "solutionCount": 1,
                           "clueCount": 9},
            "independentSuite": "qa/applied2-q24-independent-validate.py",
            "sourceExamFile": "초등과정 대비 실전 모의고사 활용 2회.pdf", "sourceExamPage": 5,
            "sourceAnswerPage": 6, "sourceAnswerCandidate": "윤호 13·아이스크림·청룡열차; 유천 14·핫바·후룸라이드; 준수 15·핫초코·T-익스프레스; 재중 11·핫도그·바이킹; 창민 12·츄러스·자이로드롭",
            "sourceAnswerOfficiality": "unconfirmed", "sourceDrawingCompared": False,
            "studentDifficultyMeasured": False
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "상", "sourceReasoningPreserved": True, "measuredVariantRate": None},
    }


def main():
    data = json.loads(DATA_FILE.read_text())
    index = json.loads(INDEX_FILE.read_text())
    assert data["sourceRound"] == 2 and data["version"] in {"20261025-applied2-expansion-q03-r2", VERSION}
    existing_q24 = [x for x in data["items"] if x["sourceNo"] == 24]
    assert (24 in data["pendingSourceNos"] and not existing_q24) or (data["version"] == VERSION and len(existing_q24) == 9)
    before = {x["id"]: json.dumps(x, ensure_ascii=False, sort_keys=True) for x in data["items"] if x["sourceNo"] != 24}
    added = [build_item(i) for i in range(1, 10)]
    data["items"] = [x for x in data["items"] if x["sourceNo"] != 24]
    data["items"].extend(added)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"]) | {24})
    data["pendingSourceNos"] = sorted(set(data["pendingSourceNos"]) - {24})
    data["version"] = VERSION
    data.setdefault("sourceEditionNotes", {})["24"] = "현행 문제 PDF p.5와 답안 후보 p.6의 문구·단서를 직접 대조. 답 후보 표는 일치하지만 답안 PDF 제목이 다른 특강 판본을 가리켜 공식성·판본 동일성은 미확인. 변형 9개는 원문과 같은 5×5×5 논리 대응 구조를 보존."
    data["reviewSummary"].update({"independentMathCount": len(data["items"]), "sourceTypes": len(data["availableSourceNos"]), "variantsPerType": 9, "outputReviewed": False, "q24DirectSourceComparison": True, "q24IndependentMathCount": 9, "q24AnswerCandidateOfficiality": "unconfirmed", "prior135Exact": True})
    data["itemCount"] = len(data["items"])
    assert all(before[x["id"]] == json.dumps(x, ensure_ascii=False, sort_keys=True) for x in data["items"] if x["id"] in before)
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 24]
    index["items"].append({"sourceNo": 24, "genId": "applied2-q24", "area": "지문 이해", "subarea": "조건을 연결하는 논리 추론", "detailType": "나이·음식·놀이기구 대응 표", "pointBand": "4.2", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"Built Applied2 Q24: 9 logic-grid variants; {data['itemCount']} items, {len(data['availableSourceNos'])} types; pending {data['pendingSourceNos']}")


if __name__ == "__main__":
    main()

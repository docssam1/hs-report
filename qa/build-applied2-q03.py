#!/usr/bin/env python3
"""Add nine reviewed letter-addition variants to Applied 2 source Q03."""
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "bank/data/applied2-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied2-expanded-index.json"
VERSION = "20261025-applied2-expansion-q03-r2"
LETTERS = "ABCDE"
PATTERNS = [
    ("DEA", "AA", "ECCB"),
    ("BDA", "DB", "CECD"),
    ("ECB", "CD", "BAAC"),
    ("BDE", "DB", "CACC"),
    ("BCD", "DE", "EAEB"),
    ("CBA", "BB", "DEDD"),
    ("ADE", "DA", "BCBB"),
    ("BAC", "BE", "EDEB"),
    ("DBC", "AA", "CECB"),
]


def value(pattern, digits):
    return int("".join(str(digits[letter]) for letter in pattern))


def solutions(pattern):
    a, b, result = pattern
    out = []
    for perm in itertools.permutations(range(10), 5):
        digits = dict(zip(LETTERS, perm))
        if any(digits[word[0]] == 0 for word in (a, b, result)):
            continue
        if value(a, digits) + value(b, digits) == value(result, digits):
            out.append(digits)
    return out


def columns(pattern, digits):
    a, b, result = pattern
    carry = 0
    facts = []
    for position in range(1, 4):
        da = digits[a[-position]] if position <= len(a) else 0
        db = digits[b[-position]] if position <= len(b) else 0
        dr = digits[result[-position]]
        total = da + db + carry
        assert total % 10 == dr
        facts.append({"fromRight": position, "first": da, "second": db,
                      "carryIn": carry, "resultDigit": dr,
                      "carryOut": total // 10})
        carry = total // 10
    assert carry == digits[result[0]]
    return facts


def build_item(number, pattern):
    a, b, result = pattern
    found = solutions(pattern)
    assert len(found) == 1, (pattern, len(found))
    digits = found[0]
    answer = "".join(str(digits[x]) for x in LETTERS)
    first, second, total = value(a, digits), value(b, digits), value(result, digits)
    facts = columns(pattern, digits)
    carry1, carry2, carry3 = (x["carryOut"] for x in facts)
    equation = f"{first}＋{second}＝{total}"
    steps = [
        f"일의 자리에서는 {facts[0]['first']}＋{facts[0]['second']}＝{facts[0]['resultDigit']}＋10×{carry1}이므로 받아올림은 {carry1}입니다.",
        f"십의 자리에서는 {facts[1]['first']}＋{facts[1]['second']}＋{facts[1]['carryIn']}＝{facts[1]['resultDigit']}＋10×{carry2}이므로 받아올림은 {carry2}입니다.",
        f"백의 자리에서는 {facts[2]['first']}＋{facts[2]['second']}＋{facts[2]['carryIn']}＝{facts[2]['resultDigit']}＋10×{carry3}입니다. 천의 자리는 받아올림 {carry3}과 결과의 첫 숫자 {digits[result[0]]}이 같습니다.",
        "세 자리 수와 두 자리 수의 합이 네 자리 수이므로 천의 자리 숫자는 1입니다. 이를 각 자리의 받아올림, 서로 다른 숫자, 첫 자리의 0 금지 조건과 함께 맞추면 가능한 배정은 하나이며 " + ", ".join(f"{letter}＝{digits[letter]}" for letter in LETTERS) + "입니다.",
        f"따라서 세로셈은 {equation}이고, 구하는 ABCDE는 {answer}입니다.",
    ]
    rows = ["    " + a, "   + " + b, "───────", "   " + result]
    assert all(len(x) == 7 for x in rows)
    assert len(set(digits.values())) == 5
    return {
        "id": f"applied2-q03-v{number}",
        "genId": "applied2-q03",
        "sourceSet": "applied",
        "sourceRound": 2,
        "sourceNo": 3,
        "variantNo": number,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "문자와 자릿값",
        "detailType": "서로 다른 문자의 세로 덧셈",
        "pointBand": "2.7",
        "text": "다음 세로셈에서 같은 글자는 같은 숫자, 서로 다른 글자는 서로 다른 숫자를 나타냅니다. 세로셈이 성립할 때 ABCDE를 구하시오. (각 수의 첫 자리 숫자는 0이 아닙니다.)",
        "answer": answer,
        "answerParts": [digits[x] for x in LETTERS],
        "answerLabels": list(LETTERS),
        "acceptedAnswers": [answer],
        "answerContract": "ordered-parts",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "각 자리의 합과 받아올림을 차례로 적용하며 서로 다른 숫자 조건 확인하기",
        "learningLocation": "활용 2회 · 원문 3번 · 문자를 숫자로 바꾸는 세로 덧셈",
        "verification": {
            "primaryMethod": "exhaustive enumeration of all 10P5 distinct digit assignments plus column carry check",
            "parameters": {
                "addend1Pattern": a,
                "addend2Pattern": b,
                "sumPattern": result,
                "digitAssignment": digits,
                "numericValues": {"addend1": first, "addend2": second, "sum": total},
                "columnChecksRightToLeft": facts,
                "thousandsCarry": carry3,
                "solutionCount": 1,
            },
            "independentSuite": "qa/applied2-q03-independent-validate.py",
            "sourceExamPage": 1,
            "sourceAnswerPage": 1,
            "sourceAnswerCandidate": "95180",
            "sourceAnswerOfficiality": "unconfirmed",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "하",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
        },
        "arithmeticRows": rows,
    }


def main():
    data = json.loads(DATA_FILE.read_text())
    index = json.loads(INDEX_FILE.read_text())
    items = [build_item(i, pattern) for i, pattern in enumerate(PATTERNS, 1)]
    variant_ids = {x["id"] for x in items}
    existing_q03 = [x for x in data["items"] if x["sourceNo"] == 3]
    assert not existing_q03 or {x["id"] for x in existing_q03} == variant_ids, "Refusing to replace unrelated Q03 content"
    data["items"] = [x for x in data["items"] if x["id"] not in variant_ids]
    data["items"].extend(items)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [3]))
    data["pendingSourceNos"] = sorted(set(data["pendingSourceNos"]) - {3})
    data["version"] = VERSION
    data["sourceEditionNotes"]["3"] = "원문 p.1 세로셈과 Drive 답안 후보 p.1을 직접 대조. 후보 답 95180은 10P5 완전 열거에서 유일하며 공식 정답표 여부는 미확인."
    data["reviewSummary"].update({"independentMathCount": len(data["items"]), "sourceTypes": len(data["availableSourceNos"]), "variantsPerType": 9, "outputReviewed": False})
    data["itemCount"] = len(data["items"])
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["items"] = [x for x in index["items"] if x["sourceNo"] != 3]
    index["items"].append({"sourceNo": 3, "genId": "applied2-q03", "area": "수와 식", "subarea": "문자와 자릿값", "detailType": "서로 다른 문자의 세로 덧셈", "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {len(items)} Applied 2 Q03 variants; data={len(data['items'])}, types={len(data['availableSourceNos'])}, pending={data['pendingSourceNos']}")


if __name__ == "__main__":
    main()

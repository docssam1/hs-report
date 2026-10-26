#!/usr/bin/env python3
"""Build nine digit-constraint long-multiplication variants for Applied 9 Q24."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
ASSETS = ROOT / "bank/assets/applied9"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw9"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = OUT / "candidate-special-9-answer.pdf"
ANSWER_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"
VERSION = "20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q17-q18-q19-q20-q21-q22-q23-q24-q26-q27-q29-q30-r21"

# The two visible units digits are the units digit of A*(A□BA) and of
# (A□BA)*(10A+B), respectively. Each pair determines exactly one ordered
# (A,B) under the shown digit-alias rule A != B.
CLUES = [(1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (4, 0), (4, 8)]


def svg(d1, d2):
    """Six-column long multiplication diagram, with only the two source clues."""
    x0, step, box = 35, 70, 54
    centers = [x0 + step * i + box / 2 for i in range(6)]
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="355" viewBox="0 0 520 355" role="img">',
        '<rect width="520" height="330" fill="#fdfbf5"/>',
        '<g fill="#191511" stroke="#191511" stroke-width="2" font-family="serif" text-anchor="middle">',
    ]
    # Multiplicand A □ B A is aligned in the four low columns.
    for col, label in zip(range(2, 6), ("ㄱ", "", "ㄴ", "ㄱ")):
        cx = centers[col]
        if label:
            parts.append(f'<circle cx="{cx}" cy="42" r="25" fill="none"/><text x="{cx}" y="51" font-size="30" stroke="none">{label}</text>')
        else:
            parts.append(f'<rect x="{cx-box/2}" y="17" width="{box}" height="50" fill="#fff"/>')
    # Multiplicand multiplier A B.
    parts.append('<text x="20" y="120" font-size="34" stroke="none">×</text>')
    for col, label in zip((4, 5), ("ㄱ", "ㄴ")):
        cx = centers[col]
        parts.append(f'<circle cx="{cx}" cy="111" r="25" fill="none"/><text x="{cx}" y="120" font-size="30" stroke="none">{label}</text>')
    parts.append('</g>')
    parts.append('<line x1="20" y1="151" x2="470" y2="151" stroke="#191511" stroke-width="2"/>')

    def cell(col, y, value=""):
        x = centers[col] - box / 2
        parts.append(f'<rect x="{x}" y="{y}" width="{box}" height="50" fill="#fff" stroke="#191511" stroke-width="2"/>')
        if value != "":
            parts.append(f'<text x="{centers[col]}" y="{y+35}" text-anchor="middle" font-family="serif" font-size="29" fill="#191511">{value}</text>')

    # First partial product: five unknown digits in columns 1..5.
    for col in range(1, 6):
        cell(col, 166)
    # Second partial product, shifted one place left: five digits in 0..4.
    for col in range(5):
        cell(col, 226, str(d1) if col == 4 else "")
    parts.append('<line x1="20" y1="283" x2="470" y2="283" stroke="#191511" stroke-width="2"/>')
    # Six-digit final product; its units digit is the second visible clue.
    for col in range(6):
        cell(col, 293, str(d2) if col == 5 else "")
    parts.append('</svg>')
    return ''.join(parts)


def enumerate_pairs(d1, d2):
    valid = []
    for a in range(1, 10):
        for b in range(10):
            if a == b or a * a % 10 != d1 or a * b % 10 != d2:
                continue
            valid_x = []
            for x in range(10):
                number = 1000 * a + 100 * x + 10 * b + a
                p1, p2, product = number * b, number * a, number * (10 * a + b)
                # Match the five-, five-, and six-cell rows in the source layout.
                if 10000 <= p1 <= 99999 and 10000 <= p2 <= 99999 and 100000 <= product <= 999999:
                    valid_x.append(x)
            if valid_x:
                valid.append({"a": a, "b": b, "validMiddleDigits": valid_x})
    return valid


def main():
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    # Allow a clean rerun after refining the SVG while preserving every other
    # source group and keeping the same working tree state.
    if data["version"] == VERSION:
        data["items"] = [item for item in data["items"] if item["sourceNo"] != 24]
        data["availableSourceNos"] = [n for n in data["availableSourceNos"] if n != 24]
        data["pendingSourceNos"] = sorted(data["pendingSourceNos"] + [24])
        data["version"] = VERSION.rsplit("-r", 1)[0].replace("-q24", "") + "-r20"
        if data.get("sourceReview", {}).get("questionReviews"):
            data["sourceReview"]["questionReviews"].pop("24", None)
        index["items"] = [entry for entry in index["items"] if entry["sourceNo"] != 24]
        index.update(version=data["version"], itemCount=len(data["items"]),
                     availableSourceNos=data["availableSourceNos"], pendingSourceNos=data["pendingSourceNos"])
    assert data["version"].endswith("-r20") and index["version"] == data["version"]
    assert data["pendingSourceNos"] == index["pendingSourceNos"] == [24, 25, 28]
    assert not any(item["sourceNo"] == 24 for item in data["items"])
    source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    answer_hash = hashlib.sha256(ANSWER.read_bytes()).hexdigest()
    ASSETS.mkdir(parents=True, exist_ok=True)
    new, report = [], []
    for variant, (d1, d2) in enumerate(CLUES, 1):
        pairs = enumerate_pairs(d1, d2)
        assert len(pairs) == 1, (d1, d2, pairs)
        pair = pairs[0]
        a, b = pair["a"], pair["b"]
        answers = {a + b}
        assert len(answers) == 1
        answer = next(iter(answers))
        asset = ASSETS / f"applied9-q24-v{variant}.svg"
        asset.write_text(svg(d1, d2), encoding="utf-8")
        asset_hash = hashlib.sha256(asset.read_bytes()).hexdigest()
        steps = [
            f"두 번째 곱셈 줄의 일의 자리에서 ㄱ×ㄱ의 일의 자리 숫자는 {d1}입니다.",
            f"마지막 곱의 일의 자리에서 ㄱ×ㄴ의 일의 자리 숫자는 {d2}입니다.",
            f"표시된 숫자와 ㄱ≠ㄴ 조건을 만족하는 숫자쌍은 ㄱ={a}, ㄴ={b}뿐입니다. 가운데 빈칸은 0부터 9까지 모두 대입해도 이 두 자리 숫자의 값은 바뀌지 않습니다.",
            f"따라서 ㄱ+ㄴ={a}+{b}={answer}입니다.",
        ]
        item = {
            "id": f"applied9-q24-v{variant}", "genId": "applied9-q24", "sourceSet": "applied",
            "sourceRound": 9, "sourceNo": 24, "variantNo": variant, "reviewStatus": "verified",
            "area": "수와 식", "subarea": "곱셈식의 숫자 조건", "detailType": "곱셈식의 부분곱과 곱의 일의 자리로 기호 숫자 찾기",
            "pointBand": "4.2",
            "text": "ㄱ과 ㄴ은 서로 다른 숫자입니다. 곱셈식에 알맞은 ㄱ과 ㄴ의 합을 구하시오.",
            "answer": str(answer), "answerParts": [answer], "answerLabels": ["ㄱ+ㄴ"],
            "acceptedAnswers": [str(answer)], "answerContract": "single-number",
            "asset": {"kind": "svg", "src": f"assets/applied9/{asset.name}",
                      "description": "기호 숫자와 두 부분곱의 일의 자리 단서가 있는 세로 곱셈식", "sha256": asset_hash},
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "세로 곱셈식의 부분곱과 전체 곱에서 일의 자리 조건을 읽고 같은 기호의 숫자를 좁히기",
            "learningLocation": "활용 9회 · 원문 24번 · 곱셈식의 숫자 조건",
            "verification": {
                "primaryMethod": "곱셈의 일의 자리 조건에서 ㄱ과 ㄴ을 좁힌 뒤 서로 다른 숫자 조건을 확인한다.",
                "independentMethod": "ㄱ 1~9, ㄴ 0~9, 가운데 숫자 0~9를 전부 열거해 세 곱셈 줄의 칸 수와 두 고정 숫자를 직접 대조한다.",
                "parameters": {"partialProductOnesDigit": d1, "finalProductOnesDigit": d2,
                               "uniquePair": {"a": a, "b": b}, "validMiddleDigits": pair["validMiddleDigits"],
                               "answer": answer, "assetSha256": asset_hash},
                "independentSuite": "qa/applied9-q24-independent-validate.py",
                "sourceExamPage": 4, "sourceExamFile": SOURCE.name, "sourceExamSha256": source_hash,
                "sourceAnswerPage": 4, "sourceAnswerFile": ANSWER.name, "sourceAnswerSha256": answer_hash,
                "sourceAnswerDriveId": ANSWER_ID,
                "officialAnswerStatus": "후보 답안 p.4의 원문 숫자쌍 ㄱ=8, ㄴ=3 및 합 11을 원문 그림의 두 고정 4와 곱셈 자리 조건으로 독립 재현했다. 후보 답안의 공식성·판본 동일성은 미확인이다.",
                "sourceDrawingCompared": True, "sourceDrawingPresent": True,
                "sourceDrawingDescription": "원문 p.4 Q24의 ㄱ□ㄴㄱ×ㄱㄴ 배열, 5자리 첫 부분곱, 한 자리 밀린 5자리 둘째 부분곱의 끝 숫자 4, 6자리 곱의 끝 숫자 4를 직접 대조했다.",
                "variantUsesSourceDrawing": False, "variantDrawingModified": False,
                "userAuthorizedNewVariantFigures": True,
                "authorizationScope": "사용자가 승인한 활용 9회 남은 모든 그림 유형의 유사문제용 새 그림 제작.",
                "studentDifficultyMeasured": False,
            },
            "difficultyEvidence": {"basis": "source-point-band", "label": "상", "sourceReasoningPreserved": True,
                                   "measuredVariantRate": None, "estimated": False,
                                   "rationale": "원문 Q24는 4.2점 배점대이며 활용 난도는 배점대로 분류한다."},
        }
        new.append(item)
        report.append({"id": item["id"], "clues": [d1, d2], "uniquePair": [a, b],
                       "validMiddleDigits": pair["validMiddleDigits"], "answer": answer,
                       "assetSha256": asset_hash})
    data["items"].extend(new)
    data["items"].sort(key=lambda item: (item["sourceNo"], item["variantNo"]))
    data["itemCount"] = len(data["items"])
    data["availableSourceNos"] = sorted(data["availableSourceNos"] + [24])
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 24]
    data["version"] = VERSION
    data.setdefault("sourceReview", {}).setdefault("questionReviews", {})["24"] = {
        "sourcePage": 4, "diagramCompared": True, "candidateAnswer": 11,
        "independentAnswer": 11,
        "status": "candidate answer reproduced from the printed diagram; candidate official status and edition identity unconfirmed; original preserved",
    }
    index.update(version=VERSION, itemCount=len(data["items"]),
                 availableSourceNos=data["availableSourceNos"], pendingSourceNos=data["pendingSourceNos"])
    index["items"] = [entry for entry in index["items"] if entry["sourceNo"] != 24] + [{
        "sourceNo": 24, "genId": "applied9-q24", "area": "수와 식", "subarea": "곱셈식의 숫자 조건",
        "detailType": "곱셈식의 부분곱과 곱의 일의 자리로 기호 숫자 찾기", "pointBand": "4.2",
        "reviewStatus": "verified", "variantCount": 9,
    }]
    index["items"].sort(key=lambda entry: entry["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "q24-independent-validation-r21.json").write_text(
        json.dumps({"version": VERSION, "sourceCandidateAnswer": 11, "variants": report}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"version": VERSION, "items": len(data["items"]), "pending": data["pendingSourceNos"],
                      "variants": report}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

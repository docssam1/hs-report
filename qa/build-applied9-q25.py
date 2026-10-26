#!/usr/bin/env python3
"""Build nine reversible seven-segment addition variants for Applied 9 Q25."""
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
VERSION = "20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q29-q30-r22"

# (first fixed addend, second fixed addend, tens digit before circle, last
# fixed digit). Every shown digit is valid after a 180-degree turn.
CONSTANTS = [(86, 95, 2, 1), (59, 81, 2, 0), (58, 91, 2, 0),
             (86, 92, 1, 0), (56, 81, 2, 0), (96, 98, 5, 2),
             (58, 61, 2, 0), (96, 98, 2, 1), (86, 96, 1, 2)]
SEGMENTS = {
    # The source uses a single centered vertical stroke for the digit 1.
    0: "abcdef", 1: "u", 2: "abged", 3: "abgcd", 4: "fgbc",
    5: "afgcd", 6: "afgecd", 7: "abc", 8: "abcdefg", 9: "abfgcd",
}
REFLECT = {0: 0, 1: 1, 2: 2, 5: 5, 6: 9, 8: 8, 9: 6}
ALLOWED = sorted(REFLECT)


def rotate_number(value):
    tens, ones = divmod(value, 10)
    return 10 * REFLECT[ones] + REFLECT[tens]


def solution_for(constants):
    first, second, tens, last = constants
    base_a = first + second + 10 * tens + last
    base_b = rotate_number(first) + rotate_number(second) + REFLECT[tens] + 10 * REFLECT[last]
    k = base_b - base_a
    pairs = [(circle, square) for circle in ALLOWED for square in ALLOWED
             if circle > square
             and circle + 10 * square - 10 * REFLECT[circle] - REFLECT[square] == k]
    return k, pairs


def seg_line(name, a, b):
    return f'<line data-segment="{name}" x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}"/>'


def digit_svg(digit, x, y):
    points = {
        "a": ((8, 8), (34, 8)), "b": ((38, 12), (38, 31)),
        "c": ((38, 39), (38, 58)), "d": ((8, 62), (34, 62)),
        "e": ((4, 39), (4, 58)), "f": ((4, 12), (4, 31)),
        "g": ((8, 35), (34, 35)),
        "u": ((21, 12), (21, 58)),
    }
    lines = "".join(seg_line(name, *points[name]) for name in SEGMENTS[digit])
    return (f'<g class="digit" data-digit="{digit}" transform="translate({x} {y})" '
            f'stroke="#28251f" stroke-width="5" stroke-linecap="round" fill="none">{lines}</g>')


def diagram(constants):
    first, second, tens, last = constants
    tokens = [
        ("number", str(first)), ("plus", "+"), ("number", str(second)),
        ("plus", "+"), ("digit", str(tens)), ("circle", "●"),
        ("plus", "+"), ("square", "■"), ("digit", str(last)),
    ]
    widths = {"number": 94, "digit": 48, "circle": 31, "square": 31, "plus": 38}
    gap = 3
    expression_width = sum(widths[k] for k, _ in tokens) + gap * (len(tokens) - 1)
    width = expression_width + 48
    height = 224
    x = 24
    y = 76
    bits = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">',
        '<rect width="100%" height="100%" rx="18" fill="#f1ece1"/>',
        '<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="4" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#b4512e"/></marker></defs>',
        f'<circle cx="{width/2}" cy="25" r="16" fill="#fdfbf5" stroke="#c9bda2"/><text x="{width/2}" y="31" text-anchor="middle" font-family="serif" font-size="18" fill="#28251f">ㄴ</text>',
        f'<line x1="{width/2}" y1="43" x2="{width/2}" y2="62" stroke="#b4512e" stroke-width="2" marker-end="url(#arrow)"/>',
        f'<line x1="{width/2}" y1="182" x2="{width/2}" y2="161" stroke="#b4512e" stroke-width="2" marker-end="url(#arrow)"/>',
        f'<circle cx="{width/2}" cy="199" r="16" fill="#fdfbf5" stroke="#c9bda2"/><text x="{width/2}" y="205" text-anchor="middle" font-family="serif" font-size="18" fill="#28251f">ㄱ</text>',
    ]
    x += (width - expression_width) / 2 - 24
    for kind, value in tokens:
        if kind == "number":
            bits.append(digit_svg(int(value[0]), x, y))
            bits.append(digit_svg(int(value[1]), x + 48, y))
        elif kind == "digit":
            bits.append(digit_svg(int(value), x, y))
        elif kind == "circle":
            bits.append(f'<circle data-symbol="circle" cx="{x+15.5}" cy="{y+35}" r="11" fill="#c96b5d"/>')
        elif kind == "square":
            bits.append(f'<rect data-symbol="square" x="{x+3.5}" y="{y+23}" width="24" height="24" fill="#7b9d87"/>')
        else:
            bits.append(f'<text class="plus" x="{x+19}" y="{y+48}" text-anchor="middle" font-family="serif" font-size="32" fill="#28251f">+</text>')
        x += widths[kind] + gap
    return "".join(bits) + "</svg>"


def all_pairs_for_k(k):
    return [(circle, square) for circle in ALLOWED for square in ALLOWED
            if circle > square
            and circle + 10 * square - 10 * REFLECT[circle] - REFLECT[square] == k]


def main():
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    if data["version"] == VERSION:
        data["items"] = [item for item in data["items"] if item["sourceNo"] != 25]
        data["availableSourceNos"] = [n for n in data["availableSourceNos"] if n != 25]
        data["pendingSourceNos"] = sorted(data["pendingSourceNos"] + [25])
        data["version"] = VERSION.rsplit("-r", 1)[0].replace("-q25", "") + "-r21"
        if data.get("sourceReview", {}).get("questionReviews"):
            data["sourceReview"]["questionReviews"].pop("25", None)
        index["items"] = [entry for entry in index["items"] if entry["sourceNo"] != 25]
        index.update(version=data["version"], itemCount=len(data["items"]),
                     availableSourceNos=data["availableSourceNos"], pendingSourceNos=data["pendingSourceNos"])
    assert data["version"].endswith("-r21") and index["version"] == data["version"]
    assert data["pendingSourceNos"] == index["pendingSourceNos"] == [25, 28]
    assert not any(item["sourceNo"] == 25 for item in data["items"])
    source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    answer_hash = hashlib.sha256(ANSWER.read_bytes()).hexdigest()
    ASSETS.mkdir(parents=True, exist_ok=True)
    new, results = [], []
    for variant, constants in enumerate(CONSTANTS, 1):
        first, second, tens, last = constants
        k, pairs = solution_for(constants)
        assert len(pairs) == 1, (constants, k, pairs)
        circle, square = pairs[0]
        expression_parts = [first, second, 10 * tens + circle, 10 * square + last]
        expression = "+".join(map(str, expression_parts))
        asset = ASSETS / f"applied9-q25-v{variant}.svg"
        asset.write_text(diagram(constants), encoding="utf-8")
        asset_hash = hashlib.sha256(asset.read_bytes()).hexdigest()
        transformed = [rotate_number(first), rotate_number(second),
                       10 * REFLECT[circle] + REFLECT[tens],
                       10 * REFLECT[last] + REFLECT[square]]
        assert sum(expression_parts) == sum(transformed)
        steps = [
            "180° 돌리면 7세그먼트 숫자 0, 2, 5, 8은 그대로이고 6과 9는 서로 바뀝니다. 이 그림의 1은 가운데 세로획으로 그려져 있으므로 그대로 읽힙니다. 따라서 반대 방향에서도 숫자로 읽히려면 기호 자리에 올 수 있는 숫자는 0, 1, 2, 5, 6, 8, 9입니다.",
            f"숫자를 180° 돌려 읽은 값을 r(n)이라 하겠습니다. 고정된 수를 돌려 읽은 합은 {rotate_number(first)}+{rotate_number(second)}+{REFLECT[tens]}+{10*REFLECT[last]}이고, 원래 고정 부분의 합은 {first}+{second}+{10*tens}+{last}입니다. 두 방향의 합이 같으려면 ●+10×■−10×r(●)−r(■)={k}이어야 합니다.",
            f"●>■ 조건과 7세그먼트에서 읽을 수 있는 숫자를 모두 대입하면 가능한 쌍은 ●={circle}, ■={square} 하나뿐입니다. 실제로 두 방향의 합은 각각 {sum(expression_parts)}입니다.",
            f"따라서 ㄱ 방향에서 본 식은 {expression}입니다.",
        ]
        item = {
            "id": f"applied9-q25-v{variant}", "genId": "applied9-q25", "sourceSet": "applied",
            "sourceRound": 9, "sourceNo": 25, "variantNo": variant, "reviewStatus": "verified",
            "area": "수와 식", "subarea": "자리와 식", "detailType": "반대로 읽는 7세그먼트 덧셈식에서 기호 숫자 찾기",
            "pointBand": "4.2",
            "text": "다음과 같은 덧셈식이 적혀있습니다. ㄱ방향과 ㄴ방향에서 각각 계산했더니 답이 같았을 때, ㄱ방향에서 본 식을 쓰시오. 단, ●는 ■보다 큽니다.",
            "answer": expression, "answerParts": expression_parts,
            "answerLabels": ["첫째 항", "둘째 항", "셋째 항", "넷째 항"],
            "acceptedAnswers": [expression], "answerContract": "ordered-parts",
            "asset": {"kind": "svg", "src": f"assets/applied9/{asset.name}",
                      "description": "방향 표식과 7세그먼트 숫자·기호가 있는 덧셈식", "sha256": asset_hash},
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "7세그먼트 숫자의 180° 회전 대응을 이용해 두 방향의 덧셈식 조건을 비교하기",
            "learningLocation": "활용 9회 · 원문 25번 · 자리와 식",
            "verification": {
                "primaryMethod": "180° 회전에서 각 숫자와 항의 순서가 바뀌는 규칙을 적용해 양방향의 덧셈식을 비교한다.",
                "independentMethod": "7세그먼트 선분의 180° 좌표 변환으로 허용 숫자를 독립 도출한 뒤 모든 ●>■ 쌍을 전수 비교한다.",
                "parameters": {"fixedAddends": [first, second], "thirdTensDigit": tens,
                               "fourthOnesDigit": last, "rotationMap": {str(k): v for k, v in REFLECT.items()},
                               "allowedDigits": ALLOWED, "differenceConstant": k,
                               "uniquePair": {"circle": circle, "square": square},
                               "answerExpressionParts": expression_parts,
                               "oppositeDirectionParts": transformed, "answerExpression": expression,
                               "equalSum": sum(expression_parts), "assetSha256": asset_hash},
                "independentSuite": "qa/applied9-q25-independent-validate.py",
                "sourceExamPage": 5, "sourceExamFile": SOURCE.name, "sourceExamSha256": source_hash,
                "sourceAnswerPage": 5, "sourceAnswerFile": ANSWER.name, "sourceAnswerSha256": answer_hash,
                "sourceAnswerDriveId": ANSWER_ID,
                "officialAnswerStatus": "후보 답안 p.5의 원문 식 61+18+89+69(●=9, ■=6)를 반대 방향의 7세그먼트 회전 계산으로 재현했다. 후보 답안의 공식성·판본 동일성은 미확인이다.",
                "sourceDrawingCompared": True, "sourceDrawingPresent": True,
                "sourceDrawingDescription": "원문 p.5 Q25의 61+18+8●+■9 표시, 위쪽 ㄴ·아래쪽 ㄱ 화살표, 7세그먼트 글자, 원형·사각형 색 표식을 직접 대조했다.",
                "variantUsesSourceDrawing": False, "variantDrawingModified": False,
                "userAuthorizedNewVariantFigures": True,
                "authorizationScope": "사용자가 승인한 활용 9회 남은 모든 그림 유형의 유사문제용 새 그림 제작.",
                "studentDifficultyMeasured": False,
            },
            "difficultyEvidence": {"basis": "source-point-band", "label": "상", "sourceReasoningPreserved": True,
                                   "measuredVariantRate": None, "estimated": False,
                                   "rationale": "원문 Q25는 활용 9회 25~30번의 4.2점 배점대이며 활용 난도는 배점대로 분류한다."},
        }
        new.append(item)
        results.append({"id": item["id"], "constants": list(constants), "differenceConstant": k,
                        "pairs": [list(pair) for pair in pairs], "answer": expression,
                        "oppositeDirection": transformed, "equalSum": sum(expression_parts),
                        "assetSha256": asset_hash})
    data["items"].extend(new)
    data["items"].sort(key=lambda item: (item["sourceNo"], item["variantNo"]))
    data["itemCount"] = len(data["items"])
    data["availableSourceNos"] = sorted(data["availableSourceNos"] + [25])
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 25]
    data["version"] = VERSION
    data.setdefault("sourceReview", {}).setdefault("questionReviews", {})["25"] = {
        "sourcePage": 5, "candidateExpression": "61+18+89+69", "candidateCircle": 9,
        "candidateSquare": 6, "independentAnswer": "61+18+89+69",
        "status": "candidate answer reproduced by 180-degree seven-segment rotation; candidate official status and edition identity unconfirmed; original preserved",
    }
    index.update(version=VERSION, itemCount=len(data["items"]),
                 availableSourceNos=data["availableSourceNos"], pendingSourceNos=data["pendingSourceNos"])
    index["items"] = [entry for entry in index["items"] if entry["sourceNo"] != 25] + [{
        "sourceNo": 25, "genId": "applied9-q25", "area": "수와 식", "subarea": "자리와 식",
        "detailType": "반대로 읽는 7세그먼트 덧셈식에서 기호 숫자 찾기", "pointBand": "4.2",
        "reviewStatus": "verified", "variantCount": 9,
    }]
    index["items"].sort(key=lambda entry: entry["sourceNo"])
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "q25-independent-validation-r22.json").write_text(
        json.dumps({"version": VERSION, "sourceCandidateExpression": "61+18+89+69",
                    "sourceDirectionSums": [237, 237], "variants": results}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"version": VERSION, "items": len(data["items"]),
                      "pending": data["pendingSourceNos"], "variants": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

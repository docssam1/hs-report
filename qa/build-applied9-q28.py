#!/usr/bin/env python3
"""Build the nine authorized route-count variants for Applied 9 Q28."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied9-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied9-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied9"
SOURCE_PATH = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER_PATH = ROOT / ".private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
VERSION = "20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r23"

# Grid column count m; downward-arrow columns from the top row and middle row.
# The number of paths is the count of ordered pairs (upper, lower) with upper <= lower.
VARIANTS = [
    (4, [0, 1, 2], [2, 3, 4]),
    (4, [0, 1, 2], [0, 2, 3, 4]),
    (4, [0, 1, 2, 3], [1, 2, 3, 4]),
    (4, [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]),
    (5, [0, 1, 2, 3], [0, 2, 3, 4, 5]),
    (5, [0, 1, 2, 3], [1, 2, 3, 4, 5]),
    (5, [0, 1, 2, 3, 4], [1, 2, 3, 4, 5]),
    (5, [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5]),
    (6, [0, 1, 2, 3, 4], [1, 2, 3, 4, 5, 6]),
]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def route_count(m: int, upper: list[int], lower: list[int]) -> int:
    """Enumerate paths in the directed graph, independently of the pair formula."""
    edges: dict[tuple[int, int], list[tuple[int, int]]] = {}

    def add(a: tuple[int, int], b: tuple[int, int]) -> None:
        edges.setdefault(a, []).append(b)

    for row in range(3):
        for col in range(m):
            add((row, col), (row, col + 1))
    for col in upper:
        add((0, col), (1, col))
    for col in lower:
        add((1, col), (2, col))

    target = (2, m)
    count = 0
    stack = [(0, 0)]
    while stack:
        node = stack.pop()
        if node == target:
            count += 1
        else:
            stack.extend(edges.get(node, []))
    return count


def make_svg(m: int, upper: list[int], lower: list[int], number: int) -> str:
    width = 180 + 84 * m
    height = 330
    xs = [88 + 84 * c for c in range(m + 1)]
    ys = [82, 165, 248]
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        f'<title id="title">활용 9회 28번 유사문제 {number}</title>',
        '<desc id="desc">세 줄 격자에서 오른쪽과 아래쪽 화살표를 따라 A에서 B까지 가는 경로를 세는 그림</desc>',
        '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6.8" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L7,3 L0,6 Z" fill="#191511"/></marker></defs>',
        '<g fill="none" stroke="#191511" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">',
    ]
    # Every edge is drawn separately so each arrow has one unambiguous direction.
    for row, y in enumerate(ys):
        for col in range(m):
            x0, x1 = xs[col], xs[col + 1]
            parts.append(f'<path d="M{x0 + 7},{y} L{x1 - 11},{y}" marker-end="url(#arrow)"/>')
    for col in upper:
        x = xs[col]
        parts.append(f'<path d="M{x},{ys[0] + 8} L{x},{ys[1] - 11}" marker-end="url(#arrow)"/>')
    for col in lower:
        x = xs[col]
        parts.append(f'<path d="M{x},{ys[1] + 8} L{x},{ys[2] - 11}" marker-end="url(#arrow)"/>')
    parts.append('</g><g fill="#fdfbf5" stroke="#191511" stroke-width="2">')
    for y in ys:
        for x in xs:
            parts.append(f'<circle cx="{x}" cy="{y}" r="5.5"/>')
    parts.append('</g>')
    parts.append(f'<g fill="#191511" font-family="Pretendard, sans-serif" font-size="24" font-weight="600"><text x="{xs[0]}" y="43" text-anchor="middle">A</text><text x="{xs[-1]}" y="305" text-anchor="middle">B</text></g>')
    parts.append('</svg>')
    return ''.join(parts) + '\n'


def make_item(number: int, m: int, upper: list[int], lower: list[int], answer: int) -> dict:
    source = f"assets/applied9/applied9-q28-v{number}.svg"
    contribution = [sum(1 for j in lower if j >= i) for i in upper]
    contribution_text = "+".join(map(str, contribution))
    svg_path = ROOT / "bank" / source
    svg = make_svg(m, upper, lower, number)
    svg_path.write_text(svg, encoding="utf-8")
    asset_hash = digest(svg_path)
    steps = [
        "윗줄을 따라 오른쪽으로 가다가 위쪽 세로 화살표를 하나 골라 가운데 줄로 내려옵니다.",
        "가운데 줄에서는 왼쪽으로 되돌아갈 수 없으므로, 내려온 열과 같거나 더 오른쪽에 있는 아래쪽 세로 화살표만 이어 갈 수 있습니다.",
        f"위쪽 화살표 위치를 왼쪽부터 따져 가능한 아래쪽 화살표 수를 더하면 {contribution_text}입니다.",
        f"따라서 A도시에서 B도시까지 가는 방법은 {contribution_text}={answer}가지입니다.",
    ]
    return {
        "id": f"applied9-q28-v{number}",
        "genId": "applied9-q28",
        "sourceSet": "applied",
        "sourceRound": 9,
        "sourceNo": 28,
        "variantNo": number,
        "reviewStatus": "verified",
        "area": "경우의 수",
        "subarea": "경로 세기",
        "detailType": "화살표 방향을 따라 격자 교차점을 이동하는 경로의 수",
        "pointBand": "4.2",
        "text": "A도시에서 B도시까지 움직인다고 할 때 가는 방법은 모두 몇 가지 있을까요?",
        "answer": str(answer),
        "answerParts": [answer],
        "answerLabels": ["A도시에서 B도시까지 가는 방법 수"],
        "acceptedAnswers": [str(answer)],
        "answerContract": "single-number",
        "asset": {
            "kind": "svg",
            "src": source,
            "description": "세 줄 격자와 오른쪽·아래쪽 방향 화살표로 된 새 경로 그림",
            "sha256": asset_hash,
        },
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "화살표의 방향과 이동 가능한 열의 순서를 살펴 모든 경로를 빠짐없이 세기",
        "learningLocation": "활용 9회 · 원문 28번 · 경로 세기",
        "verification": {
            "primaryMethod": "위쪽에서 가운데 줄로 내려오는 열과, 그 열 이후 가운데에서 아래로 내려오는 열을 순서쌍으로 열거한다.",
            "independentMethod": "방향 그래프를 A에서 시작하는 깊이 우선 탐색으로 직접 열거하고 목표 B에 도착하는 모든 경로 수를 센다.",
            "parameters": {
                "columnsBetweenVertices": m,
                "upperDropColumns": upper,
                "lowerDropColumns": lower,
                "contributionsByUpperDrop": contribution,
                "orderedPairCount": answer,
                "graphPathCount": route_count(m, upper, lower),
            },
            "independentSuite": "qa/applied9-q28-independent-validate.py",
            "sourceExamPage": 5,
            "sourceExamFile": "초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256": SOURCE_SHA,
            "sourceAnswerPage": 5,
            "sourceAnswerFile": "초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId": "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4",
            "sourceAnswerSha256": ANSWER_SHA,
            "sourceQuestionAnswer": 17,
            "officialAnswerStatus": "답안 후보 p.5에는 원문 경로를 5×3+2=17로 센 필기가 있다. 실제 그림의 방향을 따로 열거해 17을 재현했다. 후보 답안의 공식성·판본 동일성은 미확인이다.",
            "sourceDrawingCompared": True,
            "sourceDrawingPresent": True,
            "sourceDrawingDescription": "원문 Q28은 A가 위쪽 가운데, B가 아래쪽 가운데인 정사각 격자형 방향 그래프다. 둘레의 화살표와 중앙으로 향하는 화살표, 중앙에서 아래 모서리로 향하는 화살표를 직접 확인했다. 원본 그림은 변경하지 않았다.",
            "variantUsesSourceDrawing": False,
            "variantDrawingModified": False,
            "studentDifficultyMeasured": False,
            "userAuthorizedNewVariantFigures": True,
            "authorizationScope": "활용 9회 그림 유형 Q28을 포함한 사용자 승인 범위 안에서 새 유사문제 그림을 제작했다. 원본 그림은 보존한다.",
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "상",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 9회 원문 25~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.",
        },
    }


def main() -> None:
    assert digest(SOURCE_PATH) == SOURCE_SHA, "The source exam PDF changed; inspect it again."
    assert digest(ANSWER_PATH) == ANSWER_SHA, "The answer candidate changed; inspect it again."
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    assert data["sourceSet"] == index["sourceSet"] == "applied"
    assert data["sourceRound"] == index["sourceRound"] == 9
    assert data["version"] == index["version"]
    assert data["pendingSourceNos"] == index["pendingSourceNos"] == [28]
    assert 28 not in data["availableSourceNos"] and 28 not in [x["sourceNo"] for x in index["items"]]
    assert not any(x["sourceNo"] == 28 for x in data["items"])

    new_items = []
    answers = []
    for number, (m, upper, lower) in enumerate(VARIANTS, start=1):
        pairs = [(i, j) for i in upper for j in lower if i <= j]
        answer = len(pairs)
        assert answer == route_count(m, upper, lower)
        assert upper == sorted(set(upper)) and lower == sorted(set(lower))
        assert all(0 <= x <= m for x in upper + lower)
        assert answer >= 9 and len(set(answers + [answer])) == len(answers) + 1
        new_items.append(make_item(number, m, upper, lower, answer))
        answers.append(answer)

    assert answers == [9, 10, 13, 15, 16, 17, 19, 21, 24]
    # The original directed network is counted from its distinct entries to the center,
    # from the center to B, plus two perimeter bypasses: 5*3+2=17.
    original_answer = 5 * 3 + 2
    assert original_answer == 17

    data["items"].extend(new_items)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["availableSourceNos"] = sorted(data["availableSourceNos"] + [28])
    data["pendingSourceNos"] = [x for x in data["pendingSourceNos"] if x != 28]
    data["version"] = VERSION
    data["itemCount"] = len(data["items"])
    data.setdefault("sourceReview", {}).setdefault("questionReviews", {})["28"] = {
        "sourceExamPage": 5,
        "sourceAnswerPage": 5,
        "sourceQuestion": "A도시에서 B도시까지 움직인다고 할 때 가는 방법은 모두 몇 가지 있을까요?",
        "sourceFigure": "A 위쪽 중앙, B 아래쪽 중앙. 정사각형 둘레·중앙 가로/세로·대각선으로 연결된 교점에 화살표가 표시된 방향 그래프.",
        "directVisualReview": True,
        "sourceAnswerCandidate": 17,
        "independentSourceCount": {"routesToCenter": 5, "routesFromCenterToB": 3, "perimeterBypasses": 2, "total": 17},
        "officialKeyConfirmed": False,
        "newVariantFiguresAuthorized": True,
        "authorizationScope": "사용자가 활용9 그림 유형 1,3,4,8,9,12,20,22,23,24,25,28의 새 그림을 모두 승인했다. 활용9 Q28에 적용한다.",
        "sourceExamSha256": SOURCE_SHA,
        "sourceAnswerSha256": ANSWER_SHA,
    }

    index_rows = index["items"] + [{
        "sourceNo": 28,
        "genId": "applied9-q28",
        "area": "경우의 수",
        "subarea": "경로 세기",
        "detailType": "화살표 방향을 따라 격자 교차점을 이동하는 경로의 수",
        "pointBand": "4.2",
        "reviewStatus": "verified",
        "variantCount": 9,
    }]
    index["items"] = sorted(index_rows, key=lambda x: x["sourceNo"])
    index["availableSourceNos"] = data["availableSourceNos"]
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["itemCount"] = len(data["items"])
    index["version"] = VERSION

    assert len(data["items"]) == len(index["items"]) * 9 == 270
    assert data["availableSourceNos"] == list(range(1, 31))
    assert data["pendingSourceNos"] == []
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"version": VERSION, "items": len(data["items"]), "q28Answers": answers,
                      "dataSha256": digest(DATA_PATH), "indexSha256": digest(INDEX_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

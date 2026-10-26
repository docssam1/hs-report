"""Expand the original Applied 2 Q13 hinged-rod type, preserving the source exam."""

from __future__ import annotations

import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = ROOT / "bank/data/applied2-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied2-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied2"
VERSION = "20261026-applied2-q13-hinged-rods-r1"
SOURCE_WEIGHTS = (1, 15, 3, 7)
VARIANTS = [
    (1, 14, 3, 7),
    (1, 16, 4, 8),
    (2, 15, 3, 8),
    (1, 13, 4, 9),
    (3, 16, 2, 9),
    (1, 18, 5, 8),
    (2, 16, 3, 9),
    (1, 17, 2, 8),
    (2, 18, 5, 9),
]


def path_length_sets(weights: tuple[int, int, int, int]) -> list[set[int]]:
    """A-B-C with C-D and C-E; each path is put on one line."""
    a, b, c, d = weights
    paths = [[a], [b], [c], [d], [a, b], [b, c], [b, d], [c, d], [a, b, c], [a, b, d]]
    groups = [set(), set(), set()]
    for path in paths:
        for signs in itertools.product((-1, 1), repeat=len(path)):
            distance = abs(sum(w * s for w, s in zip(path, signs)))
            if distance:
                groups[len(path) - 1].add(distance)
    return groups


def coordinate_lengths(weights: tuple[int, int, int, int]) -> set[int]:
    """Independent check: place all five joints on a number line."""
    a, b, c, d = weights
    lengths = set()
    for sa, sb, sc, sd in itertools.product((-1, 1), repeat=4):
        points = (0, sa * a, sa * a + sb * b,
                  sa * a + sb * b + sc * c, sa * a + sb * b + sd * d)
        lengths.update(abs(x - y) for x, y in itertools.combinations(points, 2) if x != y)
    return lengths


def svg(weights: tuple[int, int, int, int]) -> str:
    a, b, c, d = weights
    edges = [(40, 145, 120, 95), (120, 95, 360, 145),
             (360, 145, 420, 55), (360, 145, 520, 130)]
    lines = "".join(
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" />'
        for x1, y1, x2, y2 in edges
    )
    joints = "".join(
        f'<circle cx="{x}" cy="{y}" r="8" />'
        for x, y in [(40, 145), (120, 95), (360, 145), (420, 55), (520, 130)]
    )
    labels = "".join(
        f'<text x="{x}" y="{y}" text-anchor="middle">{value}</text>'
        for value, x, y in [(a, 64, 100), (b, 245, 92), (c, 377, 78), (d, 451, 166)]
    )
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="560" height="205" viewBox="0 0 560 205" '
            f'role="img" aria-label="길이가 {a}, {b}, {c}, {d}인 연결 막대 네 개">'
            '<rect width="560" height="205" fill="white"/>'
            '<g fill="none" stroke="#191511" stroke-width="6" stroke-linecap="round">'
            + lines + '</g><g fill="white" stroke="#191511" stroke-width="2">'
            + joints + '</g><g fill="#191511" font-family="Noto Serif KR,serif" font-size="23">'
            + labels + '</g></svg>\n')


def make_item(number: int, weights: tuple[int, int, int, int]) -> dict:
    groups = path_length_sets(weights)
    possible = set().union(*groups)
    assert possible == coordinate_lengths(weights)
    answer = len(possible)
    parts = ["·".join(map(str, sorted(group))) for group in groups]
    steps = [
        "한 직선에 놓은 두 연결점 사이에는 해당 경로에 있는 막대만 들어갑니다. "
        "각 막대를 왼쪽 또는 오른쪽으로 놓아 끝점 사이 길이를 구합니다.",
        f"막대 1개를 지나는 경로의 길이는 {parts[0]}cm입니다. "
        f"막대 2개를 지나는 경로의 길이는 {parts[1]}cm입니다.",
        f"막대 3개를 지나는 경로의 길이는 {parts[2]}cm입니다. "
        "같은 길이는 한 번만 셉니다.",
        f"가능한 길이를 작은 순서대로 적으면 {', '.join(map(str, sorted(possible)))}cm로, "
        f"서로 다른 길이는 모두 {answer}가지입니다.",
    ]
    a, b, c, d = weights
    return {
        "id": f"applied2-q13-v{number}", "genId": "applied2-q13",
        "sourceSet": "applied", "sourceRound": 2, "sourceNo": 13,
        "variantNo": number, "reviewStatus": "verified", "area": "경우의 수",
        "subarea": "가능한 길이의 열거", "detailType": "접는 연결 막대로 만들 수 있는 길이의 수",
        "pointBand": "3.4",
        "text": "그림처럼 길이가 적힌 네 막대가 연결되어 있습니다. 연결 부위를 접거나 펴서 "
                "모든 막대를 같은 직선 위에 놓습니다. 그림의 연결점 중 두 점을 골라 그 사이를 재면, "
                "0보다 큰 서로 다른 길이는 모두 몇 가지인가요? (단위: cm)",
        "answer": f"{answer}가지", "answerContract": "ordered-parts", "answerParts": [answer],
        "answerLabels": ["서로 다른 길이의 수"],
        "acceptedAnswers": [str(answer), f"{answer}가지"],
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "두 연결점 사이 경로의 막대들을 각각 양방향으로 놓아 길이를 구하고 중복을 제외하기",
        "learningLocation": "활용 2회 · 원문 13번 · 연결 막대의 길이 경우 세기",
        "verification": {
            "primaryMethod": "각 두 연결점의 유일한 막대 경로에서 부호합 절댓값을 열거",
            "independentMethod": "다섯 연결점의 직선 좌표를 2^4방향 전체에 배치하고 모든 두 점 거리 열거",
            "parameters": {"edgeLengths": [a, b, c, d], "lengths": sorted(possible), "answer": answer},
            "sourceExamPage": 3, "sourceTextDirectlyReviewed": True,
            "sourceFigureDirectlyReviewed": True, "sourceTeacherAnswer": 19,
            "independentSourceAnswer": 19,
            "sourceLecture": "https://www.youtube.com/watch?v=tSfYVTY0AGM&t=765s",
            "sourceExamSha256": "1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab",
            "originalFigurePreserved": True, "variantFiguresCreatedFresh": True,
            "independentMethodAgrees": True,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "중",
                               "sourceReasoningPreserved": True, "measuredVariantRate": None},
        "asset": {"kind": "svg", "src": f"assets/applied2/q13-v{number}.svg",
                  "description": "길이가 표시된 네 막대와 다섯 연결점"},
    }


def main() -> None:
    assert set().union(*path_length_sets(SOURCE_WEIGHTS)) == coordinate_lengths(SOURCE_WEIGHTS)
    assert len(coordinate_lengths(SOURCE_WEIGHTS)) == 19
    data = json.loads(DATA_FILE.read_text())
    assert data["version"] == "20261026-applied2-q17-figure24-confirmed-r1"
    assert 13 in data["pendingSourceNos"] and not any(x["sourceNo"] == 13 for x in data["items"])
    items = [make_item(i, w) for i, w in enumerate(VARIANTS, 1)]
    assert len({tuple(x["verification"]["parameters"]["lengths"]) for x in items}) == 9
    for i, weights in enumerate(VARIANTS, 1):
        (ASSET_DIR / f"q13-v{i}.svg").write_text(svg(weights))
    data["items"].extend(items)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["version"] = VERSION
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"]) | {13})
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 13]
    data["sourceEditionNotes"]["13"] = (
        "원문 p.3 네 막대 1·15·3·7과 교사 강의 12:45의 19가지 목록을 "
        "막대 경로 부호합 및 연결점 좌표 16배치로 재현. 변형은 모든 막대를 한 직선에 놓는 조건을 "
        "지문에 명시하고 원본 그림을 보존하며 새 수치 그림 9개 제작."
    )
    data["reviewSummary"]["independentMathCount"] += 9
    data["reviewSummary"]["sourceTypes"] += 1
    data["reviewSummary"]["sourceDrawingCount"] += 1
    data["reviewSummary"]["outputReviewed"] = False
    data["itemCount"] = len(data["items"])
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    index = json.loads(INDEX_FILE.read_text())
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"] = data["pendingSourceNos"]
    first = items[0]
    index["items"].append({k: first[k] for k in (
        "sourceNo", "genId", "area", "subarea", "detailType", "pointBand", "reviewStatus")}
        | {"variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"Applied 2 Q13: {len(items)} variants; original 19 lengths independently confirmed")


if __name__ == "__main__":
    main()

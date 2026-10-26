"""Add nine independently checked variants for Applied 3 source question 7."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied3-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied3-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied3"
EXAM_PATH = ROOT / "materials/초등과정 대비 실전 모의고사 활용 3회.pdf"
ANSWER_PATH = ROOT / ".private-work/hw-expansion-20261023/hw3/source/drive-answer-2022-3-candidate.pdf"
SOURCE_ID = "15PlSmA6AIAQXOTdqKmTV5fQPKfYsPntw"
ANSWER_CANDIDATE_ID = "16hviiTu8lcpjeghcuLv_aokGaH_i9kgf"
PREVIOUS_VERSION = "20261025-applied3-expansion-q04-q06-q12-q14-q18-q21-r9"
VERSION = "20261025-applied3-expansion-q04-q06-q07-q12-q14-q18-q21-r10"
PATH_MOVES = "RRFLL"  # start -> (1), (1)->(2), (2)->(3), (3)->(4), (4)->(5)

# Values visible in the source drawing: top 2, front 3, right 1; all opposites sum 7.
# Each tuple below is a legal proper rotation of that die, not an arbitrary face assignment.
ORIENTATIONS = [
    (1, 2, 3), (1, 3, 5), (1, 4, 2),
    (1, 5, 4), (2, 1, 4), (2, 4, 6),
    (2, 6, 3), (3, 2, 6), (5, 3, 6),
]


def rotate(top: int, front: int, right: int) -> tuple[int, int, int, int, int, int]:
    """Return face values as U,D,F,B,R,L after validating a legal cube orientation."""
    values = {"U": top, "D": 7 - top, "F": front, "B": 7 - front, "R": right, "L": 7 - right}
    # The 24 proper cube rotations are represented by (top, front, right) triples.
    legal = {
        (1, 2, 3), (1, 3, 5), (1, 4, 2), (1, 5, 4),
        (2, 1, 4), (2, 3, 1), (2, 4, 6), (2, 6, 3),
        (3, 1, 2), (3, 2, 6), (3, 5, 1), (3, 6, 5),
        (4, 1, 5), (4, 2, 1), (4, 5, 6), (4, 6, 2),
        (5, 1, 3), (5, 3, 6), (5, 4, 1), (5, 6, 4),
        (6, 2, 4), (6, 3, 2), (6, 4, 5), (6, 5, 3),
    }
    assert (top, front, right) in legal
    return values["U"], values["D"], values["F"], values["B"], values["R"], values["L"]


def roll(state: tuple[int, int, int, int, int, int], move: str) -> tuple[int, int, int, int, int, int]:
    u, d, f, b, r, l = state
    if move == "R":
        return l, r, f, b, u, d
    if move == "L":
        return r, l, f, b, d, u
    if move == "F":
        return b, f, u, d, r, l
    raise ValueError(move)


def pip_positions(value: int) -> list[tuple[float, float]]:
    pattern = {
        1: [(0.5, 0.5)],
        2: [(0.25, 0.25), (0.75, 0.75)],
        3: [(0.25, 0.25), (0.5, 0.5), (0.75, 0.75)],
        4: [(0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75)],
        5: [(0.25, 0.25), (0.75, 0.25), (0.5, 0.5), (0.25, 0.75), (0.75, 0.75)],
        6: [(0.25, 0.2), (0.75, 0.2), (0.25, 0.5), (0.75, 0.5), (0.25, 0.8), (0.75, 0.8)],
    }
    return pattern[value]


def face_dots(points: list[tuple[float, float]], value: int) -> str:
    # Bilinear interpolation maps a standard die-pip pattern onto the projected face.
    p0, p1, p2, p3 = points
    circles = []
    for s, t in pip_positions(value):
        x = (1-s)*(1-t)*p0[0] + s*(1-t)*p1[0] + s*t*p2[0] + (1-s)*t*p3[0]
        y = (1-s)*(1-t)*p0[1] + s*(1-t)*p1[1] + s*t*p2[1] + (1-s)*t*p3[1]
        circles.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.2"/>')
    return "".join(circles)


def svg_for(top: int, front: int, right: int) -> str:
    state = rotate(top, front, right)
    # A compact 3D starting die and the exact five-cell serpentine route in the source figure.
    top_face = [(24, 74), (52, 54), (112, 54), (84, 74)]
    front_face = [(24, 74), (84, 74), (84, 134), (24, 134)]
    right_face = [(84, 74), (112, 54), (112, 114), (84, 134)]
    tiles = {
        1: (158, 66), 2: (272, 66), 3: (272, 180), 4: (158, 180), 5: (44, 180),
    }
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="298" viewBox="0 0 420 298" role="img" aria-label="주사위의 시작 방향과 1번부터 5번까지의 이동 경로">',
        '<rect width="420" height="298" fill="#fff"/>',
        '<g fill="#fff" stroke="#111" stroke-width="2.4" stroke-linejoin="round">',
        '<polygon points="24,74 52,54 112,54 84,74"/>',
        '<polygon points="24,74 84,74 84,134 24,134"/>',
        '<polygon points="84,74 112,54 112,114 84,134"/>',
        '</g>',
        f'<g data-face="top" fill="#111">{face_dots(top_face, state[0])}</g>',
        f'<g data-face="front" fill="#111">{face_dots(front_face, state[2])}</g>',
        f'<g data-face="right" fill="#111">{face_dots(right_face, state[4])}</g>',
        '<text x="68" y="38" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#111">처음</text>',
        '<g fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round">',
    ]
    for n, (x, y) in tiles.items():
        parts.append(f'<rect x="{x}" y="{y}" width="88" height="82" rx="1"/>')
    parts.append('</g><g fill="#111" font-family="serif" font-size="30" font-weight="600" text-anchor="middle" dominant-baseline="central">')
    for n, (x, y) in tiles.items():
        parts.append(f'<text x="{x+44}" y="{y+40}">{n}</text>')
    parts.append('</g>')
    parts.append('<g fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round" marker-end="url(#arrow)">')
    parts.append('<path d="M121 106 C135 106 140 106 153 106"/>')
    parts.append('<path d="M247 106 C255 106 262 106 267 106"/>')
    parts.append('<path d="M316 152 C316 160 316 168 316 175"/>')
    parts.append('<path d="M267 221 C262 221 255 221 247 221"/>')
    parts.append('<path d="M153 221 C148 221 143 221 139 221"/>')
    parts.append('</g>')
    parts.append('<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6.4" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" fill="#111"/></marker></defs>')
    parts.append('</svg>')
    return "".join(parts)


def solve_orientation(orientation: tuple[int, int, int]) -> list[int]:
    state = rotate(*orientation)
    sequence = []
    for move in PATH_MOVES:
        state = roll(state, move)
        sequence.append(state[0])
    return sequence


def make_item(no: int, orientation: tuple[int, int, int], exam_sha: str, answer_sha: str) -> dict:
    top, front, right = orientation
    seq = solve_orientation(orientation)
    answer = sum(seq)
    filename = f"q07-v{no}.svg"
    svg = svg_for(top, front, right)
    (ASSET_DIR / filename).write_text(svg, encoding="utf-8")
    asset_sha = hashlib.sha256(svg.encode()).hexdigest()
    steps = [
        f"처음 보이는 윗면은 {top}, 앞면은 {front}, 오른쪽 면은 {right}입니다. 마주 보는 면의 눈의 수 합이 7이므로 나머지 세 면의 수는 각각 {7-top}, {7-front}, {7-right}입니다.",
        f"화살표대로 주사위를 굴립니다. 시작 자리에서 ①번 칸까지, 이어 ②번, ③번, ④번, ⑤번 칸까지 이동한 뒤 윗면의 눈의 수는 차례로 {'·'.join(map(str, seq))}입니다.",
        f"따라서 구하는 합은 {'＋'.join(map(str, seq))}＝{answer}입니다.",
    ]
    return {
        "id": f"applied3-q07-v{no}",
        "genId": "applied3-q07",
        "sourceSet": "applied", "sourceRound": 3, "sourceNo": 7,
        "variantNo": no, "reviewStatus": "verified",
        "area": "도형", "subarea": "주사위의 굴리기",
        "detailType": "경로를 따라 굴린 주사위의 윗면 수 합",
        "pointBand": "2.7",
        "text": "마주 보는 면에 적힌 눈의 수의 합이 7인 주사위를 그림과 같이 놓았습니다. 화살표 방향으로 주사위를 굴려 ⑤번 칸까지 이동할 때, ①부터 ⑤까지 각 칸에 멈춘 순간 윗면에 나온 눈의 수를 모두 더하면 얼마입니까?",
        "answer": str(answer), "answerParts": [answer],
        "answerLabels": ["①~⑤번 칸 윗면 눈의 수의 합"],
        "acceptedAnswers": [str(answer)], "answerContract": "ordered-parts",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "이동할 때마다 주사위의 마주 보는 면을 갱신해 윗면 찾기",
        "learningLocation": "활용 3회 · 원문 7번 · 경로를 따라 굴린 주사위의 윗면 수 합",
        "verification": {
            "primaryMethod": "independent cube-face state simulation with proper orientation enumeration",
            "parameters": {
                "initialTop": top, "initialFront": front, "initialRight": right,
                "oppositeFaceSum": 7, "movesStartThroughFive": list(PATH_MOVES),
                "topSequence": seq, "distinctProperRotationsEnumerated": 24,
            },
            "independentSuite": "qa/applied3-q07-independent-validate.py",
            "sourceExamPage": 2, "sourceAnswerPage": 2,
            "sourceExamDriveId": SOURCE_ID, "sourceExamSha256": exam_sha,
            "sourceAnswerDriveId": ANSWER_CANDIDATE_ID, "sourceAnswerSha256": answer_sha,
            "answerCopyStatus": "Drive 답안 후보 p.2의 자필 원문 답 24를 확인했다. 이 사본의 공식성·현행 시험지와의 판본 짝은 확인되지 않아 원문 및 변형의 정답은 별도 주사위 상태 계산으로 검증했다.",
            "sourceTextDirectlyReviewed": True,
            "sourceFigureDirectlyReviewed": True,
            "sourceDrawingPreserved": True,
            "variantFigureApproval": "사용자 승인: 유사문제에 새 그림 사용",
            "assetSha256": asset_sha,
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band", "label": "하",
            "sourceReasoningPreserved": True, "measuredVariantRate": None,
        },
        "asset": {
            "kind": "svg", "src": f"assets/applied3/{filename}",
            "description": "새로 그린 시작 주사위 방향과 원문과 같은 다섯 칸 이동 경로",
            "sha256": asset_sha,
        },
    }


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    assert data["version"] == index["version"] == PREVIOUS_VERSION
    assert len(data["items"]) == index["itemCount"] == 207
    assert data["pendingSourceNos"] == index["pendingSourceNos"]
    assert 7 in data["pendingSourceNos"] and all(x["sourceNo"] != 7 for x in data["items"])
    assert len(ORIENTATIONS) == len(set(ORIENTATIONS)) == 9
    assert all(len(solve_orientation(o)) == 5 for o in ORIENTATIONS)
    assert len({sum(solve_orientation(o)) for o in ORIENTATIONS}) == 9
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    exam_sha = hashlib.sha256(EXAM_PATH.read_bytes()).hexdigest()
    answer_sha = hashlib.sha256(ANSWER_PATH.read_bytes()).hexdigest()
    previous_data = copy.deepcopy(data)
    previous_index = copy.deepcopy(index)
    items = [make_item(i, orientation, exam_sha, answer_sha) for i, orientation in enumerate(ORIENTATIONS, 1)]
    data["items"].extend(items)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [7]))
    data["pendingSourceNos"].remove(7)
    data["sourceEditionNotes"]["7"] = "원문 p.2의 시작 주사위(윗면2·앞면3·오른쪽1), 마주 보는 면 합7, 번호칸 이동 경로를 직접 대조했다. 답안 후보 p.2는 24로 적혀 있으며 공식성·판본 짝은 미확인이다. 독립 상태 시뮬레이션으로 원문 답24와 변형 9개의 답을 확인했다. 원본 그림은 보존하고 사용자 승인에 따라 변형 그림만 새로 그렸다."
    data["version"] = VERSION
    data["reviewSummary"]["independentMathCount"] += 9
    data["reviewSummary"]["sourceTypes"] += 1
    data["reviewSummary"]["outputReviewed"] = False
    index["version"] = VERSION
    index["itemCount"] = len(data["items"])
    index["pendingSourceNos"].remove(7)
    index["items"].append({
        "sourceNo": 7, "genId": "applied3-q07", "area": "도형",
        "subarea": "주사위의 굴리기",
        "detailType": "경로를 따라 굴린 주사위의 윗면 수 합",
        "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9,
    })
    index["items"].sort(key=lambda x: x["sourceNo"])
    assert previous_data["items"] == [x for x in data["items"] if x["sourceNo"] != 7]
    assert previous_index["items"] == [x for x in index["items"] if x["sourceNo"] != 7]
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "version": VERSION,
        "beforeCount": len(previous_data["items"]), "afterCount": len(data["items"]),
        "beforeTypes": len(previous_index["items"]), "afterTypes": len(index["items"]),
        "originalQ07": {"initialFaces": [2, 3, 1], "moves": list(PATH_MOVES), "topSequence": solve_orientation((2, 3, 1)), "answer": sum(solve_orientation((2, 3, 1)))},
        "variants": [{"id": x["id"], "orientation": [x["verification"]["parameters"]["initialTop"], x["verification"]["parameters"]["initialFront"], x["verification"]["parameters"]["initialRight"]], "topSequence": x["verification"]["parameters"]["topSequence"], "answer": x["answer"]} for x in items],
        "sourceExamSha256": exam_sha, "sourceAnswerCandidateSha256": answer_sha,
        "dataSha256": hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
        "indexSha256": hashlib.sha256(INDEX_PATH.read_bytes()).hexdigest(),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

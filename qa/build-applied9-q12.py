#!/usr/bin/env python3
"""Add nine independently checked cube-face-sum variants to Applied 9."""
from __future__ import annotations

import hashlib
import itertools
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied9-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied9-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied9"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw9"
SOURCE_FILE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER_FILE = OUT / "candidate-special-9-answer.pdf"
SOURCE_SHA = hashlib.sha256(SOURCE_FILE.read_bytes()).hexdigest()
ANSWER_SHA = hashlib.sha256(ANSWER_FILE.read_bytes()).hexdigest()

# Vertices: top-back-left, top-back-right, top-front-right, top-front-left,
# bottom-front-left, bottom-front-right, bottom-back-right, bottom-back-left.
FACES = [
    (0, 1, 2, 3),  # top
    (3, 2, 5, 4),  # front
    (1, 2, 6, 5),  # right
    (4, 5, 6, 7),  # bottom
    (0, 3, 4, 7),  # left
    (0, 1, 6, 7),  # back
]
POSITIONS = ["윗면 왼쪽", "윗면 오른쪽", "앞면 오른쪽 위", "앞면 왼쪽 위",
             "앞면 왼쪽 아래", "앞면 오른쪽 아래", "뒷면 오른쪽 아래", "뒷면 왼쪽 아래"]
BLANK_ORDER = [0, 1, 2, 4, 6, 7]
PAIR_SLOTS = [(0, 2), (0, 4), (0, 6), (1, 3), (1, 5), (1, 7), (2, 4), (2, 6), (3, 5)]
COORDS = [(95, 25), (205, 25), (155, 75), (45, 75), (45, 185), (155, 185), (205, 135), (95, 135)]
EDGES = [(0, 1), (0, 3), (1, 2), (2, 3), (3, 4), (2, 5), (4, 5), (1, 6), (5, 6), (6, 7)]
HIDDEN = [(0, 7), (7, 6), (4, 7)]


def valid(v: tuple[int, ...]) -> bool:
    sums = [sum(v[i] for i in f) for f in FACES]
    return len(set(sums)) == 1


ALL = [p for p in itertools.permutations(range(1, 9)) if valid(p)]
assert len(ALL) == 144


def face_sums(v: tuple[int, ...]) -> list[int]:
    return [sum(v[i] for i in f) for f in FACES]


def svg(values: tuple[int, ...], clue_slots: tuple[int, int]) -> str:
    lines = []
    for a, b in EDGES:
        x1, y1 = COORDS[a]
        x2, y2 = COORDS[b]
        lines.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>')
    for a, b in HIDDEN:
        x1, y1 = COORDS[a]
        x2, y2 = COORDS[b]
        lines.append(f'<line class="hidden" stroke-dasharray="3 4" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>')
    circles = []
    for i, (x, y) in enumerate(COORDS):
        label = str(values[i]) if i in clue_slots else ""
        circles.append(
            f'<circle cx="{x}" cy="{y}" r="18"/><text x="{x}" y="{y + 1}">{label}</text>'
        )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="250" height="220" viewBox="0 0 250 220" role="img">'
        '<g fill="none" stroke="#5e7467" stroke-width="2">' + "".join(lines) + '</g>'
        '<g fill="#fdfbf5" stroke="#7fa58f" stroke-width="2">' + "".join(
            f'<circle cx="{x}" cy="{y}" r="18"/>' for x, y in COORDS
        ) + '</g>'
        '<g fill="#2a241c" font-family="serif" font-size="19" text-anchor="middle" dominant-baseline="middle">'
        + "".join(f'<text x="{COORDS[i][0]}" y="{COORDS[i][1] + 1}">{values[i] if i in clue_slots else ""}</text>' for i in range(8))
        + '</g></svg>'
    )


def read_data() -> tuple[dict, dict]:
    return json.loads(DATA_PATH.read_text()), json.loads(INDEX_PATH.read_text())


def main() -> None:
    data, index = read_data()
    assert data["version"].endswith("-r16") and index["version"] == data["version"]
    assert not any(x["sourceNo"] == 12 for x in data["items"])
    assert data["pendingSourceNos"] == [12, 20, 22, 23, 24, 25, 28]
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    new_items = []
    evidence = []
    for variant, slots in enumerate(PAIR_SLOTS, 1):
        # Pick the lexicographically first valid clue pair with exactly two
        # accepted completions. All positions and sums are independently
        # checked below; the two completions are both valid student answers.
        chosen = None
        for full in ALL:
            clue = (full[slots[0]], full[slots[1]])
            matches = [p for p in ALL if p[slots[0]] == clue[0] and p[slots[1]] == clue[1]]
            if len(matches) == 2:
                chosen = (full, clue, matches)
                break
        assert chosen is not None
        full, clue, matches = chosen
        assert all(valid(p) and face_sums(p) == [18] * 6 for p in matches)
        blank_slots = [i for i in range(8) if i not in slots]
        # Keep answer entry order identical to the positions of blank circles,
        # independent of which two clues this variant shows.
        blank_order = blank_slots
        accepted_parts = [[p[i] for i in blank_order] for p in matches]
        assert len({tuple(x) for x in accepted_parts}) == 2
        asset_name = f"applied9-q12-v{variant}.svg"
        asset_path = ASSET_DIR / asset_name
        svg_text = svg(full, slots)
        asset_path.write_text(svg_text, encoding="utf-8")
        asset_sha = hashlib.sha256(asset_path.read_bytes()).hexdigest()
        answer_labels = [POSITIONS[i] for i in blank_order]
        accepted_readable = [
            ", ".join(f"{POSITIONS[pos]} {p[j]}" for j, pos in enumerate(blank_order))
            for p in accepted_parts
        ]
        steps = [
            "정육면체의 위·앞·오른쪽·아래·왼쪽·뒤 면에 있는 네 수를 각각 더합니다.",
            "주어진 두 수와 나머지 여섯 수를 한 번씩 사용하여 각 면의 합이 같아지는 배치를 찾습니다.",
            f"가능한 완성은 {accepted_readable[0]}이며, 여섯 면의 합은 모두 18입니다.",
            f"또 다른 가능한 완성은 {accepted_readable[1]}이며, 여섯 면의 합은 모두 18입니다. 두 배치를 모두 정답으로 인정합니다.",
        ]
        item = {
            "id": f"applied9-q12-v{variant}", "genId": "applied9-q12", "sourceSet": "applied",
            "sourceRound": 9, "sourceNo": 12, "variantNo": variant, "reviewStatus": "verified",
            "area": "도형", "subarea": "공간도형과 수의 관계",
            "detailType": "정육면체 각 면의 수의 합을 같게 꼭짓점 채우기", "pointBand": "2.7",
            "text": "빈칸에 1부터 8까지의 수를 한 번씩 써 넣어 정육면체 각 면의 네 수의 합이 같도록 만들려고 합니다. 빈칸에 알맞은 수를 써 넣으시오.",
            "answer": "가능한 배치 두 가지", "answerParts": accepted_parts[0], "answerLabels": answer_labels,
            "acceptedAnswers": accepted_readable, "acceptedAnswerParts": accepted_parts,
            "answerContract": "ordered-parts", "asset": {"kind": "svg", "src": f"assets/applied9/{asset_name}",
                "description": "두 수가 주어진 정육면체 꼭짓점 그림", "sha256": asset_sha},
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "정육면체의 여섯 면을 구분하고 면마다 네 꼭짓점 수의 합을 비교하기",
            "learningLocation": "활용 9회 · 원문 12번 · 정육면체와 수의 관계",
            "verification": {
                "primaryMethod": "각 면의 네 꼭짓점 수를 더해 여섯 합이 모두 같은지 확인한다.",
                "independentMethod": "1~8의 모든 순열 40,320개에서 여섯 면 합이 같은 144개를 전수 탐색한 뒤, 그림에 주어진 두 수와 위치에 맞는 완성만 남긴다.",
                "parameters": {"clueSlots": list(slots), "clueValues": list(clue), "blankSlots": blank_order,
                    "acceptedFullAssignments": [list(p) for p in matches], "faceSums": [18] * 6,
                    "completeSolutionCount": len(matches), "allValidCubeAssignments": len(ALL), "assetSha256": asset_sha},
                "independentSuite": "qa/applied9-q12-independent-validate.py",
                "sourceExamPage": 2, "sourceExamFile": SOURCE_FILE.name, "sourceExamSha256": SOURCE_SHA,
                "sourceAnswerPage": 2, "sourceAnswerFile": ANSWER_FILE.name, "sourceAnswerSha256": ANSWER_SHA,
                "sourceAnswerDriveId": "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4",
                "officialAnswerStatus": "후보 답안 페이지의 한 배치만 독립 계산으로 확인했다. 후보 답안의 공식성·판본 동일성은 미확인이다. 원문 유형에는 여러 유효 배치가 있으므로 모든 유효 완성을 정답으로 받는다.",
                "sourceDrawingCompared": True, "sourceDrawingPresent": True,
                "sourceDrawingDescription": "원문 2쪽 Q12 정육면체의 여덟 꼭짓점·열두 변·숨은 세 변과 고정 수 1, 2의 위치를 직접 대조했다. 원본 그림은 변경하지 않았다.",
                "variantUsesSourceDrawing": False, "variantDrawingModified": False,
                "userAuthorizedNewVariantFigures": True,
                "authorizationScope": "사용자가 승인한 활용 9회 남은 모든 그림 유형의 유사문제용 새 그림 제작.",
                "studentDifficultyMeasured": False,
            },
            "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
                "measuredVariantRate": None, "estimated": False,
                "rationale": "활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."},
        }
        # Store blank positions on the item so validators and the diagram remain auditable.
        item["verification"]["parameters"]["blankLabels"] = answer_labels
        new_items.append(item)
        evidence.append({"id": item["id"], "clueSlots": list(slots), "clueValues": list(clue),
                         "acceptedFullAssignments": [list(p) for p in matches], "acceptedAnswerParts": accepted_parts,
                         "faceSums": [face_sums(p) for p in matches], "asset": asset_name, "assetSha256": asset_sha})

    old = data["items"]
    pos = next((i for i, x in enumerate(old) if x["sourceNo"] > 12), len(old))
    data["items"] = old[:pos] + new_items + old[pos:]
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 12]
    data["version"] = "20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q17-q18-q19-q21-q26-q27-q29-q30-r17"
    assert len(data["items"]) == 216
    assert all(sum(x["sourceNo"] == n for x in data["items"]) == 9 for n in data["availableSourceNos"])
    assert sum(x["sourceNo"] == 12 for x in data["items"]) == 9
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [12]))
    index["version"] = data["version"]
    index["itemCount"] = len(data["items"])
    index["availableSourceNos"] = data["availableSourceNos"]
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"] = [{"sourceNo": n, "genId": f"applied9-q{n:02d}", "area": next(x["area"] for x in data["items"] if x["sourceNo"] == n),
                        "subarea": next(x["subarea"] for x in data["items"] if x["sourceNo"] == n),
                        "detailType": next(x["detailType"] for x in data["items"] if x["sourceNo"] == n),
                        "pointBand": next(x["pointBand"] for x in data["items"] if x["sourceNo"] == n),
                        "reviewStatus": "verified", "variantCount": 9}
                       for n in data["availableSourceNos"]]
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "q12-independent-validation-r17.json").write_text(json.dumps({"status": "PASS", "totalValidAssignments": len(ALL),
        "variants": evidence}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"version": data["version"], "itemCount": len(data["items"]),
        "available": data["availableSourceNos"], "pending": data["pendingSourceNos"], "variants": evidence},
        ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

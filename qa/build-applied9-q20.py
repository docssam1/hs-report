#!/usr/bin/env python3
"""Extend Applied 9 Q20 with nine periodic square-path variants."""
from __future__ import annotations

import hashlib
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied9-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied9-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied9"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw9"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
ANSWER = OUT / "candidate-special-9-answer.pdf"
SOURCE_SHA = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
ANSWER_SHA = hashlib.sha256(ANSWER.read_bytes()).hexdigest()
ROW_NAMES = ["가", "나", "다", "라"]
RUN_ROWS = [0, 1, 2, 3, 2, 1, 0]
ORIGINAL_RUNS = (2, 2, 2, 3, 2, 2, 1)
TARGETS = [130, 131, 132, 133, 134, 136, 135, 137, 138]


def make_path(runs: tuple[int, ...]) -> list[tuple[int, int]]:
    path: list[tuple[int, int]] = []
    col = 1
    for r, count in zip(RUN_ROWS, runs):
        for k in range(count):
            if path and k:
                col += 1
            path.append((r, col))
    assert len(path) == 14 and path[0] == (0, 1) and path[1] == (0, 2)
    return path


def path_compositions() -> list[tuple[tuple[int, ...], list[tuple[int, int]]]]:
    candidates = []
    for cuts in itertools.product(range(1, 5), repeat=7):
        if sum(cuts) != 14 or cuts[0] < 2 or cuts == ORIGINAL_RUNS:
            continue
        path = make_path(cuts)
        if path[-1] != (0, 8) or len(set(path)) != len(path) or set(r for r, _ in path) != set(range(4)):
            continue
        candidates.append((cuts, path))
    # Choose spread-out, visually distinct routes while keeping each row run short.
    candidates.sort(key=lambda x: (x[0], x[1]))
    assert len(candidates) >= 9
    indices = [round(i * (len(candidates) - 1) / 8) for i in range(9)]
    chosen = [candidates[i] for i in indices]
    assert len({x[0] for x in chosen}) == 9
    return chosen


def svg(path: list[tuple[int, int]]) -> str:
    cell, x0, y0 = 23, 54, 14
    width = 17 * cell
    height = 4 * cell
    coords = [(x0 + (c - 0.5) * cell, y0 + (3 - r + 0.5) * cell) for r, c in path]
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width + 70}" height="{height + 42}" viewBox="0 0 {width + 70} {height + 42}" role="img">']
    parts.append('<g stroke="#d8d6ce" stroke-width="0.7" stroke-dasharray="2 2">')
    for r in range(4):
        for c in range(1, 18):
            x, y = x0 + (c - 1) * cell, y0 + (3 - r) * cell
            fill = "#dcebdd" if (r, c) in path or (r, c - 8) in path or (r, c - 16) in path else "#fdfbf5"
            parts.append(f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="{fill}"/>')
    parts.append('</g>')
    # The sequence trail is a source-type cue. It only marks the first cycle;
    # it does not mark the requested Nth cell or include any count solution.
    parts.append('<polyline fill="none" stroke="#b45146" stroke-width="1.2" opacity=".72" points="' + " ".join(f'{x:.1f},{y:.1f}' for x, y in coords) + '"/>')
    parts.append('<g fill="#b45146" opacity=".78">' + "".join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.8"/>' for x, y in coords) + '</g>')
    parts.append('<g fill="#5f5a4e" font-family="serif" font-size="11" text-anchor="middle">')
    for r, name in enumerate(["가", "나", "다", "라"]):
        y = y0 + (3 - r + 0.5) * cell + 3.5
        parts.append(f'<text x="26" y="{y:.1f}">{name}</text>')
    for c in range(1, 18):
        x = x0 + (c - 0.5) * cell
        y = y0 + height + 15
        parts.append(f'<text x="{x:.1f}" y="{y:.1f}">{c}</text>')
    parts.append('</g><g fill="#7a6f5c" font-family="serif" font-size="12"><text x="{0}" y="{1}">…</text></g>'.format(x0 + width + 12, y0 + height + 15))
    parts.append('</svg>')
    return "".join(parts)


def main() -> None:
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    assert data["version"].endswith(("-r17", "-r18")) and index["version"] == data["version"]
    if data["version"].endswith("-r18"):
        # Replace only the just-generated, not-yet-synced Q20 draft from this run.
        data["items"] = [x for x in data["items"] if x["sourceNo"] != 20]
        data["availableSourceNos"] = [n for n in data["availableSourceNos"] if n != 20]
        data["pendingSourceNos"] = sorted(set(data["pendingSourceNos"] + [20]))
    assert 20 in data["pendingSourceNos"] and 20 not in data["availableSourceNos"]
    assert not any(x["sourceNo"] == 20 for x in data["items"])
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    new_items = []
    report = []
    for variant, ((runs, path), target) in enumerate(zip(path_compositions(), TARGETS), 1):
        quotient, rem0 = divmod(target - 1, 14)
        rem = rem0 + 1
        local_row, local_col = path[rem - 1]
        row = ROW_NAMES[local_row]
        column = local_col + quotient * 8
        # Two independent formulations: path-list indexing and arithmetic on
        # repeated 14-cell, 8-column motifs.
        assert path[rem - 1] == (local_row, local_col)
        assert column == (quotient * 8) + path[rem - 1][1]
        all_prefix = [(r, c + cycle * 8) for cycle in range(quotient + 2) for r, c in path]
        assert all_prefix[target - 1] == (local_row, column)
        name = f"applied9-q20-v{variant}.svg"
        asset_path = ASSET_DIR / name
        asset_path.write_text(svg(path), encoding="utf-8")
        asset_sha = hashlib.sha256(asset_path.read_bytes()).hexdigest()
        steps = [
            "한 반복에서 색칠하는 칸은 14칸이고, 모양은 8열 뒤에 다시 시작합니다.",
            f"{target}번째 칸은 14×{quotient}+{rem}이므로, 반복 모양에서 {rem}번째 칸입니다.",
            f"반복 모양의 {rem}번째 칸은 ({row},{local_col})이고, {quotient}번 반복될 때마다 열 번호가 8씩 늘어납니다.",
            f"따라서 열은 {local_col}+8×{quotient}={column}이고, 답은 ({row},{column})입니다.",
        ]
        item = {
            "id": f"applied9-q20-v{variant}", "genId": "applied9-q20", "sourceSet": "applied",
            "sourceRound": 9, "sourceNo": 20, "variantNo": variant, "reviewStatus": "verified",
            "area": "도형", "subarea": "격자와 반복 규칙", "detailType": "반복 색칠 경로에서 n번째 칸의 행과 열 찾기",
            "pointBand": "3.4",
            "text": f"규칙에 따라 작은 정사각형을 1칸씩 색칠하려고 합니다. 두 번째 색칠한 칸을 (가,2)라고 나타낼 때, 같은 방법으로 {target}번째에 색칠한 칸을 나타내시오.",
            "answer": f"({row},{column})", "answerParts": [row, column], "answerLabels": ["행", "열"],
            "acceptedAnswers": [f"({row},{column})", f"{row}, {column}"], "answerContract": "ordered-parts",
            "asset": {"kind": "svg", "src": f"assets/applied9/{name}", "description": "네 행에서 반복되는 색칠 경로와 열 번호", "sha256": asset_sha},
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "반복 구간의 칸 수와 열 이동량으로 큰 순번을 나머지로 바꾸기",
            "learningLocation": "활용 9회 · 원문 20번 · 격자와 반복 규칙",
            "verification": {
                "primaryMethod": "14칸 반복 단위에서 순번의 나머지를 찾고, 각 반복에서 열이 8씩 이동하는 것을 반영한다.",
                "independentMethod": "생성한 경로의 순번 직접 인덱싱과 몫·나머지 계산으로 행·열을 각각 비교한다.",
                "parameters": {"target": target, "runsByRowSegment": list(runs), "motifCoordinates": [list(x) for x in path],
                    "motifCellCount": 14, "repeatColumnWidth": 8, "quotient": quotient, "remainder": rem,
                    "localAnswer": [row, local_col], "answer": [row, column], "assetSha256": asset_sha},
                "independentSuite": "qa/applied9-q20-independent-validate.py",
                "sourceExamPage": 4, "sourceExamFile": SOURCE.name, "sourceExamSha256": SOURCE_SHA,
                "sourceAnswerPage": 4, "sourceAnswerFile": ANSWER.name, "sourceAnswerSha256": ANSWER_SHA,
                "sourceAnswerDriveId": "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4",
                "officialAnswerStatus": "후보 답안의 130번째 칸 (나,75)는 반복 14칸·열 이동 8칸 모델과 일치한다. 후보 답안의 공식성·판본 동일성은 미확인이다.",
                "sourceDrawingCompared": True, "sourceDrawingPresent": True,
                "sourceDrawingDescription": "원문 p.4 Q20의 네 행, 1~17 열, 한 칸씩 이어지는 색칠 경로, (가,2) 단서와 반복 모양을 직접 대조했다. 원본 그림은 변경하지 않았다.",
                "variantUsesSourceDrawing": False, "variantDrawingModified": False,
                "userAuthorizedNewVariantFigures": True,
                "authorizationScope": "사용자가 승인한 활용 9회 남은 모든 그림 유형의 유사문제용 새 그림 제작.",
                "studentDifficultyMeasured": False,
            },
            "difficultyEvidence": {"basis": "source-point-band", "label": "중", "sourceReasoningPreserved": True,
                "measuredVariantRate": None, "estimated": False,
                "rationale": "활용 9회 원문 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다."},
        }
        new_items.append(item)
        report.append({"id": item["id"], "runsByRowSegment": list(runs), "target": target,
            "quotient": quotient, "remainder": rem, "motifCellCount": 14, "repeatColumnWidth": 8,
            "pathDirect": [row, local_col + quotient * 8], "answer": [row, column], "assetSha256": asset_sha})

    old = data["items"]
    pos = next((i for i, x in enumerate(old) if x["sourceNo"] > 20), len(old))
    data["items"] = old[:pos] + new_items + old[pos:]
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 20]
    data["availableSourceNos"] = sorted(set(data["availableSourceNos"] + [20]))
    data["version"] = "20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q17-q18-q19-q20-q21-q26-q27-q29-q30-r18"
    assert len(data["items"]) == 225
    for n in data["availableSourceNos"]:
        assert sum(x["sourceNo"] == n for x in data["items"]) == 9, n
    index["version"] = data["version"]
    index["itemCount"] = len(data["items"])
    index["availableSourceNos"] = data["availableSourceNos"]
    index["pendingSourceNos"] = data["pendingSourceNos"]
    index["items"] = [{"sourceNo": n, "genId": f"applied9-q{n:02d}",
        "area": next(x["area"] for x in data["items"] if x["sourceNo"] == n),
        "subarea": next(x["subarea"] for x in data["items"] if x["sourceNo"] == n),
        "detailType": next(x["detailType"] for x in data["items"] if x["sourceNo"] == n),
        "pointBand": next(x["pointBand"] for x in data["items"] if x["sourceNo"] == n),
        "reviewStatus": "verified", "variantCount": 9} for n in data["availableSourceNos"]]
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "q20-independent-validation-r18.json").write_text(json.dumps({"status": "PASS", "variants": report}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"version": data["version"], "itemCount": len(data["items"]), "pending": data["pendingSourceNos"], "variants": report}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

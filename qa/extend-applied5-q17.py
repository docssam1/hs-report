#!/usr/bin/env python3
"""Extend Applied 5 Q17's existing 4x4 normal magic-square A-value type."""
import hashlib
import itertools
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA_FILE = ROOT / "bank/data/applied5-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied5-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied5"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = WORK / "q16-source-r11/answer.pdf"
EXAM_RENDER = WORK / "q17-source-3.png"
ANSWER_RENDER = WORK / "q17-answer-17.png"
SOURCE_CROP = ASSET_DIR / "q17-magic-square-original.png"
ANSWER_CROP = WORK / "q17-answer-crop.png"
EXAM_ID = "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp"
ANSWER_ID = "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05"
VERSION = "20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-r12"

# The original teacher-annotated solution gives this completed normal square.
ORIGINAL = ((16, 2, 3, 13), (5, 11, 10, 8), (9, 7, 6, 12), (4, 14, 15, 1))
A_CELL = (0, 2)
# All printed clues except A; preserve these positions in every new diagram.
GIVENS = ((0, 0), (0, 1), (1, 2), (2, 0), (2, 2), (2, 3), (3, 0), (3, 1))


def rotate(square):
    return tuple(tuple(row) for row in zip(*square[::-1]))


def symmetry_orbit(square):
    out = []
    seen = set()
    for flip in (False, True):
        base = tuple(tuple(row[::-1]) for row in square) if flip else square
        for turns in range(4):
            current = base
            for _ in range(turns):
                current = rotate(current)
            for candidate in (current, tuple(tuple(17 - x for x in row) for row in current)):
                if candidate not in seen:
                    seen.add(candidate)
                    out.append(candidate)
    return out


# Eight distinct rotations/reflections/complements plus one independently
# discovered normal magic square outside that symmetry orbit.
SQUARES = symmetry_orbit(ORIGINAL) + [
    ((1, 2, 15, 16), (13, 14, 3, 4), (12, 7, 10, 5), (8, 11, 6, 9))
]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def check_square(square):
    values = [v for row in square for v in row]
    return (
        len(values) == 16
        and set(values) == set(range(1, 17))
        and all(sum(row) == 34 for row in square)
        and all(sum(square[r][c] for r in range(4)) == 34 for c in range(4))
        and sum(square[i][i] for i in range(4)) == 34
        and sum(square[i][3 - i] for i in range(4)) == 34
    )


def enumerate_completions(givens):
    """Enumerate every normal 4x4 magic-square completion for these clues."""
    row_candidates = [
        row for combo in itertools.combinations(range(1, 17), 4) if sum(combo) == 34
        for row in itertools.permutations(combo)
    ]
    per_row = []
    for r in range(4):
        fixed = {c: v for (rr, c), v in givens.items() if rr == r}
        per_row.append([row for row in row_candidates if all(row[c] == v for c, v in fixed.items())])
    found = []

    def visit(r, used, column_sums, main_sum, other_sum, square):
        if r == 4:
            if column_sums == [34] * 4 and main_sum == other_sum == 34:
                found.append(tuple(square))
            return
        for row in per_row[r]:
            if used.intersection(row):
                continue
            sums = [column_sums[c] + row[c] for c in range(4)]
            if any(v > 34 for v in sums) or (r < 3 and any(v == 34 for v in sums)):
                continue
            main = main_sum + row[r]
            other = other_sum + row[3 - r]
            if main > 34 or other > 34 or (r < 3 and (main == 34 or other == 34)):
                continue
            if r == 3 and (sums != [34] * 4 or main != 34 or other != 34):
                continue
            visit(r + 1, used | set(row), sums, main, other, square + [row])

    visit(0, set(), [0] * 4, 0, 0, [])
    return found


def svg(square):
    size, left, top, cell = 430, 55, 42, 80
    right, bottom = left + 4 * cell, top + 4 * cell
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">']
    for i in range(5):
        x, y = left + i * cell, top + i * cell
        parts.append(f'<line x1="{left}" y1="{y}" x2="{right}" y2="{y}" stroke="#191511" stroke-width="2"/>')
        parts.append(f'<line x1="{x}" y1="{top}" x2="{x}" y2="{bottom}" stroke="#191511" stroke-width="2"/>')
    for r, row in enumerate(square):
        for c, value in enumerate(row):
            if (r, c) not in GIVENS and (r, c) != A_CELL:
                continue
            label = "A" if (r, c) == A_CELL else str(value)
            x, y = left + c * cell + cell / 2, top + r * cell + cell / 2 + 10
            parts.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Noto Serif KR,serif" font-size="29" fill="#191511">{label}</text>')
    parts.append('</svg>')
    return ''.join(parts)


def make_item(number, square):
    answer = square[A_CELL[0]][A_CELL[1]]
    clues = {f"r{r + 1}c{c + 1}": square[r][c] for r, c in GIVENS}
    row3_missing = square[2][1]
    col1_missing = square[1][0]
    anti_diag_missing = square[0][3]
    first_row = square[0]
    completed = " / ".join(" · ".join(map(str, row)) for row in square)
    steps = [
        "1부터 16까지의 합은 136입니다. 네 행의 합이 모두 같고 네 행이 전체 16개 수를 빠짐없이 나누므로, 한 행의 합은 136÷4=34입니다.",
        f"셋째 행에서 빈칸은 34−({square[2][0]}+{square[2][2]}+{square[2][3]})={row3_missing}입니다. 첫째 열의 다른 빈칸은 34−({square[0][0]}+{square[2][0]}+{square[3][0]})={col1_missing}입니다.",
        f"오른쪽 위에서 왼쪽 아래로 잇는 대각선의 합을 이용하면 첫째 행 마지막 칸은 34−({square[1][2]}+{row3_missing}+{square[3][0]})={anti_diag_missing}입니다. 따라서 첫째 행에서 A=34−({first_row[0]}+{first_row[1]}+{anti_diag_missing})={answer}입니다.",
        f"완성된 마방진은 행 순서로 {completed}입니다. 각 행·열·두 대각선의 합이 34이고 1부터 16까지의 수가 한 번씩 쓰였음을 확인할 수 있습니다.",
    ]
    asset = ({"kind": "raster", "src": "assets/applied5/q17-magic-square-original.png",
              "description": "활용 5회 원문 17번 4×4 마방진을 원본 PDF에서 픽셀 그대로 잘라 보존"}
             if number == 1 else
             {"kind": "svg", "src": f"assets/applied5/q17-magic-square-v{number}.svg",
              "description": "같은 4×4 마방진 유형에서 A와 같은 위치의 수를 구하는 별도 문제 그림"})
    return {
        "id": f"applied5-q17-v{number}", "genId": "applied5-q17", "sourceSet": "applied", "sourceRound": 5,
        "sourceNo": 17, "variantNo": number, "reviewStatus": "verified", "area": "수와 식",
        "subarea": "마방진과 수의 관계", "detailType": "1부터 16까지의 4×4 마방진에서 특정 칸의 수 구하기",
        "pointBand": "3.4",
        "text": "다음 빈칸에 1부터 16까지의 수를 한 번씩 써 넣어 가로, 세로, 대각선에 있는 네 수의 합이 모두 같게 하려고 한다. A에 들어갈 숫자를 구하시오.",
        "asset": asset, "answer": str(answer), "answerParts": [answer], "answerLabels": ["A에 들어갈 수"],
        "acceptedAnswers": [str(answer), f"{answer}입니다"], "answerContract": "ordered-parts",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "1부터 16까지의 합으로 공통 선 합을 구한 뒤 행·열·대각선 조건으로 빈칸을 추론한다.",
        "learningLocation": "활용 5회 · 원문 17번 · 1부터 16까지의 4×4 마방진에서 A 구하기",
        "verification": {
            "primaryMethod": "행·열·대각선의 공통 합 34를 이용해 셋째 행, 첫째 열, 다른 대각선, 첫째 행 순서로 빈칸을 계산한다.",
            "independentMethod": "1~16의 합이 136인 4×4 정상 마방진을 행순열·열합·양 대각선·중복 금지 조건으로 전수 검사해 A가 유일한지 확인한다.",
            "parameters": {"givenCellsOneBased": [[r + 1, c + 1] for r, c in GIVENS], "givenValues": list(clues.values()),
                           "aCellOneBased": [1, 3], "completedSquare": [list(row) for row in square],
                           "lineSum": 34, "answer": answer, "uniqueAValue": True},
            "independentSuite": "qa/applied5-q17-independent-validate.py",
            "sourceExamPage": 3, "sourceAnswerPage": 17, "sourceExamFile": EXAM.name,
            "sourceAnswerFile": ANSWER.name, "sourceExamDriveFileId": EXAM_ID,
            "sourceAnswerDriveFileId": ANSWER_ID, "sourceDrawingCompared": True,
            "variantDrawingType": "4x4-normal-magic-square-with-fixed-A-cell-and-eight-givens",
            "sourceAnswerStatus": "답안 PDF p17 교사 표시 A=3. 별도 정상 마방진 제약 전수검사로 유일성을 확인했다.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "중", "sourceReasoningPreserved": True,
                               "measuredVariantRate": None, "estimated": False,
                               "rationale": "활용 5회 원문 17번은 13~22번 3.4점 배점대이므로 활용 난도는 배점대만 적용한다."},
    }


def main():
    data, index = json.loads(DATA_FILE.read_text()), json.loads(INDEX_FILE.read_text())
    assert data["version"].endswith("r11") and len(data["items"]) == 162
    assert 17 in data["pendingSourceNos"] and not any(x["sourceNo"] == 17 for x in data["items"])
    assert sha(EXAM) == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    assert len(SQUARES) == 9 and len(set(SQUARES)) == 9
    assert all(check_square(square) for square in SQUARES)
    assert [s[A_CELL[0]][A_CELL[1]] for s in SQUARES] == [3, 14, 5, 12, 2, 15, 8, 9, 15]

    exam_text = "".join((PdfReader(str(EXAM)).pages[2].extract_text() or "").split())
    assert "다음빈칸에" in exam_text and "들어갈숫자를구하시오" in exam_text
    assert len(PdfReader(str(ANSWER)).pages) >= 17
    assert EXAM_RENDER.is_file() and ANSWER_RENDER.is_file()
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    Image.open(EXAM_RENDER).crop((1198, 1646, 1535, 1970)).save(SOURCE_CROP)
    Image.open(ANSWER_RENDER).crop((1450, 450, 3100, 1400)).save(ANSWER_CROP)
    original_clues = [SQUARES[0][r][c] for r, c in GIVENS]
    assert original_clues == [16, 2, 10, 9, 6, 12, 4, 14]

    variants = [make_item(i, square) for i, square in enumerate(SQUARES, 1)]
    completion_records = []
    for item, square in zip(variants, SQUARES):
        clues = {(r, c): square[r][c] for r, c in GIVENS}
        completions = enumerate_completions(clues)
        a_values = sorted({completion[A_CELL[0]][A_CELL[1]] for completion in completions})
        assert a_values == [square[A_CELL[0]][A_CELL[1]]], (item["id"], a_values)
        item["verification"]["parameters"].update({"normalMagicCompletions": len(completions), "possibleAValues": a_values})
        completion_records.append({"variantNo": item["variantNo"], "completeSquares": len(completions), "possibleAValues": a_values})
    for number, square in enumerate(SQUARES[1:], 2):
        (ASSET_DIR / f"q17-magic-square-v{number}.svg").write_text(svg(square), encoding="utf-8")

    data["items"].extend(variants)
    data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
    data["availableSourceNos"].append(17)
    data["availableSourceNos"].sort()
    data["pendingSourceNos"].remove(17)
    data["version"] = VERSION
    data["reviewSummary"].update({"independentMathCount": len(data["items"]), "sourceTypes": len(data["availableSourceNos"]),
                                  "sourceDrawingCount": sum(1 for x in data["items"] if x.get("asset"))})
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    entry = variants[0]
    index["items"].append({"sourceNo": 17, "genId": entry["genId"], "area": entry["area"], "subarea": entry["subarea"],
                           "detailType": entry["detailType"], "pointBand": entry["pointBand"],
                           "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index.update({"version": VERSION, "itemCount": len(data["items"]), "pendingSourceNos": data["pendingSourceNos"]})
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")

    review = {
        "sourceExam": {"file": EXAM.name, "driveFileId": EXAM_ID, "sha256": sha(EXAM), "page": 3,
                       "questionNo": 17, "directVisualReview": True, "sourceText": "1~16을 한 번씩 쓰는 4×4 마방진, 행·열·대각선의 네 수 합을 같게 하고 A를 구한다.",
                       "sourceCrop": str(SOURCE_CROP.relative_to(ROOT)), "sourceCropSha256": sha(SOURCE_CROP),
                       "sourceCropBoxAt220Dpi": [1198, 1646, 1535, 1970],
                       "givenCellsOneBased": [[r + 1, c + 1] for r, c in GIVENS], "givenValues": original_clues,
                       "aCellOneBased": [1, 3]},
        "sourceAnswer": {"file": ANSWER.name, "driveFileId": ANSWER_ID, "sha256": sha(ANSWER), "page": 17,
                         "directVisualReview": True, "teacherMarkedAnswer": 3,
                         "answerCrop": str(ANSWER_CROP.relative_to(ROOT)), "answerCropSha256": sha(ANSWER_CROP),
                         "teacherMarkedAnswerText": "A = 3"},
        "sourceCompletedSquare": [list(row) for row in ORIGINAL], "sourceLineSum": 34,
        "sourceUniqueCompletions": completion_records[0]["completeSquares"],
        "sourceUniqueAValues": completion_records[0]["possibleAValues"],
        "variantCount": 9, "newSourceTypes": 0, "difficulty": "3.4 point band only = medium",
        "variantUniquenessChecks": completion_records, "dataVersion": VERSION,
    }
    (WORK / "q17-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print("Added Applied5 Q17, 9 unique-A magic-square questions; answers:", [x["answer"] for x in variants],
          "source A=3 independently confirmed; total", len(data["items"]))


if __name__ == "__main__":
    main()

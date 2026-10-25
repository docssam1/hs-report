#!/usr/bin/env python3
"""Independent audit for the Applied 5 Q17 magic-square A-value variants."""
import hashlib
import itertools
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA = json.loads((ROOT / "bank/data/applied5-expanded.json").read_text())
INDEX = json.loads((ROOT / "bank/data/applied5-expanded-index.json").read_text())
REVIEW = json.loads((WORK / "q17-source-answer-review.json").read_text())
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = WORK / "q16-source-r11/answer.pdf"
SOURCE_CROP = ROOT / "bank/assets/applied5/q17-magic-square-original.png"
ANSWER_CROP = WORK / "q17-answer-crop.png"
GIVEN_CELLS = ((0, 0), (0, 1), (1, 2), (2, 0), (2, 2), (2, 3), (3, 0), (3, 1))
A_CELL = (0, 2)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def valid_square(square):
    vals = [v for row in square for v in row]
    return (
        set(vals) == set(range(1, 17))
        and all(sum(row) == 34 for row in square)
        and all(sum(square[r][c] for r in range(4)) == 34 for c in range(4))
        and sum(square[i][i] for i in range(4)) == 34
        and sum(square[i][3 - i] for i in range(4)) == 34
    )


def solve_a_values(clues):
    """Use a separate bit-mask search over row permutations to find every A."""
    row_pool = [r for combo in itertools.combinations(range(1, 17), 4) if sum(combo) == 34
                for r in itertools.permutations(combo)]
    rows = []
    for r in range(4):
        fixed = [(c, v) for (rr, c), v in clues.items() if rr == r]
        rows.append([row for row in row_pool if all(row[c] == v for c, v in fixed)])
    answers = set()
    solutions = 0

    def walk(r, used_mask, sums, diag_down, diag_up, chosen):
        nonlocal solutions
        if r == 4:
            if sums == (34, 34, 34, 34) and diag_down == 34 and diag_up == 34:
                solutions += 1
                answers.add(chosen[0][2])
            return
        for row in rows[r]:
            mask = sum(1 << (v - 1) for v in row)
            if used_mask & mask:
                continue
            next_sums = tuple(sums[c] + row[c] for c in range(4))
            if any(v > 34 for v in next_sums):
                continue
            if r < 3 and any(v == 34 for v in next_sums):
                continue
            down = diag_down + row[r]
            up = diag_up + row[3 - r]
            if down > 34 or up > 34 or (r < 3 and (down == 34 or up == 34)):
                continue
            if r == 3 and (next_sums != (34, 34, 34, 34) or down != 34 or up != 34):
                continue
            walk(r + 1, used_mask | mask, next_sums, down, up, chosen + (row,))

    walk(0, 0, (0, 0, 0, 0), 0, 0, ())
    return answers, solutions


def main():
    assert DATA["version"].endswith("q20-r15") and len(DATA["items"]) == 198
    assert len(DATA["availableSourceNos"]) == 22 and 17 in DATA["availableSourceNos"]
    assert 17 not in DATA["pendingSourceNos"] and INDEX["itemCount"] == 198
    assert INDEX["version"] == DATA["version"] and INDEX["pendingSourceNos"] == DATA["pendingSourceNos"]
    assert sum(x["sourceNo"] == 17 for x in INDEX["items"]) == 1
    items = [x for x in DATA["items"] if x["sourceNo"] == 17]
    assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
    assert [x["answer"] for x in items] == ["3", "14", "5", "12", "2", "15", "8", "9", "15"]
    assert all(x["reviewStatus"] == "verified" and x["pointBand"] == "3.4" for x in items)
    assert all(x["difficultyEvidence"]["label"] == "중" for x in items)

    source_text = "".join((PdfReader(str(EXAM)).pages[2].extract_text() or "").split())
    assert "다음빈칸에" in source_text and "들어갈숫자를구하시오" in source_text
    assert sha(EXAM) == REVIEW["sourceExam"]["sha256"] == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == REVIEW["sourceAnswer"]["sha256"] == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    assert REVIEW["sourceExam"]["questionNo"] == 17 and REVIEW["sourceExam"]["page"] == 3
    assert REVIEW["sourceAnswer"]["teacherMarkedAnswer"] == 3 and REVIEW["sourceAnswer"]["page"] == 17
    assert REVIEW["sourceAnswer"]["teacherMarkedAnswerText"] == "A = 3"
    assert REVIEW["sourceExam"]["givenValues"] == [16, 2, 10, 9, 6, 12, 4, 14]
    assert sha(SOURCE_CROP) == REVIEW["sourceExam"]["sourceCropSha256"]
    assert sha(ANSWER_CROP) == REVIEW["sourceAnswer"]["answerCropSha256"]
    pixels = Image.open(ANSWER_CROP).convert("RGB")
    red = sum(1 for r, g, b in pixels.get_flattened_data() if r > 160 and r > g * 1.35 and r > b * 1.35)
    assert red > 500, red

    for item in items:
        p = item["verification"]["parameters"]
        square = tuple(tuple(row) for row in p["completedSquare"])
        assert valid_square(square), item["id"]
        clues = {(r, c): square[r][c] for r, c in GIVEN_CELLS}
        assert p["givenCellsOneBased"] == [[r + 1, c + 1] for r, c in GIVEN_CELLS]
        assert p["givenValues"] == list(clues.values())
        assert p["answer"] == square[A_CELL[0]][A_CELL[1]] == int(item["answer"])
        assert p["lineSum"] == 34 and p["aCellOneBased"] == [1, 3]
        possible, solution_count = solve_a_values(clues)
        assert possible == {int(item["answer"])} and solution_count >= 1, (item["id"], possible, solution_count)
        assert p["normalMagicCompletions"] == solution_count
        assert p["possibleAValues"] == sorted(possible)
        assert item["solutionSteps"][1].endswith(f"={square[1][0]}입니다.")
        assert "첫째 행에서 A=" in item["solutionSteps"][2]
        assert item["solutionSteps"][2].endswith(f"={item['answer']}입니다.")
        if item["variantNo"] == 1:
            assert item["asset"]["src"] == "assets/applied5/q17-magic-square-original.png"
            assert sha(ROOT / "bank" / item["asset"]["src"]) == sha(SOURCE_CROP)
        else:
            asset = ROOT / "bank" / item["asset"]["src"]
            root = ET.parse(asset).getroot()
            labels = [(el.text or "").strip() for el in root.iter() if el.tag.endswith("text")]
            expected = [str(square[r][c]) for r, c in GIVEN_CELLS]
            assert labels == expected[:2] + ["A"] + expected[2:], (item["id"], labels)
            assert "answer" not in item["asset"]["description"].lower()

    print("PASS Applied5 Q17: direct source/teacher page, 9 4x4 normal magic squares, 1–16 and all line sums, independently unique A for every clue set, original crop and 8 new diagrams.")


if __name__ == "__main__":
    main()

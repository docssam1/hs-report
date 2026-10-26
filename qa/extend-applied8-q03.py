#!/usr/bin/env python3
"""Extend Applied 8 Q3's existing 4x4 normal magic-square type."""
from __future__ import annotations

import hashlib
import itertools
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw8"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER = WORK / "source-review/applied8-answer-drive-copy-q07.pdf"
RENDER = WORK / "q1-source-review/original-1.png"
CROP = ROOT / "bank/assets/applied8/q3-magic-square-original.png"
DATA = ROOT / "bank/data/applied8-expanded.json"
INDEX = ROOT / "bank/data/applied8-expanded-index.json"
VERSION = "20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26"
SOURCE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
CROP_BOX = (930, 720, 1305, 1030)
GIVENS = [(0, 3), (1, 1), (1, 2), (2, 2), (3, 1), (3, 3)]
SQUARES = [
    ((2,16,13,3),(11,5,8,10),(7,9,12,6),(14,4,1,15)),
    ((1,14,4,15),(12,7,9,6),(13,2,16,3),(8,11,5,10)),
    ((1,14,15,4),(12,7,6,9),(8,11,10,5),(13,2,3,16)),
    ((1,15,4,14),(12,6,9,7),(13,3,16,2),(8,10,5,11)),
    ((2,13,3,16),(11,8,10,5),(14,1,15,4),(7,12,6,9)),
    ((2,13,16,3),(11,8,5,10),(7,12,9,6),(14,1,4,15)),
    ((9,6,12,7),(4,15,1,14),(5,10,8,11),(16,3,13,2)),
    ((10,8,11,5),(3,13,2,16),(6,12,7,9),(15,1,14,4)),
    ((1,15,4,14),(8,10,5,11),(13,3,16,2),(12,6,9,7)),
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def enumerate_normal_magics(givens: dict[int, dict[int, int]]):
    """Exhaustively enumerate 4x4 row permutations satisfying all line constraints."""
    rows = [p for combo in itertools.combinations(range(1, 17), 4) if sum(combo) == 34
            for p in itertools.permutations(combo)]
    candidates = [[row for row in rows if all(row[c] == v for c, v in givens.get(r, {}).items())]
                  for r in range(4)]
    found = []

    def visit(r, used, columns, main, other, square):
        if len(found) > 1:
            return
        if r == 4:
            if columns == [34] * 4 and main == other == 34:
                found.append(tuple(square))
            return
        for row in candidates[r]:
            if used.intersection(row):
                continue
            cols = [columns[c] + row[c] for c in range(4)]
            d1, d2 = main + row[r], other + row[3-r]
            if r < 3 and (any(x >= 34 for x in cols) or d1 >= 34 or d2 >= 34):
                continue
            if r == 3 and (cols != [34] * 4 or d1 != 34 or d2 != 34):
                continue
            visit(r + 1, used | set(row), cols, d1, d2, square + [row])

    visit(0, set(), [0] * 4, 0, 0, [])
    return found


def svg(square):
    size, start, cell = 400, 50, 75
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">']
    end = start + cell * 4
    for i in range(5):
        v = start + i * cell
        p.append(f'<line x1="{start}" y1="{v}" x2="{end}" y2="{v}" stroke="#191511" stroke-width="2"/>')
        p.append(f'<line x1="{v}" y1="{start}" x2="{v}" y2="{end}" stroke="#191511" stroke-width="2"/>')
    for r, row in enumerate(square):
        for c, value in enumerate(row):
            if (r, c) not in GIVENS:
                continue
            x, y = start + cell*c + cell/2, start + cell*r + cell/2 + 9
            p.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Noto Serif KR,serif" font-size="27" fill="#191511">{value}</text>')
    p.append('</svg>')
    return ''.join(p)


def make_item(variant, square):
    given_values = [square[r][c] for r, c in GIVENS]
    given_sum = sum(given_values)
    answer = 136 - given_sum
    completion = enumerate_normal_magics({r: {c: square[r][c] for rr, c in GIVENS if rr == r}
                                          for r in range(4)})
    assert len(completion) == 1 and completion[0] == square
    steps = [
        "1부터 16까지의 수를 한 번씩 모두 쓰므로, 마방진 전체에 들어가는 수의 합은 1+2+…+16=16×17÷2=136입니다.",
        f"그림에 이미 적힌 수의 합은 {'+'.join(map(str, given_values))}={given_sum}입니다.",
        f"따라서 빈칸에 들어갈 수의 합은 136−{given_sum}={answer}입니다. 완성된 표에서는 가로·세로·두 대각선의 합이 모두 34이고, 1부터 16까지의 수가 한 번씩 사용됩니다.",
    ]
    asset = ({"kind": "raster", "src": "assets/applied8/q3-magic-square-original.png",
              "description": "활용 8회 원문 3번의 4×4 마방진을 원본 PDF 렌더에서 픽셀 그대로 보존"}
             if variant == 1 else
             {"kind": "svg", "src": f"assets/applied8/q3-magic-square-v{variant}.svg",
              "description": "같은 유형의 4×4 정상 마방진에서 일부 수만 제시"})
    return {
        "id": f"applied8-q03-v{variant}", "genId": "applied8-q03", "sourceSet": "applied", "sourceRound": 8,
        "sourceNo": 3, "variantNo": variant, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "수의 규칙과 관계", "detailType": "1부터 16까지의 4×4 마방진 빈칸 합 구하기",
        "pointBand": "2.7",
        "text": "아래 그림은 1부터 16까지의 수를 써 넣은 마방진입니다. 가로, 세로, 대각선의 합이 모두 같아지도록 빈칸에 써 넣은 수들의 합을 구하세요.",
        "asset": asset, "answer": str(answer), "answerParts": [answer], "answerLabels": ["빈칸에 써 넣은 수들의 합"],
        "acceptedAnswers": [str(answer), f"{answer}입니다"], "answerContract": "single-number",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "1부터 연속한 수의 전체 합에서 이미 적힌 수의 합을 빼 빈칸의 합을 구하기",
        "learningLocation": "활용 8회 · 원문 3번 · 1부터 16까지의 마방진에서 빈칸의 합",
        "verification": {
            "primaryMethod": "1부터 16까지의 총합에서 그림에 이미 적힌 여섯 수의 합을 뺀다.",
            "independentMethod": "1~16의 각 수를 한 번씩 쓰는 4×4 마방진 전체를 행순열 전수조사해 모든 행·열·두 대각선의 합과 제시 수 조건을 만족하는 완성 수를 확인한다.",
            "parameters": {"givenPositionsOneBased": [[r+1,c+1] for r,c in GIVENS],
                           "givenValues": given_values, "givenSum": given_sum, "allNumbersSum": 136,
                           "magicLineSum": 34, "uniqueNormalMagicCompletions": 1,
                           "completedSquare": [list(row) for row in square], "answer": answer},
            "independentSuite": "qa/applied8-q03-independent-validate.py",
            "sourceExamPage": 1, "sourceExamFile": EXAM.name,
            "sourceExamDriveFileId": "1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae",
            "sourceAnswerPage": 1, "sourceAnswerDriveFileId": "1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p",
            "sourceDrawingCompared": True, "sourceDrawingPresent": True,
            "sourceDrawingPixelExactCrop": variant == 1,
            "officialAnswerStatus": "The available Drive answer candidate is an unmarked exam duplicate; answer is independently derived from 1+…+16 and the six printed givens.",
            "studentDifficultyMeasured": False},
        "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
                               "measuredVariantRate": None, "estimated": False,
                               "rationale": "활용 8회 원문 3번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."}
    }


def main():
    data, index = json.loads(DATA.read_text()), json.loads(INDEX.read_text())
    assert not any(x["sourceNo"] == 3 for x in data["items"])
    exam, answer = PdfReader(str(EXAM)).pages[0], PdfReader(str(ANSWER)).pages[0]
    norm = lambda x: "".join((x or "").split())
    exam_text, answer_text = norm(exam.extract_text()), norm(answer.extract_text())
    assert exam_text == answer_text and "수를써넣은마방진입니다" in exam_text and "합이모두같아지도록" in exam_text
    CROP.parent.mkdir(parents=True, exist_ok=True)
    Image.open(RENDER).crop(CROP_BOX).save(CROP)
    items = [make_item(i, square) for i, square in enumerate(SQUARES, 1)]
    data["items"].extend(items)
    data["availableSourceNos"] = SOURCE_NUMBERS
    data["pendingSourceNos"] = [n for n in range(1, 31) if n not in SOURCE_NUMBERS]
    data["itemCount"], data["version"] = len(data["items"]), VERSION
    index["items"].append({"sourceNo": 3, "genId": "applied8-q03", "area": "수와 식", "subarea": "수의 규칙과 관계",
                           "detailType": "1부터 16까지의 4×4 마방진 빈칸 합 구하기", "pointBand": "2.7",
                           "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index.update({"pendingSourceNos": data["pendingSourceNos"], "itemCount": len(data["items"]), "version": VERSION})
    for i, square in enumerate(SQUARES[1:], 2):
        (ROOT / f"bank/assets/applied8/q3-magic-square-v{i}.svg").write_text(svg(square), encoding="utf-8")
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    review = {"sourceExam": {"file": EXAM.name, "sha256": sha(EXAM), "page": 1, "questionNo": 3,
                              "directVisualReview": True, "stem": exam.extract_text(),
                              "sourceFigure": {"rows": 4, "columns": 4, "givenCellsOneBased": [[r+1,c+1] for r,c in GIVENS],
                                               "givenValues": [SQUARES[0][r][c] for r,c in GIVENS]}},
              "sourceCrop": {"file": str(CROP.relative_to(ROOT)), "sha256": sha(CROP),
                             "cropBoxOnOriginalRenderedPage": list(CROP_BOX), "pixels": list(Image.open(CROP).size),
                             "pixelExactSourceRender": True},
              "answerCandidate": {"file": ANSWER.name, "sha256": sha(ANSWER), "page": 1,
                                  "directVisualReview": True, "containsAnswers": False, "pageTextMatchesQuestionPdf": True},
              "answerSourceConclusion": "The available Drive answer candidate is a blank duplicate. Source answer 89 follows from 1+…+16=136 and the six printed entries summing to 47; exhaustive normal-magic enumeration also found the unique completion.",
              "sourceAnswer": 89, "sourceCompletedSquare": [list(row) for row in SQUARES[0]],
              "sourceLineSums": {"rows": [sum(row) for row in SQUARES[0]],
                                 "columns": [sum(SQUARES[0][r][c] for r in range(4)) for c in range(4)],
                                 "mainDiagonal": sum(SQUARES[0][i][i] for i in range(4)),
                                 "otherDiagonal": sum(SQUARES[0][i][3-i] for i in range(4))},
              "sourceUniqueCompletions": 1, "variantCount": 9, "newSourceTypes": 0,
              "difficulty": "2.7-point band only = low"}
    (WORK / "q03-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    math = {"allNumbers": list(range(1,17)), "totalSum": 136, "magicLineSum": 34,
            "givensOneBased": [[r+1,c+1] for r,c in GIVENS], "cases": []}
    for case, item in zip(SQUARES, items):
        given_values = [case[r][c] for r,c in GIVENS]
        all_rows = [sum(row) for row in case]
        all_cols = [sum(case[r][c] for r in range(4)) for c in range(4)]
        d1, d2 = sum(case[i][i] for i in range(4)), sum(case[i][3-i] for i in range(4))
        assert sorted(v for row in case for v in row) == list(range(1,17))
        assert all_rows == all_cols == [34]*4 and d1 == d2 == 34
        givens = {r: {c: case[r][c] for rr,c in GIVENS if rr == r} for r in range(4)}
        completions = enumerate_normal_magics(givens)
        assert len(completions) == 1 and tuple(map(tuple, case)) == completions[0]
        math["cases"].append({"completedSquare": [list(row) for row in case], "givenValues": given_values,
                              "givenSum": sum(given_values), "blankSum": int(item["answer"]),
                              "rowSums": all_rows, "columnSums": all_cols, "diagonalSums": [d1,d2],
                              "uniqueCompletions": len(completions)})
    (WORK / "q03-independent-math.json").write_text(json.dumps(math, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS Q3 source + variants: answers={[x['answer'] for x in items]}; inventory={len(data['items'])}; types={len(SOURCE_NUMBERS)}; r26")


if __name__ == "__main__":
    main()

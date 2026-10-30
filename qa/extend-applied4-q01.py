#!/usr/bin/env python3
"""Extend Applied 4 Q1 with nine reviewed repeated-digit addition puzzles."""
from __future__ import annotations

import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw4"
DATA_PATH = ROOT / "bank/data/applied4-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied4-expanded-index.json"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 4회 답안.pdf")
PDFTOPPM = Path("/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm")
VERSION = "20261025-applied4-expansion-q01-r2"
CASES = [(3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (4, 2), (4, 3), (4, 4), (4, 5)]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def svg_for(fixed_digit: int, width: int) -> str:
    step = 72
    result_positions = [140 + i * step for i in range(width + 1)]
    # Align the ones place of both addends with the fixed final digit.
    star_x = result_positions[1:]
    y1, y2, line_y, y3 = 54, 112, 142, 196
    stars = "\n".join(f'<polygon points="{x},{y1-18} {x+5},{y1-5} {x+19},{y1-5} {x+8},{y1+3} {x+12},{y1+17} {x},{y1+9} {x-12},{y1+17} {x-8},{y1+3} {x-19},{y1-5} {x-5},{y1-5}"/>' for x in star_x)
    circles = " ".join(f'<circle cx="{x}" cy="{y2}" r="14"/>' for x in star_x)
    diamond_x = result_positions[0]
    result_circles = " ".join(f'<circle cx="{x}" cy="{y3}" r="14"/>' for x in result_positions[1:-1])
    d_x = result_positions[-1]
    svg_w = d_x + 80
    line_left, line_right = 112, d_x + 24
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{svg_w}" height="230" viewBox="0 0 {svg_w} 230" role="img" aria-label="별 {width}개 더하기 원 {width}개는 마름모, 원 {width-1}개, 숫자 {fixed_digit}로 이루어진 수입니다.">
<rect width="100%" height="100%" fill="#fff"/>
<g fill="none" stroke="#191511" stroke-width="2.1" stroke-linejoin="round">
<g fill="#fff">{stars}</g>
<g fill="#fff">{circles}</g>
<line x1="{line_left}" y1="{line_y}" x2="{line_right}" y2="{line_y}"/>
<polygon points="{diamond_x},{y3-17} {diamond_x+17},{y3} {diamond_x},{y3+17} {diamond_x-17},{y3}" fill="#fff"/>
<g fill="#fff">{result_circles}</g>
</g>
<text x="70" y="{y2+9}" text-anchor="middle" font-family="serif" font-size="27" fill="#191511">+</text>
<text x="{d_x}" y="{y3+10}" text-anchor="middle" font-family="serif" font-size="28" fill="#191511">{fixed_digit}</text>
</svg>'''


def solve_exhaustively(width: int, fixed_digit: int) -> list[tuple[int, int, int]]:
    """Brute force the symbol values. Leading star/diamond cannot be zero."""
    repunit = int("1" * width)
    solutions = []
    for star in range(1, 10):
        for circle in range(10):
            for diamond in range(1, 10):
                addends = repunit * star + repunit * circle
                result = diamond * 10**width + circle * int("1" * (width - 1)) * 10 + fixed_digit
                if addends == result:
                    solutions.append((star, circle, diamond))
    return solutions


def main() -> None:
    assert EXAM.is_file() and ANSWER.is_file()
    assert len(PdfReader(str(EXAM)).pages) == 6 and len(PdfReader(str(ANSWER)).pages) == 30
    assert sha(EXAM) == "f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59"
    assert sha(ANSWER) == "67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8"
    WORK.mkdir(parents=True, exist_ok=True)
    render_dir = WORK / "source-review"
    render_dir.mkdir(exist_ok=True)
    for source, stem in ((EXAM, "q01-exam"), (ANSWER, "q01-answer")):
        out = render_dir / stem
        subprocess.run([str(PDFTOPPM), "-f", "1", "-l", "1", "-png", "-r", "160", str(source), str(out)], check=True)

    items = []
    proofs = []
    for variant, (width, fixed_digit) in enumerate(CASES, 1):
        solutions = solve_exhaustively(width, fixed_digit)
        assert len(solutions) == 1, (width, fixed_digit, solutions)
        star, circle, diamond = solutions[0]
        assert star == 9 and diamond == 1 and circle == fixed_digit + 1
        svg_path = ROOT / f"bank/assets/applied4/q01-v{variant}-r2.svg"
        svg_path.parent.mkdir(parents=True, exist_ok=True)
        svg_path.write_text(svg_for(fixed_digit, width), encoding="utf-8")
        ET.parse(svg_path)
        equation = f"{'★' * width} + {'●' * width} = ◆{'●' * (width-1)}{fixed_digit}"
        if width == 3:
            steps = [
                "별을 A, 원을 B, 마름모를 C라 하고, 세 자리 같은 숫자는 111×그 숫자로 나타냅니다.",
                f"111A+111B=1000C+110B+{fixed_digit}이므로 111A+B=1000C+{fixed_digit}입니다. 왼쪽은 1008 이하이므로 C=1입니다.",
                f"A가 8 이하이면 111A+B는 897 이하라 1000+{fixed_digit}가 될 수 없습니다. 따라서 A=9이고, 999+B=1000+{fixed_digit}에서 B={fixed_digit+1}입니다.",
                f"따라서 별 {star}, 원 {circle}, 마름모 {diamond}입니다. 실제 식은 {int('1'*width)*star}+{int('1'*width)*circle}={int('1'*width)*star + int('1'*width)*circle}입니다."
            ]
        else:
            steps = [
                "별을 A, 원을 B, 마름모를 C라 하고, 네 자리 같은 숫자는 1111×그 숫자로 나타냅니다.",
                f"1111A+1111B=10000C+1110B+{fixed_digit}이므로 1111A+B=10000C+{fixed_digit}입니다. 왼쪽은 10008 이하이므로 C=1입니다.",
                f"A가 8 이하이면 1111A+B는 8897 이하라 10000+{fixed_digit}가 될 수 없습니다. 따라서 A=9이고, 9999+B=10000+{fixed_digit}에서 B={fixed_digit+1}입니다.",
                f"따라서 별 {star}, 원 {circle}, 마름모 {diamond}입니다. 실제 식은 {int('1'*width)*star}+{int('1'*width)*circle}={int('1'*width)*star + int('1'*width)*circle}입니다."
            ]
        answer = [star, circle, diamond]
        asset_rel = svg_path.relative_to(ROOT / "bank").as_posix()
        items.append({
            "id": f"applied4-q01-v{variant}", "genId": "applied4-q01", "sourceSet": "applied", "sourceRound": 4,
            "sourceNo": 1, "variantNo": variant, "reviewStatus": "verified", "area": "수와 식",
            "subarea": "수의 연산과 기호", "detailType": "같은 기호가 나타내는 숫자를 반복 덧셈에서 찾기", "pointBand": "2.7",
            "text": "덧셈식에서 같은 모양은 같은 숫자를 나타냅니다. 별, 원, 마름모에 알맞은 숫자를 차례로 구하세요.",
            "asset": {"kind": "vector", "src": asset_rel, "width": 436 if width == 3 else 508, "height": 230,
                      "description": f"별 {width}개 더하기 원 {width}개가 마름모·원 {width-1}개·{fixed_digit}가 되는 세로 덧셈식"},
            "answer": ", ".join(map(str, answer)), "answerParts": answer, "answerLabels": ["별", "원", "마름모"],
            "acceptedAnswers": [", ".join(map(str, answer)), " ".join(map(str, answer))], "answerContract": "ordered-parts",
            "solutionSteps": steps, "solution": " ".join(steps),
            "learningPoint": "같은 숫자가 반복되는 수의 자릿값을 식으로 나타내고 일의 자리와 올림 조건을 함께 살피기",
            "learningLocation": "활용 4회 · 원문 1번 · 반복 덧셈식과 기호가 나타내는 숫자",
            "verification": {"primaryMethod": "각 기호에 0~9를 대입하되 앞자리 별·마름모는 0이 될 수 없게 하여 가능한 대응을 전수 확인",
                "independentMethod": "반복단위 식으로 정리하여 선두 자릿수와 끝자리 조건을 이용해 대응을 대수적으로 결정",
                "parameters": {"repeatedDigitCount": width, "fixedFinalDigit": fixed_digit, "allValidAssignments": [answer],
                    "repeatedUnit": int("1"*width), "resultPattern": f"{diamond}{str(circle)*(width-1)}{fixed_digit}", "equation": equation},
                "independentSuite": "qa/applied4-q01-independent-validate.py", "sourceExamPage": 1, "sourceAnswerPage": 1,
                "sourceExamFile": EXAM.name, "sourceAnswerFile": ANSWER.name,
                "sourceAnswerDriveFileId": "1-Cr2jAfw1bK8Z-OkvlcyB3iaDyMXu7Av", "sourceDrawingCompared": True,
                "sourceDrawingPresent": True, "variantDrawingType": "black-and-white-vector-repeated-digit-addition-layout",
                "officialAnswerStatus": "답안 후보 PDF p1 손글씨 별 9·원 3·마름모 1을 확인했다. 원문 식을 전수 대입해 같은 답과 유일성을 독립 재현했다. PDF가 공식 정답표인지 여부는 미확인이다.",
                "studentDifficultyMeasured": False},
            "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True,
                "measuredVariantRate": None, "estimated": False, "rationale": "활용4 원문 p1에서 1~12번은 2.7점으로 표시되어 있어 활용 난도는 배점대만 적용한다."}
        })
        proofs.append({"variant": variant, "width": width, "fixedDigit": fixed_digit,
                       "solutionsExhaustive": [list(x) for x in solutions], "answer": answer,
                       "equation": equation, "asset": asset_rel})

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    assert data["sourceRound"] == 4 and data["availableSourceNos"] == list(range(5, 31))
    assert data["pendingSourceNos"] == [1, 2, 3, 4] and len(data["items"]) == 234
    assert index["itemCount"] == 234 and index["pendingSourceNos"] == [1, 2, 3, 4]
    prior_sha = hashlib.sha256(json.dumps(data["items"], ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
    data["items"] = items + data["items"]
    data["availableSourceNos"] = [1] + list(range(5, 31))
    data["pendingSourceNos"] = [2, 3, 4]
    data["version"] = VERSION
    data["revision"] = VERSION
    data["reviewSummary"]["q01DirectSourceComparison"] = True
    data["reviewSummary"]["q01IndependentMathCount"] = 9
    data["reviewSummary"]["q01SourceAnswerCandidate"] = [9, 3, 1]
    data["reviewSummary"]["q01ActualZipReviewed"] = False
    data["q01ExpansionReview"] = {"variants": 9, "sourceAnswerDriveFileId": "1-Cr2jAfw1bK8Z-OkvlcyB3iaDyMXu7Av",
                                  "preservedPriorItemsSha256": prior_sha, "status": "independent math reviewed; output ZIP/browser checks pending"}
    index["version"] = VERSION
    index["itemCount"] = 243
    index["pendingSourceNos"] = [2, 3, 4]
    index["items"].insert(0, {"sourceNo": 1, "genId": "applied4-q01", "area": "수와 식", "subarea": "수의 연산과 기호",
        "detailType": "같은 기호가 나타내는 숫자를 반복 덧셈에서 찾기", "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    review = {"sourceExam": {"name": EXAM.name, "sha256": sha(EXAM), "page": 1, "questionNumber": 1,
                "directVisualReview": True, "render": str((render_dir / "q01-exam-1.png").relative_to(ROOT)),
                "question": "덧셈식에서 같은 모양은 같은 숫자를 나타냅니다.", "originalEquation": "★★★ + ●●● = ◆●●2"},
              "sourceAnswer": {"name": ANSWER.name, "driveId": "1-Cr2jAfw1bK8Z-OkvlcyB3iaDyMXu7Av", "sha256": sha(ANSWER),
                "page": 1, "questionNumber": 1, "directVisualReview": True,
                "render": str((render_dir / "q01-answer-01.png").relative_to(ROOT)),
                "observedHandwriting": {"star": 9, "circle": 3, "diamond": 1},
                "officialKeyStatus": "candidate answer PDF with screen annotation; not identified as official answer key"},
              "sourceTypeAlreadyPresent": False, "newSourceTypesAdded": 0, "directOriginalQuestionAndAnswerPagesReviewed": True,
              "originalEquationExhaustiveAssignments": [[9, 3, 1]], "variantCount": 9, "variants": proofs, "dataVersion": VERSION}
    (WORK / "q01-source-answer-review-r2.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"dataVersion": VERSION, "itemCount": len(data["items"]), "availableTypes": len(data["availableSourceNos"]),
                      "pending": data["pendingSourceNos"], "q01Answers": [x["answerParts"] for x in items],
                      "preservedPriorItemsSha256": prior_sha}, ensure_ascii=False))


if __name__ == "__main__":
    main()

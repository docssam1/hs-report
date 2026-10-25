#!/usr/bin/env python3
"""Verify actual downloaded Applied 5 source ZIPs and the complete r13 bank ZIP."""
import csv
import io
import json
import zipfile
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".private-work/hw-expansion-20261023/hw5/output-qa-r13"
R11_OUT = ROOT / ".private-work/hw-expansion-20261023/hw5/output-qa-r11"
OLD_OUT = ROOT / ".private-work/hw-expansion-20261023/hw5/output-qa-r8"
PREVIOUS_OUT = ROOT / ".private-work/hw-expansion-20261023/hw5/output-qa-r10"
Q3_ZIP = OLD_OUT / "applied5-q03-9.zip"
Q5_ZIP = OLD_OUT / "applied5-q05-9.zip"
Q6_ZIP = OLD_OUT / "applied5-q06-9.zip"
Q8_ZIP = OLD_OUT / "applied5-q08-9.zip"
Q9_ZIP = OLD_OUT / "applied5-q09-9.zip"
Q11_ZIP = OLD_OUT / "applied5-q11-9.zip"
Q12_ZIP = OLD_OUT / "applied5-q12-9.zip"
Q17_ZIP = OUT / "applied5-q17-9.zip"
Q18_ZIP = OUT / "applied5-q18-9.zip"
FULL_ZIP = OUT / "selected-180.zip"
DEST = ROOT / ".private-work/hw-expansion-20261023/hw5/q03-q05-q06-q08-q09-q11-q12-q16-q17-q18-output-qa-r13/extracted"
DATA = json.loads((ROOT / "bank/data/applied5-expanded.json").read_text())

EXPECTED_FILES = {
    "문제.pdf", "답안과상세풀이.pdf", "문제.html", "답안과상세풀이.html",
    "빠른정답.csv", "문항목록.json", "검수기록.json",
}


def inspect(path, expected_ids, questions, solutions, source_no):
    with zipfile.ZipFile(path) as z:
        assert set(z.namelist()) == EXPECTED_FILES
        record = json.loads(z.read("검수기록.json"))
        listing = json.loads(z.read("문항목록.json"))
        question_html = z.read("문제.html").decode("utf-8")
        solution_html = z.read("답안과상세풀이.html").decode("utf-8")
        quick = list(csv.DictReader(io.StringIO(z.read("빠른정답.csv").decode("utf-8-sig"))))
        ids = [x["id"] for x in listing["items"]]
        assert listing["count"] == len(expected_ids) == record["count"]
        assert ids == expected_ids == record["selectedIds"]
        assert [x["문항ID"] for x in quick] == expected_ids
        assert len(PdfReader(io.BytesIO(z.read("문제.pdf"))).pages) == record["questionPdfPages"] == questions
        assert len(PdfReader(io.BytesIO(z.read("답안과상세풀이.pdf"))).pages) == record["solutionPdfPages"] == solutions
        assert all(x in question_html and x in solution_html for x in expected_ids)
        expected_svgs = 89 if source_no == 0 else 8 if source_no == 17 else 9 if source_no in (3, 6, 8, 9, 11, 12, 14, 15, 16) else 0
        assert question_html.count("data:image/svg+xml") == expected_svgs
        if expected_svgs:
            assert "data:image/svg+xml" in question_html
        if source_no == 3:
            assert "5의 배수" in solution_html and "12의 배수" in solution_html
        if source_no == 6:
            assert "서로 다른" in solution_html and "올림" in solution_html
        if source_no == 9:
            assert "흰색" in solution_html and "검은색" in solution_html and "회색" in solution_html
        if source_no == 8:
            assert "연속한 원 무리" in solution_html and "음이 아닌 정수해" in solution_html
        if source_no == 11:
            assert "거리표" in solution_html and "가＝" in solution_html and "라＝" in solution_html
        if source_no == 12:
            assert "층 순서" in solution_html and "맨 위에는" in solution_html
        if source_no == 15:
            assert "앞면-윗면 겹침" in solution_html and "세 면에서 동시에 겹치는" in solution_html
            for item in DATA["items"]:
                if item["sourceNo"] == 15:
                    p = item["verification"]["parameters"]
                    expr = f"20+20+18−{p['frontTopOverlap']}−{p['frontRightOverlap']}−{p['topRightOverlap']}+{p['tripleOverlap']}={item['answer']}개"
                    assert item["id"] in solution_html and expr in solution_html
        if source_no == 17:
            assert "마방진" in solution_html and "A=3" in solution_html
            for item in DATA["items"]:
                if item["sourceNo"] == 17:
                    p = item["verification"]["parameters"]
                    assert item["id"] in solution_html and f"={item['answer']}입니다." in solution_html
                    assert p["uniqueAValue"] is True and p["normalMagicCompletions"] == 1
        if source_no == 18:
            assert "처음 계획한 월 지출액" in solution_html and "실제 지출" in solution_html
            for item in DATA["items"]:
                if item["sourceNo"] == 18:
                    p = item["verification"]["parameters"]
                    assert item["id"] in solution_html
                    assert f"={p['initialMoney']:,}원입니다." in solution_html
                    assert f"={p['plannedMonthlySpending']:,}원입니다." in solution_html
        if source_no == 16:
            assert "가장 짧은 길" in solution_html and "5.5" not in question_html
            for item in DATA["items"]:
                if item["sourceNo"] == 16:
                    p = item["verification"]["parameters"]
                    assert item["id"] in solution_html
                    assert f"따라서 가장 짧은 길로 가는 방법은 {item['answer']}가지입니다." in solution_html
                    assert p["shortestPathCount"] == int(item["answer"])
        if source_no == 14:
            assert "격자선으로 된 직사각형" in solution_html and "대각선" in solution_html
            for item in DATA["items"]:
                if item["sourceNo"] == 14:
                    parts = item["verification"]["parameters"]["quadrilateralCountsByDiagonalSides"]
                    expr = f"36+{parts[1]}+{parts[2]}={item['answer']}개"
                    assert item["id"] in solution_html and expr in solution_html
        if source_no == 5:
            assert "좋아하지 않습니다" in solution_html and "조건 추론" in solution_html
        if source_no == 9:
            assert "흰색" in solution_html and "검은색" in solution_html and "회색" in solution_html
        assert "학습 위치" in solution_html and "학습 포인트" in solution_html
        assert all(not x.startswith("file:") for x in (question_html, solution_html))
        return {"zip": path.name, "entries": len(z.namelist()), "count": len(ids),
                "questionPages": questions, "solutionPages": solutions,
                "svgDiagrams": question_html.count("data:image/svg+xml"),
                "idsSha": __import__("hashlib").sha256("\n".join(ids).encode()).hexdigest()}


def main():
    q3_items = [x for x in DATA["items"] if x["sourceNo"] == 3]
    assert len(q3_items) == 9
    q3_ids = [x["id"] for x in q3_items]
    all_ids = [x["id"] for x in DATA["items"]]
    q6_items = [x for x in DATA["items"] if x["sourceNo"] == 6]
    q8_items = [x for x in DATA["items"] if x["sourceNo"] == 8]
    q9_items = [x for x in DATA["items"] if x["sourceNo"] == 9]
    q11_items = [x for x in DATA["items"] if x["sourceNo"] == 11]
    q12_items = [x for x in DATA["items"] if x["sourceNo"] == 12]
    q14_items = [x for x in DATA["items"] if x["sourceNo"] == 14]
    q15_items = [x for x in DATA["items"] if x["sourceNo"] == 15]
    q16_items = [x for x in DATA["items"] if x["sourceNo"] == 16]
    q17_items = [x for x in DATA["items"] if x["sourceNo"] == 17]
    q18_items = [x for x in DATA["items"] if x["sourceNo"] == 18]
    q5_items = [x for x in DATA["items"] if x["sourceNo"] == 5]
    assert len(q5_items) == 9
    q5_ids = [x["id"] for x in q5_items]
    assert len(q6_items) == 9
    q6_ids = [x["id"] for x in q6_items]
    assert len(q8_items) == 9
    q8_ids = [x["id"] for x in q8_items]
    q9_ids = [x["id"] for x in q9_items]
    assert len(q11_items) == 9
    q11_ids = [x["id"] for x in q11_items]
    assert len(q12_items) == 9
    assert len(q14_items) == 9
    assert len(q15_items) == 9
    assert len(q16_items) == 9
    assert len(q17_items) == 9
    assert len(q18_items) == 9
    q15_ids = [x["id"] for x in q15_items]
    q16_ids = [x["id"] for x in q16_items]
    q17_ids = [x["id"] for x in q17_items]
    q18_ids = [x["id"] for x in q18_items]
    q12_ids = [x["id"] for x in q12_items]
    q14_ids = [x["id"] for x in q14_items]
    q3_result = inspect(Q3_ZIP, q3_ids, 3, 3, 3)
    q5_result = inspect(Q5_ZIP, q5_ids, 2, 3, 5)
    q6_result = inspect(Q6_ZIP, q6_ids, 3, 5, 6)
    q8_result = inspect(Q8_ZIP, q8_ids, 3, 3, 8)
    q9_result = inspect(Q9_ZIP, q9_ids, 3, 3, 9)
    q11_result = inspect(Q11_ZIP, q11_ids, 3, 3, 11)
    q12_result = inspect(Q12_ZIP, q12_ids, 3, 3, 12)
    q14_result = inspect(PREVIOUS_OUT / "applied5-q14-9.zip", q14_ids, 3, 3, 14)
    q15_result = inspect(PREVIOUS_OUT / "applied5-q15-9.zip", q15_ids, 3, 3, 15)
    q16_result = inspect(R11_OUT / "applied5-q16-9.zip", q16_ids, 3, 3, 16)
    q17_result = inspect(Q17_ZIP, q17_ids, 3, 5, 17)
    q18_result = inspect(Q18_ZIP, q18_ids, 3, 5, 18)
    full_result = inspect(FULL_ZIP, all_ids, 40, 66, 0)
    DEST.mkdir(parents=True, exist_ok=True)
    for name in ("문제.pdf", "답안과상세풀이.pdf"):
        with zipfile.ZipFile(PREVIOUS_OUT / "applied5-q14-9.zip") as z:
            (DEST.parent / ("q14-" + name)).write_bytes(z.read(name))
    for name in ("문제.pdf", "답안과상세풀이.pdf"):
        with zipfile.ZipFile(Q3_ZIP) as z:
            (DEST / name).write_bytes(z.read(name))
    result = {"q03": q3_result, "q05": q5_result, "q06": q6_result, "q08": q8_result, "q09": q9_result, "q11": q11_result, "q12": q12_result, "q14": q14_result, "q15": q15_result, "q16": q16_result, "q17": q17_result, "q18": q18_result, "full": full_result}
    (DEST.parent / "zip-validation-r13.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS actual ZIPs: Q3/Q5/Q6/Q8/Q9/Q11/Q12/Q14/Q15/Q16/Q17/Q18 9 items each; full bank {full_result['count']} items/40+66 pages; 7 files each; IDs, diagrams, answers and solutions present.")


if __name__ == "__main__":
    main()

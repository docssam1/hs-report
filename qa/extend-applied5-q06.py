#!/usr/bin/env python3
"""Add nine stored variants of Applied 5 Q6's letter-addition type."""
import hashlib
import itertools
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA_PATH = ROOT / "bank/data/applied5-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied5-expanded-index.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf")
SOURCE_RENDER = WORK / "q06-source/exam-q06-1.png"
ANSWER_RENDER = WORK / "q06-source/answer-06.png"
ASSET_DIR = ROOT / "bank/assets/applied5"
VERSION = "20261025-applied5-expansion-q03-q06-r3"
TARGETS = [1510, 1630, 1750, 1880, 2010, 2140, 2230, 2400, 2600]
SOURCE_TOTAL = 2000


def value(d):
    m, a, t, h = d
    return 1000 * m + 200 * a + 30 * t + 4 * h


def direct_solutions(total):
    return [d for d in itertools.permutations(range(10), 4) if d[0] != 0 and value(d) == total]


def carry_solutions(total):
    """Column-by-column solver independent from direct whole-number summation."""
    thousands, hundreds, tens, units = map(int, str(total))
    found = []
    for h in range(10):
        c1, d1 = divmod(4 * h, 10)
        if d1 != units:
            continue
        for t in range(10):
            c2, d2 = divmod(3 * t + c1, 10)
            if d2 != tens or t == h:
                continue
            for a in range(10):
                c3, d3 = divmod(2 * a + c2, 10)
                if d3 != hundreds or a in (h, t):
                    continue
                m = thousands - c3
                if m < 1 or m in (a, t, h):
                    continue
                if m + c3 == thousands:
                    found.append((m, a, t, h))
    return found


def svg(total):
    xs = [155, 205, 255, 305]
    chunks = ['<svg xmlns="http://www.w3.org/2000/svg" width="360" height="204" viewBox="0 0 360 204" role="img" aria-label="문자 세로 덧셈식">']
    rows = [(["M", "A", "T", "H"], 35), (["", "A", "T", "H"], 71), (["", "", "T", "H"], 107), (["", "", "", "H"], 143)]
    for chars, y in rows:
        for x, char in zip(xs, chars):
            if char:
                chunks.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-family="serif" font-size="29" fill="#191511">{char}</text>')
    chunks.append('<text x="126" y="143" text-anchor="middle" font-family="serif" font-size="29" fill="#191511">+</text>')
    chunks.append('<line x1="126" y1="153" x2="326" y2="153" stroke="#191511" stroke-width="1.5"/>')
    for x, digit in zip(xs, str(total)):
        chunks.append(f'<text x="{x}" y="190" text-anchor="middle" font-family="serif" font-size="28" fill="#191511">{digit}</text>')
    chunks.append('</svg>')
    return ''.join(chunks)


def branch_result(total, h):
    thousands, hundreds, tens, units = map(int, str(total))
    c1, d1 = divmod(4 * h, 10)
    assert d1 == units
    t = next(t for t in range(10) if (3 * t + c1) % 10 == tens)
    c2, _ = divmod(3 * t + c1, 10)
    if t == h:
        rejected = {"T": t, "reject": "T와 H가 같습니다"}
        return {"H": h, "carryOnes": c1, "T": t, "carryTens": c2,
                "hundredsCandidates": [rejected], "valid": [], "invalid": [rejected]}
    candidates = []
    for a in range(10):
        c3, d3 = divmod(2 * a + c2, 10)
        if d3 != hundreds:
            continue
        m = thousands - c3
        reason = None
        if a in (h, t):
            reason = "A가 이미 사용한 숫자와 같습니다"
        elif m == 0:
            reason = "M이 0이면 네 자리 수가 아닙니다"
        elif m in (a, t, h):
            reason = "M이 이미 사용한 숫자와 같습니다"
        else:
            candidates.append((m, a, t, h))
        if reason:
            candidates.append({"A": a, "M": m, "reject": reason})
    valid = [x for x in candidates if isinstance(x, tuple)]
    invalid = [x for x in candidates if isinstance(x, dict)]
    return {"H": h, "carryOnes": c1, "T": t, "carryTens": c2, "hundredsCandidates": candidates, "valid": valid, "invalid": invalid}


def solution_text(total, digits):
    m, a, t, h = digits
    b0, b5 = branch_result(total, 0), branch_result(total, 5)
    chosen = b0 if b0["valid"] else b5
    rejected = b5 if chosen is b0 else b0
    rejected_line = f"H={rejected['H']}일 때 십의 자리 조건으로 T={rejected['T']}입니다. 백의 자리 후보를 확인하면 "
    if rejected["invalid"]:
        rejected_line += " / ".join(
            f"A={x['A']}일 때 {x['reject']}" if "A" in x else f"T={x['T']}일 때 {x['reject']}"
            for x in rejected["invalid"]
        ) + "."
    else:
        rejected_line += "목표의 백의 자리 숫자를 만들 수 없습니다."
    valid_a = [x for x in chosen["valid"] if isinstance(x, tuple)]
    assert len(valid_a) == 1
    c = valid_a[0]
    assert c == digits
    c1 = 4 * h // 10
    c2 = (3 * t + c1) // 10
    c3 = (2 * a + c2) // 10
    tens_column = 3*t + c1
    hundreds_column = 2*a + c2
    steps = [
        f"일의 자리에서 H+H+H+H=4H이고 합의 일의 자리가 0입니다. 따라서 H는 0 또는 5입니다. H=0이면 올림은 0, H=5이면 올림은 2입니다.",
        rejected_line + f" 따라서 H={h}인 경우만 남습니다. 이때 십의 자리에서 3×{t}+{c1}={tens_column}이므로 십의 숫자는 {tens_column%10}, 올림은 {c2}입니다. 백의 자리에서 2×{a}+{c2}={hundreds_column}이므로 백의 숫자는 {hundreds_column%10}, 올림은 {c3}입니다.",
        f"천의 자리에서 M+{c3}={m}이므로 M={m}입니다. 따라서 M={m}, A={a}, T={t}, H={h}이고, {m}{a}{t}{h}+{a}{t}{h}+{t}{h}+{h}={total}로 확인됩니다.",
    ]
    return steps
def build_item(no, total):
    solutions = direct_solutions(total)
    carries = carry_solutions(total)
    assert len(solutions) == len(carries) == 1 and solutions == carries
    digits = solutions[0]
    m, a, t, h = digits
    steps = solution_text(total, digits)
    gen = "applied5-q06"
    return {
        "id": f"{gen}-v{no}", "genId": gen, "sourceSet": "applied", "sourceRound": 5,
        "sourceNo": 6, "variantNo": no, "reviewStatus": "verified",
        "area": "수와 식", "subarea": "문자와 세로 덧셈", "detailType": "서로 다른 문자의 반복 덧셈",
        "pointBand": "2.7",
        "text": "아래 M, A, T, H는 서로 다른 문자를 나타냅니다. 각 문자에 알맞은 숫자를 구하세요.",
        "asset": {"kind": "svg", "src": f"assets/applied5/q06-v{no}.svg", "description": f"서로 다른 네 문자의 세로 덧셈식, 합계 {total}"},
        "answer": f"M={m}, A={a}, T={t}, H={h}", "answerParts": list(digits),
        "answerLabels": ["M", "A", "T", "H"],
        "acceptedAnswers": [", ".join(map(str, digits)), " ".join(map(str, digits)), "".join(map(str, digits))],
        "answerContract": "ordered-parts", "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "세로 덧셈의 각 자리 합과 올림을 차례로 적용하고, 서로 다른 숫자 조건을 함께 확인하기",
        "learningLocation": "활용 5회 · 원문 6번 · 서로 다른 문자의 반복 덧셈",
        "verification": {
            "primaryMethod": "MATH + ATH + TH + H를 숫자로 바꾸어 1000M + 200A + 30T + 4H로 계산하고 서로 다른 숫자를 전수 대입한다.",
            "independentMethod": "일의 자리부터 올림을 추적하며 각 자리 숫자 조건을 적용하는 세로 덧셈 전수 탐색.",
            "parameters": {"total": total, "digits": list(digits), "carryCandidates": [branch_result(total, 0), branch_result(total, 5)]},
            "independentSuite": "qa/applied5-q06-independent-validate.py",
            "sourceExamPage": 1, "sourceAnswerPage": 6,
            "sourceExamFile": "초등과정 대비 실전 모의고사활용 5회.pdf",
            "sourceAnswerFile": "초등 선발 모의고사 특강 5회 답안.pdf",
            "sourceExamDriveFileId": "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp",
            "sourceAnswerDriveFileId": "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05",
            "sourceDrawingCompared": True, "variantDrawingType": "letter-column-addition",
            "sourceAnswerStatus": "Drive answer PDF page 6 shows M=1, A=4, T=6, H=5 in handwriting; direct enumeration confirms uniqueness.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "하", "sourceReasoningPreserved": True, "measuredVariantRate": None, "estimated": False, "rationale": "활용 5회 원문 6번은 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다."},
    }


def main():
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    if any(x.get("sourceNo") == 6 for x in data["items"]):
        raise SystemExit("Applied5 Q6 already exists; refusing to duplicate it.")
    if 6 not in data["pendingSourceNos"] or 6 in data["availableSourceNos"]:
        raise SystemExit("Applied5 Q6 availability state is not the expected pending state.")
    assert len(TARGETS) == 9 and len(set(TARGETS)) == 9 and SOURCE_TOTAL not in TARGETS
    for total in TARGETS:
        assert len(direct_solutions(total)) == len(carry_solutions(total)) == 1
    original = direct_solutions(SOURCE_TOTAL)
    assert original == carry_solutions(SOURCE_TOTAL) == [(1, 4, 6, 5)]
    WORK.mkdir(parents=True, exist_ok=True); ASSET_DIR.mkdir(parents=True, exist_ok=True)
    variants = []
    for i, total in enumerate(TARGETS, 1):
        (ASSET_DIR / f"q06-v{i}.svg").write_text(svg(total), encoding="utf-8")
        variants.append(build_item(i, total))
    pos = max(i for i, x in enumerate(data["items"]) if x["sourceNo"] == 4) + 1
    data["items"][pos:pos] = variants
    data["version"] = VERSION
    data["availableSourceNos"] = sorted(data["availableSourceNos"] + [6])
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 6]
    data["reviewSummary"].update({"independentMathCount": 90, "sourceTypes": 10, "variantsPerType": 9, "sourceDrawingCount": 2})
    i_pos = next(i for i, x in enumerate(index["items"]) if x["sourceNo"] == 7)
    index["items"].insert(i_pos, {"sourceNo": 6, "genId": "applied5-q06", "area": "수와 식", "subarea": "문자와 세로 덧셈", "detailType": "서로 다른 문자의 반복 덧셈", "pointBand": "2.7", "reviewStatus": "verified", "variantCount": 9})
    index["version"] = VERSION; index["itemCount"] = len(data["items"]); index["pendingSourceNos"] = list(data["pendingSourceNos"])
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    page = Image.open(SOURCE_RENDER)
    box = (970, 1770, 1630, 2180)
    crop = page.crop(box); crop.save(WORK / "q06-source-equation.png")
    answer = Image.open(ANSWER_RENDER)
    answer.crop((350, 180, 2220, 1260)).save(WORK / "q06-answer-proof.png")
    def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
    review = {
        "sourceExam": {"file": SOURCE.name, "driveFileId": "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp", "bytes": SOURCE.stat().st_size, "sha256": sha(SOURCE), "page": 1, "questionNo": 6, "directVisualReview": True, "stem": "아래 M,A,T,H는 서로 다른 문자를 나타냅니다. 각 문자에 알맞은 숫자를 구하세요.", "equation": "MATH + ATH + TH + H = 2000"},
        "sourceAnswer": {"file": ANSWER.name, "driveFileId": "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05", "bytes": ANSWER.stat().st_size, "sha256": sha(ANSWER), "page": 6, "directVisualReview": True, "answerVisible": True, "digits": {"M": 1, "A": 4, "T": 6, "H": 5}, "verification": "1,465 + 465 + 65 + 5 = 2,000; both direct permutation and carry solvers return the same unique tuple."},
        "sourceFigure": {"render": str(SOURCE_RENDER.relative_to(ROOT)), "crop": str((WORK / "q06-source-equation.png").relative_to(ROOT)), "cropBoxPixels": list(box), "pixelExactCrop": True, "cropSha256": sha(WORK / "q06-source-equation.png"), "variantsUseSameColumnStructure": True},
        "sourceAnswerProof": {"render": str(ANSWER_RENDER.relative_to(ROOT)), "crop": str((WORK / "q06-answer-proof.png").relative_to(ROOT)), "cropSha256": sha(WORK / "q06-answer-proof.png")},
        "sourceAnswerIndependent": {"total": SOURCE_TOTAL, "validTuple": list(original[0]), "count": len(original)},
        "targets": [{"total": n, "digits": list(direct_solutions(n)[0]), "validCount": 1} for n in TARGETS],
        "variantCount": 9, "newSourceTypes": 0, "difficulty": "2.7-point band only = low",
    }
    (WORK / "q06-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print(f"Added Applied5 Q6: 9 unique one-solution totals, source tuple 1465, data items {len(data['items'])}.")


if __name__ == "__main__":
    main()

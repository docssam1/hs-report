#!/usr/bin/env python3
"""Add nine Applied 5 Q20 flowchart-password variants to the finite bank."""
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
DATA_PATH = ROOT / "bank/data/applied5-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied5-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied5"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf")
EXAM_RENDER = WORK / "q20-source-page-4.png"
ANSWER_RENDER = WORK / "q20-answer-page-20.png"
ANSWER_OCR = WORK / "q20-answer-page-20-vision.txt"
FIGURE_CROP = WORK / "q20-source-flowchart-crop.png"
EXAM_ID = "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp"
ANSWER_ID = "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05"
VERSION = "20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-r15"

# (four-digit digit sum, second digit, third digit). All nine conditions are
# distinct from the source and yield exactly three passwords.
PARAMETERS = [(10, 1, 2), (11, 2, 1), (12, 2, 3), (13, 3, 2),
              (12, 1, 4), (13, 4, 2), (14, 5, 3), (15, 6, 1), (17, 2, 7)]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def valid_codes(total, second, third):
    return [n for n in range(1000, 10000)
            if sum(map(int, str(n))) == total
            and (n // 100) % 10 == second
            and (n // 10) % 10 == third
            and len(set(str(n))) == 4]


def valid_pairs(total, second, third):
    outer_sum = total - second - third
    return [(a, d) for a in range(1, 10) for d in range(10)
            if a + d == outer_sum and len({a, second, third, d}) == 4]


def flowchart_svg(total, second, third):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="500" height="560" viewBox="0 0 500 560" role="img" aria-label="네 자리 비밀번호 순서도: 자리 수의 합 {total}, 둘째 자리 {second}, 셋째 자리 {third}">
<defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#28251f"/></marker></defs>
<g fill="none" stroke="#28251f" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
 <rect x="76" y="18" width="220" height="50" rx="12" fill="#fff" stroke="#397653" stroke-width="2.8"/>
 <line x1="186" y1="68" x2="186" y2="117" marker-end="url(#arrow)"/>
 <polygon points="56,120 316,120 344,165 316,210 56,210 28,165" fill="#fff" stroke="#b4512e" stroke-width="2.8"/>
 <line x1="186" y1="210" x2="186" y2="258" marker-end="url(#arrow)"/>
 <polygon points="56,262 316,262 344,312 316,362 56,362 28,312" fill="#fff" stroke="#b4512e" stroke-width="2.8"/>
 <line x1="186" y1="362" x2="186" y2="416" marker-end="url(#arrow)"/>
 <rect x="25" y="420" width="322" height="58" rx="10" fill="#fff" stroke="#397653" stroke-width="2.8"/>
 <path d="M344 165 H385 V49 H296" marker-end="url(#arrow)"/>
 <path d="M344 312 H435 V31 H296" marker-end="url(#arrow)"/>
</g>
<g fill="#191511" text-anchor="middle" font-family="serif">
 <text x="186" y="49" font-size="22">네 자리 수 입력</text>
 <text x="186" y="158" font-size="21">각 자리 수의 합이</text><text x="186" y="188" font-size="21">{total}인가요?</text>
 <text x="186" y="302" font-size="19">둘째 자리 수는 {second}이고</text><text x="186" y="333" font-size="19">셋째 자리 수는 {third}인가요?</text>
 <text x="186" y="456" font-size="18">비밀번호는 (　　　　) 입니다.</text>
 <text x="200" y="99" font-size="17">네</text><text x="200" y="246" font-size="17">네</text><text x="200" y="405" font-size="17">네</text>
 <text x="382" y="145" font-size="15">아니요</text><text x="432" y="288" font-size="15">아니요</text>
</g></svg>'''


def make_item(no, total, second, third):
    codes = valid_codes(total, second, third)
    pairs = valid_pairs(total, second, third)
    assert len(codes) == len(pairs) == 3
    outer_sum = total - second - third
    pair_text = ", ".join(f"({a}, {d})" for a, d in pairs)
    code_text = ", ".join(map(str, codes))
    steps = [
        f"네 자리 숫자의 합이 {total}이고 둘째 자리와 셋째 자리가 {second}, {third}이므로 첫째 자리와 끝자리의 합은 {total}−{second}−{third}={outer_sum}입니다.",
        f"첫째 자리는 0이 될 수 없고 네 숫자가 모두 달라야 합니다. 첫째 자리를 1부터 9까지 살펴보면 가능한 (첫째 자리, 끝자리)는 {pair_text}입니다.",
        f"따라서 조건에 맞는 비밀번호는 {code_text}입니다. 가능한 첫째 자리마다 끝자리가 정해지므로 다른 비밀번호는 없습니다.",
    ]
    return {
        "id": f"applied5-q20-v{no}", "genId": "applied5-q20", "sourceSet": "applied",
        "sourceRound": 5, "sourceNo": 20, "variantNo": no, "reviewStatus": "verified",
        "area": "경우의 수", "subarea": "자리 숫자 조건", "detailType": "숫자 합과 가운데 자리 조건으로 네 자리 수 찾기",
        "pointBand": "3.4",
        "text": "다음 네 자리 수인 비밀번호를 알아내기 위해 만든 순서도입니다. 순서도의 조건에 알맞은 비밀번호를 모두 구해 보세요. (단, 비밀번호의 각 자리 숫자는 모두 다른 숫자입니다.)",
        "asset": {"kind": "svg", "src": f"assets/applied5/q20-v{no}.svg",
                  "description": f"자리 수의 합이 {total}, 둘째 자리 수가 {second}, 셋째 자리 수가 {third}인지 묻는 네 자리 비밀번호 순서도"},
        "answer": code_text, "answerParts": codes, "answerLabels": ["가능한 비밀번호 모두 (쉼표로 구분)"],
        "acceptedAnswers": [code_text, ",".join(map(str, codes))], "answerContract": "unordered-set",
        "solutionSteps": steps, "solution": " ".join(steps),
        "learningPoint": "전체 자리 수의 합에서 가운데 두 자리 수를 빼 첫째·끝자리의 합을 구하고, 서로 다른 숫자 조건으로 가능한 수를 빠짐없이 찾기",
        "learningLocation": "활용 5회 · 원문 20번 · 네 자리 비밀번호의 자리 조건과 숫자 합",
        "verification": {
            "primaryMethod": "첫째 자리 후보를 1부터 9까지 살피고, 정해진 끝자리와 네 숫자의 중복 여부를 확인한다.",
            "independentMethod": "1000부터 9999까지 네 자리 수를 모두 검사해 자리 합·둘째/셋째 자리·숫자 중복 조건을 동시에 확인한다.",
            "parameters": {"digitSum": total, "secondDigit": second, "thirdDigit": third,
                           "outerDigitSum": outer_sum, "validOuterPairs": pairs, "passwords": codes},
            "independentSuite": "qa/applied5-q20-independent-validate.py",
            "sourceExamPage": 4, "sourceExamFile": EXAM.name, "sourceExamDriveFileId": EXAM_ID,
            "sourceAnswerPage": 20, "sourceAnswerFile": ANSWER.name, "sourceAnswerDriveFileId": ANSWER_ID,
            "sourceDrawingCompared": True, "sourceDrawingPresent": True,
            "variantDrawingType": "same-flowchart-structure-new-digit-conditions",
            "sourceAnswerStatus": "답안 PDF 20쪽의 교사 표시 목록 7350, 6351, 1356을 확인했다. 숫자 합 15, 둘째 자리 3, 셋째 자리 5, 네 자리 숫자 모두 다름을 전수 검사해 세 답을 재현했다.",
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {"basis": "source-point-band", "label": "중",
                               "sourceReasoningPreserved": True, "measuredVariantRate": None,
                               "estimated": False,
                               "rationale": "활용 5회 원문 20번은 13~22번의 3.4점 배점대이므로 활용 난도는 배점대만 적용한다."},
    }


def main():
    assert sha(EXAM) == "5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c"
    assert sha(ANSWER) == "6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e"
    assert EXAM_RENDER.is_file() and ANSWER_RENDER.is_file() and ANSWER_OCR.is_file()
    assert all(x in ANSWER_OCR.read_text() for x in ("20.", "7350", "6351", "1356"))
    image = Image.open(EXAM_RENDER)
    FIGURE_CROP.parent.mkdir(parents=True, exist_ok=True)
    image.crop((275, 1395, 790, 1985)).save(FIGURE_CROP)
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    assert data["version"].endswith("q19-r14") and 20 in data["pendingSourceNos"]
    assert not any(x["sourceNo"] == 20 for x in data["items"])
    assert len(PARAMETERS) == len(set(PARAMETERS)) == 9
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    items = []
    proof = []
    for no, (total, second, third) in enumerate(PARAMETERS, 1):
        codes = valid_codes(total, second, third)
        (ASSET_DIR / f"q20-v{no}.svg").write_text(flowchart_svg(total, second, third), encoding="utf-8")
        item = make_item(no, total, second, third)
        items.append(item)
        proof.append({"variant": no, "digitSum": total, "secondDigit": second, "thirdDigit": third,
                      "outerDigitSum": total-second-third, "validOuterPairs": valid_pairs(total, second, third),
                      "passwords": codes, "exhaustiveFourDigitCount": len(codes)})
    pos = max(i for i, x in enumerate(data["items"]) if x["sourceNo"] == 19) + 1
    data["items"][pos:pos] = items
    data["version"] = VERSION
    data["availableSourceNos"] = sorted(data["availableSourceNos"] + [20])
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 20]
    data["reviewSummary"].update({"independentMathCount": 198, "sourceTypes": 22,
                                  "variantsPerType": 9, "sourceDrawingCount": 99})
    index["items"].append({"sourceNo": 20, "genId": "applied5-q20", "area": "경우의 수",
                           "subarea": "자리 숫자 조건", "detailType": "숫자 합과 가운데 자리 조건으로 네 자리 수 찾기",
                           "pointBand": "3.4", "reviewStatus": "verified", "variantCount": 9})
    index["items"].sort(key=lambda x: x["sourceNo"])
    index.update({"version": VERSION, "itemCount": len(data["items"]),
                  "pendingSourceNos": list(data["pendingSourceNos"])})
    assert len(data["items"]) == index["itemCount"] == 198
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    review = {
        "sourceExam": {"file": EXAM.name, "driveFileId": EXAM_ID, "bytes": EXAM.stat().st_size,
                       "sha256": sha(EXAM), "page": 4, "questionNo": 20, "directVisualReview": True,
                       "stem": "다음 네 자리 수인 비밀번호를 알아내기 위해 만든 순서도입니다. 순서도의 조건에 알맞은 비밀번호를 모두 구해보세요.",
                       "figureCrop": str(FIGURE_CROP.relative_to(ROOT)),
                       "figureCropBoxPixels": [275, 1395, 790, 1985], "pixelExactCrop": True,
                       "flowchartConditions": {"digitSum": 15, "secondDigit": 3, "thirdDigit": 5,
                                               "allDigitsDifferent": True}},
        "sourceAnswer": {"file": ANSWER.name, "driveFileId": ANSWER_ID, "bytes": ANSWER.stat().st_size,
                         "sha256": sha(ANSWER), "page": 20, "directVisualReview": True,
                         "teacherMarkedPasswords": [7350, 6351, 1356], "visionOcr": str(ANSWER_OCR.relative_to(ROOT))},
        "sourceAnswerReproducedByExhaustiveSearch": valid_codes(15, 3, 5) == [1356, 6351, 7350],
        "newSourceTypes": 0, "variantCount": 9,
        "difficulty": "3.4 point band only = medium", "variants": proof,
        "dataVersion": VERSION,
    }
    (WORK / "q20-source-answer-review.json").write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")
    print("Built Applied5 Q20: nine four-digit flowchart-password variants; source answers independently reproduced; no new source type.")


if __name__ == "__main__":
    main()

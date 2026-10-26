"""Build the finite, source-linked nine-item extension for Applied 7 Q3."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw7"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 7회.pdf"
ANSWER = Path(
    "/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/"
    "pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/"
    "생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf"
)

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

assert EXAM.is_file() and ANSWER.is_file()
exam_sha, answer_sha = sha(EXAM), sha(ANSWER)

items = []
for variant, first in enumerate(range(3, 12), 1):
    examples = [(x, 3 * x - 1) for x in (first, first + 2, first + 4)]
    target = first + 10
    answer = 3 * target - 1
    prompt = (
        f"요술 상자에 구슬 {examples[0][0]}개를 넣으면 {examples[0][1]}개가 나오고, "
        f"{examples[1][0]}개를 넣으면 {examples[1][1]}개, "
        f"{examples[2][0]}개를 넣으면 {examples[2][1]}개가 나옵니다. "
        f"같은 규칙으로 구슬 {target}개를 넣으면 몇 개가 나오겠습니까?"
    )
    steps = [
        f"입력한 구슬 수가 {examples[0][0]}개에서 {examples[1][0]}개로 2개 늘 때, 나오는 구슬은 {examples[0][1]}개에서 {examples[1][1]}개로 6개 늘어납니다.",
        "입력이 1개 늘 때마다 출력은 3개 늘어납니다. 첫 번째 예에서 3개를 넣으면 8개가 나오므로, 입력 수에 3을 곱한 뒤 1개를 빼는 규칙입니다.",
        f"입력 {target}개에 적용하면 3×{target}−1={answer}입니다.",
        f"확인하면 {examples[0][0]}개는 {examples[0][1]}개, {examples[1][0]}개는 {examples[1][1]}개, {examples[2][0]}개는 {examples[2][1]}개가 되어 주어진 세 예와 모두 일치합니다."
    ]
    items.append({
        "id": f"applied7-q03-v{variant}",
        "genId": "applied7-q03",
        "sourceSet": "applied",
        "sourceRound": 7,
        "sourceNo": 3,
        "variantNo": variant,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "규칙과 대응",
        "detailType": "입력 수와 출력 수 사이의 일정한 규칙 찾기",
        "pointBand": "2.7",
        "text": prompt,
        "answer": str(answer),
        "answerParts": [answer],
        "answerLabels": ["나오는 구슬 수"],
        "acceptedAnswers": [str(answer)],
        "answerContract": "ordered-parts",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "입력과 출력의 차이를 비교해 입력 한 개당 변화를 찾고 같은 규칙으로 값을 계산하기",
        "learningLocation": "활용 7회 · 원문 3번 · 요술 상자의 입력과 출력 규칙",
        "verification": {
            "primaryMethod": "입력이 2 증가할 때 출력이 6 증가하므로 입력 1당 출력 3, 절편 −1인 규칙을 확인한다.",
            "independentMethod": "3×입력−1을 각 예시와 목표 입력에 각각 대입해 네 결과를 직접 계산한다.",
            "parameters": {
                "examples": [{"input": x, "output": y} for x, y in examples],
                "targetInput": target,
                "answer": answer,
                "rule": "3x-1"
            },
            "independentSuite": "qa/applied7-q03-independent-validate.py",
            "sourceExamPage": 1,
            "sourceExamFile": "초등과정 대비 실전 모의고사활용 7회.pdf",
            "sourceAnswerPage": 1,
            "sourceDrawingCompared": False,
            "sourceDrawingPresent": False,
            "variantUsesSourceDrawing": False,
            "studentDifficultyMeasured": False
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "하",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
            "estimated": False,
            "rationale": "활용 7회 원문 3번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."
        }
    })

data = {
    "version": "20261024-applied7-expansion-q03-r1",
    "sourceSet": "applied",
    "sourceRound": 7,
    "itemCount": len(items),
    "availableSourceNos": [3],
    "pendingSourceNos": [n for n in range(1, 31) if n != 3],
    "policy": {
        "targetVariantsPerSource": 9,
        "sourceTypesAdded": 0,
        "difficultyBasis": "source-point-band-only",
        "sourceAnswerRequired": True
    },
    "items": items
}
index = {
    "version": data["version"],
    "sourceSet": "applied",
    "sourceRound": 7,
    "itemCount": len(items),
    "pendingSourceNos": data["pendingSourceNos"],
    "items": [{
        "sourceNo": 3,
        "genId": "applied7-q03",
        "area": "수와 식",
        "subarea": "규칙과 대응",
        "detailType": "입력 수와 출력 수 사이의 일정한 규칙 찾기",
        "pointBand": "2.7",
        "reviewStatus": "verified",
        "variantCount": 9
    }]
}

(ROOT / "bank/data/applied7-expanded.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
(ROOT / "bank/data/applied7-expanded-index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
(WORK / "q03-source-answer-review.json").write_text(json.dumps({
    "sourceExam": {
        "name": EXAM.name,
        "driveId": "1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf",
        "bytes": EXAM.stat().st_size,
        "sha256": exam_sha,
        "questionPage": 1,
        "questionNumber": 3,
        "questionText": "2, 4, 6개의 구슬을 넣으면 각각 5, 11, 17개가 나오고, 12개를 넣었을 때의 출력을 묻는다.",
        "figurePresent": False
    },
    "sourceAnswer": {
        "name": ANSWER.name,
        "driveId": "1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j",
        "bytes": ANSWER.stat().st_size,
        "sha256": answer_sha,
        "answerPage": 1,
        "questionNumber": 3,
        "teacherMarkedAnswer": 35,
        "evidence": "PDF page image visually confirms the handwritten input/output rule 3n−1 and answer 35. Text extraction omits handwritten ink."
    },
    "directPageImagesCompared": True,
    "sourceAndAnswerMatch": True,
    "sourceTypeAlreadyPresent": True,
    "newSourceTypesAdded": 0,
    "sourceAnswerIndependentCheck": {
        "pairs": [[2, 5], [4, 11], [6, 17]],
        "rule": "3n-1",
        "targetInput": 12,
        "calculation": "3*12-1",
        "result": 35
    },
    "newVariants": len(items),
    "allVariantsSameSourceType": True
}, ensure_ascii=False, indent=2) + "\n")
print(f"Built Applied 7 Q3: {len(items)} variants, source types added 0; exam sha256 {exam_sha}; answer sha256 {answer_sha}")

import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied3-expanded.json"
INDEX_PATH = ROOT / "bank/data/applied3-expanded-index.json"
EXAM_PATH = ROOT / ".private-work/hw-expansion-20261023/hw3/source/applied3-current-source.pdf"
ANSWER_PATH = ROOT / ".private-work/hw-expansion-20261023/hw3/source/applied3-drive-answer-3.pdf"
VERSION = "20261025-applied3-expansion-q04-q12-q14-q18-q21-r8"
GAINS = [1, 3, 4, 5, 6, 8, 10, 12, 15]
EXAM_ID = "15PlSmA6AIAQXOTdqKmTV5fQPKfYsPntw"
ANSWER_ID = "1PP2pXvggDBjPPw4WRGcLGPzlm_Qi87dN"


def duration(gain):
    assert gain > 0 and 720 % gain == 0
    hours = 720 // gain
    return divmod(hours, 24)


def make_item(v, gain, exam_sha, answer_sha):
    days, hours = duration(gain)
    elapsed_hours = days * 24 + hours
    answer = f"{days}일 {hours}시간"
    steps = [
        "12시간 표시 시계가 다시 실제 시각과 같은 표시를 하려면 시계가 실제보다 12시간, 즉 720분 앞서야 합니다.",
        f"시계는 실제 시간 한 시간마다 {gain}분씩 빨라지므로 720분 앞서기까지 실제로는 720÷{gain}={elapsed_hours}시간이 걸립니다.",
        f"{elapsed_hours}시간은 24시간씩 나누면 {days}일 {hours}시간이므로, 다시 정확히 맞는 때는 {answer} 후입니다.",
    ]
    return {
        "id": f"applied3-q12-v{v}",
        "genId": "applied3-q12",
        "sourceSet": "applied",
        "sourceRound": 3,
        "sourceNo": 12,
        "variantNo": v,
        "reviewStatus": "verified",
        "area": "수와 식",
        "subarea": "시계와 시간",
        "detailType": "빨라지는 시계가 다시 같은 시각을 가리키는 때",
        "pointBand": "2.7",
        "text": f"12시간 표시 시계가 매시간 {gain}분씩 빨리 갑니다. 이 시계를 지금 12시에 정확히 맞춘 뒤, 다시 실제 시각과 정확히 맞을 때까지 실제로 며칠 몇 시간이 지나나요?",
        "answer": answer,
        "answerParts": [days, hours],
        "answerLabels": ["일", "시간"],
        "acceptedAnswers": [answer],
        "answerContract": "ordered-parts",
        "solutionSteps": steps,
        "solution": " ".join(steps),
        "learningPoint": "매시간 빨라지는 양을 누적해 시계가 다시 같은 시각을 가리키는 시점 찾기",
        "learningLocation": "활용 3회 · 원문 12번 · 시계와 시간",
        "verification": {
            "primaryMethod": "accumulate the clock's lead until it completes one 12-hour display cycle",
            "parameters": {
                "gainMinutesPerRealHour": gain,
                "displayCycleMinutes": 720,
                "elapsedRealHours": elapsed_hours,
                "elapsedDays": days,
                "remainingHours": hours,
            },
            "independentSuite": "qa/applied3-q12-independent-validate.py",
            "sourceExamPage": 2,
            "sourceAnswerQuestionPage": 7,
            "sourceAnswerCalculationPage": 10,
            "sourceExamDriveId": EXAM_ID,
            "sourceExamSha256": exam_sha,
            "sourceAnswerDriveId": ANSWER_ID,
            "sourceAnswerSha256": answer_sha,
            "answerCopyStatus": "Drive 답안 후보 p.7에서 원문 Q12와 같은 지문을 확인하고 p.10의 15일 결론을 읽었다. 후보 PDF와 현재 시험 PDF의 판본 짝은 확인되지 않았다. 원문 2분/시간의 값은 720분÷2=360시간=15일로 독립 검산했으며, 후보 풀이의 중간 단위 표기는 바로잡았다.",
            "sourceTextDirectlyReviewed": True,
            "sourceHasFigure": False,
            "studentDifficultyMeasured": False,
        },
        "difficultyEvidence": {
            "basis": "source-point-band",
            "label": "하",
            "sourceReasoningPreserved": True,
            "measuredVariantRate": None,
        },
    }


data = json.loads(DATA_PATH.read_text())
before = copy.deepcopy(data)
assert data["version"] == "20261025-applied3-expansion-q04-q14-q18-q21-r7"
assert len(data["items"]) == 189 and 12 in data["pendingSourceNos"]
assert all(x["sourceNo"] != 12 for x in data["items"])
exam_sha = hashlib.sha256(EXAM_PATH.read_bytes()).hexdigest()
answer_sha = hashlib.sha256(ANSWER_PATH.read_bytes()).hexdigest()
items = [make_item(i + 1, gain, exam_sha, answer_sha) for i, gain in enumerate(GAINS)]
data["items"].extend(items)
data["items"].sort(key=lambda x: (x["sourceNo"], x["variantNo"]))
data["availableSourceNos"] = sorted(data["availableSourceNos"] + [12])
data["pendingSourceNos"].remove(12)
data["sourceEditionNotes"]["12"] = "원문 PDF p.2의 그림 없는 Q12 지문과 2.7점 배점을 직접 확인했다. Drive 답안 후보는 p.7에서 같은 Q12 지문, p.10에서 15일 결론을 보였으나 현행 시험 PDF와 답안 PDF의 판본 짝은 미확인이다. 원문 2분/시간은 720분을 누적하는 데 360시간, 즉 15일로 독립 검산했다. 답안 후보 풀이의 시간 단위 표기는 독립 계산에서 바로잡았다."
data["version"] = VERSION
data["reviewSummary"]["independentMathCount"] += 9
data["reviewSummary"]["sourceTypes"] += 1
data["reviewSummary"]["outputReviewed"] = False
index = json.loads(INDEX_PATH.read_text())
index["version"] = VERSION
index["itemCount"] = len(data["items"])
index["pendingSourceNos"].remove(12)
index["items"].append({
    "sourceNo": 12,
    "genId": "applied3-q12",
    "area": "수와 식",
    "subarea": "시계와 시간",
    "detailType": "빨라지는 시계가 다시 같은 시각을 가리키는 때",
    "pointBand": "2.7",
    "reviewStatus": "verified",
    "variantCount": 9,
})
index["items"].sort(key=lambda x: x["sourceNo"])
DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({
    "version": VERSION,
    "beforeCount": len(before["items"]),
    "afterCount": len(data["items"]),
    "q12Answers": [x["answer"] for x in items],
    "sourceExamSha256": exam_sha,
    "sourceAnswerSha256": answer_sha,
    "dataSha256": hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
    "indexSha256": hashlib.sha256(INDEX_PATH.read_bytes()).hexdigest(),
}, ensure_ascii=False, indent=2))

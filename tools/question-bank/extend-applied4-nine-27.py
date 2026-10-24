"""Draft nine source-grounded variants for Applied 4 question 27."""
from collections import Counter
from pathlib import Path
from itertools import product
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "bank/data/applied4-expanded.json"
INDEX = ROOT / "bank/data/applied4-expanded-index.json"
WORK = ROOT / ".private-work/nine-expansion-20261024/round6-q27-source"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = ROOT / ".private-work/balanced15-20261024/source/applied4-answer.pdf"
SUMS = [33, 34, 35, 36, 37, 38, 39, 40, 41]


def prefix_count(total):
    return sum(1 for a in range(1, 10) for b in range(10) for c in range(10)
               if a + b + c == total)


def calculation(total):
    suffixes = [n for n in range(0, 100, 4)]
    by_sum = Counter((n // 10) + (n % 10) for n in suffixes)
    terms = [(t, count, prefix_count(total - t),
              count * prefix_count(total - t))
             for t, count in sorted(by_sum.items())
             if prefix_count(total - t)]
    grouped = sum(term[3] for term in terms)
    brute = sum(1 for n in range(10000, 100000)
                if n % 4 == 0 and sum(map(int, str(n))) == total)
    assert grouped == brute
    return suffixes, terms, grouped


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    data = json.loads(DATA.read_text(encoding="utf-8"))
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    before = hashlib.sha256(DATA.read_bytes()).hexdigest()
    assert len(data["items"]) == 171
    assert not any(x["sourceNo"] == 27 for x in data["items"])
    assert 27 in data["pendingSourceNos"]
    sh = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    ah = hashlib.sha256(ANSWER.read_bytes()).hexdigest()
    records, evidence = [], []
    for i, total in enumerate(SUMS, 1):
        suffixes, terms, answer = calculation(total)
        brute = answer
        contribution = " + ".join(f"t={t}: {m}×{p}" for t, m, p, _ in terms)
        text = (f"다섯 자리 자연수에서 각 자리 숫자의 합이 {total}입니다. "
                "이 중 4로 나누어떨어지는 수는 모두 몇 개입니까?")
        steps = [
            "4로 나누어떨어지는지는 끝 두 자리 수로 결정됩니다. 가능한 끝 두 자리는 00, 04, 08, …, 96입니다.",
            f"끝 두 자리의 숫자 합을 t라고 하면 앞 세 자리의 숫자 합은 {total}−t입니다. 앞 세 자리 수의 백의 자리는 1~9, 십의 자리와 일의 자리는 0~9이므로, 각 끝 두 자리마다 이 합을 만드는 앞 세 자리 수를 셉니다.",
            f"같은 t인 끝 두 자리의 개수와 앞 세 자리 경우의 수를 곱해 더하면 {contribution}＝{answer}입니다. 따라서 조건에 맞는 수는 모두 {answer}개입니다."
        ]
        rec = {
            "id": f"applied4-q27-v{i}", "genId": "applied4-q27",
            "sourceSet": "applied", "sourceRound": 4, "sourceNo": 27,
            "variantNo": i, "reviewStatus": "pending-output-review",
            "practiceStorageVersion": "20261024-applied4-new9-q27-r1",
            "area": "수와 식", "subarea": "자릿수와 나눗셈",
            "detailType": "자릿수 합 조건에서 4의 배수 세기",
            "pointBand": "4.2", "sourcePointBand": "4.2",
            "text": text, "answer": str(answer), "answerParts": [answer],
            "answerLabels": ["답"], "acceptedAnswers": [str(answer)],
            "answerContract": "ordered-parts", "solutionSteps": steps,
            "solution": " ".join(steps),
            "learningPoint": "끝 두 자리의 배수 조건과 앞 세 자리의 자릿수 합을 나누어 세기",
            "learningLocation": "활용 4회 · 원문 27번 · 자릿수 합 조건에서 4의 배수 세기",
            "difficultyEvidence": {"basis": "source-point-band", "label": "상",
                                   "sourceReasoningPreserved": True, "measuredVariantRate": None},
            "levelReview": {"basis": "source-point-band-4.2", "measured": False,
                "axes": {"prerequisite": "자릿값, 각 자리 숫자의 합, 4의 배수",
                    "reasoning": "끝 두 자리 배수 조건과 앞 세 자리 합 조건을 분리",
                    "conditionTracking": "다섯 자리 자연수이며 각 자리 숫자의 합이 제시값",
                    "caseSplitting": "00부터 96까지 4의 배수인 끝 두 자리별로 경우를 합산",
                    "computation": "각 끝 두 자리에서 가능한 앞 세 자리 수를 세고 합산",
                    "representation": "두 자리 배수 조건과 세 자리 자릿수 합으로 표현",
                    "reading": "합계 조건과 나눗셈 조건을 동시에 적용",
                    "shortcuts": "끝 두 자리 또는 자릿수 합 조건 하나만으로는 충분하지 않음",
                    "load": "원문과 같은 경우 나누기 및 자리별 합 계산"}},
            "verification": {"sourceExamPage": 6, "sourceAnswerPage": 27,
                "primaryMethod": "group multiples-of-four suffixes by digit sum and count leading three-digit prefixes",
                "parameters": {"digitSum": total, "validSuffixes": suffixes,
                    "suffixDigitSumContributions": terms, "answer": answer,
                    "independentBruteForce": brute,
                    "prefixCountDefinition": "count a=1..9,b=0..9,c=0..9 with a+b+c=remaining digit sum",
                    "sourceExamPdfSha256": sh, "sourceAnswerPdfSha256": ah,
                    "sourceAnswerReadMethod": "direct visual reading of handwritten answer on answer PDF p27"},
                "independentSuite": "qa/applied4-q27-independent-validate.py",
                "sourceAnswerMatch": total == 41 and answer == 10,
                "studentDifficultyMeasured": False}
        }
        records.append(rec)
        evidence.append({"id": rec["id"], "digitSum": total, "answer": answer,
                         "terms": terms, "bruteForce": brute})
    data["items"].extend(records)
    data["revision"] = "20261024-applied4-expansion-r7-q27"
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (WORK / "q27-authored-evidence.json").write_text(json.dumps({
        "beforeDataSha256": before, "sourcePdfSha256": sh,
        "answerPdfSha256": ah, "sourceExamPage": 6, "sourceAnswerPage": 27,
        "count": len(records), "pointBand": "4.2", "items": evidence
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Drafted Q27 {len(records)} variants; sums {SUMS}; answers {[x['answer'] for x in records]}; output review pending")


if __name__ == "__main__":
    main()

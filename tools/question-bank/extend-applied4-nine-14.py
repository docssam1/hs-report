"""Draft nine verified-shape variants for Applied4 question 14.

The original is a 3x3 board containing the nine distinct pair-products of
four distinct natural-number cards, allowing a card to be paired with itself.
"""
from pathlib import Path
from itertools import combinations, combinations_with_replacement
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / ".private-work/nine-expansion-20261024/round5-q14-source"
DATA = ROOT / "bank/data/applied4-expanded.json"
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 4회.pdf"
ANSWER = ROOT / ".private-work/balanced15-20261024/source/applied4-answer.pdf"

SETS = [
    ((2, 3, 4, 6), 4),
    ((2, 3, 4, 8), 4),
    ((2, 3, 6, 9), 4),
    ((2, 4, 5, 10), 4),
    ((3, 4, 6, 8), 9),
    ((3, 5, 6, 10), 9),
    ((3, 5, 9, 15), 9),
    ((4, 5, 6, 9), 16),
    ((4, 5, 8, 10), 16),
]


def products(cards):
    return {a * b for a, b in combinations_with_replacement(cards, 2)}


def divisors(n):
    return {d for d in range(1, int(n**0.5) + 1) if n % d == 0
            for d in (d, n // d)}


def candidate_sets(visible):
    # Each card multiplies with three other distinct cards. Since only one
    # product value is hidden, each card divides at least one visible value.
    pool = set().union(*(divisors(n) for n in visible))
    hits = []
    for cards in combinations(sorted(pool), 4):
        values = products(cards)
        if len(values) == 9 and visible <= values and len(values - visible) == 1:
            hits.append((cards, next(iter(values - visible))))
    return pool, hits


def svg(visible):
    cells = [None, *sorted(visible)]
    # Board order follows the source: flower in the upper-left, then increasing
    # product values in the remaining cells.
    x0, y0, cw, ch = 12, 12, 84, 46
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="276" height="162" '
        'viewBox="0 0 276 162" role="img" aria-label="곱셈 결과 게임판">',
        '<rect width="276" height="162" fill="#fff"/>',
    ]
    for i, value in enumerate(cells):
        row, col = divmod(i, 3)
        x, y = x0 + col * cw, y0 + row * ch
        parts.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" '
                     'fill="#fff" stroke="#191511" stroke-width="1.5"/>')
        if value is None:
            parts.append(f'<text x="{x+cw/2}" y="{y+30}" text-anchor="middle" '
                         'font-family="sans-serif" font-size="23" fill="#191511">꽃</text>')
        else:
            parts.append(f'<text x="{x+cw/2}" y="{y+30}" text-anchor="middle" '
                         f'font-family="sans-serif" font-size="20" fill="#191511">{value}</text>')
    parts.append('</svg>')
    return ''.join(parts)


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    data = json.loads(DATA.read_text())
    assert data["sourceSet"] == "applied" and data["sourceRound"] == 4
    assert len(data["items"]) == 162 and data["availableSourceNos"] == [5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 23, 28, 29]
    assert not any(x["sourceNo"] == 14 for x in data["items"])
    assert len(SETS) == 9 and len({cards for cards, _ in SETS}) == 9
    source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    answer_hash = hashlib.sha256(ANSWER.read_bytes()).hexdigest()
    assert source_hash == "f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59"
    assert answer_hash == "67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8"

    before_sha = hashlib.sha256(DATA.read_bytes()).hexdigest()
    (WORK / "prior-expanded.json").write_bytes(DATA.read_bytes())
    records, proof = [], []
    for index, (cards, blank) in enumerate(SETS, 1):
        values = products(cards)
        assert len(values) == 9 and blank in values and blank == cards[0] ** 2
        visible = values - {blank}
        pool, candidates = candidate_sets(visible)
        assert candidates == [(cards, blank)], (cards, blank, candidates)
        src = f"q14-cards-v{index}.svg"
        asset_path = ROOT / "bank/assets/applied4" / src
        asset_path.parent.mkdir(parents=True, exist_ok=True)
        asset_path.write_text(svg(visible), encoding="utf-8")
        asset_hash = hashlib.sha256(asset_path.read_bytes()).hexdigest()
        pair_list = [list(pair) for pair in combinations_with_replacement(cards, 2)]
        ordered_products = [a * b for a, b in combinations_with_replacement(cards, 2)]
        distinct_products = sorted(set(ordered_products))
        assert len(distinct_products) == 9 and distinct_products == sorted(values)
        answer = [*cards, blank]
        steps = [
            "같은 카드를 다시 고를 수 있으므로 네 카드에서 만들 수 있는 곱은 10가지이고, 게임판에는 서로 다른 곱 9가지가 한 번씩 적혀 있습니다. 따라서 곱셈 결과에서 중복되는 값도 확인해야 합니다.",
            f"게임판에 보이는 여덟 수는 {', '.join(map(str, sorted(visible)))}입니다. 카드 한 장의 수는 다른 카드들과 곱한 값의 약수이므로, 보이는 수들의 약수에서 카드 후보를 모아 네 수 조합을 확인합니다.",
            f"조건을 만족하는 네 수는 {', '.join(map(str, cards))}뿐입니다. 이 수들을 두 개씩 골라 같은 수를 다시 곱하면 서로 다른 결과는 {', '.join(map(str, distinct_products))}이고, {ordered_products.count(blank)}가지 카드 선택에서 겹치는 결과가 생깁니다.",
            f"게임판에 빠진 꽃 칸은 {blank}입니다. 작은 수부터 적은 네 카드와 꽃 칸의 수는 {', '.join(map(str, answer))}입니다.",
        ]
        record = {
            "id": f"applied4-q14-v{index}", "genId": "applied4-q14",
            "sourceSet": "applied", "sourceRound": 4, "sourceNo": 14,
            "variantNo": index, "reviewStatus": "pending-output-review",
            "practiceStorageVersion": "20261024-applied4-new9-q14-r1",
            "area": "수와 식", "subarea": "곱셈 표와 카드 추론",
            "detailType": "곱셈 결과표에서 카드 수 복원",
            "learningLocation": "활용 4회 · 원문 14번 · 곱셈 결과표에서 카드 수 복원",
            "learningPoint": "게임판에 있는 곱셈 결과에서 네 카드 수와 빠진 결과를 추론하기",
            "pointBand": "3.4", "sourcePointBand": "3.4",
            "text": "서로 다른 자연수가 하나씩 적힌 숫자카드 네 장이 있습니다. 두 장을 골라 수를 곱할 때(같은 카드를 두 번 골라도 됩니다) 나오는 서로 다른 곱 9가지는 게임판 아홉 칸에 한 번씩 적혀 있습니다. 게임판에서 꽃이 표시된 칸의 수를 포함해 네 카드의 수를 작은 수부터 쓰시오.",
            "answer": ", ".join(map(str, answer)), "answerParts": answer,
            "answerLabels": ["첫째 카드", "둘째 카드", "셋째 카드", "넷째 카드", "꽃이 있는 칸"],
            "answerContract": "ordered-parts", "acceptedAnswers": [", ".join(map(str, answer))],
            "solutionSteps": steps, "solution": " ".join(steps),
            "asset": {"src": f"assets/applied4/{src}", "description": "세 줄 세 칸 곱셈 결과판, 꽃 표시 칸과 여덟 결과"},
            "difficultyEvidence": {"basis": "source-point-band", "label": "중", "sourceReasoningPreserved": True, "measuredVariantRate": None},
            "levelReview": {"basis": "source-point-band-3.4", "measured": False, "axes": {
                "prerequisite": "자연수의 곱셈과 약수", "reasoning": "네 카드의 자기곱과 서로 다른 카드의 곱을 표와 대조",
                "conditionTracking": "같은 카드를 두 번 선택할 수 있고 서로 다른 곱은 아홉 칸에 한 번씩 등장",
                "caseSplitting": "보이는 곱의 약수에서 카드 후보를 만들고 네 수 조합을 확인",
                "computation": "카드 두 장의 곱을 모두 계산하고 중복 결과를 확인",
                "representation": "3×3 게임판의 수를 곱셈 결과 집합으로 해석",
                "reading": "조건과 물음을 지문에 직접 제시", "visualCues": "문제 그림은 여덟 결과와 꽃 칸만 표시",
                "shortcuts": "카드 수·보이는 곱·꽃 칸 중 하나가 바뀌면 답이 바뀜",
                "load": "원문과 같은 역추론 및 유일성 확인"}},
            "verification": {"sourceExamPage": 3, "sourceAnswerPage": 14,
                "primaryMethod": "divisor-pool exhaustive search over all 4-element sets of positive integers",
                "parameters": {"cards": list(cards), "pairSelections": pair_list, "pairProducts": ordered_products,
                    "distinctProducts": distinct_products, "visibleProducts": sorted(visible), "blank": blank,
                    "factorCandidatePool": sorted(pool), "candidateCount": len(candidates), "candidateCards": [list(candidates[0][0])],
                    "searchCompleteness": "Each distinct card has products with three other cards; at most one product value is hidden, so every card divides at least one visible board value.",
                    "sourceExamPage": 3, "sourceAnswerPage": 14, "sourceExamPdfSha256": source_hash,
                    "sourceAnswerPdfSha256": answer_hash, "sourceAnswerReadMethod": "direct visual reading of teacher handwriting"},
                "independentSuite": "qa/applied4-q14-independent-validate.py", "sourceAnswerMatch": True,
                "sourceAnswerBasis": "matches the teacher's directly visible handwritten answer on source answer PDF page 14",
                "studentDifficultyMeasured": False, "assetSha256": asset_hash},
        }
        records.append(record)
        proof.append({"id": record["id"], "cards": list(cards), "visible": sorted(visible), "blank": blank,
                      "factorCandidatePool": sorted(pool), "candidateCount": len(candidates), "answer": answer,
                      "asset": src, "assetSha256": asset_hash})

    data["items"].extend(records)
    data["availableSourceNos"] = sorted(data["availableSourceNos"] + [14])
    data["pendingSourceNos"] = [n for n in data["pendingSourceNos"] if n != 14]
    data["revision"] = "20261024-applied4-expansion-r5-q14"
    data["pendingAdditionSummary"] = {"sourceNos": [14], "newCount": 9, "old162Exact": True}
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (WORK / "authored-summary.json").write_text(json.dumps({"beforeSha256": before_sha,
        "sourcePdfSha256": source_hash, "answerPdfSha256": answer_hash, "count": len(records),
        "pointBand": "3.4", "sourceNos": [14], "items": proof}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Drafted {len(records)} Q14 variants, all 3.4 points; 9 unique card sets; prior 162 records preserved; output review pending")


if __name__ == "__main__":
    main()

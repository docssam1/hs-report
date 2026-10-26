#!/usr/bin/env python3
"""활용1 Q08 원식의 숫자 해와 동일 유형 파라미터 범위를 전수 확인한다."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "materials/초등과정 대비 실전 모의고사 활용 1회.pdf"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw1/q08-exhaustive-audit-r1.json"
EXPECTED_SOURCE_SHA = "6123edccb7f64dc664d57dd29004483e3d27c49665892da39bbf2c032b243924"
assert SOURCE.is_file()
source_sha = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
assert source_sha == EXPECTED_SOURCE_SHA

# Source equation: 77 * (10a+b) = 1000b+100a+10a+b = 1001b+110a.
# Two-digit number => a,b are decimal digits 1..9; b is nonzero because BAAB is 4-digit.
exact_solutions = []
for a in range(1, 10):
    for b in range(1, 10):
        left = 77 * (10 * a + b)
        right = 1001 * b + 110 * a
        if left == right:
            exact_solutions.append({"a": a, "b": b, "number": 10 * a + b, "product": left})
assert exact_solutions == [{"a": 7, "b": 5, "number": 75, "product": 5775}]

# A related parameterization preserves the same BAAB product shape but lets the
# multiplier vary. Enumerate all 2- and 3-digit multipliers and count solutions;
# only unique-solution multipliers could become unambiguous new items.
parameterized = []
for multiplier in range(10, 1000):
    sols = []
    for a in range(1, 10):
        for b in range(1, 10):
            if multiplier * (10 * a + b) == 1001 * b + 110 * a:
                sols.append({"a": a, "b": b, "number": 10 * a + b})
    if sols:
        parameterized.append({"multiplier": multiplier, "solutions": sols})
unique_multiplier_cases = [x for x in parameterized if len(x["solutions"]) == 1]
assert len(parameterized) == 7 and sum(len(x["solutions"]) for x in parameterized) == 18
assert [(x["multiplier"], x["solutions"][0]["number"]) for x in unique_multiplier_cases] == [
    (77, 75), (121, 45), (209, 25), (341, 15), (451, 18)
]

report = {
    "source": {
        "file": str(SOURCE.relative_to(ROOT)),
        "sha256": source_sha,
        "page": 2,
        "question": 8,
        "observedEquation": "77 × ㄱㄴ = ㄴㄱㄱㄴ",
    },
    "exactSourceEquation": {
        "searchSpace": "ㄱ,ㄴ ∈ {1,…,9}",
        "allPairsChecked": 81,
        "solutions": exact_solutions,
        "status": "one unique solution; no distinct numeric variants exist while coefficient 77 and BAAB form stay fixed",
    },
    "parameterizedSameBAABForm": {
        "multiplierRangeChecked": [10, 999],
        "solutionBearingMultipliers": len(parameterized),
        "totalMultiplierDigitPairSolutions": sum(len(x["solutions"]) for x in parameterized),
        "uniqueAnswerCases": unique_multiplier_cases,
        "uniqueAnswerCount": len(unique_multiplier_cases),
        "nineVariantTargetMet": False,
        "note": "Varying the multiplier preserves the BAAB digit pattern but yields only five unambiguous cases in the exhaustive 2–3 digit range; further variants would need a new constraint or a changed digit pattern, which is not authorized by the existing-type-only rule.",
    },
    "publicationReady": False,
}
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("PASS 활용1 Q08: 81개 숫자쌍 전수검사에서 75만 유일; 같은 BAAB 꼴의 2·3자리 승수에서도 단일해 사례는 5개.")

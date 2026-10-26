"""Independent cycle-enumeration check for Applied3 Q12 clock variants."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "bank/data/applied3-expanded.json"
OUT = ROOT / ".private-work/hw-expansion-20261023/hw3/q12-review/q12-independent-audit-r9.json"
EXPECTED_GAINS = [1, 3, 4, 5, 6, 8, 10, 12, 15]
items = json.loads(DATA_PATH.read_text())["items"]
group = [x for x in items if x["sourceNo"] == 12]
assert len(group) == 9
assert [x["variantNo"] for x in group] == list(range(1, 10))
assert [x["verification"]["parameters"]["gainMinutesPerRealHour"] for x in group] == EXPECTED_GAINS

audits = []
for item in group:
    p = item["verification"]["parameters"]
    gain = p["gainMinutesPerRealHour"]
    # Enumerate actual elapsed hours from the dial state, independent of the builder's quotient.
    first_return = next(t for t in range(1, 721) if (gain * t) % 720 == 0)
    prior_lead = (gain * (first_return - 1)) % 720
    days, hours = divmod(first_return, 24)
    expected = [days, hours]
    assert first_return == p["elapsedRealHours"]
    assert expected == item["answerParts"]
    assert item["answer"] == f"{days}일 {hours}시간"
    assert item["acceptedAnswers"] == [item["answer"]]
    assert prior_lead != 0
    assert item["area"] == "수와 식" and item["pointBand"] == "2.7"
    assert item["difficultyEvidence"]["label"] == "하"
    assert item["learningLocation"] == "활용 3회 · 원문 12번 · 시계와 시간"
    audits.append({
        "id": item["id"],
        "gainMinutesPerRealHour": gain,
        "firstDisplayReturnAfterHours": first_return,
        "leadAfterPreviousHourMinutes": prior_lead,
        "answerParts": expected,
        "uniqueEarliestReturn": True,
    })

# Independently verify the original question's 2-minute rate from the source.
original_return = next(t for t in range(1, 721) if (2 * t) % 720 == 0)
assert original_return == 360
assert divmod(original_return, 24) == (15, 0)

result = {
    "pass": True,
    "sourceNo": 12,
    "variantCount": len(audits),
    "independentMethod": "enumerate actual elapsed hours until clock lead returns to zero modulo one 12-hour dial cycle",
    "originalRateMinutesPerHour": 2,
    "originalFirstReturnHours": original_return,
    "originalAnswer": "15일 0시간",
    "variants": audits,
    "dataSha256": hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(f"PASS Applied3 Q12: original answer 15 days; nine independently enumerated earliest display returns")

#!/usr/bin/env python3
"""Independent positional enumeration for Applied 9 Q05."""
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
SOURCE_PAGE = ROOT / ".private-work/hw-expansion-20261023/hw9/q01-review/source-1.png"
ASSET = ROOT / "bank/assets/applied9/q05-source-cards.png"
SOURCE_PDF = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
DIVISORS = [2, 3, 4, 5, 6, 7, 9, 11, 12]

assert hashlib.sha256(SOURCE_PDF.read_bytes()).hexdigest() == SOURCE_SHA
items = [x for x in DATA["items"] if x["sourceNo"] == 5]
assert len(items) == 9 and [x["variantNo"] for x in items] == list(range(1, 10))
assert [x["verification"]["parameters"]["divisor"] for x in items] == DIVISORS

crop = Image.open(SOURCE_PAGE).convert("RGB").crop((1080, 1380, 1440, 1550))
asset = Image.open(ASSET).convert("RGB")
assert crop.size == asset.size == (360, 170)
assert crop.tobytes() == asset.tobytes(), "Q05 card row changed from the direct source crop."
asset_hash = hashlib.sha256(ASSET.read_bytes()).hexdigest()

answers = []
for item, divisor in zip(items, DIVISORS):
    by_hundreds = {h: [] for h in range(1, 5)}
    # Positional construction is independent of the builder's permutation list.
    for hundreds in range(1, 5):
        for tens in range(5):
            if tens == hundreds:
                continue
            for ones in range(5):
                if ones in (hundreds, tens):
                    continue
                number = 100 * hundreds + 10 * tens + ones
                if number % divisor == 0:
                    by_hundreds[hundreds].append(number)
    valid = [n for group in by_hundreds.values() for n in group]
    params = item["verification"]["parameters"]
    assert params["numbersByHundredsDigit"] == {str(h): nums for h, nums in by_hundreds.items()}
    assert params["validNumbers"] == valid
    assert item["asset"]["sha256"] == params["sourceCardCropSha256"] == asset_hash
    assert item["answer"] == str(len(valid)) and item["answerParts"] == [len(valid)]
    assert item["acceptedAnswers"] == [str(len(valid))]
    assert item["answerContract"] == "single-number" and item["reviewStatus"] == "verified"
    assert all(str(len(group)) in " ".join(item["solutionSteps"]) for group in by_hundreds.values())
    answers.append(len(valid))

assert answers == [30, 20, 15, 12, 13, 7, 6, 4, 8]
assert DATA["sourceReview"]["questionReviews"]["5"]["candidateAnswer"] == 15
assert DATA["sourceReview"]["questionReviews"]["5"]["independentAnswer"] == 15
assert DATA["itemCount"] == 270 and 5 in DATA["availableSourceNos"]
assert 5 not in DATA["pendingSourceNos"] and DATA["version"].endswith("-taxonomy-r25")

result = {"status": "PASS", "sourceNo": 5, "variants": len(items),
          "independentMethod": "position-by-position enumeration; 4×4×3 = 48 valid three-digit candidates before divisibility filtering",
          "divisors": DIVISORS, "answers": answers,
          "sourceAnswerReproduced": 15, "sourceCardCropPixelExact": True,
          "sourceCardCropSha256": asset_hash, "answerCandidateSha256": ANSWER_SHA}
evidence = ROOT / ".private-work/hw-expansion-20261023/hw9/q05-evidence"
evidence.mkdir(parents=True, exist_ok=True)
(evidence / "q05-independent-validation-r16.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False, indent=2))

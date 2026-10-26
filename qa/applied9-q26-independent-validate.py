#!/usr/bin/env python3
"""Independent coordinate-equation check for all Applied 9 Q26 variants."""
from fractions import Fraction
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "bank/data/applied9-expanded.json").read_text())
SOURCE_PAGE = ROOT / ".private-work/hw-expansion-20261023/hw9/q25-q30-review/source-5.png"
ASSET = ROOT / "bank/assets/applied9/q26-source-distances.png"
SOURCE_PDF = ROOT / "materials/초등과정 대비 실전 모의고사 활용 9회.pdf"
SOURCE_SHA = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_SHA = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
EXPECTED = [(4, 3, 1), (3, 2, 2), (2, 1, 3), (4, 4, 1), (3, 3, 2),
            (1, 1, 4), (4, 5, 1), (3, 5, 2), (1, 6, 4)]

assert hashlib.sha256(SOURCE_PDF.read_bytes()).hexdigest() == SOURCE_SHA
items = [x for x in DATA["items"] if x["sourceNo"] == 26]
assert len(items) == len(EXPECTED) == 9
assert len({tuple(x["verification"]["parameters"][k] for k in ("minjeongSpeed", "heeseonSpeed", "donghoSpeed")) for x in items}) == 9
assert DATA["sourceReview"]["questionReviews"]["26"]["candidateAnswerSeconds"] == 57

source_crop = Image.open(SOURCE_PAGE).convert("RGB").crop((120, 1590, 870, 1780))
asset = Image.open(ASSET).convert("RGB")
assert source_crop.size == asset.size == (750, 190)
assert source_crop.tobytes() == asset.tobytes(), "Question art diverges from the untouched source crop."
asset_sha = hashlib.sha256(ASSET.read_bytes()).hexdigest()

answers = []
for item, (m, h, d) in zip(items, EXPECTED):
    p = item["verification"]["parameters"]
    assert (p["minjeongSpeed"], p["heeseonSpeed"], p["donghoSpeed"]) == (m, h, d)
    assert item["asset"]["sha256"] == p["sourceFigureCropSha256"] == asset_sha
    # Coordinate equations, independent of the stored relative-speed explanation.
    # M starts at 0; H at 215; D at 635. M/H travel right and D travels left.
    t_dh = Fraction(635 - 215, h + d)
    t_dm = Fraction(635, m + d)
    assert t_dh == Fraction(420, h + d)
    assert t_dm > t_dh
    assert 635 - d * t_dh == 215 + h * t_dh
    assert 635 - d * t_dm == m * t_dm
    assert 635 - d * t_dh > m * t_dh, "D meets H only after having met M."
    elapsed = t_dm - t_dh
    assert elapsed.denominator == 1
    value = int(elapsed)
    assert item["answer"] == str(value) and item["answerParts"] == [value]
    assert item["acceptedAnswers"] == [str(value)] and item["answerContract"] == "single-number"
    assert len(item["solutionSteps"]) == 4 and all(str(n) in " ".join(item["solutionSteps"]) for n in (m, h, d, value))
    assert item["reviewStatus"] == "verified" and item["difficultyEvidence"]["label"] == "상"
    answers.append(value)

# The original speeds (3,4,2) recover the candidate handwritten 57-second answer.
source_first = Fraction(420, 4 + 2)
source_second = Fraction(635, 3 + 2)
assert source_second - source_first == 57
assert DATA["itemCount"] == 270 and 26 in DATA["availableSourceNos"]
assert 26 not in DATA["pendingSourceNos"]
assert DATA["version"].endswith("-taxonomy-r25")

result = {"status": "PASS", "sourceNo": 26, "variants": len(items),
          "independentMethod": "coordinate equations over exact fractions",
          "speedTriples": EXPECTED, "answers": answers,
          "sourceAnswerReproduced": 57, "sourceFigurePixelExact": True,
          "sourceFigureCropSha256": asset_sha,
          "answerCandidateSha256": ANSWER_SHA}
evidence = ROOT / ".private-work/hw-expansion-20261023/hw9/q26-evidence"
evidence.mkdir(parents=True, exist_ok=True)
(evidence / "q26-independent-validation-r16.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result, ensure_ascii=False, indent=2))

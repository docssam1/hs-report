#!/usr/bin/env python3
"""Independent source-and-variant boundary enumeration for Applied 7 Q17."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'bank/data/applied7-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied7-expanded-index.json').read_text())
REVIEW = json.loads((ROOT / '.private-work/hw-expansion-20261023/hw7/q17-source-answer-review.json').read_text())
PROOF = json.loads((ROOT / '.private-work/hw-expansion-20261023/hw7/q17-independent-math.json').read_text())
items = [x for x in DATA['items'] if x['sourceNo'] == 17]
assert len(items) == 9 and [x['variantNo'] for x in items] == list(range(1, 10))
assert DATA['itemCount'] == 270 and len(DATA['availableSourceNos']) == 30
assert DATA['pendingSourceNos'] == []
assert INDEX['itemCount'] == DATA['itemCount'] and INDEX['pendingSourceNos'] == DATA['pendingSourceNos']
assert REVIEW['sourceExam']['page'] == REVIEW['sourceAnswer']['page'] == 4
assert REVIEW['sourceExam']['questionNo'] == 17 and not REVIEW['sourceAnswer']['officialKeyPresent']

results = []
for item, claimed in zip(items, REVIEW['variants']):
    p = item['verification']['parameters']
    w, h = p['mainWidth'], p['mainHeight']
    t, b, s = p['topExtensionRows'], p['bottomExtensionRows'], p['extensionWidth']
    start = (w - s + 1) // 2
    rows = [list(range(start, start+s)) for _ in range(t)] + [list(range(w)) for _ in range(h)] + [list(range(start, start+s)) for _ in range(b)]
    occupied = {(r,c) for r,row in enumerate(rows) for c in row}
    horizontal = {(r,c) for r,c in occupied} | {(r+1,c) for r,c in occupied}
    vertical = {(r,c) for r,c in occupied} | {(r,c+1) for r,c in occupied}
    # Count the complete boundary segments directly. A candidate counts only if every
    # unit segment on its top, bottom, left, and right sides is present in the drawing.
    count = 0
    for top in range(len(rows)):
        for bottom in range(top, len(rows)):
            for left in range(w):
                for right in range(left+1, w+1):
                    if (all((top,c) in horizontal for c in range(left,right))
                        and all((bottom+1,c) in horizontal for c in range(left,right))
                        and all((r,left) in vertical for r in range(top,bottom+1))
                        and all((r,right) in vertical for r in range(top,bottom+1))):
                        count += 1
    # Formula partitions row spans into those wholly inside the main rectangle and
    # those touching an extension, then counts horizontal intervals for each.
    middle_spans = h*(h+1)//2
    all_spans = len(rows)*(len(rows)+1)//2
    formula = middle_spans*w*(w+1)//2 + (all_spans-middle_spans)*s*(s+1)//2
    answer = int(item['answer'])
    asset_path = ROOT/'bank'/item['asset']['src']
    assert asset_path.is_file() and asset_path.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
    assert item['answerContract'] == 'single-number' and item['answerParts'] == [answer]
    assert item['pointBand'] == '3.4' and item['difficultyEvidence']['label'] == '중'
    assert len(item['solutionSteps']) == 4 and all(step for step in item['solutionSteps'])
    assert formula == count == answer == claimed['answer']
    assert item['verification']['sourceDrawingCompared'] and item['verification']['sourceDrawingPresent']
    assert item['reviewStatus'] == 'verified'
    results.append({'variantNo': item['variantNo'], 'answer': answer,
                    'formulaCount': formula, 'directBoundaryCount': count,
                    'singleAnswer': formula == count == answer,
                    'assetSha256': hashlib.sha256(asset_path.read_bytes()).hexdigest()})

assert results[0]['answer'] == 666
assert len({r['answer'] for r in results}) == 9
assert PROOF['allSourceAndVariantProofsAgree']
assert REVIEW['sourceExam']['drawingSha256'] == results[0]['assetSha256']
print(json.dumps({'result':'PASS','sourceAnswer':results[0]['answer'],
                  'variants':len(results),'answers':[r['answer'] for r in results],
                  'independentBoundaryCounts':[r['directBoundaryCount'] for r in results],
                  'bankItems':DATA['itemCount'],'bankTypes':len(DATA['availableSourceNos']),
                  'pending':DATA['pendingSourceNos']},ensure_ascii=False))

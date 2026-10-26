"""Independent component-count proof for Applied 8 Q11 folded cut variants."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'bank/data/applied8-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied8-expanded-index.json').read_text())
SIDE = 200


def count_components(mask, wanted):
    n = len(mask)
    visited = [bytearray(n) for _ in range(n)]
    count = 0
    for y in range(n):
        for x in range(n):
            if visited[y][x] or bool(mask[y][x]) != wanted:
                continue
            count += 1
            queue = deque([(x, y)])
            visited[y][x] = 1
            while queue:
                a, b = queue.popleft()
                for xx, yy in ((a-1, b), (a+1, b), (a, b-1), (a, b+1)):
                    if 0 <= xx < n and 0 <= yy < n and not visited[yy][xx] and bool(mask[yy][xx]) == wanted:
                        visited[yy][xx] = 1
                        queue.append((xx, yy))
    return count


def cut_rectangles(counts, width, depth):
    out = []
    for edge, count in zip(('top', 'left', 'right', 'bottom'), counts):
        positions = (100,) if count == 1 else ((58, 142) if count == 2 else ())
        for c in positions:
            if edge == 'top': out.append((c-width//2, 0, width, depth))
            elif edge == 'bottom': out.append((c-width//2, SIDE-depth, width, depth))
            elif edge == 'left': out.append((0, c-width//2, depth, width))
            else: out.append((SIDE-depth, c-width//2, depth, width))
    return out


def unfold_and_count(counts, width, depth):
    # No use of the 2/4-per-edge formula. Reflect every cut pixel into the
    # original 400×400 sheet, then flood-fill removed pieces and remainder.
    mask = [bytearray(SIDE*2) for _ in range(SIDE*2)]
    for x, y, w, h in cut_rectangles(counts, width, depth):
        for yy in range(y, y+h):
            for xx in range(x, x+w):
                for a in (SIDE-1-xx, SIDE+xx):
                    for b in (SIDE-1-yy, SIDE+yy):
                        mask[b][a] = 1
    removed = count_components(mask, True)
    remaining = count_components(mask, False)
    return removed, remaining


assert DATA['itemCount'] == 270 and INDEX['itemCount'] == 270
assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == []
items = [x for x in DATA['items'] if x['sourceNo'] == 11]
assert len(items) == 9 and [x['variantNo'] for x in items] == list(range(1, 10))
assert len({tuple(x['verification']['parameters']['cutsTopLeftRightBottom']) for x in items}) == 9
assert unfold_and_count((1, 1, 1, 1), 26, 28) == (12, 1)
for item in items:
    assert item['reviewStatus'] == 'verified'
    assert item['pointBand'] == '2.7' and item['difficultyEvidence']['label'] == '하'
    assert item['verification']['sourceTeacherAnswer'] == 13
    params = item['verification']['parameters']
    removed, remaining = unfold_and_count(params['cutsTopLeftRightBottom'], params['cutWidth'], params['cutDepth'])
    number = removed+remaining
    assert remaining == 1 and number == params['answer'] == item['answerParts'][0]
    assert item['answer'] == f'{number}조각'
    for k in ('asset', 'solutionAsset'):
        asset = ROOT / 'bank' / item[k]['src']
        assert asset.exists() and asset.stat().st_size > 500
    print(item['id'], f'{removed} removed + {remaining} remainder = {number}')
print('Applied 8 Q11 independent cut-piece component validation PASS')

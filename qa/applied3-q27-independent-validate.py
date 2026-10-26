"""Independent unit-cell enumeration for Applied 3 Q27 cuboid grids."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data_path = ROOT / 'bank/data/applied3-expanded.json'
data = json.loads(data_path.read_text())
items = [x for x in data['items'] if x['sourceNo'] == 27]
assert len(items) == 9 and 27 in data['availableSourceNos'] and 27 not in data['pendingSourceNos']

def enumerate_cuboids(width, depth, height):
    cuboids = set()
    for x0 in range(width):
        for x1 in range(x0 + 1, width + 1):
            for y0 in range(depth):
                for y1 in range(y0 + 1, depth + 1):
                    for z0 in range(height):
                        for z1 in range(z0 + 1, height + 1):
                            cuboids.add((x0, x1, y0, y1, z0, z1))
    return len(cuboids)

assert enumerate_cuboids(5, 3, 4) == 900
results = []
for item in items:
    p = item['verification']['parameters']
    dimensions = (p['width'], p['depth'], p['height'])
    assert dimensions != (5, 3, 4)
    answer = enumerate_cuboids(*dimensions)
    assert item['answerParts'] == [answer] and item['answer'] == str(answer)
    assert item['acceptedAnswers'] == [str(answer)]
    asset = ROOT / 'bank' / item['asset']['src']
    svg = asset.read_text()
    assert svg.count('<line ') >= sum(dimensions) * 2
    assert 'assets/applied3/q27-v' in item['asset']['src']
    assert item['difficultyEvidence']['label'] == '상'
    results.append({'id': item['id'], 'dimensions': dimensions, 'answer': answer,
                    'svgSha256': hashlib.sha256(asset.read_bytes()).hexdigest()})

out = ROOT / '.private-work/hw-expansion-20261023/hw3/q27-review/independent-r1.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'dataSha256': hashlib.sha256(data_path.read_bytes()).hexdigest(),
                           'sourceAnswer': 900, 'items': results}, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied3 Q27: source 900, nine variants independently enumerated')

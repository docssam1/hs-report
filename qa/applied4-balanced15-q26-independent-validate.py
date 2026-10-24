import collections
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'bank/data/applied4-balanced15.json'
doc = json.loads(DATA.read_text())
items = doc['items']
assert len(items) == 450
assert len({q['sourceNo'] for q in items}) == 30
group_counts = collections.Counter((q['sourceNo'], q['practiceLevel']) for q in items)
assert all(group_counts[(source, level)] == 5 for source in range(1, 31) for level in ('low', 'middle', 'high'))
q26 = [q for q in items if q['sourceNo'] == 26]
assert len(q26) == 15

def edge(a, b):
    return tuple(sorted((tuple(a), tuple(b))))

def neighbors(p, n, blocked):
    x, y = p
    for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= q[0] <= n and 0 <= q[1] <= n and edge(p, q) not in blocked:
            yield q

def bfs(n, blocked, start, goal):
    queue = collections.deque([(start, 0)])
    seen = {start}
    while queue:
        p, dist = queue.popleft()
        if p == goal:
            return dist
        for q in neighbors(p, n, blocked):
            if q not in seen:
                seen.add(q)
                queue.append((q, dist + 1))
    return None

def relaxation(n, blocked, start, goal):
    nodes = [(x, y) for x in range(n + 1) for y in range(n + 1)]
    inf = 10**9
    d = {p: 0 if p == start else inf for p in nodes}
    for _ in range(len(nodes) - 1):
        changed = False
        for p in nodes:
            if d[p] == inf:
                continue
            for q in neighbors(p, n, blocked):
                if d[q] > d[p] + 1:
                    d[q] = d[p] + 1
                    changed = True
        if not changed:
            break
    return None if d[goal] == inf else d[goal]

verified = []
for q in q26:
    p = q['verification']['parameters']
    n, start, goal = p['gridCells'], tuple(p['start']), tuple(p['goal'])
    blocked = {edge(a, b) for a, b in p['blockedRoadEdges']}
    d1 = bfs(n, blocked, start, goal)
    d2 = relaxation(n, blocked, start, goal)
    assert d1 is not None and d1 == d2 == p['oneWaySteps']
    assert p['roundTripMeters'] == d1 * p['unitLengthMeters'] * 2
    assert q['answer'] == str(p['roundTripMeters'])
    witness = [tuple(v) for v in p['witnessPath']]
    assert witness[0] == start and witness[-1] == goal and len(witness) - 1 == d1
    assert all(sum(abs(x-y) for x, y in zip(a, b)) == 1 and edge(a, b) not in blocked for a, b in zip(witness, witness[1:]))
    svg = ROOT / 'bank' / q['asset']['src']
    content = svg.read_text()
    assert 'width="224" height="224"' in content and content.count('stroke="#c9bda2"') == len(blocked)
    verified.append({'id': q['id'], 'steps': d1, 'roundTripMeters': p['roundTripMeters'], 'blockedEdges': len(blocked)})

assert all(q['verification']['sourceExamPage'] == 5 and q['verification']['sourceAnswerPage'] == 26 and q['verification']['sourceAnswerMatch'] is False for q in q26)
print(json.dumps({'status': 'PASS', 'items': len(items), 'sourceTypes': 30, 'q26Variants': len(verified),
                  'q26Levels': dict(collections.Counter(q['practiceLevel'] for q in q26)),
                  'dataSha256': hashlib.sha256(DATA.read_bytes()).hexdigest(), 'verified': verified}, ensure_ascii=False, indent=2))

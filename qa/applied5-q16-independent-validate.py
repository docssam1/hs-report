#!/usr/bin/env python3
"""Independent source and shortest-path audit for Applied 5 Q16."""
import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5'
DATA = json.loads((ROOT / 'bank/data/applied5-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied5-expanded-index.json').read_text())
REVIEW = json.loads((WORK / 'q16-source-answer-review.json').read_text())
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = WORK / 'q16-source-r11/answer.pdf'
START, END = (0, 0), (6, 4)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def graph_from(record):
    p = record['verification']['parameters']
    graph = defaultdict(set)
    for y, (left, right) in enumerate(p['horizontalRoadRanges']):
        for x in range(left, right):
            a, b = (x, y), (x + 1, y)
            graph[a].add(b); graph[b].add(a)
    for y, (left, right) in enumerate(p['verticalRoadRanges']):
        for x in range(left, right):
            a, b = (x, y), (x, y + 1)
            graph[a].add(b); graph[b].add(a)
    x, y = p['oneWayCell']
    bl, br, tr, tl = (x, y), (x + 1, y), (x + 1, y + 1), (x, y + 1)
    directed = ([(bl, br), (br, tr), (tr, tl), (tl, bl)] if p['orientation'] == 'ccw'
                else [(br, bl), (tr, br), (tl, tr), (bl, tl)])
    for a, b in directed:
        assert b in graph[a] and a in graph[b]
        graph[a].remove(b); graph[b].remove(a); graph[a].add(b)
    return graph


def bellman_ford(graph, source, reverse=False):
    nodes = set(graph)
    for targets in graph.values(): nodes.update(targets)
    edges = [(a, b) for a, targets in graph.items() for b in targets]
    if reverse: edges = [(b, a) for a, b in edges]
    inf = 10**9
    dist = {n: inf for n in nodes}; dist[source] = 0
    for _ in range(len(nodes) - 1):
        changed = False
        for a, b in edges:
            if dist[a] + 1 < dist[b]: dist[b] = dist[a] + 1; changed = True
        if not changed: break
    return dist


def audit(record):
    graph = graph_from(record)
    from_start = bellman_ford(graph, START)
    to_end = bellman_ford(graph, END, reverse=True)
    shortest = from_start[END]
    dag = {node: [nxt for nxt in graph[node]
                  if from_start[nxt] == from_start[node] + 1 and from_start[node] + 1 + to_end[nxt] == shortest]
           for node in graph}
    order = sorted(graph, key=lambda n: (from_start[n], n[1], n[0]))
    ways = {START: 1}
    for node in order:
        for nxt in dag[node]: ways[nxt] = ways.get(nxt, 0) + ways.get(node, 0)
    row_counts = []
    for y in range(5):
        xs = [x for x in sorted({n[0] for n in graph if n[1] == y})
              if from_start[(x, y)] + to_end[(x, y)] == shortest]
        row_counts.append({'y': y, 'x': xs, 'counts': [ways[(x, y)] for x in xs]})
    return shortest, ways.get(END, 0), row_counts


assert sha(EXAM) == REVIEW['sourceExam']['sha256']
assert sha(ANSWER) == REVIEW['sourceAnswer']['sha256'] == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
assert (WORK / 'q16-source-r11/exam-q16-crop.png').is_file()
assert (WORK / 'q16-source-r11/answer-q16-crop.png').is_file()
assert REVIEW['sourceExam']['page'] == 3 and REVIEW['sourceAnswer']['page'] == 16
assert REVIEW['sourceAnswer']['teacherAnswer'] == 12

source = {
    'verification': {'parameters': {'horizontalRoadRanges': [[0, 6], [0, 4], [1, 4], [2, 4], [3, 6]],
                                    'verticalRoadRanges': [[0, 4], [1, 4], [2, 4], [3, 5]],
                                    'oneWayCell': [2, 1], 'orientation': 'ccw'}}
}
assert audit(source)[:2] == (10, 12), audit(source)
items = [x for x in DATA['items'] if x['sourceNo'] == 16]
assert len(items) == 9
seen = set()
for item in items:
    assert item['reviewStatus'] == 'verified' and item['pointBand'] == '3.4'
    assert item['area'] == '경우의 수' and item['answerContract'] == 'ordered-parts'
    p = item['verification']['parameters']
    key = (tuple(p['oneWayCell']), p['orientation'])
    assert key not in seen; seen.add(key)
    distance, count, rows = audit(item)
    assert distance == p['shortestLength'] == 10
    assert count == p['shortestPathCount'] == int(item['answer'])
    assert rows == p['shortestPathRowCounts']
    assert rows[4]['counts'][-1] == count
    assert (ROOT / 'bank' / item['asset']['src']).is_file()
    assert len(item['solutionSteps']) >= 3 and str(count) in item['solutionSteps'][-1]
assert sorted(int(x['answer']) for x in items) == [10, 12, 12, 18, 18, 18, 20, 20, 26]
assert DATA['version'] == INDEX['version'] == '20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11'
assert len(DATA['items']) == INDEX['itemCount'] == 162
assert len(DATA['availableSourceNos']) == len(INDEX['items']) == 18
assert DATA['reviewSummary']['independentMathCount'] == 162
assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == [17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29]
print('PASS Q16 source: PDF hashes, direct review crops, answer 12; independent Bellman-Ford + shortest-path DAG count.')
print('PASS Q16 variants:', [(x['variantNo'], x['answer']) for x in items])
print('PASS Applied5 bank:', len(DATA['items']), 'items,', len(INDEX['items']), 'source types; 12 remain pending.')

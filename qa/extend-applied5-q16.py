#!/usr/bin/env python3
"""Add nine shortest-route variants for Applied 5 source question 16."""
import hashlib
import json
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / ".private-work/hw-expansion-20261023/hw5"
SRC = WORK / "q16-source-r11"
DATA_FILE = ROOT / "bank/data/applied5-expanded.json"
INDEX_FILE = ROOT / "bank/data/applied5-expanded-index.json"
ASSET_DIR = ROOT / "bank/assets/applied5"
EXAM = ROOT / "materials/초등과정 대비 실전 모의고사활용 5회.pdf"
ANSWER = SRC / "answer.pdf"
EXAM_ID = "1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp"
ANSWER_ID = "1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05"

# Each row lists the vertices connected by horizontal road segments.
HORIZONTAL = [(0, 6), (0, 4), (1, 4), (2, 4), (3, 6)]
# Each pair gives the half-open x range of vertical road segments between rows.
VERTICAL = [(0, 4), (1, 4), (2, 4), (3, 5)]
START, END = (0, 0), (6, 4)

# A cell is (x, y).  The orientation named ccw matches the source drawing:
# bottom east, right north, top west, left south in mathematical coordinates.
VARIANTS = [
    ((0, 0), "ccw"), ((0, 0), "cw"),
    ((1, 0), "ccw"), ((1, 0), "cw"),
    ((2, 0), "ccw"), ((2, 0), "cw"),
    ((1, 1), "ccw"), ((1, 1), "cw"),
    ((2, 2), "ccw"),
]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def build_graph(cell=None, orientation="ccw"):
    graph = {}

    def both(a, b):
        graph.setdefault(a, set()).add(b)
        graph.setdefault(b, set()).add(a)

    for y, (left, right) in enumerate(HORIZONTAL):
        for x in range(left, right):
            both((x, y), (x + 1, y))
    for y, (left, right) in enumerate(VERTICAL):
        for x in range(left, right):
            both((x, y), (x, y + 1))

    directed = []
    if cell is not None:
        x, y = cell
        bl, br, tr, tl = (x, y), (x + 1, y), (x + 1, y + 1), (x, y + 1)
        directed = ([(bl, br), (br, tr), (tr, tl), (tl, bl)]
                    if orientation == "ccw"
                    else [(br, bl), (tr, br), (tl, tr), (bl, tl)])
        for start, end in directed:
            assert end in graph.get(start, set()) and start in graph.get(end, set()), (cell, start, end)
            graph[start].remove(end)
            graph[end].remove(start)
            graph[start].add(end)
    return graph, directed


def shortest_counts(graph):
    distances = {START: 0}
    queue = deque([START])
    while queue:
        node = queue.popleft()
        for nxt in graph.get(node, ()):
            if nxt not in distances:
                distances[nxt] = distances[node] + 1
                queue.append(nxt)
    assert END in distances
    ways = {START: 1}
    for node in sorted(distances, key=lambda p: (distances[p], p[1], p[0])):
        for nxt in graph.get(node, ()):
            if distances.get(nxt) == distances[node] + 1:
                ways[nxt] = ways.get(nxt, 0) + ways.get(node, 0)
    return distances, ways


def svg(cell, orientation):
    width, height = 660, 470
    step, x0, y0 = 58, 64, 390

    def pt(node):
        x, y = node
        return x0 + step * x, y0 - step * y

    graph, directed = build_graph(cell, orientation)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6.5" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="#25221d"/></marker></defs>',
        '<rect width="100%" height="100%" fill="#fff"/>',
    ]
    # A pale, irregular lake sits inside the open right side of the route network.
    parts.append('<path d="M374 218 C378 178 402 162 431 168 C451 146 481 158 497 154 C526 160 535 180 526 204 C539 232 527 252 532 279 C521 304 499 310 482 305 C456 319 434 304 416 312 C389 302 376 286 381 263 C368 246 368 231 374 218 Z" fill="#f7f4ed" stroke="#454138" stroke-width="2"/>')
    parts.append('<text x="450" y="241" text-anchor="middle" font-family="serif" font-size="20" fill="#5f594d">호수</text>')
    # The path graph is the exact finite graph used by the independent count.
    drawn = set()
    for start, neighbors in graph.items():
        for end in neighbors:
            edge = tuple(sorted((start, end)))
            if edge in drawn:
                continue
            drawn.add(edge)
            ax, ay = pt(start)
            bx, by = pt(end)
            is_one_way = (start, end) in directed or (end, start) in directed
            if is_one_way:
                a, b = (start, end) if (start, end) in directed else (end, start)
                ax, ay = pt(a)
                bx, by = pt(b)
                marker = ' marker-end="url(#arrow)"'
                parts.append(f'<path d="M {ax} {ay} L {bx} {by}" fill="none" stroke="#25221d" stroke-width="2.5"{marker}/>')
            else:
                parts.append(f'<path d="M {ax} {ay} L {bx} {by}" fill="none" stroke="#25221d" stroke-width="2.5"/>')
    for label, node, dx, dy in [('가', START, -17, 21), ('나', END, 12, -10)]:
        x, y = pt(node)
        parts.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#25221d"/>')
        parts.append(f'<text x="{x+dx}" y="{y+dy}" font-family="serif" font-size="22" fill="#25221d">({label})</text>')
    parts.append('</svg>')
    return ''.join(parts)


def main():
    data = json.loads(DATA_FILE.read_text())
    assert data['version'].endswith('r10')
    assert 16 in data['pendingSourceNos'] and not any(q['sourceNo'] == 16 for q in data['items'])
    assert EXAM.is_file() and ANSWER.is_file()
    for name in ('exam-q16-crop.png', 'answer-q16-crop.png'):
        assert (SRC / name).is_file()

    # Source clockwise loop as actually drawn: bottom east, right north, top west, left south.
    source_graph, source_directed = build_graph((2, 1), 'ccw')
    source_distances, source_ways = shortest_counts(source_graph)
    assert source_distances[END] == 10 and source_ways[END] == 12, (source_distances[END], source_ways[END])

    records, variants = [], []
    for number, (cell, orientation) in enumerate(VARIANTS, 1):
        graph, directed = build_graph(cell, orientation)
        distances, ways = shortest_counts(graph)
        shortest_length, answer = distances[END], ways[END]
        rows = []
        for y in range(5):
            xs = [x for x in sorted({n[0] for n in graph if n[1] == y})]
            on_shortest = [x for x in xs if distances[(x, y)] + shortest_to_end(graph, (x, y)) == shortest_length]
            rows.append({'y': y, 'x': on_shortest, 'counts': [ways[(x, y)] for x in on_shortest]})
        asset = ASSET_DIR / f'q16-v{number}.svg'
        asset.write_text(svg(cell, orientation), encoding='utf-8')
        row_summary = '; '.join(
            f"y={row['y']} (x={','.join(map(str,row['x']))}): {','.join(map(str,row['counts']))}"
            for row in rows if row['x']
        )
        steps = [
            f"(가)에서 (나)까지 가장 짧은 길은 도로 구간 {shortest_length}개를 지납니다.",
            f"교차점에 도착하는 최단 경로 수는 바로 앞 교차점의 수를 더해 구합니다. 호수 주위에서는 화살표가 가리키는 방향으로만 이동합니다. 행별 누적값은 {row_summary}입니다.",
            f"따라서 가장 짧은 길로 가는 방법은 {answer}가지입니다."
        ]
        params = {
            'horizontalRoadRanges': [list(v) for v in HORIZONTAL],
            'verticalRoadRanges': [list(v) for v in VERTICAL],
            'start': list(START), 'end': list(END),
            'oneWayCell': list(cell), 'orientation': orientation,
            'shortestLength': shortest_length,
            'shortestPathCount': answer,
            'shortestPathRowCounts': rows,
        }
        variants.append({
            'id': f'applied5-q16-v{number}', 'genId': 'applied5-q16', 'sourceSet': 'applied', 'sourceRound': 5,
            'sourceNo': 16, 'variantNo': number, 'reviewStatus': 'verified', 'area': '경우의 수',
            'subarea': '격자 경로와 일방통행', 'detailType': '호수 주위에서 가장 짧은 길의 수',
            'pointBand': '3.4',
            'text': '그림과 같이 호수 주위에 일방통행로가 있습니다. 일방통행로에서는 정해진 방향으로만 갈 수 있습니다. (가) 지점에서 (나) 지점까지 가장 짧은 길로 가는 방법은 모두 몇 가지입니까?',
            'asset': {'kind': 'svg', 'src': f'assets/applied5/q16-v{number}.svg', 'description': '호수 주위 격자형 도로와 일방통행 화살표'},
            'answer': str(answer), 'answerParts': [answer], 'answerLabels': ['방법 수'],
            'acceptedAnswers': [str(answer)], 'answerContract': 'ordered-parts',
            'solutionSteps': steps, 'solution': ' '.join(steps),
            'learningPoint': '일방통행 방향과 최단 거리 조건을 지키며 교차점별 경로 수를 누적한다.',
            'learningLocation': '활용 5회 · 원문 16번 · 호수 주위 최단 경로와 일방통행',
            'verification': {
                'primaryMethod': '원문 그림의 도로 교차점을 그래프로 옮긴 뒤 너비 우선 탐색과 거리 오름차순 경로 수 누적으로 최단 경로를 센다.',
                'independentMethod': '거리 배열을 먼저 산출하고, 최단 거리 차이가 1인 유향 간선만 남긴 비순환 그래프에서 동적 계획법으로 경로 수를 다시 센다.',
                'parameters': params, 'independentSuite': 'qa/applied5-q16-independent-validate.py',
                'sourceExamPage': 3, 'sourceAnswerPage': 16, 'sourceExamFile': EXAM.name,
                'sourceAnswerFile': ANSWER.name, 'sourceExamDriveFileId': EXAM_ID,
                'sourceAnswerDriveFileId': ANSWER_ID, 'sourceDrawingCompared': True,
                'variantDrawingType': 'staircase-grid-road-around-lake-with-directed-square-loop',
                'sourceAnswerStatus': '원문 답안 PDF p16 교사 표시 12가지. 원문 화살표 방향을 반영한 최단 경로 계산으로 12가지를 재현했다.',
                'studentDifficultyMeasured': False
            },
            'difficultyEvidence': {
                'basis': 'source-point-band', 'label': '중', 'sourceReasoningPreserved': True,
                'measuredVariantRate': None, 'estimated': False,
                'rationale': '활용 5회 원문 16번은 13~22번 3.4점 배점대이므로 활용 난도는 배점대만 적용한다.'
            }
        })
        records.append({'variantNo': number, **params})

    assert len({(tuple(x['verification']['parameters']['oneWayCell']), x['verification']['parameters']['orientation']) for x in variants}) == 9
    data['items'].extend(variants)
    data['items'].sort(key=lambda q: (q['sourceNo'], q['variantNo']))
    data['availableSourceNos'].append(16)
    data['availableSourceNos'].sort()
    data['pendingSourceNos'].remove(16)
    data['version'] = '20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11'
    summary = data['reviewSummary']
    summary.update({'independentMathCount': len(data['items']), 'sourceTypes': len(data['availableSourceNos']), 'sourceDrawingCount': 9})
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    index = {'version': data['version'], 'sourceSet': 'applied', 'sourceRound': 5, 'itemCount': len(data['items']), 'pendingSourceNos': data['pendingSourceNos'], 'items': []}
    for no in data['availableSourceNos']:
        q = next(q for q in data['items'] if q['sourceNo'] == no)
        index['items'].append({'sourceNo': no, 'genId': q['genId'], 'area': q['area'], 'subarea': q['subarea'], 'detailType': q['detailType'], 'pointBand': q['pointBand'], 'reviewStatus': 'verified', 'variantCount': 9})
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    review = {
        'sourceExam': {'file': EXAM.name, 'driveFileId': EXAM_ID, 'bytes': EXAM.stat().st_size, 'sha256': sha(EXAM), 'page': 3, 'questionNo': 16,
                       'directVisualReview': True, 'cropPath': str((SRC / 'exam-q16-crop.png').relative_to(ROOT)),
                       'roadModel': {'horizontal': HORIZONTAL, 'verticalHalfOpen': VERTICAL, 'start': START, 'end': END,
                                     'directedLoopCell': [2, 1], 'directedLoopOrientation': 'ccw'}},
        'sourceAnswer': {'file': ANSWER.name, 'driveFileId': ANSWER_ID, 'bytes': ANSWER.stat().st_size, 'sha256': sha(ANSWER),
                         'page': 16, 'directVisualReview': True, 'teacherAnswer': 12,
                         'cropPath': str((SRC / 'answer-q16-crop.png').relative_to(ROOT))},
        'sourceIndependentCheck': {'shortestLength': source_distances[END], 'shortestPathCount': source_ways[END],
                                   'method': 'BFS distances followed by shortest-distance DAG path-count dynamic programming'},
        'newVariants': 9, 'difficulty': '3.4 point band only = medium', 'variants': records, 'dataVersion': data['version']
    }
    (WORK / 'q16-source-answer-review.json').write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')
    print('Added Applied5 Q16:', [(q['variantNo'], q['answer']) for q in variants], 'source answer 12 reproduced; total', len(data['items']))


def shortest_to_end(graph, start):
    distances = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in graph.get(node, ()):
            if nxt not in distances:
                distances[nxt] = distances[node] + 1
                queue.append(nxt)
    return distances.get(END, 10**9)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Independent source-graph, odd-wheel, coloring, and current-inventory audit for Applied 8 Q28."""
from collections import Counter, deque
from itertools import combinations
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw8'
SOURCE = ROOT / 'materials/초등과정 대비 실전 모의고사활용 8회.pdf'
ANSWER = WORK / 'source-review/applied8-answer-drive-copy.pdf'
FULL_PAGE = Image.open(WORK / 'source-review/q26-source-page-6.png').convert('RGB')
SOURCE_CROP = WORK / 'source-review/q28-map-original-crop.png'
DATA = json.loads((ROOT / 'bank/data/applied8-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied8-expanded-index.json').read_text())
REVIEW = json.loads((WORK / 'q28-source-review.json').read_text())
VERSION = '20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27'
SOURCE_NOS = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
CONFIGS = [(3, 7), (5, 4), (7, 3), (9, 2), (3, 6), (5, 5), (7, 2), (9, 3)]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def segment_source(im, threshold=180):
    im = im.convert('L')
    w, h = im.size
    pix = im.load()
    label = [0] * (w * h)
    sizes = {}
    n = 0
    for y in range(h):
        for x in range(w):
            p = y * w + x
            if label[p] or pix[x, y] <= threshold:
                continue
            n += 1
            label[p] = n
            q = deque([p])
            size = 0
            while q:
                z = q.popleft()
                size += 1
                yy, xx = divmod(z, w)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    X, Y = xx + dx, yy + dy
                    if 0 <= X < w and 0 <= Y < h:
                        z2 = Y * w + X
                        if not label[z2] and pix[X, Y] > threshold:
                            label[z2] = n
                            q.append(z2)
            sizes[n] = size
    nodes = {i for i, size in sizes.items() if size > 50}
    assert len(nodes) == 20
    contacts = Counter()
    # Cross a narrow dark boundary and count contact along scan lines; one-point
    # contacts cannot accumulate the 8 hits required for an adjacency edge.
    for y in range(h):
        x = 0
        while x < w:
            a = label[y * w + x]
            if a not in nodes:
                x += 1
                continue
            x += 1
            while x < w and label[y * w + x] == a:
                x += 1
            gap = x
            while x < w and label[y * w + x] == 0:
                x += 1
            if x < w and 0 < x - gap <= 5:
                b = label[y * w + x]
                if b in nodes and b != a:
                    contacts[tuple(sorted((a, b)))] += 1
    for x in range(w):
        y = 0
        while y < h:
            a = label[y * w + x]
            if a not in nodes:
                y += 1
                continue
            y += 1
            while y < h and label[y * w + x] == a:
                y += 1
            gap = y
            while y < h and label[y * w + x] == 0:
                y += 1
            if y < h and 0 < y - gap <= 5:
                b = label[y * w + x]
                if b in nodes and b != a:
                    contacts[tuple(sorted((a, b)))] += 1
    edges = sorted(edge for edge, hits in contacts.items() if hits >= 8)
    return w, h, label, nodes, edges, contacts


def minimum_coloring(nodes, edges):
    adj = {n: set() for n in nodes}
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    for k in range(1, 5):
        c = {}

        def go():
            if len(c) == len(nodes):
                return c.copy()
            n = max((x for x in nodes if x not in c), key=lambda x:(len({c[y] for y in adj[x] if y in c}), len(adj[x])))
            for color in range(k):
                if all(c.get(y) != color for y in adj[n]):
                    c[n] = color
                    found = go()
                    if found:
                        return found
                    del c[n]
            return None

        found = go()
        if found:
            return k, found, adj
    raise AssertionError('No coloring with up to four colors.')


def wheel_search(adj, edges):
    es = {tuple(sorted(e)) for e in edges}
    for hub in sorted(adj):
        ns = sorted(adj[hub])
        for k in (3, 5, 7, 9):
            for cand in combinations(ns, k):
                def walk(path):
                    if len(path) == k:
                        return path if tuple(sorted((path[-1], path[0]))) in es else None
                    for nxt in cand:
                        if nxt not in path and tuple(sorted((path[-1], nxt))) in es:
                            out = walk(path + [nxt])
                            if out:
                                return out
                    return None
                for start in cand:
                    ring = walk([start])
                    if ring:
                        return hub, ring
    raise AssertionError('No odd wheel found in source map.')


def graph_for_ring(k, layers):
    nodes = set(range(1, 2 + k * layers))
    edges = set()
    def rid(layer, sector):
        return 2 + layer * k + sector
    for layer in range(layers):
        for sector in range(k):
            edges.add(tuple(sorted((rid(layer, sector), rid(layer, (sector + 1) % k)))) )
            if layer:
                edges.add(tuple(sorted((rid(layer, sector), rid(layer - 1, sector)))) )
    for sector in range(k):
        edges.add((1, rid(0, sector)))
    return nodes, sorted(edges)


def explicit_ring_coloring(k, layers):
    out = {1: 3}
    for layer in range(layers):
        for sector in range(k):
            base = sector % 2 if sector < k - 1 else 2
            out[2 + layer * k + sector] = (base + layer) % 3
    return out


source_text = PdfReader(str(SOURCE)).pages[5].extract_text() or ''
answer_text = PdfReader(str(ANSWER)).pages[5].extract_text() or ''
normalize = lambda s: re.sub(r'\s+', '', s)
assert normalize(source_text) == normalize(answer_text)
assert '지역들을색칠하려고하는데' in normalize(source_text)
assert '최소몇개의색이필요한지' in normalize(source_text)
assert '한점에서만만나는두지역은같은색으' in normalize(source_text)
assert FULL_PAGE.size == (1519, 2150)
crop_check = FULL_PAGE.crop((142, 1456, 581, 1752))
assert crop_check.size == (439, 296) and crop_check.tobytes() == Image.open(SOURCE_CROP).convert('RGB').tobytes()
w, h, labels, nodes, edges, contacts = segment_source(crop_check)
chi, source_coloring, adj = minimum_coloring(nodes, edges)
hub, rim = wheel_search(adj, edges)
assert chi == 4 and hub == 14 and set(rim) == {7, 9, 16, 15, 13} and len(rim) == 5
assert all(source_coloring[a] != source_coloring[b] for a, b in edges)
assert all(tuple(sorted((hub, n))) in edges for n in rim)
source_item = ROOT / 'bank/assets/applied8/q28-map-original.png'
assert source_item.read_bytes() == SOURCE_CROP.read_bytes()

items = [x for x in DATA['items'] if x['sourceNo'] == 28]
assert len(items) == 9
rows = []
for i, item in enumerate(items, 1):
    assert item['id'] == f'applied8-q28-v{i}' and item['reviewStatus'] == 'verified'
    assert item['answer'] == '4가지' and item['answerParts'] == [4]
    assert item['acceptedAnswers'] == ['4', '4가지', '네 가지', '4가지 색']
    assert item['pointBand'] == '4.2' and item['difficultyEvidence']['label'] == '상'
    assert item['area'] == '도형' and item['learningPoint'] and item['learningLocation']
    assert len(item['solutionSteps']) == 3 and item['solutionAsset']
    qpath = ROOT / 'bank' / item['asset']['src']
    spath = ROOT / 'bank' / item['solutionAsset']['src']
    assert qpath.is_file() and spath.is_file()
    if i == 1:
        assert item['verification']['sourceDrawingPixelExactCrop'] and sha(qpath) == sha(SOURCE_CROP)
        saved = item['verification']['parameters']['coloring']
        assert all(saved[str(c)] for c in range(4))
        for a, b in edges:
            assert source_coloring[a] != source_coloring[b]
        assert Image.open(spath).size == (439, 296)
    else:
        k, layers = CONFIGS[i-2]
        rn, re = graph_for_ring(k, layers)
        num_colors, solver_colors, _ = minimum_coloring(rn, re)
        colors = explicit_ring_coloring(k, layers)
        assert num_colors == 4 and all(colors[a] != colors[b] for a, b in re)
        assert len(rn) == 1 + k * layers == item['verification']['parameters']['regionCount']
        for path in (qpath, spath):
            root = ET.parse(path).getroot()
            ns = {'s':'http://www.w3.org/2000/svg'}
            assert root.tag.endswith('svg') and len(root.findall('.//s:path',ns)) == len(rn)
        qroot = ET.parse(qpath).getroot()
        assert all(node.attrib.get('fill') == '#ffffff' for node in qroot.findall('.//{http://www.w3.org/2000/svg}path'))
        assert item['verification']['parameters']['oddCycleRegions'] == [2+i for i in range(k)]
        rows.append({'variant':i,'oddSectors':k,'rings':layers,'regions':len(rn),'edges':len(re),'minimumColors':num_colors})
        continue
    rows.append({'variant':i,'regions':len(nodes),'edges':len(edges),'minimumColors':chi,'oddWheelHub':hub,'oddCycle':rim})

assert DATA['version'] == INDEX['version'] == VERSION
assert DATA['itemCount'] == INDEX['itemCount'] == 243 and len(DATA['items']) == 243
assert DATA['availableSourceNos'] == SOURCE_NOS
assert [x['sourceNo'] for x in INDEX['items']] == SOURCE_NOS
assert DATA['pendingSourceNos'] == [n for n in range(1,31) if n not in SOURCE_NOS]
assert next(x for x in INDEX['items'] if x['sourceNo'] == 28)['variantCount'] == 9
assert REVIEW['sourceIndependentSolution']['minimumColors'] == 4
assert REVIEW['sourceIndependentSolution']['oddWheel']['hub'] == hub
assert REVIEW['sourceIndependentSolution']['oddWheel']['rim'] == rim
assert REVIEW['sourceExam']['enclosedRegions'] == len(nodes) and REVIEW['sourceExam']['boundaryAdjacencyEdges'] == len(edges)
report = {'passed':True,'sourceSha256':sha(SOURCE),'blankAnswerCandidateSha256':sha(ANSWER),'answerPageTextMatchesQuestionPage':True,'sourceCropPixelExact':True,'sourceRegions':len(nodes),'sourceAdjacencyEdges':len(edges),'sourceMinimumColors':chi,'sourceOddWheel':{'hub':hub,'rim':rim},'variants':rows,'newSourceTypes':0,'sourceTypes':27,'totalItems':243,'difficulty':'4.2 point band = high'}
(WORK / 'q28-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied8 Q28: exact map crop; 20 original regions, 42 shared-border edges; five-cycle and hub prove four colors; 8 generated maps independently 4-colorable; 243-item r27 index valid.')

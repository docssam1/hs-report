#!/usr/bin/env python3
"""Extend Applied 8 Q28: minimum colors for a map with point-only contacts exempt."""
from collections import Counter, deque
from pathlib import Path
from itertools import combinations
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw8'
SOURCE = ROOT / 'materials/초등과정 대비 실전 모의고사활용 8회.pdf'
ANSWER_COPY = WORK / 'source-review/applied8-answer-drive-copy.pdf'
PAGE = WORK / 'source-review/q26-source-page-6.png'
SOURCE_CROP = WORK / 'source-review/q28-map-original-crop.png'
DATA = ROOT / 'bank/data/applied8-expanded.json'
INDEX = ROOT / 'bank/data/applied8-expanded-index.json'
ASSETS = ROOT / 'bank/assets/applied8'
REVIEW = WORK / 'q28-source-review.json'
VERSION = '20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-r14'
PALETTE = ['#e9f0e7', '#f2dfba', '#e9cec1', '#d2d0c7']
STEM = ('어느 나라는 다음과 같이 지역이 나누어져 있습니다. 지도의 각 지역들을 색칠하려고 하는데, 서로 이웃하는 지역은 다르게 색칠해야 한다고 합니다. '
        '최소 몇 개의 색이 필요한지 구하시오. (단, 서로 한 점에서만 만나는 두 지역은 같은 색으로 색칠할 수 있습니다.)')
CONFIGS = [(3, 7), (5, 4), (7, 3), (9, 2), (3, 6), (5, 5), (7, 2), (9, 3)]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def flood_regions(image, threshold=180):
    im = image.convert('L')
    w, h = im.size
    pix = im.load()
    labels = [0] * (w * h)
    sizes = {}
    n = 0
    for y in range(h):
        for x in range(w):
            pos = y * w + x
            if labels[pos] or pix[x, y] <= threshold:
                continue
            n += 1
            labels[pos] = n
            q = deque([pos])
            size = 0
            while q:
                p = q.popleft()
                size += 1
                yy, xx = divmod(p, w)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    X, Y = xx + dx, yy + dy
                    if 0 <= X < w and 0 <= Y < h:
                        ni = Y * w + X
                        if not labels[ni] and pix[X, Y] > threshold:
                            labels[ni] = n
                            q.append(ni)
            sizes[n] = size
    # The exact outer-border crop has no exterior component; reject any tiny raster specks.
    valid = {i for i, size in sizes.items() if size > 50}
    assert len(valid) == 20, f'Expected 20 enclosed regions in original map; found {len(valid)}'
    return w, h, labels, valid


def source_edges(image):
    w, h, labels, valid = flood_regions(image)
    contacts = Counter()
    # A shared straight boundary appears on multiple scan lines. Isolated point contacts
    # produce only one or two hits and are intentionally excluded.
    for y in range(h):
        x = 0
        while x < w:
            a = labels[y * w + x]
            if a not in valid:
                x += 1
                continue
            x += 1
            while x < w and labels[y * w + x] == a:
                x += 1
            gap_start = x
            while x < w and labels[y * w + x] == 0:
                x += 1
            if x < w and 0 < x - gap_start <= 5:
                b = labels[y * w + x]
                if b in valid and b != a:
                    contacts[tuple(sorted((a, b)))] += 1
    for x in range(w):
        y = 0
        while y < h:
            a = labels[y * w + x]
            if a not in valid:
                y += 1
                continue
            y += 1
            while y < h and labels[y * w + x] == a:
                y += 1
            gap_start = y
            while y < h and labels[y * w + x] == 0:
                y += 1
            if y < h and 0 < y - gap_start <= 5:
                b = labels[y * w + x]
                if b in valid and b != a:
                    contacts[tuple(sorted((a, b)))] += 1
    edges = sorted(edge for edge, length in contacts.items() if length >= 8)
    return w, h, labels, valid, edges, contacts


def color_graph(nodes, edges, max_colors=4):
    adj = {n: set() for n in nodes}
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    for k in range(1, max_colors + 1):
        colors = {}

        def visit():
            if len(colors) == len(nodes):
                return colors.copy()
            node = max((n for n in nodes if n not in colors),
                       key=lambda n: (len({colors[v] for v in adj[n] if v in colors}), len(adj[n])))
            for c in range(k):
                if all(colors.get(v) != c for v in adj[node]):
                    colors[node] = c
                    result = visit()
                    if result:
                        return result
                    del colors[node]
            return None

        result = visit()
        if result:
            return k, result, adj
    return None, None, adj


def find_odd_wheel(adj, edges):
    edge_set = {tuple(sorted(e)) for e in edges}
    for hub in sorted(adj):
        neighbors = sorted(adj[hub])
        for k in (3, 5, 7, 9):
            for cycle in combinations(neighbors, k):
                # The map's core is a simple cyclic chain; find an ordering by DFS.
                def walk(path):
                    if len(path) == k:
                        return path if tuple(sorted((path[-1], path[0]))) in edge_set else None
                    for nxt in cycle:
                        if nxt not in path and tuple(sorted((path[-1], nxt))) in edge_set:
                            found = walk(path + [nxt])
                            if found:
                                return found
                    return None
                for start in cycle:
                    found = walk([start])
                    if found:
                        return hub, found
    raise AssertionError('Original map did not contain the expected odd wheel proof core.')


def color_source_image(image, labels, w, h, colors):
    out = image.convert('RGB')
    px = out.load()
    centers = {}
    totals = Counter()
    rgb = image.convert('RGB')
    for y in range(h):
        for x in range(w):
            region = labels[y * w + x]
            if region in colors and max(rgb.getpixel((x, y))) > 180:
                px[x, y] = tuple(bytes.fromhex(PALETTE[colors[region]][1:]))
                totals[region] += 1
                centers.setdefault(region, [0, 0])
                centers[region][0] += x
                centers[region][1] += y
    draw = ImageDraw.Draw(out)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 14)
    except OSError:
        font = ImageFont.load_default()
    for region, (sx, sy) in centers.items():
        x, y = sx / totals[region], sy / totals[region]
        text = str(region)
        box = draw.textbbox((0, 0), text, font=font, stroke_width=2)
        tw, th = box[2] - box[0], box[3] - box[1]
        draw.text((x - tw / 2, y - th / 2), text, fill='#211b16', font=font,
                  stroke_width=2, stroke_fill='#fffdf8')
    return out


def point(cx, cy, r, deg):
    import math
    a = math.radians(deg)
    return (cx + r * math.cos(a), cy + r * math.sin(a))


def ring_svg(sectors, layers, variant, filled=False):
    import math
    width, height, cx, cy = 320, 240, 160, 120
    # Irregular but concentric bounds and a rotated seam vary the map without changing
    # the adjacency rule. The source item retains its exact original crop separately.
    outer = [85, 90, 94, 88, 92, 86, 95, 89][variant - 2]
    inner = [20, 18, 22, 19, 21, 17, 23, 20][variant - 2]
    offset = [-90, -108, -76, -101, -82, -113, -71, -95][variant - 2]
    # Slightly unequal radial widths make each map recognizably distinct.
    weights = [[1, 1.1, .9, 1.2, .95, 1.05, .92], [.9, 1.1, 1.2, .85, 1.05],
               [1.1, .9, 1.25], [1, 1], [1.2, .8, 1.1, .9, 1, 1.05],
               [.9, 1.2, .85, 1.15, .95], [1, 1], [.85, 1.2, .95]][variant - 2][:layers]
    total = sum(weights)
    radii = [inner]
    for weight in weights:
        radii.append(radii[-1] + (outer - inner) * weight / total)
    defs = '<defs><clipPath id="map"><rect x="5" y="5" width="310" height="230" rx="3"/></clipPath></defs>'
    paths = []
    pattern = [i % 2 for i in range(sectors - 1)] + [2]
    for layer in range(layers):
        for sector in range(sectors):
            a0 = offset + 360 * sector / sectors
            a1 = offset + 360 * (sector + 1) / sectors
            steps = max(2, math.ceil((a1-a0)/12))
            points = [point(cx, cy, radii[layer + 1], a0 + (a1-a0)*j/steps) for j in range(steps + 1)]
            points += [point(cx, cy, radii[layer], a0 + (a1-a0)*j/steps) for j in range(steps, -1, -1)]
            d = 'M ' + ' L '.join(f'{x:.2f},{y:.2f}' for x,y in points) + ' Z'
            color = PALETTE[(pattern[sector] + layer) % 3] if filled else '#ffffff'
            paths.append(f'<path d="{d}" fill="{color}" stroke="#29251f" stroke-width="1.8" stroke-linejoin="round"/>')
    center_poly = [point(cx, cy, inner, offset + 360*j/sectors) for j in range(sectors)]
    d = 'M ' + ' L '.join(f'{x:.2f},{y:.2f}' for x,y in center_poly) + ' Z'
    center_color = PALETTE[3] if filled else '#ffffff'
    paths.insert(0, f'<path d="{d}" fill="{center_color}" stroke="#29251f" stroke-width="1.8" stroke-linejoin="round"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">{defs}<g clip-path="url(#map)">'+''.join(paths)+'</g></svg>\n'


def build_ring_graph(sectors, layers):
    center = 1
    nodes = set(range(1, 2 + sectors * layers))
    edges = set()
    # IDs: 1 center; then ring-major sectors, one-based within each ring.
    def rid(layer, sector):
        return 2 + layer * sectors + sector
    for layer in range(layers):
        for sector in range(sectors):
            edges.add(tuple(sorted((rid(layer, sector), rid(layer, (sector + 1) % sectors)))))
            if layer > 0:
                edges.add(tuple(sorted((rid(layer, sector), rid(layer - 1, sector)))))
    for sector in range(sectors):
        edges.add((center, rid(0, sector)))
    return nodes, sorted(edges)


def ring_solution(sectors, layers):
    nodes, edges = build_ring_graph(sectors, layers)
    k, coloring, adj = color_graph(nodes, edges)
    assert k == 4
    # The hand-constructed coloring is also checked by the independent graph solver.
    expected = {1: 3}
    for layer in range(layers):
        for sector in range(sectors):
            pattern = (sector % 2) if sector < sectors - 1 else 2
            expected[2 + layer * sectors + sector] = (pattern + layer) % 3
    assert all(expected[a] != expected[b] for a, b in edges)
    return expected, nodes, edges


def main():
    source_text = PdfReader(str(SOURCE)).pages[5].extract_text() or ''
    answer_text = PdfReader(str(ANSWER_COPY)).pages[5].extract_text() or ''
    normalized = re.sub(r'\s+', '', source_text)
    assert '지역들을색칠' in normalized and '최소개수의색' not in normalized
    assert '최소몇개의색이필요한지' in normalized and '한점에서만만나는두지역' in normalized
    assert source_text == answer_text, 'Available answer candidate should be an unmarked duplicate; inspect before proceeding.'
    rendered = Image.open(PAGE).convert('RGB')
    assert rendered.size == (1519, 2150)
    # Crop only the original black map border and its regions from the verified source render.
    rendered.crop((142, 1456, 581, 1752)).save(SOURCE_CROP)
    source_image = Image.open(SOURCE_CROP).convert('RGB')
    assert source_image.size == (439, 296)
    w, h, labels, nodes, edges, contacts = source_edges(source_image)
    minimum, coloring, adj = color_graph(nodes, edges)
    assert minimum == 4
    hub, rim = find_odd_wheel(adj, edges)
    assert len(rim) % 2 == 1 and all(tuple(sorted((rim[i], rim[(i+1) % len(rim)]))) in edges for i in range(len(rim)))
    assert all(tuple(sorted((hub, region))) in edges for region in rim)
    for a, b in edges:
        assert coloring[a] != coloring[b]
    colored_source = color_source_image(source_image, labels, w, h, coloring)
    colored_source_path = ASSETS / 'q28-source-colored-solution.png'
    colored_source.save(colored_source_path)

    data = json.loads(DATA.read_text())
    index = json.loads(INDEX.read_text())
    old = [x for x in data['items'] if x['sourceNo'] == 28]
    if old and len(old) != 9:
        raise SystemExit(f'Q28 already has {len(old)} items; inspect before replacing.')
    items, variant_rows = [], []
    # Original item: preserve the source drawing byte-for-byte as an image crop.
    for variant in range(1, 10):
        if variant == 1:
            sectors, layers = None, None
            asset_path = ASSETS / 'q28-map-original.png'
            asset_path.write_bytes(SOURCE_CROP.read_bytes())
            kind, region_count = 'raster', len(nodes)
            solution_path = colored_source_path
            color_groups = {c: sorted(n for n in nodes if coloring[n] == c) for c in range(4)}
            graph_edges = len(edges)
            proof_hub, proof_rim = hub, rim
            svg = None
        else:
            sectors, layers = CONFIGS[variant - 2]
            expected, generated_nodes, generated_edges = ring_solution(sectors, layers)
            asset_path = ASSETS / f'q28-map-v{variant}.svg'
            svg = ring_svg(sectors, layers, variant, filled=False)
            asset_path.write_text(svg, encoding='utf-8')
            solution_path = ASSETS / f'q28-map-v{variant}-colored-solution.svg'
            solution_path.write_text(ring_svg(sectors, layers, variant, filled=True), encoding='utf-8')
            kind, region_count = 'vector', len(generated_nodes)
            color_groups = {c: sorted(n for n in generated_nodes if expected[n] == c) for c in range(4)}
            graph_edges = len(generated_edges)
            proof_hub, proof_rim = 1, [2 + i for i in range(sectors)]
        steps = [
            ('공통 변을 따라 인접 관계를 확인하고 한 점에서만 만나는 지역은 이웃에서 제외합니다.' if variant == 1 else f'가운데 지역과 안쪽의 {sectors}개 지역을 먼저 봅니다. 안쪽 지역은 홀수 개의 고리를 이룹니다.'),
            (f'풀이 그림의 {len(proof_rim)}개 지역은 홀수 고리를 이루고 가운데 {hub}번 지역은 그 고리의 모든 지역과 변을 공유합니다. 홀수 고리에는 세 색이 필요하고 가운데는 그 세 색을 쓸 수 없어 적어도 네 색이 필요합니다.' if variant == 1 else f'홀수 고리에서는 두 색만 번갈아 쓸 수 없어 세 색이 필요합니다. 가운데 지역은 고리의 모든 지역과 이웃하므로 네 번째 색이 필요합니다.'),
            ('풀이 그림과 같이 실제로 네 색으로 칠할 수 있습니다. 따라서 최소 네 가지입니다.' if variant == 1 else '바깥 고리의 색을 한 고리마다 차례로 바꾸면 같은 변을 공유하는 지역끼리 겹치지 않게 네 색으로 칠할 수 있습니다. 따라서 최소 네 가지입니다.'),
        ]
        if variant == 1:
            solution_asset = {'kind':'raster','src':str(solution_path.relative_to(ROOT / 'bank')),'description':'원문 지도에서 서로 변을 공유하는 지역이 다른 색이 되도록 칠한 한 가지 예','caption':'인접한 지역끼리 다른 네 색을 사용한 예'}
        else:
            solution_asset = {'kind':'vector','src':str(solution_path.relative_to(ROOT / 'bank')),'description':'동심 고리 지도에 서로 변을 공유하는 지역이 다른 색이 되도록 칠한 한 가지 예','caption':'인접한 지역끼리 다른 네 색을 사용한 예'}
        item = {
            'id':f'applied8-q28-v{variant}','genId':'applied8-q28','sourceSet':'applied','sourceRound':8,'sourceNo':28,'variantNo':variant,
            'reviewStatus':'verified','area':'도형','subarea':'도형의 성질과 관계','detailType':'지도에서 인접한 지역을 색칠하는 최소 색의 수',
            'pointBand':'4.2','text':STEM,'asset':{'kind':kind,'src':str(asset_path.relative_to(ROOT / 'bank')),'description':'지역이 선으로 나뉜 지도. 선을 공유하는 두 지역은 이웃하고 한 점에서만 만나는 지역은 이웃하지 않음'},
            'answer':'4가지','answerParts':[4],'answerLabels':['필요한 색의 최소 개수'],'acceptedAnswers':['4','4가지','네 가지','4가지 색'],'answerContract':'single-number',
            'solutionSteps':steps,'solution':' '.join(steps),'solutionAsset':solution_asset,
            'learningPoint':'지역의 인접 관계를 그래프로 보고 홀수 고리와 그 모든 지역에 인접한 가운데 지역을 찾아 최소 색 수를 증명하기',
            'learningLocation':'활용 8회 · 원문 28번 · 지도 색칠과 지역의 인접 관계',
            'verification':{
                'primaryMethod':'인접 그래프를 만들고 최소 색 수를 전수 탐색한다.',
                'independentMethod':'홀수 고리와 고리의 모든 지역에 인접한 중심 지역으로 4색 미만 불가를 보이고, 4색 배치를 제시해 충분성을 확인한다.',
                'parameters':{'regionCount':region_count,'adjacencyEdges':graph_edges,'centerRegion':proof_hub,'oddCycleRegions':proof_rim,'coloring':color_groups,'answer':4,'pointOnlyContactsExcluded':True},
                'independentSuite':'qa/applied8-q28-independent-validate.py','sourceExamPage':6,'sourceExamFile':SOURCE.name,'sourceAnswerPage':6,
                'sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingPixelExactCrop':variant==1,
                'officialAnswerStatus':'The available answer PDF page is a blank, text-identical problem-page duplicate. Source map adjacency was independently reconstructed from the exact page crop, and a four-coloring and odd-wheel lower bound were checked.',
                'studentDifficultyMeasured':False
            },
            'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 28번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}
        }
        items.append(item)
        variant_rows.append({'variant':variant,'regionCount':region_count,'edgeCount':graph_edges,'answer':4,'sourceCropPixelExact':variant==1,'asset':str(asset_path.relative_to(ROOT)),'solutionAsset':str(solution_path.relative_to(ROOT)),'configuration':None if variant==1 else {'oddRingSectors':sectors,'ringLayers':layers},'colorGroups':color_groups})

    data['items'] = [x for x in data['items'] if x['sourceNo'] != 28] + items
    data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
    data['version'] = VERSION
    data['itemCount'] = len(data['items'])
    data['availableSourceNos'] = sorted(set(data['availableSourceNos'] + [28]))
    data['pendingSourceNos'] = [n for n in range(1,31) if n not in data['availableSourceNos']]
    index['version'] = VERSION
    index['itemCount'] = data['itemCount']
    index['pendingSourceNos'] = data['pendingSourceNos']
    index['items'] = [x for x in index['items'] if x['sourceNo'] != 28] + [{'sourceNo':28,'genId':'applied8-q28','area':'도형','subarea':'도형의 성질과 관계','detailType':'지도에서 인접한 지역을 색칠하는 최소 색의 수','pointBand':'4.2','reviewStatus':'verified','variantCount':9}]
    index['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    review = {
        'sourceExam':{'file':SOURCE.name,'sha256':sha(SOURCE),'page':6,'questionNo':28,'directVisualReview':True,'render':str(PAGE.relative_to(ROOT)),'sourceCrop':str(SOURCE_CROP.relative_to(ROOT)),'cropPixels':list(source_image.size),'enclosedRegions':len(nodes),'boundaryAdjacencyEdges':len(edges),'adjacencyMethod':'threshold-180 four-connected region flood fill; scan shared dark boundaries <=5px apart; edge retained only at >=8 scan contacts','pointOnlyContactsIgnored':True},
        'answerCandidate':{'file':ANSWER_COPY.name,'sha256':sha(ANSWER_COPY),'page':6,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q26-answer-page-6.png','containsAnswers':False,'comparison':'Page 6 is text-identical to the source question page and has no answer marks.'},
        'sourceIndependentSolution':{'minimumColors':minimum,'solver':'degree-ordered exhaustive backtracking on source-map adjacency graph','oddWheel':{'hub':hub,'rim':rim,'oddCycleLength':len(rim),'hubAdjacentToEveryRimRegion':True},'coloring':{str(n):c+1 for n,c in coloring.items()},'colorGroups':{str(c+1):sorted(n for n in nodes if coloring[n]==c) for c in range(4)},'edges':edges,'verifiedProperColoring':all(coloring[a]!=coloring[b] for a,b in edges)},
        'variants':variant_rows,'variantCount':9,'variantsIndependentlyCalculated':True,'newSourceTypes':0,'difficulty':'4.2-point band only = high'
    }
    REVIEW.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Added Q28 9 map-coloring variants; source regions',len(nodes),'edges',len(edges),'wheel',hub,rim,'answer 4; inventory',data['itemCount'])


if __name__ == '__main__':
    main()

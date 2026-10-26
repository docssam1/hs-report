#!/usr/bin/env python3
"""Independently check Applied 7 Q19 source, layer counts, and nine variants."""
import hashlib
import json
import math
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA = json.loads((ROOT / 'bank/data/applied7-expanded.json').read_text())
INDEX = json.loads((ROOT / 'bank/data/applied7-expanded-index.json').read_text())
REVIEW = json.loads((WORK / 'q19-source-answer-review.json').read_text())
PROOF = json.loads((WORK / 'q19-position-and-count-proof.json').read_text())
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER_CANDIDATE = WORK / 'source-review/applied7-answer-candidate.pdf'
DRIVE_BLANK_ANSWER = WORK / 'source-review/applied7-answer-drive.pdf'
SOURCE_CROP = WORK / 'q01-q08-review/crops/q19-clean-diagram.png'
SOURCE_ASSET = ROOT / 'bank/assets/applied7/q19-fold-hole-original.png'
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
SVG_DIR = WORK / 'q19-render-r30/svg'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def reflect_first(p):
    x, y = p
    return (round(1-y, 2), round(1-x, 2))


def reflect_second(p):
    x, y = p
    return (y, x)


def all_pairwise_distances(points):
    return [math.dist(a, b) for i, a in enumerate(points) for b in points[i+1:]]


assert sha(EXAM) == REVIEW['sourceExam']['sha256']
assert sha(ANSWER_CANDIDATE) == REVIEW['sourceAnswer']['teacherAnnotatedCandidate']['sha256']
assert sha(DRIVE_BLANK_ANSWER) == REVIEW['sourceAnswer']['syncedDriveFile']['sha256']
exam_text = subprocess.check_output([str(PDFTOTEXT), '-f', '4', '-l', '4', '-layout', str(EXAM), '-'], text=True, errors='replace')
exam_compact = ''.join(exam_text.split())
assert '색종이를다음과같이접어서' in exam_compact
assert '완전히펼쳤을때구' in exam_compact and '멍은몇개일까요' in exam_compact
blank_text = subprocess.check_output([str(PDFTOTEXT), '-layout', str(DRIVE_BLANK_ANSWER), '-'], text=True, errors='replace')
assert '19' in blank_text and '답' in blank_text
candidate_page4 = subprocess.check_output([str(PDFTOTEXT), '-f', '4', '-l', '4', '-layout', str(ANSWER_CANDIDATE), '-'], text=True, errors='replace')
assert '색종이를다음과같이접어서' in ''.join(candidate_page4.split())
assert REVIEW['sourceAnswer']['officialKeyStatus'] == 'not available'
assert REVIEW['sourceAnswer']['teacherAnnotatedCandidate']['handwrittenAnswer'] == '10개'

source_pixels = Image.open(SOURCE_ASSET).convert('RGBA')
crop_pixels = Image.open(SOURCE_CROP).convert('RGBA')
assert source_pixels.size == crop_pixels.size and source_pixels.tobytes() == crop_pixels.tobytes()
assert sha(SOURCE_ASSET) == PROOF['sourceDrawingSha256']
assert REVIEW['sourceDrawingAsset']['pixelIdenticalToRecordedSourceCrop'] is True

# Independently expand the recorded punch locations through the two crease reflections.
sq = [(0.10, 0.20), (0.30, 0.50), (0.25, 0.65), (0.10, 0.35)]
circles = [(0.10, 0.55), (0.15, 0.70), (0.20, 0.45), (0.10, 0.80)]
for x, y in sq + circles:
    assert x < y and x + y < 1
items = [x for x in DATA['items'] if x['sourceNo'] == 19]
assert len(items) == 9
checks = []
for v, item in enumerate(items, 1):
    a, b = PROOF['variants'][v-1]['squarePunches'], PROOF['variants'][v-1]['coloredPunches']
    assert (a, b) == [(1,1),(2,1),(3,1),(4,1),(3,2),(4,2),(3,3),(4,3),(3,4)][v-1]
    square_points = [p for seed in sq[:a] for p in (seed, reflect_first(seed))]
    colored_points = []
    for seed in circles[:b]:
        mirror = reflect_second(seed)
        colored_points.extend((seed, mirror, reflect_first(seed), reflect_first(mirror)))
    points = square_points + colored_points
    min_sep = min(all_pairwise_distances(points))
    expected = 2*a + 4*b
    assert len(points) == expected and len(set(points)) == expected
    assert min_sep > 0.10
    assert item['id'] == f'applied7-q19-v{v}' and item['variantNo'] == v
    assert item['text'] == REVIEW['sourceExam']['sourceQuestion']
    assert item['pointBand'] == '3.4' and item['difficultyEvidence']['label'] == '중'
    assert item['answer'] == str(expected) and item['answerParts'] == [expected]
    assert item['answerContract'] == 'single-number'
    assert item['asset']['kind'] == 'raster' and item['asset']['src'].endswith(f'q19-fold-hole-v{v}-r30.png')
    png = ROOT / 'bank' / item['asset']['src']
    image = Image.open(png)
    assert image.format == 'PNG' and image.size == (1320, 490)
    svg = ET.parse(SVG_DIR / f'q19-fold-hole-v{v}-r30.svg').getroot()
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    assert len(svg.findall('.//svg:rect', ns)) == a + 3
    assert len(svg.findall('.//svg:circle', ns)) == b + 1
    assert item['verification']['parameters']['uniqueHoleCount'] == expected
    assert item['verification']['sourceAnswerPage'] is None
    assert item['verification']['sourceDrawingSha256'] == sha(SOURCE_ASSET)
    assert len(item['solutionSteps']) >= 4
    assert item['learningLocation'] and item['learningPoint']
    checks.append({'variant': v, 'squarePunches': a, 'coloredPunches': b,
                   'answer': expected, 'independentCoordinateCount': len(points),
                   'minimumHoleSeparation': min_sep, 'pngBytes': png.stat().st_size,
                   'pngSha256': sha(png)})

assert 19 in DATA['availableSourceNos'] and DATA['pendingSourceNos'] == []
assert len(DATA['items']) == 270 and DATA['itemCount'] == INDEX['itemCount'] == 270
assert DATA['version'] == INDEX['version'] and DATA['version'].endswith('-r32')
assert [x['sourceNo'] for x in INDEX['items']] == DATA['availableSourceNos']
assert REVIEW['newSourceTypesAdded'] == 0 and REVIEW['newVariants'] == 9

result = {'sourceQuestion': 19, 'sourceExamPage': 4,
          'officialAnswerKeyAvailable': False,
          'teacherHandwrittenAnswer': 10,
          'originalAnswerIndependent': {'oneSquarePunchThroughTwoLayers': 2,
                                        'twoColoredPunchesThroughFourLayers': 8,
                                        'total': 10},
          'sourceImageExactCrop': True, 'newSourceTypesAdded': 0,
          'variants': checks, 'dataVersion': DATA['version'],
          'dataSha256': sha(ROOT/'bank/data/applied7-expanded.json'),
          'indexSha256': sha(ROOT/'bank/data/applied7-expanded-index.json'),
          'passed': True}
(WORK / 'q19-independent-math.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS Applied7 Q19: original diagram crop exact; official key absent and marked 10 independently confirmed; 9 existing-type variants passed layer/orbit, uniqueness, PNG, learning-link, and data-index checks; new types 0.')

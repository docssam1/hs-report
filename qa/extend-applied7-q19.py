#!/usr/bin/env python3
"""Add nine independently checked Applied 7 Q19 fold-and-punch variants."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER_CANDIDATE = WORK / 'source-review/applied7-answer-candidate.pdf'
DRIVE_BLANK_ANSWER = WORK / 'source-review/applied7-answer-drive.pdf'
SOURCE_CROP = WORK / 'q01-q08-review/crops/q19-clean-diagram.png'
SOURCE_ASSET = ROOT / 'bank/assets/applied7/q19-fold-hole-original.png'
ITEM_CASES = [(1, 1), (2, 1), (3, 1), (4, 1), (3, 2), (4, 2), (3, 3), (4, 3), (3, 4)]
PROMPT = ('색종이를 다음과 같이 접어서 펀치로 구멍을 뚫고, 또 한 번 접어서 '
          '색칠 펀치로 구멍을 냈습니다. 완전히 펼쳤을 때 구멍은 몇 개일까요?')
VERSION = ('20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-'
           'q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r30')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build_item(variant, square_count, colored_count, source_exam_sha, source_drawing_sha, proof):
    square_holes = square_count * 2
    colored_holes = colored_count * 4
    answer = square_holes + colored_holes
    steps = [
        f'첫 번째로 뚫은 네모 구멍은 {square_count}개이고, 그때 색종이는 두 겹입니다. '
        f'완전히 펼치면 네모 구멍은 {square_count}×2={square_holes}개입니다.',
        f'색칠 펀치로 낸 구멍은 {colored_count}개이고, 두 번 접힌 색종이는 네 겹입니다. '
        f'완전히 펼치면 색칠 펀치 구멍은 {colored_count}×4={colored_holes}개입니다.',
        f'두 종류의 구멍을 합하면 {square_holes}+{colored_holes}={answer}개입니다.',
        f'접힌 위치를 대칭으로 펼쳐 확인해도 구멍이 겹치지 않아 모두 {answer}개입니다.'
    ]
    vector = proof['variants'][variant - 1]
    return {
        'id': f'applied7-q19-v{variant}', 'genId': 'applied7-q19',
        'sourceSet': 'applied', 'sourceRound': 7, 'sourceNo': 19,
        'variantNo': variant, 'reviewStatus': 'verified',
        'area': '도형', 'subarea': '접기와 구멍 세기',
        'detailType': '두 번 접은 색종이의 펀치 구멍 수', 'pointBand': '3.4',
        'text': PROMPT, 'answer': str(answer), 'answerParts': [answer],
        'answerLabels': ['구멍'], 'acceptedAnswers': [str(answer), f'{answer}개'],
        'answerContract': 'single-number', 'solutionSteps': steps,
        'solution': ' '.join(steps),
        'learningPoint': '접은 횟수마다 겹친 종이 수를 구분하고, 접힌 위치가 겹치는지 살핀다.',
        'learningLocation': '활용 7회 · 원문 19번 · 색종이 접기와 펀치 구멍 수',
        'asset': {
            'kind': 'raster', 'src': f'assets/applied7/q19-fold-hole-v{variant}-r30.png',
            'description': f'활용 7회 19번 유사문제 {variant}의 색종이 접기와 펀치 구멍 그림',
            'width': 1320, 'height': 490, 'mimeType': 'image/png'
        },
        'verification': {
            'primaryMethod': '첫 번째 펀치는 두 겹을 지나 구멍 2개를 만들고, 두 번째 펀치는 네 겹을 지나 구멍 4개를 만든다.',
            'independentMethod': '각 펀치 좌표를 접는 선에 대해 대칭 이동해 원래 색종이의 위치 집합을 만들고, 중복이 없는 점의 수를 센다.',
            'parameters': {
                'squarePunches': square_count, 'coloredPunches': colored_count,
                'layersAtSquarePunch': 2, 'layersAtColoredPunch': 4,
                'squareHoleCount': square_holes, 'coloredHoleCount': colored_holes,
                'uniqueHoleCount': answer,
                'coordinateOrbitMinimumSeparation': vector['minimumSeparation']
            },
            'independentSuite': 'qa/applied7-q19-independent-validate.py',
            'sourceExamPage': 4, 'sourceExamFile': EXAM.name,
            'sourceExamSha256': source_exam_sha,
            'sourceAnswerPage': None,
            'sourceDrawingCompared': True, 'sourceDrawingPresent': True,
            'sourceDrawingAsset': 'q19-fold-hole-original.png',
            'sourceDrawingSha256': source_drawing_sha,
            'variantUsesSourceDrawing': False,
            'officialAnswerKeyStatus': 'unavailable; Drive answer file is a blank scoring sheet',
            'studentDifficultyMeasured': False
        },
        'difficultyEvidence': {
            'basis': 'source-point-band', 'label': '중',
            'sourceReasoningPreserved': True, 'measuredVariantRate': None,
            'estimated': False,
            'rationale': '활용 7회 원문 19번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'
        }
    }


def main():
    for p in [EXAM, ANSWER_CANDIDATE, DRIVE_BLANK_ANSWER, SOURCE_CROP, SOURCE_ASSET]:
        assert p.is_file(), f'missing source evidence: {p}'
    source_pixels = Image.open(SOURCE_ASSET).convert('RGBA')
    crop_pixels = Image.open(SOURCE_CROP).convert('RGBA')
    assert source_pixels.size == crop_pixels.size and source_pixels.tobytes() == crop_pixels.tobytes(), 'source diagram asset is not the exact recorded crop'
    exam_sha, candidate_sha, blank_sha = sha(EXAM), sha(ANSWER_CANDIDATE), sha(DRIVE_BLANK_ANSWER)
    source_drawing_sha = sha(SOURCE_ASSET)
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    assert data['sourceRound'] == 7 and 19 not in data['availableSourceNos']
    assert not [x for x in data['items'] if x['sourceNo'] == 19]

    # Independent set calculation, kept separate from the SVG rendering code.
    square_coords = [(0.10, 0.20), (0.30, 0.50), (0.25, 0.65), (0.10, 0.35)]
    colored_coords = [(0.10, 0.55), (0.15, 0.70), (0.20, 0.45), (0.10, 0.80)]
    def first_fold(p):
        x, y = p
        return (1 - y, 1 - x)
    def second_fold(p):
        x, y = p
        return (y, x)
    def square_orbit(p):
        return [p, first_fold(p)]
    def colored_orbit(p):
        q = second_fold(p)
        return [p, q, first_fold(p), first_fold(q)]
    orbit_records = []
    for a, b in ITEM_CASES:
        points = [q for p in square_coords[:a] for q in square_orbit(p)]
        points += [q for p in colored_coords[:b] for q in colored_orbit(p)]
        distances = [((x1-x2)**2 + (y1-y2)**2)**0.5
                     for i, (x1, y1) in enumerate(points) for x2, y2 in points[i+1:]]
        minimum = min(distances)
        answer = 2*a + 4*b
        assert len(points) == answer and len(set(points)) == answer and minimum > 0.10
        orbit_records.append({'squarePunches': a, 'coloredPunches': b,
                              'squareHoleCount': 2*a, 'coloredHoleCount': 4*b,
                              'uniqueHoleCount': answer, 'unfoldedPositions': points,
                              'minimumSeparation': minimum})

    proof = {'sourceVariant': {'squarePunches': 1, 'coloredPunches': 2,
                               'squareHoleCount': 2, 'coloredHoleCount': 8,
                               'answer': 10, 'basis': 'teacher handwritten note plus independent layer count'},
             'sourceDrawingSha256': source_drawing_sha,
             'officialAnswerKey': {'driveBlankSheetSha256': blank_sha,
                                   'candidatePageSha256': candidate_sha,
                                   'status': 'No printed official answer key was available; the synced Drive PDF is a blank scoring sheet.'},
             'foldModel': 'square punch stays in the covered stationary half and passes through two layers; colored punch is made after the second fold through four layers',
             'variants': orbit_records}
    new_items = [build_item(v, a, b, exam_sha, source_drawing_sha,
                            {'variants': orbit_records})
                 for v, (a, b) in enumerate(ITEM_CASES, 1)]
    for item, record in zip(new_items, orbit_records):
        assert item['answer'] == str(record['uniqueHoleCount'])

    review = {
        'sourceExam': {'name': EXAM.name, 'sha256': exam_sha, 'questionPage': 4,
                       'questionNumber': 19, 'sourceQuestion': PROMPT,
                       'figurePresent': True, 'directPageAndDiagramInspected': True},
        'sourceAnswer': {'officialKeyStatus': 'not available',
                         'teacherAnnotatedCandidate': {'name': ANSWER_CANDIDATE.name,
                                                        'sha256': candidate_sha,
                                                        'page': 4, 'handwrittenAnswer': '10개'},
                         'syncedDriveFile': {'name': DRIVE_BLANK_ANSWER.name,
                                             'sha256': blank_sha,
                                             'pageCount': 1,
                                             'content': 'blank student scoring sheet; no official answer key'}},
        'sourceDrawingAsset': {'path': str(SOURCE_ASSET.relative_to(ROOT)),
                               'sha256': source_drawing_sha,
                               'pixelIdenticalToRecordedSourceCrop': True},
        'sourceAndAnswerStatus': 'Official key unavailable; the teacher handwritten 10 agrees with the independent layer and coordinate count.',
        'originalIndependentCheck': {'squarePunches': 1, 'coloredPunches': 2,
                                     'squareLayers': 2, 'coloredLayers': 4,
                                     'squareHoles': 2, 'coloredHoles': 8, 'answer': 10},
        'newSourceTypesAdded': 0, 'newVariants': 9, 'allVariantsSameSourceType': True,
        'variantCoordinateProof': proof, 'variants': orbit_records,
        'dataVersion': VERSION
    }
    (WORK / 'q19-source-answer-review.json').write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')
    (WORK / 'q19-position-and-count-proof.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
    data['items'].extend(new_items)
    data['items'].sort(key=lambda x: (x['sourceNo'], x['variantNo']))
    data['availableSourceNos'] = sorted(data['availableSourceNos'] + [19])
    data['pendingSourceNos'] = [n for n in range(1, 31) if n not in data['availableSourceNos']]
    data['itemCount'] = len(data['items'])
    data['version'] = VERSION
    index['version'] = VERSION
    index['itemCount'] = data['itemCount']
    index['pendingSourceNos'] = data['pendingSourceNos']
    index['items'].append({'sourceNo': 19, 'genId': 'applied7-q19', 'area': '도형',
                           'subarea': '접기와 구멍 세기',
                           'detailType': '두 번 접은 색종이의 펀치 구멍 수',
                           'pointBand': '3.4', 'reviewStatus': 'verified', 'variantCount': 9})
    index['items'].sort(key=lambda x: x['sourceNo'])
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    print(f'Built Applied7 Q19: {len(new_items)} new variants, answers {[int(x["answer"]) for x in new_items]}, new source types 0.')


if __name__ == '__main__':
    main()

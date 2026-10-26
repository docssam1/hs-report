"""Build nine matchstick-boat mirror variants for Applied 1 Q17."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 1회.pdf'
ANSWER = ROOT / '.private-work/balanced15-20261024/source/applied1-answer.pdf'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest() == '6123edccb7f64dc664d57dd29004483e3d27c49665892da39bbf2c032b243924'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == '1e8a14128840dededcdf69a8951dac4c2cd6373483c67f34ebf15cfca6944c54'
DATA_PATH = ROOT / 'bank/data/applied1-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied1-expanded-index.json'


def segment(a, b):
    return tuple(sorted((tuple(a), tuple(b))))


def boat(n, bottom):
    # Integer coordinates encode match identity, not the drawing scale.
    m = n
    edges = {segment((2*i, 0), (2*i+2, 0)) for i in range(n)}
    edges |= {segment((2*i, 0), (2*i, 2)) for i in range(n+1)}
    edges |= {segment((2*i, 2), (2*i+2, 2)) for i in bottom}
    edges |= {segment((m, 0), (m, -2)), segment((m, -2), (m, -4)),
              segment((m, -4), (m+2, -3)), segment((m, -2), (m+2, -3))}
    edges.add(segment((2*n, 1), (2*n+2, 1)))
    return edges


def reflection(edges, n):
    return {segment((2*n-a[0], a[1]), (2*n-b[0], b[1])) for a,b in edges}


def shifted(edges, dx, dy):
    return {segment((a[0]+dx,a[1]+dy),(b[0]+dx,b[1]+dy)) for a,b in edges}


def bottom_mismatches(n, bottom):
    return sum((i in bottom) != ((n-1-i) in bottom) for i in range(n//2))


def count_moves(n, bottom):
    expected = 3 + bottom_mismatches(n, bottom)
    source = boat(n, bottom)
    mirror = reflection(source, n)
    assert len(source) - len(source & mirror) == expected
    # A freely shifted reflected shape cannot save further moves.
    max_overlap = max(len(source & shifted(mirror, dx, dy))
                      for dx in range(-2*n-4, 2*n+5)
                      for dy in range(-8, 9))
    assert len(source) - max_overlap == expected
    return expected


SOURCE_N, SOURCE_BOTTOM = 4, frozenset((0,1,3))
assert count_moves(SOURCE_N, SOURCE_BOTTOM) == 4

CASES = [
    (4, (0,3)),
    (4, (0,2,3)),
    (4, (0,1,2)),
    (4, (0,1)),
    (6, (0,1,2,3,5)),
    (6, (0,1,3,5)),
    (6, (0,2,4,5)),
    (6, (0,1,2)),
    (8, (0,1,3,4,6,7)),
]
assert len(CASES) == len(set(CASES)) == 9
assert (SOURCE_N, tuple(sorted(SOURCE_BOTTOM))) not in CASES


def draw(n, bottom, path):
    cell, pad, top = 44, 22, 119
    width, height = pad*2+n*cell+52, 198
    x0 = pad
    mast = x0 + (n//2)*cell
    ybottom = top+cell
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
             f'<rect width="{width}" height="{height}" fill="white"/>']

    def stick(x1,y1,x2,y2):
        parts.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="#191511" stroke-width="3.6" stroke-linecap="round"/>')
    for i in range(n):stick(x0+i*cell,top,x0+(i+1)*cell,top)
    for i in range(n+1):stick(x0+i*cell,top,x0+i*cell,ybottom)
    for i in bottom:stick(x0+i*cell,ybottom,x0+(i+1)*cell,ybottom)
    stick(mast,top,mast,top-cell)
    stick(mast,top-cell,mast,top-2*cell)
    # The two slanted sticks and the mast side form an equilateral sail.
    tipx = mast + .8660254038*cell
    tipy = top - 1.5*cell
    stick(mast,top-2*cell,tipx,tipy)
    stick(mast,top-cell,tipx,tipy)
    stick(x0+n*cell+8,top+cell/2,x0+n*cell+8+cell,top+cell/2)
    parts.append('</svg>')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(parts)+'\n')


def build():
    data = json.loads(DATA_PATH.read_text())
    index = json.loads(INDEX_PATH.read_text())
    assert data['version'] == index['version']
    assert 17 in data['pendingSourceNos'] or all(x['id'].startswith('applied1-q17-v')
                                                for x in data['items'] if x['sourceNo']==17)
    data['items'] = [x for x in data['items'] if x['sourceNo'] != 17]
    index['items'] = [x for x in index['items'] if x['sourceNo'] != 17]
    items = []
    for variant, (n, raw_bottom) in enumerate(CASES,1):
        bottom = frozenset(raw_bottom)
        count = count_moves(n,bottom)
        pairs = []
        for i in range(n//2):
            j=n-1-i
            if (i in bottom) != (j in bottom):
                pairs.append(f'{i+1}번째와 {j+1}번째')
        mismatch = len(pairs)
        src=f'assets/applied1/q17-v{variant}.svg'
        draw(n,bottom,ROOT/'bank'/src)
        steps=[
            f'배의 윗부분과 세로 성냥개비, 돛대는 좌우로 뒤집어도 같은 자리에 남습니다. 배의 밑부분은 왼쪽부터 {n}자리입니다.',
            f'오른쪽 돛을 만드는 기울어진 성냥개비 2개를 왼쪽으로, 배 오른쪽 끝의 성냥개비 1개를 왼쪽 끝으로 옮겨야 합니다.',
            (f'밑부분에서 {"·".join(pairs)} 자리는 서로 한쪽만 있으므로 각각 1개씩, 모두 {mismatch}개를 옮깁니다.'
             if pairs else '밑부분의 성냥개비는 좌우 대칭이어서 옮길 것이 없습니다.'),
            f'따라서 필요한 최소 이동 수는 2+1+{mismatch}={count}개입니다.',
        ]
        items.append({
            'id':f'applied1-q17-v{variant}','genId':'applied1-q17','sourceSet':'applied','sourceRound':1,
            'sourceNo':17,'variantNo':variant,'reviewStatus':'verified','area':'도형',
            'subarea':'성냥개비와 대칭','detailType':'배 모양을 좌우로 뒤집는 최소 성냥개비 이동',
            'pointBand':'3.4',
            'text':'성냥개비로 그림과 같은 배를 만들었습니다. 이 배를 오른쪽으로 뒤집어 같은 모양으로 만들려면 성냥개비를 적어도 몇 개 옮겨야 하나요? 성냥개비의 방향은 생각하지 않습니다.',
            'answer':str(count),'answerContract':'ordered-parts','answerParts':[count],
            'answerLabels':['옮길 성냥개비 수'],'acceptedAnswers':[str(count)],
            'solutionSteps':steps,'solution':' '.join(steps),
            'learningPoint':'좌우를 뒤집었을 때 그대로 남는 성냥개비와 자리만 바뀌는 성냥개비 구분하기',
            'learningLocation':'활용 1회 · 원문 17번 · 성냥개비 배의 좌우 대칭',
            'verification':{
                'primaryMethod':'돛 2개·끝 막대 1개와 밑부분의 비대칭 좌우 쌍 계산',
                'independentMethod':'원본·반사된 성냥개비 집합을 만들고 모든 평행이동에서 최대 겹침 전수 열거',
                'parameters':{'hullCells':n,'bottomIndicesZeroBased':sorted(bottom),
                              'bottomAsymmetryPairs':mismatch,'answer':count},
                'sourceExamPage':3,'sourceAnswerPage':17,
                'sourceTextDirectlyReviewed':True,'sourceFigureDirectlyReviewed':True,
                'sourceAnswerCandidate':4,'independentSourceAnswer':4,
                'sourceAnswerCandidateOfficiality':'unverified',
                'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
                'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
                'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
                'independentCountAgrees':True,
            },
            'difficultyEvidence':{'basis':'source-point-band','label':'중',
                                  'sourceReasoningPreserved':True,'measuredVariantRate':None},
            'asset':{'kind':'svg','src':src,'description':'좌우로 뒤집을 성냥개비 배'},
        })
    data['items'].extend(items)
    data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
    data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{17})
    data['pendingSourceNos']=[x for x in data['pendingSourceNos'] if x!=17]
    data.setdefault('pendingReasons',{}).pop('17',None)
    data['version']='20261026-applied1-q17-confirmed-r1'
    data['itemCount']=len(data['items'])
    data.setdefault('sourceEditionNotes',{})['17']='현행 원문 p.3 배 그림은 밑부분 좌우 비대칭 1개·돛 2개·끝 막대 1개라 최소 4개 이동. 답안 후보 p.17의 4개와 일치하지만 공식 판본 동일성은 미확정. 원본 그림은 보존하고 새 그림 9개와 반사·평행이동 전수검산을 적용.'
    data['reviewSummary']['independentMathCount']=len(data['items'])
    data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
    data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')})
    data['reviewSummary']['outputReviewed']=False
    index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=data['pendingSourceNos']
    index['items'].append({'sourceNo':17,'genId':'applied1-q17','area':'도형',
                           'subarea':'성냥개비와 대칭','detailType':'배 모양을 좌우로 뒤집는 최소 성냥개비 이동',
                           'pointBand':'3.4','reviewStatus':'verified','variantCount':9})
    index['items'].sort(key=lambda x:x['sourceNo'])
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    print('Built Applied1 Q17:',[x['answerParts'][0] for x in items])


if __name__=='__main__':build()

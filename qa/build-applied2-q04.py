"""Build nine projection-based cube-stacking variants for Applied 2 Q04."""
import hashlib
import itertools
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'
ANSWER = ROOT / '.private-work/hw-expansion-20261023/hw2/source-review-q04/answer.pdf'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest() == '1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == '074180c770e7e76d77dca35410f14246a5eaa373feba8061d3f390c320b5ffdc'

DATA_PATH = ROOT / 'bank/data/applied2-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied2-expanded-index.json'
data = json.loads(DATA_PATH.read_text())
index = json.loads(INDEX_PATH.read_text())
assert data['version'] == index['version']
assert 4 in data['pendingSourceNos'] or data['version'] == '20261026-applied2-q04-confirmed-r1'
data['items'] = [x for x in data['items'] if x['sourceNo'] != 4]
index['items'] = [x for x in index['items'] if x['sourceNo'] != 4]

# Seven occupied top-view cells exactly match the source diagram.
CELLS = [(0,0),(0,1),(1,0),(1,1),(2,0),(2,1),(2,2)]
HEIGHTS = range(1,4)

def projections(values):
    h = dict(zip(CELLS, values))
    front = tuple(max(h[r,c] for r,c in CELLS if c == col) for col in range(3))
    top_rows = tuple(max(h[r,c] for r,c in CELLS if r == row) for row in range(3))
    # The right-side view reverses the top view's depth direction, as on the source.
    side_drawing = tuple(reversed(top_rows))
    return front, top_rows, side_drawing

def enumerate_models(front_target, row_target):
    models=[]
    for values in itertools.product(HEIGHTS, repeat=len(CELLS)):
        front, rows, _ = projections(values)
        if front == front_target and rows == row_target:
            models.append(values)
    return models

def count_independent(front_target, row_target):
    # Factor the count by top-view rows, then join on the front-view maxima.
    row_cells=[[(0,0),(0,1)],[(1,0),(1,1)],[(2,0),(2,1),(2,2)]]
    choices=[]
    for row,coords in enumerate(row_cells):
        rows=[]
        for values in itertools.product(HEIGHTS,repeat=len(coords)):
            if max(values)==row_target[row]: rows.append(dict(zip(coords,values)))
        choices.append(rows)
    total=0
    for a in choices[0]:
        for b in choices[1]:
            for c in choices[2]:
                joined={**a,**b,**c}
                observed=tuple(max(joined[r,col] for r,col in CELLS if col==j) for j in range(3))
                total += observed==front_target
    return total

source_front=(2,2,3)
source_rows=(2,1,3)
source_models=enumerate_models(source_front,source_rows)
assert len(source_models)==count_independent(source_front,source_rows)==8

targets=[
    ((3,3,1),(1,2,3)),
    ((3,3,2),(1,3,2)),
    ((2,3,1),(1,2,3)),
    ((2,3,2),(1,3,2)),
    ((2,2,1),(1,2,2)),
    ((2,2,2),(1,2,2)),
    ((2,3,3),(1,3,3)),
    ((2,3,1),(2,3,3)),
    ((3,3,2),(2,3,2)),
]
assert len(set(targets)) == 9

def add_cell(svg,x,y,size):
    svg.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="white" stroke="#202020" stroke-width="1.6"/>')

def make_figure(front,row_target,path):
    size=25;svg=['<svg xmlns="http://www.w3.org/2000/svg" width="540" height="180" viewBox="0 0 540 180">','<rect width="100%" height="100%" fill="white"/>']
    # Top projection; the empty corner at the lower-right is the source footprint.
    x0,y0=18,25
    for r,c in CELLS: add_cell(svg,x0+c*size,y0+r*size,size)
    # Front projection, left-to-right column maxima.
    x0,ybase=205,100
    for c,h in enumerate(front):
        for k in range(h): add_cell(svg,x0+c*size,ybase-(k+1)*size,size)
    # Right-side projection; the visual order is front-to-back (reverse depth).
    x0=335
    side=tuple(reversed(row_target))
    for c,h in enumerate(side):
        for k in range(h): add_cell(svg,x0+c*size,ybase-(k+1)*size,size)
    svg += [
        '<text x="43" y="145" text-anchor="middle" font-family="serif" font-size="17">위</text>',
        '<text x="243" y="145" text-anchor="middle" font-family="serif" font-size="17">앞</text>',
        '<text x="373" y="145" text-anchor="middle" font-family="serif" font-size="17">옆</text>',
        '</svg>',
    ]
    path.write_text('\n'.join(svg)+'\n')

items=[]
for variant,(front,row_target) in enumerate(targets,1):
    models=enumerate_models(front,row_target)
    independent=count_independent(front,row_target)
    assert len(models)==independent and independent>0
    answer=len(models)
    src=f'assets/applied2/q04-v{variant}.svg'
    make_figure(front,row_target,ROOT/'bank'/src)
    steps=[
        '위에서 본 그림에는 쌓기나무가 놓인 칸이 7개이므로, 각 칸의 높이를 1층·2층·3층 중 하나로 정합니다.',
        f'앞에서 본 그림의 세 열의 최고 높이는 {", ".join(map(str,front))}이고, 옆에서 본 그림은 깊이 방향을 반대로 읽어 높이가 {", ".join(map(str,reversed(row_target)))}가 되도록 합니다.',
        f'각 높이 배열을 위 두 투영 조건에 맞춰 전수 확인합니다. 행별로 가능한 높이 조합을 만든 뒤 앞모양의 열별 최고 높이 조건까지 맞는 배열은 {answer}개입니다.',
        f'따라서 쌓는 방법은 모두 {answer}가지입니다.',
    ]
    items.append({
        'id':f'applied2-q04-v{variant}','genId':'applied2-q04','sourceSet':'applied','sourceRound':2,
        'sourceNo':4,'variantNo':variant,'reviewStatus':'verified','area':'도형','subarea':'쌓기나무와 투영',
        'detailType':'위·앞·옆에서 본 모양을 만족하는 쌓기나무 배열 수','pointBand':'2.7',
        'text':'쌓기나무로 만든 모양을 위, 앞, 옆에서 본 그림입니다. 이 세 모양이 모두 되도록 쌓는 방법은 몇 가지인가요?',
        'answer':str(answer),'answerContract':'ordered-parts','answerParts':[answer],
        'answerLabels':['쌓는 방법의 수'],'acceptedAnswers':[str(answer)],
        'solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'각 칸의 높이를 정하고 앞·옆 투영의 열별 최고 높이를 함께 만족시키기',
        'learningLocation':'활용 2회 · 원문 4번 · 쌓기나무와 투영',
        'verification':{
            'primaryMethod':'7칸의 높이 1~3 전체 3^7 배열 전수열거',
            'independentMethod':'행별 높이조합을 분리해 생성하고 앞 투영의 열별 최대값 조건으로 결합',
            'parameters':{'footprint':[[1,1,0],[1,1,0],[1,1,1]],'frontMax':list(front),'topDepthMax':list(row_target),'heightRange':[1,3],'answer':answer},
            'sourceExamPage':1,'sourceAnswerPage':1,'sourceTextDirectlyReviewed':True,'sourceFigureDirectlyReviewed':True,
            'sourceAnswerCandidate':8,'independentSourceAnswer':8,'sourceAnswerCandidateOfficiality':'unverified',
            'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,'enumeratedModelCount':len(models),
            'independentCountAgrees':len(models)==independent,
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None},
        'asset':{'kind':'svg','src':src,'description':'위·앞·옆 세 방향 투영도'},
    })

data['items'].extend(items)
data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{4})
data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=4]
data['version']='20261026-applied2-q04-confirmed-r1'
data['itemCount']=len(data['items'])
data['sourceEditionNotes']['4']='현행 원문 p.1 위·앞·오른쪽 옆 투영 그림을 직접 확인. 7칸 높이 1~3을 3^7 전수계산해 8, 행별 분해 계산도 8. 답안 후보 p.1 필기 8과 일치하나 시험 PDF 메타데이터와 답안 제목이 달라 공식 판본 동일성은 미확인. 원문 그림 보존, 변형용 새 투영도 9개.'
data['reviewSummary']['independentMathCount']=len(data['items'])
data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')})
data['reviewSummary']['outputReviewed']=False
index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=data['pendingSourceNos']
index['items'].append({'sourceNo':4,'genId':'applied2-q04','area':'도형','subarea':'쌓기나무와 투영',
    'detailType':'위·앞·옆에서 본 모양을 만족하는 쌓기나무 배열 수','pointBand':'2.7','reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied2 Q04: nine verified projection variants; answers', [x['answerParts'][0] for x in items])

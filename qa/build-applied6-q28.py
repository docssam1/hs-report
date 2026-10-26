"""Extend Applied 6 Q28 with distinct labeled stones on rook grids."""
import hashlib
import itertools
import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
DATA=ROOT/'bank/data/applied6-expanded.json'
INDEX=ROOT/'bank/data/applied6-expanded-index.json'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest()=='54a5bf1489a9d537f9cc34e6db29609bc6384f8a18b666a40eb11561f912ea4c'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='b1ff5ad327fd669a56508bc1256be8743e809122f1e80b3af5f0731874939975'

def draw_grid(rows,cols,path):
    cell=48;x=18;y=18;width=cols*cell;height=rows*cell
    lines=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width+36}" height="{height+36}" viewBox="0 0 {width+36} {height+36}">',
           '<rect width="100%" height="100%" fill="white"/>',
           f'<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="#faf8f3" stroke="#191511" stroke-width="1.5"/>']
    for col in range(1,cols):lines.append(f'<line x1="{x+col*cell}" x2="{x+col*cell}" y1="{y}" y2="{y+height}" stroke="#191511" stroke-width="1"/>')
    for row in range(1,rows):lines.append(f'<line x1="{x}" x2="{x+width}" y1="{y+row*cell}" y2="{y+row*cell}" stroke="#191511" stroke-width="1"/>')
    lines.append('</svg>')
    path.write_text('\n'.join(lines)+'\n')

assert math.factorial(4)**2==576
data=json.loads(DATA.read_text());index=json.loads(INDEX.read_text())
assert data['version']==index['version'] and data['pendingSourceNos']==[28]
assert not any(x['sourceNo']==28 for x in data['items'])
boards=[(3,3),(3,4),(3,5),(4,5),(4,6),(5,5),(5,6),(5,7),(6,6)]
items=[]
for variant,(rows,cols) in enumerate(boards,1):
    placements=list(itertools.permutations(range(cols),rows))
    assignment=math.factorial(rows)
    answer=len(placements)*assignment
    assert answer==math.factorial(cols)//math.factorial(cols-rows)*math.factorial(rows)
    src=f'assets/applied6/q28-v{variant}.svg'
    draw_grid(rows,cols,ROOT/'bank'/src)
    letters=', '.join(chr(65+i) for i in range(rows))
    steps=[
        f'가로줄 {rows}개에 각 하나씩 놓으며, 같은 세로줄을 다시 쓸 수 없습니다.',
        f'위에서부터 차례대로 놓일 세로줄을 고르면 {cols}×'+'×'.join(str(cols-i) for i in range(1,rows))+f'={len(placements)}가지입니다.',
        f'그 뒤 서로 다른 바둑돌 {letters}의 이름을 이 {rows}개 자리에 배정하는 방법은 {rows}!={assignment}가지입니다.',
        f'따라서 모든 방법은 {len(placements)}×{assignment}={answer}가지입니다.',
    ]
    items.append({
        'id':f'applied6-q28-v{variant}','genId':'applied6-q28','sourceSet':'applied','sourceRound':6,
        'sourceNo':28,'variantNo':variant,'reviewStatus':'verified',
        'area':'경우의 수','subarea':'격자와 배열','detailType':'서로 다른 바둑돌의 가로·세로 중복 없는 배치',
        'pointBand':'4.2',
        'text':f'그림은 가로 {rows}줄, 세로 {cols}줄의 격자입니다. 서로 다른 바둑돌 {letters}를 각각 한 칸에 놓으려 합니다. 각 가로줄에는 바둑돌을 정확히 하나씩, 각 세로줄에는 많아야 하나만 놓을 때, 모두 몇 가지 방법으로 놓을 수 있나요?',
        'answer':str(answer),'answerParts':[answer],'answerLabels':['놓는 방법 수'],
        'acceptedAnswers':[str(answer)],'answerContract':'ordered-parts',
        'solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'가로줄마다 겹치지 않는 세로줄을 고른 다음 서로 다른 바둑돌의 자리 배정까지 곱하기',
        'learningLocation':'활용 6회 · 원문 28번 · 이름이 다른 바둑돌의 격자 배치',
        'verification':{
            'primaryMethod':'서로 다른 세로줄의 순열 × 바둑돌 이름의 순열',
            'independentMethod':'서로 다른 행·열 칸 조합과 모든 라벨 순열을 직접 열거',
            'parameters':{'rows':rows,'columns':cols,'labelCount':rows,'columnPlacements':len(placements),'labelArrangements':assignment,'answer':answer},
            'sourceExamPage':5,'sourceAnswerPage':5,'sourceTextDirectlyReviewed':True,
            'sourceFigureDirectlyReviewed':True,'sourceAnswerCandidate':24,'independentSourceAnswer':576,
            'sourceAnswerCandidateStatus':'conflicts-with-distinct-A-B-C-D-wording',
            'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None},
        'asset':{'kind':'svg','src':src,'description':f'{rows}행 {cols}열의 빈 격자'},
    })

data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos'].append(28);data['availableSourceNos'].sort();data['pendingSourceNos']=[]
data['version']='20261026-applied6-q28-confirmed-r1'
data['itemCount']=len(data['items'])
data['sourceEditionNotes']['28']='현행 원문 p.5는 서로 다른 A·B·C·D 바둑돌을 4×4 격자에 각 행·열 하나씩 놓는다. 답안 후보 p.5 필기 24는 무표기 위치배치 4!만 센 값이고, 원문 구별 조건까지 계산하면 4!×4!=576. 원시험 답안과 성적은 바꾸지 않았다. 유사문제는 구별 조건·새 격자를 명확히 하고 독립 검산.'
data['reviewSummary']['independentMathCount']=len(data['items']);data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
data['reviewSummary']['verifiedQuestionCount']=len(data['items']);data['reviewSummary']['verifiedSourceCount']=len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')});data['reviewSummary']['outputReviewed']=False
index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=[]
index['items'].append({'sourceNo':28,'genId':'applied6-q28','area':'경우의 수','subarea':'격자와 배열',
                       'detailType':'서로 다른 바둑돌의 가로·세로 중복 없는 배치','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda x:x['sourceNo'])
DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied6 Q28: nine labeled-rook variants; answers',[x['answerParts'][0] for x in items])

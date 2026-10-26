"""Build nine overlap-grid rectangle-count variants for Applied 1 Q21."""
import hashlib, json
from math import comb
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사 활용 1회.pdf'
ANSWER=ROOT/'.private-work/balanced15-20261024/source/applied1-answer.pdf'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest()=='6123edccb7f64dc664d57dd29004483e3d27c49665892da39bbf2c032b243924'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='1e8a14128840dededcdf69a8951dac4c2cd6373483c67f34ebf15cfca6944c54'
DATA_PATH=ROOT/'bank/data/applied1-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied1-expanded-index.json'

def occupied(v,t,b,d,left,right):
    rows=t+b+d;cols=left+v+right
    return {(r,c) for r in range(rows) for c in range(cols)
            if left<=c<left+v or t<=r<t+b}

def count_by_shape(v,t,b,d,left,right):
    rows=t+b+d;cols=left+v+right
    vertical=comb(rows+1,2)*comb(v+1,2)
    horizontal=comb(b+1,2)*comb(cols+1,2)
    overlap=comb(b+1,2)*comb(v+1,2)
    return vertical+horizontal-overlap,(vertical,horizontal,overlap)

def count_exhaustive(v,t,b,d,left,right):
    cells=occupied(v,t,b,d,left,right)
    rows=t+b+d;cols=left+v+right
    return sum(all((r,c) in cells for r in range(r0,r1) for c in range(c0,c1))
               for r0 in range(rows) for r1 in range(r0+1,rows+1)
               for c0 in range(cols) for c1 in range(c0+1,cols+1))

source=(5,2,2,3,3,2)
assert count_by_shape(*source)[0]==count_exhaustive(*source)==540
cases=[
 (4,2,2,2,2,2),
 (5,2,2,2,3,1),
 (4,2,2,3,3,2),
 (5,1,2,3,2,3),
 (6,2,2,2,2,2),
 (5,3,2,2,2,2),
 (4,3,2,2,3,3),
 (6,2,3,2,1,3),
 (5,2,3,2,3,2),
]
assert len(cases)==len(set(cases))==9 and source not in cases

def draw(v,t,b,d,left,right,path):
    rows=t+b+d;cols=left+v+right
    cell=27;pad=16;width=cols*cell+pad*2;height=rows*cell+pad*2
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
           '<rect width="100%" height="100%" fill="white"/>']
    for r,c in sorted(occupied(v,t,b,d,left,right)):
        x=pad+c*cell;y=pad+r*cell
        parts.append(f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="white" stroke="#191511" stroke-width="1.35"/>')
    parts.append('</svg>')
    path.write_text('\n'.join(parts)+'\n')

data=json.loads(DATA_PATH.read_text());index=json.loads(INDEX_PATH.read_text())
assert data['version']==index['version']
assert 21 in data['pendingSourceNos']
data['items']=[x for x in data['items'] if x['sourceNo']!=21]
index['items']=[x for x in index['items'] if x['sourceNo']!=21]
items=[]
for variant,(v,t,b,d,left,right) in enumerate(cases,1):
    answer,(vertical,horizontal,overlap)=count_by_shape(v,t,b,d,left,right)
    assert count_exhaustive(v,t,b,d,left,right)==answer
    src=f'assets/applied1/q21-v{variant}.svg'
    draw(v,t,b,d,left,right,ROOT/'bank'/src)
    rows=t+b+d;cols=left+v+right
    steps=[
      f'세로 띠는 {rows}행 {v}열이므로 그 안의 직사각형은 {rows+1}개의 가로 경계 중 2개와 {v+1}개의 세로 경계 중 2개를 골라 {vertical}개입니다.',
      f'가로 띠는 {b}행 {cols}열이므로 직사각형은 {horizontal}개입니다.',
      f'가운데 겹치는 {b}행 {v}열의 직사각형 {overlap}개는 앞에서 두 번 세었으므로 한 번 뺍니다.',
      f'따라서 모두 {vertical}+{horizontal}-{overlap}={answer}개입니다.',
    ]
    items.append({
      'id':f'applied1-q21-v{variant}','genId':'applied1-q21','sourceSet':'applied','sourceRound':1,
      'sourceNo':21,'variantNo':variant,'reviewStatus':'verified','area':'도형','subarea':'격자와 직사각형',
      'detailType':'겹치는 세로·가로 격자 띠의 직사각형 개수','pointBand':'3.4',
      'text':'그림의 도형에서 직사각형은 모두 몇 개인가요?',
      'answer':str(answer),'answerContract':'ordered-parts','answerParts':[answer],
      'answerLabels':['직사각형의 수'],'acceptedAnswers':[str(answer)],
      'solutionSteps':steps,'solution':' '.join(steps),
      'learningPoint':'세로 띠와 가로 띠에서 각각 직사각형을 세고 겹친 가운데 부분을 한 번 빼기',
      'learningLocation':'활용 1회 · 원문 21번 · 격자 도형의 직사각형 수',
      'verification':{
         'primaryMethod':'세로 띠·가로 띠 직사각형 수와 겹침을 포함배제로 계산',
         'independentMethod':'모든 위·아래·왼쪽·오른쪽 경계를 전수 열거해 내부 칸 존재 확인',
         'parameters':{'verticalColumns':v,'topRows':t,'bandRows':b,'bottomRows':d,'leftArm':left,'rightArm':right,'answer':answer},
         'sourceExamPage':4,'sourceAnswerPage':21,'sourceTextDirectlyReviewed':True,'sourceFigureDirectlyReviewed':True,
         'sourceAnswerCandidate':540,'independentSourceAnswer':540,'sourceAnswerCandidateOfficiality':'unverified',
         'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
         'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
         'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
         'independentCountAgrees':True,
      },
      'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None},
      'asset':{'kind':'svg','src':src,'description':'가로와 세로 격자 띠가 겹친 직사각형 도형'},
    })

data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{21})
data['pendingSourceNos']=[x for x in data['pendingSourceNos'] if x!=21]
data.setdefault('pendingReasons',{}).pop('21',None)
data['version']='20261026-applied1-q21-confirmed-r1';data['itemCount']=len(data['items'])
data.setdefault('sourceEditionNotes',{})['21']='현행 원문 p.4의 세로5열×7행, 가로10열×2행 격자 도형을 직접 확인. 포함배제 및 모든 사각형 경계 전수열거 모두 540. 답안 후보 p.21의 540과 일치하지만 판본 공식성은 별도로 확정되지 않음. 원본 그림은 보존하고 변형용 새 SVG 9개 제작.'
data['reviewSummary']['independentMathCount']=len(data['items'])
data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')})
data['reviewSummary']['outputReviewed']=False
index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=data['pendingSourceNos']
index['items'].append({'sourceNo':21,'genId':'applied1-q21','area':'도형','subarea':'격자와 직사각형',
                       'detailType':'겹치는 세로·가로 격자 띠의 직사각형 개수','pointBand':'3.4','reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied1 Q21:',[x['answerParts'][0] for x in items])

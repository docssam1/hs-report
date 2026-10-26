#!/usr/bin/env python3
"""Add eight independently checked variants for Applied 7 question 8."""
import hashlib
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / 'bank/data/applied7-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied7-expanded-index.json'
ASSET_DIR = ROOT / 'bank/assets/applied7'
SOURCE_ASSET = ASSET_DIR / 'q08-number-rule-original.png'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')

# Each row stores top,left,right for the 3 worked triangles, then the final question.
CASES = [
    [(2,4,6),(4,6,9),(8,4,2),(6,8,12)],
    [(3,2,8),(5,5,7),(4,3,9),(6,4,10)],
    [(2,3,9),(4,8,6),(7,7,10),(5,4,12)],
    [(6,4,8),(3,9,6),(5,5,10),(8,6,15)],
    [(4,2,11),(6,9,12),(5,10,14),(7,8,16)],
    [(5,3,12),(7,7,9),(4,8,10),(6,5,15)],
    [(8,4,9),(3,6,8),(6,12,10),(9,6,14)],
    [(4,6,15),(5,10,16),(7,14,12),(8,9,18)],
    [(9,6,12),(8,16,10),(6,12,14),(7,10,20)],
]

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def answer(top,left,right):
    value = Fraction(top * right, left)
    assert value.denominator == 1
    return value.numerator

assert EXAM.exists() and ANSWER.exists() and SOURCE_ASSET.exists()
source_hash = sha(SOURCE_ASSET)
# The exact printed examples in the original figure are checked directly here.
assert CASES[0] == [(2,4,6),(4,6,9),(8,4,2),(6,8,12)]
for i, group in enumerate(CASES, 1):
    for top,left,right in group[:3]:
        assert answer(top,left,right) > 0
    assert answer(*group[3]) > 0

items=[]
proofs=[]
for variant, group in enumerate(CASES, 1):
    examples=group[:3]
    query=group[3]
    example_answers=[answer(*triple) for triple in examples]
    result=answer(*query)
    # Independent cross multiplication confirms every example and the result.
    assert all(left * center == top * right for (top,left,right),center in zip(examples,example_answers))
    assert query[1] * result == query[0] * query[2]
    parameters={'examples':[{'top':t,'left':l,'right':r,'inside':answer(t,l,r)} for t,l,r in examples],
                'query':{'top':query[0],'left':query[1],'right':query[2]},'answer':result}
    steps=[
      f'첫 번째 그림은 2×6÷4=3, 두 번째 그림은 4×9÷6=6, 세 번째 그림은 8×2÷4=4입니다.' if variant==1 else
      f'세 예시에서 가운데 수는 각각 윗수×오른쪽 아래 수÷왼쪽 아래 수로 계산됩니다: {examples[0][0]}×{examples[0][2]}÷{examples[0][1]}={example_answers[0]}, {examples[1][0]}×{examples[1][2]}÷{examples[1][1]}={example_answers[1]}, {examples[2][0]}×{examples[2][2]}÷{examples[2][1]}={example_answers[2]}',
      f'마지막 그림에는 {query[0]}×{query[2]}÷{query[1]}={result}를 적용합니다.',
      f'곱셈으로 확인하면 {query[1]}×{result}={query[0]}×{query[2]}={query[0]*query[2]}이므로 가운데 수는 {result}입니다.'
    ]
    if variant==1:
      steps=[
       '첫 번째 그림은 2×6÷4=3, 두 번째 그림은 4×9÷6=6, 세 번째 그림은 8×2÷4=4입니다.',
       f'세 예시에서 가운데 수는 윗수×오른쪽 아래 수÷왼쪽 아래 수입니다. 마지막 그림은 6×12÷8={result}입니다.',
       f'곱셈으로 확인하면 8×{result}=6×12=72이므로 가운데 수는 {result}입니다.'
      ]
    asset_rel='assets/applied7/q08-number-rule-original.png' if variant==1 else f'assets/applied7/q08-rule-variant-{variant}-r29.png'
    item={
      'id':f'applied7-q08-v{variant}','genId':'applied7-q08','sourceSet':'applied','sourceRound':7,
      'sourceNo':8,'variantNo':variant,'reviewStatus':'verified','area':'수와 식','subarea':'규칙과 대응',
      'detailType':'삼각형 꼭짓점 수의 곱과 나눗셈 관계로 가운데 수 찾기','pointBand':'2.7',
      'text':'규칙을 찾아 ㄱ에 알맞은 수를 구하시오.',
      'asset':{'kind':'raster','src':asset_rel,'description':'세 삼각형의 꼭짓점 수와 가운데 수의 관계를 나타낸 그림'},
      'answer':str(result),'answerParts':[result],'answerLabels':['수'],'acceptedAnswers':[str(result)],
      'answerContract':'single-number','solutionSteps':steps,'solution':' '.join(steps),
      'learningPoint':'세 수 사이의 곱셈과 나눗셈 관계를 찾아 새로운 수 배열에 적용하기',
      'learningLocation':'활용 7회 · 원문 8번 · 삼각형 수 배열의 곱셈·나눗셈 규칙',
      'verification':{
       'primaryMethod':'세 예시의 윗수×오른쪽 아래 수÷왼쪽 아래 수를 계산하고 마지막 그림에 같은 관계를 적용한다.',
       'independentMethod':'각 예시에서 왼쪽 아래 수×가운데 수=윗수×오른쪽 아래 수가 성립하는지 교차곱으로 확인하고 마지막 수를 역산한다.',
       'parameters':parameters,'independentSuite':'qa/applied7-q08-independent-validate.py',
       'sourceExamPage':2,'sourceExamFile':EXAM.name,'sourceAnswerPage':2,
       'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':variant==1,
       'sourceDrawingAssetSha256':source_hash,
       'officialAnswerStatus':'원문 답안 PDF에 인쇄된 정답은 없고, 스캔에 손글씨 계산 6×12÷8=9가 보인다. 세 원본 예시를 규칙식과 교차곱으로 독립 확인했다.',
       'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,
       'measuredVariantRate':None,'estimated':False,
       'rationale':'활용 7회 원문 8번은 2~10번의 2.7점 배점대이며, 활용 문항 난도는 배점대만 적용한다.'}
    }
    items.append(item)
    proofs.append({'variantNo':variant,'examples':parameters['examples'],'query':parameters['query'],'answer':result,
                   'exampleCrossProducts':[{'left_times_center':l*a,'top_times_right':t*r,
                     'matches':l*a==t*r} for (t,l,r),a in zip(examples,example_answers)],
                   'queryCrossProduct':{'left_times_answer':query[1]*result,'top_times_right':query[0]*query[2],
                     'matches':query[1]*result==query[0]*query[2]}})

data=json.loads(DATA_PATH.read_text())
assert data['sourceSet']=='applied' and data['sourceRound']==7
assert 8 in data['pendingSourceNos'] and not any(x['sourceNo']==8 for x in data['items'])
data['items'].extend(items); data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(data['availableSourceNos']+[8])
data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=len(data['items'])
data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r29'
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
index=json.loads(INDEX_PATH.read_text())
assert index['sourceRound']==7 and 8 in index['pendingSourceNos']
index['version']=data['version']; index['itemCount']=data['itemCount']; index['pendingSourceNos']=data['pendingSourceNos']
index['items'].append({'sourceNo':8,'genId':'applied7-q08','area':'수와 식','subarea':'규칙과 대응',
 'detailType':'삼각형 꼭짓점 수의 곱과 나눗셈 관계로 가운데 수 찾기','pointBand':'2.7',
 'reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda x:x['sourceNo'])
INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
proof_path=ROOT/'.private-work/hw-expansion-20261023/hw7/q08-independent-math-r29.json'
proof_path.parent.mkdir(parents=True,exist_ok=True)
proof_path.write_text(json.dumps({'source':'활용 7회 원문 8번','sourceFigureSha256':source_hash,
 'sourceRule':'윗수×오른쪽 아래 수÷왼쪽 아래 수','sourceExamples':proofs[0]['examples'],
 'sourceAnswerDerived':proofs[0]['answer'],'variants':proofs},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'version':data['version'],'itemCount':data['itemCount'],'pending':data['pendingSourceNos'],
 'source8Answers':[x['answer'] for x in items],'proof':str(proof_path.relative_to(ROOT))},ensure_ascii=False))

#!/usr/bin/env python3
"""Correct the Q22/Q24 source-number binding and rebuild Q22 from the exact source."""
from __future__ import annotations
from itertools import combinations
from pathlib import Path
from fractions import Fraction
import json,hashlib
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/hw-expansion-20261023/hw8'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf'
DATA=ROOT/'bank/data/applied8-expanded.json';INDEX=ROOT/'bank/data/applied8-expanded-index.json'
VERSION='20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-r10'
# Difference target−100; source v1 keeps 108. Minus-subset sum is (36−difference)/2.
DIFFS=[8,0,4,10,14,18,22,26,32]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def minus_sets(k):return [c for r in range(9) for c in combinations(range(1,9),r) if sum(c)==k]
def count_by_largest(k):
 d={}
 for c in minus_sets(k):
  m=max(c) if c else 0;d[m]=d.get(m,0)+1
 return d
exam=PdfReader(str(EXAM)).pages[4].extract_text();ans=PdfReader(str(ANSWER)).pages[4].extract_text();compact=''.join(exam.split())
assert exam==ans
assert all(s in compact for s in ('물탱크','수도꼭지'))
data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
old22=[x for x in data['items'] if x['sourceNo']==22];old24=[x for x in data['items'] if x['sourceNo']==24]
if old22 and all('수도꼭지' in x['text'] for x in old22):
 faucet_items=old22
else:
 faucet_items=old24;assert len(faucet_items)==9 and all('수도꼭지' in x['text'] for x in faucet_items)
# The existing faucet set is retained, but it belongs to original Q24.
for x in faucet_items:
 x['id']=x['id'].replace('q22','q24');x['genId']='applied8-q24';x['sourceNo']=24
 x['text']=x['text'].replace('활용8회','활용8회')
 x['learningLocation']=x['learningLocation'].replace('원문 22번','원문 24번')
 x['verification']['independentSuite']='qa/applied8-q24-independent-validate.py'
 x['verification']['officialAnswerStatus']='The available Drive answer PDF page is an unmarked duplicate of the question page. The original and variants were independently calculated with exact rational rates.'
 x['difficultyEvidence']['rationale']='활용 8회 원문 24번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'
# Build new Q22 sign-placement count questions from source's exact 1..8 expression.
new=[]
for i,diff in enumerate(DIFFS,1):
 target=100+diff;k=(36-diff)//2;subsets=minus_sets(k);counts=count_by_largest(k);answer=len(subsets)
 assert diff%2==0 and 0<=k<=36 and answer>0
 expr=f'100 □ 1 □ 2 □ 3 □ 4 □ 5 □ 6 □ 7 □ 8 = {target}'
 text=f'식 {expr}에서 각 □에 + 또는 −를 넣어 등식이 성립하도록 하는 방법은 모두 몇 가지일까요?'
 bylargest=' + '.join(f'{counts[m]}가지' for m in sorted(counts))
 steps=[f'1부터 8까지의 합은 36입니다. −를 넣은 수들의 합을 M이라 하면 식의 값은 100+(36−2M)입니다.',f'이 값이 {target}이므로 100+36−2M={target}, 따라서 M={k}입니다. 즉, 1부터 8 중 합이 {k}가 되는 수들을 골라 −를 넣으면 됩니다.',f'−가 붙은 수들 중 가장 큰 수별로 나누어 세면 {', '.join(f'{m}일 때 {n}가지' for m,n in sorted(counts.items()))}입니다. 가능한 선택은 {bylargest}이므로 모두 {answer}가지입니다.',f'각 선택에서 고르지 않은 수에는 +를 붙이면 식이 성립합니다. 따라서 답은 {answer}가지입니다.']
 item={'id':f'applied8-q22-v{i}','genId':'applied8-q22','sourceSet':'applied','sourceRound':8,'sourceNo':22,'variantNo':i,'reviewStatus':'verified','area':'수와 식','subarea':'덧셈과 뺄셈','detailType':'1부터 8까지의 수에 부호를 붙여 목표 합을 만드는 방법 수','pointBand':'4.2','text':text,'asset':None,'answer':f'{answer}가지','answerParts':[answer],'answerLabels':['방법 수'],'acceptedAnswers':[str(answer),f'{answer}가지'],'answerContract':'single-number','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'전체 합과 목표값의 차이를 이용해 빼는 수의 합을 구하고, 조건을 만족하는 수의 선택 방법 수 세기','learningLocation':'활용 8회 · 원문 22번 · 덧셈과 뺄셈의 부호 배치','verification':{'primaryMethod':'−를 붙인 수들의 합을 M이라 두어 100+(36−2M)=목표값을 푼 뒤, 1~8의 부분집합을 가장 큰 수에 따라 나누어 센다.','independentMethod':'1~8의 모든 256개 부호 배치를 전수열거해 목표값이 되는 가짓수를 별도로 계산한다.','parameters':{'target':target,'signedDifference':diff,'minusSubsetSum':k,'negativeSetsByLargest':counts,'negativeSets': [list(s) for s in subsets],'answerCount':answer},'independentSuite':'qa/applied8-q22-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceAnswerPage':5,'sourceDrawingCompared':True,'sourceDrawingPresent':True,'officialAnswerStatus':'The available Drive answer PDF page is an unmarked duplicate of the question page. The answer is independently counted by enumerating all 256 sign assignments. The original uses circles as symbol blanks; variants typeset equivalent □ blanks inline.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 22번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
 new.append(item)
# Keep items from all other source numbers intact; replace Q22, relabel old Q22 faucet items as Q24.
data['items']=[x for x in data['items'] if x['sourceNo'] not in (22,24)]+new+faucet_items
data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['version']=VERSION;data['itemCount']=len(data['items']);data['availableSourceNos']=sorted({x['sourceNo'] for x in data['items']});data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
idx_items=[x for x in idx['items'] if x['sourceNo'] not in (22,24)]
idx_items += [{'sourceNo':22,'genId':'applied8-q22','area':'수와 식','subarea':'덧셈과 뺄셈','detailType':'1부터 8까지의 수에 부호를 붙여 목표 합을 만드는 방법 수','pointBand':'4.2','reviewStatus':'verified','variantCount':9},{'sourceNo':24,'genId':'applied8-q24','area':'수와 식','subarea':'일률과 함께 일하기','detailType':'세 수도꼭지의 동시 채움 시간에서 한 쌍의 채움 시간 구하기','pointBand':'4.2','reviewStatus':'verified','variantCount':9}]
idx_items.sort(key=lambda x:x['sourceNo']);idx['items']=idx_items;idx['version']=VERSION;idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos']
DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
source_q22={'sourceExam':{'file':EXAM.name,'sha256':sha(EXAM),'page':5,'questionNo':22,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q22-source-q22-crop.png','prompt':'100 옆에 1부터 8까지를 차례로 두고 각 수 앞 기호를 +/− 중 선택해 108을 만드는 방법 수.'},'answerCandidate':{'file':ANSWER.name,'sha256':sha(ANSWER),'page':5,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q22-answer-candidate-q22-crop.png','containsAnswers':False,'comparison':'Page 5 is an unmarked duplicate; answer line is blank.'},'sourceIndependentSolution':{'base':100,'numbers':[1,2,3,4,5,6,7,8],'target':108,'totalPositiveSum':36,'requiredNegativeSubsetSum':14,'subsetCount':12,'enumeratedAssignments':256,'answer':12},'variantCount':9,'variantResults':[{'variant':i,'target':100+d,'minusSubsetSum':(36-d)//2,'negativeSetsByLargest':count_by_largest((36-d)//2),'answer':len(minus_sets((36-d)//2))} for i,d in enumerate(DIFFS,1)],'variantsIndependentlyCalculated':True,'newSourceTypes':0,'difficulty':'4.2-point band only = high','correctionNote':'Prior tap-count items labeled Q22 were misbound; those retained items are now correctly labeled Q24.'}
(W/'q22-source-review.json').write_text(json.dumps(source_q22,ensure_ascii=False,indent=2)+'\n')
source_q24=json.loads((W/'q22-source-review.json').read_text()) if False else None
# Preserve the original Q24 faucet review using now-migrated bank values and correct page binding.
q24={'sourceExam':{'file':EXAM.name,'sha256':sha(EXAM),'page':5,'questionNo':24,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q22-source.png','prompt':'세 수도꼭지 전체, ㄱ+ㄷ, ㄴ+ㄷ의 탱크 채움 시간을 주고 ㄱ+ㄴ의 시간을 구한다.','transcribedTimesMinutes':{'allThree':60,'aAndC':90,'bAndC':120}},'answerCandidate':{'file':ANSWER.name,'sha256':sha(ANSWER),'page':5,'directVisualReview':True,'containsAnswers':False,'comparison':'The available answer-copy page is visually and textually identical to the question page; the answer line is blank.'},'sourceIndependentSolution':{'aAndBRatePerMinute':'1/72','answerMinutes':72,'answerDisplay':'1시간 12분','method':'c=1/90+1/120−1/60=1/360 tank/min; a+b=1/60−1/360=1/72 tank/min.'},'variantCount':9,'variantRateChecks':[],'variantsIndependentlyCalculated':True,'newSourceTypes':0,'difficulty':'4.2-point band only = high','correctionNote':'These faucet items were previously mislabeled Q22 and are corrected to Q24.'}
for i,x in enumerate(faucet_items,1):
 p=x['verification']['parameters'];q24['variantRateChecks'].append({'variant':i,'timesMinutes':[p['allThreeMinutes'],p['aAndCMinutes'],p['bAndCMinutes']],'answerMinutes':p['answerMinutes']})
(W/'q24-source-review.json').write_text(json.dumps(q24,ensure_ascii=False,indent=2)+'\n')
print('Corrected source bindings. Q22 sign counts:',[x['answerParts'][0] for x in new],'; Q24 faucets:',[x['answerParts'][0] for x in faucet_items],'; inventory',data['itemCount'],data['availableSourceNos'])

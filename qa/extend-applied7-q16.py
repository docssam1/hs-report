#!/usr/bin/env python3
"""Add nine variants to the existing Applied 7 Q16 decimal-series zero-count type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
t=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '아래를 계산한 식에서 0의 개수를 구하세요.' in t
# Ten terms K - 5/10^j, j=1..10. Their exact sum is 10K-0.5555555555.
def decimal_term(k,j):
    scaled=k*(10**j)-5
    digits=f'{scaled:0{j+1}d}'
    return digits[:-j]+'.'+digits[-j:]
def term_value(k,j):return k-5/(10**j)
def zero_count(k):
    integer=10*k-1
    assert f'{integer}.4444444445'==f'{integer}.4444444445'
    return str(integer).count('0')
ks=[10,11,12,20,101,100,1001,10001,100001]
items=[]
for v,k in enumerate(ks,1):
    terms=[decimal_term(k,j) for j in range(1,5)]
    last=decimal_term(k,10)
    answer=zero_count(k)
    text=f'다음과 같이 더한 식에서 0의 개수를 구하세요. {terms[0]} + {terms[1]} + {terms[2]} + {terms[3]} + … + {last}'
    total=f'{10*k-1}.4444444445'
    steps=[f'각 항은 {k}에서 0.5, 0.05, 0.005, ...처럼 10배씩 작아지는 수를 뺀 값입니다.',f'열 항에서 빼는 수의 합은 0.5+0.05+...+0.0000000005=0.5555555555입니다.',f'따라서 전체 합은 {total}입니다.',f'표준 소수 표기에서 정수 부분 {10*k-1}에 0이 {answer}개 있고 소수 부분 0.4444444445에는 0이 없습니다.']
    # Repeated exact integer-scaled calculation independently confirms the sum digits.
    integer=0;fraction=0
    for j in range(1,11):
        integer+=k
        fraction-=5*(10**(10-j))
    scaled=integer*10**10+fraction
    assert scaled==int(total.replace('.',''))
    assert str(scaled).zfill(11)==total.replace('.','')
    items.append({'id':f'applied7-q16-v{v}','genId':'applied7-q16','sourceSet':'applied','sourceRound':7,'sourceNo':16,'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'소수의 계산','detailType':'규칙적으로 이어지는 소수 합의 0 개수 세기','pointBand':'3.4','text':text,'answer':str(answer),'answerParts':[answer],'answerLabels':['개'],'acceptedAnswers':[str(answer)],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'반복되는 소수 부분의 합을 먼저 구하고 정수 부분의 0 개수를 센다','learningLocation':'활용 7회 · 원문 16번 · 규칙적으로 이어지는 소수의 합','verification':{'primaryMethod':'각 항에서 빠지는 소수의 합을 등비급수로 구해 합을 계산한다.','independentMethod':'모든 항을 10^10을 분모로 하는 정수로 바꾸어 합을 계산한 뒤 0을 센다.','parameters':{'targetInteger':k,'termCount':10,'firstTerms':terms,'lastTerm':last,'exactSum':total,'integerZeroCount':answer,'fractionalPart':'0.4444444445'},'independentSuite':'qa/applied7-q16-independent-validate.py','sourceExamPage':3,'sourceExamFile':EXAM.name,'sourceAnswerPage':3,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 16번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}})
data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 16 not in data['availableSourceNos']
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['availableSourceNos']=sorted(set(data['availableSourceNos']+[16]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=len(data['items']);data['version']='20261024-applied7-expansion-q02-q03-q04-q05-q06-q10-q12-q16-r8'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':3,'questionNumber':16,'sourceQuestion':'1.5+1.95+1.995+1.9995+...+1.9999999995에서 0의 개수','figurePresent':False},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':3,'questionNumber':16,'teacherMarkedAnswer':0,'evidence':'문제 PDF 3쪽의 소수 합 원문과 답안 PDF 3쪽의 교사 답 0을 직접 대조했다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'calculation':'sum(2-5/10^j for j=1..10)','result':0},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q16-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items'].append({'sourceNo':16,'genId':'applied7-q16','area':'수와 식','subarea':'소수의 계산','detailType':'규칙적으로 이어지는 소수 합의 0 개수 세기','pointBand':'3.4','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q16: 9 variants of the existing decimal-sum zero-count type, new source types 0.')

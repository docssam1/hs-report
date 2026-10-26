#!/usr/bin/env python3
"""Extend only the existing Applied 7 seven-segment 180-degree rotation type."""
import hashlib,itertools,json
from pathlib import Path
from PIL import Image,ImageChops

ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PAGE=ROOT/'.private-work/hw-expansion-20261023/hw7/source-review/p5/exam-5.png'
ASSET=ROOT/'bank/assets/applied7/q23-digital-rotation-original.png'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

im=Image.open(PAGE).convert('RGB');crop=im.crop((890,620,1580,815))
ASSET.parent.mkdir(parents=True,exist_ok=True);crop.save(ASSET)
assert ImageChops.difference(Image.open(ASSET),im.crop((890,620,1580,815))).getbbox() is None

rotate={'0':'0','1':'1','2':'2','5':'5','6':'9','8':'8','9':'6'}
first=tuple('125689');other=tuple('0125689');center=tuple('01258')
def enumerate_count(n):
    count=0;examples=[]
    for lead in first:
        pairs=n//2
        choices=[other]*(pairs-1)
        middle=itertools.product(*choices) if choices else [()]
        for selected in middle:
            digits=[lead,*selected]
            if n%2:
                for c in center:
                    left=digits+[c]
                    full=left+[rotate[d] for d in reversed(left[:-1])]
                    count+=1
                    if len(examples)<3:examples.append(''.join(full))
            else:
                full=digits+[rotate[d] for d in reversed(digits)]
                count+=1
                if len(examples)<3:examples.append(''.join(full))
    return count,examples

lengths=list(range(4,13));items=[];proof=[]
for v,n in enumerate(lengths,1):
    count,examples=enumerate_count(n)
    pairs=n//2
    formula=6*(7**(pairs-1))*(5 if n%2 else 1)
    assert count==formula
    steps=[f'180° 회전하면 숫자의 순서가 거꾸로 되고, 6과 9는 서로 바뀝니다.',
           f'첫 숫자는 0이 될 수 없어 1, 2, 5, 6, 8, 9의 6가지입니다. 그 뒤의 {pairs-1}개 숫자 쌍은 각각 7가지로 정하면 반대편 숫자가 정해집니다.',
           (f'{n}자리는 가운데 숫자가 0, 1, 2, 5, 8 중 하나라서 5가지입니다.' if n%2 else f'{n}자리는 가운데 숫자가 없으므로 별도 선택은 없습니다.'),
           f'따라서 경우의 수는 6×7^{pairs-1}'+('×5' if n%2 else '')+f'={count}입니다.']
    item={'id':f'applied7-q23-v{v}','genId':'applied7-q23','sourceSet':'applied','sourceRound':7,'sourceNo':23,'variantNo':v,
          'reviewStatus':'verified','area':'경우의 수','subarea':'디지털 숫자의 회전 대칭','detailType':'180도 회전해 같은 수가 되는 디지털 숫자의 개수',
          'pointBand':'4.2','text':f'다음과 같이 디지털 숫자판에 나타낸 9006은 180° 회전시켜도 9006입니다. 이 숫자판에 나타냈을 때 180° 회전시켜도 원래의 수와 같은 {n}자리 자연수는 모두 몇 개입니까?',
          'asset':{'kind':'raster','src':'assets/applied7/q23-digital-rotation-original.png','description':'활용 7회 원문 23번의 9006 회전 예시 그림을 원문 그대로 사용'},
          'answer':str(count),'answerParts':[count],'answerLabels':['자연수의 개수'],'acceptedAnswers':[str(count)],'answerContract':'single-number',
          'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'회전하면 자릿수 순서가 뒤집히고 각 숫자가 대응하는 규칙으로 바뀌는 점을 이용해 선택 수를 센다.',
          'learningLocation':'활용 7회 · 원문 23번 · 디지털 숫자의 회전 대칭',
          'verification':{'primaryMethod':'각 자리 쌍의 선택 수와 가운데 자리의 선택 수를 곱한다.',
                          'independentMethod':'회전 대응표를 사용해 가능한 자리 조합을 열거한다.',
                          'parameters':{'digitLength':n,'firstDigitChoices':list(first),'pairedDigitChoices':list(other),'middleDigitChoices':list(center) if n%2 else [],
                                        'pairCount':pairs,'formulaCount':formula,'enumeratedCount':count,'sampleSolutions':examples},
                          'independentSuite':'qa/applied7-q23-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceAnswerPage':5,
                          'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':True,'sourceAssetSha256':sha(ASSET),'studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
                                'rationale':'활용 7회 원문 23번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
    items.append(item);proof.append({'variant':v,'digitLength':n,'formulaCount':formula,'enumeratedCount':count,'sampleSolutions':examples})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7
data['items']=[x for x in data['items'] if x['sourceNo']!=23];data['availableSourceNos']=[x for x in data['availableSourceNos'] if x!=23]
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(data['availableSourceNos']+[23]);data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=len(data['items']);data['version']='20261025-applied7-expansion-q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q14-q16-q18-q20-q21-q22-q23-q25-q27-q29-r20'
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo']!=23]
idx['items'].append({'sourceNo':23,'genId':'applied7-q23','area':'경우의 수','subarea':'디지털 숫자의 회전 대칭','detailType':'180도 회전해 같은 수가 되는 디지털 숫자의 개수','pointBand':'4.2','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':5,'questionNumber':23,
                      'sourceQuestion':'9006은 180° 회전해도 9006이며 세 자리 회전 대칭 자연수의 개수를 묻는다.','figurePresent':True,
                      'figureCropPixels':{'pageImage':PAGE.name,'box':[890,620,1580,815],'width':690,'height':195,'assetSha256':sha(ASSET)}},
        'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':5,
                        'questionNumber':23,'teacherMarkedAnswer':30,'evidence':'문제·답안 PDF 5쪽의 9006 원본 그림과 교사 답 30을 직접 대조했다. 허용되는 첫 숫자 6가지와 가운데 숫자 5가지로 6×5=30이다.'},
        'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,
        'originalIndependentCheck':{'digitLength':3,'firstDigitChoices':list(first),'middleDigitChoices':list(center),'formulaCount':30,'teacherMarkedAnswer':30},
        'newVariants':9,'allVariantsSameSourceType':True,'variants':proof,'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'dataVersion':data['version']}
(WORK/'q23-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print('Built Applied 7 Q23: nine digit-length variants of the existing 7-segment rotation type; original example image reused exactly; new types 0.')

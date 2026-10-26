#!/usr/bin/env python3
"""Add nine variants of existing Applied 7 Q22 grade-complement overlap type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
t=subprocess.check_output([str(PDFTOTEXT),'-f','5','-l','5','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '입상한 학생 중 3' in t and '4학년이 아닌 학생은 28명' in t and '모두 26명이었다.' in t
tuples=[(9,12,10),(10,14,13),(12,13,15),(13,17,12),(14,16,18),(15,19,11),(16,18,20),(18,21,14),(20,23,17)]
items=[]
for v,(grade3,grade4,other) in enumerate(tuples,1):
 not3=grade4+other;not4=grade3+other;combined=grade3+grade4;total=grade3+grade4+other
 ans=grade4
 assert not3!=32 or not4!=28 or combined!=26
 steps=[f'입상 학생 전체 수를 N명이라고 하면 3학년은 N−{not3}명, 4학년은 N−{not4}명입니다.',f'두 학년의 합이 {combined}명이므로 (N−{not3})+(N−{not4})={combined}입니다.',f'따라서 입상 학생 전체는 {total}명이고, 4학년은 {total}−{not4}={ans}명입니다.',f'검산하면 3학년 {grade3}명과 4학년 {grade4}명의 합은 {combined}명이며, 3학년이 아닌 학생은 {not3}명, 4학년이 아닌 학생은 {not4}명입니다.']
 text=f'관호네 학교에서 수학경시대회를 열었습니다. 입상한 학생 중 3학년이 아닌 학생은 {not3}명, 4학년이 아닌 학생은 {not4}명이고, 3학년과 4학년을 합하면 모두 {combined}명입니다. 입상한 학생 중 4학년 학생은 몇 명인지 구하시오.'
 items.append({'id':f'applied7-q22-v{v}','genId':'applied7-q22','sourceSet':'applied','sourceRound':7,'sourceNo':22,'variantNo':v,'reviewStatus':'verified','area':'지문 이해','subarea':'포함·제외 관계','detailType':'두 학년이 아닌 학생 수와 학년 합으로 한 학년 수 구하기','pointBand':'4.2','text':text,'answer':str(ans),'answerParts':[ans],'answerLabels':['4학년 학생'],'acceptedAnswers':[str(ans),f'{ans}명'],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'전체 학생 수를 미지수로 두고 각 학년이 아닌 수를 전체에서 뺀다','learningLocation':'활용 7회 · 원문 22번 · 학년 포함·제외 관계','verification':{'primaryMethod':'전체 수를 기준으로 각 학년 수를 나타내어 합 조건에 대입한다.','independentMethod':'3학년·4학년·그 밖의 학년 수를 두고 세 식을 연립해 직접 구한다.','parameters':{'grade3':grade3,'grade4':grade4,'otherGrades':other,'notGrade3':not3,'notGrade4':not4,'grade3And4Combined':combined,'totalStudents':total},'independentSuite':'qa/applied7-q22-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceAnswerPage':5,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 22번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}})
data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 22 not in data['availableSourceNos']
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['availableSourceNos']=sorted(set(data['availableSourceNos']+[22]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=len(data['items']);data['version']='20261024-applied7-expansion-q02-q03-q04-q05-q06-q10-q12-q16-q18-q20-q22-r10'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':5,'questionNumber':22,'sourceQuestion':'3학년이 아닌 32명, 4학년이 아닌 28명, 3·4학년 합26명에서 4학년 수','figurePresent':False},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':5,'questionNumber':22,'teacherMarkedAnswer':15,'evidence':'문제 PDF 5쪽의 세 수 32, 28, 26과 답안 PDF 5쪽의 교사 계산 (32+26+28)/2=43, 43−28=15를 직접 대조했다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'grade3':11,'grade4':15,'otherGrades':17,'total':43,'result':15},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q22-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items'].append({'sourceNo':22,'genId':'applied7-q22','area':'지문 이해','subarea':'포함·제외 관계','detailType':'두 학년이 아닌 학생 수와 학년 합으로 한 학년 수 구하기','pointBand':'4.2','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q22: 9 variants of the existing grade-complement type; new source types 0.')

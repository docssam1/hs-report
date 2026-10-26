"""Add nine variants for existing Applied 7 Q4 length-and-units type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
text=subprocess.check_output([str(PDFTOTEXT),'-layout',str(EXAM),'-'],text=True,errors='replace')
assert '연못에 긴 막대를 바닥에 수직으로 넣었다가 꺼냈더니 물이' in text and '물이 묻지 않은 부분이' in text
assert EXAM.is_file() and ANSWER.is_file()

# Values are in centimeters. Twice the wet length plus the dry remainder is
# the stick length. The source answer is 2*169+78 = 416 cm = 4 m 16 cm.
wet_values=[110,125,140,155,170,185,200,215,230]
dry_values=[45,52,38,66,27,59,41,73,34]
def fmt(cm):return f'{cm//100}m {cm%100}cm'
items=[]
for v,(wet,dry) in enumerate(zip(wet_values,dry_values),1):
 total=2*wet+dry; metres,remainder=divmod(total,100)
 wfmt=fmt(wet)
 prompt=f'연못에 긴 막대를 바닥에 수직으로 넣었다가 꺼냈더니 물이 {wfmt}만큼 묻었습니다. 같은 방법으로 막대의 반대쪽을 연못에 수직으로 넣었다 꺼냈더니 물이 묻지 않은 부분이 {dry}cm였습니다. 이 막대의 길이는 몇 m 몇 cm인지 구하시오.'
 steps=[f'처음 넣었을 때 물이 묻은 길이는 {wet}cm입니다.',f'반대쪽 끝을 넣었을 때도 물이 묻은 길이는 {wet}cm이고, 물이 묻지 않은 부분은 {dry}cm입니다.',f'막대 전체 길이는 {wet}+{wet}+{dry}={total}cm입니다.',f'{total}cm는 {metres}m {remainder}cm이므로 답은 {metres}m {remainder}cm입니다.']
 items.append({'id':f'applied7-q04-v{v}','genId':'applied7-q04','sourceSet':'applied','sourceRound':7,'sourceNo':4,'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'길이와 단위','detailType':'같은 길이의 두 젖은 부분과 마른 부분으로 전체 길이 구하기','pointBand':'2.7','text':prompt,'answer':f'{metres}m {remainder}cm','answerParts':[metres,remainder],'answerLabels':['m','cm'],'acceptedAnswers':[f'{metres}m {remainder}cm',f'{metres}m{remainder}cm',f'{total}cm'],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'같은 깊이에서 물이 묻은 두 길이를 더하고, 남은 길이를 합쳐 전체 길이를 구한 뒤 cm를 m와 cm로 바꾸기','learningLocation':'활용 7회 · 원문 4번 · 물에 잠긴 길이와 남은 길이로 막대 전체 길이 구하기','verification':{'primaryMethod':'두 번 물이 묻은 동일한 길이와 반대쪽에서 물이 묻지 않은 길이를 합한다.','independentMethod':'cm로 환산해 2×젖은 길이+마른 길이를 계산한 뒤 100으로 나누어 m와 cm로 변환한다.','parameters':{'wetLengthCm':wet,'dryLengthCm':dry,'totalLengthCm':total,'answerMetres':metres,'answerCentimetres':remainder},'independentSuite':'qa/applied7-q04-independent-validate.py','sourceExamPage':1,'sourceExamFile':EXAM.name,'sourceAnswerPage':1,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 4번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}})

data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and set(data['availableSourceNos'])<={2,3,4}
prior=[x for x in data['items'] if x['sourceNo'] in (2,3)]
data['items']=prior+items;data['availableSourceNos']=[2,3,4];data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=27;data['version']='20261024-applied7-expansion-q02-q03-q04-r3'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':1,'questionNumber':4,'figurePresent':False},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':1,'questionNumber':4,'teacherMarkedAnswer':'4m 16cm','evidence':'원문 PDF 1쪽과 필기 답안 PDF 1쪽을 직접 비교했다. 원답은 젖은 길이 169cm 두 번과 마른 길이 78cm를 더한 416cm다.'},'sourceAndAnswerMatch':True,'directPageImagesCompared':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'independentCheck':{'calculation':'2*169+78','centimetres':416,'metres':4,'remainingCentimetres':16},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q04-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=27;idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo'] in (2,3)]+[{'sourceNo':4,'genId':'applied7-q04','area':'수와 식','subarea':'길이와 단위','detailType':'같은 길이의 두 젖은 부분과 마른 부분으로 전체 길이 구하기','pointBand':'2.7','reviewStatus':'verified','variantCount':9}]
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied 7 Q4: 9 variants; source answer 4m 16cm independently confirmed; new source types 0.')

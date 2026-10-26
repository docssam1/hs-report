#!/usr/bin/env python3
"""Add nine variants to the existing Applied 7 Q27 pebble-points system type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json';INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
t=subprocess.check_output([str(PDFTOTEXT),'-f','6','-l','6','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '각각 10개의 바둑돌을 뽑아 보니' in t and '의 색깔에 따라 점수를 주는 게임' in t
pairs=[(1,8),(2,7),(3,5),(4,5),(5,4),(6,3),(7,2),(1,7),(2,6)]
items=[]
for v,(gw,jw) in enumerate(pairs,1):
 gb=10-gw;jb=10-jw;c=2*jw-gb;d=jb-gw
 assert c>0 and d>0
 black_points=6+v
 white_points=18+2*v
 gscore=gb*black_points+gw*white_points
 jscore=jb*black_points+jw*white_points
 det=gb*jw-jb*gw
 assert det!=0
 steps=[f'경민이의 검은 돌은 {gb}개, 흰 돌은 {gw}개입니다. 정화의 검은 돌은 {jb}개, 흰 돌은 {jw}개입니다.',f'검은 돌 점수를 B점, 흰 돌 점수를 W점으로 두면 {gb}B+{gw}W={gscore}, {jb}B+{jw}W={jscore}입니다.',f'두 식을 풀면 검은 돌 한 개는 {black_points}점, 흰 돌 한 개는 {white_points}점입니다.',f'두 사람의 돌 수 합은 각각 10개이며 점수식을 다시 대입하면 {gscore}점과 {jscore}점이 됩니다.']
 text=f'경민이와 정화는 주머니 속의 바둑돌을 한 개씩 뽑아 바둑돌의 색깔에 따라 점수를 줍니다. 두 사람은 각각 바둑돌 10개씩을 뽑았습니다. 경민이의 검은 돌 수는 정화의 흰 돌 수의 2배보다 {c}개 적고, 정화의 검은 돌 수는 경민이의 흰 돌 수보다 {d}개 많습니다. 경민이의 총점은 {gscore}점이고 정화의 총점은 {jscore}점일 때, 흰 돌과 검은 돌 한 개의 점수는 각각 몇 점입니까?'
 items.append({'id':f'applied7-q27-v{v}','genId':'applied7-q27','sourceSet':'applied','sourceRound':7,'sourceNo':27,'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'연립 관계와 점수','detailType':'두 색 돌의 개수 관계와 총점으로 돌 한 개 점수 구하기','pointBand':'4.2','text':text,'answer':f'{white_points}, {black_points}','answerParts':[white_points,black_points],'answerLabels':['흰 돌 한 개 점수','검은 돌 한 개 점수'],'acceptedAnswers':[str(white_points),str(black_points)],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'두 사람의 돌 개수와 총점으로 두 색 돌의 점수를 연립해 구한다','learningLocation':'활용 7회 · 원문 27번 · 두 색 돌의 점수 관계','verification':{'primaryMethod':'두 사람의 흰 돌 수를 정한 뒤 총점 두 식을 연립한다.','independentMethod':'돌 개수 관계에서 검은 돌 수를 구하고 총점 선형연립방정식의 행렬식을 확인해 유일해를 계산한다.','parameters':{'gyeongminWhite':gw,'gyeongminBlack':gb,'jeonghwaWhite':jw,'jeonghwaBlack':jb,'blackPoints':black_points,'whitePoints':white_points,'gyeongminTotal':gscore,'jeonghwaTotal':jscore,'blackCountDifference':c,'jeonghwaBlackExcess':d,'determinant':det},'independentSuite':'qa/applied7-q27-independent-validate.py','sourceExamPage':6,'sourceExamFile':EXAM.name,'sourceAnswerPage':6,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 27번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}})
data=json.loads(DATA_PATH.read_text());assert data['sourceRound']==7 and 27 not in data['availableSourceNos']
data['items'].extend(items);data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['availableSourceNos']=sorted(set(data['availableSourceNos']+[27]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']];data['itemCount']=len(data['items']);data['version']='20261024-applied7-expansion-q02-q03-q04-q05-q06-q10-q12-q16-q18-q20-q22-q27-r11'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':6,'questionNumber':27,'sourceQuestion':'각자 바둑돌 10개, 색별 개수 관계와 두 사람의 점수로 각 색 돌의 한 개 점수를 구한다','figurePresent':False},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':6,'questionNumber':27,'teacherMarkedAnswer':{'whitePoints':50,'blackPoints':10},'evidence':'문제 PDF 6쪽의 색별 돌 개수 조건과 총점 220:340, 답안 PDF 6쪽의 연립 계산과 교사 답 흰 돌 50점·검은 돌 10점을 직접 대조했다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'counts':{'gyeongminWhite':3,'gyeongminBlack':7,'jeonghwaWhite':6,'jeonghwaBlack':4},'equations':['7B+3W=220','4B+6W=340'],'result':{'whitePoints':50,'blackPoints':10}},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q27-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
idx=json.loads(INDEX_PATH.read_text());idx['version']=data['version'];idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items'].append({'sourceNo':27,'genId':'applied7-q27','area':'수와 식','subarea':'연립 관계와 점수','detailType':'두 색 돌의 개수 관계와 총점으로 돌 한 개 점수 구하기','pointBand':'4.2','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print('Built Applied7 Q27: 9 variants of the existing two-color scoring type; new source types 0.')

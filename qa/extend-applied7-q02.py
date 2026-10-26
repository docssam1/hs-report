"""Add nine variants for existing Applied 7 Q2 source type only."""
import hashlib, json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

exam_text=subprocess.check_output([str(PDFTOTEXT),'-layout',str(EXAM),'-'],text=True,errors='replace')
assert '사탕 27개를 민호, 선아, 연우 세 사람이 나누어 가지려고' in exam_text
assert '사탕 27개를 민호, 선아, 연우 세 사람이 나누어 가지려고' in exam_text and '적은 개수는 몇 개입니까?' in exam_text
assert EXAM.is_file() and ANSWER.is_file()

# Source 27: let Minho and Seona each receive x, and Yeonwoo y>x.
# 2x+y=27, so the largest possible x is 8 and the minimum y is 11.
assert max(x for x in range(1,27) if 27-2*x>x)==8
assert 27-2*8==11

items=[]
for v,total in enumerate(range(18,45,3),1):
    x=(total//3)-1
    y=total-2*x
    assert 2*x+y==total and y>x
    assert all(total-2*(x+1) <= x+1 for _ in [0])
    prompt=f'사탕 {total}개를 민호, 선아, 연우 세 사람이 나누어 가지려고 합니다. 민호와 선아는 같은 개수만큼 가지고, 연우는 민호보다 많이 가지려고 할 때, 연우가 가질 수 있는 사탕 중 가장 적은 개수는 몇 개입니까?'
    steps=[
      f'민호와 선아가 각각 {x}개를 가진다고 하면 연우는 {total}-({x}×2)={y}개를 가집니다.',
      f'연우가 민호보다 많이 가져야 하므로 두 사람 몫을 각각 {x+1}개로 늘리면 연우 몫은 {total}-({x+1}×2)={total-2*(x+1)}개입니다. 이는 {x+1}개보다 많지 않습니다.',
      f'따라서 민호와 선아가 각각 {x}개일 때 연우의 몫이 가능한 최솟값이며, 답은 {y}개입니다.',
      f'확인하면 {x}+{x}+{y}={total}이고 {y}>{x}입니다.'
    ]
    items.append({
      'id':f'applied7-q02-v{v}','genId':'applied7-q02','sourceSet':'applied','sourceRound':7,'sourceNo':2,'variantNo':v,'reviewStatus':'verified',
      'area':'경우의 수','subarea':'조건을 만족하는 정수 분배','detailType':'같은 몫과 대소 조건이 있는 분배에서 최소값 찾기','pointBand':'2.7','text':prompt,
      'answer':str(y),'answerParts':[y],'answerLabels':['연우가 받는 사탕 수'],'acceptedAnswers':[str(y),f'{y}개'],'answerContract':'ordered-parts',
      'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'전체 개수와 같은 몫 조건으로 남은 몫을 나타내고, 대소 조건을 만족하는 경계값을 찾기',
      'learningLocation':'활용 7회 · 원문 2번 · 같은 몫과 대소 조건이 있는 사탕 분배',
      'verification':{'primaryMethod':'두 사람의 같은 몫을 x로 놓고 y=전체−2x로 나타내어 y>x 조건의 경계에서 가장 작은 y를 구한다.','independentMethod':'가능한 x 정수값을 부등식 3x<전체에 대입하고, 경계값 및 바로 다음 값을 비교한다.','parameters':{'total':total,'equalShare':x,'minimumLargerShare':y,'nextEqualShare':x+1,'nextRemainder':total-2*(x+1)},'independentSuite':'qa/applied7-q02-independent-validate.py','sourceExamPage':1,'sourceExamFile':EXAM.name,'sourceAnswerPage':1,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 7회 원문 2번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}
    })

data=json.loads(DATA_PATH.read_text())
assert data['sourceRound']==7 and data['availableSourceNos'] in ([3],[2,3])
data['items']=items+[x for x in data['items'] if x['sourceNo']==3]
data['availableSourceNos']=[2,3]
data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
data['itemCount']=18
data['version']='20261024-applied7-expansion-q02-q03-r2'
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'questionPage':1,'questionNumber':2,'questionText':'27개의 사탕을 세 사람이 나누며, 두 사람 몫은 같고 세 번째 사람 몫은 더 많도록 할 때 그 최솟값을 묻는다.','figurePresent':False},'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'answerPage':1,'questionNumber':2,'teacherMarkedAnswer':11,'evidence':'원문 PDF와 필기 답안 PDF의 1쪽을 직접 비교해 원답 11을 확인했다.'},'directPageImagesCompared':True,'sourceAndAnswerMatch':True,'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'sourceAnswerIndependentCheck':{'equation':'2x+y=27','condition':'y>x','largestEqualShare':8,'answer':11},'newVariants':9,'allVariantsSameSourceType':True}
(WORK/'q02-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
INDEX=json.loads(INDEX_PATH.read_text())
INDEX['version']=data['version']; INDEX['itemCount']=18; INDEX['pendingSourceNos']=data['pendingSourceNos']
INDEX['items']=[x for x in INDEX['items'] if x['sourceNo']!=2]
INDEX['items'].insert(0,{'sourceNo':2,'genId':'applied7-q02','area':'경우의 수','subarea':'조건을 만족하는 정수 분배','detailType':'같은 몫과 대소 조건이 있는 분배에서 최소값 찾기','pointBand':'2.7','reviewStatus':'verified','variantCount':9})
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX_PATH.write_text(json.dumps(INDEX,ensure_ascii=False,indent=2)+'\n')
print('Built Applied 7 Q2: 9 variants; source answer 11 independently confirmed; new source types 0.')

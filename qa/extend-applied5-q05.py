#!/usr/bin/env python3
"""Add nine variants of Applied 5 Q5's one-to-one preference deduction type."""
import hashlib, itertools, json
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA_PATH=ROOT/'bank/data/applied5-expanded.json'; INDEX_PATH=ROOT/'bank/data/applied5-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
SOURCE_RENDER=WORK/'q06-source/exam-q06-1.png'; ANSWER_RENDER=WORK/'q05-source/answer-5-05.png'
VERSION='20261025-applied5-expansion-q03-q05-q06-r4'

# Role order: target student, fixed-choice student, student rejecting role sport C,
# student rejecting role sports A and C. Lists are presentation order, not roles.
CASES=[
 (['윤서','민준','지아','현우'],['농구','배드민턴','스키','수영'],[0,1,2,3],[0,1,2,3]),
 (['서준','하린','민재','소율'],['테니스','야구','탁구','축구'],[1,2,3,0],[1,2,3,0]),
 (['예린','도윤','시우','다은'],['태권도','탁구','수영','농구'],[2,3,0,1],[2,3,0,1]),
 (['준호','나연','지후','서아'],['달리기','배구','테니스','야구'],[3,0,1,2],[3,0,1,2]),
 (['유진','건우','채원','이안'],['축구','태권도','배드민턴','수영'],[0,2,1,3],[1,3,2,0]),
 (['수아','현준','은우','다희'],['야구','수영','농구','탁구'],[2,0,3,1],[2,1,0,3]),
 (['지민','태오','하윤','도현'],['배드민턴','테니스','달리기','축구'],[1,3,2,0],[3,2,0,1]),
 (['가은','민호','서윤','재윤'],['수영','농구','축구','태권도'],[3,1,0,2],[0,2,3,1]),
 (['하준','아린','시온','유나'],['탁구','축구','배구','배드민턴'],[2,1,3,0],[1,0,2,3]),
]

def solve(p):
 people=p['people']; sports=p['sports']; target=p['target']; fixed=p['fixed']; one=p['singleExclude']; two=p['doubleExclude']
 return [dict(zip(people,perm)) for perm in itertools.permutations(sports)
         if perm[people.index(fixed)]==p['fixedSport']
         and perm[people.index(one)]!=p['singleExcludedSport']
         and perm[people.index(two)] not in p['doubleExcludedSports']]

def particle(word,topic=False):
 c=ord(word[-1])-0xAC00; has=(c%28)!=0
 if topic: return '은' if has else '는'
 return '을' if has else '를'

def subject_particle(word):
 c=ord(word[-1])-0xAC00
 return '이' if (c%28)!=0 else '가'

def item_payload(case,no):
 names,options,person_role,sport_role=case
 people=list(names); sports=list(options)
 role_people=[people[i] for i in person_role]
 role_sports=[sports[i] for i in sport_role]
 target,fixed,one,two=role_people; a,b,c,d=role_sports
 p={'people':people,'sports':sports,'target':target,'fixed':fixed,'fixedSport':b,'singleExclude':one,'singleExcludedSport':c,'doubleExclude':two,'doubleExcludedSports':[a,c]}
 solutions=solve(p); assert len(solutions)==1, (no,solutions)
 solution=solutions[0]; answer=solution[target]
 text=(f"{', '.join(people)}는 {', '.join(sports)} 중 서로 다른 운동을 한 가지씩 좋아합니다. "
       f"{fixed}{particle(fixed,True)} {b}{particle(b)} 좋아합니다. "
       f"{one}{particle(one,True)} {c}{particle(c)} 좋아하지 않습니다. "
       f"{two}{particle(two,True)} {a}도 {c}도 좋아하지 않습니다. "
       f"{target}{subject_particle(target)} 좋아하는 운동은 무엇입니까?")
 steps=[
  f"{fixed}{particle(fixed,True)} {b}{particle(b)} 좋아하므로 나머지 학생들은 {b}를 좋아할 수 없습니다.",
  f"{two}{particle(two,True)} {a}와 {c}를 좋아하지 않습니다. 남은 선택은 {b}와 {d}인데, {b}는 이미 정해졌으므로 {two}{particle(two,True)}은 {d}를 좋아합니다.",
  f"이제 {one}{particle(one,True)}은 {c}를 좋아하지 않으므로 남은 {a}를 좋아합니다. 마지막으로 {target}{particle(target,True)}은 {answer}를 좋아합니다."
 ]
 assert solution[fixed]==b and solution[two]==d and solution[one]==a and solution[target]==c==answer
 return {'id':f'applied5-q05-v{no}','genId':'applied5-q05','sourceSet':'applied','sourceRound':5,'sourceNo':5,'variantNo':no,'reviewStatus':'verified',
  'area':'지문이해','subarea':'조건 추론','detailType':'서로 다른 선택의 배정과 배제 단서','pointBand':'2.7','text':text,
  'answer':answer,'answerParts':[answer],'answerLabels':['운동'],'acceptedAnswers':[answer],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),
  'learningPoint':'서로 다른 선택 조건과 부정 단서를 함께 적용해 남은 선택지를 좁히기','learningLocation':'활용 5회 · 원문 5번 · 조건 추론',
  'verification':{'primaryMethod':'4개 항목의 24가지 일대일 배정을 전부 검사하고 단서 조건을 적용한다.','independentMethod':'고정 선택을 먼저 배제한 뒤 2개 선택 배제와 1개 선택 배제 순서로 남는 값을 확정한다.',
   'parameters':p,'independentSuite':'qa/applied5-q05-independent-validate.py','sourceExamPage':1,'sourceAnswerPage':5,'sourceExamFile':EXAM.name,'sourceAnswerFile':ANSWER.name,
   'sourceExamDriveFileId':'1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp','sourceAnswerDriveFileId':'1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05',
   'sourceTextCompared':True,'sourceAnswerStatus':'Drive answer PDF page 5 includes teacher handwriting 야구; independent 24-assignment enumeration yields Hanbyeol→baseball uniquely.',
   'studentDifficultyMeasured':False},
  'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 5회 원문 5번은 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다.'}}

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 data=json.loads(DATA_PATH.read_text());index=json.loads(INDEX_PATH.read_text())
 existing=[x for x in data['items'] if x['sourceNo']==5]
 if existing:
  if len(existing)!=9 or any(x.get('genId')!='applied5-q05' for x in existing):raise SystemExit('Unexpected Applied5 Q5 entries; refusing to replace them.')
  data['items']=[x for x in data['items'] if x['sourceNo']!=5]
  index['items']=[x for x in index['items'] if x['sourceNo']!=5]
  data['availableSourceNos']=[n for n in data['availableSourceNos'] if n!=5]
  if 5 not in data['pendingSourceNos']:data['pendingSourceNos'].append(5)
 assert 5 in data['pendingSourceNos'] and 5 not in data['availableSourceNos']
 assert len(PdfReader(str(EXAM)).pages)==6 and len(PdfReader(str(ANSWER)).pages)==31
 original={'people':['한별','동민','규형','석기'],'sports':['축구','수영','야구','스키'],'target':'한별','fixed':'동민','fixedSport':'수영','singleExclude':'규형','singleExcludedSport':'야구','doubleExclude':'석기','doubleExcludedSports':['축구','야구']}
 os=solve(original);assert len(os)==1 and os[0]['한별']=='야구'
 assert len(CASES)==9 and len({tuple(x[0]) for x in CASES})==9
 items=[item_payload(c,i) for i,c in enumerate(CASES,1)]
 assert len({x['answer'] for x in items})>=4
 WORK.mkdir(parents=True,exist_ok=True)
 src=Image.open(SOURCE_RENDER);box=(930,880,1770,1350);src.crop(box).save(WORK/'q05-source/exam-q05-crop.png')
 ans=Image.open(ANSWER_RENDER);ans.crop((2150,1050,2750,1510)).save(WORK/'q05-source/answer-q05-proof.png')
 position=max(i for i,x in enumerate(data['items']) if x['sourceNo']==4)+1;data['items'][position:position]=items
 data['version']=VERSION;data['availableSourceNos']=sorted(data['availableSourceNos']+[5]);data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=5]
 data['reviewSummary'].update({'independentMathCount':99,'sourceTypes':11,'variantsPerType':9,'sourceDrawingCount':2})
 ipos=next(i for i,x in enumerate(index['items']) if x['sourceNo']==6)
 index['items'].insert(ipos,{'sourceNo':5,'genId':'applied5-q05','area':'지문이해','subarea':'조건 추론','detailType':'서로 다른 선택의 배정과 배제 단서','pointBand':'2.7','reviewStatus':'verified','variantCount':9})
 index['version']=VERSION;index['itemCount']=len(data['items']);index['pendingSourceNos']=list(data['pendingSourceNos'])
 DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'driveFileId':'1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':1,'questionNo':5,'directVisualReview':True,'stem':'다음을 읽고 한별이가 좋아하는 운동은 무엇인지 쓰시오.','clues':['네 학생은 축구, 수영, 야구, 스키 중 서로 다른 운동을 하나씩 좋아한다.','규형은 야구를 좋아하지 않는다.','동민은 수영을 좋아한다.','석기는 축구와 야구를 좋아하지 않는다.']},
  'sourceAnswer':{'file':ANSWER.name,'driveFileId':'1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':5,'directVisualReview':True,'answerVisible':True,'teacherAnswer':'야구','independentSolutions':os},
  'sourceCrop':{'render':str(SOURCE_RENDER.relative_to(ROOT)),'crop':str((WORK/'q05-source/exam-q05-crop.png').relative_to(ROOT)),'cropBoxPixels':list(box),'pixelExactCrop':True,'sha256':sha(WORK/'q05-source/exam-q05-crop.png')},
  'answerProof':{'render':str(ANSWER_RENDER.relative_to(ROOT)),'crop':str((WORK/'q05-source/answer-q05-proof.png').relative_to(ROOT)),'sha256':sha(WORK/'q05-source/answer-q05-proof.png')},
  'originalSolution':{'answer':'야구','assignmentCount':len(os),'method':'all 24 permutations and independent elimination'},
  'variants':[{'variantNo':x['variantNo'],'parameters':x['verification']['parameters'],'answer':x['answer'],'validAssignmentCount':len(solve(x['verification']['parameters']))} for x in items],
  'variantCount':9,'newSourceTypes':0,'difficulty':'2.7-point band only = low'}
 (WORK/'q05-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print(f'Added Applied5 Q5: 9 unique one-to-one preference variants; original answer baseball; data items {len(data["items"])}.')
if __name__=='__main__':main()

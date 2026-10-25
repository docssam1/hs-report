#!/usr/bin/env python3
"""Source-grounded, independent one-to-one assignment audit for Applied 5 Q5."""
import hashlib,itertools,json
from pathlib import Path
from PIL import Image,ImageChops
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=ROOT/'bank/data/applied5-expanded.json';INDEX=ROOT/'bank/data/applied5-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
REVIEW=json.loads((W/'q05-source-answer-review.json').read_text())
VERSION='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def enumerate_assignments(p):
 people=p['people'];sports=p['sports'];out=[]
 for order in itertools.permutations(sports):
  a=dict(zip(people,order))
  if a[p['fixed']]==p['fixedSport'] and a[p['singleExclude']]!=p['singleExcludedSport'] and a[p['doubleExclude']] not in p['doubleExcludedSports']:out.append(a)
 return out
data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
assert data['version']==idx['version']==VERSION and data['sourceRound']==5
assert len(data['items'])==idx['itemCount']==162 and 5 in data['availableSourceNos'] and 5 not in data['pendingSourceNos']
assert len(PdfReader(str(EXAM)).pages)==6 and len(PdfReader(str(ANSWER)).pages)==31
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
assert REVIEW['sourceExam']['questionNo']==5 and REVIEW['sourceExam']['page']==1
assert REVIEW['sourceAnswer']['page']==5 and REVIEW['sourceAnswer']['teacherAnswer']=='야구'
original={'people':['한별','동민','규형','석기'],'sports':['축구','수영','야구','스키'],'target':'한별','fixed':'동민','fixedSport':'수영','singleExclude':'규형','singleExcludedSport':'야구','doubleExclude':'석기','doubleExcludedSports':['축구','야구']}
orig=enumerate_assignments(original)
assert len(orig)==1 and orig[0]['한별']=='야구'
render=ROOT/REVIEW['sourceCrop']['render'];crop=ROOT/REVIEW['sourceCrop']['crop'];box=tuple(REVIEW['sourceCrop']['cropBoxPixels'])
actual=Image.open(render).convert('RGB').crop(box);saved=Image.open(crop).convert('RGB')
assert actual.size==saved.size and ImageChops.difference(actual,saved).getbbox() is None and sha(crop)==REVIEW['sourceCrop']['sha256']
proof=W/'q05-source/answer-q05-proof.png';assert proof.is_file() and sha(proof)==REVIEW['answerProof']['sha256']
items=[x for x in data['items'] if x['sourceNo']==5]
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
assert [x['sourceNo'] for x in idx['items']].count(5)==1
answers=[];patterns=[]
for x,entry in zip(items,REVIEW['variants']):
 p=x['verification']['parameters'];solutions=enumerate_assignments(p)
 assert len(solutions)==entry['validAssignmentCount']==1
 assert x['answer']==solutions[0][p['target']]==entry['answer'] and x['answerParts']==[x['answer']]
 assert len(p['people'])==len(p['sports'])==4 and len(set(p['people']))==len(set(p['sports']))==4
 assert len(x['solutionSteps'])==3 and x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 assert x['area']=='지문이해' and x['subarea']=='조건 추론' and x['detailType']=='서로 다른 선택의 배정과 배제 단서'
 assert x['verification']['sourceTextCompared'] is True and x['verification']['sourceAnswerPage']==5
 assert not x.get('asset') and all(token not in x['text'] for token in ['힌트','풀이','정답은'])
 assert x['text'].count(x['verification']['parameters']['target'])>=2
 pattern=(p['fixed'],p['fixedSport'],p['singleExclude'],p['singleExcludedSport'],p['doubleExclude'],tuple(p['doubleExcludedSports']))
 patterns.append(pattern);answers.append(x['answer'])
 assert len(set(solutions[0].values()))==4
assert len(set(patterns))==9 and len(set(answers))>=4
out=W/'q05-independent-math.json';out.write_text(json.dumps({'suite':Path(__file__).name,'dataSha256':sha(DATA),'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'originalAnswer':'야구','originalAssignmentCount':1,'variants':len(items),'uniqueAnswers':sorted(set(answers)),'allVariantsOneSolution':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied5 Q5: source exam and teacher answer, exact crop, 9 distinct clue parameter sets, 24-way independent assignment enumeration proves each answer unique.')

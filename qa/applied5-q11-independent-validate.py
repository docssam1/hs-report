#!/usr/bin/env python3
"""Independent source and distance-table calculation checks for Applied 5 Q11."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text());REVIEW=json.loads((WORK/'q11-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
assert REVIEW['sourceExam']['page']==2 and REVIEW['sourceAnswer']['page']==11
assert REVIEW['sourceAnswer']['teacherAnswer']==520 and REVIEW['sourceAnswer']['teacherUnknowns']==[140,70,190,120]
original=REVIEW['originalSolution'];x,y,z,w=original['segments'];assert (x,y,z,w)==(70,70,20,30)
assert [x+y,y,x+y+z+w,y+z+w]==original['unknowns'] and sum(original['unknowns'])==520
items=[q for q in DATA['items'] if q['sourceNo']==11]
assert len(items)==9 and len({tuple(q['verification']['parameters']['segments']) for q in items})==9
for q in items:
 p=q['verification']['parameters'];hx=p['tableGiven']['homeBakery'];hb=p['tableGiven']['homeBookstore'];bb=p['tableGiven']['bakeryBookstore'];fb=p['tableGiven']['flowerBookstore'];fs=p['tableGiven']['flowerSchool'];bs=p['tableGiven']['bookstoreSchool']
 # Enumerate possible positive y,z pairs from the two independent table totals.
 candidates=[(yy,zz) for yy in range(1,501) for zz in range(1,501) if yy+zz==bb and zz==fb]
 assert len(candidates)==1
 yy,zz=candidates[0];xx=hx;ww=bs
 assert xx+yy+zz==hb and zz+ww==fs
 unknowns=[xx+yy,yy,xx+yy+zz+ww,yy+zz+ww]
 assert unknowns==p['unknowns'] and sum(unknowns)==p['answer']==int(q['answer'])
 assert q['answerParts']==[p['answer']] and len(q['solutionSteps'])==3
 assert q['area']=='수와 식' and q['pointBand']=='2.7'
 svg=(ROOT/'bank'/q['asset']['src']).read_text()
 assert svg.count('<rect x=')==15
 for v in (hx,bb,fb,hb,fs,bs):assert f'>{v}<' in svg
 assert all(t in svg for t in ['집','제과점','꽃집','서점','학교','가','나','다','라'])
assert DATA['version'].endswith('q08-q09-q11-q12-q14-q15-q16-r11') and len(DATA['items'])==162
(WORK/'q11-independent-math.json').write_text(json.dumps({'suite':Path(__file__).name,'dataSha256':sha(ROOT/'bank/data/applied5-expanded.json'),'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceAnswer':520,'originalUnknowns':[140,70,190,120],'variantCount':9,'uniqueParameterSets':True,'independentTableElimination':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied5 Q11: source table/answer, original sum 520, 9 distinct distance sets, unique positive-segment elimination, SVG table cells and solutions.')

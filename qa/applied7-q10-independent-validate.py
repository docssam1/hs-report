#!/usr/bin/env python3
"""Independently verify Applied 7 Q10 repeated-product remainder variants."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());REVIEW=json.loads((WORK/'q10-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '5로 나누었을 때 나머지' in t
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceAnswer']['teacherMarkedAnswer']==3
assert pow(8,97,5)==3
items=[x for x in DATA['items'] if x['sourceNo']==10];proof=[];assert len(items)==9
for i,x in enumerate(items,1):
 p=x['verification']['parameters'];n=p['factorCount'];r=1
 for _ in range(n):r=(r*p['base'])%p['divisor']
 assert x['id']==f'applied7-q10-v{i}' and x['variantNo']==i and x['area']=='수와 식' and x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 assert p['base']==8 and p['divisor']==5 and r==pow(8,n,5)==p['answerRemainder']==x['answerParts'][0]
 assert x['answer']==str(r) and p['factorCountRemainder']==n%4
 proof.append({'id':x['id'],'factors':n,'countRemainderMod4':n%4,'answerRemainder':r})
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':10,'teacherAnswer':3,'teacherAnswerIndependentlyRecomputed':3,'directExamAndAnswerPageImagesCompared':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allRemaindersRepeatedlyCalculated':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q10-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q10: source answer 3; 9 repeated products independently reduced modulo 5; new types 0')

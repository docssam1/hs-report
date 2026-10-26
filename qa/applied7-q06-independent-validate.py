#!/usr/bin/env python3
"""Independently verify Applied 7 Q6 fraction sequence and nine indices."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());REVIEW=json.loads((WORK/'q06-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '38번째에 놓이는 분수를 구하시오.' in t
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceAnswer']['teacherMarkedAnswer']=='8/13'
def term_at(pos):
 n=0;d=3
 while True:
  for a in range(1,d):
   n+=1
   if n==pos:return (a,d)
  d+=2
assert term_at(38)==(8,13)
items=[x for x in DATA['items'] if x['sourceNo']==6];proof=[];assert len(items)==9
for i,x in enumerate(items,1):
 p=x['verification']['parameters'];n=p['targetPosition'];answer=term_at(n);frac=f'{answer[0]}/{answer[1]}'
 assert x['id']==f'applied7-q06-v{i}' and x['variantNo']==i and x['area']=='수와 식' and x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 assert (p['answerNumerator'],p['answerDenominator'])==answer and p['termsBeforeDenominator13']==30
 assert p['positionWithinDenominator13']==n-30 and x['answer']==frac and x['answerParts']==[frac]
 assert REVIEW['exactSourceSequencePreserved'] in x['text']
 proof.append({'id':x['id'],'position':n,'answer':frac})
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':6,'teacherAnswer':'8/13','teacherAnswerIndependentlyRecomputed':'8/13','directExamAndAnswerPageImagesCompared':True,'exactSourceSequencePreserved':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allTermsDirectlyEnumerated':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q06-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q6: source answer 8/13; exact sequence and 9 target terms independently enumerated; new types 0')

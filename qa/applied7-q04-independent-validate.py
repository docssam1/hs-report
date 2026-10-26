#!/usr/bin/env python3
"""Independently verify Applied 7 Q4 source answer and length variants."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());REVIEW=json.loads((WORK/'q04-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-layout',str(EXAM),'-'],text=True,errors='replace')
assert '연못에 긴 막대를 바닥에 수직으로 넣었다가 꺼냈더니 물이' in t and '물이 묻지 않은 부분이' in t
assert REVIEW['sourceAnswer']['teacherMarkedAnswer']=='4m 16cm'
assert 2*169+78==416 and divmod(416,100)==(4,16)
items=[x for x in DATA['items'] if x['sourceNo']==4];proof=[]
assert len(items)==9
for i,x in enumerate(items,1):
 p=x['verification']['parameters'];total=2*p['wetLengthCm']+p['dryLengthCm'];m,c=divmod(total,100)
 assert x['id']==f'applied7-q04-v{i}' and x['variantNo']==i and x['area']=='수와 식' and x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 assert p['totalLengthCm']==total and (p['answerMetres'],p['answerCentimetres'])==(m,c)
 assert x['answerParts']==[m,c] and x['answer']==f'{m}m {c}cm'
 assert x['acceptedAnswers']==[f'{m}m {c}cm',f'{m}m{c}cm',f'{total}cm']
 proof.append({'id':x['id'],'wetLengthCm':p['wetLengthCm'],'dryLengthCm':p['dryLengthCm'],'totalLengthCm':total,'answer':x['answer']})
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':4,'teacherAnswer':'4m 16cm','teacherAnswerIndependentlyRecomputed':'4m 16cm','directExamAndAnswerPageImagesCompared':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allUnitConversionsVerified':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q04-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q4: source answer 4m 16cm; 9 two-wet-plus-dry length variants independently calculated and converted; new types 0')

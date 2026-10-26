#!/usr/bin/env python3
"""Independently verify Applied 7 Q2 source answer and nine same-type variants."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text()); REVIEW=json.loads((WORK/'q02-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
text=subprocess.check_output([str(PDFTOTEXT),'-layout',str(EXAM),'-'],text=True,errors='replace')
assert '사탕 27개를 민호, 선아, 연우 세 사람이 나누어 가지려고' in text and '적은 개수는 몇 개입니까?' in text
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceTypeAlreadyPresent']
assert REVIEW['sourceAnswer']['teacherMarkedAnswer']==11
possible=[27-2*x for x in range(1,27) if 27-2*x>x]
assert min(possible)==11
items=[x for x in DATA['items'] if x['sourceNo']==2]
assert len(items)==9 and len({x['text'] for x in items})==9
proof=[]
for i,x in enumerate(items,1):
 p=x['verification']['parameters'];n=p['total'];xs=[v for v in range(1,n) if n-2*v>v];answer=min(n-2*v for v in xs)
 assert x['variantNo']==i and x['id']==f'applied7-q02-v{i}' and x['area']=='경우의 수' and x['pointBand']=='2.7'
 assert x['difficultyEvidence']['label']=='하' and answer==p['minimumLargerShare']
 assert x['answerParts']==[answer] and x['answer']==str(answer) and x['acceptedAnswers']==[str(answer),f'{answer}개']
 assert 2*p['equalShare']+answer==n and answer>p['equalShare']
 assert n-2*(p['equalShare']+1)<=p['equalShare']+1
 proof.append({'id':x['id'],'total':n,'equalShare':p['equalShare'],'minimumLargerShare':answer,'nextEqualShareRemainder':n-2*(p['equalShare']+1)})
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':2,'teacherAnswer':11,'teacherAnswerIndependentlyRecomputed':11,'directExamAndAnswerPageImagesCompared':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allMinimumAnswersUniquelyChecked':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q02-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q2: source/answer pages match; teacher answer 11; all 9 minimum distributions independently enumerated; new types 0')

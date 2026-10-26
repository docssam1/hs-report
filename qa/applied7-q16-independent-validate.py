#!/usr/bin/env python3
"""Independent exact-decimal audit for Applied 7 Q16 zero-count variants."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q16-source-answer-review.json').read_text());EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf');PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '아래를 계산한 식에서 0의 개수를 구하세요.' in t
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceAnswer']['teacherMarkedAnswer']==0
assert REVIEW['sourceAnswerIndependentCheck']['result']==0 and REVIEW['newSourceTypesAdded']==0
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30] and DATA['itemCount']==234 and INDEX['itemCount']==234
ks=[10,11,12,20,101,100,1001,10001,100001]
items=[x for x in DATA['items'] if x['sourceNo']==16];assert len(items)==9
proof=[]
for v,(x,k) in enumerate(zip(items,ks),1):
 p=x['verification']['parameters'];assert p['targetInteger']==k and p['termCount']==10
 # Exact integer arithmetic in units of 10^-10, independent of the builder's closed form.
 scaled=sum(k*10**10-5*10**(10-j) for j in range(1,11))
 decimal=f'{scaled//10**10}.{scaled%10**10:010d}'
 zeros=decimal.count('0')
 assert decimal==f'{10*k-1}.4444444445'
 assert x['id']==f'applied7-q16-v{v}' and x['variantNo']==v
 assert x['answerParts']==[zeros] and x['answer']==str(zeros)==str(p['integerZeroCount'])
 assert x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 assert x['verification']['sourceExamPage']==3 and x['verification']['sourceAnswerPage']==3
 proof.append({'id':x['id'],'targetInteger':k,'exactSum':decimal,'zeroCount':zeros})
assert len(proof)==9
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':16,'teacherAnswer':0,'teacherAnswerIndependentlyRecomputed':0,'directExamAndAnswerPageImagesCompared':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allSumsRecomputedAsScaledIntegers':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q16-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q16: source answer 0; 9 decimal sums recomputed exactly as scaled integers; new types 0')

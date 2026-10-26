#!/usr/bin/env python3
"""Independent source, figure, and maximum-region audit for Applied 7 Q12."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q12-source-answer-review.json').read_text());EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf');ASSET=ROOT/'bank/assets/applied7/q12-blank-circle-original.png';PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '원 안에 선분 6개를 그어 원을 가장 많게 나누려고 합니다.' in t
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceAnswer']['teacherMarkedAnswer']==22
assert REVIEW['sourceAnswerIndependentCheck']['result']==22 and REVIEW['newSourceTypesAdded']==0
assert ASSET.is_file() and sha(ASSET)==REVIEW['sourceDrawing']['sha256']
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30] and DATA['itemCount']==234 and INDEX['itemCount']==234
items=[x for x in DATA['items'] if x['sourceNo']==12]; assert len(items)==9
proof=[]
for v,x in enumerate(items,1):
 n=x['verification']['parameters']['segments']; expected=1+n+n*(n-1)//2
 inc=0; running=1
 for k in range(n):
  add=k+1;inc+=add;running+=add
 assert x['variantNo']==v and x['id']==f'applied7-q12-v{v}' and n==v+6
 assert x['answerParts']==[expected]==[running] and x['answer']==str(expected)
 assert x['asset']['src']=='assets/applied7/q12-blank-circle-original.png'
 assert x['verification']['sourceDrawingCompared'] and x['verification']['variantUsesSourceDrawing']
 assert x['area']=='도형' and x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 proof.append({'id':x['id'],'segments':n,'answer':expected,'incrementalParts':running})
assert len({p['answer'] for p in proof})==9
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':12,'teacherAnswer':22,'teacherAnswerIndependentlyRecomputed':22,'directExamAndAnswerPageImagesCompared':True,'sourceDrawingCropSha256':sha(ASSET),'sourceDrawingUnchangedAndReused':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allMaximumRegionCountsIndependentlySummed':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q12-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q12: source answer 22; exact blank-circle figure reused; 9 maximum-region variants independently summed; new types 0')

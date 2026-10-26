#!/usr/bin/env python3
"""Independent point-system audit for existing Applied 7 Q27."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q27-source-answer-review.json').read_text());EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf');PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-f','6','-l','6','-layout',str(EXAM),'-'],text=True,errors='replace')
assert '각각 10개의 바둑돌을 뽑아 보니' in t and '220 : 340' in t
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceAnswer']['teacherMarkedAnswer']=={'whitePoints':50,'blackPoints':10}
assert 7*10+3*50==220 and 4*10+6*50==340 and REVIEW['newSourceTypesAdded']==0
items=[x for x in DATA['items'] if x['sourceNo']==27];assert len(items)==9;proof=[]
for v,x in enumerate(items,1):
 p=x['verification']['parameters'];gb=p['gyeongminBlack'];gw=p['gyeongminWhite'];jb=p['jeonghwaBlack'];jw=p['jeonghwaWhite'];B=p['blackPoints'];W=p['whitePoints'];tg=p['gyeongminTotal'];tj=p['jeonghwaTotal']
 assert x['id']==f'applied7-q27-v{v}' and gb+gw==jb+jw==10
 assert gb==2*jw-p['blackCountDifference'] and jb==gw+p['jeonghwaBlackExcess']
 assert gb*B+gw*W==tg and jb*B+jw*W==tj
 candidates=[(b,w) for b in range(1,100) for w in range(1,200) if gb*b+gw*w==tg and jb*b+jw*w==tj]
 assert candidates==[(B,W)] and p['determinant']==gb*jw-jb*gw!=0
 assert x['answerParts']==[W,B] and x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상'
 proof.append({'id':x['id'],'counts':[gb,gw,jb,jw],'totals':[tg,tj],'uniquePointPair':candidates[0]})
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30] and DATA['itemCount']==234 and INDEX['itemCount']==234
assert len(DATA['pendingSourceNos'])==4
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':27,'teacherAnswer':{'whitePoints':50,'blackPoints':10},'teacherAnswerIndependentlyRecomputed':True,'directExamAndAnswerPageImagesCompared':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allPointPairsUniquelySolved':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q27-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q27: source scores yield white 50/black 10; 9 point systems have unique integer solutions; new types 0')

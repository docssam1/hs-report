#!/usr/bin/env python3
"""Independent set-count audit for the existing Applied 7 Q22 type."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q22-source-answer-review.json').read_text());EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf');PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
t=subprocess.check_output([str(PDFTOTEXT),'-f','5','-l','5','-layout',str(EXAM),'-'],text=True,errors='replace')
assert all(z in t for z in ['32명','28명','26명'])
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceAnswer']['teacherMarkedAnswer']==15
assert REVIEW['newSourceTypesAdded']==0 and REVIEW['sourceAnswerIndependentCheck']['result']==15
items=[x for x in DATA['items'] if x['sourceNo']==22];assert len(items)==9
proof=[]
for v,x in enumerate(items,1):
 p=x['verification']['parameters'];g3=p['grade3'];g4=p['grade4'];other=p['otherGrades']
 not3=p['notGrade3'];not4=p['notGrade4'];combined=p['grade3And4Combined']
 candidates=[(a,b,c) for a in range(0,not4+1) for b in range(0,not3+1) for c in range(0,min(not3,not4)+1) if b+c==not3 and a+c==not4 and a+b==combined]
 assert x['id']==f'applied7-q22-v{v}' and x['variantNo']==v
 assert (g3,g4,other) in candidates and candidates==[(g3,g4,other)]
 assert not3==g4+other and not4==g3+other and combined==g3+g4
 total=(not3+not4+combined)//2
 answer=total-not4
 assert (not3+not4+combined)%2==0 and total==g3+g4+other and answer==g4==x['answerParts'][0]
 assert x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상'
 proof.append({'id':x['id'],'grade3':g3,'grade4':g4,'otherGrades':other,'notGrade3':not3,'notGrade4':not4,'combined':combined,'uniqueGradeCounts':candidates,'answer':answer})
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30] and DATA['itemCount']==234 and INDEX['itemCount']==234 and len(DATA['pendingSourceNos'])==4
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':22,'teacherAnswer':15,'teacherAnswerIndependentlyRecomputed':15,'directExamAndAnswerPageImagesCompared':True,'newSourceTypesAdded':0,'variants':proof,'variantCount':9,'allGradePartitionsUniquelyEnumerated':True,'allVariantsUseExistingSourceType':True,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q22-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q22: source answer 15; 9 grade partitions uniquely enumerated; new types 0')

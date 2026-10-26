#!/usr/bin/env python3
"""Independently enumerate Applied 7 Q25's diagonal number arrangement."""
import hashlib, json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text())
INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q25-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
ASSET=ROOT/'bank/assets/applied7/q25-number-arrangement-original.png'
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
exam_text=subprocess.check_output([str(PDFTOTEXT),'-f','6','-l','6','-layout',str(EXAM),'-'],text=True,errors='replace')
answer_text=subprocess.check_output([str(PDFTOTEXT),'-f','6','-l','6','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '자연수를 아래와 같이 배열합니다.' in exam_text and '2009는 몇 번째 줄에 몇 번에 있습니까?' in exam_text
assert '자연수를 아래와 같이 배열합니다.' in answer_text and '2009는 몇 번째 줄에 몇 번에 있습니까?' in answer_text
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceTypeAlreadyPresent']
assert REVIEW['sourceAnswer']['teacherMarkedAnswer']==[8,56]
assert REVIEW['sourceDrawing']['sha256']==sha(ASSET)
assert REVIEW['newSourceTypesAdded']==0

# Independent direct placement enumeration by generating each diagonal in order.
max_target=max(x['verification']['parameters']['target'] for x in DATA['items'] if x['sourceNo']==25)
positions={};start=1;d=1
while start<=max_target:
    for k in range(1,d+1):
        if d%2:
            row,col=d-k+1,k
        else:
            row,col=k,d-k+1
        value=start+k-1
        positions[value]=(row,col,d,k)
    start+=d;d+=1
assert positions[2009]==(8,56,63,56)
items=[x for x in DATA['items'] if x['sourceNo']==25]
assert len(items)==9
proof=[]
for v,item in enumerate(items,1):
    p=item['verification']['parameters'];target=p['target']
    expected=positions[target]
    assert item['id']==f'applied7-q25-v{v}' and item['variantNo']==v
    assert (p['row'],p['column'],p['diagonal'],p['offset'])==expected
    assert item['answerParts']==[expected[0],expected[1]]
    assert item['asset']['src']=='assets/applied7/q25-number-arrangement-original.png'
    assert item['verification']['sourceDrawingCompared'] and item['verification']['variantUsesSourceDrawing']
    assert item['verification']['sourceDrawingAssetSha256']==sha(ASSET)
    assert item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상'
    proof.append({'id':item['id'],'target':target,'coordinates':expected[:2],'directEnumerated':True})

assert DATA['version'].endswith('q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['itemCount']==234 and INDEX['itemCount']==234
assert [x['sourceNo'] for x in INDEX['items']]==DATA['availableSourceNos']
assert len(DATA['pendingSourceNos'])==4
result={'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceQuestion':25,
        'teacherAnswer':[8,56],'teacherAnswerIndependentlyRecomputed':True,
        'directExamAndAnswerPageImagesCompared':True,'sourceDrawingSha256':sha(ASSET),
        'sourceDrawingReusedUnchanged':True,'newSourceTypesAdded':0,'variantCount':9,
        'variants':proof,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q25-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q25: source answer 2009 -> (8,56); 9 target numbers directly enumerated; exact original diagram reused; new source types 0')

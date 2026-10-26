#!/usr/bin/env python3
"""Verify Q14 against the original page images and enumerate the 18-position cycle."""
import hashlib,json,subprocess
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q14-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExamSha256'] and sha(ANSWER)==REVIEW['sourceAnswerSha256']
exam=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
ans=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '4000은 어느' in exam and '손가락으로' in exam and '4000은 어느' in ans
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded']==0
src=Image.open(ROOT/REVIEW['sourceFigureCrop']['renderFile']).convert('RGB');box=tuple(REVIEW['sourceFigureCrop']['pixelCrop']);actual=src.crop(box)
asset=Image.open(ROOT/'bank'/REVIEW['sourceFigureCrop']['asset']).convert('RGB')
assert actual.size==asset.size==(580,400) and ImageChops.difference(actual,asset).getbbox() is None
sequence=[('왼손','엄지'),('왼손','검지'),('왼손','중지'),('왼손','약지'),('왼손','소지'),('왼손','약지'),('왼손','중지'),('왼손','검지'),('왼손','엄지'),('오른손','엄지'),('오른손','검지'),('오른손','중지'),('오른손','약지'),('오른손','소지'),('오른손','약지'),('오른손','중지'),('오른손','검지'),('오른손','엄지')]
assert 4000%18==4 and sequence[3]==('왼손','약지') and REVIEW['sourceAnswer']['teacherMarkedAnswer']==['왼손','약지']
items=[x for x in DATA['items'] if x['sourceNo']==14];assert len(items)==9
proof=[]
for i,x in enumerate(items):
 p=x['verification']['parameters'];n=p['target'];r=n%18 or 18;answer=sequence[r-1]
 assert x['id']==f'applied7-q14-v{i+1}' and p['period']==18 and p['position']==r
 assert p['quotient']==n//18 and p['remainder']==n%18 and [p['hand'],p['finger']]==list(answer)
 assert x['answerParts']==list(answer) and x['answerContract']=='ordered-parts'
 assert x['asset']['src']=='assets/applied7/q14-hands-original.png' and x['verification']['variantUsesSourceDrawing']
 assert x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 proof.append({'id':x['id'],'target':n,'quotient':n//18,'remainder':n%18,'answer':list(answer),'directSequenceEnumeration':list(sequence)})
assert DATA['version'].endswith('q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['itemCount']==234==INDEX['itemCount'] and len(DATA['pendingSourceNos'])==4
assert [x['sourceNo'] for x in INDEX['items']]==DATA['availableSourceNos']
result={'sourceAnswer':['왼손','약지'],'directSourceAndAnswerPagesCompared':True,
        'exactSourceDiagramPixelsReused':True,'newSourceTypesAdded':0,'variantCount':9,'variants':proof,
        'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q14-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q14: source answer left ring finger; exact 580×400 source figure pixel crop reused; nine positions independently mapped; new types 0')

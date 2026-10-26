#!/usr/bin/env python3
"""Validate Q7 figure reuse and scale-preserving variants."""
import hashlib,json,subprocess
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q07-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExamSha256'] and sha(ANSWER)==REVIEW['sourceAnswerSha256']
exam=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(EXAM),'-'],text=True,errors='replace')
ans=subprocess.check_output([str(PDFTOTEXT),'-f','2','-l','2','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '12cm일 때' in exam and '가와 나의' in exam
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded']==0
assert REVIEW['sourceAnswer']['teacherMarkedAnswer']==[18,22]
src=Image.open(ROOT/REVIEW['sourceFigureCrop']['renderFile']).convert('RGB');crop=src.crop(tuple(REVIEW['sourceFigureCrop']['pixelCrop']))
asset=Image.open(ROOT/'bank'/REVIEW['sourceFigureCrop']['asset']).convert('RGB')
assert crop.size==asset.size==(480,460) and ImageChops.difference(crop,asset).getbbox() is None
items=[x for x in DATA['items'] if x['sourceNo']==7];assert len(items)==9;proof=[]
for i,x in enumerate(items):
 p=x['verification']['parameters'];u=p['shadedSquareSide'];a=18*u//12;b=22*u//12
 assert x['id']==f'applied7-q07-v{i+1}' and u%6==0
 assert a*12==18*u and b*12==22*u and x['answerParts']==[a,b]
 assert p['sideA']==a and p['sideB']==b and x['answerContract']=='ordered-parts'
 assert x['asset']['src']=='assets/applied7/q07-square-tiling-original.png' and x['verification']['variantUsesSourceDrawing']
 assert x['pointBand']=='2.7' and x['difficultyEvidence']['label']=='하'
 proof.append({'id':x['id'],'shadedSquareSide':u,'scaleFactor':f'{u}/12','answer':[a,b],
               'independentRatioEqualities':[a*12==18*u,b*12==22*u]})
assert DATA['version'].endswith('q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['itemCount']==234==INDEX['itemCount'] and len(DATA['pendingSourceNos'])==4
assert [x['sourceNo'] for x in INDEX['items']]==DATA['availableSourceNos']
result={'sourceTeacherAnswer':[18,22],'sourceFigurePixelExact':True,'newSourceTypesAdded':0,
        'variantCount':9,'variants':proof,'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q07-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q7: source answer (18,22) at shaded side 12; exact diagram pixels reused; nine lengths independently scaled; new types 0')

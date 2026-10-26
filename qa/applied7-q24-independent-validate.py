#!/usr/bin/env python3
"""Independently validate the existing Applied 7 Q24 overlapping-circle sum type."""
import hashlib,json,itertools,subprocess
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text());REVIEW=json.loads((WORK/'q24-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=WORK/'source-review/applied7-answer-candidate.pdf';PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
e=subprocess.check_output([str(PDFTOTEXT),'-f','5','-l','5','-layout',str(EXAM),'-'],text=True,errors='replace');a=subprocess.check_output([str(PDFTOTEXT),'-f','5','-l','5','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '1부터 9까지의 수를 한 번씩 사용하여' in e and 'a에 들어갈 수는 얼마입니까' in e and '원안의 수의 합이 11' in e
assert 'a에 들어갈 수는 얼마입니까' in a
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded']==0
source=Image.open(ROOT/'.private-work/hw-expansion-20261023/hw7/source-review/p5/exam-5.png').convert('RGBA').crop((965,1410,1610,1630));asset=Image.open(ROOT/'bank/assets/applied7/q24-five-circles-original.png').convert('RGBA')
assert source.size==asset.size and ImageChops.difference(source,asset).getbbox() is None
valid=[]
for vals in itertools.permutations([2,3,4,5,6,7]):
 x1,x2,aa,x3,x4,x5=vals
 if 8+x1==11 and x1+x2+1==11 and 1+aa+x3==11 and x3+x4+x5==11 and x5+9==11:valid.append(vals)
assert valid==[(3,7,6,4,5,2)] and REVIEW['sourceAnswer']['teacherMarkedAnswer']==6
items=[x for x in DATA['items'] if x['sourceNo']==24];assert len(items)==9
answers=[3,7,6,4,5,2,10,10,27]
for i,(item,answer) in enumerate(zip(items,answers),1):
 assert item['id']==f'applied7-q24-v{i}' and item['answer']==str(answer) and item['answerParts']==[answer]
 assert item['asset']['src']=='assets/applied7/q24-five-circles-original.png' and item['verification']['variantUsesSourceDrawing']
 assert item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상' and item['sourceNo']==24
 assert len(item['solutionSteps'])==4 and item['learningLocation'].startswith('활용 7회 · 원문 24번')
assert DATA['version'].endswith('q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['itemCount']==234==INDEX['itemCount'] and len(DATA['availableSourceNos'])==26 and len(DATA['pendingSourceNos'])==4
assert [x['sourceNo'] for x in INDEX['items']]==DATA['availableSourceNos']
print('PASS Applied7 Q24: exact source diagram pixels reused; 720 arrangements yield one solution and teacher answer a=6; 9 same-type queries independently checked; new source types 0.')

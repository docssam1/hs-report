#!/usr/bin/env python3
"""Independently validate the existing Applied 7 Q15 numbered-room route type."""
import hashlib,json,subprocess
from functools import lru_cache
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q15-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf';ANSWER=WORK/'source-review/applied7-answer-candidate.pdf'
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
ASSET=ROOT/'bank/assets/applied7/q15-honeycomb-original.png'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
exam=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(EXAM),'-'],text=True,errors='replace')
answer=subprocess.check_output([str(PDFTOTEXT),'-f','3','-l','3','-layout',str(ANSWER),'-'],text=True,errors='replace')
assert '1번 방에서 8번방으로 이동하랴고 합니다' in exam and '작은 번호' in exam and '이웃한 큰 번호 방' in exam
assert '개미가 1번 방에서 8번방으로 이동하랴고 합니다' in answer
src=Image.open(ROOT/'.private-work/hw-expansion-20261023/hw7/source-review/p3/exam-3.png').convert('RGBA').crop((1350,1670,1870,1930))
asset=Image.open(ASSET).convert('RGBA')
assert src.size==asset.size and ImageChops.difference(src,asset).getbbox() is None
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch'] and REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded']==0
ADJ={n:[m for m in (n+1,n+2) if m<=8] for n in range(1,9)}
def enum(a,b):
 out=[]
 def visit(path):
  u=path[-1]
  if u==b:out.append(path);return
  for v in ADJ[u]:
   if v<=b:visit(path+[v])
 visit([a]);return out
all_paths=enum(1,8);assert len(all_paths)==21 and REVIEW['sourceAnswer']['teacherMarkedAnswer']==21
items=[x for x in DATA['items'] if x['sourceNo']==15];assert len(items)==9
expected=[(2,),(3,),(4,),(5,),(6,),(7,),(2,5),(3,6),(4,7)]
for i,(item,req) in enumerate(zip(items,expected),1):
 assert item['id']==f'applied7-q15-v{i}' and item['verification']['parameters']['requiredRooms']==list(req)
 assert item['asset']['src']=='assets/applied7/q15-honeycomb-original.png' and item['verification']['variantUsesSourceDrawing'] is True
 matching=[p for p in all_paths if all(x in p for x in req)]
 assert int(item['answer'])==len(matching)==item['answerParts'][0]
 assert item['pointBand']=='3.4' and item['difficultyEvidence']['label']=='중'
 assert item['sourceNo']==15 and item['detailType']=='번호가 증가하는 이웃 방으로 이동하는 경로 수 구하기'
 assert len(item['solutionSteps'])>=3 and item['learningLocation'].startswith('활용 7회 · 원문 15번')
assert DATA['version'].endswith('q02-q03-q04-q05-q06-q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['itemCount']==234==INDEX['itemCount'] and len(DATA['availableSourceNos'])==26 and len(DATA['pendingSourceNos'])==4
assert [x['sourceNo'] for x in INDEX['items']]==DATA['availableSourceNos']
print('PASS Applied7 Q15: exact source diagram pixels reused; teacher answer 21 matches exhaustive paths; 9 checkpoint path variants independently enumerated; new source types 0.')

#!/usr/bin/env python3
"""Validate Q23's exact source image and independently count rotation-symmetric numbers."""
import itertools,json
from pathlib import Path
from PIL import Image,ImageChops
root=Path(__file__).resolve().parents[1];data=json.loads((root/'bank/data/applied7-expanded.json').read_text())
group=[x for x in data['items'] if x['sourceNo']==23];assert len(group)==9
mapping={'0':'0','1':'1','2':'2','5':'5','6':'9','8':'8','9':'6'};first='125689';other='0125689';middle='01258'
for x in group:
 n=x['verification']['parameters']['digitLength'];p=x['verification']['parameters'];valid=[]
 for lead in first:
  for tail in itertools.product(other,repeat=n//2-1):
   prefix=lead+''.join(tail)
   centers=middle if n%2 else ('',)
   for center in centers:
    number=prefix+center+''.join(mapping[d] for d in reversed(prefix))
    turned=''.join(mapping[d] for d in reversed(number))
    assert len(number)==n and number[0]!='0' and turned==number
    valid.append(number)
 formula=6*7**(n//2-1)*(5 if n%2 else 1)
 assert len(valid)==formula==int(x['answer'])==p['enumeratedCount']==p['formulaCount']
 assert x['asset']['src']=='assets/applied7/q23-digital-rotation-original.png' and x['verification']['sourceDrawingPresent'] and x['verification']['variantUsesSourceDrawing']
page=Image.open(root/'.private-work/hw-expansion-20261023/hw7/source-review/p5/exam-5.png').convert('RGB')
asset=Image.open(root/'bank/assets/applied7/q23-digital-rotation-original.png').convert('RGB')
assert ImageChops.difference(asset,page.crop((890,620,1580,815))).getbbox() is None
review=json.loads((root/'.private-work/hw-expansion-20261023/hw7/q23-source-answer-review.json').read_text())
assert review['sourceAndAnswerMatch'] and review['sourceTypeAlreadyPresent'] and review['newSourceTypesAdded']==0 and review['originalIndependentCheck']['formulaCount']==30
print('PASS Applied7 Q23: source answer 30; nine digit-length variants match independent rotation-choice counts; exact original diagram pixels reused; new types 0')

#!/usr/bin/env python3
"""Independently audit Applied 8 Q8 source diagram and distinct-score totals."""
from __future__ import annotations
import hashlib,json
from itertools import combinations_with_replacement
from pathlib import Path
from PIL import Image,ImageChops
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
EXAM=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf";ANSWER=WORK/"source-review/applied8-answer-drive-copy-q07.pdf"
D=json.loads((ROOT/"bank/data/applied8-expanded.json").read_text());I=json.loads((ROOT/"bank/data/applied8-expanded-index.json").read_text())
R=json.loads((WORK/"q08-source-answer-review.json").read_text());M=json.loads((WORK/"q08-independent-math.json").read_text())
VERSION="20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS=[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
CASES=[(2,5,8,4),(1,3,5,3),(2,4,6,5),(1,4,7,4),(1,5,9,3),(3,5,7,5),(3,6,9,4),(4,6,8,3),(5,7,9,5)]
norm=lambda t:"".join((t or "").split())
exam=PdfReader(str(EXAM)).pages[1].extract_text();answer=PdfReader(str(ANSWER)).pages[1].extract_text()
assert norm(exam)==norm(answer) and "과녁" in norm(exam) and "점수는모두몇가지" in norm(exam)
assert R["sourceExam"]["directVisualReview"] and R["sourceExam"]["sourceFigure"]=={"type":"three concentric scoring zones","inner":8,"middle":5,"outer":2,"arrows":4}
assert R["answerCandidate"]["containsAnswers"] is False and R["sourceIndependentAnswer"]==9 and M["sourceAnswer"]==9
assert D["version"]==I["version"]==VERSION and D["itemCount"]==I["itemCount"]==len(D["items"])==243
assert D["availableSourceNos"]==NOS and [x["sourceNo"] for x in I["items"]]==NOS
assert D["pendingSourceNos"]==I["pendingSourceNos"]==[n for n in range(1,31) if n not in NOS]
items=[x for x in D["items"] if x["sourceNo"]==8];assert len(items)==9
crop=ROOT/"bank/assets/applied8/q8-target-original.png";render=WORK/"q6-source-review/source-2.png"
expected=Image.open(render).crop((1010,430,1460,875));actual=Image.open(crop)
assert ImageChops.difference(expected.convert("RGB"),actual.convert("RGB")).getbbox() is None
for item,case in zip(items,CASES):
 outer,middle,inner,n=case;gap=middle-outer
 assert middle-outer==inner-middle and item["verification"]["parameters"]["arrowCount"]==n
 brute=sorted({sum(xs) for xs in combinations_with_replacement((outer,middle,inner),n)})
 formula=sorted({n*outer+gap*k for k in range(2*n+1)})
 assert brute==formula and len(brute)==2*n+1
 p=item["verification"]["parameters"]
 assert (p["outerScore"],p["middleScore"],p["innerScore"],p["scoreGap"])==(outer,middle,inner,gap)
 assert p["distinctTotals"]==p["formulaTotals"]==brute and p["answer"]==len(brute)
 assert item["answer"]==str(len(brute)) and item["answerParts"]==[len(brute)]
 assert item["pointBand"]=="2.7" and item["difficultyEvidence"]["label"]=="하"
 assert item["learningPoint"] and item["learningLocation"] and len(item["solutionSteps"])==3
 expected_asset="assets/applied8/q8-target-original.png" if item["variantNo"]==1 else f"assets/applied8/q8-target-v{item['variantNo']}.svg"
 assert item["asset"]["src"]==expected_asset
assert [x["distinctTotalCount"] for x in M["variants"]]==[9,7,11,9,7,11,9,7,11]
print("PASS Applied8 Q8: source p2 and blank answer copy compared; exact original target crop verified; all 9 distinct-total counts checked by exhaustive multiset enumeration and independent arithmetic formula; r27 inventory 243/27.")

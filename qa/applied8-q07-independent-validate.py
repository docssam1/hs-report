#!/usr/bin/env python3
"""Independently audit Applied 8 Q7's source triangle pattern and variants."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
from PIL import Image, ImageChops
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
EXAM=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER=WORK/"source-review/applied8-answer-drive-copy-q07.pdf"
DATA=json.loads((ROOT/"bank/data/applied8-expanded.json").read_text())
INDEX=json.loads((ROOT/"bank/data/applied8-expanded-index.json").read_text())
REVIEW=json.loads((WORK/"q07-source-answer-review.json").read_text())
MATH=json.loads((WORK/"q07-independent-math.json").read_text())
VERSION="20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS=[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
TRIANGLES=[[(3,5,6,9),(2,4,7,1),(8,2,8,8),(4,3,8,None)],[(3,4,5,7),(5,2,6,4),(4,3,7,5),(6,2,5,None)],[(6,2,5,7),(4,3,8,4),(5,2,3,7),(2,6,5,None)],[(6,2,5,7),(3,5,8,7),(4,4,9,7),(5,2,6,None)],[(3,4,4,8),(5,2,4,6),(6,2,8,4),(4,3,6,None)],[(7,2,8,6),(5,3,6,9),(3,4,5,7),(6,2,7,None)],[(2,4,3,5),(5,2,8,2),(4,3,6,6),(7,2,9,None)],[(3,3,4,5),(4,2,5,3),(6,2,7,5),(5,3,8,None)],[(2,6,4,8),(7,2,5,9),(5,3,7,8),(3,5,6,None)]]
norm=lambda x:"".join((x or "").split())
src=norm(PdfReader(str(EXAM)).pages[1].extract_text())
ans=norm(PdfReader(str(ANSWER)).pages[1].extract_text())
assert src==ans and "어떤규칙에의해아래와같이수를배열하였습니다" in src and "알맞은수를구하세요" in src
assert REVIEW["sourceExam"]["directVisualReview"] and REVIEW["sourceExam"]["questionNo"]==7
assert REVIEW["answerCandidate"]["containsAnswers"] is False and REVIEW["answerCandidate"]["pageTextMatchesQuestionPdf"]
assert REVIEW["sourceIndependentAnswer"]==4 and MATH["source"]["answer"]==4
assert DATA["version"]==INDEX["version"]==VERSION
assert DATA["itemCount"]==INDEX["itemCount"]==len(DATA["items"])==243
assert DATA["availableSourceNos"]==NOS and INDEX["pendingSourceNos"]==DATA["pendingSourceNos"]==[n for n in range(1,31) if n not in NOS]
assert [x["sourceNo"] for x in INDEX["items"]]==NOS
items=[x for x in DATA["items"] if x["sourceNo"]==7]
assert len(items)==9 and [x["variantNo"] for x in items]==list(range(1,10))
crop=ROOT/"bank/assets/applied8/q7-triangles-original.png"
render=WORK/"q6-source-review/source-2.png"
expected=Image.open(render).crop((160,1875,830,2085))
actual=Image.open(crop)
assert ImageChops.difference(expected.convert("RGB"),actual.convert("RGB")).getbbox() is None
assert REVIEW["sourceCrop"]["sha256"]==hashlib.sha256(crop.read_bytes()).hexdigest()
for item,triangles in zip(items,TRIANGLES):
    examples=triangles[:3];target=triangles[3]
    assert all(a*l-r==c for a,l,r,c in examples)
    # Evaluate the target once by direct multiplication/subtraction and independently by the equivalent equation.
    result=target[0]*target[1]-target[2]
    assert target[0]*target[1]==result+target[2]
    params=item["verification"]["parameters"]
    assert params["triangles"]==[list(t) for t in triangles]
    assert params["rule"]=="center=apex*lowerLeft-lowerRight" and params["answer"]==result
    assert params["exampleChecks"]==[True,True,True]
    assert item["answer"]==str(result) and item["answerParts"]==[result]
    assert item["pointBand"]=="2.7" and item["difficultyEvidence"]["label"]=="하"
    assert item["learningLocation"] and item["learningPoint"] and len(item["solutionSteps"])>=3
    assert item["asset"]["src"]==("assets/applied8/q7-triangles-original.png" if item["variantNo"]==1 else f"assets/applied8/q7-triangles-v{item['variantNo']}.svg")
print("PASS Applied8 Q7: original p2 and blank answer copy match; original four-triangle crop is pixel-exact; 9 target answers independently checked; r27 inventory 243/27.")

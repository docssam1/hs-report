#!/usr/bin/env python3
"""Independent source, concatenation-boundary, and r27 inventory audit for Q4."""
from __future__ import annotations

import json
from pathlib import Path

from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
EXAM=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER=WORK/"source-review/applied8-answer-drive-copy-q04.pdf"
DATA=json.loads((ROOT/"bank/data/applied8-expanded.json").read_text())
INDEX=json.loads((ROOT/"bank/data/applied8-expanded-index.json").read_text())
REVIEW=json.loads((WORK/"q04-source-answer-review.json").read_text())
MATH=json.loads((WORK/"q04-independent-math.json").read_text())
VERSION="20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
LENGTHS=[357,194,197,199,204,215,222,245,327]
NOS=[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]


def by_blocks(total_digits:int)->tuple[str,int]:
    remaining=total_digits-189
    assert remaining>0
    completed,offset=divmod(remaining,3)
    current=100+completed
    if offset==0:suffix=str(current-1)[-3:]
    elif offset==1:suffix=str(current-1)[-2:]+str(current)[0]
    else:suffix=str(current-1)[-1:]+str(current)[:2]
    return suffix,sum(map(int,suffix))


def literal(total_digits:int)->tuple[str,int]:
    s="";n=1
    while len(s)<total_digits:
        s+=str(n);n+=1
    return s[:total_digits][-3:],sum(map(int,s[:total_digits][-3:]))


exam_text=PdfReader(str(EXAM)).pages[0].extract_text() or ""
answer_text=PdfReader(str(ANSWER)).pages[0].extract_text() or ""
norm=lambda s:"".join(s.split())
assert norm(exam_text)==norm(answer_text)
assert "357" in norm(exam_text) and "마지막빈칸개에들어가는숫자" in norm(exam_text)
assert REVIEW["sourceExam"]["directVisualReview"] and REVIEW["sourceExam"]["sourceDrawingPresent"] is False
assert REVIEW["answerCandidate"]["containsAnswers"] is False and REVIEW["answerCandidate"]["pageTextMatchesQuestionPdf"]
assert DATA["version"]==INDEX["version"]==VERSION
assert DATA["itemCount"]==INDEX["itemCount"]==len(DATA["items"])==243
assert DATA["availableSourceNos"]==NOS
assert DATA["pendingSourceNos"]==[n for n in range(1,31) if n not in NOS]
assert [x["sourceNo"] for x in INDEX["items"]]==NOS
items=[x for x in DATA["items"] if x["sourceNo"]==4]
assert len(items)==9 and [x["variantNo"] for x in items]==list(range(1,10))
assert [x["verification"]["parameters"]["totalDigits"] for x in items]==LENGTHS
results=[]
for item,length in zip(items,LENGTHS):
    a=by_blocks(length);b=literal(length)
    assert a==b
    params=item["verification"]["parameters"]
    suffix=a[0];answer=a[1]
    assert params["lastThreeDigits"]==suffix and params["digitSum"]==answer
    assert item["answer"]==str(answer) and item["answerParts"]==[answer]
    assert item["pointBand"]=="2.7" and item["difficultyEvidence"]["label"]=="하"
    assert item["promptDataLines"]==["12345678910111213 … □ □ □"]
    assert not item.get("asset") and len(item["solutionSteps"])>=3
    assert item["learningPoint"] and item["learningLocation"]
    results.append({"totalDigits":length,"lastThreeDigits":suffix,"digitSum":answer})
assert results[0]=={"totalDigits":357,"lastThreeDigits":"155","digitSum":11}
assert MATH["source"]["digitSum"]==11
assert [(x["totalDigits"],x["lastThreeDigits"],x["digitSum"]) for x in MATH["variants"]]==[(x["totalDigits"],x["lastThreeDigits"],x["digitSum"]) for x in results[1:]]
print("PASS Applied8 Q4: source p1 and blank answer copy matched; 9 endpoints independently checked by block arithmetic and literal concatenation; r27 inventory 243/27.")

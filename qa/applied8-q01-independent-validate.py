#!/usr/bin/env python3
"""Independent cryptarithm/source audit for Applied 8 Q1."""
import itertools,json
from pathlib import Path
from pypdf import PdfReader
from PIL import Image,ImageChops
R=Path(__file__).resolve().parents[1];W=R/".private-work/hw-expansion-20261023/hw8"
EXAM=R/"materials/초등과정 대비 실전 모의고사활용 8회.pdf";ANSWER=W/"source-review/applied8-answer-drive-copy-q07.pdf"
D=json.loads((R/"bank/data/applied8-expanded.json").read_text());I=json.loads((R/"bank/data/applied8-expanded-index.json").read_text())
S=json.loads((W/"q01-source-answer-review.json").read_text());M=json.loads((W/"q01-independent-math.json").read_text())
CASES=[('T',8,'CST','-','T'),('S',5,'TSC','-','T'),('S',7,'CTS','-','T'),('S',8,'CST','-','T'),('S',9,'CST','-','C'),('C',3,'TCS','-','T'),('C',9,'CST','-','C'),('T',1,'TSC','-','T'),('T',9,'STC','+','T')]
def integer_enum(case):
    sym,k,order,op,target=case;out=[]
    for s,c,t in itertools.product(range(10),repeat=3):
        v={'S':s,'C':c,'T':t};n=11*s+11*c+10*k+v[sym];m=100*v[order[0]]+10*v[order[1]]+v[order[2]]
        lhs=11*s-11*c if op=='-' else 11*s+11*c
        if s and c and v[order[0]] and n==m and lhs==11*v[target]:out.append(v)
    return out
def column_enum(case):
    sym,k,order,op,target=case;out=[]
    for s,c,t in itertools.product(range(10),repeat=3):
        v={'S':s,'C':c,'T':t}
        if not s or not c or not v[order[0]]:continue
        ones=s+c+v[sym];r=ones%10;carry=ones//10
        tens=s+c+k+carry;q=tens%10;hundreds=tens//10
        if [hundreds,q,r]!=[v[x] for x in order]:continue
        diff=11*s-11*c if op=='-' else 11*s+11*c
        if diff==11*v[target]:out.append(v)
    return out
norm=lambda x:"".join((x or "").split())
ep=PdfReader(str(EXAM)).pages[0].extract_text();ap=PdfReader(str(ANSWER)).pages[0].extract_text()
assert norm(ep)==norm(ap) and "같은모양은같은숫자" in norm(ep) and S["answerCandidate"]["containsAnswers"] is False
assert S["sourceExam"]["directVisualReview"] and S["sourceIndependentAnswer"]==8
assert D["version"]==I["version"] and D["itemCount"]==I["itemCount"]==270 and D["availableSourceNos"]==list(range(1,31))
assert D["pendingSourceNos"]==I["pendingSourceNos"]==[]
assert len([x for x in D["items"] if x["sourceNo"]==1])==9 and len(I["items"])==30
crop=R/"bank/assets/applied8/q1-shape-arithmetic-original.png";render=W/"q1-source-review/original-1.png"
assert ImageChops.difference(Image.open(crop).convert("RGB"),Image.open(render).crop((210,755,760,990)).convert("RGB")).getbbox() is None
items=sorted((x for x in D["items"] if x["sourceNo"]==1),key=lambda x:x["variantNo"])
for item,case,record in zip(items,CASES,M["cases"]):
    a=integer_enum(case);b=column_enum(case);assert len(a)==len(b)==1 and a==b
    assert record["case"]==list(case) and record["uniqueSolution"]==a[0] and record["answer"]==a[0]["T"]
    assert item["answer"]==str(a[0]["T"]) and item["verification"]["parameters"]["uniqueSolution"]==a[0]
    assert item["pointBand"]=="2.7" and item["difficultyEvidence"]["label"]=="하" and len(item["solutionSteps"])==3
    if item["variantNo"]>1:assert item["asset"]["src"].endswith(f"v{item['variantNo']}-r2.svg")
print("PASS Applied8 Q1: original equation crop, nine unique assignments and column-carry checks; current inventory 270/30.")

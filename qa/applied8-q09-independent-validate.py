#!/usr/bin/env python3
"""Independently audit Applied 8 Q9 source and rectangle counts."""
import json
from pathlib import Path
from pypdf import PdfReader
from PIL import Image,ImageChops

R=Path(__file__).resolve().parents[1];W=R/".private-work/hw-expansion-20261023/hw8"
EXAM=R/"materials/초등과정 대비 실전 모의고사활용 8회.pdf"
ANSWER=W/"source-review/applied8-answer-drive-copy-q07.pdf"
D=json.loads((R/"bank/data/applied8-expanded.json").read_text());I=json.loads((R/"bank/data/applied8-expanded-index.json").read_text())
S=json.loads((W/"q09-source-answer-review.json").read_text());M=json.loads((W/"q09-independent-math.json").read_text())
VERSION="20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS=[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
SHAPE=[(0,0),(0,1),(1,0),(1,1),(1,2),(2,0),(2,1),(2,2)]
CASES=[(SHAPE,(1,1)),(SHAPE,(0,0)),(SHAPE,(0,1)),(SHAPE,(1,0)),(SHAPE,(1,2)),(SHAPE,(2,0)),(SHAPE,(2,1)),(SHAPE,(2,2)),([(r,c) for r in range(3) for c in range(3)],(1,1))]
def enumerate_blocks(cells,star):
    cells=set(map(tuple,cells));mr=max(r for r,c in cells);mc=max(c for r,c in cells);blocks=[]
    for r0 in range(mr+1):
      for r1 in range(r0,mr+1):
       for c0 in range(mc+1):
        for c1 in range(c0,mc+1):
         b={(r,c) for r in range(r0,r1+1) for c in range(c0,c1+1)}
         if b<=cells:blocks.append((r0,r1,c0,c1,star in b))
    return blocks
def independent_boundary_count(cells,star):
    # For each vertical span, derive contiguous valid width segment per row; then intersect.
    cells=set(map(tuple,cells));mr=max(r for r,c in cells);mc=max(c for r,c in cells);total=avoid=0
    for r0 in range(mr+1):
     for r1 in range(r0,mr+1):
      common=set(range(mc+1))
      for r in range(r0,r1+1):common &= {c for rr,c in cells if rr==r}
      ordered=sorted(common)
      for a,c0 in enumerate(ordered):
       for c1 in ordered[a:]:
        if list(range(c0,c1+1))==ordered[a:ordered.index(c1)+1]:
         total+=1
         if not (r0<=star[0]<=r1 and c0<=star[1]<=c1):avoid+=1
    return total,avoid
norm=lambda x:"".join((x or "").split())
ep=PdfReader(str(EXAM)).pages[1];ap=PdfReader(str(ANSWER)).pages[1]
assert norm(ep.extract_text())==norm(ap.extract_text()) and "별모양을포함하지않는직사각형" in norm(ep.extract_text())
assert D["version"]==I["version"]==VERSION and D["itemCount"]==I["itemCount"]==243 and D["availableSourceNos"]==NOS
assert D["pendingSourceNos"]==I["pendingSourceNos"]==[n for n in range(1,31) if n not in NOS]
assert S["sourceExam"]["sourceFigure"]=={"shape":"3x3 grid missing top-right cell","cells":8,"starCell":[1,1]}
assert S["answerCandidate"]["containsAnswers"] is False and S["sourceIndependentAnswer"]==15
assert len([x for x in D["items"] if x["sourceNo"]==9])==9 and len(I["items"])==27
crop=R/"bank/assets/applied8/q9-rectangles-original.png";render=W/"q6-source-review/source-2.png"
assert ImageChops.difference(Image.open(crop).convert("RGB"),Image.open(render).crop((995,1517,1338,1748)).convert("RGB")).getbbox() is None
items=sorted((x for x in D["items"] if x["sourceNo"]==9),key=lambda x:x["variantNo"])
assert [x["answer"] for x in items]==["15","21","21","17","21","19","17","21","20"]
assert len(M["figures"])==9
for item,(cells,star),row in zip(items,CASES,M["figures"]):
    blocks=enumerate_blocks(cells,star);boundary=independent_boundary_count(cells,star)
    total=sum(1 for b in blocks);contain=sum(1 for b in blocks if b[-1]);avoid=total-contain
    assert boundary==(total,avoid)
    assert row["counts"]==[total,contain,avoid]
    p=item["verification"]["parameters"]
    assert p["totalRectangles"]==total and p["rectanglesContainingStar"]==contain and p["rectanglesExcludingStar"]==avoid
    assert item["answer"]==str(avoid) and item["answerParts"]==[avoid]
    assert item["area"]=="도형" and item["subarea"]=="평면도형의 개수" and item["pointBand"]=="2.7"
    assert item["difficultyEvidence"]["label"]=="하" and item["learningPoint"] and item["learningLocation"]
    assert len(item["solutionSteps"])==3
print("PASS Applied8 Q9: source p2 and blank answer duplicate compared; exact original crop confirmed; 9 rectangle counts validated by block enumeration and independent row-intersection boundary count; r27 inventory 243/27.")

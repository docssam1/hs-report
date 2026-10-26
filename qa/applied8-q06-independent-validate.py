#!/usr/bin/env python3
"""Independently audit source text and all coin-count solutions for Q6."""
from __future__ import annotations
import json
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
EXAM=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf";ANSWER=WORK/"source-review/applied8-answer-drive-copy-q06.pdf"
D=json.loads((ROOT/"bank/data/applied8-expanded.json").read_text());I=json.loads((ROOT/"bank/data/applied8-expanded-index.json").read_text())
R=json.loads((WORK/"q06-source-answer-review.json").read_text());M=json.loads((WORK/"q06-independent-math.json").read_text())
VERSION="20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27"
NOS=[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
COUNTS=[(1,5,13),(0,2,9),(0,7,4),(1,1,12),(1,8,6),(2,3,8),(2,6,3),(3,2,11),(3,7,5)]

def enumerate_solutions(N:int,V:int):
    return [(h,f,t) for h in range(N+1) for f in range(N-h+1) for t in [N-h-f] if 100*h+50*f+10*t==V]

norm=lambda t:"".join((t or "").split())
src=norm(PdfReader(str(EXAM)).pages[1].extract_text());ans=norm(PdfReader(str(ANSWER)).pages[1].extract_text())
assert src==ans and "동전" in src and "100,50,10" in src and "19" in src and "480" in src
assert R["sourceExam"]["directVisualReview"] and R["answerCandidate"]["containsAnswers"] is False and R["answerCandidate"]["pageTextMatchesQuestionPdf"]
assert D["version"]==I["version"]==VERSION and D["itemCount"]==I["itemCount"]==len(D["items"])==243
assert D["availableSourceNos"]==NOS and D["pendingSourceNos"]==[n for n in range(1,31) if n not in NOS]
assert [x["sourceNo"] for x in I["items"]]==NOS
items=[x for x in D["items"] if x["sourceNo"]==6];assert len(items)==9
for item,(h,f,t) in zip(items,COUNTS):
    N=h+f+t;V=100*h+50*f+10*t;solutions=enumerate_solutions(N,V)
    assert solutions==[(h,f,t)]
    assert 9*h+4*f==V//10-N
    p=item["verification"]["parameters"]
    assert (p["totalCoins"],p["totalWon"],p["hundredWonCoins"],p["fiftyWonCoins"],p["tenWonCoins"])==(N,V,h,f,t)
    assert p["allNonnegativeSolutions"]==[list(solutions[0])]
    assert item["answer"]==str(f) and item["answerParts"]==[f] and item["pointBand"]=="2.7"
    assert item["difficultyEvidence"]["label"]=="하" and len(item["solutionSteps"])>=3
    assert item["learningPoint"] and item["learningLocation"]
assert M["source"]["fiftyWonCoins"]==5 and len(M["variants"])==8
print("PASS Applied8 Q6: source p2 and blank answer copy match; all 9 coin systems have one nonnegative integer solution by reduced equation and exhaustive enumeration; r27 inventory 243/27.")

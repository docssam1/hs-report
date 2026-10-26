#!/usr/bin/env python3
"""Expand Applied 8 Q6's existing coin-count/value type to nine questions."""
from __future__ import annotations

import hashlib,json,shutil
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
SOURCE=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf"
SOURCE_ID="1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae"
ANSWER_IN=WORK/"source-review/applied8-answer-drive-copy-q05.pdf"
ANSWER=WORK/"source-review/applied8-answer-drive-copy-q06.pdf"
DATA=ROOT/"bank/data/applied8-expanded.json";INDEX=ROOT/"bank/data/applied8-expanded-index.json"
VERSION="20261025-applied8-expansion-q04-q05-q06-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r20"
# (100-won coins, 50-won coins, 10-won coins); first row is the source solution.
COUNTS=[(1,5,13),(0,2,9),(0,7,4),(1,1,12),(1,8,6),(2,3,8),(2,6,3),(3,2,11),(3,7,5)]

def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()

def solve(h:int,w:int,t:int)->dict:
    total=h+w+t;amount=100*h+50*w+10*t
    # Independent algebraic condition after eliminating the 10-won count.
    reduced=amount//10-total
    assert amount%10==0 and reduced==9*h+4*w
    candidates=[]
    for a in range(total+1):
        for b in range(total-a+1):
            c=total-a-b
            if 100*a+50*b+10*c==amount:candidates.append((a,b,c))
    assert candidates==[(h,w,t)]
    return {"totalCoins":total,"totalWon":amount,"hundredWonCoins":h,"fiftyWonCoins":w,
            "tenWonCoins":t,"reducedEquationRightSide":reduced,"allNonnegativeSolutions":[list(x) for x in candidates]}

def make_item(h:int,w:int,t:int,no:int)->dict:
    p=solve(h,w,t);N=p["totalCoins"];V=p["totalWon"]
    steps=[
        f"100원 동전 수를 □개, 50원 동전 수를 {w if no==1 else '△'}개, 10원 동전 수를 ○개라 두면 □+△+○={N}입니다.",
        f"금액을 10원 단위로 나타내면 10×□+5×△+○={V//10}입니다. 전체 동전 수 식을 빼면 9×□+4×△={p['reducedEquationRightSide']}입니다.",
        f"100원 동전 수 □를 0부터 가능한 범위까지 대입하면 조건을 만족하는 해는 (□,△,○)=({h},{w},{t}) 하나뿐입니다. 따라서 50원 동전은 {w}개입니다.",
    ]
    # Use neutral variables in explanations so the unknown is not revealed by naming its value.
    steps[0]=f"100원 동전 수를 □개, 50원 동전 수를 △개, 10원 동전 수를 ○개라 두면 □+△+○={N}입니다."
    return {"id":f"applied8-q06-v{no}","genId":"applied8-q06","sourceSet":"applied","sourceRound":8,
        "sourceNo":6,"variantNo":no,"reviewStatus":"verified","area":"수와 식","subarea":"화폐 단위와 식",
        "detailType":"세 종류 동전의 개수와 금액","pointBand":"2.7",
        "text":f"100원짜리, 50원짜리, 10원짜리 동전을 모두 합쳐 {N}개 가지고 있습니다. 동전의 금액의 합이 {V}원이라면, 50원짜리 동전은 몇 개 가지고 있었을까요?",
        "answer":str(w),"answerParts":[w],"answerLabels":["50원짜리 동전 수"],"acceptedAnswers":[str(w),f"{w}개",f"{w}개입니다"],
        "answerContract":"single-number","solutionSteps":steps,"solution":" ".join(steps),
        "learningPoint":"동전 수 식과 금액 식을 세우고, 단위 금액을 맞춰 연립 조건을 줄이기",
        "learningLocation":"활용 8회 · 원문 6번 · 동전 개수와 금액의 관계",
        "verification":{"primaryMethod":"동전 개수의 합과 금액의 합을 두 식으로 세운 뒤 10원 동전 수를 소거한다.",
          "independentMethod":"전체 동전 수를 고정하고 100원·50원 동전 수를 전부 대입해 금액을 만족하는 비음수 정수해를 열거한다.",
          "parameters":p,"independentSuite":"qa/applied8-q06-independent-validate.py",
          "sourceExamPage":2,"sourceExamFile":SOURCE.name,"sourceExamDriveFileId":SOURCE_ID,
          "sourceAnswerPage":2,"sourceAnswerDriveFileId":"1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p",
          "sourceDrawingCompared":True,"sourceDrawingPresent":False,
          "officialAnswerStatus":"The available Drive answer-candidate page is a blank question-page copy with no marked answer. Original and variants were independently solved from the two count/value constraints.",
          "studentDifficultyMeasured":False},
        "difficultyEvidence":{"basis":"source-point-band","label":"하","sourceReasoningPreserved":True,"measuredVariantRate":None,
          "estimated":False,"rationale":"활용 8회 원문 6번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다."}}

def main()->None:
    shutil.copy2(ANSWER_IN,ANSWER)
    exam,answer=PdfReader(str(SOURCE)).pages[1],PdfReader(str(ANSWER)).pages[1]
    norm=lambda t:"".join((t or "").split())
    assert norm(exam.extract_text())==norm(answer.extract_text())
    src=norm(exam.extract_text());assert "동전" in src and "100,50,10" in src and "19" in src and "480" in src
    d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());assert not any(x["sourceNo"]==6 for x in d["items"])
    items=[make_item(*row,i) for i,row in enumerate(COUNTS,1)]
    assert len(items)==9 and items[0]["answer"]=="5"
    d["items"].extend(items);nos=sorted({x["sourceNo"] for x in d["items"]});d["availableSourceNos"]=nos
    d["pendingSourceNos"]=[n for n in range(1,31) if n not in nos];d["itemCount"]=len(d["items"]);d["version"]=VERSION;d["policy"]["newSourceTypes"]=0
    idx["items"].append({"sourceNo":6,"genId":"applied8-q06","area":"수와 식","subarea":"화폐 단위와 식","detailType":"세 종류 동전의 개수와 금액","pointBand":"2.7","reviewStatus":"verified","variantCount":9})
    idx["items"].sort(key=lambda x:x["sourceNo"]);idx["pendingSourceNos"]=d["pendingSourceNos"];idx["itemCount"]=d["itemCount"];idx["version"]=VERSION
    DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n");INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+"\n")
    rows=[solve(*x) for x in COUNTS]
    (WORK/"q06-source-answer-review.json").write_text(json.dumps({"sourceExam":{"file":SOURCE.name,"driveFileId":SOURCE_ID,"sha256":sha(SOURCE),"page":2,"questionNo":6,"directVisualReview":True,"stem":src,"sourceDrawingPresent":False},"answerCandidate":{"file":ANSWER.name,"driveFileId":"1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p","sha256":sha(ANSWER),"page":2,"directVisualReview":True,"containsAnswers":False,"pageTextMatchesQuestionPdf":True},"answerSourceConclusion":"The answer-candidate PDF page is a blank question copy, not a marked key.","sourceIndependentAnswer":5,"variantCount":9,"newSourceTypes":0,"difficulty":"2.7-point band only = low"},ensure_ascii=False,indent=2)+"\n")
    (WORK/"q06-independent-math.json").write_text(json.dumps({"algebra":"N=H+F+T and V/10=10H+5F+T, hence 9H+4F=V/10-N","independentMethod":"Enumerate all nonnegative H,F,T whose coin count is N and compare exact total value","source":rows[0],"variants":rows[1:]},ensure_ascii=False,indent=2)+"\n")
    print(f"PASS Q6: source answer=5; 9 unique nonnegative coin-count solutions; inventory={d['itemCount']}; types={len(nos)}; r20")

if __name__=="__main__":main()

#!/usr/bin/env python3
"""Independently verify Applied 7 Q1 source and nine perimeter variants."""
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image, ImageChops
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/".private-work/hw-expansion-20261023/hw7"
DATA=json.loads((ROOT/"bank/data/applied7-expanded.json").read_text())
INDEX=json.loads((ROOT/"bank/data/applied7-expanded-index.json").read_text())
REVIEW=json.loads((WORK/"q01-source-answer-review-r32.json").read_text())
PROOF=json.loads((WORK/"q01-independent-math-r32.json").read_text())
EXAM=ROOT/"materials/초등과정 대비 실전 모의고사활용 7회.pdf"
ANSWER=Path("/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf")
CASES=[(1,4),(1,5),(1,6),(2,5),(2,6),(2,7),(3,7),(3,8),(3,9)]

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

assert sha(EXAM)==REVIEW["sourceExam"]["sha256"]=="8ad35f2d0ce954cca4a4e633742ed79a7fbe37e2d9ed854f14b4a4d0a34aa1db"
assert sha(ANSWER)==REVIEW["sourceAnswer"]["sha256"]=="89404313c4c2760a4ae2818b88d9b84dc3a128549636f2b2261ecafa4da6a11b"
assert len(PdfReader(str(EXAM)).pages)>=1 and len(PdfReader(str(ANSWER)).pages)>=1
assert REVIEW["sourceExam"]["page"]==REVIEW["sourceAnswer"]["page"]==1
assert REVIEW["sourceExam"]["questionNumber"]==REVIEW["sourceAnswer"]["questionNumber"]==1
source_text=(WORK/"q01-source-page-1-vision.txt").read_text()
answer_text=(WORK/"q01-answer-page-1-vision.txt").read_text()
assert all(s in source_text for s in ("직사각형 가와 정사각형 나", "세 변의 길이의 합이 12cm", "4cm", "5cm", "3cm"))
assert "36" in answer_text and REVIEW["sourceAnswer"]["handwrittenAnswer"]==36
assert REVIEW["sourceAnswer"]["officialKeyStatus"].startswith("공식 답안표는 확인하지 않았다")
source_image=Image.open(WORK/"q01-source-page-1.png")
crop=source_image.crop((190,680,520,860))
stored=Image.open(WORK/"q01-source-figure-original-crop.png")
assert crop.size==stored.size and ImageChops.difference(crop,stored).getbbox() is None
assert REVIEW["sourceExam"]["figureCropPixelExact"]
assert REVIEW["sourceExam"]["given"]=={"trianglePerimeter":12,"labelledTriangleSides":[4,5],"exposedSquareSegment":3}
assert PROOF["independentlyReproducedSourceAnswer"]==36 and REVIEW["triangleSides"]==[4,5,3]
assert DATA["version"].endswith("r32") and DATA["itemCount"]==INDEX["itemCount"]==270
assert DATA["availableSourceNos"]==list(range(1,31)) and DATA["pendingSourceNos"]==INDEX["pendingSourceNos"]==[]
assert INDEX["items"][0]["sourceNo"]==1 and INDEX["items"][0]["variantCount"]==9
items=[x for x in DATA["items"] if x["sourceNo"]==1]
assert len(items)==9 and [x["variantNo"] for x in items]==list(range(1,10))
for item,(k,z) in zip(items,CASES):
    p,a,b,u=12*k,4*k,5*k,3*k
    side=u+z; answer=6*side
    assert a*a+u*u==b*b and p==a+b+u
    assert item["answerParts"]==[answer] and item["answer"]==str(answer)
    assert item["pointBand"]=="2.7" and item["difficultyEvidence"]["label"]=="하"
    assert item["area"]=="도형" and item["answerContract"]=="single-number"
    assert item["verification"]["parameters"]=={"trianglePerimeter":p,"knownTriangleSides":[a,b],"unknownTriangleSide":u,"exposedSquareSideSegment":z,"squareSide":side,"rectangleWidth":2*side,"rectanglePerimeter":answer,"geometryScale":k}
    assert item["asset"]["src"]==f"assets/applied7/q01-v{item['variantNo']}-r2.svg"
    xml=ET.parse(ROOT/"bank"/item["asset"]["src"])
    assert xml.getroot().tag.endswith("svg")
    assert item["practiceStorageVersion"]=="20261030-applied7-q01-geometry-r2"
assert DATA["items"][:9]==items
subprocess.run([sys.executable,str(ROOT/"qa/applied-q01-artwork-r2-validate.py")],check=True)
print("PASS Applied7 Q1: original source/answer and crop, nine geometrically exact revised variants, answers and preserved practice history.")

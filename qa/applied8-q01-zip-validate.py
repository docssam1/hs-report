#!/usr/bin/env python3
"""Validate Applied 8 Q1 actual ZIP, diagrams, solutions, and worksheet links."""
import base64,hashlib,json,re
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/".private-work/hw-expansion-20261023/hw8";O=W/"q1-output-qa-r1";Z=O/"applied8-q1.zip";E=O/"extracted";E.mkdir(parents=True,exist_ok=True)
EXPECT={"문제.pdf","답안과상세풀이.pdf","문제.html","답안과상세풀이.html","빠른정답.csv","문항목록.json","검수기록.json"}
with ZipFile(Z) as z:assert set(z.namelist())==EXPECT and z.testzip() is None;z.extractall(E)
D=json.loads((R/"bank/data/applied8-expanded.json").read_text());M=json.loads((E/"문항목록.json").read_text());Q=json.loads((E/"검수기록.json").read_text())
items=sorted((x for x in D["items"] if x["sourceNo"]==1),key=lambda x:x["variantNo"])
assert len(items)==M["count"]==Q["count"]==9 and [x["id"] for x in items]==[x["id"] for x in M["items"]]==Q["selectedIds"]
qh=(E/"문제.html").read_text();sh=(E/"답안과상세풀이.html").read_text();csv=(E/"빠른정답.csv").read_text()
assert len(re.findall(r'<article class="question',qh))==len(re.findall(r'<article class="solution',sh))==9
for x in items:
    assert x["text"] in qh and x["answer"] in sh and x["answer"] in csv
    assert all(t in sh for t in x["solutionSteps"]) and x["learningPoint"] in sh and x["learningLocation"] in sh
figs=re.findall(r'<div class="q-figure".*?<img src="data:image/([^;]+);base64,([^"]+)"',qh)
assert len(figs)==9 and figs[0][0]=="png"
assert hashlib.sha256(base64.b64decode(figs[0][1])).hexdigest()==hashlib.sha256((R/"bank/assets/applied8/q1-shape-arithmetic-original.png").read_bytes()).hexdigest()
assert all(fmt=="svg+xml" for fmt,_ in figs[1:])
for item,(fmt,encoded) in zip(items[1:],figs[1:]):
    assert hashlib.sha256(base64.b64decode(encoded)).hexdigest()==hashlib.sha256((R/"bank"/item["asset"]["src"]).read_bytes()).hexdigest()
B=json.loads((O/"browser-evidence.json").read_text());qp=PdfReader(str(E/"문제.pdf"));sp=PdfReader(str(E/"답안과상세풀이.pdf"))
assert B["sourceNo"]==1 and B["count"]==9 and len(qp.pages)==B["questionPdfPages"] and len(sp.pages)==B["solutionPdfPages"]
assert B["answerInputs"]==B["diagnosisLinks"]==B["learningLocationLinks"]==9 and B["columnOrder"]
assert B["mobile375NoOverflow"] and B["threeAttempts"] and B["firstPracticePreserved"] and B["externalWrites"]==[] and B["pageErrors"]==[]
assert B["questionOverflow"]==B["solutionOverflow"]==0
report={"passed":True,"zipBytes":Z.stat().st_size,"zipEntries":sorted(EXPECT),"questionPages":len(qp.pages),"solutionPages":len(sp.pages),"itemCount":9,"exactOriginalCrop":True,"allVariantImagesEmbedded":True,"answersAndLearningLinksIncluded":True,"browserChecks":True,"externalWrites":0,"zipSha256":hashlib.sha256(Z.read_bytes()).hexdigest()}
(O/"zip-evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print(f"PASS Applied8 Q1 ZIP: 7 files; nine questions and detailed solutions; {len(qp.pages)} question pages, {len(sp.pages)} solution pages; exact original crop and 8 vector variants included.")

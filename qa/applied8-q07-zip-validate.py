#!/usr/bin/env python3
"""Validate Q7's actual downloaded ZIP, selected IDs, answer and solution content."""
from __future__ import annotations
import base64,hashlib,json,re
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/".private-work/hw-expansion-20261023/hw8";OUT=WORK/"q7-output-qa-r1"
ZIP=OUT/"applied8-q7.zip";EXTRACT=OUT/"extracted";EXPECTED={"문제.pdf","답안과상세풀이.pdf","문제.html","답안과상세풀이.html","빠른정답.csv","문항목록.json","검수기록.json"};EXTRACT.mkdir(parents=True,exist_ok=True)
with ZipFile(ZIP) as z: assert set(z.namelist())==EXPECTED and z.testzip() is None; z.extractall(EXTRACT)
D=json.loads((ROOT/"bank/data/applied8-expanded.json").read_text());manifest=json.loads((EXTRACT/"문항목록.json").read_text());qa=json.loads((EXTRACT/"검수기록.json").read_text());items=[x for x in D["items"] if x["sourceNo"]==7]
assert len(items)==manifest["count"]==qa["count"]==9 and [x["id"] for x in items]==[x["id"] for x in manifest["items"]]==qa["selectedIds"]
q=(EXTRACT/"문제.html").read_text();s=(EXTRACT/"답안과상세풀이.html").read_text();csv=(EXTRACT/"빠른정답.csv").read_text()
assert len(re.findall(r'<article class="question',q))==9 and len(re.findall(r'<article class="solution',s))==9
for x in items:
 assert x["text"] in q and x["answer"] in s and x["answer"] in csv
 assert x["learningPoint"] in s and x["learningLocation"] in s and all(step in s for step in x["solutionSteps"])
figures=re.findall(r'<div class="q-figure".*?<img src="data:image/([^;]+);base64,([^"]+)"',q)
assert len(re.findall(r'<div class="q-figure"',q))==len(figures)==9
assert figures[0][0]=="png" and hashlib.sha256(base64.b64decode(figures[0][1])).hexdigest()==hashlib.sha256((ROOT/"bank/assets/applied8/q7-triangles-original.png").read_bytes()).hexdigest()
assert all(fmt=="svg+xml" for fmt,_ in figures[1:])
browser=json.loads((OUT/"browser-evidence.json").read_text());qp=PdfReader(str(EXTRACT/"문제.pdf"));sp=PdfReader(str(EXTRACT/"답안과상세풀이.pdf"))
assert browser["sourceNo"]==7 and browser["count"]==9 and len(qp.pages)==browser["questionPdfPages"] and len(sp.pages)==browser["solutionPdfPages"]
assert browser["answerInputs"]==browser["diagnosisLinks"]==browser["learningLocationLinks"]==9
assert browser["columnOrder"] and browser["mobile375NoOverflow"] and browser["threeAttempts"] and browser["firstPracticePreserved"]
assert browser["questionOverflow"]==browser["solutionOverflow"]==0 and browser["externalWrites"]==[] and browser["pageErrors"]==[]
report={"passed":True,"zipBytes":ZIP.stat().st_size,"zipEntries":sorted(EXPECTED),"questionPages":len(qp.pages),"solutionPages":len(sp.pages),"itemCount":9,"answersAndLearningLinksIncluded":True,"browserInputDiagnosisMobileChecks":True,"externalWrites":0,"zipSha256":hashlib.sha256(ZIP.read_bytes()).hexdigest()}
(OUT/"zip-evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print(f"PASS Applied8 Q7 ZIP: seven entries, nine questions and detailed solutions; {len(qp.pages)} question and {len(sp.pages)} solution pages; answers and learning links included.")

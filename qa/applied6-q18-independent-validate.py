#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify source-confirmed Applied 6 Q18 bounded-coin-count variants."""
import hashlib, json
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'; INDEX=ROOT/'bank/data/applied6-expanded-index.json'
BASE=ROOT/'.private-work/hw-expansion-20261023/hw6/q18-baseline-applied6-r13.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
REVIEW=ROOT/'.private-work/hw-expansion-20261023/hw6/q18-source-answer-review.json'
OUT=ROOT/'.private-work/hw-expansion-20261023/hw6/q18-independent-math.json'
d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());base=json.loads(BASE.read_text())
assert d['version']=='20261024-applied6-expansion-r15' and len(d['items'])==135
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19]
assert d['pendingSourceNos']==[n for n in base['pendingSourceNos'] if n not in (18,19)]
assert idx['version']==d['version'] and idx['itemCount']==135 and idx['pendingSourceNos']==d['pendingSourceNos']
assert [x for x in d['items'] if x['sourceNo'] not in (18,19)]==base['items']
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='54a5bf1489a9d537f9cc34e6db29609bc6384f8a18b666a40eb11561f912ea4c'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='b1ff5ad327fd669a56508bc1256be8743e809122f1e80b3af5f0731874939975'
qtext=PdfReader(str(SOURCE)).pages[2].extract_text() or ''
assert '310' in qtext and '100' in qtext and '50' in qtext and '10' in qtext

def enumerate_coin_counts(target):
 return [(a,b,c) for a in range(6) for b in range(6) for c in range(6) if 100*a+50*b+10*c==target]
source_combos=enumerate_coin_counts(310)
assert source_combos==[(1,4,1),(2,2,1),(3,0,1)] and len(source_combos)==3
review=json.loads(REVIEW.read_text())
assert review['sourceTeacherAnswer']==3 and review['directPageImagesCompared'] and review['sourceHasDrawing'] is False
assert review['questionPdfSha256']==hashlib.sha256(SOURCE.read_bytes()).hexdigest()
assert review['answerPdfSha256']==hashlib.sha256(ANSWER.read_bytes()).hexdigest()
proof=[];targets=set()
for x in [q for q in d['items'] if q['sourceNo']==18]:
 p=x['verification']['parameters'];target=p['targetAmount'];combinations=enumerate_coin_counts(target)
 assert p['denominations']==[100,50,10] and p['availablePerDenomination']==[5,5,5]
 assert p['combinationTriples']==[list(t) for t in combinations]
 assert p['combinationCount']==len(combinations)==x['answerParts'][0]
 assert x['answer']==str(len(combinations)) and x['acceptedAnswers']==[x['answer']]
 assert x['answerContract']=='ordered-parts' and x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 assert x['reviewStatus']=='verified' and x['verification']['sourceExamPage']==3 and x['verification']['sourceAnswerPage']==3
 assert x['verification']['sourceDrawingPresent'] is False and x['verification']['sourceDrawingCompared'] is False
 assert 1<=len(x['solutionSteps'])<=5 and all(str(triple) in x['solutionSteps'][1] for triple in combinations)
 assert target not in targets;targets.add(target)
 proof.append({'id':x['id'],'targetAmount':target,'all216BoundedTriplesScanned':True,'matchingTuples':combinations,'answer':len(combinations),'passed':True})
assert len(proof)==9 and len(targets)==9
OUT.write_text(json.dumps({'source':{'questionPage':3,'answerPage':3,'teacherAnswer':3,'matchingTuples':source_combos,'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'directPageImagesCompared':True},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'variants':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q18: source answer 3; all 9 bounded coin-combination variants match full 216-tuple enumeration')

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Independently verify the source-confirmed Applied 6 Q20 operation-rule type."""
import hashlib, json
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw6'
DATA=ROOT/'bank/data/applied6-expanded.json'; INDEX=ROOT/'bank/data/applied6-expanded-index.json'
BASE=WORK/'q20-baseline-applied6-r15.json'; SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=WORK/'source-answer-6.pdf'; REVIEW=WORK/'q20-source-answer-review.json'
ASSET=ROOT/'bank/assets/applied6/q20-examples-original.png'; OUT=WORK/'q20-independent-math.json'
hashfile=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
d=json.loads(DATA.read_text());ix=json.loads(INDEX.read_text());base=json.loads(BASE.read_text())
assert d['version']=='20261024-applied6-expansion-r16' and len(d['items'])==144
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20]
assert d['pendingSourceNos']==[n for n in base['data']['pendingSourceNos'] if n!=20]
assert ix['version']==d['version'] and ix['itemCount']==144 and ix['pendingSourceNos']==d['pendingSourceNos']
assert [x for x in d['items'] if x['sourceNo']!=20]==base['data']['items']
exam_text=PdfReader(str(SOURCE)).pages[3].extract_text() or ''
answer_text=PdfReader(str(ANSWER)).pages[3].extract_text() or ''
assert '84' in exam_text and '42' in exam_text and '규칙' in exam_text
assert '84' in answer_text and '42' in answer_text
source_examples=[(12,9,3),(11,3,2),(14,14,4),(14,7,3),(30,5,5),(12,30,6)]
assert all((a+b)//7==c and (a+b)%7==0 for a,b,c in source_examples)
assert 84+42==126 and 126//7==18 and 126%7==0
review=json.loads(REVIEW.read_text())
assert review['sourceTeacherAnswer']==18 and review['directPageImagesCompared'] and review['sourceExampleImagePreserved']
assert review['sourcePdfSha256']==hashfile(SOURCE) and review['answerPdfSha256']==hashfile(ANSWER)
assert review['originalExampleAssetSha256']==hashfile(ASSET)
pairs=[(70,35),(70,42),(84,49),(91,49),(98,49),(84,70),(91,70),(98,70),(84,91)]
items=[x for x in d['items'] if x['sourceNo']==20]
assert len(items)==9
proof=[]
for x,(a,b) in zip(items,pairs):
    total=a+b; q=total//7
    assert total%7==0
    assert x['text']==f'규칙을 찾아 {a}♠{b}를 구하세요.'
    assert x['answer']==str(q) and x['answerParts']==[q] and x['acceptedAnswers']==[str(q)]
    assert x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
    assert x['answerContract']=='ordered-parts' and x['reviewStatus']=='verified'
    assert x['verification']['sourceDrawingCompared'] and x['verification']['variantUsesSourceDrawing']
    assert x['asset']['src']=='assets/applied6/q20-examples-original.png'
    assert f'{a}+{b}={total}' in x['solutionSteps'][0] and f'{total}÷7={q}' in x['solutionSteps'][1]
    # Independent equation check: exactly one integer q satisfies 7q=a+b.
    candidates=[z for z in range(100) if 7*z==total]
    assert candidates==[q]
    proof.append({'id':x['id'],'target':[a,b],'sum':total,'quotient':q,'directCalculation':True,'equationUniqueness':[q],'passed':True})
source_ids=[x['id'] for x in base['data']['items'] if x['sourceNo']==20]
assert not source_ids
OUT.write_text(json.dumps({'source':{'questionPage':4,'answerPage':4,'sourceExamples':source_examples,'target':[84,42],'teacherAnswer':18,'questionPdfSha256':hashfile(SOURCE),'answerPdfSha256':hashfile(ANSWER),'directPageImagesCompared':True,'exampleAssetSha256':hashfile(ASSET)},'baselineDataSha256':hashlib.sha256(json.dumps(base['data'],ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),'dataSha256':hashfile(DATA),'variants':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q20: source six examples and teacher result agree with sum/7; nine source-type extensions pass direct arithmetic and unique quotient checks')

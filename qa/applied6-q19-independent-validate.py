#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify source-confirmed Applied 6 Q19 repeated-digit square variants."""
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json';INDEX=ROOT/'bank/data/applied6-expanded-index.json'
BASE=ROOT/'.private-work/hw-expansion-20261023/hw6/q19-baseline-applied6-r14.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
REVIEW=ROOT/'.private-work/hw-expansion-20261023/hw6/q19-source-answer-review.json'
OUT=ROOT/'.private-work/hw-expansion-20261023/hw6/q19-independent-math.json'
d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());base=json.loads(BASE.read_text())
assert d['version']=='20261024-applied6-expansion-r15' and len(d['items'])==135
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19]
assert d['pendingSourceNos']==[n for n in base['pendingSourceNos'] if n!=19]
assert idx['version']==d['version'] and idx['itemCount']==135 and idx['pendingSourceNos']==d['pendingSourceNos']
assert [x for x in d['items'] if x['sourceNo']!=19]==base['items']
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='54a5bf1489a9d537f9cc34e6db29609bc6384f8a18b666a40eb11561f912ea4c'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='b1ff5ad327fd669a56508bc1256be8743e809122f1e80b3af5f0731874939975'
source=PdfReader(str(SOURCE)).pages[3].extract_text() or ''
assert '3333333333' in source and '곱셈값' in source
teacher_num=int('3'*10);teacher_product=str(teacher_num**2)
assert teacher_product=='11111111108888888889'
source_evens=[int(c) for c in teacher_product if int(c)%2==0]
assert source_evens==[0]+[8]*9 and len(source_evens)==10
review=json.loads(REVIEW.read_text());assert review['sourceTeacherAnswer']==10 and review['directPageImagesCompared']
assert review['questionPdfSha256']==hashlib.sha256(SOURCE.read_bytes()).hexdigest() and review['answerPdfSha256']==hashlib.sha256(ANSWER.read_bytes()).hexdigest()
proof=[];lengths=set()
for x in [q for q in d['items'] if q['sourceNo']==19]:
 p=x['verification']['parameters'];n=p['repetitionLength'];number='3'*n;product=str(int(number)**2)
 even=[int(c) for c in product if int(c)%2==0]
 pattern='1'*(n-1)+'0'+'8'*(n-1)+'9'
 assert product==pattern and p['leftNumber']==number and p['rightNumber']==number and p['product']==product
 assert p['evenDigits']==even and p['evenDigitCount']==len(even)==n
 assert x['answer']==str(n) and x['answerParts']==[n] and x['acceptedAnswers']==[str(n)]
 assert x['answerContract']=='ordered-parts' and x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 assert x['reviewStatus']=='verified' and x['verification']['sourceExamPage']==4 and x['verification']['sourceAnswerPage']==4
 assert 0 in even and all(v%2==0 for v in even) and all(int(c)%2==1 for c in product if int(c)%2==1)
 assert product in x['solutionSteps'][1] and x['answerLabels']==['짝수인 자리 숫자의 개수']
 assert n not in lengths;lengths.add(n)
 proof.append({'id':x['id'],'repetitionLength':n,'exactSquare':product,'productPatternMatches':True,'evenDigits':even,'evenDigitCount':len(even),'passed':True})
assert len(proof)==9 and len(lengths)==9 and 10 not in lengths
# Independently check the identity over every length from 2 through 15, including the source length.
pattern_checks=[]
for n in range(2,16):
 x=int('3'*n);p=str(x*x);expected='1'*(n-1)+'0'+'8'*(n-1)+'9'
 assert p==expected
 pattern_checks.append({'length':n,'product':p,'evenCount':sum(int(c)%2==0 for c in p),'passed':True})
OUT.write_text(json.dumps({'source':{'questionPage':4,'answerPage':4,'sourceNumber':'3333333333','teacherProduct':teacher_product,'teacherAnswer':10,'evenDigits':source_evens,'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'directPageImagesCompared':True},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'variants':proof,'independentPatternChecks':pattern_checks,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q19: source product has 10 even digits; nine repeated-digit square variants match exact multiplication and pattern enumeration')

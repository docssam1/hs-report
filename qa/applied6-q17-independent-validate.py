#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify source-confirmed Applied 6 Q17 variants by formula and direct enumeration."""
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json';INDEX=ROOT/'bank/data/applied6-expanded-index.json'
BASE=ROOT/'.private-work/hw-expansion-20261023/hw6/q18-baseline-applied6-r13.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
REVIEW=ROOT/'.private-work/hw-expansion-20261023/hw6/q17-source-answer-review.json'
OUT=ROOT/'.private-work/hw-expansion-20261023/hw6/q17-independent-math.json'
d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());base=json.loads(BASE.read_text())
assert d['version']=='20261024-applied6-expansion-r15' and len(d['items'])==135
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19]
assert d['pendingSourceNos']==[n for n in base['pendingSourceNos'] if n not in (18,19)]
assert idx['version']==d['version'] and idx['itemCount']==135 and idx['pendingSourceNos']==d['pendingSourceNos']
assert [x for x in d['items'] if x['sourceNo'] not in (18,19)]==base['items']
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='54a5bf1489a9d537f9cc34e6db29609bc6384f8a18b666a40eb11561f912ea4c'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='b1ff5ad327fd669a56508bc1256be8743e809122f1e80b3af5f0731874939975'
source=PdfReader(str(SOURCE)).pages[2].extract_text() or ''
assert '연속하는 자연수' in source and '짝수만 더했' in source and '20' in source and '40' in source
def enum(low,high):
 rows=[]
 for n in range(1,1000):
  evens=[k for k in range(n,n+5) if k%2==0];total=sum(evens)
  if low<total<high:rows.append((n,evens,total))
 return rows
sourceRows=enum(20,40)
assert len(sourceRows)==8 and sum(n%2==1 for n,_,_ in sourceRows)==5 and sum(n%2==0 for n,_,_ in sourceRows)==3
proof=[]
for x in [q for q in d['items'] if q['sourceNo']==17]:
 p=x['verification']['parameters'];lo=p['lowerExclusive'];hi=p['upperExclusive']
 odd=[(n,evens,total) for n,evens,total in enum(lo,hi) if n%2==1];even=[(n,evens,total) for n,evens,total in enum(lo,hi) if n%2==0]
 oddFirst=[n for n,_,_ in odd];evenFirst=[n for n,_,_ in even];oddSums=[total for _,_,total in odd];evenSums=[total for _,_,total in even]
 assert p['oddFirstTerms']==oddFirst and p['evenFirstTerms']==evenFirst
 assert p['oddEvenSums']==oddSums and p['evenEvenSums']==evenSums
 assert p['oddStartCount']==len(odd) and p['evenStartCount']==len(even)
 count=len(odd)+len(even)
 assert x['answer']==str(count) and x['answerParts']==[count] and x['acceptedAnswers']==[str(count)]
 assert x['answerContract']=='ordered-parts' and x['pointBand']=='3.4' and x['difficultyEvidence']['label']=='중'
 assert x['reviewStatus']=='verified' and x['verification']['sourceExamPage']==3 and x['verification']['sourceAnswerPage']==3
 assert x['verification']['sourceDrawingPresent'] is False
 proof.append({'id':x['id'],'lowerExclusive':lo,'upperExclusive':hi,'oddFirstTerms':oddFirst,'oddEvenSums':oddSums,'evenFirstTerms':evenFirst,'evenEvenSums':evenSums,'oddStartCount':len(odd),'evenStartCount':len(even),'answer':count,'passed':True})
assert len(proof)==9
review=json.loads(REVIEW.read_text());assert review['directPageImageCompared'] is True and review['teacherAnswer'].startswith('8가지')
OUT.write_text(json.dumps({'source':{'questionPage':3,'answerPage':3,'sourceAnswer':8,'sourceOddStartCount':5,'sourceEvenStartCount':3,'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'directPageImageCompared':True},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'variants':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q17: original 8 cases and all 9 variants agree by parity formulas and direct sequence enumeration')

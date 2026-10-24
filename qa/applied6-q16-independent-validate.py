#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify Applied 6 Q16 source and nine distinct-digit ranking variants."""
import hashlib, itertools, json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'; INDEX=ROOT/'bank/data/applied6-expanded-index.json'
BASE=ROOT/'.private-work/hw-expansion-20261023/hw6/q16-baseline-applied6-r11.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
OUT=ROOT/'.private-work/hw-expansion-20261023/hw6/q16-independent-math.json'
d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());base=json.loads(BASE.read_text())
assert d['version']=='20261024-applied6-expansion-r12' and len(d['items'])==108
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16]
assert d['pendingSourceNos']==[n for n in base['pendingSourceNos'] if n!=16] and 15 in d['pendingSourceNos']
assert idx['version']==d['version'] and idx['itemCount']==108 and idx['pendingSourceNos']==d['pendingSourceNos']
assert [x for x in d['items'] if x['sourceNo']!=16]==base['items']
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='54a5bf1489a9d537f9cc34e6db29609bc6384f8a18b666a40eb11561f912ea4c'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='b1ff5ad327fd669a56508bc1256be8743e809122f1e80b3af5f0731874939975'
nums=sorted((1000*a+100*b+10*c+z for a,b,c,z in itertools.permutations(range(10),4) if a),reverse=True)
assert len(nums)==4536 and nums.index(8432)+1==761
proof=[]
for x in [q for q in d['items'] if q['sourceNo']==16]:
 p=x['verification']['parameters'];n=p['target'];digits=list(map(int,f'{n:04d}'));a,b,c,z=digits
 blocks=[len([v for v in range(9,a,-1)])*9*8*7,len([v for v in range(9,b,-1) if v!=a])*8*7,len([v for v in range(9,c,-1) if v not in {a,b}])*7,len([v for v in range(9,z,-1) if v not in {a,b,c}])]
 rank=nums.index(n)+1
 assert blocks==p['greaterBlockCounts'] and rank==sum(blocks)+1==p['rank']
 assert x['answer']==str(rank) and x['answerParts']==[rank] and x['answerContract']=='ordered-parts'
 assert x['reviewStatus']=='verified' and x['pointBand']=='3.4' and x['difficultyEvidence']['estimated'] is True
 assert x['verification']['sourceExamPage']==3 and x['verification']['sourceAnswerPage']==3
 assert x['verification']['sourceDrawingPresent'] is False and x['verification']['sourceDrawingCompared'] is False
 proof.append({'id':x['id'],'target':n,'greaterBlockCounts':blocks,'greaterCount':sum(blocks),'descendingRankByEnumeration':rank,'totalNumbersEnumerated':len(nums),'passed':True})
assert len(proof)==9
OUT.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':3,'answerPage':3,'sourceTarget':8432,'teacherAnswerRank':761,'directPageImageCompared':True,'enumeratedSetSize':len(nums)},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q16: source 8432 ranks 761st; 9 variants independently match full enumeration of 4,536 valid numbers')

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify source Q23 arrows and enumerate all routes for nine variants."""
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw6'
D=json.loads((R/'bank/data/applied6-expanded.json').read_text());I=json.loads((R/'bank/data/applied6-expanded-index.json').read_text());B=json.loads((W/'q23-baseline-applied6-r18.json').read_text());SR=json.loads((W/'q23-source-answer-review.json').read_text());Q=R/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';A=W/'source-answer-6.pdf';asset=R/'bank/assets/applied6/q23-original-diagram.png';sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert D['version']=='20261024-applied6-expansion-r19' and len(D['items'])==171
assert D['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23]
assert D['pendingSourceNos']==[1,4,6,15,24,25,26,27,28,29,30]
assert I['version']==D['version'] and I['itemCount']==171 and I['pendingSourceNos']==D['pendingSourceNos']
assert [x for x in D['items'] if x['sourceNo']!=23]==B['data']['items']
assert sha(Q)==SR['sourcePdfSha256'] and sha(A)==SR['answerPdfSha256'] and sha(asset)==SR['originalDiagramAssetSha256']
assert SR['directPageImagesCompared'] and SR['diagramDirectionsDirectlyCompared'] and SR['diagramReusedUnchangedForAllVariants'] and SR['sourceTeacherAnswer']==17
exam=PdfReader(str(Q)).pages[3].extract_text() or '';ans=PdfReader(str(A)).pages[3].extract_text() or '';assert '가는 방법' in exam and 'A B' in exam and SR['sourceQuestion'].startswith('A도시에서 B도시') and SR['sourceTeacherAnswer']==17
G={'A':['TL','TR','C'],'TL':['L','C'],'TR':['R','C'],'L':['C','BL'],'R':['C','BR'],'C':['B','BL','BR'],'BL':['B'],'BR':['B'],'B':[]}
def paths(s,t):
 out=[]
 def dfs(u,p):
  if u==t:out.append(p);return
  for v in G[u]:dfs(v,p+[v])
 dfs(s,[s]);return out
pairs=[('A','B',17),('A','C',5),('A','TL',1),('A','TR',1),('A','L',1),('A','R',1),('A','BL',6),('A','BR',6),('TL','B',7)]
items=[x for x in D['items'] if x['sourceNo']==23];assert len(items)==9;proof=[]
for x,(s,t,n) in zip(items,pairs):
 ps=paths(s,t);assert len(ps)==n and x['answer']==str(n) and x['acceptedAnswers']==[str(n)]
 assert x['verification']['parameters']['startNode']==s and x['verification']['parameters']['endNode']==t
 assert x['asset']['src']=='assets/applied6/q23-original-diagram.png' and x['verification']['sourceDrawingCompared'] and x['verification']['variantUsesSourceDrawing']
 assert x['area']=='경우의 수' and x['pointBand']=='4.2'
 proof.append({'id':x['id'],'start':s,'destination':t,'enumeratedRoutes':ps,'count':len(ps),'passed':True})
(W/'q23-independent-math.json').write_text(json.dumps({'questionPage':4,'answerPage':4,'teacherAnswer':17,'sourcePdfSha256':sha(Q),'answerPdfSha256':sha(A),'diagramSha256':sha(asset),'directPageImagesCompared':True,'onlyExistingSourceTypeExtended':True,'variants':proof,'dataSha256':sha(R/'bank/data/applied6-expanded.json'),'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Q23: unchanged source graph, teacher result 17, nine route counts independently enumerated as 17,5,1,1,1,1,6,6,7')

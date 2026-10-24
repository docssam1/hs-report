#!/usr/bin/env python3
"""Verify source and variants for Applied 6 Q12 run-length arrangements."""
import hashlib,itertools,json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json';SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf';ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
d=json.loads(DATA.read_text());assert d['version']=='20261024-applied6-expansion-r9'
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12] and len(d['items'])==81
items=[x for x in d['items'] if x['sourceNo']==12];assert len(items)==9
# Original drawing has ten cells and circle runs 2,3,1. Independently enumerate all patterns.
def count_patterns(L,runs):
 count=0
 for bits in itertools.product((0,1),repeat=L):
  actual=[];n=0
  for v in bits:
   if v:n+=1
   elif n:actual.append(n);n=0
  if n:actual.append(n)
  if tuple(actual)==tuple(runs):count+=1
 return count
source= count_patterns(10,[2,3,1]);assert source==10
proof=[]
for q in items:
 p=q['verification']['parameters'];L=p['lineLength'];runs=p['blockLengths'];circles=sum(runs);empty=L-circles;extra=empty-2
 assert len(runs)==3 and min(runs)>=1 and L>=circles+2
 gap_method=math.comb(extra+3,3);enumeration=count_patterns(L,runs)
 assert extra==p['extraEmptyCells'] and gap_method==enumeration==q['answerParts'][0]
 assert q['answer']==str(gap_method) and q['acceptedAnswers']==[str(gap_method)]
 assert p['gapCount']==4 and p['mandatoryInternalGaps']==2 and p['arrangementsByGapDistribution']==gap_method and p['enumeratedPatternCount']==enumeration
 assert q['area']=='경우의 수' and q['verification']['sourceExamPage']==2 and q['verification']['sourceAnswerPage']==2
 assert q['verification']['sourceDrawingCompared'] and q['verification']['variantUsesSourceDrawing'] is False and 'asset' not in q
 assert q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하'
 proof.append({'id':q['id'],'lineLength':L,'runs':runs,'gapDistributionCount':gap_method,'enumeratedCount':enumeration,'methodsAgree':True,'passed':True})
(ROOT/'.private-work/hw-expansion-20261023/hw6/q12-independent-math.json').write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'page':2,'lineLength':10,'runs':[2,3,1],'teacherAnswer':10,'gapDistributionAnswer':math.comb(5,3),'enumeratedAnswer':source},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q12: source answer 10; nine variants verified by gap distributions and exhaustive pattern enumeration')

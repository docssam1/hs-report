#!/usr/bin/env python3
"""Independently verify Q26 source math and uniqueness of all nine set-count variants."""
from fractions import Fraction
import json, subprocess, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text()); INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q26-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def page(p,n):return subprocess.check_output([str(PDFTOTEXT),'-f',str(n),'-l',str(n),'-layout',str(p),'-'],text=True,errors='replace')
def fracs(reg):
 a,b,c,d,e,f,g=reg;t=a+d+e+g;r=b+d+f+g;ca=c+e+f+g
 return (Fraction(d+g,t),Fraction(e+g,t),Fraction(d+g,r),Fraction(f+g,r),Fraction(e+g,ca))
def enumerate_solutions(N,g,fs):
 sols=[]
 for d in range((N-g)//2+1):
  rem=N-g-2*d
  for a in range(rem+1):
   for b in range(rem-a+1):
    for e in range(rem-a-b+1):
     f=rem-a-b-e;reg=(a,b,d,d,e,f,g)
     if fracs(reg)==fs:sols.append(reg)
 return sols
assert DATA['version'].endswith('q25-q26-q27-q28-q29-q30-r26') and DATA['itemCount']==234 and INDEX['itemCount']==234
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert len(DATA['pendingSourceNos'])==4 and 26 not in DATA['pendingSourceNos']
exam=''.join(page(EXAM,6).split()); ans=''.join(page(ANSWER,6).split())
for term in ['26명의어린이가','탬버린','트라이앵글','캐스터네츠','세악기를모두연주하','어린이는2명'] : assert term in exam
assert '26명의어린이가' in ans
sourceFs=tuple(Fraction(n,d) for n,d in [(4,7),(3,7),(4,7),(2,7),(3,7)])
assert enumerate_solutions(26,2,sourceFs)==[(2,4,6,6,4,2,2)]
items=sorted([x for x in DATA['items'] if x['sourceNo']==26],key=lambda x:x['variantNo'])
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
for it,proof in zip(items,REVIEW['variants']):
 p=it['verification']['parameters']; reg=tuple(p['regions'][k] for k in ['T_only','R_only','C_only','TR_only','TC_only','RC_only','TRC'])
 N=p['totalChildren'];g=reg[-1];fs=tuple(Fraction(x) for x in proof['fractions'])
 assert enumerate_solutions(N,g,fs)==[reg],it['id']
 a,b,c,d,e,f,g=reg; totals=(a+d+e+g,b+d+f+g,c+e+f+g)
 assert c==d and sum(reg)==N
 assert [totals[0],totals[2],totals[1]]==it['answerParts']==proof['instrumentTotals']
 assert fracs(reg)==fs and it['verification']['parameters']['uniqueSolutions']==1
 assert it['verification']['sourceExamPage']==6 and it['verification']['sourceAnswerPage']==6
 assert it['verification']['sourceDrawingPresent'] is False and it['reviewStatus']=='verified'
assert REVIEW['sourceAnswer']['independentSolution']['instrumentTotals']==[14,14,14]
print('PASS Applied7 Q26: exact source p6 reviewed; source answer independently unique 14/14/14; 9 variants each have one nonnegative integer solution by exhaustive enumeration; existing type only.')

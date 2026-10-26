#!/usr/bin/env python3
"""Independently validate Applied 7 Q28 source interpretation and variants."""
from fractions import Fraction
import json, subprocess, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text())
INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q28-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=WORK/'source-review/applied7-answer-candidate.pdf'
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
def page(pdf,n): return subprocess.check_output([str(PDFTOTEXT),'-f',str(n),'-l',str(n),'-layout',str(pdf),'-'],text=True,errors='replace')
exam=''.join(page(EXAM,6).split()); ans=''.join(page(ANSWER,6).split())
for token in ['6자루','9권','36개','12개사고']:
    assert token in exam, token
for token in ['6자루','9권','36개']:
    assert token in ans, token
assert DATA['version'].endswith('q25-q26-q27-q28-q29-q30-r26')
assert DATA['itemCount']==234 and INDEX['itemCount']==234
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['pendingSourceNos']==[1,8,17,19]
assert REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded']==0
source=(6,9,36,12)
pen,book,erasers,first=source
left=erasers-first; bundle=erasers//pen+erasers//book+1
q,r=divmod(left,bundle)
assert (bundle,q,r)==(11,2,2)
assert REVIEW['sourceAnswer']['independentSolution']['leftover']==2
items=sorted([x for x in DATA['items'] if x['sourceNo']==28],key=lambda x:x['variantNo'])
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
for it,proof in zip(items,REVIEW['variants']):
    p=it['verification']['parameters']; pens=p['pensAffordable'];books=p['notebooksAffordable'];erasers=p['erasersAffordable'];first=p['erasersBoughtFirst']
    expected=(erasers//pens,erasers//books,erasers//pens+erasers//books+1)
    assert erasers%pens==erasers%books==0
    assert expected==(p['penUnitPriceInEraserUnits'],p['notebookUnitPriceInEraserUnits'],p['bundleCostInEraserUnits'])
    left=erasers-first; q,r=divmod(left,expected[2])
    assert q==p['maximumEqualBundles'] and r==p['remainingEraserUnits']==it['answerParts'][0]==proof['case']['answer']
    frac_left=Fraction(erasers-first,erasers)
    frac_bundle=Fraction(1,pens)+Fraction(1,books)+Fraction(1,erasers)
    assert frac_left-q*frac_bundle==Fraction(r,erasers)
    assert it['pointBand']=='4.2' and it['difficultyEvidence']['label']=='상'
    assert it['verification']['sourceExamPage']==6 and it['verification']['sourceAnswerPage']==6
    assert it['verification']['sourceDrawingPresent'] is False and it['reviewStatus']=='verified'
    assert it['answerContract']=='single-number'
assert sum(x['sourceNo']==28 for x in INDEX['items'])==1
assert next(x for x in INDEX['items'] if x['sourceNo']==28)['variantCount']==9
print('PASS Applied7 Q28: exact source p6 and answer p6 reviewed; source corrected wording and answer independently verified; 9 same-type variants each pass integer quotient/remainder and exact Fraction checks; no new type.')

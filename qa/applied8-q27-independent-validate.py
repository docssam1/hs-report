#!/usr/bin/env python3
"""Independently enumerate Q27 distinct four-digit numbers and audit source artwork."""
from itertools import product
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
import hashlib,json
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw8';EXAM=R/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf';CROP=W/'source-review/q27-cards-original-crop.png';ASSET=R/'bank/assets/applied8/q27-cards-original.png'
D=json.loads((R/'bank/data/applied8-expanded.json').read_text());I=json.loads((R/'bank/data/applied8-expanded-index.json').read_text());REV=json.loads((W/'q27-source-review.json').read_text())
SETS=[(0,3,7),(0,1,2),(0,1,4),(0,2,5),(0,1,8),(0,2,9),(0,3,9),(0,4,9),(0,5,9)]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def enumerate_values(ds):return [int(''.join(map(str,t))) for t in product(ds,repeat=4) if t[0]!=0]
e=PdfReader(str(EXAM)).pages[5].extract_text();a=PdfReader(str(ANSWER)).pages[5].extract_text();assert e==a and '숫자 카드' in e and '네 자리' in e
assert Image.open(CROP).size==(300,165) and sha(CROP)==sha(ASSET)
assert REV['sourceExam']['directVisualReview'] and REV['sourceExam']['originalCardLabels']==[0,3,7] and REV['sourceExam']['cardsPerLabel']==4 and REV['answerCandidate']['containsAnswers'] is False
items=[x for x in D['items'] if x['sourceNo']==27];assert len(items)==9 and len({tuple(x['verification']['parameters']['digits']) for x in items})==9;rows=[]
for i,(ds,x) in enumerate(zip(SETS,items),1):
 vals=enumerate_values(ds);total=sum(vals);a,b=ds[1:];thousand=(a+b)*27*1000;lower=(a+b)*18*111
 assert len(vals)==54 and len(set(vals))==54 and total==thousand+lower==(a+b)*28998
 p=x['verification']['parameters'];assert x['id']==f'applied8-q27-v{i}' and x['reviewStatus']=='verified' and x['answerParts']==[total] and x['answer']==f'{total:,}'
 assert p['digits']==list(ds) and p['copiesPerDigit']==4 and p['distinctNumbers']==54 and p['thousandsContribution']==thousand and p['hundredsTensOnesContribution']==lower
 assert x['pointBand']=='4.2' and x['difficultyEvidence']['label']=='상' and len(x['solutionSteps'])==4 and x['learningLocation'] and x['learningPoint']
 assert (R/'bank'/x['asset']['src']).is_file()
 if i==1:assert x['verification']['sourceDrawingPixelExactCrop'] and sha(R/'bank'/x['asset']['src'])==sha(CROP)
 else:assert (R/'bank'/x['asset']['src']).suffix=='.svg' and 'svg xmlns=' in (R/'bank'/x['asset']['src']).read_text()
 rows.append({'variant':i,'digits':list(ds),'validDistinctNumbers':len(vals),'independentSum':total,'thousandsContribution':thousand,'lowerPlacesContribution':lower})
assert [r['independentSum'] for r in rows]==[289980,86994,144990,202986,260982,318978,347976,376974,405972]
assert D['itemCount']==I['itemCount']==243 and D['availableSourceNos']==[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert [x['sourceNo'] for x in I['items']]==D['availableSourceNos'] and D['pendingSourceNos']==[n for n in range(1,31) if n not in D['availableSourceNos']]
assert next(x for x in I['items'] if x['sourceNo']==27)['variantCount']==9
out={'passed':True,'sourceExamSha256':sha(EXAM),'answerCandidateSha256':sha(ANSWER),'page6TextEqual':True,'sourceCropSha256':sha(CROP),'sourceCardLabels':[0,3,7],'copiesPerLabel':4,'sourceAnswer':rows[0]['independentSum'],'variantResults':rows,'allValuesIndependentlyEnumerated':True,'newSourceTypes':0,'sourceTypes':27,'itemCount':243,'difficulty':'4.2-point band only = high'}
(W/'q27-independent-math.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('PASS Applied8 Q27: source crop exact; all 54 distinct valid numbers per set enumerated; source sum 289980; 9 variants; inventory 243/27.')

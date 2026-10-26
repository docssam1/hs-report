#!/usr/bin/env python3
"""Independently validate Q22's plus/minus sign-counting type and Q22/Q24 source binding."""
from itertools import combinations
from pathlib import Path
from pypdf import PdfReader
import hashlib,json
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/hw-expansion-20261023/hw8';EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf'
DATA=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied8-expanded-index.json').read_text());REVIEW=json.loads((W/'q22-source-review.json').read_text())
DIFFS=[8,0,4,10,14,18,22,26,32]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def subsets(k):return [c for r in range(9) for c in combinations(range(1,9),r) if sum(c)==k]
def by_largest(k):
 d={}
 for c in subsets(k):d[max(c)]=d.get(max(c),0)+1
 return d
# p5 source/answer text layers are equal but omit Q22's vector text; semantic review is backed by the cropped full-page renders.
exam=PdfReader(str(EXAM)).pages[4].extract_text();ans=PdfReader(str(ANSWER)).pages[4].extract_text();assert exam==ans
assert (W/'source-review/q22-source-q22-crop.png').exists() and (W/'source-review/q22-answer-candidate-q22-crop.png').exists()
assert REVIEW['sourceExam']['questionNo']==22 and REVIEW['answerCandidate']['containsAnswers'] is False and REVIEW['sourceIndependentSolution']['answer']==12
items=[x for x in DATA['items'] if x['sourceNo']==22];assert len(items)==9;rows=[]
for i,(x,diff) in enumerate(zip(items,DIFFS),1):
 target=100+diff;k=(36-diff)//2;ss=subsets(k);groups=by_largest(k);groups_json={str(a):b for a,b in groups.items()};answer=len(ss)
 assert x['id']==f'applied8-q22-v{i}' and x['reviewStatus']=='verified' and x['pointBand']=='4.2'
 assert x['text']==f'식 100 □ 1 □ 2 □ 3 □ 4 □ 5 □ 6 □ 7 □ 8 = {target}에서 각 □에 + 또는 −를 넣어 등식이 성립하도록 하는 방법은 모두 몇 가지일까요?'
 assert x['answerParts']==[answer] and x['answer']==f'{answer}가지' and x['answerContract']=='single-number'
 params=x['verification']['parameters'];assert params['target']==target and params['minusSubsetSum']==k and params['negativeSetsByLargest']==groups_json and params['negativeSets']==[list(s) for s in ss]
 # Full independent brute force over 256 assignments.
 values=[]
 for mask in range(256):values.append(100+sum((1 if mask>>(n-1)&1 else -1)*n for n in range(1,9)))
 assert values.count(target)==answer
 assert x['learningLocation'] and x['learningPoint'] and x['difficultyEvidence']['label']=='상'
 rows.append({'id':x['id'],'target':target,'minusSubsetSum':k,'negativeSetsByLargest':groups_json,'answer':answer,'bruteForceCount':values.count(target)})
assert [x['answer'] for x in rows]==[12,14,13,11,9,7,5,3,1]
assert DATA['itemCount']==INDEX['itemCount']==243 and DATA['availableSourceNos']==[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['pendingSourceNos']==[n for n in range(1,31) if n not in DATA['availableSourceNos']]
assert next(x for x in INDEX['items'] if x['sourceNo']==22)['variantCount']==9
report={'passed':True,'sourceExamSha256':sha(EXAM),'answerCandidateSha256':sha(ANSWER),'sourceAndAnswerTextLayerEqual':True,'sourceQ22AnswerDerivedBy256SignAssignments':12,'variants':rows,'newSourceTypes':0,'difficulty':'4.2-point band only = high','dataSha256':sha(ROOT/'bank/data/applied8-expanded.json'),'indexSha256':sha(ROOT/'bank/data/applied8-expanded-index.json')}
(W/'q22-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS Applied8 Q22: source image crops reviewed; source answer 12; all nine targets independently brute-force checked over 256 assignments.')

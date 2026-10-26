#!/usr/bin/env python3
"""Independently verify Applied 8 Q23 nested-fraction headcounts."""
from fractions import Fraction
import hashlib,json
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw8';EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=WORK/'source-review/applied8-answer-drive-copy.pdf'
DATA=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied8-expanded-index.json').read_text());REVIEW=json.loads((WORK/'q23-source-review.json').read_text())
CASES=[(Fraction(1,5),Fraction(3,8),Fraction(3,5),200),(Fraction(1,4),Fraction(2,5),Fraction(1,2),200),(Fraction(1,6),Fraction(2,5),Fraction(1,2),300),(Fraction(1,4),Fraction(1,3),Fraction(1,2),200),(Fraction(1,4),Fraction(2,5),Fraction(2,3),200),(Fraction(1,5),Fraction(1,3),Fraction(1,2),150),(Fraction(1,4),Fraction(3,8),Fraction(1,2),256),(Fraction(1,6),Fraction(1,3),Fraction(1,2),180),(Fraction(1,3),Fraction(2,5),Fraction(1,2),300)]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
exam=PdfReader(str(EXAM)).pages[4].extract_text();ans=PdfReader(str(ANSWER)).pages[4].extract_text();assert exam==ans
s=''.join(exam.split());assert all(t in s for t in ('가장좋아하는과목','1/5','3/8','3/5','수학을좋아하는'))
assert REVIEW['sourceExam']['questionNo']==23 and REVIEW['sourceExam']['directVisualReview'] and REVIEW['answerCandidate']['containsAnswers'] is False
items=[x for x in DATA['items'] if x['sourceNo']==23];assert len(items)==9
rows=[]
for i,(item,(k,m,p,total)) in enumerate(zip(items,CASES),1):
 korean=total*k;left1=total-korean;math=left1*m;left2=left1-math;pe=left2*p;none=left2-pe
 assert all(Fraction(v).denominator==1 for v in (korean,left1,math,left2,pe,none))
 answer=int(math);none=int(none)
 assert item['id']==f'applied8-q23-v{i}' and item['reviewStatus']=='verified'
 assert item['answerParts']==[answer] and item['answer']==f'{answer}명' and item['answerContract']=='single-number'
 assert item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상'
 par=item['verification']['parameters'];assert par['koreanFraction']==f'{k.numerator}/{k.denominator}' and par['mathOfRemainderFraction']==f'{m.numerator}/{m.denominator}' and par['PEOfRemainderFraction']==f'{p.numerator}/{p.denominator}'
 assert par['totalStudents']==total and par['koreanCount']==int(korean) and par['mathCount']==answer and par['PECount']==int(pe) and par['noneCount']==none
 assert '한 과목씩' in item['text'] and item['learningLocation'] and item['learningPoint']
 rows.append({'id':item['id'],'fractions':[str(k),str(m),str(p)],'total':total,'counts':{'korean':int(korean),'math':answer,'PE':int(pe),'none':none},'answer':answer})
assert [x['answer'] for x in rows]==[60,60,100,50,60,40,72,50,80]
assert REVIEW['sourceIndependentSolution']['totalStudents']==200 and REVIEW['sourceIndependentSolution']['answer']==60
assert [x['answer'] for x in REVIEW['variantResults']]==[x['answer'] for x in rows]
assert DATA['itemCount']==INDEX['itemCount']==243 and DATA['availableSourceNos']==[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['pendingSourceNos']==[n for n in range(1,31) if n not in DATA['availableSourceNos']]
ix=next(x for x in INDEX['items'] if x['sourceNo']==23);assert ix['variantCount']==9 and ix['reviewStatus']=='verified'
report={'passed':True,'sourceExamSha256':sha(EXAM),'answerCandidateSha256':sha(ANSWER),'sourceTextEqualToBlankAnswerCopy':True,'sourceAnswerDerived':{'totalStudents':200,'mathStudents':60},'variants':rows,'newSourceTypes':0,'difficulty':'4.2-point band only = high','dataSha256':sha(ROOT/'bank/data/applied8-expanded.json'),'indexSha256':sha(ROOT/'bank/data/applied8-expanded-index.json')}
(WORK/'q23-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS Applied8 Q23: source and blank answer copy compared; all nine nested fraction cases independently verified by exact integer headcounts.')

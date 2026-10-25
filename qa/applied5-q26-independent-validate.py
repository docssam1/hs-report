#!/usr/bin/env python3
"""Independent recurrence and data/source checks for Applied 5 Q26."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
INDEX=json.loads((ROOT/'bank/data/applied5-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q26-source-answer-review-r17.json').read_text())
PARAMS=[(1,2,2),(2,2,2),(1,3,2),(2,3,2),(1,4,2),(2,4,2),(1,5,2),(2,5,2),(1,3,4)]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def simulate(p,e,c):
    # Independent annual population simulation, adding one chick for each egg.
    n=p*(2+e*c)
    result=[]
    for _ in range(2):
        assert n%2==0
        nests=n//2
        chicks=nests*e*c
        n=n+chicks
        result.append(n)
    return result

def main():
    exam=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
    answer=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
    assert sha(exam)=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(answer)=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert REVIEW['sourceExam']['page']==5 and REVIEW['sourceAnswer']['page']==26
    assert REVIEW['sourceAnswer']['handwrittenCandidateAnswers']==[50,250]
    assert simulate(1,4,2)==[50,250]
    assert DATA['version'].endswith('q27-q28-q29-r23') and INDEX['version']==DATA['version']
    assert len(DATA['items'])==INDEX['itemCount']==270
    assert len(DATA['availableSourceNos'])==30
    assert DATA['pendingSourceNos']==INDEX['pendingSourceNos']==[]
    items=[x for x in DATA['items'] if x['sourceNo']==26]
    assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
    answers_seen=set(); evidence=[]
    for item,(p,e,c) in zip(items,PARAMS):
        T=e*c; expected=simulate(p,e,c)
        assert T%2==0 and len(expected)==2 and expected[0]<expected[1]
        assert item['answerParts']==expected and item['answer']==f'{expected[0]}, {expected[1]}'
        assert item['answerContract']=='ordered-parts' and item['acceptedAnswers']==[f'{expected[0]}, {expected[1]}',f'{expected[0]},{expected[1]}']
        assert item['verification']['parameters']=={'initialPairs':p,'eggsPerClutch':e,'clutchesPerPair':c,'chicksPerPair':T,'firstSeptemberTotal':p*(2+T),'yearlyGrowthFactor':1+T//2,'year1September':expected[0],'year2September':expected[1]}
        assert item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상'
        assert item['verification']['sourceDrawingPresent'] is False and item['verification']['sourceAnswerPage']==26
        assert item['learningLocation'].startswith('활용 5회 · 원문 26번')
        assert len(item['solutionSteps'])==3 and all(str(v) in ' '.join(item['solutionSteps']) for v in expected)
        assert tuple(expected) not in answers_seen; answers_seen.add(tuple(expected))
        evidence.append({'id':item['id'],'initialPairs':p,'eggs':e,'clutches':c,'simulatedAnswers':expected,'passed':True})
    result={'result':'PASS','dataSha256':sha(ROOT/'bank/data/applied5-expanded.json'),'sourceExamSha256':sha(exam),'sourceAnswerSha256':sha(answer),'sourceExamPage':5,'sourceAnswerCandidatePage':26,'sourceCandidateAnswersReproduced':[50,250],'variants':evidence,'pending':DATA['pendingSourceNos']}
    (WORK/'q26-independent-math-r19-regression.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('PASS Applied5 Q26: source hashes/pages, 50/250 hand-mark candidate reproduced, nine distinct variants, ordered answers and independent year-by-year simulation.')
if __name__=='__main__':main()

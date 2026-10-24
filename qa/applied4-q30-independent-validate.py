"""Independent validation for the nine Applied 4 Q30 bank variants."""
from pathlib import Path
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/nine-expansion-20261024/round10-q30'
DATA = ROOT / 'bank/data/applied4-expanded.json'
PRE = WORK / 'pre-q30-data.json'
SOURCE = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 4회.pdf'
ANSWER = ROOT / '.private-work/balanced15-20261024/source/applied4-answer.pdf'
ROWS = [('low',1,2),('low',2,3),('low',3,2),('middle',2,5),('middle',3,6),('middle',4,5),('high',2,9),('high',3,10),('high',4,11)]

def events_to(minutes):
    out=[]; t=2; gap=1
    while t <= minutes:
        out.append(t); t += gap; gap = 3-gap
    return out

def main():
    d=json.loads(DATA.read_text()); pre=json.loads(PRE.read_text())
    qs=[x for x in d['items'] if x['sourceNo']==30]
    assert len(pre['items'])==225 and len(qs)==9 and d['items'][:225]==pre['items']
    assert len(d['items'])==234 and d['availableSourceNos']==sorted(pre['availableSourceNos']+[30])
    assert d['pendingSourceNos']==[1,2,3,4] and len({x['id'] for x in d['items']})==234
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59'
    assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8'
    proofs=[]
    for q,(stage,initial,minutes) in zip(qs,ROWS):
        expected_events=events_to(minutes)
        n=initial
        for _ in expected_events: n *= 3
        closed=initial*3**len(expected_events)
        p=q['verification']['parameters']
        assert n==closed==p['population']==q['answerParts'][0]
        assert expected_events==p['eventTimes'] and len(expected_events)==p['divisionCount']
        assert (p['initialCount'],p['elapsedMinutes'])==(initial,minutes)
        assert q['id']==f"applied4-q30-v{len(proofs)+1}" and q['practiceStage']==stage
        assert q['pointBand']=='4.2' and q['difficultyEvidence']['label']=='상'
        assert q['difficultyEvidence']['basis']=='source-point-band'
        assert q['reviewStatus']=='verified' and q['answer']==str(closed)
        assert q['acceptedAnswers']==[str(closed)] and len(q['solutionSteps'])==3
        assert q['verification']['sourceExamPage']==6 and q['verification']['sourceAnswerPage']==30
        assert q['verification']['sourceAnswer']['teacherHandwritten']=='11×2=22'
        assert q['verification']['sourceAnswerMatch'] is False
        assert 'unresolved' in q['verification']['sourceAnswer']['status']
        # Ensure the problem states both the alternating interval rule and replacement rule.
        assert '1분과 2분 순서로 번갈아' in q['text'] and '각각 3마리로 바뀝니다' in q['text']
        proofs.append({'id':q['id'],'stage':stage,'initial':initial,'elapsedMinutes':minutes,
                       'events':expected_events,'eventRecurrence':n,'closedForm':closed})
    assert [sum(x['practiceStage']==s for x in qs) for s in ('low','middle','high')]==[3,3,3]
    report={'passed':True,'sourceExamPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'sourceAnswerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'sourceOriginalAnswerInterpretation':'unresolved; handwritten 11×2=22 recorded but not claimed as independently validated',
            'previous225ItemsExact':True,'variants':proofs,
            'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest()}
    (WORK/'q30-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('PASS Q30: nine variants checked by event recurrence and closed form; original answer ambiguity retained; previous 225 exact')

if __name__=='__main__': main()

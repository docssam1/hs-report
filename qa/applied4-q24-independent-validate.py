"""Independently check Applied 4 Q24 source answer and nine circle-rectangle variants."""
from pathlib import Path
from itertools import combinations
import hashlib, json, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/nine-expansion-20261024/round10-q24'
DATA=ROOT/'bank/data/applied4-expanded.json'
PRE=WORK/'pre-q24-data.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 4회.pdf'
ANSWER=ROOT/'.private-work/balanced15-20261024/source/applied4-answer.pdf'

def brute(labels):
    antipodal={frozenset((i,(i+6)%12)) for i in range(12)}
    rects=[]
    for four in combinations(range(12),4):
        s=set(four)
        pairs=[p for p in antipodal if p<=s]
        if len(pairs)==2 and set().union(*pairs)==s:
            rects.append((four,sum(labels[i] for i in four)))
    return rects

def main():
    d=json.loads(DATA.read_text()); pre=json.loads(PRE.read_text())
    xs=[x for x in d['items'] if x['sourceNo']==24]
    assert len(pre['items'])==207 and d['items'][:207]==pre['items']
    assert len(d['items'])==234 and len(xs)==9
    assert d['availableSourceNos']==sorted(pre['availableSourceNos']+[21,24,30])
    assert d['pendingSourceNos']==[1,2,3,4]
    assert len({q['id'] for q in d['items']})==234
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59'
    assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8'
    source_labels=list(range(1,13)); source_pairs=[source_labels[i]+source_labels[i+6] for i in range(6)]
    srects=brute(source_labels)
    assert len(srects)==15 and min(x[1] for x in srects)==18 and max(x[1] for x in srects)==34
    assert d['sourceEditionNotes']['24'].find('차 16')>=0
    stages=['low']*3+['middle']*3+['high']*3; outputs=[]
    for q,stage in zip(xs,stages):
        p=q['verification']['parameters']; labels=p['labelsClockwise']
        assert len(labels)==12 and len(set(labels))==12
        pairs=[labels[i]+labels[i+6] for i in range(6)]
        rects=brute(labels)
        assert len(rects)==15 and p['rectangleCount']==15
        lo=min(total for _,total in rects); hi=max(total for _,total in rects); diff=hi-lo
        assert (lo,hi,diff)==(p['minimumVertexSum'],p['maximumVertexSum'],q['answerParts'][1])
        assert q['answerParts']==[15,diff] and q['answer']==f'15, {diff}' and q['acceptedAnswers']==[q['answer']]
        assert pairs==p['oppositePairSums']
        assert q['reviewStatus']=='verified' and q['pointBand']=='4.2' and q['difficultyEvidence']['label']=='상'
        assert q['practiceStage']==stage and len(q['solutionSteps'])==3
        assert q['verification']['sourceExamPage']==5 and q['verification']['sourceAnswerPage']==24
        assert q['verification']['sourceAnswer']=={'rectangleCount':15,'sumDifference':16}
        assert q['verification']['sourceAnswerMatch']==(diff==16)
        svg=ROOT/'bank'/q['asset']['src']; root=ET.parse(svg).getroot()
        ns={'s':'http://www.w3.org/2000/svg'}
        texts=[int(t.text) for t in root.findall('.//s:text',ns)]
        circles=root.findall('.//s:circle',ns)
        assert texts==labels and len(circles)==13
        outputs.append({'id':q['id'],'stage':stage,'labels':labels,'oppositePairSums':pairs,'rectangleCount':15,'minimum':lo,'maximum':hi,'difference':diff})
    assert [q['answerParts'][1] for q in xs]==[16,16,16,32,32,32,48,64,89]
    report={'passed':True,'sourceQuestionSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'sourceAnswer':{'rectangleCount':15,'minimumSum':18,'maximumSum':34,'difference':16},'old207ItemsExact':True,'variantCount':9,'variantProofs':outputs,'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest()}
    (WORK/'q24-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('PASS Q24: source answer 15/16 reconciled; nine diagrams independently brute-forced across all four-point subsets; prior 207 items exact')
if __name__=='__main__': main()

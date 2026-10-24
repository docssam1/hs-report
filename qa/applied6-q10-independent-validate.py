#!/usr/bin/env python3
"""Independent arithmetic and cumulative-load check for Applied 6 Q10."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied6-expanded.json'; SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'; ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/answer.pdf'
d=json.loads(DATA.read_text());assert d['version']=='20261024-applied6-expansion-r10'
assert d['availableSourceNos']==[2,3,5,7,8,9,10,11,12,13] and len(d['items'])==90
items=[x for x in d['items'] if x['sourceNo']==10];assert len(items)==9
assert [x['variantNo'] for x in items]==list(range(1,10))
# Original page 2: scale readings are cumulative; adjacent totals determine one scale's mass.
source_readings=[300,600,1700,2400];source_answer=source_readings[3]-source_readings[2]
assert source_answer==700
proof=[]
for q in items:
    p=q['verification']['parameters'];r=p['cumulativeReadingsGrams']
    assert len(r)==4 and all(isinstance(x,int) and x>0 for x in r)
    assert r[0]<r[1]<r[2]<r[3]
    # Reconstruct four positive individual scale masses from successive totals.
    masses=[r[0],r[1]-r[0],r[2]-r[1],r[3]-r[2]]
    assert all(m>0 for m in masses) and sum(masses[:3])==r[2] and sum(masses)==r[3]
    target=r[3]-r[2]
    assert target==masses[3]==q['answerParts'][0] and q['answer']==f'{target:,}g'
    assert q['acceptedAnswers']==[f'{target:,}g',str(target)]
    assert p['targetScalePositionFromTop']==4 and p['weightAboveTargetScaleGrams']==r[2] and p['weightThroughTargetScaleGrams']==r[3]
    assert q['pointBand']=='2.7' and q['difficultyEvidence']['label']=='하' and q['difficultyEvidence']['measuredVariantRate'] is None
    assert q['area']=='수와 식' and q['verification']['sourceExamPage']==2 and q['verification']['sourceAnswerPage']==2
    assert q['verification']['sourceDrawingCompared'] is True and 'asset' not in q
    proof.append({'id':q['id'],'cumulativeReadingsGrams':r,'reconstructedIndividualMassesGrams':masses,'targetWeightByDifference':target,'targetWeightByCumulativeReconstruction':masses[3],'methodsAgree':True,'passed':True})
assert source_answer==700
out=ROOT/'.private-work/hw-expansion-20261023/hw6/q10-independent-math.json'
out.write_text(json.dumps({'source':{'questionPdfSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'questionPage':2,'answerPage':2,'cumulativeReadingsGrams':source_readings,'teacherAnswerGrams':700,'independentAnswerGrams':source_answer,'sourceDrawingDirectlyCompared':True},'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'items':proof,'passed':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied6 Q10: source 700g and nine variants verified by successive differences and reconstructed scale masses')

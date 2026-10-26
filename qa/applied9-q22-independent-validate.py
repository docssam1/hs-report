#!/usr/bin/env python3
"""Independently rotate labeled die faces in 3-D and check Applied 9 Q22."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied9-expanded-index.json').read_text())
REPORT=json.loads((ROOT/'.private-work/hw-expansion-20261023/hw9/q22-independent-validation-r19.json').read_text())
VERSION='20261026-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q14-q15-q16-q17-q18-q19-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-taxonomy-r25'
assert DATA['version']==INDEX['version']==VERSION
assert len(DATA['items'])==INDEX['itemCount']==270
assert DATA['availableSourceNos']== list(range(1, 31))
assert DATA['pendingSourceNos']== []
items=[q for q in DATA['items'] if q['sourceNo']==22]
assert len(items)==len(REPORT['variants'])==9 and [q['variantNo'] for q in items]==list(range(1,10))
# Face numbers ride on their 3-D normals. Each rotation matrix is applied to
# all six normals; this is independent of the builder's face-swap table.
INITIAL={(0,0,1):2,(0,0,-1):5,(1,0,0):6,(-1,0,0):1,(0,1,0):3,(0,-1,0):4}
MATRIX={
 'E':((0,0,1),(0,1,0),(-1,0,0)), # +90 degrees about y
 'W':((0,0,-1),(0,1,0),(1,0,0)),
 'N':((1,0,0),(0,0,1),(0,-1,0)), # -90 degrees about x
 'S':((1,0,0),(0,0,-1),(0,1,0)),
}

def move(face_at_normal,d):
    cols=MATRIX[d]
    def transform(v):return tuple(sum(cols[row][col]*v[col] for col in range(3)) for row in range(3))
    return {transform(normal):value for normal,value in face_at_normal.items()}

def top_trace(directions):
    faces=INITIAL.copy();out=[]
    for d in directions:
        faces=move(faces,d);out.append(faces[(0,0,1)])
    return out

source_dirs=list('EENENEEEENEESW')
assert len(source_dirs)==14
source_answer=[i for i,v in enumerate(top_trace(source_dirs),1) if v==2]
assert source_answer==REPORT['sourceCandidateAnswer']==[5,9,13]
answers=set()
for i,(item,row) in enumerate(zip(items,REPORT['variants']),1):
    assert item['id']==row['id']==f'applied9-q22-v{i}'
    p=item['verification']['parameters'];dirs=p['directions']
    assert len(dirs)==14 and dirs[0]=='E' and set(dirs)<=set('EWNS')
    coords=[tuple(x) for x in p['cellCoordinates']]
    assert len(coords)==14 and coords[0]==(0,0) and len(set(coords))==14
    # Every step is a single neighboring square; no nonconsecutive squares touch.
    for j,(a,b) in enumerate(zip(coords,coords[1:]),1):
        dx,dy={'E':(1,0),'W':(-1,0),'N':(0,-1),'S':(0,1)}[dirs[j]]
        assert b==(a[0]+dx,a[1]+dy)
        assert all(abs(b[0]-x)+abs(b[1]-y)>1 for x,y in coords[:j-1])
    expected=top_trace(dirs);ans=[j for j,v in enumerate(expected,1) if v==2]
    assert expected==p['topSequence']==row['topSequence']
    assert ans==p['answerCells']==row['answerCells']==item['answerParts']
    assert len(ans)>=2 and item['answer']==', '.join(map(str,ans))
    assert item['answerContract']=='ordered-parts' and item['pointBand']=='3.4' and item['difficultyEvidence']['label']=='중'
    assert item['verification']['sourceDrawingCompared'] is True and item['verification']['variantUsesSourceDrawing'] is False
    assert '공식성·판본 동일성은 미확인' in item['verification']['officialAnswerStatus']
    path=ROOT/'bank'/item['asset']['src'];raw=path.read_bytes();svg=raw.decode()
    digest=hashlib.sha256(raw).hexdigest();assert digest==item['asset']['sha256']==row['assetSha256']
    assert svg.count('<rect ')==15 and svg.count('<circle ')==12 and svg.count('<path ' )==15
    assert len(re.findall(r'<text[^>]*>(?:[1-9]|1[0-4])</text>',svg))==14
    assert len(re.findall(r'<circle cx=',svg))==12
    assert item['verification']['sourceExamPage']==item['verification']['sourceAnswerPage']==4
    assert hashlib.sha256((ROOT/'materials/초등과정 대비 실전 모의고사 활용 9회.pdf').read_bytes()).hexdigest()==item['verification']['sourceExamSha256']
    assert hashlib.sha256((ROOT/'.private-work/hw-expansion-20261023/hw9/candidate-special-9-answer.pdf').read_bytes()).hexdigest()==item['verification']['sourceAnswerSha256']
    answers.add(tuple(ans))
assert len(answers)==9 and len({x['asset']['sha256'] for x in items})==9
print(json.dumps({'status':'PASS','sourceNo':22,'variants':9,'sourceTopSequence':top_trace(source_dirs),'sourceCandidateAnswer':source_answer,
 'variantAnswers':[x['answerParts'] for x in items],'uniqueAnswerSets':len(answers),'pointBand':'3.4 / 중'},ensure_ascii=False,indent=2))

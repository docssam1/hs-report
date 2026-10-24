#!/usr/bin/env python3
"""Exhaustively verify original Applied 6 Q4 and nine variants."""
import hashlib,itertools,json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw6'
DATA=ROOT/'bank/data/applied6-expanded.json'
INDEX=ROOT/'bank/data/applied6-expanded-index.json'
QUESTION=ROOT/'materials/초등과정 대비 실전 모의고사 활용 6회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/hw6/source-answer-6.pdf'
MASKS=[((0,1,1),(1,1,1),(0,1,1)),((1,1,1),(1,1,1),(0,1,1)),((0,1,1),(1,1,1),(1,1,1)),((1,1,1),(1,1,1),(1,1,0)),((1,1,0),(1,1,1),(1,1,0)),((1,1,0),(0,0,1),(1,1,1)),((1,1,1),(1,1,1),(1,1,0)),((1,1,1),(1,1,1),(1,0,1)),((0,1,1),(1,1,1),(1,1,1))]
FRONTS=[(1,3,3),(3,1,3),(3,3,3),(3,2,3),(3,3,2),(3,3,2),(2,2,1),(2,2,3),(2,3,2)]
SIDE_PRINT=[(2,3,2),(1,3,2),(1,3,3),(3,3,2),(3,3,1),(2,1,3),(2,2,2),(3,2,2),(3,3,2)]

def enumerate_heights(mask,front,side_print):
    side=tuple(reversed(side_print))
    cells=[(r,c) for r in range(3) for c in range(3) if mask[r][c]]
    feasible=[]
    for values in itertools.product(*(range(1,min(front[c],side[r])+1) for r,c in cells)):
        m=[[0]*3 for _ in range(3)]
        for (r,c),v in zip(cells,values):m[r][c]=v
        if tuple(max(m[r][c] for r in range(3)) for c in range(3))!=front:continue
        if tuple(max(row) for row in m)!=side:continue
        feasible.append((sum(values),m))
    assert feasible
    low=min(v for v,_ in feasible)
    return low,[m for v,m in feasible if v==low],len(feasible)

def get_signature(item):
    p=item['verification']['parameters']
    return tuple(tuple(r) for r in p['topFootprint']),tuple(p['frontColumnHeights']),tuple(p['rightSidePrintedHeights'])

data=json.loads(DATA.read_text());index=json.loads(INDEX.read_text())
assert data['version']=='20261024-applied6-expansion-r27'
assert data['sourceRound']==6 and data['sourceSet']=='applied'
assert len(data['items'])==252 and len(data['availableSourceNos'])==28
assert data['pendingSourceNos']==[27,28]
assert data['reviewSummary']['outputReviewed'] is True
assert data['items'] and len({x['id'] for x in data['items']})==len(data['items'])

original_mask=((1,1,0),(1,1,0),(1,1,1))
original_min,original_witnesses,original_assignments=enumerate_heights(original_mask,(2,2,3),(3,1,2))
assert original_min==11
original_witness=[[2,1,0],[1,1,0],[1,2,3]]
assert original_witness in original_witnesses
source_note=json.loads((WORK/'q04-source-answer-review.json').read_text())
assert source_note['questionPage']==source_note['answerPage']==1
assert source_note['minimumCubes']==source_note['teacherAnswer']==source_note['independentlyEnumeratedMinimum']==11
assert source_note['topFootprint']==[list(r) for r in original_mask]

items=sorted((x for x in data['items'] if x['sourceNo']==4),key=lambda x:x['variantNo'])
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
proof=[]; answers=set()
for i,item in enumerate(items):
    mask,front,sideprint=get_signature(item)
    assert (mask,front,sideprint)==(MASKS[i],FRONTS[i],SIDE_PRINT[i])
    minimum,witnesses,feasible_count=enumerate_heights(mask,front,sideprint)
    p=item['verification']['parameters']
    assert minimum==int(item['answer'])==p['answer']
    assert p['minimumHeightMatrix'] in witnesses
    assert p['minimumArrangementsFound']==len(witnesses)
    assert p['occupiedTopCells']==sum(map(sum,mask))
    assert item['pointBand']=='2.7' and item['difficultyEvidence']['label']=='하'
    assert item['answerParts']==[minimum] and item['acceptedAnswers']==[str(minimum)]
    assert item['verification']['sourceExamPage']==item['verification']['sourceAnswerPage']==1
    assert item['verification']['variantUsesSourceDrawing'] is False
    assert item['verification']['variantUsesNewSameTypeDrawing'] is True
    asset=ROOT/'bank'/item['asset']['src']
    assert asset.is_file() and '<svg' in asset.read_text()
    assert item['text'].endswith('최소 개수는 몇 개입니까?')
    assert len(item['solutionSteps'])==4 and all(step for step in item['solutionSteps'])
    answers.add(minimum)
    proof.append({'id':item['id'],'minimumCubes':minimum,'feasibleHeightAssignmentsEnumerated':feasible_count,
                  'minimumArrangements':len(witnesses),'witness':p['minimumHeightMatrix'],'passed':True})
assert len({get_signature(x) for x in items})==9
assert 4 not in data['pendingSourceNos']
assert index['version']==data['version'] and index['itemCount']==252
assert len(index['items'])==28

result={'questionPdfSha256':hashlib.sha256(QUESTION.read_bytes()).hexdigest(),
        'answerPdfSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
        'sourceQuestion':4,'sourceTeacherAnswer':11,'sourceMinimum':original_min,
        'sourceFeasibleHeightAssignmentsEnumerated':original_assignments,
        'variants':proof,'existingSourceTypesOnly':True,'newTypeCount':0,
        'bankTypes':28,'bankItems':252,'passed':True}
(WORK/'q04-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f'PASS Q4 source: {original_assignments} feasible height assignments checked; teacher answer/minimum = 11.')
print('PASS Q4 variants: 9 distinct three-view projection types; exhaustive feasible stack-height enumeration confirms each minimum.')
print('PASS bank: 28 existing source types × 9 = 252; Q27/Q28 remain pending; new type count 0.')

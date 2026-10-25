#!/usr/bin/env python3
"""Independent layer/face simulation for Applied 5 Q12's repeated folds."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
INDEX=json.loads((ROOT/'bank/data/applied5-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q12-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def simulate(sequence):
    # Every layer stores its top and bottom face. The same integer is printed on each face.
    grid=[[[ (r*c,r*c) ] for c in range(1,9)] for r in range(1,5)]
    axis='x'; tops=[]
    for side in sequence:
        if axis=='x':
            half=len(grid[0])//2; next_grid=[]
            for row in grid:
                out=[]
                for j in range(half):
                    moving=row[half+j] if side=='R' else row[j]
                    fixed=row[j] if side=='R' else row[half+j]
                    turned=[(bottom,top) for top,bottom in moving[::-1]]
                    out.append(turned+fixed)
                next_grid.append(out)
        else:
            half=len(grid)//2; next_grid=[]
            for i in range(half):
                out=[]
                for j in range(len(grid[0])):
                    moving=grid[half+i][j] if side=='B' else grid[i][j]
                    fixed=grid[i][j] if side=='B' else grid[half+i][j]
                    turned=[(bottom,top) for top,bottom in moving[::-1]]
                    out.append(turned+fixed)
                next_grid.append(out)
        grid=next_grid
        tops.append(grid[0][0][0][0])
        axis='y' if axis=='x' else 'x'
    return tops,[top for top,bottom in grid[0][0]]

assert digest(EXAM)==REVIEW['sourceExam']['sha256']
assert digest(ANSWER)==REVIEW['sourceAnswer']['sha256']
assert REVIEW['sourceExam']['page']==2 and REVIEW['sourceAnswer']['page']==12
assert REVIEW['sourceExam']['questionNo']==12 and REVIEW['sourceAnswer']['teacherAnswer']==9
assert REVIEW['sourceExam']['directVisualReview'] and REVIEW['sourceAnswer']['directVisualReview']
for proof in (REVIEW['sourceFigure'],REVIEW['answerProof']):
    img=ROOT/proof['image']; assert proof['directlyViewed'] and digest(img)==proof['sha256']
assert REVIEW['sourceExam']['foldDirections']==['R','T','L','B','L']
original_tops,original_layers=simulate('RTLBL')
assert original_tops[-1]==9 and original_layers[0]==9
assert original_tops==REVIEW['originalIndependentCheck']['topAfterEachFold']
assert DATA['version']=='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11'
assert INDEX['version']==DATA['version'] and INDEX['itemCount']==162
assert 12 in DATA['availableSourceNos'] and 12 not in DATA['pendingSourceNos']
assert sum(x['sourceNo']==12 for x in DATA['items'])==9
items=sorted((x for x in DATA['items'] if x['sourceNo']==12),key=lambda x:x['variantNo'])
answers=[]
for no,item in enumerate(items,1):
    seq=''.join(item['verification']['parameters']['foldSequence'])
    tops,layers=simulate(seq)
    answers.append(tops[-1])
    assert item['variantNo']==no and item['id']==f'applied5-q12-v{no}'
    assert item['reviewStatus']=='verified' and item['pointBand']=='2.7'
    assert int(item['answer'])==tops[-1]==item['verification']['parameters']['answer']
    assert tops==item['verification']['parameters']['topAfterEachFold']
    assert layers==item['verification']['parameters']['topLayers']
    assert item['verification']['sourceExamPage']==2 and item['verification']['sourceAnswerPage']==12
    assert item['verification']['sourceDrawingCompared'] is True
    svg=ROOT/'bank'/item['asset']['src']; assert svg.is_file() and '<svg' in svg.read_text()
    assert all(step.strip() for step in item['solutionSteps']) and len(item['solutionSteps'])>=3
assert len(set(answers))==9 and 9 not in answers
print('PASS Applied5 Q12: source PDF p2 and answer PDF p12 hashed; teacher 9 reproduced by independent face/layer simulation; 9 distinct directions/answers and SVGs verified; 162-item r11 index consistent.')

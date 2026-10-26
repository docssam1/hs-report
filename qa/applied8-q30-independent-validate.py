#!/usr/bin/env python3
"""Independent die-state, source-image, route, answer, and inventory audit for Applied 8 Q30."""
from pathlib import Path
from collections import defaultdict
from pypdf import PdfReader
from PIL import Image
import json,re,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw8'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf'
ANSWER=WORK/'source-review/applied8-answer-drive-copy.pdf'
DATA=json.loads((ROOT/'bank/data/applied8-expanded.json').read_text())
INDEX=json.loads((ROOT/'bank/data/applied8-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q30-source-review.json').read_text())
MATH=json.loads((WORK/'q30-independent-math.json').read_text())
VERSION='20261025-applied8-expansion-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q12-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r27'
NOS=[1,2,3,4,5,6,7,8,9,10,12,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
SOURCE_PATHS=['EEESS','SEESE','SSEESE','SSSEE']

def roll(o,d):
    if d=='E': return {'T':o['L'],'B':o['R'],'L':o['B'],'R':o['T'],'F':o['F'],'K':o['K']}
    if d=='W': return {'T':o['R'],'B':o['L'],'R':o['B'],'L':o['T'],'F':o['F'],'K':o['K']}
    if d=='S': return {'T':o['K'],'B':o['F'],'F':o['T'],'K':o['B'],'R':o['R'],'L':o['L']}
    if d=='N': return {'T':o['F'],'B':o['K'],'F':o['B'],'K':o['T'],'R':o['R'],'L':o['L']}
    raise AssertionError(d)

def simulate(o,path):
    seq=[]
    for d in path:o=roll(o,d);seq.append(o['B'])
    return seq,sum(seq)

exam=PdfReader(str(EXAM)).pages[5]; answer=PdfReader(str(ANSWER)).pages[5]
normalize=lambda x:re.sub(r'\s+','',x or '')
assert normalize(exam.extract_text())==normalize(answer.extract_text())
assert '마주보는눈의수의' in normalize(exam.extract_text()) and '주사위' in normalize(exam.extract_text())
assert '밑면에닿은눈의' in normalize(exam.extract_text()) and '수의합이같은것은몇번일까요' in normalize(exam.extract_text())
imgs=exam.images; assert len(imgs)>=8 and imgs[7].image.size==(358,205)
asset=ROOT/'bank/assets/applied8/q30-source-diepaths.png'
assert Image.open(asset).convert('RGB').size==(358,205)
assert Image.open(asset).convert('RGB').tobytes()==imgs[7].image.convert('RGB').tobytes()
assert DATA['version']==INDEX['version']==VERSION
assert DATA['itemCount']==INDEX['itemCount']==len(DATA['items'])==243
assert DATA['availableSourceNos']==NOS and DATA['pendingSourceNos']==[n for n in range(1,31) if n not in NOS]
assert [x['sourceNo'] for x in INDEX['items']]==NOS
assert next(x for x in INDEX['items'] if x['sourceNo']==30)['variantCount']==9

items=[x for x in DATA['items'] if x['sourceNo']==30]
assert len(items)==9
source_state={'T':2,'B':5,'F':1,'K':6,'R':4,'L':3}
for j,item in enumerate(items):
    p=item['verification']['parameters']; o={'T':p['orientation']['top'],'F':p['orientation']['front'],'R':p['orientation']['right'],
       'B':7-p['orientation']['top'],'L':7-p['orientation']['right'],'K':7-p['orientation']['front']}
    # Opposite face pairs are checked independently of the stored trace.
    assert o['T']+o['B']==o['F']+o['K']==o['R']+o['L']==7 and len(set(o.values()))==6
    paths=p['paths']; assert len(paths)==4 and len(set(paths))==4
    traced=[simulate(o,path) for path in paths]
    assert p['bottomFaceSequences']==[seq for seq,_ in traced]
    assert p['pathSums']==[total for _,total in traced]
    groups=defaultdict(list)
    for k,(_,total) in enumerate(traced,1):groups[total].append(k)
    ties=sorted(next(g for g in groups.values() if len(g)>1))
    assert ties==p['equalPathNumbers']==item['answerParts']
    assert item['answer']==f'{"번과 ".join(map(str,ties))}번'
    assert item['area']=='도형' and item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상'
    assert item['asset']['src'] and item['solutionSteps'] and len(item['solutionSteps'])==6
    assert item['learningPoint'] and item['learningLocation']
    path=ROOT/'bank'/item['asset']['src']; assert path.is_file()
    if j==0:
       assert path==asset and p['sourceDrawingPixelExactCrop'] and ties==[1,4]
    else:
       root=ET.parse(path).getroot(); ns={'s':'http://www.w3.org/2000/svg'}
       assert len(root.findall('.//s:polyline',ns))==4
       assert len(root.findall('.//s:polygon',ns))==3
    assert all(step in item['solution'] for step in item['solutionSteps'])
assert REVIEW['sourcePaths']==SOURCE_PATHS
assert REVIEW['sourcePathSums']==[14,16,21,14] and REVIEW['sourceEqualPathNumbers']==[1,4]
assert MATH['source']['sums']==[14,16,21,14]
print('PASS Applied8 Q30: source die image pixel-exact; visible orientation/path traces independently simulated; source answer 1 and 4; all 8 diagrams verified; 243-item r27 index valid.')

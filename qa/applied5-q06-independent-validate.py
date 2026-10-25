#!/usr/bin/env python3
"""Exact source/figure/answer audit and independent arithmetic for Applied 5 Q6."""
import hashlib, itertools, json, xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageChops
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5'
DATA = ROOT / 'bank/data/applied5-expanded.json'
INDEX = ROOT / 'bank/data/applied5-expanded-index.json'
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
REVIEW = json.loads((WORK / 'q06-source-answer-review.json').read_text())
VERSION = '20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11'
TARGETS = [1510, 1630, 1750, 1880, 2010, 2140, 2230, 2400, 2600]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def direct(total): return [(m,a,t,h) for m,a,t,h in itertools.permutations(range(10),4) if m and 1000*m+200*a+30*t+4*h==total]
def carry(total):
    th,hu,te,un = map(int, str(total)); out=[]
    for h in range(10):
        c1,u=divmod(4*h,10)
        if u!=un: continue
        for t in range(10):
            c2,v=divmod(3*t+c1,10)
            if v!=te or t==h: continue
            for a in range(10):
                c3,w=divmod(2*a+c2,10); m=th-c3
                if w==hu and len({m,a,t,h})==4 and 1<=m<=9: out.append((m,a,t,h))
    return out

data=json.loads(DATA.read_text()); index=json.loads(INDEX.read_text())
assert data['version']==index['version']==VERSION
assert len(data['items'])==index['itemCount']==162
assert data['availableSourceNos']==sorted(data['availableSourceNos']) and 6 in data['availableSourceNos'] and 6 not in data['pendingSourceNos']
assert len(PdfReader(str(EXAM)).pages)==6 and len(PdfReader(str(ANSWER)).pages)==31
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
assert REVIEW['sourceExam']['questionNo']==6 and REVIEW['sourceExam']['page']==1
assert REVIEW['sourceAnswer']['page']==6 and REVIEW['sourceAnswer']['digits']=={'M':1,'A':4,'T':6,'H':5}
assert direct(2000)==carry(2000)==[(1,4,6,5)]
render=ROOT/REVIEW['sourceFigure']['render']; crop=ROOT/REVIEW['sourceFigure']['crop']; box=tuple(REVIEW['sourceFigure']['cropBoxPixels'])
exact=Image.open(render).convert('RGB').crop(box); saved=Image.open(crop).convert('RGB')
assert exact.size==saved.size and ImageChops.difference(exact,saved).getbbox() is None
assert sha(crop)==REVIEW['sourceFigure']['cropSha256']
items=[x for x in data['items'] if x['sourceNo']==6]
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
for item,total in zip(items,TARGETS):
    p=item['verification']['parameters']; ans=direct(total)
    assert p['total']==total and len(ans)==len(carry(total))==1 and ans==carry(total)
    assert item['answerParts']==list(ans[0]) and item['pointBand']=='2.7' and item['difficultyEvidence']['label']=='하'
    assert item['verification']['sourceDrawingCompared'] is True and item['verification']['sourceAnswerPage']==6
    assert len(item['solutionSteps'])>=3 and all(str(d) in item['solution'] for d in ans[0])
    assert item['asset']['src']==f'assets/applied5/q06-v{item["variantNo"]}.svg'
    svg=ET.parse(ROOT/'bank'/item['asset']['src']).getroot()
    texts=[x.text for x in svg.iter() if x.tag.endswith('text') and x.text]
    assert texts[:4]==['M','A','T','H'] and texts[-4:]==list(str(total))
assert len({x['verification']['parameters']['total'] for x in items})==9
out=WORK/'q06-independent-math.json'; out.write_text(json.dumps({'suite':Path(__file__).name,'dataSha256':sha(DATA),'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceTuple':[1,4,6,5],'targets':TARGETS,'variants':len(items),'allUniqueByDirectAndCarrySolvers':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied5 Q6: source PDFs and exact figure crop, handwritten answer, 9 unique sums, direct permutation plus independent carry solver, solutions/assets/index.')

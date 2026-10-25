#!/usr/bin/env python3
"""PDF figure/answer audit and independent color-value enumeration for Applied5 Q9."""
import hashlib,itertools,json,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image,ImageChops
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];W=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=ROOT/'bank/data/applied5-expanded.json';INDEX=ROOT/'bank/data/applied5-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
REVIEW=json.loads((W/'q09-source-answer-review.json').read_text());VERSION='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-r11'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def values(p):
 rows=p['counts'][:3];sums=p['knownTotals'][:3]
 return [(w,b,g) for w,b,g in itertools.product(range(31),repeat=3) if all(r[0]*w+r[1]*b+r[2]*g==s for r,s in zip(rows,sums))]
D=json.loads(DATA.read_text());I=json.loads(INDEX.read_text())
assert D['version']==I['version']==VERSION and len(D['items'])==I['itemCount']==162
assert 9 in D['availableSourceNos'] and 9 not in D['pendingSourceNos']
assert len(PdfReader(str(EXAM)).pages)==6 and len(PdfReader(str(ANSWER)).pages)==31
assert sha(EXAM)==REVIEW['sourceExam']['sha256'] and sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
assert REVIEW['sourceExam']['page']==2 and REVIEW['sourceAnswer']['page']==9 and REVIEW['sourceAnswer']['teacherAnswer']==45
orig={'counts':[[2,2,1],[2,1,2],[1,2,2],[0,2,3]],'knownTotals':[35,45,40],'targetCounts':[0,2,3]}
assert values(orig)==[(8,3,13)] and 2*3+3*13==45
render=ROOT/REVIEW['sourceFigure']['render'];crop=ROOT/REVIEW['sourceFigure']['crop'];box=tuple(REVIEW['sourceFigure']['cropBoxPixels'])
actual=Image.open(render).convert('RGB').crop(box);saved=Image.open(crop).convert('RGB')
assert actual.size==saved.size and ImageChops.difference(actual,saved).getbbox() is None and sha(crop)==REVIEW['sourceFigure']['sha256']
proof=W/'q09-source/answer-q09-proof.png';assert proof.is_file() and sha(proof)==REVIEW['answerProof']['sha256']
items=[x for x in D['items'] if x['sourceNo']==9];assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
patterns=set();answers=set()
for item,entry in zip(items,REVIEW['variants']):
 p=item['verification']['parameters'];sol=values(p);assert len(sol)==entry['validAssignmentCount']==1
 assert list(sol[0])==p['hiddenWeights']==entry['weights']
 expect=sum(a*b for a,b in zip(p['targetCounts'],sol[0]))
 assert item['answer']==str(expect)==entry['answer'] and item['answerParts']==[expect]
 assert item['pointBand']=='2.7' and item['difficultyEvidence']['label']=='하'
 assert item['area']=='수와 식' and item['subarea']=='규칙과 대응' and item['detailType']=='색깔별 값의 합으로 수 찾기'
 assert item['verification']['sourceDrawingCompared'] is True and item['verification']['sourceAnswerPage']==9
 assert len(p['counts'])==4 and all(sum(r)==5 for r in p['counts']) and p['counts'][3]==p['targetCounts']
 pattern=tuple(tuple(r) for r in p['counts']);assert pattern not in patterns;patterns.add(pattern)
 asset=ROOT/'bank'/item['asset']['src'];svg=ET.parse(asset).getroot();ns={'s':'http://www.w3.org/2000/svg'}
 circles=svg.findall('s:circle',ns);texts=svg.findall('s:text',ns)
 assert len(circles)==20 and [int(t.text) for t in texts]==[sum(r[i]*sol[0][i] for i in range(3)) for r in p['counts']]
 assert len(item['solutionSteps'])==3 and '힌트' not in item['text']
 answers.add(expect)
assert len(patterns)==9 and len(answers)>=4
out=W/'q09-independent-math.json';out.write_text(json.dumps({'suite':Path(__file__).name,'dataSha256':sha(DATA),'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceWeights':[8,3,13],'sourceAnswer':45,'variantCount':9,'uniqueColorWeightsByBoundedEnumeration':True,'uniquePatterns':len(patterns)},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied5 Q9: exact source crop, teacher answer, 9 independent SVGs, exhaustive unique integer color assignments and target sums.')

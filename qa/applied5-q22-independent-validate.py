#!/usr/bin/env python3
"""Independently enumerate all valid Applied 5 Q22 arrangements and audit source/data."""
import hashlib,itertools,json
from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image,ImageChops
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5';OUT=WORK/'q22-r16'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text());INDEX=json.loads((ROOT/'bank/data/applied5-expanded-index.json').read_text())
REVIEW=json.loads((WORK/'q22-source-answer-review-r16.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
SOURCE_RENDER=WORK/'q22-source-p4-direct.png';ANSWER_RENDER=WORK/'q22-answer-p22-direct.png'
POOLS=[tuple(range(1,10))]+[tuple(d for d in range(10) if d!=m) for m in (9,8,7,6,5,4,3,2)]
TARGETS=[1638,1638,1639,1640,1641,1642,1643,1635,1636]
BOX=(910,1210,1790,1880);ANSWER_BOX=(800,150,2304,1296)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def calc(p):return [100*p[0]+10*p[1]+p[2],100*p[3]+10*p[4]+p[5],100*p[6]+10*p[7]+p[8]]
def brute(ds,target):
 return [calc(p) for p in itertools.permutations(ds) if p[0] and p[3] and p[6] and sum(calc(p))==target]

assert sha(EXAM)==REVIEW['sourceExam']['sha256']=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
assert sha(ANSWER)==REVIEW['sourceAnswer']['sha256']=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
assert len(PdfReader(str(EXAM)).pages)==6 and len(PdfReader(str(ANSWER)).pages)==31
src=Image.open(SOURCE_RENDER);crop=src.crop(BOX);saved=Image.open(WORK/'q22-source-figure-original-crop.png')
assert crop.size==saved.size and ImageChops.difference(crop,saved).getbbox() is None
ans=Image.open(ANSWER_RENDER);answer_crop=ans.crop(ANSWER_BOX);saved_answer=Image.open(WORK/'q22-answer-candidate-original-crop.png')
assert answer_crop.size==saved_answer.size and ImageChops.difference(answer_crop,saved_answer).getbbox() is None
src_txt=''.join((WORK/'q22-source-page-4-vision.txt').read_text().split())
assert '관호는아래식을계산하는데더하는숫자들중에몇개를' in src_txt and '1638' in src_txt
ans_txt=(WORK/'q22-answer-page-22-vision.txt').read_text()
assert '22.' in ans_txt and all(s in ans_txt for s in ('1638','136','524','978'))
ptext=''.join((PdfReader(str(EXAM)).pages[3].extract_text() or '').split())
assert '답이이1638.' in ptext and '되도록더하는숫자들중몇개의위치를서로바꿔보세요' in ptext
assert REVIEW['sourceNumbers']==[732,564,918] and REVIEW['sourceActualSum']==2214 and REVIEW['targetSum']==1638
assert REVIEW['sourceAnswer']['officialKeyStatus'].startswith('손글씨 답안 후보만 확인')
assert DATA['version'].endswith('q22-r16') and len(DATA['items'])==INDEX['itemCount']==207 and INDEX['version']==DATA['version']
assert DATA['availableSourceNos']==list(range(1,23))+[30] and DATA['pendingSourceNos']==INDEX['pendingSourceNos']==[23,24,25,26,27,28,29]
assert DATA['reviewSummary']['independentMathCount']==207 and DATA['reviewSummary']['sourceTypes']==23
items=[x for x in DATA['items'] if x['sourceNo']==22]
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
results=[]
for i,(item,ds,target) in enumerate(zip(items,POOLS,TARGETS),1):
 accepted=brute(ds,target); claimed=item['acceptedAnswerParts']; p=item['verification']['parameters']
 assert len(accepted)==len(claimed)==p['answerArrangementCount']
 assert accepted==claimed
 assert item['answerContract']=='unordered-set' and item['answerParts'] in accepted
 assert item['area']=='수와 식' and item['subarea']=='자릿값과 덧셈' and item['pointBand']=='3.4'
 assert item['difficultyEvidence']['label']=='중' and item['difficultyEvidence']['basis']=='source-point-band'
 assert item['verification']['sourceExamPage']==4 and item['verification']['sourceAnswerPage']==22
 assert item['verification']['sourceDrawingCompared'] and item['verification']['sourceDrawingPresent']
 assert p['digitPool']==list(ds) and p['targetSum']==target and sum(p['startingNumbers'])!=target
 for triple in accepted:
  flat=''.join(map(str,triple));assert len(flat)==9 and sorted(map(int,flat))==sorted(ds)
  assert all(n>=100 for n in triple) and sum(triple)==target
 svg=ET.parse(ROOT/'bank'/item['asset']['src']).getroot();ns={'s':'http://www.w3.org/2000/svg'}
 assert svg.attrib['viewBox']=='0 0 650 310' and len(svg.findall('.//s:rect',ns))==10
 assert item['asset']['src']==f'assets/applied5/q22-v{i}.svg'
 assert len(item['solutionSteps'])==4 and item['learningLocation'].startswith('활용 5회 · 원문 22번')
 results.append({'variant':i,'digits':list(ds),'target':target,'validArrangements':len(accepted),'canonical':item['answerParts'],'allAcceptedRecomputed':True})
assert tuple([796,524,318]) in {tuple(a) for a in items[0]['acceptedAnswerParts']}
assert tuple([136,524,978]) in {tuple(a) for a in items[0]['acceptedAnswerParts']}
result={'result':'PASS','sourceExamPage':4,'annotatedAnswerCandidatePage':22,'officialKeyConfirmed':False,'sourceCropExact':True,'teacherMarkedExamplesRecomputed':True,
 'dataVersion':DATA['version'],'itemCount':207,'sourceTypes':23,'pendingSourceNos':DATA['pendingSourceNos'],'newTypes':1,'variants':results,
 'dataSha256':sha(ROOT/'bank/data/applied5-expanded.json'),'indexSha256':sha(ROOT/'bank/data/applied5-expanded-index.json')}
(OUT/'q22-independent-math-r16.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))

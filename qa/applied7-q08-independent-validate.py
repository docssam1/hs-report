#!/usr/bin/env python3
"""Independently verify source figures, all Q08 rule examples, and generated answers."""
import hashlib, json, re, subprocess
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'bank/data/applied7-expanded.json').read_text())
INDEX=json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
PROOF=json.loads((ROOT/'.private-work/hw-expansion-20261023/hw7/q08-independent-math-r29.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')
assert EXAM.is_file() and ANSWER.is_file() and PDFTOTEXT.is_file()
def page_text(p): return subprocess.check_output([str(PDFTOTEXT),'-layout','-f','2','-l','2',str(p),'-'],text=True,errors='replace')
exam_text=page_text(EXAM); answer_text=page_text(ANSWER)
assert '규칙을 찾아 ㄱ에 알맞은 수를 구하시오.' in exam_text
assert '규칙을 찾아 ㄱ에 알맞은 수를 구하시오.' in answer_text
items=[x for x in DATA['items'] if x['sourceNo']==8]
assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
assert DATA['itemCount']==270 and len(DATA['availableSourceNos'])==30 and DATA['pendingSourceNos']==[]
assert INDEX['itemCount']==270 and INDEX['pendingSourceNos']==[]
source_asset=ROOT/'bank/assets/applied7/q08-number-rule-original.png'
source_hash=hashlib.sha256(source_asset.read_bytes()).hexdigest()
assert source_hash==PROOF['sourceFigureSha256'] and source_asset.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
assert PROOF['sourceRule']=='윗수×오른쪽 아래 수÷왼쪽 아래 수'
assert [(x['top'],x['left'],x['right']) for x in PROOF['sourceExamples']]==[(2,4,6),(4,6,9),(8,4,2)]
assert [x['inside'] for x in PROOF['sourceExamples']]==[3,6,4]
assert PROOF['sourceAnswerDerived']==9
for item,proof in zip(items,PROOF['variants']):
    assert item['answer']==str(proof['answer']) and item['answerParts']==[proof['answer']]
    assert item['pointBand']=='2.7' and item['difficultyEvidence']['label']=='하'
    assert item['reviewStatus']=='verified' and len(item['solutionSteps'])==3
    assert item['verification']['sourceDrawingCompared'] and item['verification']['sourceDrawingPresent']
    assert item['verification']['sourceExamPage']==item['verification']['sourceAnswerPage']==2
    p=item['verification']['parameters']
    for ex in p['examples']:
        assert ex['left']*ex['inside']==ex['top']*ex['right']
        assert Fraction(ex['top']*ex['right'],ex['left']).denominator==1
    q=p['query']; claimed=int(item['answer'])
    assert q['left']*claimed==q['top']*q['right']
    assert Fraction(q['top']*q['right'],q['left'])==claimed
    assert proof['queryCrossProduct']['matches']
    asset=ROOT/'bank'/item['asset']['src']
    assert asset.is_file() and asset.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
    if item['variantNo']==1:
        assert item['asset']['src']=='assets/applied7/q08-number-rule-original.png'
        assert hashlib.sha256(asset.read_bytes()).hexdigest()==source_hash
    else:
        assert item['asset']['src'].endswith(f'q08-rule-variant-{item["variantNo"]}-r29.png')
print(json.dumps({'result':'PASS','sourceExamples':[3,6,4],'derivedSourceAnswer':9,
 'variantAnswers':[int(x['answer']) for x in items],'bankItems':DATA['itemCount'],'bankTypes':len(DATA['availableSourceNos']),
 'pending':DATA['pendingSourceNos'],'sourceImageSha256':source_hash},ensure_ascii=False))

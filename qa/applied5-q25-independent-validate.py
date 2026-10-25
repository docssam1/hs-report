#!/usr/bin/env python3
"""Verify Applied5 Q25 source crop and independently derive all nine region counts."""
import hashlib, json
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw5'
DATA = json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
INDEX = json.loads((ROOT/'bank/data/applied5-expanded-index.json').read_text())
REVIEW = json.loads((WORK/'q25-source-answer-review-r20.json').read_text())
EXAM = ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
TARGETS = [3,4,5,7,8,9,10,11,12]

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    assert sha(EXAM) == REVIEW['sourceExam']['sha256'] == '5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER) == REVIEW['sourceAnswer']['sha256'] == '6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert REVIEW['sourceExam']['page'] == 5 and REVIEW['sourceAnswer']['page'] == 25
    page = Image.open(ROOT/REVIEW['sourceExam']['visualPage'])
    crop = page.crop(tuple(REVIEW['sourceExam']['cropBoxPixels']))
    asset_path = ROOT/REVIEW['sourceExam']['figureCrop']
    asset = Image.open(asset_path)
    assert crop.size == asset.size == (605,260)
    assert ImageChops.difference(crop,asset).getbbox() is None
    assert sha(asset_path) == REVIEW['sourceExam']['cropSha256']
    assert DATA['version'].endswith('q27-q28-q29-r23') and INDEX['version'] == DATA['version']
    assert len(DATA['items']) == INDEX['itemCount'] == 270
    assert len(DATA['availableSourceNos']) == 30
    assert DATA['pendingSourceNos'] == INDEX['pendingSourceNos'] == []
    items = [x for x in DATA['items'] if x['sourceNo']==25]
    assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
    assert [x['smallCircles'] for x in REVIEW['variants']] == TARGETS
    assert REVIEW['sourceAnswer']['handwrittenCandidate'] == 37
    assert REVIEW['sourceAnswer']['officialKeyStatus'] == '손글씨 답안 후보만 확인. 공식 채점표인지 확인되지 않음.'
    assert 6**2+1 == sum(2*k-1 for k in range(1,7))+1 == 37
    results=[]
    for item,n in zip(items,TARGETS):
        answer=n*n+1
        increments=[2*k-1 for k in range(1,n+1)]
        # General position: the k-th circle has one boundary tangency and two
        # distinct crossings with each of its k-1 predecessors.
        assert sum(increments)+1 == answer
        assert item['answerParts']==[answer] and item['answer']==str(answer)
        assert item['acceptedAnswers']==[str(answer),f'{answer}개']
        assert item['answerContract']=='single-number'
        assert item['verification']['parameters']['smallCircles']==n
        assert item['verification']['parameters']['increments']==increments
        assert item['verification']['parameters']['tripleIntersections']==0
        assert item['verification']['sourceDrawingCompared'] is True
        assert item['verification']['variantDrawingType']=='exact-original-example-crop-reused-no-redraw'
        assert item['asset']['src']=='assets/applied5/q25-source-two-circles-example.png'
        assert item['pointBand']=='4.2' and item['difficultyEvidence']['label']=='상'
        assert len(item['solutionSteps'])==3
        assert '보기' in item['text'] and str(n) in item['text']
        results.append({'id':item['id'],'smallCircles':n,'increments':increments,'answer':answer,'passed':True})
    out={'result':'PASS','version':DATA['version'],'dataSha256':sha(ROOT/'bank/data/applied5-expanded.json'),
         'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceFigurePixelExact':True,
         'sourceCandidate37Reproduced':True,'officialKeyUnconfirmed':True,'variants':results,
         'pending':DATA['pendingSourceNos']}
    target=WORK/'q25-independent-math-r20.json';target.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    print('PASS Applied5 Q25: source PDFs/pages and exact original example crop; candidate 37 reproduced; nine distinct circle-count variants independently summed.')

if __name__=='__main__': main()

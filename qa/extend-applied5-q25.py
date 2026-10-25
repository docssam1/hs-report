#!/usr/bin/env python3
"""Add nine circle-region variants using the exact Q25 source example figure."""
import hashlib,json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA_PATH=ROOT/'bank/data/applied5-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied5-expanded-index.json'
ASSET_DIR=ROOT/'bank/assets/applied5'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE=WORK/'q25-source-review/exam-5.png'
ANSWER_PAGE=WORK/'q25-source-review/answer-25.png'
CROP=ASSET_DIR/'q25-source-two-circles-example.png'
BOX=(875,408,1480,668)
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
VERSION='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-q23-q24-q25-q26-r20'
TARGETS=[3,4,5,7,8,9,10,11,12]

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def make_item(variant,n):
    answer=n*n+1
    incremental=[2*k-1 for k in range(1,n+1)]
    steps=[
      '작은 원이 0개일 때 큰 원 안은 1개의 면입니다. 작은 원을 한 개 그리면 큰 원의 경계에 한 점에서 닿으므로 면이 1개 늘어납니다.',
      f'작은 원을 {n}개까지 차례로 그릴 때, k번째 작은 원은 큰 원의 경계에 한 점에서 닿고 앞선 k−1개의 작은 원과 각각 두 점에서 만납니다. 세 원이 한 점에서 만나지 않도록 놓으면 새 원이 더하는 면은 2(k−1)+1=2k−1개입니다.',
      f'따라서 더해지는 면의 수는 {"+".join(map(str,incremental))}이고, 합은 {n}²={answer-1}입니다. 처음 있던 한 면까지 더하면 {answer}개입니다.'
    ]
    return {'id':f'applied5-q25-v{variant}','genId':'applied5-q25','sourceSet':'applied','sourceRound':5,'sourceNo':25,'variantNo':variant,'reviewStatus':'verified',
      'area':'도형','subarea':'곡선과 영역','detailType':'서로 교차하는 원이 나누는 최대 면의 수','pointBand':'4.2',
      'text':f'아래 [보기]는 큰 원 안에 2개의 작은 원을 그려 넣어 큰 원을 5개의 면으로 나눈 것입니다. 가장 큰 원 안에 {n}개의 작은 원을 그려 넣었을 때 최대 몇 개의 면으로 나누어질까요?',
      'asset':{'kind':'raster','src':'assets/applied5/q25-source-two-circles-example.png','description':'활용 5회 원문 25번의 [보기]와 큰 원 및 작은 원 2개의 그림을 그대로 자른 이미지.','width':605,'height':260,'mimeType':'image/png'},
      'answer':str(answer),'answerParts':[answer],'answerLabels':['면의 수'],'acceptedAnswers':[str(answer),f'{answer}개'],'answerContract':'single-number',
      'solutionSteps':steps,'solution':' '.join(steps),
      'learningPoint':'새 원이 앞선 각 원 및 큰 원의 경계와 만나는 점의 수를 세어 면의 증가량을 구하기',
      'learningLocation':'활용 5회 · 원문 25번 · 원이 교차하여 나누는 면의 수',
      'verification':{'primaryMethod':'k번째 작은 원이 만드는 2k−1개 경계 호를 세어 증가량을 합한다.',
       'independentMethod':'추가량 1,3,5,…,2n−1의 합 n²과 6개 원의 손글씨 답 37을 교차 확인한다.',
       'parameters':{'smallCircles':n,'increments':incremental,'incrementTotal':n*n,'initialRegion':1,'answer':answer,
                     'pairwiseIntersectionsPerEarlierCircle':2,'outerBoundaryTangenciesPerNewCircle':1,'tripleIntersections':0},
       'independentSuite':'qa/applied5-q25-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceExamDriveFileId':EXAM_ID,
       'sourceAnswerPage':25,'sourceAnswerFile':ANSWER.name,'sourceAnswerDriveFileId':ANSWER_ID,'sourceDrawingCompared':True,'sourceDrawingPresent':True,
       'variantDrawingType':'exact-original-example-crop-reused-no-redraw','sourceAnswerStatus':'답안 PDF 25쪽의 손글씨 37을 확인하고 6²+1로 재현했다. 공식 정답표인지는 별도 확인되지 않음.',
       'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
       'rationale':'활용 5회 23~30번은 4.2점 배점대이며 활용 난도는 배점대만 적용한다.'}}

def main():
    assert sha(EXAM)=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER)=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert PAGE.is_file() and ANSWER_PAGE.is_file()
    im=Image.open(PAGE);CROP.parent.mkdir(parents=True,exist_ok=True);im.crop(BOX).save(CROP)
    crop=Image.open(CROP);assert crop.size==(605,260)
    assert (6*6+1)==37 and sum(2*k-1 for k in range(1,7))+1==37
    answers=[n*n+1 for n in TARGETS]
    assert answers==[10,17,26,50,65,82,101,122,145]
    assert len(set(answers))==9 and all(sum(2*k-1 for k in range(1,n+1))+1==n*n+1 for n in TARGETS)
    data=json.loads(DATA_PATH.read_text());idx=json.loads(INDEX_PATH.read_text())
    assert data['version'].endswith('q24-q26-r19') and 25 in data['pendingSourceNos'] and not any(x['sourceNo']==25 for x in data['items'])
    items=[make_item(i,n) for i,n in enumerate(TARGETS,1)]
    pos=max(i for i,x in enumerate(data['items']) if x['sourceNo']<25)+1
    data['items'][pos:pos]=items
    data['version']=VERSION;data['availableSourceNos']=sorted(set(data['availableSourceNos']+[25]));data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=25]
    data['reviewSummary'].update({'independentMathCount':243,'sourceTypes':27,'variantsPerType':9,'sourceDrawingCount':135})
    idx['items'].append({'sourceNo':25,'genId':'applied5-q25','area':'도형','subarea':'곡선과 영역','detailType':'서로 교차하는 원이 나누는 최대 면의 수','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
    idx['items'].sort(key=lambda x:x['sourceNo']);idx.update({'version':VERSION,'itemCount':len(data['items']),'pendingSourceNos':list(data['pendingSourceNos'])})
    assert len(data['items'])==idx['itemCount']==243
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':5,'questionNo':25,'directVisualReview':True,
                          'sourceText':'큰 원 안에 작은 원 2개를 그려 5개 면이 생기는 보기에서, 작은 원 6개일 때 가능한 최대 면의 수를 묻는다.',
                          'visualPage':str(PAGE.relative_to(ROOT)),'figureCrop':str(CROP.relative_to(ROOT)),'cropBoxPixels':BOX,'cropSha256':sha(CROP),'cropIsDirectSourcePixels':True,
                          'sourceGeometry':'두 작은 원은 큰 원 경계에 각각 한 점에서 닿고 서로 두 점에서 교차한다.'},
            'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':25,'directVisualReview':True,'visualPage':str(ANSWER_PAGE.relative_to(ROOT)),
                            'handwrittenCandidate':37,'officialKeyStatus':'손글씨 답안 후보만 확인. 공식 채점표인지 확인되지 않음.'},
            'sourceAnswerReproduced':{'smallCircles':6,'increments':[1,3,5,7,9,11],'regions':37,'independentSumOfOddNumbers':37},
            'variants':[{'smallCircles':n,'answer':n*n+1,'increments':[2*k-1 for k in range(1,n+1)]} for n in TARGETS],
            'newSourceTypes':0,'variantCount':9,'dataVersion':VERSION}
    (WORK/'q25-source-answer-review-r20.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    print('Built Applied5 Q25: nine distinct circle counts; exact original example crop reused; 6-circle handwritten answer candidate 37 reproduced.')
if __name__=='__main__':main()

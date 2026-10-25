#!/usr/bin/env python3
"""Add nine Q23 fraction-card variants, reusing the exact original diagram crop."""
import hashlib,json,math
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA_PATH=ROOT/'bank/data/applied5-expanded.json'; INDEX_PATH=ROOT/'bank/data/applied5-expanded-index.json'
ASSET_DIR=ROOT/'bank/assets/applied5'; EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE=WORK/'q23-source-review/exam-5.png'; ANSWER_PAGE=WORK/'q23-source-review/answer-23.png'
CROP=ASSET_DIR/'q23-source-cards.png'; BOX=(320,650,780,940)
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'; ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
VERSION='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-q23-q26-r18'
TARGETS=[(1,5),(1,12),(7,25),(19,35),(37,64),(29,67),(43,74),(11,76),(31,83)]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def enumerate_ratio(p,q):
    lo=max((1000+p-1)//p,(10000+q-1)//q)
    hi=min(9999//p,99999//q)
    end9=[]; thousands3=[]; valid=[]
    for k in range(lo,hi+1):
        n=p*k; d=q*k
        if n%10!=9:continue
        end9.append((k,n,d))
        if d//1000%10!=3:continue
        thousands3.append((k,n,d))
        digits=str(n)+str(d)
        if len(digits)==9 and len(set(digits))==9 and set(digits)==set('123456789'):
            valid.append((k,n,d))
    return {'lowerK':lo,'upperK':hi,'integerKCount':hi-lo+1,'numeratorEndsIn9Count':len(end9),
            'denominatorThousandsDigit3Count':len(thousands3),'allNineCardsUsedCount':len(valid),
            'solutions':[{'k':k,'numerator':n,'denominator':d} for k,n,d in valid]}
def make(no,p,q,proof):
    sol=proof['solutions'][0];n,d,k=sol['numerator'],sol['denominator'],sol['k']
    steps=[
      '그림에서 윗줄은 네 자리 분자이고 마지막 숫자가 9입니다. 아랫줄은 다섯 자리 분모이고 왼쪽에서 두 번째 숫자가 3입니다. 남은 일곱 칸에는 1, 2, 4, 5, 6, 7, 8을 한 번씩 써야 합니다.',
      f'분수가 {p}/{q}와 같으므로 분자와 분모는 각각 {p}×k와 {q}×k 꼴입니다. 네 자리·다섯 자리 범위에서 k를 살피고, 분자의 끝 숫자가 9이며 분모의 천의 자리 숫자가 3인 경우를 고릅니다.',
      f'이 조건을 만족하는 k는 카드 숫자까지 확인하면 {k} 하나뿐입니다. 따라서 분자는 {p}×{k}={n}, 분모는 {q}×{k}={d}이고, 완성한 분수는 {n}/{d}입니다.'
    ]
    return {'id':f'applied5-q23-v{no}','genId':'applied5-q23','sourceSet':'applied','sourceRound':5,'sourceNo':23,'variantNo':no,'reviewStatus':'verified',
      'area':'경우의 수','subarea':'숫자 카드의 배열','detailType':'서로 다른 숫자 카드로 주어진 비와 같은 분수 만들기','pointBand':'4.2',
      'text':f'1부터 9까지 적힌 카드가 한 장씩 있습니다. 윗줄은 분자, 아래 줄은 분모로 생각할 때, 아홉 개의 카드를 그림과 같이 배열하여 {p}/{q}와 같은 분수를 만드세요.',
      'asset':{'kind':'raster','src':'assets/applied5/q23-source-cards.png','description':'활용 5회 원문 23번 카드 그림을 그대로 자른 그림. 마지막 분자 칸에는 9, 분모 왼쪽에서 두 번째 칸에는 3이 인쇄되어 있다.','width':460,'height':290,'mimeType':'image/png'},
      'answer':f'{n}/{d}','answerParts':[n,d],'answerLabels':['분자','분모'],'acceptedAnswers':[f'{n}/{d}',f'{n}, {d}'],'answerContract':'ordered-parts',
      'solutionSteps':steps,'solution':' '.join(steps),
      'learningPoint':'분자와 분모가 목표 비의 같은 배수임을 이용하고, 고정된 카드와 모든 숫자를 한 번씩 쓰는 조건으로 가능한 배열을 찾기',
      'learningLocation':'활용 5회 · 원문 23번 · 숫자 카드로 비와 같은 분수 만들기',
      'verification':{'primaryMethod':'목표 분수 p/q의 공통 배수 k를 두고 자릿수 범위, 그림의 고정 숫자, 카드 전체 조건을 차례로 적용한다.',
       'independentMethod':'허용된 정수 k를 전부 훑어 끝자리 9, 분모 천의 자리 3, 숫자 1~9의 중복 없는 완전 사용을 독립 검사한다.',
       'parameters':{'targetNumerator':p,'targetDenominator':q,**proof,'multiplier':k,'answerNumerator':n,'answerDenominator':d},
       'independentSuite':'qa/applied5-q23-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceExamDriveFileId':EXAM_ID,
       'sourceAnswerPage':23,'sourceAnswerFile':ANSWER.name,'sourceAnswerDriveFileId':ANSWER_ID,'sourceDrawingCompared':True,'sourceDrawingPresent':True,
       'variantDrawingType':'exact-original-diagram-crop-reused-no-redraw','sourceAnswerStatus':'답안 PDF 23쪽 손글씨 배열 6729/13458을 확인했다. 공식 정답표인지 확인되지는 않았으나 원문 1/2 조건의 유일 배열로 독립 재현했다.',
       'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
       'rationale':'활용 5회 23~30번은 4.2점 배점대이며 활용 난도는 배점대만 적용한다.'}}
def main():
    assert sha(EXAM)=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER)=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert PAGE.is_file() and ANSWER_PAGE.is_file()
    im=Image.open(PAGE); CROP.parent.mkdir(parents=True,exist_ok=True); im.crop(BOX).save(CROP)
    crop=Image.open(CROP); assert crop.size==(460,290)
    proof=[enumerate_ratio(*t) for t in TARGETS]
    assert all(p['allNineCardsUsedCount']==1 for p in proof)
    assert len({(p['solutions'][0]['numerator'],p['solutions'][0]['denominator']) for p in proof})==9
    data=json.loads(DATA_PATH.read_text());index=json.loads(INDEX_PATH.read_text())
    assert data['version'].endswith('q26-r17') and 23 in data['pendingSourceNos'] and not any(i['sourceNo']==23 for i in data['items'])
    items=[make(i,p,q,proof[i-1]) for i,(p,q) in enumerate(TARGETS,1)]
    pos=max(i for i,x in enumerate(data['items']) if x['sourceNo']<23)+1;data['items'][pos:pos]=items
    data['version']=VERSION;data['availableSourceNos']=sorted(set(data['availableSourceNos']+[23]));data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=23]
    data['reviewSummary'].update({'independentMathCount':225,'sourceTypes':25,'variantsPerType':9,'sourceDrawingCount':117})
    index['items'].append({'sourceNo':23,'genId':'applied5-q23','area':'경우의 수','subarea':'숫자 카드의 배열','detailType':'서로 다른 숫자 카드로 주어진 비와 같은 분수 만들기','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
    index['items'].sort(key=lambda x:x['sourceNo']);index.update({'version':VERSION,'itemCount':len(data['items']),'pendingSourceNos':list(data['pendingSourceNos'])})
    assert len(data['items'])==index['itemCount']==225
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':5,'questionNo':23,'directVisualReview':True,
                          'sourceText':'1~9 카드 각 1장. 윗줄은 분자, 아랫줄은 분모. 아홉 카드를 배열하여 1/2와 같은 분수를 만든다.',
                          'visualPage':str(PAGE.relative_to(ROOT)),'figureCrop':str(CROP.relative_to(ROOT)),'cropBoxPixels':BOX,'cropSha256':sha(CROP),'cropIsDirectSourcePixels':True,
                          'figure':{'numeratorSlots':4,'denominatorSlots':5,'fixedNumeratorUnits':9,'fixedDenominatorThousands':3,'remainingDigits':[1,2,4,5,6,7,8]}},
            'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':23,'directVisualReview':True,'visualPage':str(ANSWER_PAGE.relative_to(ROOT)),
                            'handwrittenCandidate':[6729,13458],'officialKeyStatus':'손글씨 답안 후보로 표시. 공식 답안표 여부 미확인.'},
            'sourceAnswerReproduced':{'target':'1/2','uniqueArray':[6729,13458],'proof':enumerate_ratio(1,2)},
            'variants':[{ 'target':f'{p}/{q}',**r} for (p,q),r in zip(TARGETS,proof)],'newSourceTypes':0,'variantCount':9,'dataVersion':VERSION}
    (WORK/'q23-source-answer-review-r18.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    print('Built Applied5 Q23: nine target fractions, original diagram crop reused unchanged, each has one full-card solution.')
if __name__=='__main__':main()

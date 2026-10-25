#!/usr/bin/env python3
"""Add nine Q24 placement-count variants using an exact crop of the source figure."""
import hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA_PATH=ROOT/'bank/data/applied5-expanded.json';INDEX_PATH=ROOT/'bank/data/applied5-expanded-index.json'
ASSET_DIR=ROOT/'bank/assets/applied5';EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE=WORK/'q23-source-review/exam-5.png';ANSWER_PAGE=WORK/'q24-source-review/answer.png';CROP=ASSET_DIR/'q24-source-calendar-piece.png';BOX=(100,1500,900,2020)
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp';ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
VERSION='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-q23-q24-q26-r19'
THRESHOLDS=[61,65,69,73,77,81,85,89,93]

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def calendar():
    return [[None if not 1<=r*7+c-3<=31 else r*7+c-3 for c in range(7)] for r in range(5)]
def placements():
    cal=calendar();out={'right':[],'left':[]}
    for orient,sgn in [('right',1),('left',-1)]:
        for r in range(3):
            for c in range(7):
                cells=[(r,c),(r+1,c),(r+1,c+sgn),(r+2,c)]
                if all(0<=rr<5 and 0<=cc<7 and cal[rr][cc] is not None for rr,cc in cells):
                    nums=[cal[rr][cc] for rr,cc in cells];out[orient].append({'start':nums[0],'cells':cells,'numbers':nums,'sum':sum(nums)})
    return out
def make_item(no,threshold,all_places):
    right=all_places['right'];left=all_places['left'];rc=sum(x['sum']>threshold for x in right);lc=sum(x['sum']>threshold for x in left);answer=rc+lc
    rstarts=[x['start'] for x in right];lstarts=[x['start'] for x in left]
    steps=[
      '조각은 세로로 이어진 3칸과 가운데 칸 옆의 1칸으로 이루어져 있습니다. 좌우로 뒤집을 수 있으므로 오른쪽으로 튀어나온 모양과 왼쪽으로 튀어나온 모양, 두 방향만 살핍니다.',
      f'달력의 숫자만 사용할 수 있는 시작 날짜는 오른쪽 모양에서 {", ".join(map(str,rstarts))}일, 왼쪽 모양에서 {", ".join(map(str,lstarts))}일입니다. 세로로 7씩, 옆 칸은 1씩 차이 나므로 각 시작 날짜를 x라 하면 두 모양의 네 수 합은 각각 4x+29, 4x+27입니다.',
      f'합이 {threshold}보다 큰 경우를 세면 오른쪽 모양 {rc}가지, 왼쪽 모양 {lc}가지입니다. 따라서 모두 {rc}+{lc}={answer}가지입니다.'
    ]
    return {'id':f'applied5-q24-v{no}','genId':'applied5-q24','sourceSet':'applied','sourceRound':5,'sourceNo':24,'variantNo':no,'reviewStatus':'verified',
      'area':'경우의 수','subarea':'달력에서 도형 놓기','detailType':'달력 날짜 합 조건을 만족하는 좌우 뒤집기 배치 수','pointBand':'4.2',
      'text':f'어느 해 5월의 달력에 그림의 조각을 좌우 방향으로만 뒤집어서 놓으려고 합니다. 조각이 덮는 네 날짜의 합이 {threshold}보다 크게 되도록 놓는 방법은 모두 몇 가지인지 구하시오.',
      'asset':{'kind':'raster','src':'assets/applied5/q24-source-calendar-piece.png','description':'활용 5회 원문 24번의 5월 달력과 좌우 대칭으로 놓는 네 칸 조각을 그대로 자른 그림.','width':800,'height':520,'mimeType':'image/png'},
      'answer':str(answer),'answerParts':[answer],'answerLabels':['방법 수'],'acceptedAnswers':[str(answer),f'{answer}가지'],'answerContract':'single-number',
      'solutionSteps':steps,'solution':' '.join(steps),
      'learningPoint':'달력에서 모양이 놓일 수 있는 시작 날짜를 빠짐없이 찾고, 좌우 대칭 두 방향의 날짜 합을 따로 계산하기',
      'learningLocation':'활용 5회 · 원문 24번 · 달력에서 도형을 좌우로 뒤집어 놓는 경우의 수',
      'verification':{'primaryMethod':'좌우 두 방향별로 달력에 놓이는 시작 날짜를 전수 나열하고 날짜 합 공식을 적용한다.',
       'independentMethod':'5×7 달력 격자에서 날짜가 있는 칸만 남긴 뒤 모든 가능한 도형 셀 집합을 전수 탐색해 합계와 방향별 개수를 센다.',
       'parameters':{'threshold':threshold,'rightStarts':rstarts,'leftStarts':lstarts,'rightValidPlacements':len(right),'leftValidPlacements':len(left),
                     'rightQualifying':rc,'leftQualifying':lc,'rightSums':[x['sum'] for x in right],'leftSums':[x['sum'] for x in left],'answer':answer},
       'independentSuite':'qa/applied5-q24-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceExamDriveFileId':EXAM_ID,
       'sourceAnswerPage':24,'sourceAnswerFile':ANSWER.name,'sourceAnswerDriveFileId':ANSWER_ID,'sourceDrawingCompared':True,'sourceDrawingPresent':True,
       'variantDrawingType':'exact-original-calendar-and-piece-crop-reused-no-redraw','sourceAnswerStatus':'답안 PDF 24쪽 손글씨 8가지를 확인했다. 공식 정답표인지 확인되지는 않았으며 원문 달력에서 독립 재현했다.',
       'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
       'rationale':'활용 5회 23~30번은 4.2점 배점대이며 활용 난도는 배점대만 적용한다.'}}
def main():
    assert sha(EXAM)=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER)=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert PAGE.is_file() and ANSWER_PAGE.is_file()
    im=Image.open(PAGE);CROP.parent.mkdir(parents=True,exist_ok=True);im.crop(BOX).save(CROP);crop=Image.open(CROP);assert crop.size==(800,520)
    pp=placements();assert len(pp['right'])==14 and len(pp['left'])==15
    assert sum(x['sum']>80 for q in pp.values() for x in q)==8
    assert len({sum(x['sum']>t for q in pp.values() for x in q) for t in THRESHOLDS})==9
    data=json.loads(DATA_PATH.read_text());idx=json.loads(INDEX_PATH.read_text())
    assert data['version'].endswith('q23-q26-r18') and 24 in data['pendingSourceNos'] and not any(x['sourceNo']==24 for x in data['items'])
    items=[make_item(i,t,pp) for i,t in enumerate(THRESHOLDS,1)]
    pos=max(i for i,x in enumerate(data['items']) if x['sourceNo']<24)+1;data['items'][pos:pos]=items
    data['version']=VERSION;data['availableSourceNos']=sorted(set(data['availableSourceNos']+[24]));data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=24]
    data['reviewSummary'].update({'independentMathCount':234,'sourceTypes':26,'variantsPerType':9,'sourceDrawingCount':126})
    idx['items'].append({'sourceNo':24,'genId':'applied5-q24','area':'경우의 수','subarea':'달력에서 도형 놓기','detailType':'달력 날짜 합 조건을 만족하는 좌우 뒤집기 배치 수','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
    idx['items'].sort(key=lambda x:x['sourceNo']);idx.update({'version':VERSION,'itemCount':len(data['items']),'pendingSourceNos':list(data['pendingSourceNos'])})
    assert len(data['items'])==idx['itemCount']==234
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':5,'questionNo':24,'directVisualReview':True,
                          'sourceText':'5월 달력. 네 칸 조각을 좌우 방향으로만 뒤집어 놓는다. 네 수의 합이 80보다 큰 배치 수를 묻는다.',
                          'visualPage':str(PAGE.relative_to(ROOT)),'figureCrop':str(CROP.relative_to(ROOT)),'cropBoxPixels':BOX,'cropSha256':sha(CROP),'cropIsDirectSourcePixels':True,
                          'calendarMay1Weekday':'Thursday','calendarRows':5,'calendarColumns':7,'pieceCells':'three consecutive vertical cells and one adjacent cell at the middle'},
            'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':24,'directVisualReview':True,'visualPage':str(ANSWER_PAGE.relative_to(ROOT)),
                            'handwrittenCandidate':8,'officialKeyStatus':'손글씨 답안 후보만 확인. 공식 채점표인지 확인되지 않음.'},
            'sourceAnswerReproduced':{'threshold':80,'rightFacingCount':4,'leftFacingCount':4,'total':8,'placements':pp},
            'variants':[{'threshold':t,'answer':sum(x['sum']>t for q in pp.values() for x in q),'rightCount':sum(x['sum']>t for x in pp['right']),'leftCount':sum(x['sum']>t for x in pp['left'])} for t in THRESHOLDS],
            'newSourceTypes':0,'variantCount':9,'dataVersion':VERSION}
    (WORK/'q24-source-answer-review-r19.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    print('Built Applied5 Q24: nine thresholds; exact source calendar and piece crop reused; source answer candidate 8 reproduced.')
if __name__=='__main__':main()

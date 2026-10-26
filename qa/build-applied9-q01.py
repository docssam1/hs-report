#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add nine new grid figures for Applied 9 Q01 rectangle-counting variants."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied9-expanded.json';INDEX=ROOT/'bank/data/applied9-expanded-index.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 9회.pdf'
SOURCE_SHA='0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794'
ANSWER_SHA='a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62'
ANSWER_ID='1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'
ASSETS=ROOT/'bank/assets/applied9'
VERSION='20261025-applied9-q01-q02-q03-q05-q06-q07-q09-q10-q11-q13-q17-q18-q19-q21-q26-q27-q29-q30-r14'
# (rows, columns, circle row, circle col, spade row, spade col), zero-based cells.
PARAMS=[(3,4,1,2,2,1),(3,4,0,0,2,3),(3,4,0,1,2,2),(3,4,1,1,0,0),(3,4,1,1,0,3),(3,5,0,2,1,0),(3,5,0,1,2,4),(3,5,0,2,2,0),(4,4,1,1,3,2)]

def formula_count(R,C,r,c,s,t):
    circle=(r+1)*(R-r)*(c+1)*(C-c)
    both=(min(r,s)+1)*(R-max(r,s))*(min(c,t)+1)*(C-max(c,t))
    return circle,both,circle-both

def svg_for(R,C,r,c,s,t):
    cell=64; margin=28; w=2*margin+C*cell; h=2*margin+R*cell
    lines=[]
    for x in range(C+1):
        xx=margin+x*cell;lines.append(f'<line x1="{xx}" y1="{margin}" x2="{xx}" y2="{margin+R*cell}" stroke="#5b5142" stroke-width="2"/>')
    for y in range(R+1):
        yy=margin+y*cell;lines.append(f'<line x1="{margin}" y1="{yy}" x2="{margin+C*cell}" y2="{yy}" stroke="#5b5142" stroke-width="2"/>')
    cx=margin+(c+.5)*cell;cy=margin+(r+.5)*cell
    sx=margin+(t+.5)*cell;sy=margin+(s+.5)*cell
    spade=f'<path d="M {sx} {sy-17} C {sx-6} {sy-8}, {sx-18} {sy-2}, {sx-18} {sy+7} C {sx-18} {sy+19}, {sx-5} {sy+20}, {sx} {sy+12} C {sx+5} {sy+20}, {sx+18} {sy+19}, {sx+18} {sy+7} C {sx+18} {sy-2}, {sx+6} {sy-8}, {sx} {sy-17} Z M {sx-3} {sy+12} L {sx-7} {sy+23} L {sx+7} {sy+23} L {sx+3} {sy+12} Z" fill="#9a7028"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="#fff"/>{"".join(lines)}<circle cx="{cx}" cy="{cy}" r="12" fill="#c85c50" stroke="#8f3730" stroke-width="1.5"/>{spade}</svg>'

def main():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_SHA
    data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
    assert data['version'].endswith('-r13') and 1 in data['pendingSourceNos']
    additions=[];answers=[]
    for i,p in enumerate(PARAMS,1):
        R,C,r,c,s,t=p;circle,both,answer=formula_count(*p)
        fn=f'applied9-q01-v{i}.svg';asset=ASSETS/fn;asset.write_text(svg_for(*p),encoding='utf-8');digest=hashlib.sha256(asset.read_bytes()).hexdigest()
        steps=[f'●을 포함하는 직사각형은 위쪽 경계 {r+1}가지, 아래쪽 경계 {R-r}가지, 왼쪽 경계 {c+1}가지, 오른쪽 경계 {C-c}가지이므로 {r+1}×{R-r}×{c+1}×{C-c}={circle}개입니다.',f'●과 ♠을 모두 포함하는 직사각형은 위쪽 경계 {min(r,s)+1}가지, 아래쪽 경계 {R-max(r,s)}가지, 왼쪽 경계 {min(c,t)+1}가지, 오른쪽 경계 {C-max(c,t)}가지이므로 {min(r,s)+1}×{R-max(r,s)}×{min(c,t)+1}×{C-max(c,t)}={both}개입니다.',f'따라서 ●은 포함하고 ♠은 포함하지 않는 직사각형은 {circle}−{both}={answer}개입니다.']
        item={'id':f'applied9-q01-v{i}','genId':'applied9-q01','sourceSet':'applied','sourceRound':9,'sourceNo':1,'variantNo':i,'reviewStatus':'verified','area':'도형','subarea':'평면도형의 개수','detailType':'격자에서 표시 조건을 만족하는 직사각형 세기','pointBand':'2.7','text':'아래 도형에서 ●은 포함하고 ♠은 포함하지 않는 크고 작은 직사각형은 모두 몇 개입니까?','answer':str(answer),'answerParts':[answer],'answerLabels':['직사각형의 수'],'acceptedAnswers':[str(answer)],'answerContract':'single-number','asset':{'kind':'svg','src':f'assets/applied9/{fn}','description':'격자 안의 ● 표시와 ♠ 표시를 포함한 새 직사각형 세기 그림','sha256':digest},'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'한 점을 포함하는 직사각형을 센 뒤 두 표시를 함께 포함하는 경우를 빼기','learningLocation':'활용 9회 · 원문 1번 · 평면도형의 개수','verification':{'primaryMethod':'격자 경계의 선택 수를 곱해 ●을 포함하는 직사각형과 두 표시를 모두 포함하는 직사각형을 각각 세고 차를 구한다.','independentMethod':'모든 수평·수직 격자 경계쌍으로 직사각형을 전수 생성해 셀 포함 여부를 직접 검사한다.','parameters':{'rows':R,'columns':C,'circleCell':[r,c],'spadeCell':[s,t],'circleContainingRectangles':circle,'bothMarkersContainingRectangles':both,'answer':answer,'assetSha256':digest},'independentSuite':'qa/applied9-q01-independent-validate.py','sourceExamPage':1,'sourceExamFile':'초등과정 대비 실전 모의고사 활용 9회.pdf','sourceExamSha256':SOURCE_SHA,'sourceAnswerPage':1,'sourceAnswerFile':'초등과정 대비 실전 모의고사 특강 9회 답안.pdf','sourceAnswerDriveId':ANSWER_ID,'sourceAnswerSha256':ANSWER_SHA,'officialAnswerStatus':'Candidate answer page 1 gives 16; direct independent count confirms it. Candidate edition identity/official status remains unconfirmed.','sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingDescription':'Original page 1 grid has 4 columns × 3 rows; ● is in row 2 column 3 and ♠ in row 3 column 2. Original drawing retained unchanged.','variantUsesSourceDrawing':False,'variantDrawingModified':False,'userAuthorizedNewVariantFigures':True,'authorizationScope':'User approved new figures for all remaining Applied 9 visual question types, including Q01; original source figure remains unchanged.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}}
        additions.append(item);answers.append(answer)
    assert len(set(answers))==9
    items=sorted(data['items']+additions,key=lambda x:(x['sourceNo'],x['variantNo']))
    available=sorted({x['sourceNo'] for x in items});pending=[n for n in range(1,31) if n not in available]
    data.update(version=VERSION,items=items,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    data['sourceReview'].setdefault('questionReviews',{})['1']={'sourcePage':1,'sourceGrid':{'rows':3,'columns':4,'circleCell':[1,2],'spadeCell':[2,1]},'candidateAnswer':16,'independentAnswer':16,'status':'Candidate answer matches direct independent rectangle count; answer-edition identity remains unconfirmed.'}
    idx.update(version=VERSION,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    idx['items'].append({'sourceNo':1,'genId':'applied9-q01','area':'도형','subarea':'평면도형의 개수','detailType':'격자에서 표시 조건을 만족하는 직사각형 세기','pointBand':'2.7','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':'BUILT','version':VERSION,'added':9,'itemCount':len(items),'pending':pending,'answers':answers},ensure_ascii=False,indent=2))
if __name__=='__main__':main()

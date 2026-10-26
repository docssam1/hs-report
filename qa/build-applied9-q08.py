#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add nine relabeled balance-scale diagrams for Applied 9 Q08."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied9-expanded.json';INDEX=ROOT/'bank/data/applied9-expanded-index.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 9회.pdf';SOURCE_SHA='0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794'
ANSWER_SHA='a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62';ANSWER_ID='1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'
ASSETS=ROOT/'bank/assets/applied9';VERSION='20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q13-q17-q18-q19-q21-q26-q27-q29-q30-r16'
SOURCE_SCALES=[([1,2,5,8],[2,3,6,4],1),([2,6,9,10],[1,2,5],-1),([5,6,7],[1,2,3],-1)]
PERMS=[]
for shift in range(9):
    p=[((x-1+shift)%10)+1 for x in range(1,11)]
    if shift==0:p[1],p[2]=p[2],p[1]
    PERMS.append(p)

def svg_for(scales):
    W,H=480,360;rows=[55,170,285];parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="100%" height="100%" fill="#fff"/>']
    for row,(left,right,sign) in zip(rows,scales):
        yl=row+(8 if sign>0 else -8);yr=row-(8 if sign>0 else -8)
        parts.append(f'<line x1="95" y1="{yl}" x2="385" y2="{yr}" stroke="#5b5142" stroke-width="4" stroke-linecap="round"/>')
        for x,y,nums in ((95,yl,left),(385,yr,right)):
            parts.append(f'<line x1="{x}" y1="{y}" x2="{x}" y2="{row+22}" stroke="#8f816b" stroke-width="2"/>')
            parts.append(f'<path d="M {x-74} {row+22} Q {x} {row+54} {x+74} {row+22}" fill="#e9f0e7" stroke="#5b5142" stroke-width="2"/>')
            step=38;offset=(len(nums)-1)*step/2
            for j,n in enumerate(nums):
                bx=x-offset+j*step;by=row+7
                parts.append(f'<circle cx="{bx}" cy="{by}" r="17" fill="#f4d6ce" stroke="#a68c80" stroke-width="1.5"/><text x="{bx}" y="{by+7}" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" fill="#2a241c">{n}</text>')
        parts.append(f'<path d="M 240 {row+6} L 217 {row+50} L 263 {row+50} Z" fill="#e2d9c6" stroke="#5b5142" stroke-width="2"/><line x1="202" y1="{row+52}" x2="278" y2="{row+52}" stroke="#5b5142" stroke-width="3"/>')
    parts.append('</svg>');return ''.join(parts)

def weight(n,h,m):return 18 if n==h else 13 if n==m else 8
def main():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_SHA
    d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());assert d['version'].endswith('-r15') and 8 in d['pendingSourceNos']
    additions=[];answers=[]
    for i,perm in enumerate(PERMS,1):
        scales=[([perm[n-1] for n in left],[perm[n-1] for n in right],sgn) for left,right,sgn in SOURCE_SCALES]
        expected=perm[0];possible=[]
        for h in range(1,11):
            for m in range(1,11):
                if h==m:continue
                if all(sgn*(sum(weight(n,h,m) for n in left)-sum(weight(n,h,m) for n in right))>0 for left,right,sgn in scales):possible.append((h,m))
        assert possible and {h for h,m in possible}=={expected},(i,possible)
        fn=f'applied9-q08-v{i}.svg';asset=ASSETS/fn;asset.write_text(svg_for(scales),encoding='utf-8');digest=hashlib.sha256(asset.read_bytes()).hexdigest()
        mapped_h=perm[0];mapped_medium=perm[4];
        steps=[f'두 번째 저울에서는 오른쪽 구슬 수가 왼쪽보다 하나 적은데도 오른쪽이 더 무겁습니다. 오른쪽에서 공통으로 든 {perm[1]}번을 빼면 오른쪽은 {perm[0]}번과 {perm[4]}번, 왼쪽은 {perm[5]}번·{perm[8]}번·{perm[9]}번입니다. 8g짜리만으로는 오른쪽이 8g 가벼우므로 18g 구슬은 오른쪽의 두 번호 중 하나여야 합니다.',f'세 번째 저울은 양쪽 구슬 수가 같고 오른쪽이 더 무겁습니다. 18g 구슬이 {mapped_medium}번(왼쪽)이라면, 오른쪽에 13g 구슬이 있어도 18g 구슬의 5g 차이를 뒤집을 수 없습니다. 따라서 18g 구슬은 {mapped_h}번입니다.',f'전수 대입에서도 가능한 (18g 번호, 13g 번호)은 {possible}이며, 가장 무거운 구슬의 번호는 {mapped_h}입니다.']
        item={'id':f'applied9-q08-v{i}','genId':'applied9-q08','sourceSet':'applied','sourceRound':9,'sourceNo':8,'variantNo':i,'reviewStatus':'verified','area':'수와 식','subarea':'무게의 합과 비교 관계','detailType':'저울의 기울기와 무게 종류로 가장 무거운 구슬 찾기','pointBand':'2.7','text':'1부터 10까지의 수가 적힌 구슬이 있습니다. 8g짜리 구슬이 8개, 13g짜리 구슬이 1개, 18g짜리 구슬이 1개입니다. 같은 번호의 구슬은 무게가 모두 같을 때 가장 무거운 구슬에 적힌 수를 쓰시오.','answer':str(expected),'answerParts':[expected],'answerLabels':['18g 구슬의 번호'],'acceptedAnswers':[str(expected)],'answerContract':'single-number','asset':{'kind':'svg','src':f'assets/applied9/{fn}','description':'세 저울에서 서로 다른 번호 구슬들의 무게 비교를 나타낸 새 그림','sha256':digest},'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'저울의 기울기를 질량 부등식으로 바꾸고 가능한 무게 배치를 좁히기','learningLocation':'활용 9회 · 원문 8번 · 무게의 합과 비교 관계','verification':{'primaryMethod':'90가지(18g 번호, 13g 번호) 배치를 전부 계산해 세 저울의 방향과 비교한다.','independentMethod':'각 저울의 구슬 수 차이를 8g 기준 질량으로 먼저 비교하고, 특수 무게 구슬 위치를 경우별로 대입한다.','parameters':{'permutation':perm,'scales':[{'left':a,'right':b,'leftHeavier':sgn>0} for a,b,sgn in scales],'possibleHeavyAndMediumPairs':possible,'answer':expected,'assetSha256':digest},'independentSuite':'qa/applied9-q08-independent-validate.py','sourceExamPage':2,'sourceExamFile':'초등과정 대비 실전 모의고사 활용 9회.pdf','sourceExamSha256':SOURCE_SHA,'sourceAnswerPage':2,'sourceAnswerFile':'초등과정 대비 실전 모의고사 특강 9회 답안.pdf','sourceAnswerDriveId':ANSWER_ID,'sourceAnswerSha256':ANSWER_SHA,'officialAnswerStatus':'Candidate answer page 2 indicates number 1; exhaustive model confirms it. Candidate edition identity/official status remains unconfirmed.','sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingDescription':'Original page 2 has three balance scales: first left pan lower; second and third right pans lower. Original ball sets retained unchanged.','variantUsesSourceDrawing':False,'variantDrawingModified':False,'userAuthorizedNewVariantFigures':True,'authorizationScope':'User approved new figures for all remaining Applied 9 visual question types, including Q08; original source figure remains unchanged.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}}
        additions.append(item);answers.append(expected)
    assert len(set(answers))==9
    items=sorted(d['items']+additions,key=lambda x:(x['sourceNo'],x['variantNo']));available=sorted({x['sourceNo'] for x in items});pending=[n for n in range(1,31) if n not in available]
    d.update(version=VERSION,items=items,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    d['sourceReview'].setdefault('questionReviews',{})['8']={'sourcePage':2,'weightDistribution':{'8g':8,'13g':1,'18g':1},'sourceScaleConditions':{'scale1':'left heavier','scale2':'right heavier','scale3':'right heavier'},'candidateAnswer':1,'independentAnswer':1,'status':'Candidate answer agrees with exhaustive model; edition identity remains unconfirmed.'}
    idx.update(version=VERSION,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending);idx['items'].append({'sourceNo':8,'genId':'applied9-q08','area':'수와 식','subarea':'무게의 합과 비교 관계','detailType':'저울의 기울기와 무게 종류로 가장 무거운 구슬 찾기','pointBand':'2.7','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':'BUILT','version':VERSION,'added':9,'itemCount':len(items),'pending':pending,'answers':answers},ensure_ascii=False,indent=2))
if __name__=='__main__':main()

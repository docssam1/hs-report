#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add nine new triangle-number diagrams for Applied 9 Q04."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied9-expanded.json';INDEX=ROOT/'bank/data/applied9-expanded-index.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 9회.pdf'
SOURCE_SHA='0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794'
ANSWER_SHA='a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62';ANSWER_ID='1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'
ASSETS=ROOT/'bank/assets/applied9';VERSION='20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q09-q10-q11-q13-q17-q18-q19-q21-q26-q27-q29-q30-r15'
EXAMPLES=[(3,6,8),(4,5,10),(6,9,3),(5,10,8),(8,6,9),(3,9,12),(7,14,8),(6,4,10),(9,6,4),(4,8,6),(10,5,9),(5,3,12)]
TARGETS=[(6,8,12),(4,6,9),(4,2,4),(5,5,10),(6,3,6),(5,2,6),(7,3,3),(6,2,6),(5,3,3)]

def center(t,l,r):
    assert t*r%l==0
    return t*r//l

def svg_for(examples,target):
    W,H=780,250;centers=[90,290,490,690];parts=['<svg xmlns="http://www.w3.org/2000/svg" width="780" height="250" viewBox="0 0 780 250"><rect width="100%" height="100%" fill="#fff"/>']
    triples=examples+[target]
    for j,(top,left,right) in enumerate(triples):
        x=centers[j];yt=55;yb=172;xl=x-46;xr=x+46;yc=120
        parts.append(f'<path d="M {x} {yt+24} L {xl} {yb-20} L {xr} {yb-20} Z" fill="none" stroke="#5b5142" stroke-width="2.5"/>')
        for xx,yy,val in ((x,yt,top),(xl,yb,left),(xr,yb,right)):
            parts.append(f'<circle cx="{xx}" cy="{yy}" r="25" fill="#f4d6ce" stroke="#a68c80" stroke-width="1.5"/><text x="{xx}" y="{yy+8}" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" fill="#2a241c">{val}</text>')
        val='?' if j==3 else str(center(top,left,right))
        parts.append(f'<text x="{x}" y="{yc+9}" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" fill="#2a241c">{val}</text>')
    parts.append('</svg>');return ''.join(parts)

def main():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_SHA
    data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());assert data['version'].endswith('-r14') and 4 in data['pendingSourceNos']
    additions=[];answers=[]
    for i,target in enumerate(TARGETS,1):
        examples=[EXAMPLES[(i-1+k)%len(EXAMPLES)] for k in range(3)]
        vals=[center(*e) for e in examples];ans=center(*target);fn=f'applied9-q04-v{i}.svg';asset=ASSETS/fn;asset.write_text(svg_for(examples,target),encoding='utf-8');digest=hashlib.sha256(asset.read_bytes()).hexdigest()
        steps=[f'첫 번째 삼각형은 {examples[0][0]}×{examples[0][2]}÷{examples[0][1]}={vals[0]}입니다.',f'두 번째와 세 번째도 {examples[1][0]}×{examples[1][2]}÷{examples[1][1]}={vals[1]}, {examples[2][0]}×{examples[2][2]}÷{examples[2][1]}={vals[2]}로 같은 관계가 성립합니다.','따라서 가운데 수는 꼭대기 수와 오른쪽 아래 수를 곱한 뒤 왼쪽 아래 수로 나눈 값입니다.',f'마지막 삼각형에 적용하면 {target[0]}×{target[2]}÷{target[1]}={ans}입니다.']
        item={'id':f'applied9-q04-v{i}','genId':'applied9-q04','sourceSet':'applied','sourceRound':9,'sourceNo':4,'variantNo':i,'reviewStatus':'verified','area':'수와 식','subarea':'수의 관계와 규칙','detailType':'삼각형 꼭짓점 수의 곱셈·나눗셈 관계 찾기','pointBand':'2.7','text':'규칙을 찾아 □에 알맞은 수를 구하시오.','answer':str(ans),'answerParts':[ans],'answerLabels':['□'],'acceptedAnswers':[str(ans)],'answerContract':'single-number','asset':{'kind':'svg','src':f'assets/applied9/{fn}','description':'네 삼각형 꼭짓점 수와 가운데 수의 관계를 보여 주는 새 그림','sha256':digest},'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'세 수의 곱과 나눗셈으로 나타나는 관계를 예에서 찾아 새 수에 적용하기','learningLocation':'활용 9회 · 원문 4번 · 수의 관계와 규칙','verification':{'primaryMethod':'세 예에서 가운데 수가 꼭대기 수×오른쪽 아래 수÷왼쪽 아래 수인지 각각 대입해 확인한 후 마지막 삼각형에 적용한다.','independentMethod':'각 예와 목표의 세 수를 정수 연산으로 독립 계산하고 분모가 나누어떨어지는지 확인한다.','parameters':{'examples':[{'top':t,'left':l,'right':r,'center':center(t,l,r)} for t,l,r in examples],'target':{'top':target[0],'left':target[1],'right':target[2],'answer':ans},'assetSha256':digest},'independentSuite':'qa/applied9-q04-independent-validate.py','sourceExamPage':1,'sourceExamFile':'초등과정 대비 실전 모의고사 활용 9회.pdf','sourceExamSha256':SOURCE_SHA,'sourceAnswerPage':1,'sourceAnswerFile':'초등과정 대비 실전 모의고사 특강 9회 답안.pdf','sourceAnswerDriveId':ANSWER_ID,'sourceAnswerSha256':ANSWER_SHA,'officialAnswerStatus':'Candidate answer is 9, confirmed by the repeated top × lower-right ÷ lower-left relation. Candidate edition identity/official status remains unconfirmed.','sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingDescription':'Original page 1 has four triangles with three complete examples and a blank in the last center; original values and drawing retained unchanged.','variantUsesSourceDrawing':False,'variantDrawingModified':False,'userAuthorizedNewVariantFigures':True,'authorizationScope':'User approved new figures for all remaining Applied 9 visual question types, including Q04; original source figure remains unchanged.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}}
        additions.append(item);answers.append(ans)
    assert len(set(answers))==9
    items=sorted(data['items']+additions,key=lambda x:(x['sourceNo'],x['variantNo']));available=sorted({x['sourceNo'] for x in items});pending=[n for n in range(1,31) if n not in available]
    data.update(version=VERSION,items=items,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    data['sourceReview'].setdefault('questionReviews',{})['4']={'sourcePage':1,'examples':[(2,4,6,3),(4,6,9,6),(8,4,2,4)],'candidateAnswer':9,'independentRule':'top × lower-right ÷ lower-left','status':'Candidate answer matches each example and gives 6×12÷8=9; answer edition identity remains unconfirmed.'}
    idx.update(version=VERSION,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending);idx['items'].append({'sourceNo':4,'genId':'applied9-q04','area':'수와 식','subarea':'수의 관계와 규칙','detailType':'삼각형 꼭짓점 수의 곱셈·나눗셈 관계 찾기','pointBand':'2.7','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':'BUILT','version':VERSION,'added':9,'itemCount':len(items),'pending':pending,'answers':answers},ensure_ascii=False,indent=2))
if __name__=='__main__':main()

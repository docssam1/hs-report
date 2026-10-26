#!/usr/bin/env python3
"""Extend Applied 9 Q03 with nine symbol-equation variants and SVG data cards."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied9-expanded.json';INDEX=ROOT/'bank/data/applied9-expanded-index.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 9회.pdf';ASSETS=ROOT/'bank/assets/applied9'
SOURCE_SHA='0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794'
ANSWER_SHA='a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62'
ANSWER_ID='1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'
VERSION='20261025-applied9-q02-q03-q05-q06-q07-q09-q10-q11-q13-q17-q18-q19-q21-q26-q27-q29-q30-r13'
# (symbol-square, final triangle, final sum, circle, square, triangle)
PARAMS=[(2,8,6,16,4,2),(3,27,8,45,5,3),(2,32,10,48,6,4),(4,100,12,140,7,5),(2,72,14,96,8,6),(5,20,11,90,9,2),(4,36,7,48,4,3),(5,80,9,100,5,4),(6,150,11,180,6,5)]

def svg_for(i,a,b,s):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="780" height="250" viewBox="0 0 780 250">
<rect width="780" height="250" fill="#fff"/><rect x="18" y="14" width="744" height="222" rx="6" fill="#fdfbf5" stroke="#2a241c" stroke-width="3"/>
<text x="390" y="72" text-anchor="middle" font-family="Arial,'Noto Serif KR',serif" font-size="42" fill="#191511">○ ÷ △ ÷ □ = {a}</text>
<text x="390" y="137" text-anchor="middle" font-family="Arial,'Noto Serif KR',serif" font-size="42" fill="#191511">○ ÷ △ × □ = {b}</text>
<line x1="80" y1="158" x2="700" y2="158" stroke="#c9bda2" stroke-width="1.5"/>
<text x="390" y="211" text-anchor="middle" font-family="Arial,'Noto Serif KR',serif" font-size="42" fill="#191511">△ + □ = {s}</text></svg>'''

def main():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_SHA
    data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
    assert data['version'].endswith('-r12') and 3 in data['pendingSourceNos']
    additions=[]
    for i,(a,b,s,x,y,z) in enumerate(PARAMS,1):
        assert y+z==s and x//y//z==a and x//y*z==b
        fn=f'applied9-q03-v{i}.svg';asset=ASSETS/fn;asset.write_text(svg_for(i,a,b,s),encoding='utf-8');digest=hashlib.sha256(asset.read_bytes()).hexdigest()
        steps=[f'○÷△÷□={a}이므로 ○÷△={a}×□입니다.',f'○÷△×□={b}이므로 ○÷△={b}÷□입니다.',f'{a}×□={b}÷□이므로 □×□={b}÷{a}={z*z}입니다. 양의 정수 조건에서 □={z}입니다.',f'△+{z}={s}이므로 △={y}입니다.',f'○÷{y}÷{z}={a}를 만족하므로 ○={a}×{y}×{z}={x}입니다. 세 식에 대입하면 모두 성립합니다.']
        item={'id':f'applied9-q03-v{i}','genId':'applied9-q03','sourceSet':'applied','sourceRound':9,'sourceNo':3,'variantNo':i,'reviewStatus':'verified','area':'수와 식','subarea':'연산의 순서와 조건 추론','detailType':'세 연산식의 관계로 기호가 나타내는 수 구하기','pointBand':'2.7','text':'그림에서 ○, △, □가 나타내는 양의 정수를 각각 구하시오.','answer':f'{x}, {y}, {z}','answerParts':[x,y,z],'answerLabels':['○','△','□'],'acceptedAnswers':[str(x),str(y),str(z)],'answerContract':'ordered-parts','asset':{'kind':'svg','src':f'assets/applied9/{fn}','description':'세 기호의 나눗셈·곱셈·덧셈 관계를 나타낸 문제 그림','sha256':digest},'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'나눗셈과 곱셈의 왼쪽부터 계산하는 순서를 적용하고 같은 값을 두 식으로 나타내어 기호의 수 구하기','learningLocation':'활용 9회 · 원문 3번 · 연산의 순서와 조건 추론','verification':{'primaryMethod':'첫째 식과 둘째 식에서 ○÷△를 각각 나타내어 □²=b÷a를 구한 뒤, 합 조건과 첫 식을 차례로 대입한다.','independentMethod':'□=1..s−1을 전부 대입하고 △=s−□로 두어 ○가 두 연산식 모두를 만족하는 양의 정수인지 직접 열거한다.','parameters':{'firstResult':a,'secondResult':b,'sumResult':s,'circle':x,'triangle':y,'square':z,'squareSquared':z*z,'assetSha256':digest},'independentSuite':'qa/applied9-q03-independent-validate.py','sourceExamPage':1,'sourceExamFile':'초등과정 대비 실전 모의고사 활용 9회.pdf','sourceExamSha256':SOURCE_SHA,'sourceAnswerPage':1,'sourceAnswerFile':'초등과정 대비 실전 모의고사 특강 9회 답안.pdf','sourceAnswerDriveId':ANSWER_ID,'sourceAnswerSha256':ANSWER_SHA,'officialAnswerStatus':'Candidate answer page 1 handwritten values (○=36, △=4, □=3) match the printed equations. Candidate edition identity/official status remains unconfirmed.','sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingDescription':'Original Q3 page 1 has three equations in a rounded box using circled Korean consonant symbols; exact page opened directly. Original retained unchanged.','variantUsesSourceDrawing':False,'variantDrawingModified':False,'userAuthorizedNewVariantFigures':True,'authorizationScope':'User approved new figures for all remaining Applied 9 visual question types, including Q3; original source figure remains unchanged.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 9회 원문 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}}
        additions.append(item)
    items=sorted([x for x in data['items'] if x['sourceNo']!=3]+additions,key=lambda x:(x['sourceNo'],x['variantNo']))
    available=sorted({x['sourceNo'] for x in items});pending=[n for n in range(1,31) if n not in available]
    data.update(version=VERSION,items=items,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    data['sourceReview'].setdefault('questionReviews',{})['3']={'sourcePage':1,'sourceEquations':['○÷△÷□=3','○÷△×□=27','△+□=7'],'candidateAnswer':{'○':36,'△':4,'□':3},'candidateOfficialStatus':'Candidate answer page matches but edition identity/official status is unconfirmed.','status':'Nine new equation-card variants added after direct source/answer comparison; original figure unchanged.'}
    idx.update(version=VERSION,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    idx['items']=[x for x in idx['items'] if x['sourceNo']!=3];idx['items'].append({'sourceNo':3,'genId':'applied9-q03','area':'수와 식','subarea':'연산의 순서와 조건 추론','detailType':'세 연산식의 관계로 기호가 나타내는 수 구하기','pointBand':'2.7','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':'BUILT','version':VERSION,'added':9,'itemCount':len(items),'pending':pending,'answers':[x['answer'] for x in additions]},ensure_ascii=False,indent=2))
if __name__=='__main__':main()

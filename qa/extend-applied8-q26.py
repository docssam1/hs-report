#!/usr/bin/env python3
"""Extend Applied 8 Q26's growing pasture and cow consumption rate type."""
from fractions import Fraction
from pathlib import Path
from pypdf import PdfReader
import json,hashlib
R=Path(__file__).resolve().parents[1];W=R/'.private-work/hw-expansion-20261023/hw8';EXAM=R/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=W/'source-review/applied8-answer-drive-copy.pdf';DATA=R/'bank/data/applied8-expanded.json';INDEX=R/'bank/data/applied8-expanded-index.json';REVIEW=W/'q26-source-review.json'
VERSION='20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-r12'
# m cows consume current grass in t1 days; n cows in t2 days; p cows asked.
CASES=[(10,20,15,10,25),(8,20,14,8,24),(7,14,8,12,13),(9,18,15,9,21),(10,24,16,12,22),(8,20,12,10,20),(15,18,25,9,25),(14,20,21,10,27),(12,24,20,12,28)]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def solve(m,t1,n,t2,p):
 g=Fraction(n*t2-m*t1,t2-t1);G=(m-g)*t1;days=G/(p-g)
 assert g>0 and G>0 and p>g and days.denominator==1
 return {'growth':g,'grass':G,'net':p-g,'days':int(days)}
def main():
 e=PdfReader(str(EXAM)).pages[5].extract_text();a=PdfReader(str(ANSWER)).pages[5].extract_text();assert e==a
 compact=''.join(e.split());assert '목장' in compact and '풀' in compact and all(str(n) in compact for n in (10,20,15,25)), 'Rendered PDF extraction is split; use the directly inspected source-page render and confirm the visible conditions.'
 data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());old=[x for x in data['items'] if x['sourceNo']==26]
 if old and len(old)!=9:raise SystemExit(f'Q26 has {len(old)} items; inspect.')
 rows=[];items=[]
 for i,(m,t1,n,t2,p) in enumerate(CASES,1):
  v=solve(m,t1,n,t2,p);days=v['days'];text=f'목장에 있는 풀은 매일 같은 속도로 자랍니다. 현재 풀은 소 {m}마리가 {t1}일 동안 먹을 수 있고, 소 {n}마리가 {t2}일 동안 먹을 수 있습니다. 소 {p}마리가 있다면 목장의 풀을 모두 먹는 데 며칠이 걸릴까요?'
  steps=[f'소 한 마리가 하루 동안 먹는 풀의 양을 1로 두고, 하루 동안 새로 자라는 풀의 양을 g, 현재 풀의 양을 G라고 합니다.',f'첫째 조건에서 G=({m}−g)×{t1}, 둘째 조건에서 G=({n}−g)×{t2}입니다. 두 식을 같게 놓으면 g=({n}×{t2}−{m}×{t1})÷({t2}−{t1})={v["growth"]}입니다.',f'현재 풀의 양은 G=({m}−{v["growth"]})×{t1}={v["grass"]}마리·일입니다. 소 {p}마리가 하루에 실제로 줄이는 양은 {p}−{v["growth"]}={v["net"]}마리·일입니다.',f'따라서 걸리는 시간은 {v["grass"]}÷{v["net"]}={days}일입니다.']
  item={'id':f'applied8-q26-v{i}','genId':'applied8-q26','sourceSet':'applied','sourceRound':8,'sourceNo':26,'variantNo':i,'reviewStatus':'verified','area':'수와 식','subarea':'일률과 함께 일하기','detailType':'일정한 속도로 자라는 목장의 풀을 소가 먹는 시간 계산','pointBand':'4.2','text':text,'asset':None,'answer':f'{days}일','answerParts':[days],'answerLabels':['걸리는 날짜 수'],'acceptedAnswers':[str(days),f'{days}일'],'answerContract':'single-number','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'풀의 양을 소 한 마리의 하루 먹이량으로 나타내고, 풀의 성장량을 빼서 실제 감소량 계산하기','learningLocation':'활용 8회 · 원문 26번 · 일정한 성장과 소비가 함께 있는 일률','verification':{'primaryMethod':'현재 풀의 양을 G, 하루 성장량을 g로 두고 두 조건의 G 식을 연립한 뒤 목표 소 수에서 성장량을 뺀다.','independentMethod':'계산된 성장량과 시작 풀의 양으로 두 원래 조건을 각각 다시 대입하고, 목표 기간 뒤 남은 양을 계산한다.','parameters':{'firstCows':m,'firstDays':t1,'secondCows':n,'secondDays':t2,'targetCows':p,'growthCowEquivalentsPerDay':str(v['growth']),'initialGrassCowDays':str(v['grass']),'netConsumptionCowDaysPerDay':str(v['net']),'answerDays':days},'independentSuite':'qa/applied8-q26-independent-validate.py','sourceExamPage':6,'sourceExamFile':EXAM.name,'sourceAnswerPage':6,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'officialAnswerStatus':'The available Drive answer PDF page is an unmarked duplicate. The original answer and variants were independently reconstructed from simultaneous linear rates.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 26번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
  items.append(item);rows.append({'variant':i,'given':[m,t1,n,t2],'targetCows':p,'growth':str(v['growth']),'initialGrass':str(v['grass']),'netConsumption':str(v['net']),'answerDays':days})
 src=solve(*CASES[0]);data['items']=[x for x in data['items'] if x['sourceNo']!=26]+items;data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['version']=VERSION;data['itemCount']=len(data['items']);data['availableSourceNos']=sorted(set(data['availableSourceNos']+[26]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
 idx['version']=VERSION;idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo']!=26]+[{'sourceNo':26,'genId':'applied8-q26','area':'수와 식','subarea':'일률과 함께 일하기','detailType':'일정한 속도로 자라는 목장의 풀을 소가 먹는 시간 계산','pointBand':'4.2','reviewStatus':'verified','variantCount':9}];idx['items'].sort(key=lambda x:x['sourceNo'])
 DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'sha256':sha(EXAM),'page':6,'questionNo':26,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q26-source-page-6.png','prompt':'Pasture grows uniformly; 10 cows can eat it in 20 days, 15 in 10 days; ask duration for 25 cows.'},'answerCandidate':{'file':ANSWER.name,'sha256':sha(ANSWER),'page':6,'directVisualReview':True,'render':'.private-work/hw-expansion-20261023/hw8/source-review/q26-answer-page-6.png','containsAnswers':False,'comparison':'The answer candidate is text-identical and unmarked.'},'sourceIndependentSolution':{'growthCowEquivalentsPerDay':str(src['growth']),'initialGrassCowDays':str(src['grass']),'targetNetCowDaysPerDay':str(src['net']),'answerDays':src['days']},'variantCount':9,'variantResults':rows,'variantsIndependentlyCalculated':True,'newSourceTypes':0,'difficulty':'4.2-point band only = high'}
 REVIEW.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n');print('Added 9 Q26 rate variants; source answer',src['days'],'days; answers',[r['answerDays'] for r in rows],'; total',data['itemCount'])
if __name__=='__main__':main()

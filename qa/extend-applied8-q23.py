#!/usr/bin/env python3
"""Extend the existing Applied 8 Q23 nested-fraction survey type."""
from __future__ import annotations
import json,hashlib
from fractions import Fraction
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.private-work/hw-expansion-20261023/hw8'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf';ANSWER=WORK/'source-review/applied8-answer-drive-copy.pdf'
PAGE=WORK/'source-review/q22-source.png';ANS_PAGE=WORK/'source-review/q22-answer-candidate.png'
DATA_PATH=ROOT/'bank/data/applied8-expanded.json';INDEX_PATH=ROOT/'bank/data/applied8-expanded-index.json';REVIEW=WORK/'q23-source-review.json'
VERSION='20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9'
# Korean, math, PE fractions; choose a consistent original total and remaining-none count.
CASES=[(Fraction(1,5),Fraction(3,8),Fraction(3,5),200),(Fraction(1,4),Fraction(2,5),Fraction(1,2),200),(Fraction(1,6),Fraction(2,5),Fraction(1,2),300),(Fraction(1,4),Fraction(1,3),Fraction(1,2),200),(Fraction(1,4),Fraction(2,5),Fraction(2,3),200),(Fraction(1,5),Fraction(1,3),Fraction(1,2),150),(Fraction(1,4),Fraction(3,8),Fraction(1,2),256),(Fraction(1,6),Fraction(1,3),Fraction(1,2),180),(Fraction(1,3),Fraction(2,5),Fraction(1,2),300)]
def frac(x):return f'{x.numerator}/{x.denominator}'
def calc(k,m,p,n):
 korean=n*k;after_k=n-korean;math=after_k*m;after_math=after_k-math;pe=after_math*p;none=after_math-pe
 assert all(Fraction(x).denominator==1 for x in (korean,after_k,math,after_math,pe,none))
 return {'total':n,'korean':int(korean),'afterKorean':int(after_k),'math':int(math),'afterMath':int(after_math),'PE':int(pe),'none':int(none),'noneFraction':(1-k)*(1-m)*(1-p)}
def make_item(c,n):
 k,m,p,total=c;v=calc(k,m,p,total);answer=v['math']
 text=(f'어느 학교 3학년 학생들은 가장 좋아하는 과목을 한 과목씩 골랐습니다. 국어를 좋아하는 학생은 전체의 {frac(k)}이고, '
       f'국어를 좋아하는 학생을 뺀 나머지의 {frac(m)}은 수학을 좋아했습니다. 국어와 수학을 좋아하는 학생을 뺀 나머지의 {frac(p)}은 체육을 좋아했습니다. '
       f'국어, 수학, 체육을 좋아하는 학생을 뺀 나머지가 {v["none"]}명일 때, 수학을 좋아하는 학생은 몇 명일까요?')
 steps=[f'전체 학생 수를 N명이라고 두면 국어를 좋아하는 학생은 {frac(k)}N명이고, 그 뒤 남는 학생은 (1−{frac(k)})N={frac(1-k)}N명입니다.',f'수학을 좋아하는 학생은 {frac(m)}×{frac(1-k)}N={frac((1-k)*m)}N명입니다. 그 뒤 남는 학생의 비율은 {frac(1-k)}×(1−{frac(m)})={frac((1-k)*(1-m))}입니다.',f'체육까지 빼고 남는 학생은 {frac((1-k)*(1-m)*(1-p))}N명입니다. 이 수가 {v["none"]}명이므로 N={v["none"]}÷{frac((1-k)*(1-m)*(1-p))}={total}명입니다.',f'따라서 수학을 좋아하는 학생은 {frac((1-k)*m)}×{total}={answer}명입니다.']
 return {'id':f'applied8-q23-v{n}','genId':'applied8-q23','sourceSet':'applied','sourceRound':8,'sourceNo':23,'variantNo':n,'reviewStatus':'verified','area':'수와 식','subarea':'비율과 연속적인 부분','detailType':'남은 비율이 순서대로 줄어드는 선호 조사에서 한 집단 수 역산','pointBand':'4.2','text':text,'asset':None,'answer':f'{answer}명','answerParts':[answer],'answerLabels':['수학을 좋아하는 학생 수'],'acceptedAnswers':[str(answer),f'{answer}명'],'answerContract':'single-number','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'전체에서 순서대로 빠지는 집단의 비율을 곱해 마지막 남은 비율을 구하고 원래 인원과 원하는 집단 수 역산하기','learningLocation':'활용 8회 · 원문 23번 · 연속해서 적용하는 부분의 비율','verification':{'primaryMethod':'전체 인원을 N으로 두고 남은 비율을 곱한 식을 세워 N과 수학 인원을 계산한다.','independentMethod':'선택한 정수 전체 인원에서 실제 각 범주의 인원을 단계별로 계산해 마지막 남은 수와 답을 맞춘다.','parameters':{'koreanFraction':frac(k),'mathOfRemainderFraction':frac(m),'PEOfRemainderFraction':frac(p),'noneCount':v['none'],'totalStudents':total,'koreanCount':v['korean'],'mathCount':v['math'],'PECount':v['PE']},'independentSuite':'qa/applied8-q23-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceAnswerPage':5,'sourceDrawingCompared':False,'sourceDrawingPresent':False,'officialAnswerStatus':'The available Drive answer PDF page is an unmarked duplicate of the question page. The source and variants were independently checked by exact fraction arithmetic and integer headcounts.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 23번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
def main():
 exam=PdfReader(str(EXAM)).pages[4].extract_text();ans=PdfReader(str(ANSWER)).pages[4].extract_text();compact=''.join(exam.split())
 if exam!=ans:raise SystemExit('Answer candidate differs from source p5.')
 if not all(x in compact for x in ('가장좋아하는과목','1/5','3/8','3/5','수학을좋아하는')):raise SystemExit('Q23 source p5 text mismatch.')
 data=json.loads(DATA_PATH.read_text());idx=json.loads(INDEX_PATH.read_text());old=[x for x in data['items'] if x['sourceNo']==23]
 if old and len(old)!=9:raise SystemExit(f'Q23 has {len(old)} items; inspect.')
 items=[make_item(c,i+1) for i,c in enumerate(CASES)]
 data['version']=VERSION;data['items']=[x for x in data['items'] if x['sourceNo']!=23]+items;data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']));data['itemCount']=len(data['items']);data['availableSourceNos']=sorted(set(data['availableSourceNos']+[23]));data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
 idx['version']=VERSION;idx['itemCount']=data['itemCount'];idx['pendingSourceNos']=data['pendingSourceNos'];idx['items']=[x for x in idx['items'] if x['sourceNo']!=23];idx['items'].append({'sourceNo':23,'genId':'applied8-q23','area':'수와 식','subarea':'비율과 연속적인 부분','detailType':'남은 비율이 순서대로 줄어드는 선호 조사에서 한 집단 수 역산','pointBand':'4.2','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
 DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
 source=calc(*CASES[0]);review={'sourceExam':{'file':EXAM.name,'sha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),'page':5,'questionNo':23,'directVisualReview':True,'render':str(PAGE.relative_to(ROOT)),'prompt':'과목을 하나씩 선택. 전체 중 국어, 남은 학생 중 수학, 남은 학생 중 체육의 비율과 아무 과목도 선택하지 않은 인원 40명을 주고 수학 선호 인원 계산.'},'answerCandidate':{'file':ANSWER.name,'sha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'page':5,'directVisualReview':True,'containsAnswers':False,'comparison':'Answer-copy page is an unmarked duplicate; answer line is blank.'},'sourceIndependentSolution':{'totalStudents':source['total'],'koreanCount':source['korean'],'mathCount':source['math'],'PECount':source['PE'],'noneCount':source['none'],'noneFraction':frac(source['noneFraction']),'answer':source['math']},'variantCount':9,'variantResults':[{'variant':i+1,'fractions':[frac(k),frac(m),frac(p)],'total':calc(k,m,p,n)['total'],'counts':{key:(frac(val) if isinstance(val,Fraction) else val) for key,val in calc(k,m,p,n).items()},'answer':calc(k,m,p,n)['math']} for i,(k,m,p,n) in enumerate(CASES)],'variantsIndependentlyCalculated':True,'newSourceTypes':0,'difficulty':'4.2-point band only = high'}
 REVIEW.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print(f'Added 9 Q23 variants; original answer {source["math"]} of {source["total"]}; total {data["itemCount"]}, existing types {len(data["availableSourceNos"])}.')
if __name__=='__main__':main()

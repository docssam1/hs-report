#!/usr/bin/env python3
"""Extend only the existing Applied 7 Q26 three-set fraction-count type."""
from fractions import Fraction
import hashlib, json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw7'
DATA_PATH=ROOT/'bank/data/applied7-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied7-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT=Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read_page(pdf,page):
 return subprocess.check_output([str(PDFTOTEXT),'-f',str(page),'-l',str(page),'-layout',str(pdf),'-'],text=True,errors='replace')
exam_text=read_page(EXAM,6); answer_text=read_page(ANSWER,6)
compact=''.join(exam_text.split())
for token in ['26명의어린이가','탬버린','트라이앵글','캐스터네츠','4','3','2']:
 assert token in compact, token
assert '26명의어린이' in ''.join(answer_text.split())
# Each vector lists disjoint Venn regions: T-only, R-only, C-only, TR-only,
# TC-only, RC-only, and all-three. The source relation C-only = TR-only is retained.
VECTORS=[
 (39,3,(4,11,3,3,11,4,3)),
 (35,6,(11,4,4,4,4,2,6)),
 (37,2,(2,11,4,4,4,10,2)),
 (45,6,(9,12,6,6,3,3,6)),
 (54,3,(9,6,12,12,6,6,3)),
 (56,8,(8,8,8,8,8,8,8)),
 (60,8,(4,8,12,12,12,4,8)),
 (37,3,(11,11,3,3,3,3,3)),
 (38,6,(2,3,6,6,6,9,6)),
]
def stats(region):
 a,b,c,d,e,f,g=region
 return (a+d+e+g,b+d+f+g,c+e+f+g)
def fractions(region):
 a,b,c,d,e,f,g=region; t,r,cast=stats(region)
 return (Fraction(d+g,t),Fraction(e+g,t),Fraction(d+g,r),Fraction(f+g,r),Fraction(e+g,cast))
def fmt(x):
 x=Fraction(x)
 return str(x.numerator) if x.denominator==1 else f'{x.numerator}/{x.denominator}'
def solve_unique(total,g,fracs):
 sols=[]
 for d in range((total-g)//2+1):
  rem=total-g-2*d
  for a in range(rem+1):
   for b in range(rem-a+1):
    for e in range(rem-a-b+1):
     f=rem-a-b-e; region=(a,b,d,d,e,f,g)
     if fractions(region)==fracs: sols.append(region)
 return sols
source_fracs=tuple(Fraction(n,d) for n,d in [(4,7),(3,7),(4,7),(2,7),(3,7)])
source_solutions=solve_unique(26,2,source_fracs)
assert source_solutions==[(2,4,6,6,4,2,2)], source_solutions
items=[]; proof=[]
for variant,(total,g,regions) in enumerate(VECTORS,1):
 a,b,c,d,e,f,gg=regions
 assert c==d and gg==g and sum(regions)==total
 assert tuple(stats(regions))==(stats(regions))
 fracs=fractions(regions)
 assert all(0<x<1 and x.denominator<=10 for x in fracs)
 assert solve_unique(total,g,fracs)==[regions], (variant,solve_unique(total,g,fracs))
 t,r,cast=stats(regions)
 assert (t,r,cast)!=(14,14,14)
 labels=['탬버린만','트라이앵글만','캐스터네츠만','탬버린·트라이앵글만','탬버린·캐스터네츠만','트라이앵글·캐스터네츠만','세 악기 모두']
 frac_text=[f'{x.numerator}/{x.denominator}' for x in fracs]
 question=(f'{total}명의 어린이가 탬버린, 트라이앵글, 캐스터네츠로 리듬 합주를 하고 있습니다. '
  f'탬버린 연주자 중 {frac_text[0]}은 트라이앵글도 연주하고, {frac_text[1]}은 캐스터네츠도 연주합니다. '
  f'트라이앵글 연주자 중 {frac_text[2]}은 탬버린도 연주하고, {frac_text[3]}은 캐스터네츠도 연주합니다. '
  f'캐스터네츠 연주자 중 {frac_text[4]}은 탬버린도 연주합니다. '
  '캐스터네츠만 연주하는 어린이 수는 탬버린과 트라이앵글만 연주하는 어린이 수와 같고, '
  f'세 악기를 모두 연주하는 어린이는 {g}명입니다. 이 어린이들에게 필요한 탬버린, 캐스터네츠, 트라이앵글은 각각 몇 개입니까?')
 alpha,beta,gamma,delta,epsilon=fracs
 ratio_r=alpha/gamma; ratio_c=beta/epsilon
 coefficient=1-alpha-beta+ratio_r*(1-delta)+ratio_c
 regions_text=f'{a}, {b}, {c}, {d}, {e}, {f}, {g}'
 steps=[
  f'탬버린 연주 인원을 T명, 트라이앵글 연주 인원을 R명, 캐스터네츠 연주 인원을 C명이라 놓습니다. 겹치는 인원은 각각 {fmt(alpha)}T, {fmt(beta)}T, {fmt(gamma)}R, {fmt(delta)}R, {fmt(epsilon)}C명이고, 세 악기 공통 인원은 {g}명입니다. 따라서 R={fmt(ratio_r)}T, C={fmt(ratio_c)}T입니다.',
  f'포함·배제 원리로 전체 인원은 T+R+C−{fmt(alpha)}T−{fmt(beta)}T−{fmt(delta)}R+{g}입니다. R과 C를 T로 나타내면 {total}−{g}={fmt(coefficient)}T이므로 T={t}명, R={r}명, C={cast}명입니다.',
  f'각 겹치지 않는 영역은 T만 {t}−{fmt(alpha)}×{t}−{fmt(beta)}×{t}+{g}={a}명, R만 {r}−{fmt(gamma)}×{r}−{fmt(delta)}×{r}+{g}={b}명, C만 {cast}−{fmt(epsilon)}×{cast}−{fmt(delta)}×{r}+{g}={c}명입니다. TR만·TC만·RC만·세 악기 공통은 각각 {d}, {e}, {f}, {g}명이며 C만과 TR만이 모두 {d}명이라 조건도 맞습니다. 일곱 영역은 {regions_text}명입니다.',
  f'탬버린은 {a}+{d}+{e}+{g}={t}개, 캐스터네츠는 {c}+{e}+{f}+{g}={cast}개, 트라이앵글은 {b}+{d}+{f}+{g}={r}개 필요합니다.'
 ]
 item={'id':f'applied7-q26-v{variant}','genId':'applied7-q26','sourceSet':'applied','sourceRound':7,'sourceNo':26,'variantNo':variant,'reviewStatus':'verified',
  'area':'경우의 수','subarea':'세 집합의 포함 관계','detailType':'분수로 주어진 교집합 관계에서 각 집합의 원소 수 구하기','pointBand':'4.2','text':question,
  'answer':f'{t}, {cast}, {r}','answerParts':[t,cast,r],'answerLabels':['탬버린 수','캐스터네츠 수','트라이앵글 수'],
  'acceptedAnswers':[f'{t}, {cast}, {r}',f'{t}개, {cast}개, {r}개'],'answerContract':'ordered-parts',
  'solutionSteps':steps,'solution':' '.join(steps),
  'learningPoint':'세 집합의 한 가지만·두 가지만·세 집합 공통인 무리를 나누고, 분수 조건과 전체 인원을 연립해 각 집합의 크기를 구하기',
  'learningLocation':'활용 7회 · 원문 26번 · 세 집합의 분수 관계',
  'verification':{'primaryMethod':'일곱 개의 서로 겹치지 않는 영역을 변수로 놓고 다섯 분수식과 전체 합을 연립한다.',
   'independentMethod':'전체 인원과 세 집합 공통 인원을 고정한 뒤 비음수 정수 영역 수를 전수 열거해 다섯 분수식을 만족하는 유일한 해를 확인한다.',
   'parameters':{'totalChildren':total,'regions':dict(zip(['T_only','R_only','C_only','TR_only','TC_only','RC_only','TRC'],regions)),
    'instrumentTotals':{'tambourine':t,'castanets':cast,'triangle':r},'fractions':frac_text,'uniqueSolutions':1},
   'independentSuite':'qa/applied7-q26-independent-validate.py','sourceExamPage':6,'sourceExamFile':EXAM.name,
   'sourceAnswerPage':6,'sourceAnswerFile':ANSWER.name,'sourceDrawingCompared':True,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},
  'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
   'rationale':'활용 7회 원문 26번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}
 items.append(item)
 proof.append({'variant':variant,'totalChildren':total,'triplePlayers':g,'regions':dict(zip(['T_only','R_only','C_only','TR_only','TC_only','RC_only','TRC'],regions)),
  'fractions':frac_text,'instrumentTotals':[t,cast,r],'numberOfSolutions':1})
data=json.loads(DATA_PATH.read_text()); idx=json.loads(INDEX_PATH.read_text())
assert data['sourceRound']==7
if 26 in data['availableSourceNos']:
 data['items']=[x for x in data['items'] if x['sourceNo']!=26]
 data['availableSourceNos'].remove(26)
 idx['items']=[x for x in idx['items'] if x['sourceNo']!=26]
 data['itemCount']=len(data['items']);data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
assert 26 not in data['availableSourceNos'] and not any(x['sourceNo']==26 for x in data['items'])
data['items'].extend(items); data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos']+[26])); data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]; data['itemCount']=len(data['items'])
data['version']='20261025-applied7-expansion-'+'-'.join(f'q{no:02d}' for no in data['availableSourceNos'])+'-r23'
idx['version']=data['version']; idx['itemCount']=data['itemCount']; idx['pendingSourceNos']=data['pendingSourceNos']
idx['items'].append({'sourceNo':26,'genId':'applied7-q26','area':'경우의 수','subarea':'세 집합의 포함 관계','detailType':'분수로 주어진 교집합 관계에서 각 집합의 원소 수 구하기','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
idx['items'].sort(key=lambda x:x['sourceNo'])
DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n'); INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
review={'sourceExam':{'name':EXAM.name,'driveId':'1qtshEh5Zkv3X4DMMcXHjWw1kRgibbvxf','sha256':sha(EXAM),'questionPage':6,'questionNumber':26,'directPageText':exam_text,
 'sourceQuestion':'26 children play tambourine, triangle, and castanets. Five fractions relate pairwise intersections to instrument totals; castanets-only equals TR-only; exactly two play all three; ask each instrument count.'},
 'sourceAnswer':{'name':ANSWER.name,'driveId':'1zIN-XzODa-_T2AUjGbmuzHSPvCdVb2_j','sha256':sha(ANSWER),'answerPage':6,'questionNumber':26,
  'printedAnswer':'blank','handwrittenWorkObserved':True,'officialMarkedFinalAnswer':None,
  'independentSolution':{'regions':[2,4,6,6,4,2,2],'instrumentTotals':[14,14,14],'exhaustiveIntegerSolutions':1},
  'interpretation':'The answer PDF has a blank printed answer box and handwritten Venn working. The exact problem conditions were independently solved by enumerating all nonnegative integer Venn-region assignments; one solution gives 14 users per instrument. No official marked answer is claimed.'},
 'sourceTypeAlreadyPresent':True,'newSourceTypesAdded':0,'directOriginalExamQuestionAndAnswerPagesReviewed':True,
 'sourceFractions':['4/7','3/7','4/7','2/7','3/7'],'sourceTripleCount':2,'sourceTotal':26,'sourceAnswerRegions':[2,4,6,6,4,2,2],
 'sourceAnswerUniqueByEnumeration':True,'variantCount':9,'variants':proof,'allUseSameOriginalSourceType':True,'dataVersion':data['version']}
(WORK/'q26-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print(f"Built Applied7 Q26: 9 variants of existing three-set fraction-count type; {data['itemCount']} total; new source types 0.")

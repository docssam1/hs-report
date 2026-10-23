"""Finite Applied 2 variants. Current exam PDF is the source of conditions.
Teacher answer editions differ on q18; no source grade is rewritten.
"""
import itertools as it
import json
import math
from fractions import Fraction
from pathlib import Path
from collections import defaultdict

ROOT=Path(__file__).resolve().parents[2]
items=[]
TYPES={1:('도형','이어 붙인 도형의 둘레','이등변삼각형 띠의 둘레'),2:('수와 식','합과 차의 관계','성냥으로 만든 두 종류 도형의 개수'),6:('수와 식','도형 수의 규칙','번갈아 놓은 삼각 배열의 색별 개수'),8:('수와 식','분수와 전체량','생애의 분수와 남은 기간으로 전체 찾기'),10:('수와 식','약수와 배열','앞뒤 사람 수가 같은 직사각형 줄서기'),11:('지문 이해','순위와 배제','두 예측 중 하나만 맞은 경기 순위'),12:('도형','격자와 반복','번갈아 붙이는 타일의 새 테두리'),18:('수와 식','집합과 겹침','세 집합을 모두 만족하는 사람 수'),23:('수와 식','반복수의 계산','두 반복수의 곱에서 홀수 숫자 세기'),25:('수와 식','거꾸로 풀기','세 번 나누어 담기 전의 전체량'),26:('수와 식','나이와 관계식','과거 두 나이 관계와 현재 합'),27:('수와 식','곱셈과 자릿수','부분 곱의 자리 단서로 곱셈 완성'),29:('수와 식','수의 크기와 자리','숫자를 지워 가장 작은 수 만들기'),30:('경우의 수','합이 정해진 조합','개수 비와 합의 비를 만족하는 카드 분배')}
FIGURES={1:'triangle-chain',6:'alternating-triangle',12:'checker-frames'}
def frac(a,b):return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{a}</mn><mn>{b}</mn></mfrac></math>'
def add(no,p,text,answer,parts,steps,labels,focus,model,**extra):
 v=1+sum(x['sourceNo']==no for x in items);area,sub,detail=TYPES[no];point='2.7' if no<=12 else '3.4' if no<=22 else '4.2'
 page=1 if no<=5 else 2 if no<=11 else 3 if no<=17 else 4 if no<=23 else 5 if no<=28 else 6
 apage=1 if no<=4 else 2 if no<=7 else 3 if no<=12 else 4 if no<=16 else 5 if no<=20 else 6 if no<=24 else 7
 x=dict(id=f'applied2-q{no:02d}-v{v}',genId=f'applied2-q{no:02d}',sourceSet='applied',sourceRound=2,sourceNo=no,variantNo=v,reviewStatus='pending-output-review',area=area,subarea=sub,detailType=detail,pointBand=point,text=text,answer=str(answer),answerParts=parts,answerLabels=labels,acceptedAnswers=[str(answer)],answerContract='ordered-parts',solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,learningLocation=f'활용 2회 · 원문 {no}번 · {sub}',verification={'primaryMethod':model,'parameters':p,'independentSuite':'qa/applied2-independent-validate.py','sourceExamPage':page,'sourceAnswerPage':apage,'studentDifficultyMeasured':False},difficultyEvidence={'basis':'source-point-band','label':{'2.7':'하','3.4':'중','4.2':'상'}[point],'sourceReasoningPreserved':True,'measuredVariantRate':None})
 if no in FIGURES:x['asset']={'kind':'raster','src':'assets/applied2/'+FIGURES[no]+'.png','description':detail+'의 원문 그림'}
 x.update(extra);items.append(x)

for n in [40,42,44,46,48,52,54,56,58]:
 ans=6*n+20
 add(1,{'triangles':n,'base':6,'equalSide':10},f'그림과 같은 이등변삼각형을 {n}개 이어 붙여 하나의 도형을 만들었습니다. 이 도형의 둘레는 몇 cm입니까?',f'{ans}cm',[ans],[f'각 삼각형의 6cm인 변은 바깥 둘레에 그대로 남아 {n}개입니다. 10cm인 변 중에서는 맨 왼쪽과 맨 오른쪽의 두 변만 바깥 둘레에 남습니다.',f'6cm인 변의 길이를 모두 더하면 6×{n}＝{6*n}cm입니다.',f'따라서 둘레는 {6*n}＋10×2＝{ans}cm입니다.'],['둘레(cm)'],'안쪽에서 공유하는 변과 바깥에 남은 변 구분하기','external base sum plus two end sides')

for total,squares in [(26,14),(28,16),(29,17),(31,19),(32,21),(33,20),(34,22),(35,23),(36,25)]:
 matches=3*total+squares;tri=total-squares
 add(2,{'total':total,'matches':matches},f'성냥개비로 서로 떨어진 삼각형과 사각형을 만들었습니다. 두 종류 도형은 모두 {total}개이고 사용한 성냥개비는 {matches}개입니다. 삼각형과 사각형은 각각 몇 개입니까?',f'삼각형 {tri}개, 사각형 {squares}개',[tri,squares],[f'{total}개가 모두 삼각형이라면 성냥개비는 {total}×3＝{3*total}개입니다.',f'삼각형 하나를 사각형으로 바꿀 때마다 성냥개비가 한 개 더 필요합니다. 실제로는 {matches}−{3*total}＝{squares}개가 더 필요하므로 사각형이 {squares}개입니다.',f'삼각형은 {total}−{squares}＝{tri}개입니다. 3×{tri}＋4×{squares}＝{matches}로 확인합니다.'],['삼각형 개수','사각형 개수'],'모두 한 종류라고 가정하고 필요한 개수의 차 이용하기','all triangles and one extra match per square')

for k in [17,18,19,20,21,22,24,25,26]:
 add(6,{'difference':k},f'그림과 같이 흰 바둑돌과 검은 바둑돌을 한 줄씩 번갈아 놓아 삼각형 모양을 계속 늘립니다. 검은 바둑돌이 흰 바둑돌보다 {k}개 많을 때, 흰 바둑돌은 모두 몇 개입니까?',f'{k*k}개',[k*k],['윗줄부터 바둑돌 수는 1, 2, 3, 4, …입니다. 홀수 번째 줄은 흰색이고 짝수 번째 줄은 검은색입니다.',f'흰색 줄과 그다음 검은색 줄을 짝지으면 검은색이 한 개씩 더 많습니다. 검은색이 {k}개 더 많으므로 그런 짝이 {k}개 있습니다.',f'흰 바둑돌의 수는 1＋3＋5＋…＋{2*k-1}＝{k}×{k}＝{k*k}개입니다.'],['흰 바둑돌 개수'],'이웃한 두 줄을 묶어 색별 차이와 홀수의 합 연결하기','paired row differences and odd sum')

lifecases=[]
for ds in it.combinations(range(3,9),3):
 lcm=math.lcm(*ds);s=sum((Fraction(1,d) for d in ds),Fraction());rest=1-s
 for age in range(60,109):
  old=rest*age
  if age%lcm==0 and old.denominator==1 and 8<=old<=30 and not (ds==(3,4,5) and age==60):lifecases.append((ds,age,int(old),s,rest))
for ds,age,old,s,rest in lifecases[:9]:
 a,b,c=ds
 add(8,{'denominators':list(ds),'oldYears':old},f'어떤 사람은 생애의 {frac(1,a)}을 어린이로, {frac(1,b)}을 젊은이로, {frac(1,c)}을 장년으로 지냈습니다. 나머지 노년을 보낸 기간이 {old}년이라면 이 사람은 몇 살까지 살았습니까?',f'{age}살',[age],[f'앞의 세 기간을 더하면 생애의 {frac(s.numerator,s.denominator)}입니다.',f'따라서 노년은 생애의 1−{frac(s.numerator,s.denominator)}＝{frac(rest.numerator,rest.denominator)}입니다.',f'{old}년이 전체의 {frac(rest.numerator,rest.denominator)}이므로 생애는 {old}÷{rest.numerator}×{rest.denominator}＝{age}년입니다. 실제로 {age//a}＋{age//b}＋{age//c}＋{old}＝{age}년입니다.'],['나이(살)'],'서로 겹치지 않는 기간의 분수 합과 남은 부분을 전체량으로 연결하기','fraction complement and whole lifespan')

for A,B in [(16,17),(32,11),(32,13),(16,23),(32,19),(64,11),(32,23),(64,13),(16,31)]:
 N=A*B
 add(10,{'students':N},f'학생 {N}명이 가로로 각 줄에 A명씩, 세로로 B줄이 되도록 섰습니다. 한 학생의 앞과 뒤에는 각각 한 명 이상이 서 있으며, 앞에 있는 학생 수와 뒤에 있는 학생 수가 같습니다. A와 B를 각각 구하시오.',f'A＝{A}, B＝{B}',[A,B],[f'그 학생 앞뒤의 인원이 같고 각각 한 명 이상이므로 세로 줄 수 B는 3 이상의 홀수입니다.',f'{N}을 계속 2로 나누면 {A}×{B}입니다. {B}는 소수이므로 {N}의 홀수 약수는 1과 {B}뿐입니다.',f'B는 1이 될 수 없으므로 B＝{B}입니다. 따라서 A＝{N}÷{B}＝{A}입니다.'],['A','B'],'앞뒤 인원 조건을 홀수 약수 조건으로 바꾸기','odd divisor of a power of two times odd prime')

perms=list(it.permutations('ABCD'));first=tuple('ABCD');rankcases=[]
for second in perms:
 for fixed in [1,2,3]:
  sols=[p for p in perms if all(p[k]!=first[k] for k in range(4)) and all((p[k]==second[k])==(k==fixed) for k in range(4))]
  if len(sols)==1:rankcases.append((second,fixed,sols[0]))
for second,fixed,sol in rankcases[:9]:
 steps=[f'두 번째 예측의 {fixed+1}등만 맞았으므로 실제 {fixed+1}등은 {second[fixed]}입니다. 첫 번째 예측은 네 자리 모두 틀렸습니다.']
 for cand in perms:
  if cand[fixed]!=second[fixed]:continue
  if cand==sol:continue
  bad=next((f'{k+1}등이 첫 번째 예측과 같아집니다' for k in range(4) if cand[k]==first[k]),None)
  if bad is None:bad=next(f'{k+1}등도 두 번째 예측과 같아집니다' for k in range(4) if k!=fixed and cand[k]==second[k])
  steps.append('1등부터 '+' → '.join(cand)+'로 놓으면 '+bad+'.')
 steps.append('모든 조건에 맞는 실제 순위는 '+' → '.join(sol)+f'뿐입니다. 따라서 1등은 {sol[0]}입니다.')
 add(11,{'first':list(first),'second':list(second),'correctPosition':fixed},f'A, B, C, D 네 선수의 경기 순위를 두 사람이 다음 표처럼 예측했습니다. 두 번째 예측의 {fixed+1}등만 맞고 나머지 예측은 모두 틀렸습니다. 실제 1등은 누구입니까?',sol[0],[sol[0]],steps,['1등 선수'],'참인 한 자리와 나머지 일곱 개의 배제 조건을 함께 적용하기','all 24 possible race rankings',givenTable={'headers':['예측','1등','2등','3등','4등'],'rows':[['첫 번째']+list(first),['두 번째']+list(second)]})

for n in [44,47,49,50,53,56,58,61,64]:
 color='흰색' if n%2 else '검은색';count=4*(n-1)
 add(12,{'stage':n},f'그림과 같이 벽에 타일을 붙입니다. 1회에는 흰 타일, 2회에는 검은 타일을 붙이고 그 뒤에도 색을 번갈아 가며 바깥으로 늘립니다. {n}회에 새로 붙이는 타일은 무슨 색이며 몇 개입니까?',f'{color}, {count}개',[color,count],['홀수 회에는 흰 타일, 짝수 회에는 검은 타일을 새로 붙입니다.',f'{n}회는 '+('홀수' if n%2 else '짝수')+f'이므로 {color}입니다.',f'같은 색의 타일 수는 {n-2}회까지 {(n-2)**2}개였고 {n}회까지 {n*n}개입니다. 이번에 새로 붙인 수는 {n*n}−{(n-2)**2}＝{count}개입니다.'],['타일 색','새 타일 개수'],'누적 개수와 이번 회에 새로 붙인 개수를 구분하기','difference of same-color square totals')

for j in range(9):
 a,b,c=9+j%3,7+j%4,8+j%2;ab,bc,ac=4+j%3,3+j%2,5+j%4;all3=2+j%5;none=14+j
 A=a+ab+ac+all3;B=b+ab+bc+all3;C=c+bc+ac+all3;AB=ab+all3;BC=bc+all3;AC=ac+all3;N=a+b+c+ab+bc+ac+all3+none;union=N-none
 add(18,{'total':N,'A':A,'B':B,'C':C,'AB':AB,'BC':BC,'AC':AC,'none':none},f'어느 반 학생 {N}명 중 나비를 좋아하는 학생은 {A}명, 벌은 {B}명, 무당벌레는 {C}명입니다. 나비와 벌을 모두 좋아하는 학생은 {AB}명, 벌과 무당벌레를 모두 좋아하는 학생은 {BC}명, 나비와 무당벌레를 모두 좋아하는 학생은 {AC}명입니다. 세 곤충 중 어느 것도 좋아하지 않는 학생이 {none}명이라면 세 곤충을 모두 좋아하는 학생은 몇 명입니까?',f'{all3}명',[all3],[f'한 가지 이상 좋아하는 학생은 {N}−{none}＝{union}명입니다.',f'종류별 인원을 더한 뒤 두 종류씩 겹치는 인원을 빼면 {A}＋{B}＋{C}−{AB}−{BC}−{AC}＝{union-all3}명입니다.',f'세 종류 모두 좋아하는 학생은 앞의 덧셈에서 세 번 더해지고 뺄셈에서 세 번 빠져 한 번도 세지 않은 상태입니다. 따라서 그 인원은 {union}−{union-all3}＝{all3}명입니다.'],['세 곤충 모두(명)'],'세 집합의 포함·배제에서 세 번 겹치는 부분을 다시 더하기','three-set inclusion exclusion')

for n in range(12,29,2):
 product=str(int('1'*n)*int('9'*n));count=sum(int(c)%2 for c in product);assert count==n
 add(23,{'digits':n},f'1이 {n}개 이어진 수와 9가 {n}개 이어진 수를 곱하였습니다. 곱의 자리 숫자 중 홀수인 숫자는 모두 몇 개입니까?',f'{count}개',[count],[f'9가 {n}개 이어진 수는 1 뒤에 0이 {n}개 있는 수에서 1을 뺀 수입니다.',f'따라서 곱은 1이 {n}개 이어진 수를 {n}자리 왼쪽으로 옮긴 다음 원래 수를 빼어 구할 수 있습니다. 계산 결과는 1이 {n-1}개, 0 한 개, 8이 {n-1}개, 마지막 9 한 개로 이루어집니다.',f'홀수 숫자는 앞부분의 1 {n-1}개와 마지막의 9 한 개이므로 {n-1}＋1＝{count}개입니다.'],['홀수 숫자 개수'],'반복수의 곱을 자릿값 이동과 뺄셈으로 바꾸기','big integer product and parity tally')

for j in range(1,10):
 remaining=12+8*j;v=remaining;reverse=[]
 for _ in range(3):prev=Fraction(v*3,2)+6;assert prev.denominator==1;reverse.append(int(prev));v=int(prev)
 total=v+11
 add(25,{'remaining':remaining,'bags':3,'fixed':6,'eat':11},f'귤 한 상자에서 11개를 먹었습니다. 남은 귤을 나누어 주려고 먼저 6개를 봉지에 넣고, 그 뒤 남은 귤의 {frac(1,3)}도 같은 봉지에 넣었습니다. 같은 방법으로 모두 3봉지를 만들었더니 귤이 {remaining}개 남았습니다. 처음 상자에 있던 귤은 몇 개입니까?',f'{total}개',[total],['한 봉지를 만들 때 먼저 6개를 빼고 나머지의 3분의 1을 담으므로, 남는 귤은 그 나머지의 3분의 2입니다. 거꾸로는 남은 수를 2로 나눈 뒤 3배 하고 6개를 더합니다.',f'마지막 봉지 직전에는 {remaining}÷2×3＋6＝{reverse[0]}개였습니다.',f'그 앞에는 {reverse[0]}÷2×3＋6＝{reverse[1]}개, 첫 봉지 직전에는 {reverse[1]}÷2×3＋6＝{reverse[2]}개였습니다.',f'처음 먹은 11개를 되돌리면 {reverse[2]}＋11＝{total}개입니다.'],['처음 귤 개수'],'분수를 취한 나머지에서 거꾸로 복원할 때 더하는 순서 지키기','reverse affine fraction operation three times')

for E,Y,future in [(12,9,5),(12,12,4),(12,13,7),(16,10,6),(16,12,5),(16,14,7),(20,11,4),(20,13,6),(20,15,8)]:
 total=3*Y+E;ans=Y+future
 add(26,{'eldestAtFirst':E,'currentSum':total,'futureYears':future},f'큰형이 {E}살일 때 막내의 나이는 둘째 형 나이의 절반이었습니다. 막내가 태어났을 때 큰형의 나이는 둘째 형 나이의 3배였습니다. 지금 세 형제의 나이의 합이 {total}살이라면 {future}년 후 막내는 몇 살입니까? 태어난 해의 나이는 0살로 셉니다.',f'{ans}살',[ans],[f'큰형이 {E}살일 때 막내를 □살이라 하면 둘째는 □×2살입니다. 막내가 태어났을 때 둘째는 □살, 큰형은 ({E}−□)살이므로 {E}−□＝□×3입니다.',f'따라서 그때 막내는 {E}÷4＝{E//4}살이었습니다. 큰형과 막내의 차는 {3*E//4}살, 둘째와 막내의 차는 {E//4}살입니다.',f'지금 나이의 합에서 두 나이 차를 빼면 막내 나이의 3배입니다. 막내는 ({total}−{3*E//4}−{E//4})÷3＝{Y}살입니다.',f'{future}년 후에는 {Y}＋{future}＝{ans}살입니다.'],['미래 막내 나이'],'같은 만큼 나이를 거슬러 올라가고 일정한 나이 차 이용하기','past ratio determines fixed age gaps')

# Preserve the sparse place-value shape; change actual numeric constraints.
by_pattern=defaultdict(list)
for A in range(200,400):
 for B in range(10,100):
  u=A*(B%10);t=A*(B//10);p=A*B
  if 100<=u<1000 and 1000<=t<10000 and 10000<=p<100000 and u%10==t%10==5:
   by_pattern[A//100,t//100%10,p//100%10,p//10%10].append((A,B,p,u,t))
cases=[(k,vals[0]) for k,vals in by_pattern.items() if len(vals)==1 and 235<=vals[0][0]<=295 and vals[0][1]%10==3 and k!=(2,3,5,7)]
assert len(cases)>=9
for key,(A,B,p,u,t) in cases[:9]:
 h,mid,ph,pt=key
 rows=[f'    {h}□□','×    □□','───────','    □□5',f'  □{mid}□5 ','───────',f'  □□{ph}{pt}□']
 add(27,{'hundreds':h,'tensPartialHundreds':mid,'productHundreds':ph,'productTens':pt},'다음은 세 자리 수와 두 자리 수를 곱하는 세로셈입니다. □에 알맞은 숫자를 넣었을 때 맨 아래에 완성되는 다섯 자리 수를 구하시오.',str(p),[p],['첫 부분 곱은 세 자리이면서 일의 자리가 5입니다. 세 자리 수가 200 이상이므로 곱하는 수의 일의 자리는 1 또는 3이고, 세 자리 수의 일의 자리는 5여야 합니다.',f'두 번째 부분 곱은 네 자리이며 백의 자리가 {mid}, 일의 자리가 5입니다. 이 조건과 세 자리 수의 백의 자리가 {h}이라는 조건을 함께 적용합니다.',f'가능한 수들을 확인하면 세 자리 수는 {A}, 두 자리 수는 {B}입니다. 첫 부분 곱 {A}×{B%10}＝{u}, 둘째 부분 곱 {A}×{B//10}＝{t}이 주어진 자리와 맞습니다.',f'십의 자리에서 나온 부분 곱은 한 자리 왼쪽에 더하므로 {u}＋{t}×10＝{p}입니다. 맨 아래 백의 자리 {ph}, 십의 자리 {pt}도 일치합니다.'],['다섯 자리 곱'],'부분 곱의 자리수와 일의 자리 조건을 함께 좁히기','complete search over valid multiplicands and multiplier',arithmeticRows=rows)

def compress(positions):
 spans=[];start=last=positions[0]
 for p in positions[1:]:
  if p==last+1:last=p
  else:spans.append(str(start) if start==last else f'{start}~{last}');start=last=p
 spans.append(str(start) if start==last else f'{start}~{last}');return ', '.join(spans)

source=''.join(map(str,range(1,101)))
for deleted in [88,90,92,94,96,98,102,104,106]:
 keep=len(source)-deleted;answer='';pos=0;positions=[];trace=[]
 for remaining in range(keep,0,-1):
  options=[(source[i],i) for i in range(pos,len(source)-remaining+1) if answer or source[i]!='0'];digit,index=min(options)
  answer+=digit;positions.append(index+1)
  if len(trace)<8:trace.append(f'{len(answer)}번째에는 {index+1}번째 자리의 {digit}')
  pos=index+1
 add(29,{'delete':deleted,'from':1,'to':100},f'1부터 100까지의 자연수를 차례로 이어 쓴 수에서 숫자 {deleted}개를 지웁니다. 남은 숫자의 순서는 바꿀 수 없습니다. 첫 자리 숫자가 0이 아닌 가장 작은 수를 구하시오.',answer,[answer],[f'이어 쓴 수는 9＋90×2＋3＝192자리이므로 숫자를 지운 뒤에는 192−{deleted}＝{keep}자리가 남습니다.',f'앞자리부터 가장 작게 골라야 합니다. 다음 숫자를 고를 때에는 뒤에 필요한 자리 수가 남는 범위 안에서 가장 작은 숫자를 고르고, 같으면 더 앞의 것을 고릅니다. 첫 자리만 0을 제외합니다.',', '.join(trace)+'를 남깁니다.',f'같은 방법으로 끝까지 고르면 원문의 다음 자리들을 남깁니다: {compress(positions)}. 남긴 자리가 {keep}개이므로 지운 숫자는 정확히 {deleted}개입니다.',f'따라서 가장 작은 수는 {answer}입니다. 더 뒤의 자리를 바꾸어도 앞자리에서 더 큰 숫자를 고른 수보다 작아질 수 없으므로 이 선택이 최소입니다.'],['가장 작은 수 전체'],'앞자리 우선 비교와 남겨야 할 자리 수의 한계를 함께 적용하기','left-to-right feasible-window greedy subsequence',promptDataLines=['12345678910111213141516…99100'])

sets=[]
for missing in it.combinations(range(1,17),4):
 cards=[n for n in range(1,17) if n not in missing];total=sum(cards)
 if total%3:continue
 target=total//3;valid=[s for s in it.combinations(cards,4) if sum(s)==target]
 if 20<=len(valid)<=45:sets.append((cards,total,target,valid))
for cards,total,target,valid in sets[3:12]:
 groups=defaultdict(list)
 for combo in valid:groups[combo[-1]].append(combo[:-1])
 steps=['B 주머니의 카드 수가 A의 2배이므로 12장을 세 묶음으로 나누어 A에는 4장, B에는 8장을 넣어야 합니다.',f'전체 카드 숫자의 합은 {total}이고 합도 B가 A의 2배이므로 A의 네 수의 합은 {total}÷3＝{target}입니다.']
 for largest,triples in groups.items():steps.append(f'A의 가장 큰 수가 {largest}일 때 나머지 세 수의 합은 {target-largest}입니다. 가능한 세 수는 '+', '.join('('+', '.join(map(str,s))+')' for s in triples)+f'의 {len(triples)}가지입니다.')
 steps.append('가장 큰 수가 다른 경우는 서로 겹치지 않습니다. 따라서 '+'＋'.join(str(len(v)) for v in groups.values())+f'＝{len(valid)}가지입니다. A의 네 장을 정하면 B의 여덟 장은 자동으로 정해집니다.')
 add(30,{'cards':cards,'countRatio':2,'sumRatio':2},'아래 수 카드 12장을 두 주머니 A, B에 나누어 모두 넣습니다. B에 넣는 카드 수는 A의 2배이고, 카드에 적힌 수의 합도 B가 A의 2배가 되게 하는 방법은 모두 몇 가지입니까?',f'{len(valid)}가지',[len(valid)],steps,['나누는 방법 수'],'주머니의 개수 비와 합의 비를 각각 먼저 정하기','all 4-card subsets with target one-third sum',cards=cards)

assert len(items)==126,len(items)
assert all(sum(x['sourceNo']==no for x in items)==9 for no in TYPES)
assert len({(x['text'],json.dumps(x.get('cards')),json.dumps(x.get('givenTable')),json.dumps(x.get('arithmeticRows'))) for x in items})==126
data={'version':'20261024-applied2-expansion-r1','sourceSet':'applied','sourceRound':2,'policy':{'targetVariantsPerSource':9,'runtimeGeneration':False,'defaultDiagnosticVariants':3,'difficulty':'활용 배점대만 사용','sourceGradeMutation':False},'availableSourceNos':sorted(TYPES),'pendingSourceNos':[n for n in range(1,31) if n not in TYPES],'items':items,'sourceEditionNotes':{'10':'앞뒤가0명인1줄의모호성을새지문에서배제; 원문점수보존','18':'현행문제PDF는어느것도좋아하지않는18명,교사PDF다른판본8명. 현행저장답2명보존','23':'원문열자리표현과실제나열길이를같다고가정하지않고새문항은개수명시','17':'문구15개와실제그림칸수불일치,공개보류'}}
(ROOT/'bank/data/applied2-expanded.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored 126 Applied 2 variants in 14 types; pending independent/output review')

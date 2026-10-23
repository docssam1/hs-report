"""Finite variants from the directly inspected current Applied 3 exam and answer PDFs.
No source grade changes; q6 and q29 answer conflicts remain held.
"""
import itertools as it,json,math
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];items=[]
TYPES={1:('수와 식','분수 배열의 규칙','삼각수 묶음 속 분수 찾기'),2:('수와 식','연속한 수와 곱','펼친 책의 쪽수'),3:('도형','평면의 분할','직선으로 원을 나누는 최대 조각 수'),5:('도형','둘레와 중복','세 겹의 정사각 테두리의 점 수'),8:('수와 식','달력과 주기','달 길이를 이어 다음 해 요일 찾기'),9:('도형','둘레와 간격','닫힌 둘레에서 두 종류 나무 세기'),10:('수와 식','배수와 나머지','공통 나머지 차를 이용한 수 찾기'),11:('수와 식','수의 삼각 배열','한 행에 들어가는 연속수의 합'),15:('수와 식','자릿수와 최댓값','자릿수 합과 중복 없는 가장 큰 수'),17:('도형','접기와 펼치기','단계별 구멍의 복원 배수'),20:('수와 식','반복수의 계산','분배법칙으로 반복수의 자리 합 구하기'),22:('수와 식','달력과 주기','요일별 용돈으로 시작 요일 찾기'),23:('수와 식','속력과 만남','정지 시간을 제외한 두 사람의 이동'),25:('경우의 수','중복과 순열','곱이 0인 네 자리 수의 합 조건'),26:('수와 식','자릿수와 관계식','뒷자리를 지운 세 수의 합'),28:('수와 식','수의 크기와 자리','이어 쓴 수에서 숫자를 지워 최솟값'),30:('수와 식','시각과 경과 시간','잘못 맞춘 시계와 왕복 시간')}
FIG={3:'pizza',8:'june-calendar',11:'triangular-rows',17:'fold-stages'}
def frac(a,b):return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{a}</mn><mn>{b}</mn></mfrac></math>'
def add(no,p,text,ans,parts,steps,labels,focus,method,**extra):
 v=1+sum(x['sourceNo']==no for x in items);area,sub,detail=TYPES[no];point='2.7' if no<=12 else '3.4' if no<=22 else '4.2';page=1 if no<=4 else 2 if no<=10 else 3 if no<=14 else 4 if no<=19 else 5 if no<=24 else 6 if no<=29 else 7
 x=dict(id=f'applied3-q{no:02d}-v{v}',genId=f'applied3-q{no:02d}',sourceSet='applied',sourceRound=3,sourceNo=no,variantNo=v,reviewStatus='pending-output-review',area=area,subarea=sub,detailType=detail,pointBand=point,text=text,answer=str(ans),answerParts=parts,answerLabels=labels,acceptedAnswers=[str(ans)],answerContract='ordered-parts',solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,learningLocation=f'활용 3회 · 원문 {no}번 · {sub}',verification={'primaryMethod':method,'parameters':p,'independentSuite':'qa/applied3-independent-validate.py','sourceExamPage':page,'sourceAnswerPage':page,'studentDifficultyMeasured':False},difficultyEvidence={'basis':'source-point-band','label':{'2.7':'하','3.4':'중','4.2':'상'}[point],'sourceReasoningPreserved':True,'measuredVariantRate':None})
 if no in FIG:x['asset']={'kind':'raster','src':f'assets/applied3/{FIG[no]}.png','description':detail+'의 원본 그림'}
 x.update(extra);items.append(x)
for k,j in [(8,3),(9,7),(10,4),(12,8),(13,6),(14,11),(15,9),(16,5),(17,12)]:
 n=k*(k-1)//2+j;den=k+2-j
 add(1,{'index':n},f'다음은 일정한 규칙에 따라 나열된 분수들입니다. {n}번째 분수의 분자와 분모의 합은 얼마입니까?',k+2,[k+2],[f'분모가 2인 분수로 끝나는 묶음을 보면 첫 묶음은 1개, 다음은 2개, 그다음은 3개입니다. 각 묶음 안에서는 분자가 1씩 커지고 분모가 1씩 작아집니다.',f'{k-1}번째 묶음까지의 분수는 1＋2＋…＋{k-1}＝{k*(k-1)//2}개입니다. {k}번째 묶음까지는 {k*(k+1)//2}개이므로 {n}번째는 이 묶음의 {j}번째입니다.',f'그 분수는 {frac(j,den)}이므로 분자와 분모의 합은 {j}＋{den}＝{k+2}입니다. 약분한 수가 아니라 배열에 쓰인 분자와 분모를 셉니다.'],['분자와 분모의 합'],'묶음의 길이와 묶음 안 위치를 나누어 세기','triangular group boundary',promptDataLines=[', '.join(frac(a,b) for a,b in [(1,2),(1,3),(2,2),(1,4),(2,3),(3,2)])+', …'])
for a in [68,70,72,74,76,78,80,84,86]:
 prod=a*(a+1)
 add(2,{'product':prod},f'수학책을 펼쳤을 때 마주 보는 두 쪽의 쪽수를 곱하였더니 {prod}가 나왔습니다. 왼쪽 쪽수와 오른쪽 쪽수를 각각 구하시오.',f'{a}쪽, {a+1}쪽',[a,a+1],[f'펼친 책에서 마주 보는 두 쪽수는 연속한 자연수입니다. 작은 쪽수를 찾으면 다음 쪽수도 정해집니다.',f'{a-1}×{a}＝{(a-1)*a}는 {prod}보다 작고, {a}×{a+1}＝{prod}입니다.',f'따라서 왼쪽은 짝수인 {a}쪽, 오른쪽은 {a+1}쪽입니다. 연속한 두 양의 수의 곱은 작은 수가 커질수록 커지므로 다른 답은 없습니다.'],['왼쪽 쪽수','오른쪽 쪽수'],'연속한 자연수의 곱에서 두 수 찾기','adjacent integer product')
for count in [35,42,50,62,85,100,114,129,146]:
 cuts=next(n for n in range(1,30) if 1+n*(n+1)//2>=count);prev=1+(cuts-1)*cuts//2;cap=1+cuts*(cuts+1)//2
 add(3,{'students':count},f'동그란 피자 한 판을 학생 {count}명에게 한 조각씩 나누어 주려고 합니다. 피자를 평평하게 둔 채 직선으로 자르며, 자른 조각을 옮기거나 겹쳐서 다시 자르지 않습니다. 최소 몇 번 잘라야 합니까? 조각의 크기는 같지 않아도 됩니다.',f'{cuts}번',[cuts],['첫 번째 직선은 조각을 1개 늘립니다. 다음 직선이 앞의 모든 직선과 피자 안의 서로 다른 점에서 만나면 두 번째는 2개, 세 번째는 3개씩 조각을 더 늘릴 수 있습니다.',f'{cuts-1}번으로 만들 수 있는 조각은 최대 1＋1＋2＋…＋{cuts-1}＝{prev}개라서 {count}명에게 한 조각씩 줄 수 없습니다.',f'{cuts}번이면 최대 1＋1＋2＋…＋{cuts}＝{cap}개가 됩니다. 충분히 많은 조각을 만들 수 있으므로 최소 {cuts}번입니다.'],['최소 자르는 횟수'],'직선을 추가할 때 생기는 최대 새 구역 수를 누적하기','maximum regions recurrence')
for n in [18,20,24,26,28,30,32,34,36]:
 inner=n-6;ans=n*n-inner*inner
 add(5,{'outerSidePoints':n,'layers':3},f'정사각형 모양의 꽃밭 둘레에 가로와 세로의 간격이 모두 같도록 깃발을 세 겹으로 꽂았습니다. 가장 바깥 정사각형의 한 변에는 양 끝의 깃발을 포함하여 {n}개가 있습니다. 각 겹은 깃발 한 간격씩 안쪽에 있으며 네 모서리에도 깃발을 꽂습니다. 깃발은 모두 몇 개입니까?',f'{ans}개',[ans],[f'바깥 정사각형의 한 변에는 {n}개가 있지만 네 변을 더하면 모서리를 두 번씩 세므로 {n}×4−4＝{4*n-4}개입니다.',f'한 간격 안쪽으로 들어갈 때 한 변의 깃발 수는 2개씩 줄어듭니다. 두 번째 겹은 {n-2}×4−4＝{4*(n-2)-4}개, 세 번째 겹은 {n-4}×4−4＝{4*(n-4)-4}개입니다.',f'따라서 모두 {4*n-4}＋{4*(n-2)-4}＋{4*(n-4)-4}＝{ans}개입니다.'],['깃발 개수'],'각 정사각 테두리에서 중복된 모서리를 한 번씩 빼기','sum of three square perimeters')
week=['일','월','화','수','목','금','토'];delta=sum([30,31,31,30,31,30,31])
for day in range(2,11):
 wd=(6+delta+day-1)%7
 add(8,{'nextJanuaryDay':day},f'그림은 어느 해 6월의 달력입니다. 다음 해 1월 {day}일은 무슨 요일입니까?',week[wd]+'요일',[week[wd]+'요일'],['달력에서 6월 1일은 토요일입니다. 6월 1일부터 다음 해 1월 1일까지는 6월부터 12월까지의 날짜 수만큼 지납니다.',f'30＋31＋31＋30＋31＋30＋31＝{delta}일이고, {delta}를 7로 나눈 나머지는 {delta%7}입니다. 따라서 다음 해 1월 1일은 수요일입니다.',f'1월 {day}일은 그날에서 {day-1}일 뒤입니다. 수요일부터 {day-1}일을 세면 {week[wd]}요일입니다. 이 기간에는 2월이 없어 윤년 여부에 영향을 받지 않습니다.'],['요일'],'달의 길이를 모두 더하고 7일 주기로 줄이기','month length sum modulo seven')
for length in [80,84,88,96,100,104,108,112,116]:
 count=length//4;ans=3*count
 add(9,{'perimeter':length,'spacing':4,'between':2},f'둘레가 {length}m인 원 모양의 호수 둘레에 4m 간격으로 목련나무를 심습니다. 이웃한 목련나무 사이마다 벚나무를 2그루씩 심는다면 두 종류의 나무는 모두 몇 그루입니까?',f'{ans}그루',[ans],[f'호수 둘레는 닫힌 길이므로 처음과 끝이 만납니다. 목련나무 수와 4m 간격의 수는 같아서 {length}÷4＝{count}그루입니다.',f'이웃한 목련나무 사이도 {count}곳이고 그마다 벚나무 2그루를 심으므로 벚나무는 {count}×2＝{2*count}그루입니다.',f'두 종류를 더하면 {count}＋{2*count}＝{ans}그루입니다.'],['전체 나무 수'],'닫힌 길에서 간격 수와 나무 수가 같음을 적용하기','closed loop interval count')
for m,n,c,limit in [(4,7,1,100),(5,8,2,130),(5,9,3,140),(7,8,2,150),(4,9,1,120),(7,9,3,180),(5,11,2,170),(8,9,3,190),(7,10,4,200)]:
 L=math.lcm(m,n);ans=list(range(L-c,limit,L));assert ans
 add(10,{'m':m,'n':n,'c':c,'limit':limit},f'{limit}보다 작은 자연수 중 {m}로 나누면 나머지가 {m-c}이고, {n}로 나누면 나머지가 {n-c}인 수를 모두 구하시오.',', '.join(map(str,ans)),ans,[f'조건에 맞는 수에 {c}을 더하면 {m}로도 {n}로도 나누어떨어집니다.',f'{m}와 {n}의 최소공배수는 {L}이므로 찾는 수는 {L}의 배수에서 {c}을 뺀 수입니다.',f'{limit}보다 작은 수를 차례로 찾으면 '+', '.join(f'{L*k}−{c}＝{v}' for k,v in enumerate(ans,1))+f'입니다. 그다음 수 {L*(len(ans)+1)-c}는 범위를 벗어나므로 답은 '+', '.join(map(str,ans))+'입니다.'],['조건에 맞는 모든 수'],'나머지를 같은 만큼 보충하여 공배수로 바꾸기','lcm progression with common remainder complement',answerContract='unordered-set')
for row in [14,15,16,17,19,20,21,22,23]:
 first=row*(row-1)//2+1;last=row*(row+1)//2;ans=(first+last)*row//2
 add(11,{'row':row},f'그림과 같은 규칙으로 자연수를 배열합니다. {row}행에 있는 수를 모두 더하면 얼마입니까?',ans,[ans],[f'각 행에 들어가는 수는 행 번호와 같습니다. {row-1}행까지는 1＋2＋…＋{row-1}＝{first-1}개의 수가 있습니다.',f'따라서 {row}행은 {first}부터 {last}까지의 연속한 수 {row}개입니다.',f'처음 수와 마지막 수의 합을 이용하면 ({first}＋{last})×{row}÷2＝{ans}입니다.'],['행의 수의 합'],'삼각수로 행의 시작과 끝을 찾고 등차수열 합 구하기','triangular row endpoints and arithmetic sum')
for S in [12,13,14,15,17,18,19,20,21]:
 candidates=[int(''.join(map(str,sorted(ds,reverse=True)))) for k in range(1,11) for ds in it.combinations(range(10),k) if sum(ds)==S and any(ds)];ans=max(candidates);digits=list(map(int,str(ans)));m=len(digits)
 add(15,{'digitSum':S},f'각 자리 숫자가 서로 다른 자연수 중 각 자리 숫자의 합이 {S}인 가장 큰 수를 구하시오.',ans,[ans],[f'양의 정수는 자릿수가 많을수록 큽니다. 서로 다른 숫자 {m+1}개를 쓰려면 최소 합이 0＋1＋…＋{m}＝{m*(m+1)//2}이므로 합 {S}로는 {m+1}자리 수를 만들 수 없습니다.',f'{m}자리 수 중 맨 앞자리부터 크게 정하되, 나머지 자리에 서로 다른 숫자를 넣어 합 {S}을 완성할 수 있어야 합니다. 가능한 숫자 묶음을 비교하면 '+', '.join(map(str,digits))+'을 고르는 것이 맨 앞자리부터 가장 큽니다.',f'이 숫자들을 큰 것부터 쓰면 {ans}이고, 자리 합은 '+'＋'.join(map(str,digits))+f'＝{S}입니다. 중복 숫자가 없으므로 모든 조건을 만족합니다.'],['가장 큰 자연수'],'가능한 최대 자릿수를 먼저 정하고 앞자리부터 비교하기','all digit subsets with target sum')
for a,b,c in [(1,2,3),(2,2,4),(2,4,3),(3,2,4),(3,4,2),(4,3,2),(2,5,3),(4,2,5),(5,3,4)]:
 ans=2*a+4*b+8*c
 add(17,{'holes':[a,b,c]},f'정사각형 색종이를 그림의 순서로 접습니다. 2단계에서 구멍을 {a}개, 3단계에서 {b}개, 4단계에서 {c}개 뚫었습니다. 구멍은 접힌 선과 가장자리를 피한 안쪽에 뚫으며, 펼쳤을 때 서로 겹치지 않습니다. 색종이를 완전히 펼치면 구멍은 모두 몇 개입니까?',f'{ans}개',[ans],[f'2단계는 원래 종이가 두 겹으로 포개진 상태이므로 구멍 하나가 펼친 뒤 두 개가 됩니다. 따라서 {a}×2＝{2*a}개입니다.',f'3단계는 네 겹이므로 {b}×4＝{4*b}개, 4단계는 여덟 겹이므로 {c}×8＝{8*c}개가 됩니다.',f'펼친 구멍은 서로 겹치지 않으므로 {2*a}＋{4*b}＋{8*c}＝{ans}개입니다.'],['전체 구멍 수'],'구멍을 뚫은 시점의 겹 수를 각각 적용하기','layer multiplicities at successive folds')
for n in [6,7,8,9,11,12,13,14,15]:
 A=int('9'*n);B=int('2'*n);C=int('3'*n);val=A*B+C*(C+1);ans=sum(map(int,str(val)))
 add(20,{'digits':n},f'다음 식을 계산한 수의 각 자리 숫자의 합을 구하시오.',ans,[ans],[f'3이 {n}개 이어진 수를 □라 하면, 9가 {n}개 이어진 수는 □×3이고 2가 {n}개 이어진 수는 □의 3분의 2입니다.',f'첫 곱은 □×(2가 {n}개 이어진 수의 3배)이고, 두 곱을 묶으면 □×(6이 {n}개 이어진 수＋□＋1)입니다.',f'괄호 안은 9가 {n}개 이어진 수＋1, 즉 10의 {n}제곱입니다. 따라서 계산 결과는 {C} 뒤에 0이 {n}개 붙은 {val}입니다.',f'0은 자리 합에 영향을 주지 않으므로 각 자리 숫자의 합은 3×{n}＝{ans}입니다.'],['각 자리 숫자의 합'],'같은 반복수를 인수로 묶어 자릿값 이동으로 바꾸기','distributive identity using repdigits',promptDataLines=[f'{A} × {B}',f'＋ {C} × {C+1}'])
allowance=[]
for days in range(15,29):
 if days==18 or days%7==0:continue
 totals=[sum(200 if (s+i)%7 in [1,2,3,4,5] else 100 if (s+i)%7==6 else 0 for i in range(days)) for s in range(7)]
 for s,total in enumerate(totals):
  if s and totals.count(total)==1:allowance.append((days,s,total))
selected=[]
for c in allowance:
 if c[0] not in [x[0] for x in selected]:selected.append(c)
 if len(selected)==9:break
assert len(selected)==9
for days,s,total in selected:
 weeks,left=divmod(days,7);rest=total-weeks*1100;seq=[week[(s+i)%7] for i in range(left)]
 add(22,{'days':days,'total':total},f'매주 월요일부터 금요일까지는 하루 200원, 토요일에는 100원의 용돈을 받고 일요일에는 받지 않습니다. 어느 날부터 연속 {days}일 동안 받은 용돈이 모두 {total}원이라면 그 기간이 시작된 날은 무슨 요일입니까?',week[s]+'요일',[week[s]+'요일'],[f'어느 요일부터 시작하더라도 연속 7일 동안 받는 돈은 200×5＋100＝1100원입니다. {days}일은 {weeks}주와 {left}일입니다.',f'{weeks}주 동안 받는 {weeks*1100}원을 빼면 나머지 {left}일에 {rest}원을 받았습니다.',f'일요일부터 토요일까지 각 요일을 시작으로 {left}일의 용돈을 더해 비교하면 {week[s]}요일부터 시작할 때만 {rest}원이 됩니다. 그 요일들은 '+', '.join(seq)+f'입니다. 따라서 시작은 {week[s]}요일입니다.'],['시작 요일'],'온전한 주의 용돈을 빼고 남은 연속 요일 비교하기','seven cyclic start-day sums')
for T,stop,ratio,v in [(4,1,3,8),(5,1,2,9),(4,2,3,10),(6,2,2,7),(5,2,3,8),(6,1,2,6),(4,1,4,7),(5,1,3,6),(6,2,3,5)]:
 dist=(ratio*(T-stop)+T)*v;fast=ratio*v
 add(23,{'distance':dist,'hours':T,'stop':stop,'ratio':ratio},f'A, B 두 지점은 {dist}km 떨어져 있습니다. 두 사람이 동시에 출발하여 서로를 향해 갑니다. 자전거를 탄 사람은 고장 수리를 위해 도중에 {stop}시간 멈췄고, 걷는 사람은 쉬지 않았습니다. 출발한 지 {T}시간 후 만났으며 그때 수리는 끝난 상태였습니다. 자전거로 이동할 때의 속력은 걷는 속력의 {ratio}배로 일정합니다. 두 사람의 속력은 각각 시속 몇 km입니까?',f'자전거 {fast}km, 걷기 {v}km',[fast,v],[f'걷는 사람은 {T}시간을 이동했고 자전거는 수리한 {stop}시간을 뺀 {T-stop}시간을 이동했습니다.',f'걷는 속력을 한 묶음이라고 하면 두 사람이 간 거리의 합은 {T}묶음＋{ratio}×{T-stop}묶음＝{T+ratio*(T-stop)}묶음입니다. 이 거리가 {dist}km입니다.',f'걷는 속력은 {dist}÷{T+ratio*(T-stop)}＝{v}km/h이고, 자전거 속력은 {v}×{ratio}＝{fast}km/h입니다. 실제 이동 거리 {v*T}＋{fast*(T-stop)}＝{dist}km로 확인합니다.'],['자전거 속력(km/h)','걷는 속력(km/h)'],'멈춘 시간을 먼저 제외하고 속력 비로 이동 거리 합 만들기','effective travel times and speed ratio')
for S in [11,12,13,14,16,17,18,19,20]:
 groups=[]
 for ds in it.combinations_with_replacement(range(10),4):
  if sum(ds)!=S or 0 not in ds or max(Counter(ds).values())>3:continue
  perms=sorted({int(''.join(map(str,p))) for p in it.permutations(ds) if p[0]!=0});groups.append((ds,len(perms)))
 ans=sum(n for ds,n in groups);steps=['곱이 0이 되려면 0인 숫자 카드가 적어도 한 장 있어야 합니다. 네 자리 수이므로 첫 자리에는 0을 둘 수 없고, 같은 숫자는 카드 수에 따라 세 번까지만 쓸 수 있습니다.']
 steps.append('0이 하나이고 나머지 세 숫자가 모두 다르면 3×3×2＝18가지, 두 숫자가 같으면 9가지, 세 숫자가 같으면 3가지입니다. 0이 두 개일 때 나머지 둘이 다르면 3×2＝6가지, 같으면 3가지입니다.')
 for zeros in [1,2,3]:
  g=[(ds,n) for ds,n in groups if ds.count(0)==zeros]
  if not g:continue
  steps.append(f'0이 {zeros}개인 숫자 묶음은 '+', '.join('('+','.join(map(str,ds))+f'): {n}가지' for ds,n in g)+f'입니다. 같은 숫자의 교환은 한 가지로 세고 맨 앞이 0인 배열은 제외한 수입니다.')
 steps.append(f'이 묶음들은 서로 다른 숫자 구성이므로 겹치지 않습니다. 모두 더하면 {ans}가지입니다.')
 add(25,{'digitSum':S,'cardCopies':3},f'0부터 9까지의 숫자 카드가 각각 3장씩 있습니다. 카드 4장을 골라 각 자리 숫자의 곱이 0이고, 각 자리 숫자의 합이 {S}인 네 자리 수를 만들려고 합니다. 만들 수 있는 서로 다른 네 자리 수는 모두 몇 가지입니까?',f'{ans}가지',[ans],steps,['네 자리 수의 개수'],'0의 개수와 같은 숫자의 중복을 나누어 첫 자리 제한 적용하기','digit multisets and distinct nonzero-leading permutations')
for n in [3417,3578,4086,4269,4523,4871,5146,5634,6278]:
 s=n+n//10+n//100;a,b,c,d=map(int,str(n));triple=1000*a+100*b+10*c+d+100*a+10*b+c+10*a+b
 assert s==triple
 add(26,{'sum':s},f'어떤 네 자리 수에서 일의 자리 숫자를 지운 수를 두 번째 수, 일의 자리와 십의 자리 숫자를 지운 수를 세 번째 수라고 합니다. 처음 수와 두 번째 수, 세 번째 수의 합이 {s}일 때 처음 네 자리 수를 구하시오.',n,[n],[f'처음 수의 천·백·십·일의 자리 숫자를 각각 A, B, C, D라 하면 세 수의 합은 1110×A＋111×B＋11×C＋D입니다.',f'B·C·D가 모두 9여도 111×9＋11×9＋9＝1107로 1110보다 작습니다. 따라서 {s}을 1110으로 나눈 몫이 A＝{a}입니다. 남은 {s-1110*a}에서 111로 나눈 몫 B＝{b}를 구합니다. 나머지 {11*c+d}를 11로 나누면 몫 C＝{c}, 나머지 D＝{d}입니다.',f'확인하면 {n}＋{n//10}＋{n//100}＝{s}입니다. 처음 수를 1씩 크게 할 때 잘라 낸 두 수는 줄지 않으므로 세 수의 합도 반드시 커집니다. 따라서 답은 {n} 하나입니다.'],['처음 네 자리 수'],'자리를 지운 수의 자릿값을 정리하고 합의 단조성 확인하기','digit-place weighted sum')
seq=''.join(map(str,range(1,51)))
for delete in [41,43,45,47,49,51,53,55,57]:
 keep=len(seq)-delete;answer='';pos=0;positions=[]
 for j in range(keep):
  end=len(seq)-(keep-j)+1;choices=[(seq[k],k) for k in range(pos,end) if j or seq[k]!='0'];digit,k=min(choices);answer+=digit;positions.append(k+1);pos=k+1
 trace=', '.join(map(str,positions))
 add(28,{'from':1,'to':50,'delete':delete},f'1부터 50까지의 자연수를 차례로 이어 쓴 수에서 숫자 {delete}개를 지웁니다. 남은 숫자의 순서는 바꿀 수 없습니다. 첫 자리 숫자가 0이 아닌 가장 작은 수를 구하시오.',answer,[answer],[f'이어 쓴 수는 한 자리 수 9개와 두 자리 수 41개로 이루어져 9＋41×2＝91자리입니다. 남겨야 할 자리는 91−{delete}＝{keep}개입니다.',f'첫 자리부터 뒤에 필요한 숫자 수를 남길 수 있는 범위 안에서 가장 작은 숫자를 고릅니다. 같은 숫자면 더 앞의 것을 골라 뒤의 선택 범위를 넓히고, 첫 자리에는 0을 고르지 않습니다.',f'차례로 남길 원문의 자리 번호는 {trace}입니다. 정확히 {keep}개를 남겨 {delete}개를 지웁니다.',f'남는 수는 {answer}입니다. 앞에서 처음 달라지는 자리의 숫자가 작을수록 전체 수도 작으므로 이 방법이 최소를 보장합니다.'],['가장 작은 수 전체'],'남겨야 할 자리 수를 유지하며 앞자리부터 최소로 고르기','feasible-window subsequence greedy',promptDataLines=['123456789101112…4950'])
def clock(t):return f'{t//60}시 {t%60:02d}분'
for setting,arrive,stay,travel in [(555,600,90,25),(560,610,100,30),(565,620,110,35),(570,630,100,40),(575,615,120,25),(580,625,90,45),(585,635,110,30),(590,640,100,35),(595,650,120,40)]:
 display=setting+stay+2*travel;true=arrive+stay+travel
 add(30,{'setting':setting,'friendArrival':arrive,'stay':stay,'homeDisplay':display},f'멈춘 시계의 건전지를 바꾼 뒤 정확한 시각을 모르는 상태에서 {clock(setting)}으로 맞추고 바로 친구 집으로 출발했습니다. 친구 집에 도착한 정확한 시각은 오전 {clock(arrive)}이었고, {stay}분 머문 뒤 바로 집으로 돌아왔습니다. 집의 시계는 {clock(display)}을 가리켰습니다. 시계는 건전지를 바꾼 뒤 정확한 속도로 갔으며 왕복에 걸린 시간은 서로 같습니다. 집에 돌아온 정확한 시각을 구하시오.',clock(true),[true//60,true%60],[f'집의 시계가 가리킨 시각의 차는 {clock(display)}−{clock(setting)}＝{display-setting}분입니다. 시계를 잘못 맞췄어도 같은 속도로 가므로 이 차는 실제 경과 시간입니다.',f'친구 집에 머문 {stay}분을 빼면 왕복 시간은 {display-setting}−{stay}＝{2*travel}분입니다. 갈 때와 올 때 시간이 같으므로 한 번 가는 데 {travel}분 걸립니다.',f'친구 집 도착 시각 {clock(arrive)}에 머문 {stay}분과 돌아오는 {travel}분을 더하면 정확한 귀가 시각은 {clock(true)}입니다.'],['시','분'],'잘못 맞춘 시계에서도 경과 시간은 정확함을 이용하기','clock elapsed duration minus visit split in half')
assert len(items)==153 and all(sum(x['sourceNo']==n for x in items)==9 for n in TYPES)
assert len({(x['text'],json.dumps(x.get('promptDataLines'))) for x in items})==153
data={'version':'20261024-applied3-expansion-r1','sourceSet':'applied','sourceRound':3,'policy':{'targetVariantsPerSource':9,'runtimeGeneration':False,'defaultDiagnosticVariants':3,'difficulty':'활용 배점대만 사용','sourceGradeMutation':False},'availableSourceNos':sorted(TYPES),'pendingSourceNos':[n for n in range(1,31) if n not in TYPES],'items':items,'sourceEditionNotes':{'2':'원문81·82는마주보는쪽의짝홀조건과다름; 새수치는짝수·홀수연속쪽으로구성,원답보존','6':'원문두작업식의독립계산16일과교사답18일이불일치;새유형공개보류','29':'작은원2개예시5면과일반최대공식n²−n+1에서7개는43면;교사50면과충돌하여공개보류','21':'현재문제PDF의네카드칸이보이지않아원형미확정,공개보류'}}
(ROOT/'bank/data/applied3-expanded.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('Authored 153 Applied3 questions in 17 types, pending independent/output review')

"""Author a finite, reproducible Applied 1 pool; never change source grades.

Each model is checked again by qa/applied1-independent-validate.py, which must
not import these calculations. Source drawings are separately extracted,
visually compared and hashed; this script neither redraws nor alters them.
"""
import itertools as it
import json
import math
from pathlib import Path
from fractions import Fraction

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'bank/data/applied1-expanded.json'
items = []
TYPES = {
 1: ('수와 식','반복과 주기','양손 왕복 세기의 주기'),
 2: ('수와 식','자릿수와 숫자 세기','연속된 수에서 숫자의 출현 횟수'),
 3: ('수와 식','달력과 요일','같은 요일 날짜의 합으로 다음 달 요일 찾기'),
 4: ('수와 식','시계와 각도','시침과 분침이 겹치는 시각'),
 5: ('수와 식','나눗셈과 나머지','몫과 끝자리로 가능한 나누어지는 수 찾기'),
 6: ('도형','평면 도형의 규칙','홀수 너비 계단의 성냥개비 수'),
 9: ('수와 식','배수와 겹침','두 간격으로 표시한 막대의 도막 수'),
 10: ('수와 식','나이와 관계식','미래 나이의 합과 비로 현재 나이 찾기'),
 11: ('수와 식','합과 차의 관계','앞뒤 이동 횟수 역산'),
 12: ('수와 식','시계와 시간','늦어지는 시계를 맞춘 시각'),
 13: ('수와 식','수 카드와 곱','두 세 자리 수의 곱의 최댓값과 최솟값'),
 14: ('수와 식','비와 분배','세 봉지의 연속된 세 배 관계'),
 15: ('수와 식','분수의 규칙','묶음의 길이가 늘어나는 분수 나열'),
 16: ('수와 식','시계와 각도','두 바늘이 움직인 각도의 차로 시간 역산'),
 18: ('경우의 수','부호 선택','더하기와 빼기로 만들 수 있는 보기의 수'),
 20: ('수와 식','집합과 겹침','전체와 먹지 않은 사람의 비로 공통 부분 찾기'),
 22: ('수와 식','곱과 소인수','주사위 눈의 곱으로 특정 눈의 횟수 찾기'),
 23: ('수와 식','반복수의 계산','반복 숫자의 곱의 자릿수 합'),
 24: ('수와 식','거리와 시간','두 열차가 같은 터널을 통과하는 시간'),
 25: ('경우의 수','숫자 카드의 회전','반 바퀴 회전한 수와의 차'),
 26: ('수와 식','표와 수의 규칙','정사각형 테두리 수 배열의 행 찾기'),
 27: ('도형','입체 도형의 규칙','계단형 상자 입체의 성냥개비 수'),
 29: ('경우의 수','자리별 합산','중복 사용 수 카드로 만든 모든 수의 합'),
 30: ('수와 식','시간의 흐름','경주와 휴식의 시간표 역산'),
}
FIGURES = {1:'hands',6:'odd-stair',22:'die',25:'digital-cards',26:'number-grid',27:'solid-stair'}

def frac(a,b):
    return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{a}</mn><mn>{b}</mn></mfrac></math>'

def clock(m):
    return f'{m//60}시 {m%60:02d}분'

def add(no,params,text,answer,steps,parts,*,given=None,cards=None,accepted=None,contract='ordered-parts',focus='',model=''):
    v = sum(x['sourceNo']==no for x in items)+1
    area,sub,detail=TYPES[no]
    points='2.7' if no<=12 else '3.4' if no<=22 else '4.2'
    row=dict(id=f'applied1-q{no:02d}-v{v}',genId=f'applied1-q{no:02d}',sourceSet='applied',sourceRound=1,
             sourceNo=no,variantNo=v,reviewStatus='pending-output-review',area=area,subarea=sub,detailType=detail,
             pointBand=points,text=text,answer=str(answer),answerContract=contract,answerParts=parts,
             acceptedAnswers=accepted or [str(answer)],solutionSteps=steps,solution=' '.join(steps),
             learningPoint=focus,learningLocation=f'활용 1회 · 원문 {no}번 · {sub}',
             verification={'primaryMethod':model,'parameters':params,'independentSuite':'qa/applied1-independent-validate.py',
                           'sourceExamPage':1 if no<=6 else 2 if no<=12 else 3 if no<=18 else 4 if no<=24 else 5 if no<=28 else 6,
                           'sourceAnswerPage':no,'studentDifficultyMeasured':False},
             difficultyEvidence={'basis':'source-point-band','label':{'2.7':'하','3.4':'중','4.2':'상'}[points],
                                 'sourceReasoningPreserved':True,'measuredVariantRate':None})
    if no in FIGURES:
        row['asset']={'kind':'raster','src':f'assets/applied1/{FIGURES[no]}.png','description':detail+'의 원문 그림'}
    if given: row['promptDataLines']=given
    if cards: row['cards']=list(cards)
    items.append(row)

# 1: A complete outward-and-return period has 18 counts.
fingers=['왼손 소지','왼손 약지','왼손 중지','왼손 검지','왼손 엄지','오른손 엄지','오른손 검지','오른손 중지','오른손 약지','오른손 소지']
for N in [10003,11207,12413,13619,14827,16033,17239,18443,19649]:
    r=(N-1)%18; pos=r if r<10 else 18-r; a=fingers[pos]
    add(1,{'N':N},f'왼손 소지를 1로 하여 약지, 중지, 검지, 엄지 순서로 세고, 오른손 엄지로 옮겨 그림처럼 양손을 왕복하며 수를 셉니다. {N}을 셀 때는 어느 쪽의 어느 손가락을 짚습니까?',a,
        ['왼손 소지에서 오른손 소지까지 간 뒤 다시 왼손 쪽으로 돌아옵니다. 왼손 소지를 다시 짚는 수는 19이므로 같은 움직임이 18개마다 반복됩니다.',
         f'{N}−1＝{(N-1)//18}×18＋{r}이므로 처음 손가락에서 {r}번 이동한 자리입니다.',f'그 자리는 {a}입니다.'],[a],focus='왕복할 때 양 끝 손가락을 중복해서 세지 않기',model='reflection modulo 18')

# 2: Record a unique winning digit, not merely a total for an arbitrary digit.
ranges=[]
for lo in range(301,650,7):
    hi=lo+311; counts=[sum(str(n).count(str(d)) for n in range(lo,hi+1)) for d in range(10)]
    if counts.count(max(counts))==1 and (lo,hi)!=(465,776): ranges.append((lo,hi,counts))
for lo,hi,counts in ranges[:9]:
    d=counts.index(max(counts)); p=[sum(str(n).zfill(3)[i]==str(d) for n in range(lo,hi+1)) for i in range(3)]
    add(2,{'lo':lo,'hi':hi},f'{lo}부터 {hi}까지의 자연수를 차례로 모두 쓸 때 가장 많이 쓰는 숫자는 무엇이며, 모두 몇 번 쓰입니까?',f'{d}, {counts[d]}번',
        [f'백의 자리, 십의 자리, 일의 자리를 나누어 숫자마다 쓰인 횟수를 셉니다.', '0부터 9까지의 횟수는 각각 '+', '.join(map(str,counts))+'번입니다.',
         f'가장 많이 쓰인 숫자는 {d}입니다. 이 숫자는 백의 자리에 {p[0]}번, 십의 자리에 {p[1]}번, 일의 자리에 {p[2]}번 쓰여 모두 {sum(p)}번입니다.'],[d,counts[d]],focus='자리별 출현 횟수를 구하고 서로 다른 숫자를 비교하기',model='direct digit tally')

week=['월요일','화요일','수요일','목요일','금요일','토요일','일요일']
for k,(w,first,day) in enumerate([(1,5,11),(3,6,17),(5,7,23),(0,5,27),(2,6,12),(4,7,18),(6,5,24),(1,6,28),(3,7,19)]):
    total=4*first+42; jan1=(w-first+1)%7; ans=week[(jan1+31+day-1)%7]
    add(3,{'weekday':w,'sum':total,'febDay':day},f'어느 해 1월의 달력에서 {week[w]}인 날짜를 모두 더하였더니 {total}였습니다. 그해 2월 {day}일은 무슨 요일입니까?',ans,
        [f'{week[w]}이 네 번이라면 첫 날짜를 □라고 할 때 날짜의 합은 □×4＋7×(1＋2＋3)＝□×4＋42입니다. 다섯 번이면 첫 날짜는 1, 2, 3 중 하나이고 합은 75, 80, 85 중 하나여서 주어진 합과 다릅니다.',
         f'따라서 첫 {week[w]}은 ({total}−42)÷4＝{first}일입니다.',f'1월 {first}일부터 2월 {day}일까지 {31-first+day}일이고, 7로 나눈 나머지는 {(31-first+day)%7}입니다. {week[w]}에서 그만큼 뒤의 요일은 {ans}입니다.'],[ans],focus='같은 요일의 날짜가 네 번인지 다섯 번인지 먼저 판단하기',model='arithmetic progression and modular date')

for h in [1,2,3,4,5,6,8,9,10]:
    f=Fraction(60*h,11); m=int(f)
    add(4,{'hour':h},f'{h}시와 {h+1}시 사이에 시침과 분침이 겹치는 시각은 {h}시 □분과 {h}시 (□＋1)분 사이에 있습니다. □에 들어갈 정수를 구하시오.',str(m),
        [f'{h}시 정각에는 시침이 분침보다 {30*h}° 앞서 있습니다.',f'1분 동안 분침은 6°, 시침은 0.5° 움직이므로 분침이 5.5°씩 따라잡습니다.',f'겹칠 때까지 걸리는 시간은 {30*h}÷5.5＝{frac(60*h,11)}분입니다. {m}분보다 크고 {m+1}분보다 작으므로 □는 {m}입니다.'],[m],focus='두 바늘의 속도 차로 따라잡는 시간을 구하기',model='relative angular velocity')

for b,q in [(36,24),(38,24),(39,24),(37,25),(38,25),(39,25),(36,27),(37,26),(39,26)]:
    nums=[n for n in range(b*q,b*(q+1)) if n%10==6]; assert len(nums)==4
    add(5,{'divisor':b,'quotient':q,'lastDigit':6},'나눗셈을 적은 종이의 일부가 찢어졌습니다. 아래에 보이는 식을 보고 나누어지는 수가 될 수 있는 수를 모두 구하시오.',', '.join(map(str,nums)),
        [f'몫이 {q}이고 나누는 수가 {b}이므로 나누어지는 수는 {b}×{q}＝{b*q} 이상, {b}×{q+1}＝{b*(q+1)} 미만입니다.',f'이 범위에서 일의 자리가 6인 수를 빠짐없이 고르면 '+', '.join(map(str,nums))+'입니다.',f'각 수를 {b}로 나누면 몫은 모두 {q}이고 나머지는 0 이상 {b} 미만입니다.'],nums,contract='unordered-set',given=[f'…6 ÷ {b} ＝ {q} …'],focus='나머지의 범위와 끝자리 조건을 함께 적용하기',model='quotient interval with final digit')

for n,left in [(8,9),(9,15),(10,11),(11,17),(12,13),(13,19),(14,15),(15,21),(16,17)]:
    E=lambda n:2*n*n+3*n-1
    available=E(n)+left; assert available<E(n+1)
    add(6,{'available':available},f'성냥개비로 그림과 같은 도형을 계속 만듭니다. 성냥개비 {available}개로 몇 층까지 만들 수 있으며, 몇 개가 남습니까?',f'{n}층, {left}개',
        ['층별 정사각형 수는 위에서부터 1, 3, 5, …로 늘어납니다. 맞닿은 변의 성냥개비는 한 번만 셉니다.',f'{n}층에서 가로 성냥개비는 1＋3＋…＋{2*n-1}에 맨 아래 변 {2*n-1}개를 더하여 {n*n+2*n-1}개입니다. 세로 성냥개비는 2＋4＋…＋{2*n}＝{n*(n+1)}개입니다.',f'모두 {E(n)}개가 필요하고, {n+1}층은 {E(n+1)}개가 필요하여 부족합니다. 따라서 {n}층까지 만들고 {available}−{E(n)}＝{left}개가 남습니다.'],[n,left],focus='공유하는 변을 한 번만 세고 다음 층 가능 여부까지 확인하기',model='horizontal and vertical edge sum')

for a,b,L in [(3,5,150),(4,6,168),(3,7,168),(4,5,180),(5,6,210),(3,4,192),(4,7,224),(5,7,245),(3,8,240)]:
    l=math.lcm(a,b); ans=L//a+L//b-L//l
    add(9,{'length':L,'a':a,'b':b},f'길이가 {L}cm인 나무 막대의 한쪽 끝에서부터 {a}cm 간격으로 줄을 긋고, 같은 끝에서부터 다시 {b}cm 간격으로 줄을 그었습니다. 막대 안쪽에 표시된 곳을 모두 자르면 몇 도막이 됩니까?',f'{ans}도막',
        [f'막대 안쪽의 {a}cm 간격 줄은 {L//a-1}개, {b}cm 간격 줄은 {L//b-1}개입니다.',f'두 간격의 공배수인 {l}cm 간격 줄 {L//l-1}개는 두 번 세었으므로 한 번 뺍니다.',f'자르는 곳은 {L//a-1}＋{L//b-1}−{L//l-1}＝{ans-1}곳이고, 도막은 그보다 하나 많은 {ans}개입니다.'],[ans],focus='공통인 자르는 곳을 빼고 도막 수에는 1을 더하기',model='inclusion exclusion internal cuts')

for j,(years,teacher) in enumerate([(8,36),(9,37),(10,38),(11,39),(8,40),(9,41),(10,42),(11,43),(9,44)]):
    me=20-years; S=teacher+me; T=teacher+years+20+16+22
    add(10,{'years':years,'presentSum':S,'futureTotal':T,'gap':6,'ratio':[4,5]},f'지금 선생님과 내 나이의 합은 {S}살이고, 언니는 내 동생보다 6살 많습니다. {years}년 후 네 사람의 나이의 합은 {T}살이며, 그때 동생의 나이는 그때 내 나이의 {frac(4,5)}입니다. 지금 선생님은 몇 살입니까?',f'{teacher}살',
        [f'{years}년 후 선생님과 내 나이의 합은 {S}＋{years}×2＝{S+2*years}살입니다.',f'그때 언니와 동생의 합은 {T}−{S+2*years}＝38살입니다. 두 사람의 차는 6살이므로 동생은 (38−6)÷2＝16살입니다.',f'그때 내 나이는 16÷4×5＝20살이고, 지금 내 나이는 20−{years}＝{me}살입니다. 따라서 선생님의 현재 나이는 {S}−{me}＝{teacher}살입니다.'],[teacher],focus='미래의 나이 비와 현재의 나이를 구분해 역산하기',model='future pair sums and ratio')

for total,w in [(17,9),(19,11),(20,12),(21,13),(22,14),(23,15),(24,16),(25,17),(26,18)]:
    black=total-w; end=7*w-3*black
    add(11,{'draws':total,'end':end,'forward':7,'backward':3,'start':0},f'흰 공과 검은 공이 든 주머니에서 공을 한 개씩 꺼낸 뒤 다시 넣습니다. 말은 0번 칸에서 출발하여 흰 공이면 앞으로 7칸, 검은 공이면 뒤로 3칸 움직입니다. {total}번 꺼낸 뒤 말이 {end}번 칸에 있다면 흰 공과 검은 공은 각각 몇 번 나왔습니까?',f'흰 공 {w}번, 검은 공 {black}번',
        [f'모두 흰 공이었다면 {total}×7＝{total*7}번 칸에 있게 됩니다.',f'흰 공 한 번이 검은 공 한 번으로 바뀔 때마다 위치는 7＋3＝10칸 줄어듭니다.',f'검은 공은 ({total*7}−{end})÷10＝{black}번이고, 흰 공은 {total}−{black}＝{w}번입니다. 7×{w}−3×{black}＝{end}로 확인할 수 있습니다.'],[w,black],focus='모두 한 종류라고 가정한 값과 실제 값의 차 이용하기',model='all forward then replace with backward')

for rate,start in [(4,510),(6,540),(8,600),(10,600),(4,630),(6,660),(8,540),(10,510),(12,570)]:
    observed=900; elapsed=observed-start; lag=rate*elapsed//60; assert rate*elapsed%60==0
    display=observed-lag
    add(12,{'rate':rate,'observed':observed,'display':display},f'실제 시간으로 1시간에 {rate}분씩 늦어지는 시계가 있습니다. 어느 날 오전에 이 시계를 정확하게 맞추었는데, 그날 오후 3시에 시계는 {clock(display%720)}을 가리켰습니다. 오전 몇 시 몇 분에 시계를 맞추었습니까?',f'오전 {clock(start)}',
        [f'오후 3시와 시계가 가리킨 시각의 차는 {lag}분입니다.',f'{rate}분 늦어지는 데 실제 1시간이 걸리므로 {lag}분 늦어지는 데 {lag}÷{rate}시간, 곧 {elapsed}분이 걸렸습니다.',f'오후 3시에서 {elapsed}분을 거슬러 올라가면 오전 {clock(start)}입니다.'],[start//60,start%60],focus='시계가 가리킨 경과 시간과 실제 경과 시간을 구분하기',model='clock lag divided by loss rate')

digitsets=list(it.combinations(range(2,10),6))
for digits in digitsets[4:13]:
    products=[]
    for p in it.permutations(digits):
        A=100*p[0]+10*p[1]+p[2]; B=100*p[3]+10*p[4]+p[5]
        products.append((A*B,A,B))
    low=min(products); high=max(products); ans=high[0]-low[0]
    add(13,{'digits':list(digits)},'아래 수 카드 6장을 모두 한 번씩만 사용하여 (세 자리 수)×(세 자리 수)를 만듭니다. 곱이 가장 클 때와 가장 작을 때의 차를 구하시오.',str(ans),
        [f'가장 큰 곱을 만들 때는 큰 카드 두 장인 {digits[-1]}, {digits[-2]}를 백의 자리에 놓습니다. 남은 카드 중 큰 두 장은 십의 자리, 작은 두 장은 일의 자리에 놓습니다.',
         '각 자리의 카드 쌍을 정한 뒤에는 두 인수의 합이 같습니다. 합이 같을 때 두 수의 차가 작을수록 곱이 크므로, 백의 자리 숫자가 작은 쪽에 더 큰 십의 자리 숫자와 더 큰 일의 자리 숫자를 줍니다.',
         f'이렇게 얻은 가장 큰 곱은 {high[1]}×{high[2]}＝{high[0]}입니다.',
         f'가장 작은 곱은 작은 두 카드 {digits[0]}, {digits[1]}를 백의 자리에 놓고, 남은 카드 중 작은 두 장을 십의 자리에 놓습니다. 이때 두 수의 차가 커지도록 작은 백의 자리 쪽에 더 작은 십의 자리와 일의 자리 숫자를 놓으면 {low[1]}×{low[2]}＝{low[0]}입니다.',
         f'따라서 두 곱의 차는 {high[0]}−{low[0]}＝{ans}입니다.'],[ans],cards=digits,focus='각 자리의 무게와 두 인수 사이의 배치를 함께 비교하기',model='all 720 digit permutations')

for A in [325,350,375,400,425,475,500,525,550]:
    B=3*A+50; C=3*B+50; total=A+B+C
    add(14,{'total':total,'ratio':3,'extra':50},f'설탕 {total//1000}kg {total%1000}g을 가, 나, 다 세 봉지에 나누어 담습니다. 나 봉지에는 가 봉지의 3배보다 50g 많게, 다 봉지에는 나 봉지의 3배보다 50g 많게 담았습니다. 다 봉지의 설탕은 몇 g입니까?',f'{C}g',
        [f'가 봉지의 양을 □g이라고 하면 나 봉지는 (□×3＋50)g, 다 봉지는 (□×9＋200)g입니다.',f'세 봉지의 합은 (□×13＋250)g이므로 가 봉지에는 ({total}−250)÷13＝{A}g이 들어 있습니다.',f'나 봉지는 {A}×3＋50＝{B}g, 다 봉지는 {B}×3＋50＝{C}g입니다. 세 양의 합도 {total}g입니다.'],[C],focus='뒤 봉지의 관계를 앞 봉지 하나의 양으로 나타내기',model='nested affine expressions')

seq=[(j,2*k+3-j) for k in range(1,6) for j in range(1,k+2)][:17]
givenfrac=', '.join(frac(a,b) for a,b in seq)+' …'
chosen=[]
for N in range(105,190):
    if N==111: continue
    k=1
    while (k+1)*(k+2)//2-1<N:k+=1
    before=k*(k+1)//2-1; j=N-before; den=2*k+3-j
    if math.gcd(j,den)==1:chosen.append((N,k,before,j,den))
for N,k,before,j,den in chosen[::max(1,len(chosen)//9)][:9]:
    add(15,{'index':N},f'다음은 일정한 규칙에 따라 분수를 나열한 것입니다. {N}번째 분수를 구하시오.',frac(j,den),
        ['분자가 1부터 시작하는 묶음으로 나누면 각 묶음의 분수 개수는 2, 3, 4, …입니다.',f'{k-1}번째 묶음까지 2＋3＋…＋{k}＝{before}개이므로 {N}번째는 {k}번째 묶음의 {j}번째입니다.',f'이 묶음의 첫 분모는 {2*k+2}이고 뒤로 갈수록 1씩 작아집니다. 따라서 분자는 {j}, 분모는 {2*k+2}−({j}−1)＝{den}으로 {frac(j,den)}입니다.'],[j,den],given=[givenfrac],focus='묶음의 누적 개수와 묶음 안 위치를 나누어 찾기',model='triangular cumulative group sizes')

for elapsed,finish in [(50,495),(52,507),(54,519),(56,531),(58,543),(62,555),(64,567),(66,579),(68,591)]:
    angle=Fraction(11*elapsed,2); start=finish-elapsed
    add(16,{'angle':float(angle),'finish':finish},f'숙제를 하는 동안 시계의 긴바늘은 짧은바늘보다 {float(angle):g}° 더 많이 움직였습니다. 숙제를 끝낸 시각이 오전 {clock(finish)}이라면, 숙제를 시작한 시각은 오전 몇 시 몇 분입니까?',f'오전 {clock(start)}',
        ['1분 동안 긴바늘은 6°, 짧은바늘은 0.5° 움직입니다. 두 바늘이 움직인 각도의 차는 1분마다 5.5°씩 늘어납니다.',f'숙제한 시간은 {float(angle):g}÷5.5＝{elapsed}분입니다.',f'오전 {clock(finish)}에서 {elapsed}분 전은 오전 {clock(start)}입니다. 실제 움직인 각도 차도 {6*elapsed}−{elapsed/2:g}＝{float(angle):g}°입니다.'],[start//60,start%60],focus='끝날 때 바늘 사이 각도와 움직인 총각도의 차를 구분하기',model='difference in accumulated angular motion')

for j,top in enumerate(range(19,37,2)):
    nums=list(range(top,top-14,-2)); sums={nums[0]+sum(s*n for s,n in zip(signs,nums[1:])) for signs in it.product([-1,1],repeat=6)}
    candidates=[0,5,10,15,20,50,51,52,53,54,57,71,73,77,81]
    choices=sorted({n+2*j for n in candidates}); yes=[n for n in choices if n in sums]; ans=len(yes)
    examples={t:next(signs for signs in it.product([-1,1],repeat=6) if nums[0]+sum(s*n for s,n in zip(signs,nums[1:]))==t) for t in yes}
    step=['□에 ＋ 또는 −를 넣는 것은 첫 수 뒤 여섯 수 중 일부를 빼는 것과 같습니다. 모두 더한 값에서 빼기로 바꾼 수의 합의 두 배를 뺍니다.',f'모두 더한 값은 {sum(nums)}입니다. 보기의 수를 만들려면 ({sum(nums)}−보기의 수)÷2가 뒤 여섯 수의 일부의 합이어야 합니다.']
    for target,signs in examples.items():
        expression=str(nums[0])+''.join(('＋' if s==1 else '−')+str(n) for s,n in zip(signs,nums[1:]))
        step.append(expression+f'＝{target}입니다.')
    step.append(f'나머지 보기의 수는 위 부분합 조건에 맞지 않습니다. 가능한 수는 '+', '.join(map(str,yes))+f'의 {ans}가지입니다.')
    add(18,{'nums':nums,'choices':choices},'다음 식의 □에 ＋ 또는 −를 넣어 만들 수 있는 수를 보기에서 찾아, 그 수가 몇 가지인지 구하시오.',f'{ans}가지',step,[ans],given=[' □ '.join(map(str,nums)),'보기: '+', '.join(map(str,choices))],focus='부호를 바꾸면 전체 합에서 두 배가 줄어드는 관계와 부분합 확인',model='all 64 sign assignments')

for U,bread,both,other in [(520,116,24,12),(535,122,27,13),(550,128,30,16),(565,134,33,18),(580,140,36,11),(595,146,39,15),(610,152,42,17),(625,158,45,19),(640,164,48,21)]:
    none=U//5; rice=U+both-bread; total=U+none+other
    add(20,{'total':total,'bread':bread,'rice':rice,'other':other,'noneRatio':[1,5]},f'어린이 {total}명에게 아침 식사를 조사하였습니다. 빵을 먹은 어린이는 {bread}명, 밥을 먹은 어린이는 {rice}명이었습니다. 아무것도 먹지 않은 어린이는 밥이나 빵을 먹은 어린이 수의 {frac(1,5)}이었고, 다른 음식만 먹은 어린이는 {other}명이었습니다. 밥과 빵을 모두 먹은 어린이는 몇 명입니까?',f'{both}명',
        [f'다른 음식만 먹은 {other}명을 제외하면 {total-other}명입니다. 밥이나 빵을 먹은 사람을 5묶음으로 보면 아무것도 먹지 않은 사람은 1묶음이므로 모두 6묶음입니다.',f'한 묶음은 ({total}−{other})÷6＝{none}명이고, 밥이나 빵을 먹은 어린이는 {none}×5＝{U}명입니다.',f'밥을 먹은 수와 빵을 먹은 수를 더하면 둘 다 먹은 사람을 두 번 세므로 {bread}＋{rice}−{U}＝{both}명입니다.'],[both],focus='전체의 분할과 두 집합의 겹침을 차례로 계산하기',model='partition then inclusion exclusion')

for a,b,c in [(1,4,3),(2,3,3),(2,4,2),(2,5,1),(3,2,3),(3,3,2),(3,1,4),(4,2,2),(4,3,1)]:
    prod=3**a*4**b*5**c
    add(22,{'rolls':8,'product':prod},f'한 정육면체 주사위의 여섯 면에는 3, 3, 4, 4, 5, 5가 하나씩 적혀 있습니다. 두 사람이 이 주사위를 각각 4번씩 던졌더니, 나온 여덟 수의 곱이 {prod}였습니다. 4가 나온 것은 모두 몇 번입니까?',f'{b}번',
        [f'{prod}를 2, 3, 5로 나누어 소인수를 세면 2가 {2*b}개, 3이 {a}개, 5가 {c}개입니다.',f'3이나 5에서는 2가 나오지 않고, 4 하나는 2×2입니다. 따라서 4가 나온 횟수는 {2*b}÷2＝{b}번입니다.',f'3은 {a}번, 5는 {c}번이므로 전체 횟수도 {a}＋{b}＋{c}＝8번으로 조건과 같습니다.'],[b],focus='눈의 곱에 들어 있는 소인수와 전체 시행 횟수 확인하기',model='factor exponents of 2')

for N in range(1001,2602,200):
    digits=str(int('2'*N)*398); ans=sum(map(int,digits)); assert len(digits)==N+2
    assert digits=='88'+'4'*(N-3)+'356'
    add(23,{'twos':N,'multiplier':398},f'2가 {N}개 이어진 수 222…222에 398을 곱하였습니다. 얻은 수의 모든 자리 숫자의 합을 구하시오.',str(ans),
        ['398＝400−2이므로 주어진 수에 400을 곱한 값에서 2를 곱한 값을 빼어 자리의 규칙을 찾습니다.',f'계산 결과는 앞에 88, 가운데에 4가 {N-3}개, 끝에 356이 이어진 수입니다. 예를 들어 22222×398＝8844356에서도 같은 앞뒤 모양을 확인할 수 있습니다.',f'따라서 모든 자리 숫자의 합은 8＋8＋4×{N-3}＋3＋5＋6＝{ans}입니다.'],[ans],focus='반복되는 가운데 자리와 양 끝의 받아내림을 분리하기',model='integer multiplication and digit tally')

traincases=[]
for j,v1 in enumerate(range(39,48)):
    t1=23; len1=104+3*j; L=v1*t1-len1
    poss=[(v2,t2,v2*t2-L) for v2 in range(29,39) for t2 in range(27,36) if 90<=v2*t2-L<=145]
    v2,t2,len2=poss[(j*3)%len(poss)]; traincases.append((v1,t1,len1,v2,t2,len2,L))
for v1,t1,len1,v2,t2,len2,L in traincases:
    add(24,{'firstLength':len1,'firstSpeed':v1,'firstTime':t1,'secondLength':len2,'secondSpeed':v2},f'길이 {len1}m인 열차가 초속 {v1}m로 터널에 진입하여 완전히 빠져나올 때까지 {t1}초가 걸렸습니다. 길이 {len2}m인 다른 열차가 초속 {v2}m로 같은 터널에 진입하여 완전히 빠져나올 때까지는 몇 초가 걸립니까?',f'{t2}초',
        [f'첫 열차의 맨 앞이 입구에 닿을 때부터 맨 뒤가 출구를 벗어날 때까지 이동한 거리는 터널 길이에 열차 길이를 더한 값입니다.',f'첫 열차의 이동 거리는 {v1}×{t1}＝{v1*t1}m이므로 터널 길이는 {v1*t1}−{len1}＝{L}m입니다.',f'둘째 열차는 {L}＋{len2}＝{L+len2}m를 이동해야 합니다. 걸리는 시간은 {L+len2}÷{v2}＝{t2}초입니다.'],[t2],focus='완전히 통과할 때는 터널 길이와 열차 길이를 더하기',model='first travelled distance minus length')

rotate={'0':'0','1':'1','2':'2','5':'5','6':'9','8':'8','9':'6'}
for diff in [6930,5940,9999,4950,3960,1980,39996,59994,69993]:
    solutions=[]
    for p in it.permutations(rotate,5):
        if p[0]=='0' or p[-1]=='0':continue
        N=int(''.join(p)); R=int(''.join(rotate[d] for d in p[::-1]))
        if R-N==diff:solutions.append(N)
    solutions.sort(); assert len(solutions)==6
    steps=['카드를 반 바퀴 돌리면 자리 순서가 거꾸로 되고 6과 9는 서로 바뀝니다. 0, 1, 2, 5, 8은 그대로 읽힙니다. 양쪽 모두 다섯 자리여야 하므로 처음과 끝에는 0을 놓을 수 없습니다.',
           f'각 자리에 놓을 수 있는 서로 다른 카드들을 확인하며 두 수의 차가 {diff}인 경우를 찾습니다.']
    for N in solutions:
        R=int(''.join(rotate[d] for d in str(N)[::-1]));steps.append(f'{N}은 돌리면 {R}이고, {max(N,R)}−{min(N,R)}＝{diff}입니다.')
    steps.append('가능한 첫 수부터 끝 수까지 서로 다른 카드 조건으로 확인하면 위 여섯 수가 전부입니다.')
    add(25,{'difference':diff,'digits':[0,1,2,5,6,8,9]},f'그림의 숫자 카드 7장 중 서로 다른 5장을 골라 다섯 자리 수를 만들었습니다. 이 수를 반 바퀴 돌려 읽어도 다섯 자리 수가 되며, 돌려 읽은 수는 처음 수보다 {diff}만큼 큽니다. 처음에 만든 수를 모두 구하시오.',', '.join(map(str,solutions)),steps,solutions,contract='unordered-set',focus='자리의 역순과 6·9의 변화를 동시에 적용하기',model='all ordered 5-card selections')

for r,c,n in [(9,7,11),(10,6,13),(11,8,14),(12,9,15),(13,10,16),(14,11,17),(15,12,18),(12,7,14),(13,9,17)]:
    first=r*r-c+1; second=n*n-4; total=first+second
    add(26,{'r':r,'c':c,'targetCol':5,'sum':total},f'그림과 같이 일정한 규칙에 따라 수를 배열하였습니다. [{r}, {c}]는 {r}행 {c}열의 수를 뜻합니다. [{r}, {c}]＋[n, 5]＝{total}일 때 n을 구하시오.',str(n),
        ['각 행의 첫 수는 1, 4, 9, 16, …의 제곱수이고, 대각선 칸까지 오른쪽으로 한 칸 갈 때마다 1씩 작아집니다.',f'[{r}, {c}]＝{r}×{r}−({c}−1)＝{first}이므로 [n, 5]＝{total}−{first}＝{second}입니다.',f'1~4행의 5열 수는 17, 18, 19, 20이므로 해당하지 않습니다. n이 5 이상이면 [n, 5]＝n×n−4입니다. 따라서 n×n＝{second+4}이고 n＝{n}입니다.'],[n],focus='대각선 전후의 규칙을 구분하고 행 번호를 역산하기',model='row-square branch of grid rule')

for n in [9,11,12,13,14,15,16,17,18]:
    front=n*(n+3); depth=(n*n+5*n+2)//2; E=2*front+depth
    add(27,{'layers':n},f'그림처럼 모양과 크기가 같은 정육면체 상자들을 한 줄 두께의 계단 모양으로 성냥개비를 이용해 만듭니다. {n}층까지 나타내는 데 필요한 성냥개비는 모두 몇 개입니까? 보이지 않는 부분에도 성냥개비가 놓여 있습니다.',f'{E}개',
        [f'앞면에서 가로선과 세로선을 세면 각각 {n}×({n}＋3)÷2개이므로 앞면 전체는 {front}개입니다. 뒷면도 같아 앞뒤를 합하면 {2*front}개입니다.',f'깊이 방향 성냥개비는 앞면의 각 꼭짓점에서 하나씩 이어집니다. 앞면 꼭짓점은 맨 아래 {n+1}개와 그 위 {n+1}, {n}, …, 2개를 합해 {depth}개입니다.',f'같은 모서리를 한 번씩만 센 전체 개수는 {2*front}＋{depth}＝{E}개입니다.'],[E],focus='공유 모서리와 보이지 않는 깊이 방향 모서리까지 구분하기',model='front back planar edges plus vertex connectors')

for ds in [(0,1,3,5),(0,1,4,7),(0,2,3,8),(0,2,5,9),(0,3,4,6),(0,3,5,8),(0,4,5,7),(0,4,6,9),(0,5,7,8)]:
    s=sum(ds); ans=s*(1600+120+12)
    add(29,{'digits':list(ds)},'아래 수 카드를 사용하여 세 자리 수를 만듭니다. 같은 수를 여러 번 사용해도 될 때, 만들 수 있는 모든 세 자리 수의 합을 구하시오.',str(ans),
        ['백의 자리는 0을 제외한 세 수 중에서 고르고, 십의 자리와 일의 자리는 각각 네 수 중에서 고르므로 서로 다른 세 자리 수는 3×4×4＝48개입니다.',f'백의 자리의 각 수는 16번씩 나타나 그 합은 {s}×16×100＝{s*1600}입니다. 십의 자리의 각 수는 12번씩 나타나 그 합은 {s}×12×10＝{s*120}입니다.',f'일의 자리의 각 수도 12번씩 나타나 그 합은 {s}×12＝{s*12}입니다. 모두 더하면 {s*1600}＋{s*120}＋{s*12}＝{ans}입니다.'],[ans],cards=ds,focus='0의 백의 자리 제한과 각 자리의 반복 횟수 구분하기',model='place value frequency sum')

for j in range(9):
    first=46+2*j; sleep=96+3*j; last=22+j; lag=9+j; turtle=750+3*j
    start=turtle+lag-first-sleep-last
    offset=[first-4,first+sleep//2,first+sleep+last//2][j%3]
    query=start+offset; activity='달리고 있음' if offset<first or offset>=first+sleep else '잠을 자고 있음'
    add(30,{'first':first,'sleep':sleep,'last':last,'lag':lag,'turtleFinish':turtle,'query':query},f'토끼와 거북이가 같은 지점에서 동시에 출발했습니다. 토끼는 {first}분 달린 뒤 {sleep//60}시간 {sleep%60}분 동안 잠을 자고, 깨어나 {last}분 더 달려 결승점에 도착했습니다. 거북이는 쉬지 않고 걸어 낮 {clock(turtle)}에 도착했으며, 이는 토끼보다 {lag}분 먼저였습니다. 출발 시각을 구하고 오전 {clock(query)}에 토끼가 무엇을 하고 있었는지 쓰시오.',f'오전 {clock(start)}, {activity}',
        [f'토끼의 전체 시간은 {first}＋{sleep}＋{last}＝{first+sleep+last}분입니다. 토끼의 도착 시각은 거북이보다 {lag}분 뒤인 {clock(turtle+lag)}입니다.',f'도착 시각에서 {first+sleep+last}분을 거슬러 올라가면 출발은 오전 {clock(start)}입니다.',f'토끼는 {clock(start)}부터 {clock(start+first)}까지 달리고, {clock(start+first)}부터 {clock(start+first+sleep)}까지 잠을 잔 뒤, {clock(start+first+sleep)}부터 {clock(turtle+lag)}까지 다시 달립니다. 따라서 {clock(query)}에는 {activity.replace("있음","있습니다")}.'],[start//60,start%60,activity],focus='먼저 도착한 사람과 쉬는 구간을 시간선에 정확히 놓기',model='backward duration and interval membership')

assert len(items)==216, len(items)
assert all(sum(x['sourceNo']==no for x in items)==9 for no in TYPES)
assert len({(x['text'],json.dumps(x.get('promptDataLines')),json.dumps(x.get('cards'))) for x in items})==len(items)
data={'version':'20261024-applied1-expansion-r2','sourceSet':'applied','sourceRound':1,
      'policy':{'targetVariantsPerSource':9,'runtimeGeneration':False,'defaultDiagnosticVariants':3,
                'difficulty':'활용은 원문 배점대만 사용: 2.7 하 / 3.4 중 / 4.2 상','sourceGradeMutation':False},
      'availableSourceNos':sorted(TYPES),'pendingSourceNos':[7,8,17,19,21,28],
      'pendingReasons':{'7':'고정 그림에서 9개 서로 다른 문항을 만들려면 새 그림 승인 필요',
                        '8':'77×ㄱㄴ＝ㄴㄱㄱㄴ 구조의 두 자리 승수는 유일하여 9개 수치 변형 불가',
                        '17':'배 뒤집기 고정 그림의 구조 변형 승인 필요','19':'전개도·보기의 구조 변형 승인 필요',
                        '21':'격자 그림의 구조 변형 승인 필요',
                        '28':'원문 2년8개월과 해설 20개월 계산 충돌: 32개월이면16년, 저장답10년. 원문 성적 불변'},
      'items':items}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'Authored {len(items)} items in {len(TYPES)} source types; output review pending; original grades unchanged')

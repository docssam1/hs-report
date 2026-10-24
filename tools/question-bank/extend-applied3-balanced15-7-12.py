"""Append reviewed-source groups 7–12 without rebuilding the released first90."""
import calendar,collections,copy,hashlib,json,math,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied3-balanced15.json';base='9b78f99ad5515a01308731fa022bb8e0d8d91101'
before=FILE.read_bytes();assert before==subprocess.check_output(['git','show',base+':bank/data/applied3-balanced15.json'],cwd=ROOT)
data=json.loads(before);assert len(data['items'])==90 and all(x['reviewStatus']=='verified'for x in data['items']);prior=copy.deepcopy(data['items']);items=data['items']
old=json.loads((ROOT/'bank/data/applied3-expanded.json').read_text())['items'];version='20261024-applied3-balanced15-r2'
for no in [8,9,10,11]:
 for src in [x for x in old if x['sourceNo']==no][:5]:
  x=copy.deepcopy(src);assert x['pointBand']=='2.7';x.update(practiceLevel='low',sourcePointBand='2.7',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)
meta={7:('도형','주사위와 굴리기','윗면 추적과 왕복 주기'),8:('수와 식','달력과 주기','요일 위치와 기간별 횟수'),9:('도형','둘레와 간격','닫힌 둘레의 간격과 두 종류 나무'),10:('수와 식','배수와 나머지','여러 나머지 조건의 공통 수'),11:('수와 식','수의 삼각 배열','행의 경계와 합의 역추론'),12:('도형','접기와 자르기','겹친 칸의 원래 위치와 수량')}
roles={7:dict(low='경로 중 한 칸의 윗면만 추적',middle='끝 칸에서 같은 길을 일부 되돌아가며 누적합과 마지막 아랫면 결합',high='왕복 열 번의 방향 복원과 윗면 합의 주기를 찾아 큰 이동 횟수 분해'),8:dict(middle='두 달의 특정 번째 요일 날짜를 구하고 양 끝 포함 기간 계산',high='두 요일 반복 수업에서 한 달 전체와 하루 휴강을 중복 없이 제외'),9:dict(middle='전체 수와 두 종류 차에서 각 개수를 역산하고 닫힌 둘레 계산',high='두 호수의 전체 나무 수와 둘레 차를 결합해 두 둘레 동시 역산'),10:dict(middle='서로 다른 나머지 조건의 공통 수를 찾고 범위 안 합 계산',high='세 나머지와 상한을 모두 사용하여 유일한 자연수 결정'),11:dict(middle='한 행 처음·끝 합으로 행을 역산하고 지정 위치 찾기',high='이웃한 두 행 전체 합으로 행 경계를 역산하고 다음 행의 위치 결정'),12:dict(low='같이 잘린 원래 네 칸을 찾고 남은 수량 분류',middle='원본1·2를 칸 종류의 표지로 사용하여 남은 점수에서 한 종류 점수 역산',high='남은 칸 전체와 추가 한 칸 제거 뒤 두 점수 차로 두 종류 점수 동시 역산')}
assets={7:dict(kind='raster',src='assets/applied3/dice-path-original.png',description='원문7번의주사위·화살표·(1)~(5)경로.원래그림그대로,주변다른문항글자만제외.'),8:copy.deepcopy(next(x for x in old if x['sourceNo']==8)['asset']),11:copy.deepcopy(next(x for x in old if x['sourceNo']==11)['asset']),12:dict(kind='raster',src='assets/applied3/fold-original.png',description='원문12번의4×4숫자색종이·아래반을위로/왼쪽반을오른쪽으로접는화살표·오른쪽위절단.실제PDF배치그대로.')}
def add(no,level,p,text,answers,labels,steps,point,method,**extra):
 v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items);area,sub,detail=meta[no]
 axes=dict(prerequisite='원문의 주사위 마주보는 면·달력 주기·닫힌 둘레·나머지·행 배열·접은 종이 겹침',reasoning=roles[no][level],conditionTracking='출발/왕복/날짜 범위/두 대상/행 경계/펼친 뒤 상태를 구분',caseSplitting='같은 칸·기간·간격·후보를 중복 계산하지 않고 순서 있는 답을 분리',computation='수치 확대만 하지 않고 역추론과 복수 조건 결합을 추가',representation='원본그림보존;새경로·월별일수힌트·풀이보조선은문제에추가하지않음',reading='필수조건은자연스러운지문안에만제시',visualCues='문제아래조건요약·힌트·완성된풀이그림없음',shortcuts='왕복의방향복원·양끝포함·폐곡선의간격수·동시나머지·행의길이·숫자표지와점수구분')
 x=dict(id=f'applied3-q{no:02d}-{level}-v{v}',genId=f'applied3-q{no:02d}',sourceSet='applied',sourceRound=3,sourceNo=no,variantNo=v,area=area,subarea=sub,detailType=detail,learningLocation=f'활용 3회 · 원문 {no}번 · {detail}',learningPoint=point,practiceLevel=level,sourcePointBand='2.7',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answers)),answerParts=answers,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answers))],solutionSteps=steps,solution=' '.join(steps),difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',measured=False,axes=axes),verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied3-balanced15-independent-validate.py',sourceExamPage=2 if no<=10 else 3,sourceAnswerPage=2 if no<=10 else 3,studentDifficultyMeasured=False))
 if no in assets:x['asset']=copy.deepcopy(assets[no])
 x.update(extra);assert len(steps)>=3;items.append(x)

#7: same original path E,E,S,W,W, and exact reversal E,E,N,W,W.
# Orientation tuple is top,bottom,north,south,east,west; all initial faces read from original.
def roll(s,d):
 t,b,n,f,e,w=s
 return dict(E=(w,e,n,f,t,b),W=(e,w,n,f,b,t),S=(n,f,b,t,e,w),N=(f,n,t,b,e,w))[d]
start=(2,5,4,3,1,6);route='EESWWEENWW';s=start;tops=[]
for d in route:s=roll(s,d);tops.append(s[0])
assert s==start and tops==[6,5,4,6,3,6,4,5,6,2]
for n in range(1,6):
 add(7,'low',dict(stop=n),f'주사위에서 마주 보는 두 면의 눈의 수의 합은7입니다. 그림의 처음 위치에서 화살표를 따라({n})칸까지 굴렸을 때,그 칸에서 윗면에 있는 눈의 수는 얼마입니까?',
 [tops[n-1]],['윗면의 눈'],['처음 윗면은2,앞면은3,오른쪽 면은1입니다. 따라서 아랫면은5,뒷면은4,왼쪽 면은6입니다.',f'화살표 방향으로 한 칸씩 굴리면(1)부터({n})까지의 윗면은'+', '.join(map(str,tops[:n]))+'입니다.',f'따라서({n})칸의 윗면은{tops[n-1]}입니다. 굴릴 때 이동 방향 반대쪽 옆면이 위로 올라옵니다.'],
 '굴리는 방향에 맞춰 위로 올라오는 옆면을 추적하기','oriented die face permutation')
for k in range(1,6):
 seq=tops[:5+k];end=seq[-1];total=sum(seq)
 add(7,'middle',dict(returnSteps=k),f'마주 보는 두 면의 눈의 수의 합이7인 주사위를 그림의 처음 위치에서(5)칸까지 화살표를 따라 굴립니다. 이어서 방금 지나온 길을 거꾸로{k}칸 되돌아갑니다. 처음 이동할 때부터 되돌아간 마지막 칸까지 매번 굴린 직후 윗면의 눈을 모두 더한 값과,마지막 아랫면의 눈을 차례로 구하시오. 출발 전 윗면은 합에 넣지 않습니다.',
 [total,7-end],['윗면의 합','마지막 아랫면'],['처음 위·아래·앞·뒤·오른쪽·왼쪽은2·5·3·4·1·6입니다. 처음 다섯 이동의 윗면은6,5,4,6,3이고 합은24입니다.',f'같은 길을 반대로{k}칸 되돌아갈 때의 윗면은'+', '.join(map(str,tops[5:5+k]))+'입니다. 앞서 방문한 칸도 다시 굴려 도착했으므로 새로 셉니다.',f'윗면 합은24＋{sum(tops[5:5+k])}＝{total}입니다.',f'마지막 윗면은{end}이므로 마주 보는 아랫면은7−{end}＝{7-end}입니다.'],
 '되돌아오는 방향과 각 이동 직후의 면을 구분하고 합·아랫면을 함께 계산하기','outbound and partial reverse orientation trace')
for steps in [85,103,127,146,169]:
 cycles,r=divmod(steps,10);total=cycles*sum(tops)+sum(tops[:r]);end=tops[r-1]if r else 2
 add(7,'high',dict(rolls=steps),f'주사위에서 마주 보는 두 면의 눈의 수의 합은7입니다. 그림의 처음 위치에서 화살표를 따라(5)칸까지 갔다가,같은 길을 거꾸로 돌아 처음 위치까지 오는 왕복을 계속 반복합니다. 한 칸 굴릴 때마다 이동을 한 번으로 셉니다. 모두{steps}번 이동했을 때,매번 굴린 직후 윗면의 눈을 더한 값과 마지막 윗면의 눈을 차례로 구하시오. 출발 전 윗면은 합에 넣지 않습니다.',
 [total,end],['모든 윗면의 합','마지막 윗면'],['가는 다섯 번의 윗면은6,5,4,6,3이고 돌아오는 다섯 번은6,4,5,6,2입니다. 합은24＋23＝47입니다. 돌아올 때 같은 길의 굴리기를 역순으로 되돌리므로 처음 면의 방향까지 복원됩니다.',f'한 왕복은10번 이동입니다. {steps}＝10×{cycles}＋{r}이므로 완전한 왕복{cycles}번 뒤 다음 왕복의{r}번 이동을 더합니다.',f'남은 이동의 윗면은'+(', '.join(map(str,tops[:r]))if r else'없음')+f'이고 그 합은{sum(tops[:r])}입니다. 전체 합은47×{cycles}＋{sum(tops[:r])}＝{total}입니다.',f'마지막 윗면은 다음 왕복의{r}번째 값인{end}입니다.'if r else'왕복이 정확히 끝나므로 마지막 윗면은 처음과 같은2입니다.'],
 '왕복 뒤 면의 방향까지 복원되는 주기를 확인하고 이동 횟수의 몫·나머지 적용하기','ten-roll inverse-path cycle and prefix sum')

#8: fixed June calendar; no fabricated year or month-length hints in question.
week=['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];month_days=[31,28,31,30,31,30,31,31,30,31,30,31]
def offset(m,d):return sum(month_days[5:m-1])+d-1
def weekday(m,d):return(5+offset(m,d))%7
def nth(m,w,n):return 1+(w-weekday(m,1))%7+7*(n-1)
for m1,w1,n1,m2,w2,n2 in [(7,0,2,9,4,3),(8,2,3,11,1,2),(9,6,1,12,5,4),(7,3,4,10,0,3),(8,4,2,12,2,1)]:
 d1=nth(m1,w1,n1);d2=nth(m2,w2,n2);elapsed=offset(m2,d2)-offset(m1,d1)+1;days_to_m1=offset(m1,1);days_to_m2=offset(m2,1)
 add(8,'middle',dict(startMonth=m1,startWeekday=w1,startOccurrence=n1,endMonth=m2,endWeekday=w2,endOccurrence=n2),f'그림은 어느 해6월의 달력입니다. 같은 해{m1}월의{n1}번째 {week[w1]}부터{m2}월의{n2}번째 {week[w2]}까지 양 끝 날짜를 모두 포함하면 며칠입니까?',
 [elapsed],['날짜 수'],[f'6월1일은토요일입니다. {m1}월1일까지{days_to_m1}일,{m2}월1일까지{days_to_m2}일이 지나므로 각각{week[weekday(m1,1)]},{week[weekday(m2,1)]}입니다.',f'{m1}월의첫{week[w1]}은{nth(m1,w1,1)}일이므로{n1}번째는{d1}일입니다. {m2}월의첫{week[w2]}은{nth(m2,w2,1)}일이므로{n2}번째는{d2}일입니다.',f'6월1일부터의경과일은각각{offset(m1,d1)}일과{offset(m2,d2)}일입니다. 양끝을포함하면{offset(m2,d2)}−{offset(m1,d1)}＋1＝{elapsed}일입니다.'],
 '달마다 첫 요일과 지정 번째 날짜를 찾고 양 끝 포함 기간 계산하기','month-length offsets and ordinal weekday dates')
for cancel_month,pair in [(7,[2,5]),(8,[1,4]),(9,[0,3]),(10,[2,6]),(11,[1,5])]:
 cancel_day=next((m,d)for m in range(6,13)if m!=cancel_month for d in range(1,month_days[m-1]+1)if weekday(m,d)in pair)
 all_count=sum(weekday(m,d)in pair for m in range(6,13)for d in range(1,month_days[m-1]+1));month_count=sum(weekday(cancel_month,d)in pair for d in range(1,month_days[cancel_month-1]+1));answer=all_count-month_count-1
 table=[[str(m)+'월',str(sum(weekday(m,d)in pair for d in range(1,month_days[m-1]+1)))]for m in range(6,13)]
 add(8,'high',dict(weekdays=pair,closedMonth=cancel_month,extraClosedDate=list(cancel_day)),f'그림은 어느 해6월의 달력입니다. 같은 해6월1일부터12월31일까지 매주 {week[pair[0]]}과 {week[pair[1]]}에 한 번씩 수업합니다. 다만{cancel_month}월에는 한 번도 수업하지 않고,{cancel_day[0]}월{cancel_day[1]}일에도 쉽니다. 실제 수업은 모두 몇 번 합니까?',
 [answer],['수업 횟수'],['6월1일은토요일입니다. 각 달의길이를7로나눈나머지만큼다음달의첫요일을옮겨매달해당두요일의날짜를셉니다.',f'답안표의두요일수를합하면{all_count}번입니다. 그중{cancel_month}월의{month_count}번은모두휴강입니다.',f'별도휴강인{cancel_day[0]}월{cancel_day[1]}일은{week[weekday(*cancel_day)]}로원래수업하는날이며{cancel_month}월에속하지않습니다. 따라서따로한번뺍니다.',f'실제수업은{all_count}−{month_count}−1＝{answer}번입니다.'],
 '여러 달의 반복 요일을 세고 겹치지 않는 휴강 조건을 제외하기','weekday residue counts with disjoint closures',solutionTable=dict(headers=['월','두 요일의 수업 예정 횟수'],rows=table))

#9: inverse closed-loop counts and two simultaneous lakes.
for a,d,k in [(24,3,2),(28,4,3),(32,5,2),(35,2,4),(40,3,3)]:
 b=a*k;total=a+b;diff=b-a
 add(9,'middle',dict(totalTrees=total,cherryMinusMagnolia=diff,spacing=d),f'원 모양 호수 둘레에 목련나무를{d}m 간격으로 심고,이웃한 목련나무 사이마다 같은 수의 벚나무를 심었습니다. 두 종류의 나무는 모두{total}그루이고 벚나무가 목련나무보다{diff}그루 많습니다. 호수의 둘레는 몇m입니까?',
 [a*d],['호수의 둘레'],[f'전체{total}그루에서두종류의차{diff}그루를빼면목련나무수의두배입니다. 목련나무는({total}−{diff})÷2＝{a}그루입니다.',f'닫힌호수에서는처음과끝이만나므로목련나무수와간격수가같아{a}구간입니다.',f'간격이{d}m이므로둘레는{a}×{d}＝{a*d}m입니다. 벚나무는{b}그루로간격마다{b//a}그루씩심은조건과도맞습니다.'],
 '두 종류의 합·차로 목련 수를 구하고 닫힌 길의 간격 수로 둘레 환산하기','sum-difference inverse and closed interval count')
for a,b,d1,d2,k1,k2 in [(20,24,3,4,2,1),(24,30,4,5,1,2),(28,32,3,4,3,2),(30,36,2,3,2,3),(32,40,4,5,2,1)]:
 p1=a*d1;p2=b*d2;total=(k1+1)*a+(k2+1)*b;diff=p2-p1
 add(9,'high',dict(totalTrees=total,perimeterDifference=diff,spacingA=d1,spacingB=d2,betweenA=k1,betweenB=k2),f'원 모양 호수 가와 나의 둘레에 목련나무를 각각{d1}m,{d2}m 간격으로 심습니다. 이웃한 목련나무 사이마다 가에는 벚나무를{k1}그루씩,나에는{k2}그루씩 심습니다. 두 호수의 나무를 모두 합하면{total}그루이고,나의 둘레가 가보다{diff}m 깁니다. 가와 나의 둘레를 차례로 구하시오.',
 [p1,p2],['가의 둘레','나의 둘레'],[f'가의목련수를가수,나의목련수를나수라하면닫힌둘레의간격수도각각같습니다. 전체나무는가에서목련한그루당{k1+1}그루,나에서는{k2+1}그루씩입니다.',f'따라서({k1+1}×가수)＋({k2+1}×나수)＝{total}이고,둘레차에서({d2}×나수)−({d1}×가수)＝{diff}입니다.',f'첫관계의양쪽에{d2}를곱하고둘째관계의양쪽에{k2+1}을곱해빼면,가수에곱해진수는{d2*(k1+1)+d1*(k2+1)},오른쪽은{total*d2-diff*(k2+1)}입니다. 가수는{a}그루,이를넣으면나수는{b}그루입니다.',f'둘레는가{a}×{d1}＝{p1}m,나{b}×{d2}＝{p2}m입니다. 차는{diff}m,전체나무는{(k1+1)*a}＋{(k2+1)*b}＝{total}그루로둘다맞습니다.'],
 '닫힌 길마다의 나무 배수를 만들고 전체 수·둘레 차를 동시에 사용하기','two closed-loop linear constraints with positive unique counts')

#10: direct modular candidate sets, then sums or a third necessary condition.
for m,n,r,s,limit in [(5,7,1,2,200),(4,9,2,5,250),(7,8,3,5,300),(5,11,2,4,300),(8,9,3,4,350)]:
 vals=[v for v in range(1,limit)if v%m==r and v%n==s];period=math.lcm(m,n)
 add(10,'middle',dict(m=m,n=n,remainderM=r,remainderN=s,limit=limit),f'{limit}보다 작은 자연수 중{m}로 나누면 나머지가{r}이고,{n}로 나누면 나머지가{s}인 수를 모두 더하시오.',
 [sum(vals)],['모든 수의 합'],[f'{m}로나누어나머지가{r}인수를차례로살펴보고{n}로나눈나머지도확인하면가장작은공통후보는{vals[0]}입니다.',f'두조건을모두만족하는다음수는{m}과{n}의최소공배수인{period}만큼씩커집니다.',f'{limit}보다작은후보는'+', '.join(map(str,vals))+f'이며모두더하면{sum(vals)}입니다. 다음후보{vals[-1]+period}는범위를벗어납니다.'],
 '서로 다른 나머지의 공통 후보와 반복 간격을 찾고 범위 안에서 합산하기','simultaneous residues and finite arithmetic progression')
for m,n,k,value,limit in [(5,7,9,113,200),(4,7,9,157,220),(5,8,9,173,250),(7,8,9,229,300),(5,7,11,263,320)]:
 rem=[value%m,value%n,value%k];vals=[v for v in range(1,limit)if[v%m,v%n,v%k]==rem];assert vals==[value];pair=[v for v in range(1,limit)if v%m==rem[0]and v%n==rem[1]]
 add(10,'high',dict(divisors=[m,n,k],remainders=rem,limit=limit),f'{limit}보다 작은 어떤 자연수를{m}로 나누면 나머지가{rem[0]}, {n}로 나누면 나머지가{rem[1]}, {k}로 나누면 나머지가{rem[2]}입니다. 이 자연수를 구하시오.',
 [value],['자연수'],[f'먼저{m}로나누어나머지가{rem[0]}인수를살펴보고{n}의조건까지맞추면가장작은후보는{pair[0]}입니다. 두조건의공통주기는{math.lcm(m,n)}입니다.',f'{limit}보다작은두조건의후보는'+', '.join(map(str,pair))+'입니다.',f'이를각각{k}로나눈나머지는'+', '.join(str(v%k)for v in pair)+f'입니다. 나머지가{rem[2]}인수는{value}하나뿐입니다.',f'실제로{value}＝{m}×{value//m}＋{rem[0]}＝{n}×{value//n}＋{rem[1]}＝{k}×{value//k}＋{rem[2]}이고범위에도맞습니다.'],
 '세 나머지 조건을 순서대로 교차해 범위 안 유일한 수를 결정하기','three necessary modular constraints and bounded uniqueness')

#11: keep the actual triangular row diagram, 1,2,3,4,5 items per row.
def rowends(r):return r*(r-1)//2+1,r*(r+1)//2
def rowsum(r):a,b=rowends(r);return(a+b)*r//2
for r,pos in [(12,4),(15,7),(17,9),(20,6),(23,11)]:
 a,b=rowends(r);answer=a+pos-1;total=a+b
 add(11,'middle',dict(endpointSum=total,position=pos),f'그림과 같은 규칙으로 자연수를 배열했습니다. 어떤 행의 맨 처음 수와 맨 마지막 수의 합이{total}입니다. 그 행에서 왼쪽으로부터{pos}번째 수를 구하시오.',
 [answer],['지정한 수'],['행번호를곱하여세면그행의마지막수는1＋2＋…＋행번호입니다. 처음수는바로앞행의마지막수보다1큽니다.',f'행번호가같은두식을더하면처음수와마지막수의합은(행번호×행번호)＋1입니다. {total}−1＝{r}×{r}이므로{r}행입니다.',f'{r-1}행까지의수는{r*(r-1)//2}개여서첫수는{a},끝수는{b}입니다.',f'왼쪽{pos}번째는첫수에서{pos-1}큰수이므로{a}＋{pos-1}＝{answer}입니다.'],
 '처음·끝의 합에서 행 길이를 역산한 뒤 행 안 위치를 결정하기','triangular endpoint sum inverse and ordinal position')
for r,pos in [(8,3),(9,5),(10,7),(11,4),(12,9)]:
 total=rowsum(r)+rowsum(r+1);a,b=rowends(r+2);answer=a+pos-1
 table=[[str(n),str(rowsum(n)),str(rowsum(n+1)),str(rowsum(n)+rowsum(n+1))]for n in range(r-1,r+2)]
 add(11,'high',dict(adjacentRowsSum=total,nextRowPosition=pos),f'그림과 같은 규칙으로 자연수를 배열했습니다. 서로 이웃한 두 행에 있는 수를 모두 더했더니{total}이었습니다. 이 두 행 바로 다음 행에서 왼쪽으로부터{pos}번째 수를 구하시오.',
 [answer],['다음 행의 지정한 수'],['행번호가같은처음수와마지막수의합은(행번호×행번호)＋1입니다. 그행의개수는행번호이므로행전체합은행번호×(행번호×행번호＋1)÷2입니다.',f'이웃한두행의합을행번호순으로계산하면답안표와같습니다. {r}행과{r+1}행의합이{rowsum(r)}＋{rowsum(r+1)}＝{total}입니다. 행이뒤로갈수록개수도각수도커지므로다른두행에서는같은합이되지않습니다.',f'바로다음은{r+2}행입니다. 앞{r+1}행까지{(r+1)*(r+2)//2}개의수가있으므로첫수는{a}입니다.',f'왼쪽{pos}번째수는{a}＋{pos-1}＝{answer}입니다.'],
 '이웃한 두 행의 합으로 행을 찾고 다음 행의 시작과 위치를 함께 추적하기','strictly increasing adjacent row sums and triangular boundary',solutionTable=dict(headers=['앞 행','앞 행의 합','다음 행의 합','두 행의 합'],rows=table))

#12: fixed drawing and exact cut, no changed digits or extra answer marks.
# Scores assign values to the two existing printed cell labels; the drawing is not relabelled.
for mode,ask,answer in [('removedCells','잘려 나간 원래 칸은 모두 몇 칸입니까?',4),('remainingCells','펼쳤을 때 남아 있는 칸은 모두 몇 칸입니까?',12),('remainingOnes','펼쳤을 때1이 적힌 칸은 몇 칸 남습니까?',6),('remainingTwos','펼쳤을 때2가 적힌 칸은 몇 칸 남습니까?',6),('removedSum','잘려 나간 칸에 적혔던 수의 합은 얼마입니까?',6)]:
 steps=['그림은아래반을위로접고왼쪽반을오른쪽으로접은뒤접힌종이의오른쪽위한칸을자릅니다. 펼치면원래색종이의네모서리칸이잘려나갑니다.','네모서리의수는위쪽1·2,아래쪽2·1입니다. 따라서1이쓴칸두개와2가쓴칸두개가잘립니다.']
 steps.append(dict(removedCells='한번자른자리에네겹이겹쳐있었으므로원래칸은4칸잘립니다.',remainingCells='원래4×4＝16칸중4칸을잘랐으므로16−4＝12칸이남습니다.',remainingOnes='처음1은8개이고두개가잘렸으므로8−2＝6개남습니다.',remainingTwos='처음2는8개이고두개가잘렸으므로8−2＝6개남습니다.',removedSum='잘려나간수의합은1＋2＋2＋1＝6입니다.')[mode])
 add(12,'low',dict(mode=mode),'그림과 같이 숫자 색종이를 두 번 접어 자릅니다. '+ask,[answer],['칸 수'if'Cells'in mode or mode in ['remainingOnes','remainingTwos']else'수의 합'],steps,'접힌 한 칸의 원래 네 위치를 찾고 남은 종류별 수량 구분하기','exact fold preimage and original checkerboard count')
for a,b in [(2,5),(3,7),(4,9),(5,8),(6,11)]:
 total=6*(a+b)
 add(12,'middle',dict(oneScore=a,remainingScore=total),f'그림의 색종이에서1이 적힌 칸 한 개를{a}점,2가 적힌 칸 한 개를 같은 몇 점으로 계산합니다. 그림과 같이 두 번 접어 자른 뒤 펼쳤더니 남은 칸의 점수 합이{total}점이었습니다. 2가 적힌 칸 한 개는 몇 점으로 계산했습니까?',
 [b],['2 칸 한 개의 점수'],['그림의절단을펼치면원래네모서리칸이없어집니다.1과2가각각두개씩잘리므로남은칸은1이6개,2가6개입니다.',f'1이적힌칸들의점수합은6×{a}＝{6*a}점입니다.',f'따라서2가적힌여섯칸의점수합은{total}−{6*a}＝{6*b}점이고한칸은{6*b}÷6＝{b}점입니다. 그림에적힌숫자는칸종류를가리키며점수와구분합니다.'],
 '펼친 뒤 두 종류 칸 수를 세고 전체 점수에서 한 종류의 점수 역산하기','fixed digit-label counts and weighted score inverse')
for a,b in [(3,5),(4,7),(5,9),(6,11),(7,13)]:
 first=6*(a+b);second=6*a+5*b
 add(12,'high',dict(firstScore=first,secondScore=second,extraRemovedOriginalCell=[1,0]),f'그림의 색종이에서1이 적힌 칸은 한 개당 가 점,2가 적힌 칸은 한 개당 나 점으로 계산합니다. 가와 나는 양의 정수입니다. 그림과 같이 접어 자른 뒤 펼쳤을 때 남은 칸의 점수 합은{first}점입니다. 펼친 색종이에서 원래 맨 위 행의 왼쪽에서 두 번째 칸을 한 칸 더 떼어 냈더니 점수 합이{second}점이 되었습니다. 가와 나를 차례로 구하시오.',
 [a,b],['가(1 칸의 점수)','나(2 칸의 점수)'],['두번접고그림의오른쪽위를자른것을펼치면원래네모서리가잘립니다. 따라서처음남은종류별칸수는1과2각6개입니다.','원래맨위행왼쪽두번째칸에는2가적혀있고모서리가아니므로첫절단뒤에도남아있습니다. 이한칸을더떼어내면1은6개,2는5개가됩니다.',f'추가로떼어낸2한칸의점수는두합의차인{first}−{second}＝{b}점입니다. 따라서나는{b}입니다.',f'첫합에서2여섯칸의점수{6*b}점을빼면1여섯칸의점수는{first}−{6*b}＝{6*a}점입니다. 가는{6*a}÷6＝{a}입니다. 확인하면6×{a}＋5×{b}＝{second}입니다.'],
 '접기 절단의 원래 위치와 추가 제거 칸을 추적하고 두 점수 합의 차로 역산하기','fixed fold plus one surviving cell removal and two weighted equations')

import re
pairs='''일은토요일입니다|일은 토요일입니다
각각월요일|각각 월요일
각각목요일|각각 목요일
각각일요일|각각 일요일
일부터의경과일은각각|일부터의 경과일은 각각
양끝을포함하면|양 끝을 포함하면
달의길이를|달의 길이를
로나눈나머지만큼다음달의첫요일을옮겨매달해당두요일의날짜를셉니다|로 나눈 나머지만큼 다음 달의 첫 요일을 옮겨 매달 해당 두 요일의 날짜를 셉니다
답안표의두요일수를합하면|답안 표의 두 요일 수를 합하면
번은모두휴강입니다|번은 모두 휴강입니다
별도휴강인|별도 휴강인
월에속하지않습니다|월에 속하지 않습니다
따라서따로한번뺍니다|따라서 따로 한 번 뺍니다
실제수업은|실제 수업은
그루에서두종류의차|그루에서 두 종류의 차
그루를빼면목련나무수의두배입니다|그루를 빼면 목련나무 수의 두 배입니다
닫힌호수에서는처음과끝이만나므로목련나무수와간격수가같아|닫힌 호수에서는 처음과 끝이 만나므로 목련나무 수와 간격 수가 같아
이므로둘레는|이므로 둘레는
그루로간격마다|그루로 간격마다
그루씩심은조건과도맞습니다|그루씩 심은 조건과도 맞습니다
가의목련수를가수|가의 목련 수를 ㉠
나의목련수를나수라하면닫힌둘레의간격수도각각같습니다|나의 목련 수를 ㉡이라 하면 닫힌 둘레의 간격 수도 각각 같습니다
전체나무는가에서목련한그루당|전체 나무는 가에서 목련 한 그루당
둘레차에서|둘레 차에서
첫관계의양쪽에|첫 관계의 양쪽에
를곱하고둘째관계의양쪽에|를 곱하고 둘째 관계의 양쪽에
을곱해빼면|을 곱해 빼면
가수에곱해진수는|㉠에 곱해진 수는
이를넣으면나수는|이를 넣으면 ㉡은
전체나무는|전체 나무는
그루로둘다맞습니다|그루로 둘 다 맞습니다
로나누어나머지가|로 나누어 나머지가
인수를차례로살펴보고|인 수를 차례로 살펴보고
로나눈나머지도확인하면가장작은공통후보는|로 나눈 나머지도 확인하면 가장 작은 공통 후보는
두조건을모두만족하는다음수는|두 조건을 모두 만족하는 다음 수는
의최소공배수인|의 최소공배수인
만큼씩커집니다|만큼씩 커집니다
보다작은후보는|보다 작은 후보는
이며모두더하면|이며 모두 더하면
는범위를벗어납니다|는 범위를 벗어납니다
인수를살펴보고|인 수를 살펴보고
의조건까지맞추면가장작은후보는|의 조건까지 맞추면 가장 작은 후보는
두조건의공통주기는|두 조건의 공통 주기는
보다작은두조건의후보는|보다 작은 두 조건의 후보는
로나눈나머지는|로 나눈 나머지는
이고범위에도맞습니다|이고 범위에도 맞습니다
행번호를곱하여세면그행의마지막수는|행 번호를 곱하여 세면 그 행의 마지막 수는
행번호입니다|행 번호입니다
처음수는바로앞행의마지막수보다|처음 수는 바로 앞 행의 마지막 수보다
행번호가같은두식을더하면처음수와마지막수의합은|행 번호가 같은 두 식을 더하면 처음 수와 마지막 수의 합은
행까지의수는|행까지의 수는
개여서첫수는|개여서 첫 수는
번째는첫수에서|번째는 첫 수에서
큰수이므로|큰 수이므로
행번호가같은처음수와마지막수의합은|행 번호가 같은 처음 수와 마지막 수의 합은
그행의개수는행번호이므로행전체합은행번호|그 행의 개수는 행 번호이므로 행 전체 합은 행 번호
이웃한두행의합을행번호순으로계산하면답안표와같습니다|이웃한 두 행의 합을 행 번호 순으로 계산하면 답안 표와 같습니다
행이뒤로갈수록개수도각수도커지므로다른두행에서는같은합이되지않습니다|행이 뒤로 갈수록 개수도 각 수도 커지므로 다른 두 행에서는 같은 합이 되지 않습니다
바로다음은|바로 다음은
개의수가있으므로첫수는|개의 수가 있으므로 첫 수는
그림은아래반을위로접고왼쪽반을오른쪽으로접은뒤접힌종이의오른쪽위한칸을자릅니다|그림은 아래 반을 위로 접고 왼쪽 반을 오른쪽으로 접은 뒤 접힌 종이의 오른쪽 위 한 칸을 자릅니다
펼치면원래색종이의네모서리칸이잘려나갑니다|펼치면 원래 색종이의 네 모서리 칸이 잘려 나갑니다
네모서리의수는위쪽|네 모서리의 수는 위쪽
이쓴칸두개와|이 쓰인 칸 두 개와
가쓴칸두개가잘립니다|가 쓰인 칸 두 개가 잘립니다
한번자른자리에네겹이겹쳐있었으므로원래칸은|한 번 자른 자리에 네 겹이 겹쳐 있었으므로 원래 칸은
칸잘립니다|칸 잘립니다
칸을잘랐으므로|칸을 잘랐으므로
칸이남습니다|칸이 남습니다
개이고두개가잘렸으므로|개이고 두 개가 잘렸으므로
개남습니다|개 남습니다
잘려나간수의합은|잘려 나간 수의 합은
그림의절단을펼치면원래네모서리칸이없어집니다|그림의 절단을 펼치면 원래 네 모서리 칸이 없어집니다
가각각두개씩잘리므로남은칸은|가 각각 두 개씩 잘리므로 남은 칸은
이적힌칸들의점수합은|이 적힌 칸들의 점수 합은
가적힌여섯칸의점수합은|가 적힌 여섯 칸의 점수 합은
점이고한칸은|점이고 한 칸은
그림에적힌숫자는칸종류를가리키며점수와구분합니다|그림에 적힌 숫자는 칸 종류를 가리키며 점수와 구분합니다
두번접고그림의오른쪽위를자른것을펼치면원래네모서리가잘립니다|두 번 접고 그림의 오른쪽 위를 자른 것을 펼치면 원래 네 모서리가 잘립니다
따라서처음남은종류별칸수는|따라서 처음 남은 종류별 칸 수는
원래맨위행왼쪽두번째칸에는|원래 맨 위 행 왼쪽 두 번째 칸에는
가적혀있고모서리가아니므로첫절단뒤에도남아있습니다|가 적혀 있고 모서리가 아니므로 첫 절단 뒤에도 남아 있습니다
이한칸을더떼어내면|이 한 칸을 더 떼어 내면
개가됩니다|개가 됩니다
추가로떼어낸|추가로 떼어 낸
한칸의점수는두합의차인|한 칸의 점수는 두 합의 차인
따라서나는|따라서 나는
여섯칸의점수|여섯 칸의 점수
여섯칸의점수는|여섯 칸의 점수는'''
lookup=dict(line.split('|')for line in pairs.splitlines())
def fix(s):
 s=re.sub('[가-힣]+',lambda m:lookup.get(m[0],m[0]),s)
 s=s.replace('가수','㉠').replace('나수','㉡').replace('행번호','행 번호')
 s=re.sub(r'월의첫([가-힣]+)은',r'월의 첫 \1은',s)
 s=re.sub(r'일은([가-힣]+)로원래수업하는날이며',r'일은 \1로 원래 수업하는 날이며',s)
 s=re.sub(r'(?<=[가-힣])(?=\d)', ' ',s)
 s=s.replace('과2각','과 2가 각각').replace('이6개','이 6개')
 s=s.replace('행 번호를 곱하여 세면 그 행의 마지막 수는','각 행의 개수는 행 번호와 같습니다. 따라서 그 행의 마지막 수는').replace('1과 2각','1과 2가 각각').replace('첫합에서','첫 합에서').replace('점을빼면','점을 빼면').replace('끝수는','끝 수는').replace('행의합이','행의 합이').replace('번째수는','번째 수는')
 s=re.sub(r'(\d)(?=큰|여섯 칸|한 칸)',r'\1 ',s);s=re.sub(r',(?=\S)',', ',s);s=re.sub(r'\.(?=[가-힣])','. ',s)

 return s
for x in items:
 if x['sourceNo']>=7 and not x.get('preservedApprovedId'):
  x['solutionSteps']=[fix(s)for s in x['solutionSteps']];x['solution']=' '.join(x['solutionSteps'])

assert items[:90]==prior and len(items)==len({x['id']for x in items})==180
for n in range(1,13):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==n)==dict(low=5,middle=5,high=5)
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable']},ensure_ascii=False,sort_keys=True)for x in items})==180
for x in items:
 if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in old if y['id']==x['id']).items())
data.update(version=version,items=items,availableSourceNos=list(range(1,13)),pendingSourceNos=list(range(13,31)),preservedLegacyCount=40,newAuthoredCount=140);data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('Authored Applied3 sources7-12:90new slots=70new+20approved;first90 exact preserved;total180 pending full QA')

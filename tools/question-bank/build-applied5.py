"""Applied5 finite text variants; all corresponding source questions directly inspected."""
import itertools as it,json,math,calendar,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];items=[]
TYPES={1:('수와 식','몫과 나머지','세 자리 수의 몫과 나머지 합의 최댓값'),2:('수와 식','합과 차의 관계','막대의 길이와 물의 깊이'),4:('수와 식','약수와 곱','두 나이 곱의 공통 인수'),7:('수와 식','집합과 겹침','세 집합의 공통 부분 찾기'),10:('수와 식','달력과 주기','윤년을 포함한 같은 날짜의 요일'),13:('수와 식','배수와 자릿수','25의 배수 중 자리 합 조건'),21:('수와 식','몫과 나머지','모임 수 차이로 전체 인원 찾기'),30:('수와 식','수열과 약수','일정하게 늘리는 줄의 처음 개수 최솟값')}
week=['월','화','수','목','금','토','일']
def add(no,p,text,answer,steps,focus,method):
 v=1+sum(x['sourceNo']==no for x in items);area,sub,detail=TYPES[no];point='2.7' if no<=12 else '3.4' if no<=22 else '4.2';page=1 if no<=6 else 2 if no<=12 else 3 if no<=18 else 4 if no<=22 else 5 if no<=26 else 6
 x=dict(id=f'applied5-q{no:02d}-v{v}',genId=f'applied5-q{no:02d}',sourceSet='applied',sourceRound=5,sourceNo=no,variantNo=v,reviewStatus='pending-output-review',area=area,subarea=sub,detailType=detail,pointBand=point,text=text,answer=str(answer),answerParts=[answer],answerLabels=['요일' if no==10 else '답'],acceptedAnswers=[str(answer)],answerContract='ordered-parts',solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,learningLocation=f'활용 5회 · 원문 {no}번 · {sub}',verification={'primaryMethod':method,'parameters':p,'independentSuite':'qa/applied5-independent-validate.py','sourceExamPage':page,'sourceAnswerPage':31 if no==30 else no,'studentDifficultyMeasured':False},difficultyEvidence={'basis':'source-point-band','label':{'2.7':'하','3.4':'중','4.2':'상'}[point],'sourceReasoningPreserved':True,'measuredVariantRate':None});items.append(x)
for d in [13,14,15,16,18,19,21,22,23]:
 q,r=divmod(999,d);first=q+r;second=q-1+d-1;ans=max(first,second)
 add(1,{'divisor':d},f'세 자리 자연수를 {d}로 나누었을 때 몫과 나머지의 합이 가장 크게 되는 경우를 생각합니다. 그 합의 최댓값을 구하시오.',ans,[f'나머지는 0부터 {d-1}까지이고, 몫은 999÷{d}에서 {q}까지 나올 수 있습니다.',f'몫이 {q}일 때 가능한 가장 큰 나머지는 {r}이므로 합은 {q}＋{r}＝{first}입니다. 몫을 하나 줄인 {q-1}에서는 나머지 {d-1}을 쓸 수 있어 합이 {q-1}＋{d-1}＝{second}입니다.',f'몫이 이보다 작으면 가장 큰 나머지 {d-1}을 써도 합이 더 작습니다. 따라서 두 값을 비교한 최댓값은 {ans}입니다.'],'가장 큰 몫과 가장 큰 나머지를 동시에 쓸 수 있는지 확인하기','maximum over the two largest feasible quotients')
for above,below in [(6,3),(7,4),(9,3),(10,5),(11,4),(12,6),(13,5),(14,7),(15,6)]:
 depth=above+2*below;length=2*(above+below)
 add(2,{'above':above,'below':below},f'막대의 한쪽 끝을 물바닥에 대고 수직으로 세웠더니 수면 위로 {above}m가 나왔습니다. 이 막대를 정확히 반으로 자른 한 조각을 같은 물바닥에 수직으로 세웠더니 수면까지 {below}m가 모자랐습니다. 물의 깊이는 몇 m입니까?',depth,[f'막대 전체 길이와 절반 길이의 차는 막대 길이의 절반입니다. 두 높이 차는 수면 위 {above}m와 수면 아래 {below}m를 더한 {above+below}m입니다.',f'따라서 반 막대의 길이가 {above+below}m입니다. 여기에 수면까지 모자란 {below}m를 더하면 물의 깊이는 {above+below}＋{below}＝{depth}m입니다.',f'막대 전체 길이 {length}m에서 깊이 {depth}m를 빼면 {above}m가 남고, 반 막대 {length//2}m는 깊이보다 {below}m 짧으므로 맞습니다.'],'수면을 기준으로 남은 길이와 모자란 길이의 차를 합으로 나타내기','rod length halves and two offsets')
ages=[]
for E,S,Y in [(20,17,13),(21,16,11),(23,18,13),(25,19,12),(26,21,15),(27,20,13),(29,22,17),(31,23,18),(32,25,19)]:
 P=E*S;Q=S*Y;sol=[(a,b,c) for b in range(1,60) if P%b==Q%b==0 for a,c in [(P//b,Q//b)] if a>b>c>=1];assert sol==[(E,S,Y)]
 factors=[s for s in range(1,min(P,Q)+1) if P%s==Q%s==0]
 add(4,{'elderProduct':P,'youngerProduct':Q},f'큰형의 나이와 작은형의 나이를 곱하면 {P}, 작은형의 나이와 나의 나이를 곱하면 {Q}입니다. 세 사람의 나이는 자연수이고 큰형, 작은형, 나의 순서로 나이가 많습니다. 나는 몇 살입니까?',Y,[f'작은형의 나이는 두 곱 {P}와 {Q}를 모두 나누어떨어지게 하는 수여야 합니다. 공통 약수는 '+', '.join(map(str,factors))+'입니다.',f'각 공통 약수로 두 곱을 나누어 큰형과 나의 나이를 구하고 큰형＞작은형＞나의 순서를 확인하면, 작은형이 {S}살일 때만 큰형 {E}살·나 {Y}살이 됩니다.',f'실제로 {E}×{S}＝{P}, {S}×{Y}＝{Q}이므로 나의 나이는 {Y}살입니다.'],'두 곱에 공통으로 들어간 나이를 공약수 후보에서 찾기','common factors with strict age order')
for j in range(9):
 a,b,c=8+j%3,7+j%2,9+j%4;ab,bc,ac=3+j%3,4+j%2,2+j%4;t=2+j%5;none=6+j;N=a+b+c+ab+bc+ac+t+none;A=a+ab+ac+t;B=b+ab+bc+t;C=c+ac+bc+t;AB=ab+t;BC=bc+t;AC=ac+t;u=N-none;base=A+B+C-AB-BC-AC
 add(7,{'total':N,'A':A,'B':B,'C':C,'AB':AB,'BC':BC,'AC':AC,'none':none},f'학생 {N}명 중 나비를 좋아하는 학생은 {A}명, 벌은 {B}명, 무당벌레는 {C}명입니다. 나비와 벌을 모두 좋아하는 학생은 {AB}명, 벌과 무당벌레를 모두 좋아하는 학생은 {BC}명, 나비와 무당벌레를 모두 좋아하는 학생은 {AC}명입니다. 세 곤충 중 어느 것도 좋아하지 않는 학생이 {none}명일 때 세 곤충을 모두 좋아하는 학생은 몇 명입니까?',t,[f'한 가지 이상 좋아하는 학생은 {N}−{none}＝{u}명입니다.',f'종류별 수를 더하고 두 종류씩의 공통 인원을 빼면 {A}＋{B}＋{C}−{AB}−{BC}−{AC}＝{base}명입니다. 세 종류 모두 좋아하는 학생은 세 번 더해지고 세 번 빠져 이 계산에 남지 않습니다.',f'전체 한 가지 이상인 {u}명과의 차가 그 인원이므로 {u}−{base}＝{t}명입니다.'],'세 번 겹치는 부분을 빼고 더한 횟수로 확인하기','three-set inclusion exclusion from nonnegative region counts')
for start in [2016,2017,2018,2020,2021,2022,2023,2024,2025]:
 end=start+7;wd=datetime.date(start,5,5).weekday();leaps=[y for y in range(start+1,end+1) if calendar.isleap(y)];shift=7+len(leaps);ans=week[(wd+shift)%7]+'요일'
 add(10,{'startYear':start,'endYear':end,'startWeekday':wd,'leapYears':leaps},f'{start}년 5월 5일은 {week[wd]}요일입니다. {end}년 5월 5일은 무슨 요일입니까? 이 두 날짜 사이에 2월 29일이 있는 해는 '+', '.join(map(str,leaps))+'년이며, 나머지 해는 365일입니다.',ans,[f'평년의 같은 날짜까지는 365일, 즉 52주와1일이 지나 요일이 하루 뒤로 갑니다. 중간에2월29일이 한 번 들어가면 하루가 더 늦어집니다.',f'{start}년5월5일부터 {end}년5월5일까지는7년이고 그 사이2월29일은 {len(leaps)}번입니다. 따라서 요일은 7＋{len(leaps)}＝{shift}일 뒤로 갑니다.',f'{shift}을7로 나눈 나머지는 {shift%7}입니다. {week[wd]}요일에서 {shift%7}일 뒤는 {ans}입니다.'],'시작 날짜 이후 실제로 포함되는 윤일만 더하기','actual Gregorian anchor and leap-day count')
for S in [12,13,14,15,17,18,19,20,21]:
 groups={tail:[(a,b) for a in range(1,10) for b in range(10) if a+b+sum(map(int,f'{tail:02d}'))==S] for tail in [0,25,50,75]};ans=sum(len(g) for g in groups.values());steps=['25의 배수는 끝 두 자리가00,25,50,75 중 하나입니다. 10000은 자리 합이1이므로 조건에 맞지 않고, 나머지는 네 자리 수입니다.']
 for tail,pairs in groups.items():steps.append(f'끝 두 자리가{tail:02d}이면 앞 두 자리의 합은 {S}−{sum(map(int,f"{tail:02d}"))}입니다. 가능한 앞 두 자리 수는 '+(', '.join(str(10*a+b) for a,b in pairs) if pairs else '없음')+f'으로 {len(pairs)}개입니다.')
 steps.append('네 경우의 끝자리는 서로 다르므로 겹치지 않습니다. 모두 더하면 '+'＋'.join(str(len(g)) for g in groups.values())+f'＝{ans}개입니다.')
 add(13,{'digitSum':S},f'1000부터 10000까지의 자연수 중 25로 나누어떨어지고 각 자리 숫자의 합이 {S}인 수는 모두 몇 개입니까?',ans,steps,'25의 배수의 끝 두 자리로 나누고 앞 두 자리의 합을 세기','four possible suffixes and two-digit sums')
cases=[]
for a,b,d in [(4,6,2),(4,7,2),(5,8,2),(5,7,3),(6,8,2),(6,9,3),(7,9,3),(7,10,3),(8,10,3)]:
 candidates=[]
 for r1 in range(1,a):
  for r2 in range(1,b):
   num=b*d+r1-r2
   if num%(b-a):continue
   k=num//(b-a);N=a*k+r1
   if k>d and N%b==r2 and N//b==k-d:candidates.append((r1,r2,k,N))
 assert candidates;cases.append((a,b,d,*candidates[len(candidates)//2]))
for a,b,d,r1,r2,k,N in cases:
 add(21,{'firstSize':a,'secondSize':b,'groupDifference':d,'firstRemainder':r1,'secondRemainder':r2},f'같은 학생 전원을 대상으로 모여라 놀이를 두 번 합니다. 매번 처음 인원으로 다시 시작하며 무리에 들지 못한 학생만 그 차례에서 탈락합니다. {a}명씩 모이면 {r1}명이 남고, {b}명씩 모이면 앞의 경우보다 무리 수가 {d}개 적으며 {r2}명이 남습니다. 처음 학생은 모두 몇 명입니까?',N,[f'{a}명씩 모인 무리 수를 □라 하면 전체는 {a}×□＋{r1}명입니다. {b}명씩일 때 무리 수는 □−{d}이므로 전체는 {b}×(□−{d})＋{r2}명입니다.',f'두 식이 같으므로 {b-a}×□＝{b*d}＋{r1}−{r2}＝{b*d+r1-r2}입니다. 따라서 첫 무리 수는 {k}개입니다.',f'전체는 {a}×{k}＋{r1}＝{N}명입니다. 다른 경우도 {b}×{k-d}＋{r2}＝{N}명으로 같고 두 나머지는 무리 크기보다 작습니다.'],'같은 전체 인원을 두 나눗셈식으로 나타내기','group-count difference and two remainders')
for total in [90,100,120,126,132,140,150,156,168]:
 pairs=[(r,total//r-r+1) for r in range(1,total+1) if total%r==0 and total//r-r+1>=1];ans=min(x for r,x in pairs);row=next(r for r,x in pairs if x==ans)
 add(30,{'total':total,'increment':2},f'첫째 줄에 바둑돌을 □개 놓고 둘째 줄에는 □＋2개, 셋째 줄에는 □＋4개로 한 줄마다 2개씩 늘립니다. 어떤 줄까지 놓은 바둑돌이 모두 {total}개일 때 □에 들어갈 수 있는 가장 작은 자연수를 구하시오.',ans,[f'줄 수를 △라 하면 첫 수□가 각 줄마다 있어 △×□개이고, 늘어난 부분은 0＋2＋4＋…＋2×(△−1)＝△×(△−1)개입니다.',f'전체는 △×(□＋△−1)＝{total}이므로 줄 수△는 {total}의 약수입니다. □가 자연수가 되는 (줄 수, 첫 수)는 '+', '.join(f'({r},{x})' for r,x in pairs)+'입니다.',f'첫 수가 가장 작은 경우는 {row}줄일 때의 {ans}개입니다. 이때 수열의 합은 {row}×({ans}＋{row-1})＝{total}개이므로 맞습니다.'],'등차수열의 전체를 두 자연수의 곱으로 바꿔 약수 후보 비교하기','divisor factorization of arithmetic progression sum')
assert len(items)==72 and all(sum(x['sourceNo']==no for x in items)==9 for no in TYPES)
assert len({x['text'] for x in items})==72
out={'version':'20261024-applied5-expansion-r1','sourceSet':'applied','sourceRound':5,'policy':{'targetVariantsPerSource':9,'runtimeGeneration':False,'defaultDiagnosticVariants':3,'difficulty':'활용 배점대만 사용','sourceGradeMutation':False},'availableSourceNos':sorted(TYPES),'pendingSourceNos':[n for n in range(1,31) if n not in TYPES],'items':items,'sourceEditionNotes':{'10':'원문의2019년5월5일금요일은실제달력과다르다. 새문항은실제그레고리력연도·요일을두방법으로계산,원문답보존','18':'현행문제월6600원과교사PDF6000원판본차이로공개보류','21':'두나눗셈이같은전체인원이라는원래계산모형을새지문에명시','29':'0·1만쓰는처음8수에는11·101도포함된다. 10의거듭제곱만으로오독하여제작하지않으며이번공개대상아님'}}
(ROOT/'bank/data/applied5-expanded.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Authored72 Applied5 variants in8 types; pending independent/output review')

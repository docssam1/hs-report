"""Finite Applied3 levelled bank; never replace an existing reviewed bank."""
import collections,copy,hashlib,itertools,json,shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied3-balanced15.json'
assert not FILE.exists(),'Do not rebuild an existing bank'
legacy_bytes=(ROOT/'bank/data/applied3-expanded.json').read_bytes();legacy=json.loads(legacy_bytes)['items']
version='20261024-applied3-balanced15-r1';items=[]
for no in [1,2,3,5]:
 for old in [x for x in legacy if x['sourceNo']==no][:5]:
  x=copy.deepcopy(old);assert x['pointBand']=='2.7'
  x.update(practiceLevel='low',sourcePointBand='2.7',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)
meta={1:('수와 식','분수 배열의 규칙','묶음과 분자·분모의 관계'),2:('수와 식','연속한 수와 곱','두 쪽수의 곱과 펼침 비교'),3:('도형','평면의 분할','평행 조건이 있는 직선 자르기'),4:('도형','입체와 색칠','계단 쌓기의 노출면과 칠한 면'),5:('도형','둘레와 중복','여러 겹 정사각 테두리 역산'),6:('수와 식','일의 양과 비','일정 비교와 하루 일의 양')}
roles={1:{'middle':'분자와 분모로 묶음 번호·묶음 안 위치를 역산','high':'두 분수의 분자합·분모합·분자차를 결합하여 두 위치 역산'},
 2:{'middle':'앞뒤 두 펼침의 쪽수 곱 차와 넘긴 장수로 첫 펼침 역산','high':'두 책의 쪽수 차와 두 곱의 합으로 두 펼침 동시 결정'},
 3:{'middle':'주어진 절단 수에서 한 평행 묶음의 교점 손실을 반영','high':'서로 다른 두 평행 묶음의 교점 손실과 최소 절단 수를 결합'},
 4:{'low':'고정 계단의 층·한 층·모서리 등 한 성질을 관찰','middle':'칠한 면의 개수와 밑층/위층/범위를 함께 분류','high':'윗층 제거 전 칠한 면을 기억한 경우와 새 면까지 칠한 경우를 비교'},
 5:{'middle':'세 겹의 전체 깃발 수로 바깥 한 변의 수 역산','high':'가장 안쪽 한 변과 전체 깃발에서 겹 수·바깥 한 변을 동시 역산'},
 6:{'low':'하루 일의 양의 두 배 관계를 주고 전체 일을 한 사람의 일수로 환산','middle':'두 일정의 차에서 두 일꾼의 비를 찾고 각자 혼자 걸리는 일수 계산','high':'세 일정의 차로 세 일꾼의 비를 정하고 각각의 단독 일수 계산'}}
sequence=copy.deepcopy(next(x for x in legacy if x['sourceNo']==1)['promptDataLines'])
pizza=copy.deepcopy(next(x for x in legacy if x['sourceNo']==3)['asset'])

def frac(a,b):return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{a}</mn><mn>{b}</mn></mfrac></math>'
def add(no,level,p,text,answer,labels,steps,point,method,**extra):
 v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items);area,subarea,detail=meta[no]
 axes=dict(prerequisite='원문의 분수묶음·연속수·평면분할·계단입체·정사각둘레·일정 비교',reasoning=roles[no][level],conditionTracking='관찰 한 조건에서 두 시점·두 묶음·세 일정의 결합으로 확장',caseSplitting='층/경계/평행 묶음/미지량을 구별하고 같은 경우를 중복 계산하지 않음',computation='큰 수만 늘리지 않고 역산 방향과 결합하는 조건을 바꿈',representation='실제 분수 배열·원본 피자·원본6층 계단 그림 보존;풀이 표는 답안에만',reading='필수 조건은 지문과 실제 일정표 안에만 제시',visualCues='문제 아래 조건 요약·풀이 순서·힌트·완성된 정답 그림 없음',shortcuts='약분한 값과 적힌 분수·왼쪽 쪽수·평행선 교점·새로 노출된 미색칠면·모서리 중복·하루 일의 비를 구별')
 x=dict(id=f'applied3-q{no:02d}-{level}-v{v}',genId=f'applied3-q{no:02d}',sourceSet='applied',sourceRound=3,sourceNo=no,variantNo=v,area=area,subarea=subarea,detailType=detail,learningLocation=f'활용 3회 · 원문 {no}번 · {detail}',learningPoint=point,practiceLevel=level,sourcePointBand='2.7',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],solutionSteps=steps,solution=' '.join(steps),difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',measured=False,axes=axes),verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied3-balanced15-independent-validate.py',sourceExamPage=1 if no<=4 else 2,sourceAnswerPage=1 if no<=4 else 2,studentDifficultyMeasured=False))
 if no==1:x['promptDataLines']=copy.deepcopy(sequence)
 if no==3:x['asset']=dict(kind='raster',src='assets/applied3/pizza-original.png',description='원본피자의실제PDF배치비율을보존한그림.자르는선추가없음.')
 if no==4:x['asset']=dict(kind='raster',src='assets/applied3/staircase-original.png',description='원본6층 계단 쌓기.밑면6×6부터윗면1×1까지,한쪽모서리를맞춘정사각층·선/시점그대로.')
 x.update(extra);assert len(steps)>=3;items.append(x)

#1: positions in the displayed unreduced fraction sequence.
for a,b in [(3,6),(4,7),(5,8),(6,9),(7,10)]:
 k=a+b-2;base=k*(k-1)//2;index=base+a
 add(1,'middle',dict(numerator=a,denominator=b),'아래 배열에 적힌 그대로 분자가'+str(a)+'이고 분모가'+str(b)+'인 분수는 몇 번째에 있습니까?',
  [index],['순서'],['분모가2로 끝나는 묶음은1개,2개,3개,…의 길이입니다. 한 묶음 안에서는 분자와 분모의 합이 같습니다.',f'분자와 분모의 합은{a}＋{b}＝{a+b}이므로 묶음 길이는{a+b}−2＝{k}개입니다.',f'앞의{ k-1}개 묶음에는1＋2＋…＋{k-1}＝{base}개의 분수가 있습니다. 묻는 분수는 분자가{a}이므로 이번 묶음에서{a}번째입니다.',f'따라서 전체에서는{base}＋{a}＝{index}번째입니다. 약분한 값이 같은 다른 분수와 구별합니다.'],
  '쓰인 분자·분모의 합으로 묶음과 위치를 거꾸로 찾기','triangular boundary plus literal numerator position')
for k,a,b in [(9,3,6),(10,4,7),(11,2,8),(12,5,9),(13,3,10)]:
 r=a+b;s=2*(k+2)-r;diff=b-a;base=k*(k-1)//2
 add(1,'high',dict(numeratorSum=r,denominatorSum=s,numeratorDifference=diff),f'아래 배열의 서로 다른 두 분수는 각각의 분자와 분모를 더한 값이 같습니다. 두 분자의 합은{r},두 분모의 합은{s}이고,나중 분수의 분자는 앞 분수의 분자보다{diff}큽니다. 배열에 적힌 그대로 비교할 때 두 분수는 각각 몇 번째입니까?',
  [base+a,base+b],['앞 분수 순서','나중 분수 순서'],['각 묶음 안에서는 분자와 분모의 합이 같고 묶음 사이에서는 그 합이1씩 커집니다. 따라서 두 분수는 같은 묶음에 있습니다.',f'두 분수의 분자와 분모를 모두 더하면{r}＋{s}＝{r+s}입니다. 각 분수의 합은{r+s}÷2＝{k+2},묶음 길이는{k}개입니다.',f'두 분자의 합과 차로 앞 분자는({r}−{diff})÷2＝{a},나중 분자는{a}＋{diff}＝{b}입니다.',f'앞 묶음까지의 개수는1＋…＋{k-1}＝{base}개입니다. 따라서{base}＋{a}＝{base+a}번째와{base}＋{b}＝{base+b}번째입니다.'],
  '두 분수의 합·차와 같은 묶음 조건을 함께 적용하기','two fraction sums and triangular group inverse')

#2: all new spreads use ordinary even left pages.
for left,leaves in [(24,1),(32,2),(46,3),(58,2),(72,3)]:
 step=2*leaves;after=left+step;delta=after*(after+1)-left*(left+1)
 add(2,'middle',dict(productDifference=delta,leaves=leaves),f'책을 펼쳐 두 쪽수를 곱했습니다. 그 뒤 책장을{leaves}장 더 뒤쪽으로 넘겨 다시 펼친 두 쪽수를 곱했더니 처음 곱보다{delta}커졌습니다. 처음의 왼쪽 쪽수와 오른쪽 쪽수를 구하시오.',
  [left,left+1],['처음 왼쪽 쪽수','처음 오른쪽 쪽수'],[f'책장을{leaves}장 앞으로 넘기면 두 쪽수는 각각{step}씩 커집니다.',f'처음 왼쪽 쪽수를□라 하면 두 곱의 차는(□＋{step})(□＋{step+1})−□(□＋1)＝{2*step}×□＋{step*(step+1)}입니다.',f'따라서 처음 왼쪽은({delta}−{step*(step+1)})÷{2*step}＝{left}쪽입니다.',f'오른쪽은{left+1}쪽이며 실제 차는{after}×{after+1}−{left}×{left+1}＝{delta}입니다.'],
  '넘긴 장수를 두 쪽수의 증가량으로 바꾸고 곱의 차를 역산하기','difference of shifted adjacent products')
for left,gap in [(18,4),(26,6),(34,8),(42,4),(54,6)]:
 other=left+gap;total=left*(left+1)+other*(other+1)
 add(2,'high',dict(leftGap=gap,productSum=total),f'두 책A,B를 각각 펼쳤습니다. B의 왼쪽 쪽수는A의 왼쪽 쪽수보다{gap}크고,각 책의 마주 보는 두 쪽수를 곱한 값을 더하면{total}입니다. 두 책의 왼쪽 쪽수를 A,B 순서로 구하시오.',
  [left,other],['A 왼쪽 쪽수','B 왼쪽 쪽수'],['펼친 책에서 왼쪽은 짝수이고 오른쪽은 그다음 수입니다. 작은 왼쪽 쪽수를 기준으로 두 책의 네 쪽수를 함께 정합니다.',f'A가{left}쪽이면 B는{left}＋{gap}＝{other}쪽입니다. 두 곱의 합은{left}×{left+1}＋{other}×{other+1}＝{total}입니다.',f'A를 두 쪽 작게 잡으면 합은{(left-2)*(left-1)+(other-2)*(other-1)},두 쪽 크게 잡으면{(left+2)*(left+3)+(other+2)*(other+3)}입니다.',f'왼쪽 쪽수가 커질수록 두 곱이 모두 커지므로 다른 답은 없습니다. A는{left}쪽,B는{other}쪽입니다.'],
  '두 책의 쪽수 차와 두 곱의 합을 동시에 만족시키기','strictly increasing sum of two adjacent products')

#3: parallel families remove only within-family intersection pairs.
cut_intro='동그란 피자를 평평하게 둔 채 직선으로 자릅니다. 자른 조각은 옮기거나 겹치지 않으며 조각의 크기는 달라도 됩니다. '
regions=lambda n,groups:1+n*(n+1)//2-sum(k*(k-1)//2 for k in groups)
for n,k in [(6,2),(7,3),(8,2),(8,3),(9,4)]:
 loss=k*(k-1)//2;answer=regions(n,[k])
 add(3,'middle',dict(cuts=n,parallelFamilies=[k]),cut_intro+f'모두{n}번 자르되 그중{k}개의 직선은 서로 평행해야 합니다. 나머지 직선은 서로 평행하지 않고 그{k}개와도 평행하지 않게 자를 수 있습니다. 만들 수 있는 조각은 최대 몇 개입니까?',
  [answer],['최대 조각 수'],[f'평행 조건이 없으면{n}번으로 만들 수 있는 조각은1＋1＋2＋…＋{n}＝{1+n*(n+1)//2}개입니다.',f'평행한{k}개 사이에는 교점이 없어서 서로 다른 두 직선의 짝{k}×{k-1}÷2＝{loss}개만큼 교점이 줄어듭니다.',f'다른 교점은 피자 안의 서로 다른 곳에 놓을 수 있으므로 최대는{1+n*(n+1)//2}−{loss}＝{answer}개입니다.'],
  '서로 평행한 직선끼리 생기지 않는 교점 수를 빼기','maximum regions minus missing intersection pairs')
for students in [37,45,55,68,80]:
 n=next(n for n in range(5,31)if regions(n,[3,2])>=students)
 add(3,'high',dict(students=students,parallelFamilies=[3,2]),cut_intro+f'서로 평행한 직선3개와,그와 다른 방향으로 서로 평행한 직선2개가 반드시 포함되어야 합니다. 더 자르는 직선은 서로와 앞의 두 방향 모두에 평행하지 않게 자를 수 있습니다. {students}명에게 한 조각씩 나누어 주려면 최소 몇 번 잘라야 합니까?',
  [n],['최소 자르는 횟수'],['평행한3개끼리의 짝은3개,다른 방향의 평행한2개끼리의 짝은1개입니다. 두 묶음 사이에는 교점을 만들 수 있으므로 빠지는 교점은3＋1＝4개입니다.',f'따라서 모두N번 잘랐을 때 최대 조각 수는1＋N(N＋1)÷2−4입니다. 적어도 두 묶음의5개 직선은 있어야 합니다.',f'{n-1}번으로는 최대{regions(n-1,[3,2])}개라서{students}명에게 부족합니다. {n}번이면 최대{regions(n,[3,2])}개가 됩니다.',f'이전 직선들과 피자 안의 서로 다른 점에서 만나게 놓을 수 있으므로 이 최대 개수를 만들 수 있습니다. 최소{n}번입니다.'],
  '두 평행 묶음의 손실을 합하고 최대 조각 수의 경계로 최소 횟수 결정하기','two parallel families and inverse region bound')

#4: exact native corner-aligned 6,5,...,1 square layers; six-direction exposure.
src=ROOT/'.private-work/balanced15-20261024/round3-batch1/candidate-staircase-native.png'
target=ROOT/'bank/assets/applied3/staircase-original.png';assert not target.exists();shutil.copyfile(src,target)
directions=[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]
voxels={(x,y,z)for x in range(6)for y in range(6)for z in range(6-max(x,y))}
def exposed(cube,solid):return sum(tuple(cube[i]+d[i]for i in range(3))not in solid for d in directions)
paint={c:exposed(c,voxels)for c in voxels};assert len(voxels)==91 and sum(n==2 for n in paint.values())==24
stair_intro='그림과 같이 각 층이 빈 곳 없는 정사각형이 되도록 쌓기나무를 쌓았습니다. '
low=[('topLayer','맨 위 한 층에 있는 쌓기나무는 몇 개입니까?',1),('bottomLayer','맨 아래 한 층에 있는 쌓기나무는 몇 개입니까?',36),('allCubes','사용한 쌓기나무는 모두 몇 개입니까?',91),('paintFive','아래면을 포함한 겉면에 색을 칠했습니다. 5개의 면이 칠해진 쌓기나무는 몇 개입니까?',1),('paintFour','아래면을 포함한 겉면에 색을 칠했습니다. 4개의 면이 칠해진 쌓기나무는 몇 개입니까?',3)]
low_steps={'topLayer':['위에서부터 한 변의 쌓기나무 수는1,2,3,4,5,6개입니다.','맨 위 층은 한 변이1개인 정사각형입니다.','따라서1×1＝1개입니다.'],
 'bottomLayer':['맨 아래 층은 가로와 세로가 각각6개인 정사각형입니다.','빈 곳 없이 쌓았으므로 바닥의 여섯 줄에 각각6개가 있습니다.','따라서6×6＝36개입니다.'],
 'allCubes':['위에서부터 각 층은1×1,2×2,3×3,4×4,5×5,6×6개입니다.','층별 개수는1,4,9,16,25,36개이고 서로 다른 높이의 쌓기나무입니다.','모두 더하면1＋4＋9＋16＋25＋36＝91개입니다.'],
 'paintFive':['맨 위 쌓기나무는 아래 한 면만 다른 쌓기나무와 맞닿습니다.','나머지 다섯 면은 겉으로 드러나므로 칠해집니다. 다른 쌓기나무는 아래나 옆에 둘 이상 맞닿은 이웃이 있습니다.','따라서5개의 면이 칠해진 것은 맨 위1개입니다.'],
 'paintFour':['4개의 면이 칠해지려면 다른 쌓기나무와 맞닿은 면이2개여야 합니다.','맨 아래 정사각형의 네 모서리 중 맨 위 층까지 이어지는 뒤 모서리에는 위·두 옆의 이웃이 있어 조건에 맞지 않습니다. 나머지 세 모서리는 옆의 두 이웃에만 닿습니다.','이 세 모서리는 위·아래·바깥 두 옆면이 칠해지므로 모두3개입니다.']}
for mode,q,answer in low:add(4,'low',dict(mode=mode),stair_intro+q,[answer],['쌓기나무 수'],low_steps[mode],'층과 맞닿은 이웃을 구별하여 한 가지 성질 세기','literal native square layer count and exposed neighbors')
middle=[('exactOne',lambda c,n:n==1,'칠해진 면이1개인 쌓기나무는 몇 개입니까?'),('atLeastThree',lambda c,n:n>=3,'칠해진 면이3개 이상인 쌓기나무는 몇 개입니까?'),('atMostOne',lambda c,n:n<=1,'칠해진 면이1개 이하인 쌓기나무는 몇 개입니까?'),('bottomTwo',lambda c,n:c[2]==0 and n==2,'맨 아래 층에서 칠해진 면이2개인 쌓기나무는 몇 개입니까?'),('aboveBaseTwo',lambda c,n:c[2]>0 and n==2,'맨 아래 층을 제외한 나머지 층에서 칠해진 면이2개인 쌓기나무는 몇 개입니까?')]
middle_details={
 'exactOne':['밑층의 안쪽4×4＝16개는 아래 한 면만 칠해집니다. 그 위에서 한 변이5·4·3·2개인 층은 뒤쪽 두 변에서 모서리를 뺀 수가 각각3·2·1·0개씩이므로 한 면만 칠해진 수는6·4·2·0개입니다. 맨 위 한 개는5면이 칠해집니다.'],
 'atLeastThree':['밑층에서는3면이 칠해진9개와4면이 칠해진 세 모서리를 합하여12개입니다. 한 변이5·4·3·2개인 위 네 층에는 각각3면이 칠해진 모서리가3개씩 있어12개입니다. 맨 위의5면짜리1개도 넣으면12＋12＋1＝25개입니다.'],
 'atMostOne':['밑층의 안쪽은4×4＝16개이고,그 위 네 층에서1면만 칠해진 것은6＋4＋2＋0＝12개입니다. 따라서1면짜리는28개입니다. 전혀 칠해지지 않은 것은 위층 안쪽의3×3＋2×2＋1×1＝14개이므로28＋14＝42개입니다.'],
 'bottomTwo':['밑층은 아래면이 모두 칠해집니다. 뒤쪽 두 변에서 모서리를 제외한4개씩은 바깥 옆면 하나도 칠해져2면짜리가 됩니다. 앞쪽 두 변은 윗면도 칠해져3면 이상이므로 제외합니다. 따라서4＋4＝8개입니다.'],
 'aboveBaseTwo':['밑층 위에서 한 변이5·4·3·2개인 층을 봅니다. 앞쪽 두 변의 모서리 사이에는 각각3·2·1·0개씩 있고,각 층의 뒤 모서리1개도2면짜리입니다. 따라서 층별로2×3＋1＝7,2×2＋1＝5,2×1＋1＝3,2×0＋1＝1개입니다. 맨 위는5면짜리이므로7＋5＋3＋1＝16개입니다.']}
for mode,pred,q in middle:
 rows=[[str(z+1),str(sum(pred(c,n)for c,n in paint.items()if c[2]==z))]for z in range(6)];answer=sum(int(row[1])for row in rows)
 add(4,'middle',dict(mode=mode),stair_intro+'아래면을 포함한 겉면에 색을 칠했습니다. '+q,[answer],['쌓기나무 수'],['다른 쌓기나무와 맞닿은 면은 칠해지지 않고,아래를 포함하여 밖으로 드러난 면은 칠해집니다. 층은 밑에서부터1층으로 셉니다.','각 층에서 안쪽·변 위·모서리의 이웃 수를 구별하고,물음의 칠한 면 수와 층 조건을 함께 적용합니다.',*middle_details[mode],
 '밑에서부터 조건에 맞는 수는 '+', '.join(row[1]for row in rows)+f'개입니다. 합하면{answer}개입니다.'],
 '칠한 면 수와 층 위치 조건을 함께 분류하기','per-layer native exposed-face census',solutionTable=dict(label='조건에 맞는 층별 개수',headers=['층(밑에서)','개수'],rows=rows))
for remove in range(1,6):
 keep={c for c in voxels if c[2]<6-remove};fresh={c:exposed(c,keep)for c in keep};before=sum(paint[c]==2 for c in keep);after=sum(fresh[c]==2 for c in keep)
 rows=[[str(z+1),str(sum(paint[c]==2 for c in keep if c[2]==z)),str(sum(fresh[c]==2 for c in keep if c[2]==z))]for z in range(6-remove)]
 upper=remove+1;lower=sum(int(r[1])for r in rows[:-1])
 recount=(f'가장 위에 남은 층은 한 변이{upper}개입니다. 새 윗면까지 칠하면 모서리는3면,안쪽은1면,각 변의 모서리 사이만2면이 칠해집니다. 그 수는4×({upper}−2)＝{4*(upper-2)}개입니다. 아래층의{lower}개는 바뀌지 않아 합이{lower}＋{4*(upper-2)}＝{after}개입니다.'if len(rows)>1 else'밑층만 남으면 위와 아래가 모두 칠해집니다. 바깥 변은3면 이상이고 안쪽4×4＝16개만 위·아래2면이 칠해집니다.')
 add(4,'high',dict(removeTopLayers=remove),stair_intro+f'아래면을 포함한 겉면에 색을 칠한 뒤,맨 위부터{remove}개 층의 쌓기나무를 모두 치웠습니다. 새로 드러난 면에 색칠하기 전과 새 면까지 모두 칠한 뒤,남은 쌓기나무 중 칠해진 면이 정확히2개인 것은 각각 몇 개입니까?',
  [before,after],['새 면을 칠하기 전','새 면까지 칠한 뒤'],[f'남은 층은 밑에서부터{6-remove}개입니다. 먼저 칠했던 면의 색은 남아 있지만,치운 쌓기나무와 닿아 있다가 새로 드러난 면은 아직 칠해지지 않았습니다.',
   '처음 칠했던 면이2개인 것 중 치운 층의 쌓기나무만 빼면,새 면을 칠하기 전의 개수가 됩니다. 새로 노출된 면이 생겼다고 칠한 면까지 늘었다고 세지 않습니다.',
   '원래2면짜리는 밑층의 뒤쪽 두 변에서 모서리를 뺀4개씩으로8개,그 위 네 층은 앞쪽 두 변의 안쪽 수에 뒤 모서리1개를 더한7·5·3·1개입니다. 맨 위는5면짜리입니다. 남은 층의 수만 더하면'+'＋'.join(r[1]for r in rows)+f'＝{before}개입니다.',
   '그 뒤 새 면에도 모두 칠하면,남은 쌓기의 맨 위 평평한 정사각형 윗면이 추가로 칠해집니다. 이웃이 있던 면이 없어져 바뀐 개수만 다시 분류합니다.',recount,
   '밑에서부터 두 경우를 센 값이 아래 표입니다. 새 면을 칠하기 전의 개수를 더하면'+str(before)+'개,새 면까지 칠한 뒤의 개수를 더하면'+str(after)+'개입니다.'],
  '원래 칠한 면을 기억한 경우와 제거 뒤 다시 칠한 경우를 구분하기','paint-memory mask versus new exposed boundary',solutionTable=dict(label='제거 뒤 두 색칠 상태 비교',headers=['남은 층','새 면 칠하기 전','새 면까지 칠한 뒤'],rows=rows))

#5: inverse perimeter sums, not a numerical rewrite of the three-layer forward task.
flag_intro='정사각형 모양의 꽃밭 둘레에 가로와 세로 간격이 같도록 여러 겹의 정사각 테두리를 따라 깃발을 꽂았습니다. 각 겹은 한 간격씩 안쪽에 있고 네 모서리에도 깃발이 있습니다. '
for outer in [16,22,30,34,38]:
 total=12*outer-36
 add(5,'middle',dict(total=total,layers=3),flag_intro+f'모두3겹이고 깃발 수가{total}개입니다. 가장 바깥 한 변에 양 끝을 포함하여 몇 개의 깃발이 있습니까?',
  [outer],['바깥 한 변 깃발 수'],['바깥 한 변의 깃발 수를□개라 하면,다음 겹은□−2개,그다음 겹은□−4개입니다.','각 겹의 둘레에서는 모서리를 두 번 센 것을 빼므로 전체는(4□−4)＋(4□−12)＋(4□−20)＝12□−36개입니다.',f'따라서 바깥 한 변은({total}＋36)÷12＝{outer}개입니다.',f'세 겹의 깃발은{4*outer-4},{4*outer-12},{4*outer-20}개로 합이{total}개입니다.'],
  '세 겹의 모서리 중복과 한 변 감소량을 합에서 역산하기','inverse sum of nested square perimeters')
for layers,inner in [(4,6),(5,8),(6,4),(7,6),(8,8)]:
 outer=inner+2*(layers-1);total=4*layers*(outer-layers)
 add(5,'high',dict(total=total,innerSide=inner),flag_intro+f'가장 안쪽 한 변에는 양 끝을 포함하여{inner}개의 깃발이 있고,모든 겹의 깃발은{total}개입니다. 깃발은 몇 겹이며,가장 바깥 한 변에는 양 끝을 포함하여 몇 개가 있습니까?',
  [layers,outer],['겹 수','바깥 한 변 깃발 수'],[f'가장 안쪽부터 한 겹씩 바깥으로 가면 한 변의 깃발 수는{inner},{inner+2},{inner+4},…개입니다. 각 겹의 둘레는 한 변의4배에서 모서리 중복4개를 뺍니다.',
   f'따라서 안쪽부터 둘레의 수는{4*inner-4},{4*inner+4},{4*inner+12},…개로8개씩 늘어납니다.',
   f'{layers}겹까지 더하면'+ '＋'.join(str(4*(inner+2*i)-4)for i in range(layers))+f'＝{total}개입니다. 한 겹 덜 더하면{total-(4*outer-4)}개이고 더 더하면 전체보다 커지므로 겹 수는{layers}개로 정해집니다.',
   f'바깥 한 변은{inner}＋2×({layers}−1)＝{outer}개입니다.'],
  '안쪽 둘레에서 커지는 규칙을 누적하고 겹 수와 바깥 변을 함께 결정하기','positive arithmetic perimeter sequence inverse')

#6: new schedules verified independently; the official source grade remains untouched.
work_intro='일꾼 가,나는 각각 하루에 하는 일의 양이 일정합니다. '
for a,b in [(4,6),(5,8),(6,10),(7,12),(8,14)]:
 total=2*a+b;answer=total//2
 add(6,'low',dict(aDays=a,bDays=b,rateRatio=2),work_intro+f'가가 하루에 하는 일은 나의2배입니다. 가가{a}일 일한 뒤 나가{b}일 일하면 일을 모두 끝냅니다. 가 혼자서는 이 일을 끝내는 데 며칠 걸립니까?',
  [answer],['가 혼자 걸리는 일수'],['나의 하루 일을 한 묶음으로 두면 가는 하루에 두 묶음을 합니다.',f'전체 일은 가의{a}×2묶음과 나의{b}묶음을 합한{total}묶음입니다.',f'가는 하루에2묶음씩 하므로 혼자서는{total}÷2＝{answer}일 걸립니다.'],
  '하루 일의 양을 같은 단위로 바꾸어 합하고 한 사람의 일수로 환산하기','one schedule and a known rate ratio')
for a,b in [(8,5),(12,10),(16,15),(20,20),(24,25)]:
 other_a,other_b=a-4,b+5;total=5*a+4*b
 add(6,'middle',dict(schedules=[[a,b],[other_a,other_b]]),work_intro+f'같은 양의 일을 끝내는 방법은 두 가지입니다. 가가{a}일 일한 뒤 나가{b}일 일하거나,가가{other_a}일 일한 뒤 나가{other_b}일 일하면 끝납니다. 가와 나가 각각 혼자서 끝내는 데 걸리는 일수를 순서대로 구하시오.',
  [total//5,total//4],['가 혼자 걸리는 일수','나 혼자 걸리는 일수'],[f'두 방법에서 가의 일수 차는{a}−{other_a}＝4일,나의 차는{other_b}−{b}＝5일입니다. 따라서 가의4일 일이 나의5일 일과 같습니다.',
   '가의 하루 일을5묶음,나의 하루 일을4묶음으로 두면 두 방법의 일이 같아집니다.',f'전체 일은{a}×5＋{b}×4＝{total}묶음입니다.',f'따라서 가는{total}÷5＝{total//5}일,나는{total}÷4＝{total//4}일입니다. 다른 방법도{other_a}×5＋{other_b}×4＝{total}로 같습니다.'],
  '두 일정의 차에서 하루 일의 양의 비를 찾고 각자의 단독 일수를 계산하기','two independent equal-work schedules')
for total in [36,48,60,72,84]:
 schedules=[[4,6,total-24],[6,3,total-24],[3,9,total-27]]
 add(6,'high',dict(schedules=schedules),'일꾼 가,나,다는 각각 하루에 하는 일의 양이 일정합니다. 표의 세 일정 중 어느 일정으로 일해도 같은 양의 일을 모두 끝냅니다. 각 일정에서는 가,나,다의 순서로 차례로 일합니다. 세 사람이 각각 혼자서 끝내는 데 걸리는 일수를 가,나,다 순서로 구하시오.',
  [total//3,total//2,total],['가 혼자 걸리는 일수','나 혼자 걸리는 일수','다 혼자 걸리는 일수'],['둘째 일정과 첫째 일정에서 다의 일수는 같습니다. 가가2일 더 일하는 양이 나가3일 더 일하는 양과 같으므로 하루 일의 양을 가3묶음,나2묶음으로 둘 수 있습니다.',
   '셋째 일정과 첫째 일정을 비교하면 나의3일 일이 가의1일 일과 다의3일 일을 합한 것과 같습니다. 따라서 다의3일 일은3×2−1×3＝3묶음이고 하루 일은1묶음입니다.',f'첫째 일정의 전체 일은4×3＋6×2＋{total-24}×1＝{total}묶음입니다.',f'따라서 혼자 걸리는 일수는 가{total}÷3＝{total//3}일,나{total}÷2＝{total//2}일,다{total}÷1＝{total}일입니다. 세 일정 모두 같은{total}묶음을 완성합니다.'],
  '세 일정의 차를 두 번 비교하여 세 하루 일의 비와 전체 일을 함께 결정하기','three equal-work equations with ratio elimination',givenTable=dict(label='같은 일을 끝내는 세 일정',headers=['일정','가(일)','나(일)','다(일)'],rows=[[str(i+1)]+list(map(str,row))for i,row in enumerate(schedules)]))

assert len(items)==len({x['id']for x in items})==90
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable']},ensure_ascii=False,sort_keys=True)for x in items})==90
for no in range(1,7):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for x in items:
 if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in legacy if y['id']==x['id']).items())
data=dict(version=version,sourceSet='applied',sourceRound=3,policy=dict(targetVariantsPerSource=15,perLevel=dict(low=5,middle=5,high=5),runtimeGeneration=False,sourceGradeMutation=False,difficulty='new practice point bands; original source points unchanged',studentDifficultyMeasured=False),availableSourceNos=list(range(1,7)),pendingSourceNos=list(range(7,31)),legacyBankSha256=hashlib.sha256(legacy_bytes).hexdigest(),items=items,preservedLegacyCount=20,newAuthoredCount=70)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored Applied3 sources1-6:90items=70new+20approved low;prior banks untouched')

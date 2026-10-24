"""Append levelled groups19–24; keep released270 and original sources unchanged."""
import collections,copy,hashlib,itertools,json,math,subprocess
from fractions import Fraction as F
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied3-balanced15.json';BASE='79631fd7531a7aabb063aae9799aa08b2c552ab4'
before=FILE.read_bytes();assert before==subprocess.check_output(['git','show',BASE+':bank/data/applied3-balanced15.json'],cwd=ROOT)
data=json.loads(before);assert len(data['items'])==270 and all(x['reviewStatus']=='verified'for x in data['items']);prior=copy.deepcopy(data['items']);items=data['items'];version='20261024-applied3-balanced15-r4';old=json.loads((ROOT/'bank/data/applied3-expanded.json').read_text())['items']
for no,level in [(20,'middle'),(22,'middle'),(23,'high')]:
 for src in [x for x in old if x['sourceNo']==no][:5]:
  x=copy.deepcopy(src);assert x['pointBand']==('4.2'if no==23 else'3.4');x.update(practiceLevel=level,sourcePointBand=x['pointBand'],preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)
meta={19:('경우의 수','수의 배치와 합','삼각진의 꼭짓점과 배치 경우'),20:('수와 식','반복수의 계산','분배법칙과 빌림이 있는 자리 합'),21:('경우의 수','숫자 카드와 연산','서로 다른 네 카드의 나눗셈식'),22:('수와 식','달력과 주기','두 기간의 용돈과 시작 요일'),23:('수와 식','속력과 만남','이동 시간과 속력 비의 단계 연습'),24:('도형','격자 줄의 합','원본 네 줄과 빈칸 값의 역산')}
roles={19:dict(low='고정 아홉 수의 합과 세 꼭짓점 중복을 관찰',middle='한 꼭짓점이 정해진 경우 맞은편 두 안쪽 수의 합 결정',high='꼭짓점 순서·안쪽 짝 분할·좌우 순서·대칭을 분리해 전체 경우 계산'),20:dict(low='한 반복수에10의 거듭제곱을 곱한 자리 이동 관찰',high='반복수 곱을 자릿값 이동으로 바꾸고 빌림 뒤 자리 합에서 원래 길이 역산'),21:dict(low='나누는 수 하나를 고정해 서로 다른 네 카드 후보 검사',middle='한 카드 제외 조건과 곱셈 검산으로 전체 유효 식 세기',high='추가 수 조건을 교차하고 유효 식 수와 피제수 합을 함께 계산'),22:dict(low='시작 요일이 주어진 연속 기간의 용돈을 정방향 계산',high='두 기간의 합과평일:토요일2:1 관계로 시작 요일과 하루 금액 동시 역산'),23:dict(low='속력이 주어졌을 때 정지 시간을 빼고 두 거리 합 계산',middle='정지 없는 만남에서 전체 시간과 속력 비로 두 속력 역산'),24:dict(low='원본 빈칸 하나 또는 공통 합을 알려 주고 다른 한 값 결정',middle='추가로 주어진 한 값으로 남은 빈칸들의 관계를 차례로 역산',high='원본 네 빈칸을 결정한 뒤 값 변화와 변화 후 합으로 새 네 값 역산')}
assets={19:dict(kind='raster',src='assets/applied3/triangle-original.png',description='원문19번의1~9카드와각변네원·세색칠꼭짓점·합23그대로.'),21:dict(kind='raster',src='assets/applied3/division-cards-teacher-original.png',description='현행21번카드글리프CIDFFFF손상.교사답안같은21번의빈네카드2÷1=1도식만그대로추출.정답·풀이없음.'),24:dict(kind='raster',src='assets/applied3/equal-lines-original.png',description='원문24번의13칸·고정9수·A/B/C/D·가/나/다/라줄·색·선그대로.')}
def add(no,level,p,text,answer,labels,steps,point,method,**extra):
 v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items);area,sub,detail=meta[no];source='3.4'if no<=22 else'4.2'
 axes=dict(prerequisite='원문 꼭짓점 중복·분배법칙·네 카드·7일 주기·거리와 시간·같은 줄 합',reasoning=roles[no][level],conditionTracking='위치/처음과변화뒤/서로다른카드/두기간/실제이동시간을구분',caseSplitting='배치 위치·대칭·제외 카드·후보 시작요일을 중복 없이 구분',computation='단순 수치 확대가 아니라 정방향/역방향·추가조건·빌림·경우 분류를 결합',representation='원본삼각진/13칸그림보존,손상카드는교사실제빈도식보존;새풀이그림문제에추가없음',reading='필수조건은자연스러운지문과실제계산식안에만',visualCues='문제아래조건요약·힌트·완성그림없음',shortcuts='세꼭짓점중복·끝0/빌림·카드네장비중복·원단위정수·정지없는시점·변화전후범위를구분')
 x=dict(id=f'applied3-q{no:02d}-{level}-v{v}',genId=f'applied3-q{no:02d}',sourceSet='applied',sourceRound=3,sourceNo=no,variantNo=v,area=area,subarea=sub,detailType=detail,learningLocation=f'활용 3회 · 원문 {no}번 · {detail}',learningPoint=point,practiceLevel=level,sourcePointBand=source,pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='기초 보완'if level=='low'or no>=23 else'단계형 확장',practiceStorageVersion=version,reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],solutionSteps=steps,solution=' '.join(steps),difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'or no>=23 and level=='middle'else'extension',measured=False,axes=axes),verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied3-balanced15-independent-validate.py',sourceExamPage=4 if no==19 else 5,sourceAnswerPage=4 if no==19 else 5,studentDifficultyMeasured=False))
 if no in assets:x['asset']=copy.deepcopy(assets[no])
 x.update(extra);assert len(steps)>=3;items.append(x)

#19: native triangle positions:top,2left-inner,left-bottom,2bottom-inner,right-bottom,2right-inner.
tri=[]
for vertices in itertools.permutations([7,8,9]):
 for inner in itertools.permutations(range(1,7)):
  t=(vertices[0],inner[0],inner[1],vertices[1],inner[2],inner[3],vertices[2],inner[4],inner[5])
  if t[0]+t[1]+t[2]+t[3]==t[3]+t[4]+t[5]+t[6]==t[6]+t[7]+t[8]+t[0]==23:tri.append(t)
assert len(tri)==96
base19=['1부터9까지의 합은45입니다. 세 변의 합을 더하면23×3＝69입니다.','세 꼭짓점은 두 번씩,나머지 여섯 원은 한 번씩 더해지므로 꼭짓점 합은69−45＝24입니다. 서로 다른1~9의 세 수로24를 만드는 꼭짓점은7·8·9뿐입니다.']
for mode,ask,ans in [('allSum','아홉 원에 넣는 수의 합은 얼마입니까?',45),('vertexSum','색칠한 세 꼭짓점에 넣는 수의 합은 얼마입니까?',24),('innerSum','색칠하지 않은 여섯 원에 넣는 수의 합은 얼마입니까?',21),('difference','꼭짓점 세 수의 합은 나머지 여섯 수의 합보다 얼마 더 큽니까?',3),('minVertex','색칠한 세 꼭짓점에 넣는 수 중 가장 작은 수는 무엇입니까?',7)]:
 tail=dict(allSum='따라서 모든 원의 합은45입니다.',vertexSum='꼭짓점 합은24입니다.',innerSum='나머지 합은45−24＝21입니다.',difference='나머지 합은21이므로24−21＝3 더 큽니다.',minVertex='세 꼭짓점은7·8·9이므로 가장 작은 수는7입니다.')[mode]
 add(19,'low',dict(mode=mode),'그림의 아홉 원에1부터9까지를 한 번씩 넣어 각 변 위 네 수의 합을23으로 만듭니다. '+ask,[ans],['답의 수'],base19+[tail],'변의 합에서 꼭짓점만 두 번 세어짐을 구별하기','native triangle incidence sums')
for vertex,value,edge,idx in [('맨 위',7,'아래 가로변',0),('맨 위',8,'아래 가로변',0),('맨 아래 왼쪽',9,'오른쪽 빗변',3),('맨 아래 오른쪽',7,'왼쪽 빗변',6),('맨 아래 오른쪽',8,'왼쪽 빗변',6)]:
 ans=value-1
 add(19,'middle',dict(givenVertex=idx,givenValue=value),'그림의 아홉 원에1부터9까지를 한 번씩 넣어 각 변 위 네 수의 합을23으로 만듭니다. '+f'{vertex} 꼭짓점에는{value}를 넣었습니다. {edge}에서 꼭짓점을 제외한 두 원에 넣는 수의 합은 얼마입니까?',[ans],['두 원의 합'],base19+[f'주어진 꼭짓점{value}의 맞은편 변 양 끝 꼭짓점의 합은24−{value}＝{24-value}입니다.',f'그 변의 합은23이므로 안쪽 두 원의 합은23−{24-value}＝{ans}입니다.'],'한 꼭짓점과 맞은편 변의 안쪽 두 수의 관계 찾기','opposite vertex complement in fixed triangle')
for mode,extra in [('all',''),('top7','맨 위 꼭짓점에는7을 넣습니다. '),('top7left8','맨 위에는7,맨 아래 왼쪽 꼭짓점에는8을 넣습니다. '),('top7near1','맨 위 꼭짓점에는7,왼쪽 빗변에서 위에서 두 번째 원에는1을 넣습니다. '),('dihedral','회전하거나 뒤집어서 같아지는 배치는 한 가지로 셉니다. ')]:
 selected=[t for t in tri if(mode not in ['top7','top7left8','top7near1']or t[0]==7)and(mode!='top7left8'or t[3]==8)and(mode!='top7near1'or t[1]==1)];ans=len(selected)//6 if mode=='dihedral'else len(selected)
 steps=base19+['꼭짓점 값에 따라 맞은편 안쪽 두 원의 합은6·7·8입니다.1~6을 겹치지 않게 짝지으면 (1,5)/(3,4)/(2,6) 또는 (2,4)/(1,6)/(3,5)의 두 묶음뿐입니다. 각 쌍은 그 합6·7·8의 변에 놓습니다.','꼭짓점 위치가 정해지면 두 묶음 중 하나를 고르고,세 변의 안쪽 두 수는 각각 순서를 바꿀 수 있어2×2×2×2＝16가지입니다.']
 if mode=='all':steps+=['7·8·9를 세 꼭짓점에 놓는 순서는6가지이므로6×16＝96가지입니다.']
 elif mode=='top7':steps+=['맨 위7은 고정이고 아래 두 꼭짓점의8·9 순서만2가지이므로2×16＝32가지입니다.']
 elif mode=='top7left8':steps+=['두 꼭짓점7·8이 고정되면 나머지는9로 정해집니다. 따라서16가지입니다.']
 elif mode=='top7near1':steps+=['왼쪽 안쪽에1이 있으려면 왼쪽 두 수의 합은7이고 그 짝은(1,6)이어야 합니다. 따라서 오른쪽 꼭짓점은8,왼쪽 꼭짓점은9입니다. 왼쪽 순서와 짝 묶음이 모두 정해지고 나머지 두 변의 순서만2가지씩이어서4가지입니다.']
 else:steps+=['위치가 다른 전체 배치는96가지입니다. 서로 다른 아홉 수를 썼으므로 한 배치를 세 방향으로 돌린 것과 각각 뒤집은 것은 모두 다른6개입니다. 이를 같은 것으로 묶으면96÷6＝16가지입니다.']
 add(19,'high',dict(mode=mode),'그림의 아홉 원에1부터9까지를 한 번씩 넣어 각 변 위 네 수의 합을23으로 만듭니다. '+extra+('빈 원을 채우는 방법은 모두 몇 가지입니까?'if mode=='dihedral'else'원 위치가 다르면 다른 배치로 셀 때,조건에 맞게 채우는 방법은 모두 몇 가지입니까?'),[ans],['배치 수'],steps,'꼭짓점 순서·짝 분할·변 안 순서와 대칭의 중복을 따로 세기','enumerated native triangle placements and symmetry orbits')

#20: repdigit factor identity, then borrow across the zero block.
for n in [4,5,7,8,9]:
 add(20,'low',dict(digits=n), '다음 식을 계산한 수의 각 자리 숫자의 합을 구하시오.',[3*n],['각 자리 숫자의 합'],[f'10을{n}번 곱한 수인{10**n}을 곱하면 원래 숫자의 오른쪽에0이{n}개 붙습니다.',f'따라서 결과는3이{n}개인 부분과 그 뒤의0들로 이루어집니다.',f'0은 자리 합에 영향을 주지 않으므로3×{n}＝{3*n}입니다.'],'반복수에10의 거듭제곱을 곱한 자리 이동 관찰하기','repdigit and decimal shift',promptDataLines=[str(int('3'*n))+' × '+str(10**n)])
for n,k in [(8,2),(9,3),(11,4),(12,5),(14,6)]:
 digit_sum=12*n-9*k-1
 add(20,'high',dict(subtractPower=k,digitSum=digit_sum),f'3을 두 개 이상 이어 써서 만든 자연수N이 있습니다. 다음 식의 계산 결과는 양수이고 각 자리 숫자의 합이{digit_sum}입니다. N의 자릿수와 계산 결과의 자릿수를 차례로 구하시오.',[n,2*n],['N의 자릿수','계산 결과의 자릿수'],[f'N이{k}자리 이하라면 결과도{2*k}자리 이하이므로 자리 합은{18*k} 이하입니다. 주어진{digit_sum}이 더 크므로 N은{k}자리보다 깁니다.','N을3이 이어진 n자리 수라 하면3N＋1은1뒤에0이n개 붙은 수입니다. 따라서N×(3N＋1)은N뒤에0이n개 붙은 수입니다.',f'여기서{10**k}을 빼면 앞의N은1작아져 마지막3이2가 됩니다. 뒤의n자리에는9가n−{k}개,그 뒤0이{k}개 생깁니다. 자리 합은(3n−1)＋9(n−{k})＝12n−{9*k+1}입니다.',f'12n−{9*k+1}＝{digit_sum}이므로12n＝{digit_sum+9*k+1},n＝{n}입니다. N은{n}자리이고,앞부분N−1도{n}자리여서 전체는{2*n}자리입니다.'],'분배법칙과0을 건너는 빌림 뒤 자리 합으로 반복수 길이 역산하기','repdigit factor identity and borrow-block inverse',promptDataLines=[f'N × (3 × N ＋ 1) − {10**k}'])

#21: source printed card glyphs are corrupt; exact empty teacher diagram, no redrawing.
def card_solutions(exclude=None,divisor=None,mode=None):
 out=[]
 for a,b,c,d in itertools.permutations(range(1,10),4):
  p=10*a+b
  if p!=c*d or exclude in [a,b,c,d]or divisor is not None and c!=divisor:continue
  if mode=='less'and not c<d:continue
  if mode=='odd'and p%2!=1:continue
  if mode=='multiple3'and p%3:continue
  if mode=='sum18'and a+b+c+d!=18:continue
  if mode=='largeLess'and not(p>=30 and c<d):continue
  out.append([p,c,d])
 return out
assert len(card_solutions())==32
for divisor in [2,3,4,6,7]:
 sol=card_solutions(divisor=divisor)
 add(21,'low',dict(divisor=divisor),'1부터9까지 적힌 숫자 카드가 한 장씩 있습니다. 서로 다른 네 장을 골라 그림의 나머지 없는 나눗셈식을 만듭니다. '+f'나누는 수를{divisor}로 정했을 때 만들 수 있는 식은 모두 몇 개입니까?',[len(sol)],['식의 수'],[f'몫을1부터9까지 하나씩 정해{divisor}와 곱합니다. 곱이 두 자리여야 그림의 두 칸을 채울 수 있습니다.','십의 자리·일의 자리·나누는 수·몫의 네 숫자가 모두 다른 식만 남깁니다. 같은 카드가 두 번 필요한 식은 제외합니다.','조건에 맞는 식은 '+', '.join(f'{p}÷{c}＝{d}'for p,c,d in sol)+f'로 모두{len(sol)}개입니다.'],'고정한 나누는 수의 곱셈표에서 네 카드 비중복 검사하기','one-divisor card permutation filter')
for exclude in [1,2,3,4,5]:
 sol=card_solutions(exclude=exclude);table=[[str(c),', '.join(f'{p}÷{c}＝{d}'for p,cc,d in sol if cc==c)or'없음']for c in range(2,10)]
 add(21,'middle',dict(excludedDigit=exclude),'1부터9까지 적힌 숫자 카드가 한 장씩 있습니다. '+f'{exclude} 카드는 사용하지 않고 나머지 중 서로 다른 네 장을 골라 그림의 나머지 없는 나눗셈식을 만듭니다. 만들 수 있는 식은 모두 몇 개입니까?',[len(sol)],['식의 수'],['나누는 수와 몫을 곱해 피제수의 두 숫자를 정합니다. 나누는 수1이면 피제수는 몫과 같은 한 자리 수가 되어 그림과 맞지 않습니다.',f'{exclude}가 어느 자리에도 나오지 않고 네 숫자가 모두 다른 식만 나누는 수별로 분류한 것이 답안 표입니다.',f'표의 각 식은 나누는 수와 몫이 정해져 있어 서로 다릅니다. 모두 세면{len(sol)}개입니다.'],'제외 카드와 네 자리의 비중복을 함께 적용해 식을 분류하기','forbidden digit and exact distinct-card arithmetic',solutionTable=dict(headers=['나누는 수','가능한 식'],rows=table))
for mode,condition in [('less','나누는 수가 몫보다 작습니다.'),('odd','피제수는 홀수입니다.'),('multiple3','피제수는3의 배수입니다.'),('sum18','사용한 네 카드에 적힌 수의 합이18입니다.'),('largeLess','피제수는30이상이고 나누는 수가 몫보다 작습니다.')]:
 sol=card_solutions(mode=mode);assert sol
 add(21,'high',dict(mode=mode),'1부터9까지 적힌 숫자 카드가 한 장씩 있습니다. 서로 다른 네 장으로 그림의 나머지 없는 나눗셈식을 만듭니다. '+condition+' 가능한 식의 수와,그 식들에 나오는 피제수를 모두 더한 값을 차례로 구하시오. 같은 피제수가 서로 다른 식에 나오면 나올 때마다 더합니다.',[len(sol),sum(p for p,c,d in sol)],['식의 수','피제수의 합'],['두 자리 피제수를 나누는 수와 몫의 곱으로 구하고,그 네 카드가 서로 다른지 먼저 확인합니다.','주어진 추가 조건을 통과한 식만 답안 표에 남깁니다. 식이 다르면 피제수가 같아도 별도로 셉니다.',f'표의 식은{len(sol)}개입니다. 피제수를 식마다 한 번씩 더하면'+ '＋'.join(str(p)for p,c,d in sol)+f'＝{sum(p for p,c,d in sol)}입니다.'],'카드 비중복·추가 조건·같은 피제수의 중복 등장 횟수를 구분하기','constrained ordered-card equations and aggregate dividends',solutionTable=dict(headers=['나누는 수','가능한 식','피제수 합'],rows=[[str(c),', '.join(f'{p}÷{cc}＝{d}'for p,cc,d in sol if cc==c),str(sum(p for p,cc,d in sol if cc==c))]for c in range(2,10)if any(cc==c for p,cc,d in sol)]))

#22: weekly rate ratio and two observational windows; no calendar hints under stem.
week=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];daily=[0,2,2,2,2,2,1]
def coeff(start,days):return sum(daily[(start+i)%7]for i in range(days))
for start,days in [(0,8),(1,9),(2,10),(3,11),(4,12)]:
 total=100*coeff(start,days);weeks,rem=divmod(days,7);tail=[week[(start+i)%7]for i in range(rem)]
 add(22,'low',dict(start=start,days=days),'한 학생은 매주 월요일부터 금요일까지 하루200원,토요일에는100원을 받고 일요일에는 받지 않습니다. '+f'{week[start]}부터 연속{days}일 동안 받는 용돈은 모두 얼마입니까?',[total],['용돈 합(원)'],[f'연속7일 동안의 합은200×5＋100＝1100원입니다. {days}일은{weeks}주와{rem}일입니다.',f'온전한 주를 뺀 나머지는 '+', '.join(tail)+f'이고 그 기간의 합은{total-weeks*1100}원입니다.',f'따라서1100×{weeks}＋{total-weeks*1100}＝{total}원입니다.'],'정해진 시작 요일에서 주기와 남은 날짜를 정방향 계산하기','literal weekly payments from known start')
for start,u in [(0,100),(2,150),(4,200),(5,250),(6,300)]:
 found=None
 for d1 in range(15,22):
  for d2 in range(d1+1,d1+7):
   t1=u*coeff(start,d1);t2=u*coeff(start,d2);candidates=[(s,F(t1,coeff(s,d1)))for s in range(7)if F(t1,coeff(s,d1)).denominator==1 and F(t1,coeff(s,d1))*coeff(s,d2)==t2]
   if candidates==[(start,F(u))]:found=(d1,d2,t1,t2);break
  if found:break
 assert found;d1,d2,t1,t2=found
 table=[[week[s],str(coeff(s,d1)),str(coeff(s,d2)),'일치'if F(t1,coeff(s,d1))*coeff(s,d2)==t2 else'불일치']for s in range(7)]
 add(22,'high',dict(days1=d1,days2=d2,total1=t1,total2=t2),'한 학생은 월요일부터 금요일까지 매일 같은 금액의 용돈을 받고,토요일에는 그 절반을 받으며 일요일에는 받지 않습니다. 매일 받는 금액은 정수 원입니다. '+f'어느 날부터 연속{d1}일 동안 받은 합은{t1}원이고,같은 날부터 연속{d2}일 동안 받은 합은{t2}원입니다. 시작 요일,평일 하루 용돈,토요일 용돈을 차례로 구하시오.',[week[start],2*u,u],['시작 요일','평일 하루(원)','토요일(원)'],['토요일 용돈을 한 묶음으로 두면 평일은 두 묶음,일요일은0묶음입니다. 각 시작 요일에서 두 기간의 묶음 수를 각각 셉니다.',f'답안 표에서 첫 기간 합{t1}원을 첫 기간 묶음 수로 나누고 둘째 기간 묶음 수를 곱해 봅니다. 그 값이{t2}원인 요일만 두 기간 조건을 모두 만족합니다.',f'두 조건이 맞는 것은{week[start]}뿐입니다. 한 묶음은{t1}÷{coeff(start,d1)}＝{u}원이므로 평일은{2*u}원,토요일은{u}원입니다. 두 기간 모두 같은 한 묶음 금액을 사용해야 합니다.'],'두 기간에 같은 주기와 금액을 적용해 요일과 하루 금액을 동시에 찾기','two exact cyclic-window sums with positive integer rate',solutionTable=dict(headers=['시작','첫 기간 묶음','둘째 기간 묶음','둘째 합 대조'],rows=table))

#23: preserve five high originals; lower levels remove an unknown or the stop.
for walk,ratio,hours,stop in [(4,2,3,1),(5,3,4,1),(6,2,5,2),(7,3,3,1),(8,2,4,2)]:
 distance=walk*(hours+ratio*(hours-stop))
 add(23,'low',dict(walk=walk,ratio=ratio,hours=hours,stop=stop),'두 사람이 동시에 출발하여 서로를 향해 갑니다. '+f'걷는 사람은 시속{walk}km로 쉬지 않고,자전거는 이동할 때 걷는 속력의{ratio}배입니다. 자전거는 도중에 수리하느라{stop}시간 멈췄고,출발{hours}시간 뒤 수리가 끝난 상태에서 두 사람이 만났습니다. 처음 두 지점 사이는 몇km입니까?',[distance],['처음 거리(km)'],[f'걷는 거리는{walk}×{hours}＝{walk*hours}km입니다.',f'자전거 이동 속력은{walk}×{ratio}＝{walk*ratio}km이고,실제 이동 시간은{hours}−{stop}＝{hours-stop}시간입니다. 자전거 거리는{walk*ratio}×{hours-stop}＝{walk*ratio*(hours-stop)}km입니다.',f'서로 마주 와서 만났으므로 처음 거리는 두 이동 거리를 더한{distance}km입니다.'],'주어진 속력과 실제 이동 시간으로 처음 거리 정방향 계산하기','effective travel time and two explicit distances')
for walk,ratio,hours in [(5,2,3),(6,3,2),(7,2,4),(8,3,3),(9,2,5)]:
 distance=walk*(ratio+1)*hours
 add(23,'middle',dict(distance=distance,ratio=ratio,hours=hours),'두 사람이 떨어진 두 지점에서 동시에 출발하여 서로를 향해 쉬지 않고 갑니다. '+f'자전거 속력은 걷는 속력의{ratio}배이고,두 속력은 일정합니다. 두 지점은{distance}km 떨어져 있고{hours}시간 뒤 만났다면 자전거와 걷는 속력을 차례로 구하시오.',[walk*ratio,walk],['자전거(km/h)','걷기(km/h)'],[f'멈추지 않았으므로 두 사람 모두{hours}시간씩 이동했습니다. 두 속력의 합은{distance}÷{hours}＝{walk*(ratio+1)}km/h입니다.',f'걷는 속력을 한 묶음으로 두면 자전거는{ratio}묶음이고 합은{ratio+1}묶음입니다.',f'걷는 속력은{walk*(ratio+1)}÷{ratio+1}＝{walk}km/h,자전거는{walk}×{ratio}＝{walk*ratio}km/h입니다.'],'정지 없는 만남의 합속력과 비로 두 속력 역산하기','constant speeds without stop and exact ratio')

#24: native labels and nine fixed numbers stay unchanged; all later transformations are in stem.
base24=['나 줄은B＋20,다 줄은C＋23입니다. 같은 합이므로 C＝B−3입니다. 라 줄과 나 줄을 비교하면 A＋C＝10이므로 A＝13−B입니다.','가 줄의A＋8＋D도B＋20과 같아야 하므로 D＝2B−1입니다. 처음 비어 있는 네 수는1~13에서 이미 쓴 수를 뺀4·6·7·13입니다.','B의 후보4·6·7·13을 각각 대입하면 A,B,C,D가 그 네 수를 한 번씩 쓰는 경우는 A6·B7·C4·D13뿐입니다. 네 줄의 공통 합은27입니다.']
values={'A':6,'B':7,'C':4,'D':13,'sum':27}
for known,target in [('B','A'),('B','C'),('B','D'),('A','C'),('sum','B')]:
 given=f'네 줄의 공통 합은27입니다.'if known=='sum'else f'{known}에는{values[known]}을 넣습니다.'
 add(24,'low',dict(known=known,target=target),'그림의 빈칸에 남은 수를 넣어1부터13까지를 한 번씩 쓰고 가~라 줄의 합을 모두 같게 만듭니다. '+given+f' {target}에 들어갈 수를 구하시오.',[values[target]],[target],base24+[f'주어진{("공통 합"if known=="sum"else known)} 조건과 맞는{target}의 값은{values[target]}입니다.'],'추가로 알려 준 한 값으로 줄의 합과 다른 한 칸 연결하기','fixed native row equations with one extra datum')
for known in ['A','B','C','D','sum']:
 targets=[k for k in 'ABCD'if k!=known];given='네 줄의 공통 합은27입니다.'if known=='sum'else f'{known}에{values[known]}을 넣는다고 알려져 있습니다.'
 add(24,'middle',dict(known=known,targets=targets),'그림의 빈칸에 남은 수를 넣어1부터13까지를 한 번씩 쓰고 가~라 줄의 합을 모두 같게 만듭니다. '+given+' '+', '.join(targets)+'의 값을 차례로 구하시오.',[values[k]for k in targets],targets,base24+[f'따라서 묻는 순서{", ".join(targets)}의 값은'+', '.join(str(values[k])for k in targets)+'입니다.'],'한 칸 또는 공통 합을 기준으로 다른 줄의 미지 값을 차례로 결정하기','native row relations with reduced unknown set')
for t in [1,2,3,4,5]:
 total=30+3*t;ans=[6-t,7+t,4+t,13+2*t]
 add(24,'high',dict(afterUnknownSum=total),'처음에는 그림의 빈칸을 채워1부터13까지를 한 번씩 쓰고 가~라 네 줄의 합을 같게 했습니다. 그 뒤 빈칸 네 값만 바꿉니다. A에서 어떤 양의 정수를 빼고,B와 C에는 각각 그 정수를 더하며,D에는 그 정수의 두 배를 더했습니다. '+f'바뀐 네 값의 합이{total}이라면 바뀐 A,B,C,D의 값을 차례로 구하시오.',ans,list('ABCD'),base24+[f'처음 네 값의 합은6＋7＋4＋13＝30입니다. 빼고 더하는 수를 한 몫이라 하면 네 값의 합은−1＋1＋1＋2＝3몫만큼 늘어납니다.',f'한 몫은({total}−30)÷3＝{t}입니다. 따라서 바뀐 값은 A{6-t},B{7+t},C{4+t},D{13+2*t}입니다. 원래부터 쓰여 있던 나머지 아홉 칸은 바꾸지 않습니다.'],'원본 네 칸의 관계를 푼 뒤 변화 후 합으로 공통 변화량 역산하기','native exact filling plus affine four-value change inverse')

for x in items:
 if x['sourceNo']==21 and not x.get('preservedApprovedId'):
  x['verification'].update(sourceDiagram='teacher page5 empty four-card sketch;printedF12CID65535 corrupt',sourceAnswerCrop=[148,617,335,669],sourceOriginalGradeUnchanged=True)
 if x['sourceNo']==24 and x['practiceLevel']in ['low','middle']:
  p=x['verification']['parameters'];known=p['known']
  if known=='B':steps=['B가7이므로 나 줄의 합은5＋3＋7＋2＋10＝27입니다. 다 줄에서 C는27−11−12＝4입니다.','라 줄에서 A는27−9−7−1−4＝6입니다. 가 줄에서 D는27−6−8＝13입니다.']
  elif known=='A':steps=['라 줄의 합은 A＋9＋B＋1＋C이고 나 줄은B＋20입니다. B를 빼고 비교하면 A＋C＝10입니다.','A가6이므로 C＝10−6＝4입니다. 나 줄과 다 줄을 비교하면 B＋20＝4＋23이므로 B＝7입니다.','공통 합은27이고 가 줄에서 D＝27−6−8＝13입니다.']
  elif known=='C':steps=['C가4이므로 다 줄의 합은4＋11＋12＝27입니다. 나 줄에서는 B＝27−20＝7입니다.','라 줄에서는 A＝27−9−7−1−4＝6입니다. 가 줄에서는 D＝27−6−8＝13입니다.']
  elif known=='D':steps=['나 줄과 다 줄에서 C＝B−3이고,라 줄과 나 줄에서 A＋C＝10이므로 A＝13−B입니다.','가 줄과 나 줄을 비교하면 A＋8＋13＝B＋20입니다. A를 바꾸어 넣으면34−B＝B＋20이어서 B＝7입니다.','따라서 C＝7−3＝4이고 A＝13−7＝6입니다.']
  else:steps=['알려 준 네 줄의 공통 합은27입니다. 나 줄은B＋20이므로 B＝27−20＝7입니다.','다 줄에서 C＝27−11−12＝4입니다. 라 줄에서 A＝27−9−7−1−4＝6입니다.','가 줄에서 D＝27−6−8＝13입니다.']
  targets=[p['target']]if x['practiceLevel']=='low'else p['targets'];steps.append('따라서 '+', '.join(targets)+'의 값은'+', '.join(str(values[k])for k in targets)+'입니다.');x['solutionSteps']=steps;x['solution']=' '.join(steps)

assert len(items)==len({x['id']for x in items})==360 and items[:270]==prior
for no in range(1,25):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable']},ensure_ascii=False,sort_keys=True)for x in items})==360
for x in items:
 if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in old if y['id']==x['id']).items())
data.update(version=version,items=items,availableSourceNos=list(range(1,25)),pendingSourceNos=list(range(25,31)),preservedLegacyCount=65,newAuthoredCount=295);data.pop('reviewSummary',None)
data['sourceEditionNotes']={'21':'PrintedF12CID65535 outside embedded font49284glyphs in current/alternatePDF. Exact empty four-card teacher sketch used without redrawing or answer cues. Current original exam/grade unchanged.'}
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('Authored360 Applied3:prior270exact;new90slots75new+15approved;independent/output gates pending')

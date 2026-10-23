"""Current Applied4 PDF variants. Protect source grades and hold edition mismatch q4."""
import itertools as it,json,math,calendar
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[2];items=[]
TYPES={5:('수와 식','분수 배열의 규칙','분모별 내림차순 분수의 위치'),6:('수와 식','연산 규칙','세 기호의 중첩 연산'),7:('수와 식','합과 차의 관계','주고 먹은 뒤 두 배가 되는 사탕'),8:('수와 식','분수와 거꾸로 풀기','남은 양의 절반을 네 번 사용하기'),10:('수와 식','삼각 배열의 색','번갈아 쌓은 두 색의 개수 차'),13:('수와 식','과부족과 합','두 사람의 부족액과 사고 남은 돈'),17:('수와 식','자릿수의 주기','연속 자연수 전체의 숫자 합'),19:('수와 식','공동 구매와 분담','선물 분담 인원 변화와 추가 금액'),20:('경우의 수','자릿수와 순서','숫자가 감소하는 네 자리 수의 순위'),23:('수와 식','배수와 숫자 세기','배수 목록의 특정 숫자 등장 횟수'),28:('수와 식','달력의 숫자 합','월 이름과 날짜의 숫자를 따로 세기'),29:('경우의 수','배치와 최댓값','홀수인 두 세 자리 수의 최대 곱')}
FIG={6:'operator-examples',10:'alternating-stones'}
def frac(a,b):return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{a}</mn><mn>{b}</mn></mfrac></math>'
def add(no,p,text,answer,steps,focus,method,**extra):
 v=1+sum(x['sourceNo']==no for x in items);area,sub,detail=TYPES[no];point='2.7' if no<=12 else '3.4' if no<=22 else '4.2';page=1 if no<=6 else 2 if no<=12 else 3 if no<=16 else 4 if no<=22 else 5 if no<=26 else 6
 x=dict(id=f'applied4-q{no:02d}-v{v}',genId=f'applied4-q{no:02d}',sourceSet='applied',sourceRound=4,sourceNo=no,variantNo=v,reviewStatus='pending-output-review',area=area,subarea=sub,detailType=detail,pointBand=point,text=text,answer=str(answer),answerParts=[answer],answerLabels=['답'],acceptedAnswers=[str(answer)],answerContract='ordered-parts',solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,learningLocation=f'활용 4회 · 원문 {no}번 · {sub}',verification={'primaryMethod':method,'parameters':p,'independentSuite':'qa/applied4-independent-validate.py','sourceExamPage':page,'sourceAnswerPage':no,'studentDifficultyMeasured':False},difficultyEvidence={'basis':'source-point-band','label':{'2.7':'하','3.4':'중','4.2':'상'}[point],'sourceReasoningPreserved':True,'measuredVariantRate':None})
 if no in FIG:x['asset']={'kind':'raster','src':f'assets/applied4/{FIG[no]}.png','description':detail+'의 원문 그림'}
 x.update(extra);items.append(x)
for k,j in [(8,3),(9,4),(10,8),(11,2),(13,9),(14,7),(15,11),(16,6),(17,12)]:
 n=k*(k-1)//2+j;num=k-j+1;den=k+1;ans=den-num
 add(5,{'index':n},f'다음은 일정한 규칙에 따라 분수를 늘어놓은 것입니다. 앞에서부터 {n}번째 분수의 분모에서 분자를 뺀 값을 구하시오.',ans,[f'분모가 같은 분수를 묶으면 묶음의 길이는 1, 2, 3, …이고 분모는 2, 3, 4, …입니다. 같은 묶음 안에서는 분자가 큰 수부터 1씩 줄어듭니다.',f'{k-1}번째 묶음까지는 {k*(k-1)//2}개, {k}번째 묶음까지는 {k*(k+1)//2}개입니다. 따라서 {n}번째는 {k}번째 묶음 안의 {j}번째 분수입니다.',f'분모는 {den}, 분자는 {k}−{j-1}＝{num}이므로 차는 {den}−{num}＝{ans}입니다. 배열에 쓰인 분자와 분모를 약분하지 않고 사용합니다.'],'분모별 묶음의 길이와 분자의 내림차순을 함께 적용하기','triangular group index with descending numerator',promptDataLines=[', '.join(frac(a,b) for a,b in [(1,2),(2,3),(1,3),(3,4),(2,4),(1,4),(4,5),(3,5),(2,5),(1,5)])+', …'])
for outer,dividend,divisor,subtract in [(18,72,3,14),(19,96,4,17),(21,84,3,16),(22,108,4,18),(23,105,3,19),(24,120,5,13),(25,132,4,21),(26,144,6,11),(27,150,5,22)]:
 inner=dividend//divisor+1;diff=abs(inner-subtract);ans=(outer+1)*diff
 add(6,{'outer':outer,'dividend':dividend,'divisor':divisor,'subtract':subtract},f'보기의 ○, □, △는 각각 일정한 계산 규칙을 나타냅니다. 보기에서 규칙을 찾아 {outer}△(({dividend}○{divisor})□{subtract})의 값을 구하시오.',ans,['보기의 □는 두 수 중 큰 수에서 작은 수를 뺀 값입니다. △는 왼쪽 수에 1을 더하여 오른쪽 수를 곱하고, ○는 왼쪽 수를 오른쪽 수로 나눈 뒤 1을 더한 값입니다.',f'가장 안쪽부터 계산하면 {dividend}○{divisor}＝{dividend}÷{divisor}＋1＝{inner}입니다.',f'다음은 {inner}□{subtract}＝{diff}이고, 마지막으로 {outer}△{diff}＝({outer}＋1)×{diff}＝{ans}입니다.'],'세 규칙을 구분하고 괄호 안쪽부터 순서대로 계산하기','absolute difference, incremented product, quotient plus one')
for transfer,eatA,eatB in [(4,3,1),(4,4,2),(5,4,1),(5,5,2),(6,3,2),(6,5,3),(7,4,2),(7,6,3),(8,5,4)]:
 n=3*transfer+2*eatA-eatB;A=n-transfer-eatA;B=n+transfer-eatB;assert B==2*A and A>0
 add(7,{'transfer':transfer,'eatA':eatA,'eatB':eatB},f'사탕 수가 같은 두 봉지를 가와 나가 한 봉지씩 가졌습니다. 가는 나에게 사탕 {transfer}개를 준 뒤 {eatA}개를 먹었고, 나는 받은 사탕 중 {eatB}개를 먹었습니다. 그랬더니 나에게 남은 사탕이 가에게 남은 사탕의 2배가 되었습니다. 처음 한 봉지에 있던 사탕은 몇 개입니까?',n,[f'처음 한 봉지의 수를 □라 하면 가에게 남은 수는 □−{transfer+eatA}, 나에게 남은 수는 □＋{transfer-eatB}입니다.',f'나의 남은 수가 가의 2배이므로 □＋{transfer-eatB}＝(□−{transfer+eatA})×2입니다. 양쪽에서 □를 한 번씩 빼면 □＝{2*(transfer+eatA)}＋{transfer-eatB}＝{n}입니다.',f'확인하면 가는 {n}−{transfer}−{eatA}＝{A}개, 나는 {n}＋{transfer}−{eatB}＝{B}개이므로 정확히 2배입니다.'],'서로 주고 먹은 수를 두 사람의 남은 수에 각각 반영하기','two affine remaining amounts and ratio two')
for remain in [18,22,24,26,28,32,34,36,38]:
 ans=remain*16
 add(8,{'remaining':remain,'halvings':4},f'리본 끈의 절반을 선물 하나를 포장하는 데 썼습니다. 그 뒤에도 그때그때 남은 끈의 절반을 다음 선물에 사용하여 모두 네 개의 선물을 포장했더니 {remain}cm가 남았습니다. 처음 리본 끈의 길이는 몇 cm입니까?',ans,[f'남은 끈의 절반을 사용하면 사용 직전의 길이는 남은 길이의 2배입니다.',f'거꾸로 네 번 되돌리면 {remain}×2＝{remain*2}, {remain*2}×2＝{remain*4}, {remain*4}×2＝{remain*8}, {remain*8}×2＝{ans}입니다.',f'따라서 처음 길이는 {ans}cm입니다. 실제로 절반을 네 번 남기면 {ans}÷2÷2÷2÷2＝{remain}cm입니다.'],'전체의 절반과 그때그때 남은 양의 절반을 구분하기','four reverse doublings')
for difference in [5,6,7,9,10,11,12,13,14]:
 row=2*difference-1
 add(10,{'difference':difference},f'그림과 같이 윗줄부터 검은색과 흰색 바둑돌을 한 줄씩 번갈아 놓아 삼각형 모양을 늘립니다. 검은 바둑돌이 흰 바둑돌보다 {difference}개 많아지려면 몇 줄까지 놓아야 합니까?',row,['맨 윗줄은 검은색 1개입니다. 흰색 줄과 바로 다음 검은색 줄을 짝지으면 각 짝에서 검은색이 한 개 더 많아집니다.',f'검은색이 {difference}개 더 많으려면 맨 위 검은색 한 줄 외에 그런 짝이 {difference-1}개 있어야 합니다.',f'필요한 줄 수는 1＋2×{difference-1}＝{row}줄입니다. 이때 검은색은 {difference*difference}개, 흰색은 {difference*(difference-1)}개이므로 차는 {difference}개입니다.'],'맨 윗줄과 이후 두 줄씩의 차이를 분리하기','paired alternating rows starting with black')
for a,b,extra in [(1200,1500,200),(1400,1700,300),(1600,1800,200),(1800,2100,400),(1900,2300,500),(2200,2500,300),(2400,2700,600),(2600,2900,400),(2800,3100,700)]:
 price=a+b+extra
 add(13,{'shortA':a,'shortB':b,'leftover':extra},f'두 사람이 같은 꽃을 사려고 합니다. 가가 가진 돈으로는 {a}원이 부족하고, 나가 가진 돈으로는 {b}원이 부족합니다. 두 사람의 돈을 합하여 꽃 한 송이를 사면 {extra}원이 남습니다. 꽃 한 송이의 가격은 얼마입니까?',price,[f'가진 돈을 합하여 꽃을 산 뒤 {extra}원이 남으므로, 가가 가진 돈은 나에게 부족했던 {b}원보다 {extra}원 더 많습니다.',f'따라서 가의 돈은 {b}＋{extra}＝{b+extra}원이고 꽃값은 여기에 가의 부족액 {a}원을 더한 {b+extra}＋{a}＝{price}원입니다.',f'나의 돈은 {price}−{b}＝{price-b}원입니다. 두 돈의 합 {b+extra}＋{price-b}＝{price+extra}원에서 꽃값을 빼면 {extra}원이 남으므로 맞습니다.'],'부족액을 더한 뒤 사고 남은 돈도 더해야 함을 이해하기','complementary shortfalls and leftover')
for k in range(1,10):
 upper=1000*k-1;low=13500*k;high=1000*k*(k-1)//2;ans=low+high
 add(17,{'upper':upper},f'1부터 {upper}까지의 자연수를 차례로 이어 쓴 수가 있습니다. 이 수에 쓰인 각 자리 숫자를 한 자리씩 모두 더한 값을 구하시오.',ans,[f'0부터 {upper}까지를 네 자리로 맞춰 생각해도 앞에 붙인 0은 숫자의 합을 바꾸지 않습니다. 이 수들은 천의 자리가 0부터 {k-1}까지인 {k}묶음입니다.',f'각 묶음에서 뒤 세 자리는 000부터 999까지 한 번씩 나옵니다. 각 자리에서 0~9가 100번씩 나오므로 뒤 세 자리의 합은 (0＋1＋…＋9)×100×3＝13500입니다. {k}묶음이면 {low}입니다.',f'천의 자리 숫자는 0부터 {k-1}까지 각각 1000번씩 나타나므로 합은 {high}입니다. 전체 숫자의 합은 {low}＋{high}＝{ans}입니다.'],'앞자리 0을 보완해 같은 길이의 수 묶음으로 자릿수 주기 세기','complete 000–999 blocks and leading digit contribution')
for delta in [800,1000,1200,1400,1800,2000,2200,2400,2600]:
 price=12*delta;old=price//6;new=price//4
 add(19,{'people':6,'separateGroup':2,'extraPerPerson':delta},f'여섯 명이 같은 금액을 내어 선물 한 개를 사기로 했습니다. 그런데 그중 두 명이 따로 돈을 모아 같은 선물 한 개를 사고, 나머지 네 명도 그 선물 한 개를 사기로 바꾸었습니다. 네 명은 처음 계획보다 한 사람당 {delta}원씩 더 내야 합니다. 선물 한 개의 가격은 얼마입니까?',price,[f'처음 한 사람이 내기로 한 돈을 한 묶음이라 하면 선물값은 여섯 묶음입니다. 같은 선물을 네 명이 사면 한 사람은 6÷4＝1.5묶음을 내야 합니다.',f'늘어난 0.5묶음이 {delta}원이므로 처음 한 사람의 부담은 {delta}×2＝{old}원입니다.',f'선물값은 {old}×6＝{price}원입니다. 바뀐 부담은 {price}÷4＝{new}원이고 차가 {new}−{old}＝{delta}원이므로 맞습니다.'],'같은 물건의 가격을 두 분담 인원으로 나타내기','six-person versus four-person cost share')
values=sorted([int(''.join(map(str,ds[::-1]))) for ds in it.combinations(range(10),4)],reverse=True)
for rank in [42,51,73,84,97,106,119,131,145]:
 ans=values[rank-1];prefix='';remainingRank=rank;steps=['각 자리 숫자가 오른쪽으로 갈수록 작아야 하므로 같은 숫자를 두 번 쓸 수 없습니다. 앞자리부터 큰 수를 먼저 놓고 같은 앞자리 안에서 다음 자리를 비교합니다.']
 for pos,digit in enumerate(map(int,str(ans))):
  upper=10 if pos==0 else int(prefix[-1]);left=3-pos;skipped=[]
  for d in range(upper-1,digit,-1):
   count=math.comb(d,left) if d>=left else 0
   if count:skipped.append((d,count));remainingRank-=count
  if skipped:steps.append((f'처음 자리에서 ' if not prefix else f'{prefix}까지 정한 뒤 다음 자리에서 ')+', '.join(f'{d}를 놓는 {cnt}개' for d,cnt in skipped)+f'를 먼저 지나면 이번 묶음의 {remainingRank}번째입니다.')
  prefix+=str(digit)
 steps.append(f'이 순서로 숫자를 고르면 {ans}이고 각 자리는 왼쪽부터 엄격하게 작아집니다. 앞에 있는 경우의 수와 묶음 안 순위를 합치면 정확히 {rank}번째입니다.')
 add(20,{'rank':rank},f'네 자리 수 중 각 자리 숫자가 왼쪽에서 오른쪽으로 갈수록 작아지는 수를 큰 수부터 차례로 나열하였습니다. {rank}번째 수를 구하시오.',ans,steps,'앞자리별 경우의 수를 빼며 원하는 순위까지 내려가기','sorted decreasing digit combinations')
for limit in [270,330,360,390,420,450,480,510,540]:
 nums=list(range(3,limit+1,3));units=[n for n in nums if n%10==4];tens=[n for n in nums if n//10%10==4];hundreds=[n for n in nums if n//100%10==4];ans=sum(str(n).count('4') for n in nums)
 steps=[f'1부터 {limit}까지의 3의 배수를 차례로 쓸 때 숫자4가 나타나는 자리를 일의 자리·십의 자리·백의 자리로 나누어 셉니다.']
 for name,group in [('일',units),('십',tens),('백',hundreds)]:steps.append(f'{name}의 자리에4가 있는 수는 '+(', '.join(map(str,group)) if group else '없음')+f'으로 {len(group)}번입니다.')
 steps.append(f'144처럼 두 자리에4가 있으면 각각 한 번씩 세는 것이 맞습니다. 따라서 전체는 {len(units)}＋{len(tens)}＋{len(hundreds)}＝{ans}번입니다.')
 add(23,{'limit':limit,'multiple':3,'digit':4},f'1부터 {limit}까지의 자연수 중 3의 배수만 작은 수부터 차례로 씁니다. 이때 숫자 4는 모두 몇 번 쓰입니까?',ans,steps,'수의 개수가 아니라 각 자리에 나타난 숫자의 횟수 세기','literal digit occurrences in multiples')
for first,last in [(3,11),(4,12),(5,12),(3,10),(4,11),(4,10),(5,11),(6,12),(3,9)]:
 months=list(range(first,last+1));mSum=sum(sum(map(int,str(m))) for m in months);n31=sum(calendar.monthrange(2025,m)[1]==31 for m in months);dateSum=168*len(months)+4*n31;ans=mSum+dateSum
 add(28,{'firstMonth':first,'lastMonth':last},f'{first}월부터 {last}월까지의 달력에서 월 이름에 쓰인 숫자와 날짜에 쓰인 숫자를 한 자리씩 모두 더합니다. 요일 이름과 연도는 제외할 때 전체 합을 구하시오.',ans,[f'날짜 1일부터30일까지의 숫자 합은 1~9의45, 10~19의55, 20~29의65, 30의3을 더한 168입니다. 31일까지 있는 달은 3＋1＝4를 더하여172입니다.',f'{first}월부터{last}월까지는 {len(months)}개월이고 31일까지 있는 달은 {n31}개입니다. 날짜의 숫자 합은 168×{len(months)}＋4×{n31}＝{dateSum}입니다.',f'월 이름의 숫자 합은 {mSum}입니다. 따라서 모두 더하면 {dateSum}＋{mSum}＝{ans}입니다. 이 범위에는2월이 없어 윤년과 관계없습니다.'],'날짜의 값과 날짜를 이루는 한 자리 숫자의 합 구분하기','separate month-label digits and day-label digits')
cardsets=[list(s) for s in it.combinations(range(1,10),6) if s!=tuple(range(1,7)) and sum(d%2 for d in s)>=3][:9]
for cards in cardsets:
 buckets=defaultdict(list)
 for p in it.permutations(cards):
  if p[2]%2==0 or p[5]%2==0:continue
  a=100*p[0]+10*p[1]+p[2];b=100*p[3]+10*p[4]+p[5];buckets[tuple(sorted([p[0],p[3]]))].append((a*b,a,b))
 best=max(x for group in buckets.values() for x in group);ans,a,b=best
 steps=['곱이 홀수이려면 두 수의 일의 자리가 모두 홀수여야 합니다. 백의 자리에 놓을 두 숫자를 먼저 고르고 남은 네 숫자의 배열을 비교합니다.']
 for i in range(0,len(buckets),5):
  group=list(sorted(buckets.items()))[i:i+5];steps.append('백의 자리 두 숫자가 '+', '.join(f'{key[0]}·{key[1]}일 때 최대{max(g)[0]}' for key,g in group)+'입니다. 일의 자리가 모두 홀수인 배열만 비교한 값입니다.')
 steps.append(f'이 경우들을 모두 비교한 최댓값은 {a}×{b}＝{ans}입니다. 두 수의 일의 자리가 {a%10}과{b%10}으로 모두 홀수이고 카드 여섯 장을 정확히 한 번씩 사용합니다.')
 add(29,{'cards':cards},'아래 숫자 카드 여섯 장을 모두 한 번씩 사용하여 세 자리 수와 세 자리 수의 곱셈식을 만듭니다. 곱이 홀수가 되는 가장 큰 곱을 구하시오.',ans,steps,'홀수 조건으로 일의 자리를 제한하고 앞자리별 최댓값 비교하기','all parity-valid six-card permutations grouped by leading pair',cards=cards)
assert len(items)==108 and all(sum(x['sourceNo']==no for x in items)==9 for no in TYPES)
assert len({(x['text'],json.dumps(x.get('cards'))) for x in items})==108
out={'version':'20261024-applied4-expansion-r1','sourceSet':'applied','sourceRound':4,'policy':{'targetVariantsPerSource':9,'runtimeGeneration':False,'defaultDiagnosticVariants':3,'difficulty':'활용 배점대만 사용','sourceGradeMutation':False},'availableSourceNos':sorted(TYPES),'pendingSourceNos':[n for n in range(1,31) if n not in TYPES],'items':items,'sourceEditionNotes':{'4':'현행문제는시간당25분,교사답안문구는하루25분. 서로다른판본으로보류,원답보존','28':'숫자를한자리씩합산하며월이름도포함. 현행저장답1752를유지하고교사손글씨와혼동하지않음','30':'분열시점과부모개체유지조건의해석확인필요로보류'}}
(ROOT/'bank/data/applied4-expanded.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Authored 108 Applied4 variants, 12 types, pending independent/output review')

"""Append six levelled groups while preserving every released first180 field."""
import collections,copy,hashlib,itertools,json,math,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied3-balanced15.json';BASE='e2c16e27015f4071ba5d9c3c5871691dbf3beb08'
before=FILE.read_bytes();assert before==subprocess.check_output(['git','show',BASE+':bank/data/applied3-balanced15.json'],cwd=ROOT)
data=json.loads(before);assert len(data['items'])==180 and all(x['reviewStatus']=='verified'for x in data['items']);prior=copy.deepcopy(data['items']);items=data['items'];version='20261024-applied3-balanced15-r3'
old=json.loads((ROOT/'bank/data/applied3-expanded.json').read_text())['items']
for no in [15,17]:
 for src in [x for x in old if x['sourceNo']==no][:5]:
  x=copy.deepcopy(src);assert x['pointBand']=='3.4';x.update(practiceLevel='middle',sourcePointBand='3.4',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)
meta={13:('수와 식','자리별 값과 합','색칠한 자리의 값과 모양 묶음'),14:('지문 이해','분류와 논리','선호 개수와 공통 조건의 교차'),15:('수와 식','자릿수와 최댓값','서로 다른 숫자의 합과 끝자리 조건'),16:('도형','쌓기나무와 교대 색','기둥 높이와 색별 수량'),17:('도형','접기와 펼치기','구멍 배수와 단계별 역추론'),18:('수와 식','수량 이동과 역산','받는 수량의 배수로 옮긴 세 바구니')}
roles={13:dict(low='예시 한두 개의 차에서 한 자리 값 결정',middle='마지막 모양의 값과 지운/추가한 자리를 함께 계산',high='마지막 모양 값을 먼저 추론하고 두 종류 모양의 합·개수 차를 역산'),14:dict(low='세 사람의 완전한 선호와 전체 개수의 차로 남은 사람 결정',middle='네 사람의 개수 조건·부분 선호를 교차하여 묻는 사람의 두 과일 결정',high='다섯 사람의 개수와 공통0/2가지 관계를 함께 추적하고 답의 유일성 확인'),15:dict(low='자릿수를 고정해 합이 맞는 서로 다른 숫자의 최댓값 비교',high='가능한 자릿수를 최대화하면서 끝 두 자리의4배수 조건을 동시에 충족'),16:dict(low='원본의 기둥·한 층·전체 개수 중 한 성질 관찰',middle='원래 좌표와 교대 색을 유지하며 지정한 윗부분 제거 뒤 색별 수량 계산',high='불규칙 입체의 색별 수량과 완성 직육면체의 교대 색을 결합해 추가량 계산'),17:dict(low='한두 접기 단계의 구멍 복원 배수 적용',high='실제 뚫은 횟수 합·복원된 구멍 수·두 단계 개수 차로 세 단계 개수 역산'),18:dict(low='받는 바구니가 두 배가 되는 한 이동만 거꾸로 복원',middle='같지 않은 세 최종 수량에서 세 이동을 역순으로 복원',high='세 이동마다 다른 배수로 받는 수량을 늘린 조건을 역순으로 결합')}
assets={13:dict(kind='raster',src='assets/applied3/circle-values-original.png',description='원문13번의일곱모양과1·2·3·5·10·11·물음표.자리·색칠·수치그대로.'),16:dict(kind='raster',src='assets/applied3/checker-stair-original.png',description='원문16번의모든쌓기나무·흰검색·보이는선·시점을그대로보존.'),17:copy.deepcopy(next(x for x in old if x['sourceNo']==17)['asset'])}
def add(no,level,p,text,answer,labels,steps,point,method,**extra):
 v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items);area,sub,detail=meta[no]
 axes=dict(prerequisite='원문 자리별 합·두 선호·자릿수 합·교대 색·겹 수·이동량',reasoning=roles[no][level],conditionTracking='모양 순서/과일 종류/자리·끝자리/층·기둥/접은 시점/이동 전후를 분리',caseSplitting='서로 다른 선택과 사람·층·순서를 구분하고 중복 제거',computation='수치 확대 대신 고정 조건·역추론·배수 조건 결합',representation='문제의 실제 도형은 원본을 보존하고 논리 단서만 실제 조사 자료로 분리',reading='필수 조건은 지문과 실제 단서 안에만 제시',visualCues='문제 아래 조건 요약·힌트·풀이 보조선 없음',shortcuts='맨위 원의 미확정 값·전체 배치와 묻는 답의 유일성·선행0·숨은 기둥·펀치 시점·받는 수량의 기준을 구분')
 x=dict(id=f'applied3-q{no:02d}-{level}-v{v}',genId=f'applied3-q{no:02d}',sourceSet='applied',sourceRound=3,sourceNo=no,variantNo=v,area=area,subarea=sub,detailType=detail,learningLocation=f'활용 3회 · 원문 {no}번 · {detail}',learningPoint=point,practiceLevel=level,sourcePointBand='3.4',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],solutionSteps=steps,solution=' '.join(steps),difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',measured=False,axes=axes),verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied3-balanced15-independent-validate.py',sourceExamPage=3 if no<=14 else 4,sourceAnswerPage=3 if no<=14 else 4,studentDifficultyMeasured=False))
 if no in assets:x['asset']=copy.deepcopy(assets[no])
 x.update(extra);items.append(x);assert len(steps)>=3

#13: five observed positions only; the uncoloured top position is undetermined.
positions={'오른쪽 위':1,'오른쪽 아래':2,'맨 아래':4,'왼쪽 아래':8,'왼쪽 위':9}
base13=['첫째와 둘째 모양에서 오른쪽 위는1,오른쪽 아래는2입니다.','넷째 모양의5에서 오른쪽 위1을 빼면 맨 아래는4입니다. 다섯째의10에서 오른쪽 아래2를 빼면 왼쪽 아래는8,여섯째의11에서 오른쪽 아래2를 빼면 왼쪽 위는9입니다.','일곱째에서 칠한 세 자리는 왼쪽 위·왼쪽 아래·맨 아래이므로9＋8＋4＝21입니다. 맨 위 자리는 색칠하지 않아 그 값을 정할 필요가 없습니다.']
for name,value in positions.items():
 add(13,'low',dict(position=name),f'그림에서 각 자리에는 정해진 값이 있고,색칠한 자리의 값을 더하면 아래의 수가 됩니다. 한 모양에서 {name} 자리의 값은 얼마입니까?',[value],['자리의 값'],base13[:2]+[f'따라서 {name} 자리의 값은{value}입니다.'], '예시 모양의 합·차로 한 자리의 값 찾기','observed additive positional equations')
for operation,name in [('allSum','전체'),('erase','맨 아래'),('erase','왼쪽 위'),('erase','왼쪽 아래'),('add','오른쪽 위')]:
 if operation=='allSum':question='그림의 첫째부터 일곱째까지 모양이 나타내는 수를 모두 더하시오.';answer=53;last='앞의 여섯 수는1＋2＋3＋5＋10＋11＝32입니다. 일곱째21을 더하면32＋21＝53입니다.'
 else:
  change=positions[name];answer=21-change if operation=='erase'else 21+change
  question=f'그림의 일곱째 모양에서 {name} 자리의 '+('색칠만 지웠습니다.'if operation=='erase'else'원도 추가로 색칠했습니다.')+' 바뀐 모양이 나타내는 수를 구하시오.'
  last=f'일곱째21에서 {name} 자리의{change}을 '+('빼면'if operation=='erase'else'더하면')+f'{answer}입니다.'
 add(13,'middle',dict(operation=operation,position=name),'그림에서 각 자리에는 정해진 값이 있고,색칠한 자리의 값을 더하면 아래의 수가 됩니다. '+question,[answer],['나타내는 수'],base13+[last], '미확정 맨위 값은 쓰지 않고 마지막 모양과 바뀐 자리만 계산하기','fixed observed shape and specified one-position change')
for a,b in [(3,2),(5,3),(7,4),(8,5),(9,6)]:
 total=21*a+10*b;diff=a-b
 add(13,'high',dict(totalValue=total,seventhMinusFifth=diff),'그림에서 각 자리에는 정해진 값이 있고,색칠한 자리의 값을 더하면 아래의 수가 됩니다. '+f'일곱째와 같은 모양 여러 개와 다섯째와 같은 모양 여러 개의 수를 모두 더했더니{total}이었습니다. 일곱째 모양의 개수가 다섯째보다{diff}개 많습니다. 일곱째 모양과 다섯째 모양의 개수를 차례로 구하시오.',[a,b],['일곱째 모양 개수','다섯째 모양 개수'],base13+[f'일곱째의 더 많은{diff}개가 차지하는 값은21×{diff}＝{21*diff}입니다. 이것을 빼면 두 종류 모양을 하나씩 짝지은 값만 남습니다.',f'한 짝의 값은21＋10＝31이므로 다섯째의 개수는({total}−{21*diff})÷31＝{b}개입니다. 일곱째는{b}＋{diff}＝{a}개입니다. 확인하면21×{a}＋10×{b}＝{total}입니다.'],'마지막 모양의 값을 추론하고 묶음 전체 값과 개수 차로 역산하기','shape positional inference plus positive two-count equations')

#14: all printed table rows are actual clues, never a restatement of the stem.
FRUIT_CASES={'middle': [{'people': 4, 'clues': [['count', 0, 3], ['count', 1, 3], ['count', 2, 1], ['count', 3, 1], ['has', 2, 3], ['has', 0, 0], ['has', 1, 0], ['pair', 3, 6]], 'answerMask': 3, 'possibleAssignments': 1}, {'people': 4, 'clues': [['count', 0, 2], ['count', 1, 3], ['count', 2, 2], ['count', 3, 1], ['has', 2, 3], ['has', 0, 0], ['has', 1, 1], ['pair', 3, 5]], 'answerMask': 6, 'possibleAssignments': 1}, {'people': 4, 'clues': [['count', 0, 2], ['count', 1, 2], ['count', 2, 3], ['count', 3, 1], ['has', 2, 3], ['has', 0, 0], ['has', 1, 1], ['pair', 3, 5]], 'answerMask': 6, 'possibleAssignments': 2}, {'people': 4, 'clues': [['count', 0, 3], ['count', 1, 1], ['count', 2, 3], ['count', 3, 1], ['has', 2, 3], ['has', 0, 0], ['has', 1, 0], ['pair', 3, 6]], 'answerMask': 5, 'possibleAssignments': 1}, {'people': 4, 'clues': [['count', 0, 3], ['count', 1, 2], ['count', 2, 2], ['count', 3, 1], ['has', 2, 3], ['has', 0, 1], ['has', 1, 0], ['pair', 3, 3]], 'answerMask': 5, 'possibleAssignments': 2}], 'high': [{'people': 5, 'clues': [['count', 0, 1], ['count', 1, 3], ['shared', 2, 4, 2], ['shared', 2, 3, 0], ['has', 3, 2], ['has', 0, 1]], 'answerMask': 12, 'possibleAssignments': 2, 'allCluesNecessaryForAnswer': True, 'signature': "((1, 3, 3, 3), (('count', 0, 1), ('count', 1, 3), ('has', 0, 1), ('has', 3, 2), ('shared', 2, 3, 0), ('shared', 2, 4, 2)))"}, {'people': 5, 'clues': [['count', 1, 1], ['shared', 2, 4, 2], ['shared', 0, 1, 0], ['shared', 0, 2, 0], ['count', 2, 2]], 'answerMask': 9, 'possibleAssignments': 2, 'allCluesNecessaryForAnswer': True, 'signature': "((3, 1, 2, 4), (('count', 1, 1), ('count', 2, 2), ('shared', 0, 1, 0), ('shared', 0, 2, 0), ('shared', 2, 4, 2)))"}, {'people': 5, 'clues': [['has', 1, 0], ['count', 0, 1], ['count', 1, 3], ['shared', 0, 2, 2], ['shared', 0, 3, 2], ['count', 2, 4]], 'answerMask': 9, 'possibleAssignments': 1, 'allCluesNecessaryForAnswer': True, 'signature': "((1, 3, 4, 2), (('count', 0, 1), ('count', 1, 3), ('count', 2, 4), ('has', 1, 0), ('shared', 0, 2, 2), ('shared', 0, 3, 2)))"}, {'people': 5, 'clues': [['count', 1, 1], ['shared', 0, 3, 0], ['shared', 0, 2, 2], ['count', 2, 2], ['has', 0, 2]], 'answerMask': 9, 'possibleAssignments': 2, 'allCluesNecessaryForAnswer': True, 'signature': "((4, 1, 2, 3), (('count', 1, 1), ('count', 2, 2), ('has', 0, 2), ('shared', 0, 2, 2), ('shared', 0, 3, 0)))"}, {'people': 5, 'clues': [['count', 1, 4], ['shared', 0, 2, 0], ['shared', 0, 4, 2], ['count', 2, 3], ['has', 0, 3]], 'answerMask': 6, 'possibleAssignments': 1, 'allCluesNecessaryForAnswer': True, 'signature': "((1, 4, 3, 2), (('count', 1, 4), ('count', 2, 3), ('has', 0, 3), ('shared', 0, 2, 0), ('shared', 0, 4, 2)))"}]}
fruits=['사과','배','귤','딸기'];masks=[sum(1<<f for f in c)for c in itertools.combinations(range(4),2)]
def names(mask):return [fruits[f]for f in range(4)if mask>>f&1]
def clue_text(c):
 if c[0]=='count':return f'{fruits[c[1]]}{'을'if c[1]==2 else'를'} 좋아한다고 말한 사람은{c[2]}명입니다.'
 if c[0]=='has':return f'{chr(65+c[1])}는 {fruits[c[2]]}{'을'if c[2]==2 else'를'} 좋아합니다.'
 if c[0]=='pair':return f'{chr(65+c[1])}가 좋아하는 과일: '+', '.join(names(c[2]))
 return f'{chr(65+c[1])}와 {chr(65+c[2])}가 공통으로 좋아하는 과일은{c[3]}가지입니다.'
def satisfies(w,c):
 if c[0]=='count':return sum(bool(v>>c[1]&1)for v in w)==c[2]
 if c[0]=='has':return bool(w[c[1]]>>c[2]&1)
 if c[0]=='pair':return w[c[1]]==c[2]
 return (w[c[1]]&w[c[2]]).bit_count()==c[3]
def fruit_add(level,n,clues):
 worlds=[w for w in itertools.product(masks,repeat=n)if all(satisfies(w,c)for c in clues)];answers={w[1]for w in worlds};assert len(answers)==1;answer=names(next(iter(answers)))
 counts=collections.Counter(w[1]for w in worlds);table=[['·'.join(names(m)),str(counts[m])]for m in masks];example=' / '.join(chr(65+i)+':'+','.join(names(m))for i,m in enumerate(worlds[0]))
 steps=['한 사람은 서로 다른 두 과일을 고르므로 가능한 짝은 사과·배,사과·귤,사과·딸기,배·귤,배·딸기,귤·딸기의 여섯 가지입니다.']
 if level=='low':
  known=[c for c in clues if c[0]=='pair'];steps+=[f'세 사람에게서 나온 과일별 수를 먼저 세면 사과{sum(bool(c[2]&1)for c in known)}명,배{sum(bool(c[2]&2)for c in known)}명,귤{sum(bool(c[2]&4)for c in known)}명,딸기{sum(bool(c[2]&8)for c in known)}명입니다.','이 수를 전체 조사 인원에서 과일별로 빼면 B가 고른 과일에만1이 남습니다.']
 else:
  steps+=['과일별 인원 조건을 먼저 맞춥니다. 공통 과일이0가지이면 두 사람의 짝은 서로 겹치지 않고,2가지이면 두 사람이 같은 짝을 고른 것입니다.'if level=='high'else'명시된 한 과일 선호와 두 과일 선호를 먼저 표시하고,과일별 전체 인원에서 이미 정해진 사람 수를 뺍니다.','B의 각 후보 짝에 대해 나머지 사람도 두 가지씩 고르도록 놓아 모든 조사 조건을 확인하면 답안 표와 같습니다. 조건에 맞는 배치가0인 후보는 제외합니다.']
 steps+=[f'남는 B의 짝은 {"·".join(answer)}뿐입니다. 조건을 만족하는 한 배치는 {example}입니다. 전체 배치가 여러 개여도 B의 답은 같아야 합니다.']
 add(14,level,dict(people=n,clues=clues),f'{"A,B,C,D"if n==4 else"A,B,C,D,E"} {n}명은 사과,배,귤,딸기 중 좋아하는 과일을 서로 다른 두 가지씩 골랐습니다. 다음 조사 결과를 읽고 B가 고른 과일 두 가지를 모두 구하시오.',answer,['두 과일 모두(쉼표로 구분)'],steps,'과일별 인원과 사람 사이의 공통 조건을 교차하여 묻는 답의 유일성 확인하기','finite two-choice preference constraints and answer-level uniqueness',answerContract='unordered-set',givenTable=dict(label='실제 선호 조사 결과',headers=['조사 내용'],rows=[[clue_text(c)]for c in clues]),solutionTable=dict(headers=['B의 후보','모든 조건에 맞는 배치 수'],rows=table))
for world in [(3,5,9,6),(3,6,12,5),(9,10,5,12),(6,9,3,10),(5,12,6,3)]:
 clues=[['pair',i,world[i]]for i in [0,2,3]]+[['count',f,sum(bool(m>>f&1)for m in world)]for f in range(4)];fruit_add('low',4,clues)
for level in ['middle','high']:
 for case in FRUIT_CASES[level]:fruit_add(level,case['people'],case['clues'])

#15: author compares digit subsets and legal suffixes, verifier uses digit DP.
def max_number(total,length=None,modulo=None):
 out=[]
 for size in ([length]if length else range(1,11)):
  for ds in itertools.combinations(range(10),size):
   if sum(ds)!=total:continue
   if modulo is None:
    text=''.join(map(str,sorted(ds,reverse=True)))
    if text[0]!='0':out.append(int(text))
   elif size>=2:
    for a,b in itertools.permutations(ds,2):
     if(10*a+b)%modulo:continue
     rest=sorted(set(ds)-{a,b},reverse=True);text=''.join(map(str,rest))+str(a)+str(b)
     if text[0]!='0':out.append(int(text))
 return max(out)
for total in [10,13,17,21,25]:
 ans=max_number(total,4)
 add(15,'low',dict(digitSum=total,digits=4),f'각 자리 숫자가 서로 다른 네 자리 자연수 중 각 자리 숫자의 합이{total}인 가장 큰 수를 구하시오.',[ans],['가장 큰 수'],['네 자리로 길이가 같으므로 천의 자리부터 큰 숫자를 고릅니다. 다만 뒤의 세 자리도 서로 달라야 하고 전체 합을 맞출 수 있어야 합니다.',f'가능한 숫자 묶음을 비교하면 {", ".join(str(ans))}을 고르는 것이 맨 앞자리부터 가장 큽니다.',f'큰 자리부터 쓰면{ans}입니다. 자리 합은'+ '＋'.join(str(ans))+f'＝{total}이고 숫자가 서로 다릅니다.'],'자릿수가 같은 수에서 앞자리와 남은 합을 함께 비교하기','fixed-length distinct digit subset maximization')
for total in [22,24,25,27,28]:
 ans=max_number(total,modulo=4);length=len(str(ans));ds=list(map(int,str(ans)));end=ans%100;prefix=str(ans)[:-2]
 add(15,'high',dict(digitSum=total,divisor=4),f'각 자리 숫자가 서로 다르고 각 자리 숫자의 합이{total}이며,4로 나누어떨어지는 가장 큰 자연수를 구하시오.',[ans],['가장 큰 수'],[f'서로 다른{length+1}개 숫자의 최소 합은0＋1＋…＋{length}＝{length*(length+1)//2}입니다. 이 값은{total}보다 커서 자릿수는{length}자리가 최대입니다.', '4로 나누어떨어지려면 끝 두 자리로 만든 수가4의 배수여야 합니다. 가능한 끝 두 자리를 정한 뒤,남은 숫자는 큰 것부터 앞에 놓아 비교합니다.',f'전체 합{total}을 만족하는 서로 다른 숫자 묶음과 끝 두 자리를 함께 비교하면 가장 큰 앞부분은{prefix},그 앞부분에서 가능한 가장 큰 끝 두 자리는{end:02d}입니다.',f'따라서{ans}입니다. 자리 합은'+ '＋'.join(map(str,ds))+f'＝{total}이고 끝 두 자리{end:02d}＝4×{end//4}이므로 두 조건을 모두 만족합니다.'],'최대 자릿수와 앞자리 우선 비교에 끝 두 자리의 배수 조건을 결합하기','digit subsets with all ordered legal two-digit suffixes')

#16: native ten columns, all visible outlines and colours checked against source.
H={(0,0):1,(0,1):4,(0,2):4,(0,3):4,(1,1):2,(1,2):3,(1,3):4,(2,2):2,(2,3):4,(3,3):1}
solid={(a,b,z)for(a,b),h in H.items()for z in range(h)}
def color_counts(c):return[sum(sum(t)%2==1 for t in c),sum(sum(t)%2==0 for t in c)]
assert color_counts(solid)==[14,15]
base16=['높이가4인 기둥은 왼쪽 뒤로 이어진 세 기둥과 뒤쪽 가로줄의 나머지 두 기둥으로 모두5개입니다. 각 기둥에는 흰색2개·검은색2개씩 들어 있어 합하면 흰색10개·검은색10개입니다.','나머지 다섯 기둥의 높이는 앞쪽부터1,2,3,2,1입니다. 맨 앞과 맨 오른쪽의 한 개는 검은색이고,높이2·3·2의 세 기둥에는 흰색4개·검은색3개가 들어 있습니다. 따라서 전체 흰색은14개,검은색은15개입니다.']
layer_table=dict(headers=['아래부터 층','흰색','검은색'],rows=[[str(z+1)]+list(map(str,color_counts({c for c in solid if c[2]==z})))for z in range(4)])
for mode,question,answer in [('all','쌓기나무는 모두 몇 개입니까?',29),('difference','검은색 쌓기나무는 흰색보다 몇 개 더 많습니까?',1),('top','맨 위층에 있는 쌓기나무는 몇 개입니까?',5),('base','바닥에 직접 닿는 쌓기나무는 몇 개입니까?',10),('tall','높이가 쌓기나무4개인 기둥은 몇 개입니까?',5)]:
 last=dict(all='전체는 높이4인 다섯 기둥20개와 나머지9개를 더해29개입니다.',difference='검은색15개에서 흰색14개를 빼면1개 더 많습니다.',top='가장 높은 네 번째 층에는 높이4인 다섯 기둥의 맨 위 나무가 하나씩 있어5개입니다.',base='바닥에 닿은 것은 각 기둥의 맨 아래 하나씩입니다. 기둥은 모두10개이므로10개입니다.',tall='높이4인 기둥은 뒤쪽과 왼쪽의 L자 부분에서 모서리 기둥을 중복하지 않아5개입니다.')[mode]
 add(16,'low',dict(mode=mode),'같은 색의 면이 맞닿지 않게 쌓은 그림을 보고 구하시오. '+question,[answer],['개수'],base16+[last],'보이지 않는 받침까지 기둥별로 세고 한 층·기둥 수를 구분하기','exact native column heights and parity colouring')
for mode,k in [('top',1),('top',2),('top',3),('tallTop',1),('tallTop',2)]:
 removed={c for c in solid if c[2]>=4-k}if mode=='top'else{c for c in solid if H[c[:2]]==4 and c[2]>=4-k};answer=color_counts(solid-removed);removed_counts=color_counts(removed)
 desc=f'맨 위에서부터{k}개 층의 나무를 모두'if mode=='top'else f'높이가4인 각 기둥에서 맨 위{k}개씩을'
 add(16,'middle',dict(mode=mode,layers=k),'같은 색의 면이 맞닿지 않게 쌓은 그림에서 '+desc+' 꺼냈습니다. 나머지 나무의 색은 바꾸지 않습니다. 남은 흰색과 검은색 쌓기나무의 개수를 차례로 구하시오.',answer,['남은 흰색','남은 검은색'],base16+[f'꺼내는 흰색은{removed_counts[0]}개,검은색은{removed_counts[1]}개입니다. 전체에서 이 수를 각각 뺍니다.',f'남은 흰색은14−{removed_counts[0]}＝{answer[0]}개,검은색은15−{removed_counts[1]}＝{answer[1]}개입니다.'], '층과 기둥의 제거 범위를 구분하고 원래 색별 개수에서 빼기','specified top-layer or tall-column removal without recolouring',solutionTable=copy.deepcopy(layer_table))
for a,b,h in [(4,4,4),(4,4,5),(5,4,4),(5,5,4),(5,5,5)]:
 full={(x,y,z)for x in range(a)for y in range(b)for z in range(h)};ans=color_counts(full-solid);counts=color_counts(full)
 add(16,'high',dict(width=a,depth=b,height=h),'같은 색의 면이 맞닿지 않게 쌓은 그림에 흰색과 검은색 쌓기나무를 더하여 '+f'가로{a}개,앞뒤{b}개,높이{h}개의 꽉 찬 직육면체를 만듭니다. 원래 맨 앞 왼쪽의 검은 나무가 완성한 직육면체에서도 맨 앞 왼쪽 맨 아래 칸이 되게 합니다. 기존 나무는 그대로 두고 새 나무도 같은 색의 면이 맞닿지 않게 놓습니다. 더 넣어야 하는 흰색과 검은색의 개수를 차례로 구하시오.',ans,['더 넣을 흰색','더 넣을 검은색'],base16+[f'완성한 직육면체는{a}×{b}×{h}＝{a*b*h}개입니다. 맨 앞 왼쪽 아래는 검은색이고 옆·뒤·위로 한 칸 갈 때마다 색이 바뀝니다.',f'각 층을 가로줄마다 번갈아 세면 완성본의 흰색은{counts[0]}개,검은색은{counts[1]}개입니다. '+('전체 칸 수가 짝수라 두 색의 수가 같습니다.'if a*b*h%2==0 else'세 방향 길이가 모두 홀수여서 시작 색인 검은색이 하나 더 많습니다.'),f'따라서 추가할 흰색은{counts[0]}−14＝{ans[0]}개,검은색은{counts[1]}−15＝{ans[1]}개입니다. 추가량의 합도{a*b*h}−29＝{sum(ans)}개로 맞습니다.'],'불규칙 기둥의 색 수와 완성 직육면체의 교대 색을 결합해 빈칸 수 계산하기','checkerboard box occupancy minus the original exact voxel set')

#17: source fold stages remain unchanged; all punched holes are interior and distinct.
for holes in [[1,0,0],[0,2,0],[0,0,3],[2,1,0],[0,1,2]]:
 answer=sum(n*2**(i+1)for i,n in enumerate(holes));desc=', '.join(f'{i+2}단계에서{n}개'for i,n in enumerate(holes)if n)
 add(17,'low',dict(holes=holes),'정사각형 색종이를 그림의 순서로 접습니다. '+desc+'의 구멍을 뚫고,다른 단계에서는 뚫지 않습니다. 구멍은 접힌 선과 가장자리를 피한 안쪽에 뚫으며 펼쳤을 때 서로 겹치지 않습니다. 완전히 펼치면 구멍은 모두 몇 개입니까?',[answer],['전체 구멍 수'],['2단계는 두 겹,3단계는 네 겹,4단계는 여덟 겹입니다. 각 구멍은 뚫을 당시의 겹 수만큼 펼쳐집니다.',f'단계별로 펼쳐지는 구멍은{holes[0]}×2＝{holes[0]*2}개,{holes[1]}×4＝{holes[1]*4}개,{holes[2]}×8＝{holes[2]*8}개입니다.',f'구멍이 겹치지 않으므로 모두 더해{answer}개입니다.'],'한두 단계의 구멍에 그 시점의 겹 수를 곱하기','distinct original-sheet reflection images of interior holes')
for x,y,d in [(1,2,1),(2,3,2),(3,2,1),(4,5,2),(5,4,3)]:
 z=x+d;press=x+y+z;total=2*x+4*y+8*z
 add(17,'high',dict(totalPunches=press,unfoldedHoles=total,lastMinusFirst=d),'정사각형 색종이를 그림의 순서로 접습니다. 2·3·4단계에서 각각 한 번 이상 펀치를 눌러 '+f'실제로 뚫은 횟수의 합은{press}번입니다. 완전히 펼친 구멍은{total}개이며,4단계에서 누른 횟수는2단계보다{d}번 많습니다. 모든 구멍은 접힌 선과 가장자리를 피한 안쪽에 있고 펼쳤을 때 서로 겹치지 않습니다. 2·3·4단계에서 누른 횟수를 차례로 구하시오.',[x,y,z],['2단계 횟수','3단계 횟수','4단계 횟수'],['2·3·4단계에서 한 번 누른 구멍은 펼치면 각각2·4·8개가 됩니다. 세 단계의 누른 횟수를 ㉠·㉡·㉢이라 둡니다.',f'누른 합에서 ㉠＋㉡＋㉢＝{press},펼친 합에서2×㉠＋4×㉡＋8×㉢＝{total}입니다. 또 ㉢＝㉠＋{d}입니다.',f'누른 합의 네 배를 펼친 합에서 빼면−2×㉠＋4×㉢＝{total-4*press}입니다. ㉢을 바꾸어 넣으면2×㉠＋{4*d}＝{total-4*press}이므로 ㉠＝{x}입니다.',f'㉢＝{x}＋{d}＝{z},㉡＝{press}−{x}−{z}＝{y}입니다. 확인하면2×{x}＋4×{y}＋8×{z}＝{total}입니다.'],'펀치 횟수와 펼친 구멍 수를 구분하고 세 조건을 동시에 역산하기','three independent integer equations for stage counts')

#18: operation is mathematical text; decorative source baskets are not a geometry model.
# No redraw or tiny rasterised duplicate of the three textual rules is introduced.
def reverse(final,multipliers):
 state=list(final);rows=[state[:]]
 for donor,receiver,k in reversed([(0,1,multipliers[0]),(1,2,multipliers[1]),(2,0,multipliers[2])]):
  assert state[receiver]%(k+1)==0;old=state[receiver]//(k+1);state[receiver]=old;state[donor]+=k*old;rows.append(state[:])
 return state,list(reversed(rows))
for final_a,final_b in [(8,12),(12,16),(16,20),(20,24),(24,28)]:
 initial_a=final_a+final_b//2;initial_b=final_b//2
 add(18,'low',dict(finalA=final_a,finalB=final_b),f'귤이 든 바구니 ㄱ과 ㄴ이 있습니다. ㄱ에서 ㄴ으로,옮기기 직전 ㄴ에 있던 귤의 개수만큼 옮겼더니 ㄱ에는{final_a}개,ㄴ에는{final_b}개가 되었습니다. 처음 ㄱ에 있던 귤은 몇 개입니까?',[initial_a],['처음 ㄱ의 귤'],['ㄴ은 원래 있던 수만큼 더 받았으므로 옮긴 뒤의 수는 처음의 두 배입니다.',f'처음 ㄴ은{final_b}÷2＝{initial_b}개이고,ㄱ에서 옮긴 수도{initial_b}개입니다.',f'처음 ㄱ에는 마지막에 남은{final_a}개와 옮겨 준{initial_b}개가 있었으므로{final_a}＋{initial_b}＝{initial_a}개입니다.'],'받는 수량의 두 배 관계를 거꾸로 풀어 한 이동 전 상태 찾기','single receiver-doubling inverse with total conservation')
for final in [[16,24,32],[24,16,40],[40,24,16],[32,40,24],[48,32,40]]:
 initial,rows=reverse(final,[1,1,1])
 add(18,'middle',dict(final=final,multipliers=[1,1,1]),'귤이 든 바구니 ㄱ,ㄴ,ㄷ에서 다음과 같이 차례로 옮깁니다. 먼저 ㄱ에서 ㄴ으로 그때 ㄴ에 있는 개수만큼,이어서 ㄴ에서 ㄷ으로 그때 ㄷ에 있는 개수만큼,마지막으로 ㄷ에서 ㄱ으로 그때 ㄱ에 있는 개수만큼 옮깁니다. '+f'모두 옮긴 뒤 ㄱ,ㄴ,ㄷ의 귤은 각각{final[0]}개,{final[1]}개,{final[2]}개였습니다. 처음 세 바구니의 귤 개수를 ㄱ,ㄴ,ㄷ 순서로 구하시오.',initial,['처음 ㄱ','처음 ㄴ','처음 ㄷ'],[f'마지막 ㄷ→ㄱ 직전의 ㄱ은{final[0]}÷2＝{rows[2][0]}개입니다. ㄷ은 그만큼 돌려받아{final[2]}＋{rows[2][0]}＝{rows[2][2]}개가 됩니다.',f'그 전 ㄴ→ㄷ 직전에는 ㄷ이{rows[2][2]}÷2＝{rows[1][2]}개이고,ㄴ은{rows[2][1]}＋{rows[1][2]}＝{rows[1][1]}개였습니다.',f'처음 ㄱ→ㄴ 직전의 ㄴ은{rows[1][1]}÷2＝{initial[1]}개입니다. ㄱ은{rows[1][0]}＋{initial[1]}＝{initial[0]}개이고 ㄷ은{initial[2]}개입니다.',f'처음 합{sum(initial)}개와 마지막 합{sum(final)}개가 같으며,앞으로 옮기면 답안 표처럼 최종 수량이 됩니다.'],'이동 순서를 거꾸로 바꾸고 받는 수의 절반을 원래 바구니에 돌려놓기','three receiver-doubling operations and positive unique inverse',solutionTable=dict(headers=['상태','ㄱ','ㄴ','ㄷ'],rows=[[label]+list(map(str,row))for label,row in zip(['처음','첫 이동 후','둘째 이동 후','마지막'],rows)]))
for multipliers,scale in [([1,2,1],5),([2,1,1],6),([1,1,2],7),([2,2,1],5),([1,2,2],6)]:
 product=math.prod(k+1 for k in multipliers);m=product*scale;final=[m,m,m];initial,rows=reverse(final,multipliers)
 add(18,'high',dict(final=final,multipliers=multipliers),'귤이 든 바구니 ㄱ,ㄴ,ㄷ에서 다음과 같이 차례로 옮깁니다. '+f'ㄱ에서 ㄴ으로 옮기기 직전 ㄴ에 있는 개수의{multipliers[0]}배를 옮기고,ㄴ에서 ㄷ으로 그때 ㄷ에 있는 개수의{multipliers[1]}배를 옮깁니다. 마지막으로 ㄷ에서 ㄱ으로 그때 ㄱ에 있는 개수의{multipliers[2]}배를 옮깁니다. 세 바구니가 모두{m}개가 되었다면 처음의 개수를 ㄱ,ㄴ,ㄷ 순서로 구하시오.',initial,['처음 ㄱ','처음 ㄴ','처음 ㄷ'],[f'마지막 이동에서 ㄱ은 자기 수의{multipliers[2]}배를 더 받았으므로 원래 수의{multipliers[2]+1}배가 됩니다. 이동 직전 ㄱ은{m}÷{multipliers[2]+1}＝{rows[2][0]}개,ㄷ은{m}＋{multipliers[2]}×{rows[2][0]}＝{rows[2][2]}개입니다.',f'둘째 이동도 같은 원리로 ㄷ은{rows[2][2]}÷{multipliers[1]+1}＝{rows[1][2]}개,ㄴ은{rows[2][1]}＋{multipliers[1]}×{rows[1][2]}＝{rows[1][1]}개였습니다.',f'첫 이동 직전 ㄴ은{rows[1][1]}÷{multipliers[0]+1}＝{initial[1]}개입니다. ㄱ은{rows[1][0]}＋{multipliers[0]}×{initial[1]}＝{initial[0]}개,ㄷ은{initial[2]}개입니다.',f'순서대로 다시 옮긴 결과가 답안 표와 같고 처음과 끝의 총수는 모두{sum(final)}개입니다. 매번 이동 직전 받는 바구니의 수를 기준으로 합니다.'],'받는 바구니가 몇 배가 되는지 구분하고 서로 다른 세 배수의 이동 역산하기','three unequal receiver multipliers and invertible transfer equations',solutionTable=dict(headers=['상태','ㄱ','ㄴ','ㄷ'],rows=[[label]+list(map(str,row))for label,row in zip(['처음','첫 이동 후','둘째 이동 후','마지막'],rows)]))

assert len(items)==len({x['id']for x in items})==270 and items[:180]==prior
for no in range(1,19):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable']},ensure_ascii=False,sort_keys=True)for x in items})==270
for x in items:
 if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in old if y['id']==x['id']).items())
data.update(version=version,items=items,availableSourceNos=list(range(1,19)),pendingSourceNos=list(range(19,31)),preservedLegacyCount=50,newAuthoredCount=220);data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('Authored270 Applied3:previous180 exact;new90slots80new+10approved middle;output/independent gates pending')

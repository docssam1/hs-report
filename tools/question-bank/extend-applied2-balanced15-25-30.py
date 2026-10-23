"""Append the final six Applied2 source groups without rebuilding the released360."""
import collections, copy, itertools, json, math, shutil, subprocess, sys
from fractions import Fraction
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
FILE=ROOT/'bank/data/applied2-balanced15.json'
current=FILE.read_bytes()
before=subprocess.check_output(['git','show','90d0bfd7:bank/data/applied2-balanced15.json'],cwd=ROOT)
if current!=before:
    assert '--replace-own-pending' in sys.argv
    candidates=json.loads(current)
    assert candidates['version']=='20261024-applied2-balanced15-r5'
    assert candidates['items'][:360]==json.loads(before)['items']
    assert len(candidates['items'])==450
    assert all(x['reviewStatus']=='pending-output-review'for x in candidates['items'][360:]if not x.get('preservedApprovedId'))
data=json.loads(before);items=data['items'];assert len(items)==360
legacy=json.loads((ROOT/'bank/data/applied2-expanded.json').read_text())['items']
version='20261024-applied2-balanced15-r5'
for no in [25,26,27,29,30]:
    for old in [x for x in legacy if x['sourceNo']==no][:5]:
        x=copy.deepcopy(old);assert x['pointBand']=='4.2'
        x.update(practiceLevel='high',sourcePointBand='4.2',preservedApprovedId=x['id'],
          practiceRole='원문 수준 연습',practiceStorageVersion=version,
          levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True))
        items.append(x)

meta={25:('수와 식','거꾸로 풀기','봉지에 나누어 담기 전의 수'),
  26:('수와 식','나이와 관계식','변하지 않는 나이 차'),
  27:('수와 식','곱셈과 자릿수','부분 곱과 빈자리의 관계'),
  28:('도형','입체 격자의 개수','크기와 위치가 다른 직육면체'),
  29:('수와 식','수의 크기와 자리','숫자를 지운 뒤의 최소 수'),
  30:('경우의 수','합이 정해진 조합','카드 개수와 합의 두 비')}
roles={25:{'low':'봉지 한 번의 역연산과 처음 먹은 수 복원','middle':'두 번의 같은 나눔을 반대 순서로 복원'},
  26:{'low':'두 나이 차와 현재 합에서 막내 나이 계산','middle':'태어날 때의 배수와 형 사이 나이 차로 두 차를 도출'},
  27:{'low':'두 인수가 보이는 세로셈에서 첫 부분 곱 계산','middle':'완전한 첫 부분 곱과 세 자리 수의 범위로 두 빈자리 역산'},
  28:{'low':'세 모서리 길이가 모두 정해진 한 크기의 위치 세기','middle':'하나의 길이 또는 정육면체 조건으로 크기를 분류',
      'high':'부피·모서리 관계·포함/제외 위치 등 두 조건을 동시에 분류'},
  29:{'low':'짧은 숫자열에서 앞자리 우선 비교','middle':'이어 쓴 자연수의 경계와 0·남길 자리 수를 함께 판단'},
  30:{'low':'여섯 카드 중 두 장의 합으로 가능한 짝 분류','middle':'아홉 카드 중 세 장을 가장 큰 수에 따라 중복 없이 분류'}}

def add(no,level,p,text,answer,labels,steps,point,method,**extra):
    v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    area,subarea,detail=meta[no]
    axes=dict(prerequisite='원문의 역연산·나이 차·부분 곱·입체 격자·자리 비교·카드 조합',
      reasoning=roles[no][level],conditionTracking='지문에 있는 실제 연산 순서·자리·길이·비를 대응',
      caseSplitting='단일 크기/한 부분에서 여러 크기·자리 후보·세 카드의 분류로 확장',
      computation='수치 크기만 늘리지 않고 역연산 횟수·자료 노출·분류 조건을 변경',
      representation='28번 원본 그림 그대로;27번은 같은 자리 정렬의 세로셈 수학 자료',
      reading='조건은 자연스러운 지문과 필수 숫자열/세로셈/카드에만 제시',
      visualCues='문제 아래 조건 요약·힌트·완성된 풀이 그림 없음',
      shortcuts='먹은 수 복원 순서·출생0살·부분 곱의 자리 이동·회전 금지·선두0·주머니 구별')
    x=dict(id=f'applied2-q{no:02d}-{level}-v{v}',genId=f'applied2-q{no:02d}',sourceSet='applied',
      sourceRound=2,sourceNo=no,variantNo=v,area=area,subarea=subarea,detailType=detail,
      learningLocation=f'활용 2회 · 원문 {no}번 · {detail}',learningPoint=point,
      practiceLevel=level,sourcePointBand='4.2',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],
      practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,
      reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answer)),answerParts=answer,
      answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],
      solutionSteps=steps,solution=' '.join(steps),difficultyEvidence=dict(basis='designed-practice-point-band',
      label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
      levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level!='high'else'extension',measured=False,axes=axes),
      verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied2-balanced15-independent-validate.py',
      sourceExamPage=5 if no<=28 else 6,sourceAnswerPage=7,studentDifficultyMeasured=False))
    if no==28:x['asset']=dict(kind='raster',src='assets/applied2/cuboids-original.png',
      description='현행 원본28번:정면 가로5칸·높이3칸·깊이3칸의 격자,선/색/시점 그대로.')
    x.update(extra);assert len(steps)>=3;items.append(x)

frac='<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>1</mn><mn>3</mn></mfrac></math>'
for level,bags,remaining_values in [('low',1,[8,10,14,16,18]),('middle',2,[8,12,16,20,24])]:
    for remaining in remaining_values:
        n=Fraction(remaining);trace=[]
        for _ in range(bags):
            old=n;n=n*3/2+6;assert n.denominator==1
            trace.append(f'{old.numerator}÷2×3＋6＝{n.numerator}')
        answer=n.numerator+11
        text=f'귤 한 상자에서11개를 먹었습니다. 남은 귤에서 먼저6개를 봉지에 넣고,그 뒤 남은 귤의{frac}도 같은 봉지에 넣었습니다. '
        if bags==2:text+='남은 귤로 같은 방법을 한 번 더 하여 모두2봉지를 만들었습니다. '
        text+=f'이제 상자에 귤이{remaining}개 남았습니다. 처음 상자에 있던 귤은 몇 개입니까?'
        steps=['한 봉지에 먼저6개를 넣은 뒤 나머지의3분의1을 더 넣으므로,상자에는 그 나머지의3분의2가 남습니다.',
          '봉지를 만들기 전으로 돌아갈 때에는 남은 수를2로 나누고3배 한 뒤6개를 더합니다.',
          '마지막 봉지부터 거슬러 계산하면 '+',그 앞은 '.join(trace)+'개입니다.',
          f'처음 먹은11개도 되돌리면{n.numerator}＋11＝{answer}개입니다.']
        add(25,level,dict(remaining=remaining,bags=bags,fixed=6,eat=11),text,[answer],['처음 귤 개수'],steps,
          '먼저 덜어 낸 수와 분수를 취한 나머지를 반대 순서로 복원하기','exact inverse affine map')

for total in [21,24,27,30,33]:
    young=(total-12)//3
    add(26,'low',dict(currentSum=total,eldestGap=9,middleGap=3),
      f'세 형제 중 큰형은 막내보다9살 많고,둘째 형은 막내보다3살 많습니다. 지금 세 형제 나이의 합이{total}살일 때 막내는 몇 살입니까?',
      [young],['막내 나이'],['막내 나이를 세 번 더한 값에는 큰형과의 차9살과 둘째와의 차3살이 더해져 있습니다.',
        f'나이의 합에서 두 차를 빼면{total}−9−3＝{total-12}입니다.',
        f'따라서 막내는{total-12}÷3＝{young}살입니다. 실제 나이는{young+9},{young+3},{young}살로 합이{total}살입니다.'],
      '같은 막내 나이를 기준으로 두 차를 빼고 세 등분하기','fixed age-gap equation')
for total in [36,42,45,54,57]:
    young=(total-12)//3
    add(26,'middle',dict(currentSum=total,eldestMiddleGap=6,birthRatio=3),
      f'막내가 태어났을 때 큰형의 나이는 둘째 형의3배였습니다. 큰형과 둘째 형의 나이 차는6살이고,지금 세 형제 나이의 합은{total}살입니다. 지금 막내는 몇 살입니까? 태어난 해의 나이는0살로 셉니다.',
      [young],['막내 나이'],['막내가 태어났을 때 둘째 형의 나이를 한 묶음으로 보면 큰형은 세 묶음입니다. 두 형의 차6살은 두 묶음에 해당합니다.',
        '그때 둘째는6÷2＝3살,큰형은3×3＝9살이므로 막내와의 나이 차는 각각3살과9살입니다.',
        f'현재 합에서 두 차를 빼고 나누면({total}−9−3)÷3＝{young}살입니다.',
        f'지금 큰형{young+9}살·둘째{young+3}살·막내{young}살을 더하면{total}살이고 두 형의 차도6살입니다.'],
      '출생 시점의 배수와 일정한 나이 차를 현재 합에 연결하기','birth ratio plus invariant age gap')

def arithmetic(a,b,level):
    u=a*(b%10);t=a*(b//10)
    assert 100<=u<=999 and 1000<=t<=9999 and 10000<=a*b<=99999
    if level=='low':top,base,unit=str(a),str(b),'□□□'
    else:top,base,unit=str(a)[0]+'□'+str(a)[2],str(b//10)+'□',str(u)
    return ['    '+top,'×    '+base,'───────','    '+unit,'  □□□□ ','───────','  □□□□□']
for a,b in [(231,53),(246,63),(327,52),(418,62),(536,51)]:
    u=a*(b%10)
    add(27,'low',dict(query='unitsPartial'),
      '다음 세로셈에서 첫째 가로선 바로 아래의 세 자리 수를 완성하시오.',[u],['첫 부분 곱'],
      [f'첫 부분 곱은{a}에 두 자리 수의 일의 자리{b%10}을 곱한 값입니다.',
       f'일의 자리부터 곱하고 올림을 반영하면{a}×{b%10}＝{u}입니다.',
       f'따라서 첫째 가로선 바로 아래에는{u}를 씁니다. 이 부분 곱은 십의 자리에서 나온 줄과 자리를 옮겨 더하기 전의 값입니다.'],
      '일의 자리와 곱한 부분 곱을 세로셈에서 읽고 계산하기','place-aligned partial multiplication',arithmeticRows=arithmetic(a,b,'low'))
for a in [235,245,265,275,295]:
    b=53;u=a*3
    add(27,'middle',dict(query='product'),
      '□에 알맞은 숫자를 넣어 세로셈을 완성할 때 맨 아래의 다섯 자리 수를 구하시오.',[a*b],['다섯 자리 곱'],
      [f'세 자리 수는2□5이고 첫 부분 곱은{u}입니다. 일의 자리와 곱한 결과의 일의 자리가5이므로 곱하는 일의 자리는 홀수입니다.',
       f'1·3·5·7·9로 각각 나누어,몫이2□5 모양인 경우를 찾습니다. {u}÷3＝{a}만 맞으므로 두 수는{a}와53입니다.',
       f'십의 자리 부분 곱은{a}×5＝{a*5}이며 한 자리 왼쪽에서 더합니다.',
       f'따라서{u}＋{a*5}×10＝{a*b}입니다. 첫 부분 곱과 두 인수의 모든 표시 자리가 맞습니다.'],
      '첫 부분 곱과 세 자리 범위로 일의 자리를 역산한 뒤 자리 이동하기','partial-product finite factor search',arithmeticRows=arithmetic(a,b,'middle'))

shutil.copyfile(ROOT/'.private-work/balanced15-20261024/round2-batch5/cuboids-native.png',ROOT/'bank/assets/applied2/cuboids-original.png')
intro='그림의 작은 정육면체 모서리를 한 칸으로 셉니다. 그림의 격자선을 따라 만들어지는 직육면체를 세며,모서리 방향은 그림과 같습니다. '
def dimensions_count(w,h,d):return (6-w)*(4-h)*(4-d)
all_boxes=[(w,h,d,dimensions_count(w,h,d))for w in range(1,6)for h in range(1,4)for d in range(1,4)]
assert sum(t[3]for t in all_boxes)==540
for w,h,d in [(1,1,1),(2,1,1),(1,2,1),(1,1,2),(2,2,1)]:
    answer=dimensions_count(w,h,d)
    add(28,'low',dict(mode='fixed',lengths=[w,h,d]),intro+f'정면을 기준으로 가로{w}칸·높이{h}칸·깊이{d}칸인 직육면체는 몇 개입니까?',
      [answer],['직육면체 수'],['원본 그림은 정면 가로5칸·높이3칸·깊이3칸입니다. 같은 크기라도 위치가 다르면 다른 직육면체입니다.',
        f'가로 시작 위치는5−{w}＋1＝{6-w}곳,높이 시작 위치는3−{h}＋1＝{4-h}곳,깊이 시작 위치는3−{d}＋1＝{4-d}곳입니다.',
        f'세 방향의 시작 위치를 각각 고르므로{6-w}×{4-h}×{4-d}＝{answer}개입니다.'],
      '정해진 세 길이의 시작 위치를 각각 세고 곱하기','product of valid starting positions')
middle=[('width2','가로 길이가2칸인 직육면체는 모두 몇 개입니까?',lambda w,h,d:w==2),
 ('height1','높이가1칸인 직육면체는 모두 몇 개입니까?',lambda w,h,d:h==1),
 ('depth2','깊이가2칸인 직육면체는 모두 몇 개입니까?',lambda w,h,d:d==2),
 ('squareFront','정면을 기준으로 가로 길이와 높이가 같은 직육면체는 모두 몇 개입니까?',lambda w,h,d:w==h),
 ('cube','정육면체는 크고 작은 것을 모두 합하여 몇 개입니까?',lambda w,h,d:w==h==d)]
for mode,question,pred in middle:
    chosen=[t for t in all_boxes if pred(*t[:3])];answer=sum(t[3]for t in chosen)
    rows=[[str(w),str(sum(c for a,h,d,c in chosen if a==w))]for w in range(1,6)if any(a==w for a,h,d,c in chosen)]
    detail_steps={
      'width2':['가로2칸의 시작 위치는4곳입니다. 높이1·2·3칸의 위치는3·2·1곳이므로 모두6곳이고,깊이도 모두6곳입니다. 따라서4×6×6＝144개입니다.'],
      'height1':['가로1~5칸의 시작 위치는5＋4＋3＋2＋1＝15곳입니다. 높이1칸은3곳,깊이1~3칸은3＋2＋1＝6곳이므로15×3×6＝270개입니다.'],
      'depth2':['가로 길이와 위치를 고르는 방법은5＋4＋3＋2＋1＝15가지,높이는3＋2＋1＝6가지입니다. 깊이2칸은2곳이므로15×6×2＝180개입니다.'],
      'squareFront':['가로와 높이를1칸으로 맞추면5×3×6＝90개,2칸이면4×2×6＝48개,3칸이면3×1×6＝18개입니다. 깊이의 길이와 위치는 매번3＋2＋1＝6가지입니다.'],
      'cube':['한 모서리가1칸인 것은5×3×3＝45개,2칸인 것은4×2×2＝16개,3칸인 것은3×1×1＝3개입니다. 높이와 깊이가3칸이므로 더 큰 정육면체는 없습니다.']}
    add(28,'middle',dict(mode=mode),intro+question,[answer],['개수'],
      ['그림의 전체 길이는 가로5칸·높이3칸·깊이3칸입니다. 한 크기의 개수는 세 방향 시작 위치의 수를 곱하여 구합니다.',
       '길이를 가로w칸·높이h칸·깊이d칸으로 쓰면 시작 위치는 각각6−w,4−h,4−d곳입니다. 물음에 맞는 길이만 고릅니다.',
       *detail_steps[mode],
       '따라서 '+'＋'.join(row[1]for row in rows)+f'＝{answer}개입니다.'],
      '고정한 길이 또는 같은 길이 조건으로 크기를 분류한 뒤 위치 세기','dimension classification and starting-position product',
      solutionTable=dict(label='가로 길이별 개수',headers=['가로(칸)','개수'],rows=rows))
high=[('evenNoncube','부피가 작은 정육면체의 짝수 배이고 정육면체는 아닌 직육면체는 몇 개입니까?',lambda w,h,d:w*h*d%2==0 and not w==h==d),
 ('wideEven','정면에서 가로 길이가 높이보다 길고,부피가 작은 정육면체의 짝수 배인 직육면체는 몇 개입니까?',lambda w,h,d:w>h and w*h*d%2==0),
 ('sum7volume12','가로·높이·깊이의 칸 수를 더하면7이고,부피가 작은 정육면체12개 이상인 직육면체는 몇 개입니까?',lambda w,h,d:w+h+d==7 and w*h*d>=12),
 ('distinctEven','가로·높이·깊이의 길이가 서로 모두 다르고,부피가 작은 정육면체의 짝수 배인 직육면체는 몇 개입니까?',lambda w,h,d:len({w,h,d})==3 and w*h*d%2==0)]
for mode,question,pred in high:
    chosen=[t for t in all_boxes if pred(*t[:3])];answer=sum(t[3]for t in chosen)
    rows=[[str(w),str(sum(c for a,h,d,c in chosen if a==w))]for w in range(1,6)]
    detailed={
      'evenNoncube':['전체 직육면체는(5＋4＋3＋2＋1)×(3＋2＋1)×(3＋2＋1)＝540개입니다.',
        '부피가 홀수이려면 세 길이가 모두 홀수여야 합니다. 가로1·3·5칸의 위치는5＋3＋1＝9곳,높이와 깊이1·3칸의 위치는각각3＋1＝4곳이므로 홀수 부피는9×4×4＝144개입니다.',
        '짝수 부피의 정육면체는 모서리2칸짜리뿐이며4×2×2＝16개입니다. 따라서540−144−16＝380개입니다.'],
      'wideEven':['가로1칸이면 그보다 낮은 높이가 없어0개입니다. 가로2칸이면 높이1칸이고 깊이는모두 가능하여4×3×6＝72개입니다.',
        '가로3칸이면 높이1칸일 때 깊이2칸만 가능하여3×3×2＝18개,높이2칸일 때는깊이가 자유로워3×2×6＝36개입니다. 합은54개입니다.',
        '가로4칸이면 높이1~3칸이 모두더 짧고 부피도 짝수입니다. 시작 위치는2×6×6＝72곳입니다.',
        '가로5칸이면 높이와 깊이중 하나는 짝수여야 합니다. 전체6×6에서 두 길이가모두홀수인4×4를 빼면20개입니다. 따라서72＋54＋72＋20＝218개입니다.'],
      'sum7volume12':['가로·높이·깊이의 합이7이면서 부피가12이상인 길이 묶음은(2,2,3),(2,3,2),(3,2,2)뿐입니다. 예를들어(1,3,3)은합은7이지만부피9라서 제외합니다.',
        '세 묶음의 시작 위치 수는각각4×2×1＝8,4×1×2＝8,3×2×2＝12입니다.',
        '가로·높이·깊이를 구별하여 세 경우를더하면8＋8＋12＝28개입니다.'],
      'distinctEven':['가로1칸이면 높이·깊이는2와3을 서로바꾸는 두경우입니다.5×2×1×2＝20개입니다. 가로2칸이면 높이·깊이는1과3이므로4×3×1×2＝24개입니다.',
        '가로3칸이면 높이·깊이는1과2이므로3×3×2×2＝36개입니다.',
        '가로4칸이면 부피는항상짝수이고 높이·깊이만다르면됩니다. 두방향 전체36가지에서 같은길이의 위치9＋4＋1＝14가지를빼고 가로위치2를곱하면44개입니다.',
        '가로5칸이면 높이·깊이중 하나는2,다른하나는1또는3입니다. 두순서를고려하면2×(2×3＋2×1)＝16개입니다. 따라서20＋24＋36＋44＋16＝140개입니다.']}
    add(28,'high',dict(mode=mode),intro+question,[answer],['직육면체 수'],
      ['전체 길이는 가로5칸·높이3칸·깊이3칸입니다. 가로·높이·깊이의 방향을 서로 바꾸어 같은 크기로 처리하지 않습니다.',
       '각 길이를w,h,d칸으로 두면 부피는작은 정육면체w×h×d개이고,그 크기의 시작 위치는(6−w)(4−h)(4−d)곳입니다.',
       *detailed[mode],
       '따라서 '+'＋'.join(row[1]for row in rows)+f'＝{answer}개입니다. 한 조건만 만족하는 크기는 넣지 않습니다.'],
      '부피와 모서리 길이의 두 조건을 함께 적용하여 크기와 위치를 분류하기','finite dimensions with weighted placements',
      solutionTable=dict(label='두 조건을 만족한 가로별 개수',headers=['가로(칸)','개수'],rows=rows))
selected=[]
for x0,x1 in itertools.combinations(range(6),2):
 for y0,y1 in itertools.combinations(range(4),2):
  for z0,z1 in itertools.combinations(range(4),2):
   contains=lambda x,y,z:x0<x<=x1 and y0<y<=y1 and z0<z<=z1
   if contains(3,2,2)and not contains(1,1,1):selected.append((x1-x0,y1-y0,z1-z0))
counts=collections.Counter(w for w,h,d in selected);answer=len(selected)
add(28,'high',dict(mode='centerWithoutCorner'),intro+'작은 정육면체의 위치는 정면에서 왼쪽부터 가로,아래부터 높이,앞에서 뒤로 깊이 순으로 셉니다. 가로3번째·높이2번째·깊이2번째의 작은 정육면체는 포함하고,가로1번째·높이1번째·깊이1번째의 작은 정육면체는 포함하지 않는 직육면체는 몇 개입니까?',
  [answer],['직육면체 수'],['가로3번째 칸을 포함하려면 왼쪽 경계3곳·오른쪽 경계3곳 중 하나씩 고릅니다. 높이2번째와 깊이2번째를 포함하는 경계는 각 방향에2×2가지입니다.',
    '따라서 가운데 지정 칸을 포함하는 직육면체는3×3×2×2×2×2＝144개입니다.',
    '그중 모서리의1·1·1번째 칸도 포함하려면 왼쪽·아래·앞 경계가 모두0이어야 합니다. 반대쪽 경계는 각각3·2·2곳이므로3×2×2＝12개입니다.',
    f'가운데 칸은 포함하고 모서리 칸은 제외하는 개수는144−12＝{answer}개입니다.'],
  '포함할 단위 칸의 경계 선택에서 제외할 칸도 포함한 경우를 빼기','six boundary choices and inclusion exclusion',
  solutionTable=dict(label='가로 길이별 확인',headers=['가로(칸)','개수'],rows=[[str(w),str(counts[w])]for w in range(1,6)]))

def minimum_subsequence(source,delete):
    n=len(source)-delete;pos=0;chosen=[]
    for k in range(n):
        end=len(source)-(n-k-1)
        choices=[i for i in range(pos,end)if k or source[i]!='0']
        i=min(choices,key=lambda i:(source[i],i));chosen.append(i);pos=i+1
    return ''.join(source[i]for i in chosen),chosen
for level,cases in [('low',[('5274136',2),('3816254',3),('6431527',2),('4752316',3),('7362415',2)]),
                    ('middle',[(n,d)for n,d in [(12,6),(14,8),(16,10),(18,12),(20,14)]])]:
    for value,delete in cases:
        source=value if level=='low'else''.join(map(str,range(1,value+1)))
        answer,indices=minimum_subsequence(source,delete);keep=len(answer)
        p=dict(delete=delete,source=source)if level=='low'else dict(delete=delete,**{'from':1,'to':value})
        lead='아래 숫자열'if level=='low'else f'1부터{value}까지의 자연수를 차례로 이어 쓴 아래 숫자열'
        steps=[f'숫자열은{len(source)}자리이고{delete}개를 지우므로{keep}자리를 남겨야 합니다.',
          '처음 남길 자리부터 비교합니다. 뒤에 필요한 자리 수를 남길 수 있는 범위에서 가장 작은 숫자를 고르며,같은 숫자는 앞의 것을 고릅니다. 첫 자리에서는0을 제외합니다.',
          '왼쪽부터 센 원래 자리 중 '+', '.join(str(i+1)for i in indices)+f'번째를 남기면{keep}자리이며 지운 자리는 정확히{delete}개입니다.',
          f'따라서{answer}입니다. 처음 다른 자리에 더 큰 숫자를 남기면 그 뒤를 어떻게 골라도 이 수보다 작아질 수 없습니다.']
        add(29,level,p,lead+f'에서 숫자{delete}개를 지웁니다. 남은 숫자의 순서는 바꿀 수 없습니다. 첫 자리 숫자가0이 아닌 가장 작은 수를 구하시오.',
          [answer],['가장 작은 수 전체'],steps,'앞자리의 크기와 뒤에 남겨야 할 자리 수를 함께 비교하기',
          'left-to-right feasible-window subsequence',promptDataLines=[source])

card_sets={
 'low':[[1,2,3,4,5,6],[1,2,3,4,5,9],[1,2,3,5,7,9],[1,3,4,5,6,8],[2,3,4,6,7,8]],
 'middle':[[1,2,3,4,5,6,7,8,9],[1,2,3,4,5,6,7,8,12],[1,2,3,4,5,6,8,10,12],
           [2,3,4,5,6,7,8,9,10],[1,3,4,5,6,7,8,9,11]]}
for level,sets in card_sets.items():
    for cards in sets:
        total=sum(cards);assert total%3==0
        count=len(cards)//3;target=total//3
        valid=[c for c in itertools.combinations(cards,count)if sum(c)==target];assert valid
        grouped=collections.defaultdict(list)
        for c in valid:grouped[c[-1]].append(c)
        steps=[f'B의 카드 수가A의2배이므로 A에는{len(cards)}÷3＝{count}장,B에는{2*count}장을 넣습니다.',
          f'전체 숫자의 합은{total}이고 B의 합도A의2배이므로 A의 합은{total}÷3＝{target}입니다.']
        rows=[]
        for largest,groups in sorted(grouped.items(),reverse=True):
            steps.append(f'A의 가장 큰 수가{largest}일 때 가능한 '+('짝'if count==2 else'세 수')+'은 '+', '.join('('+', '.join(map(str,c))+')'for c in groups)+f'의{len(groups)}가지입니다.')
            rows.append([str(largest),str(len(groups))])
        steps.append(f'가장 큰 수로 나눈 경우는 서로 겹치지 않습니다. 모두 합하면{len(valid)}가지이며,A를 정하면 B도 하나로 정해집니다. 주머니 안의 순서는 세지 않습니다.')
        add(30,level,dict(cards=cards,countRatio=2,sumRatio=2),
          f'아래 수 카드{len(cards)}장을 구별되는 두 주머니A,B에 모두 나누어 넣습니다. B에 넣는 카드 수는A의2배이고,카드에 적힌 수의 합도 B가A의2배가 되게 하는 방법은 몇 가지입니까? 주머니 안에서 카드의 순서는 구별하지 않습니다.',
          [len(valid)],['나누는 방법 수'],steps,'개수 비와 합의 비를 각각 적용하고 가장 큰 카드로 경우를 나누기',
          'finite subsets classified by largest member',cards=cards,
          solutionTable=dict(label='A의 가장 큰 수별 경우',headers=['가장 큰 수','경우 수'],rows=rows))

assert len(items)==len({x['id']for x in items})==450
assert items[:360]==json.loads(before)['items']
assert len({json.dumps({k:x.get(k)for k in ['text','givenTable','arithmeticRows','promptDataLines','asset','cards','responseTable']},ensure_ascii=False,sort_keys=True)for x in items})==450
for no in range(1,31):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for x in items:
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in legacy if y['id']==x['id']).items())
data.update(version=version,availableSourceNos=list(range(1,31)),pendingSourceNos=[],newAuthoredCount=380,preservedLegacyCount=70)
data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored final90:65new+25approved high;prior360 unchanged;30candidate5/5/5 groups')

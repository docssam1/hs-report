"""Add six finite reviewed-source groups; never reset the released first90 items."""
import collections
import copy
import hashlib
import itertools
import json
import subprocess
from fractions import Fraction
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
FILE=ROOT/'bank/data/applied2-balanced15.json'
before=FILE.read_bytes()
assert before==subprocess.check_output(['git','show','719eb888:bank/data/applied2-balanced15.json'],cwd=ROOT)
data=json.loads(before);assert len(data['items'])==90 and all(x['reviewStatus']=='verified'for x in data['items'])
old_bytes=(ROOT/'bank/data/applied2-expanded.json').read_bytes();old=json.loads(old_bytes)['items']
version='20261024-applied2-balanced15-r2';items=data['items']
for no in [8,10,11,12]:
    for original in [x for x in old if x['sourceNo']==no][:5]:
        x=copy.deepcopy(original);assert x['pointBand']=='2.7'
        x.update(practiceLevel='low',sourcePointBand='2.7',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True))
        items.append(x)

meta={n:{k:copy.deepcopy(next(x for x in old if x['sourceNo']==n)[k])for k in ['area','subarea','learningLocation']}for n in [8,10,11,12]}
meta.update({7:dict(area='수와 식',subarea='연결된 수량과 합',learningLocation='활용 2회 · 원문 7번 · 연결된 우리와 수량의 합'),
             9:dict(area='수와 식',subarea='세 수의 합',learningLocation='활용 2회 · 원문 9번 · 두 접시씩의 합')})
assets={7:dict(kind='raster',src='assets/applied2/coops-original.png',description='원본 네 우리와 다섯 다리. 위치·선·색과19/19/22/21/21을 그대로 보존한 그림.'),
        9:dict(kind='raster',src='assets/applied2/plates-original.png',description='원본 가·나·다 세 접시와24/20/32. 모든 위치·라벨·수치를 그대로 보존한 그림.'),
        12:copy.deepcopy(next(x for x in old if x['sourceNo']==12)['asset'])}


def frac(value):
    f=Fraction(value)
    return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{f.numerator}</mn><mn>{f.denominator}</mn></mfrac></math>'


def axes(no,level):
    reasoning,tracking,cases={
      (7,'low'):('연결된 두 합의 차를 이용해 특정 우리 수량 결정','네 우리·다섯 다리·물음의 위치','전체 대신 한 자리/한 쌍의 수량을 찾아 기초 보완'),
      (7,'middle'):('그림의 처음 수량에서 추가한 뒤 두 우리를 같게 만드는 이동 역산','처음 그림/추가/이동 후를 구분·같은 마릿수','원문 합 추론 뒤 두 수의 차를 반으로 나누는 추가 조건'),
      (7,'high'):('한 우리에서 세 우리로1:2:3배 이동한 뒤 두 우리 합과 비교','처음 네 수량·추가 수·같은 출발 우리·세 이동 배수·최종 합','빠져나간6몫과 왼쪽으로 늘어난3몫을 함께 추적'),
      (8,'middle'):('생애 분수끼리의 차로 전체를 역산한 뒤 노년의 나머지 계산','젊은 기간과 어린 기간의 차·겹치지 않는 세 기간·나머지','남은 기간에서 직접 전체를 찾던 원문을 분수 차의 역산으로 변경'),
      (8,'high'):('두 사람의 서로 다른 남은 분수와 같은 노년 기간을 결합','두 사람의 각 세 분수·같은 노년·생애 합·답 순서','남은 분모의 비를 만들고 생애 합을 두 사람에게 배분'),
      (9,'low'):('두 접시씩의 합을 비교해 한 접시 또는 전체 합 찾기','세 접시·세 변의 합·가/나/다 위치','원문 세 답을 한 수량 또는 한 성질로 줄인 기초 보완'),
      (9,'middle'):('접시의 처음 수량에서 추가와 이동을 반영해 두 배 조건 역산','처음 그림·나에 추가·나에서 가로 이동·최종 두 배','옮긴 한 개가 나를1줄이고 가의 두 배를2늘리는 영향 결합'),
      (9,'high'):('세 접시를 순환하는1:3:2배 이동의 순서와 최종 합 조건 결합','다에 추가·가→나/나→다/다→가 순서·최종2가+나','각 이동에서 빠지고 들어온 양을 구분하고 실제 이동 가능성도 확인'),
      (10,'middle'):('앞뒤1:2 조건을 세로 줄 수의 나머지와 약수 조건으로 결합','가로A명/세로B줄·앞에도 학생 있음·뒤가 앞의2배','단순 홀수 약수 대신3으로 나눈 나머지1인 약수를 분류'),
      (10,'high'):('두 줄서기의 같은 전체 인원과 가로명수+세로줄수 조건 결합','A/B방향·줄2개 감소·줄마다 증가 인원·처음A+B','사라진 두 줄의 인원을 남은 줄에 배분한 관계와 합을 동시에 사용'),
      (11,'middle'):('세 예측의 배제 조건과 다섯 선수의 서로 다른 순위를 전파','첫 두 행 모두 틀림·셋째 지정 한 자리만 맞음·전원 순위','알려진 한 자리에서 후보 제거를 여러 열로 이어야 하며 세 행 모두 필요'),
      (11,'high'):('맞힌 개수1/2와 지정 한 자리·인접 순위를 함께 분류','여섯 선수·세 표·첫 두 표의 정답 개수·셋째 한 자리·A바로뒤B','인접조건 후보들을 직접 나열하고 맞힌 개수로 걸러야 하며 어느 조건도 생략 불가'),
      (12,'middle'):('연속 두 회의 새 타일 합에서 앞 회차 역산 후 색 판정','새 타일/누적 타일 구분·연속 두 회·첫 회 흰색','각 회의 증가량 차4를 이용해 두 미지 수량을 분리'),
      (12,'high'):('두 벽의 회차 차와 누적 검은 타일 합을 함께 역산','둘 다 흰 타일 직후 중단·회차 차·검은색 누적합·마지막 새 흰 타일','홀수 중단 조건이 인접한 짝수 회의 같은 검은 누적량을 배제'),
    }[(no,level)]
    return dict(prerequisite='원문의 연결합·분수 전체량·배열 약수·순위 배제·타일 테두리 사고에 기초',reasoning=reasoning,conditionTracking=tracking,caseSplitting=cases,
      computation='단순 큰 수 변경이 아니라 미지량/이동 단계/조건 결합/경우 분류를 구분',representation='7/9/12의 원본 그림·수치·방향·색·라벨 보존;11은 필수 예측 자료 표',
      reading='처음과 나중·추가와 이동·가로와 세로·누적과 이번 회·응답 순서를 지문 안에서 확정',visualCues='조건 요약·풀이 순서·보조선·그림 속 완성 수량·답 단서 없음',
      shortcuts='7/9원본 수량만 복사해서 추가 물음의 답을 얻지 못함;8차/합 조건 필요;10중급은 앞뒤 조건, 상급은 두 배치 관계와 합 조건 필요;11각 예측/인접 조건 제거시 다른 응답 가능;12흰색 중단과 회차 차 필요')


def add(no,level,p,text,answer,labels,steps,detail,point,method,**extra):
    v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    x=dict(**meta[no],id=f'applied2-q{no:02d}-{level}-v{v}',genId=f'applied2-q{no:02d}',sourceSet='applied',sourceRound=2,sourceNo=no,variantNo=v,
      practiceLevel=level,sourcePointBand='2.7',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,
      reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],
      solutionSteps=steps,solution=' '.join(steps),detailType=detail,learningPoint=point,
      difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
      levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',measured=False,axes=axes(no,level)),
      verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied2-balanced15-independent-validate.py',sourceExamPage=3 if no==12 else 2,sourceAnswerPage=2 if no==7 else 3,studentDifficultyMeasured=False))
    if no in assets:x['asset']=copy.deepcopy(assets[no])
    x.update(extra);assert len(steps)>=3;items.append(x)


coop_intro='다리의 숫자는 처음에 양쪽 우리에 있던 병아리 수의 합입니다. '
coop_steps=['왼쪽 아래와 오른쪽 위는 각각 왼쪽 위와의 합이19이므로 마릿수가 같습니다. 오른쪽 아래와 이 두 우리 중 하나의 합은21이고, 왼쪽 위와 오른쪽 아래의 합은22입니다.',
            '두 합22와21의 차에서 왼쪽 위가 왼쪽 아래보다1마리 많습니다. 두 수의 합이19이므로 왼쪽 위는10마리, 왼쪽 아래는9마리입니다.',
            '따라서 처음 마릿수는 왼쪽 위10, 왼쪽 아래9, 오른쪽 아래12, 오른쪽 위9입니다. 다섯 다리의 합도19,19,22,21,21로 모두 맞습니다.']
for query,position,answer in [('TL','왼쪽 위',10),('BL','왼쪽 아래',9),('BR','오른쪽 아래',12),('TR','오른쪽 위',9),('BL+TR','왼쪽 아래와 오른쪽 위를 합친',18)]:
    add(7,'low',dict(query=query),coop_intro+(position+' 우리에 있던 병아리는 모두 몇 마리입니까?'if query!='BL+TR'else'왼쪽 아래 우리와 오른쪽 위 우리에 있던 병아리는 모두 몇 마리입니까?'),[answer],['병아리 수'],coop_steps+[f'물음의 위치에 해당하는 병아리 수는{answer}마리입니다.'],
        '연결된 두 합에서 특정 우리 수량 찾기','같은 수와 두 합의 차로 한 우리 수량을 결정하기','recover fixed graph node counts and select specified nodes')
for extra in [1,3,5,7,9]:
    moved=(12+extra-9)//2
    add(7,'middle',dict(added=extra),coop_intro+f'오른쪽 아래 우리에 병아리 {extra}마리를 더 넣었습니다. 그 뒤 이 우리에서 왼쪽 아래 우리로 몇 마리를 옮겨 두 우리에 같은 수의 병아리가 있게 하려 합니다. 몇 마리를 옮겨야 합니까?',
        [moved],['옮길 병아리 수'],coop_steps+[f'더 넣은 뒤 오른쪽 아래는{12+extra}마리, 왼쪽 아래는9마리입니다. 한 마리를 옮기면 두 우리 마릿수의 차가2씩 줄어듭니다.',f'따라서({12+extra}−9)÷2＝{moved}마리를 옮깁니다. 두 우리 모두{9+moved}마리로 같습니다.'],
        '처음 수량과 두 우리를 같게 하는 이동','이동 전 수량의 차와 한 마리 이동의 두 방향 변화를 연결하기','fixed graph then half the post-addition difference')
for one in [3,4,5,6,7]:
    extra=7+9*one
    add(7,'high',dict(added=extra,multipliers=[1,2,3]),coop_intro+f'오른쪽 아래 우리에 {extra}마리를 더 넣고, 이 우리에서 왼쪽 위로 몇 마리를, 왼쪽 아래로는 그2배, 오른쪽 위로는 그3배를 옮겼습니다. 그 뒤 오른쪽 아래 마릿수는 왼쪽 두 우리 마릿수의 합과 같았습니다. 왼쪽 위·왼쪽 아래·오른쪽 위로 옮긴 수를 차례로 구하시오.',
        [one,2*one,3*one],['왼쪽 위로','왼쪽 아래로','오른쪽 위로'],coop_steps+[f'처음 오른쪽 아래는12마리, 왼쪽 두 우리 합은19마리입니다. {extra}마리를 추가한 직후 두 양의 차는12＋{extra}−19＝{extra-7}마리입니다.',
        '왼쪽 위로 옮긴 양을 한 몫이라 하면 오른쪽 아래에서는1＋2＋3＝6몫이 나가고, 왼쪽 두 우리에는1＋2＝3몫이 들어갑니다. 두 양의 차는 모두9몫 줄어듭니다.',
        f'한 몫은({extra}−7)÷9＝{one}마리입니다. 옮긴 수는{one}, {2*one}, {3*one}마리이고, 오른쪽 아래{12+extra-6*one}마리는 왼쪽 두 우리{10+one}＋{9+2*one}마리와 같습니다.'],
        '세 우리로의 배수 이동과 나중 수량의 합','출발 우리에서 빠진 양과 도착 두 우리에 늘어난 양을 동시에 추적하기','three coupled outflows and final equality of two aggregate populations')


for life in [48,60,72,84,96]:
    diff=life//12;elder=life//4
    add(8,'middle',dict(fractions=['1/6','1/4','1/3'],difference=diff),f'한 사람은 생애의 {frac("1/6")}을 어린이로, {frac("1/4")}을 젊은이로, {frac("1/3")}을 장년으로 지내고 나머지를 노인으로 살았습니다. 젊은이로 지낸 기간이 어린이 때보다 {diff}년 길었다면 노인으로 산 기간은 몇 년입니까?',
        [elder],['노년 기간(년)'],[f'젊은이와 어린이 기간의 차는 생애의 {frac("1/4")}−{frac("1/6")}＝{frac("1/12")}입니다.',f'생애의12분의1이{diff}년이므로 전체 생애는{diff}×12＝{life}년입니다.',
        f'세 기간의 합은{frac("1/6")}＋{frac("1/4")}＋{frac("1/3")}＝{frac("3/4")}이므로 노년은 나머지{frac("1/4")}입니다. 따라서{life}÷4＝{elder}년입니다.',f'어린이{life//6}년, 젊은이{life//4}년, 장년{life//3}년, 노년{elder}년의 합과 두 기간의 차도 모두 맞습니다.'],
        '생애의 두 기간 차와 남은 기간','분수의 차로 전체를 역산한 뒤 남은 분수를 적용하기','lifespan from difference of stage fractions then complement')
life_cases=[(['1/4','1/4','3/10'],['1/3','1/4','1/4'],60,72),(['1/8','1/4','3/8'],['1/6','1/4','1/4'],96,72),(['1/3','1/6','1/3'],['1/5','1/5','2/5'],90,75),(['1/4']*3,['1/5','1/4','7/20'],64,80),(['1/7','2/7','5/21'],['1/7','2/7','9/28'],63,84)]
for first,second,life1,life2 in life_cases:
    rest1=1-sum(map(Fraction,first));rest2=1-sum(map(Fraction,second));assert rest1.numerator==rest2.numerator==1 and rest1*life1==rest2*life2
    d1,d2=rest1.denominator,rest2.denominator;units=(life1+life2)//(d1+d2);assert life1==d1*units and life2==d2*units
    def periods(fs):return '어린이·젊은이·장년으로 각각 생애의 '+', '.join(map(frac,fs))+'을 지내고 나머지를 노인으로 살았습니다.'
    add(8,'high',dict(firstFractions=first,secondFractions=second,totalLifespans=life1+life2),'첫째 사람은 '+periods(first)+' 둘째 사람은 '+periods(second)+f' 두 사람의 노년 기간은 같고 생애의 합은 {life1+life2}년입니다. 두 사람이 몇 살까지 살았는지 첫째·둘째 순서로 구하시오.',
        [life1,life2],['첫째 나이(살)','둘째 나이(살)'],[f'첫째의 앞 세 기간 합은{frac(1-rest1)}이므로 노년은 생애의{frac(rest1)}입니다. 둘째의 노년은1−{frac(1-rest2)}＝{frac(rest2)}입니다.',
        f'같은 노년 기간이 첫째 생애의{d1}분의1이자 둘째 생애의{d2}분의1입니다. 따라서 생애는 같은 길이 한 몫을 각각{d1}개와{d2}개 모은 값입니다.',f'생애의 합은{d1+d2}몫이므로 한 몫은{life1+life2}÷{d1+d2}＝{units}년입니다. 첫째는{d1}×{units}＝{life1}살, 둘째는{d2}×{units}＝{life2}살까지 살았습니다.',
        '각 세 기간도 모두 정수인 '+str([int(Fraction(f)*life1)for f in first])+'년과 '+str([int(Fraction(f)*life2)for f in second])+f'년이며, 두 노년은 모두{units}년입니다.'],
        '두 사람의 같은 노년과 생애 합','서로 다른 남은 분수와 같은 실제 기간을 묶어 전체 생애를 배분하기','two fraction complements with equal elder durations and total life')


plate_intro='그림의 숫자는 처음에 양쪽 접시에 놓인 사탕 수의 합입니다. '
plate_steps=['세 변의 합24＋20＋32＝76에서는 각 접시의 사탕이 두 번씩 세어집니다. 따라서 세 접시의 사탕은 모두76÷2＝38개입니다.',
             '나와 다의 합32를 빼면 가는6개, 가와 다의 합20을 빼면 나는18개, 가와 나의 합24를 빼면 다는14개입니다.',
             '6＋18＝24,6＋14＝20,18＋14＝32로 그림의 세 합을 모두 만족합니다.']
for query,question,answer in [('A','가 접시의 사탕은 몇 개입니까?',6),('B','나 접시의 사탕은 몇 개입니까?',18),('C','다 접시의 사탕은 몇 개입니까?',14),('total','세 접시의 사탕은 모두 몇 개입니까?',38),('range','가장 많은 접시와 가장 적은 접시의 사탕 수는 몇 개 차이입니까?',12)]:
    add(9,'low',dict(query=query),plate_intro+question,[answer],['사탕 수'],plate_steps+[f'따라서 물음의 수량은{answer}개입니다.'],'두 접시씩의 합에서 특정 수량 찾기','합을 더해 각 수를 두 번 센 뒤 필요한 접시 수량을 구하기','recover original triple from pair sums then requested quantity')
for added in [3,6,9,12,15]:
    moved=(6+added)//3
    add(9,'middle',dict(added=added),plate_intro+f'나 접시에 사탕을 {added}개 더 놓은 뒤, 나에서 가로 몇 개를 옮겼습니다. 그 결과 나의 사탕은 가의2배가 되었습니다. 옮긴 사탕은 몇 개입니까?',
        [moved],['옮긴 사탕 수'],plate_steps+[f'더 놓은 직후 나에는{18+added}개, 가에는6개가 있습니다. 나의 수가 가의 두 배보다{18+added}−2×6＝{6+added}개 많습니다.',
        '나에서 가로1개를 옮길 때 나의 수는1줄고, 가의 두 배는2늘어 두 양의 차가3줄어듭니다.',f'따라서{6+added}÷3＝{moved}개를 옮깁니다. 나의{18+added-moved}개는 가의{6+moved}개의2배로 맞습니다.'],
        '사탕 이동 뒤 두 배가 되는 조건 역산','한 개 이동이 출발과 도착의 두 배 비교에 미치는 영향을 합치기','pair-sum recovery then transfer balance at ratio2')
for one in [1,2,3,4,5]:
    added=16-one
    final=[6+one,18-2*one,14+added+one]
    assert final[2]==2*final[0]+final[1]
    add(9,'high',dict(added=added,multipliers=[1,3,2]),plate_intro+f'다 접시에 {added}개를 더 놓았습니다. 가에서 나로 몇 개를 옮긴 뒤, 처음 옮긴 수의3배를 나에서 다로, 처음 옮긴 수의2배를 다에서 가로 차례로 옮겼습니다. 그 뒤 다의 사탕 수는 가의2배와 나의 사탕 수를 합한 것과 같았습니다. 세 번 옮긴 사탕 수를 차례로 구하시오.',
        [one,3*one,2*one],['가에서 나로','나에서 다로','다에서 가로'],plate_steps+['처음 옮긴 양이 한 몫이면 가는1몫을 내고2몫을 받아6개보다1몫 많습니다. 나는1몫을 받고3몫을 내어18개보다2몫 적습니다.',
        f'따라서 가의 두 배와 나의 수를 더하면2×6＋18＝30개가 됩니다. 다는14＋{added}개에서3몫을 받고2몫을 내어1몫이 늘어납니다.',f'그러므로 한 몫은30−14−{added}＝{one}개입니다. 옮긴 수는{one}, {3*one}, {2*one}개이고 마지막 수량은 가{final[0]}, 나{final[1]}, 다{final[2]}개입니다.',
        f'실제 이동 직후의 수량은 가→나 뒤({6-one},{18+one},{14+added}), 나→다 뒤({6-one},{18-2*one},{14+added+3*one}), 다→가 뒤({final[0]},{final[1]},{final[2]})입니다. 어느 단계에서도 가진 양보다 많이 옮기지 않았습니다.'],
        '세 접시의 배수 이동과 나중 합 조건','들어온 양과 나간 양을 따로 추적하고 마지막 수량 관계로 역산하기','ordered circular transfers and final linear-combination equality')


for prime in [7,13,19,31,37]:
    students=27*prime;front=(prime-1)//3
    add(10,'middle',dict(students=students,behindMultiple=2),f'학생 {students}명이 가로로 각 줄에 A명씩, 세로로 B줄이 되도록 섰습니다. 한 학생과 같은 세로줄에서 앞에는 한 명 이상이 있고, 뒤에는 앞에 있는 학생 수의2배가 있습니다. A와 B를 차례로 구하시오.',
        [27,prime],['A','B'],['그 학생 앞에 있는 수를 한 몫이라 하면 뒤에는2몫이 있습니다. 자신1명을 합한 세로 줄 수 B는3몫보다1크고, 앞에 학생이 있으므로 B는1이 아닙니다.',f'{students}＝27×{prime}＝3×3×3×{prime}입니다. 3의 배수인 약수는 B가 될 수 없고, 남는 약수1과{prime} 중1을 제외합니다.',
        f'따라서 B＝{prime}, A＝{students}÷{prime}＝27입니다. 같은 세로줄에서 앞{front}명, 뒤{2*front}명과 자신1명을 합하면{prime}명이 됩니다.'],
        '앞뒤 두 배 관계에 맞는 직사각형 배열','앞뒤 인원 관계를 세로 줄 수의 나머지와 약수 조건으로 옮기기','divisors congruent to1mod3 under positive front count')
for rows,unit in [(7,3),(9,4),(11,2),(13,3),(15,2)]:
    across=unit*(rows-2);extra=2*unit;total=across*rows;axis_sum=across+rows
    add(10,'high',dict(axisSum=axis_sum,extraAcross=extra,fewerRows=2),f'학생들이 처음에는 가로로 각 줄에 A명씩, 세로로 B줄이 되도록 섰고 A와 B의 합은{axis_sum}입니다. 같은 학생들이 다시 줄을 서자 가로 한 줄은{extra}명 더 많고 세로 줄 수는2줄 적어졌습니다. 처음 배치에서 한 학생의 앞뒤에는 같은 세로줄의 학생이 각각 한 명 이상씩 같은 수로 있었습니다. 처음의 A, B와 전체 학생 수를 차례로 구하시오.',
        [across,rows,total],['처음 A','처음 B','전체 학생 수'],['두 배치의 전체 인원은 같습니다. 처음의 두 줄을 없애며 빠진2A명을 남은 B−2줄에 나누면 각 줄이'+str(extra)+'명씩 늘어납니다.',
        f'따라서 A명 두 줄의 인원은{extra}×(B−2)명입니다. {extra}÷2＝{unit}이므로 A는 B의{unit}배보다{2*unit}명 적습니다.',f'A와 B의 합{axis_sum}에{2*unit}을 더하면 B의{unit+1}배입니다. B＝({axis_sum}＋{2*unit})÷{unit+1}＝{rows}, A＝{axis_sum}−{rows}＝{across}입니다.',
        f'전체 인원은{across}×{rows}＝{total}명입니다. 다시 선{across+extra}명씩{rows-2}줄도{total}명이며 처음 세로줄은{rows}명의 홀수여서 앞뒤에{(rows-1)//2}명씩 설 수 있습니다.'],
        '두 줄서기와 가로·세로 합으로 전체 역산','줄 수 변화로 생긴 인원을 남은 줄에 배분하는 관계와 A+B를 결합하기','two rectangular formations with preserved population and sum of dimensions')


RANK_CASES = {'middle': [{'rows': [['D', 'A', 'B', 'E', 'C'], ['B', 'C', 'E', 'D', 'A'], ['A', 'C', 'D', 'B', 'E']], 'correctPosition': 2}, {'rows': [['B', 'A', 'D', 'C', 'E'], ['D', 'E', 'C', 'A', 'B'], ['C', 'B', 'E', 'A', 'D']], 'correctPosition': 1}, {'rows': [['E', 'B', 'C', 'A', 'D'], ['C', 'A', 'B', 'D', 'E'], ['B', 'E', 'A', 'C', 'D']], 'correctPosition': 2}, {'rows': [['A', 'B', 'D', 'C', 'E'], ['B', 'A', 'D', 'C', 'E'], ['D', 'C', 'A', 'E', 'B']], 'correctPosition': 3}, {'rows': [['B', 'C', 'E', 'A', 'D'], ['B', 'E', 'C', 'A', 'D'], ['E', 'A', 'C', 'B', 'D']], 'correctPosition': 3}], 'high': [{'rows': [['C', 'E', 'A', 'D', 'B', 'F'], ['C', 'B', 'F', 'E', 'A', 'D'], ['F', 'A', 'E', 'C', 'B', 'D']], 'correctPosition': 3}, {'rows': [['A', 'F', 'B', 'C', 'D', 'E'], ['C', 'E', 'D', 'B', 'F', 'A'], ['E', 'F', 'C', 'D', 'A', 'B']], 'correctPosition': 1}, {'rows': [['F', 'C', 'B', 'E', 'A', 'D'], ['C', 'F', 'E', 'A', 'B', 'D'], ['E', 'D', 'F', 'C', 'A', 'B']], 'correctPosition': 2}, {'rows': [['B', 'A', 'E', 'C', 'F', 'D'], ['A', 'F', 'D', 'E', 'C', 'B'], ['D', 'B', 'E', 'F', 'C', 'A']], 'correctPosition': 4}, {'rows': [['D', 'A', 'F', 'B', 'C', 'E'], ['A', 'E', 'B', 'D', 'F', 'C'], ['F', 'B', 'D', 'C', 'E', 'A']], 'correctPosition': 4}]}


def rank_solutions(rows,pos,high=False):
    letters='ABCDEF'if high else'ABCDE';out=[]
    for p in itertools.permutations(letters):
        counts=[sum(a==b for a,b in zip(p,row))for row in rows]
        flags=[a==b for a,b in zip(p,rows[2])]
        if flags!=[i==pos for i in range(len(letters))]:continue
        if high and(counts[:2]!=[1,2]or p.index('B')!=p.index('A')+1):continue
        if not high and counts[:2]!=[0,0]:continue
        out.append(p)
    return out


for c in RANK_CASES['middle']:
    rows,pos=c['rows'],c['correctPosition'];found=rank_solutions(rows,pos);assert len(found)==1;ranking=found[0]
    options=[set('ABCDE')-{r[i]for r in rows}for i in range(5)];options[pos]={rows[2][pos]}
    steps=[f'예측 다에서{pos+1}등만 맞으므로 그 자리는{rows[2][pos]}입니다. 예측 가·나의 모든 자리와 예측 다의 나머지 자리는 모두 제외합니다.',
           '각 등수에 남는 후보는 '+', '.join(f'{i+1}등:'+('/'.join(sorted(o)))for i,o in enumerate(options))+'입니다. 한 선수는 한 등수에만 올 수 있습니다.']
    used=set();assigned={}
    while len(assigned)<5:
        fixed=next((i,next(iter(o-used)))for i,o in enumerate(options)if i not in assigned and len(o-used)==1)
        i,letter=fixed;assigned[i]=letter;used.add(letter);steps.append(f'{i+1}등은 남은 후보가{letter}뿐입니다. {letter}를 다른 등수의 후보에서 제외합니다.')
    assert tuple(assigned[i]for i in range(5))==ranking
    steps.append('따라서 실제 순위는 '+' → '.join(ranking)+f'입니다. 1등{ranking[0]}, 5등{ranking[-1]}이며 세 예측의 맞고 틀림도 모두 일치합니다.')
    add(11,'middle',dict(rows=rows,correctPosition=pos),f'A, B, C, D, E 다섯 선수의 순위를 세 표처럼 예측했습니다. 예측 가와 나는 모두 틀렸고, 예측 다의{pos+1}등만 맞았습니다. 동점이 없을 때 실제1등과5등을 차례로 구하시오.',
        [ranking[0],ranking[-1]],['1등 선수','5등 선수'],steps,'세 예측의 배제 조건을 잇는 순위','확정된 선수와 등수의 후보를 다른 열에 차례로 반영하기','full5player permutations and all-different propagation',givenTable=dict(headers=['예측']+[f'{i}등'for i in range(1,6)],rows=[[name]+row for name,row in zip(['가','나','다'],rows)]))
for c in RANK_CASES['high']:
    rows,pos=c['rows'],c['correctPosition'];found=rank_solutions(rows,pos,True);assert len(found)==1;ranking=found[0]
    before_counts=[p for p in itertools.permutations('ABCDEF')if[p[i]==rows[2][i]for i in range(6)]==[i==pos for i in range(6)]and p.index('B')==p.index('A')+1];assert 3<=len(before_counts)<=8
    counts=[(sum(a==b for a,b in zip(p,rows[0])),sum(a==b for a,b in zip(p,rows[1])))for p in before_counts]
    steps=[f'예측 다의{pos+1}등{rows[2][pos]}는 맞고 나머지 다섯 자리는 틀립니다. 실제 순위에서 A 바로 뒤는 B이므로 두 선수는 AB로 붙습니다.',
           '이 두 조건에 맞는 순위를1등부터 적고, 괄호에는 예측 가와 나가 맞힌 자리 수를 적으면 '+'; '.join(''.join(p)+str(pair)for p,pair in zip(before_counts,counts))+'입니다.',
           '그중 맞힌 수가(1,2)인 순위는 '+ ' → '.join(ranking)+' 하나뿐입니다. 다른 후보는 적어도 한 예측의 맞힌 자리 수가 다릅니다.',
           f'따라서 실제1등은{ranking[0]},6등은{ranking[-1]}입니다. A 바로 뒤의 B와 예측 다의 지정 자리도 모두 만족합니다.']
    add(11,'high',dict(rows=rows,correctPosition=pos,adjacent=['A','B']),f'A부터F까지 여섯 선수에게 동점은 없습니다. 예측 가는 한 자리, 예측 나는 두 자리가 맞았고, 예측 다는{pos+1}등만 맞았습니다. 실제 순위에서 A 바로 뒤가 B일 때, 실제1등과6등을 차례로 구하시오.',
        [ranking[0],ranking[-1]],['1등 선수','6등 선수'],steps,'맞힌 개수와 인접 순위를 함께 분류','지정 자리와 인접 조건의 후보에서 두 예측의 맞힌 개수를 따로 검사하기','full6player permutations with separate correct-count and adjacency predicates',givenTable=dict(headers=['예측']+[f'{i}등'for i in range(1,7)],rows=[[name]+row for name,row in zip(['가','나','다'],rows)]))


tile_intro='그림처럼1회에는 흰 타일을 붙이고, 그 뒤에도 흰색과 검은색을 번갈아 바깥에 붙여 나갑니다. '
for stage in [29,32,35,38,41]:
    combined=8*stage-4;color='흰색'if stage%2 else'검은색';first=4*(stage-1)
    add(12,'middle',dict(combinedNew=combined),tile_intro+f'어느 회와 바로 다음 회에 새로 붙인 타일을 합하면{combined}개입니다. 앞 회가 몇 회인지와 그 회에 새로 붙인 타일의 색을 차례로 구하시오.',
        [stage,color],['앞 회차','앞 회의 타일 색'],['2회부터 새로 붙이는 타일은4,8,12,…개로 회마다4개씩 늘어납니다. 바깥 테두리의 네 방향에서 늘어나는 수를 합한 값입니다.',
        f'연속 두 회의 새 타일 수는4개 차이이고 합이{combined}개이므로 앞 회는({combined}−4)÷2＝{first}개입니다.',f'앞 회의 테두리는1회부터{first}÷4＝{stage-1}번 바깥으로 늘어난 것이므로{stage}회입니다. {stage}회는'+('홀수이므로 흰색입니다.'if stage%2 else'짝수이므로 검은색입니다.'),f'뒤 회의 새 타일은{first+4}개이고 두 회의 합도{combined}개입니다.'],
        '연속 두 회의 새 타일 합에서 회차 찾기','누적량과 새 테두리 수를 구분하고 합과 차로 앞 회를 역산하기','adjacent shell sizes differ by4 and have a known sum')
for first,gap in [(15,6),(17,8),(19,10),(21,12),(23,14)]:
    second=first+gap;black_sum=(first-1)**2+(second-1)**2
    candidates=[n for n in range(1,100,2)if(n-1)**2+(n+gap-1)**2==black_sum];assert candidates==[first]
    below=(first-3)**2+(second-3)**2;above=(first+1)**2+(second+1)**2
    add(12,'high',dict(blackSum=black_sum,stageDifference=gap),tile_intro+f'두 벽에 각각 붙이다가 둘 다 흰 타일을 새로 붙인 직후 멈췄습니다. 둘째 벽은 첫째보다{gap}회 더 붙였고, 두 벽의 검은 타일을 모두 세면{black_sum}개입니다. 마지막 회에 각 벽에 새로 붙인 흰 타일 수를 첫째·둘째 순서로 구하시오.',
        [4*(first-1),4*(second-1)],['첫째의 새 흰 타일','둘째의 새 흰 타일'],['흰 타일을 새로 붙인 직후이므로 두 벽 모두 홀수 회에서 끝납니다. 홀수 회를 n회라 하면 그때까지 검은 타일은 바로 전 짝수 회의(n−1)×(n−1)개입니다.',
        f'두 검은 타일 제곱의 한 변 길이도{gap}차이입니다. 첫째가{first-1}, 둘째가{second-1}이면{first-1}×{first-1}＋{second-1}×{second-1}＝{black_sum}개입니다.',f'가능한 짝수 변 길이가 각각2작으면 합{below},2크면 합{above}입니다. 두 제곱의 합은 길이가 늘수록 커지므로 이 한 쌍뿐입니다. 따라서 끝난 회차는{first}회와{second}회입니다.',
        f'새로 붙인 테두리는 각각4×({first}−1)＝{4*(first-1)}개,4×({second}−1)＝{4*(second-1)}개입니다. 인접한 짝수 회와 검은 누적량은 같아도, 흰 타일 직후라는 조건으로 끝난 회차를 구분합니다.'],
        '두 벽의 회차 차와 누적 검은 타일 합','흰색 중단의 홀짝 조건과 두 누적량을 함께 역산한 뒤 새 테두리로 바꾸기','strictly increasing two-square sum restricted to odd final stages')


assert len(items)==len({x['id']for x in items})==180
assert len({json.dumps({k:x.get(k)for k in ['text','givenTable','arithmeticRows','promptDataLines','asset']},ensure_ascii=False,sort_keys=True)for x in items})==180
for n in range(1,13):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==n)==dict(low=5,middle=5,high=5)
prior=json.loads(before)['items'];assert items[:90]==prior
for x in items:
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in old if y['id']==x['id']).items())
data.update(version=version,availableSourceNos=list(range(1,13)),pendingSourceNos=list(range(13,31)),preservedLegacyCount=35,newAuthoredCount=145)
data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored next90 Applied2 items:70new+20preserved;prior90/stored versions unchanged;12complete5/5/5 candidate groups')

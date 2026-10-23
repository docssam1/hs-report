"""Preserve315; add low/middle/high5 each for original22..24."""
import collections
import copy
import hashlib
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied1-balanced15.json'
data=json.loads(FILE.read_text());assert data['availableSourceNos']==list(range(1,22))
previous=copy.deepcopy(data['items']);items=data['items'];version='20261024-applied1-balanced15-r8'
legacy_bytes=(ROOT/'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
legacy=json.loads(legacy_bytes)['items']
for no,level,band in [(22,'middle','3.4'),(23,'high','4.2'),(24,'high','4.2')]:
    for old in [x for x in legacy if x['sourceNo']==no][:5]:
        assert old['pointBand']==band;x=copy.deepcopy(old)
        x.update(practiceLevel=level,sourcePointBand=band,preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)


def axes(no,level):
    reason,tracking,cases={
        (22,'low'):('전체 시행 수에서 알려진 두 눈의 횟수를 빼기','눈3/4/5 고정·전체횟수·3과5의횟수','곱에서 인수를 역산하는 단계는 제외한 기초'),
        (22,'high'):('전체 곱을 두 사람의 곱으로 분할하고 곱의 차까지 결합','두 사람 각각4회·전체곱·첫 사람 곱이 큰 차·각 사람4횟수','전체 인수별 횟수를 분할한 실제 후보가3개 이상이고 차 조건으로 유일해 결정'),
        (23,'low'):('받아올림 없는 반복 숫자 곱의 자리 규칙과 합','반복2의개수·한자리곱수2/3/4·모든자리합','다자리 곱과 양 끝의 자리 변화 판단을 없앤 기초'),
        (23,'middle'):('한 자리 곱에서 최초 자리와 반복되는 받아올림1을 구분','반복2의개수·곱수5~9·일의자리·가운데·맨앞','원문398의 여러 자리 경계 대신 한 가지 받아올림 상태만 추적'),
        (24,'low'):('터널과 열차 길이를 알고 완전 통과 시간 순방향 계산','터널길이·열차길이·일정속력·맨앞진입부터맨뒤이탈','첫 열차에서 터널 길이를 역산하는 원문 단계를 제외'),
        (24,'middle'):('앞부분 출구와 뒷부분 출구의 두 시각 차로 열차 길이 역산','같은 시작 순간·두 끝부분 출구 시각·일정속력·열차길이','터널 전체 시간과 열차 한 대 길이를 이동한 시간을 구분;두 열차 연결은 제외'),
    }[(no,level)]
    return dict(prerequisite='원문의 주사위 눈3/4/5·십진 곱셈·거리와 시간 관계를 유지',reasoning=reason,
                conditionTracking=tracking,caseSplitting=cases,
                computation='수치 크기만 바꾸지 않고 인수 분할·받아올림 상태·시점 역산의 차이로 설계',
                representation='22번 실제 원본3/4/5주사위 그림 보존;23번 결과의 반복 모양은 문제에서 완성해 보여주지 않음',
                reading='각각4회·곱의 차·2의 실제 개수·두 시각의 공통 시작을 지문 안에서 확정',
                visualCues='문제 아래 조건 요약/풀이 힌트/완성된 자리 규칙을 붙이지 않음',
                shortcuts='22상 곱의 차를 빼면 복수 후보가 남음;23하/중은 받아올림 유무가 실제로 다름;24중 두 끝부분을 혼동하면 답이 달라짐')


def fix_numeric_particles(text):
    def replace(match):
        number,particle=match.groups();has_final=int(number)%10 in [0,1,3,6,7,8]
        pair=('을','를')if particle in ['을','를']else('과','와')
        return number+pair[0 if has_final else 1]
    return re.sub(r'(\d+)(을|를|과|와)',replace,text)


def add(no,level,p,text,answers,steps,labels,focus,method,**extra):
    text=fix_numeric_particles(text);steps=[fix_numeric_particles(step)for step in steps]
    source=next(x for x in legacy if x['sourceNo']==no);n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    band='3.4'if no==22 else'4.2';foundation=level=='low'or no in [23,24]
    x={k:copy.deepcopy(source[k])for k in ['area','subarea','detailType','learningLocation']}
    x['detailType']={(22, 'low'): '주사위 세 눈의 횟수 분할', (22, 'high'): '두 사람의 주사위 곱과 차로 횟수 찾기', (23, 'low'): '받아올림 없는 반복수 곱의 자리 합', (23, 'middle'): '한 자리 곱의 받아올림과 자리 합', (24, 'low'): '터널과 열차 길이로 완전 통과 시간 구하기', (24, 'middle'): '앞뒤 출구 시각으로 열차 길이 찾기'}[(no,level)]
    x.update(id=f'applied1-q{no:02d}-{level}-v{n}',genId=f'applied1-q{no:02d}',sourceSet='applied',sourceRound=1,sourceNo=no,variantNo=n,
             reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand=band,pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],
             practiceRole='기초 보완'if foundation else'단계형 확장',practiceStorageVersion=version,text=text,
             answer=', '.join(map(str,answers)),answerParts=answers,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answers))],
             solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,
             difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
             levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if foundation else'extension',measured=False,axes=axes(no,level)),
             verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied1-balanced15-independent-validate.py',sourceExamPage=4,sourceAnswerPage=no,studentDifficultyMeasured=False))
    x.update(extra);assert len(steps)>=3;items.append(x)


die=copy.deepcopy(next(x for x in legacy if x['sourceNo']==22)['asset'])
for rolls,threes,fives in [(6,1,2),(7,2,1),(8,2,3),(9,3,2),(10,3,4)]:
    fours=rolls-threes-fives
    add(22,'low',dict(rolls=rolls,threes=threes,fives=fives),
        f'그림과 같이 3, 4, 5가 두 면씩 적힌 주사위를 {rolls}번 던졌습니다.3은 {threes}번,5는 {fives}번 나왔을 때,4는 몇 번 나왔습니까?',
        [fours],[f'나올 수 있는 눈은3,4,5뿐이므로 세 눈의 횟수를 더하면 전체 {rolls}번입니다.',
                 f'3과5가 나온 횟수의 합은 {threes}＋{fives}＝{threes+fives}번입니다.',
                 f'따라서4는 {rolls}−{threes+fives}＝{fours}번 나왔습니다. {threes}＋{fours}＋{fives}＝{rolls}번으로 전체와 맞습니다.'],
        ['4가 나온 횟수'],'주사위의 가능한 세 눈으로 전체 시행 횟수를 나누기','partition the total roll count',asset=die)

states=[(a,b,4-a-b,3**a*4**b*5**(4-a-b))for a in range(5)for b in range(5-a)]
for product,difference in [(90000,175),(72000,60),(57600,31),(76800,80),(54000,231)]:
    candidates=[(a,b)for a in states for b in states if a[3]>b[3]and a[3]*b[3]==product]
    found=[(a,b)for a,b in candidates if a[3]-b[3]==difference]
    assert len(candidates)>=3 and len(found)==1
    first,second=found[0];totals=[first[i]+second[i]for i in range(3)]
    add(22,'high',dict(rollsEach=4,product=product,productDifference=difference),
        f'그림과 같이 3, 4, 5가 두 면씩 적힌 주사위를 두 사람이 각각4번 던졌습니다. 나온 여덟 수의 곱은 {product}이고, 첫 번째 사람의 네 수의 곱은 두 번째 사람의 곱보다 {difference} 큽니다. 각 사람에게4가 나온 횟수를 차례로 구하시오.',
        [first[1],second[1]],[f'전체 곱을3,4,5의 곱으로 나누면3은{totals[0]}개,4는{totals[1]}개,5는{totals[2]}개이고 모두8개입니다.4하나는2를 두 번 인수로 갖는 점을 이용합니다.',
         '이 횟수를 두 사람에게 나누되 각각4개의 눈을 받아야 합니다. 첫 번째 곱이 더 큰 경우만 남기면 '+ ' / '.join(f'첫 곱{a[3]}·둘째 곱{b[3]}·차{a[3]-b[3]}'for a,b in candidates)+'.',
         f'차가{difference}인 경우는 첫 곱{first[3]},둘째 곱{second[3]}뿐입니다. 첫 사람은3이{first[0]}번·4가{first[1]}번·5가{first[2]}번,둘째 사람은3이{second[0]}번·4가{second[1]}번·5가{second[2]}번입니다.',
         f'따라서4는 차례로{first[1]}번,{second[1]}번입니다. 각 횟수의 합은4번이고 두 곱을 곱하면{product},빼면{difference}이므로 모든 조건이 맞습니다.'],
        ['첫 사람의 4 횟수','둘째 사람의 4 횟수'],'전체 곱의 인수 횟수를 두 사람에게 분할하고 곱의 차로 후보 선택',
        'four-roll factor-count triples and exact product-pair difference',asset=die)

def object_particle(n):return '을'if n%10 in [0,1,3,6,7,8]else'를'


for count,multiplier in [(18,2),(23,3),(28,4),(33,2),(38,3)]:
    digit=2*multiplier;answer=count*digit
    add(23,'low',dict(twos=count,multiplier=multiplier),
        f'2가 {count}개 이어진 수 222…222에 {multiplier}{object_particle(multiplier)} 곱하였습니다. 얻은 수의 모든 자리 숫자의 합을 구하시오.',
        [answer],[f'각 자리의2에{multiplier}을 곱하면{digit}이고10보다 작으므로 받아올림이 없습니다.',
                  f'따라서 계산 결과의 각 자리 숫자는 모두{digit}이며, 자리 수는 원래와 같은{count}개입니다.',
                  f'모든 자리 숫자의 합은 {digit}×{count}＝{answer}입니다. 원래 수의 맨 앞과 맨 끝에서도 같은 계산이 성립합니다.'],
        ['자리 숫자의 합'],'받아올림이 없는 반복 숫자의 곱에서 각 자리와 개수를 구분',
        'no-carry repeated digit multiplication')

for count,multiplier in [(45,5),(52,6),(63,7),(74,8),(85,9)]:
    last=2*multiplier-10;middle=2*multiplier-9;answer=1+(count-1)*middle+last
    add(23,'middle',dict(twos=count,multiplier=multiplier),
        f'2가 {count}개 이어진 수 222…222에 {multiplier}{object_particle(multiplier)} 곱하였습니다. 얻은 수의 모든 자리 숫자의 합을 구하시오.',
        [answer],[f'일의 자리에서2×{multiplier}＝{2*multiplier}이므로 일의 자리에{last}를 쓰고1을 올립니다.',
                  f'그다음 자리부터2×{multiplier}＋1＝{2*multiplier+1}이므로{middle}을 쓰고 다시1을 올립니다. 이 같은 계산이 나머지{count-1}자리에서 이어집니다.',
                  f'마지막으로 맨 앞에 받아올린1이 남습니다. 따라서 맨 앞1,가운데{middle}이{count-1}개,맨 끝{last}의 순서입니다.',
                  f'자리 숫자의 합은1＋{middle}×{count-1}＋{last}＝{answer}입니다. 결과의 전체 자리 수도1＋{count-1}＋1＝{count+1}개로 맞습니다.'],
        ['자리 숫자의 합'],'최초 자리와 반복되는 받아올림 상태를 분리하여 자리 합 계산',
        'single-digit multiplier with persistent carry one')

for tunnel,length,speed in [(360,90,25),(420,120,30),(510,150,30),(544,160,32),(630,210,35)]:
    distance=tunnel+length;assert distance%speed==0;time=distance//speed
    add(24,'low',dict(tunnel=tunnel,length=length,speed=speed),
        f'길이 {length}m인 열차가 초속 {speed}m로 길이 {tunnel}m인 터널을 통과합니다. 열차의 맨 앞이 입구에 닿은 순간부터 맨 뒤가 출구를 완전히 벗어날 때까지 몇 초가 걸립니까?',
        [time],[f'열차가 완전히 빠져나오려면 맨 앞이 터널 길이뿐 아니라 열차 한 대 길이만큼 더 가야 합니다.',
                f'이동 거리는 {tunnel}＋{length}＝{distance}m입니다.',
                f'걸리는 시간은 {distance}÷{speed}＝{time}초입니다. 이 시간 동안 이동한 거리도 {speed}×{time}＝{distance}m로 맞습니다.'],
        ['통과 시간(초)'],'완전 통과 거리에서 터널 길이와 열차 길이를 함께 세기',
        'known tunnel and train length to full crossing time')

for speed,front,extra in [(24,18,4),(27,20,5),(30,22,6),(32,24,7),(35,26,8)]:
    tail=front+extra;length=speed*extra;tunnel=speed*front
    add(24,'middle',dict(speed=speed,frontExit=front,tailExit=tail),
        f'열차가 초속 {speed}m의 일정한 빠르기로 터널을 통과합니다. 맨 앞이 입구에 닿은 순간부터 재어, 맨 앞은 {front}초 뒤 출구에 닿고 맨 뒤는 {tail}초 뒤 출구를 완전히 벗어났습니다. 이 열차의 길이는 몇 m입니까?',
        [length],[f'맨 앞이 출구에 닿은 뒤 맨 뒤가 출구를 벗어날 때까지는 {tail}−{front}＝{extra}초입니다.',
                  f'이 동안 열차는 자기 길이만큼 더 움직였습니다. 따라서 열차 길이는 {speed}×{extra}＝{length}m입니다.',
                  f'터널 길이는 {speed}×{front}＝{tunnel}m입니다. 완전 통과 거리는 {tunnel}＋{length}＝{tunnel+length}m이며, {speed}×{tail}과 같으므로 두 시각 조건을 모두 만족합니다.'],
        ['열차 길이(m)'],'같은 시작 순간에서 잰 두 끝부분의 출구 시각 차로 열차 길이 역산',
        'difference between front and tail exit events at constant speed')

assert len(items)==len({x['id']for x in items})==360
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},sort_keys=True,ensure_ascii=False)for x in items})==360
for no in range(1,25):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for old in previous:assert next(x for x in items if x['id']==old['id'])==old
data.update(version=version,availableSourceNos=list(range(1,25)),pendingSourceNos=list(range(25,31)),preservedLegacyCount=95,newAuthoredCount=265)
data.pop('reviewSummary',None);FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added45 (30new+15preserved);360total;prior315unchanged.')

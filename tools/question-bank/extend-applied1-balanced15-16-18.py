"""One-time additive batch: original16..18, preserving all prior225 items."""
import collections
import copy
import hashlib
import itertools
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
FILE=ROOT/'bank/data/applied1-balanced15.json'
data=json.loads(FILE.read_text())
assert data['availableSourceNos']==list(range(1,16)), 'Additive builder, not a reset tool.'
previous=copy.deepcopy(data['items'])
legacy_bytes=(ROOT/'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
legacy=json.loads(legacy_bytes)['items']
items=data['items'];version='20261024-applied1-balanced15-r6'

for no in [16,18]:
    for old in [x for x in legacy if x['sourceNo']==no][:5]:
        assert old['pointBand']=='3.4'
        x=copy.deepcopy(old)
        x.update(practiceLevel='middle',sourcePointBand='3.4',preservedApprovedId=x['id'],
                 practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True))
        items.append(x)


def axes(no,level):
    reason,tracking,cases={
        (16,'low'):('시작과 끝에서 경과 시간을 구해 두 바늘의 총 움직임 차 계산','같은 날 오전·시작과 끝·누적 움직임','원문의 시간 역산 단계를 없앤 순방향 기초'),
        (16,'high'):('두 숙제 구간의 시간 관계와 각도 차의 차로 각각의 시간을 역산','두 구간·시간 배수와 추가분·각도 차의 차·중간 휴식·종료 시각','두 미지 구간을 분리한 뒤 휴식까지 합쳐 시작 시각 역산'),
        (17,'low'):('좌우 방향을 유지한 평행이동에서 몸통의 겹침만 세기','높이 유지·돛대의 새 위치 하나·몸통 부분만 계산','좌우 반사와 전체17개 최소이동은 제외한 기초 보완'),
        (17,'middle'):('배 전체를 좌우 반사하고 지정 위치에 놓아 겹치는 성냥을 세기','높이 유지·좌우 반사·새 돛대 위치 고정·전체 성냥·머리 방향 무시','대칭 뒤 몸통의 가로·세로 및 돛대·돛·옆 부분을 구분'),
        (17,'high'):('두 허용 위치마다 좌우 반사 뒤 겹침을 비교하여 최소이동 선택','높이 유지·좌우 반사·두 위치 중 선택·전체 성냥·머리 방향 무시','두 위치의 비용이 실제로 다르며 각각의 최솟값을 비교해야 함'),
        (18,'low'):('네 빈칸의 부호로 만들 수 있는 보기의 서로 다른 값 찾기','첫 수 고정·네 빈칸만 부호 선택·보기의 값 중복 제외','원문64가지에서16가지로 실제 분기 수를 줄임'),
        (18,'high'):('두 식의 같은 위치 부호를 공유하며 두 등식을 동시에 만족하는 배치 수 계산','각 식 첫 수 고정·여섯 대응 부호·서로 다른 두 결과·배치 개수','첫 식만 또는 둘째 식만 맞는 후보가 실제로 더 많아 두 조건 모두 필요'),
    }[(no,level)]
    return dict(prerequisite='원문의 시계 속도·성냥 위치 겹침·덧셈과 뺄셈을 유지;새 공식이나 고등 개념 없음',
                reasoning=reason,conditionTracking=tracking,caseSplitting=cases,
                computation='숫자 크기가 아니라 역산 여부·대칭/선택·결합 조건 및 실제 분기 수로 난도 구분',
                representation='17번 원본 그림 픽셀 그대로;18번 두 식은 부호를 선택할 필수 자료만 제공',
                reading='위치·위아래 높이·누적 움직임·대응하는 빈칸을 지문 안에서 명확히 함;별도 힌트 없음',
                visualCues='원본에 없는 좌표·라벨·보조선·대칭 목표 그림·부호 정답을 문제에 넣지 않음',
                shortcuts='17번 두 위치의 비용이 다름을 확인;18번 상은 각 조건을 제거하면 후보 수가 늘어남')


def add(no,level,p,text,answers,steps,labels,focus,method,**extra):
    n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    if no==17:
        meta=dict(area='도형',subarea='대칭과 성냥개비',detailType='배 모양을 뒤집어 성냥개비 옮기기',
                  learningLocation='활용 1회 · 원문 17번 · 대칭과 성냥개비')
    else:
        source=next(x for x in legacy if x['sourceNo']==no)
        meta={k:copy.deepcopy(source[k])for k in ['area','subarea','detailType','learningLocation']}
    x=dict(**meta,id=f'applied1-q{no:02d}-{level}-v{n}',genId=f'applied1-q{no:02d}',
           sourceSet='applied',sourceRound=1,sourceNo=no,variantNo=n,
           reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand='3.4',
           pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],
           practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,
           text=text,answer=', '.join(map(str,answers)),answerParts=answers,answerLabels=labels,
           acceptedAnswers=[', '.join(map(str,answers))],answerContract='ordered-parts',
           solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,
           difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],
                                   sourceReasoningPreserved=False,measuredVariantRate=None),
           levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',
                            measured=False,axes=axes(no,level)),
           verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied1-balanced15-independent-validate.py',
                             sourceExamPage=3,sourceAnswerPage=no,studentDifficultyMeasured=False))
    x.update(extra);assert len(steps)>=3;items.append(x)


def clock(t):
    return f'오전 {t//60}시 {t%60}분'


for start,elapsed in [(420,20),(435,30),(460,40),(475,50),(500,60)]:
    finish=start+elapsed;gap=elapsed*11//2
    add(16,'low',dict(start=start,finish=finish),
        f'{clock(start)}에 숙제를 시작하여 {clock(finish)}에 끝냈습니다. 숙제하는 동안 시계의 긴바늘이 움직인 총각도는 짧은바늘이 움직인 총각도보다 몇 도 더 큽니까?',
        [gap],[f'숙제한 시간은 {clock(start)}부터 {clock(finish)}까지 {elapsed}분입니다.',
               f'1분에 긴바늘은6°, 짧은바늘은0.5° 움직이므로 {elapsed}분 동안 각각 {6*elapsed}°, {elapsed/2:g}° 움직입니다.',
               f'따라서 총 움직임의 차는 {6*elapsed}−{elapsed/2:g}＝{gap}°입니다. 마지막에 두 바늘이 벌어진 각을 구하는 문제가 아닙니다.'],
        ['각도의 차(도)'],'경과 시간을 먼저 구하고 두 바늘의 누적 움직임 비교', 'forward angular motion of both hands')

for first,offset,rest,finish in [(20,10,10,580),(25,5,15,605),(30,10,10,630),(35,5,15,650),(40,10,20,685)]:
    second=2*first+offset;difference=(second-first)*11//2;start=finish-first-second-rest
    add(16,'high',dict(timeMultiple=2,extraMinutes=offset,angleDifference=difference,rest=rest,finish=finish),
        f'숙제를 두 차례로 나누어 하고 그 사이에 {rest}분 쉬었습니다. 두 번째에는 첫 번째의 2배보다 {offset}분 더 오래 숙제했습니다. 각 차례의 숙제 시간 동안 긴바늘이 짧은바늘보다 더 많이 움직인 총각도를 구했더니, 두 번째 값이 첫 번째 값보다 {difference}° 컸습니다. 두 번째 숙제를 {clock(finish)}에 끝냈다면 첫 번째 숙제를 시작한 시각은 오전 몇 시 몇 분입니까?',
        [start//60,start%60],[f'긴바늘과 짧은바늘의 총 움직임 차는1분마다6−0.5＝5.5°씩 늘어납니다. 두 숙제 시간의 차는 {difference}÷5.5＝{second-first}분입니다.',
         f'첫 번째 시간을 □분이라 하면 두 번째는2×□＋{offset}분이므로, 두 시간의 차는 □＋{offset}분입니다. 따라서 첫 번째 시간은 {second-first}−{offset}＝{first}분입니다.',
         f'두 번째 시간은2×{first}＋{offset}＝{second}분이고, 휴식까지 포함하면 {first}＋{rest}＋{second}＝{finish-start}분이 지났습니다.',
         f'{clock(finish)}에서 {finish-start}분을 거슬러 가면 {clock(start)}입니다. 두 숙제 구간의 각도 차도 {second*5.5:g}−{first*5.5:g}＝{difference}°로 맞습니다.'],
        ['시','분'],'두 구간의 시간 관계와 누적 각도 차의 차를 결합한 뒤 휴식 포함 역산',
        'eliminate two study durations using time relation and difference of accumulated angles')


asset_path=ROOT/'bank/assets/applied1/boat-original.png'
asset_path.write_bytes((ROOT/'.private-work/balanced15-20261024/source/Im80.png').read_bytes())
asset=dict(src='assets/applied1/boat-original.png',description='활용1회17번 원본 성냥개비 배 그림. 돛대와 돛, 네 칸 폭의 몸통과 오른쪽으로 뻗은 성냥개비가 있다.')
positions={-2:'원래 몸통의 왼쪽 끝 세로선',-1:'원래 몸통에서 왼쪽부터 두 번째 세로선',
           1:'원래 몸통에서 왼쪽부터 네 번째 세로선',2:'원래 몸통의 오른쪽 끝 세로선',
           3:'원래 몸통의 오른쪽 끝에서 몸통의 가로 성냥개비 한 개 길이만큼 오른쪽인 곳'}


def components(k,mirror):
    bottom={0,1,3};target={3-i+k for i in bottom}if mirror else{i+k for i in bottom}
    return max(5-abs(k),0),max(4-abs(k),0),len(bottom&target)


def overlap_explanation(k,mirror):
    v,t,b=components(k,mirror)
    return f'돛대가 {positions[k]} 위에 오는 경우 몸통에서 세로 {v}개, 위쪽 가로 {t}개, 아래쪽 가로 {b}개가 겹쳐 {v+t+b}개가 그대로 남을 수 있습니다.'


for k in [-2,-1,1,2,3]:
    kept=sum(components(k,False))
    add(17,'low',dict(shift=k,mirror=False,scope='body'),
        f'그림의 배를 좌우로 뒤집지 않고 가로로 옮긴 모양을 만들려고 합니다. 각 부분의 위아래 높이는 유지하고, 돛대가 {positions[k]} 위에 오게 합니다. 원래 몸통을 이루던 성냥개비 중 제자리에 둘 수 있는 것은 최대 몇 개입니까? 돛대·돛·몸통 오른쪽으로 뻗은 성냥개비는 몸통에 포함하지 않으며, 성냥개비 머리의 방향은 생각하지 않습니다.',
        [kept],['몸통의 모양을 바꾸는 것이 아니라 전체 배를 가로로 옮긴 뒤, 원래 몸통과 겹치는 성냥개비를 확인합니다.',
                overlap_explanation(k,False),f'겹치는 {kept}개는 그대로 두고 겹치지 않는 성냥개비만 옮기면 목표 모양을 만들 수 있습니다. 목표 몸통 밖에 놓인 원래 성냥개비는 남길 수 없으므로 최대 {kept}개입니다.'],
        ['최대 개수'],'반사 없이 가로로 옮긴 몸통의 가로·세로 성냥 위치 겹침',
        'separate horizontal and vertical body intersections',asset=asset)
    kept=sum(components(k,True));moved=17-kept
    add(17,'middle',dict(shift=k,mirror=True,scope='whole'),
        f'그림의 배 전체를 좌우로 뒤집은 모양을 만들려고 합니다. 각 부분의 위아래 높이는 유지하고, 새 돛대가 {positions[k]} 위에 오게 합니다. 성냥개비를 최소 몇 개 옮겨야 합니까? 성냥개비 머리의 방향은 생각하지 않습니다.',
        [moved],['원래 성냥개비는 몸통12개, 돛대2개, 돛2개, 옆으로 뻗은1개로 모두17개입니다.',
                 overlap_explanation(k,True)+'돛대는 원래와 다른 세로선 위로 가고, 반대쪽을 향하는 돛과 옆 성냥개비도 원래 위치와 겹치지 않습니다.',
                 f'따라서 남길 수 있는 것은 몸통의 {kept}개이고 적어도17−{kept}＝{moved}개를 옮겨야 합니다. 겹치지 않는 원래 성냥개비를 목표의 빈 위치로 옮기면 실제로 완성되므로 최소 {moved}개입니다.'],
        ['최소 개수'],'원본 배를 좌우 반사하여 지정 위치에 놓은 뒤 전체 성냥의 겹침으로 최소이동 증명',
        'reflected body intersections plus all five non-body sticks move',asset=asset)

for pair in [(-2,-1),(-1,1),(1,2),(2,3),(-2,2)]:
    costs=[17-sum(components(k,True))for k in pair];assert costs[0]!=costs[1]
    add(17,'high',dict(shifts=list(pair),mirror=True,scope='whole'),
        f'그림의 배 전체를 좌우로 뒤집은 모양을 만들려고 합니다. 각 부분의 위아래 높이는 유지하고, 새 돛대는 {positions[pair[0]]} 위 또는 {positions[pair[1]]} 위에 오게 합니다. 두 위치 중 하나를 골라 완성할 때 성냥개비를 최소 몇 개 옮겨야 합니까? 성냥개비 머리의 방향은 생각하지 않습니다.',
        [min(costs)],['원래 성냥개비는 몸통12개, 돛대2개, 돛2개, 옆으로 뻗은1개로 모두17개입니다. 두 허용 위치를 각각 확인합니다.',
         *[overlap_explanation(k,True)+f'돛대·돛·옆 성냥개비5개는 겹치지 않으므로 최소17−{17-cost}＝{cost}개를 옮깁니다.'for k,cost in zip(pair,costs)],
         f'각 위치에서 겹치지 않는 성냥개비만 빈 위치로 옮기면 완성됩니다. 두 경우의 최소 이동 수 {costs[0]}개와 {costs[1]}개 중 작은 {min(costs)}개가 답입니다.'],
        ['최소 개수'],'허용된 두 위치마다 반사 후 겹침을 따로 세고 이동 비용을 비교',
        'compare two distinct reflected placement costs',asset=asset)


def value(nums,signs):
    return nums[0]+sum(s*n for s,n in zip(signs,nums[1:]))


def expression(nums,signs):
    return str(nums[0])+''.join(('＋'if s==1 else'−')+str(n)for s,n in zip(signs,nums[1:]))


for nums,choices in [([15,9,7,5,3],[0,1,3,9,15,21,27,33,39,41]),
                     ([16,10,8,6,4],[0,2,4,8,12,16,24,28,36,44]),
                     ([19,11,8,5,2],[0,1,3,7,13,19,25,31,39,45]),
                     ([21,12,9,6,3],[0,3,9,15,21,27,33,39,45,51]),
                     ([23,13,10,7,4],[0,1,3,9,15,23,29,37,47,57])]:
    patterns=list(itertools.product([1,-1],repeat=4));possible=sorted({value(nums,s)for s in patterns}&set(choices))
    examples=[next(expression(nums,s)for s in patterns if value(nums,s)==v)+f'＝{v}'for v in possible]
    unreachable=sorted(set(choices)-set(possible));total=sum(nums)
    add(18,'low',dict(nums=nums,choices=choices),
        '다음 식의 □마다 ＋ 또는 −를 넣어 만들 수 있는 수를 보기에서 찾아, 그 수가 몇 가지인지 구하시오.',
        [len(possible)],[f'첫 수 {nums[0]}은 그대로 두고 뒤 네 수의 부호만 고릅니다. 모두 더한 값은 {total}입니다.',
         f'보기의 값 v를 만들 수 있으려면, 뒤 네 수 중 빼기로 바꿀 수들의 합이 ({total}−v)÷2가 되어야 합니다. 네 수의 부분합을 빠짐없이 확인합니다.',
         '가능한 보기의 값은 '+', '.join(map(str,possible))+'입니다. 실제 식의 예는 '+' / '.join(examples)+'입니다.',
         '나머지 보기 '+', '.join(map(str,unreachable))+'는 필요한 부분합을 만들 수 없습니다. 따라서 서로 다른 값은 '+str(len(possible))+'가지입니다.'],
        ['가지 수'],'네 빈칸의 부호 배치와 보기의 서로 다른 값을 구분',
        'sixteen explicit operator assignments and distinct choice values',
        promptDataLines=[' □ '.join(map(str,nums)),'보기: '+', '.join(map(str,choices))])

highs=[([17,11,5,7,10,17,16],[23,10,11,2,7,18,15],27,30),
       ([19,7,3,9,8,17,15],[25,5,14,19,4,8,9],30,28),
       ([21,4,14,10,2,6,16],[27,9,5,14,4,13,12],41,30),
       ([23,13,4,12,2,11,6],[29,19,13,9,15,4,10],21,43),
       ([25,7,9,6,4,16,12],[31,11,16,6,19,9,8],15,28)]
for first,second,target1,target2 in highs:
    patterns=list(itertools.product([1,-1],repeat=6))
    candidates=[s for s in patterns if value(first,s)==target1]
    allowed=[s for s in candidates if value(second,s)==target2]
    assert 1<len(allowed)<len(candidates) and len(allowed)<sum(value(second,s)==target2 for s in patterns)
    rows=[''.join('＋'if s==1 else'−'for s in signs)+f' → 아래 식 {value(second,signs)}'for signs in candidates]
    add(18,'high',dict(first=first,second=second,firstTarget=target1,secondTarget=target2),
        '두 식의 □마다 ＋ 또는 −를 넣습니다. 위아래에서 왼쪽부터 같은 위치에 있는 □에는 같은 부호를 넣어 두 등식이 모두 성립하게 하려고 합니다. 부호를 넣는 방법은 모두 몇 가지입니까?',
        [len(allowed)],[f'위 식의 첫 수 {first[0]}은 고정하고 여섯 부호를 정합니다. 모두 더하면 {sum(first)}이므로, 위 식을 {target1}로 만들려면 빼기로 바꾼 수들의 합이 ({sum(first)}−{target1})÷2＝{(sum(first)-target1)//2}이어야 합니다.',
         '뒤 여섯 수의 부분합을 확인하여 위 식이 맞는 부호를 왼쪽부터 쓰면 다음과 같습니다. '+' / '.join(rows)+'.',
         f'이 중 아래 식도 {target2}가 되는 부호는 '+' / '.join(''.join('＋'if s==1 else'−'for s in signs)for signs in allowed)+f'의 {len(allowed)}가지입니다.',
         '각 부호 배치에서 위아래 식을 함께 대입하면 '+' / '.join(expression(first,s)+f'＝{target1}, '+expression(second,s)+f'＝{target2}'for s in allowed)+f'입니다. 같은 값을 만드는 경우라도 부호 위치가 다르면 서로 다른 방법으로 셉니다.'],
        ['방법 수'],'첫 식의 부호 후보를 찾고 대응하는 부호를 둘째 식에 대입해 두 조건 동시 확인',
        'all shared operator assignments filtered by both exact expression results',
        promptDataLines=[' □ '.join(map(str,first))+f' ＝ {target1}',' □ '.join(map(str,second))+f' ＝ {target2}'])


def information_key(x):
    return json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},sort_keys=True,ensure_ascii=False)


assert len(items)==len({x['id']for x in items})==270
assert len({information_key(x)for x in items})==270
for no in range(1,19):
    assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for old in previous:assert next(x for x in items if x['id']==old['id'])==old
data.update(version=version,availableSourceNos=list(range(1,19)),pendingSourceNos=list(range(19,31)),
            preservedLegacyCount=75,newAuthoredCount=195)
data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added45 (35 new +10 preserved middle); total270; prior225 unchanged.')

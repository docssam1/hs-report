"""Preserve405; add30 for originals29/30. Original28 remains blocked."""
import collections
import copy
import hashlib
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied1-balanced15.json'
data=json.loads(FILE.read_text());assert data['availableSourceNos']==list(range(1,28))
previous=copy.deepcopy(data['items']);items=data['items'];version='20261024-applied1-balanced15-r10'
legacy_bytes=(ROOT/'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
legacy=json.loads(legacy_bytes)['items']
for no in [29,30]:
    for old in [x for x in legacy if x['sourceNo']==no][:5]:
        assert old['pointBand']=='4.2';x=copy.deepcopy(old)
        x.update(practiceLevel='high',sourcePointBand='4.2',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)


def axes(no,level):
    reason,conditions,cases={
        (29,'low'):('두 자리 수의 개수만 구해 자리 선택의 곱 확인','십의 자리0금지·일의 자리0허용·카드의중복사용허용·실제카드장수','자리별 합산을 제외하고 가능한 두 자리 수의 수만 계산'),
        (29,'middle'):('두 자리 수에서 각 자리의 반복 횟수와 자리값을 합산','십의 자리0금지·일의 자리0허용·중복사용·자리별반복횟수의차이','원문 세 자리를 두 자리로 줄이고 모든 수의 합은 유지'),
        (30,'low'):('주어진 출발 시각에서 달림·잠·달림 순서로 도착 시각 계산','출발시각알려짐·시간/분환산·세구간을쉬지않고연속진행','다른 사람 도착 시각과 차이 및 중간 행동 판단 제외'),
        (30,'middle'):('주어진 토끼 도착 시각에서 세 구간을 거슬러 출발 시각 역산','도착시각알려짐·세구간전체시간·역순계산·오전출발','원문 다른 사람의 도착 시각 차와 특정 시각 행동을 제외하고 역산에 집중'),
    }[(no,level)]
    return dict(prerequisite='원문의 자리 선택/자리값·시각과 경과 시간 범위 유지',reasoning=reason,conditionTracking=conditions,caseSplitting=cases,
                computation='수 크기만 줄이지 않고 개수→자리별합 및 순방향→역산→시각차/구간판단으로 구분',
                representation='29번은 실제 주어진 숫자 카드만 표시;30번은 학생이 시간선으로 옮길 관계를 지문으로만 제시',
                reading='같은 숫자 반복 허용·두 자리/세 자리 구분·출발과 도착·달린 뒤 잠을 자고 다시 달림을 지문에서 확정',
                visualCues='완성된 수 목록·자리별 횟수 표·시간선·중간시각·조건 요약을 문제에 붙이지 않음',
                shortcuts='29하 카드장수3/4/5/4/6을실제로읽어야함;29중0의첫자리제외로두자리반복횟수다름;30구간중하나를빼거나앞뒤를바꾸면답불일치')


def add(no,level,p,text,answers,steps,labels,focus,method,**extra):
    text=re.sub(r',(?=\S)',', ',text);steps=[re.sub(r',(?=\S)',', ',step)for step in steps]
    source=next(x for x in legacy if x['sourceNo']==no);n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    x={k:copy.deepcopy(source[k])for k in ['area','subarea','learningLocation']}
    x['detailType']={(29,'low'):'중복 사용 수 카드로 만든 두 자리 수의 개수',(29,'middle'):'중복 사용 수 카드로 만든 모든 두 자리 수의 합',
                     (30,'low'):'달림과 휴식의 경과 시간으로 도착 시각 찾기',(30,'middle'):'도착 시각과 경과 시간으로 출발 시각 찾기'}[(no,level)]
    x.update(id=f'applied1-q{no:02d}-{level}-v{n}',genId=f'applied1-q{no:02d}',sourceSet='applied',sourceRound=1,sourceNo=no,variantNo=n,
             reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand='4.2',pointBand=dict(low='2.7',middle='3.4')[level],
             practiceRole='기초 보완',practiceStorageVersion=version,text=text,answer=', '.join(map(str,answers)),answerParts=answers,
             answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answers))],
             solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,
             difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
             levelReview=dict(basis='explicit-levelled-extension',relation='foundation',measured=False,axes=axes(no,level)),
             verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied1-balanced15-independent-validate.py',sourceExamPage=6,sourceAnswerPage=no,studentDifficultyMeasured=False))
    x.update(extra);assert len(steps)>=3;items.append(x)


for digits in [[0,1,3],[0,2,4,7],[0,1,5,6,8],[0,3,5,9],[0,1,2,4,6,9]]:
    count=len(digits);answer=(count-1)*count
    add(29,'low',dict(digits=digits,places=2),
        '아래 수 카드를 사용하여 두 자리 수를 만듭니다. 같은 숫자를 여러 번 사용해도 될 때, 만들 수 있는 서로 다른 두 자리 수는 모두 몇 개입니까?',
        [answer],[f'두 자리 수의 십의 자리에는 0을 놓을 수 없습니다. 따라서 십의 자리는 '+', '.join(map(str,digits[1:]))+f'의 {count-1}가지입니다.',
                  f'일의 자리에는 0을 포함한 카드의 모든 숫자를 놓을 수 있으므로 {count}가지입니다. 같은 숫자를 반복해서 쓸 수 있으므로 십의 자리에서 고른 숫자도 다시 고를 수 있습니다.',
                  f'십의 자리의 각 선택마다 일의 자리를 {count}가지로 고를 수 있습니다. 서로 다른 두 자리 수는 {count-1}×{count}＝{answer}개입니다.'],
        ['두 자리 수의 개수'],'처음 자리의0 제한과 반복 허용을 구분해 자리 선택 수 곱하기','product of independent tens/units choice counts',cards=digits)


for digits in [[0,1,3,5],[0,1,4,7],[0,2,3,8],[0,2,5,9],[0,3,4,6]]:
    count=len(digits);digit_sum=sum(digits);tens=count*10*digit_sum;ones=(count-1)*digit_sum
    add(29,'middle',dict(digits=digits,places=2),
        '아래 수 카드를 사용하여 두 자리 수를 만듭니다. 같은 숫자를 여러 번 사용해도 될 때, 만들 수 있는 모든 두 자리 수의 합을 구하시오.',
        [tens+ones],[f'십의 자리는 0을 제외한 {count-1}가지,일의 자리는 0을 포함한 {count}가지이므로 모두 {count-1}×{count}＝{(count-1)*count}개의 수를 만듭니다.',
                     f'십의 자리의 각 숫자는 일의 자리 선택 수인 {count}번씩 나타납니다. 카드 숫자의 합은 {digit_sum}이고0은 합에 영향을 주지 않으므로 십의 자리에서 생기는 합은 {digit_sum}×{count}×10＝{tens}입니다.',
                     f'일의 자리의 각 숫자는 십의 자리 선택 수인 {count-1}번씩 나타나므로 그 합은 {digit_sum}×{count-1}＝{ones}입니다.',
                     f'모든 두 자리 수의 합은 {tens}＋{ones}＝{tens+ones}입니다. 각 수를 십의 자리 값과 일의 자리 값으로 나누어 한 번씩 더했으므로 빠지거나 중복된 수가 없습니다.'],
        ['모든 수의 합'],'자리별 반복 횟수와 자리값을 구분하여 전체 합 구하기','frequency of each permitted digit in tens and units',cards=digits)


def duration(minutes):
    hour,minute=divmod(minutes,60)
    return (f'{hour}시간 '+(f'{minute}분'if minute else''))if hour else f'{minute}분'


def clock(minutes):
    hour,minute=divmod(minutes,60)
    assert 0<hour<=12
    return ('낮'if hour==12 else'오전')+f' {hour}시 {minute}분'


for start,first,sleep,last in [(500,35,70,20),(515,38,75,22),(530,41,80,24),(545,44,85,26),(550,47,80,28)]:
    sleep_start=start+first;wake=sleep_start+sleep;finish=wake+last;total=first+sleep+last
    assert finish<720
    add(30,'low',dict(start=start,first=first,sleep=sleep,last=last),
        f'토끼는 {clock(start)}에 출발하여 {first}분 동안 달렸습니다. 그 뒤 {duration(sleep)} 동안 잠을 자고,깨어나 {last}분 더 달려 결승점에 도착했습니다. 도착한 시각은 몇 시 몇 분입니까?',
        list(divmod(finish,60)),[f'달린 시간과 잠을 잔 시간을 모두 합하면 {first}＋{sleep}＋{last}＝{total}분입니다. {duration(sleep)}은 {sleep}분으로 바꾸어 더합니다.',
                               f'{clock(start)}에서 {duration(total)}이 지나면 {clock(finish)}입니다.',
                               f'구간별로 확인하면 {clock(sleep_start)}까지 달리고,{clock(wake)}까지 잠을 잔 뒤,{clock(finish)}에 결승점에 도착합니다. 따라서 답은 {clock(finish)}입니다.'],
        ['도착 시','도착 분'],'알려진 출발 시각에서 달림·휴식·달림 시간을 순서대로 더하기','forward clock arithmetic with known start',answer=clock(finish),acceptedAnswers=[clock(finish)])


for finish,first,sleep,last in [(695,42,76,24),(710,44,83,26),(730,46,91,28),(745,48,98,30),(760,52,104,32)]:
    total=first+sleep+last;start=finish-total;sleep_start=start+first;wake=sleep_start+sleep
    assert 480<start<600
    add(30,'middle',dict(finish=finish,first=first,sleep=sleep,last=last),
        f'토끼는 오전에 출발하여 {first}분 달리고,{duration(sleep)} 동안 잠을 잤습니다. 깨어나 {last}분 더 달려 {clock(finish)}에 결승점에 도착했습니다. 처음 출발한 시각은 몇 시 몇 분입니까?',
        list(divmod(start,60)),[f'출발에서 도착까지 걸린 전체 시간은 {first}＋{sleep}＋{last}＝{total}분,즉 {duration(total)}입니다.',
                              f'도착 시각 {clock(finish)}에서 전체 경과 시간 {duration(total)}을 거슬러 올라가면 출발 시각은 {clock(start)}입니다.',
                              f'이 시각에 출발하면 {clock(sleep_start)}까지 달리고,{clock(wake)}까지 잠을 잔 뒤 다시 {last}분 달려 {clock(finish)}에 도착하므로 주어진 조건과 맞습니다.'],
        ['출발 시','출발 분'],'주어진 도착 시각에서 세 구간의 전체 경과 시간을 빼기','backward clock arithmetic with known rabbit finish',answer=clock(start),acceptedAnswers=[clock(start)])


available=list(range(1,28))+[29,30]
assert len(items)==len({x['id']for x in items})==435
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},sort_keys=True,ensure_ascii=False)for x in items})==435
for no in available:assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for old in previous:assert next(x for x in items if x['id']==old['id'])==old
assert not any(x['sourceNo']==28 for x in items)
data.update(version=version,availableSourceNos=available,pendingSourceNos=[28],preservedLegacyCount=120,newAuthoredCount=315)
data.pop('reviewSummary',None);FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added30 (20new+10preserved);435total;prior405unchanged;original28locked.')

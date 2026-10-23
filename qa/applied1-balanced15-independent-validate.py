"""Independent answers for the levelled path: simulation, digit-DP, real calendars."""
import collections
import datetime
import functools
import hashlib
import json
import itertools
import re
import subprocess
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / 'bank/data/applied1-balanced15.json'
data = json.loads(FILE.read_text())
legacy_bytes = (ROOT / 'bank/data/applied1-expanded.json').read_bytes()
legacy = {x['id']: x for x in json.loads(legacy_bytes)['items']}
assert hashlib.sha256(legacy_bytes).hexdigest() == data['legacyBankSha256']
assert data['policy']['perLevel'] == dict(low=5, middle=5, high=5)
assert data['policy']['sourceGradeMutation'] is False

names = ['왼손 소지', '왼손 약지', '왼손 중지', '왼손 검지', '왼손 엄지',
         '오른손 엄지', '오른손 검지', '오른손 중지', '오른손 약지', '오른손 소지']
week = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']


def walk(limit):
    result = [None]
    position, step = 0, 1
    for _ in range(limit):
        result.append(position)
        if position == 9:
            step = -1
        elif position == 0:
            step = 1
        position += step
    return result


def tally_to(n, excluded):
    if n < 1:
        return [0] * 10
    digits = tuple(map(int, str(n)))
    mod = excluded or 1

    @functools.lru_cache(None)
    def dp(pos, tight, started, remainder):
        if pos == len(digits):
            valid = started and (not excluded or remainder != 0)
            return int(valid), (0,) * 10
        number_count = 0
        total = [0] * 10
        for digit in range((digits[pos] if tight else 9) + 1):
            active = started or digit != 0
            count, child = dp(pos + 1, tight and digit == digits[pos], active,
                              (remainder * 10 + digit) % mod)
            number_count += count
            for k in range(10):
                total[k] += child[k]
            if active:
                total[digit] += count
        return number_count, tuple(total)
    return list(dp(0, True, False, 0)[1])


@functools.lru_cache(None)
def geometry_edges(layers):
    edges = set()
    for row in range(layers):
        for col in range(-row, row + 1):
            points = [(col, row), (col + 1, row), (col + 1, row + 1), (col, row + 1)]
            for i in range(4):
                edges.add(tuple(sorted((points[i], points[(i + 1) % 4]))))
    return len(edges)


def right_angle(t):
    minute = (6 * t) % 360
    hour = (t / 2) % 360
    gap = abs(minute - hour)
    return min(gap, 360 - gap) == 90


def movement_states(draws, forward, backward):
    states={(0,0)}
    for _ in range(draws):
        states={(pos+forward,white+1)for pos,white in states}|{(pos-backward,white)for pos,white in states}
    return states


def card_pairs(digits):
    allowed=set(digits)
    assert len(allowed)==6
    mask=sum(1<<d for d in digits)
    numbers=[]
    for n in range(100,1000):
        parts=list(map(int,str(n)))
        if len(set(parts))==3 and set(parts)<=allowed:
            numbers.append((n,sum(1<<d for d in parts)))
    return [(a,b)for a,ma in numbers for b,mb in numbers if not ma&mb and ma|mb==mask]


def fraction_stream():
    numerator,denominator,group,start_denominator=1,4,2,4
    while True:
        yield numerator,denominator
        numerator+=1;denominator-=1
        if numerator>group:
            group+=1;start_denominator+=2;numerator=1;denominator=start_denominator


def answer(item):
    no, level, p = item['sourceNo'], item['practiceLevel'], item['verification']['parameters']
    if no == 1:
        if level == 'low':
            return [names[walk(p['N'])[p['N']]]]
        if level == 'middle':
            positions = walk(p['lower'] + 100)
            return [n for n in range(p['lower'] + 1, len(positions)) if positions[n] == p['fingerIndex']][:3]
        positions = walk(p['hi'])
        return [sum(positions[n] == p['fingerIndex'] for n in range(p['lo'], p['hi'] + 1) if n % p['divisor'] == 0)]
    if no == 2:
        a, b = tally_to(p['hi'], p.get('excludedDivisor')), tally_to(p['lo'] - 1, p.get('excludedDivisor'))
        totals = [x - y for x, y in zip(a, b)]
        assert totals.count(max(totals)) == 1
        return [totals.index(max(totals)), max(totals)]
    if no == 4:
        if level == 'low':
            gaps = [Fraction(30 * p['hour']) + Fraction(m, 2) - 6 * m for m in range(61)]
            result = [m for m in range(60) if gaps[m] > 0 and gaps[m+1] < 0]
            assert len(result) == 1
            return result
        if level == 'middle':
            events = [Fraction(k, 11) for k in range(1, 660)
                      if right_angle(Fraction(p['hour'] * 60) + Fraction(k, 11))]
            assert events
            first = events[0]
            assert first.denominator != 1
            return [first.numerator // first.denominator]
        return [sum(right_angle(Fraction(k, 11))
                    for k in range(p['startMinute'] * 11, p['endMinute'] * 11 + 1))]
    if no == 5:
        if level == 'high':
            found = {value for value in range(100, 1000)
                     for divisor in range(p['divisorMin'], p['divisorMax'] + 1)
                     if value // divisor == p['quotient'] and value % divisor == divisor - p['remainderGap']
                     and value % 10 == p['lastDigit']}
            assert found
            return sorted(found)
        found = [value for value in range(100, 2000)
                 if value // p['divisor'] == p['quotient'] and value % 10 == p['lastDigit']
                 and (level == 'low' or value < 1000 and value % p['multiple'] == 0)]
        assert found
        return found
    if no == 6:
        if level == 'low':
            layers = 1
            while geometry_edges(layers + 1) <= p['available']:
                layers += 1
            return [layers, p['available'] - geometry_edges(layers)]
        if level == 'middle':
            target = p['remaining'] + p['neededForNext']
            increase = 1
        else:
            target = p['added'] + p['firstRemaining'] - p['secondRemaining']
            increase = p['layerIncrease']
        layers, found = 1, []
        while geometry_edges(layers + increase) - geometry_edges(layers) <= target:
            if geometry_edges(layers + increase) - geometry_edges(layers) == target:
                if level == 'middle':
                    assert 0 <= p['remaining'] < geometry_edges(layers+1)-geometry_edges(layers)
                    found.append(geometry_edges(layers) + p['remaining'])
                else:
                    assert 0 <= p['firstRemaining'] < geometry_edges(layers+1)-geometry_edges(layers)
                    assert 0 <= p['secondRemaining'] < geometry_edges(layers+increase+1)-geometry_edges(layers+increase)
                    found.append(geometry_edges(layers) + p['firstRemaining'])
            layers += 1
        assert len(found) == 1
        return found
    if no == 7:
        rectangles = []
        for left in range(4):
            for right in range(4, 6):
                for top in range(2):
                    for bottom in range(2, 5):
                        width, height = right-left, bottom-top
                        keep = (width == p['width']) if level == 'low' else (
                            width*height == p['cellCount'] if level == 'middle' else
                            width > height and width*height >= p['minimumCells']
                            and width+height <= p['maximumSideSum'])
                        if keep:
                            rectangles.append((left,right,top,bottom))
        return [len(rectangles)]
    if no == 8:
        found = []
        for value in range(11, 100):
            a,b = divmod(value,10)
            if b == 0 or a == b:
                continue
            for multiplier in range(10,1000):
                if level == 'low' and multiplier != p['coefficient']:
                    continue
                if level == 'middle' and (multiplier < 100 or multiplier%100 != p['coefficientTail']):
                    continue
                if level == 'high' and (a+b != p['digitSum'] or not p['coefficientMin'] <= multiplier <= p['coefficientMax']):
                    continue
                product = str(value*multiplier)
                if len(product)==4 and all(int(digit)==(a if letter=='A' else b)
                                           for digit,letter in zip(product,p['pattern'])):
                    found.append((value,multiplier))
        assert len(found)==1,(item['id'],found)
        return [found[0][0]]
    if no == 9:
        def cut_count(length):
            cuts = set(range(p['a'],length,p['a'])) | set(range(p['b'],length,p['b']))
            return len(cuts)+1
        if level == 'low':
            return [cut_count(p['length'])]
        if level == 'high':
            return [v for v in range(p['minimumLength'],p['maximumLength']+1) if cut_count(v)==p['pieces']]
        found = [v for v in range(1,p['pieces']*max(p['a'],p['b'])+1)
                 if v%p['a']==0 and v%p['b']==0 and cut_count(v)==p['pieces']]
        assert len(found)==1
        return found
    if no == 10:
        found=[]
        numerator,denominator=p['ratio']
        for teacher in range(1,p['presentSum']):
            me=p['presentSum']-teacher
            for brother in range(1,p['futureTotal']):
                sister=brother+p['gap']
                if level=='middle' and teacher-sister!=p['teacherSisterDifference']:
                    continue
                if level=='high' and teacher!=p['teacherSisterMultiple']*sister:
                    continue
                years=Fraction(p['futureTotal']-p['presentSum']-brother-sister,4)
                if years<=0 or years.denominator!=1 or level=='low' and years!=p['years']:
                    continue
                if denominator*(brother+years)==numerator*(me+years):
                    found.append((teacher,me,brother,sister,int(years)))
        assert len(found)==1,(item['id'],found)
        return [found[0][0]]
    if no == 11:
        if level=='high':
            assert p['firstForward']+p['firstBackward']!=p['secondForward']+p['secondBackward']
            found={(white1,white2)
                   for pos1,white1 in movement_states(p['firstDraws'],p['firstForward'],p['firstBackward'])
                   for pos2,white2 in movement_states(p['secondDraws'],p['secondForward'],p['secondBackward'])
                   if pos1+pos2==p['end'] and white1-white2==p['firstWhiteExcess']}
            assert len(found)==1
            return list(found.pop())
        if level=='middle':
            found=[(black+p['whiteExcess'],black)for black in range(p['end']+1)
                   if p['forward']*(black+p['whiteExcess'])-p['backward']*black==p['end']]
        else:
            found=[(white,p['draws']-white)for pos,white in movement_states(p['draws'],p['forward'],p['backward'])
                   if pos+p['start']==p['end']]
        assert len(found)==1
        return list(found[0])
    if no == 12:
        candidates=[]
        for start in range(1,720):
            if level=='low':
                display=Fraction(start)+Fraction(p['observed']-start,60)*(60-p['rate'])
                if display==p['display']:
                    candidates.append(start)
            elif level=='middle':
                display=(Fraction(start)+Fraction(p['changeAt']-start,60)*(60-p['beforeRate'])
                         +Fraction(p['observed']-p['changeAt'],60)*(60-p['afterRate']))
                if display==p['display']:
                    candidates.append(start)
            else:
                # Slow display gives an exact possible observation for each candidate start.
                observation=Fraction(p['slowDisplay']*60-start*p['slowRate'],60-p['slowRate'])
                fast_display=Fraction(start)+Fraction(observation-start,60)*(60+p['fastRate'])
                if p['actualObservationRange'][0]<=observation<=p['actualObservationRange'][1] and fast_display==p['fastDisplay']:
                    candidates.append(start)
        assert len(candidates)==1,(item['id'],candidates)
        return [candidates[0]//60,candidates[0]%60]
    if no == 13:
        pairs=card_pairs(p['digits'])
        assert item['cards']==p['digits']
        if level=='low':
            candidates=[a*b for a,b in pairs if [a//100,b//100]==p['hundreds']]
            assert len(candidates)==24
            return [max(candidates)]
        if level=='high':
            pairs=[(a,b)for a,b in pairs if a<b]
            by_difference=[a*b for a,b in pairs if p['minimumDifference']<=b-a<=p['maximumDifference']]
            by_multiple=[a*b for a,b in pairs if a%p['divisor']==0 or b%p['divisor']==0]
            candidates=[a*b for a,b in pairs if p['minimumDifference']<=b-a<=p['maximumDifference']
                        and(a%p['divisor']==0 or b%p['divisor']==0)]
            assert len(candidates)>=4
            assert (min(candidates),max(candidates))!=(min(by_difference),max(by_difference))
            assert (min(candidates),max(candidates))!=(min(by_multiple),max(by_multiple))
        else:
            candidates=[a*b for a,b in pairs]
        return [max(candidates)-min(candidates)]
    if no == 14:
        assert p['ratio']==3
        if level=='low':
            bag=p['first']
            for _ in range(2):bag=3*bag+p['extra']
            return [bag]
        states=[]
        for first in range(1,p['total']):
            if level=='middle':
                second=3*first+p['extra'];third=3*second+p['extra']
            else:
                extra=Fraction(p['third']-9*first,4)
                if extra<=0 or extra.denominator!=1:continue
                second=3*first+extra;third=3*second+extra
            if first+second+third==p['total']:
                states.append((first,second,third))
        assert len(states)==1,(item['id'],states)
        return [int(states[0][2]if level=='middle'else states[0][0])]
    if no == 15:
        sequence=list(itertools.islice(fraction_stream(),17))
        shown=[tuple(map(int,pair))for pair in re.findall(r'<mfrac><mn>(\d+)</mn><mn>(\d+)</mn></mfrac>',' '.join(item['promptDataLines']))]
        if level=='low':
            assert item['promptDataLines'][0].count('□')==1
            assert shown==[pair for index,pair in enumerate(sequence,1)if index!=p['missingPosition']]
            return list(sequence[p['missingPosition']-1])
        assert shown==sequence
        if level=='middle':
            return list(next(itertools.islice(fraction_stream(),p['index']-1,None)))
        matches=[]
        for index,(numerator,denominator)in enumerate(fraction_stream(),1):
            if numerator+denominator>p['writtenSum']:break
            if numerator+denominator==p['writtenSum']and denominator-numerator==p['writtenDifference']:
                matches.append(index)
        assert len(matches)==1
        return matches
    outcomes = set()
    states = set()
    for year in range(1900, 2400):
        january = sum(d for d in range(1, 32) if datetime.date(year, 1, d).weekday() == p['weekday'])
        leap = (datetime.date(year, 3, 1) - datetime.date(year, 2, 1)).days == 29
        if level == 'high':
            february = sum(d for d in range(1, 30 if leap else 29) if datetime.date(year, 2, d).weekday() == p['weekday'])
            match = january + february == p['combinedSum']
        else:
            match = january == p['sum'] and (level == 'low' or leap == p['leap'])
        if match:
            target = datetime.date(year, 2, p['febDay']) if level == 'low' else datetime.date(year, 3, p['marchDay'])
            outcomes.add(week[target.weekday()])
            states.add((datetime.date(year, 1, 1).weekday(), leap))
    assert len(outcomes) == 1, (item['id'], outcomes)
    if level == 'high':
        assert len(states) == 1, 'high aggregate must determine weekday and leap status jointly'
    return [outcomes.pop()]


# Source answers checked against the actual three PDF pages in this run.
assert names[walk(10000)[10000]] == '오른손 소지'
original_tally = [sum(str(n).count(str(d)) for n in range(465, 777)) for d in range(10)]
assert original_tally.index(max(original_tally)) == 6 and max(original_tally) == 167
assert {datetime.date(y, 2, 18).weekday() for y in range(1900, 2400)
        if sum(d for d in range(1, 32) if datetime.date(y, 1, d).weekday() == 1) == 62} == {3}
assert Fraction(420, 11).numerator // Fraction(420, 11).denominator == 38
assert [n for n in range(100, 1000) if n//36 == 26 and n%10 == 6] == [936, 946, 956, 966]
assert geometry_edges(9) == 188 and geometry_edges(10) > 200
assert sum(1 for left in range(4) for right in range(4,6)
           for top in range(2) for bottom in range(2,5))==48
assert [n for n in range(11,100) if str(77*n)==str(n%10)+str(n//10)*2+str(n%10)]==[75]
assert len(set(range(3,120,3))|set(range(5,120,5)))+1==56
source_brother=Fraction(112-56-6-4*9,2)
source_me=Fraction(5,4)*(source_brother+9)-9
assert source_brother==7 and source_me==11 and 56-source_me==45
assert {(w,18-w)for pos,w in movement_states(18,7,3)if pos==46}=={(10,8)}
assert Fraction((900-856)*60,8)==330 and 900-330==570
source_products=[a*b for a,b in card_pairs([5,7,3,6,9,8])]
assert max(source_products)==842625 and min(source_products)==213072
assert 13*450+250==6100 and 9*450+200==4250
assert next(itertools.islice(fraction_stream(),110,None))==(7,24)

evidence = []
for item in data['items']:
    actual = answer(item)
    assert actual == item['answerParts'], (item['id'], actual, item['answerParts'])
    assert len(item['solutionSteps']) >= 3 and item['learningLocation'] and item['learningPoint']
    source_points={x['pointBand']for x in legacy.values()if x['sourceNo']==item['sourceNo']}
    if not source_points:
        assert item['sourceNo']in [7,8]
        source_points={'2.7'}
    assert source_points=={item['sourcePointBand']}
    assert item['pointBand'] == dict(low='2.7', middle='3.4', high='4.2')[item['practiceLevel']]
    if item.get('preservedApprovedId'):
        old = legacy[item['id']]
        assert all(item[k] == v for k, v in old.items()), item['id']
    else:
        assert len(item['levelReview']['axes']) == 9
        assert item['difficultyEvidence']['measuredVariantRate'] is None
        assert item['practiceRole'] in ['기초 보완','단계형 확장']
    if item.get('asset'):
        if item['sourceNo']==7:
            from pypdf import PdfReader
            image = next(x.image for x in PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 1회.pdf').pages[1].images if x.name=='Im71.jp2')
            from PIL import Image
            actual_image = Image.open(ROOT/'bank'/item['asset']['src'])
            assert image.mode==actual_image.mode and image.size==actual_image.size and image.tobytes()==actual_image.tobytes()
        else:
            assert item['asset'] == next(x for x in legacy.values() if x['sourceNo'] == item['sourceNo'])['asset']
        assert (ROOT / 'bank' / item['asset']['src']).is_file()
    evidence.append({'id': item['id'], 'passed': True, 'answer': actual})
for no in data['availableSourceNos']:
    assert collections.Counter(x['practiceLevel'] for x in data['items'] if x['sourceNo'] == no) == dict(low=5, middle=5, high=5)
assert len(data['items']) == 225 and len({x['id'] for x in data['items']}) == 225
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},sort_keys=True)for x in data['items']}) == 225
previous = json.loads(subprocess.check_output(['git', 'show', '4e5376e:bank/data/applied1-balanced15.json'], cwd=ROOT))
for old in previous['items']:
    current = next(x for x in data['items'] if x['id'] == old['id'])
    assert all(current[k] == v for k, v in old.items())
    assert current['practiceStorageVersion'] == old['practiceStorageVersion']
out = ROOT / '.private-work/balanced15-20261024/independent-math.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'dataSha256': hashlib.sha256(FILE.read_bytes()).hexdigest(),
                           'count': len(evidence), 'sourceAnswersDirectlyCompared': list(range(1,16)),
                           'methods': ['step-by-step finger movement', 'digit DP with remainder state', 'actual Gregorian years 1900..2399', 'exact angle sampling', 'dividend/divisor enumeration', 'unique grid edges', 'four boundary rectangle enumeration', 'actual multiplication digit matching', 'union of internal cut coordinate sets', 'integer ages and exact elapsed-year enumeration', 'stepwise movement state sets', 'all morning start minutes with exact drift', 'actual three-digit number masks and disjoint factor pairs', 'all possible first bag integer weights', 'literal fraction stream state transitions'],
                           'items': evidence}, ensure_ascii=False, indent=2) + '\n')
print('PASS225 answers in fifteen5/5/5 groups; source3.4 preserved in middle; disjoint factor masks, bag states, fraction stream; prior180 content/storage preserved')

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


def boat_edges(shift=0,mirror=False,body_only=False):
    # Endpoint inventory read from original17:12 body+2 mast+2 sail+1 side.
    # Quarter-cell units distinguish the sail attachments and side-stick gap.
    raw=[(4*i,0,4*(i+1),0)for i in range(4)]
    raw += [(4*i,4,4*(i+1),4)for i in [0,1,3]]
    raw += [(4*i,0,4*i,4)for i in range(5)]
    if not body_only:raw += [(8,-8,8,-4),(8,-4,8,0),(8,-8,11,-5),(11,-5,8,-2),(17,2,21,2)]
    def point(x,y):return ((16-x if mirror else x)+4*shift,y)
    return {tuple(sorted([point(a,b),point(c,d)]))for a,b,c,d in raw}


def signed_totals(nums):
    states=collections.Counter({nums[0]:1})
    for value in nums[1:]:
        new=collections.Counter()
        for total,count in states.items():
            new[total+value]+=count;new[total-value]+=count
        states=new
    return states


def shared_signed_totals(a,b):
    states=collections.Counter({(a[0],b[0]):1})
    for v,w in zip(a[1:],b[1:]):
        new=collections.Counter()
        for (x,y),count in states.items():
            new[x+v,y+w]+=count;new[x-v,y-w]+=count
        states=new
    return states


def neg(v):return tuple(-x for x in v)


@functools.lru_cache(None)
def folded_cube():
    net={(0,0):'upperX',(-1,0):'cross',(0,1):'triple',(0,2):'single',(0,3):'dot',(1,2):'rightX'}
    frames={(0,0):((1,0,0),(0,1,0),(0,0,-1))};queue=collections.deque([(0,0)])
    while queue:
        x,y=queue.popleft();u,v,n=frames[x,y]
        for dx,dy,next_frame in [(1,0,(neg(n),v,u)),(-1,0,(n,v,neg(u))),
                                  (0,1,(u,neg(n),v)),(0,-1,(u,n,neg(v)))]:
            pos=x+dx,y+dy
            if pos not in net:continue
            if pos in frames:assert frames[pos]==next_frame
            else:frames[pos]=next_frame;queue.append(pos)
    assert len(frames)==6 and len({n for _,_,n in frames.values()})==6
    return {net[pos]:frame for pos,frame in frames.items()}


@functools.lru_cache(None)
def cube_rotations():
    frames=folded_cube();states=[]
    for permutation in itertools.permutations(range(3)):
        parity=(-1)**sum(permutation[i]>permutation[j]for i in range(3)for j in range(i+1,3))
        for signs in itertools.product([-1,1],repeat=3):
            if parity*signs[0]*signs[1]*signs[2]!=1:continue
            def transform(v):return tuple(signs[i]*v[permutation[i]]for i in range(3))
            moved={f:tuple(transform(v)for v in frame)for f,frame in frames.items()}
            slot={name:next(f for f,(_,_,n)in moved.items()if n==normal)
                  for name,normal in [('top',(0,0,1)),('front',(0,-1,0)),('right',(1,0,0))]}
            states.append((slot,moved))
    assert len(states)==24 and len({tuple(s.values())for s,_ in states})==24
    return states


def pattern(face):return {'upperX':'X','rightX':'X','cross':'C','triple':'H','single':'S','dot':'D'}[face]


@functools.lru_cache(None)
def cross_rectangles():
    cells={(x,y)for x in range(3,8)for y in range(7)}|{(x,y)for x in range(10)for y in [2,3]}
    edges=set()
    for x,y in cells:
        points=[(x,y),(x+1,y),(x+1,y+1),(x,y+1)]
        edges.update(tuple(sorted([points[i],points[(i+1)%4]]))for i in range(4))
    found=[]
    def edge(a,b):return tuple(sorted([a,b]))in edges
    for left,right in itertools.combinations(range(11),2):
        for top,bottom in itertools.combinations(range(8),2):
            if(all(edge((x,top),(x+1,top))and edge((x,bottom),(x+1,bottom))for x in range(left,right))
               and all(edge((left,y),(left,y+1))and edge((right,y),(right,y+1))for y in range(top,bottom))):
                found.append((left,right,top,bottom))
    return found


@functools.lru_cache(None)
def dice_sequences(rolls):
    rows=[]
    for sequence in itertools.product([3,4,5],repeat=rolls):
        product=1
        for value in sequence:product*=value
        rows.append((sequence.count(3),sequence.count(4),sequence.count(5),product))
    return rows


def repeated_twos_digits(count,multiplier):
    carry=0;digits=[]
    for _ in range(count):
        value=2*multiplier+carry;digits.append(value%10);carry=value//10
    while carry:digits.append(carry%10);carry//=10
    return digits


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
    if no == 16:
        if level=='low':
            minute=hour=Fraction(0)
            for _ in range(p['start'],p['finish']):minute+=6;hour+=Fraction(1,2)
            return [int(minute-hour)]
        found=[]
        for start in range(1,p['finish']):
            if level=='middle':
                elapsed=p['finish']-start
                if 6*elapsed-Fraction(elapsed,2)==p['angle']:found.append(start)
            else:
                for first in range(1,180):
                    second=p['finish']-start-p['rest']-first
                    if second<=0:continue
                    if second==p['timeMultiple']*first+p['extraMinutes'] and Fraction(11,2)*second-Fraction(11,2)*first==p['angleDifference']:
                        found.append(start)
        assert len(found)==1,(item['id'],found)
        return [found[0]//60,found[0]%60]
    if no == 17:
        assert len(boat_edges())==17 and len(boat_edges(body_only=True))==12
        if level=='low':return [len(boat_edges(body_only=True)&boat_edges(p['shift'],body_only=True))]
        shifts=p['shifts']if level=='high'else[p['shift']]
        costs=[17-len(boat_edges()&boat_edges(k,True))for k in shifts]
        if level=='high':assert len(set(costs))==2
        return [min(costs)]
    if no == 18:
        if level!='high':
            assert item['promptDataLines'][0]==' □ '.join(map(str,p['nums']))
            assert item['promptDataLines'][0].count('□')==(4 if level=='low'else 6)
            states=signed_totals(p['nums'])
            assert sum(states.values())==(16 if level=='low'else 64)
            return [len(set(states)&set(p['choices']))]
        for nums,target,line in zip([p['first'],p['second']],[p['firstTarget'],p['secondTarget']],item['promptDataLines']):
            assert line==' □ '.join(map(str,nums))+f' ＝ {target}'
        count=shared_signed_totals(p['first'],p['second'])[p['firstTarget'],p['secondTarget']]
        assert 1<count<signed_totals(p['first'])[p['firstTarget']]
        assert count<signed_totals(p['second'])[p['secondTarget']]
        return [count]
    if no == 19:
        if level=='low':
            normals={f:n for f,(_,_,n)in folded_cube().items()};n=normals[p['face']]
            if p['query']=='oppositeLineCount':
                opposite=next(f for f,v in normals.items()if v==neg(n))
                return [{'dot':0,'single':1,'triple':3,'cross':2,'upperX':2,'rightX':2}[opposite]]
            if p['query']=='adjacentPatternCount':
                return [sum(pattern(f)==p['other']and sum(a*b for a,b in zip(n,v))==0 for f,v in normals.items())]
            assert p['query']=='sharedEdges'
            return [int(sum(a*b for a,b in zip(n,normals[p['other']]))==0)]
        conditions={'top':p['allowedTop'],'front':p['allowedFront']}
        if level=='high':conditions['right']=p['allowedRight']
        good=[s for s,_ in cube_rotations()if all(pattern(s[k])in allowed for k,allowed in conditions.items())]
        for omitted in conditions:
            assert sum(all(pattern(s[k])in allowed for k,allowed in conditions.items()if k!=omitted)for s,_ in cube_rotations())>len(good)
        return [len(good)]
    if no == 20:
        if level=='low':
            possible=[both for both in range(min(p['bread'],p['rice'])+1)if p['bread']+p['rice']-both==p['union']]
        else:
            possible=[]
            for union in range(p['total']+1):
                ratio=Fraction(*p['noneRatio'])if level=='middle'else Fraction(1,p['noneDenominator'])
                none=union*ratio
                if union+none+p['other']!=p['total']:continue
                if level=='middle':
                    possible += [both for both in range(min(p['bread'],p['rice'])+1)if p['bread']+p['rice']-both==union]
                else:
                    for bread_only in range(union+1):
                        rice_only=p['exclusiveMultiple']*bread_only
                        both=union-bread_only-rice_only
                        if both>=0 and(rice_only+both)-(bread_only+both)==p['riceBreadDifference']:possible.append(both)
        assert len(possible)==1,(item['id'],possible)
        return possible
    if no == 21:
        rectangles=cross_rectangles()
        if level=='low':return [sum(r-l==p['width']and b-t==p['height']for l,r,t,b in rectangles)]
        if level=='middle':return [sum(r-l==p['width']for l,r,t,b in rectangles)]
        tests=[lambda w,h:w>h,lambda w,h:w*h>=p['minimumArea'],lambda w,h:2*(w+h)<=p['maximumPerimeter']]
        found=sum(all(test(r-l,b-t)for test in tests)for l,r,t,b in rectangles)
        assert all(sum(all(test(r-l,b-t)for i,test in enumerate(tests)if i!=omitted)for l,r,t,b in rectangles)>found for omitted in range(3))
        return [found]
    if no == 22:
        if level=='low':
            found={four for three,four,five,_ in dice_sequences(p['rolls'])if three==p['threes']and five==p['fives']}
            assert len(found)==1
            return [found.pop()]
        if level=='middle':
            found={four for _,four,_,product in dice_sequences(p['rolls'])if product==p['product']}
            assert len(found)==1
            return [found.pop()]
        rows=set(dice_sequences(p['rollsEach']))
        without_difference={(a[3],b[3],a[1],b[1])for a in rows for b in rows if a[3]>b[3]and a[3]*b[3]==p['product']}
        found=[row for row in without_difference if row[0]-row[1]==p['productDifference']]
        assert len(without_difference)>=3 and len(found)==1
        return list(found[0][2:])
    if no == 23:
        digits=repeated_twos_digits(p['twos'],p['multiplier'])
        if level=='low':assert len(set(digits))==1 and len(digits)==p['twos']
        if level=='middle':assert len(digits)==p['twos']+1 and digits[-1]==1
        return [sum(digits)]
    if no == 24:
        if level=='low':
            times=[t for t in range(1,1000)if p['speed']*t-p['length']==p['tunnel']]
            assert len(times)==1
            return times
        if level=='middle':
            front_exit_position=p['speed']*p['frontExit']
            lengths=[length for length in range(1,p['speed']*p['tailExit'])
                     if p['speed']*p['tailExit']-length==front_exit_position]
            assert len(lengths)==1
            return lengths
        tunnels=[length for length in range(1,p['firstSpeed']*p['firstTime'])
                 if p['firstSpeed']*p['firstTime']-p['firstLength']==length]
        assert len(tunnels)==1
        times=[t for t in range(1,1000)if p['secondSpeed']*t-p['secondLength']==tunnels[0]]
        assert len(times)==1
        return times
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
assert 495-Fraction(330,Fraction(11,2))==435
assert len(boat_edges())-len(boat_edges()&boat_edges(0,True))==4
assert min(17-len(boat_edges()&boat_edges(k,True))for k in range(-8,9))==4
assert sorted(set(signed_totals([17,15,13,11,9,7,5]))&{0,5,10,15,20,50,51,52,53,54,57,71,73,77,81})==[5,15,51,53,77]
# Directly read original19 views; include the single/triple line directions.
option_patterns=[('D','C','C'),('S','X','H'),('C','X','X'),('H','X','C'),('X','D','C')]
possible_options=[]
for number,labels in enumerate(option_patterns,1):
    fits=[]
    for slots,moved in cube_rotations():
        if tuple(pattern(slots[k])for k in ['top','front','right'])!=labels:continue
        if number==2:
            # The top single line is parallel to the top/front edge (worldX),
            # and right-face triple lines parallel to the top/right edge (worldY).
            if moved[slots['top']][1]not in [(1,0,0),(-1,0,0)]:continue
            if moved[slots['right']][0]not in [(0,1,0),(0,-1,0)]:continue
        if number==4 and moved[slots['top']][0]not in [(1,0,0),(-1,0,0)]:continue
        fits.append(slots)
    if fits:possible_options.append(number)
assert possible_options==[2,4,5]
assert (680-14)*5//6==555 and 124+451-555==20
assert len(cross_rectangles())==540
assert {four for _,four,_,product in dice_sequences(8)if product==34560}=={4}
assert sum(repeated_twos_digits(2021,398))==8102
assert 43*23-108==881 and [t for t in range(1,100)if 32*t-111==881]==[31]

evidence = []
for item in data['items']:
    actual = answer(item)
    assert actual == item['answerParts'], (item['id'], actual, item['answerParts'])
    assert len(item['solutionSteps']) >= 3 and item['learningLocation'] and item['learningPoint']
    source_points={x['pointBand']for x in legacy.values()if x['sourceNo']==item['sourceNo']}
    if not source_points:
        assert item['sourceNo']in [7,8,17,19,21]
        source_points={'3.4'if item['sourceNo']in [17,19,21]else'2.7'}
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
        if item['sourceNo']in [7,17,19,21,22]:
            from pypdf import PdfReader
            page_index,image_stem={7:(1,'Im71'),17:(2,'Im80'),19:(3,'Im196'),21:(3,'Im192'),22:(3,'Im198')}[item['sourceNo']]
            image = next(x.image for x in PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 1회.pdf').pages[page_index].images if Path(x.name).stem==image_stem)
            if item['sourceNo']==19:image=image.crop((748,20,965,300))
            from PIL import Image
            actual_image = Image.open(ROOT/'bank'/item['asset']['src'])
            assert image.mode==actual_image.mode and image.size==actual_image.size and image.tobytes()==actual_image.tobytes()
        else:
            assert item['asset'] == next(x for x in legacy.values() if x['sourceNo'] == item['sourceNo'])['asset']
        assert (ROOT / 'bank' / item['asset']['src']).is_file()
    evidence.append({'id': item['id'], 'passed': True, 'answer': actual})
for no in data['availableSourceNos']:
    assert collections.Counter(x['practiceLevel'] for x in data['items'] if x['sourceNo'] == no) == dict(low=5, middle=5, high=5)
assert len(data['items']) == 360 and len({x['id'] for x in data['items']}) == 360
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},sort_keys=True)for x in data['items']}) == 360
previous = json.loads(subprocess.check_output(['git', 'show', '59d40a8:bank/data/applied1-balanced15.json'], cwd=ROOT))
for old in previous['items']:
    current = next(x for x in data['items'] if x['id'] == old['id'])
    assert all(current[k] == v for k, v in old.items())
    assert current['practiceStorageVersion'] == old['practiceStorageVersion']
out = ROOT / '.private-work/balanced15-20261024/independent-math.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'dataSha256': hashlib.sha256(FILE.read_bytes()).hexdigest(),
                           'count': len(evidence), 'sourceAnswersDirectlyCompared': list(range(1,25)),
                           'methods': ['step-by-step finger movement', 'digit DP with remainder state', 'actual Gregorian years 1900..2399', 'exact angle sampling', 'dividend/divisor enumeration', 'unique grid edges', 'four boundary rectangle enumeration', 'actual multiplication digit matching', 'union of internal cut coordinate sets', 'integer ages and exact elapsed-year enumeration', 'stepwise movement state sets', 'all morning start minutes with exact drift', 'actual three-digit number masks and disjoint factor pairs', 'all possible first bag integer weights', 'literal fraction stream state transitions', 'accumulated hand motion and all first/second study times', 'full17-stick endpoint graph intersections', 'one/two expression sign-sum dynamic programming', 'BFS folded net plus24proper signed-permutation rotations and source line-direction checks', 'integer partition states and exclusive-group relations', 'all original cross-grid unit boundary edge rectangles', 'actual die-value sequences and ordered person product pairs', 'decimal column multiplication with explicit carry states', 'front/rear train position enumeration'],
                           'items': evidence}, ensure_ascii=False, indent=2) + '\n')
print('PASS360 answers in24complete5/5/5 groups; die sequences, decimal carry states, moving front/rear positions;3.4/4.2source bands preserved;prior315unchanged')

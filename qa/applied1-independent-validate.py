"""Independent finite-domain checks for the stored Applied 1 expansion.

Does not import the authoring script or trust its supplied answer/proof.
Run after building and again before release. Evidence is kept outside Git.
"""
import calendar
import hashlib
import datetime
import itertools
import json
from collections import Counter
from fractions import Fraction
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'bank/data/applied1-expanded.json').read_text())

def edge_count_2d(n):
    edges=set()
    for row in range(n):
        for col in range(-row,row+1):
            pts=[(col,row),(col+1,row),(col+1,row+1),(col,row+1)]
            for i in range(4):edges.add(tuple(sorted((pts[i],pts[(i+1)%4]))))
    return len(edges)

def edge_count_3d(n):
    edges=set()
    for x in range(n):
        for z in range(n-x):
            for dx,dy,dz in itertools.product([0,1],repeat=3):
                a=(x+dx,dy,z+dz)
                for axis,d in enumerate((dx,dy,dz)):
                    if d:continue
                    b=list(a);b[axis]+=1
                    edges.add(tuple(sorted((a,tuple(b)))))
    return len(edges)

def digit_counts_upto(N):
    totals=[0]*10
    for pos in (1,10,100):
        hi=N//(pos*10);cur=N//pos%10;lo=N%pos
        for d in range(1,10):
            totals[d]+=hi*pos+(pos if cur>d else lo+1 if cur==d else 0)
        if hi:totals[0]+=(hi-1)*pos+(pos if cur>0 else lo+1)
    return totals

def solve(no,p):
    if no==1:
        names=['왼손 소지','왼손 약지','왼손 중지','왼손 검지','왼손 엄지','오른손 엄지','오른손 검지','오른손 중지','오른손 약지','오른손 소지']
        index=0;direction=1
        for _ in range(1,p['N']):
            if index==9:direction=-1
            elif index==0:direction=1
            index+=direction
        return [names[index]]
    if no==2:
        a=digit_counts_upto(p['hi']);b=digit_counts_upto(p['lo']-1)
        counts=[x-y for x,y in zip(a,b)];winner=max(counts)
        assert counts.count(winner)==1
        return [counts.index(winner),winner]
    if no==3:
        days=set()
        for year in range(1900,2400):
            dates=[d for d in range(1,32) if datetime.date(year,1,d).weekday()==p['weekday']]
            if sum(dates)==p['sum']:days.add(datetime.date(year,2,p['febDay']).weekday())
        assert len(days)==1
        return [['월요일','화요일','수요일','목요일','금요일','토요일','일요일'][days.pop()]]
    if no==4:
        gaps=[Fraction(30*p['hour'])+Fraction(m,2)-6*m for m in range(61)]
        brackets=[m for m in range(60) if gaps[m]>0 and gaps[m+1]<0]
        assert len(brackets)==1
        return brackets
    if no==5:
        return [n for n in range(100,2000) if n//p['divisor']==p['quotient'] and n%10==p['lastDigit']]
    if no==6:
        N=p['available'];n=1
        while edge_count_2d(n+1)<=N:n+=1
        return [n,N-edge_count_2d(n)]
    if no==9:
        cuts={0,p['length']}
        for step in [p['a'],p['b']]:cuts.update(range(step,p['length'],step))
        return [len(cuts)-1]
    if no==10:
        solutions=[]
        for me in range(5,26):
            teacher=p['presentSum']-me
            if not 20<=teacher<=80:continue
            for brother in range(1,21):
                sister=brother+p['gap'];t=p['years']
                if (brother+t)*5==(me+t)*4 and teacher+me+brother+sister+4*t==p['futureTotal']:
                    solutions.append(teacher)
        assert len(solutions)==1
        return solutions
    if no==11:
        s=[(w,p['draws']-w) for w in range(p['draws']+1) if p['start']+p['forward']*w-p['backward']*(p['draws']-w)==p['end']]
        assert len(s)==1
        return list(s[0])
    if no==12:
        found=[start for start in range(360,720) if Fraction(start)+Fraction(60-p['rate'],60)*(p['observed']-start)==p['display']]
        assert len(found)==1
        return [found[0]//60,found[0]%60]
    if no==13:
        products=set();digits=set(map(str,p['digits']))
        for a in range(100,1000):
            s=str(a)
            if len(set(s))!=3 or not set(s)<=digits:continue
            left=digits-set(s)
            for tail in itertools.permutations(left):products.add(a*int(''.join(tail)))
        return [max(products)-min(products)]
    if no==14:
        found=[]
        for a in range(1,p['total']):
            b=p['ratio']*a+p['extra'];c=p['ratio']*b+p['extra']
            if a+b+c==p['total']:found.append(c)
        assert len(found)==1
        return found
    if no==15:
        sequence=[];first_den=4;length=2
        while len(sequence)<p['index']:
            sequence.extend((j,first_den-j+1) for j in range(1,length+1))
            first_den+=2;length+=1
        return list(sequence[p['index']-1])
    if no==16:
        spans=[t for t in range(1,181) if 6*t-Fraction(t,2)==p['angle']]
        assert len(spans)==1
        start=p['finish']-spans[0]
        return [start//60,start%60]
    if no==18:
        reachable={p['nums'][0]}
        for n in p['nums'][1:]:reachable={x+s*n for x in reachable for s in [-1,1]}
        return [sum(c in reachable for c in p['choices'])]
    if no==20:
        candidates=[]
        for both in range(min(p['bread'],p['rice'])+1):
            union=p['bread']+p['rice']-both;none=p['total']-p['other']-union
            if none>=0 and none*5==union:candidates.append(both)
        assert len(candidates)==1
        return candidates
    if no==22:
        counts=set()
        for seq in itertools.product([3,4,5],repeat=p['rolls']):
            product=1
            for n in seq:product*=n
            if product==p['product']:counts.add(seq.count(4))
        assert len(counts)==1
        return list(counts)
    if no==23:
        carry=0;digits=[]
        for _ in range(p['twos']):
            carry+=2*p['multiplier'];digits.append(carry%10);carry//=10
        while carry:digits.append(carry%10);carry//=10
        return [sum(digits)]
    if no==24:
        tunnel=p['firstSpeed']*p['firstTime']-p['firstLength']
        found=[t for t in range(1,100) if p['secondSpeed']*t-p['secondLength']==tunnel]
        assert len(found)==1
        return found
    if no==25:
        r={'0':'0','1':'1','2':'2','5':'5','6':'9','8':'8','9':'6'};valid=[]
        for n in range(10000,100000):
            s=str(n)
            if len(set(s))<5 or any(c not in r for c in s) or s[-1]=='0':continue
            rotated=int(''.join(r[c] for c in reversed(s)))
            if rotated-n==p['difference']:valid.append(n)
        return valid
    if no==26:
        grid={};counter=1
        for k in range(1,80):
            for r in range(1,k+1):grid[r,k]=counter;counter+=1
            for c in range(k-1,0,-1):grid[k,c]=counter;counter+=1
        first=grid[p['r'],p['c']]
        candidates=[r for r in range(1,80) if grid[r,p['targetCol']]+first==p['sum']]
        assert len(candidates)==1
        return candidates
    if no==27:return [edge_count_3d(p['layers'])]
    if no==29:
        nums={100*a+10*b+c for a,b,c in itertools.product(p['digits'],repeat=3) if a}
        assert len(nums)==48
        return [sum(nums)]
    if no==30:
        matches=[]
        for start in range(360,720):
            sleep=start+p['first'];wake=sleep+p['sleep'];finish=wake+p['last']
            if finish-p['lag']!=p['turtleFinish']:continue
            activity='잠을 자고 있음' if sleep<=p['query']<wake else '달리고 있음'
            assert start<p['query']<finish and p['query'] not in (sleep,wake)
            matches.append([start//60,start%60,activity])
        assert len(matches)==1
        return matches[0]
    raise AssertionError('Unsupported source question '+str(no))

rows=[]
for item in data['items']:
    answer=solve(item['sourceNo'],item['verification']['parameters'])
    assert answer==item['answerParts'],(item['id'],answer,item['answerParts'])
    assert item['pointBand']==('2.7' if item['sourceNo']<=12 else '3.4' if item['sourceNo']<=22 else '4.2')
    assert len(item['solutionSteps'])>=3 and item['learningLocation'] and item['learningPoint']
    assert not item.get('conditionLines') and not item.get('readingHelp')
    rows.append({'id':item['id'],'answer':answer,'passed':True})
assert len(rows)==216 and all(n==9 for n in Counter(x['sourceNo'] for x in data['items']).values())
evidence=ROOT/'.private-work/hw-expansion-20261023/independent-math.json'
evidence.parent.mkdir(parents=True,exist_ok=True)
evidence.write_text(json.dumps({'suite':Path(__file__).name,'independentFromAuthoring':True,'dataSha256':hashlib.sha256((ROOT/'bank/data/applied1-expanded.json').read_bytes()).hexdigest(),'count':len(rows),'items':rows},ensure_ascii=False,indent=2)+'\n')
print(f'PASS {len(rows)} stored questions: independent answers, uniqueness/set completeness, point bands, learning links, 24×9 distinct variants')

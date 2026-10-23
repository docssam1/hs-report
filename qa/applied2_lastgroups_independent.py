"""Independent forward operations, masks, six boundary choices, DP and subset sums."""
import collections, functools, itertools, re

def numeral_candidates(mask,lo,hi):
    return [v for v in range(lo,hi+1)if len(str(v))==len(mask)and all(a=='□'or a==b for a,b in zip(mask,str(v)))]

@functools.lru_cache(None)
def arithmetic_states(rows):
    masks=[row.replace(' ','').replace('×','')for row in rows if '─'not in row]
    assert len(masks)==5
    states=[]
    unit_pat=re.compile(masks[2].replace('□','[0-9]'))
    tens_pat=re.compile(masks[3].replace('□','[0-9]'))
    product_pat=re.compile(masks[4].replace('□','[0-9]'))
    for a in numeral_candidates(masks[0],100,999):
        for b in numeral_candidates(masks[1],10,99):
            if b%10==0:continue
            # Accumulate decimal columns rather than multiplying the whole factors.
            def times(k):
                carry=0;digits=[]
                for ch in reversed(str(a)):
                    carry+=int(ch)*k;digits.append(str(carry%10));carry//=10
                if carry:digits.append(str(carry))
                return ''.join(reversed(digits))
            u,t=times(b%10),times(b//10)
            total=int(u)+10*int(t)
            if unit_pat.fullmatch(u)and tens_pat.fullmatch(t)and product_pat.fullmatch(str(total)):
                states.append((a,b,int(u),int(t),total))
    return tuple(states)

@functools.lru_cache(None)
def cuboid_states():
    out=[]
    for x0,x1 in itertools.combinations(range(6),2):
        for y0,y1 in itertools.combinations(range(4),2):
            for z0,z1 in itertools.combinations(range(4),2):
                out.append((x0,x1,y0,y1,z0,z1))
    assert len(out)==540
    return out

def chosen_cuboids(mode,p):
    selected=[]
    for box in cuboid_states():
        x0,x1,y0,y1,z0,z1=box;w,h,d=x1-x0,y1-y0,z1-z0
        if mode=='fixed':ok=[w,h,d]==p['lengths']
        elif mode=='width2':ok=w==2
        elif mode=='height1':ok=h==1
        elif mode=='depth2':ok=d==2
        elif mode=='squareFront':ok=w==h
        elif mode=='cube':ok=w==h and h==d
        elif mode=='evenNoncube':ok=(w*h*d)%2==0 and (w!=h or h!=d)
        elif mode=='wideEven':ok=w>h and(w*h*d)%2==0
        elif mode=='sum7volume12':ok=w+h+d==7 and w*h*d>=12
        elif mode=='distinctEven':ok=w!=h and h!=d and w!=d and(w*h*d)%2==0
        elif mode=='centerWithoutCorner':
            center=x0<3<=x1 and y0<2<=y1 and z0<2<=z1
            corner=x0<1<=x1 and y0<1<=y1 and z0<1<=z1
            ok=center and not corner
        else:raise AssertionError(mode)
        if ok:selected.append(box)
    return selected

def best_digits(source,delete):
    keep=len(source)-delete
    @functools.lru_cache(None)
    def choose(pos,n,started):
        if not n:return ''
        if len(source)-pos<n:return None
        skip=choose(pos+1,n,started)
        take=None
        if started or source[pos]!='0':
            suffix=choose(pos+1,n-1,True)
            if suffix is not None:take=source[pos]+suffix
        candidates=[x for x in (skip,take)if x is not None]
        return min(candidates)if candidates else None
    answer=choose(0,keep,False);assert answer and len(answer)==keep and answer[0]!='0'
    # The small problems also admit complete literal subsequence enumeration.
    if len(source)<=10:
        all_answers=[''.join(c)for c in itertools.combinations(source,keep)if c[0]!='0']
        assert answer==min(all_answers)
    return answer

def card_count(cards,count_ratio,sum_ratio):
    assert len(cards)==len(set(cards))and min(cards)>0
    assert len(cards)%(count_ratio+1)==0 and sum(cards)%(sum_ratio+1)==0
    n=len(cards)//(count_ratio+1);target=sum(cards)//(sum_ratio+1)
    dp={(0,0):1}
    for card in cards:
        nxt=dict(dp)
        for(k,s),count in dp.items():
            if k<n and s+card<=target:nxt[k+1,s+card]=nxt.get((k+1,s+card),0)+count
        dp=nxt
    return dp.get((n,target),0)

def solve_lastgroups(item):
    no,level,p=item['sourceNo'],item['practiceLevel'],item['verification']['parameters']
    text=item['text'];preserved=item.get('preservedApprovedId')
    if no==25:
        found=[]
        for total in range(p['eat']+1,5001):
            remain=total-p['eat'];valid=True
            for _ in range(p['bags']):
                remain-=p['fixed']
                if remain<0 or remain%3:valid=False;break
                remain-=remain//3
            if valid and remain==p['remaining']:found.append(total)
        assert len(found)==1
        if not preserved:
            assert str(p['remaining'])+'개 남았습니다'in text
            assert ('한 번 더'in text)==(p['bags']==2)
            assert '<mfrac><mn>1</mn><mn>3</mn></mfrac>'in text
        return found
    if no==26:
        total=p['currentSum'];found=[]
        for young in range(total//3+1):
            for middle in range(young+1,total):
                eldest=total-young-middle
                if eldest<=middle:continue
                if level=='low':ok=eldest-young==p['eldestGap']and middle-young==p['middleGap']
                elif level=='middle':ok=eldest-middle==p['eldestMiddleGap']and eldest-young==p['birthRatio']*(middle-young)
                else:
                    back=eldest-p['eldestAtFirst']
                    ok=young-back>=0 and 2*(young-back)==middle-back and eldest-young==3*(middle-young)
                if ok:found.append(young+p.get('futureYears',0))
        assert len(found)==1
        assert str(total)in text
        return found
    if no==27:
        states=arithmetic_states(tuple(item['arithmeticRows']));assert len(states)==1,(item['id'],states)
        a,b,u,t,total=states[0]
        if level=='low':return [u]
        return [total]
    if no==28:
        selected=chosen_cuboids(p['mode'],p)
        if 'solutionTable'in item:
            by_width=collections.Counter(x1-x0 for x0,x1,y0,y1,z0,z1 in selected)
            assert item['solutionTable']['rows']==[[str(w),str(by_width[w])]for w in range(1,6)if level=='high'or by_width[w]]
        if p['mode']=='fixed':
            w,h,d=p['lengths'];assert f'가로{w}칸·높이{h}칸·깊이{d}칸'in text
        assert item['asset']['src']=='assets/applied2/cuboids-original.png'
        return [len(selected)]
    if no==29:
        source=p.get('source')or''.join(map(str,range(p['from'],p['to']+1)))
        if not preserved:
            assert item['promptDataLines']==[source]
            assert str(p['delete'])+'개'in text and '순서는 바꿀 수 없습니다'in text and '0이 아닌'in text
        return [best_digits(source,p['delete'])]
    if no==30:
        assert item['cards']==p['cards']
        actual=card_count(p['cards'],p['countRatio'],p['sumRatio'])
        if not preserved:
            assert str(len(p['cards']))+'장'in text and '순서는 구별하지 않습니다'in text
            n=len(p['cards'])//3;target=sum(p['cards'])//3
            counts=collections.Counter(max(c)for c in itertools.combinations(p['cards'],n)if sum(c)==target)
            assert item['solutionTable']['rows']==[[str(k),str(v)]for k,v in sorted(counts.items(),reverse=True)]
        return [actual]
    raise AssertionError(no)

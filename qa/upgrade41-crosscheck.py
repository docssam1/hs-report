"""승급과정 4-1 생성기 교차 검사 (자바스크립트 생성기 ↔ 파이썬 독립 구현).
사용: node qa/upgrade41-export-problems.cjs 40 /tmp/problems.json && python3 qa/upgrade41-crosscheck.py /tmp/problems.json
자바스크립트 생성기가 만든 문제의 '글'만 읽어 정답을 처음부터 다시 계산하고, 하나라도 다르면 불일치로 보고한다."""
import json,re,sys,random,itertools
from pathlib import Path
from collections import Counter
import importlib.util
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('b',ROOT/'upgrade-bank'/'build_upgrade41.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
read_ko,parse_ko,PLACES=b.read_ko,b.parse_ko,b.PLACES
items=json.load(open(sys.argv[1]))
UNIT={'1조':10**12,'1000억':10**11,'100억':10**10,'10억':10**9,'1억':10**8,'1000만':10**7,'100만':10**6,'10만':10**5,'1만':10**4,'1000':1000,'100':100,'10':10,'1':1}
def prev_perm(a):
    a=a[:];i=len(a)-2
    while i>=0 and a[i]<=a[i+1]: i-=1
    if i<0: return None
    j=len(a)-1
    while a[j]>=a[i]: j-=1
    a[i],a[j]=a[j],a[i];a[i+1:]=reversed(a[i+1:]);return a
def solve_max(L,cap,fixed,rel):
    # 독립 구현: 관계 쌍을 정한 뒤 큰 숫자부터 채우기(B)와, 높은 자리부터 가능성을 되짚는 탐색(A)
    best=None
    pairs=[None] if not rel else [(rel[2]*q,q) for q in range(1,10) if rel[2]*q<=9]
    for pr in pairs:
        digs=dict(fixed)
        if pr:
            dp,dq=pr;p,q=rel[0],rel[1]
            if digs.get(p,dp)!=dp or digs.get(q,dq)!=dq: continue
            digs[p],digs[q]=dp,dq
        used=Counter(digs.values())
        if any(v>cap for v in used.values()): continue
        ok=True
        for pos in range(L,0,-1):
            if pos in digs: continue
            for x in range(9,0,-1):
                if used[x]<cap: digs[pos]=x;used[x]+=1;break
            else: ok=False;break
        if ok:
            arr=[digs[pos] for pos in range(L,0,-1)]
            if best is None or arr>best: best=arr
    # A: 탐색
    import sys as _s;_s.setrecursionlimit(10000)
    def feas(pref):
        used=Counter(pref)
        if any(v>cap for v in used.values()): return False
        for i,d in enumerate(pref):
            if (L-i) in fixed and fixed[L-i]!=d: return False
        if rel:
            p,q,m=rel;ip,iq=L-p,L-q
            if ip<len(pref) and iq<len(pref) and pref[ip]!=m*pref[iq]: return False
        # 남은 자리를 채울 수 있는 최소 조건: 정답이 있는지는 마지막에 정확히 확인
        return sum(cap-used[d] for d in range(1,10))>=L-len(pref)
    res=[None]
    def dfs(pref):
        if len(pref)==L:
            # 최종 정확성: 고정·관계·횟수
            ok=all(fixed.get(L-i,pref[i])==pref[i] for i in range(L)) and all(v<=cap for v in Counter(pref).values())
            if rel: ok=ok and pref[L-rel[0]]==rel[2]*pref[L-rel[1]]
            return pref if ok else None
        for d in range(9,0,-1):
            nx=pref+[d]
            if feas(nx):
                r=dfs(nx)
                if r: return r
        return None
    return best
PL={n:i+1 for i,n in enumerate(PLACES)}
bad=[];count=Counter()
for it in items:
    src,t,ans=it['source'],it['text'],it['answer'];ok=None
    if src=='u1-1-q1':
        m=re.match(r'^(\d+)(?:은|는) (.+)인 수입니다\.',t);N=int(m.group(1));known=0;hid=None
        for part in m.group(2).split(', '):
            mm=re.match(r'(\S+?)(?:이|가) (\(\s*\)|\d+)개$',part);u=UNIT[mm.group(1)]
            if mm.group(2).startswith('('): hid=u
            else: known+=u*int(mm.group(2))
        ok=(N-known)%hid==0 and str((N-known)//hid)==ans
    elif src=='u1-1-q2':
        m=re.search(r'약 (\d+)m를 갑니다\. (\d+)초 동안.*숫자 (\d)(?:이|가) 나타내는 값(을 모두 더하면|은)',t);v,tt,d=int(m.group(1)),int(m.group(2)),m.group(3)
        km=v*tt//1000;assert v*tt%1000==0;s=str(km)
        vals=[int(d)*10**(len(s)-1-i) for i,c in enumerate(s) if c==d]
        exp=sum(vals) if '모두' in m.group(4) else (vals[0] if len(vals)==1 else None)
        ok=exp is not None and str(exp)==ans
    elif src=='u1-1-q3':
        lines=t.split('\n')[1:];pats=[l.split('  ')[1] for l in lines];marks='ㄱㄴㄷㄹㅁ'
        lo=[int(p.replace('□','0')) for p in pats];hi=[int(p.replace('□','9')) for p in pats]
        order=sorted(range(len(pats)),key=lambda i:-lo[i])
        det=all(lo[a]>hi[c] for a,c in zip(order,order[1:]))
        rnd=random.Random(5);stable=True
        for _ in range(6000):
            vals=[int(''.join(str(rnd.randrange(10)) if c=='□' else c for c in p)) for p in pats]
            if sorted(range(len(pats)),key=lambda i:-vals[i])!=order: stable=False;break
        ok=det and stable and ' > '.join(marks[i] for i in order)==ans
    elif src=='u1-1-q4':
        m=re.match(r'^(.+)에서 (\d+)번 뛰어 센 수가 (.+)입니다\. 같은 규칙으로 (.+)에서 (\d+)번 뛰어 센 수를 읽어 보세요\.',t)
        A,K,B,M=parse_ko(m.group(1)),int(m.group(2)),parse_ko(m.group(3)),int(m.group(5))
        ok=(B-A)%K==0 and read_ko(A+M*((B-A)//K))==ans and read_ko(A)==m.group(1) and read_ko(B)==m.group(3)
    elif src=='u1-3-q1':
        n=int(re.search(r'(\d+)자리 수를 만든',t).group(1));s=''.join(str(i) for i in range(1,6000));ok=s[:n][-3:]==ans
    elif src=='u1-3-q2':
        m=re.match(r'^(\d+)보다 크고 (\d+)보다 작은',t);a,bb=int(m.group(1)),int(m.group(2))
        gt='보다 큰 수는' in t and '일의 자리 수가 십의 자리 수보다 큰' in t;lt='일의 자리 수가 십의 자리 수보다 작은' in t
        c=sum(1 for n in range(a+1,bb) if (n//10)%10==(n//100)%10 and (not gt and not lt or gt and n%10>(n//10)%10 or lt and n%10<(n//10)%10))
        ok=str(c)==ans
    elif src=='u1-3-q3':
        k=int(re.search(r'(\d+)번째로 큰 수',t).group(1));cards=[int(x) for x in t.split('\n')[-1].split()]
        seq=[c for c in cards for _ in range(2)]
        lst=sorted({p for p in itertools.permutations(seq) if p[0]!=0},reverse=True)
        ok=''.join(map(str,lst[k-1]))==ans
    elif src=='u1-3-q4':
        L=int(re.search(r'(\d+)자리 자연수',t).group(1));cap=int(re.search(r'숫자를 (\d)번까지',t).group(1));fixed={};rel=None
        for line in t.split('\n')[2:]:
            mm=re.match(r'\d\) (\S+)의 자리 수는 (\d)입니다',line)
            if mm: fixed[PL[mm.group(1)]]=int(mm.group(2));continue
            mm=re.match(r'\d\) (\S+)의 자리 수가 (\S+)의 자리 수의 (\d)배입니다',line)
            if mm: rel=(PL[mm.group(1)],PL[mm.group(2)],int(mm.group(3)))
        best=solve_max(L,cap,fixed,rel);ok=best is not None and ''.join(map(str,best))==ans
    elif src=='u1-3-q5':
        m=re.match(r'^(\d)부터 (\d)까지의 숫자를 한 번씩만 사용하여 만들 수 있는 (\d+)자리 자연수 중에서 (\d+)(?:과|와) (\S+) 번째로 큰 수 사이',t)
        lo_,hi_,nlen,num,ordw=int(m.group(1)),int(m.group(2)),int(m.group(3)),m.group(4),m.group(5)
        kth={'두':2,'세':3,'네':4,'다섯':5,'여섯':6,'일곱':7}[ordw];desc=sorted(range(lo_,hi_+1),reverse=True);assert len(desc)==nlen
        cur=desc[:]
        for _ in range(kth-1): cur=prev_perm(cur)
        target=[int(c) for c in num];steps=0
        while cur!=target:
            cur=prev_perm(cur);steps+=1
            if cur is None or steps>400000: break
        ok=cur==target and str(steps-0-0)==str(steps) and str(steps)==ans  # 두 수 사이에 있는 수 = 걸음 수 − 1 + (kth→num 걸음 수 포함 아님)
        # 걸음 수 steps는 kth번째 수에서 num까지 내려간 횟수이므로, 사이의 수는 steps − 1
        ok=cur==target and str(steps-1)==ans
    count[(src,it['level'])]+=1
    if not ok: bad.append((src,it['level'],t[:90],ans))
print('다시 계산한 문제',sum(count.values()),'| 불일치',len(bad))
for x in bad[:8]: print('  ',x)

sys.exit(1 if bad else 0)

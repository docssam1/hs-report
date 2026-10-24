"""Independent column, cell-boundary, lattice, timeline and operation-tree checks."""
import collections,functools,hashlib,itertools,json,math,re,subprocess
from fractions import Fraction as F
from pathlib import Path
from PIL import Image,ImageChops
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'bank/data/applied4-balanced15.json';data=json.loads(FILE.read_text())
WORK=ROOT/'.private-work/balanced15-20261024/round4-batch1';WORK.mkdir(exist_ok=True)
old_bytes=(ROOT/'bank/data/applied4-expanded.json').read_bytes();old={x['id']:x for x in json.loads(old_bytes)['items']}
assert hashlib.sha256(old_bytes).hexdigest()==data['legacyBankSha256']
assert data['availableSourceNos']==list(range(1,7))and data['pendingSourceNos']==list(range(7,31))
assert len(data['items'])==len({x['id']for x in data['items']})==90

symbols=[]
for a,b,c in itertools.product(range(1,10),range(10),range(1,10)):
    if int(str(a)*3)+int(str(b)*3)==int(str(c)+str(b)*2+'2'):symbols.append((a,b,c))
assert symbols==[(9,3,1)]
star,circle,diamond=symbols[0]

def boundary(cells):return sum((x+dx,y+dy)not in cells for x,y in cells for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)])
def papers(count=5,scale=F(1)):
    length,height,overlap=[int(v*scale)for v in [20,4,2]]
    assert all(v*scale==int(v*scale)for v in [20,4,2])
    return collections.Counter((x+i*(length-overlap),y)for i in range(count)for x in range(length)for y in range(height))
native_papers=papers();unit=set(native_papers);width=max(x for x,y in unit)+1;height=max(y for x,y in unit)+1
assert(width,height,len(unit),boundary(unit))==(92,4,368,192)
assert collections.Counter(native_papers.values())=={1:336,2:32}
def tile(base,rows,cols):
    w=max(x for x,y in base)+1;h=max(y for x,y in base)+1
    return {(x+c*w,y+r*h)for r in range(rows)for c in range(cols)for x,y in base}

points=list(itertools.product(range(5),repeat=2));edges=set()
for a in points:
    for dx,dy in [(1,0),(0,1),(1,-1)]:
        b=(a[0]+dx,a[1]+dy)
        if b in points:edges.add(frozenset((a,b)))
def path_length(a,b):
    dx,dy=b[0]-a[0],b[1]-a[1]
    if not(dx==0 or dy==0 or dx+dy==0):return None
    n=max(abs(dx),abs(dy));step=(dx//n,dy//n)
    return n if all(frozenset(((a[0]+i*step[0],a[1]+i*step[1]),(a[0]+(i+1)*step[0],a[1]+(i+1)*step[1])))in edges for i in range(n))else None
def determinant(a,b,c):return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
triangles=[]
for tri in itertools.combinations(points,3):
    lengths=[path_length(tri[i],tri[(i+1)%3])for i in range(3)]
    if None in lengths or len(set(lengths))!=1:continue
    for a,b,c in itertools.permutations(tri):
        if sum(b)==sum(c):direction='left'if sum(a)<sum(b)else'right';break
    triangles.append(dict(points=tri,side=lengths[0],direction=direction,area=abs(determinant(*tri)),perimeter=sum(lengths)))
assert len(triangles)==60 and collections.Counter(t['side']for t in triangles)=={1:32,2:18,3:8,4:2}
def strict_inside(t,p):
    tri=t['points'];d=[determinant(tri[i],tri[(i+1)%3],p)for i in range(3)]
    return all(v>0 for v in d)or all(v<0 for v in d)

def timeline(setting,elapsed,rate):
    shown=F(setting)
    for _ in range(elapsed):shown+=rate
    return shown
def parse_times(text):
    values=[]
    if '자정에'in text:values.append(0)
    for period,h,m in re.findall(r'(오전|낮|오후)(\d+)시(?:(\d+)분)?',text):values.append((int(h)+(12 if period=='오후'and int(h)<12 else 0))*60+int(m or 0))
    return values

fractions_raw=[(a,d)for d in range(2,201)for a in range(d-1,0,-1)]
assert fractions_raw[:10]==[(1,2),(2,3),(1,3),(3,4),(2,4),(1,4),(4,5),(3,5),(2,5),(1,5)]

examples={'□':[(6,4,2),(8,5,3),(8,11,3)],'△':[(3,5,20),(5,7,42),(5,6,36)],'○':[(6,3,3),(16,2,9),(24,6,5)]}
families={'sum':lambda a,b:a+b,'leftDifference':lambda a,b:a-b,'rightDifference':lambda a,b:b-a,'absoluteDifference':lambda a,b:abs(a-b),'product':lambda a,b:a*b,'incrementLeftProduct':lambda a,b:(a+1)*b,'incrementRightProduct':lambda a,b:a*(b+1),'quotient':lambda a,b:a/b,'reverseQuotient':lambda a,b:b/a,'quotientPlusOne':lambda a,b:a/b+1,'quotientMinusOne':lambda a,b:a/b-1}
rules={}
for symbol,rows in examples.items():
    candidates=[name for name,f in families.items()if all(f(F(a),F(b))==v for a,b,v in rows)]
    assert len(candidates)==1;(rules.setdefault(symbol,candidates[0]))
assert rules=={'□':'absoluteDifference','△':'incrementLeftProduct','○':'quotientPlusOne'}
def parse(expression):
    tokens=re.findall(r'\d+|[xy○□△()]',expression);at=0
    def primary():
        nonlocal at
        token=tokens[at];at+=1
        if token=='(':
            node=chain();assert tokens[at]==')';at+=1;return node
        return token if token in ['x','y']else F(int(token))
    def chain():
        nonlocal at
        node=primary()
        while at<len(tokens)and tokens[at]in rules:
            symbol=tokens[at];at+=1;node=(symbol,node,primary())
        return node
    tree=chain();assert at==len(tokens);return tree
def evaluate(tree,env):
    if isinstance(tree,F):return tree
    if isinstance(tree,str):return F(env[tree])
    symbol,a,b=tree;return families[rules[symbol]](evaluate(a,env),evaluate(b,env))
def contains(tree,var):return tree==var if isinstance(tree,str)else False if isinstance(tree,F)else contains(tree[1],var)or contains(tree[2],var)
def invert(tree,target,var,env):
    if isinstance(tree,str):assert tree==var;return {F(target)}
    symbol,left,right=tree;left_unknown=contains(left,var);known=evaluate(right if left_unknown else left,env);target=F(target)
    if symbol=='□':possible={known+target,known-target}
    elif symbol=='△':possible={target/known-1}if left_unknown and known else {target/(known+1)}if not left_unknown and known!=-1 else set()
    elif symbol=='○':possible={known*(target-1)}if left_unknown else {known/(target-1)}if target!=1 else set()
    result=set()
    for v in possible:result.update(invert(left if left_unknown else right,v,var,env))
    return result

def solve(x):
    no=x['sourceNo'];level=x['practiceLevel'];p=x['verification']['parameters'];mode=p.get('mode')
    if no==1:
        digits=[star,circle,diamond]
        if level=='low':return[dict(star=star,circle=circle,diamond=diamond,carry=(star+circle)//10,sum=int(str(star)*3)+int(str(circle)*3))[mode]]
        ordered=int(''.join(map(str,digits)))
        if level=='middle':
            if mode=='boundedSum':return[sum(n for t in itertools.permutations(digits)if 300<(n:=int(''.join(map(str,t))))<900)]
            if mode=='reverseDifference':return[ordered-int(''.join(map(str,reversed(digits))))]
            if mode=='repeatRange':values={int(''.join(map(str,t)))for t in itertools.permutations([circle,circle,diamond])};return[max(values)-min(values)]
            if mode=='twoDigitSum':return[sum(int(''.join(map(str,t)))for t in itertools.permutations(digits,2))]
            if mode=='fixedTensSum':return[sum(int(''.join(map(str,t)))for t in itertools.permutations(digits)if t[1]==circle)]
        if mode=='threeDigitSum':return[sum(int(''.join(map(str,t)))for t in itertools.permutations(digits))]
        if mode=='sum16':return[sum(sum(t)==16 and all(1<=t.count(v)<=2 for v in digits)for t in itertools.product(digits,repeat=4))]
        if mode=='nonAdjacent':return[sum(all(not(t[i]==t[i+1]==star)for i in range(4))for t in set(itertools.permutations([star,star,circle,circle,diamond])))]
        if mode=='cardCounts':
            answers=[[a,b,c]for a,b,c in itertools.product(range(1,9),repeat=3)if a+b+c==8 and star*a+circle*b+diamond*c==36];assert len(answers)==1;return answers[0]
        if mode=='multiple11':return[sum(int(''.join(map(str,t)))%11==0 for t in set(itertools.permutations(digits*2)))]
    if no==2:
        if level=='low':return[dict(length=width,area=len(unit),overlapArea=sum(v>1 for v in native_papers.values()),lastAdded=(len(unit)-len(papers(4)))//height,paperArea=sum(native_papers.values()))[mode]]
        if level=='middle':
            if mode=='shortJoin2':return[boundary(tile(unit,1,2))]
            if mode=='longJoin3':return[boundary(tile(unit,3,1))]
            if mode=='grid2x3':return[boundary(tile(unit,2,3))]
            if mode=='cutVertical4':return[sum(boundary({(a,b)for a,b in unit if width*i//4<=a<width*(i+1)//4})for i in range(4))]
            if mode=='cutHorizontal4':return[sum(boundary({(a,b)for a,b in unit if height*i//4<=b<height*(i+1)//4})for i in range(4))]
        if mode=='unknownStrip':
            matches=[n for n in range(1,744//(2*width)+1)if boundary(tile(unit,1,n))==744];assert len(matches)==1;return[matches[0],len(tile(unit,1,matches[0]))]
        if mode in ['gridInverse','minimumGrid']:
            options=[(20//c,c,boundary(tile(unit,20//c,c)))for c in range(1,21)if 20%c==0]
            if mode=='gridInverse':answers=[list(t[:2])for t in options if t[2]==776]
            else:answers=[list(t)for t in options if t[2]==min(a[2]for a in options)]
            assert len(answers)==1;return answers[0]
        if mode=='squareCuts':
            matches=[n for n in range(1,93)if n*len(unit)==92*height*height];assert len(matches)==1;joined=tile(unit,1,matches[0]);squares=[{(a,b)for a,b in joined if height*i<=a<height*(i+1)}for i in range(92)];assert all(len(s)==height**2 for s in squares);return[5*matches[0]]
        if mode=='scaledGrid':
            scaled=set(papers(scale=F(96,boundary(unit))));assert boundary(scaled)==96;answers=[[8//c,c]for c in range(1,9)if 8%c==0 and boundary(tile(scaled,8//c,c))==200];assert len(answers)==1;return answers[0]
    if no==3:
        if level=='low':
            if mode=='unit':return[sum(t['side']==1 for t in triangles)]
            if mode=='largest':return[sum(t['side']==max(v['side']for v in triangles)for t in triangles)]
            if mode=='leftUnit':return[sum(t['side']==1 and t['direction']=='left'for t in triangles)]
            if mode=='vertices':return[len(set(p for edge in edges for p in edge))]
            if mode=='boundary':return[sum(all(a[i]==b[i]and a[i]in[0,4]for a,b in [tuple(edge)])for edge in edges for i in [0,1])]
        if level=='middle':
            if mode=='smallLargestPair':return[sum(a['side']==1 and b['side']==4 for a,b in itertools.product(triangles,triangles))]
            if mode=='nonUnitDirections':return[sum(a['direction']=='left'and b['direction']=='right'and a['side']>1 and b['side']>1 for a,b in itertools.product(triangles,triangles))]
            if mode=='side2Perimeter':return[sum(t['perimeter']for t in triangles if t['side']==2)]
            if mode=='areaClassDifference':return[sum(t['area']==4 for t in triangles)-sum(t['area']==9 for t in triangles)]
            if mode=='pairInsideLargest':
                large=next(t for t in triangles if t['side']==4 and t['direction']=='left')
                def closed(point):
                    a,b,c=large['points'];d=[determinant(large['points'][i],large['points'][(i+1)%3],point)for i in range(3)];return all(v>=0 for v in d)or all(v<=0 for v in d)
                inside=[t for t in triangles if all(closed(p)for p in t['points'])]
                small=sum(t['side']==1 for t in inside);medium=sum(t['side']==2 for t in inside)
                assert (small,medium)==(16,7)
                return[small*medium]
        if mode=='areaSum':return[sum(t['area']for t in triangles)]
        if mode=='perimeterSum':return[sum(t['perimeter']for t in triangles)]
        if mode=='strictCentre':return[sum(strict_inside(t,(2,2))for t in triangles)]
        left=[t for t in triangles if t['direction']=='left'];right=[t for t in triangles if t['direction']=='right']
        if mode=='sameSizePair':return[sum(a['side']==b['side']for a,b in itertools.product(left,right))]
        if mode=='area10Pair':return[sum(a['area']+b['area']==10 for a,b in itertools.product(left,right))]
    if no==4:
        if level=='low':
            assert int(re.search(r'실제1시간마다(\d+)분씩',x['text'])[1])==p['loss'];assert int(re.search(r'실제로(\d+)분이',x['text'])[1])==p['realElapsed'];value=timeline(p['setting'],p['realElapsed'],F(60-p['loss'],60));assert value.denominator==1;return list(divmod(int(value),60))
        if level=='middle':
            observed=parse_times(x['text']);assert observed==[p['realObserved'],p['displayObserved']]
            rate=F(60-p['loss'],60);matches=[start for start in range(p['realObserved'])if start+(p['realObserved']-start)*rate==p['displayObserved']];assert len(matches)==1;assert timeline(matches[0],p['realObserved']-matches[0],rate)==p['displayObserved'];return list(divmod(matches[0],60))
        observed=parse_times(x['text']);assert observed==[p['setting'],p['fastDisplay'],p['slowDisplay']]
        rate=F(60+p['fastGain'],60);matches=[t for t in range(1,1440-p['setting'])if p['setting']+t*rate==p['fastDisplay']];assert len(matches)==1;elapsed=matches[0];loss=60*(1-F(p['slowDisplay']-p['setting'],elapsed));assert 0<loss<60 and loss.denominator==1;assert timeline(p['setting'],elapsed,1-loss/60)==p['slowDisplay'];return[elapsed,int(loss)]
    if no==5:
        rendered=[tuple(map(int,m))for m in re.findall(r'<mn>(\d+)</mn><mn>(\d+)</mn>',x['promptDataLines'][0])];assert rendered==fractions_raw[:10]
        if level=='low':a,d=fractions_raw[p['index']-1];return[d-a]
        if level=='middle':return[fractions_raw.index((p['comparisonNumerator'],p['comparisonDenominator']))-fractions_raw.index((p['numerator'],p['denominator']))]
        if mode=='boundary':matches=[i+1 for i in range(len(fractions_raw)-1)if fractions_raw[i][1]!=fractions_raw[i+1][1]and fractions_raw[i][1]+fractions_raw[i+1][1]==p['denominatorSum']];assert len(matches)==1;return matches
        if mode=='sum55':return[sum(a for a,d in fractions_raw[:55]),sum(d for a,d in fractions_raw[:55])]
        if mode=='sum17':positions=[i+1 for i,(a,d)in enumerate(fractions_raw)if a+d==17];return[min(positions),max(positions)]
        if mode=='halfFifth':positions=[i+1 for i,(a,d)in enumerate(fractions_raw)if F(a,d)==F(1,2)][:5];return[positions[-1],sum(positions)]
        if mode=='first100Difference':terms=[(a,d)for a,d in fractions_raw[:100]if d-a==3];return[len(terms),sum(d for a,d in terms)]
    if no==6:
        if level=='low':return[int(evaluate(parse(f"{p['outer']}△(({p['dividend']}○{p['divisor']})□{p['subtract']})"),{}))]
        if level=='middle':
            assert x['promptDataLines']==[p['expression']+'＝'+str(p['value'])];tree=parse(p['expression']);candidates=invert(tree,F(p['value']),'x',{});valid=[int(v)for v in candidates if v>0 and v.denominator==1 and('x는12보다 큽니다.'not in x['text']or v>12)];assert len(valid)==1 and evaluate(tree,dict(x=valid[0]))==p['value'];return valid
        eq=[(parse(expression),F(value))for expression,value in p['equations']];assert x['promptDataLines']==[expression+'＝'+str(value)for expression,value in p['equations']]
        if mode=='chain':
            candidates=[]
            for a in invert(eq[1][0],eq[1][1],'x',{}):
                if a.denominator!=1 or a<=12:continue
                for b in invert(eq[0][0],eq[0][1],'y',dict(x=a)):
                    if b>0 and b.denominator==1:candidates.append((int(a),int(b)))
        elif mode=='ratioDifference':candidates=[(b+18,b)for b in range(1,19)]
        else:
            product=int(eq[0][1]);candidates=[(product//b-1,b)for b in range(1,product+1)if product%b==0 and product//b-1>0]
        valid=[]
        for a,b in candidates:
            if 'x가y보다 큽니다.'in x['text']and not a>b:continue
            if 'x가y보다 크고'in x['text']and not(a>b and a+b==18):continue
            if all(evaluate(tree,dict(x=a,y=b))==value for tree,value in eq):valid.append([a,b])
        assert len(valid)==1;return valid[0]
    raise AssertionError((no,level,mode))

evidence=[]
for x in data['items']:
    answer=solve(x);assert answer==x['answerParts'],(x['id'],answer,x['answerParts'])
    assert x['sourcePointBand']=='2.7'and x['pointBand']==dict(low='2.7',middle='3.4',high='4.2')[x['practiceLevel']]
    assert x['answerContract']=='ordered-parts'and len(answer)==len(x['answerLabels'])and len(x['solutionSteps'])>=3
    assert x['solution']==' '.join(x['solutionSteps'])and not any(k in x for k in ['hints','conditionSummary'])
    assert x['verification']['sourceExamPage']==1 and x['verification']['sourceAnswerPage']==x['sourceNo']
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in old[x['id']].items())
    else:assert len(x['levelReview']['axes'])==9 and x['difficultyEvidence']['measuredVariantRate']is None and not x['difficultyEvidence']['sourceReasoningPreserved']
    evidence.append(dict(id=x['id'],passed=True,answer=answer))
for no in range(1,7):assert collections.Counter(x['practiceLevel']for x in data['items']if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable','cards']},ensure_ascii=False,sort_keys=True)for x in data['items']})==90
pdf=PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 4회.pdf')
for stem,name in [('Im50','symbol-addition-original.png'),('Im52','rhombus-mesh-original.png'),('Im54','operator-examples-original.png')]:
    native=next(i.image for i in pdf.pages[0].images if Path(i.name).stem==stem).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied4'/name).convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
native=next(i.image for i in pdf.pages[0].images if Path(i.name).stem=='Im51').convert('RGB');box=(115,15,665,100);actual=Image.open(ROOT/'bank/assets/applied4/overlap-strip-original.png').convert('RGB');assert actual.size==(550,85)and native.crop(box).tobytes()==actual.tobytes();retained=Image.new('RGB',native.size,'white');retained.paste(actual,box[:2]);assert retained.tobytes()==native.tobytes(),'Only empty white margin may be cropped'
protected=json.loads((WORK/'protected-files.json').read_text())
for f in protected['files']:assert hashlib.sha256((ROOT/f['path']).read_bytes()).hexdigest()==f['sha256'],f['path']
(WORK/'independent-math.json').write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=90,methods=['actual decimal digit enumeration','integer paper-cell union/exposed boundary','drawn lattice segment triangle enumeration','exact minute-by-minute clock rates','literal unreduced descending fraction list','sample-fitted operator family and inverse AST/positive divisor pairs'],items=evidence),ensure_ascii=False,indent=2)+'\n')
(WORK/'native-mesh-evidence.json').write_text(json.dumps(dict(symbolSolutions=symbols,paperAreas=dict(union=len(unit),raw=sum(native_papers.values()),doubleCovered=sum(v==2 for v in native_papers.values()),boundary=boundary(unit)),triangles=[dict(points=t['points'],side=t['side'],direction=t['direction'],area=t['area'],perimeter=t['perimeter'])for t in triangles],operatorRules=rules,protectedFiles=len(protected['files'])),indent=2)+'\n')
print('PASS90 Applied4:6complete5/5/5groups;80new+10approved;decimal columns/cell union and exposed boundaries/actual lattice triangles/rational timelines/raw fractions/learned operation AST;52protected files/native image pixels unchanged')

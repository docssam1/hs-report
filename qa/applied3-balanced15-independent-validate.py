"""Validate raw fractions, physical spreads, exact line intersections, mesh faces and work rates."""
import collections,datetime,functools,hashlib,itertools,json,math,re,subprocess,tempfile
from fractions import Fraction as F
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'bank/data/applied3-balanced15.json'
data=json.loads(FILE.read_text());legacy_bytes=(ROOT/'bank/data/applied3-expanded.json').read_bytes()
legacy={x['id']:x for x in json.loads(legacy_bytes)['items']}
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
assert data['availableSourceNos']==list(range(1,31))and data['pendingSourceNos']==[]
assert len(data['items'])==len({x['id']for x in data['items']})==450

raw_fractions=[(a,k+2-a)for k in range(1,100)for a in range(1,k+1)]
assert raw_fractions[:6]==[(1,2),(1,3),(2,2),(1,4),(2,3),(3,2)]

@functools.lru_cache(None)
def line_regions(n,families):
    normals=[]
    for i,k in enumerate(families):normals.extend([(0,1)if i==0 else(1,0)]*k)
    normals += [(1,m)for m in range(1,n-len(normals)+1)]
    assert len(normals)==n
    lines=[];regions=1;vertices=set()
    for i,(a,b)in enumerate(normals):
        prior=[]
        for u,v,w in lines:
            for aa,bb,cc in lines:
                det=u*bb-aa*v
                if det:prior.append(((w*bb-cc*v)/det,(u*cc-aa*w)/det))
        c=next(F(i*100+j,10000000)for j in range(1,1000)if all(a*x+b*y!=F(i*100+j,10000000)for x,y in prior))
        crosses=set()
        for u,v,w in lines:
            det=a*v-u*b
            if not det:continue
            x,y=(c*v-w*b)/det,(a*w-u*c)/det
            assert x*x+y*y<1,'All attainable crossings must lie inside the pizza'
            crosses.add((x,y))
        regions+=len(crosses)+1;vertices.update(crosses);lines.append((a,b,c))
    assert regions==1+n+len(vertices)
    return regions

def cube_faces(c):
    x,y,z=c
    return {(0,x,y,z),(0,x+1,y,z),(1,y,x,z),(1,y+1,x,z),(2,z,x,y),(2,z+1,x,y)}

def mesh_boundary(cubes):
    owners=collections.Counter(face for c in cubes for face in cube_faces(c))
    assert max(owners.values())<=2
    return {f for f,n in owners.items()if n==1}

solid={(x,y,6-side)for side in range(1,7)for x in range(side)for y in range(side)}
paint=mesh_boundary(solid)
painted={c:len(cube_faces(c)&paint)for c in solid}
assert len(solid)==91 and collections.Counter(painted.values())=={0:14,1:28,2:24,3:21,4:3,5:1}

def flag_points(n,layers):
    assert n-2*(layers-1)>=2
    points=set()
    for i in range(layers):
        a,b=i,n-1-i
        points.update((x,y)for x in range(a,b+1)for y in [a,b])
        points.update((x,y)for y in range(a,b+1)for x in [a,b])
    return points

def work_rates(rows):
    n=len(rows);assert all(len(r)==n for r in rows)
    matrix=[[F(x)for x in row]+[F(1)]for row in rows]
    for col in range(n):
        pivot=next((j for j in range(col,n)if matrix[j][col]),None);assert pivot is not None,'Work rates must be unique'
        matrix[col],matrix[pivot]=matrix[pivot],matrix[col]
        value=matrix[col][col];matrix[col]=[x/value for x in matrix[col]]
        for j in range(n):
            if j!=col:
                value=matrix[j][col];matrix[j]=[a-value*b for a,b in zip(matrix[j],matrix[col])]
    rates=[row[-1]for row in matrix];assert min(rates)>0
    assert all(sum(t*r for t,r in zip(row,rates))==1 for row in rows)
    return rates

def linear_solve(matrix,rhs):
    n=len(matrix[0]);rows=[[F(a)for a in r]+[F(b)]for r,b in zip(matrix,rhs)];pivot_row=0
    for col in range(n):
        pivot=next(i for i in range(pivot_row,len(rows))if rows[i][col]);rows[pivot_row],rows[pivot]=rows[pivot],rows[pivot_row]
        z=rows[pivot_row][col];rows[pivot_row]=[a/z for a in rows[pivot_row]]
        for i in range(len(rows)):
            if i!=pivot_row:
                z=rows[i][col];rows[i]=[a-z*b for a,b in zip(rows[i],rows[pivot_row])]
        pivot_row+=1
    assert all(any(r[:n])or r[-1]==0 for r in rows)
    solution=[rows[i][-1]for i in range(n)];assert all(sum(F(a)*x for a,x in zip(r,solution))==b for r,b in zip(matrix,rhs));return solution

@functools.lru_cache(None)
def triangle_enumeration():
    return [t for t in itertools.permutations(range(1,10))if sum(t[i]for i in [0,1,2,3])==sum(t[i]for i in [3,4,5,6])==sum(t[i]for i in [6,7,8,0])==23]

@functools.lru_cache(None)
def native_cuboids():
    boxes=[]
    for x0,x1 in itertools.combinations(range(6),2):
        for y0,y1 in itertools.combinations(range(4),2):
            for z0,z1 in itertools.combinations(range(5),2):
                cells={(a,b,c)for a in range(x0,x1)for b in range(y0,y1)for c in range(z0,z1)}
                boxes.append(dict(lo=(x0,y0,z0),hi=(x1,y1,z1),shape=(x1-x0,y1-y0,z1-z0),cells=cells))
    assert len(boxes)==900;return boxes

def original29_regions():
    from collections import deque
    im=Image.open(ROOT/'bank/assets/applied3/circles-tangent-original.png').convert('RGB');w,h=im.size
    white={(x,y)for y in range(h)for x in range(w)if min(im.getpixel((x,y)))>245};result=[]
    while white:
        start=white.pop();queue=deque([start]);points=[start]
        while queue:
            x,y=queue.popleft()
            for p in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if p in white:white.remove(p);points.append(p);queue.append(p)
        if len(points)<=50 or any(x in [0,w-1]or y in[0,h-1]for x,y in points):continue
        cx,cy=[sum(p[i]for p in points)/len(points)for i in [0,1]]
        #Interior centroids classify the five actual connected raster regions.
        membership=int((cx-81)**2+(cy-124)**2<63**2)+int((cx-175.5)**2+(cy-133.5)**2<79**2)
        result.append(dict(area=len(points),centroid=[cx,cy],memberships=membership))
    assert len(result)==5;return result

native_regions29=original29_regions();circle_graph_evidence={}
@functools.lru_cache(None)
def tangent_regions(n,strict=False):
    #Rational centers lie on a circle of radius1/4; inner radii are3/4
    #(internally tangent) or2/3(strict). Any two meet twice. Three centers
    #are noncollinear and their radical center is the origin, whose distance
    #1/4 differs from either radius, so no triple circle intersection exists.
    radius=F(2,3)if strict else F(3,4);centers=[]
    for t in range(1,n+1):
        p=(F(1-t*t,4*(1+t*t)),F(2*t,4*(1+t*t)));assert sum(c*c for c in p)==F(1,16);centers.append(p)
    assert F(1,4)+radius<1 if strict else F(1,4)+radius==1
    vertices={};events=[[]for _ in centers];outer=[]
    if not strict:
        for i,c in enumerate(centers):
            name=f't{i}';vertices[name]=tuple(float(4*v)for v in c);events[i].append(name);outer.append(name)
    for i,a in enumerate(centers):
        for j in range(i):
            b=centers[j];dx,dy=float(b[0]-a[0]),float(b[1]-a[1]);distance=math.hypot(dx,dy)
            assert 0<distance<float(2*radius)
            height=math.sqrt(float(radius)**2-distance**2/4)
            midpoint=[float(a[k]+b[k])/2 for k in [0,1]]
            for sign in [-1,1]:
                point=(midpoint[0]-sign*height*dy/distance,midpoint[1]+sign*height*dx/distance);name=f'p{i}-{j}-{sign}'
                assert point[0]**2+point[1]**2<1+1e-10
                for k,c in enumerate(centers):
                    delta=abs(math.hypot(point[0]-float(c[0]),point[1]-float(c[1]))-float(radius))
                    if k in [i,j]:assert delta<1e-10
                    else:assert delta>1e-12,'unexpected triple crossing'
                vertices[name]=point;events[i].append(name);events[j].append(name)
    edges=[]
    for i,names in enumerate(events):
        if not names:name=f'i{i}';vertices[name]=(float(centers[i][0]+radius),float(centers[i][1]));names=[name]
        names=sorted(names,key=lambda key:math.atan2(vertices[key][1]-float(centers[i][1]),vertices[key][0]-float(centers[i][0])))
        edges.extend((names[j],names[(j+1)%len(names)])for j in range(len(names)))
    if not outer:vertices['outer']=(1.,0.);outer=['outer']
    outer=sorted(outer,key=lambda key:math.atan2(vertices[key][1],vertices[key][0]));edges.extend((outer[j],outer[(j+1)%len(outer)])for j in range(len(outer)))
    parent={v:v for v in vertices}
    def find(v):
        while parent[v]!=v:parent[v]=parent[parent[v]];v=parent[v]
        return v
    for a,b in edges:parent[find(a)]=find(b)
    components=len({find(v)for v in vertices});regions=len(edges)-len(vertices)+components
    if strict:
        assert components==2 and len(vertices)==n*(n-1)+1+(n==1)
    else:assert components==1 and len(vertices)==n*n and len(edges)==2*n*n
    circle_graph_evidence[f'{n}-{strict}']=dict(circles=n,boundaryContacts=0 if strict else n,vertices=len(vertices),edges=len(edges),components=components,interiorRegions=regions)
    return regions


def solve(x):
    no,level,p=x['sourceNo'],x['practiceLevel'],x['verification']['parameters'];text=x['text']
    if no==1:
        shown=[(int(a),int(b))for line in x['promptDataLines']for a,b in re.findall(r'<mfrac><mn>(\d+)</mn><mn>(\d+)</mn></mfrac>',line)]
        assert shown==raw_fractions[:6]
        if level=='low':return [sum(raw_fractions[p['index']-1])]
        if level=='middle':
            needle=(p['numerator'],p['denominator']);assert str(needle[0])in text and str(needle[1])in text
            found=[[i+1]for i,t in enumerate(raw_fractions)if t==needle]
        else:
            found=[]
            for i,(a,b)in enumerate(raw_fractions[:300]):
                for j,(c,d)in enumerate(raw_fractions[i+1:300],i+1):
                    if a+b==c+d and a+c==p['numeratorSum']and b+d==p['denominatorSum']and c-a==p['numeratorDifference']:found.append([i+1,j+1])
            assert all(str(v)in text for v in p.values())
        assert len(found)==1;return found[0]
    if no==2:
        if level=='low':found=[[a,a+1]for a in range(2,2000,2)if a*(a+1)==p['product']]
        elif level=='middle':
            step=2*p['leaves'];assert f"{p['leaves']}장 더 뒤쪽"in text and str(p['productDifference'])in text
            found=[[a,a+1]for a in range(2,2000,2)if(a+step)*(a+step+1)-a*(a+1)==p['productDifference']]
        else:
            found=[[a,a+p['leftGap']]for a in range(2,2000,2)if a*(a+1)+(a+p['leftGap'])*(a+p['leftGap']+1)==p['productSum']]
            assert all(str(v)in text for v in p.values())
        assert len(found)==1;return found[0]
    if no==3:
        groups=tuple(p.get('parallelFamilies',[]))
        if level=='middle':return [line_regions(p['cuts'],groups)]
        found=next(n for n in range(max(1,sum(groups)),40)if line_regions(n,groups)>=p['students'])
        if found>sum(groups):assert line_regions(found-1,groups)<p['students']
        return [found]
    if no==4:
        if level=='low':return [dict(topLayer=sum(c[2]==5 for c in solid),bottomLayer=sum(c[2]==0 for c in solid),allCubes=len(solid),paintFive=sum(v==5 for v in painted.values()),paintFour=sum(v==4 for v in painted.values()))[p['mode']]]
        if level=='middle':
            mode=p['mode'];pred=lambda c,n:dict(exactOne=n==1,atLeastThree=n>=3,atMostOne=n<=1,bottomTwo=c[2]==0 and n==2,aboveBaseTwo=c[2]>0 and n==2)[mode]
            rows=[[str(z+1),str(sum(pred(c,n)for c,n in painted.items()if c[2]==z))]for z in range(6)]
            assert x['solutionTable']['rows']==rows;return [sum(int(r[1])for r in rows)]
        cutoff=6-p['removeTopLayers'];remain={c for c in solid if c[2]<cutoff};new_paint=mesh_boundary(remain)
        rows=[[str(z+1),str(sum(len(cube_faces(c)&paint)==2 for c in remain if c[2]==z)),str(sum(len(cube_faces(c)&new_paint)==2 for c in remain if c[2]==z))]for z in range(cutoff)]
        assert x['solutionTable']['rows']==rows
        assert f"{p['removeTopLayers']}개 층"in text
        return [sum(int(r[1])for r in rows),sum(int(r[2])for r in rows)]
    if no==5:
        if level=='low':return [len(flag_points(p['outerSidePoints'],p['layers']))]
        if level=='middle':found=[[n]for n in range(6,150)if len(flag_points(n,3))==p['total']]
        else:found=[[r,p['innerSide']+2*(r-1)]for r in range(1,51)if len(flag_points(p['innerSide']+2*(r-1),r))==p['total']]
        assert len(found)==1;return found[0]
    if no==6:
        if level=='low':
            assert f"가가{p['aDays']}일 일한 뒤 나가{p['bDays']}일"in text and f"나의{p['rateRatio']}배"in text
            # Solve a known-ratio equation without the author's unit-work formula.
            b=F(1,p['rateRatio']*p['aDays']+p['bDays']);rates=[p['rateRatio']*b]
            assert rates[0]*p['aDays']+b*p['bDays']==1
        else:
            rows=p['schedules'];rates=work_rates(rows)
            if level=='high':
                assert x['givenTable']['headers']==['일정','가(일)','나(일)','다(일)']
                shown=[[int(v)for v in r[1:]]for r in x['givenTable']['rows']]
                assert shown==rows and x['givenTable']['rows']==[[str(i+1)]+list(map(str,r))for i,r in enumerate(rows)]
                rates=work_rates(shown)
            else:assert all(f'가가{a}일 일한 뒤 나가{b}일'in text for a,b in rows)
        alone=[1/r for r in rates];assert all(v.denominator==1 for v in alone);return [v.numerator for v in alone]
    if no==7:
        # Independent rigid rotations of normal vectors, not the author's face permutations/cycle.
        normals={(0,0,1):2,(0,0,-1):5,(1,0,0):1,(-1,0,0):6,(0,1,0):3,(0,-1,0):4}
        route='EESWW' if level=='low' else ('EESWWEENWW' if level=='high' else 'EESWWEENWW'[:5+p['returnSteps']])
        count=p['stop'] if level=='low' else p.get('rolls',len(route));tops=[]
        for i in range(count):
            d=route[i%len(route)];moved={}
            for (a,b,c),value in normals.items():
                dest={'E':(c,b,-a),'W':(-c,b,a),'S':(a,c,-b),'N':(a,-c,b)}[d];moved[dest]=value
            normals=moved;assert len(normals)==6;tops.append(normals[(0,0,1)])
        if level=='low':return[tops[-1]]
        if level=='middle':return[sum(tops),normals[(0,0,-1)]]
        return[sum(tops),tops[-1]]
    if no==8:
        if level=='low':
            year=2013;dt=datetime.date(year+1,1,p['nextJanuaryDay']);return[['월요일','화요일','수요일','목요일','금요일','토요일','일요일'][dt.weekday()]]
        years=[y for y in range(2000,2040)if datetime.date(y,6,1).weekday()==5];results=[]
        for year in years:
            if level=='middle':
                def selected(month,dayofweek,occurrence):
                    days=[datetime.date(year,month,d)for d in range(1,32)if d<=__import__('calendar').monthrange(year,month)[1]and datetime.date(year,month,d).weekday()==dayofweek]
                    return days[occurrence-1]
                a=selected(p['startMonth'],p['startWeekday'],p['startOccurrence']);b=selected(p['endMonth'],p['endWeekday'],p['endOccurrence']);results.append([(b-a).days+1])
            else:
                days=[datetime.date(year,6,1)+datetime.timedelta(days=i)for i in range((datetime.date(year,12,31)-datetime.date(year,6,1)).days+1)]
                planned=[d for d in days if d.weekday()in p['weekdays']];extra=datetime.date(year,*p['extraClosedDate']);assert extra in planned and extra.month!=p['closedMonth']
                expected=[[str(m)+'월',str(sum(d.month==m for d in planned))]for m in range(6,13)];assert x['solutionTable']['rows']==expected
                results.append([len([d for d in planned if d.month!=p['closedMonth']and d!=extra])])
        assert all(a==results[0]for a in results);return results[0]
    if no==9:
        if level=='low':
            length,step,k=p['perimeter'],p['spacing'],p['between'];positions={F(a*step)+F(step*j,k+1)for a in range(length//step)for j in range(k+1)};assert all(0<=t<length for t in positions);return[len(positions)]
        if level=='middle':
            found=[[a*p['spacing']]for a in range(1,p['totalTrees'])if p['totalTrees']-2*a==p['cherryMinusMagnolia']and (p['totalTrees']-a)%a==0]
        else:
            found=[]
            for a in range(1,p['totalTrees']):
                for b in range(1,p['totalTrees']):
                    if a*(p['betweenA']+1)+b*(p['betweenB']+1)==p['totalTrees']and b*p['spacingB']-a*p['spacingA']==p['perimeterDifference']:found.append([a*p['spacingA'],b*p['spacingB']])
        assert len(found)==1;return found[0]
    if no==10:
        if level=='low':return[v for v in range(1,p['limit'])if v%p['m']==p['m']-p['c']and v%p['n']==p['n']-p['c']]
        if level=='middle':return[sum(v for v in range(1,p['limit'])if v%p['m']==p['remainderM']and v%p['n']==p['remainderN'])]
        d,r=p['divisors'],p['remainders'];found=[v for v in range(1,p['limit'])if all(v%a==b for a,b in zip(d,r))];assert len(found)==1
        for skip in range(3):assert sum(all(v%a==b for i,(a,b)in enumerate(zip(d,r))if i!=skip)for v in range(1,p['limit']))>1,'Each remainder must be necessary'
        return found
    if no==11:
        rows=[];next_value=1
        for size in range(1,151):rows.append(list(range(next_value,next_value+size)));next_value+=size
        if level=='low':return[sum(rows[p['row']-1])]
        if level=='middle':
            found=[r for r in rows if r[0]+r[-1]==p['endpointSum']];assert len(found)==1;return[found[0][p['position']-1]]
        found=[i for i in range(149)if sum(rows[i])+sum(rows[i+1])==p['adjacentRowsSum']];assert len(found)==1;i=found[0]
        expected=[[str(j+1),str(sum(rows[j])),str(sum(rows[j+1])),str(sum(rows[j])+sum(rows[j+1]))]for j in range(i-1,i+2)];assert x['solutionTable']['rows']==expected
        return[rows[i+2][p['nextRowPosition']-1]]
    if no==12:
        # Actually fold the bottom half upwards, then left half rightwards, retaining original labels.
        folded=collections.defaultdict(list)
        for yy in range(4):
            for xx in range(4):
                y=yy if yy<2 else 3-yy;xpos=3-xx if xx<2 else xx
                folded[(xpos,y)].append((xx,yy,1+(xx+yy)%2))
        removed=folded.pop((3,0));remain=[cell for stack in folded.values()for cell in stack]
        assert {(a,b)for a,b,c in removed}=={(0,0),(3,0),(0,3),(3,3)}and len(removed)==4
        ones=sum(v==1 for a,b,v in remain);twos=sum(v==2 for a,b,v in remain);assert(ones,twos)==(6,6)
        if level=='low':return[dict(removedCells=len(removed),remainingCells=len(remain),remainingOnes=ones,remainingTwos=twos,removedSum=sum(v for a,b,v in removed))[p['mode']]]
        if level=='middle':found=[[b]for b in range(1,101)if ones*p['oneScore']+twos*b==p['remainingScore']]
        else:
            target=tuple(p['extraRemovedOriginalCell']);extra=next(c for c in remain if c[:2]==target);assert extra[2]==2
            after=[c for c in remain if c[:2]!=target];found=[]
            for a in range(1,101):
                for b in range(1,101):
                    if sum(a if c[2]==1 else b for c in remain)==p['firstScore']and sum(a if c[2]==1 else b for c in after)==p['secondScore']:found.append([a,b])
        assert len(found)==1;return found[0]
    if no==13:
        # Solve only positions actually fixed by the six printed examples; never assign the top.
        matrix=[[1,0,0,0,0],[0,1,0,0,0],[1,1,0,0,0],[1,0,1,0,0],[0,1,0,1,0],[0,1,0,0,1]];rhs=[1,2,3,5,10,11]
        weights=linear_solve(matrix,rhs);assert weights==[1,2,4,8,9]
        pos=dict(zip(['오른쪽 위','오른쪽 아래','맨 아래','왼쪽 아래','왼쪽 위'],weights));target=sum(weights[2:])
        if level=='low':return[int(pos[p['position']])]
        if level=='middle':
            if p['operation']=='allSum':return[int(sum(rhs)+target)]
            return[int(target+(-1 if p['operation']=='erase'else 1)*pos[p['position']])]
        found=[[a,b]for a in range(1,p['totalValue']//21+1)for b in range(1,p['totalValue']//10+1)if 21*a+10*b==p['totalValue']and a-b==p['seventhMinusFifth']];assert len(found)==1;return found[0]
    if no==14:
        fruits=['사과','배','귤','딸기'];choices=list(itertools.combinations(range(4),2));clues=[]
        for row in x['givenTable']['rows']:
            t=row[0]
            if m:=re.fullmatch(r'(사과|배|귤|딸기)[을를] 좋아한다고 말한 사람은(\d+)명입니다\.',t):clues.append(['count',fruits.index(m[1]),int(m[2])])
            elif m:=re.fullmatch(r'([A-E])는 (사과|배|귤|딸기)[을를] 좋아합니다\.',t):clues.append(['has',ord(m[1])-65,fruits.index(m[2])])
            elif m:=re.fullmatch(r'([A-E])가 좋아하는 과일: (.+)',t):clues.append(['pair',ord(m[1])-65,sum(1<<fruits.index(v)for v in m[2].split(', '))])
            elif m:=re.fullmatch(r'([A-E])와 ([A-E])가 공통으로 좋아하는 과일은(\d+)가지입니다\.',t):clues.append(['shared',ord(m[1])-65,ord(m[2])-65,int(m[3])])
            else:raise AssertionError('Unparsed actual clue:'+t)
        assert clues==p['clues'];worlds=list(itertools.product(choices,repeat=p['people']))
        def obey(w,c):
            if c[0]=='count':return sum(c[1]in pref for pref in w)==c[2]
            if c[0]=='has':return c[2]in w[c[1]]
            if c[0]=='pair':return set(w[c[1]])=={i for i in range(4)if c[2]>>i&1}
            return len(set(w[c[1]])&set(w[c[2]]))==c[3]
        valid=[w for w in worlds if all(obey(w,c)for c in clues)];answers={w[1]for w in valid};assert len(answers)==1
        if level=='high':
            for i in range(len(clues)):
                alternatives={w[1]for w in worlds if all(obey(w,c)for j,c in enumerate(clues)if i!=j)};assert len(alternatives)>1,'High clue must affect asked answer'
        expected=[['·'.join(fruits[i]for i in ch),str(sum(w[1]==ch for w in valid))]for ch in choices];assert x['solutionTable']['rows']==expected
        return[fruits[i]for i in next(iter(answers))]
    if no==15:
        # Construct the lexicographically largest legal digit string by modular digit DP.
        mod=p.get('divisor',1)
        @functools.lru_cache(None)
        def fill(mask,left,total,residue):
            if left==0:return ''if total==0 and residue==0 else None
            available=[d for d in range(10)if not(mask>>d&1)]
            if len(available)<left or sum(available[:left])>total or sum(available[-left:])<total:return None
            for d in reversed(available):
                if mask==0 and d==0:continue
                tail=fill(mask|1<<d,left-1,total-d,(residue*10+d)%mod)
                if tail is not None:return str(d)+tail
            return None
        for length in ([p['digits']]if'digits'in p else range(10,0,-1)):
            value=fill(0,length,p['digitSum'],0)
            if value is not None:return[int(value)]
        raise AssertionError('No digit string')
    if no==16:
        # Independent horizontal slices, not the author's column-height dictionary.
        triangle={(a,b)for b in range(4)for a in range(b+1)};strict={(a,b)for a,b in triangle if a<b}
        slices=[triangle,triangle-{(0,0),(3,3)},strict,strict-{(1,2)}]
        solid16={(a,b,z)for z,layer in enumerate(slices)for a,b in layer};assert len(solid16)==29
        def colours(cubes):return[sum((a+b+z)%2 for a,b,z in cubes),sum((a+b+z)%2==0 for a,b,z in cubes)]
        assert colours(solid16)==[14,15]
        if level=='low':return[dict(all=len(solid16),difference=colours(solid16)[1]-colours(solid16)[0],top=len(slices[-1]),base=len(slices[0]),tall=len(slices[-1]))[p['mode']]]
        if level=='middle':
            removed={c for c in solid16 if c[2]>=4-p['layers']and (p['mode']=='top'or c[:2]in slices[-1])}
            expected=[[str(z+1)]+list(map(str,colours({c for c in solid16 if c[2]==z})))for z in range(4)];assert x['solutionTable']['rows']==expected
            return colours(solid16-removed)
        filled={(a,b,z)for a in range(p['width'])for b in range(p['depth'])for z in range(p['height'])};assert solid16<=filled
        return colours(filled-solid16)
    if no==17:
        if level=='high':
            solution=linear_solve([[1,1,1],[2,4,8],[-1,0,1]],[p['totalPunches'],p['unfoldedHoles'],p['lastMinusFirst']]);assert all(v.denominator==1 and v>0 for v in solution);holes=[int(v)for v in solution]
        else:holes=p['holes']
        # Explicit original-square preimages of valid interior punch points.
        all_points=set()
        for stage,count in enumerate(holes,1):
            for j in range(count):
                point=(F(70+j,100),F(10+j,1000))if stage==1 else (F(80+j,100),F(25+j,100))if stage==2 else (F(80+j,100),F(60+j,100))
                pts={point}
                if stage==3:pts|={(a,1-b)for a,b in pts.copy()}
                if stage>=2:pts|={(1-b,1-a)for a,b in pts.copy()}
                pts|={(b,a)for a,b in pts.copy()}
                assert len(pts)==2**stage and all(0<a<1 and 0<b<1 for a,b in pts)
                assert not(all_points&pts),'Hole placements must be attainable without overlap';all_points|=pts
        if level=='high':assert len(all_points)==p['unfoldedHoles'];return holes
        return[len(all_points)]
    if no==18:
        if level=='low':
            initial=linear_solve([[1,-1],[0,2]],[p['finalA'],p['finalB']]);assert all(v>0 and v.denominator==1 for v in initial);return[int(initial[0])]
        # Compose the forward transfer matrix on basis vectors, solve M*initial=final.
        def forward(vec):
            vec=list(vec);rows=[vec[:]]
            for (donor,receiver),k in zip([(0,1),(1,2),(2,0)],p['multipliers']):
                amount=k*vec[receiver];vec[donor]-=amount;vec[receiver]+=amount;rows.append(vec[:])
            return vec,rows
        columns=[forward([int(i==j)for i in range(3)])[0]for j in range(3)];matrix=[[columns[j][i]for j in range(3)]for i in range(3)]
        initial=linear_solve(matrix,p['final']);assert all(v>0 and v.denominator==1 for v in initial);initial=list(map(int,initial));actual,rows=forward(initial)
        assert actual==p['final']and all(min(row)>=0 for row in rows)and len({sum(row)for row in rows})==1
        assert x['solutionTable']['rows']==[[label]+list(map(str,row))for label,row in zip(['처음','첫 이동 후','둘째 이동 후','마지막'],rows)]
        return initial
    if no==19:
        candidates=triangle_enumeration()
        if level=='low':
            def value(t):
                vertex=t[0]+t[3]+t[6];inside=sum(t)-vertex
                return dict(allSum=sum(t),vertexSum=vertex,innerSum=inside,difference=vertex-inside,minVertex=min(t[0],t[3],t[6]))[p['mode']]
            answers={value(t)for t in candidates};assert len(answers)==1;return[list(answers)[0]]
        if level=='middle':
            candidates=[t for t in candidates if t[p['givenVertex']]==p['givenValue']];edge={0:[4,5],3:[7,8],6:[1,2]}[p['givenVertex']];answers={sum(t[i]for i in edge)for t in candidates};assert len(answers)==1;return[list(answers)[0]]
        mode=p['mode']
        if mode=='top7':candidates=[t for t in candidates if t[0]==7]
        if mode=='top7left8':candidates=[t for t in candidates if t[0]==7 and t[3]==8]
        if mode=='top7near1':candidates=[t for t in candidates if t[0]==7 and t[1]==1]
        if mode=='dihedral':
            orbits=set()
            for t in candidates:
                mirror=(t[0],)+tuple(reversed(t[1:]));orbit={v[k:]+v[:k]for v in [t,mirror]for k in [0,3,6]};assert len(orbit)==6;orbits.add(min(orbit))
            return[len(orbits)]
        return[len(candidates)]
    if no==20:
        if level=='low':
            expected=[str(int('3'*p['digits']))+' × '+str(10**p['digits'])];assert x['promptDataLines']==expected;return[sum(map(int,str(int('3'*p['digits'])*10**p['digits'])))]
        if level=='middle':
            n=p['digits'];a,b,c,d=int('9'*n),int('2'*n),int('3'*n),int('3'*(n-1)+'4');assert x['promptDataLines']==[str(a)+' × '+str(b),'＋ '+str(c)+' × '+str(d)];return[sum(map(int,str(a*b+c*d)))]
        k,target=p['subtractPower'],p['digitSum'];assert x['promptDataLines']==[f'N × (3 × N ＋ 1) − {10**k}'];found=[]
        # Direct integer arithmetic, including all shorter lengths and borrow cases.
        for n in range(2,max(k+2,target+2)+1):
            value=int('3'*n);result=value*(3*value+1)-10**k
            if result>0 and sum(map(int,str(result)))==target:found.append([n,len(str(result))])
        assert len(found)==1;assert found[0][0]>k
        # Beyond this finite bound the unchanged3-prefix alone has sum>target.
        return found[0]
    if no==21:
        valid=[]
        for numerator in range(10,100):
            for divisor in range(1,10):
                quotient,remainder=divmod(numerator,divisor)
                digits=str(numerator)+str(divisor)+str(quotient)
                if remainder or not 1<=quotient<=9 or '0'in digits or len(set(digits))!=4:continue
                if level=='low'and divisor!=p['divisor']:continue
                if level=='middle'and str(p['excludedDigit'])in digits:continue
                if level=='high':
                    mode=p['mode']
                    if mode=='less'and not divisor<quotient:continue
                    if mode=='odd'and numerator%2==0:continue
                    if mode=='multiple3'and numerator%3:continue
                    if mode=='sum18'and sum(map(int,digits))!=18:continue
                    if mode=='largeLess'and not(numerator>=30 and divisor<quotient):continue
                valid.append([numerator,divisor,quotient])
        if level=='middle':
            expected=[[str(c),', '.join(f'{a}÷{b}＝{d}'for a,b,d in valid if b==c)or'없음']for c in range(2,10)];assert x['solutionTable']['rows']==expected
        if level=='high':
            expected=[[str(c),', '.join(f'{a}÷{b}＝{d}'for a,b,d in valid if b==c),str(sum(a for a,b,d in valid if b==c))]for c in range(2,10)if any(b==c for a,b,d in valid)];assert x['solutionTable']['rows']==expected;return[len(valid),sum(a for a,b,c in valid)]
        return[len(valid)]
    if no==22:
        def count(start,days):
            date=datetime.date(2023,1,1)+datetime.timedelta(days=start);assert datetime.date(2023,1,1).weekday()==6
            result=0
            for i in range(days):
                wd=(date+datetime.timedelta(days=i)).weekday();result+=2 if wd<5 else 1 if wd==5 else 0
            return result
        weekdays=['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
        if level=='low':return[100*count(p['start'],p['days'])]
        if level=='middle':
            candidates=[[weekdays[s]]for s in range(7)if count(s,p['days'])*100==p['total']];assert len(candidates)==1;return candidates[0]
        found=[];rows=[]
        for s in range(7):
            c1,c2=count(s,p['days1']),count(s,p['days2']);unit=F(p['total1'],c1);equal=unit*c2==p['total2']
            rows.append([weekdays[s],str(c1),str(c2),'일치'if equal else'불일치'])
            if equal and unit>0 and unit.denominator==1:found.append([weekdays[s],int(unit*2),int(unit)])
        assert len(found)==1 and x['solutionTable']['rows']==rows;return found[0]
    if no==23:
        if level=='low':
            walk=p['walk'];bike=walk*p['ratio'];dist=F(0)
            for quarter in range(4*p['hours']):
                t=F(2*quarter+1,8);active=not(F(1,2)<=t<F(1,2)+p['stop']);dist+=F(walk,4)+(F(bike,4)if active else 0)
            assert dist.denominator==1;return[int(dist)]
        stop=p.get('stop',0);solution=linear_solve([[p['hours']-stop,p['hours']],[1,-p['ratio']]],[p['distance'],0]);assert all(v>0 and v.denominator==1 for v in solution);return list(map(int,solution))
    if no==24:
        fixed={(2,0):5,(2,1):3,(1,2):9,(3,2):1,(0,3):8,(2,3):2,(4,3):11,(2,4):10,(4,4):12};unknown=[(0,2),(2,2),(4,2),(0,4)]
        groups=[[(0,y)for y in range(2,5)],[(2,y)for y in range(5)],[(4,y)for y in range(2,5)],[(a,2)for a in range(5)]]
        remaining=set(range(1,14))-set(fixed.values());found=[]
        for numbers in itertools.permutations(remaining):
            grid=dict(fixed);grid.update(zip(unknown,numbers));sums=[sum(grid[c]for c in row)for row in groups]
            if len(set(sums))==1:found.append((grid,list(numbers),sums[0]))
        assert len(found)==1;grid,numbers,common=found[0];values=dict(zip('ABCD',numbers));values['sum']=common
        if level=='low':assert values[p['known']]=={'A':6,'B':7,'C':4,'D':13,'sum':27}[p['known']];return[values[p['target']]]
        if level=='middle':return[values[k]for k in p['targets']]
        answers=[]
        for t in range(1,p['afterUnknownSum']+1):
            changed=[numbers[0]-t,numbers[1]+t,numbers[2]+t,numbers[3]+2*t]
            if sum(changed)!=p['afterUnknownSum']:continue
            changed_grid=dict(fixed);changed_grid.update(zip(unknown,changed));assert len({sum(changed_grid[c]for c in row)for row in groups})==1;answers.append(changed)
        assert len(answers)==1;return answers[0]
    if no==25:
        valid=[]
        for number in range(1000,10000):
            digits=list(map(int,str(number)));counts=collections.Counter(digits)
            if level=='low':ok=counts==collections.Counter(p['cards'])
            elif level=='middle':ok=counts[0]==1 and sum(digits)==p['digitSum'] and max(counts.values())<=3
            else:ok=0 in digits and sum(digits)==p['digitSum'] and max(counts.values())<=3
            if ok:valid.append(number)
        if level=='low':assert x['cards']==p['cards']
        if level=='middle':
            buckets=collections.Counter(tuple(sorted(int(c)for c in str(v)if c!='0'))for v in valid)
            expected=[[', '.join(map(str,t)),str(buckets[t])]for t in sorted(buckets)]
            assert x['solutionTable']['rows']==expected
        return[len(valid)]
    if no==26:
        if level=='low':
            s=str(p['number']);return[p['number']+int(s[:-1])+int(s[:-2])]
        candidates=[]
        for number in range(100 if level=='middle'else 1000,1000 if level=='middle'else 10000):
            s=str(number);total=number+int(s[:-1])+(int(s[:-2])if level=='high'else 0)
            if total==p['sum']:candidates.append(number)
        assert len(candidates)==1;return candidates
    if no==27:
        boxes=native_cuboids();mode=p.get('mode')
        if level=='low':return[sum(b['shape']==tuple(p['shape'])for b in boxes)]
        if level=='middle':
            if mode=='height1':return[sum(b['shape'][2]==1 for b in boxes)]
            if mode=='depthFull':return[sum(b['lo'][1]==0 and b['hi'][1]==3 for b in boxes)]
            if mode=='widthFull':return[sum(b['lo'][0]==0 and b['hi'][0]==5 for b in boxes)]
            if mode=='heightFull':return[sum(b['lo'][2]==0 and b['hi'][2]==4 for b in boxes)]
            if mode=='cubes':return[sum(len(set(b['shape']))==1 for b in boxes)]
        if mode=='nonCube':return[sum(len(set(b['shape']))!=1 for b in boxes)]
        if mode=='evenVolume':return[sum(len(b['cells'])%2==0 for b in boxes)]
        if mode=='touchAnyThree':return[sum(any(v==0 for v in b['lo'])for b in boxes)]
        if mode=='oneCorner':return[sum(((0,0,0)in b['cells'])!=((4,2,3)in b['cells'])for b in boxes)]
        if mode=='volumeSum':return[sum(len(b['cells'])for b in boxes)]
        raise AssertionError(mode)
    if no==28:
        if level=='low':s=p['sequence'];assert x['promptDataLines']==[s]
        elif level=='middle':s=''.join(str(n)for n in range(p['start'],p['end']+1));assert x['promptDataLines']==[f"123456789101112…{p['end']-1}{p['end']}"]
        else:s=''.join(str(n)for n in range(p['from'],p['to']+1))
        keep=len(s)-p['delete']
        @functools.lru_cache(None)
        def dp(index,left,first):
            if left==0:return ''
            if len(s)-index<left:return None
            choices=[]
            skip=dp(index+1,left,first)if index+1<=len(s)else None
            if skip is not None:choices.append(skip)
            if not(first and s[index]=='0'):
                tail=dp(index+1,left-1,False)
                if tail is not None:choices.append(s[index]+tail)
            return min(choices)if choices else None
        answer=dp(0,keep,True);assert answer and len(answer)==keep and answer[0]!='0'
        changed=answer[:-1]+str((int(answer[-1])+1)%10);assert changed!=answer
        return[answer]
    if no==29:
        if level=='low':
            assert len(native_regions29)==5
            memberships=collections.Counter(c['memberships']for c in native_regions29)
            assert memberships=={0:2,1:2,2:1}
            mode=p['mode'];return[dict(total=5,union=sum(c['memberships']>=1 for c in native_regions29),outside=memberships[0],exactlyOne=memberships[1],intersection=memberships[2])[mode]]
        if level=='middle':return[tangent_regions(p['smallCircles'])]
        candidates=[]
        for n in range(1,21):
            current=tangent_regions(n);mode=p['mode']
            if mode=='maxThenRemove'and current==p['maxRegions']and n>p['remove']:candidates.append([n,tangent_regions(n-p['remove'])])
            if mode=='addTwo'and tangent_regions(n+2)-current==p['increase']:candidates.append([n,current,tangent_regions(n+2)])
            if mode=='removeTwo'and n>2 and current-tangent_regions(n-2)==p['decrease']:candidates.append([n,current,tangent_regions(n-2)])
            if mode=='doubleSum'and current+tangent_regions(2*n)==p['sumMaxima']:candidates.append([n,current,tangent_regions(2*n)])
            if mode=='strictGap'and current-tangent_regions(n,strict=True)==p['difference']:candidates.append([n,current,tangent_regions(n,strict=True)])
        #The exact square and strictly increasing differences bound every positive
        #solution above20 away from the displayed observations; no numeric cutoff is assumed.
        assert len(candidates)==1;return candidates[0]
    if no==30:
        midnight=datetime.datetime(2026,1,1)
        if level=='low':
            home=midnight+datetime.timedelta(minutes=p['friendArrival']+p['stay']+p['travel']);return[home.hour,home.minute]
        if level=='middle':
            candidates=[]
            for t in range(p['homeDisplay']-p['setting']+1):
                if(midnight+datetime.timedelta(minutes=p['setting']+2*t+p['stay'])).hour*60+(midnight+datetime.timedelta(minutes=p['setting']+2*t+p['stay'])).minute==p['homeDisplay']:candidates.append(t)
            assert len(candidates)==1;return candidates
        candidates=[]
        for one_way in range(24*60):
            true_departure=midnight+datetime.timedelta(minutes=p['friendArrival']-one_way)
            true_return=midnight+datetime.timedelta(minutes=p['friendArrival']+p['stay']+one_way)
            displayed_return=midnight+datetime.timedelta(minutes=p['setting'])+(true_return-true_departure)
            if displayed_return==midnight+datetime.timedelta(minutes=p['homeDisplay']):candidates.append([true_return.hour,true_return.minute])
        assert len(candidates)==1;return candidates[0]
    raise AssertionError(no)

evidence=[]
for x in data['items']:
    actual=solve(x);assert actual==x['answerParts'],(x['id'],actual,x['answerParts'])
    assert x['sourcePointBand']==('2.7'if x['sourceNo']<=12 else'3.4'if x['sourceNo']<=22 else'4.2')and x['pointBand']==dict(low='2.7',middle='3.4',high='4.2')[x['practiceLevel']]
    assert x['answerContract']in ['ordered-parts','unordered-set']and (len(x['answerLabels'])==len(actual)or x['answerContract']=='unordered-set'and len(x['answerLabels'])==1)and len(x['solutionSteps'])>=3
    assert x['solution']==' '.join(x['solutionSteps'])
    assert x['verification']['sourceExamPage']==(1 if x['sourceNo']<=4 else 2 if x['sourceNo']<=10 else 3 if x['sourceNo']<=14 else 4 if x['sourceNo']<=19 else 5 if x['sourceNo']<=24 else 6 if x['sourceNo']<=29 else 7)
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in legacy[x['id']].items())
    else:assert len(x['levelReview']['axes'])==9 and not x['difficultyEvidence']['sourceReasoningPreserved']and x['difficultyEvidence']['measuredVariantRate']is None
    assert not any(k in x for k in ['hints','conditionSummary'])
    evidence.append(dict(id=x['id'],passed=True,answer=actual))
for no in range(1,31):assert collections.Counter(x['practiceLevel']for x in data['items']if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
pdf=PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf')
for name,file in [('Im51','staircase-original.png')]:
    native=next(i.image for i in pdf.pages[0].images if Path(i.name).stem==name).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied3'/file).convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
with tempfile.TemporaryDirectory(prefix='gfield-applied3-source-render-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','1','-l','1','-scale-to','1600','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    source=Image.open(output.with_suffix('.png')).convert('RGB').crop((709,451,924,614));actual=Image.open(ROOT/'bank/assets/applied3/pizza-original.png').convert('RGB');assert source.size==actual.size and source.tobytes()==actual.tobytes()
for file in ['data.js','docssam-columns.js','mock-data-hw.js','bank/data/applied1-balanced15.json','bank/data/applied2-balanced15.json','bank/data/applied3-expanded.json','bank/assets/applied3/pizza.png']:
    assert(ROOT/file).read_bytes()==subprocess.check_output(['git','show','7ae2f7f1:'+file],cwd=ROOT),file
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable','cards']},ensure_ascii=False,sort_keys=True)for x in data['items']})==450
work=ROOT/'.private-work/balanced15-20261024/round3-batch5';work.mkdir(exist_ok=True)
(work/'independent-math.json').write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=450,methods=['literal unreduced fraction sequence','even left-page finite search','rational line intersections all inside disk/no triple points','shared-face mesh boundary and paint memory','integer perimeter coordinate sets','exact rational Gaussian work-rate equations','rigid 3D rotations of six labelled normal vectors','datetime dates across all June1Saturday years2000-2039','closed-loop rational point positions and bounded integer search','direct modular enumeration with each third-condition removal','literal consecutive row lists','two actual coordinate folds and original-cell preimages','five observed circle-position equations','actual printed-clue CSP with answer uniqueness and high ablations','modular distinct digit dynamic programming','horizontal checkerboard slices','physical three-fold point reflections','forward transfer matrix Gaussian inverse','all9!triangle placements and dihedral orbit sets','direct arbitrary-length integer borrowing','exact numerator/divisor enumeration and grouped arithmetic tables','datetime two-window rate enumeration','two-speed Gaussian equations and quarter-hour simulation','native13cell row sums by coordinates','literal four-digit numeral enumeration','string truncation inverse search','900actual3Dvoxel boxes','full subsequence dynamic programming','rational tangent-circle intersection graph/Euler and native five-region raster','datetime forward and wrong-clock inverse'],items=evidence),ensure_ascii=False,indent=2)+'\n')
# Verify prior released90 item objects/storage versions byte for byte at canonical field level.
prior=json.loads(subprocess.check_output(['git','show','f5ea54a6:bank/data/applied3-balanced15.json'],cwd=ROOT))
assert data['items'][:360]==prior['items']
with tempfile.TemporaryDirectory(prefix='gfield-applied3-fold-render-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','3','-l','3','-scale-to','2000','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    expected=Image.open(output.with_suffix('.png')).convert('RGB').crop((82,1164,662,1318));actual=Image.open(ROOT/'bank/assets/applied3/fold-original.png').convert('RGB');assert expected.size==actual.size and expected.tobytes()==actual.tobytes()
native=next(i.image for i in pdf.pages[1].images if Path(i.name).stem=='Im53').convert('RGB').crop((81,13,332,199));actual=Image.open(ROOT/'bank/assets/applied3/dice-path-original.png').convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
for page_no,name,file in [(2,'Im58','circle-values-original.png'),(3,'Im68','checker-stair-original.png')]:
    native=next(i.image for i in pdf.pages[page_no].images if Path(i.name).stem==name).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied3'/file).convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
for page_no,name,file in [(3,'Im71','triangle-original.png'),(4,'Im77','equal-lines-original.png')]:
    native=next(i.image for i in pdf.pages[page_no].images if Path(i.name).stem==name).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied3'/file).convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
with tempfile.TemporaryDirectory(prefix='gfield-applied3-teacher-cards-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','5','-l','5','-scale-to','1600','-singlefile','-png',str(ROOT/'.private-work/balanced15-20261024/source/applied3-answer.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    original=Image.open(output.with_suffix('.png')).convert('RGB').crop((148,617,335,669));actual=Image.open(ROOT/'bank/assets/applied3/division-cards-teacher-original.png').convert('RGB');assert original.size==actual.size and original.tobytes()==actual.tobytes()
print('PASS450 Applied3:30complete5/5/5groups;365new+85approved;prior360 unchanged;all9!triangle placements/symmetry orbits/direct big-integer borrow/numerator division enumeration/datetime payment windows/travel equations/actual13cell coordinate rows;teacher empty-card crop exact;original grades/assets preserved')

for stem,name in [("Im83","circles-tangent-original.png"),("Im84","cuboids-grid-original.png")]:
    native=next(i.image for i in pdf.pages[5].images if Path(i.name).stem==stem).convert("RGB");actual=Image.open(ROOT/"bank/assets/applied3"/name).convert("RGB");assert native.size==actual.size and native.tobytes()==actual.tobytes()
(work/"source29-boundary-proof.json").write_text(json.dumps(dict(nativeRasterRegions=native_regions29,actualCoordinateGraphs=circle_graph_evidence,construction="rational Pythagorean centers radius1/4; inner radii3/4 tangent or2/3 strict; no triple crossing by radical center argument",upperBound="each added inner circle has at most2(k-1) pair crossings plus1 distinct boundary tangency; all crossings/tangencies attained",originalGradeMutation=False),indent=2)+"\n")
print("PASS native27/29assets exact; boundary graph including n7=50; raster5regions; legacy29lock unchanged")

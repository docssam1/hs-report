"""Independent coordinate, planar graph, voxel and exact-cover models for13-18."""
import collections
import functools
import itertools
import math
import re
import xml.etree.ElementTree as ET
from fractions import Fraction as F
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


@functools.lru_cache(None)
def hinge_positions():
    return[(s0+15*s1,15*s1,0,3*s2,7*s3)for s0,s1,s2,s3 in itertools.product([-1,1],repeat=4)]


@functools.lru_cache(None)
def bead_values():
    rows=[[F(v)for v in row]for row in [[2,2,1,35],[2,1,2,45],[1,2,2,40]]]
    for col in range(3):
        pivot=next(r for r in range(col,3)if rows[r][col]);rows[col],rows[pivot]=rows[pivot],rows[col]
        value=rows[col][col];rows[col]=[v/value for v in rows[col]]
        for r in range(3):
            if r==col:continue
            value=rows[r][col];rows[r]=[v-value*w for v,w in zip(rows[r],rows[col])]
    return tuple(row[-1]for row in rows)


def sub(a,b):return(a[0]-b[0],a[1]-b[1])
def cross(a,b):return a[0]*b[1]-a[1]*b[0]


def line_union(segments):
    lines=collections.defaultdict(list)
    for a,b in segments:
        a,b=tuple(map(F,a)),tuple(map(F,b))
        if a[0]==b[0]:key=('v',a[0]);interval=sorted([a[1],b[1]])
        else:
            slope=(b[1]-a[1])/(b[0]-a[0]);key=('s',slope,a[1]-slope*a[0]);interval=sorted([a[0],b[0]])
        lines[key].append(interval)
    out={}
    for key,intervals in lines.items():
        merged=[]
        for lo,hi in sorted(intervals):
            if merged and lo<=merged[-1][1]:merged[-1][1]=max(hi,merged[-1][1])
            else:merged.append([lo,hi])
        out[key]=tuple(map(tuple,merged))
    return out


@functools.lru_cache(None)
def unfolded_faces():
    # Four equal horizontal panels, original outer ends at folded upper edge.
    cuts=[((0,0),(2,2)),((6,0),(4,2)),((2,0),(2,1)),((2,1),(4,1)),((4,1),(4,0))]
    unfolded=[]
    for row in range(4):
        def point(p):
            x,y=p;y=2-y
            return(x,2*row+(2-y if row%2 else y))
        unfolded.extend((point(a),point(b))for a,b in cuts)
    boundary=[((0,0),(6,0)),((6,0),(6,8)),((6,8),(0,8)),((0,8),(0,0))]
    segments=[(tuple(map(F,a)),tuple(map(F,b)))for a,b in boundary+unfolded]
    def on(p,a,b):return cross(sub(p,a),sub(b,a))==0 and all(min(a[i],b[i])<=p[i]<=max(a[i],b[i])for i in [0,1])
    split=[{a,b}for a,b in segments]
    for i,(a,b)in enumerate(segments):
        for j,(c,d)in enumerate(segments[:i]):
            r,s=sub(b,a),sub(d,c);det=cross(r,s)
            if det:
                t=cross(sub(c,a),s)/det;u=cross(sub(c,a),r)/det
                if 0<=t<=1 and 0<=u<=1:
                    p=(a[0]+t*r[0],a[1]+t*r[1]);split[i].add(p);split[j].add(p)
            elif cross(sub(c,a),r)==0:
                points={p for p in [a,b,c,d]if on(p,a,b)and on(p,c,d)};split[i]|=points;split[j]|=points
    edges=set()
    for(a,b),points in zip(segments,split):
        axis=0 if a[0]!=b[0]else 1;ordered=sorted(points,key=lambda p:p[axis])
        edges|={tuple(sorted([x,y]))for x,y in zip(ordered,ordered[1:])}
    neighbors=collections.defaultdict(list)
    for a,b in edges:neighbors[a].append(b);neighbors[b].append(a)
    for p,around in neighbors.items():around.sort(key=lambda q:math.atan2(float(q[1]-p[1]),float(q[0]-p[0])))
    directed=set();faces=[]
    for a,b in [(a,b)for x,y in edges for a,b in [(x,y),(y,x)]]:
        if(a,b)in directed:continue
        cycle=[];u,v=a,b
        while(u,v)not in directed:
            directed.add((u,v));cycle.append(u);around=neighbors[v];w=around[(around.index(u)-1)%len(around)];u,v=v,w
        area=sum(cross(p,q)for p,q in zip(cycle,cycle[1:]+cycle[:1]))/2
        if area<=0:continue
        changed=True
        while changed:
            changed=False
            for i in range(len(cycle)):
                if cross(sub(cycle[i],cycle[i-1]),sub(cycle[(i+1)%len(cycle)],cycle[i]))==0:
                    cycle.pop(i);changed=True;break
        faces.append((cycle,area))
    assert len(faces)==9 and collections.Counter(len(c)for c,area in faces)[3]==6 and collections.Counter(len(c)for c,area in faces)[4]==2
    return faces,unfolded


def inside(p,cycle):
    hit=False
    for a,b in zip(cycle,cycle[1:]+cycle[:1]):
        if(a[1]>p[1])!=(b[1]>p[1]):
            x=a[0]+(p[1]-a[1])*(b[0]-a[0])/(b[1]-a[1])
            if p[0]<x:hit=not hit
    return hit


@functools.lru_cache(None)
def cube_stack():
    cells=[(0,3),(1,0),(1,1),(1,3),(2,2),(3,1)];front=[4,1,3,2];found=[]
    expected={(x,z)for x,n in enumerate(front)for z in range(n)}
    for hs in itertools.product(*(range(1,front[x]+1)for x,y in cells)):
        voxels={(x,y,z)for(x,y),h in zip(cells,hs)for z in range(h)}
        if{(x,z)for x,y,z in voxels}==expected:found.append(frozenset(voxels))
    assert len(found)==1 and len(found[0])==12
    return found[0]


def columns(voxels):return{(x,y):1+max(z for xx,yy,z in voxels if(xx,yy)==(x,y))for x,y,z0 in voxels}
def cube_side(voxels):return[1+max(z for x,y,z in voxels if y==row)for row in [3,2,1,0]]


@functools.lru_cache(None)
def square_profiles():
    cells=[(r,c)for r in range(5)for c in range(5)if(r,c)!=(0,0)];lookup={p:i for i,p in enumerate(cells)};tiles=[]
    for r,c in cells:
        for size in range(1,6):
            square={(r+i,c+j)for i in range(size)for j in range(size)}
            if square.issubset(lookup):tiles.append((sum(1<<lookup[p]for p in square),size))
    covering={i:[t for t in tiles if t[0]&(1<<i)]for i in range(24)}
    @functools.lru_cache(None)
    def visit(remaining):
        if not remaining:return frozenset([(0,0,0,0)])
        cell=(remaining&-remaining).bit_length()-1;out=set()
        for mask,size in covering[cell]:
            if remaining&mask!=mask:continue
            for counts in visit(remaining^mask):
                result=list(counts);result[size-1]+=1;out.add(tuple(result))
        return frozenset(out)
    result=visit((1<<24)-1);assert len(result)==10 and min(map(sum,result))==7
    return result


def valid_tiling(tiles):
    expected={(r,c)for r in range(5)for c in range(5)if(r,c)!=(0,0)};covered=set()
    for r,c,size in tiles:
        assert size in [1,2,3,4];part={(r+i,c+j)for i in range(size)for j in range(size)}
        assert part<=expected and not covered&part;covered|=part
    assert covered==expected
    return tuple(sum(size==n for r,c,size in tiles)for n in [1,2,3,4])


def solve_geometry(item):
    no,level,p=item['sourceNo'],item['practiceLevel'],item['verification']['parameters']
    if no==13:
        positions=hinge_positions();lengths={abs(v[a]-v[b])for v in positions for a,b in itertools.combinations(range(5),2)}
        assert len(lengths)==19
        if level=='low':
            values=lengths if p['allPairs']else{abs(v[p['a']]-v[p['b']])for v in positions}
            return[(max if p['mode']=='max'else min)(values)]
        if level=='middle':return[sum(p['minimum']<=v<=p['maximum']for v in lengths)]
        return[sum(a<b and a+b==p['total']and b-a>=p['minDifference']for a in lengths for b in lengths)]
    if no==14:
        white,black,gray=bead_values();assert(white,black,gray)==(8,3,13)
        if level=='low':return[int(dict(white=white,black=black,gray=gray,**{'gray-black':gray-black,'gray-white':gray-white})[p['query']])]
        found=[]
        for w in range(p['total']+1):
            for b in range(p['total']-w+1):
                g=p['total']-w-b
                if w*white+b*black+g*gray!=p['value']:continue
                if level=='middle'and g==p['gray']:found.append([w,b])
                if level=='high'and w-b==p['whiteExcess']:found.append([w,b,g])
        assert len(found)==1;return found[0]
    if no==15:
        faces,_=unfolded_faces();tri=sum(len(c)==3 for c,a in faces);quad=sum(len(c)==4 for c,a in faces);other=len(faces)-tri-quad
        assert p['foldProtocol']=='four-accordion-panels-outer-ends-at-top'
        if level=='low':return[dict(layers=4,leftTriangles=tri//2,triangles=tri,quadrilaterals=quad,holes=other)[p['query']]]
        if level=='middle':return[(len(faces)-tri)*p['sheets']]
        found=[[a,b]for a in range(p['pieces']+1)for b in range(p['pieces']+1)if a*len(faces)+b==p['pieces']and a*quad+b==p['quadrilaterals']]
        assert len(found)==1;return found[0]
    if no==16:
        voxels=cube_stack();hs=columns(voxels)
        if level=='low':return[dict(bottomLeft=hs[0,3],bottomSecond=hs[1,3],secondRowRight=hs[3,1],total=len(voxels),sideThird=cube_side(voxels)[2])[p['query']]]
        if level=='middle':
            cell=tuple(p['cell']);height=hs[cell]+p['delta'];assert height>0
            changed={(x,y,z)for x,y,z in voxels if(x,y)!=cell}|{(*cell,z)for z in range(height)}
            return cube_side(changed)+[len(changed)]
        ways=[]
        for start,from_height in hs.items():
            if from_height==1:continue
            for end,to_height in hs.items():
                if start==end:continue
                changed=set(voxels);changed.remove((*start,from_height-1));changed.add((*end,to_height))
                assert{(x,y)for x,y,z in changed}==set(hs)and len(changed)==12
                if cube_side(changed)==p['targetSide']:ways.append((start,end))
        return[len(ways)]
    if no==17:
        profiles=square_profiles();witness=valid_tiling(item['solutionTiling']);assert witness in profiles
        if level=='low':return[dict(cells=24,largest=max(i+1 for v in profiles for i,n in enumerate(v)if n),unitOnly=24,after4=24-16,max3=max(v[2]for v in profiles))[p['query']]]
        if level=='middle':
            choices=[v for v in profiles if(p['query']!='smallOnly'or v[2:]==(0,0))and(p['query']!='one4'or v[3]==1)and(p['query']!='exact2'or v[1]==p['exactTwos'])]
            answer=min(map(sum,choices));assert witness in choices and sum(witness)==answer;return[answer]
        costs={v:sum(a*b for a,b in zip(v,p['prices']))for v in profiles};best=min(costs.values());possible={sum(v)for v,c in costs.items()if c==best}
        assert len(possible)==1 and costs[witness]==best
        assert item['givenTable']['rows']==[['한 장 가격(원)']+list(map(str,p['prices']))]
        return[best,next(iter(possible))]
    if no==18:
        if level=='low':
            regions=[p['A']-p['AB']-p['AC']+p['triple'],p['AB']-p['triple'],p['AC']-p['triple'],p['triple']]
            assert min(regions)>=0 and sum(regions)==p['A'];return[regions[0]]
        results=set()
        for t in range(min(p['A'],p['B'],p['C'])+1):
            if level=='middle':
                ab,ac,bc=p['AB']-t,p['AC']-t,p['BC']-t
                a,b,c=p['A']-ab-ac-t,p['B']-ab-bc-t,p['C']-ac-bc-t
                regions=[a,b,c,ab,ac,bc,t]
                if min(regions)>=0 and sum(regions)==p['total']-p['none']:results.add((t,))
            else:
                for ab in range(p['exactTwo']+1):
                    for ac in range(p['exactTwo']-ab+1):
                        bc=p['exactTwo']-ab-ac;a=p['A']-ab-ac-t;b=p['B']-ab-bc-t;c=p['C']-ac-bc-t
                        regions=[a,b,c,ab,ac,bc,t]
                        if min(regions)>=0 and sum(regions)==p['total']-p['none']:results.add((t,a+b+c))
        assert len(results)==1;return list(next(iter(results)))
    raise AssertionError(no)


@functools.lru_cache(None)
def check_svg(path):
    return ET.parse(path).getroot()


def validate_solution_asset(item):
    asset=item.get('solutionAsset')
    if not asset:return
    path=ROOT/'bank'/asset['src'];svg=check_svg(str(path));tags=lambda tag:[n for n in svg.iter()if n.tag.rsplit('}',1)[-1]==tag]
    assert item['sourceNo']in [15,16,17]and svg.tag.endswith('svg')
    if item['sourceNo']==15:
        faces,source_cuts=unfolded_faces();shown=[]
        for node in tags('path'):
            if node.get('data-cut')!='true':continue
            ps=[tuple(map(F,m))for m in re.findall(r'[ML](-?[.\d]+),(-?[.\d]+)',node.attrib['d'])];shown.extend(zip(ps,ps[1:]))
        for node in tags('rect'):
            if node.get('data-cut')!='true':continue
            x,y,w,h=[F(node.attrib[a])for a in ['x','y','width','height']];ps=[(x,y),(x+w,y),(x+w,y+h),(x,y+h)];shown.extend(zip(ps,ps[1:]+ps[:1]))
        assert line_union(shown)==line_union(source_cuts)
        labels={int(n.text):(F(n.attrib['x']),F(n.attrib['y']))for n in tags('text')};assert set(labels)==set(range(1,10));matched=set()
        for label,point in labels.items():
            choices=[(i,c,a)for i,(c,a)in enumerate(faces)if inside(point,c)];assert choices
            i,c,a=min(choices,key=lambda v:v[2]);assert i not in matched;matched.add(i)
            assert len(c)==3 if label<=6 else len(c)==4 if label<=8 else len(c)>4
    elif item['sourceNo']==16:
        answer=solve_geometry(item);heights=answer[:4]if item['practiceLevel']=='middle'else item['verification']['parameters']['targetSide']if item['practiceLevel']=='high'else cube_side(cube_stack())
        actual=[]
        for node in tags('rect'):
            col,z=int(node.attrib['data-column']),int(node.attrib['data-level']);actual.append((col,z))
            assert[F(node.attrib[a])for a in ['x','y','width','height']]==[10+34*col,140-25*(z+1),34,25]
        assert set(actual)=={(col,z)for col,h in enumerate(heights)for z in range(h)}and len(actual)==sum(heights)
    else:
        actual=[]
        for node in tags('rect'):
            r,c,size=[int(node.attrib[a])for a in ['data-row','data-col','data-size']];actual.append([r,c,size])
            assert[F(node.attrib[a])for a in ['x','y','width','height']]==[10+48*c,10+48*r,48*size,48*size]
        assert actual==item['solutionTiling'];valid_tiling(actual)
        assert sorted(int(n.text)for n in tags('text'))==list(range(1,len(actual)+1))

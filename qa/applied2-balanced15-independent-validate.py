"""Independent perimeter edges, carry states, voxel projections and row/weight models."""
import collections
import functools
import hashlib
import itertools
import json
import math
import subprocess
import tempfile
from fractions import Fraction
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'bank/data/applied2-balanced15.json'
data=json.loads(FILE.read_text());legacy_bytes=(ROOT/'bank/data/applied2-expanded.json').read_bytes()
legacy={x['id']:x for x in json.loads(legacy_bytes)['items']}
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']


@functools.lru_cache(None)
def boundary_length(n):
    edges=collections.Counter()
    for i in range(n):
        for a,b in [(i,i+1),(i+1,i+2),(i,i+2)]:edges[a,b]+=1
    return sum((6 if b-a==2 else 10)for(a,b),v in edges.items()if v==1)


@functools.lru_cache(None)
def carries(k):
    tens,ones=divmod(k,10);found=[]
    for c,d in itertools.permutations(range(1,10),2):
        carry1,a=divmod(c+d+ones,10)
        if a==0 or a in [c,d]:continue
        for b in range(10):
            if b in [a,c,d]:continue
            carry2,e=divmod(2*b+tens+carry1,10)
            if e in [a,b,c,d]:continue
            carry3,hundred=divmod(a+carry2,10)
            if hundred==e and carry3==c:found.append(dict(zip('ABCDE',[a,b,c,d,e])))
    return found


@functools.lru_cache(None)
def voxel_stacks():
    footprint={(0,0),(1,0),(0,1),(1,1),(0,2),(1,2),(2,2)}
    front={(x,z)for x,height in enumerate([2,2,3])for z in range(height)}
    right={(y,z)for y,height in enumerate([3,1,2])for z in range(height)}
    found=[]
    cells=sorted(footprint)
    for heights in itertools.product([1,2,3],repeat=len(cells)):
        stack=dict(zip(cells,heights));voxels={(x,y,z)for(x,y),h in stack.items()for z in range(h)}
        if {(x,z)for x,y,z in voxels}!=front or {(2-y,z)for x,y,z in voxels}!=right:continue
        assert {(x,y)for x,y,z in voxels}==footprint
        found.append((stack,len(voxels)))
    assert len(found)==8
    return found


def shape_weights():
    # Normalize one diamond to1. Solve the two source balance equations by
    # rational row elimination, without using the author's3/4 constants.
    matrix=[[Fraction(1),Fraction(-2),Fraction(-5)],
            [Fraction(-2),Fraction(2),Fraction(2)]]
    for col in range(2):
        pivot=next(r for r in range(col,2)if matrix[r][col]);matrix[col],matrix[pivot]=matrix[pivot],matrix[col]
        unit=matrix[col][col];matrix[col]=[v/unit for v in matrix[col]]
        for r in range(2):
            if r==col:continue
            multiple=matrix[r][col];matrix[r]=[v-multiple*w for v,w in zip(matrix[r],matrix[col])]
    h,c=matrix[0][-1],matrix[1][-1];unknown=4*c-3*h
    assert h>0 and c>0 and unknown>0
    return h,c,unknown


def row_states(limit):
    white=black=0;out=[]
    for row in range(1,limit+1):
        if row%2:white+=row
        else:black+=row
        out.append((row,white,black))
    return out


def solve(x):
    no,level,p=x['sourceNo'],x['practiceLevel'],x['verification']['parameters']
    if no==1:
        if level=='low':return[boundary_length(p['triangles'])]
        if level=='middle':
            found=[n for n in range(1,p['perimeter']//6+1)if boundary_length(n)==p['perimeter']]
        else:
            found=[[n,n+p['triangleDifference']]for n in range(1,p['totalPerimeter']//6+1)
                   if boundary_length(n)+boundary_length(n+p['triangleDifference'])==p['totalPerimeter']]
        assert len(found)==1
        return found if level=='middle'else found[0]
    if no==2:
        if level=='low':found=[(t,p['total']-t)for t in range(p['total']+1)if 3*t+4*(p['total']-t)==p['matches']]
        elif level=='middle':found=[(t,s)for t in range(p['matches']//3+1)for s in range(p['matches']//4+1)if t-s==p['triangleExcess'] and 3*t+4*s==p['matches']]
        else:found=[(t,s,p['total']-t-s)for t in range(p['total']+1)for s in range(p['total']-t+1)if p['total']-t-s==p['pentagonMultiple']*t and 3*t+4*s+5*(p['total']-t-s)==p['matches']]
        assert len(found)==1
        return list(found[0])
    if no==3:
        found=[v for v in carries(p['k'])if all(v[key]==a for key,a in p.get('givens',{}).items())];assert len(found)==1
        v=found[0]
        assert x['arithmeticRows']==[' ABC','+ BD',f'+ {p["k"]:2d}','────','CEEA']
        if level=='low':return[v[a]for a in 'CDE']
        if level=='middle':return[int(''.join(str(v[a])for a in 'ABCDE'))]
        found=[(f,g)for f in range(10)for g in range(10)if f<g and f+g==p['unusedSum']and f not in v.values()and g not in v.values()];assert len(found)==1
        return list(found[0])
    if no==4:
        rows=voxel_stacks()
        if level=='high':
            counts=collections.Counter(n for _,n in rows);value=sum(a*counts[p['totalCubes']-n]for n,a in counts.items())
            if p['distinct']and p['totalCubes']%2==0:value-=counts[p['totalCubes']//2]
            return[value]
        query=p['query']
        if query=='maximum':return[max(n for _,n in rows)]
        if query=='minimum':return[min(n for _,n in rows)]
        if query=='frontRightHeight':
            values={s[2,2]for s,_ in rows};assert len(values)==1;return list(values)
        if query=='minimumTopLeftHeight':return[min(s[0,0]for s,_ in rows)]
        if query=='forcedSinglePositions':return[sum(all(s[cell]==1 for s,_ in rows)for cell in rows[0][0])]
        keep={'total11':lambda s,n:n==11,'total12':lambda s,n:n==12,'topLeft1':lambda s,n:s[0,0]==1,
              'bottomLeft1':lambda s,n:s[0,2]==1,'equalTop':lambda s,n:s[0,0]==s[1,0]}[query]
        return[sum(keep(s,n)for s,n in rows)]
    if no==5:
        h,c,unknown=shape_weights()
        if level=='low':value=h*p['hearts']+c*p['clubs'];assert value.denominator==1;return[int(value)]
        if level=='middle':value=unknown*p['knownMass']/(h if p['knownShape']=='H'else c);assert value.denominator==1;return[int(value)]
        found=[(hearts,clubs,p['total']-hearts-clubs)for hearts in range(p['total']+1)for clubs in range(p['total']-hearts+1)
               if hearts-clubs==p['heartExcess']and h*hearts+c*clubs+p['total']-hearts-clubs==unknown*p['unknownBundles']]
        assert len(found)==1
        return list(found[0])
    if no==6:
        if level=='low':found=[[w]for _,w,b in row_states(2*p['difference']+3)if b-w==p['difference']]
        elif level=='middle':found=[[b]for _,w,b in row_states(2*math.isqrt(p['white'])+3)if w==p['white']and b>w]
        else:
            rows=[(w,b)for _,w,b in row_states(2*math.isqrt(p['whiteSum'])+3)if b>w]
            found=[[b1,b2]for w1,b1 in rows for w2,b2 in rows if w1+w2==p['whiteSum']and (b2-w2)-(b1-w1)==p['excessDifference']]
        assert len(found)==1
        return found[0]
    raise AssertionError(no)


assert boundary_length(50)==320
assert solve(dict(sourceNo=2,practiceLevel='low',verification=dict(parameters=dict(total=30,matches=108))))==[12,18]
assert carries(0)==[dict(A=9,B=5,C=1,D=8,E=0)]
assert shape_weights()==(3,4,7)
assert [w for _,w,b in row_states(50)if b-w==23]==[529]
assert len(data['items'])==len({x['id']for x in data['items']})==90
assert data['availableSourceNos']==list(range(1,7))and data['pendingSourceNos']==list(range(7,31))
assert data['policy']['perLevel']==dict(low=5,middle=5,high=5)and not data['policy']['sourceGradeMutation']
evidence=[]
for x in data['items']:
    actual=solve(x);assert actual==x['answerParts'],(x['id'],actual,x['answerParts'])
    assert x['answerContract']=='ordered-parts'and len(x['answerLabels'])==len(actual)
    assert x['sourcePointBand']=='2.7'and x['pointBand']==dict(low='2.7',middle='3.4',high='4.2')[x['practiceLevel']]
    assert len(x['solutionSteps'])>=3 and x['learningPoint']and x['learningLocation']
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in legacy[x['id']].items())
    else:assert len(x['levelReview']['axes'])==9 and x['difficultyEvidence']['measuredVariantRate']is None
    evidence.append(dict(id=x['id'],passed=True,answer=actual))
for no in data['availableSourceNos']:assert collections.Counter(x['practiceLevel']for x in data['items']if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
pdf=PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf')
native={Path(i.name).stem:i.image for i in pdf.pages[0].images}
actual=Image.open(ROOT/'bank/assets/applied2/balances-original.png');assert native['Im54'].convert('RGB').tobytes()==actual.convert('RGB').tobytes()and actual.size==(264,243)
native6=next(i.image for i in pdf.pages[1].images if Path(i.name).stem=='Im57');actual=Image.open(ROOT/'bank/assets/applied2/alternating-triangle.png');assert native6.mode==actual.mode and native6.tobytes()==actual.tobytes()
with tempfile.TemporaryDirectory(prefix='gfield-source2-render-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','1','-l','1','-scale-to','1600','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    page=Image.open(output.with_suffix('.png')).convert('RGB')
    for filename,box in [('triangle-chain-original.png',(145,452,485,590)),('projections-original.png',(590,460,1010,625))]:
        image=Image.open(ROOT/'bank/assets/applied2'/filename).convert('RGB');assert page.crop(box).size==image.size and page.crop(box).tobytes()==image.tobytes()
for file in ['bank/data/applied1-balanced15.json','bank/data/applied2-expanded.json','bank/assets/applied2/triangle-chain.png','data.js','docssam-columns.js','mock-data-hw.js']:
    assert(ROOT/file).read_bytes()==subprocess.check_output(['git','show','98cb8ff:'+file],cwd=ROOT),file
out=ROOT/'.private-work/balanced15-20261024/round2-batch1/independent-math.json'
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=90,sourceAnswersDirectlyCompared=list(range(1,7)),methods=['zigzag boundary edge multiplicity','integer polygon-count enumeration','decimal per-column carry states','full voxel silhouette equality','exact rational elimination from original balances','literal alternating row accumulation'],items=evidence),ensure_ascii=False,indent=2)+'\n')
print('PASS90 Applied2 answers:6complete5/5/5 groups;original drawings/75new/15preserved;Applied1 full435 unchanged')

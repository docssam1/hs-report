"""Validate raw fractions, physical spreads, exact line intersections, mesh faces and work rates."""
import collections,functools,hashlib,itertools,json,re,subprocess,tempfile
from fractions import Fraction as F
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'bank/data/applied3-balanced15.json'
data=json.loads(FILE.read_text());legacy_bytes=(ROOT/'bank/data/applied3-expanded.json').read_bytes()
legacy={x['id']:x for x in json.loads(legacy_bytes)['items']}
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
assert data['availableSourceNos']==list(range(1,7))and data['pendingSourceNos']==list(range(7,31))
assert len(data['items'])==len({x['id']for x in data['items']})==90

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
    raise AssertionError(no)

evidence=[]
for x in data['items']:
    actual=solve(x);assert actual==x['answerParts'],(x['id'],actual,x['answerParts'])
    assert x['sourcePointBand']=='2.7'and x['pointBand']==dict(low='2.7',middle='3.4',high='4.2')[x['practiceLevel']]
    assert x['answerContract']=='ordered-parts'and len(x['answerLabels'])==len(actual)and len(x['solutionSteps'])>=3
    assert x['solution']==' '.join(x['solutionSteps'])
    assert x['verification']['sourceExamPage']==(1 if x['sourceNo']<=4 else 2)
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in legacy[x['id']].items())
    else:assert len(x['levelReview']['axes'])==9 and not x['difficultyEvidence']['sourceReasoningPreserved']and x['difficultyEvidence']['measuredVariantRate']is None
    assert not any(k in x for k in ['hints','conditionSummary'])
    evidence.append(dict(id=x['id'],passed=True,answer=actual))
for no in range(1,7):assert collections.Counter(x['practiceLevel']for x in data['items']if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
pdf=PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf')
for name,file in [('Im51','staircase-original.png')]:
    native=next(i.image for i in pdf.pages[0].images if Path(i.name).stem==name).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied3'/file).convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
with tempfile.TemporaryDirectory(prefix='gfield-applied3-source-render-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','1','-l','1','-scale-to','1600','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    source=Image.open(output.with_suffix('.png')).convert('RGB').crop((709,451,924,614));actual=Image.open(ROOT/'bank/assets/applied3/pizza-original.png').convert('RGB');assert source.size==actual.size and source.tobytes()==actual.tobytes()
for file in ['data.js','docssam-columns.js','mock-data-hw.js','bank/data/applied1-balanced15.json','bank/data/applied2-balanced15.json','bank/data/applied3-expanded.json','bank/assets/applied3/pizza.png']:
    assert(ROOT/file).read_bytes()==subprocess.check_output(['git','show','7ae2f7f1:'+file],cwd=ROOT),file
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable']},ensure_ascii=False,sort_keys=True)for x in data['items']})==90
work=ROOT/'.private-work/balanced15-20261024/round3-batch1';work.mkdir(exist_ok=True)
(work/'independent-math.json').write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=90,methods=['literal unreduced fraction sequence','even left-page finite search','rational line intersections all inside disk/no triple points','shared-face mesh boundary and paint memory','integer perimeter coordinate sets','exact rational Gaussian work-rate equations'],items=evidence),ensure_ascii=False,indent=2)+'\n')
print('PASS90 Applied3 independent answers:6complete5/5/5 groups;70new+20approved;actual PDF pizza crop/native staircase exact;approved assets and prior885 bank items preserved;no original grade mutation')

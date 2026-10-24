"""Validate raw fractions, physical spreads, exact line intersections, mesh faces and work rates."""
import collections,datetime,functools,hashlib,itertools,json,re,subprocess,tempfile
from fractions import Fraction as F
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'bank/data/applied3-balanced15.json'
data=json.loads(FILE.read_text());legacy_bytes=(ROOT/'bank/data/applied3-expanded.json').read_bytes()
legacy={x['id']:x for x in json.loads(legacy_bytes)['items']}
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
assert data['availableSourceNos']==list(range(1,13))and data['pendingSourceNos']==list(range(13,31))
assert len(data['items'])==len({x['id']for x in data['items']})==180

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
    raise AssertionError(no)

evidence=[]
for x in data['items']:
    actual=solve(x);assert actual==x['answerParts'],(x['id'],actual,x['answerParts'])
    assert x['sourcePointBand']=='2.7'and x['pointBand']==dict(low='2.7',middle='3.4',high='4.2')[x['practiceLevel']]
    assert x['answerContract']in ['ordered-parts','unordered-set']and (len(x['answerLabels'])==len(actual)or x['answerContract']=='unordered-set'and len(x['answerLabels'])==1)and len(x['solutionSteps'])>=3
    assert x['solution']==' '.join(x['solutionSteps'])
    assert x['verification']['sourceExamPage']==(1 if x['sourceNo']<=4 else 2 if x['sourceNo']<=10 else 3)
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in legacy[x['id']].items())
    else:assert len(x['levelReview']['axes'])==9 and not x['difficultyEvidence']['sourceReasoningPreserved']and x['difficultyEvidence']['measuredVariantRate']is None
    assert not any(k in x for k in ['hints','conditionSummary'])
    evidence.append(dict(id=x['id'],passed=True,answer=actual))
for no in range(1,13):assert collections.Counter(x['practiceLevel']for x in data['items']if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
pdf=PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf')
for name,file in [('Im51','staircase-original.png')]:
    native=next(i.image for i in pdf.pages[0].images if Path(i.name).stem==name).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied3'/file).convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
with tempfile.TemporaryDirectory(prefix='gfield-applied3-source-render-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','1','-l','1','-scale-to','1600','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    source=Image.open(output.with_suffix('.png')).convert('RGB').crop((709,451,924,614));actual=Image.open(ROOT/'bank/assets/applied3/pizza-original.png').convert('RGB');assert source.size==actual.size and source.tobytes()==actual.tobytes()
for file in ['data.js','docssam-columns.js','mock-data-hw.js','bank/data/applied1-balanced15.json','bank/data/applied2-balanced15.json','bank/data/applied3-expanded.json','bank/assets/applied3/pizza.png']:
    assert(ROOT/file).read_bytes()==subprocess.check_output(['git','show','7ae2f7f1:'+file],cwd=ROOT),file
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable']},ensure_ascii=False,sort_keys=True)for x in data['items']})==180
work=ROOT/'.private-work/balanced15-20261024/round3-batch2';work.mkdir(exist_ok=True)
(work/'independent-math.json').write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=180,methods=['literal unreduced fraction sequence','even left-page finite search','rational line intersections all inside disk/no triple points','shared-face mesh boundary and paint memory','integer perimeter coordinate sets','exact rational Gaussian work-rate equations','rigid 3D rotations of six labelled normal vectors','datetime dates across all June1Saturday years2000-2039','closed-loop rational point positions and bounded integer search','direct modular enumeration with each third-condition removal','literal consecutive row lists','two actual coordinate folds and original-cell preimages'],items=evidence),ensure_ascii=False,indent=2)+'\n')
# Verify prior released90 item objects/storage versions byte for byte at canonical field level.
prior=json.loads(subprocess.check_output(['git','show','9b78f99a:bank/data/applied3-balanced15.json'],cwd=ROOT))
assert data['items'][:90]==prior['items']
with tempfile.TemporaryDirectory(prefix='gfield-applied3-fold-render-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','3','-l','3','-scale-to','2000','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 3회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    expected=Image.open(output.with_suffix('.png')).convert('RGB').crop((82,1164,662,1318));actual=Image.open(ROOT/'bank/assets/applied3/fold-original.png').convert('RGB');assert expected.size==actual.size and expected.tobytes()==actual.tobytes()
native=next(i.image for i in pdf.pages[1].images if Path(i.name).stem=='Im53').convert('RGB').crop((81,13,332,199));actual=Image.open(ROOT/'bank/assets/applied3/dice-path-original.png').convert('RGB');assert native.size==actual.size and native.tobytes()==actual.tobytes()
print('PASS180 Applied3 independent answers:12complete5/5/5groups;140new+40approved;prior90 unchanged;vector dice rotations/datetime/closed-loop positions/literal residues/row enumeration/actual fold preimages;source assets exact;original grades preserved')

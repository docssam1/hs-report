"""Independent perimeter edges, carry states, voxel projections and row/weight models."""
import collections
import argparse
import functools
import hashlib
import itertools
import json
import math
import re
import subprocess
import tempfile
from fractions import Fraction
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
from applied2_geometry_independent import solve_geometry,validate_solution_asset
from applied2_finalgroups_independent import solve_finalgroups
from applied2_lastgroups_independent import solve_lastgroups, arithmetic_states, best_digits, card_count

ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'bank/data/applied2-balanced15.json'
data=json.loads(FILE.read_text());legacy_bytes=(ROOT/'bank/data/applied2-expanded.json').read_bytes()
legacy={x['id']:x for x in json.loads(legacy_bytes)['items']}
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']


@functools.lru_cache(None)
def coop_nodes():
    found=[v for v in itertools.product(range(23),repeat=4)
           if v[0]+v[1]==19 and v[0]+v[3]==19 and v[0]+v[2]==22 and v[1]+v[2]==21 and v[2]+v[3]==21]
    assert len(found)==1
    return found[0]


@functools.lru_cache(None)
def plate_nodes():
    found=[v for v in itertools.product(range(33),repeat=3)if v[0]+v[1]==24 and v[0]+v[2]==20 and v[1]+v[2]==32]
    assert len(found)==1
    return found[0]


def ranked_assignments(p,high=False,skip=None):
    rows=p['rows'];count=len(rows[0]);letters='ABCDEF'[:count];fixed=p['correctPosition']
    slots={letter:[i for i in range(count)if skip=='third' or
                   (i==fixed and letter==rows[2][fixed])or(i!=fixed and letter!=rows[2][i]and letter!=rows[2][fixed])]
           for letter in letters}
    order=sorted(letters,key=lambda a:len(slots[a]));out=[]
    def walk(depth,positions):
        if depth==count:
            ranking=tuple(next(a for a,i2 in positions.items()if i2==i)for i in range(count))
            counts=[sum(positions[a]==i for i,a in enumerate(row))for row in rows[:2]]
            if skip!='first'and counts[0]!=(1 if high else 0):return
            if skip!='second'and counts[1]!=(2 if high else 0):return
            if high and skip!='order'and positions['B']!=positions['A']+1:return
            out.append(ranking);return
        actor=order[depth]
        for i in slots[actor]:
            if i not in positions.values():walk(depth+1,dict(positions,**{actor:i}))
    walk(0,{})
    return out


@functools.lru_cache(None)
def tiles(stage):
    white=black=new=0;radius=stage-1
    for x in range(-radius,radius+1):
        for y in range(-radius,radius+1):
            if(x+y)%2:continue
            shell=max(abs(x),abs(y))
            if shell%2:black+=1
            else:white+=1
            if shell==radius:new+=1
    return white,black,new,'흰색'if radius%2==0 else'검은색'


def solve_next(x):
    no,level,p=x['sourceNo'],x['practiceLevel'],x['verification']['parameters']
    if no>=25:return solve_lastgroups(x)
    if no>=19:return solve_finalgroups(x)
    if no>=13:return solve_geometry(x)
    if no==7:
        a,b,c,d=coop_nodes()
        if level=='low':return[dict(TL=a,BL=b,BR=c,TR=d,**{'BL+TR':b+d})[p['query']]]
        if level=='middle':found=[[v]for v in range(c+p['added']+1)if b+v==c+p['added']-v]
        else:
            found=[]
            for v in range(c+p['added']+1):
                moves=[v,2*v,3*v]
                final=[a+moves[0],b+moves[1],c+p['added']-sum(moves),d+moves[2]]
                if min(final)>=0 and final[2]==final[0]+final[1]:found.append(moves)
        assert len(found)==1
        return found[0]
    if no==8:
        if level=='low':
            fractions=[Fraction(1,d)for d in p['denominators']]
            found=[[n]for n in range(1,2001)if sum(f*n for f in fractions)+p['oldYears']==n]
        elif level=='middle':
            fractions=list(map(Fraction,p['fractions']))
            found=[[(1-sum(fractions))*n]for n in range(1,2001)if(fractions[1]-fractions[0])*n==p['difference']]
        else:
            rest1=1-sum(map(Fraction,p['firstFractions']));rest2=1-sum(map(Fraction,p['secondFractions']))
            found=[[a,p['totalLifespans']-a]for a in range(1,p['totalLifespans'])if rest1*a==rest2*(p['totalLifespans']-a)]
            assert rest1+rest2>0 and found[0][0]==Fraction(p['totalLifespans'])*rest2/(rest1+rest2)
        assert len(found)==1 and all(Fraction(a).denominator==1 for a in found[0])
        return list(map(int,found[0]))
    if no==9:
        a,b,c=plate_nodes()
        if level=='low':return[dict(A=a,B=b,C=c,total=a+b+c,range=max(a,b,c)-min(a,b,c))[p['query']]]
        if level=='middle':found=[[n]for n in range(b+p['added']+1)if b+p['added']-n==2*(a+n)]
        else:
            found=[]
            for n in range(a+1):
                state=[a,b,c+p['added']];possible=True
                for start,end,quantity in [(0,1,n),(1,2,3*n),(2,0,2*n)]:
                    if state[start]<quantity:possible=False;break
                    state[start]-=quantity;state[end]+=quantity
                if possible and state[2]==2*state[0]+state[1]:found.append([n,3*n,2*n])
        assert len(found)==1
        return found[0]
    if no==10:
        if level=='low':found=[[p['students']//b,b]for b in range(3,p['students']+1,2)if p['students']%b==0]
        elif level=='middle':found=[[p['students']//b,b]for b in range(2,p['students']+1)if p['students']%b==0 and any(b-front-1==2*front for front in range(1,b))]
        else:found=[[a,p['axisSum']-a,a*(p['axisSum']-a)]for a in range(1,p['axisSum'])if p['axisSum']-a>2 and(p['axisSum']-a)%2==1 and a*(p['axisSum']-a)==(a+p['extraAcross'])*(p['axisSum']-a-2)]
        assert len(found)==1
        return found[0]
    if no==11:
        if level=='low':
            found=[v for v in itertools.permutations('ABCD')if all(v[i]!=a for i,a in enumerate(p['first']))and[v[i]==a for i,a in enumerate(p['second'])]==[i==p['correctPosition']for i in range(4)]]
            assert len(found)==1
            return[found[0][0]]
        found=ranked_assignments(p,level=='high');assert len(found)==1
        for skip in ['first','second','third']+(['order']if level=='high'else[]):
            relaxed=ranked_assignments(p,level=='high',skip)
            assert len({(v[0],v[-1])for v in relaxed})>1,(x['id'],skip,'unnecessary clue')
        return[found[0][0],found[0][-1]]
    if no==12:
        if level=='low':
            _,_,new,color=tiles(p['stage']);return[color,new]
        if level=='middle':
            found=[[n,tiles(n)[3]]for n in range(1,p['combinedNew']//4+2)if tiles(n)[2]+tiles(n+1)[2]==p['combinedNew']]
        else:
            found=[[tiles(n)[2],tiles(n+p['stageDifference'])[2]]for n in range(1,math.isqrt(p['blackSum'])+2)if tiles(n)[3]==tiles(n+p['stageDifference'])[3]=='흰색'and tiles(n)[1]+tiles(n+p['stageDifference'])[1]==p['blackSum']]
        assert len(found)==1
        return found[0]
    raise AssertionError(no)


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
    if no>=7:return solve_next(x)
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
assert len(data['items'])==len({x['id']for x in data['items']})==450
assert data['availableSourceNos']==list(range(1,31))and data['pendingSourceNos']==[]
assert data['policy']['perLevel']==dict(low=5,middle=5,high=5)and not data['policy']['sourceGradeMutation']
evidence=[]
for x in data['items']:
    actual=solve(x);assert actual==x['answerParts'],(x['id'],actual,x['answerParts'])
    assert x['answerContract']=='ordered-parts'and len(x['answerLabels'])==len(actual)
    assert x['sourcePointBand']==('2.7'if x['sourceNo']<=12 else'3.4'if x['sourceNo']<=22 else'4.2')and x['pointBand']==dict(low='2.7',middle='3.4',high='4.2')[x['practiceLevel']]
    assert len(x['solutionSteps'])>=3 and x['learningPoint']and x['learningLocation']
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in legacy[x['id']].items())
    else:assert len(x['levelReview']['axes'])==9 and x['difficultyEvidence']['measuredVariantRate']is None
    if x["sourceNo"]<19:validate_solution_asset(x)
    if 7<=x['sourceNo']<=12 and not x.get('preservedApprovedId'):
        p=x['verification']['parameters'];no=x['sourceNo'];level=x['practiceLevel'];text=x['text']
        assert not any(k in x for k in ['promptDataLines','hints','conditionSummary'])
        if no in [7,9]and level!='low':assert str(p['added'])+('마리'if no==7 else'개')in text
        if no==9 and level=='high':assert '처음 옮긴 수의3배'in text and'처음 옮긴 수의2배'in text
        if no==8:
            shown=[Fraction(int(a),int(b))for a,b in re.findall(r'<mfrac><mn>(\d+)</mn><mn>(\d+)</mn></mfrac>',text)]
            wanted=list(map(Fraction,p['fractions']if level=='middle'else p['firstFractions']+p['secondFractions']))
            assert shown==wanted
            assert str(p['difference']if level=='middle'else p['totalLifespans'])in text
        if no==10:assert str(p['students']if level=='middle'else p['axisSum'])in text
        if no==11:
            assert x['givenTable']['rows']==[[name]+row for name,row in zip(['가','나','다'],p['rows'])]
            assert x['givenTable']['headers']==['예측']+[f'{i}등'for i in range(1,len(p['rows'][0])+1)]
            assert ('다의'if level=='middle'else'다는')+str(p['correctPosition']+1)+'등'in text
        if no==12:
            assert str(p['combinedNew']if level=='middle'else p['blackSum'])in text
            if level=='high':assert '둘 다 흰 타일을 새로 붙인 직후'in text and str(p['stageDifference'])+'회'in text
    evidence.append(dict(id=x['id'],passed=True,answer=actual))
for no in data['availableSourceNos']:assert collections.Counter(x['practiceLevel']for x in data['items']if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
pdf=PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf')
native={Path(i.name).stem:i.image for i in pdf.pages[0].images}
actual=Image.open(ROOT/'bank/assets/applied2/balances-original.png');assert native['Im54'].convert('RGB').tobytes()==actual.convert('RGB').tobytes()and actual.size==(264,243)
native6=next(i.image for i in pdf.pages[1].images if Path(i.name).stem=='Im57');actual=Image.open(ROOT/'bank/assets/applied2/alternating-triangle.png');assert native6.mode==actual.mode and native6.tobytes()==actual.tobytes()
for page,name,filename in [(1,'Im58','plates-original.png'),(2,'Im62','checker-frames.png'),(2,'Im68','hinged-tool-original.png'),(2,'Im70','beads-original.png'),(2,'Im69','fold-cut-original.png'),(3,'Im77','round-cuts-original.png'),(3,'Im78','runs-original.png'),(3,'Im79','five-circles-original.png'),(3,'Im80','mobile-original.png'),(4,'Im89','cuboids-original.png')]:
    source=next(i.image for i in pdf.pages[page].images if Path(i.name).stem==name).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied2'/filename).convert('RGB');assert source.size==actual.size and source.tobytes()==actual.tobytes()
with tempfile.TemporaryDirectory(prefix='gfield-source2-render-')as temp:
    output=Path(temp)/'page';subprocess.run(['pdftoppm','-f','1','-l','1','-scale-to','1600','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    page=Image.open(output.with_suffix('.png')).convert('RGB')
    for filename,box in [('triangle-chain-original.png',(145,452,485,590)),('projections-original.png',(590,460,1010,625))]:
        image=Image.open(ROOT/'bank/assets/applied2'/filename).convert('RGB');assert page.crop(box).size==image.size and page.crop(box).tobytes()==image.tobytes()
    subprocess.run(['pdftoppm','-f','2','-l','2','-scale-to','1600','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    page=Image.open(output.with_suffix('.png')).convert('RGB');actual=Image.open(ROOT/'bank/assets/applied2/coops-original.png').convert('RGB');assert page.crop((125,752,498,1000)).size==actual.size and page.crop((125,752,498,1000)).tobytes()==actual.tobytes()
    subprocess.run(['pdftoppm','-f','3','-l','3','-scale-to','1600','-singlefile','-png',str(ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'),str(output)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    page=Image.open(output.with_suffix('.png')).convert('RGB')
    for filename,box in [('projections4-original.png',(590,800,1055,970)),('square-cover-original.png',(588,1185,890,1440))]:
        actual=Image.open(ROOT/'bank/assets/applied2'/filename).convert('RGB');assert page.crop(box).size==actual.size and page.crop(box).tobytes()==actual.tobytes()
for file in ['bank/data/applied1-balanced15.json','bank/data/applied2-expanded.json','bank/assets/applied2/triangle-chain.png','data.js','docssam-columns.js','mock-data-hw.js']:
    assert(ROOT/file).read_bytes()==subprocess.check_output(['git','show','98cb8ff:'+file],cwd=ROOT),file
previous=json.loads(subprocess.check_output(['git','show','90d0bfd7:bank/data/applied2-balanced15.json'],cwd=ROOT))['items']
assert data['items'][:360]==previous
assert len({json.dumps({k:x.get(k)for k in ['text','givenTable','arithmeticRows','promptDataLines','asset','cards','responseTable']},ensure_ascii=False,sort_keys=True)for x in data['items']})==450
assert coop_nodes()==(10,9,12,9)and plate_nodes()==(6,18,14)and tiles(55)[2:]==(216,'흰색')
parser=argparse.ArgumentParser();parser.add_argument('--work-dir',default='.private-work/balanced15-20261024/round2-batch5');args=parser.parse_args()
out=(ROOT/args.work_dir).resolve()/'independent-math.json';assert out.is_relative_to(ROOT/'.private-work')
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(dict(dataSha256=hashlib.sha256(FILE.read_bytes()).hexdigest(),count=450,sourceAnswersDirectlyCompared=list(range(1,31)),methods=['zigzag boundary edge multiplicity','integer polygon-count enumeration','decimal per-column carry states','full voxel silhouette equality','exact rational elimination from original balances','literal alternating row accumulation','four-node and triple graph integer enumeration','exact Fraction lifespan enumeration','literal sequential transfers with per-step feasibility','rectangular divisor and population equality search','actor-to-position backtracking and every clue removal','literal checkerboard shell/color accumulation','all hinge-node coordinates','rational color-value elimination','exact unfolded planar faces and shape classes','voxel move enumeration','24cell exact-cover profile DP','seven feasible membership-region enumeration','literal10bit binary strings and unordered pairs','nine-region digit permutation','twelve mass equations over exact fractions','three piecewise fold reflections and complete/boundary circles','school multiplication digit carry accumulation','displayed Korean clue parsing and independent numeric-node CSP with every-clue removal','forward bag operations','three integer ages and two timepoints','displayed decimal masks with per-column multiplication','six cuboid boundaries and inclusion exclusion','take-or-skip subsequence DP plus exhaustive short strings','card cardinality and sum dynamic programming'],items=evidence),ensure_ascii=False,indent=2)+'\n')
print('PASS450 Applied2 answers:30complete5/5/5 groups;380new/70preserved;prior360 and Applied1 full435 unchanged;native5x3x3 cuboids/partial products/subsequences/subset DP verified')

"""Add fifteen per original19..21; prior270 and legacy approvals are immutable."""
import collections
import copy
import hashlib
import itertools
import json
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[2]
FILE=ROOT/'bank/data/applied1-balanced15.json'
data=json.loads(FILE.read_text());assert data['availableSourceNos']==list(range(1,19))
previous=copy.deepcopy(data['items']);items=data['items'];version='20261024-applied1-balanced15-r7'
legacy_bytes=(ROOT/'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
legacy=json.loads(legacy_bytes)['items']
assert not any(x['sourceNo']in [19,21]for x in legacy)
for old in [x for x in legacy if x['sourceNo']==20][:5]:
    x=copy.deepcopy(old);assert x['pointBand']=='3.4'
    x.update(practiceLevel='middle',sourcePointBand='3.4',preservedApprovedId=x['id'],
             practiceRole='원문 수준 연습',practiceStorageVersion=version,
             levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True))
    items.append(x)


def axes(no,level):
    reason,conditions,cases={
        (19,'low'):('접은 뒤 한 대면 관계 또는 특정 무늬의 이웃 관계 확인','원본 여섯 면·마주 봄/이웃함·무늬 중복','원문 다섯 입체 보기의 방향 판단을 한 관계로 줄인 기초'),
        (19,'middle'):('접은 정육면체의 윗면과 앞면 허용 무늬를 결합해 배치 수 계산','탁자·윗면·앞면·서로 다른 원래 면·엑스면 두 개','윗면의 실제 면마다 가능한 네 이웃 앞면을 나누어 셈'),
        (19,'high'):('윗면·앞면에서 오른쪽 면까지 결정해 세 방향 허용 무늬 동시 적용','세 방향의 허용 무늬·서로 다른 원래 면·반사 금지','대면만으로 판단하지 않고 접힘의 좌우 순서를 유지하여 마지막 조건으로 거름'),
        (20,'low'):('합집합을 직접 알고 두 집합의 겹침 계산','빵 전체·밥 전체·둘 중 하나 이상·둘 다','전체 분할/안 먹음 비의 역산을 제외'),
        (20,'high'):('전체 분할 비와 두 전체 집합의 차·한 종류만 먹은 수의 배수로 교집합 역산','다른 음식만·아무것도 안 먹음 비·전체 섭취 수 차·배타 집합의 배수','전체 집합 차를 배타 집합 차로 옮겨 두 부분을 구한 뒤 겹침 계산'),
        (21,'low'):('높이 한 칸인 고정 너비 직사각형의 가로 위치 세기','원본 십자 격자·너비·높이 한 칸·선 위의 변','여러 높이 선택을 제외하고 긴 행과 짧은 행을 구분'),
        (21,'middle'):('고정 너비의 모든 높이를 세로 띠/가로 띠에서 중복 없이 세기','너비 고정·높이 자유·원본 외곽/내부선','가운데에 들어가는 경우와 가로 띠 밖으로 뻗는 경우를 분리'),
        (21,'high'):('너비/높이 비교·넓이 하한·둘레 상한을 결합해 크기와 위치를 모두 셈','가로>세로·넓이 이상·둘레 이하·원본 선으로 만들어지는 직사각형','조건에 맞는 모든 크기마다 가능한 위치를 합산;각 부가 조건을 빼면 후보가 늘어남'),
    }[(no,level)]
    return dict(prerequisite='전개도 접기·합집합 겹침·직사각형 세기의 원문 학습 범위 유지',
                reasoning=reason,conditionTracking=conditions,caseSplitting=cases,
                computation='수의 크기 대신 미지 정보·결합 조건·분기 수와 방향 판단으로 구분',
                representation='전개도/십자 격자의 실제 원본 그림을 사용;풀이용 좌표/완성 입체/보조선 없음',
                reading='서로 다른 놓는 방법·어느 전체/부분 집합인지·치수의 단위를 지문 안에서 확정',
                visualCues='원본 무늬/선/점/색/두 엑스면을 보존;그림이 수행할 사고를 대신 완성하지 않음',
                shortcuts='19상 대면 조건만으로 세면 오답;20전체 차와 배타 집합의 차 연결 필요;21상 모든 추가 조건의 실제 영향 확인')


meta={19:dict(area='도형',subarea='전개도와 정육면체',detailType='전개도를 접은 정육면체의 면과 방향',learningLocation='활용 1회 · 원문 19번 · 전개도와 정육면체'),
      21:dict(area='도형',subarea='도형의 개수',detailType='십자 격자에서 직사각형 세기',learningLocation='활용 1회 · 원문 21번 · 십자 격자의 직사각형')}
meta[20]={k:copy.deepcopy(next(x for x in legacy if x['sourceNo']==20)[k])for k in ['area','subarea','detailType','learningLocation']}


def add(no,level,p,text,answer,steps,label,focus,method,**extra):
    n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    x=dict(**meta[no],id=f'applied1-q{no:02d}-{level}-v{n}',genId=f'applied1-q{no:02d}',sourceSet='applied',sourceRound=1,sourceNo=no,variantNo=n,
           reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand='3.4',
           pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='기초 보완'if level=='low'else'단계형 확장',
           practiceStorageVersion=version,text=text,answer=f'{answer}'+('명'if no==20 else'가지'if no==19 and level!='low'else'개'),
           answerParts=[answer],answerLabels=[label],answerContract='ordered-parts',acceptedAnswers=[str(answer)],
           solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,
           difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
           levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',measured=False,axes=axes(no,level)),
           verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied1-balanced15-independent-validate.py',sourceExamPage=4,sourceAnswerPage=no,studentDifficultyMeasured=False))
    x.update(extra);assert len(steps)>=3;items.append(x)


# Extract the whole original net region at native pixel resolution. Only unrelated
# surrounding page text/options are outside this region; no line/mark is altered.
pdf=PdfReader(ROOT/'materials/초등과정 대비 실전 모의고사 활용 1회.pdf')
native={Path(i.name).stem:i.image for i in pdf.pages[3].images}
net_box=(748,20,965,300)
native['Im196'].crop(net_box).save(ROOT/'bank/assets/applied1/cube-net-original.png')
native['Im192'].save(ROOT/'bank/assets/applied1/cross-grid-original.png')
net_asset=dict(src='assets/applied1/cube-net-original.png',description='원본 전개도. 위쪽 엑스면의 왼쪽에 십자면, 아래로 선세개면·선한개면·점면,선한개면 오른쪽에 다른 엑스면.')
grid_asset=dict(src='assets/applied1/cross-grid-original.png',description='원본 십자 격자. 세로 띠5열7행, 가로 띠10열2행; 모든 원본 외곽선과 내부선을 보존.')

# Outward normals read from the folded net; image-down coordinates have u×v=-n.
normals={'upperX':(0,0,-1),'cross':(-1,0,0),'triple':(0,1,0),'single':(0,0,1),'dot':(0,-1,0),'rightX':(1,0,0)}
patterns={'upperX':'X','rightX':'X','cross':'C','triple':'H','single':'S','dot':'D'}
names={'upperX':'전개도 맨 위의 엑스면','rightX':'전개도 오른쪽의 엑스면','cross':'십자면','triple':'선 세 개 면','single':'선 한 개 면','dot':'점면'}
descriptions={'X':'엑스 무늬인 면','C':'십자 무늬인 면','H':'평행한 파란 선이 세 개인 면','S':'파란 선이 한 개인 면','D':'점이 있는 면'}


def cross(a,b):return(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])


placements=[(t,f,next(k for k,v in normals.items()if v==cross(normals[t],normals[f])))
            for t,f in itertools.permutations(normals,2)if sum(a*b for a,b in zip(normals[t],normals[f]))==0]
assert len(placements)==24
opposite_step='전개도를 접으면 점면과 선 세 개 면, 십자면과 전개도 오른쪽의 엑스면, 선 한 개 면과 전개도 맨 위의 엑스면이 서로 마주봅니다.'
low=[('oppositeLineCount','dot',None,3,'점이 있는 면을 밑면으로 놓으면 윗면에 그려진 파란 직선은 몇 개입니까?','점면의 대면은 선 세 개 면이므로 윗면에 그려진 파란 직선은3개입니다.'),
     ('oppositeLineCount','cross',None,2,'십자 무늬인 면을 밑면으로 놓으면 윗면에 그려진 파란 직선은 몇 개입니까?','십자면의 대면은 오른쪽 엑스면입니다. 엑스는 두 직선으로 이루어져 있으므로2개입니다.'),
     ('adjacentPatternCount','dot','X',2,'점이 있는 면과 이웃한 면 중 엑스 무늬가 있는 면은 몇 개입니까?','점면에 마주보는 면은 선 세 개 면입니다. 두 엑스면은 모두 점면과 모서리를 공유하므로2개입니다.'),
     ('adjacentPatternCount','cross','X',1,'십자 무늬인 면과 이웃한 면 중 엑스 무늬가 있는 면은 몇 개입니까?','오른쪽 엑스면은 십자면의 대면이므로 이웃하지 않습니다. 맨 위 엑스면만 이웃하므로1개입니다.'),
     ('sharedEdges','upperX','rightX',1,'엑스 무늬가 있는 두 면이 함께 만나는 모서리는 몇 개입니까?','두 엑스면은 서로 마주보지 않고 이웃합니다. 이웃한 두 면이 함께 만나는 모서리는1개입니다.')]
for query,face,other,result,question,last in low:
    add(19,'low',dict(query=query,face=face,other=other),'그림의 전개도로 정육면체를 만듭니다. '+question,result,
        [opposite_step,'전개도에서 멀리 떨어져 보이더라도 접은 뒤 서로 마주보는지, 한 모서리를 함께 쓰는지로 판단합니다.',last],
        '개수','전개도에서 대면을 먼저 찾고 한 면의 이웃 관계 확인','folded opposite/adjacent face relations',asset=net_asset)

middles=[(['D','C'],['X','S']),(['X'],['D','H']),(['H','S'],['C','X']),(['D','C'],['S','H']),(['D','X'],['C','S'])]
highs=[(['D','C'],['D','X'],['D','X']),(['D','X'],['D','C'],['C','X']),(['C','X'],['X','H'],['D','X']),(['D','C'],['D','X'],['X','S']),(['D','X'],['D','C'],['D','X'])]


def allowed_text(values):return ' 또는 '.join(descriptions[v]for v in values)


for level,fixtures in [('middle',middles),('high',highs)]:
    for fixture in fixtures:
        chosen=[row for row in placements if all(patterns[f]in allowed for f,allowed in zip(row,fixture))]
        # Every imposed axis condition genuinely removes orientations.
        assert all(sum(all(patterns[f]in allowed for i,(f,allowed)in enumerate(zip(row,fixture))if i!=omit)for row in placements)>len(chosen)for omit in range(len(fixture)))
        text='그림의 전개도로 정육면체를 만들어 탁자에 놓습니다. 윗면은 '+allowed_text(fixture[0])+', 앞면은 '+allowed_text(fixture[1])
        if level=='high':text+=', 오른쪽 면은 '+allowed_text(fixture[2])
        text+='이어야 합니다. 각 면은 탁자와 평행 또는 수직입니다. 윗면·앞면에 오는 원래 면으로 구별하면 놓는 방법은 몇 가지입니까?'
        first_two=[row for row in placements if patterns[row[0]]in fixture[0]and patterns[row[1]]in fixture[1]]
        if level=='middle':
            groups=[]
            for t in normals:
                rows=[row for row in first_two if row[0]==t]
                if rows:groups.append(names[t]+'가 위일 때 앞면은 '+', '.join(names[r[1]]for r in rows)+f'의 {len(rows)}가지')
            steps=[opposite_step,'윗면을 하나 정하면 앞면은 그 면과 이웃한 네 면 중 하나입니다. 윗면과 앞면을 정하면 정육면체의 놓는 방향이 하나로 정해집니다.',
                   '조건에 맞는 앞면을 윗면별로 확인하면 '+' / '.join(groups)+'.',f'각 경우의 윗면 또는 앞면이 다르므로 중복이 없습니다. 이를 합하면 {len(chosen)}가지입니다.']
        else:
            cases=[f'위 {names[t]}·앞 {names[f]} → 오른쪽 {names[r]}'+(' (조건에 맞음)'if(t,f,r)in chosen else' (제외)')for t,f,r in first_two]
            steps=[opposite_step,'서로 마주보는 면을 제외해 윗면과 앞면 후보를 고른 뒤, 실제 전개도를 접은 좌우 순서대로 오른쪽 면을 정합니다. 입체 전체는 돌릴 수 있지만 거울에 비친 것처럼 면의 좌우 순서를 바꾸면 안 됩니다.',
                   '가능한 윗면·앞면마다 오른쪽 면을 확인하면 '+' / '.join(cases)+'.',
                   f'세 방향 조건을 모두 만족하는 경우만 세면 {len(chosen)}가지입니다. 윗면·앞면이 다르면 별개이고, 두 면을 정하면 오른쪽 면도 정해지므로 더 늘어나지 않습니다.']
        add(19,level,dict(allowedTop=fixture[0],allowedFront=fixture[1],**(dict(allowedRight=fixture[2])if level=='high'else{})),text,len(chosen),steps,
            '놓는 방법 수','접은 정육면체의 대면과 회전 방향을 유지하면서 허용 무늬 조건을 결합',
            'ordered adjacent top/front faces; right face from fixed handedness',asset=net_asset)


for bread,rice,union in [(120,240,330),(135,265,350),(160,290,390),(175,315,420),(190,340,450)]:
    both=bread+rice-union
    add(20,'low',dict(bread=bread,rice=rice,union=union),
        f'아침에 빵을 먹은 어린이는 {bread}명, 밥을 먹은 어린이는 {rice}명입니다. 둘 중 적어도 하나를 먹은 어린이는 {union}명일 때, 밥과 빵을 모두 먹은 어린이는 몇 명입니까?',
        both,[f'빵을 먹은 {bread}명과 밥을 먹은 {rice}명을 더하면 {bread+rice}명입니다.',
              '둘 다 먹은 어린이는 두 목록에 들어 있으므로 위 합에서 두 번 셌습니다. 실제 둘 중 하나 이상 먹은 수와의 차가 중복된 수입니다.',
              f'따라서 둘 다 먹은 어린이는 {bread}＋{rice}−{union}＝{both}명입니다. 빵만 {bread-both}명, 밥만 {rice-both}명과 합하면 {union}명으로 맞습니다.'],
        '어린이 수(명)','두 집합의 합에서 중복으로 센 부분 찾기','direct inclusion/exclusion with known union')

def fraction(n,d):return f'<math><mfrac><mn>{n}</mn><mn>{d}</mn></mfrac></math>'


for union,den,bread_only,k,other in [(480,4,90,2,12),(550,5,100,3,16),(600,6,80,4,20),(630,7,120,3,24),(720,8,180,2,28)]:
    none=union//den;assert none*den==union
    rice_only=k*bread_only;difference=rice_only-bread_only;both=union-rice_only-bread_only;total=union+none+other
    add(20,'high',dict(total=total,noneDenominator=den,other=other,riceBreadDifference=difference,exclusiveMultiple=k),
        f'어린이 {total}명의 아침 식사를 조사했습니다. 다른 음식만 먹은 어린이는 {other}명이고, 아무것도 먹지 않은 어린이는 밥이나 빵을 먹은 어린이 수의 {fraction(1,den)}입니다. 밥을 먹은 어린이는 빵을 먹은 어린이보다 {difference}명 많고, 밥만 먹은 어린이는 빵만 먹은 어린이의 {k}배입니다. 밥과 빵을 모두 먹은 어린이는 몇 명입니까?',
        both,[f'다른 음식만 먹은 {other}명을 빼면 {total-other}명입니다. 밥이나 빵을 먹은 수를 {den}묶음으로 보면 아무것도 안 먹은 수는1묶음이므로, 한 묶음은 ({total}−{other})÷{den+1}＝{none}명이고 합집합은 {none}×{den}＝{union}명입니다.',
         f'두 전체 집합에서 공통인 둘 다 먹은 수를 빼도 차는 같습니다. 따라서 밥만 먹은 수와 빵만 먹은 수의 차도 {difference}명입니다.',
         f'밥만 먹은 수가 빵만 먹은 수의{k}배이므로 빵만 먹은 수는 {difference}÷({k}−1)＝{bread_only}명, 밥만 먹은 수는 {bread_only}×{k}＝{rice_only}명입니다.',
         f'둘 다 먹은 수는 {union}−{bread_only}−{rice_only}＝{both}명입니다. 실제 밥 전체 {rice_only+both}명과 빵 전체 {bread_only+both}명의 차도 {difference}명이며, 모든 구역의 합은 {total}명입니다.'],
        '어린이 수(명)','전체 집합의 차가 한 종류만 먹은 집합의 차와 같음을 이용해 겹침 역산',
        'partition into union/none/other then exclusive ratio and difference')


def count_size(w,h):
    central=max(6-w,0)
    return central*(8-h)+(max(11-w,0)-central)*max(3-h,0)


assert sum(count_size(w,h)for w in range(1,11)for h in range(1,8))==540
for w in [1,2,3,4,5]:
    low=count_size(w,1)
    add(21,'low',dict(width=w,height=1),
        f'그림에 그려진 선을 변으로 하는 직사각형 중 가로가 작은 칸 {w}개, 세로가 작은 칸 1개인 것은 모두 몇 개입니까?',
        low,[f'가로로10칸 이어진 행은2개, 가로로5칸 이어진 행은5개입니다. 높이가 한 칸이므로 행마다 가로 위치를 셉니다.',
             f'긴 행에서는 {10-w+1}곳, 짧은 행에서는 {5-w+1}곳에서 시작할 수 있습니다.',
             f'따라서 {10-w+1}×2＋{5-w+1}×5＝{low}개입니다. 다른 행이나 다른 시작 칸은 서로 다른 직사각형입니다.'],
        '직사각형 수','높이 한 칸에서 긴 행과 짧은 행의 시작 위치를 구분','fixed one-row height and horizontal start positions',asset=grid_asset)
    middle=sum(count_size(w,h)for h in range(1,8));central=6-w
    add(21,'middle',dict(width=w),
        f'그림에 그려진 선을 변으로 하는 직사각형 중 가로가 작은 칸 {w}개인 것은 모두 몇 개입니까?',
        middle,[f'가운데 세로 띠 안에 들어가는 가로 위치는5−{w}＋1＝{central}곳입니다. 세로 띠에는 가로 경계선8개가 있으므로 그중2개를 고르는 방법은7＋6＋…＋1＝28가지입니다.',
                f'따라서 가운데 세로 띠 안의 직사각형은 {central}×28＝{central*28}개입니다.',
                f'전체10칸 너비에서 가로 시작 위치는 {11-w}곳이고 가운데 세로 띠 안의 {central}곳을 빼면5곳이 남습니다. 이 경우는 높이2칸인 가로 띠 안에 있어야 하며, 가로 경계선3개 중2개를 고르는3가지가 있습니다.',
                f'추가로5×3＝15개이므로 모두 {central*28}＋15＝{middle}개입니다. 두 경우는 가운데 세로 띠 안에 들어가는지로 나누었으므로 중복이 없습니다.'],
        '직사각형 수','너비를 고정하고 세로 띠 안/밖을 구분하여 모든 높이를 중복 없이 세기',
        'vertical-strip rectangles plus horizontal-strip spillover',asset=grid_asset)

for minimum_area,maximum_perimeter in [(6,14),(8,16),(10,18),(12,20),(15,22)]:
    sizes=[(w,h,count_size(w,h))for w in range(1,11)for h in range(1,8)
           if w>h and w*h>=minimum_area and 2*(w+h)<=maximum_perimeter and count_size(w,h)>0]
    answer=sum(n for _,_,n in sizes)
    predicates=[lambda w,h:w>h,lambda w,h:w*h>=minimum_area,lambda w,h:2*(w+h)<=maximum_perimeter]
    assert all(sum(count_size(w,h)for w in range(1,11)for h in range(1,8)if all(f(w,h)for i,f in enumerate(predicates)if i!=omit))>answer for omit in range(3))
    groups=[]
    for h in sorted({h for _,h,_ in sizes}):
        rows=[(w,n)for w,hh,n in sizes if h==hh]
        groups.append(f'세로{h}칸: '+', '.join(f'가로{w}칸 {n}개'for w,n in rows)+f' → 합{sum(n for _,n in rows)}개')
    add(21,'high',dict(minimumArea=minimum_area,maximumPerimeter=maximum_perimeter),
        f'작은 정사각형 한 칸의 한 변을 1로 봅니다. 그림에 그려진 선을 변으로 하는 직사각형 중 가로가 세로보다 길고, 넓이가 {minimum_area} 이상이며 둘레가 {maximum_perimeter} 이하인 것은 모두 몇 개입니까?',
        answer,['가로를w칸, 세로를h칸으로 세어 w>h, w×h가 넓이 하한 이상, 2×(w＋h)가 둘레 상한 이하인 크기를 먼저 고릅니다.',
                '각 크기의 위치는 가운데 세로 띠 안에 완전히 들어가는 경우와 밖으로 뻗는 경우로 나눕니다. 안쪽 가로 시작 위치는6−w곳, 세로 시작 위치는8−h곳입니다. 가운데 세로 띠 밖으로 뻗으면 높이는2칸 이하만 가능합니다. 전체10칸 너비에서 가능한 가로 시작 위치 수에서 안쪽 가로 시작 위치 수를 뺀 값에, 가로 띠 안의 세로 시작 위치 수를 곱합니다. 불가능한 시작 위치는0곳으로 셉니다.',
                '세 조건을 만족하는 크기별 위치 수는 다음과 같습니다. '+' / '.join(groups)+'.',
                f'크기가 다르거나 시작 위치가 다르면 별개이므로 위 개수를 합하면 {answer}개입니다. 크기별로 세 조건을 모두 확인했고, 가로 띠/세로 띠가 겹치는 경우를 두 번 세지 않았습니다.'],
        '직사각형 수','너비/높이·넓이·둘레 조건으로 크기를 고른 뒤 십자 격자의 실제 위치 수 합산',
        'size inequalities and disjoint strip position formula',asset=grid_asset)


assert len(items)==len({x['id']for x in items})==315
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},ensure_ascii=False,sort_keys=True)for x in items})==315
for n in range(1,22):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==n)==dict(low=5,middle=5,high=5)
for old in previous:assert next(x for x in items if x['id']==old['id'])==old
data.update(version=version,availableSourceNos=list(range(1,22)),pendingSourceNos=list(range(22,31)),preservedLegacyCount=80,newAuthoredCount=235)
data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added45 (40new+5preserved middle);315total;prior270unchanged.')

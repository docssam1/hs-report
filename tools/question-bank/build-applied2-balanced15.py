"""Finite levelled Applied2 pool; keep all prior banks and approved source fields."""
import collections
import copy
import hashlib
import itertools
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied2-balanced15.json'
assert not FILE.exists(),'One-time authoring; never reset a reviewed bank'
legacy_bytes=(ROOT/'bank/data/applied2-expanded.json').read_bytes();legacy=json.loads(legacy_bytes)['items']
version='20261024-applied2-balanced15-r1';items=[]
for no in [1,2,6]:
    for old in [x for x in legacy if x['sourceNo']==no][:5]:
        x=copy.deepcopy(old);assert x['pointBand']=='2.7'
        x.update(practiceLevel='low',sourcePointBand='2.7',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)

meta={n:{k:copy.deepcopy(next(x for x in legacy if x['sourceNo']==n)[k])for k in ['area','subarea','learningLocation']}for n in [1,2,6]}
meta.update({3:dict(area='수와 식',subarea='문자와 덧셈',learningLocation='활용 2회 · 원문 3번 · 문자 세로셈'),
             4:dict(area='도형',subarea='입체와 투영도',learningLocation='활용 2회 · 원문 4번 · 세 방향에서 본 쌓기나무'),
             5:dict(area='수와 식',subarea='무게와 관계식',learningLocation='활용 2회 · 원문 5번 · 저울의 같은 무게')})
assets={1:dict(kind='raster',src='assets/applied2/triangle-chain-original.png',description='원본 이등변삼각형 띠.6cm밑변과10cm등변,계속표시를그대로보존.'),
        4:dict(kind='raster',src='assets/applied2/projections-original.png',description='원본 위·앞·오른쪽 옆 그림.윗그림7칸과세방향격자/표시를그대로보존.'),
        5:dict(kind='raster',src='assets/applied2/balances-original.png',description='원본 세 저울.하트·마름모·클로버·물음표와모든기호개수를그대로보존.'),
        6:copy.deepcopy(next(x for x in legacy if x['sourceNo']==6)['asset'])}


def axes(no,level):
    reason,tracking,branches={
        (1,'middle'):('둘레에서고정양끝을빼고삼각형수를역산','6cm밑변/10cm등변고정·한띠의둘레·삼각형개수미지','순방향원문을한번의역산으로전환'),
        (1,'high'):('두띠의둘레합과삼각형개수차를연결','서로떨어진두띠·둘레합·긴/짧은띠의개수차','각띠양끝을따로빼고개수합차로두수를결정'),
        (2,'middle'):('도형개수차와성냥전체에서두개수역산','공유성냥없음·삼각형이더많음·전체성냥·두개수','원문개수합을개수차조건으로바꾸어한쌍7개를계산'),
        (2,'high'):('세종류도형의합/성냥합/개수배수동시역산','삼각/사각/오각·총개수·총성냥·오각형배수','모두사각형일때와의차에서삼각형과오각형의상쇄추적'),
        (3,'low'):('같은자리정렬의덧셈에서알려진두문자를이용','ABC+BD+상수=CEEA·A/B주어짐·문자끼리서로다름·ACD0금지','미지문자5개를3개로줄인보완;상수는필수세로셈행'),
        (3,'middle'):('세항의받아올림과반복문자조건으로다섯문자결정','같은3자리/2자리/4자리정렬·서로다른문자·실제추가상수','고정상수행으로문자배치가실제로달라짐;이름만바꾼복제아님'),
        (3,'high'):('세로셈을푼뒤미사용두숫자의합/대소조건결합','A~G모두다름·기존세로셈5문자·F<G·F+G','합에맞는쌍을모두나열하고이미쓴숫자쌍제외'),
        (4,'low'):('투영도의고정높이와가능한최소최대확인','윗그림7자리·앞높이2/2/3·오른쪽옆높이3/1/2','8개배치전체세기전한가지높이/범위에집중'),
        (4,'middle'):('원본투영도를만족하는쌓기중추가조건에맞는수세기','각줄/열최댓값·빈칸·쌓은총수또는특정위치높이','같은원본8배치를빠짐없이분류하되총수/위치조건실제로적용'),
        (4,'high'):('두쌓기를순서있게고르고총블록수조건결합','각각같은세방향그림·첫째/둘째구별·같은모양허용여부·개수합','11/12/13개배치빈도를곱하고동일배치제외조건은별도로셈'),
        (5,'low'):('위두저울에서한모양을마름모단위로바꾸기','원본하트/마름모/클로버개수·모든저울수평·같은모양같은무게','세번째물음표의역산은제외한보완;원본전체그림은보존'),
        (5,'middle'):('물음표마름모개수를찾고한개무게로전체무게계산','세원본저울·알려진하트/클로버1개무게·물음표전체g','관계식의비를실제무게와연결하는추가역산'),
        (5,'high'):('저울의물음표묶음무게를단위로세종류개수역산','세저울·전체모양수·하트/클로버개수차·물음표묶음배수','세종류정수개수를두개수관계와총무게로동시에결정'),
        (6,'middle'):('흰돌개수에서반복횟수를찾고검은돌계산','첫줄흰색·행길이1씩증가·검은돌이더많음·흰돌개수','홀수마지막줄의다른검은돌개수를검은돌이더많음조건으로제외'),
        (6,'high'):('두배치의색차와흰돌합을함께역산','두배치모두검은돌이더많음·색차끼리의차·흰돌합·응답순서','두제곱합의증가를이용해차의쌍을유일하게결정'),
    }[(no,level)]
    return dict(prerequisite='원문의둘레·도형변수·자리받아올림·투영도·저울등가·홀수합범위에기초',reasoning=reason,conditionTracking=tracking,caseSplitting=branches,
                computation='수크기만바꾸지않고미지정보/관계결합/경우분류를구분',representation='1/4/5/6원본그림의수치/선/기호/방향보존;3은필수세로셈데이터에추가상수행을실제로표시',
                reading='공유하지않음·순서구별·각각조건·처음/끝자리와문자범위를지문안에서확정',visualCues='조건요약/풀이순서/보조선/완성높이표/채운물음표/완성배열그림없음',
                shortcuts='1두띠끝변별도계산필수;3추가문자조건실제후보제거;4총수분류와순서조건필수;5주어진질량만복사해답얻지못함;6홀짝마지막줄배제필수')


def add(no,level,p,text,answer,steps,labels,detail,point,method,**extra):
    n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    text=re.sub(r',(?=\S)',', ',text);steps=[re.sub(r',(?=\S)',', ',s)for s in steps]
    x=dict(**meta[no],id=f'applied2-q{no:02d}-{level}-v{n}',genId=f'applied2-q{no:02d}',sourceSet='applied',sourceRound=2,sourceNo=no,variantNo=n,
           reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand='2.7',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],
           practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],
           detailType=detail,solutionSteps=steps,solution=' '.join(steps),learningPoint=point,
           difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
           levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',measured=False,axes=axes(no,level)),
           verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied2-balanced15-independent-validate.py',sourceExamPage=1 if no<=5 else 2,sourceAnswerPage=1 if no<=4 else 2,studentDifficultyMeasured=False))
    if no in assets:x['asset']=copy.deepcopy(assets[no])
    x.update(extra);assert len(steps)>=3;items.append(x)


for n in [55,58,61,64,67]:
    perimeter=6*n+20
    add(1,'middle',dict(perimeter=perimeter,base=6,equalSide=10),f'그림과 같은 이등변삼각형을 이어 붙여 한 띠를 만들었습니다. 띠의 둘레가 {perimeter}cm일 때 사용한 삼각형은 몇 개입니까?',
        [n],['각 삼각형의6cm인 밑변은 모두 바깥에 남고,10cm인 등변은 띠 양끝의 두 변만 바깥에 남습니다.',f'둘레에서 양끝을 빼면 {perimeter}−20＝{perimeter-20}cm로,6cm인 변들의 길이 합입니다.',f'따라서 삼각형은 ({perimeter}−20)÷6＝{n}개입니다. 6×{n}＋20＝{perimeter}cm로 확인합니다.'],
        ['삼각형 개수'],'삼각형 띠의 둘레에서 개수 역산','둘레의 고정 양끝과 삼각형마다 늘어나는 변을 구분','invert known fixed-end perimeter')
for n,k in [(35,9),(38,11),(41,13),(44,15),(47,17)]:
    other=n+k;total=6*(n+other)+40
    add(1,'high',dict(totalPerimeter=total,triangleDifference=k,base=6,equalSide=10),f'그림과 같은 삼각형으로 서로 떨어진 두 띠를 만들었습니다. 긴 띠에는 짧은 띠보다 삼각형이 {k}개 더 들어가고,두 띠의 둘레 합은 {total}cm입니다. 짧은 띠와 긴 띠에 들어간 삼각형의 개수를 차례로 구하시오.',
        [n,other],['한 띠의 둘레는 삼각형 개수에6을 곱하고 양끝의20cm를 더한 값입니다. 두 띠는 떨어져 있으므로 양끝을 모두 따로 셉니다.',f'둘레 합에서 두 띠의 양끝40cm를 빼고6으로 나누면 삼각형 개수의 합은 ({total}−40)÷6＝{n+other}개입니다.',f'합이{n+other}개,차가{k}개이므로 짧은 띠는({n+other}−{k})÷2＝{n}개,긴 띠는{n}＋{k}＝{other}개입니다.',f'둘레 합도 (6×{n}＋20)＋(6×{other}＋20)＝{total}cm로 맞습니다.'],
        ['짧은 띠 삼각형','긴 띠 삼각형'],'두 삼각형 띠의 둘레 합과 개수 차','두 띠의 양끝을 각각 제외하고 개수의 합과 차 연결','two perimeter sum and triangle-count difference')


for squares,gap in [(15,4),(17,6),(19,8),(21,10),(23,12)]:
    triangles=squares+gap;matches=3*triangles+4*squares
    add(2,'middle',dict(matches=matches,triangleExcess=gap),f'성냥개비로 서로 떨어진 삼각형과 사각형을 만들었습니다. 삼각형이 사각형보다 {gap}개 많고,사용한 성냥개비는 모두 {matches}개입니다. 삼각형과 사각형은 각각 몇 개입니까?',
        [triangles,squares],[f'더 많은 삼각형{gap}개에 쓰인 성냥개비는3×{gap}＝{3*gap}개입니다.',f'이를 빼면 {matches}−{3*gap}＝{matches-3*gap}개이고,남은 삼각형과 사각형의 개수는 같습니다. 한 쌍에는3＋4＝7개가 필요합니다.',f'사각형은{matches-3*gap}÷7＝{squares}개,삼각형은{squares}＋{gap}＝{triangles}개입니다. 3×{triangles}＋4×{squares}＝{matches}개로 확인합니다.'],
        ['삼각형 개수','사각형 개수'],'성냥 전체와 도형 개수 차로 역산','남는 삼각형을 먼저 빼고 같은 개수의 두 도형 묶음 찾기','remove excess triangles then solve seven-match pairs')
for triangles,squares,multiple in [(7,12,2),(8,13,3),(9,14,4),(10,15,2),(11,16,3)]:
    pentagons=triangles*multiple;total=triangles+squares+pentagons;matches=3*triangles+4*squares+5*pentagons
    add(2,'high',dict(total=total,matches=matches,pentagonMultiple=multiple),f'성냥개비를 공유하지 않는 삼각형·사각형·오각형을 모두 {total}개 만들었고,성냥개비는 {matches}개 썼습니다. 오각형의 개수는 삼각형 개수의 {multiple}배입니다. 삼각형·사각형·오각형의 개수를 차례로 구하시오.',
        [triangles,squares,pentagons],[f'모두 사각형이라면 성냥개비는4×{total}＝{4*total}개입니다. 실제 성냥개비와의 차는{matches}−{4*total}＝{matches-4*total}개입니다.',f'사각형을 삼각형으로 바꾸면1개 줄고,오각형으로 바꾸면1개 늘어납니다. 오각형이 삼각형의{multiple}배이므로 이 차는 삼각형 개수의{multiple-1}배입니다.',f'삼각형은{matches-4*total}÷{multiple-1}＝{triangles}개,오각형은{triangles}×{multiple}＝{pentagons}개,사각형은{total}−{triangles}−{pentagons}＝{squares}개입니다.',f'개수 합은{total},성냥 합은3×{triangles}＋4×{squares}＋5×{pentagons}＝{matches}개입니다.'],
        ['삼각형 개수','사각형 개수','오각형 개수'],'세 종류 도형의 개수와 성냥 합 역산','모두 사각형인 기준에서 늘고 줄어드는 성냥 수 연결','affine deviation from all squares plus a count multiple')


def alphametic(k,givens=None):
    out=[]
    for a,b,c,d,e in itertools.permutations(range(10),5):
        values=dict(zip('ABCDE',(a,b,c,d,e)))
        if 0 in [a,c,d]or givens and any(values[key]!=v for key,v in givens.items()):continue
        if 100*a+20*b+c+d+k==1000*c+110*e+a:out.append(values)
    return out


def alphabet_steps(k,values):
    a,b,c,d,e=[values[x]for x in 'ABCDE'];cases=[]
    for candidate_a in [8,9]:
        pairs=[(candidate_b,999-k-99*candidate_a-20*candidate_b)for candidate_b in range(10)]
        pairs=[(bb,dd)for bb,dd in pairs if 1<=dd<=9 and len({candidate_a,bb,1,dd,0})==5]
        cases.append(f'A＝{candidate_a}이면20B＋D＝{999-k-99*candidate_a},가능한(B,D)는'+(', '.join(f'({bb},{dd})'for bb,dd in pairs)if pairs else'없음'))
    return ['세 자리 수와 두 자리 수에 주어진 상수를 더한 값은1200보다 작습니다. 네 자리 결과의 첫 숫자는1이므로C＝1입니다. 백의 자리E는0또는1인데C와 달라야 하므로E＝0입니다.',
            '각 자리 값을 식으로 나타내면99A＋20B＋D＝'+str(999-k)+'입니다. A가7이하면 합이1000에 미치지 못하므로A는8또는9입니다.',
            ' / '.join(cases)+'. 따라서 '+', '.join(f'{letter}＝{values[letter]}'for letter in 'ABCDE')+'입니다.',
            f'실제 덧셈도 {100*a+10*b+c}＋{10*b+d}＋{k}＝{1000*c+110*e+a}이므로 같은 문자/서로 다른 문자/첫자리 조건이 모두 맞습니다.']


for k in [20,21,22,23,25]:
    givens={'A':8,'B':9};found=alphametic(k,givens);assert len(found)==1;v=found[0]
    add(3,'low',dict(k=k,givens=givens),f'다음 세로셈에서 같은 문자는 같은 수,서로 다른 문자는 서로 다른 한 자리 수입니다. A＝8,B＝9이고 A,C,D는0이 아닙니다. C,D,E의 값을 차례로 구하시오.',
        [v[x]for x in 'CDE'],[alphabet_steps(k,v)[0],f'A＝8,B＝9를 넣으면 890＋C＋90＋D＋{k}＝1000＋8입니다. C＝1을 넣으면 D＝{v["D"]}입니다.',f'따라서C＝1,D＝{v["D"]},E＝0입니다. 실제로891＋{90+v["D"]}＋{k}＝1008이며 문자끼리도 모두 다릅니다.'],
        ['C','D','E'],'알려진 두 문자를 이용한 세로셈','알려진 자리부터 넣고 받아올림과 반복 문자를 확인','fixed A/B and complete five-digit assignment enumeration',arithmeticRows=[' ABC','+ BD',f'+ {k:2d}','────','CEEA'])
for k in [1,26,40,58,80]:
    found=alphametic(k);assert len(found)==1;v=found[0];answer=int(''.join(str(v[x])for x in 'ABCDE'))
    add(3,'middle',dict(k=k), '다음 세로셈에서 같은 문자는 같은 수,서로 다른 문자는 서로 다른 한 자리 수입니다. A,C,D는0이 아닐 때 다섯 자리 수 ABCDE를 구하시오.',
        [answer],alphabet_steps(k,v)+[f'문자 순서대로 쓰면 ABCDE＝{answer}입니다.'],['ABCDE'],'추가 상수가 있는 문자 세로셈','자리값과 받아올림 조건으로 서로 다른 문자 값 결정','all distinct five-letter assignments with literal extra addend',arithmeticRows=[' ABC','+ BD',f'+ {k:2d}','────','CEEA'])
for k,total in [(2,12),(4,5),(5,6),(6,7),(24,13)]:
    found=alphametic(k);assert len(found)==1;v=found[0];used=set(v.values());pairs=[(f,g)for f in range(10)for g in range(f+1,10)if f+g==total];valid=[(f,g)for f,g in pairs if f not in used and g not in used];assert len(valid)==1;f,g=valid[0]
    add(3,'high',dict(k=k,unusedSum=total),f'다음 세로셈과 F＋G＝{total},F＜G를 모두 만족합니다. A부터G까지 서로 다른 문자는 서로 다른 한 자리 수이고,A,C,D는0이 아닙니다. F,G의 값을 차례로 구하시오.',
        [f,g],alphabet_steps(k,v)+[f'F＋G＝{total},F＜G인 모든 쌍은 '+', '.join(f'({a},{b})'for a,b in pairs)+f'입니다. 이미쓴숫자 '+', '.join(map(str,sorted(used)))+f'를 제외하면({f},{g})만 남습니다.',f'따라서F＝{f},G＝{g}이며 두 수는 기존다섯문자와도 다르고 합/대소조건을 모두 만족합니다.'],
        ['F','G'],'세로셈과 미사용 두 숫자의 합','세로셈의 숫자와 겹치지 않는 합의 경우 나누기','five-letter solution plus all unused ordered ascending digit pairs',arithmeticRows=[' ABC','+ BD',f'+ {k:2d}','────','CEEA'])


stacks=[s for s in itertools.product([1,2],repeat=4)if max(s[:2])==2 and max(s[0],s[2])==2 and max(s[1],s[3])==2]
assert len(stacks)==8
cube_count=lambda s:5+sum(s)
histogram=collections.Counter(map(cube_count,stacks));assert histogram=={11:3,12:4,13:1}
stack_intro='그림의 위·앞·오른쪽 옆 모습을 모두 만족하도록 쌓기나무를 바닥부터 빈틈없이 쌓습니다. '
low_stack=[('maximum',13,'쌓기나무를 가장 많이 사용하면 모두 몇 개입니까?',
            ['오른쪽 끝의 한 자리는3개 높이입니다. 앞 그림에서 나머지 두 열의 높이는2를 넘을 수 없습니다.',
             '오른쪽 옆 그림에서 가운데 줄의 두 자리는1개씩입니다. 맨윗줄 두 자리와 맨아랫줄의 왼쪽 두 자리를 모두2개 높이로 해도 세 방향 그림과 맞습니다.',
             '따라서 최대 개수는2＋2＋1＋1＋2＋2＋3＝13개입니다. 어느 자리도 이보다 높이면 원본 투영도와 달라집니다.']),
           ('minimum',11,'쌓기나무를 가장 적게 사용하면 모두 몇 개입니까?',
            ['위에서 본 그림의7칸에는 모두 적어도1개씩 있어야 합니다. 맨아랫줄 오른쪽 끝 자리는 앞 그림의3개 높이를 이루어야 하므로2개를 더 쌓아야 합니다.',
             '앞 그림에서 왼쪽 두 열은 각각2개 높이여야 합니다. 각 열의 적어도 한 자리에1개씩을 더 놓아야 하므로 최소2개가 더 필요합니다.',
             '최소 개수는7＋2＋2＝11개입니다. 맨윗줄 높이를(1,2),맨아랫줄의 왼쪽 두 자리를(2,1)로 두면 실제로11개로 모든 그림을 만족합니다.']),
           ('frontRightHeight',3,'윗그림의 맨아랫줄 오른쪽 끝 칸에는 쌓기나무가 몇 개 쌓여 있습니까?',
            ['윗그림의 오른쪽 열에는 맨아랫줄의 한 자리만 있습니다.',
             '앞에서 보았을 때 그 열의 높이는3입니다. 같은 열에 다른 자리가 없으므로 이 한 자리에서3개 높이를 만들어야 합니다.',
             '따라서 맨아랫줄 오른쪽 끝 칸의 높이는 항상3개입니다.']),
           ('minimumTopLeftHeight',1,'윗그림의 맨윗줄 왼쪽 칸에는 쌓기나무를 가장 적게 몇 개 쌓을 수 있습니까?',
            ['윗그림에 칸이 있으므로 이 자리에는 적어도1개가 있어야 합니다.',
             '그 자리를1개로 두고 맨윗줄 오른쪽을2개,맨아랫줄 왼쪽을2개로 두면 두 열의 앞 높이를 모두2개로 만들 수 있습니다.',
             '나머지 조건도 만족시킬 수 있으므로 이 자리의 최소 높이는1개입니다.']),
           ('forcedSinglePositions',2,'어느 방법으로 쌓아도 높이가 반드시1개인 자리는 모두 몇 곳입니까?',
            ['오른쪽 옆 그림의 가운데 높이는1입니다. 윗그림의 가운데 줄에는 두 칸이 있으므로 두 자리 모두 반드시1개씩입니다.',
             '맨윗줄 두 자리와 맨아랫줄 왼쪽 두 자리는 각각1개인 경우와2개인 경우를 만들 수 있습니다. 맨아랫줄 오른쪽 끝 자리는3개입니다.',
             '따라서 높이가 항상1개로 고정되는 자리는 가운데 줄의 두 곳뿐입니다.'])]
for query,answer,question,steps in low_stack:
    add(4,'low',dict(query=query),stack_intro+question,[answer],steps,['개수'],'투영도의 고정 높이와 가능한 범위','세 방향의 높이 조건과 실제 빈칸을 함께 읽기','bounds and forced heights from fixed original projections')


middle_stack=[('total11',lambda s:cube_count(s)==11,'쌓기나무를 모두11개 사용하는 방법은 몇 가지입니까?'),
              ('total12',lambda s:cube_count(s)==12,'쌓기나무를 모두12개 사용하는 방법은 몇 가지입니까?'),
              ('topLeft1',lambda s:s[0]==1,'윗그림의 맨윗줄 왼쪽 칸에1개만 쌓는 방법은 몇 가지입니까?'),
              ('bottomLeft1',lambda s:s[2]==1,'윗그림의 맨아랫줄 왼쪽 칸에1개만 쌓는 방법은 몇 가지입니까?'),
              ('equalTop',lambda s:s[0]==s[1],'윗그림의 맨윗줄 두 칸의 높이가 같은 방법은 몇 가지입니까?')]
for query,keep,question in middle_stack:
    chosen=[s for s in stacks if keep(s)];assert 0<len(chosen)<8
    add(4,'middle',dict(query=query),stack_intro+question,[len(chosen)],
        ['가운데 줄의 두 자리는1개씩,맨아랫줄 오른쪽 끝은3개로 고정됩니다. 나머지 네 자리는1개 또는2개입니다.',
         '맨윗줄 두 자리의 높이는(1,2),(2,1),(2,2)중 하나입니다. 앞 그림의 왼쪽 두 열 높이를2로 맞추면 전체 쌓기는 각각2가지,2가지,4가지로 모두8가지입니다.',
         '맨윗줄 왼쪽/오른쪽,맨아랫줄 왼쪽/가운데 높이 순서로 적으면 추가 조건에 맞는 쌓기는 '+ ' / '.join(str(s)for s in chosen)+f'입니다. 따라서 {len(chosen)}가지입니다.'],
        ['방법 수'],'투영도와 추가 조건에 맞는 쌓기 세기','원본 투영도의 모든 배치를 빠짐없이 분류하고 조건으로 거르기','four remaining binary heights with fixed row/column maxima')
for total,distinct in [(22,False),(23,False),(24,False),(25,False),(24,True)]:
    chosen=[(a,b)for a in stacks for b in stacks if cube_count(a)+cube_count(b)==total and (not distinct or a!=b)]
    groups=[(a,b,histogram[a]*histogram[b])for a in sorted(histogram)for b in sorted(histogram)if a+b==total]
    text='그림의 세 방향 모습을 모두 만족하도록 바닥부터 빈틈없이 쌓은 모양을 첫째와 둘째로 하나씩 만듭니다. 두 쌓기에 사용한 쌓기나무의 합은'+str(total)+'개입니다. '+('두 쌓기의 모양은 서로 달라야 합니다. 'if distinct else'두 쌓기의 모양이 같아도 됩니다. ')+'첫째와 둘째를 구별할 때 고르는 방법은 몇 가지입니까?'
    steps=['맨아랫줄 오른쪽은3개, 가운데 줄 두 자리는1개씩입니다. 맨윗줄 두 자리와 맨아랫줄 왼쪽 두 자리의 높이는1또는2이고, 맨윗줄 및 앞 그림의 왼쪽 두 열에는 각각 높이2가 있어야 합니다.', '이 네 자리의 높이를 맨윗줄 왼쪽/오른쪽, 맨아랫줄 왼쪽/가운데 순서로 적으면 '+ ' / '.join(str(s)for s in stacks)+'입니다. 각 쌓기의 개수는 네 높이의 합에 고정된5개를 더합니다. 따라서11개인 쌓기는3가지,12개는4가지,13개는1가지입니다.',
           f'두 쌓기의 개수 합이{total}이 되는(첫째,둘째)의 개수별 경우는 '+ ' / '.join(f'({a},{b}):{histogram[a]}×{histogram[b]}＝{count}'for a,b,count in groups)+f'이며 합은{sum(c for _,_,c in groups)}가지입니다.']
    if distinct:steps.append('이 중 같은12개짜리 모양을 두 번 고르는4가지는 제외해야 합니다. 11개짜리와13개짜리는 총개수부터 달라 같은 모양일 수 없습니다.')
    steps.append(f'첫째와 둘째가 바뀌면 별개로 세므로 위 순서 있는 경우가 모두입니다. 조건을 만족하는 방법은{len(chosen)}가지입니다.')
    add(4,'high',dict(totalCubes=total,distinct=distinct),text,[len(chosen)],steps,['방법 수'],'두 쌓기의 순서와 전체 개수 조건','투영도의 배치별 개수를 분류하여 두 선택의 곱으로 연결','ordered pairs of eight original stacks with exact cube-sum and distinctness')


balance_relation='첫째 저울의 하트1개와 마름모5개, 둘째 저울의 하트2개와 마름모2개는 모두 클로버2개와 같습니다. 양쪽에서 하트1개와 마름모2개씩을 빼면 하트1개가 마름모3개와 같습니다. 둘째 저울에 이를 넣으면 클로버2개는 마름모8개이므로 클로버1개는 마름모4개와 같습니다.'
unknown_relation='세번째 저울의 오른쪽 클로버4개는 마름모16개,왼쪽 하트3개는 마름모9개와 같으므로 물음표에는16−9＝7개의 마름모가 들어갑니다.'
for hearts,clubs in [(2,0),(3,0),(0,1),(0,2),(1,1)]:
    terms=[]
    if hearts:terms.append(f'하트{hearts}개')
    if clubs:terms.append(f'클로버{clubs}개')
    answer=3*hearts+4*clubs
    question=('와 '.join(terms)+'를 합친 무게는 'if len(terms)>1 else terms[0]+'의 무게는 ')+'마름모 몇 개의 무게와 같습니까?'
    add(5,'low',dict(hearts=hearts,clubs=clubs),'그림의 모든 저울은 수평을 이루고,같은 모양은 같은 무게입니다. '+question,
        [answer],[balance_relation,f'하트{hearts}개는 마름모{3*hearts}개,클로버{clubs}개는 마름모{4*clubs}개와 같은 무게입니다.',f'따라서 필요한 마름모는{3*hearts}＋{4*clubs}＝{answer}개입니다. 이 계산은 위의 두 저울의 관계를 그대로 사용했습니다.'],
        ['마름모 개수'],'저울에서 모양의 같은 무게 바꾸기','두 저울의 같은 무게를 연결하여 한 모양을 기준으로 바꾸기','shape weights in diamond units')
for shape,mass in [('C',28),('H',18),('C',36),('H',33),('C',52)]:
    coefficient=4 if shape=='C'else 3;unit=mass//coefficient;assert coefficient*unit==mass;name='클로버'if shape=='C'else'하트'
    add(5,'middle',dict(knownShape=shape,knownMass=mass),f'그림의 모든 저울은 수평이고,같은 모양은 같은 무게입니다. {name}1개의 무게가{mass}g일 때,세번째 저울의 물음표에 넣을 마름모 전체의 무게는 몇 g입니까? 물음표에는 마름모만 넣습니다.',
        [7*unit],[balance_relation,unknown_relation,f'{name}1개는 마름모{coefficient}개와 같으므로 마름모1개의 무게는{mass}÷{coefficient}＝{unit}g입니다.',f'물음표의 마름모7개를 모두 합친 무게는{unit}×7＝{7*unit}g입니다.'],
        ['물음표 부분 무게(g)'],'저울의 관계와 한 개 무게로 전체 무게 구하기','물음표의 개수와 실제 단위 무게를 각각 구해 연결하기','seven unknown diamonds times inferred individual mass')
for clubs,gap,bundles in [(4,2,6),(5,3,7),(6,4,8),(7,2,9),(8,3,10)]:
    hearts=clubs+gap;diamonds=7*bundles-3*hearts-4*clubs;assert diamonds>0;total=hearts+clubs+diamonds
    raw=[(h,c,total-h-c)for h in range(total+1)for c in range(total-h+1)if 3*h+4*c+total-h-c==7*bundles]
    assert len(raw)>1 and [r for r in raw if r[0]-r[1]==gap]==[(hearts,clubs,diamonds)]
    add(5,'high',dict(total=total,heartExcess=gap,unknownBundles=bundles),f'모든 저울은 수평이며 같은 모양은 같은 무게입니다. 셋째 저울의 물음표를 채울 마름모 전체가 한 묶음입니다. 하트·클로버·마름모{total}개의 무게는 묶음{bundles}개의 무게와 같고,하트는 클로버보다{gap}개 많습니다. 하트·클로버·마름모의 개수를 차례로 구하시오.',
        [hearts,clubs,diamonds],[balance_relation,unknown_relation,f'묶음{bundles}개는 마름모{7*bundles}개와 같습니다. 고른{total}개가 모두 마름모라면{total}개 무게이므로 실제로 더 무거운 양은{7*bundles-total}개 무게입니다.',
                               f'마름모를 하트로 바꾸면2개 무게,클로버로 바꾸면3개 무게가 늘어납니다. 하트가{gap}개 더 많으므로 그{gap}개의 증가분{2*gap}을 빼면,남은 하트/클로버 한 쌍마다5개 무게가 늘어납니다.',
                               f'클로버는({7*bundles-total}−{2*gap})÷5＝{clubs}개,하트는{clubs}＋{gap}＝{hearts}개,마름모는{total}−{hearts}−{clubs}＝{diamonds}개입니다. 실제 무게도3×{hearts}＋4×{clubs}＋{diamonds}＝{7*bundles}개 무게로 맞습니다.'],
        ['하트 개수','클로버 개수','마름모 개수'],'저울의 묶음 무게와 세 종류 개수 역산','마름모 기준 무게 차와 모양 개수의 차를 함께 이용','three integer counts with original shape ratios, total, gap and bundle weight')


for pairs in [24,25,26,27,28]:
    white=pairs*pairs;black=pairs*(pairs+1)
    add(6,'middle',dict(white=white),'그림처럼 흰색1개인 첫 줄에서 시작하여 줄마다1개씩 늘리고,흰색과 검은색 줄을 번갈아 놓았습니다. 검은 바둑돌이 흰 바둑돌보다 많고,흰 바둑돌이'+str(white)+'개일 때 검은 바둑돌은 몇 개입니까?',
        [black],['홀수 번째 줄에서 끝나면 흰색이 더 많습니다. 검은색이 더 많으므로 짝수 번째 줄에서 끝납니다.',f'짝수 줄까지 놓은 두 줄 묶음이 몇 개인지 찾습니다. 흰색의 합은1＋3＋5＋…이고,{pairs}개 홀수의 합은{pairs}×{pairs}＝{white}이므로 두 줄 묶음은{pairs}개입니다.',f'각 묶음에서 검은색이 흰색보다1개 많으므로 검은색은{white}＋{pairs}＝{black}개입니다. 짝수 합2＋4＋…＋{2*pairs}＝{pairs}×{pairs+1}과도 같습니다.'],
        ['검은 바둑돌 개수'],'흰 바둑돌 개수에서 검은 바둑돌 역산','끝나는 줄의 홀짝을 판단하고 홀수 합을 거꾸로 이용하기','invert odd-number sum under black-excess condition')
for first,gap in [(12,3),(14,4),(16,5),(18,6),(20,7)]:
    second=first+gap;white_sum=first*first+second*second
    candidates=[a for a in range(1,white_sum+1)if a*a+(a+gap)**2==white_sum];assert candidates==[first]
    below=(first-1)**2+(second-1)**2;above=(first+1)**2+(second+1)**2
    add(6,'high',dict(whiteSum=white_sum,excessDifference=gap),'그림의 규칙으로 첫째와 둘째 배치를 만들었고,두 배치 모두 검은 바둑돌이 흰 바둑돌보다 많습니다. 둘째 배치의 검은색과 흰색 개수 차는 첫째보다'+str(gap)+'개 크고,두 배치의 흰 바둑돌 합은'+str(white_sum)+'개입니다. 각 배치의 검은 바둑돌 개수를 첫째,둘째 순서로 구하시오.',
        [first*(first+1),second*(second+1)],['검은색이 더 많은 배치는 짝수 줄에서 끝납니다. 두 줄씩 묶으면 검은색이 흰색보다 묶음 수만큼 많고,흰색의 합은 묶음 수를 두 번 곱한 수입니다.',f'첫째의 묶음 수보다 둘째의 묶음 수가{gap}개 큽니다. 첫째가{first}묶음이면 둘째는{second}묶음이고,흰색 합은{first}×{first}＋{second}×{second}＝{white_sum}개입니다.',
                                                        f'첫째 묶음 수가 하나 작으면 흰색 합은{below}개,하나 크면{above}개입니다. 묶음 수가 커질수록 두 제곱의 합도 커지므로{first}/{second}묶음인 경우만 조건에 맞습니다.',
                                                        f'검은색은 첫째{first}×{first+1}＝{first*(first+1)}개,둘째{second}×{second+1}＝{second*(second+1)}개입니다. 두 색의 차도 각각{first}개와{second}개로{gap}개 차이가 납니다.'],
        ['첫째 검은 돌','둘째 검은 돌'],'두 삼각 배열의 색 개수 차와 흰색 합','색 차를 두 줄 묶음 수로 바꾸어 두 배치의 조건을 결합','strictly increasing two-square sum with difference of pair counts')


assert len(items)==len({x['id']for x in items})==90
assert len({json.dumps({k:x.get(k)for k in ['text','arithmeticRows','asset']},ensure_ascii=False,sort_keys=True)for x in items})==90
for no in range(1,7):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for x in items:
    if x.get('preservedApprovedId'):
        old=next(y for y in legacy if y['id']==x['id']);assert all(x[k]==v for k,v in old.items())
data=dict(version=version,sourceSet='applied',sourceRound=2,policy=dict(targetVariantsPerSource=15,perLevel=dict(low=5,middle=5,high=5),runtimeGeneration=False,sourceGradeMutation=False,difficulty='new practice point bands; original source points unchanged',studentDifficultyMeasured=False),
          availableSourceNos=list(range(1,7)),pendingSourceNos=list(range(7,31)),legacyBankSha256=hashlib.sha256(legacy_bytes).hexdigest(),items=items,preservedLegacyCount=15,newAuthoredCount=75)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored Applied2 six5/5/5 groups:90items=75new+15preserved;all prior banks untouched')

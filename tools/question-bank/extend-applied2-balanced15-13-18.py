"""Finite levelled extension; preserve all released180 items and approved mid5."""
import collections
import copy
import hashlib
import itertools
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied2-balanced15.json'
before=FILE.read_bytes();assert before==subprocess.check_output(['git','show','146549ba:bank/data/applied2-balanced15.json'],cwd=ROOT)
data=json.loads(before);items=data['items'];assert len(items)==180 and all(x['reviewStatus']=='verified'for x in items)
legacy_bytes=(ROOT/'bank/data/applied2-expanded.json').read_bytes();legacy=json.loads(legacy_bytes)['items']
version='20261024-applied2-balanced15-r3'
for old in [x for x in legacy if x['sourceNo']==18][:5]:
    x=copy.deepcopy(old);assert x['pointBand']=='3.4'
    x.update(practiceLevel='middle',sourcePointBand='3.4',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,
             levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)
meta={13:('수와 식','연결된 길이','접는 도구의 길이'),14:('수와 식','기호와 합 관계','색깔 원이 나타내는 수'),
      15:('도형','접기와 자르기','접은 종이를 펼친 조각'),16:('도형','입체와 투영도','위·앞·옆에서 본 쌓기나무'),
      17:('도형','정사각형 덮기','격자 도형을 정사각형으로 덮기'),18:('수와 식','집합과 겹침','집합과 겹침')}
assets={13:('hinged-tool-original.png','원본 길이1/15/3/7의 연결 도구. 모든 연결점·막대·점선·수치 보존.'),
        14:('beads-original.png','원본 흰색·검은색·회색 원의 네 묶음과35/45/40/물음표. 개수·색·방향 보존.'),
        15:('fold-cut-original.png','원본 접은 종이와 파란 절단선. 2cm/1cm·겹친 모양·모든 선 보존.'),
        16:('projections4-original.png','원본 위·앞의4칸 격자와 빈 옆 격자. 색칠·방향·분할선·표기 보존.'),
        17:('square-cover-original.png','원본 한 모서리가 빠진5행5열 격자 도형. 실제24칸과 모든 선 보존.')}


def axes(no,level):
    reasoning,tracking,cases={
      (13,'low'):('특정 두 연결점 사이 경로의 길이 합/차 찾기','한 직선으로 펼치거나 겹침·막대 경로·지정 두 연결점','모든19길이 대신 한 경로의 최소/최대에 집중'),
      (13,'middle'):('서로 다른 측정 길이를 나열한 뒤 구간 조건 적용','모든 연결점 쌍·겹친 측정 중복 제거·양끝 포함','원문의 전체 길이 분류 후 범위로 한 번 더 거름'),
      (13,'high'):('두 번의 독립 측정 길이를 합/차 조건으로 조합','매번 다시 접기·서로 다른 두 길이·합·최소 차·짝의 중복','막대 배치 수와 길이의 짝 수를 구별하며19길이 조합 분류'),
      (14,'low'):('같은 원 개수에서 한 색 교체의 차로 값 구하기','원본 세 합·세 색의 같은 값·묻는 색/차','덧셈 모형을 명시한 기초 보완;원문 도형 규칙 추측과 구분'),
      (14,'middle'):('색의 값을 먼저 찾은 뒤 알려진 한 색을 빼고 두 개수 역산','새 원의 전체 개수·합·회색 개수·흰/검은 답 순서','모두 검은색 기준에서 흰색 한 개의 증가5를 이용'),
      (14,'high'):('세 색 개수의 합·값 합·개수 차를 동시에 역산','새 원 개수·값의 합·흰색이 검은색보다 많음·세 답 순서','회색을 기준으로 바꾼 감소량과 흰/검은 차를 결합'),
      (15,'low'):('명시한 지그재그 접기에서 겹/조각 모양 분류','세 가로 접는선·원래 두 끝이 윗변·모든 잘린 조각 포함','반접기3회=8겹을 적용하지 않음;한 성질/한 조각 종류에 집중'),
      (15,'middle'):('같은 종이를 각각 접어 자른 뒤 제거한 종류와 나머지 수 계산','종이별 독립 절단·삼각형만 제거·펼친 전체 조각','종이 한 장의 세 종류 조각을 구분한 뒤 전체로 확대'),
      (15,'high'):('자른 종이와 자르지 않은 종이의 두 합계로 원래 장수 역산','자른1장=9조각/사각형2·자르지않은1장=사각형1·전체 조각·사각형 수','두 합의 차에서 자른 종이당7조각 차이를 추론'),
      (16,'low'):('윗그림 위치와 앞 높이를 대응해 한 기둥/전체/옆 높이 찾기','바닥부터 빈틈없음·색칠6자리·그림은 처음 상태·오른쪽 옆','그림 그리기 대신 지정 수량을 답하는 기초 보완'),
      (16,'middle'):('한 기둥의 추가/제거 뒤 각 줄의 최대 높이와 총수 계산','처음 그림·변경 위치·맨위에서 변경·옆 네 열의 순서','더 쌓아도 최대보다 낮으면 옆 모습이 그대로일 수 있음'),
      (16,'high'):('한 개의 이동 전후를 역으로 추론해 가능한 출발/도착 기둥 세기','색칠 자리 유지·두 기둥 구별·맨위 이동·최종 옆 높이·방법의 정의','모든 기둥쌍을 검사하되 빈 기둥/같은 기둥/최대 높이 변화를 배제'),
      (17,'low'):('실제 격자 도형의 넓이·큰 정사각형·남는 칸 확인','5행5열에서 모서리 한 칸 없음·격자선·정수 변 길이','원문15칸 오기를 옮기지 않음;실제 그림에서 한 성질만 묻기'),
      (17,'middle'):('정해진 크기 사용 개수와 겹치지 않는 최소 덮기 결합','격자선에 맞춘 종이·자르지않음·틈/겹침없음·특정 크기 제한','넓이 하한과 실제 배치를 모두 확인;4/3/2칸 종이의 동시 사용 제한'),
      (17,'high'):('종이 크기별 가격에서 모든 가능한 크기 개수 조합의 비용 비교','정확한 도형·가격표·최소 비용과 그때 장수·동일 비용 여부','원문의 최소7장이 언제나 최저 비용이 아님;각 가격에서 최적 조합 재판정'),
      (18,'low'):('두 교집합에서 세 교집합이 두 번 빠지는 점을 보완','나비 전체·나비와 각각 두 종류 겹침·세 종류·나비만','전체 세 집합 식 대신 한 종류만의 부분 수에 집중'),
      (18,'high'):('한 종류/정확히 두 종류/세 종류의 중복 횟수로 두 미지 합계 역산','총수·아무것도 없음·각 종류 인원·정확히 두 종류·두 답 순서','종류별 합과 한 종류 이상 인원의 차가 두 종류1번/세 종류2번임을 추론'),
    }[(no,level)]
    return dict(prerequisite='원문의 연결 길이·기호 합·접기·투영·정사각형 덮기·집합 사고에 기초',reasoning=reasoning,conditionTracking=tracking,caseSplitting=cases,
      computation='단순 큰 수가 아니라 역추론/경우 분류/비용 비교/다단계 수량을 구분',representation='13~17원본 문제 그림의 선/수치/색/방향 보존;펼친 그림/새 옆 모습/덮기 예시는 답안에만 표시',
      reading='원문3.4점과 새 연습2.7/3.4/4.2점 분리;필요 접기/측정/정렬 조건은 자연스러운 지문 안에서 명시',visualCues='문제 아래 힌트/조건 요약/풀이 순서/채운 옆 그림/완성 덮기 없음',
      shortcuts='13접는방법이 아닌 길이짝;14알려진 값만 복사해 새 원 개수 얻지 못함;15절단 종류 구분 필요;16최대값과 방향 조건 필요;17최소장수와 최저비용 구별;18정확히두종류와두교집합 구별')


def add(no,level,p,text,answer,labels,steps,detail,point,method,**extra):
    v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items);area,subarea,location=meta[no]
    x=dict(id=f'applied2-q{no:02d}-{level}-v{v}',genId=f'applied2-q{no:02d}',sourceSet='applied',sourceRound=2,sourceNo=no,variantNo=v,
      area=area,subarea=subarea,detailType=detail,learningLocation=f'활용 2회 · 원문 {no}번 · {location}',learningPoint=point,
      practiceLevel=level,sourcePointBand='3.4',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='기초 보완'if level=='low'else'단계형 확장',practiceStorageVersion=version,
      reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],
      solutionSteps=steps,solution=' '.join(steps),difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
      levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',measured=False,axes=axes(no,level)),
      verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied2-balanced15-independent-validate.py',sourceExamPage=4 if no==18 else 3,sourceAnswerPage=5 if no>=17 else 4,studentDifficultyMeasured=False))
    if no in assets:
        name,description=assets[no];x['asset']=dict(kind='raster',src='assets/applied2/'+name,description=description)
    x.update(extra);assert len(steps)>=3;items.append(x)


def save_svg(name,body,viewbox,width,height):
    folder=ROOT/'bank/assets/applied2';path=folder/name
    source=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" width="{width}" height="{height}">'+body+'</svg>\n'
    if path.exists():assert path.read_text()==source
    else:path.write_text(source)
    return 'assets/applied2/'+name


tree=[(0,1,1),(1,2,15),(2,3,3),(2,4,7)];adj=collections.defaultdict(list)
for a,b,length in tree:adj[a].append((b,length));adj[b].append((a,length))
def path_lengths(a,b,used=None):
    used=set()if used is None else used
    if a==b:return[]
    for other,length in adj[a]:
        if other in used:continue
        result=path_lengths(other,b,used|{a})
        if result is not None:return[length]+result
    return None
def measure(a,b):
    path=path_lengths(a,b)
    return {abs(sum(length*sign for length,sign in zip(path,signs)))for signs in itertools.product([-1,1],repeat=len(path))}
lengths=sorted(set().union(*(measure(a,b)for a,b in itertools.combinations(range(5),2))));assert len(lengths)==19
hinge_intro='그림의 도구를 접거나 펼쳐 모든 막대를 같은 직선 위에 둡니다. 원으로 표시된 두 연결점 사이의 길이를 잽니다. '
for a,b,mode,question in [(0,4,'max','잴 수 있는 길이 중 가장 긴 길이는 얼마입니까?'),(0,2,'max','가장 왼쪽 끝과 가운데 갈라지는 연결점 사이의 가장 긴 길이는 얼마입니까?'),(0,3,'min','가장 왼쪽 끝과 위쪽 끝점 사이의 가장 짧은 길이는 얼마입니까?'),(1,4,'max','왼쪽 위의 연결점과 가장 오른쪽 끝점 사이의 가장 긴 길이는 얼마입니까?'),(3,4,'min','위쪽 끝점과 가장 오른쪽 끝점 사이의 가장 짧은 길이는 얼마입니까?')]:
    found=measure(a,b);answer=(max if mode=='max'else min)(found)
    if(a,b,mode)==(0,4,'max'):answer=max(lengths)
    path=path_lengths(a,b)
    add(13,'low',dict(a=a,b=b,mode=mode,allPairs=question.startswith('잴 수')),
      hinge_intro+question,[answer],['길이'],['두 연결점 사이에 실제로 이어진 막대들만 길이에 영향을 줍니다. 다른 가지의 막대는 이 두 점의 경로에 들어가지 않습니다.',f'지정 경로의 막대 길이는{path}입니다. 같은 직선에서 방향을 달리 접으면 가능한 길이는 '+', '.join(map(str,sorted(found)))+'입니다.',f'따라서 묻는 길이는{answer}입니다.'+(' 다른 두 연결점의 경로도 비교하면 이보다 긴 길이는 없습니다.'if question.startswith('잴 수')else'')],
      '접는 도구의 특정 두 점 사이 길이','한 경로의 길이를 더하거나 빼서 최소와 최대 찾기','signed sums on unique tree path')
for lo,hi in [(1,14),(6,18),(8,22),(10,20),(12,23)]:
    chosen=[n for n in lengths if lo<=n<=hi]
    add(13,'middle',dict(minimum=lo,maximum=hi),hinge_intro+f'잴 수 있는 서로 다른 길이 중 {lo}이상 {hi}이하인 길이는 몇 가지입니까?',
      [len(chosen)],['길이 수'],['각 막대 경로에서 더하거나 빼서 얻는 길이를 모으고, 다른 접기나 다른 연결점에서 같은 길이가 나오면 한 번만 셉니다.',
      '가능한 전체 길이는 '+', '.join(map(str,lengths))+'의19가지입니다.',f'{lo}이상{hi}이하인 것은 '+', '.join(map(str,chosen))+f'입니다. 따라서{len(chosen)}가지입니다.'],
      '접는 도구의 길이 분류와 구간 조건','경로별 길이를 중복 없이 모은 뒤 구간으로 거르기','finite signed-path length set filtered by inclusive bounds')
for total,gap in [(24,4),(26,6),(28,8),(30,10),(32,12)]:
    pairs=[(a,b)for a,b in itertools.combinations(lengths,2)if a+b==total and b-a>=gap]
    add(13,'high',dict(total=total,minDifference=gap),hinge_intro+f'도구를 매번 새로 접어 서로 다른 두 길이를 재려고 합니다. 두 길이의 합은{total}이고 차는{gap}이상입니다. 짧은 길이와 긴 길이의 짝은 몇 가지입니까?',
      [len(pairs)],['길이 짝 수'],['접는 방법이 달라도 측정 길이가 같으면 같은 길이로 봅니다. 한 번씩 독립적으로 접으므로 각 길이는 가능한19가지 중에서 고를 수 있습니다.',
      '가능한 길이는 '+', '.join(map(str,lengths))+'입니다.',f'합이{total}이고 차가{gap}이상인 서로 다른 짝은 '+', '.join(str(pair)for pair in pairs)+f'입니다. 짧은 쪽을 먼저 적었으므로 각 짝은 한 번만 셉니다. 따라서{len(pairs)}가지입니다.'],
      '두 측정 길이의 합과 차를 만족하는 짝','측정 길이의 집합을 먼저 구한 뒤 두 조건의 조합을 중복 없이 세기','unordered distinct pairs of signed-path lengths')


bead_intro='같은 색의 원은 같은 수를 나타내며, 각 묶음 아래의 수는 그 묶음 원들이 나타내는 수의 합입니다. '
bead_steps=['첫째와 둘째 묶음을 비교하면 검은 원1개가 회색1개로 바뀌어 합이10커집니다. 회색은 검은색보다10큽니다. 첫째와 셋째를 비교하면 흰색이 회색으로 바뀌어5커지므로 흰색은 검은색보다5큽니다.',
            '첫째 묶음의5개를 모두 검은색으로 보면 흰색2개의 증가분10과 회색1개의 증가분10을 뺀35−20＝15입니다. 검은색1개는15÷5＝3입니다.',
            '흰색은8, 검은색은3, 회색은13입니다. 2×8＋2×3＋13＝35,2×8＋3＋2×13＝45,8＋2×3＋2×13＝40으로 모두 맞습니다.']
for query,question,answer in [('white','흰 원이 나타내는 수는 무엇입니까?',8),('black','검은 원이 나타내는 수는 무엇입니까?',3),('gray','회색 원이 나타내는 수는 무엇입니까?',13),('gray-black','회색 원이 나타내는 수는 검은 원의 수보다 얼마나 큽니까?',10),('gray-white','회색 원이 나타내는 수는 흰 원의 수보다 얼마나 큽니까?',5)]:
    add(14,'low',dict(query=query),bead_intro+question,[answer],['수'],bead_steps+[f'따라서 묻는 수는{answer}입니다.'],'원 묶음의 합에서 색의 값 찾기','같은 개수에서 한 색을 바꾼 합의 차를 이용하기','same-count replacement differences then common base')
for white,black,gray in [(2,5,1),(3,6,2),(4,7,3),(5,8,4),(6,9,5)]:
    total=white+black+gray;value=8*white+3*black+13*gray
    add(14,'middle',dict(total=total,value=value,gray=gray),bead_intro+f'그림의 색깔별 값을 그대로 쓰는 원을 새로{total}개 골랐더니 합은{value}였습니다. 회색이{gray}개일 때, 흰색과 검은색은 각각 몇 개입니까?',
      [white,black],['흰색 개수','검은색 개수'],bead_steps+[f'회색{gray}개의 값{13*gray}를 빼면 흰색과 검은색{total-gray}개의 합은{value-13*gray}입니다.',f'모두 검은색이면 합은3×{total-gray}＝{3*(total-gray)}입니다. 흰색1개로 바꿀 때마다5커지므로 흰색은({value-13*gray}−{3*(total-gray)})÷5＝{white}개, 검은색은{black}개입니다.'],
      '색의 값과 새 원의 개수 역산','알려진 한 색을 제외하고 값의 차로 두 색의 개수 찾기','remove gray then deviation from all-black base')
for black,gap,gray in [(2,1,4),(3,2,5),(4,3,6),(5,4,7),(6,5,8)]:
    white=black+gap;total=white+black+gray;value=8*white+3*black+13*gray
    add(14,'high',dict(total=total,value=value,whiteExcess=gap),bead_intro+f'그림의 색깔별 값을 그대로 쓰는 원{total}개의 합이{value}이고, 흰색은 검은색보다{gap}개 많습니다. 흰색·검은색·회색의 개수를 차례로 구하시오.',
      [white,black,gray],['흰색 개수','검은색 개수','회색 개수'],bead_steps+[f'모두 회색이면 합은13×{total}＝{13*total}입니다. 실제 합은 이보다{13*total-value}작습니다. 회색을 흰색으로 바꾸면5, 검은색으로 바꾸면10작아집니다.',
      f'더 많은 흰색{gap}개의 감소분{5*gap}을 빼면 흰색/검은색 한 쌍마다15작아집니다. 검은색은({13*total-value}−{5*gap})÷15＝{black}개입니다.',f'흰색은{white}개, 회색은{total}−{white}−{black}＝{gray}개입니다. 값의 합과 개수 차도 모두 맞습니다.'],
      '세 색 개수의 합·값 합·차 역산','회색 기준의 감소량과 흰색/검은색 개수 차를 결합하기','three counts from total, weighted total and color-count difference')


fold_body='<rect x="0" y="0" width="6" height="8" fill="white" stroke="#222" stroke-width=".035"/>'
fold_body+=''.join(f'<line x1="0" y1="{y}" x2="6" y2="{y}" stroke="#aaa" stroke-width=".025" stroke-dasharray=".12 .1"/>'for y in [2,4,6])
fold_body+='<g fill="none" stroke="#222" stroke-width=".045"><path data-cut="true" d="M2,0 L0,2 L2,4 L0,6 L2,8"/><path data-cut="true" d="M4,0 L6,2 L4,4 L6,6 L4,8"/><rect data-cut="true" x="2" y="1" width="2" height="2"/><rect data-cut="true" x="2" y="5" width="2" height="2"/></g>'
for label,x,y in [(1,.65,.75),(2,5.35,.75),(3,.65,4),(4,5.35,4),(5,.65,7.3),(6,5.35,7.3),(7,3,2),(8,3,6),(9,3,4)]:fold_body+=f'<text x="{x}" y="{y}" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-size=".42">{label}</text>'
fold_src=save_svg('unfolded-cuts-solution.svg',fold_body,'-.3 -.3 6.6 8.6',198,258)
fold_solution=dict(kind='svg',src=fold_src,description='답안 전용 펼친 그림. 세 가로 접는선은 점선, 절단선은 실선.',caption='1~6 삼각형 · 7~8 사각형 · 9 구멍이 있는 나머지 조각')
fold_intro='세로8cm인 종이에 같은 간격의 가로 접는선3개를 만들어 지그재그로 접었습니다. 원래 위·아래 끝은 접은 종이의 윗변에 포개져 있습니다. 그림의 파란선대로 자른 뒤 모든 조각을 펼칩니다. '
fold_steps=['세 가로 접는선은 종이를 같은 높이의4칸으로 나눕니다. 접었을 때4겹이고 한 칸의 높이는8÷4＝2cm로 그림과 같습니다.',
            '그림처럼 원래 두 끝이 윗변에 포개진 상태를 펼치면, 양옆의 대각선 절단에서 왼쪽3개·오른쪽3개로 삼각형6개가 나옵니다.',
            '아래쪽에서 들어간 네모 절단은 접힌 변을 사이에 두고 이어져 사각형2개를 만듭니다. 구멍이 뚫린 나머지 큰 조각1개를 합하면 전체는6＋2＋1＝9개입니다.']
for query,question,answer in [('layers','자르기 전 접힌 종이는 몇 겹입니까?',4),('leftTriangles','펼친 뒤 왼쪽 가장자리에서 나오는 삼각형 조각은 몇 개입니까?',3),('triangles','삼각형 조각은 모두 몇 개입니까?',6),('quadrilaterals','사각형 조각은 모두 몇 개입니까?',2),('holes','구멍이 뚫려 있는 조각은 몇 개입니까?',1)]:
    add(15,'low',dict(query=query,foldProtocol='four-accordion-panels-outer-ends-at-top'),fold_intro+question,[answer],['겹 또는 조각 수'],fold_steps+[f'따라서 물음의 수는{answer}입니다.'],'지그재그 접기와 조각 종류','접는선·겹·잘라낸 조각의 종류를 구분하기','four-panel fold symmetry and piece classes',solutionAsset=fold_solution)
for sheets in [4,5,6,7,8]:
    add(15,'middle',dict(sheets=sheets,foldProtocol='four-accordion-panels-outer-ends-at-top'),fold_intro+f'같은 종이{ sheets }장을 한 장씩 이 방법으로 잘랐습니다. 삼각형 조각만 모두 치우면 남은 조각은 몇 개입니까?',
      [3*sheets],['남은 조각 수'],fold_steps+[f'한 장에서 삼각형을 치우면 사각형2개와 나머지1개로3개가 남습니다. {sheets}장을 각각 잘랐으므로3×{sheets}＝{3*sheets}개입니다.'],'접어 자른 여러 종이의 남는 조각','한 장의 조각 종류를 먼저 분류하고 같은 종이 전체로 확대하기','independent paper copies after removing triangular classes',solutionAsset=fold_solution)
for cut,uncut in [(2,3),(3,4),(4,5),(5,6),(6,7)]:
    pieces=9*cut+uncut;quads=2*cut+uncut
    add(15,'high',dict(pieces=pieces,quadrilaterals=quads,foldProtocol='four-accordion-panels-outer-ends-at-top'),fold_intro+f'같은 종이 여러 장 중 일부만 한 장씩 이렇게 자르고 나머지는 자르지 않았습니다. 자르지 않은 종이도 한 조각으로 세었더니 전체{pieces}조각이고, 그중 사각형은{quads}개였습니다. 자른 종이와 자르지 않은 종이는 각각 몇 장입니까?',
      [cut,uncut],['자른 종이 수','자르지 않은 종이 수'],fold_steps+[f'자른 한 장은 전체9조각 중 사각형이2개라 두 수의 차가7입니다. 자르지 않은 한 장은 전체1개/사각형1개라 차가0입니다.',f'전체와 사각형 수의 차{pieces}−{quads}＝{pieces-quads}는 자른 종이에서만 나옵니다. 자른 종이는{pieces-quads}÷7＝{cut}장, 자르지 않은 종이는{quads}−2×{cut}＝{uncut}장입니다.'],
      '자른 종이와 그대로인 종이의 수 역산','전체 조각과 사각형의 차에서 자른 종이 수를 분리하기','two paper categories from total pieces and four-sided pieces',solutionAsset=fold_solution)


base_stack={(0,3):4,(1,0):1,(1,1):1,(1,3):1,(2,2):3,(3,1):2}
def side(stack):return[max(h for(x,y),h in stack.items()if y==row)for row in [3,2,1,0]]
assert side(base_stack)==[4,3,2,1]and sum(base_stack.values())==12
def side_asset(heights):
    body='<g fill="#eee" stroke="#333" stroke-width="1">'
    for col,h in enumerate(heights):
        for z in range(h):body+=f'<rect data-column="{col}" data-level="{z}" x="{col*34+10}" y="{140-(z+1)*25}" width="34" height="25"/>'
    body+='</g>'+''.join(f'<text x="{27+i*34}" y="157" text-anchor="middle" font-family="serif" font-size="12">{h}</text>'for i,h in enumerate(heights))
    src=save_svg('side-'+ '-'.join(map(str,heights))+'-solution.svg',body,'0 0 160 165',192,198)
    return dict(kind='svg',src=src,description='답안 전용 오른쪽 옆 모습. 왼쪽부터 각 열의 높이를 표시.',caption='옆 열의 높이 · '+', '.join(map(str,heights)))
stack_intro='그림은 처음 쌓기나무를 위와 앞에서 본 모습입니다. 바닥부터 빈틈없이 쌓았고, 옆 모습은 오른쪽에서 봅니다. '
stack_steps=['윗그림의 색칠된 곳은6자리입니다. 앞 그림의 왼쪽 첫 열에는 윗그림 맨아랫줄 왼쪽 자리만 있어 높이4입니다. 셋째 열의 한 자리는 높이3, 넷째 열의 한 자리는 높이2입니다.',
             '앞 그림 둘째 열의 최대 높이는1이므로 그 열의 세 자리는 모두1개씩입니다. 처음 전체 개수는4＋3＋2＋1＋1＋1＝12개입니다.',
             '오른쪽에서 본 옆 열은 윗그림 맨아랫줄부터 위로 올라가며 각 줄의 가장 높은 곳을 봅니다. 따라서 처음 높이는 왼쪽부터4,3,2,1입니다.']
for query,question,answer in [('bottomLeft','윗그림 맨아랫줄 맨왼쪽 자리에는 몇 개가 쌓여 있습니까?',4),('bottomSecond','윗그림 맨아랫줄 왼쪽에서 둘째 자리에는 몇 개가 쌓여 있습니까?',1),('secondRowRight','윗그림 위에서 둘째 줄 맨오른쪽 자리에는 몇 개가 쌓여 있습니까?',2),('total','쌓기나무는 모두 몇 개입니까?',12),('sideThird','오른쪽에서 본 옆 모습의 왼쪽에서 셋째 열 높이는 몇 개입니까?',2)]:
    add(16,'low',dict(query=query),stack_intro+question,[answer],['쌓기나무 수'],stack_steps+[f'따라서 물음의 수는{answer}개입니다.'],'위·앞 그림에서 한 기둥과 옆 높이 찾기','한 열의 최대 높이와 실제 기둥 위치를 대응하기','unique footprint/front column heights',solutionAsset=side_asset(side(base_stack)))
changes=[((0,3),-2,'맨아랫줄 맨왼쪽'),((3,1),-1,'위에서 둘째 줄 맨오른쪽'),((2,2),-2,'위에서 셋째 줄의 한 자리'),((1,0),2,'맨윗줄의 한 자리'),((1,3),3,'맨아랫줄 왼쪽에서 둘째')]
for cell,delta,location in changes:
    changed=dict(base_stack);changed[cell]+=delta;heights=side(changed);total=sum(changed.values())
    action=f'맨위에서{-delta}개를 치웠습니다'if delta<0 else f'{delta}개를 더 쌓았습니다'
    add(16,'middle',dict(cell=list(cell),delta=delta),stack_intro+f'윗그림의{location} 자리에서 {action}. 바뀐 옆 모습의 각 열 높이를 왼쪽부터 차례로 쓰고, 마지막에 남은 전체 개수를 쓰시오.',
      heights+[total],['옆1열','옆2열','옆3열','옆4열','전체 개수'],stack_steps+[f'바꾼 기둥은 원래{base_stack[cell]}개에서{changed[cell]}개가 됩니다. 같은 줄의 다른 기둥과 비교하여 최대 높이를 다시 정합니다.',f'바뀐 옆 열 높이는{heights}입니다. 전체는12'+('＋'+str(delta)if delta>0 else'−'+str(-delta))+f'＝{total}개입니다.'],
      '한 기둥을 바꾼 뒤의 옆 모습과 전체','바뀐 기둥이 그 줄의 최대를 바꾸는지 확인한 뒤 개수 합 계산하기','forward contiguous-column change and row maxima',solutionAsset=side_asset(heights))
targets=[[3,3,2,1],[4,2,2,1],[4,3,2,1],[4,3,1,1],[3,3,2,2]]
def location(cell):return f'윗그림 위에서{cell[1]+1}째 줄 왼쪽에서{cell[0]+1}째 자리'
for target in targets:
    choices=[]
    for start,h in base_stack.items():
        if h<2:continue
        for end in base_stack:
            if start==end:continue
            changed=dict(base_stack);changed[start]-=1;changed[end]+=1
            if side(changed)==target:choices.append((start,end))
    assert choices
    add(16,'high',dict(targetSide=target),stack_intro+'색칠된 여섯 자리의 기둥을 모두 남긴 채, 한 기둥 맨위의 한 개를 다른 기둥 맨위로 옮겼습니다. 그 뒤 옆 열의 높이가 왼쪽부터'+', '.join(map(str,target))+'이 되었습니다. 출발 기둥이나 도착 기둥이 다르면 다른 방법으로 셀 때 몇 가지입니까?',
      [len(choices)],['이동 방법 수'],stack_steps+['색칠된 기둥을 모두 남겨야 하므로 원래1개인 기둥에서는 뺄 수 없습니다. 높이4/3/2인 세 기둥에서 하나를 빼고 다른 다섯 기둥에 쌓는 경우를 확인합니다.',
      '조건에 맞는 이동은 '+'; '.join(location(a)+' → '+location(b)for a,b in choices)+f'입니다. 각 이동 뒤의 옆 최대 높이가{target}와 일치하며 나머지는 일치하지 않습니다. 따라서{len(choices)}가지입니다.'],
      '이동 뒤의 옆 모습으로 가능한 기둥쌍 세기','기둥을 비우지 않는 조건과 이동이 각 줄 최대에 미치는 영향을 함께 검사하기','inverse ordered-column moves with fixed footprint',solutionAsset=side_asset(target))


cells={(r,c)for r in range(5)for c in range(5)if(r,c)!=(0,0)}
def complete_tiles(large):
    covered=set()
    for r,c,size in large:
        square={(r+i,c+j)for i in range(size)for j in range(size)};assert square<=cells and not covered&square;covered|=square
    return large+[(r,c,1)for r,c in sorted(cells-covered)]
profiles=[]
for twos in range(5):profiles.append(complete_tiles([(r,c,2)for r,c in [(0,1),(0,3),(2,0),(3,2)][:twos]]))
for twos in range(4):profiles.append(complete_tiles([(2,2,3)]+[(r,c,2)for r,c in [(0,1),(0,3),(2,0)][:twos]]))
profiles.append(complete_tiles([(1,1,4)]))
def counts(tiling):return tuple(sum(size==n for r,c,size in tiling)for n in [1,2,3,4])
assert len({counts(t)for t in profiles})==10
def cover_asset(tiling):
    key='-'.join(map(str,counts(tiling)));body=''
    for i,(r,c,size)in enumerate(tiling):
        body+=f'<rect data-row="{r}" data-col="{c}" data-size="{size}" x="{10+48*c}" y="{10+48*r}" width="{48*size}" height="{48*size}" fill="'+('#eee'if size>1 else'white')+'" stroke="#222" stroke-width="1.2"/>'
        body+=f'<text x="{10+48*c+24*size}" y="{10+48*r+24*size}" text-anchor="middle" dominant-baseline="middle" font-family="serif" font-size="13">{i+1}</text>'
    return dict(kind='svg',src=save_svg('cover-'+key+'-solution.svg',body,'0 0 260 260',234,234),description='답안 전용 덮기 예시. 모든 종이는 실제 격자선과 맞고 틈이나 겹침이 없음.',caption=f'이 배치의 종이는{len(tiling)}장')
cover_intro='그림의 도형을 격자선에 맞추어 정사각형 종이로 덮습니다. 종이의 한 변은 작은 칸의 변의 정수배이고 자르지 않으며, 틈이나 겹침이 없어야 합니다. '
cover_lemmas=['실제 그림은5행5열에서 왼쪽 위 한 칸이 빠져24칸입니다. 한 변이5칸인 종이는 들어가지 않습니다.',
 '한 변3칸인 종이 두 장은 가로와 세로에서 모두 겹치므로 동시에 들어가지 않습니다. 한 변4칸 한 장을 쓰면 남는8칸은 한 칸 너비의 가장자리에 있어2칸 이상 종이를 더 놓을 수 없습니다.',
 '한 변2칸인 종이는 위에서2/4째 줄과 왼쪽에서2/4째 칸이 만나는 네 칸 중 하나를 반드시 포함하므로, 겹치지 않게 쓸 수 있는 것은 최대4장입니다.3칸 종이 한 장이 있으면 남은15칸에2칸 종이는 최대3장입니다.']
for query,question,answer,example in [('cells','작은 칸은 모두 몇 개입니까?',24,profiles[0]),('largest','들어갈 수 있는 정사각형 종이 한 변의 길이는 작은 칸의 변의 최대 몇 배입니까?',4,profiles[-1]),('unitOnly','한 칸짜리 종이만 쓰면 몇 장이 필요합니까?',24,profiles[0]),('after4','한 변4칸인 종이 한 장을 놓은 뒤, 덮이지 않은 작은 칸은 몇 개입니까?',8,profiles[-1]),('max3','한 변3칸인 종이는 겹치지 않게 최대 몇 장 놓을 수 있습니까?',1,profiles[5])]:
    add(17,'low',dict(query=query),cover_intro+question,[answer],['수'],cover_lemmas+[f'따라서 물음의 수는{answer}입니다. 답안 그림은 실제로 가능한 배치입니다.'],'실제 격자와 큰 정사각형의 범위','빠진 모서리와 큰 종이가 차지하는 칸을 실제 그림에서 확인하기','constructive integer-grid square placements',solutionAsset=cover_asset(example),solutionTiling=example)
cover_queries=[('smallOnly',None),('one4',None),('exact2',1),('exact2',2),('exact2',3)]
for query,n in cover_queries:
    allowed=[t for t in profiles if(query!='smallOnly'or all(size<=2 for r,c,size in t))and(query!='one4'or counts(t)[3]==1)and(query!='exact2'or counts(t)[1]==n)]
    best=min(allowed,key=len)
    condition='한 변이1칸 또는2칸인 종이만 사용한다면'if query=='smallOnly'else'한 변4칸인 종이를 반드시 한 장 쓴다면'if query=='one4'else f'한 변2칸인 종이를 정확히{n}장 쓴다면'
    steps=cover_lemmas+[condition+f' 가능한 크기별 개수(1칸,2칸,3칸,4칸)는 '+', '.join(str(counts(t))for t in allowed)+'입니다.',f'각 경우의 종이 수를 더하면 '+', '.join(str(len(t))for t in allowed)+f'장입니다. 가장 적은 것은{len(best)}장이고, 답안 그림처럼 실제로 덮을 수 있습니다.']
    add(17,'middle',dict(query=query,exactTwos=n),cover_intro+condition+' 종이는 최소 몇 장 필요합니까?',[len(best)],['최소 종이 수'],steps,
      '종이 크기 제한과 겹치지 않는 최소 덮기','넓이 하한과 들어갈 수 있는 크기 조합을 실제 배치와 함께 확인하기','exhaustive feasible size-count profiles with constructive witnesses',solutionAsset=cover_asset(best),solutionTiling=best)
for prices in [[5,8,18,25],[4,5,30,8],[3,2,25,40],[2,11,7,40],[1,6,20,30]]:
    costs=[sum(a*b for a,b in zip(counts(t),prices))for t in profiles];value=min(costs);chosen=[t for t,cost in zip(profiles,costs)if cost==value];assert len(chosen)==1;best=chosen[0]
    add(17,'high',dict(prices=prices),cover_intro+'종이 한 장의 가격은 표와 같습니다. 구입비를 가장 적게 쓰려면 몇 원이 필요하며, 그때 쓰는 종이는 몇 장입니까?',
      [value,len(best)],['최소 구입비(원)','그때 종이 수'],cover_lemmas+['가능한 크기별 개수(1칸,2칸,3칸,4칸)와 구입비를 모두 비교하면 '+ '; '.join(str(counts(t))+f':{cost}원'for t,cost in zip(profiles,costs))+'입니다.',f'최소 비용은{value}원이고 그 조합은{counts(best)}로, 종이는{len(best)}장입니다. 답안 그림이 해당 배치이며, 종이 수가 가장 적은 배치가 언제나 가장 싼 것은 아닙니다.'],
      '정사각형 덮기의 가격과 최소 비용','크기별 사용 가능 개수 조합에서 가격을 비교하고 장수와 비용을 구별하기','weighted costs of all feasible square-size profiles',solutionAsset=cover_asset(best),solutionTiling=best,givenTable=dict(label='정사각형 종이의 가격',headers=['한 변(칸)','1','2','3','4'],rows=[['한 장 가격(원)']+list(map(str,prices))]))


for aonly,ab,ac,triple in [(5,2,3,1),(6,3,4,2),(7,4,5,3),(8,5,6,4),(9,6,7,5)]:
    a=aonly+ab+ac+triple;both_b=ab+triple;both_c=ac+triple
    add(18,'low',dict(A=a,AB=both_b,AC=both_c,triple=triple),f'나비를 좋아하는 학생은{a}명입니다. 나비와 벌을 모두 좋아하는 학생은{both_b}명, 나비와 무당벌레를 모두 좋아하는 학생은{both_c}명이며, 세 곤충을 모두 좋아하는 학생은{triple}명입니다. 벌과 무당벌레는 좋아하지 않고 나비만 좋아하는 학생은 몇 명입니까?',
      [aonly],['나비만(명)'],[f'나비를 좋아하는{a}명에서 벌도 좋아하는{both_b}명과 무당벌레도 좋아하는{both_c}명을 빼려고 합니다.',f'세 곤충을 모두 좋아하는{triple}명은 두 번 빠지므로 한 번 다시 더해야 합니다.',f'따라서{a}−{both_b}−{both_c}＋{triple}＝{aonly}명입니다. 나비만{aonly}명, 나비/벌만{ab}명, 나비/무당벌레만{ac}명, 세 종류{triple}명을 더해도{a}명입니다.'],
      '세 종류 겹침에서 한 종류만 찾기','두 교집합에 함께 든 사람이 두 번 빠지는 점을 보완하기','four disjoint regions inside one specified set')
for aonly,bonly,conly,ab,ac,bc,triple,none in [(5,4,6,3,2,4,2,5),(6,5,7,4,3,5,3,6),(7,6,8,5,4,6,4,7),(8,7,9,6,5,7,5,8),(9,8,10,7,6,8,6,9)]:
    a=aonly+ab+ac+triple;b=bonly+ab+bc+triple;c=conly+ac+bc+triple;exact_two=ab+ac+bc;one=aonly+bonly+conly;union=one+exact_two+triple;total=union+none;occurrences=a+b+c
    add(18,'high',dict(total=total,A=a,B=b,C=c,none=none,exactTwo=exact_two),f'학생{total}명 중 나비를 좋아하는 학생은{a}명, 벌은{b}명, 무당벌레는{c}명입니다. 어느 것도 좋아하지 않는 학생은{none}명이며, 세 곤충 중 정확히 두 종류만 좋아하는 학생은{exact_two}명입니다. 세 종류를 모두 좋아하는 학생 수와 한 종류만 좋아하는 학생 수를 차례로 구하시오.',
      [triple,one],['세 종류 모두(명)','한 종류만(명)'],[f'한 종류 이상 좋아하는 학생은{total}−{none}＝{union}명입니다. 종류별 인원의 합은{a}＋{b}＋{c}＝{occurrences}명으로 셉니다.',f'두 수의 차{occurrences-union}에서는 정확히 두 종류인 학생이 한 번, 세 종류인 학생이 두 번씩 더 세어집니다. 정확히 두 종류{exact_two}명을 빼면 세 종류인 학생을 두 번 센 값입니다.',f'세 종류 모두는({occurrences-union}−{exact_two})÷2＝{triple}명입니다. 한 종류만 좋아하는 학생은{union}−{exact_two}−{triple}＝{one}명입니다.',f'한 종류{one}＋두 종류{exact_two}＋세 종류{triple}＝{union}명이며, 종류별 합도{one}＋2×{exact_two}＋3×{triple}＝{occurrences}로 맞습니다.'],
      '정확히 두 종류와 세 종류의 중복 횟수','종류별 합과 실제 인원의 차에서 중복 횟수를 분리하기','membership multiplicities of1/2/3 categories')


assert len(items)==len({x['id']for x in items})==270
assert items[:180]==json.loads(before)['items']
assert len({json.dumps({k:x.get(k)for k in ['text','givenTable','arithmeticRows','promptDataLines','asset']},ensure_ascii=False,sort_keys=True)for x in items})==270
for no in range(1,19):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for x in items:
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in legacy if y['id']==x['id']).items())
data.update(version=version,availableSourceNos=list(range(1,19)),pendingSourceNos=list(range(19,31)),newAuthoredCount=230,preservedLegacyCount=40)
data.pop('reviewSummary',None);FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored next90:85new+5approved middle;prior180 untouched;18candidate5/5/5 groups')

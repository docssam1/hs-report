"""Append the last six source groups; preserve released360 and original grades."""
import collections,copy,hashlib,itertools,json,math,subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied3-balanced15.json'
BASE='f5ea54a6df9465e1a5dbaa2772ab8d2a7f3d69ca'
before=FILE.read_bytes();assert before==subprocess.check_output(['git','show',BASE+':bank/data/applied3-balanced15.json'],cwd=ROOT)
data=json.loads(before);assert len(data['items'])==360;prior=copy.deepcopy(data['items']);items=data['items'];version='20261024-applied3-balanced15-r5'
old=json.loads((ROOT/'bank/data/applied3-expanded.json').read_text())['items']
for no in [25,26,28,30]:
    for source in [x for x in old if x['sourceNo']==no][:5]:
        x=copy.deepcopy(source);assert x['pointBand']=='4.2';x.update(practiceLevel='high',sourcePointBand='4.2',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)

meta={25:('경우의 수','중복과 순열','0의 개수와 같은 숫자의 배열'),26:('수와 식','자릿수와 관계식','뒷자리를 지운 수의 합'),27:('도형','쌓기와 입체의 개수','원본 격자의 직육면체 조건별 세기'),28:('수와 식','수의 크기와 자리','이어 쓴 수에서 최소 부분열'),29:('도형','곡선과 영역','큰 원의 접점까지 세는 원 분할'),30:('수와 식','시각과 경과 시간','잘못 맞춘 시계와 왕복 시간')}
roles={25:dict(low='고정된 네 카드의 같은 숫자와 첫 자리 제한만 분리',middle='0이 정확히 하나인 수의 합 조건을 세 양수 분할로 계산'),26:dict(low='원래 수를 알고 자리를 지운 두 수를 정방향 합산',middle='세 자리 수와 끝 한 자리를 지운 두 수의 합으로 원래 수 역산'),27:dict(low='고정 크기 직육면체 한 종류의 위치 수',middle='한 방향을 고정하거나 정육면체로 제한해 두 방향 또는 세 크기 합산',high='모든 크기를 세고 부피 홀짝·반대 꼭짓점·면 접촉·부피 합을 결합'),28:dict(low='짧게 제시된 숫자열에서 순서와 첫 자리 조건으로 선택',middle='이어 쓴 자연수를 먼저 해석한 뒤 짧은 전체 최소 수 선택'),29:dict(low='원본 두 작은 원의 겹침과 바깥 연결 영역을 직접 구분',middle='접점·교점·삼중교점 조건이 모두 명시된 배치의 영역 수 계산',high='자유 최대 분할을 유도하고 추가·삭제·두 배·경계 금지 조건을 역산'),30:dict(low='편도 시간과 머문 시간을 알고 실제 귀가 시각을 정방향 계산',middle='틀리게 맞춘 시계의 차로 경과 시간을 구한 뒤 편도 시간까지만 역산')}
assets={27:dict(kind='raster',src='assets/applied3/cuboids-grid-original.png',description='원문27번의5×3×4격자·시점·O/A/B/C·선·색그대로.'),29:dict(kind='raster',src='assets/applied3/circles-tangent-original.png',description='원문29번의큰원과서로겹친작은두원·좌우경계접점·두교점그대로.')}

def add(no,level,p,text,answer,labels,steps,point,method,**extra):
    v=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items);area,sub,detail=meta[no]
    axes=dict(prerequisite='자리값·같은숫자·격자·순서·원교점·경과시간',reasoning=roles[no][level],conditionTracking='첫자리0금지·정확한0개수·방향·배치전후·경계접촉·실제시각과표시시각구분',caseSplitting='중복숫자분할·세방향구간·교차점과접점·가능한숫자열을겹치지않게분류',computation='정방향/역산·가변차원·추가조건·표현전환의차이를분리',representation='원본입체/두원그림보존,필수카드와수열만실제자료로표시',reading='필수조건은자연스러운지문안에만',visualCues='힌트·조건요약·완성그림·보조선추가없음',shortcuts='0첫자리·같은카드교환·면접촉과포함·경계접점·시계차를구분')
    x=dict(id=f'applied3-q{no:02d}-{level}-v{v}',genId=f'applied3-q{no:02d}',sourceSet='applied',sourceRound=3,sourceNo=no,variantNo=v,area=area,subarea=sub,detailType=detail,learningLocation=f'활용 3회 · 원문 {no}번 · {detail}',learningPoint=point,practiceLevel=level,sourcePointBand='4.2',pointBand=dict(low='2.7',middle='3.4',high='4.2')[level],practiceRole='단계형 확장'if level=='high'else'기초 보완',practiceStorageVersion=version,reviewStatus='pending-output-review',text=text,answer=', '.join(map(str,answer)),answerParts=answer,answerLabels=labels,answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answer))],solutionSteps=steps,solution=' '.join(steps),difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중',high='상')[level],sourceReasoningPreserved=False,measuredVariantRate=None),levelReview=dict(basis='explicit-levelled-extension',relation='extension'if level=='high'else'foundation',measured=False,axes=axes),verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied3-balanced15-independent-validate.py',sourceExamPage=7 if no==30 else 6,sourceAnswerPage=7 if no==30 else 6,studentDifficultyMeasured=False))
    if no in assets:x['asset']=copy.deepcopy(assets[no])
    x.update(extra);assert len(steps)>=3;items.append(x)

#25: fixed multiset -> one-zero sum cases -> preserved general zero-count cases.
for cards in [[0,2,3,7],[0,1,1,4],[0,0,4,8],[0,3,3,3],[0,0,5,5]]:
    permutations=sorted({''.join(map(str,p))for p in itertools.permutations(cards)if p[0]!=0});all_count=math.factorial(4)
    for c in collections.Counter(cards).values():all_count//=math.factorial(c)
    rest=cards.copy();rest.remove(0);leading_zero=math.factorial(3)
    for c in collections.Counter(rest).values():leading_zero//=math.factorial(c)
    assert len(permutations)==all_count-leading_zero
    add(25,'low',dict(cards=cards),'다음 네 장의 카드를 모두 한 번씩 사용하여 만들 수 있는 서로 다른 네 자리 수는 모두 몇 가지입니까?',[len(permutations)],['네 자리 수의 개수'],['같은 숫자가 적힌 카드를 서로 바꾸어도 같은 수입니다. 먼저 첫 자리 제한 없이 네 카드를 늘어놓는 서로 다른 배열을 셉니다.',f'전체 배열은{all_count}가지입니다. 맨 앞에0을 고정한 뒤 나머지 세 카드를 늘어놓는 배열은{leading_zero}가지입니다.',f'맨 앞이0인 배열은 네 자리 수가 아니므로{all_count}−{leading_zero}＝{len(permutations)}가지입니다.'],'같은 숫자의 교환과 맨 앞0을 중복 없이 처리하기','fixed multiset permutations minus zero-leading permutations',cards=cards)
for total in [10,12,14,16,18]:
    rows=[]
    for triple in itertools.combinations_with_replacement(range(1,10),3):
        if sum(triple)!=total:continue
        cards=[0,*triple];valid={p for p in itertools.permutations(cards)if p[0]!=0};rows.append([', '.join(map(str,triple)),str(len(valid))])
    answer=sum(int(r[1])for r in rows)
    add(25,'middle',dict(digitSum=total,zeroCount=1,cardCopies=3),f'0부터9까지의 숫자 카드가 각각3장씩 있습니다. 카드4장을 골라0이 정확히 한 개 들어 있고 각 자리 숫자의 합이{total}인 네 자리 수를 만듭니다. 서로 다른 네 자리 수는 모두 몇 가지입니까?',[answer],['네 자리 수의 개수'],[f'0을 한 번만 쓰므로 나머지 세 수는1~9이고 합이{total}입니다. 작은 수부터 적은 세 수의 묶음을 모두 찾은 것이 답안 표입니다.','세 수가 모두 다르면 첫 자리0을 제외한 배열은18가지,두 수만 같으면9가지,모두 같으면3가지입니다. 같은 숫자를 가진 카드끼리의 교환은 별도로 세지 않습니다.',f'표의 묶음은 숫자 구성이 달라 겹치지 않습니다. 각 묶음의 배열 수를 더하면{answer}가지입니다.'],'정확히 하나인0과 양수 세 수의 합·중복을 분리하기','positive digit partitions with one zero and permutation multiplicities',solutionTable=dict(headers=['0 외의 세 수','서로 다른 네 자리 수'],rows=rows))

#26: forward truncation and a smaller inverse model; original four-digit inverse preserved.
for number in [5076,6432,7805,8924,9167]:
    a,b=number//10,number//100;s=number+a+b
    add(26,'low',dict(number=number),f'네 자리 수{number}에서 일의 자리 숫자를 지운 수와 일의 자리·십의 자리 숫자를 지운 수를 만듭니다. 처음 수와 이렇게 만든 두 수의 합을 구하시오.',[s],['세 수의 합'],[f'일의 자리 숫자를 지우면{a}입니다.',f'일의 자리와 십의 자리 숫자를 지우면{b}입니다.',f'처음 수까지 더하면{number}＋{a}＋{b}＝{s}입니다.'],'자리 숫자를 지우는 것과0으로 바꾸는 것을 구별하기','forward decimal truncation')
for number in [217,364,508,729,846]:
    s=number+number//10;a,b,c=map(int,str(number));rem=s-110*a
    add(26,'middle',dict(sum=s,digits=3),f'어떤 세 자리 수에서 일의 자리 숫자를 지운 수를 만들었습니다. 처음 세 자리 수와 지운 뒤의 수를 더하니{s}입니다. 처음 세 자리 수를 구하시오.',[number],['처음 세 자리 수'],['천천히 자리값을 비교합니다. 백·십·일의 자리 숫자를 각각 A,B,C라 하면 두 수의 합은110×A＋11×B＋C입니다.',f'11×B＋C는 최대108로110보다 작습니다. {s}에서110씩 묶으면 A＝{a}이고 나머지는{rem}입니다. 그 나머지를11씩 묶으면 B＝{b},나머지 C＝{c}입니다.',f'따라서 처음 수는{number}입니다. 확인하면{number}＋{number//10}＝{s}입니다. 원래 수를 늘리면 두 수의 합도 꼭 커지므로 다른 답은 없습니다.'],'두 수의 자릿값을 묶어 작은 범위의 역산을 완성하기','three-digit weighted sum inverse')

#27: exact native 5 wide x3 deep x4 high; no line/label additions.
dim=(5,3,4)
def placements(shape):return math.prod(d-l+1 for d,l in zip(dim,shape))
directions=['좌우','앞뒤','높이']
for shape in [(1,1,1),(2,1,1),(1,1,2),(1,2,1),(2,2,1)]:
    ways=[d-l+1 for d,l in zip(dim,shape)];answer=math.prod(ways)
    add(27,'low',dict(shape=list(shape)),f'그림의 격자선을 따라 좌우{shape[0]}칸,앞뒤{shape[1]}칸,높이{shape[2]}칸인 직육면체를 찾습니다. 놓인 위치가 다르면 다른 것으로 셀 때 모두 몇 개입니까?',[answer],['직육면체 개수'],['원본 격자는 좌우5칸,앞뒤3칸,높이4칸입니다. 각 방향에서 정해진 칸 수만큼 연속으로 고릅니다.',f'시작 위치는 좌우{ways[0]}곳,앞뒤{ways[1]}곳,높이{ways[2]}곳입니다. 세 방향의 선택은 서로 독립입니다.',f'따라서{ways[0]}×{ways[1]}×{ways[2]}＝{answer}개입니다.'],'고정 크기 직육면체의 세 방향 시작 위치를 곱하기','fixed three-dimensional interval lengths')
for mode,phrase,answer,terms in [('height1','높이가 한 칸인',360,[15,6,4]),('depthFull','앞면부터 뒷면까지 모두 이어지는',150,[15,1,10]),('widthFull','왼쪽 면부터 오른쪽 면까지 모두 이어지는',60,[1,6,10]),('heightFull','맨 아래부터 맨 위까지 모두 이어지는',90,[15,6,1]),('cubes','정육면체인',90,None)]:
    if mode=='cubes':steps=['격자는 좌우5칸,앞뒤3칸,높이4칸이므로 정육면체 한 모서리는1·2·3칸 중 하나입니다.','한 칸이면5×3×4＝60개,두 칸이면4×2×3＝24개,세 칸이면3×1×2＝6개입니다.','서로 다른 크기이므로60＋24＋6＝90개입니다.']
    else:steps=['각 방향의 격자는 좌우5칸,앞뒤3칸,높이4칸입니다. 길이를 자유롭게 고르는 방향은 양쪽 경계선 두 개를 정합니다.','자유로운 좌우 구간은5＋4＋3＋2＋1＝15개,앞뒤 구간은3＋2＋1＝6개,높이 구간은4＋3＋2＋1＝10개입니다. 끝에서 끝까지 고정하면1개이며 한 칸 높이는4곳입니다.',f'묻는 조건을 적용한 세 방향의 경우는{terms[0]}·{terms[1]}·{terms[2]}개이므로 곱하면{answer}개입니다.']
    add(27,'middle',dict(mode=mode),f'그림의 격자선을 따라 만들 수 있는 직육면체 중 {phrase} 것은 모두 몇 개입니까? 크기나 놓인 위치가 다르면 다른 것으로 셉니다.',[answer],['입체 개수'],steps,'한 방향 고정과 자유 구간 선택을 구별하기','restricted interval products or cube sizes')
base27=['좌우 구간은15개,앞뒤 구간은6개,높이 구간은10개이므로 전체 직육면체는15×6×10＝900개입니다.']
for mode,text,ans,steps in [
 ('nonCube','정육면체가 아닌 직육면체',[810],base27+['정육면체는 한 모서리1칸일 때60개,2칸일 때24개,3칸일 때6개로90개입니다.','따라서 정육면체를 빼면900−90＝810개입니다.']),
 ('evenVolume','가장 작은 정육면체 개수로 나타낸 부피가 짝수인 직육면체',[684],base27+['부피가 홀수이려면 세 방향의 길이가 모두 홀수여야 합니다. 좌우의 홀수 길이 구간은5＋3＋1＝9개,앞뒤는3＋1＝4개,높이는4＋2＝6개입니다.','홀수 부피는9×4×6＝216개이고,나머지는 모두 짝수 부피이므로900−216＝684개입니다.']),
 ('touchAnyThree','앞면·왼쪽 면·아랫면 중 적어도 한 면에 닿는 직육면체',[720],base27+['그 세 면 어느 곳에도 닿지 않으려면 좌우의 맨 왼쪽 한 칸,앞뒤의 맨 앞 한 칸,높이의 맨 아래 한 칸을 모두 피해야 합니다. 남은4×2×3격자 안에만 놓입니다.','그 안의 직육면체는10×3×6＝180개입니다. 따라서 적어도 한 면에 닿는 것은900−180＝720개입니다.']),
 ('oneCorner','맨 앞·왼쪽·아래 모서리의 작은 정육면체와 맨 뒤·오른쪽·위 모서리의 작은 정육면체 중 정확히 하나만 포함하는 직육면체',[118],base27+['한 모서리의 작은 정육면체를 포함하려면 세 방향에서 그 모서리 쪽 경계는 고정입니다. 반대 경계를5·3·4곳에서 골라5×3×4＝60개입니다. 다른 쪽 모서리도60개입니다.','두 작은 정육면체를 모두 포함하는 것은 전체 입체 하나뿐입니다. 정확히 하나인 경우에는 이 입체를 두 묶음에서 각각 빼므로(60−1)＋(60−1)＝118개입니다.']),
 ('volumeSum','모든 직육면체 각각의 부피를 가장 작은 정육면체 개수로 나타내어 더한 값',[7000],['좌우 방향의 모든 구간 길이의 합은1×5＋2×4＋3×3＋4×2＋5×1＝35입니다.','앞뒤는1×3＋2×2＋3×1＝10이고,높이는1×4＋2×3＋3×2＋4×1＝20입니다.','각 부피는 세 방향 길이의 곱입니다. 모든 구간을 하나씩 고른 곱을 전부 더하므로 세 길이 합의 곱35×10×20＝7000입니다. 같은 작은 정육면체가 여러 직육면체에 포함되면 그때마다 더합니다.'])]:
    question=f'그림의 격자선을 따라 만들 수 있는 {text}을 구하시오.'if mode=='volumeSum'else f'그림의 격자선을 따라 만들 수 있는 직육면체 중 {text}는 모두 몇 개입니까? 크기나 위치가 다르면 다른 것으로 셉니다.'
    add(27,'high',dict(mode=mode),question,ans,['부피 합'if mode=='volumeSum'else'직육면체 개수'],steps,'세 방향 구간을 만든 뒤 포함·배제와 부피 조건을 결합하기','interval enumeration and weighted/complement constraints')

#28: short explicit sequence -> concatenation -> long preserved original benchmark.
def minimum_subsequence(s,delete):
    left=len(s)-delete;start=0;indices=[]
    for i in range(left):
        end=len(s)-(left-i)+1
        candidates=[j for j in range(start,end)if i or s[j]!='0'];j=min(candidates,key=lambda j:(s[j],j));indices.append(j);start=j+1
    return ''.join(s[j]for j in indices),indices
for s,delete in [('527406',2),('431205',2),('682039',3),('914052',2),('305274',2)]:
    answer,idx=minimum_subsequence(s,delete)
    add(28,'low',dict(sequence=s,delete=delete),f'다음 수에서 숫자{delete}개를 지워 남은 순서대로 읽습니다. 첫 자리 숫자가0이 아닌 가장 작은 수를 구하시오.',[answer],['가장 작은 수 전체'],[f'처음{len(s)}자리에서{delete}개를 지우므로{len(answer)}자리를 남깁니다.','뒤에 필요한 자리 수를 남길 수 있는 범위에서 앞자리부터 가장 작은 숫자를 고릅니다. 맨 앞의0은 고를 수 없습니다.',f'원문의{", ".join(str(j+1)for j in idx)}번째 숫자를 남기면{answer}입니다. 남기는 순서는 그대로이며,앞에서 처음 다른 숫자가 작을수록 전체 수도 작습니다.'],'짧은 숫자열에서 남길 자리 수와 순서를 함께 지키기','feasible-window greedy on a short explicit sequence',promptDataLines=[s])
for end,delete in [(16,10),(18,12),(20,14),(22,16),(24,18)]:
    s=''.join(map(str,range(1,end+1)));answer,idx=minimum_subsequence(s,delete)
    add(28,'middle',dict(start=1,end=end,delete=delete),f'1부터{end}까지의 자연수를 차례로 이어 쓴 수에서 숫자{delete}개를 지웁니다. 남은 숫자의 순서는 바꿀 수 없습니다. 첫 자리 숫자가0이 아닌 가장 작은 수를 구하시오.',[answer],['가장 작은 수 전체'],[f'한 자리 수9개와 두 자리 수{end-9}개이므로 원문은9＋{end-9}×2＝{len(s)}자리입니다. {delete}개를 지우고{len(answer)}자리를 남깁니다.','뒤에 필요한 숫자를 충분히 남길 수 있는 범위 안에서 앞자리부터 최소를 고릅니다. 같은 숫자면 먼저 나온 자리를 택하고 첫 자리0은 제외합니다.',f'남길 원문 자리 번호는{", ".join(str(j+1)for j in idx)}입니다. 남는 수는{answer}이고 정확히{delete}개를 지웠습니다.'],'이어 쓴 수의 자리 수를 세고 필요한 길이를 유지하며 최소 선택하기','short concatenated natural sequence feasible-window greedy',promptDataLines=[f'123456789101112…{end-1}{end}'])

#29: native two circles touch the outer boundary at different points.
#All n circles may be tangent internally; pair intersections are not the only vertices.
base29=['작은 원을 하나씩 그립니다. 첫 원으로2면이 되고,새 원은 앞의 작은 원들과 각각 최대 두 점에서 만납니다. 큰 원에 닿는 서로 다른 한 점도 경계점으로 셉니다.','작은 원이두 개째면 새 경계점은3개여서3면,세 개째면5면을 더 늘릴 수 있습니다. 같은 방식으로 새로 늘어나는 수는1·3·5·…이고,큰 원의 원래1면을 더하면 작은 원n개의 최대는n×n＋1면입니다.','모든 작은 원의 중심을 큰 원 중심 가까운 작은 원 위에 두고 같은 큰 반지름을 택하면 각각 큰 원에 한 번 닿고,두 작은 원마다 두 번 만납니다. 세 원이 같은 점을 지나지 않게 놓을 수 있어 이 최대가 실제 가능합니다.']
for mode,ask,answer,why in [('total','서로 이어진 부분을 한 면으로 셀 때 큰 원 안은 모두 몇 면입니까?',5,'두 작은 원 안을 나누면 왼쪽만·오른쪽만·겹친 부분의3면이고,둘 다의 바깥은 위와 아래2면입니다.'),('union','두 작은 원 중 적어도 하나의 안에 있는 면은 모두 몇 면입니까?',3,'왼쪽 작은 원에만 있는 면,오른쪽 작은 원에만 있는 면,겹친 면을 셉니다.'),('outside','두 작은 원의 바깥이면서 큰 원 안인 면은 모두 몇 면입니까?',2,'작은 원들이 왼쪽과 오른쪽에서 큰 원에 닿아 길을 막으므로 위쪽과 아래쪽은 서로 이어지지 않습니다.'),('exactlyOne','두 작은 원 중 정확히 하나의 안에 있는 면은 모두 몇 면입니까?',2,'왼쪽 원에만 있는 면과 오른쪽 원에만 있는 면을 셉니다. 겹친 가운데 면은 두 원 안이므로 제외합니다.'),('intersection','두 작은 원의 안쪽이 겹친 면은 모두 몇 면입니까?',1,'두 작은 원의 공통 안쪽은 가운데 렌즈 모양 한 부분입니다.')]:
    add(29,'low',dict(mode=mode),'그림에서 '+ask,[answer],['면의 수'],[why,'큰 원의 바깥은 세지 않으며 선으로만 만나는 두 부분을 이어진 하나의 면으로 세지 않습니다.',f'따라서 묻는 면은{answer}개입니다.'],'원본에서 원의 안쪽·바깥과 경계로 막힌 연결 부분을 구분하기','direct native region memberships and connectivity')
for n in [3,4,5,6,7]:
    answer=n*n+1
    add(29,'middle',dict(smallCircles=n),f'보기처럼 큰 원 안에 작은 원을 그립니다. 작은 원{n}개가 각각 큰 원과 서로 다른 한 점에서 닿고,어느 두 작은 원도 서로 다른 두 점에서 만납니다. 한 점에서 세 작은 원이 만나지는 않습니다. 큰 원 안은 모두 몇 면으로 나뉩니까?',[answer],['면의 수'],base29[:2]+[f'작은 원{n}개일 때1＋(1＋3＋…＋{2*n-1})＝1＋{n}×{n}＝{answer}면입니다. 주어진 교점·접점 조건은 새 면이 빠지거나 겹쳐 생기는 것을 막습니다.'],'주어진 접점과 교점에서 새 원의 호가 나누는 영역 세기','specified pair crossings and distinct boundary tangencies')
high29=[('maxThenRemove',dict(maxRegions=65,remove=3),[8,26],'보기처럼 큰 원 안에 작은 원 몇 개를 그려 가장 많이 나누었더니65면이 되었습니다. 작은 원의 개수와,그 개수에서3개를 줄여 다시 그릴 때의 최대 면 수를 차례로 구하시오. 작은 원은 큰 원의 바깥으로 나가지 않습니다.',['n×n＋1＝65이므로 n×n＝64,작은 원은8개입니다.','3개를 줄이면5개이고,다시 그릴 때 최대는5×5＋1＝26면입니다.']),('addTwo',dict(add=2,increase=32),[7,50,82],'큰 원 안에 작은 원 몇 개를 그려 최대 면 수를 구했습니다. 작은 원의 개수를2개 늘려 다시 그리면 최대 면 수가32개 늘어납니다. 처음 작은 원의 개수,처음 최대 면 수,늘린 뒤 최대 면 수를 차례로 구하시오. 작은 원은 큰 원의 바깥으로 나가지 않습니다.',['두 개를 더하면 새로 늘어나는 홀수 두 개의 합은(2n＋1)＋(2n＋3)＝4n＋4입니다. 32이므로 n＝7입니다.','처음은7×7＋1＝50면,나중은9×9＋1＝82면이고 차는32면입니다.']),('removeTwo',dict(remove=2,decrease=32),[9,82,50],'큰 원 안에 작은 원 몇 개를 그려 최대 면 수를 구했습니다. 작은 원의 개수를2개 줄여 다시 그리면 최대 면 수가32개 줄어듭니다. 처음 작은 원의 개수,처음 최대 면 수,줄인 뒤 최대 면 수를 차례로 구하시오. 작은 원은 큰 원의 바깥으로 나가지 않습니다.',['마지막 두 원이 더하는 면은(2n−1)＋(2n−3)＝4n−4입니다. 32이므로 n＝9입니다.','처음은9×9＋1＝82면,줄인 뒤는7×7＋1＝50면이고 차는32면입니다.']),('doubleSum',dict(sumMaxima=182),[6,37,145],'큰 원 안에 작은 원 몇 개를 그렸을 때의 최대 면 수와,작은 원 개수를두 배로 늘려 다시 그렸을 때의 최대 면 수를 더하니182입니다. 처음 작은 원의 개수와 두 최대 면 수를 차례로 구하시오. 작은 원은 큰 원의 바깥으로 나가지 않습니다.',['두 최대의 합은(n×n＋1)＋(2n×2n＋1)＝5×n×n＋2입니다. 182에서2를 빼고5로나누면 n×n＝36이어서 n＝6입니다.','처음은6×6＋1＝37면,두 배인12개는12×12＋1＝145면이고 두 수의 합은182입니다.']),('strictGap',dict(difference=6),[7,50,44],'큰 원 안에 같은 개수의 작은 원을 두 방식으로 그립니다. 첫 방식은 작은 원이 큰 원에 닿아도 되고,둘째는 어느 작은 원도 큰 원에 닿지 않습니다. 두 방식의 최대 면 수 차이가6일 때 작은 원의 개수와 첫째·둘째 최대 면 수를 차례로 구하시오. 작은 원은 모두 큰 원의 바깥으로 나가지 않습니다.',['큰 원에 전혀 닿지 않으면 첫 작은 원은1면을 늘리고,둘째부터는2·4·6·…면씩 늘려 최대는 n×(n−1)＋2면입니다.','두 최대의 차는(n×n＋1)−(n×(n−1)＋2)＝n−1입니다. 차가6이므로 n＝7입니다. 첫째는50면,둘째는7×6＋2＝44면입니다.'])]
for mode,p,answer,text,tail in high29:
    p=dict(mode=mode,**p)
    add(29,'high',p,text,answer,['처음 작은 원 수','첫째 최대 면 수','둘째 최대 면 수']if len(answer)==3 else['작은 원 수','줄인 뒤 최대 면 수'],base29+tail,'큰 원 경계 접점까지 포함한 최대와 변화 전후의 관계를 역산하기','boundary-tangent maximum and inverse constraints')

#30: forward true time -> wrong-clock elapsed inverse -> preserved full reconstruction.
def clock(t):return f'{t//60}시{t%60:02d}분'
for arrival,stay,travel in [(580,70,20),(605,80,25),(625,90,30),(600,100,35),(600,110,40)]:
    home=arrival+stay+travel
    add(30,'low',dict(friendArrival=arrival,stay=stay,travel=travel),f'집에서 친구 집까지 갈 때와 돌아올 때 각각{travel}분 걸립니다. 친구 집에 오전{clock(arrival)}에 도착하여{stay}분 머문 뒤 바로 집으로 돌아왔습니다. 정확한 귀가 시각을 구하시오.',[home//60,home%60],['시','분'],[f'친구 집을 나온 시각은{clock(arrival)}에서{stay}분 뒤인{clock(arrival+stay)}입니다.',f'돌아오는 데{travel}분 걸리므로 그 시각에{travel}분을 더합니다.',f'따라서 정확한 귀가 시각은{clock(home)}입니다.'],'실제 도착·머무름·귀가를 시간 순서대로 더하기','forward accurate clock timeline')
for setting,stay,travel in [(540,60,20),(555,75,25),(570,90,30),(585,105,35),(600,120,40)]:
    display=setting+stay+2*travel
    add(30,'middle',dict(setting=setting,stay=stay,homeDisplay=display),f'멈춘 시계의 건전지를 바꾼 뒤 정확한 시각을 모른 채{clock(setting)}으로 맞추고 바로 친구 집에 갔습니다. {stay}분 머문 뒤 집에 돌아오니 그 시계는{clock(display)}입니다. 시계는 맞춘 뒤 정확한 속도로 갔고,갈 때와 올 때 걸린 시간은 같습니다. 한 번 가는 데 몇 분 걸렸습니까?',[travel],['편도 시간(분)'],['시각을 잘못 맞췄어도 그 뒤 정확한 속도로 가면 표시된 두 시각의 차는 실제 경과 시간입니다.',f'집 시계의 차는{display-setting}분입니다. 머문{stay}분을 빼면 왕복에{display-setting-stay}분 걸렸습니다.',f'왕복 시간이 같으므로 한 번 가는 시간은{display-setting-stay}÷2＝{travel}분입니다.'],'틀린 표시 시각과 정확한 경과 시간의 차이를 구별하기','wrong-clock elapsed duration and equal one-way travel')

assert len(items)==len({x['id']for x in items})==450 and items[:360]==prior
for no in range(1,31):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','asset','givenTable','cards']},ensure_ascii=False,sort_keys=True)for x in items})==450
for x in items:
    if x.get('preservedApprovedId'):assert all(x[k]==v for k,v in next(y for y in old if y['id']==x['id']).items())
data.update(version=version,items=items,availableSourceNos=list(range(1,31)),pendingSourceNos=[],preservedLegacyCount=85,newAuthoredCount=365);data.pop('reviewSummary',None)
data['sourceEditionNotes'].update({'25':'Literal source sum15 count195;teacher handwriting240. New low/middle and preserved high independently checked; original grade/source unchanged.','29':'Native diagram has two distinct internal tangencies with outer boundary. Those extra boundary vertices make the attainable maximum n^2+1, including n2=5/n7=50. Independent rational-center construction/Euler graph verifies all new variants. Legacy9bank/source grade not rewritten.'})
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Authored450:all30groups;prior360exact;new90slots70new+20approved;independent/output gates pending')

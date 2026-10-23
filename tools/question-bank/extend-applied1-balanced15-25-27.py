"""One-time extension: preserve360; add45 for originals25..27."""
import collections
import copy
import hashlib
import itertools
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];FILE=ROOT/'bank/data/applied1-balanced15.json'
data=json.loads(FILE.read_text());assert data['availableSourceNos']==list(range(1,25))
previous=copy.deepcopy(data['items']);items=data['items'];version='20261024-applied1-balanced15-r9'
legacy_bytes=(ROOT/'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
legacy=json.loads(legacy_bytes)['items']
for no in [25,26,27]:
    for old in [x for x in legacy if x['sourceNo']==no][:5]:
        assert old['pointBand']=='4.2';x=copy.deepcopy(old)
        x.update(practiceLevel='high',sourcePointBand='4.2',preservedApprovedId=x['id'],practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True));items.append(x)


def axes(no,level):
    reason,conditions,cases={
        (25,'low'):('이미 정해진 세 자리 수를 반 바퀴 돌려 읽기','전체 순서의 역전·6/9 교환·2/5 자기자신·세 장 중복 없음','차를 역산하거나 모든 처음 수를 찾는 단계 제외'),
        (25,'middle'):('차에서 세 자리 처음 수를 빠짐없이 역추론','양끝0금지·세 장 중복 없음·백/일 자리 교환·가운데6/9 변화','일곱 카드에서 양끝 두 장과 남은 가운데 카드를 분기;원문 다섯 자리보다 미지 자리를 줄임'),
        (26,'low'):('원본 표에서 지정된 두 칸을 읽고 합하기','행/열 순서·서로 다른 두 칸·그림에 실제 표시된1~6행열','표 밖으로 규칙을 확장하거나 행을 역산하지 않는 기초'),
        (26,'middle'):('대각선 아래/위의 테두리 규칙을 구분해 표 밖 한 칸 계산','행/열·대각선 경계·테두리 증가 방향','순방향 한 칸만 계산하며 원문의 합에서 미지 행 찾기 제외'),
        (27,'low'):('계단 입체의 맨 아래 한 줄에 속하는 모서리만 세기','한 줄 두께·붙어 있는 동일 정육면체·숨은 변·공유 변 한 번','윗층과의 겹침 및 전체 층 누적합을 제외한 기초'),
        (27,'middle'):('기존 계단 아래에 한 줄을 더 보탤 때 새 모서리만 세기','기존 성냥 유지·아래층 한 줄·맞닿은 앞뒤 선과 깊이 방향 선·숨은 변','추가한 한 줄과 이전 입체의 공유 부분만 빼며 원문의 전체 층 누적 제외'),
    }[(no,level)]
    return dict(prerequisite='원문의 자리값/회전·수 배열 규칙·정육면체 공유 모서리 범위 유지',reasoning=reason,conditionTracking=conditions,caseSplitting=cases,
                computation='수 크기만 바꾸지 않고 미지 자리 수·직접 읽기/규칙/역산·부분/증가/전체를 구분',
                representation='정확한 원문의 디지털 카드·6행6열 표·한 줄 두께 계단 입체 그림 보존',
                reading='전체 수 회전·표의 행과 열·맨 아래층만/기존 계단에 새 아래층을 보탬을 지문에서 확정',
                visualCues='그림에 새 선/수/보조표/완성된 회전 결과/모서리 개수/풀이 힌트 없음',
                shortcuts='25중 중앙6/9의 변화와 중복카드 제한을 실제 확인;26중 대각선 양쪽/경계 모두 사용;27중 단순 한 줄 개수와 공유 변의 차이가 답에 영향')


def numeric_particles(text):
    def replace(match):
        number,particle=match.groups();last=int(number)%10;final=last in [0,1,3,6,7,8]
        if particle in ['로','으로']:return number+('으로'if final and last not in [1,7,8]else'로')
        pairs={'을':('을','를'),'를':('을','를'),'은':('은','는'),'는':('은','는'),'과':('과','와'),'와':('과','와'),'이':('이','가'),'가':('이','가')}
        return number+pairs[particle][0 if final else 1]
    text=re.sub(r'(\d+)(으로|로|을|를|은|는|과|와)(?=\s|\d|[,·])',replace,text)
    return re.sub(r'(\d+)(이|가)(?=\s)',replace,text)


def add(no,level,p,text,answers,steps,label,focus,method,**extra):
    text=numeric_particles(text);steps=[numeric_particles(step)for step in steps]
    source=next(x for x in legacy if x['sourceNo']==no);n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    x={k:copy.deepcopy(source[k])for k in ['area','subarea','learningLocation','asset']}
    x['detailType']={(25,'low'):'정해진 디지털 수의 반 바퀴 회전',(25,'middle'):'반 바퀴 회전 차로 세 자리 수 모두 찾기',
                     (26,'low'):'표의 행과 열을 읽고 두 수 더하기',(26,'middle'):'정사각형 테두리 수 배열의 한 칸 구하기',
                     (27,'low'):'계단 입체 맨 아래 한 줄의 성냥개비 수',(27,'middle'):'계단 입체에 아래층을 보탤 때 성냥개비 증가량'}[(no,level)]
    x.update(id=f'applied1-q{no:02d}-{level}-v{n}',genId=f'applied1-q{no:02d}',sourceSet='applied',sourceRound=1,sourceNo=no,variantNo=n,
             reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand='4.2',pointBand=dict(low='2.7',middle='3.4')[level],
             practiceRole='기초 보완',practiceStorageVersion=version,text=text,answer=', '.join(map(str,answers)),answerParts=answers,
             answerLabels=[label],answerContract='ordered-parts',acceptedAnswers=[', '.join(map(str,answers))],
             solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,
             difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',middle='중')[level],sourceReasoningPreserved=False,measuredVariantRate=None),
             levelReview=dict(basis='explicit-levelled-extension',relation='foundation',measured=False,axes=axes(no,level)),
             verification=dict(primaryMethod=method,parameters=p,independentSuite='qa/applied1-balanced15-independent-validate.py',sourceExamPage=5,sourceAnswerPage=no,studentDifficultyMeasured=False))
    x.update(extra);assert len(steps)>=3;items.append(x)


digits=[0,1,2,5,6,8,9];turn={0:0,1:1,2:2,5:5,6:9,8:8,9:6}
rotation_step='수 전체를 반 바퀴 돌리면 카드의 자리 순서가 거꾸로 됩니다. 카드의0,1,2,5,8은 그대로이고6과9는 서로 바뀝니다.'
for number in [126,258,581,612,951]:
    original=list(map(int,str(number)));rotated=[turn[d]for d in original[::-1]];answer=int(''.join(map(str,rotated)))
    assert len(set(original))==3 and set(original)<=set(digits) and rotated[0]!=0 and answer!=number
    add(25,'low',dict(number=number,digits=digits),
        f'그림의 숫자 카드 중 서로 다른3장으로 만든 세 자리 수 {number}을 통째로 반 바퀴 돌려 읽었습니다. 돌려 읽은 수를 구하시오.'.replace(f'{number}을',f'{number}'+('을'if number%10 in [0,1,3,6,7,8]else'를')),
        [answer],[rotation_step,f'처음 수의 일의 자리{original[2]}는 돌린 수의 백의 자리{rotated[0]}가 됩니다. 십의 자리{original[1]}는{rotated[1]},백의 자리{original[0]}는 일의 자리{rotated[2]}로 읽힙니다.',
                  f'따라서 돌려 읽은 수는{answer}입니다. 다시 반 바퀴 돌리면 처음 수{number}로 돌아갑니다.'],
        '돌려 읽은 수','카드의 순서 역전과6/9의 교환을 함께 적용하기','reverse fixed digit tuple and rotate each original card')


for difference in [99,201,267,327,696]:
    found=[]
    for p in itertools.permutations(digits,3):
        if p[0]==0 or p[-1]==0:continue
        n=100*p[0]+10*p[1]+p[2];r=100*turn[p[2]]+10*turn[p[1]]+turn[p[0]]
        if r-n==difference:found.append((n,r,p))
    found.sort();assert 2<=len(found)<=6
    groups=collections.defaultdict(list)
    for n,r,p in found:groups[p[0],p[-1]].append(p[1])
    steps=[rotation_step+' 처음과 돌린 뒤 모두 세 자리이므로 양끝에는0을 놓을 수 없습니다.',
           '양끝 카드를 서로 다른 두 장으로 정하면, 가운데 카드가0·1·2·5·8일 때 십의 자리 값은 그대로입니다. 가운데가6이면9로 바뀌어30만큼 커지고,9이면6으로 바뀌어30만큼 작아집니다.',
           f'양끝에 놓는 두 장의 순서쌍30가지를 위 변화와 함께 확인합니다. 차가{difference}인 경우의 양끝과 남은 가운데 카드는 '+ ' / '.join(f'백의 자리{a}·일의 자리{c}:가운데 '+','.join(map(str,bs))for(a,c),bs in sorted(groups.items()))+'뿐입니다.']
    steps += [f'{n}을 돌리면{r}이고,{r}−{n}＝{difference}입니다.'for n,r,_ in found]
    steps += [f'따라서 처음 수는 '+', '.join(str(n)for n,_,_ in found)+f'의{len(found)}개입니다. 양끝의 순서쌍과 남은 가운데 카드를 모두 확인했으므로 다른 답은 없습니다.']
    add(25,'middle',dict(difference=difference,digits=digits,places=3),
        f'그림의 숫자 카드7장 중 서로 다른3장을 골라 세 자리 수를 만들었습니다. 이 수를 통째로 반 바퀴 돌려 읽어도 세 자리 수가 되며, 돌려 읽은 수는 처음 수보다 {difference}만큼 큽니다. 처음에 만든 수를 모두 구하시오.',
        [n for n,_,_ in found],steps,'처음 수 모두','회전 뒤 양끝과 가운데의 변화를 나누어 세 자리 수의 모든 경우 찾기',
        'all ordered three-card selections with no leading/trailing zero',answerContract='unordered-set')


grid=[[1,2,5,10,17,26],[4,3,6,11,18,27],[9,8,7,12,19,28],
      [16,15,14,13,20,29],[25,24,23,22,21,30],[36,35,34,33,32,31]]
for first,second in [((2,5),(6,3)),((3,4),(5,2)),((1,6),(4,3)),((2,6),(6,5)),((3,5),(5,4))]:
    a=grid[first[0]-1][first[1]-1];b=grid[second[0]-1][second[1]-1]
    add(26,'low',dict(first=list(first),second=list(second)),
        f'그림의 표에서 [행, 열]은 그 위치의 수를 뜻합니다. [{first[0]}, {first[1]}]＋[{second[0]}, {second[1]}]의 값을 구하시오.',
        [a+b],[f'{first[0]}행{first[1]}열의 수는 원본 표에서{a}로 읽힙니다.',
               f'{second[0]}행{second[1]}열의 수는{b}입니다.',
               f'구하는 합은{a}＋{b}＝{a+b}입니다. 행은 위에서 아래로,열은 왼쪽에서 오른쪽으로 확인하여 두 위치를 구별합니다.'],
        '두 수의 합','표의 행/열 순서에 맞게 주어진 칸을 찾기','literal lookup of two cells in the unchanged six-by-six source grid')


for row,col in [(8,3),(4,9),(7,7),(5,10),(11,6)]:
    if row>=col:
        anchor=row*row;offset=col-1;answer=anchor-offset
        steps=['각 행의 첫 수는1,4,9,16,…으로 행 번호를 두 번 곱한 수입니다. 그 행의 대각선 칸까지는 오른쪽으로 한 칸 갈 때마다1씩 작아집니다.',
               f'{row}행1열은{row}×{row}＝{anchor}입니다. 이 칸은 대각선의 왼쪽이거나 대각선에 있으므로 이 규칙을 그대로 쓸 수 있습니다.',
               f'1열에서{col}열까지{offset}칸 이동하므로 [{row}, {col}]＝{anchor}−{offset}＝{answer}입니다.']
    else:
        anchor=(col-1)**2+1;answer=anchor+row-1
        steps=['표에서 대각선 위쪽에 있는 각 열의 맨 위 수는1,2,5,10,17,26,…입니다. 그 열 번호보다1작은 수를 두 번 곱하고1을 더한 값이며, 아래로 대각선까지는 한 칸마다1씩 커집니다.',
               f'1행{col}열은{col-1}×{col-1}＋1＝{anchor}입니다. {row}행은 대각선보다 위이므로 아래로1씩 커지는 구간입니다.',
               f'1행에서{row}행까지{row-1}칸 내려오므로 [{row}, {col}]＝{anchor}＋{row-1}＝{answer}입니다.']
    add(26,'middle',dict(row=row,col=col),
        f'그림과 같은 규칙으로 수를 계속 배열합니다. [행, 열]이 그 위치의 수를 뜻할 때 [{row}, {col}]의 수를 구하시오.',
        [answer],steps,'그 위치의 수','대각선 양쪽에서 행/열 테두리의 증가 방향을 구분하기','row/column square border rule for one forward cell')


for layers in [4,5,6,7,8]:
    row=layers;count=12+8*(row-1)
    add(27,'low',dict(layers=layers,bottomCubes=row),
        f'그림과 같은 한 줄 두께의 계단 모양 입체를 {layers}층까지 만듭니다. 맨 아래층의 정육면체들에 속하는 성냥개비만 세면 모두 몇 개입니까? 보이지 않는 부분에도 성냥개비가 놓여 있습니다.',
        [count],[f'{layers}층 계단의 맨 아래층에는 정육면체{row}개가 한 줄로 붙어 있습니다. 이 한 줄에 속하는 모서리만 셉니다.',
                 '첫 정육면체에는 성냥개비12개가 필요합니다. 그다음 정육면체마다 앞의 정육면체와 맞닿은 면의4개를 함께 쓰므로 새로8개씩 필요합니다.',
                 f'따라서 맨 아래층에 속하는 성냥개비는12＋8×{row-1}＝{count}개입니다. 위층의 다른 모서리는 포함하지 않습니다.'],
        '맨 아래층 성냥개비 수','한 줄로 붙인 정육면체의 공유 면과 숨은 모서리를 한 번씩 세기','twelve first edges plus eight for each face-adjacent cube')


for old_layers in [3,4,5,6,7]:
    layers=old_layers+1;row_sticks=8*layers+4;shared=3*layers-2;extra=row_sticks-shared
    assert extra==5*layers+6
    add(27,'middle',dict(oldLayers=old_layers,newLayers=layers),
        f'그림과 같은 한 줄 두께의 계단 모양 입체를 {old_layers}층까지 만들었습니다. 이미 놓인 성냥개비는 그대로 두고 맨 아래에 정육면체 한 줄을 보태 {layers}층 계단으로 완성하려고 합니다. 성냥개비를 몇 개 더 놓아야 합니까? 보이지 않는 부분에도 성냥개비가 놓여 있습니다.',
        [extra],[f'새 맨 아래층에는 정육면체{layers}개가 들어갑니다. 이 한 줄만 따로 만들면12＋8×{layers-1}＝{row_sticks}개가 필요합니다.',
                 f'이전 계단의 맨 아래{old_layers}개 정육면체와 새 줄이 맞닿습니다. 그 부분의 앞면·뒷면 가로 성냥개비는 각각{old_layers}개,깊이 방향은{layers}개이므로 이미 있는 성냥개비는{old_layers}＋{old_layers}＋{layers}＝{shared}개입니다.',
                 f'따라서 더 놓을 성냥개비는{row_sticks}−{shared}＝{extra}개입니다. 겹치는 성냥개비는 새로 놓지 않고,새 아래층의 나머지 모든 모서리는 한 번씩 놓았습니다.'],
        '추가할 성냥개비 수','기존 계단과 새 아래층이 공유하는 앞뒤/깊이 방향 모서리 제외하기','new bottom-row edges minus the full shared boundary with the old stair')


assert len(items)==len({x['id']for x in items})==405
assert len({json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},sort_keys=True,ensure_ascii=False)for x in items})==405
for no in range(1,28):assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for old in previous:assert next(x for x in items if x['id']==old['id'])==old
data.update(version=version,availableSourceNos=list(range(1,28)),pendingSourceNos=list(range(28,31)),preservedLegacyCount=110,newAuthoredCount=295)
data.pop('reviewSummary',None);FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added45 (30new+15preserved);405total;prior360unchanged.')

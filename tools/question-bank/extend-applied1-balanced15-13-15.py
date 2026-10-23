"""Add foundation5 + preserved middle5 + extension5 for each3.4-point source."""
import collections
import copy
import hashlib
import itertools
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
FILE=ROOT/'bank/data/applied1-balanced15.json'
data=json.loads(FILE.read_text())
assert data['availableSourceNos']==list(range(1,13)),'One-time additive extension only.'
previous=copy.deepcopy(data['items'])
legacy_bytes=(ROOT/'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest()==data['legacyBankSha256']
legacy=json.loads(legacy_bytes)['items']
items=data['items'];version='20261024-applied1-balanced15-r5'


def axes(no,level):
    reason,conditions,cases={
        (13,'low'):('양쪽 백의 자리를 고정하고 남은 네 카드의 배치만 비교', '6장 전부1회·두 백의 자리·최대곱 하나', '첫째 수의 남은 두 자리12가지마다 둘째 수의 최대 배치를 비교'),
        (13,'high'):('차의 범위와 배수 조건이 있는 곱의 최대·최소를 함께 탐색', '6장 전부1회·세 자리 두 수·차의 양 끝 포함·적어도 한 수의 배수', '교환 대칭을 제거하고 조건별 후보·각 경우의 양 극값을 모두 비교'),
        (14,'low'):('첫 봉지 양을 알고 두 번의 세 배와 같은 증가량을 순서대로 계산', '첫 봉지 양·나=3가+증가량·다=3나+증가량', '전체 합에서 거꾸로 구하는 원문 단계는 제외한 기초 보완'),
        (14,'high'):('전체와 마지막 봉지 양에서 첫 양과 공통 증가량을 함께 역산', '세 봉지 전체·마지막 양·두 단계의 세 배·같은 양을 더함', '첫 양과 공통 증가량을 분리하여 두 관계에서 증가량을 없앰'),
        (15,'low'):('앞부분에 빠진 한 분수를 이웃한 항과 묶음에서 찾아 채움', '실제 초기17항 중 빈칸 하나·나열된 분자/분모', '큰 순서의 누적합 역산을 제외하고 보이는 묶음의 위치를 확인'),
        (15,'high'):('분자/분모의 합과 차로 항을 식별한 뒤 전체 순서를 역산', '약분 전 모양·분자+분모·분모−분자·전체 순서', '분자/분모를 결정한 뒤 묶음의 길이와 앞 묶음 누적을 연결'),
    }[(no,level)]
    return dict(prerequisite='원문의 자릿값·연속 세 배 관계·분수 묶음 규칙을 이어 사용',
                reasoning=reason,conditionTracking=conditions,caseSplitting=cases,
                computation='작은 수/큰 수만으로 난도를 정하지 않고 미지 정보와 탐색·역추론의 차이를 기록',
                representation='수 카드·분수 나열은 문제 자체의 필수 자료만 제시;원본 도형을 변형하지 않음',
                reading='필수 조건과 양 끝·적어도 하나·나열된 모양을 지문 안에서 명시;요약·힌트 없음',
                visualCues='카드 정렬이나 분수 구분에 풀이 묶음·경로·정답 표시를 넣지 않음',
                shortcuts='상13번 두 조건이 실제 양 극값에 각각 영향을 줌을 검사;분수는 약분 전 표기 기준')


for no in [13,14,15]:
    for old in [x for x in legacy if x['sourceNo']==no][:5]:
        assert old['pointBand']=='3.4'
        x=copy.deepcopy(old)
        x.update(practiceLevel='middle',sourcePointBand='3.4',preservedApprovedId=x['id'],
                 practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True))
        items.append(x)


def add(no,level,parameters,text,answers,steps,labels,focus,method,**extra):
    n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    source=next(x for x in legacy if x['sourceNo']==no)
    x={k:copy.deepcopy(source[k])for k in ['area','subarea','detailType','learningLocation']}
    x.update(id=f'applied1-q{no:02d}-{level}-v{n}',genId=f'applied1-q{no:02d}',
             sourceSet='applied',sourceRound=1,sourceNo=no,variantNo=n,
             reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand='3.4',
             pointBand=dict(low='2.7',high='4.2')[level],practiceRole='기초 보완'if level=='low'else'단계형 확장',
             practiceStorageVersion=version,text=text,answer=', '.join(map(str,answers)),answerParts=answers,
             answerLabels=labels,acceptedAnswers=[', '.join(map(str,answers))],answerContract='ordered-parts',
             solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,
             difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(low='하',high='상')[level],
                                     sourceReasoningPreserved=False,measuredVariantRate=None),
             levelReview=dict(basis='explicit-levelled-extension',relation='foundation'if level=='low'else'extension',
                              measured=False,axes=axes(no,level)),
             verification=dict(primaryMethod=method,parameters=parameters,
                               independentSuite='qa/applied1-balanced15-independent-validate.py',
                               sourceExamPage=3,sourceAnswerPage=no,studentDifficultyMeasured=False))
    x.update(extra)
    assert len(steps)>=3
    items.append(x)


sets=[[1,2,3,4,6,8],[1,3,4,5,7,9],[2,3,4,6,7,8],[1,2,5,6,8,9],[2,4,5,6,7,9]]
limits=[(30,180),(30,110),(80,230),(100,180),(30,180)]
for digits,(lower,upper)in zip(sets,limits):
    h1,h2=digits[:2];rest=digits[2:]
    maxima=[]
    for tens,ones in itertools.permutations(rest,2):
        first=100*h1+10*tens+ones;remaining=sorted(set(rest)-{tens,ones},reverse=True)
        second=100*h2+10*remaining[0]+remaining[1]
        maxima.append((first*second,first,second))
    maxima.sort(key=lambda row:row[1]);best=max(maxima)
    add(13,'low',dict(digits=digits,hundreds=[h1,h2]),
        f'아래 수 카드 6장을 모두 한 번씩만 사용하여 (세 자리 수)×(세 자리 수)를 만듭니다. 첫째 수의 백의 자리는 {h1}, 둘째 수의 백의 자리는 {h2}일 때 가장 큰 곱을 구하시오.',
        [best[0]],[f'백의 자리에 {h1}과 {h2}를 놓으면 남은 네 카드는 '+', '.join(map(str,rest))+'입니다.',
                   '첫째 수의 십의 자리와 일의 자리를 정한 뒤, 둘째 수는 남은 두 카드 중 큰 것을 십의 자리에 놓아야 곱이 가장 큽니다.',
                   '첫째 수의 가능한12가지를 이 방법으로 비교하면 '+ '、'.join(f'{a}×{b}＝{v}'for v,a,b in maxima)+'입니다.',
                   f'이 중 가장 큰 값은 {best[1]}×{best[2]}＝{best[0]}입니다. 백의 자리와 카드의 사용 횟수도 조건에 맞습니다.'],
        ['가장 큰 곱'],'백의 자리가 정해진 두 수에서 남은 카드 배치의 최대곱을 빠짐없이 비교',
        'fixed hundreds and twelve first-factor choices',cards=digits)

    pairs={(min(a,b),max(a,b))for d in itertools.permutations(digits)
           for a,b in [(100*d[0]+10*d[1]+d[2],100*d[3]+10*d[4]+d[5])]}
    allowed=[(a*b,a,b)for a,b in pairs if lower<=b-a<=upper and(a%7==0 or b%7==0)]
    only_difference=[a*b for a,b in pairs if lower<=b-a<=upper]
    only_multiple=[a*b for a,b in pairs if a%7==0 or b%7==0]
    products=[r[0]for r in allowed];small=min(allowed);large=max(allowed)
    assert len(allowed)>=4
    assert (min(products),max(products))!=(min(only_difference),max(only_difference))
    assert (min(products),max(products))!=(min(only_multiple),max(only_multiple))
    unconstrained=[a*b for a,b in pairs]
    assert min(unconstrained)not in products and max(unconstrained)not in products
    groups=[]
    for h in sorted({a//100 for _,a,b in allowed}):
        rows=[row for row in allowed if row[1]//100==h];lo=min(rows);hi=max(rows)
        groups.append(f'작은 수의 백의 자리{h}: 최소{lo[1]}×{lo[2]}＝{lo[0]}, 최대{hi[1]}×{hi[2]}＝{hi[0]}')
    add(13,'high',dict(digits=digits,minimumDifference=lower,maximumDifference=upper,divisor=7),
        f'아래 수 카드 6장을 모두 한 번씩만 사용하여 두 세 자리 수를 만듭니다. 큰 수에서 작은 수를 뺀 차는 {lower} 이상 {upper} 이하이고, 두 수 중 적어도 한 수는 7의 배수입니다. 이 조건에 맞는 두 수의 곱의 최댓값과 최솟값의 차를 구하시오.',
        [large[0]-small[0]],['두 수를 서로 바꾸어도 곱은 같으므로 작은 수와 큰 수를 정해 중복을 없앱니다.',
         '카드 세 장으로 만들 수 있는7의 배수를 먼저 고른 뒤, 남은 세 장으로 다른 수를 만들어 두 수의 차까지 확인합니다. 두 수가 모두7의 배수인 경우도 한 번만 셉니다.',
         '조건에 맞는 경우를 작은 수의 백의 자리별로 나누어 비교한 양 극값은 다음과 같습니다. '+' / '.join(groups)+'.',
         f'따라서 전체 최댓값은 {large[1]}×{large[2]}＝{large[0]}, 최솟값은 {small[1]}×{small[2]}＝{small[0]}입니다. 그 차는 {large[0]}−{small[0]}＝{large[0]-small[0]}입니다.'],
        ['곱의 차'],'배수 후보와 남은 카드를 짝지어 차 조건을 거른 뒤 경우별 최대·최소 비교',
        'filtered720arrangements with separate extrema per smaller hundreds',cards=digits)


def quantity(g):
    return f'{g//1000}kg {g%1000}g'if g>=1000 else f'{g}g'


for first,extra in [(250,25),(325,40),(450,35),(575,60),(650,75)]:
    second=3*first+extra;third=3*second+extra
    add(14,'low',dict(first=first,ratio=3,extra=extra),
        f'가, 나, 다 세 봉지에 설탕을 담습니다. 가 봉지에는 {quantity(first)}이 들어 있고, 나 봉지에는 가 봉지의 3배보다 {extra}g 많게, 다 봉지에는 나 봉지의 3배보다 {extra}g 많게 담았습니다. 다 봉지의 설탕은 몇 g입니까?',
        [third],[f'나 봉지의 양은 가 봉지의3배에{extra}g을 더하여 {first}×3＋{extra}＝{second}g입니다.',
                 f'다 봉지의 양은 나 봉지의3배에{extra}g을 더하여 {second}×3＋{extra}＝{third}g입니다.',
                 f'나와 가의 관계는 {second}−3×{first}＝{extra}g, 다와 나의 관계도 {third}−3×{second}＝{extra}g으로 맞습니다.'],
        ['다 봉지의 양(g)'],'처음 양에서 두 단계의 세 배와 증가량을 차례로 적용',
        'forward composition of two threefold affine relations')

for first,extra in [(225,20),(300,35),(375,40),(450,55),(525,60)]:
    second=3*first+extra;third=3*second+extra;total=first+second+third
    assert (4*total-5*third)//7==first
    add(14,'high',dict(total=total,third=third,ratio=3),
        f'설탕 {quantity(total)}을 가, 나, 다 세 봉지에 나누어 담았습니다. 나 봉지에는 가 봉지의 3배보다 더 담고, 다 봉지에는 나 봉지의 3배보다 더 담았습니다. 더 담은 양은 두 경우에 같았습니다. 다 봉지에 {third}g이 들어 있다면 가 봉지에는 몇 g이 들어 있습니까?',
        [first],['가 봉지의 양을 □g, 두 경우에 공통으로 더한 양을 △g이라 하면 나 봉지는3×□＋△, 다 봉지는9×□＋4×△g입니다.',
                 f'세 봉지의 전체는13×□＋5×△＝{total}이고, 다 봉지의 양은9×□＋4×△＝{third}입니다.',
                 f'전체 양의4배에서 다 봉지 양의5배를 빼면 공통 증가량이 없어집니다. 따라서7×□＝4×{total}−5×{third}＝{4*total-5*third}이고 □＝{first}g입니다.',
                 f'공통으로 더한 양은 ({third}−9×{first})÷4＝{extra}g입니다. 실제 가{first}g, 나{second}g, 다{third}g의 합은 {total}g이며 두 관계를 모두 만족합니다.'],
        ['가 봉지의 양(g)'],'공통으로 더한 양을 미지수로 두고 전체와 마지막 양의 두 식에서 제거',
        'eliminate unknown shared offset from total and third bag')


def fraction(a,b):
    return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{a}</mn><mn>{b}</mn></mfrac></math>'


terms=[]
for size in range(2,30):
    for numerator in range(1,size+1):terms.append((numerator,2*size+1-numerator))
source_sequence=[fraction(*term)for term in terms[:17]]
for position in [3,7,10,13,17]:
    answer=terms[position-1];given=source_sequence.copy();given[position-1]='□'
    size=(sum(answer)-1)//2;numerator=answer[0]
    add(15,'low',dict(missingPosition=position,presentedTerms=17),
        '다음은 일정한 규칙에 따라 분수를 나열한 것입니다. □에 들어갈 분수를 나열된 모양 그대로 구하시오.',
        list(answer),['분자가1부터 시작하는 부분을 기준으로 보면 분자들은1,2 / 1,2,3 / 1,2,3,4 / …와 같이 이어집니다.',
                      f'빈칸은 분수가{size}개 이어지는 부분의{numerator}번째입니다. 이 부분의 첫 분모는{2*size}이고, 뒤로 한 칸 갈 때마다1씩 작아집니다.',
                      f'따라서 빈칸의 분자는{numerator}, 분모는{2*size}−({numerator}−1)＝{answer[1]}이므로 '+fraction(*answer)+'입니다.'],
        ['분자','분모'],'이웃한 분자와 분모의 변화를 보고 앞부분의 빠진 항 찾기',
        'local missing literal fraction in the displayed prefix',
        promptDataLines=[', '.join(given)+' …'],answer=fraction(*answer),acceptedAnswers=[fraction(*answer)])

for size,numerator in [(18,7),(20,9),(22,10),(24,11),(26,12)]:
    total=2*size+1;difference=total-2*numerator;denominator=total-numerator
    before=size*(size-1)//2-1;index=before+numerator
    assert terms[index-1]==(numerator,denominator)
    add(15,'high',dict(writtenSum=total,writtenDifference=difference),
        f'다음은 일정한 규칙에 따라 분수를 나열한 것입니다. 나열된 모양 그대로 보았을 때, 분자와 분모의 합이 {total}이고 분모가 분자보다 {difference} 큰 분수는 전체에서 몇 번째 분수입니까?',
        [index],[f'분자와 분모의 합이{total}, 차가{difference}이므로 분자는({total}−{difference})÷2＝{numerator}, 분모는({total}＋{difference})÷2＝{denominator}입니다. 약분 전 나열된 모양은 '+fraction(numerator,denominator)+'입니다.',
                 f'분자가1부터 다시 시작하는 부분의 길이는2,3,4,…이고, 각 부분에서 분자와 분모의 합은5,7,9,…입니다. 합이{total}인 부분에는 ({total}−1)÷2＝{size}개의 분수가 있습니다.',
                 f'그 부분 앞에는2＋3＋…＋{size-1}＝{before}개의 분수가 있습니다. 목표 분수의 분자가{numerator}이므로 그 부분의{numerator}번째입니다.',
                 f'따라서 전체에서 {before}＋{numerator}＝{index}번째입니다. 해당 위치의 나열된 분자/분모를 다시 확인하면 {numerator}/{denominator}로 두 조건이 맞습니다.'],
        ['순서'],'분자/분모의 합과 차로 항을 찾고 묶음 앞의 누적 개수로 전체 순서를 역산',
        'inverse group size from literal fraction sum and difference',
        promptDataLines=[', '.join(source_sequence)+' …'])


def information_key(x):
    return json.dumps({k:x.get(k)for k in ['text','promptDataLines','cards','givenTable','arithmeticRows','asset']},ensure_ascii=False,sort_keys=True)


assert len(items)==len({x['id']for x in items})==225
assert len({information_key(x)for x in items})==225
for no in range(1,16):
    assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for old in previous:
    assert next(x for x in items if x['id']==old['id'])==old
data.update(version=version,availableSourceNos=list(range(1,16)),pendingSourceNos=list(range(16,31)),
            preservedLegacyCount=65,newAuthoredCount=160)
data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added45:15 preserved middle +15 foundation +15 extension; total225 in fifteen5/5/5 groups; prior180 unchanged.')

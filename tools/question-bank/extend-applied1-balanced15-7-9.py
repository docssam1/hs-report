"""One-time additive levelled extension, directly compared with PDF questions7-9."""
import collections
import copy
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / 'bank/data/applied1-balanced15.json'
data = json.loads(FILE.read_text())
assert data['availableSourceNos'] == list(range(1, 7)), 'Additive extension only; never rebuild an approved bank.'
previous = copy.deepcopy(data['items'])
legacy_bytes = (ROOT / 'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest() == data['legacyBankSha256']
legacy = json.loads(legacy_bytes)['items']
items = data['items']
version = '20261024-applied1-balanced15-r3'
meta = {
    7: dict(area='도형', subarea='도형의 개수', detailType='깃발 칸을 포함하는 격자 직사각형',
            learningLocation='활용 1회 · 원문 7번 · 깃발을 포함하는 직사각형 세기'),
    8: dict(area='수와 식', subarea='문자와 곱셈식', detailType='같은 문자의 자릿값을 이용한 곱셈식',
            learningLocation='활용 1회 · 원문 8번 · 문자 곱셈식'),
    9: {k: next(x for x in legacy if x['sourceNo'] == 9)[k]
        for k in ['area', 'subarea', 'detailType', 'learningLocation']},
}
for old in [x for x in legacy if x['sourceNo'] == 9][:5]:
    x = copy.deepcopy(old)
    x.update(practiceLevel='low', sourcePointBand=old['pointBand'], preservedApprovedId=old['id'],
             practiceRole='원문 수준 연습', practiceStorageVersion=version,
             levelReview=dict(basis='source-point-band', relation='source-benchmark', measured=False, preservedItem=True))
    items.append(x)


def axes(no, level):
    reasoning, conditions, cases = {
        (7, 'low'): ('가로 칸 수를 고정해 깃발 칸을 포함하는 위치와 세로 경계를 셈', '깃발 포함·가로 칸 수', '가능한 가로 시작과 위아래 경계의 조합'),
        (7, 'middle'): ('작은 칸의 수를 가로·세로 칸 수의 곱으로 나누어 경우별 합산', '깃발 포함·전체 작은 칸 수', '그림 안에 들어가는 모든 가로/세로 칸 수 조합'),
        (7, 'high'): ('방향·칸 수의 곱·두 방향 칸 수의 합을 동시에 적용', '깃발 포함·가로>세로·작은 칸 수 하한·칸 수 합 상한', '성립하는 크기와 각 크기의 위치를 분리하고 중복 없이 합산'),
        (8, 'low'): ('고정된 곱하는 수와 반복 문자의 자릿값 관계를 비교', '서로 다른0이 아닌 숫자·같은 문자·주어진 곱셈식', '1~9에서 자릿값 비를 만족하는 전체 숫자 쌍'),
        (8, 'middle'): ('곱하는 수의 백의 자리까지 미지수로 두고 자릿값 조건 결합', '빈 백의 자리·서로 다른 문자 숫자·네 자리 곱', '빈 숫자의1~9 경우마다 같은 문자 쌍인지 확인'),
        (8, 'high'): ('문자 숫자의 합과 미지의 곱하는 수 범위를 함께 역추론', '숫자 합·곱하는 수 범위·반복 자리', '가능한 문자 쌍 전체에서 나누어떨어짐과 범위 확인'),
        (9, 'middle'): ('같은 표시가 되풀이되는 길이와 도막 수의 관계를 거꾸로 이용', '두 간격·길이가 두 간격의 공배수·전체 도막 수', '양 끝을 내부 절단점으로 세지 않음'),
        (9, 'high'): ('공배수가 아닌 길이까지 허용하여 같은 도막 수가 되는 길이 전부 찾기', '정수cm 범위·두 간격·도막 수', '끝점이 표시와 일치하는 경우와 아닌 경우, 같은 답의 구간'),
    }[(no, level)]
    return dict(prerequisite='격자 경계·자릿값·배수와 중복 세기를 원문에서 이어 사용',
                reasoning=reasoning, conditionTracking=conditions, caseSplitting=cases,
                computation='숫자 크기만으로 단계를 정하지 않고 역추론·경우 분기·조건 결합을 비교',
                representation='7번은 실제 원본 그림의 모든 픽셀 보존;8번은 숫자를 바꾼 필수 곱셈식 자체만 제시',
                reading='필수 조건은 지문 안에 명시하며 문제 아래 요약·힌트·풀이 순서 없음',
                visualCues='깃발·선·칸·색·비율·라벨을 변경하거나 추가하지 않음',
                shortcuts='경계 포함·0 제외·숫자 중복·공배수·복수해를 별도로 확인')


def add(no, level, params, text, answers, steps, focus, method, **extra):
    n = 1 + sum(x['sourceNo'] == no and x['practiceLevel'] == level for x in items)
    x = copy.deepcopy(meta[no])
    x.update(id=f'applied1-q{no:02d}-{level}-v{n}', genId=f'applied1-q{no:02d}',
             sourceSet='applied', sourceRound=1, sourceNo=no, variantNo=n,
             reviewStatus='pending-output-review', practiceLevel=level, sourcePointBand='2.7',
             pointBand=dict(low='2.7', middle='3.4', high='4.2')[level],
             practiceRole='기초 보완' if no == 7 and level == 'low' else '단계형 확장',
             practiceStorageVersion=version, text=text, answer=', '.join(map(str, answers)),
             answerParts=answers, answerLabels=['가능한 길이 모두 (쉼표로 구분)'] if no == 9 and level == 'high' else ['정답'],
             acceptedAnswers=[', '.join(map(str, answers))],
             answerContract='unordered-set' if no == 9 and level == 'high' else 'ordered-parts',
             solutionSteps=steps, solution=' '.join(steps), learningPoint=focus,
             difficultyEvidence=dict(basis='designed-practice-point-band', label=dict(low='하', middle='중', high='상')[level],
                                     sourceReasoningPreserved=no == 8 and level == 'low', measuredVariantRate=None),
             levelReview=dict(basis='explicit-levelled-extension', relation='foundation' if no == 7 and level == 'low' else 'extension',
                              measured=False, axes=axes(no, level)),
             verification=dict(primaryMethod=method, parameters=params,
                               independentSuite='qa/applied1-balanced15-independent-validate.py',
                               sourceExamPage=2, sourceAnswerPage=no, studentDifficultyMeasured=False))
    if no == 7:
        x['asset'] = dict(src='assets/applied1/flag-grid.png', description='원본 깃발 격자 그림')
    x.update(extra)
    assert len(steps) >= 3
    items.append(x)


def placements(w, h):
    # Original: 5 columns,4 rows, flag column4,row2. Count start positions by size.
    horizontal = max(0, min(3, 5-w) - max(0, 4-w) + 1)
    vertical = max(0, min(1, 4-h) - max(0, 2-h) + 1)
    return horizontal * vertical


def size_details(sizes):
    return '、'.join(f'가로{w}칸·세로{h}칸: {placements(w,h)}개' for w, h in sizes)


for w in range(1, 6):
    sizes = [(w, h) for h in range(1, 5)]
    result = sum(placements(*s) for s in sizes)
    add(7, 'low', {'width': w},
        f'그림의 선을 따라 만든 직사각형 중 깃발이 있는 칸을 포함하고 가로가 작은 칸 {w}개인 직사각형은 모두 몇 개입니까?',
        [result], [f'가로가 {w}칸이면서 깃발 칸을 포함하는 가로 위치는 {placements(w,1)}가지입니다.',
                   '깃발 칸의 위쪽 경계는2가지, 아래쪽 경계는3가지이므로 세로 구간은2×3＝6가지입니다.',
                   f'가로 위치와 세로 구간을 짝지으면 {placements(w,1)}×6＝{result}개입니다.'],
        '깃발 칸을 포함하는 가로 위치와 위아래 경계 선택을 나누어 세기', 'rectangle size placement product')

for area in [4, 6, 8, 10, 12]:
    sizes = [(w,h) for w in range(1,6) for h in range(1,5) if w*h == area]
    result = sum(placements(*s) for s in sizes)
    add(7, 'middle', {'cellCount': area},
        f'그림의 선을 따라 만든 직사각형 중 깃발이 있는 칸을 포함하고, 작은 칸을 모두 {area}개 포함하는 직사각형은 몇 개입니까?',
        [result], [f'작은 칸 {area}개로 된 직사각형의 가로·세로 칸 수는 곱이 {area}이며 그림의 가로5칸·세로4칸을 넘을 수 없습니다.',
                   '각 크기마다 깃발 칸을 포함하는 가로 시작 위치와 세로 시작 위치를 짝지어 셉니다. ' + size_details(sizes) + '입니다.',
                   f'서로 다른 크기의 직사각형은 겹쳐 세지 않으므로 이 개수들을 더하면 {result}개입니다.'],
        '작은 칸의 수를 가능한 가로·세로 칸 수로 나누고 깃발 포함 위치 세기', 'factor pairs and placement product')

for area, total in [(4,6), (6,7), (8,8), (9,8), (10,9)]:
    sizes = [(w,h) for w in range(1,6) for h in range(1,5) if w>h and w*h>=area and w+h<=total]
    result = sum(placements(*s) for s in sizes)
    add(7, 'high', {'minimumCells': area, 'maximumSideSum': total},
        f'그림의 선을 따라 만든 직사각형 중 깃발이 있는 칸을 포함하는 것을 찾습니다. 가로 칸 수가 세로 칸 수보다 많고, 작은 칸을 {area}개 이상 포함하며, 가로와 세로의 칸 수를 합하면 {total} 이하인 직사각형은 모두 몇 개입니까?',
        [result], [f'가로는1~5칸, 세로는1~4칸입니다. 가로가 세로보다 많고 두 칸 수의 곱이 {area} 이상이며 합이 {total} 이하인 크기를 고릅니다.',
                   '조건을 모두 만족하는 크기와, 각 크기에서 깃발을 포함하는 위치의 수는 ' + size_details(sizes) + '입니다.',
                   f'이 크기 외에는 세 조건 중 적어도 하나를 만족하지 못합니다. 가능한 위치를 모두 더하면 {result}개입니다.'],
        '세 크기 조건을 함께 적용한 뒤 깃발이 포함되는 모든 위치를 빠짐없이 세기', 'three size predicates and placement product')


def number(pattern, a, b):
    return int(''.join(str(a if t == 'A' else b) for t in pattern))


def hits(pattern, coefficient):
    return [(a,b) for a in range(1,10) for b in range(1,10) if a != b and coefficient*(10*a+b) == number(pattern,a,b)]


def letters(pattern):
    return ''.join('ㄱ' if t == 'A' else 'ㄴ' for t in pattern)


intro = 'ㄱ과 ㄴ은 서로 다른0이 아닌 한 자리 숫자이며, 같은 문자는 같은 숫자를 나타냅니다. '
for pattern, m in [('AAAB',89), ('AABB',66), ('AABB',99), ('BABB',21), ('BABB',87)]:
    pairs = hits(pattern,m)
    assert len(pairs)==1
    a,b = pairs[0]
    ca,cb = number(pattern,1,0), number(pattern,0,1)
    lhs,rhs = 10*m-ca, cb-m
    g=math.gcd(abs(lhs),abs(rhs))
    add(8,'low',{'pattern':pattern,'coefficient':m},intro+'다음 곱셈식을 만족하는 두 자리 수 ㄱㄴ을 구하시오.',[10*a+b],
        [f'ㄱㄴ은10×ㄱ＋ㄴ이고, {letters(pattern)}은{ca}×ㄱ＋{cb}×ㄴ입니다.',
         f'곱셈식을 정리하면 {abs(lhs)}×ㄱ＝{abs(rhs)}×ㄴ이므로 ㄱ과 ㄴ의 비는{abs(rhs)//g}:{abs(lhs)//g}입니다.',
         f'두 숫자가 모두1~9인 경우는 ㄱ＝{a}, ㄴ＝{b}뿐입니다. 실제로 {m}×{10*a+b}＝{number(pattern,a,b)}이므로 답은{10*a+b}입니다.'],
        '반복 문자를 자릿값에 따라 나타내고 서로 다른 한 자리 숫자 조건 확인', 'place value coefficient ratio',
        promptDataLines=[f'{m} × ㄱㄴ ＝ {letters(pattern)}'])

for pattern,m in [('BAAB',341),('BAAB',451),('BAAB',209),('BABB',153),('BBAA',286)]:
    tail=m%100
    possible=[(k,*p)for k in range(1,10)for p in hits(pattern,100*k+tail)]
    assert len(possible)==1
    k,a,b=possible[0]
    ca,cb=number(pattern,1,0),number(pattern,0,1)
    add(8,'middle',{'pattern':pattern,'coefficientTail':tail},intro+'□에는1부터9까지의 숫자 중 하나가 들어갑니다. 다음 곱셈식을 만족하는 두 자리 수 ㄱㄴ을 구하시오.',[10*a+b],
        [f'곱하는 수의 백의 자리가 □이므로 가능한 수는 ' + ', '.join(str(100*d+tail)for d in range(1,10)) + '입니다.',
         f'각 곱하는 수를 M이라 하면 M×(10×ㄱ＋ㄴ)＝{ca}×ㄱ＋{cb}×ㄴ입니다. 따라서 (10×M−{ca})×ㄱ＝({cb}−M)×ㄴ이 됩니다.',
         f'가능한 M마다 이 관계를 만족하는 서로 다른1~9의 숫자를 확인하면 M＝{m}, ㄱ＝{a}, ㄴ＝{b}인 경우만 남습니다. 다른 M에서는 두 숫자가 모두1~9인 쌍이 없습니다.',
         f'{m}×{10*a+b}＝{number(pattern,a,b)}로 곱셈식과 빈 백의 자리를 모두 확인할 수 있으므로 답은{10*a+b}입니다.'],
        '곱하는 수의 빈 자리까지 후보로 두고 반복 문자 자릿값과 함께 확인', 'missing coefficient hundreds and place value relation',
        promptDataLines=[f'□{tail:02d} × ㄱㄴ ＝ {letters(pattern)}'])

for pattern,s in [('BAAB',3),('BAAB',12),('BABB',4),('BABB',5),('BABB',10)]:
    pairs=[(a,b)for a in range(1,10)for b in range(1,10)if a!=b and a+b==s]
    possible=[(number(pattern,a,b)//(10*a+b),a,b)for a,b in pairs
              if number(pattern,a,b)%(10*a+b)==0 and 100<=number(pattern,a,b)//(10*a+b)<=400]
    assert len(possible)==1
    m,a,b=possible[0]
    tests='、'.join(f'{10*c+d}: {number(pattern,c,d)}÷{10*c+d}'for c,d in pairs)
    add(8,'high',{'pattern':pattern,'digitSum':s,'coefficientMin':100,'coefficientMax':400},
        intro+f'ㄱ과 ㄴ의 합은{s}입니다. 어떤100 이상400 이하의 자연수를 ㄱㄴ에 곱하면 다음과 같습니다. 두 자리 수 ㄱㄴ을 구하시오.',[10*a+b],
        [f'서로 다른1~9의 두 숫자의 합이{s}인 두 자리 수 ㄱㄴ의 후보는 ' + ', '.join(str(10*c+d)for c,d in pairs) + '입니다.',
         f'곱하는 수는 {letters(pattern)}을 ㄱㄴ으로 나눈 값이어야 합니다. 후보별로 나눗셈을 확인하면 {tests}입니다.',
         f'이 중 나누어떨어지고 몫이100 이상400 이하인 것은 {number(pattern,a,b)}÷{10*a+b}＝{m}인 경우뿐입니다.',
         f'따라서 ㄱ＝{a}, ㄴ＝{b}이며 답은{10*a+b}입니다. 숫자의 합과 {m}×{10*a+b}＝{number(pattern,a,b)}도 모두 맞습니다.'],
        '숫자 합으로 후보를 만들고 나누어떨어짐과 곱하는 수의 범위를 함께 적용', 'digit sum candidates and inverse multiplier bounds',
        promptDataLines=[f'어떤 자연수 × ㄱㄴ ＝ {letters(pattern)}'])


def pieces(length,a,b):
    return (length-1)//a+(length-1)//b-(length-1)//math.lcm(a,b)+1


for a,b,k in [(4,6,9),(5,8,6),(6,9,8),(7,10,5),(8,12,7)]:
    period=math.lcm(a,b); length=period*k; count=pieces(length,a,b)
    unit=period//a+period//b-1
    add(9,'middle',{'a':a,'b':b,'pieces':count},
        f'나무 막대의 같은 한쪽 끝에서부터 {a}cm 간격과 {b}cm 간격으로 각각 줄을 그었습니다. 막대의 길이는 두 간격의 공배수입니다. 막대 안쪽에 표시된 곳을 모두 잘랐더니 {count}도막이 되었습니다. 처음 막대의 길이는 몇 cm입니까?',
        [length],[f'두 간격의 최소공배수는{period}cm입니다. 길이가{period}cm의 □배라고 하겠습니다.',
                  f'내부의 줄은 각각{period//a}×□−1개와{period//b}×□−1개이고, 겹친 줄은□−1개입니다. 도막 수는 줄의 수보다1 많아 {unit}×□개입니다.',
                  f'{unit}×□＝{count}이므로 □＝{k}입니다. 처음 길이는{period}×{k}＝{length}cm입니다.'],
        '겹침이 되풀이되는 길이와 도막 수의 관계에서 막대 길이를 역산', 'inverse common-multiple length from cut count')

for a,b,target in [(4,6,103),(5,8,147),(6,9,169),(7,10,193),(8,12,227)]:
    lo,hi=target-15,target+15
    count=pieces(target,a,b)
    answers=[v for v in range(lo,hi+1)if pieces(v,a,b)==count]
    assert 1<len(answers)<=6
    rows=[f'{v}cm: {pieces(v,a,b)}도막'for v in range(answers[0]-1,answers[-1]+2)]
    add(9,'high',{'a':a,'b':b,'pieces':count,'minimumLength':lo,'maximumLength':hi},
        f'길이가 {lo}cm 이상 {hi}cm 이하인 나무 막대가 있고 그 길이는 정수cm입니다. 같은 한쪽 끝에서부터 {a}cm 간격과 {b}cm 간격으로 각각 줄을 그은 뒤 막대 안쪽에 표시된 곳을 모두 잘랐더니 {count}도막이 되었습니다. 가능한 처음 길이를 모두 구하시오.',
        answers,[f'길이가 Lcm일 때 내부의{a}cm 간격 줄은 L보다 작은{a}의 배수의 수이고, {b}cm 간격 줄도 같은 방식으로 셉니다. 겹친 줄은{math.lcm(a,b)}의 배수 위치입니다.',
                 f'내부 두 종류 줄의 수를 더하고 겹침을 한 번 뺀 뒤1을 더하면 도막 수가 됩니다. 길이를 늘릴 때 도막 수는 줄어들지 않습니다.',
                 '목표 도막 수의 경계에서 확인한 값은 ' + '、'.join(rows) + '입니다.',
                 f'따라서 {lo}~{hi}cm 범위에서 가능한 길이는 ' + ', '.join(map(str,answers)) + f'cm입니다. 바로 앞은{count}도막보다 적고 바로 뒤는 더 많으므로 다른 길이는 없습니다.'],
        '막대 끝은 내부 절단점에서 제외하고 같은 도막 수가 되는 모든 정수 길이 찾기', 'inverse floor count plateau with endpoint exclusion')

assert len(items)==135 and len({x['id']for x in items})==135
assert len({x['text']+'\n'+str(x.get('promptDataLines',''))for x in items})==135
for no in range(1,10):
    assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
for old in previous:
    assert next(x for x in items if x['id']==old['id'])==old
data.update(version=version, availableSourceNos=list(range(1,10)), pendingSourceNos=list(range(10,31)),
            preservedLegacyCount=35, newAuthoredCount=100)
data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added45: 40 new +5 preserved. Total135, nine complete 5/5/5 groups; prior90 unchanged.')
